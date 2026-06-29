"""Telegram compose — media detection, ordered buffering, live status, the
submit pipeline (download → per-type AI analysis → structure → create), and the
handle_update routing that feeds it.

AI calls + Telegram I/O are monkeypatched; the create step runs against an
in-memory SQLite (StaticPool so the bot's own SessionLocal sessions share it).
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.database as dbmod
from app.services import telegram_compose as tc
from app.services import telegram_service as tg


@pytest.fixture(autouse=True)
def _reset_compose():
    tc._service = None
    yield
    tc._service = None


@pytest_asyncio.fixture
async def compose_db(monkeypatch):
    """Point the bot's SessionLocal at a shared in-memory SQLite with tables."""
    from app.database import Base
    import app.models  # noqa: F401 — register every model on Base

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:", poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(dbmod, "SessionLocal", factory)
    yield factory


def _photo_update(chat_id=123):
    return {"message": {"chat": {"id": chat_id}, "photo": [
        {"file_id": "small", "file_size": 100}, {"file_id": "big", "file_size": 9000}]}}


def _voice_update(chat_id=123):
    return {"message": {"chat": {"id": chat_id},
                        "voice": {"file_id": "v1", "duration": 12, "mime_type": "audio/ogg"}}}


# ── detect_media ─────────────────────────────────────────────────────────────
def test_detect_media_picks_largest_photo():
    m = tc.ComposeService.detect_media(_photo_update()["message"])
    assert m["kind"] == "photo" and m["file_id"] == "big"  # largest by file_size


def test_detect_media_voice_document_text():
    assert tc.ComposeService.detect_media(_voice_update()["message"])["kind"] == "voice"
    doc = {"document": {"file_id": "d", "mime_type": "application/pdf", "file_name": "a.pdf"}}
    assert tc.ComposeService.detect_media(doc)["kind"] == "document"
    assert tc.ComposeService.detect_media({"text": "سلام"}) is None  # plain text → not media


# ── buffer ───────────────────────────────────────────────────────────────────
def test_buffer_ordering_and_clear():
    svc = tc.get_compose_service()
    svc.add_media("1", {"kind": "voice", "file_id": "v", "filename": "voice.ogg"})
    svc.add_text("1", "اول این")
    svc.add_media("1", {"kind": "photo", "file_id": "p", "filename": "photo.jpg"})
    buf = svc.get("1")
    assert [it.order for it in buf.items] == [1, 2, 3]      # arrival order preserved
    assert [it.kind for it in buf.items] == ["voice", "text", "photo"]
    assert svc.has_active("1") is True
    assert svc.clear("1") is True
    assert svc.has_active("1") is False


def test_render_status_lists_items_in_order():
    svc = tc.get_compose_service()
    svc.add_media("1", {"kind": "voice", "file_id": "v", "filename": "voice.ogg", "duration": 5})
    svc.add_text("1", "یادداشت")
    status = tc.ComposeService.render_status(svc.get("1"))
    assert "1." in status and "2." in status
    assert "voice.ogg" in status and "یادداشت" in status


# ── handle_update routing ────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_photo_routes_into_compose(monkeypatch):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    bot = tg.TelegramBot()
    sends = []

    async def _swk(message, keyboard_rows, *, silent=True, chat_id=None):
        sends.append(message)
        return {"ok": True, "message_id": 50}

    monkeypatch.setattr(bot, "send_with_reply_keyboard", _swk)
    res = await bot.handle_update(_photo_update())
    assert res["handled"] == "compose_media_added"
    assert tc.get_compose_service().has_active("123") is True
    assert sends and "ساخت کار" in sends[0]


@pytest.mark.asyncio
async def test_text_while_composing_is_buffered(monkeypatch):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    bot = tg.TelegramBot()
    monkeypatch.setattr(bot, "send_with_reply_keyboard",
                        lambda *a, **k: _async({"ok": True, "message_id": 1}))
    monkeypatch.setattr(bot, "edit_message_text", lambda *a, **k: _async({"ok": True}))
    tc.get_compose_service().add_media("123", {"kind": "voice", "file_id": "v", "filename": "v.ogg"})
    res = await bot.handle_update({"message": {"chat": {"id": 123}, "text": "این را اضافه کن"}})
    assert res["handled"] == "compose_text_added"
    items = tc.get_compose_service().get("123").items
    assert items[-1].kind == "text" and items[-1].text == "این را اضافه کن"


