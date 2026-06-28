---
title: "Google Drive integration via offline-access OAuth (refresh token), managed from the UI"
tags: ["google-drive", "google-oauth", "oauth-offline", "refresh-token", "integration", "backend", "frontend"]
topic_canonical: "google-drive-oauth-offline-integration"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-06-28T00:00:00Z"
merged_from: []
---

# Google Drive integration via offline-access OAuth (refresh token), managed from the UI

## 🎯 چالش / Challenge

An app needs to store its files/data in the **user's own** Google Drive
(folders, uploads, a central index sheet) and let the user **connect /
disconnect / check / sync** the link from the app's own settings UI — without
ever hardcoding a service account, and degrading to local-only behaviour when
no connection exists.

The hard parts:
1. Browser **sign-in** OAuth (an ID token) is NOT enough — Drive API calls need
   an **access token**, and to keep working unattended you need a long-lived
   **refresh token**, which Google only returns with `access_type=offline` +
   `prompt=consent`.
2. A "Connect" button is a top-level browser navigation, so it can't send an
   `Authorization: Bearer` header — the operator's identity has to ride along
   another way.
3. The integration must not break the app when the libraries or credentials are
   absent (a fresh deploy, a stripped image, CI).

## 💡 راه‌حل / Solution

Build it in four behaviour-preserving layers, each independently testable:

1. **Connection store** — a key/value settings table holds the
   `refresh_token` (ENCRYPTED at rest), the connected account email, and a cached
   root-folder id. One module owns read/write so connect/disconnect is one
   switch. Provide env-var fallbacks for headless setups.
2. **Real API client adapter** — wrap the *synchronous* google-api-python-client
   in `asyncio.to_thread` behind an **async interface the rest of the code
   already expects** (`get_or_create_folder` / `upload` / `list_files` /
   `download` / `append_row`). A factory returns `None` when not connected /
   libs missing → callers treat `None` as "offline".
3. **OAuth connect/callback/disconnect** — `connect` redirects to the consent
   screen with `access_type=offline`, `prompt=consent`, a least-privilege scope
   (`drive.file`), and a random `state` nonce stored in an httponly cookie
   (CSRF). The **callback is shared** with sign-in: a `drive:`-prefixed `state`
   routes to the Drive branch, which exchanges the code, captures the
   refresh token, stores it, and eagerly creates the folder tree.
4. **Frontend panel** — a status grid (`configured` vs `connected` vs
   `account`) + Connect/Disconnect/Test/Sync buttons. Connect is a
   `window.location` navigation carrying the JWT as `?token=`; everything else
   is a normal XHR.

Key seam idea: design the service layer up front to accept an injected `client`
and `refresh_token` and raise/`NotImplementedError` without one. Then the "real
integration" is just *one new adapter class* slotted into the existing seam — no
ripple through routes, and stub-client unit tests already cover the logic.

## 🧪 نمونه کد (Anonymized)

```python
# 1) Connection store (key/value), refresh token encrypted at rest
async def store_connection(db, *, refresh_token, account_email=None):
    if refresh_token:
        await _set(db, KEY_REFRESH_TOKEN, encrypt_data(refresh_token))  # Fernet
    if account_email:
        await _set(db, KEY_ACCOUNT_EMAIL, account_email)

async def resolve_refresh_token(db):
    row = await _get(db, KEY_REFRESH_TOKEN)
    if row and row.value:
        try: return decrypt_data(row.value)
        except Exception: pass         # rotated key → treat as "not connected"
    return os.getenv("APP_DRIVE_REFRESH_TOKEN")    # headless fallback

# 2) Mint an access token from the refresh token (grant_type=refresh_token)
async def refresh_access_token(refresh_token):
    r = await httpx.AsyncClient().post(TOKEN_URI, data={
        "client_id": CID, "client_secret": SECRET,
        "refresh_token": refresh_token, "grant_type": "refresh_token"})
    return r.json().get("access_token") if r.status_code == 200 else None

# 2b) Async adapter over the SYNC google client
class DriveClient:
    def __init__(self, svc): self._d = svc
    async def get_or_create_folder(self, name, parent=None):
        return await asyncio.to_thread(self._foldersync, name, parent)
    def _foldersync(self, name, parent):
        q = ["mimeType='application/vnd.google-apps.folder'", "trashed=false",
             f"name='{name}'"] + ([f"'{parent}' in parents"] if parent else [])
        hit = self._d.files().list(q=" and ".join(q), fields="files(id)").execute()
        if hit["files"]: return hit["files"][0]["id"]
        body = {"name": name, "mimeType": "application/vnd.google-apps.folder"}
        if parent: body["parents"] = [parent]
        return self._d.files().create(body=body, fields="id").execute()["id"]

# 3) Connect = consent redirect with offline access + CSRF state cookie
params = {"client_id": CID, "redirect_uri": REDIRECT, "response_type": "code",
          "scope": "https://www.googleapis.com/auth/drive.file openid email",
          "access_type": "offline", "prompt": "consent", "state": "drive:"+nonce}
resp = RedirectResponse("https://accounts.google.com/o/oauth2/v2/auth?"+urlencode(params))
resp.set_cookie("oauth_state", nonce, httponly=True, max_age=600)
```

