"""Widen todo_items.content from VARCHAR(1000) to TEXT.

Migration 0008 seeded the self-improvement lists, but TodoItem.content
was declared as String(1000) since the table's inception. Several
"عشق به خدا" items run 1500–2300 characters (each row is a habit name
plus a multi-paragraph explanation the user wrote in the source form),
which Postgres rejected with StringDataRightTruncation. The result on
production was a partially-seeded list (12 items → 2) and a 500 on
/api/self-improvement/overview because the seeder retried on every
request and re-hit the same truncation error.

After this migration:
  * column is TEXT — no length cap
  * the next overview call re-seeds the affected lists cleanly (the
    runtime helper already handles "list exists but has fewer items
    than expected").
SQLite (used in tests) ignores VARCHAR(N) length anyway, so this
migration is a no-op there.

Revision ID: 0010_todo_item_content_to_text
Revises: 0009_self_improvement_full_content
Create Date: 2026-05-27
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0010_todo_item_content_to_text"
down_revision: Union[str, None] = "0009_self_improvement_full_content"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.alter_column(
            "todo_items",
            "content",
            existing_type=sa.String(length=1000),
            type_=sa.Text(),
            existing_nullable=False,
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # Truncate any rows that grew past 1000 chars so the narrower
        # type can be re-applied without raising.
        op.execute(
            "UPDATE todo_items SET content = substring(content from 1 for 1000) "
            "WHERE length(content) > 1000"
        )
        op.alter_column(
            "todo_items",
            "content",
            existing_type=sa.Text(),
            type_=sa.String(length=1000),
            existing_nullable=False,
        )
