"""/api/todo-items CRUD endpoints + share/unshare/move/toggle actions.

The endpoint hyphenation (`todo-items` over `todoitems` or
`todo_items`) follows the existing app convention of kebab-cased URL
segments (cf. `/api/users/profile`). The router decorators use the
absolute `/api/...` path so the SPA catch-all in `app/main.py` doesn't
shadow it.

All write paths route through `app.services.todo_item_service` —
the routes themselves are thin shells over @handle_errors.
"""
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id, get_required_user_id
from app.middleware import handle_errors
from app.models.todo_list import TodoList
from app.schemas.todo_item_schema import (
    TodoItemCreate,
    TodoItemMove,
    TodoItemOut,
    TodoItemShare,
    TodoItemUnshare,
    TodoItemUpdate,
)
from app.routes._serializers import serialize_item as _serialize
from app.services import todo_item_service
from app.services.activity_log_service import record_activity


async def _item_context(db: AsyncSession, item_id: int) -> tuple[str | None, int | None]:
    """First owning list of an item, as (context_type, context_id) for the
    activity log — items inherit their section from their list."""
    list_ids = await todo_item_service.get_item_list_ids(db, item_id)
    return ("list", list_ids[0]) if list_ids else (None, None)

logger = logging.getLogger(__name__)

router = APIRouter()


async def _assert_item_in_scope(
    db: AsyncSession, item_id: int, user_id: int
) -> None:
    """Authorize a mutation on an existing todo item (audit task f17880d0).

    Todo items carry no ``user_id`` of their own — they inherit ownership
    from the lists they belong to (the same model the read path uses, see
    ``todo_item_service.list_items``'s list-owner join). A mutation is
    allowed when the item is reachable in the caller's scope, i.e. it
    belongs to at least one list that is the caller's *or* legacy-unowned
    (``user_id IS NULL``), or it is an orphan item with no list membership
    at all (treated as unowned/legacy). An item that lives exclusively in
    another tenant's lists is hidden with a 404.

    This closes the coherence gap the audit flagged: the create path and
    the list read path resolved identity, but the item update / delete /
    toggle / share / unshare / move paths ignored it entirely, letting any
    caller mutate any item across tenants.
    """
    list_ids = await todo_item_service.get_item_list_ids(db, item_id)
    if not list_ids:
        # Orphan item (no list membership) — legacy/unowned, reachable.
        return
    stmt = select(TodoList.id).where(
        TodoList.id.in_(list_ids),
        (TodoList.user_id == user_id) | (TodoList.user_id.is_(None)),
    )
    reachable = (await db.execute(stmt)).first()
    if reachable is None:
        raise HTTPException(status_code=404, detail=f"TodoItem {item_id} not found")


# --- LIST -------------------------------------------------------------------

