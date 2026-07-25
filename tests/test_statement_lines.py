"""ریزِ گردشِ حساب — the per-transaction lines a statement carries.

Owner (2026-07-22): «مشخصات صورت‌حساب رو نمی‌نویسه و به‌روز کنه و ببینه از این
حساب چه چیزی در فلان تاریخ کم شده.» Until now the pipeline produced exactly ONE
number per statement — the closing balance. These tests pin the deterministic,
keyless line parser and its idempotent persistence.
"""
import datetime as dt

import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.services import finance_email_scan_service as fs
from app.services.ingest.statement_lines import (
    line_ref,
    parse_date,
    parse_statement_lines,
)


# ── the parser ───────────────────────────────────────────────────────────────

def test_reads_a_plain_bank_statement_with_running_balance():
    text = """
    ACME BANK — Statement of Account
    Account ending in 4006          Currency: AED
    Date        Description                     Amount       Balance
    01/07/2026  OPENING BALANCE                              10,000.00
    03/07/2026  POS PURCHASE CARREFOUR MALL       250.00       9,750.00
    05/07/2026  SALARY TRANSFER                 5,000.00      14,750.00
    09/07/2026  ATM WITHDRAWAL DIFC               600.00      14,150.00
    """
    rows = parse_statement_lines(text, currency="AED")
    assert len(rows) == 3                        # the opening-balance line is not a movement

    pos, salary, atm = rows
    assert pos["date"] == "2026-07-03" and pos["amount"] == 250.0
    assert pos["direction"] == "out" and "CARREFOUR" in pos["description"]
    assert pos["balance_after"] == 9750.0
    # the balance went UP → income, whatever the wording says
    assert salary["direction"] == "in" and salary["amount"] == 5000.0
    assert atm["direction"] == "out" and atm["date"] == "2026-07-09"
    assert all(r["currency"] == "AED" for r in rows)


def test_balance_delta_beats_the_wording():
    """A line worded like a payment that RAISED the balance is a credit. The
    running balance is a fact; the wording is marketing. The opening line is not
    a movement, but its number anchors the chain so even the FIRST real line
    knows its direction."""
    text = (
        "01-Jul-2026 OPENING BALANCE 1,000.00\n"
        "02-Jul-2026 PAYMENT REVERSAL FROM MERCHANT   300.00   1,300.00\n"
    )
    rows = parse_statement_lines(text)
    assert len(rows) == 1
    assert rows[0]["direction"] == "in"


def test_cr_dr_markers_and_bracket_negatives():
    text = (
        "2026-07-01  SERVICE FEE            (25.00)\n"
        "2026-07-02  INWARD REMITTANCE      1,200.00 CR\n"
        "2026-07-03  CARD SETTLEMENT          400.00 DR\n"
    )
    rows = parse_statement_lines(text)
    assert [r["direction"] for r in rows] == ["out", "in", "out"]
    assert rows[0]["amount"] == 25.0          # sign stripped, direction kept


def test_persian_statement_with_eastern_digits_and_jalali_dates():
    """Persian digits, the Persian thousands separator (٬), AND a Jalali date —
    ۱۴۰۵ is not the year 1405 CE, and filing it as such would put every movement
    six centuries in the past."""
    text = (
        "۱۴۰۵/۰۵/۰۳  خرید اینترنتی   ۲۵۰٬۰۰۰\n"
        "1405/05/04  واریز حقوق   ۵۰٬۰۰۰٬۰۰۰\n"
    )
    rows = parse_statement_lines(text)
    assert len(rows) == 2, "a Persian-digit statement must not be silently dropped"
    assert rows[0]["date"] == "2026-07-25"          # ۱۴۰۵/۰۵/۰۳ → Gregorian
    assert rows[0]["amount"] == 250000.0
    assert rows[0]["direction"] == "out" and "خرید" in rows[0]["description"]
    assert rows[1]["direction"] == "in" and rows[1]["amount"] == 50000000.0


def test_headers_footers_and_junk_are_skipped():
    text = """
    Page 1 of 3
    Statement period: 01/07/2026 - 31/07/2026
    01/07/2026  OPENING BALANCE                 10,000.00
    31/07/2026  CLOSING BALANCE                  9,400.00
    Total Debits: 600.00
    just a sentence with no date and no money
    12/07/2026  TRANSFER TO SAVINGS    600.00     9,400.00
    """
    rows = parse_statement_lines(text)
    assert len(rows) == 1 and rows[0]["description"].startswith("TRANSFER")


def test_parser_is_total_on_garbage():
    for junk in ("", None, "\x00\x01", "no dates here 1234", "2026-07-01"):
        assert parse_statement_lines(junk) == []


def test_date_formats():
    assert parse_date("2026-07-03 x 1.00") == dt.date(2026, 7, 3)
    assert parse_date("03/07/2026 x 1.00") == dt.date(2026, 7, 3)   # day-first
    assert parse_date("07/25/2026 x 1.00") == dt.date(2026, 7, 25)  # unambiguous → month-first
    assert parse_date("03-Jul-26 x 1.00") == dt.date(2026, 7, 3)
    assert parse_date("Jul 03, 2026 x 1.00") == dt.date(2026, 7, 3)
    assert parse_date("no date here") is None


# ── persistence: idempotent on content, not on the file ──────────────────────

