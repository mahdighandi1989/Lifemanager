"""/api/activity-log — the runtime activity/audit trail (لاگ فعالیت‌ها).

Read surface over ``activity_logs`` plus one POST for SPA-originated
events (e.g. exports/prints that never hit a write endpoint). Endpoints:

* ``GET  /api/activity-log``                       — global, filterable, paginated
* ``GET  /api/activity-log/entity/{type}/{id}``    — one entity's trail (entity OR
  owning-context match, so a list's log includes its items' events)
* ``GET  /api/activity-log/export.csv``            — UTF-8-BOM CSV of the filtered set
* ``POST /api/activity-log``                       — record a client-side action

Scoping matches the writings router: the anon bucket (user 0) also sees
legacy NULL-owner rows; a real JWT sees only its own rows.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Body, Depends, Query, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.activity_log import ActivityLog
from app.services.activity_log_service import record_activity

router = APIRouter()

_EXPORT_MAX_ROWS = 5000


def _scope(uid: int):
    """Anon scope (0) also covers legacy NULL-owner rows — same rule as
    the writings/tasks routers so the login-bypass frontend sees its data."""
    return (
        or_(ActivityLog.user_id == uid, ActivityLog.user_id.is_(None))
        if uid == 0
        else (ActivityLog.user_id == uid)
    )


def _parse_day(value: Optional[str], end: bool = False) -> Optional[datetime]:
    """Accept YYYY-MM-DD or full ISO; a bare end date extends to end-of-day."""
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value)
    except ValueError:
        return None
    if end and len(value) <= 10:
        dt = dt + timedelta(days=1) - timedelta(microseconds=1)
    return dt


def _apply_filters(
    stmt,
    *,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    if action:
        stmt = stmt.where(ActivityLog.action == action)
    if entity_type:
        # Comma-separated types let a hub panel show one domain's log
        # (e.g. مالی = income,asset,account,transaction) in one query.
        types = [t.strip() for t in entity_type.split(",") if t.strip()]
        if len(types) == 1:
            stmt = stmt.where(ActivityLog.entity_type == types[0])
        elif types:
            stmt = stmt.where(ActivityLog.entity_type.in_(types))
    if entity_id:
        stmt = stmt.where(ActivityLog.entity_id == entity_id)
    if search:
        needle = f"%{search}%"
        stmt = stmt.where(
            or_(
                ActivityLog.entity_label.ilike(needle),
                ActivityLog.detail.ilike(needle),
                ActivityLog.action.ilike(needle),
                ActivityLog.entity_type.ilike(needle),
                ActivityLog.entity_id.ilike(needle),
            )
        )
    start = _parse_day(date_from)
    if start is not None:
        stmt = stmt.where(ActivityLog.created_at >= start)
    end = _parse_day(date_to, end=True)
    if end is not None:
        stmt = stmt.where(ActivityLog.created_at <= end)
    return stmt


def _serialize(row: ActivityLog) -> dict:
    return {
        "id": row.id,
        "user_id": row.user_id,
        "action": row.action,
        "entity_type": row.entity_type,
        "entity_id": row.entity_id,
        "entity_label": row.entity_label,
        "context_type": row.context_type,
        "context_id": row.context_id,
        "detail": row.detail,
        # Undo snapshot (data-safety phase 0) — previous content of the
        # entity for update/delete rows; None elsewhere.
        "payload_before": row.payload_before,
        "ip_address": row.ip_address,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        # زمانِ واقعیِ رویداد (اگر منبع داده باشد)؛ «زمانِ نمایشی» = این یا created_at.
        "occurred_at": row.occurred_at.isoformat() if row.occurred_at else None,
        "display_at": (
            (row.occurred_at or row.created_at).isoformat()
            if (row.occurred_at or row.created_at) else None
        ),
    }


async def _paged(db: AsyncSession, stmt, page: int, page_size: int) -> dict:
    total = (
        await db.execute(select(func.count()).select_from(stmt.subquery()))
    ).scalar() or 0
    rows = (
        (
            await db.execute(
                stmt.order_by(
                    func.coalesce(ActivityLog.occurred_at, ActivityLog.created_at).desc(),
                    ActivityLog.id.desc(),
                )
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        )
        .scalars()
        .all()
    )
    return {
        "ok": True,
        "items": [_serialize(r) for r in rows],
        "total": int(total),
        "page": page,
        "page_size": page_size,
    }


# --- GLOBAL LIST -------------------------------------------------------------

@router.get("/api/activity-log", tags=["activity-log"])
@router.get("/api/activity-log/", tags=["activity-log"])
@handle_errors
async def list_activity(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=500),
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """The whole-program log, newest first — powers the /activity-log page."""
    stmt = _apply_filters(
        select(ActivityLog).where(_scope(user_id)),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )
    return await _paged(db, stmt, page, page_size)


# --- PER-ENTITY LIST ---------------------------------------------------------

@router.get("/api/activity-log/entity/{entity_type}/{entity_id}", tags=["activity-log"])
@handle_errors
async def list_entity_activity(
    entity_type: str,
    entity_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
    action: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """One profile/section's trail — powers the per-page «لاگ» panels.

    Matches rows where the pair is the acted-on entity OR the owning
    context, so a person's panel also lists their deeds/notes and a
    list's panel also lists its items' events.
    """
    pair = or_(
        (ActivityLog.entity_type == entity_type) & (ActivityLog.entity_id == entity_id),
        (ActivityLog.context_type == entity_type) & (ActivityLog.context_id == entity_id),
    )
    stmt = _apply_filters(
        select(ActivityLog).where(_scope(user_id)).where(pair),
        action=action,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )
    return await _paged(db, stmt, page, page_size)


# --- CSV EXPORT --------------------------------------------------------------

@router.get("/api/activity-log/export.csv", tags=["activity-log"])
@handle_errors
async def export_activity_csv(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    context_type: Optional[str] = None,
    context_id: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Response:
    """UTF-8-BOM CSV of the filtered log (Excel-friendly), capped at 5000 rows.

    ``context_type``/``context_id`` here filter with the same OR-pair rule
    as the per-entity endpoint so a profile panel's export matches its view.
    """
    import csv
    import io

    stmt = select(ActivityLog).where(_scope(user_id))
    if context_type and context_id:
        stmt = stmt.where(
            or_(
                (ActivityLog.entity_type == context_type)
                & (ActivityLog.entity_id == context_id),
                (ActivityLog.context_type == context_type)
                & (ActivityLog.context_id == context_id),
            )
        )
    stmt = _apply_filters(
        stmt,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )
    rows = (
        (
            await db.execute(
                stmt.order_by(
                    func.coalesce(ActivityLog.occurred_at, ActivityLog.created_at).desc(),
                    ActivityLog.id.desc(),
                )
                .limit(_EXPORT_MAX_ROWS)
            )
        )
        .scalars()
        .all()
    )
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        ["id", "created_at", "user_id", "action", "entity_type", "entity_id",
         "entity_label", "context_type", "context_id", "detail", "ip_address"]
    )
    for r in rows:
        writer.writerow(
            [r.id, r.created_at.isoformat() if r.created_at else "", r.user_id,
             r.action, r.entity_type or "", r.entity_id or "", r.entity_label or "",
             r.context_type or "", r.context_id or "", r.detail or "", r.ip_address or ""]
        )
    # BOM so Excel opens the Persian text as UTF-8.
    payload = "\ufeff" + buf.getvalue()
    return Response(
        content=payload,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="activity-log.csv"'},
    )


# --- CLIENT-SIDE ACTIVITY RECORD --------------------------------------------

class ActivityIn(BaseModel):
    action: str = Field(..., min_length=1, max_length=50)
    entity_type: Optional[str] = Field(default=None, max_length=50)
    entity_id: Optional[str] = Field(default=None, max_length=64)
    entity_label: Optional[str] = Field(default=None, max_length=255)
    context_type: Optional[str] = Field(default=None, max_length=50)
    context_id: Optional[str] = Field(default=None, max_length=64)
    detail: Optional[str] = Field(default=None, max_length=1000)


@router.post("/api/activity-log", status_code=201, tags=["activity-log"])
@handle_errors
async def log_client_activity(
    request: Request,
    payload: ActivityIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Record an SPA-originated action (export/print/…) that never hits a
    write endpoint, so the trail stays complete."""
    await record_activity(
        action=payload.action,
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        entity_label=payload.entity_label,
        context_type=payload.context_type,
        context_id=payload.context_id,
        detail=payload.detail,
        user_id=user_id,
        request=request,
        db=db,
    )
    return {"ok": True, "success": True, "status": "logged"}
