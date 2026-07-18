"""Real google-api-python-client adapters for Drive + Sheets (audit task:
complete Google Drive integration).

This is the wiring the injection-ready seams in ``google_drive_service.py`` and
``sheets_service.py`` were always waiting for. ``GoogleDriveClient`` implements
the exact async interface those services expect — ``get_or_create_folder`` /
``upload`` / ``list_files`` / ``download`` / ``share_link`` — and
``GoogleSheetsClient`` implements ``append_row``. The synchronous
google-api-python-client calls are wrapped in ``asyncio.to_thread`` so they
compose with the async route/service layer.

Resilience contract (mirrors the rest of the codebase):
  * Every ``google.*`` import is LAZY, so a stripped image without the libs
    still boots; ``build_clients`` returns ``(None, None)`` in that case.
  * ``build_clients`` returns ``(None, None)`` whenever Drive isn't connected
    (no refresh_token) or the OAuth client creds are missing — callers treat a
    ``None`` client as "Drive offline" and fall back to local-only behaviour.
"""
from __future__ import annotations

import asyncio
import io
import logging
from typing import Awaitable, Callable, Optional, Tuple

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Google's OAuth token endpoint. Named without a ``GOOGLE_`` prefix on purpose:
# it is an internal constant, not an env var, and the env-parity test scans for
# ``GOOGLE_*`` identifiers.
_OAUTH_TOKEN_URI = "https://oauth2.googleapis.com/token"

# Scopes requested at consent and used to mint access tokens. ``drive.file`` is
# least-privilege: the app only ever sees the files IT creates, never the user's
# whole Drive. ``spreadsheets`` powers the central LifeManagerIndex ledger.
DRIVE_SCOPES = (
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
    "openid",
    "email",
    "profile",
)


async def refresh_access_token_details(
    refresh_token: str,
) -> Tuple[Optional[str], Optional[str]]:
    """Exchange a refresh_token for an access_token, returning
    ``(access_token, error_detail)`` — the detail is what /api/drive/test
    surfaces so «بررسی اتصال» can say WHY (a Google ``invalid_grant`` means
    the stored token was revoked/expired and only a reconnect fixes it,
    which is invisible when every failure collapses to one message).
    Never raises."""
    if not refresh_token:
        return None, "no_refresh_token"
    if not (settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET):
        return None, "oauth_not_configured"
    try:
        async with httpx.AsyncClient(timeout=settings.EXTERNAL_API_TIMEOUT) as client:
            resp = await client.post(
                _OAUTH_TOKEN_URI,
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                },
            )
        if resp.status_code != 200:
            logger.warning(
                "Drive token refresh failed (status=%s): %s",
                resp.status_code,
                resp.text[:200],
            )
            return None, f"refresh_rejected status={resp.status_code}: {resp.text[:200]}"
        return resp.json().get("access_token"), None
    except Exception as exc:
        logger.warning("Drive token refresh error: %r", exc)
        return None, f"refresh_error: {type(exc).__name__}: {exc}"


async def refresh_access_token(refresh_token: str) -> Optional[str]:
    """Back-compat shim: the token-or-None shape every existing caller uses."""
    token, _ = await refresh_access_token_details(refresh_token)
    return token


def _build_services(access_token: str):
    """Synchronous: build (drive_v3, sheets_v4) service handles from a bearer
    access token. Imports google libs lazily."""
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    creds = Credentials(token=access_token)
    drive = build("drive", "v3", credentials=creds, cache_discovery=False)
    sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)
    return drive, sheets


def _escape(name: str) -> str:
    """Escape a value for a Drive query string literal."""
    return (name or "").replace("\\", "\\\\").replace("'", "\\'")


