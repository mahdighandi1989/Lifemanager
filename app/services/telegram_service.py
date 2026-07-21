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
from collections import deque as _deque
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
        [{"text": "📥 صندوق ورودی"}, {"text": "📊 وضعیت"}, {"text": "📋 منو"}],
    ],
    "resize_keyboard": True,
    "is_persistent": True,
    "input_field_placeholder": "یک دستور بزن یا از دکمه‌های زیر استفاده کن",
}

TEXT_ALIASES: Dict[str, str] = {
    "📋 کارها": "/tasks",
    "🆕 کار جدید": "/new_task",
    "📥 صندوق ورودی": "/inbox",
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

# Recently-seen update_ids (idempotency for redelivered webhooks, 2026-07-20).
_SEEN_UPDATE_IDS: "_deque[int]" = _deque(maxlen=512)

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
                    mid = None
                    try:
                        mid = (r.json().get("result") or {}).get("message_id")
                    except Exception:
                        pass
                    return {"ok": True, "silent": silent, "message_id": mid}
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

    async def edit_message_text(
        self, chat_id: str, message_id: int, text: str, *,
        reply_markup: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Edit a previously-sent message in place (used for the live compose
        status). Silently ignores the 'message is not modified' no-op."""
        if not self.bot_token:
            return {"ok": False, "error": "no token"}
        if len(text) > 4000:
            text = text[:3990] + "\n…[truncated]"
        payload: Dict[str, Any] = {
            "chat_id": chat_id, "message_id": message_id, "text": text,
            "parse_mode": "Markdown", "disable_web_page_preview": True,
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup
        try:
            async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
                r = await client.post(f"{_API_BASE}/bot{self.bot_token}/editMessageText", json=payload)
                if r.status_code == 200:
                    return {"ok": True}
                body = r.text
                if "not modified" in body.lower():
                    return {"ok": True, "unchanged": True}
                if "can't parse" in body.lower():
                    payload.pop("parse_mode", None)
                    r2 = await client.post(f"{_API_BASE}/bot{self.bot_token}/editMessageText", json=payload)
                    return {"ok": r2.status_code == 200}
                return {"ok": False, "error": f"HTTP {r.status_code}: {body[:160]}"}
        except Exception as exc:
            return {"ok": False, "error": str(exc)[:160]}

    # ── file download (getFile → bytes) ──────────────────────────────────────
    async def get_file_path(self, file_id: str) -> Optional[str]:
        """Resolve a Telegram file_id to its download path via getFile."""
        if not self.bot_token:
            return None
        try:
            async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
                r = await client.get(f"{_API_BASE}/bot{self.bot_token}/getFile", params={"file_id": file_id})
                if r.status_code != 200:
                    return None
                return ((r.json().get("result") or {}).get("file_path")) or None
        except Exception as exc:
            logger.debug("telegram get_file_path failed: %r", exc)
            return None

    async def download_file(self, file_id: str, *, max_bytes: int = 20 * 1024 * 1024) -> Optional[bytes]:
        """Download a file by id (getFile → file API). Telegram's Bot API caps
        downloads at 20MB; returns None on any failure or oversize."""
        path = await self.get_file_path(file_id)
        if not path:
            return None
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                r = await client.get(f"{_API_BASE}/file/bot{self.bot_token}/{path}")
                if r.status_code != 200:
                    return None
                data = r.content
                if len(data) > max_bytes:
                    logger.info("telegram download oversize (%d bytes) — skipped", len(data))
                    return None
                return data
        except Exception as exc:
            logger.debug("telegram download_file failed: %r", exc)
            return None

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
        # Idempotency (2026-07-20 review): Telegram redelivers an update when
        # the webhook is slow (a /ask that waits on the LLM easily exceeds
        # the timeout), which would run the command — and bill the model —
        # twice. Drop update_ids we've already seen.
        try:
            update_id = update.get("update_id")
            if update_id is not None:
                if update_id in _SEEN_UPDATE_IDS:
                    return {"ok": True, "handled": "duplicate"}
                _SEEN_UPDATE_IDS.append(update_id)
        except Exception:
            pass
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
        if not chat_id:
            return {"ok": True, "ignored": True}
        chat_id_str = str(chat_id)

        # Security: only act on the configured chat (when one is configured).
        configured = (os.environ.get("TELEGRAM_CHAT_ID") or "").strip()
        if configured and chat_id_str != configured:
            logger.info("telegram: ignoring chat %s (not configured)", chat_id_str)
            return {"ok": True, "ignored": True}

        # Compose: media (voice/photo/document/video/…) — or text while a compose
        # session is open — is buffered into one task. Runs BEFORE the text-command
        # path so attachments aren't dropped (they carry no message.text).
        try:
            routed = await self._maybe_route_to_compose(chat_id_str, message, text)
            if routed is not None:
                return routed
        except Exception as exc:
            logger.exception("telegram compose routing crashed: %r", exc)

        if not text:
            return {"ok": True, "ignored": True}

        # Persistent-keyboard taps arrive as plain text — map back to commands.
        if text in TEXT_ALIASES:
            _clear_state(chat_id_str)
            text = TEXT_ALIASES[text]

        try:
            return await self._handle_command(chat_id_str, text)
        except Exception as exc:
            logger.exception("telegram command handler crashed: %r", exc)
            try:
                await self.send(f"⚠️ خطای داخلی در پردازش دستور:\n`{str(exc)[:200]}`", chat_id=chat_id_str, silent=True)
            except Exception:
                pass
            return {"ok": True, "handler_error": str(exc)[:200]}

    async def _maybe_route_to_compose(
        self, chat_id: str, message: Dict[str, Any], text: str
    ) -> Optional[Dict[str, Any]]:
        """Route media + compose-keyboard taps into the compose buffer. Returns
        a result dict when handled, or None to let the text/command path run."""
        from app.services.telegram_compose import (
            COMPOSE_BTN_CANCEL,
            COMPOSE_BTN_PICK,
            COMPOSE_BTN_SUBMIT,
            get_compose_service,
        )

        compose = get_compose_service()
        active = compose.has_active(chat_id)

        # Submit / pick / cancel buttons (only meaningful while composing).
        if text == COMPOSE_BTN_SUBMIT:
            if not active:
                return None
            return await compose.submit(chat_id, mode="auto")
        if text == COMPOSE_BTN_PICK:
            if not active:
                return None
            return await compose.submit(chat_id, mode="manual")
        if text == COMPOSE_BTN_CANCEL:
            if not active:
                return None
            compose.clear(chat_id)
            await self.send("🗑 لغو شد.", chat_id=chat_id, silent=True, reply_markup=PERSISTENT_REPLY_KEYBOARD)
            return {"ok": True, "handled": "compose_cancelled"}

        media = compose.detect_media(message)

        # A plain message while composing → add as a text item (commands +
        # persistent-keyboard taps are left for the normal path).
        if media is None:
            if active and text and not text.startswith("/") and text not in TEXT_ALIASES:
                buf = compose.add_text(chat_id, text)
                await self._refresh_compose_status(chat_id, buf)
                return {"ok": True, "handled": "compose_text_added"}
            return None

        # Brain-data zips (Brilliant export) are ingested directly into the
        # رشد ذهن dashboard instead of the compose buffer — this IS the
        # Telegram upload channel the weekly reminder points at.
        if media["kind"] == "document" and (media.get("filename") or "").lower().endswith(".zip"):
            handled = await self._maybe_ingest_brain_zip(chat_id, media)
            if handled is not None:
                return handled

        # Media → start/append to the buffer + refresh the live status.
        buf = compose.add_media(chat_id, media)
        await self._refresh_compose_status(chat_id, buf, just_started=(len(buf.items) == 1))
        return {"ok": True, "handled": "compose_media_added", "count": len(buf.items)}

    async def _maybe_ingest_brain_zip(self, chat_id: str, media: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Download a .zip document; if it's a Brilliant export, ingest it into
        the brain dashboard and confirm. Returns None for non-Brilliant zips so
        they continue into the compose flow."""
        from app.services.brain_service import ingest_upload, is_brilliant_zip

        data = await self.download_file(media.get("file_id"))
        if data is None:
            # Bot API caps downloads at 20MB — a bigger export must go through
            # the dashboard. Tell the user instead of silently attaching the
            # zip to a compose task (which would hit the same cap).
            size = media.get("size") or 0
            if size > 20 * 1024 * 1024:
                await self.send(
                    "⚠️ این فایل از حد ۲۰ مگابایت تلگرام بزرگ‌تر است و از اینجا قابل دریافت نیست.\n"
                    "لطفاً از داشبورد «رشد ذهن و هوش» آپلودش کن.",
                    chat_id=chat_id, silent=True,
                )
                return {"ok": True, "handled": "brain_zip_too_big"}
            return None
        if not is_brilliant_zip(data):
            return None
        await self.send("🧠 فایل دادهٔ هوش شناسایی شد — در حال تحلیل…", chat_id=chat_id, silent=True)
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                result = await ingest_upload(
                    session, data, filename=media.get("filename") or "data.zip", via="telegram"
                )
        except ValueError as exc:
            await self.send(f"⚠️ تحلیل نشد: {str(exc)[:150]}", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "brain_zip_invalid"}
        except Exception as exc:
            logger.exception("brain zip ingest failed: %r", exc)
            await self.send(f"❌ خطا در تحلیل فایل: `{str(exc)[:120]}`", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "brain_zip_error"}

        s = result["stats"]
        owner = result.get("verified_owner")
        owner_line = ("✅ مالکیت تأیید شد (ایمیل حساب با ایمیل شما یکی است)" if owner
                      else "⚠️ ایمیل داخل فایل با ایمیل شناخته‌شدهٔ شما فرق دارد — با پرچم ثبت شد")
        msg = [
            "🧠 *تحلیل دادهٔ هوش انجام و داشبورد به‌روز شد*",
            "",
            f"{owner_line}",
            f"• تعامل با مسئله: {s.get('problem_interactions')}",
            f"• دقت پاسخ‌ها: {s.get('accuracy_pct')}٪" if s.get("accuracy_pct") is not None else "• دقت: —",
            f"• درس‌های کامل‌شده: {s.get('lessons_completed')} از {s.get('lessons_started')}",
            f"• بلندترین استریک: {s.get('longest_streak_days')} روز",
            "",
            "یادآور این هفته خاموش شد. جزئیات کامل: داشبورد «رشد ذهن و هوش».",
        ]
        if result.get("analysis_note"):
            note = result["analysis_note"]
            msg += ["", note[:1500] + ("…" if len(note) > 1500 else "")]
        await self.send("\n".join(msg), chat_id=chat_id, silent=True)
        return {"ok": True, "handled": "brain_zip_ingested", "upload_id": result["id"]}

    async def _refresh_compose_status(self, chat_id: str, buf, just_started: bool = False) -> None:
        """Send (first time) or edit-in-place the live compose status message,
        keeping the submit/cancel reply keyboard attached."""
        from app.services.telegram_compose import COMPOSE_REPLY_KEYBOARD, get_compose_service

        text = get_compose_service().render_status(buf)
        if buf.status_message_id and not just_started:
            res = await self.edit_message_text(chat_id, buf.status_message_id, text)
            if res.get("ok"):
                return
        # first item, or edit failed → send a fresh status + (re)attach keyboard
        res = await self.send_with_reply_keyboard(text, COMPOSE_REPLY_KEYBOARD, chat_id=chat_id)
        mid = res.get("message_id")
        if mid:
            buf.status_message_id = mid

    async def _start_compose_flow(self, chat_id: str, initial_text: Optional[str] = None) -> Dict[str, Any]:
        """Open the intelligent compose flow (used by /new_task, the «کار جدید»
        button, and any plain text). Shows the auto/manual keyboard so the user
        sees BOTH options before anything is created."""
        from app.services.telegram_compose import COMPOSE_REPLY_KEYBOARD, get_compose_service

        _clear_state(chat_id)
        compose = get_compose_service()
        buf = compose.get(chat_id) or compose.start(chat_id)
        if initial_text:
            compose.add_text(chat_id, initial_text)
        intro = (
            "📝 دریافت شد. می‌توانی پیوست‌های بیشتری (متن/صوت 🎙/عکس 🖼/سند 📄) هم بفرستی.\n\n"
            if initial_text else
            "✍️ محتوای کار را بفرست — متن، صوت 🎙، عکس 🖼 یا سند 📄 (می‌توانی چندتا پشت‌سر هم بفرستی).\n\n"
        )
        intro += (
            "بعد یکی را بزن:\n"
            "• «✅ ساخت خودکار» — هوش مصنوعی تحلیل می‌کند، خودش مقصد را تشخیص می‌دهد و مدل را نشان می‌دهد\n"
            "• «🎯 انتخاب مقصد» — خودت انتخاب می‌کنی کجا برود یا کدام موردِ موجود تقویت شود"
        )
        res = await self.send_with_reply_keyboard(intro, COMPOSE_REPLY_KEYBOARD, chat_id=chat_id)
        mid = res.get("message_id")
        if mid and initial_text:
            buf.status_message_id = mid
        return {"ok": True, "handled": "compose_started", "has_text": bool(initial_text)}

    async def _handle_command(self, chat_id: str, text: str) -> Dict[str, Any]:
        lower = text.lower()

        if lower == "/cancel":
            had = _clear_state(chat_id)
            try:
                from app.services.telegram_compose import get_compose_service

                had = get_compose_service().clear(chat_id) or had
            except Exception:
                pass
            await self.send(
                "✅ لغو شد." if had else "هیچ مرحلهٔ فعالی نبود.",
                chat_id=chat_id, silent=True, reply_markup=PERSISTENT_REPLY_KEYBOARD,
            )
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

        # /ask <question> — the cross-domain assistant (phase 4, audit #4):
        # «وضعیت مالی‌ام چطوره؟» answered from the app's live data.
        if lower == "/ask" or lower.startswith(("/ask ", "/ask\n")):
            question = text[len("/ask"):].strip()
            return await self._cmd_ask(chat_id, question)

        # /inbox <text?> — universal capture (صندوق ورودی): drop anything, the
        # triage layer suggests where it belongs, filing happens on the Dashboard.
        # Bare /inbox reports the pending count. Plain text still goes to the
        # compose flow below (unchanged behaviour) — this is the explicit path.
        # Accept "/inbox متن", bare "/inbox", AND "/inbox\nمتن" — pasting the
        # text on the next line is the natural way to drop a multi-line note,
        # and it must not fall through to the compose flow.
        if lower == "/inbox" or lower.startswith(("/inbox ", "/inbox\n")):
            body = text[len("/inbox"):].strip()
            return await self._cmd_inbox(chat_id, body)

        # /new_task <title?>  — an inline one-liner creates immediately (quick path);
        # bare /new_task opens the INTELLIGENT compose flow so even a plain text
        # message gets analysed, routed (auto or manual), and reports the model.
        if lower == "/new_task" or lower.startswith("/new_task "):
            title = text[len("/new_task"):].strip()
            if title:
                return await self._create_task(chat_id, title)
            return await self._start_compose_flow(chat_id)

        # State-aware: a plain message while awaiting a title becomes the task
        # (legacy quick path — kept as a fallback; new flows use compose).
        state = _chat_state.get(chat_id)
        if state and state.get("phase") == "awaiting_title":
            _clear_state(chat_id)
            return await self._create_task(chat_id, text)

        # Any other plain text → treat it as the start of an intelligent task
        # compose (analyse + auto/manual routing), not a dead-end nudge.
        return await self._start_compose_flow(chat_id, initial_text=text)

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

    async def _cmd_inbox(self, chat_id: str, body: str) -> Dict[str, Any]:
        """صندوق ورودی: `/inbox <متن>` captures + triages; bare `/inbox`
        reports the pending count. Fail-open like every bot path — a DB/AI
        problem is reported, never raised."""
        from app.database import SessionLocal
        from app.models.inbox_item import InboxItem
        from app.services import inbox_service

        base = _app_base_url()
        uid = _task_user_id()
        if not body:
            try:
                async with SessionLocal() as session:
                    count = await inbox_service.pending_count(session, uid)
            except Exception as exc:
                logger.warning("telegram /inbox count failed: %r", exc)
                count = None
            msg = (
                "📥 *صندوق ورودی*\n\n"
                + (f"موارد در انتظار بررسی: *{count}*\n\n" if count is not None else "")
                + "هر چیزی را این‌طور بفرست:\n`/inbox متن دلخواه`\n"
                  "خودش تشخیص می‌دهد کجا تعلق دارد؛ تأیید نهایی در میز فرمان است."
                + (f"\n\n🏠 {base}/" if base else "")
            )
            await self.send(msg, chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "inbox_help"}
        try:
            import html as _html

            async with SessionLocal() as session:
                item = InboxItem(
                    user_id=uid,
                    content=_html.escape(body, quote=True),
                    source="telegram",
                    status="pending",
                )
                session.add(item)
                await session.commit()
                await session.refresh(item)
                try:
                    item = await inbox_service.apply_classification(session, item, user_id=uid)
                except Exception as cls_exc:  # capture survives triage failure
                    logger.warning("telegram /inbox triage failed: %r", cls_exc)
        except Exception as exc:
            logger.exception("telegram /inbox capture failed: %r", exc)
            await self.send(f"⚠️ ثبت نشد: `{str(exc)[:150]}`", chat_id=chat_id, silent=True)
            return {"ok": False, "handled": "inbox_error"}
        type_fa = {
            "task": "تسک", "todo": "آیتم لیست", "note": "یادداشت",
            "person": "شخص", None: "نامشخص",
        }.get(item.suggested_type, item.suggested_type or "نامشخص")
        reason = (item.suggestion or {}).get("reason") or ""
        await self.send(
            "📥 در صندوق ورودی ثبت شد.\n\n"
            f"پیشنهاد: *{type_fa}*" + (f"\n_{reason}_" if reason else "")
            + "\n\nتأیید/جابه‌جایی از میز فرمان:" + (f"\n{base}/" if base else " صفحهٔ اصلی برنامه"),
            chat_id=chat_id, silent=True,
        )
        return {"ok": True, "handled": "inbox_captured", "item_id": item.id}

    async def _cmd_ask(self, chat_id: str, question: str) -> Dict[str, Any]:
        if not question:
            await self.send(
                "❓ سؤالت را بعد از /ask بنویس — مثلاً:\n/ask وضعیت مالی‌ام چطوره؟",
                chat_id=chat_id, silent=True,
            )
            return {"ok": True, "handled": "ask_usage"}
        try:
            from app.database import SessionLocal
            from app.services.assistant_chat_service import answer_question

            async with SessionLocal() as session:
                result = await answer_question(session, user_id=0, question=question)
            await self.send(result["text"][:3800], chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "ask", "model": result.get("model")}
        except Exception as exc:
            logger.debug("telegram /ask failed: %r", exc)
            await self.send("⚠️ الان نتوانستم پاسخ بدهم.", chat_id=chat_id, silent=True)
            return {"ok": True, "handled": "ask_error"}

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
            return await self._start_compose_flow(chat_id)
        if data.startswith("task:done:"):
            task_id = data.split(":", 2)[2]
            return await self._complete_task(chat_id, cq_id, task_id)
        # Compose manual target picker: cmp:new | cmp:t:<id> | cmp:i:<id> | cmp:l:<idx>
        if data.startswith("cmp:"):
            from app.services.telegram_compose import get_compose_service

            await self.answer_callback(cq_id, "در حال اعمال…")
            parts = data.split(":")
            kind = parts[1] if len(parts) > 1 else ""
            choice: Dict[str, Any]
            if kind == "new":
                choice = {"type": "new"}
            elif kind == "t" and len(parts) > 2 and parts[2].isdigit():
                choice = {"type": "task", "id": int(parts[2])}
            elif kind == "i" and len(parts) > 2 and parts[2].isdigit():
                choice = {"type": "item", "id": int(parts[2])}
            elif kind == "l" and len(parts) > 2 and parts[2].isdigit():
                choice = {"type": "list", "idx": int(parts[2])}
            else:
                return {"ok": True, "handled": "cmp_unknown", "data": data[:60]}
            return await get_compose_service().apply_choice(chat_id, choice, self)

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
    "• /ask — 🧠 هر سؤالی از داده‌هایت (`/ask وضعیت مالی‌ام چطوره؟`)\n"
    "• /new\\_task — 🆕 ساخت کار (می‌توانی عنوان را همان خط بنویسی: `/new_task خرید نان`)\n"
    "• /inbox — 📥 صندوق ورودی: هر چیزی را بفرست (`/inbox متن`)، خودش تشخیص می‌دهد کجا برود\n"
    "• /status — 📊 وضعیت اعلان‌ها و تعداد کارها\n"
    "• /menu — منوی دسترسی سریع\n"
    "• /ping — 🏓 تست زندهٔ webhook\n"
    "• /diag — 🩺 تشخیص chat\\_id و webhook\n"
    "• /cancel — لغو مرحلهٔ فعلی\n"
    "• /help — همین پیام\n\n"
    "🎙 *ساخت کار از پیوست:* کافیست صوت، عکس، سند یا چند پیام پشت سر هم بفرستی؛ "
    "ربات همه را به‌ترتیب تحلیل می‌کند (رونویسی صوت، خواندن عکس/سند با مدل بصری) "
    "و با زدن «✅ ساخت کار از پیوست‌ها» یک کار از روی آن‌ها می‌سازد.\n\n"
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
