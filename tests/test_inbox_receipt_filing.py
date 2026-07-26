"""«خرید را به مالی فرستادم، مثل گاو حساب بانکی ساخت» (2026-07-25).

Filing a purchase into «مالی» must record an EXPENSE, never mint an account
card. And the blind fallback that created 0.00 cards out of anything
(«Carrefour», «Talabat», «فرد جدید از ایمیل: estatement <…>») is gone: a card
demands an account signal.
"""
import datetime as dt

import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.services import inbox_service


@pytest.mark.asyncio
async def test_receipt_routed_to_finance_becomes_an_expense_not_an_account(db_session):
    res = await inbox_service._file_as_finance_account(
        db_session,
        {"provider": "Carrefour (Majid Al Futtaim)", "amount": "96.00",
         "currency": "AED", "title": "Tax Invoice", "source_ref": "gmail:c1:invoice.pdf"},
        0,
    )
    await db_session.commit()
    assert res["kind"] == "transaction"
    txn = (await db_session.execute(select(Transaction))).scalars().one()
    assert txn.transaction_type == "expense" and float(txn.amount) == 96.0
    assert "Carrefour" in (txn.description or "")
    # NO merchant bank card
    names = [a.name for a in (await db_session.execute(select(FinancialAccount))).scalars().all()]
    assert all("Carrefour" not in n for n in names)


@pytest.mark.asyncio
async def test_no_financial_signal_is_refused_not_minted(db_session):
    """The «فرد جدید از ایمیل: estatement &lt;…&gt;» 0.00 card must be impossible."""
    with pytest.raises(ValueError):
        await inbox_service._file_as_finance_account(
            db_session,
            {"title": "فرد جدید از ایمیل: estatement &lt;estatement@bankfab.com&gt;"},
            0,
        )
    assert (await db_session.execute(select(FinancialAccount))).scalars().first() is None


@pytest.mark.asyncio
async def test_real_statement_still_files_as_an_account(db_session):
    res = await inbox_service._file_as_finance_account(
        db_session,
        {"provider": "BSI Sharjah", "balance": "15636.22", "currency": "AED",
         "iban": "AE530130002776274214006"},
        0,
    )
    await db_session.commit()
    assert res["kind"] == "finance_account"
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    assert float(acc.balance) == 15636.22


def test_provider_cleaning_strips_prefix_and_angle_addresses():
    clean = inbox_service._clean_provider(
        "فرد جدید از ایمیل: estatement &lt;estatement@bankfab.com&gt;"
    )
    assert "فرد جدید" not in clean and "&lt;" not in clean and "@" not in clean


@pytest.mark.asyncio
async def test_manual_confirm_of_an_old_statement_does_not_stomp_the_balance(db_session):
    """The signal's own date is recovered from the mirrored email; an undated
    machine signal never counts as newer than a dated balance."""
    from app.models.personal_sync import PersonalEmail
    from app.services import finance_email_scan_service as fs

    db_session.add(PersonalEmail(
        id="old1", from_addr="estatement@bankfab.com", subject="Statement Feb",
        snippet="", received_at=dt.datetime(2026, 2, 1), needs_action=False,
    ))
    await db_session.commit()

    # live balance, dated July
    await fs.apply_account_signal(
        db_session, 0, institution="bankfab", account_ref="••4006",
        balance=15636.22, currency="AED", source="email", source_ref="email:j1",
        occurred_iso="2026-07-01T00:00:00",
    )
    await db_session.commit()

    # the owner confirms FEBRUARY's statement from the inbox — its date comes
    # from the mirrored email, so it must NOT overwrite July
    await inbox_service._file_as_finance_account(
        db_session,
        {"provider": "bankfab", "balance": "4101.72", "currency": "AED",
         "account_no": "••4006", "source_ref": "gmail:old1:feb.pdf"},
        0,
    )
    await db_session.commit()
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    assert float(acc.balance) == 15636.22

    # …and an undated machine signal is refused too (conservative)
    await fs.apply_account_signal(
        db_session, 0, institution="bankfab", account_ref="••4006",
        balance=99.0, currency="AED", source="attachment", source_ref="file:nodate",
        occurred_iso=None,
    )
    await db_session.commit()
    await db_session.refresh(acc)
    assert float(acc.balance) == 15636.22


def test_estatement_sender_is_not_a_person():
    from app.services.google_sync.person_ingest import _is_human

    class _E:
        from_addr = "eStatement <estatement@bankfab.com>"

    assert _is_human(_E()) is False


def test_password_hint_extraction():
    from app.services.ingest.email_ingest import password_hint_from

    body = (
        "Dear customer, please find your statement attached. "
        "The password is your card number followed by your year of birth in YYYY format. "
        "Thank you for banking with us."
    )
    hint = password_hint_from(body)
    assert hint and "card number" in hint and "year of birth" in hint
    assert password_hint_from("hello, no secrets here") is None
    assert password_hint_from(None) is None
    fa = password_hint_from("رمز فایل، شماره کارت شما به همراه سال تولد است. با تشکر")
    assert fa and "شماره کارت" in fa


@pytest.mark.asyncio
async def test_password_request_carries_the_banks_hint(db_session):
    from app.models.inbox_item import InboxItem
    from app.services.ingest.email_ingest import _propose_password_request

    ok = await _propose_password_request(
        db_session, sender="estatement@bankfab.com", filename="stmt.pdf",
        source_ref="gmail:h1:stmt.pdf", user_id=0,
        hint="The password is your card number followed by your year of birth.",
    )
    await db_session.commit()
    assert ok is True
    item = (await db_session.execute(select(InboxItem))).scalars().one()
    assert "card number" in (item.suggestion or {}).get("password_hint", "")
