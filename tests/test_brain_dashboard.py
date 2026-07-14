"""رشد ذهن و هوش — parser, ownership check, reminder logic, routes.

A synthetic Brilliant-export zip is built in-test (the real export is personal
data and not committed); its numbers are exact so the parser output is pinned.
"""
from __future__ import annotations

import io
import json
import zipfile
from datetime import datetime, timezone

import pytest

from app.services import brain_service as bs


def _make_zip(email="owner@example.com", correct=3, wrong=1):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        def w(name, rows):
            z.writestr(f"data/production/{name}.json",
                       "\n".join(json.dumps(r) for r in rows))
        w("auth_user", [{"email": email, "first_name": "M", "last_name": "G",
                         "date_joined": "2024-11-17T10:00:00+00:00",
                         "last_login": "2026-07-14T10:00:00+00:00", "id": 1}])
        w("stats_userprobleminteraction", [
            {"action": 1, "ts": f"2026-0{m}-01T10:00:00+00:00"} for m in (5, 5, 6)
        ])
        probs = ([{"problem_num": i, "state": "correct", "viewed_solution": False}
                  for i in range(correct)] +
                 [{"problem_num": 99, "state": "incorrect", "viewed_solution": True}
                  for _ in range(wrong)])
        w("practice_practiceuserstate", [{
            "best_score": 80, "completed_ts": "2026-05-02T10:00:00+00:00",
            "problems_completed": len(probs), "problems_total": len(probs),
            "progress_data": {"problems": probs},
        }])
        w("courses_lessonuserstate", [
            {"completed_ts": "2026-05-01T00:00:00+00:00"}, {"completed_ts": None},
        ])
        w("courses_courseuserstate", [{"course_info_id": 50, "percent_complete": 40,
                                       "last_active_ts": "2026-05-01T00:00:00+00:00"}])
        w("profile_streakrecord", [{"start_date": "2026-05-01", "end_date": "2026-05-05"}])
    return buf.getvalue()


# ── parser ───────────────────────────────────────────────────────────────────
def test_is_brilliant_zip():
    assert bs.is_brilliant_zip(_make_zip()) is True
    other = io.BytesIO()
    with zipfile.ZipFile(other, "w") as z:
        z.writestr("hello.txt", "x")
    assert bs.is_brilliant_zip(other.getvalue()) is False
    assert bs.is_brilliant_zip(b"not a zip") is False


def test_parse_brilliant_zip_metrics():
    s = bs.parse_brilliant_zip(_make_zip(correct=3, wrong=1))
    assert s["account_email"] == "owner@example.com"
    assert s["problem_interactions"] == 3
    assert s["practice_problems_total"] == 4
    assert s["practice_problems_correct"] == 3
    assert s["accuracy_pct"] == 75.0
    assert s["viewed_solution_pct"] == 25.0
    assert s["lessons_started"] == 2 and s["lessons_completed"] == 1
    assert s["longest_streak_days"] == 5
    assert s["monthly"]["2026-05"]["interactions"] == 2
    assert s["monthly"]["2026-05"]["total"] == 4  # practice problems bucketed by month


def test_parse_rejects_non_brilliant():
    with pytest.raises(ValueError):
        bs.parse_brilliant_zip(b"junk")


# ── ingest + ownership ───────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ingest_verifies_owner_email(db_session, monkeypatch):
    monkeypatch.setenv("OWNER_EMAIL", "owner@example.com")
    r1 = await bs.ingest_upload(db_session, _make_zip(email="owner@example.com"),
                                filename="a.zip", via="dashboard")
    assert r1["verified_owner"] is True

    r2 = await bs.ingest_upload(db_session, _make_zip(email="someone@else.com"),
                                filename="b.zip", via="telegram")
    assert r2["verified_owner"] is False  # foreign data flagged, still stored


@pytest.mark.asyncio
async def test_ingest_clears_reminder_awaiting(db_session, monkeypatch):
    monkeypatch.setenv("OWNER_EMAIL", "owner@example.com")
    await bs.update_reminder_config(db_session, {
        "awaiting_since": "2026-07-14T10:00:00+00:00",
        "last_reminder_at": "2026-07-14T10:00:00+00:00",
    })
    await bs.ingest_upload(db_session, _make_zip(), filename="a.zip", via="telegram")
    cfg = await bs.get_reminder_config(db_session)
    assert cfg["awaiting_since"] is None       # cycle ended by the upload
    assert cfg["last_upload_at"] is not None


# ── reminder decision logic ──────────────────────────────────────────────────
def _cfg(**over):
    cfg = dict(bs.DEFAULT_REMINDER)
    cfg.update(over)
    return cfg


def test_reminder_decision_disabled():
    now = datetime(2026, 7, 17, 19, 0, tzinfo=timezone.utc)  # Friday 19:00
    assert bs.reminder_decision(_cfg(enabled=False), now) is None


def test_reminder_decision_weekly_slot():
    friday_19 = datetime(2026, 7, 17, 19, 0, tzinfo=timezone.utc)   # weekday=4
    assert bs.reminder_decision(_cfg(weekday=4, hour=18), friday_19) == "remind"
    # before the hour → nothing
    friday_10 = datetime(2026, 7, 17, 10, 0, tzinfo=timezone.utc)
    assert bs.reminder_decision(_cfg(weekday=4, hour=18), friday_10) is None
    # wrong weekday → nothing
    monday = datetime(2026, 7, 13, 19, 0, tzinfo=timezone.utc)
    assert bs.reminder_decision(_cfg(weekday=4, hour=18), monday) is None
    # already reminded today → nothing
    assert bs.reminder_decision(
        _cfg(weekday=4, hour=18, last_reminder_at="2026-07-17T18:05:00+00:00"),
        friday_19) is None


