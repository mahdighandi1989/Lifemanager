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
  managed-session caveat is overridden by explicit owner permission for this repo. CLAUDE.md
  updated so merge-to-`main` is the default going forward.

## 2026-06-28 — Settings: retire the legacy "advanced" tab; relocate the analysis prompt

- **FINDING** Grepped consumers of the legacy Settings "advanced" tab: the `AIModelConfig`
  context knobs (`context_type`/`dynamic_response`/`token_limit`) have **no live readers** in
  `app/`; the global **analysis prompt** (`/api/ai/global-prompt`) **is** used (`model_service`
  composes it into analysis; `task_feedback` reads it).
- **CHANGE** Removed the legacy provider/model/context **UI** and the «پیشرفته (قدیمی)» tab from
  `Settings.jsx` (owner approval). Settings is now two tabs: «هوش مصنوعی» + «اعلان‌ها».
- **CHANGE** Relocated the **analysis prompt** (textarea + save/cancel, `/api/ai/global-prompt`)
  into `AISettings.jsx` (the «هوش مصنوعی» tab) — kept because it's actively used. Loaded via its
  own effect so a post-mutation refresh never clobbers an in-progress edit.
- **PRESERVED (rule 2)** The legacy endpoints `/api/ai/providers`, `/api/ai/configs` and the
  `AIProvider`/`AIModelConfig` models + their rows are untouched — only the UI was dropped.
  Updated `REMOVAL_CANDIDATES.md` with the retire path (migrate the analysis pipeline to the
  catalog first).
- **CHANGE** `Settings.test.jsx` trimmed to the two-tab shell + prompt-relocation check;
  `AISettings.test.jsx` gained an analysis-prompt load/save test.
- **VERIFY** `npm run build` clean; Settings + AISettings suites **7/7** green. Backend untouched.

## 2026-06-28 — IA: group related pages into tabbed hubs (owner-approved plan)

- **DECISION** Owner asked to tidy the ~16-item sidebar **without deleting any content**, being
  careful with pages holding important data/lists. Chose the "three hubs" plan (confirmed via a
  preview prompt): consolidate related pages into tabbed hubs using the **safe embed pattern** —
  each page component is **reused unchanged** via a new `embedded` prop; only the outer full-page
  chrome (`min-h-screen` wrapper + duplicate `<h1>`) is dropped when hosted in a tab. **No page
  data/logic touched.**
- **CHANGE** Added `embedded` prop (cosmetic root-wrapper only) to 9 pages: BudgetPage, AssetsPage,
  SmartAssistant, Recommendations, PersonalityProfilePage, CareerPlanningPage, DriveFiles,
  MergeManagement, Import (the 8 were patched by an asserted single-match script).
- **CHANGE** New hub shells: `FinanceHub` (برنامه و بودجه + دارایی‌ها), `AssistantHub` (پیشنهادات
  + تاریخچه + پروفایل شخصیت + ترسیم آینده), `DataHub` (ایمپورت + فایل‌های من + ادغام تسک‌ها). Each
  picks its initial tab from the URL so the **existing routes still resolve** (e.g. `/assets`
  opens FinanceHub's assets tab; `/merge` opens DataHub's merge tab) — nothing removed.
- **CHANGE** `App.jsx` re-points those routes to the hubs (removed the now-unused direct imports);
  `Sidebar.jsx` collapsed to: داشبورد · کارها · پروژه‌ها · لیست‌ها · افراد · پروژه‌های خارجی ·
  مالی · دستیار هوشمند · داده · تنظیمات (16 → 10 items).
- **CHANGE** New `hubs.test.jsx` (3) verifies each hub's tabs + default panel + switching (child
  pages mocked to isolate tab logic).
- **VERIFY** `npm run build` clean (126 modules). hubs + Sidebar + Settings suites **9/9** green.
  Full vitest: 11 failed = the SAME pre-existing files (Dashboard/Footer/Header/Layout/Projects/
  Tasks/api — none touched here); 0 new. **Visually confirmed all 3 hubs in a real browser** (with
  a real login token) — embedded pages render full content, data/lists intact, no layout mess.

## 2026-06-28 — TO-DO review: re-examine every residual, advance what's in-repo

- **DECISION** Owner asked to go through every `TO-DO/` task one-by-one, verify the "done" ones
  are still correct against the (much-changed) current code, advance anything now doable in-repo,
  skip none, and after each **only update the index file** (no archive/delete). Reviewed all 8
  residuals (the index tracked only 6 — added the 2 missing: 78c0e8e0, 882723eb).
- **FINDING** All 8 are genuinely external/blocked (operator prod-data, third-party creds, device
  hardware, or design-deferred). In-repo halves re-verified intact: 9a5a3b4d (migration CLI imports
  + `--help` OK; get_required_user_id/REQUIRE_AUTH present), 217909d2 (scan/sync/external-drives +
  celery reconcile), 7367c6f0 (drive upload/cold-tiering/sheets seam), 78c0e8e0 (per-user scoping +
  secret refusal), 2165524b (physiological/voice endpoints), d2146781 (oversight + GenericHttpAdapter).
