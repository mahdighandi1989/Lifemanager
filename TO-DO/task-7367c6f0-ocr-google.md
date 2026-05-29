# task 7367c6f0 — real OCR/ASR + live Google Drive/Sheets

**Status:** external (paid OCR/ASR + Google OAuth); the pipeline is wired in-repo.

**What's done in-repo:**
- DriveFile model (storage_location/last_accessed_at), folder layout, upload
  (`POST /api/drive/upload`) with up-front text extraction.
- Cold-tiering (30-day) `cold_tiering_service.tier_cold_files`, now invoked by the
  daily `tier_cold_data` Celery task (migrates DriveFiles, not just tallies tasks).
- Central-sheet ledger seam (`sheets_service.record_index_entry`) wired into
  upload; `append_index_row` works against an injected Sheets client.
- `GET /api/files/{id}/raw` (text for local, link for Drive); `?q=` search over
  filename + extracted_text; `google_drive_service.upload_file/list_files/download_file`.

**What's deferred and why:**
- **Real ASR/OCR:** `transcription_service.extract_text` returns a provisional
  "[transcript pending ASR]" / "[caption pending OCR]" placeholder. A real
  backend (Whisper/Tesseract/Cloud Vision/Speech) is a paid/heavy dependency —
  the seam is pluggable (swap the body of `extract_text`).
- **Live Google Drive/Sheets:** `google_drive_service` + `sheets_service` raise
  NotImplementedError without an injected client and no-op without a refresh
  token; they need an operator OAuth flow (`drive.file` + Sheets scopes) only the
  owner can grant. `GOOGLE_SHEETS_REFRESH_TOKEN` gates the ledger write.
- Elasticsearch (Steps 15-16) + GCS Nearline/Coldline archival (Step 14): separate
  external infra; SQLite-substring search + Drive tiering cover the in-repo path.

**To wire when available:** implement the google-api-python-client adapter (deps
already pinned), complete OAuth, set the refresh-token env, and plug a real
ASR/OCR provider into `extract_text`.
