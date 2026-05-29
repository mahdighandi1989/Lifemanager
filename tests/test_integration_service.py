"""Integration tests for IntegrationService — a core service (audit task
b7894694: "integration tests for core services").

The previous version of this file targeted a phantom API
(``connect_service`` / ``_save_connection`` / ``sync_data`` …) that the real
``IntegrationService`` never exposed, so every test errored at collection
(``IntegrationService()`` also dropped the now-required ``db`` arg). It is
rewritten here to exercise the *actual* CRUD surface end-to-end against the
shared in-memory ``db_session`` fixture from conftest, so service↔schema↔DB
contract drift fails the test instead of passing silently.
"""
from __future__ import annotations

import pytest

from app.schemas.integration_schema import IntegrationCreate, IntegrationUpdate
from app.services.integration_service import IntegrationService


def _payload(name: str = "My Calendar", service_type: str = "google_calendar") -> IntegrationCreate:
    return IntegrationCreate(
        name=name,
        service_type=service_type,
        api_key="secret-token",
        base_url="https://example.test/api",
        config={"scope": "read"},
        is_active=True,
    )


@pytest.mark.asyncio
async def test_create_integration_persists_row(db_session):
    svc = IntegrationService(db_session)
    created = await svc.create_integration(_payload(), user_id=1)

    assert created.id is not None
    assert created.name == "My Calendar"
    assert created.service_type == "google_calendar"
    assert created.user_id == 1
    assert created.is_active is True

    rows = await svc.get_user_integrations(user_id=1)
    assert [r.id for r in rows] == [created.id]


@pytest.mark.asyncio
async def test_get_user_integrations_scopes_by_user(db_session):
    svc = IntegrationService(db_session)
    await svc.create_integration(_payload("u1-a"), user_id=1)
    await svc.create_integration(_payload("u1-b"), user_id=1)
    await svc.create_integration(_payload("u2-a"), user_id=2)

    u1 = await svc.get_user_integrations(user_id=1)
    u2 = await svc.get_user_integrations(user_id=2)

    assert {r.name for r in u1} == {"u1-a", "u1-b"}
    assert {r.name for r in u2} == {"u2-a"}


@pytest.mark.asyncio
async def test_update_integration_modifies_owned_row(db_session):
    svc = IntegrationService(db_session)
    created = await svc.create_integration(_payload(), user_id=1)

    updated = await svc.update_integration(
        created.id,
        IntegrationUpdate(name="Renamed", is_active=False),
        user_id=1,
    )

    assert updated is not None
    assert updated.name == "Renamed"
    assert updated.is_active is False
    # service_type untouched (exclude_unset semantics)
    assert updated.service_type == "google_calendar"


@pytest.mark.asyncio
async def test_update_integration_other_user_returns_none(db_session):
    svc = IntegrationService(db_session)
    created = await svc.create_integration(_payload(), user_id=1)

    # A different user must not be able to mutate the row.
    result = await svc.update_integration(
        created.id, IntegrationUpdate(name="hijacked"), user_id=999
    )
    assert result is None

    # Original row is unchanged.
    rows = await svc.get_user_integrations(user_id=1)
    assert rows[0].name == "My Calendar"


@pytest.mark.asyncio
async def test_update_integration_missing_returns_none(db_session):
    svc = IntegrationService(db_session)
    result = await svc.update_integration(
        12345, IntegrationUpdate(name="nope"), user_id=1
    )
    assert result is None


@pytest.mark.asyncio
async def test_delete_integration_removes_owned_row(db_session):
    svc = IntegrationService(db_session)
    created = await svc.create_integration(_payload(), user_id=1)

    assert await svc.delete_integration(created.id, user_id=1) is True
    assert await svc.get_user_integrations(user_id=1) == []


@pytest.mark.asyncio
async def test_delete_integration_missing_returns_false(db_session):
    svc = IntegrationService(db_session)
    assert await svc.delete_integration(999, user_id=1) is False


@pytest.mark.asyncio
async def test_delete_integration_other_user_returns_false(db_session):
    svc = IntegrationService(db_session)
    created = await svc.create_integration(_payload(), user_id=1)

    # Wrong owner → no row deleted, returns False, row survives.
    assert await svc.delete_integration(created.id, user_id=2) is False
    rows = await svc.get_user_integrations(user_id=1)
    assert [r.id for r in rows] == [created.id]
