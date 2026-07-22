"""Add ingested-receipt fields to transactions (occurred_on, currency, source, source_ref).

A receipt/invoice extracted from an email or Drive carries its OWN date and
currency (independent of the parent account) and a source_ref back to the
document (idempotency — a re-approval must not double-post). Inspector-guarded;
SQLite-safe; Render free tier also gets these via the startup ALTER in main.py.

Revision ID: 0050_transaction_receipt_fields
Revises: 0049_identity_facts
Create Date: 2026-07-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0050_transaction_receipt_fields"
down_revision: Union[str, None] = "0049_identity_facts"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _cols(bind, table: str):
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    if "transactions" not in sa.inspect(bind).get_table_names():
        return
    have = _cols(bind, "transactions")
    if "occurred_on" not in have:
        op.add_column("transactions", sa.Column("occurred_on", sa.Date(), nullable=True))
    if "currency" not in have:
        op.add_column("transactions", sa.Column("currency", sa.String(length=8), nullable=True))
    if "source" not in have:
        op.add_column("transactions", sa.Column("source", sa.String(length=32), nullable=True))
    if "source_ref" not in have:
        op.add_column("transactions", sa.Column("source_ref", sa.String(length=255), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if "transactions" not in sa.inspect(bind).get_table_names():
        return
    have = _cols(bind, "transactions")
    for col in ("source_ref", "source", "currency", "occurred_on"):
        if col in have:
            op.drop_column("transactions", col)
