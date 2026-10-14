"""Coordination between the routines without a coordinating routine (owner 2026-10-14: «کارها جزیره‌ای نشود …
روتین‌ها به نحوهٔ کارِ همدیگر مسلط باشند … مستندات دقیق ثبت شود و همه مجاب به خواندن باشند»).

The merge gate guarantees: every key path has ONE owner area; every procedure an area names exists in that
routine's prompt; all three prompts carry the same protocol (identity, inbox first, precheck, follow the owner's
procedure, record the hand-off); the hand-off ledger is valid and its readable view in sync; and the guard refuses
a push into another routine's area without a recorded hand-off."""
from __future__ import annotations

import importlib.util
import json
import os
import re
from datetime import datetime, timedelta, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _tool():
    spec = importlib.util.spec_from_file_location("handoff", os.path.join(ROOT, "scripts", "supervisor", "handoff.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def _headings(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return [re.sub(r"^#+\s*", "", ln).strip() for ln in f if ln.startswith("#")]


def test_registry_is_complete_and_every_procedure_exists():
    h = _tool()
    own = h.load_own()
    for k, r in own["routines"].items():
        if k != "owner":
            assert os.path.exists(os.path.join(ROOT, r["prompt"])), r["prompt"]
            assert r.get("every_hours", 0) > 0
    for k, r in own["routines"].items():   # each routine's current agenda points at a real section of its prompt
        for it in r.get("agenda", []):
            f, _, anchor = it["procedure"].partition("#")
            assert any(x.startswith(anchor) for x in _headings(f)), f"{k}: agenda section «{anchor}» missing in {f}"
    assert own["routines"]["backtest"]["agenda"], "the assistant needs to know what the backtest routine is already doing"
    for a in own["areas"]:
        for o in h.owners(a):
            assert o in own["routines"], (a["id"], o)
        f, _, anchor = a["procedure"].partition("#")
        assert os.path.exists(os.path.join(ROOT, f)), a["procedure"]
        assert any(x.startswith(anchor) for x in _headings(f)), f"{a['id']}: no heading «{anchor}» in {f}"
        assert any(_glob_hits(p) for p in a["paths"]), f"{a['id']}: none of its paths exists"


def _glob_hits(pat):
    import fnmatch
    for d, _, fs in os.walk(ROOT):
        if "/node_modules" in d or "/.git" in d:
            continue
        for f in fs:
            rel = os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, "/")
            if fnmatch.fnmatchcase(rel, pat):
                return True
    return False


def test_key_paths_map_to_the_right_owner():
    h = _tool()
    expect = {
        "apps/learning-architecture/backtest/territory.json": "epi-territory",
        "apps/learning-architecture/docs/TERRITORY.md": "epi-territory",
        "apps/learning-architecture/backtest/foundation.json": "epi-foundation",
        "apps/learning-architecture/backtest/corpus/round-0003.json": "epi-backtest",
        "apps/learning-architecture/src/app/epi_cases_a.js": "epi-backtest",
        "apps/learning-architecture/src/app/epi_rules.js": "epi-rules",
        "apps/learning-architecture/src/app/epi_book.js": "epi-rules",
        "apps/learning-architecture/src/app/epi_engine.js": "epi-engine",
        "apps/learning-architecture/src/app/epi_st_a.js": "epi-engine",
        "apps/learning-architecture/src/app/a26_assist.js": "lla-page",
        "docs/supervisor/BACKTEST_PROMPT.md": "supervisor",
        "app/main.py": "app",
    }
    for p, a in expect.items():
        assert h.area_of(p)["id"] == a, p
    assert h.is_shared("apps/learning-architecture/docs/WORKLOG.md") and h.is_shared("docs/overhaul/AUDIT_LOG.md")
    # nothing the backtest routine writes is silently «page» territory
    bt = os.path.join(ROOT, "apps", "learning-architecture", "backtest")
    for d, _, fs in os.walk(bt):
        for f in fs:
            rel = os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, "/")
            assert h.area_of(rel)["id"].startswith("epi-"), rel


