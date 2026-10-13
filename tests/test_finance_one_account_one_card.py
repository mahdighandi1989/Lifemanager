"""One account = one card, from the REAL production state of 2026-10-13 (sheet 6).

The finance page showed Bank Saderat (UAE) four times — IBAN, bare account number,
the same IBAN under another bank name, and the bank's SMS «BSIUAE ••4006» — and
summed all four. A sibling account at the same bank (…4100) must stay separate,
and Salik (a toll tag) is not a bank."""
import json
from decimal import Decimal

import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.services import finance_email_scan_service as fs
from app.services import finance_ingest_service as fi
from app.services.finance_account_identity import (
    bank_key, find_card, is_wallet, reconcile_duplicates, relabel_wallets,
)

BAL = Decimal("10456.78")


def _card(id_, name, inst, bal, extra, kind="bank"):
    return FinancialAccount(id=id_, user_id=None, name=name, kind=kind, institution=inst, currency="AED",
                            balance=Decimal(str(bal)), extra=json.dumps({"inferred": True, **extra}))


async def _production(db):
    db.add_all([
        _card(33, "FAB ••9091", "fab", "84.17", {"source": "sms", "ref": "9091"}),
        _card(34, "MBANKAlert ••917", "mbankalert", "75.03", {"source": "sms", "ref": "917"}),
        _card(35, "BSIUAE ••4006", "bsiuae", BAL, {"source": "sms", "ref": "4006", "last_message_at": "2026-10-10T08:00:00"}),
        _card(36, "SALIK", "salik", "202.9", {"source": "sms", "ref": ""}),
        _card(37, "bsi AE530130002776274214006", "bsi", BAL,
              {"source": "attachment", "account_ref": "AE530130002776274214006", "iban": "AE530130002776274214006",
               "source_refs": ["gmail:a:1"], "last_email_at": "2026-10-13T06:00:00"}),
        _card(38, "bsi AE370130002776274214100", "bsi", "20.02",
              {"source": "attachment", "account_ref": "AE370130002776274214100", "iban": "AE370130002776274214100"}),
        _card(39, "Bank Saderat Iran - UAE Region 2776274214006", "BankSaderatIranUAERegion", BAL,
              {"source": "attachment", "account_ref": "2776274214006", "source_refs": ["gmail:b:1"]}),
        _card(40, "بانک صادرات ایران (Bank Saderat Iran) AE530130002776274214006", "بانکصادراتایرانBankSaderatIran", BAL,
              {"source": "attachment", "account_ref": "AE530130002776274214006", "source_refs": ["gmail:c:1"]}),
    ])
    for acc_id in (35, 37, 39, 40):
        db.add(Transaction(account_id=acc_id, amount=BAL, transaction_type="income", currency="AED",
                           description="به‌روزرسانیِ خودکار از فایل", source="attachment",
                           source_ref=f"open:{acc_id}", category="_balance_delta"))
    db.add(Transaction(account_id=39, amount=Decimal("1000"), transaction_type="expense", currency="AED",
                       description="AANI TRANSFER OUT", source="statement", source_ref="line:1", category="transfer"))
    await db.commit()


async def _cards(db):
    return {a.id: a for a in (await db.execute(select(FinancialAccount))).scalars().all()}


def test_bank_aliases_and_wallets():
    assert {bank_key(x) for x in ("bsi", "BSIUAE", "BankSaderatIranUAERegion", "بانکصادراتایرانBankSaderatIran")} == {"saderat"}
    assert bank_key("fab") != bank_key("bsi")
    assert is_wallet("SALIK") and not is_wallet("Dubai Islamic Bank") and not is_wallet("bsi")


