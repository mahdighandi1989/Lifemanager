"""مسیریابِ مرکزیِ سیگنال‌های موبایل — «هر داده به جای خودش».

The owner's architectural point: hand-wiring calls and finance one by one does
not scale to «هزار نوع داده». This is the single router every mobile SMS /
notification goes through. It CLASSIFIES the signal into an intent, then ROUTES
it to the domain that owns it — and anything meaningful it cannot place with
confidence falls through to the universal inbox (which has its own AI triage),
so nothing is ever wasted («هرز نره») and nothing floods a domain with noise.

Design so a new type is a ONE-LINE change, not scattered wiring:
  * ``_RULES`` — an ordered list of (name, matcher, router). The first matching
    rule wins. Add a data type → add one tuple.
  * Routers are small async fns that hand off to the EXISTING domain service
    (finance engine, person interactions, inbox capture). The router never
    re-implements a domain — it dispatches.
  * The catch-all router is the inbox: an actionable-but-unclassified signal
    becomes an inbox item and the inbox's own AI triage files it onward. That
    is what makes this extensible without code for every future type.

Noise (OTP / promo / mirror-of-another-wire) is recognised and DROPPED from
routing — it still lives in the activity log (complete record + Drive archive +
aggregate insights), just never clutters a domain or the inbox.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Callable, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# اپ‌هایی که آینهٔ سیم‌کشیِ دیگر (Gmail/Calendar/Drive) کاملشان را می‌خواند —
# مسیریابی‌شان دوباره‌کاری و دوبله‌شماری است.
_MIRRORED_APPS = (
    "com.google.android.gm", "com.google.android.calendar",
    "com.google.android.apps.docs", "com.google.android.apps.drive",
)

# ── حلقهٔ بازخوردِ خودمان (۲۰۲۶-۰۸-۰۲) ──────────────────────────────────────
#
# ربطِ خودِ لایف‌منیجر در تلگرام پیام می‌فرستد → تلگرامِ گوشی اعلان می‌دهد →
# شنوندهٔ اعلان همان را می‌گیرد → مسیریاب آن را «پیامِ تازه» می‌بیند → صندوق
# ورودی → و برنامه از مالک می‌پرسد **پیامِ خودش را کجا ثبت کند**. مالک این
# را روی میز فرمان دید و حق داشت که مسخره‌اش کند.
#
# چرا کلِ تلگرام را «آینه» نمی‌کنیم: پیامِ آدم‌های واقعی در تلگرام ارزشمند
# است و باید مسیریابی شود. فقط پیامِ **خودِ ربات** باید بیفتد بیرون، و آن را
# از دو راه می‌شناسیم: نامِ ربات (از تنظیمات) و امضاهای متنیِ خودِ فرم‌ها.
_SELF_TEXT_MARKERS = (
    "همین پیام را",          # «…را ریپلای کن و خط‌ها را پر کن»
    "یک ابهام دارم",
    "یادآوری — هنوز جواب نگرفتم",
    "سؤال‌های باز",
    "این مسیر با الگوهای همیشگی‌ات نمی‌خواند",
    "پروفایل: ",
)


def _self_bot_names() -> tuple:
    """نام‌هایی که اعلانِ آمده از آن‌ها، پژواکِ خودِ ماست."""
    import os

    names = []
    for key in ("TELEGRAM_BOT_USERNAME", "TELEGRAM_BOT_NAME"):
        val = (os.environ.get(key) or "").strip().lstrip("@")
        if val:
            names.append(val.lower())
    # پیش‌فرضِ منطقی حتی وقتی متغیر تنظیم نشده باشد
    names += ["lifemanager_bot", "lifemanager"]
    return tuple(dict.fromkeys(names))


def is_own_echo(app: str, sender: str, text: str) -> bool:
    """آیا این اعلان، پیامِ خودِ برنامه است که از تلگرام برگشته؟

    هرگز نباید سؤال بسازد: مالک قبلاً آن را در تلگرام خوانده و پاسخش هم
    همان‌جاست.
    """
    pkg = (app or "").lower()
    if not pkg.startswith("org.telegram"):
        return False
    who = (sender or "").lower()
    if any(name in who for name in _self_bot_names()):
        return True
    body = text or ""
    return any(marker in body for marker in _SELF_TEXT_MARKERS)

_OTP_RE = re.compile(r"(?i)(otp|رمز\s*(یکبار|پویا)|verification\s*code|کد\s*تایید|کد\s*ورود|one[-\s]?time)")
_PROMO_RE = re.compile(r"(?i)(off\b|discount|تخفیف|جشنواره|اقساطی|فروش\s*ویژه|unsubscribe|promo)")
# قرار/رویداد زمان‌دار → شایستهٔ تقویم/صندوق.
_APPT_RE = re.compile(
    r"(?i)(appointment|meeting|reminder|قرار|جلسه|ملاقات|نوبت|رزرو|وقت\s*(دکتر|پزشک)|"
    r"\bفردا\b|\bامروز ساعت\b|ساعت\s*\d{1,2}[:٫]?\d{0,2}|\d{1,2}[:٫]\d{2})"
)
# کارِ خواسته‌شده → شایستهٔ صندوق (تریاژِ AI به تسک/todo فایلش می‌کند).
_TASK_RE = re.compile(
    r"(?i)(please\s+\w+|submit|renew|deadline|due\s+(date|by)|pay\s+the|"
    r"لطفا\b|لطفاً\b|یادت\s*باشه|فراموش\s*نکن|باید\b|مهلت|سررسید|پرداخت\s*کن|تمدید)"
)
_FIN_HINT = None  # lazy from finance service


def _fin_hint():
    global _FIN_HINT
    if _FIN_HINT is None:
        from app.services.finance_email_scan_service import _FIN_HINT as f
        _FIN_HINT = f
    return _FIN_HINT


# ── person matching (a message from a known contact → their profile) ────────

def _digits_tail(value: str, n: int = 7) -> str:
    d = re.sub(r"\D", "", value or "")
    return d[-n:] if len(d) >= n else d


async def _match_person(db: AsyncSession, sender: str, text: str = "", user_id: int = 0):
    """The Person this signal is about — by phone tail (calls/SMS) OR by name.

    Name matching matters more than it looks: a messenger notification's title
    IS the contact's name, and a calendar event says «جلسه با علی». Without it
    those signals would never reach anyone's profile. Guarded against false
    positives: names shorter than 3 chars are ignored, and the longest match
    wins so «علی» doesn't steal a signal that names «علی‌رضا»."""
    try:
        from app.models.person import Person
        from app.services.inbox_service import scope_filter

        # بدونِ این فیلتر، سیگنالِ یک کاربر روی پروفایلِ فردِ کاربرِ دیگر
        # می‌نشست (ممیزی ۲۰۲۶-۰۷-۳۱).
        people = (
            await db.execute(select(Person).where(scope_filter(Person.user_id, user_id)))
        ).scalars().all()
    except Exception:
        return None

    tail = _digits_tail(sender)
    if len(tail) >= 5:
        for p in people:
            if p.phone and tail == _digits_tail(p.phone):
                return p

    haystack = f"{sender or ''}\n{(text or '')[:300]}"
    best = None
    for p in people:
        name = (p.name or "").strip()
        # مرزِ واژه لازم است: «علی» نباید داخلِ «تعالی» یا نامِ یک برند گیر کند.
        if len(name) < 3 or not re.search(rf"(?<!\w){re.escape(name)}(?!\w)", haystack):
            continue
        if best is None or len(name) > len((best.name or "")):
            best = p
    return best


