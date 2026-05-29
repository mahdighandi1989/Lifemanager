"""Add drive_files.storage_location + last_accessed_at (cold-tiering).

Audit task 7367c6f0 (AC3/AC4): ``storage_location`` (local|drive) tells the
file route where the blob lives; ``last_accessed_at`` is the timestamp the
30-day cold-tiering policy keys off. Inspector-guarded, SQLite-safe.

Revision ID: 0023_drive_file_storage_location
Revises: 0022_profile_interest_personality
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0023_drive_file_storage_location"
down_revision: Union[str, None] = "0022_profile_interest_personality"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, col: str) -> bool:
    if table not in sa.inspect(bind).get_table_names():
        return False
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "drive_files", "storage_location"):
        op.add_column(
            "drive_files",
            sa.Column("storage_location", sa.String(16), nullable=False, server_default="local"),
        )
    if not _has_column(bind, "drive_files", "last_accessed_at"):
        op.add_column(
            "drive_files",
            sa.Column("last_accessed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_column("drive_files", "last_accessed_at")
    op.drop_column("drive_files", "storage_location")
