"""«گوگلِ من» — /api/google/*

Gmail + Calendar mirror riding the shared Google connection (the Drive
OAuth token, now with gmail.readonly / gmail.send / calendar.readonly).
Read endpoints are DB-only (no network); /test and /sync touch Google.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.personal_sync import PersonalEmail, PersonalEvent
from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.google_sync_schema import GoogleSettingsUpdate, GoogleTaskCreate
from app.services.activity_log_service import record_activity
from app.services.google_sync import (
    calendar_service,
    digest_service,
    engine as g_engine,
    gmail_service,
    triage_service,
)

router = APIRouter()


def _iso(value) -> Optional[str]:
    return value.isoformat() if value else None


def _ser_email(e: PersonalEmail) -> dict:
    return {
        "id": e.id,
        "from_addr": e.from_addr,
        "subject": e.subject,
        "snippet": e.snippet,
        "received_at": _iso(e.received_at),
        "is_unread": e.is_unread,
        "ai_category": e.ai_category,
        "ai_summary": e.ai_summary,
        "needs_action": e.needs_action,
        "suggested_task": e.suggested_task,
        "task_id": e.task_id,
        "ai_model": e.ai_model,
    }


def _ser_event(e: PersonalEvent) -> dict:
    return {
        "id": e.id,
        "summary": e.summary,
        "description": e.description,
        "location": e.location,
        "start_at": _iso(e.start_at),
        "end_at": _iso(e.end_at),
        "all_day": e.all_day,
        "status": e.status,
        "html_link": e.html_link,
        "task_id": e.task_id,
    }


@router.get("/api/google/status", tags=["google-sync"])
@handle_errors
async def google_status(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    from app.services import drive_settings_service as dss

    cfg = await g_engine.load_settings(db)
    emails_total = (await db.execute(select(func.count(PersonalEmail.id)))).scalar() or 0
    actions = (
        await db.execute(
            select(func.count(PersonalEmail.id)).where(
                PersonalEmail.needs_action.is_(True), PersonalEmail.task_id.is_(None)
            )
        )
    ).scalar() or 0
    now = datetime.now(timezone.utc)
    upcoming = (
        await db.execute(
            select(func.count(PersonalEvent.id)).where(
                PersonalEvent.start_at >= now,
                PersonalEvent.start_at <= now + timedelta(days=7),
                PersonalEvent.status != "cancelled",
            )
        )
    ).scalar() or 0
    return {
        "ok": True,
        "connected": await dss.is_connected(db),
        "account_email": await dss.get_account_email(db),
        "counts": {
            "emails": emails_total,
            "action_emails": actions,
            "events_7d": upcoming,
        },
        "last_gmail_poll_at": cfg.get("last_gmail_poll_at"),
        "last_calendar_poll_at": cfg.get("last_calendar_poll_at"),
        "last_digest_date": cfg.get("last_digest_date"),
        "settings": cfg,
        "editable": list(g_engine.EDITABLE_FIELDS),
    }


@router.post("/api/google/test", tags=["google-sync"])
@handle_errors
async def google_test(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Live probe: does the stored token cover Gmail? (403 ⇒ reconnect)."""
    return await gmail_service.probe(db)