# ── classification ──────────────────────────────────────────────────────────

def classify_signal(
    sender: str, text: str, *, app: str = "", category_hint: Optional[str] = None
) -> str:
    """One intent label for a mobile signal. Order matters (first hit wins):
    mirrored → otp → finance → promo → appointment → task → message.
    ``message`` is the neutral default (chatter/notification with no action).

    This is the DETERMINISTIC floor: it always works, needs no model, and its
    noise verdicts (mirrored/otp) are authoritative — the model is never asked
    about those. :func:`classify_signal_smart` layers the model on top.

    ``app`` is the package name (notifications only). It used to arrive folded
    into ``sender``; now that ``sender`` carries the *human* sender, mirror
    detection reads the package explicitly.

    ``category_hint`` is what the notification's own app declared it to be
    (Notification.CATEGORY_*). It is the most authoritative non-money signal
    there is — the app knows whether it just sent a promo — so it wins over
    the keyword guesses, but never over an OTP or a hard money match."""
    blob = f"{sender}\n{text}"
    probe = f"{app or ''} {sender or ''}".strip()
    if any(probe.startswith(p) or (app or "").startswith(p) for p in _MIRRORED_APPS):
        return "mirrored"
    # پژواکِ خودِ برنامه از تلگرام — پیش از هر چیزِ دیگر، چون هیچ‌وقت سؤال ندارد.
    if is_own_echo(app or "", sender or "", text or ""):
        return "mirrored"
    if _OTP_RE.search(text):
        return "otp"
    if _fin_hint().search(blob):
        return "finance"
    if category_hint:
        return category_hint
    if _PROMO_RE.search(text):
        return "promo"
    if _APPT_RE.search(text):
        return "appointment"
    if _TASK_RE.search(text):
        return "task"
    return "message"


