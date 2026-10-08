"""Audio and video on «نظارت و سرکشی» sheets — read IN FULL, as text.

The owner (2026-10-08): «صدا و ویدیو هم باید بشه … و حتی کامل هم خونده بشه نه
خلاصه و یا اوایل اون فایل». The supervisor cannot hear, so the server turns the
media into a COMPLETE verbatim transcript with timestamps (and, for video, a
running description of what is on screen and any text shown), and the usual
read-debt rule then makes the supervisor read all of it.

How it stays complete:
  * the model is told to transcribe verbatim — no summary, nothing skipped — and
    to end with an explicit «<<END>>» marker;
  * when an answer stops before the marker (output-token ceiling), the SAME file
    is asked again «continue exactly from …» until the marker comes, up to
    `MAX_ROUNDS`; hitting that cap is recorded as `truncated`, never hidden;
  * files above the inline limit go through Gemini's Files API (resumable
    upload), so the 100 MB attachment ceiling applies, not a 20 MB one.

The model is whatever audio-capable model the app's AI catalog has enabled
(today that means a Gemini model); no key is read from anywhere else.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

INLINE_MAX = 15 * 1024 * 1024
MAX_ROUNDS = 40
END = "<<END>>"

PROMPT = (
    "این فایل را **کامل و کلمه‌به‌کلمه** به متن برگردان — به همان زبانی که گفته می‌شود. "
    "خلاصه نکن، چیزی را جا نینداز، تکرارها و مکث‌ها را هم بنویس. هر حدودِ ۳۰ ثانیه یک برچسبِ زمان "
    "[hh:mm:ss] بگذار؛ اگر چند گوینده هست، گوینده‌ها را از هم جدا کن (گوینده ۱، گوینده ۲، …). "
    "صداهای غیرِگفتاری را در [کروشه] بنویس (موسیقی، سکوت، خنده). "
    "{video}"
    "وقتی واقعاً به آخرِ فایل رسیدی، در یک خطِ جدا دقیقاً بنویس: " + END
)
VIDEO_EXTRA = (
    "این یک ویدیو است: علاوه بر گفتار، در هر تغییرِ صحنه یک خطِ «[تصویر hh:mm:ss: …]» بنویس که "
    "دقیقاً چه چیزی روی صفحه دیده می‌شود، و هر نوشته‌ای که روی تصویر هست را **عیناً** بیاور. "
)
CONTINUE = ("ادامه بده — دقیقاً از همان‌جایی که متنِ قبلی‌ات تمام شد (آخرین بخش: «{tail}»)، "
            "بدونِ تکرار و بدونِ خلاصه، تا آخرِ فایل؛ و در پایان دقیقاً بنویس: " + END)


async def pick_model(db):
    """The first enabled, configured, audio-capable Gemini model — or None."""
    from app.services.ai.manager import ai_manager

    for m in await ai_manager.capable_models(db, "audio"):
        rm = await ai_manager.resolve_specific(db, m.id, "transcription")
        if rm is not None and rm.provider_key == "gemini" and rm.api_key:
            return rm
    return None


async def model_name(db) -> Optional[str]:
    try:
        rm = await pick_model(db)
        return rm.display_name if rm else None
    except Exception:  # noqa: BLE001
        return None


def _root(rm) -> str:
    return (rm.base_url or "https://generativelanguage.googleapis.com").rstrip("/")


async def _upload(client, rm, data: bytes, mime: str, name: str) -> dict:
    """Gemini Files API, resumable — returns {name, uri}; waits until ACTIVE."""
    start = await client.post(
        f"{_root(rm)}/upload/v1beta/files?key={rm.api_key}",
        headers={"X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
                 "X-Goog-Upload-Header-Content-Length": str(len(data)),
                 "X-Goog-Upload-Header-Content-Type": mime},
        json={"file": {"display_name": name[:100]}})
    start.raise_for_status()
    url = start.headers.get("x-goog-upload-url")
    if not url:
        raise IOError("Gemini نشانیِ آپلود نداد")
    done = await client.post(url, content=data, headers={
        "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize"})
    done.raise_for_status()
    f = done.json().get("file") or {}
    for _ in range(120):                       # up to ~10 minutes of processing
        if f.get("state") in (None, "ACTIVE"):
            return f
        if f.get("state") == "FAILED":
            raise IOError("Gemini فایل را پردازش نکرد (FAILED)")
        await asyncio.sleep(5)
        r = await client.get(f"{_root(rm)}/v1beta/{f['name']}?key={rm.api_key}")
        r.raise_for_status()
        f = r.json()
    raise IOError("پردازشِ فایل در Gemini تمام نشد (۱۰ دقیقه)")


async def transcribe(db, data: bytes, filename: str, mime: str) -> dict:
    """`{ok, text, note, truncated, model}` — the WHOLE transcript, or why not."""
    import base64

    import httpx

    from app.services.inspection_formats import guess_mime

    rm = await pick_model(db)
    if rm is None:
        return {"ok": False, "text": "", "truncated": False, "model": None,
                "note": ("هیچ مدلِ صوتی/تصویریِ فعالی در «تنظیمات AI» نیست (مثلاً Gemini با کلید) — "
                         "تا وصل نشود رونویسی ممکن نیست؛ وصلش کن و دوباره «استخراج» بزن")}
    mime = mime or guess_mime(filename) or "application/octet-stream"
    video = mime.startswith("video/")
    first = PROMPT.format(video=VIDEO_EXTRA if video else "")
    uploaded = None
    async with httpx.AsyncClient(timeout=httpx.Timeout(900.0, connect=30.0)) as client:
        try:
            if len(data) > INLINE_MAX:
                uploaded = await _upload(client, rm, data, mime, filename)
                media = {"file_data": {"mime_type": mime, "file_uri": uploaded["uri"]}}
            else:
                media = {"inline_data": {"mime_type": mime, "data": base64.b64encode(data).decode()}}
            contents = [{"role": "user", "parts": [media, {"text": first}]}]
            chunks: list[str] = []
            finished = False
            for _ in range(MAX_ROUNDS):
                payload = {"contents": contents,
                           "generationConfig": {"temperature": 0, "maxOutputTokens": rm.max_output_tokens or 32768}}
                r = await client.post(f"{_root(rm)}/v1beta/models/{rm.model_key}:generateContent?key={rm.api_key}",
                                      json=payload)
                r.raise_for_status()
                cand = (r.json().get("candidates") or [{}])[0]
                piece = "".join(p.get("text", "") for p in (cand.get("content") or {}).get("parts", [])
                                if isinstance(p, dict))
                if END in piece:
                    chunks.append(piece.split(END)[0])
                    finished = True
                    break
                if not piece.strip():
                    break
                chunks.append(piece)
                tail = piece.strip()[-200:]
                contents += [{"role": "model", "parts": [{"text": piece}]},
                             {"role": "user", "parts": [{"text": CONTINUE.format(tail=tail)}]}]
            text = "".join(chunks).strip()
            note = (f"رونویسیِ کاملِ {'ویدیو (گفتار + شرحِ تصویر)' if video else 'صوت'} با {rm.display_name}"
                    + ("" if finished else f" — به نشانِ پایان نرسید (سقفِ {MAX_ROUNDS} دور)؛ "
                                           "ممکن است انتهای فایل جا مانده باشد"))
            return {"ok": bool(text), "text": text, "note": note, "truncated": not finished,
                    "model": rm.display_name}
        finally:
            if uploaded and uploaded.get("name"):
                try:
                    await client.delete(f"{_root(rm)}/v1beta/{uploaded['name']}?key={rm.api_key}")
                except Exception:  # noqa: BLE001 — Gemini expires it in 48h anyway
                    pass


async def transcribe_zip_members(db, data: bytes) -> list[tuple[str, dict]]:
    """Transcripts for the audio/video INSIDE an archive (recursively)."""
    import io
    import zipfile

    from app.services.inspection_formats import guess_mime, is_media

    out = []
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for info in z.infolist():
            if info.is_dir():
                continue
            if is_media(info.filename, guess_mime(info.filename)):
                out.append((info.filename, await transcribe(db, z.read(info), info.filename,
                                                            guess_mime(info.filename))))
            elif info.filename.lower().endswith(".zip"):
                for name, res in await transcribe_zip_members(db, z.read(info)):
                    out.append((f"{info.filename}/{name}", res))
    return out
