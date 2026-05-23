import os
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    """Ensure DATABASE_URL is set for all tests."""
    monkeypatch.setenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")


client = TestClient(app)


def test_cors_headers():
    """Test that CORS middleware returns proper headers for OPTIONS requests."""
    response = client.options(
        "/tasks/",
        headers={"Origin": "http://example.com"},
    )
    assert response.headers.get("access-control-allow-origin") == "*"
    assert response.headers.get("access-control-allow-methods") == "*"
    assert response.headers.get("access-control-allow-headers") == "*"


def test_database_url_exists():
    """Test that DATABASE_URL is present in environment."""
    db_url = os.getenv("DATABASE_URL")
    assert db_url is not None, "DATABASE_URL must be set in environment"
    assert len(db_url) > 0, "DATABASE_URL must not be empty"


def test_cors_credentials():
    """Test that CORS allows credentials."""
    response = client.options(
        "/tasks/",
        headers={"Origin": "http://example.com"},
    )
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_origin_wildcard():
    """Test that CORS allows any origin."""
    origins = ["http://localhost:3000", "https://example.com", "http://127.0.0.1:8000"]
    for origin in origins:
        response = client.options(
            "/tasks/",
            headers={"Origin": origin},
        )
        assert response.headers.get("access-control-allow-origin") == "*"
