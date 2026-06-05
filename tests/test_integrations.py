"""Auth enforcement on integration mutation endpoints (audit task f17880d0).

Part of "Add Missing Auth to Mutation Endpoints" / the "Incomplete Permission
Coverage for Mutation Paths" coherence audit. The integrations CRUD router
(``app/routes/integrations.py``: list / create / patch / delete) is a mutation
surface, so every route resolves the caller through ``app/dependencies/auth.py``
(``get_current_user``) and every service query is scoped by ``user_id``. These
tests pin that end-to-end auth chain:

  * no bearer            -> 403 (strict ``get_current_user``; no anon access)
  * authenticated create -> 201, owner taken from the token (never the body)
  * cross-tenant mutate  -> 404 (a row you don't own is invisible)
  * owner mutate         -> succeeds

Ground-truth note (why this file was rewritten): the previous version asserted
an imagined older contract — ``PUT`` instead of ``PATCH``, a ``/sync`` endpoint
and a ``GET /{id}`` that never existed, a ``type``/``config`` create body that
doesn't match ``IntegrationCreate`` (which requires ``name`` + ``service_type``),
and unauthenticated access. It failed on every case. The router + schema are the
business-logic ground truth; the test is aligned to them so it actually proves
the audit's permission-coverage property instead of drifting from it.

Caller identity is simulated by overriding ``get_current_user`` (the same
hermetic technique used by tests/test_auth_mutation_coverage_f17880d0.py), so
no real JWT minting is needed to prove the *authorization* logic the audit
flagged. The JWT signature/expiry half of the pipeline is covered separately.
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


def _create(client, name: str = "Cal", service_type: str = "calendar"):
    return client.post(
        "/integrations/",
        json={
            "name": name,
            "service_type": service_type,
            "config": {"url": "https://example.com/calendar"},
        },
    )


def test_mutations_require_authentication(api_client):
    """No bearer token -> the strict auth dependency 403s every mutation."""
    assert _create(api_client).status_code == 403
    assert api_client.patch("/integrations/1", json={"name": "x"}).status_code == 403
    assert api_client.delete("/integrations/1").status_code == 403


def test_create_scopes_owner_to_token_identity(api_client):
    """An authenticated create stamps the owner from the token, not the body."""
    _as_user(1)
    r = _create(api_client, name="My Calendar")
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["name"] == "My Calendar"
    assert body["service_type"] == "calendar"
    assert body["user_id"] == 1  # owner taken from auth context
    assert "id" in body


def test_create_missing_required_field_is_422(api_client):
    """Validation still applies for an authenticated caller — ``service_type``
    is required by ``IntegrationCreate``."""
    _as_user(1)
    r = api_client.post("/integrations/", json={"name": "no-type"})
    assert r.status_code == 422


def test_cross_tenant_update_delete_blocked(api_client):
    """A row created by user 1 is invisible (404) to user 2, and fully
    controllable by its owner."""
    _as_user(1)
    iid = _create(api_client).json()["id"]

    _as_user(2)
    assert api_client.patch(
        f"/integrations/{iid}", json={"name": "hijack"}
    ).status_code == 404
    assert api_client.delete(f"/integrations/{iid}").status_code == 404

    _as_user(1)
    r = api_client.patch(f"/integrations/{iid}", json={"name": "renamed by owner"})
    assert r.status_code == 200
    assert r.json()["name"] == "renamed by owner"
    assert api_client.delete(f"/integrations/{iid}").status_code == 204


def test_mutating_missing_row_is_404(api_client):
    _as_user(7)
    assert api_client.patch(
        "/integrations/99999", json={"name": "ghost"}
    ).status_code == 404
    assert api_client.delete("/integrations/99999").status_code == 404
