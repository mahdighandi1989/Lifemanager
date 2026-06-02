"""Type-check gate for the JWT/auth security cluster (task task_78c0e8e0a9b5).

Pins the canonical verify node ``tests/test_types.py``. Runs ``mypy``
over the files this super-task touched. Scoped to these files so
pre-existing type issues elsewhere don't fail the gate. Skips cleanly
when mypy isn't installed in the runner.
"""
from __future__ import annotations

import shutil
import subprocess

import pytest

_TYPED_PATHS = [
    "app/config.py",
    "app/dependencies/auth.py",
    "app/services/auth_service.py",
    "app/routes/auth.py",
    "app/routes/webhook.py",
]


@pytest.mark.skipif(
    shutil.which("mypy") is None,
    reason="mypy not installed in this environment",
)
def test_type_check_passes():
    """``mypy`` returns no real errors for the touched files."""
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
    output = result.stdout + "\n" + result.stderr
    has_real_error = "error:" in output and "Success" not in output
    assert not has_real_error, (
        "mypy reported errors in the auth-security files:\n" + output
    )


def test_auth_context_is_typed_union():
    """Always-on smoke check: the auth dependency's return contract is a
    Union of the two user models, matching the documented type fix
    (sub-task 8). Gives the gate signal even without mypy installed."""
    import typing

    from app.dependencies.auth import AuthContext
    from app.models.user import User
    from app.models.user_oauth import OAuthUser

    assert set(typing.get_args(AuthContext)) == {User, OAuthUser}
