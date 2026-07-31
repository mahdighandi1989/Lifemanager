"""/api/finance/* — Income / Asset / FinancialAccount CRUD
(audit task 4ae4b3ca).

Thin shells over the ORM models — no service layer because the
operations are flat (per-user list/create with no cross-row logic).
"""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import (
    enforce_auth_when_required,
    get_optional_user_id,
    get_required_user_id,
)
from app.middleware import handle_errors
from app.models.finance import Asset, FinancialAccount, Income, Transaction
from app.services.activity_log_service import record_activity


router = APIRouter()


# ── Schemas (kept inline — they back this router only) ──────────────


class IncomeCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", max_length=8)
    received_on: Optional[str] = None  # ISO date string
    notes: Optional[str] = None


class IncomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    description: str
    amount: Decimal
    currency: str
    notes: Optional[str] = None


class AssetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    asset_type: Optional[str] = Field(default=None, max_length=64)
    value: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", max_length=8)
    notes: Optional[str] = None


class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    name: str
    asset_type: Optional[str] = None
    value: Decimal
    currency: str


class FinancialAccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    kind: str = Field(default="bank", pattern="^(bank|broker|exchange)$")
    institution: Optional[str] = Field(default=None, max_length=255)
    currency: str = Field(default="USD", max_length=8)
    balance: Decimal = Field(default=Decimal(0), ge=0)


class FinancialAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    name: str
    kind: str
    institution: Optional[str]
    currency: str
    balance: Decimal
    # مالیِ خودتغذیه (2026-07-22): where this card came from + its detected
    # identity, so the UI can badge «از ایمیل — بررسی کن» and show the ref/IBAN.
    # All optional + additive — manual accounts simply carry None.
    source: Optional[str] = None
    inferred: Optional[bool] = None
    account_ref: Optional[str] = None
    iban: Optional[str] = None
    last_email_at: Optional[str] = None
    # شفافیت (2026-07-30): the sentence the balance was read from + the moment
    # the owner pinned it by hand (his number always wins over older signals).
    balance_evidence: Optional[str] = None
    owner_balance_at: Optional[str] = None
    updated_at: Optional[datetime] = None
    # «از این حساب چه چیزی در فلان تاریخ کم شد» — the recorded movements.
    movements: List[dict] = []
    # ریزِ گردش (2026-07-25): how many per-transaction statement lines this card
    # has, so the UI can offer «ریزِ گردش» only when there is something to show.
    txn_count: int = 0
    # آرشیو (2026-07-25): imported history (the pre-system Excel sheet), shown
    # in its own collapsed group rather than among the live accounts.
    archived: bool = False


# ── Income ──────────────────────────────────────────────────────────


