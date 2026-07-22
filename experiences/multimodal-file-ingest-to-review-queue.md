---
title: "Multimodal file ingest → review queue (attachments/Drive → vision extract → approve → create-or-update)"
tags: ["ai", "vision", "ingest", "review-queue", "credential-vault", "idempotency", "oauth-scope"]
topic_canonical: "multimodal-file-ingest-to-review-queue"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-22T00:00:00Z"
created_at: "2026-07-22T00:00:00Z"
updated_at: "2026-07-22T00:00:00Z"
merged_from: []
---

# Multimodal file ingest → review queue

## 🎯 چالش / Challenge

A user wants the system to *read every file that flows through their accounts*
— email attachments (bank/broker statements, ID scans, receipts) and cloud-drive
documents — and automatically record the extracted facts in the right place,
updating each time, creating the destination if it doesn't exist. Constraints
that make this hard:

- Files are **heterogeneous** (PDF, image, scan) and **unstructured** — the
  meaningful data is *inside* the document, not in any metadata field.
- Some files are **password-protected**; the system must ask the owner once,
  store the secret safely, and open every future file from that source.
- Writing anything **blindly** is dangerous (a mis-parsed "work-life balance"
  newsletter must never overwrite a real account balance).
- The same file must never be **double-recorded** across re-syncs / backfills.
- Access to the whole cloud drive may require a **broader OAuth scope** than the
  least-privilege one the app started with.

## 💡 راه‌حل / Solution

One pipeline, many feeders, a human gate in the middle:

```
feeders ─┐
 email   ├─▶ extract_from_file(bytes, mimetype, source_ref)
 drive   │        │  (vision model reads the file → {kind,title,fields})
 upload ─┘        ▼
            InboxItem (suggested_type + suggestion JSON)   ← REVIEW QUEUE
                 │  owner taps «approve»
                 ▼
            filer[kind](db, fields)  → create-OR-update the real entity
```

1. **One extractor, source-agnostic.** `extract_from_file(*, filename,
   mimetype, data, source_ref, password=None)` is the whole brain. Every feeder
   (email attachment, drive file, manual upload) just produces `bytes + a stable
   source_ref` and calls it. Adding a feeder never touches the extractor.
