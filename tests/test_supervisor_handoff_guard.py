"""The ship.sh guard re-checked on what actually LANDED (review 2026-10-15, C1): a plain `git push` skips ship.sh, so the merge
gate reads the «Routine:» line of every commit since the baseline and fails on a cross-area commit without that routine's `did`."""
from __future__ import annotations

import importlib.util
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _tool():
    spec = importlib.util.spec_from_file_location("handoff", os.path.join(ROOT, "scripts", "supervisor", "handoff.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


TERR = "apps/learning-architecture/backtest/territory.json"


def _fake(h, monkeypatch, commits, files):
    monkeypatch.setattr(h, "log_commits", lambda *a: commits)
    real = h.git
    monkeypatch.setattr(h, "git", lambda *a: "\n".join(files.get(a[-1], [])) if a and a[0] == "diff-tree" else real(*a))


def test_routine_trailer_is_found_wherever_it_sits():
    h = _tool()
    assert h.routine_of("fix(x): y\n\nbody\n\nRoutine: urgent\nCo-Authored-By: a <b>") == "urgent"
    assert h.routine_of("fix(x): y\n\nRoutine: backtest\n\nlater paragraph") == "backtest"
    assert h.routine_of("fix(x): y\n\nno trailer") == ""


def test_audit_flags_a_cross_area_commit_without_did(monkeypatch):
    h = _tool()
    c = {"sha": "abc1234", "date": "2026-10-15T10:00:00+00:00", "subject": "fix: territory", "body": "", "routine": "urgent"}
    _fake(h, monkeypatch, [c], {"abc1234": [TERR]})
    assert h.audit_history(entries=[]), "urgent changed the backtest's territory with no hand-off"
    did = {"by": "urgent", "kind": "did", "area": "epi-territory", "at": "2026-10-15T09:50:00Z"}
    assert h.audit_history(entries=[did]) == []
    # a `request` is not a record of work done; a `did` far from the commit time does not cover it
    assert h.audit_history(entries=[dict(did, kind="request")])
    assert h.audit_history(entries=[dict(did, at="2026-10-12T09:50:00Z")])
    # the owner routine of the area, commits with no Routine line (human sessions) and shared ledgers need nothing
    _fake(h, monkeypatch, [dict(c, routine="backtest"), dict(c, sha="d", routine="")], {"abc1234": [TERR], "d": [TERR]})
    assert h.audit_history(entries=[]) == []
    _fake(h, monkeypatch, [c], {"abc1234": ["apps/learning-architecture/docs/WORKLOG.md"]})
    assert h.audit_history(entries=[]) == []


def test_real_history_since_the_baseline_is_clean():
    h = _tool()
    if not h.history_available("HEAD"):
        return   # a source tarball without .git
    assert h.audit_history() == [], h.audit_history()


def test_every_prompt_says_ship_sh_only_and_urgent_reads_its_inbox_before_the_queue():
    for f in ("PROMPT.md", "URGENT_PROMPT.md", "BACKTEST_PROMPT.md"):
        t = open(os.path.join(ROOT, "docs", "supervisor", f), encoding="utf-8").read()
        assert "فقط با `ship.sh`" in t and "git push" in t, f
    u = open(os.path.join(ROOT, "docs", "supervisor", "URGENT_PROMPT.md"), encoding="utf-8").read()
    assert u.index("handoff.py inbox --routine urgent") < u.index("inspection.py urgent"), \
        "an empty urgent queue exits with code 0 — the inbox must already have been read"
    ship = open(os.path.join(ROOT, "scripts", "supervisor", "ship.sh"), encoding="utf-8").read()
    assert '--trailer "Routine: ' in ship and "handoff.py overlap" in ship
