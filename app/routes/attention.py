"""/api/attention — موتور توجه و یادآوری (phase 3).

Thin shells over ``app/services/attention_service``:

* ``GET  /api/attention/scan``          — dry-run rule scan (nothing sent)
* ``POST /api/attention/run``           — scan + send fresh alerts (respects cooldowns)
* ``POST /api/attention/morning-brief`` — send the morning brief now (force)
* ``GET  /api/attention/settings``      — current engine settings
* ``PUT  /api/attention/settings``      — update settings (partial)
"""
from typing import Any, Dict

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
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


# The engine's own bookkeeping stamps. A settings form naturally echoes the
# whole GET payload back on save; if these keys passed through, a stale
# last_brief_date would re-arm today's already-sent brief. Only the loop may
# write them.
_INTERNAL_STAMPS = ("last_brief_date", "last_scan_at")


@router.put("/api/attention/settings", tags=["attention"])
@handle_errors
async def put_attention_settings(
    partial: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    cleaned = {k: v for k, v in (partial or {}).items() if k not in _INTERNAL_STAMPS}
    cfg = await attention_service.update_settings(db, cleaned)
    return {"ok": True, "success": True, "settings": cfg}


@router.post("/api/attention/create-task", tags=["attention"])
@handle_errors
async def create_task_from_finding(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """ساخت تسک از یک یافتهٔ موتور توجه — بستن حلقهٔ «دیدن → اقدام»
    (phase 3, audit #10: هشدار انقضا هرگز تسک تمدید نمی‌ساخت)."""
    from datetime import date as _date

    from app.models.task import Task, TaskPriority, TaskStatus
    from app.services.activity_log_service import record_activity

    label = str(payload.get("label") or "").strip()
    rule = str(payload.get("rule") or "").strip()
    if not label:
        raise HTTPException(status_code=400, detail="label is required")
    title_by_rule = {
        "license_expiry": f"تمدید گواهینامه — {label}",
        "document_expiry": f"تمدید مدرک — {label}",
        "subscription_renewal": f"رسیدگی به اشتراک {label}",
        "rta_fines": f"پرداخت جریمهٔ RTA — {label}",
        "person_birthday": f"تبریک تولد {label}",
        "person_follow_up": f"پیگیری {label}",
    }
    title = title_by_rule.get(rule, f"رسیدگی: {label}")
    due = None
    raw_date = payload.get("date")
    if isinstance(raw_date, str) and raw_date.strip():
        try:
            due = _date.fromisoformat(raw_date.strip()[:10])
        except ValueError:
            due = None
    task = Task(
        title=title[:200],
        description=str(payload.get("detail") or "")[:1000] or None,
        status=TaskStatus.TODO,
        priority=TaskPriority.HIGH,
        user_id=user_id if user_id != 0 else None,
        due_date=due,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    await record_activity(
        action="create", entity_type="task", entity_id=task.id,
        entity_label=task.title, detail=f"ساخت تسک از هشدار توجه ({rule})",
        user_id=user_id, db=db,
    )
    return {"ok": True, "task_id": task.id, "title": task.title}
