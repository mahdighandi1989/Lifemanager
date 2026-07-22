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


class Transaction(Base):
    """A money movement against a FinancialAccount (audit task 4ae4b3ca AC 2).

    ``transaction_type`` is ``income`` | ``expense``; posting one updates the
    parent account's ``balance`` (see POST /api/finance/transactions). The
    email/SMS auto-update pipeline records its detected movements here too.
    """

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(
        Integer,
        ForeignKey("financial_accounts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    amount = Column(Numeric(18, 2), nullable=False, default=0)
    transaction_type = Column(String(16), nullable=False, default="expense")
    description = Column(String(255), nullable=True)
    # Phase 3 (audit #19): free-form spending category (خوراک/حمل‌ونقل/…)
    # so the monthly report can group spending. Optional.
    category = Column(String(64), nullable=True, index=True)
    # Ingested-receipt fields (2026-07-22): a Carrefour receipt carries its OWN
    # date + currency, independent of the parent account, and a source_ref back
    # to the ingested document (idempotency — a re-approval must not double-post).
    occurred_on = Column(Date, nullable=True, index=True)  # the receipt's own date
    currency = Column(String(8), nullable=True)            # receipt currency (falls back to account)
    source = Column(String(32), nullable=True)             # manual | email | receipt | drive
    source_ref = Column(String(255), nullable=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class BudgetPlan(Base):
    """A per-user budget envelope (audit task 4ae4b3ca AC 3).

    ``period`` is ``monthly`` | ``yearly``. ``remaining_budget`` is what the
    task-module integration checks before flagging an over-budget purchase.
    """

    __tablename__ = "budget_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    total_budget = Column(Numeric(18, 2), nullable=False, default=0)
    remaining_budget = Column(Numeric(18, 2), nullable=False, default=0)
    period = Column(String(16), nullable=False, default="monthly")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
