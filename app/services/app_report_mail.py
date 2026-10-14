"""«📧 گزارشِ تور» — the page's rich HTML report (with inline chart images) sent to the owner by e-mail.

Owner 2026-10-14: «نتیجهٔ تور در حینِ کار از طریقِ اپشنِ داخلِ برنامه ایمیل شود — برای هر مسئله چطور شد، از کجا عبور
کرد، به کجا رفت … گزارشِ شکیل و دقیق؛ برای تورهای بعدی هم؛ و کارنامهٔ نقشهٔ ذهن با همهٔ نمودارها».

The page builds the report (it owns the data); the server only delivers it, exactly like app reminders:
recipient = NOTIFICATION_EMAIL_TO or the connected Google account; transport = Gmail as the connected
account (HTML + inline PNGs), else SMTP (plain text), else ``skipped_unconfigured`` — never a fake «sent».
At most DAILY_CAP reports per user/app per UTC day (the page coalesces events, so this is a safety net).
"""
from __future__ import annotations

import asyncio
import base64
import datetime as _dt
import logging
import os
import re
from typing import Any, Dict, List

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

DAILY_CAP = 30
MAX_IMAGES = 8
MAX_IMAGE_BYTES = 1_500_000
_SENT: Dict[tuple, int] = {}


def _decode_images(images: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out = []
    for im in (images or [])[:MAX_IMAGES]:
        cid = re.sub(r"[^A-Za-z0-9_.-]", "", str(im.get("cid") or ""))[:60]
        data = str(im.get("data") or "")
        if data.startswith("data:"):
            data = data.split(",", 1)[-1]
        try:
            raw = base64.b64decode(data, validate=False)
        except Exception:  # noqa: BLE001
            continue
        if not cid or not raw or len(raw) > MAX_IMAGE_BYTES or not raw.startswith(b"\x89PNG"):
            continue
        out.append({"cid": cid, "data": raw, "subtype": "png"})
    return out


async def recipient(db: AsyncSession) -> str:
    to = (os.environ.get("NOTIFICATION_EMAIL_TO") or "").strip()
    if to:
        return to
    try:
        from app.services import drive_settings_service as dss

        return (await dss.get_account_email(db)) or ""
    except Exception:  # noqa: BLE001
        return ""


async def send_report(db: AsyncSession, *, user_id, app: str, subject: str, text: str, html: str,
                      images: List[Dict[str, Any]] | None = None, sender=None) -> Dict[str, Any]:
    key = (user_id, app, _dt.datetime.utcnow().date().isoformat())
    if _SENT.get(key, 0) >= DAILY_CAP:
        return {"status": "capped", "cap": DAILY_CAP}
    to = await recipient(db)
    if not to:
        return {"status": "skipped_unconfigured"}
    imgs = _decode_images(images or [])
    if sender is not None:   # tests
        res = await sender(to, subject, text, html, imgs)
        if res.get("ok"):
            _SENT[key] = _SENT.get(key, 0) + 1
        return {"status": "sent" if res.get("ok") else "failed", "via": "test", "images": len(imgs)}
    gmail_err = None
    try:
        from app.services.google_sync.gmail_service import send_email_gmail

        res = await send_email_gmail(db, to, subject, text, html=html, images=imgs)
        if res.get("ok"):
            _SENT[key] = _SENT.get(key, 0) + 1
            return {"status": "sent", "via": "gmail", "images": len(imgs)}
        if res.get("error") != "not_connected":
            gmail_err = res.get("error") or "error"
    except Exception as exc:  # noqa: BLE001
        gmail_err = type(exc).__name__
        logger.warning("report gmail failed: %s", gmail_err)
    if (os.environ.get("SMTP_HOST") or "").strip():
        from app.services.notification_service import send_email

        ok = await asyncio.to_thread(send_email, to=to, subject=subject, body=text)
        if ok:
            _SENT[key] = _SENT.get(key, 0) + 1
        return {"status": "sent" if ok else "failed", "via": "smtp", "images": 0}
    return {"status": "failed" if gmail_err else "skipped_unconfigured", "error": gmail_err}
