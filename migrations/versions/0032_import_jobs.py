"""Add the import_jobs table (async AI document-import records).

Backs the Import page's AI-extraction path + import history. The spreadsheet
bulk-import path is synchronous and needs no table. Inspector-guarded;
SQLite-safe.

Revision ID: 0032_import_jobs
Revises: 0031_ai_catalog
Create Date: 2026-06-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0032_import_jobs"
down_revision: Union[str, None] = "0031_ai_catalog"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "import_jobs"):
        op.create_table(
            "import_jobs",
            sa.Column("id", sa.String(32), primary_key=True),
            sa.Column("status", sa.String(12), nullable=False, server_default="running"),
            sa.Column("target", sa.String(40), nullable=True),
            sa.Column("filename", sa.String(300), nullable=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("result_json", sa.Text(), nullable=True),
            sa.Column("error", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    op.drop_table("import_jobs")
