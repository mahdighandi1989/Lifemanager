"""Add tasks.estimated_cost (audit task 4ae4b3ca, AC5).

A plain nullable NUMERIC column — add_column is SQLite-safe (no constraint),
and idempotent via the inspector so a DB that already grew it (startup ALTER)
upgrades cleanly.

Revision ID: 0016_task_estimated_cost
Revises: 0015_person_tasks
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0016_task_estimated_cost"
down_revision: Union[str, None] = "0015_person_tasks"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, col: str) -> bool:
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "tasks", "estimated_cost"):
        op.add_column("tasks", sa.Column("estimated_cost", sa.Numeric(18, 2), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if _has_column(bind, "tasks", "estimated_cost"):
        op.drop_column("tasks", "estimated_cost")
