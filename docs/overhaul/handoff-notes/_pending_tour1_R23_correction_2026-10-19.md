# Tour 1 (Pólya), round 23: fixer «correction» (Q4) — handoff (2026-10-19)

Scope: Q4 of `DECISIONS_R23.md` («CORRECTIONS»). Files: `apps/learning-architecture/src/app/a38_live.js` (retract, copies, set-asides), `a27_tour.js` (retract side only:
`retractCheck`, `retractApply`, `refutedTarget23`, `fixQ22`, `askUser20`, `chLine20`/`winDiff23`, the «شاید اصلاح» prompt block), `a40_dossier.js` (✏️ hand-off to the coach).
Test: `apps/learning-architecture/tests/test_tour1_r23_correction.js` (+ `tour1_r23_correction_bank.js`), bank copy `apps/learning-architecture/tests/variants/VARIANTS_R23.json`.
Docs: WORKLOG (97), PROGRESS 112, HANDBOOK §2 bullet + §10 row + §12 row 57, AUDIT_LOG, REMOVAL_CANDIDATES, experience update.

## Contract 1 — copy candidates (for story/today fixers)

- `APP.liveNumCopy(text, D, oldClause, oldSentence)`: the 4th argument (the whole sentence of her corrected message, `APP.liveFragSent(text, D)`) gives list units and neighbours.
  Matching is by value *and role* (`APP.liveOccX(text)` exposes `{v, u, range, mask, cn (counted noun), L, R, w, n}` per number). Old units are never borrowed from the new value.
- New candidate paths: `g.guess` (live guess), and session-level `sess.pinned` and `cg:<guessId>` with `pid: ""` (`APP.liveSessCopies(sid, {src, frag, fix, old, cur, mid, rests, key})`).
  `APP.liveCopyAnswer` handles them; a «بله» on `cg:` sets the guess outcome aside (`resRecheck`).
- A «بله» on `stmt` makes the title follow (unless she edited the title, `src.tEdited`).
- Her typed step outcome (`out.from === "page"`) is never rewritten silently — only `chatRep` follows; the copy is asked (`out:<id>`).

## Contract 2 — results and guesses that rest on the old datum

- A coach result event (`how: "res"`) of the same chat problem whose span names the old value gets `e.stale = {old, new, why}` and a `changed` item «نتیجهٔ «…»» — it is
  never rewritten. `guessVerdicts22` ignores stale results. **Today/dossier fixer:** show `stale` results as «کنار رفت — با مقدارِ درست دوباره حساب شود», not as successes.
- A coach guess judged by a result (`resBy`/`resFrom`/`resKey`) with a number in its text follows a statement datum change (`resRecheck`); with `rests` only if `guess` is named.
- A refuted guess/result (coach `res: "refuted"`, live `APP.liveGuessRefuted`) is never the target of a retract: `retractCheck` refuses with a plain reason
  («آزمود و رد شد»). **Turn-question/classification fixer (ageclass):** this refusal is not a correction event and needs no re-check question.

## Contract 3 — set-asides without `rests`

- `stampUses` now records statement clauses (`stmt:<i>`) instead of the whole statement; evidence that is itself general (برای هر n، استقرا، کلی) and names no datum has no
  fallback; the fallback is the declared data (dl, c, measure), the statement only when nothing is declared. `APP.liveVerdictUses(pid, D, rests)` is the one test; the coach's
  closed-problem verdict set-aside uses it.

## Contract 4 — chat answers to a copy ask

- `APP.liveCopyChat(sid, text)` runs before the prompt is built (wrap on `AS.prompt`): a message naming the field («دادهٔ ۲») or saying «عوض کن/اصلاح کن» with one ask open applies
  it (or «همون بمونه/عوض نکن» declines). A bare «بله» does nothing. The result block of the same prompt already shows the change.

## Contract 5 — ✏️

- `AS.retractApply(s, {msg, fix, what, mid})`: pass `mid` (the edited message id); `retractCheck` then takes that message as the source. Anyone else calling `retractApply` with a
  short fragment should pass `mid` too.

## Contract 6 — bank #83 (Q4 half, after merging story e39f270e)

- An after-turn hook (registered after all modules load, so it runs after the story hook) compares each story plan item (`s.coach.story["L:"+pid].items`, k `plan`) with her typed
  plan (`L.plan` typed/edited, else `L.planDraft` when it is not a chat fill): the same step with another number («تقسیم بر ۰٫۱۶» ‖ «تقسیم بر ۰٫۲») ⇒ copy ask on `plan`/`planDraft`
  (`APP.liveStoryNum(typed, chat)`); her copy is never overwritten. Items are marked `cp23` once checked.

## Bank results (VARIANTS_R23, Q4.corrections, 38 entries)

- 38/38 pass. On the base build (574f4a30), 18 of 38 fail; all 18 runner sentences fail there too.
- #112: the pinned goal is asked and updated after «بله»; a Today goal line that follows it was not verified (HANDBOOK §12 row 57 b).

## Not done (with reason)

- Copies *computed* from the datum that do not name the old value («۹۸ خانه», «(۵۰ و ۴۸)» after «۸×۸», B·D3 s11): the page cannot see the dependence without a model report;
  §12 row 57 (a).
- Mind-card step successes by basis: a29 (row 54, unchanged).
- The PROGRESS/WORKLOG numbers (112/97) are continuous only after the sibling fixers' 109–111 / 94–96 are merged.
