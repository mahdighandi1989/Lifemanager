"""Read an app record's attachments COMPLETELY for one AI call (owner 2026-10-14).

«در همهٔ قسمت‌ها که فایل پیوست می‌دهم باید کامل بتواند بخواند و بفهمد و خلاصه‌کاری نکند … هر چقدر هم زیاد باشد،
چه در یک فایل و چه در تعدادِ مختلف و با حجم‌های مختلف … و فرمت‌های بیشتری پوشش بده».

The previous path (``app_records._attachment_bytes``) sent at most 4 images/PDFs of ≤ 8 MB inline and SILENTLY
dropped every other file. This module reuses the «نظارت و سرکشی» readers (``inspection_files.extract`` — PDF, Word
.docx/.doc, PowerPoint, Excel .xlsx/.xls, RTF, OpenDocument, EPUB, e-mail .eml/.msg, HTML, CSV, text/code, ZIP
recursively; ``inspection_media.transcribe`` — audio/video transcribed IN FULL with an end marker) and adds:

* **scanned PDF pages** are read by a documents-capable model, page batches of ≤ 10, a batch cut off before its end
  marker is split in half and asked again (never kept half-read) — detective's ``pdfOcr`` technique;
* **images** go to the vision model inline while the batch fits one request; beyond that each image is first fully
  transcribed/described on its own (so 40 screenshots are all seen, none dropped);
* a **reading plan**: everything fits ⇒ ONE call with the full text of every file; too big for one call ⇒
  map-reduce over ordered chunks (every chunk must be read — a failed chunk is retried, then the call FAILS with the
  list of unread parts, it never answers from a partial read);
* a **manifest** returned to the page: per file, status, characters and pages read, and how (``single``/``map``).

Bytes stay in Drive (owner: «پایگاه را شلوغ نکند»): nothing extracted is written to the database; an in-process
cache keeps recent extractions so a multi-turn chat does not re-download/re-OCR the same file.
"""
from __future__ import annotations

import asyncio
import io
import logging
import os
from collections import OrderedDict
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

#: whole text of all files sent in ONE call up to this many characters (≈ 120k tokens); beyond ⇒ map-reduce
SINGLE_CHARS = int(os.getenv("APP_READ_SINGLE_CHARS", "360000"))
#: one map chunk (≈ 40k tokens), with a small overlap so a sentence on the seam is not lost
CHUNK_CHARS = int(os.getenv("APP_READ_CHUNK_CHARS", "120000"))
OVERLAP = 1500
#: inline image budget for one request (Gemini's inline request limit is ~20 MB)
INLINE_IMAGE_BYTES = 15 * 1024 * 1024
INLINE_IMAGE_COUNT = 16
OCR_BATCH = 10
OCR_MAX_PAGES = int(os.getenv("APP_READ_OCR_MAX_PAGES", "1500"))
CONCURRENCY = 3
END = "<<END>>"
_CACHE: "OrderedDict[Tuple[int, str], Dict[str, Any]]" = OrderedDict()
_CACHE_MAX_CHARS = 60_000_000

_IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic", ".heif")
_VISION_MIMES = ("image/png", "image/jpeg", "image/webp", "image/gif", "image/heic", "image/heif")


def _cache_get(key):
    v = _CACHE.get(key)
    if v is not None:
        _CACHE.move_to_end(key)
    return v


def _cache_put(key, val):
    _CACHE[key] = val
    total = sum(len(v.get("text") or "") for v in _CACHE.values())
    while _CACHE and total > _CACHE_MAX_CHARS:
        _, old = _CACHE.popitem(last=False)
        total -= len(old.get("text") or "")


def is_image(name: str, mime: str) -> bool:
    """An image the vision models accept as-is (PNG/JPEG/WebP/GIF/HEIC). BMP/TIFF/… are reported, not guessed."""
    n, m = (name or "").lower(), (mime or "").lower()
    return m in _VISION_MIMES or (not m.startswith("image/svg") and n.endswith(_IMAGE_EXT) and not n.endswith(".avif"))


