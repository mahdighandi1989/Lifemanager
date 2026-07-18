"""Persistent error tracking + the Persian log interpreter.

Two owner requirements live here:

1. «خطاها حذف نشن» — every distinct error signature from the Render logs
   becomes ONE durable ``dev_error_issues`` row (raw lines age out, issues
   never do). While it recurs: occurrences/last_seen update. Once it has
   stopped for ``resolve_hours`` WHILE the service kept logging (a silent
   service proves nothing), the engine marks it ``resolved`` (by=auto) — so
   the owner never chases an already-fixed bug. A recurrence re-opens it.
   Manual resolve/mute/re-open via the API.

2. «لاگ‌ها ترجمه‌شده و مفهوم باشن» — ``interpret_log_fa`` turns known machine
   patterns (HTTP requests, deploys, startups, migrations, tracebacks) into
   a short Persian gloss; ``build_project_feed`` assembles the per-project
   panel: notable recent events (deduped runs), open issues, digests.

No FastAPI imports; nothing here raises out (fail-open helpers).
"""
from __future__ import annotations

import hashlib
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dev_sync import DevErrorIssue, DevLog, DevService
from app.services.dev_sync.log_summary_service import normalize_message

logger = logging.getLogger(__name__)

VALID_STATUSES = ("open", "resolved", "muted")


def fingerprint(service_id: str, message: str) -> str:
    digest = hashlib.md5(f"{service_id}|{normalize_message(message)}".encode("utf-8", "replace"))
    return f"ei_{digest.hexdigest()}"


def _as_utc(ts: Optional[datetime]) -> Optional[datetime]:
    if ts is None:
        return None
    return ts.replace(tzinfo=timezone.utc) if ts.tzinfo is None else ts.astimezone(timezone.utc)


def serialize_issue(row: DevErrorIssue) -> Dict[str, Any]:
    return {
        "id": row.id,
        "service_id": row.service_id,
        "service_name": row.service_name,
        "dev_project_id": row.dev_project_id,
        "title": row.title,
        "sample_message": row.sample_message,
        "level": row.level,
        "occurrences": row.occurrences,
        "first_seen_at": row.first_seen_at.isoformat() if row.first_seen_at else None,
        "last_seen_at": row.last_seen_at.isoformat() if row.last_seen_at else None,
        "status": row.status,
        "resolved_at": row.resolved_at.isoformat() if row.resolved_at else None,
        "resolved_by": row.resolved_by,
        "reopened_count": row.reopened_count,
    }


async def upsert_from_logs(
    db: AsyncSession,
    fresh_rows: List[Dict[str, Any]],
    services_by_id: Dict[str, DevService],
    user_id: Optional[int] = None,
) -> int:
    """Fold this poll's new error lines into the durable issue rows.
    Commits on success; never raises. Returns issues touched."""
    error_rows = [r for r in fresh_rows if r.get("level") == "error"]
    if not error_rows:
        return 0
    try:
        wanted: Dict[str, Dict[str, Any]] = {}
        for row in error_rows:
            fp = fingerprint(row["service_id"], row["message"])
            slot = wanted.setdefault(
                fp, {"count": 0, "first": row["timestamp"], "last": row["timestamp"], "row": row}
            )
            slot["count"] += 1
            if row["timestamp"] < slot["first"]:
                slot["first"] = row["timestamp"]
            if row["timestamp"] > slot["last"]:
                slot["last"] = row["timestamp"]

        existing = {
            i.fingerprint: i
            for i in (
                await db.execute(
                    select(DevErrorIssue).where(DevErrorIssue.fingerprint.in_(list(wanted)))
                )
            )
            .scalars()
            .all()
        }
        touched = 0
        for fp, slot in wanted.items():
            row = slot["row"]
            issue = existing.get(fp)
            svc = services_by_id.get(row["service_id"])
            if issue is None:
                issue = DevErrorIssue(
                    user_id=user_id,
                    service_id=row["service_id"],
                    service_name=row.get("service_name"),
                    dev_project_id=svc.dev_project_id if svc else None,
                    fingerprint=fp,
                    title=normalize_message(row["message"]) or row["message"][:300],
                    sample_message=row["message"][:2000],
                    level="error",
                    occurrences=slot["count"],
                    first_seen_at=slot["first"],
                    last_seen_at=slot["last"],
                    status="open",
                )
                db.add(issue)
            else:
                issue.occurrences = (issue.occurrences or 0) + slot["count"]
                if _as_utc(slot["last"]) > (_as_utc(issue.last_seen_at) or slot["last"]):
                    issue.last_seen_at = slot["last"]
                issue.sample_message = row["message"][:2000]
                if svc and svc.dev_project_id and not issue.dev_project_id:
                    issue.dev_project_id = svc.dev_project_id
                if issue.status == "resolved":  # it came back → re-open
                    issue.status = "open"
                    issue.reopened_count = (issue.reopened_count or 0) + 1
                    issue.resolved_at = None
                    issue.resolved_by = None
            touched += 1
        await db.commit()
        return touched
    except Exception as exc:
        logger.warning("error-issue upsert skipped: %r", exc)
        try:
            await db.rollback()
        except Exception:
            pass
        return 0


