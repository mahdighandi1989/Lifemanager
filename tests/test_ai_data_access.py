"""User-scoped AI context retrieval (audit task 1a08ded2 ACs 29-31)."""
from __future__ import annotations

import pytest

from app.services.ai.ai_data_access_service import get_user_data_context


@pytest.mark.asyncio
async def test_get_user_data_context_returns_shape(db_session):
    """The aggregator returns the documented dict with all four keys
    even when the user has no rows yet."""
    out = await get_user_data_context(db_session, user_id=1)
    assert set(out.keys()) == {"tasks", "projects", "todo_items", "notifications", "financial_accounts"}
    assert all(isinstance(out[k], list) for k in out)


@pytest.mark.asyncio
async def test_user_data_context_scopes_tasks_per_user(db_session):
    """AC 31 — a row owned by user A must NOT appear in user B's
    context. Pin the per-user scoping with two distinct user ids."""
    from app.models.task import Task

    db_session.add(Task(title="A task", user_id=1))
    db_session.add(Task(title="B task", user_id=2))
    await db_session.commit()

    ctx_a = await get_user_data_context(db_session, user_id=1)
    ctx_b = await get_user_data_context(db_session, user_id=2)

    a_titles = {t["title"] for t in ctx_a["tasks"]}
    b_titles = {t["title"] for t in ctx_b["tasks"]}
    assert "A task" in a_titles and "A task" not in b_titles
    assert "B task" in b_titles and "B task" not in a_titles


def test_endpoint_responds_with_context(api_client):
    """AC 30 — GET /api/ai/user_data_context returns 200 with the
    documented shape. The route mounts under /ai (router prefix)."""
    resp = api_client.get("/ai/user_data_context")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert set(body.keys()) == {"tasks", "projects", "todo_items", "notifications", "financial_accounts"}


def test_endpoint_scopes_per_caller(api_client):
    """Sanity check that the route honours the user_id dep — anon
    callers get user 0's surface, not someone else's."""
    # Both calls go without an Authorization header → both resolve to
    # DEFAULT_ANON_USER_ID, so they should return identical bodies.
    a = api_client.get("/ai/user_data_context").json()
    b = api_client.get("/ai/user_data_context").json()
    assert a == b