# ── model-backed classification ─────────────────────────────────────────────
# The heuristic above is coarse by construction: it cannot tell «قرار با دکتر»
# from «قرار بود بگم»، nor spot a type nobody wrote a keyword for. So the model
# decides — but under strict guardrails, because a phone emits hundreds of
# signals a day:
#   1. Deterministic noise (mirrored app / OTP) NEVER reaches the model.
#   2. Identical texts are answered from a small in-process cache.
#   3. An hourly cap bounds quota burn; over the cap → heuristic.
#   4. Any failure (no key, timeout, bad JSON) → heuristic. Keyless deploys
#      behave exactly as before.
_AI_CACHE: Dict[str, str] = {}
_AI_CACHE_MAX = 500
_ai_calls: List[float] = []  # timestamps of model classifications this hour


def _ai_hourly_cap() -> int:
    import os

    try:
        return int(os.getenv("MOBILE_AI_CLASSIFY_PER_HOUR", "120"))
    except Exception:
        return 120


def _cache_key(sender: str, text: str) -> str:
    import hashlib

    return hashlib.sha1(f"{sender}|{text[:400]}".encode("utf-8")).hexdigest()[:20]


def _under_cap() -> bool:
    import time

    now = time.time()
    _ai_calls[:] = [t for t in _ai_calls if now - t < 3600]
    return len(_ai_calls) < _ai_hourly_cap()


# دسته‌های پایه + مقصدهای زندهٔ صندوق (از رجیستریِ فایل‌کننده‌ها). پس اگر
# فردا بخش/فایل‌کنندهٔ تازه‌ای اضافه شود، همین‌جا خودبه‌خود قابل انتخاب می‌شود.
_BASE_CATEGORY_HELP = {
    "finance": "پیام دربارهٔ حساب/موجودی/تراکنشِ خودِ کاربر",
    "appointment": "قرار/نوبت/جلسه با زمان",
    "task": "کاری که باید انجام شود",
    "promo": "تبلیغ/فروش/خبرنامه",
    "message": "گفتگو یا اطلاع‌رسانیِ بدون اقدام",
}


def _category_help() -> Dict[str, str]:
    """دسته‌های مجاز = پایه + هر مقصدی که صندوق ورودی امروز می‌شناسد."""
    help_map = dict(_BASE_CATEGORY_HELP)
    try:
        from app.services.inbox_service import INBOX_TARGETS, TARGET_FA

        for key in INBOX_TARGETS:
            if key in ("task",):  # already a base category
                continue
            help_map.setdefault(key, TARGET_FA.get(key, key))
    except Exception:
        pass
    return help_map


