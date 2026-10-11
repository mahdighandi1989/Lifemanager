"""app_records — per-user JSON record store for in-repo single-page apps.

Revision ID: 0065_app_records
Revises: 0064_mini_apps
"""
import sqlalchemy as sa
from alembic import op

revision = "0065_app_records"
down_revision = "0064_mini_apps"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "app_records" in sa.inspect(bind).get_table_names():
        return
    op.create_table(
        "app_records",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("app", sa.String(length=64), nullable=False),
        sa.Column("rec_id", sa.String(length=128), nullable=False),
        sa.Column("rtype", sa.String(length=40), nullable=True),
        sa.Column("data", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "app", "rec_id", name="uq_app_records_user_app_rec"),
    )
    op.create_index("ix_app_records_user_id", "app_records", ["user_id"])
    op.create_index("ix_app_records_app", "app_records", ["app"])


def downgrade() -> None:
    bind = op.get_bind()
    if "app_records" in sa.inspect(bind).get_table_names():
        op.drop_index("ix_app_records_app", table_name="app_records")
        op.drop_index("ix_app_records_user_id", table_name="app_records")
        op.drop_table("app_records")
