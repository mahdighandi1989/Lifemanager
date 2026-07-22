"""خداشهر — persistent sahat assignment + editable thread registry.

Adds a nullable ``sahat`` VARCHAR(16) to the five primary content tables
(tasks, todo_lists, personal_writings, directives, projects) — the owner's
correction is stored and always wins over the read-time classifier — and
creates ``sahat_threads`` (the «نخِ تسبیح» registry as data, so new threads
need no deploy). Inspector-guarded; SQLite-safe; Render free tier also gets
the columns via the startup ALTER in main.py and the table via create_all.

Revision ID: 0051_sahat_layer
Revises: 0050_transaction_receipt_fields
Create Date: 2026-07-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0051_sahat_layer"
down_revision: Union[str, None] = "0050_transaction_receipt_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_SAHAT_TABLES = ("tasks", "todo_lists", "personal_writings", "directives", "projects")


def _cols(bind, table: str):
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())
    for table in _SAHAT_TABLES:
        if table in existing and "sahat" not in _cols(bind, table):
            op.add_column(table, sa.Column("sahat", sa.String(length=16), nullable=True))
    if "sahat_threads" not in existing:
        op.create_table(
            "sahat_threads",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), nullable=True, index=True),
            sa.Column("key", sa.String(length=64), nullable=False),
            sa.Column("title", sa.String(length=200), nullable=False),
            sa.Column("sahat", sa.String(length=16), nullable=False),
            sa.Column("tokens", sa.JSON(), nullable=False),
            sa.Column("link", sa.String(length=120), nullable=True),
            sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint("user_id", "key", name="uq_sahat_threads_user_key"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())
    if "sahat_threads" in existing:
        op.drop_table("sahat_threads")
    for table in _SAHAT_TABLES:
        if table in existing and "sahat" in _cols(bind, table):
            op.drop_column(table, "sahat")
