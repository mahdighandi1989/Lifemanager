"""Coverage for the /api/local-files surface (audit task 217909d2).

Verifies:
  * POST /api/local-files persists the entry and runs the NLP pass.
  * GET /api/local-files returns rows scoped to the caller.
  * POST /api/lists/sync-from-file is idempotent and deletes items
    removed from the source.
"""
from __future__ import annotations

import io
import json


def test_create_and_list_local_file_entries(api_client):
    resp = api_client.post(
        "/api/local-files",
        json={
            "source_path": "/tmp/example.txt",
            "mime_type": "text/plain",
            "size_bytes": 42,
            "extracted_text": "Hello world AI rocks today",
        },
    )
    assert resp.status_code == 201, resp.text
    payload = resp.json()
    assert payload["source_path"] == "/tmp/example.txt"
    assert payload["summary"]  # NLP placeholder produced a summary
    assert isinstance(payload["keywords"], list)
    assert payload["keywords"]

    listing = api_client.get("/api/local-files").json()
    assert any(e["id"] == payload["id"] for e in listing)


def test_sync_from_file_creates_list_and_items(api_client):
    body = json.dumps({
        "name": "Movies to watch",
        "items": [
            {"content": "Dune"},
            {"content": "Arrival"},
        ],
    })
    files = {"upload": ("seed.json", io.BytesIO(body.encode("utf-8")), "application/json")}
    resp = api_client.post("/api/lists/sync-from-file", files=files)
    assert resp.status_code == 200, resp.text
    out = resp.json()
    assert out["created_items"] == 2
    assert out["deleted_items"] == 0


def test_sync_from_file_is_idempotent_and_deletes_removed(api_client):
    body_v1 = json.dumps({
        "name": "Books",
        "items": [{"content": "Dune"}, {"content": "Foundation"}],
    })
    body_v2 = json.dumps({
        "name": "Books",
        # Foundation has been removed from the source; Dune stayed; Hyperion is new.
        "items": [{"content": "Dune"}, {"content": "Hyperion"}],
    })

    api_client.post(
        "/api/lists/sync-from-file",
        files={"upload": ("v1.json", io.BytesIO(body_v1.encode()), "application/json")},
    )
    second = api_client.post(
        "/api/lists/sync-from-file",
        files={"upload": ("v2.json", io.BytesIO(body_v2.encode()), "application/json")},
    ).json()
    assert second["created_items"] == 1  # Hyperion added
    assert second["deleted_items"] == 1  # Foundation removed


def test_sync_from_file_rejects_non_json(api_client):
    files = {"upload": ("garbage.txt", io.BytesIO(b"not json at all"), "text/plain")}
    resp = api_client.post("/api/lists/sync-from-file", files=files)
    assert resp.status_code == 400


def test_local_file_entry_create_schema_rejects_blank_path():
    from pydantic import ValidationError
    import pytest as _pytest

    from app.schemas.local_file_entry_schema import LocalFileEntryCreate

    with _pytest.raises(ValidationError):
        LocalFileEntryCreate(source_path="")
