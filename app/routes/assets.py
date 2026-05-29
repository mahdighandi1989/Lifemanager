"""/api/assets — list the user's scanned assets (audit task 217909d2).

The scanner that populates UserAsset rows is still a TODO (filesystem walk +
WebSocket progress), but the read side ships now so the AssetDashboard can
render whatever has been recorded, grouped by type.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.user_asset import UserAsset

router = APIRouter()


class UserAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    asset_type: Optional[str] = None
    name: str
    path: Optional[str] = None


@router.get("/api/assets", response_model=List[UserAssetResponse], tags=["assets"])
@handle_errors
async def list_assets(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[UserAsset]:
    result = await db.execute(
        select(UserAsset).where(UserAsset.user_id == user_id)
    )
    return list(result.scalars().all())
