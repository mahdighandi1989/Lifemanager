"""موتور واحد زمان‌بندی — the single in-process job scheduler (phase 1).

The 2026-07-20 audit (#1) found the automation backbone split across two
columns: five live in-process loops in ``app/main.py`` and seven Celery
beat jobs that NEVER run in production (no worker/beat/redis is deployed;
the broker URL is hardcoded to localhost). This engine ports the scheduled
jobs onto the proven in-process pattern (cf. ``google_sync/engine.py``):

  * one asyncio loop started from ``app/main.py`` startup
  * per-job intervals + "last run" stamps persisted in ``GlobalSetting``
    (key ``jobs_engine_stamps``) so restarts don't double-run daily jobs
  * fail-open everywhere — one broken job never stops the others

The Celery tasks in ``app/tasks.py`` are intentionally left in place as
the quarantined legacy path (docs/overhaul/REMOVAL_CANDIDATES.md) — this
module is the canonical scheduled path from 2026-07-20 on.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_STAMPS_KEY = "jobs_engine_stamps"

# First tick waits this long after boot so startup migrations/seeds finish.
_BOOT_GRACE_SECONDS = 180
# The loop wakes this often and runs whatever is due.
_TICK_SECONDS = 600


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _env_minutes(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


# --- job bodies -------------------------------------------------------------
# Each body opens/receives its own session work and returns a small dict.
# They deliberately reuse the same service functions the (dead) Celery
# tasks called, so behaviour matches the documented intent of each job.


async def _job_si_daily_refresh(db: AsyncSession) -> dict[str, Any]:
    """Pre-create today's pending check-in rows for every user."""
    from app.models.user import User
    from app.services import self_improvement_service

    total_created = 0
    users = (await db.execute(select(User.id))).all()
    for (user_id,) in users:
        total_created += await self_improvement_service.refresh_daily_pending_rows(
            db, user_id=user_id
        )
    return {"users": len(users), "rows_created": total_created}


async def _job_si_auto_tick(db: AsyncSession) -> dict[str, Any]:
    """Copy today's TodoItem completions into auto_done check-ins."""
    from sqlalchemy import and_

    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items
    from app.models.user import User
    from app.services import self_improvement_service
    from app.services._self_improvement_seed_data import (
        MUHASEBE_LIST_NAME,
        SELF_IMPROVEMENT_LISTS,
    )

    today = _now().date()
    wanted = [MUHASEBE_LIST_NAME, *SELF_IMPROVEMENT_LISTS.keys()]
    list_ids = (
        await db.execute(select(TodoList.id).where(TodoList.name.in_(wanted)))
    ).scalars().all()
    if not list_ids:
        return {"ticked": 0, "users": 0}
    rows = await db.execute(
        select(TodoItem.id, TodoItem.completed_at)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .where(
            and_(
                todo_list_items.c.todo_list_id.in_(list_ids),
                TodoItem.is_completed.is_(True),
                TodoItem.deleted_at.is_(None),
            )
        )
        .distinct()
    )
    ticked_today = [
        iid for (iid, completed_at) in rows.all()
        if completed_at and completed_at.date() == today
    ]
    if not ticked_today:
        return {"ticked": 0, "users": 0}
    users = (await db.execute(select(User.id))).all()
    total = 0
    for (user_id,) in users:
        total += await self_improvement_service.apply_ai_auto_ticks(
            db,
            user_id=user_id,
            item_ids=ticked_today,
            reason="auto-ticked because the underlying TodoItem.is_completed flipped today",
            model="rule:todo_completed_today",
        )
    return {"ticked": total, "users": len(users)}


async def _job_si_profile_analytics(db: AsyncSession) -> dict[str, Any]:
    """Recompute the cached profile analytics + AI narrative per user."""
    from app.models.user import User
    from app.services import self_improvement_service

    refreshed = 0
    users = (await db.execute(select(User.id))).all()
    for (user_id,) in users:
        try:
            await self_improvement_service.regenerate_ai_narrative(
                db, user_id=user_id
            )
            refreshed += 1
        except Exception as exc:
            logger.warning("profile analytics failed for user %s: %r", user_id, exc)
    return {"refreshed": refreshed}


