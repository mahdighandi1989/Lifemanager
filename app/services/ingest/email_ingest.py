"""Orchestrate attachment ingest for an email, and the master backfill.

Per email: fetch its attachments, decrypt with any stored password for the
sender, extract → propose a review candidate. A locked file that is WORTH
unlocking (a real statement/invoice) with no known password raises a «فایلِ
رمزدار» request; broker legal BOILERPLATE (Terms/Policy/Disclosure/Refer-a-
Friend…) is skipped entirely — never a request, never a notification. And the
Telegram/notification is a SINGLE batched digest per cooldown window (owner:
«اپ شده ماشینِ نویز») — not one push per file. Idempotent + fail-open.
"""
from __future__ import annotations

import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ingest import credentials
from app.services.ingest.attachments import fetch_email_attachments
from app.services.ingest.universal_ingest import extract_from_file

logger = logging.getLogger(__name__)

# A file is "past the password" the moment it decrypts — extraction success is
# a SEPARATE concern. Treating «unlocked but AI-unreadable» as still-locked was
# the bug that re-asked the owner for files they had already unlocked.
_UNLOCKED = {"proposed", "unreadable", "duplicate"}


async def mark_source_resolved(db, source_ref: str) -> int:
    """Flip every pending password request for this file to «filed» — once a
    file is unlocked, its request must disappear so the digest never re-asks."""
    from app.models.inbox_item import InboxItem

    rows = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.status == "pending",
                InboxItem.suggested_type.in_(["password_request", "password_components"]),
            )
        )
    ).scalars().all()
    n = 0
    for r in rows:
        if (r.suggestion or {}).get("source_ref") == source_ref:
            r.status = "filed"
            n += 1
    return n


# ── locked-file value filter ────────────────────────────────────────────────
# A genuine statement/invoice is worth unlocking; broker legal boilerplate
# (Terms, Policy, Disclosure, Refer-a-Friend…) is pure noise — never ask a
# password for it. Allow-list precedence: a financial keyword overrides, so a
# real "Statement of Terms.pdf" still flows.
_FINANCIAL_RE = re.compile(
    r"(statement|invoice|receipt|contract.?note|confirmation|payslip|tax|"
    r"صورت.?حساب|فاکتور|رسید|بیلان|گزارش.?حساب|پرداخت|فیش)",
    re.I,
)
_BOILERPLATE_RE = re.compile(
    r"(terms|conditions|policy|policies|disclosure|disclaimer|agreement|"
    r"refer.?a.?friend|conflicts?.?of.?interest|privacy|kyc|cookie|"
    r"execution.?policy|risk.?disclosure|legal|gdpr|regulation|handbook|"
    r"guideline|قوانین|سیاست|افشا|حریم.?خصوصی)",
    re.I,
)

_DIGEST_STAMP_KEY = "ingest_locked_digest:last_at"
_DIGEST_COOLDOWN_S = int(os.environ.get("LOCKED_DIGEST_COOLDOWN_S", str(6 * 3600)) or 0)


def _is_worthless_locked(filename: str | None) -> bool:
    """True when a locked file isn't worth asking a password for (broker
    boilerplate). A financial keyword in the name overrides (allow-list wins)."""
    name = filename or ""
    if _FINANCIAL_RE.search(name):
        return False
    return bool(_BOILERPLATE_RE.search(name))


def _email_iso(em) -> "str | None":
    """ISO date of a PersonalEmail, or None — the statement date used to arm the
    finance staleness guard so an older statement can't overwrite a newer one."""
    recv = getattr(em, "received_at", None)
    if recv is None:
        return None
    try:
        return recv.isoformat()
    except Exception:
        return None


