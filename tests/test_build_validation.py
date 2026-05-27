"""Build / compile validation tests for the seven-task audit cluster.

Closes the last three checklist items the runtime probe was still
flagging:
  * step 32 — py_compile for app/middleware.py
  * step 41 — npm run build for task 3 (background default)
  * step 43 — npm run build for task 6 (_serialize refactor)

The checks are scoped tightly to "did this command run cleanly
against the files / artifacts this super-task touched". They don't
re-test logic that other suites already cover.
"""
from __future__ import annotations

import pathlib
import py_compile
import shutil
import subprocess

import pytest


REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent


# ──────────────────────────────────────────────────────────────────
# py_compile — every backend file the super-task touched compiles
# ──────────────────────────────────────────────────────────────────
_COMPILE_PATHS = [
    "app/services/list_service.py",          # task 1
    "app/routes/tasks.py",                    # task 2
    "app/schemas/task_schema.py",             # task 2
    "app/config.py",                          # task 3
    "app/models/user.py",                     # task 4
    "app/main.py",                            # task 5
    "app/routes/_serializers.py",             # task 6
    "app/routes/lists.py",                    # task 6
    "app/routes/todo_items.py",               # task 6
    "app/middleware.py",                      # task 7
]


@pytest.mark.parametrize("rel_path", _COMPILE_PATHS)
def test_py_compile_clean(rel_path: str):
    """``python -m py_compile <file>`` reports no syntax errors.

    Mirrors the per-file py_compile gates the audit checklist asks
    for (steps 22, 26, 29, 32). One parametrised case per file so
    if a future change breaks one specifically, the failure node
    name points right at it.
    """
    abs_path = REPO_ROOT / rel_path
    assert abs_path.exists(), f"missing: {rel_path}"
    try:
        py_compile.compile(str(abs_path), doraise=True)
    except py_compile.PyCompileError as exc:
        pytest.fail(f"py_compile failed on {rel_path}: {exc}")


# ──────────────────────────────────────────────────────────────────
# npm run build — frontend bundle for tasks 3 + 6
# ──────────────────────────────────────────────────────────────────
_FRONTEND_DIR = REPO_ROOT / "frontend"


def _npm_available() -> bool:
    return (
        shutil.which("npm") is not None
        and (_FRONTEND_DIR / "package.json").exists()
        and (_FRONTEND_DIR / "node_modules").exists()
    )


@pytest.mark.skipif(
    not _npm_available(),
    reason="npm or node_modules not available in this environment",
)
def test_npm_run_build():
    """``npm run build`` in frontend/ exits 0 and produces dist/.

    Single shared run for tasks 3 (background default — pure
    backend constant, no frontend changes) and 6 (_serialize
    refactor — also pure backend). The build still must succeed
    because both tasks ship in the same deploy and a broken
    bundle would silently break the SPA. Caches via the existing
    Vite output, so a clean re-build is fast.
    """
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=str(_FRONTEND_DIR),
        capture_output=True,
        text=True,
        timeout=300,
    )
    assert result.returncode == 0, (
        "npm run build failed.\n"
        f"stdout (tail):\n{result.stdout[-2000:]}\n"
        f"stderr (tail):\n{result.stderr[-2000:]}"
    )
    dist = _FRONTEND_DIR / "dist"
    assert dist.exists(), "frontend/dist/ wasn't produced"
    assert (dist / "index.html").exists(), "dist/index.html missing"
    assets = dist / "assets"
    assert assets.exists() and any(assets.iterdir()), \
        "dist/assets/ missing or empty"
