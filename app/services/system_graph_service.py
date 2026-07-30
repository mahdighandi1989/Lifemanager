"""نقشهٔ زندهٔ سیستم — the self-describing architecture graph.

Builds the live diagram's nodes and edges by INTROSPECTING the running
program instead of maintaining a hand-written inventory, so the map can
never go stale (owner's standing directive: «هر تغییری باید بلافاصله در
نقشه نمایان شود»):

  * router nodes   ← the FastAPI route table (``app.routes`` at runtime)
  * service nodes  ← the files under ``app/services``
  * model nodes    ← ``Base.registry`` + FK edges from ``Base.metadata``
  * engine nodes   ← the asyncio background tasks parked on ``app.state``
  * job nodes      ← ``jobs_engine.JOBS`` (the unified scheduler registry)
  * page nodes     ← ``frontend/src/lib/routesMeta.js`` (the same registry
                     App.jsx renders its routes from — a page that isn't
                     there doesn't even route, so it can't be missing here)
  * import edges   ← a FULL AST walk per backend file. 31 of 59 routers
                     lazy-import inside handlers, so a top-of-module scan
                     would silently drop half the wiring — ``ast.walk``
                     over the whole tree is load-bearing, not paranoia.
  * call edges     ← page/component source scanned for api.*/fetch path
                     literals, attributed to pages through their import
                     closure, then matched against the mounted route table.

Everything is cached against a cheap mtime signature of the scanned
trees; any file change invalidates the cache so the next fetch of the
graph reflects it immediately. All scanning is fail-open — a parse error
in one file must never take the map down with it.
"""
from __future__ import annotations

import ast
import logging
import os
import re
import time
from pathlib import Path

logger = logging.getLogger(__name__)

_REPO_ROOT = Path(__file__).resolve().parents[2]
_ROUTES_DIR = _REPO_ROOT / "app" / "routes"
_SERVICES_DIR = _REPO_ROOT / "app" / "services"
_MODELS_DIR = _REPO_ROOT / "app" / "models"
_FRONTEND_SRC = _REPO_ROOT / "frontend" / "src"
_ROUTES_META = _FRONTEND_SRC / "lib" / "routesMeta.js"

# Cosmetic Persian labels for well-known backend domains. Fallback is the
# file stem, so a missing entry can never hide a node — it just reads Latin.
_FA_LABELS = {
    "tasks": "کارها", "projects": "پروژه‌ها", "lists": "لیست‌ها",
    "todo_items": "آیتم‌های لیست", "person": "افراد", "finance": "مالی",
    "writings": "نوشته‌ها", "inbox": "صندوق ورودی", "brain": "رشد ذهن",
    "attention": "موتور توجه", "directives": "نهادینه‌سازی",
    "assistant_chat": "دستیار سراسری", "global_search": "جستجوی سراسری",
    "system_map": "نقشهٔ سیستم", "activity_log": "لاگ فعالیت‌ها",
    "command_center": "میز فرمان", "weekly_review": "مرور هفتگی",
    "backup": "پشتیبان‌گیری", "trash": "سطل زباله", "sahat": "خداشهر",
    "self_improvement": "خودسازی", "settings": "تنظیمات",
    "notifications": "اعلان‌ها", "auth": "ورود و هویت", "users": "کاربران",
    "ai": "هوش مصنوعی", "telegram": "تلگرام", "drive": "درایو",
    "google_sync": "گوگل من", "dev_center": "مرکز توسعه",
    "documents": "مدارک", "subscriptions": "اشتراک‌ها", "assets": "دارایی‌ها",
    "imports": "ایمپورت داده", "merge": "ادغام", "deduplication": "تکراری‌ها",
    "cleanup": "پاک‌سازی", "planner": "برنامه‌ریز", "webhook": "وب‌هوک",
    "identity": "هویت", "vehicle": "خودرو", "location": "موقعیت",
    "context": "زمینه", "oversight": "نظارت", "interests": "علاقه‌ها",
    "integrations": "اتصال‌ها", "external_projects": "پروژه‌های بیرونی",
    "local_files": "فایل‌های محلی", "files": "فایل‌ها",
}

