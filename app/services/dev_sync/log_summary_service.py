"""Persian daily log summaries — «امروز در این پروژه چه کارهایی شد؟»

Turns a day's raw Render log lines (mostly repetitive English/machine noise)
into ONE human-readable Persian digest per service/project:

1. Compress the day's lines into a digest (counts by level, deploy/build
   markers, distinct errors, most-frequent messages with duplicates
   collapsed — numbers/ids normalized away so "count=101" and "count=102"
   group together).
2. Ask the configured text model (AI task ``dev_log_summary``, falls back to
   ``general`` inside the gateway) for a short Persian narrative.
3. Fail-open: no model / provider error → a deterministic Persian fallback
   built from the same digest (``ai_model`` stays NULL — provenance rule).
4. Upsert one ``dev_log_summaries`` row per (service, local date) and mirror
   it into the activity log (global page + the per-project panel; when the
   repo is linked to a life project the row also carries that context).
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dev_sync import DevLog, DevLogSummary, DevProject, DevService

logger = logging.getLogger(__name__)

_NUMBERS_RE = re.compile(r"\b[0-9a-f]{8,}\b|\d+", re.I)
_WS_RE = re.compile(r"\s+")
_DEPLOY_RE = re.compile(r"deploy|build|==>|starting|listening|uvicorn running|live", re.I)

MAX_ERROR_SAMPLES = 15
MAX_TOP_MESSAGES = 10


def _as_utc(ts: Optional[datetime]) -> Optional[datetime]:
    if ts is None:
        return None
    if ts.tzinfo is None:
        return ts.replace(tzinfo=timezone.utc)
    return ts.astimezone(timezone.utc)


def local_date(now_utc: datetime, tz_offset_minutes: int) -> date:
    return (now_utc + timedelta(minutes=tz_offset_minutes)).date()


def day_window_utc(day: date, tz_offset_minutes: int) -> tuple[datetime, datetime]:
    """UTC [start, end) of the LOCAL calendar day."""
    start_local = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
    start = start_local - timedelta(minutes=tz_offset_minutes)
    return start, start + timedelta(days=1)


def normalize_message(message: str) -> str:
    return _WS_RE.sub(" ", _NUMBERS_RE.sub("#", message or "")).strip()[:300]


def build_digest(logs: List[DevLog]) -> Dict[str, Any]:
    """Compress one service-day of lines into prompt-sized structured stats."""
    by_level: Dict[str, int] = {}
    groups: Dict[str, Dict[str, Any]] = {}
    errors: List[str] = []
    deploys = 0
    first_ts: Optional[datetime] = None
    last_ts: Optional[datetime] = None
    for row in logs:
        level = row.level or "info"
        by_level[level] = by_level.get(level, 0) + 1
        ts = _as_utc(row.timestamp)
        if ts is not None:
            if first_ts is None or ts < first_ts:
                first_ts = ts
            if last_ts is None or ts > last_ts:
                last_ts = ts
        message = row.message or ""
        if _DEPLOY_RE.search(message):
            deploys += 1
        key = f"{level}|{normalize_message(message)}"
        group = groups.setdefault(key, {"count": 0, "level": level, "example": message[:400]})
        group["count"] += 1
        if level == "error" and len(errors) < MAX_ERROR_SAMPLES:
            normalized = normalize_message(message)
            if normalized not in {normalize_message(e) for e in errors}:
                errors.append(message[:400])
    top = sorted(groups.values(), key=lambda g: -g["count"])[:MAX_TOP_MESSAGES]
    return {
        "total": len(logs),
        "by_level": by_level,
        "deploy_events": deploys,
        "distinct_messages": len(groups),
        "first_at": first_ts.isoformat() if first_ts else None,
        "last_at": last_ts.isoformat() if last_ts else None,
        "top_messages": [
            {"count": g["count"], "level": g["level"], "example": g["example"]} for g in top
        ],
        "error_samples": errors,
    }


_SUMMARY_PROMPT = """تو دستیار فارسی‌زبان من هستی. خلاصهٔ فعالیت روزانهٔ یکی از سرویس‌های من را از روی
آمار فشردهٔ لاگ‌های همان روز بنویس. لاگ‌های خام انگلیسی و پرتکرار بوده‌اند؛ کار تو این است که
به زبان سادهٔ فارسی بگویی «امروز در این سرویس/پروژه چه گذشت»:

- چه عملیات و استفاده‌هایی انجام شد (دیپلوی/راه‌اندازی، درخواست‌ها، کارهای پس‌زمینه)
- چه خطاها یا هشدارهای مهمی رخ داد (تکراری‌ها را یکی کن، بی‌اهمیت‌ها را حذف کن)
- اگر روز آرامی بود، همین را کوتاه بگو

قواعد: فقط فارسی روان؛ حداکثر ۶-۸ جمله یا بولت؛ عددهای مهم را نگه دار؛ هیچ چیزی از خودت
اختراع نکن — فقط از همین داده‌ها.