@router.get("/api/todo-items", tags=["todo-items"], response_model=List[TodoItemOut])
@router.get("/api/todo-items/", tags=["todo-items"], response_model=List[TodoItemOut])
@handle_errors
async def list_todo_items(
    list_id: int | None = Query(default=None),
    starred_only: bool = Query(default=False),
    completed: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """List todo items in the caller's scope.

    Like ``list_lists`` (audit task 78c0e8e0), this endpoint pulls the
    caller's user id through ``get_optional_user_id`` — which validates
    a bearer JWT when present and falls back to ``DEFAULT_ANON_USER_ID``
    when not, so the existing frontend login-bypass mode keeps working
    while the route gains a real auth gate the moment a token shows up.
    """
    items = await todo_item_service.list_items(
        db, list_id=list_id, starred_only=starred_only, completed=completed,
        user_id=user_id,
    )
    return [_serialize(it) for it in items]


# --- GET ONE ----------------------------------------------------------------

@router.get("/api/todo-items/{item_id}", tags=["todo-items"], response_model=TodoItemOut)
@handle_errors
async def get_todo_item(item_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    item = await todo_item_service.get_item(db, item_id)
    return _serialize(item)


# --- CREATE -----------------------------------------------------------------

@router.post(
    "/api/todo-items",
    status_code=status.HTTP_201_CREATED,
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@router.post(
    "/api/todo-items/",
    status_code=status.HTTP_201_CREATED,
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def create_todo_item(
    payload: TodoItemCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    # Audit task f17880d0: a new item may only be filed into lists the
    # caller can reach (their own or legacy-unowned). Reject an attempt to
    # plant an item in another tenant's list with a 404, mirroring the
    # ownership rule the list mutation paths now enforce.
    if payload.list_ids:
        reachable = (
            await db.execute(
                select(TodoList.id).where(
                    TodoList.id.in_(payload.list_ids),
                    (TodoList.user_id == user_id) | (TodoList.user_id.is_(None)),
                )
            )
        ).scalars().all()
        unreachable = set(payload.list_ids) - set(reachable)
        if unreachable:
            raise HTTPException(
                status_code=404,
                detail=f"TodoList(s) not found: {sorted(unreachable)}",
            )
    item = await todo_item_service.create_item(
        db,
        content=payload.content,
        description=payload.description,
        is_completed=payload.is_completed,
        is_starred=payload.is_starred,
        # due_date/parent_id were accepted by the schema but silently
        # dropped here (2026-07-20 audit #13) — list items never reached
        # the attention engine or the daily brief. Pass them through.
        parent_id=payload.parent_id,
        due_date=payload.due_date,
        owner_id=user_id if user_id != 0 else None,
        list_ids=payload.list_ids,
        type=payload.type,
    )
    # Audit task 1a08ded2 AC 66 — fan the new item into the AI ingestion
    # pipeline so its content becomes available for analysis "quickly" (the
    # user's voice memo: newly added data must reach the models without a
    # manual re-index). Best-effort: publish_data_change_event swallows a
    # broker outage so the 201 still lands.
    from app.services.event_publisher import publish_data_change_event

    publish_data_change_event("todo_item", item.id, "created")
    await record_activity(
        action="create", entity_type="todo_item", entity_id=item.id,
        entity_label=item.content,
        context_type="list" if payload.list_ids else None,
        context_id=payload.list_ids[0] if payload.list_ids else None,
        detail="ایجاد آیتم", user_id=user_id, db=db,
    )
    return _serialize(item)


# --- UPDATE -----------------------------------------------------------------

@router.put("/api/todo-items/{item_id}", tags=["todo-items"], response_model=TodoItemOut)
@router.patch("/api/todo-items/{item_id}", tags=["todo-items"], response_model=TodoItemOut)
@handle_errors
async def update_todo_item(
    item_id: int,
    payload: TodoItemUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    await _assert_item_in_scope(db, item_id, user_id)
    before = await todo_item_service.get_item(db, item_id)
    snapshot = {
        "content": before.content,
        "description": before.description,
        "due_date": before.due_date.isoformat() if before.due_date else None,
        "is_completed": before.is_completed,
    }
    data = payload.model_dump(exclude_unset=True)
    item = await todo_item_service.update_item(db, item_id, **data)
    ctx_type, ctx_id = await _item_context(db, item_id)
    await record_activity(
        action="update", entity_type="todo_item", entity_id=item.id,
        entity_label=item.content, context_type=ctx_type, context_id=ctx_id,
        detail="ویرایش آیتم", payload_before=snapshot,
        user_id=user_id, db=db,
    )
    return _serialize(item)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/todo-items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["todo-items"],
)
@handle_errors
async def delete_todo_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> None:
    """Soft delete — the item moves to the trash (سطل زباله) and can be
    restored from /api/trash. Hard removal only via the purge endpoint."""
    await _assert_item_in_scope(db, item_id, user_id)
    ctx_type, ctx_id = await _item_context(db, item_id)
    before = await todo_item_service.get_item(db, item_id)
    snapshot = {
        "content": before.content,
        "description": before.description,
        "due_date": before.due_date.isoformat() if before.due_date else None,
        "is_completed": before.is_completed,
    }
    item = await todo_item_service.soft_delete_item(db, item_id)
    await record_activity(
        action="delete", entity_type="todo_item", entity_id=item_id,
        entity_label=item.content, context_type=ctx_type, context_id=ctx_id,
        detail="انتقال آیتم به سطل زباله", payload_before=snapshot,
        user_id=user_id, db=db,
    )
    return None


# --- TOGGLE COMPLETE / STAR -------------------------------------------------

@router.post(
    "/api/todo-items/{item_id}/toggle-complete",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def toggle_complete(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    await _assert_item_in_scope(db, item_id, user_id)
    item = await todo_item_service.toggle_complete(db, item_id)
    ctx_type, ctx_id = await _item_context(db, item_id)
    await record_activity(
        action="complete" if item.is_completed else "update",
        entity_type="todo_item", entity_id=item.id, entity_label=item.content,
        context_type=ctx_type, context_id=ctx_id,
        detail="تکمیل آیتم" if item.is_completed else "برگشت آیتم به انجام‌نشده",
        user_id=user_id, db=db,
    )
    return _serialize(item)


@router.post(
    "/api/todo-items/{item_id}/toggle-star",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def toggle_star(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    await _assert_item_in_scope(db, item_id, user_id)
    item = await todo_item_service.toggle_star(db, item_id)
    return _serialize(item)


# --- SHARE / UNSHARE / MOVE -------------------------------------------------

@router.post(
    "/api/todo-items/{item_id}/share",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def share_item(
    item_id: int,
    payload: TodoItemShare,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    await _assert_item_in_scope(db, item_id, user_id)
    item = await todo_item_service.share_with_lists(db, item_id, payload.list_ids)
    return _serialize(item)


@router.post(
    "/api/todo-items/{item_id}/unshare",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def unshare_item(
    item_id: int,
    payload: TodoItemUnshare,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    await _assert_item_in_scope(db, item_id, user_id)
    item = await todo_item_service.unshare_from_lists(db, item_id, payload.list_ids)
    return _serialize(item)


@router.post(
    "/api/todo-items/{item_id}/move",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def move_item(
    item_id: int,
    payload: TodoItemMove,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    await _assert_item_in_scope(db, item_id, user_id)
    item = await todo_item_service.move_item(
        db,
        item_id,
        from_list_id=payload.from_list_id,
        to_list_id=payload.to_list_id,
    )
    return _serialize(item)
