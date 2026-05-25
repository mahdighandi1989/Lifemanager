"""Error-handling consistency tests.

Every route in this project surfaces:
    422 -> validation errors (uniform Pydantic shape `{'detail': [...]}`)
    404 -> missing resource (`{'detail': '<resource> not found'}`)
    500 -> uncaught exceptions (`{'detail': 'internal error'}`)
And every error response carries a `detail` key.
"""
from unittest.mock import patch

# `api_client` and `soft_api_client` fixtures come from tests/conftest.py.


def test_404_returns_uniform_detail_shape(api_client):
    r = api_client.get("/api/tasks/99999")
    assert r.status_code == 404
    assert "detail" in r.json()
    assert r.json()["detail"] == "Task not found"


def test_404_for_projects(api_client):
    r = api_client.get("/api/projects/99999")
    assert r.status_code == 404
    assert r.json() == {"detail": "Project not found"}


def test_422_keeps_detail_key(api_client):
    r = api_client.post("/api/tasks/", json={"title": ""})
    assert r.status_code == 422
    body = r.json()
    assert "detail" in body
    assert isinstance(body["detail"], list)


def test_405_keeps_detail_key(api_client):
    r = api_client.patch("/api/tasks/")
    assert r.status_code == 405
    assert "detail" in r.json()


def test_unhandled_exception_returns_500_with_detail(soft_api_client):
    """Force an exception in the route handler and confirm we get the
    uniform 500 shape rather than a stack trace leaking to the client.

    We patch one of the route helpers so the request handler raises a
    plain RuntimeError (which is NOT caught by the per-route SQLAlchemyError
    block — only the global Exception handler can rescue it).
    """
    soft_api_client.post("/api/tasks/", json={"title": "ok"})
    with patch(
        "app.routes.tasks._serialize",
        side_effect=RuntimeError("boom"),
    ):
        r = soft_api_client.get("/api/tasks/")
    assert r.status_code == 500
    body = r.json()
    assert body == {"detail": "internal error"}
