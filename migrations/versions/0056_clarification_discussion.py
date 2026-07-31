"""clarifications.discussion — the two-way Q&A thread about an ambiguity.

Revision ID: 0056_clar_discussion
Revises: 0055_clarifications
"""
import sqlalchemy as sa
from alembic import op

revision = "0056_clar_discussion"
down_revision = "0055_clarifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("clarifications") as batch:
        batch.add_column(sa.Column("discussion", sa.JSON(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("clarifications") as batch:
        batch.drop_column("discussion")
