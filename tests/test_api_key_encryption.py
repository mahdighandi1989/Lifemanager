"""API-key encryption at rest (audit task 1a08ded2 AC5 / d2146781 AC10)."""
import pytest

from app.schemas.external_project_schema import ExternalProjectCreate
from app.services.external_project_service import (
    _encrypt_api_key,
    create_external_project,
    decrypt_api_key,
)


def test_encrypt_then_decrypt_roundtrip():
    enc = _encrypt_api_key("super-secret-token")
    assert enc is not None
    assert enc != "super-secret-token"  # not plaintext
    assert decrypt_api_key(enc) == "super-secret-token"


def test_encrypt_none_is_none():
    assert _encrypt_api_key(None) is None
    assert decrypt_api_key(None) is None


def test_decrypt_legacy_plaintext_does_not_crash():
    # A historical, unencrypted value should pass through unchanged.
    assert decrypt_api_key("legacy-plain") == "legacy-plain"


@pytest.mark.asyncio
async def test_create_external_project_stores_encrypted_key(db_session):
    payload = ExternalProjectCreate(
        name="Jira", provider="jira", api_key="raw-token-123", base_url="https://x"
    )
    row = await create_external_project(db_session, user_id=1, payload=payload)
    assert row.api_key != "raw-token-123"  # persisted encrypted
    assert decrypt_api_key(row.api_key) == "raw-token-123"


def test_ai_config_references_env_var_not_raw_key():
    """AC5 (1a08ded2) for AI: a model config references an env var
    (api_key_env_var) rather than persisting a raw key in the DB."""
    from app.schemas.ai_schema import AIModelConfigCreate

    fields = set(AIModelConfigCreate.model_fields)
    assert "api_key_env_var" in fields
    assert "api_key" not in fields  # no raw-key field
