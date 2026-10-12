"""app_mirrors — Google Drive mirror (folder + spreadsheet) of selected app records.

Revision ID: 0066_app_mirrors
Revises: 0065_app_records
"""
import sqlalchemy as sa
from alembic import op

revision = "0066_app_mirrors"
down_revision = "0065_app_records"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "app_mirrors" in sa.inspect(bind).get_table_names():
        return
    op.create_table(
        "app_mirrors",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("app", sa.String(length=64), nullable=False),
        sa.Column("rec_id", sa.String(length=128), nullable=False),
        sa.Column("grp", sa.String(length=64), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=True),
        sa.Column("doc", sa.Text(), nullable=True),
        sa.Column("doc_hash", sa.String(length=64), nullable=True),
        sa.Column("synced_hash", sa.String(length=64), nullable=True),
        sa.Column("folder_id", sa.String(length=128), nullable=True),
        sa.Column("sheet_id", sa.String(length=128), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("deleted", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "app", "rec_id", name="uq_app_mirrors_user_app_rec"),
    )
    op.create_index("ix_app_mirrors_user_id", "app_mirrors", ["user_id"])
    op.create_index("ix_app_mirrors_app", "app_mirrors", ["app"])


def downgrade() -> None:
    bind = op.get_bind()
    if "app_mirrors" in sa.inspect(bind).get_table_names():
        op.drop_index("ix_app_mirrors_app", table_name="app_mirrors")
        op.drop_index("ix_app_mirrors_user_id", table_name="app_mirrors")
        op.drop_table("app_mirrors")
