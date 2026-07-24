"""Attachment pipeline — deterministic extraction, password lifecycle, and
finance self-feed from statements. Owner's complaints (2026-07-22):
  A) re-asks the password for files already unlocked
  B) can't determine what a password needs
  C) unlocked statements don't create/update finance cards
  D) seems incapable of handling any attachment type
"""
import io
import zipfile

import openpyxl
import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount, Transaction
from app.services.ingest import password_recipe as pr
from app.services.ingest import text_extract as tx
from app.services.ingest.attachments import prepare_bytes


# ── D: deterministic extraction of real attachment types (no AI) ─────────────

def _xlsx_bytes(rows):
    wb = openpyxl.Workbook()
    ws = wb.active
    for r in rows:
        ws.append(r)
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def _docx_bytes(paragraphs):
    body = "".join(f"<w:p><w:r><w:t>{p}</w:t></w:r></w:p>" for p in paragraphs)
    doc = (
        '<?xml version="1.0"?><w:document xmlns:w="x"><w:body>'
        + body + "</w:body></w:document>"
    )
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("word/document.xml", doc)
    return buf.getvalue()


def test_extract_text_all_types_keyless():
    xlsx = _xlsx_bytes([["Bank", "mbankuae"], ["Balance", "USD 1,234.56"], ["Account", "ending 4321"]])
    t = tx.extract_text(xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "s.xlsx")
    assert "mbankuae" in t and "1,234.56" in t

    csv = b"Bank,Balance,Account\nmbankuae,USD 1234.56,ending 4321\n"
    assert "mbankuae" in tx.extract_text(csv, "text/csv", "s.csv")

    docx = _docx_bytes(["Bank statement from mbankuae", "Balance: USD 999"])
    assert "mbankuae" in tx.extract_text(docx, None, "s.docx")

    assert tx.extract_text(b"", None, "x") == ""
    # a bare image gets no deterministic text → falls to the vision path
    assert tx.extract_text(b"\x89PNG\r\n", "image/png", "p.png") == ""


def test_parse_finance_fields_from_statement_text():
    # with an IBAN present, IBAN is the strongest identity (drives account_no)
    f = tx.parse_finance_fields(
        "Bank: mbankuae\nBalance: USD 1,234.56\nIBAN AE070331234567890123456"
    )
    assert f is not None
    assert f["balance"] == 1234.56 and f["currency"] == "USD"
    assert f["iban"] == "AE070331234567890123456"
    # without an IBAN, the last-4 becomes the account ref
    f2 = tx.parse_finance_fields("Bank: mbankuae\nAccount ending in 4321\nBalance: AED 500")
    assert f2["account_no"] == "••4321" and f2["currency"] == "AED"
    # a non-financial doc yields None (won't be mis-fed to finance)
    assert tx.parse_finance_fields("Dear friend, see you at the party on Friday.") is None


# ── encrypted-PDF decryption (the unlock half) ───────────────────────────────

def _encrypted_pdf(password):
    from pypdf import PdfWriter

    w = PdfWriter()
    w.add_blank_page(width=200, height=200)
    w.encrypt(password)
    buf = io.BytesIO()
    w.write(buf)
    return buf.getvalue()


def test_prepare_bytes_decrypts_only_with_right_password():
    enc = _encrypted_pdf("secret")
    ready, needs = prepare_bytes(enc, "application/pdf", password="secret")
    assert needs is False and ready and ready[:5] == b"%PDF-"
    # wrong / missing password → needs_password (never a silent pass-through)
    assert prepare_bytes(enc, "application/pdf", password="WRONG") == (None, True)
    assert prepare_bytes(enc, "application/pdf", password=None) == (None, True)


# ── B: deterministic password-recipe parser (keyless) ────────────────────────

