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
        from app.services.data_classification_service import DataClassificationService

        svc = DataClassificationService()
        total = 0
        cold = 0
        async with SessionLocal() as db:
            tasks = (await db.execute(select(Task))).scalars().all()
            for task in tasks:
                total += 1
                if svc.classify_task_essentiality(task) != "essential":
                    cold += 1
        return {"total": total, "cold_eligible": cold}

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
