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

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
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

logger = logging.getLogger(__name__)

router = APIRouter()


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
        db, list_id=list_id, starred_only=starred_only, completed=completed
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
    payload: TodoItemCreate, db: AsyncSession = Depends(get_db)
) -> dict:
    item = await todo_item_service.create_item(
        db,
        content=payload.content,
        description=payload.description,
        is_completed=payload.is_completed,
        is_starred=payload.is_starred,
        list_ids=payload.list_ids,
        type=payload.type,
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
) -> dict:
    data = payload.model_dump(exclude_unset=True)
    item = await todo_item_service.update_item(db, item_id, **data)
    return _serialize(item)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/todo-items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["todo-items"],
)
@handle_errors
async def delete_todo_item(item_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await todo_item_service.delete_item(db, item_id)
    return None


# --- TOGGLE COMPLETE / STAR -------------------------------------------------

@router.post(
    "/api/todo-items/{item_id}/toggle-complete",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def toggle_complete(item_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    item = await todo_item_service.toggle_complete(db, item_id)
    return _serialize(item)


@router.post(
    "/api/todo-items/{item_id}/toggle-star",
    tags=["todo-items"],
    response_model=TodoItemOut,
)
@handle_errors
async def toggle_star(item_id: int, db: AsyncSession = Depends(get_db)) -> dict:
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
) -> dict:
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
) -> dict:
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
) -> dict:
    item = await todo_item_service.move_item(
        db,
        item_id,
        from_list_id=payload.from_list_id,
        to_list_id=payload.to_list_id,
    )
    return _serialize(item)
