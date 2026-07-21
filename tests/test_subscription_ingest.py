"""Auto-ingest pipeline (audit «کمتر ولی زنده», move 1).

A recognised subscription-provider email becomes a review-queue candidate
(InboxItem, suggested_type="subscription"); the owner files it with one tap
into a real SubscriptionAccount — which feeds the «اشتراک‌ها» card and the
renewal reminder. These pin: detection, the opt-in flag, idempotency, and the
file handler.
"""
import types

import pytest
from sqlalchemy import select

from app.models.inbox_item import InboxItem
from app.models.subscription_account import SubscriptionAccount
from app.services import inbox_service
from app.services.google_sync import subscription_ingest as si


def _email(**kw):
    base = {"id": 1, "from_addr": "", "subject": "", "snippet": "", "labels": [], "is_unread": True}
    base.update(kw)
    return types.SimpleNamespace(**base)


async def _pending_subs(db):
    rows = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.status == "pending", InboxItem.suggested_type == "subscription"
            )
        )
    ).scalars().all()
    return rows


@pytest.mark.asyncio
async def test_recognised_provider_billing_email_creates_candidate(db_session):
    email = _email(
        from_addr="info@account.netflix.com",
        subject="Your Netflix receipt",
        snippet="We charged AED 44.99. Your plan renews on August 1, 2026.",
    )
    created = await si.route_subscription_email(db_session, email, user_id=0)
    await db_session.commit()
    assert created is True
    rows = await _pending_subs(db_session)
    assert len(rows) == 1
    sugg = rows[0].suggestion
    assert sugg["provider"] == "netflix"
    assert "44.99" in (sugg["amount"] or "")
    assert rows[0].source == "gmail"


@pytest.mark.asyncio
async def test_non_provider_or_non_billing_email_is_ignored(db_session):
    # A provider name but no billing language → not a subscription event.
    marketing = _email(from_addr="news@netflix.com", subject="New shows this week", snippet="Watch now")
    assert await si.route_subscription_email(db_session, marketing, user_id=0) is False
    # A billing email from an unknown sender → no candidate (precision).
    unknown = _email(from_addr="billing@some-shop.com", subject="Your receipt", snippet="AED 10 paid")
    assert await si.route_subscription_email(db_session, unknown, user_id=0) is False
    await db_session.commit()
    assert len(await _pending_subs(db_session)) == 0


@pytest.mark.asyncio
async def test_idempotent_against_pending_and_existing(db_session):
    email = _email(from_addr="info@spotify.com", subject="Spotify payment", snippet="Subscription renewed, $9.99")
    assert await si.route_subscription_email(db_session, email, user_id=0) is True
    await db_session.commit()
    # Same provider again → no second candidate (pending one exists).
    assert await si.route_subscription_email(db_session, email, user_id=0) is False
    await db_session.commit()
    assert len(await _pending_subs(db_session)) == 1
    # And when a SubscriptionAccount already exists, no candidate either.
    db_session.add(SubscriptionAccount(user_id=0, provider="disney-plus"))
    await db_session.commit()
    disney = _email(from_addr="help@disneyplus.com", subject="Disney+ invoice", snippet="renew AED 30")
    assert await si.route_subscription_email(db_session, disney, user_id=0) is False


@pytest.mark.asyncio
async def test_opt_out_flag_suppresses_candidates(db_session):
    await si.set_enabled(db_session, False)
    email = _email(from_addr="info@netflix.com", subject="Netflix receipt", snippet="charged AED 44.99")
    assert await si.route_subscription_email(db_session, email, user_id=0) is False
    await db_session.commit()
    assert len(await _pending_subs(db_session)) == 0
    # Toggling back on restores it.
    await si.set_enabled(db_session, True)
    assert await si.route_subscription_email(db_session, email, user_id=0) is True


@pytest.mark.asyncio
async def test_file_candidate_creates_subscription_account(db_session):
    email = _email(
        from_addr="billing@youtube.com",
        subject="YouTube Premium receipt",
        snippet="membership charged AED 23.99, renews on 2026-09-01",
    )
    await si.route_subscription_email(db_session, email, user_id=0)
    await db_session.commit()
    item = (await _pending_subs(db_session))[0]

    created = await inbox_service.file_item(db_session, item, user_id=0)
    assert created["kind"] == "subscription"

    subs = (await db_session.execute(select(SubscriptionAccount))).scalars().all()
    assert len(subs) == 1
    assert subs[0].provider == "youtube"
    assert subs[0].next_payment_date == "2026-09-01"
    # The inbox row is now filed, pointing at the new account.
    assert item.status == "filed"
    assert item.filed_entity_type == "subscription"
