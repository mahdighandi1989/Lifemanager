# Overhaul Audit Log

Running, append-only record of every finding, decision, change, and revert made while working
on this repository. **Newest entries are appended at the end.** This file is binding (CLAUDE.md
rule 5): keep it live after every task — no separate reminder needed.

Format per line/bullet:
`[type: FINDING|DECISION|CHANGE|REVERT|PROPOSAL] [optional tags] — detail + rationale (+ commit, + verification status)`

Group bullets under a `## YYYY-MM-DD — <phase/context>` heading.

---

## 2026-06-28 — Bootstrap: adopt trading-system documentation + merge workflow

- **DECISION** Establish a CLAUDE.md-driven "document-and-merge" workflow modeled on the
  trading-system repo, per the owner's request to replicate that repo's automatic
  documentation + direct-to-`main` commit habit. The mechanism is **pure instruction**
  (no git hook / CI gate) — it lives in `CLAUDE.md` and is honoured by whoever works the repo.
- **CHANGE** Added `CLAUDE.md` (root): non-negotiable rules (read `experiences/` first;
  quarantine-not-delete; behaviour-preserving; verify `pytest tests/` + `npm run build` before
  merge; append to this log), owner standing directives (document after every task; commit &
  merge straight to `main` once green, no PR unless asked — with a managed-session note that
  pins work to the assigned feature branch), system map, run/migration instructions, and a
  "where things live" + conventions section.
- **CHANGE** Created `docs/overhaul/` (this log + `README.md` + `REMOVAL_CANDIDATES.md`) and
  `docs/decisions/README.md`; extended `.gitignore` to keep ephemeral artifacts
  (`decision_*.md`, `inbox/` contents) out of git while tracking the folder READMEs.
- **FINDING** `experiences/README.md` already defines the kebab-case + YAML-frontmatter format
  (identical in spirit to trading-system), and a "Knowledge Center" (`/knowledge-center`) page
  is documented to read this folder — so no new experiences format was needed, only the audit
  log + decision-report conventions.
- **NOTE** This work is committed to the managed-session feature branch
  `claude/lifemanager-setup-nx9izb` (the environment forbids pushing elsewhere); the
  merge-to-`main` directive in CLAUDE.md governs unconstrained local work.

## 2026-06-28 — Phase 1: AI Settings upgraded to the ALLIN1 catalog design

- **DECISION** Port ALLIN1's "complete AI settings" surface (provider catalog → models with
  capabilities → per-task model routing → live test + sync) into Lifemanager, ADDED ALONGSIDE
  the legacy per-user `AIProvider`/`AIModelConfig` system (CLAUDE.md rule 2: legacy provider
  CRUD still lives in `Settings.jsx` + `/ai/providers`/`/ai/configs`; nothing removed). The new
  `/ai-settings` page is transformed to the new form.
- **CHANGE** New models `app/models/ai_catalog.py` — `AICatalogProvider` (key PK, encrypted
  key + env fallback), `AICatalogModel` (capabilities/source/priority), `AITaskRoute`. Distinct
  `ai_catalog_*` table names avoid colliding with the legacy `ai_providers`/`ai_model_configs`.
- **CHANGE** New service layer under `app/services/ai/`: `catalog.py` (PROVIDER_CATALOG for
  Anthropic/Claude-sub/OpenAI/Gemini/DeepSeek/OpenRouter/Perplexity/xAI + CAPABILITIES +
  TASK_TYPES + idempotent `seed_ai_catalog`), `manager.py` (`ai_manager.resolve(task)` →
  `ResolvedModel`, env-var key fallback), `inference_gateway.py` (native `complete` +
  `complete_multimodal` for Anthropic/Gemini/OpenAI families — reused by Phase 2 import),
  `catalog_tester.py` (`test_model` ping + `sync_provider_models`).
