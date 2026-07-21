"""Backfill — run ingest over ALREADY-synced emails (the backlog that arrived
before the detectors existed). Owner had 165 emails but empty People/subs."""
import pytest
from sqlalchemy import select

from app.models.inbox_item import InboxItem
from app.models.interaction import Interaction
from app.models.person import Person
from app.models.personal_sync import PersonalEmail
from app.services import inbox_service
from app.services.google_sync import person_ingest as pi


@pytest.mark.asyncio
async def test_backfill_all_produces_candidates_from_existing_emails(db_session):
    # emails already synced (analyzed) before the detectors existed
    db_session.add_all([
        PersonalEmail(id="m1", from_addr="info@netflix.com", subject="Netflix receipt",
                      snippet="charged AED 44.99"),
        PersonalEmail(id="m2", from_addr="Reza <reza@work.com>", subject="جلسه"),
        PersonalEmail(id="m3", from_addr="Reza <reza@work.com>", subject="پیگیری"),
    ])
    await db_session.commit()

    res = await pi.backfill_all(db_session, user_id=0)
    assert res["scanned"] == 3
    assert res["subscription_candidates"] == 1   # netflix
    assert res["person_candidates"] == 1         # reza (repeated human)

    kinds = {c.suggested_type for c in (await db_session.execute(select(InboxItem))).scalars().all()}
    assert "subscription" in kinds and "person" in kinds


@pytest.mark.asyncio
async def test_filing_person_backfills_score_from_existing_emails(db_session):
    """Approving a Gmail person candidate seeds their score from prior emails."""
    for i in (1, 2, 3):
        db_session.add(PersonalEmail(id=f"e{i}", from_addr="ali@example.com", subject=f"موضوع {i}"))
    await db_session.commit()

    # simulate filing a person candidate (email known)
    created = await inbox_service._file_as_person(
        db_session, {"person_name": "علی", "email": "ali@example.com", "title": "علی"}, 0
    )
    await db_session.commit()
    pid = created["id"]

    person = await db_session.get(Person, pid)
    assert person.email == "ali@example.com"
    inters = (await db_session.execute(select(Interaction).where(Interaction.person_id == pid))).scalars().all()
    assert len(inters) == 3  # backfilled from the 3 prior emails
