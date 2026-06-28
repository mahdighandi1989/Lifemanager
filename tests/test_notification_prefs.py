"""Notification preferences — defaults, persistence roundtrip, predicates, and
the notify_event gating they drive. Plus the /api/notifications/preferences and
/api/notifications/test routes.

The prefs cache is a process-global; an autouse fixture resets it before AND
after every test so neither these tests nor the pre-existing verify_failed
fan-out tests see a polluted cache.
"""
from __future__ import annotations

import pytest

from app.services import notification_prefs as np
from app.services import notification_service as ns



@pytest.fixture(autouse=True)
def _reset_prefs_cache():
    np.set_cache(None)
    yield
    np.set_cache(None)


# ── defaults + predicates (cache cold) ───────────────────────────────────────
def test_defaults_are_behaviour_preserving():
    d = np._default_prefs()
    # every catalogued event enabled by default (the "always send" prior behaviour)
    assert all(d["events"].values())
    assert d["channels"]["telegram"]["enabled"] is True
    assert d["channels"]["email"]["enabled"] is False
    assert d["min_priority"] == "low"


def test_predicates_fall_back_to_defaults_when_cache_cold():
    assert np.get_prefs() == np._default_prefs()  # cold cache → defaults
    assert np.event_enabled("verify_failed") is True
    assert np.event_enabled("totally_unknown_event") is True  # unknown → enabled
    assert np.channel_enabled("in_app") is True
    assert np.channel_enabled("telegram") is True
    assert np.channel_enabled("email") is False
    assert np.priority_allowed("low") is True


def test_priority_gate():
    np.set_cache(np._merge(np._default_prefs(), {"min_priority": "high"}))
    assert np.priority_allowed("low") is False
    assert np.priority_allowed("normal") is False
    assert np.priority_allowed("high") is True
    assert np.priority_allowed("critical") is True


# ── persistence roundtrip ────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_save_and_load_roundtrip(db_session):
    await np.save_prefs(db_session, {"events": {"task_done": False}, "min_priority": "high"})
    # cache reflects immediately
    assert np.event_enabled("task_done") is False
    assert np.get_prefs()["min_priority"] == "high"
    # reload from the DB into a cold cache → same values
    np.set_cache(None)
    loaded = await np.load_prefs(db_session)
    assert loaded["events"]["task_done"] is False
    assert loaded["min_priority"] == "high"
    # untouched events keep their default
    assert loaded["events"]["verify_failed"] is True


@pytest.mark.asyncio
async def test_status_payload_shape():
    payload = np.status_payload()
    assert "prefs" in payload and "events" in payload and "channels" in payload
    assert any(e["key"] == "verify_failed" for e in payload["events"])
    assert {c["key"] for c in payload["channels"]} >= {"in_app", "telegram", "email"}


# ── notify_event gating ──────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_disabled_event_sends_nothing(db_session, monkeypatch):
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    np.set_cache(np._merge(np._default_prefs(), {"events": {"verify_failed": False}}))

    result = await ns.notify_event("verify_failed", user_id=1, db=db_session)
    assert result is None        # not persisted
    assert sent == []            # not fanned out


@pytest.mark.asyncio
async def test_min_priority_drops_low_events(db_session, monkeypatch):
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    np.set_cache(np._merge(np._default_prefs(), {"min_priority": "critical"}))

    result = await ns.notify_event("budget_alert", user_id=1, db=db_session, priority="high")
    assert result is None
    assert sent == []


@pytest.mark.asyncio
async def test_sound_off_makes_silent_no_telegram(db_session, monkeypatch):
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    # verify_failed enabled but sound off → silent → no telegram fan-out, row still persists
    np.set_cache(np._merge(np._default_prefs(), {"sound": {"verify_failed": False}}))

    result = await ns.notify_event("verify_failed", user_id=1, db=db_session)
    assert result is not None     # bell row still written
    assert sent == []             # but no telegram (silent)


@pytest.mark.asyncio
async def test_telegram_channel_disabled_blocks_fanout(db_session, monkeypatch):
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    np.set_cache(np._merge(np._default_prefs(), {"channels": {"telegram": {"enabled": False}}}))

    result = await ns.notify_event("verify_failed", user_id=1, db=db_session)
    assert result is not None     # persisted + loud
    assert sent == []             # telegram channel off → no fan-out


@pytest.mark.asyncio
async def test_defaults_still_fan_out_to_telegram(db_session, monkeypatch):
    """Behaviour-preserving: with default prefs, verify_failed still fires telegram."""
    sent: list[str] = []
    monkeypatch.setattr(ns, "send_telegram", lambda *, body, chat_id=None: sent.append(body) or True)
    # cache cold → defaults
    result = await ns.notify_event("verify_failed", user_id=1, db=db_session)
    assert result is not None
    assert sent and "تأیید" in sent[0]


# ── routes ───────────────────────────────────────────────────────────────────
def test_get_preferences_route(api_client):
    r = api_client.get("/api/notifications/preferences")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert "prefs" in body and "events" in body and "channels" in body


def test_put_preferences_route(api_client):
    r = api_client.put("/api/notifications/preferences", json={"events": {"task_done": False}})
    assert r.status_code == 200
    assert r.json()["prefs"]["events"]["task_done"] is False


def test_put_preferences_rejects_bad_priority(api_client):
    r = api_client.put("/api/notifications/preferences", json={"min_priority": "ultra"})
    assert r.status_code == 400


def test_test_route_in_app_creates_row(api_client):
    r = api_client.post("/api/notifications/test", json={"channel": "in_app"})
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["channel"] == "in_app"


def test_test_route_telegram_unconfigured(api_client, monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    monkeypatch.delenv("TELEGRAM_CHAT_ID", raising=False)
    r = api_client.post("/api/notifications/test", json={"channel": "telegram"})
    assert r.status_code == 200
    assert r.json()["ok"] is False
