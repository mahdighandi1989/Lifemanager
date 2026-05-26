"""Service layer for TodoItem CRUD + M2M membership operations.

The move/share/unshare helpers mutate the `todo_list_items`
association table directly via Core inserts/deletes — that's faster
than rehydrating ORM collections and produces single-statement SQL
that's easy to reason about.
"""
from __future__ import annotations

import html
from datetime import datetime, timezone
from typing import Iterable, List, Optional, Sequence

from sqlalchemy import delete, select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items


def _sanitize(value: Optional[str]) -> Optional[str]:
    return None if value is None else html.escape(value, quote=True)


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def list_items(
    db: AsyncSession,
    *,
    list_id: Optional[int] = None,
    starred_only: bool = False,
    completed: Optional[bool] = None,
) -> Sequence[TodoItem]:
    stmt = select(TodoItem)
    if list_id is not None:
        stmt = stmt.join(
            todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id
        ).where(todo_list_items.c.todo_list_id == list_id)
    if starred_only:
        stmt = stmt.where(TodoItem.is_starred.is_(True))
    if completed is not None:
        stmt = stmt.where(TodoItem.is_completed.is_(completed))
    stmt = stmt.order_by(TodoItem.id)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


async def get_item(db: AsyncSession, item_id: int) -> TodoItem:
    obj = await db.get(TodoItem, item_id)
    if obj is None:
        raise NoResultFound(f"TodoItem {item_id} not found")
    return obj


async def get_item_list_ids(db: AsyncSession, item_id: int) -> List[int]:
    stmt = select(todo_list_items.c.todo_list_id).where(
        todo_list_items.c.todo_item_id == item_id
    )
    result = await db.execute(stmt)
    return [row for (row,) in result.all()]


async def _validate_lists_exist(db: AsyncSession, list_ids: Iterable[int]) -> List[int]:
    """Return the de-duplicated subset of list_ids that actually exist.

    Silently drops bogus ids so a single malformed list_id from the
    client doesn't fail the whole operation. The caller should check
    for an empty return when that matters.
    """
    ids = list({i for i in list_ids if i is not None})
    if not ids:
        return []
    stmt = select(TodoList.id).where(TodoList.id.in_(ids))
    result = await db.execute(stmt)
    return [row for (row,) in result.all()]


async def _link_to_lists(
    db: AsyncSession, item_id: int, list_ids: Iterable[int]
) -> None:
    """INSERT ... ON CONFLICT DO NOTHING into the association table.

    Uses the dialect-specific construct so duplicate membership doesn't
    raise — sharing the same item into a list it already belongs to is
    a no-op rather than a 409.
    """
    valid = await _validate_lists_exist(db, list_ids)
    if not valid:
        return
    bind = db.get_bind()
    dialect = bind.dialect.name if bind is not None else "sqlite"
    rows = [{"todo_list_id": lid, "todo_item_id": item_id} for lid in valid]
    if dialect == "postgresql":
        stmt = pg_insert(todo_list_items).values(rows).on_conflict_do_nothing()
    elif dialect == "sqlite":
        stmt = sqlite_insert(todo_list_items).values(rows).on_conflict_do_nothing()
    else:
        # Fallback: do a SELECT-then-INSERT for the rare dialect that
        # doesn't speak ON CONFLICT (e.g. MySQL < 5.7).
        existing = await db.execute(
            select(todo_list_items.c.todo_list_id).where(
                todo_list_items.c.todo_item_id == item_id,
                todo_list_items.c.todo_list_id.in_(valid),
            )
        )
        already = {row for (row,) in existing.all()}
        new_rows = [r for r in rows if r["todo_list_id"] not in already]
        if not new_rows:
            return
        stmt = todo_list_items.insert().values(new_rows)
    await db.execute(stmt)


