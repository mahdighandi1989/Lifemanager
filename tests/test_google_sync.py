"""Tests for the Google personal-sync layer (جیمیل + تقویم + گزارش روز).

All network faked (injectable fetchers / monkeypatched access token).
"""
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select

from app.models.activity_log import ActivityLog
from app.models.personal_sync import PersonalEmail, PersonalEvent
from app.services.google_sync import (
    calendar_service,
    digest_service,
    engine as g_engine,
    gmail_service,
    triage_service,
)

pytestmark = pytest.mark.asyncio

NOW = datetime(2026, 7, 19, 10, 0, 0, tzinfo=timezone.utc)


async def _token(db):  # fake access-token resolver
    return "at-1"


def _gmail_fetcher(messages):
    async def fetch(method, url, headers, json_body=None):
        assert headers["Authorization"] == "Bearer at-1"
        if "/messages?" in url:
            return {"messages": [{"id": m["id"]} for m in messages]}
        for m in messages:
            if f"/messages/{m['id']}?" in url:
                return m
        if url.endswith("/messages/send"):
            return {"id": "sent-1"}
        raise AssertionError(f"unexpected url {url}")

    return fetch


def _msg(mid, subject, snippet="", unread=True, labels=None, ts=NOW):
    return {
        "id": mid,
        "threadId": f"t{mid}",
        "internalDate": str(int(ts.timestamp() * 1000)),
        "snippet": snippet,
        "labelIds": (labels or []) + (["UNREAD"] if unread else []),
        "payload": {
            "headers": [
                {"name": "From", "value": "Ali <ali@example.com>"},
                {"name": "Subject", "value": subject},
            ]
        },
    }


# ── gmail sync ───────────────────────────────────────────────────────────────
async def test_gmail_sync_upserts_and_dedups(db_session):
    messages = [_msg("m1", "سلام"), _msg("m2", "Invoice #22", unread=False)]
    fetch = _gmail_fetcher(messages)
    r1 = await gmail_service.sync_gmail(db_session, fetcher=fetch, access_token="at-1")
    assert r1 == {"ok": True, "fetched": 2, "new": 2}
    r2 = await gmail_service.sync_gmail(db_session, fetcher=fetch, access_token="at-1")
    assert r2["new"] == 0
    rows = (await db_session.execute(select(PersonalEmail))).scalars().all()
    assert len(rows) == 2
    m1 = next(r for r in rows if r.id == "m1")
    assert m1.subject == "سلام" and m1.is_unread is True and m1.from_addr.startswith("Ali")


async def test_gmail_sync_not_connected(db_session, monkeypatch):
    async def _none(db):
        return None

    monkeypatch.setattr(gmail_service, "get_access_token", _none)
    result = await gmail_service.sync_gmail(db_session)
    assert result["ok"] is False and result["error"] == "not_connected"


# ── triage ───────────────────────────────────────────────────────────────────
async def test_heuristic_triage_categories(db_session):
    otp = PersonalEmail(id="a", subject="Your verification code", is_unread=True)
    receipt = PersonalEmail(id="b", subject="Payment receipt", is_unread=True)
    action = PersonalEmail(id="c", subject="Action required: renew your visa", is_unread=True)
    other = PersonalEmail(id="d", subject="سلام دوست من", is_unread=False)
    assert triage_service.heuristic_triage(otp)["category"] == "otp"
    assert triage_service.heuristic_triage(receipt)["category"] == "receipt"
    act = triage_service.heuristic_triage(action)
    assert act["category"] == "action" and act["needs_action"] is True
    assert "رسیدگی" in act["suggested_task"]
    assert triage_service.heuristic_triage(other)["needs_action"] is False


async def test_analyze_new_emails_fallback_and_activity(db_session):
    db_session.add(
        PersonalEmail(
            id="m9", subject="Action required: reply please", is_unread=True, received_at=NOW
        )
    )
    db_session.add(PersonalEmail(id="m10", subject="weekly newsletter", received_at=NOW))
    await db_session.commit()

    result = await triage_service.analyze_new_emails(db_session, limit=10)
    assert result["analyzed"] == 2 and result["needs_action"] == 1

    m9 = await db_session.get(PersonalEmail, "m9")
    assert m9.needs_action is True and m9.ai_model is None and m9.analyzed_at is not None
    acts = (await db_session.execute(select(ActivityLog))).scalars().all()
    assert any(a.action == "email_triage" for a in acts)
    # second run: nothing left to analyze
    again = await triage_service.analyze_new_emails(db_session)
    assert again["analyzed"] == 0


