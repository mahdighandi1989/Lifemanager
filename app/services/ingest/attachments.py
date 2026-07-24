"""Gmail attachment fetching + PDF password handling for the universal ingest.

Emails are synced metadata-only; this pulls the actual attachment bytes ON
DEMAND (never stored) so the vision model can read a statement/document/scan.
``prepare_bytes`` decrypts a password-protected PDF when a password is known,
and flags ``needs_password`` when it isn't — the hook for the credential-request
flow. Never raises.
"""
from __future__ import annotations

import base64
import io
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

GMAIL_API = "https://gmail.googleapis.com/gmail/v1"
_MAX_BYTES = 10 * 1024 * 1024  # skip anything over 10 MB


def _walk_parts(part: Optional[dict], out: List[dict]) -> None:
    if not part:
        return
    filename = part.get("filename")
    body = part.get("body") or {}
    if filename and body.get("attachmentId"):
        out.append({
            "filename": filename,
            "mimetype": part.get("mimeType"),
            "attachmentId": body["attachmentId"],
            "size": int(body.get("size") or 0),
        })
    for sub in part.get("parts") or []:
        _walk_parts(sub, out)


async def fetch_email_attachments(db, message_id: str, *, max_files: int = 5) -> List[Dict[str, Any]]:
    """Return ``[{filename, mimetype, data: bytes}]`` for a Gmail message. Never
    raises — returns [] when not connected or on any error."""
    from app.services.google_sync import gmail_service

    token = await gmail_service.get_access_token(db)
    if not token:
        return []
    headers = gmail_service._headers(token)
    try:
        raw = await gmail_service._default_fetcher(
            "GET", f"{GMAIL_API}/users/me/messages/{message_id}?format=full", headers
        )
    except Exception as exc:
        logger.debug("attachment message fetch failed (%s): %r", message_id, exc)
        return []

    parts: List[dict] = []
    _walk_parts(raw.get("payload") or {}, parts)
    out: List[Dict[str, Any]] = []
    for p in parts[:max_files]:
        if p["size"] and p["size"] > _MAX_BYTES:
            continue
        try:
            att = await gmail_service._default_fetcher(
                "GET",
                f"{GMAIL_API}/users/me/messages/{message_id}/attachments/{p['attachmentId']}",
                headers,
            )
        except Exception as exc:
            logger.debug("attachment download failed: %r", exc)
            continue
        data_b64 = att.get("data")
        if not data_b64:
            continue
        try:
            data = base64.urlsafe_b64decode(data_b64 + "===")
        except Exception:
            continue
        if len(data) > _MAX_BYTES:
            continue
        out.append({"filename": p["filename"], "mimetype": p.get("mimetype"), "data": data})
    return out


def _is_pdf(data: bytes, mimetype: Optional[str]) -> bool:
    return (mimetype or "").lower().endswith("pdf") or data[:5] == b"%PDF-"


def prepare_bytes(
    data: bytes, mimetype: Optional[str], *, password: Optional[str] = None
) -> Tuple[Optional[bytes], bool]:
    """Return ``(ready_bytes, needs_password)``.

    A non-encrypted file passes through unchanged. An encrypted PDF is decrypted
    with ``password`` (re-serialised to plain bytes the vision model can read);
    if it's encrypted and the password is missing/wrong, returns
    ``(None, True)`` so the caller can ask the owner for it.
    """
    if not _is_pdf(data, mimetype):
        return data, False
    try:
        from pypdf import PdfReader, PdfWriter

        reader = PdfReader(io.BytesIO(data))
    except Exception as exc:
        # Not a parseable PDF at all (or a pypdf edge) — hand the raw bytes to
        # the model rather than blocking; it degrades gracefully on its own.
        logger.debug("pdf open skipped: %r", exc)
        return data, False
    try:
        if not reader.is_encrypted:
            return data, False
        if not password:
            return None, True
        if reader.decrypt(password) == 0:  # 0 ⇒ wrong password
            return None, True
    except Exception as exc:
        # Couldn't even determine encryption / decrypt threw → treat as still
        # locked, so a wrong password is never silently accepted and stored.
        logger.debug("pdf decrypt failed (still locked): %r", exc)
        return None, True
    # decrypt SUCCEEDED — now re-serialise to plain bytes; if that step throws,
    # the file is genuinely unlocked, so hand the original decrypted bytes on
    # (never report it as still-locked, which would re-ask a correct password).
    try:
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        buf = io.BytesIO()
        writer.write(buf)
        return buf.getvalue(), False
    except Exception as exc:
        logger.debug("pdf re-serialise skipped (already unlocked): %r", exc)
        return data, False
