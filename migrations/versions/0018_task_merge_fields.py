"""Add tasks.merged_into_id + merge_history (audit task fbd9bd36, AC6).

Plain nullable columns (merged_into_id is a soft self-reference, no FK), so
add_column is SQLite-safe and idempotent via the inspector.

Revision ID: 0018_task_merge_fields
Revises: 0017_task_context_fields
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0018_task_merge_fields"
down_revision: Union[str, None] = "0017_task_context_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS = [
    ("merged_into_id", sa.Integer()),
    ("merge_history", sa.Text()),
]


def _has_column(bind, table: str, col: str) -> bool:
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    for name, type_ in _COLUMNS:
        if not _has_column(bind, "tasks", name):
            op.add_column("tasks", sa.Column(name, type_, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    for name, _ in reversed(_COLUMNS):
        if _has_column(bind, "tasks", name):
            op.drop_column("tasks", name)
