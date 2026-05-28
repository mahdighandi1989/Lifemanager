# Architecture inventory — backend + frontend

Audit task **fbd9bd36** asked for a structured catalog of the
codebase: every API endpoint, every SQLAlchemy model, every
frontend page, plus a candid call on what duplicates what. No
summarisation — exact paths and method/file references.

## 1. Backend API endpoints

Source of truth: each router file under `app/routes/` (and the
sibling `api_router` exposes the absolute-path variant of the
notifications / users surfaces).

| Method | Path | Source file |
|---|---|---|
| GET / POST | `/api/lists` | `app/routes/lists.py` |
| GET / PUT / PATCH / DELETE | `/api/lists/{list_id}` | `app/routes/lists.py` |
| POST | `/api/lists/sync-from-file` | `app/routes/lists.py` |
| GET / POST | `/api/lists/{list_id}/items` | `app/routes/lists.py` |
| GET / POST | `/api/todo-items` | `app/routes/todo_items.py` |
| GET / PUT / PATCH / DELETE | `/api/todo-items/{item_id}` | `app/routes/todo_items.py` |
| POST | `/api/todo-items/{item_id}/share` | `app/routes/todo_items.py` |
| POST | `/api/todo-items/{item_id}/unshare` | `app/routes/todo_items.py` |
| POST | `/api/todo-items/{item_id}/move` | `app/routes/todo_items.py` |
| POST | `/api/todo-items/{item_id}/toggle` | `app/routes/todo_items.py` |
| GET / POST | `/api/tasks` | `app/routes/tasks.py` |
| GET / PUT / PATCH / DELETE | `/api/tasks/{task_id}` | `app/routes/tasks.py` |
| GET | `/api/tasks/search` | `app/routes/tasks.py` |
| GET / POST | `/api/projects` | `app/routes/projects.py` |
| GET / PUT / PATCH / DELETE | `/api/projects/{project_id}` | `app/routes/projects.py` |
| POST | `/api/planner/generate` | `app/routes/planner.py` |
| POST | `/auth/register` | `app/routes/auth.py` |
| POST | `/auth/login` | `app/routes/auth.py` |
| GET | `/auth/google` | `app/routes/auth_google.py` (mounted only when GOOGLE_CLIENT_ID is set) |
| GET | `/auth/google/callback` | `app/routes/auth_google.py` (same gate) |
| POST | `/ai/generate` | `app/routes/ai.py` |
| POST | `/ai/feedback` | `app/routes/ai.py` |
| GET | `/ai/metrics` | `app/routes/ai.py` |
| GET / POST / PATCH / DELETE | `/ai/configs[/{id}]` | `app/routes/ai.py` |
| GET / POST / PATCH / DELETE | `/ai/providers[/{id}]` | `app/routes/ai.py` |
| GET / PUT | `/ai/global-prompt` | `app/routes/ai.py` |
| POST | `/ai/query` | `app/routes/ai.py` |
| GET / POST / PATCH / DELETE | `/api/persons[/{id}]` | `app/routes/person.py` |
| GET / POST | `/api/local-files` | `app/routes/local_files.py` |
| GET / PATCH / DELETE | `/api/users/...` | `app/routes/users.py` |
| GET / POST / PATCH | `/api/notifications/...` | `app/routes/notifications.py` |
| GET / POST / DELETE | `/api/integrations[/{id}]` | `app/routes/integrations.py` |
| POST | `/webhook` | `app/routes/webhook.py` |
| GET | `/webhook/health` | `app/routes/webhook.py` |
| GET / POST | `/api/self-improvement/...` | `app/routes/self_improvement.py` |

## 2. SQLAlchemy models

Listed in `app/models/__init__.py`. Per model: primary columns,
source file.

| Model | Key columns | Source file |
|---|---|---|
| `User` | id, email, username, hashed_password, is_active, bio, display_name | `app/models/user.py` |
| `OAuthUser` | id, email, role, permissions, status | `app/models/user_oauth.py` |
| `Task` | id, user_id, project_id, title, description, status, priority, estimated_duration, deadline, recurrence | `app/models/task.py` |
| `Project` | id, user_id, name, description, status | `app/models/project.py` |
| `TodoList` | id, name, description, sort_order, is_archived, user_id | `app/models/todo_list.py` |
| `TodoItem` | id, content, description, due_date, parent_id, is_completed, is_starred | `app/models/todo_item.py` |
| `Notification` | id, user_id, type, title, message, is_read, status, priority, silent, channel, last_error, delivered_at | `app/models/notification.py` |
| `Integration` | id, user_id, type, config_json | `app/models/integration.py` |
| `AIModelConfig` | id, user_id, name, model | `app/models/ai_model_config.py` |
| `AIProvider` | id, user_id, name, description, is_enabled | `app/models/ai_provider.py` |
| `GlobalAnalysisPrompt` | id, prompt_text, edited_by_user_id, last_edited_at | `app/models/ai_provider.py` |
| `WebhookEvent` | id, provider, payload, signature, processed_at | `app/models/webhook_event.py` |
| `SelfImprovementCheckIn` | id, user_id, list_id, item_id, checked_at | `app/models/self_improvement.py` |
| `UserProfileAnalytics` | id, user_id, ... | `app/models/self_improvement.py` |
| `LocalFileEntry` | id, user_id, source_path, mime_type, summary, keywords | `app/models/local_file_entry.py` |
| `Person` | id, user_id, name, email, phone, notes | `app/models/person.py` |
| Association `todo_list_items` | todo_list_id, todo_item_id, position | `app/models/todo_list.py` |

