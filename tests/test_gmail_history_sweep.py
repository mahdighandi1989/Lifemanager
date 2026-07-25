"""چرا بقیهٔ صورت‌حساب‌ها استخراج نشده بود — the two-day well.

Owner (2026-07-25): «تا الان هم چیزایی که استخراج کرده بسیار محدود و قدیمیه و
نمیدونم چرا نرفته بقیه صورت حساب ها و کیف پول ها رو استخراج کنه.»

Root cause: ``fetch_recent`` asks Gmail for ``newer_than:2d`` with
``maxResults=25`` and reads ONE page, so ``personal_emails`` only ever held the
last two days. The backfill button then scanned up to 400 already-mirrored
emails — of a well that was only ever two days deep. Nothing older could be
extracted because nothing older was ever there.
"""
import json

import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount
from app.models.personal_sync import PersonalEmail
from app.services.google_sync import gmail_service


def _msg(mid, subject="Statement", frm="alerts@mbankuae.com"):
    """A Gmail metadata payload shaped like the real API's."""
    return {
        "id": mid,
        "threadId": f"t{mid}",
        "snippet": "your account ending in 4321 balance: AED 1,200.00",
        "labelIds": ["INBOX"],
        "internalDate": "1750000000000",
        "payload": {"headers": [
            {"name": "From", "value": frm},
            {"name": "Subject", "value": subject},
        ]},
    }


def _paged_fetcher(pages):
    """A fake Gmail transport: `pages` is a list of (ids, nextPageToken)."""
    state = {"i": 0}

    async def fetch(method, url, headers=None):
        if "/messages?" in url:
            # honour the pageToken the caller sends back
            idx = state["i"]
            ids, token = pages[idx] if idx < len(pages) else ([], None)
            state["i"] = idx + 1
            body = {"messages": [{"id": i} for i in ids]}
            if token:
                body["nextPageToken"] = token
            return body
        mid = url.split("/messages/")[1].split("?")[0]
        return _msg(mid)

    return fetch


@pytest.mark.asyncio
async def test_history_sweep_pages_past_the_first_page(db_session):
    """The old path read page one and stopped. The sweep follows nextPageToken."""
    fetcher = _paged_fetcher([
        (["a1", "a2"], "TOKEN2"),
        (["a3"], None),
        ([], None),          # the second query in HISTORY_QUERIES
    ])
    rows = await gmail_service.fetch_history(
        "tok", query="has:attachment newer_than:24m", max_messages=50, fetcher=fetcher
    )
    assert [r["id"] for r in rows] == ["a1", "a2", "a3"]


@pytest.mark.asyncio
async def test_history_sweep_mirrors_old_mail_the_2day_window_never_saw(db_session):
    fetcher = _paged_fetcher([(["old1", "old2"], None), ([], None)])
    res = await gmail_service.sync_gmail_history(
        db_session, months=24, max_messages=100, fetcher=fetcher, access_token="tok"
    )
    assert res["ok"] is True and res["new"] == 2

    ids = set((await db_session.execute(select(PersonalEmail.id))).scalars().all())
    assert {"old1", "old2"} <= ids

    # re-running mirrors nothing new (idempotent) — no duplicate rows
    again = await gmail_service.sync_gmail_history(
        db_session, months=24, max_messages=100,
        fetcher=_paged_fetcher([(["old1", "old2"], None), ([], None)]),
        access_token="tok",
    )
    assert again["ok"] is True and again["new"] == 0


@pytest.mark.asyncio
async def test_history_sweep_is_bounded(db_session):
    fetcher = _paged_fetcher([(["m1", "m2", "m3"], "T2"), (["m4", "m5"], None), ([], None)])
    rows = await gmail_service.fetch_history(
        "tok", query="q", max_messages=2, fetcher=fetcher
    )
    assert len(rows) == 2


@pytest.mark.asyncio
async def test_history_sweep_reports_not_connected_instead_of_zero(db_session):
    """A disconnected Google must not read as «۰ ایمیلِ تازه» — that is how the
    owner concluded the mailbox was empty when it was never asked."""
    res = await gmail_service.sync_gmail_history(db_session, months=6, access_token=None)
    assert res["ok"] is False and res["error"] == "not_connected"


def test_deep_sweep_endpoint_is_honest_when_google_is_off(api_client):
    r = api_client.post("/api/inbox/deep-sweep", json={"months": 12, "max_messages": 50})
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is False and body.get("error")     # says why, doesn't fake success
    assert body["months"] == 12


# ── the Excel archive is history, not a live account ─────────────────────────

@pytest.mark.asyncio
async def test_excel_archive_card_is_flagged_archived(db_session):
    """«اون فایل اکسل برای زمانی بود که من این سیستم رو نداشتم» — the rows stay
    (they are his real 2024 spending) but the card is filed as archive."""
    from app.services._personal_development_seed_data import PD_ACCOUNT_NAME
    from app.services.personal_development_seed import ensure_personal_development_seeded

    await ensure_personal_development_seeded(db_session)
    acc = (
        await db_session.execute(
            select(FinancialAccount).where(FinancialAccount.name == PD_ACCOUNT_NAME)
        )
    ).scalars().first()
    assert acc is not None, "the archive itself must never be deleted"
    assert json.loads(acc.extra or "{}").get("archived") is True

    from app.services.finance_email_scan_service import account_public_extra

    assert account_public_extra(acc)["archived"] is True


@pytest.mark.asyncio
async def test_legacy_archive_card_gets_flagged_on_next_boot(db_session):
    """A card seeded before the flag existed is marked on the next startup —
    no manual DB surgery."""
    from app.services._personal_development_seed_data import PD_ACCOUNT_NAME
    from app.services.personal_development_seed import ensure_personal_development_seeded

    db_session.add(FinancialAccount(name=PD_ACCOUNT_NAME, kind="bank",
                                    institution="آرشیو اکسل توسعه فردی",
                                    currency="AED", balance=0))
    await db_session.commit()

    res = await ensure_personal_development_seeded(db_session)
    assert res.get("archived_marked") == 1
    acc = (
        await db_session.execute(
            select(FinancialAccount).where(FinancialAccount.name == PD_ACCOUNT_NAME)
        )
    ).scalars().one()
    assert json.loads(acc.extra or "{}").get("archived") is True


def test_accounts_list_exposes_archived(api_client):
    api_client.post("/api/finance/accounts",
                    json={"name": "زنده", "kind": "bank", "balance": 5, "currency": "AED"})
    rows = api_client.get("/api/finance/accounts").json()
    assert rows and rows[0]["archived"] is False   # a manual card is never archive
