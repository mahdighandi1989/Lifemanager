"""/api/assets — list + scan the user's assets (audit task 217909d2).

Read side (GET) feeds the AssetDashboard; POST /api/assets/scan walks a
server-side directory and records UserAsset rows; the scan-status WebSocket
streams per-file progress.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.user_asset import UserAsset
from app.services.asset_scan_service import scan_directory

router = APIRouter()


class UserAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    asset_type: Optional[str] = None
    name: str
    path: Optional[str] = None


class ScanRequest(BaseModel):
    path: str


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


@router.post("/api/assets/scan", tags=["assets"])
@handle_errors
async def scan_assets(
    payload: ScanRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC2: walk ``payload.path`` and record any newly-found files as
    UserAsset rows (deduped by path). Returns scan counts + 'completed'."""
    found = scan_directory(payload.path)
    inserted = 0
    for item in found:
        existing = (
            await db.execute(
                select(UserAsset).where(
                    UserAsset.user_id == user_id, UserAsset.path == item["path"]
                )
            )
        ).scalar_one_or_none()
        if existing is None:
            db.add(
                UserAsset(
                    user_id=user_id,
                    name=item["name"],
                    asset_type=item["asset_type"],
                    path=item["path"],
                    last_scanned_at=func.now(),
                )
            )
            inserted += 1
    await db.commit()
    return {"status": "completed", "scanned": len(found), "inserted": inserted}


@router.websocket("/api/assets/scan-status")
async def scan_status_ws(websocket: WebSocket) -> None:
    """AC3: stream scan progress. The client connects and sends {"path": ...};
    the server emits one {current, total, file} message per file, then a final
    {status: 'completed'}. Persistence is the job of POST /api/assets/scan — the
    socket is purely the progress channel, so it stays DB-free and fast."""
    await websocket.accept()
    try:
        req = await websocket.receive_json()
        path = (req or {}).get("path", "")
        found = scan_directory(path)
        total = len(found)
        for idx, item in enumerate(found, start=1):
            await websocket.send_json(
                {"current": idx, "total": total, "file": item["name"]}
            )
        await websocket.send_json({"status": "completed", "scanned": total})
    except WebSocketDisconnect:
        return
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
