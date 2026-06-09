"""Coverage for /api/neteller/wallet (task 32ade384, step 13).

Stores the Neteller wallet dashboard snapshot (attachment #39) — name,
loyalty points, decimal balance + currency, dashboard URL — and reads it
back. There is no account-number field (not shown in the source).
"""
from __future__ import annotations

from decimal import Decimal

from app.models.neteller_wallet import NetellerWalletSnapshot


NETELLER_SAMPLE = {
    "account_holder_name": "Mohammad mehdi Ghandi",
    "loyalty_points": 2873,
    "balance": "2000.88",
    "currency": "AED",
    "dashboard_url": "https://member.neteller.com/wallet/ng/dashboard",
    "menu_items": [
        "HOME", "ADD MONEY", "MONEY OUT", "TRANSFER",
        "EXCHANGE", "CRYPTO", "SPORTS", "ANALYTICS", "HISTORY",
    ],
}


def test_create_and_read_neteller_snapshot(api_client):
    resp = api_client.post("/api/neteller/wallet", json=NETELLER_SAMPLE)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["account_holder_name"] == "Mohammad mehdi Ghandi"
    assert body["loyalty_points"] == 2873
    assert Decimal(str(body["balance"])) == Decimal("2000.88")
    assert body["currency"] == "AED"
    assert body["dashboard_url"] == "https://member.neteller.com/wallet/ng/dashboard"
    assert "HOME" in body["menu_items"]

    latest = api_client.get("/api/neteller/wallet").json()
    assert latest["account_holder_name"] == "Mohammad mehdi Ghandi"
    assert Decimal(str(latest["balance"])) == Decimal("2000.88")


def test_model_has_no_account_number_field():
    # Account number was not shown in #39 → no fabricated column.
    assert not hasattr(NetellerWalletSnapshot, "account_number")


def test_get_returns_404_when_empty(api_client):
    assert api_client.get("/api/neteller/wallet").status_code == 404