async def _job_context_recommendations(db: AsyncSession) -> dict[str, Any]:
    """Per-user contextual recommendation generation + proactive bell.

    Reuses the module-level helper the Celery task wrapped, so the
    «پیشنهاد جدید» event finally fires in production (audit #18)."""
    from app.tasks import _analyze_all_user_contexts

    users_analyzed, recs_generated = await _analyze_all_user_contexts()
    return {"users_analyzed": users_analyzed, "recommendations": recs_generated}


async def _job_cold_tiering(db: AsyncSession) -> dict[str, Any]:
    """Classify aging data + migrate cold Drive files (audit 7367c6f0)."""
    from app.models.task import Task
    from app.services import drive_settings_service as dss
    from app.services.cold_tiering_service import sheet_row_for, tier_cold_files
    from app.services.data_classification_service import DataClassificationService
    from app.services.google_api_client import (
        build_clients,
        ensure_app_folders,
        make_drive_mover,
    )
    from app.services.sheets_service import record_index_entry

    svc = DataClassificationService()
    drive_client, sheets_client = await build_clients(db)
    refresh_token = await dss.resolve_refresh_token(db)
    mover = None
    if drive_client is not None:
        try:
            _root, subfolders = await ensure_app_folders(db, drive_client)
            mover = make_drive_mover(drive_client, subfolders)
        except Exception as exc:
            logger.warning("cold_tiering: Drive folder bootstrap failed: %r", exc)

    async def _ledger(row) -> None:
        await record_index_entry(
            sheet_row_for(row), refresh_token=refresh_token, client=sheets_client
        )

    tasks = (await db.execute(select(Task))).scalars().all()
    total = len(tasks)
    cold = sum(
        1 for t in tasks if svc.classify_task_essentiality(t) != "essential"
    )
    tiered = await tier_cold_files(db, mover=mover, ledger=_ledger)
    return {"total": total, "cold_eligible": cold, "files_migrated": tiered["migrated"]}


async def _job_finance_email_poll(db: AsyncSession) -> dict[str, Any]:
    """Pull-side finance refresh: poll the configured IMAP mailbox and feed
    each new message through apply_bank_message. No-op without
    FINANCE_IMAP_URL (the push webhook stays independent)."""
    imap_url = os.getenv("FINANCE_IMAP_URL")
    if not imap_url:
        return {"checked_emails": 0, "balances_updated": 0, "skipped": "no FINANCE_IMAP_URL"}
    try:
        ingest_user_id = int(os.getenv("FINANCE_INGEST_USER_ID", "0"))
    except ValueError:
        ingest_user_id = 0

    from app.services.finance_imap_service import fetch_unseen_email_bodies
    from app.services.finance_ingest_service import apply_bank_message

    # IMAP fetch is blocking — keep it off the event loop.
    bodies = await asyncio.to_thread(fetch_unseen_email_bodies, imap_url)
    updated = 0
    for body in bodies:
        try:
            res = await apply_bank_message(
                db, user_id=ingest_user_id, channel="email", body=body
            )
            updated += int(res.get("balances_updated") or 0)
        except Exception as exc:
            logger.warning("finance_email_poll: apply failed: %r", exc)
    return {"checked_emails": len(bodies), "balances_updated": updated}


async def _job_finance_analysis(db: AsyncSession) -> dict[str, Any]:
    """Periodic income/expense/profit-loss review → ONE clear notification,
    fired only when the current month's per-currency totals actually change
    (dedup on a stored signature, so a daily run doesn't re-nag the same
    numbers). Owner: «چند وقت یک‌بار همه‌چیز را بررسی کن و اطلاعیهٔ واضح بده»."""
    from app.models.global_setting import GlobalSetting
    from app.services.finance_report_service import build_report, summarize_current_month

    report = await build_report(db, user_id=0, months=2)
    summary = summarize_current_month(report)
    if not summary.get("lines"):
        return {"notified": False, "reason": "no data"}

    sig_key = "finance_analysis:last"
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == sig_key))
    ).scalars().first()
    sig = f"{summary['month']}::{summary['signature']}"
    if row is not None and row.value == sig:
        return {"notified": False, "reason": "unchanged"}

    message = f"📊 گزارشِ مالیِ {summary['month']}:\n" + "\n".join(summary["lines"])
    try:
        from app.services.notification_service import notify_event

        uid = int(os.getenv("TELEGRAM_TASK_USER_ID", "0") or 0)
        await notify_event(
            "attention_alert", user_id=uid, db=db,
            title="📊 گزارشِ مالی", message=message, priority="normal",
        )
    except Exception as exc:
        logger.debug("finance analysis notify failed: %r", exc)

    if row is None:
        db.add(GlobalSetting(key=sig_key, value=sig))
    else:
        row.value = sig
    await db.commit()
    return {"notified": True, "month": summary["month"]}


