"""/api/lists CRUD endpoints.

The frontend addresses TodoLists by name in the sidebar — but the
API is id-driven (names are not unique in the user's data: nothing
stops two lists from being called "Important" by accident, so we don't
treat the name as a key).

Error handling: every handler is wrapped with @handle_errors which
maps NoResultFound → 404, IntegrityError → 409, ValueError → 400.
"""
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware import handle_errors
from app.schemas.todo_item_schema import TodoItemOut
from app.schemas.todo_list_schema import (
    TodoListCreate,
    TodoListOut,
    TodoListUpdate,
    TodoListWithItemsOut,
)
from app.services import list_service, todo_item_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _serialize_list(obj, item_count: int = 0) -> dict:
    return {
        "id": obj.id,
        "name": obj.name,
        "description": obj.description,
        "user_id": obj.user_id,
        "sort_order": obj.sort_order,
        "is_archived": bool(obj.is_archived),
        "item_count": item_count,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "updated_at": obj.updated_at.isoformat() if obj.updated_at else None,
    }


def _serialize_item(obj, list_ids=None) -> dict:
    return {
        "id": obj.id,
        "content": obj.content,
        "description": obj.description,
        "is_completed": bool(obj.is_completed),
        "is_starred": bool(obj.is_starred),
        "parent_id": obj.parent_id,
        "due_date": obj.due_date.isoformat() if obj.due_date else None,
        "owner_id": obj.owner_id,
        "list_ids": list_ids if list_ids is not None else [lst.id for lst in obj.lists],
        "completed_at": obj.completed_at.isoformat() if obj.completed_at else None,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "updated_at": obj.updated_at.isoformat() if obj.updated_at else None,
    }


# --- LIST -------------------------------------------------------------------

@router.get("/api/lists", tags=["todo-lists"], response_model=List[TodoListOut])
@router.get("/api/lists/", tags=["todo-lists"], response_model=List[TodoListOut])
@handle_errors
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
    lists = await list_service.list_lists(db, include_archived=include_archived)
    out: List[dict] = []
    for lst in lists:
        count = await list_service.count_items(db, lst.id)
        out.append(_serialize_list(lst, item_count=count))
    return out


# --- GET ONE (with items) ---------------------------------------------------

@router.get(
    "/api/lists/{list_id}",
    tags=["todo-lists"],
    response_model=TodoListWithItemsOut,
)
@handle_errors
async def get_list(list_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    # Trigger the self-improvement seeder on every list read so the
    # خودسازی lists get their canonical ordering + new descriptions
    # without needing the (now-removed) /self-improvement page or a
    # successful startup hook. Idempotent for non-SI lists and for
    # already-aligned SI lists, so the cost is dominated by a few
    # short SELECTs in the steady state.
    try:
        from app.services.self_improvement_service import ensure_lists_seeded
        await ensure_lists_seeded(db)
    except Exception:
        # Don't let a seeder hiccup turn the user's list view into a
        # 500. The next request will retry.
        pass

    lst = await list_service.get_list(db, list_id)
    items = await todo_item_service.list_items(db, list_id=list_id)
    payload = _serialize_list(lst, item_count=len(items))
    payload["items"] = [_serialize_item(it) for it in items]
    return payload


# --- CREATE -----------------------------------------------------------------

@router.post(
    "/api/lists",
    status_code=status.HTTP_201_CREATED,
    tags=["todo-lists"],
    response_model=TodoListOut,
)
@router.post(
    "/api/lists/",
    status_code=status.HTTP_201_CREATED,
    tags=["todo-lists"],
    response_model=TodoListOut,
)
@handle_errors
async def create_list(
    payload: TodoListCreate, db: AsyncSession = Depends(get_db)
) -> dict:
    lst = await list_service.create_list(
        db,
        name=payload.name,
        description=payload.description,
        sort_order=payload.sort_order,
        is_archived=payload.is_archived,
    )
    return _serialize_list(lst, item_count=0)


# --- UPDATE -----------------------------------------------------------------

@router.put(
    "/api/lists/{list_id}",
    tags=["todo-lists"],
    response_model=TodoListOut,
)
@router.patch(
    "/api/lists/{list_id}",
    tags=["todo-lists"],
    response_model=TodoListOut,
)
@handle_errors
async def update_list(
    list_id: int,
    payload: TodoListUpdate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = payload.model_dump(exclude_unset=True)
    lst = await list_service.update_list(db, list_id, **data)
    count = await list_service.count_items(db, list_id)
    return _serialize_list(lst, item_count=count)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/lists/{list_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["todo-lists"],
)
@handle_errors
async def delete_list(list_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await list_service.delete_list(db, list_id)
    return None


# --- LIST ITEMS NESTED ------------------------------------------------------

@router.get(
    "/api/lists/{list_id}/items",
    tags=["todo-lists"],
    response_model=List[TodoItemOut],
)
@handle_errors
async def list_items_in_list(
    list_id: int, db: AsyncSession = Depends(get_db)
) -> List[dict]:
    # Verify the list exists so we 404 instead of returning [].
    await list_service.get_list(db, list_id)
    items = await todo_item_service.list_items(db, list_id=list_id)
    return [_serialize_item(it) for it in items]


@router.post(
    "/api/lists/{list_id}/items",
    status_code=status.HTTP_201_CREATED,
    tags=["todo-lists"],
    response_model=TodoItemOut,
)
@handle_errors
async def add_item_to_list(
    list_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Quick-add an item directly into this list.

    Accepts a free-form dict so the frontend can POST {content, ...} without
    juggling list_ids; the route inserts list_id automatically.
    """
    await list_service.get_list(db, list_id)
    content = payload.get("content")
    if not isinstance(content, str) or not content.strip():
        raise HTTPException(status_code=400, detail="content is required")
    item = await todo_item_service.create_item(
        db,
        content=content,
        description=payload.get("description"),
        is_completed=bool(payload.get("is_completed", False)),
        is_starred=bool(payload.get("is_starred", False)),
        list_ids=[list_id],
    )
    return _serialize_item(item)
