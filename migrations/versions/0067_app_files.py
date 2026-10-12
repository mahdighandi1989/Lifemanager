"""app_files — pointers to app-record attachments stored in Google Drive.

Revision ID: 0067_app_files
Revises: 0066_app_mirrors
"""
import sqlalchemy as sa
from alembic import op

revision = "0067_app_files"
down_revision = "0066_app_mirrors"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "app_files" in sa.inspect(bind).get_table_names():
        return
    op.create_table(
        "app_files",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("app", sa.String(length=64), nullable=False),
        sa.Column("rec_id", sa.String(length=128), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("mime", sa.String(length=120), nullable=True),
        sa.Column("size", sa.Integer(), nullable=True),
        sa.Column("drive_id", sa.String(length=128), nullable=True),
        sa.Column("link", sa.String(length=500), nullable=True),
        sa.Column("deleted", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_app_files_user_id", "app_files", ["user_id"])
    op.create_index("ix_app_files_app", "app_files", ["app"])
    op.create_index("ix_app_files_rec_id", "app_files", ["rec_id"])


def downgrade() -> None:
    bind = op.get_bind()
    if "app_files" in sa.inspect(bind).get_table_names():
        for ix in ("ix_app_files_rec_id", "ix_app_files_app", "ix_app_files_user_id"):
            op.drop_index(ix, table_name="app_files")
        op.drop_table("app_files")