async def _job_finance_email_scan(db: AsyncSession) -> dict[str, Any]:
    """مالیِ خودتغذیه — read the synced Gmail and keep the finance cards live
    (create a card per newly-seen account, update balances). Owner-triggerable
    from the «مالی» page too; this keeps it up to date without a click."""
    from app.services.finance_email_scan_service import scan_finance_emails

    uid = int(os.getenv("TELEGRAM_TASK_USER_ID", "0") or 0)
    return await scan_finance_emails(db, uid)


async def _job_sahat_snapshot(db: AsyncSession) -> dict[str, Any]:
    """Persist one نقشهٔ ساحت‌ها snapshot per day so the over-time trend fills
    without the owner clicking anything."""
    from app.services.sahat_service import snapshot_sahat_map

    data = await snapshot_sahat_map(db, uid=0)
    scores = {s["key"]: s["score"] for s in data.get("sahats", [])}
    return {"scores": scores}


async def _job_file_reconcile(db: AsyncSession) -> dict[str, Any]:
    """Prune indexed file-source entries whose paths vanished (217909d2)."""
    from app.models.indexed_data_source_entry import IndexedDataSourceEntry
    from app.services.data_ingestion_service import DataIngestionService

    users_scanned = 0
    total_removed = 0
    user_ids = (
        await db.execute(select(IndexedDataSourceEntry.user_id).distinct())
    ).scalars().all()
    svc = DataIngestionService(db)
    for user_id in user_ids:
        users_scanned += 1
        rows = (
            await db.execute(
                select(IndexedDataSourceEntry.source_path).where(
                    IndexedDataSourceEntry.user_id == user_id
                )
            )
        ).scalars().all()
        present = [p for p in rows if p and os.path.exists(p)]
        pruned = await svc.compare_and_remove_deleted(
            user_id=user_id, present_paths=present
        )
        total_removed += pruned.get("removed", 0)
    return {"users": users_scanned, "removed": total_removed}


# --- registry ---------------------------------------------------------------

JobFn = Callable[[AsyncSession], Awaitable[dict[str, Any]]]

# (key, title_fa, interval_minutes_fn, body). Interval is resolved at tick
# time so env knobs apply without a restart.
JOBS: list[tuple[str, str, Callable[[], float], JobFn]] = [
    ("si_daily_refresh", "رفرش روزانهٔ خودسازی",
     lambda: 24 * 60.0, _job_si_daily_refresh),
    ("si_auto_tick", "auto-tick شبانهٔ عادت‌ها",
     lambda: 24 * 60.0, _job_si_auto_tick),
    ("si_profile_analytics", "آنالیتیکس پروفایل خودسازی",
     lambda: 24 * 60.0, _job_si_profile_analytics),
    ("context_recommendations", "پیشنهادهای زمینه‌ای + اعلان",
     lambda: _env_minutes("CONTEXT_ANALYSIS_INTERVAL_MINUTES", 30.0),
     _job_context_recommendations),
    ("cold_tiering", "کوچ دادهٔ سرد به Drive",
     lambda: 24 * 60.0, _job_cold_tiering),
    ("finance_email_poll", "پول‌خوانی ایمیل بانکی (IMAP)",
     lambda: _env_minutes("FINANCE_POLL_INTERVAL_MINUTES", 30.0),
     _job_finance_email_poll),
    ("finance_email_scan", "شناساییِ حساب‌ها از ایمیل (خودتغذیه)",
     lambda: _env_minutes("FINANCE_EMAIL_SCAN_INTERVAL_MINUTES", 6 * 60.0),
     _job_finance_email_scan),
    ("finance_periodic_analysis", "تحلیل دوره‌ای مالی + اطلاعیه",
     lambda: _env_minutes("FINANCE_ANALYSIS_INTERVAL_MINUTES", 24 * 60.0),
     _job_finance_analysis),
    ("sahat_daily_snapshot", "ثبتِ روزانهٔ نقشهٔ ساحت‌ها",
     lambda: _env_minutes("SAHAT_SNAPSHOT_INTERVAL_MINUTES", 24 * 60.0),
     _job_sahat_snapshot),
    ("file_reconcile", "هرس ایندکس فایل‌های حذف‌شده",
     lambda: _env_minutes("FILE_SYNC_INTERVAL_MINUTES", 30.0),
     _job_file_reconcile),
]