- **CHANGE** New router `app/routes/ai_catalog.py` (prefix `/ai`, dual-mounted at `/ai` and
  `/api/ai` in `main.py`): `GET /overview`, `PUT /providers/{key}`, `POST /providers/{key}/sync-models`,
  `GET|POST /models`, `PUT|DELETE /models/{id}`, `POST /models/{id}/test`, `GET /routes`,
  `PUT /routes/{task}`. All additive — verified no method+path collision with the legacy router.
  Keys stored encrypted via `crypt_service`, never returned (masked hint + `has_api_key`).
- **CHANGE** Rewrote `frontend/src/pages/AISettings.jsx` to the new form (provider cards: enable,
  key save/clear, base_url, sync, model list with capability chips + per-model test/delete +
  add-custom; task-routing selects). Updated `AISettings.test.jsx` to the new contract.
- **CHANGE** Alembic migration `0031_ai_catalog.py` (head 0030 → 0031) creates the 3 tables;
  models registered in `app/models/__init__.py`; idempotent startup `seed_ai_catalog` added to
  `main.py` startup_event (Render free-tier path). New tests `tests/test_ai_catalog.py` (7).
- **FINDING / PITFALL** `from __future__ import annotations` in a FastAPI route/schema module
  makes `Body(...)` model annotations forward-ref strings → pydantic v2 raises *"TypeAdapter …
  is not fully defined"* at request time (a green build/import does NOT catch it; only an actual
  POST/PUT does). Fix: drop the future import from request-body schema + route modules. Recorded
  in `experiences/pluggable-ai-provider-catalog-and-router.md`.
- **VERIFY** `python -m pytest tests/ -q` → 933 passed, **15 failed** — all 15 are PRE-EXISTING
  on the clean baseline (auth-enforcement env tests, ruff lint debt, google-oauth, inventory,
  env-parity; verified via a HEAD worktree). The 2 migration tests I initially broke (new tables
  w/o migration) are fixed. `cd frontend && npm run build` → clean. New files ruff-clean.

## 2026-06-28 — Phase 2: Import feature (spreadsheet bulk + AI document) ported from ALLIN1

- **DECISION** Build a unified **Import** page + `/api/imports` surface modeled on ALLIN1's
  import (Excel/CSV bulk with dry-run + async AI document extraction). Adapted to Lifemanager's
  user-scoped, dependency-free targets: **tasks / people / incomes / assets** (Transaction needs
  an account FK → deferred). Existing JSON list-sync (`/api/lists/sync-from-file`) and finance
  message-ingest are KEPT (CLAUDE.md rule 2); this is the new unified entry point, not a replacement.
- **CHANGE** `app/services/import_service.py` — registry-driven engine: `parse_table` (CSV/XLSX
  [lazy openpyxl]/JSON), `IMPORT_TARGETS` (columns + row→model builder + dedup key per target),
  `import_rows` core (validate → idempotent dedup by natural key → dry-run or commit →
  ImportResult), `bulk_import`, and the AI path (`_extract_rows_with_ai` via the AI catalog
  gateway `complete`/`complete_multimodal`, `parse_model_json`, async `spawn_analyze_job`).
- **CHANGE** `app/models/import_job.py` (`import_jobs` table) for the async AI path + history;
  `app/routes/imports.py` (`/api/imports/{targets,{target}/template,{target},ai-models,analyze,
  jobs,jobs/{id}}`). Registered in `main.py` + `models/__init__.py`; alembic `0032_import_jobs`.
- **CHANGE** `requirements.txt` += `openpyxl==3.1.5` (lazy-imported; CSV/JSON still work without it).
- **CHANGE** Frontend `frontend/src/pages/Import.jsx` (mode tabs spreadsheet/AI, target picker,
  CSV template link, dry-run preview + commit, AI model picker + analyze-with-poll, import
  history). Wired `/import` route in `App.jsx` + a Sidebar entry ("ایمپورت داده").
