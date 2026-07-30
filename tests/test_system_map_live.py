"""نقشهٔ زندهٔ سیستم — the live diagram endpoints (2026-07-30).

Contract under test:
  * GET /api/system-map/graph is INTROSPECTED from the running app — routers
    from the live route table, services/models from disk + SQLAlchemy
    registry, pages from frontend/src/lib/routesMeta.js — so the map can
    never go stale. The lazy-import assertion pins the full-AST-walk
    behaviour (31/59 routers import inside handlers; a top-of-module scan
    would silently lose those wires).
  * The SystemPulseMiddleware records REAL traffic (per-request, memory
    only) and the X-LM-Page header teaches the map its page→router wires,
    persisted through the /activity poller's request-scoped session.
  * POST layout / wires persist the owner's dragged cards + hand-drawn
    connections server-side (global_settings KV — no new table).
  * The original GET /api/system-map (the «راهنما» tab) stays untouched —
    covered by tests/test_phase4_assistant.py, not re-pinned here.
"""
import pytest

from app.services import system_pulse_service


@pytest.fixture(autouse=True)
def _fresh_pulse():
    """The pulse buffer + learned wires are process-global; isolate tests."""
    system_pulse_service.reset_for_tests()
    yield
    system_pulse_service.reset_for_tests()


# ── graph ────────────────────────────────────────────────────────────────────

def test_graph_is_introspected_from_the_app(api_client):
    res = api_client.get("/api/system-map/graph")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True and data["success"] is True

    ids = {n["id"] for n in data["nodes"]}
    # one representative per kind — existence, not counts (counts drift as
    # the codebase grows; that drift is exactly what the map is FOR).
    assert "router:app/routes/tasks.py" in ids
    assert "service:app/services/planner_service.py" in ids
    assert "model:app/models/task.py" in ids
    assert "page:Dashboard" in ids
    assert any(i.startswith("job:") for i in ids)

    kinds = data["stats"]["by_kind"]
    for kind in ("router", "service", "model", "page", "job"):
        assert kinds.get(kind, 0) > 0

    # engines list must exist (empty under TestClient — startup hooks
    # don't run without a lifespan context, and that's fine).
    assert isinstance(data["engines"], list)


def test_graph_edges_cover_lazy_imports_and_fk(api_client):
    data = api_client.get("/api/system-map/graph").json()
    edges = {(e["source"], e["target"], e["kind"]) for e in data["edges"]}

    # tasks.py imports sahat_service INSIDE a handler (lazy) — the full
    # AST walk must still see it.
    assert (
        "router:app/routes/tasks.py",
        "service:app/services/sahat_service.py",
        "imports",
    ) in edges

    # FK edge lifted to file granularity: tasks.user_id → users.id.
    assert (
        "model:app/models/task.py",
        "model:app/models/user.py",
        "fk",
    ) in edges

    # static page→router wiring extracted from the frontend source.
    assert any(
        s == "page:Tasks" and k == "calls" for s, t, k in edges
    ), "page:Tasks should have at least one static call edge"


def test_routes_meta_registry_matches_disk():
    """Every page in routesMeta.js must exist as a component file — the
    registry is what App.jsx routes from, so a broken entry means a broken
    page, and the diagram would show a card for something that can't render."""
    from pathlib import Path

    from app.services.system_graph_service import _REPO_ROOT, parse_routes_meta

    entries = parse_routes_meta()
    assert entries, "routesMeta.js must parse (format is load-bearing)"
    paths = [e["path"] for e in entries]
    assert "/" in paths and "/system-map" in paths
    for entry in entries:
        page_file = _REPO_ROOT / "frontend" / "src" / "pages" / f"{entry['page']}.jsx"
        assert page_file.exists(), f"routesMeta page {entry['page']} has no component file"


# ── pulse ────────────────────────────────────────────────────────────────────

