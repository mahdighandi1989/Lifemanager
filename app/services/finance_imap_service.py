"""IMAP pull side of the finance auto-update pipeline (audit task 4ae4b3ca).

The apply path (parse → update balance → record Transaction → affordable-task
reminder) was already fully in-repo via ``finance_ingest_service.apply_bank_message``
and the ``POST /api/finance/ingest-message`` webhook. The one missing in-repo
piece was the *pull*: a poller that fetches new bank/exchange emails and feeds
them through that apply path. This module is that poller, built on the stdlib
``imaplib`` (no new dependency).

It stays dormant until the operator sets ``FINANCE_IMAP_URL`` (the credential
dependency that only the owner can supply — see TO-DO/task-4ae4b3ca). Format:

    FINANCE_IMAP_URL=imaps://user:password@imap.host.com:993/INBOX

``imaps://`` (or port 993) selects SSL; the mailbox path defaults to ``INBOX``.
Fetched messages are marked ``\\Seen`` so each is applied at most once.
"""
from __future__ import annotations

import logging
from typing import List, Optional
from urllib.parse import unquote, urlparse

logger = logging.getLogger("app.finance.imap")


def parse_imap_url(url: str) -> dict:
    """Parse ``imap(s)://user:pass@host:port/MAILBOX`` into a config dict."""
    p = urlparse(url)
    if p.scheme not in ("imap", "imaps"):
        raise ValueError(f"unsupported scheme {p.scheme!r} (use imap:// or imaps://)")
    use_ssl = p.scheme == "imaps" or p.port == 993
    return {
        "host": p.hostname or "",
        "port": p.port or (993 if use_ssl else 143),
        "user": unquote(p.username) if p.username else "",
        "password": unquote(p.password) if p.password else "",
        "mailbox": (p.path or "/INBOX").lstrip("/") or "INBOX",
        "ssl": use_ssl,
    }


def _message_text(msg) -> str:
    """Best-effort plain-text body of an :class:`email.message.Message`."""
    if msg.is_multipart():
        parts = []
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and not part.get_filename():
                payload = part.get_payload(decode=True)
                if payload:
                    parts.append(payload.decode(part.get_content_charset() or "utf-8", "ignore"))
        if parts:
            return "\n".join(parts)
        # fall back to the first text/html stripped-ish
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode(part.get_content_charset() or "utf-8", "ignore")
        return ""
    payload = msg.get_payload(decode=True)
    if payload:
        return payload.decode(msg.get_content_charset() or "utf-8", "ignore")
    return msg.get_payload() or ""


def fetch_unseen_email_bodies(url: str, *, limit: int = 50) -> List[str]:
    """Connect, pull UNSEEN messages, mark them \\Seen, return their text bodies.

    Best-effort: any connection/protocol error logs and returns ``[]`` so the
    scheduled task never crashes on a transient mailbox issue.
    """
    import email
    import imaplib

    cfg = parse_imap_url(url)
    bodies: List[str] = []
    client: Optional[object] = None
    try:
        client = (
            imaplib.IMAP4_SSL(cfg["host"], cfg["port"])
            if cfg["ssl"]
            else imaplib.IMAP4(cfg["host"], cfg["port"])
        )
        client.login(cfg["user"], cfg["password"])
        client.select(cfg["mailbox"])
        typ, data = client.search(None, "UNSEEN")
        if typ != "OK" or not data or not data[0]:
            return []
        ids = data[0].split()[:limit]
        for mid in ids:
            typ, msg_data = client.fetch(mid, "(RFC822)")
            if typ != "OK" or not msg_data or not msg_data[0]:
                continue
            msg = email.message_from_bytes(msg_data[0][1])
            bodies.append(_message_text(msg))
            client.store(mid, "+FLAGS", "\\Seen")
        return bodies
    except Exception as exc:  # transient mailbox / auth error → skip this tick
        logger.warning("finance IMAP fetch failed: %r", exc)
        return bodies
    finally:
        try:
            if client is not None:
                client.logout()
        except Exception:
            pass
