"""Complete Google Drive integration — connection store + real client adapter
+ management endpoints (audit task: complete Google Drive integration).

Covers:
  * drive_settings_service: encrypted store / resolve / disconnect roundtrip.
  * GoogleDriveClient: folder find-or-create (idempotent) + upload, wired
    through the existing google_drive_service.upload_file seam end-to-end with a
    fake google-api service (no network).
  * ensure_app_folders + make_drive_mover.
  * /api/drive/status (public-read), /api/drive/disconnect (admin-gated),
    /api/drive/upload-file (stores local when Drive is offline).
"""
from __future__ import annotations

import re

import pytest


# ── A minimal fake of the google-api-python-client Drive v3 service ──────────
# Supports just what GoogleDriveClient exercises: files().list/create/get_media
# + .execute(). Folders are tracked by name so get_or_create is idempotent.


class _Exec:
    def __init__(self, result):
        self._r = result

    def execute(self):
        return self._r


class _FakeFiles:
    def __init__(self):
        self.folders: dict[str, str] = {}
        self.files: dict[str, dict] = {}
        self._n = 0

    def list(self, q="", spaces=None, fields=None, pageSize=None):
        m = re.search(r"name = '([^']*)'", q)
        name = m.group(1) if m else None
        if "application/vnd.google-apps.folder" in q:
            if name in self.folders:
                return _Exec({"files": [{"id": self.folders[name], "name": name}]})
            return _Exec({"files": []})
        if "application/vnd.google-apps.spreadsheet" in q:
            return _Exec({"files": []})
        return _Exec(
            {
                "files": [
                    {"id": fid, "name": f["name"], "mimeType": "application/octet-stream"}
                    for fid, f in self.files.items()
                ]
            }
        )

    def create(self, body=None, media_body=None, fields=None):
        self._n += 1
        body = body or {}
        if body.get("mimeType") == "application/vnd.google-apps.folder":
            fid = f"folder-{body['name']}-{self._n}"
            self.folders[body["name"]] = fid
            return _Exec({"id": fid})
        fid = f"file-{self._n}"
        self.files[fid] = {"name": body.get("name")}
        return _Exec({"id": fid})

    def get_media(self, fileId=None):
        return _Exec(b"")


class FakeDriveService:
    def __init__(self):
        self._files = _FakeFiles()

    def files(self):
        return self._files


# ── drive_settings_service ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_store_resolve_disconnect_roundtrip(db_session, monkeypatch):
    monkeypatch.delenv("GOOGLE_DRIVE_REFRESH_TOKEN", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)
    from sqlalchemy import select

    from app.models.global_setting import GlobalSetting
    from app.services import drive_settings_service as dss

    assert await dss.is_connected(db_session) is False

    await dss.store_connection(db_session, refresh_token="r3fr3sh", account_email="me@gmail.com")
    assert await dss.resolve_refresh_token(db_session) == "r3fr3sh"
    assert await dss.get_account_email(db_session) == "me@gmail.com"
    assert await dss.is_connected(db_session) is True

    # The refresh token is encrypted at rest — the stored ciphertext is NOT the
    # plaintext token.
    row = (
        await db_session.execute(
            select(GlobalSetting).where(GlobalSetting.key == dss.KEY_REFRESH_TOKEN)
        )
    ).scalar_one()
    assert row.value != "r3fr3sh"

    await dss.disconnect(db_session)
    assert await dss.resolve_refresh_token(db_session) is None
    assert await dss.is_connected(db_session) is False


@pytest.mark.asyncio
async def test_resolve_refresh_token_env_fallback(db_session, monkeypatch):
    monkeypatch.setenv("GOOGLE_DRIVE_REFRESH_TOKEN", "from-env")
    from app.services import drive_settings_service as dss

    assert await dss.resolve_refresh_token(db_session) == "from-env"


# ── GoogleDriveClient + the google_drive_service seam ────────────────────────


@pytest.mark.asyncio
async def test_drive_client_folder_create_is_idempotent():
    from app.services.google_api_client import GoogleDriveClient

    client = GoogleDriveClient(FakeDriveService())
    fid = await client.get_or_create_folder("LifeManagerData")
    assert fid
    again = await client.get_or_create_folder("LifeManagerData")
    assert again == fid  # found, not re-created


@pytest.mark.asyncio
async def test_upload_file_seam_end_to_end_with_real_client():
    """The shipped google_drive_service.upload_file, driven by the REAL
    GoogleDriveClient wrapper over a fake google-api service, returns a Drive id
    + canonical share link."""
    from app.services import google_drive_service
    from app.services.google_api_client import GoogleDriveClient

    client = GoogleDriveClient(FakeDriveService())
    res = await google_drive_service.upload_file(
        refresh_token="tok",
        file_name="report.pdf",
        data_type="documents",
        media=b"hello",
        client=client,
    )
    assert res["drive_file_id"]
    assert res["drive_link"].startswith("https://drive.google.com/file/d/")
    assert res["folder_id"]


@pytest.mark.asyncio
async def test_ensure_app_folders_creates_tree_and_caches_root(db_session):
    from app.services import drive_settings_service as dss
    from app.services.google_api_client import GoogleDriveClient, ensure_app_folders
    from app.services.google_drive_service import DEFAULT_SUBFOLDERS

    client = GoogleDriveClient(FakeDriveService())
    root, subs = await ensure_app_folders(db_session, client)
    assert root
    assert set(subs) == set(DEFAULT_SUBFOLDERS)
    assert await dss.get_root_folder_id(db_session) == root


@pytest.mark.asyncio
async def test_make_drive_mover_uploads_extracted_text(db_session):
    from app.models.drive_file import DriveFile
    from app.services.google_api_client import (
        GoogleDriveClient,
        ensure_app_folders,
        make_drive_mover,
    )

    client = GoogleDriveClient(FakeDriveService())
    _root, subs = await ensure_app_folders(db_session, client)
    mover = make_drive_mover(client, subs)
    row = DriveFile(user_id=0, filename="cold.txt", extracted_text="lorem", storage_location="local")
    info = await mover(row)
    assert info["drive_file_id"]
    assert "drive.google.com" in info["drive_link"]


@pytest.mark.asyncio
async def test_build_clients_none_when_disconnected(db_session, monkeypatch):
    monkeypatch.delenv("GOOGLE_DRIVE_REFRESH_TOKEN", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)
    from app.services.google_api_client import build_clients

    drive_client, sheets_client = await build_clients(db_session)
    assert drive_client is None and sheets_client is None


# ── Route layer ──────────────────────────────────────────────────────────────


def test_drive_status_route(api_client):
    resp = api_client.get("/api/drive/status")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert set(body) >= {"configured", "connected", "account_email", "root_folder_name"}
    assert body["connected"] is False  # no token in a fresh test DB


def test_drive_disconnect_requires_admin(api_client):
    """conftest sets ADMIN_EMAILS, so the single-tenant bypass is OFF and an
    anonymous mutation is refused with 403."""
    resp = api_client.post("/api/drive/disconnect")
    assert resp.status_code == 403


def test_drive_upload_file_stores_local_when_offline(api_client):
    files = {"file": ("note.txt", b"hello world", "text/plain")}
    resp = api_client.post("/api/drive/upload-file", files=files)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["filename"] == "note.txt"
    assert body["storage_location"] == "local"
    assert body["drive_file_id"] is None  # Drive not connected → kept local

    listing = api_client.get("/api/drive/files").json()
    assert any(f["filename"] == "note.txt" for f in listing)
