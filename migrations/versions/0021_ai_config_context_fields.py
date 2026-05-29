"""Add ai_model_configs.context_type / dynamic_response / token_limit.

Audit task e606cca6 (AC1): per-config dynamic-context controls. Idempotent
add_column (inspector guard) so a DB already grown by startup create_all
upgrades cleanly. SQLite-safe (nullable / server_default, no constraint).

Revision ID: 0021_ai_config_context_fields
Revises: 0020_sync_people_asset_tables
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0021_ai_config_context_fields"
down_revision: Union[str, None] = "0020_sync_people_asset_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, col: str) -> bool:
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "ai_model_configs", "context_type"):
        op.add_column(
            "ai_model_configs",
            sa.Column("context_type", sa.String(32), nullable=False, server_default="tasks"),
        )
    if not _has_column(bind, "ai_model_configs", "dynamic_response"):
        op.add_column(
            "ai_model_configs",
            sa.Column("dynamic_response", sa.Boolean(), nullable=False, server_default="1"),
        )
    if not _has_column(bind, "ai_model_configs", "token_limit"):
        op.add_column(
            "ai_model_configs",
            sa.Column("token_limit", sa.Integer(), nullable=True),
        )


def downgrade() -> None:
    for col in ("token_limit", "dynamic_response", "context_type"):
        op.drop_column("ai_model_configs", col)