def test_all_three_prompts_carry_the_protocol():
    for me, f in (("general", "PROMPT.md"), ("urgent", "URGENT_PROMPT.md"), ("backtest", "BACKTEST_PROMPT.md")):
        t = open(os.path.join(ROOT, "docs", "supervisor", f), encoding="utf-8").read()
        for need in (f"SUPERVISOR_ROUTINE={me}", f"handoff.py inbox --routine {me}", "precheck", "ownership.json",
                     "--kind did", "--kind request", "owner-did", "دستورِ همان روتین را کامل بخوان"):
            assert need in t, (f, need)
        assert re.search(r"^version: \d+", t, re.M), f + " must be versioned (README procedure)"
    ship = open(os.path.join(ROOT, "scripts", "supervisor", "ship.sh"), encoding="utf-8").read()
    assert "handoff.py guard" in ship and "handoff.py check" in ship


def test_ledger_is_valid_and_view_in_sync():
    h = _tool()
    data, own = h.load(), h.load_own()
    assert h.validate(data, own) == []
    with open(h.VIEW, encoding="utf-8") as f:
        assert f.read() == h.render(data), "HANDOFFS.md is generated — run handoff.py check --fix"


def test_guard_refuses_unrecorded_work_in_another_area():
    h = _tool()
    terr = "apps/learning-architecture/backtest/territory.json"
    bad = h.guard("urgent", [terr], [])
    assert bad and "قلمرو" in bad[0]
    assert h.guard("urgent", [terr], [{"by": "urgent", "area": "epi-territory"}]) == []
    assert h.guard("backtest", [terr], []) == [], "the owner needs no hand-off"
    # owner-decision area: nobody but the executor (after the owner's yes) — a hand-off does not make it legal
    rules = "apps/learning-architecture/src/app/epi_rules.js"
    assert h.guard("urgent", [rules], [{"by": "urgent", "area": "epi-rules"}])
    assert h.guard("backtest", [rules], []) == []
    # the backtest routine touching the page needs a hand-off too; shared ledgers never do
    assert h.guard("backtest", ["apps/learning-architecture/src/app/a26_assist.js"], [])
    # a genuine crash fix in the engine by the urgent routine: allowed WITH a hand-off (the backtest verifies it)
    eng = "apps/learning-architecture/src/app/epi_engine.js"
    assert h.guard("urgent", [eng], []) and h.guard("urgent", [eng], [{"by": "urgent", "area": "epi-engine"}]) == []
    assert h.guard("urgent", ["apps/learning-architecture/docs/WORKLOG.md", "experiences/x.md"], []) == []


def test_add_inbox_close_and_stale(tmp_path, monkeypatch, capsys):
    h = _tool()
    monkeypatch.setattr(h, "LEDGER", str(tmp_path / "handoffs"))
    monkeypatch.setattr(h, "LEGACY", str(tmp_path / "none.json"))
    monkeypatch.setattr(h, "VIEW", str(tmp_path / "H.md"))
    assert h.main(["add", "--by", "urgent", "--area", "epi-territory", "--kind", "did", "--sheet", "7",
                   "--what", "حوزهٔ «معرفت‌شناسیِ فضیلت» یک گام، طبقِ مسیرِ ۳", "--commit", "abc123"]) == 0
    assert h.main(["add", "--by", "urgent", "--area", "epi-foundation", "--kind", "request", "--sheet", "8", "--what", "قابِ تازه"]) == 0
    assert h.main(["add", "--by", "backtest", "--area", "epi-territory", "--kind", "owner-did", "--sheet", "9", "--what", "خودم کردم"]) == 0
    ents = h.load()["entries"]
    assert len(ents) == 3 and len({e["id"] for e in ents}) == 3 and len(os.listdir(tmp_path / "handoffs")) == 3, "one file per entry, unique ids"
    did, req, own = ents
    capsys.readouterr()
    h.main(["inbox", "--routine", "backtest"])
    out = capsys.readouterr().out
    assert did["id"] in out and req["id"] in out and own["id"] not in out
    assert h.main(["close", did["id"], "--by", "urgent", "--status", "verified", "--note", "x"]) == 1, "only the owner closes"
    assert h.main(["close", did["id"], "--by", "backtest", "--status", "corrected", "--note", "گام درست نبود؛ با ابزار دوباره"]) == 0
    data = h.load()
    st = {e["id"]: e["status"] for e in data["entries"]}
    assert st[did["id"]] == "corrected" and st[own["id"]] == "done"
    assert h.validate(data, h.load_own()) == []
    late = datetime.now(timezone.utc) + timedelta(hours=60)
    assert [e["id"] for e in h.stale(data, h.load_own(), at=late)] == [req["id"]], "a request the daily owner ignored for 2 rounds"
    assert req["id"] in open(h.VIEW, encoding="utf-8").read()


