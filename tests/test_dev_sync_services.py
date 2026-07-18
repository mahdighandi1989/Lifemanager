"""Service-level tests for the dev-sync layer (مرکز توسعه).

Fake fetchers everywhere — no network. Covers: GitHub repo upsert, Render
service upsert + repo auto-link, log dedup, digest/fallback summary, the
daily summary persistence + activity mirror, and the engine's pure
cadence/settings decisions.
"""
from datetime import date, datetime, timedelta, timezone

import pytest
from sqlalchemy import select

from app.models.activity_log import ActivityLog
from app.models.dev_sync import DevLog, DevLogSummary, DevProject, DevService
from app.services.dev_sync import (
    engine as dev_engine,
    github_sync_service,
    log_summary_service,
    render_sync_service,
    token_service,
)

pytestmark = pytest.mark.asyncio

NOW = datetime(2026, 7, 18, 10, 0, 0, tzinfo=timezone.utc)


def _gh_repo(full_name="mahdi/lifemanager", **over):
    base = {
        "full_name": full_name,
        "name": full_name.split("/")[-1],
        "description": "life management",
        "html_url": f"https://github.com/{full_name}",
        "default_branch": "main",
        "language": "Python",
        "private": True,
        "archived": False,
        "pushed_at": "2026-07-17T20:00:00Z",
        "stargazers_count": 3,
        "forks_count": 0,
        "open_issues_count": 2,
        "topics": ["fastapi"],
    }
    base.update(over)
    return base


async def _set_token(db, provider, value="tok-123"):
    await token_service.set_token(db, provider, value, None)


# ── tokens ───────────────────────────────────────────────────────────────────
async def test_token_roundtrip_encrypted_at_rest(db_session):
    row = await token_service.set_token(db_session, "github", "ghp_secret_ABC", None)
    assert row.api_key_encrypted and "ghp_secret_ABC" not in row.api_key_encrypted
    token, source = await token_service.get_token(db_session, "github", None)
    assert token == "ghp_secret_ABC" and source == "db"


async def test_token_env_fallback(db_session, monkeypatch):
    monkeypatch.setenv("GH_TOKEN", "env-token")
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    token, source = await token_service.get_token(db_session, "github", None)
    assert token == "env-token" and source == "env"


