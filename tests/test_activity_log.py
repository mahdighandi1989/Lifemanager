"""Activity-log system (لاگ فعالیت‌ها) — write hooks + read endpoints.

Covers the contract the frontend relies on:
* domain mutations (tasks/projects/lists/items/persons/writings/finance)
  each leave an ActivityLog row with the right action/entity/label;
* GET /api/activity-log — global, paginated, filterable;
* GET /api/activity-log/entity/{type}/{id} — entity OR owning-context match
  (a list's trail includes its items; a person's trail includes deeds/notes);
* GET /api/activity-log/export.csv — UTF-8-BOM CSV;
* POST /api/activity-log — SPA-originated actions.
"""


def _items(client, **params):
    r = client.get("/api/activity-log", params=params)
    assert r.status_code == 200, r.text
    return r.json()


# --- write hooks ------------------------------------------------------------


def test_task_crud_writes_activity(api_client):
    r = api_client.post("/api/tasks/", json={"title": "کار مهم"})
    assert r.status_code == 201
    task_id = r.json()["id"]

    r = api_client.put(f"/api/tasks/{task_id}", json={"title": "کار مهم‌تر"})
    assert r.status_code == 200
    r = api_client.put(f"/api/tasks/{task_id}", json={"status": "completed"})
    assert r.status_code == 200
    r = api_client.delete(f"/api/tasks/{task_id}")
    assert r.status_code == 204

    data = _items(api_client, entity_type="task")
    actions = [(e["action"], e["entity_id"]) for e in data["items"]]
    assert ("create", str(task_id)) in actions
    assert ("update", str(task_id)) in actions
    assert ("complete", str(task_id)) in actions
    assert ("delete", str(task_id)) in actions
    # The label snapshots the title at write time (create kept the old title).
    create_row = next(e for e in data["items"] if e["action"] == "create")
    assert create_row["entity_label"] == "کار مهم"
    assert create_row["entity_type"] == "task"


def test_project_and_writing_hooks(api_client):
    r = api_client.post("/api/projects/", json={"name": "پروژه الف"})
    assert r.status_code == 201
    r = api_client.post(
        "/api/writings", json={"title": "جستار اول", "body": "متن بلند"}
    )
    assert r.status_code == 201
    writing_id = r.json()["id"]
    r = api_client.delete(f"/api/writings/{writing_id}")
    assert r.status_code == 204

    all_rows = _items(api_client)
    kinds = {(e["entity_type"], e["action"]) for e in all_rows["items"]}
    assert ("project", "create") in kinds
    assert ("writing", "create") in kinds
    assert ("writing", "delete") in kinds


def test_list_trail_includes_item_events_via_context(api_client):
    r = api_client.post("/api/lists/", json={"name": "خرید هفتگی"})
    assert r.status_code == 201
    list_id = r.json()["id"]

    r = api_client.post(f"/api/lists/{list_id}/items", json={"content": "نان"})
    assert r.status_code == 201
    item_id = r.json()["id"]

    r = api_client.post(f"/api/todo-items/{item_id}/toggle-complete")
    assert r.status_code == 200

    r = api_client.get(f"/api/activity-log/entity/list/{list_id}")
    assert r.status_code == 200
    rows = r.json()["items"]
    pairs = {(e["action"], e["entity_type"]) for e in rows}
    # The list's own create + its item's create/complete — via context match.
    assert ("create", "list") in pairs
    assert ("create", "todo_item") in pairs
    assert ("complete", "todo_item") in pairs
    item_row = next(e for e in rows if e["entity_type"] == "todo_item" and e["action"] == "create")
    assert item_row["context_type"] == "list"
    assert item_row["context_id"] == str(list_id)


def test_person_trail_includes_deeds_and_notes(api_client):
    r = api_client.post("/api/persons", json={"name": "علی"})
    assert r.status_code == 201
    person_id = r.json()["id"]

    r = api_client.post(
        f"/api/people/{person_id}/profile/deed",
        json={"kind": "good", "note": "قرض داد", "important": False},
    )
    assert r.status_code == 200
    r = api_client.post(
        f"/api/people/{person_id}/profile/note", json={"user_notes": "آدم خوبی است"}
    )
    assert r.status_code == 200

    r = api_client.get(f"/api/activity-log/entity/person/{person_id}")
    assert r.status_code == 200
    rows = r.json()["items"]
    kinds = {(e["entity_type"], e["action"]) for e in rows}
    assert ("person", "create") in kinds
    assert ("deed", "create") in kinds
    assert ("person_note", "update") in kinds
    deed = next(e for e in rows if e["entity_type"] == "deed")
    assert "قرض داد" in (deed["detail"] or "")


