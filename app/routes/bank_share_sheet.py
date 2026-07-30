"""/api/bank-accounts/* — FAB share-sheet import (task 32ade384, steps 6/7).

Stores the verbatim First Abu Dhabi Bank capture from the OS share-sheet
screenshots (attachments #32/#33). The two screenshots describe the same
account, so the import is **idempotent on IBAN**: re-posting #33 after #32
updates the existing row instead of creating a duplicate.

Normalisation on the way in:
  * IBAN / account number → spaces stripped.
  * balance → ``Decimal`` (the ``₿``/``AED`` symbol is kept separately).
  * contact phone → E.164 (``+98 919 786 8647`` → ``+989197868647``).
"""
import logging
import re
from decimal import Decimal, InvalidOperation
from typing import List, Optional

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.bank_account import BankShareSheetAccount


router = APIRouter()


def _strip_spaces(value: Optional[str]) -> Optional[str]:
    return value.replace(" ", "") if value else value


def _normalize_phone(value: Optional[str]) -> Optional[str]:
    """Collapse a displayed phone to E.164: keep a leading +, drop the rest."""
    if not value:
        return value
    digits = "".join(ch for ch in value if ch.isdigit())
    return ("+" + digits) if value.lstrip().startswith("+") else digits


def _to_decimal(value) -> Optional[Decimal]:
    if value is None or value == "":
        return None
    if isinstance(value, Decimal):
        return value
    # Tolerate "₿465.44" / "AED 465.44" — keep only the numeric part.
    cleaned = "".join(ch for ch in str(value) if ch.isdigit() or ch == ".")
    try:
        return Decimal(cleaned) if cleaned else None
    except InvalidOperation:
        return None


class BankShareSheetImport(BaseModel):
    account_holder: Optional[str] = Field(default=None, max_length=255)
    account_type: Optional[str] = Field(default=None, max_length=64)
    account_number: Optional[str] = Field(default=None, max_length=64)
    iban: Optional[str] = Field(default=None, max_length=64)
    bank_name: Optional[str] = Field(default=None, max_length=255)
    # Accept "₿465.44" or 465.44 — coerced to Decimal on store.
    available_balance: Optional[str] = Field(default=None, max_length=32)
    currency_symbol: Optional[str] = Field(default=None, max_length=8)
    contact_phone: Optional[str] = Field(default=None, max_length=32)
    contact_label: Optional[str] = Field(default=None, max_length=128)


class BankShareSheetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    account_holder: Optional[str]
    account_type: Optional[str]
    account_number: Optional[str]
    iban: Optional[str]
    bank_name: Optional[str]
    available_balance: Optional[Decimal]
    currency_symbol: Optional[str]
    contact_phone: Optional[str]
    contact_label: Optional[str]


@router.post(
    "/api/bank-accounts/import-share-sheet",
    response_model=BankShareSheetResponse,
    status_code=201,
)
@handle_errors
async def import_share_sheet(
    payload: BankShareSheetImport = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    iban = _strip_spaces(payload.iban)
    account_number = _strip_spaces(payload.account_number)
    phone = _normalize_phone(payload.contact_phone)
    balance = _to_decimal(payload.available_balance)

    existing = None
    if iban:
        existing = (
            await db.execute(
                select(BankShareSheetAccount).where(
                    (BankShareSheetAccount.user_id == user_id)
                    & (BankShareSheetAccount.iban == iban)
                )
            )
        ).scalar_one_or_none()

    if existing is not None:
        # Idempotent: #33 confirms #32 — refresh the known-good fields.
        existing.account_holder = payload.account_holder or existing.account_holder
        existing.account_type = payload.account_type or existing.account_type
        existing.account_number = account_number or existing.account_number
        existing.bank_name = payload.bank_name or existing.bank_name
        if balance is not None:
            existing.available_balance = balance
        existing.currency_symbol = payload.currency_symbol or existing.currency_symbol
        existing.contact_phone = phone or existing.contact_phone
        existing.contact_label = payload.contact_label or existing.contact_label
        account = existing
    else:
        account = BankShareSheetAccount(
            user_id=user_id,
            account_holder=payload.account_holder,
            account_type=payload.account_type,
            account_number=account_number,
            iban=iban,
            bank_name=payload.bank_name,
            available_balance=balance,
            currency_symbol=payload.currency_symbol,
            contact_phone=phone,
            contact_label=payload.contact_label,
        )
        db.add(account)

    # آشتی با «مالی» (2026-07-30): the share-sheet import used to live in its
    # own island table — the FAB balance the owner imported never reached a
    # card, the dashboard, or any report. Feed it through the SAME identity
    # engine as every other signal (trusted: the owner imported it himself).
    try:
        from app.services import finance_email_scan_service as _fs

        _digits = re.sub(r"\D", "", account_number or "")
        _sym = (payload.currency_symbol or "").strip().lower()
        _cur = {"د.إ": "AED", "aed": "AED", "dhs": "AED", "$": "USD", "usd": "USD"}.get(_sym, "AED")
        await _fs.apply_account_signal(
            db,
            user_id,
            institution=_fs._institution(None, payload.bank_name)
            or re.sub(r"[^A-Za-z0-9آ-ی ]+", "", str(payload.bank_name or ""))[:60]
            or None,
            account_ref=(f"••{_digits[-4:]}" if len(_digits) >= 4 else None),
            iban=iban,
            balance=balance,
            currency=_cur,
            kind="bank",
            source="share_sheet",
            source_ref=f"sharesheet:{iban or account_number or account.id}",
            provider_name=payload.bank_name,
            trusted=True,
        )
    except Exception:
        logger.debug("share-sheet → finance reconcile skipped", exc_info=True)

    await db.commit()
    await db.refresh(account)
    return account


@router.get(
    "/api/bank-accounts/share-sheets",
    response_model=List[BankShareSheetResponse],
)
@handle_errors
async def list_share_sheets(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(
        select(BankShareSheetAccount).where(
            BankShareSheetAccount.user_id == user_id
        )
    )
    return list(result.scalars().all())