# ── calendar sync ────────────────────────────────────────────────────────────
def _cal_fetcher(items):
    async def fetch(method, url, headers, json_body=None):
        assert "/calendars/primary/events" in url
        return {"items": items}

    return fetch


async def test_calendar_sync_upserts(db_session):
    items = [
        {
            "id": "ev1",
            "summary": "جلسه با علی",
            "start": {"dateTime": "2026-07-19T14:00:00+04:00"},
            "end": {"dateTime": "2026-07-19T15:00:00+04:00"},
            "status": "confirmed",
        },
        {
            "id": "ev2",
            "summary": "روز تولد",
            "start": {"date": "2026-07-20"},
            "end": {"date": "2026-07-21"},
            "status": "confirmed",
        },
    ]
    r1 = await calendar_service.sync_calendar(
        db_session, fetcher=_cal_fetcher(items), access_token="at-1", now=NOW
    )
    assert r1 == {"ok": True, "fetched": 2, "new": 2}
    rows = (await db_session.execute(select(PersonalEvent))).scalars().all()
    ev1 = next(r for r in rows if r.id == "ev1")
    ev2 = next(r for r in rows if r.id == "ev2")
    assert ev1.all_day is False and ev1.start_at.hour == 10  # 14:00+04:00 → 10:00 UTC
    assert ev2.all_day is True

    # cancelled upstream → kept with status
    items[0]["status"] = "cancelled"
    await calendar_service.sync_calendar(
        db_session, fetcher=_cal_fetcher(items), access_token="at-1", now=NOW
    )
    ev1 = await db_session.get(PersonalEvent, "ev1")
    assert ev1.status == "cancelled"


# ── attention rules ──────────────────────────────────────────────────────────
async def test_attention_rules_pick_up_google_items(db_session):
    from app.services.attention_service import scan_findings

    now = datetime.now(timezone.utc)
    db_session.add(
        PersonalEvent(id="soon", summary="قرار پزشک", start_at=now + timedelta(hours=3), status="confirmed")
    )
    db_session.add(
        PersonalEmail(
            id="need", subject="پاسخ بده لطفا", needs_action=True, received_at=now, is_unread=True
        )
    )
    await db_session.commit()

    findings = await scan_findings(db_session, user_id=0, now=now)
    rules = {f["rule"] for f in findings}
    assert "calendar_event_soon" in rules
    assert "email_needs_action" in rules
    cal = next(f for f in findings if f["rule"] == "calendar_event_soon")
    assert cal["label"] == "قرار پزشک"


# ── digest ───────────────────────────────────────────────────────────────────
async def test_compose_digest_sections(db_session):
    now = NOW
    db_session.add(
        PersonalEvent(id="e1", summary="جلسه", start_at=now + timedelta(hours=2), status="confirmed")
    )
    db_session.add(
        PersonalEmail(id="a1", subject="لطفا پاسخ بده", needs_action=True, received_at=now)
    )
    await db_session.commit()
    text = await digest_service.compose_digest(db_session, now=now, tz_offset_minutes=0)
    assert "گزارش روز" in text and "جلسه" in text and "لطفا پاسخ بده" in text


async def test_send_digest_uses_gmail_and_logs(db_session, monkeypatch):
    sent = {}

    async def fake_send(db, to, subject, body, fetcher=None, access_token=None):
        sent.update({"to": to, "subject": subject})
        return {"ok": True, "id": "x"}

    async def fake_email(db):
        return "me@example.com"

    from app.services import drive_settings_service as dss

    monkeypatch.setattr(gmail_service, "send_email_gmail", fake_send)
    monkeypatch.setattr(dss, "get_account_email", fake_email)
    monkeypatch.delenv("NOTIFICATION_EMAIL_TO", raising=False)

    result = await digest_service.send_digest(db_session, now=NOW, tz_offset_minutes=0)
    assert result["email"] == {"via": "gmail", "ok": True}
    assert sent["to"] == "me@example.com"
    acts = (await db_session.execute(select(ActivityLog))).scalars().all()
    assert any(a.action == "personal_digest" for a in acts)