async def _propose_password_request(
    db, *, sender: str, filename: str, source_ref: str, user_id: int
) -> bool:
    """Create a «رمز لازم است» InboxItem once per source_ref — matched across
    ANY status (pending|filed|dismissed), so a dismissed/handled file never
    re-appears on a re-scan. Returns True only when a NEW row was created.
    Does NOT notify — the caller sends ONE batched digest for the whole run."""
    from app.models.inbox_item import InboxItem

    src_key = credentials.source_key_for(sender)
    existing = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.suggested_type.in_(["password_request", "password_components"])
            )
        )
    ).scalars().all()
    if any((r.suggestion or {}).get("source_ref") == source_ref for r in existing):
        return False
    db.add(
        InboxItem(
            user_id=user_id,
            content=f"🔒 فایلِ رمزدار «{filename}» از {src_key} — برای بازکردنش رمز لازم است.",
            source="attachment",
            status="pending",
            suggested_type="password_request",
            suggestion={"source_ref": source_ref, "filename": filename, "source_key": src_key},
            ai_model=None,
        )
    )
    return True


async def _propose_components_request(
    db, *, sender: str, filename: str, source_ref: str, domain: str,
    recipe: Dict[str, Any], missing: list, user_id: int,
) -> bool:
    """Smart request: instead of a blind «رمز بده» box, ask ONLY for the missing
    identity components the email says form the password (once per source_ref)."""
    from app.models.inbox_item import InboxItem

    existing = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.suggested_type.in_(["password_request", "password_components"])
            )
        )
    ).scalars().all()
    if any((r.suggestion or {}).get("source_ref") == source_ref for r in existing):
        return False
    labels = "، ".join(c.get("label") or c.get("key") for c in missing[:4])
    db.add(
        InboxItem(
            user_id=user_id,
            content=f"🔐 برای بازکردنِ «{filename}» از {domain} این‌ها لازم است: {labels}",
            source="attachment",
            status="pending",
            suggested_type="password_components",
            suggestion={
                "source_ref": source_ref,
                "filename": filename,
                "source_key": domain,
                "template": recipe.get("template"),
                "notes": recipe.get("notes"),
                "missing": missing,
            },
            ai_model=None,
        )
    )
    return True


async def _resolve_locked_file(
    db, *, mid: str, att: Dict[str, Any], source_ref: str, sender: str, user_id: int
) -> str:
    """Try to open a locked VALUABLE file smartly: recipe (stored, else read
    from the email BODY) → derive from stored identity facts → open silently.
    Missing facts → a «password_components» request (ask only what's needed).
    No recipe → today's plain «password_request». Returns
    opened|components|request|dup|error. Never raises."""
    from app.services.ingest import identity_facts, password_recipe

    domain = credentials.source_key_for(sender)
    try:
        recipe = await password_recipe.get_stored_recipe(db, domain=domain)
        if not (recipe and recipe.get("has_recipe")):
            from app.services.google_sync.gmail_service import fetch_message_body

            body = await fetch_message_body(db, mid)
            fresh = await password_recipe.extract_recipe(db, body, sender)
            # Only cache a POSITIVE recipe — caching «has_recipe:false» used to
            # poison the domain permanently so the real statement email was
            # never re-inspected (complaint B). A negative just retries next time.
            if fresh and fresh.get("has_recipe"):
                recipe = fresh
                await password_recipe.store_recipe(db, domain=domain, recipe=recipe)

        if recipe and recipe.get("has_recipe") and recipe.get("template"):
            comps = recipe.get("components") or []
            values = await identity_facts.get_many(db, keys=[c["key"] for c in comps], user_id=user_id)
            missing = [c for c in comps if not values.get(c["key"])]
            if not missing:
                pw = password_recipe.derive_password(recipe["template"], values)
                res = await extract_from_file(
                    db, filename=att["filename"], mimetype=att.get("mimetype"),
                    data=att["data"], source_ref=source_ref, user_id=user_id,
                    password=pw, sender=sender,
                )
                if res.get("status") in _UNLOCKED:
                    await credentials.store_password(db, source_key=domain, password=pw)
                    await mark_source_resolved(db, source_ref)
                    return "opened"
                # derived password wrong (recipe/format misread) → fall through to ask
            elif await _propose_components_request(
                db, sender=sender, filename=att["filename"], source_ref=source_ref,
                domain=domain, recipe=recipe, missing=missing, user_id=user_id,
            ):
                return "components"
            else:
                return "dup"

        if await _propose_password_request(
            db, sender=sender, filename=att["filename"], source_ref=source_ref, user_id=user_id
        ):
            return "request"
        return "dup"
    except Exception as exc:
        logger.debug("locked resolve failed (%s): %r", source_ref, exc)
        return "error"


