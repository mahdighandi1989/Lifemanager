"""Google Sheets central index (audit task 7367c6f0 AC2).

Appends one row per migrated file to the ``LifeManagerIndex`` spreadsheet so
there's a human-readable, central ledger of everything that moved to Drive.
Mirrors google_drive_service's contract: requires the OAuth refresh_token and
takes an injectable ``client`` (the test suite passes a stub; the real
google-api-python-client wiring slots in unchanged).
"""
from __future__ import annotations

import os
from typing import Optional

INDEX_SHEET_NAME = "LifeManagerIndex"
# Column order of the central index row.
INDEX_COLUMNS = (
    "RecordID",
    "DataType",
    "OriginalLocation",
    "DriveFolderID",
    "DriveFileID",
    "DriveLink",
    "ExtractedText",
    "CreatedAt",
    "LastAccessedAt",
)


def _require_credentials(refresh_token: Optional[str]) -> None:
    if not refresh_token:
        raise RuntimeError(
            "Google Sheets integration requires the user to have completed the "
            "OAuth flow (audit task 7367c6f0). No refresh_token is on file."
        )


def row_from_record(record: dict) -> list:
    """Project a record dict onto the fixed INDEX_COLUMNS order so every
    appended row has a stable shape regardless of dict ordering."""
    return [record.get(col, "") for col in INDEX_COLUMNS]


async def append_index_row(
    *,
    refresh_token: Optional[str],
    record: dict,
    sheet_name: str = INDEX_SHEET_NAME,
    client=None,
) -> dict:
    """Append ``record`` (projected onto INDEX_COLUMNS) to ``LifeManagerIndex``.
    Returns ``{sheet, appended}``. Requires credentials + a client (stub in
    tests)."""
    _require_credentials(refresh_token)
    if client is None:
        raise NotImplementedError(
            "wire google-api-python-client (Sheets) before calling without a stub client"
        )
    values = row_from_record(record)
    result = await client.append_row(sheet_name=sheet_name, values=values)
    return {"sheet": sheet_name, "appended": values, "result": result}


async def record_index_entry(record: dict, *, refresh_token: Optional[str] = None, client=None) -> bool:
    """Best-effort ledger write — appends ``record`` to LifeManagerIndex when
    Sheets credentials + a client are available, else a clean no-op. This is the
    seam upload/cold-tiering call so "همه چیز توی شیت ثبت بشه" is wired into the
    real flow (audit task 7367c6f0 Step 4) without failing offline."""
    token = refresh_token or os.getenv("GOOGLE_SHEETS_REFRESH_TOKEN")
    if not token or client is None:
        return False
    await append_index_row(refresh_token=token, record=record, client=client)
    return True
