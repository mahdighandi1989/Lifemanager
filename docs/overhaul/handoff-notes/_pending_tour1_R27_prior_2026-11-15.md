# Tour 1 (Pólya), round 27: fixer «prior» handoff (2026-11-15)

Scope (DECISIONS_R27 «Fixer split / prior»): **R4 — prior work** (S1 D27-2 first; C46, C56; C74 read). Base: `BASE27` = `4273c7f1`.
FIX27 assigns WORKLOG 139 / PROGRESS 136. **On this branch the entries carry 138 / 135** (next free numbers on BASE27; the docs gate refuses gaps).
**Coordinator: renumber to 139 / 136 at merge** (WORKLOG heading, PROGRESS row number and its `WORKLOG (n)` cell, the HANDBOOK §10 and §12 `WORKLOG (n)` cells,
the AUDIT_LOG line). HANDBOOK §10 row (2026-11-15, «prior») + §12 row 84 (renumber if a sibling took 84).

Tests: new `apps/learning-architecture/tests/test_tour1_r27_prior.js`; byte copy of the bank `tests/variants/VARIANTS_R27.json`; fixture
`tests/variants/R27_prior_runs.json` (the round-27 runners' own turns — user text + recorded model reply — of s06, pA2, pwB3, pC1, s28, pwA1, pwD2, pwC1),
plus `R26_prior_runs.json` (pwD1, same texts and replies in round 27). No older assertion was changed.

## Functions I changed or added (keep your edits out of these, or tell the coordinator)
`a45_story.js` (prior block)
- new: `hypoCut` (`ST.hypoCut`), `HYPO27`, `HYPOQ27`; `OWNSTEP27`, `NEWP27`, `SYMREL27`, `ARROW27`, `STUCK27`, `TESTOK27`, `worked27` (`ST.worked27`); `priorPid27`, `ST.priorPid`;
  `LAB27`, `near27`; `whyNow27` (`ST.whyNow27`).
- changed: `readReply` (input through `hypoCut`; dispute by meaning «ولی … حساب کرده بودم» against one step's reason), `pageFix` (input through `hypoCut`;
  «درستش N» with no step name), `priorAsk` (worked step = engine relation / symbolic relation with her marker / arrow; «یه سؤالِ تازه … خودم یه گام رفتم»),
  `workMsg` (an engine-read relation is her work ⇒ the arithmetic block shows its ✓ lines — not a bare question «۷ × ۸ = ۵۶ بود دیگه؟»); tested cases («امتحان کردم: p=5 ⇒ ۲۴») stay tests unless she says the trial «درسته / جور درمیاد», `priorOf` (step field `lab`), `priorMerge` (her own «گام N:» label binds
  to step N when one word/maths fragment is shared), `priorTurn25` (`open0` = the old opening rule creates a NEW ledger; `open` = also MINE26 «حساب کرده بودم», which only appends to an EXISTING ledger), `onState` (two lines: `ppid27`/`pkey27` for
  `priorReply` and `priorTurn25`), the «کارِ پیشینِ تو» prompt hook (pid falls back to `priorPid27`), `ST.priorTurn` (closed problem: dispute/undo/which/again
  still heard, no resume question; pid falls back to `priorPid27`), `priorQ` (reason via `whyNow27`), `OTHER26` (+داداش/آبجی/عمو/دایی/خاله/عمه/شریک/رئیس, +«گفت»).
- NOT touched: stage functions (`finOf`, `wholeRes`, `phaseOfItems`), story filing, `a38`, `a40`, `a41`.

`a46_arith.js` — **only `ST.arithContest`** (arith owns the file; the S1 D27-2 lives here, so the change is minimal and local):
- the contest text goes through `ST.hypoCut` before `CONTEST` / restatement (C46);
- `doneK` also holds the old quote of every ledger step she fixed herself (that ✗ is no longer on the table);
- the re-check of a previous-message ✗ (`mem`) reads her FULL message (the stored text is clipped at 600 characters) and clears only when the same expression
  is read again with `ok === true && !ask`; not found ⇒ `out.open` («نسنجیده», ✗ neither removed nor confirmed). A ledger step whose re-check reads no
  arithmetic at all also goes to `out.open`, never to «cleared».
- new output field `out.open` (array of `{n, t}`); the coach block, her note and the 📜 event carry one line each for it. The shape of `cleared`/`kept` is unchanged.
- Nothing else in a46 changed (no reader, no `norm`, no offsets).

## Contract (for the siblings)
- **arith:** if you rewrite `ST.arithContest`, keep the three rules above: `ST.hypoCut` before `CONTEST`; recompute on the full message; «درست» only from a
  re-read ✓ of the same expression. `ST.hypoCut` is same-length (offsets unchanged).
- **correction:** C74 — `hypoCut` blanks only the hypothetical sentence; the fact in the same message («آهان، اصلاً ۵ بوده») stays in the text the ledger reads.
  `pageFix` no longer applies a hypothetical («اگه هر مرور ۸ ثانیه بود، ۱۷۰ × ۸ میشه ۱۳۶۰»). The a38 retract engine is yours: a hypothetical should not be a retract either.
- **story:** (1) B27·D2 / bank #166 reproduced and NOT fixed: after an all-✓ ledger, «عرض = ۶ سانت و طول = ۱۲ سانت» + «وارسی کردم … جور درمیاد» leave the stage at
  «اجرای طرح» — `ST.finOf` does not match the unknown «ابعاد» to «عرض/طول»; (2) D27-15 / bank #167 reproduced and NOT fixed: 📜 shows «برنامهٔ خودت (از گفت‌وگو)»
  and «حدس (از گفت‌وگو)» beside the ledger rows of the SAME opening message (`a40` `addSessEvents` from `chatPlans` and `coach.guesses`); the ledger should own those
  quotes; (3) s28 p4 «نسخه‌ی سه‌شنبه رو آوردم … ⇒ ۱۳/۲۷» is a second problem the page does not split — once it is split, `priorOpenAt` fires C7 there.
- **dates / classify:** after closure `ST.priorPid(s, text)` names the closed problem whose ledger still takes reports; the moment `prior` (dispute/undo/which) can
  now win a turn after «✅ حل شد». No new ask or label.

## Not done (reported, with reasons)
- bank #166 and #167 (above) — reproduced; their roots are in story's stage judgement and in a40/a41 records.
- s28 p4 (C25-7′) — depends on the second-problem split.
- No real-model run of the new «نسنجیده» re-check line.
