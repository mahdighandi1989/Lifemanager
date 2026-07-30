"""بازسازی دقتِ خطِ مالی (2026-07-30) — the three-phase fix for the owner's
«تشخیص حساب‌ها و موجودی هنوز فوق‌العاده خطا دارد».

Phase 1 — the balance itself: Persian digits, balance-kind preference, no
zero/negative overwrites, no USD default, no cross-currency writes, the
purchase≠account guard on the AUTO path, and owner-delete tombstones.
Phase 2 — identity: ref+institution together, subdomain brands, the owner
allow-list, deterministic-wins identity fields.
Phase 3 — bookkeeping: no double-counting, message dedup, ordered ref
memory, same-day duplicate movements both persisting.
"""
import pytest
from decimal import Decimal

from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.services import finance_email_scan_service as fs
from app.services.email_parser_service import parse_balance


# ── Phase 1: the balance itself ─────────────────────────────────────────────

def test_persian_digits_and_separators_parse_fully():
    r = parse_balance("موجودی: ۱۲٬۵۰۰٬۰۰۰ ریال")
    assert r.balance == 12_500_000.0 and r.currency == "IRR"


def test_previous_and_outstanding_and_rewards_are_not_the_balance():
    assert parse_balance("Outstanding Balance: AED 3,200.00").balance is None
    assert parse_balance("Your rewards balance: 1,500 points").balance is None
    r = parse_balance("Previous Balance: 1,234.56  Closing Balance: 9,999.00")
    assert r.balance == 9999.0


def test_available_wins_over_bare_balance_and_prose_numbers_ignored():
    r = parse_balance("Balance summary — Available Balance: AED 100.00")
    assert r.balance == 100.0 and r.currency == "AED"
    assert parse_balance("work-life balance 10 tips").balance is None


def test_european_decimal_format():
    assert parse_balance("Balance: 1.234.567,89").balance == 1234567.89


@pytest.mark.asyncio
async def test_no_currency_means_no_new_card(db_session):
    res = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••1111",
        balance=5000, currency=None, source="email", source_ref="email:x1",
    )
    assert res["account_id"] is None and res.get("reason") == "no currency"
    assert (await db_session.execute(select(FinancialAccount))).scalars().first() is None


@pytest.mark.asyncio
async def test_zero_balance_never_overwrites_a_live_card(db_session):
    await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=15636.22, currency="AED", source="email", source_ref="email:z1",
        occurred_iso="2026-07-01T00:00:00",
    )
    res = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=0, currency="AED", source="email", source_ref="email:z2",
        occurred_iso="2026-07-02T00:00:00",
    )
    assert res["updated"] == 0
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    assert float(acc.balance) == 15636.22


@pytest.mark.asyncio
async def test_other_currency_never_relabels_or_moves_a_card(db_session):
    await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=15636.22, currency="AED", source="email", source_ref="email:c1",
        occurred_iso="2026-07-01T00:00:00",
    )
    res = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=999.0, currency="USD", source="email", source_ref="email:c2",
        occurred_iso="2026-07-02T00:00:00",
    )
    assert res["updated"] == 0
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    assert acc.currency == "AED" and float(acc.balance) == 15636.22


def test_tax_invoice_footer_no_longer_kills_a_real_statement():
    # every UAE bank statement PDF carries «Tax Invoice» and an unsubscribe
    # footer — with account evidence present these are NOT refusals…
    assert not fs.is_not_an_account(
        "Statement of account — Tax Invoice. Closing balance AED 9,999. To unsubscribe click here."
    )
    # …but junk with no account evidence still is.
    assert fs.is_not_an_account("Monthly newsletter — promotion inside! unsubscribe")
    # and the Persian «وام» must not fire inside «عوامل».
    assert not fs.is_not_an_account("عوامل موثر بر موجودی حساب")
    assert fs.is_not_an_account("جدول اقساط وام مسکن")


@pytest.mark.asyncio
async def test_owner_delete_is_permanent_until_restored(db_session):
    """The tombstone flow: API-style delete blocks the rebuild; clearing the
    tombstone re-arms it (the d2ddf0e self-heal, gated behind owner intent)."""
    await fs.apply_account_signal(
        db_session, 0, institution="wrongbank", account_ref="••9999",
        balance=100, currency="AED", source="email", source_ref="email:t1",
        occurred_iso="2026-07-01T00:00:00",
    )
    await db_session.commit()
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()

    # owner deletes → tombstone recorded (what the DELETE endpoint does)
    await fs.add_account_tombstone(db_session, acc)
    await db_session.delete(acc)
    await db_session.commit()

    res = await fs.apply_account_signal(
        db_session, 0, institution="wrongbank", account_ref="••9999",
        balance=100, currency="AED", source="email", source_ref="email:t2",
        occurred_iso="2026-07-02T00:00:00",
    )
    assert res["created"] == 0 and res.get("reason") == "tombstoned"

    # بازگردانی: clearing the tombstone lets the files rebuild the card.
    assert await fs.clear_account_tombstones(db_session) == 1
    await db_session.commit()
    res2 = await fs.apply_account_signal(
        db_session, 0, institution="wrongbank", account_ref="••9999",
        balance=100, currency="AED", source="email", source_ref="email:t3",
        occurred_iso="2026-07-03T00:00:00",
    )
    assert res2["created"] == 1


