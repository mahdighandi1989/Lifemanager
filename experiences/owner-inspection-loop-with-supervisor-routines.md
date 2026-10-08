---
title: "An owner-to-AI inspection loop: sheets drawn on the live UI, answered by scheduled supervisor routines"
tags: ["oversight", "scheduled-agents", "routines", "ui-annotation", "review-loop", "prompt-versioning", "file-ingest"]
topic_canonical: "owner-inspection-loop-with-supervisor-routines"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-08T00:00:00Z"
created_at: "2026-10-08"
updated_at: "2026-10-08"
merged_from: []
---

# Owner inspection loop with supervisor routines

## 🎯 چالش / Challenge

The owner of a product sees things no test sees: a button in the wrong place, a
form that is missing a field, a page that "feels wrong". They want to point at
the exact spot, say what they want, attach samples (any file type, large), and
have an unattended AI agent — running on a schedule, in a fresh container every
time — do the work, answer under the same sheet, and prove it. Sibling projects
that built this first learned the failure modes the hard way:

- the agent wrote "done" under fifteen sheets and none were done (a green lie);
- it read the first request in a paragraph and ignored the rest;
- it put the thing "near" the place instead of the place the owner drew;
- it said a 40 MB sample was "too large to read";
- a routine that could not reach the server looked exactly like one that found
  an empty queue, for days;
- every fix is a deploy, and files kept on the container disk vanished with it;
- the routine's push to `main` was refused because the permission guard treats
  text inside repo files as data, not as the owner's word.

## 💡 راه‌حل / Solution

1. **The sheet carries the place, not just the page.** On pointer-up, record:
   route pattern + a reopen URL that includes the sub-page (`?tab=`), document
   coordinates + viewport + scroll + dpr, the visible text under the box, and an
   **anchor**: a CSS path to the element under the box that is verified by
   round-trip (`querySelector(path) === el`; walk stops at `id`/`data-testid`),
   with the box stored as **fractions of that element**. Fractions survive window
   resizes and layout shifts; document pixels do not. Render a cropped shot of
   the region and annotate the box on it.
2. **Status ≠ outcome.** Status = whose turn (open → answered → approved →
   filed), and drives the colour of an on-page highlight. Outcome = what really
   happened (`fixed | partial | needs-owner | not-done`). `partial`/`not-done`
   come back as debt next round. The colour is *derived* from the conversation,
   never stored.
3. **Guards live in the API, not in the prompt.** Only the owner approves,
   deletes, rushes, files new sheets. `fixed` without an after-shot → 422. A
   reviewer answer while any attached file is unread → 422 naming the file.
   "Read" is counted server-side as *contiguous* slices from offset 0 (skipping
   ahead does not count); a file without text (image, `.doc`, scan) counts as
   read only when its raw bytes were fetched by the reviewer.
4. **Text is extracted once, at upload,** with five distinct states (ok · empty
   · unsupported · failed · image) — never collapse "could not" into "nothing".
5. **Bytes go somewhere that survives a deploy:** cloud drive first, database
   chunk rows second (and the row says which and why). Never the container disk.
6. **Follow-ups are first-class:** a note under an open sheet can carry its own
   box and its own files (claimed by id, so they never mix with earlier ones), and
   owner input re-opens an answered sheet.
7. **An urgent lane**: the owner's rush button timestamps the sheet; a separate,
   frequent routine claims one sheet at a time in rush order with a TTL lease;
   any reviewer answer discharges it; an owner follow-up re-queues it in its
   *original* position; approval discharges it.
8. **The routines are dumb pointers.** The scheduled prompt is short and fixed:
   find the repo → fast-forward `main` → read `docs/supervisor/PROMPT.md` (or
   `URGENT_PROMPT.md`) and follow it. Behaviour lives in git with a version in
   frontmatter; the previous version is copied to `archive/PROMPT-v{N}-{date}.md`
   before every edit. The ONE thing duplicated into the routine message is the
   owner's push-to-main authorization.
9. **Exit codes are a contract** for the CLI the routine runs: 0 done/empty
   (stay silent), 3 could-not-read (never silent), 4 debt remains, 5 claimed.
10. **Measure the schedule.** Each routine knocks on the server when it runs;
    the page's "next round" countdown uses the configured cron only until real
    knocks exist, then the observed cadence (with "due" and "stale" states).
11. **Identity without a phantom user** (single-owner app): the reviewer is a
    header token = explicit env secret, else HMAC(existing app secret, fixed
    label). The routine reads the needed values from the hosting provider's API
    at run time; nothing is written to disk. A *wrong* token is a 401, never a
    silent fall-through to owner scope.

