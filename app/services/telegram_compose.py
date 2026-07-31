"""Telegram "compose" — turn a burst of voice / photo / document / video / text
messages into ONE analysed task (or a todo-list item), the way the reference
oversight bot does, adapted to this app's domain + AI layer.

Flow:
  1. Any media (or text while a compose session is open) is buffered IN ORDER
     with a TTL — `detect_media` + `add_text`/`add_media`. A live status message
     is edited in place as items arrive ("🎙 ۱ صوت، 🖼 ۲ عکس، 📄 ۱ سند …").
  2. On «✅ ساخت کار» the pipeline downloads each item and analyses it by type:
       • photo / image / pdf / audio / video → `complete_multimodal` — which
         auto-resolves a VISION/DOCUMENTS-capable model (this IS "activate the
         vision model when needed"; no manual toggling). Audio/video transcribe
         when the resolved model is audio-capable (e.g. Gemini); otherwise the
         item degrades to a labelled placeholder.
       • text → used verbatim.
     The extracted texts are concatenated IN ORDER (priority/first-ness
     preserved) into one "raw idea".
  3. A text model (`complete`) turns the raw idea into a structured task
     {title, description, priority, target: task|list, list_name, due_date}.
     We create a `Task` (default) or, when the model routes it to a list and a
     matching `TodoList` exists, a `TodoItem` linked to that list.

Fail-open everywhere: no AI key ⇒ we still create a task from whatever text we
have (+ a note that media couldn't be analysed). In-memory buffer scoped to the
owner chat (single-replica deploy, like the rest of the bot's in-process state).
"""
from __future__ import annotations

import json
import logging
import os
import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

COMPOSE_TTL_SECONDS = 1800  # 30 min — match the reference bot
_MAX_ITEMS = 25

# Reply-keyboard captions shown while composing.
COMPOSE_BTN_SUBMIT = "✅ ساخت خودکار"          # auto: AI decides target
COMPOSE_BTN_PICK = "🎯 انتخاب مقصد"            # manual: pick target from a list
COMPOSE_BTN_CANCEL = "🗑 لغو"
COMPOSE_REPLY_KEYBOARD = [[COMPOSE_BTN_SUBMIT], [COMPOSE_BTN_PICK], [COMPOSE_BTN_CANCEL]]

_KIND_ICON = {
    "voice": "🎙", "audio": "🎵", "photo": "🖼", "image": "🖼",
    "document": "📄", "video": "🎞", "video_note": "🎬", "animation": "🌀", "text": "📝",
}


def _task_user_id() -> int:
    try:
        return int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or "0")
    except (TypeError, ValueError):
        return 0


@dataclass
class ComposeItem:
    order: int
    kind: str                       # voice|audio|photo|document|video|video_note|animation|text
    added_at: float
    text: Optional[str] = None
    file_id: Optional[str] = None
    mime: Optional[str] = None
    filename: Optional[str] = None
    duration: Optional[int] = None
    size: Optional[int] = None
    # filled during the submit pipeline
    data: Optional[bytes] = None        # downloaded bytes (kept for Drive upload)
    extracted: Optional[str] = None
    drive_link: Optional[str] = None
    error: Optional[str] = None
    # نتیجهٔ عبور از استخراج‌گرِ عمومیِ فایل (مالی/مدرک/صندوق) — تا در گزارش
    # به مالک بگوییم فایل فقط ضمیمه نشد، بلکه به بخشِ خودش هم رفت.
    ingested: Optional[str] = None


@dataclass
class ComposeBuffer:
    chat_id: str
    items: List[ComposeItem] = field(default_factory=list)
    status_message_id: Optional[int] = None
    created_at: float = field(default_factory=time.monotonic)
    last_at: float = field(default_factory=time.monotonic)
    submitting: bool = False
    # manual-mode: the analysed-but-not-yet-applied draft (set by submit(mode="manual"),
    # consumed by apply_choice when the user taps a target).
    pending: Optional[Dict[str, Any]] = None

    def next_order(self) -> int:
        return len(self.items) + 1


