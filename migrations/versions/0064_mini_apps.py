"""mini_apps — owner-attached HTML apps rendered as pages (data, not code).

Revision ID: 0064_mini_apps
Revises: 0063_inspection_drive
"""
import sqlalchemy as sa
from alembic import op

revision = "0064_mini_apps"
down_revision = "0063_inspection_drive"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "mini_apps" in sa.inspect(bind).get_table_names():
        return
    op.create_table(
        "mini_apps",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(length=60), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("icon", sa.String(length=8), nullable=True),
        sa.Column("group", sa.String(length=20), nullable=True),
        sa.Column("after", sa.String(length=80), nullable=True),
        sa.Column("source_file_id", sa.String(length=40), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=True),
        sa.Column("report_number", sa.Integer(), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=True),
        sa.Column("created_by", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_mini_apps_slug", "mini_apps", ["slug"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    if "mini_apps" in sa.inspect(bind).get_table_names():
        op.drop_table("mini_apps")
