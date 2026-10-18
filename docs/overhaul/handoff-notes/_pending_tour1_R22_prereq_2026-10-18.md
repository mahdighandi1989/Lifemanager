# Tour 1 (Pólya), round 22: fixer «prereq» handoff (2026-10-18)

Scope (DECISIONS_R22 «Fixers / prereq+route»): P1 (prerequisite layer) and P2 («🧭 نقشهٔ مسیرِ مسئله»).
Base: integration head `e3fcb898` (round-21 fixes + age package) merged into this worktree.

Files changed: new `src/app/a44_route.js` (added to `build.py` after `a43_age.js`); `src/app/a38_live.js` (3 lines in `coachCore`); `src/app/a29_mind.js` (causes in `M.phases`,
`causesSection`, `phasesText`); `src/app/a32_sieve.js` (`A.prereqMkTopic`, links and item state in the 🧩 view, empty «()» in topic titles); `src/app/a40_dossier.js` (one line in
`dossierSess`: a prerequisite-caused stuck shows no «−»); `src/app/style.css` (route map classes `.rt-*`, `.lp-precard`, `.mind-causes`).
Tests: new `tests/test_tour1_r22_prereq.js` + byte copy of the bank `tests/variants/VARIANTS_R22.json`. No old assertion changed.

## Contract: coach_state fields (model reports, page validates — all with her quote)
- `prereq: {concept, step, quote, q?, topic?, parent?}` or an array in priority order (first = blocked the way first). Rejected: quote not in her latest message (after ZWNJ/ezafe
  normalisation), a field name as concept (`A.PRE.broad`: «جبر», «ریاضی»…), no step, a solved problem, a closed live step named by number (`s2`, «گامِ ۲»), «قبلاً … بلد نبودم … یاد گرفتم».
  A concept already learned in any problem is not pushed; a «کاربست» is added to that item (`uses`).
- `prereq_res: {id, diag: "missing"|"had", quote}` and `{id, mastery: "yes"|"no", quote}` (both in one object ⇒ «خودش ساخت»).
- `learned: {concept, quote}` — her own learning, including in the teacher role.
- `cause: {kind: "knot"|"skill", quote}` — cause of a stuck/fail with no prerequisite; marks the coachEv events of that message.
The base `AS.DO.coach_state` runs first; the wrapper (`_r22pre`) runs after it. **turnq+class / correction fixers:** if you wrap `AS.DO.coach_state` again, keep the property copy
(`Object.keys(raw).forEach(k => wrapped[k] = raw[k])`) so `_r22pre` stays set.

## Contract: one turn question (for turnq+class, P4)
- While a stack is open, `A.prereqTurnQ(pid)` returns `{q, st: "diag"|"teach"|"teach-again"|"back", e}`; `coachCore` sets it as `q` (`src: "prereq-<st>"`) **before** any other pick.
  `st: "back"` is the one turn after returning from the last prerequisite (the waiting step, not «گامِ بعدیِ تو چیست»).
- The prompt block `# پیش‌نیاز (…)` carries `- **پرسشِ این نوبت همین است:** …` when the stack is open (or on the back turn). A prompt filter (`AS.promptFilters`, pushed last at load) then demotes
  every other `**پرسشِ این نوبت همین است:**`, `- در این نوبت فقط **یک** پرسش`, `پیشنهادِ این نوبت: «…»` and `پرسشِ (پیشنهادیِ) این نوبت` line to
  `- زمینه (نه پرسشِ دوم؛ پرسشِ این نوبت همان «پیش‌نیاز» است): …`. If P4 builds a single turn-question source, please read `A.prereqTurnQ` first and keep the heading `# پیش‌نیاز (` (the filter finds it).
- `AS.replyCheck` is wrapped (`_r22pre`): a validated `mastery: "yes"` whose reply does not mention the waiting step gets one rewrite with the restatement. It appends to an existing reason
  (replacing `". همان پاسخ را"`), so keep that phrase in your reasons.

## Contract: mind card causes (for practice+lists and anyone reading `A.MIND.phases()`)
`A.MIND.phases()` now also returns `causes: {prereq:[{concept, step, quote, ph, pid, sess, rec}], knot:[…], skill:[…], unk:[…]}` and `prereq: {learned:[…], open:[…]}`. Events with
`e.cause === "prereq"` are **not** added to the stage rows. Each act has `cause`/`causeWhy`. coachEv fields written by this layer: `cause`, `causeWhy`, `pre`, `preC`, `preStep`, `preQ`, `prePid`, `preRec`.

## Contract: data
- Stack: live problem ⇒ `eprog_<pid>.solve.live.pre22 = {st:[entries], n, note, ret}`; chat problem ⇒ `achat.coach.pre22[pk]`. Entry `{id:"pqN", concept, step, quote, q, topic, parent, depth,
  state: diag|wait|teach|learned|had, diagAns, mastQuote, tries, selfMade, role, back}`. API: `A.PRE.scope(s)`, `.stack(sc)`, `.all(sc)`, `.placeOf(sc, id)`, `.restate(sc, id)`, `.rec(sc)`.
- 🧩 record: `type: "prereq"` with `pid` (or `sess` + `pk`), `from: "coach"`; items carry `eid, step, quote, state, learned, mastery, how, role, uses, practised`.
- Events: `A.EVLOG.add` with ids `pre22_<eid>_pre|prediag|preok` (k `pre`, `prediag`, `preok`) — the dossier and the route map read them.

## Contract: route map
`A.ROUTE.model(pid|sid)` is computed on each call from `A.dossier`/`A.dossierSess` + the stack; it writes nothing. Event kinds it reads: main (`stmt u udraft restate plan step out ans verdict
state back cplan …`), detours (`aux`, tested `guess/gold`, `pre*`), back-jumps (`retract copyans stepold uold planold`, withdrawn main events). **correction fixer:** keep the retract line
format `«old» ⇐ «new»` as `lines[0]` (the back-jump target is found from `old`). **practice fixer:** events with `k: "practice"` / `kind: "prc:*"` are skipped.
UI: view `route` (`VIEW_META.route`, `SUB_VIEWS.route = "e_prob"`), `.lp-route` button on the problem page, `.as-route` in `AS.sessTools`, `.rt-geo` strip prepended to `#main .page` in
other views while the session's live problem is open (not solved/abandoned).

## Not done
- No real-model run (AGENTS rule for an AI-path change) — needs the inspector token; listed as HANDBOOK §12 row 53.
- The knot solver's «دانش و مفهوم › کمبودِ مفهومِ پیش‌نیاز» family is not yet wired to the stack (§12 row 53).
