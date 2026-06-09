"""Coverage for FAB share-sheet import (task 32ade384, steps 6/7).

Attachments #32/#33 capture the same First Abu Dhabi Bank account from
the OS share sheet. The import must normalise the IBAN/account number and
the Iranian phone, store the balance as a decimal with the symbol kept
separate, and be idempotent on IBAN so #33 does not duplicate #32.
"""
from __future__ import annotations

from decimal import Decimal


FAB_32 = {
    "account_holder": "MOHAMMAD MEHDI MAHMOUD GHANDI",
    "account_type": "Current Account",
    "account_number": "1611 0056 1018 5001",
    "iban": "AE60 0351 6110 0561 0185 001",
    "bank_name": "First Abu Dhabi Bank PJSC",
    "available_balance": "₿465.44",
    "currency_symbol": "₿",
    "contact_phone": "+98 919 786 8647",
    "contact_label": "Etekaf Ghandi",
}


def test_import_normalizes_and_stores_decimal(api_client):
    resp = api_client.post("/api/bank-accounts/import-share-sheet", json=FAB_32)
    assert resp.status_code == 201, resp.text
    body = resp.json()

    assert body["account_holder"] == "MOHAMMAD MEHDI MAHMOUD GHANDI"
    assert body["bank_name"] == "First Abu Dhabi Bank PJSC"
    # IBAN / account number spaces stripped.
    assert body["iban"] == "AE600351611005610185001"
    assert body["account_number"] == "1611005610185001"
    # Balance is a decimal (465.44), symbol kept separate.
    assert Decimal(str(body["available_balance"])) == Decimal("465.44")
    assert body["currency_symbol"] == "₿"
    # Phone normalised to E.164.
    assert body["contact_phone"] == "+989197868647"
    assert body["contact_label"] == "Etekaf Ghandi"


def test_import_is_idempotent_on_iban(api_client):
    first = api_client.post("/api/bank-accounts/import-share-sheet", json=FAB_32)
    assert first.status_code == 201, first.text
    first_id = first.json()["id"]

    # Attachment #33 — same account, different display details.
    fab_33 = dict(FAB_32)
    fab_33["account_type"] = "Current Account"
    second = api_client.post("/api/bank-accounts/import-share-sheet", json=fab_33)
    assert second.status_code == 201, second.text
    # Same row updated, not duplicated.
    assert second.json()["id"] == first_id

    listing = api_client.get("/api/bank-accounts/share-sheets").json()
    fab_rows = [r for r in listing if r["iban"] == "AE600351611005610185001"]
    assert len(fab_rows) == 1
