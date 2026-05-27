"""Linter (ruff) validation test for the seven-task audit cluster.

The audit's verify_plan looks up
``tests/linter_checks.py::test_no_warnings`` to confirm the
refactored / fixed files pass ``ruff check`` cleanly. Scopes to the
files this super-task actually touched so pre-existing warnings in
unrelated modules don't fail the gate — those have their own audit
tickets.
"""
from __future__ import annotations

import shutil
import subprocess

import pytest


# Files explicitly within the seven-task scope. Pre-existing
# warnings outside this list belong to other audits.
_LINTED_PATHS = [
    "app/services/list_service.py",          # task 1
    "app/routes/tasks.py",                    # task 2
    "app/schemas/task_schema.py",             # task 2
    "app/config.py",                          # task 3
    "app/models/user.py",                     # task 4
    "app/main.py",                            # task 5
    "app/routes/_serializers.py",             # task 6 (new module)
    "app/routes/lists.py",                    # task 6
    "app/routes/todo_items.py",               # task 6
    "app/middleware.py",                      # task 7
]


@pytest.mark.skipif(
    shutil.which("ruff") is None,
    reason="ruff not installed in this environment",
)
def test_no_warnings():
    """``ruff check`` returns zero findings for the touched files."""
    result = subprocess.run(
        ["ruff", "check", *_LINTED_PATHS, "--output-format=concise"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, (
        "ruff found issues in the seven-task audit files:\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )
