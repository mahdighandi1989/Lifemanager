"""POST /api/context/location must not 409 the background LocationTracker.

The anon scope (user_id=0) FK-references users.id; without the anchor row a save
raises IntegrityError, which @handle_errors would turn into a 409 Conflict that
spams the LocationTracker (fires every 5 min). The route now degrades to a soft
ack instead. (The startup anon-user seed normally prevents the conflict entirely.)
"""
from __future__ import annotations

import pytest
from sqlalchemy.exc import IntegrityError


def test_location_save_succeeds_normally(api_client):
    resp = api_client.post("/api/context/location", json={"lat": 35.7, "lng": 51.4})
    assert resp.status_code == 200, resp.text
    assert resp.json()["current_location"] == {"lat": 35.7, "lng": 51.4}


@pytest.mark.asyncio
async def test_location_save_degrades_on_integrity_error(db_session, monkeypatch):
    """A commit that raises IntegrityError yields a soft 'skipped' ack, not a 409."""
    from app.routes.context import LocationIn, save_context_location

    async def boom():
        raise IntegrityError("insert", {}, Exception("FK violation"))

    monkeypatch.setattr(db_session, "commit", boom)

    out = await save_context_location(
        payload=LocationIn(lat=1.0, lng=2.0), db=db_session, user_id=0
    )
    assert out["status"] == "skipped"
    assert out["current_location"] == {"lat": 1.0, "lng": 2.0}
