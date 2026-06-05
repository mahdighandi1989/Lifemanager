# Authentication Hardening — Final Security Audit

**Task:** `9a5a3b4d-163b-4775-adf0-341c670fb58f` — تقویت مکانیزم احراز هویت
**Type:** security · **Priority:** critical
**Scope:** `app/dependencies/auth.py` and every route that resolves a user id.

## 1. The vulnerability

While the SPA ran in login-bypass mode, **every** user-scoped route resolved
identity through `get_optional_user_id`, which returned
`DEFAULT_ANON_USER_ID = 0` whenever the bearer token was missing **or invalid**.
A present-but-forged/expired token therefore silently resolved to user `0`'s
data instead of being rejected — the auth layer was effectively disabled for
sensitive endpoints, and an attacker probing with a guessed token reached user
0's records.

## 2. The fix (mechanism)

`app/dependencies/auth.py` now exposes three identity dependencies:

| Dependency | No `Authorization` header | Header present, token VALID | Header present, token INVALID/expired |
| --- | --- | --- | --- |
| `get_current_user` | **401** | user row | **401** |
| `get_required_user_id` | `DEFAULT_ANON_USER_ID` if `REQUIRE_AUTH=False`, else **401** | user id | **401** *(always)* |
| `get_optional_user_id` | `DEFAULT_ANON_USER_ID` | user id | `DEFAULT_ANON_USER_ID` |

Key change vs. the old behaviour: `get_required_user_id` **never** downgrades a
present-but-invalid credential to the anon scope — a bad bearer is an attack
signal and always yields 401, regardless of `REQUIRE_AUTH`. Both `*_user_id`
helpers verify the JWT signature/algorithm/expiry via
`AuthService.verify_token`, so even the lenient path no longer trusts an
unverified token; it just falls back to anon instead of 401.

The `REQUIRE_AUTH` setting (`app/config.py`, default `False`) is the operator
switch: once the user-0 data has been re-homed to real accounts, flipping it to
`True` makes the missing-header case on sensitive routes return 401 as well.

## 3. Endpoint classification (audit result)

**Strict — `get_required_user_id`** (sensitive data; the AC's named modules):

- `app/routes/finance.py` — 18 endpoints
- `app/routes/context.py` — 7 endpoints
- `app/routes/assets.py` — 4 endpoints

**Strict — `get_current_user` / `get_current_admin_user`** (full user row /
admin gate): `ai.py` (admin + model-gen), `integrations.py`,
`notifications.py`, `users.py`, `auth_google.py`, `settings.py`.

**Lenient — `get_optional_user_id`** (intentionally kept under the documented
single-tenant login-bypass design; these read/write only the caller's own
per-user scope and 403'ing them would break the dashboard while bypass is on):
`projects.py`, `notifications.py`, `deduplication.py`, `local_files.py`,
`merge.py`, `interests.py`, `ai_profile.py`, `files.py`, `person.py`,
`self_improvement.py`, `lists.py`, `todo_items.py`, `location.py`, `drive.py`,
`tasks.py`, `ai.py` (config CRUD), `external_projects.py`, `oversight.py`.

These remain lenient by design — but they too now reject a *forged* token's
identity at the signature layer (it resolves to anon, never to a spoofed id).
When `REQUIRE_AUTH` is flipped on after the data migration, swapping these to
`get_required_user_id` is a one-line-per-route change with no body edits
(both dependencies return `int`).

## 4. User-0 data migration (AC3 — operator-driven)

`app/services/user_data_migration.py` + `scripts/reassign_anon_user_data.py`
re-home every `user_id = 0` row to a real account:

- Tables are discovered **dynamically** from `Base.metadata` (any table with a
  `user_id` column is included — stays correct as the schema grows).
- Runs inside one transaction (all-or-nothing; no half-migrated state).
- `dry_run=True` reports per-table row counts without writing.

The only manual input is `target_user_id` — which real account inherits the
anon data. That single integer cannot be inferred from the data, so the
operator supplies it via the CLI. This is the lone genuinely manual step.

## 5. Tests

- `tests/test_auth_required_user_id_9a5a3b4d.py` — valid/invalid/expired/missing
  bearer on sensitive routes, `REQUIRE_AUTH` on/off.
- `tests/test_user_data_migration_9a5a3b4d.py` — dynamic table discovery,
  dry-run, transactional reassignment.
- `tests/test_auth_dependencies.py`, `tests/test_jwt_auth_pipeline.py`,
  `tests/test_security.py` — supporting coverage.

Live validation probe (matches the task's curl):
`GET /api/finance/incomes` with `Authorization: Bearer invalid_token` → **401**.

## 6. Residual risk / follow-ups

- Lenient routes stay anon-reachable until `REQUIRE_AUTH=true`; that flip is
  gated on the operator completing the AC3 data migration (manual decision).
- No remaining route trusts an *unverified* token for identity.
