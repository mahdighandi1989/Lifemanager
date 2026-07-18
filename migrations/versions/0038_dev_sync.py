"""Add dev-sync tables («مرکز توسعه» — GitHub repos + Render services/logs).

dev_integrations (encrypted GitHub/Render tokens), dev_projects (synced
repos, soft-linked to life projects), dev_services (Render services),
dev_logs (short-retention raw lines), dev_log_summaries (Persian daily
digests). Inspector-guarded; SQLite-safe; Render free tier gets all five
via create_all.

Revision ID: 0038_dev_sync
Revises: 0037_attention_weekly_review
Create Date: 2026-07-18
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0038_dev_sync"
down_revision: Union[str, None] = "0037_attention_weekly_review"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "dev_integrations"):
        op.create_table(
            "dev_integrations",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("provider", sa.String(length=32), nullable=False, index=True),
            sa.Column("api_key_encrypted", sa.Text(), nullable=True),
            sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_sync_ok", sa.Boolean(), nullable=True),
            sa.Column("last_sync_error", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
    if not _has_table(bind, "dev_projects"):
        op.create_table(
            "dev_projects",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column(
                "provider", sa.String(length=32), nullable=False, server_default="github"
            ),
            sa.Column("repo_full_name", sa.String(length=255), nullable=False, index=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("html_url", sa.String(length=512), nullable=True),
            sa.Column("default_branch", sa.String(length=120), nullable=True),
            sa.Column("language", sa.String(length=80), nullable=True),
            sa.Column("is_private", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("pushed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("stars", sa.Integer(), nullable=True),
            sa.Column("forks", sa.Integer(), nullable=True),
            sa.Column("open_issues", sa.Integer(), nullable=True),
            sa.Column("topics", sa.JSON(), nullable=True),
            sa.Column("linked_project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("extra", sa.JSON(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
    if not _has_table(bind, "dev_services"):
        op.create_table(
            "dev_services",
            sa.Column("id", sa.String(length=64), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("service_type", sa.String(length=64), nullable=True),
            sa.Column("status", sa.String(length=64), nullable=True),
            sa.Column("service_url", sa.String(length=512), nullable=True),
            sa.Column("dashboard_url", sa.String(length=512), nullable=True),
            sa.Column("repo_url", sa.String(length=512), nullable=True),
            sa.Column("branch", sa.String(length=120), nullable=True),
            sa.Column("dev_project_id", sa.Integer(), sa.ForeignKey("dev_projects.id"), nullable=True, index=True),
            sa.Column(
                "auto_fetch_logs", sa.Boolean(), nullable=False, server_default=sa.true()
            ),
            sa.Column("last_log_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("extra", sa.JSON(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
    if not _has_table(bind, "dev_logs"):
        op.create_table(
            "dev_logs",
            sa.Column("id", sa.String(length=64), primary_key=True),
            sa.Column("service_id", sa.String(length=64), nullable=False, index=True),
            sa.Column("service_name", sa.String(length=255), nullable=True),
            sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, index=True),
            sa.Column(
                "level", sa.String(length=16), nullable=False, server_default="info", index=True
            ),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column(
                "fetched_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
        )
        op.create_index("ix_dev_logs_service_ts", "dev_logs", ["service_id", "timestamp"])
        op.create_index("ix_dev_logs_level_ts", "dev_logs", ["level", "timestamp"])
    if not _has_table(bind, "dev_log_summaries"):
        op.create_table(
            "dev_log_summaries",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("dev_project_id", sa.Integer(), sa.ForeignKey("dev_projects.id"), nullable=True, index=True),
            sa.Column("service_id", sa.String(length=64), nullable=True, index=True),
            sa.Column("service_name", sa.String(length=255), nullable=True),
            sa.Column("summary_date", sa.Date(), nullable=False, index=True),
            sa.Column("summary", sa.Text(), nullable=False),
            sa.Column("stats", sa.JSON(), nullable=True),
            sa.Column("ai_model", sa.String(length=120), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index(
            "ix_dev_log_summaries_service_date",
            "dev_log_summaries",
            ["service_id", "summary_date"],
        )


def downgrade() -> None:
    bind = op.get_bind()
    for table in (
        "dev_log_summaries",
        "dev_logs",
        "dev_services",
        "dev_projects",
        "dev_integrations",
    ):
        if _has_table(bind, table):
            op.drop_table(table)
