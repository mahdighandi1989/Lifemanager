"""Add UAE-licence, bank share-sheet, RTA and Neteller tables.

Task 32ade384 (steps 6-13): persist the verbatim extractions that need
storage — the FAB bank share-sheet (#32/#33), the UAE driving licence
(#34/#35), the Dubai RTA dashboard (#38) and the Neteller wallet snapshot
(#39). Vehicle-document extraction (#36/#37) is stateless and needs no
table. Inspector-guarded so re-running is a no-op; SQLite-safe.

Revision ID: 0030_vehicle_rta_neteller_bank
Revises: 0029_subscription_and_identity
Create Date: 2026-06-09
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0030_vehicle_rta_neteller_bank"
down_revision: Union[str, None] = "0029_subscription_and_identity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_table(bind, "bank_share_sheet_accounts"):
        op.create_table(
            "bank_share_sheet_accounts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("account_holder", sa.String(255), nullable=True),
            sa.Column("account_type", sa.String(64), nullable=True),
            sa.Column("account_number", sa.String(64), nullable=True),
            sa.Column("iban", sa.String(64), nullable=True, unique=True, index=True),
            sa.Column("bank_name", sa.String(255), nullable=True),
            sa.Column("available_balance", sa.Numeric(18, 2), nullable=True),
            sa.Column("currency_symbol", sa.String(8), nullable=True),
            sa.Column("contact_phone", sa.String(20), nullable=True),
            sa.Column("contact_label", sa.String(128), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _has_table(bind, "uae_driving_licenses"):
        op.create_table(
            "uae_driving_licenses",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("license_no", sa.String(32), nullable=False, index=True),
            sa.Column("name_en", sa.String(255), nullable=True),
            sa.Column("name_ar", sa.String(255), nullable=True),
            sa.Column("nationality", sa.String(128), nullable=True),
            sa.Column("date_of_birth", sa.Date(), nullable=True),
            sa.Column("issue_date", sa.Date(), nullable=True),
            sa.Column("expiry_date", sa.Date(), nullable=True),
            sa.Column("place_of_issue", sa.String(128), nullable=True),
            sa.Column("issuing_authority", sa.String(64), nullable=True, server_default="RTA"),
            sa.Column("traffic_code_no", sa.String(32), nullable=True),
            sa.Column("permitted_vehicles", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _has_table(bind, "rta_accounts"):
        op.create_table(
            "rta_accounts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("user_name", sa.String(128), nullable=True),
            sa.Column("salik_account_number", sa.String(32), nullable=True),
            sa.Column("salik_balance", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("parking_balance", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("fines_payable", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("fines_non_payable", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("black_points", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("currency_symbol", sa.String(8), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _has_table(bind, "neteller_wallet_snapshots"):
        op.create_table(
            "neteller_wallet_snapshots",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("account_holder_name", sa.String(128), nullable=True),
            sa.Column("loyalty_points", sa.Integer(), nullable=True),
            sa.Column("balance", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("currency", sa.String(8), nullable=False, server_default="AED"),
            sa.Column("dashboard_url", sa.String(255), nullable=True),
            sa.Column("menu_items", sa.Text(), nullable=True),
            sa.Column("source_attachment", sa.String(32), nullable=True, server_default="attachment-39"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_table("neteller_wallet_snapshots")
    op.drop_table("rta_accounts")
    op.drop_table("uae_driving_licenses")
    op.drop_table("bank_share_sheet_accounts")
