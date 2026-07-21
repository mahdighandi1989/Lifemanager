"""Test-junk finder — scan finds leftover test rows; remove is reversible.

Owner: «چرا هنوز آشغالِ تستی توش می‌بینم». Removal uses each table's soft-delete
marker so nothing is truly lost.
"""
import pytest
from sqlalchemy import select

from app.models.project import Project
from app.models.task import Task, TaskStatus
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList
from app.services import cleanup_service


@pytest.mark.asyncio
async def test_scan_flags_test_rows_only(db_session):
    db_session.add_all([
        Task(title="test task", user_id=0, status=TaskStatus.TODO),
        Task(title="خرید نان", user_id=0, status=TaskStatus.TODO),  # real → ignored
        Project(name="test project", user_id=0, is_active=True),
        Project(name="مهاجرت", user_id=0, is_active=True),           # real → ignored
        TodoList(name="لیستِ تستی", user_id=0),
        TodoItem(content="sample item", owner_id=0),
        TodoItem(content="تماس با علی", owner_id=0),                 # real → ignored
    ])
    await db_session.commit()

    found = await cleanup_service.scan_test_junk(db_session, user_id=0)
    labels = {(f["kind"], f["label"]) for f in found}
    assert ("task", "test task") in labels
    assert ("project", "test project") in labels
    assert ("list", "لیستِ تستی") in labels
    assert ("todo", "sample item") in labels
    # real rows are NOT flagged
    assert not any(f["label"] in ("خرید نان", "مهاجرت", "تماس با علی") for f in found)
    assert all(f["reversible"] for f in found)  # these 4 kinds are reversible


@pytest.mark.asyncio
async def test_remove_is_reversible_soft_delete(db_session):
    t = Task(title="test", user_id=0, status=TaskStatus.TODO)
    p = Project(name="test", user_id=0, is_active=True)
    lst = TodoList(name="test", user_id=0)
    it = TodoItem(content="test", owner_id=0)
    db_session.add_all([t, p, lst, it])
    await db_session.commit()

    removed = await cleanup_service.remove_test_junk(
        db_session, 0,
        [{"kind": "task", "id": t.id}, {"kind": "project", "id": p.id},
         {"kind": "list", "id": lst.id}, {"kind": "todo", "id": it.id}],
    )
    assert removed == {"task": 1, "project": 1, "list": 1, "todo": 1, "subscription": 0}

    # each was soft-marked, not destroyed — the rows still exist and can be undone
    await db_session.refresh(t); await db_session.refresh(p)
    await db_session.refresh(lst); await db_session.refresh(it)
    assert t.status == TaskStatus.CANCELLED
    assert p.is_active is False
    assert lst.is_archived is True
    assert it.deleted_at is not None

    # a rescan no longer surfaces them (they're filtered as removed)
    found = await cleanup_service.scan_test_junk(db_session, user_id=0)
    assert found == []


def test_scan_endpoint(api_client):
    r = api_client.get("/api/cleanup/test-junk")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True and "items" in body
