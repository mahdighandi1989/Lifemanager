"""/api/telegram/* — bidirectional Telegram bot endpoints.

  POST /api/telegram/webhook          ← Telegram POSTs updates here (commands + callbacks)
  POST /api/telegram/set-webhook      register the webhook URL with Telegram
  POST /api/telegram/delete-webhook   unregister it
  POST /api/telegram/heal-webhook     run one self-heal cycle (idempotent)
  GET  /api/telegram/status           config + webhook diagnostics (no secrets)
  POST /api/telegram/test             send a test message to the configured chat

Routers carry ABSOLUTE /api/... paths and mount with no prefix (mirrors
notifications.api_router). The webhook handler ALWAYS returns HTTP 200 — a 5xx
makes Telegram retry and flood the bot.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.services.telegram_service import (
    WEBHOOK_PATH,
    get_telegram_bot,
    telegram_webhook_heal_once,
    _resolve_public_url,
)

logger = logging.getLogger(__name__)

router = APIRouter()


class WebhookUrlBody(BaseModel):
    # Optional: when omitted, the public URL + canonical path is used.
    webhook_url: Optional[str] = None


class TestBody(BaseModel):
    message: Optional[str] = None


@router.post("/api/telegram/webhook", tags=["telegram"])
async def telegram_webhook(request: Request):
    """Receive a Telegram update. Always 200 so Telegram never retries-storms."""
    try:
        update = await request.json()
    except Exception as exc:
        logger.warning("telegram webhook: invalid JSON body: %r", exc)
        return {"ok": True}
    try:
        return await get_telegram_bot().handle_update(update)
    except Exception as exc:  # belt-and-suspenders — handle_update already guards
        logger.exception("telegram webhook crashed: %r", exc)
        return {"ok": True, "handler_error": str(exc)[:200]}


@router.post("/api/telegram/set-webhook", tags=["telegram"])
async def set_webhook(payload: WebhookUrlBody):
    """Register the webhook with Telegram. Body may omit ``webhook_url`` to use
    the auto-resolved public URL + canonical path."""
    url = (payload.webhook_url or "").strip()
    if not url:
        public = _resolve_public_url()
        if not public:
            return {"ok": False, "error": "no webhook_url and no BACKEND_PUBLIC_URL/RENDER_EXTERNAL_URL set"}
        url = f"{public}{WEBHOOK_PATH}"
    return await get_telegram_bot().set_webhook(url)


@router.post("/api/telegram/delete-webhook", tags=["telegram"])
async def delete_webhook():
    return await get_telegram_bot().delete_webhook()


@router.post("/api/telegram/heal-webhook", tags=["telegram"])
async def heal_webhook():
    """Idempotent manual trigger for the self-heal supervisor. Use when buttons
    stop responding and you don't want to wait for the next 5-minute cycle."""
    return await telegram_webhook_heal_once()


@router.get("/api/telegram/status", tags=["telegram"])
async def telegram_status():
    """Config + webhook diagnostics. Never returns the bot token."""
    bot = get_telegram_bot()
    info = await bot.get_webhook_info()
    result = info.get("result") or {}
    return {
        "ok": True,
        "configured": bot.is_configured(),
        "has_bot_token": bool(bot.bot_token),
        "has_chat_id": bool(bot.chat_id),
        "public_url": _resolve_public_url(),
        "expected_webhook_url": f"{_resolve_public_url()}{WEBHOOK_PATH}" if _resolve_public_url() else "",
        "webhook": {
            "url": result.get("url", ""),
            "pending_update_count": result.get("pending_update_count", 0),
            "last_error_message": result.get("last_error_message", ""),
        } if info.get("ok") else {"error": info.get("error")},
    }


@router.post("/api/telegram/test", tags=["telegram"])
async def test_send(payload: TestBody):
    """Send a test message to the configured chat — proves the outbound path."""
    bot = get_telegram_bot()
    if not bot.is_configured():
        return {"ok": False, "error": "TELEGRAM_BOT_TOKEN/CHAT_ID unset"}
    msg = (payload.message or "✅ پیام تست از Lifemanager").strip()
    return await bot.send(msg, silent=True)
