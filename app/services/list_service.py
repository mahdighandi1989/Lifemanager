"""Service layer for TodoList CRUD.

Keeping the SQL in a service module (rather than the route handler)
makes the routes thin and lets us share the same logic from background
tasks, the Celery seeder, and tests.
"""
from __future__ import annotations

import html
import logging
from typing import List, Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo_list import TodoList, todo_list_items


logger = logging.getLogger(__name__)


def _sanitize(value: Optional[str]) -> Optional[str]:
    return None if value is None else html.escape(value, quote=True)


async def list_lists(
    db: AsyncSession,
    *,
    include_archived: bool = False,
    user_id: Optional[int] = None,
) -> Sequence[TodoList]:
    stmt = select(TodoList).order_by(TodoList.sort_order, TodoList.id)
    if not include_archived:
        stmt = stmt.where(TodoList.is_archived.is_(False))
    if user_id is not None:
        # Show lists owned by user *or* unowned (the latter exist for
        # the 33 seeded defaults until the user claims them).
        stmt = stmt.where((TodoList.user_id == user_id) | (TodoList.user_id.is_(None)))
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_list(db: AsyncSession, list_id: int) -> TodoList:
    obj = await db.get(TodoList, list_id)
    if obj is None:
        raise NoResultFound(f"TodoList {list_id} not found")
    return obj


async def count_items(db: AsyncSession, list_id: int) -> int:
    stmt = select(func.count()).select_from(todo_list_items).where(
        todo_list_items.c.todo_list_id == list_id
    )
    result = await db.execute(stmt)
    return int(result.scalar_one() or 0)


