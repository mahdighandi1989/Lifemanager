"""Lint gate for the JWT/auth security cluster (task task_78c0e8e0a9b5).

Pins the canonical verify node ``tests/test_lint.py``. Runs ``ruff
check`` over the files this super-task touched (auth pipeline, config,
webhook signature, user-scoped routes). Scoped to these files so
pre-existing warnings elsewhere don't fail the gate. Skips cleanly when
ruff isn't installed in the runner.
"""
from __future__ import annotations

import shutil
import subprocess

import pytest

_LINTED_PATHS = [
    "app/config.py",
    "app/dependencies/auth.py",
    "app/services/auth_service.py",
    "app/routes/auth.py",
    "app/routes/webhook.py",
    "app/routes/tasks.py",
    "app/routes/projects.py",
    "app/routes/lists.py",
    "app/routes/todo_items.py",
    "app/routes/users.py",
]


@pytest.mark.skipif(
    shutil.which("ruff") is None,
    reason="ruff not installed in this environment",
)
def test_lint_passes():
    """``ruff check`` returns zero findings for the touched files."""
    result = subprocess.run(
        ["ruff", "check", *_LINTED_PATHS, "--output-format=concise"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, (
        "ruff found issues in the auth-security files:\n"
        f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    )


def test_touched_files_import_cleanly():
    """Always-on smoke check: the touched modules import without error,
    so the gate has signal even when ruff isn't installed."""
    import importlib

    for mod in (
        "app.config",
        "app.dependencies.auth",
        "app.services.auth_service",
        "app.routes.auth",
        "app.routes.webhook",
    ):
        importlib.import_module(mod)
