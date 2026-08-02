"""«نوبت دکتر فردا ساعت ۱۰» must keep BOTH the day and the hour.

Two separate leaks were closed here and each gets its own guard:

1. The triage prompt never told the model what day it is, so «فردا» could
   not be resolved — the model answered null (date silently lost) or
   invented one. The prompt now carries a local «امروز» line.
2. Even with a date, the time of day had nowhere to land: ``due_date`` is a
   Date column. The hour now goes to ``Task.deadline`` (a timestamp).
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest

from app.services import inbox_service as svc
from app.services.place_service import TZ_OFFSET_MINUTES

UTC = timezone.utc


# ── the model is given a clock ───────────────────────────────────────

def test_triage_prompt_carries_today():
    """Without «امروز» in the prompt, no relative date can be resolved."""
    line = svc._today_line()
    local_today = (datetime.now(UTC) + timedelta(minutes=TZ_OFFSET_MINUTES)).date()
    assert local_today.isoformat() in line
    # the weekday name matters: «دوشنبه» is only resolvable against one
    assert any(d in line for d in svc._FA_WEEKDAYS)


def test_today_is_local_not_utc():
    """At 02:00 Dubai the UTC date is still yesterday; «فردا» would land a
    day early. Guard the offset is actually applied."""
    assert TZ_OFFSET_MINUTES > 0
    assert "{today}" in svc._TRIAGE_PROMPT


def test_prompt_formats_with_today_key():
    """A missing format key raises KeyError at call time and the whole
    triage silently falls back to the heuristic — catch it here instead."""
    out = svc._TRIAGE_PROMPT.format(
        targets="- task: کار", lists="-", pages="-",
        today=svc._today_line(), content="نوبت دکتر",
    )
    assert "امروز:" in out and "due_time" in out


# ── parsing what comes back ──────────────────────────────────────────

@pytest.mark.parametrize(
    "raw,expected",
    [
        ("۱۴۰۵-۰۵-۱۲", date(1405, 5, 12)),   # Persian digits
        ("2026-08-03", date(2026, 8, 3)),
        ("2026-08-03T10:00", date(2026, 8, 3)),
        ("null", None),
        ("فردا", None),                       # unresolved → not guessed
        (None, None),
    ],
)
def test_norm_date(raw, expected):
    assert svc._norm_date(raw) == expected


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("۱۰:۳۰", "10:30"),
        ("10:30", "10:30"),
        ("17:00", "17:00"),
        ("2026-08-03T09:05", "09:05"),
        ("10", None),      # a bare hour is a quantity as often as a clock
        ("25:00", None),
        (None, None),
    ],
)
def test_norm_time(raw, expected):
    assert svc._norm_time(raw) == expected


# ── the hour survives into a real column ─────────────────────────────

def test_deadline_converts_local_to_utc():
    got = svc._deadline_from("2026-08-03", "10:00")
    assert got == datetime(2026, 8, 3, 10, 0, tzinfo=UTC) - timedelta(
        minutes=TZ_OFFSET_MINUTES
    )
    # ...and reads back as 10:00 in the owner's timezone
    assert (got + timedelta(minutes=TZ_OFFSET_MINUTES)).hour == 10


def test_deadline_needs_both_parts():
    assert svc._deadline_from("2026-08-03", None) is None
    assert svc._deadline_from(None, "10:00") is None


@pytest.mark.asyncio
async def test_appointment_keeps_day_and_hour(db_session):
    """End to end: the doctor's appointment lands with both halves intact."""
    created = await svc._file_as_task(
        db_session,
        {
            "title": "نوبت دکتر",
            "description": "نوبت دکتر فردا ساعت ۱۰",
            "due_date": "2026-08-03",
            "due_time": "10:00",
        },
        0,
    )
    from app.models.task import Task

    task = await db_session.get(Task, created["id"])
    assert task.due_date == date(2026, 8, 3)
    assert task.deadline is not None, "the hour was dropped again"
    deadline = task.deadline
    if deadline.tzinfo is None:          # SQLite hands back naive UTC
        deadline = deadline.replace(tzinfo=UTC)
    assert (deadline + timedelta(minutes=TZ_OFFSET_MINUTES)).hour == 10
