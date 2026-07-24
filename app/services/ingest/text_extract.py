"""Deterministic, keyless text extraction for attachments.

The owner's complaint: «انگار ناتوانه در بررسی هر نوعی از پیوست‌ها.» Root cause:
the ingest path had NO deterministic extractor — every attachment rode on a
vision/documents-capable LLM, so a keyless deploy (or an OpenAI-only one, or an
xlsx/docx) turned every file into a dead «دستی بررسی کن» note.

This module reads the common real-world attachment types WITHOUT any AI:
PDF (text layer), XLSX, CSV/TSV/TXT, DOCX, HTML. It also pulls the finance
fields a bank statement carries (institution, account ref, IBAN, balance,
currency) so «مالی» can self-feed even with no model configured. An LLM, when
available, still runs on the extracted TEXT for a richer summary — but the
deterministic floor means attachments are never silently swallowed again.

Every function is total (never raises) and returns "" / None on anything odd.
"""
from __future__ import annotations

import csv
import io
import logging
import re
import zipfile
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

_MAX_CHARS = 40_000
_MAX_PDF_PAGES = 40


def _is(mimetype: Optional[str], filename: Optional[str], *exts: str) -> bool:
    mt = (mimetype or "").lower()
    fn = (filename or "").lower()
    return any(e in mt for e in exts) or any(fn.endswith("." + e.split("/")[-1]) for e in exts)


def _pdf_text(data: bytes) -> str:
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted:
            # caller should have decrypted already; if not, we can't read it
            try:
                reader.decrypt("")
            except Exception:
                return ""
        out = []
        for page in reader.pages[:_MAX_PDF_PAGES]:
            try:
                out.append(page.extract_text() or "")
            except Exception:
                continue
        return "\n".join(out)
    except Exception as exc:
        logger.debug("pdf text extract failed: %r", exc)
        return ""


def _xlsx_text(data: bytes) -> str:
    try:
        import openpyxl

        wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
        lines = []
        for ws in wb.worksheets:
            lines.append(f"# {ws.title}")
            for row in ws.iter_rows(values_only=True):
                cells = [str(c) for c in row if c not in (None, "")]
                if cells:
                    lines.append("\t".join(cells))
                if sum(len(x) for x in lines) > _MAX_CHARS:
                    break
        wb.close()
        return "\n".join(lines)
    except Exception as exc:
        logger.debug("xlsx text extract failed: %r", exc)
        return ""


def _csv_text(data: bytes) -> str:
    txt = _decode(data)
    if not txt:
        return ""
    try:
        rows = list(csv.reader(io.StringIO(txt)))
        return "\n".join("\t".join(r) for r in rows[:2000])
    except Exception:
        return txt[:_MAX_CHARS]


def _docx_text(data: bytes) -> str:
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            with z.open("word/document.xml") as f:
                xml = f.read().decode("utf-8", "ignore")
        # paragraphs → newlines, then strip all tags
        xml = re.sub(r"</w:p>", "\n", xml)
        xml = re.sub(r"<[^>]+>", "", xml)
        return _unescape_html(xml)
    except Exception as exc:
        logger.debug("docx text extract failed: %r", exc)
        return ""


def _html_text(data: bytes) -> str:
    txt = _decode(data)
    if not txt:
        return ""
    txt = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", txt)
    txt = re.sub(r"<[^>]+>", " ", txt)
    return _unescape_html(txt)


def _decode(data: bytes) -> str:
    for enc in ("utf-8", "utf-8-sig", "cp1256", "latin-1"):
        try:
            return data.decode(enc)
        except Exception:
            continue
    return ""


def _unescape_html(s: str) -> str:
    try:
        import html as _html

        return re.sub(r"[ \t]+", " ", _html.unescape(s))
    except Exception:
        return s


def extract_text(data: bytes, mimetype: Optional[str], filename: Optional[str]) -> str:
    """Best-effort plain text from an attachment's bytes. "" when we can't read
    it deterministically (e.g. a scanned image — that path still goes to the
    vision model). Never raises."""
    if not data:
        return ""
    try:
        if _is(mimetype, filename, "pdf") or data[:5] == b"%PDF-":
            text = _pdf_text(data)
        elif _is(mimetype, filename, "spreadsheetml", "xlsx"):
            text = _xlsx_text(data)
        elif _is(mimetype, filename, "csv", "tsv"):
            text = _csv_text(data)
        elif _is(mimetype, filename, "wordprocessingml", "docx"):
            text = _docx_text(data)
        elif _is(mimetype, filename, "html", "htm"):
            text = _html_text(data)
        elif _is(mimetype, filename, "text/", "txt") or (mimetype or "").startswith("text/"):
            text = _decode(data)
        else:
            text = ""
        return (text or "").strip()[:_MAX_CHARS]
    except Exception as exc:
        logger.debug("extract_text failed: %r", exc)
        return ""


# ── deterministic finance-field parse (so «مالی» self-feeds without a model) ──

def parse_finance_fields(text: str, *, provider_hint: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Pull {provider, account_no, iban, balance, currency, kind} from statement
    text — reusing the same regexes as the email scan. Returns None when there's
    no financial signal (so a non-finance document isn't mis-fed to finance)."""
    if not text:
        return None
    try:
        from app.services import finance_email_scan_service as fs
        from app.services.email_parser_service import parse_balance

        if not fs._FIN_HINT.search(text):
            return None
        parsed = parse_balance(text)
        balance = getattr(parsed, "balance", None)
        currency = getattr(parsed, "currency", None)
        ref = fs._account_ref(text)
        iban_m = fs._IBAN.search(text)
        iban = iban_m.group(1).upper() if iban_m else None
        if balance is None and ref is None and iban is None:
            return None
        return {
            "kind": fs._kind(text),
            "provider": provider_hint,
            "account_no": ref,
            "iban": iban,
            "balance": balance,
            "currency": currency,
        }
    except Exception as exc:
        logger.debug("parse_finance_fields failed: %r", exc)
        return None
