"""«یادآورهای برنامه» (گره‌گشا): the page decides what is due; the server delivers once,
on the chosen channels, at the local hour, with an HONEST per-channel result."""
from datetime import datetime, timezone

import pytest


@pytest.fixture(autouse=True)
def _all_channels_on():
    """Notification settings with every channel on (the owner can switch them in «تنظیمات › اعلان‌ها»)."""
    from app.services import notification_prefs as np

    old = np._cache
    p = np._default_prefs(); p["channels"]["email"]["enabled"] = True
    np.set_cache(p)
    yield
    np.set_cache(old)



@pytest.fixture(autouse=True)
def _owner_is_admin(monkeypatch):
    """AI/Drive/attachments/reminders are owner-only once ADMIN_EMAILS is set (audit 2026-10-13); the test
    owner accounts are the admins here, strangers are not."""
    from app.config import settings
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "owner-la@example.com,rem@example.com,owner@example.com")

def _signin(api_client):
    r = api_client.post("/auth/register", json={"email": "rem@example.com", "password": "hunter2-long", "username": "rem"})
    api_client.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})


def test_send_time_is_the_local_hour_in_the_given_zone():
    from app.services.app_reminder_service import send_time_utc

    assert send_time_utc("2026-10-13", 9, "Asia/Dubai") == datetime(2026, 10, 13, 5, 0, tzinfo=timezone.utc)
    assert send_time_utc("2026-10-13", 9, "Asia/Tehran") == datetime(2026, 10, 13, 5, 30, tzinfo=timezone.utc)
    assert send_time_utc("2026-10-13", 9, "Not/AZone") == datetime(2026, 10, 13, 5, 0, tzinfo=timezone.utc)


@pytest.mark.asyncio
async def test_delivery_once_honest_results_cap_and_retry(db_session):
    from app.models.app_reminder import AppReminder
    from app.services import app_reminder_service as svc
    from sqlalchemy import select

    items = [{"key": f"knot:k{i}", "due_date": "2026-10-13", "hour": 9, "tz": "Asia/Dubai", "title": "گره‌گشا",
              "body": "یک ورزشِ گره موعد است", "link": f"?tab=kpractice&a=k{i}", "channels": {"telegram": True, "email": True}}
             for i in range(5)]
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=items)
    sent = []

    async def tg(text):
        sent.append(("tg", text)); return "sent"

    async def mail(subj, text):
        return "skipped_unconfigured"

    early = datetime(2026, 10, 13, 4, 59, tzinfo=timezone.utc)
    assert (await svc.deliver_due(db_session, now=early, senders=(tg, mail)))["due"] == 0, "not before the local hour"
    at = datetime(2026, 10, 13, 5, 1, tzinfo=timezone.utc)
    res = await svc.deliver_due(db_session, now=at, senders=(tg, mail))
    assert res["sent"] == 3 and res["deferred"] == 2, "daily cap 3, rest tomorrow"
    assert "?tab=kpractice&a=k0" in sent[0][1] and "یک ورزشِ گره موعد است" in sent[0][1]
    rows = {r.rkey: r for r in (await db_session.execute(select(AppReminder))).scalars().all()}
    assert rows["knot:k0"].status == "sent" and '"email": "skipped_unconfigured"' in rows["knot:k0"].result
    assert rows["knot:k4"].send_at.replace(tzinfo=timezone.utc) == datetime(2026, 10, 14, 5, 0, tzinfo=timezone.utc)
    # nothing is sent twice
    assert (await svc.deliver_due(db_session, now=at, senders=(tg, mail)))["due"] == 0

    # only unconfigured channels ⇒ «unconfigured», never «sent»
    async def tg_off(text):
        return "skipped_unconfigured"
    await svc.upsert(db_session, user_id=2, app="learning-architecture", items=[dict(items[0], key="x")])
    r = await svc.deliver_due(db_session, now=at, senders=(tg_off, mail))
    assert r["unconfigured"] == 1

    # failure ⇒ retry with backoff, then failed after 5 attempts
    async def tg_fail(text):
        return "failed"
    await svc.upsert(db_session, user_id=3, app="learning-architecture", items=[dict(items[0], key="y", channels=["telegram"])])
    now = at
    for _ in range(5):
        await svc.deliver_due(db_session, now=now, senders=(tg_fail, mail))
        row = (await db_session.execute(select(AppReminder).where(AppReminder.rkey == "y"))).scalar_one()
        now = row.send_at.replace(tzinfo=timezone.utc) + __import__("datetime").timedelta(seconds=1) if row.status == "retry" else now
    assert row.status == "failed" and row.attempts == 5


