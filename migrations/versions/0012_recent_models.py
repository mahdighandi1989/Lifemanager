"""Create tables for the recently added models (audit task 3ea5622b).

Sync the alembic chain with the SQLAlchemy metadata so a fresh deploy
that runs ``alembic upgrade head`` (instead of the Render free-tier
``Base.metadata.create_all`` shortcut) ends up with the same schema.

Tables covered:
  * ai_providers (audit task 1a08ded2)
  * global_analysis_prompts (audit task 1a08ded2)
  * persons (audit task 3cc09436)
  * local_file_entries (audit task 217909d2)
  * incomes / assets / financial_accounts (audit task 4ae4b3ca)
  * user_locations (audit task 2165524b)
  * external_projects (audit task d2146781)
Also adds the ``todo_items.type`` column (audit task 2165524b).

Each step uses an inspector-based existence check so this migration
is idempotent against databases that booted via create_all first.

Revision ID: 0012_recent_models
Revises: 0011_user_profile_columns
Create Date: 2026-05-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0012_recent_models"
down_revision: Union[str, None] = "0011_user_profile_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(bind, name: str) -> bool:
    return sa.inspect(bind).has_table(name)


def _column_exists(bind, table: str, column: str) -> bool:
    inspector = sa.inspect(bind)
    if not inspector.has_table(table):
        return False
    return column in {col["name"] for col in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()

    if not _table_exists(bind, "ai_providers"):
        op.create_table(
            "ai_providers",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    if not _table_exists(bind, "global_analysis_prompts"):
        op.create_table(
            "global_analysis_prompts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("prompt_text", sa.Text(), nullable=False, server_default=""),
            sa.Column("edited_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("last_edited_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _table_exists(bind, "persons"):
        op.create_table(
            "persons",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=True),
            sa.Column("phone", sa.String(length=64), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    if not _table_exists(bind, "local_file_entries"):
        op.create_table(
            "local_file_entries",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), nullable=False, index=True),
            sa.Column("source_path", sa.String(length=1024), nullable=False),
            sa.Column("mime_type", sa.String(length=128), nullable=True),
            sa.Column("size_bytes", sa.Integer(), nullable=True),
            sa.Column("extracted_text", sa.Text(), nullable=True),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("keywords", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    if not _table_exists(bind, "incomes"):
        op.create_table(
            "incomes",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("description", sa.String(length=255), nullable=False),
            sa.Column("amount", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("currency", sa.String(length=8), nullable=False, server_default="USD"),
            sa.Column("received_on", sa.Date(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    if not _table_exists(bind, "assets"):
        op.create_table(
            "assets",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("asset_type", sa.String(length=64), nullable=True),
            sa.Column("value", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("currency", sa.String(length=8), nullable=False, server_default="USD"),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    if not _table_exists(bind, "financial_accounts"):
        op.create_table(
            "financial_accounts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("kind", sa.String(length=32), nullable=False, server_default="bank"),
            sa.Column("institution", sa.String(length=255), nullable=True),
            sa.Column("currency", sa.String(length=8), nullable=False, server_default="USD"),
            sa.Column("balance", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("extra", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    if not _table_exists(bind, "user_locations"):
        op.create_table(
            "user_locations",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("latitude", sa.Float(), nullable=False),
            sa.Column("longitude", sa.Float(), nullable=False),
            sa.Column("accuracy_m", sa.Float(), nullable=True),
            sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _table_exists(bind, "external_projects"):
        op.create_table(
            "external_projects",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("provider", sa.String(length=64), nullable=False),
            sa.Column("external_id", sa.String(length=255), nullable=True),
            sa.Column("base_url", sa.String(length=512), nullable=True),
            sa.Column("api_key", sa.Text(), nullable=True),
            sa.Column("workspace_id", sa.String(length=255), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )

    # todo_items.type column (audit task 2165524b AC 1).
    if not _column_exists(bind, "todo_items", "type"):
        op.add_column(
            "todo_items",
            sa.Column(
                "type",
                sa.String(length=32),
                nullable=False,
                server_default="task",
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _column_exists(bind, "todo_items", "type"):
        op.drop_column("todo_items", "type")
    for tbl in (
        "external_projects",
        "user_locations",
        "financial_accounts",
        "assets",
        "incomes",
        "local_file_entries",
        "persons",
        "global_analysis_prompts",
        "ai_providers",
    ):
        if _table_exists(bind, tbl):
            op.drop_table(tbl)
