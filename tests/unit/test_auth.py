"""Unit-level JWT auth checks (audit task task_78c0e8e0a9b5, sub-task 3).

Pins the canonical verify node
``tests/unit/test_auth.py::test_jwt_expiry_rejection``.

Expiry enforcement lives in ``app.services.auth_service.validate_token``
(``options={"verify_exp": True}``); these tests exercise it directly so
an expired token is rejected and a fresh one is accepted.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from jose import jwt

from app.config import settings
from app.services import auth_service


def test_jwt_expiry_rejection():
    """A token whose ``exp`` is in the past must be rejected (None)."""
    expired = jwt.encode(
        {"sub": "1", "exp": datetime.utcnow() - timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    assert auth_service.validate_token(expired) is None


def test_jwt_valid_token_accepted():
    """A token within its expiry window decodes to its payload."""
    token = auth_service.create_access_token({"sub": "7", "email": "u@example.com"})
    payload = auth_service.validate_token(token)
    assert payload is not None
    assert payload["sub"] == "7"


def test_jwt_tampered_signature_rejected():
    """A token with a corrupted signature is rejected."""
    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    header, payload, signature = token.split(".")
    bad_first = "B" if signature[0] != "B" else "C"
    tampered = f"{header}.{payload}.{bad_first}{signature[1:]}"
    assert auth_service.validate_token(tampered) is None
