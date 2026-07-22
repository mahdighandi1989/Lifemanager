"""/api/sahat — نقشهٔ ساحت‌ها (the human-dimensions map over the whole system).

* ``GET  /api/sahat/map``      — the live map: six sahats, weighted scores,
  backbone (نخِ تسبیح) progress, attention items, + score history for trends.
* ``POST /api/sahat/refresh``  — build + persist one snapshot (adds a trend point).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors

router = APIRouter()


@router.get("/api/sahat/map", tags=["sahat"])
@handle_errors
async def get_map(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.services.sahat_service import build_sahat_map, get_sahat_history

    data = await build_sahat_map(db, user_id)
    data["history"] = await get_sahat_history(db, user_id)
    return {"ok": True, "success": True, **data}


@router.post("/api/sahat/refresh", tags=["sahat"])
@handle_errors
async def refresh_map(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.services.sahat_service import get_sahat_history, snapshot_sahat_map

    data = await snapshot_sahat_map(db, user_id)
    data["history"] = await get_sahat_history(db, user_id)
    return {"ok": True, "success": True, **data}