_ENGINE_LABELS = {
    "tg_webhook": "نگهبان وب‌هوک تلگرام", "brain_reminder": "یادآور رشد ذهن",
    "attention": "موتور توجه", "dev_sync": "همگام‌سازی توسعه",
    "google_sync": "همگام‌سازی گوگل", "backup": "پشتیبان‌گیری شبانه",
    "jobs": "موتور واحد زمان‌بندی", "directive": "موتور نهادینه‌سازی",
}


def _fa(stem: str) -> str:
    return _FA_LABELS.get(stem, stem)


def _rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(_REPO_ROOT).as_posix()
    except Exception:
        return str(path)


# ── cache ────────────────────────────────────────────────────────────────────

_cache: dict = {"signature": None, "graph": None}


def _tree_signature() -> tuple:
    """Cheap change detector: (count, max mtime) over every scanned tree.

    Any edit/add/delete under app/ or frontend/src flips the signature, so
    the very next /graph request rebuilds — the map is never a second stale.
    """
    total, latest = 0, 0.0
    for root in (_ROUTES_DIR, _SERVICES_DIR, _MODELS_DIR, _FRONTEND_SRC):
        if not root.exists():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in ("__pycache__", "node_modules", "dist")]
            for name in filenames:
                if not name.endswith((".py", ".js", ".jsx")):
                    continue
                total += 1
                try:
                    mtime = os.stat(os.path.join(dirpath, name)).st_mtime
                    if mtime > latest:
                        latest = mtime
                except OSError:
                    continue
    return (total, latest)


def invalidate_cache() -> None:
    _cache["signature"] = None
    _cache["graph"] = None


# ── backend AST scan ─────────────────────────────────────────────────────────

def _py_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    return [
        p for p in sorted(root.rglob("*.py"))
        if "__pycache__" not in p.parts
    ]


def _module_name(path: Path) -> str:
    """app/services/ai/nlp_service.py → app.services.ai.nlp_service"""
    rel = _rel(path)
    return rel[:-3].replace("/", ".") if rel.endswith(".py") else rel.replace("/", ".")


def _module_file(dotted: str) -> str | None:
    """Resolve a dotted module to the repo file that defines it (or None)."""
    base = _REPO_ROOT / Path(dotted.replace(".", "/"))
    for candidate in (base.with_suffix(".py"), base / "__init__.py"):
        if candidate.exists():
            return _rel(candidate)
    return None


