#!/usr/bin/env python3
"""«مختصاتِ دقیقِ همه‌جا» — every control on every page and sub-page, MEASURED.

The owner asked that the supervisor «همه صفحات و زیر صفحات و مختصات دقیق همه جا
… رو بشناسه و ثبت کنه». `inventory.py` knows every page and tab from source;
this opens each of them in a real Chromium and records, for every interactive
element, the SAME verified selector the capture overlay stores
(`frontend/src/lib/inspection/spot.js` → `querySelectorPath`) and its document
rectangle. So a sheet's anchor can be checked against the map, and a control
that moved or vanished between two runs is a finding.

It also records what a page DID while it loaded — console errors and every
response ≥ 400 with its URL (a bare «Failed to load resource» is not
actionable; ALLIN1 learned that the hard way).

    python3 scripts/supervisor/page_map.py                       # local, throwaway SQLite
    python3 scripts/supervisor/page_map.py --base https://…      # read-only look at production
    python3 scripts/supervisor/page_map.py --only /settings      # one page (and its tabs)

Writes `docs/supervisor/page_map.json` (compact) and prints a one-line summary.
Exit 2 when the crawl could not START (no browser, server would not come up) —
«not measured» is never reported as «no controls».
"""
from __future__ import annotations

import argparse
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(Path(__file__).resolve().parent))
OUT = ROOT / "docs" / "supervisor" / "page_map.json"
VIEWPORT = {"width": 1366, "height": 900}
MAX_ELEMENTS = 400

# The selector algorithm MUST match the capture overlay's, or the map and the
# sheets would describe the same control in two dialects.
COLLECT_JS = r"""
(max) => {
  const sel = (el) => {
    const parts = []; let node = el;
    while (node && parts.length < 9) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'html') break;
      if (tag === 'body') { parts.unshift('body'); break; }
      if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) { parts.unshift('#' + node.id); break; }
      const tid = node.getAttribute && node.getAttribute('data-testid');
      if (tid && /^[\w-]+$/.test(tid)) { parts.unshift(`[data-testid="${tid}"]`); break; }
      const parent = node.parentElement;
      if (!parent) { parts.unshift(tag); break; }
      const same = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
      parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag);
      node = parent;
    }
    const path = parts.join(' > ');
    try { return document.querySelector(path) === el ? path : ''; } catch { return ''; }
  };
  const nodes = Array.from(document.querySelectorAll(
    'button, a[href], input, select, textarea, [role="tab"], [role="button"], [data-testid]'));
  const out = [];
  for (const el of nodes) {
    if (el.closest('[data-inspection-layer]')) continue;          // our own overlay is not the page
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;                    // not visible
    const text = (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '')
      .replace(/\s+/g, ' ').trim().slice(0, 60);
    out.push([sel(el), el.tagName.toLowerCase(), el.getAttribute('data-testid') || '', text,
              Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]);
    if (out.length >= max) break;
  }
  const doc = document.documentElement;
  return { elements: out, doc: [doc.scrollWidth, doc.scrollHeight],
           surface: (document.querySelector('[data-report-surface]') || {}).getAttribute?.('data-report-surface') || '' };
}
"""


