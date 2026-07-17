# Lifemanager API Reference

Conventions used across every endpoint:

- **Plural noun prefixes** — `prefix="/tasks"`, `prefix="/projects"`,
  `prefix="/users"`, `prefix="/notifications"`, `prefix="/ai"`,
  `prefix="/auth"`, `prefix="/integrations"`. The plural form is the
  canonical naming convention; the singular form is reserved for
  catch-all SPA URLs that the React frontend handles.
- **Lower snake_case paths** — every endpoint segment is lowercase
  with underscores when it needs separators. We never ship a camelCase
  path (`/markAsRead` etc).
- **Strict CORS** — see `app/main.py::StrictCORSMiddleware`; the
  allowlist comes from `ALLOWED_ORIGINS` env var.

## Authentication & identity scoping (security task 9a5a3b4d)

Every user-scoped route resolves the caller's `user_id` through one of two
dependencies in `app/dependencies/auth.py`. Which one a route uses encodes how
sensitive its data is:

| Dependency | No `Authorization` header | Valid bearer | Present-but-invalid / expired bearer |
|---|---|---|---|
| `get_required_user_id` (sensitive: **finance, assets, context**) | `REQUIRE_AUTH=false` → anon scope (user 0); `REQUIRE_AUTH=true` → **401** | that user's id | **401, always** |
| `get_optional_user_id` (dashboard / self-improvement / lists / ai-config …) | anon scope (user 0) | that user's id | anon scope (user 0) |

The key security property: on a **sensitive** route a forged or expired token is
**always rejected with 401**, independent of `REQUIRE_AUTH` — a present-but-bad
bearer is an attack signal and must never resolve to user 0's data. The probe
from the task confirms it:

```
curl /api/finance/incomes -H 'Authorization: Bearer invalid_token'   # → 401
```

`get_optional_user_id` stays deliberately lenient (it still verifies the JWT
signature, but falls back to the anon scope on any failure) because the
login-bypass frontend reaches the dashboard with no header.

**`REQUIRE_AUTH`** (`.env`, default `false`) is the switch that retires the
anonymous fallback once real accounts exist. Before flipping it to `true`,
re-home the legacy user-0 data onto a real account so it isn't orphaned:

```
# preview what would move (writes nothing)
python -m scripts.reassign_anon_user_data --target <real_user_id> --dry-run
# perform the reassignment (single transaction: all-or-nothing)
python -m scripts.reassign_anon_user_data --target <real_user_id>
```

The mechanism (`app/services/user_data_migration.py`) discovers every table with
a `user_id` column from SQLAlchemy metadata, so new user-scoped tables are
migrated automatically. The only manual input is the target account id.

### Mutation-path ownership coverage (audit task f17880d0)

Resolving `user_id` is only half the contract — a route also has to *act* on
it. The audit "Incomplete Permission Coverage for Mutation Paths" found that
several create paths resolved the caller but the matching **update / delete**
paths ignored identity entirely, so any caller could mutate another tenant's
rows. `projects.py` was the already-coherent ground truth and is the pattern
every user-scoped mutation now follows:

* **Resolve** the caller via `get_optional_user_id` on every create / read-one
  / update / delete handler (not just the list/create paths).
