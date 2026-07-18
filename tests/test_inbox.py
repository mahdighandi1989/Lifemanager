"""صندوق ورودی همه‌چیز (universal capture inbox) — capture / triage / file.

Covers the contract the Dashboard quick-box and the Telegram /inbox
command rely on:

* POST /api/inbox captures raw text and never loses it (triage is
  best-effort; on a keyless deploy the deterministic heuristic runs);
* POST /api/inbox/{id}/file turns the row into a real task / todo item /
  note (writing) / person — todo falls back to the auto-created
  «صندوق ورودی» list when no list matches;
* dismiss / reclassify / listing / scoping semantics.
"""
import asyncio

from sqlalchemy import text as _sql_text


def _capture(client, content, **extra):
    r = client.post("/api/inbox", json={"content": content, **extra})
    assert r.status_code == 201, r.text
    return r.json()["item"]


def _run_sql(statement):
    """Execute raw SQL through the api_client's dependency override (the
    same planting seam test_activity_log uses for cross-tenant rows)."""
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


# --- capture + triage -------------------------------------------------------


def test_capture_creates_pending_item_with_heuristic_suggestion(api_client):
    item = _capture(api_client, "فردا باید قبض برق را پرداخت کنم")
    assert item["status"] == "pending"
    # Keyless test deploy → deterministic heuristic ("باید"/"پرداخت" cues).
    assert item["suggested_type"] == "task"
    assert item["ai_model"] is None
    assert item["suggestion"]["title"]
    assert item["source"] == "web"


def test_capture_person_heuristic_and_empty_content_422(api_client):
    item = _capture(api_client, "شماره آقای رضایی 09121234567 برای کارهای برق")
    assert item["suggested_type"] == "person"
    r = api_client.post("/api/inbox", json={"content": ""})
    assert r.status_code == 422


def test_capture_writes_activity_log(api_client):
    _capture(api_client, "باید برای جلسه آماده شوم")
    r = api_client.get("/api/activity-log", params={"entity_type": "inbox_item"})
    assert r.status_code == 200
    actions = [e["action"] for e in r.json()["items"]]
    assert "create" in actions


# --- filing -----------------------------------------------------------------


def test_file_default_target_creates_task_and_marks_filed(api_client):
    item = _capture(api_client, "باید بلیت قطار بخرم")
    r = api_client.post(f"/api/inbox/{item['id']}/file")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["created"]["kind"] == "task"
    assert body["item"]["status"] == "filed"
    assert body["item"]["filed_entity_type"] == "task"
    titles = [t["title"] for t in api_client.get("/api/tasks").json()]
    assert any("بلیت قطار" in t for t in titles)
    # Double filing is refused.
    assert api_client.post(f"/api/inbox/{item['id']}/file").status_code == 409


def test_file_as_note_creates_personal_writing(api_client):
    item = _capture(api_client, "ایده: دفترچه‌ای برای جمله‌های الهام‌بخش درست کنم")
    r = api_client.post(
        f"/api/inbox/{item['id']}/file", json={"target_type": "note"}
    )
    assert r.status_code == 200, r.text
    assert r.json()["created"]["kind"] == "writing"
    rows = api_client.get("/api/writings").json()["writings"]
    assert any("الهام" in (w.get("title") or "") for w in rows)


def test_file_as_person_uses_person_name_override(api_client):
    item = _capture(api_client, "شماره آقای رضایی 09121234567")
    r = api_client.post(
        f"/api/inbox/{item['id']}/file",
        json={"target_type": "person", "person_name": "آقای رضایی"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["created"]["kind"] == "person"
    persons = api_client.get("/api/persons").json()
    rows = persons if isinstance(persons, list) else persons.get("items", [])
    assert any(p["name"] == "آقای رضایی" for p in rows)


def test_file_as_todo_falls_back_to_inbox_list_and_matches_named_list(api_client):
    # No list yet → the fallback «صندوق ورودی» list is auto-created.
    item = _capture(api_client, "نان بربری")
    r = api_client.post(f"/api/inbox/{item['id']}/file", json={"target_type": "todo"})
    assert r.status_code == 200, r.text
    created = r.json()["created"]
    assert created["kind"] == "todo_item"
    assert created["list_name"] == "صندوق ورودی"
    list_names = [row["name"] for row in api_client.get("/api/lists").json()]
    assert "صندوق ورودی" in list_names

    # A named list wins over the fallback.
    assert api_client.post("/api/lists/", json={"name": "خرید هفتگی"}).status_code == 201
    item2 = _capture(api_client, "ماست و پنیر")
    r = api_client.post(
        f"/api/inbox/{item2['id']}/file",
        json={"target_type": "todo", "list_name": "خرید هفتگی"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["created"]["list_name"] == "خرید هفتگی"


def test_file_unknown_target_422(api_client):
    item = _capture(api_client, "متن آزمایشی")
    r = api_client.post(
        f"/api/inbox/{item['id']}/file", json={"target_type": "spaceship"}
    )
    assert r.status_code == 422


# --- dismiss / reclassify ---------------------------------------------------


def test_dismiss_keeps_row_and_guards_filed_items(api_client):
    item = _capture(api_client, "این مهم نیست")
    r = api_client.post(f"/api/inbox/{item['id']}/dismiss")
    assert r.status_code == 200
    assert r.json()["item"]["status"] == "dismissed"

    filed = _capture(api_client, "باید ایمیل مهم را بفرستم")
    assert api_client.post(f"/api/inbox/{filed['id']}/file").status_code == 200
    # A filed row can't be flipped to dismissed (its entity already exists).
    assert api_client.post(f"/api/inbox/{filed['id']}/dismiss").status_code == 409


def test_reclassify_refreshes_suggestion(api_client):
    item = _capture(api_client, "باید ماشین را تعمیر کنم")
    r = api_client.post(f"/api/inbox/{item['id']}/reclassify")
    assert r.status_code == 200
    assert r.json()["item"]["status"] == "pending"
    assert r.json()["item"]["suggested_type"] == "task"


# --- listing + scoping ------------------------------------------------------


def test_list_filters_by_status_and_counts_pending(api_client):
    a = _capture(api_client, "باید کاری انجام دهم")
    _capture(api_client, "یادداشتی برای بعد")
    assert api_client.post(f"/api/inbox/{a['id']}/dismiss").status_code == 200

    data = api_client.get("/api/inbox").json()
    assert data["total"] == 2
    assert data["pending_count"] == 1
    pending = api_client.get("/api/inbox", params={"status": "pending"}).json()
    assert [i["status"] for i in pending["items"]] == ["pending"]


def test_cross_user_rows_hidden_and_404_on_mutation(api_client):
    mine = _capture(api_client, "مال خودم")
    foreign = _capture(api_client, "متن خارجی")
    _run_sql(f"UPDATE inbox_items SET user_id = 42 WHERE id = {foreign['id']}")

    contents = [i["content"] for i in api_client.get("/api/inbox").json()["items"]]
    assert any("مال خودم" in c for c in contents)
    assert not any("خارجی" in c for c in contents)
    assert api_client.post(f"/api/inbox/{foreign['id']}/dismiss").status_code == 404
    assert api_client.post(f"/api/inbox/{foreign['id']}/file").status_code == 404
    assert api_client.post(f"/api/inbox/{mine['id']}/dismiss").status_code == 200
