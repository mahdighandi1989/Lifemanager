"""/api/attention — موتور توجه و یادآوری (phase 3).

Thin shells over ``app/services/attention_service``:

* ``GET  /api/attention/scan``          — dry-run rule scan (nothing sent)
* ``POST /api/attention/run``           — scan + send fresh alerts (respects cooldowns)
* ``POST /api/attention/morning-brief`` — send the morning brief now (force)
* ``GET  /api/attention/settings``      — current engine settings
* ``PUT  /api/attention/settings``      — update settings (partial)
"""
from typing import Any, Dict

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services import attention_service

router = APIRouter()


@router.get("/api/attention/scan", tags=["attention"])
@handle_errors
async def attention_scan(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    findings = await attention_service.scan_findings(db, user_id=user_id)
    return {
        "ok": True,
        "success": True,
        "findings": findings,
        "count": len(findings),
        "rule_titles": attention_service.RULE_TITLES_FA,
    }


@router.post("/api/attention/run", tags=["attention"])
@handle_errors
async def attention_run(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    result = await attention_service.send_alerts(db, user_id=user_id)
    return {
        "ok": True,
        "success": True,
        "sent_rules": result["sent_rules"],
        "fresh_count": len(result["fresh"]),
        "findings_count": len(result["findings"]),
    }


@router.post("/api/attention/morning-brief", tags=["attention"])
@handle_errors
async def attention_morning_brief(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    result = await attention_service.send_morning_brief(db, user_id=user_id, force=True)
    return {"ok": True, "success": True, **result}


@router.get("/api/attention/settings", tags=["attention"])
@handle_errors
async def get_attention_settings(db: AsyncSession = Depends(get_db)) -> dict:
    cfg = await attention_service.get_settings(db)
    return {"ok": True, "success": True, "settings": cfg}


@router.put("/api/attention/settings", tags=["attention"])
@handle_errors
async def put_attention_settings(
    partial: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    cfg = await attention_service.update_settings(db, partial or {})
    return {"ok": True, "success": True, "settings": cfg}
