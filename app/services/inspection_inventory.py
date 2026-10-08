"""The app's whole surface — every page, every sub-page, every control — derived.

The owner asked that «نظارت و سرکشی» «بتونه همه صفحات و زیر صفحات و مختصات دقیق
همه جا … چه مواردی که الان هست و چه بعدا اضافه میشه رو بشناسه و ثبت کنه». A hand
list cannot do the second half — it goes stale the day a page is added — so,
exactly like the live system map (`system_graph_service`) and ALLIN1's
`inventory.py`, NOTHING here is a list. It is read from the registries the app
already obeys:

  * pages      — `frontend/src/lib/routesMeta.js` (the file App.jsx routes from,
                 so a page missing there does not exist);
  * sub-pages  — each page component's `TABS` / `QUARANTINED_TABS` arrays
                 (`{ id: 'x', label: 'y' }`), the convention every hub follows;
                 each tab becomes `<route>?tab=<id>`, the URL that opens it;
  * controls   — buttons / inputs / forms / links / API calls / testids counted
                 in each page's source (the static half of «مختصاتِ همه‌جا»; the
                 measured half — real element rectangles — is the supervisor's
                 `page_map.py`, run in a browser);
  * backend    — the routes FastAPI actually registered, services, models.

A page added tomorrow that follows the conventions appears here with no edit.
A count that DROPS between two runs is the alarm that a capability vanished
(project rule 2) — which is why an unmeasurable count is `None`, never `0`.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
FE = ROOT / "frontend" / "src"
PAGES_DIR = FE / "pages"

_TABS_BLOCK = re.compile(r"const\s+(QUARANTINED_TABS|TABS)\s*=\s*\[(.*?)\];", re.S)
_TAB_ENTRY = re.compile(r"\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'")


def _read(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:  # noqa: BLE001
        return ""


def page_tabs(src: str) -> List[Dict[str, Any]]:
    """`TABS` / `QUARANTINED_TABS` entries of one page component, in order."""
    out: List[Dict[str, Any]] = []
    seen = set()
    for block in _TABS_BLOCK.finditer(src or ""):
        quarantined = block.group(1) == "QUARANTINED_TABS"
        for m in _TAB_ENTRY.finditer(block.group(2)):
            tid, label = m.group(1), m.group(2)
            if tid in seen:
                continue
            seen.add(tid)
            out.append({"id": tid, "label": label, "quarantined": quarantined})
    return out


def page_controls(src: str) -> Dict[str, int]:
    return {
        "lines": src.count("\n") + 1 if src else 0,
        "buttons": len(re.findall(r"<button\b", src)),
        "inputs": len(re.findall(r"<(?:input|textarea|select)\b", src)),
        "forms": len(re.findall(r"<form\b", src)),
        "links": len(re.findall(r"<(?:Link|NavLink|a)\b", src)),
        "api_calls": len(re.findall(r"\bapi\.(?:get|post|put|patch|delete)\(", src)),
        "testids": len(re.findall(r"data-testid=", src)),
    }


def pages() -> List[Dict[str, Any]]:
    """Every routed page (public ones too — they are surfaces), with its sub-pages."""
    from app.services.system_graph_service import parse_routes_meta

    out = []
    canonical: Dict[str, str] = {}
    for e in parse_routes_meta():
        comp = PAGES_DIR / f"{e['page']}.jsx"
        src = _read(comp)
        tabs = page_tabs(src)
        parametric = ":" in e["path"]
        # `/personality`, `/recommendations` … are other doors into AssistantHub.
        # Listing its tabs under every door would multiply one hub into four, so
        # the sub-pages hang on the FIRST route of a component and the others
        # say whose alias they are.
        alias_of = canonical.get(e["page"], "")
        canonical.setdefault(e["page"], e["path"])
        out.append({
            "path": e["path"],
            "page": e["page"],
            "label": e["label"],
            "group": e["group"],
            "file": str(comp.relative_to(ROOT)) if comp.exists() else "",
            "parametric": parametric,
            "alias_of": alias_of,
            **page_controls(src),
            "tabs": tabs,
            # the exact URLs that open each sub-page — what `reopen` will hold
            "subpages": [] if alias_of else [
                {"url": f"{e['path']}?tab={t['id']}", "label": f"{e['label']} ← {t['label']}",
                 "quarantined": t["quarantined"]}
                for t in tabs
            ],
        })
    return out


def backend(app=None) -> Dict[str, Any]:
    routes: Optional[List[Dict[str, Any]]] = None
    errors: List[str] = []
    if app is not None:
        try:
            routes = sorted(
                ({"path": r.path, "methods": sorted(getattr(r, "methods", None) or [])}
                 for r in app.routes if getattr(r, "path", "").startswith("/api")),
                key=lambda x: (x["path"], x["methods"]))
        except Exception as exc:  # noqa: BLE001
            errors.append(f"routes: {exc!r}")
    services = sorted(
        str(p.relative_to(ROOT / "app" / "services")).replace(".py", "")
        for p in (ROOT / "app" / "services").rglob("*.py")
        if p.name != "__init__.py" and "__pycache__" not in p.parts)
    models = sorted(p.stem for p in (ROOT / "app" / "models").glob("*.py")
                    if p.stem != "__init__")
    return {"routes": routes, "services": services, "models": models, "errors": errors}


def build(app=None, report_counts: Optional[Dict[str, Dict[str, int]]] = None) -> Dict[str, Any]:
    pg = pages()
    be = backend(app)
    counts = report_counts or {}
    for p in pg:
        p["reports"] = counts.get(p["path"], {})
    totals = {
        "pages": len(pg),
        "subpages": sum(len(p["subpages"]) for p in pg),
        "buttons": sum(p["buttons"] for p in pg),
        "inputs": sum(p["inputs"] for p in pg),
        "forms": sum(p["forms"] for p in pg),
        "links": sum(p["links"] for p in pg),
        "api_calls": sum(p["api_calls"] for p in pg),
        # None = NOT MEASURED, never 0 — a 0 here would read as «every route deleted»
        "api_routes": len(be["routes"]) if be["routes"] is not None else None,
        "services": len(be["services"]),
        "models": len(be["models"]),
    }
    return {"pages": pg, "backend": be, "totals": totals, "errors": be["errors"]}
