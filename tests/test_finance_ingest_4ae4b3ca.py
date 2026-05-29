"""Auto balance update from bank email/SMS + affordable-task reminder (task 4ae4b3ca).

The raw memo: connect to email/SMS so bank/exchange messages auto-update balances
"تا نیاز نباشه دستی وارد بکنم", and remind me of purchases I can now afford. The
parsers existed but nothing applied them and the reminder was never called. These
pin the now-wired apply path + reminder.
"""
from __future__ import annotations


def _make_account(api_client, balance=100, kind="bank"):
    r = api_client.post(
        "/api/finance/accounts",
        json={"name": "Mellat", "kind": kind, "balance": balance, "currency": "USD"},
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_ingest_email_updates_balance(api_client):
    acct = _make_account(api_client, balance=100)
    r = api_client.post(
        "/api/finance/ingest-message",
        json={"channel": "email", "body": "Hello, your account Balance: $5000 now.", "account_id": acct},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["matched"] is True
    assert body["balances_updated"] == 1
    assert body["balance"] == 5000.0

    # the account reflects the new balance
    accounts = api_client.get("/api/finance/accounts").json()
    updated = next(a for a in accounts if a["id"] == acct)
    assert float(updated["balance"]) == 5000.0


def test_ingest_records_transaction(api_client):
    acct = _make_account(api_client, balance=0)
    api_client.post(
        "/api/finance/ingest-message",
        json={"channel": "sms", "body": "موجودی: 2000 USD", "account_id": acct},
    )
    txns = api_client.get("/api/finance/transactions", params={"account_id": acct}).json()
    assert txns and any(float(t["amount"]) == 2000.0 for t in txns)


def test_ingest_no_match_is_noop(api_client):
    acct = _make_account(api_client, balance=100)
    r = api_client.post(
        "/api/finance/ingest-message",
        json={"channel": "email", "body": "no numbers here", "account_id": acct},
    )
    assert r.status_code == 200
    assert r.json()["balances_updated"] == 0


def test_affordable_tasks_endpoint(api_client):
    r = api_client.get("/api/finance/affordable-tasks")
    assert r.status_code == 200
    assert "affordable_task_ids" in r.json()
