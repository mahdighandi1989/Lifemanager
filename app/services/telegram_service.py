"""Bidirectional Telegram bot — outbound sends + inbound webhook handling.

One transport, two directions (the pattern ported, project-agnostic, from a
sibling oversight bot and adapted to Lifemanager's domain — tasks + notifications):

  • Outbound — ``TelegramBot.send`` / ``send_with_reply_keyboard`` / ``answer_callback``:
    Markdown with a no-parse-mode retry, per-chat flood throttle, and 429 ``retry_after``
    absorption. A sync ``send_message_sync`` is the single Bot-API ``sendMessage`` call;
    ``notification_service.send_telegram`` delegates to it so there is ONE transport.

  • Inbound — ``handle_update``: dispatches a Telegram ``update`` from the webhook. Text
    commands (``/start`` ``/help`` ``/menu`` ``/tasks`` ``/new_task`` ``/status`` ``/ping``
    ``/diag`` ``/cancel``) and inline ``callback_query`` presses (``task:done:<id>`` …).
    Every reply path is wrapped so the webhook can always answer HTTP 200 — a 5xx makes
    Telegram retry and flood the bot.

Self-heal: ``telegram_webhook_supervisor_loop`` re-registers the webhook whenever
Telegram's recorded URL drifts from our public URL or the pending queue backs up — the
"buttons stop responding after a redeploy" failure the reference project hit repeatedly.

Config (all via env; the bot degrades to a logged no-op when unset, so nothing here can
crash a request or startup):
  TELEGRAM_BOT_TOKEN      — bot token from @BotFather
  TELEGRAM_CHAT_ID        — the single owner chat the bot trusts + talks to
  BACKEND_PUBLIC_URL / RENDER_EXTERNAL_URL / PUBLIC_URL — public origin (webhook URL)
  TELEGRAM_TASK_USER_ID   — account-owner the bot's task reads/writes belong to (default 0,
                            the anon bucket, mirroring FINANCE_INGEST_USER_ID)
  TELEGRAM_APP_BASE_URL    — optional SPA origin for deep-link buttons in /menu
"""
from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

# Public path Telegram POSTs updates to. Kept here so the route, the self-heal
# supervisor, and /diag all agree on a single string.
WEBHOOK_PATH = "/api/telegram/webhook"

_API_BASE = "https://api.telegram.org"
_HTTP_TIMEOUT = 15.0


# ── Persistent reply keyboard + button→command aliases ───────────────────────
# A persistent reply keyboard puts big tappable buttons under the input box. The
# button captions are NOT commands, so TEXT_ALIASES maps each caption back to the
# real slash command when the user taps one.
PERSISTENT_REPLY_KEYBOARD: Dict[str, Any] = {
    "keyboard": [
        [{"text": "📋 کارها"}, {"text": "🆕 کار جدید"}],
        [{"text": "📊 وضعیت"}, {"text": "📋 منو"}],
    ],
    "resize_keyboard": True,
    "is_persistent": True,
    "input_field_placeholder": "یک دستور بزن یا از دکمه‌های زیر استفاده کن",
}

TEXT_ALIASES: Dict[str, str] = {
    "📋 کارها": "/tasks",
    "🆕 کار جدید": "/new_task",
    "📊 وضعیت": "/status",
    "📋 منو": "/menu",
}

# How many open tasks /tasks lists at once.
_TASK_LIST_LIMIT = 10


# ── Public-URL resolution + self-heal tunables ───────────────────────────────
_TG_WEBHOOK_HEAL_INTERVAL_SEC = 300   # 5 minutes between supervisor cycles
_TG_WEBHOOK_HEAL_INITIAL_DELAY = 20   # let the app become healthy before first probe
_TG_WEBHOOK_PENDING_RESET_THRESHOLD = 100  # drop + reset if the queue grows past this


def _resolve_public_url() -> str:
    """Public origin of this backend, in priority order. Empty when unknown."""
    for key in ("BACKEND_PUBLIC_URL", "RENDER_EXTERNAL_URL", "PUBLIC_URL"):
        value = (os.environ.get(key) or "").strip().rstrip("/")
        if value:
            return value
    return ""