async def test_token_clear(db_session, monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    monkeypatch.delenv("GH_TOKEN", raising=False)
    await token_service.set_token(db_session, "github", "abc", None)
    await token_service.set_token(db_session, "github", "", None)
    token, source = await token_service.get_token(db_session, "github", None)
    assert token is None and source is None


# ── github sync ──────────────────────────────────────────────────────────────
async def test_github_sync_upserts(db_session):
    await _set_token(db_session, "github")

    async def fake_fetch(url, headers):
        assert "api.github.com/user/repos" in url
        assert headers["Authorization"].startswith("token ")
        if "page=1" in url:
            return [_gh_repo(), _gh_repo("mahdi/project-management", language="TypeScript")]
        return []

    result = await github_sync_service.sync_repos(db_session, fetcher=fake_fetch)
    assert result["ok"] is True and result["synced"] == 2 and result["created"] == 2

    # re-sync with a change: update-in-place, no duplicates
    async def fake_fetch2(url, headers):
        if "page=1" in url:
            return [_gh_repo(open_issues_count=9)]
        return []

    result2 = await github_sync_service.sync_repos(db_session, fetcher=fake_fetch2)
    assert result2["created"] == 0
    rows = (await db_session.execute(select(DevProject))).scalars().all()
    assert len(rows) == 2
    updated = next(r for r in rows if r.repo_full_name == "mahdi/lifemanager")
    assert updated.open_issues == 9 and updated.is_private is True


async def test_github_sync_without_token(db_session, monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    monkeypatch.delenv("GH_TOKEN", raising=False)
    result = await github_sync_service.sync_repos(db_session)
    assert result == {"ok": False, "error": "no_token", "synced": 0, "created": 0}


async def test_github_sync_fetch_error_fail_open(db_session):
    await _set_token(db_session, "github")

    async def boom(url, headers):
        raise RuntimeError("network down")

    result = await github_sync_service.sync_repos(db_session, fetcher=boom)
    assert result["ok"] is False and "network down" in result["error"]
    row = await token_service.get_integration(db_session, "github", None)
    assert row.last_sync_ok is False and "network down" in row.last_sync_error


# ── render sync ──────────────────────────────────────────────────────────────
def _render_payload():
    return [
        {
            "service": {
                "id": "srv-abc123",
                "name": "lifemanager",
                "type": "web_service",
                "repo": "https://github.com/Mahdi/Lifemanager",
                "branch": "main",
                "suspended": "not_suspended",
                "serviceDetails": {"url": "https://lifemanager.onrender.com"},
            }
        },
        {
            "service": {
                "id": "srv-def456",
                "name": "worker",
                "type": "background_worker",
                "suspended": "suspended",
            }
        },
    ]


async def test_render_sync_services_and_autolink(db_session):
    await _set_token(db_session, "render")
    # seed the matching dev project (case-insensitive repo match)
    db_session.add(DevProject(repo_full_name="mahdi/lifemanager", name="lifemanager"))
    await db_session.commit()

    async def fake_fetch(url, headers):
        assert headers["Authorization"].startswith("Bearer ")
        assert "/services" in url
        return _render_payload()

    result = await render_sync_service.sync_services(db_session, fetcher=fake_fetch)
    assert result["ok"] is True and result["synced"] == 2

    services = (await db_session.execute(select(DevService))).scalars().all()
    by_id = {s.id: s for s in services}
    linked = by_id["srv-abc123"]
    project = (await db_session.execute(select(DevProject))).scalars().first()
    assert linked.dev_project_id == project.id
    assert linked.status == "active" and by_id["srv-def456"].status == "suspended"

    # a service that disappears upstream is kept but marked gone
    async def fake_fetch_one(url, headers):
        return _render_payload()[:1]

    await render_sync_service.sync_services(db_session, fetcher=fake_fetch_one)
    services = (await db_session.execute(select(DevService))).scalars().all()
    assert {s.id: s.status for s in services}["srv-def456"] == "gone"


async def test_render_log_sync_dedups(db_session):
    await _set_token(db_session, "render")
    db_session.add(DevService(id="srv-abc123", name="lifemanager", status="active"))
    await db_session.commit()

    calls = {"n": 0}

    async def fake_fetch(url, headers):
        if "/owners" in url:
            return [{"owner": {"id": "usr-1", "name": "Mahdi"}}]
        if "/logs" in url:
            calls["n"] += 1
            return {
                "hasMore": False,
                "logs": [
                    {
                        "message": "GET /api/health 200",
                        "timestamp": "2026-07-18T07:49:47.947123456Z",
                        "labels": [{"name": "level", "value": "info"}],
                    },
                    {
                        "message": "ERROR: boom",
                        "timestamp": "2026-07-18T07:50:00Z",
                    },
                ],
            }
        raise AssertionError(f"unexpected url {url}")

    r1 = await render_sync_service.sync_logs(db_session, fetcher=fake_fetch)
    assert r1["ok"] is True and r1["new"] == 2
    r2 = await render_sync_service.sync_logs(db_session, fetcher=fake_fetch)
    assert r2["new"] == 0  # same lines → dedup by row id
    rows = (await db_session.execute(select(DevLog))).scalars().all()
    assert len(rows) == 2
    levels = {r.message: r.level for r in rows}
    assert levels["ERROR: boom"] == "error"  # detected from message text
    svc = (await db_session.execute(select(DevService))).scalars().first()
    assert svc.last_log_at is not None


async def test_render_helpers():
    assert render_sync_service.parse_repo_full_name("https://github.com/A/B.git") == "a/b"
    assert render_sync_service.parse_repo_full_name(None) is None
    ts = render_sync_service.parse_render_datetime("2026-07-18T07:49:47.947123456Z")
    assert ts is not None and ts.microsecond == 947123
    assert render_sync_service.detect_level("Traceback (most recent call last)") == "error"
    assert render_sync_service.detect_level("all good", [{"name": "level", "value": "warning"}]) == "warn"


async def test_cleanup_old_logs(db_session):
    old = NOW - timedelta(hours=100)
    db_session.add(DevLog(id="a", service_id="s", timestamp=old, level="info", message="old"))
    db_session.add(
        DevLog(id="b", service_id="s", timestamp=datetime.now(timezone.utc), level="info", message="new")
    )
    await db_session.commit()
    removed = await render_sync_service.cleanup_old_logs(db_session, retention_hours=72)
    assert removed == 1
    rows = (await db_session.execute(select(DevLog))).scalars().all()
    assert [r.id for r in rows] == ["b"]


# ── digest + summaries ───────────────────────────────────────────────────────
def _log(i, level="info", message="GET /api/x 200", at=None):
    return DevLog(
        id=f"l{i}",
        service_id="srv-abc123",
        service_name="lifemanager",
        timestamp=at or (NOW - timedelta(minutes=i)),
        level=level,
        message=message,
    )


async def test_build_digest_collapses_duplicates():
    logs = [_log(i, message=f"GET /api/items/{i} 200") for i in range(20)]
    logs.append(_log(99, level="error", message="ValueError: bad input 42"))
    digest = log_summary_service.build_digest(logs)
    assert digest["total"] == 21
    assert digest["by_level"] == {"info": 20, "error": 1}
    # numeric ids normalized away → the 20 GETs collapse into one group
    top = digest["top_messages"][0]
    assert top["count"] == 20
    assert digest["error_samples"] == ["ValueError: bad input 42"]


async def test_fallback_summary_persian():
    digest = {"total": 5, "by_level": {"error": 2, "warn": 1, "info": 2}, "deploy_events": 1,
              "error_samples": ["boom"]}
    text = log_summary_service.fallback_summary_fa("lifemanager", digest)
    assert "لاگ" in text and "خطا" in text and "boom" in text
    assert log_summary_service.fallback_summary_fa("x", {"total": 0, "by_level": {}}).startswith("امروز لاگی")


async def test_generate_daily_summaries_fallback_and_activity(db_session):
    project = DevProject(repo_full_name="mahdi/lifemanager", name="lifemanager")
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    db_session.add(
        DevService(id="srv-abc123", name="lifemanager", status="active", dev_project_id=project.id)
    )
    for i in range(3):
        db_session.add(_log(i))
    db_session.add(_log(9, level="error", message="ERROR: kaboom"))
    await db_session.commit()

    results = await log_summary_service.generate_daily_summaries(
        db_session, tz_offset_minutes=0, now=NOW
    )
    assert len(results) == 1
    row = (await db_session.execute(select(DevLogSummary))).scalars().one()
    assert row.summary_date == date(2026, 7, 18)
    assert row.ai_model is None  # no provider configured → fallback
    assert "لاگ" in row.summary and row.stats["total"] == 4
    assert row.dev_project_id == project.id

    # mirrored into the activity trail
    acts = (await db_session.execute(select(ActivityLog))).scalars().all()
    assert any(a.action == "dev_daily_summary" and a.entity_type == "dev_project" for a in acts)

    # regenerate same day → update in place, not a second row
    await log_summary_service.generate_daily_summaries(db_session, tz_offset_minutes=0, now=NOW)
    rows = (await db_session.execute(select(DevLogSummary))).scalars().all()
    assert len(rows) == 1


# ── engine (pure decisions + tick) ───────────────────────────────────────────
async def test_due_matrix():
    assert dev_engine.due(None, 60, NOW) is True
    assert dev_engine.due("garbage", 60, NOW) is True
    fresh = (NOW - timedelta(seconds=30)).isoformat()
    stale = (NOW - timedelta(seconds=90)).isoformat()
    assert dev_engine.due(fresh, 60, NOW) is False
    assert dev_engine.due(stale, 60, NOW) is True


async def test_summary_decision_matrix():
    base = {"summary_enabled": True, "tz_offset_minutes": 0, "summary_hour": 22,
            "last_summary_date": None}
    before = NOW.replace(hour=10)
    after = NOW.replace(hour=23)
    assert dev_engine.summary_decision(base, before) is False
    assert dev_engine.summary_decision(base, after) is True
    done = dict(base, last_summary_date="2026-07-18")
    assert dev_engine.summary_decision(done, after) is False
    off = dict(base, summary_enabled=False)
    assert dev_engine.summary_decision(off, after) is False


async def test_coerce_guards_types():
    assert dev_engine._coerce("log_poll_seconds", "") is None  # '' never lands in an int
    assert dev_engine._coerce("log_poll_seconds", "45") == 45
    assert dev_engine._coerce("log_poll_seconds", True) is None  # bool is not an interval
    assert dev_engine._coerce("enabled", True) is True
    assert dev_engine._coerce("enabled", "yes") is None


async def test_update_settings_ignores_stamps_and_bad_types(db_session):
    cfg = await dev_engine.update_settings(
        db_session,
        {"log_poll_seconds": 45, "enabled": False, "last_repo_sync_at": "2020-01-01T00:00:00",
         "retention_hours": ""},
    )
    assert cfg["log_poll_seconds"] == 45 and cfg["enabled"] is False
    assert cfg["last_repo_sync_at"] is None  # stamp not editable
    assert cfg["retention_hours"] == dev_engine.DEFAULT_SETTINGS["retention_hours"]


async def test_tick_runs_then_waits(db_session, monkeypatch):
    called = {"github": 0, "services": 0, "logs": 0}

    async def fake_repos(db, user_id=None, **kw):
        called["github"] += 1
        return {"ok": True, "synced": 0, "created": 0}

    async def fake_services(db, user_id=None, **kw):
        called["services"] += 1
        return {"ok": True, "synced": 0, "created": 0}

    async def fake_logs(db, user_id=None, **kw):
        called["logs"] += 1
        return {"ok": True, "fetched": 0, "new": 0}

    monkeypatch.setattr(github_sync_service, "sync_repos", fake_repos)
    monkeypatch.setattr(render_sync_service, "sync_services", fake_services)
    monkeypatch.setattr(render_sync_service, "sync_logs", fake_logs)

    now = NOW.replace(hour=10)  # before summary_hour → no summary concern
    r1 = await dev_engine.dev_sync_tick(db_session, now=now)
    assert set(r1["ran"]) >= {"github", "services", "logs", "cleanup"}
    r2 = await dev_engine.dev_sync_tick(db_session, now=now + timedelta(seconds=5))
    assert r2["ran"] == []  # everything inside its cadence window
    assert called == {"github": 1, "services": 1, "logs": 1}


async def test_tick_disabled(db_session):
    await dev_engine.update_settings(db_session, {"enabled": False})
    result = await dev_engine.dev_sync_tick(db_session, now=NOW)
    assert result.get("skipped") == "disabled" and result["ran"] == []


# ── review-workflow regressions ──────────────────────────────────────────────
async def test_tick_failure_rolls_back_and_still_stamps(db_session, monkeypatch):
    """A concern blowing up mid-transaction must not poison the shared
    session: later concerns still run and stamps still persist (no 30s
    hot-loop re-running every concern forever)."""
    from sqlalchemy import text as sa_text

    async def poison(db, user_id=None, **kw):
        # leave a failed INSERT in the session, like an escaped commit error
        await db.execute(sa_text("INSERT INTO nonexistent_table VALUES (1)"))
        return {"ok": True}

    async def fine(db, user_id=None, **kw):
        return {"ok": True, "synced": 0, "created": 0}

    monkeypatch.setattr(github_sync_service, "sync_repos", poison)
    monkeypatch.setattr(render_sync_service, "sync_services", fine)

    async def fake_logs(db, user_id=None, **kw):
        return {"ok": True, "fetched": 0, "new": 0}

    monkeypatch.setattr(render_sync_service, "sync_logs", fake_logs)

    now = NOW.replace(hour=10)
    r1 = await dev_engine.dev_sync_tick(db_session, now=now)
    assert r1["github"]["ok"] is False
    assert r1["services"] == {"ok": True, "synced": 0, "created": 0}  # session survived
    # stamps persisted → the immediate next tick has nothing due
    r2 = await dev_engine.dev_sync_tick(db_session, now=now + timedelta(seconds=5))
    assert r2["ran"] == []


async def test_env_values_never_baked_into_blob(db_session, monkeypatch):
    """Stamp saves must write ONLY stamps — an env override read at tick time
    must not be frozen into the stored blob (blob outranks env forever)."""
    monkeypatch.setenv("DEV_LOG_POLL_SECONDS", "77")

    async def fine(db, user_id=None, **kw):
        return {"ok": True}

    monkeypatch.setattr(github_sync_service, "sync_repos", fine)
    monkeypatch.setattr(render_sync_service, "sync_services", fine)
    monkeypatch.setattr(render_sync_service, "sync_logs", fine)

    await dev_engine.dev_sync_tick(db_session, now=NOW.replace(hour=10))
    blob = await dev_engine._load_blob(db_session)
    assert "log_poll_seconds" not in blob  # env stays env
    assert "last_repo_sync_at" in blob  # stamps did persist
    # merged view still shows the env value
    cfg = await dev_engine.load_settings(db_session)
    assert cfg["log_poll_seconds"] == 77


async def test_render_sync_upserts_across_scopes(db_session):
    """dev_services PK is Render's srv-id (global): a row created under a
    user scope must be UPDATED, not re-inserted, by the engine's NULL-scope
    sync — re-inserting was a guaranteed IntegrityError every 30s."""
    await _set_token(db_session, "render")
    db_session.add(DevService(id="srv-abc123", name="old-name", status="active", user_id=5))
    await db_session.commit()

    async def fake_fetch(url, headers):
        return _render_payload()[:1]

    result = await render_sync_service.sync_services(db_session, user_id=None, fetcher=fake_fetch)
    assert result["ok"] is True and result["created"] == 0  # updated in place, no PK clash
    rows = (await db_session.execute(select(DevService))).scalars().all()
    assert len(rows) == 1 and rows[0].name == "lifemanager"


async def test_sanitize_error_redacts_token():
    exc = RuntimeError("Illegal header value b'Bearer rnd-SECRET\\ntail'")
    msg = token_service.sanitize_error(exc, "rnd-SECRET\ntail", None)
    assert "SECRET" not in msg and "***" in msg and "\n" not in msg
