"""/api/system-map — نقشهٔ سیستم درون‌اپ (phase 4, completeness-critic #8).

The owner's complaint «یادم نمی‌مونه چی کجاست» can't be fixed by docs
that live in git. This endpoint is the product's self-description: every
capability, where it lives, whether it's automated, plus live row counts
so the map doubles as a data census. The نقشهٔ سیستم page renders it.

2026-07-30 — the live diagram (owner: «دیاگرام فعال برنامه را رسم کن …
باید جریان این دیاگرام زنده باشد»). Three sibling endpoints:

  * GET  /api/system-map/graph    — the full architecture graph, built by
    INTROSPECTING the running app (see system_graph_service); it can never
    go stale because it is derived from the code, not written about it.
  * GET  /api/system-map/activity — the real request pulse (ring buffer fed
    by SystemPulseMiddleware) + background-engine liveness, polled by the
    diagram to run light along the wires that actually carry traffic.
  * POST /api/system-map/layout and /api/system-map/wires — the owner's
    dragged card positions and hand-drawn wires, persisted server-side in
    the global_settings KV (backend-synced, survives reloads/devices).

The original GET /api/system-map (the curated capability guide) is kept
unchanged — quarantine-not-delete; the page shows it as the «راهنما» tab.

NOTE: this module must NOT use `from __future__ import annotations` — the
@handle_errors wrapper lives in app/middleware.py, so postponed (string)
annotations would be resolved against THAT module's globals, where
``Request`` is undefined; FastAPI then misclassifies `request: Request`
as a required query parameter and every call 422s.
"""
import json
import logging

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import (
    enforce_auth_when_required,
    enforce_write_auth,
    get_optional_user_id,
)
from app.middleware import handle_errors

logger = logging.getLogger(__name__)

router = APIRouter()


async def _count(db: AsyncSession, model, *filters) -> int:
    try:
        stmt = select(func.count()).select_from(model)
        for f in filters:
            stmt = stmt.where(f)
        return int((await db.execute(stmt)).scalar() or 0)
    except Exception:
        return -1  # جدول در دسترس نیست


