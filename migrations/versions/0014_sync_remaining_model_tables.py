"""Sync the remaining model tables into the alembic chain (task 3ea5622b).

Five models were added without a matching migration, so `alembic upgrade head`
left them uncreated while the runtime create_all path did make them — the exact
drift tests/test_migrations.py::test_all_tables_created and
tests/test_migration.py::test_tables_match_models guard against:

  * interactions               (app/models/interaction.py)
  * ai_assessments             (app/models/ai_assessment.py)
  * user_comments              (app/models/user_comment.py)
  * behavior_logs              (app/models/behavior_log.py)
  * indexed_data_source_entries(app/models/indexed_data_source_entry.py)

We create exactly those tables from the live Base.metadata (importing
app.models registers every model), guarded by inspector.has_table so an env
that already built them via create_all upgrades cleanly. Driving it off the
metadata keeps the columns identical to the models — no hand-transcription
drift — which is what the match-models test verifies.

Revision ID: 0014_sync_remaining_model_tables
Revises: 0013_drive_files
Create Date: 2026-05-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0014_sync_remaining_model_tables"
down_revision: Union[str, None] = "0013_drive_files"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_TABLES = [
    "interactions",
    "ai_assessments",
    "user_comments",
    "behavior_logs",
    "indexed_data_source_entries",
]


def upgrade() -> None:
    import app.models  # noqa: F401 — register every model on Base.metadata
    from app.database import Base

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    to_create = [
        Base.metadata.tables[name]
        for name in _TABLES
        if name in Base.metadata.tables and not inspector.has_table(name)
    ]
    if to_create:
        Base.metadata.create_all(bind=bind, tables=to_create)


def downgrade() -> None:
    import app.models  # noqa: F401
    from app.database import Base

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    for name in reversed(_TABLES):
        if inspector.has_table(name) and name in Base.metadata.tables:
            Base.metadata.tables[name].drop(bind=bind)