_SIGNAL_PROMPT = """تو مسیریابِ سیگنال‌های ورودیِ یک برنامهٔ مدیریت زندگی هستی.
یک پیام (پیامک یا اعلانِ گوشی) را می‌خوانی و می‌گویی به کدام دسته تعلق دارد.
فقط یک شیء JSON برگردان، بدون توضیح اضافه:

{{"category": "یکی از کلیدهای زیر", "confidence": 0.0, "reason": "یک جمله فارسی"}}

دسته‌های مجاز:
{categories}

قواعد:
- «finance» فقط وقتی پیام دربارهٔ حساب/موجودی/تراکنشِ خودِ کاربر است.
- «appointment» = قرار/نوبت/جلسه با زمان مشخص یا قابل‌استنتاج.
- «task» = کاری که از کاربر خواسته شده یا باید انجام دهد (پرداخت، تمدید، ارسال…).
- «promo» = تبلیغ/فروش/خبرنامه. «message» = گفتگو یا اطلاع‌رسانیِ بدون اقدام.
- اگر مطمئن نیستی، confidence را پایین بده؛ حدس بی‌پایه نزن.

فرستنده: {sender}
متن:
{text}
"""


async def classify_signal_smart(
    db, sender: str, text: str, *, app: str = "", category_hint: Optional[str] = None
) -> Tuple[str, Optional[float], Optional[str]]:
    """(category, confidence, model) — the model's verdict when it is available
    and allowed, else the deterministic one (confidence None)."""
    base = classify_signal(sender, text, app=app, category_hint=category_hint)
    # Noise verdicts are certain and cheap — never spend a model call on them.
    # ``system`` and a self-declared ``promo`` come from the app itself, so
    # asking a model to second-guess them is pure waste.
    if base in ("mirrored", "otp", "system"):
        return base, None, None
    if category_hint and base == category_hint and category_hint in ("promo", "system"):
        return base, None, None

    key = _cache_key(sender, text)
    cached = _AI_CACHE.get(key)
    if cached:
        return cached, None, "cache"
    if not _under_cap():
        return base, None, None

    try:
        import time

        from app.services.ai.inference_gateway import complete

        help_map = _category_help()
        categories = "\n".join(f"- {c}: {d}" for c, d in help_map.items())
        prompt = _SIGNAL_PROMPT.format(
            categories=categories, sender=(sender or "")[:120], text=(text or "")[:1500]
        )
        _ai_calls.append(time.time())
        res = await complete(db, prompt, task="inbox_triage", max_tokens=200)
        if not res.get("ok"):
            return base, None, None
        obj = _parse_json_object(res.get("text") or "")
        if not obj:
            return base, None, None
        category = str(obj.get("category") or "").strip().lower()
        if category not in help_map:
            return base, None, None
        try:
            confidence = float(obj.get("confidence"))
        except Exception:
            confidence = None
        # A hesitant model must not overrule a confident regex: when the
        # deterministic path found finance (a hard money signal) and the model
        # is unsure, keep the deterministic verdict.
        if confidence is not None and confidence < 0.5 and base != "message":
            return base, confidence, res.get("model")
        if len(_AI_CACHE) >= _AI_CACHE_MAX:
            _AI_CACHE.clear()
        _AI_CACHE[key] = category
        return category, confidence, res.get("model")
    except Exception as exc:
        logger.debug("smart classify fell back: %r", exc)
        return base, None, None


def _parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    import json

    cleaned = re.sub(r"```(?:json)?", "", text or "").strip()
    decoder = json.JSONDecoder()
    for start in range(len(cleaned)):
        if cleaned[start] != "{":
            continue
        try:
            obj, _ = decoder.raw_decode(cleaned[start:])
        except ValueError:
            continue
        if isinstance(obj, dict):
            return obj
    return None


# ── inbox capture (the extensible catch-all) ────────────────────────────────

async def _capture_to_inbox(
    db: AsyncSession, user_id: int, *, content: str, source: str, source_ref: str,
) -> Optional[int]:
    """Create an inbox item (deduped on source_ref) and run the inbox's own AI
    triage so it is filed onward (task/todo/calendar/note/…). Returns the item
    id, or None when it was a duplicate. The inbox is where any type we don't
    hard-route lands — that is the «به جای خودش می‌رود» guarantee."""
    from app.models.inbox_item import InboxItem
    from app.services import inbox_service

    # dedup: the inbox stores source_ref inside suggestion JSON.
    recent = (
        await db.execute(
            select(InboxItem).order_by(InboxItem.id.desc()).limit(400)
        )
    ).scalars().all()
    for r in recent:
        if (r.suggestion or {}).get("source_ref") == source_ref:
            return None

    item = InboxItem(
        user_id=user_id, content=content[:4000], source=source[:32], status="pending",
    )
    db.add(item)
    await db.flush()
    try:
        item = await inbox_service.apply_classification(db, item, user_id=user_id)
    except Exception:
        pass
    # stamp source_ref so a re-sent signal is recognised.
    sug = dict(item.suggestion or {})
    sug["source_ref"] = source_ref
    item.suggestion = sug
    await db.commit()
    return item.id


