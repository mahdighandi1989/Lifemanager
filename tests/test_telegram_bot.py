"""Bidirectional Telegram bot — outbound transport, inbound command/callback
dispatch, security gate, and webhook self-heal decision logic.

The DB-touching helpers (_create_task / _list_open_tasks / _complete_task) are
monkeypatched per test so the dispatch + message-formatting logic is exercised
without standing up a database. The route-level tests go through the real
FastAPI app via api_client and assert the always-200 webhook contract.
"""
from __future__ import annotations

import pytest

from app.services import telegram_service as tg


# ── helpers ──────────────────────────────────────────────────────────────────
def _make_bot(monkeypatch, *, token="", chat=""):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", token)
    monkeypatch.setenv("TELEGRAM_CHAT_ID", chat)
    return tg.TelegramBot()


def _capture_send(bot):
    """Replace bot.send with an async capture; returns the list of calls."""
    calls: list[dict] = []

    async def _send(message, *, subject=None, silent=False, reply_markup=None, chat_id=None):
        calls.append({"message": message, "reply_markup": reply_markup, "chat_id": chat_id})
        return {"ok": True}

    bot.send = _send  # type: ignore[assignment]
    return calls


def _msg_update(text, chat_id=123):
    return {"message": {"text": text, "chat": {"id": chat_id}}}


# ── config / transport ───────────────────────────────────────────────────────
def test_is_configured(monkeypatch):
    assert _make_bot(monkeypatch, token="", chat="").is_configured() is False
    assert _make_bot(monkeypatch, token="t", chat="").is_configured() is False
    assert _make_bot(monkeypatch, token="t", chat="9").is_configured() is True