## 🧪 نمونه کد (Anonymized)

```python
# server: derived reviewer token — no new config needed, rotates with the app secret
def expected_token() -> str:
    explicit = os.getenv("REVIEWER_TOKEN", "").strip()
    if explicit:
        return explicit
    base = os.getenv("APP_SECRET", "").strip()
    if len(base) < 16:
        return ""          # not configured ⇒ reviewer disabled, never a weak default
    return hmac.new(base.encode(), b"myapp:reviewer:v1", hashlib.sha256).hexdigest()

# server: a reviewer answer is refused while a file is unread
debt = file_read_debt(files)          # contiguous read_chars < text_chars, or image never fetched
if is_reviewer and debt:
    raise HTTPException(422, f"«{debt[0]['filename']}» هنوز کامل خوانده نشده")
```

```text
# the routine's whole prompt (everything else is in the repo)
Repo: owner/app. Unattended run — never ask, never wait.
Owner's standing authorization: commit and push straight to main once the gate is green; never force-push;
if main refuses, push to reviewer-pending/<label>.
Step 0: find the repo on disk (or report that the routine has no repo attached).
Step 1: git fetch origin main && git checkout main && git merge --ff-only origin/main
Step 2: read docs/supervisor/URGENT_PROMPT.md and follow it exactly. Empty queue ⇒ say nothing.
```

## ⚠️ نکات حیاتی / Pitfalls

- A routine created through an API tool may have **no repository attached**; the
  owner must attach it in the routines UI. Make step 0 of the prompt detect this
  and say so, instead of failing silently or cloning somewhere odd.
- The permission guard in an autonomous run does not accept "the owner allowed
  pushes" when that sentence lives in a repo file — put it in the routine message.
- A crawler behind a login redirect measures the login page N times; assert the
  page you reached is the page you asked for (see
  `headless-crawl-must-verify-it-reached-the-page`).
- A highlight portal over the page must be `pointer-events: none` and hit-test on
  mousemove for tooltips, or it blocks the very UI the owner is inspecting.
- Persian/Unicode filenames in `Content-Disposition` need RFC 5987
  (`filename*=UTF-8''…`) or every download 500s.
- A "fixed" outcome without an after-shot must render as partial, not green —
  enforce it in the display function too, not only at write time.
- A full-page screenshot is not "the place"; the after-shot must show the anchor
  element (screenshot by selector with padding).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Add an overlay that turns a drag into {route, reopen URL incl. sub-page,
   doc rect, viewport, dpr, verified anchor path, fractions, covered text, shot}.
2. Store sheets with status + notes (each note: author side, text, optional
   spot, outcome, shots, commits, dependency walk) + files + binders.
3. Enforce the reviewer rules server-side (approve/delete/rush owner-only,
   fixed-needs-after, read-debt 422, wrong token 401).
4. Extract file text at upload with explicit states; store bytes durably.
5. Ship a stdlib-only CLI for the routine with a strict exit-code contract and
   a "where" block that prints anchor + fractions for the sheet AND each follow-up.
6. Put the instructions in `docs/supervisor/*.md` with version frontmatter and
   an `archive/` folder; create two routines (full, urgent) whose prompts only
   point at those files and carry the push authorization.
7. Generate the surface inventory (pages, sub-pages, controls, routes) from
   source on every run and alarm on drops; measure element coordinates with the
   same selector algorithm the overlay uses.

## 🔗 References
- Ported from two sibling projects' supervisor systems (their `docs/supervisor/`,
  `scripts/supervisor/inspection.py`, inspection routers, and run logs).
- Related: `headless-crawl-must-verify-it-reached-the-page`,
  `live-architecture-diagram-from-runtime-introspection`,
  `silent-capture-channel-needs-a-liveness-surface`, `tests-that-cannot-fail-the-red-baseline`.

## Update 2026-10-08 — the bytes belong in the owner's cloud folder, not the database

Point 5 above ("cloud drive first, database second") was not enough on its own:
pictures were always kept in the database, and anything that fell back to the
database stayed there forever. The finished shape: one folder per sheet
(`<AppRoot>/inspection/report-NNNN/` + `shots/`), every upload checksum-verified,
the database holding only the reference and the extracted text, and an
`offload()` step that every supervisor round runs to move what had to wait. The
board shows where the files are (folder link) and how much is still waiting.
See `google-drive-oauth-offline-integration` (Update 2026-10-08) for the Drive
side.
