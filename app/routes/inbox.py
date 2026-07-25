"""/api/inbox — «صندوق ورودی همه‌چیز» (universal capture inbox).

Anything the owner throws at the system lands here first; the AI triage
layer suggests a destination and one confirmation files it into the real
entity. Endpoints:

* ``POST /api/inbox``                    — capture raw text (web/telegram) + best-effort triage
* ``GET  /api/inbox``                    — list (filter by status), newest first, paginated
* ``POST /api/inbox/{id}/file``          — file into the suggested (or overridden) target
* ``POST /api/inbox/{id}/dismiss``       — review + intentionally drop (kept, not deleted)
* ``POST /api/inbox/{id}/reclassify``    — re-run triage on demand

Scoping matches the tasks/writings/activity-log routers: the anon bucket
(user 0) also sees legacy NULL-owner rows; a real JWT sees its own rows.
"""
import html
from typing import Any, Dict, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors
from app.models.inbox_item import InboxItem
from app.services import inbox_service
from app.services.activity_log_service import record_activity

router = APIRouter()

_TARGET_FA = {
    "task": "تسک",
    "todo_item": "آیتم لیست",
    "writing": "یادداشت",
    "person": "شخص",
    "subscription": "اشتراک",
}


class InboxCaptureRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=8000)
    source: str = Field(default="web", max_length=32)


class InboxFileRequest(BaseModel):
    # All optional: bare POST files into the AI-suggested target as-is.
    target_type: Optional[str] = Field(default=None, max_length=32)
    title: Optional[str] = Field(default=None, max_length=120)
    list_name: Optional[str] = Field(default=None, max_length=255)
    category: Optional[str] = Field(default=None, max_length=120)
    person_name: Optional[str] = Field(default=None, max_length=255)
    due_date: Optional[str] = Field(default=None, max_length=10)
    priority: Optional[str] = Field(default=None, max_length=16)