def split_text(text: str, size: Optional[int] = None, overlap: int = OVERLAP) -> List[str]:
    """Ordered chunks that cover EVERY character (cut at a paragraph/sentence break near the edge)."""
    size = size or CHUNK_CHARS
    if len(text) <= size:
        return [text]
    out, i, n = [], 0, len(text)
    while i < n:
        end = min(n, i + size)
        if end < n:
            window = text[max(i + size // 2, end - 4000):end]
            for sep in ("\n\n", "\n", ". ", "。", "؟", "?", "!"):
                k = window.rfind(sep)
                if k > 0:
                    end = max(i + size // 2, end - 4000) + k + len(sep)
                    break
        out.append(text[i:end])
        if end >= n:
            break
        i = max(end - overlap, i + 1)
    return out


# ---------------------------------------------------------------------------- scanned PDF pages
def _pdf_pages(data: bytes) -> Tuple[List[str], int]:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    if reader.is_encrypted:
        reader.decrypt("")
    texts = []
    for p in reader.pages:
        try:
            texts.append(p.extract_text() or "")
        except Exception:  # noqa: BLE001 — a broken page becomes an «OCR me» page
            texts.append("")
    return texts, len(reader.pages)


def _pdf_slice(data: bytes, pages: List[int]) -> bytes:
    from pypdf import PdfReader, PdfWriter

    reader = PdfReader(io.BytesIO(data))
    if reader.is_encrypted:
        reader.decrypt("")
    w = PdfWriter()
    for i in pages:
        w.add_page(reader.pages[i])
    buf = io.BytesIO()
    w.write(buf)
    return buf.getvalue()


_OCR_PROMPT = ("این {n} صفحه از یک PDF ِ اسکن‌شده است (صفحه‌های {first} تا {last} ِ سند). متنِ کاملِ هر صفحه را عیناً و "
               "بی‌حذف بنویس — همهٔ سطرها، جدول‌ها (با | ستون‌ها را جدا کن)، فرمول‌ها، زیرنویس‌ها؛ تصویر/نمودار را در یک خط شرح بده. "
               "خلاصه نکن، ترجمه نکن، چیزی نیفزا. پیش از هر صفحه بنویس «--- صفحهٔ N ---». در پایان دقیقاً بنویس " + END)


async def _ocr_batch(db, data: bytes, pages: List[int], task: str, depth: int = 0) -> Dict[int, str]:
    from app.services.ai.inference_gateway import complete_multimodal

    pdf = await asyncio.to_thread(_pdf_slice, data, pages)
    res = await complete_multimodal(db, _OCR_PROMPT.format(n=len(pages), first=pages[0] + 1, last=pages[-1] + 1),
                                    [{"filename": "pages.pdf", "mimetype": "application/pdf", "data": pdf}],
                                    task=task, max_tokens=8192)
    text = res.get("text") or ""
    if res.get("ok") and END in text:
        body = text.split(END)[0]
        return {pages[0]: body}  # keyed by the batch's first page; markers inside keep page numbers
    if len(pages) > 1 and depth < 4:  # cut off or failed ⇒ halve and ask again — never keep half a batch
        mid = len(pages) // 2
        a = await _ocr_batch(db, data, pages[:mid], task, depth + 1)
        b = await _ocr_batch(db, data, pages[mid:], task, depth + 1)
        return {**a, **b}
    raise RuntimeError(f"صفحهٔ {pages[0] + 1} ِ PDF ِ اسکن‌شده خوانده نشد: {res.get('error') or 'پاسخ به پایان نرسید'}")


async def read_scanned_pdf(db, data: bytes, task: str) -> Dict[str, Any]:
    """Full text of a PDF: the text layer where it exists, a documents-capable model for every page without one."""
    texts, n = await asyncio.to_thread(_pdf_pages, data)
    scanned = [i for i, t in enumerate(texts) if len((t or "").strip()) < 20]
    note = ""
    if len(scanned) > OCR_MAX_PAGES:
        note = f"فقط {OCR_MAX_PAGES} صفحهٔ اسکن‌شدهٔ اول خوانده شد از {len(scanned)}"
        scanned = scanned[:OCR_MAX_PAGES]
    groups: List[List[int]] = []
    for i in scanned:  # consecutive runs, ≤ OCR_BATCH each
        if groups and groups[-1][-1] == i - 1 and len(groups[-1]) < OCR_BATCH:
            groups[-1].append(i)
        else:
            groups.append([i])
    sem = asyncio.Semaphore(CONCURRENCY)

    async def one(g):
        async with sem:
            return await _ocr_batch(db, data, g, task)

    results = await asyncio.gather(*(one(g) for g in groups)) if groups else []
    ocr: Dict[int, str] = {}
    for r in results:
        ocr.update(r)
    parts, done_ocr = [], set()
    for g in groups:
        done_ocr.update(g)
    for i, t in enumerate(texts):
        if i in ocr:
            parts.append("\n" + ocr[i].strip())
        elif i in done_ocr:
            continue  # inside a batch whose text is already placed at the batch's first page
        else:
            parts.append(f"\n--- صفحهٔ {i + 1} ---\n{t}")
    return {"status": "ok", "text": "".join(parts), "pages": n, "ocr_pages": len(done_ocr),
            "truncated": bool(note), "note": note or (f"{len(done_ocr)} صفحهٔ اسکن‌شده با مدلِ بینا خوانده شد" if done_ocr else "")}


# ---------------------------------------------------------------------------- one file
async def read_one(db, row, data: bytes, task: str) -> Dict[str, Any]:
    """`{status, text, pages, note, truncated, image}` — ``image=True`` ⇒ the bytes go to the vision model."""
    from app.services import inspection_files as inf
    from app.services import inspection_formats as fmt

    key = (row.id, row.drive_id or "")
    hit = _cache_get(key)
    if hit is not None:
        return hit
    name, mime = row.name or "file", (row.mime or "").lower()
    if is_image(name, mime):
        out = {"status": "image", "text": "", "pages": 0, "note": "تصویر — مدلِ بینا خودِ تصویر را می‌بیند", "image": True}
        return out  # not cached (bytes are needed anyway)
    if fmt.is_media(name, mime):
        from app.services.inspection_media import transcribe

        t = await transcribe(db, data, name, mime)
        out = {"status": "ok" if t.get("ok") else "failed", "text": t.get("text") or "", "pages": 0,
               "note": t.get("note") or "", "truncated": bool(t.get("truncated"))}
        if t.get("ok"):
            _cache_put(key, out)
        return out
    ex = await asyncio.to_thread(inf.extract, data, name, mime)
    is_pdf = name.lower().endswith(".pdf") or mime == "application/pdf"
    if is_pdf and (ex["status"] == "unsupported" or ex.get("truncated")):
        try:
            out = await read_scanned_pdf(db, data, task)
        except Exception as exc:  # noqa: BLE001 — say exactly what was not read
            out = {"status": "failed", "text": ex.get("text") or "", "pages": ex.get("page_count") or 0,
                   "note": f"{ex.get('note') or ''} — خواندنِ صفحه‌های اسکن‌شده ناموفق: {exc}"[:500], "truncated": True}
        if out["status"] == "ok":
            _cache_put(key, out)
        return out
    if ex["status"] == "pending":  # a ZIP with audio/video inside — transcribe every member
        from app.services.inspection_media import transcribe_zip_members

        extra = []
        for member, t in await transcribe_zip_members(db, data):
            extra.append(f"\n=== {member} (رونویسیِ کامل) ===\n{t.get('text') or ('[رونویسی نشد: ' + (t.get('note') or '') + ']')}")
        out = {"status": "ok", "text": (ex.get("text") or "") + "".join(extra), "pages": 0, "note": ex.get("note") or "",
               "truncated": bool(ex.get("truncated"))}
        _cache_put(key, out)
        return out
    if ex["status"] == "image":  # BMP/TIFF/AVIF…: the vision models do not take it — say so, never pretend
        return {"status": "unsupported", "text": "", "pages": 0, "truncated": False,
                "note": "این قالبِ تصویر را مدل‌های بینا مستقیم نمی‌خوانند — همان را PNG یا JPG بفرست"}
    out = {"status": ex["status"], "text": ex.get("text") or "", "pages": ex.get("page_count") or 0,
           "note": ex.get("note") or "", "truncated": bool(ex.get("truncated"))}
    if out["status"] == "ok":
        _cache_put(key, out)
    return out


# ---------------------------------------------------------------------------- the reading plan
_MAP_SYS = ("تو خوانندهٔ دقیقِ یک بخش از سندی هستی که کاربر پیوست کرده. درخواستِ کاربر را می‌بینی. از این بخش، "
            "(۱) هر چیزی را که به درخواست مربوط است کامل و عینی بیرون بکش — جمله‌ها را نقلِ قول کن، عددها، تعریف‌ها، "
            "گام‌ها، جدول‌ها و نام‌ها را بی‌کم‌وکاست بیاور؛ (۲) سپس فهرستِ کاملِ موضوع‌ها و ادعاهای دیگرِ این بخش را "
            "(هر کدام یک سطر) بنویس تا چیزی ناخوانده نماند. چیزی از خودت نیفزا و حدس نزن. در پایان دقیقاً بنویس " + END)


async def _map_chunk(db, task: str, request: str, label: str, chunk: str) -> str:
    from app.services.ai.inference_gateway import complete

    last = ""
    for _ in range(2):
        res = await complete(db, f"# درخواستِ کاربر\n{request[:8000]}\n\n# {label}\n{chunk}", task=task,
                             system=_MAP_SYS, max_tokens=8192)
        t = res.get("text") or ""
        if res.get("ok") and t.strip():
            return t.split(END)[0].strip()  # no END ⇒ long notes cut at the budget: kept, they are still notes
        last = res.get("error") or "پاسخ خالی"
    raise RuntimeError(f"{label} خوانده نشد: {last}")


async def _describe_image(db, task: str, name: str, mime: str, data: bytes) -> str:
    from app.services.ai.inference_gateway import complete_multimodal

    res = await complete_multimodal(db, "این تصویر را کامل بخوان: هر متنی که در آن هست را عیناً بنویس و هر چیزِ دیگرش "
                                        "(نمودار، جدول، دست‌نوشته، صحنه) را دقیق شرح بده. چیزی را جا نینداز.",
                                    [{"filename": name, "mimetype": mime or "image/png", "data": data}],
                                    task=task, max_tokens=4096)
    if not res.get("ok"):
        raise RuntimeError(f"تصویرِ «{name}» خوانده نشد: {res.get('error')}")
    return res.get("text") or ""


async def answer_with_files(db, *, user_id: int, app: str, file_ids: List[int], task: str, system: Optional[str],
                            user: str, max_tokens: int) -> Dict[str, Any]:
    """The whole call: read every file completely, then answer. Returns ``{ok, text, model, files, mode}`` or
    ``{ok: False, error, files}`` naming exactly what could not be read."""
    from sqlalchemy import select

    from app.models.app_file import AppFile
    from app.services.ai.inference_gateway import complete, complete_multimodal
    from app.services.google_api_client import build_drive_client

    rows = (await db.execute(select(AppFile).where(AppFile.id.in_(file_ids), AppFile.user_id == user_id,
                                                   AppFile.app == app))).scalars().all()
    by_id = {r.id: r for r in rows if not r.deleted}
    manifest: List[Dict[str, Any]] = [{"id": i, "name": "?", "status": "missing", "note": "پیوست پیدا نشد یا حذف شده"}
                                      for i in file_ids if i not in by_id]
    if not by_id:
        return {"ok": False, "error": "پیوستی برای خواندن پیدا نشد", "files": manifest}
    drive = await build_drive_client(db)
    if drive is None:
        return {"ok": False, "error": "گوگل درایو وصل نیست؛ پیوست‌ها خوانده نشدند.", "files": manifest}

    texts: List[Tuple[str, str]] = []
    images: List[Dict[str, Any]] = []
    for fid in file_ids:
        row = by_id.get(fid)
        if row is None:
            continue
        try:
            data = await drive.download(row.drive_id)
        except Exception as exc:  # noqa: BLE001
            manifest.append({"id": fid, "name": row.name, "status": "failed", "note": f"دانلود از درایو ناموفق: {type(exc).__name__}"})
            continue
        r = await read_one(db, row, data, task)
        entry = {"id": fid, "name": row.name, "status": r["status"], "chars": len(r.get("text") or ""),
                 "pages": r.get("pages") or 0, "note": r.get("note") or "", "complete": r["status"] in ("ok", "image") and not r.get("truncated")}
        manifest.append(entry)
        if r.get("image"):
            images.append({"filename": row.name, "mimetype": row.mime or "image/png", "data": data, "_entry": entry})
        elif r.get("text"):
            head = f"=== فایل: «{row.name}» — {r['status']}" + (f"، {r['pages']} صفحه" if r.get("pages") else "") + \
                   (f" — {r['note']}" if r.get("note") else "") + " ==="
            texts.append((row.name, head + "\n" + r["text"]))

    unread = [m for m in manifest if m["status"] in ("failed", "missing", "unsupported")]
    # images beyond one request's inline budget: each read on its own first (all seen, none dropped)
    inline: List[Dict[str, Any]] = []
    total_img = sum(len(i["data"]) for i in images)
    if images and (total_img > INLINE_IMAGE_BYTES or len(images) > INLINE_IMAGE_COUNT):
        sem = asyncio.Semaphore(CONCURRENCY)

        async def desc(img):
            async with sem:
                return img, await _describe_image(db, task, img["filename"], img["mimetype"], img["data"])

        try:
            for img, d in await asyncio.gather(*(desc(i) for i in images)):
                texts.append((img["filename"], f"=== تصویر: «{img['filename']}» — خوانده‌شده کامل ===\n{d}"))
                img["_entry"]["chars"] = len(d)
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": str(exc)[:400], "files": manifest}
    else:
        inline = [{k: v for k, v in i.items() if k != "_entry"} for i in images]

    total = sum(len(t) for _, t in texts)
    mode = "single"
    if total <= SINGLE_CHARS:
        body = "\n\n".join(t for _, t in texts)
    else:
        mode = "map"
        jobs = []
        for name, t in texts:
            parts = split_text(t)
            for k, c in enumerate(parts, 1):
                jobs.append((f"بخشِ {k} از {len(parts)} ِ «{name}»", c))
        sem = asyncio.Semaphore(CONCURRENCY)

        async def run(label, c):
            async with sem:
                return label, await _map_chunk(db, task, user, label, c)

        try:
            notes = await asyncio.gather(*(run(lb, c) for lb, c in jobs))
        except Exception as exc:  # noqa: BLE001 — never answer from a partial read
            return {"ok": False, "error": f"خواندنِ کاملِ پیوست‌ها تمام نشد: {exc}"[:500], "files": manifest}
        body = "\n\n".join(f"--- {lb} ---\n{n}" for lb, n in notes)
        for m in manifest:
            m["mode"] = "map"
        if len(body) > SINGLE_CHARS:  # second level: the notes themselves, read in full the same way
            parts = split_text(body)
            try:
                notes2 = await asyncio.gather(*(run(f"یادداشت‌های {k} از {len(parts)}", c) for k, c in enumerate(parts, 1)))
            except Exception as exc:  # noqa: BLE001
                return {"ok": False, "error": f"خواندنِ کاملِ پیوست‌ها تمام نشد: {exc}"[:500], "files": manifest}
            body = "\n\n".join(f"--- {lb} ---\n{n}" for lb, n in notes2)

    intro = ("\n\n# متنِ کاملِ پیوست‌ها (همهٔ فایل‌ها، بی‌حذف)\n" if mode == "single" else
             f"\n\n# یادداشت‌های کامل از همهٔ {len(texts)} پیوست (هر بخش جداگانه و کامل خوانده شد؛ سند بزرگ‌تر از یک بار خواندن بود)\n")
    status_lines = "\n".join(f"- «{m['name']}»: {m['status']}" + (f" — {m['note']}" if m.get("note") else "") for m in manifest)
    prompt = user + (intro + body if body else "") + "\n\n# وضعِ خواندنِ پیوست‌ها\n" + status_lines + (
        "\nاگر فایلی «unsupported/failed/missing» است، صادقانه بگو که آن را نخوانده‌ای؛ از محتوایش حدس نزن." if unread else "")
    if inline:
        res = await complete_multimodal(db, prompt, inline, task=task, system=system, max_tokens=max_tokens)
    else:
        res = await complete(db, prompt, task=task, system=system, max_tokens=max_tokens)
    if not res.get("ok"):
        return {"ok": False, "error": res.get("error") or "no_model", "files": manifest}
    return {"ok": True, "text": res.get("text") or "", "model": res.get("model"), "files": manifest, "mode": mode}
