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

## Endpoint index

### Tasks (`/tasks`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/tasks` / `/api/tasks/` | List every task |
| POST | `/api/tasks` / `/api/tasks/` | Create a task |
| GET | `/api/tasks/{task_id}` | Single task by id |
| PUT | `/api/tasks/{task_id}` | Update a task |
| DELETE | `/api/tasks/{task_id}` | Delete a task |
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
| POST | `/ai/generate` | Text generation; placeholder if no `OPENAI_API_KEY` |
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
| GET / POST | `/api/ai/providers` | List / create AI providers (user-scoped). |
| GET / PATCH / DELETE | `/api/ai/providers/{id}` | Fetch / update / delete a provider. |
| GET / PUT | `/api/ai/global-prompt` | Read / update the global analysis prompt. |
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

### Finance (audit task 4ae4b3ca)

| Method | Path | Notes |
|---|---|---|
| GET / POST | `/api/finance/accounts` | List / create financial accounts (bank/broker/exchange). |
| GET / POST | `/api/finance/incomes`, `/api/finance/assets` | Incomes / assets CRUD. |
| POST | `/api/finance/transactions` | Record a transaction (income/expense) and update the account balance. |
| GET | `/api/finance/transactions` | List the caller's transactions (`?account_id=` filter). |
| POST | `/api/finance/budget/evaluate` | Weigh a purchase vs the budget → `{affordable, priority, available_budget}`; fires a `budget_alert` notification when over budget. |

Finance UI: `frontend/src/pages/BudgetPage.jsx` (routes `/budget` and `/finance`)
— accounts summary, a budget-aware purchase check, and an AI budget insight.
Bank email/SMS balance updates run via `EmailParserService.parse_balance` +
`SmsListenerService.parse_sms`, polled by the `process_finance_updates` Celery
task (every 30 min).

### Smart assistant / context (audit task 2165524b)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/context/location` | Save the caller's latest location into their `UserContext`. |
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
| POST | `/api/ai/analyze-tasks` | Body `{task_id?, user_id?}` → `{context, analysis, feedback}`; full task context + work-pattern analysis, feedback persisted as a notification. |
| WS | `/ws/ai-stream` | Send `{user_id}`; streams `feedback` frames + a final `done` frame with the task context. |

Backing pieces: `AIService.get_task_context` (total/completed/pending/overdue),
`task_analysis.analyze_user_tasks` (group work patterns),
`notification_service.send_ai_feedback` (persist feedback as a notification).
