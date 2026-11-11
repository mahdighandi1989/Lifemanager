# Tour 1 (Pólya), round 25: fixer «correction» (P4 + C11) — handoff (2026-11-11)

Scope: P4 of `DECISIONS_R25.md` («STALE-NUMBER MECHANISM») and clarification C11. Files: `apps/learning-architecture/src/app/a38_live.js`, `a27_tour.js` (three small spots).
Tests: `apps/learning-architecture/tests/test_tour1_r25_correction.js` + `tour1_r25_correction_bank.js`; bank copy `tests/variants/VARIANTS_R25.json` (the whole bank —
**other fixers: do not re-add it, just use it**). Docs: WORKLOG 121, PROGRESS 120, HANDBOOK §10 row (2026-11-11) + §12 row 67, AUDIT_LOG, REMOVAL_CANDIDATES,
experience `model-reports-state-page-validates` (Update 2026-11-11).

## Functions changed (exact)
- `a38_live.js`: `staleRecs` (now `(pid, sid)`, records carry `zone`; chat results `res:*` and prior-ledger steps `prior:<n>` are read), `staleScan` (now calls the new
  core; the round-24 body is `staleScan24` = `APP.LIVE_R24_QUARANTINE_P4.staleScan`), `staleMark`, `A.liveStale`, `staleCard`, `setAsideDeps` (only the `declCh` line for
  the sufficiency verdict). New: `sents25`, `ann25`, `runs25`, `dec25`, `eqR25`, `outV25`, `famU25`, `fam25`, `ucompat25`, `pairs25`, `annText25`, `staleCore25`,
  `cls25`, `fmtRe25`, `A.liveStaleCore`, `A.liveAnn25`, `A.liveRestsOn`. Nothing else in a38 was touched (stage/`storyPh` is the story fixer's).
- `a27_tour.js`: one more alternative on `CORR19b` (cue «X ندارم/نیستیم، <عدد>»); inside `retractApply` one guard after `byRes` and one after `num24`; new helper
  `herTexts25` just above `retractRun20`. Nothing else.

## Contract 1 — `APP.liveStale(pid)` (today / dossier / story / prior)
- Items: `{k, lab, raw, v, re|null, ask, rel, ctx, from:{o,n}, at}`. `re != null` ⇒ the page's own recomputation (show it as a question «… درست است؟»); `re == null`
  (`ask: true`) ⇒ the page only asks «این عدد از «…» حساب شده بود؟» — **never invent or display a value for an `ask` item** (C11).
- `k` may now also be `res:<sess>:<at>` (a recorded chat result) or `prior:<n>` (a step of the prior-work ledger). List consumers must not assume a form field.
- A number is stale only with result-position evidence and an identified relation; unmarked data of the statement / understanding form are never stale. If you add a new
  record type that holds her computed numbers, add it to `staleRecs` with the right `zone` (`given` | `work` | `role` | `t1`) — do not re-derive elsewhere.
- `APP.liveStaleCore(records, D)` runs the same engine on any ordered list `[{k, lab, t, zone}]` (D = `{o, n}` or the retract diff) — use it for chat-only stories.

## Contract 2 — prior-work ledger (fixer «prior», P1; bank #146)
- When a correction makes a ledger step's number stale, a38 sets `step.stale25 = {at, from, to, nums: [{v, re|null, ask}]}` on `L.prior.steps[i]` (the verdict is not
  touched; the step text read is `fixed.t` if present, else `quote`). The «🕰 کهنه پس از اصلاح» card already lists it as «گامِ n ِ کارِ پیشین».
- **Still to do in a45 (yours):** show it on the ledger row and in `priorLines` («کهنه پس از اصلاح — دوباره بسنج (۲۴۰۰ ⇒ ۲۷۰۰)»), stop presenting the step as a plain ✓,
  move the resume point, clear `stale25` when her fix is applied, and mirror it on the chat story ledger (`E.prior`, no live problem) with `APP.liveStaleCore`.
  The bank check #146 in `tour1_r25_correction_bank.js` asserts only the a38 part (flag + card); extend it there or in your own test when the row text exists.

## Contract 3 — «does it rest on the corrected value?» (prior / story / today)
- `APP.liveRestsOn(span, D, {src, ctx})` ⇒ `"yes" | "no" | "unknown"`. `no` = the corrected value is a clock time/date/label, or her own written computation of the
  span's number does not contain it, or the kinds (unit, else the noun after the number) differ. Callers keep their old presumption only for `unknown`.
  Used by the coach for chat results (`num24`) and chat guesses (`byRes`) when the model gave no `rests`; a model `rests` still wins.
- The sufficiency verdict is set aside only by a datum that her numeric mathematization (`u.prac.measure`) names, when one exists.

## Not done / open (HANDBOOK §12 row 67)
- Ledger row rendering (above). Multi-operation or rounded relations are asked, not computed. A measured report whose kind equals the corrected value's kind is still
  presumed stale without a model `rests`. A fraction as a result («= ۳/۴») is treated as operands and not marked.
