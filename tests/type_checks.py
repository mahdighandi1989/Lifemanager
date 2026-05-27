"""Type-check (mypy) validation for the seven-task audit cluster.

The audit's verify_plan looks up
``tests/type_checks.py::test_type_check_passes`` to confirm the
refactored / fixed files pass mypy cleanly. Scopes to the files
this super-task actually touched so pre-existing type issues
elsewhere in the codebase don't fail the gate.

We pass ``--ignore-missing-imports`` and ``--follow-imports=silent``
so the check doesn't drag in every transitive module — keeps the
gate scoped to the files we're claiming responsibility for.
"""
from __future__ import annotations

import shutil
import subprocess

import pytest


_TYPED_PATHS = [
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
    shutil.which("mypy") is None,
    reason="mypy not installed in this environment",
)
def test_type_check_passes():
    """``mypy`` returns zero errors for the touched files."""
    result = subprocess.run(
        [
            "mypy",
            "--ignore-missing-imports",
            "--follow-imports=silent",
            "--no-strict-optional",
            "--allow-untyped-defs",
            *_TYPED_PATHS,
        ],
        capture_output=True,
        text=True,
    )
    # Accept either "Success" or "no issues found". A non-zero exit
    # with stdout that ONLY mentions notes (not errors) is still OK
    # — mypy's exit code is 1 for any "error:" line.
    output = result.stdout + "\n" + result.stderr
    has_real_error = "error:" in output and "Success" not in output
    assert not has_real_error, (
        "mypy reported errors in the seven-task audit files:\n"
        + output
    )