- **CHANGE (4ae4b3ca — in-repo advance)** The `process_finance_updates` Celery task was a no-op even
  with `FINANCE_IMAP_URL` set — the IMAP *pull* was never implemented. Built
  `app/services/finance_imap_service.py` (stdlib `imaplib`: `parse_imap_url`, `fetch_unseen_email_bodies`
  — connect, pull UNSEEN, mark Seen) and wired it into the task → each body flows through
  `apply_bank_message`. Added the missing `FINANCE_IMAP_URL`/`FINANCE_SMS_WEBHOOK`/`FINANCE_INGEST_USER_ID`
  to `.env.example` (the residual file had claimed they were there). Tests: `tests/test_finance_imap_4ae4b3ca.py` (5).
- **CHANGE (882723eb — in-repo advance)** Added `tests/locustfile.py` (read-heavy `HttpUser`) +
  `requirements-dev.txt` (locust, dev/CI-only — not collected by pytest, not in the runtime image).
  Residual reduced to "run it against staging".
- **DECISION (no dead code)** Left 78c0e8e0 (JWT denylist — would be dead under login-bypass) and
  d2146781 (speculative vendor adapters — untestable without creds) as documented residuals.
- **CHANGE** Rewrote `TO-DO/_index.json` → version 2, all 8 items, accurate per-task `status`
  (blocked-operator | blocked-external | blocked-hardware | blocked-design) + an `agent_review`
  note per item + `last_reviewed_at`. Individual task `.md` files left untouched per owner's
  "only update the index" instruction.
- **VERIFY** `python -m pytest tests/ -q` → **949 passed, 15 failed** (same 15 pre-existing; 0 new).
  New backend files ruff-clean. locustfile not pytest-collected.

## 2026-06-28 — Merge Projects + External Projects; fix frequent auto-logout

- **CHANGE (IA)** Owner: `/projects` and `/external-projects` should be one for now. Added
  `ProjectsHub` (tabs «پروژه‌های من» / «پروژه‌های خارجی») using the safe embed pattern — `Projects`
  and `ExternalProjects` reused unchanged via a new `embedded` prop. `App.jsx` points both routes
  at the hub; removed the standalone «پروژه‌های خارجی» sidebar link. hubs.test extended (ProjectsHub).
