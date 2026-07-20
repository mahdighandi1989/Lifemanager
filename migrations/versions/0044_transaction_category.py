"""transactions.category (phase 3 — monthly spending report).

Inspector-guarded; SQLite-safe; Render free tier via startup ALTER.

Revision ID: 0044_transaction_category
Revises: 0043_person_dates
Create Date: 2026-07-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0044_transaction_category"
down_revision: Union[str, None] = "0043_person_dates"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    if table not in inspector.get_table_names():
        return False
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "transactions", "category"):
        op.add_column("transactions", sa.Column("category", sa.String(64), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if _has_column(bind, "transactions", "category"):
        op.drop_column("transactions", "category")
