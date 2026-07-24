"""EmailParserService — extract a bank-account balance from a notification
email (audit task 4ae4b3ca, AC4).

Banks send balance emails in a handful of shapes ("موجودی: 12,500,000 ریال",
"Balance: $1,234.56", ...). This parser pulls the numeric balance + currency
out of the body with a few tolerant regexes and returns a structured result
the finance-sync layer can persist onto a FinancialAccount. It is deliberately
dependency-free so it can run on a mock email in tests without an IMAP client.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional


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
        "aud": "AUD",
        "cad": "CAD",
    }

    # Handles all of: «موجودی: 12,500,000 ریال» / «Balance: $1,234.56» /
    # «balance is 1000 USD» / «Balance: USD 1,234.56» / «AED 500» (currency word
    # BEFORE the amount — the common bank-statement shape the old regex missed).
    _BALANCE_RE = re.compile(
        r"(?:موجودی|balance|بالانس|available|مبلغ)\s*(?:is|:|：|of)?\s*"
        r"(?P<cur0>usd|eur|aed|gbp|irr|aud|cad|dhs|ریال|تومان|درهم|[$€£])?\s*"
        r"(?P<amount>\d[\d,]*(?:\.\d+)?)\s*"
        r"(?P<cur2>ریال|تومان|rial|toman|usd|eur|aed|gbp|dollar|درهم|dhs|[$€£])?",
        re.IGNORECASE,
    )

    def parse_balance(self, email_body: str) -> ParsedBalance:
        """Return the first balance found in ``email_body`` (or empty result)."""
        if not email_body:
            return ParsedBalance(balance=None, currency=None)
        match = self._BALANCE_RE.search(email_body)
        if not match:
            return ParsedBalance(balance=None, currency=None)
        amount = float(match.group("amount").replace(",", ""))
        token = (match.group("cur0") or match.group("cur2") or "").strip().lower()
        currency = self._CURRENCY.get(token)
        return ParsedBalance(balance=amount, currency=currency, raw_match=match.group(0))


# Module-level convenience instance + helper.
_service = EmailParserService()


def parse_balance(email_body: str) -> ParsedBalance:
    """Module-level shortcut around :meth:`EmailParserService.parse_balance`."""
    return _service.parse_balance(email_body)