@pytest.mark.asyncio
async def test_command_not_swallowed_by_compose(monkeypatch):
    """A /command must NOT be captured even while composing."""
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    bot = tg.TelegramBot()
    monkeypatch.setattr(bot, "send", lambda *a, **k: _async({"ok": True}))
    monkeypatch.setattr(bot, "send_with_reply_keyboard", lambda *a, **k: _async({"ok": True, "message_id": 1}))
    tc.get_compose_service().add_media("123", {"kind": "voice", "file_id": "v", "filename": "v.ogg"})
    res = await bot.handle_update({"message": {"chat": {"id": 123}, "text": "/ping"}})
    assert res["handled"] == "ping"  # command path ran, compose did not eat it


# ── submit pipeline ──────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_submit_builds_task_from_voice_and_photo(monkeypatch, compose_db):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    monkeypatch.setenv("TELEGRAM_TASK_USER_ID", "0")
    bot = tg.TelegramBot()

    sent = []
    monkeypatch.setattr(bot, "send", lambda msg, **k: sent.append(msg) or _async({"ok": True}))
    monkeypatch.setattr(bot, "download_file", lambda *a, **k: _async(b"\x00\x01rawbytes"))

    # AI: each attachment "analysed", then a structured task JSON.
    import app.services.ai.inference_gateway as gw

    async def _mm(session, prompt, files, **k):
        kind = "صوت" if "رونویسی" in prompt else "تصویر"
        return {"ok": True, "text": f"متن استخراج‌شده از {kind}", "model": "TestVision"}

    async def _complete(session, prompt, **k):
        return {"ok": True, "text": '{"title":"خرید هفتگی","description":"از صوت و عکس","priority":"high","target":"task","due_date":null}',
                "model": "TestText"}

    monkeypatch.setattr(gw, "complete_multimodal", _mm)
    monkeypatch.setattr(gw, "complete", _complete)

    svc = tc.get_compose_service()
    svc.add_media("123", {"kind": "voice", "file_id": "v1", "filename": "voice.ogg"})
    svc.add_media("123", {"kind": "photo", "file_id": "p1", "filename": "photo.jpg"})

    res = await svc.submit("123", bot=bot)
    assert res["handled"] == "compose_submitted"
    assert res["kind"] == "task"
    assert res["title"] == "خرید هفتگی"
    assert svc.has_active("123") is False  # buffer cleared
    # the confirmation mentions the vision model + analysis
    joined = "\n".join(sent)
    assert "خرید هفتگی" in joined and "TestVision" in joined


@pytest.mark.asyncio
async def test_submit_falls_back_when_ai_unavailable(monkeypatch, compose_db):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    bot = tg.TelegramBot()
    monkeypatch.setattr(bot, "send", lambda *a, **k: _async({"ok": True}))
    monkeypatch.setattr(bot, "download_file", lambda *a, **k: _async(b"data"))

    import app.services.ai.inference_gateway as gw
    monkeypatch.setattr(gw, "complete_multimodal", lambda *a, **k: _async({"ok": False, "error": "no_capable_model"}))
    monkeypatch.setattr(gw, "complete", lambda *a, **k: _async({"ok": False, "error": "no_model"}))

    svc = tc.get_compose_service()
    svc.add_text("123", "یک کار از متن خالص")
    res = await svc.submit("123", bot=bot)
    assert res["handled"] == "compose_submitted"
    assert res["kind"] == "task"
    assert "یک کار از متن خالص" in res["title"]  # fallback used the raw text


# small helper to wrap a value in an awaitable for monkeypatched async methods
def _async(value):
    async def _coro():
        return value
    return _coro()


# ── list-aware routing + dedup/strengthen ────────────────────────────────────
import json  # noqa: E402


