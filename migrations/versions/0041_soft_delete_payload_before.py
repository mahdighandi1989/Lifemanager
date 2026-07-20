"""Soft-delete columns + activity-log undo snapshot (data-safety phase 0).

Owner directive: «نه کم بشه نه دستکاری بشه» — DELETE on todo items and
personal writings becomes a recoverable trash stamp, and updates/deletes
snapshot the previous content into activity_logs.payload_before as the
in-app undo source until full DB backups run.

Inspector-guarded; SQLite-safe; Render free tier gets the same columns
via the idempotent startup ALTERs in app/main.py.

Revision ID: 0041_soft_delete_payload_before
Revises: 0040_personal_sync
Create Date: 2026-07-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0041_soft_delete_payload_before"
down_revision: Union[str, None] = "0040_personal_sync"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS = [
    ("todo_items", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True)),
    ("personal_writings", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True)),
    ("activity_logs", sa.Column("payload_before", sa.Text(), nullable=True)),
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