def test_api_upsert_cancel_and_channel_status(api_client):
    base = "/api/app-records/learning-architecture/reminders"
    assert api_client.get(base).status_code == 401
    _signin(api_client)
    body = {"key": "knot:k1", "due_date": "2026-10-20", "hour": 9, "tz": "Asia/Dubai", "title": "t", "body": "b", "link": "?tab=kpractice"}
    assert api_client.post(base, json=body).json()["saved"] == 1
    assert api_client.post(base, json=dict(body, due_date="20-10-2026")).status_code == 422
    st = api_client.get(base).json()
    assert st["items"][0]["status"] == "pending" and set(st["channels"]) >= {"telegram", "email"}
    assert api_client.delete(base + "/knot:k1").json()["cancelled"] is True
    assert api_client.get(base).json()["items"][0]["status"] == "cancelled"


def test_reminder_job_is_registered():
    from app.services.jobs_engine import JOBS

    assert {k: fn() for k, _t, fn, _b in JOBS}["app_reminders"] == 15.0


@pytest.mark.asyncio
async def test_audit_window_partial_retry_and_cap_after_reupsert(db_session):
    from datetime import timedelta

    from app.models.app_reminder import AppReminder
    from app.services import app_reminder_service as svc
    from sqlalchemy import select

    base = {"title": "گره‌گشا", "body": "یک ورزشِ گره موعد است", "link": "?tab=kpractice", "hour": 9, "tz": "Asia/Tehran"}
    calls = []

    async def tg(text):
        calls.append("tg"); return "sent"

    async def mail_fail(subj, text):
        calls.append("mail"); return "failed"

    # (I7) upserted late at night for «today 9:00» ⇒ NOT sent at 23:30 local; waits for tomorrow 9:00
    late = datetime(2026, 10, 13, 20, 0, tzinfo=timezone.utc)  # 23:30 Tehran
    await svc.upsert(db_session, user_id=7, app="a", items=[dict(base, key="w", due_date="2026-10-13", channels=["telegram"])])
    r = await svc.deliver_due(db_session, now=late, senders=(tg, mail_fail))
    assert r["deferred"] == 1 and calls == []
    row = (await db_session.execute(select(AppReminder).where(AppReminder.rkey == "w"))).scalar_one()
    assert row.send_at.replace(tzinfo=timezone.utc) == datetime(2026, 10, 14, 5, 30, tzinfo=timezone.utc)
    await svc.cancel(db_session, user_id=7, app="a", key="w")

    # (I8) partial: Telegram sent, email failed ⇒ retry ONLY e-mail, never re-send Telegram
    t = datetime(2026, 10, 14, 5, 31, tzinfo=timezone.utc)
    await svc.upsert(db_session, user_id=8, app="a", items=[dict(base, key="p", due_date="2026-10-14")])
    await svc.deliver_due(db_session, now=t, senders=(tg, mail_fail))
    row = (await db_session.execute(select(AppReminder).where(AppReminder.rkey == "p"))).scalar_one()
    assert row.status == "retry" and calls.count("tg") == 1
    calls.clear()
    await svc.deliver_due(db_session, now=row.send_at.replace(tzinfo=timezone.utc) + timedelta(seconds=1), senders=(tg, mail_fail))
    assert calls == ["mail"], "only the failed channel is retried"

    # (I9) cap counts real deliveries: 3 sent, then one re-upserted + one new ⇒ no 4th message today
    calls.clear()
    for i in range(3):
        await svc.upsert(db_session, user_id=9, app="a", items=[dict(base, key=f"c{i}", due_date="2026-10-14", channels=["telegram"])])
    await svc.deliver_due(db_session, now=t, senders=(tg, mail_fail))
    assert calls.count("tg") == 3
    await svc.upsert(db_session, user_id=9, app="a", items=[dict(base, key="c0", due_date="2026-10-14", hour=10, channels=["telegram"]),
                                                          dict(base, key="c9", due_date="2026-10-14", channels=["telegram"])])
    r = await svc.deliver_due(db_session, now=t + timedelta(hours=2), senders=(tg, mail_fail))
    assert calls.count("tg") == 3 and r["deferred"] == 2


@pytest.mark.asyncio
async def test_connected_gmail_error_is_a_failure_not_unconfigured(db_session, monkeypatch):
    from app.services import app_reminder_service as svc
    from app.services.google_sync import gmail_service

    monkeypatch.setenv("NOTIFICATION_EMAIL_TO", "owner@example.com")
    monkeypatch.delenv("SMTP_HOST", raising=False)

    async def boom(db, to, subj, body, **kw):
        return {"ok": False, "error": "http_500"}

    monkeypatch.setattr(gmail_service, "send_email_gmail", boom)
    assert await svc._send_email(db_session, "s", "t") == "failed"

    async def nc(db, to, subj, body, **kw):
        return {"ok": False, "error": "not_connected"}

    monkeypatch.setattr(gmail_service, "send_email_gmail", nc)
    assert await svc._send_email(db_session, "s", "t") == "skipped_unconfigured"



