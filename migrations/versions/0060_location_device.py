"""user_locations: device + speed_kmh.

Revision ID: 0060_location_device
Revises: 0059_places
"""
import sqlalchemy as sa
from alembic import op

revision = "0060_location_device"
down_revision = "0059_places"
branch_labels = None
depends_on = None

_COLS = (("device", sa.String(length=64)), ("speed_kmh", sa.Float()))


def _columns(bind, table: str) -> set:
    try:
        return {c["name"] for c in sa.inspect(bind).get_columns(table)}
    except Exception:
        return set()


def upgrade() -> None:
    bind = op.get_bind()
    if "user_locations" not in sa.inspect(bind).get_table_names():
        return
    have = _columns(bind, "user_locations")
    with op.batch_alter_table("user_locations") as batch:
        for name, kind in _COLS:
            if name not in have:
                batch.add_column(sa.Column(name, kind, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    have = _columns(bind, "user_locations")
    with op.batch_alter_table("user_locations") as batch:
        for name, _ in _COLS:
            if name in have:
                batch.drop_column(name)
