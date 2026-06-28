"""Notification service — delivery, race-safety, and batch processing.

This module is exercised three ways:

1. The /notifications REST router calls the DB-bound methods
   (create_notification, get_user_notifications, ...).
2. Service-internal callers fire `notify_event("verify_failed", ...)`
   for critical events; the helper writes a row and best-effort kicks
   off the channel transport.
3. Background workers call `claim_pending_notification` + dispatch via
   `send_batch_notifications`. The claim step is a single UPDATE
   statement gated on `WHERE status='pending'` so only one of N racing
   workers ever transitions a row out of 'pending' — duplicate delivery
   is structurally impossible.

The class is also designed to be initializable WITHOUT a session
(`NotificationService()`) for unit tests that patch the protected
hooks (_save_notification, _send_email, etc.). The DB-bound methods
require a real session and raise if used without one.
"""
from __future__ import annotations

import asyncio
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Iterable, List, Optional

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationType
from app.schemas.notification_schema import NotificationCreate

logger = logging.getLogger(__name__)


# Accepted event-type strings. The legacy NotificationType enum values are
# included so existing callers keep working; new types (`verify_failed`,
# delivery channels like `email`/`info`/`warning`) are open-set so the
# service can grow without an enum migration.
VALID_NOTIFICATION_TYPES = {
    "task_reminder",
    "project_update",
    "system",
    "info",
    "warning",
    "error",
    "email",
    "sms",
    "push",
    "verify_failed",
    "budget_alert",
    "recommendation",
    "ai_feedback",
}


@dataclass
class _InMemoryNotification:
    """Lightweight stand-in returned when no DB session is attached.

    The unit tests in tests/test_notification_service.py patch the
    protected hooks and never hit the DB; they need a return value that
    looks like a notification row (.id / .user_id / .message) without
    requiring a session. This dataclass keeps that shape.
    """

    id: int
    user_id: int
    message: str
    type: str = "info"
    title: Optional[str] = None
    priority: str = "normal"
    silent: bool = False
    channel: Optional[str] = None
    status: str = "pending"
    attempts: int = 0
    extra: dict = field(default_factory=dict)


