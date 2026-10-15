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
* a **reading plan**: everything fits the serving model's REAL context window ⇒ ONE call with the full text of every
  file; too big ⇒ the user's own question is asked of every FULL chunk (exact quotes + locations), the per-chunk
  answers are merged until they fit, and the reply is marked ``reading="chunked"`` with a Persian ``reading_note``
  (every chunk must be read — a failed chunk is retried, then the call FAILS with the list of unread parts; an answer
  cut before its end marker is halved and asked again, then reported ``complete=False``; an over-limit prompt is never sent);
* **images inside** zip/docx/pptx/xlsx/OpenDocument/EPUB go through the same image path as attached images;
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

#: FALLBACK only (review 2026-10-15): the single-pass limit comes from the context window of the model(s) that will
#: actually serve the call (``ResolvedModel.context_window``); this many characters is used when no window is known
SINGLE_CHARS = int(os.getenv("APP_READ_SINGLE_CHARS", "360000"))
#: FALLBACK map chunk when no window is known (≈ 40k tokens), with a small overlap so a sentence on the seam is not lost
CHUNK_CHARS = int(os.getenv("APP_READ_CHUNK_CHARS", "120000"))
#: tokens ⇒ characters, conservatively for mixed Persian/Latin text (Persian runs ≈ 2.5–3 chars/token, Latin ≈ 4)
CHARS_PER_TOKEN = float(os.getenv("APP_READ_CHARS_PER_TOKEN", "2.5"))
#: room kept in every request for the instructions/labels around the text (tokens)
PROMPT_RESERVE_TOKENS = 4000
#: what one inline image costs in the window (tokens; Claude ≈ 1.6k for a large image, Gemini 258)
IMAGE_TOKENS = 1600
#: answer budget of one chunk call / merge call
MAP_ANSWER_TOKENS = 8192
#: the merge of chunk answers is repeated until the final prompt fits; this many rounds at most (then fail honestly)
MAX_MERGE_ROUNDS = 6
#: images inside ONE container file (zip/docx/pptx…) sent to the vision model; beyond ⇒ complete=False, named
EMBED_MAX_IMAGES = int(os.getenv("APP_READ_EMBED_MAX_IMAGES", "120"))
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
        out = {"status": "ok", "text": _app_text(ex.get("text") or "") + "".join(extra), "pages": 0, "note": _app_text(ex.get("note") or ""),
               "truncated": bool(ex.get("truncated"))}
        _cache_put(key, out)
        return out
    if ex["status"] == "image":  # BMP/TIFF/AVIF…: the vision models do not take it — say so, never pretend
        return {"status": "unsupported", "text": "", "pages": 0, "truncated": False,
                "note": "این قالبِ تصویر را مدل‌های بینا مستقیم نمی‌خوانند — همان را PNG یا JPG بفرست"}
    out = {"status": ex["status"], "text": _app_text(ex.get("text") or ""), "pages": ex.get("page_count") or 0,
           "note": _app_text(ex.get("note") or ""), "truncated": bool(ex.get("truncated"))}
    if out["status"] == "ok":
        _cache_put(key, out)
    return out


#: what an image member of an archive says on the page's AI door: its bytes go to the vision model separately
_APP_IMAGE_MEMBER = "تصویر — جداگانه به مدلِ بینا داده می‌شود (شرحش زیرِ «تصویرهای داخلِ فایل» یا خودِ تصویر همراهِ پیام)"


def _app_text(t: str) -> str:
    """Drop the «نظارت و سرکشی»-only hints (``inspection.py pull``) the shared readers write — they mean nothing here,
    because app_reading itself sends every embedded image to the vision model (review 2026-10-15)."""
    from app.services import inspection_files as inf
    from app.services import inspection_formats as fmt

    return (t or "").replace(fmt.ZIP_PULL_HINT, "").replace(inf.IMAGE_NOTE, _APP_IMAGE_MEMBER)


def _container_images(data: bytes, name: str) -> List[Dict[str, Any]]:
    """Images inside a zip/docx/pptx/xlsx/odt/epub (``inspection_formats.embedded_images``); PDFs are not containers."""
    from app.services import inspection_formats as fmt

    if name.lower().endswith(".pdf"):
        return []
    try:
        return fmt.embedded_images(data, name)
    except Exception as exc:  # noqa: BLE001 — a broken container keeps its text; the images are reported unread
        logger.warning("embedded images of %s failed: %r", name, exc)
        return [{"path": "*", "mime": "", "data": b"", "vision": False, "error": type(exc).__name__}]


