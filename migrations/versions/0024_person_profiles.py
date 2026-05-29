"""Create person_profiles (audit task 3cc09436).

One behavioural profile per Person: ai_score, user_notes, behavior_log,
relationship_type, last_analyzed_at. Inspector-guarded create_table so a DB
already grown by startup create_all upgrades cleanly. SQLite-safe.

Revision ID: 0024_person_profiles
Revises: 0023_drive_file_storage_location
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0024_person_profiles"
down_revision: Union[str, None] = "0023_drive_file_storage_location"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, name: str) -> bool:
    return name in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "person_profiles"):
        op.create_table(
            "person_profiles",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column(
                "person_id",
                sa.Integer(),
                sa.ForeignKey("persons.id", ondelete="CASCADE"),
                unique=True,
                index=True,
                nullable=False,
            ),
            sa.Column("ai_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("user_notes", sa.Text(), nullable=True),
            sa.Column("behavior_log", sa.JSON(), nullable=True),
            sa.Column("relationship_type", sa.String(32), nullable=False, server_default="neutral"),
            sa.Column("last_analyzed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    op.drop_table("person_profiles")
