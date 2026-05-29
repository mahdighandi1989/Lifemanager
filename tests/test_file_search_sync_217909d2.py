"""Free-text search + periodic dynamic sync + Drive listing (audit task 217909d2).

Closes the remaining raw-memo gaps beyond the earlier movie-filter/external-drive/
delete-reconcile work: ?q= search ("فیلم ایرانی"), the periodic add/prune sync
loop reachable via a route, and Drive metadata listing.
"""
from __future__ import annotations

import pytest


def test_local_files_free_text_search(api_client):
    api_client.post("/api/local-files", json={"source_path": "/m/Iranian_Movie.mp4", "extracted_text": "یک فیلم ایرانی"})
    api_client.post("/api/local-files", json={"source_path": "/m/notes.txt", "extracted_text": "shopping list"})

    hit = api_client.get("/api/local-files", params={"q": "فیلم ایرانی"}).json()
    assert any("Iranian_Movie" in e["source_path"] for e in hit)
    assert all("notes.txt" not in e["source_path"] for e in hit)

    miss = api_client.get("/api/local-files", params={"q": "zzz-nomatch"}).json()
    assert miss == []


def test_assets_sync_adds_and_prunes(api_client):
    # initial set
    r1 = api_client.post("/api/assets/sync", json={"paths": ["/a/1", "/a/2"]})
    assert r1.status_code == 200, r1.text
    assert r1.json()["created"] == 2
    # /a/2 gone, /a/3 added
    r2 = api_client.post("/api/assets/sync", json={"paths": ["/a/1", "/a/3"]})
    body = r2.json()
    assert body["created"] == 1 and body["removed"] == 1


@pytest.mark.asyncio
async def test_drive_list_files_via_stub():
    from app.services.google_drive_service import list_files

    class StubClient:
        async def list_files(self, folder_id=None):
            return [{"id": "f1", "name": "doc.pdf", "mime_type": "application/pdf"}]

    out = await list_files(refresh_token="tok", client=StubClient())
    assert out and out[0]["name"] == "doc.pdf"


@pytest.mark.asyncio
async def test_drive_list_files_requires_credentials():
    from app.services.google_drive_service import list_files

    with pytest.raises(RuntimeError):
        await list_files(refresh_token=None)
