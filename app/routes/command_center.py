"""/api/command-center — میز فرمان «امروز من».

One read-only aggregate powering the Dashboard's Today view: overdue /
today / upcoming tasks, due + starred todo items, unread notifications,
pending inbox captures, and the legacy stat-card counters — one round
trip instead of five. Scoping matches each bucket's home router.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services.command_center_service import build_today

router = APIRouter()


@router.get("/api/command-center/today", tags=["command-center"])
@handle_errors
async def command_center_today(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    data = await build_today(db, user_id)
    return {"ok": True, "success": True, **data}
