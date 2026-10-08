"""Attachments on «نظارت و سرکشی» sheets: store them, and make them READ.

THE REQUIREMENT THAT SHAPES THIS MODULE (ALLIN1 owner, 2026-09-28; the Lifemanager
owner asked for the same: «بتونم انواع فایلها رو براش اپلود کنم»):

    «هر نوع فایلی … تا ۱۰۰ مگ … ناظر بتونه کامل بخونتش … و حجم هم باعث نشه
     ناظر نتونه بگه من نمیخونمش»

  1. **Any type.** A Word/PDF sample of a format to build, a picture pulled off
     the web, a spreadsheet, a zip — not only screenshots.
  2. **Up to 100 MB**, and the container disk is not a real home (wiped on every
     deploy — and every supervisor fix is a deploy). Drive is the durable store;
     without Drive the bytes go to chunk rows in the database (Detective-1's
     answer), and the row says which and why.
  3. **Size is never an excuse.** The TEXT is pulled out ONCE, here, at upload,
     and the reader is served slices that the router counts.

WHY NOT `ingest/text_extract.py`: that one is built for finance ingest — it caps
at 40 000 characters and 40 PDF pages and turns every failure into "". Here a cap
reported as a total would be exactly the lie this feature exists to prevent, so
every «no text» has its own name: ok · empty · unsupported · failed · image.

No new dependency: PDF via pypdf (already required), xlsx via openpyxl (already
required), docx/pptx straight from their XML (they are zip files).
"""
from __future__ import annotations

import csv
import hashlib
import html
import io
import logging
import os
import re
import zipfile
from pathlib import Path

logger = logging.getLogger(__name__)

MAX_MB = int(os.getenv("INSPECTION_MAX_FILE_MB", "100"))
MAX_BYTES = MAX_MB * 1024 * 1024

#: How much extracted text one file keeps (~6 000 pages). Hitting it is NOT a
#: silent truncation: `truncated=True` becomes read DEBT — finish the text AND
#: open the file, because the text is no longer all of it.
MAX_TEXT_CHARS = int(os.getenv("INSPECTION_MAX_TEXT_CHARS", str(20_000_000)))

#: Default slice, and the largest a caller may ask for. Large on purpose — the
#: reading duty is only fair if reading is cheap (40k slices turned one sample
#: into 500 round trips in the sibling).
SLICE_CHARS = int(os.getenv("INSPECTION_SLICE_CHARS", "400000"))
MAX_SLICE_CHARS = int(os.getenv("INSPECTION_MAX_SLICE_CHARS", "2000000"))

#: Drive layout: LifeManagerData/inspection/report-<n>/<hash>-<original name>
DRIVE_DATA_TYPE = "inspection"

_IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff",
              ".svg", ".heic", ".heif", ".avif", ".ico")
_TEXTY_EXT = (".txt", ".md", ".markdown", ".tsv", ".json", ".yaml", ".yml", ".xml",
              ".log", ".ini", ".cfg", ".toml", ".sql", ".py", ".js", ".ts", ".tsx",
              ".jsx", ".css", ".sh", ".bat", ".rst", ".kt", ".java", ".srt", ".vtt")
_HTML_EXT = (".html", ".htm")


def safe_filename(name: str) -> str:
    """Safe for Drive and a URL, still recognisable — Persian names are KEPT."""
    name = (name or "").strip().replace("\\", "/").split("/")[-1]
    name = re.sub(r"[\x00-\x1f\r\n\t]", "", name)
    name = re.sub(r'[<>:"|?*]', "_", name).strip(" .")
    return (name or "file")[:200]


def human_size(n: int) -> str:
    n = float(int(n or 0))
    for unit in ("بایت", "کیلوبایت", "مگابایت", "گیگابایت"):
        if n < 1024 or unit == "گیگابایت":
            return f"{n:.0f} {unit}" if unit == "بایت" else f"{n:.1f} {unit}"
        n /= 1024.0
    return f"{n:.1f} گیگابایت"  # pragma: no cover