def _scan_imports(path: Path) -> set[str]:
    """Every app.routes/app.services/app.models file this file imports.

    Full-tree ``ast.walk`` so lazy inside-function imports count too, and
    relative imports (``from .provider_service import …`` in app/services/ai)
    resolve against the file's own package.
    """
    try:
        tree = ast.parse(path.read_text(encoding="utf-8"))
    except Exception as exc:
        logger.debug("system graph: skip unparsable %s: %s", path, exc)
        return set()

    package_parts = _module_name(path).split(".")[:-1]  # containing package
    targets: set[str] = set()

    def _note(dotted: str, names: list[str] | None = None) -> None:
        if not dotted.startswith(("app.routes", "app.services", "app.models")):
            return
        resolved = _module_file(dotted)
        if resolved:
            targets.add(resolved)
        # `from app.services import person_service` → the alias names are
        # themselves submodules; resolve each one that exists as a file.
        for alias in names or []:
            sub = _module_file(f"{dotted}.{alias}")
            if sub:
                targets.add(sub)

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                _note(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.level:  # relative import — resolve against our package
                anchor = package_parts[: len(package_parts) - node.level + 1]
                dotted = ".".join(anchor + ([node.module] if node.module else []))
            else:
                dotted = node.module or ""
            _note(dotted, [a.name for a in node.names])
    return targets


# ── frontend scan ────────────────────────────────────────────────────────────

_ROUTE_ENTRY_RE = re.compile(
    r"path:\s*'([^']+)'\s*,\s*page:\s*'([^']+)'\s*,\s*label:\s*'([^']*)'\s*,\s*group:\s*'([^']*)'"
)
_API_CALL_RES = [
    re.compile(r"""api\.(?:get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)"""),
    re.compile(r"""fetch\(\s*`\$\{API_BASE\}([^`]*)`"""),
    re.compile(r"""fetch\(\s*[`'"](/api/[^`'"]*)"""),
]
_IMPORT_RE = re.compile(r"""import\s+[\w{},\s*]+\s+from\s+['"](\.[^'"]+)['"]""")
_TEMPLATE_PARAM_RE = re.compile(r"\$\{[^}]*\}")


def parse_routes_meta() -> list[dict]:
    """Read the SPA's route registry (the one App.jsx actually renders from).

    routesMeta.js keeps one `{ path: '…', page: '…', label: '…', group: '…' }`
    entry per line precisely so this parser stays trivial — the format is
    load-bearing (documented in that file).
    """
    if not _ROUTES_META.exists():
        return []
    entries = []
    try:
        for match in _ROUTE_ENTRY_RE.finditer(_ROUTES_META.read_text(encoding="utf-8")):
            path, page, label, group = match.groups()
            entries.append({"path": path, "page": page, "label": label, "group": group})
    except Exception as exc:
        logger.debug("system graph: routesMeta parse failed: %s", exc)
    return entries


def _frontend_files() -> list[Path]:
    if not _FRONTEND_SRC.exists():
        return []
    return [
        p for p in sorted(_FRONTEND_SRC.rglob("*.js*"))
        if p.suffix in (".js", ".jsx")
        and "node_modules" not in p.parts
        and "dist" not in p.parts
        and "__tests__" not in p.parts
        and not p.name.endswith(".test.js")
        and not p.name.endswith(".test.jsx")
    ]


def _normalize_call(raw: str) -> str | None:
    """'/tasks/${task.id}/steps' → '/api/tasks/{p}/steps' (axios base is /api)."""
    path = _TEMPLATE_PARAM_RE.sub("{p}", raw.strip())
    if not path.startswith("/"):
        return None
    if not path.startswith("/api/"):
        path = "/api" + path
    return path.split("?")[0]


def _scan_frontend() -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    """Return (calls_by_file, imports_by_file) for frontend source files."""
    calls: dict[str, set[str]] = {}
    imports: dict[str, set[str]] = {}
    for path in _frontend_files():
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        rel = _rel(path)
        found = set()
        for regex in _API_CALL_RES:
            for raw in regex.findall(text):
                normalized = _normalize_call(raw)
                if normalized:
                    found.add(normalized)
        if found:
            calls[rel] = found
        deps = set()
        for spec in _IMPORT_RE.findall(text):
            target = (path.parent / spec).resolve()
            for candidate in (
                target,
                target.with_suffix(".jsx"),
                target.with_suffix(".js"),
                target / "index.jsx",
                target / "index.js",
            ):
                if candidate.is_file():
                    deps.add(_rel(candidate))
                    break
        if deps:
            imports[rel] = deps
    return calls, imports


def _page_call_closure(
    page_file: str, calls: dict[str, set[str]], imports: dict[str, set[str]]
) -> set[str]:
    """API paths reachable from a page through its import closure — so calls
    made by shared components (ActivityLogPanel etc.) attribute to every page
    that mounts them."""
    seen, stack, found = set(), [page_file], set()
    while stack:
        current = stack.pop()
        if current in seen:
            continue
        seen.add(current)
        found |= calls.get(current, set())
        stack.extend(imports.get(current, ()))
    return found


# ── route-table matching ─────────────────────────────────────────────────────

def _router_paths(app) -> tuple[dict[str, dict], list[tuple[list[str], str]]]:
    """(router nodes keyed by file, [(path_segments, file)] matcher table)."""
    routers: dict[str, dict] = {}
    matcher: list[tuple[list[str], str]] = []
    for route in app.routes:
        endpoint = getattr(route, "endpoint", None)
        module = getattr(endpoint, "__module__", "") or ""
        if not module.startswith("app.routes."):
            continue
        file_key = _module_file(module)
        if not file_key:
            continue
        node = routers.setdefault(
            file_key,
            {"endpoints": [], "paths": set()},
        )
        methods = sorted(m for m in (getattr(route, "methods", None) or []) if m != "HEAD")
        path = getattr(route, "path", "")
        entry = {"methods": methods, "path": path}
        if entry not in node["endpoints"]:
            node["endpoints"].append(entry)
        if path not in node["paths"]:
            node["paths"].add(path)
            matcher.append(([s for s in path.split("/") if s], file_key))
    return routers, matcher


def _match_call_to_router(call_path: str, matcher: list[tuple[list[str], str]]) -> str | None:
    """Segment-wise match of a normalized frontend literal against mounted
    route templates ({p} on the frontend side, {param} on the backend side
    both count as wildcards)."""
    segments = [s for s in call_path.split("/") if s]
    for template, file_key in matcher:
        if len(template) != len(segments):
            continue
        if all(
            t.startswith("{") or s == "{p}" or t == s
            for t, s in zip(template, segments)
        ):
            return file_key
    return None


# ── graph assembly ───────────────────────────────────────────────────────────

def build_graph(app) -> dict:
    """The full architecture graph. Cached until any scanned file changes."""
    signature = _tree_signature()
    if _cache["signature"] == signature and _cache["graph"] is not None:
        return _cache["graph"]

    nodes: list[dict] = []
    edges: list[dict] = []
    edge_seen: set[tuple] = set()

    def add_edge(source: str, target: str, kind: str) -> None:
        if source == target:
            return
        key = (source, target, kind)
        if key in edge_seen:
            return
        edge_seen.add(key)
        edges.append({"source": source, "target": target, "kind": kind})

    node_ids: set[str] = set()

    def add_node(node_id: str, kind: str, label: str, sub: str = "", detail: dict | None = None):
        if node_id in node_ids:
            return
        node_ids.add(node_id)
        nodes.append({
            "id": node_id, "kind": kind, "label": label,
            "sub": sub, "detail": detail or {},
        })

    # Routers — from the LIVE route table, so dual mounts and conditional
    # mounts (auth_google) reflect what is actually being served.
    routers, matcher = _router_paths(app)
    for file_key, info in sorted(routers.items()):
        stem = Path(file_key).stem
        add_node(
            f"router:{file_key}", "router", _fa(stem), stem,
            {"file": file_key, "endpoints": info["endpoints"]},
        )

    # Services — every file under app/services (the smallest parts count).
    service_files = [_rel(p) for p in _py_files(_SERVICES_DIR)]
    for file_key in service_files:
        stem = Path(file_key).stem
        if stem == "__init__":
            continue
        pkg = Path(file_key).parent.name
        sub = f"{pkg}/{stem}" if pkg != "services" else stem
        add_node(f"service:{file_key}", "service", stem, sub, {"file": file_key})

    # Models — via the SQLAlchemy registry, grouped per file, with the
    # tables each file owns listed on the card.
    tables_by_file: dict[str, list[str]] = {}
    classes_by_file: dict[str, list[str]] = {}
    table_to_file: dict[str, str] = {}
    try:
        from app.database import Base

        for mapper in Base.registry.mappers:
            cls = mapper.class_
            file_key = _module_file(cls.__module__)
            if not file_key:
                continue
            table = getattr(cls, "__tablename__", None)
            classes_by_file.setdefault(file_key, []).append(cls.__name__)
            if table:
                tables_by_file.setdefault(file_key, []).append(table)
                table_to_file[table] = file_key
        for file_key in sorted(classes_by_file):
            stem = Path(file_key).stem
            add_node(
                f"model:{file_key}", "model", _fa(stem), stem,
                {
                    "file": file_key,
                    "classes": sorted(set(classes_by_file[file_key])),
                    "tables": sorted(set(tables_by_file.get(file_key, []))),
                },
            )
        # FK edges (table → referenced table, lifted to file granularity).
        for table in Base.metadata.tables.values():
            source = table_to_file.get(table.name)
            if not source:
                continue
            for fk in table.foreign_keys:
                target = table_to_file.get(fk.column.table.name)
                if target:
                    add_edge(f"model:{source}", f"model:{target}", "fk")
    except Exception as exc:
        logger.debug("system graph: model introspection failed: %s", exc)

    # Import edges — routers→services/models and services→services/models.
    scanned = [(p, "router") for p in _py_files(_ROUTES_DIR)] + [
        (p, "service") for p in _py_files(_SERVICES_DIR)
    ]
    for path, kind in scanned:
        rel = _rel(path)
        if Path(rel).stem == "__init__":
            continue
        source_id = f"{kind}:{rel}"
        if source_id not in node_ids:
            continue
        for target_file in _scan_imports(path):
            if target_file.startswith("app/services/"):
                target_id = f"service:{target_file}"
            elif target_file.startswith("app/models/"):
                target_id = f"model:{target_file}"
            elif target_file.startswith("app/routes/"):
                target_id = f"router:{target_file}"
            else:
                continue
            if target_id in node_ids:
                add_edge(source_id, target_id, "imports")

    # Engines — the asyncio loops actually parked on app.state right now.
    # Liveness comes from the task object itself, so a dead loop shows dead.
    engines = engine_snapshot(app)
    for engine in engines:
        add_node(
            f"engine:{engine['key']}", "engine",
            _ENGINE_LABELS.get(engine["key"], engine["key"]),
            engine["key"], {"alive": engine["alive"]},
        )
        if engine.get("service_file"):
            target_id = f"service:{engine['service_file']}"
            if target_id in node_ids:
                add_edge(f"engine:{engine['key']}", target_id, "runs")

    # Scheduler jobs — one card per registered job in the unified engine.
    try:
        from app.services.jobs_engine import JOBS

        for key, title_fa, interval_fn, body in JOBS:
            try:
                interval = float(interval_fn())
            except Exception:
                interval = None
            add_node(
                f"job:{key}", "job", title_fa, key,
                {"interval_minutes": interval},
            )
            if "engine:jobs" in node_ids:
                add_edge("engine:jobs", f"job:{key}", "runs")
            body_file = _module_file(getattr(body, "__module__", "") or "")
            if body_file and f"service:{body_file}" in node_ids:
                add_edge(f"job:{key}", f"service:{body_file}", "runs")
    except Exception as exc:
        logger.debug("system graph: jobs introspection failed: %s", exc)

    # Pages — from the SPA route registry, one card per page component with
    # all its URLs, then static call edges through the import closure.
    meta = parse_routes_meta()
    calls, imports = _scan_frontend()
    pages_by_component: dict[str, list[dict]] = {}
    for entry in meta:
        pages_by_component.setdefault(entry["page"], []).append(entry)
    for component, entries in sorted(pages_by_component.items()):
        label = entries[0]["label"] or component
        paths = [e["path"] for e in entries]
        page_file = f"frontend/src/pages/{component}.jsx"
        add_node(
            f"page:{component}", "page", label, paths[0],
            {"paths": paths, "group": entries[0]["group"], "file": page_file},
        )
        for call_path in sorted(_page_call_closure(page_file, calls, imports)):
            router_file = _match_call_to_router(call_path, matcher)
            if router_file:
                add_edge(f"page:{component}", f"router:{router_file}", "calls")

    graph = {
        "nodes": nodes,
        "edges": edges,
        "generated_at": time.time(),
        "stats": {
            "nodes": len(nodes),
            "edges": len(edges),
            "by_kind": _count_kinds(nodes),
        },
    }
    _cache["signature"] = signature
    _cache["graph"] = graph
    return graph


def _count_kinds(nodes: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for node in nodes:
        counts[node["kind"]] = counts.get(node["kind"], 0) + 1
    return counts


# ── engine liveness ──────────────────────────────────────────────────────────

def engine_snapshot(app) -> list[dict]:
    """Every background asyncio task parked on app.state, with REAL liveness
    (``task.done()`` on the actual task object — not a hardcoded list)."""
    engines: list[dict] = []
    try:
        state = vars(app.state._state) if hasattr(app.state, "_state") else vars(app.state)
    except Exception:
        state = {}
    for attr, value in sorted(state.items()):
        if not attr.endswith("_task"):
            continue
        key = attr[: -len("_task")]
        try:
            alive = not value.done()
        except Exception:
            continue
        service_file = None
        try:
            coro = value.get_coro()
            filename = getattr(getattr(coro, "cr_code", None), "co_filename", None)
            if filename:
                rel = _rel(Path(filename))
                if rel.startswith("app/"):
                    service_file = rel
        except Exception:
            pass
        engines.append({"key": key, "alive": alive, "service_file": service_file})
    return engines
