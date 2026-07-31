"""clarifications — the two-way clarification form (Telegram ↔ AI).

Revision ID: 0055_clarifications
Revises: 0054_activity_occurred_at
"""
import sqlalchemy as sa
from alembic import op

revision = "0055_clarifications"
down_revision = "0054_activity_occurred_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "clarifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("topic", sa.String(length=300), nullable=False),
        sa.Column("context", sa.Text(), nullable=True),
        sa.Column("source", sa.String(length=48), nullable=True),
        sa.Column("source_ref", sa.String(length=191), nullable=True),
        sa.Column("target", sa.JSON(), nullable=True),
        sa.Column("questions", sa.JSON(), nullable=True),
        sa.Column("answers", sa.JSON(), nullable=True),
        sa.Column("result", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="open"),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("snoozed_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("chat_id", sa.String(length=64), nullable=True),
        sa.Column("message_id", sa.String(length=32), nullable=True),
        sa.Column("ai_model", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("filed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_clarifications_user_id", "clarifications", ["user_id"])
    op.create_index("ix_clarifications_source", "clarifications", ["source"])
    op.create_index("ix_clarifications_source_ref", "clarifications", ["source_ref"])
    op.create_index("ix_clarifications_status", "clarifications", ["status"])
    op.create_index("ix_clarifications_message_id", "clarifications", ["message_id"])


def downgrade() -> None:
    op.drop_table("clarifications")
