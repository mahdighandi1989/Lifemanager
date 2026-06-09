"""Add subscription_accounts and identity_documents tables.

Task 32ade384: persist the Netflix subscription account (attachment #27)
and the Emirates ID Document-Details / card data (attachments #28-29).
Inspector-guarded so re-running on an existing DB is a no-op; SQLite-safe
for the test engine.

Revision ID: 0029_subscription_and_identity
Revises: 0028_analysis_prompt
Create Date: 2026-06-09
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0029_subscription_and_identity"
down_revision: Union[str, None] = "0028_analysis_prompt"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, table: str) -> bool:
    return table in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_table(bind, "subscription_accounts"):
        op.create_table(
            "subscription_accounts",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("provider", sa.String(64), nullable=False, server_default="netflix.com"),
            sa.Column("account_email", sa.String(255), nullable=True),
            sa.Column("mobile_phone", sa.String(64), nullable=True),
            sa.Column("member_since", sa.String(64), nullable=True),
            sa.Column("plan", sa.String(128), nullable=True),
            sa.Column("next_payment_date", sa.String(64), nullable=True),
            sa.Column("payment_method_brand", sa.String(32), nullable=True),
            # Last 4 digits only — never the full PAN.
            sa.Column("payment_card_last4", sa.String(4), nullable=True),
            sa.Column("inferred_name_from_email", sa.String(128), nullable=True),
            sa.Column("inferred_birth_year_from_email", sa.Integer(), nullable=True),
            sa.Column("is_inferred_identity", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _has_table(bind, "identity_documents"):
        op.create_table(
            "identity_documents",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("emirates_id_number", sa.String(32), nullable=True),
            sa.Column("file_number", sa.String(64), nullable=True),
            sa.Column("passport_number", sa.String(32), nullable=True),
            sa.Column("full_name", sa.String(255), nullable=True),
            sa.Column("profession", sa.String(128), nullable=True),
            sa.Column("sponsor", sa.String(255), nullable=True),
            sa.Column("issue_date", sa.String(32), nullable=True),
            sa.Column("expiry_date", sa.String(32), nullable=True),
            sa.Column("issue_place", sa.String(64), nullable=True),
            # Cut off in the source image → nullable.
            sa.Column("accompanied_by", sa.String(255), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_table("identity_documents")
    op.drop_table("subscription_accounts")
