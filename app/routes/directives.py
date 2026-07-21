"""/api/directives — موتور نهادینه‌سازی (the internalization engine surface).

Thin shells over ``app/services/directive_service``. Living directives are
extracted from the owner's lists/writings, surfaced a few per day as commands,
followed up on, and tracked toward internalization.

Auth: reads are open (single-tenant, same as the rest of the app); every
MUTATION is gated by ``enforce_auth_when_required`` so flipping
``REQUIRE_AUTH=true`` closes them and an invalid token is always rejected —
the same seam backup/finance/trash use.
"""
from typing import Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors
from app.services import directive_service as svc

router = APIRouter()


class ManualDirective(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    domain: Optional[str] = Field(None, max_length=32)
    cadence: str = Field("daily", max_length=24)
    kind: str = Field("practice", max_length=16)
    weight: int = Field(3, ge=1, le=5)
    detail: Optional[str] = Field(None, max_length=2000)
    next_step: Optional[str] = Field(None, max_length=500)


class MarkBody(BaseModel):
    note: Optional[str] = Field(None, max_length=1000)


class ConfigPatch(BaseModel):
    mode: Optional[str] = Field(None, pattern="^(strict|balanced|gentle)$")
    channel: Optional[str] = Field(None, pattern="^(both|web|telegram)$")
    enabled: Optional[bool] = None
    brief_hour: Optional[int] = Field(None, ge=0, le=23)
    followup_hour: Optional[int] = Field(None, ge=0, le=23)
    tz_offset_minutes: Optional[int] = Field(None, ge=-720, le=840)
    daily_count: Optional[int] = Field(None, ge=1, le=12)


@router.get("/api/directives", tags=["directives"])
@handle_errors
async def list_directives(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    items = await svc.list_directives(db, user_id, status=status)
    return {"ok": True, "success": True, "directives": items, "count": len(items)}


@router.get("/api/directives/today", tags=["directives"])
@handle_errors
async def today_commands(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    # Opening the day surfaces it (persist) so the web + Telegram + page agree.
    res = await svc.select_today_commands(db, user_id, persist=True)
    return {"ok": True, "success": True, **res}


@router.get("/api/directives/report", tags=["directives"])
@handle_errors
async def report(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    rep = await svc.growth_report(db, user_id)
    return {"ok": True, "success": True, "report": rep}


@router.get("/api/directives/config", tags=["directives"])
@handle_errors
async def get_config(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    cfg = await svc.get_config(db)
    return {"ok": True, "success": True, "config": cfg}


@router.put("/api/directives/config", tags=["directives"])
@handle_errors
async def put_config(
    patch: ConfigPatch = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    cfg = await svc.update_config(db, patch.model_dump(exclude_none=True))
    return {"ok": True, "success": True, "config": cfg}


@router.post("/api/directives/extract", tags=["directives"])
@handle_errors
async def extract(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    res = await svc.extract_directives(db, user_id)
    return {"success": res.get("ok", False), **res}


@router.post("/api/directives", tags=["directives"])
@handle_errors
async def add(
    payload: ManualDirective = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    d = await svc.add_manual(
        db, user_id,
        title=payload.title, domain=payload.domain, cadence=payload.cadence,
        kind=payload.kind, weight=payload.weight, detail=payload.detail,
        next_step=payload.next_step,
    )
    return {"ok": True, "success": True, "directive": svc.directive_dict(d)}


@router.post("/api/directives/{directive_id}/approve", tags=["directives"])
@handle_errors
async def approve(
    directive_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    d = await svc.set_status(db, directive_id, "active", user_id)
    if d is None:
        return {"ok": False, "success": False, "error": "not_found"}
    return {"ok": True, "success": True, "directive": svc.directive_dict(d)}


@router.post("/api/directives/{directive_id}/reject", tags=["directives"])
@handle_errors
async def reject(
    directive_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    d = await svc.set_status(db, directive_id, "archived", user_id)
    if d is None:
        return {"ok": False, "success": False, "error": "not_found"}
    return {"ok": True, "success": True, "directive": svc.directive_dict(d)}


@router.post("/api/directives/{directive_id}/done", tags=["directives"])
@handle_errors
async def mark_done(
    directive_id: int,
    body: MarkBody = Body(default=MarkBody()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    res = await svc.mark(db, directive_id, True, user_id, note=body.note)
    if res is None:
        return {"ok": False, "success": False, "error": "not_found"}
    return {"ok": True, "success": True, **res}


@router.post("/api/directives/{directive_id}/miss", tags=["directives"])
@handle_errors
async def mark_miss(
    directive_id: int,
    body: MarkBody = Body(default=MarkBody()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    res = await svc.mark(db, directive_id, False, user_id, note=body.note)
    if res is None:
        return {"ok": False, "success": False, "error": "not_found"}
    return {"ok": True, "success": True, **res}
