"""CORS configuration tests.

AC node: tests/test_cors.py::test_cors_validation — a request from a
disallowed Origin must return 403; a request from an allowed Origin
must pass through with reflected CORS headers.
"""
from __future__ import annotations

import os

import pytest

# Configure the allowlist BEFORE importing the app so the module-level
# _ALLOWED_ORIGIN_LIST in app.main picks it up.
os.environ["ALLOWED_ORIGINS"] = (
    "https://allowed.example.com,http://localhost:3000"
)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_cors_validation(client):
    """Disallowed origin → 403, allowed origin → 200, no-Origin → passes."""
    # Disallowed origin gets rejected outright.
    r = client.get("/health", headers={"Origin": "https://evil.com"})
    assert r.status_code == 403, r.text

    # Allowed origin passes through.
    r = client.get("/health", headers={"Origin": "https://allowed.example.com"})
    assert r.status_code == 200, r.text
    assert r.headers.get("Access-Control-Allow-Origin") == "https://allowed.example.com"

    # No Origin header (same-origin / curl-style) passes too.
    r = client.get("/health")
    assert r.status_code == 200


def test_cors_blocks_disallowed_for_api_route(client):
    """The 403 applies to every route, not just /health."""
    r = client.get("/api/health", headers={"Origin": "https://evil.com"})
    assert r.status_code == 403


def test_cors_allows_localhost_dev_origin(client):
    r = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert r.status_code == 200
    assert r.headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"


def test_cors_preflight_returns_204(client):
    """OPTIONS preflight from an allowed origin returns 204 with CORS headers."""
    r = client.options(
        "/api/health",
        headers={
            "Origin": "https://allowed.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert r.status_code == 204
    assert r.headers.get("Access-Control-Allow-Origin") == "https://allowed.example.com"
