"""/api/subscriptions/* — SubscriptionAccount CRUD (task 32ade384).

Stores streaming / subscription accounts (e.g. the Netflix Account page
in attachment #27). Per-user scoped, following the same auth policy as
the finance routes (``get_required_user_id`` honours ``REQUIRE_AUTH``).

Privacy: the request schema only accepts a 4-digit ``payment_card_last4``
(``max_length=4``); there is no field through which a full card number
could be persisted.
"""
from typing import List, Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.subscription_account import SubscriptionAccount


router = APIRouter()


class SubscriptionAccountCreate(BaseModel):
    provider: str = Field(default="netflix.com", max_length=64)
    account_email: Optional[str] = Field(default=None, max_length=255)
    mobile_phone: Optional[str] = Field(default=None, max_length=64)
    member_since: Optional[str] = Field(default=None, max_length=64)
    plan: Optional[str] = Field(default=None, max_length=128)
    next_payment_date: Optional[str] = Field(default=None, max_length=64)
    payment_method_brand: Optional[str] = Field(default=None, max_length=32)
    # Only ever the last 4 digits — never the full PAN.
    payment_card_last4: Optional[str] = Field(default=None, max_length=4)
    inferred_name_from_email: Optional[str] = Field(default=None, max_length=128)
    inferred_birth_year_from_email: Optional[int] = None
    is_inferred_identity: bool = True


class SubscriptionAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    provider: str
    account_email: Optional[str]
    mobile_phone: Optional[str]
    member_since: Optional[str]
    plan: Optional[str]
    next_payment_date: Optional[str]
    payment_method_brand: Optional[str]
    payment_card_last4: Optional[str]
    inferred_name_from_email: Optional[str]
    inferred_birth_year_from_email: Optional[int]
    is_inferred_identity: bool


@router.post(
    "/api/subscriptions",
    response_model=SubscriptionAccountResponse,
    status_code=201,
)
@handle_errors
async def create_subscription_account(
    payload: SubscriptionAccountCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    account = SubscriptionAccount(
        user_id=user_id,
        provider=payload.provider,
        account_email=payload.account_email,
        mobile_phone=payload.mobile_phone,
        member_since=payload.member_since,
        plan=payload.plan,
        next_payment_date=payload.next_payment_date,
        payment_method_brand=payload.payment_method_brand,
        payment_card_last4=payload.payment_card_last4,
        inferred_name_from_email=payload.inferred_name_from_email,
        inferred_birth_year_from_email=payload.inferred_birth_year_from_email,
        is_inferred_identity=payload.is_inferred_identity,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@router.get(
    "/api/subscriptions",
    response_model=List[SubscriptionAccountResponse],
)
@handle_errors
async def list_subscription_accounts(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(
        select(SubscriptionAccount).where(SubscriptionAccount.user_id == user_id)
    )
    return list(result.scalars().all())
