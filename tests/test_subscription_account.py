"""Coverage for /api/subscriptions/* (task 32ade384).

Exercises storing and reading back the verbatim Netflix account data
from attachment #27, and asserts the privacy invariants: only the last
4 digits of the card are accepted, and the inferred name/birth-year are
flagged as inferred (not confirmed identity).
"""
from __future__ import annotations


NETFLIX_SAMPLE = {
    "provider": "netflix.com",
    "account_email": "mohamad.mahdi1988@gmail.com",
    "mobile_phone": "058 247 1367",
    "member_since": "December 2019",
    "plan": "Standard plan",
    "next_payment_date": "June 25, 2026",
    "payment_method_brand": "Mastercard",
    "payment_card_last4": "9091",
    "inferred_name_from_email": "mohamad.mahdi",
    "inferred_birth_year_from_email": 1988,
    "is_inferred_identity": True,
}


def test_create_and_read_subscription_account(api_client):
    resp = api_client.post("/api/subscriptions", json=NETFLIX_SAMPLE)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["account_email"] == "mohamad.mahdi1988@gmail.com"
    assert body["plan"] == "Standard plan"
    assert body["payment_card_last4"] == "9091"
    # Inferred identity must stay flagged.
    assert body["is_inferred_identity"] is True
    assert body["inferred_birth_year_from_email"] == 1988

    listing = api_client.get("/api/subscriptions").json()
    assert any(
        s["account_email"] == "mohamad.mahdi1988@gmail.com"
        and s["payment_card_last4"] == "9091"
        for s in listing
    )


def test_card_last4_rejects_full_pan(api_client):
    """A full PAN must never be accepted — the field caps at 4 chars."""
    payload = dict(NETFLIX_SAMPLE)
    payload["payment_card_last4"] = "5500000000009091"
    resp = api_client.post("/api/subscriptions", json=payload)
    assert resp.status_code in (400, 422), resp.text