def _free_port() -> int:
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def _start_local() -> tuple[subprocess.Popen, str, str]:
    if not (ROOT / "frontend" / "dist" / "index.html").exists():
        subprocess.run(["npm", "run", "build"], cwd=ROOT / "frontend", check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    port = _free_port()
    db = Path(tempfile.mkdtemp()) / "page_map.db"
    env = {**os.environ, "DATABASE_URL": f"sqlite+aiosqlite:///{db}", "REQUIRE_AUTH": "false",
           "ENVIRONMENT": "development"}
    proc = subprocess.Popen([sys.executable, str(Path(__file__).with_name("_local_app.py")), str(port)],
                            cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    base = f"http://127.0.0.1:{port}"
    for _ in range(90):
        try:
            with urllib.request.urlopen(f"{base}/api/health", timeout=2) as r:
                if r.status == 200:
                    return proc, base, str(db)
        except Exception:  # noqa: BLE001
            time.sleep(1)
        if proc.poll() is not None:
            break
    err = (proc.stderr.read() or b"").decode("utf-8", "replace")[-800:] if proc.stderr else ""
    proc.kill()
    raise RuntimeError(f"سرورِ محلی بالا نیامد: {err}")


def targets(only: str = "") -> list[dict]:
    from app.services.inspection_inventory import pages

    out = []
    for p in pages():
        if p["group"] == "public" or p.get("alias_of"):
            continue
        if only and p["path"] != only:
            continue
        if p["parametric"]:
            out.append({"url": p["path"], "label": p["label"], "skip": "مسیرِ پارامتری — به دادهٔ واقعی نیاز دارد"})
            continue
        out.append({"url": p["path"], "label": p["label"]})
        for s in p["subpages"]:
            out.append({"url": s["url"], "label": s["label"]})
    return out


def _local_token(base: str) -> str:
    """A throwaway account on the throwaway DB — the SPA's ProtectedRoute sends
    a token-less visitor to /login, and a crawl of 54 login screens is not a
    map of 54 pages (the first run of this script measured exactly that)."""
    body = json.dumps({"email": "page-map@example.com", "username": "pagemap",
                       "password": "page-map-" + os.urandom(6).hex()}).encode()
    req = urllib.request.Request(f"{base}/auth/register", data=body,
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["access_token"]


def crawl(base: str, todo: list[dict], token: str = "") -> list[dict]:
    from playwright.sync_api import sync_playwright
    from app.services.system_graph_service import parse_routes_meta  # noqa: F401  (same registry)
    from frontend_match import pattern_of

    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = browser.new_context(viewport=VIEWPORT, locale="fa-IR")
        if token:
            ctx.add_init_script(f"try {{ localStorage.setItem('token', {json.dumps(token)}); }} catch (e) {{}}")
        for t in todo:
            if t.get("skip"):
                results.append({**t, "ok": None})
                continue
            page = ctx.new_page()
            errors, bad = [], []
            page.on("console", lambda m, e=errors: e.append(m.text[:300]) if m.type == "error" else None)
            page.on("pageerror", lambda exc, e=errors: e.append(f"pageerror: {str(exc)[:300]}"))
            page.on("response", lambda r, b=bad: b.append(f"{r.status} {r.url.replace(base, '')}")
                    if r.status >= 400 else None)
            row = {"url": t["url"], "label": t["label"]}
            try:
                page.goto(f"{base}{t['url']}", wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(500)
                got = page.evaluate(COLLECT_JS, MAX_ELEMENTS)
                want = pattern_of(t["url"])
                if got["surface"] != want:
                    # redirected (to /login, or anywhere else): what we measured is
                    # NOT this page, and must not be filed as if it were
                    row.update(ok=False, error=f"به «{got['surface'] or page.url}» رفت، نه «{want}» — اندازه‌گیری نشد")
                else:
                    row.update(ok=True, surface=got["surface"], doc=got["doc"], elements=got["elements"])
            except Exception as exc:  # noqa: BLE001
                row.update(ok=False, error=f"{type(exc).__name__}: {str(exc)[:300]}")
            row["console_errors"] = errors[:20]
            row["bad_responses"] = sorted(set(bad))[:30]
            results.append(row)
            page.close()
        browser.close()
    return results


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="", help="نشانیِ سرور؛ خالی = سرورِ محلیِ یک‌بارمصرف")
    ap.add_argument("--only", default="")
    args = ap.parse_args()
    proc = None
    try:
        try:
            import playwright  # noqa: F401
        except ImportError:
            print(json.dumps({"error": "playwright نصب نیست: pip install playwright==1.56.0 "
                                       "(هرگز `playwright install` نزن — کرومیوم در /opt/pw-browsers است)"},
                             ensure_ascii=False), file=sys.stderr)
            return 2
        base = args.base.rstrip("/")
        token = os.getenv("LM_PAGE_MAP_TOKEN", "")
        if not base:
            proc, base, _ = _start_local()
            token = _local_token(base)
        todo = targets(args.only)
        res = crawl(base, todo, token)
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"error": f"{type(exc).__name__}: {exc}"}, ensure_ascii=False), file=sys.stderr)
        return 2
    finally:
        if proc:
            proc.terminate()
    measured = [r for r in res if r.get("ok")]
    summary = {
        "pages_measured": len(measured),
        "pages_failed": sum(1 for r in res if r.get("ok") is False),
        "pages_skipped": sum(1 for r in res if r.get("ok") is None),
        "elements": sum(len(r.get("elements") or []) for r in measured),
        "pages_with_console_errors": sum(1 for r in measured if r.get("console_errors")),
        "pages_with_bad_responses": sum(1 for r in measured if r.get("bad_responses")),
    }
    doc = {"generated_at": datetime.now(timezone.utc).isoformat(), "base": "local" if proc else args.base,
           "viewport": VIEWPORT, "element_format": ["selector", "tag", "testid", "text", "x", "y", "w", "h"],
           "summary": summary, "pages": res}
    if not args.only:
        OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
