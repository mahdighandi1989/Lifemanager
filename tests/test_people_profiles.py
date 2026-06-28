"""/api/people-profiles aliases + analyze endpoint (audit task 3cc09436, AC4/5/6)."""


def test_people_profiles_list_alias(api_client):
    """GET /api/people-profiles returns a list (alias of /api/persons)."""
    resp = api_client.get("/api/people-profiles")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_create_and_analyze_people_profile(api_client):
    """POST creates a profile (201); POST /{id}/analyze returns ai_score +
    relationship_type (AC6)."""
    created = api_client.post("/api/people-profiles", json={"name": "Ali"})
    assert created.status_code == 201, created.text
    pid = created.json()["id"]

    analyzed = api_client.post(f"/api/people-profiles/{pid}/analyze")
    assert analyzed.status_code == 200, analyzed.text
    body = analyzed.json()
    assert "ai_score" in body and "relationship_type" in body
    assert body["relationship_type"] in {"close", "regular", "distant"}


def test_analyze_unknown_person_404(api_client):
    resp = api_client.post("/api/people-profiles/999999/analyze")
    assert resp.status_code == 404


def test_people_profiles_summary_includes_score_and_relationship(api_client):
    """GET /api/people-profiles/summary joins each person with their profile so
    the list can show ai_score + relationship_type at a glance. A person with no
    profile yet appears with null score; recording a deed surfaces a real one."""
    created = api_client.post("/api/people-profiles", json={"name": "Reza"})
    pid = created.json()["id"]

    summary = api_client.get("/api/people-profiles/summary")
    assert summary.status_code == 200, summary.text
    rows = summary.json()
    assert isinstance(rows, list)
    me = next(r for r in rows if r["id"] == pid)
    # contract: the summary row carries the profile fields (null before any data)
    assert set(me) >= {"id", "name", "ai_score", "relationship_type"}
    assert me["ai_score"] is None and me["relationship_type"] is None

    # record a good deed → the profile now has a score the list will show
    deed = api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "good", "note": "lent money"})
    assert deed.status_code == 200, deed.text

    after = api_client.get("/api/people-profiles/summary").json()
    me2 = next(r for r in after if r["id"] == pid)
    assert me2["ai_score"] is not None
    assert me2["relationship_type"] in {"close", "regular", "distant", "strained", "neutral"}


def test_link_persons_to_task(api_client):
    """AC8 backend: POST /api/tasks/{id}/persons links people via person_tasks,
    idempotently."""
    person = api_client.post("/api/people-profiles", json={"name": "Sara"})
    pid = person.json()["id"]
    task = api_client.post("/api/tasks", json={"title": "call Sara", "status": "todo"})
    assert task.status_code in (200, 201), task.text
    tid = task.json()["id"]

    linked = api_client.post(f"/api/tasks/{tid}/persons", json={"person_ids": [pid]})
    assert linked.status_code == 200, linked.text
    assert pid in linked.json()["linked_person_ids"]

    # idempotent — re-linking the same person is a no-op
    again = api_client.post(f"/api/tasks/{tid}/persons", json={"person_ids": [pid]})
    assert again.json()["linked_person_ids"] == []


def test_person_tasks_table_registered():
    """AC2: the person_tasks M2M association table exists on the metadata.

    Import app.models first so the association table is registered regardless
    of test order (Base.metadata only reflects imported models)."""
    import app.models  # noqa: F401 — registers every model incl. person_tasks
    from app.database import Base

    assert "person_tasks" in Base.metadata.tables
    cols = {c.name for c in Base.metadata.tables["person_tasks"].columns}
    assert {"person_id", "task_id"} <= cols
