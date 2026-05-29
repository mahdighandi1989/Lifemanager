"""SmsListenerService — extract balance / movement from a bank SMS.

Audit task 4ae4b3ca AC 10. Mirrors EmailParserService: deterministic regex
extraction so the finance auto-update pipeline (``process_finance_updates``)
can refresh account balances from incoming bank texts without manual entry.

Iranian + international bank SMS carry lines like
"موجودی: 12,500,000 ریال", "برداشت 1,200,000 از حساب", "deposit of $50".
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ParsedSms:
    balance: Optional[float]
    currency: Optional[str]
    amount: Optional[float] = None
    direction: Optional[str] = None  # "credit" | "debit"
    raw_match: Optional[str] = None


class SmsListenerService:
    """Parse a single bank SMS body into structured balance/movement data."""

    _BALANCE_RE = re.compile(
        r"(?:موجودی|balance|بالانس)\s*(?:is|:|：)?\s*"
        r"([\d,]+(?:\.\d+)?)\s*(ریال|تومان|RIAL|USD|EUR|\$)?",
        re.IGNORECASE,
    )
    _AMOUNT_RE = re.compile(
        r"(?P<dir>برداشت|واریز|withdraw\w*|deposit\w*|debit|credit)"
        r"\D{0,20}?([\d,]+(?:\.\d+)?)",
        re.IGNORECASE,
    )
    _DEBIT_WORDS = ("برداشت", "withdraw", "debit")

    def parse_sms(self, sms_body: str) -> ParsedSms:
        """Return the balance + any single movement found in ``sms_body``."""
        body = sms_body or ""

        balance: Optional[float] = None
        currency: Optional[str] = None
        bal = self._BALANCE_RE.search(body)
        if bal:
            balance = float(bal.group(1).replace(",", ""))
            currency = bal.group(2)

        amount: Optional[float] = None
        direction: Optional[str] = None
        mov = self._AMOUNT_RE.search(body)
        if mov:
            amount = float(mov.group(2).replace(",", ""))
            kw = mov.group("dir").lower()
            direction = "debit" if any(w in kw for w in self._DEBIT_WORDS) else "credit"

        matched = bal or mov
        return ParsedSms(
            balance=balance,
            currency=currency,
            amount=amount,
            direction=direction,
            raw_match=matched.group(0) if matched else None,
        )


_service = SmsListenerService()


def parse_sms(sms_body: str) -> ParsedSms:
    """Module-level shortcut around :meth:`SmsListenerService.parse_sms`."""
    return _service.parse_sms(sms_body)
