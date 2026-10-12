"""«یادآورهای برنامه» (گره‌گشا): the page decides what is due; the server delivers once,
on the chosen channels, at the local hour, with an HONEST per-channel result."""
from datetime import datetime, timezone

import pytest


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
