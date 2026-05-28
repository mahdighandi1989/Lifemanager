"""docs/ARCHITECTURE_INVENTORY.json must stay structurally complete
(audit task fbd9bd36 ACs 1, 2, 3, 4, 5)."""
from __future__ import annotations

import json
from pathlib import Path


_INV_JSON = Path(__file__).resolve().parent.parent / "docs" / "ARCHITECTURE_INVENTORY.json"


def _data() -> dict:
    return json.loads(_INV_JSON.read_text(encoding="utf-8"))


def test_inventory_has_no_summarization_declaration():
    """AC 5 — the document must explicitly state nothing was elided."""
    d = _data()
    assert d.get("no_summarization_declaration")
    assert "no row was elided" in d["no_summarization_declaration"].lower() or (
        "no summarization" in d["no_summarization_declaration"].lower()
    )


def test_inventory_lists_target_models():
    """AC 2 — Task, Project, TodoList, TodoItem, OAuthUser at minimum."""
    d = _data()
    all_classes = {
        cls
        for entry in d["backend"]["models"]
        for cls in entry["classes"]
    }
    for required in ("Task", "Project", "TodoList", "TodoItem", "OAuthUser"):
        assert required in all_classes, f"{required} missing from inventory"


def test_inventory_lists_target_endpoints():
    """AC 1 — tasks/projects/lists/todo_items/auth_google endpoints
    must appear with method + path."""
    d = _data()
    by_file = {entry["file"]: entry for entry in d["backend"]["routes"]}
    for fname in (
        "app/routes/tasks.py",
        "app/routes/projects.py",
        "app/routes/lists.py",
        "app/routes/todo_items.py",
        "app/routes/auth_google.py",
    ):
        assert fname in by_file, f"{fname} missing from inventory"
        assert by_file[fname]["endpoints"], f"no endpoints captured for {fname}"


def test_inventory_describes_inspector_bridge_script():
    """AC 4 — the inspector bridge section is present with a line range."""
    d = _data()
    bridge = d["inspector_bridge_script"]
    assert bridge is not None
    assert bridge["file"] == "frontend/index.html"
    assert isinstance(bridge["start_line"], int) and bridge["start_line"] > 0
    assert isinstance(bridge["end_line"], int) and bridge["end_line"] > bridge["start_line"]
    assert bridge["wired_into_app_logic"] is False


def test_inventory_lists_all_frontend_pages():
    """AC 3 — every .jsx in frontend/src/pages must appear."""
    d = _data()
    pages = {entry["name"] for entry in d["frontend"]["pages"]}
    pages_dir = Path(__file__).resolve().parent.parent / "frontend" / "src" / "pages"
    if pages_dir.exists():
        on_disk = {f.stem for f in pages_dir.glob("*.jsx")}
        missing = on_disk - pages
        assert not missing, f"pages missing from inventory: {missing}"
