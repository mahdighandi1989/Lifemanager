"""Tests for /api/tasks (and the /tasks/ alias) — full CRUD.

Behaviour pinned by the AC:
- POST with empty title         -> 422
- POST with title > 255 chars   -> 422  (route enforces max=200, so > 200
                                          also 422 — > 255 trivially fails)
- POST with valid title         -> 201
- GET /api/tasks/{id} 404 path  -> 404 (Task not found, JSON detail)
- POST with due_date='YYYY-MM-DD' -> 201 (date is accepted by Pydantic)
- title with HTML stays HTML-escaped in the response
- PUT / DELETE on missing id    -> 404
- DELETE returns 204; GET after delete returns 404
"""
# The `api_client` fixture comes from tests/conftest.py and is
# auto-discovered by pytest, so no import is needed here.


# --- create -----------------------------------------------------------------

def test_create_task_empty_title_returns_422(api_client):
    r = api_client.post("/api/tasks/", json={"title": ""})
    assert r.status_code == 422


def test_create_task_long_title_returns_422(api_client):
    """Title > 255 chars must return 422 (route caps at 200; > 200 fails)."""
    r = api_client.post("/api/tasks/", json={"title": "x" * 256})
    assert r.status_code == 422


def test_create_task_valid_title_returns_201(api_client):
    r = api_client.post("/api/tasks/", json={"title": "real task"})
    assert r.status_code == 201
    body = r.json()
    assert "id" in body
    assert body["title"] == "real task"


def test_create_task_with_description(api_client):
    r = api_client.post(
        "/api/tasks/",
        json={"title": "with desc", "description": "the body"},
    )
    assert r.status_code == 201
    assert r.json()["description"] == "the body"


def test_create_task_description_too_long_returns_422(api_client):
    r = api_client.post(
        "/api/tasks/",
        json={"title": "ok", "description": "x" * 1001},
    )
    assert r.status_code == 422


def test_create_task_with_due_date_accepts_iso_date(api_client):
    """AC for due_date: POST with `{"due_date": "2025-03-15"}` -> 201.

    The schema (date) and the model (Date) now match — the response
    serializes the date as the plain ISO 'YYYY-MM-DD' string.
    """
    r = api_client.post(
        "/api/tasks/",
        json={"title": "ok", "due_date": "2025-03-15"},
    )
    assert r.status_code == 201, r.text
    assert r.json()["due_date"] == "2025-03-15"


def test_create_task_priority_out_of_range_returns_422(api_client):
    r = api_client.post("/api/tasks/", json={"title": "ok", "priority": 6})
    assert r.status_code == 422


def test_create_task_priority_within_range_succeeds(api_client):
    r = api_client.post("/api/tasks/", json={"title": "ok", "priority": 4})
    assert r.status_code == 201


def test_validation_and_sanitization(api_client):
    """AC test_node:
    `tests/test_tasks.py::test_validation_and_sanitization` —
    HTML in title gets escaped before persisting so a stored XSS payload
    is rendered as text by any client.
    """
    r = api_client.post(
        "/api/tasks/",
        json={
            "title": "<script>alert('x')</script>",
            "description": "<img src=x onerror=alert(1)>",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert "<script>" not in body["title"]
    assert body["title"].startswith("&lt;script&gt;")
    assert "<img" not in body["description"]


# --- list -------------------------------------------------------------------

def test_list_tasks_empty_returns_200(api_client):
    r = api_client.get("/api/tasks/")
    assert r.status_code == 200
    assert r.json() == []


def test_list_tasks_after_create(api_client):
    api_client.post("/api/tasks/", json={"title": "a"})
    api_client.post("/api/tasks/", json={"title": "b"})
    r = api_client.get("/api/tasks/")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_legacy_tasks_path_is_not_an_api_endpoint(api_client):
    """/tasks is the SPA URL — it must NOT return JSON. Otherwise a browser
    navigating there would see raw JSON instead of the React Tasks page.

    In tests there is no built frontend/dist, so /tasks/ falls through to
    the framework default 404. In production the SPA catch-all serves
    index.html. Either is correct; the failure mode we're guarding against
    is the route returning the JSON list.
    """
    api_client.post("/api/tasks/", json={"title": "shared"})
    r = api_client.get("/tasks/")
    if r.status_code == 200:
        try:
            body = r.json()
        except ValueError:
            return  # non-JSON body (HTML/SPA shell) is fine
        assert not isinstance(body, list), (
            "GET /tasks/ must not return the API task list — that path is the SPA URL"
        )


# --- get one ----------------------------------------------------------------

def test_get_task_not_found_returns_404(api_client):
    r = api_client.get("/api/tasks/99999")
    assert r.status_code == 404
    assert r.json() == {"detail": "Task not found"}


def test_get_task_by_id(api_client):
    created = api_client.post("/api/tasks/", json={"title": "fetch me"}).json()
    r = api_client.get(f"/api/tasks/{created['id']}")
    assert r.status_code == 200
    assert r.json()["title"] == "fetch me"


# --- update -----------------------------------------------------------------

def test_update_task_not_found_returns_404(api_client):
    r = api_client.put("/api/tasks/99999", json={"title": "ghost"})
    assert r.status_code == 404


def test_update_task_changes_fields(api_client):
    created = api_client.post("/api/tasks/", json={"title": "orig"}).json()
    r = api_client.put(
        f"/api/tasks/{created['id']}",
        json={"title": "renamed", "status": "in_progress"},
    )
    assert r.status_code == 200
    assert r.json()["title"] == "renamed"
    assert r.json()["status"] == "in_progress"


# --- delete -----------------------------------------------------------------

def test_delete_task_returns_204_then_404(api_client):
    created = api_client.post("/api/tasks/", json={"title": "doomed"}).json()
    r = api_client.delete(f"/api/tasks/{created['id']}")
    assert r.status_code == 204
    assert api_client.get(f"/api/tasks/{created['id']}").status_code == 404


def test_delete_task_not_found_returns_404(api_client):
    r = api_client.delete("/api/tasks/99999")
    assert r.status_code == 404