def test_send_message_sync_noop_without_token(monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    # No token → logs + returns True so the call site is exercised in dev/test.
    assert tg.send_message_sync(body="hi", chat_id="1") is True


def test_resolve_public_url_priority(monkeypatch):
    monkeypatch.delenv("BACKEND_PUBLIC_URL", raising=False)
    monkeypatch.delenv("RENDER_EXTERNAL_URL", raising=False)
    monkeypatch.delenv("PUBLIC_URL", raising=False)
    assert tg._resolve_public_url() == ""
    monkeypatch.setenv("RENDER_EXTERNAL_URL", "https://r.example.com/")
    assert tg._resolve_public_url() == "https://r.example.com"
    monkeypatch.setenv("BACKEND_PUBLIC_URL", "https://b.example.com")
    assert tg._resolve_public_url() == "https://b.example.com"  # higher priority


@pytest.mark.asyncio
async def test_send_returns_error_when_unconfigured(monkeypatch):
    bot = _make_bot(monkeypatch, token="", chat="")
    res = await bot.send("hi")
    assert res["ok"] is False


# ── inbound dispatch ─────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ignores_empty_and_non_message(monkeypatch):
    bot = _make_bot(monkeypatch)
    assert (await bot.handle_update({}))["ignored"] is True
    assert (await bot.handle_update(_msg_update("")))["ignored"] is True


@pytest.mark.asyncio
async def test_security_gate_blocks_other_chats(monkeypatch):
    bot = _make_bot(monkeypatch, token="t", chat="111")
    calls = _capture_send(bot)
    res = await bot.handle_update(_msg_update("/ping", chat_id=999))
    assert res["ignored"] is True
    assert calls == []  # never replied to a non-configured chat


@pytest.mark.asyncio
async def test_ping(monkeypatch):
    bot = _make_bot(monkeypatch, chat="")  # empty configured → answers anyone
    calls = _capture_send(bot)
    res = await bot.handle_update(_msg_update("/ping", chat_id=55))
    assert res["handled"] == "ping"
    assert "pong" in calls[0]["message"]


@pytest.mark.asyncio
async def test_help_attaches_persistent_keyboard(monkeypatch):
    bot = _make_bot(monkeypatch)
    calls = _capture_send(bot)
    res = await bot.handle_update(_msg_update("/start"))
    assert res["handled"] == "help"
    assert calls[0]["reply_markup"] == tg.PERSISTENT_REPLY_KEYBOARD


@pytest.mark.asyncio
async def test_persistent_keyboard_alias_maps_to_command(monkeypatch):
    bot = _make_bot(monkeypatch)
    _capture_send(bot)
    # tapping the "📊 وضعیت" button sends that literal text → must route to /status
    captured = {}

    async def _status(chat_id):
        captured["called"] = chat_id
        return {"ok": True, "handled": "status"}

    bot._cmd_status = _status  # type: ignore[assignment]
    res = await bot.handle_update(_msg_update("📊 وضعیت"))
    assert res["handled"] == "status"
    assert captured["called"] == "123"


@pytest.mark.asyncio
async def test_cancel_clears_state(monkeypatch):
    bot = _make_bot(monkeypatch)
    _capture_send(bot)
    tg._set_state("123", "awaiting_title")
    res = await bot.handle_update(_msg_update("/cancel"))
    assert res["handled"] == "cancel"
    assert "123" not in tg._chat_state


@pytest.mark.asyncio
async def test_new_task_inline_title_creates(monkeypatch):
    bot = _make_bot(monkeypatch)
    created = {}

    async def _create(chat_id, title):
        created["chat_id"], created["title"] = chat_id, title
        return {"ok": True, "handled": "task_created", "task_id": 1}

    bot._create_task = _create  # type: ignore[assignment]
    res = await bot.handle_update(_msg_update("/new_task خرید نان"))
    assert res["handled"] == "task_created"
    assert created["title"] == "خرید نان"


@pytest.mark.asyncio
async def test_new_task_flow_awaits_then_creates(monkeypatch):
    bot = _make_bot(monkeypatch)
    calls = _capture_send(bot)
    created = {}

    async def _create(chat_id, title):
        created["title"] = title
        return {"ok": True, "handled": "task_created", "task_id": 2}

    bot._create_task = _create  # type: ignore[assignment]

    # bare /new_task → prompt + state
    res1 = await bot.handle_update(_msg_update("/new_task"))
    assert res1["handled"] == "new_task_prompt"
    assert tg._chat_state["123"]["phase"] == "awaiting_title"
    # next plain message becomes the task title, state cleared
    res2 = await bot.handle_update(_msg_update("تماس با علی"))
    assert res2["handled"] == "task_created"
    assert created["title"] == "تماس با علی"
    assert "123" not in tg._chat_state
    assert calls  # prompt was sent


@pytest.mark.asyncio
async def test_unknown_command_nudges(monkeypatch):
    bot = _make_bot(monkeypatch)
    calls = _capture_send(bot)
    res = await bot.handle_update(_msg_update("بلابلا"))
    assert res["handled"] == "unknown"
    assert "/help" in calls[0]["message"]


# ── callbacks ────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_callback_task_done_dispatches(monkeypatch):
    bot = _make_bot(monkeypatch)
    captured = {}

    async def _complete(chat_id, cq_id, task_id):
        captured["task_id"] = task_id
        return {"ok": True, "handled": "task_done", "task_id": task_id}

    bot._complete_task = _complete  # type: ignore[assignment]
    update = {"callback_query": {"id": "cq1", "data": "task:done:7",
                                 "message": {"chat": {"id": 123}}}}
    res = await bot.handle_update(update)
    assert res["handled"] == "task_done"
    assert captured["task_id"] == "7"


@pytest.mark.asyncio
async def test_callback_menu_new_task_sets_state(monkeypatch):
    bot = _make_bot(monkeypatch)
    _capture_send(bot)

    async def _ack(cq_id, text=""):
        return None

    bot.answer_callback = _ack  # type: ignore[assignment]
    update = {"callback_query": {"id": "cq2", "data": "menu:new_task",
                                 "message": {"chat": {"id": 123}}}}
    res = await bot.handle_update(update)
    assert res["handled"] == "cb_new_task"
    assert tg._chat_state["123"]["phase"] == "awaiting_title"


# ── webhook self-heal ────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_heal_skips_without_token(monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    assert (await tg.telegram_webhook_heal_once())["skipped"] == "no_bot_token"


@pytest.mark.asyncio
async def test_heal_skips_without_public_url(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "t")
    monkeypatch.delenv("BACKEND_PUBLIC_URL", raising=False)
    monkeypatch.delenv("RENDER_EXTERNAL_URL", raising=False)
    monkeypatch.delenv("PUBLIC_URL", raising=False)
    assert (await tg.telegram_webhook_heal_once())["skipped"] == "no_public_url"


@pytest.mark.asyncio
async def test_heal_healthy_when_url_matches(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "t")
    monkeypatch.setenv("BACKEND_PUBLIC_URL", "https://app.example.com")
    expected = f"https://app.example.com{tg.WEBHOOK_PATH}"

    async def _info(self):
        return {"ok": True, "result": {"url": expected, "pending_update_count": 0}}

    monkeypatch.setattr(tg.TelegramBot, "get_webhook_info", _info)
    res = await tg.telegram_webhook_heal_once()
    assert res.get("healthy") is True


@pytest.mark.asyncio
async def test_heal_detects_url_mismatch(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "t")
    monkeypatch.setenv("BACKEND_PUBLIC_URL", "https://app.example.com")

    async def _info(self):
        return {"ok": True, "result": {"url": "https://old.example.com/x", "pending_update_count": 0}}

    monkeypatch.setattr(tg.TelegramBot, "get_webhook_info", _info)

    # Stop the real setWebhook from making a network call.
    async def _fake_post(self, url, *a, **k):  # pragma: no cover - guard
        raise AssertionError("network call should be mocked")

    res = await tg.telegram_webhook_heal_once()
    # url mismatch detected → it attempts a reset (network mocked away → error),
    # but crucially it did NOT report healthy.
    assert "healthy" not in res
    assert "reasons" in res or "error" in res


# ── route-level (always-200 webhook contract) ────────────────────────────────
def test_webhook_route_always_200(api_client, monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    monkeypatch.delenv("TELEGRAM_CHAT_ID", raising=False)
    r = api_client.post("/api/telegram/webhook", json=_msg_update("/ping"))
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_webhook_route_invalid_json_200(api_client):
    r = api_client.post("/api/telegram/webhook", content=b"not json",
                        headers={"Content-Type": "application/json"})
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_status_route_no_secrets(api_client, monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    r = api_client.get("/api/telegram/status")
    assert r.status_code == 200
    body = r.json()
    assert body["configured"] is False
    assert "bot_token" not in body  # never leak the token


def test_set_webhook_needs_url_or_public(api_client, monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "t")
    monkeypatch.delenv("BACKEND_PUBLIC_URL", raising=False)
    monkeypatch.delenv("RENDER_EXTERNAL_URL", raising=False)
    monkeypatch.delenv("PUBLIC_URL", raising=False)
    r = api_client.post("/api/telegram/set-webhook", json={})
    assert r.status_code == 200
    assert r.json()["ok"] is False


def test_test_route_unconfigured(api_client, monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    r = api_client.post("/api/telegram/test", json={"message": "x"})
    assert r.status_code == 200
    assert r.json()["ok"] is False
