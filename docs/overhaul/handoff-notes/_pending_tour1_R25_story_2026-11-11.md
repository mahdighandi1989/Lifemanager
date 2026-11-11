# Tour 1 (Pólya), round 25: fixer «story» handoff (2026-11-11)

Scope (DECISIONS_R25 «Fixer split / story»): P5 «one stage, one problem» and the remainders it names (C25-5/6/10, A25-19, B25·D20, D24-9,
A23-35). Base: `eeb11d1f`. On this branch WORKLOG (121), PROGRESS 120 (the handbook gate needs gap-free numbers); FIX25 assigns 122/121 —
the coordinator renumbers at merge after «correction». HANDBOOK §10 row (2026-11-11) + §12 row 67.

## Functions changed (keep your edits out of these, or merge by hand)
- `src/app/a45_story.js`: `phaseOfItems` (+ quarantined `ST.phaseOfItemsR24`); NEW block right after it: `OPENLEFT25`, `ansUnk`, `ST.openLeft`,
  `ST.subRes`, `ST.finOf`, `ST.planIdea`, `ST.planHasWhat`; `onState` — only (1) the boundary-carry block before `priorReply(...)`, (2) the
  `plan` push line, (3) the `res` push line; `ST.owns` (4th arg) and `pidAt`; `importChat` — only the block after `var items24 = …`;
  NEW first prompt hook (`AS.promptHooks.unshift`) with `NEWPROB25`, `newProbAt`, `BACK25`, `switchTo`, `splitNote`, `ST.newProbIntro`,
  `ST.keepSplit`, `ST.splitOff`. NOT touched: `arithChk`, `priorOf`, `priorReply`, `priorLines`, `priorQ`, `ST.priorTurnQ`, `paintPrior`, `workMsg`.
- `src/app/a27_tour.js`: `NEWINTRO_RE` (one optional «که …» clause); `coachPhase0` (one guard before `var weakRes`); `AS.DO.coach_state`
  (the `said result` / `said plan` stage lines, `P.strong` line, `C.rep`); the «# وضعِ کنونی» stage read in the round-20 prompt filter;
  `liveCtx` (`onPage`); the page-link prompt hook (`sessLink(s, st.arg, true)` guard).
- `src/app/a38_live.js`: `coachCore` — the `ph === "u"` line, `own25none`, and the ladder guard; the «# مسئلهٔ زندهٔ این سشن» prompt hook
  (`onPage` guard). NOT touched: `liveStale`, retract.
- `src/app/a40_dossier.js`: `own23` passes the event to `A.STORY.owns` (one line each).

## Contract: whole result vs sub-result (for prior, arith, classify, today)
- `A.STORY.subRes(s, pid, text)` — true when her message names a remainder («… رو نمی‌دونم»، «حالا … چند …؟»، «حالا باید …»), or the prior ledger of
  this problem has a step with `verdict !== "ok"` and no `fixed`, or a multi-step plan has steps left. **prior:** when her own fix makes a
  step correct, set `fixed` or `verdict:"ok"` on the ledger (`s.coach.story[key].prior` and `L.prior`) in the same turn; until then the result
  of that message stays a sub-result (stage one turn late — HANDBOOK §12).
- `A.STORY.finOf(s, pid, text, resultQuote)` — whole result: not sub, and FIN words / end of plan / answers the unknown with its own verb or
  asked quantity / her closing word («همینه»). Story `res` items carry `fin` from it.
- `coach_state`: a sub-result keeps the stage (`ph0`), `C.rep.result` is false and `C.rep.sub` true ⇒ no «نتیجه‌ای گفتی» turn question.
- `phaseOfItems`: `res(fin:false)` alone moves nothing; «اجرا» needs `plan` (not `idea`) or `step`; `plan.idea` alone ⇒ «طرح».
- Story item `plan` may carry `idea: true` (tentative or asked as a question). A deadline promise without a «what» is never a plan item.

## Contract: several problems in one conversation (for classify, today, loop, correction)
- First prompt hook of every turn: a message matching `A.STORY.newProbIntro(text)` while the session is bound to an OPEN live problem
  unbinds the session (`lprobLog` entry `{p:"", s25:1}` — `pidAt` treats it as the end of the old problem's ownership), starts a chat problem
  (`C.pk = "c:<gen>"`, `C.stmt` = the part after the intro, `C.ph = "u"`) and records `s.coach.split25[] = {from: pid, pk, at, key, off}`.
- `A.STORY.keepSplit(s, pid)` — true while the split problem is in focus; `liveCtx`, the page-link hook and the live prompt block do not
  pull the turn back to the page in view. **Anyone adding a new «problem of this turn» derivation must call it.**
- Return only by her naming («برگردیم به مسئلهٔ اول/دوم»، «توی اون مسئلهٔ X»): rebinding with `A.liveBindSession(…, {force:true})` / unbinding.
- `A.STORY.splitOff(s, text) > 0` — this message is a boundary message; what stands before that offset belongs to the old problem (a
  validated result there is stored on the old problem; nothing of it on the new one).
- Events cut out of an imported window carry `not25: [pid]`; `A.STORY.owns(se, pid, at, ev)` returns false for them.
- The second problem has no 🔭 row until she says «ثبتش کن» (`live_new` as before).

## Contract: turn question
- A self-made, woken problem (`r.woke` or `r.origin.type === "lprob"`) with no recorded/drafted understanding gets no understanding-ladder
  page question (no u0, no «مجهول چیست؟»). **classify:** your page turn question for it must come from her words.
- A re-opened understanding (`L.reU`) without a draft reads the recorded understanding.

## Not done
- No real-model run of the two-problems block (AGENTS rule for AI-path changes) — HANDBOOK §12.
- More than two problems in one conversation: return looks at the last split only.
- Older open items A23-6, -8, -10, -19, -25, -26, A22-11, A21-11 are outside P5 and untouched.