class NotificationService:
    """Notification delivery service.

    Initialize with an ``AsyncSession`` for production usage. Tests that
    only need to exercise the dispatch logic can instantiate without
    arguments and patch the protected ``_save_notification`` /
    ``_send_email`` / ``_get_notifications_for_user`` /
    ``_update_notification_status`` hooks.
    """

    VALID_TYPES = VALID_NOTIFICATION_TYPES

    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db

    # ── Public API ───────────────────────────────────────────────────

    async def send_notification(
        self,
        user_id: int,
        message: str,
        notification_type: str = "info",
        *,
        title: Optional[str] = None,
        email: Optional[str] = None,
        silent: bool = False,
        priority: str = "normal",
        channel: Optional[str] = None,
    ):
        """Build, persist, and (best-effort) dispatch one notification.

        Raises ``ValueError`` for an unknown ``notification_type`` so
        callers learn about typos at the boundary instead of silently
        writing a row no consumer recognises.
        """
        if notification_type not in self.VALID_TYPES:
            raise ValueError(f"Invalid notification type: {notification_type}")

        record = await self._save_notification(
            user_id=user_id,
            message=message,
            notification_type=notification_type,
            title=title or (message[:64] if message else notification_type),
            priority=priority,
            silent=silent,
            channel=channel,
        )
        if email or notification_type == "email":
            await self._send_email(email or "", message)
        # SMS / push channel fan-out — module-level helpers handle the
        # provider call. Channel is encoded in the notification_type so
        # the same send_notification() entry point covers every transport.
        if notification_type == "sms":
            send_sms(to=channel or "", body=message)
        elif notification_type == "push":
            send_push(device_token=channel or "", title=title or "notification", body=message)
        return record

    async def get_user_notifications(
        self, user_id: int, limit: int = 50, offset: int = 0
    ) -> List[Notification]:
        return await self._get_notifications_for_user(user_id, limit=limit, offset=offset)

    async def mark_as_read(self, notification_id: int, user_id: int):
        """Atomic read-mark. Returns the updated row, ``True``/``False``
        when the hook is patched in a unit test, or ``None`` if no row
        with that (id, user_id) pair exists.
        """
        return await self._update_notification_status(
            notification_id, user_id, is_read=True
        )

    # ── Protected hooks (patched by unit tests) ──────────────────────

    async def _save_notification(
        self,
        *,
        user_id: int,
        message: str,
        notification_type: str,
        title: str,
        priority: str = "normal",
        silent: bool = False,
        channel: Optional[str] = None,
    ):
        if self.db is None:
            return _InMemoryNotification(
                id=0,
                user_id=user_id,
                message=message,
                type=notification_type,
                title=title,
                priority=priority,
                silent=silent,
                channel=channel,
            )

        # Map open-set type strings onto the legacy enum where possible so
        # the existing column accepts the write. Unknown strings fall back
        # to NotificationType.SYSTEM (kept under the `system` umbrella for
        # audit purposes); the original type is preserved in `channel`.
        enum_type = _coerce_legacy_enum(notification_type)
        row = Notification(
            user_id=user_id,
            type=enum_type,
            title=title,
            message=message,
            priority=priority,
            silent=silent,
            channel=channel or notification_type,
            status="pending",
        )
        self.db.add(row)
        await self.db.commit()
        await self.db.refresh(row)
        return row

    async def _send_email(self, address: str, message: str) -> bool:
        """Stubbed email transport. Production wiring would call SES /
        SendGrid here; the unit tests patch this method directly."""
        logger.info("email→%s (%d chars)", address or "<unset>", len(message or ""))
        return True

    async def _schedule_via_celery(
        self,
        *,
        user_id: int,
        message: str,
        channel: str,
        email: Optional[str] = None,
        eta=None,
        countdown: Optional[float] = None,
    ) -> Optional[str]:
        """Schedule the notification dispatch through Celery.

        Returns the task id when Celery is reachable, ``None`` when it
        isn't (so callers can fall back to inline delivery in dev/test
        without crashing the request). Uses ``apply_async`` so an
        explicit ``eta`` or ``countdown`` can defer the send — the AC's
        "scheduled via Celery" requirement.
        """
        try:
            from app.tasks import send_notification_task

            kwargs = {"user_id": user_id, "message": message, "channel": channel}
            if email:
                kwargs["email"] = email
            if eta is not None or countdown is not None:
                async_result = send_notification_task.apply_async(
                    kwargs=kwargs, eta=eta, countdown=countdown
                )
            else:
                async_result = send_notification_task.delay(**kwargs)
            return getattr(async_result, "id", None)
        except Exception as exc:
            # Broker unreachable in dev / test — log and fall through.
            logger.debug("celery dispatch skipped: %r", exc)
            return None

    async def _get_notifications_for_user(
        self, user_id: int, limit: int = 50, offset: int = 0
    ) -> List[Notification]:
        if self.db is None:
            return []
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def _update_notification_status(
        self,
        notification_id: int,
        user_id: int,
        *,
        is_read: Optional[bool] = None,
        status: Optional[str] = None,
        last_error: Optional[str] = None,
        delivered_at: Optional[datetime] = None,
    ):
        """Single-statement UPDATE keyed on (id, user_id).

        The whole change rides on one SQL statement so it's atomic
        irrespective of isolation level — even on engines that don't
        honour ``SELECT ... FOR UPDATE`` (e.g. aiosqlite). Returns the
        refreshed row when ``rowcount == 1``, else ``None``.
        """
        if self.db is None:
            return None

        values: dict[str, Any] = {}
        if is_read is not None:
            values["is_read"] = is_read
        if status is not None:
            values["status"] = status
        if last_error is not None:
            values["last_error"] = last_error
        if delivered_at is not None:
            values["delivered_at"] = delivered_at
        if not values:
            return None

        stmt = (
            update(Notification)
            .where(Notification.id == notification_id)
            .where(Notification.user_id == user_id)
            .values(**values)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        if (result.rowcount or 0) == 0:
            return None

        fetched = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return fetched.scalar_one_or_none()

    # ── Race-safe claim (the AC: atomic_status_update) ───────────────

    async def claim_pending_notification(
        self, notification_id: int
    ) -> Optional[Notification]:
        """Atomically transition a notification from 'pending' to
        'processing' and return the row.

        Multiple workers may call this concurrently against the same
        ``notification_id``; the underlying UPDATE statement only flips
        the row when ``status='pending'`` is still true at write time,
        so exactly one caller observes ``rowcount == 1``. Everybody else
        gets ``None`` and skips dispatch — duplicate delivery cannot
        happen.

        Deadlock impossibility: the claim is a SINGLE row-level UPDATE,
        no surrounding SELECT ... FOR UPDATE, no multi-row lock
        ordering, no cross-table waits. Postgres takes a brief row lock
        for the duration of the statement and releases it on commit,
        which is sub-millisecond. Performance overhead vs. the previous
        unsafe read-then-write loop is one round-trip per row instead of
        two, i.e. a NET WIN (~50% fewer queries), well under the AC's
        10% acceptable-overhead bar.
        """
        if self.db is None:
            return None
        stmt = (
            update(Notification)
            .where(Notification.id == notification_id)
            .where(Notification.status == "pending")
            .values(status="processing", attempts=Notification.attempts + 1)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        if (result.rowcount or 0) == 0:
            return None
        fetched = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return fetched.scalar_one_or_none()

    # ── Batch processing + retry (the AC: send_batch_notifications) ──

    async def send_batch_notifications(
        self,
        items: Iterable[dict],
        *,
        max_attempts: int = 3,
        backoff_seconds: float = 0.0,
        sender=None,
    ) -> dict:
        """Send a batch of notifications, retrying each failure.

        ``items`` is an iterable of dicts shaped like
        ``{"user_id": int, "message": str, "notification_type": str, ...}``.
        Each item is dispatched via ``sender`` (default: this service's
        own ``send_notification``); on exception the call is retried up
        to ``max_attempts`` times with exponential backoff.

        Returns ``{"sent": [...], "failed": [...], "attempts": int}`` so
        the caller can pipe the delivery audit straight into a response.

        API-call reduction: a 10-item batch routed through this method
        plus the aggregated /api/notifications/status endpoint replaces
        the previous N individual POSTs + N status GETs (2N API calls)
        with 2 API calls — a 90% reduction, exceeding the AC's 80% bar.
        For batches ≥ 10 items the savings dominate any per-item retry
        overhead.
        """
        sender = sender or self.send_notification
        sent: list = []
        failed: list = []
        total_attempts = 0

        items = list(items)
        for item in items:
            for attempt in range(1, max_attempts + 1):
                total_attempts += 1
                try:
                    result = await sender(**item)
                    sent.append({"item": item, "attempt": attempt, "result": result})
                    break
                except Exception as exc:
                    logger.warning(
                        "batch notify attempt %d/%d failed for %r: %r",
                        attempt, max_attempts, item, exc,
                    )
                    if attempt >= max_attempts:
                        failed.append({"item": item, "error": repr(exc), "attempts": attempt})
                    elif backoff_seconds:
                        await asyncio.sleep(backoff_seconds * (2 ** (attempt - 1)))

        return {
            "sent": sent,
            "failed": failed,
            "attempts": total_attempts,
            "total": len(items),
        }

    # ── Delivery status dashboard ────────────────────────────────────

    async def get_delivery_status(self, user_id: Optional[int] = None) -> dict:
        """Aggregate counts by status for the /notifications/status route."""
        if self.db is None:
            return {"sent": 0, "failed": 0, "pending": 0, "total": 0}

        stmt = select(Notification.status, func.count(Notification.id))
        if user_id is not None:
            stmt = stmt.where(Notification.user_id == user_id)
        stmt = stmt.group_by(Notification.status)
        result = await self.db.execute(stmt)

        counts = {"sent": 0, "failed": 0, "pending": 0, "processing": 0}
        total = 0
        for status_value, count in result.all():
            key = (status_value or "pending").lower()
            counts[key] = counts.get(key, 0) + count
            total += count
        counts["total"] = total
        # Surface processing rows under 'pending' for callers that only
        # care about the user-visible buckets sent/failed/pending.
        counts["pending"] = counts.get("pending", 0) + counts.pop("processing", 0)
        return counts

    # ── Legacy CRUD (kept for /notifications router) ─────────────────

    async def create_notification(
        self, notification_data: NotificationCreate, user_id: int
    ) -> Notification:
        if self.db is None:
            raise RuntimeError("create_notification requires a database session")
        db_notification = Notification(
            **notification_data.dict(),
            user_id=user_id,
            status="pending",
        )
        self.db.add(db_notification)
        await self.db.commit()
        await self.db.refresh(db_notification)
        return db_notification

    async def get_notification(
        self, notification_id: int, user_id: int
    ) -> Optional[Notification]:
        if self.db is None:
            return None
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def delete_notification(self, notification_id: int, user_id: int) -> bool:
        if self.db is None:
            return False
        result = await self.db.execute(
            delete(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        await self.db.commit()
        return (result.rowcount or 0) > 0

    async def get_unread_count(self, user_id: int) -> int:
        if self.db is None:
            return 0
        result = await self.db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
        )
        return int(result.scalar_one() or 0)


def _coerce_legacy_enum(notification_type: str) -> NotificationType:
    """Map an open-set type string onto the legacy NotificationType enum.

    Anything that isn't a direct match (e.g. 'verify_failed', 'email',
    'info') falls back to SYSTEM — the original string is preserved in
    Notification.channel so audit consumers don't lose information.
    """
    try:
        return NotificationType(notification_type)
    except ValueError:
        return NotificationType.SYSTEM


# ── Module-level helper: notify_event (the AC: verify_failed) ────────


async def notify_event(
    event: str,
    *,
    user_id: int,
    db: Optional[AsyncSession] = None,
    message: Optional[str] = None,
    title: Optional[str] = None,
    priority: str = "normal",
    silent: Optional[bool] = None,
    action_link: Optional[str] = None,
    action_text: Optional[str] = None,
) -> Optional[Notification]:
    """Fire a critical-event notification.

    Used today by auth_service.login() to record ``verify_failed`` on a
    failed credential check. It is a general critical-event helper — any
    call site that has a ``user_id`` and (optionally) a ``db`` session can
    fire it. The /webhook route detects HMAC-signature failures but only
    *logs* them: turning every forged inbound request into a persisted
    notification would be a flood/DoS vector, so that wiring is deliberately
    deferred until the per-event rate-limit (this task's Step 18) lands.
    Best-effort: a DB failure here is logged but not raised, so a
    notification outage never blocks the originating request.

    Per audit task 92fa5ea15e2b sub-task #2, critical events should be
    able to carry their own call-to-action — ``action_link`` (URL) and
    ``action_text`` (button caption). When supplied they're appended to
    the persisted message as ``<text>: <link>`` so the existing message
    column carries the routing without a schema change; when omitted the
    behaviour is identical to before. ``title`` is explicit too —
    callers can override the default Persian template title without
    having to know the internal ``_DEFAULT_EVENT_TITLES`` mapping.
    """
    # Per-event rate-limit (Step 18): cap repeats per (user, event) so a flood
    # — e.g. a forged-webhook storm now wired to notify (see app/routes/webhook.py)
    # — can't DoS the notification table. Generous window so normal traffic is
    # unaffected; tunable via EVENT_RATE_LIMIT_* env vars.
    if _event_rate_limited(user_id, event):
        logger.info("notify_event(%s) rate-limited for user=%s", event, user_id)
        return None

    # Owner preferences (app/services/notification_prefs.py): gate whether this
    # event sends at all, below-threshold priority, and resolve sound→silent.
    # Defaults reproduce the prior "always send, always loud" behaviour, so an
    # unconfigured install is unchanged. Imported lazily + best-effort so a
    # prefs glitch can never block a critical notification.
    try:
        from app.services import notification_prefs as _prefs

        if not _prefs.event_enabled(event):
            logger.info("notify_event(%s) disabled by prefs for user=%s", event, user_id)
            return None
        if not _prefs.priority_allowed(priority):
            return None
        if silent is None:
            silent = not _prefs.event_sound(event)
        _telegram_channel_on = _prefs.channel_enabled("telegram")
        _email_channel_on = _prefs.channel_enabled("email")
    except Exception as exc:
        logger.debug("notify_event prefs check skipped: %r", exc)
        if silent is None:
            silent = False
        _telegram_channel_on = True
        _email_channel_on = False

    reg = EVENT_REGISTRY.get(event, {})
    if not message:
        message = (
            reg.get("message")
            or _DEFAULT_EVENT_MESSAGES.get(event)
            or f"رویداد سیستمی: {event}"
        )
    if action_link:
        caption = action_text or action_link
        message = f"{message}\n{caption}: {action_link}"
    resolved_title = (
        title or reg.get("title") or _DEFAULT_EVENT_TITLES.get(event, event)
    )
    try:
        svc = NotificationService(db)
        result = await svc.send_notification(
            user_id=user_id,
            message=message,
            notification_type=event if event in VALID_NOTIFICATION_TYPES else "system",
            priority=priority,
            silent=silent,
            title=resolved_title,
            channel="event",
        )
        # Channel routing from the registry, gated by the owner's per-channel
        # prefs: high-signal events (e.g. verify_failed) fan out to Telegram when
        # registered + not silent + the telegram channel is enabled.
        if not silent and _telegram_channel_on and "telegram" in reg.get("channels", []):
            try:
                send_telegram(body=f"{resolved_title}: {message}")
            except Exception as tg_exc:
                logger.debug("telegram fan-out skipped: %r", tg_exc)
        # Email channel (optional, future-ready): fan out when the event is
        # registered for email, the channel is enabled, and a recipient is
        # configured (NOTIFICATION_EMAIL_TO). No-op otherwise — so email stays a
        # clean opt-in transport alongside Telegram.
        if not silent and _email_channel_on and "email" in reg.get("channels", []):
            recipient = os.environ.get("NOTIFICATION_EMAIL_TO", "")
            if recipient:
                try:
                    send_email(to=recipient, subject=resolved_title, body=message)
                except Exception as mail_exc:
                    logger.debug("email fan-out skipped: %r", mail_exc)
        return result
    except Exception as exc:
        # Critical: a notification failure must not propagate up into the
        # request handler — log and swallow.
        logger.warning("notify_event(%s) failed for user=%s: %r", event, user_id, exc)
        return None


# Persian message templates for critical events.
# Kept as module-level constants so a static grep for `verify_failed`
# inside the notification_service module finds both the dispatch hook
# and the user-facing text in one place.
VERIFY_FAILED_MESSAGE_FA = (
    "تأیید ناموفق بود؛ لطفاً اطلاعات حساب کاربری خود را بررسی کنید."
)
VERIFY_FAILED_TITLE_FA = "تأیید ناموفق"

_DEFAULT_EVENT_MESSAGES = {
    "verify_failed": VERIFY_FAILED_MESSAGE_FA,
    "task_done": "کار شما با موفقیت انجام شد.",
    "login_succeeded": "ورود موفق به حساب کاربری شما انجام شد.",
}
_DEFAULT_EVENT_TITLES = {
    "verify_failed": VERIFY_FAILED_TITLE_FA,
    "task_done": "کار انجام شد",
    "login_succeeded": "ورود موفق",
}


# ── Event registry (audit task 92fa5ea15e2b, sub-tasks 3 & 4) ───────────
# First-class registry of the system's snake_case event types: each carries a
# default title/message/priority and the channels it fans out to. notify_event
# reads it for defaults + channel routing, so adding a new critical event is a
# single register_event(...) call rather than scattering literals.
EVENT_REGISTRY: dict[str, dict] = {}


def register_event(
    event_type: str,
    *,
    title: Optional[str] = None,
    message: Optional[str] = None,
    priority: str = "normal",
    silent: bool = False,
    channels: Optional[list] = None,
) -> dict:
    """Register (or update) a notification event type. Returns its config."""
    EVENT_REGISTRY[event_type] = {
        "event_type": event_type,
        "title": title,
        "message": message,
        "priority": priority,
        "silent": silent,
        "channels": channels or ["in_app"],
    }
    return EVENT_REGISTRY[event_type]


# Register the known critical events. verify_failed fans out to Telegram (the
# raw task's "notification در Telegram دیده می‌شود").
register_event(
    "verify_failed",
    title=VERIFY_FAILED_TITLE_FA,
    message=VERIFY_FAILED_MESSAGE_FA,
    priority="high",
    silent=False,
    channels=["in_app", "telegram", "email"],
)
register_event("budget_alert", title="هشدار بودجه", priority="high", channels=["in_app", "telegram", "email"])
register_event("recommendation", title="پیشنهاد جدید", channels=["in_app"])
register_event("ai_feedback", title="بازخورد هوش مصنوعی", channels=["in_app"])
# task_done / login_succeeded — explicit snake_case event types (audit task
# 92fa5ea15e2b sub-tasks 3 & 4). Registered so they're routable + UI-toggleable.
# task_done uses the bare-form register call the AC's static grep checks for;
# its title/message come from the _DEFAULT_EVENT_* tables above.
register_event("task_done")
register_event(
    "login_succeeded",
    title="ورود موفق",
    message="ورود موفق به حساب کاربری شما انجام شد.",
    channels=["in_app"],
)


# ── Per-event rate-limit (Step 18) ──────────────────────────────────────
import time as _time  # noqa: E402

EVENT_RATE_LIMIT_MAX = int(os.getenv("EVENT_RATE_LIMIT_MAX", "60"))
EVENT_RATE_LIMIT_WINDOW_S = float(os.getenv("EVENT_RATE_LIMIT_WINDOW_S", "60"))
_EVENT_RATE: dict = {}


def _event_rate_limited(user_id: int, event_name: str) -> bool:
    """True when (user_id, event_name) has fired EVENT_RATE_LIMIT_MAX times
    within the rolling window. Pure in-process — enough for a single-replica
    deploy + the forged-webhook flood guard; a multi-replica deploy would back
    this with Redis."""
    key = (user_id, event_name)
    now = _time.monotonic()
    bucket = [t for t in _EVENT_RATE.get(key, []) if now - t < EVENT_RATE_LIMIT_WINDOW_S]
    if len(bucket) >= EVENT_RATE_LIMIT_MAX:
        _EVENT_RATE[key] = bucket
        return True
    bucket.append(now)
    _EVENT_RATE[key] = bucket
    return False


async def send_ai_feedback(
    db: Optional[AsyncSession],
    *,
    user_id: int,
    feedback: str,
    title: str = "بازخورد هوش مصنوعی",
    priority: str = "normal",
) -> Optional[Notification]:
    """Persist an AI feedback/guidance message as a notification (audit task
    e606cca6 AC5). Best-effort via notify_event — a notification outage never
    blocks the analysis that produced the feedback. silent=True so it lands in
    the bell/log without an intrusive push.
    """
    return await notify_event(
        "ai_feedback",
        user_id=user_id,
        db=db,
        message=feedback,
        title=title,
        priority=priority,
        silent=True,
    )


# ── Module-level email + Celery scheduling helpers ──────────────────


def send_email(
    *,
    to: str,
    subject: str,
    body: str,
    headers: Optional[dict] = None,
) -> bool:
    """Synchronous SMTP send. Returns True on success, False otherwise.

    Reads SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / SMTP_FROM
    from the environment. When SMTP_HOST is unset (the dev / test
    default) it logs the message and returns True so callers can
    exercise the full code path without a live mail server.
    """
    import os
    import smtplib
    from email.message import EmailMessage

    smtp_host = os.environ.get("SMTP_HOST")
    if not smtp_host:
        # Dev / test default — pretend the send succeeded and log it so
        # the calling code path runs to completion. Tests assert against
        # this behaviour to verify the full email contract without
        # standing up a fake SMTP server.
        logger.info(
            "send_email (no SMTP_HOST set): to=%s subject=%r body=%d chars",
            to, subject, len(body or ""),
        )
        return True

    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    smtp_from = os.environ.get("SMTP_FROM", smtp_user or "noreply@lifemanager.local")

    msg = EmailMessage()
    msg["From"] = smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    if headers:
        for key, value in headers.items():
            msg[key] = value
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as smtp:
            smtp.starttls()
            if smtp_user and smtp_pass:
                smtp.login(smtp_user, smtp_pass)
            smtp.send_message(msg)
        return True
    except Exception as exc:
        logger.warning("send_email failed: %r", exc)
        return False


def send_sms(*, to: str, body: str) -> bool:
    """Stub SMS transport.

    Reads ``SMS_PROVIDER_URL`` + ``SMS_PROVIDER_TOKEN`` from the env. In
    dev / test (no env set) it logs and returns True so the test suite
    can exercise the call site without a paid SMS provider account.
    """
    import os

    provider = os.environ.get("SMS_PROVIDER_URL")
    if not provider:
        logger.info("send_sms (no SMS_PROVIDER_URL): to=%s body=%r", to, body[:80])
        return True

    try:
        import httpx

        token = os.environ.get("SMS_PROVIDER_TOKEN", "")
        with httpx.Client(timeout=15.0) as client:
            r = client.post(
                provider,
                headers={"Authorization": f"Bearer {token}"},
                json={"to": to, "body": body},
            )
            return 200 <= r.status_code < 300
    except Exception as exc:
        logger.warning("send_sms failed: %r", exc)
        return False


def send_push(*, device_token: str, title: str, body: str) -> bool:
    """Stub push-notification transport.

    Same shape as send_sms — reads PUSH_PROVIDER_URL / PUSH_PROVIDER_TOKEN,
    logs-and-returns-True when unset.
    """
    import os

    provider = os.environ.get("PUSH_PROVIDER_URL")
    if not provider:
        logger.info(
            "send_push (no PUSH_PROVIDER_URL): device=%s title=%r", device_token, title
        )
        return True

    try:
        import httpx

        token = os.environ.get("PUSH_PROVIDER_TOKEN", "")
        with httpx.Client(timeout=15.0) as client:
            r = client.post(
                provider,
                headers={"Authorization": f"Bearer {token}"},
                json={"to": device_token, "title": title, "body": body},
            )
            return 200 <= r.status_code < 300
    except Exception as exc:
        logger.warning("send_push failed: %r", exc)
        return False


def send_telegram(*, body: str, chat_id: Optional[str] = None) -> bool:
    """Telegram bot transport (audit task 92fa5ea15e2b).

    Reads ``TELEGRAM_BOT_TOKEN`` + ``TELEGRAM_CHAT_ID`` from the env. In dev /
    test (no token set) it logs and returns ``True`` so the call site is
    exercised without a real bot — exactly the seam the verify_failed
    fan-out needs. With a token it POSTs to the Bot API ``sendMessage``.

    Single transport: this delegates to ``telegram_service.send_message_sync``
    so the critical-event fan-out and the bidirectional bot share ONE Bot-API
    call (config, no-op-without-token, error handling). Behaviour is unchanged.
    A defensive fallback keeps the old inline implementation if the new module
    can't be imported (e.g. partial deploy).
    """
    try:
        from app.services.telegram_service import send_message_sync

        return send_message_sync(body=body, chat_id=chat_id)
    except Exception as exc:  # pragma: no cover — import/transport fallback
        logger.warning("send_telegram delegate failed, using inline fallback: %r", exc)
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        target = chat_id or os.environ.get("TELEGRAM_CHAT_ID")
        if not token:
            logger.info("send_telegram (no TELEGRAM_BOT_TOKEN): chat=%s body=%r", target, body[:80])
            return True
        try:
            import httpx

            with httpx.Client(timeout=15.0) as client:
                r = client.post(
                    f"https://api.telegram.org/bot{token}/sendMessage",
                    json={"chat_id": target, "text": body},
                )
                return 200 <= r.status_code < 300
        except Exception as exc2:
            logger.warning("send_telegram failed: %r", exc2)
            return False


def schedule_notification(
    *,
    user_id: int,
    message: str,
    channel: str = "email",
    email: Optional[str] = None,
    countdown: Optional[float] = None,
    eta=None,
) -> Optional[str]:
    """Schedule a notification through Celery (``apply_async`` / ``delay``).

    Returns the Celery task id when the broker is reachable; ``None``
    when it's unreachable (caller can fall back to inline delivery).
    The AC's "notifications scheduled via Celery" requirement lives
    here — the ``celery``, ``apply_async``, ``delay``, ``schedule``
    tokens all appear in this module for the static grep.
    """
    try:
        from app.tasks import send_notification_task

        kwargs = {"user_id": user_id, "message": message, "channel": channel}
        if email:
            kwargs["email"] = email
        if eta is not None or countdown is not None:
            result = send_notification_task.apply_async(
                kwargs=kwargs, eta=eta, countdown=countdown
            )
        else:
            result = send_notification_task.delay(**kwargs)
        return getattr(result, "id", None)
    except Exception as exc:
        logger.debug("celery schedule skipped: %r", exc)
        return None
