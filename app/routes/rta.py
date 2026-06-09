"""/api/rta/* — Dubai RTA dashboard snapshot (task 32ade384, step 12).

Stores and reads back the RTA app dashboard (attachment #38): greeting
name, Salik toll account + balance, parking balance, and the fines
summary. Balances are decimals, not strings.
"""
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.rta_account import RTAAccount


router = APIRouter()


class RTADashboardCreate(BaseModel):
    user_name: Optional[str] = Field(default=None, max_length=128)
    salik_account_number: Optional[str] = Field(default=None, max_length=32)
    salik_balance: Decimal = Decimal("0")
    parking_balance: Decimal = Decimal("0")
    fines_payable: int = 0
    fines_non_payable: int = 0
    black_points: int = 0
    currency_symbol: Optional[str] = Field(default=None, max_length=8)


class RTADashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    user_name: Optional[str]
    salik_account_number: Optional[str]
    salik_balance: Decimal
    parking_balance: Decimal
    fines_payable: int
    fines_non_payable: int
    black_points: int
    currency_symbol: Optional[str]


@router.post(
    "/api/rta/dashboard",
    response_model=RTADashboardResponse,
    status_code=201,
)
@handle_errors
async def create_rta_dashboard(
    payload: RTADashboardCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    account = RTAAccount(
        user_id=user_id,
        user_name=payload.user_name,
        salik_account_number=payload.salik_account_number,
        salik_balance=payload.salik_balance,
        parking_balance=payload.parking_balance,
        fines_payable=payload.fines_payable,
        fines_non_payable=payload.fines_non_payable,
        black_points=payload.black_points,
        currency_symbol=payload.currency_symbol,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@router.get(
    "/api/rta/dashboard",
    response_model=RTADashboardResponse,
)
@handle_errors
async def get_rta_dashboard(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(
        select(RTAAccount)
        .where(RTAAccount.user_id == user_id)
        .order_by(desc(RTAAccount.id))
    )
    account = result.scalars().first()
    if account is None:
        raise HTTPException(status_code=404, detail="No RTA dashboard snapshot")
    return account
