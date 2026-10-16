# Tour 1 (Pólya), round 3: «live» fixer handoff (2026-10-16)

This note covers the live tunnel (`apps/learning-architecture/src/app/a38_live.js`). It also records three small edits outside a38, each listed below. Decisions came from `DECISIONS_R3.md` (D1–D4 where they touch a38, and A1–A13).

**Not done here:** docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG). The main session does those and the merge.

## Commits
- `a9191f5`: the a38 code for D1/D4 and A1–A13. The edits are interleaved in one file, so they are one commit. It also adapts existing tests where an owner decision changed behaviour:
  - `test_tour1_r2_live.js`: the pod/prove kind picker is no longer locked (D1). The eq card is hidden for proofs (A9).
  - `test_live_problem.js`: plan questions are kind-aware (A11). An answered plan question counts as a plan tool (A13). The simulator rung is seeded with real spaced uses.
- `ddeffd1`: A2, compound units. Also the aux kind select now re-renders its own question (A3/A7).
- `78fa87f`: the new test `tests/test_tour1_r3_live.js`. It covers every item on the real page path. It also adds the letter-form check to `test_tour1_r2_live.js`.
- `3621006`: A13(k), chart axis labels stay a real 11px in a narrow bubble.

## Red baseline
Run `LLA_FILE=<pre-fix dist html> node tests/test_tour1_r3_live.js`. It exits 1 with 47 failing assertions and no exceptions. On the fixed build, every check passes.

## Items
- **D1**: pod and prove default to objective; this is not forced. An explicit judge (user, parent, or assistant `nat`) wins. `natExplicit()` and `natOf` were updated, along with the form picker and the understanding card (no longer disabled). `lbFlags.proof` is now set only when the judge is objective.
- **D2**: `A.liveCoach(pid, {asked})` orders questions by rung. Questions already asked or answered are skipped. It returns `rung` and `ladderEnd`. The hook takes the asked questions from the session's own AI messages; message count is no longer used.
- **D3**: the C188 wording is used in the hook (`ladderEnd`) and in the coach card.
- **D4**: `natGuess` matches whole words only. A textbook problem that has units but no first-person cue now gets objective; a first-person one gets practical. An unset judge gets a neutral frame in the hook.
- **A1**: a refuted guess is shown as «رد شد» together with the user's own «why did intuition fail?» answer. It is never shown as «اثبات شد». `g.proved` is set only when the guess was not refuted.
- **A2**: units are accepted in the forms مترمربع, مترمکعب, متر مربع, m^2, cm³, km² and mm².
- **A3**: a special aux problem in an objective problem gets `gen` from `genArg()`. If the closing gate is crossed without a generalisation argument, the verdict becomes «special» («از حالت خاص به عام بدون استدلال»), never «proved».
- **A4**: a new look-back problem shared as «form» requires a mapping that passes `A.liveMapOk`.
- **A5**: `lpBLimit` is now asked for any find problem that has numeric or symbolic data, or is spatial.
- **A6**: a circular sufficiency or satisfiability reason (one that asserts a conclusion about the unknown, or names the unknown) gets a challenge: «کدام داده این را می‌گوید؟ / پیش‌فرض است». The answer is stored as `presup`.
- **A7**: analogies need their limits («کجا این شباهت می‌شکند؟»). This applies to aux «analog», to the `mv_analogy` move, and to the execution questions.
- **A8**: `stepFollowsTag` now works in both directions:
  - An induction plan is recognised even without the word «استقرا» (from n/n+1 wording or the `mv_descent` move).
  - A checking or new-data step returns "check".
  - A step that negates the plan's word («کیش نیست») does not count as following the plan.
- **A9**: `eqsOf` counts only real symbolic equations. A chain counts once, and «x = 3» is treated as a result. The eq card is hidden for proofs.
- **A10**: the pod look-back first asks `lpBPod` (proved or refuted). The checks then refer to the user's refutation. A refuted pod gets the verdict «refuted» («✅ رد شد»), and `liveClosure.refuted` is set.
- **A11**: the u/p question lists depend on the problem kind:
  - practical: the coach's `QK.pract` (via `AS.coachQs(ph, "pract")`, no pid)
  - life: the same list without the quantity-only questions, plus a life «all data» question
  - objective or unset: the book/math list

  The page's plan card (`askCard`) and `A.liveRote` use the same list.
- **A12**: `liveClosure` returns state «review» («در بازنگری — هنوز بسته نشده») until the look-back is saved.
  - Outside a38, in `a29_mind.js`: in the mind card, a live step that was done but made no progress now counts as a failure.
- **A13**, smaller fixes:
  - «؟۴۸۷؟» no longer counts as a sentence end.
  - The refuted-guess line in the hook now quotes the claim instead of printing a count. This stops a27's count line through its own `/با آزمون رد کرد/` check, so a27 was not edited.
  - The practical frame rejects empty answers.
  - The pod card now asks «برآوردنی؟», and its relax card covers the hypothesis parts.
  - A limiting-case hint appears before an experiment.
  - `lpDep` «نه» is revisited at look-back (`lpBDep`), which leads to the monotonicity question.
  - «کدام پرسش کمک کرد؟» shows the whole question.
  - An answered plan question counts as a plan tool, and the refusal is now visible (`.lp-planmiss`).
  - The spatial look-back gets the letter form and transfer prompts (`lpBLetter`, `.lp-btransfer`).
  - The look-back «new problem» is rejected only when it is a normalised copy (spaces, ZWNJ or digit script are the only differences).
  - Stale «اول این‌ها» toasts are cleared after a successful save and on navigation.
  - Outside a38, in `a26_assist.js` (`bidiNodes`): Persian digits are treated as neutral, so a formula and its result or arrow stay in one isolate.
  - Outside a38, in `a29_mind.js` (`csvBlock`): the chart keeps a real 11px label size and scrolls inside its own frame.

## Files outside a38 (none belong to the coach fixer)
- `a29_mind.js`: the mind-card live step and `csvBlock`.
- `a26_assist.js`: `bidiNodes` digit class.
