"""میز فرمان «امروز من» — GET /api/command-center/today.

The Dashboard's one-call aggregate: task buckets (overdue / today /
upcoming ≤7d), due + starred todo items, unread notifications, pending
inbox captures, and the legacy stat counters — each scoped like its home
router.
"""
import asyncio
from datetime import date, timedelta

from sqlalchemy import text as _sql_text


def _today(client):
    r = client.get("/api/command-center/today")
    assert r.status_code == 200, r.text
    return r.json()


def _run_sql(statement):
    from app.database import get_db
    from app.main import app as _app

    override = _app.dependency_overrides[get_db]

    async def _go():
        agen = override()
        session = await agen.__anext__()
        try:
            await session.execute(_sql_text(statement))
            await session.commit()
        finally:
            await agen.aclose()

    asyncio.run(_go())


def test_empty_db_returns_complete_zeroed_structure(api_client):
    data = _today(api_client)
    assert data["ok"] is True and data["success"] is True
    assert data["tasks"]["overdue"] == []
    assert data["tasks"]["open_count"] == 0
    assert data["todo"] == {"due": [], "starred": []}
    assert data["notifications"]["unread_count"] == 0
    assert data["inbox"]["pending_count"] == 0
    assert data["stats"] == {"tasks_total": 0, "tasks_done": 0, "projects_total": 0}


def test_task_buckets_by_due_date(api_client):
    today = date.today()
    mk = lambda title, d: api_client.post(  # noqa: E731
        "/api/tasks/", json={"title": title, "due_date": d.isoformat()}
    )
    assert mk("دیرشده", today - timedelta(days=2)).status_code == 201
    assert mk("امروزی", today).status_code == 201
    assert mk("پیش‌رو", today + timedelta(days=3)).status_code == 201
    assert mk("دوردست", today + timedelta(days=30)).status_code == 201
    # No due date → open-count only; done → excluded everywhere.
    assert api_client.post("/api/tasks/", json={"title": "بی‌موعد"}).status_code == 201
    r = api_client.post("/api/tasks/", json={"title": "تمام‌شده", "due_date": today.isoformat()})
    assert api_client.put(
        f"/api/tasks/{r.json()['id']}", json={"status": "completed"}
    ).status_code == 200

    data = _today(api_client)
    assert [t["title"] for t in data["tasks"]["overdue"]] == ["دیرشده"]
    assert [t["title"] for t in data["tasks"]["due_today"]] == ["امروزی"]
    assert [t["title"] for t in data["tasks"]["upcoming"]] == ["پیش‌رو"]
    assert data["tasks"]["open_count"] == 5  # همه جز تمام‌شده
    assert data["stats"]["tasks_total"] == 6
    assert data["stats"]["tasks_done"] == 1


def test_todo_due_and_starred_buckets(api_client):
    r = api_client.post(
        "/api/todo-items", json={"content": "آیتم ستاره‌دار", "is_starred": True}
    )
    assert r.status_code == 201
    r = api_client.post("/api/todo-items", json={"content": "آیتم موعددار"})
    assert r.status_code == 201
    due_id = r.json()["id"]
    _run_sql(
        f"UPDATE todo_items SET due_date = '{date.today().isoformat()}' WHERE id = {due_id}"
    )
    # Completed rows never surface.
    r = api_client.post(
        "/api/todo-items", json={"content": "تمام‌شده", "is_starred": True, "is_completed": True}
    )
    assert r.status_code == 201

    data = _today(api_client)
    assert [i["content"] for i in data["todo"]["due"]] == ["آیتم موعددار"]
    assert [i["content"] for i in data["todo"]["starred"]] == ["آیتم ستاره‌دار"]


def test_inbox_and_notification_buckets(api_client):
    assert (
        api_client.post("/api/inbox", json={"content": "باید فکری بکنم"}).status_code
        == 201
    )
    _run_sql(
        "INSERT INTO notifications (user_id, type, title, message, is_read, status) "
        "VALUES (0, 'SYSTEM', 'هشدار آزمایشی', 'متن هشدار', 0, 'sent')"
    )
    data = _today(api_client)
    assert data["inbox"]["pending_count"] == 1
    assert data["inbox"]["latest"][0]["suggested_type"] == "task"
    assert data["notifications"]["unread_count"] == 1
    assert data["notifications"]["latest"][0]["title"] == "هشدار آزمایشی"


def test_cross_user_rows_excluded(api_client):
    assert api_client.post("/api/tasks/", json={"title": "مال من"}).status_code == 201
    r = api_client.post(
        "/api/tasks/", json={"title": "خارجی", "due_date": date.today().isoformat()}
    )
    assert r.status_code == 201
    _run_sql(f"UPDATE tasks SET user_id = 42 WHERE id = {r.json()['id']}")

    data = _today(api_client)
    assert all(t["title"] != "خارجی" for t in data["tasks"]["due_today"])
    assert data["tasks"]["open_count"] == 1