def _task_user_id() -> int:
    """Which account-owner the bot's task reads/writes belong to (single-tenant
    default = 0, the anon bucket — mirrors FINANCE_INGEST_USER_ID)."""
    try:
        return int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or "0")
    except (TypeError, ValueError):
        return 0


def _app_base_url() -> str:
    """Optional SPA origin for deep-link buttons. Falls back to the public URL."""
    explicit = (os.environ.get("TELEGRAM_APP_BASE_URL") or "").strip().rstrip("/")
    return explicit or _resolve_public_url()


# ── In-memory per-chat conversation state (for the /new_task flow) ───────────
# Light, single-replica state. The only flow today is "waiting for a task title"
# after a bare /new_task. Each entry carries a created_at so stale entries expire.
_chat_state: Dict[str, Dict[str, Any]] = {}
_CHAT_STATE_TTL_SEC = 600  # 10 minutes


def _cleanup_expired_state() -> None:
    now = time.monotonic()
    for chat_id in [c for c, s in _chat_state.items() if now - s.get("_ts", now) > _CHAT_STATE_TTL_SEC]:
        _chat_state.pop(chat_id, None)


def _set_state(chat_id: str, phase: str, **extra: Any) -> None:
    _chat_state[chat_id] = {"phase": phase, "_ts": time.monotonic(), **extra}


def _clear_state(chat_id: str) -> bool:
    return _chat_state.pop(chat_id, None) is not None


