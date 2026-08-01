"""Auth enforcement on notification mutation endpoints (audit task f17880d0).

Part of "Add Missing Auth to Mutation Endpoints" / the "Incomplete Permission
Coverage for Mutation Paths" coherence audit. The notifications CRUD router
(``app/routes/notifications.py``: list / create / mark-read / delete on the
prefixed ``router``) is a mutation surface, so every route resolves the caller
through ``app/dependencies/auth.py`` (``get_current_user``) and every service
query is scoped by ``user_id``. These tests pin that end-to-end auth chain:

  * no bearer            -> 401 (strict ``get_current_user``; the anon
                            NotificationBell uses the separate ``api_router``
                            ``GET /api/notifications`` instead — see the route.
                            401 not 403: no identity was offered at all, and
                            the SPA's axios interceptor clears the stale token
                            on 401 only. 403 stays reserved for an identified
                            caller who lacks permission.)
  * authenticated create -> 201, owner taken from the token (never the body)
  * cross-tenant mutate  -> 404 (a notification you don't own is invisible)
  * owner mutate         -> succeeds

Ground-truth note (why this file was rewritten): the previous version asserted
an imagined older contract — ``PUT /{id}/read`` instead of ``PATCH``, a
``GET /{id}`` that never existed, a ``{message, type}`` create body that doesn't
match ``NotificationCreate`` (which requires ``type`` + ``title`` with ``type``
in the ``NotificationType`` enum), and unauthenticated access. It failed on
every case. The router + schema are the business-logic ground truth; the test
is aligned to them so it proves the audit's permission-coverage property.

Caller identity is simulated by overriding ``get_current_user`` (the same
hermetic technique used by tests/test_auth_mutation_coverage_f17880d0.py).
"""
from __future__ import annotations

import types

import pytest

from app.dependencies.auth import get_current_user
from app.main import app


def _as_user(uid: int) -> None:
    """Pin the resolved caller for the strict-auth dependency."""
    app.dependency_overrides[get_current_user] = lambda: types.SimpleNamespace(
        id=uid, email=f"user{uid}@example.com"
    )


@pytest.fixture(autouse=True)
def _clear_user_override():
    yield
    app.dependency_overrides.pop(get_current_user, None)


def _create(client, title: str = "Hi"):
    return client.post(
        "/notifications/",
        json={"type": "system", "title": title, "message": "body text"},
    )


def test_mutations_require_authentication(api_client):
    """No bearer token -> the strict auth dependency 401s every mutation and
    the owner-scoped list."""
    created = _create(api_client)
    assert created.status_code == 401
    assert created.headers.get("www-authenticate") == "Bearer"
    assert api_client.patch("/notifications/1/read").status_code == 401
    assert api_client.delete("/notifications/1").status_code == 401
    assert api_client.get("/notifications/").status_code == 401


def test_create_scopes_owner_to_token_identity(api_client):
    """An authenticated create stamps the owner from the token, not the body."""
    _as_user(1)
    r = _create(api_client, title="Welcome")
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["title"] == "Welcome"
    assert body["type"] == "system"
    assert body["user_id"] == 1  # owner taken from auth context
    assert body["is_read"] is False
    assert "id" in body


def test_create_missing_required_field_is_422(api_client):
    """Validation still applies for an authenticated caller — ``title`` is
    required by ``NotificationCreate``."""
    _as_user(1)
    r = api_client.post("/notifications/", json={"type": "system"})
    assert r.status_code == 422


def test_mark_read_and_delete_scoped_to_owner(api_client):
    """A notification created by user 1 cannot be marked-read or deleted by
    user 2 (404), and stays fully controllable by its owner."""
    _as_user(1)
    nid = _create(api_client).json()["id"]

    _as_user(2)
    assert api_client.patch(f"/notifications/{nid}/read").status_code == 404
    assert api_client.delete(f"/notifications/{nid}").status_code == 404

    _as_user(1)
    r = api_client.patch(f"/notifications/{nid}/read")
    assert r.status_code == 200
    assert r.json()["is_read"] is True
    assert api_client.delete(f"/notifications/{nid}").status_code == 204


def test_list_scoped_to_caller(api_client):
    """The list endpoint only returns the caller's own notifications."""
    _as_user(1)
    _create(api_client, title="u1-note")

    _as_user(2)
    assert api_client.get("/notifications/").json() == []

    _as_user(1)
    titles = [n["title"] for n in api_client.get("/notifications/").json()]
    assert "u1-note" in titles


def test_mutating_missing_row_is_404(api_client):
    _as_user(7)
    assert api_client.patch("/notifications/99999/read").status_code == 404
    assert api_client.delete("/notifications/99999").status_code == 404
