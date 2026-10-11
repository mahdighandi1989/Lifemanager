"""گاردهای مسیرِ پیامکِ بانکی (ممیزی ۲۰۲۶-۰۷-۳۱).

دو ایرادِ واقعی که ممیزی پیدا کرد و اینجا میخ می‌شوند:
  * `_pick_account` فقط `user_id == uid` را می‌دید، پس کارت‌هایی که خوراکِ
    خودکارِ ایمیل می‌سازد (`user_id=None`) از مسیرِ پیامک **نامرئی** بودند و
    هر پیامکِ بانکی بی‌صدا رد می‌شد.
  * `apply_bank_message` گاردِ «عددِ دستیِ مالک مقدم است» نداشت، پس یک پیامکِ
    قدیمی موجودیِ دستیِ مالک را پاک می‌کرد و برچسبِ «تنظیم دستی مالک» هم
    سرِ جایش می‌ماند — یعنی برچسب دروغ می‌گفت.
"""
import json

import pytest

from app.models.finance import FinancialAccount
from app.services.finance_ingest_service import apply_bank_message

SMS = "ADCB: Your available balance is AED 5,000.00"


@pytest.mark.asyncio
async def test_a_machine_created_card_is_reachable_from_sms(db_session):
    acc = FinancialAccount(user_id=None, name="ADCB", kind="bank",
                           institution="adcb", currency="AED", balance=100)
    db_session.add(acc)
    await db_session.flush()

    res = await apply_bank_message(db_session, user_id=0, channel="sms", body=SMS, sender="ADCB")
    assert res["balances_updated"] == 1
    assert float(acc.balance) == 5000.0


@pytest.mark.asyncio
async def test_an_older_sms_cannot_overwrite_a_balance_the_owner_typed(db_session):
    acc = FinancialAccount(
        user_id=0, name="ADCB", kind="bank", institution="adcb",
        currency="AED", balance=465.44,
        extra=json.dumps({"owner_balance_at": "2026-07-31T00:00:00+00:00",
                          "balance_evidence": "تنظیم دستی مالک"}, ensure_ascii=False),
    )
    db_session.add(acc)
    await db_session.flush()

    old = await apply_bank_message(
        db_session, user_id=0, channel="sms", body=SMS, sender="ADCB",
        occurred_iso="2026-05-01T10:00:00+00:00",
    )
    assert old["balances_updated"] == 0
    assert old["reason"] == "owner-pinned balance is newer"
    assert float(acc.balance) == 465.44
    # برچسب هم دست‌نخورده و صادق مانده
    assert json.loads(acc.extra)["balance_evidence"] == "تنظیم دستی مالک"


@pytest.mark.asyncio
async def test_a_newer_sms_may_move_it_and_relabels_the_provenance(db_session):
    acc = FinancialAccount(
        user_id=0, name="ADCB", kind="bank", institution="adcb",
        currency="AED", balance=465.44,
        extra=json.dumps({"owner_balance_at": "2026-05-01T00:00:00+00:00",
                          "balance_evidence": "تنظیم دستی مالک"}, ensure_ascii=False),
    )
    db_session.add(acc)
    await db_session.flush()

    res = await apply_bank_message(
        db_session, user_id=0, channel="sms", body=SMS, sender="ADCB",
        occurred_iso="2026-07-31T10:00:00+00:00",
    )
    assert res["balances_updated"] == 1
    assert float(acc.balance) == 5000.0
    # عددِ ماشینی دیگر «دستیِ مالک» برچسب نمی‌خورد
    assert json.loads(acc.extra)["balance_evidence"] != "تنظیم دستی مالک"


@pytest.mark.asyncio
async def test_a_non_positive_balance_is_refused(db_session):
    acc = FinancialAccount(user_id=0, name="XM", kind="broker",
                           institution="xm", currency="USD", balance=10)
    db_session.add(acc)
    await db_session.flush()

    res = await apply_bank_message(
        db_session, user_id=0, channel="sms",
        body="XM: Your available balance is USD 0.00", sender="XM",
    )
    assert res["balances_updated"] == 0
    assert float(acc.balance) == 10.0


