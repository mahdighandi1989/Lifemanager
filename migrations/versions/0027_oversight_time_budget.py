"""Add external_project_connections.time_budget_minutes.

Audit task d2146781: per-connection time budget for the oversight
time-allocation + neglect analysis. Inspector-guarded; SQLite-safe.

Revision ID: 0027_oversight_time_budget
Revises: 0026_ai_provider_routing
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0027_oversight_time_budget"
down_revision: Union[str, None] = "0026_ai_provider_routing"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, col: str) -> bool:
    if table not in sa.inspect(bind).get_table_names():
        return False
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "external_project_connections", "time_budget_minutes"):
        op.add_column(
            "external_project_connections",
            sa.Column("time_budget_minutes", sa.Integer(), nullable=True),
        )


def downgrade() -> None:
    op.drop_column("external_project_connections", "time_budget_minutes")
