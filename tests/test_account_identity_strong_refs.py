"""Same bank account seen through several sources (IBAN / bare account number /
masked last-4) must stay ONE card — on strong evidence only, never on equal
balances (owner 2026-10-13, Saderat UAE shown 3-4 times)."""
import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount
from app.services import finance_email_scan_service as fs

IBAN = "AE530130002776274214006"
NUM = "2776274214006"


async def _sig(db, inst, ref, bal, ts, sref, iban=None):
    return await fs.apply_account_signal(
        db, 0, institution=inst, account_ref=ref, iban=iban, balance=bal,
        currency="AED", source="attachment", source_ref=sref, occurred_iso=ts,
    )


async def _count(db):
    return len((await db.execute(select(FinancialAccount))).scalars().all())


def test_ref_equivalence_rules():
    assert fs._refs_same_account(IBAN, NUM)
    assert fs._refs_same_account(NUM, IBAN)
    assert not fs._refs_same_account("••4006", IBAN)       # last-4 is a hint only
    assert not fs._refs_same_account("AE370130002776274214100", IBAN)


@pytest.mark.asyncio
async def test_iban_and_account_number_merge(db_session):
    await _sig(db_session, "bsi", IBAN, 10456.78, "2026-10-11T00:00:00", "f:1")
    await _sig(db_session, "BankSaderatIranUAERegion", NUM, 10456.78, "2026-10-13T00:00:00", "f:2")
    await db_session.commit()
    assert await _count(db_session) == 1


@pytest.mark.asyncio
async def test_equal_balance_alone_never_merges(db_session):
    await _sig(db_session, "bsi", IBAN, 10456.78, "2026-10-11T00:00:00", "f:1")
    await _sig(db_session, "otherbank", "9999999999999", 10456.78, "2026-10-12T00:00:00", "f:2")
    await db_session.commit()
    assert await _count(db_session) == 2


@pytest.mark.asyncio
async def test_masked_tail_needs_second_signal(db_session):
    await _sig(db_session, "bsi", IBAN, 10456.78, "2026-10-11T00:00:00", "f:1")
    # same tail, DIFFERENT balance ⇒ stays separate
    await _sig(db_session, "BSIUAE", "••4006", 500, "2026-10-12T00:00:00", "f:2")
    await db_session.commit()
    assert await _count(db_session) == 2


@pytest.mark.asyncio
async def test_masked_tail_with_currency_and_balance_merges(db_session):
    await _sig(db_session, "bsi", IBAN, 10456.78, "2026-10-11T00:00:00", "f:1")
    await _sig(db_session, "BSIUAE", "••4006", 10456.78, "2026-10-12T00:00:00", "f:2")
    await db_session.commit()
    assert await _count(db_session) == 1
