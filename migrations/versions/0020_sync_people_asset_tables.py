"""Sync the remaining people/behavior/asset model tables into the alembic chain.

These six models shipped without a migration, so a migration-driven deploy
(unlike the startup create_all path) left them uncreated — failing
test_migration::test_tables_match_models in the full suite:

  interactions, ai_assessments, behavior_logs, user_comments,
  user_assets, indexed_data_source_entries

Created here in FK-dependency order, each guarded by an inspector check so it
co-exists idempotently with the startup create_all path.

Revision ID: 0020_sync_people_asset_tables
Revises: 0019_task_features_tables
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0020_sync_people_asset_tables"
down_revision: Union[str, None] = "0019_task_features_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, name: str) -> bool:
    return name in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_table(bind, "interactions"):
        op.create_table(
            "interactions",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("person_id", sa.Integer(), sa.ForeignKey("persons.id"), nullable=False, index=True),
            sa.Column("type", sa.String(32), nullable=False, server_default="other"),
            sa.Column("date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("summary", sa.String(512), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "ai_assessments"):
        op.create_table(
            "ai_assessments",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("person_id", sa.Integer(), sa.ForeignKey("persons.id"), nullable=False, index=True),
            sa.Column("interaction_id", sa.Integer(), sa.ForeignKey("interactions.id"), nullable=True, index=True),
            sa.Column("score", sa.Float(), nullable=True),
            sa.Column("sentiment", sa.String(32), nullable=True),
            sa.Column("analysis_text", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _has_table(bind, "behavior_logs"):
        op.create_table(
            "behavior_logs",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("person_id", sa.Integer(), sa.ForeignKey("persons.id"), nullable=False, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
            sa.Column("behavior_type", sa.String(32), nullable=False, server_default="neutral"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("observed_date", sa.Date(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _has_table(bind, "user_comments"):
        op.create_table(
            "user_comments",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
            sa.Column("person_id", sa.Integer(), sa.ForeignKey("persons.id"), nullable=True, index=True),
            sa.Column("interaction_id", sa.Integer(), sa.ForeignKey("interactions.id"), nullable=True, index=True),
            sa.Column("comment_text", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _has_table(bind, "user_assets"):
        op.create_table(
            "user_assets",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("asset_type", sa.String(64), nullable=True),
            sa.Column("name", sa.String(512), nullable=False),
            sa.Column("path", sa.String(1024), nullable=True),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("last_scanned_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "indexed_data_source_entries"):
        op.create_table(
            "indexed_data_source_entries",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
            sa.Column("source_path", sa.String(1024), nullable=False),
            sa.Column("checksum", sa.String(128), nullable=True),
            sa.Column("last_modified", sa.DateTime(timezone=True), nullable=True),
            sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("associated_todo_list_id", sa.Integer(), sa.ForeignKey("todo_lists.id"), nullable=True),
        )


def downgrade() -> None:
    for name in (
        "indexed_data_source_entries",
        "user_assets",
        "user_comments",
        "behavior_logs",
        "ai_assessments",
        "interactions",
    ):
        op.drop_table(name)
