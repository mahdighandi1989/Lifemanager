---
title: "A headless crawl must prove it reached the page it measured — and 'not measured' is never 'zero'"
tags: ["playwright", "crawler", "monitoring", "auth-redirect", "measurement"]
topic_canonical: "headless-crawl-must-verify-it-reached-the-page"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-08T00:00:00Z"
created_at: "2026-10-08"
updated_at: "2026-11-11"
merged_from: []
---

# A headless crawl must verify it reached the page

## 🎯 چالش / Challenge

A script opens every route of an SPA in a headless browser and records each
page's controls, coordinates, console errors and failing responses — a map an
automated reviewer compares run to run. The first run reported a clean,
plausible result: every page measured, a few dozen controls each. It had
measured **the login screen 54 times**: the SPA's protected-route guard
redirected the token-less browser, and nothing in the crawl asked where it
actually landed. A second trap sat beside it: the local server would not start
(the app's DB engine passed Postgres pool arguments that SQLite rejects), and a
naive script would have reported "0 controls" — the product losing every page.

## 💡 راه‌حل / Solution

1. **Mark the surface in the app, assert it in the crawl.** The layout renders
   `data-report-surface="<route pattern>"` on its main element. The crawler
   computes the pattern it expects from the URL (same matcher as the app's
   router) and, if the attribute differs, records the page as `ok=false` with
   "went to X, not Y — not measured", never as a page with those controls.
2. **Sign in like a user, with a throwaway identity.** Register a disposable
   account on the throwaway database and inject its token before any script
   runs (`add_init_script` → `localStorage`).
3. **Three states, not two.** `ok=true` measured · `ok=false` could not measure
   (with the reason) · `ok=None` deliberately skipped (parametric routes that
   need real data). Summaries count all three.
4. **Exit 2 when the crawl could not start** (no browser, server down) — an
   environment failure is not a product finding.
5. **Adapt the harness, not production.** If the app's engine config does not fit
   the throwaway DB, wrap the engine factory in the harness process (drop the
   pool args for a `sqlite` URL) and serve the real app unchanged.
6. **Record failing responses with their URL.** Chrome's console says only
   "Failed to load resource: 404"; listen to `response` events and keep
   `"<status> <path>"` so each finding is actionable.

## 🧪 نمونه کد (Anonymized)

```python
got = page.evaluate(COLLECT_JS)          # returns {elements, doc, surface}
want = pattern_of(target_url)            # same matcher the SPA router uses
if got["surface"] != want:
    row.update(ok=False, error=f"landed on {got['surface'] or page.url}, not {want} — not measured")
else:
    row.update(ok=True, elements=got["elements"])
```

```python
# harness-only shim: production engine untouched
_orig = sqlalchemy.ext.asyncio.create_async_engine
def _create(url, **kw):
    if str(url).startswith("sqlite"):
        for k in ("pool_size", "max_overflow", "pool_timeout"):
            kw.pop(k, None)
    return _orig(url, **kw)
sqlalchemy.ext.asyncio.create_async_engine = _create
```

## ⚠️ نکات حیاتی / Pitfalls

- A redirect is a 200 — status codes will not catch it; only "where am I" does.
- Waiting for `networkidle` is not proof of the page either; the login page goes
  idle too.
- Do not compare a run that had `errors` against the previous run for "dropped
  capabilities" — an unmeasured run looks like mass deletion.
- Use the same selector algorithm as any UI that stores element anchors, so the
  map and the stored anchors speak one dialect.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Add a stable marker of "which page is this" to the app shell.
2. In the crawler, derive the expected marker from the target and compare.
3. Authenticate with a disposable identity on a disposable database.
4. Keep measured / not-measured / skipped distinct in data and in summaries.
5. Exit non-zero (distinct code) when the environment, not the product, failed.

## 🔗 References
- Related: `owner-inspection-loop-with-supervisor-routines`,
  `silent-capture-channel-needs-a-liveness-surface` (absence ≠ nothing happened).

## Update 2026-11-11 — a known, dominant error hides a new one

**Challenge.** Every crawl reported "console errors on N pages = the known 404 on `/auth/me`". Three
consecutive runs repeated that sentence while the same `bad_responses` list also held a
`500 POST /api/app-records/learning-architecture/reminders` on one page — a real select-then-insert
race (the page posts several reminders at once; the second INSERT of a new key hit the unique
constraint). The 500 was hidden behind the noise of the 404 everyone already knew about.

**Solution.** Count the `bad_responses` across all pages as a multiset and compare it with the
known/baseline set (the open items). Report anything left over, starting with every 5xx, even if
the page count did not change. Then reproduce it in a real browser against a throwaway server
with server logs on. A `curl` GET of the same path returned 200: the failure only appeared under
the page's real concurrent POSTs.

**How to apply elsewhere.** In any crawler or monitor summary, never collapse errors into "same as
last time" by page count. Diff the full error multiset against an explicit baseline, and treat
every new 5xx as a finding even when the totals look unchanged. For any "get-or-create by unique
key" path that a client can call concurrently, either use the database's native upsert or catch
the unique-violation, roll back, and retry once (the row now exists, so the update branch wins).
Prove it with a deterministic test that makes the first lookup stale.