def _serialize(item: InboxItem) -> dict:
    return {
        "id": item.id,
        "user_id": item.user_id,
        "content": item.content,
        "source": item.source,
        "status": item.status,
        "suggested_type": item.suggested_type,
        "suggestion": item.suggestion,
        "ai_model": item.ai_model,
        "filed_entity_type": item.filed_entity_type,
        "filed_entity_id": item.filed_entity_id,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


async def _get_scoped_item(db: AsyncSession, item_id: int, user_id: int) -> InboxItem:
    item = await db.get(InboxItem, item_id)
    visible = item is not None and (
        item.user_id == user_id or (user_id == 0 and item.user_id is None)
    )
    if not visible:
        raise HTTPException(status_code=404, detail="Inbox item not found")
    return item


@router.post("/api/inbox", status_code=status.HTTP_201_CREATED, tags=["inbox"])
@handle_errors
async def capture_inbox_item(
    payload: InboxCaptureRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Capture raw text, then classify best-effort (a triage failure must
    never lose the capture — the row stays pending/unknown instead)."""
    item = InboxItem(
        user_id=user_id,
        content=html.escape(payload.content.strip(), quote=True),
        source=payload.source or "web",
        status="pending",
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    try:
        item = await inbox_service.apply_classification(db, item, user_id=user_id)
    except Exception:  # noqa: BLE001 — capture survives any triage crash
        pass
    await record_activity(
        action="create", entity_type="inbox_item", entity_id=item.id,
        entity_label=item.content[:120], detail="ثبت در صندوق ورودی",
        user_id=user_id, request=request, db=db,
    )
    return {"ok": True, "success": True, "item": _serialize(item)}


@router.get("/api/inbox", tags=["inbox"])
@handle_errors
async def list_inbox_items(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    stmt = select(InboxItem).where(inbox_service.scope_filter(InboxItem.user_id, user_id))
    if status_filter:
        stmt = stmt.where(InboxItem.status == status_filter)
    total = (
        await db.execute(select(func.count()).select_from(stmt.subquery()))
    ).scalar() or 0
    # Locked files FIRST (see inbox_service.locked_first_order).
    rows = (
        await db.execute(
            stmt.order_by(inbox_service.locked_first_order(), InboxItem.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()
    pending = await inbox_service.pending_count(db, user_id)
    return {
        "ok": True,
        "success": True,
        "items": [_serialize(r) for r in rows],
        "total": int(total),
        "pending_count": pending,
        "page": page,
        "page_size": page_size,
    }


@router.post("/api/inbox/{item_id}/file", tags=["inbox"])
@handle_errors
async def file_inbox_item(
    item_id: int,
    request: Request,
    payload: Optional[InboxFileRequest] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    item = await _get_scoped_item(db, item_id, user_id)
    if item.status == "filed":
        raise HTTPException(status_code=409, detail="Item already filed")
    body = payload or InboxFileRequest()
    overrides: Dict[str, Any] = {
        k: v
        for k, v in {
            "title": body.title,
            "list_name": body.list_name,
            "category": body.category,
            "person_name": body.person_name,
            "due_date": body.due_date,
            "priority": body.priority,
        }.items()
        if v is not None
    }
    try:
        created = await inbox_service.file_item(
            db, item, target_type=body.target_type, overrides=overrides, user_id=user_id
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    target_fa = _TARGET_FA.get(created["kind"], created["kind"])
    await record_activity(
        action="file", entity_type="inbox_item", entity_id=item.id,
        entity_label=created.get("title"),
        context_type=created["kind"], context_id=created["id"],
        detail=f"بایگانی از صندوق ورودی به {target_fa}",
        user_id=user_id, request=request, db=db,
    )
    return {"ok": True, "success": True, "item": _serialize(item), "created": created}


@router.post("/api/inbox/{item_id}/dismiss", tags=["inbox"])
@handle_errors
async def dismiss_inbox_item(
    item_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    item = await _get_scoped_item(db, item_id, user_id)
    if item.status == "filed":
        raise HTTPException(status_code=409, detail="Item already filed")
    item.status = "dismissed"
    await db.commit()
    await db.refresh(item)
    await record_activity(
        action="dismiss", entity_type="inbox_item", entity_id=item.id,
        entity_label=item.content[:120], detail="رد از صندوق ورودی",
        user_id=user_id, request=request, db=db,
    )
    return {"ok": True, "success": True, "item": _serialize(item)}


@router.post("/api/inbox/{item_id}/reclassify", tags=["inbox"])
@handle_errors
async def reclassify_inbox_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    item = await _get_scoped_item(db, item_id, user_id)
    if item.status == "filed":
        raise HTTPException(status_code=409, detail="Item already filed")
    item = await inbox_service.apply_classification(db, item, user_id=user_id)
    return {"ok": True, "success": True, "item": _serialize(item)}


# --- auto-ingest toggle (opt-in Gmail → subscription candidates) ------------

class AutoIngestPatch(BaseModel):
    enabled: bool


@router.get("/api/inbox/auto-ingest", tags=["inbox"])
@handle_errors
async def get_auto_ingest(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Master switch for auto-ingest — subscriptions + people (from Gmail) AND
    Drive files. Reported as one flag: on only when ALL are on."""
    from app.services.google_sync.person_ingest import is_enabled as people_on
    from app.services.google_sync.subscription_ingest import is_enabled as subs_on
    from app.services.ingest.drive_ingest import is_enabled as drive_on

    enabled = await subs_on(db) and await people_on(db) and await drive_on(db)
    return {"ok": True, "success": True, "enabled": enabled}


@router.put("/api/inbox/auto-ingest", tags=["inbox"])
@handle_errors
async def put_auto_ingest(
    patch: AutoIngestPatch,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.services.google_sync.person_ingest import set_enabled as set_people
    from app.services.google_sync.subscription_ingest import set_enabled as set_subs
    from app.services.ingest.drive_ingest import set_enabled as set_drive

    await set_subs(db, patch.enabled)
    await set_people(db, patch.enabled)
    await set_drive(db, patch.enabled)
    return {"ok": True, "success": True, "enabled": patch.enabled}


@router.post("/api/inbox/backfill", tags=["inbox"])
@handle_errors
async def backfill_ingest(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """One-time catch-up: run subscription + people + ATTACHMENT detection over
    the emails ALREADY synced AND scan Google Drive — the whole backlog that
    arrived before these detectors existed. Idempotent — safe to run repeatedly."""
    from app.services.google_sync.person_ingest import backfill_all
    from app.services.ingest import drive_ingest
    from app.services.ingest.email_ingest import backfill_attachments, upgrade_pending_locked

    res = await backfill_all(db, user_id=user_id)
    att = await backfill_attachments(db, user_id=user_id)
    res["attachment_candidates"] = att.get("proposed", 0)
    res["locked_files"] = att.get("needs_password", 0)
    # Upgrade any OLD blind «رمز بده» requests to the smart card+DOB flow.
    upg = await upgrade_pending_locked(db, user_id=user_id)
    res["locked_upgraded"] = upg.get("upgraded", 0)
    drive = await drive_ingest.scan_drive(db, user_id=user_id, limit=100)
    res["drive_candidates"] = drive.get("proposed", 0)
    res["drive_scanned"] = drive.get("scanned", 0)
    return {"ok": True, "success": True, **res}


@router.post("/api/inbox/retry-unreadable", tags=["inbox"])
@handle_errors
async def retry_unreadable_notes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """Re-read every «این فایل خودکار خوانده نشد» note with the NEW deterministic
    extractor (PDF/XLSX/CSV/DOCX text — no AI needed). Those notes were dead ends
    created when extraction was AI-only; the source_ref dedup then blocked them
    forever. Idempotent and bounded."""
    from app.services.ingest.email_ingest import retry_unreadable

    res = await retry_unreadable(db, user_id=user_id)
    return {"ok": True, "success": True, **res}


class PasswordSubmit(BaseModel):
    source_ref: str = Field(..., max_length=300)
    source_key: str = Field(..., max_length=200)
    password: str = Field(..., min_length=1, max_length=256)


@router.post("/api/inbox/password", tags=["inbox"])
@handle_errors
async def submit_password(
    payload: PasswordSubmit = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """Store the password for a locked-file source (encrypted) and immediately
    re-open EVERY pending file from that same source — one password unlocks the
    whole bank. Future files from the source open automatically."""
    from app.services.ingest import credentials
    from app.services.ingest.email_ingest import retry_domain, try_open

    # VERIFY the password actually opens the file BEFORE storing it — a wrong/
    # typo password used to be saved domain-wide (poisoning every sibling) and
    # the request force-filed so the file went silent and was never re-asked.
    res = await try_open(db, source_ref=payload.source_ref, password=payload.password, user_id=user_id)
    if not res.get("unlocked"):
        await db.commit()
        # Distinguish a genuinely-wrong password (prepare_bytes rejected it)
        # from a file we simply couldn't fetch right now (Gmail token refresh /
        # 429 → attachments come back empty). Telling the owner «رمز غلط» and
        # discarding a CORRECT password on a transient hiccup was a real bug.
        if res.get("status") == "needs_password":
            return {"ok": False, "success": False, "unlocked": False,
                    "message": "رمز درست نبود — دوباره امتحان کن.", "result": res}
        return {"ok": False, "success": False, "unlocked": False, "retry": True,
                "message": "الان نتوانستم فایل را باز کنم (اتصالِ گوگل) — چند لحظه بعد دوباره امتحان کن.",
                "result": res}
    # correct password → store it, resolve the request, open the whole bank.
    await credentials.store_password(db, source_key=payload.source_key, password=payload.password)
    await db.commit()
    batch = await retry_domain(db, source_key=payload.source_key, user_id=user_id)
    return {"ok": True, "success": True, "unlocked": True, "result": res,
            "batch_opened": batch.get("opened", 0)}


class ComponentsSubmit(BaseModel):
    source_ref: str = Field(..., max_length=300)
    source_key: str = Field(..., max_length=200)
    values: Dict[str, str] = Field(default_factory=dict)


@router.post("/api/inbox/password-components", tags=["inbox"])
@handle_errors
async def submit_password_components(
    payload: ComponentsSubmit = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """«رمزِ هوشمند»: store the identity components the owner supplied (encrypted,
    reusable), derive the file password from the email's recipe, open the file,
    and remember it forever — future files from that sender open automatically."""
    from app.services.ingest import credentials, identity_facts, password_recipe
    from app.services.ingest.email_ingest import retry_domain, try_open

    for key, value in (payload.values or {}).items():
        if value:
            await identity_facts.set_fact(db, fact_key=key, value=value, user_id=user_id)

    recipe = await password_recipe.get_stored_recipe(db, domain=payload.source_key)
    result: Dict[str, Any] = {"derived": False, "unlocked": False}
    batch_opened = 0
    if recipe and recipe.get("template"):
        keys = [c["key"] for c in (recipe.get("components") or [])]
        values = await identity_facts.get_many(db, keys=keys, user_id=user_id)
        if keys and all(values.get(k) for k in keys):
            pw = password_recipe.derive_password(recipe["template"], values)
            # VERIFY the derived password before storing it (a misread recipe or
            # a wrong fact shouldn't poison the domain nor force-file the request).
            opened = await try_open(db, source_ref=payload.source_ref, password=pw, user_id=user_id)
            result = {"derived": True, "unlocked": bool(opened.get("unlocked")), **opened}
            if opened.get("unlocked"):
                await credentials.store_password(db, source_key=payload.source_key, password=pw)
    await db.commit()
    if result.get("unlocked"):
        batch = await retry_domain(db, source_key=payload.source_key, user_id=user_id)
        batch_opened = batch.get("opened", 0)
        return {"ok": True, "success": True, "result": result, "batch_opened": batch_opened}
    # couldn't-fetch (transient Gmail) vs genuinely-wrong components — don't
    # cry «اجزا غلط» when we simply couldn't reach the file.
    if result.get("status") not in (None, "needs_password"):
        return {"ok": False, "success": False, "retry": True, "result": result, "batch_opened": 0,
                "message": "الان نتوانستم فایل را باز کنم — چند لحظه بعد دوباره امتحان کن."}
    return {
        "ok": False, "success": False, "result": result, "batch_opened": 0,
        "message": "با این اجزا رمز باز نشد — اجزا را بررسی کن یا رمز را مستقیم وارد کن.",
    }
