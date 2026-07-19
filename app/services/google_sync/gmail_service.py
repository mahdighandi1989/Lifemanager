"""Gmail sync + send — REST (no discovery client), injectable fetcher.

Reads message METADATA + snippet only (subject/from/labels/snippet — full
bodies are never stored at rest). Sending uses the same token
(gmail.send) so «ایمیل برام بفرسته» needs no SMTP server.
"""
from __future__ import annotations

import base64
import logging
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_sync import PersonalEmail

logger = logging.getLogger(__name__)

GMAIL_API = "https://gmail.googleapis.com/gmail/v1"
_TIMEOUT = 25.0


async def _default_fetcher(
    method: str, url: str, headers: Dict[str, str], json_body: Optional[dict] = None
) -> Any:
    import httpx

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.request(method, url, headers=headers, json=json_body)
        resp.raise_for_status()
        return resp.json()


def _headers(access_token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}


async def get_access_token(db: AsyncSession) -> Optional[str]:
    """Resolve the shared Google connection → short-lived access token.
    None ⇒ not connected / refresh rejected (callers degrade)."""
    try:
        from app.services import drive_settings_service as dss
        from app.services.google_api_client import refresh_access_token

        refresh_token = await dss.resolve_refresh_token(db)
        if not refresh_token:
            return None
        return await refresh_access_token(refresh_token)
    except Exception as exc:
        logger.debug("google access token unavailable: %r", exc)
        return None


def _header_value(payload: dict, name: str) -> Optional[str]:
    for header in (payload or {}).get("headers", []) or []:
        if str(header.get("name", "")).lower() == name.lower():
            return header.get("value")
    return None


def normalize_message(raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    mid = (raw or {}).get("id")
    if not mid:
        return None
    payload = raw.get("payload") or {}
    received = None
    internal = raw.get("internalDate")
    if internal:
        try:
            received = datetime.fromtimestamp(int(internal) / 1000, tz=timezone.utc)
        except Exception:
            received = None
    labels = raw.get("labelIds") or []
    return {
        "id": str(mid)[:32],
        "thread_id": str(raw.get("threadId") or "")[:32] or None,
        "from_addr": (_header_value(payload, "From") or "")[:512] or None,
        "subject": _header_value(payload, "Subject"),
        "snippet": (raw.get("snippet") or "")[:2000] or None,
        "received_at": received,
        "is_unread": "UNREAD" in labels,
        "labels": labels,
    }


async def fetch_recent(
    access_token: str,
    max_results: int = 25,
    query: str = "newer_than:2d -category:promotions -category:social",
    fetcher: Optional[Callable] = None,
) -> List[Dict[str, Any]]:
    """List recent message ids then pull metadata per id. Raises on
    transport errors — sync_gmail wraps."""
    fetch = fetcher or _default_fetcher
    from urllib.parse import quote

    listing = await fetch(
        "GET",
        f"{GMAIL_API}/users/me/messages?maxResults={min(max(int(max_results), 1), 100)}"
        f"&q={quote(query)}",
        _headers(access_token),
    )
    ids = [m.get("id") for m in (listing or {}).get("messages", []) or [] if m.get("id")]
    out: List[Dict[str, Any]] = []
    for mid in ids:
        raw = await fetch(
            "GET",
            f"{GMAIL_API}/users/me/messages/{mid}?format=metadata"
            "&metadataHeaders=From&metadataHeaders=Subject",
            _headers(access_token),
        )
        normalized = normalize_message(raw)
        if normalized:
            out.append(normalized)
    return out


async def sync_gmail(
    db: AsyncSession,
    max_results: int = 25,
    fetcher: Optional[Callable] = None,
    access_token: Optional[str] = None,
) -> Dict[str, Any]:
    """Upsert recent messages into personal_emails. Never raises."""
    token = access_token or await get_access_token(db)
    if not token:
        return {"ok": False, "error": "not_connected", "fetched": 0, "new": 0}
    try:
        messages = await fetch_recent(token, max_results=max_results, fetcher=fetcher)
    except Exception as exc:
        msg = f"{type(exc).__name__}: {str(exc)[:200]}"
        logger.warning("gmail fetch failed: %s", msg)
        return {"ok": False, "error": msg, "fetched": 0, "new": 0}

    new_count = 0
    try:
        ids = [m["id"] for m in messages]
        existing = {
            row.id: row
            for row in (
                (await db.execute(select(PersonalEmail).where(PersonalEmail.id.in_(ids))))
                .scalars()
                .all()
            )
        }
        for m in messages:
            row = existing.get(m["id"])
            if row is None:
                db.add(PersonalEmail(**m))
                new_count += 1
            else:  # labels/unread flip on read — keep fresh
                row.is_unread = m["is_unread"]
                row.labels = m["labels"]
        await db.commit()
    except Exception as exc:
        await db.rollback()
        return {"ok": False, "error": f"db: {type(exc).__name__}", "fetched": len(messages), "new": 0}
    return {"ok": True, "fetched": len(messages), "new": new_count}


async def send_email_gmail(
    db: AsyncSession,
    to: str,
    subject: str,
    body: str,
    fetcher: Optional[Callable] = None,
    access_token: Optional[str] = None,
) -> Dict[str, Any]:
    """Send a plain-text email AS the connected account (gmail.send scope).
    Never raises."""
    token = access_token or await get_access_token(db)
    if not token:
        return {"ok": False, "error": "not_connected"}
    try:
        from email.message import EmailMessage

        msg = EmailMessage()
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        fetch = fetcher or _default_fetcher
        result = await fetch(
            "POST",
            f"{GMAIL_API}/users/me/messages/send",
            _headers(token),
            {"raw": raw},
        )
        return {"ok": True, "id": (result or {}).get("id")}
    except Exception as exc:
        msg_text = f"{type(exc).__name__}: {str(exc)[:200]}"
        logger.warning("gmail send failed: %s", msg_text)
        return {"ok": False, "error": msg_text}


async def probe(db: AsyncSession, fetcher: Optional[Callable] = None) -> Dict[str, Any]:
    """«بررسی اتصال جیمیل» — GET users/me/profile. Distinguishes
    not-connected from missing-scope (403 ⇒ reconnect needed)."""
    token = await get_access_token(db)
    if not token:
        return {
            "ok": False,
            "reason": "not_connected",
            "detail": "گوگل متصل نیست — در تنظیمات، «اتصال به گوگل» را بزن.",
        }
    fetch = fetcher or _default_fetcher
    try:
        data = await fetch("GET", f"{GMAIL_API}/users/me/profile", _headers(token))
        return {"ok": True, "email": (data or {}).get("emailAddress")}
    except Exception as exc:
        text = str(exc)
        if "403" in text or "insufficient" in text.lower():
            return {
                "ok": False,
                "reason": "missing_scope",
                "detail": "دسترسی جیمیل در اتصال فعلی نیست — یک بار «قطع اتصال» و دوباره «اتصال به گوگل» را بزن تا اجازهٔ جدید گرفته شود.",
            }
        return {"ok": False, "reason": "error", "detail": f"{type(exc).__name__}: {text[:150]}"}
