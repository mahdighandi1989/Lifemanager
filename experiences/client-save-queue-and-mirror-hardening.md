---
title: "Client save queue + external mirror: poison records, failed loads, transient errors"
tags: ["sync", "offline-first", "google-drive", "google-sheets", "spa", "history", "robustness"]
topic_canonical: "client-save-queue-and-mirror-hardening"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-12T12:00:00Z"
created_at: "2026-10-12T12:00:00Z"
updated_at: "2026-10-12T12:00:00Z"
merged_from: []
---

# Client save queue + external mirror: the failure modes a happy-path test never sees

## 🎯 چالش / Challenge
A single-page app keeps its records in the browser and pushes changes to a backend (batched, debounced); the backend also mirrors
each record into an external store (one Drive folder + one spreadsheet per record). Everything passed its tests — and an adversarial
review still found: (1) one oversized/invalid record rejected the whole batch and the client retried that batch forever;
(2) a failed initial load let the app continue with EMPTY state, so seeding/default settings were written over the real data;
(3) a delete was resurrected by a save still in the queue; (4) any transient "get file" error was read as "file gone" → duplicate
folders; (5) "clear tab, then write" left blank sheets when the write failed; (6) the mirror silently dropped items beyond a cap and never
retried failures; (7) the API trusted "no token ⇒ shared default user", so anyone could read it.

## 💡 راه‌حل / Solution
1. **Per-record results.** The bulk endpoint validates each record (id pattern, size) and returns `{saved, rejected:[{id, reason}]}`;
   only a malformed request as a whole is a 4xx. Cap the request body before parsing.
2. **Client queue semantics:** send chunks (count + byte budget) one at a time; on success with `rejected` → tell the user once, drop them;
   on a 4xx the same request would hit again → drop with a message; on network/5xx/401/409/429 → put the records back (only if not
   superseded) and retry with exponential backoff. Deletes are their own queue, processed first; a delete removes the record from the
   save queue and a later save cancels a queued delete. Flush on `pagehide`/`visibilitychange`.
3. **No load, no app.** If the initial load fails, show the error with a retry and render nothing that can write. Also gate rendering
   until the load completes — deep links/URL effects can call render early.
4. **Remote existence check:** only an explicit 404 (or trashed) means "gone"; everything else raises and is recorded on the row.
5. **Write-then-trim:** write the new values first (pad ragged rows), then clear only the stale tail ranges; rename stale tabs instead
   of deleting them; compare tab names case-insensitively (Sheets does).
6. **Mirror queue fairness:** one run at a time (lock), rows that failed last time go to the back, stop the run on a quota error,
   remember a newly created remote file id before writing into it, move (not recreate) a record whose group changed.
7. **Auth:** for data endpoints of pages that are always behind login, require a valid token regardless of a global "auth optional" flag,
   and refuse accounts still pending approval.

## 🧪 نمونه کد (Anonymized)
```js
function pump() {
  if (busy || timer || !loaded) return;
  const batch = takeChunk(pending, { max: 100, bytes: 3e6 });
  if (!batch.length) return;
  busy = true;
  api.saveMany(batch).then(res => { busy = false; wait = 4000; report(res.rejected); pump(); },
    err => { busy = false;
      if (isPermanent4xx(err)) { report(err); pump(); return; }        // never resend forever
      batch.forEach(r => { if (!pending[r.id] && store[r.id] === r) pending[r.id] = r; });
      setTimeout(() => { timer = null; pump(); }, wait); timer = 1; wait = Math.min(wait * 2, 120000); });
}
```
```python
def meta(file_id):
    try:
        return drive.files().get(fileId=file_id, fields="id,name,parents,trashed").execute()
    except HttpError as e:
        if e.resp.status == 404:
            return None          # really gone → recreate
        raise                    # transient → record error, do NOT recreate
```

## ⚠️ نکات حیاتی / Pitfalls
- A "retry the whole batch on any error" loop is a poison-pill amplifier.
- Treat 401 as "keep and retry after re-login", never as "drop".
- A mirror that only ever sends the first N dirty items silently loses the rest — drain in chunks.
- Backfill on a fixed timer races a slow load; trigger it from the load-complete signal.
- Mock-based tests must include the error shapes (404 vs 5xx vs 429) or they prove nothing.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Bulk write endpoint returns per-item outcomes; body size capped; ids validated.
- [ ] Client queue: chunked, sequential, backoff, permanent-vs-transient classification, delete queue, unload flush.
- [ ] Failed initial load blocks all writes and renders a retry.
- [ ] External store: 404-only "gone", write-then-trim, lock, failed-last ordering, quota stop, move-on-regroup.
- [ ] Endpoint auth does not depend on a global "optional auth" flag when the UI is always logged in.
- [ ] An e2e that intercepts the load (fail + slow) and asserts zero writes.

## 🔗 References
- مرتبط: [soft-delete-tombstone-must-filter-every-read-path], [write-gate-next-to-optional-identity], [tests-that-cannot-fail-the-red-baseline]
