"""«نظارت و سرکشی» ↔ Google Drive — where a sheet's files and pictures LIVE.

The owner's rule (2026-10-08): «فایل ها در درایو با رفرنس مشخص و در فولدر مشخص
این پروژه … قرار بگیرن که بک اند دیگه شلوغ نشه و به اون لینک بشن». So:

    LifeManagerData/                     ← the project's existing root (cached id)
      inspection/
        report-0007/                     ← one folder per sheet (id cached on the sheet)
          ref-1a2b3c4d-نمونه.pdf         ← an attachment, real mime type
          shots/
            n2-before-9f8e7d6c.jpg       ← the picture of note 2

Every Drive object carries its reference: the app id in its NAME (`ref-<id8>`),
a human description (sheet number, title, sha256), and searchable
`appProperties` (`lm_app`, `lm_kind`, `lm_report`, `lm_file`/`lm_shot`). The
database keeps only that reference (+ the extracted text the supervisor reads).

Every upload is VERIFIED: Drive's md5Checksum must equal the md5 of the bytes we
sent, or the upload counts as failed and the bytes stay in the database (said so
in `store_note`). Anything that had to wait in the database — Drive was down, or
the upload failed — is moved by `offload()`, which every supervisor round runs.
Moving never deletes the database copy until Drive's checksum matched.
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import logging
import time
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, select

logger = logging.getLogger(__name__)

FOLDER = "inspection"
SHOTS = "shots"
APP = "lifemanager"


def folder_link(folder_id: str) -> str:
    return f"https://drive.google.com/drive/folders/{folder_id}" if folder_id else ""


def report_folder_name(number: int) -> str:
    return f"report-{int(number or 0):04d}"


async def client_or_reason(db):
    """`(client, "")` when Drive is usable right now, else `(None, why)`."""
    try:
        from app.services import drive_settings_service as dss
        from app.services import google_api_client as gac

        if not await dss.resolve_refresh_token(db):
            return None, "Google Drive وصل نیست"
        client = await gac.build_drive_client(db)
        if client is None:
            return None, "Google Drive وصل است ولی توکن تازه نشد (یا کتابخانه نیست)"
        return client, ""
    except Exception as exc:  # noqa: BLE001
        return None, f"Drive در دسترس نیست: {type(exc).__name__}: {exc}"[:300]


async def root_folder(db, client) -> str:
    """The project's existing `LifeManagerData` — the id cached at connect time,
    so a same-named folder elsewhere in the owner's Drive is never picked up."""
    from app.services import drive_settings_service as dss
    from app.services.google_api_client import ensure_app_folders

    root = await dss.get_root_folder_id(db)
    if root:
        return root
    root, _ = await ensure_app_folders(db, client)
    return root


async def inspection_folder(db, client) -> str:
    return await client.get_or_create_folder(FOLDER, parent=await root_folder(db, client))


async def report_folder(db, client, report) -> str:
    """This sheet's folder; its id is cached on the sheet (`drive_folder_id`)."""
    if getattr(report, "drive_folder_id", ""):
        return report.drive_folder_id
    fid = await client.get_or_create_folder(report_folder_name(report.number),
                                            parent=await inspection_folder(db, client))
    report.drive_folder_id = fid
    return fid


async def put(client, *, parent: str, name: str, data: bytes, mime: str,
              description: str, props: dict) -> dict:
    """Upload and PROVE it arrived: `{id, link}` or raise."""
    from app.services.google_drive_service import build_share_link

    res = await client.upload_ex(file_name=name, parent=parent, media=data, mime_type=mime,
                                 description=description, app_properties={"lm_app": APP, **props})
    want = hashlib.md5(data).hexdigest()  # noqa: S324 — integrity check, Drive's own algorithm
    if res.get("md5") and res["md5"] != want:
        raise IOError(f"md5 ِ درایو ({res['md5']}) با فایل ({want}) نمی‌خواند — آپلود ناقص")
    return {"id": res["id"], "link": res.get("link") or build_share_link(res["id"])}


def file_name(file_id: str, filename: str) -> str:
    return f"ref-{(file_id or '')[:8]}-{filename or 'file'}"


