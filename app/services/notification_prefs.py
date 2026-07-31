"""Notification preferences — per-event + per-channel routing the owner controls.

The gap this fills: the bell/Telegram fan-out used to be hard-coded — every
registered event always sent, always loud. There was no "send this one or not /
make it silent or not / turn Telegram off" surface (the kind the reference
oversight project exposes). This module is that surface, adapted to this project:

  • events   — per-event master on/off ("ارسال بشه یا نه")
  • sound    — per-event sound ("صدادار باشه یا نه"; sound=False ⇒ silent)
  • channels — per-channel on/off (in-app is always the bell's system-of-record;
               telegram + email are the external transports)
  • min_priority — drop anything below this rank

Storage: a single JSON blob in the EXISTING ``global_settings`` table (key
``notification_prefs``) — no new table / no migration, and it survives the
Render free-tier ephemeral filesystem (a JSON file would not). A process-wide
cache is loaded at startup and refreshed on every save, so ``notify_event``'s
hot path never needs a DB round-trip. When the cache is cold (or the DB is
unavailable) ``get_prefs`` returns the defaults — which reproduce the previous
"always send, always loud" behaviour exactly, so this is behaviour-preserving.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.global_setting import GlobalSetting

logger = logging.getLogger(__name__)

_PREFS_KEY = "notification_prefs"

# Priority ranking — matches notify_event's priority strings.
PRIORITY_RANK: Dict[str, int] = {"low": 0, "normal": 1, "high": 2, "critical": 3}

# The event catalog the settings UI renders. Each entry carries a Persian label
# and the channels it can fan out to. default_enabled / default_sound reproduce
# the prior behaviour (everything on + loud) so unconfigured installs are
# unchanged. Unknown events (not listed here) default to enabled + loud too.
EVENT_CATALOG: List[Dict[str, Any]] = [
    {"key": "verify_failed", "label": "ورود / تأیید ناموفق", "help": "هشدار امنیتی هنگام تلاش ناموفق ورود یا امضای نامعتبر",
     "channels": ["in_app", "telegram", "email"], "default_enabled": True, "default_sound": True},
    {"key": "budget_alert", "label": "هشدار بودجه", "help": "وقتی بودجهٔ کافی برای یک خرید/کار نداری",
     "channels": ["in_app", "telegram", "email"], "default_enabled": True, "default_sound": True},
    {"key": "budget_affordable", "label": "بودجهٔ کافی برای کار", "help": "وقتی موجودی برای انجام یک کار کافی شد",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": False},
    {"key": "task_done", "label": "انجام کار", "help": "وقتی کاری تکمیل می‌شود",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": False},
    {"key": "recommendation", "label": "پیشنهاد جدید", "help": "پیشنهادهای هوشمند سیستم",
     "channels": ["in_app"], "default_enabled": True, "default_sound": False},
    {"key": "ai_feedback", "label": "بازخورد هوش مصنوعی", "help": "بازخورد/راهنمایی تحلیل‌های هوش مصنوعی",
     "channels": ["in_app"], "default_enabled": True, "default_sound": False},
    {"key": "login_succeeded", "label": "ورود موفق", "help": "اطلاع از ورود موفق به حساب",
     "channels": ["in_app"], "default_enabled": True, "default_sound": False},
    {"key": "attention_alert", "label": "موتور توجه (موعد/انقضا)", "help": "هشدار ددلاین‌ها، انقضای مدارک و اشتراک‌ها، و صندوق ورودی مانده",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": True},
    {"key": "morning_brief", "label": "پیام صبحگاهی", "help": "برنامهٔ امروز، هر روز صبح",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": False},
    {"key": "weekly_review", "label": "مرور هفتگی", "help": "گزارش و پیشنهادهای هفتگی هوش مصنوعی",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": False},
    {"key": "location_off", "label": "خاموش‌بودنِ موقعیت مکانی", "help": "وقتی ردیابیِ موقعیت روی گوشی خاموش یا باطل شده — روی خودِ گوشی هم هشدار داده می‌شود",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": True},
    {"key": "mobile_offline", "label": "قطعیِ اتصال موبایل", "help": "وقتی اپ همراه دیگر سیگنالی نمی‌فرستد؛ تا وصل شدن تکرار می‌شود",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": True},
    {"key": "mobile_online", "label": "بازگشتِ اتصال موبایل", "help": "یک‌بار، وقتی گوشی دوباره سیگنال می‌فرستد",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": False},
    {"key": "personal_digest", "label": "گزارش روز (تقویم + ایمیل)", "help": "هر شب: رویدادهای امروز/فردا، ایمیل‌های منتظر اقدام و وضعیت پروژه‌ها؛ نسخهٔ ایمیلی از تنظیمات گوگل کنترل می‌شود",
     "channels": ["in_app", "telegram"], "default_enabled": True, "default_sound": False},
]

# The channels surface — in_app is the always-on bell history; telegram + email
# are owner-toggleable external transports.
CHANNEL_CATALOG: List[Dict[str, Any]] = [
    {"key": "in_app", "label": "درون‌برنامه‌ای (زنگوله)", "toggleable": False},
    {"key": "telegram", "label": "تلگرام", "toggleable": True},
    {"key": "email", "label": "ایمیل", "toggleable": True},
]


def _default_prefs() -> Dict[str, Any]:
    return {
        "events": {e["key"]: e["default_enabled"] for e in EVENT_CATALOG},
        "sound": {e["key"]: e["default_sound"] for e in EVENT_CATALOG},
        "channels": {
            "in_app": {"enabled": True},
            "telegram": {"enabled": True},
            "email": {"enabled": False},
        },
        "min_priority": "low",
    }


# Process-wide cache. ``None`` ⇒ not loaded yet (get_prefs falls back to
# defaults, which are behaviour-preserving).
_cache: Optional[Dict[str, Any]] = None


def _merge(base: Dict[str, Any], partial: Dict[str, Any]) -> Dict[str, Any]:
    """Deep-merge one level of nested dicts (events/sound/channels), shallow
    elsewhere — same shape the reference project's update_prefs uses."""
    out = json.loads(json.dumps(base))  # cheap deep copy
    for k, v in (partial or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k].update(v)
        else:
            out[k] = v
    return out