# ---------------------------------------------------------------------------- the reading plan
# Review 2026-10-15 (owner: «کامل بخواند … خلاصه‌کاری نکند»):
# * the single-pass limit is the REAL context window of the model(s) that will serve the call, not a constant;
# * text bigger than that window is NOT reduced to generic notes: the user's own question is asked of every FULL chunk
#   (each read entirely), with exact quotes + locations, then the per-chunk answers are merged — and the reply says
#   plainly that it was answered chunk by chunk (``reading="chunked"`` + ``reading_note``);
# * a chunk answer cut before its end marker is split in half and asked again once; still cut ⇒ complete=False, named;
# * the merge repeats until the final prompt fits the window — an over-limit prompt is never sent.
_MAP_SYS = ("تو خوانندهٔ دقیقِ یک بخش از پیوست‌هایی هستی که کاربر فرستاده. پیوست‌ها از ظرفیتِ یک بار خواندنِ مدل بزرگ‌تر بودند، "
            "پس هر بخش جداگانه و کامل به تو داده می‌شود و همین درخواستِ کاربر از هر بخش پرسیده می‌شود. این بخش را از اول تا آخر کامل بخوان "
            "و به خودِ درخواستِ کاربر (نه یک خلاصهٔ عمومی) تا جایی که این بخش اجازه می‌دهد پاسخ بده: هر چیزِ مرتبط را با نقلِ قولِ عینی و "
            "جای دقیقش (نامِ فایل، صفحه/اسلاید/کاربرگ/سطر — از نشانه‌هایی مثلِ «--- صفحهٔ N ---» در متن) بیاور؛ عددها، تعریف‌ها، گام‌ها، "
            "جدول‌ها و نام‌های مرتبط را بی‌کم‌وکاست بیاور. اگر این بخش هیچ چیزِ مرتبطی ندارد، دقیقاً بنویس «در این بخش چیزِ مرتبطی نیست» و در "
            "یک سطر بگو این بخش درباره چیست. چیزی از خودت نیفزا و حدس نزن. در پایان دقیقاً بنویس " + END)
_MERGE_SYS = ("تو خوانندهٔ دقیقِ یک بخش از پاسخ‌های بخش‌به‌بخش هستی: پیوست‌های کاربر بزرگ‌تر از یک بار خواندن بودند، هر بخش کامل خوانده "
              "شد و درخواستِ کاربر از هر بخش جداگانه پرسیده شد. پاسخ‌های بخش‌هایی را که می‌بینی در یک پاسخِ متمرکز به همان درخواست ادغام کن: "
              "همهٔ نقلِ قول‌های عینی را با جایشان (فایل، صفحه/اسلاید/سطر) نگه دار، تکرار را یکی کن، بخش‌هایی را که «چیزِ مرتبطی نیست» "
              "گفته‌اند فقط با نامشان بیاور، و هیچ واقعیتِ مرتبطی را حذف نکن. چیزی از خودت نیفزا. در پایان دقیقاً بنویس " + END)
#: what the page shows when the answer was built chunk by chunk (also in the API response as ``reading_note``)
CHUNKED_NOTE = ("این پاسخ بخش‌به‌بخش ساخته شد: پیوست‌ها از ظرفیتِ یک بار خواندنِ مدل بزرگ‌تر بودند، پس هر بخش کامل خوانده شد، "
                "همین پرسش از هر بخش جداگانه پرسیده شد و پاسخ‌ها با نقلِ قول و جایشان ادغام شدند.")


def _tokens_to_chars(window_tokens: int, answer_tokens: int, extra_tokens: int = 0) -> int:
    room = int(window_tokens) - int(answer_tokens) - PROMPT_RESERVE_TOKENS - int(extra_tokens)
    return max(4000, int(room * CHARS_PER_TOKEN))


async def window_chars(db, task: str, answer_tokens: int, *, need: Optional[str] = None, images: int = 0) -> Tuple[int, Optional[int]]:
    """``(chars, window_tokens)`` — how many characters ONE request for ``task`` may carry (prompt + system), from the
    context window of the models the gateway will try for it (the pin, then the automatic order; the gateway falls
    over between them, so the SMALLEST window decides). A candidate with no known window counts as the
    ``SINGLE_CHARS`` fallback; no candidate at all ⇒ the fallback alone."""
    from app.services.ai.manager import ai_manager

    try:
        rms = await ai_manager.candidates(db, task, need=need)
        if not rms and task != "general" and need is None:  # the gateway's own fallback for text calls
            rms = await ai_manager.candidates(db, "general")
    except Exception as exc:  # noqa: BLE001 — sizing must never break the call
        logger.warning("app_reading window lookup failed: %r", exc)
        rms = []
    fallback = SINGLE_CHARS
    sizes, known = [], []
    for rm in rms:
        w = getattr(rm, "context_window", None)
        if w:
            known.append(int(w))
            sizes.append(_tokens_to_chars(int(w), answer_tokens, images * IMAGE_TOKENS))
        else:
            sizes.append(fallback)
    if not sizes:
        return fallback, None
    return min(sizes), (min(known) if known else None)


