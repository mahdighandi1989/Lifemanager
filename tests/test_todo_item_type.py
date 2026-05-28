"""TodoItem.type field round-trip (audit task 2165524b ACs 1, 2, 5, 6)."""
from __future__ import annotations


def test_create_todo_item_with_type_returns_it(api_client):
    resp = api_client.post(
        "/api/todo-items",
        json={"content": "buy milk", "type": "shopping"},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["type"] == "shopping"


def test_create_todo_item_default_type_is_task(api_client):
    """AC 1 — default value 'task' when omitted from the payload."""
    resp = api_client.post("/api/todo-items", json={"content": "default-type"})
    assert resp.status_code == 201, resp.text
    assert resp.json()["type"] == "task"


def test_get_todo_item_includes_type(api_client):
    created = api_client.post(
        "/api/todo-items", json={"content": "errand", "type": "errand"}
    ).json()
    fetched = api_client.get(f"/api/todo-items/{created['id']}").json()
    assert fetched["type"] == "errand"


def test_todo_item_model_has_type_column():
    """AC 1 — column exists at the SQLAlchemy level."""
    from app.models.todo_item import TodoItem

    columns = {c.name: c for c in TodoItem.__table__.columns}
    assert "type" in columns
    type_col = columns["type"]
    assert type_col.type.length == 32  # String(32)


def test_todo_item_create_schema_has_type_field():
    from app.schemas.todo_item_schema import TodoItemCreate, TodoItemOut

    assert "type" in TodoItemCreate.model_fields
    assert "type" in TodoItemOut.model_fields
    # Default value must be 'task' (AC 1).
    assert TodoItemCreate.model_fields["type"].default == "task"