@pytest.mark.asyncio
async def test_trusted_owner_approval_overrides_tombstone(db_session):
    await fs.apply_account_signal(
        db_session, 0, institution="mybank", account_ref="••1234",
        balance=50, currency="AED", source="email", source_ref="email:o1",
        occurred_iso="2026-07-01T00:00:00",
    )
    await db_session.commit()
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    await fs.add_account_tombstone(db_session, acc)
    await db_session.delete(acc)
    await db_session.commit()

    # the owner explicitly re-files it from the inbox — trusted wins.
    res = await fs.apply_account_signal(
        db_session, 0, institution="mybank", account_ref="••1234",
        balance=50, currency="AED", source="attachment", source_ref="f:1",
        occurred_iso="2026-07-02T00:00:00", trusted=True,
    )
    assert res["created"] == 1


# ── Phase 2: identity ───────────────────────────────────────────────────────

def test_institution_brand_from_subdomains():
    assert fs._institution("no-reply@mail.wise.com", None) == "wise"
    assert fs._institution("alerts@notification.adcb.ae", None) == "adcb"
    assert fs._institution("x@e.mail.hsbc.com.hk", None) == "hsbc"
    assert fs._institution("alerts@mbankuae.com", None) == "mbankuae"
    assert fs._institution("someone@gmail.com", None) is None
    assert fs._institution("someone@mail.ru", None) is None


def test_last4_takes_the_last_four_and_iban_needs_a_real_prefix():
    assert fs._account_ref("card ending in 123456") == "••3456"
    assert fs._IBAN.search("Invoice no IN20240712345678901") is None
    m = fs._IBAN.search("AE070331234567890123456")
    assert m and m.group(1).startswith("AE")


@pytest.mark.asyncio
async def test_same_last4_at_two_banks_stays_two_cards(db_session):
    await fs.apply_account_signal(
        db_session, 0, institution="enbd", account_ref="••4321",
        balance=1000, currency="AED", source="email", source_ref="email:b1",
        occurred_iso="2026-07-01T00:00:00",
    )
    res = await fs.apply_account_signal(
        db_session, 0, institution="fab", account_ref="••4321",
        balance=2000, currency="AED", source="email", source_ref="email:b2",
        occurred_iso="2026-07-02T00:00:00",
    )
    assert res["created"] == 1
    accounts = (await db_session.execute(select(FinancialAccount))).scalars().all()
    assert len(accounts) == 2
    by_inst = {a.institution: float(a.balance) for a in accounts}
    assert by_inst == {"enbd": 1000.0, "fab": 2000.0}


@pytest.mark.asyncio
async def test_refless_signal_with_two_cards_at_one_bank_is_refused(db_session):
    for ref, sref in (("••1111", "email:m1"), ("••2222", "email:m2")):
        await fs.apply_account_signal(
            db_session, 0, institution="mbankuae", account_ref=ref,
            balance=500, currency="AED", source="email", source_ref=sref,
            occurred_iso="2026-07-01T00:00:00",
        )
    res = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref=None,
        balance=9999, currency="AED", source="email", source_ref="email:m3",
        occurred_iso="2026-07-02T00:00:00",
    )
    assert res.get("reason") == "ambiguous"
    balances = sorted(
        float(a.balance)
        for a in (await db_session.execute(select(FinancialAccount))).scalars().all()
    )
    assert balances == [500.0, 500.0]  # nothing guessed, nothing corrupted


@pytest.mark.asyncio
async def test_owner_allowlist_blocks_unknown_banks(db_session):
    await fs.set_owner_accounts(db_session, [{"institution": "fab"}])
    await db_session.commit()
    blocked = await fs.apply_account_signal(
        db_session, 0, institution="randombank", account_ref="••7777",
        balance=100, currency="AED", source="email", source_ref="email:a1",
        occurred_iso="2026-07-01T00:00:00",
    )
    assert blocked["created"] == 0 and blocked.get("reason") == "not owner's"
    allowed = await fs.apply_account_signal(
        db_session, 0, institution="fab", account_ref="••8888",
        balance=100, currency="AED", source="email", source_ref="email:a2",
        occurred_iso="2026-07-01T00:00:00",
    )
    assert allowed["created"] == 1


def test_owner_accounts_endpoints_roundtrip(api_client):
    r = api_client.post(
        "/api/finance/owner-accounts",
        json={"action": "add", "institution": "fab", "account_ref": "4006", "label": "حساب اصلی"},
    )
    assert r.status_code == 200 and len(r.json()["accounts"]) == 1
    assert api_client.get("/api/finance/owner-accounts").json()["accounts"][0]["institution"] == "fab"
    r2 = api_client.post("/api/finance/owner-accounts", json={"action": "remove", "index": 0})
    assert r2.status_code == 200 and r2.json()["accounts"] == []