def test_deterministic_recipe_en_fa_and_negative():
    en = pr.deterministic_recipe(
        "The password is the last 4 digits of your card followed by your date of birth."
    )
    assert en["has_recipe"] and en["template"] == "{card_last4}{dob}"

    fa = pr.deterministic_recipe("رمزِ فایل: چهار رقم آخر کارت و بعد تاریخ تولد شما")
    assert fa["has_recipe"] and "card_last4" in fa["template"] and "dob" in fa["template"]

    # a generic email (no password context) → no spurious recipe
    assert pr.deterministic_recipe("Your statement is attached.")["has_recipe"] is False


# ── C: a statement self-feeds «مالی» (shared identity engine) ────────────────

@pytest.mark.asyncio
async def test_apply_account_signal_create_update_dedup(db_session):
    from app.services import finance_email_scan_service as fs

    # create a card from an attachment signal
    r1 = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4321",
        balance=1000, currency="USD", kind="bank", source="attachment",
        source_ref="gmail:m1:stmt.pdf", occurred_iso="2026-07-01T00:00:00",
    )
    await db_session.commit()
    assert r1["created"] == 1
    acc = (await db_session.execute(select(FinancialAccount))).scalars().one()
    assert float(acc.balance) == 1000.0

    # a NEWER statement for the SAME account (same ref) → update, not a new card
    r2 = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4321",
        balance=1500, currency="USD", kind="bank", source="attachment",
        source_ref="gmail:m2:stmt.pdf", occurred_iso="2026-07-05T00:00:00",
    )
    await db_session.commit()
    assert r2["updated"] == 1
    accs = (await db_session.execute(select(FinancialAccount))).scalars().all()
    assert len(accs) == 1 and float(accs[0].balance) == 1500.0

    # re-applying the SAME source_ref is a clean no-op (idempotent)
    r3 = await fs.apply_account_signal(
        db_session, 0, institution="mbankuae", account_ref="••4321",
        balance=1500, currency="USD", source="attachment",
        source_ref="gmail:m2:stmt.pdf", occurred_iso="2026-07-05T00:00:00",
    )
    assert r3["created"] == 0 and r3["updated"] == 0
    txns = (await db_session.execute(select(Transaction))).scalars().all()
    assert len(txns) == 2  # one per distinct statement, none duplicated


@pytest.mark.asyncio
async def test_extract_from_file_feeds_finance_keyless(db_session):
    """A CSV bank statement, no AI configured: deterministic extraction still
    proposes a review candidate AND auto-creates the finance card."""
    from app.models.inbox_item import InboxItem
    from app.services.ingest.universal_ingest import extract_from_file

    csv = (
        b"Bank Statement\n"
        b"Institution,mbankuae\n"
        b"Account,ending in 4321\n"
        b"Balance,USD 2500.00\n"
    )
    res = await extract_from_file(
        db_session, filename="statement.csv", mimetype="text/csv", data=csv,
        source_ref="gmail:mX:statement.csv", user_id=0, sender="alerts@mbankuae.com",
    )
    await db_session.commit()
    assert res["status"] == "proposed"
    # a finance card was created automatically (no manual «file» click)
    acc = (await db_session.execute(select(FinancialAccount))).scalars().first()
    assert acc is not None and acc.institution == "mbankuae"
    assert float(acc.balance) == 2500.0
    # and a review candidate exists too
    items = (await db_session.execute(select(InboxItem))).scalars().all()
    assert any((i.suggestion or {}).get("source_ref") == "gmail:mX:statement.csv" for i in items)


@pytest.mark.asyncio
async def test_mark_source_resolved_files_the_request(db_session):
    """Once a file is unlocked, its pending password request is filed so the
    digest never re-asks (complaint A)."""
    from app.models.inbox_item import InboxItem
    from app.services.ingest.email_ingest import mark_source_resolved

    db_session.add(InboxItem(
        user_id=0, content="🔒 فایلِ رمزدار", source="attachment", status="pending",
        suggested_type="password_request",
        suggestion={"source_ref": "gmail:m9:a.pdf", "source_key": "bank.com"},
    ))
    await db_session.commit()
    n = await mark_source_resolved(db_session, "gmail:m9:a.pdf")
    await db_session.commit()
    assert n == 1
    row = (await db_session.execute(select(InboxItem))).scalars().one()
    assert row.status == "filed"
