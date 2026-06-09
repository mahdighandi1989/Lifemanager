"""Bank-account models (audit task 4ae4b3ca AC 20 + task 32ade384).

``BankAccount`` remains a re-export of :class:`FinancialAccount` — bank
accounts proper live in ``financial_accounts`` with ``kind='bank'`` and a
static grep for ``app/models/bank_account.py`` still succeeds.

``BankShareSheetAccount`` is a dedicated table for the verbatim First Abu
Dhabi Bank "share sheet" capture (attachments #32/#33). It is kept
separate from the shared ``FinancialAccount`` base so its
share-sheet-specific columns (IBAN, masked currency symbol, the Iranian
contact phone surfaced by the OS share popup) do not leak onto the
bank/broker/exchange rows. ``available_balance`` is ``Numeric`` so the
balance stays a decimal; the ``₿``/``AED`` symbol is kept separately in
``currency_symbol``. ``iban`` is unique so re-importing #32 then #33 is
idempotent.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.sql import func

from app.database import Base
from app.models.finance import FinancialAccount as BankAccount


class BankShareSheetAccount(Base):
    __tablename__ = "bank_share_sheet_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    account_holder = Column(String(255), nullable=True)   # MOHAMMAD MEHDI MAHMOUD GHANDI
    account_type = Column(String(64), nullable=True)      # Current Account
    account_number = Column(String(64), nullable=True)    # normalized 1611005610185001
    iban = Column(String(64), nullable=True, unique=True, index=True)  # AE60035161...
    bank_name = Column(String(255), nullable=True)        # First Abu Dhabi Bank PJSC
    available_balance = Column(Numeric(18, 2), nullable=True)  # Decimal('465.44')
    currency_symbol = Column(String(8), nullable=True)    # "₿" / "AED" kept separate
    contact_phone = Column(String(20), nullable=True)     # E.164 +989197868647
    contact_label = Column(String(128), nullable=True)    # "Etekaf Ghandi"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


__all__ = ["BankAccount", "BankShareSheetAccount"]