def test_pulse_records_traffic_and_learns_page_wires(api_client):
    # a REAL request through the middleware, attributed to a page.
    api_client.get("/api/lists", headers={"X-LM-Page": "/lists"})

    res = api_client.get("/api/system-map/activity")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "app/routes/lists.py" in data["routers"]
    assert data["routers"]["app/routes/lists.py"]["count"] >= 1
    pair = {"page": "/lists", "router_file": "app/routes/lists.py"}
    assert any(
        p["page"] == pair["page"] and p["router_file"] == pair["router_file"]
        for p in data["pairs"]
    )

    # the learned wire is persisted (flushed through THIS request's session)
    # and comes back on the graph for future sessions.
    graph = api_client.get("/api/system-map/graph").json()
    assert any(
        w["page"] == "/lists" and w["router_file"] == "app/routes/lists.py"
        for w in graph["learned_wires"]
    )


def test_pulse_rejects_unregistered_page_headers(api_client):
    """X-LM-Page is untrusted client input: a value that is not a registered
    route pattern must not mint a page wire (unbounded-memory guard)."""
    api_client.get("/api/lists", headers={"X-LM-Page": "/definitely-not-a-page"})
    data = api_client.get("/api/system-map/activity").json()
    # the router pulse is still real …
    assert "app/routes/lists.py" in data["routers"]
    # … but no wire is learned from the bogus page.
    assert data["pairs"] == []


def test_layout_payload_size_is_bounded(api_client):
    huge = {"positions": {f"n{i}": {"x": i, "y": i} for i in range(20000)}}
    res = api_client.post("/api/system-map/layout", json={**huge, "view": {}, "hidden_kinds": []})
    assert res.status_code == 400


def test_pulse_ignores_the_maps_own_polling(api_client):
    # the diagram polls its own endpoints constantly; that must not light
    # the map up (self-noise exclusion in the middleware).
    api_client.get("/api/system-map/graph", headers={"X-LM-Page": "/system-map"})
    api_client.get("/api/system-map/activity", headers={"X-LM-Page": "/system-map"})
    data = api_client.get("/api/system-map/activity").json()
    assert data["routers"] == {}
    assert data["pairs"] == []


def test_pulse_never_touches_db_on_the_request_path(api_client, monkeypatch):
    """Recording is memory-only: even with a poisoned session factory the
    instrumented request must succeed (the middleware is a pure observer)."""
    import app.database as database

    def _boom(*args, **kwargs):  # pragma: no cover — must not be called
        raise AssertionError("middleware must not open a DB session")

    monkeypatch.setattr(database, "SessionLocal", _boom)
    res = api_client.get("/api/health", headers={"X-LM-Page": "/"})
    assert res.status_code == 200


# ── layout + manual wires ────────────────────────────────────────────────────

def test_layout_roundtrip(api_client):
    payload = {
        "positions": {"page:Tasks": {"x": 120, "y": 40}},
        "view": {},
        "hidden_kinds": ["model"],
    }
    res = api_client.post("/api/system-map/layout", json=payload)
    assert res.status_code == 200
    assert res.json()["ok"] is True

    graph = api_client.get("/api/system-map/graph").json()
    assert graph["layout"]["positions"] == {"page:Tasks": {"x": 120, "y": 40}}
    assert graph["layout"]["hidden_kinds"] == ["model"]


def test_manual_wires_add_and_remove_are_backend_synced(api_client):
    add = api_client.post(
        "/api/system-map/wires",
        json={
            "action": "add",
            "source": "page:Tasks",
            "target": "router:app/routes/lists.py",
            "label": "دستی",
        },
    )
    assert add.status_code == 200
    wires = add.json()["manual_wires"]
    assert wires == [
        {"source": "page:Tasks", "target": "router:app/routes/lists.py", "label": "دستی"}
    ]

    # survives a fresh graph read — the wire lives in the DB, not the client.
    graph = api_client.get("/api/system-map/graph").json()
    assert graph["manual_wires"] == wires

    removed = api_client.post(
        "/api/system-map/wires",
        json={
            "action": "remove",
            "source": "page:Tasks",
            "target": "router:app/routes/lists.py",
        },
    )
    assert removed.status_code == 200
    assert removed.json()["manual_wires"] == []


def test_manual_wires_reject_bad_payloads(api_client):
    bad_action = api_client.post(
        "/api/system-map/wires",
        json={"action": "explode", "source": "a", "target": "b"},
    )
    assert bad_action.status_code == 400

    self_wire = api_client.post(
        "/api/system-map/wires",
        json={"action": "add", "source": "a", "target": "a"},
    )
    assert self_wire.status_code == 400
