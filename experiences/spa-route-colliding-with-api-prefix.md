---
title: "An SPA page whose path collides with an API prefix breaks on refresh — branch on Accept: text/html"
tags: ["spa", "fastapi", "routing", "catch-all", "trailing-slash", "deep-link"]
topic_canonical: "spa-route-colliding-with-api-prefix"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-18T00:00:00Z"
created_at: "2026-11-18"
updated_at: "2026-11-18"
merged_from: []
---

# SPA route colliding with an API prefix

## 🎯 چالش / Challenge

A single server hosts both a JSON API and a single-page app. A catch-all
route serves the SPA shell for unknown paths, but paths whose first segment
belongs to a legacy API router (`/notifications`, `/auth`, …) are redirected
to their trailing-slash form so `fetch('/x')` reaches the router. When the SPA
*also* has a page at `/notifications`, clicking it inside the app works
(client-side routing), but a refresh, a bookmark or a link from an e-mail/chat
notice hits the server: 307 → `/notifications/` → the router demands a bearer
token the browser never sends (it lives in localStorage) → the user sees raw
JSON `{"detail":"Authentication required"}`. Every test that drives the app by
in-app clicks stays green, which is why it can live for weeks.

## 💡 راه‌حل / Solution

1. In the catch-all, before the API-prefix redirect, check whether the request
   is a **page navigation**: the exact path is a known SPA page *and* the
   `Accept` header contains `text/html`. Browsers send that on navigation;
   `fetch`/axios send `*/*` or `application/json`. Serve the shell then.
2. Keep the list of colliding SPA paths explicit and **enforce it with a test**
   that reads the one SPA route registry and the API-prefix list and fails if
   a new page lands under an API prefix without being listed.
3. Leave the API redirect untouched for non-HTML requests — behaviour for
   existing clients does not change.

## 🧪 نمونه کد (Anonymized)

```python
SPA_PATHS_UNDER_API_PREFIX = ("inbox",)

@app.get("/{full_path:path}")
async def spa(full_path: str, request: Request):
    nav = full_path in SPA_PATHS_UNDER_API_PREFIX and \
          "text/html" in (request.headers.get("accept") or "")
    if full_path.split("/", 1)[0] in API_PREFIXES and not nav:
        return RedirectResponse(f"/{full_path}/", 307)
    return FileResponse(index_html)
```

## ⚠️ نکات حیاتی / Pitfalls

- Testing the page by clicking through the app never reproduces this; only a
  direct load (crawler, `curl -H 'Accept: text/html'`) does.
- Don't drop the prefix from the API list — old clients rely on the redirect.
- Don't serve the shell for every `text/html` request under the prefix: only
  the exact page paths, or you shadow real HTML-returning endpoints.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

- [ ] List SPA routes; intersect their first segment with server-side prefixes.
- [ ] For each hit, `curl -sI -H 'Accept: text/html' https://host/<page>` — expect 200 HTML.
- [ ] Add the Accept-based branch and a registry-driven test.

## 🔗 References
- مرتبط: headless-crawl-must-verify-it-reached-the-page (the crawler that kept reporting it)