class ComposeService:
    def __init__(self) -> None:
        self._buffers: Dict[str, ComposeBuffer] = {}

    # ── lifecycle ────────────────────────────────────────────────────────────
    def _cleanup(self) -> None:
        now = time.monotonic()
        for cid in [c for c, b in self._buffers.items() if now - b.last_at > COMPOSE_TTL_SECONDS]:
            self._buffers.pop(cid, None)

    def has_active(self, chat_id: str) -> bool:
        self._cleanup()
        return chat_id in self._buffers

    def get(self, chat_id: str) -> Optional[ComposeBuffer]:
        self._cleanup()
        return self._buffers.get(chat_id)

    def start(self, chat_id: str) -> ComposeBuffer:
        buf = ComposeBuffer(chat_id=chat_id)
        self._buffers[chat_id] = buf
        return buf

    def clear(self, chat_id: str) -> bool:
        return self._buffers.pop(chat_id, None) is not None

    def _touch(self, buf: ComposeBuffer) -> None:
        buf.last_at = time.monotonic()

    # ── media detection ──────────────────────────────────────────────────────
    @staticmethod
    def detect_media(message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Map a Telegram message onto a media descriptor, or None for plain
        text / unsupported. Mirrors the reference bot's _detect_media."""
        if not isinstance(message, dict):
            return None
        if message.get("voice"):
            v = message["voice"]
            return {"kind": "voice", "file_id": v.get("file_id"), "mime": v.get("mime_type") or "audio/ogg",
                    "duration": v.get("duration"), "size": v.get("file_size"), "filename": "voice.ogg"}
        if message.get("audio"):
            a = message["audio"]
            return {"kind": "audio", "file_id": a.get("file_id"), "mime": a.get("mime_type") or "audio/mpeg",
                    "duration": a.get("duration"), "size": a.get("file_size"),
                    "filename": a.get("file_name") or "audio.mp3"}
        if message.get("video_note"):
            v = message["video_note"]
            return {"kind": "video_note", "file_id": v.get("file_id"), "mime": "video/mp4",
                    "duration": v.get("duration"), "size": v.get("file_size"), "filename": "video_note.mp4"}
        if message.get("video"):
            v = message["video"]
            return {"kind": "video", "file_id": v.get("file_id"), "mime": v.get("mime_type") or "video/mp4",
                    "duration": v.get("duration"), "size": v.get("file_size"),
                    "filename": v.get("file_name") or "video.mp4"}
        if message.get("animation"):
            a = message["animation"]
            return {"kind": "animation", "file_id": a.get("file_id"), "mime": a.get("mime_type") or "video/mp4",
                    "size": a.get("file_size"), "filename": a.get("file_name") or "animation.mp4"}
        if message.get("photo"):
            photos = message["photo"] or []
            if photos:
                largest = max(photos, key=lambda p: p.get("file_size") or 0)
                return {"kind": "photo", "file_id": largest.get("file_id"), "mime": "image/jpeg",
                        "size": largest.get("file_size"), "filename": "photo.jpg"}
        if message.get("document"):
            d = message["document"]
            return {"kind": "document", "file_id": d.get("file_id"),
                    "mime": d.get("mime_type") or "application/octet-stream",
                    "size": d.get("file_size"), "filename": d.get("file_name") or "document"}
        return None

    # ── buffer mutation ──────────────────────────────────────────────────────
    def add_media(self, chat_id: str, media: Dict[str, Any]) -> ComposeBuffer:
        buf = self.get(chat_id) or self.start(chat_id)
        if len(buf.items) < _MAX_ITEMS:
            buf.items.append(ComposeItem(
                order=buf.next_order(), kind=media["kind"], added_at=time.monotonic(),
                file_id=media.get("file_id"), mime=media.get("mime"),
                filename=media.get("filename"), duration=media.get("duration"), size=media.get("size"),
            ))
        self._touch(buf)
        return buf

    def add_text(self, chat_id: str, text: str) -> ComposeBuffer:
        buf = self.get(chat_id) or self.start(chat_id)
        if len(buf.items) < _MAX_ITEMS:
            buf.items.append(ComposeItem(
                order=buf.next_order(), kind="text", added_at=time.monotonic(), text=text,
            ))
        self._touch(buf)
        return buf

    # ── status rendering ─────────────────────────────────────────────────────
    @staticmethod
    def render_status(buf: ComposeBuffer) -> str:
        n_files = sum(1 for it in buf.items if it.kind != "text")
        n_text = sum(1 for it in buf.items if it.kind == "text")
        lines = [f"📦 *در حال ساخت کار* — {n_files} پیوست + {n_text} متن", ""]
        for it in buf.items:
            icon = _KIND_ICON.get(it.kind, "📎")
            if it.kind == "text":
                preview = (it.text or "")[:60].replace("\n", " ")
                lines.append(f"{it.order}. {icon} متن: _{preview}_")
            else:
                dur = f" • {it.duration}s" if it.duration else ""
                lines.append(f"{it.order}. {icon} `{it.filename or it.kind}`{dur}")
        lines.append("")
        lines.append("وقتی تمام شد:")
        lines.append("• «✅ ساخت خودکار» — هوش مصنوعی خودش مقصد را تشخیص می‌دهد")
        lines.append("• «🎯 انتخاب مقصد» — خودت از فهرست انتخاب می‌کنی کجا برود/کدام تقویت شود")
        return "\n".join(lines)

    # ── submit pipeline ──────────────────────────────────────────────────────
    async def submit(self, chat_id: str, bot: Any = None, *, mode: str = "auto") -> Dict[str, Any]:
        """Analyse the buffered items, then either apply automatically (mode=auto:
        the AI decides the target) or present a manual target picker (mode=manual:
        the user taps which existing task/item to strengthen, which list to file
        under, or "new"). ``bot`` defaults to the singleton — injected in tests."""
        from app.services.telegram_service import (
            PERSISTENT_REPLY_KEYBOARD,
            get_telegram_bot,
        )

        buf = self.get(chat_id)
        bot = bot or get_telegram_bot()
        if buf is None or not buf.items:
            await bot.send("هیچ پیوستی برای ساخت کار نیست.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "compose_empty"}
        if buf.submitting:
            return {"ok": True, "handled": "compose_already_submitting"}
        buf.submitting = True

        await bot.send("⏳ در حال تحلیل پیوست‌ها…", chat_id=chat_id, silent=True,
                       reply_markup={"remove_keyboard": True})

        try:
            sections, models_used, report = await self._analyse_items(buf, bot)
            raw_idea = "\n\n".join(sections).strip()
            structured = await self._structure_task(raw_idea)
            if structured.get("_model"):  # the text model that did the routing
                models_used.add(structured["_model"])
        except Exception as exc:
            logger.exception("compose analyse failed: %r", exc)
            self.clear(chat_id)
            await bot.send(f"❌ تحلیل ناموفق بود:\n`{str(exc)[:200]}`", chat_id=chat_id, silent=True,
                           reply_markup=PERSISTENT_REPLY_KEYBOARD)
            return {"ok": True, "handled": "compose_error", "error": str(exc)[:200]}

        if mode == "manual":
            buf.submitting = False  # picker is async; allow the tap to drive it
            buf.pending = {"structured": structured, "raw_idea": raw_idea,
                           "models": list(models_used), "report": report}
            await self._send_target_picker(chat_id, bot, buf, raw_idea)
            return {"ok": True, "handled": "compose_picker"}

        return await self._finish(chat_id, bot, structured, raw_idea, models_used, report, list(buf.items))

    async def apply_choice(self, chat_id: str, choice: Dict[str, Any], bot: Any = None) -> Dict[str, Any]:
        """Apply a manually-picked target (from the inline picker) to the pending
        analysed draft. ``choice`` is {type: new|task|item|list, id?/idx?}."""
        from app.services.telegram_service import get_telegram_bot

        bot = bot or get_telegram_bot()
        buf = self.get(chat_id)
        if buf is None or not buf.pending:
            await bot.send("⚠️ مهلت انتخاب تمام شد. دوباره پیوست‌ها را بفرست.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "compose_no_pending"}
        pending = buf.pending
        s = dict(pending["structured"])

        ctype = choice.get("type")
        if ctype == "new":
            s.update({"action": "create", "update_kind": None, "update_id": None,
                      "target": "task", "list_name": None})
        elif ctype == "task":
            s.update({"action": "update", "update_kind": "task", "update_id": choice.get("id")})
        elif ctype == "item":
            s.update({"action": "update", "update_kind": "todo_item", "update_id": choice.get("id")})
        elif ctype == "list":
            names = pending.get("lists") or []
            idx = choice.get("idx", -1)
            name = names[idx] if 0 <= idx < len(names) else None
            s.update({"action": "create", "update_kind": None, "update_id": None,
                      "target": "list" if name else "task", "list_name": name})
        else:
            return {"ok": True, "handled": "compose_choice_unknown"}

        return await self._finish(chat_id, bot, s, pending["raw_idea"],
                                  set(pending.get("models") or []), pending.get("report") or [], list(buf.items))

    async def _finish(self, chat_id, bot, structured, raw_idea, models_used, report, items) -> Dict[str, Any]:
        """Create/strengthen the row, upload the files to Drive + attach links,
        send the confirmation, and clear the buffer."""
        from app.services.telegram_service import PERSISTENT_REPLY_KEYBOARD

        try:
            created = await self._apply(structured, raw_idea)
            drive = await self._attach_drive(created, items)
        except Exception as exc:
            logger.exception("compose finish failed: %r", exc)
            self.clear(chat_id)
            await bot.send(f"❌ ساخت کار ناموفق بود:\n`{str(exc)[:200]}`", chat_id=chat_id, silent=True,
                           reply_markup=PERSISTENT_REPLY_KEYBOARD)
            return {"ok": True, "handled": "compose_error", "error": str(exc)[:200]}

        self.clear(chat_id)

        kind_label = "آیتم لیست" if created["kind"] == "todo_item" else "کار"
        action_word = "تقویت و به‌روزرسانی شد" if created.get("updated") else "ساخته شد"
        msg_lines = [f"✅ {kind_label} {action_word}: *{created['title']}* (#{created['id']})"]

        # Always say WHERE it landed.
        if created.get("updated") and created["kind"] == "task":
            msg_lines.append(f"🗂 مقصد: تقویتِ کار موجود (#{created['id']})")
        elif created.get("list_name"):
            msg_lines.append(f"🗂 مقصد: 📋 لیست «{created['list_name']}»")
        else:
            msg_lines.append("🗂 مقصد: 🆕 کار مستقل (در هیچ لیستی)")
        if created.get("priority"):
            msg_lines.append(f"اولویت: {created['priority']}")
        if report:
            msg_lines += ["", "تحلیل پیوست‌ها:", *report]
        if drive.get("links"):
            msg_lines.append("")
            msg_lines.append("📎 فایل‌ها در گوگل‌درایو:")
            for link in drive["links"]:
                msg_lines.append(f"• [{link['name']}]({link['link']})")
        elif drive.get("skipped") == "drive_not_connected" and any(it.kind != "text" for it in items):
            msg_lines.append("")
            msg_lines.append("ℹ️ گوگل‌درایو وصل نیست؛ فایل‌ها بارگذاری نشدند (تنظیمات → گوگل درایو).")
        # Always say WHICH model processed it (or that AI wasn't available).
        if models_used:
            msg_lines += ["", "🤖 مدل: " + "، ".join(sorted(models_used))]
        else:
            msg_lines += ["", "ℹ️ بدون تحلیل هوش مصنوعی (کلید مدل تنظیم نشده) — از متن خام ساخته شد."]

        markup = None
        if created["kind"] == "task":
            markup = {"inline_keyboard": [[
                {"text": "✅ انجام شد", "callback_data": f"task:done:{created['id']}"},
                {"text": "📋 کارها", "callback_data": "menu:tasks"},
            ]]}
        await bot.send("\n".join(msg_lines), chat_id=chat_id, silent=True, reply_markup=markup)
        await bot.send("🎛 منوی ثابت فعال است.", chat_id=chat_id, silent=True,
                       reply_markup=PERSISTENT_REPLY_KEYBOARD)
        return {"ok": True, "handled": "compose_submitted", **created, "drive_uploaded": drive.get("uploaded", 0)}

    async def _send_target_picker(self, chat_id, bot, buf, raw_idea) -> None:
        """Show an inline keyboard of the most relevant existing tasks/items +
        lists + "new", so the user chooses the target manually."""
        from app.database import SessionLocal

        uid = _task_user_id()
        async with SessionLocal() as session:
            ctx = await self._gather_context(session, uid, raw_idea)
        buf.pending["lists"] = ctx["list_names"][:8]

        rows: List[List[Dict[str, Any]]] = []
        for t in ctx["tasks"][:5]:
            rows.append([{"text": f"✏️ تقویت کار: {t['title'][:28]}", "callback_data": f"cmp:t:{t['id']}"}])
        for i in ctx["items"][:5]:
            rows.append([{"text": f"✏️ تقویت آیتم: {i['content'][:28]}", "callback_data": f"cmp:i:{i['id']}"}])
        for idx, name in enumerate(buf.pending["lists"]):
            rows.append([{"text": f"📋 افزودن به لیست: {name[:28]}", "callback_data": f"cmp:l:{idx}"}])
        rows.append([{"text": "🆕 کار جدید مستقل", "callback_data": "cmp:new"}])

        await bot.send(
            "🎯 *این محتوا کجا برود؟*\nیکی را انتخاب کن — تقویت یک مورد موجود، افزودن به یک لیست، یا کار جدید.",
            chat_id=chat_id, silent=True, reply_markup={"inline_keyboard": rows},
        )

    async def _analyse_items(self, buf: ComposeBuffer, bot) -> tuple:
        """Download + analyse each item in order. Returns (sections, models, report)."""
        from app.database import SessionLocal
        from app.services.ai.inference_gateway import complete_multimodal

        sections: List[str] = []
        models_used: set = set()
        report: List[str] = []

        for it in buf.items:
            label = f"{it.order}. {_KIND_ICON.get(it.kind, '📎')}"
            if it.kind == "text":
                sections.append(f"## پیوست {it.order} (متن)\n{it.text or ''}")
                continue

            data = await bot.download_file(it.file_id) if it.file_id else None
            if not data:
                it.error = "download_failed"
                report.append(f"{label} `{it.filename}` — ⚠️ دانلود نشد")
                sections.append(f"## پیوست {it.order} ({it.kind}: {it.filename})\n[دانلود نشد]")
                continue
            it.data = data  # keep the bytes for the Google Drive upload step

            # ── همان استخراج‌گرِ فایلِ برنامه (2026-07-31) ─────────────────
            # تا امروز فایلی که با تلگرام می‌آمد فقط «تحلیل متنی» می‌شد و به
            # توضیحِ یک کار می‌چسبید: یک صورت‌حسابِ بانکی هرگز به «مالی»
            # نمی‌رسید و یک مدرک هرگز مدرک نمی‌شد. حالا همان مسیرِ پیوستِ
            # ایمیل/درایو را می‌رود (استخراج قطعی + تغذیهٔ مالی + صندوق)،
            # با source_ref مخصوصِ تلگرام تا دوباره ثبت نشود.
            try:
                from app.services.ingest.universal_ingest import extract_from_file

                async with SessionLocal() as session:
                    ingest = await extract_from_file(
                        session,
                        filename=it.filename or f"telegram-{it.kind}",
                        mimetype=it.mime,
                        data=data,
                        source_ref=f"telegram:{it.file_id}",
                        user_id=0,
                    )
                    await session.commit()
                if isinstance(ingest, dict) and ingest.get("status") in ("proposed", "duplicate"):
                    it.ingested = ingest.get("kind") or ingest.get("status")
            except Exception as exc:  # ingest is a bonus — never break compose
                logger.debug("telegram file ingest skipped (%s): %r", it.filename, exc)

            prompt = _ANALYSIS_PROMPTS.get(it.kind, _ANALYSIS_PROMPTS["default"])
            try:
                async with SessionLocal() as session:
                    res = await complete_multimodal(
                        session, prompt,
                        [{"filename": it.filename or it.kind, "mimetype": it.mime or "application/octet-stream", "data": data}],
                        task="telegram_compose", max_tokens=4000,
                    )
            except Exception as exc:
                res = {"ok": False, "error": str(exc)[:120]}

            if res.get("ok") and (res.get("text") or "").strip():
                it.extracted = res["text"].strip()
                if res.get("model"):
                    models_used.add(res["model"])
                report.append(f"{label} `{it.filename}` — ✅ تحلیل شد")
                sections.append(f"## پیوست {it.order} ({it.kind}: {it.filename})\n{it.extracted}")
            else:
                err = res.get("error") or "no_capable_model"
                it.error = err
                if err == "no_capable_model":
                    if it.kind in ("voice", "audio", "video", "video_note", "animation"):
                        note = ("هیچ مدلِ فعالی قابلیت «صوت» ندارد — یک مدل با قابلیت صوت فعال کن "
                                "(مثلاً Gemini؛ مدل‌های Claude صوت را پشتیبانی نمی‌کنند)")
                    else:
                        note = "هیچ مدلِ فعالی قابلیت «تصویر/سند» ندارد — یک مدل بصری فعال کن"
                else:
                    note = err
                report.append(f"{label} `{it.filename}` — ⚠️ {note}")
                sections.append(f"## پیوست {it.order} ({it.kind}: {it.filename})\n[تحلیل نشد: {note}]")

        return sections, models_used, report

    async def _structure_task(self, raw_idea: str) -> Dict[str, Any]:
        """List-aware structuring + dedup decision.

        The model is shown the user's ACTUAL lists (the sections it may route
        into) and the recent open tasks / list items, then decides whether this
        input is a NEW task or an UPDATE that should strengthen an existing one.
        Falls back to a plain new task when AI is unavailable."""
        from app.database import SessionLocal
        from app.services.ai.inference_gateway import complete

        # Title fallback = first real content line (skip "## پیوست N" headers and
        # "[تحلیل نشد]" placeholders the analysis step inserts).
        first_line = next(
            (ln.strip() for ln in raw_idea.splitlines()
             if ln.strip() and not ln.strip().startswith(("##", "["))),
            "کار جدید",
        )
        fallback = {
            "action": "create", "update_kind": None, "update_id": None, "_model": None,
            "title": first_line[:120].strip() or "کار جدید",
            "description": raw_idea.strip()[:8000],
            "priority": "normal", "target": "task", "list_name": None, "due_date": None,
        }
        if not raw_idea.strip():
            return fallback

        uid = _task_user_id()
        async with SessionLocal() as session:
            ctx = await self._gather_context(session, uid, raw_idea)

        lists_txt = "\n".join(f"- {n}" for n in ctx["list_names"]) or "(هیچ لیستی نیست)"
        tasks_txt = "\n".join(f"- [task #{t['id']}] {t['title']}" for t in ctx["tasks"]) or "(هیچ کار بازی نیست)"
        items_txt = "\n".join(f"- [item #{i['id']}] {i['content']}" for i in ctx["items"]) or "(هیچ آیتمی نیست)"
        prompt = _STRUCTURE_PROMPT.format(
            lists=lists_txt, tasks=tasks_txt, items=items_txt, idea=raw_idea[:8000]
        )
        try:
            async with SessionLocal() as session:
                res = await complete(session, prompt, task="telegram_compose", max_tokens=1400)
        except Exception as exc:
            logger.debug("compose structure AI skipped: %r", exc)
            return fallback
        if not res.get("ok"):
            return fallback
        obj = _parse_json_object(res.get("text", ""))
        if not obj:
            return fallback

        action = "update" if str(obj.get("action")).lower() == "update" else "create"
        update_kind = str(obj.get("update_target_kind") or "").lower().strip()
        update_kind = update_kind if update_kind in ("task", "todo_item") else None
        try:
            update_id = int(obj.get("update_target_id"))
        except (TypeError, ValueError):
            update_id = None
        # Guard: only update an id we actually offered (no hallucinated rows).
        valid_ids = ctx["task_ids"] if update_kind == "task" else ctx["item_ids"]
        if action == "update" and (update_id is None or update_id not in valid_ids):
            action, update_kind, update_id = "create", None, None

        # list_name must resolve to one of the REAL lists, else null.
        list_name = None
        raw_ln = str(obj.get("list_name")).strip() if obj.get("list_name") else ""
        if raw_ln and raw_ln.lower() not in ("null", "none"):
            for n in ctx["list_names"]:
                if n.lower() == raw_ln.lower() or raw_ln.lower() in n.lower():
                    list_name = n
                    break

        return {
            "action": action, "update_kind": update_kind, "update_id": update_id,
            "_model": res.get("model"),
            "title": (str(obj.get("title") or fallback["title"]))[:255].strip() or fallback["title"],
            "description": str(obj.get("description") or raw_idea)[:8000],
            "priority": _norm_priority(obj.get("priority")),
            "target": "list" if str(obj.get("target")).lower() == "list" else "task",
            "list_name": list_name,
            "due_date": _norm_date(obj.get("due_date")),
        }

    async def _gather_context(self, session, uid: int, raw_idea: str = "") -> Dict[str, Any]:
        """Candidate lists + tasks + items for routing/dedup.

        Coverage is the WHOLE app, not a hard recent-N cap: we let the DB search
        every open task / item whose title matches a keyword from the new content
        (`ILIKE`), union that with the most recent rows (so there's always some
        context), then rank by keyword overlap and keep the top slice for the AI
        prompt. So an item created long ago is still found if it's relevant.
        """
        from sqlalchemy import or_, select

        from app.models.task import Task, TaskStatus
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList

        def _scope(col):
            return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)

        kws = _keywords(raw_idea)

        lists = (await session.execute(
            select(TodoList.name)
            .where(_scope(TodoList.user_id), TodoList.is_archived.is_(False))
            .limit(200)
        )).scalars().all()

        # Tasks: keyword matches across tasks in ANY status ∪ most-recent open
        # (fallback). Dedup detection deliberately spans DONE/CANCELLED too — a
        # re-dictated idea should match its already-finished original ("you
        # already did this") instead of spawning a duplicate. Merged-away rows
        # (merged_into_id set) are excluded so a soft-merged duplicate can't
        # re-surface as a match. The recent fallback stays open-only so it
        # doesn't flood the context with finished work.
        task_rows: Dict[int, str] = {}
        if kws:
            matched = (await session.execute(
                select(Task.id, Task.title).where(
                    _scope(Task.user_id), Task.merged_into_id.is_(None),
                    or_(*[Task.title.ilike(f"%{k}%") for k in kws]),
                ).limit(120)
            )).all()
            task_rows.update({r[0]: r[1] for r in matched})
        recent_t = (await session.execute(
            select(Task.id, Task.title).where(
                _scope(Task.user_id), Task.merged_into_id.is_(None),
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
            ).order_by(Task.id.desc()).limit(25)
        )).all()
        task_rows.update({r[0]: r[1] for r in recent_t})

        item_rows: Dict[int, str] = {}
        if kws:
            matched = (await session.execute(
                select(TodoItem.id, TodoItem.content).where(
                    _scope(TodoItem.owner_id), TodoItem.deleted_at.is_(None),
                    or_(*[TodoItem.content.ilike(f"%{k}%") for k in kws]),
                ).limit(120)
            )).all()
            item_rows.update({r[0]: r[1] for r in matched})
        recent_i = (await session.execute(
            select(TodoItem.id, TodoItem.content)
            .where(_scope(TodoItem.owner_id), TodoItem.deleted_at.is_(None))
            .order_by(TodoItem.id.desc()).limit(25)
        )).all()
        item_rows.update({r[0]: r[1] for r in recent_i})

        def _rank(rows: Dict[int, str], limit: int):
            scored = [
                {"id": rid, "_t": txt or "", "score": sum(1 for k in kws if k.lower() in (txt or "").lower())}
                for rid, txt in rows.items()
            ]
            scored.sort(key=lambda r: (r["score"], r["id"]), reverse=True)
            return scored[:limit]

        tasks = [{"id": r["id"], "title": r["_t"]} for r in _rank(task_rows, 40)]
        items = [{"id": r["id"], "content": r["_t"]} for r in _rank(item_rows, 40)]
        return {
            "list_names": [n for n in lists if n],
            "tasks": tasks,
            "items": items,
            "task_ids": {t["id"] for t in tasks},
            "item_ids": {i["id"] for i in items},
        }

    # ── Google Drive: upload the files + attach links to the created row ──────
    async def _attach_drive(self, created: Dict[str, Any], items: List[ComposeItem]) -> Dict[str, Any]:
        """Upload every downloaded file to Google Drive (under
        LifeManagerData/telegram), then append the share links to the created/
        updated row's description (+ Task.attachment). Fail-open: when Drive isn't
        connected we skip silently and report it."""
        file_items = [it for it in items if it.kind != "text" and it.data]
        if not file_items:
            return {"uploaded": 0, "links": []}
        from app.database import SessionLocal
        from app.services.google_api_client import build_clients, ensure_app_folders

        links: List[Dict[str, str]] = []
        try:
            async with SessionLocal() as session:
                drive, _sheets = await build_clients(session)
                if drive is None:
                    return {"uploaded": 0, "links": [], "skipped": "drive_not_connected"}
                root_id, _subs = await ensure_app_folders(session, drive)
                tg_folder = await drive.get_or_create_folder("telegram", parent=root_id)
                safe = _safe_name(created.get("title") or "task")
                for it in file_items:
                    fname = f"{safe}__{it.order}__{_safe_name(it.filename or it.kind, keep_ext=True)}"
                    try:
                        fid = await drive.upload(file_name=fname, parent=tg_folder, media=it.data)
                        link = await drive.share_link(fid)
                        it.drive_link = link
                        links.append({"name": fname, "link": link})
                    except Exception as up_exc:
                        logger.warning("compose drive upload of %s failed: %r", fname, up_exc)
                if links:
                    await self._append_links_to_row(session, created, links)
                    await session.commit()
            return {"uploaded": len(links), "links": links}
        except Exception as exc:
            logger.warning("compose drive attach failed: %r", exc)
            return {"uploaded": 0, "links": [], "error": str(exc)[:120]}

    async def _append_links_to_row(self, session, created: Dict[str, Any], links: List[Dict[str, str]]) -> None:
        block = "\n\n📎 فایل‌ها (Google Drive):\n" + "\n".join(f"- {x['name']}: {x['link']}" for x in links)
        if created["kind"] == "task":
            from app.models.task import Task

            row = await session.get(Task, created["id"])
            if row is not None:
                row.description = ((row.description or "") + block)[:8000]
                if hasattr(row, "attachment"):
                    row.attachment = (links[0]["link"])[:500]
        else:
            from app.models.todo_item import TodoItem

            row = await session.get(TodoItem, created["id"])
            if row is not None:
                row.description = ((row.description or "") + block)[:8000]

    async def _apply(self, s: Dict[str, Any], raw_idea: str) -> Dict[str, Any]:
        """Route the structured result: UPDATE (strengthen) an existing task/item
        when the model matched one, else CREATE a Task or a list TodoItem."""
        if s["action"] == "update" and s["update_kind"] == "task" and s["update_id"]:
            updated = await self._update_task(s)
            if updated:
                return updated
        if s["action"] == "update" and s["update_kind"] == "todo_item" and s["update_id"]:
            updated = await self._update_todo_item(s)
            if updated:
                return updated
        # create path
        if s["target"] == "list" and s.get("list_name"):
            created = await self._create_todo_item(s)
            if created:
                return created
            # no matching list → fall back to a task (capability preserved)
        return await self._create_task(s)

    async def _create_task(self, s: Dict[str, Any]) -> Dict[str, Any]:
        from app.database import SessionLocal
        from app.models.task import Task, TaskStatus

        async with SessionLocal() as session:
            task = Task(
                title=s["title"], description=s["description"], status=TaskStatus.TODO,
                priority=_to_task_priority(s["priority"]), user_id=_task_user_id(),
                due_date=s.get("due_date"),
            )
            session.add(task)
            await session.commit()
            await session.refresh(task)
            return {"kind": "task", "updated": False, "id": task.id,
                    "title": task.title, "priority": s["priority"]}

    async def _create_todo_item(self, s: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        from sqlalchemy import func, insert, or_, select

        from app.database import SessionLocal
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList, todo_list_items

        uid = _task_user_id()
        name = s["list_name"]
        async with SessionLocal() as session:
            scope = or_(TodoList.user_id == uid, TodoList.user_id.is_(None)) if uid == 0 else (TodoList.user_id == uid)
            lst = (await session.execute(
                select(TodoList).where(scope, TodoList.name.ilike(f"%{name}%")).limit(1)
            )).scalars().first()
            if lst is None:
                return None
            item = TodoItem(content=s["title"], description=s["description"], owner_id=uid, type="task")
            session.add(item)
            await session.flush()
            position = int((await session.execute(
                select(func.count()).select_from(todo_list_items).where(
                    todo_list_items.c.todo_list_id == lst.id
                )
            )).scalar() or 0)
            await session.execute(insert(todo_list_items).values(
                todo_list_id=lst.id, todo_item_id=item.id, position=position
            ))
            await session.commit()
            return {"kind": "todo_item", "updated": False, "id": item.id,
                    "title": item.content, "list_name": lst.name, "priority": s["priority"]}

    async def _update_task(self, s: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Strengthen an existing task: AI-merge the description, raise priority
        only upward, fill an empty due_date. Never weakens what's there."""
        from app.database import SessionLocal
        from app.models.task import Task

        async with SessionLocal() as session:
            task = await session.get(Task, s["update_id"])
            if task is None:
                return None
            task.description = (await self._merge_description(
                task.title, task.description or "", s["description"]))[:8000]
            new_pri = _to_task_priority(s["priority"])
            if _pri_rank(new_pri) > _pri_rank(task.priority):
                task.priority = new_pri
            if s.get("due_date") and not task.due_date:
                task.due_date = s["due_date"]
            await session.commit()
            await session.refresh(task)
            return {"kind": "task", "updated": True, "id": task.id,
                    "title": task.title, "priority": s["priority"]}

    async def _update_todo_item(self, s: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        from app.database import SessionLocal
        from app.models.todo_item import TodoItem

        async with SessionLocal() as session:
            item = await session.get(TodoItem, s["update_id"])
            if item is None:
                return None
            item.description = (await self._merge_description(
                item.content, item.description or "", s["description"]))[:8000]
            await session.commit()
            await session.refresh(item)
            return {"kind": "todo_item", "updated": True, "id": item.id, "title": item.content}

    async def _merge_description(self, title: str, old: str, new: str) -> str:
        """Produce a strengthened description from the existing one + the new
        input (AI when available, else a labelled append — never loses the old)."""
        old, new = (old or "").strip(), (new or "").strip()
        if not old:
            return new
        if not new:
            return old
        from app.database import SessionLocal
        from app.services.ai.inference_gateway import complete

        try:
            async with SessionLocal() as session:
                res = await complete(
                    session, _MERGE_PROMPT.format(title=title, old=old[:4000], new=new[:4000]),
                    task="telegram_compose", max_tokens=1200,
                )
            if res.get("ok") and (res.get("text") or "").strip():
                return res["text"].strip()
        except Exception as exc:
            logger.debug("compose merge AI skipped: %r", exc)
        return f"{old}\n\n— به‌روزرسانی:\n{new}"


# ── prompts ──────────────────────────────────────────────────────────────────
_ANALYSIS_PROMPTS = {
    "voice": "این پیام صوتی را کلمه‌به‌کلمه و دقیق به همان زبان گوینده رونویسی کن. فقط متن رونویسی را بده، بدون توضیح اضافه.",
    "audio": "این فایل صوتی را کلمه‌به‌کلمه و دقیق رونویسی کن. فقط متن رونویسی را بده.",
    "video": "گفتار و محتوای این ویدئو را رونویسی و خلاصه کن: هر گفتاری را متن کن و آنچه دیده می‌شود را توصیف کن.",
    "video_note": "گفتار این ویدئوی کوتاه را رونویسی کن و محتوای آن را توصیف کن.",
    "animation": "محتوای این تصویر متحرک را توصیف کن.",
    "photo": "محتوای این تصویر را دقیق توصیف و استخراج کن: هر متن داخل تصویر را عیناً بنویس و موضوع آن را شرح بده.",
    "image": "محتوای این تصویر را دقیق توصیف و استخراج کن: هر متن داخل تصویر را عیناً بنویس.",
    "document": "محتوای این سند را استخراج و خلاصه کن: نکات کلیدی و هر کار/اقدام موجود در آن را بیرون بکش.",
    "default": "محتوای این فایل را استخراج و توصیف کن.",
}

_STRUCTURE_PROMPT = (
    "تو دستیار سازمان‌دهی کارها هستی. محتوای زیر از چند پیوست تلگرام به‌ترتیب استخراج شده "
    "(ترتیب مهم است؛ اولین‌ها معمولاً مهم‌ترند).\n\n"
    "لیست‌های موجود کاربر (می‌توانی آیتم را ذیل دقیقاً یکی از این‌ها قرار دهی):\n{lists}\n\n"
    "کارهای باز فعلی کاربر (اگر این محتوا در واقع همان موضوع یکی از این‌هاست، به‌جای ساخت تکراری، "
    "آن را به‌روزرسانی/تقویت کن):\n{tasks}\n\n"
    "آیتم‌های فهرست‌های فعلی:\n{items}\n\n"
    "فقط یک شیء JSON برگردان (بدون توضیح، بدون code fence) با این کلیدها:\n"
    '{{"action": "create یا update", '
    '"update_target_kind": "task یا todo_item یا null", '
    '"update_target_id": "عدد id همان مورد بالا اگر update، وگرنه null", '
    '"title": "عنوان کوتاه و گویا فارسی", '
    '"description": "شرح کامل آنچه باید انجام شود", '
    '"priority": "low|normal|high|critical", '
    '"target": "task یا list", '
    '"list_name": "دقیقاً یکی از نام لیست‌های بالا اگر مناسب است، وگرنه null", '
    '"due_date": "YYYY-MM-DD یا null"}}\n\n'
    "قواعد:\n"
    "- اگر محتوا با یکی از کارهای باز/آیتم‌های موجود هم‌موضوع است → action=update و id همان را بده.\n"
    "- در غیر این‌صورت action=create.\n"
    "- list_name باید عیناً از فهرست لیست‌های بالا باشد، وگرنه null.\n\n"
    "محتوا:\n{idea}"
)

_MERGE_PROMPT = (
    "یک آیتم کار از قبل وجود دارد و حالا اطلاعات تازه‌ای رسیده. توضیحات را طوری بازنویسی کن که "
    "آیتم را قوی‌تر، کامل‌تر و به‌روزتر کند — هیچ اطلاعات قبلی را از دست نده و موارد جدید را در آن ادغام کن. "
    "فقط متن نهایی توضیحات را برگردان (بدون عنوان، بدون توضیح اضافه).\n\n"
    "عنوان: {title}\n\nتوضیح فعلی:\n{old}\n\nاطلاعات تازه:\n{new}"
)


# ── helpers ──────────────────────────────────────────────────────────────────
def _parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    s = text.strip()
    if "```" in s:
        for part in s.split("```"):
            p = part.strip()
            if p.startswith("json"):
                p = p[4:].strip()
            if p.startswith("{"):
                s = p
                break
    start, end = s.find("{"), s.rfind("}")
    if start != -1 and end != -1 and end > start:
        s = s[start:end + 1]
    try:
        obj = json.loads(s)
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None


# Common Persian/English stop-words to drop from keyword matching.
_STOP = {
    "این", "آن", "که", "را", "به", "از", "با", "در", "برای", "تا", "هم", "است",
    "های", "یک", "روی", "کرد", "باید", "خیلی", "وقتی", "the", "and", "for", "with",
    "this", "that", "you", "are", "have",
}


def _keywords(text: str, limit: int = 12) -> List[str]:
    """Distinct content tokens (len ≥ 3, not stop-words/numbers) for ILIKE search."""
    seen: set = set()
    out: List[str] = []
    for tok in re.findall(r"\w{3,}", text or "", flags=re.UNICODE):
        low = tok.lower()
        if low in _STOP or low.isdigit() or low in seen:
            continue
        seen.add(low)
        out.append(tok)
        if len(out) >= limit:
            break
    return out


def _safe_name(name: str, *, keep_ext: bool = False) -> str:
    """A filesystem/Drive-safe name from a title (keeps an extension if asked)."""
    name = (name or "").strip()
    ext = ""
    if keep_ext and "." in name:
        name, _, ext = name.rpartition(".")
        ext = "." + re.sub(r"[^\w]+", "", ext)[:8]
    cleaned = re.sub(r"[\\/:*?\"<>|\n\r\t]+", " ", name).strip()
    cleaned = re.sub(r"\s+", "_", cleaned)[:80] or "file"
    return cleaned + ext


def _norm_priority(value: Any) -> str:
    v = str(value or "").lower().strip()
    return v if v in ("low", "normal", "high", "critical") else "normal"


_PRI_RANK = {"low": 0, "medium": 1, "normal": 1, "high": 2, "critical": 3}


def _to_task_priority(value: str):
    """Map our normalised priority string onto the Task model's enum."""
    from app.models.task import TaskPriority

    return {
        "low": TaskPriority.LOW, "normal": TaskPriority.MEDIUM,
        "high": TaskPriority.HIGH, "critical": TaskPriority.CRITICAL,
    }.get(str(value or "").lower(), TaskPriority.MEDIUM)


def _pri_rank(priority: Any) -> int:
    """Rank a TaskPriority enum (or string) so updates can raise-only."""
    val = getattr(priority, "value", priority)
    return _PRI_RANK.get(str(val or "").lower(), 1)


def _norm_date(value: Any):
    from datetime import date

    s = str(value or "").strip()
    if not s or s.lower() in ("null", "none"):
        return None
    try:
        return date.fromisoformat(s[:10])
    except Exception:
        return None


_service: Optional[ComposeService] = None


def get_compose_service() -> ComposeService:
    global _service
    if _service is None:
        _service = ComposeService()
    return _service
