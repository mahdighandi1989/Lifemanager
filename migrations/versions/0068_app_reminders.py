"""app_reminders — Telegram / e-mail follow-ups requested by in-repo apps.

Revision ID: 0068_app_reminders
Revises: 0067_app_files
"""
import sqlalchemy as sa
from alembic import op

revision = "0068_app_reminders"
down_revision = "0067_app_files"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "app_reminders" in sa.inspect(bind).get_table_names():
        return _sends(bind)
    op.create_table(
        "app_reminders",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("app", sa.String(length=64), nullable=False),
        sa.Column("rkey", sa.String(length=160), nullable=False),
        sa.Column("due_date", sa.String(length=10), nullable=False),
        sa.Column("hour", sa.Integer(), nullable=True),
        sa.Column("tz", sa.String(length=64), nullable=True),
        sa.Column("send_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("link", sa.String(length=500), nullable=True),
        sa.Column("channels", sa.String(length=40), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=True),
        sa.Column("result", sa.Text(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "app", "rkey", name="uq_app_reminders_user_app_key"),
    )
    for col in ("user_id", "app", "send_at", "status"):
        op.create_index("ix_app_reminders_" + col, "app_reminders", [col])
    _sends(bind)


def _sends(bind) -> None:
    if "app_reminder_sends" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "app_reminder_sends",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("app", sa.String(length=64), nullable=False),
            sa.Column("rkey", sa.String(length=160), nullable=False),
            sa.Column("at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("result", sa.Text(), nullable=True),
        )
        for col in ("user_id", "app", "at"):
            op.create_index("ix_app_reminder_sends_" + col, "app_reminder_sends", [col])


def downgrade() -> None:
    bind = op.get_bind()
    if "app_reminder_sends" in sa.inspect(bind).get_table_names():
        for col in ("at", "app", "user_id"):
            op.drop_index("ix_app_reminder_sends_" + col, table_name="app_reminder_sends")
        op.drop_table("app_reminder_sends")
    if "app_reminders" in sa.inspect(bind).get_table_names():
        for col in ("status", "send_at", "app", "user_id"):
            op.drop_index("ix_app_reminders_" + col, table_name="app_reminders")
        op.drop_table("app_reminders")
