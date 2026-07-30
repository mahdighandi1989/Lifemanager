---
title: Live architecture diagram generated from runtime introspection (never goes stale)
tags:
  - introspection
  - architecture-map
  - observability
  - fastapi
  - ast
  - svg
topic_canonical: live-architecture-diagram-from-runtime-introspection
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-07-30T00:00:00Z"
created_at: "2026-07-30"
updated_at: "2026-07-30"
merged_from: []
---

# Live architecture diagram from runtime introspection

## 🎯 چالش / Challenge

The owner of a grown, many-page system no longer knows what exists, what
connects to what, or where work is actually flowing («نمی‌دانم چه چیزی با
چه چیزی مربوط است»). A hand-curated "system map" page had already been
built — and it was exactly the failure mode: a static list that goes stale
the moment anyone ships a change, misses most components, and shows no
real activity. The requirements that break naive approaches:

1. EVERY component must appear (pages, HTTP routers, services, DB models,
   background loops, scheduled jobs) — including ones added tomorrow.
2. The map must update itself on every change, with zero manual steps.
3. "Activity lights" must reflect REAL traffic, not a decorative animation.
4. Dragging/connecting cards must persist server-side.

## 💡 راه‌حل / Solution

**Derive the map from the program itself; never write about the program.**

- **Router nodes** from the live framework route table at request time
  (group routes by `endpoint.__module__`); dual mounts and conditionally
  mounted routers reflect what is actually served.
- **Model nodes + FK edges** from the ORM registry/metadata (string FKs
  `"table.col"` are trivially resolvable to table→file edges).
- **Service nodes** = source files under the services tree.
- **Import edges** from a FULL-tree AST walk per file (`ast.walk`), NOT a
  top-of-module scan: in the audited codebase 31/59 routers imported
  services lazily inside handlers — a module-top scan silently loses half
  the wiring. Resolve relative imports against the file's package, and
  `from pkg import submodule` by probing `pkg/submodule.py`.
- **Background-engine nodes with real liveness**: enumerate asyncio tasks
  parked on app state (`*_task` attrs), `task.done()` is the truth; the
  coroutine's `cr_code.co_filename` yields the owning service file.
- **Page nodes** from the SPA's route registry file — the SAME data the
  router component renders from. One registry, three consumers (router,
  API-client page header, backend map parser) means a page that isn't in
  the registry doesn't even render, so the map can't miss it.
- **Page→API edges two ways**: statically (regex-scan page/component
  sources for HTTP-call literals, normalize `${…}`→`{p}`, attribute
  component calls to pages via the import closure, then segment-match
  against mounted route templates) AND learned from real traffic (client
  attaches an `X-Page` header carrying the ROUTE PATTERN; middleware
  aggregates (page, router) pairs).
- **Freshness** via an mtime signature over the scanned trees; any file
  change invalidates the cache, so the next fetch rebuilds. Record in the
  project's contributor docs that the map is convention-derived: "if your
  change doesn't appear, you bypassed a registration convention — fix the
  registration, never hand-edit the map."
- **Real pulse**: a tiny observe-only ASGI middleware appends
  (router-module, page, status, duration) to a bounded in-memory deque
  AFTER the response; an activity endpoint aggregates a trailing window.
  Only measured things light up (routers, page wires, engine liveness);
  structural wires stay grey — refusing to fake unmeasured flow is what
  keeps the owner's trust.
- **Server-synced manual layout/wires**: drag positions and hand-drawn
  card-to-card wires POST to endpoints that store JSON in the existing
  key-value settings table (`key = "map_layout:{user_id}"`) — no new
  table, no migration risk, survives reload/devices.

## 🧪 نمونه کد (Anonymized)

```python
def scan_imports(path: Path, repo_root: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    pkg = module_name(path).split(".")[:-1]
    found: set[str] = set()
    for node in ast.walk(tree):              # WHOLE tree — lazy imports too
        if isinstance(node, ast.ImportFrom):
            if node.level:                   # relative → resolve vs package
                base = pkg[: len(pkg) - node.level + 1]
                dotted = ".".join(base + ([node.module] if node.module else []))
            else:
                dotted = node.module or ""
            note(dotted, [a.name for a in node.names], found)
        elif isinstance(node, ast.Import):
            for a in node.names:
                note(a.name, [], found)
    return found
```

