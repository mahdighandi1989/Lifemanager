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
| POST | `/api/finance/ingest-message` | Apply an inbound bank/exchange `email`/`sms` body: parse the balance → update the account → record a `Transaction` → fire the affordable-task reminder (audit task 4ae4b3ca). |
| GET | `/api/finance/affordable-tasks` | Tasks the user can now afford given their budget (the "بهم اعلام بکنه" reminder). |

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
| GET / POST | `/api/local-files` | List / create local-file entries (summary + keywords extracted, no content stored). |
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
| GET | `/api/drive/folders` | The `Lifemanager Data` root + per-data-type subfolders (AC7). |
| GET | `/api/files/{id}` | Resolve a file: Drive-tiered → its `drive_link` (AC5); touches `last_accessed_at`. 404 if missing. |

Model: `DriveFile` gains `storage_location` (local\|drive) + `last_accessed_at`
(migration 0023). Services: `google_drive_service` (`upload_file`→shareable
link, `download_file`, `build_share_link`, folder helpers — AC1/AC7),
`sheets_service` (`append_index_row` to `LifeManagerIndex` — AC2),
`cold_tiering_service` (`is_cold`/`find_cold_files`/`tier_cold_files`, 30-day
policy — AC4), `transcription_service` (`extract_text` for audio/image — AC6).
UI: `DriveFiles` page (`/drive-files`) badges Drive-stored files + links to the
blob (AC8). The `tier_cold_data` Celery task runs the sweep daily.

### People profiles & behavioural analysis (audit task 3cc09436)

Track the people you interact with, score the relationship from interaction
history, and keep free-text notes + a behaviour log per person.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/people/{id}/profile` | The person's profile: `ai_score`, `user_notes`, `behavior_log`, `relationship_type` (auto-creates an empty profile). |
| POST | `/api/people/{id}/profile/analyze` | Score the relationship from interaction history; persists `ai_score` + `relationship_type` and appends a snapshot to `behavior_log`. |
| POST | `/api/people/{id}/profile/note` | Save a free-text `user_notes` note. |

Model: `PersonProfile` (one per `Person` — `ai_score`, `user_notes`,
`behavior_log` JSON, `relationship_type`, `last_analyzed_at`; migration 0024).
Service: `person_profile_service` (reuses `AIService.analyze_person_behavior`).
UI: `PersonProfilePage` (`/people/:id/profile`) with score, note form, and
behaviour history; `PeopleProfiles` links each person to their profile.

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

The Alembic chain (`migrations/versions/`, head `0026_ai_provider_routing`)
is kept in sync with `Base.metadata` — `tests/test_migration.py` /
`test_migrations.py` assert every model table is created by `alembic upgrade head`.

Startup can optionally auto-migrate: set `RUN_ALEMBIC_MIGRATIONS_ON_STARTUP=true`
and the app runs `alembic upgrade head` programmatically at startup **only when
`ENVIRONMENT != production`** (production logs a warning and skips — migrate as a
controlled deploy step). Off by default; migration errors are logged and
swallowed so startup never crashes (`app/services/migration_runner.py`). The
legacy idempotent `ALTER TABLE` block in `startup_event` remains as
belt-and-suspenders for the create_all (no-alembic) path on Render's free tier.
