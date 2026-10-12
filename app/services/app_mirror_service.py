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
STALE_PREFIX = "(قدیمی) "  # a tab the current document no longer has — kept, renamed, moved last
MAX_MIRRORS_PER_USER = 5000


def folder_url(fid: str) -> str:
    return f"https://drive.google.com/drive/folders/{fid}" if fid else ""


def sheet_url(sid: str) -> str:
    return f"https://docs.google.com/spreadsheets/d/{sid}" if sid else ""


def _clean_name(s: str, n: int = 120) -> str:
    s = " ".join(str(s or "").replace("/", "／").split())
    return s[:n] or "بی‌عنوان"


def record_folder_name(title: str, rec_id: str) -> str:
    return f"{_clean_name(title)} · {_clean_name(str(rec_id)[-6:], 6)}"


def normalize_doc(title: str, tabs: Any) -> Dict[str, Any]:
    """Clamp a page-supplied document to what Sheets accepts; cells become strings."""
    out = []
    seen = set()  # Sheets tab titles are unique case-INsensitively
    for t in (tabs if isinstance(tabs, list) else [])[:MAX_TABS]:
        if not isinstance(t, dict):
            continue
        name = _clean_name(t.get("name"), 90).replace("'", "’")
        if name.startswith(STALE_PREFIX):  # reserved for tabs a later doc no longer has
            name = name[len(STALE_PREFIX):] or "بی‌عنوان"
        base, k = name, 2
        while name.casefold() in seen:
            name, k = f"{base} {k}", k + 1
        seen.add(name.casefold())
        rows = []
        raw_rows = t.get("rows")
        for r in (raw_rows if isinstance(raw_rows, list) else [])[:MAX_ROWS]:
            if not isinstance(r, (list, tuple)):
                r = [r]
            rows.append(["" if c is None else str(c)[:MAX_CELL] for c in list(r)[:MAX_COLS]])
        out.append({"name": name, "rows": rows})
    return {"title": _clean_name(title, 200), "tabs": out}


