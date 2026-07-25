"""PersonProfile service (audit task 3cc09436).

CRUD + AI analysis for a person's behavioural profile. ``analyze_person``
reuses ``AIService.analyze_person_behavior`` (the relationship scorer) over the
person's interaction history, then persists the score / relationship_type and
appends an analysis snapshot to the behaviour log.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interaction import Interaction
from app.models.person_profile import PersonProfile

logger = logging.getLogger(__name__)

# Persian labels for the relationship buckets. The backend owns them now so the
# map, the list and the profile page can never drift apart (they did: the
# profile page rendered the raw English key).
REL_FA = {
    "close": "نزدیک",
    "regular": "معمولی",
    "distant": "دور",
    "strained": "پرتنش",
    "neutral": "خنثی",
}
# What the owner may set by hand («نوع رابطه تعیین بشه»).
REL_CHOICES = tuple(REL_FA.keys())


def build_ledger(profile: PersonProfile) -> dict:
    """دفترِ ماندگار — the all-time, undecayed record of this person.

    Kept next to ``ai_score`` (which decays on purpose) so a recent kindness
    can never quietly erase a long history, and a long-ago kindness is never
    lost either: «همه چیز ثبت بشه که فراموشی اتفاق نیفته».
    """
    from app.services.ai.person_behavior import ledger_from_deeds

    deeds = [e for e in (profile.behavior_log or []) if e.get("valence") is not None]
    return ledger_from_deeds(deeds)


def effective_relationship(profile: PersonProfile) -> str:
    """The relationship in force: the owner's own verdict when he gave one,
    otherwise the computed bucket (stored-wins, as with sahat)."""
    return (getattr(profile, "relationship_override", None) or profile.relationship_type
            or "neutral")


async def set_relationship(
    db: AsyncSession, *, person_id: int, relationship: Optional[str]
) -> PersonProfile:
    """Record the owner's own verdict on the relationship, or clear it (None)
    to hand the call back to the scorer. Never touches the deed log."""
    profile = await get_or_create_profile(db, person_id=person_id)
    value = (relationship or "").strip() or None
    if value is not None and value not in REL_CHOICES:
        raise ValueError(f"unknown relationship: {value}")
    profile.relationship_override = value
    log = list(profile.behavior_log or [])
    log.append({
        "type": "relationship_set",
        "note": (f"نوع رابطه را «{REL_FA.get(value, value)}» گذاشتی"
                 if value else "تعیینِ نوع رابطه را به سیستم واگذار کردی"),
        "relationship": value,
        "at": datetime.now(timezone.utc).isoformat(),
    })
    profile.behavior_log = log[-100:]
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_or_create_profile(db: AsyncSession, *, person_id: int) -> PersonProfile:
    row = (
        await db.execute(
            select(PersonProfile).where(PersonProfile.person_id == person_id)
        )
    ).scalar_one_or_none()
    if row is None:
        row = PersonProfile(person_id=person_id)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


def _recompute_from_log(profile: PersonProfile) -> None:
    """Recompute ai_score + relationship_type from the deed/note log
    (good/bad valence + time decay — Step 5). Mutates the profile in place."""
    from app.services.ai.person_behavior import score_from_deeds

    deeds = [e for e in (profile.behavior_log or []) if e.get("valence") is not None]
    if deeds:
        scored = score_from_deeds(deeds)
        profile.ai_score = scored["ai_score"]
        profile.relationship_type = scored["relationship_type"]


async def set_note(db: AsyncSession, *, person_id: int, note: str) -> PersonProfile:
    """Persist a user note AND analyze its tone (Step 10 — "از روی لحن").

    The note's sentiment becomes a valenced entry in the behaviour log and feeds
    the relationship score, so an angry/grateful note actually moves the needle.
    """
    from app.services.ai.profile_analysis import analyze_sentiment

    profile = await get_or_create_profile(db, person_id=person_id)
    profile.user_notes = note
    tone = analyze_sentiment(note or "")
    valence = 1 if tone["sentiment_score"] > 0.15 else -1 if tone["sentiment_score"] < -0.15 else 0
    log = list(profile.behavior_log or [])
    log.append({
        "type": "note", "note": note[:300], "tone": tone["dominant_emotion"],
        "sentiment_score": tone["sentiment_score"], "valence": valence,
        "at": datetime.now(timezone.utc).isoformat(),
    })
    profile.behavior_log = log[-100:]
    _recompute_from_log(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def record_deed(
    db: AsyncSession, *, person_id: int, kind: str, note: str = "", important: bool = False
) -> PersonProfile:
    """Record a good/bad deed (Step 4-5 — "کارهای بد و خوبش ثبت بشه") and
    recompute the score. ``kind`` is 'good' | 'bad'; ``important`` flags it for
    the reminders list ("کجا بهم خوبی کرد که فراموش نکنم")."""
    profile = await get_or_create_profile(db, person_id=person_id)
    valence = 1 if kind == "good" else -1 if kind == "bad" else 0
    log = list(profile.behavior_log or [])
    log.append({
        "type": "deed", "kind": kind, "note": note[:300], "valence": valence,
        "important": bool(important), "at": datetime.now(timezone.utc).isoformat(),
    })
    profile.behavior_log = log[-100:]
    _recompute_from_log(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_reminders(db: AsyncSession, *, person_id: int) -> list[dict]:
    """«فراموش نکنم» — the entries the owner flagged, newest first, never
    decayed and never pruned by the score (Step 8)."""
    profile = await get_or_create_profile(db, person_id=person_id)
    flagged = [e for e in (profile.behavior_log or []) if e.get("important")]
    return sorted(flagged, key=lambda e: str(e.get("at") or ""), reverse=True)


async def get_suggestions(db: AsyncSession, *, person_id: int) -> list[str]:
    """Reading the record back, not judging it (Step 9).

    Reads the ALL-TIME ledger — not the decayed score — so «یک کار خوبِ تازه»
    never talks over a long record, in either direction.
    """
    profile = await get_or_create_profile(db, person_id=person_id)
    ledger = build_ledger(profile)
    rel = effective_relationship(profile)
    out: list[str] = []
    if ledger["good"] > ledger["bad"]:
        out.append(
            f"در مجموع {ledger['good']} کار خوب از او ثبت شده — جای قدردانی یا جبران هست."
        )
    if ledger["bad"] > ledger["good"]:
        out.append(
            f"در مجموع {ledger['bad']} مورد منفی ثبت شده — در تعامل بعدی حواست باشد."
        )
    if ledger["good"] and ledger["bad"] and ledger["good"] == ledger["bad"]:
        out.append("کارنامه‌اش سربه‌سر است — نه فراموشش کن، نه یک‌طرفه قضاوت.")
    if ledger["flagged"]:
        out.append(f"{len(ledger['flagged'])} مورد را «یادم بماند» علامت زده‌ای؛ دوره‌شان کن.")
    if rel == "close":
        out.append("رابطه را نزدیک ثبت کرده‌ای؛ برای حفظش وقت بگذار.")
    elif rel in ("distant", "strained"):
        out.append("رابطه کم‌رنگ/پرتنش است؛ اگر برایت مهم است، یک گام ترمیمی بردار.")
    if not out:
        out.append("داده کافی نیست؛ با ثبت کارهای خوب/بد، این صفحه دقیق‌تر می‌شود.")
    return out


async def analyze_person(db: AsyncSession, *, person_id: int, person_name: str = "") -> PersonProfile:
    """Blend the interaction-history score with the deed/note log score and
    persist (AC3). Appends an analysis snapshot to ``behavior_log``."""
    from app.services.ai.model_service import AIService
    from app.services.ai.person_behavior import score_from_deeds

    interactions = (
        await db.execute(select(Interaction).where(Interaction.person_id == person_id))
    ).scalars().all()
    interaction_result = await AIService(db).analyze_person_behavior(person_name, list(interactions))

    profile = await get_or_create_profile(db, person_id=person_id)
    deeds = [e for e in (profile.behavior_log or []) if e.get("valence") is not None]
    if deeds:
        deed_scored = score_from_deeds(deeds)
        # Blend: deeds (good/bad over time) carry the relationship; interactions
        # nudge it. Deeds weighted 0.7 since the memo centres on کارهای خوب/بد.
        profile.ai_score = round(
            0.7 * deed_scored["ai_score"] + 0.3 * float(interaction_result.get("ai_score", 0)), 1
        )
        profile.relationship_type = deed_scored["relationship_type"]
    else:
        profile.ai_score = float(interaction_result.get("ai_score", 0))
        profile.relationship_type = interaction_result.get("relationship_type", "neutral")
    profile.last_analyzed_at = datetime.now(timezone.utc)
    log = list(profile.behavior_log or [])
    log.append({
        "type": "ai_analysis", "note": interaction_result.get("summary", ""),
        "ai_score": profile.ai_score, "relationship_type": profile.relationship_type,
        "at": profile.last_analyzed_at.isoformat(),
    })
    profile.behavior_log = log[-100:]
    await db.commit()
    await db.refresh(profile)
    return profile


async def record_interaction(
    db: AsyncSession,
    *,
    person_id: int,
    type: str = "other",
    summary: Optional[str] = None,
    notes: Optional[str] = None,
    date: Optional[datetime] = None,
    reanalyze: bool = True,
    dedup_note: Optional[str] = None,
) -> Optional[Interaction]:
    """Create an Interaction row for a person and (by default) refresh the
    deterministic relationship score from the now-real history — the bridge
    that finally turns real activity (emails, shared tasks) into scoring input
    (audit «کمتر ولی زنده»: the Interaction table used to have no producer).

    ``dedup_note`` — when given, a prior interaction whose ``notes`` equals it
    (e.g. ``gmail:<id>``) short-circuits, so re-syncing the same email doesn't
    stack duplicate interactions. Returns the row, or None when deduped.
    """
    from app.models.interaction import InteractionType

    if dedup_note:
        seen = (
            await db.execute(
                select(Interaction.id).where(
                    Interaction.person_id == person_id, Interaction.notes == dedup_note
                )
            )
        ).first()
        if seen:
            return None
    try:
        itype = type if isinstance(type, InteractionType) else InteractionType(str(type))
    except ValueError:
        itype = InteractionType.OTHER
    inter = Interaction(
        person_id=person_id,
        type=itype,
        date=date or datetime.now(timezone.utc),
        summary=(summary or "")[:512] or None,
        notes=dedup_note or notes,
    )
    db.add(inter)
    await db.flush()
    if reanalyze:
        await analyze_person(db, person_id=person_id)
    return inter


async def record_task_link_interactions(
    db: AsyncSession, *, task_id: int, task_title: Optional[str], person_ids: List[int]
) -> int:
    """Record a shared-work interaction per newly linked person and refresh
    their score. Isolates its own per-person errors so a scoring hiccup never
    fails the task-link request (keeps the route try/except-free). Returns how
    many interactions were recorded."""
    recorded = 0
    for pid in person_ids or []:
        try:
            created = await record_interaction(
                db,
                person_id=pid,
                type="other",
                summary=f"کارِ مشترک: {(task_title or '')[:120]}",
                dedup_note=f"task:{task_id}:person:{pid}",
            )
            if created is not None:
                recorded += 1
        except Exception as exc:
            logger.debug("task-link interaction skipped (person %s): %r", pid, exc)
    return recorded


def serialize(profile: PersonProfile, person: Optional[object] = None) -> dict:
    """The profile as the page reads it.

    Additive over the original contract (``ai_score`` / ``user_notes`` /
    ``behavior_log`` / ``relationship_type`` stay exactly as they were): adds
    the permanent ledger, the owner's override, the Persian label, and — when
    the caller has the row — the person's name, so the header stops saying a
    bare «پروفایل فرد».
    """
    rel = effective_relationship(profile)
    return {
        "id": profile.id,
        "person_id": profile.person_id,
        "person_name": getattr(person, "name", None) if person is not None else None,
        "ai_score": profile.ai_score,
        "user_notes": profile.user_notes,
        "behavior_log": profile.behavior_log or [],
        "relationship_type": profile.relationship_type,
        "relationship_override": getattr(profile, "relationship_override", None),
        "relationship": rel,
        "relationship_fa": REL_FA.get(rel, rel),
        "ledger": build_ledger(profile),
        "last_analyzed_at": profile.last_analyzed_at.isoformat() if profile.last_analyzed_at else None,
    }
