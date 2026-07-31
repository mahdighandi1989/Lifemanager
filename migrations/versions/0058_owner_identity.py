"""owner_identity_fields — one row per identity fact, with source + owner lock.

Revision ID: 0058_owner_identity
Revises: 0057_identity_dob
"""
import sqlalchemy as sa
from alembic import op

revision = "0058_owner_identity"
down_revision = "0057_identity_dob"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "owner_identity_fields" in sa.inspect(bind).get_table_names():
        return
    op.create_table(
        "owner_identity_fields",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("field", sa.String(length=64), nullable=False),
        sa.Column("label_fa", sa.String(length=120), nullable=True),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("source", sa.String(length=64), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("sources", sa.JSON(), nullable=True),
        sa.Column("owner_locked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("asked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "field", name="uq_owner_identity_user_field"),
    )
    op.create_index("ix_owner_identity_fields_user_id", "owner_identity_fields", ["user_id"])
    op.create_index("ix_owner_identity_fields_field", "owner_identity_fields", ["field"])


def downgrade() -> None:
    op.drop_table("owner_identity_fields")
