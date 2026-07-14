"""/api/brain — رشد ذهن و هوش (cognitive-growth dashboard).

  GET  /api/brain/dashboard   multi-source referenced dashboard + reminder cfg
  POST /api/brain/upload      upload a Brilliant export zip (multipart)
  GET  /api/brain/uploads     upload history
  GET  /api/brain/reminder    reminder config
  PUT  /api/brain/reminder    edit reminder (enabled/weekday/hour/silent/refollow_hours)
"""
from typing import Any, Dict, Optional

from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware import handle_errors
from app.models.brain import BrainUpload
from app.services import brain_service

router = APIRouter()


class ReminderUpdate(BaseModel):
    enabled: Optional[bool] = None
    weekday: Optional[int] = None        # 0=Monday … 6=Sunday
    hour: Optional[int] = None           # 0-23 (UTC)
    silent: Optional[bool] = None
    refollow_hours: Optional[float] = None


@router.get("/api/brain/dashboard", tags=["brain"])
@handle_errors
async def brain_dashboard(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await brain_service.build_dashboard(db)


@router.post("/api/brain/upload", tags=["brain"])
@handle_errors
async def brain_upload(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    data = await file.read()
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="فایل بزرگ‌تر از ۵۰MB است")
    try:
        result = await brain_service.ingest_upload(
            db, data, filename=file.filename or "data.zip", via="dashboard"
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"ok": True, **result}


@router.get("/api/brain/uploads", tags=["brain"])
@handle_errors
async def brain_uploads(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    rows = (await db.execute(
        select(BrainUpload).order_by(BrainUpload.uploaded_at.desc())
    )).scalars().all()
    return {"ok": True, "uploads": [
        {"id": r.id, "filename": r.filename, "via": r.via, "source": r.source,
         "verified_owner": r.verified_owner, "owner_email": r.owner_email,
         "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None}
        for r in rows
    ]}


@router.get("/api/brain/reminder", tags=["brain"])
@handle_errors
async def get_reminder(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return {"ok": True, "reminder": await brain_service.get_reminder_config(db)}


@router.put("/api/brain/reminder", tags=["brain"])
@handle_errors
async def put_reminder(
    payload: ReminderUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    partial = payload.model_dump(exclude_unset=True)
    if "weekday" in partial and not (0 <= int(partial["weekday"]) <= 6):
        raise HTTPException(status_code=400, detail="weekday باید 0 تا 6 باشد")
    if "hour" in partial and not (0 <= int(partial["hour"]) <= 23):
        raise HTTPException(status_code=400, detail="hour باید 0 تا 23 باشد")
    if "refollow_hours" in partial and float(partial["refollow_hours"]) <= 0:
        raise HTTPException(status_code=400, detail="refollow_hours باید مثبت باشد")
    cfg = await brain_service.update_reminder_config(db, partial)
    return {"ok": True, "reminder": cfg}