async def notify_locked_digest(db: AsyncSession, *, user_id: int = 0) -> Dict[str, Any]:
    """Send ONE «فایل‌های رمزدار» digest (in-app + Telegram) covering ALL pending
    locked files, at most once per cooldown window. The files still land in the
    inbox; only the push is coalesced. Never raises. The caller commits."""
    from app.models.global_setting import GlobalSetting
    from app.models.inbox_item import InboxItem

    try:
        pend = (
            await db.execute(
                select(InboxItem).where(
                    InboxItem.status == "pending",
                    InboxItem.suggested_type.in_(["password_request", "password_components"]),
                )
            )
        ).scalars().all()
        n = len(pend)
        if n == 0:
            return {"sent": False, "pending": 0}

        # Durable cooldown — an in-process timer would reset on every Render
        # free-tier restart (see experiences/periodic-attention-engine…).
        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _DIGEST_STAMP_KEY))
        ).scalar_one_or_none()
        now = datetime.now(timezone.utc)
        if row and row.value:
            try:
                last = datetime.fromisoformat(row.value)
                if last.tzinfo is None:
                    last = last.replace(tzinfo=timezone.utc)
                if (now - last).total_seconds() < _DIGEST_COOLDOWN_S:
                    return {"sent": False, "pending": n, "reason": "cooldown"}
            except Exception:
                pass

        names = [(p.suggestion or {}).get("filename") or "?" for p in pend[:8]]
        more = f"\nو {n - 8} مورد دیگر" if n > 8 else ""
        message = (
            f"{n} فایلِ رمزدار منتظرِ رمز است:\n"
            + "\n".join(f"• {nm}" for nm in names)
            + more
            + "\nدر داشبورد → صندوق ورودی رمزشان را وارد کن."
        )
        try:
            from app.services.notification_service import notify_event

            uid = int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or 0) or user_id
            await notify_event(
                "attention_alert",
                user_id=uid,
                db=db,
                title="🔒 فایل‌های رمزدار",
                message=message,
                priority="high",
            )
        except Exception as exc:
            logger.debug("locked digest notify failed: %r", exc)

        if row is None:
            db.add(GlobalSetting(key=_DIGEST_STAMP_KEY, value=now.isoformat()))
        else:
            row.value = now.isoformat()
        return {"sent": True, "pending": n}
    except Exception as exc:
        logger.debug("locked digest skipped: %r", exc)
        return {"sent": False, "pending": 0}


async def ingest_email_attachments(db: AsyncSession, email, *, user_id: int = 0) -> Dict[str, int]:
    """Fetch + extract this email's attachments. Never raises. Only CREATES
    InboxItems — the batched digest is sent by the caller (batch-level)."""
    empty = {"proposed": 0, "needs_password": 0, "skipped_boilerplate": 0, "new_locked": 0}
    mid = getattr(email, "id", None)
    if not mid:
        return dict(empty)
    try:
        atts = await fetch_email_attachments(db, mid)
    except Exception as exc:
        logger.debug("attachment fetch failed (%s): %r", mid, exc)
        return dict(empty)

    sender = getattr(email, "from_addr", "") or ""
    occurred_iso = None
    _recv = getattr(email, "received_at", None)
    if _recv is not None:
        try:
            occurred_iso = _recv.isoformat()
        except Exception:
            occurred_iso = None
    src_key = credentials.source_key_for(sender)
    pw = await credentials.get_password(db, source_key=src_key)

    proposed = needs = skipped = new_locked = 0
    for att in atts:
        source_ref = f"gmail:{mid}:{att['filename']}"
        res = await extract_from_file(
            db,
            filename=att["filename"],
            mimetype=att.get("mimetype"),
            data=att["data"],
            source_ref=source_ref,
            user_id=user_id,
            password=pw,
            sender=sender,
            occurred_iso=occurred_iso,
        )
        st = res.get("status")
        if st in ("proposed", "unreadable"):
            proposed += 1
            # a stored domain password just opened this file → clear any stale
            # request so the digest never re-asks (complaint A).
            await mark_source_resolved(db, source_ref)
        elif st == "needs_password":
            if _is_worthless_locked(att["filename"]):
                skipped += 1
                continue
            outcome = await _resolve_locked_file(
                db, mid=mid, att=att, source_ref=source_ref, sender=sender, user_id=user_id
            )
            if outcome == "opened":
                proposed += 1  # derived the password + extracted, no prompt needed
            elif outcome in ("request", "components"):
                needs += 1
                new_locked += 1
    return {
        "proposed": proposed,
        "needs_password": needs,
        "skipped_boilerplate": skipped,
        "new_locked": new_locked,
    }


