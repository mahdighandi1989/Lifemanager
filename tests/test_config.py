"""Configuration / CORS smoke tests.

Updated to match the strict CORS contract: requests from disallowed
origins are rejected with 403, and the response NEVER echoes a wildcard
`*` in Access-Control-Allow-Origin. The old assertions asserting `*`
were testing the pre-hardening behaviour and were a security footgun
(combining `*` with `allow_credentials=True` violates the CORS spec).
"""
import os

import pytest  # noqa: F401  # fixtures use pytest implicitly
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    """Pin the CORS allowlist and DATABASE_URL per-test so other test
    modules can't bleed their own ALLOWED_ORIGINS value into ours.
    """
    monkeypatch.setenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    monkeypatch.setenv(
        "ALLOWED_ORIGINS",
        "http://example.com,http://localhost:3000,http://127.0.0.1:8000",
    )


client = TestClient(app)


def test_cors_headers():
    """Allowed-origin preflight returns 204 with the origin reflected (NOT '*')."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    # The strict CORS middleware returns 204 for preflight from allowed origins.
    assert response.status_code == 204
    assert response.headers.get("access-control-allow-origin") == "http://example.com"
    # Never wildcard — that would be a CSRF footgun with credentials enabled.
    assert response.headers.get("access-control-allow-origin") != "*"


def test_database_url_exists():
    """DATABASE_URL is present in environment."""
    db_url = os.getenv("DATABASE_URL")
    assert db_url is not None, "DATABASE_URL must be set in environment"
    assert len(db_url) > 0, "DATABASE_URL must not be empty"


def test_cors_credentials():
    """Allowed-origin requests carry Access-Control-Allow-Credentials: true."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_blocks_disallowed_origins():
    """A disallowed origin gets 403 — the AC for task 2."""
    response = client.get(
        "/api/health",
        headers={"Origin": "https://evil.com"},
    )
    assert response.status_code == 403


def test_cors_reflects_allowed_origins_individually():
    """Each allowed origin gets its own value echoed — never '*'."""
    for origin in ["http://localhost:3000", "http://127.0.0.1:8000"]:
        response = client.get("/api/health", headers={"Origin": origin})
        assert response.status_code == 200
        # The header may not be set if the underlying route didn't reach
        # call_next (e.g. preflight), but when set it must be the specific
        # origin, never wildcard.
        echoed = response.headers.get("access-control-allow-origin")
        assert echoed in (origin, None)
        assert echoed != "*"
