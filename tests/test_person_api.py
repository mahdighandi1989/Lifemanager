"""Coverage for the /api/persons CRUD surface (audit task 3cc09436)."""
from __future__ import annotations


def _create_one(client, name="Alice", email="alice@example.com"):
    resp = client.post(
        "/api/persons",
        json={"name": name, "email": email, "phone": "555-1234"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_create_person_returns_201(api_client):
    created = _create_one(api_client)
    assert created["name"] == "Alice"
    assert created["email"] == "alice@example.com"
    assert created["id"]


def test_list_persons_returns_all_for_user(api_client):
    _create_one(api_client, name="A1", email="a1@example.com")
    _create_one(api_client, name="A2", email="a2@example.com")
    resp = api_client.get("/api/persons")
    assert resp.status_code == 200
    out = resp.json()
    names = {p["name"] for p in out}
    assert {"A1", "A2"}.issubset(names)


def test_get_person_404_when_missing(api_client):
    resp = api_client.get("/api/persons/99999")
    assert resp.status_code == 404


def test_get_person_by_id(api_client):
    created = _create_one(api_client)
    resp = api_client.get(f"/api/persons/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_update_person(api_client):
    created = _create_one(api_client)
    resp = api_client.put(
        f"/api/persons/{created['id']}",
        json={"name": "Alice Updated", "phone": "555-9999"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Alice Updated"
    assert body["phone"] == "555-9999"
    # Email left untouched.
    assert body["email"] == "alice@example.com"


def test_delete_person_returns_204(api_client):
    created = _create_one(api_client)
    resp = api_client.delete(f"/api/persons/{created['id']}")
    assert resp.status_code == 204
    # Subsequent GET is 404.
    assert api_client.get(f"/api/persons/{created['id']}").status_code == 404


def test_create_person_rejects_blank_name(api_client):
    resp = api_client.post("/api/persons", json={"name": "", "email": "x@example.com"})
    assert resp.status_code in (400, 422)


def test_person_notes_are_sanitised(api_client):
    """The route layer must scrub HTML out of free-form text."""
    resp = api_client.post(
        "/api/persons",
        json={
            "name": "Mallory",
            "email": "m@example.com",
            "notes": "<script>alert(1)</script>hi",
        },
    )
    assert resp.status_code == 201, resp.text
    # Fetch to see the persisted (sanitised) value.
    pid = resp.json()["id"]
    fetched = api_client.get(f"/api/persons/{pid}").json()
    assert "<script>" not in (fetched.get("notes") or "")
