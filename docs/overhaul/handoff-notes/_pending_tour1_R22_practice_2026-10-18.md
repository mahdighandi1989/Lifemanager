# Tour 1 (Pólya), round 22: practice + lists handoff (2026-10-18)

Scope (DECISIONS_R22 «Fixers / practice+lists»): P6 (practice), P7 (running lists lifecycle), and the P8 items that touch practice, lists or Today.
Base: `integ-age` (e3fcb898). Only `apps/learning-architecture/src/app/a41_practice.js` changed in the app. a29 and a33 are untouched: a41 wraps their outputs.
Docs: WORKLOG (93), PROGRESS 108, HANDBOOK §4 (practice bullet), §10 row, §12 row 56. These numbers assume siblings 90–92 / 105–107 / §12 53–55 are merged first.

## Contracts for the other fixers
- **Calibration sessions (all):** `PR.save` runs `PR.calibBook(c)` on T24-shaped cases. Every linked 🎯 with outcome «شد»/«نشد» books the session of its judgement day.
  The day is `judgedBy.d` if present, else the local day of `outcomeAt`. The session carries `meas {fcs:[ids], n, fc, p, ok, out}`.
  A session made only from judgements has `calibAuto: true`. It is removed when its judgements are withdrawn. Chat/page sessions are never removed.
  **For correction (a38):** when a correction sets a judged 🎯 aside, clear `outcome` and `S.put` the fcast. The case session follows by itself.
  `PR.events` skips sessions with `meas.fc` from the assistant or `calibAuto`. Their 🎯 event is the single line.
- **practice_log on T24:** the page now picks the 🎯 by her numbers. The percent she says must equal `fc.p`, and other numbers in her words must appear in the prediction text.
  Helpers: `PR.fcMatch(L, said, pc)`, `PR.fcNarrow`, `PR.numsOf`. Several candidates still match ⇒ «کدام؟» with each text and percent.
  A 🎯 that is already judged and matches her report gives back the same record. No second 🎯 is created.
- **Plans (a27):** `PR.planCands` has a new kind `"prc"`. A linked plan has `q.prc = caseId`, and the case keeps `c.plans[]`.
  The «📌» Today line is hidden while the case has a Today line. When the plan date passes and the case has a session between `q.d` and `q.when`, the plan is closed «done» through `AS.planTap`.
  a27's own `planSync` ignores `q.prc`, so the chat may still ask «انجام شد؟». **turnq** may read `q.prc` there.
- **Running lists (all):** each item has `pid` (live problem) or `chatProb`, plus `sess`, `quote`, `at`, `prc`, and `ex`.
  - `closed {d, at, how, kind: resolved|refuted|closed}`. Ambiguity hypotheses are `hyps [{id, t, p, hist}]`.
  - Model uses carry `link {k:"live", id}`, `sess`, `quote`.
  - Helpers: `PR.itemsOf(pid, {sess})`, `PR.itemEvents(c, x, pid)`, `PR.hypSet`, `PR.loadSet`, `PR.itemClose(name, k, how, o, kind)`, `PR.itemReopen`, `PR.paretoSum`.
  - `PR.claimResult(k, result, verdict, o, recheck)`.
  - `PR.events(subj)` now also returns list events: kinds `list:add|close|reopen|load|p|verdict|conf|hyp|share|use`, with `prc = "<listId>:<itemId>"` and `src {kind:"list", id, item, sess}`.
  - The a40 session dossier picks these up through `src.sess`. The problem dossier only gets items of that problem and uses booked on it.
- **Assistant actions (a26/a27 routing):**
  - `list_add {list, text, quote, consent{quote, kind}, p?, share?, load?, hyps?, recheck?, use?, pid?}`. It needs consent, checked by the same `PR.consentOk`. Numbers and re-check dates come only from her message.
  - `list_update {list, item, quote, how?|hyp+p?|p?|load?|share?|verdict(+recheck)?|recheck?}`.
  - Both return «✓ …» (an info line) or a refusal reason.
  - The prompt block starts with `# فهرست‌های جاری`. It is not a coaching head and not under `# پرونده‌های تمرینِ باز`, so routing is unaffected. It holds no «؟» directive.
- **List-shaped cases (T15, T16, T34, T35, T3, T10):** a session is also a review of its list (`c.links.list`, `list.cases`).
  The periodic review entry of a list linked to a case with her own rhythm has `dupOf: "practice:<caseId>"`.
  A list-shaped worksheet of a case keeps `ex.prc = case`, and its items get `prc` and `pid` from the case.
- **Rhythm:** `PR.rhythmIn` reads «دو هفته یه بار» and «یه ماه دیگه» / «سه روز بعد» (30 days per month, the existing unit). «هر روز نه» returns null.
  `PR.eval` labels a session after her own rhythm's due date as `late`, with the number of days (`uEvery`).
- **Fit warning:** `knotCrit` sets `R.misfit` / `c.misfit` when the subject is not a knot/kcase and no session has `meas.correct`. It shows on the case page, in the prompt case line («زمینه:») and in the `start_practice` result.
- **Today:** a41 wraps `A.dueList` and adds «⏰ «…» — موعدش (…) گذشت؛ تحویل دادی؟» for open deadlines with `date < today`.
  The two acts are «بله، تحویل دادم» (`AS.DO.deadline_done({what: id})`) and «هنوز نه» (`askSnooze` = tomorrow). a33's future-deadline lines are unchanged.
- **Mind card (prereq, a29):** a41 wraps `A.MIND.techWork` and appends one row per running list with dated items (`key "list:<listId>"`, `src "list"`, unmapped).
  A refuted close is `ok:false`; everything else is `ok:null`.
- **View label:** `A.VIEW_META.practice.fa = "🧪 پرونده‌های تمرینِ باز"`.

## Bank VARIANTS_R22 — tests/test_tour1_r22_practice.js
- **P6** (#136–#153): 18/18.
- **P7** (#154–#171): 18/18.
- **P8**, this share: #173, #178, #182.
- **Runner sentences, all green:** A22-10 s05/s07, A22-15 s07, B·D22 s19, B·D18 s14, D·s31, D·s32, D·s34, D·s35, A22-28 s09, C22-16, and the withdrawal of an auto session.
- **Red on the base build:** 22 bank entries plus section exceptions.

## Not done / other owners
- **P8 entries in other files:**
  - #172 and #185: chat guess outcome (a27).
  - #174: invented look-back problem record (a27 `chat_invent` / a38).
  - #175 and #188: «خفته تا» (a38/a40).
  - #176 and #186: title (a38).
  - #177 and #183: ZWNJ (a27/a38).
  - #179 and #187: «نتیجه سالم ماند» (a29/a38).
  - #180: inline plot after reload (a39/a38).
  - #181: C145 (a27).
  - #184: duplicate ✏️ (a40).
- **C22-3 / B·D11:** the look-back offer line «می‌خواهی تمرینش کنیم؟» in `PR.promptBlock` is still a question inside the block. That is P4 (turn question). It was left to turnq to avoid a conflicting edit.
