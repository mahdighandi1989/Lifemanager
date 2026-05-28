"""Synthetic trigger for verify_failed (audit task 92fa5ea15e2b AC 4).

A failed login (wrong password) must fire ``notify_event("verify_failed", ...)``
which persists a Notification row with ``type='verify_failed'``,
``priority='high'``, ``silent=False`` — the shape a Telegram bridge
or any other transport later picks up.
"""
from __future__ import annotations

import pytest
from sqlalchemy import select

from app.models.notification import Notification
from app.schemas.auth import UserCreate, UserLogin
from app.services import auth_service


@pytest.mark.asyncio
async def test_failed_login_persists_verify_failed_notification(db_session):
    """Trigger: register a user, then attempt login with the wrong
    password. Assert that a row exists in `notifications` carrying
    type='verify_failed', priority='high', silent=False."""
    await auth_service.register(
        db_session,
        UserCreate(
            email="trigger@example.com",
            password="hunter2-long",
            username="trigger",
        ),
    )

    with pytest.raises(ValueError, match="Invalid email or password"):
        await auth_service.login(
            db_session,
            UserLogin(email="trigger@example.com", password="not-the-pw"),
        )

    # NotificationService coerces unknown event-type strings onto the
    # legacy NotificationType enum and stores the original string in
    # ``channel`` (which notify_event overrides to "event"). So we
    # identify the row by its high-priority + Persian template message
    # signature instead.
    from app.services.notification_service import VERIFY_FAILED_MESSAGE_FA

    result = await db_session.execute(
        select(Notification).where(Notification.priority == "high")
    )
    rows = list(result.scalars().all())
    assert len(rows) == 1
    notif = rows[0]
    assert notif.silent is False
    assert notif.message == VERIFY_FAILED_MESSAGE_FA


@pytest.mark.asyncio
async def test_unknown_email_login_also_logs_verify_failed(db_session):
    """An attacker probing for valid emails (wrong email + any password)
    must produce the same notification — otherwise the surface lets
    them enumerate accounts via the notification log."""
    with pytest.raises(ValueError):
        await auth_service.login(
            db_session,
            UserLogin(email="nobody@example.com", password="anything-long"),
        )

    result = await db_session.execute(
        select(Notification).where(Notification.priority == "high")
    )
    rows = list(result.scalars().all())
    assert len(rows) == 1
    assert rows[0].priority == "high"
    assert rows[0].silent is False


def test_verify_failed_in_valid_notification_types():
    from app.services.notification_service import VALID_NOTIFICATION_TYPES

    assert "verify_failed" in VALID_NOTIFICATION_TYPES


def test_verify_failed_template_constants_exist():
    """AC 6-7: the event_type is snake_case (`verify_failed`) and
    registered in the event template tables."""
    from app.services.notification_service import (
        VERIFY_FAILED_MESSAGE_FA,
        VERIFY_FAILED_TITLE_FA,
        _DEFAULT_EVENT_MESSAGES,
        _DEFAULT_EVENT_TITLES,
    )

    assert "verify_failed" in _DEFAULT_EVENT_MESSAGES
    assert "verify_failed" in _DEFAULT_EVENT_TITLES
    assert _DEFAULT_EVENT_MESSAGES["verify_failed"] == VERIFY_FAILED_MESSAGE_FA
    assert _DEFAULT_EVENT_TITLES["verify_failed"] == VERIFY_FAILED_TITLE_FA