@pytest.mark.asyncio
async def test_lines_persist_once_even_across_overlapping_statements(db_session):
    acc = FinancialAccount(user_id=None, name="acme ••4006", kind="bank",
                           currency="AED", balance=9400)
    db_session.add(acc)
    await db_session.flush()

    july = parse_statement_lines(
        "01/07/2026 POS COFFEE      20.00   9,980.00\n"
        "05/07/2026 ATM CASH       500.00   9,480.00\n",
        currency="AED",
    )
    first = await fs.record_statement_lines(db_session, acc, july)
    await db_session.commit()
    assert first == {"added": 2, "skipped": 0}

    # next month's statement repeats the last line and adds a new one
    august = parse_statement_lines(
        "05/07/2026 ATM CASH       500.00   9,480.00\n"
        "02/08/2026 SALARY       5,000.00  14,480.00\n",
        currency="AED",
    )
    second = await fs.record_statement_lines(db_session, acc, august)
    await db_session.commit()
    assert second == {"added": 1, "skipped": 1}   # the repeat was recognised

    txns = (await db_session.execute(select(Transaction))).scalars().all()
    assert len(txns) == 3
    kinds = sorted(t.transaction_type for t in txns)
    assert kinds == ["expense", "expense", "income"]
    salary = [t for t in txns if t.transaction_type == "income"][0]
    assert salary.occurred_on == dt.date(2026, 8, 2)
    assert float(salary.amount) == 5000.0 and salary.currency == "AED"


@pytest.mark.asyncio
async def test_line_ref_is_content_addressed(db_session):
    row = {"date": "2026-07-05", "amount": 500.0, "direction": "out", "description": "ATM CASH"}
    assert line_ref(7, row) == line_ref(7, dict(row))          # stable
    assert line_ref(7, row) != line_ref(8, row)                # per account
    assert line_ref(7, row) != line_ref(7, {**row, "amount": 501.0})


@pytest.mark.asyncio
async def test_movements_and_ledger_endpoint_show_the_lines(db_session):
    acc = FinancialAccount(user_id=None, name="acme ••4006", kind="bank",
                           currency="AED", balance=9480)
    db_session.add(acc)
    await db_session.flush()
    rows = parse_statement_lines("05/07/2026 ATM CASH 500.00 9,480.00\n", currency="AED")
    await fs.record_statement_lines(db_session, acc, rows)
    await db_session.commit()

    moves = await fs.account_movements(db_session, acc.id)
    assert moves and moves[0]["description"] == "ATM CASH"
    assert moves[0]["amount"] == 500.0 and moves[0]["date"] == "2026-07-05"


def test_ledger_endpoint(api_client):
    created = api_client.post("/api/finance/accounts",
                              json={"name": "دستی", "kind": "bank", "balance": 10,
                                    "currency": "AED"}).json()
    r = api_client.get(f"/api/finance/accounts/{created['id']}/transactions")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True and body["transactions"] == []
    assert body["account_name"] == "دستی"
    assert api_client.get("/api/finance/accounts/999999/transactions").status_code == 404
    # the list endpoint reports how many lines a card carries
    rows = api_client.get("/api/finance/accounts").json()
    assert rows and "txn_count" in rows[0]


# ── end to end: a statement file fills the card AND its ledger ───────────────

@pytest.mark.asyncio
async def test_statement_file_creates_card_and_its_line_items(db_session):
    """The whole point (owner, 2026-07-22): a statement must leave behind the
    movements, not just a closing balance — keyless, no manual click."""
    from app.services.ingest.universal_ingest import extract_from_file

    csv = (
        "Bank Statement\n"
        "Institution,mbankuae\n"
        "Account,ending in 4321\n"
        "Balance,AED 9480.00\n"
        "Date,Description,Amount,Balance\n"
        "01/07/2026,OPENING BALANCE,,10000.00\n"
        "03/07/2026,POS PURCHASE CARREFOUR,20.00,9980.00\n"
        "05/07/2026,ATM CASH WITHDRAWAL,500.00,9480.00\n"
    ).encode("utf-8")

    res = await extract_from_file(
        db_session, filename="statement.csv", mimetype="text/csv", data=csv,
        source_ref="gmail:mS:statement.csv", user_id=0, sender="alerts@mbankuae.com",
        occurred_iso="2026-07-06T00:00:00",
    )
    await db_session.commit()
    assert res["status"] == "proposed"
    assert res.get("statement_lines") == 2

    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    lines = (
        await db_session.execute(
            select(Transaction).where(Transaction.source_ref.like("line:%"))
        )
    ).scalars().all()
    assert {t.description for t in lines} == {"POS PURCHASE CARREFOUR", "ATM CASH WITHDRAWAL"}
    assert all(t.account_id == acc.id for t in lines)
    assert all(t.transaction_type == "expense" for t in lines)
    atm = [t for t in lines if t.description.startswith("ATM")][0]
    assert atm.occurred_on == dt.date(2026, 7, 5) and float(atm.amount) == 500.0

    # re-ingesting the SAME statement under a new ref adds no duplicate lines
    await extract_from_file(
        db_session, filename="statement.csv", mimetype="text/csv", data=csv,
        source_ref="gmail:mS2:statement.csv", user_id=0, sender="alerts@mbankuae.com",
        occurred_iso="2026-07-07T00:00:00",
    )
    await db_session.commit()
    again = (
        await db_session.execute(
            select(Transaction).where(Transaction.source_ref.like("line:%"))
        )
    ).scalars().all()
    assert len(again) == 2
