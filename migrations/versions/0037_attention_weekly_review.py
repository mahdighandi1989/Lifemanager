"""Add attention_marks + weekly_reviews (موتور توجه + مرور هفتگی — phases 3-4).

attention_marks is the attention engine's dedup/cooldown memory (one row
per alerted rule:entity pair); weekly_reviews stores the generated
weekly reports (7-day window, stats JSON, AI narrative + provenance).
Inspector-guarded; SQLite-safe; Render free tier gets both via
create_all.

Revision ID: 0037_attention_weekly_review
Revises: 0036_inbox_items
Create Date: 2026-07-18
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0037_attention_weekly_review"
down_revision: Union[str, None] = "0036_inbox_items"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "attention_marks"):
        op.create_table(
            "attention_marks",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), nullable=True, index=True),
            sa.Column("dedup_key", sa.String(length=128), nullable=False, index=True),
            sa.Column("rule", sa.String(length=50), nullable=False, index=True),
            sa.Column(
                "last_sent_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
        )
    if not _has_table(bind, "weekly_reviews"):
        op.create_table(
            "weekly_reviews",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), nullable=True, index=True),
            sa.Column("week_start", sa.Date(), nullable=False, index=True),
            sa.Column("week_end", sa.Date(), nullable=False),
            sa.Column("stats", sa.JSON(), nullable=True),
            sa.Column("narrative", sa.Text(), nullable=True),
            sa.Column("ai_model", sa.String(length=120), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                index=True,
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "weekly_reviews"):
        op.drop_table("weekly_reviews")
    if _has_table(bind, "attention_marks"):
        op.drop_table("attention_marks")
