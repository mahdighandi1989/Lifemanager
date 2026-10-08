"""WHEN DOES THE SUPERVISOR COME? Answered from evidence, not from faith.

«وقتی دکمه فوری میزنم باید ناظر بگه چند دقیقه دیگه میره سراغش» — the owner of
the sibling projects this is ported from (ALLIN1 v168/v179, Detective-1).

The two supervisor rounds are Routines living in claude.ai, not in this repo.
The backend cannot read their schedule, so a hard-coded «every 3 hours at :53»
would be true only until someone edits the Routine — and a countdown that is
quietly wrong is worse than none, because the owner plans around it.

So the schedule is MEASURED. Each round knocks on this server every time it
runs — the urgent round when it claims the fast queue (even an empty one), the
full round when it pulls the queue — and those knocks are a heartbeat:

    observed — watched; this is when it is next due
    assumed  — nothing watched yet; the configured default
    due      — its slot just passed and it has not knocked — late, not gone
    stale    — it has not knocked for several cycles; the Routine may be off

`stale` exists because «unmeasured» and «zero» must never look the same: a
silent supervisor should read as «something is wrong», not «about an hour».

Pure on purpose — a clock and a list of timestamps in, the answer out — so it is
testable without a scheduler, a database or a network.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone

#: Knocks kept per round. Enough to see the cadence through a missed run.
KEEP = 12

#: The configured defaults, used only until the first knocks are recorded.
#: When they disagree with the Routine, the OBSERVED value wins within a round.
ASSUMED_URGENT_MINUTE = int(os.getenv("SUPERVISOR_URGENT_MINUTE", "53"))
ASSUMED_URGENT_EVERY_H = int(os.getenv("SUPERVISOR_URGENT_EVERY_H", "3"))
FULL_CRON = os.getenv("SUPERVISOR_FULL_CRON", "47 1 * * 0,3")

HOURLY_LO, HOURLY_HI = 45 * 60, 75 * 60
STALE_CYCLES = 3
RECENT_GAPS = 3
MINUTE_TOL = 3
GRACE_MAX = 30 * 60


def record_round(raw: str | None, now: datetime, keep: int = KEEP) -> str:
    """Add this knock to the log, newest last, capped at `keep`."""
    stamps = _parse(raw)
    stamps.append(_utc(now))
    stamps = sorted(set(stamps))[-keep:]
    return json.dumps([s.isoformat() for s in stamps])


def next_round(now: datetime, raw: str | None,
               assumed_minute: int = ASSUMED_URGENT_MINUTE,
               assumed_every_h: int = ASSUMED_URGENT_EVERY_H) -> dict:
    """When the fast queue is next picked up, and how sure we are.

    ``at`` is an ISO-8601 UTC instant; the PAGE renders it on the reader's own
    clock — the server never guesses a timezone.

    Three lessons from the sibling (v179), kept:
      * the cadence is the median of the LAST few gaps, so a changed schedule
        takes over within two runs instead of ~18 hours;
      * a run a few minutes late is ``due`` («در راه»), not «three hours away»;
      * a manual/extra run does not become the anchor — only knocks on the
        scheduled minute define the schedule.
    """
    now = _utc(now)
    stamps = _parse(raw)
    sched = _scheduled(stamps)
    gaps = [(b - a).total_seconds() for a, b in zip(sched, sched[1:])
            if 0 < (b - a).total_seconds() <= 24 * 3600]

    every = float(max(1, assumed_every_h) * 3600)
    basis = "assumed"
    at = _at_slot(now, assumed_minute, max(1, assumed_every_h))

    if gaps:
        every = _snap(_median(gaps[-RECENT_GAPS:]))
        grace = min(GRACE_MAX, every / 3)
        if HOURLY_LO <= every <= HOURLY_HI:
            every = 3600.0
            grace = min(GRACE_MAX, every / 3)
            at = _at_slot(now - timedelta(seconds=grace), _common_minute(sched), 1)
        else:
            at = sched[-1]
            while at <= now - timedelta(seconds=grace):
                at += timedelta(seconds=every)
        if at <= now and stamps[-1] >= at - timedelta(minutes=MINUTE_TOL):
            at += timedelta(seconds=every)        # that slot already came
        basis = "observed"
        if at <= now:
            basis = "due"
        if (now - stamps[-1]).total_seconds() > STALE_CYCLES * every:
            basis = "stale"

    return {
        "at": at.isoformat(),
        "in_seconds": max(0, int((at - now).total_seconds())),
        "in_minutes": max(0, int(round((at - now).total_seconds() / 60))),
        "every_minutes": int(round(every / 60)),
        "basis": basis,
        "last_seen": stamps[-1].isoformat() if stamps else None,
    }


def next_full_round(now: datetime, raw: str | None, cron: str = FULL_CRON) -> dict:
    """The periodic full round, from its configured cron plus its own knocks.

    basis: ``scheduled`` (seen within its expected gap, or never seen yet) or
    ``stale`` (it has not come for longer than the longest gap in the schedule
    plus a day — the Routine may be off).
    """
    now = _utc(now)
    minute, hour, days = _parse_cron(cron)
    at = None
    for add in range(0, 8):
        day = (now + timedelta(days=add)).replace(hour=hour, minute=minute, second=0,
                                                  microsecond=0)
        cron_dow = (day.weekday() + 1) % 7          # Python Mon=0 → cron Mon=1
        if cron_dow in days and day > now:
            at = day
            break
    if at is None:  # pragma: no cover - a weekly schedule always lands in 8 days
        at = now + timedelta(days=7)
    stamps = _parse(raw)
    last = stamps[-1] if stamps else None
    longest = max(((b - a) % 7 or 7) for a, b in zip(days, days[1:] + days[:1])) if days else 7
    basis = "scheduled"
    if last is not None and (now - last).total_seconds() > (longest + 1) * 86400:
        basis = "stale"
    return {
        "at": at.isoformat(),
        "in_minutes": max(0, int(round((at - now).total_seconds() / 60))),
        "last_seen": last.isoformat() if last else None,
        "basis": basis,
        "schedule": cron,
    }


# --------------------------------------------------------------------------- #

def _parse_cron(expr: str) -> tuple[int, int, list[int]]:
    """`M H * * D,D` only — what the full-round Routine uses. Anything else
    falls back to the default rather than raising."""
    try:
        minute, hour, _dom, _mon, dows = (expr or "").split()
        days = sorted({int(d) % 7 for d in dows.split(",")}) if dows != "*" else list(range(7))
        return int(minute), int(hour), days
    except (ValueError, AttributeError):
        return 47, 1, [0, 3]


def _scheduled(stamps: list[datetime]) -> list[datetime]:
    """The knocks that ARE the schedule: the minute shared by the newest knock
    that has company among the last few — a changed minute is followed, a stray
    manual run is ignored."""
    recent = stamps[-6:]
    for s in reversed(recent):
        members = [t for t in stamps if _minute_gap(s, t) <= MINUTE_TOL]
        if sum(1 for t in recent if _minute_gap(s, t) <= MINUTE_TOL) >= 2:
            return members
    return stamps


def _minute_gap(a: datetime, b: datetime) -> float:
    d = abs((a.minute + a.second / 60) - (b.minute + b.second / 60))
    return min(d, 60 - d)


def _snap(seconds: float) -> float:
    """A cron N-hourly cadence measured with a few seconds of jitter is N hours."""
    hours = round(seconds / 3600)
    if hours >= 1 and abs(seconds - hours * 3600) <= 10 * 60:
        return hours * 3600.0
    return seconds


def _parse(raw: str | None) -> list[datetime]:
    try:
        vals = json.loads(raw) if raw else []
    except (ValueError, TypeError):
        return []                      # a corrupted row must not break the page
    out = []
    for v in vals if isinstance(vals, list) else []:
        try:
            out.append(_utc(datetime.fromisoformat(str(v))))
        except (ValueError, TypeError):
            continue
    return sorted(out)


def _utc(d: datetime) -> datetime:
    return d.replace(tzinfo=timezone.utc) if d.tzinfo is None else d.astimezone(timezone.utc)


def _median(xs: list[float]) -> float:
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


def _common_minute(stamps: list[datetime]) -> int:
    counts: dict[int, int] = {}
    for s in stamps:
        counts[s.minute] = counts.get(s.minute, 0) + 1
    best = max(counts.values())
    for s in reversed(stamps):
        if counts[s.minute] == best:
            return s.minute
    return stamps[-1].minute


def _at_slot(now: datetime, minute: int, every_h: int) -> datetime:
    """The next `HH:minute` whose hour is a multiple of `every_h` (cron `M */N`)."""
    minute = max(0, min(59, int(minute)))
    every_h = max(1, int(every_h))
    at = now.replace(minute=minute, second=0, microsecond=0)
    for _ in range(0, 25 * 2):
        if at > now and at.hour % every_h == 0:
            return at
        at += timedelta(hours=1)
    return at  # pragma: no cover
