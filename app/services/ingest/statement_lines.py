"""ریزِ گردشِ حساب — per-transaction lines out of a statement, without any AI.

The owner's standing complaint (2026-07-22): «مشخصات صورت‌حساب رو نمی‌نویسه و
به‌روز کنه و ببینه از این حساب چه چیزی در فلان تاریخ کم شده». Until now the
statement pipeline only ever produced ONE number per file — the closing balance
— so a card could say «۱۵٬۶۳۶ درهم» but never «۲۵۰ درهم، سومِ تیر، خریدِ POS».

This module reads the statement TEXT (already extracted by ``text_extract``)
and returns the individual movements. It is deterministic and keyless: the
floor must work on a deploy with no model configured. An LLM may later enrich
descriptions, but nothing here depends on one.

Design notes that matter for correctness:
  • The running-balance column is the most trustworthy signal there is. When a
    line carries one, the DIRECTION is derived from the balance delta, not from
    guessing at keywords — so a debit mislabelled «payment» still lands right.
  • Every parse is total: a line we cannot read is skipped, never guessed at.
    A wrong row in the owner's ledger is worse than a missing one (this is the
    same precision-over-greed rule the account-card creation follows).
  • Rows are identified by a content hash so re-uploading the same statement,
    or an overlapping period, never doubles a movement.
"""
from __future__ import annotations

import hashlib
import logging
import re
from datetime import date as _date
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_MAX_LINES = 4000
_MAX_ROWS = 500

# Arabic-Indic / Persian digits → ASCII, and the Persian thousands (٬) and
# decimal (٫) separators → their ASCII twins, so a Persian statement parses too.
_DIGITS = str.maketrans(
    "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹٬٫",
    "01234567890123456789,.",
)

_MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

# A money token: 1,234.56 / 1234.56 / 1234 — optionally signed or bracketed
# (accounting negatives), optionally followed by CR/DR.
_MONEY = re.compile(
    r"(?<![\w.])(\(?-?\+?\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?\)?|\(?-?\+?\d+\.\d{2}\)?)"
    r"\s*(CR|DR|Cr|Dr|cr|dr)?(?![\w.])"
)

_DATE_PATTERNS = [
    # 2026-07-01 / 2026/07/01
    (re.compile(r"^\D{0,4}(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b"), "ymd"),
    # 01/07/2026 · 01-07-26 · 01.07.2026   (day-first — the owner's statements)
    (re.compile(r"^\D{0,4}(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b"), "dmy"),
    # 01-Jul-2026 · 1 Jul 26 · 01Jul2026
    (re.compile(r"^\D{0,4}(\d{1,2})[-\s]?([A-Za-z]{3})[a-z]*[-\s,]?(\d{2,4})\b"), "dMy"),
    # Jul 01, 2026
    (re.compile(r"^\D{0,4}([A-Za-z]{3})[a-z]*[-\s]+(\d{1,2})[-\s,]+(\d{2,4})\b"), "Mdy"),
]

# Words that flip a movement's direction when there is no balance column.
_OUT_WORDS = re.compile(
    r"(?i)\b(debit|withdraw\w*|purchase|payment|paid|pos|atm|fee|charge|transfer\s*out|"
    r"outward|dr\b)|برداشت|خرید|پرداخت|کارمزد|انتقال\s*به"
)
_IN_WORDS = re.compile(
    r"(?i)\b(credit|deposit|salary|refund|received|incoming|inward|reversal|cr\b)|"
    r"واریز|دریافت|حقوق|بازگشت|انتقال\s*از"
)

# A line that is a header/footer, not a movement.
_NOISE = re.compile(
    r"(?i)(opening\s*(balance)?\b|closing\s*(balance)?\b|balance\s*b/?f|"
    r"brought forward|carried forward|"
    r"statement period|page \d+ of \d+|total\s*(debits?|credits?)?\s*[:=]|"
    r"مانده\s*(اول|پایان|قبلی)|جمع\s*کل|صفحه\s*\d+)"
)
# …and the subset of those whose number IS a balance we can anchor deltas on.
_OPENING = re.compile(
    r"(?i)(opening|brought forward|balance\s*b/?f|مانده\s*(اول|قبلی))"
)


