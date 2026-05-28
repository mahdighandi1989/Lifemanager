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