# ── engine ───────────────────────────────────────────────────────────────────
async def test_digest_decision_matrix():
    base = {"digest_enabled": True, "tz_offset_minutes": 0, "digest_hour": 21, "last_digest_date": None}
    assert g_engine.digest_decision(base, NOW.replace(hour=10)) is False
    assert g_engine.digest_decision(base, NOW.replace(hour=22)) is True
    done = dict(base, last_digest_date="2026-07-19")
    assert g_engine.digest_decision(done, NOW.replace(hour=22)) is False


async def test_google_tick_stamps_and_env_not_baked(db_session, monkeypatch):
    monkeypatch.setenv("GMAIL_POLL_MINUTES", "45")

    async def ok(*a, **k):
        return {"ok": True}

    monkeypatch.setattr(gmail_service, "sync_gmail", ok)
    monkeypatch.setattr(triage_service, "analyze_new_emails", ok)
    monkeypatch.setattr(calendar_service, "sync_calendar", ok)

    r1 = await g_engine.google_sync_tick(db_session, now=NOW.replace(hour=10))
    assert set(r1["ran"]) >= {"gmail", "calendar"}
    r2 = await g_engine.google_sync_tick(db_session, now=NOW.replace(hour=10) + timedelta(seconds=30))
    assert r2["ran"] == []
    blob = await g_engine._load_blob(db_session)
    assert "gmail_poll_minutes" not in blob and "last_gmail_poll_at" in blob
    cfg = await g_engine.load_settings(db_session)
    assert cfg["gmail_poll_minutes"] == 45


# ── routes ───────────────────────────────────────────────────────────────────
@pytest.fixture
def fake_google(monkeypatch):
    messages = [
        _msg("r1", "Action required: sign the form", "please sign"),
        _msg("r2", "hello", "چطوری", unread=False),
    ]

    async def fake_token(db):
        return "at-1"

    monkeypatch.setattr(gmail_service, "get_access_token", fake_token)
    monkeypatch.setattr(calendar_service, "get_access_token", fake_token)
    monkeypatch.setattr(gmail_service, "_default_fetcher", _gmail_fetcher(messages))
    monkeypatch.setattr(
        calendar_service,
        "_default_fetcher",
        _cal_fetcher(
            [
                {
                    "id": "rev1",
                    "summary": "ورزش",
                    "start": {"dateTime": (datetime.now(timezone.utc) + timedelta(hours=5)).isoformat()},
                    "end": {"dateTime": (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat()},
                    "status": "confirmed",
                }
            ]
        ),
    )


async def test_google_routes_flow(api_client, fake_google):
    status = api_client.get("/api/google/status").json()
    assert status["ok"] is True and status["counts"]["emails"] == 0

    sync = api_client.post("/api/google/sync").json()
    assert sync["gmail"]["new"] == 2 and sync["calendar"]["new"] == 1
    assert sync["triage"]["analyzed"] == 2

    emails = api_client.get("/api/google/emails", params={"needs_action": True}).json()["emails"]
    assert len(emails) == 1 and emails[0]["id"] == "r1"

    events = api_client.get("/api/google/events").json()["events"]
    assert events and events[0]["summary"] == "ورزش"

    created = api_client.post(f"/api/google/emails/{emails[0]['id']}/create-task", json={})
    assert created.status_code == 201
    # the filed email leaves the action queue
    left = api_client.get("/api/google/emails", params={"needs_action": True}).json()["emails"]
    assert left == []

    ev_task = api_client.post("/api/google/events/rev1/create-task", json={})
    assert ev_task.status_code == 201 and "آمادگی" in ev_task.json()["title"]

    put = api_client.put("/api/google/settings", json={"digest_hour": 20, "digest_email_enabled": False})
    cfg = put.json()["settings"]
    assert cfg["digest_hour"] == 20 and cfg["digest_email_enabled"] is False

    missing = api_client.post("/api/google/emails/nope/create-task", json={})
    assert missing.status_code == 404
