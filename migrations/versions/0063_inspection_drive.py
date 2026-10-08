"""inspection → Drive: inspection_shots.store/drive_id + inspection_reports.drive_folder_id.

Screenshots leave the database for the sheet's Drive folder
(LifeManagerData/inspection/report-NNNN/shots); the row keeps only the
reference. Guarded like its siblings — the startup ALTER may get there first.

Revision ID: 0063_inspection_drive
Revises: 0062_inspection
"""
import sqlalchemy as sa
from alembic import op

revision = "0063_inspection_drive"
down_revision = "0062_inspection"
branch_labels = None
depends_on = None

_COLS = (
    ("inspection_shots", "store", sa.String(length=12)),
    ("inspection_shots", "drive_id", sa.String(length=120)),
    ("inspection_reports", "drive_folder_id", sa.String(length=120)),
)


def _columns(bind, table: str) -> set:
    try:
        return {c["name"] for c in sa.inspect(bind).get_columns(table)}
    except Exception:
        return set()


def upgrade() -> None:
    bind = op.get_bind()
    tables = set(sa.inspect(bind).get_table_names())
    for table, name, kind in _COLS:
        if table in tables and name not in _columns(bind, table):
            with op.batch_alter_table(table) as batch:
                batch.add_column(sa.Column(name, kind, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    for table, name, _ in _COLS:
        if name in _columns(bind, table):
            with op.batch_alter_table(table) as batch:
                batch.drop_column(name)