def _halve(chunk: str) -> Tuple[str, str]:
    """Two halves at a line/sentence break near the middle, overlapping by ``OVERLAP`` (nothing on the seam is lost)."""
    mid = len(chunk) // 2
    k = -1
    for sep in ("\n\n", "\n", ". ", "؟", "?", "!", " "):
        k = chunk.rfind(sep, max(1, mid - 4000), mid + 1)
        if k > 0:
            k += len(sep)
            break
    if k <= 0:
        k = mid
    return chunk[:k], chunk[max(0, k - OVERLAP):]


async def _ask_chunk(db, task: str, system: str, request: str, label: str, chunk: str) -> Tuple[str, bool]:
    """``(answer, ended)`` — ``ended=False`` ⇒ the answer stopped before its end marker (cut at the budget)."""
    from app.services.ai.inference_gateway import complete

    last = ""
    for _ in range(2):
        res = await complete(db, f"# درخواستِ کاربر\n{request}\n\n# {label}\n{chunk}", task=task,
                             system=system, max_tokens=MAP_ANSWER_TOKENS)
        t = res.get("text") or ""
        if res.get("ok") and t.strip():
            if END in t:
                return t.split(END)[0].strip(), True
            return t.strip(), False
        last = res.get("error") or "پاسخ خالی"
    raise RuntimeError(f"{label} خوانده نشد: {last}")


async def _map_chunk(db, task: str, request: str, label: str, chunk: str, system: str = _MAP_SYS) -> List[Dict[str, Any]]:
    """The user's question asked of ONE full chunk. ``[{label, text, ended}]`` — one item, or two when the answer was
    cut before its end marker: then the chunk is split in half and each half asked once more (never kept silently)."""
    text, ended = await _ask_chunk(db, task, system, request, label, chunk)
    if ended:
        return [{"label": label, "text": text, "ended": True}]
    logger.warning("app_reading: answer for %s cut before its end marker — halving and asking again", label)
    out = []
    for k, half in enumerate(_halve(chunk), 1):
        lb = f"{label} — نیمهٔ {k} از ۲"
        t2, ok2 = await _ask_chunk(db, task, system, request, lb, half)
        out.append({"label": lb, "text": t2, "ended": ok2})
    return out


async def _describe_image(db, task: str, name: str, mime: str, data: bytes) -> str:
    from app.services.ai.inference_gateway import complete_multimodal

    res = await complete_multimodal(db, "این تصویر را کامل بخوان: هر متنی که در آن هست را عیناً بنویس و هر چیزِ دیگرش "
                                        "(نمودار، جدول، دست‌نوشته، صحنه) را دقیق شرح بده. چیزی را جا نینداز.",
                                    [{"filename": name, "mimetype": mime or "image/png", "data": data}],
                                    task=task, max_tokens=4096)
    if not res.get("ok"):
        raise RuntimeError(f"تصویرِ «{name}» خوانده نشد: {res.get('error')}")
    return res.get("text") or ""


def _add_note(entry: Dict[str, Any], note: str) -> None:
    entry["note"] = (entry.get("note") + " — " if entry.get("note") else "") + note


