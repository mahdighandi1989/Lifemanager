## Round 18, runner C (s21–s29)

**Batch 1 cannot end on group C.** Only s28 passed with zero defects; the other 8 are PARTIAL.

All four round-17 defects are fixed, checked end to end:
- **V1:** the guess note in the look-back list is now correct (s21 c18, s28 c11).
- **V2:** a formula guess is stored on the duplicate problem (s25, `solve.g[1]` written by the model from chat).
- **V3:** the meta head «… پس پرسشِ دیگری از همین فهرست:» is dropped (s25).
- **V4:** the conversation stays in «تو» throughout s27.

What is left is new: two bugs in the new formula tool, two side effects of the RC1 model-reported fields, and one implausibility in the mind report card that this round's new check exposed.

### Run notes
- The build was fresh before starting: `build.py --check` in sync, dist 11:34 newer than 204585c1. I did not edit the repo.
- harness5.js worked. Every scenario ends with `{"exit":true}`, so all `view_pre_*` / `view_post_*` shots exist. I added a final state probe before each exit: mind phases, `coach.guess`, `checkRep`, promises, plans, problems.
- Answers come from round 17. Where the new rules called for it, I added the new coach_state fields: guess, register, defer, check, plan. I also emitted `promise_done` (s23, s29) and wrote formula replies in `$…$` (s24, s25, s26, s28).
- I added formulas to the users' own messages in s24, s25, s26 and s29. s21's FEN and s28's fractions were already in the script.
- coach_state is omitted in at least one coaching turn per scenario.
- Prompt scan: no prompt has a second unmarked question directive. The new hook lines («# گزارشِ وضع», «# فرمول», «# پیگیریِ برنامه», «# درخواست‌های عقب‌افتاده») are either marked context or contain no question.
- My own mistake (class d): s27's first run auto-reused round 17's «شما» replies for system turns r4/r5. I discarded that run and re-ran s27 from scratch in «تو».
- `findings.md` (with «خلاصه برای مالک», «نقشهٔ نیاز», «ارتقای لازم») and `DONE` are written for all 9.
- 9 e-mails sent in the RUNNER16 structure with the group-C storyboard link: ✅ for s28, ⚠️ for the rest.
- Browser profiles are deleted and no processes of mine are running. Scratch is 86 MB; 2.9 GB of disk is free.

### Results

| Scenario | Result | Defects |
|---|---|---|
| s21 | PARTIAL | W3 |
| s22 | PARTIAL | W5 |
| s23 | PARTIAL | W3 (the deferred egg question was kept and then honoured; works) |
| s24 | PARTIAL | W3, W6 |
| s25 | PARTIAL | W1, W2 |
| s26 | PARTIAL | W3 |
| s27 | PARTIAL | W3 |
| s28 | PASS | none |
| s29 | PARTIAL | W3 (the deferred pond question was honoured) |

### Defects

- **W1 — S2, class c (formula tool).** A plain-text formula containing «…» is split into two math pieces, and the right-to-left line puts them in the wrong order.
  - Repro: s25 c1 «1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1)» shows as «+1/(n(n+1)) = n/(n+1) … 1/(1·2) + 1/(2·3) +». The same happens in the `#lpNewS` preview.
  - Cause: `MATHCH` (apps/learning-architecture/src/app/a39_math.js:201) has no «…/⋯», so `asciiSegs` (about :225) cuts the run there.
  - LaTeX with `\dots` renders correctly.

- **W2 — S2, class b (formula tool).** Formulas typed with Persian digits are not recognised, so they stay as text and are scrambled by the bidi algorithm, both in chat and in fields, with no preview.
  - Repro: s25 c20 «۱/۴ − ۱/(2(n+1)(n+2))» shows as «((n+2)(n+1)(2)/۱ − ۱/۴».
  - Cause: `trigger` (a39_math.js:202–204) relies on `\w`, which does not match Persian digits, and «۱/۴» has no trigger at all.

- **W3 — S2, class b (mind report card plausibility).** «چهار مرحلهٔ حل» names a stage with zero events as the most likely weakest stage, because it falls back to the ½ prior. Planning on the live problem is never counted as evidence: the plan form, the data-use gate, auxiliary problems, a plan that led to the solution.
  - Cases:
    - s29: planning 0/0 is named weakest at 62%, although she solved both problems by planning (an auxiliary problem, then the intersection of two loci).
    - s24, s21, s26: planning 0/0 is named weakest; in s26 the real trouble was in execution.
    - s27: look-back 0/0 is named weakest, though he never reached it.
    - s23: planning and execution are both 0/0. Her "bake tomorrow" step was auto-closed at «✅ حل شد» as `done:"no", auto:"solved"`, although she reported in chat that she baked it and it came out well.
  - Locations: `M.phases` in a29_mind.js:346–381 (sources around :340–367, wording at :398); the auto-close is in a38_live.js:2147.

- **W5 — S2, class b (RC1 plan).** In s22 p1 he wrote «به نظرم کار سرایداره… می‌خوام همین امروز باهاش برخورد کنم».
  - The «# گزارشِ وضع» definition of plan covers this sentence exactly, so the literal model reports it.
  - The page accepts it, and the p2 «# پیگیریِ برنامهٔ خودش» block asks the assistant to offer a follow-up of the confrontation in «امروز». That is the action the coach should be holding back until the guess is tested.
  - Round 17 correctly had no offer here.
  - Location: plan handling in a27_tour.js:2702–2809.

- **W6 — S3, class b (RC1 guess).** A validated `coach_state.guess` about the session's own live problem stays only in `s.coach.guess`; the problem's guess (`solve.g`) stays empty.
  - Repro: s24 p4, the tile problem, `g={}`.
  - Only the duplicate-`chat_invent` path stores the guess on the problem (`csExtra` in a27_tour.js, about :2804–2820).

**Observation, not a defect:** the «# فرمول» prompt line also appears on s21's chess turn, because MATHY (a39_math.js:318) matches «2/8» in the FEN. The line contains no question and had no effect.

### ارتقای لازم
- **U1 — mind card:** show "not enough data yet" for a stage instead of ranking it, and count planning evidence from the live problem.
- **U2 — formula input:** a «فرمول» button with a symbol bar in chat and fields, and normalisation of Persian digits.
- **U3 — formula preview:** extend it to the proof, base-case, look-back and guess-kit fields. Today only the statement and next-step fields have it; «(n+1)^2» and «(a − 10)²» went unrendered.
- **U4 — closure:** ask the outcome of open steps before «حل شد» instead of auto-recording "no".
- **U5 — chess:** show the board from a FEN (s21).
- **U6 — probability:** a table or tree for enumerating cases (s28).
- **U7 — geometry:** a canvas for lines, bisectors and tangent circles (s29); today she can only attach a photo.
- **U8 — isomorphism:** a two-column mapping table that is checked against small cases (s24).

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18C/`; each scenario's findings are in `round18C/<sid>/findings.md`, and the tools (`w.py`, `g.sh`, `v.sh`, `probe.sh`, `pr.js`) are in `round18C/tools/`.