@router.get("/api/system-map", tags=["system-map"])
@handle_errors
async def system_map(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    counts: dict = {}
    try:
        from app.models.finance import FinancialAccount, Transaction
        from app.models.inbox_item import InboxItem
        from app.models.person import Person
        from app.models.personal_sync import PersonalEmail, PersonalEvent
        from app.models.personal_writing import PersonalWriting
        from app.models.project import Project
        from app.models.task import Task
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList

        counts = {
            "tasks": await _count(db, Task),
            "projects": await _count(db, Project),
            "lists": await _count(db, TodoList),
            "todo_items": await _count(db, TodoItem, TodoItem.deleted_at.is_(None)),
            "writings": await _count(db, PersonalWriting, PersonalWriting.deleted_at.is_(None)),
            "people": await _count(db, Person),
            "accounts": await _count(db, FinancialAccount),
            "transactions": await _count(db, Transaction),
            "emails_synced": await _count(db, PersonalEmail),
            "events_synced": await _count(db, PersonalEvent),
            "inbox_pending": await _count(db, InboxItem, InboxItem.status == "pending"),
        }
    except Exception as exc:
        logger.debug("system map counts skipped: %r", exc)

    sections = [
        {
            "key": "capture", "title": "ثبت و ورود",
            "items": [
                {"name": "کپچر تلگرام", "url": None, "auto": True,
                 "desc": "هر پیام تلگرام → تسک/صندوق ورودی با AI"},
                {"name": "صندوق ورودی", "url": "/", "auto": True,
                 "desc": "هرچه ثبت شود این‌جا تریاژ و بایگانی می‌شود"},
                {"name": "ایمپورت داده", "url": "/import", "auto": False,
                 "desc": "ورود فایل/اکسل/آرشیوها"},
            ],
        },
        {
            "key": "day", "title": "روزِ من",
            "items": [
                {"name": "میز فرمان «امروز من»", "url": "/", "auto": True,
                 "desc": "تسک‌ها + لیست‌ها + مالی + تقویم + افراد + رشد، یک‌جا"},
                {"name": "بریف صبح (تلگرام)", "url": "/attention", "auto": True,
                 "desc": "هر روز ساعت تنظیم‌شده + برنامهٔ پیشنهادی روز"},
                {"name": "گزارش شبانهٔ روز (ایمیل/تلگرام)", "url": "/settings?tab=drive", "auto": True,
                 "desc": "تقویم/ایمیل/مالی/افراد/توسعه + توصیهٔ AI"},
                {"name": "موتور توجه", "url": "/attention", "auto": True,
                 "desc": "۱۲ قاعدهٔ سررسید/انقضا/تولد/جریمه → زنگ + تلگرام"},
                {"name": "مرور هفتگی", "url": "/attention", "auto": True,
                 "desc": "روایت AI از هفته"},
            ],
        },
        {
            "key": "content", "title": "محتوا و دانش",
            "items": [
                {"name": "لیست‌ها (۳۳+ لیست سال‌ها)", "url": "/lists", "auto": False,
                 "desc": "گنجینهٔ اصلی — با موعد، ستاره، زیرآیتم"},
                {"name": "نوشته‌های من", "url": "/writings", "auto": False,
                 "desc": "نوشته‌های بلند شخصی (با سطل زباله و بکاپ)"},
                {"name": "رشد ذهن و خودسازی", "url": "/brain", "auto": True,
                 "desc": "چک‌این عادت‌ها + auto-tick شبانه"},
                {"name": "سطل زباله", "url": "/settings?tab=safety", "auto": True,
                 "desc": "هر حذف قابل بازیابی است"},
            ],
        },
        {
            "key": "life", "title": "زندگی و دارایی",
            "items": [
                {"name": "مالی (حساب‌ها/بودجه/گزارش ماهانه)", "url": "/budget", "auto": True,
                 "desc": "به تفکیک ارز + پول‌خوانی خودکار ایمیل بانکی"},
                {"name": "پروندهٔ زندگی (مدارک/اشتراک‌ها/خودرو)", "url": "/life-file", "auto": True,
                 "desc": "همهٔ مدارک + شمارش معکوس انقضا + تسک تمدید"},
                {"name": "افراد", "url": "/people-profiles", "auto": True,
                 "desc": "پروفایل + تولد/پیگیری → یادآور خودکار"},
                {"name": "پروژه‌ها و مرکز توسعه", "url": "/projects", "auto": True,
                 "desc": "پروژه‌های شخصی + آینهٔ GitHub/Render"},
            ],
        },
        {
            "key": "brain_ai", "title": "هوش مصنوعی",
            "items": [
                {"name": "دستیار سراسری (چت + /ask تلگرام)", "url": "/assistant", "auto": False,
                 "desc": "«وضعیت مالی‌ام چطوره؟» — پاسخ از دادهٔ زنده"},
                {"name": "تنظیمات مدل‌ها + مصرف AI", "url": "/ai-settings", "auto": False,
                 "desc": "هر قابلیت را به مدل دلخواه پین کن"},
                {"name": "جستجوی سراسری", "url": None, "auto": False,
                 "desc": "جعبهٔ بالای صفحه — همهٔ داده‌ها با یک عبارت"},
            ],
        },
        {
            "key": "safety", "title": "ایمنی و خودکاری",
            "items": [
                {"name": "بکاپ شبانه به Drive", "url": "/settings?tab=safety", "auto": True,
                 "desc": "کل دیتابیس، هر شب + دانلود دستی"},
                {"name": "اقدامات مالک", "url": "/settings?tab=safety", "auto": False,
                 "desc": "چک‌لیست کارهایی که فقط تو می‌توانی انجام دهی"},
                {"name": "موتور زمان‌بندی واحد", "url": "/settings?tab=safety", "auto": True,
                 "desc": "۷ کار خودکار (خودسازی/مالی/فایل/پیشنهاد/کوچ داده)"},
            ],
        },
    ]
    return {"ok": True, "counts": counts, "sections": sections}


# ── the live diagram ─────────────────────────────────────────────────────────

_LAYOUT_KEY = "system_map_layout:{user_id}"
_WIRES_KEY = "system_map_wires:{user_id}"


async def _load_kv_json(db: AsyncSession, key: str, default):
    try:
        from app.models.global_setting import GlobalSetting

        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
        ).scalar_one_or_none()
        if row and row.value:
            return json.loads(row.value)
    except Exception as exc:
        logger.debug("system map kv read %s skipped: %s", key, exc)
    return default


