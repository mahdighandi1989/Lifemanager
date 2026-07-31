"""places / place_visits / place_trips / route_patterns — location memory.

Revision ID: 0059_places
Revises: 0058_owner_identity
"""
import sqlalchemy as sa
from alembic import op

revision = "0059_places"
down_revision = "0058_owner_identity"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    have = set(sa.inspect(bind).get_table_names())

    if "places" not in have:
        op.create_table(
            "places",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("label", sa.String(length=160), nullable=True),
            sa.Column("kind", sa.String(length=24), nullable=True),
            sa.Column("latitude", sa.Float(), nullable=False),
            sa.Column("longitude", sa.Float(), nullable=False),
            sa.Column("radius_m", sa.Float(), nullable=False, server_default="150"),
            sa.Column("address", sa.String(length=400), nullable=True),
            sa.Column("visit_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("total_minutes", sa.Float(), nullable=False, server_default="0"),
            sa.Column("hour_histogram", sa.JSON(), nullable=True),
            sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("owner_locked", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("asked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_places_user_id", "places", ["user_id"])
        op.create_index("ix_places_kind", "places", ["kind"])

    if "place_visits" not in have:
        op.create_table(
            "place_visits",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("place_id", sa.Integer(), nullable=True),
            sa.Column("device", sa.String(length=64), nullable=True),
            sa.Column("arrived_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("left_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("minutes", sa.Float(), nullable=True),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column("asked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_place_visits_user_id", "place_visits", ["user_id"])
        op.create_index("ix_place_visits_place_id", "place_visits", ["place_id"])

    if "place_trips" not in have:
        op.create_table(
            "place_trips",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("device", sa.String(length=64), nullable=True),
            sa.Column("from_place_id", sa.Integer(), nullable=True),
            sa.Column("to_place_id", sa.Integer(), nullable=True),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("minutes", sa.Float(), nullable=True),
            sa.Column("distance_km", sa.Float(), nullable=True),
            sa.Column("pattern_key", sa.String(length=120), nullable=True),
            sa.Column("is_anomaly", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_place_trips_user_id", "place_trips", ["user_id"])
        op.create_index("ix_place_trips_pattern_key", "place_trips", ["pattern_key"])

    if "route_patterns" not in have:
        op.create_table(
            "route_patterns",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("pattern_key", sa.String(length=120), nullable=False),
            sa.Column("from_place_id", sa.Integer(), nullable=True),
            sa.Column("to_place_id", sa.Integer(), nullable=True),
            sa.Column("weekday", sa.Integer(), nullable=True),
            sa.Column("hour_bucket", sa.Integer(), nullable=True),
            sa.Column("occurrences", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("avg_minutes", sa.Float(), nullable=True),
            sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("learned", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint("user_id", "pattern_key", name="uq_route_pattern_user_key"),
        )
        op.create_index("ix_route_patterns_user_id", "route_patterns", ["user_id"])


def downgrade() -> None:
    for table in ("route_patterns", "place_trips", "place_visits", "places"):
        op.drop_table(table)
