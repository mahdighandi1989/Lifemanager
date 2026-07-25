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


def _decode_b64url(data: str) -> str:
    try:
        return base64.urlsafe_b64decode(data + "===").decode("utf-8", "ignore")
    except Exception:
        return ""


def _collect_body(payload: dict) -> str:
    """Walk a Gmail payload tree; prefer text/plain, fall back to text/html
    (tags stripped). Returns the concatenated body text (possibly '')."""
    import re as _re

    plain: List[str] = []
    html: List[str] = []

    def walk(part):
        if not part:
            return
        mime = (part.get("mimeType") or "").lower()
        data = (part.get("body") or {}).get("data")
        if data:
            if mime == "text/plain":
                plain.append(_decode_b64url(data))
            elif mime == "text/html":
                html.append(_decode_b64url(data))
        for sub in part.get("parts") or []:
            walk(sub)

    walk(payload)
    text = "\n".join(plain).strip()
    if not text and html:
        text = _re.sub(r"<[^>]+>", " ", "\n".join(html))
        text = _re.sub(r"\s+", " ", text).strip()
    return text


async def fetch_message_body(
    db: AsyncSession, message_id: str, *, max_chars: int = 40000
) -> Optional[str]:
    """Fetch the FULL plaintext body of a message ON DEMAND (never stored — the
    metadata-only-at-rest invariant stands). Used to read a bank's password
    instructions. None when not connected / on any error (fail-open)."""
    token = await get_access_token(db)
    if not token:
        return None
    try:
        raw = await _default_fetcher(
            "GET", f"{GMAIL_API}/users/me/messages/{message_id}?format=full", _headers(token)
        )
    except Exception as exc:
        logger.debug("full body fetch failed (%s): %r", message_id, exc)
        return None
    payload = (raw or {}).get("payload") or {}
    body = _collect_body(payload)
    if not body:  # single-part messages carry the body at payload.body.data
        data = (payload.get("body") or {}).get("data")
        if data:
            body = _decode_b64url(data)
    return (body or "")[:max_chars] or None


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


async def fetch_history(
    access_token: str,
    *,
    query: str,
    max_messages: int = 800,
    fetcher: Optional[Callable] = None,
) -> List[Dict[str, Any]]:
    """Page through the WHOLE result set of a Gmail query, not just page one.

    The bug this exists to fix (owner, 2026-07-25: «چرا نرفته بقیه صورت‌حساب‌ها
    رو استخراج کنه»): ``fetch_recent`` asks for ``newer_than:2d`` with
    ``maxResults=25`` and reads a single page. So ``personal_emails`` only ever
    held the last two days — every statement older than that was never mirrored,
    and therefore could never be extracted no matter how often the backfill ran.
    The backfill was scanning a well that was refilled two days deep.

    Bounded by ``max_messages`` and by Gmail's own paging; never raises past the
    caller (``sync_gmail_history`` wraps).
    """
    from urllib.parse import quote

    fetch = fetcher or _default_fetcher
    out: List[Dict[str, Any]] = []
    page_token: Optional[str] = None
    seen: set = set()
    while len(out) < max_messages:
        url = (
            f"{GMAIL_API}/users/me/messages?maxResults=100&q={quote(query)}"
            + (f"&pageToken={quote(page_token)}" if page_token else "")
        )
        listing = await fetch("GET", url, _headers(access_token)) or {}
        ids = [m.get("id") for m in (listing.get("messages") or []) if m.get("id")]
        for mid in ids:
            if mid in seen or len(out) >= max_messages:
                continue
            seen.add(mid)
            raw = await fetch(
                "GET",
                f"{GMAIL_API}/users/me/messages/{mid}?format=metadata"
                "&metadataHeaders=From&metadataHeaders=Subject",
                _headers(access_token),
            )
            normalized = normalize_message(raw)
            if normalized:
                out.append(normalized)
        page_token = listing.get("nextPageToken")
        if not page_token or not ids:
            break
    return out


# The history sweep's queries. Statements arrive as attachments; the rest of the
# money trail (balance alerts, transfer confirmations) arrives as plain mail.
HISTORY_QUERIES = (
    "has:attachment newer_than:{months}m",
    "(statement OR balance OR transaction OR invoice OR receipt OR "
    "صورتحساب OR موجودی OR تراکنش OR واریز OR برداشت) newer_than:{months}m",
)


