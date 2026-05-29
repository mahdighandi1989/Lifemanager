"""Create ai_feedback (durable AI like/dislike + 1-5 rating).

Audit task task_97867b277c1b: persist AI-response feedback (was in-process only).
Inspector-guarded create_table; SQLite-safe.

Revision ID: 0025_ai_feedback
Revises: 0024_person_profiles
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0025_ai_feedback"
down_revision: Union[str, None] = "0024_person_profiles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, name: str) -> bool:
    return name in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "ai_feedback"):
        op.create_table(
            "ai_feedback",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("response_ref", sa.String(128), nullable=True),
            sa.Column("liked", sa.Boolean(), nullable=True),
            sa.Column("score", sa.Integer(), nullable=True),
            sa.Column("latency_ms", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_table("ai_feedback")
