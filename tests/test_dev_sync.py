"""Route-level tests for /api/dev/* (مرکز توسعه).

Network is faked by monkeypatching each service module's _default_fetcher —
the routes themselves run end-to-end against the per-test in-memory DB.
"""
from datetime import datetime, timezone

import pytest

from app.services.dev_sync import github_sync_service, render_sync_service

pytestmark = pytest.mark.asyncio

SECRET = "ghp_super_secret_token_XYZ"


def _no_env(monkeypatch):
    for key in ("GITHUB_TOKEN", "GH_TOKEN", "RENDER_API_KEY"):
        monkeypatch.delenv(key, raising=False)


async def _fake_github(url, headers):
    if "/user/repos" in url:
        if "page=1" in url:
            return [
                {
                    "full_name": "mahdi/lifemanager",
                    "name": "lifemanager",
                    "html_url": "https://github.com/mahdi/lifemanager",
                    "private": True,
                    "archived": False,
                    "language": "Python",
                    "pushed_at": "2026-07-17T20:00:00Z",
                    "open_issues_count": 1,
                    "stargazers_count": 0,
                    "forks_count": 0,
                    "topics": [],
                    "default_branch": "main",
                    "description": None,
                }
            ]
        return []
    if url.endswith("/user"):
        return {"login": "mahdi"}
    raise AssertionError(f"unexpected github url {url}")


def _now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000000000Z")


async def _fake_render(url, headers):
    if "/owners" in url:
        return [{"owner": {"id": "usr-1", "name": "Mahdi"}}]
    if "/services" in url:
        return [
            {
                "service": {
                    "id": "srv-1",
                    "name": "lifemanager",
                    "type": "web_service",
                    "repo": "https://github.com/mahdi/lifemanager",
                    "suspended": "not_suspended",
                    "serviceDetails": {"url": "https://x.onrender.com"},
                }
            }
        ]
    if "/logs" in url:
        return {
            "logs": [
                {"message": "GET /api/health 200", "timestamp": _now_iso(),
                 "labels": [{"name": "level", "value": "info"}]},
                {"message": "ERROR: kaboom happened", "timestamp": _now_iso()},
            ]
        }
    raise AssertionError(f"unexpected render url {url}")


@pytest.fixture
def fake_net(monkeypatch):
    _no_env(monkeypatch)
    monkeypatch.setattr(github_sync_service, "_default_fetcher", _fake_github)
    monkeypatch.setattr(render_sync_service, "_default_fetcher", _fake_render)
    render_sync_service._owner_id_cache.clear()


# ── tokens ───────────────────────────────────────────────────────────────────
async def test_integrations_empty_status(api_client, monkeypatch):
    _no_env(monkeypatch)
    res = api_client.get("/api/dev/integrations")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert body["github"]["has_api_key"] is False
    assert body["render"]["source"] is None


async def test_put_token_never_leaks_key(api_client, monkeypatch):
    _no_env(monkeypatch)
    res = api_client.put("/api/dev/integrations/github", json={"api_key": SECRET})
    assert res.status_code == 200
    assert SECRET not in res.text  # masked contract
    assert res.json()["has_api_key"] is True

    res2 = api_client.get("/api/dev/integrations")
    assert SECRET not in res2.text
    assert res2.json()["github"]["source"] == "db"

    # clearing with empty string
    res3 = api_client.put("/api/dev/integrations/github", json={"api_key": ""})
    assert res3.json()["has_api_key"] is False


async def test_put_token_unknown_provider(api_client):
    res = api_client.put("/api/dev/integrations/gitlab", json={"api_key": "x"})
    assert res.status_code == 404


async def test_connection_test_without_token(api_client, monkeypatch):
    _no_env(monkeypatch)
    res = api_client.post("/api/dev/integrations/render/test")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is False and body["reason"] == "no_token"


async def test_connection_test_with_token(api_client, fake_net):
    api_client.put("/api/dev/integrations/github", json={"api_key": "t"})
    res = api_client.post("/api/dev/integrations/github/test")
    assert res.json() == {"ok": True, "login": "mahdi", "source": "db"}


# ── sync + projects + logs flow ──────────────────────────────────────────────
async def test_full_sync_flow(api_client, fake_net):
    api_client.put("/api/dev/integrations/github", json={"api_key": "gt"})
    api_client.put("/api/dev/integrations/render", json={"api_key": "rt"})

    gh = api_client.post("/api/dev/sync/github").json()
    assert gh["ok"] is True and gh["synced"] == 1

    rd = api_client.post("/api/dev/sync/render").json()
    assert rd["ok"] is True and rd["synced"] == 1

    # service auto-linked to the repo project
    services = api_client.get("/api/dev/services").json()["services"]
    assert services[0]["dev_project_id"] is not None

    # pull logs now (live tab poll)
    fetched = api_client.post("/api/dev/logs/fetch", json={}).json()
    assert fetched["ok"] is True and fetched["new"] == 2

    # filters: level + search + service
    logs = api_client.get("/api/dev/logs", params={"levels": "error"}).json()
    assert logs["count"] == 1 and "kaboom" in logs["logs"][0]["message"]
    logs2 = api_client.get("/api/dev/logs", params={"q": "health"}).json()
    assert logs2["count"] == 1
    logs3 = api_client.get("/api/dev/logs", params={"service_ids": "srv-none"}).json()
    assert logs3["count"] == 0

    # stats shape
    stats = api_client.get("/api/dev/logs/stats").json()
    assert stats["ok"] is True and stats["total"] == 2
    assert stats["by_level"]["error"] == 1
    assert stats["by_service"][0]["service_id"] == "srv-1"

    # projects list carries service + 24h counters
    projects = api_client.get("/api/dev/projects").json()["projects"]
    assert projects[0]["repo_full_name"] == "mahdi/lifemanager"
    assert projects[0]["errors_24h"] == 1 and projects[0]["logs_24h"] == 2

    # overview aggregates
    overview = api_client.get("/api/dev/overview").json()
    assert overview["totals"]["projects"] == 1

    # summaries: generate now (fallback, no AI configured)
    gen = api_client.post("/api/dev/summaries/generate", json={}).json()
    assert gen["ok"] is True and gen["count"] == 1
    listed = api_client.get("/api/dev/summaries").json()["summaries"]
    assert listed and "لاگ" in listed[0]["summary"] and listed[0]["ai_model"] is None


