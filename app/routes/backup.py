"""/api/backup — پشتیبان‌گیری خودکار (nightly full-DB export to Drive).

Thin shells over ``app/services/backup_service``:

* ``GET  /api/backup/status`` — last attempt/success stamps + is_stale + drive_configured
* ``POST /api/backup/run``    — run a backup NOW (Drive first, local fallback)
* ``GET  /api/backup/export`` — download the raw uncompressed JSON export

Auth mirrors the neighbouring routers (``get_optional_user_id``): the backup
is global for the single-tenant deployment — it exports every table verbatim,
exactly like the DB itself.
"""
import io
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services import backup_service as svc

router = APIRouter()


@router.get("/api/backup/status", tags=["backup"])
@handle_errors
async def backup_status(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    status = await svc.get_status(db)
    return {"ok": True, "success": True, "status": status}


@router.post("/api/backup/run", tags=["backup"])
@handle_errors
async def backup_run(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    # run_backup never raises — its dict already carries ok/success/detail_fa.
    return await svc.run_backup(db)


@router.get("/api/backup/export", tags=["backup"])
@handle_errors
async def backup_export(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Stream a freshly-built, uncompressed JSON export as a download —
    the manual «نسخهٔ پشتیبان را همین حالا بگیر و نگه دار» escape hatch."""
    export = await svc.export_all_tables(db)
    payload = json.dumps(export, ensure_ascii=False).encode("utf-8")
    file_name = f"lifemanager-backup-{datetime.now(timezone.utc):%Y%m%d-%H%M%S}.json"
    return StreamingResponse(
        io.BytesIO(payload),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
    )
