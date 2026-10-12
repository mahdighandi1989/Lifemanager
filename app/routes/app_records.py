"""«رکوردهای برنامه» — storage + AI door for in-repo single-page apps.

    GET    /api/app-records/{app}               all of the caller's records of that app
    POST   /api/app-records/{app}/bulk          upsert a batch {records: [{id, type, ...}]}
    DELETE /api/app-records/{app}/{rec_id}      remove one record
    POST   /api/app-records/{app}/ai            {system, user} → text, through Lifemanager's AI layer
    GET    /api/app-records/{app}/mirror        Drive mirror status + folder/sheet links per record
    POST   /api/app-records/{app}/mirror        {items: [{rec_id, group, title, tabs}], deleted: [rec_id]} — queue for Drive
    POST   /api/app-records/{app}/mirror/sync   write the caller's pending mirrors to Drive now

First tenant: «معماری یادگیری عمیق و کارخانه معرفت‌شناسی» (`/apps/learning-architecture`).
Records are the app's own JSON documents; the server only scopes them by user,
caps their size and never interprets them. The AI door means the app never
holds a provider key in the browser: it rides the same task routing as every
other AI feature (task «learning_architecture», pinnable in AISettings).
"""
import json
import re
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.models.app_record import AppRecord

router = APIRouter()

_APP = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}$")
#: the apps allowed to keep records here (one line per in-repo app)
_APPS = {"learning-architecture"}
_MAX_REC_CHARS = 2_000_000
_MAX_BATCH = 500


def _check_app(app: str) -> str:
    if not _APP.match(app or "") or app not in _APPS:
        raise HTTPException(status_code=404, detail="این برنامه رکورد ندارد")
    return app


class BulkIn(BaseModel):
    records: List[Dict[str, Any]] = Field(default_factory=list)


class MirrorIn(BaseModel):
    items: List[Dict[str, Any]] = Field(default_factory=list, max_length=200)
    deleted: List[str] = Field(default_factory=list, max_length=200)


class AIIn(BaseModel):
    system: str = Field("", max_length=20_000)
    user: str = Field(..., min_length=1, max_length=60_000)
    max_tokens: int = Field(2500, ge=64, le=8192)


@router.get("/api/app-records/{app}", tags=["app-records"])
async def list_records(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    rows = (await db.execute(select(AppRecord).where(AppRecord.app == app, AppRecord.user_id == user_id))).scalars().all()
    out = []
    for r in rows:
        try:
            out.append(json.loads(r.data))
        except (ValueError, TypeError):
            continue
    return {"ok": True, "success": True, "records": out}


@router.post("/api/app-records/{app}/bulk", tags=["app-records"])
async def save_records(app: str, payload: BulkIn, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    recs = payload.records
    if len(recs) > _MAX_BATCH:
        raise HTTPException(status_code=413, detail="دستهٔ رکوردها بزرگ است")
    ids = []
    for rec in recs:
        rid = str(rec.get("id") or "").strip()
        if not rid or len(rid) > 128:
            raise HTTPException(status_code=422, detail="هر رکورد شناسهٔ معتبر لازم دارد")
        ids.append(rid)
    existing = {}
    if ids:
        rows = (await db.execute(select(AppRecord).where(AppRecord.app == app, AppRecord.user_id == user_id,
                                                         AppRecord.rec_id.in_(ids)))).scalars().all()
        existing = {r.rec_id: r for r in rows}
    for rec, rid in zip(recs, ids):
        text = json.dumps(rec, ensure_ascii=False)
        if len(text) > _MAX_REC_CHARS:
            raise HTTPException(status_code=413, detail=f"رکورد «{rid}» بزرگ‌تر از سقف است")
        row = existing.get(rid)
        if row is None:
            row = AppRecord(user_id=user_id, app=app, rec_id=rid)
            db.add(row)
            existing[rid] = row
        row.rtype = str(rec.get("type") or "")[:40]
        row.data = text
    await db.commit()
    return {"ok": True, "success": True, "saved": len(recs)}


@router.delete("/api/app-records/{app}/{rec_id}", tags=["app-records"])
async def delete_record(app: str, rec_id: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    row = (await db.execute(select(AppRecord).where(AppRecord.app == app, AppRecord.user_id == user_id,
                                                    AppRecord.rec_id == rec_id))).scalar_one_or_none()
    if row is not None:
        await db.delete(row)
        await db.commit()
    from app.services.app_mirror_service import mark_deleted

    await mark_deleted(db, user_id=user_id, app=app, rec_id=rec_id)  # Drive folder is renamed, never deleted
    return {"ok": True, "success": True, "deleted": row is not None}


@router.post("/api/app-records/{app}/ai", tags=["app-records"])
async def app_ai(app: str, payload: AIIn, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    from app.services.ai.inference_gateway import complete

    res = await complete(db, payload.user, task="learning_architecture", system=payload.system or None,
                         max_tokens=payload.max_tokens)
    if not res.get("ok"):
        err = res.get("error") or "no_model"
        msg = "مدلی برای «معماری یادگیری» تنظیم نشده؛ در تنظیمات AI مدلی برای این کار یا «عمومی» بگذار." if err == "no_model" else f"خطای سرویس هوش مصنوعی: {err}"
        return {"ok": False, "success": False, "error": msg, "text": ""}
    return {"ok": True, "success": True, "text": res.get("text") or "", "model": res.get("model")}


@router.get("/api/app-records/{app}/mirror", tags=["app-records"])
async def mirror_status(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import status

    return {"ok": True, "success": True, **(await status(db, user_id=user_id, app=app))}


@router.post("/api/app-records/{app}/mirror", tags=["app-records"])
async def mirror_queue(app: str, payload: MirrorIn, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import upsert

    try:
        res = await upsert(db, user_id=user_id, app=app, items=payload.items, deleted=payload.deleted)
    except ValueError as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    return {"ok": True, "success": True, **res}


@router.post("/api/app-records/{app}/mirror/sync", tags=["app-records"])
async def mirror_sync(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_required_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import sync_pending

    res = await sync_pending(db, user_id=user_id, app=app, limit=40)
    return {"ok": True, "success": True, **res}
