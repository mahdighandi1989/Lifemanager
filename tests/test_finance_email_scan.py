"""مالیِ خودتغذیه — the synced Gmail becomes live finance cards.

Owner (2026-07-22): «صفحهٔ مالی خودش از ایمیل‌ها حساب و موجودی و شماره رو
شناسایی کنه، با هر ایمیلِ تازه به‌روز کنه، و برای هر حساب کارت بسازه.»
"""
import datetime as dt

import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.models.personal_sync import PersonalEmail
from app.services import finance_email_scan_service as fs


def _email(eid, from_addr, subject, snippet, when):
    return PersonalEmail(
        id=eid, from_addr=from_addr, subject=subject, snippet=snippet,
        received_at=when, needs_action=False,
    )


@pytest.mark.asyncio
async def test_creates_a_card_per_detected_account(db_session):
    db_session.add(_email(
        "e1", "alerts@mbankuae.com", "Balance update",
        "Your account ending in 1234 balance: $2,500.00", dt.datetime(2026, 7, 1),
    ))
    await db_session.commit()

    summary = await fs.scan_finance_emails(db_session, 0)
    assert summary["created"] == 1

    acc = (await db_session.execute(select(FinancialAccount))).scalars().first()
    assert acc is not None
    assert acc.institution == "mbankuae"
    assert float(acc.balance) == 2500.0 and acc.currency == "USD"
    # marked «از ایمیل», owner-correctable
    pub = fs.account_public_extra(acc)
    assert pub["source"] == "email" and pub["inferred"] is True
    assert pub["account_ref"] == "••1234"
    # a delta transaction is recorded (auditable, not silent)
    txns = (await db_session.execute(select(Transaction))).scalars().all()
    assert len(txns) == 1 and txns[0].source == "email"


@pytest.mark.asyncio
async def test_rescan_updates_not_duplicates(db_session):
    db_session.add(_email(
        "e1", "alerts@mbankuae.com", "Balance",
        "account ending in 1234 balance: $1,000", dt.datetime(2026, 7, 1),
    ))
    await db_session.commit()
    await fs.scan_finance_emails(db_session, 0)

    # a NEWER email for the SAME account (same ref) → update, not a second card
    db_session.add(_email(
        "e2", "alerts@mbankuae.com", "Balance",
        "account ending in 1234 balance: $1,750", dt.datetime(2026, 7, 5),
    ))
    await db_session.commit()
    summary = await fs.scan_finance_emails(db_session, 0)

    accs = (await db_session.execute(select(FinancialAccount))).scalars().all()
    assert len(accs) == 1                       # ONE card, not two
    assert float(accs[0].balance) == 1750.0     # moved to the newer balance
    assert summary["updated"] == 1

    # running a THIRD time with no new mail is a clean no-op (idempotent)
    again = await fs.scan_finance_emails(db_session, 0)
    assert again["created"] == 0 and again["updated"] == 0


@pytest.mark.asyncio
async def test_ignores_non_financial_and_needs_a_signal(db_session):
    db_session.add_all([
        _email("n1", "friend@gmail.com", "سلام", "کی میای خونه؟", dt.datetime(2026, 7, 1)),
        # financial-smelling but no balance AND no account ref → no blind card
        _email("n2", "news@bank-news.com", "Banking newsletter", "read our tips", dt.datetime(2026, 7, 2)),
    ])
    await db_session.commit()
    summary = await fs.scan_finance_emails(db_session, 0)
    assert summary["created"] == 0
    assert (await db_session.execute(select(FinancialAccount))).scalars().first() is None


def test_endpoint_scans(api_client):
    r = api_client.post("/api/finance/scan-emails")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True and "created" in body and "scanned" in body


def test_accounts_list_exposes_email_provenance(api_client):
    # a manual account has no email provenance (source stays None)
    api_client.post("/api/finance/accounts",
                    json={"name": "دستی", "kind": "bank", "balance": 10, "currency": "USD"})
    rows = api_client.get("/api/finance/accounts").json()
    assert rows and rows[0]["source"] is None and rows[0]["inferred"] is None


# ── precision: the owner's finance page filled with junk cards ───────────────

@pytest.mark.asyncio
async def test_personal_mailbox_never_opens_an_account(db_session):
    """«جریدة الفجر» — a newspaper's invoice from a gmail address became a bank
    card. A personal/free mailbox is never an institution."""
    assert fs._institution("news@gmail.com", "Invoice") is None
    assert fs._institution("someone@yahoo.co.uk", "x") is None
    # a real institution domain still resolves
    assert fs._institution("alerts@mbankuae.com", "Balance") == "mbankuae"


@pytest.mark.asyncio
async def test_iban_alone_does_not_create_a_card(db_session):
    """An invoice carries the SENDER's IBAN for payment — that is their account,
    not the owner's. Only a real, non-zero balance opens a card."""
    r = await fs.apply_account_signal(
        db_session, 0, institution="alfajrnews", iban="AE090260751208000088113",
        balance=None, source="email", source_ref="email:inv1",
    )
    await db_session.commit()
    assert r["account_id"] is None
    assert (await db_session.execute(select(FinancialAccount))).scalars().first() is None

    # a zero balance is not a signal either
    r2 = await fs.apply_account_signal(
        db_session, 0, institution="somebank", account_ref="••4572",
        balance=0, source="email", source_ref="email:z1",
    )
    assert r2["account_id"] is None


@pytest.mark.asyncio
async def test_cleanup_removes_only_machine_junk(db_session):
    """Cleanup deletes machine-created cards with no balance AND no movement —
    never the owner's own rows, never a card with real history."""
    import json as _json

    owner = FinancialAccount(user_id=None, name="حسابِ خودم", kind="bank",
                             currency="AED", balance=0)  # owner-typed, zero balance
    junk = FinancialAccount(user_id=None, name="جریدة الفجر", kind="bank",
                            currency="USD", balance=0,
                            extra=_json.dumps({"inferred": True, "source": "email"}))
    real = FinancialAccount(user_id=None, name="bsi ••4006", kind="bank",
                            currency="AED", balance=15636.22,
                            extra=_json.dumps({"inferred": True, "source": "email"}))
    db_session.add_all([owner, junk, real])
    await db_session.commit()

    res = await fs.cleanup_inferred_junk(db_session, 0)
    assert res["removed"] == 1 and "جریدة الفجر" in res["names"]
    names = {a.name for a in (await db_session.execute(select(FinancialAccount))).scalars().all()}
    assert names == {"حسابِ خودم", "bsi ••4006"}


@pytest.mark.asyncio
async def test_movements_are_reported_per_account(db_session):
    """«از این حساب چه چیزی در فلان تاریخ کم شد» — the card carries its recorded
    movements, not just a bare total."""
    await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=15636.22, currency="AED", source="email", source_ref="email:m1",
        occurred_iso="2026-07-20T00:00:00",
    )
    await db_session.commit()
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    moves = await fs.account_movements(db_session, acc.id)
    assert moves and moves[0]["amount"] == 15636.22
    assert moves[0]["date"] == "2026-07-20" and moves[0]["currency"] == "AED"
