"""directives + directive_checkins (موتور نهادینه‌سازی).

New tables for the internalization engine (owner vision 2026-07-21): living
directives extracted from the owner's lists/writings/aspirations, plus a
per-day check-in log. New tables are created by ``Base.metadata.create_all()``
on the Render free tier; this migration is the production (alembic) path.
Inspector-guarded so re-running is a no-op; SQLite-safe.

Revision ID: 0046_directives
Revises: 0045_ai_model_config_drift
Create Date: 2026-07-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0046_directives"
down_revision: Union[str, None] = "0045_ai_model_config_drift"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _has_table(bind, "directives"):
        op.create_table(
            "directives",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True),
            sa.Column("title", sa.Text(), nullable=False),
            sa.Column("detail", sa.Text(), nullable=True),
            sa.Column("domain", sa.String(32), nullable=False, server_default="خودسازی"),
            sa.Column("cadence", sa.String(24), nullable=False, server_default="daily"),
            sa.Column("kind", sa.String(16), nullable=False, server_default="practice"),
            sa.Column("status", sa.String(16), nullable=False, server_default="proposed", index=True),
            sa.Column("strength", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("streak", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("best_streak", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("times_done", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("times_missed", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("weight", sa.Integer(), nullable=False, server_default="3"),
            sa.Column("next_step", sa.Text(), nullable=True),
            sa.Column("source_type", sa.String(32), nullable=True),
            sa.Column("source_ref", sa.String(64), nullable=True),
            sa.Column("last_surfaced_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_done_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("graduated_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
        )
    if not _has_table(bind, "directive_checkins"):
        op.create_table(
            "directive_checkins",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("directive_id", sa.Integer(), sa.ForeignKey("directives.id", ondelete="CASCADE"), nullable=False, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True),
            sa.Column("checkin_date", sa.Date(), nullable=False, index=True),
            sa.Column("surfaced", sa.Boolean(), nullable=False, server_default="1"),
            sa.Column("done", sa.Boolean(), nullable=True),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True)),
            sa.UniqueConstraint("directive_id", "checkin_date", name="uq_directive_checkins_directive_date"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "directive_checkins"):
        op.drop_table("directive_checkins")
    if _has_table(bind, "directives"):
        op.drop_table("directives")
