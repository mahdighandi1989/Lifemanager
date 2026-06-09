"""NetellerWalletSnapshot — Neteller wallet dashboard (task 32ade384).

Captures the Neteller wallet dashboard (attachment #39): account-holder
name, loyalty points, balance + currency, and the dashboard URL.

There is deliberately **no** ``account_number`` column: the account
number was not shown in the source, so inventing a field for it would
imply data we do not have. ``balance`` is ``Numeric`` so AED 2,000.88 is
stored as a decimal, not a string; ``menu_items`` keeps the dashboard's
navigation list as JSON-as-text for portability across SQLite/Postgres.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from app.database import Base


class NetellerWalletSnapshot(Base):
    __tablename__ = "neteller_wallet_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    account_holder_name = Column(String(128), nullable=True)  # "Mohammad mehdi Ghandi"
    loyalty_points = Column(Integer, nullable=True)           # 2873
    balance = Column(Numeric(18, 2), nullable=False, default=0)  # 2000.88
    currency = Column(String(8), nullable=False, default="AED")
    dashboard_url = Column(String(255), nullable=True)
    # Dashboard nav (HOME, ADD MONEY, ...) as JSON-as-text.
    menu_items = Column(Text, nullable=True)
    source_attachment = Column(String(32), nullable=True, default="attachment-39")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
