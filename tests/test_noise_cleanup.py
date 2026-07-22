"""Phase A — «اپ شده ماشینِ نویز»: value-filter the locked-file flood, batch the
digest, and reversibly purge test junk + boilerplate backlog."""
import pytest
from sqlalchemy import select

from app.models.inbox_item import InboxItem
from app.models.notification import Notification, NotificationType
from app.models.task import Task, TaskStatus
from app.services import cleanup_service
from app.services.ingest import email_ingest
from app.services.notification_service import NotificationService


def test_worthless_locked_classifier():
    worthless = [
        "Terms and Conditions.pdf", "Order Execution Policy.pdf",
        "Risk Disclosure.pdf", "Conflicts of Interest Policy.pdf",
        "Refer A Friend Program.pdf", "Privacy Notice.pdf",
    ]
    for f in worthless:
        assert email_ingest._is_worthless_locked(f) is True, f
    keep = [
        "006_____2776_020741257_20260721.pdf",  # bank statement filename
        "Account Statement June.pdf", "صورتحساب.pdf", "invoice_2026.pdf",
        "Statement of Terms.pdf",  # allow-list precedence
    ]
    for f in keep:
        assert email_ingest._is_worthless_locked(f) is False, f


def _pw_item(filename, status="pending"):
    return InboxItem(
        user_id=0, content=f"locked {filename}", source="attachment", status=status,
        suggested_type="password_request",
        suggestion={"source_ref": f"gmail:m:{filename}", "filename": filename},
    )


@pytest.mark.asyncio
async def test_dismiss_and_scan_locked_boilerplate(db_session):
    db_session.add_all([
        _pw_item("Terms and Conditions.pdf"),
        _pw_item("Risk Disclosure.pdf"),
        _pw_item("Account Statement.pdf"),  # genuine — must survive
    ])
    await db_session.commit()

    found = await cleanup_service.scan_locked_boilerplate(db_session, 0)
    assert {f["label"] for f in found} == {"Terms and Conditions.pdf", "Risk Disclosure.pdf"}

    res = await cleanup_service.dismiss_locked_boilerplate(db_session, 0)
    assert res["dismissed"] == 2
    pending = (
        await db_session.execute(
            select(InboxItem).where(InboxItem.status == "pending", InboxItem.suggested_type == "password_request")
        )
    ).scalars().all()
    assert [p.suggestion["filename"] for p in pending] == ["Account Statement.pdf"]


@pytest.mark.asyncio
async def test_propose_dedups_across_all_statuses(db_session):
    # A dismissed request for the same file must NOT be re-created on re-scan.
    db_session.add(_pw_item("x.pdf", status="dismissed"))
    await db_session.commit()
    created = await email_ingest._propose_password_request(
        db_session, sender="a@bank.com", filename="x.pdf",
        source_ref="gmail:m:x.pdf", user_id=0,
    )
    assert created is False


@pytest.mark.asyncio
async def test_auto_purge_exact_test_only(db_session):
    db_session.add_all([
        Task(user_id=0, title="test", status=TaskStatus.TODO),
        Task(user_id=0, title=" TEST ", status=TaskStatus.TODO),
        Task(user_id=0, title="my real test task", status=TaskStatus.TODO),  # keep
    ])
    await db_session.commit()
    removed = await cleanup_service.auto_purge_exact_test_junk(db_session, 0)
    assert removed["task"] == 2
    survivors = (
        await db_session.execute(select(Task).where(Task.status == TaskStatus.TODO))
    ).scalars().all()
    assert [t.title for t in survivors] == ["my real test task"]


@pytest.mark.asyncio
async def test_locked_digest_batches_and_cools_down(db_session, monkeypatch):
    sent = []

    async def _fake_notify(event, **kw):
        sent.append(kw.get("message"))
        return {"ok": True}

    import app.services.notification_service as ns
    monkeypatch.setattr(ns, "notify_event", _fake_notify)

    db_session.add_all([_pw_item("Statement1.pdf"), _pw_item("Statement2.pdf")])
    await db_session.commit()

    first = await email_ingest.notify_locked_digest(db_session, user_id=0)
    await db_session.commit()
    assert first["sent"] is True and first["pending"] == 2
    assert len(sent) == 1 and "۲" not in (sent[0] or "")  # one push; lists both files
    assert "Statement1.pdf" in sent[0] and "Statement2.pdf" in sent[0]

    # within cooldown → suppressed (still one push total)
    second = await email_ingest.notify_locked_digest(db_session, user_id=0)
    assert second["sent"] is False and second.get("reason") == "cooldown"
    assert len(sent) == 1


@pytest.mark.asyncio
async def test_mark_all_read(db_session):
    db_session.add_all([
        Notification(user_id=0, type=NotificationType.SYSTEM, title="a", message="a", is_read=False),
        Notification(user_id=0, type=NotificationType.SYSTEM, title="b", message="b", is_read=False),
        Notification(user_id=0, type=NotificationType.SYSTEM, title="c", message="c", is_read=True),
    ])
    await db_session.commit()
    n = await NotificationService(db_session).mark_all_read(0)
    assert n == 2
    unread = (
        await db_session.execute(select(Notification).where(Notification.is_read.is_(False)))
    ).scalars().all()
    assert unread == []
