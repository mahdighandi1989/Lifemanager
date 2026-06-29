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
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

COMPOSE_TTL_SECONDS = 1800  # 30 min — match the reference bot
_MAX_ITEMS = 25

# Reply-keyboard captions shown while composing.
COMPOSE_BTN_SUBMIT = "✅ ساخت کار از پیوست‌ها"
COMPOSE_BTN_CANCEL = "🗑 لغو"
COMPOSE_REPLY_KEYBOARD = [[COMPOSE_BTN_SUBMIT], [COMPOSE_BTN_CANCEL]]

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
    extracted: Optional[str] = None
    error: Optional[str] = None


@dataclass
class ComposeBuffer:
    chat_id: str
    items: List[ComposeItem] = field(default_factory=list)
    status_message_id: Optional[int] = None
    created_at: float = field(default_factory=time.monotonic)
    last_at: float = field(default_factory=time.monotonic)
    submitting: bool = False

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
        lines.append("وقتی تمام شد «✅ ساخت کار از پیوست‌ها» را بزن (یا 🗑 لغو).")
        return "\n".join(lines)

    # ── submit pipeline ──────────────────────────────────────────────────────
    async def submit(self, chat_id: str, bot: Any = None) -> Dict[str, Any]:
        """Download + analyse every buffered item in order, build one structured
        task, and create it. Returns a result dict; the caller has already been
        told (via the reply) what happened. ``bot`` defaults to the singleton —
        injected in tests."""
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
            created = await self._apply(structured, raw_idea)
        except Exception as exc:
            logger.exception("compose submit failed: %r", exc)
            self.clear(chat_id)
            await bot.send(f"❌ ساخت کار ناموفق بود:\n`{str(exc)[:200]}`", chat_id=chat_id, silent=True,
                           reply_markup=PERSISTENT_REPLY_KEYBOARD)
            return {"ok": True, "handled": "compose_error", "error": str(exc)[:200]}

        self.clear(chat_id)

        # Build the confirmation message (create vs. strengthen-existing).
        kind_label = "آیتم لیست" if created["kind"] == "todo_item" else "کار"
        action_word = "تقویت و به‌روزرسانی شد" if created.get("updated") else "ساخته شد"
        msg_lines = [f"✅ {kind_label} {action_word}: *{created['title']}* (#{created['id']})"]
        if created.get("list_name"):
            msg_lines.append(f"📋 در لیست: {created['list_name']}")
        if created.get("priority"):
            msg_lines.append(f"اولویت: {created['priority']}")
        if report:
            msg_lines.append("")
            msg_lines.append("تحلیل پیوست‌ها:")
            msg_lines.extend(report)
        if models_used:
            msg_lines.append("")
            msg_lines.append("🤖 مدل: " + "، ".join(sorted(models_used)))

        markup = None
        if created["kind"] == "task":
            markup = {"inline_keyboard": [[
                {"text": "✅ انجام شد", "callback_data": f"task:done:{created['id']}"},
                {"text": "📋 کارها", "callback_data": "menu:tasks"},
            ]]}
        await bot.send("\n".join(msg_lines), chat_id=chat_id, silent=True, reply_markup=markup)
        await bot.send("🎛 منوی ثابت فعال است.", chat_id=chat_id, silent=True,
                       reply_markup=PERSISTENT_REPLY_KEYBOARD)
        return {"ok": True, "handled": "compose_submitted", **created}

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
                note = "مدل سازگار با این نوع فایل تنظیم نشده" if err == "no_capable_model" else err
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
            "action": "create", "update_kind": None, "update_id": None,
            "title": first_line[:120].strip() or "کار جدید",
            "description": raw_idea.strip()[:8000],
            "priority": "normal", "target": "task", "list_name": None, "due_date": None,
        }
        if not raw_idea.strip():
            return fallback

        uid = _task_user_id()
        async with SessionLocal() as session:
            ctx = await self._gather_context(session, uid)

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
            "title": (str(obj.get("title") or fallback["title"]))[:255].strip() or fallback["title"],
            "description": str(obj.get("description") or raw_idea)[:8000],
            "priority": _norm_priority(obj.get("priority")),
            "target": "list" if str(obj.get("target")).lower() == "list" else "task",
            "list_name": list_name,
            "due_date": _norm_date(obj.get("due_date")),
        }

    async def _gather_context(self, session, uid: int) -> Dict[str, Any]:
        """The user's lists (sections) + recent open tasks + recent list items —
        bounded so the structuring prompt stays small."""
        from sqlalchemy import or_, select

        from app.models.task import Task, TaskStatus
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList

        def _scope(col):
            return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)

        lists = (await session.execute(
            select(TodoList.name)
            .where(_scope(TodoList.user_id), TodoList.is_archived.is_(False))
            .limit(80)
        )).scalars().all()
        tasks = (await session.execute(
            select(Task.id, Task.title).where(
                _scope(Task.user_id), Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
            ).order_by(Task.id.desc()).limit(40)
        )).all()
        items = (await session.execute(
            select(TodoItem.id, TodoItem.content).where(_scope(TodoItem.owner_id))
            .order_by(TodoItem.id.desc()).limit(40)
        )).all()
        return {
            "list_names": [n for n in lists if n],
            "tasks": [{"id": t[0], "title": t[1]} for t in tasks],
            "items": [{"id": i[0], "content": i[1]} for i in items],
            "task_ids": {t[0] for t in tasks},
            "item_ids": {i[0] for i in items},
        }

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
