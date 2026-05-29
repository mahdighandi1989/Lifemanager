# task_78c0e8e0a9b5 — JWT revocation list + httpOnly cookies (sub-task 9)

**Status:** deferred (design-blocked, not code-blocked in isolation).

**What's done in-repo:** per-user scoping is now enforced on projects / lists /
todo-items (cross-tenant read leak closed — see commit + `tests/test_user_scoping_78c0e8e0.py`);
JWT signature+expiry verified (`auth_service.verify_token`); production refuses a
default/placeholder secret (`app/config.py`).

**What's deferred and why:**
- **Token revocation list (logout/blacklist):** needs a Redis-backed denylist
  keyed by jti + a logout endpoint that adds the token. The app currently runs
  in **login-bypass mode** (`frontend/src/context/AuthContext.jsx` →
  `isLoginBypassEnabled=true`, Login page disabled by product decision), so there
  is no live login/logout flow to revoke against. Building a denylist now would
  be dead code until login is re-enabled.
- **httpOnly cookie storage** (instead of `localStorage`): requires re-enabling
  the real login flow + CSRF protection on the cookie. Same blocker.

**To wire once login is re-enabled:** add `jti` to the JWT claims in
`auth_service.create_access_token`, a `token_denylist` Redis set, check it in
`verify_token`, add `POST /auth/logout`, and switch the frontend to httpOnly
cookies + CSRF token. The seams (`AuthService`, `get_current_user`) are ready.