async def auto_resolve(
    db: AsyncSession, resolve_hours: int = 24, now: Optional[datetime] = None
) -> List[DevErrorIssue]:
    """Mark open issues resolved when the error stopped ≥resolve_hours ago
    AND the service logged something after the last occurrence (a dead
    service must not fake a fix). Commits; never raises."""
    now = now or datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=max(int(resolve_hours), 1))
    try:
        open_issues = (
            (await db.execute(select(DevErrorIssue).where(DevErrorIssue.status == "open")))
            .scalars()
            .all()
        )
        if not open_issues:
            return []
        services = {
            s.id: s for s in (await db.execute(select(DevService))).scalars().all()
        }
        resolved: List[DevErrorIssue] = []
        for issue in open_issues:
            last_seen = _as_utc(issue.last_seen_at)
            if last_seen is None or last_seen > cutoff:
                continue
            svc = services.get(issue.service_id)
            svc_last_log = _as_utc(svc.last_log_at) if svc else None
            if svc_last_log is None or svc_last_log <= last_seen:
                continue  # service silent since the error — not proven fixed
            issue.status = "resolved"
            issue.resolved_at = now
            issue.resolved_by = "auto"
            resolved.append(issue)
        if resolved:
            await db.commit()
        return resolved
    except Exception as exc:
        logger.warning("error auto-resolve skipped: %r", exc)
        try:
            await db.rollback()
        except Exception:
            pass
        return []


# ── Persian log interpreter ──────────────────────────────────────────────────
_HTTP_RE = re.compile(
    r'"?(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(/\S*?)(?:\s+HTTP/[\d.]+)?"?\s+(\d{3})'
)
_STARTUP_RE = re.compile(
    r"uvicorn running|application startup complete|started server|booting worker", re.I
)
_SHUTDOWN_RE = re.compile(r"shutting down|shutdown complete|worker exiting", re.I)
_DEPLOY_LIVE_RE = re.compile(r"deploy.*live|your service is live|==>\s*deploy", re.I)
_BUILD_RE = re.compile(r"==>|build (successful|succeeded|started|failed)|building", re.I)
_MIGRATION_RE = re.compile(r"alembic|migration|create_all|add column", re.I)
_ERRORISH_RE = re.compile(r"error|exception|traceback|fatal|critical", re.I)


def interpret_log_fa(message: str, level: str = "info") -> Optional[Dict[str, str]]:
    """Best-effort Persian gloss for one raw line. Returns
    {kind, text} or None when the line is routine noise."""
    msg = (message or "").strip()
    if not msg:
        return None
    http = _HTTP_RE.search(msg)
    if http:
        method, path, code = http.group(1), http.group(2)[:80], int(http.group(3))
        if code >= 500:
            return {"kind": "http_error", "text": f"درخواست {method} {path} با خطای سرور ({code}) شکست خورد"}
        if code >= 400:
            return {"kind": "http_client_error", "text": f"درخواست {method} {path} رد شد ({code})"}
        return None  # successful requests are routine noise for the feed
    if _DEPLOY_LIVE_RE.search(msg):
        return {"kind": "deploy", "text": "نسخهٔ جدید دیپلوی و لایو شد"}
    if _STARTUP_RE.search(msg):
        return {"kind": "startup", "text": "سرویس بالا آمد و آمادهٔ کار است"}
    if _SHUTDOWN_RE.search(msg):
        return {"kind": "shutdown", "text": "سرویس خاموش/ری‌استارت شد"}
    if _BUILD_RE.search(msg):
        lowered = msg.lower()
        if "fail" in lowered:
            return {"kind": "build_failed", "text": "بیلد/دیپلوی ناموفق بود"}
        return {"kind": "build", "text": "عملیات بیلد/دیپلوی در جریان است"}
    if _MIGRATION_RE.search(msg):
        return {"kind": "migration", "text": "به‌روزرسانی ساختار دیتابیس (مایگریشن) اجرا شد"}
    if level == "error" or _ERRORISH_RE.search(msg):
        return {"kind": "error", "text": f"خطا: {msg[:160]}"}
    if level == "warn":
        return {"kind": "warn", "text": f"هشدار: {msg[:160]}"}
    return None


async def build_project_feed(
    db: AsyncSession, service_ids: List[str], limit: int = 50, scan: int = 400
) -> List[Dict[str, Any]]:
    """Recent NOTABLE events for one project's services, translated to
    Persian and with identical consecutive events collapsed into one row
    with a count («تکراری‌ها یکی شوند»)."""
    if not service_ids:
        return []
    rows = (
        (
            await db.execute(
                select(DevLog)
                .where(DevLog.service_id.in_(service_ids))
                .order_by(DevLog.timestamp.desc())
                .limit(scan)
            )
        )
        .scalars()
        .all()
    )
    feed: List[Dict[str, Any]] = []
    for row in reversed(rows):  # oldest → newest so runs collapse naturally
        gloss = interpret_log_fa(row.message, row.level or "info")
        if gloss is None:
            continue
        ts = _as_utc(row.timestamp)
        previous = feed[-1] if feed else None
        if previous and previous["text_fa"] == gloss["text"]:
            previous["count"] += 1
            previous["timestamp"] = ts.isoformat() if ts else previous["timestamp"]
            continue
        feed.append(
            {
                "timestamp": ts.isoformat() if ts else None,
                "level": row.level,
                "kind": gloss["kind"],
                "text_fa": gloss["text"],
                "raw": row.message[:300],
                "service_id": row.service_id,
                "service_name": row.service_name,
                "count": 1,
            }
        )
    return feed[-limit:][::-1]  # newest first
