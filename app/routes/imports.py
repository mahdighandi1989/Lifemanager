"""Import endpoints — spreadsheet bulk import + AI document extraction.

Ported from ALLIN1's import surface, adapted to Lifemanager's user-scoped
targets (tasks / people / incomes / assets). The legacy JSON list-sync
(``/api/lists/sync-from-file``) and finance message-ingest remain available
(CLAUDE.md rule 2); this is the new unified entry point.

  GET  /api/imports/targets                list importable entities + columns
  GET  /api/imports/{target}/template      download a CSV header template
  POST /api/imports/{target}?dry_run=      bulk import a CSV/XLSX/JSON file
  GET  /api/imports/ai-models              document/vision-capable models
  POST /api/imports/analyze                AI-extract a document (async job)
  GET  /api/imports/jobs                   recent import jobs (history)
  GET  /api/imports/jobs/{job_id}          poll one job
"""
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.import_job import ImportJob
from app.services.import_service import (
    IMPORT_TARGETS,
    ImportParseError,
    bulk_import,
    create_import_job,
    list_targets,
    spawn_analyze_job,
    template_csv,
    _new_job_id,
)

logger = logging.getLogger("app.imports")
router = APIRouter(prefix="/api/imports", tags=["imports"])

# Generous caps; the AI path streams to the model.
_MAX_BYTES = 64 * 1024 * 1024


@router.get("/targets")
@handle_errors
async def get_targets(user_id: int = Depends(get_optional_user_id)) -> List[dict]:
    return list_targets()


@router.get("/ai-models")
@handle_errors
async def get_ai_models(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    """Document/vision-capable models from the AI catalog, for the picker."""
    from app.services.ai.manager import ai_manager

    docs = await ai_manager.capable_models(db, "documents")
    vis = await ai_manager.capable_models(db, "vision")
    by_id = {m.id: m for m in docs + vis}
    models = [
        {
            "id": m.id,
            "display_name": m.display_name,
            "provider_key": m.provider_key,
            "supports_pdf": "documents" in (m.capabilities or []),
        }
        for m in by_id.values()
    ]
    return {"models": models, "any_available": bool(models)}


@router.get("/jobs")
@handle_errors
async def list_jobs(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    rows = (
        await db.execute(
            select(ImportJob)
            .where((ImportJob.user_id == user_id) | (ImportJob.user_id.is_(None)))
            .order_by(ImportJob.created_at.desc())
            .limit(50)
        )
    ).scalars().all()
    return [j.to_dict() for j in rows]


@router.get("/jobs/{job_id}")
@handle_errors
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    job = await db.get(ImportJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return job.to_dict()


@router.post("/analyze")
@handle_errors
async def analyze_document(
    file: UploadFile = File(...),
    target: str = Form(...),
    model_id: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    if target not in IMPORT_TARGETS:
        raise HTTPException(status_code=400, detail="مقصد ناشناخته")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="فایل خالی است")
    if len(content) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="حجم فایل زیاد است")
    job_id = _new_job_id()
    await create_import_job(db, job_id=job_id, target=target, filename=file.filename or "document", user_id=user_id)
    spawn_analyze_job(
        job_id=job_id, target=target, content=content, filename=file.filename or "document",
        mimetype=file.content_type or "application/octet-stream", user_id=user_id, model_id=model_id,
    )
    return {"job_id": job_id, "status": "running", "filename": file.filename, "target": target}


@router.get("/{target}/template")
@handle_errors
async def download_template(
    target: str,
    user_id: int = Depends(get_optional_user_id),
) -> Response:
    if target not in IMPORT_TARGETS:
        raise HTTPException(status_code=404, detail="مقصد ناشناخته")
    csv_text = template_csv(target)
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{target}_template.csv"'},
    )


@router.post("/{target}")
@handle_errors
async def import_file(
    target: str,
    file: UploadFile = File(...),
    dry_run: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    if target not in IMPORT_TARGETS:
        raise HTTPException(status_code=404, detail="مقصد ناشناخته")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="فایل خالی است")
    if len(content) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="حجم فایل زیاد است")
    try:
        return await bulk_import(
            db, target, content, file.filename or "upload.csv", user_id=user_id, dry_run=dry_run
        )
    except ImportParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
