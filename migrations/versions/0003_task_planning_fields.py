"""task planning fields — estimated_duration, deadline, recurrence

Adds the three planning columns the planner service needs to schedule
tasks beyond the simple due_date bucket:

  * estimated_duration — INTEGER minutes (portable across Postgres /
    SQLite where INTERVAL isn't universally supported).
  * deadline           — TIMESTAMP WITH TIME ZONE; distinct from due_date
    (which is a Date bucket) and used as the hard cutoff.
  * recurrence         — JSON dict; RFC-5545-ish ({"freq", "interval", ...}).

Each ADD COLUMN is wrapped in a try/except via the inspector so this
migration is idempotent against environments where Base.metadata.create_all()
already produced the columns at startup.

Revision ID: 0003_task_planning_fields
Revises: 0002_all_models
Create Date: 2026-05-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0003_task_planning_fields"
down_revision: Union[str, None] = "0002_all_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    if table not in inspector.get_table_names():
        return False
    return column in {col["name"] for col in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()

    # estimated_duration: minutes
    if not _column_exists(bind, "tasks", "estimated_duration"):
        op.add_column(
            "tasks",
            sa.Column("estimated_duration", sa.Integer(), nullable=True),
        )

    # deadline: full timestamp (separate from the calendar-date `due_date`)
    if not _column_exists(bind, "tasks", "deadline"):
        op.add_column(
            "tasks",
            sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        )

    # recurrence: JSON blob
    if not _column_exists(bind, "tasks", "recurrence"):
        op.add_column(
            "tasks",
            sa.Column("recurrence", sa.JSON(), nullable=True),
        )


def downgrade() -> None:
    for col in ("recurrence", "deadline", "estimated_duration"):
        try:
            op.drop_column("tasks", col)
        except Exception:
            pass
