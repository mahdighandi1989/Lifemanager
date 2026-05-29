"""Per-user scoping / cross-tenant isolation (audit task task_78c0e8e0a9b5).

The list/project/todo-item READ endpoints used to ignore the caller's user_id
(projects returned EVERY user's rows; lists/todo-items computed user_id but
never passed it to the service). These pin that data is now scoped to the
caller — while the login-bypass anon scope (user 0) keeps working.
"""
from __future__ import annotations

import pytest

from app.dependencies.auth import get_optional_user_id
from app.main import app


def _as_user(uid: int):
    app.dependency_overrides[get_optional_user_id] = lambda: uid


def test_projects_isolated_between_users(api_client):
    _as_user(1)
    api_client.post("/api/projects/", json={"name": "u1-only"})
    _as_user(2)
    api_client.post("/api/projects/", json={"name": "u2-only"})
    names2 = [p["name"] for p in api_client.get("/api/projects/").json()]
    assert "u2-only" in names2 and "u1-only" not in names2  # no cross-tenant leak
    _as_user(1)
    names1 = [p["name"] for p in api_client.get("/api/projects/").json()]
    assert "u1-only" in names1 and "u2-only" not in names1
    app.dependency_overrides.pop(get_optional_user_id, None)


def test_project_get_update_delete_scoped(api_client):
    _as_user(11)
    pid = api_client.post("/api/projects/", json={"name": "mine"}).json()["id"]
    _as_user(22)
    assert api_client.get(f"/api/projects/{pid}").status_code == 404  # not yours
    assert api_client.put(f"/api/projects/{pid}", json={"name": "x"}).status_code == 404
    assert api_client.delete(f"/api/projects/{pid}").status_code == 404
    _as_user(11)
    assert api_client.get(f"/api/projects/{pid}").status_code == 200  # owner sees it
    app.dependency_overrides.pop(get_optional_user_id, None)


@pytest.mark.asyncio
async def test_list_service_scopes_by_user(db_session):
    from app.models.todo_list import TodoList
    from app.services import list_service

    db_session.add_all([
        TodoList(name="a-list", user_id=100),
        TodoList(name="b-list", user_id=200),
    ])
    await db_session.commit()
    a = await list_service.list_lists(db_session, user_id=100)
    names = {l.name for l in a}
    assert "a-list" in names and "b-list" not in names


@pytest.mark.asyncio
async def test_todo_item_service_scopes_by_list_owner(db_session):
    from app.models.todo_list import TodoList, todo_list_items
    from app.models.todo_item import TodoItem
    from app.services import todo_item_service

    la = TodoList(name="la", user_id=300)
    lb = TodoList(name="lb", user_id=400)
    ia = TodoItem(content="item-a")
    ib = TodoItem(content="item-b")
    db_session.add_all([la, lb, ia, ib])
    await db_session.commit()
    await db_session.execute(
        todo_list_items.insert().values(todo_list_id=la.id, todo_item_id=ia.id, position=0)
    )
    await db_session.execute(
        todo_list_items.insert().values(todo_list_id=lb.id, todo_item_id=ib.id, position=0)
    )
    await db_session.commit()

    items = await todo_item_service.list_items(db_session, user_id=300)
    contents = {i.content for i in items}
    assert "item-a" in contents and "item-b" not in contents
