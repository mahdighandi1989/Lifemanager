"""activity_logs.occurred_at — the event's REAL time, not the insert time.

A bank SMS or a call from last month, extracted today, must sort and display
by when it actually happened. created_at stays the record-insertion time;
occurred_at (nullable) carries the true event time when the source provides
it. Read paths order by COALESCE(occurred_at, created_at).

Revision ID: 0054_activity_occurred_at
Revises: 0053_person_rel_override
"""
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = "0054_activity_occurred_at"
down_revision: Union[str, None] = "0053_person_rel_override"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("activity_logs") as batch:
        batch.add_column(sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index(
        "ix_activity_logs_occurred_at", "activity_logs", ["occurred_at"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_activity_logs_occurred_at", table_name="activity_logs")
    with op.batch_alter_table("activity_logs") as batch:
        batch.drop_column("occurred_at")
