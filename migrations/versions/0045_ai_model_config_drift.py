"""ai_model_configs drift columns (prompt_template/context_type/…).

Audit task e606cca6 added these columns to the model but never to a
migration or startup ALTER, so production Postgres lacked them — which
made the full-DB backup's SELECT raise UndefinedColumn (2026-07-21).
Inspector-guarded; SQLite-safe; Render free tier gets them via the
idempotent startup ALTERs in app/main.py.

Revision ID: 0045_ai_model_config_drift
Revises: 0044_transaction_category
Create Date: 2026-07-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0045_ai_model_config_drift"
down_revision: Union[str, None] = "0044_transaction_category"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS = [
    ("ai_model_configs", sa.Column("prompt_template", sa.Text(), nullable=True)),
    ("ai_model_configs", sa.Column("context_type", sa.String(32), nullable=True, server_default="tasks")),
    ("ai_model_configs", sa.Column("dynamic_response", sa.Boolean(), nullable=True, server_default=sa.true())),
    ("ai_model_configs", sa.Column("token_limit", sa.Integer(), nullable=True)),
]


def _has_column(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    if table not in inspector.get_table_names():
        return False
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    for table, column in _COLUMNS:
        if not _has_column(bind, table, column.name):
            op.add_column(table, column)


def downgrade() -> None:
    bind = op.get_bind()
    for table, column in _COLUMNS:
        if _has_column(bind, table, column.name):
            op.drop_column(table, column.name)