def file_description(report, file_id: str, sha256: str, note_id: str = "") -> str:
    return (f"Lifemanager · نظارت و سرکشی · گزارشِ {report.number}: {report.title or ''}"
            f" · فایلِ {file_id}" + (f" · یادداشتِ {note_id}" if note_id else " · خودِ برگه")
            + f" · sha256 {sha256}")


async def put_file(db, client, *, report, file_id: str, note_id: str, filename: str,
                   data: bytes, mime: str, sha256: str) -> dict:
    parent = await report_folder(db, client, report)
    return await put(client, parent=parent, name=file_name(file_id, filename), data=data,
                     mime=mime or "application/octet-stream",
                     description=file_description(report, file_id, sha256, note_id),
                     props={"lm_kind": "inspection_file", "lm_report": str(report.number),
                            "lm_file": file_id, "lm_note": note_id or "-"})


async def put_shot(db, client, *, report, shot, note_index: int) -> dict:
    data = base64.b64decode(shot.data or "")
    parent = await client.get_or_create_folder(SHOTS, parent=await report_folder(db, client, report))
    ext = "png" if "png" in (shot.mime or "") else "jpg"
    name = f"n{note_index}-{shot.kind or 'before'}-{shot.id[:8]}.{ext}"
    return await put(client, parent=parent, name=name, data=data, mime=shot.mime or "image/jpeg",
                     description=(f"Lifemanager · نظارت و سرکشی · گزارشِ {report.number}: "
                                  f"{report.title or ''} · تصویرِ {shot.kind} ِ یادداشتِ {note_index}"),
                     props={"lm_kind": "inspection_shot", "lm_report": str(report.number),
                            "lm_shot": shot.id})


def _note_index(report, note_id: str) -> int:
    import json

    try:
        notes = json.loads(report.notes_json or "[]")
    except Exception:  # noqa: BLE001
        return 0
    for i, n in enumerate(notes):
        if n.get("id") == note_id:
            return i + 1
    return 0


async def offload(db, *, report_id: Optional[str] = None, budget_s: float = 240.0,
                  max_items: int = 200) -> dict:
    """Move every picture and file still held in the database to its sheet's
    Drive folder. Per item: upload → checksum match → THEN drop the DB copy and
    commit. Stops at the time budget; the rest goes next round."""
    from app.models.inspection import InspectionFile, InspectionReport, InspectionShot
    from app.services import inspection_files as ifiles

    out = {"ok": True, "drive": False, "reason": "", "files_moved": 0, "shots_moved": 0,
           "failed": [], "left": 0}
    client, why = await client_or_reason(db)
    if client is None:
        out.update(reason=why, left=await _pending_count(db, report_id))
        return out
    out["drive"] = True
    t0 = time.monotonic()
    # ids first, rows re-read per item: a rollback after one failure expires
    # every loaded row, and an expired row cannot lazy-load under asyncio.
    q = select(InspectionShot.id).where(func.coalesce(InspectionShot.store, "") != "drive",
                                        func.length(func.coalesce(InspectionShot.data, "")) > 0)
    if report_id:
        q = q.where(InspectionShot.report_id == report_id)
    for sid in (await db.execute(q.limit(max_items))).scalars().all():
        if time.monotonic() - t0 > budget_s:
            break
        try:
            shot = await db.get(InspectionShot, sid)
            r = await db.get(InspectionReport, shot.report_id) if shot else None
            if r is None:
                continue
            placed = await put_shot(db, client, report=r, shot=shot,
                                    note_index=_note_index(r, shot.note_id))
            shot.store, shot.drive_id, shot.data = "drive", placed["id"], ""
            await db.commit()
            out["shots_moved"] += 1
        except Exception as exc:  # noqa: BLE001
            await db.rollback()
            out["failed"].append(f"shot {sid}: {type(exc).__name__}: {exc}"[:200])

    q = select(InspectionFile.id).where(InspectionFile.store.in_(("db", "local")))
    if report_id:
        q = q.where(InspectionFile.report_id == report_id)
    for fid in (await db.execute(q.limit(max_items))).scalars().all():
        if time.monotonic() - t0 > budget_s:
            break
        try:
            f = await db.get(InspectionFile, fid)
            r = await db.get(InspectionReport, f.report_id) if f else None
            if r is None:
                continue
            data = await ifiles.load(db, f)
            placed = await put_file(db, client, report=r, file_id=f.id, note_id=f.note_id or "",
                                    filename=f.filename, data=data, mime=f.mime, sha256=f.sha256 or "")
            was = f.store
            f.store, f.drive_id, f.drive_link = "drive", placed["id"], placed["link"]
            f.store_note = (f"از {'پایگاه‌داده' if was == 'db' else 'دیسکِ سرور'} به درایو منتقل شد "
                            f"({datetime.now(timezone.utc):%Y-%m-%d})")
            if was == "db":
                await ifiles.drop_chunks(db, f.id)
            await db.commit()
            out["files_moved"] += 1
        except Exception as exc:  # noqa: BLE001
            await db.rollback()
            out["failed"].append(f"file {fid}: {type(exc).__name__}: {exc}"[:200])
    out["left"] = await _pending_count(db, report_id)
    out["ok"] = not out["failed"]
    return out


