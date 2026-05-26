"""seed real TodoItems from the user's 33 Microsoft To Do PDFs.

The user exported their TodoList profile (33 lists) from Microsoft
To Do as PDFs and asked us to materialise the contents verbatim:

  * each item's content text (Persian, mostly RTL)
  * its is_completed (crossed-out) state
  * its is_starred (highlighted with ★) state
  * its parent/subitem relationships
  * its `Overdue, …` due_date stamps
  * its cross-list membership (items appearing in multiple lists)

The seed payload lives in `app.services._todo_seed_data.LISTS_DATA`,
shared with the runtime seeder in app/main.py startup so the alembic
path and the Render-free-tier startup path apply the same data.

This first pass covers 24 of 33 lists (the simpler / earlier-extracted
ones). A follow-up migration adds the remaining 9 (موضوعات برای تفکر,
کارهای اصلی این هفته, نویسندگی, پرونده های موقتا مختومه, کسب در آمد,
کارهای زیر 2 دقیقه, وقتی بیکارم, ایده ها, خودسازی).

Idempotent per-list: a list with any existing items is skipped.

Revision ID: 0007_seed_todo_items_from_pdfs
Revises: 0006_todo_item_parent_and_due
Create Date: 2026-05-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0007_seed_todo_items_from_pdfs"
down_revision: Union[str, None] = "0006_todo_item_parent_and_due"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Single source of truth for the seed payload — also used by the
# runtime seeder at app/main.py startup.
from app.services._todo_seed_data import LISTS_DATA  # noqa: E402


def _get_list_id(conn, todo_lists, name: str):
    row = conn.execute(
        sa.select(todo_lists.c.id).where(todo_lists.c.name == name)
    ).first()
    return row[0] if row else None


def _list_has_items(conn, todo_list_items, list_id: int) -> bool:
    n = conn.execute(
        sa.select(sa.func.count())
        .select_from(todo_list_items)
        .where(todo_list_items.c.todo_list_id == list_id)
    ).scalar_one()
    return bool(n)


def _insert_item(conn, todo_items, *, content, is_completed=False, is_starred=False,
                 due_date=None, description=None, parent_id=None) -> int:
    result = conn.execute(
        todo_items.insert().values(
            content=content,
            description=description,
            is_completed=is_completed,
            is_starred=is_starred,
            due_date=due_date,
            parent_id=parent_id,
        )
    )
    return int(result.inserted_primary_key[0])


def _link_to_list(conn, todo_list_items, item_id: int, list_id: int, position: int) -> None:
    try:
        conn.execute(
            todo_list_items.insert().values(
                todo_list_id=list_id, todo_item_id=item_id, position=position
            )
        )
    except sa.exc.IntegrityError:
        pass


def upgrade() -> None:
    bind = op.get_bind()
    meta = sa.MetaData()
    todo_lists = sa.Table("todo_lists", meta, autoload_with=bind)
    todo_items = sa.Table("todo_items", meta, autoload_with=bind)
    todo_list_items = sa.Table("todo_list_items", meta, autoload_with=bind)

    shared_item_ids: dict[str, int] = {}

    for list_name, items in LISTS_DATA.items():
        list_id = _get_list_id(bind, todo_lists, list_name)
        if list_id is None or _list_has_items(bind, todo_list_items, list_id):
            continue

        for position, item in enumerate(items):
            shared = item.get("shared_key")
            if shared and shared in shared_item_ids:
                _link_to_list(bind, todo_list_items, shared_item_ids[shared], list_id, position)
                continue

            item_id = _insert_item(
                bind, todo_items,
                content=item["content"],
                is_completed=item.get("is_completed", False),
                is_starred=item.get("is_starred", False),
                due_date=item.get("due_date"),
                description=item.get("description"),
            )
            _link_to_list(bind, todo_list_items, item_id, list_id, position)
            if shared:
                shared_item_ids[shared] = item_id

            for sub in item.get("subitems", []):
                _insert_item(
                    bind, todo_items,
                    content=sub["content"],
                    is_completed=sub.get("is_completed", False),
                    is_starred=sub.get("is_starred", False),
                    due_date=sub.get("due_date"),
                    description=sub.get("description"),
                    parent_id=item_id,
                )


def downgrade() -> None:
    # No safe automatic rollback — the seed creates many rows that
    # might have user-created edits by the time we'd want to undo it.
    # If a hard reset is needed, drop and recreate via 0004's downgrade.
    pass