async def test_sync_without_token_fails_gracefully(api_client, monkeypatch):
    _no_env(monkeypatch)
    res = api_client.post("/api/dev/sync/github").json()
    assert res["ok"] is False and res["error"] == "no_token"


# ── project patch + task creation ────────────────────────────────────────────
async def test_link_and_create_task(api_client, fake_net):
    api_client.put("/api/dev/integrations/github", json={"api_key": "gt"})
    api_client.post("/api/dev/sync/github")
    dev_id = api_client.get("/api/dev/projects").json()["projects"][0]["id"]

    life = api_client.post(
        "/api/projects/", json={"name": "پروژه‌های نرم‌افزاری", "description": None}
    ).json()

    patched = api_client.patch(f"/api/dev/projects/{dev_id}", json={"linked_project_id": life["id"]})
    assert patched.json()["project"]["linked_project_id"] == life["id"]

    created = api_client.post(f"/api/dev/projects/{dev_id}/create-task", json={})
    assert created.status_code == 201
    task_id = created.json()["task_id"]
    task = api_client.get(f"/api/tasks/{task_id}").json()
    assert task["project_id"] == life["id"]
    assert "رسیدگی" in task["title"]

    # unlink
    unlinked = api_client.patch(f"/api/dev/projects/{dev_id}", json={"unlink": True})
    assert unlinked.json()["project"]["linked_project_id"] is None

    # patch a missing project → 404
    missing = api_client.patch("/api/dev/projects/99999", json={"is_active": False})
    assert missing.status_code == 404


# ── settings ─────────────────────────────────────────────────────────────────
async def test_settings_roundtrip(api_client):
    res = api_client.get("/api/dev/settings")
    assert res.status_code == 200
    cfg = res.json()["settings"]
    assert cfg["log_poll_seconds"] >= 15

    put = api_client.put(
        "/api/dev/settings", json={"log_poll_seconds": 60, "summary_enabled": False}
    )
    assert put.status_code == 200
    updated = put.json()["settings"]
    assert updated["log_poll_seconds"] == 60 and updated["summary_enabled"] is False

    # out-of-range values are rejected by the schema
    bad = api_client.put("/api/dev/settings", json={"log_poll_seconds": 1})
    assert bad.status_code == 422


async def test_put_token_with_whitespace_rejected(api_client):
    res = api_client.put(
        "/api/dev/integrations/github", json={"api_key": "tok\nwith-newline"}
    )
    assert res.status_code == 422


async def test_error_issues_flow(api_client, fake_net):
    """Full flow: error log line → persistent issue → visible on the project
    card → manual resolve → feed shows the translated event."""
    api_client.put("/api/dev/integrations/github", json={"api_key": "gt"})
    api_client.put("/api/dev/integrations/render", json={"api_key": "rt"})
    api_client.post("/api/dev/sync/github")
    api_client.post("/api/dev/sync/render")
    fetched = api_client.post("/api/dev/logs/fetch", json={}).json()
    assert fetched["issues_touched"] == 1  # the ERROR line became an issue

    errors = api_client.get("/api/dev/errors").json()
    assert errors["ok"] is True and errors["counts"].get("open") == 1
    issue = errors["errors"][0]
    assert issue["status"] == "open" and "kaboom" in issue["title"]

    # the project card counts it
    projects = api_client.get("/api/dev/projects").json()["projects"]
    assert projects[0]["open_errors"] == 1

    # per-project feed: open error + translated event list
    dev_id = projects[0]["id"]
    feed = api_client.get(f"/api/dev/projects/{dev_id}/feed").json()
    assert feed["ok"] is True
    assert len(feed["open_errors"]) == 1
    assert any("خطا" in ev["text_fa"] for ev in feed["feed"])

    # manual resolve → counted as resolved, project card back to green
    patched = api_client.patch(f"/api/dev/errors/{issue['id']}", json={"status": "resolved"}).json()
    assert patched["error"]["status"] == "resolved" and patched["error"]["resolved_by"] == "manual"
    projects2 = api_client.get("/api/dev/projects").json()["projects"]
    assert projects2[0]["open_errors"] == 0

    # re-fetch same logs: same lines are deduped → no reopen from old rows
    api_client.post("/api/dev/logs/fetch", json={})
    errors2 = api_client.get("/api/dev/errors").json()
    assert errors2["counts"].get("resolved") == 1 and not errors2["counts"].get("open")

    # invalid status rejected
    bad = api_client.patch(f"/api/dev/errors/{issue['id']}", json={"status": "gone"})
    assert bad.status_code == 422
    missing = api_client.patch("/api/dev/errors/99999", json={"status": "open"})
    assert missing.status_code == 404