@router.post("/api/google/sync", tags=["google-sync"])
@handle_errors
async def google_sync_now(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    cfg = await g_engine.load_settings(db)
    gmail = await gmail_service.sync_gmail(db, max_results=int(cfg.get("gmail_fetch_limit", 25)))
    triage = await triage_service.analyze_new_emails(
        db, limit=int(cfg.get("triage_batch", 10)), user_id=user_id
    )
    calendar = await calendar_service.sync_calendar(
        db, days=int(cfg.get("calendar_window_days", 14))
    )
    if gmail.get("ok") or calendar.get("ok"):
        await record_activity(
            action="google_sync",
            entity_type="personal_email",
            entity_label="گوگل",
            detail=(
                f"همگام‌سازی گوگل: {gmail.get('new', 0)} ایمیل جدید، "
                f"{calendar.get('new', 0)} رویداد جدید، {triage.get('analyzed', 0)} تحلیل"
            ),
            user_id=user_id,
            db=db,
        )
    return {"ok": True, "gmail": gmail, "triage": triage, "calendar": calendar}


@router.get("/api/google/emails", tags=["google-sync"])
@handle_errors
async def list_personal_emails(
    needs_action: Optional[bool] = Query(default=None),
    days: int = Query(default=7, ge=1, le=90),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    query = select(PersonalEmail).where(PersonalEmail.received_at >= since)
    if needs_action is not None:
        query = query.where(PersonalEmail.needs_action.is_(needs_action))
        if needs_action:
            query = query.where(PersonalEmail.task_id.is_(None))
    rows = (
        (await db.execute(query.order_by(PersonalEmail.received_at.desc()).limit(limit)))
        .scalars()
        .all()
    )
    return {"ok": True, "emails": [_ser_email(e) for e in rows], "count": len(rows)}


@router.get("/api/google/events", tags=["google-sync"])
@handle_errors
async def list_personal_events(
    days: int = Query(default=7, ge=1, le=60),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    now = datetime.now(timezone.utc)
    rows = (
        (
            await db.execute(
                select(PersonalEvent)
                .where(
                    PersonalEvent.start_at >= now - timedelta(days=1),
                    PersonalEvent.start_at <= now + timedelta(days=days),
                )
                .order_by(PersonalEvent.start_at)
            )
        )
        .scalars()
        .all()
    )
    return {"ok": True, "events": [_ser_event(e) for e in rows], "count": len(rows)}


async def _create_task(
    db: AsyncSession, user_id: int, title: str, description: Optional[str], payload: GoogleTaskCreate
) -> Task:
    task = Task(
        title=(payload.title or title)[:255],
        description=payload.description or description,
        status=TaskStatus.TODO,
        priority=TaskPriority(payload.priority or "medium"),
        user_id=user_id if user_id else None,
        due_date=payload.due_date,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.post(
    "/api/google/emails/{email_id}/create-task",
    status_code=status.HTTP_201_CREATED,
    tags=["google-sync"],
)
@handle_errors
async def create_task_from_email(
    email_id: str,
    payload: GoogleTaskCreate = Body(default=GoogleTaskCreate()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    email = await db.get(PersonalEmail, email_id)
    if email is None:
        raise HTTPException(status_code=404, detail="email not found")
    title = email.suggested_task or f"رسیدگی به ایمیل: {(email.subject or 'بدون موضوع')[:180]}"
    description = f"از: {email.from_addr or '—'}\n{email.ai_summary or email.snippet or ''}"
    task = await _create_task(db, user_id, title, description, payload)
    email.task_id = task.id
    await db.commit()
    await record_activity(
        action="google_task_created",
        entity_type="personal_email",
        entity_id=email.id,
        entity_label=(email.subject or "ایمیل")[:120],
        detail=f"وظیفه از ایمیل ساخته شد: {task.title[:150]}",
        user_id=user_id,
        db=db,
    )
    return {"ok": True, "task_id": task.id, "title": task.title}


@router.post(
    "/api/google/events/{event_id}/create-task",
    status_code=status.HTTP_201_CREATED,
    tags=["google-sync"],
)
@handle_errors
async def create_task_from_event(
    event_id: str,
    payload: GoogleTaskCreate = Body(default=GoogleTaskCreate()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    event = await db.get(PersonalEvent, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="event not found")
    title = f"آمادگی برای: {(event.summary or 'رویداد')[:200]}"
    start_local = event.start_at
    due = None
    if start_local is not None:
        due = (start_local if start_local.tzinfo else start_local.replace(tzinfo=timezone.utc)).date()
    if payload.due_date is None:
        payload = payload.model_copy(update={"due_date": due})
    description = event.description or event.location
    task = await _create_task(db, user_id, title, description, payload)
    event.task_id = task.id
    await db.commit()
    await record_activity(
        action="google_task_created",
        entity_type="personal_event",
        entity_id=event.id,
        entity_label=(event.summary or "رویداد")[:120],
        detail=f"وظیفه از رویداد تقویم ساخته شد: {task.title[:150]}",
        user_id=user_id,
        db=db,
    )
    return {"ok": True, "task_id": task.id, "title": task.title}


@router.post("/api/google/digest/run", tags=["google-sync"])
@handle_errors
async def run_digest_now(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    cfg = await g_engine.load_settings(db)
    result = await digest_service.send_digest(
        db,
        tz_offset_minutes=int(cfg.get("tz_offset_minutes", 240) or 0),
        email_enabled=bool(cfg.get("digest_email_enabled", True)),
        user_id=user_id,
    )
    return result


@router.get("/api/google/settings", tags=["google-sync"])
@handle_errors
async def get_google_settings(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    cfg = await g_engine.load_settings(db)
    return {"ok": True, "settings": cfg, "editable": list(g_engine.EDITABLE_FIELDS)}


@router.put("/api/google/settings", tags=["google-sync"])
@handle_errors
async def put_google_settings(
    payload: GoogleSettingsUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    cfg = await g_engine.update_settings(db, payload.model_dump(exclude_none=True))
    return {"ok": True, "settings": cfg}
