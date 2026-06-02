"""Add analysis_prompts table.

Audit task 1a08ded2 (AC 23-24): admin-managed global analysis prompt, kept
separate from the per-user global_analysis_prompts row. Inspector-guarded so
re-running on an existing DB is a no-op; SQLite-safe for the test engine.

Revision ID: 0028_analysis_prompt
Revises: 0027_oversight_time_budget
Create Date: 2026-06-02
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0028_analysis_prompt"
down_revision: Union[str, None] = "0027_oversight_time_budget"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "analysis_prompts"):
        op.create_table(
            "analysis_prompts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("prompt_text", sa.Text(), nullable=False, server_default=""),
            sa.Column(
                "edited_by_user_id",
                sa.Integer(),
                sa.ForeignKey("users.id"),
                nullable=True,
            ),
            sa.Column(
                "last_edited_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
            ),
        )


def downgrade() -> None:
    op.drop_table("analysis_prompts")
