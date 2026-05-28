"""Create the drive_files table (audit task 7367c6f0 model, synced under 3ea5622b).

The DriveFile model (app/models/drive_file.py) landed without a matching
migration, so `alembic upgrade head` left Base.metadata out of sync with the
migrated schema (tests/test_migrations.py::test_all_tables_created). This adds
the table so the alembic chain and create_all converge. Idempotent via
_table_exists so a DB already carrying the table (created by startup
create_all) upgrades cleanly.

Revision ID: 0013_drive_files
Revises: 0012_recent_models
Create Date: 2026-05-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0013_drive_files"
down_revision: Union[str, None] = "0012_recent_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(bind, name: str) -> bool:
    inspector = sa.inspect(bind)
    return inspector.has_table(name)


def upgrade() -> None:
    bind = op.get_bind()
    if not _table_exists(bind, "drive_files"):
        op.create_table(
            "drive_files",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("filename", sa.String(length=512), nullable=False),
            sa.Column("mime_type", sa.String(length=128), nullable=True),
            sa.Column("drive_file_id", sa.String(length=255), nullable=True),
            sa.Column("drive_link", sa.String(length=1024), nullable=True),
            sa.Column("storage_tier", sa.String(length=16), nullable=False, server_default="hot"),
            sa.Column("extracted_text", sa.Text(), nullable=True),
            sa.Column("migrated_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _table_exists(bind, "drive_files"):
        op.drop_table("drive_files")
