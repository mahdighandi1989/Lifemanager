"""identity_documents: date_of_birth / sex / nationality.

The Emirates-ID route accepted these three fields from day one and silently
dropped them, so the owner's date of birth was never stored. Guarded like the
neighbouring migrations because the startup path adds them idempotently too.

Revision ID: 0057_identity_dob
Revises: 0056_clar_discussion
"""
import sqlalchemy as sa
from alembic import op

revision = "0057_identity_dob"
down_revision = "0056_clar_discussion"
branch_labels = None
depends_on = None

_COLS = (
    ("date_of_birth", sa.String(length=32)),
    ("sex", sa.String(length=16)),
    ("nationality", sa.String(length=64)),
)


def _columns(bind, table: str) -> set:
    try:
        return {c["name"] for c in sa.inspect(bind).get_columns(table)}
    except Exception:
        return set()


def upgrade() -> None:
    bind = op.get_bind()
    if "identity_documents" not in sa.inspect(bind).get_table_names():
        return
    have = _columns(bind, "identity_documents")
    with op.batch_alter_table("identity_documents") as batch:
        for name, kind in _COLS:
            if name not in have:
                batch.add_column(sa.Column(name, kind, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    have = _columns(bind, "identity_documents")
    with op.batch_alter_table("identity_documents") as batch:
        for name, _ in _COLS:
            if name in have:
                batch.drop_column(name)