def get_prefs() -> Dict[str, Any]:
    """Current prefs from the cache, or the behaviour-preserving defaults when
    the cache is cold. Never touches the DB — safe in notify_event's hot path."""
    return _cache if _cache is not None else _default_prefs()


def set_cache(prefs: Dict[str, Any]) -> None:
    global _cache
    _cache = prefs


async def load_prefs(db: AsyncSession) -> Dict[str, Any]:
    """Load prefs from global_settings into the cache, merged over defaults.
    Called at startup and by the GET endpoint. Best-effort: a DB error leaves
    the cache untouched (defaults stay in effect)."""
    global _cache
    try:
        row = (await db.execute(
            select(GlobalSetting).where(GlobalSetting.key == _PREFS_KEY)
        )).scalars().first()
        stored = json.loads(row.value) if row and row.value else {}
    except Exception as exc:
        logger.debug("load_prefs skipped: %r", exc)
        stored = {}
    _cache = _merge(_default_prefs(), stored)
    return _cache


async def save_prefs(db: AsyncSession, partial: Dict[str, Any]) -> Dict[str, Any]:
    """Merge ``partial`` into the current prefs, persist to global_settings,
    refresh the cache, and return the full prefs."""
    current = get_prefs()
    merged = _merge(current, partial)
    row = (await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == _PREFS_KEY)
    )).scalars().first()
    if row is None:
        row = GlobalSetting(key=_PREFS_KEY, value=json.dumps(merged, ensure_ascii=False))
        db.add(row)
    else:
        row.value = json.dumps(merged, ensure_ascii=False)
    await db.commit()
    set_cache(merged)
    return merged


# ── predicates consulted by notify_event ─────────────────────────────────────
def event_enabled(event: str) -> bool:
    return bool(get_prefs().get("events", {}).get(event, True))


def event_sound(event: str) -> bool:
    return bool(get_prefs().get("sound", {}).get(event, True))


def channel_enabled(channel: str) -> bool:
    return bool(get_prefs().get("channels", {}).get(channel, {}).get("enabled", channel == "in_app"))


def priority_allowed(priority: str) -> bool:
    min_pri = get_prefs().get("min_priority", "low")
    return PRIORITY_RANK.get(priority, 0) >= PRIORITY_RANK.get(min_pri, 0)


def status_payload() -> Dict[str, Any]:
    """Shape the GET /preferences response consumes: current prefs + the event
    and channel catalogs for the UI to render."""
    return {
        "prefs": get_prefs(),
        "events": EVENT_CATALOG,
        "channels": CHANNEL_CATALOG,
        "priorities": list(PRIORITY_RANK.keys()),
    }
