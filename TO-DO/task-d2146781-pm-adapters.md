# task d2146781 — live third-party PM credentials + vendor adapters

**Status:** external (per-vendor API keys); generic adapter + oversight logic built.

**What's done in-repo:**
- Connections CRUD + token encrypted at rest (`/api/v1/oversight/connections`).
- `GenericHttpAdapter` (ExternalProjectInterface) — fetches `<base_url>/projects`
  with a bearer token; `fetch_project_data` runs it when a connection has
  base_url+key. `POST /connections/{id}/sync`.
- Time allocation with a real per-connection `time_budget_minutes` +
  `PATCH .../time-budget`; `GET /time-allocation`.
- Neglected-item + problem detection (`GET /neglected`) + `GET /tasks`; UI summary.

**What's deferred and why:** vendor-specific adapters (Jira/Linear/Asana/GitHub
Projects) + the user's own "project management" app need real API base URLs +
keys/OAuth that only the owner has. The generic adapter already works against any
REST PM API exposing `/projects`; bespoke field-mapping per vendor + RBAC
("میزان دخالت" scoping) are the remaining, credential-gated pieces.

**To wire when creds exist:** subclass `ExternalProjectInterface` per vendor (or
point the generic adapter at the vendor's `/projects` shape), store the key via
the existing encrypted connection, and the sync/oversight pipeline lights up.
