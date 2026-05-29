# task 217909d2 — auto scan-on-open + live Google Drive read

**Status:** external (a configured scan root + live Drive OAuth); logic built.

**What's done in-repo:**
- Local scan + classify + metadata-only persistence (`POST /api/assets/scan`,
  `asset_scan_service`), movie filter (`GET /api/assets?asset_type=movie`).
- External-drive detection (`detect_external_drives`; psutil now in requirements,
  mount-walk fallback) + `GET /api/assets/external-drives`.
- Dynamic add/prune sync (`POST /api/assets/sync` → DataIngestionService.sync_source).
- Free-text search (`GET /api/local-files?q=`), asset↔task correlation
  (`/ai/correlate_needs`), Drive metadata listing (`google_drive_service.list_files`).

**What's deferred and why:**
- **Auto-scan on every app-open** needs a *configured default scan root* per
  device (the browser can't read the filesystem; a desktop agent would POST
  /api/assets/scan on launch). That's a per-device config/agent, not a code gap.
- **Reading the user's real Google Drive** (`list_files`) needs live OAuth
  `drive.file` credentials — only the owner can grant these; the function +
  endpoint accept an injectable client and work against a stub today.
- Physical-asset location from a book photo ("کتاب توی فلان کتابخونه") needs
  image-EXIF/OCR + a places lookup — image OCR is the same external piece as
  task 7367c6f0 Step 5.

**To wire when available:** ship a desktop/mobile agent that POSTs scans on a
schedule + on launch; complete the Drive OAuth flow and pass the real client to
`list_files`. The scan/sync/search/correlate pipeline already works end-to-end.