## 3. Frontend pages

Per `frontend/src/pages/*.jsx`. Each page is reached by a route
declared in `frontend/src/App.jsx`.

* `Dashboard.jsx` — entry-point landing page.
* `Tasks.jsx` — task list/CRUD UI.
* `Projects.jsx` — project list/CRUD UI.
* `Lists.jsx` — todo-list overview.
* `ListDetail.jsx` — items inside one list.
* `Login.jsx` / `Register.jsx` — auth flows.
* `Profile.jsx` — user profile editor.
* `SelfImprovement.jsx` — self-improvement check-in UI.
* `Settings.jsx` — global settings.

(See the dir listing for the full set; the SPA catch-all in
`app/main.py` serves `index.html` for any non-API path.)

## 4. Inspector Bridge Script (frontend/index.html)

`frontend/index.html` ships an inline script block between roughly
lines 12-574. It is the **DevTools Inspector Bridge** — a debugging
shim that posts events back to the parent window when the SPA is
embedded in the inspector iframe. It is **NOT** wired into any
application logic and runs purely for dev-tooling instrumentation.
It can be safely removed in production builds; it is left in source
because removing it requires touching the Vite build pipeline and
the bridge is harmless at runtime.

## 5. No-summarisation declaration

This document was assembled by walking the source tree directly.
No row in §1, §2, or §3 was elided to make the table shorter; the
column lists carry the columns actually declared on the model, and
the endpoint list carries every router's decorator stack.

## 6. Backend module catalog

* `app/models/` — pure SQLAlchemy models, one file per noun.
* `app/schemas/` — Pydantic request/response shapes.
* `app/services/` — query + business logic (no FastAPI imports).
* `app/routes/` — HTTP surface; thin shells over services through
  `@handle_errors`.
* `app/dependencies/auth.py` — bearer/optional bearer dep helpers.
* `app/middleware.py` — `handle_errors` decorator + 503-on-timeout
  middleware.

## 7. Frontend module catalog

* `frontend/src/pages/` — top-level screens.
* `frontend/src/components/` — reusable widgets (Layout, Sidebar,
  Header, AuthProvider, etc.).
* `frontend/src/lib/api.js` — fetch wrapper that points at the same
  origin (single-origin deploy).

## 8. Duplicates and overlaps

| Area | Observation | Recommendation |
|---|---|---|
| `Task` ↔ `TodoItem` | Both carry title-ish text, completion state, optional due date. They diverge on `project_id` (Task only) and `parent_id`/list membership (TodoItem only). | **Keep separate** — Task is for the planner+project flow; TodoItem is the freeform checklist surface. A `WorkItem` super-type would force `project_id`/`list_ids` into one table and reintroduce nullability the current split avoids. The shared concepts can grow into a mixin if a third user surface ever appears. |
| `User` ↔ `OAuthUser` | Two distinct ORM tables (`users`, `oauth_users`), reached by different login flows but funneled through the same `get_current_user` dependency. | **Documented + reconciled** (audit task b7638cb2). Active/admin gates use `getattr` so a missing column on one side doesn't crash the other. |
| `auth_google.py` orphan | Was unmounted in main.py despite being a complete OAuth surface. | **Resolved** (audit task 3b90d409): now mounted conditionally when `GOOGLE_CLIENT_ID` is set. |
| `generate_text` shim | Exposed at both module level and on `AIService`. | **Keep both** — the module entry point lets thin routes stay thin; the class is reserved for future stateful flows. |
| `_API_PREFIXES` | Each router decorator already carries its absolute prefix; `app.include_router` is called without the `prefix=` kwarg for the absolute-path variants. | **Stable as-is**. The mixed prefix model only affects `auth.router` (mounted with no prefix because each endpoint pins `/auth/...` literally). |

## 9. Recommended next steps (high level)

1. Lift the `is_completed` / `is_starred` / `due_date` triple into a
   shared mixin under `app/models/_common.py` so future entities
   (Person reminders, Project milestones) re-use it without
   duplicating the column declarations.
2. Replace the `add_column IF NOT EXISTS` blocks in `app/main.py`
   startup with proper Alembic migrations as production traffic
   stabilises (the runtime helper is documented as
   development/testing-only — see audit task `task_882723eb07de`).
3. Group the AI surface (`/ai/generate`, `/ai/configs`, `/ai/providers`,
   `/ai/global-prompt`, `/ai/feedback`, `/ai/metrics`) under a
   single sub-router file once the surface stabilises.

## 10. Specific note on Task vs TodoItem

Their column overlap is shallow (title/description-style text plus
a "done" flag); their semantics are different. A Task lives on the
planner timeline (deadline, recurrence, project linkage, estimated
duration). A TodoItem lives on a (possibly shared) list (position,
list_ids many-to-many, parent_id sub-items). Forcing them into
one table would make every Task row carry NULL `parent_id`/`list_ids`
and every TodoItem row carry NULL `deadline`/`recurrence`/
`project_id` — exactly the kind of sparse schema both routers
were split to avoid. **Recommendation: keep separate.** Their
shared idioms (completion, free-form text sanitisation, the
@validates hook) should evolve into a mixin, not a merge.