def _norm(s: str) -> str:
    return (s or "").translate(_DIGITS)


def _to_float(token: str) -> Optional[float]:
    """'(1,234.56)' → -1234.56 ; '1,234.56' → 1234.56 ; junk → None."""
    t = (token or "").strip()
    neg = t.startswith("(") and t.endswith(")")
    t = t.strip("()").replace(",", "").replace("+", "")
    try:
        v = float(t)
    except Exception:
        return None
    return -v if neg else v


def _year(raw: str) -> int:
    y = int(raw)
    if y < 100:
        y += 2000 if y < 70 else 1900
    return y


def _jalali_to_gregorian(jy: int, jm: int, jd: int) -> tuple:
    """Persian (Jalali) date → Gregorian, pure-python, no dependency.

    A Persian bank prints ۱۴۰۵/۰۵/۰۳, which is NOT the year 1405 CE. Storing it
    literally would file the movement six centuries in the past and quietly
    corrupt every date filter. Standard algorithm; only used for years that can
    only be Jalali (see ``_is_jalali_year``).
    """
    jy += 1595
    days = -355668 + (365 * jy) + ((jy // 33) * 8) + (((jy % 33) + 3) // 4) + jd
    days += (jm - 1) * 31 if jm < 7 else ((jm - 7) * 30) + 186
    gy = 400 * (days // 146097)
    days %= 146097
    if days > 36524:
        days -= 1
        gy += 100 * (days // 36524)
        days %= 36524
        if days >= 365:
            days += 1
    gy += 4 * (days // 1461)
    days %= 1461
    if days > 365:
        gy += (days - 1) // 365
        days = (days - 1) % 365
    gd = days + 1
    leap = (gy % 4 == 0 and gy % 100 != 0) or (gy % 400 == 0)
    months = [0, 31, 29 if leap else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    gm = 0
    while gm < 13 and gd > months[gm]:
        gd -= months[gm]
        gm += 1
    return gy, gm, gd


def _is_jalali_year(y: int) -> bool:
    """1300–1500 can only be a Persian year on a statement — no bank prints a
    15th-century Gregorian date."""
    return 1300 <= y <= 1500


def _mkdate(y: int, m: int, d: int) -> Optional[_date]:
    try:
        if _is_jalali_year(y):
            y, m, d = _jalali_to_gregorian(y, m, d)
        return _date(y, m, d)
    except Exception:
        return None


def parse_date(line: str) -> Optional[_date]:
    """The leading date of a statement line, in any of the common layouts.

    Day-first is assumed for the ambiguous ``01/07/2026`` form — that is what
    the owner's UAE/Iran statements print. When the first field is > 12 the
    layout is unambiguous and we honour it either way.
    """
    s = _norm(line).strip()
    for pattern, kind in _DATE_PATTERNS:
        m = pattern.match(s)
        if not m:
            continue
        try:
            if kind == "ymd":
                return _mkdate(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            if kind == "dmy":
                a, b = int(m.group(1)), int(m.group(2))
                day, month = (a, b) if b <= 12 else (b, a)  # 07/25/2026 → month-first
                return _mkdate(_year(m.group(3)), month, day)
            if kind == "dMy":
                mon = _MONTHS.get(m.group(2).lower())
                return _mkdate(_year(m.group(3)), mon, int(m.group(1))) if mon else None
            mon = _MONTHS.get(m.group(1).lower())
            return _mkdate(_year(m.group(3)), mon, int(m.group(2))) if mon else None
        except Exception:
            return None
    return None


def _direction(desc: str, amount: float, delta: Optional[float]) -> str:
    """out = money left the account, in = money arrived.

    The running-balance delta wins whenever we have one — it is a fact, not a
    guess. Only when the statement has no balance column do we fall back to the
    sign and then to wording.
    """
    if delta is not None and abs(delta) > 0.004:
        return "out" if delta < 0 else "in"
    if amount < 0:
        return "out"
    if _IN_WORDS.search(desc) and not _OUT_WORDS.search(desc):
        return "in"
    if _OUT_WORDS.search(desc):
        return "out"
    return "out"  # a statement line with no signal is far more often a spend


def _clean_desc(text: str) -> str:
    d = re.sub(r"\s{2,}", " ", (text or "").strip(" \t|-—–:،,"))
    return d[:200]


def parse_statement_lines(text: str, *, currency: Optional[str] = None) -> List[Dict[str, Any]]:
    """Every movement the statement text carries, oldest line order preserved.

    Returns ``[{date, description, amount, direction, balance_after, currency,
    raw}]``. Unreadable lines are skipped silently — a missing row is recoverable,
    a wrong one is not.
    """
    if not text:
        return []
    rows: List[Dict[str, Any]] = []
    try:
        prev_balance: Optional[float] = None
        for raw_line in _norm(text).splitlines()[:_MAX_LINES]:
            line = raw_line.strip()
            if len(line) < 8:
                continue
            if _NOISE.search(line):
                # An opening / brought-forward line is not a movement, but its
                # number is the anchor the whole delta chain hangs off — read it
                # and move on, so the FIRST real line already knows its direction.
                if _OPENING.search(line):
                    anchors = [_to_float(m.group(1)) for m in _MONEY.finditer(line)]
                    anchors = [v for v in anchors if v is not None]
                    if anchors:
                        prev_balance = anchors[-1]
                continue
            when = parse_date(line)
            if when is None:
                continue
            monies = list(_MONEY.finditer(line))
            if not monies:
                continue
            # Drop tokens that are part of the date itself (e.g. "01.07" never
            # matches _MONEY, but a bare year can) by only keeping tokens that
            # start after the date text.
            date_end = 0
            for pattern, _kind in _DATE_PATTERNS:
                m = pattern.match(line)
                if m:
                    date_end = m.end()
                    break
            monies = [m for m in monies if m.start() >= date_end]
            if not monies:
                continue

            values = [(_to_float(m.group(1)), (m.group(2) or "").lower()) for m in monies]
            values = [(v, tag) for v, tag in values if v is not None]
            if not values:
                continue

            balance_after: Optional[float] = None
            if len(values) >= 2:
                # Last column is the running balance; the one before it is the
                # movement. (Statements print «amount … balance».)
                balance_after = values[-1][0]
                amount_val, tag = values[-2]
            else:
                amount_val, tag = values[0]

            delta = None
            if balance_after is not None and prev_balance is not None:
                delta = balance_after - prev_balance

            desc_end = monies[0].start()
            description = _clean_desc(line[date_end:desc_end])
            if not description:
                description = _clean_desc(line[date_end:])

            direction = _direction(description, amount_val, delta)
            if tag == "cr":
                direction = "in"
            elif tag == "dr":
                direction = "out"

            amount = abs(amount_val)
            if amount == 0:
                continue

            rows.append({
                "date": when.isoformat(),
                "description": description or "تراکنش",
                "amount": round(amount, 2),
                "direction": direction,
                "balance_after": (round(balance_after, 2) if balance_after is not None else None),
                "currency": currency,
                "raw": line[:300],
            })
            if balance_after is not None:
                prev_balance = balance_after
            if len(rows) >= _MAX_ROWS:
                break
    except Exception as exc:  # total by contract
        logger.debug("parse_statement_lines failed: %r", exc)
        return rows
    return rows


def line_ref(account_id: int, row: Dict[str, Any]) -> str:
    """Stable identity for one movement: same line, same ref, forever.

    Keyed on CONTENT (account + date + amount + direction + description), not on
    the file it arrived in — so the same movement seen again in next month's
    overlapping statement, or in a re-upload, is recognised as the one it is.
    """
    basis = "|".join([
        str(account_id), str(row.get("date") or ""), f"{float(row.get('amount') or 0):.2f}",
        str(row.get("direction") or ""), (str(row.get("description") or "")[:60]).lower(),
    ])
    return "line:" + hashlib.sha1(basis.encode("utf-8")).hexdigest()[:20]
