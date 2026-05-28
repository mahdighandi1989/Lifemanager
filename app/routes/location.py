"""/api/location — ingest + history of geolocation pings (task 2165524b)."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.user_location import UserLocation


router = APIRouter()


class LocationPing(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy_m: Optional[float] = Field(default=None, ge=0)


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    latitude: float
    longitude: float
    accuracy_m: Optional[float] = None
    timestamp: Optional[datetime] = None


@router.post(
    "/api/location",
    response_model=LocationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["location"],
)
@handle_errors
async def record_location(
    payload: LocationPing = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    ping = UserLocation(
        user_id=user_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy_m=payload.accuracy_m,
    )
    db.add(ping)
    await db.commit()
    await db.refresh(ping)
    return ping


@router.get(
    "/api/location/history",
    response_model=List[LocationResponse],
    tags=["location"],
)
@handle_errors
async def get_location_history(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    stmt = (
        select(UserLocation)
        .where(UserLocation.user_id == user_id)
        .order_by(UserLocation.timestamp.desc())
        .limit(max(1, min(limit, 1000)))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