async def retry_source_ref(db: AsyncSession, *, source_ref: str, user_id: int = 0) -> Dict[str, Any]:
    """Re-open a file now that its password is stored (source_ref = gmail:mid:name)."""
    from app.models.personal_sync import PersonalEmail

    try:
        _, mid, filename = source_ref.split(":", 2)
    except ValueError:
        return {"status": "bad_ref"}
    atts = await fetch_email_attachments(db, mid)
    em = await db.get(PersonalEmail, mid)
    sender = getattr(em, "from_addr", "") if em else ""
    occurred_iso = _email_iso(em)
    pw = await credentials.get_password(db, source_key=credentials.source_key_for(sender))
    for att in atts:
        if att["filename"] == filename:
            res = await extract_from_file(
                db, filename=filename, mimetype=att.get("mimetype"), data=att["data"],
                source_ref=source_ref, user_id=user_id, password=pw, sender=sender,
                occurred_iso=occurred_iso,
            )
            if res.get("status") in _UNLOCKED:
                await mark_source_resolved(db, source_ref)
            await db.commit()
            return res
    return {"status": "not_found"}


async def try_open(db: AsyncSession, *, source_ref: str, password: str, user_id: int = 0) -> Dict[str, Any]:
    """Verify a CANDIDATE password actually decrypts THIS file (via prepare_bytes,
    the authoritative test) BEFORE anything is stored — so a wrong/typo password
    can no longer poison the whole domain's credential slot nor force-file the
    request. On success runs the full extract (which also feeds «مالی») and
    resolves the request. Returns ``{unlocked: bool, ...extract result}``."""
    from app.models.personal_sync import PersonalEmail
    from app.services.ingest.attachments import prepare_bytes

    try:
        _, mid, filename = source_ref.split(":", 2)
    except ValueError:
        return {"unlocked": False, "status": "bad_ref"}
    atts = await fetch_email_attachments(db, mid)
    em = await db.get(PersonalEmail, mid)
    sender = getattr(em, "from_addr", "") if em else ""
    occurred_iso = _email_iso(em)
    for att in atts:
        if att["filename"] != filename:
            continue
        _ready, needs_pw = prepare_bytes(att["data"], att.get("mimetype"), password=password)
        if needs_pw:
            return {"unlocked": False, "status": "needs_password"}
        res = await extract_from_file(
            db, filename=filename, mimetype=att.get("mimetype"), data=att["data"],
            source_ref=source_ref, user_id=user_id, password=password, sender=sender,
            occurred_iso=occurred_iso,
        )
        await mark_source_resolved(db, source_ref)
        return {"unlocked": True, **res}
    return {"unlocked": False, "status": "not_found"}


