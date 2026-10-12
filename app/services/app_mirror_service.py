"""«آینهٔ درایو» ِ رکوردهای برنامه — one folder + one spreadsheet per mirrored record.

Layout (the same pattern as «نظارت و سرکشی»: one folder per item, ids cached):

    LifeManagerData/                       (the project's root, id cached at connect)
      learning-architecture/               (one folder per app)
        پرونده‌ها/ | موضوع‌ها/ | دوره/       (the group the page chose)
          <title> · <short id>/            (one folder per record)
            <title>                        (one spreadsheet, one tab per section, RTL)

The page sends the document (title, group, tabs → rows); this service never
interprets app data, so a new mirrored kind needs no change here. Writing is
idempotent: a doc whose hash already reached Drive is skipped; a record deleted
in the app gets its folder RENAMED, never deleted. Drive offline ⇒ nothing is
lost — rows stay pending and the next run (job ``app_mirror``) retries.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.app_mirror import AppMirror

logger = logging.getLogger(__name__)

MAX_TABS = 20
MAX_ROWS = 3000
MAX_COLS = 30
MAX_CELL = 45_000  # Sheets' hard limit is 50k chars per cell
MAX_DOC_CHARS = 2_000_000
DELETED_PREFIX = "(حذف‌شده در برنامه) "


def folder_url(fid: str) -> str:
    return f"https://drive.google.com/drive/folders/{fid}" if fid else ""


def sheet_url(sid: str) -> str:
    return f"https://docs.google.com/spreadsheets/d/{sid}" if sid else ""


def _clean_name(s: str, n: int = 120) -> str:
    s = " ".join(str(s or "").replace("/", "／").split())
    return s[:n] or "بی‌عنوان"


def record_folder_name(title: str, rec_id: str) -> str:
    return f"{_clean_name(title)} · {str(rec_id)[-6:]}"


def normalize_doc(title: str, tabs: Any) -> Dict[str, Any]:
    """Clamp a page-supplied document to what Sheets accepts; cells become strings."""
    out = []
    seen = set()
    for t in (tabs or [])[:MAX_TABS]:
        name = _clean_name((t or {}).get("name"), 90).replace("'", "’")
        base, k = name, 2
        while name in seen:
            name, k = f"{base} {k}", k + 1
        seen.add(name)
        rows = []
        for r in ((t or {}).get("rows") or [])[:MAX_ROWS]:
            if not isinstance(r, (list, tuple)):
                r = [r]
            rows.append(["" if c is None else str(c)[:MAX_CELL] for c in list(r)[:MAX_COLS]])
        out.append({"name": name, "rows": rows})
    return {"title": _clean_name(title, 200), "tabs": out}


def doc_hash(grp: str, doc: Dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps([grp, doc], ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


async def upsert(db: AsyncSession, *, user_id: Optional[int], app: str, items: List[dict], deleted: List[str]) -> Dict[str, int]:
    ids = [str(i.get("rec_id") or "") for i in items] + [str(d) for d in deleted]
    rows = {}
    if ids:
        rows = {r.rec_id: r for r in (await db.execute(select(AppMirror).where(
            AppMirror.app == app, AppMirror.user_id == user_id, AppMirror.rec_id.in_(ids)))).scalars().all()}
    changed = 0
    for it in items:
        rid = str(it.get("rec_id") or "").strip()
        if not rid or len(rid) > 128:
            continue
        grp = _clean_name(it.get("group"), 60)
        doc = normalize_doc(it.get("title"), it.get("tabs"))
        text = json.dumps(doc, ensure_ascii=False)
        if len(text) > MAX_DOC_CHARS:
            raise ValueError(f"سندِ «{rid}» بزرگ‌تر از سقف است")
        h = doc_hash(grp, doc)
        row = rows.get(rid)
        if row is None:
            row = AppMirror(user_id=user_id, app=app, rec_id=rid, synced_hash="", folder_id="", sheet_id="", error="")
            db.add(row)
            rows[rid] = row
        if row.doc_hash == h and not row.deleted:
            continue
        row.grp, row.title, row.doc, row.doc_hash, row.deleted = grp, doc["title"], text, h, False
        changed += 1
    gone = 0
    for rid in deleted:
        row = rows.get(str(rid))
        if row is not None and not row.deleted:
            row.deleted = True
            row.doc_hash = "deleted:" + (row.doc_hash or "")[:50]
            gone += 1
    await db.commit()
    return {"changed": changed, "deleted": gone}


async def mark_deleted(db: AsyncSession, *, user_id: Optional[int], app: str, rec_id: str) -> None:
    row = (await db.execute(select(AppMirror).where(AppMirror.app == app, AppMirror.user_id == user_id,
                                                    AppMirror.rec_id == rec_id))).scalar_one_or_none()
    if row is not None and not row.deleted:
        row.deleted = True
        row.doc_hash = "deleted:" + (row.doc_hash or "")[:50]
        await db.commit()


def row_view(r: AppMirror) -> dict:
    return {"rec_id": r.rec_id, "group": r.grp, "title": r.title, "folder_url": folder_url(r.folder_id),
            "sheet_url": sheet_url(r.sheet_id), "synced_at": r.synced_at.isoformat() if r.synced_at else None,
            "pending": (r.doc_hash or "") != (r.synced_hash or ""), "error": r.error or "", "deleted": bool(r.deleted)}


# ---------------------------------------------------------------- Drive side


class _Writer:
    """Synchronous Drive v3 + Sheets v4 calls (run in a thread)."""

    def __init__(self, drive_service, sheets_service):
        self.drive = drive_service
        self.sheets = sheets_service

    def rename(self, file_id: str, name: str) -> None:
        self.drive.files().update(fileId=file_id, body={"name": name}, fields="id").execute(num_retries=2)

    def exists(self, file_id: str) -> bool:
        try:
            f = self.drive.files().get(fileId=file_id, fields="id, trashed").execute(num_retries=2)
            return not f.get("trashed")
        except Exception:  # noqa: BLE001 — 404 / no access ⇒ recreate
            return False

    def create_sheet(self, name: str, parent: str) -> str:
        meta = {"name": name, "mimeType": "application/vnd.google-apps.spreadsheet", "parents": [parent]}
        return self.drive.files().create(body=meta, fields="id").execute(num_retries=2)["id"]

    def write(self, sheet_id: str, title: str, tabs: List[dict]) -> None:
        ss = self.sheets.spreadsheets()
        info = ss.get(spreadsheetId=sheet_id, fields="sheets(properties(sheetId,title))").execute(num_retries=2)
        have = {s["properties"]["title"]: s["properties"]["sheetId"] for s in info.get("sheets", [])}
        want = [t["name"] for t in tabs] or ["خلاصه"]
        reqs: List[dict] = []
        for name in want:
            if name not in have:
                reqs.append({"addSheet": {"properties": {"title": name, "rightToLeft": True}}})
        if reqs:
            ss.batchUpdate(spreadsheetId=sheet_id, body={"requests": reqs}).execute(num_retries=2)
            info = ss.get(spreadsheetId=sheet_id, fields="sheets(properties(sheetId,title))").execute(num_retries=2)
            have = {s["properties"]["title"]: s["properties"]["sheetId"] for s in info.get("sheets", [])}
        fmt: List[dict] = []
        size = {t["name"]: (len(t["rows"]), max([len(r) for r in t["rows"]] or [1])) for t in tabs}
        for i, name in enumerate(want):
            sid = have[name]
            nrows, ncols = size.get(name, (1, 1))
            # a new sheet is 1000×26: grow (or shrink) the grid to the data so writes never hit the edge
            grid = {"frozenRowCount": 1, "rowCount": max(nrows + 20, 50), "columnCount": max(ncols + 2, 6)}
            fmt.append({"updateSheetProperties": {"properties": {"sheetId": sid, "index": i, "rightToLeft": True,
                                                                 "gridProperties": grid},
                                                  "fields": "index,rightToLeft,gridProperties.frozenRowCount,"
                                                            "gridProperties.rowCount,gridProperties.columnCount"}})
            fmt.append({"repeatCell": {"range": {"sheetId": sid, "startRowIndex": 0, "endRowIndex": 1},
                                       "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
                                       "fields": "userEnteredFormat.textFormat.bold"}})
        # the default first tab Google creates ("Sheet1"/«برگه1») goes once real tabs exist — it is ours and empty
        for name, sid in have.items():
            if name not in want and name.lower().startswith(("sheet", "برگه")) and len(have) > 1:
                fmt.append({"deleteSheet": {"sheetId": sid}})
        fmt.append({"updateSpreadsheetProperties": {"properties": {"title": title}, "fields": "title"}})
        ss.batchUpdate(spreadsheetId=sheet_id, body={"requests": fmt}).execute(num_retries=2)
        data = []
        for t in tabs:
            ss.values().clear(spreadsheetId=sheet_id, range=f"'{t['name']}'", body={}).execute(num_retries=2)
            if t["rows"]:
                data.append({"range": f"'{t['name']}'!A1", "values": t["rows"]})
        if data:
            ss.values().batchUpdate(spreadsheetId=sheet_id,
                                    body={"valueInputOption": "RAW", "data": data}).execute(num_retries=2)


async def _clients(db: AsyncSession):
    from app.services.google_api_client import build_clients

    drive_client, sheets_client = await build_clients(db)
    if drive_client is None or sheets_client is None:
        return None, None
    return drive_client, _Writer(drive_client._drive, sheets_client._sheets)


async def sync_pending(db: AsyncSession, *, user_id: Optional[int] = None, app: Optional[str] = None,
                       limit: int = 25, clients=None) -> Dict[str, Any]:
    """Write every pending mirror (doc changed since the last write) to Drive."""
    q = select(AppMirror).where(or_(AppMirror.synced_hash.is_(None), AppMirror.synced_hash != AppMirror.doc_hash))
    if user_id is not None:
        q = q.where(AppMirror.user_id == user_id)
    if app:
        q = q.where(AppMirror.app == app)
    rows = (await db.execute(q.order_by(AppMirror.updated_at).limit(limit))).scalars().all()
    if not rows:
        return {"pending": 0, "written": 0}
    drive_client, writer = clients if clients is not None else await _clients(db)
    if drive_client is None:
        msg = "گوگل درایو وصل نیست (یا توکن تازه نشد) — در «تنظیمات › درایو» دوباره وصل کن؛ چیزی گم نمی‌شود و بعداً نوشته می‌شود."
        for r in rows:
            r.error = msg
        await db.commit()
        return {"pending": len(rows), "written": 0, "skipped": "no_drive"}
    from app.services.inspection_drive import root_folder

    root = await root_folder(db, drive_client)
    folders: Dict[str, str] = {}

    async def group_folder(app_name: str, grp: str) -> str:
        key = f"{app_name}/{grp}"
        if key not in folders:
            app_id = folders.get(app_name) or await drive_client.get_or_create_folder(app_name, parent=root)
            folders[app_name] = app_id
            folders[key] = await drive_client.get_or_create_folder(grp or "سایر", parent=app_id)
        return folders[key]

    written = failed = 0
    for r in rows:
        try:
            if r.deleted:
                if r.folder_id:
                    name = DELETED_PREFIX + record_folder_name(r.title, r.rec_id)
                    await asyncio.to_thread(writer.rename, r.folder_id, name)
                r.synced_hash, r.error, r.synced_at = r.doc_hash, "", datetime.now(timezone.utc)
                written += 1
                continue
            doc = json.loads(r.doc or "{}")
            name = record_folder_name(r.title, r.rec_id)
            parent = await group_folder(r.app, r.grp)
            if not r.folder_id or not await asyncio.to_thread(writer.exists, r.folder_id):
                r.folder_id = await drive_client.get_or_create_folder(name, parent=parent)
                r.sheet_id = ""
            else:
                await asyncio.to_thread(writer.rename, r.folder_id, name)
            if not r.sheet_id or not await asyncio.to_thread(writer.exists, r.sheet_id):
                r.sheet_id = await asyncio.to_thread(writer.create_sheet, _clean_name(r.title, 200), r.folder_id)
            await asyncio.to_thread(writer.write, r.sheet_id, _clean_name(r.title, 200), doc.get("tabs") or [])
            r.synced_hash, r.error, r.synced_at = r.doc_hash, "", datetime.now(timezone.utc)
            written += 1
        except Exception as exc:  # noqa: BLE001 — one bad row must not stop the rest
            failed += 1
            r.error = f"{type(exc).__name__}: {exc}"[:500]
            logger.warning("app mirror %s/%s failed: %r", r.app, r.rec_id, exc)
        await db.commit()
    return {"pending": len(rows), "written": written, "failed": failed}


async def status(db: AsyncSession, *, user_id: Optional[int], app: str) -> Dict[str, Any]:
    from app.services import drive_settings_service as dss

    rows = (await db.execute(select(AppMirror).where(AppMirror.app == app, AppMirror.user_id == user_id))).scalars().all()
    root = await dss.get_root_folder_id(db)
    return {"connected": await dss.is_connected(db), "root_url": folder_url(root or ""),
            "items": [row_view(r) for r in rows]}
