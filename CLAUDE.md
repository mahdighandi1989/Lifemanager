# CLAUDE.md — Working on this repository

Lifemanager is a personal **life-management** platform: tasks, projects, todo-lists,
people/CRM, finances, assets, documents, and **AI-assisted planning**. FastAPI (async
SQLAlchemy) backend + React (Vite, Persian/RTL) frontend. `main` auto-deploys to Render.
Treat every change as a production change.

## Non-negotiable rules

1. **Read `experiences/` first.** Each file there encodes an already-solved engineering
   challenge in a reusable, project-agnostic form. They are binding context — apply them
   instead of re-discovering the same pitfalls. The `experiences/README.md` defines the
   required file format (YAML frontmatter + the mandatory "How to Apply Elsewhere" section).
2. **Never delete a capability** (endpoint, page, button, route, model, fallback path).
   Quarantine instead and record it in `docs/overhaul/REMOVAL_CANDIDATES.md`. Deletion
   requires the owner's explicit approval. (See `app/routes/auth_google.py` — intentionally
   unmounted but kept, the canonical "quarantine not delete" example.)
3. **Behaviour-preserving changes by default.** Large modules (`council`-style files such as
   `notification_service.py`, `self_improvement_service.py`, `ai.py`) are split carefully and
   one concern at a time. When you change data shape or auth scope, keep the old path working
   (dual-mount / flag / fill-empty migration), the way the AI router is dual-mounted at `/ai`
   and `/api/ai`, and the way Render's free-tier startup runs idempotent `ADD COLUMN IF NOT
   EXISTS` migrations next to alembic.
4. **Verify before merging:** `python -m pytest tests/ -q` and `cd frontend && npm run build`
   must both be green. Both are the merge gate; run them locally before every merge.
5. **Append every finding / change / revert to `docs/overhaul/AUDIT_LOG.md`.** Newest entry at
   the end, dated, typed (`FINDING|DECISION|CHANGE|REVERT|PROPOSAL`).

## Owner standing directives & current focus

- **Documentation workflow (owner's explicit, standing instruction — this is rules 1 & 5, not
  optional):** keep the docs live **after EVERY task**. Append what you did/found to
  `docs/overhaul/AUDIT_LOG.md`, and record any reusable lesson/challenge in `experiences/`
  (kebab-case `{topic-slug}.md`, per its README — **merge, don't replace**: if a
  `topic_canonical` already exists, append a `## Update YYYY-MM-DD` section). A valuable
  decision/analysis report goes in `docs/decisions/` (root `decision_*.md` is gitignored).
  You should not need to be told to document — do it as part of finishing the work.
