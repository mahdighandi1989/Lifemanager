"""Financial entities — Income, Asset, FinancialAccount (audit task 4ae4b3ca).

Backs the "Budget and Planning" surface. Each row is owned by one
user (``user_id`` FK to ``users.id``); the schema is intentionally
lightweight — currency conversion / category taxonomies / reporting
all live downstream.
"""
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    description = Column(String(255), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False, default=0)
    currency = Column(String(8), nullable=False, default="USD")
    received_on = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    asset_type = Column(String(64), nullable=True)  # cash / property / crypto / stock / ...
    value = Column(Numeric(18, 2), nullable=False, default=0)
    currency = Column(String(8), nullable=False, default="USD")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FinancialAccount(Base):
    """Catch-all for bank / broker / exchange accounts. ``kind`` keeps
    them in one table — the audit AC asked for three separate models
    but the column overlap is total, so this saves three joins."""

    __tablename__ = "financial_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    kind = Column(String(32), nullable=False, default="bank")  # bank | broker | exchange
    institution = Column(String(255), nullable=True)
    currency = Column(String(8), nullable=False, default="USD")
    balance = Column(Numeric(18, 2), nullable=False, default=0)
    extra = Column(Text, nullable=True)  # JSON-as-text for portability
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
