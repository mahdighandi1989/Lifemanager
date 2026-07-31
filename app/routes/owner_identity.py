"""/api/identity-profile — «من که هستم»، خوانا و قابلِ ویرایش.

توجه (درسِ system_map): این ماژول نباید ``from __future__ import annotations``
داشته باشد — @handle_errors annotationها را در فضای نامِ app/middleware.py حل
می‌کند و آنجا Request/AsyncSession تعریف نیستند، پس همه‌چیز ۴۲۲ می‌شود.
"""
import logging
from typing import Any, Dict

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.services import owner_identity_service as ident

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/identity-profile", tags=["identity-profile"])
@handle_errors
async def read_identity(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """همهٔ فیلدها — حتی خالی‌ها، تا معلوم باشد چه چیزی را هنوز نمی‌دانیم."""
    return {"ok": True, "success": True, **await ident.get_identity(db, user_id)}


@router.post("/api/identity-profile/refresh", tags=["identity-profile"])
@handle_errors
async def refresh_identity(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """استخراجِ دوباره از همهٔ داده‌ها. فیلدی که خودت ویرایش کرده‌ای دست نمی‌خورد."""
    res = await ident.refresh(db, user_id)
    return {"ok": True, "success": True, **res, **await ident.get_identity(db, user_id)}


@router.put("/api/identity-profile/{field}", tags=["identity-profile"])
@handle_errors
async def edit_identity_field(
    field: str,
    payload: Dict[str, Any] = Body(default={}),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """ویرایشِ دستی — حرفِ تو قفل می‌شود و استخراجِ خودکار رویش نمی‌نویسد.
    مقدارِ خالی یعنی «قفل را بردار و دوباره خودت پیدا کن»."""
    return {"ok": True, "success": True,
            **await ident.set_field(db, user_id, field, str(payload.get("value") or ""),
                                    lock=bool(payload.get("lock", True)))}


@router.post("/api/identity-profile/ask-missing", tags=["identity-profile"])
@handle_errors
async def ask_missing_identity(
    limit: int = 2,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """برای فیلدهای مهمِ خالی، در تلگرام بپرس (با سقف، تا سیل نشود)."""
    return {"ok": True, "success": True, **await ident.ask_missing(db, user_id, limit=limit)}
