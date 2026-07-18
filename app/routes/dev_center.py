"""«مرکز توسعه» — /api/dev/*

GitHub repo sync + Render services/live logs + Persian daily summaries,
surfaced inside the life-management view. The sibling PM app remains the
system of record for engineering work — these endpoints only mirror state
and create LIFE-level follow-up tasks (رسیدگی/پیگیری), so nothing here
duplicates the PM app's task management.

Token contract (repo convention): keys are stored encrypted, responses
expose ``has_api_key``/source only — never key material.
"""
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.dev_sync import DevErrorIssue, DevLog, DevLogSummary, DevProject, DevService
from app.models.project import Project
from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.dev_sync_schema import (
    DevErrorPatch,
    DevLogsFetchRequest,
    DevProjectPatch,
    DevServicePatch,
    DevSettingsUpdate,
    DevSummaryGenerateRequest,
    DevTaskCreate,
    DevTokenUpdate,
)
from app.services.activity_log_service import record_activity
from app.services.dev_sync import (
    engine as dev_engine,
    error_issue_service,
    github_sync_service,
    log_summary_service,
    render_sync_service,
    token_service,
)

router = APIRouter()

_PROVIDERS = token_service.PROVIDERS


def _owner(user_id: int) -> Optional[int]:
    """Dev-sync data is INSTALL-WIDE (this deployment has one operator whose
    GitHub/Render account the mirror reflects), so every write lands in the
    NULL scope — the same scope the background engine (user_id=None) reads
    and writes. Mixing per-user rows with the engine's NULL rows would split
    the mirror into two row sets (and collide on the global srv-… PKs).
    Readers keep the owned-or-unowned filter, which always includes NULL."""
    return None


def _project_scope(user_id: int):
    return or_(DevProject.user_id == user_id, DevProject.user_id.is_(None))


def _service_scope(user_id: int):
    return or_(DevService.user_id == user_id, DevService.user_id.is_(None))


def _iso(value) -> Optional[str]:
    return value.isoformat() if value else None


def _ser_project(p: DevProject) -> dict:
    return {
        "id": p.id,
        "provider": p.provider,
        "repo_full_name": p.repo_full_name,
        "name": p.name,
        "description": p.description,
        "html_url": p.html_url,
        "default_branch": p.default_branch,
        "language": p.language,
        "is_private": p.is_private,
        "is_archived": p.is_archived,
        "pushed_at": _iso(p.pushed_at),
        "stars": p.stars,
        "forks": p.forks,
        "open_issues": p.open_issues,
        "topics": p.topics or [],
        "linked_project_id": p.linked_project_id,
        "is_active": p.is_active,
        "last_synced_at": _iso(p.last_synced_at),
    }


def _ser_service(s: DevService) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "service_type": s.service_type,
        "status": s.status,
        "service_url": s.service_url,
        "dashboard_url": s.dashboard_url,
        "repo_url": s.repo_url,
        "branch": s.branch,
        "dev_project_id": s.dev_project_id,
        "auto_fetch_logs": s.auto_fetch_logs,
        "last_log_at": _iso(s.last_log_at),
        "last_synced_at": _iso(s.last_synced_at),
    }