# ── Sync sender (single source of truth for the sendMessage call) ────────────
def send_message_sync(*, body: str, chat_id: Optional[str] = None) -> bool:
    """Synchronous Bot-API ``sendMessage``. Returns True on success.

    This is the ONE place the outbound text call lives;
    ``notification_service.send_telegram`` delegates here so the bidirectional bot
    and the critical-event fan-out share a single transport. When
    ``TELEGRAM_BOT_TOKEN`` is unset it logs and returns True so callers (and tests)
    exercise the full path without a live bot.
    """
    token = (os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip()
    target = (chat_id or os.environ.get("TELEGRAM_CHAT_ID") or "").strip()
    if not token:
        logger.info("send_message_sync (no TELEGRAM_BOT_TOKEN): chat=%s body=%r", target, body[:80])
        return True
    try:
        with httpx.Client(timeout=_HTTP_TIMEOUT) as client:
            r = client.post(
                f"{_API_BASE}/bot{token}/sendMessage",
                json={"chat_id": target, "text": body, "disable_web_page_preview": True},
            )
            return 200 <= r.status_code < 300
    except Exception as exc:
        logger.warning("send_message_sync failed: %r", exc)
        return False


class TelegramBot:
    """Async Telegram bot client + webhook dispatcher.

    Stateless w.r.t. credentials — token/chat are read from the env on each
    instance so a Render env-var change takes effect without a code deploy. A
    class-level token bucket throttles per chat to stay under Telegram's
    ~1 msg/sec/chat limit and absorbs 429 ``retry_after`` globally.
    """

    # Flood protection — shared across instances (class-level).
    _last_send_at: Dict[str, float] = {}
    _global_pause_until: float = 0.0
    _MIN_INTERVAL_PER_CHAT_SEC: float = 1.1

    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        self.bot_token = (bot_token if bot_token is not None else os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip()
        self.chat_id = (chat_id if chat_id is not None else os.environ.get("TELEGRAM_CHAT_ID") or "").strip()

    def is_configured(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    # ── flood throttle ───────────────────────────────────────────────────────
    @classmethod
    async def _throttle_for_chat(cls, chat_id: str) -> None:
        now = time.monotonic()
        if cls._global_pause_until > now:
            await asyncio.sleep(cls._global_pause_until - now)
            now = time.monotonic()
        last = cls._last_send_at.get(chat_id, 0.0)
        gap = now - last
        if gap < cls._MIN_INTERVAL_PER_CHAT_SEC:
            await asyncio.sleep(cls._MIN_INTERVAL_PER_CHAT_SEC - gap)
        cls._last_send_at[chat_id] = time.monotonic()

    @classmethod
    def _absorb_429(cls, body_text: str) -> None:
        """Telegram told us how long to wait — pause ALL chats until then."""
        try:
            import json
            params = (json.loads(body_text or "{}").get("parameters") or {})
            retry_after = int(params.get("retry_after") or 0)
            if retry_after > 0:
                cls._global_pause_until = time.monotonic() + retry_after + 0.2
        except Exception:
            pass

    # ── outbound: text ───────────────────────────────────────────────────────
    async def send(
        self,
        message: str,
        *,
        subject: Optional[str] = None,
        silent: bool = False,
        reply_markup: Optional[Dict[str, Any]] = None,
        chat_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a Markdown message. Retries once without parse_mode on a parse
        error and once after a 429. Never raises — returns ``{ok, ...}``."""
        target = (chat_id or self.chat_id or "").strip()
        if not self.bot_token or not target:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN/CHAT_ID unset"}
        text = f"*{subject}*\n\n{message}" if subject else message
        if len(text) > 4000:
            text = text[:3990] + "\n…[truncated]"
        url = f"{_API_BASE}/bot{self.bot_token}/sendMessage"
        payload: Dict[str, Any] = {
            "chat_id": target,
            "text": text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True,
            "disable_notification": bool(silent),
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup
        await self._throttle_for_chat(target)
        try:
            async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    return {"ok": True, "silent": silent}
                body = r.text
                if r.status_code == 429:
                    self._absorb_429(body)
                    await asyncio.sleep(min(5.0, max(1.0, self._global_pause_until - time.monotonic())))
                    r2 = await client.post(url, json=payload)
                    return {"ok": r2.status_code == 200, "retried_after_429": True,
                            "error": None if r2.status_code == 200 else f"HTTP {r2.status_code}"}
                if "can't parse" in body.lower():
                    payload.pop("parse_mode", None)
                    r3 = await client.post(url, json=payload)
                    return {"ok": r3.status_code == 200,
                            "error": None if r3.status_code == 200 else f"HTTP {r3.status_code}"}
                return {"ok": False, "error": f"HTTP {r.status_code}: {body[:200]}"}
        except Exception as exc:
            return {"ok": False, "error": str(exc)[:200]}

    async def send_with_reply_keyboard(
        self, message: str, keyboard_rows: List[List[str]], *,
        silent: bool = True, chat_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a message that (re)attaches a persistent reply keyboard."""
        markup = {
            "keyboard": [[{"text": btn} for btn in row] for row in keyboard_rows],
            "resize_keyboard": True,
            "is_persistent": True,
        }
        return await self.send(message, silent=silent, reply_markup=markup, chat_id=chat_id)

    async def answer_callback(self, callback_query_id: str, text: str = "") -> None:
        """Clear the spinner on a tapped inline button (optional toast)."""
        if not self.bot_token:
            return
        payload: Dict[str, Any] = {"callback_query_id": callback_query_id}
        if text:
            payload["text"] = text[:200]
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(f"{_API_BASE}/bot{self.bot_token}/answerCallbackQuery", json=payload)
        except Exception:
            pass

    # ── webhook registration ─────────────────────────────────────────────────
    async def set_webhook(self, webhook_url: str) -> Dict[str, Any]:
        if not self.bot_token:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN unset"}
        try:
            async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
                r = await client.post(
                    f"{_API_BASE}/bot{self.bot_token}/setWebhook",
                    json={"url": webhook_url, "allowed_updates": ["message", "callback_query"]},
                )
                body = r.json()
                return {"ok": bool(body.get("ok")), "result": body}
        except Exception as exc:
            return {"ok": False, "error": str(exc)[:200]}

    async def delete_webhook(self) -> Dict[str, Any]:
        if not self.bot_token:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN unset"}
        try:
            async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
                r = await client.post(f"{_API_BASE}/bot{self.bot_token}/deleteWebhook")
                body = r.json()
                return {"ok": bool(body.get("ok")), "result": body}
        except Exception as exc:
            return {"ok": False, "error": str(exc)[:200]}

    async def get_webhook_info(self) -> Dict[str, Any]:
        if not self.bot_token:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN unset"}
        try:
            async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
                r = await client.get(f"{_API_BASE}/bot{self.bot_token}/getWebhookInfo")
                if r.status_code != 200:
                    return {"ok": False, "error": f"HTTP {r.status_code}"}
                return {"ok": True, "result": (r.json().get("result") or {})}
        except Exception as exc:
            return {"ok": False, "error": str(exc)[:200]}

    # ── inbound: dispatch ────────────────────────────────────────────────────
    async def handle_update(self, update: Dict[str, Any]) -> Dict[str, Any]:
        """Process one webhook update. Always returns a dict; never raises."""
        try:
            _cleanup_expired_state()
        except Exception as exc:
            logger.warning("telegram: state cleanup failed (continuing): %r", exc)

        callback = update.get("callback_query")
        if callback:
            try:
                return await self._handle_callback(callback)
            except Exception as exc:
                logger.exception("telegram callback handler crashed: %r", exc)
                return {"ok": False, "handled": "callback_crash", "error": str(exc)[:200]}

        message = update.get("message") or {}
        text = (message.get("text") or "").strip()
        chat = message.get("chat") or {}
        chat_id = chat.get("id")
        if not chat_id or not text:
            return {"ok": True, "ignored": True}
        chat_id_str = str(chat_id)

        # Persistent-keyboard taps arrive as plain text — map back to commands.
        if text in TEXT_ALIASES:
            _clear_state(chat_id_str)
            text = TEXT_ALIASES[text]

        # Security: only act on the configured chat (when one is configured).
        configured = (os.environ.get("TELEGRAM_CHAT_ID") or "").strip()
        if configured and chat_id_str != configured:
            logger.info("telegram: ignoring chat %s (not configured)", chat_id_str)
            return {"ok": True, "ignored": True}

        try:
            return await self._handle_command(chat_id_str, text)
        except Exception as exc:
            logger.exception("telegram command handler crashed: %r", exc)
            try:
                await self.send(f"⚠️ خطای داخلی در پردازش دستور:\n`{str(exc)[:200]}`", chat_id=chat_id_str, silent=True)
            except Exception:
                pass
            return {"ok": True, "handler_error": str(exc)[:200]}

    async def _handle_command(self, chat_id: str, text: str) -> Dict[str, Any]:
        lower = text.lower()

        if lower == "/cancel":
            had = _clear_state(chat_id)
            await self.send("✅ لغو شد." if had else "هیچ مرحلهٔ فعالی نبود.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "cancel"}

        if lower in ("/start", "/help"):
            await self.send(_HELP_TEXT, chat_id=chat_id, silent=True, reply_markup=PERSISTENT_REPLY_KEYBOARD)
            return {"ok": True, "handled": "help"}

        if lower == "/ping":
            await self.send(f"🏓 pong (chat_id={chat_id})", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "ping"}

        if lower == "/diag":
            return await self._cmd_diag(chat_id)

        if lower == "/menu":
            return await self._cmd_menu(chat_id)

        if lower == "/status":
            return await self._cmd_status(chat_id)

        if lower in ("/tasks", "/today", "/list"):
            return await self._cmd_tasks(chat_id)

        # /new_task <title?>  — inline title creates immediately, bare starts a flow
        if lower == "/new_task" or lower.startswith("/new_task "):
            title = text[len("/new_task"):].strip()
            if title:
                return await self._create_task(chat_id, title)
            _set_state(chat_id, "awaiting_title")
            await self.send("✏️ عنوان کار جدید را بفرست (یا /cancel برای لغو).", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "new_task_prompt"}

        # State-aware: a plain message while awaiting a title becomes the task.
        state = _chat_state.get(chat_id)
        if state and state.get("phase") == "awaiting_title":
            _clear_state(chat_id)
            return await self._create_task(chat_id, text)

        # Unknown text → gentle nudge (kept silent to avoid notification spam).
        await self.send("متوجه نشدم. /help را بزن تا فهرست دستورها بیاید.", chat_id=chat_id, silent=True)
        return {"ok": True, "handled": "unknown"}

    async def _cmd_diag(self, chat_id: str) -> Dict[str, Any]:
        configured = (os.environ.get("TELEGRAM_CHAT_ID") or "").strip()
        public = _resolve_public_url()
        info = await self.get_webhook_info()
        result = info.get("result") or {}
        wh = (
            f"url=`{(result.get('url') or '?')[:80]}`\n"
            f"pending={result.get('pending_update_count', 0)}\n"
            f"last_err={(result.get('last_error_message') or 'none')[:160]}"
            if info.get("ok") else f"getWebhookInfo failed: {info.get('error')}"
        )
        await self.send(
            "🩺 *تشخیص*\n\n"
            f"chat_id شما: `{chat_id}`\n"
            f"پیکربندی‌شده: `{configured or '(خالی — همه پاسخ می‌گیرند)'}`\n"
            f"تطابق: {'✅' if not configured or configured == chat_id else '❌'}\n"
            f"آدرس بک‌اند: `{public or '(تنظیم‌نشده)'}`\n\n"
            f"*Webhook*:\n{wh}",
            chat_id=chat_id, silent=True,
        )
        return {"ok": True, "handled": "diag"}

    async def _cmd_menu(self, chat_id: str) -> Dict[str, Any]:
        base = _app_base_url()
        rows: List[List[Dict[str, Any]]] = [
            [{"text": "📋 کارهای باز", "callback_data": "menu:tasks"},
             {"text": "🆕 کار جدید", "callback_data": "menu:new_task"}],
            [{"text": "📊 وضعیت اعلان‌ها", "callback_data": "menu:status"}],
        ]
        if base:
            rows.append([{"text": "🏠 باز کردن برنامه", "url": f"{base}/"},
                         {"text": "⚙️ تنظیمات", "url": f"{base}/settings"}])
        await self.send("📋 *منوی دسترسی سریع*", chat_id=chat_id, silent=True,
                        reply_markup={"inline_keyboard": rows})
        # re-attach the persistent keyboard (clients drop it on chat switches)
        await self.send("🎛 منوی ثابت فعال است.", chat_id=chat_id, silent=True,
                        reply_markup=PERSISTENT_REPLY_KEYBOARD)
        return {"ok": True, "handled": "menu"}

    async def _cmd_status(self, chat_id: str) -> Dict[str, Any]:
        counts = {"sent": 0, "failed": 0, "pending": 0, "total": 0}
        open_tasks = 0
        try:
            from app.database import SessionLocal
            from app.services.notification_service import NotificationService

            async with SessionLocal() as session:
                svc = NotificationService(session)
                counts = await svc.get_delivery_status(user_id=_task_user_id())
                open_tasks = await self._count_open_tasks(session)
        except Exception as exc:
            logger.debug("telegram /status db read skipped: %r", exc)
        await self.send(
            "📊 *وضعیت*\n\n"
            f"کارهای باز: *{open_tasks}*\n\n"
            "اعلان‌ها:\n"
            f"• ارسال‌شده: {counts.get('sent', 0)}\n"
            f"• ناموفق: {counts.get('failed', 0)}\n"
            f"• در انتظار: {counts.get('pending', 0)}\n"
            f"• مجموع: {counts.get('total', 0)}",
            chat_id=chat_id, silent=True,
        )
        return {"ok": True, "handled": "status"}

    async def _cmd_tasks(self, chat_id: str) -> Dict[str, Any]:
        try:
            from app.database import SessionLocal
            async with SessionLocal() as session:
                tasks = await self._list_open_tasks(session)
        except Exception as exc:
            logger.debug("telegram /tasks db read skipped: %r", exc)
            await self.send("⚠️ خواندن کارها ممکن نشد.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "tasks_error"}

        if not tasks:
            await self.send("✅ هیچ کار بازی نداری.", chat_id=chat_id, silent=True,
                            reply_markup={"inline_keyboard": [[{"text": "🆕 کار جدید", "callback_data": "menu:new_task"}]]})
            return {"ok": True, "handled": "tasks_empty"}

        lines = ["📋 *کارهای باز:*", ""]
        rows: List[List[Dict[str, Any]]] = []
        for t in tasks:
            due = f" — ⏰ {t.due_date.isoformat()}" if getattr(t, "due_date", None) else ""
            lines.append(f"• #{t.id} {t.title}{due}")
            rows.append([{"text": f"✅ انجام شد: {t.title[:24]}", "callback_data": f"task:done:{t.id}"}])
        await self.send("\n".join(lines), chat_id=chat_id, silent=True,
                        reply_markup={"inline_keyboard": rows})
        return {"ok": True, "handled": "tasks", "count": len(tasks)}

    async def _handle_callback(self, callback: Dict[str, Any]) -> Dict[str, Any]:
        data = (callback.get("data") or "").strip()
        cq_id = callback.get("id") or ""
        chat = (callback.get("message") or {}).get("chat") or {}
        chat_id = str(chat.get("id") or "")

        # Security gate (same as text path).
        configured = (os.environ.get("TELEGRAM_CHAT_ID") or "").strip()
        if configured and chat_id and chat_id != configured:
            await self.answer_callback(cq_id)
            return {"ok": True, "ignored": True}

        if data == "menu:tasks":
            await self.answer_callback(cq_id)
            return await self._cmd_tasks(chat_id)
        if data == "menu:status":
            await self.answer_callback(cq_id)
            return await self._cmd_status(chat_id)
        if data == "menu:new_task":
            await self.answer_callback(cq_id)
            _set_state(chat_id, "awaiting_title")
            await self.send("✏️ عنوان کار جدید را بفرست (یا /cancel).", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "cb_new_task"}
        if data.startswith("task:done:"):
            task_id = data.split(":", 2)[2]
            return await self._complete_task(chat_id, cq_id, task_id)

        await self.answer_callback(cq_id)
        return {"ok": True, "handled": "cb_unknown", "data": data[:60]}

    # ── domain helpers (tasks) ───────────────────────────────────────────────
    async def _list_open_tasks(self, session) -> List[Any]:
        from sqlalchemy import or_, select
        from app.models.task import Task, TaskStatus

        uid = _task_user_id()
        scope = Task.user_id == uid
        if uid == 0:  # anon bucket also owns legacy NULL rows
            scope = or_(Task.user_id == uid, Task.user_id.is_(None))
        result = await session.execute(
            select(Task)
            .where(scope, Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]))
            .order_by(Task.due_date.is_(None), Task.due_date, Task.id.desc())
            .limit(_TASK_LIST_LIMIT)
        )
        return list(result.scalars().all())

    async def _count_open_tasks(self, session) -> int:
        from sqlalchemy import func, or_, select
        from app.models.task import Task, TaskStatus

        uid = _task_user_id()
        scope = Task.user_id == uid
        if uid == 0:
            scope = or_(Task.user_id == uid, Task.user_id.is_(None))
        result = await session.execute(
            select(func.count(Task.id)).where(
                scope, Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
            )
        )
        return int(result.scalar_one() or 0)

    async def _create_task(self, chat_id: str, title: str) -> Dict[str, Any]:
        title = (title or "").strip()[:255]
        if not title:
            await self.send("⚠️ عنوان خالی است.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "create_empty"}
        try:
            from app.database import SessionLocal
            from app.models.task import Task, TaskStatus

            async with SessionLocal() as session:
                task = Task(title=title, status=TaskStatus.TODO, user_id=_task_user_id())
                session.add(task)
                await session.commit()
                await session.refresh(task)
                task_id = task.id
        except Exception as exc:
            logger.warning("telegram create_task failed: %r", exc)
            await self.send("⚠️ ساخت کار ممکن نشد.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "create_error"}

        await self.send(
            f"✅ کار ساخته شد: *{title}* (#{task_id})",
            chat_id=chat_id, silent=True,
            reply_markup={"inline_keyboard": [[
                {"text": "✅ انجام شد", "callback_data": f"task:done:{task_id}"},
                {"text": "📋 کارها", "callback_data": "menu:tasks"},
            ]]},
        )
        return {"ok": True, "handled": "task_created", "task_id": task_id}

    async def _complete_task(self, chat_id: str, cq_id: str, task_id: str) -> Dict[str, Any]:
        try:
            from app.database import SessionLocal
            from app.models.task import Task, TaskStatus

            async with SessionLocal() as session:
                task = await session.get(Task, int(task_id))
                if task is None:
                    await self.answer_callback(cq_id, "یافت نشد")
                    return {"ok": True, "handled": "done_missing"}
                task.status = TaskStatus.DONE
                await session.commit()
                title = task.title
        except Exception as exc:
            logger.warning("telegram complete_task failed: %r", exc)
            await self.answer_callback(cq_id, "خطا")
            return {"ok": True, "handled": "done_error"}

        await self.answer_callback(cq_id, "✅ انجام شد")
        await self.send(f"✅ انجام شد: *{title}* (#{task_id})", chat_id=chat_id, silent=True)
        return {"ok": True, "handled": "task_done", "task_id": task_id}


_HELP_TEXT = (
    "👋 *ربات Lifemanager*\n\n"
    "دستورها:\n"
    "• /tasks — 📋 کارهای باز (با دکمهٔ «انجام شد»)\n"
    "• /new\\_task — 🆕 ساخت کار (می‌توانی عنوان را همان خط بنویسی: `/new_task خرید نان`)\n"
    "• /status — 📊 وضعیت اعلان‌ها و تعداد کارها\n"
    "• /menu — منوی دسترسی سریع\n"
    "• /ping — 🏓 تست زندهٔ webhook\n"
    "• /diag — 🩺 تشخیص chat\\_id و webhook\n"
    "• /cancel — لغو مرحلهٔ فعلی\n"
    "• /help — همین پیام\n\n"
    "💡 منوی ثابت پایین صفحه فعال شد."
)


# ── singleton accessor ───────────────────────────────────────────────────────
_bot_singleton: Optional[TelegramBot] = None


def get_telegram_bot() -> TelegramBot:
    """Process-wide bot. Recreated when credentials are absent so a later
    env-var set (Render) is picked up without restarting the process."""
    global _bot_singleton
    if _bot_singleton is None or not _bot_singleton.bot_token:
        _bot_singleton = TelegramBot()
    return _bot_singleton


# ── self-heal supervisor ─────────────────────────────────────────────────────
async def telegram_webhook_heal_once() -> Dict[str, Any]:
    """One supervisor cycle. Re-registers the webhook when Telegram's recorded
    URL drifts from our public URL or the pending queue backs up. Returns a
    diagnostic dict (also exposed via POST /api/telegram/heal-webhook)."""
    bot_token = (os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip()
    if not bot_token:
        return {"skipped": "no_bot_token"}
    public_url = _resolve_public_url()
    if not public_url:
        return {"skipped": "no_public_url"}

    expected_url = f"{public_url}{WEBHOOK_PATH}"
    bot = TelegramBot(bot_token=bot_token, chat_id="x")  # chat unused here
    info = await bot.get_webhook_info()
    if not info.get("ok"):
        return {"error": info.get("error") or "getWebhookInfo failed"}
    result = info.get("result") or {}
    current_url = (result.get("url") or "").strip()
    pending = int(result.get("pending_update_count") or 0)

    reasons: List[str] = []
    if current_url != expected_url:
        reasons.append(f"url mismatch (telegram='{current_url[:60]}', expected='{expected_url[:60]}')")
    if pending > _TG_WEBHOOK_PENDING_RESET_THRESHOLD:
        reasons.append(f"pending_update_count={pending}")

    last_err = (result.get("last_error_message") or "").strip()
    if last_err:
        logger.warning("telegram_webhook_supervisor: last delivery error: %s", last_err[:160])

    if not reasons:
        return {"healthy": True, "url": current_url, "pending": pending}

    logger.warning("telegram_webhook_supervisor: re-setting webhook because: %s", "; ".join(reasons))
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            r = await client.post(
                f"{_API_BASE}/bot{bot_token}/setWebhook",
                json={
                    "url": expected_url,
                    "allowed_updates": ["message", "callback_query"],
                    "drop_pending_updates": pending > _TG_WEBHOOK_PENDING_RESET_THRESHOLD,
                },
            )
            body = r.json()
            if body.get("ok"):
                logger.info("telegram_webhook_supervisor: webhook re-set → %s", expected_url)
                return {"reset": True, "reasons": reasons, "new_url": expected_url}
            return {"error": f"setWebhook returned: {body}"}
    except Exception as exc:
        return {"error": f"setWebhook crashed: {str(exc)[:160]}"}


async def telegram_webhook_supervisor_loop(stop_event: "asyncio.Event") -> None:
    """Periodic supervisor — never lets the webhook silently rot. Cancel via
    ``stop_event.set()`` (wired up in the app's shutdown handler)."""
    try:
        await asyncio.wait_for(stop_event.wait(), timeout=_TG_WEBHOOK_HEAL_INITIAL_DELAY)
        return  # stop signalled during initial delay
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            result = await telegram_webhook_heal_once()
            if "error" in result:
                logger.warning("telegram_webhook_supervisor: heal cycle error: %s", result["error"])
        except Exception as exc:
            logger.exception("telegram_webhook_supervisor: cycle crashed: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=_TG_WEBHOOK_HEAL_INTERVAL_SEC)
        except asyncio.TimeoutError:
            continue
