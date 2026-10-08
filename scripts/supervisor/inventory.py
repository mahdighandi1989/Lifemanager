#!/usr/bin/env python3
"""Every surface of Lifemanager — pages, sub-pages (tabs), controls, API routes,
services, models — read from SOURCE, written for the supervisor and for git.

    python3 scripts/supervisor/inventory.py

Writes `docs/supervisor/inventory.json` (machine) and `docs/supervisor/INVENTORY.md`
(human). Nothing here is a hand-kept list: a page or tab added tomorrow shows up
with no edit (the derivation lives in `app/services/inspection_inventory.py`,
shared with the in-app «نقشهٔ صفحه‌ها» tab).

A count that DROPS against the previous run is a loud alarm — a capability
vanished (project rule 2). But «could not measure» is NOT «zero»: when the app
cannot be imported, `api_routes` is `None`, the report says «اندازه‌گیری نشد»,
and the script exits 2 — so an environment problem is never reported as the
product losing every route (ALLIN1 run 2: «213 → 0» from a recycled container).
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
OUT_JSON = ROOT / "docs" / "supervisor" / "inventory.json"
OUT_MD = ROOT / "docs" / "supervisor" / "INVENTORY.md"


def build() -> dict:
    os.environ.setdefault("ENVIRONMENT", "development")
    from app.services import inspection_inventory

    app = None
    errors = []
    try:
        from app.main import app as fastapi_app  # noqa: WPS433 — measured, not regexed
        app = fastapi_app
    except Exception as exc:  # noqa: BLE001
        errors.append(f"routes: could not import app.main ({type(exc).__name__}: {exc})")
    inv = inspection_inventory.build(app)
    inv["errors"] = errors + inv.get("errors", [])
    return inv


def drops(prev: dict, now: dict) -> list[str]:
    out = []
    for k, v in (now.get("totals") or {}).items():
        p = (prev.get("totals") or {}).get(k)
        if isinstance(p, int) and isinstance(v, int) and v < p:
            out.append(f"{k}: {p} → {v}")
    prev_pages = {p["path"] for p in prev.get("pages") or []}
    now_pages = {p["path"] for p in now.get("pages") or []}
    out += [f"صفحهٔ حذف‌شده: {p}" for p in sorted(prev_pages - now_pages)]
    prev_sub = {s["url"] for p in prev.get("pages") or [] for s in p.get("subpages") or []}
    now_sub = {s["url"] for p in now.get("pages") or [] for s in p.get("subpages") or []}
    out += [f"زیرصفحهٔ حذف‌شده: {s}" for s in sorted(prev_sub - now_sub)]
    return out


def to_md(inv: dict, alarms: list[str]) -> str:
    t = inv["totals"]
    na = "⚠️ اندازه‌گیری نشد"
    L = ["# فهرستِ سطحِ سامانه (Inventory) — Lifemanager", "",
         "> این فایل را **ناظرِ خودکار** در هر بازرسیِ کامل بازتولید می‌کند — دستی ویرایشش نکن.",
         "> هر صفحه/تب/دکمه/endpointی که بعداً اضافه شود، خودکار این‌جا ظاهر می‌شود.",
         "> همین داده زنده در برنامه هم هست: «نظارت و سرکشی» ← «نقشهٔ صفحه‌ها و زیرصفحه‌ها».", ""]
    if alarms:
        L += ["## 🚨 کاهش نسبت به اجرای قبل — قابلیتی حذف شده؟ (قانونِ ۲)", ""]
        L += [f"- {a}" for a in alarms] + [""]
    L += ["| سنجه | تعداد |", "|---|---|"]
    for k, label in (("pages", "صفحه‌ها"), ("subpages", "زیرصفحه‌ها (تب‌ها)"), ("buttons", "دکمه‌ها"),
                     ("inputs", "ورودی‌ها"), ("forms", "فرم‌ها"), ("links", "لینک‌ها"),
                     ("api_calls", "فراخوانی‌های API در صفحه‌ها"), ("api_routes", "مسیرهای API"),
                     ("services", "سرویس‌ها"), ("models", "مدل‌ها")):
        L.append(f"| {label} | {t[k] if t.get(k) is not None else na} |")
    L += ["", "## صفحه‌ها و زیرصفحه‌ها", "",
          "| مسیر | برچسب | گروه | زیرصفحه‌ها | دکمه | ورودی | API |", "|---|---|---|---|---|---|---|"]
    for p in inv["pages"]:
        subs = "، ".join(f"`?tab={x['id']}`" + (" (قرنطینه)" if x["quarantined"] else "")
                         for x in p["tabs"]) if not p.get("alias_of") else f"درِ دیگرِ `{p['alias_of']}`"
        L.append(f"| `{p['path']}` | {p['label']} | {p['group']} | {subs or '—'} | {p['buttons']} | "
                 f"{p['inputs']} | {p['api_calls']} |")
    if inv.get("errors"):
        L += ["", "## ⚠️ سنجه‌هایی که اندازه‌گیری نشدند", "",
              "> این‌ها **صفر نیستند** — اندازه‌گیری‌شان شکست خورد. اول محیط را درست کن و دوباره اجرا کن.", ""]
        L += [f"- {e}" for e in inv["errors"]]
    L += ["", "## مسیرهای API", ""]
    routes = (inv.get("backend") or {}).get("routes")
    if routes is None:
        L.append(f"- {na}")
    else:
        L += ["| متد | مسیر |", "|---|---|"]
        L += [f"| {','.join(r['methods'])} | `{r['path']}` |" for r in routes]
    return "\n".join(L) + "\n"


def main() -> int:
    prev = {}
    if OUT_JSON.exists():
        try:
            prev = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            prev = {}
    inv = build()
    alarms = [] if inv.get("errors") else drops(prev, inv)
    inv["alarms"] = alarms
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(inv, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT_MD.write_text(to_md(inv, alarms), encoding="utf-8")
    print(json.dumps({"totals": inv["totals"], "alarms": alarms, "errors": inv["errors"]}, ensure_ascii=False))
    if inv.get("errors"):
        return 2
    return 6 if alarms else 0


if __name__ == "__main__":
    raise SystemExit(main())