```jsx
// 4) Connect button: a top-level navigation carrying the JWT as ?token=
const connect = () =>
  window.location.assign('/auth/google/drive/connect?token=' +
    encodeURIComponent(localStorage.getItem('token') || ''));
```

## ⚠️ نکات حیاتی / Pitfalls

- **No refresh token without `access_type=offline` + `prompt=consent`.** And
  Google returns it **only on the first consent** — if you lose it, the user must
  revoke the app at myaccount.google.com and reconnect. `prompt=consent` forces
  it on every run, which is the safe default for a "(re)connect" button.
- **The connect navigation can't send an auth header.** Pass the JWT as
  `?token=` and validate it server-side, OR rely on an httponly session cookie.
  Don't leave the endpoint unauthenticated.
- **CSRF on the callback:** stash a random nonce in an httponly cookie and
  compare it to `state` on return. Reuse one callback for sign-in and connect by
  prefixing the connect `state` (e.g. `drive:`).
- **`drive.file` scope is least-privilege** — the app sees only files IT created,
  which is almost always what you want. `drive` (full) needs Google verification.
- **Wrap the sync client in `to_thread`.** google-api-python-client is blocking;
  calling it directly stalls an async event loop.
- **Encrypt the refresh token at rest** and never return it to the client — the
  status endpoint should expose `connected: true` + the account email only.
- **Degrade, don't crash:** lazy-import the google libs; a missing lib or token
  → factory returns `None` → callers fall back to local-only. Keeps CI / fresh
  deploys green.
- A metadata-only file row has **no bytes to upload** — decide explicitly what
  "migrate to Drive" means (upload the extracted text? require real bytes via a
  multipart endpoint?) rather than silently no-op'ing.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

Generic checklist for wiring an offline-OAuth cloud integration (Drive, Gmail,
Dropbox, Box, OneDrive…):

1. **Pre-build the seam:** services take an injected `client` + `token` and
   raise without one; unit-test the logic with a stub client first.
2. **Pick scopes least-privilege**; enable the matching APIs in the cloud console.
3. **Connection store:** one key/value module; token **encrypted at rest**; env
   fallback for headless. Expose `is_connected` / `get_status` / `disconnect`.
4. **Token exchange:** `refresh_token` → `access_token` via the provider's token
   endpoint; never raise (return `None` on failure).
5. **Adapter:** wrap the SDK behind the async interface your code already calls;
   factory returns `None` when offline.
6. **OAuth dance:** `connect` (offline + consent + CSRF state cookie) → shared
   `callback` (verify state, capture refresh token, store, bootstrap folders) →
   `disconnect` (clear store).
7. **Frontend:** status grid + connect (navigation w/ `?token=`) + disconnect /
   test / sync (XHR). Surface `?status=connected|error` after the round-trip.
8. **Wire the real client into existing background jobs** (the cold-tiering
   mover, the index/ledger writer) so the scheduled path uses it when connected
   and stays a no-op otherwise.
9. **Document the operator's manual steps** (console client, redirect URI, env
   vars, click Connect) — the code can't do those for them.

## 🔗 References
- Initial implementation: lifemanager Drive integration, 2026-06-28
  (`app/services/drive_settings_service.py`, `app/services/google_api_client.py`,
  `app/routes/auth_google.py`, `app/routes/drive.py`, `frontend/src/pages/DriveSettings.jsx`).
- Related: [google-oauth-login], [pluggable-ai-provider-catalog-and-router]
  (same injected-client seam pattern).

## Update 2026-06-28 — serving cloud bytes back through the app (download)

When a "download my file" endpoint sits in front of cloud-stored blobs, return
the bytes through the app with a **graceful 3-way fallback**, not a single path:

1. **Connected → stream the real bytes.** Fetch via the injected client and wrap
   in a streaming response with `Content-Disposition: attachment; filename=...`
   and the stored mime type. This works even when the cloud share link isn't
   public (least-privilege scopes like `drive.file` create non-public files).
2. **Not connected but a share link exists → 302 redirect** to the link, so the
   capability degrades instead of 500-ing.
3. **No cloud copy (local/metadata-only) → return the local representation**
   (e.g. the extracted text) as the body.

Keep this as an **additive** route (`/files/{id}/download`) alongside any
existing metadata/link endpoints — don't change the old ones, so their consumers
and tests stay green (behaviour-preserving). This is also how you finally
exercise a `download()` seam that was built but left unused by any route — a
dangling downstream dependency is a real gap even when "the feature looks done".

Process note: when re-auditing a "looks already built" task, map each acceptance
criterion to **behaviour** in the real tree (auto-generated specs often cite a
different directory layout, e.g. `backend/app/...` vs `app/...`). Most ACs were
already met; the value was finding the **one** that wasn't (bytes never streamed)
rather than rebuilding the rest.
