"""Add users.bio and users.display_name to bring alembic in sync with
the runtime startup migrator (audit task 3ea5622b).

The User model has declared ``bio`` (Text) and ``display_name``
(String(120)) for a while — they back the /api/users/profile sanitiser
endpoint. ``Base.metadata.create_all`` (used on Render's free tier
startup) already produces these columns, and the app.main startup
path adds them defensively with ``ADD COLUMN IF NOT EXISTS`` for
legacy databases. But no alembic revision actually carried them, so
``alembic upgrade head`` against a 0001-baseline database left the
columns missing and the profile endpoint would 500 on first write.

This migration closes that gap. It is idempotent against any database
that already has the columns (e.g. one that booted via create_all
first), thanks to ``ADD COLUMN IF NOT EXISTS``.

Revision ID: 0011_user_profile_columns
Revises: 0010_todo_item_content_to_text
Create Date: 2026-05-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0011_user_profile_columns"
down_revision: Union[str, None] = "0010_todo_item_content_to_text"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    return column in {col["name"] for col in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _column_exists(bind, "users", "bio"):
        op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))
    if not _column_exists(bind, "users", "display_name"):
        op.add_column(
            "users",
            sa.Column("display_name", sa.String(length=120), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _column_exists(bind, "users", "display_name"):
        op.drop_column("users", "display_name")
    if _column_exists(bind, "users", "bio"):
        op.drop_column("users", "bio")
