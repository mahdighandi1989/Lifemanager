"""Learning-architecture: EVERY browser/page test of /apps/learning-architecture in the merge gate.

Originally this ran only `test_graph.js` (the shared graph «🗺 نقشه‌ها») and `test_mind_report.js` (system territories,
«🧠 کارنامهٔ ذهن», report mail) — the other ~55 page tests (safety, assistant, tour, factory, knots, problems, sources …)
were run by hand only, so a regression in them could merge green (cross-cutting review 2026-10-15). Now every
`apps/learning-architecture/tests/test*.js` plus `tests/scan_epi.js` runs here and is judged by its EXIT CODE (AGENTS.md:
«آزمون‌های صفحه با کدِ خروج داوری می‌شوند»), against a fresh standalone build of the CURRENT sources (built into a temp
dir — the repo's dist/ and the frontend bundle are not touched).

Runtime: the files run in parallel in a small pool (`LLA_BROWSER_JOBS`, default 4; each file has its own timeout
`LLA_BROWSER_TIMEOUT`, default 900 s). Selecting a subset with `-k` runs only that subset.

Playwright: `apps/learning-architecture/package.json` pins `playwright` (devDependency) — `cd apps/learning-architecture
&& npm i` (or the older `npm i --no-save playwright@1.56`). Chromium comes from `PLAYWRIGHT_BROWSERS_PATH`
(/opt/pw-browsers in the managed container) or `npx playwright install chromium`.

Skips cleanly (with the reason) only when the browser stack is absent: no `node`, no `playwright` package in
apps/learning-architecture/node_modules, or no launchable Chromium.
"""
import concurrent.futures
import glob
import importlib.util
import os
import shutil
import subprocess

import pytest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LLA = os.path.join(REPO, "apps", "learning-architecture")
TESTS = tuple(sorted(os.path.basename(p) for p in glob.glob(os.path.join(LLA, "tests", "test*.js")))) + ("scan_epi.js",)
JOBS = max(1, int(os.environ.get("LLA_BROWSER_JOBS", "4") or 4))
TIMEOUT = int(os.environ.get("LLA_BROWSER_TIMEOUT", "900") or 900)
INSTALL = "cd apps/learning-architecture && npm i (package.json pins playwright)"


def _browser_unavailable():
    if shutil.which("node") is None:
        return "node not installed"
    probe = "require('playwright').chromium.launch().then(b => b.close()).then(() => process.exit(0), e => { console.error(e.message); process.exit(3); })"
    try:
        r = subprocess.run(["node", "-e", probe], cwd=LLA, capture_output=True, text=True, timeout=90)
    except Exception as e:  # pragma: no cover - environment dependent
        return "playwright probe failed: %s" % e
    if r.returncode != 0:
        return "playwright/Chromium unavailable (" + INSTALL + "): " + ((r.stderr or r.stdout).strip().splitlines() or ["?"])[-1]
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
    # the tests resolve everything from `__dirname/..`: mirror the page folder (read-only data/tools/sources by symlink),
    # but COPY the test files themselves (node resolves a symlinked main module to its real path ⇒ the repo's dist/)
    for name in os.listdir(LLA):
        if name in ("dist", "tests"):
            continue
        os.symlink(os.path.join(LLA, name), root / name)        # node_modules (require('playwright')), src, tools, backtest, …
    os.makedirs(root / "tests")
    for p in glob.glob(os.path.join(LLA, "tests", "*.js")):
        shutil.copy(p, root / "tests" / os.path.basename(p))
    # independent variant banks (tests/variants/*.json, read by require('./variants/…')) — read-only data, by symlink
    if os.path.isdir(os.path.join(LLA, "tests", "variants")):
        os.symlink(os.path.join(LLA, "tests", "variants"), root / "tests" / "variants")
    return root


def _run(root, name):
    try:
        r = subprocess.run(["node", str(root / "tests" / name)], cwd=str(root), capture_output=True, text=True, timeout=TIMEOUT)
    except subprocess.TimeoutExpired as e:
        return None, "timed out after %ss\n%s" % (TIMEOUT, ((e.stdout or "") if isinstance(e.stdout, str) else "")[-2000:])
    return r.returncode, (r.stdout + "\n" + r.stderr).strip()[-4000:]


@pytest.fixture(scope="module")
def results(sandbox, request):
    # only the files this session actually selected (``-k``), all at once in a small pool
    want = [it.callspec.params["name"] for it in request.session.items
            if getattr(it, "originalname", "") == "test_learning_architecture_browser_suite_is_green" and hasattr(it, "callspec")]
    want = [n for n in TESTS if n in set(want)] or list(TESTS)
    with concurrent.futures.ThreadPoolExecutor(max_workers=JOBS) as ex:
        futs = {n: ex.submit(_run, sandbox, n) for n in want}
        return {n: f.result() for n, f in futs.items()}


@pytest.mark.parametrize("name", TESTS)
def test_learning_architecture_browser_suite_is_green(results, sandbox, name):
    code, tail = results[name] if name in results else _run(sandbox, name)
    assert code == 0, name + " exited " + str(code) + ":\n" + tail


def test_every_page_test_is_in_the_gate():
    """A new tests/test*.js is picked up automatically (glob) — and scan_epi.js is judged by exit code too."""
    assert "test_graph.js" in TESTS and "test_mind_report.js" in TESTS and "scan_epi.js" in TESTS
    assert len(TESTS) >= 50
    src = open(os.path.join(LLA, "tests", "scan_epi.js"), encoding="utf-8").read()
    assert "process.exitCode = errs.length ? 1 : 0" in src
