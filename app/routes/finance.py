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
    stmt = select(FinancialAccount).where(FinancialAccount.user_id == user_id)
    if kind:
        if kind not in ("bank", "broker", "exchange"):
            raise HTTPException(status_code=400, detail="invalid kind filter")
        stmt = stmt.where(FinancialAccount.kind == kind)
    result = await db.execute(stmt)
    return list(result.scalars().all())


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
    result = await db.execute(
        select(FinancialAccount).where(
            (FinancialAccount.user_id == user_id) & (FinancialAccount.kind == "bank")
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
    result = await db.execute(
        select(FinancialAccount).where(
            (FinancialAccount.user_id == user_id) & (FinancialAccount.kind == "broker")
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
    result = await db.execute(
        select(FinancialAccount).where(
            (FinancialAccount.user_id == user_id) & (FinancialAccount.kind == "exchange")
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
