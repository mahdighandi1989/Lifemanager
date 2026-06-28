"""Celery tasks for asynchronous notification + email delivery.

Imported by app/celery_app.py via the ``include=["app.tasks"]`` config.
Each task is invoked from the synchronous code path with ``.delay(...)``
or ``.apply_async(...)`` so the calling request returns immediately and
the heavy lifting happens on a worker.

The tasks here are SMTP-free in tests: ``send_email_task`` calls into
``notification_service.send_email`` which goes through a configurable
transport; the default in dev/test is a no-op logger so the test suite
doesn't need a live SMTP server.
"""
from __future__ import annotations

import logging
from typing import Any

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.send_email_task", bind=True, max_retries=3)
def send_email_task(
    self,
    *,
    to: str,
    subject: str,
    body: str,
    headers: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Celery task wrapper around ``notification_service.send_email``.

    Retries up to 3 times on transport errors with exponential backoff.
    The synchronous notification path calls
    ``send_email_task.delay(...)`` to schedule the actual send.
    """
    from app.services.notification_service import send_email

    try:
        delivered = send_email(to=to, subject=subject, body=body, headers=headers)
        return {"delivered": delivered, "to": to, "subject": subject}
    except Exception as exc:
        logger.warning("send_email_task retry for %s: %r", to, exc)
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery_app.task(name="app.tasks.send_notification_task", bind=True, max_retries=3)
def send_notification_task(
    self,
    *,
    user_id: int,
    message: str,
    channel: str = "email",
    **kwargs: Any,
) -> dict[str, Any]:
    """Celery task that fans a notification out to the requested channel.

    For channel='email' this calls ``send_email_task.delay(...)`` which
    re-queues the actual SMTP send so the notification record is
    persisted before any blocking IO happens.
    """
    logger.info("send_notification_task: user=%s channel=%s", user_id, channel)
    if channel == "email":
        send_email_task.delay(
            to=kwargs.get("email", ""),
            subject=kwargs.get("subject", "notification"),
            body=message,
        )
    return {"queued": True, "user_id": user_id, "channel": channel}


# --- Self-improvement (خودسازی) periodic tasks ----------------------------
#
# Three nightly tasks power the dashboard the user asked for:
#
#   1. refresh_self_improvement_daily — pre-creates today's pending
#      check-in rows for every user so the dashboard never shows an
#      empty table after midnight.
#   2. run_self_improvement_ai_auto_tick — runs a heuristic + (when
#      a key is configured) AI pass to mark habits the user implicitly
#      completed via other signals (TodoItem.is_completed flips, etc.).
#   3. run_self_improvement_profile_analytics — recomputes the cached
#      stats + asks the AI for a Persian narrative for every user.
#
# All three are async at heart, so we drop into an asyncio.run() inside
# the synchronous Celery task body. Errors are logged but not retried
# at the task level — these are non-critical batch jobs and the next
# nightly run will catch up.
@celery_app.task(name="app.tasks.refresh_self_improvement_daily")
def refresh_self_improvement_daily() -> dict[str, Any]:
    """Pre-create today's pending check-in rows for every user."""
    import asyncio

    async def _run() -> dict[str, Any]:
        from sqlalchemy import select

        from app.database import SessionLocal
        from app.models.user import User
        from app.services import self_improvement_service

        total_created = 0
        user_count = 0
        async with SessionLocal() as db:
            users = (await db.execute(select(User.id))).all()
            for (user_id,) in users:
                user_count += 1
                created = await self_improvement_service.refresh_daily_pending_rows(
                    db, user_id=user_id,
                )
                total_created += created
        return {"users": user_count, "rows_created": total_created}

    try:
        return asyncio.run(_run())
    except Exception as exc:
        logger.exception("refresh_self_improvement_daily failed: %r", exc)
        return {"error": str(exc)}


@celery_app.task(name="app.tasks.run_self_improvement_ai_auto_tick")
def run_self_improvement_ai_auto_tick() -> dict[str, Any]:
    """Apply AI-suggested auto-completions for today's habits.

    The current heuristic is intentionally conservative: a self-
    improvement TodoItem whose ``is_completed`` flag was flipped
    today (via the normal TodoItem UI) auto-ticks today's check-in
    as ``auto_done``. This handles the user's "I ticked it
    somewhere else, copy that across" use case without needing a
    live AI call.
    """
    import asyncio

    async def _run() -> dict[str, Any]:
        from datetime import datetime, timezone

        from sqlalchemy import and_, select

        from app.database import SessionLocal
        from app.models.todo_item import TodoItem
        from app.models.todo_list import todo_list_items
        from app.models.user import User
        from app.services import self_improvement_service
        from app.services._self_improvement_seed_data import (
            MUHASEBE_LIST_NAME,
            SELF_IMPROVEMENT_LISTS,
        )

        today = datetime.now(timezone.utc).date()
        wanted_list_names = [MUHASEBE_LIST_NAME, *SELF_IMPROVEMENT_LISTS.keys()]

        total_ticked = 0
        async with SessionLocal() as db:
            from app.models.todo_list import TodoList

            list_id_rows = await db.execute(
                select(TodoList.id).where(TodoList.name.in_(wanted_list_names))
            )
            list_ids = [r for (r,) in list_id_rows.all()]
            if not list_ids:
                return {"ticked": 0, "users": 0}
            item_id_rows = await db.execute(
                select(TodoItem.id, TodoItem.completed_at)
                .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
                .where(
                    and_(
                        todo_list_items.c.todo_list_id.in_(list_ids),
                        TodoItem.is_completed.is_(True),
                    )
                )
                .distinct()
            )
            ticked_today = [
                iid for (iid, completed_at) in item_id_rows.all()
                if completed_at and completed_at.date() == today
            ]
            if not ticked_today:
                return {"ticked": 0, "users": 0}

            users = (await db.execute(select(User.id))).all()
            for (user_id,) in users:
                affected = await self_improvement_service.apply_ai_auto_ticks(
                    db,
                    user_id=user_id,
                    item_ids=ticked_today,
                    reason="auto-ticked because the underlying TodoItem.is_completed flipped today",
                    model="rule:todo_completed_today",
                )
                total_ticked += affected
        return {"ticked": total_ticked, "users": len(users)}

    try:
        return asyncio.run(_run())
    except Exception as exc:
        logger.exception("run_self_improvement_ai_auto_tick failed: %r", exc)
        return {"error": str(exc)}


@celery_app.task(name="app.tasks.run_self_improvement_profile_analytics")
def run_self_improvement_profile_analytics() -> dict[str, Any]:
    """Recompute the cached profile analytics + AI narrative per user."""
    import asyncio

    async def _run() -> dict[str, Any]:
        from sqlalchemy import select

        from app.database import SessionLocal
        from app.models.user import User
        from app.services import self_improvement_service

        refreshed = 0
        async with SessionLocal() as db:
            users = (await db.execute(select(User.id))).all()
            for (user_id,) in users:
                try:
                    await self_improvement_service.regenerate_ai_narrative(
                        db, user_id=user_id,
                    )
                    refreshed += 1
                except Exception as exc:  # one bad user shouldn't kill the rest
                    logger.warning(
                        "profile analytics failed for user %s: %r", user_id, exc
                    )
        return {"refreshed": refreshed}

    try:
        return asyncio.run(_run())
    except Exception as exc:
        logger.exception("run_self_improvement_profile_analytics failed: %r", exc)
        return {"error": str(exc)}


@celery_app.task(name="app.tasks.analyze_user_context")
def analyze_user_context() -> dict[str, Any]:
    """Audit task 2165524b AC4 — run the context engine and log the outcome.

    Scheduled every 15 minutes by celery beat. The orchestrator is rule-based
    (no upstream call), so this is cheap; logging the suggestion count makes
    the outcome rate observable in celery.log."""
    from app.services.context_engine import ContextOrchestrator

    result = ContextOrchestrator().analyze({})
    count = len(result.get("suggestions", []))
    logger.info("ai_context analyze_user_context ran: %d suggestion(s)", count)
    return {"suggestions": count}


@celery_app.task(name="app.tasks.tier_cold_data")
def tier_cold_data() -> dict[str, Any]:
    """Audit task 7367c6f0 AC8/AC11 — classify tasks and tally the
    non-essential (cold-eligible) ones a credentialed Drive sync would migrate
    out to keep the DB under its size cap. Scheduled daily; logs the tally."""
    import asyncio

    async def _run() -> dict[str, Any]:
        from sqlalchemy import select

        from app.database import SessionLocal
        from app.models.task import Task
        from app.services.cold_tiering_service import sheet_row_for, tier_cold_files
        from app.services.data_classification_service import DataClassificationService
        from app.services.sheets_service import record_index_entry

        svc = DataClassificationService()
        total = 0
        cold = 0

        async def _ledger(row) -> None:
            # Record every migrated file in the central LifeManagerIndex sheet
            # ("توی شیت باید همه چیزا ثبت بشه"). Best-effort: a clean no-op when
            # Sheets credentials/client aren't configured (audit task 7367c6f0).
            await record_index_entry(sheet_row_for(row))

        async with SessionLocal() as db:
            tasks = (await db.execute(select(Task))).scalars().all()
            for task in tasks:
                total += 1
                if svc.classify_task_essentiality(task) != "essential":
                    cold += 1
            # Actually migrate cold DriveFiles (>30 days untouched) out to Drive
            # — the AC4 tiering, not just a task tally (audit task 7367c6f0) —
            # logging each migration to the central sheet ledger (AC2).
            tiered = await tier_cold_files(db, ledger=_ledger)
        return {"total": total, "cold_eligible": cold, "files_migrated": tiered["migrated"]}

    try:
        result = asyncio.run(_run())
        logger.info("tier_cold_data: %s", result)
        return result
    except Exception as exc:
        logger.exception("tier_cold_data failed: %r", exc)
        return {"error": str(exc)}


@celery_app.task(name="app.tasks.process_ai_ingestion_event")
def process_ai_ingestion_event(
    *, entity_type: str, entity_id: int, action: str = "created"
) -> dict[str, Any]:
    """Audit task 1a08ded2 AC 65-67 — ingest a changed entity for AI analysis.

    Enqueued by ``app.services.event_publisher.publish_data_change_event`` on
    create/update of a TodoItem (and, in future, other entity types). Loads
    the row, runs ``nlp_service.analyze_content`` via ``ai_ingestion_service``,
    and logs the outcome. Best-effort batch job: errors are logged, not
    retried — the next write re-publishes.
    """
    import asyncio

    async def _run() -> dict[str, Any]:
        from app.database import SessionLocal
        from app.services.ai_ingestion_service import ingest_entity

        async with SessionLocal() as db:
            return await ingest_entity(
                db, entity_type=entity_type, entity_id=entity_id, action=action
            )

    try:
        result = asyncio.run(_run())
        logger.info("process_ai_ingestion_event: %s", result)
        return result
    except Exception as exc:
        logger.exception("process_ai_ingestion_event failed: %r", exc)
        return {"error": str(exc)}


@celery_app.task(name="app.tasks.process_finance_updates")
def process_finance_updates() -> dict[str, Any]:
    """Audit task 4ae4b3ca AC 11 — periodic (every 30 min) balance refresh.

    Scans newly arrived bank emails / SMS and updates account balances so the
    user doesn't re-enter them by hand. The extraction logic lives in
    EmailParserService.parse_balance + SmsListenerService.parse_sms; this task
    is the scheduler that feeds a configured inbox / SMS gateway through them.

    Best-effort: with no live email/SMS source credentialed (the common case
    on a fresh deploy) it's a clean no-op — the plumbing is in place so a
    credentialed source lights it up without a code change. Errors are logged,
    never retried (the next 30-min tick catches up).
    """
    # The apply path is real + reachable: each message flows through
    # app/services/finance_ingest_service.apply_bank_message (parse → update
    # FinancialAccount balance → record a Transaction → fire the affordable-task
    # reminder). The synchronous entry point is POST /api/finance/ingest-message
    # (an operator's SMS gateway pushes there). This scheduled task is the *pull*
    # side: when FINANCE_IMAP_URL is configured it polls the mailbox via
    # finance_imap_service and feeds each new message through apply_bank_message.
    # It stays a clean no-op until those credentials exist (TO-DO/task-4ae4b3ca).
    import asyncio
    import os

    imap_url = os.getenv("FINANCE_IMAP_URL")
    if not (imap_url or os.getenv("FINANCE_SMS_WEBHOOK")):
        logger.info("process_finance_updates: no email/SMS source configured — skip")
        return {"checked_emails": 0, "checked_sms": 0, "balances_updated": 0}

    # FINANCE_SMS_WEBHOOK is a *push* source (the gateway POSTs to
    # /api/finance/ingest-message), so there's nothing to pull for SMS here.
    if not imap_url:
        return {"checked_emails": 0, "checked_sms": 0, "balances_updated": 0}

    # Which account-owner the mailbox belongs to (single-tenant default = anon 0).
    try:
        ingest_user_id = int(os.getenv("FINANCE_INGEST_USER_ID", "0"))
    except ValueError:
        ingest_user_id = 0

    try:
        from app.services.finance_imap_service import fetch_unseen_email_bodies

        bodies = fetch_unseen_email_bodies(imap_url)
    except Exception as exc:
        logger.exception("process_finance_updates: IMAP pull failed: %r", exc)
        return {"checked_emails": 0, "checked_sms": 0, "balances_updated": 0, "error": str(exc)}

    if not bodies:
        return {"checked_emails": 0, "checked_sms": 0, "balances_updated": 0}

    async def _apply() -> int:
        from app.database import SessionLocal
        from app.services.finance_ingest_service import apply_bank_message

        updated = 0
        async with SessionLocal() as db:
            for body in bodies:
                try:
                    res = await apply_bank_message(
                        db, user_id=ingest_user_id, channel="email", body=body
                    )
                    updated += int(res.get("balances_updated") or 0)
                except Exception as exc:  # one bad message must not drop the batch
                    logger.warning("process_finance_updates: apply failed: %r", exc)
        return updated

    try:
        balances_updated = asyncio.run(_apply())
    except Exception as exc:
        logger.exception("process_finance_updates: apply batch failed: %r", exc)
        return {"checked_emails": len(bodies), "checked_sms": 0, "balances_updated": 0, "error": str(exc)}

    result = {"checked_emails": len(bodies), "checked_sms": 0, "balances_updated": balances_updated}
    logger.info("process_finance_updates: %s", result)
    return result


@celery_app.task(name="app.tasks.sync_indexed_file_sources")
def sync_indexed_file_sources() -> dict[str, Any]:
    """Audit task 217909d2 Step 2 / AC3 — periodic file-source reconcile.

    The backend half of the "هر از چندگاهی که براش تنظیم می‌کنم این لیست‌های
    داده‌هایی که دارم رو به روز بکنه ... اگه حذف شدن ازش پاک بکنه" mobile loop.
    Scheduled by celery beat every ``FILE_SYNC_INTERVAL_MINUTES`` minutes
    (configurable per-deploy). For each user that has indexed source entries,
    it re-checks every ``source_path`` against the filesystem and prunes the
    ones that vanished — keeping the index in sync without the client having to
    re-post the full path list.

    A mobile/desktop client that holds paths the server can't see (its own
    filesystem) still drives add+prune via POST /api/assets/sync; this task
    covers the server-visible sources (local dirs, mounted external drives) and
    is the always-on safety net so deletions never linger in the index.

    Best-effort: errors are logged, never retried — the next tick catches up.
    """
    import asyncio
    import os

    async def _run() -> dict[str, Any]:
        from sqlalchemy import select

        from app.database import SessionLocal
        from app.models.indexed_data_source_entry import IndexedDataSourceEntry
        from app.services.data_ingestion_service import DataIngestionService

        users_scanned = 0
        total_removed = 0
        async with SessionLocal() as db:
            user_ids = (
                await db.execute(
                    select(IndexedDataSourceEntry.user_id).distinct()
                )
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
                # Keep only the paths the server can still see on disk; anything
                # gone is pruned by compare_and_remove_deleted.
                present = [p for p in rows if p and os.path.exists(p)]
                pruned = await svc.compare_and_remove_deleted(
                    user_id=user_id, present_paths=present
                )
                total_removed += pruned.get("removed", 0)
        return {"users": users_scanned, "removed": total_removed}

    try:
        result = asyncio.run(_run())
        logger.info("sync_indexed_file_sources: %s", result)
        return result
    except Exception as exc:
        logger.exception("sync_indexed_file_sources failed: %r", exc)
        return {"error": str(exc)}


@celery_app.task(name="app.tasks.sync_external_project")
def sync_external_project(*, connection_id: int) -> dict[str, Any]:
    """Audit task d2146781 AC 6 — sync one external-project connection.

    Calls OversightService.fetch_project_data(connection_id) to pull the latest
    data and stamp last_sync_at. (The AC names oversight_tasks.py; this repo
    keeps Celery tasks in the single app/tasks.py module.) Best-effort: errors
    are logged, never retried — the next schedule re-runs.
    """
    import asyncio

    async def _run() -> dict[str, Any]:
        from app.database import SessionLocal
        from app.services.oversight_service import OversightService

        async with SessionLocal() as db:
            return await OversightService(db).fetch_project_data(connection_id)

    try:
        result = asyncio.run(_run())
        logger.info("sync_external_project(%s): %s", connection_id, result)
        return result
    except Exception as exc:
        logger.exception("sync_external_project failed: %r", exc)
        return {"error": str(exc)}