async def sync_gmail_history(
    db: AsyncSession,
    *,
    months: int = 24,
    max_messages: int = 800,
    fetcher: Optional[Callable] = None,
    access_token: Optional[str] = None,
) -> Dict[str, Any]:
    """Mirror the mailbox HISTORY (not just the last two days) into
    ``personal_emails`` so the attachment/finance extractors have something to
    work with. Idempotent: an already-mirrored message is left alone. Never
    raises."""
    token = access_token or await get_access_token(db)
    if not token:
        return {"ok": False, "error": "not_connected", "fetched": 0, "new": 0}

    months = max(1, min(int(months or 24), 120))
    max_messages = max(1, min(int(max_messages or 800), 5000))
    messages: List[Dict[str, Any]] = []
    seen: set = set()
    try:
        for template in HISTORY_QUERIES:
            if len(messages) >= max_messages:
                break
            batch = await fetch_history(
                token,
                query=template.format(months=months),
                max_messages=max_messages - len(messages),
                fetcher=fetcher,
            )
            for m in batch:
                if m["id"] not in seen:
                    seen.add(m["id"])
                    messages.append(m)
    except Exception as exc:
        diagnosis = diagnose_google_error(exc)
        logger.warning("gmail history sweep failed: %s", diagnosis)
        return {
            "ok": False, "error": diagnosis["detail"], "reason": diagnosis["reason"],
            "fetched": len(messages), "new": 0,
        }

    new_count = 0
    try:
        ids = [m["id"] for m in messages]
        existing = set()
        for i in range(0, len(ids), 400):  # keep the IN() clause sane
            chunk = ids[i:i + 400]
            existing |= set(
                (
                    await db.execute(
                        select(PersonalEmail.id).where(PersonalEmail.id.in_(chunk))
                    )
                ).scalars().all()
            )
        for m in messages:
            if m["id"] not in existing:
                db.add(PersonalEmail(**m))
                existing.add(m["id"])
                new_count += 1
        await db.commit()
    except Exception as exc:
        logger.warning("gmail history persist failed: %r", exc)
        await db.rollback()
        return {"ok": False, "error": "persist_failed", "fetched": len(messages), "new": 0}

    return {
        "ok": True, "fetched": len(messages), "new": new_count,
        "months": months, "max_messages": max_messages,
    }


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
        diagnosis = diagnose_google_error(exc)
        logger.warning("gmail fetch failed: %s", diagnosis)
        return {"ok": False, "error": diagnosis["detail"], "reason": diagnosis["reason"], "fetched": 0, "new": 0}

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
    html: Optional[str] = None,
) -> Dict[str, Any]:
    """Send an email AS the connected account (gmail.send scope). ``html``
    adds a rich alternative part (the plain body stays the fallback).
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
        if html:
            msg.add_alternative(html, subtype="html")
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


def diagnose_google_error(exc: Exception) -> Dict[str, str]:
    """Turn a Google API failure into the REAL reason + Persian remediation.
    A bare 403 is ambiguous: «API فعال نیست» و «scope داده نشده» درمان‌های
    کاملاً متفاوتی دارند — read the response body and say which."""
    body = ""
    response = getattr(exc, "response", None)
    if response is not None:
        try:
            body = response.text[:600]
        except Exception:
            body = ""
    combined = f"{exc} {body}"
    if (
        "accessNotConfigured" in combined
        or "SERVICE_DISABLED" in combined
        or "has not been used in project" in combined
        or "it is disabled" in combined
    ):
        return {
            "reason": "api_disabled",
            "detail": (
                "خودِ سرویس API در پروژهٔ Google Cloud فعال نیست (اجازهٔ تو مشکلی ندارد). "
                "در console.cloud.google.com → APIs & Services → Library، "
                "«Gmail API» و «Google Calendar API» را Enable کن و چند دقیقه بعد دوباره امتحان کن."
            ),
        }
    if (
        "ACCESS_TOKEN_SCOPE_INSUFFICIENT" in combined
        or "insufficientPermissions" in combined
        or "insufficient authentication scopes" in combined.lower()
        or "403" in str(exc)
    ):
        return {
            "reason": "missing_scope",
            "detail": (
                "توکن فعلی دسترسی این سرویس را ندارد — «قطع اتصال» و دوباره «اتصال به گوگل» بزن و "
                "در صفحهٔ گوگل حتماً تیک جیمیل/تقویم را (اگر چک‌باکس جدا دارد) بزن."
            ),
        }
    if "401" in str(exc) or "invalid_grant" in combined:
        return {
            "reason": "token_rejected",
            "detail": "گوگل توکن ذخیره‌شده را رد کرد — قطع اتصال و اتصال دوباره لازم است.",
        }
    return {"reason": "error", "detail": f"{type(exc).__name__}: {str(exc)[:120]} {body[:200]}".strip()}


async def probe(db: AsyncSession, fetcher: Optional[Callable] = None) -> Dict[str, Any]:
    """«بررسی اتصال جیمیل» — GET users/me/profile with a REASONED failure."""
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
        diagnosis = diagnose_google_error(exc)
        return {"ok": False, **diagnosis}


async def probe_calendar(db: AsyncSession, fetcher: Optional[Callable] = None) -> Dict[str, Any]:
    """«بررسی تقویم» — one-item events list with the same reasoned failure."""
    token = await get_access_token(db)
    if not token:
        return {"ok": False, "reason": "not_connected", "detail": "گوگل متصل نیست."}
    fetch = fetcher or _default_fetcher
    try:
        await fetch(
            "GET",
            "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1",
            _headers(token),
        )
        return {"ok": True}
    except Exception as exc:
        diagnosis = diagnose_google_error(exc)
        return {"ok": False, **diagnosis}
