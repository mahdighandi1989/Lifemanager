#!/usr/bin/env python3
"""The «after» picture — the proof `fixed` requires (ported from Detective-1).

`inspection.py answer N --outcome fixed` is refused without an after-shot, and
the shot must show THE PLACE the owner pointed at, not some page (ALLIN1 PROMPT
§0-ب-۲/۴). So this opens the sheet's own `reopen` URL in a real Chromium and,
when given the sheet's anchor selector, photographs that element with some
context around it.

    python3 scripts/supervisor/screenshot.py "/settings?tab=drive" --out after.png
    python3 scripts/supervisor/screenshot.py /tasks --selector '[data-testid="task-form"]' --out after.png

Local throwaway server by default (signed in with a throwaway account);
`--base https://…` with `LM_PAGE_MAP_TOKEN` for a deployed copy.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from page_map import VIEWPORT, _local_token, _start_local  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--selector", default="")
    ap.add_argument("--out", required=True)
    ap.add_argument("--base", default="")
    ap.add_argument("--full", action="store_true", help="کلِ صفحه")
    args = ap.parse_args()
    from playwright.sync_api import sync_playwright

    proc = None
    try:
        base = args.base.rstrip("/")
        token = os.getenv("LM_PAGE_MAP_TOKEN", "")
        if not base:
            proc, base, _ = _start_local()
            token = _local_token(base)
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            ctx = browser.new_context(viewport=VIEWPORT, locale="fa-IR")
            if token:
                ctx.add_init_script(f"try {{ localStorage.setItem('token', {json.dumps(token)}); }} catch (e) {{}}")
            page = ctx.new_page()
            page.goto(f"{base}{args.url}", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(600)
            if args.selector:
                el = page.query_selector(args.selector)
                if el is None:
                    print(json.dumps({"error": f"عنصرِ «{args.selector}» در {args.url} پیدا نشد — "
                                               "اگر چیدمان عوض شده، این خودش یافته است"}, ensure_ascii=False),
                          file=sys.stderr)
                    return 3
                el.scroll_into_view_if_needed()
                box = el.bounding_box()
                pad = 80
                clip = {"x": max(0, box["x"] - pad), "y": max(0, box["y"] - pad),
                        "width": min(VIEWPORT["width"], box["width"] + 2 * pad),
                        "height": box["height"] + 2 * pad}
                page.screenshot(path=args.out, clip=clip)
            else:
                page.screenshot(path=args.out, full_page=args.full)
            browser.close()
    finally:
        if proc:
            proc.terminate()
    print(json.dumps({"ok": True, "out": args.out}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