async def retry_domain(db: AsyncSession, *, source_key: str, user_id: int = 0) -> Dict[str, Any]:
    """Once a password/credentials exist for a sender DOMAIN, re-open EVERY
    pending locked file from that domain — one password unlocks the whole bank
    (owner: «برای هر فایل جدا رمز نخواه»). Marks each opened item filed."""
    from app.models.inbox_item import InboxItem

    rows = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.status == "pending",
                InboxItem.suggested_type.in_(["password_request", "password_components"]),
            )
        )
    ).scalars().all()
    opened = 0
    tried = 0
    for r in rows:
        sug = r.suggestion or {}
        if sug.get("source_key") != source_key:
            continue
        ref = sug.get("source_ref")
        if not ref:
            continue
        tried += 1
        try:
            res = await retry_source_ref(db, source_ref=ref, user_id=user_id)
        except Exception as exc:
            logger.debug("retry_domain re-open failed (%s): %r", ref, exc)
            continue
        # File the request when the file UNLOCKED — not only when the AI could
        # also read it. Decrypt-ok-but-unreadable used to stay pending and get
        # re-asked forever (complaint A).
        if res.get("status") in _UNLOCKED:
            r.status = "filed"
            if res.get("status") != "duplicate":
                opened += 1
    await db.commit()
    return {"tried": tried, "opened": opened}


async def upgrade_pending_locked(db: AsyncSession, *, user_id: int = 0, limit: int = 60) -> Dict[str, Any]:
    """Upgrade OLD blind «رمز بده» requests to the smart flow: read each item's
    email body, and if it explains how the password is formed, convert the item
    to a «password_components» request (ask card+DOB instead of a raw password).
    Idempotent; bounded; never raises."""
    from app.models.inbox_item import InboxItem
    from app.services.google_sync.gmail_service import fetch_message_body
    from app.services.ingest import identity_facts, password_recipe

    rows = (
        await db.execute(
            select(InboxItem)
            .where(InboxItem.status == "pending", InboxItem.suggested_type == "password_request")
            .limit(limit)
        )
    ).scalars().all()
    upgraded = 0
    for r in rows:
        sug = r.suggestion or {}
        domain = sug.get("source_key")
        ref = sug.get("source_ref") or ""
        try:
            _, mid, _ = ref.split(":", 2)
        except ValueError:
            continue
        try:
            recipe = await password_recipe.get_stored_recipe(db, domain=domain)
            if not (recipe and recipe.get("has_recipe")):
                body = await fetch_message_body(db, mid)
                fresh = await password_recipe.extract_recipe(db, body, domain)
                if fresh and fresh.get("has_recipe"):  # cache only positives
                    recipe = fresh
                    await password_recipe.store_recipe(db, domain=domain, recipe=recipe)
            if not (recipe and recipe.get("has_recipe") and recipe.get("template")):
                continue
            comps = recipe.get("components") or []
            values = await identity_facts.get_many(db, keys=[c["key"] for c in comps], user_id=user_id)
            missing = [c for c in comps if not values.get(c["key"])]
            r.suggested_type = "password_components"
            r.suggestion = {
                **sug, "template": recipe.get("template"),
                "notes": recipe.get("notes"), "missing": missing,
            }
            upgraded += 1
        except Exception as exc:
            logger.debug("locked upgrade skipped (%s): %r", ref, exc)
            continue
    await db.commit()
    return {"upgraded": upgraded}


async def backfill_attachments(db: AsyncSession, *, user_id: int = 0, limit: int = 400) -> Dict[str, Any]:
    """Run attachment ingest over already-synced emails (catch-up for the
    backlog). Bounded by ``limit`` since each email may hit the network. Sends
    ONE locked-file digest at the end, not one per file."""
    from app.models.personal_sync import PersonalEmail

    # Oldest-first (mirror scan_finance_emails) so that when several monthly
    # statements from one account are backfilled, the NEWEST is applied LAST and
    # wins the balance — newest-first would let an older statement overwrite it.
    rows = (
        await db.execute(
            select(PersonalEmail).order_by(PersonalEmail.received_at.asc().nullsfirst()).limit(limit)
        )
    ).scalars().all()
    proposed = needs = scanned = skipped = 0
    for em in rows:
        scanned += 1
        r = await ingest_email_attachments(db, em, user_id=user_id)
        proposed += r["proposed"]
        needs += r["needs_password"]
        skipped += r.get("skipped_boilerplate", 0)
    await db.commit()
    await notify_locked_digest(db, user_id=user_id)
    await db.commit()
    return {
        "scanned": scanned,
        "proposed": proposed,
        "needs_password": needs,
        "skipped_boilerplate": skipped,
    }