def test_finance_transaction_context_links_account(api_client):
    r = api_client.post(
        "/api/finance/accounts",
        json={"name": "بانک ملی", "kind": "bank", "balance": "100"},
    )
    assert r.status_code == 201
    account_id = r.json()["id"]

    r = api_client.post(
        "/api/finance/transactions",
        json={"account_id": account_id, "amount": "25", "transaction_type": "expense"},
    )
    assert r.status_code == 201

    r = api_client.get(f"/api/activity-log/entity/account/{account_id}")
    assert r.status_code == 200
    rows = r.json()["items"]
    kinds = {(e["entity_type"], e["action"]) for e in rows}
    assert ("account", "create") in kinds
    assert ("transaction", "create") in kinds


# --- read endpoints ---------------------------------------------------------


def test_global_list_filters_and_pagination(api_client):
    for i in range(3):
        assert api_client.post("/api/tasks/", json={"title": f"t{i}"}).status_code == 201
    assert api_client.post("/api/projects/", json={"name": "p"}).status_code == 201

    # entity_type filter
    data = _items(api_client, entity_type="task")
    assert data["total"] == 3
    assert all(e["entity_type"] == "task" for e in data["items"])

    # comma-separated entity_type filter (hub panels)
    data = _items(api_client, entity_type="task,project")
    assert data["total"] == 4

    # action filter
    data = _items(api_client, action="delete")
    assert data["total"] == 0

    # search over the label
    data = _items(api_client, search="t1")
    assert data["total"] == 1
    assert data["items"][0]["entity_label"] == "t1"

    # pagination
    data = _items(api_client, page=1, page_size=2)
    assert data["total"] == 4
    assert len(data["items"]) == 2
    data2 = _items(api_client, page=2, page_size=2)
    assert len(data2["items"]) == 2
    assert {e["id"] for e in data["items"]}.isdisjoint({e["id"] for e in data2["items"]})

    # newest first
    ids = [e["id"] for e in _items(api_client)["items"]]
    assert ids == sorted(ids, reverse=True)


def test_date_filters(api_client):
    assert api_client.post("/api/tasks/", json={"title": "امروزی"}).status_code == 201
    assert _items(api_client, date_from="2000-01-01")["total"] >= 1
    assert _items(api_client, date_to="2000-01-01")["total"] == 0
    assert _items(api_client, date_from="2099-01-01")["total"] == 0


def test_client_side_activity_post(api_client):
    r = api_client.post(
        "/api/activity-log",
        json={
            "action": "export",
            "entity_type": "writing",
            "entity_id": "7",
            "entity_label": "جستار",
            "detail": "دانلود PDF",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["ok"] is True and body["success"] is True

    data = _items(api_client, action="export")
    assert data["total"] == 1
    assert data["items"][0]["detail"] == "دانلود PDF"


def test_csv_export(api_client):
    assert api_client.post("/api/tasks/", json={"title": "برای خروجی"}).status_code == 201
    r = api_client.get("/api/activity-log/export.csv")
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    assert "attachment" in r.headers.get("content-disposition", "")
    text = r.content.decode("utf-8-sig")
    assert text.splitlines()[0].startswith("id,created_at,user_id,action")
    assert "برای خروجی" in text


def test_entity_endpoint_scopes_to_that_entity_only(api_client):
    a = api_client.post("/api/lists/", json={"name": "لیست الف"}).json()["id"]
    b = api_client.post("/api/lists/", json={"name": "لیست ب"}).json()["id"]
    api_client.post(f"/api/lists/{a}/items", json={"content": "فقط الف"})

    rows_b = api_client.get(f"/api/activity-log/entity/list/{b}").json()["items"]
    assert all(
        (e["entity_id"] == str(b)) or (e["context_id"] == str(b)) for e in rows_b
    )
    assert not any("فقط الف" == (e["entity_label"] or "") for e in rows_b)


def test_activity_rows_are_user_scoped(api_client):
    """A row planted under another user's scope must not leak to the anon
    caller (the same _scope rule the writings router uses)."""
    assert api_client.post("/api/tasks/", json={"title": "مال من"}).status_code == 201
    # Plant a foreign-user row through the same override-aware POST seam, then
    # rewrite its owner directly — simplest way to get a cross-tenant row into
    # the per-test in-memory DB.
    assert (
        api_client.post(
            "/api/activity-log", json={"action": "create", "entity_type": "task", "entity_label": "خارجی"}
        ).status_code
        == 201
    )
    import asyncio

    from app.database import get_db
    from app.main import app as _app
    from sqlalchemy import text as _text

    override = _app.dependency_overrides[get_db]

    async def _rewrite():
        agen = override()
        session = await agen.__anext__()
        try:
            await session.execute(
                _text("UPDATE activity_logs SET user_id = 42 WHERE entity_label = 'خارجی'")
            )
            await session.commit()
        finally:
            await agen.aclose()

    asyncio.run(_rewrite())

    labels = [e["entity_label"] for e in _items(api_client)["items"]]
    assert "مال من" in labels
    assert "خارجی" not in labels