@pytest.mark.asyncio
async def test_the_same_iban_under_another_bank_name_is_the_same_card(db_session):
    await _production(db_session)
    accounts = list((await _cards(db_session)).values())
    # the very signal that minted card 40 now lands on the canonical card
    hit = find_card(accounts, ref="AE530130002776274214006", institution="بانکصادراتایرانBankSaderatIran", currency="AED")
    assert hit.id == 37
    # the bank's SMS «27762****4006» → the Saderat account, NEVER the sibling …4100
    assert find_card(accounts, ref="4006", institution="BSIUAE", currency="AED").id == 37
    assert find_card(accounts, ref="4100", institution="BSIUAE", currency="AED").id == 38
    # a last-4 at ANOTHER bank is not this account
    assert find_card(accounts, ref="4006", institution="fab", currency="AED") is None


@pytest.mark.asyncio
async def test_reconcile_folds_four_cards_into_one_and_keeps_the_rest(db_session):
    await _production(db_session)
    res = await reconcile_duplicates(db_session)
    assert res["groups"] == 1 and res["merged"] == 3
    cards = await _cards(db_session)
    assert set(cards) == {33, 34, 36, 37, 38}, "35, 39, 40 folded into 37; FAB/Mashreq/Salik/…4100 untouched"
    keep = cards[37]
    assert keep.balance == BAL and cards[38].balance == Decimal("20.02")
    e = json.loads(keep.extra)
    assert {m["id"] for m in e["merged_from"]} == {35, 39, 40}, "every merged card kept as a snapshot (reversible)"
    assert "4006" in e["alias_refs"] and "2776274214006" in e["alias_refs"]
    assert set(e["source_refs"]) >= {"gmail:a:1", "gmail:b:1", "gmail:c:1"}
    txns = (await db_session.execute(select(Transaction).where(Transaction.account_id == 37))).scalars().all()
    assert [t.source_ref for t in txns if t.category != "_balance_delta"] == ["line:1"], "real lines move"
    assert sum(1 for t in txns if t.category == "_balance_delta") == 1, "the duplicates' synthetic rows are dropped"
    total = sum(c.balance for c in cards.values())
    assert total == BAL + Decimal("20.02") + Decimal("84.17") + Decimal("75.03") + Decimal("202.9")
    assert (await reconcile_duplicates(db_session))["merged"] == 0, "idempotent"


@pytest.mark.asyncio
async def test_after_the_merge_no_source_mints_a_new_card(db_session):
    await _production(db_session)
    await reconcile_duplicates(db_session)
    for inst, ref, sref in (("بانکصادراتایرانBankSaderatIran", "AE530130002776274214006", "gmail:new:1"),
                            ("BankSaderatIranUAERegion", "2776274214006", "gmail:new:2"),
                            ("bsi", "AE530130002776274214006", "gmail:new:3")):
        r = await fs.apply_account_signal(db_session, 0, institution=inst, account_ref=ref, balance="10500.00",
                                          currency="AED", source="attachment", source_ref=sref,
                                          occurred_iso="2026-10-14T06:00:00")
        assert r["created"] == 0 and r["account_id"] == 37
    await db_session.commit()
    sms = "Debit transaction(AANI TRANSFER OUT) : -1000 AED  on  your account 27762****4006 on 14/10/2026.Your balance is AED 9,500.00."
    r = await fi.apply_bank_message(db_session, user_id=0, channel="sms", body=sms, sender="BSIUAE",
                                    occurred_iso="2026-10-14T09:00:00")
    assert r.get("account_id", 37) == 37 and not r.get("created")
    cards = await _cards(db_session)
    assert set(cards) == {33, 34, 36, 37, 38}
    assert cards[37].balance == Decimal("9500.00") and cards[38].balance == Decimal("20.02")


@pytest.mark.asyncio
async def test_salik_is_a_wallet_not_a_bank(db_session):
    await _production(db_session)
    assert await relabel_wallets(db_session) == 1
    assert (await _cards(db_session))[36].kind == "wallet"
    r = await fi.apply_bank_message(db_session, user_id=0, channel="sms", sender="Nol",
                                    body="Your Nol card balance is AED 35.00")
    if r.get("created"):
        acc = (await _cards(db_session))[r["account_id"]]
        assert acc.kind == "wallet"
