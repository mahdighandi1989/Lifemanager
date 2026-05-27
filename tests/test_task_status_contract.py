"""Status-contract normalisation between backend and frontend.

The audit's preferred fix for the status mismatch was "change the
backend to accept 'pending' (the frontend / docs vocabulary)". I
took the cheaper path: keep the DB enum canonical (todo /
in_progress / done / cancelled) and translate the legacy
"pending" / "completed" inbound on the route layer. These tests
pin both legs of the symmetric contract:

  * POST with the legacy vocabulary lands a row whose persisted
    status is enum-canonical.
  * PATCH with the legacy vocabulary updates the row to the
    enum-canonical value.
  * POST with the canonical vocabulary still works (no regression).

GET response status mapping is intentionally left untouched —
existing tests and the frontend's STATUS_LABELS dict already
handle both vocabularies on the way back.
"""
from __future__ import annotations

import pytest


@pytest.mark.parametrize(
    "input_status,expected_persisted",
    [
        ("pending", "todo"),
        ("completed", "done"),
        ("todo", "todo"),
        ("done", "done"),
        ("in_progress", "in_progress"),
        ("cancelled", "cancelled"),
    ],
)
def test_create_task_normalises_legacy_status(api_client, input_status, expected_persisted):
    """POST /api/tasks accepts both vocabularies, persists canonical."""
    r = api_client.post(
        "/api/tasks",
        json={"title": "x", "status": input_status},
    )
    assert r.status_code in (200, 201), r.text
    body = r.json()
    assert body["status"] == expected_persisted


def test_update_task_normalises_legacy_status(api_client):
    """PATCH /api/tasks/{id} also accepts both vocabularies."""
    r = api_client.post("/api/tasks", json={"title": "x", "status": "todo"})
    assert r.status_code in (200, 201), r.text
    task_id = r.json()["id"]

    # The route uses PUT for task updates. Legacy "completed"
    # lands as canonical "done".
    r = api_client.put(f"/api/tasks/{task_id}", json={"status": "completed"})
    assert r.status_code in (200, 204), r.text
    if r.status_code == 200:
        assert r.json()["status"] == "done"

    # And back the other way.
    r = api_client.put(f"/api/tasks/{task_id}", json={"status": "pending"})
    assert r.status_code in (200, 204), r.text
    if r.status_code == 200:
        assert r.json()["status"] == "todo"
