"""Finance transactions + budget + SMS + periodic refresh (task 4ae4b3ca).

Covers the gaps on top of the existing Income/Asset/FinancialAccount surface:
Transaction + BudgetPlan models (AC 2-3), POST/GET /api/finance/transactions
with balance update (AC 7), SmsListenerService (AC 10), and the 30-min
process_finance_updates Celery task (AC 11).
"""
from __future__ import annotations

import pytest


# ── Models (AC 2, 3) ─────────────────────────────────────────────────

def test_transaction_model_fields():
    from app.models.finance import Transaction

    cols = set(Transaction.__table__.columns.keys())
    assert {"account_id", "amount", "transaction_type", "description", "timestamp"} <= cols


def test_budget_plan_model_fields():
    from app.models.finance import BudgetPlan

    cols = set(BudgetPlan.__table__.columns.keys())
    assert {"user_id", "total_budget", "remaining_budget", "period"} <= cols


# ── POST/GET /api/finance/transactions + balance update (AC 7) ───────

def _make_account(api_client, *, balance=100, kind="bank"):
    resp = api_client.post(
        "/api/finance/accounts",
        json={"name": "Acct", "kind": kind, "currency": "USD", "balance": balance},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def test_transaction_income_credits_balance(api_client):
    acct_id = _make_account(api_client, balance=100)
    resp = api_client.post(
        "/api/finance/transactions",
        json={"account_id": acct_id, "amount": 50, "transaction_type": "income"},
    )
    assert resp.status_code == 201, resp.text
    accounts = api_client.get("/api/finance/accounts").json()
    bal = next(float(a["balance"]) for a in accounts if a["id"] == acct_id)
    assert bal == 150.0


def test_transaction_expense_debits_balance(api_client):
    acct_id = _make_account(api_client, balance=100)
    resp = api_client.post(
        "/api/finance/transactions",
        json={"account_id": acct_id, "amount": 30, "transaction_type": "expense"},
    )
    assert resp.status_code == 201, resp.text
    accounts = api_client.get("/api/finance/accounts").json()
    bal = next(float(a["balance"]) for a in accounts if a["id"] == acct_id)
    assert bal == 70.0


def test_transaction_unknown_account_404(api_client):
    resp = api_client.post(
        "/api/finance/transactions",
        json={"account_id": 999999, "amount": 10, "transaction_type": "expense"},
    )
    assert resp.status_code == 404


def test_list_transactions_returns_created(api_client):
    acct_id = _make_account(api_client)
    api_client.post(
        "/api/finance/transactions",
        json={"account_id": acct_id, "amount": 5, "transaction_type": "expense",
              "description": "coffee"},
    )
    rows = api_client.get("/api/finance/transactions").json()
    assert any(r["account_id"] == acct_id and r["description"] == "coffee" for r in rows)


# ── SmsListenerService (AC 10) ───────────────────────────────────────

def test_sms_listener_parses_persian_balance():
    from app.services.sms_listener_service import parse_sms

    parsed = parse_sms("بانك ملت: موجودی: 12,500,000 ریال")
    assert parsed.balance == 12_500_000.0
    # 2026-07-30: the currency comes back CANONICAL (IRR) so the finance
    # engine's cross-currency guard compares like with like.
    assert parsed.currency in ("ریال", "RIAL", "IRR")


def test_sms_listener_parses_withdrawal_direction():
    from app.services.sms_listener_service import parse_sms

    parsed = parse_sms("برداشت 1,200,000 از حساب شما")
    assert parsed.amount == 1_200_000.0
    assert parsed.direction == "debit"


def test_sms_listener_empty_body():
    from app.services.sms_listener_service import parse_sms

    parsed = parse_sms("")
    assert parsed.balance is None and parsed.amount is None


# ── Periodic finance refresh task (AC 11) ────────────────────────────

def test_process_finance_updates_task_registered_and_scheduled():
    import app.tasks  # noqa: F401 — importing runs the @celery_app.task decorator
    from app.celery_app import celery_app

    assert "app.tasks.process_finance_updates" in celery_app.tasks
    schedule = celery_app.conf.beat_schedule
    assert any(
        entry["task"] == "app.tasks.process_finance_updates"
        for entry in schedule.values()
    )


def test_process_finance_updates_runs_noop_without_source():
    from app.tasks import process_finance_updates

    result = process_finance_updates.run()
    assert result["balances_updated"] == 0


# ── Budget-aware purchase evaluation (AC 12) ─────────────────────────

@pytest.mark.asyncio
async def test_evaluate_purchase_affordable(db_session):
    from app.models.finance import FinancialAccount
    from app.services.budget_service import evaluate_purchase

    db_session.add(FinancialAccount(user_id=0, name="A", kind="bank", currency="USD", balance=1000))
    await db_session.commit()

    out = await evaluate_purchase(db_session, user_id=0, amount=100)
    assert out["affordable"] is True
    assert out["priority"] in ("high", "normal", "low")
    assert out["notified"] is False


@pytest.mark.asyncio
async def test_evaluate_purchase_over_budget_notifies(db_session):
    from sqlalchemy import select

    from app.models.finance import FinancialAccount
    from app.models.notification import Notification
    from app.services.budget_service import evaluate_purchase

    db_session.add(FinancialAccount(user_id=0, name="A", kind="bank", currency="USD", balance=50))
    await db_session.commit()

    out = await evaluate_purchase(db_session, user_id=0, amount=500, label="laptop")
    assert out["affordable"] is False
    assert out["priority"] == "blocked"
    assert out["notified"] is True

    rows = (
        await db_session.execute(
            select(Notification).where(Notification.priority == "high")
        )
    ).scalars().all()
    assert len(rows) >= 1


def test_budget_evaluate_endpoint(api_client):
    api_client.post(
        "/api/finance/accounts",
        json={"name": "A", "kind": "bank", "currency": "USD", "balance": 200},
    )
    r = api_client.post(
        "/api/finance/budget/evaluate", json={"amount": 50, "label": "book"}
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["affordable"] is True
    assert "priority" in body and "available_budget" in body


# ── Finance data reaches the AI analysis context (AC 13) ─────────────

@pytest.mark.asyncio
async def test_user_data_context_includes_financial_accounts(db_session):
    from app.models.finance import FinancialAccount
    from app.services.ai.ai_data_access_service import get_user_data_context

    db_session.add(
        FinancialAccount(user_id=0, name="Acct", kind="bank", currency="USD", balance=500)
    )
    await db_session.commit()

    ctx = await get_user_data_context(db_session, user_id=0)
    assert "financial_accounts" in ctx
    assert any(
        a["name"] == "Acct" and a["balance"] == 500.0
        for a in ctx["financial_accounts"]
    )
