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
`frontend/src/pages/AISettings.jsx` (route `/ai-settings`).