@router.post("/api/finance/incomes", response_model=IncomeResponse, status_code=201)
@handle_errors
async def create_income(
    payload: IncomeCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    income = Income(
        user_id=user_id,
        description=payload.description,
        amount=payload.amount,
        currency=payload.currency,
        notes=payload.notes,
    )
    db.add(income)
    await db.commit()
    await db.refresh(income)
    await record_activity(
        action="create", entity_type="income", entity_id=income.id,
        entity_label=income.description,
        detail=f"ثبت درآمد — {income.amount} {income.currency}",
        user_id=user_id, db=db,
    )
    return income


@router.get("/api/finance/incomes", response_model=List[IncomeResponse])
@handle_errors
async def list_incomes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(select(Income).where(Income.user_id == user_id))
    return list(result.scalars().all())


# ── Asset ───────────────────────────────────────────────────────────


@router.post("/api/finance/assets", response_model=AssetResponse, status_code=201)
@handle_errors
async def create_asset(
    payload: AssetCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    asset = Asset(
        user_id=user_id,
        name=payload.name,
        asset_type=payload.asset_type,
        value=payload.value,
        currency=payload.currency,
        notes=payload.notes,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    await record_activity(
        action="create", entity_type="asset", entity_id=asset.id,
        entity_label=asset.name,
        detail=f"ثبت دارایی — {asset.value} {asset.currency}",
        user_id=user_id, db=db,
    )
    return asset


@router.get("/api/finance/assets", response_model=List[AssetResponse])
@handle_errors
async def list_assets(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(select(Asset).where(Asset.user_id == user_id))
    return list(result.scalars().all())


# ── Accounts (bank / broker / exchange — kind discriminator) ────────


@router.post(
    "/api/finance/accounts",
    response_model=FinancialAccountResponse,
    status_code=201,
)
@handle_errors
async def create_financial_account(
    payload: FinancialAccountCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    account = FinancialAccount(
        user_id=user_id,
        name=payload.name,
        kind=payload.kind,
        institution=payload.institution,
        currency=payload.currency,
        balance=payload.balance,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    await record_activity(
        action="create", entity_type="account", entity_id=account.id,
        entity_label=account.name,
        detail=f"ایجاد حساب مالی ({account.kind})",
        user_id=user_id, db=db,
    )
    return account


@router.get(
    "/api/finance/accounts",
    response_model=List[FinancialAccountResponse],
)
@handle_errors
async def list_financial_accounts(
    kind: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    # Legacy/auto-created rows carry user_id NULL (the scan job runs in the anon
    # scope). The dashboard already used the NULL-inclusive scope, so the owner
    # saw «۳ حساب» there while THIS page said «۰ حساب» — the same rule now.
    from app.services.inbox_service import scope_filter

    stmt = select(FinancialAccount).where(scope_filter(FinancialAccount.user_id, user_id))
    if kind:
        if kind not in ("bank", "broker", "exchange"):
            raise HTTPException(status_code=400, detail="invalid kind filter")
        stmt = stmt.where(FinancialAccount.kind == kind)
    result = await db.execute(stmt)
    from app.services.finance_email_scan_service import account_public_extra

    from app.services.finance_email_scan_service import account_movements

    from sqlalchemy import func as _f

    out: List[FinancialAccountResponse] = []
    for a in result.scalars().all():
        pub = account_public_extra(a)
        count = (
            await db.execute(
                select(_f.count(Transaction.id)).where(Transaction.account_id == a.id)
            )
        ).scalar() or 0
        out.append(FinancialAccountResponse(
            id=a.id, user_id=a.user_id, name=a.name, kind=a.kind,
            institution=a.institution, currency=a.currency, balance=a.balance,
            source=pub["source"], inferred=pub["inferred"],
            account_ref=pub["account_ref"], iban=pub["iban"],
            last_email_at=pub["last_email_at"], updated_at=a.updated_at,
            balance_evidence=pub.get("balance_evidence"),
            owner_balance_at=pub.get("owner_balance_at"),
            movements=await account_movements(db, a.id),
            txn_count=int(count),
            archived=pub.get("archived", False),
        ))
    return out


@router.delete("/api/finance/accounts/{account_id}")
@handle_errors
async def delete_financial_account(
    account_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """حذفِ یک کارتِ حساب — the escape hatch this page never had (2026-07-25).

    A machine-created card that is simply WRONG (a credit report read as an
    account, a demo broker account) could be neither corrected nor removed:
    `cleanup-auto-cards` only removes rows with no balance AND no movement, and
    a wrong card usually has both. The owner must always be able to say «این
    حساب من نیست». The account's recorded movements go with it — they describe
    an account that does not exist.
    """
    from sqlalchemy import delete as _delete

    from app.services.inbox_service import scope_filter

    acc = (
        await db.execute(
            select(FinancialAccount).where(
                FinancialAccount.id == account_id,
                scope_filter(FinancialAccount.user_id, user_id),
            )
        )
    ).scalars().first()
    if acc is None:
        raise HTTPException(status_code=404, detail="Account not found")
    name = acc.name
    removed_txns = (
        await db.execute(select(Transaction).where(Transaction.account_id == account_id))
    ).scalars().all()
    # «✖ این حساب من نیست» must be PERMANENT (2026-07-30): remember the card's
    # identity as a tombstone so the auto-feed's self-heal never resurrects it
    # from the same files. The rebuild capability stays — clearing the
    # tombstone (POST /api/finance/tombstones/clear) re-arms it.
    from app.services import finance_email_scan_service as _fs

    try:
        await _fs.add_account_tombstone(db, acc)
    except Exception:
        pass
    await db.execute(_delete(Transaction).where(Transaction.account_id == account_id))
    await db.delete(acc)
    await db.commit()
    await record_activity(
        action="delete", entity_type="account", entity_id=account_id,
        entity_label=name, detail=f"حذف حساب مالی ({len(removed_txns)} تراکنش)",
        user_id=user_id, db=db,
    )
    return {
        "ok": True, "success": True, "deleted": True, "tombstoned": True,
        "name": name, "transactions_removed": len(removed_txns),
    }


class FinancialAccountUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    institution: Optional[str] = Field(default=None, max_length=255)
    currency: Optional[str] = Field(default=None, max_length=8)
    balance: Optional[Decimal] = None


@router.put("/api/finance/accounts/{account_id}", response_model=FinancialAccountResponse)
@handle_errors
async def update_financial_account(
    account_id: int,
    payload: FinancialAccountUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    """اصلاح دستی کارت — و مهم‌تر: موجودی‌ای که مالک خودش وارد کند حقیقتِ
    نهایی است؛ فقط سیگنالی با تاریخِ جدیدتر از این لحظه می‌تواند حرکتش دهد
    (`owner_balance_at` در apply_account_signal)."""
    import json as _json
    from datetime import datetime as _dt, timezone as _tz

    from app.services.inbox_service import scope_filter

    acc = (
        await db.execute(
            select(FinancialAccount).where(
                FinancialAccount.id == account_id,
                scope_filter(FinancialAccount.user_id, user_id),
            )
        )
    ).scalars().first()
    if acc is None:
        raise HTTPException(status_code=404, detail="Account not found")
    if payload.name is not None:
        acc.name = payload.name
    if payload.institution is not None:
        acc.institution = payload.institution
    if payload.currency is not None:
        acc.currency = payload.currency.upper()
    if payload.balance is not None:
        if payload.balance < 0:
            raise ValueError("موجودی منفی را فقط در توضیحات ثبت کن — کارت منفی نمی‌شود")
        acc.balance = payload.balance
        try:
            extra = _json.loads(acc.extra or "{}")
        except Exception:
            extra = {}
        extra["owner_balance_at"] = _dt.now(_tz.utc).isoformat()
        extra["balance_evidence"] = "تنظیم دستی مالک"
        acc.extra = _json.dumps(extra, ensure_ascii=False)
    await db.commit()
    await db.refresh(acc)
    await record_activity(
        action="update", entity_type="account", entity_id=acc.id,
        entity_label=acc.name, detail="اصلاح دستی کارت/موجودی توسط مالک",
        user_id=user_id, db=db,
    )
    from app.services.finance_email_scan_service import account_public_extra

    pub = account_public_extra(acc)
    return FinancialAccountResponse(
        id=acc.id, user_id=acc.user_id, name=acc.name, kind=acc.kind,
        institution=acc.institution, currency=acc.currency, balance=acc.balance,
        source=pub["source"], inferred=pub["inferred"],
        account_ref=pub["account_ref"], iban=pub["iban"],
        last_email_at=pub["last_email_at"], updated_at=acc.updated_at,
        balance_evidence=pub.get("balance_evidence"),
        owner_balance_at=pub.get("owner_balance_at"),
        archived=pub.get("archived", False),
    )


@router.post("/api/finance/rebuild-auto-cards")
@handle_errors
async def rebuild_auto_cards(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """«از نو بساز»: the escape from balances the OLD engine wrote wrong.

    Deletes every machine-created card (``extra.inferred``) together with its
    machine transactions — manual cards untouched — then re-runs the email
    scan with the CURRENT precise engine. Tombstones are respected (a card
    the owner declared «این حساب من نیست» stays gone) and NO tombstone is
    added here: this is machine cleanup, not an owner verdict. For
    attachment-based cards, run «بازخوانی عمیق» afterwards — the self-heal
    re-applies each file through the new engine too."""
    from sqlalchemy import delete as _delete

    from app.services import finance_email_scan_service as _fs
    from app.services.inbox_service import scope_filter

    accounts = (
        await db.execute(
            select(FinancialAccount).where(scope_filter(FinancialAccount.user_id, user_id))
        )
    ).scalars().all()
    removed = []
    for acc in accounts:
        try:
            import json as _json

            inferred = bool(_json.loads(acc.extra or "{}").get("inferred"))
        except Exception:
            inferred = False
        if not inferred:
            continue
        removed.append(acc.name)
        await db.execute(_delete(Transaction).where(Transaction.account_id == acc.id))
        await db.delete(acc)
    await db.commit()

    summary = await _fs.scan_finance_emails(db, user_id)
    await record_activity(
        action="rebuild", entity_type="account", entity_id=None,
        entity_label="بازتولید کارت‌های خودکار",
        detail=f"{len(removed)} کارت ماشینی پاک و از نو ساخته شد ({summary.get('created', 0)} کارت تازه)",
        user_id=user_id, db=db,
    )
    return {
        "ok": True, "success": True,
        "removed": len(removed), "removed_names": removed[:20],
        **{k: summary.get(k, 0) for k in ("scanned", "financial", "created", "updated")},
    }


@router.get("/api/finance/tombstones")
@handle_errors
async def list_finance_tombstones(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """کارت‌های حذف‌شده که دیگر خودکار ساخته نمی‌شوند — with their identities,
    so the owner can un-delete (clear) one and let the files rebuild it."""
    from app.services import finance_email_scan_service as _fs

    return {"ok": True, "success": True, "tombstones": await _fs.list_account_tombstones(db)}


class TombstoneClearPayload(BaseModel):
    index: Optional[int] = None  # omit → clear all


@router.post("/api/finance/tombstones/clear")
@handle_errors
async def clear_finance_tombstones(
    payload: TombstoneClearPayload,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """بازگردانی: drop tombstone(s) so the next sweep may rebuild the card
    from its files (the d2ddf0e self-heal, now gated behind owner intent)."""
    from app.services import finance_email_scan_service as _fs

    removed = await _fs.clear_account_tombstones(db, payload.index)
    await db.commit()
    return {"ok": True, "success": True, "cleared": removed}


@router.get("/api/finance/owner-accounts")
@handle_errors
async def list_owner_accounts(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """«حساب‌های من» — the owner-declared allow-list. When non-empty, the
    auto-feed only CREATES cards matching one of these entries; unknown
    signals are ignored instead of minted. Empty list = old behaviour."""
    from app.services import finance_email_scan_service as _fs

    return {"ok": True, "success": True, "accounts": await _fs.get_owner_accounts(db)}


class OwnerAccountPayload(BaseModel):
    action: str  # "add" | "remove"
    institution: Optional[str] = None
    account_ref: Optional[str] = None
    iban: Optional[str] = None
    label: Optional[str] = None
    index: Optional[int] = None  # for remove


@router.post("/api/finance/owner-accounts")
@handle_errors
async def mutate_owner_accounts(
    payload: OwnerAccountPayload,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    from app.services import finance_email_scan_service as _fs

    entries = await _fs.get_owner_accounts(db)
    if payload.action == "add":
        if not (payload.institution or payload.account_ref or payload.iban):
            raise ValueError("حداقل یکی از بانک/شمارهٔ حساب/IBAN لازم است")
        entries.append({
            "institution": (payload.institution or "").strip() or None,
            "account_ref": (payload.account_ref or "").strip() or None,
            "iban": (payload.iban or "").replace(" ", "").upper() or None,
            "label": (payload.label or "").strip() or None,
        })
    elif payload.action == "remove":
        if payload.index is None or not (0 <= payload.index < len(entries)):
            raise ValueError("index نامعتبر است")
        entries.pop(payload.index)
    else:
        raise ValueError("action must be 'add' or 'remove'")
    await _fs.set_owner_accounts(db, entries)
    await db.commit()
    return {"ok": True, "success": True, "accounts": entries}


@router.get("/api/finance/accounts/{account_id}/transactions")
@handle_errors
async def account_transactions(
    account_id: int,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """ریزِ گردشِ یک حساب — every recorded movement, newest first.

    This is the read side of the statement-line extraction: «از این حساب چه
    چیزی در فلان تاریخ کم شده» answered per transaction, not just as a closing
    balance. Same NULL-inclusive scope as the account list (job-created rows
    carry a NULL owner).
    """
    from app.services.inbox_service import scope_filter

    acc = (
        await db.execute(
            select(FinancialAccount).where(
                FinancialAccount.id == account_id,
                scope_filter(FinancialAccount.user_id, user_id),
            )
        )
    ).scalars().first()
    if acc is None:
        raise HTTPException(status_code=404, detail="Account not found")
    rows = (
        await db.execute(
            select(Transaction)
            .where(Transaction.account_id == account_id)
            .order_by(Transaction.occurred_on.desc().nullslast(), Transaction.id.desc())
            .limit(max(1, min(int(limit or 200), 1000)))
        )
    ).scalars().all()
    return {
        "ok": True,
        "success": True,
        "account_id": account_id,
        "account_name": acc.name,
        "currency": acc.currency,
        "transactions": [
            {
                "id": t.id,
                "date": t.occurred_on.isoformat() if t.occurred_on else None,
                "description": t.description,
                "amount": float(t.amount or 0),
                "type": t.transaction_type,
                "currency": t.currency or acc.currency,
                "source": t.source,
            }
            for t in rows
        ],
    }


# ── Per-kind endpoint aliases (audit task 4ae4b3ca ACs 16, 17, 22) ──


@router.post("/api/bank-accounts", response_model=FinancialAccountResponse, status_code=201)
@handle_errors
async def create_bank_account(
    payload: FinancialAccountCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    """AC 16 — thin alias that forces kind='bank' so the caller
    doesn't have to know about the discriminator column."""
    account = FinancialAccount(
        user_id=user_id,
        name=payload.name,
        kind="bank",
        institution=payload.institution,
        currency=payload.currency,
        balance=payload.balance,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    await record_activity(
        action="create", entity_type="account", entity_id=account.id,
        entity_label=account.name,
        detail=f"ایجاد حساب مالی ({account.kind})",
        user_id=user_id, db=db,
    )
    return account


@router.get("/api/bank-accounts", response_model=List[FinancialAccountResponse])
@handle_errors
async def list_bank_accounts(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    from app.services.inbox_service import scope_filter

    result = await db.execute(
        select(FinancialAccount).where(
            scope_filter(FinancialAccount.user_id, user_id), FinancialAccount.kind == "bank"
        )
    )
    return list(result.scalars().all())


@router.get("/api/broker-accounts", response_model=List[FinancialAccountResponse])
@handle_errors
async def list_broker_accounts(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    """AC 17 — same shape as the bank alias, filtered by kind='broker'."""
    from app.services.inbox_service import scope_filter

    result = await db.execute(
        select(FinancialAccount).where(
            scope_filter(FinancialAccount.user_id, user_id), FinancialAccount.kind == "broker"
        )
    )
    return list(result.scalars().all())


@router.post("/api/broker-accounts", response_model=FinancialAccountResponse, status_code=201)
@handle_errors
async def create_broker_account(
    payload: FinancialAccountCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    account = FinancialAccount(
        user_id=user_id,
        name=payload.name,
        kind="broker",
        institution=payload.institution,
        currency=payload.currency,
        balance=payload.balance,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    await record_activity(
        action="create", entity_type="account", entity_id=account.id,
        entity_label=account.name,
        detail=f"ایجاد حساب مالی ({account.kind})",
        user_id=user_id, db=db,
    )
    return account


@router.post("/api/exchange-accounts", response_model=FinancialAccountResponse, status_code=201)
@handle_errors
async def create_exchange_account(
    payload: FinancialAccountCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    """AC 22 — exchange-account flavour. kind forced to 'exchange'."""
    account = FinancialAccount(
        user_id=user_id,
        name=payload.name,
        kind="exchange",
        institution=payload.institution,
        currency=payload.currency,
        balance=payload.balance,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    await record_activity(
        action="create", entity_type="account", entity_id=account.id,
        entity_label=account.name,
        detail=f"ایجاد حساب مالی ({account.kind})",
        user_id=user_id, db=db,
    )
    return account


@router.get("/api/exchange-accounts", response_model=List[FinancialAccountResponse])
@handle_errors
async def list_exchange_accounts(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    from app.services.inbox_service import scope_filter

    result = await db.execute(
        select(FinancialAccount).where(
            scope_filter(FinancialAccount.user_id, user_id), FinancialAccount.kind == "exchange"
        )
    )
    return list(result.scalars().all())


# ── Transactions (audit task 4ae4b3ca AC 7) ─────────────────────────


class TransactionCreate(BaseModel):
    account_id: int
    amount: Decimal = Field(..., ge=0)
    transaction_type: str = Field(default="expense", pattern="^(income|expense)$")
    description: Optional[str] = Field(default=None, max_length=255)
    category: Optional[str] = Field(default=None, max_length=64)


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int
    amount: Decimal
    transaction_type: str
    description: Optional[str]
    category: Optional[str] = None
    timestamp: Optional[datetime] = None


@router.post(
    "/api/finance/transactions",
    response_model=TransactionResponse,
    status_code=201,
)
@handle_errors
async def create_transaction(
    payload: TransactionCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    """Record a transaction and update the parent account's balance (AC 7).

    income credits the account, expense debits it. The account must belong to
    the caller (scoped by user_id) — otherwise 404 so balances can't be moved
    on someone else's account.
    """
    result = await db.execute(
        select(FinancialAccount).where(
            (FinancialAccount.id == payload.account_id)
            & (FinancialAccount.user_id == user_id)
        )
    )
    account = result.scalar_one_or_none()
    if account is None:
        raise HTTPException(status_code=404, detail="account not found")

    txn = Transaction(
        account_id=payload.account_id,
        amount=payload.amount,
        transaction_type=payload.transaction_type,
        description=payload.description,
        category=getattr(payload, "category", None),
    )
    db.add(txn)
    # Update the running balance: income adds, expense subtracts.
    delta = payload.amount if payload.transaction_type == "income" else -payload.amount
    account.balance = (account.balance or Decimal(0)) + delta
    await db.commit()
    await db.refresh(txn)
    await record_activity(
        action="create", entity_type="transaction", entity_id=txn.id,
        entity_label=txn.description or f"{txn.transaction_type} {txn.amount}",
        context_type="account", context_id=account.id,
        detail=f"ثبت تراکنش {('واریز' if txn.transaction_type == 'income' else 'برداشت')} "
               f"{txn.amount} در حساب «{account.name}»",
        user_id=user_id, db=db,
    )
    return txn


@router.get(
    "/api/finance/transactions",
    response_model=List[TransactionResponse],
)
@handle_errors
async def list_transactions(
    account_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    """List the caller's transactions (optionally filtered by account).

    Scoped by joining to the caller's own accounts so one user can't read
    another's transaction history.
    """
    owned = select(FinancialAccount.id).where(FinancialAccount.user_id == user_id)
    stmt = select(Transaction).where(Transaction.account_id.in_(owned))
    if account_id is not None:
        stmt = stmt.where(Transaction.account_id == account_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ── Budget-aware purchase evaluation (audit task 4ae4b3ca AC 12) ─────


class PurchaseEvalRequest(BaseModel):
    amount: Decimal = Field(..., ge=0)
    label: Optional[str] = Field(default=None, max_length=255)


@router.post("/api/finance/budget/evaluate", tags=["finance"])
@handle_errors
async def evaluate_budget_purchase(
    payload: PurchaseEvalRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """Weigh a prospective purchase against the user's budget: returns a
    priority and an ``affordable`` flag, and fires a budget_alert notification
    when the amount exceeds the available budget (AC 12)."""
    from app.services.budget_service import evaluate_purchase

    return await evaluate_purchase(
        db, user_id=user_id, amount=payload.amount, label=payload.label
    )


class IngestMessageRequest(BaseModel):
    channel: str = Field(default="email", pattern="^(email|sms)$")
    body: str = Field(..., min_length=1, max_length=10_000)
    account_id: Optional[int] = None


@router.post("/api/finance/ingest-message", tags=["finance"])
@handle_errors
async def ingest_finance_message(
    payload: IngestMessageRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """Apply an inbound bank/exchange email or SMS to the user's balances
    (audit task 4ae4b3ca). An operator's IMAP poller / SMS gateway forwards the
    message body here; the parser extracts the balance, the matching account is
    updated, a Transaction records the delta, and the affordable-tasks reminder
    fires. Live mailbox/SMS polling is the only external piece (see TO-DO/)."""
    from app.services.finance_ingest_service import apply_bank_message

    return await apply_bank_message(
        db, user_id=user_id, channel=payload.channel, body=payload.body,
        account_id=payload.account_id,
    )


@router.post("/api/finance/scan-emails", tags=["finance"])
@handle_errors
async def scan_finance_emails_endpoint(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """مالیِ خودتغذیه — read the synced Gmail and create/update a card per
    detected financial account (balance, ref, IBAN), recording per-email
    deltas. Owner-triggered from the «مالی» page and run periodically by the
    jobs engine. Idempotent + conservative; created cards are marked «از ایمیل»
    so the owner can confirm/correct them."""
    from app.services.finance_email_scan_service import scan_finance_emails

    summary = await scan_finance_emails(db, user_id)
    return {"ok": True, "success": True, **summary}


@router.post("/api/finance/cleanup-auto-cards", tags=["finance"])
@handle_errors
async def cleanup_auto_cards(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """پاک‌سازیِ کارت‌های اشتباهِ خودکار — remove machine-created cards that were
    never real accounts (no balance, no movement). Cards the owner typed, and any
    card with a real balance or history, are never touched."""
    from app.services.finance_email_scan_service import cleanup_inferred_junk

    res = await cleanup_inferred_junk(db, user_id)
    return {"ok": True, "success": True, **res}


@router.get("/api/finance/affordable-tasks", tags=["finance"])
@handle_errors
async def list_affordable_tasks(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """Tasks the user can now afford given their budget — the reminder the memo
    asked for ("بهم اعلام بکنه"). Returns the affected task ids (a
    budget-affordability notification is fired per task)."""
    from app.services.budget_notification_service import notify_affordable_tasks

    return {"affordable_task_ids": await notify_affordable_tasks(db, user_id)}


@router.get("/api/finance/insights", tags=["finance"])
@handle_errors
async def finance_insights(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """AI analysis of the user's finances with budget-aware purchase
    suggestions (AC 13 — "باید توسط مدل‌های هوش مصنوعی داخلی هم آنالیز بشه").

    Returns ``{summary, suggestions, analysis, model_used}``; the analysis text
    comes from ``ai_service.generate_text`` (deterministic placeholder when no
    provider key is set, so this always responds 200)."""
    from app.services.finance_ai_service import analyze_finances

    return await analyze_finances(db, user_id)


# ── گزارش‌های مالی (phase 3, audit #19: the ledger was write-only) ─────


@router.get("/api/finance/balances-by-currency", tags=["finance"])
@handle_errors
async def finance_balances_by_currency(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
):
    """موجودی‌ها به تفکیک ارز — هیچ‌وقت ارزها با هم جمع نمی‌شوند (audit #20)."""
    from app.services.budget_service import balances_by_currency

    return {"ok": True, "balances": await balances_by_currency(db, user_id)}


@router.get("/api/finance/reports/monthly", tags=["finance"])
@handle_errors
async def finance_monthly_report(
    months: int = 6,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
):
    """گزارش ماهانهٔ درآمد/هزینه به تفکیک ارز + دسته — «گزارش واضح» مالی.

    Aggregation lives in finance_report_service.build_report (the SAME code path
    the periodic analysis job uses), in Python (not SQL date functions) so the
    exact same path runs on SQLite tests and Postgres production.
    """
    from app.services.finance_report_service import build_report

    out = await build_report(db, user_id=user_id, months=months)
    return {"ok": True, "months": out}
