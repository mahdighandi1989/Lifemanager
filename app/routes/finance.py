"""/api/finance/* — Income / Asset / FinancialAccount CRUD
(audit task 4ae4b3ca).

Thin shells over the ORM models — no service layer because the
operations are flat (per-user list/create with no cross-row logic).
"""
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.finance import Asset, FinancialAccount, Income


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
    user_id: int = Depends(get_optional_user_id),
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
    return income


@router.get("/api/finance/incomes", response_model=List[IncomeResponse])
@handle_errors
async def list_incomes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(select(Income).where(Income.user_id == user_id))
    return list(result.scalars().all())


# ── Asset ───────────────────────────────────────────────────────────


@router.post("/api/finance/assets", response_model=AssetResponse, status_code=201)
@handle_errors
async def create_asset(
    payload: AssetCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
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
    return asset


@router.get("/api/finance/assets", response_model=List[AssetResponse])
@handle_errors
async def list_assets(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
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
    user_id: int = Depends(get_optional_user_id),
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
    return account


@router.get(
    "/api/finance/accounts",
    response_model=List[FinancialAccountResponse],
)
@handle_errors
async def list_financial_accounts(
    kind: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    stmt = select(FinancialAccount).where(FinancialAccount.user_id == user_id)
    if kind:
        if kind not in ("bank", "broker", "exchange"):
            raise HTTPException(status_code=400, detail="invalid kind filter")
        stmt = stmt.where(FinancialAccount.kind == kind)
    result = await db.execute(stmt)
    return list(result.scalars().all())
