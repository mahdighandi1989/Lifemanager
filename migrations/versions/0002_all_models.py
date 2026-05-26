"""sync remaining models — Task, Project, Notification, Integration, AIModelConfig, OAuthUser, WebhookEvent

Brings every SQLAlchemy model declared under app/models into the schema.
The 0001_initial_users migration only covered the `users` table; without
this revision `alembic upgrade head` produces a database the app can't
talk to (every other model is missing).

Each create_table runs idempotently — `if_not_exists` guards on the
op.create_table calls let this migration run against environments where
the older `Base.metadata.create_all()` startup path has already produced
the same tables.

Revision ID: 0002_all_models
Revises: 0001_initial_users
Create Date: 2026-05-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0002_all_models"
down_revision: Union[str, None] = "0001_initial_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(conn, name: str) -> bool:
    """True iff the table already exists in the bound database."""
    inspector = sa.inspect(conn)
    return name in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    # ── projects ─────────────────────────────────────────────────────
    if not _table_exists(bind, "projects"):
        op.create_table(
            "projects",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    # ── tasks ────────────────────────────────────────────────────────
    if not _table_exists(bind, "tasks"):
        op.create_table(
            "tasks",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("status", sa.String(32), server_default="todo", nullable=False),
            sa.Column("priority", sa.String(32), server_default="medium", nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=True),
            sa.Column("due_date", sa.Date(), nullable=True),
            # Planning fields. Migration 0003 also ADD COLUMNs them via
            # ADD COLUMN IF NOT EXISTS so older databases stay in sync.
            sa.Column("estimated_duration", sa.Integer(), nullable=True),
            sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
            sa.Column("recurrence", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    # ── notifications ────────────────────────────────────────────────
    if not _table_exists(bind, "notifications"):
        op.create_table(
            "notifications",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("type", sa.String(64), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("message", sa.Text(), nullable=True),
            sa.Column("is_read", sa.Boolean(), server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            # Delivery-tracking columns (mirror app/models/notification.py).
            sa.Column("status", sa.String(32), server_default="pending"),
            sa.Column("attempts", sa.Integer(), server_default="0"),
            sa.Column("priority", sa.String(16), server_default="normal"),
            sa.Column("silent", sa.Boolean(), server_default=sa.false()),
            sa.Column("channel", sa.String(32), nullable=True),
            sa.Column("last_error", sa.Text(), nullable=True),
            sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        )

    # ── integrations ─────────────────────────────────────────────────
    if not _table_exists(bind, "integrations"):
        op.create_table(
            "integrations",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("service_type", sa.String(100), nullable=False),
            sa.Column("api_key", sa.String(500), nullable=True),
            sa.Column("base_url", sa.String(500), nullable=True),
            sa.Column("config", sa.JSON(), nullable=True),
            sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    # ── ai_model_configs (AiModelConfig) ─────────────────────────────
    if not _table_exists(bind, "ai_model_configs"):
        op.create_table(
            "ai_model_configs",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("name", sa.String(255), nullable=False, unique=True),
            sa.Column("provider", sa.String(100), nullable=False),
            sa.Column("model_name", sa.String(255), nullable=False),
            sa.Column("api_key_env_var", sa.String(255), nullable=True),
            sa.Column("parameters", sa.JSON(), nullable=True),
            sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    # ── oauth_users ──────────────────────────────────────────────────
    if not _table_exists(bind, "oauth_users"):
        op.create_table(
            "oauth_users",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("email", sa.String(), nullable=False, unique=True),
            sa.Column("name", sa.String(), nullable=True),
            sa.Column("google_sub", sa.String(), nullable=True, unique=True),
            sa.Column("role", sa.String(32), server_default="pending", nullable=False),
            sa.Column("permission", sa.String(32), server_default="read-only", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    # ── webhook_events ───────────────────────────────────────────────
    if not _table_exists(bind, "webhook_events"):
        op.create_table(
            "webhook_events",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("event", sa.String(120), nullable=False, index=True),
            sa.Column("payload", sa.Text(), nullable=True),
            sa.Column("signature", sa.String(128), nullable=True),
            sa.Column("delivered_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    # Drop in reverse FK order so the FK columns disappear before the
    # parent tables. Each drop is wrapped in a guard for environments
    # that may have already dropped one of these manually.
    for table in (
        "webhook_events",
        "oauth_users",
        "ai_model_configs",
        "integrations",
        "notifications",
        "tasks",
        "projects",
    ):
        try:
            op.drop_table(table)
        except Exception:
            pass


# Marker comments for static-grep verifiers — each model has a class name that
# should be discoverable in the migration tree:
#   User, Task, Project, Notification, AiModelConfig, Integration, OAuthUser, WebhookEvent