- **Merge workflow (owner's explicit, standing instruction):** once rule 4 is green locally
  (`python -m pytest tests/ -q` + `cd frontend && npm run build`), **commit and merge straight
  to `main`** every time — you do **not** need to ask each task, and do **not** open a PR unless
  asked. `main` auto-deploys to Render, so the local-green check is the safety gate: verify, then
  merge. Rules 2–3 still bind (quarantine-not-delete; behaviour-preserving, reversible steps).
  - *How to merge in a managed/web session:* the owner has confirmed direct `main` pushes are
    allowed for this repo even from Claude Code on the web. Do the work on the assigned
    `claude/...` branch, then `git checkout main`, fast-forward/merge the branch in, and
    `git push origin main` (re-sync the branch afterwards). **Only** if a push to `main` is
    actually rejected by the environment, fall back to pushing the feature branch and tell the
    owner. Never push to a branch you weren't told to.
- **Commits:** `type(scope): summary` — small, one concern, reversible; merge only when
  verified-green. Do not include model identifiers or session URLs in commit messages.

## What this system is

```
React SPA (Vite, RTL) ──/api──▶ FastAPI app ──▶ async SQLAlchemy ──▶ Postgres (SQLite in tests)
   │  (JWT in localStorage, axios lib/api.js)        │
   │                                                  ├─ AI layer: providers → models → task routes
   │                                                  │   (catalog/manager/inference/tester)
   │                                                  ├─ Celery (redis) for async jobs
   │                                                  └─ Google Drive / Sheets / Maps integrations
```

Per-user data is scoped by `user_id` (legacy rows have `user_id IS NULL`; auth dependencies
`get_optional_user_id` / `get_required_user_id` fall back to an anon scope when configured).
Backend degrades gracefully without optional credentials (Drive/Maps/LLM keys → local
fallbacks / placeholder responses).

## How to run

```bash
# Backend (Python 3.11)
pip install -r requirements.txt
uvicorn main:app --reload            # dev server (serves API; SPA served from frontend/dist)

# Frontend (Node 18+/22)
cd frontend && npm install
npm run dev                          # Vite dev @ 5173, proxies /api → http://localhost:8000
npm run build                        # production build → frontend/dist (tsc-free; vite build)

# Tests (the merge gate)
python -m pytest tests/ -q
cd frontend && npm run build         # must compile clean
# (frontend unit tests: cd frontend && npm test  — vitest)
```

Render free tier runs `Base.metadata.create_all()` + idempotent startup `ALTER TABLE … ADD
COLUMN IF NOT EXISTS` (see `app/main.py` startup_event); alembic migrations live in
`migrations/` for the production path. **New model ⇒ register it in `app/models/__init__.py`**
so `create_all()` sees it; **new column on an existing table ⇒ add an idempotent startup ALTER
in `main.py` AND an alembic migration.**

## Where things live

| Area | Location |
|------|----------|
| FastAPI app + router wiring + startup migrations | `app/main.py` |
| HTTP routers (one file per domain, absolute `/api/...` paths) | `app/routes/*.py` |
| SQLAlchemy models (one file per entity; registered in `__init__`) | `app/models/*.py`, `app/models/__init__.py` |
| Pydantic request/response schemas | `app/schemas/*.py` |
| Business logic (no FastAPI imports) | `app/services/*.py`, `app/services/ai/*`, `app/services/context_engine/*` |
| AI provider/model/routing + inference | `app/services/ai/` (`model_service`, `nlp_service`, `provider_service`), `app/routes/ai.py`, `app/models/ai_provider.py`, `ai_model_config.py` |
| Auth (JWT, Google OAuth, data-scope) | `app/dependencies/auth.py`, `app/services/auth_service.py`, `app/routes/auth.py`, `auth_google.py` (conditionally mounted) |
| Frontend pages | `frontend/src/pages/*.jsx` (lazy-free; routed in `App.jsx`) |
| Frontend routing / nav / API client | `frontend/src/App.jsx`, `components/Sidebar.jsx`, `components/Layout.jsx`, `lib/api.js` |
| Docs map / inventories | `docs/` (`ARCHITECTURE_INVENTORY.md`, `API.md`), `docs/overhaul/` (audit log + ledgers) |
| Binding lessons | `experiences/` (format in its README — merge, don't replace) |
| Decision reports | `docs/decisions/` (root `decision_*.md` is gitignored) |

## Conventions

- **API responses:** most endpoints return data directly or `{ok: bool, ...}`; some legacy use
  `success`. When touching one, return BOTH keys rather than renaming.
- **Routers** carry absolute `/api/...` paths in their decorators and mount with **no prefix**
  (a few are dual-mounted at `/x` and `/api/x` — mirror the nearest neighbour). Register new
  routers in `app/main.py`'s "Include routers" block; `/api/*` is already whitelisted in the
  SPA catch-all `_API_PREFIXES`.
- **UI text is Persian (RTL).** Every page sets `dir="rtl"` on its root container (no global
  flip — pages are individually RTL-aware). Styling is Tailwind only, no external CSS files.
- **Bidi rule:** any Persian string that mixes Latin/numbers/punctuation (`تنظیمات AI`,
  `Import + …`) MUST sit inside an explicit `dir="rtl"` ancestor, or the browser scrambles the
  phrase order. A green build does NOT catch this — verify mixed strings visually or wrap the
  nearest block in `dir="rtl"`.
- **Secrets:** API keys are encrypted at rest (`app/services/crypt_service.py`) and never
  returned to the client — responses expose `has_api_key` / a masked hint only. Read keys from
  the DB first, then env-var fallback.
- **Migrations:** new table → model + `models/__init__.py`. New column on an existing table →
  idempotent startup `ALTER … ADD COLUMN IF NOT EXISTS` in `main.py` **and** an alembic
  migration. Never assume `create_all()` alters existing tables — it doesn't.
