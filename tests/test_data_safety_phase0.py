"""Data-safety phase 0 (2026-07-20): trash, undo snapshots, write gates.

Owner directive: «نه کم بشه نه دستکاری بشه». Covers:
  * DELETE on todo items / writings soft-deletes into /api/trash
  * restore + purge round trips (purge refuses live rows)
  * subitems travel with their parent through trash/restore
  * payload_before undo snapshots on update/delete
  * due_date passthrough on both item-creation endpoints (audit #13)
  * REQUIRE_AUTH=true turns anonymous mutations into 401 while reads
    keep working (dual-path per CLAUDE.md rule 3)
  * REGISTER_INVITE_CODE gate on /register
  * html-escape sanitizer is idempotent (no &amp;amp; creep)

Backed by the in-memory SQLite fixture in conftest.py.
"""
from __future__ import annotations

import pytest

from app.config import settings


# --- trash: todo items ------------------------------------------------------


@pytest.mark.asyncio
async def test_deleted_item_goes_to_trash_and_restores(api_client):
    r = api_client.post("/api/lists", json={"name": "لیست آزمایشی"})
    list_id = r.json()["id"]
    r = api_client.post(
        "/api/todo-items",
        json={"content": "آیتم ارزشمند قدیمی", "list_ids": [list_id]},
    )
    item_id = r.json()["id"]

    # DELETE is now a soft delete.
    assert api_client.delete(f"/api/todo-items/{item_id}").status_code == 204
    # Gone from the normal surfaces…
    assert all(
        it["id"] != item_id
        for it in api_client.get("/api/todo-items").json()
    )
    assert api_client.get(f"/api/todo-items/{item_id}").status_code in (404, 500)
    assert api_client.get(f"/api/lists/{list_id}").json()["items"] == []
    # …but present in the trash.
    trash = api_client.get("/api/trash").json()
    assert any(it["id"] == item_id for it in trash["items"])

    # Restore puts it back into its original list.
    r = api_client.post(f"/api/trash/todo-items/{item_id}/restore")
    assert r.status_code == 200, r.text
    items = api_client.get(f"/api/lists/{list_id}").json()["items"]
    assert [it["id"] for it in items] == [item_id]
    assert not api_client.get("/api/trash").json()["items"]


@pytest.mark.asyncio
async def test_purge_requires_trash_then_hard_deletes(api_client):
    r = api_client.post("/api/todo-items", json={"content": "purge me"})
    item_id = r.json()["id"]
    # Purging a live item is refused.
    assert api_client.delete(f"/api/trash/todo-items/{item_id}").status_code == 409
    api_client.delete(f"/api/todo-items/{item_id}")
    assert api_client.delete(f"/api/trash/todo-items/{item_id}").status_code == 204
    assert not api_client.get("/api/trash").json()["items"]


@pytest.mark.asyncio
async def test_subitems_travel_with_parent_through_trash(api_client):
    parent = api_client.post("/api/todo-items", json={"content": "والد"}).json()
    child = api_client.post(
        "/api/todo-items",
        json={"content": "فرزند", "parent_id": parent["id"]},
    ).json()
    api_client.delete(f"/api/todo-items/{parent['id']}")
    trashed_ids = {it["id"] for it in api_client.get("/api/trash").json()["items"]}
    assert {parent["id"], child["id"]} <= trashed_ids
    api_client.post(f"/api/trash/todo-items/{parent['id']}/restore")
    live_ids = {it["id"] for it in api_client.get("/api/todo-items").json()}
    assert {parent["id"], child["id"]} <= live_ids


# --- trash: writings --------------------------------------------------------


@pytest.mark.asyncio
async def test_deleted_writing_goes_to_trash_and_restores(api_client):
    r = api_client.post(
        "/api/writings",
        json={"title": "نوشتهٔ مهم", "body": "سال‌ها خاطره" * 10},
    )
    wid = r.json()["id"]
    assert api_client.delete(f"/api/writings/{wid}").status_code == 204
    assert api_client.get(f"/api/writings/{wid}").status_code == 404
    trash = api_client.get("/api/trash").json()
    assert any(w["id"] == wid for w in trash["writings"])
    assert api_client.post(f"/api/trash/writings/{wid}/restore").status_code == 200
    got = api_client.get(f"/api/writings/{wid}")
    assert got.status_code == 200 and got.json()["title"] == "نوشتهٔ مهم"
    # Purge for real afterwards.
    api_client.delete(f"/api/writings/{wid}")
    assert api_client.delete(f"/api/trash/writings/{wid}").status_code == 204
    assert not api_client.get("/api/trash").json()["writings"]


