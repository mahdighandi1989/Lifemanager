"""Render sync — mirrors Render services + their logs into
``dev_services`` / ``dev_logs``.

API surface used (same as the sibling PM app):
* ``GET /v1/owners``                    → resolve ownerId (cached per token)
* ``GET /v1/services?limit=100``        → service inventory
* ``GET /v1/logs?ownerId=…&resource=…`` → recent log lines per service

The fetcher is injectable for tests; public entry points never raise
(``{ok, ...}`` results, fail-open per service). Raw log lines are
short-retention (``cleanup_old_logs``) — the Persian daily summary is the
long-term record.
"""
from __future__ import annotations

import hashlib
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dev_sync import DevLog, DevProject, DevService
from app.services.dev_sync import token_service

logger = logging.getLogger(__name__)

RENDER_API = "https://api.render.com/v1"
_TIMEOUT = 20.0

# type → dashboard path segment (dashboard.render.com/<seg>/<srv-id>)
_DASHBOARD_SEGMENTS = {
    "web_service": "web",
    "background_worker": "worker",
    "cron_job": "cron",
    "static_site": "static",
    "private_service": "pserv",
    "keyvalue": "redis",
}

_owner_id_cache: Dict[str, str] = {}


def _headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Accept": "application/json"}


async def _default_fetcher(url: str, headers: Dict[str, str]) -> Any:
    import httpx

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()


# ── parsing helpers ──────────────────────────────────────────────────────────
_FRACTION_RE = re.compile(r"\.(\d{7,})")


def parse_render_datetime(value: Optional[str]) -> Optional[datetime]:
    """Render timestamps carry nanosecond fractions ("…T07:49:47.947123456Z")
    which fromisoformat rejects — trim to microseconds first."""
    if not value:
        return None
    try:
        text = _FRACTION_RE.sub(lambda m: "." + m.group(1)[:6], str(value))
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except Exception:
        return None


_LEVEL_PATTERNS = (
    ("error", re.compile(r"\b(error|fatal|critical|exception|traceback)\b", re.I)),
    ("warn", re.compile(r"\b(warn|warning)\b", re.I)),
    ("debug", re.compile(r"\b(debug)\b", re.I)),
)


def detect_level(message: str, labels: Optional[List[Dict[str, Any]]] = None) -> str:
    for label in labels or []:
        if str(label.get("name")) == "level":
            value = str(label.get("value") or "").lower()
            if value in ("info", "warn", "warning", "error", "debug", "fatal", "critical"):
                return {"warning": "warn", "fatal": "error", "critical": "error"}.get(value, value)
    for level, pattern in _LEVEL_PATTERNS:
        if pattern.search(message or ""):
            return level
    return "info"


def log_row_id(service_id: str, timestamp: str, message: str) -> str:
    digest = hashlib.md5(f"{service_id}|{timestamp}|{message}".encode("utf-8", "replace"))
    return f"rl_{digest.hexdigest()}"


def parse_repo_full_name(repo_url: Optional[str]) -> Optional[str]:
    """https://github.com/Owner/Name(.git) → "owner/name" (lowercased)."""
    if not repo_url:
        return None
    match = re.search(r"github\.com[:/]+([^/]+)/([^/#?]+)", str(repo_url), re.I)
    if not match:
        return None
    name = match.group(2)
    if name.endswith(".git"):
        name = name[:-4]
    return f"{match.group(1)}/{name}".lower()


# ── owners / services ────────────────────────────────────────────────────────
async def fetch_owner_id(token: str, fetcher: Optional[Callable] = None) -> Optional[str]:
    key = hashlib.md5(token.encode()).hexdigest()
    if key in _owner_id_cache:
        return _owner_id_cache[key]
    fetch = fetcher or _default_fetcher
    data = await fetch(f"{RENDER_API}/owners?limit=20", _headers(token))
    for item in data or []:
        owner = (item or {}).get("owner") or {}
        if owner.get("id"):
            _owner_id_cache[key] = owner["id"]
            return owner["id"]
    return None


