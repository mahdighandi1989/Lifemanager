"""Phase C — «خریدهایم را تحلیل کن»: receipts feed the ledger; the report
aggregates income/expense/profit-loss per currency; the periodic job notifies
only on change."""
import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.services import inbox_service
from app.services.finance_report_service import build_report, summarize_current_month


@pytest.mark.asyncio
async def test_receipt_files_as_expense_transaction(db_session):
    created = await inbox_service._file_as_transaction(
        db_session,
        {"provider": "Carrefour", "amount": "86.16", "currency": "AED",
         "date": "2026-07-21", "category": "خواربار", "source_ref": "gmail:m1:receipt.pdf"},
        0,
    )
    await db_session.commit()
    assert created["kind"] == "transaction"
    txn = (await db_session.execute(select(Transaction))).scalars().first()
    assert float(txn.amount) == 86.16
    assert txn.transaction_type == "expense"
    assert txn.currency == "AED"
    assert str(txn.occurred_on) == "2026-07-21"
    # a per-currency cash account was created
    acct = (await db_session.execute(select(FinancialAccount))).scalars().first()
    assert "نقدی/رسیدها" in acct.name and acct.currency == "AED"


@pytest.mark.asyncio
async def test_receipt_dedups_on_source_ref(db_session):
    payload = {"provider": "X", "amount": "10", "currency": "AED", "source_ref": "gmail:m2:a.pdf"}
    await inbox_service._file_as_transaction(db_session, dict(payload), 0)
    await db_session.commit()
    await inbox_service._file_as_transaction(db_session, dict(payload), 0)
    await db_session.commit()
    txns = (await db_session.execute(select(Transaction))).scalars().all()
    assert len(txns) == 1  # re-approval did NOT double-post


@pytest.mark.asyncio
async def test_report_buckets_by_occurred_on_and_currency(db_session):
    acct = FinancialAccount(user_id=0, name="cash", kind="bank", currency="USD", balance=0)
    db_session.add(acct)
    await db_session.flush()
    # a receipt in AED against a USD account, dated in the current month
    import datetime as dt
    today = dt.date.today()
    db_session.add(Transaction(
        account_id=acct.id, amount=200, transaction_type="expense",
        currency="AED", occurred_on=today, category="خوراک", source_ref="r1",
    ))
    db_session.add(Transaction(
        account_id=acct.id, amount=500, transaction_type="income",
        currency="AED", occurred_on=today, source_ref="r2",
    ))
    await db_session.commit()

    report = await build_report(db_session, user_id=0, months=2)
    latest = report[-1]
    aed = [c for c in latest["currencies"] if c["currency"] == "AED"][0]
    assert aed["income"] == 500 and aed["expense"] == 200 and aed["net"] == 300
    summary = summarize_current_month(report)
    assert "سود" in summary["lines"][0] and summary["signature"]


@pytest.mark.asyncio
async def test_finance_analysis_job_dedups(db_session, monkeypatch):
    from app.services import jobs_engine

    sent = []

    async def _fake_notify(event, **kw):
        sent.append(kw.get("message"))
        return {"ok": True}

    import app.services.notification_service as ns
    monkeypatch.setattr(ns, "notify_event", _fake_notify)

    acct = FinancialAccount(user_id=0, name="cash", kind="bank", currency="AED", balance=0)
    db_session.add(acct)
    await db_session.flush()
    import datetime as dt
    db_session.add(Transaction(
        account_id=acct.id, amount=100, transaction_type="expense",
        currency="AED", occurred_on=dt.date.today(), source_ref="r1",
    ))
    await db_session.commit()

    first = await jobs_engine._job_finance_analysis(db_session)
    assert first["notified"] is True and len(sent) == 1
    # unchanged → no second notification
    second = await jobs_engine._job_finance_analysis(db_session)
    assert second["notified"] is False and second["reason"] == "unchanged"
    assert len(sent) == 1
