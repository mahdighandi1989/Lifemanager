"""Add personal_emails + personal_events (Gmail/Calendar mirror).

Owner request: the app should periodically read email + calendar through
the existing Google connection, analyze, remind, and file tasks.
Inspector-guarded; SQLite-safe; Render free tier gets both via create_all.

Revision ID: 0040_personal_sync
Revises: 0039_dev_error_issues
Create Date: 2026-07-19
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0040_personal_sync"
down_revision: Union[str, None] = "0039_dev_error_issues"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "personal_emails"):
        op.create_table(
            "personal_emails",
            sa.Column("id", sa.String(length=32), primary_key=True),
            sa.Column("thread_id", sa.String(length=32), nullable=True, index=True),
            sa.Column("from_addr", sa.String(length=512), nullable=True),
            sa.Column("subject", sa.Text(), nullable=True),
            sa.Column("snippet", sa.Text(), nullable=True),
            sa.Column("received_at", sa.DateTime(timezone=True), nullable=True, index=True),
            sa.Column("is_unread", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("labels", sa.JSON(), nullable=True),
            sa.Column("ai_category", sa.String(length=32), nullable=True, index=True),
            sa.Column("ai_summary", sa.Text(), nullable=True),
            sa.Column(
                "needs_action", sa.Boolean(), nullable=False, server_default=sa.false(), index=True
            ),
            sa.Column("suggested_task", sa.String(length=255), nullable=True),
            sa.Column("analyzed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("ai_model", sa.String(length=120), nullable=True),
            sa.Column("task_id", sa.Integer(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
    if not _has_table(bind, "personal_events"):
        op.create_table(
            "personal_events",
            sa.Column("id", sa.String(length=128), primary_key=True),
            sa.Column("calendar_id", sa.String(length=255), nullable=True),
            sa.Column("summary", sa.String(length=512), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("location", sa.String(length=512), nullable=True),
            sa.Column("start_at", sa.DateTime(timezone=True), nullable=True, index=True),
            sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("all_day", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("status", sa.String(length=32), nullable=True),
            sa.Column("html_link", sa.String(length=1024), nullable=True),
            sa.Column("task_id", sa.Integer(), nullable=True),
            sa.Column("synced_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    for table in ("personal_events", "personal_emails"):
        if _has_table(bind, table):
            op.drop_table(table)
