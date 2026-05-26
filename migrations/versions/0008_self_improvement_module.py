"""create self-improvement tables + seed the four خودسازی sub-lists.

This migration introduces the Self-Improvement (خودسازی) module the
user asked for in the Google-Forms-import request:

  * Four new TodoLists under the umbrella "خودسازی":
      - "خودسازی - محاسبه میان و پایان هفته"  (main / index page)
      - "خودسازی - تقویت اراده"               (28 items)
      - "خودسازی - عشق به خدا"                (12 items)
      - "خودسازی - ترس‌ها و شجاعت"            (40 items)
    Items come verbatim from the three uploaded HTML form exports.

  * Two new tables:
      - ``self_improvement_checkins`` — one row per (user, item, date).
        Status column tracks the daily tick state separately from the
        TodoItem.is_completed flag, so recurring habits can be ticked
        today and reset tomorrow without losing the long history.
      - ``user_profile_analytics`` — one row per user holding the
        AI-generated narrative + chart payload. Refreshed by the
        Celery analytics task; cached so the profile page reads
        cheaply.

Idempotent at every layer: list-name lookups skip if the list exists,
item insertion checks for an existing membership row, and the two
new tables use ``IF NOT EXISTS``-equivalent guards via Alembic's
inspector.

Revision ID: 0008_self_improvement_module
Revises: 0007_seed_todo_items_from_pdfs
Create Date: 2026-05-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect


revision: str = "0008_self_improvement_module"
down_revision: Union[str, None] = "0007_seed_todo_items_from_pdfs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Single source of truth for the seed payload — also used by the
# runtime seeder so a freshly-built dev env without a migration run
# still gets the lists.
from app.services._self_improvement_seed_data import (  # noqa: E402
    MUHASEBE_ITEMS,
    MUHASEBE_LIST_NAME,
    SELF_IMPROVEMENT_LISTS,
)


def _table_exists(bind, name: str) -> bool:
    return inspect(bind).has_table(name)


def _ensure_list(bind, todo_lists, name: str) -> int:
    """Return the id of the named list, creating it if absent."""
    row = bind.execute(
        sa.select(todo_lists.c.id).where(todo_lists.c.name == name)
    ).first()
    if row:
        return int(row[0])
    result = bind.execute(
        todo_lists.insert().values(
            name=name, description=None, sort_order=0, is_archived=False
        )
    )
    return int(result.inserted_primary_key[0])


def _list_has_items(bind, todo_list_items, list_id: int) -> bool:
    n = bind.execute(
        sa.select(sa.func.count())
        .select_from(todo_list_items)
        .where(todo_list_items.c.todo_list_id == list_id)
    ).scalar_one()
    return bool(n)


def _seed_list_items(bind, todo_items, todo_list_items, list_id: int,
                     contents: list[str]) -> None:
    if _list_has_items(bind, todo_list_items, list_id):
        return
    for position, content in enumerate(contents):
        result = bind.execute(
            todo_items.insert().values(
                content=content,
                description=None,
                is_completed=False,
                is_starred=False,
                due_date=None,
                parent_id=None,
            )
        )
        item_id = int(result.inserted_primary_key[0])
        bind.execute(
            todo_list_items.insert().values(
                todo_list_id=list_id, todo_item_id=item_id, position=position
            )
        )


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    # --- Create new tables (skip if already present) -------------------
    if not _table_exists(bind, "self_improvement_checkins"):
        op.create_table(
            "self_improvement_checkins",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column(
                "item_id",
                sa.Integer(),
                sa.ForeignKey("todo_items.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column("checkin_date", sa.Date(), nullable=False, index=True),
            sa.Column(
                "status",
                sa.String(length=32),
                nullable=False,
                server_default="pending",
            ),
            sa.Column("ai_reason", sa.Text(), nullable=True),
            sa.Column("ai_model", sa.String(length=128), nullable=True),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.UniqueConstraint(
                "user_id",
                "item_id",
                "checkin_date",
                name="uq_self_improvement_checkins_user_item_date",
            ),
        )

    if not _table_exists(bind, "user_profile_analytics"):
        # Use JSONB on Postgres, JSON elsewhere — SQLite (used in tests)
        # accepts JSON as a TEXT alias.
        json_type = sa.JSON()
        if dialect == "postgresql":
            from sqlalchemy.dialects.postgresql import JSONB
            json_type = JSONB()
        op.create_table(
            "user_profile_analytics",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="CASCADE"),
                nullable=False,
                unique=True,
                index=True,
            ),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("payload", json_type, nullable=True),
            sa.Column(
                "last_refreshed_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.Column("ai_model", sa.String(length=128), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
        )

    # --- Seed the four خودسازی sub-lists -------------------------------
    meta = sa.MetaData()
    todo_lists = sa.Table("todo_lists", meta, autoload_with=bind)
    todo_items = sa.Table("todo_items", meta, autoload_with=bind)
    todo_list_items = sa.Table("todo_list_items", meta, autoload_with=bind)

    # Master "محاسبه" list is the main page for the module.
    muhasebe_id = _ensure_list(bind, todo_lists, MUHASEBE_LIST_NAME)
    _seed_list_items(bind, todo_items, todo_list_items, muhasebe_id, MUHASEBE_ITEMS)

    # Three category sub-lists.
    for list_name, items in SELF_IMPROVEMENT_LISTS.items():
        list_id = _ensure_list(bind, todo_lists, list_name)
        _seed_list_items(bind, todo_items, todo_list_items, list_id, items)


def downgrade() -> None:
    # Drop the two new tables. We deliberately do NOT remove the seeded
    # lists / items — they live in todo_lists/todo_items which other
    # parts of the app already reference, and the user may have edited
    # them in-place. If a hard reset is needed, drop via 0004's
    # downgrade.
    bind = op.get_bind()
    if _table_exists(bind, "self_improvement_checkins"):
        op.drop_table("self_improvement_checkins")
    if _table_exists(bind, "user_profile_analytics"):
        op.drop_table("user_profile_analytics")
