"""مرور هفتگی (weekly review) — stats gathering, fallback narrative, schedule.

Covers: generation stores a row with real week stats and a deterministic
fallback narrative when no model is configured (ai_model NULL —
provenance), the pure ``review_decision`` weekly gate, the list/latest
endpoints, and cross-user scoping.
"""
import asyncio
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import text as _sql_text

from app.services.weekly_review_service import DEFAULT_SETTINGS, review_decision


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


def test_run_generates_review_with_stats_and_fallback_narrative(api_client):
    # Give the week something to report: a completed task + inbox funnel.
    r = api_client.post("/api/tasks/", json={"title": "کار هفته"})
    assert r.status_code == 201
    api_client.put(f"/api/tasks/{r.json()['id']}", json={"status": "completed"})
    r = api_client.post("/api/inbox", json={"content": "باید کاری بکنم"})
    api_client.post(f"/api/inbox/{r.json()['item']['id']}/file")
    api_client.post("/api/inbox", json={"content": "فکری برای بعد"})

    r = api_client.post("/api/weekly-review/run")
    assert r.status_code == 200, r.text
    review = r.json()["review"]
    assert review["ai_model"] is None  # keyless deploy → deterministic summary
    assert "مرور هفته" in review["narrative"]
    stats = review["stats"]
    assert stats["tasks"]["created"] == 1
    assert stats["tasks"]["completed"] == 1
    assert stats["inbox"]["captured"] == 2
    assert stats["inbox"]["filed"] == 1
    assert stats["inbox"]["pending_now"] == 1
    assert stats["window"]["end"] == date.today().isoformat()


def test_list_and_latest_endpoints(api_client):
    assert api_client.get("/api/weekly-review").json()["reviews"] == []
    assert api_client.get("/api/weekly-review/latest").json()["review"] is None
    api_client.post("/api/weekly-review/run")
    api_client.post("/api/weekly-review/run")
    reviews = api_client.get("/api/weekly-review").json()["reviews"]
    assert len(reviews) == 2
    assert reviews[0]["id"] > reviews[1]["id"]  # newest first
    assert api_client.get("/api/weekly-review/latest").json()["review"]["id"] == reviews[0]["id"]


def test_review_decision_weekly_gate():
    # Friday (weekday=4) 17:00 local, UTC+4 → 13:00 UTC. 2026-07-17 is a Friday.
    cfg = dict(DEFAULT_SETTINGS, weekday=4, hour=17, tz_offset_minutes=240, last_run_at=None)
    friday_due = datetime(2026, 7, 17, 13, 30, tzinfo=timezone.utc)
    assert review_decision(cfg, friday_due) is True
    # before the hour → not due; wrong day → not due
    assert review_decision(cfg, datetime(2026, 7, 17, 10, 0, tzinfo=timezone.utc)) is False
    assert review_decision(cfg, datetime(2026, 7, 16, 13, 30, tzinfo=timezone.utc)) is False
    # ran this week → not due again the same slot
    cfg["last_run_at"] = friday_due.isoformat()
    assert review_decision(cfg, friday_due + timedelta(hours=2)) is False
    # next week's slot → due
    assert review_decision(cfg, friday_due + timedelta(days=7)) is True
    # disabled → never
    cfg["enabled"] = False
    assert review_decision(cfg, friday_due + timedelta(days=7)) is False


def test_settings_roundtrip(api_client):
    cfg = api_client.get("/api/weekly-review/settings").json()["settings"]
    assert cfg["weekday"] == DEFAULT_SETTINGS["weekday"]
    r = api_client.put("/api/weekly-review/settings", json={"weekday": 5, "hour": 20})
    assert r.status_code == 200
    saved = r.json()["settings"]
    assert saved["weekday"] == 5 and saved["hour"] == 20


def test_cross_user_reviews_hidden(api_client):
    api_client.post("/api/weekly-review/run")
    _run_sql("UPDATE weekly_reviews SET user_id = 42")
    assert api_client.get("/api/weekly-review").json()["reviews"] == []
    assert api_client.get("/api/weekly-review/latest").json()["review"] is None


def test_settings_put_ignores_last_run_at_and_bad_types(api_client):
    r = api_client.put(
        "/api/weekly-review/settings",
        json={"hour": "", "weekday": 5, "last_run_at": "2000-01-01T00:00:00+00:00"},
    )
    assert r.status_code == 200
    saved = r.json()["settings"]
    assert saved["hour"] == DEFAULT_SETTINGS["hour"]  # '' rejected
    assert saved["weekday"] == 5
    assert saved["last_run_at"] is None  # scheduler-owned stamp not writable here