def test_reminder_decision_refollow_until_upload():
    now = datetime(2026, 7, 17, 20, 0, tzinfo=timezone.utc)
    # awaiting + 6h passed since last reminder → refollow
    assert bs.reminder_decision(_cfg(
        awaiting_since="2026-07-17T10:00:00+00:00",
        last_reminder_at="2026-07-17T10:00:00+00:00",
        refollow_hours=6), now) == "refollow"
    # awaiting but only 2h passed (refollow=6) → wait
    assert bs.reminder_decision(_cfg(
        awaiting_since="2026-07-17T18:30:00+00:00",
        last_reminder_at="2026-07-17T18:30:00+00:00",
        refollow_hours=6), now) is None
    # custom refollow honoured (1h)
    assert bs.reminder_decision(_cfg(
        awaiting_since="2026-07-17T18:30:00+00:00",
        last_reminder_at="2026-07-17T18:30:00+00:00",
        refollow_hours=1), now) == "refollow"


# ── routes ───────────────────────────────────────────────────────────────────
def test_upload_route_and_dashboard(api_client, monkeypatch):
    monkeypatch.setenv("OWNER_EMAIL", "owner@example.com")
    r = api_client.post("/api/brain/upload",
                        files={"file": ("data.zip", _make_zip(), "application/zip")})
    assert r.status_code == 200, r.text
    assert r.json()["ok"] is True

    r = api_client.get("/api/brain/dashboard")
    assert r.status_code == 200
    body = r.json()
    keys = {s["key"] for s in body["sections"]}
    assert {"brilliant", "tasks", "self_improvement", "finance"} <= keys
    # every section must carry provenance with the authored-by-you rule
    for s in body["sections"]:
        assert s["provenance"].get("rule")
        assert s["provenance"].get("authored_by_you")
    bril = next(s for s in body["sections"] if s["key"] == "brilliant")
    assert bril["latest"]["accuracy_pct"] == 75.0
    assert body["reminder"]["enabled"] is True

    r = api_client.get("/api/brain/uploads")
    assert r.status_code == 200 and len(r.json()["uploads"]) == 1


def test_upload_route_rejects_junk(api_client):
    r = api_client.post("/api/brain/upload",
                        files={"file": ("x.zip", b"junk", "application/zip")})
    assert r.status_code == 400


def test_reminder_routes(api_client):
    r = api_client.get("/api/brain/reminder")
    assert r.status_code == 200 and r.json()["reminder"]["enabled"] is True

    r = api_client.put("/api/brain/reminder",
                       json={"weekday": 2, "hour": 9, "silent": True, "refollow_hours": 3})
    assert r.status_code == 200
    cfg = r.json()["reminder"]
    assert (cfg["weekday"], cfg["hour"], cfg["silent"], cfg["refollow_hours"]) == (2, 9, True, 3)

    assert api_client.put("/api/brain/reminder", json={"weekday": 9}).status_code == 400
    assert api_client.put("/api/brain/reminder", json={"hour": 25}).status_code == 400


# ── future-proofing: generic dataset inventory ───────────────────────────────
def _zip_with_unknown_dataset(email="owner@example.com"):
    """A synthetic export containing a dataset type we have NO specialized
    parsing for — it must still be counted and surfaced."""
    raw = _make_zip(email=email)
    buf = io.BytesIO(raw)
    with zipfile.ZipFile(buf, "a") as z:
        z.writestr("data/production/dailychallenges_userattempt.json",
                   "\n".join(json.dumps({"id": i, "score": 10 * i,
                                         "attempted_ts": f"2026-07-0{i}T09:00:00+00:00"})
                             for i in (1, 2, 3)))
    return buf.getvalue()


def test_inventory_covers_every_dataset_including_unknown():
    s = bs.parse_brilliant_zip(_zip_with_unknown_dataset())
    ds = s["datasets"]
    # the unknown dataset is fully summarized (rows/fields/time range)
    assert ds["dailychallenges_userattempt"]["rows"] == 3
    assert "attempted_ts" in ds["dailychallenges_userattempt"]["fields"]
    assert ds["dailychallenges_userattempt"]["ts_min"].startswith("2026-07-01")
    # and marked as generic-only coverage (no specialized parser yet)
    assert "dailychallenges_userattempt" in s["coverage"]["generic_only"]
    # every file in the zip appears in the inventory — nothing invisible
    assert s["coverage"]["files_total"] == len(ds) >= 7
    assert s["coverage"]["rows_total"] >= 3
    # its timestamps joined the merged activity map
    assert s["activity_by_month"].get("2026-07") >= 3


@pytest.mark.asyncio
async def test_new_dataset_detection_between_uploads(db_session, monkeypatch):
    monkeypatch.setenv("OWNER_EMAIL", "owner@example.com")
    r1 = await bs.ingest_upload(db_session, _make_zip(), filename="w1.zip", via="dashboard")
    assert r1["stats"]["new_datasets"] == []  # first upload → no baseline diff
    r2 = await bs.ingest_upload(db_session, _zip_with_unknown_dataset(),
                                filename="w2.zip", via="dashboard")
    assert "dailychallenges_userattempt" in r2["stats"]["new_datasets"]
