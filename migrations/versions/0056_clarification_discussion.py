"""clarifications.discussion — the two-way Q&A thread about an ambiguity.

Guarded like 0052/0053: the Render startup path runs an idempotent
``ALTER TABLE … ADD COLUMN IF NOT EXISTS`` for this column, so a later
``alembic upgrade head`` would otherwise abort with DuplicateColumn.

Revision ID: 0056_clar_discussion
Revises: 0055_clarifications
"""
import sqlalchemy as sa
from alembic import op

revision = "0056_clar_discussion"
down_revision = "0055_clarifications"
branch_labels = None
depends_on = None


def _columns(bind, table: str) -> set:
    try:
        return {c["name"] for c in sa.inspect(bind).get_columns(table)}
    except Exception:
        return set()


def upgrade() -> None:
    bind = op.get_bind()
    if "clarifications" not in sa.inspect(bind).get_table_names():
        return
    if "discussion" in _columns(bind, "clarifications"):
        return
    with op.batch_alter_table("clarifications") as batch:
        batch.add_column(sa.Column("discussion", sa.JSON(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if "discussion" not in _columns(bind, "clarifications"):
        return
    with op.batch_alter_table("clarifications") as batch:
        batch.drop_column("discussion")
