"""«رکوردهای برنامه» — storage + AI door for in-repo single-page apps.

    GET    /api/app-records/{app}               all of the caller's records of that app
    POST   /api/app-records/{app}/bulk          upsert a batch {records: [{id, type, ...}]}
    DELETE /api/app-records/{app}/{rec_id}      remove one record
    POST   /api/app-records/{app}/ai            {system, user} → text, through Lifemanager's AI layer
    GET    /api/app-records/{app}/mirror        Drive mirror status + folder/sheet links per record
    POST   /api/app-records/{app}/mirror        {items: [{rec_id, group, title, tabs}], deleted: [rec_id]} — queue for Drive
    POST   /api/app-records/{app}/mirror/sync   write the caller's pending mirrors to Drive now
    GET    /api/app-records/{app}/files?rec_id= attachments of a record (pointers; bytes are in Drive)
    POST   /api/app-records/{app}/files         upload (multipart rec_id, group, title, file) straight to the record's Drive folder
    DELETE /api/app-records/{app}/files/{id}    hide; the Drive file is only renamed
    GET    /api/app-records/{app}/usage         database/Drive footprint + AI use (30 days, estimated cost)

First tenant: «معماری یادگیری عمیق و کارخانه معرفت‌شناسی» (`/apps/learning-architecture`).
Records are the app's own JSON documents; the server only scopes them by user,
caps their size and never interprets them. The AI door means the app never
holds a provider key in the browser: it rides the same task routing as every
other AI feature (task «learning_architecture», pinnable in AISettings).
"""
import json
import re
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_signed_in_user_id
from app.models.app_record import AppRecord

router = APIRouter()

_APP = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}$")
#: the apps allowed to keep records here (one line per in-repo app)
_APPS = {"learning-architecture"}
_MAX_REC_CHARS = 2_000_000
_MAX_BATCH = 500
#: whole request body (the page sends ≤ 3 MB chunks); bigger is refused before parsing
_MAX_BODY = 8_000_000
#: records per user per app (the page's real use is in the hundreds)
_MAX_RECORDS = 20_000
#: record ids are the page's own A.uid() ("case_l9x…") or fixed names ("settings", "course");
#: no "/" (a DELETE path could never reach it), no spaces, no control characters
_REC_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$")


async def _body_cap(request: Request) -> None:
    try:
        n = int(request.headers.get("content-length") or 0)
    except ValueError:
        n = 0
    if n > _MAX_BODY:
        raise HTTPException(status_code=413, detail="درخواست بزرگ‌تر از سقف است")


def _check_app(app: str) -> str:
    if not _APP.match(app or "") or app not in _APPS:
        raise HTTPException(status_code=404, detail="این برنامه رکورد ندارد")
    return app


class BulkIn(BaseModel):
    records: List[Dict[str, Any]] = Field(default_factory=list)


class MirrorTab(BaseModel):
    name: str = Field("", max_length=200)
    rows: List[List[Any]] = Field(default_factory=list, max_length=5000)


class MirrorItem(BaseModel):
    rec_id: str = Field(..., min_length=1, max_length=128)
    group: str = Field("", max_length=200)
    title: str = Field("", max_length=1000)
    tabs: List[MirrorTab] = Field(default_factory=list, max_length=40)


class MirrorIn(BaseModel):
    items: List[MirrorItem] = Field(default_factory=list, max_length=200)
    deleted: List[str] = Field(default_factory=list, max_length=200)


class AIIn(BaseModel):
    system: str = Field("", max_length=20_000)
    user: str = Field(..., min_length=1, max_length=60_000)
    max_tokens: int = Field(2500, ge=64, le=8192)


