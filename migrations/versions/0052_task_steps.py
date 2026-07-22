"""مرحله‌بندی — ordered trackable steps on any task.

Adds a nullable ``steps`` JSON column to ``tasks`` so any input can be broken
into stages and followed up (the «نخِ تسبیح» done right), without forcing it
through the preachy daily-command engine. Inspector-guarded; SQLite-safe;
Render free tier also gets it via the startup ALTER in main.py.

Revision ID: 0052_task_steps
Revises: 0051_sahat_layer
Create Date: 2026-07-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0052_task_steps"
down_revision: Union[str, None] = "0051_sahat_layer"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _cols(bind, table: str):
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if "tasks" in sa.inspect(bind).get_table_names() and "steps" not in _cols(bind, "tasks"):
        op.add_column("tasks", sa.Column("steps", sa.JSON(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if "tasks" in sa.inspect(bind).get_table_names() and "steps" in _cols(bind, "tasks"):
        op.drop_column("tasks", "steps")
