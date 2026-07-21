"""directives.steps — step-by-step guidance (موتور نهادینه‌سازی، لایه ۲).

Adds a JSON ``steps`` column to the directives table so a directive can be
broken into concrete sub-steps / prerequisites and surface its "current step".
Inspector-guarded; SQLite-safe; Render free tier also gets it via the
idempotent startup ALTER in app/main.py.

Revision ID: 0047_directive_steps
Revises: 0046_directives
Create Date: 2026-07-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0047_directive_steps"
down_revision: Union[str, None] = "0046_directives"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    if table not in inspector.get_table_names():
        return False
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "directives", "steps"):
        op.add_column("directives", sa.Column("steps", sa.JSON(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if _has_column(bind, "directives", "steps"):
        op.drop_column("directives", "steps")
