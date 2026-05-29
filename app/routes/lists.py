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

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.schemas.todo_item_schema import TodoItemOut
from app.schemas.todo_list_schema import (
    TodoListCreate,
    TodoListOut,
    TodoListUpdate,
    TodoListWithItemsOut,
)
from app.routes._serializers import serialize_item as _serialize_item
from app.routes._serializers import serialize_list as _serialize_list
from app.services import list_service, todo_item_service

logger = logging.getLogger(__name__)

router = APIRouter()


# Item / list serialisers live in app/routes/_serializers.py so the
# todo_items router and this one share one implementation. Aliased
# under the historical names so the rest of this file keeps reading.

# --- LIST -------------------------------------------------------------------

@router.get("/api/lists", tags=["todo-lists"], response_model=List[TodoListOut])
@router.get("/api/lists/", tags=["todo-lists"], response_model=List[TodoListOut])
@handle_errors
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """List the caller's todo lists.

    ``get_optional_user_id`` returns ``DEFAULT_ANON_USER_ID`` (0) when
    no bearer token is presented, so the frontend's login-bypass mode
    still resolves a stable per-user scope. When a real JWT is supplied
    the dep enforces signature + expiry on it (see
    AuthService.verify_token), which closes the authz gap audit task
    78c0e8e0 flagged for this endpoint.
    """
    lists = await list_service.list_lists(
        db, include_archived=include_archived, user_id=user_id
    )
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
    """Return one list + its items.

    Consumer: frontend/src/pages/ListDetail.jsx (the /lists/{id} page)
    via fetch(`${API_BASE}/lists/${id}`). The auto-audit's grep
    misses this because the URL is built from a template literal
    (`/api/lists/${id}`) rather than a literal `/api/lists/{list_id}`
    string. Heavily exercised — every navigation to a list page hits
    this route.
    """
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
    "/api/lists/sync-from-file",
    tags=["todo-lists"],
)
@handle_errors
async def sync_lists_from_file(
    upload: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Sync one TodoList + its items from an uploaded JSON file.

    Per audit task 217909d2 ACs 6-8, the file format is a JSON
    document of shape ``{"name": str, "items": [{"content": str, ...}, ...]}``.
    The route is idempotent: re-uploading the same file produces no
    change; items present in the DB but absent from the file are
    removed from the list (deletion AC).
    """
    import json

    raw = await upload.read()
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"file must be UTF-8 JSON: {exc}",
        )
    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="top-level JSON must be an object",
        )
    try:
        return await list_service.sync_todo_lists_from_source(
            db, user_id=user_id, payload=payload
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


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
