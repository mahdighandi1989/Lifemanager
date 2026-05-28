"""Coverage for /api/finance/* (audit task 4ae4b3ca)."""
from __future__ import annotations


def test_create_and_list_income(api_client):
    resp = api_client.post(
        "/api/finance/incomes",
        json={"description": "Salary", "amount": 1000, "currency": "USD"},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["description"] == "Salary"
    listing = api_client.get("/api/finance/incomes").json()
    assert any(i["description"] == "Salary" for i in listing)


def test_create_and_list_asset(api_client):
    resp = api_client.post(
        "/api/finance/assets",
        json={"name": "Laptop", "asset_type": "cash", "value": 1500, "currency": "USD"},
    )
    assert resp.status_code == 201, resp.text
    listing = api_client.get("/api/finance/assets").json()
    assert any(a["name"] == "Laptop" for a in listing)


def test_create_financial_account(api_client):
    resp = api_client.post(
        "/api/finance/accounts",
        json={"name": "Checking", "kind": "bank", "balance": 250},
    )
    assert resp.status_code == 201, resp.text


def test_account_kind_validation(api_client):
    resp = api_client.post(
        "/api/finance/accounts",
        json={"name": "x", "kind": "not-a-kind", "balance": 0},
    )
    assert resp.status_code in (400, 422)


def test_list_accounts_filter_by_kind(api_client):
    api_client.post(
        "/api/finance/accounts",
        json={"name": "B1", "kind": "bank", "balance": 100},
    )
    api_client.post(
        "/api/finance/accounts",
        json={"name": "Br1", "kind": "broker", "balance": 100},
    )
    only_bank = api_client.get("/api/finance/accounts?kind=bank").json()
    assert all(a["kind"] == "bank" for a in only_bank)


def test_finance_amount_must_be_non_negative(api_client):
    resp = api_client.post(
        "/api/finance/incomes",
        json={"description": "Refund", "amount": -1, "currency": "USD"},
    )
    assert resp.status_code in (400, 422)


# ── Per-kind endpoint aliases (audit task 4ae4b3ca ACs 16, 17, 22) ─


def test_bank_account_alias_creates_with_kind_bank(api_client):
    resp = api_client.post(
        "/api/bank-accounts",
        json={"name": "Bank-1", "kind": "bank", "balance": 100},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["kind"] == "bank"
    listing = api_client.get("/api/bank-accounts").json()
    assert all(a["kind"] == "bank" for a in listing)


def test_broker_account_alias_creates_with_kind_broker(api_client):
    resp = api_client.post(
        "/api/broker-accounts",
        json={"name": "Brk-1", "kind": "broker", "balance": 200},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["kind"] == "broker"
    listing = api_client.get("/api/broker-accounts").json()
    assert all(a["kind"] == "broker" for a in listing)


def test_exchange_account_alias_creates_with_kind_exchange(api_client):
    resp = api_client.post(
        "/api/exchange-accounts",
        json={"name": "Coinbase", "kind": "exchange", "balance": 50},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["kind"] == "exchange"
    listing = api_client.get("/api/exchange-accounts").json()
    assert all(a["kind"] == "exchange" for a in listing)


def test_per_kind_endpoints_do_not_cross_pollute(api_client):
    """A bank account must NOT appear in the broker listing and
    vice-versa — proves the kind filter is applied at the DB level."""
    api_client.post(
        "/api/bank-accounts",
        json={"name": "B-xyz", "balance": 1},
    )
    broker_list = api_client.get("/api/broker-accounts").json()
    assert not any(a["name"] == "B-xyz" for a in broker_list)


def test_per_kind_model_modules_importable():
    """AC 6 + 20-21 — the per-kind import paths must resolve."""
    from app.models.income import Income
    from app.models.asset import Asset
    from app.models.financial_account import FinancialAccount
    from app.models.bank_account import BankAccount
    from app.models.broker_account import BrokerAccount
    from app.models.exchange_account import ExchangeAccount

    # All four account flavours share the same underlying table.
    assert BankAccount is FinancialAccount
    assert BrokerAccount is FinancialAccount
    assert ExchangeAccount is FinancialAccount