# ---------------------------------------------------------------------------
# Extraction — one function per family.
# ---------------------------------------------------------------------------
def _pdf_text(data: bytes) -> tuple[str, int, int]:
    """Text per page, the page count, and HOW MANY PAGES HAD REAL TEXT.

    The third number decides `ok` vs `unsupported`: the page markers are text
    themselves, so a scanned PDF would otherwise come back «non-empty» and a
    reviewer would read forty characters of markers believing it read the file.
    """
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:  # noqa: BLE001
            raise ValueError("PDF رمزدار است و بدونِ رمز باز نشد")
    parts: list[str] = []
    with_text = 0
    total = 0
    for i, page in enumerate(reader.pages, start=1):
        try:
            t = page.extract_text() or ""
        except Exception as exc:  # one broken page must not lose the rest
            t = f"[صفحهٔ {i} خوانده نشد: {type(exc).__name__}]"
        if t.strip():
            with_text += 1
        chunk = f"\n--- صفحهٔ {i} ---\n{t}"
        parts.append(chunk)
        total += len(chunk)
        if total > MAX_TEXT_CHARS:
            parts.append(f"\n[استخراج در صفحهٔ {i} به سقفِ {MAX_TEXT_CHARS} نویسه رسید]")
            break
    return "".join(parts), len(reader.pages), with_text


def _xml_text(xml: str, *, cell: str = "", row: str = "", para: str = "") -> str:
    if cell:
        xml = re.sub(cell, " | ", xml)
    if row:
        xml = re.sub(row, "\n", xml)
    if para:
        xml = re.sub(para, "\n", xml)
    xml = re.sub(r"<[^>]+>", "", xml)
    return html.unescape(xml)


def _docx_text(data: bytes) -> str:
    """Paragraphs AND tables — a form sample's content lives in its tables."""
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        names = ["word/document.xml"] + sorted(
            n for n in z.namelist()
            if re.match(r"word/(header|footer|footnotes|endnotes)\d*\.xml$", n))
        out = []
        for n in names:
            if n not in z.namelist():
                continue
            xml = z.read(n).decode("utf-8", "ignore")
            out.append(_xml_text(xml, cell=r"</w:tc>", row=r"</w:tr>", para=r"</w:p>"))
    return "\n".join(out)


