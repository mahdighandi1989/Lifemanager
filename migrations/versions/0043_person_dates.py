"""persons.birthday + persons.next_follow_up (phase 3 — CRM dates).

The CRM had no date column a reminder could hang on (2026-07-20 audit
#11). Inspector-guarded; SQLite-safe; Render free tier gets the columns
via the idempotent startup ALTERs in app/main.py.

Revision ID: 0043_person_dates
Revises: 0042_ai_usage_logs
Create Date: 2026-07-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0043_person_dates"
down_revision: Union[str, None] = "0042_ai_usage_logs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_COLUMNS = [
    ("persons", sa.Column("birthday", sa.Date(), nullable=True)),
    ("persons", sa.Column("next_follow_up", sa.Date(), nullable=True)),
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