# ── integrations (tokens) ────────────────────────────────────────────────────
@router.get("/api/dev/integrations", tags=["dev-center"])
@handle_errors
async def get_integrations(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    out = {}
    for provider in _PROVIDERS:
        out[provider] = await token_service.integration_status(db, provider, _owner(user_id))
    return {"ok": True, **out}


@router.put("/api/dev/integrations/{provider}", tags=["dev-center"])
@handle_errors
async def put_integration(
    provider: str,
    payload: DevTokenUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    if provider not in _PROVIDERS:
        raise HTTPException(status_code=404, detail="unknown provider")
    await token_service.set_token(
        db, provider, payload.api_key, _owner(user_id), is_enabled=payload.is_enabled
    )
    action = "dev_token_cleared" if payload.api_key == "" else "dev_token_updated"
    await record_activity(
        action=action,
        entity_type="dev_integration",
        entity_id=provider,
        entity_label=provider,
        detail="کلید از تنظیمات مرکز توسعه به‌روزرسانی شد" if action == "dev_token_updated" else "کلید پاک شد",
        user_id=user_id,
        db=db,
    )
    status_payload = await token_service.integration_status(db, provider, _owner(user_id))
    return {"ok": True, **status_payload}


@router.post("/api/dev/integrations/{provider}/test", tags=["dev-center"])
@handle_errors
async def test_integration(
    provider: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    if provider not in _PROVIDERS:
        raise HTTPException(status_code=404, detail="unknown provider")
    token, source = await token_service.get_token(db, provider, _owner(user_id))
    if not token:
        return {
            "ok": False,
            "reason": "no_token",
            "detail": "کلیدی ثبت نشده — یا در تنظیمات وارد کن یا متغیر محیطی را در Render بگذار.",
        }
    if provider == "github":
        probe = await github_sync_service.probe(token)
    else:
        probe = await render_sync_service.probe(token)
    probe["source"] = source
    return probe


# ── sync now ─────────────────────────────────────────────────────────────────
@router.post("/api/dev/sync/github", tags=["dev-center"])
@handle_errors
async def sync_github_now(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await github_sync_service.sync_repos(db, _owner(user_id))
    if result.get("ok"):
        await record_activity(
            action="dev_sync_github",
            entity_type="dev_integration",
            entity_id="github",
            entity_label="GitHub",
            detail=f"همگام‌سازی مخزن‌ها: {result.get('synced', 0)} مخزن ({result.get('created', 0)} جدید)",
            user_id=user_id,
            db=db,
        )
    return result


@router.post("/api/dev/sync/render", tags=["dev-center"])
@handle_errors
async def sync_render_now(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await render_sync_service.sync_services(db, _owner(user_id))
    if result.get("ok"):
        await record_activity(
            action="dev_sync_render",
            entity_type="dev_integration",
            entity_id="render",
            entity_label="Render",
            detail=f"همگام‌سازی سرویس‌ها: {result.get('synced', 0)} سرویس",
            user_id=user_id,
            db=db,
        )
    return result


# ── projects ─────────────────────────────────────────────────────────────────
async def _project_stats(db: AsyncSession, user_id: int) -> dict:
    """errors/logs in the last 24h per service + today's summaries."""
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    rows = (
        await db.execute(
            select(DevLog.service_id, DevLog.level, func.count(DevLog.id))
            .where(DevLog.timestamp >= since)
            .group_by(DevLog.service_id, DevLog.level)
        )
    ).all()
    per_service: dict = {}
    for service_id, level, count in rows:
        bucket = per_service.setdefault(service_id, {"total": 0, "error": 0, "warn": 0})
        bucket["total"] += count
        if level in bucket:
            bucket[level] += count
    cfg = await dev_engine.load_settings(db)
    today = log_summary_service.local_date(
        datetime.now(timezone.utc), int(cfg.get("tz_offset_minutes", 240) or 0)
    )
    summaries = (
        (
            await db.execute(
                select(DevLogSummary).where(DevLogSummary.summary_date == today)
            )
        )
        .scalars()
        .all()
    )
    open_rows = (
        await db.execute(
            select(DevErrorIssue.service_id, func.count(DevErrorIssue.id))
            .where(DevErrorIssue.status == "open")
            .group_by(DevErrorIssue.service_id)
        )
    ).all()
    return {
        "per_service": per_service,
        "today_summaries": {s.service_id: s for s in summaries},
        "open_errors_by_service": dict(open_rows),
        "cfg": cfg,
    }


@router.get("/api/dev/projects", tags=["dev-center"])
@handle_errors
async def list_dev_projects(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    projects = (
        (
            await db.execute(
                select(DevProject)
                .where(_project_scope(user_id))
                .order_by(DevProject.pushed_at.desc().nullslast())
            )
        )
        .scalars()
        .all()
    )
    services = (
        (await db.execute(select(DevService).where(_service_scope(user_id)))).scalars().all()
    )
    stats = await _project_stats(db, user_id)
    by_project: dict = {}
    for svc in services:
        if svc.dev_project_id:
            by_project.setdefault(svc.dev_project_id, []).append(svc)
    out = []
    for p in projects:
        item = _ser_project(p)
        item_services = by_project.get(p.id, [])
        item["services"] = [_ser_service(s) for s in item_services]
        item["errors_24h"] = sum(
            stats["per_service"].get(s.id, {}).get("error", 0) for s in item_services
        )
        item["logs_24h"] = sum(
            stats["per_service"].get(s.id, {}).get("total", 0) for s in item_services
        )
        item["open_errors"] = sum(
            stats["open_errors_by_service"].get(s.id, 0) for s in item_services
        )
        today = [
            log_summary_service.serialize_summary(stats["today_summaries"][s.id])
            for s in item_services
            if s.id in stats["today_summaries"]
        ]
        item["today_summary"] = today[0]["summary"] if today else None
        out.append(item)
    return {"ok": True, "projects": out, "count": len(out)}


@router.get("/api/dev/overview", tags=["dev-center"])
@handle_errors
async def dev_overview(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Aggregate card data for the hub: totals + needs-attention flags.
    Attention rules are LIFE-level (errors piling up, deploy suspended,
    repo untouched for weeks) — not engineering triage."""
    projects_resp = await list_dev_projects(db=db, user_id=user_id)  # reuse serialization
    projects = projects_resp["projects"]
    cfg = await dev_engine.load_settings(db)
    threshold = int(cfg.get("error_attention_threshold", 20) or 20)
    stale_days = int(cfg.get("stale_repo_days", 14) or 14)
    now = datetime.now(timezone.utc)
    needs_attention = []
    for p in projects:
        reasons = []
        if p.get("open_errors", 0) > 0:
            reasons.append(f"{p['open_errors']} خطای باز حل‌نشده")
        if p["errors_24h"] >= threshold:
            reasons.append(f"{p['errors_24h']} خطا در ۲۴ ساعت گذشته")
        for svc in p["services"]:
            if svc["status"] in ("suspended", "gone"):
                reasons.append(f"سرویس {svc['name']} در وضعیت {svc['status']}")
        if p["is_active"] and not p["is_archived"] and p["pushed_at"]:
            try:
                pushed = datetime.fromisoformat(p["pushed_at"])
                if pushed.tzinfo is None:
                    pushed = pushed.replace(tzinfo=timezone.utc)
                idle_days = (now - pushed).days
                if idle_days >= stale_days:
                    reasons.append(f"{idle_days} روز بدون تغییر")
            except ValueError:
                pass
        if reasons:
            needs_attention.append(
                {"dev_project_id": p["id"], "name": p["name"], "reasons": reasons}
            )
    total_errors = sum(p["errors_24h"] for p in projects)
    total_logs = sum(p["logs_24h"] for p in projects)
    active_services = sum(
        1 for p in projects for s in p["services"] if s["status"] == "active"
    )
    return {
        "ok": True,
        "projects": projects,
        "needs_attention": needs_attention,
        "totals": {
            "projects": len(projects),
            "active_projects": sum(1 for p in projects if p["is_active"] and not p["is_archived"]),
            "services": active_services,
            "errors_24h": total_errors,
            "logs_24h": total_logs,
            "open_errors": sum(p.get("open_errors", 0) for p in projects),
        },
    }


@router.patch("/api/dev/projects/{dev_project_id}", tags=["dev-center"])
@handle_errors
async def patch_dev_project(
    dev_project_id: int,
    payload: DevProjectPatch = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    project = await db.get(DevProject, dev_project_id)
    if project is None or (project.user_id is not None and project.user_id != user_id):
        raise HTTPException(status_code=404, detail="dev project not found")
    if payload.unlink:
        project.linked_project_id = None
    elif payload.linked_project_id is not None:
        life = await db.get(Project, payload.linked_project_id)
        # same cross-user rule as routes/projects.py: someone else's project
        # is indistinguishable from a missing one.
        if life is None or (life.user_id is not None and life.user_id != user_id):
            raise HTTPException(status_code=404, detail="life project not found")
        project.linked_project_id = life.id
    if payload.is_active is not None:
        project.is_active = payload.is_active
    await db.commit()
    await db.refresh(project)
    return {"ok": True, "project": _ser_project(project)}


@router.post(
    "/api/dev/projects/{dev_project_id}/create-task",
    status_code=status.HTTP_201_CREATED,
    tags=["dev-center"],
)
@handle_errors
async def create_task_from_dev_project(
    dev_project_id: int,
    payload: DevTaskCreate = Body(default=DevTaskCreate()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Create a LIFE follow-up task (رسیدگی) for this repo — linked to the
    bridged life project when one is set. Deliberately NOT an engineering
    ticket: the PM app owns those."""
    project = await db.get(DevProject, dev_project_id)
    if project is None or (project.user_id is not None and project.user_id != user_id):
        raise HTTPException(status_code=404, detail="dev project not found")
    title = (payload.title or "").strip() or f"رسیدگی به پروژهٔ {project.name}"
    priority = TaskPriority((payload.priority or "medium"))
    task = Task(
        title=title[:255],
        description=payload.description,
        status=TaskStatus.TODO,
        priority=priority,
        user_id=_owner(user_id),
        project_id=project.linked_project_id,
        due_date=payload.due_date,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    await record_activity(
        action="dev_task_created",
        entity_type="dev_project",
        entity_id=project.id,
        entity_label=project.name,
        context_type="project" if project.linked_project_id else None,
        context_id=project.linked_project_id,
        detail=f"وظیفهٔ زندگی ساخته شد: {title[:200]}",
        user_id=user_id,
        db=db,
    )
    return {"ok": True, "task_id": task.id, "title": task.title}


# ── services ─────────────────────────────────────────────────────────────────
@router.get("/api/dev/services", tags=["dev-center"])
@handle_errors
async def list_dev_services(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    services = (
        (
            await db.execute(
                select(DevService).where(_service_scope(user_id)).order_by(DevService.name)
            )
        )
        .scalars()
        .all()
    )
    return {"ok": True, "services": [_ser_service(s) for s in services]}


@router.patch("/api/dev/services/{service_id}", tags=["dev-center"])
@handle_errors
async def patch_dev_service(
    service_id: str,
    payload: DevServicePatch = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    service = await db.get(DevService, service_id)
    if service is None or (service.user_id is not None and service.user_id != user_id):
        raise HTTPException(status_code=404, detail="service not found")
    if payload.auto_fetch_logs is not None:
        service.auto_fetch_logs = payload.auto_fetch_logs
    await db.commit()
    await db.refresh(service)
    return {"ok": True, "service": _ser_service(service)}


# ── logs ─────────────────────────────────────────────────────────────────────
@router.get("/api/dev/logs", tags=["dev-center"])
@handle_errors
async def list_dev_logs(
    service_ids: Optional[str] = Query(default=None, description="comma-separated srv ids"),
    levels: Optional[str] = Query(default=None, description="comma list: info,warn,error,debug"),
    since_minutes: int = Query(default=30, ge=1, le=60 * 24 * 7),
    q: Optional[str] = Query(default=None, max_length=200),
    limit: int = Query(default=200, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    since = datetime.now(timezone.utc) - timedelta(minutes=since_minutes)
    query = select(DevLog).where(DevLog.timestamp >= since)
    if service_ids:
        wanted = [s.strip() for s in service_ids.split(",") if s.strip()]
        if wanted:
            query = query.where(DevLog.service_id.in_(wanted))
    if levels:
        wanted_levels = [level.strip().lower() for level in levels.split(",") if level.strip()]
        if wanted_levels:
            query = query.where(DevLog.level.in_(wanted_levels))
    if q:
        escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.where(DevLog.message.ilike(f"%{escaped}%", escape="\\"))
    rows = (
        (await db.execute(query.order_by(DevLog.timestamp.desc()).limit(limit))).scalars().all()
    )
    return {
        "ok": True,
        "count": len(rows),
        "logs": [
            {
                "id": r.id,
                "service_id": r.service_id,
                "service_name": r.service_name,
                "timestamp": _iso(r.timestamp),
                "level": r.level,
                "message": r.message,
            }
            for r in rows
        ],
    }


@router.post("/api/dev/logs/fetch", tags=["dev-center"])
@handle_errors
async def fetch_dev_logs_now(
    payload: DevLogsFetchRequest = Body(default=DevLogsFetchRequest()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Pull the newest lines from Render right now (the live tab's poll)."""
    cfg = await dev_engine.load_settings(db)
    return await render_sync_service.sync_logs(
        db,
        _owner(user_id),
        service_ids=payload.service_ids,
        limit=payload.limit or 100,
        resolve_hours=int(cfg.get("error_resolve_hours", 24)),
    )


@router.get("/api/dev/logs/stats", tags=["dev-center"])
@handle_errors
async def dev_log_stats(
    since_hours: int = Query(default=24, ge=1, le=24 * 30),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    stats = await render_sync_service.log_stats(db, since_hours=since_hours)
    return {"ok": True, **stats}


# ── error issues (persistent — «خطاها حذف نشن») ─────────────────────────────
@router.get("/api/dev/errors", tags=["dev-center"])
@handle_errors
async def list_dev_errors(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    service_id: Optional[str] = Query(default=None),
    dev_project_id: Optional[int] = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    query = select(DevErrorIssue)
    if status_filter:
        wanted = [s.strip() for s in status_filter.split(",") if s.strip()]
        query = query.where(DevErrorIssue.status.in_(wanted))
    if service_id:
        query = query.where(DevErrorIssue.service_id == service_id)
    if dev_project_id is not None:
        query = query.where(DevErrorIssue.dev_project_id == dev_project_id)
    rows = (
        (await db.execute(query.order_by(DevErrorIssue.last_seen_at.desc()).limit(limit)))
        .scalars()
        .all()
    )
    counts_rows = (
        await db.execute(
            select(DevErrorIssue.status, func.count(DevErrorIssue.id)).group_by(
                DevErrorIssue.status
            )
        )
    ).all()
    return {
        "ok": True,
        "errors": [error_issue_service.serialize_issue(r) for r in rows],
        "counts": {status: count for status, count in counts_rows},
    }


@router.patch("/api/dev/errors/{issue_id}", tags=["dev-center"])
@handle_errors
async def patch_dev_error(
    issue_id: int,
    payload: DevErrorPatch = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Manual override: رفع شد / بازگشایی / بی‌صدا."""
    issue = await db.get(DevErrorIssue, issue_id)
    if issue is None or (issue.user_id is not None and issue.user_id != user_id):
        raise HTTPException(status_code=404, detail="error issue not found")
    new_status = payload.status
    issue.status = new_status
    if new_status == "resolved":
        issue.resolved_at = datetime.now(timezone.utc)
        issue.resolved_by = "manual"
    elif new_status == "open":
        issue.resolved_at = None
        issue.resolved_by = None
    await db.commit()
    await db.refresh(issue)
    status_fa = {"resolved": "رفع‌شده", "open": "باز", "muted": "بی‌صدا"}[new_status]
    await record_activity(
        action="dev_error_status",
        entity_type="dev_service",
        entity_id=issue.service_id,
        entity_label=issue.service_name or issue.service_id,
        detail=f"وضعیت خطا دستی «{status_fa}» شد: {issue.title[:150]}",
        user_id=user_id,
        db=db,
    )
    return {"ok": True, "error": error_issue_service.serialize_issue(issue)}


@router.get("/api/dev/projects/{dev_project_id}/feed", tags=["dev-center"])
@handle_errors
async def dev_project_feed(
    dev_project_id: int,
    limit: int = Query(default=40, ge=5, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """«ذیل هر پروژه»: رویدادهای اخیرِ ترجمه‌شده + خطاهای باز + کارنامه‌های
    اخیر — one call for the expandable per-project panel."""
    project = await db.get(DevProject, dev_project_id)
    if project is None or (project.user_id is not None and project.user_id != user_id):
        raise HTTPException(status_code=404, detail="dev project not found")
    services = (
        (
            await db.execute(
                select(DevService).where(DevService.dev_project_id == dev_project_id)
            )
        )
        .scalars()
        .all()
    )
    service_ids = [s.id for s in services]
    feed = await error_issue_service.build_project_feed(db, service_ids, limit=limit)
    issues = []
    if service_ids:
        issues = (
            (
                await db.execute(
                    select(DevErrorIssue)
                    .where(
                        DevErrorIssue.service_id.in_(service_ids),
                        DevErrorIssue.status == "open",
                    )
                    .order_by(DevErrorIssue.last_seen_at.desc())
                    .limit(20)
                )
            )
            .scalars()
            .all()
        )
    summaries = []
    if service_ids:
        summaries = (
            (
                await db.execute(
                    select(DevLogSummary)
                    .where(DevLogSummary.service_id.in_(service_ids))
                    .order_by(DevLogSummary.summary_date.desc(), DevLogSummary.id.desc())
                    .limit(5)
                )
            )
            .scalars()
            .all()
        )
    return {
        "ok": True,
        "project": _ser_project(project),
        "feed": feed,
        "open_errors": [error_issue_service.serialize_issue(i) for i in issues],
        "summaries": [log_summary_service.serialize_summary(s) for s in summaries],
    }


# ── summaries ────────────────────────────────────────────────────────────────
@router.get("/api/dev/summaries", tags=["dev-center"])
@handle_errors
async def list_dev_summaries(
    dev_project_id: Optional[int] = Query(default=None),
    service_id: Optional[str] = Query(default=None),
    days: int = Query(default=14, ge=1, le=120),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    since = date.today() - timedelta(days=days)
    query = select(DevLogSummary).where(DevLogSummary.summary_date >= since)
    if dev_project_id is not None:
        query = query.where(DevLogSummary.dev_project_id == dev_project_id)
    if service_id:
        query = query.where(DevLogSummary.service_id == service_id)
    rows = (
        (
            await db.execute(
                query.order_by(DevLogSummary.summary_date.desc(), DevLogSummary.id.desc())
            )
        )
        .scalars()
        .all()
    )
    return {
        "ok": True,
        "summaries": [log_summary_service.serialize_summary(r) for r in rows],
    }


@router.post("/api/dev/summaries/generate", tags=["dev-center"])
@handle_errors
async def generate_dev_summaries(
    payload: DevSummaryGenerateRequest = Body(default=DevSummaryGenerateRequest()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    cfg = await dev_engine.load_settings(db)
    results = await log_summary_service.generate_daily_summaries(
        db,
        user_id=_owner(user_id),
        summary_date=payload.summary_date,
        tz_offset_minutes=int(cfg.get("tz_offset_minutes", 240) or 0),
        only_service_id=payload.service_id,
    )
    return {"ok": True, "count": len(results), "summaries": results}


# ── settings ─────────────────────────────────────────────────────────────────
@router.get("/api/dev/settings", tags=["dev-center"])
@handle_errors
async def get_dev_settings(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    cfg = await dev_engine.load_settings(db)
    return {"ok": True, "settings": cfg, "editable": list(dev_engine.EDITABLE_FIELDS)}


@router.put("/api/dev/settings", tags=["dev-center"])
@handle_errors
async def put_dev_settings(
    payload: DevSettingsUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    changes = payload.model_dump(exclude_none=True)
    cfg = await dev_engine.update_settings(db, changes)
    return {"ok": True, "settings": cfg}
