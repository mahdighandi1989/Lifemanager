"""IMAP pull side of the finance auto-update pipeline (task 4ae4b3ca).

Covers app/services/finance_imap_service.py + the process_finance_updates gating.
The live IMAP connection itself needs operator credentials (external), so these
tests exercise the URL parsing, message-body extraction, and the no-op gating —
not a real mailbox.
"""
from __future__ import annotations

from email.message import EmailMessage


def test_parse_imap_url_ssl_and_plain():
    from app.services.finance_imap_service import parse_imap_url

    cfg = parse_imap_url("imaps://user%40x.com:p%40ss@imap.host.com:993/INBOX")
    assert cfg == {
        "host": "imap.host.com",
        "port": 993,
        "user": "user@x.com",      # url-decoded
        "password": "p@ss",        # url-decoded
        "mailbox": "INBOX",
        "ssl": True,
    }

    plain = parse_imap_url("imap://u:p@mail.local")
    assert plain["port"] == 143 and plain["ssl"] is False and plain["mailbox"] == "INBOX"


def test_parse_imap_url_rejects_bad_scheme():
    import pytest

    from app.services.finance_imap_service import parse_imap_url

    with pytest.raises(ValueError):
        parse_imap_url("https://nope.example.com")


def test_message_text_extracts_plain_body():
    from app.services.finance_imap_service import _message_text

    msg = EmailMessage()
    msg["Subject"] = "Balance alert"
    msg.set_content("Your balance is 1,234.56 USD")
    assert "1,234.56 USD" in _message_text(msg)


def test_process_finance_updates_noop_without_credentials(monkeypatch):
    monkeypatch.delenv("FINANCE_IMAP_URL", raising=False)
    monkeypatch.delenv("FINANCE_SMS_WEBHOOK", raising=False)

    from app.tasks import process_finance_updates

    result = process_finance_updates()
    assert result == {"checked_emails": 0, "checked_sms": 0, "balances_updated": 0}


def test_process_finance_updates_applies_pulled_emails(monkeypatch):
    """With FINANCE_IMAP_URL set, the task pulls bodies and feeds apply_bank_message."""
    monkeypatch.setenv("FINANCE_IMAP_URL", "imaps://u:p@host:993/INBOX")
    monkeypatch.setenv("FINANCE_INGEST_USER_ID", "7")

    import app.services.finance_imap_service as imap_svc

    monkeypatch.setattr(
        imap_svc, "fetch_unseen_email_bodies", lambda url, **kw: ["msg-a", "msg-b"]
    )

    applied = []

    async def fake_apply(db, *, user_id, channel, body, account_id=None):
        applied.append((user_id, channel, body))
        return {"balances_updated": 1}

    import app.services.finance_ingest_service as ingest_svc

    monkeypatch.setattr(ingest_svc, "apply_bank_message", fake_apply)

    from app.tasks import process_finance_updates

    result = process_finance_updates()
    assert result["checked_emails"] == 2
    assert result["balances_updated"] == 2
    assert [a[0] for a in applied] == [7, 7]  # routed to FINANCE_INGEST_USER_ID
    assert [a[1] for a in applied] == ["email", "email"]
