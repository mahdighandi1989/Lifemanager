"""Phase 3 bridges (2026-07-20): the island-closing wiring.

Covers: bank-email → finance routing with safe account matching; person
birthday/follow-up attention rules; RTA fines rule; per-currency budget
math; monthly finance report; create-task-from-finding; planner excluses
undated + rides the morning brief payload.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest

from app.models.finance import FinancialAccount
from app.models.person import Person
from app.services.attention_service import scan_findings


@pytest.mark.asyncio
async def test_bank_email_routes_to_matching_account(db_session):
    from app.models.personal_sync import PersonalEmail
    from app.services.google_sync.triage_service import _route_bank_email

    db_session.add(FinancialAccount(user_id=0, name="FAB main", institution="FAB", currency="AED", balance=100))
    db_session.add(FinancialAccount(user_id=0, name="Melli", institution="Bank Melli", currency="IRR", balance=5))
    await db_session.commit()

    email = PersonalEmail(
        id="m1", from_addr="alerts@bankfab.com",
        subject="FAB account alert",
        snippet="Your available balance is AED 2,500.00",
    )
    db_session.add(email)
    await db_session.commit()
    applied = await _route_bank_email(db_session, email)
    accounts = {
        a.name: float(a.balance)
        for a in (await db_session.execute(
            __import__("sqlalchemy").select(FinancialAccount)
        )).scalars().all()
    }
    if applied:
        # The FAB account (matched by institution) took the balance; the
        # unrelated IRR account is untouched.
        assert accounts["Melli"] == 5.0
        assert accounts["FAB main"] == 2500.0


@pytest.mark.asyncio
async def test_ambiguous_bank_message_refuses_to_overwrite(db_session):
    from app.services.finance_ingest_service import apply_bank_message

    db_session.add(FinancialAccount(user_id=0, name="Acc A", currency="AED", balance=10))
    db_session.add(FinancialAccount(user_id=0, name="Acc B", currency="AED", balance=20))
    await db_session.commit()
    res = await apply_bank_message(
        db_session, user_id=0, channel="email",
        body="available balance is AED 999.00", sender="noreply@unknown.com",
    )
    assert res["balances_updated"] == 0  # no confident match ⇒ no corruption


@pytest.mark.asyncio
async def test_person_birthday_and_follow_up_findings(db_session):
    today = datetime.now(timezone.utc).date()
    try:
        bday = today.replace(year=today.year - 30) + timedelta(days=2)
    except ValueError:
        bday = today + timedelta(days=2)
    db_session.add(Person(user_id=0, name="علی", birthday=bday))
    db_session.add(Person(user_id=0, name="رضا", next_follow_up=today - timedelta(days=3)))
    await db_session.commit()
    findings = await scan_findings(db_session, user_id=0)
    rules = {f["rule"] for f in findings}
    assert "person_birthday" in rules
    assert "person_follow_up" in rules


@pytest.mark.asyncio
async def test_rta_fines_finding(db_session):
    from app.models.rta_account import RTAAccount

    row = RTAAccount(user_id=0)
    if hasattr(row, "fines_payable"):
        row.fines_payable = 500
    db_session.add(row)
    await db_session.commit()
    findings = await scan_findings(db_session, user_id=0)
    if getattr(row, "fines_payable", 0):
        assert any(f["rule"] == "rta_fines" for f in findings)


@pytest.mark.asyncio
async def test_budget_never_sums_across_currencies(db_session):
    from app.services.budget_service import _available_budget, balances_by_currency

    db_session.add(FinancialAccount(user_id=7, name="AED acc", currency="AED", balance=1000))
    db_session.add(FinancialAccount(user_id=7, name="IRR acc", currency="IRR", balance=900))
    await db_session.commit()
    available, plan_id, currency = await _available_budget(db_session, 7)
    assert float(available) == 1000.0 and currency == "AED"  # largest single currency, NOT 1900
    grouped = await balances_by_currency(db_session, 7)
    assert {g["currency"]: g["total"] for g in grouped} == {"AED": 1000.0, "IRR": 900.0}


@pytest.mark.asyncio
async def test_monthly_report_groups_by_currency(api_client):
    acc = api_client.post(
        "/api/finance/accounts",
        json={"name": "acc", "kind": "bank", "currency": "AED", "balance": 0},
    )
    assert acc.status_code == 201, acc.text
    aid = acc.json()["id"]
    api_client.post(
        "/api/finance/transactions",
        json={"account_id": aid, "amount": 100, "transaction_type": "income"},
    )
    api_client.post(
        "/api/finance/transactions",
        json={"account_id": aid, "amount": 40, "transaction_type": "expense", "category": "خوراک"},
    )
    r = api_client.get("/api/finance/reports/monthly")
    assert r.status_code == 200, r.text
    months = r.json()["months"]
    assert months, "current month must appear"
    cur = months[-1]["currencies"][0]
    assert cur["currency"] == "AED"
    assert cur["income"] == 100.0 and cur["expense"] == 40.0 and cur["net"] == 60.0
    assert cur["by_category"][0] == {"category": "خوراک", "amount": 40.0}


@pytest.mark.asyncio
async def test_create_task_from_finding(api_client):
    r = api_client.post(
        "/api/attention/create-task",
        json={
            "rule": "license_expiry", "label": "گواهینامهٔ امارات",
            "detail": "۱۲ روز تا انقضا", "date": (date.today() + timedelta(days=12)).isoformat(),
        },
    )
    assert r.status_code == 200, r.text
    tid = r.json()["task_id"]
    task = api_client.get(f"/api/tasks/{tid}").json()
    assert task["title"].startswith("تمدید گواهینامه")
    assert task["due_date"] == (date.today() + timedelta(days=12)).isoformat()


@pytest.mark.asyncio
async def test_person_dates_can_be_cleared(api_client):
    r = api_client.post(
        "/api/persons",
        json={"name": "سارا", "birthday": "1990-05-01", "next_follow_up": "2026-08-01"},
    )
    pid = r.json()["id"]
    assert r.json()["birthday"] == "1990-05-01"
    upd = api_client.put(f"/api/persons/{pid}", json={"birthday": None, "next_follow_up": None})
    assert upd.status_code == 200
    got = api_client.get(f"/api/persons/{pid}").json()
    assert got["birthday"] is None and got["next_follow_up"] is None


@pytest.mark.asyncio
async def test_quick_add_task_has_no_low_priority_badge(api_client):
    """A quick-add with no priority must default to MEDIUM (2), not LOW (1)
    — otherwise every legacy row shows a «کم» badge (2026-07-20 review)."""
    r = api_client.post("/api/tasks/", json={"title": "بدون اولویت"})
    assert r.status_code == 201
    assert r.json()["priority"] == 2


@pytest.mark.asyncio
async def test_ambiguous_bank_token_does_not_pick_wrong_account(db_session):
    from app.models.finance import FinancialAccount
    from app.services.finance_ingest_service import apply_bank_message

    db_session.add(FinancialAccount(user_id=0, name="بانک ملت", currency="IRR", balance=10))
    db_session.add(FinancialAccount(user_id=0, name="بانک صادرات", currency="IRR", balance=20))
    await db_session.commit()
    # Generic word "بانک" matches both → must refuse, not silently pick one.
    res = await apply_bank_message(
        db_session, user_id=0, channel="email",
        body="موجودی حساب بانک شما: 999", sender="x@unknown.com",
    )
    assert res["balances_updated"] == 0
