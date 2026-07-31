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
