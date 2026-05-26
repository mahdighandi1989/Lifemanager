"""End-to-end tests for the Todo-list system.

Covers the full lifecycle:
  * CRUD on TodoList (`/api/lists`)
  * CRUD on TodoItem (`/api/todo-items`)
  * Toggle complete / star
  * Share / Unshare across lists
  * Atomic Move from one list to another
  * Nested list-items endpoint

Backed by the in-memory SQLite fixture in conftest.py — every test
runs in a fresh DB so there's no cross-test bleed.
"""
from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_list_crud_round_trip(api_client):
    # CREATE
    r = api_client.post("/api/lists", json={"name": "Important", "description": "top"})
    assert r.status_code == 201, r.text
    list_id = r.json()["id"]
    assert r.json()["name"] == "Important"
    assert r.json()["is_archived"] is False
    assert r.json()["item_count"] == 0

    # LIST
    r = api_client.get("/api/lists")
    assert r.status_code == 200
    assert any(item["id"] == list_id for item in r.json())

    # GET ONE (with items)
    r = api_client.get(f"/api/lists/{list_id}")
    assert r.status_code == 200
    assert r.json()["items"] == []

    # UPDATE
    r = api_client.put(f"/api/lists/{list_id}", json={"name": "Important!"})
    assert r.status_code == 200
    assert r.json()["name"] == "Important!"

    # DELETE
    r = api_client.delete(f"/api/lists/{list_id}")
    assert r.status_code == 204
    r = api_client.get(f"/api/lists/{list_id}")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_item_crud_round_trip(api_client):
    r = api_client.post("/api/lists", json={"name": "Tasks"})
    list_id = r.json()["id"]

    r = api_client.post(
        "/api/todo-items",
        json={"content": "Buy milk", "list_ids": [list_id]},
    )
    assert r.status_code == 201, r.text
    item = r.json()
    assert item["content"] == "Buy milk"
    assert item["is_completed"] is False
    assert item["is_starred"] is False
    assert list_id in item["list_ids"]

    item_id = item["id"]
    r = api_client.patch(
        f"/api/todo-items/{item_id}",
        json={"description": "Whole, organic"},
    )
    assert r.status_code == 200
    assert r.json()["description"] == "Whole, organic"

    r = api_client.delete(f"/api/todo-items/{item_id}")
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_toggle_complete_and_star(api_client):
    r = api_client.post("/api/lists", json={"name": "L"})
    list_id = r.json()["id"]
    r = api_client.post("/api/todo-items", json={"content": "x", "list_ids": [list_id]})
    item_id = r.json()["id"]

    r = api_client.post(f"/api/todo-items/{item_id}/toggle-complete")
    assert r.status_code == 200
    assert r.json()["is_completed"] is True
    assert r.json()["completed_at"] is not None

    r = api_client.post(f"/api/todo-items/{item_id}/toggle-complete")
    assert r.json()["is_completed"] is False
    assert r.json()["completed_at"] is None

    r = api_client.post(f"/api/todo-items/{item_id}/toggle-star")
    assert r.json()["is_starred"] is True
    r = api_client.post(f"/api/todo-items/{item_id}/toggle-star")
    assert r.json()["is_starred"] is False


@pytest.mark.asyncio
async def test_share_unshare_move(api_client):
    """Items can live in multiple lists and be moved between them."""
    r = api_client.post("/api/lists", json={"name": "Important"})
    important = r.json()["id"]
    r = api_client.post("/api/lists", json={"name": "Tasks"})
    tasks = r.json()["id"]
    r = api_client.post("/api/lists", json={"name": "خودسازی"})
    self_growth = r.json()["id"]

    # create item in Important
    r = api_client.post(
        "/api/todo-items",
        json={"content": "Read 10 pages", "list_ids": [important]},
    )
    item_id = r.json()["id"]
    assert r.json()["list_ids"] == [important]

    # share into Tasks + خودسازی
    r = api_client.post(
        f"/api/todo-items/{item_id}/share",
        json={"list_ids": [tasks, self_growth]},
    )
    assert r.status_code == 200
    assert set(r.json()["list_ids"]) == {important, tasks, self_growth}

    # sharing again is idempotent (no 409)
    r = api_client.post(
        f"/api/todo-items/{item_id}/share",
        json={"list_ids": [tasks]},
    )
    assert r.status_code == 200
    assert set(r.json()["list_ids"]) == {important, tasks, self_growth}

    # unshare from Tasks
    r = api_client.post(
        f"/api/todo-items/{item_id}/unshare",
        json={"list_ids": [tasks]},
    )
    assert r.status_code == 200
    assert set(r.json()["list_ids"]) == {important, self_growth}

    # move from خودسازی to Tasks
    r = api_client.post(
        f"/api/todo-items/{item_id}/move",
        json={"from_list_id": self_growth, "to_list_id": tasks},
    )
    assert r.status_code == 200
    assert set(r.json()["list_ids"]) == {important, tasks}

    # underlying item still exists (move ≠ delete)
    r = api_client.get(f"/api/todo-items/{item_id}")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_nested_list_items_endpoint(api_client):
    r = api_client.post("/api/lists", json={"name": "Shopping"})
    list_id = r.json()["id"]

    r = api_client.post(f"/api/lists/{list_id}/items", json={"content": "eggs"})
    assert r.status_code == 201
    assert r.json()["list_ids"] == [list_id]

    r = api_client.post(f"/api/lists/{list_id}/items", json={"content": "bread"})
    assert r.status_code == 201

    r = api_client.get(f"/api/lists/{list_id}/items")
    assert r.status_code == 200
    contents = {it["content"] for it in r.json()}
    assert contents == {"eggs", "bread"}


@pytest.mark.asyncio
async def test_list_filters(api_client):
    r = api_client.post("/api/lists", json={"name": "Mixed"})
    list_id = r.json()["id"]

    api_client.post(
        "/api/todo-items",
        json={"content": "done", "list_ids": [list_id], "is_completed": True},
    )
    api_client.post(
        "/api/todo-items",
        json={"content": "star", "list_ids": [list_id], "is_starred": True},
    )
    api_client.post("/api/todo-items", json={"content": "plain", "list_ids": [list_id]})

    r = api_client.get("/api/todo-items", params={"list_id": list_id, "completed": "true"})
    assert {it["content"] for it in r.json()} == {"done"}

    r = api_client.get("/api/todo-items", params={"list_id": list_id, "starred_only": "true"})
    assert {it["content"] for it in r.json()} == {"star"}


@pytest.mark.asyncio
async def test_archive_excludes_from_default_listing(api_client):
    r = api_client.post("/api/lists", json={"name": "Old"})
    list_id = r.json()["id"]
    api_client.patch(f"/api/lists/{list_id}", json={"is_archived": True})

    r = api_client.get("/api/lists")
    assert not any(item["id"] == list_id for item in r.json())

    r = api_client.get("/api/lists", params={"include_archived": "true"})
    assert any(item["id"] == list_id for item in r.json())


@pytest.mark.asyncio
async def test_404_on_missing_list_or_item(api_client):
    assert api_client.get("/api/lists/9999").status_code == 404
    assert api_client.get("/api/todo-items/9999").status_code == 404
    assert api_client.delete("/api/lists/9999").status_code == 404
    assert api_client.delete("/api/todo-items/9999").status_code == 404
