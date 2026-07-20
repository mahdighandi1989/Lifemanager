"""ai_usage_logs — حسابداری مصرف AI (phase 1).

One row per catalog-gateway inference call so the owner can see which
automation spends how much of their personal Claude subscription.
Inspector-guarded; SQLite-safe; Render free tier gets it via create_all.

Revision ID: 0042_ai_usage_logs
Revises: 0041_soft_delete_payload_before
Create Date: 2026-07-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0042_ai_usage_logs"
down_revision: Union[str, None] = "0041_soft_delete_payload_before"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "ai_usage_logs"):
        return
    op.create_table(
        "ai_usage_logs",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("task", sa.String(64), nullable=False, index=True),
        sa.Column("model", sa.String(160), nullable=True),
        sa.Column("provider", sa.String(64), nullable=True),
        sa.Column("ok", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("error", sa.String(300), nullable=True),
        sa.Column("prompt_chars", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("output_chars", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            index=True,
        ),
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "ai_usage_logs"):
        op.drop_table("ai_usage_logs")
