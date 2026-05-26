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