_MAX_KV_BYTES = 262_144  # a layout/wires blob has no business being >256KB


async def _save_kv_json(db: AsyncSession, key: str, value) -> None:
    from app.models.global_setting import GlobalSetting

    payload = json.dumps(value, ensure_ascii=False)
    if len(payload.encode("utf-8")) > _MAX_KV_BYTES:
        raise ValueError("payload too large")
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=key, value=payload))
    else:
        row.value = payload
    await db.commit()


@router.get("/api/system-map/graph", tags=["system-map"])
@handle_errors
async def system_map_graph(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """The full architecture graph + this user's saved layout and wires."""
    from app.services import system_graph_service, system_pulse_service

    graph = system_graph_service.build_graph(request.app)
    layout = await _load_kv_json(db, _LAYOUT_KEY.format(user_id=user_id), {})
    wires = await _load_kv_json(db, _WIRES_KEY.format(user_id=user_id), [])
    learned = await system_pulse_service.load_learned_edges(db)
    return {
        "ok": True,
        "success": True,
        **graph,
        "layout": layout,
        "manual_wires": wires,
        "learned_wires": learned,
        "engines": system_graph_service.engine_snapshot(request.app),
    }


@router.get("/api/system-map/activity", tags=["system-map"])
@handle_errors
async def system_map_activity(
    request: Request,
    window: float = 60.0,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    """The real pulse: recent request activity + engine liveness.

    Polled by the diagram every few seconds; also the lazy flush point for
    traffic-learned wires (written through THIS request's session so test
    dependency overrides and the pool are honoured — never a private engine).
    """
    from app.services import system_graph_service, system_pulse_service

    window = max(5.0, min(float(window), 300.0))
    snapshot = system_pulse_service.activity_snapshot(window)
    await system_pulse_service.load_learned_edges(db)
    await system_pulse_service.flush_learned_edges(db)
    return {
        "ok": True,
        "success": True,
        **snapshot,
        "engines": system_graph_service.engine_snapshot(request.app),
    }


class LayoutPayload(BaseModel):
    positions: dict = {}
    view: dict = {}
    hidden_kinds: list[str] = []


@router.post("/api/system-map/layout", tags=["system-map"])
@handle_errors
async def save_system_map_layout(
    payload: LayoutPayload,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    """Persist dragged card positions / view state for this user."""
    await _save_kv_json(
        db,
        _LAYOUT_KEY.format(user_id=user_id),
        {
            "positions": payload.positions,
            "view": payload.view,
            "hidden_kinds": payload.hidden_kinds,
        },
    )
    return {"ok": True, "success": True}


class WirePayload(BaseModel):
    action: str  # "add" | "remove"
    source: str
    target: str
    label: str = ""


@router.post("/api/system-map/wires", tags=["system-map"])
@handle_errors
async def mutate_system_map_wires(
    payload: WirePayload,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    """Add/remove a hand-drawn wire — the drag-to-connect gesture on the
    diagram lands here, so the connection is backend-synced, not cosmetic."""
    if payload.action not in ("add", "remove"):
        raise ValueError("action must be 'add' or 'remove'")
    if not payload.source or not payload.target or payload.source == payload.target:
        raise ValueError("source and target must be two different node ids")
    key = _WIRES_KEY.format(user_id=user_id)
    wires: list = await _load_kv_json(db, key, [])
    wires = [
        w for w in wires
        if not (w.get("source") == payload.source and w.get("target") == payload.target)
    ]
    if payload.action == "add":
        wires.append({
            "source": payload.source,
            "target": payload.target,
            "label": payload.label or "",
        })
    await _save_kv_json(db, key, wires)
    return {"ok": True, "success": True, "manual_wires": wires}
