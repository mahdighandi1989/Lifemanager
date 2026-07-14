"""Add the brain_uploads table (رشد ذهن و هوش — cognitive data exports).

One row per uploaded cognitive-training export (e.g. Brilliant.org zip),
holding the parsed stats summary + the ownership-verification flag. Inspector-
guarded; SQLite-safe; Render free tier gets it via create_all.

Revision ID: 0034_brain_uploads
Revises: 0033_personal_writings
Create Date: 2026-07-14
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0034_brain_uploads"
down_revision: Union[str, None] = "0033_personal_writings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "brain_uploads"):
        return
    op.create_table(
        "brain_uploads",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("source", sa.String(length=64), nullable=False, server_default="brilliant"),
        sa.Column("filename", sa.String(length=255), nullable=True),
        sa.Column("via", sa.String(length=32), nullable=False, server_default="dashboard"),
        sa.Column("verified_owner", sa.Boolean(), nullable=True),
        sa.Column("owner_email", sa.String(length=255), nullable=True),
        sa.Column("stats_json", sa.Text(), nullable=False),
        sa.Column("analysis_note", sa.Text(), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "brain_uploads"):
        op.drop_table("brain_uploads")
