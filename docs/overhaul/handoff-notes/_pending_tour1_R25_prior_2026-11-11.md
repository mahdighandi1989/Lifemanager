# Tour 1 (Pólya), round 25: fixer «prior» handoff (2026-11-11)

Scope (DECISIONS_R25 «Fixer split / prior»): P1 — prior-work ledger contract (roadmap §21) + clarifications C5–C8. Base: `eeb11d1f`.
FIX25 assigns WORKLOG 123 / PROGRESS 122. **On this branch the entries carry 121 / 120** (the next free numbers on BASE25): `build.py` and the docs gate refuse
gaps, so a branch with 123/122 and no 121–122 can neither build nor pass. **Coordinator: renumber to 123 / 122 when merging after «correction» and «story»**
(WORKLOG heading, PROGRESS row number and its `WORKLOG (n)` cell, the AUDIT_LOG line). HANDBOOK §10 row (2026-11-11) + §12 row 67 (renumber too if a sibling took 67).

Tests: new `tests/test_tour1_r25_prior.js` (runner sentences + all 49 P1 entries), byte copy `tests/variants/VARIANTS_R25.json`. No older assertion was changed.

## Functions I changed or added (keep your edits out of these, or tell the coordinator)
`a45_story.js`
- replaced: `priorOf`, `priorReply`, `priorLines`, `priorQ`, `ST.priorTurnQ`, the prior part of the prompt hook (`AS.promptHooks.push` in the «کارِ پیشینِ تو» section), `paintPrior`.
- new: `relink`, `priorMerge`, `readReply` (`ST.priorRead`), `applyFix`, `tryFix`, `pageFix`, `calcs`, `subNum`, `subFrag`, `resNums`, `unitAfter`, `stepLine`, `ledger`,
  `markWait`, `priorOpenAt`, `priorAsk`, `ST.priorTurn`, `priorTurn25`, `recallWork25`, `chatItems`, `ST.chatSolvedReady/Close`, `paintChatSolved`, a second `A.render`
  wrapper (`_r25prior`) and a second prompt hook («# بستنِ مسئله‌ای که در گفت‌وگو حل شد»).
- touched inside `onState` (story's function) — four small spots only: the `RECALL22` early return (now `&& !recallWork25(ut, a)`), the `priorReply` call (captures
  `rs25`/`prCh25`), the old «pr24» block (now one call to `priorTurn25`), and one new block before «گزارشِ گام (step)» that keeps the whole-problem result of a message that
  also says «حل شد». `logEv`: `it.lines` wins over `priorLines(it.prior)` for `k: "prior"`. The coach_state wrapper appends the ledger note on correction turns.
- NOT touched: `arithChk`, `evalChain`, `tolOf`, `UNIT` (arith). I only CALL them. The `chk`/`chkM` wording lines inside `priorOf` are byte-identical to the base.
`a27_tour.js`: `turnMoments` (moments `prior`, `C145v`; guards on `A073`, `guess`, `A073w`, `A191`), `coachLines` (`PR25`, header stage text, the bold `prior` line, `og25`
in the claim line), `provedAfterTest25` + `notGuessMsg`. `a38_live.js`: the prior turn-question block in `coachCore` only. `a29_mind.js`: the `coachEv` source filter and
the `how` label in `M.phases` only. `a44_route.js`: `planLeft` and one block in `A.ROUTE.model` (per-step `cprior` points) only.

## Contract: the ledger (for arith / story / correction / today)
- ONE ledger per problem: live ⇒ `pg.solve.live.prior`; chat ⇒ `s.coach.story[pk].prior`. Read it with `A.STORY.priorFor(s, pid)`. It is never replaced: a
  `coach_state.prior` report is merged by `n` (the model's step number) or by the same quote; a new step is appended only on the opening message or one she calls her
  prior work. Steps keep: `quote`, `verdict`, `why`, `fix`, `chk` (person), `chkM` (coach only), `bad`/`badC` (page-wrong results), `said`, `dep`, `depWrong`,
  `depStale`, `fixed {t, was, at, by}`, `stale {frag, fix, at}`, `retry`, `re {at, by, was, to, why}`, `reAt`, `her`, `herHist`, `test`, `wait`.
- **arith:** `priorOf`/`tryFix`/`paintPrior` call `arithChk(text)` and rely on entries `{expr, said, val, ok, unit?, conv?}`. If you add fields keep these. The dependency
  rule and C8 use `c.said` of the NOT-ok entries and `c.val`; `calcs()` in my block is a separate light reader used only to match «the same calculation with a new number»
  (it calls your `evalChain`/`tolOf`). «Never show «درست» next to ✗» is the `chk` text in `priorOf` (two lines) — yours to reword; `applyFix` writes
  «حسابِ عددیِ متنِ تازه را صفحه سنجید: درست» only for a fixed (✓) step.
- **correction:** a `coach_state.retract` (accepted or refused by your engine) is also offered to the ledger in `priorTurn25`: fragment in a not-✓ step ⇒ her own fix
  (C8-checked); fragment in a ✓ step and accepted by your engine ⇒ that step `stale` and its dependants `depStale`. The chat result chain (second half of C25-15) is yours.
  On such a turn the page note «چیزی برای عوض کردن نبود» is replaced by «✓ در «کارِ پیشینِ تو» نشست: …» in a45's coach_state wrapper (outermost).
- **story:** the stage item `k: "prior"` is pushed once for a new ledger and once per update turn (`ph` = the ledger's stage from its current state). Tested cases
  («امتحان کردم: …») make no ledger and no stage. `A.STORY.chatSolvedReady(pid)` is true only for an open live problem in form stage u/p whose chat story has a
  whole-problem result and whose ledger has no resume step; `chatSolvedClose` does what `chat_solved` does without a lesson.
- **today:** mind-card events `src: "prior"` (`ph: "c"`, `prior: n`, `cause`, `how: "priorfix"` for her own fix) are now read by `M.phases`; a flipped verdict sets `wd` on
  the old negative event.
- **classify:** on a prior-work opening, a dispute, or a repeat after a re-check, the moment `prior` wins in `turnMoments` and `guess`, `A073`, `A073w`, `A191` are not added.
  `A.STORY.priorTurn(s, pid, msg)` is the pre-reply reader (`{id: open|dispute|again|resume, q, line}`); it writes nothing.

## Not done (reported, with reasons)
- B25·D26 (the first chat problem's ledger does not reach a later live problem) and B25·D24 (results imported as «داده») are `importChat` (story).
- The form's own «جملهٔ کل = رونوشتِ صورت» gate (a38) is unchanged; closing a chat-solved problem goes through the new card.
- Page-side reading of «۱۲ و ۲۴ میشه ۳۶» / operands with words between them / «۹۰ هزار» is P2 (arith); until then such a fix lands through the model's validated
  step or result (C8 still applies).
