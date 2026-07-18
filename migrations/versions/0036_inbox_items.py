"""Add the inbox_items table (صندوق ورودی همه‌چیز — universal capture inbox).

One row per raw captured thought/errand/name from the web quick-box or
Telegram /inbox, with the AI triage suggestion (JSON) and the
filed-entity pointer once the row is turned into a real task / todo /
note / person. Inspector-guarded; SQLite-safe; Render free tier gets it
via create_all.

Revision ID: 0036_inbox_items
Revises: 0035_activity_logs
Create Date: 2026-07-18
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0036_inbox_items"
down_revision: Union[str, None] = "0035_activity_logs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "inbox_items"):
        return
    op.create_table(
        "inbox_items",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), nullable=True, index=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False, server_default="web"),
        sa.Column(
            "status", sa.String(length=32), nullable=False, server_default="pending", index=True
        ),
        sa.Column("suggested_type", sa.String(length=32), nullable=True),
        sa.Column("suggestion", sa.JSON(), nullable=True),
        sa.Column("ai_model", sa.String(length=120), nullable=True),
        sa.Column("filed_entity_type", sa.String(length=50), nullable=True),
        sa.Column("filed_entity_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            index=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "inbox_items"):
        op.drop_table("inbox_items")
