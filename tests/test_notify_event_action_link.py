"""notify_event must accept an actionable link/caption for critical events.

Audit task 92fa5ea15e2b sub-task #2 required the notify_event signature
to carry a distinct title + action_link + action_text so a Telegram /
in-app reader can render a call-to-action button. The action data is
appended to the persisted message body so no schema change is needed.
"""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.services import notification_service as ns


class _StubService:
    """Replaces NotificationService inside the test so we can assert on
    the exact kwargs notify_event forwards without touching a DB."""

    instances: list["_StubService"] = []

    def __init__(self, db=None):
        self.db = db
        self.calls: list[dict] = []
        _StubService.instances.append(self)

    async def send_notification(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(id=1, **kwargs)


@pytest.fixture(autouse=True)
def _patch_service(monkeypatch):
    _StubService.instances.clear()
    monkeypatch.setattr(ns, "NotificationService", _StubService)
    yield


@pytest.mark.asyncio
async def test_notify_event_action_link_appended_to_message():
    await ns.notify_event(
        "verify_failed",
        user_id=42,
        action_link="https://example.com/verify",
        action_text="بررسی حساب",
    )
    assert len(_StubService.instances) == 1
    sent = _StubService.instances[0].calls[0]
    assert "https://example.com/verify" in sent["message"]
    assert "بررسی حساب" in sent["message"]


@pytest.mark.asyncio
async def test_notify_event_explicit_title_overrides_default():
    await ns.notify_event(
        "verify_failed",
        user_id=42,
        title="Override title",
    )
    sent = _StubService.instances[0].calls[0]
    assert sent["title"] == "Override title"


@pytest.mark.asyncio
async def test_notify_event_default_title_when_omitted():
    await ns.notify_event("verify_failed", user_id=42)
    sent = _StubService.instances[0].calls[0]
    assert sent["title"] == ns.VERIFY_FAILED_TITLE_FA


@pytest.mark.asyncio
async def test_notify_event_no_action_keeps_message_unchanged():
    """Backwards compat: callers that don't pass action_link must produce
    the same message as before."""
    await ns.notify_event("verify_failed", user_id=42)
    sent = _StubService.instances[0].calls[0]
    assert sent["message"] == ns.VERIFY_FAILED_MESSAGE_FA