class GoogleDriveClient:
    """Async adapter over a google-api-python-client Drive v3 service."""

    def __init__(self, drive_service):
        self._drive = drive_service

    async def get_or_create_folder(self, name: str, parent: Optional[str] = None) -> str:
        return await asyncio.to_thread(self._get_or_create_folder_sync, name, parent)

    def _get_or_create_folder_sync(self, name: str, parent: Optional[str]) -> str:
        clauses = [
            "mimeType = 'application/vnd.google-apps.folder'",
            "trashed = false",
            f"name = '{_escape(name)}'",
        ]
        if parent:
            clauses.append(f"'{_escape(parent)}' in parents")
        res = (
            self._drive.files()
            .list(q=" and ".join(clauses), spaces="drive", fields="files(id, name)", pageSize=1)
            .execute()
        )
        found = res.get("files", [])
        if found:
            return found[0]["id"]
        meta = {"name": name, "mimeType": "application/vnd.google-apps.folder"}
        if parent:
            meta["parents"] = [parent]
        created = self._drive.files().create(body=meta, fields="id").execute()
        return created["id"]

    async def upload(self, *, file_name: str, parent: Optional[str], media=None) -> str:
        return await asyncio.to_thread(self._upload_sync, file_name, parent, media)

    def _upload_sync(self, file_name: str, parent: Optional[str], media) -> str:
        from googleapiclient.http import MediaIoBaseUpload

        data = media
        if isinstance(data, str):
            data = data.encode("utf-8")
        if data is None:
            data = b""
        if isinstance(data, (bytes, bytearray)):
            stream = io.BytesIO(bytes(data))
        else:
            stream = data  # already a file-like object
        media_body = MediaIoBaseUpload(
            stream, mimetype="application/octet-stream", resumable=False
        )
        meta = {"name": file_name}
        if parent:
            meta["parents"] = [parent]
        created = (
            self._drive.files()
            .create(body=meta, media_body=media_body, fields="id")
            .execute()
        )
        return created["id"]

    async def share_link(self, drive_file_id: str) -> str:
        # The canonical shareable-link shape (deterministic, no round-trip).
        from app.services.google_drive_service import build_share_link

        return build_share_link(drive_file_id)

    async def list_files(self, folder_id: Optional[str] = None) -> list[dict]:
        return await asyncio.to_thread(self._list_files_sync, folder_id)

    def _list_files_sync(self, folder_id: Optional[str]) -> list[dict]:
        clauses = ["trashed = false"]
        if folder_id:
            clauses.append(f"'{_escape(folder_id)}' in parents")
        res = (
            self._drive.files()
            .list(
                q=" and ".join(clauses),
                spaces="drive",
                fields="files(id, name, mimeType)",
                pageSize=100,
            )
            .execute()
        )
        return [
            {"id": f["id"], "name": f.get("name"), "mime_type": f.get("mimeType")}
            for f in res.get("files", [])
        ]

    async def download(self, drive_file_id: str) -> bytes:
        return await asyncio.to_thread(self._download_sync, drive_file_id)

    def _download_sync(self, drive_file_id: str) -> bytes:
        from googleapiclient.http import MediaIoBaseDownload

        request = self._drive.files().get_media(fileId=drive_file_id)
        buf = io.BytesIO()
        downloader = MediaIoBaseDownload(buf, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
        return buf.getvalue()


class GoogleSheetsClient:
    """Async adapter over Sheets v4 — find-or-creates the index spreadsheet in
    the app root folder and appends rows to it."""

    def __init__(self, sheets_service, drive_client: GoogleDriveClient, root_folder_id: Optional[str] = None):
        self._sheets = sheets_service
        self._drive_client = drive_client
        self._root = root_folder_id

    async def append_row(self, *, sheet_name: str, values: list) -> dict:
        return await asyncio.to_thread(self._append_row_sync, sheet_name, values)

    def _append_row_sync(self, sheet_name: str, values: list) -> dict:
        spreadsheet_id = self._find_or_create_spreadsheet(sheet_name)
        body = {"values": [[str(v) for v in values]]}
        return (
            self._sheets.spreadsheets()
            .values()
            .append(
                spreadsheetId=spreadsheet_id,
                range="A1",
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body=body,
            )
            .execute()
        )

    def _find_or_create_spreadsheet(self, name: str) -> str:
        drive = self._drive_client._drive
        clauses = [
            "mimeType = 'application/vnd.google-apps.spreadsheet'",
            "trashed = false",
            f"name = '{_escape(name)}'",
        ]
        if self._root:
            clauses.append(f"'{_escape(self._root)}' in parents")
        res = (
            drive.files()
            .list(q=" and ".join(clauses), spaces="drive", fields="files(id)", pageSize=1)
            .execute()
        )
        found = res.get("files", [])
        if found:
            return found[0]["id"]
        meta = {"name": name, "mimeType": "application/vnd.google-apps.spreadsheet"}
        if self._root:
            meta["parents"] = [self._root]
        created = drive.files().create(body=meta, fields="id").execute()
        return created["id"]


async def build_clients(db) -> Tuple[Optional[GoogleDriveClient], Optional[GoogleSheetsClient]]:
    """Return ``(drive_client, sheets_client)`` for the connected account, or
    ``(None, None)`` when Drive isn't connected / the libs are missing."""
    from app.services import drive_settings_service as dss

    refresh_token = await dss.resolve_refresh_token(db)
    if not refresh_token:
        return None, None
    access_token = await refresh_access_token(refresh_token)
    if not access_token:
        return None, None
    try:
        drive_service, sheets_service = await asyncio.to_thread(_build_services, access_token)
    except Exception as exc:
        logger.warning("google api client build failed (libs missing?): %r", exc)
        return None, None
    drive_client = GoogleDriveClient(drive_service)
    root = await dss.get_root_folder_id(db)
    sheets_client = GoogleSheetsClient(sheets_service, drive_client, root)
    return drive_client, sheets_client


async def build_drive_client(db) -> Optional[GoogleDriveClient]:
    drive_client, _ = await build_clients(db)
    return drive_client


async def ensure_app_folders(db, drive_client: GoogleDriveClient) -> Tuple[str, dict]:
    """Create (or find) ``LifeManagerData`` + its default subfolders and cache
    the root folder id. Returns ``(root_id, {subfolder_name: id})``."""
    from app.services import drive_settings_service as dss
    from app.services.google_drive_service import (
        APP_ROOT_FOLDER_NAME,
        DEFAULT_SUBFOLDERS,
    )

    root_id = await drive_client.get_or_create_folder(APP_ROOT_FOLDER_NAME, parent=None)
    await dss.store_root_folder_id(db, root_id)
    subs: dict = {}
    for name in DEFAULT_SUBFOLDERS:
        subs[name] = await drive_client.get_or_create_folder(name, parent=root_id)
    return root_id, subs


def make_drive_mover(
    drive_client: GoogleDriveClient, subfolders: dict
) -> Callable[[object], Awaitable[dict]]:
    """Build a cold-tiering ``mover``: uploads each cold row's extracted text (the
    only content a metadata-only DriveFile carries) under ``migrated_data/`` and
    returns ``{drive_file_id, drive_link}`` so the row can be slimmed to a Drive
    reference. The migrated content stays searchable via the Drive copy."""
    from app.services.google_drive_service import build_share_link

    parent = subfolders.get("migrated_data")

    async def mover(row) -> dict:
        content = (getattr(row, "extracted_text", None) or "").encode("utf-8")
        name = getattr(row, "filename", None) or f"file-{getattr(row, 'id', 'x')}"
        file_id = await drive_client.upload(file_name=name, parent=parent, media=content)
        return {"drive_file_id": file_id, "drive_link": build_share_link(file_id)}

    return mover
