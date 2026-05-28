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