* **Authorize** by ownership before mutating: a row is reachable when it is the
  caller's *or* legacy-unowned (`user_id IS NULL` — the seeded defaults and
  pre-scoping rows). A cross-tenant row is hidden with a **404** (not a 403, so
  we don't even confirm it exists to a non-owner).
* Anonymous (`user 0`) keeps full CRUD under login-bypass, so the single-tenant
  frontend is unaffected.

Coverage now spans **tasks** (`Task.user_id`), **todo-lists**
(`TodoList.user_id`), and **todo-items** — items carry no `user_id` of their
own, so their create / update / delete / toggle / share / unshare / move paths
inherit ownership from the parent list (an item reachable only through another
tenant's lists 404s; orphan items with no list membership are treated as
legacy-unowned). The **role-change** path (`/admin/approve-user`) remains
admin-gated via `is_admin`; **register / login** (bootstrap) and the
HMAC-signed **`/webhook`** are intentional unauthenticated exceptions.

Two further mutation paths were aligned to the same "identity from the token,
never the body" rule:

* **`POST /api/users/profile`** — the profile update (`bio` / `display_name`).
  It resolves the caller via `get_optional_user_id` and persists *only* onto
  that user's own row, so there is no path/body field through which another
  tenant could be targeted. It stays anonymous-safe: a request with no
  credentials (login-bypass → user 0) still returns `200` with the sanitized
  echo and skips persistence, preserving the XSS-sanitization contract (task
  cba0111e). Only fields present in the body are written, so an empty body is a
  no-op.
* **`POST /api/planner/generate`** — the daily-plan builder. Identity now comes
  from `get_optional_user_id`; the legacy `user_id` field in the request body is
  **ignored** (kept only for backward compatibility), closing the leak where any
  caller could read another tenant's plan by spoofing `user_id`.

### Frontend `user.id` ↔ backend `user_id` contract (audit task 42eab35f)

The React `AuthContext` (`frontend/src/context/AuthContext.jsx`) exposes a
`user` object whose **`id` is the single source of identity** the rest of the
SPA keys on. That `id` is guaranteed by `normalizeUser()` and is exactly the
integer primary key of the `users` table (`app/models/user.py::User.id`).

This is the same integer that user-scoped backend rows reference through their
`user_id` foreign key — e.g. `app/models/context.py::UserContext.user_id`
(`ForeignKey("users.id")`, an **Integer**). Ground truth is the backend: the
identifier is an integer, **not** a UUID/string. Downstream code linking a
`UserContext` (or any `user_id`-scoped row) to the signed-in user can therefore
trust `user.id` directly:

```js
const { user } = useAuth();
// user.id (number) === backend users.id === UserContext.user_id
fetch(`/api/context`, { headers: { Authorization: `Bearer ${token}` } });
```

`normalizeUser()` accepts either the canonical `id` (returned by
`UserOut`/`UserPublic` from `/users/`) or a legacy `user_id` alias, re-exposes
it as `id`, and yields `null` when no identifier is present — so a "user"
without a backend-linkable id never reaches the UI. Tests pin both ends:
`frontend/src/context/__tests__/AuthContext.test.jsx` (the `id` is surfaced)
and `tests/test_models.py::test_user_context_user_id_*` (the FK is an integer
pointing at `users.id`).

## Endpoint index

### Tasks (`/tasks`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/tasks` / `/api/tasks/` | List the caller's tasks |
| POST | `/api/tasks` / `/api/tasks/` | Create a task (owner = caller) |
| GET | `/api/tasks/{task_id}` | Single task by id (404 if not owned) |
| PUT | `/api/tasks/{task_id}` | Update a task you own (404 if not owned) |
| DELETE | `/api/tasks/{task_id}` | Delete a task you own (404 if not owned) |
| GET | `/api/tasks/search?q=` | Parameterised search |

### Projects (`/projects`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects` / `/api/projects/` | List |
| POST | `/api/projects` / `/api/projects/` | Create |
| GET | `/api/projects/{project_id}` | One |
| PUT | `/api/projects/{project_id}` | Update |
| DELETE | `/api/projects/{project_id}` | Delete |

### Auth (`/auth`)

The prefix lives on the router itself (`APIRouter(prefix="/auth")`),
not in `app.include_router`.

| Method | Path | Notes |
|---|---|---|
| GET | `/auth/` | Liveness probe |
| POST | `/auth/register` | 201 with `TokenResponse`, 409 if email taken |
| POST | `/auth/login` | 200 with `TokenResponse`, 401 on bad creds, 429 on rate-limit |

### AI (`/ai`)

The prefix lives on the router itself (`APIRouter(prefix="/ai")`).

| Method | Path | Notes |
|---|---|---|
| POST | `/ai/generate` | Text generation; placeholder if no `OPENAI_API_KEY`. **Categorization (audit task 97867b277c1b / 69704426):** active utility endpoint — wired to `AIService.generate_text()` (connection opened, not orphan/deprecated); also the canonical surface reused by `/ai/dynamic-analyze`. The legacy module-level `generate_text` import was removed (audit task ef6adabf). |
| GET | `/ai/configs` | List model configs |
| POST | `/ai/configs` | Create model config |
| PATCH | `/ai/configs/{config_id}` | Update model config |
| DELETE | `/ai/configs/{config_id}` | Delete model config |
| POST | `/ai/query` | Query a configured model |

### Notifications (`/notifications`)

Every path is lower snake_case. There is no `/markAsRead`; the
read-mark action lives at `PATCH /notifications/{notification_id}/read`.

| Method | Path | Notes |
|---|---|---|
| GET | `/notifications/` | List for the current user |
| POST | `/notifications/` | Create one |
| PATCH | `/notifications/{notification_id}/read` | Mark as read |
| DELETE | `/notifications/{notification_id}` | Delete one |
| GET | `/notifications/status` | Delivery counts (sent/failed/pending) |
| GET | `/api/notifications/status` | Same shape; absolute-path mount |
| GET | `/api/notifications/preferences` | Per-event + per-channel prefs + catalogs (for the settings UI) |
| PUT | `/api/notifications/preferences` | Partial-update prefs (events/sound/channels/min_priority) |
| POST | `/api/notifications/test` | Send a test notification via `{channel: in_app\|telegram\|email}` |

**Preference routing.** `notify_event` consults `notification_prefs` (a JSON blob
in `global_settings`, key `notification_prefs`, warmed into a process cache at
startup): an event sends only when its `events[event]` toggle is on and its
priority ≥ `min_priority`; `sound[event]` decides silent-vs-loud; and each
external channel (`telegram`, `email`) fans out only when `channels[ch].enabled`.
Defaults reproduce the prior "always send, always loud" behaviour. The unified
**اعلان‌ها** settings tab (in-app + Telegram + email in one place) edits these.

### Telegram bot (`/api/telegram`) — bidirectional

Two-way bot: outbound critical-event notifications + inbound commands/buttons.
Configured via env (`TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `BACKEND_PUBLIC_URL`);
unset ⇒ clean no-op. The webhook ALWAYS returns 200 so Telegram never retry-storms,
and a startup supervisor re-registers the webhook when it drifts after a redeploy.
In-chat commands: `/start` `/help` `/menu` `/ping` `/diag` `/status` `/tasks` `/today`
`/new_task <title?>` `/cancel`; inline callbacks `task:done:<id>`, `menu:tasks|status|new_task`.

**Compose (content → task).** `/new_task` (bare), the «🆕 کار جدید» button, and ANY plain
text — as well as voice / photo / document / video (or several messages in a row) — open an
ordered, TTL'd buffer (`app/services/telegram_compose.py`);
a live status message edits in place. On «✅ ساخت کار از پیوست‌ها» the pipeline downloads
each item, analyses it via `complete_multimodal` — which auto-resolves a vision/documents
model (the "activate the vision model when needed" step; audio/video transcribe when the
resolved model is audio-capable, e.g. Gemini) — concatenates the extractions IN ORDER,
then a text model structures `{action, update_target, title, description, priority, target,
list_name, due_date}`. The structuring step is **list-aware + dedup-aware over the whole app**:
candidates come from a keyword `ILIKE` search across EVERY open task / list item (∪ the most
recent), ranked by overlap — not a recent-N cap — so it either creates a `Task` / a `TodoItem`
in a matched list, OR **strengthens an existing task/item** (AI-merges the description, raises
priority only upward) instead of duplicating, guarded so it can only update an id it was
offered. Two buttons: «✅ ساخت خودکار» (AI decides) and «🎯 انتخاب مقصد» (manual — an inline
keyboard of the most-relevant tasks/items/lists + "new"; the tap drives `cmp:*` callbacks).
Every analysed file is also uploaded to **Google Drive** (`LifeManagerData/telegram/`, via the
existing Drive connection) and its share link is attached to the created/strengthened row
(`Task.attachment` + description). Fail-open: no AI key ⇒ a plain task; Drive not connected ⇒
files skipped with a note. Buffer scoped to `TELEGRAM_TASK_USER_ID` (default 0).

| Method | Path | Notes |
|---|---|---|
| POST | `/api/telegram/webhook` | Telegram posts updates here (always 200) |
| POST | `/api/telegram/set-webhook` | Register webhook (auto-builds URL when body omits it) |
| POST | `/api/telegram/delete-webhook` | Unregister webhook |
| POST | `/api/telegram/heal-webhook` | Run one self-heal cycle (idempotent) |
| GET | `/api/telegram/status` | Config + webhook diagnostics (never returns the token) |
| POST | `/api/telegram/test` | Send a test message to the configured chat |

### Personal writings (`/api/writings`) — نوشته‌های من

Long-form personal documents that stay whole (spiritual autobiography, the
goals-with-philosophy document). List responses omit `body`; the detail
endpoint returns it in full. Seeded at startup from the generated archive
module (idempotent by title).

| Method | Path | Notes |
|---|---|---|
| GET | `/api/writings` | Summaries (`?category=` filter; no body) |
| GET | `/api/writings/{id}` | One writing incl. full `body` |
| POST | `/api/writings` | Create |
| PUT | `/api/writings/{id}` | Partial update |
| DELETE | `/api/writings/{id}` | Delete |

### Brain growth (`/api/brain`) — رشد ذهن و هوش

Consolidated cognitive-growth dashboard: Brilliant.org export zips (uploaded
here or by sending the zip to the Telegram bot, which auto-detects it) + the
owner's own behavioural signals (tasks / خودسازی / finance), every section with
an explicit `provenance` block (tables, rows, rule, authored-by-you rule).
**Schema-tolerant ingest**: besides the specialized metrics, EVERY dataset in
the export is generically inventoried (rows/fields/time-range + a merged
monthly activity map + `new_datasets` diff vs the previous upload), so content
types Brilliant adds later surface without a code change. The
export's account email is checked against the owner's known emails
(`verified_owner`). A weekly Telegram reminder (editable weekday/hour-UTC/
silent/refollow_hours) re-reminds until an upload arrives from either channel.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/brain/dashboard` | Sections + provenance + reminder config |
| POST | `/api/brain/upload` | Multipart zip (Brilliant export; 50MB cap) |
| GET | `/api/brain/uploads` | Upload history (id/via/verified_owner) |
| GET | `/api/brain/reminder` | Reminder config |
| PUT | `/api/brain/reminder` | Edit enabled/weekday/hour/silent/refollow_hours |

### Users (`/users`)

| Method | Path | Notes |
|---|---|---|
| GET | `/users/` | List |
| GET | `/users/{user_id}` | One |
| PATCH | `/users/{user_id}` | Update |
| DELETE | `/users/{user_id}` | Delete |

### Integrations (`/integrations`)

CRUD over third-party connection configs (Slack, Telegram, etc).

### Webhook

| Method | Path | Notes |
|---|---|---|
| GET | `/webhook/health` | Liveness |
| POST | `/webhook` | HMAC-verified event ingestion |

### Health / oversight

| Method | Path | Notes |
|---|---|---|
| GET | `/health` / `/api/health` | Liveness probe |
| GET | `/health/db` / `/api/health/db` | DB reachability probe |
| GET | `/api/oversight/status` | Status dashboard with feature flags |

### AI (audit task 1a08ded2)

AI **model configs** carry a `provider` field (string), and the list
endpoint accepts a `?provider=` query parameter to filter by it.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/ai/configs` | List model configs. `?provider=<name>` filters to one provider. Each item includes `id`, `name`, `provider`, `model_name`. |
| POST | `/api/ai/configs` | Create a model config; body must set `provider`. Returns 201 with `id`, `name`, `provider`. |
| PATCH | `/api/ai/configs/{id}` | Update a config (including `provider`). |
| DELETE | `/api/ai/configs/{id}` | Delete a config (204). |
| GET / POST | `/api/ai/providers` | List / create AI providers (user-scoped). Create/patch accept `base_url`, `api_key` (write-only — encrypted at rest via crypt_service, never returned), `default_model`; responses expose `has_api_key` only. |
| GET / PATCH / DELETE | `/api/ai/providers/{id}` | Fetch / update / delete a provider. |
| POST | `/api/ai/providers/{id}/test` | Test-connection probe: reports `configured` + (when keyed) best-effort `reachable`. |

Multi-provider routing (audit task 1a08ded2 AC5/7): `/api/ai/analyze` resolves
the caller's enabled provider via `resolve_provider_routing` and calls its
`base_url` + decrypted key + `default_model` through `call_openai_chat` (any
OpenAI-compatible vendor — DeepSeek/Grok/Perplexity/OpenRouter/local); falls
back to env `OPENAI_API_KEY`, then the deterministic placeholder. Keys are
stored encrypted (`AIProvider.api_key_encrypted`, migration 0026).
| GET / PUT | `/api/ai/global-prompt` | Read / update the global analysis prompt. |
| GET / PUT | `/api/ai/analysis_prompt` | Admin-managed analysis prompt (`analysis_prompts` table). GET is open and returns an empty default when unset; PUT is admin-only (403 for non-admin / anonymous). |
| GET | `/api/ai/user_data_context` | Authenticated caller's own Task/Project/TodoItem/Notification context for AI. |
| POST | `/api/ai/dynamic-analyze` | Free-form AI analysis; 403 when `FEATURE_AI_ENABLED` is off. |

The settings UI for providers + model configs lives at
`frontend/src/pages/AISettings.jsx` (route `/ai-settings`). The consolidated
**Settings** page (`frontend/src/pages/Settings.jsx`, route `/settings`) carries
three sections — AI providers, AI models (with a provider `<select>`), and the
editable analysis-prompt box. The whole `/ai` router is also dual-mounted under
`/api/ai` so the SPA's `/api/ai/...` calls resolve.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/ai/analyze` | Orchestrated analysis: global prompt + the caller's data context + the request prompt → `AIAnalysisResult`. 403 when `FEATURE_AI_ENABLED` is off. |
| GET / PUT | `/api/settings/global-analysis-prompt` | Admin-only (403 for non-admin) global analysis prompt, stored in `global_settings`. |
| GET | `/api/ai/hallucination-flags` | Human-review queue of low-confidence / self-contradictory AI answers (audit task 32145cd6). Returns `{flagged_count, items[]}`. |

#### Hallucination detection + mitigation (audit task 32145cd6)

Every answer the `ai_llm` pipeline produces (`nlp_service.generate_text` —
the single chokepoint behind `/ai/generate`, `/ai/analyze`,
`/ai/dynamic-analyze`) is scored by `app/services/ai/hallucination_service.py`
along three axes and the result rides back in the response under a
`hallucination` block (`confidence`, `grounding_ratio`, `contradictions`,
`flagged`, `reasons`):

- **fact-check / grounding** — fraction of the answer's content tokens that also
  appear in the supplied data context (reuses `content_analysis_service`
  tokenisation). Low overlap ⇒ likely fabricated.
- **confidence scoring** — synthetic 0..1 score derived from hedging language,
  detected contradictions, answer-length sanity, and grounding (OpenAI chat
  completions returns no calibrated confidence, so it is derived locally).
- **consistency checks** — detects internal contradictions (e.g. "the sky is
  blue" / "the sky is not blue") between sentences.
- **flagging for human review** — answers below
  `AI_HALLUCINATION_CONFIDENCE_THRESHOLD` (or self-contradictory / ungrounded)
  are queued for review (the endpoint above) instead of being shown as fact.
- **prompt engineering** — `GROUNDING_SYSTEM_PROMPT` is prepended to the
  orchestrated analysis prompt to steer the model away from guessing.

The pass is deterministic and provider-free (no second LLM call), so a key-less
/ offline deploy is still guarded and the unit tests stay hermetic. The guard
never blocks a response — a 200 still ships, with the metadata attached.

### Finance (audit task 4ae4b3ca)

| Method | Path | Notes |
|---|---|---|
| GET / POST | `/api/finance/accounts` | List / create financial accounts (bank/broker/exchange). |
| GET / POST | `/api/finance/incomes`, `/api/finance/assets` | Incomes / assets CRUD. |
| POST | `/api/finance/transactions` | Record a transaction (income/expense) and update the account balance. |
| GET | `/api/finance/transactions` | List the caller's transactions (`?account_id=` filter). |
| POST | `/api/finance/budget/evaluate` | Weigh a purchase vs the budget → `{affordable, priority, available_budget}`; fires a `budget_alert` notification when over budget. |
| POST | `/api/finance/ingest-message` | Apply an inbound bank/exchange `email`/`sms` body: parse the balance → update the account → record a `Transaction` → fire the affordable-task reminder (audit task 4ae4b3ca). |
| GET | `/api/finance/affordable-tasks` | Tasks the user can now afford given their budget (the "بهم اعلام بکنه" reminder). |
| GET | `/api/finance/insights` | AI analysis of the user's finances → `{summary, suggestions, analysis, model_used}`; budget-aware purchase suggestions via `ai_service.generate_text` (audit task 4ae4b3ca AC 13). |

Tasks carry an optional `estimated_cost` (`POST/PUT /api/tasks`) so a planned
purchase parked in the task list flows into the budget affordability checks and
the `/api/finance/insights` suggestions.

Manual entry UI (BudgetPage) records accounts + incomes. The auto-update apply
path (`finance_ingest_service.apply_bank_message`) is reachable via the
ingest-message webhook now; live IMAP/SMS polling needs operator credentials
(`process_finance_updates` puller, see TO-DO/task-4ae4b3ca-finance-sources.md).

Finance UI: `frontend/src/pages/BudgetPage.jsx` (routes `/budget` and `/finance`)
— accounts summary, a budget-aware purchase check, and an AI budget insight.
Bank email/SMS balance updates run via `EmailParserService.parse_balance` +
`SmsListenerService.parse_sms`, polled by the `process_finance_updates` Celery
task (every 30 min).

### Smart assistant / context (audit task 2165524b)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/context/location` | Save the caller's latest location into their `UserContext`. |
| POST | `/api/context/physiological` | Ingest a wearable heart-rate/activity sample → UserContext → fresh context recs (audit task 2165524b Steps 6-7; device pairing external). |
| POST | `/api/context/voice` | Infer mood from a voice transcript → UserContext.mood (Step 10; continuous capture/ASR external). |
| PATCH | `/api/recommendations/{id}/read` | Persist accept/reject (marks the recommendation read — AC5, no longer client-only). |
| GET | `/api/recommendations` | Context-fused recommendations (location / physiological / behavioral). |
| GET | `/api/notifications` | Anon-friendly notification list for the header `NotificationBell`. |

UI: `RecommendationPanel` (accept/reject), `LocationTracker` (geolocation every
5 min), `NotificationBell` (📍 icon for recommendation-type notifications), and
the `/recommendations` page (history + per-type priority toggles).
`google_maps_service` (`geocode_address` / `find_nearby_places`) powers
location-based suggestions when `GOOGLE_MAPS_API_KEY` is set.

### Oversight — external projects (audit task d2146781)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/oversight/connections` | Create a connection to an external PM project (token encrypted at rest). 201 with `id`, `name`. |
| GET | `/api/v1/oversight/connections` | List the caller's active connections. |
| POST | `/api/v1/oversight/connections/{id}/sync` | Pull latest data (generic HTTP adapter when base_url+key set; else stamps last_sync_at). |
| PATCH | `/api/v1/oversight/connections/{id}/time-budget` | Set the per-project time budget (minutes). |
| GET | `/api/v1/oversight/time-allocation` | Per-provider + per-connection budget breakdown with neglect flags. |
| GET | `/api/v1/oversight/tasks` | The caller's `OversightTask` rows across connections. |
| GET | `/api/v1/oversight/neglected` | Stale connections ("مغفول مونده") + overdue oversight tasks ("فلان مشکل هست"). |

`OversightService` adds `detect_neglected_items`, `detect_problems`,
`set_time_budget`, `list_oversight_tasks`; `fetch_project_data` runs
`GenericHttpAdapter` (an `ExternalProjectInterface`) when a connection has a
base_url + key. `ExternalProjectConnection` gains `time_budget_minutes`
(migration 0027). UI: `ExternalProjects` surfaces a neglected/problems summary.
Live third-party PM credentials are the only external piece (TO-DO/).

`OversightService` carries `connect_to_external_project`, `analyze_time_allocation`,
and `fetch_project_data`; the `sync_external_project` Celery task syncs a
connection.

### Deduplication / consolidation (audit task fbd9bd36)

Reduce chaos by consolidating similar entities **without summarizing or
deleting** anything — a merge moves the source's content to the target and
SOFT-DELETES the source (Task `merged_into_id` / Project `is_active=False` /
TodoList `is_archived=True`).

| Method | Path | Notes |
|---|---|---|
| POST | `/api/deduplication/scan` | Scan for similar Task/Project/List groups; returns a `job_id` + `group_count`. |
| GET | `/api/deduplication/groups` | The similar-entity groups (`?job_id=` for a prior scan, else a fresh scan). |
| POST | `/api/deduplication/merge` | Body `{source_id, target_id, entity_type}` — move source content to target, soft-delete source. |

`DeduplicationService.scan_for_duplicates` / `merge` reuse `similarity_service`
(Jaccard grouping) + `consolidation_service` (task merge). UI:
`frontend/src/components/deduplication/DeduplicationPanel.jsx`, surfaced on the
merge page (`/merge`).

### Dynamic task feedback (audit task e606cca6)

Models reason dynamically within the editable prompt, see the **full** task
context (no token cap), react to user actions, and give proactive feedback.
`AIModelConfig` gains `context_type` / `dynamic_response` / `token_limit`
(NULL/0 = no limit) — configured in the Settings "تنظیمات زمینهٔ هوش مصنوعی"
section.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/ai/analyze-tasks` | Body `{task_id?, user_id?}` → `{context, analysis, feedback, model_generated}`; full context + patterns run through the configured model **within the editable global prompt box** (Steps 7-8), deterministic fallback offline. Feedback persisted as a notification. |
| WS | `/ws/ai-stream` | Send `{user_id, task_id?}`; streams baseline `feedback` frames, then the model-framed chunk when a provider answers, then `done` with `model_generated`. |

`task_feedback.generate_task_feedback` assembles global-prompt + full context +
patterns and routes through `resolve_provider_routing` → `AIService.generate_text`
(no token cap); the model output is used verbatim when a real provider answers.

Backing pieces: `AIService.get_task_context` (total/completed/pending/overdue),
`task_analysis.analyze_user_tasks` (group work patterns),
`notification_service.send_ai_feedback` (persist feedback as a notification).

### Interest / personality / career profiling (audit task 14e65214)

Identify the user's interests + tastes, analyze mood + personality, and draw
personalized, **non-clichéd** career/life paths. Every score is derived from the
user's real data (their words, task-completion rate, interactions, mood), so the
output is grounded rather than templated. All routes are scoped by
`get_optional_user_id` (login-bypass single-tenant design).

| Method | Path | Notes |
|---|---|---|
| POST | `/api/interests` | Create an interest (201). Body `{interest_type?, value, category?, source?, confidence_score?}`. |
| GET | `/api/interests` | List the caller's interests. |
| DELETE | `/api/interests/{id}` | Delete an interest (204; 404 if missing / not owned). |
| GET | `/api/users/{user_id}/interests` | `{interests, tastes}` identified for the user. |
| POST | `/api/ai/identify_interests` | Scan the user's data → persist interests/tastes; 202 with `{identified, verified}`. A theme is `is_verified` only when it recurs (≥ 2×). |
| GET | `/api/ai/personalized_recommendations` | Ranked `[{id, content, type, score}]` from interests + personality + mood. |
| GET | `/api/context/recommendations` | Same, with `?type=career` filtering; each item carries `type`. |
| POST | `/api/ai/sentiment/analyze` | Body `{text? \| audio_url? \| behavior_type?}` → `UserSentimentProfile`; appends to `UserContext.mood_history`. |
| GET | `/api/ai/sentiment/profile` | Latest mood/sentiment snapshot. |
| POST | `/api/ai/personality/analyze` | Big-Five analysis from real behaviour (202) → `PersonalityProfile`. |
| GET | `/api/ai/personality/profile` | Latest Big-Five profile. |
| POST | `/api/ai/assessments/holistic_profile` | Upsert the combined personality+mood row (201). |
| GET | `/api/ai/assessments/holistic_profile/{user_id}` | Read the holistic profile (404 if absent). |
| POST | `/api/ai/career_paths` | Personalized paths → `CareerPathResponse`. Gated on `FEATURE_AI_ENABLED` (403 when off); deterministic + key-less so it degrades gracefully. |

Models: `UserInterest`, `UserTaste`, `PersonalityTrait`, `PersonalityAssessment`;
`User` gains `interests` / `personality_traits` / `mood_patterns` (JSON);
`UserContext` gains `personality_traits` / `mood_history` / `career_interests` /
`general_interests`; `ContextualRecommendation` gains `type` / `source_context`;
`AIAssessment` gains the Big-Five + `sentiment_score` / `dominant_emotion` /
`mood_timestamp` (and `person_id` relaxed to nullable for user-level rows).
Services: `interest_identification_service`, `sentiment_personality_service`,
`personality_service`, `holistic_profile_service`, `career_path_service`, and
`RecommendationService` (personalized + holistic-aware). UI:
`PersonalityProfilePage` (`/personality`), `CareerPlanningPage`
(`/career-planning`) + `CareerPathPanel`, and personalized items in
`RecommendationPanel` (`data-testid='personalized-recommendation-item'`).

### File processing & content analysis (audit task 217909d2)

Scan the user's files across sources, store **text metadata only** (never the
files themselves), keep the index in sync as files come and go, and correlate
assets with needs ("می‌خوام فیلمی ببینم" → "you have Inception.mp4").

| Method | Path | Notes |
|---|---|---|
| GET | `/api/assets` | List the user's scanned assets; `?asset_type=movie` filters to one kind (AC2). |
| POST | `/api/assets/scan` | Walk a server-side directory, classify by extension, persist `UserAsset` rows (deduped by path). Metadata only — no download (AC1, AC8). |
| WS | `/api/assets/scan-status` | Stream per-file scan progress. |
| GET | `/api/assets/external-drives` | Detect connected external/removable drives to scan (AC6); graceful `[]` without a detection backend. |
| POST | `/api/assets/sync` | Periodic dynamic sync (AC3): reconcile a path set — add new, prune vanished (the mobile add/remove loop). |
| GET / POST | `/api/local-files` | List (`?q=` free-text search over path/summary/keywords/extracted_text — AC7) / create local-file entries (no content stored). |
| GET | `/api/drive/files`, POST connect | Google Drive file metadata once an account is linked (AC5). |
| POST | `/api/ai/correlate_needs` | Match a free-text need against the caller's tasks/todos/files (AC4, AC7). |

Services: `asset_scan_service` (`classify` / `scan_directory` / `detect_external_drives`),
`data_ingestion_service` (`compare_and_ingest_new_data` add, `compare_and_remove_deleted`
prune, `sync_source` both — AC3/Steps 6-7), `asset_to_task_linker` (asset↔task),
`recommendation_engine.get_recommendations` (intent + keyword correlation),
`google_drive_service`, `local_file_service`.

### Google Drive file mgmt & cold-tiering (audit task 7367c6f0)

Tier files that haven't been touched in 30 days out to Google Drive (metadata
+ extracted text stay hot in the DB), log each move to a central Google Sheet,
and resolve reads back through the Drive link. OCR/ASR + the real Google calls
are credentialed; the services take injectable clients so they're testable
offline and degrade to bookkeeping-only without creds.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/drive/upload` | Record a `DriveFile` (metadata only). Audio/image files get `extracted_text` populated up front (AC6). |
| GET | `/api/drive/files` | List Drive files; `?q=` filename substring search. |
| GET | `/api/drive/folders` | The `LifeManagerData` root + per-data-type subfolders (AC7). |
| GET | `/api/files/{id}` | Resolve a file: Drive-tiered → its `drive_link` (AC5); touches `last_accessed_at`. 404 if missing. |
| GET | `/api/files/{id}/raw` | Content representation (Step 7): Drive link for tiered files, extracted text for local (metadata-only system — AC8). |

`GET /api/drive/files?q=` searches filename **and** extracted_text (Step 9).
`POST /api/drive/upload` records the file to the `LifeManagerIndex` sheet via
`sheets_service.record_index_entry` (best-effort, no-op without Sheets creds —
Step 4). The daily `tier_cold_data` task migrates cold DriveFiles via
`cold_tiering_service.tier_cold_files` (AC4) and records **each migrated file**
to the `LifeManagerIndex` sheet through the task's `ledger` callback
(`sheet_row_for` → `record_index_entry`), so the sheet ledger covers the
migration path too, not just upload — best-effort, no-op without Sheets creds.
Real OCR/ASR + live Google Drive/Sheets credentials are external
(TO-DO/task-7367c6f0-ocr-google.md).

Model: `DriveFile` gains `storage_location` (local\|drive) + `last_accessed_at`
(migration 0023). Services: `google_drive_service` (`upload_file`→shareable
link, `download_file`, `build_share_link`, folder helpers — AC1/AC7),
`sheets_service` (`append_index_row` to `LifeManagerIndex` — AC2),
`cold_tiering_service` (`is_cold`/`find_cold_files`/`tier_cold_files` with an
optional `ledger` hook + `sheet_row_for`, 30-day policy — AC4),
`transcription_service` (`extract_text` for audio/image — AC6).
UI: `DriveFiles` page (`/drive-files`) badges Drive-stored files + links to the
blob (AC8). The `tier_cold_data` Celery task runs the sweep daily.

### People profiles & behavioural analysis (audit task 3cc09436)

Track the people you interact with, score the relationship from interaction
history, and keep free-text notes + a behaviour log per person.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/people/{id}/profile` | The person's profile: `ai_score`, `user_notes`, `behavior_log`, `relationship_type` (auto-creates an empty profile). |
| POST | `/api/people/{id}/profile/analyze` | Blend interaction-history + deed/note scores; persists `ai_score` + `relationship_type` + a `behavior_log` snapshot. |
| POST | `/api/people/{id}/profile/note` | Save a note AND analyze its tone (Step 10) — the sentiment becomes a valenced log entry that feeds the score. |
| POST | `/api/people/{id}/profile/deed` | Record a good/bad deed (`{kind, note, important}`) and recompute (Step 4-5 — "کارهای بد و خوبش ثبت بشه"). |
| GET | `/api/people/{id}/profile/reminders` | Important deeds flagged to not forget (Step 8). |
| GET | `/api/people/{id}/profile/suggestions` | Actionable suggestions from relationship + deed balance (Step 9). |

Model: `PersonProfile` (one per `Person` — `ai_score`, `user_notes`,
`behavior_log` JSON of deeds/notes/analyses, `relationship_type`,
`last_analyzed_at`; migration 0024). Scoring: `person_behavior.score_from_deeds`
weighs good/bad deeds with **time decay** (recent deeds dominate — "با یه کار
خوبش هزار تا کار بد رو فراموش نکنم"); note tone feeds it. UI: `PersonProfilePage`
(`/people/:id/profile`) — score, note + deed forms, reminders, suggestions, and a
good/bad-filterable behaviour timeline; `PeopleProfiles` links each person.

### Notification events (audit task 92fa5ea15e2b)

Critical events fire through `notify_event(event_type, *, user_id, db, title?,
message?, priority?, silent?, action_link?, action_text?)`. Event types are
first-class in `EVENT_REGISTRY` (`register_event(...)`): each carries a default
title/message/priority + the channels it fans out to.

- `verify_failed` (high, channels `in_app`+`telegram`) — fired by
  `auth_service.login()` on a bad credential check, and by `POST /webhook` when
  an inbound HMAC signature fails (the owner is alerted; the request still 401s).
- `budget_alert`, `recommendation`, `ai_feedback` are also registered.

Transports: `send_email` / `send_sms` / `send_push` / **`send_telegram`** (Bot
API `sendMessage`; logs+no-ops without `TELEGRAM_BOT_TOKEN`). A per-`(user,event)`
rate-limit (`EVENT_RATE_LIMIT_MAX`/`_WINDOW_S`, default 60/60s) guards against a
forged-webhook flood. Toggleable per type in the `/notifications` settings tab.

### AI performance feedback & metrics (audit task 97867b277c1b)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/ai/feedback` | Body `{liked?: bool, score?: 1-5, response_ref?}` — persists an `AIFeedback` row (per-user, durable) + bumps in-process counters. 400 if neither signal given. |
| GET | `/api/ai/metrics` | Latency/throughput from rolling counters; likes/dislikes + `ai_response_quality_score` aggregated from the `ai_feedback` table (survive restart) with SLO targets from `AI_PERFORMANCE_TARGETS`. |

UI: `AIFeedbackWidget` (like/dislike + 1-5 stars + live metrics) on the AI
Settings page. Model `AIFeedback` (migration 0025).

### Migrations & startup (audit task 3ea5622b)

The Alembic chain (`migrations/versions/`, head `0027_oversight_time_budget`)
is kept in sync with `Base.metadata` — `tests/test_migration.py` /
`test_migrations.py` assert every model table is created by `alembic upgrade head`.

Startup can optionally auto-migrate: set `RUN_ALEMBIC_MIGRATIONS_ON_STARTUP=true`
and the app runs `alembic upgrade head` programmatically at startup **only when
`ENVIRONMENT != production`** (production logs a warning and skips — migrate as a
controlled deploy step). Off by default; migration errors are logged and
swallowed so startup never crashes (`app/services/migration_runner.py`). The
legacy idempotent `ALTER TABLE` block in `startup_event` remains as
belt-and-suspenders for the create_all (no-alembic) path on Render's free tier.

### Activity log — لاگ فعالیت‌ها (runtime audit trail)

One append-only `activity_logs` row per notable user action across the whole
app, written best-effort by `app/services/activity_log_service.record_activity`
(never raises; always called AFTER the underlying commit, through the caller's
session so tests/overrides see it). Two-level linking: `entity_type`/`entity_id`
name the acted-on record, `context_type`/`context_id` name its owning
profile/section (todo item → its list, deed/note → its person, transaction →
its account), and `entity_label` snapshots the title at write time so rows
survive rename/delete.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/activity-log` | Global trail, newest first. Filters: `action`, `entity_type` (comma-separated OK), `entity_id`, `search`, `date_from`/`date_to` (bare end date extends to end-of-day), `page`/`page_size` (≤500). Returns `{ok, items, total, page, page_size}`. |
| GET | `/api/activity-log/entity/{entity_type}/{entity_id}` | One profile/section's trail — matches the pair as entity OR owning context, so a list's log includes its items and a person's log includes deeds/notes. Same filters minus `entity_type`/`entity_id`. |
| GET | `/api/activity-log/export.csv` | UTF-8-BOM CSV (Excel-friendly), same filters + `context_type`/`context_id` (OR-pair rule), capped at 5000 rows. |
| POST | `/api/activity-log` | Record an SPA-originated action (`{action, entity_type?, entity_id?, entity_label?, context_type?, context_id?, detail?}`) — for client-only events like CSV/PDF exports. |

Scoping mirrors the writings router: anon (user 0) also sees legacy NULL-owner
rows; a real JWT sees only its own rows. Write hooks live in the tasks,
projects, lists, todo_items, person (deeds/notes/analyze), finance
(incomes/assets/accounts/transactions), and writings routers. Frontend:
`/activity-log` page (global, filterable, rows deep-link via
`frontend/src/lib/activityLog.js::activityLink`) + the reusable
`ActivityLogPanel` embedded on PersonProfilePage, ListDetail, Tasks,
ProjectsHub, FinanceHub («لاگ مالی» tab), and Writings.
