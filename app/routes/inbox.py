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

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
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
    rows = (
        await db.execute(
            stmt.order_by(InboxItem.id.desc())
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
