"""Add the AI catalog tables (providers / models / task-routes).

The "complete AI settings" surface ported from the ALLIN1 design: a curated
catalog of providers, the models each offers (tagged with capabilities), and
per-application task routes. Sits alongside the legacy per-user ``ai_providers``
/ ``ai_model_configs`` tables (kept). Inspector-guarded so re-running is a no-op;
SQLite-safe (used by the migration test-suite).

Revision ID: 0031_ai_catalog
Revises: 0030_vehicle_rta_neteller_bank
Create Date: 2026-06-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0031_ai_catalog"
down_revision: Union[str, None] = "0030_vehicle_rta_neteller_bank"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_table(bind, "ai_catalog_providers"):
        op.create_table(
            "ai_catalog_providers",
            sa.Column("key", sa.String(40), primary_key=True),
            sa.Column("display_name", sa.String(120), nullable=False),
            sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("auth_scheme", sa.String(20), nullable=False, server_default="api_key"),
            sa.Column("api_key_encrypted", sa.Text(), nullable=True),
            sa.Column("base_url", sa.String(255), nullable=True),
            sa.Column("env_key", sa.String(64), nullable=True),
            sa.Column("recommended", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _has_table(bind, "ai_catalog_models"):
        op.create_table(
            "ai_catalog_models",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("model_key", sa.String(120), nullable=False, unique=True, index=True),
            sa.Column("api_model_id", sa.String(120), nullable=True),
            sa.Column(
                "provider_key",
                sa.String(40),
                sa.ForeignKey("ai_catalog_providers.key"),
                nullable=False,
                index=True,
            ),
            sa.Column("display_name", sa.String(120), nullable=False),
            sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("capabilities", sa.JSON(), nullable=False, server_default="[]"),
            sa.Column("max_output_tokens", sa.Integer(), nullable=True),
            sa.Column("context_window", sa.Integer(), nullable=True),
            sa.Column("temperature", sa.Float(), nullable=True),
            sa.Column("priority", sa.Integer(), nullable=False, server_default="5"),
            sa.Column("input_cost_per_1m", sa.Float(), nullable=True),
            sa.Column("output_cost_per_1m", sa.Float(), nullable=True),
            sa.Column("source", sa.String(12), nullable=False, server_default="catalog"),
            sa.Column("is_custom", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _has_table(bind, "ai_task_routes"):
        op.create_table(
            "ai_task_routes",
            sa.Column("task", sa.String(60), primary_key=True),
            sa.Column(
                "model_id",
                sa.Integer(),
                sa.ForeignKey("ai_catalog_models.id", ondelete="SET NULL"),
                nullable=True,
            ),
            sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_table("ai_task_routes")
    op.drop_table("ai_catalog_models")
    op.drop_table("ai_catalog_providers")
