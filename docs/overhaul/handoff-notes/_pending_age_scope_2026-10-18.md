# Pending: age package part 1 — per-user Google scope + one birth date per user — 2026-10-18

> Temporary note. Decision: `docs/decisions/2026-10-18-age-and-user-scope.md`, items 1 and 2.
> Area «app» (owners urgent/general), recorded with `scripts/supervisor/handoff.py add --by session`.

## 1. Per-user data scope (`app/dependencies/auth.py`)
- `_resolve_data_scope_user_id` (oauth branch):
  - **owner → 0, unchanged.**
  - any other **approved** Google account → its own `users.id`.
  - pending/rejected/unknown → 0, unchanged. `get_signed_in_user_id` still returns 403 for these.
  - `PER_USER_OAUTH_SCOPE=false` → everyone 0 (the old behaviour).
- **How the owner is identified** (`_is_scope_owner`): `settings.owner_emails_list` is `OWNER_EMAIL` (comma list; the same env var
  `brain_service._known_owner_emails` already reads), or else `ADMIN_EMAILS` (the bootstrap super-admins, protected in `google_auth`). If both
  are empty, **per-user scope is inactive**: every approved Google account resolves to 0 (old behaviour) and one warning is logged per
  process: «per-user scope inactive: set OWNER_EMAIL». That warning names the lowest-id admin/approved account as a hint only; the hint
  never turns per-user scope on (coordinator safety review). No e-mail is written in code.
  - Production check: `ADMIN_EMAILS` must hold the owner's Google address. It already must, for `_owner_channels` / admin. If it holds more
    than one address, every listed super-admin keeps scope 0. Set `OWNER_EMAIL` to narrow this to the owner alone.
- **Own scope** = a non-loginable `users` row (`_oauth_scope_user_id`):
  - e-mail `oauth-<sha256(google e-mail)[:24]>@oauth-scope.invalid`, `hashed_password='!'`. `.invalid` is rejected by `EmailStr`, so no one
    can register or log in as that row and no one can pre-claim it.
  - Stable per Google e-mail. It is created on first use and is race-safe (IntegrityError → re-select).
  - No new column, so no ALTER/alembic was needed. Data FKs to `users.id` stay valid.
- A promoted admin (`role=admin` through the admin UI, not in `ADMIN_EMAILS`/`OWNER_EMAIL`) now gets their OWN scope. `_owner_channels`
  (app_records AI/Drive/attachments) still lets them use the owner's resources, but on their own records.
- `get_signed_in_user_id` now reads `status`/`is_active` before scope resolution, because resolution may commit the new row.

### Places that rely on scope 0 (they keep serving the owner only)
- **Anchor row:** `app/main.py` startup inserts `users(id=0, 'anon')`.
- **Startup cleanup:** `main.py` (~1102) `auto_purge_exact_test_junk` / `dismiss_locked_boilerplate` run with `user_id=0`.
- **«0 also sees legacy NULL rows» helpers** (they apply only to uid 0, so they stay correct for other users):
  - `telegram_compose` (545, 713)
  - `directive_service:149`
  - `finance_email_scan_service` (205, 479, 622)
  - `cleanup_service` (61, 151–176)
  - `finance_report_service:23`
  - `inbox_service:253`
  - `brain_service:366`
  - `sahat_service` (223, 366)
  - `weekly_review_service:49`
  - `owner_identity_service._scope`
  - `clarification_service` (49–66, 1034, 1519)
  - `place_service:49`
  - `owner_insight/providers/{writings,world,documents,behaviour,habits}`
  - `attention_service:132`
  - `ingest/identity_facts:37`
- **Background jobs hard-coded to user 0** (the owner's channels; a second user gets none of these):
  - `google_sync/triage_service` (70, 206–279)
  - `google_sync/digest_service:253`
  - `mobile_watchdog_service` (146, 166)
  - `telegram_compose:408`
- **Other scope-0 code:**
  - `routes/users.py:124` (anon-id special case)
  - `services/user_data_migration.py` (moves scope 0 to a real account)
  - `app_reminder_service:260` / `finance_ingest_service:451` (`user_id or 0`)

## 2. Date of birth (one per user, in `owner_identity_fields.date_of_birth`)
- **Registration:**
  - `UserCreate.date_of_birth: Optional[date]` (empty string → None). Must be a real date, before today, year ≥ 1900, else 422.
  - `/auth/register` stores it locked in the new user's identity row (best-effort after the account exists).
  - `Register.jsx` has an optional date field and one sentence on why: the age-appropriate conversation and the same-age comparison in the
    mind card. Only the date is kept, never an age number.
- **Profile:**
  - `PUT /api/identity-profile/date_of_birth` now validates (400 on invalid). Loose spellings that already worked («08 Mar 1989») still pass.
  - `IdentityProfile.jsx` shows a date picker when the value is empty or ISO, the same explanation line, and the server's error text.
- **Service:** `owner_identity_service.check_date_of_birth / get_date_of_birth / set_date_of_birth`.
- The existing derived «سن» row (`refresh_derived`) is kept as before. It is always recomputed from the date and never accepted as input.

### Contract for the learning page (the page side is another fixer's)
```
GET  /api/me/date-of-birth
  → 200 {ok, success, date_of_birth: "YYYY-MM-DD" | null, raw: <unparseable stored text> | null, owner_locked: bool, source: str | null}
PUT  /api/me/date-of-birth   body {"date_of_birth": "YYYY-MM-DD"}   ("" or null clears and unlocks)
  → 200 same shape | 422 {detail: "<Persian reason>"}
Auth: get_signed_in_user_id — 401 without a token; 403 for a pending/rejected Google account. The scope is the caller's own (owner → 0).
```
- Read with `GET` on load. If `date_of_birth` is null and the page has `settings.profile.birth`, `PUT` it once (fill-empty).
  - If both exist and differ, the server value wins (it is locked, the user's own word). Then write it back to `settings.profile.birth`.
- Compute age from the date on the client. Never send an age.
- `/api/identity-profile/date_of_birth` (PUT `{value}`) also works, but it uses `get_required_user_id`: with no token and
  `REQUIRE_AUTH=false` it falls into scope 0. Use `/api/me/date-of-birth`.

## Tests
- `tests/test_age_and_user_scope.py` (20):
  - owner → 0
  - second user → own stable id, sees none of scope 0's app records or identity fields, and their writes stay out of scope 0
  - local/pending/rejected/anon/invalid unchanged; flag off → 0
  - owner fallback with no e-mails configured; the `OWNER_EMAIL` setting takes priority
  - register with, without and with an invalid date
  - `/api/me/date-of-birth` round trip, validation and auth
  - identity-profile PUT validation
  - date boundaries
  - the reserved e-mail cannot be registered or logged into
- Full `python -m pytest tests/ -q` and `cd frontend && npm run build`: green (see AUDIT_LOG).

## Not done
- The learning-page side (items 3–6): the page reading and writing this endpoint, the age-adaptive conversation, the mind-card norms, the tours.
- No migration of a second user's past writes: anything a second Google user already wrote stays in scope 0, mixed with the owner's data.
  Review it by hand if such a user existed.
- Background channels (Telegram, Gmail triage, digests) remain the owner's only.
