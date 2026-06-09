"""Coverage for /api/rta/dashboard (task 32ade384, step 12).

Stores the Dubai RTA app dashboard (attachment #38) — Salik account +
balance, parking balance, fines summary — and reads it back. Balances are
decimals, not strings.
"""
from __future__ import annotations

from decimal import Decimal


RTA_SAMPLE = {
    "user_name": "Mohammadmehdi",
    "salik_account_number": "33352163",
    "salik_balance": "7.00",
    "parking_balance": "0",
    "fines_payable": 0,
    "fines_non_payable": 0,
    "black_points": 0,
    "currency_symbol": "₿",
}


def test_create_and_read_rta_dashboard(api_client):
    resp = api_client.post("/api/rta/dashboard", json=RTA_SAMPLE)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["user_name"] == "Mohammadmehdi"
    assert body["salik_account_number"] == "33352163"
    assert Decimal(str(body["salik_balance"])) == Decimal("7.00")

    latest = api_client.get("/api/rta/dashboard").json()
    assert latest["salik_account_number"] == "33352163"
    assert Decimal(str(latest["salik_balance"])) == Decimal("7.00")


def test_get_returns_404_when_empty(api_client):
    assert api_client.get("/api/rta/dashboard").status_code == 404
