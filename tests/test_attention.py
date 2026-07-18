"""موتور توجه (attention engine) — rules, cooldown dedup, brief decision.

Covers the contract the background loop and the «مراقبت و مرور» page rely
on: each v1 rule fires from REAL columns, alerts dedup on per-rule
cooldowns, the morning-brief decision is a pure once-per-local-day gate,
and the settings blob round-trips.
"""
import asyncio
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import text as _sql_text

from app.services.attention_service import (
    DEFAULT_SETTINGS,
    brief_decision,
    parse_string_date,
)


def _run_sql(statement):
    from app.database import get_db
    from app.main import app as _app

    override = _app.dependency_overrides[get_db]

    async def _go():
        agen = override()
        session = await agen.__anext__()
        try:
            await session.execute(_sql_text(statement))
            await session.commit()
        finally:
            await agen.aclose()

    asyncio.run(_go())


def _scan(client):
    r = client.get("/api/attention/scan")
    assert r.status_code == 200, r.text
    return r.json()


# --- date parsing -----------------------------------------------------------


def test_parse_string_date_formats():
    assert parse_string_date("14 Aug 2027") == date(2027, 8, 14)
    assert parse_string_date("June 25, 2026") == date(2026, 6, 25)
    assert parse_string_date("2026-07-18") == date(2026, 7, 18)
    assert parse_string_date("نامعلوم") is None
    assert parse_string_date(None) is None
    assert parse_string_date("") is None


# --- rules ------------------------------------------------------------------


def test_task_rules_overdue_and_today(api_client):
    today = date.today()
    api_client.post("/api/tasks/", json={"title": "دیرشده", "due_date": (today - timedelta(days=2)).isoformat()})
    api_client.post("/api/tasks/", json={"title": "امروزی", "due_date": today.isoformat()})
    api_client.post("/api/tasks/", json={"title": "آینده", "due_date": (today + timedelta(days=3)).isoformat()})
    data = _scan(api_client)
    rules = {(f["rule"], f["label"]) for f in data["findings"]}
    assert ("task_overdue", "دیرشده") in rules
    assert ("task_due_today", "امروزی") in rules
    assert all(f["label"] != "آینده" for f in data["findings"])


def test_document_license_subscription_and_inbox_rules(api_client):
    today = date.today()
    soon = today + timedelta(days=10)
    far = today + timedelta(days=200)
    # UAE licence (real Date column) — one expiring soon, one far out.
    _run_sql(
        "INSERT INTO uae_driving_licenses (user_id, license_no, name_en, expiry_date) "
        f"VALUES (0, 'L-1', 'SOON LICENSE', '{soon.isoformat()}')"
    )
    _run_sql(
        "INSERT INTO uae_driving_licenses (user_id, license_no, name_en, expiry_date) "
        f"VALUES (0, 'L-2', 'FAR LICENSE', '{far.isoformat()}')"
    )
    # Identity document — as-shown string date + one unparseable (skipped).
    _run_sql(
        "INSERT INTO identity_documents (user_id, full_name, expiry_date) "
        f"VALUES (0, 'DOC SOON', '{soon.strftime('%d %b %Y')}')"
    )
    _run_sql(
        "INSERT INTO identity_documents (user_id, full_name, expiry_date) "
        "VALUES (0, 'DOC BROKEN', 'نامعلوم')"
    )
    # Subscription — "June 25, 2026"-style string, inside the 14-day horizon.
    _run_sql(
        "INSERT INTO subscription_accounts (user_id, provider, next_payment_date, is_inferred_identity) "
        f"VALUES (0, 'netflix.com', '{(today + timedelta(days=5)).strftime('%B %d, %Y')}', 0)"
    )
    # Stale inbox capture (older than the 48h threshold).
    r = api_client.post("/api/inbox", json={"content": "یادداشت مانده"})
    assert r.status_code == 201
    old = (datetime.now(timezone.utc) - timedelta(hours=72)).strftime("%Y-%m-%d %H:%M:%S")
    _run_sql(f"UPDATE inbox_items SET created_at = '{old}' WHERE id = {r.json()['item']['id']}")

    rules = {}
    for f in _scan(api_client)["findings"]:
        rules.setdefault(f["rule"], []).append(f["label"])
    assert rules.get("license_expiry") == ["SOON LICENSE"]
    assert rules.get("document_expiry") == ["DOC SOON"]  # broken date skipped, far ones absent
    assert rules.get("subscription_renewal") == ["netflix.com"]
    assert any("1 مورد" in label for label in rules.get("inbox_stale", []))


def test_todo_overdue_rule(api_client):
    r = api_client.post("/api/todo-items", json={"content": "آیتم دیرشده"})
    assert r.status_code == 201
    _run_sql(
        f"UPDATE todo_items SET due_date = '{(date.today() - timedelta(days=1)).isoformat()}' "
        f"WHERE id = {r.json()['id']}"
    )
    findings = _scan(api_client)["findings"]
    assert any(f["rule"] == "todo_overdue" and f["label"] == "آیتم دیرشده" for f in findings)


# --- sending + cooldown dedup ----------------------------------------------


