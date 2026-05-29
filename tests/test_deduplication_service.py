"""DeduplicationService + /api/deduplication (audit task fbd9bd36).

Covers scan_for_duplicates across Task/Project/List (AC1), the scan + merge
endpoints (AC2/AC3), and merge's move-content + soft-delete semantics — no
hard delete, no summarization (the user's explicit constraint).
"""
from __future__ import annotations

import pytest
from sqlalchemy import select


# ── scan_for_duplicates (AC1) ────────────────────────────────────────

@pytest.mark.asyncio
async def test_scan_finds_similar_tasks(db_session):
    from app.models.task import Task
    from app.services.deduplication_service import DeduplicationService

    db_session.add_all(
        [
            Task(user_id=0, title="Buy milk from the store", status="todo"),
            Task(user_id=0, title="Buy milk at the store", status="todo"),
            Task(user_id=0, title="xyzzy unrelated thing", status="todo"),
        ]
    )
    await db_session.commit()

    groups = await DeduplicationService(db_session).scan_for_duplicates(user_id=0)
    task_groups = [g for g in groups if g["entity_type"] == "task"]
    assert task_groups
    assert any(len(g["entity_ids"]) >= 2 for g in task_groups)
    assert all("items" in g for g in task_groups)


@pytest.mark.asyncio
async def test_scan_covers_projects_and_lists(db_session):
    from app.models.project import Project
    from app.models.todo_list import TodoList
    from app.services.deduplication_service import DeduplicationService

    db_session.add_all(
        [
            Project(user_id=0, name="Marketing plan 2026"),
            Project(user_id=0, name="Marketing plan for 2026"),
            TodoList(user_id=0, name="Groceries weekly"),
            TodoList(user_id=0, name="Groceries weekly list"),
        ]
    )
    await db_session.commit()

    groups = await DeduplicationService(db_session).scan_for_duplicates(user_id=0)
    types = {g["entity_type"] for g in groups}
    assert "project" in types
    assert "list" in types


# ── merge: move content + soft-delete (AC3) ──────────────────────────

@pytest.mark.asyncio
async def test_merge_task_soft_deletes_source(db_session):
    from app.models.task import Task
    from app.services.deduplication_service import DeduplicationService

    a = Task(user_id=0, title="dup A", status="todo")
    b = Task(user_id=0, title="dup B", status="todo")
    db_session.add_all([a, b])
    await db_session.commit()
    await db_session.refresh(a)
    await db_session.refresh(b)

    out = await DeduplicationService(db_session).merge(
        source_id=a.id, target_id=b.id, entity_type="task"
    )
    assert out["ok"] is True
    await db_session.refresh(a)
    assert a.merged_into_id == b.id


@pytest.mark.asyncio
async def test_merge_project_reassigns_tasks_and_soft_deletes(db_session):
    from app.models.project import Project
    from app.models.task import Task
    from app.services.deduplication_service import DeduplicationService

    p1 = Project(user_id=0, name="Proj A")
    p2 = Project(user_id=0, name="Proj B")
    db_session.add_all([p1, p2])
    await db_session.commit()
    await db_session.refresh(p1)
    await db_session.refresh(p2)
    t = Task(user_id=0, title="t in p1", status="todo", project_id=p1.id)
    db_session.add(t)
    await db_session.commit()
    await db_session.refresh(t)

    out = await DeduplicationService(db_session).merge(
        source_id=p1.id, target_id=p2.id, entity_type="project"
    )
    assert out["ok"] is True
    await db_session.refresh(t)
    await db_session.refresh(p1)
    assert t.project_id == p2.id  # content moved
    assert p1.is_active is False  # source soft-deleted


@pytest.mark.asyncio
async def test_merge_list_archives_source(db_session):
    from app.models.todo_list import TodoList
    from app.services.deduplication_service import DeduplicationService

    l1 = TodoList(user_id=0, name="List A")
    l2 = TodoList(user_id=0, name="List B")
    db_session.add_all([l1, l2])
    await db_session.commit()
    await db_session.refresh(l1)
    await db_session.refresh(l2)

    out = await DeduplicationService(db_session).merge(
        source_id=l1.id, target_id=l2.id, entity_type="list"
    )
    assert out["ok"] is True
    await db_session.refresh(l1)
    assert l1.is_archived is True


@pytest.mark.asyncio
async def test_merge_same_source_target_rejected(db_session):
    from app.services.deduplication_service import DeduplicationService

    out = await DeduplicationService(db_session).merge(
        source_id=5, target_id=5, entity_type="task"
    )
    assert out["ok"] is False


# ── Endpoints (AC2, AC3) ─────────────────────────────────────────────

def test_scan_endpoint_returns_job_id(api_client):
    r = api_client.post("/api/deduplication/scan")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "job_id" in body and body["status"] == "completed"
    assert "group_count" in body


def test_merge_endpoint_merges_tasks(api_client):
    a = api_client.post("/api/tasks", json={"title": "duplicate one"}).json()
    b = api_client.post("/api/tasks", json={"title": "duplicate two"}).json()
    r = api_client.post(
        "/api/deduplication/merge",
        json={"source_id": a["id"], "target_id": b["id"], "entity_type": "task"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["ok"] is True


def test_groups_endpoint_returns_list(api_client):
    r = api_client.get("/api/deduplication/groups")
    assert r.status_code == 200, r.text
    assert isinstance(r.json()["groups"], list)