# --- stamps persistence -----------------------------------------------------


async def _load_stamps(db: AsyncSession) -> dict[str, Any]:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(
            select(GlobalSetting).where(GlobalSetting.key == _STAMPS_KEY)
        )
    ).scalars().first()
    if row is None or not row.value:
        return {}
    try:
        return json.loads(row.value)
    except Exception:
        return {}


async def _save_stamps(db: AsyncSession, stamps: dict[str, Any]) -> None:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(
            select(GlobalSetting).where(GlobalSetting.key == _STAMPS_KEY)
        )
    ).scalars().first()
    payload = json.dumps(stamps, ensure_ascii=False)
    if row is None:
        db.add(GlobalSetting(key=_STAMPS_KEY, value=payload))
    else:
        row.value = payload
    await db.commit()


def _due(last_iso: Optional[str], interval_minutes: float, now: datetime) -> bool:
    if not last_iso:
        return True
    try:
        last = datetime.fromisoformat(last_iso)
    except ValueError:
        return True
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    return (now - last).total_seconds() >= interval_minutes * 60.0


# --- tick + loop ------------------------------------------------------------


async def jobs_tick(db: AsyncSession, now: Optional[datetime] = None) -> dict[str, Any]:
    """Run every due job once. Returns {job_key: result_or_error}."""
    now = now or _now()
    stamps = await _load_stamps(db)
    ran: dict[str, Any] = {}
    for key, title, interval_fn, body in JOBS:
        entry = stamps.get(key) or {}
        if not _due(entry.get("last_run"), interval_fn(), now):
            continue
        try:
            result = await body(db)
            ran[key] = result
            stamps[key] = {
                "last_run": now.isoformat(),
                "last_ok": now.isoformat(),
                "last_result": result,
                "last_error": None,
                "title": title,
            }
            logger.info("jobs_engine %s: %s", key, result)
        except Exception as exc:
            # Fail open — record the error, keep the cadence (so a
            # permanently broken job doesn't hot-loop every tick).
            ran[key] = {"error": str(exc)}
            stamps[key] = {
                **(entry or {}),
                "last_run": now.isoformat(),
                "last_error": str(exc),
                "title": title,
            }
            logger.warning("jobs_engine %s failed: %r", key, exc)
            try:
                await db.rollback()
            except Exception:
                pass
    if ran:
        await _save_stamps(db, stamps)
    return ran


async def get_jobs_status(db: AsyncSession) -> dict[str, Any]:
    """Status surface for the settings/system-map pages."""
    stamps = await _load_stamps(db)
    jobs = []
    for key, title, interval_fn, _body in JOBS:
        entry = stamps.get(key) or {}
        jobs.append({
            "key": key,
            "title": title,
            "interval_minutes": interval_fn(),
            "last_run": entry.get("last_run"),
            "last_ok": entry.get("last_ok"),
            "last_error": entry.get("last_error"),
            "last_result": entry.get("last_result"),
        })
    return {"ok": True, "jobs": jobs}


async def jobs_loop(stop_event) -> None:
    """The in-process scheduler loop — started from app/main.py startup."""
    from app.database import SessionLocal

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=_BOOT_GRACE_SECONDS)
        return  # stop requested during the boot grace period
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            async with SessionLocal() as db:
                await jobs_tick(db)
        except Exception as exc:
            logger.warning("jobs_engine tick failed: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=_TICK_SECONDS)
        except asyncio.TimeoutError:
            continue