def _ai(monkeypatch, structure_obj, merge_text="توضیح ادغام‌شده و قوی‌تر"):
    """Patch the AI gateway: multimodal extracts text, complete returns the
    structuring JSON (or the merge text when given the merge prompt)."""
    import app.services.ai.inference_gateway as gw

    async def _mm(session, prompt, files, **k):
        return {"ok": True, "text": "متن استخراج‌شده", "model": "TestVision"}

    async def _complete(session, prompt, **k):
        if "بازنویسی" in prompt:  # the merge prompt
            return {"ok": True, "text": merge_text, "model": "TestText"}
        return {"ok": True, "text": json.dumps(structure_obj, ensure_ascii=False), "model": "TestText"}

    monkeypatch.setattr(gw, "complete_multimodal", _mm)
    monkeypatch.setattr(gw, "complete", _complete)


@pytest.mark.asyncio
async def test_routes_into_existing_list(monkeypatch, compose_db):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    monkeypatch.setenv("TELEGRAM_TASK_USER_ID", "0")
    from app.models.todo_list import TodoList

    async with compose_db() as s:
        s.add(TodoList(name="لیست خرید", user_id=0))
        await s.commit()

    bot = tg.TelegramBot()
    monkeypatch.setattr(bot, "send", lambda *a, **k: _async({"ok": True}))
    monkeypatch.setattr(bot, "download_file", lambda *a, **k: _async(b"x"))
    _ai(monkeypatch, {"action": "create", "title": "شیر و نان",
                      "description": "بخر", "target": "list", "list_name": "لیست خرید"})

    svc = tc.get_compose_service()
    svc.add_text("123", "شیر و نان بخر")
    res = await svc.submit("123", bot=bot)
    assert res["kind"] == "todo_item"          # routed to a list item, not a bare task
    assert res["list_name"] == "لیست خرید"


@pytest.mark.asyncio
async def test_update_strengthens_existing_task(monkeypatch, compose_db):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    monkeypatch.setenv("TELEGRAM_TASK_USER_ID", "0")
    from app.models.task import Task, TaskStatus

    async with compose_db() as s:
        t = Task(title="پروژهٔ آلفا", description="نسخهٔ قدیمی", status=TaskStatus.TODO, user_id=0)
        s.add(t)
        await s.commit()
        await s.refresh(t)
        task_id = t.id

    bot = tg.TelegramBot()
    monkeypatch.setattr(bot, "send", lambda *a, **k: _async({"ok": True}))
    monkeypatch.setattr(bot, "download_file", lambda *a, **k: _async(b"x"))
    _ai(monkeypatch, {"action": "update", "update_target_kind": "task",
                      "update_target_id": task_id, "title": "پروژهٔ آلفا",
                      "description": "جزئیات تازه", "target": "task"})

    svc = tc.get_compose_service()
    svc.add_text("123", "این هم اطلاعات تکمیلی پروژهٔ آلفا")
    res = await svc.submit("123", bot=bot)
    assert res["kind"] == "task" and res["updated"] is True
    assert res["id"] == task_id                # updated the SAME task, no duplicate
    async with compose_db() as s:
        again = await s.get(Task, task_id)
        assert "ادغام‌شده" in again.description  # description strengthened via merge


@pytest.mark.asyncio
async def test_hallucinated_update_id_falls_back_to_create(monkeypatch, compose_db):
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    monkeypatch.setenv("TELEGRAM_TASK_USER_ID", "0")
    bot = tg.TelegramBot()
    monkeypatch.setattr(bot, "send", lambda *a, **k: _async({"ok": True}))
    monkeypatch.setattr(bot, "download_file", lambda *a, **k: _async(b"x"))
    # No tasks exist, but the model claims to update #999 → must guard + create.
    _ai(monkeypatch, {"action": "update", "update_target_kind": "task",
                      "update_target_id": 999, "title": "کار تازه",
                      "description": "...", "target": "task"})
    svc = tc.get_compose_service()
    svc.add_text("123", "یک کار کاملاً جدید")
    res = await svc.submit("123", bot=bot)
    assert res["kind"] == "task" and res["updated"] is False  # created, not updated
