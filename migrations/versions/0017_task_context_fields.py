"""Add the context-engine trigger columns to tasks (audit task 2165524b, AC2).

location_lat / location_lng / heart_rate_threshold / activity_required /
mood_tag — all plain nullable columns, so add_column is SQLite-safe and
idempotent via the inspector.

Revision ID: 0017_task_context_fields
Revises: 0016_task_estimated_cost
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0017_task_context_fields"
down_revision: Union[str, None] = "0016_task_estimated_cost"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS = [
    ("location_lat", sa.Numeric(10, 6)),
    ("location_lng", sa.Numeric(10, 6)),
    ("heart_rate_threshold", sa.Integer()),
    ("activity_required", sa.String(length=64)),
    ("mood_tag", sa.String(length=64)),
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
