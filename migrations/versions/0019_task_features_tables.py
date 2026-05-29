"""Create tables for the feature work in tasks 1a08ded2 / 4ae4b3ca / 2165524b / d2146781.

Adds the seven model tables introduced while completing those tasks so the
alembic chain matches Base.metadata (the startup create_all path already grows
them on Render's free tier; this keeps a migration-driven deploy in sync):

  * transactions, budget_plans                     (finance — 4ae4b3ca)
  * user_contexts, contextual_recommendations      (smart assistant — 2165524b)
  * global_settings                                (AI settings — 1a08ded2)
  * external_project_connections, oversight_tasks  (oversight — d2146781)

Each create_table is guarded by an inspector check so a DB that already grew
the table (via startup create_all) upgrades cleanly and idempotently.

Revision ID: 0019_task_features_tables
Revises: 0018_task_merge_fields
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0019_task_features_tables"
down_revision: Union[str, None] = "0018_task_merge_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, name: str) -> bool:
    return name in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_table(bind, "transactions"):
        op.create_table(
            "transactions",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column(
                "account_id",
                sa.Integer(),
                sa.ForeignKey("financial_accounts.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column("amount", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("transaction_type", sa.String(16), nullable=False, server_default="expense"),
            sa.Column("description", sa.String(255), nullable=True),
            sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _has_table(bind, "budget_plans"):
        op.create_table(
            "budget_plans",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("total_budget", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("remaining_budget", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("period", sa.String(16), nullable=False, server_default="monthly"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "user_contexts"):
        op.create_table(
            "user_contexts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("current_location", sa.JSON(), nullable=True),
            sa.Column("last_activity_time", sa.DateTime(timezone=True), nullable=True),
            sa.Column("heart_rate", sa.Integer(), nullable=True),
            sa.Column("activity_status", sa.String(32), nullable=True),
            sa.Column("mood", sa.String(32), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "contextual_recommendations"):
        op.create_table(
            "contextual_recommendations",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column(
                "task_id",
                sa.Integer(),
                sa.ForeignKey("tasks.id", ondelete="SET NULL"),
                nullable=True,
                index=True,
            ),
            sa.Column("recommendation_type", sa.String(32), nullable=False, server_default="behavioral"),
            sa.Column("text", sa.Text(), nullable=True),
            sa.Column("context_snapshot", sa.JSON(), nullable=True),
            sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        )

    if not _has_table(bind, "global_settings"):
        op.create_table(
            "global_settings",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("key", sa.String(128), nullable=False, unique=True, index=True),
            sa.Column("value", sa.Text(), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _has_table(bind, "external_project_connections"):
        op.create_table(
            "external_project_connections",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("base_url", sa.String(512), nullable=True),
            sa.Column("api_key_encrypted", sa.Text(), nullable=True),
            sa.Column("connection_type", sa.String(64), nullable=False, server_default="generic"),
            sa.Column("sync_frequency", sa.String(32), nullable=False, server_default="manual"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "oversight_tasks"):
        op.create_table(
            "oversight_tasks",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column(
                "external_project_id",
                sa.Integer(),
                sa.ForeignKey("external_project_connections.id", ondelete="CASCADE"),
                nullable=True,
                index=True,
            ),
            sa.Column("task_type", sa.String(64), nullable=False, server_default="review"),
            sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
            sa.Column("priority", sa.String(16), nullable=False, server_default="normal"),
            sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("analysis_result", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    for name in (
        "oversight_tasks",
        "external_project_connections",
        "global_settings",
        "contextual_recommendations",
        "user_contexts",
        "budget_plans",
        "transactions",
    ):
        op.drop_table(name)