- **FIX (auth — frequent logout, root cause #1)** `ACCESS_TOKEN_EXPIRE_MINUTES` defaulted to **30
  minutes** → the token expired mid-session and the next request 401'd → logout. Raised the default
  to **43200 (30 days)**, env-overridable (`app/config.py`). The expiry test reads the setting
  dynamically, so it still passes.
- **FIX (auth — frequent logout, root cause #2)** `AuthContext.fetchMe` cleared the token on **any**
  non-200 `/auth/me` response — so a Render free-tier cold-start 5xx, a 404 (when the Google
  `/auth/me` route isn't mounted), or a 429 logged the user out on the next mount. Now it drops the
  token **only on a genuine 401**; transient/other responses keep the session (the token still
  authorizes `/api` calls). The axios 401-redirect interceptor is unchanged (genuine-401 only).
- **VERIFY** `cd frontend && npm run build` clean; AuthContext (12) + Sidebar (3) + hubs (5) green;
  backend `test_jwt_auth_pipeline.py` 14/14. Full vitest: 11 pre-existing failures, 0 new.

## 2026-06-28 — People Profiles (task 3cc09436): surface score/relationship in the list

- **REVIEW** Re-examined the People-Profiles feature (owner resent the old spec, "wasn't satisfied").
  Found it already thoroughly implemented and meeting every AC: `PersonProfile` model (all fields),
  service (deeds good/bad + important flag, note tone-analysis, score, relationship, reminders,
  suggestions, analyze blend), endpoints (`/profile`, `/analyze`, `/note`, `/deed`, `/reminders`,
  `/suggestions`), the rich `PersonProfilePage`, and the `PeopleProfiles` list with a per-person
  profile link. Did NOT rebuild any of it.
- **FINDING (the real gap)** The افراد LIST showed only names: it called `/api/persons` (no profile
  data), so the AI **score + relationship were never visible at a glance** — contrary to the voice
  intent ("یه امتیازی بهش می‌ده"). The `relationship_type` badge silently never rendered (undefined).
- **CHANGE (additive — no contract disruption)** Added `GET /api/people-profiles/summary` (Person
  ⟕ PersonProfile, user-scoped) returning each person + `ai_score`/`relationship_type`/`last_analyzed_at`.
  The existing `/api/people-profiles` + `/api/persons` list contracts are unchanged. `PeopleProfiles.jsx`
  now consumes `/summary` and shows the score (subtitle) + a Persian relationship badge
  (نزدیک/معمولی/دور/پرتنش/خنثی) per person, keeping the profile link.
- **Dependencies synced:** upstream — PersonProfile/Person models, score_from_deeds buckets,
  get_optional_user_id; downstream — `PeopleProfiles.jsx`, `person_profile.test.jsx`, `NewPages.test.jsx`
  (mock key `/persons`→`/people-profiles/summary`), `tests/test_people_profiles.py` (+summary test);
  cross-tier backend→frontend — new GET consumed by the list page; backend→db — NONE (LEFT JOIN on
  existing tables, no migration); infra/env — none. No Manual-required part → no TO-DO file.
- **VERIFY** backend `tests/test_people_profiles.py` 6/6 + full suite **950 passed / 15 pre-existing
  failed (0 new)**; `npm run build` clean; person_profile + NewPages **6/6**; ruff clean.

## 2026-06-28 — Complete Google Drive integration (connect/sync from the UI)

- **DECISION** Owner asked for a *complete* Google Drive connection for lifemanager —
  folder creation, a DB-backed connection, real data upload/list, and frontend management —
  modelled on ALLIN1's Drive pattern. The repo was already **injection-ready**:
  `google_drive_service` / `sheets_service` accepted an injected `client` + `refresh_token` and
  raised `NotImplementedError` without one; OAuth only did ID-token sign-in (no refresh-token
  capture). So the work was to slot a real adapter into the existing seam, add the
  connection store + OAuth offline flow, and build the UI — all behaviour-preserving.
- **CHANGE (foundation — connection store)** `app/services/drive_settings_service.py`: a
  key/value store over the EXISTING `GlobalSetting` table (lifemanager's equivalent of ALLIN1's
  `system_settings`) — so **no new table / no migration**. Stores the `refresh_token` **encrypted
  at rest** (`crypt_service.encrypt_data`), the connected account email, and a cached root-folder
  id. `store_connection` / `resolve_refresh_token` (DB → env fallback `GOOGLE_DRIVE_REFRESH_TOKEN`
  / `GOOGLE_SHEETS_REFRESH_TOKEN`) / `is_connected` / `disconnect` / `get_status`.
- **CHANGE (core — real client adapter)** `app/services/google_api_client.py`: `GoogleDriveClient`
  (folder find-or-create, upload, list, download) + `GoogleSheetsClient` (find-or-create the
  `LifeManagerIndex` sheet + append) implementing the EXACT async interface the seams expect,
  wrapping the sync google-api-python-client in `asyncio.to_thread`. `refresh_access_token`
  (grant_type=refresh_token), `build_clients` (→ `(None, None)` when disconnected / libs missing),
  `ensure_app_folders` (creates `LifeManagerData` + audio/images/documents/migrated_data, caches
  root id), `make_drive_mover` (cold-tiering uploader). All google imports lazy → stripped image
  still boots.
- **CHANGE (OAuth connect/callback/disconnect)** `app/routes/auth_google.py`:
  `GET /auth/google/drive/connect` redirects to consent with `access_type=offline` + `prompt=consent`
  + `drive.file`/`spreadsheets` scope + a CSRF `state` nonce (httponly cookie); the **shared**
  `/auth/google/callback` now branches on a `drive:`-prefixed state to capture + store the
  refresh_token and eagerly create the folder tree. Sign-in path unchanged (state empty → legacy
  flow). Connect is operator-gated (admin, or sole operator in single-tenant bypass).
- **CHANGE (data connection + management routes)** `app/routes/drive.py` (always mounted):
  `GET /api/drive/status`, `POST /api/drive/disconnect|test|sync` (operator-gated), and
  `POST /api/drive/upload-file` (real multipart upload → pushes bytes to Drive when connected via
  the `google_drive_service.upload_file` seam, else stores local). `app/tasks.py::tier_cold_data`
  now builds the live client + mover + sheets ledger so the scheduled cold-tiering actually
  migrates to Drive when connected.
- **CHANGE (frontend)** New `frontend/src/pages/DriveSettings.jsx` (status grid + Connect /
  Disconnect / Test / Sync, RTL); added as a «گوگل درایو» tab in `Settings.jsx`. `DriveFiles.jsx`
  gained a real "بارگذاری فایل" upload control (multipart → `/api/drive/upload-file`).
- **Dependencies synced (4 directions):** upstream — `GlobalSetting`, `crypt_service`,
  `google_drive_service`/`sheets_service` seams, `exchange_code_for_token`/`verify_google_token`,
  google-api libs (already pinned in requirements). downstream — `DriveSettings.jsx`, `Settings.jsx`
  tab, `DriveFiles.jsx` upload, `tier_cold_data`. db — NONE (reused GlobalSetting; no new table/column,
  no migration). env — documented `GOOGLE_DRIVE_REFRESH_TOKEN` in `.env.example` (+ Drive setup note).
- **FIX (bonus, pre-existing)** `test_env_example_parity` was red because the `_GOOGLE_ISSUERS`
  constant tripped the `GOOGLE_*` env-var scan; allow-listed it (it is a code constant, not config)
  and named the new token-URI constant without a `GOOGLE_` prefix. Now green.
- **VERIFY** backend full suite **961 passed / 14 pre-existing failed (0 new; env-parity now green,
  −1 from baseline)**; new `tests/test_drive_connection.py` 10/10; `npm run build` clean; frontend
  `DriveSettings.test.jsx` 2/2 + `drive_files.test.jsx` 2/2 green, full vitest 11 pre-existing failed
  (0 new); ruff clean on all new/changed files.