async def answer_with_files(db, *, user_id: int, app: str, file_ids: List[int], task: str, system: Optional[str],
                            user: str, max_tokens: int) -> Dict[str, Any]:
    """The whole call: read every file completely, then answer. Returns ``{ok, text, model, files, mode, reading,
    reading_note}`` or ``{ok: False, error, files}`` naming exactly what could not be read."""
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

    texts: List[Tuple[str, str, Dict[str, Any]]] = []  # (name, text, manifest entry)
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
            texts.append((row.name, head + "\n" + r["text"], entry))
        if r["status"] == "ok" and not r.get("image"):
            # images INSIDE a zip/docx/pptx… go through the same image path as attached images (review 2026-10-15)
            emb = await asyncio.to_thread(_container_images, data, row.name or "")
            seen_hash, vis, bad = set(), [], []
            for e in emb:
                if not e.get("vision"):
                    bad.append(e["path"])
                    continue
                h = hash(e["data"])
                if h in seen_hash:  # the same logo on every slide is read once
                    continue
                seen_hash.add(h)
                vis.append(e)
            if len(vis) > EMBED_MAX_IMAGES:
                entry["complete"] = False
                _add_note(entry, f"فقط {EMBED_MAX_IMAGES} تصویرِ اول از {len(vis)} تصویرِ داخلِ فایل به مدلِ بینا داده شد؛ بقیه خوانده نشد: "
                                 + "، ".join(x["path"] for x in vis[EMBED_MAX_IMAGES:][:20]) + ("…" if len(vis) - EMBED_MAX_IMAGES > 20 else ""))
                vis = vis[:EMBED_MAX_IMAGES]
            if bad:
                entry["complete"] = False
                _add_note(entry, f"{len(bad)} تصویرِ داخلِ فایل در قالبی است که مدل‌های بینا نمی‌خوانند و خوانده نشد: "
                                 + "، ".join(bad[:20]) + ("…" if len(bad) > 20 else ""))
            if vis:
                entry["embedded_images"] = len(vis)
            for e in vis:
                images.append({"filename": f"{row.name} › {e['path']}", "mimetype": e["mime"], "data": e["data"],
                               "_entry": entry, "_embedded": True})

    unread = [m for m in manifest if m["status"] in ("failed", "missing", "unsupported") or m.get("complete") is False]
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
                title = "تصویرِ داخلِ فایل" if img.get("_embedded") else "تصویر"
                texts.append((img["filename"], f"=== {title}: «{img['filename']}» — خوانده‌شده کامل ===\n{d}", img["_entry"]))
                img["_entry"]["chars"] = (img["_entry"].get("chars") or 0) + len(d)
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": str(exc)[:400], "files": manifest}
    else:
        inline = [{k: v for k, v in i.items() if not k.startswith("_")} for i in images]

    # ---- how much ONE request may carry: the real window of the serving model(s), minus the answer and the images
    final_need = "vision" if inline else None
    final_chars, window = await window_chars(db, task, max_tokens, need=final_need, images=len(inline))
    map_chars, map_window = await window_chars(db, task, MAP_ANSWER_TOKENS)
    status_reserve = 400 * max(1, len(manifest)) + 2000
    body_budget = final_chars - len(user) - len(system or "") - status_reserve
    # the question asked of every chunk is the user's own request; a request bigger than a quarter of the chunk
    # budget is cut in the CHUNK calls only (the final call always gets it whole)
    req = user if len(user) <= map_chars // 4 else user[: map_chars // 4] + "\n[… ادامهٔ درخواست در این فراخوانِ بخشی نیامد]"
    # a known window ⇒ chunks as large as one call can take (fewer, fuller chunks); unknown ⇒ the old CHUNK_CHARS
    chunk_size = (max(8000, map_chars - len(_MAP_SYS) - len(req) - 1000) if map_window is not None
                  else min(CHUNK_CHARS, max(8000, map_chars - len(_MAP_SYS) - len(req) - 1000)))

    total = sum(len(t) for _, t, _e in texts)
    mode, reading = "single", "single"
    if total + 2 * len(texts) <= body_budget:
        body = "\n\n".join(t for _, t, _e in texts)
    else:
        mode, reading = "map", "chunked"
        jobs = []
        for name, t, entry in texts:
            parts = split_text(t, size=chunk_size)
            pos = 0
            for k, c in enumerate(parts, 1):
                start = t.find(c[:200], max(0, pos - OVERLAP - 1)) if c else pos
                start = start if start >= 0 else pos
                pos = start + len(c)
                jobs.append((f"بخشِ {k} از {len(parts)} ِ «{name}» (نویسه‌های {start + 1} تا {pos} از {len(t)})", c, entry))
        sem = asyncio.Semaphore(CONCURRENCY)

        async def run(label, c, sys_=_MAP_SYS):
            async with sem:
                return await _map_chunk(db, task, req, label, c, sys_)

        try:
            answers = await asyncio.gather(*(run(lb, c) for lb, c, _e in jobs))
        except Exception as exc:  # noqa: BLE001 — never answer from a partial read
            return {"ok": False, "error": f"خواندنِ کاملِ پیوست‌ها تمام نشد: {exc}"[:500], "files": manifest}
        pieces: List[Tuple[str, str]] = []
        cut: Dict[int, Tuple[Dict[str, Any], List[str]]] = {}
        for (lb, _c, entry), items in zip(jobs, answers):
            for it in items:
                pieces.append((it["label"], it["text"]))
                if not it["ended"]:
                    cut.setdefault(id(entry), (entry, []))[1].append(it["label"])
        for entry, labels in cut.values():  # one note per file, naming the chunks
            entry["complete"] = False
            _add_note(entry, f"پاسخِ مدل برای {len(labels)} بخش حتی پس از نصف‌کردن پیش از پایان بریده شد (ممکن است ناقص باشد): "
                             + "، ".join(f"«{x}»" for x in labels[:6]) + ("…" if len(labels) > 6 else ""))
            if entry not in unread:
                unread.append(entry)
        for m in manifest:
            m["mode"] = "map"
        body = "\n\n".join(f"--- {lb} ---\n{n}" for lb, n in pieces)
        # merge until the final prompt FITS — never send an over-limit prompt
        rounds = 0
        while len(body) > body_budget:
            rounds += 1
            if rounds > MAX_MERGE_ROUNDS:
                return {"ok": False, "files": manifest,
                        "error": f"پاسخ‌های بخش‌به‌بخش پس از {MAX_MERGE_ROUNDS} دور ادغام هنوز از ظرفیتِ مدل ({final_chars} نویسه) بزرگ‌تر بود؛ "
                                 "پرسش را مشخص‌تر کن یا پیوست‌ها را در چند پرسش بفرست."}
            parts = split_text(body, size=min(chunk_size, max(8000, body_budget)))
            try:
                merged = await asyncio.gather(*(run(f"ادغامِ پاسخ‌ها — دورِ {rounds}، بخشِ {k} از {len(parts)}", c, _MERGE_SYS)
                                                for k, c in enumerate(parts, 1)))
            except Exception as exc:  # noqa: BLE001
                return {"ok": False, "error": f"ادغامِ پاسخ‌های بخش‌به‌بخش تمام نشد: {exc}"[:500], "files": manifest}
            flat = [it for items in merged for it in items]
            for it in flat:
                if not it["ended"]:
                    for m in manifest:
                        if m.get("status") == "ok" and m.get("complete") is not False:
                            m["complete"] = False
                            _add_note(m, f"ادغامِ «{it['label']}» پیش از پایان بریده شد — ممکن است ناقص باشد")
            new_body = "\n\n".join(f"--- {it['label']} ---\n{it['text']}" for it in flat)
            if len(new_body) >= len(body):  # no progress: the model does not shorten — stop instead of looping
                return {"ok": False, "files": manifest,
                        "error": "ادغامِ پاسخ‌های بخش‌به‌بخش کوتاه‌تر نشد و در ظرفیتِ مدل جا نمی‌شود؛ پرسش را مشخص‌تر کن یا پیوست‌ها را جدا بفرست."}
            body = new_body

    intro = ("\n\n# متنِ کاملِ پیوست‌ها (همهٔ فایل‌ها، بی‌حذف)\n" if mode == "single" else
             f"\n\n# پاسخ‌های بخش‌به‌بخش از همهٔ {len(texts)} پیوست — {CHUNKED_NOTE}\n"
             "اگر قالبِ خواسته‌شده متنِ آزاد است، در پاسخ صریحاً بگو که پیوست‌ها بخش‌به‌بخش خوانده و پاسخ داده شدند؛ "
             "اگر قالبِ خاصی (مثلاً JSON) خواسته شده، همان قالب را نگه دار.\n")
    status_lines = "\n".join(f"- «{m['name']}»: {m['status']}" + ("" if m.get("complete", True) else " (ناقص)")
                             + (f" — {m['note']}" if m.get("note") else "") for m in manifest)
    prompt = user + (intro + body if body else "") + "\n\n# وضعِ خواندنِ پیوست‌ها\n" + status_lines + (
        "\nاگر فایلی «unsupported/failed/missing» یا «ناقص» است، صادقانه بگو که آن را (کامل) نخوانده‌ای؛ از محتوایش حدس نزن." if unread else "")
    if len(prompt) + len(system or "") > final_chars:  # the guard: an over-limit prompt is never sent
        return {"ok": False, "files": manifest,
                "error": f"درخواست با پیوست‌ها ({len(prompt) + len(system or '')} نویسه) از ظرفیتِ مدل ({final_chars} نویسه) بزرگ‌تر ماند؛ فرستاده نشد."}
    if inline:
        res = await complete_multimodal(db, prompt, inline, task=task, system=system, max_tokens=max_tokens)
    else:
        res = await complete(db, prompt, task=task, system=system, max_tokens=max_tokens)
    if not res.get("ok"):
        return {"ok": False, "error": res.get("error") or "no_model", "files": manifest}
    return {"ok": True, "text": res.get("text") or "", "model": res.get("model"), "files": manifest, "mode": mode,
            "reading": reading, "reading_note": CHUNKED_NOTE if reading == "chunked" else "",
            "window_tokens": window, "single_pass_chars": final_chars}