@pytest.mark.asyncio
async def test_notification_settings_rule_event_and_channels(db_session):
    from app.models.app_reminder import AppReminder
    from app.services import app_reminder_service as svc
    from app.services import notification_prefs as np
    from sqlalchemy import select

    async def tg(text):
        return "sent"

    async def mail(subj, text):
        return "sent"

    at = datetime(2026, 10, 13, 5, 1, tzinfo=timezone.utc)
    p = np._default_prefs(); p["events"]["knot_practice"] = False; np.set_cache(p)
    await svc.upsert(db_session, user_id=1, app="a", items=[{"key": "m", "due_date": "2026-10-13", "tz": "Asia/Dubai"}])
    await svc.deliver_due(db_session, now=at, senders=(tg, mail))
    assert (await db_session.execute(select(AppReminder).where(AppReminder.rkey == "m"))).scalar_one().status == "muted"
    p = np._default_prefs(); np.set_cache(p)  # defaults: e-mail channel off in the settings
    await svc.upsert(db_session, user_id=1, app="a", items=[{"key": "n", "due_date": "2026-10-13", "tz": "Asia/Dubai"}])
    await svc.deliver_due(db_session, now=at, senders=(tg, mail))
    r = (await db_session.execute(select(AppReminder).where(AppReminder.rkey == "n"))).scalar_one()
    assert r.status == "sent" and '"email": "off_in_settings"' in r.result


def test_event_is_listed_in_the_notification_settings():
    from app.services.notification_prefs import EVENT_CATALOG

    assert any(e["key"] == "knot_practice" and "telegram" in e["channels"] and "email" in e["channels"] for e in EVENT_CATALOG)


@pytest.mark.asyncio
async def test_bell_copy_goes_to_the_in_app_notifications(db_session, monkeypatch):
    from app.models.app_reminder import AppReminder
    from app.services import app_reminder_service as svc
    from sqlalchemy import select

    async def tg(text):
        return "skipped_unconfigured"

    async def mail(db, subj, text):
        return "skipped_unconfigured"

    monkeypatch.setattr(svc, "_send_telegram", tg)
    monkeypatch.setattr(svc, "_send_email", mail)
    await svc.upsert(db_session, user_id=1, app="a", items=[{"key": "b", "due_date": "2026-10-13", "tz": "Asia/Dubai",
                                                             "title": "ورزشِ گره‌گشا", "body": "یک ورزشِ گره موعد است"}])
    await svc.deliver_due(db_session, now=datetime(2026, 10, 13, 5, 1, tzinfo=timezone.utc))
    r = (await db_session.execute(select(AppReminder).where(AppReminder.rkey == "b"))).scalar_one()
    assert '"in_app": "sent"' in r.result and r.status == "sent"


@pytest.mark.asyncio
async def test_per_channel_detail_telegram_only_email_neutral(db_session):
    """Owner 2026-10-13: details can be on for Telegram and off for e-mail (or the reverse); the
    old shape (plain ``detail`` text, no ``detail_channels``) still means «every channel»."""
    from app.services import app_reminder_service as svc

    base = {"due_date": "2026-10-13", "hour": 9, "tz": "Asia/Dubai", "title": "گره‌گشا", "body": "یک ورزشِ گره موعد است",
            "link": "?tab=kpractice&a=k", "channels": {"telegram": True, "email": True}, "detail": "گره: «کفِ دست»"}
    await svc.upsert(db_session, user_id=41, app="learning-architecture", items=[dict(base, key="a", detail_channels=["telegram"])])
    await svc.upsert(db_session, user_id=42, app="learning-architecture", items=[dict(base, key="b", detail_channels=["email"])])
    await svc.upsert(db_session, user_id=43, app="learning-architecture", items=[dict(base, key="c")])  # old shape
    await svc.upsert(db_session, user_id=44, app="learning-architecture", items=[dict(base, key="d", detail_channels=[])])
    got = {}

    async def tg(text):
        got.setdefault("tg", []).append(text); return "sent"

    async def mail(subj, text):
        got.setdefault("mail", []).append(text); return "sent"

    await svc.deliver_due(db_session, now=datetime(2026, 10, 13, 5, 1, tzinfo=timezone.utc), senders=(tg, mail))
    has = lambda xs: [("کفِ دست" in t) for t in xs]
    # order follows send_at (equal) then insertion: a, b, c, d
    assert sorted(has(got["tg"])) == [False, False, True, True] and sorted(has(got["mail"])) == [False, False, True, True]
    rows = {r.rkey: r for r in (await db_session.execute(__import__("sqlalchemy").select(svc.AppReminder))).scalars().all()}
    assert "کفِ دست" in svc._text(rows["a"], "telegram") and "کفِ دست" not in svc._text(rows["a"], "email")
    assert "کفِ دست" not in svc._text(rows["b"], "telegram") and "کفِ دست" in svc._text(rows["b"], "email")
    assert "کفِ دست" in svc._text(rows["c"], "telegram") and "کفِ دست" in svc._text(rows["c"], "email")
    assert rows["d"].detail is None and "یک ورزشِ گره موعد است" in svc._text(rows["d"], "email")
    assert svc._detail_for(rows["a"], "in_app") == "گره: «کفِ دست»"
    # a broken stored value fails closed (neutral), never half-leaks
    rows["a"].detail = '{"text": "x", "chan'
    assert svc._detail_for(rows["a"], "telegram") == ""
