"""افراد — the owner's own verdict on a relationship.

Adds a nullable ``relationship_override`` to ``person_profiles``. When set it
beats the computed ``relationship_type`` (stored-wins, same rule as the sahat
column). Inspector-guarded; SQLite-safe; the Render free tier also gets it via
the startup ALTER in main.py.

Revision ID: 0053_person_rel_override
Revises: 0052_task_steps
Create Date: 2026-07-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0053_person_rel_override"
down_revision: Union[str, None] = "0052_task_steps"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLE = "person_profiles"
_COL = "relationship_override"


def _cols(bind, table: str):
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if _TABLE in sa.inspect(bind).get_table_names() and _COL not in _cols(bind, _TABLE):
        op.add_column(_TABLE, sa.Column(_COL, sa.String(length=32), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if _TABLE in sa.inspect(bind).get_table_names() and _COL in _cols(bind, _TABLE):
        op.drop_column(_TABLE, _COL)
