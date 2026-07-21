"""directives.preferred_time/context — scheduling (موتور نهادینه‌سازی، لایه ۳).

Adds WHEN/WHERE columns so a directive can carry a preferred time window and a
context cue; the daily commands order by it and a once-a-day reminder fires.
Inspector-guarded; SQLite-safe; Render free tier also gets them via the
idempotent startup ALTERs in app/main.py.

Revision ID: 0048_directive_schedule
Revises: 0047_directive_steps
Create Date: 2026-07-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0048_directive_schedule"
down_revision: Union[str, None] = "0047_directive_steps"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS = [
    ("directives", sa.Column("preferred_time", sa.String(16), nullable=True)),
    ("directives", sa.Column("preferred_context", sa.Text(), nullable=True)),
]


def _has_column(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    if table not in inspector.get_table_names():
        return False
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    for table, column in _COLUMNS:
        if not _has_column(bind, table, column.name):
            op.add_column(table, column)


def downgrade() -> None:
    bind = op.get_bind()
    for table, column in _COLUMNS:
        if _has_column(bind, table, column.name):
            op.drop_column(table, column.name)