async def _route_finance(db, user_id, sender, text, occurred_at, device, ref) -> Dict[str, Any]:
    from app.services.finance_ingest_service import apply_bank_message

    # occurred_at را جلو می‌بریم تا قاعدهٔ «فقط سیگنالِ جدیدتر از عددِ دستیِ
    # مالک می‌تواند حرکتش دهد» بتواند تاریخ‌ها را مقایسه کند.
    res = await apply_bank_message(
        db, user_id=user_id, channel="sms", body=text, sender=sender,
        occurred_iso=occurred_at,
    )
    return {"routed_to": "finance", "finance": res}


async def _route_person_message(
    db, user_id, sender, text, occurred_at, device, ref, interaction_type: str = "message",
) -> Dict[str, Any]:
    """A signal from/about a KNOWN contact → an interaction on their profile,
    so the relationship reflects real contact (message for chat, meeting for a
    calendar event)."""
    person = await _match_person(db, sender, text, user_id=user_id)
    routed = None
    if person is not None:
        try:
            from datetime import datetime as _dt

            from app.services import person_profile_service as pps

            when = None
            if occurred_at:
                try:
                    when = _dt.fromisoformat(occurred_at.replace("Z", "+00:00"))
                except Exception:
                    when = None
            await pps.record_interaction(
                db, person_id=person.id, type=interaction_type,
                summary=(text or "")[:120], date=when, dedup_note=ref, reanalyze=False,
            )
            await db.commit()
            routed = "person"
        except Exception as exc:
            logger.debug("person message route skipped: %r", exc)
    return {
        "routed_to": routed,
        "person_id": (person.id if person else None),
        # نامِ فرد برمی‌گردد تا ستونِ لاگ بتواند «چه کسی» را آدم‌فهم بنویسد،
        # نه فقط یک شماره.
        "person_name": (person.name if person else None),
    }


async def _route_inbox(db, user_id, sender, text, occurred_at, device, ref) -> Dict[str, Any]:
    item_id = await _capture_to_inbox(
        db, user_id, content=f"{sender}: {text}" if sender else text,
        source="mobile", source_ref=ref,
    )
    return {"routed_to": ("inbox" if item_id else "inbox_dup"), "inbox_item_id": item_id}


# ── asking instead of guessing ───────────────────────────────────────────────
# «ارتباط دوطرفه» (۲۰۲۶-۰۷-۳۱): هر جای این خط لوله که شک دارد، به‌جای ثبتِ
# یک حدس، می‌تواند بپرسد. یک تابع، پس افزودنِ نقطهٔ پرسشِ تازه یک خط است.

def _short_topic(sender: str, text: str) -> str:
    head = re.sub(r"\s+", " ", (text or "")).strip()[:70]
    who = re.sub(r"\s+", " ", (sender or "")).strip()[:40]
    return f"{who}: {head}" if who else head or "یک پیامِ ورودی"


async def _ask_about(db, user_id, *, topic, text, source, source_ref, target, hint=None) -> None:
    try:
        from app.services import clarification_service as clar

        await clar.ask(
            db, topic=topic, context=(text or "")[:1500], source=source,
            source_ref=f"ask:{source_ref}"[:191], target=target, hint=hint,
            user_id=user_id,
        )
        await db.commit()
    except Exception as exc:
        logger.debug("clarification ask skipped: %r", exc)


# ── the registry: (category → router). First matching category wins. ─────────
# Adding a new routed type = add a classifier branch above + a line here.
_ROUTERS: Dict[str, Callable] = {
    "finance": _route_finance,
    "appointment": _route_inbox,
    "task": _route_inbox,
}
# Categories that are pure noise for ROUTING (still logged/archived/aggregated):
# ``system`` = ongoing/service notifications (music player, download, battery)
# that the app itself declared — recorded, never routed.
_NOISE = {"mirrored", "otp", "promo", "system"}


