# File processing — scope and limits

Audit task **217909d2** captured a voice idea: the app should index the
user's files (laptop, mobile, Google Drive, external drives) so AI
recommendations can reference owned assets. This document records what
the web tier can and can't do, and what surfaces actually ship today.

## What a browser-served web app can not do

A web app running in a browser (or this FastAPI backend served at the
same origin) **cannot enumerate a user's local filesystem** — there is
no API in any modern browser that exposes "list every file on disk".
The closest primitives are:

* `<input type="file">` — a user picks specific files and the page
  receives those bytes (or, with `webkitdirectory`, a whole folder).
* The File System Access API — same: user picks a directory, the page
  gets a handle, and even then the page can't reach anywhere else on
  disk.

Anything resembling "scan the whole laptop every time the app opens"
requires a separate **desktop agent** (Electron, Tauri, a native CLI)
that the user installs and that the web tier talks to over a local
socket or push API. That agent is out of scope for the web app.

## What ships today

* `POST /api/local-files` — accepts file metadata + already-extracted
  text (the desktop agent or the user's manual upload provides both).
  The handler asks the NLP service for a summary + keyword list and
  stores them next to the metadata.
* `GET /api/local-files` — lists the entries indexed for the caller.
* `POST /api/lists/sync-from-file` — accepts an uploaded JSON file of
  shape `{"name": "...", "items": [{"content": "..."}]}` and
  idempotently syncs that list into the user's todo system. Items
  present in the DB but absent from the file are removed.

## Google Drive

The Google OAuth router (`app/routes/auth_google.py`) is mounted only
when `GOOGLE_CLIENT_ID` is configured (audit task 3b90d409). When a
real Drive metadata endpoint lands, it will reuse the same OAuth
machinery + a `FEATURE_GOOGLE_DRIVE_ENABLED` flag, and will store
metadata only — never the full file body.
