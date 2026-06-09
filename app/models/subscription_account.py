"""SubscriptionAccount — a streaming / subscription account (task 32ade384).

Captures the verbatim data extracted from a subscription provider's
account screen (e.g. the Netflix Account page in attachment #27).

Why a dedicated table rather than reusing ``financial_accounts``:
subscriptions carry provider-specific, mostly-textual fields
(plan name, next-payment date as shown, masked card) plus a set of
**inferred** identity hints that must never be treated as confirmed
identity. Keeping those concerns out of the shared FinancialAccount
base avoids leaking subscription columns onto bank / broker / exchange
rows (see the risk note in the task prompt).

Privacy invariants enforced here:
  * Only the last 4 digits of the payment card are ever stored
    (``payment_card_last4`` is ``String(4)``) — never the full PAN.
  * Name / birth-year derived from the account email are stored in the
    ``inferred_*`` columns with ``is_inferred_identity`` defaulting to
    True, so downstream consumers know they are guesses, not facts.
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class SubscriptionAccount(Base):
    __tablename__ = "subscription_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    # ── Provider / contact (verbatim from the account screen) ────────
    provider = Column(String(64), nullable=False, default="netflix.com")
    account_email = Column(String(255), nullable=True)   # mohamad.mahdi1988@gmail.com
    mobile_phone = Column(String(64), nullable=True)     # 058 247 1367
    member_since = Column(String(64), nullable=True)     # "December 2019"
    plan = Column(String(128), nullable=True)            # "Standard plan"
    next_payment_date = Column(String(64), nullable=True)  # "June 25, 2026" (as shown)

    # ── Payment method — masked only, never the full PAN ─────────────
    payment_method_brand = Column(String(32), nullable=True)  # "Mastercard"
    payment_card_last4 = Column(String(4), nullable=True)     # "9091" — last 4 only

    # ── Inferred identity hints (NOT confirmed facts) ────────────────
    inferred_name_from_email = Column(String(128), nullable=True)   # "mohamad.mahdi"
    inferred_birth_year_from_email = Column(Integer, nullable=True)  # 1988
    is_inferred_identity = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
