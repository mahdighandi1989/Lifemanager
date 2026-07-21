"""Auto-feed the People CRM from Gmail (audit «کمتر ولی زنده»).

The owner's vision for «پروفایل افراد»: analyse each person from the data that
accrues over time and keep a relationship score — without manual bookkeeping.
The CRM (model + scorer + UI) was already built, but the ``interactions`` table
had NO producer, so the relationship score was permanently 0. This module is
that producer:

  * For an email whose sender matches an EXISTING Person → record an email
    ``Interaction`` (deduped per Gmail message) and refresh the deterministic
    relationship score. This is AUTOMATIC (no tick): the person is already
    confirmed, so there is nothing to review — exactly the "feed itself"
    behaviour the owner asked for.
  * For a repeated HUMAN sender who is NOT yet a Person → queue a review
    candidate in the inbox (``suggested_type="person"``), filed with one tap
    via the existing ``inbox_service._file_as_person``. Kept as review (not
    automatic) because most senders are ``noreply@``/marketing and
    auto-creating people would fill the CRM with junk.

Opt-in (``auto_ingest_people`` flag, default ON), precise, idempotent,
fail-open — never breaks the email-sync loop it rides in.
"""
from __future__ import annotations

import logging
import re
from typing import List, Optional, Set

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_FLAG_KEY = "auto_ingest_people"
_MIN_SENDER_COUNT = 2  # a human who has written at least twice is worth adding

# senders that are never a "person": automated / marketing / system addresses.
_RE_NONHUMAN = re.compile(
    r"(no[-_.]?reply|do[-_.]?not[-_.]?reply|noreply|notifications?@|mailer-daemon|"
    r"postmaster@|bounce|@.*\.(?:mailchimp|sendgrid|amazonses|mailgun)|"
    r"newsletter|marketing@|support@|billing@|receipts?@|updates?@|team@|hello@)",
    re.I,
)
_RE_ADDR = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _sender_addr(email) -> Optional[str]:
    m = _RE_ADDR.search(email.from_addr or "")
    return m.group(0).lower() if m else None


def _sender_name(email) -> str:
    raw = (email.from_addr or "").strip()
    # "Ali Rezaei <ali@x.com>" → "Ali Rezaei"; bare address → local-part.
    m = re.match(r'\s*"?([^"<]+?)"?\s*<', raw)
    if m and m.group(1).strip():
        return m.group(1).strip()[:120]
    addr = _sender_addr(email)
    return (addr.split("@")[0] if addr else "شخص")[:120]


def _is_human(email) -> bool:
    addr = _sender_addr(email)
    if not addr:
        return False
    return not _RE_NONHUMAN.search(email.from_addr or "")


async def is_enabled(db: AsyncSession) -> bool:
    try:
        from app.models.global_setting import GlobalSetting

        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _FLAG_KEY))
        ).scalar_one_or_none()
        if row is None or row.value is None:
            return True
        return str(row.value).strip() not in ("0", "false", "off", '"0"')
    except Exception:
        return True


async def set_enabled(db: AsyncSession, enabled: bool) -> bool:
    from app.models.global_setting import GlobalSetting

    value = "1" if enabled else "0"
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _FLAG_KEY))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=_FLAG_KEY, value=value))
    else:
        row.value = value
    await db.commit()
    return enabled


async def _find_person_id(db: AsyncSession, addr: str, user_id: int) -> Optional[int]:
    from app.models.person import Person

    row = (
        await db.execute(
            select(Person.id).where(_scope(Person.user_id, user_id), func.lower(Person.email) == addr)
        )
    ).first()
    return row[0] if row else None


async def record_email_interaction(db: AsyncSession, email, *, user_id: int = 0) -> Optional[int]:
    """If the sender is a known Person, add an email Interaction (deduped by
    Gmail message id in ``notes``). Returns the person_id (for a later batch
    re-score) or None. Does NOT re-score inline — the caller batches that to
    avoid a re-analyze per email. Never raises."""
    try:
        if not await is_enabled(db):
            return None
        addr = _sender_addr(email)
        if not addr or not _is_human(email):
            return None
        pid = await _find_person_id(db, addr, user_id)
        if pid is None:
            return None
        from app.services import person_profile_service as pps

        created = await pps.record_interaction(
            db,
            person_id=pid,
            type="email",
            summary=(email.subject or "ایمیل")[:512],
            date=getattr(email, "received_at", None),
            reanalyze=False,
            dedup_note=f"gmail:{email.id}",
        )
        return pid if created is not None else None
    except Exception as exc:
        logger.debug("person interaction skipped (%s): %r", getattr(email, "id", "?"), exc)
        return None


async def route_person_email(db: AsyncSession, email, *, user_id: int = 0) -> bool:
    """Queue a review candidate for a repeated human sender who isn't a Person
    yet. Precise + idempotent + opt-in. Returns True when queued. Never raises."""
    try:
        if not await is_enabled(db):
            return False
        addr = _sender_addr(email)
        if not addr or not _is_human(email):
            return False
        if await _find_person_id(db, addr, user_id) is not None:
            return False  # already a Person → the interaction path handles it

        from app.models.inbox_item import InboxItem
        from app.models.personal_sync import PersonalEmail

        # already a pending person candidate for this address?
        pending = (
            (
                await db.execute(
                    select(InboxItem).where(
                        InboxItem.status == "pending", InboxItem.suggested_type == "person"
                    )
                )
            )
            .scalars()
            .all()
        )
        for row in pending:
            if (row.suggestion or {}).get("email", "").lower() == addr:
                return False

        # repeated sender only (a one-off is likely noise)
        count = (
            await db.execute(
                select(func.count()).select_from(PersonalEmail).where(
                    func.lower(PersonalEmail.from_addr).like(f"%{addr}%")
                )
            )
        ).scalar() or 0
        if count < _MIN_SENDER_COUNT:
            return False

        name = _sender_name(email)
        candidate = InboxItem(
            user_id=user_id,
            content=f"فردِ جدید از ایمیل: {name} <{addr}>",
            source="gmail",
            status="pending",
            suggested_type="person",
            suggestion={
                "person_name": name,
                "email": addr,
                "reason": f"{count} ایمیل از این شخص دیدم — تأیید کن تا به «افراد» اضافه شود و رابطه‌ات ثبت گردد.",
            },
            ai_model=None,
        )
        db.add(candidate)
        return True
    except Exception as exc:
        logger.debug("person candidate skipped (%s): %r", getattr(email, "id", "?"), exc)
        return False


async def rescore_people(db: AsyncSession, person_ids: Set[int]) -> None:
    """Refresh the deterministic relationship score once per affected person
    after a triage batch (interactions were added with reanalyze=False)."""
    if not person_ids:
        return
    from app.services import person_profile_service as pps

    for pid in person_ids:
        try:
            await pps.analyze_person(db, person_id=pid)
        except Exception as exc:
            logger.debug("rescore person %s skipped: %r", pid, exc)
