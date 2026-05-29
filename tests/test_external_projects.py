"""ExternalProject CRUD + plumbing (audit task d2146781)."""
from __future__ import annotations

import pytest


def test_create_external_project_returns_201(api_client):
    """AC 8 — POST /api/external-projects creates a row."""
    resp = api_client.post(
        "/api/external-projects",
        json={
            "name": "PaymentsBackend",
            "provider": "jira",
            "external_id": "PAY",
            "base_url": "https://example.atlassian.net",
            "api_key": "shh-secret-token",
        },
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["name"] == "PaymentsBackend"
    assert body["provider"] == "jira"
    # AC 10 — the api_key must NOT be echoed back in the response.
    assert "api_key" not in body


def test_list_external_projects_returns_user_rows(api_client):
    """AC 9 — GET returns the caller's external projects."""
    api_client.post(
        "/api/external-projects",
        json={"name": "AlphaProj", "provider": "linear"},
    )
    listing = api_client.get("/api/external-projects").json()
    assert any(p["name"] == "AlphaProj" for p in listing)


def test_api_key_stored_encrypted_with_marker(api_client, db_session=None):
    """AC 10 — the api_key column is now wrapped with real Fernet encryption
    via crypt_service (the old "enc::" placeholder marker was replaced). The
    stored value must not be plaintext and must round-trip back."""
    from app.services.external_project_service import _encrypt_api_key, decrypt_api_key

    assert _encrypt_api_key(None) is None
    encrypted = _encrypt_api_key("secret")
    assert encrypted != "secret"  # not plaintext
    assert not encrypted.startswith("enc::")  # no longer the placeholder
    assert decrypt_api_key(encrypted) == "secret"  # real round-trip


def test_integration_schema_reexports_interface_dataclasses():
    """AC 3 — integration_schema must surface ExternalProjectConfig
    and ExternalProjectInfo so downstream code can refer to them
    through the schemas namespace."""
    from app.schemas.integration_schema import (
        ExternalProjectConfig,
        ExternalProjectInfo,
    )

    # The classes must come from the canonical interface module.
    from app.services.integrations.external_project_interface import (
        ExternalProjectConfig as _IC,
        ExternalProjectInfo as _II,
    )

    assert ExternalProjectConfig is _IC
    assert ExternalProjectInfo is _II


def test_integration_service_get_external_project_interface_placeholder():
    """AC 4 — the placeholder hook exists and raises a clean
    NotImplementedError until real adapters land."""
    from app.services.integration_service import get_external_project_interface

    with pytest.raises(NotImplementedError, match="no .*ExternalProjectInterface"):
        get_external_project_interface("jira")


def test_external_project_router_is_mounted():
    """AC 7 — router mounted in app/main.py."""
    from app.main import app

    paths = {getattr(r, "path", None) for r in app.routes}
    assert "/api/external-projects" in paths