@router.get("/api/app-records/{app}", tags=["app-records"])
async def list_records(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    _check_app(app)
    rows = (await db.execute(select(AppRecord).where(AppRecord.app == app, AppRecord.user_id == user_id))).scalars().all()
    out = []
    for r in rows:
        try:
            out.append(json.loads(r.data))
        except (ValueError, TypeError):
            continue
    return {"ok": True, "success": True, "records": out}


@router.post("/api/app-records/{app}/bulk", tags=["app-records"], dependencies=[Depends(_body_cap)])
async def save_records(app: str, payload: BulkIn, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    """Per-record outcome: one bad record (no/invalid id, over the size cap) is
    REJECTED with a reason and the rest are saved — it used to fail the whole
    batch, and the page then retried that batch forever."""
    _check_app(app)
    recs = payload.records
    if len(recs) > _MAX_BATCH:
        raise HTTPException(status_code=413, detail="دستهٔ رکوردها بزرگ است")
    if recs and not any(isinstance(r, dict) and _REC_ID.match(str(r.get("id") or "")) for r in recs):
        raise HTTPException(status_code=422, detail="هر رکورد شناسهٔ معتبر لازم دارد")
    good: Dict[str, tuple] = {}
    rejected = []
    for rec in recs:
        rid = str(rec.get("id") or "") if isinstance(rec, dict) else ""
        if not _REC_ID.match(rid):
            rejected.append({"id": rid[:128], "reason": "شناسهٔ نامعتبر"})
            continue
        text = json.dumps(rec, ensure_ascii=False)
        if len(text) > _MAX_REC_CHARS:
            rejected.append({"id": rid, "reason": "بزرگ‌تر از سقفِ یک رکورد (۲ میلیون نویسه)"})
            continue
        good[rid] = (rec, text)  # the last copy of a duplicated id wins
    for attempt in (1, 2):
        try:
            existing = {}
            if good:
                rows = (await db.execute(select(AppRecord).where(AppRecord.app == app, AppRecord.user_id == user_id,
                                                                 AppRecord.rec_id.in_(list(good))))).scalars().all()
                existing = {r.rec_id: r for r in rows}
            new_ids = [rid for rid in good if rid not in existing]
            if new_ids:
                count = (await db.execute(select(func.count()).select_from(AppRecord).where(
                    AppRecord.app == app, AppRecord.user_id == user_id))).scalar() or 0
                room = max(0, _MAX_RECORDS - count)
                for rid in new_ids[room:]:
                    rejected.append({"id": rid, "reason": "سقفِ تعدادِ رکوردها پر است"})
                    good.pop(rid)
            for rid, (rec, text) in good.items():
                row = existing.get(rid)
                if row is None:
                    row = AppRecord(user_id=user_id, app=app, rec_id=rid)
                    db.add(row)
                row.rtype = str(rec.get("type") or "")[:40]
                row.data = text
            await db.commit()
            break
        except IntegrityError:
            # a concurrent request inserted one of these ids first ⇒ re-read and update instead
            await db.rollback()
            if attempt == 2:
                raise HTTPException(status_code=409, detail="ذخیرهٔ هم‌زمان؛ دوباره تلاش کن")
    return {"ok": True, "success": True, "saved": len(good), "rejected": rejected}


@router.delete("/api/app-records/{app}/{rec_id}", tags=["app-records"])
async def delete_record(app: str, rec_id: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
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
async def app_ai(app: str, payload: AIIn, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
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
async def mirror_status(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import status

    return {"ok": True, "success": True, **(await status(db, user_id=user_id, app=app))}


@router.post("/api/app-records/{app}/mirror", tags=["app-records"], dependencies=[Depends(_body_cap)])
async def mirror_queue(app: str, payload: MirrorIn, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import upsert

    try:
        items = [i.model_dump() for i in payload.items]
        try:
            res = await upsert(db, user_id=user_id, app=app, items=items, deleted=payload.deleted)
        except IntegrityError:  # a concurrent queue of the same record — re-read and update
            await db.rollback()
            res = await upsert(db, user_id=user_id, app=app, items=items, deleted=payload.deleted)
    except ValueError as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    return {"ok": True, "success": True, **res}


@router.post("/api/app-records/{app}/mirror/sync", tags=["app-records"])
async def mirror_sync(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import sync_pending

    res = await sync_pending(db, user_id=user_id, app=app, limit=40)
    return {"ok": True, "success": True, **res}


# ---------------------------------------------------------------- پیوست‌ها (bytes ONLY in Drive) + مصرف

from fastapi import File, Form, UploadFile  # noqa: E402


@router.get("/api/app-records/{app}/files", tags=["app-records"])
async def files_list(app: str, rec_id: str = "", db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import list_attachments

    return {"ok": True, "success": True, "files": await list_attachments(db, user_id=user_id, app=app, rec_id=rec_id or None)}


@router.post("/api/app-records/{app}/files", tags=["app-records"])
async def files_upload(app: str, rec_id: str = Form(...), group: str = Form(""), title: str = Form(""),
                       file: UploadFile = File(...), db: AsyncSession = Depends(get_db),
                       user_id: int = Depends(get_signed_in_user_id)):
    """The file goes straight into the record's Drive folder (…/<title · id>/پیوست‌ها/);
    the database keeps only a pointer. Drive not connected ⇒ 503 (never stored on the server)."""
    _check_app(app)
    if not _REC_ID.match(rec_id or ""):
        raise HTTPException(status_code=422, detail="شناسهٔ رکورد نامعتبر است")
    from app.services.app_mirror_service import MAX_FILE_BYTES, DriveUnavailable, upload_attachment

    data = await file.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="فایل بزرگ‌تر از ۲۵ مگابایت است")
    if not data:
        raise HTTPException(status_code=422, detail="فایل خالی است")
    try:
        f = await upload_attachment(db, user_id=user_id, app=app, rec_id=rec_id, group=group[:60], title=title[:200],
                                    filename=file.filename or "file", mime=file.content_type or "", data=data)
    except DriveUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    return {"ok": True, "success": True, "file": f}


@router.delete("/api/app-records/{app}/files/{file_id}", tags=["app-records"])
async def files_delete(app: str, file_id: int, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    _check_app(app)
    from app.services.app_mirror_service import delete_attachment

    return {"ok": True, "success": True, "deleted": await delete_attachment(db, user_id=user_id, app=app, file_id=file_id)}


@router.get("/api/app-records/{app}/usage", tags=["app-records"])
async def app_usage(app: str, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_signed_in_user_id)):
    """Storage this page uses in the server database and in Drive, plus its AI use over 30 days
    (calls, characters ≈ tokens×4, and an ESTIMATED cost only where the model has a price)."""
    _check_app(app)
    from datetime import datetime, timedelta, timezone

    from app.models.ai_catalog import AICatalogModel
    from app.models.ai_usage import AIUsageLog
    from app.services.app_mirror_service import usage

    store = await usage(db, user_id=user_id, app=app)
    since = datetime.now(timezone.utc) - timedelta(days=30)
    rows = (await db.execute(select(AIUsageLog.model, func.count(AIUsageLog.id), func.coalesce(func.sum(AIUsageLog.prompt_chars), 0),
                                    func.coalesce(func.sum(AIUsageLog.output_chars), 0))
                             .where(AIUsageLog.task == "learning_architecture", AIUsageLog.created_at >= since)
                             .group_by(AIUsageLog.model))).all()
    prices = {m.display_name: m for m in (await db.execute(select(AICatalogModel))).scalars().all()}
    models, total, priced_all = [], 0.0, True
    for model, n, pc, oc in rows:
        m = prices.get(model)
        tin, tout = int(pc or 0) / 4.0, int(oc or 0) / 4.0
        cost = None
        if m is not None and m.input_cost_per_1m is not None and m.output_cost_per_1m is not None:
            cost = round(tin / 1e6 * m.input_cost_per_1m + tout / 1e6 * m.output_cost_per_1m, 4)
            total += cost
        else:
            priced_all = False
        models.append({"model": model or "", "calls": int(n), "prompt_chars": int(pc or 0), "output_chars": int(oc or 0),
                       "est_tokens": int(tin + tout), "est_cost_usd": cost})
    return {"ok": True, "success": True, "storage": store,
            "ai_30d": {"models": models, "est_cost_usd": round(total, 4) if models else 0.0, "all_priced": priced_all}}
