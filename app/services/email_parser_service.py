"""EmailParserService — extract a bank-account balance from a notification
email (audit task 4ae4b3ca, AC4; precision overhaul 2026-07-30).

Banks send balance emails in a handful of shapes ("موجودی: 12,500,000 ریال",
"Balance: $1,234.56", ...). This parser pulls the numeric balance + currency
out of the body and returns a structured result the finance-sync layer can
persist onto a FinancialAccount. It is deliberately dependency-free so it can
run on a mock email in tests without an IMAP client.

2026-07-30 precision rules (the owner's «موجودی هنوز فوق‌العاده خطا دارد»):
  * Persian/Arabic-Indic digits and the ٬/٫ separators are normalised BEFORE
    matching — «۱۲٬۵۰۰٬۰۰۰» used to parse as 12.0.
  * Not every «balance» is THE balance: Previous/Opening/Outstanding/rewards
    balances are disqualified; Available/Current/Closing win over a bare
    «balance» when both appear.
  * A bare small number with no currency and no separators («work-life
    balance 10 tips») is noise, not money.
  * European decimal style (1.234.567,89) parses as 1234567.89.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

# Arabic-Indic / Persian digits → ASCII, Persian thousands (٬) and decimal
# (٫) separators → ASCII — same table statement_lines uses, so the two halves
# of the pipeline finally read numbers the same way.
_DIGITS = str.maketrans(
    "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹٬٫",
    "01234567890123456789,.",
)


@dataclass
class ParsedBalance:
    """Outcome of parsing one email body."""

    balance: Optional[float]
    currency: Optional[str]
    raw_match: Optional[str] = None


class EmailParserService:
    # Recognised currency tokens -> canonical code.
    _CURRENCY = {
        "ریال": "IRR",
        "rial": "IRR",
        "irr": "IRR",
        "تومان": "IRT",
        "toman": "IRT",
        "$": "USD",
        "usd": "USD",
        "dollar": "USD",
        "€": "EUR",
        "eur": "EUR",
        "£": "GBP",
        "gbp": "GBP",
        "aed": "AED",       # UAE dirham — the owner's home currency
        "درهم": "AED",
        "dhs": "AED",
        "د.إ": "AED",
        "aud": "AUD",
        "cad": "CAD",
        "sar": "SAR",
        "qar": "QAR",
        "omr": "OMR",
        "kwd": "KWD",
        "bhd": "BHD",
        "try": "TRY",
        "chf": "CHF",
        "inr": "INR",
    }

    _CUR_TOKEN = (
        r"usd|eur|aed|gbp|irr|aud|cad|dhs|sar|qar|omr|kwd|bhd|try|chf|inr|"
        r"ریال|تومان|درهم|د\.إ|[$€£]"
    )

    # A qualifier that means «this number is NOT the live balance»:
    # previous/opening statements figures, debts, loyalty points.
    _DISQUALIFIED = re.compile(
        r"(?i)(previous|prior|opening|beginning|outstanding|due|rewards?|"
        r"loyalty|points?|bonus|قبلی|پیشین|بدهی|امتیاز)"
    )
    # …and one that marks the SPENDABLE truth, preferred over a bare «balance».
    _PREFERRED = re.compile(r"(?i)(available|current|closing|قابل\s*برداشت)")

    # Handles: «موجودی: 12,500,000 ریال» / «Balance: $1,234.56» / «balance is
    # 1000 USD» / «Balance: USD 1,234.56» / «AED 500» (currency before the
    # amount). The optional word right before the keyword classifies the match
    # (previous/available/…); the amount group is parsed by _to_amount.
    _BALANCE_RE = re.compile(
        r"(?P<qual>[A-Za-z؀-ۿ]+[ \t]+)?"
        r"(?P<kw>موجودیِ?\s*قابل\s*برداشت|available\s*balance|current\s*balance|"
        r"closing\s*balance|موجودی|balance|بالانس)"
        r"\s*(?:is|:|：|of)?\s*"
        r"(?P<cur0>" + _CUR_TOKEN + r")?\s*"
        r"(?P<amount>\d[\d.,]*)\s*"
        r"(?P<cur2>" + _CUR_TOKEN + r")?",
        re.IGNORECASE,
    )

    @staticmethod
    def _to_amount(raw: str) -> Optional[float]:
        """'1,234.56' → 1234.56 ; '1.234.567,89' → 1234567.89 ; junk → None."""
        t = (raw or "").strip().rstrip(".,")
        if not t:
            return None
        if "." in t and "," in t:
            # the LAST separator is the decimal mark, the other is grouping.
            if t.rfind(",") > t.rfind("."):
                t = t.replace(".", "").replace(",", ".")
            else:
                t = t.replace(",", "")
        elif "," in t:
            parts = t.split(",")
            # 1,234,567 → grouping; 1234,56 → decimal comma
            if all(len(p) == 3 for p in parts[1:]):
                t = t.replace(",", "")
            else:
                t = t.replace(",", ".")
        elif t.count(".") > 1:
            # 1.234.567 → European grouping
            t = t.replace(".", "")
        try:
            return float(t)
        except Exception:
            return None

    def parse_balance(self, email_body: str) -> ParsedBalance:
        """Return the most trustworthy balance in ``email_body`` (or empty)."""
        if not email_body:
            return ParsedBalance(balance=None, currency=None)
        text = email_body.translate(_DIGITS)

        best: Optional[ParsedBalance] = None
        best_rank: Optional[int] = None
        for match in self._BALANCE_RE.finditer(text):
            kw = match.group("kw") or ""
            qual = (match.group("qual") or "").strip()
            # «Previous/Outstanding/rewards … balance» is a different number —
            # never THE balance.
            if qual and self._DISQUALIFIED.search(qual):
                continue
            amount = self._to_amount(match.group("amount"))
            if amount is None:
                continue
            token = (match.group("cur0") or match.group("cur2") or "").strip().lower()
            currency = self._CURRENCY.get(token)
            # A bare small integer with no currency and no separators is prose
            # («work-life balance 10 tips»), not money.
            raw_amount = match.group("amount")
            if currency is None and not re.search(r"[.,]", raw_amount) and len(raw_amount) < 4:
                continue
            rank = 0 if self._PREFERRED.search(f"{qual} {kw}") else 1
            if best_rank is None or rank < best_rank:
                best = ParsedBalance(balance=amount, currency=currency, raw_match=match.group(0))
                best_rank = rank
                if rank == 0:
                    break  # first preferred match wins
        return best or ParsedBalance(balance=None, currency=None)


# Module-level convenience instance + helper.
_service = EmailParserService()


def parse_balance(email_body: str) -> ParsedBalance:
    """Module-level shortcut around :meth:`EmailParserService.parse_balance`."""
    return _service.parse_balance(email_body)
