"""Learning-architecture: integrity of the epistemology registries behind the «🗺 نقشه‌ها» shared graph.

Every cross-reference (rule→station/section, station→section/technique, concept→station/section, drill→station,
dossier→section, territory area→section/rule, problem stage→station/technique) must resolve, and the axiom audit
(no conventional numbers, no unproven theorems) must be clean. Runs the page's own deterministic tool, so a nightly
routine that adds a broken link or a conventional number fails the merge gate instead of silently shipping it.
"""
import json
import os
import shutil
import subprocess

import pytest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOL = os.path.join(REPO, "apps", "learning-architecture", "tools", "epi_backtest.js")


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_epistemology_registries_resolve_and_axiom_audit_is_clean():
    out = subprocess.run(["node", TOOL, "audit"], capture_output=True, text=True, timeout=180)
    data = json.loads(out.stdout)
    assert data["violations"] == [], data["violations"]
    assert out.returncode == 0
