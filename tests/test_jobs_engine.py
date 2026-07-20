"""موتور واحد زمان‌بندی (jobs engine) — phase 1 tests.

The engine ports the Celery beat jobs (dead in production) onto the
in-process loop pattern. Covers: due/stamp semantics, per-job fail-open,
daily jobs not double-running, status surface, and the finance job's
no-credential no-op.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.services import jobs_engine


@pytest.mark.asyncio
async def test_tick_runs_all_jobs_first_time_and_stamps(db_session):
    ran = await jobs_engine.jobs_tick(db_session)
    # Every registered job ran (no stamps yet ⇒ all due).
    assert set(ran.keys()) == {k for k, *_ in jobs_engine.JOBS}
    # Finance job is a clean no-op without FINANCE_IMAP_URL.
    assert ran["finance_email_poll"].get("skipped")
    status = await jobs_engine.get_jobs_status(db_session)
    assert all(j["last_run"] for j in status["jobs"])


@pytest.mark.asyncio
async def test_daily_jobs_do_not_double_run(db_session):
    now = datetime.now(timezone.utc)
    await jobs_engine.jobs_tick(db_session, now=now)
    # A second tick 10 minutes later: daily jobs must NOT run again;
    # sub-daily jobs (30-min interval) aren't due yet either.
    ran2 = await jobs_engine.jobs_tick(db_session, now=now + timedelta(minutes=10))
    assert ran2 == {}
    # 25 hours later everything is due again.
    ran3 = await jobs_engine.jobs_tick(db_session, now=now + timedelta(hours=25))
    assert set(ran3.keys()) == {k for k, *_ in jobs_engine.JOBS}


@pytest.mark.asyncio
async def test_one_broken_job_does_not_stop_the_rest(db_session, monkeypatch):
    async def _boom(db):
        raise RuntimeError("job exploded")

    patched = [
        (k, t, i, _boom if k == "si_daily_refresh" else fn)
        for (k, t, i, fn) in jobs_engine.JOBS
    ]
    monkeypatch.setattr(jobs_engine, "JOBS", patched)
    ran = await jobs_engine.jobs_tick(db_session)
    assert ran["si_daily_refresh"] == {"error": "job exploded"}
    # The other jobs still ran and stamped.
    assert set(ran.keys()) == {k for k, *_ in patched}
    status = await jobs_engine.get_jobs_status(db_session)
    broken = next(j for j in status["jobs"] if j["key"] == "si_daily_refresh")
    assert broken["last_error"] == "job exploded"
    # And the broken job keeps its cadence (no hot-loop): not due 10 min later.
    now = datetime.now(timezone.utc)
    ran2 = await jobs_engine.jobs_tick(db_session, now=now + timedelta(minutes=10))
    assert "si_daily_refresh" not in ran2


@pytest.mark.asyncio
async def test_jobs_status_endpoint(api_client):
    r = api_client.get("/api/settings/jobs-status")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True
    assert {j["key"] for j in body["jobs"]} == {k for k, *_ in jobs_engine.JOBS}


@pytest.mark.asyncio
async def test_ai_usage_endpoint_empty_ok(api_client):
    r = api_client.get("/api/settings/ai-usage")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True and body["total_calls_7d"] == 0
