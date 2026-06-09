"""/api/neteller/* — Neteller wallet snapshot (task 32ade384, step 13).

``GET /api/neteller/wallet`` returns the latest stored snapshot;
``POST /api/neteller/wallet`` records one extracted from the dashboard
(attachment #39). There is deliberately no account-number field — it was
not shown in the source. Balance is a decimal (AED 2,000.88), and the
dashboard nav list is preserved.
"""
import json
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.neteller_wallet import NetellerWalletSnapshot


router = APIRouter()


class NetellerWalletCreate(BaseModel):
    account_holder_name: Optional[str] = Field(default=None, max_length=128)
    loyalty_points: Optional[int] = None
    balance: Decimal = Decimal("0")
    currency: str = Field(default="AED", max_length=8)
    dashboard_url: Optional[str] = Field(default=None, max_length=255)
    menu_items: Optional[List[str]] = None


class NetellerWalletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    account_holder_name: Optional[str]
    loyalty_points: Optional[int]
    balance: Decimal
    currency: str
    dashboard_url: Optional[str]
    menu_items: Optional[List[str]] = None

    @classmethod
    def from_model(cls, m: NetellerWalletSnapshot) -> "NetellerWalletResponse":
        return cls(
            id=m.id,
            user_id=m.user_id,
            account_holder_name=m.account_holder_name,
            loyalty_points=m.loyalty_points,
            balance=m.balance,
            currency=m.currency,
            dashboard_url=m.dashboard_url,
            menu_items=json.loads(m.menu_items) if m.menu_items else None,
        )


@router.post(
    "/api/neteller/wallet",
    response_model=NetellerWalletResponse,
    status_code=201,
)
@handle_errors
async def create_neteller_snapshot(
    payload: NetellerWalletCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    snapshot = NetellerWalletSnapshot(
        user_id=user_id,
        account_holder_name=payload.account_holder_name,
        loyalty_points=payload.loyalty_points,
        balance=payload.balance,
        currency=payload.currency,
        dashboard_url=payload.dashboard_url,
        menu_items=json.dumps(payload.menu_items) if payload.menu_items else None,
    )
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return NetellerWalletResponse.from_model(snapshot)


@router.get(
    "/api/neteller/wallet",
    response_model=NetellerWalletResponse,
)
@handle_errors
async def get_neteller_wallet(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(
        select(NetellerWalletSnapshot)
        .where(NetellerWalletSnapshot.user_id == user_id)
        .order_by(desc(NetellerWalletSnapshot.id))
    )
    snapshot = result.scalars().first()
    if snapshot is None:
        raise HTTPException(status_code=404, detail="No Neteller wallet snapshot")
    return NetellerWalletResponse.from_model(snapshot)
