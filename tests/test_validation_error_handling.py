"""ValidationError handling boundary — request-parse (422) vs
service-layer (400).

The audit flagged ``app/middleware.py``'s ``handle_errors``
decorator for catching ``ValidationError`` and returning 400
instead of FastAPI's structured-body 422. The middleware.py NOTE
explains the deliberate split:

  * **Request parsing** failures (body / query / path coercion)
    are FastAPI's job — ``RequestValidationError`` triggers the
    framework's 422 handler with the structured detail array.
  * **Service-layer** ValidationError (a Pydantic model rebuilt
    from internal state, a hand-written invariant rejecting bad
    input) goes through ``@handle_errors`` and surfaces as a
    plain 400 with ``str(exc)`` — clients shouldn't be misled
    about where the failure originated.

This file pins BOTH legs so any future refactor that collapses
the two paths fails loudly.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.middleware import handle_errors


@pytest_asyncio.fixture
async def api_client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    await engine.dispose()


class _Strict(BaseModel):
    """Tiny model used to provoke a service-layer ValidationError."""
    name: str = Field(min_length=3)
    age: int = Field(gt=0)


def test_pydantic_validation_error_returns_422_with_structured_body(api_client):
    """Default FastAPI request-parsing path: 422 with structured array.

    Hit an existing POST endpoint (``/api/projects``) with a body
    that fails its Pydantic schema (missing required ``name``).
    The HTTP layer must answer 422 and FastAPI's array-shaped
    detail must come through untouched.
    """
    r = api_client.post("/api/projects", json={})
    assert r.status_code == 422, r.text
    body = r.json()
    assert isinstance(body.get("detail"), list), (
        "FastAPI's default RequestValidationError → 422 hands back "
        "a structured `detail` array; if this becomes a plain string "
        "the override has crept into the request-parse path."
    )
    # Each item carries at minimum a `loc` field so clients can
    # point users to the wrong field.
    assert all("loc" in entry for entry in body["detail"])


@pytest.mark.asyncio
async def test_service_layer_validation_error_returns_400_with_string_detail():
    """The deliberate carve-out: ValidationError raised INSIDE
    business logic (not from request parsing) is caught by
    @handle_errors and surfaces as 400 with ``str(exc)``."""
    from fastapi import HTTPException

    @handle_errors
    async def fake_service():
        # Build a ValidationError the way internal code would —
        # by instantiating a Pydantic model with bad data.
        try:
            _Strict(name="ok", age=-1)
        except ValidationError as exc:
            raise exc
        return {"ok": True}

    with pytest.raises(HTTPException) as caught:
        await fake_service()

    assert caught.value.status_code == 400
    # Plain string detail — the deliberate contract this branch
    # is meant to enforce.
    assert isinstance(caught.value.detail, str)
    # And it actually carries some useful context.
    assert "age" in caught.value.detail.lower() or "validation" in caught.value.detail.lower()
