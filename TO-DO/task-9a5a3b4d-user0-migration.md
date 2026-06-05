---
task_id: 9a5a3b4d-163b-4775-adf0-341c670fb58f
task_title: "نقص در مکانیزم احراز هویت: get_optional_user_id بدون اعتبارسنجی توکن"
execution_priority: 1000
created_at: "2026-06-02T21:07:39.947207+00:00"
updated_at: "2026-06-05T18:40:00+00:00"
status: "pending"
---

# task 9a5a3b4d — migrate legacy user-0 data to real accounts

**Why this file exists:** the security task is implemented in-repo (the auth
enforcement below). One acceptance criterion — *"داده‌های کاربر 0 به کاربران
واقعی منتقل شوند"* (AC3, marked `manual_only`) — is the only piece that cannot
be run by the agent: it reassigns rows in the **operator's production
database** and requires a human ownership decision (which real account each
anonymous row belongs to). That data lives only in production and the mapping
is a business decision, so it is genuinely operator-only.

## What is already done in-repo (auto — no action needed)

- **`get_required_user_id`** (`app/dependencies/auth.py`) — strict identity
  dependency. A present-but-forged/expired bearer is now **always** rejected
  with 401 (never silently downgraded to user 0). Commit references the change.
- **Sensitive routes wired to it** — `app/routes/finance.py`,
  `app/routes/assets.py`, `app/routes/context.py` now use the strict dep.
- **`REQUIRE_AUTH` flag** (`app/config.py`, `.env.example`) — master switch.
  Default `False` keeps the current single-tenant login-bypass frontend working
  and the legacy user-0 data reachable. Set it `True` to refuse anonymous
  (no-header) access to the sensitive routes — but only **after** the migration
  below, or real users lose access to their own existing data.
- **Security tests** — `tests/test_auth_required_user_id_9a5a3b4d.py`
  (forged/expired token → 401, anon fallback by default, 401 when REQUIRE_AUTH
  is on, optional dep stays lenient).
- **Migration mechanism (NEW — automated)** — `app/services/user_data_migration.py`
  + the `scripts/reassign_anon_user_data.py` CLI. The reassignment itself is now
  fully scripted (transactional, all-or-nothing, with a `--dry-run` preview); it
  discovers every `user_id` table from SQLAlchemy metadata automatically.
  Covered by `tests/test_user_data_migration_9a5a3b4d.py`. The **only** thing
  left to a human is the ownership decision + running the command against prod.

## What you (the operator) must do

**Priority: HIGH — do before flipping `REQUIRE_AUTH=true`.**

1. Decide the ownership mapping: which real `users` / `oauth_users` account
   should own the rows currently scoped to `user_id = 0`. There may be exactly
   one real operator account, in which case it is a single target id.
2. Reassign the legacy rows using the provided CLI (runs in a single
   transaction — all-or-nothing — and auto-discovers every user-scoped table,
   so you don't hand-write per-table SQL). Back up the DB first, then:

   ```bash
   # preview the per-table row counts that would move (writes nothing)
   python -m scripts.reassign_anon_user_data --target <real_user_id> --dry-run
   # perform the reassignment of user 0's data onto the real account
   python -m scripts.reassign_anon_user_data --target <real_user_id>
   ```

   The command prints per-table affected-row counts and a total; verify them.
3. Only then set the `REQUIRE_AUTH` env var to `true` on the deploy and
   restart, so anonymous access to the sensitive routes is refused.

### Expected outcome
No business rows remain on `user_id = 0`; every real user sees the data that
was previously in the anon bucket; with `REQUIRE_AUTH=true`, a request with no
bearer token to `/api/finance/*`, `/api/assets`, `/api/context/*` returns 401.

## When you have done this
Set `status: "done"` in the front-matter above and remove this entry from
`TO-DO/_index.json` (or delete this file and prune the index entry).
