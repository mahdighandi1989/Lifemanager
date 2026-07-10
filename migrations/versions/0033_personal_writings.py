"""Add the personal_writings table (نوشته‌های من — long-form personal writings).

Home for whole documents that must not be scattered into list items (the
spiritual autobiography, the goals-with-philosophy document, future essays).
Inspector-guarded; SQLite-safe. Render's free tier gets the table via
Base.metadata.create_all — this migration is the production/alembic path.

Revision ID: 0033_personal_writings
Revises: 0032_import_jobs
Create Date: 2026-07-10
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0033_personal_writings"
down_revision: Union[str, None] = "0032_import_jobs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "personal_writings"):
        return
    op.create_table(
        "personal_writings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=True, index=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("source_note", sa.String(length=500), nullable=True),
        sa.Column("written_at", sa.Date(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "personal_writings"):
        op.drop_table("personal_writings")