def _pptx_text(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        slides = sorted(
            (n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
            key=lambda n: int(re.search(r"(\d+)", n.rsplit("/", 1)[-1]).group(1)))
        out = []
        for i, n in enumerate(slides, start=1):
            xml = z.read(n).decode("utf-8", "ignore")
            out.append(f"\n--- اسلایدِ {i} ---\n" + _xml_text(xml, para=r"</a:p>"))
    return "\n".join(out)


def _xlsx_text(data: bytes) -> str:
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    lines: list[str] = []
    size = 0
    try:
        for ws in wb.worksheets:
            lines.append(f"\n--- کاربرگِ «{ws.title}» ---")
            for row in ws.iter_rows(values_only=True):
                cells = ["" if c is None else str(c) for c in row]
                if any(cells):
                    line = " | ".join(cells).rstrip(" |")
                    lines.append(line)
                    size += len(line)
                if size > MAX_TEXT_CHARS:
                    break
    finally:
        wb.close()
    return "\n".join(lines)


def _decode(data: bytes) -> str:
    for enc in ("utf-8-sig", "utf-8", "cp1256", "windows-1256"):
        try:
            return data.decode(enc)
        except Exception:  # noqa: BLE001
            continue
    return data.decode("utf-8", "replace")


def _csv_text(data: bytes) -> str:
    txt = _decode(data)
    try:
        return "\n".join(" | ".join(r) for r in csv.reader(io.StringIO(txt)))
    except Exception:  # noqa: BLE001
        return txt


def _html_text(data: bytes) -> str:
    txt = _decode(data)
    txt = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", txt)
    txt = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</tr>|</li>|</h\d>", "\n", txt)
    txt = re.sub(r"<[^>]+>", " ", txt)
    return html.unescape(re.sub(r"[ \t]+", " ", txt))


def extract(data: bytes, filename: str, mime: str = "") -> dict:
    """Pull readable text out of one file.

    Returns ``{status, text, note, page_count, truncated}`` with ``status`` one
    of ``ok | empty | unsupported | failed | image`` — never collapsed.
    """
    name = (filename or "").lower()
    mime = (mime or "").lower()
    ext = Path(name).suffix

    def done(status: str, text: str = "", note: str = "", pages: int = 0,
             truncated: bool = False) -> dict:
        if len(text) > MAX_TEXT_CHARS:
            text = text[:MAX_TEXT_CHARS]
            truncated = True
            note = (note + " " if note else "") + (
                f"متن در {MAX_TEXT_CHARS} نویسه بریده شد — بقیه‌اش فقط در خودِ فایل است، "
                "پس باید خودِ فایل را هم باز کرد")
        return {"status": status, "text": text, "note": note, "page_count": pages,
                "truncated": truncated}

    def text_or_empty(text: str, ok_note: str, empty_note: str) -> dict:
        return done("ok", text, ok_note) if (text or "").strip() else done("empty", "", empty_note)

    try:
        if mime.startswith("image/") or ext in _IMAGE_EXT:
            return done("image", "", "تصویر است — متنی برای استخراج ندارد؛ ناظر باید بازش کند و نگاه کند")

        if ext == ".pdf" or mime == "application/pdf":
            text, pages, with_text = _pdf_text(data)
            if with_text:
                note = f"از {pages} صفحهٔ PDF" + (
                    f" — ولی فقط {with_text} صفحه لایهٔ متنی داشت؛ بقیه احتمالاً اسکن‌اند "
                    "و باید خودِ فایل دیده شود" if with_text < pages else "")
                return done("ok", text, note, pages,
                            truncated=("به سقفِ" in text or with_text < pages))
            return done("unsupported", "", pages=pages,
                        note=(f"PDF {pages} صفحه دارد ولی هیچ صفحه‌ای لایهٔ متنی ندارد "
                              "(اسکن‌شده است) — ناظر باید خودِ فایل را باز کند و ببیند"))

        if ext == ".docx" or "wordprocessingml" in mime:
            return text_or_empty(_docx_text(data), "از فایلِ Word (متن و جدول‌ها)",
                                 "فایلِ Word باز شد ولی متنی نداشت")

        if ext == ".doc" or mime == "application/msword":
            return done("unsupported", "", "قالبِ قدیمیِ .doc — استخراج‌کننده نداریم؛ "
                                           "ناظر باید بازش کند (یا .docx بفرست)")

        if ext == ".pptx" or "presentationml" in mime:
            return text_or_empty(_pptx_text(data), "از PowerPoint", "اسلایدها متنی نداشتند")

        if ext in (".xlsx", ".xlsm"):
            return text_or_empty(_xlsx_text(data), "از کاربرگ", "کاربرگ باز شد ولی سلولِ پُری نداشت")

        if ext == ".xls" or mime == "application/vnd.ms-excel":
            return done("unsupported", "", "قالبِ قدیمیِ .xls — استخراج‌کننده نداریم؛ "
                                           "ناظر باید بازش کند (یا .xlsx بفرست)")

        if ext == ".csv" or mime == "text/csv":
            return text_or_empty(_csv_text(data), "از CSV", "فایلِ CSV خالی است")

        if ext in _HTML_EXT or mime == "text/html":
            return text_or_empty(_html_text(data), "از HTML (بدونِ اسکریپت و استایل)",
                                 "صفحهٔ HTML متنی نداشت")

        if ext in _TEXTY_EXT or mime.startswith("text/") or mime in (
                "application/json", "application/xml"):
            return text_or_empty(_decode(data), "متنِ ساده", "فایل خالی است")

        if ext == ".zip" or mime in ("application/zip", "application/x-zip-compressed"):
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                names = z.namelist()
            listing = "\n".join(names[:2000])
            more = f"\n… و {len(names) - 2000} مورد دیگر" if len(names) > 2000 else ""
            return done("ok", f"--- فهرستِ محتویاتِ آرشیو ({len(names)} مورد) ---\n{listing}{more}",
                        "فقط فهرستِ فایل‌ها؛ برای دیدنِ محتوا باید بازش کرد", truncated=True)

        if mime.startswith(("audio/", "video/")):
            return done("unsupported", "", "صوت/ویدیو است — متنی برای استخراج ندارد؛ "
                                           "ناظر باید خودِ فایل را باز کند")

        # Deliberately NOT «empty»: we never tried, and saying so is the point.
        return done("unsupported", "",
                    f"برای «{ext or mime or 'این نوع'}» استخراج‌کنندهٔ متن نداریم — "
                    "ناظر باید خودِ فایل را باز کند و کامل ببیند")
    except Exception as exc:  # noqa: BLE001 - the reason is the useful part
        logger.warning("inspection file extract failed: %r", exc)
        return done("failed", "", f"استخراج شکست خورد: {type(exc).__name__}: {exc}"[:400])


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------
def local_dir() -> Path:
    p = Path(os.getenv("INSPECTION_FILE_DIR") or "storage/inspection")
    p.mkdir(parents=True, exist_ok=True)
    return p


async def store(db, *, data: bytes, filename: str, mime: str, report_number: int = 0,
                file_id: str = "", report=None, note_id: str = "") -> dict:
    """Put the bytes where they will still be there next month.

    Drive first (`LifeManagerData/inspection/report-<n>/`). Without Drive, the
    DATABASE, in chunk rows added to `db` (the caller commits them together with
    the file row) — the container disk does not survive a deploy, and every fix
    the supervisor ships is one. The fallback is recorded AS a fallback, with the
    reason, so nobody wonders where a file went. The disk is used only when no
    `file_id` is given to chunk under (a caller outside the upload route).
    """
    from app.models.inspection import FILE_CHUNK_BYTES, InspectionFileChunk

    name = safe_filename(filename)
    sha = hashlib.sha256(data).hexdigest()
    stored_name = f"{sha[:8]}-{name}"
    out = {"filename": name, "byte_size": len(data), "sha256": sha, "store": "",
           "drive_id": "", "drive_link": "", "local_path": "", "store_note": ""}

    reason = ""
    if report is not None:
        # the sheet's own Drive folder, real mime type, reference, md5-verified
        # (app/services/inspection_drive.py)
        from app.services import inspection_drive as idrive

        client, reason = await idrive.client_or_reason(db)
        if client is not None:
            try:
                placed = await idrive.put_file(db, client, report=report, file_id=file_id,
                                               note_id=note_id, filename=name, data=data,
                                               mime=mime, sha256=sha)
                out.update(store="drive", drive_id=placed["id"], drive_link=placed["link"])
                return out
            except Exception as exc:  # noqa: BLE001
                logger.warning("inspection file → Drive failed: %r", exc)
                reason = f"آپلود به Drive شکست خورد: {type(exc).__name__}: {exc}"[:300]
    else:
        try:
            from app.services import drive_settings_service as dss
            from app.services.google_api_client import build_drive_client
            from app.services.google_drive_service import upload_file

            client = await build_drive_client(db)
            if client is not None:
                res = await upload_file(
                    refresh_token=await dss.resolve_refresh_token(db),
                    file_name=stored_name, data_type=DRIVE_DATA_TYPE,
                    record_id=f"report-{int(report_number)}", media=data, client=client)
                out.update(store="drive", drive_id=res.get("drive_file_id") or "",
                           drive_link=res.get("drive_link") or "")
                return out
            reason = "Google Drive وصل نیست"
        except Exception as exc:  # noqa: BLE001
            logger.warning("inspection file → Drive failed: %r", exc)
            reason = f"آپلود به Drive شکست خورد: {type(exc).__name__}: {exc}"[:300]

    if file_id:
        for seq, at in enumerate(range(0, len(data), FILE_CHUNK_BYTES)):
            db.add(InspectionFileChunk(file_id=file_id, seq=seq, data=data[at:at + FILE_CHUNK_BYTES]))
        out.update(store="db", store_note=reason + " — فعلاً در پایگاه‌داده نگه داشته شد؛ "
                                                   "دورِ بعدیِ ناظر به درایو منتقلش می‌کند")
        return out

    path = local_dir() / f"r{int(report_number)}-{stored_name}"
    path.write_bytes(data)
    out.update(store="local", local_path=str(path),
               store_note=(reason + " — فایل روی دیسکِ سرور ذخیره شد و با دیپلویِ بعدی "
                           "از بین می‌رود؛ درایو را در تنظیمات وصل کن"))
    return out


async def load(db, row) -> bytes:
    """One stored file's bytes, from wherever they really are."""
    from sqlalchemy import select

    from app.models.inspection import InspectionFileChunk

    if getattr(row, "store", "") == "drive" and getattr(row, "drive_id", ""):
        from app.services.google_api_client import build_drive_client

        client = await build_drive_client(db)
        if client is None:
            raise FileNotFoundError("فایل در درایو است ولی درایو الان وصل نیست")
        return await client.download(row.drive_id)
    if getattr(row, "store", "") == "db":
        parts = (await db.execute(
            select(InspectionFileChunk.data).where(InspectionFileChunk.file_id == row.id)
            .order_by(InspectionFileChunk.seq))).scalars().all()
        data = b"".join(parts)
        if not data or len(data) != int(getattr(row, "byte_size", 0) or 0):
            raise FileNotFoundError("تکه‌های فایل در پایگاه‌داده ناقص است")
        return data
    p = getattr(row, "local_path", "") or ""
    if p and Path(p).exists():
        return Path(p).read_bytes()
    raise FileNotFoundError(
        "فایل در دسترس نیست" + (" — روی دیسکِ سرور بود و با دیپلو پاک شد"
                                if getattr(row, "store", "") == "local" else ""))


async def drop_chunks(db, file_id: str) -> None:
    """The database copy goes with its file row — unlike a Drive copy, an orphan
    chunk is unreachable bytes on a 1 GB free-tier database, not evidence."""
    from sqlalchemy import delete

    from app.models.inspection import InspectionFileChunk

    await db.execute(delete(InspectionFileChunk).where(InspectionFileChunk.file_id == file_id))
