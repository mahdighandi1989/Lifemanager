"""Task merge/consolidation (audit task fbd9bd36, AC1-AC4, AC6)."""
from types import SimpleNamespace

import pytest

from app.models.task import Task
from app.services.consolidation_service import merge_tasks
from app.services.similarity_service import find_similar_entities, similarity


def test_similarity_metric():
    assert similarity("buy milk and eggs", "buy milk and bread") >= 0.5
    assert similarity("call dentist", "completely unrelated topic") < 0.3


def test_find_similar_entities_groups_duplicates():
    ents = [
        SimpleNamespace(id=1, title="call the dentist", description=""),
        SimpleNamespace(id=2, title="call the dentist office", description=""),
        SimpleNamespace(id=3, title="xyzzy unrelated thing", description=""),
    ]
    groups = find_similar_entities(ents, threshold=0.4)
    assert any(set(g) == {1, 2} for g in groups)
    # the unrelated one isn't dragged into a group
    assert all(3 not in g for g in groups)


@pytest.mark.asyncio
async def test_merge_tasks_sets_merged_into_and_history(db_session):
    t1 = Task(user_id=1, title="call dentist", status="todo")
    t2 = Task(user_id=1, title="call the dentist office", status="todo")
    db_session.add_all([t1, t2])
    await db_session.commit()
    await db_session.refresh(t1)
    await db_session.refresh(t2)

    result = await merge_tasks(db_session, t1.id, [t2.id])
    assert result["merged_ids"] == [t2.id]
    await db_session.refresh(t2)
    await db_session.refresh(t1)
    assert t2.merged_into_id == t1.id  # AC6
    assert t1.merge_history and str(t2.id) in t1.merge_history


def test_merge_suggestions_endpoint_shape(api_client):
    resp = api_client.post("/api/merge/suggestions")
    assert resp.status_code == 200
    body = resp.json()
    assert "suggestions" in body and isinstance(body["suggestions"], list)


def test_merge_execute_endpoint(api_client):
    a = api_client.post("/api/tasks", json={"title": "dup alpha bravo", "status": "todo"}).json()
    b = api_client.post("/api/tasks", json={"title": "dup alpha charlie", "status": "todo"}).json()
    ex = api_client.post(
        "/api/merge/execute",
        json={"merge_type": "task", "entity_ids": [a["id"], b["id"]]},
    )
    assert ex.status_code == 200, ex.text
    assert ex.json()["ok"] is True
    assert b["id"] in ex.json()["merged_ids"]