def test_two_routines_recording_at_once_never_conflict(tmp_path):
    """Found by a simulation on 2026-10-14: with one JSON file, two routines appending at the same time hit a rebase
    conflict and both wrote «h3». Now: one file per entry + a union-merged generated view."""
    import shutil
    import subprocess

    def run(cwd, *a):
        r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True)
        assert r.returncode == 0, (a, r.stdout, r.stderr)
        return r.stdout

    origin = tmp_path / "origin"
    seed = tmp_path / "seed"
    for d in ("docs/supervisor", "scripts/supervisor"):
        (seed / d).mkdir(parents=True)
    shutil.copy(os.path.join(ROOT, "docs", "supervisor", "ownership.json"), seed / "docs/supervisor/ownership.json")
    shutil.copy(os.path.join(ROOT, "scripts", "supervisor", "handoff.py"), seed / "scripts/supervisor/handoff.py")
    shutil.copy(os.path.join(ROOT, ".gitattributes"), seed / ".gitattributes")
    run(seed, "git", "init", "-q", "-b", "main"); run(seed, "git", "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "0")
    run(seed, "git", "add", "-A"); run(seed, "git", "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "seed")
    run(tmp_path, "git", "clone", "-q", "--bare", str(seed), str(origin))
    a, b = tmp_path / "a", tmp_path / "b"
    for d in (a, b):
        run(tmp_path, "git", "clone", "-q", str(origin), str(d))
    run(a, "python3", "scripts/supervisor/handoff.py", "add", "--by", "urgent", "--area", "epi-territory", "--kind", "did", "--what", "A")
    run(a, "git", "add", "-A"); run(a, "git", "-c", "user.email=t@t", "-c", "user.name=a", "commit", "-q", "-m", "a"); run(a, "git", "push", "-q", "origin", "HEAD:main")
    run(b, "python3", "scripts/supervisor/handoff.py", "add", "--by", "backtest", "--area", "epi-foundation", "--kind", "owner-did", "--what", "B")
    run(b, "git", "add", "-A"); run(b, "git", "-c", "user.email=t@t", "-c", "user.name=b", "commit", "-q", "-m", "b")
    run(b, "git", "fetch", "-q", "origin", "main")
    run(b, "git", "-c", "user.email=t@t", "-c", "user.name=b", "rebase", "-q", "origin/main")   # must not conflict
    run(b, "python3", "scripts/supervisor/handoff.py", "check", "--fix")
    out = run(b, "python3", "scripts/supervisor/handoff.py", "check")
    assert "سالم" in out
    assert len(os.listdir(b / "docs/supervisor/handoffs")) == 2


def test_assistant_reads_the_same_registry():
    """The page's «💬 دستیار» routes a gap to an area from this very file (built into the bundle)."""
    import subprocess

    out = subprocess.run(["python", os.path.join(ROOT, "apps", "learning-architecture", "build.py"), "--check"], capture_output=True, text=True)
    assert out.returncode == 0, out.stdout + out.stderr
    js = open(os.path.join(ROOT, "apps", "learning-architecture", "build.py"), encoding="utf-8").read()
    assert "ownership.json" in js
    with open(os.path.join(ROOT, "docs", "supervisor", "ownership.json"), encoding="utf-8") as f:
        assert any(a.get("page") for a in json.load(f)["areas"])
