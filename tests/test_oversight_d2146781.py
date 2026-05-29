"""Oversight depth: sync, time-budget, neglected/problems, adapter (task d2146781).

Closes the raw-memo gaps the canonical ACs flattened: real per-connection time
budget ("زمانی که باید برای هر کدومشون بذاره"), neglected-item + problem
detection ("مغفول مونده رو بگه ... فلان مشکل هست"), the sync/tasks endpoints,
and a concrete adapter so fetch_project_data returns real items.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest


def _make_conn(api_client, name="Jira", base_url=None, api_key=None):
    body = {"name": name, "connection_type": "generic"}
    if base_url:
        body["base_url"] = base_url
    if api_key:
        body["api_key"] = api_key
    r = api_client.post("/api/v1/oversight/connections", json=body)
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_sync_and_time_budget_and_allocation(api_client):
    cid = _make_conn(api_client)
    assert api_client.post(f"/api/v1/oversight/connections/{cid}/sync").json()["fetched"] is True
    assert api_client.patch(
        f"/api/v1/oversight/connections/{cid}/time-budget", json={"minutes": 120}
    ).status_code == 200

    alloc = api_client.get("/api/v1/oversight/time-allocation").json()
    assert alloc["total_budget_minutes"] == 120
    assert any(c["connection_id"] == cid and c["time_budget_minutes"] == 120 for c in alloc["connections"])


def test_neglected_detection(api_client):
    cid = _make_conn(api_client, name="StaleProj")
    # never synced → neglected
    neg = api_client.get("/api/v1/oversight/neglected").json()
    assert any(n["connection_id"] == cid for n in neg["neglected"])
    # after a sync it's no longer neglected
    api_client.post(f"/api/v1/oversight/connections/{cid}/sync")
    neg2 = api_client.get("/api/v1/oversight/neglected").json()
    assert not any(n["connection_id"] == cid for n in neg2["neglected"])


def test_oversight_tasks_endpoint(api_client):
    _make_conn(api_client)
    r = api_client.get("/api/v1/oversight/tasks")
    assert r.status_code == 200 and isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_detect_problems_flags_overdue(db_session):
    from app.models.external_project import ExternalProjectConnection
    from app.models.oversight_task import OversightTask
    from app.services.oversight_service import OversightService

    conn = ExternalProjectConnection(user_id=3, name="P", is_active=True)
    db_session.add(conn)
    await db_session.commit()
    await db_session.refresh(conn)
    db_session.add(OversightTask(
        external_project_id=conn.id, task_type="review", status="pending",
        due_date=datetime.now(timezone.utc) - timedelta(days=2),
    ))
    await db_session.commit()
    problems = await OversightService(db_session).detect_problems(3)
    assert problems and problems[0]["issue"] == "overdue"


@pytest.mark.asyncio
async def test_generic_adapter_lists_projects(monkeypatch):
    from app.services.integrations.external_project_interface import ExternalProjectConfig
    from app.services.integrations.generic_http_adapter import GenericHttpAdapter

    class _Resp:
        def raise_for_status(self):
            pass

        def json(self):
            return {"projects": [{"id": "P1", "name": "Alpha", "url": "http://x"}]}

    class _Client:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def get(self, url, headers=None):
            return _Resp()

    import httpx

    monkeypatch.setattr(httpx, "AsyncClient", _Client)
    infos = await GenericHttpAdapter().list_projects(
        ExternalProjectConfig(base_url="https://pm.example.com", api_key="k")
    )
    assert infos and infos[0].name == "Alpha" and infos[0].external_id == "P1"