def normalize_service(raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    svc = (raw or {}).get("service") or raw or {}
    sid = svc.get("id")
    if not sid:
        return None
    details = svc.get("serviceDetails") or {}
    stype = svc.get("type")
    segment = _DASHBOARD_SEGMENTS.get(stype or "", "web")
    suspended = svc.get("suspended")
    return {
        "id": sid,
        "name": svc.get("name") or sid,
        "service_type": stype,
        "status": "suspended" if suspended == "suspended" else "active",
        "service_url": details.get("url"),
        "dashboard_url": svc.get("dashboardUrl") or f"https://dashboard.render.com/{segment}/{sid}",
        "repo_url": svc.get("repo"),
        "branch": svc.get("branch"),
    }


async def fetch_services(token: str, fetcher: Optional[Callable] = None) -> List[Dict[str, Any]]:
    fetch = fetcher or _default_fetcher
    data = await fetch(f"{RENDER_API}/services?limit=100", _headers(token))
    return [n for n in (normalize_service(item) for item in (data or [])) if n]


async def sync_services(
    db: AsyncSession,
    user_id: Optional[int] = None,
    fetcher: Optional[Callable] = None,
) -> Dict[str, Any]:
    """Upsert dev_services and auto-link each to its dev_project via the
    connected GitHub repo. Never raises. Services gone upstream are kept
    (quarantine rule) but marked status='gone'."""
    token, _source = await token_service.get_token(db, "render", user_id)
    if not token:
        return {"ok": False, "error": "no_token", "synced": 0, "created": 0}
    try:
        normalized = await fetch_services(token, fetcher=fetcher)
    except Exception as exc:
        msg = token_service.sanitize_error(exc, token)
        logger.warning("render services fetch failed: %s", msg)
        await token_service.record_sync_result(db, "render", False, msg, user_id)
        return {"ok": False, "error": msg, "synced": 0, "created": 0}

    now = datetime.now(timezone.utc)
    # PK is Render's srv-id and is GLOBAL — look existing rows up across all
    # scopes, or the engine (user_id=None) would re-insert a PK created by a
    # logged-in manual sync and every background cycle would IntegrityError.
    projects = (await db.execute(select(DevProject))).scalars().all()
    project_by_repo = {p.repo_full_name.lower(): p for p in projects if p.repo_full_name}
    existing = (await db.execute(select(DevService))).scalars().all()
    by_id = {s.id: s for s in existing}
    created = 0
    seen_ids = set()
    for svc in normalized:
        seen_ids.add(svc["id"])
        row = by_id.get(svc["id"])
        if row is None:
            row = DevService(user_id=user_id, **svc)
            db.add(row)
            by_id[svc["id"]] = row
            created += 1
        else:
            for field, value in svc.items():
                setattr(row, field, value)
        repo_full = parse_repo_full_name(svc.get("repo_url"))
        if repo_full and repo_full in project_by_repo:
            row.dev_project_id = project_by_repo[repo_full].id
        row.last_synced_at = now
    for sid, row in by_id.items():
        if sid not in seen_ids and row.status != "gone":
            row.status = "gone"
    try:
        await db.commit()
    except Exception as exc:  # keep the session usable — never poison the tick
        await db.rollback()
        msg = token_service.sanitize_error(exc, token)
        logger.warning("render sync commit failed: %s", msg)
        await token_service.record_sync_result(db, "render", False, msg, user_id)
        return {"ok": False, "error": msg, "synced": 0, "created": 0}
    await token_service.record_sync_result(db, "render", True, None, user_id)
    return {"ok": True, "synced": len(normalized), "created": created, "error": None}


# ── logs ─────────────────────────────────────────────────────────────────────
def normalize_log(raw: Dict[str, Any], service_id: str, service_name: str) -> Optional[Dict[str, Any]]:
    message = (raw or {}).get("message")
    ts_raw = (raw or {}).get("timestamp")
    ts = parse_render_datetime(ts_raw)
    if message is None or ts is None:
        return None
    return {
        "id": raw.get("id") or log_row_id(service_id, str(ts_raw), str(message)),
        "service_id": service_id,
        "service_name": service_name,
        "timestamp": ts,
        "level": detect_level(str(message), raw.get("labels")),
        "message": str(message)[:10000],
    }


async def fetch_service_logs(
    token: str,
    owner_id: str,
    service_id: str,
    limit: int = 100,
    fetcher: Optional[Callable] = None,
) -> List[Dict[str, Any]]:
    fetch = fetcher or _default_fetcher
    url = (
        f"{RENDER_API}/logs?ownerId={owner_id}&resource={service_id}"
        f"&limit={min(max(int(limit), 1), 500)}&direction=backward"
    )
    data = await fetch(url, _headers(token))
    entries = (data or {}).get("logs") if isinstance(data, dict) else data
    return entries or []


async def sync_logs(
    db: AsyncSession,
    user_id: Optional[int] = None,
    service_ids: Optional[List[str]] = None,
    limit: int = 100,
    fetcher: Optional[Callable] = None,
) -> Dict[str, Any]:
    """Fetch the newest lines for every auto-fetch service (or the given
    subset), dedup by row id, insert the new ones. Fail-open per service."""
    token, _source = await token_service.get_token(db, "render", user_id)
    if not token:
        return {"ok": False, "error": "no_token", "fetched": 0, "new": 0}
    try:
        owner_id = await fetch_owner_id(token, fetcher=fetcher)
    except Exception as exc:
        msg = token_service.sanitize_error(exc, token)
        return {"ok": False, "error": msg, "fetched": 0, "new": 0}
    if not owner_id:
        return {"ok": False, "error": "no_owner", "fetched": 0, "new": 0}

    # dev-sync data is install-wide (single-operator deployment): poll every
    # non-gone service regardless of which scope created its row.
    query = select(DevService).where(DevService.status != "gone")
    if service_ids:
        query = query.where(DevService.id.in_(service_ids))
    else:
        query = query.where(DevService.auto_fetch_logs.is_(True))
    services = (await db.execute(query)).scalars().all()

    fetched = 0
    candidates: List[Dict[str, Any]] = []
    errors: List[str] = []
    for svc in services:
        try:
            entries = await fetch_service_logs(
                token, owner_id, svc.id, limit=limit, fetcher=fetcher
            )
        except Exception as exc:
            errors.append(f"{svc.id}: {token_service.sanitize_error(exc, token)}")
            continue
        fetched += len(entries)
        for raw in entries:
            row = normalize_log(raw, svc.id, svc.name)
            if row:
                candidates.append(row)

    new_count = 0
    if candidates:
        # Dedup within the batch first (backward pagination can repeat ids).
        unique = {c["id"]: c for c in candidates}
        ids = list(unique.keys())
        existing_ids = set(
            (await db.execute(select(DevLog.id).where(DevLog.id.in_(ids)))).scalars().all()
        )
        fresh = [unique[i] for i in ids if i not in existing_ids]
        for row in fresh:
            db.add(DevLog(**row))
        latest_by_service: Dict[str, datetime] = {}
        for row in fresh:
            current = latest_by_service.get(row["service_id"])
            if current is None or row["timestamp"] > current:
                latest_by_service[row["service_id"]] = row["timestamp"]
        for svc in services:
            if svc.id in latest_by_service:
                svc.last_log_at = latest_by_service[svc.id]
        try:
            await db.commit()
            new_count = len(fresh)
        except Exception as exc:  # PK race with a concurrent poll → row-by-row
            await db.rollback()
            for row in fresh:
                try:
                    db.add(DevLog(**row))
                    await db.commit()
                    new_count += 1
                except Exception:
                    await db.rollback()
            # the rollback above discarded the staged last_log_at updates —
            # re-apply them so the freshness marker doesn't go stale.
            try:
                for svc in services:
                    if svc.id in latest_by_service:
                        svc.last_log_at = latest_by_service[svc.id]
                await db.commit()
            except Exception:
                await db.rollback()
            logger.debug("dev log bulk insert degraded to row-by-row: %r", exc)

    return {
        "ok": True,
        "fetched": fetched,
        "new": new_count,
        "services": len(services),
        "errors": errors or None,
    }


async def cleanup_old_logs(db: AsyncSession, retention_hours: int = 72) -> int:
    """Raw lines age out — summaries are the archive. Returns rows removed."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=max(int(retention_hours), 1))
    try:
        result = await db.execute(delete(DevLog).where(DevLog.timestamp < cutoff))
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    return int(result.rowcount or 0)


async def log_stats(
    db: AsyncSession, since_hours: int = 24, user_id: Optional[int] = None
) -> Dict[str, Any]:
    """Counts by level / service / hour for the charts. DB-agnostic — the
    hourly bucketing happens in Python over (ts, level, service) tuples."""
    since = datetime.now(timezone.utc) - timedelta(hours=max(int(since_hours), 1))
    rows = (
        await db.execute(
            select(DevLog.timestamp, DevLog.level, DevLog.service_id, DevLog.service_name).where(
                DevLog.timestamp >= since
            )
        )
    ).all()
    by_level: Dict[str, int] = {}
    by_service: Dict[str, Dict[str, Any]] = {}
    by_hour: Dict[str, Dict[str, int]] = {}
    for ts, level, service_id, service_name in rows:
        level = level or "info"
        by_level[level] = by_level.get(level, 0) + 1
        svc = by_service.setdefault(
            service_id, {"service_id": service_id, "service_name": service_name, "total": 0, "error": 0}
        )
        svc["total"] += 1
        if level == "error":
            svc["error"] += 1
        if isinstance(ts, datetime):
            hour_key = ts.strftime("%Y-%m-%dT%H:00")
            bucket = by_hour.setdefault(hour_key, {"total": 0, "error": 0, "warn": 0})
            bucket["total"] += 1
            if level in bucket:
                bucket[level] += 1
    total = sum(by_level.values())
    return {
        "since_hours": since_hours,
        "total": total,
        "by_level": by_level,
        "by_service": sorted(by_service.values(), key=lambda s: -s["total"]),
        "by_hour": [
            {"hour": k, **v} for k, v in sorted(by_hour.items())
        ],
    }


async def probe(token: str, fetcher: Optional[Callable] = None) -> Dict[str, Any]:
    """Live «بررسی اتصال» — GET /owners. Returns {ok, owner?, error?}."""
    fetch = fetcher or _default_fetcher
    try:
        data = await fetch(f"{RENDER_API}/owners?limit=20", _headers(token))
        owner = ((data or [{}])[0] or {}).get("owner") or {}
        return {"ok": True, "owner": owner.get("name") or owner.get("email") or owner.get("id")}
    except Exception as exc:
        return {"ok": False, "error": token_service.sanitize_error(exc, token)}