def doc_hash(grp: str, doc: Dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps([grp, doc], ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


async def upsert(db: AsyncSession, *, user_id: Optional[int], app: str, items: List[dict], deleted: List[str]) -> Dict[str, Any]:
    items = [i for i in (items or []) if isinstance(i, dict)]
    deleted = [str(d).strip() for d in (deleted or []) if isinstance(d, (str, int))]
    ids = [str(i.get("rec_id") or "").strip() for i in items] + deleted
    rows = {}
    if ids:
        rows = {r.rec_id: r for r in (await db.execute(select(AppMirror).where(
            AppMirror.app == app, AppMirror.user_id == user_id, AppMirror.rec_id.in_(ids)))).scalars().all()}
    from sqlalchemy import func as _f

    have = (await db.execute(select(_f.count()).select_from(AppMirror).where(
        AppMirror.app == app, AppMirror.user_id == user_id))).scalar() or 0
    changed = 0
    too_big: List[str] = []
    for it in items:
        rid = str(it.get("rec_id") or "").strip()
        if not rid or len(rid) > 128:
            continue
        if rid not in rows and have >= MAX_MIRRORS_PER_USER:
            raise ValueError("تعدادِ رکوردهای آینه از سقف گذشته است")
        grp = _clean_name(it.get("group"), 60)
        doc = normalize_doc(it.get("title"), it.get("tabs"))
        text = json.dumps(doc, ensure_ascii=False)
        if len(text) > MAX_DOC_CHARS:
            too_big.append(rid)  # skipped alone — never fails the batch (the page would resend it forever)
            continue
        h = doc_hash(grp, doc)
        row = rows.get(rid)
        if row is None:
            row = AppMirror(user_id=user_id, app=app, rec_id=rid, synced_hash="", folder_id="", sheet_id="", error="")
            db.add(row)
            rows[rid] = row
            have += 1
        if row.doc_hash == h and not row.deleted:
            continue
        row.grp, row.title, row.doc, row.doc_hash, row.deleted = grp, doc["title"], text, h, False
        changed += 1
    gone = 0
    for rid in deleted:
        row = rows.get(rid)
        if row is not None and not row.deleted:
            row.deleted = True
            row.doc_hash = "deleted:" + (row.doc_hash or "")[:50]
            gone += 1
    await db.commit()
    return {"changed": changed, "deleted": gone, "too_big": too_big}


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


def _http_status(exc: Exception) -> Optional[int]:
    resp = getattr(exc, "resp", None)
    try:
        return int(getattr(resp, "status", None)) if resp is not None else None
    except (TypeError, ValueError):
        return None


def is_quota_error(exc: Exception) -> bool:
    """Drive/Sheets per-minute quota: stop this run, the next one resumes."""
    st = _http_status(exc)
    text = str(exc).lower()
    return st == 429 or (st == 403 and ("ratelimitexceeded" in text or "rate_limit" in text or "quota" in text))


def _col(n: int) -> str:
    """1 → A, 27 → AA."""
    out = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        out = chr(65 + r) + out
    return out


class _Writer:
    """Synchronous Drive v3 + Sheets v4 calls (run in a thread)."""

    def __init__(self, drive_service, sheets_service):
        self.drive = drive_service
        self.sheets = sheets_service

    def rename(self, file_id: str, name: str) -> None:
        self.drive.files().update(fileId=file_id, body={"name": name}, fields="id").execute(num_retries=2)

    def meta(self, file_id: str) -> Optional[dict]:
        """{name, parents} of a live file; None ONLY when Drive says it is gone
        (404 / trashed). Any other failure (network, 5xx, quota) raises — a
        transient error must never be taken as «gone» and create a duplicate."""
        try:
            f = self.drive.files().get(fileId=file_id, fields="id, name, parents, trashed").execute(num_retries=2)
        except Exception as exc:  # noqa: BLE001
            if _http_status(exc) == 404:
                return None
            raise
        return None if f.get("trashed") else f

    def exists(self, file_id: str) -> bool:
        return self.meta(file_id) is not None

    def move(self, file_id: str, new_parent: str, old_parents: List[str]) -> None:
        self.drive.files().update(fileId=file_id, addParents=new_parent, removeParents=",".join(old_parents),
                                  fields="id").execute(num_retries=2)

    def create_sheet(self, name: str, parent: str) -> str:
        meta = {"name": name, "mimeType": "application/vnd.google-apps.spreadsheet", "parents": [parent]}
        return self.drive.files().create(body=meta, fields="id").execute(num_retries=2)["id"]

    def write(self, sheet_id: str, title: str, tabs: List[dict]) -> None:
        """Values are written FIRST and only the stale tail is cleared after, so
        a failure half-way never leaves a blank sheet and a reader never sees one."""
        ss = self.sheets.spreadsheets()

        def tabs_now() -> Dict[str, int]:
            info = ss.get(spreadsheetId=sheet_id, fields="sheets(properties(sheetId,title))").execute(num_retries=2)
            return {s["properties"]["title"]: s["properties"]["sheetId"] for s in info.get("sheets", [])}

        tabs = tabs or [{"name": "خلاصه", "rows": []}]
        want = [t["name"] for t in tabs]
        want_cf = {w.casefold() for w in want}
        have = tabs_now()
        reqs: List[dict] = []
        have_cf = {name.casefold(): (name, sid) for name, sid in have.items()}
        for name in want:
            old = have_cf.get(name.casefold())
            if old is None:
                reqs.append({"addSheet": {"properties": {"title": name, "rightToLeft": True}}})
            elif old[0] != name:  # same tab, different letter case ⇒ rename (Sheets forbids both)
                reqs.append({"updateSheetProperties": {"properties": {"sheetId": old[1], "title": name},
                                                       "fields": "title"}})
        if reqs:
            ss.batchUpdate(spreadsheetId=sheet_id, body={"requests": reqs}).execute(num_retries=2)
            have = tabs_now()
        fmt: List[dict] = []
        size = {t["name"]: (len(t["rows"]), max([len(r) for r in t["rows"]] or [1])) for t in tabs}
        grids: Dict[str, tuple] = {}
        for i, name in enumerate(want):
            sid = have[name]
            nrows, ncols = size.get(name, (1, 1))
            # a new sheet is 1000×26: grow (or shrink) the grid to the data so writes never hit the edge
            grid = {"frozenRowCount": 1, "rowCount": max(nrows + 20, 50), "columnCount": max(ncols + 2, 6)}
            grids[name] = (grid["rowCount"], grid["columnCount"])
            fmt.append({"updateSheetProperties": {"properties": {"sheetId": sid, "index": i, "rightToLeft": True,
                                                                 "gridProperties": grid},
                                                  "fields": "index,rightToLeft,gridProperties.frozenRowCount,"
                                                            "gridProperties.rowCount,gridProperties.columnCount"}})
            fmt.append({"repeatCell": {"range": {"sheetId": sid, "startRowIndex": 0, "endRowIndex": 1},
                                       "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
                                       "fields": "userEnteredFormat.textFormat.bold"}})
        stale_names = {n.casefold() for n in have}
        pos = len(want)
        for name, sid in have.items():
            if name.casefold() in want_cf:
                continue
            if name.lower().startswith(("sheet", "برگه")) and len(have) > 1:
                # the default first tab Google creates — ours and empty
                fmt.append({"deleteSheet": {"sheetId": sid}})
            elif not name.startswith(STALE_PREFIX):
                # a section the document no longer has: kept (never lost), labelled, moved last
                new = (STALE_PREFIX + name)[:100]
                if new.casefold() in stale_names:
                    new = (STALE_PREFIX + name)[:90] + f" {sid}"
                stale_names.add(new.casefold())
                fmt.append({"updateSheetProperties": {"properties": {"sheetId": sid, "title": new, "index": pos},
                                                      "fields": "title,index"}})
                pos += 1
        fmt.append({"updateSpreadsheetProperties": {"properties": {"title": title}, "fields": "title"}})
        ss.batchUpdate(spreadsheetId=sheet_id, body={"requests": fmt}).execute(num_retries=2)
        data, tails = [], []
        for t in tabs:
            n = t["name"]
            nrows, ncols = size[n]
            grows, gcols = grids[n]
            if t["rows"]:
                # ragged rows are padded so a shorter row also overwrites the old cells to its left-over columns
                data.append({"range": f"'{n}'!A1", "values": [list(r) + [""] * (ncols - len(r)) for r in t["rows"]]})
            if nrows < grows:
                tails.append(f"'{n}'!A{nrows + 1}:{_col(gcols)}{grows}")
            if nrows and ncols < gcols:
                tails.append(f"'{n}'!{_col(ncols + 1)}1:{_col(gcols)}{nrows}")
        if data:
            ss.values().batchUpdate(spreadsheetId=sheet_id,
                                    body={"valueInputOption": "RAW", "data": data}).execute(num_retries=2)
        if tails:
            ss.values().batchClear(spreadsheetId=sheet_id, body={"ranges": tails}).execute(num_retries=2)


async def _clients(db: AsyncSession):
    from app.services.google_api_client import build_clients

    drive_client, sheets_client = await build_clients(db)
    if drive_client is None or sheets_client is None:
        return None, None
    return drive_client, _Writer(drive_client._drive, sheets_client._sheets)


_SYNC_LOCK = asyncio.Lock()


async def sync_pending(db: AsyncSession, *, user_id: Optional[int] = None, app: Optional[str] = None,
                       limit: int = 25, clients=None) -> Dict[str, Any]:
    """Write every pending mirror (doc changed since the last write) to Drive.

    One run at a time (the job and the «همگام‌سازیِ الان» button could
    otherwise both create the same folder). Fresh rows go before rows that
    already failed, so one broken record never starves the queue; a quota
    error ends the run early (the next run resumes)."""
    if _SYNC_LOCK.locked():
        return {"pending": 0, "written": 0, "busy": True}
    async with _SYNC_LOCK:
        return await _sync_pending(db, user_id=user_id, app=app, limit=limit, clients=clients)


async def _sync_pending(db: AsyncSession, *, user_id, app, limit, clients) -> Dict[str, Any]:
    from sqlalchemy import case

    q = select(AppMirror).where(or_(AppMirror.synced_hash.is_(None), AppMirror.synced_hash != AppMirror.doc_hash))
    if user_id is not None:
        q = q.where(AppMirror.user_id == user_id)
    if app:
        q = q.where(AppMirror.app == app)
    failed_last = case((or_(AppMirror.error.is_(None), AppMirror.error == ""), 0), else_=1)
    rows = (await db.execute(q.order_by(failed_last, AppMirror.updated_at).limit(limit))).scalars().all()
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
    stopped = ""
    for r in rows:
        try:
            if r.deleted:
                if r.folder_id:
                    name = DELETED_PREFIX + record_folder_name(r.title, r.rec_id)
                    m = await asyncio.to_thread(writer.meta, r.folder_id)
                    if m is not None and m.get("name") != name:
                        await asyncio.to_thread(writer.rename, r.folder_id, name)
                r.synced_hash, r.error, r.synced_at = r.doc_hash, "", datetime.now(timezone.utc)
                written += 1
                await db.commit()
                continue
            doc = json.loads(r.doc or "{}")
            name = record_folder_name(r.title, r.rec_id)
            parent = await group_folder(r.app, r.grp)
            m = await asyncio.to_thread(writer.meta, r.folder_id) if r.folder_id else None
            if m is None:
                r.folder_id = await drive_client.get_or_create_folder(name, parent=parent)
                r.sheet_id = ""
            else:
                if m.get("name") is not None and m.get("name") != name:
                    await asyncio.to_thread(writer.rename, r.folder_id, name)
                parents = list(m.get("parents") or [])
                if parents and parent not in parents:  # the record moved group (e.g. topic ↔ course)
                    await asyncio.to_thread(writer.move, r.folder_id, parent, parents)
            if not r.sheet_id or not await asyncio.to_thread(writer.exists, r.sheet_id):
                r.sheet_id = await asyncio.to_thread(writer.create_sheet, _clean_name(r.title, 200), r.folder_id)
                await db.commit()  # remember the new sheet before writing, so a failure never makes a second one
            await asyncio.to_thread(writer.write, r.sheet_id, _clean_name(r.title, 200), doc.get("tabs") or [])
            r.synced_hash, r.error, r.synced_at = r.doc_hash, "", datetime.now(timezone.utc)
            written += 1
        except Exception as exc:  # noqa: BLE001 — one bad row must not stop the rest
            failed += 1
            from app.services.ai.inference_gateway import scrub_secrets

            r.error = scrub_secrets(f"{type(exc).__name__}: {exc}")[:500]
            logger.warning("app mirror %s/%s failed: %s", r.app, r.rec_id, r.error)
            if is_quota_error(exc):
                stopped = "quota"
                await db.commit()
                break
        await db.commit()
    out: Dict[str, Any] = {"pending": len(rows), "written": written, "failed": failed}
    if stopped:
        out["stopped"] = stopped
    return out


async def status(db: AsyncSession, *, user_id: Optional[int], app: str) -> Dict[str, Any]:
    from app.services import drive_settings_service as dss

    rows = (await db.execute(select(AppMirror).where(AppMirror.app == app, AppMirror.user_id == user_id))).scalars().all()
    root = await dss.get_root_folder_id(db)
    return {"connected": await dss.is_connected(db), "root_url": folder_url(root or ""),
            "items": [row_view(r) for r in rows]}