2. **Vision model does the reading — no OCR plumbing.** Hand the raw bytes to a
   multimodal `complete(prompt, files=[{filename,mimetype,data}])` call with a
   strict "return ONLY this JSON" prompt (`kind`, `title`, `summary`, `fields`).
   Parse defensively (strip ``` fences, regex the outer `{...}`).
3. **Nothing written blindly.** The extractor never writes the destination — it
   drops a **review candidate** (`suggested_type` + `suggestion` JSON) into a
   universal inbox. Approval is one tap and is what actually calls the filer.
4. **Filers create-OR-update.** Each `suggested_type` maps to a filer that
   matches an existing row (e.g. by name, case-insensitive) and refreshes it, or
   creates it if absent — so "record it and update each time, create the section
   if it doesn't exist" is a single idempotent operation.
5. **Credential vault + ask-once flow.** `prepare_bytes` returns
   `(ready, needs_password)`; an encrypted file with no known password produces a
   `password_request` candidate (+ a push notification). The owner submits the
   password once → it's stored **encrypted, keyed by source domain** → the file
   re-opens and every future file from that source opens automatically.
6. **Idempotent twice over.** Dedup on `source_ref` across **all** inbox statuses
   (pending *and* filed *and* dismissed) so a re-scan never re-proposes a file
   the owner already handled; a durable "seen ids" stamp additionally avoids
   re-**downloading** unchanged cloud files (network cost).
7. **Fail-open, always.** Extractor/feeders never raise into the sync loop; an
   *unreadable* file still surfaces as a raw "review manually" candidate so
   nothing is silently dropped.
8. **Broader scope, additively.** Reading the *whole* drive needs a wider OAuth
   scope than a least-privilege `drive.file`. Add `drive.readonly` to the
   *connect* scope set only — existing tokens keep working with their current
   grant; the new scope takes effect on the next reconsent. Never silently
   downgrade or break the old path.

## 🧪 نمونه کد (Anonymized)

```python
# --- one extractor, every feeder calls it ---
async def extract_from_file(db, *, filename, mimetype, data, source_ref,
                            user_id=0, password=None):
    if await _already_ingested(db, source_ref):        # dedup: ALL statuses
        return {"status": "duplicate"}
    ready, needs_pw = prepare_bytes(data, mimetype, password=password)
    if needs_pw:
        return {"status": "needs_password", "source_ref": source_ref}
    res = await complete_multimodal(db, EXTRACT_PROMPT,
        [{"filename": filename, "mimetype": mimetype, "data": ready}],
        task="document_extraction")
    parsed = _parse_json(res.get("text")) if res.get("ok") else None
    if not parsed:                                      # fail-open: never drop
        await _propose(db, suggested_type="note", title=filename,
                       summary="couldn't auto-read — review manually",
                       source_ref=source_ref, ...)
        return {"status": "unreadable"}
    await _propose(db, suggested_type=KIND_MAP.get(parsed["kind"], "note"),
                   fields=parsed.get("fields") or {}, source_ref=source_ref, ...)
    return {"status": "proposed"}

# --- filer: create OR update, never a blind insert ---
async def _file_as_account(db, s, user_id):
    existing = (await db.execute(select(Account).where(
        scope_filter(Account.user_id, user_id),
        func.lower(Account.name) == s["provider"].lower()))).scalars().first()
    if existing:
        if (bal := _to_decimal(s.get("balance"))) is not None:
            existing.balance = bal                      # UPDATE
        acct = existing
    else:
        acct = Account(user_id=user_id, name=s["provider"], ...)  # CREATE
        db.add(acct)
    await db.flush()
    return {"kind": "account", "id": acct.id}

# --- encrypted-PDF gate ---
def prepare_bytes(data, mimetype, *, password=None):
    if not _is_pdf(data, mimetype):
        return data, False
    reader = PdfReader(io.BytesIO(data))
    if not reader.is_encrypted:
        return data, False
    if not password or reader.decrypt(password) == 0:   # 0 ⇒ wrong password
        return None, True
    writer = PdfWriter(); [writer.add_page(p) for p in reader.pages]
    buf = io.BytesIO(); writer.write(buf)
    return buf.getvalue(), False                        # re-serialise decrypted

# --- credential vault: encrypt at rest, key by source domain ---
async def store_password(db, *, source_key, password):
    await upsert_setting(db, f"ingest_cred:{source_key}", encrypt_data(password))
```

## ⚠️ نکات حیاتی / Pitfalls

- **Dedup on pending only ⇒ duplicates.** If you dedup a re-scan against only
  *pending* candidates, a file the owner already filed or dismissed gets
  re-proposed forever. Dedup on the `source_ref` across **every** status.
- **Native cloud formats can't be `get_media`'d.** Google-native docs/sheets need
  an *export*, not a download — filter them out (or export) rather than shipping
  raw bytes the vision model can't read.
- **A green build hides a NameError in a rarely-imported route.** A missing
  `Body` import in one endpoint only blows up at import time of that router;
  `import app.main` in CI catches it — run it.
- **`decrypt()` returns 0 for a wrong password, it doesn't raise.** Treat
  `== 0` as needs_password, not success.
- **Scope widening is a real decision.** `drive.readonly` reads the user's whole
  drive — only add it because the owner explicitly asked, add it *additively* to
  the connect scopes, and document it. Existing sessions must not break.
- **Backfill must be idempotent + bounded.** Each backfilled file may hit the
  network; cap the batch and rely on `source_ref` dedup so re-runs are safe.
- **Money parsing is locale-hostile.** Statements arrive as `AED 1,250.50` or
  localized digits/separators — normalize non-ASCII digits and thousands marks
  before `Decimal`.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Pick a **stable `source_ref`** scheme per feeder (`email:{msg}:{name}`,
   `drive:{id}`, `upload:{sha}`) — it's the idempotency key for the whole system.
2. Write **one** `extract_from_file(bytes, mimetype, source_ref, password=None)`
   and make every feeder produce bytes + a source_ref. Never branch the extractor
   per source.
3. Route output through a **review queue** (a generic capture-inbox row with a
   `suggested_type` + a `suggestion` payload). Approval — not extraction — writes
   the destination.
4. Make each filer **match-or-create**: look up the target by a natural key,
   update it if found, insert if not; return `{kind, id}`.
5. For locked files, return a `needs_password` status → surface an ask-once
   request → store the answer **encrypted, keyed by source** → retry + reuse.
6. Dedup across **all** queue statuses; add a durable "seen" stamp to skip
   re-fetching unchanged remote files.
7. Keep the whole path **fail-open** (unreadable ⇒ raw candidate, never a lost
   file) and behaviour-preserving when you widen an **OAuth scope** (add to the
   connect set only; old tokens keep working until reconsent).

## 🔗 References
- مرتبط: `universal-capture-inbox-with-ai-triage` (the review-queue substrate this
  feeds), `google-drive-oauth-offline-integration` (the injection-ready Drive
  client seam this consumes), `soft-delete-tombstone-must-filter-every-read-path`
  (why dedup must consider non-pending rows).

## Update 2026-07-22 — bridge extracted data into the domain's AGGREGATION table, not a dead-end

A receipt-analysis feature exposed a gap the review-queue pattern can hide:
extraction captured the amount+date of every receipt, but approving one only
created an inbox note/document — it never became a row in the finance ledger, so
"analyze my spending" had nothing to aggregate. The lesson:

- **The filer must write the table the ANALYTICS read, not just any table.** If
  the value of ingestion is aggregation (spend trends, calories, hours), the
  approve-filer has to insert into the *aggregation* model (a `Transaction`),
  not a generic capture row. Map the AI `kind` (`receipt`/`invoice`) to that
  destination and add it to your INBOX_TARGETS + filer dispatch.
- **Extracted rows carry their OWN date + unit.** A receipt has its own
  `occurred_on` and `currency`, independent of any parent account — add those
  columns (idempotent startup ALTER + migration; `create_all` won't alter an
  existing table) or backdated/foreign-currency items mis-bucket.
- **Idempotency key = source_ref on the aggregation row too.** Dedup the ledger
  insert on the document's source_ref so a re-approval or re-scan never
  double-posts.
- **One report path, two callers.** Extract the aggregation into a service
  (`build_report`) shared by the HTTP route and the periodic job, so the number
  the user sees on screen and the number the notification sends can never drift.
- **Periodic notifications dedup on a CHANGE signature.** A daily analysis job
  must store a signature of the last-notified totals and stay silent until they
  change — otherwise it re-sends the same figures every run (the noise trap
  again).