سرویس: {service_name}
تاریخ: {day}
آمار فشرده:
{digest}
"""


def fallback_summary_fa(service_name: str, digest: Dict[str, Any]) -> str:
    by_level = digest.get("by_level") or {}
    parts = [
        f"امروز {digest.get('total', 0)} خط لاگ از سرویس «{service_name}» ثبت شد"
        f" ({by_level.get('error', 0)} خطا، {by_level.get('warn', 0)} هشدار،"
        f" {by_level.get('info', 0)} اطلاع)."
    ]
    if digest.get("deploy_events"):
        parts.append(f"{digest['deploy_events']} رویداد دیپلوی/راه‌اندازی دیده شد.")
    errors = digest.get("error_samples") or []
    if errors:
        parts.append("خطاهای شاخص: " + " | ".join(e[:120] for e in errors[:3]))
    if not errors and digest.get("total", 0) > 0:
        parts.append("خطای قابل‌توجهی ثبت نشده — روز آرامی بود.")
    if digest.get("total", 0) == 0:
        return f"امروز لاگی از سرویس «{service_name}» ثبت نشد."
    return " ".join(parts)


async def _ai_summary(
    db: AsyncSession, service_name: str, day: date, digest: Dict[str, Any]
) -> tuple[Optional[str], Optional[str]]:
    try:
        from app.services.ai.inference_gateway import complete

        prompt = _SUMMARY_PROMPT.format(
            service_name=service_name,
            day=day.isoformat(),
            digest=json.dumps(digest, ensure_ascii=False)[:6000],
        )
        res = await complete(db, prompt, task="dev_log_summary", max_tokens=700)
        if res.get("ok") and res.get("text", "").strip():
            return res["text"].strip()[:8000], res.get("model")
    except Exception as exc:
        logger.debug("dev log AI summary skipped: %r", exc)
    return None, None


def serialize_summary(row: DevLogSummary) -> Dict[str, Any]:
    return {
        "id": row.id,
        "dev_project_id": row.dev_project_id,
        "service_id": row.service_id,
        "service_name": row.service_name,
        "summary_date": row.summary_date.isoformat() if row.summary_date else None,
        "summary": row.summary,
        "stats": row.stats,
        "ai_model": row.ai_model,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


async def generate_daily_summaries(
    db: AsyncSession,
    user_id: Optional[int] = None,
    summary_date: Optional[date] = None,
    tz_offset_minutes: int = 240,
    now: Optional[datetime] = None,
    only_service_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Generate/refresh one summary per service for the given LOCAL day
    (default: today). Never raises; skips services with zero lines unless a
    summary row already exists (then it refreshes it)."""
    now = now or datetime.now(timezone.utc)
    day = summary_date or local_date(now, tz_offset_minutes)
    start, end = day_window_utc(day, tz_offset_minutes)

    services_query = select(DevService)
    if only_service_id:
        services_query = services_query.where(DevService.id == only_service_id)
    services = (await db.execute(services_query)).scalars().all()
    projects = {
        p.id: p for p in (await db.execute(select(DevProject))).scalars().all()
    }

    results: List[Dict[str, Any]] = []
    for svc in services:
        try:
            logs = (
                (
                    await db.execute(
                        select(DevLog)
                        .where(
                            DevLog.service_id == svc.id,
                            DevLog.timestamp >= start,
                            DevLog.timestamp < end,
                        )
                        .order_by(DevLog.timestamp)
                    )
                )
                .scalars()
                .all()
            )
            existing = (
                (
                    await db.execute(
                        select(DevLogSummary).where(
                            DevLogSummary.service_id == svc.id,
                            DevLogSummary.summary_date == day,
                        )
                    )
                )
                .scalars()
                .first()
            )
            if not logs and existing is None:
                continue
            digest = build_digest(logs)
            text, model = await _ai_summary(db, svc.name, day, digest)
            if not text:
                text = fallback_summary_fa(svc.name, digest)
            if existing is None:
                existing = DevLogSummary(
                    user_id=user_id,
                    service_id=svc.id,
                    summary_date=day,
                )
                db.add(existing)
            existing.dev_project_id = svc.dev_project_id
            existing.service_name = svc.name
            existing.summary = text
            existing.stats = digest
            existing.ai_model = model
            await db.commit()
            await db.refresh(existing)
            results.append(serialize_summary(existing))

            # Mirror into the activity trail AFTER the commit (global log page
            # + per-project panel; linked life project gets it as context).
            try:
                from app.services.activity_log_service import record_activity

                project = projects.get(svc.dev_project_id) if svc.dev_project_id else None
                await record_activity(
                    action="dev_daily_summary",
                    entity_type="dev_project" if project else "dev_service",
                    entity_id=project.id if project else svc.id,
                    entity_label=(project.name if project else svc.name),
                    context_type="project" if (project and project.linked_project_id) else None,
                    context_id=project.linked_project_id if project else None,
                    detail=f"کارنامهٔ {day.isoformat()} — {text[:1500]}",
                    user_id=user_id,
                    db=db,
                )
            except Exception as exc:
                logger.debug("dev summary activity mirror skipped: %r", exc)
        except Exception as exc:
            logger.warning("daily summary failed for %s: %r", svc.id, exc)
            try:
                await db.rollback()
            except Exception:
                pass
    return results