# --- payload_before undo snapshots -----------------------------------------


@pytest.mark.asyncio
async def test_update_and_delete_record_payload_before(api_client):
    r = api_client.post("/api/todo-items", json={"content": "نسخهٔ اول"})
    item_id = r.json()["id"]
    api_client.put(f"/api/todo-items/{item_id}", json={"content": "نسخهٔ دوم"})
    api_client.delete(f"/api/todo-items/{item_id}")

    logs = api_client.get("/api/activity-log", params={"limit": 50}).json()
    rows = logs.get("entries") or logs.get("items") or logs
    snaps = [
        e for e in rows
        if e.get("entity_type") == "todo_item"
        and str(e.get("entity_id")) == str(item_id)
        and e.get("payload_before")
    ]
    assert snaps, "update/delete must snapshot the previous content"
    assert any("نسخهٔ اول" in (e.get("payload_before") or "") for e in snaps)


# --- due_date passthrough (audit #13) ---------------------------------------


@pytest.mark.asyncio
async def test_due_date_passes_through_both_create_paths(api_client):
    r = api_client.post(
        "/api/todo-items", json={"content": "با موعد", "due_date": "2026-08-01"}
    )
    assert r.json()["due_date"] == "2026-08-01"

    lst = api_client.post("/api/lists", json={"name": "موعددارها"}).json()
    r = api_client.post(
        f"/api/lists/{lst['id']}/items",
        json={"content": "از مسیر لیست", "due_date": "2026-08-02"},
    )
    assert r.status_code == 201, r.text
    assert r.json()["due_date"] == "2026-08-02"


# --- REQUIRE_AUTH dual-path -------------------------------------------------


@pytest.mark.asyncio
async def test_require_auth_blocks_anon_writes_keeps_reads(api_client, monkeypatch):
    monkeypatch.setattr(settings, "REQUIRE_AUTH", True)
    # Reads stay lenient (dashboard keeps working).
    assert api_client.get("/api/todo-items").status_code == 200
    assert api_client.get("/api/writings").status_code == 200
    # Anonymous mutations are refused.
    assert api_client.post("/api/todo-items", json={"content": "x"}).status_code == 401
    assert api_client.post("/api/lists", json={"name": "x"}).status_code == 401
    assert api_client.post(
        "/api/writings", json={"title": "x", "body": "y"}
    ).status_code == 401


# --- register invite gate ---------------------------------------------------


@pytest.mark.asyncio
async def test_register_invite_gate(api_client, monkeypatch):
    monkeypatch.setattr(settings, "REGISTER_INVITE_CODE", "sesame")
    bad = api_client.post(
        "/auth/register",
        json={"email": "a@b.com", "password": "longenough1", "username": "a"},
    )
    assert bad.status_code == 403
    ok = api_client.post(
        "/auth/register",
        json={
            "email": "a@b.com", "password": "longenough1",
            "username": "a", "invite_code": "sesame",
        },
    )
    assert ok.status_code == 201, ok.text


# --- idempotent sanitizer ---------------------------------------------------


@pytest.mark.asyncio
async def test_html_escape_does_not_accumulate(api_client):
    content = 'متن با & و <تگ> و "نقل"'
    r = api_client.post("/api/todo-items", json={"content": content})
    item_id = r.json()["id"]
    first = r.json()["content"]
    # Round-trip the stored (escaped) content back through an update —
    # this used to double-escape (&amp;amp;…).
    r2 = api_client.put(f"/api/todo-items/{item_id}", json={"content": first})
    assert r2.json()["content"] == first


# --- owner actions queue ----------------------------------------------------


@pytest.mark.asyncio
async def test_owner_actions_endpoint(api_client):
    r = api_client.get("/api/settings/owner-actions")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True
    keys = {a["key"] for a in body["actions"]}
    assert {
        "telegram_token", "google_connection", "oauth_consent_published",
        "require_auth", "register_invite", "backup_fresh", "keepalive",
    } <= keys
    # Every action carries a Persian how-to.
    assert all(a["how"] for a in body["actions"])
