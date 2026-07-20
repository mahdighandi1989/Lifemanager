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
from app.dependencies.auth import enforce_write_auth, get_optional_user_id
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
from app.services.activity_log_service import record_activity

logger = logging.getLogger(__name__)

router = APIRouter()


# Item / list serialisers live in app/routes/_serializers.py so the
# todo_items router and this one share one implementation. Aliased
# under the historical names so the rest of this file keeps reading.


def _list_owned_by(lst, user_id: int) -> bool:
    """Ownership gate for the single-list mutation paths (audit task
    f17880d0 — "Incomplete Permission Coverage for Mutation Paths").

    A list is reachable when it is the caller's *or* legacy-unowned
    (``user_id IS NULL`` — the 33 seeded defaults until a user claims
    them). This mirrors the OR-NULL rule already used by
    ``list_service.list_lists`` so the get-one / update / delete paths
    are coherent with the list path: previously they ignored identity
    entirely and let any caller mutate any list across tenants. Cross-
    tenant lists are hidden with a 404 rather than a 403.
    """
    return getattr(lst, "user_id", None) is None or lst.user_id == user_id


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
async def get_list(
    list_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
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
    if not _list_owned_by(lst, user_id):
        raise HTTPException(status_code=404, detail=f"TodoList {list_id} not found")
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
    payload: TodoListCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    """Create a list owned by the caller (audit task f17880d0).

    The owner is taken from the auth context — symmetric with
    ``create_project`` / ``create_task`` — so a new list lands under
    the caller's scope instead of as an unowned row visible to everyone.
    """
    lst = await list_service.create_list(
        db,
        name=payload.name,
        description=payload.description,
        sort_order=payload.sort_order,
        is_archived=payload.is_archived,
        user_id=user_id,
    )
    await record_activity(
        action="create", entity_type="list", entity_id=lst.id,
        entity_label=lst.name, detail="ایجاد لیست", user_id=user_id, db=db,
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
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    """Update a list the caller owns (audit task f17880d0).

    Refuses cross-tenant rows with a 404 before mutating anything,
    closing the gap where this path ignored identity entirely.
    """
    existing = await list_service.get_list(db, list_id)
    if not _list_owned_by(existing, user_id):
        raise HTTPException(status_code=404, detail=f"TodoList {list_id} not found")
    data = payload.model_dump(exclude_unset=True)
    lst = await list_service.update_list(db, list_id, **data)
    count = await list_service.count_items(db, list_id)
    await record_activity(
        action="update", entity_type="list", entity_id=lst.id,
        entity_label=lst.name, detail="ویرایش لیست", user_id=user_id, db=db,
    )
    return _serialize_list(lst, item_count=count)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/lists/{list_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["todo-lists"],
)
@handle_errors
async def delete_list(
    list_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> None:
    """Delete a list the caller owns (audit task f17880d0).

    Cross-tenant deletes are refused with a 404 — the destructive
    counterpart to ``delete_project``."""
    existing = await list_service.get_list(db, list_id)
    if not _list_owned_by(existing, user_id):
        raise HTTPException(status_code=404, detail=f"TodoList {list_id} not found")
    name = existing.name
    await list_service.delete_list(db, list_id)
    await record_activity(
        action="delete", entity_type="list", entity_id=list_id,
        entity_label=name, detail="حذف لیست", user_id=user_id, db=db,
    )
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
    _write_gate: None = Depends(enforce_write_auth),
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
        result = await list_service.sync_todo_lists_from_source(
            db, user_id=user_id, payload=payload
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    await record_activity(
        action="import", entity_type="list",
        entity_label=str(payload.get("name") or "")[:255] or None,
        detail=f"همگام‌سازی لیست از فایل «{upload.filename or ''}»",
        user_id=user_id, db=db,
    )
    return result


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
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    """Quick-add an item directly into this list.

    Accepts a free-form dict so the frontend can POST {content, ...} without
    juggling list_ids; the route inserts list_id automatically. The target
    list must be reachable in the caller's scope (audit task f17880d0) —
    you can't inject items into another tenant's list.
    """
    target = await list_service.get_list(db, list_id)
    if not _list_owned_by(target, user_id):
        raise HTTPException(status_code=404, detail=f"TodoList {list_id} not found")
    content = payload.get("content")
    if not isinstance(content, str) or not content.strip():
        raise HTTPException(status_code=400, detail="content is required")
    # due_date was accepted by the schema-level endpoint but dropped on
    # this quick-add path (2026-07-20 audit #13) — parse it so list items
    # can join the attention engine and the daily brief.
    from datetime import date as _date

    raw_due = payload.get("due_date")
    due_date = None
    if isinstance(raw_due, str) and raw_due.strip():
        try:
            due_date = _date.fromisoformat(raw_due.strip()[:10])
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid due_date")
    item = await todo_item_service.create_item(
        db,
        content=content,
        description=payload.get("description"),
        is_completed=bool(payload.get("is_completed", False)),
        is_starred=bool(payload.get("is_starred", False)),
        due_date=due_date,
        owner_id=user_id if user_id != 0 else None,
        list_ids=[list_id],
    )
    await record_activity(
        action="create", entity_type="todo_item", entity_id=item.id,
        entity_label=item.content, context_type="list", context_id=list_id,
        detail=f"افزودن آیتم به لیست «{target.name}»", user_id=user_id, db=db,
    )
    return _serialize_item(item)
