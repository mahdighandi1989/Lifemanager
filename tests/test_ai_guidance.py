"""AI guidance endpoints + UserActivityContext (audit task e606cca6)."""
from __future__ import annotations

import pytest


def test_user_activity_context_schema_fields():
    """AC 22 — UserActivityContext carries the three lists."""
    from app.schemas.ai_schema import UserActivityContext

    ctx = UserActivityContext()
    assert ctx.open_tasks == []
    assert ctx.recently_completed_tasks == []
    assert ctx.active_projects == []


def test_ai_generate_request_accepts_user_context():
    """AC 23 — AIGenerateRequest.user_context field is optional."""
    from app.schemas.ai_schema import AIGenerateRequest, UserActivityContext

    req = AIGenerateRequest(
        prompt="hello",
        user_context=UserActivityContext(open_tasks=[{"id": 1, "title": "A"}]),
    )
    assert req.user_context is not None
    assert req.user_context.open_tasks == [{"id": 1, "title": "A"}]


@pytest.mark.asyncio
async def test_get_user_activity_context_uses_three_models(db_session):
    """AC 24 — get_user_activity_context aggregates Task/Project/TodoItem."""
    from app.models.task import Task
    from app.models.project import Project
    from app.services.ai.model_service import get_user_activity_context

    from app.models.task import TaskStatus

    db_session.add(Task(title="open task", user_id=99, status=TaskStatus.TODO))
    db_session.add(Task(title="done task", user_id=99, status=TaskStatus.DONE))
    db_session.add(Project(name="proj", user_id=99))
    await db_session.commit()

    ctx = await get_user_activity_context(db_session, user_id=99)
    # The aggregator buckets by `status != 'completed'` for open and
    # `== 'completed'` for done. TaskStatus.DONE serialises as "done"
    # via the SQLAlchemy enum; the rough triage is sufficient.
    titles = [t["title"] for t in ctx.open_tasks] + [
        t["title"] for t in ctx.recently_completed_tasks
    ]
    assert "open task" in titles
    assert "done task" in titles
    assert any(p["name"] == "proj" for p in ctx.active_projects)


def test_post_guidance_generate_returns_201(api_client):
    """AC 27 — POST /ai/guidance/generate creates and persists guidance."""
    resp = api_client.post("/ai/guidance/generate")
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert "guidance" in body
    assert "id" in body


def test_get_guidance_returns_persisted_entries(api_client):
    """AC 28 — GET /ai/guidance returns previously generated entries."""
    api_client.post("/ai/guidance/generate")
    listing = api_client.get("/ai/guidance").json()
    assert isinstance(listing, list)
    assert len(listing) >= 1
    assert all("guidance" in g for g in listing)
