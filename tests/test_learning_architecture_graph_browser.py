"""Learning-architecture: the shared graph («🗺 نقشه‌ها») and the mind report card in a real browser — in the merge gate.

`apps/learning-architecture/tests/test_graph.js` (every registry, global and record type wired into the graph; broken
references reported; hub/menus) and `tests/test_mind_report.js` (system territories, «🧠 کارنامهٔ ذهن», report mail)
were only run by hand, so a routine could ship a registry the graph never saw (execution review 2026-10-15). This runs
both against a fresh standalone build of the CURRENT sources (built into a temp dir — the repo's dist/ and the frontend
bundle are not touched) and fails on a non-zero exit or anything but «NO ERRORS».

Skips cleanly only when the browser stack is absent: no `node`, no `playwright` package in
apps/learning-architecture/node_modules (`npm i --no-save playwright@1.56`), or no launchable Chromium.
"""
import importlib.util
import os
import shutil
import subprocess

import pytest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LLA = os.path.join(REPO, "apps", "learning-architecture")
TESTS = ("test_graph.js", "test_mind_report.js")
SUPPORT = ("fixtures_mind_seed.js",)


def _browser_unavailable():
    if shutil.which("node") is None:
        return "node not installed"
    probe = "require('playwright').chromium.launch().then(b => b.close()).then(() => process.exit(0), e => { console.error(e.message); process.exit(3); })"
    try:
        r = subprocess.run(["node", "-e", probe], cwd=LLA, capture_output=True, text=True, timeout=90)
    except Exception as e:  # pragma: no cover - environment dependent
        return "playwright probe failed: %s" % e
    if r.returncode != 0:
        return "playwright/Chromium unavailable: " + ((r.stderr or r.stdout).strip().splitlines() or ["?"])[-1]
    return None


@pytest.fixture(scope="module")
def sandbox(tmp_path_factory):
    why = _browser_unavailable()
    if why:
        pytest.skip(why)
    root = tmp_path_factory.mktemp("lla_browser")
    spec = importlib.util.spec_from_file_location("lla_build_for_browser_tests", os.path.join(LLA, "build.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.D = str(root / "dist")          # standalone build only; the repo's dist/ and frontend bundle stay as they are
    mod.build_dist()
    os.makedirs(root / "tests")
    for name in TESTS + SUPPORT:
        shutil.copy(os.path.join(LLA, "tests", name), root / "tests" / name)
    os.symlink(os.path.join(LLA, "node_modules"), root / "node_modules")   # require('playwright')
    os.makedirs(root / "src")
    os.symlink(os.path.join(LLA, "src", "app"), root / "src" / "app")    # test_graph.js scans the source for record types
    return root


@pytest.mark.parametrize("name", TESTS)
def test_learning_architecture_browser_suite_is_green(sandbox, name):
    r = subprocess.run(["node", str(sandbox / "tests" / name)], cwd=str(sandbox), capture_output=True, text=True, timeout=600)
    tail = (r.stdout + "\n" + r.stderr).strip()[-4000:]
    assert r.returncode == 0, name + " exited " + str(r.returncode) + ":\n" + tail
    assert (r.stdout.strip().splitlines() or [""])[-1] == "NO ERRORS", name + " reported problems:\n" + tail