def test_delete_endpoint_tombstones_and_clear_restores(api_client):
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "Wrong Card", "kind": "bank", "balance": 10, "currency": "AED"},
    ).json()
    r = api_client.delete(f"/api/finance/accounts/{made['id']}")
    assert r.status_code == 200 and r.json()["tombstoned"] is True
    tombs = api_client.get("/api/finance/tombstones").json()["tombstones"]
    assert any(t.get("name") == "Wrong Card" for t in tombs)
    cleared = api_client.post("/api/finance/tombstones/clear", json={})
    assert cleared.status_code == 200 and cleared.json()["cleared"] >= 1
    assert api_client.get("/api/finance/tombstones").json()["tombstones"] == []


# ── Phase 3: bookkeeping ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_balance_delta_is_not_summed_in_the_monthly_report(db_session):
    from app.services.finance_report_service import build_report

    await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=10000, currency="AED", source="email", source_ref="email:r1",
        occurred_iso="2026-07-01T00:00:00",
    )
    await db_session.commit()
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    # the statement's real line
    await fs.record_statement_lines(db_session, acc, [{
        "date": "2026-07-03", "description": "POS COFFEE", "amount": 600.0,
        "direction": "out", "currency": "AED",
    }])
    await db_session.commit()

    report = await build_report(db_session, user_id=0, months=2)
    july = next(m for m in report if m["month"] == "2026-07")
    aed = next(c for c in july["currencies"] if c["currency"] == "AED")
    # ONLY the real 600 movement counts — the 10,000 opening delta is
    # bookkeeping, not spending/income.
    assert aed["expense"] == 600.0 and aed["income"] == 0.0


def test_ingest_message_is_deduped_on_redelivery(api_client):
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "Mellat", "kind": "bank", "balance": 100, "currency": "USD"},
    ).json()
    body = {"channel": "email", "body": "Balance: $5,000.00", "account_id": made["id"]}
    first = api_client.post("/api/finance/ingest-message", json=body).json()
    assert first["balances_updated"] == 1
    second = api_client.post("/api/finance/ingest-message", json=body).json()
    assert second["balances_updated"] == 0 and second.get("reason") == "duplicate message"


def test_ingest_message_refuses_cross_currency(api_client):
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "Dirham", "kind": "bank", "balance": 100, "currency": "AED"},
    ).json()
    r = api_client.post(
        "/api/finance/ingest-message",
        json={"channel": "email", "body": "Balance: $9,999.00", "account_id": made["id"]},
    ).json()
    assert r["balances_updated"] == 0 and "currency mismatch" in (r.get("reason") or "")
    acc = next(a for a in api_client.get("/api/finance/accounts").json() if a["id"] == made["id"])
    assert acc["currency"] == "AED" and float(acc["balance"]) == 100.0


@pytest.mark.asyncio
async def test_two_identical_same_day_purchases_both_persist(db_session):
    await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4006",
        balance=10000, currency="AED", source="email", source_ref="email:d1",
        occurred_iso="2026-07-01T00:00:00",
    )
    await db_session.commit()
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    line = {"date": "2026-07-03", "description": "POS COFFEE", "amount": 20.0,
            "direction": "out", "currency": "AED"}
    stats = await fs.record_statement_lines(db_session, acc, [dict(line), dict(line)])
    await db_session.commit()
    assert stats["added"] == 2  # two real coffees, two rows
    # …and a re-upload of the SAME statement adds nothing.
    stats2 = await fs.record_statement_lines(db_session, acc, [dict(line), dict(line)])
    assert stats2["added"] == 0 and stats2["skipped"] == 2


@pytest.mark.asyncio
async def test_refs_memory_is_ordered_and_capped(db_session):
    assert fs._keep_order_tail(["a", "b", "a", "c"], cap=10) == ["a", "b", "c"]
    long = [f"r{i}" for i in range(250)]
    kept = fs._keep_order_tail(long, cap=200)
    assert kept[0] == "r50" and kept[-1] == "r249" and len(kept) == 200


def test_share_sheet_import_reaches_a_real_card(api_client):
    r = api_client.post(
        "/api/bank-accounts/import-share-sheet",
        json={
            "account_holder": "MOHAMAD MAHDI",
            "account_type": "CURRENT",
            "account_number": "1234567890",
            "iban": "AE070331234567890123456",
            "bank_name": "First Abu Dhabi Bank",
            "available_balance": "465.44",
            "currency_symbol": "AED",
        },
    )
    assert r.status_code in (200, 201), r.text
    accounts = api_client.get("/api/finance/accounts").json()
    fab = [a for a in accounts if (a.get("iban") or "").startswith("AE07")]
    assert fab and float(fab[0]["balance"]) == 465.44 and fab[0]["currency"] == "AED"
