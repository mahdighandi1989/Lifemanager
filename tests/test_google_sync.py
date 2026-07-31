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
    # subset check: the sync result grew a «routed» counter (calendar events
    # now go through the central dispatcher) — additive keys are allowed.
    assert {k: r1[k] for k in ("ok", "fetched", "new")} == {"ok": True, "fetched": 2, "new": 2}
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
    # subset check: the sync result grew a «routed» counter (calendar events
    # now go through the central dispatcher) — additive keys are allowed.
    assert {k: r1[k] for k in ("ok", "fetched", "new")} == {"ok": True, "fetched": 2, "new": 2}
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

    async def fake_send(db, to, subject, body, fetcher=None, access_token=None, html=None):
        sent.update({"to": to, "subject": subject, "html": html})
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
    # the email carries the rich HTML report with the action list
    assert sent["html"] and "تکلیف امروز" in sent["html"] and 'dir="rtl"' in sent["html"]
    acts = (await db_session.execute(select(ActivityLog))).scalars().all()
    assert any(a.action == "personal_digest" for a in acts)


# ── engine ───────────────────────────────────────────────────────────────────
async def test_digest_decision_matrix():
    base = {"digest_enabled": True, "tz_offset_minutes": 0, "digest_hour": 21, "last_digest_date": None}
    assert g_engine.digest_decision(base, NOW.replace(hour=10)) is False
    assert g_engine.digest_decision(base, NOW.replace(hour=22)) is True
    done = dict(base, last_digest_date="2026-07-19")
    assert g_engine.digest_decision(done, NOW.replace(hour=22)) is False


async def test_connection_decision_matrix():
    cd = g_engine.connection_decision
    # No token → never alert (not a drop; owner never linked / disconnected).
    assert cd(None, "not_connected", None, NOW)["alert"] is False
    # Working token, was fine → no alert, not a reconnection.
    assert cd("connected", "connected", None, NOW)["alert"] is False
    # Working token AFTER a disconnect → all-clear (reconnected).
    back = cd("disconnected", "connected", None, NOW)
    assert back["alert"] is False and back["reconnected"] is True
    # Revoked token on the connected→disconnected edge → ALERT once.
    edge = cd("connected", "token_revoked", None, NOW)
    assert edge["alert"] is True and edge["new_state"] == "disconnected"
    # Revoked with no prior state (first ever probe finds it dead) → alert.
    assert cd(None, "token_revoked", None, NOW)["alert"] is True
    # Still revoked, alerted 1h ago → stay quiet (durable cooldown).
    recent = (NOW - timedelta(hours=1)).isoformat()
    assert cd("disconnected", "token_revoked", recent, NOW)["alert"] is False
    # Still revoked, but last alert was >24h ago → re-alert.
    stale = (NOW - timedelta(hours=30)).isoformat()
    assert cd("disconnected", "token_revoked", stale, NOW)["alert"] is True


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


# ── error diagnosis (403 ≠ 403) ──────────────────────────────────────────────
class _FakeResp:
    def __init__(self, text):
        self.text = text


class _FakeHTTPError(Exception):
    def __init__(self, msg, body):
        super().__init__(msg)
        self.response = _FakeResp(body)


async def test_diagnose_google_error_reasons():
    diag = gmail_service.diagnose_google_error
    api_off = _FakeHTTPError(
        "Client error '403 Forbidden'",
        '{"error":{"status":"PERMISSION_DENIED","details":[{"reason":"SERVICE_DISABLED"}],'
        '"message":"Gmail API has not been used in project 123 or it is disabled"}}',
    )
    assert diag(api_off)["reason"] == "api_disabled"
    scope = _FakeHTTPError(
        "Client error '403 Forbidden'",
        '{"error":{"message":"Request had insufficient authentication scopes.",'
        '"status":"PERMISSION_DENIED","details":[{"reason":"ACCESS_TOKEN_SCOPE_INSUFFICIENT"}]}}',
    )
    assert diag(scope)["reason"] == "missing_scope"
    rejected = _FakeHTTPError("Client error '401 Unauthorized'", '{"error":"invalid_grant"}')
    assert diag(rejected)["reason"] == "token_rejected"
    other = RuntimeError("boom")
    assert diag(other)["reason"] == "error"


async def test_probe_reports_api_disabled(db_session, monkeypatch):
    async def fake_token(db):
        return "at-1"

    async def fetch_403(method, url, headers, json_body=None):
        raise _FakeHTTPError(
            "Client error '403 Forbidden' for url", "Gmail API has not been used in project"
        )

    monkeypatch.setattr(gmail_service, "get_access_token", fake_token)
    result = await gmail_service.probe(db_session, fetcher=fetch_403)
    assert result["ok"] is False and result["reason"] == "api_disabled"
    assert "Enable" in result["detail"] or "فعال" in result["detail"]


# ── rich digest (owner: «ایمیل ساده است، آمار و تکلیف ندارد») ────────────────
async def test_collect_digest_data_covers_app_sections(db_session):
    from app.models.task import Task, TaskStatus

    now = NOW
    db_session.add(PersonalEvent(id="ev", summary="جلسه", start_at=now + timedelta(hours=1), status="confirmed"))
    db_session.add(PersonalEmail(id="am", subject="پاسخ بده", needs_action=True, received_at=now, ai_category="action"))
    db_session.add(Task(title="کار باز", status=TaskStatus.TODO))
    await db_session.commit()

    data = await digest_service.collect_digest_data(db_session, now=now, tz_offset_minutes=0)
    assert data["date_local"] == "2026-07-19"
    assert len(data["events_today"]) == 1
    assert len(data["action_emails"]) == 1
    assert data["tasks"]["open"] == 1
    assert isinstance(data["attention"], dict)
    assert len(data["activity_7d"]) == 7


async def test_build_todo_list_prioritizes(db_session):
    data = {
        "attention": {"task_overdue": {"count": 2, "title": "⏰", "labels": ["الف", "ب"]}},
        "action_emails": [{"subject": "X", "summary": None, "suggested_task": None}],
        "dev": {"open_errors": 3},
        "inbox_pending": 1,
        "events_today": [],
    }
    todos = digest_service.build_todo_list_fa(data)
    texts = " | ".join(t["text"] for t in todos)
    assert "2 تسک عقب‌افتاده" in texts and "1 ایمیل" in texts and "3 خطای باز" in texts
    # empty state
    empty = digest_service.build_todo_list_fa({"attention": {}, "dev": {}})
    assert "مرتب" in empty[0]["text"]


async def test_render_digest_html_structure(db_session):
    from app.models.dev_sync import DevErrorIssue

    db_session.add(
        DevErrorIssue(
            service_id="srv-1", service_name="x", fingerprint="f1", title="Boom",
            first_seen_at=NOW, last_seen_at=NOW, status="open",
        )
    )
    await db_session.commit()
    data = await digest_service.collect_digest_data(db_session, now=NOW, tz_offset_minutes=0)
    html = digest_service.render_digest_html(data, advice="اول تسک‌ها.", base_url="https://app.example.com")
    for needle in ("گزارش روز", "تکلیف امروز", "تقویم", "ایمیل‌ها", "موتور توجه", "پروژه‌های توسعه", 'dir="rtl"'):
        assert needle in html
    assert "https://app.example.com" in html  # action link on the dev-errors todo
    assert "<script" not in html  # email-safe
