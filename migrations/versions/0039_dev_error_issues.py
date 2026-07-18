"""Add dev_error_issues — persistent per-signature error tracking.

Raw dev_logs age out; each distinct error signature keeps one permanent row
with open/resolved/muted status (auto-resolve when the error stops while the
service keeps logging; recurrence re-opens). Owner request: «خطاها حذف نشن و
اگر رفع شد به‌عنوان رفع‌شده نمایش داده بشن». Inspector-guarded; SQLite-safe.

Revision ID: 0039_dev_error_issues
Revises: 0038_dev_sync
Create Date: 2026-07-18
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0039_dev_error_issues"
down_revision: Union[str, None] = "0038_dev_sync"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "dev_error_issues"):
        op.create_table(
            "dev_error_issues",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column(
                "user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True
            ),
            sa.Column("service_id", sa.String(length=64), nullable=False, index=True),
            sa.Column("service_name", sa.String(length=255), nullable=True),
            sa.Column(
                "dev_project_id",
                sa.Integer(),
                sa.ForeignKey("dev_projects.id"),
                nullable=True,
                index=True,
            ),
            sa.Column(
                "fingerprint", sa.String(length=64), nullable=False, unique=True, index=True
            ),
            sa.Column("title", sa.String(length=300), nullable=False),
            sa.Column("sample_message", sa.Text(), nullable=True),
            sa.Column("level", sa.String(length=16), nullable=False, server_default="error"),
            sa.Column("occurrences", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False, index=True),
            sa.Column(
                "status", sa.String(length=16), nullable=False, server_default="open", index=True
            ),
            sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("resolved_by", sa.String(length=16), nullable=True),
            sa.Column("reopened_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "dev_error_issues"):
        op.drop_table("dev_error_issues")
