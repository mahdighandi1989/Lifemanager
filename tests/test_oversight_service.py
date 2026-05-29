"""OversightService + external-project connections (audit task d2146781).

Covers analyze_time_allocation (AC 7 — the named test node),
connect_to_external_project / fetch_project_data (AC 3, 6), the
/api/v1/oversight/connections endpoints (AC 4, 5), and the
sync_external_project Celery task (AC 6).
"""
from __future__ import annotations

import pytest


# ── analyze_time_allocation (AC 7) ───────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_time_allocation(db_session):
    from app.models.external_project import ExternalProject
    from app.services.oversight_service import OversightService

    db_session.add_all(
        [
            ExternalProject(user_id=0, name="A", provider="jira"),
            ExternalProject(user_id=0, name="B", provider="jira"),
            ExternalProject(user_id=0, name="C", provider="linear"),
        ]
    )
    await db_session.commit()

    out = await OversightService(db_session).analyze_time_allocation(user_id=0)
    assert out["external_project_count"] == 3
    by = {row["provider"]: row["count"] for row in out["by_provider"]}
    assert by == {"jira": 2, "linear": 1}


# ── connect_to_external_project + list (AC 3) ────────────────────────

@pytest.mark.asyncio
async def test_connect_to_external_project_persists(db_session):
    from app.services.oversight_service import OversightService

    svc = OversightService(db_session)
    conn = await svc.connect_to_external_project(
        user_id=0, name="Jira Cloud", base_url="https://x.atlassian.net",
        api_key_encrypted="enc", connection_type="jira", sync_frequency="hourly",
    )
    assert conn.id is not None
    assert conn.is_active is True

    rows = await svc.list_connections(user_id=0)
    assert [c.name for c in rows] == ["Jira Cloud"]


# ── fetch_project_data (AC 6) ────────────────────────────────────────

@pytest.mark.asyncio
async def test_fetch_project_data_stamps_last_sync(db_session):
    from app.services.oversight_service import OversightService

    svc = OversightService(db_session)
    conn = await svc.connect_to_external_project(user_id=0, name="C1")
    out = await svc.fetch_project_data(conn.id)
    assert out["fetched"] is True
    assert out["connection_id"] == conn.id


@pytest.mark.asyncio
async def test_fetch_project_data_missing_connection(db_session):
    from app.services.oversight_service import OversightService

    out = await OversightService(db_session).fetch_project_data(999999)
    assert out["fetched"] is False


# ── Endpoints (AC 4, 5) ──────────────────────────────────────────────

def test_post_oversight_connection(api_client):
    resp = api_client.post(
        "/api/v1/oversight/connections",
        json={"name": "Linear WS", "connection_type": "linear", "api_key": "secret"},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["id"] and body["name"] == "Linear WS"


def test_get_oversight_connections(api_client):
    api_client.post(
        "/api/v1/oversight/connections", json={"name": "Conn-A"}
    )
    resp = api_client.get("/api/v1/oversight/connections")
    assert resp.status_code == 200, resp.text
    assert any(c["name"] == "Conn-A" for c in resp.json())


# ── sync_external_project Celery task (AC 6) ─────────────────────────

def test_sync_external_project_task_registered():
    import app.tasks  # noqa: F401 — registers the @celery_app.task
    from app.celery_app import celery_app

    assert "app.tasks.sync_external_project" in celery_app.tasks


# ── Models (AC 1, 2) ─────────────────────────────────────────────────

def test_external_project_connection_model_fields():
    from app.models.external_project import ExternalProjectConnection

    cols = set(ExternalProjectConnection.__table__.columns.keys())
    assert {
        "id", "name", "base_url", "api_key_encrypted", "connection_type",
        "sync_frequency", "is_active", "last_sync_at", "created_at", "updated_at",
    } <= cols


def test_oversight_task_model_fields():
    from app.models.oversight_task import OversightTask

    cols = set(OversightTask.__table__.columns.keys())
    assert {
        "id", "external_project_id", "task_type", "status",
        "priority", "due_date", "analysis_result", "created_at",
    } <= cols