async def offload_quietly(db, report_id: str, timeout_s: float = 25.0) -> None:
    """Best effort right after the owner files something: never fails or blocks
    the request for long; whatever is left goes in the supervisor's round."""
    try:
        await asyncio.wait_for(offload(db, report_id=report_id, budget_s=timeout_s), timeout_s + 5)
    except Exception as exc:  # noqa: BLE001
        logger.info("inspection offload deferred for %s: %r", report_id, exc)
        try:
            await db.rollback()
        except Exception:  # noqa: BLE001
            pass


async def _pending_count(db, report_id: Optional[str] = None) -> int:
    from app.models.inspection import InspectionFile, InspectionShot

    qs = select(func.count()).select_from(InspectionShot).where(
        func.coalesce(InspectionShot.store, "") != "drive",
        func.length(func.coalesce(InspectionShot.data, "")) > 0)
    qf = select(func.count()).select_from(InspectionFile).where(InspectionFile.store.in_(("db", "local")))
    if report_id:
        qs = qs.where(InspectionShot.report_id == report_id)
        qf = qf.where(InspectionFile.report_id == report_id)
    return int((await db.execute(qs)).scalar_one() or 0) + int((await db.execute(qf)).scalar_one() or 0)


async def status(db) -> dict:
    """What the board and the supervisor show: is Drive in use, where is the
    folder, and how much is still sitting in the database."""
    from app.models.inspection import InspectionFile, InspectionFileChunk, InspectionShot

    files = dict((s or "", n) for s, n in (await db.execute(
        select(InspectionFile.store, func.count()).group_by(InspectionFile.store))).all())
    shots_drive = int((await db.execute(select(func.count()).select_from(InspectionShot).where(
        InspectionShot.store == "drive"))).scalar_one() or 0)
    shots_total = int((await db.execute(select(func.count()).select_from(InspectionShot))).scalar_one() or 0)
    db_bytes = int((await db.execute(select(func.coalesce(func.sum(func.length(InspectionFileChunk.data)), 0))
                                     )).scalar_one() or 0)
    db_bytes += int((await db.execute(select(func.coalesce(func.sum(InspectionShot.byte_size), 0)).where(
        func.coalesce(InspectionShot.store, "") != "drive"))).scalar_one() or 0)
    out = {"ok": True, "drive": {"connected": False, "reason": "", "root_folder_id": "",
                                 "folder_id": "", "folder_link": "",
                                 "path": f"LifeManagerData/{FOLDER}/report-NNNN"},
           "files": {"drive": files.get("drive", 0), "db": files.get("db", 0),
                     "local": files.get("local", 0)},
           "shots": {"drive": shots_drive, "db": shots_total - shots_drive},
           "db_bytes": db_bytes}
    client, why = await client_or_reason(db)
    if client is None:
        out["drive"]["reason"] = why
        return out
    try:
        root = await root_folder(db, client)
        fid = await client.get_or_create_folder(FOLDER, parent=root)
        await db.commit()  # a freshly cached root id
        out["drive"].update(connected=True, root_folder_id=root, folder_id=fid, folder_link=folder_link(fid))
    except Exception as exc:  # noqa: BLE001
        out["drive"]["reason"] = f"پوشه ساخته/پیدا نشد: {type(exc).__name__}: {exc}"[:300]
    return out
