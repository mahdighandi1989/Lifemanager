"""place_trips: note + explained_at — the owner's own answer, remembered.

Until now «آنجا چه کردی؟» was answered, echoed back in the confirmation, and
dropped. Because ``learn_patterns`` recomputes ``is_anomaly`` on every hourly
run with no memory of an explained trip, the same question came back — the
opposite of the owner's standing rule that an explained route is never asked
about again.

Revision ID: 0061_trip_explanation
Revises: 0060_location_device
"""
import sqlalchemy as sa
from alembic import op

revision = "0061_trip_explanation"
down_revision = "0060_location_device"
branch_labels = None
depends_on = None

_COLS = (("note", sa.Text()), ("explained_at", sa.DateTime(timezone=True)))


def _columns(bind, table: str) -> set:
    try:
        return {c["name"] for c in sa.inspect(bind).get_columns(table)}
    except Exception:
        return set()


def upgrade() -> None:
    # Guarded like its siblings: Render's free tier runs create_all() at
    # startup, so the column may already exist when alembic gets here.
    bind = op.get_bind()
    if "place_trips" not in sa.inspect(bind).get_table_names():
        return
    have = _columns(bind, "place_trips")
    with op.batch_alter_table("place_trips") as batch:
        for name, kind in _COLS:
            if name not in have:
                batch.add_column(sa.Column(name, kind, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    have = _columns(bind, "place_trips")
    with op.batch_alter_table("place_trips") as batch:
        for name, _ in _COLS:
            if name in have:
                batch.drop_column(name)
