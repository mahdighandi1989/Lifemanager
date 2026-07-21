"""People CRM auto-feed (audit «کمتر ولی زنده»): the Interaction table finally
gets a producer, so the relationship score reflects real activity.

Pins: interaction recorded + score refreshed for a KNOWN sender; dedup per
Gmail message; unknown human repeated sender → review candidate; non-human
(noreply) ignored; opt-out flag; and the task-link → interaction bridge.
"""
import types

import pytest
from sqlalchemy import func, select

from app.models.inbox_item import InboxItem
from app.models.interaction import Interaction
from app.models.person import Person
from app.models.personal_sync import PersonalEmail
from app.models.person_profile import PersonProfile
from app.services import person_profile_service as pps
from app.services.google_sync import person_ingest as pi


def _email(**kw):
    base = {"id": 1, "from_addr": "", "subject": "سلام", "snippet": "", "labels": []}
    base.update(kw)
    return types.SimpleNamespace(**base)


async def _add_person(db, name, email):
    p = Person(user_id=0, name=name, email=email)
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p


@pytest.mark.asyncio
async def test_known_sender_records_interaction_and_scores(db_session):
    p = await _add_person(db_session, "علی", "ali@example.com")
    email = _email(from_addr="Ali Rezaei <ali@example.com>", subject="دربارهٔ پروژه")
    pid = await pi.record_email_interaction(db_session, email, user_id=0)
    assert pid == p.id
    # rescore (batched by the caller) then check the score moved off zero.
    await pi.rescore_people(db_session, {pid})
    inters = (await db_session.execute(select(Interaction).where(Interaction.person_id == p.id))).scalars().all()
    assert len(inters) == 1 and inters[0].type.value == "email"
    prof = (await db_session.execute(select(PersonProfile).where(PersonProfile.person_id == p.id))).scalar_one()
    assert prof.ai_score > 0  # engagement now feeds the deterministic scorer


@pytest.mark.asyncio
async def test_interaction_is_deduped_per_message(db_session):
    p = await _add_person(db_session, "علی", "ali@example.com")
    email = _email(from_addr="ali@example.com", subject="یک")
    assert await pi.record_email_interaction(db_session, email, user_id=0) == p.id
    # same message id again → no second interaction
    assert await pi.record_email_interaction(db_session, email, user_id=0) is None
    n = (await db_session.execute(select(func.count()).select_from(Interaction).where(Interaction.person_id == p.id))).scalar()
    assert n == 1


@pytest.mark.asyncio
async def test_unknown_repeated_human_becomes_candidate(db_session):
    # two synced emails from the same unknown human sender
    for i in (1, 2):
        db_session.add(PersonalEmail(id=f"g{i}", from_addr="rezaei@company.com", subject="x"))
    await db_session.commit()
    email = _email(id=2, from_addr="Reza Rezaei <rezaei@company.com>", subject="جلسه")
    # not a known person → no interaction
    assert await pi.record_email_interaction(db_session, email, user_id=0) is None
    # repeated human → a person candidate is queued
    assert await pi.route_person_email(db_session, email, user_id=0) is True
    await db_session.commit()
    cand = (await db_session.execute(select(InboxItem).where(InboxItem.suggested_type == "person"))).scalars().all()
    assert len(cand) == 1 and cand[0].suggestion["email"] == "rezaei@company.com"
    # idempotent: a second pass queues nothing new
    assert await pi.route_person_email(db_session, email, user_id=0) is False


@pytest.mark.asyncio
async def test_noreply_sender_ignored(db_session):
    for kind in ("noreply@netflix.com", "notifications@github.com", "no-reply@x.com"):
        email = _email(from_addr=kind, subject="x")
        assert await pi.record_email_interaction(db_session, email, user_id=0) is None
        assert await pi.route_person_email(db_session, email, user_id=0) is False


@pytest.mark.asyncio
async def test_opt_out_flag(db_session):
    p = await _add_person(db_session, "علی", "ali@example.com")
    await pi.set_enabled(db_session, False)
    email = _email(from_addr="ali@example.com", subject="x")
    assert await pi.record_email_interaction(db_session, email, user_id=0) is None
    await pi.set_enabled(db_session, True)
    assert await pi.record_email_interaction(db_session, email, user_id=0) == p.id


@pytest.mark.asyncio
async def test_task_link_records_interaction(db_session):
    """The task→person bridge: recording a shared-work interaction lifts the
    score, and is deduped per (task, person)."""
    p = await _add_person(db_session, "رضا", "reza@example.com")
    first = await pps.record_interaction(
        db_session, person_id=p.id, type="other",
        summary="کارِ مشترک: خرید", dedup_note="task:5:person:%d" % p.id,
    )
    assert first is not None
    again = await pps.record_interaction(
        db_session, person_id=p.id, type="other",
        summary="کارِ مشترک: خرید", dedup_note="task:5:person:%d" % p.id,
    )
    assert again is None  # same task+person deduped
    prof = (await db_session.execute(select(PersonProfile).where(PersonProfile.person_id == p.id))).scalar_one()
    assert prof.ai_score > 0