def test_run_sends_once_then_respects_cooldown(api_client):
    api_client.post(
        "/api/tasks/", json={"title": "دیرشده", "due_date": (date.today() - timedelta(days=1)).isoformat()}
    )
    r = api_client.post("/api/attention/run")
    assert r.status_code == 200
    assert r.json()["sent_rules"] == ["task_overdue"]
    assert r.json()["fresh_count"] == 1
    # Second run inside the 24h cooldown → nothing fresh, nothing sent.
    r = api_client.post("/api/attention/run")
    assert r.json()["sent_rules"] == [] and r.json()["fresh_count"] == 0
    # A NEW overdue task is fresh even while the first is cooling down.
    api_client.post(
        "/api/tasks/", json={"title": "دیرشدهٔ دوم", "due_date": (date.today() - timedelta(days=1)).isoformat()}
    )
    r = api_client.post("/api/attention/run")
    assert r.json()["fresh_count"] == 1
    # The alert landed as an unread in-app notification.
    unread = api_client.get("/api/command-center/today").json()["notifications"]["unread_count"]
    assert unread >= 2


# --- morning brief ----------------------------------------------------------


def test_brief_decision_is_once_per_local_day():
    cfg = dict(DEFAULT_SETTINGS, brief_hour=7, tz_offset_minutes=240, last_brief_date=None)
    # 03:30 UTC = 07:30 local (UTC+4) → due
    now = datetime(2026, 7, 18, 3, 30, tzinfo=timezone.utc)
    assert brief_decision(cfg, now) is True
    # before the local hour → not due
    assert brief_decision(cfg, datetime(2026, 7, 18, 1, 0, tzinfo=timezone.utc)) is False
    # already sent today (local date) → not due
    cfg["last_brief_date"] = "2026-07-18"
    assert brief_decision(cfg, now) is False
    # next local day → due again
    assert brief_decision(cfg, datetime(2026, 7, 19, 3, 30, tzinfo=timezone.utc)) is True
    # disabled → never
    cfg["last_brief_date"] = None
    cfg["brief_enabled"] = False
    assert brief_decision(cfg, now) is False


def test_morning_brief_endpoint_writes_notification_and_stamps_date(api_client):
    api_client.post("/api/tasks/", json={"title": "کار امروز", "due_date": date.today().isoformat()})
    r = api_client.post("/api/attention/morning-brief")
    assert r.status_code == 200, r.text
    assert r.json()["sent"] is True
    assert "کار امروز" in r.json()["text"]
    cfg = api_client.get("/api/attention/settings").json()["settings"]
    assert cfg["last_brief_date"] is not None
    unread = api_client.get("/api/command-center/today").json()["notifications"]["unread_count"]
    assert unread >= 1


# --- settings ---------------------------------------------------------------


def test_settings_roundtrip_ignores_unknown_keys(api_client):
    cfg = api_client.get("/api/attention/settings").json()["settings"]
    assert cfg["brief_hour"] == DEFAULT_SETTINGS["brief_hour"]
    r = api_client.put(
        "/api/attention/settings",
        json={"brief_hour": 6, "expiry_days": 45, "hacker_field": "x"},
    )
    assert r.status_code == 200
    saved = r.json()["settings"]
    assert saved["brief_hour"] == 6 and saved["expiry_days"] == 45
    assert "hacker_field" not in saved
    # persisted
    again = api_client.get("/api/attention/settings").json()["settings"]
    assert again["brief_hour"] == 6


def test_settings_put_rejects_bad_types_and_internal_stamps(api_client):
    # A cleared number input ('') must not persist — int('') would kill the loop.
    r = api_client.put("/api/attention/settings", json={"brief_hour": "", "expiry_days": "45"})
    assert r.status_code == 200
    saved = r.json()["settings"]
    assert saved["brief_hour"] == DEFAULT_SETTINGS["brief_hour"]  # rejected
    assert saved["expiry_days"] == 45  # numeric string coerced
    # The engine's own stamps are not writable from the settings surface —
    # echoing a stale last_brief_date back would re-arm today's sent brief.
    api_client.post("/api/attention/morning-brief")
    stamped = api_client.get("/api/attention/settings").json()["settings"]["last_brief_date"]
    assert stamped is not None
    r = api_client.put(
        "/api/attention/settings", json={"last_brief_date": "2000-01-01", "last_scan_at": "x"}
    )
    assert r.json()["settings"]["last_brief_date"] == stamped


def test_morning_brief_scheduled_path_respects_event_prefs(api_client):
    """Turning «پیام صبحگاهی» off in notification prefs must silence the
    SCHEDULED path (the catalog advertises the toggle); the explicit
    force button still works."""
    from app.services import notification_prefs as prefs

    original = prefs.get_prefs()
    try:
        merged = {**original, "events": {**original.get("events", {}), "morning_brief": False}}
        prefs.set_cache(merged)

        import asyncio as _asyncio

        from app.database import get_db
        from app.main import app as _app
        from app.services.attention_service import send_morning_brief, update_settings

        override = _app.dependency_overrides[get_db]

        async def _go():
            agen = override()
            session = await agen.__anext__()
            try:
                # Make the schedule "due" so only the prefs gate can stop it.
                await update_settings(session, {"brief_hour": 0, "last_brief_date": None})
                return await send_morning_brief(session)
            finally:
                await agen.aclose()

        result = _asyncio.run(_go())
        assert result == {"sent": False, "reason": "disabled_by_prefs"}
    finally:
        prefs.set_cache(original)
    # Explicit force path (the UI button) still sends.
    assert api_client.post("/api/attention/morning-brief").json()["sent"] is True
