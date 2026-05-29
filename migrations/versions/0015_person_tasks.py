"""Create the person_tasks M2M table (audit task 3cc09436, AC2).

Revision ID: 0015_person_tasks
Revises: 0014_sync_remaining_model_tables
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0015_person_tasks"
down_revision: Union[str, None] = "0014_sync_remaining_model_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if not sa.inspect(bind).has_table("person_tasks"):
        op.create_table(
            "person_tasks",
            sa.Column(
                "person_id",
                sa.Integer(),
                sa.ForeignKey("persons.id", ondelete="CASCADE"),
                primary_key=True,
            ),
            sa.Column(
                "task_id",
                sa.Integer(),
                sa.ForeignKey("tasks.id", ondelete="CASCADE"),
                primary_key=True,
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if sa.inspect(bind).has_table("person_tasks"):
        op.drop_table("person_tasks")