```python
class PulseMiddleware(BaseHTTPMiddleware):        # observe-only, fail-open
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        try:
            route = request.scope.get("route")    # set by router in call_next
            mod = getattr(getattr(route, "endpoint", None), "__module__", "")
            if mod.startswith("app.routes.") and not is_map_endpoint(route):
                record(mod, request.headers.get("x-page"), response.status_code)
        except Exception:
            pass                                  # never break a real request
        return response
```

```jsx
{isHot && (           // light travels ONLY on wires with measured traffic
  <circle r="4" fill="#38bdf8">
    <animateMotion dur="1.4s" repeatCount="indefinite" path={edgePathD} />
  </circle>
)}
```

## ⚠️ نکات حیاتی / Pitfalls

- **`from __future__ import annotations` breaks decorated route params.**
  If a shared error-handling decorator (functools.wraps) lives in another
  module, postponed string annotations are resolved against THAT module's
  globals; `request: Request` becomes an unresolvable string and FastAPI
  silently reclassifies it as a required QUERY param → every call 422s.
  Either avoid the future-import in route modules or import the needed
  types where the wrapper is defined.
- **Top-of-module import scans lie.** Measure the lazy-import ratio before
  trusting any static dependency graph; walk the full AST.
- **The map must not light itself.** Exclude the map's own graph/activity
  endpoints from pulse recording, or its polling makes it look permanently
  "active" and drowns real signal.
- **Middleware must never open its own DB session.** Test fixtures
  override the request-scoped session dependency only; a private engine in
  middleware hits the real DB in tests and can silently bypass overrides.
  Keep the request path memory-only; flush learned data lazily through the
  session of whoever polls the read endpoint.
- **Only light what you measure.** Animating router→service or FK wires
  from inferred causality reads as alive but is fiction; the owner asked
  for real. Grey structural wires + lit measured wires is the honest mix.
- **SVG `animateMotion` needs no CSS/library** — a moving circle along the
  edge's own path string does the "light in the wire" effect natively and
  respects a Tailwind-only constraint.
- **Wheel zoom needs a native non-passive listener** (React's synthetic
  onWheel is passive → `preventDefault` warning + page scrolls).
- **Pointer-captured drags don't fire enter/leave on drop targets** — hit
  the drop with `document.elementFromPoint(...)` + `closest('[data-id]')`.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Inventory the runtime registries your framework already keeps (route
   table, ORM metadata, task/scheduler registries, app-state loops) — each
   is a free, always-current node source; only fall back to file scanning
   for layers with no registry.
2. Find or create the ONE registry the UI router renders from; make every
   other consumer (map, telemetry header) read the same registry so pages
   can't exist outside it. Give it a machine-parseable per-line format if
   a non-JS process must read it, and mark the format load-bearing.
3. Build edges in two passes: static (full-AST import walk + call-literal
   scan with param normalization) for instant completeness, and
   traffic-learned (an origin header aggregated by middleware) for truth;
   render learned-only edges distinctly.
4. Cache the whole graph behind a cheap tree signature (file count + max
   mtime); invalidate on any change so freshness needs no manual step.
5. Keep the pulse path allocation-cheap, bounded (ring buffer), wrapped in
   a broad try/except, and DB-free; persist aggregates lazily via a read
   endpoint's request-scoped session.
6. Persist user layout/manual wires as JSON in an existing KV store keyed
   per user — a new table (with its migration chain) is rarely worth it.
7. Write the binding rule into contributor docs: the map is derived from
   conventions; a missing component means a bypassed convention — fix the
   registration, never the map. Add tests that pin (a) one lazy-import
   edge, (b) registry↔disk consistency, (c) self-noise exclusion, and
   (d) the layout/wires roundtrip.

## 🔗 References

- Starlette sets `scope["route"]` during routing — readable after
  `call_next` in any outer middleware.
- Python `ast.walk` visits nested function bodies (lazy imports included).
- SMIL `animateMotion` for path-following markers (no JS animation loop).
