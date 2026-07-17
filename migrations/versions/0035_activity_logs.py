"""Add the activity_logs table (لاگ فعالیت‌ها — runtime audit trail).

One append-only row per notable user action across the app, with a
two-level link: entity_type/entity_id for the acted-on record and
context_type/context_id for its owning profile/section (a todo item's
list, a deed's person, a transaction's account). Inspector-guarded;
SQLite-safe; Render free tier gets it via create_all.

Revision ID: 0035_activity_logs
Revises: 0034_brain_uploads
Create Date: 2026-07-17
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0035_activity_logs"
down_revision: Union[str, None] = "0034_brain_uploads"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "activity_logs"):
        return
    op.create_table(
        "activity_logs",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), nullable=True, index=True),
        sa.Column("action", sa.String(length=50), nullable=False, index=True),
        sa.Column("entity_type", sa.String(length=50), nullable=True, index=True),
        sa.Column("entity_id", sa.String(length=64), nullable=True, index=True),
        sa.Column("entity_label", sa.String(length=255), nullable=True),
        sa.Column("context_type", sa.String(length=50), nullable=True, index=True),
        sa.Column("context_id", sa.String(length=64), nullable=True, index=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            index=True,
        ),
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "activity_logs"):
        op.drop_table("activity_logs")