async def create_list(
    db: AsyncSession,
    *,
    name: str,
    description: Optional[str] = None,
    sort_order: int = 0,
    is_archived: bool = False,
    user_id: Optional[int] = None,
) -> TodoList:
    obj = TodoList(
        name=_sanitize(name),
        description=_sanitize(description),
        sort_order=sort_order,
        is_archived=is_archived,
        user_id=user_id,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_list(
    db: AsyncSession,
    list_id: int,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None,
    sort_order: Optional[int] = None,
    is_archived: Optional[bool] = None,
) -> TodoList:
    obj = await get_list(db, list_id)
    if name is not None:
        obj.name = _sanitize(name)
    if description is not None:
        obj.description = _sanitize(description)
    if sort_order is not None:
        obj.sort_order = sort_order
    if is_archived is not None:
        obj.is_archived = is_archived
    await db.commit()
    await db.refresh(obj)
    return obj


async def delete_list(db: AsyncSession, list_id: int) -> None:
    obj = await get_list(db, list_id)
    await db.delete(obj)
    await db.commit()


# Default list names mirroring the user's existing TodoList profile
# (33 names sourced from their PDF exports). Used by the migration
# at migrations/versions/0005_seed_default_todo_lists.py AND by the
# startup seeder in app/main.py for Render-free-tier environments
# that bypass alembic.
DEFAULT_LIST_NAMES: tuple[str, ...] = (
    "Important",
    "Tasks",
    "انجام تمرینات تقویت هوش",
    "ایده ها",
    "برنامه نویسی",
    "پرونده های مختومه",
    "پرونده های موقتا مختومه",
    "تاریخ انبیا",
    "تاریخ شفاهی فامیل",
    "تاریخ معاصر",
    "تجارت",
    "تحلیل سیاسی",
    "تفریح و سرگرمی",
    "حفظ قرآن",
    "خریدهای لازم",
    "خودسازی",
    "خودهیپنوتیزم",
    "خوشنویسی",
    "دروس حقوق",
    "ریاضی و فیزیک",
    "زبان",
    "شعر گفتن",
    "علوم و معارف اسلامی",
    "کارهای اصلی این هفته - 05-05-2025",
    "کارهای زیر 2 دقیقه",
    "کسب در آمد",
    "مداحی",
    "مهارت نفوذ",
    "مهارت های فردی",
    "موضوعات برای تفکر",
    "نویسندگی",
    "ورزش",
    "وقتی بیکارم یا نمیدونم چی کار کنم",
)


async def seed_todo_items_if_empty(db: AsyncSession) -> int:
    """Seed the TodoItem rows from the user's 33 Microsoft To Do PDFs.

    Imports `LISTS_DATA` lazily so the seed payload (~600 lines of
    Persian item text) only loads when this seeder runs. Returns the
    number of items inserted across all lists.

    Idempotent per-list: if a list already has any items, that list
    is skipped — so partial seeds are safe to re-run.
    """
    from sqlalchemy import insert, select

    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items
    from app.services._todo_seed_data import LISTS_DATA

    total_inserted = 0
    shared_item_ids: dict[str, int] = {}

    for list_name, items in LISTS_DATA.items():
        result = await db.execute(select(TodoList).where(TodoList.name == list_name))
        lst = result.scalar_one_or_none()
        if lst is None:
            continue
        # Skip lists that already have any items linked.
        result = await db.execute(
            select(func.count()).select_from(todo_list_items).where(
                todo_list_items.c.todo_list_id == lst.id
            )
        )
        if int(result.scalar_one() or 0) > 0:
            continue

        for position, item in enumerate(items):
            shared = item.get("shared_key")
            if shared and shared in shared_item_ids:
                try:
                    await db.execute(
                        insert(todo_list_items).values(
                            todo_list_id=lst.id,
                            todo_item_id=shared_item_ids[shared],
                            position=position,
                        )
                    )
                except IntegrityError as exc:
                    # The shared item is already attached to this list
                    # from a previous run — the UNIQUE constraint on
                    # (todo_list_id, todo_item_id) fires. Treat as
                    # idempotent-success: the row is already where we
                    # want it. Logged at debug because this is the
                    # expected path for re-seeds, not a real error.
                    logger.debug(
                        "skip shared-item re-attach (already linked): "
                        "list_id=%s item_id=%s shared_key=%s: %s",
                        lst.id, shared_item_ids[shared], shared, exc,
                    )
                except SQLAlchemyError as exc:
                    # Any OTHER DB error here is a real problem (broken
                    # FK, schema mismatch, connection drop). Log at
                    # warning so it shows up in production logs but
                    # don't kill the rest of the seed — we'd rather
                    # finish what we can than blow up startup.
                    logger.warning(
                        "shared-item re-attach failed: list_id=%s "
                        "item_id=%s shared_key=%s: %s",
                        lst.id, shared_item_ids[shared], shared, exc,
                    )
                continue

            obj = TodoItem(
                content=item["content"],
                description=item.get("description"),
                is_completed=item.get("is_completed", False),
                is_starred=item.get("is_starred", False),
                due_date=item.get("due_date"),
            )
            db.add(obj)
            await db.flush()
            total_inserted += 1
            await db.execute(
                insert(todo_list_items).values(
                    todo_list_id=lst.id, todo_item_id=obj.id, position=position
                )
            )
            if shared:
                shared_item_ids[shared] = obj.id

            for sub in item.get("subitems", []):
                child = TodoItem(
                    content=sub["content"],
                    description=sub.get("description"),
                    is_completed=sub.get("is_completed", False),
                    is_starred=sub.get("is_starred", False),
                    due_date=sub.get("due_date"),
                    parent_id=obj.id,
                )
                db.add(child)
                total_inserted += 1

        await db.commit()
    return total_inserted


async def seed_default_lists_if_empty(db: AsyncSession) -> int:
    """Insert DEFAULT_LIST_NAMES iff the todo_lists table is empty.

    Returns the number of inserted rows (0 on a no-op). Idempotent —
    safe to call on every startup; the empty-table check prevents
    duplicate seeds and the `OR name NOT IN existing` branch in
    bulk_create_default_lists handles partial seed states.
    """
    result = await db.execute(select(func.count()).select_from(TodoList))
    count = int(result.scalar_one() or 0)
    if count > 0:
        return 0
    created = await bulk_create_default_lists(db, DEFAULT_LIST_NAMES)
    return len(created)


async def bulk_create_default_lists(
    db: AsyncSession, names: Sequence[str]
) -> List[TodoList]:
    """Seed helper — used by the 0005 migration and the test fixtures.

    Idempotent: skips names that already exist (case-sensitive match
    on TodoList.name) so re-running the seeder is safe.
    """
    existing = await db.execute(select(TodoList.name))
    existing_names = {row for (row,) in existing.all()}
    created: List[TodoList] = []
    for idx, name in enumerate(names):
        if name in existing_names:
            continue
        obj = TodoList(name=name, sort_order=idx)
        db.add(obj)
        created.append(obj)
    if created:
        await db.commit()
        for obj in created:
            await db.refresh(obj)
    return created