# ── 2026-10-11 (owner): «هر پیامکِ بانک موجودیِ کامل را دارد — آخری باید بزند» ──
@pytest.mark.asyncio
async def test_the_newest_sms_balance_wins_and_an_older_one_arriving_late_is_ignored(db_session):
    acc = FinancialAccount(user_id=0, name="ADCB", kind="bank", institution="adcb",
                           currency="AED", balance=100)
    db_session.add(acc)
    await db_session.flush()
    new = await apply_bank_message(db_session, user_id=0, channel="sms", sender="ADCB",
                                   body="ADCB: Purchase AED 20.00. Avl Bal AED 7,700.00",
                                   occurred_iso="2026-10-11T09:00:00+00:00")
    assert new["balances_updated"] == 1 and float(acc.balance) == 7700.0
    late = await apply_bank_message(db_session, user_id=0, channel="sms", sender="ADCB",
                                    body="ADCB: Purchase AED 10.00. Avl Bal AED 9,000.00",
                                    occurred_iso="2026-10-10T09:00:00+00:00")
    assert late["balances_updated"] == 0 and late["reason"] == "older than the last applied message"
    assert float(acc.balance) == 7700.0


@pytest.mark.asyncio
async def test_a_machine_guessed_dollar_card_takes_the_banks_rial_balance_and_currency(db_session):
    acc = FinancialAccount(user_id=0, name="ملت", kind="bank", institution="ملت", currency="USD",
                           balance=4224209.74, extra=json.dumps({"source": "email", "inferred": True}))
    db_session.add(acc)
    await db_session.flush()
    res = await apply_bank_message(db_session, user_id=0, channel="sms", sender="ملت",
                                   body="بانک ملت\nبرداشت:1,200,000\nمانده:45,300,000 ريال")
    assert res["balances_updated"] == 1
    assert acc.currency == "IRR" and float(acc.balance) == 45300000.0


@pytest.mark.asyncio
async def test_an_owner_typed_card_still_refuses_another_currency(db_session):
    acc = FinancialAccount(user_id=0, name="ملت", kind="bank", institution="ملت", currency="USD",
                           balance=10, extra=json.dumps({"owner_balance_at": "2026-01-01T00:00:00+00:00"}))
    db_session.add(acc)
    await db_session.flush()
    res = await apply_bank_message(db_session, user_id=0, channel="sms", sender="ملت",
                                   body="مانده:45,300,000 ريال", occurred_iso="2026-10-11T00:00:00+00:00")
    assert res["balances_updated"] == 0 and res["reason"].startswith("currency mismatch")
    assert acc.currency == "USD"


# ── 2026-10-11 (real data): banks seen only by SMS never got a card ─────────────
@pytest.mark.asyncio
async def test_a_bank_seen_only_by_sms_gets_its_card_and_the_next_sms_moves_it(db_session):
    first = await apply_bank_message(
        db_session, user_id=0, channel="sms", sender="MBANKAlert",
        body="Purchase of AED 141.04 was made with Card ending XX917. Available Balance: AED 826.78",
        occurred_iso="2026-10-10T16:59:00+00:00")
    assert first["balances_updated"] == 1 and first.get("created")
    nxt = await apply_bank_message(
        db_session, user_id=0, channel="sms", sender="MBANKAlert",
        body="Purchase of AED 10.00 was made with Card ending XX917. Available Balance: AED 816.78",
        occurred_iso="2026-10-10T17:37:00+00:00")
    assert nxt["balances_updated"] == 1 and not nxt.get("created")
    acc = await db_session.get(FinancialAccount, first["account_id"])
    assert float(acc.balance) == 816.78 and acc.currency == "AED" and acc.name == "MBANKAlert ••917"


@pytest.mark.asyncio
async def test_a_trading_bot_on_telegram_never_touches_a_bank_card(db_session):
    acc = FinancialAccount(user_id=None, name="rakbank ••6039", kind="bank", institution="rakbank",
                           currency="AED", balance=391.7, extra=json.dumps({"source": "email", "inferred": True}))
    db_session.add(acc)
    await db_session.flush()
    res = await apply_bank_message(db_session, user_id=0, channel="sms", sender="Telegram",
                                   body="trading-system | 💼 موجودی:      $860.86 | rakbank")
    assert res["balances_updated"] == 0 and res["reason"] == "not a bank (chat/utility app)"
    assert float(acc.balance) == 391.7 and acc.currency == "AED"


@pytest.mark.asyncio
async def test_the_sms_app_wrapper_names_the_bank_from_the_text(db_session):
    res = await apply_bank_message(db_session, user_id=0, channel="sms", sender="Messages",
                                   body="FAB | FAB: Debit Card Purchase | Card XXXX9091 | AED 163.95 | Balance AED 306.43")
    assert res.get("created")
    acc = await db_session.get(FinancialAccount, res["account_id"])
    assert acc.institution == "fab" and float(acc.balance) == 306.43
