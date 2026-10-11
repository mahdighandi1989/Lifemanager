"""Merge gate for /apps/learning-architecture («معماری یادگیری عمیق و کارخانهٔ معرفت‌شناسی»).

The page's source, its built bundle, and its three documents (handbook, progress
ledger, work log) must never drift apart — the owner reads the handbook both on
GitHub and inside the page, and works on the page from other sessions. Everything
here is checked by the same code build.py uses (apps/learning-architecture/tools/
handbook.py), so a red test always comes with the exact fix:

    python apps/learning-architecture/build.py

See apps/learning-architecture/AGENTS.md for the full routine.
"""
import importlib.util
import json
import os
import shutil
import subprocess
import sys

import pytest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LLA = os.path.join(REPO, "apps", "learning-architecture")


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hb = _load("lla_handbook", os.path.join(LLA, "tools", "handbook.py"))


def _read(*parts):
    with open(os.path.join(LLA, *parts), encoding="utf-8") as f:
        return f.read()


def test_source_bundle_and_documents_are_in_sync():
    r = subprocess.run([sys.executable, os.path.join(LLA, "build.py"), "--check"],
                       capture_output=True, text=True, cwd=REPO, timeout=300)
    assert r.returncode == 0, "learning-architecture is out of sync:\n" + r.stdout + r.stderr


def test_ledgers_are_well_formed_and_every_chart_point_has_evidence():
    rows, entries, problems = hb.validate(_read("docs", "HANDBOOK.md"), _read("docs", "PROGRESS.md"), _read("docs", "WORKLOG.md"))
    assert not problems, "\n".join(problems)
    assert rows and entries
    assert all(r["refs"] for r in rows)


def test_validator_actually_catches_drift():
    """Tests that cannot fail are not gates (experiences/tests-that-cannot-fail-the-red-baseline.md)."""
    handbook, progress, worklog = _read("docs", "HANDBOOK.md"), _read("docs", "PROGRESS.md"), _read("docs", "WORKLOG.md")
    last = [l for l in progress.splitlines() if l.startswith("| ") and l.split("|")[1].strip().isdigit()][-1]
    n = int(last.split("|")[1])
    bad_row = progress + "| %d | 2099-01-01 | نقطهٔ بی‌سند | ▲ | – | – | – | – | – | – | بدون سند |\n" % (n + 1)
    assert any("evidence" in p for p in hb.validate(handbook, bad_row, worklog)[2])
    dangling = progress + "| %d | 2099-01-01 | سندِ ناموجود | ▲ | – | – | – | – | – | – | WORKLOG (9999) |\n" % (n + 1)
    assert any("9999" in p for p in hb.validate(handbook, dangling, worklog)[2])
    gap = progress + "| %d | 2099-01-01 | شمارهٔ پرشی | ▲ | – | – | – | – | – | – | WORKLOG (1) |\n" % (n + 2)
    assert any("no gaps" in p for p in hb.validate(handbook, gap, worklog)[2])
    unsigned = worklog + "\n## 2099-01-01 (%d) — بی‌امضا\n- **[CHANGE]** x\n" % (max(hb.parse_worklog(worklog)[0]) + 1)
    assert any("signature" in p for p in hb.validate(handbook, progress, unsigned)[2])
    stale_chart = handbook.replace(hb.render_chart(hb.parse_progress(progress)[0]), hb.render_chart([]))
    assert any("chart is stale" in p for p in hb.validate(stale_chart, progress, worklog)[2])
    broken_link = handbook + "\n[x](#عنوانی-که-نیست)\n"
    assert any("does not match any heading" in p for p in hb.validate(broken_link, progress, worklog)[2])


def test_slug_matches_github_rules_for_persian_headings():
    assert hb.slug("۶ — اعتبارسنجی؛ سه آزمون") == "۶--اعتبارسنجی-سه-آزمون"
    assert hb.slug("۵ — کارخانهٔ معرفت‌شناسی") == "۵--کارخانهٔ-معرفتشناسی"  # ZWNJ dropped, kasra/hamza kept
    assert hb.slug("جای این صفحه در `Lifemanager`") == "جای-این-صفحه-در-lifemanager"


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_frontend_slug_is_identical_to_the_gate_slug():
    """The page scrolls with frontend/src/lib/llaHandbook.js:slug; the gate checks with the Python one."""
    headings = [l.lstrip("#").strip() for doc in ("HANDBOOK.md", "WORKLOG.md", "PROGRESS.md")
                for l in _read("docs", doc).splitlines() if l.startswith("#")]
    js = ("import { slug } from %s;\nconst hs = JSON.parse(process.argv[1]);\nconsole.log(JSON.stringify(hs.map(slug)));"
          % json.dumps("file://" + os.path.join(REPO, "frontend", "src", "lib", "llaHandbook.js")))
    r = subprocess.run(["node", "--input-type=module", "-e", js, json.dumps(headings)], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    assert json.loads(r.stdout) == [hb.slug(h) for h in headings]


def test_page_is_registered_and_reads_the_generated_manifest():
    with open(os.path.join(REPO, "frontend", "src", "lib", "routesMeta.js"), encoding="utf-8") as f:
        assert "'/apps/learning-architecture'" in f.read()
    with open(os.path.join(REPO, "frontend", "src", "pages", "LearningArchitecturePage.jsx"), encoding="utf-8") as f:
        page = f.read()
    assert "LLA_BUNDLE" in page and "HandbookView" in page
    with open(os.path.join(REPO, "frontend", "src", "lib", "llaBundle.js"), encoding="utf-8") as f:
        manifest = json.loads(f.read().split("= ", 1)[1].rstrip().rstrip(";"))
    assert set(manifest["docs"]) == {"HANDBOOK", "PROGRESS", "WORKLOG", "progress"}
