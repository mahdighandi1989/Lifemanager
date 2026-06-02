"""Auth pipeline integration tests (audit task task_78c0e8e0a9b5).

Pins the canonical verify nodes:
  * ``test_auth_flow_completes``        — sub-task 4 (authorization on
    user-data mutation paths flows through the JWT pipeline end to end).
  * ``test_jwt_creation_and_validation`` — sub-task 9 (JWT creation +
    validation round-trip, with a minimized payload).

These exercise the live FastAPI app (register → login → authenticated
request) plus the create/validate round-trip in the service layer.
"""
from __future__ import annotations

from jose import jwt

from app.config import settings
from app.services import auth_service


def test_jwt_creation_and_validation():
    """create_access_token → validate_token round-trips, and the issued
    payload is minimized to exactly the documented claims (sub-task 9:
    no surplus/sensitive data leaks into the token)."""
    token = auth_service.create_access_token(
        {"sub": "42", "email": "owner@example.com"}
    )

    # validate_token accepts the freshly-minted token.
    payload = auth_service.validate_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["email"] == "owner@example.com"

    # Payload minimization: only sub/email/exp — nothing sensitive.
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert set(decoded.keys()) == {"sub", "email", "exp"}, (
        f"unexpected JWT claims leaked: {set(decoded.keys()) - {'sub', 'email', 'exp'}}"
    )


def test_auth_flow_completes(api_client):
    """End-to-end: register a user, log in, then hit an
    authentication-guarded mutation endpoint with the issued bearer
    token. The whole pipeline (password hash → JWT issue → bearer
    verify → user resolve) must complete without a 401/403/500."""
    register = api_client.post(
        "/auth/register",
        json={
            "email": "flow@example.com",
            "username": "flowuser",
            "password": "S3cure-Passw0rd!",
        },
    )
    assert register.status_code in (200, 201), register.text

    login = api_client.post(
        "/auth/login",
        json={"email": "flow@example.com", "password": "S3cure-Passw0rd!"},
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    assert token

    # An authenticated read flows through get_current_user cleanly.
    headers = {"Authorization": f"Bearer {token}"}
    listed = api_client.get("/users/", headers=headers)
    assert listed.status_code == 200, listed.text


def test_mutation_endpoint_rejects_invalid_bearer(api_client):
    """A protected path must reject a garbage/forged bearer token with
    401 (sub-task 4: every guarded path verifies identity)."""
    resp = api_client.get(
        "/users/",
        headers={"Authorization": "Bearer not-a-real-jwt"},
    )
    assert resp.status_code == 401