async def dispatch_signal(
    db: AsyncSession,
    user_id: int,
    *,
    source: str,          # "sms" | "notification" | "calendar" | "telegram" | …
    sender: str,          # phone number, or the resolved HUMAN sender of a notification
    text: str,
    occurred_at: Optional[str],
    device: Optional[str],
    source_ref: str,
    skip_categories: Tuple[str, ...] = (),
    interaction_type: str = "message",
    app: str = "",                          # package name (notifications)
    category_hint: Optional[str] = None,    # what the source itself declared
) -> Dict[str, Any]:
    """Classify one mobile signal and route it to the domain that owns it.

    Returns ``{category, routed_to, ...}``. NEVER raises — a routing failure
    must not drop the underlying capture (the caller still writes the activity
    log). ``routed_to`` is None when the signal is noise or neutral chatter
    (kept only in the activity log + insights + archive)."""
    try:
        # مدل تصمیم می‌گیرد (با گاردریل‌ها)؛ اگر مدل نبود/مطمئن نبود، قاعدهٔ
        # قطعی جواب می‌دهد — پس روی دیپلویِ بدون کلید هم دقیقاً کار می‌کند.
        category, confidence, model = await classify_signal_smart(
            db, sender, text, app=app, category_hint=category_hint
        )
        out: Dict[str, Any] = {
            "category": category, "routed_to": None,
            "confidence": confidence, "classifier": (model or "rules"),
        }
        if category in _NOISE:
            return out

        # A signal about a known contact ALWAYS feeds their profile first —
        # even when the domain routing below is skipped (a calendar «جلسه با
        # علی» must still reach علی, while the event itself stays in the
        # calendar and is not copied into the inbox).
        if category in ("message", "appointment", "task"):
            pm = await _route_person_message(
                db, user_id, sender, text, occurred_at, device, source_ref,
                interaction_type=interaction_type,
            )
            if pm.get("routed_to"):
                out.update(pm)

        # ``skip_categories`` = «این دسته را خودِ همین دامنه دارد» — مثلاً یک
        # رویدادِ تقویم خودش «قرار» است و نباید دوباره در صندوق کپی شود.
        if category in skip_categories:
            return out

        # مسیر: یا رجیستریِ اختصاصی، یا — برای هر مقصدِ شناخته‌شدهٔ صندوق —
        # خودِ صندوق (که فایل‌کنندهٔ همان مقصد را دارد). این همان چیزی است که
        # بخش‌های آیندهٔ برنامه را بدون کدنویسی قابل مسیریابی می‌کند.
        router = _ROUTERS.get(category)
        if router is None and category not in ("message", "promo"):
            try:
                from app.services.inbox_service import INBOX_TARGETS

                if category in INBOX_TARGETS:
                    router = _route_inbox
            except Exception:
                router = None
        if router is not None:
            res = await router(db, user_id, sender, text, occurred_at, device, source_ref)
            # finance/inbox routing wins the reported routed_to when present.
            if res.get("routed_to"):
                out["routed_to"] = res["routed_to"]
            out.update({k: v for k, v in res.items() if k != "routed_to"})

            # مسیر گرفت، ولی مدل مطمئن نبود → به‌جای اینکه یک حدس بی‌سروصدا
            # ثبت شود، همان‌جا می‌پرسیم. مقصدِ فعلی دست‌نخورده می‌ماند (چیزی
            # گم نمی‌شود) و جوابِ مالک بعداً اصلاحش می‌کند.
            if (
                confidence is not None and confidence < 0.55
                and out.get("inbox_item_id")
            ):
                await _ask_about(
                    db, user_id, topic=_short_topic(sender, text), text=text,
                    source=source, source_ref=source_ref,
                    target={"kind": "inbox_item", "id": out["inbox_item_id"]},
                    hint=f"موتور این را «{category}» تشخیص داد ولی مطمئن نیست "
                         f"(اطمینان {confidence:.0%}).",
                )
        return out
    except Exception as exc:  # observer-safe
        logger.debug("mobile dispatch skipped: %r", exc)
        return {"category": "error", "routed_to": None}
