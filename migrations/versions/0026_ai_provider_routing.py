"""Add ai_providers.base_url / api_key_encrypted / default_model.

Audit task 1a08ded2 (AC5/7): per-provider routing config + encrypted-at-rest
API key so registered providers actually drive the analysis call. Inspector-
guarded add_column; SQLite-safe (nullable).

Revision ID: 0026_ai_provider_routing
Revises: 0025_ai_feedback
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0026_ai_provider_routing"
down_revision: Union[str, None] = "0025_ai_feedback"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(bind, table: str, col: str) -> bool:
    if table not in sa.inspect(bind).get_table_names():
        return False
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_column(bind, "ai_providers", "base_url"):
        op.add_column("ai_providers", sa.Column("base_url", sa.String(512), nullable=True))
    if not _has_column(bind, "ai_providers", "api_key_encrypted"):
        op.add_column("ai_providers", sa.Column("api_key_encrypted", sa.Text(), nullable=True))
    if not _has_column(bind, "ai_providers", "default_model"):
        op.add_column("ai_providers", sa.Column("default_model", sa.String(120), nullable=True))


def downgrade() -> None:
    for col in ("default_model", "api_key_encrypted", "base_url"):
        op.drop_column("ai_providers", col)
