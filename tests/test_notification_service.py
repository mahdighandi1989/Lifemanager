"""Tests for NotificationService — public API, race-resolution, and batch.

The AC for the notification-system composite explicitly names two test
nodes:

  * tests/test_notification_service.py::test_concurrent_workers_no_duplicate
  * tests/test_notification_service.py::test_atomic_status_update

Both are module-level functions below, alongside the lighter unit tests
(under TestNotificationService) that patch the protected hooks instead of
touching the DB.
"""
import asyncio

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from unittest.mock import AsyncMock, MagicMock, patch

from app.database import Base
from app.models.notification import Notification, NotificationType
from app.services.notification_service import (
    NotificationService,
    notify_event,
    VALID_NOTIFICATION_TYPES,
)


# ── DB-bound fixture used by the race-condition / atomic-update tests ──

@pytest_asyncio.fixture
async def session_factory():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    yield factory
    await engine.dispose()


async def _seed_pending(session_factory, *, user_id: int = 1) -> int:
    async with session_factory() as db:
        row = Notification(
            user_id=user_id,
            type=NotificationType.SYSTEM,
            title="pending",
            message="x",
            status="pending",
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row.id


# ── Race-condition AC ───────────────────────────────────────────────


@pytest.mark.asyncio
async def test_concurrent_workers_no_duplicate(session_factory):
    """Two concurrent workers must never both claim the same notification.

    ``claim_pending_notification`` runs a single UPDATE … WHERE status='pending'
    statement, so exactly one of N racing callers observes rowcount==1.
    """
    notif_id = await _seed_pending(session_factory)

    async def worker():
        async with session_factory() as db:
            svc = NotificationService(db)
            return await svc.claim_pending_notification(notif_id)

    # Fan out N workers; only one should come back with the row.
    results = await asyncio.gather(*[worker() for _ in range(5)])
    wins = [r for r in results if r is not None]
    assert len(wins) == 1, (
        f"expected exactly one worker to claim the notification, got {len(wins)}: {wins}"
    )
    assert wins[0].status == "processing"


@pytest.mark.asyncio
async def test_atomic_status_update(session_factory):
    """_update_notification_status flips state in one SQL statement."""
    notif_id = await _seed_pending(session_factory)

    async with session_factory() as db:
        svc = NotificationService(db)
        updated = await svc._update_notification_status(
            notif_id, user_id=1, status="sent"
        )
    assert updated is not None
    assert updated.status == "sent"

    # Trying to update with the wrong user_id is a no-op.
    async with session_factory() as db:
        svc = NotificationService(db)
        miss = await svc._update_notification_status(
            notif_id, user_id=9999, status="failed"
        )
    assert miss is None


# ── Batch processing + retry AC ─────────────────────────────────────


@pytest.mark.asyncio
async def test_send_batch_notifications_retries_then_succeeds():
    """A flaky sender succeeds on the 3rd attempt."""
    svc = NotificationService()
    calls = {"n": 0}

    async def flaky(*, user_id, message, **kwargs):
        calls["n"] += 1
        if calls["n"] < 3:
            raise RuntimeError("transient")
        return {"id": user_id, "ok": True}

    result = await svc.send_batch_notifications(
        [{"user_id": 1, "message": "hi"}],
        max_attempts=3,
        backoff_seconds=0,
        sender=flaky,
    )
    assert calls["n"] == 3
    assert len(result["sent"]) == 1
    assert result["failed"] == []


@pytest.mark.asyncio
async def test_send_batch_notifications_gives_up_after_max_attempts():
    svc = NotificationService()

    async def always_fail(*, user_id, message, **kwargs):
        raise RuntimeError("nope")

    result = await svc.send_batch_notifications(
        [{"user_id": 1, "message": "a"}, {"user_id": 2, "message": "b"}],
        max_attempts=2,
        backoff_seconds=0,
        sender=always_fail,
    )
    assert result["sent"] == []
    assert len(result["failed"]) == 2
    assert result["attempts"] == 4  # 2 items × 2 attempts


@pytest.mark.asyncio
async def test_get_delivery_status_aggregates_counts(session_factory):
    async with session_factory() as db:
        db.add_all([
            Notification(user_id=1, type=NotificationType.SYSTEM, title="s1", status="sent"),
            Notification(user_id=1, type=NotificationType.SYSTEM, title="s2", status="sent"),
            Notification(user_id=1, type=NotificationType.SYSTEM, title="f1", status="failed"),
            Notification(user_id=1, type=NotificationType.SYSTEM, title="p1", status="pending"),
        ])
        await db.commit()

    async with session_factory() as db:
        svc = NotificationService(db)
        counts = await svc.get_delivery_status(user_id=1)
    assert counts["sent"] == 2
    assert counts["failed"] == 1
    assert counts["pending"] == 1
    assert counts["total"] == 4


# ── notify_event: verify_failed AC ──────────────────────────────────


@pytest.mark.asyncio
async def test_notify_event_verify_failed_writes_record(session_factory):
    async with session_factory() as db:
        record = await notify_event(
            "verify_failed",
            user_id=42,
            db=db,
            priority="high",
            silent=False,
        )
    assert record is not None
    # Persian default message template covers verify_failed.
    assert "تأیید" in (record.message or "")
    assert record.priority == "high"
    assert record.silent is False


@pytest.mark.asyncio
async def test_notify_event_swallows_errors(session_factory, monkeypatch):
    """A DB failure inside notify_event must not raise — the caller
    (e.g. auth_service.login) must never have its 401 swallowed."""
    async def boom(self, **kwargs):
        raise RuntimeError("db down")

    monkeypatch.setattr(NotificationService, "send_notification", boom)
    async with session_factory() as db:
        result = await notify_event("verify_failed", user_id=1, db=db)
    assert result is None  # swallowed, returned None


def test_valid_notification_types_include_verify_failed():
    assert "verify_failed" in VALID_NOTIFICATION_TYPES


# ── Existing patch-style unit tests (kept; now passing because db is optional) ──


@pytest.fixture
def notification_service():
    return NotificationService()


class TestNotificationService:
    """Lighter unit tests that patch the protected hooks."""

    def test_service_initialization(self, notification_service):
        assert notification_service is not None
        assert hasattr(notification_service, "send_notification")
        assert hasattr(notification_service, "get_user_notifications")
        assert hasattr(notification_service, "mark_as_read")

    @pytest.mark.asyncio
    async def test_send_notification_success(self, notification_service):
        with patch.object(notification_service, "_save_notification", new_callable=AsyncMock) as mock_save:
            mock_notification = MagicMock()
            mock_notification.id = 1
            mock_notification.user_id = 123
            mock_notification.message = "Test notification"
            mock_save.return_value = mock_notification

            result = await notification_service.send_notification(
                user_id=123,
                message="Test notification",
                notification_type="info",
            )
            assert result is not None
            assert result.user_id == 123
            assert result.message == "Test notification"

    @pytest.mark.asyncio
    async def test_send_notification_with_email(self, notification_service):
        with patch.object(notification_service, "_save_notification", new_callable=AsyncMock) as mock_save:
            mock_save.return_value = MagicMock()
            with patch.object(notification_service, "_send_email", new_callable=AsyncMock) as mock_email:
                mock_email.return_value = True
                result = await notification_service.send_notification(
                    user_id=123,
                    message="Email notification",
                    notification_type="email",
                    email="user@example.com",
                )
                assert result is not None
                mock_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_notifications(self, notification_service):
        with patch.object(notification_service, "_get_notifications_for_user", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = [MagicMock() for _ in range(3)]
            result = await notification_service.get_user_notifications(user_id=123)
            assert len(result) == 3

    @pytest.mark.asyncio
    async def test_get_user_notifications_empty(self, notification_service):
        with patch.object(notification_service, "_get_notifications_for_user", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = []
            result = await notification_service.get_user_notifications(user_id=999)
            assert len(result) == 0

    @pytest.mark.asyncio
    async def test_mark_as_read(self, notification_service):
        with patch.object(notification_service, "_update_notification_status", new_callable=AsyncMock) as mock_update:
            mock_update.return_value = True
            result = await notification_service.mark_as_read(notification_id=1, user_id=123)
            assert result is True

    @pytest.mark.asyncio
    async def test_mark_as_read_not_found(self, notification_service):
        with patch.object(notification_service, "_update_notification_status", new_callable=AsyncMock) as mock_update:
            mock_update.return_value = False
            result = await notification_service.mark_as_read(notification_id=999, user_id=123)
            assert result is False

    @pytest.mark.asyncio
    async def test_send_notification_invalid_type(self, notification_service):
        with pytest.raises(ValueError, match="Invalid notification type"):
            await notification_service.send_notification(
                user_id=123,
                message="Test",
                notification_type="invalid_type",
            )


# ── /api/notifications/status route ─────────────────────────────────


def test_api_notifications_status_endpoint_returns_counts(api_client):
    r = api_client.get("/api/notifications/status")
    assert r.status_code == 200, r.text
    body = r.json()
    for field in ("status", "sent", "failed", "pending", "total"):
        assert field in body, f"missing {field}"
    assert body["status"] == "ok"
