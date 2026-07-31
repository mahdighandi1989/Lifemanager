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


async def _match_person(db: AsyncSession, sender: str):
    """A Person whose phone tail matches the sender (calls/SMS carry a number).
    None when the sender isn't a digits string or matches nobody."""
    tail = _digits_tail(sender)
    if len(tail) < 5:
        return None
    try:
        from app.models.person import Person

        people = (await db.execute(select(Person).where(Person.phone.isnot(None)))).scalars().all()
        for p in people:
            if tail == _digits_tail(p.phone):
                return p
    except Exception:
        return None
    return None


# ── classification ──────────────────────────────────────────────────────────

def classify_signal(sender: str, text: str) -> str:
    """One intent label for a mobile signal. Order matters (first hit wins):
    mirrored → otp → promo → finance → appointment → task → message.
    ``message`` is the neutral default (chatter/notification with no action)."""
    blob = f"{sender}\n{text}"
    if any((sender or "").startswith(p) for p in _MIRRORED_APPS):
        return "mirrored"
    if _OTP_RE.search(text):
        return "otp"
    if _fin_hint().search(blob):
        return "finance"
    if _PROMO_RE.search(text):
        return "promo"
    if _APPT_RE.search(text):
        return "appointment"
    if _TASK_RE.search(text):
        return "task"
    return "message"


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

    res = await apply_bank_message(db, user_id=user_id, channel="sms", body=text, sender=sender)
    return {"routed_to": "finance", "finance": res}


async def _route_person_message(db, user_id, sender, text, occurred_at, device, ref) -> Dict[str, Any]:
    """A message from a KNOWN contact → a MESSAGE interaction on their profile,
    so the relationship reflects real contact — and, if it also looks
    actionable, a copy into the inbox."""
    person = await _match_person(db, sender)
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
                db, person_id=person.id, type="message",
                summary=(text or "")[:120], date=when, dedup_note=ref, reanalyze=False,
            )
            await db.commit()
            routed = "person"
        except Exception as exc:
            logger.debug("person message route skipped: %r", exc)
    return {"routed_to": routed, "person_id": (person.id if person else None)}


async def _route_inbox(db, user_id, sender, text, occurred_at, device, ref) -> Dict[str, Any]:
    item_id = await _capture_to_inbox(
        db, user_id, content=f"{sender}: {text}" if sender else text,
        source="mobile", source_ref=ref,
    )
    return {"routed_to": ("inbox" if item_id else "inbox_dup"), "inbox_item_id": item_id}


# ── the registry: (category → router). First matching category wins. ─────────
# Adding a new routed type = add a classifier branch above + a line here.
_ROUTERS: Dict[str, Callable] = {
    "finance": _route_finance,
    "appointment": _route_inbox,
    "task": _route_inbox,
}
# Categories that are pure noise for ROUTING (still logged/archived/aggregated):
_NOISE = {"mirrored", "otp", "promo"}


async def dispatch_signal(
    db: AsyncSession,
    user_id: int,
    *,
    source: str,          # "sms" | "notification"
    sender: str,          # phone number or app package / title
    text: str,
    occurred_at: Optional[str],
    device: Optional[str],
    source_ref: str,
) -> Dict[str, Any]:
    """Classify one mobile signal and route it to the domain that owns it.

    Returns ``{category, routed_to, ...}``. NEVER raises — a routing failure
    must not drop the underlying capture (the caller still writes the activity
    log). ``routed_to`` is None when the signal is noise or neutral chatter
    (kept only in the activity log + insights + archive)."""
    try:
        category = classify_signal(sender, text)
        out: Dict[str, Any] = {"category": category, "routed_to": None}
        if category in _NOISE:
            return out

        # A message from a known contact always feeds their profile first…
        if category in ("message", "appointment", "task"):
            pm = await _route_person_message(db, user_id, sender, text, occurred_at, device, source_ref)
            if pm.get("routed_to"):
                out.update(pm)

        router = _ROUTERS.get(category)
        if router is not None:
            res = await router(db, user_id, sender, text, occurred_at, device, source_ref)
            # finance/inbox routing wins the reported routed_to when present.
            if res.get("routed_to"):
                out["routed_to"] = res["routed_to"]
            out.update({k: v for k, v in res.items() if k != "routed_to"})
        return out
    except Exception as exc:  # observer-safe
        logger.debug("mobile dispatch skipped: %r", exc)
        return {"category": "error", "routed_to": None}