- **CHANGE** New tests `tests/test_imports.py` (10): parse/dry-run/commit/idempotent/row-errors,
  JSON people import, AI-extraction persistence (monkeypatched model), and endpoint coverage.
- **NOTE / FOLLOW-UP** The async AI job processes in a background task using `SessionLocal`
  (production-correct: one DB). In the in-memory test harness the request db ≠ SessionLocal, so
  end-to-end completion isn't asserted via HTTP — the extraction+persist core is unit-tested
  directly instead. `docs/ARCHITECTURE_INVENTORY.json` should be regenerated to list the new
  Import page + endpoints (the inventory test was already failing pre-existing; not regressed).
- **VERIFY** `python -m pytest tests/ -q` → **944 passed, 15 failed** (same 15 pre-existing; 0 new).
  `cd frontend && npm run build` → clean. New backend files ruff-clean.

## 2026-06-28 — Settings IA: consolidate AI + Notifications into a tabbed Settings page

- **DECISION** Owner feedback (on the live site): the `/settings` page's older AI options feel
  redundant now, and Notifications should live under Settings too. Consolidate Settings into a
  **tabbed** shell rather than scattering AI config across pages.
- **CHANGE** `frontend/src/pages/Settings.jsx` rewritten as a tabbed shell with three tabs:
  **هوش مصنوعی** (renders the new `<AISettings/>` catalog), **اعلان‌ها** (renders
  `<Notifications/>`), **پیشرفته (قدیمی)** (the previous Settings body — legacy provider/model/
  context + the editable analysis prompt). Initial tab derived from the URL
  (`/settings/ai-models`→ai, `/settings/notifications`→notifications, `?tab=`), read via
  `window.location` so the component renders router-free in unit tests.
- **CHANGE** `AISettings.jsx` and `Notifications.jsx` gained an `embedded` prop that drops the
  full-page `min-h-screen` chrome + duplicate `<h1>` when hosted inside a Settings tab; both
  still work standalone at `/ai-settings` and `/notifications` (capability preserved).
- **CHANGE** `App.jsx`: `/settings/notifications` now renders `<Settings/>` (opens the
  Notifications tab) instead of `<Notifications/>` directly; `/settings/ai-models` already → Settings.
  Sidebar links left unchanged (standalone pages still reachable).
- **DECISION (quarantine, not delete — rule 2)** The legacy AI provider/model/context config is
  NOT removed: it still feeds the existing analysis pipeline (`provider_service` reads the
  per-user `AIProvider`) and owns the global analysis prompt. It's moved out of the default view
  into the "پیشرفته (قدیمی)" tab, with an in-UI note pointing to the new AI tab. Logged in
  `REMOVAL_CANDIDATES.md`.
- **CHANGE** `Settings.test.jsx` updated to the tabbed structure (switches to the Advanced tab
  for the legacy assertions; adds tab-switching coverage).
- **VERIFY** `cd frontend && npm run build` → clean. `npx vitest run` → **88 passed, 11 failed**;
  the 11 are PRE-EXISTING (jsdom `window.location`/navigation limitations — confirmed identical
  with this round's edits stashed: 87 passed/11 failed). Settings + AISettings suites: 12/12 green.
  Verified visually in a real browser (all three tabs render embedded correctly). Backend untouched.
- **CHANGE (follow-up)** Decluttered the sidebar: removed the standalone «تنظیمات هوش مصنوعی»
  and «اعلان‌ها» links now that both are tabs under «تنظیمات». Standalone routes (`/ai-settings`,
  `/notifications`) + the header notification bell remain (capability preserved). `Sidebar.test`
  updated. `npm run build` clean; Sidebar suite 3/3.
- **CHANGE (workflow)** Per the owner's explicit instruction, this work is merged **straight to
  `main`** (the trading-system pattern) rather than left on the feature branch — the
  managed-session caveat is overridden by explicit owner permission for this repo.
