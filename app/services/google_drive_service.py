"""Google Drive integration helpers (audit task 7367c6f0 ACs 13-16).

These functions are gated behind the operator-supplied OAuth flow:
without a refresh_token the helpers raise ``RuntimeError`` so a
misroute can't silently fall back to a no-op. The shape of the
public API is fixed now so the future wiring against
google-api-python-client doesn't ripple through the route layer.
"""
from __future__ import annotations

import logging
from typing import Iterable, Optional

logger = logging.getLogger(__name__)


APP_ROOT_FOLDER_NAME = "Lifemanager Data"
DEFAULT_SUBFOLDERS: tuple[str, ...] = (
    "audio",
    "images",
    "documents",
    "migrated_data",
)


def _require_credentials(refresh_token: Optional[str]) -> None:
    if not refresh_token:
        raise RuntimeError(
            "Google Drive integration requires the user to have completed "
            "the OAuth flow with the `drive.file` scope (audit task 7367c6f0). "
            "No refresh_token is on file for this caller."
        )


async def get_or_create_app_root_folder(
    *,
    refresh_token: Optional[str],
    client=None,
) -> str:
    """Return the Drive folder id for ``Lifemanager Data``. Creates the
    folder when it does not exist. ``client`` is the live Drive API
    client; the test suite injects a stub."""
    _require_credentials(refresh_token)
    if client is None:
        # Placeholder for the real google-api-python-client wiring.
        raise NotImplementedError(
            "wire google-api-python-client before calling without a stub client"
        )
    return await client.get_or_create_folder(APP_ROOT_FOLDER_NAME, parent=None)


async def get_or_create_subfolders(
    *,
    refresh_token: Optional[str],
    root_folder_id: str,
    names: Iterable[str] = DEFAULT_SUBFOLDERS,
    client=None,
) -> dict[str, str]:
    """Return a {subfolder_name: folder_id} mapping for the requested
    children under ``root_folder_id``. Missing folders are created."""
    _require_credentials(refresh_token)
    if client is None:
        raise NotImplementedError(
            "wire google-api-python-client before calling without a stub client"
        )
    result: dict[str, str] = {}
    for name in names:
        result[name] = await client.get_or_create_folder(name, parent=root_folder_id)
    return result


def build_share_link(drive_file_id: str) -> str:
    """Canonical Drive shareable-link shape for a file id (audit task 7367c6f0
    AC1). Deterministic so callers can synthesise/verify the link without a
    round-trip once the file id is known."""
    return f"https://drive.google.com/file/d/{drive_file_id}/view?usp=sharing"


async def upload_file(
    *,
    refresh_token: Optional[str],
    file_name: str,
    data_type: str = "documents",
    record_id: Optional[str] = None,
    media=None,
    client=None,
) -> dict:
    """Upload a file under ``Lifemanager Data/<data_type>[/<record_id>]`` and
    return ``{drive_file_id, drive_link, folder_id}`` (audit task 7367c6f0 AC1,
    AC7). Creates the root + the data-type subfolder (+ a per-record subfolder
    when ``record_id`` is given). ``client`` is the live Drive client; tests
    inject a stub. Requires the OAuth refresh_token."""
    _require_credentials(refresh_token)
    if client is None:
        raise NotImplementedError(
            "wire google-api-python-client before calling without a stub client"
        )
    root_id = await get_or_create_app_root_folder(refresh_token=refresh_token, client=client)
    subfolders = await get_or_create_subfolders(
        refresh_token=refresh_token, root_folder_id=root_id, names=(data_type,), client=client
    )
    parent_id = subfolders[data_type]
    if record_id:
        parent_id = await client.get_or_create_folder(str(record_id), parent=parent_id)
    drive_file_id = await client.upload(
        file_name=file_name, parent=parent_id, media=media
    )
    # Prefer a link the client surfaces; otherwise synthesise the canonical one.
    drive_link = None
    if hasattr(client, "share_link"):
        drive_link = await client.share_link(drive_file_id)
    return {
        "drive_file_id": drive_file_id,
        "drive_link": drive_link or build_share_link(drive_file_id),
        "folder_id": parent_id,
    }


async def list_files(
    *,
    refresh_token: Optional[str],
    folder_id: Optional[str] = None,
    client=None,
) -> list[dict]:
    """List the user's Drive file metadata (audit task 217909d2 AC5 — read the
    user's Drive, not just files this app uploaded). Returns
    ``[{id, name, mime_type}]`` — metadata only, never file bytes (AC8).
    Requires credentials + a client (stub in tests / real google-api client)."""
    _require_credentials(refresh_token)
    if client is None:
        raise NotImplementedError(
            "wire google-api-python-client before calling without a stub client"
        )
    return await client.list_files(folder_id=folder_id)


async def download_file(
    *,
    refresh_token: Optional[str],
    drive_file_id: str,
    client=None,
):
    """Fetch a Drive object's bytes by id (audit task 7367c6f0 AC5). Returns
    whatever the client yields (bytes / stream). Requires credentials + a
    client (stub in tests)."""
    _require_credentials(refresh_token)
    if client is None:
        raise NotImplementedError(
            "wire google-api-python-client before calling without a stub client"
        )
    return await client.download(drive_file_id)
