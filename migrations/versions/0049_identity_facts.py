"""Add identity_facts (encrypted reusable identity components for password recipes).

Owner: «رمز از سه رقمِ آخرِ کارت + تاریخِ تولد ساخته می‌شود — همان‌ها را ازم بپرس،
نگه دار، و همیشه فایل‌ها را باز کن». Values are Fernet-encrypted at rest.
Inspector-guarded; SQLite-safe; Render free tier gets it via create_all.

Revision ID: 0049_identity_facts
Revises: 0048_directive_schedule
Create Date: 2026-07-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0049_identity_facts"
down_revision: Union[str, None] = "0048_directive_schedule"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "identity_facts"):
        op.create_table(
            "identity_facts",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True, index=True),
            sa.Column("fact_key", sa.String(length=64), nullable=False, index=True),
            sa.Column("label", sa.String(length=255), nullable=True),
            sa.Column("value_enc", sa.Text(), nullable=False),
            sa.Column("kind", sa.String(length=32), nullable=True),
            sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.UniqueConstraint("user_id", "fact_key", name="uq_identity_fact_user_key"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "identity_facts"):
        op.drop_table("identity_facts")
