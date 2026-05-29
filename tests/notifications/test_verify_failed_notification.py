"""verify_failed → Telegram fan-out + event registry + rate-limit (task 92fa5ea15e2b)."""
from __future__ import annotations

import pytest

from app.services import notification_service as ns


def test_event_registry_has_verify_failed_with_telegram():
    reg = ns.EVENT_REGISTRY["verify_failed"]
    assert reg["priority"] == "high"
    assert "telegram" in reg["channels"]


def test_register_event_adds_to_registry():
    ns.register_event("custom_alert", title="x", channels=["in_app", "telegram"])
    assert ns.EVENT_REGISTRY["custom_alert"]["channels"] == ["in_app", "telegram"]


@pytest.mark.asyncio
async def test_telegram_notification_on_verify_failed(db_session, monkeypatch):
    """The AC-named node: a verify_failed event fans out to Telegram AND
    persists a notification row."""
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)

    notif = await ns.notify_event("verify_failed", user_id=5, db=db_session)
    assert notif is not None  # persisted
    assert sent and "تأیید" in sent[0]  # telegram fan-out fired with the FA title


@pytest.mark.asyncio
async def test_silent_event_does_not_telegram(db_session, monkeypatch):
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    await ns.notify_event("verify_failed", user_id=6, db=db_session, silent=True)
    assert sent == []  # silent suppresses the fan-out


def test_event_rate_limit_caps_floods(monkeypatch):
    monkeypatch.setattr(ns, "EVENT_RATE_LIMIT_MAX", 3)
    monkeypatch.setattr(ns, "EVENT_RATE_LIMIT_WINDOW_S", 60.0)
    ns._EVENT_RATE.clear()
    uid, ev = 999, "verify_failed"
    assert [ns._event_rate_limited(uid, ev) for _ in range(3)] == [False, False, False]
    assert ns._event_rate_limited(uid, ev) is True  # 4th within window is capped


@pytest.mark.asyncio
async def test_webhook_bad_signature_notifies_owner(api_client, monkeypatch):
    """A forged webhook (bad HMAC) returns 401 AND records a verify_failed."""
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    monkeypatch.setenv("WEBHOOK_SECRET", "test-secret")
    ns._EVENT_RATE.clear()

    r = api_client.post(
        "/webhook", content=b'{"x":1}', headers={"X-Webhook-Signature": "deadbeef"}
    )
    assert r.status_code == 401
    # best-effort fan-out fired (telegram channel on verify_failed)
    assert sent  # owner was alerted to the forged request