async def create_item(
    db: AsyncSession,
    *,
    content: str,
    description: Optional[str] = None,
    is_completed: bool = False,
    is_starred: bool = False,
    parent_id: Optional[int] = None,
    due_date=None,
    owner_id: Optional[int] = None,
    list_ids: Optional[Iterable[int]] = None,
) -> TodoItem:
    obj = TodoItem(
        content=_sanitize(content),
        description=_sanitize(description),
        is_completed=is_completed,
        is_starred=is_starred,
        parent_id=parent_id,
        due_date=due_date,
        owner_id=owner_id,
        completed_at=_now() if is_completed else None,
    )
    db.add(obj)
    await db.flush()  # populate obj.id before we link
    if list_ids:
        await _link_to_lists(db, obj.id, list_ids)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_item(
    db: AsyncSession,
    item_id: int,
    *,
    content: Optional[str] = None,
    description: Optional[str] = None,
    is_completed: Optional[bool] = None,
    is_starred: Optional[bool] = None,
    parent_id: Optional[int] = None,
    due_date=None,
) -> TodoItem:
    obj = await get_item(db, item_id)
    if content is not None:
        obj.content = _sanitize(content)
    if description is not None:
        obj.description = _sanitize(description)
    if is_completed is not None and is_completed != obj.is_completed:
        obj.is_completed = is_completed
        obj.completed_at = _now() if is_completed else None
    if is_starred is not None:
        obj.is_starred = is_starred
    if parent_id is not None:
        obj.parent_id = parent_id if parent_id != 0 else None
    if due_date is not None:
        obj.due_date = due_date
    await db.commit()
    await db.refresh(obj)
    return obj


async def toggle_complete(db: AsyncSession, item_id: int) -> TodoItem:
    obj = await get_item(db, item_id)
    obj.is_completed = not bool(obj.is_completed)
    obj.completed_at = _now() if obj.is_completed else None
    await db.commit()
    await db.refresh(obj)
    return obj


async def toggle_star(db: AsyncSession, item_id: int) -> TodoItem:
    obj = await get_item(db, item_id)
    obj.is_starred = not bool(obj.is_starred)
    await db.commit()
    await db.refresh(obj)
    return obj


async def share_with_lists(
    db: AsyncSession, item_id: int, list_ids: Iterable[int]
) -> TodoItem:
    obj = await get_item(db, item_id)
    await _link_to_lists(db, obj.id, list_ids)
    await db.commit()
    await db.refresh(obj)
    return obj


async def unshare_from_lists(
    db: AsyncSession, item_id: int, list_ids: Iterable[int]
) -> TodoItem:
    obj = await get_item(db, item_id)
    ids = list({i for i in list_ids if i is not None})
    if ids:
        await db.execute(
            delete(todo_list_items).where(
                todo_list_items.c.todo_item_id == obj.id,
                todo_list_items.c.todo_list_id.in_(ids),
            )
        )
        await db.commit()
    await db.refresh(obj)
    return obj


async def move_item(
    db: AsyncSession,
    item_id: int,
    *,
    from_list_id: int,
    to_list_id: int,
) -> TodoItem:
    """Atomic move: unshare from `from_list_id`, share into `to_list_id`.

    No-op if the source and destination are the same. Raises
    NoResultFound when either list id is missing.
    """
    if from_list_id == to_list_id:
        return await get_item(db, item_id)
    valid = await _validate_lists_exist(db, [from_list_id, to_list_id])
    if from_list_id not in valid or to_list_id not in valid:
        raise NoResultFound("source or destination list not found")
    obj = await get_item(db, item_id)
    await db.execute(
        delete(todo_list_items).where(
            todo_list_items.c.todo_item_id == obj.id,
            todo_list_items.c.todo_list_id == from_list_id,
        )
    )
    await _link_to_lists(db, obj.id, [to_list_id])
    await db.commit()
    await db.refresh(obj)
    return obj


async def delete_item(db: AsyncSession, item_id: int) -> None:
    obj = await get_item(db, item_id)
    # Cascade on the association table is ON DELETE CASCADE so the
    # M2M rows go away automatically.
    await db.delete(obj)
    await db.commit()
