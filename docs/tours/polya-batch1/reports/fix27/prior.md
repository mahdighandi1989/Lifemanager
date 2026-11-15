# Fixer «prior», round 27 — hand-back (branch worktree-agent-aae0e6f7cf734f304, head 878f851d)

Commits:
- b52e43ee — D27-2 (C46), C7 on a single worked step (C56), and the ledger merge after closure (A27-21).
- 0b5a5672 — dispute by meaning, later-report merge, resume reason, and the bank.
- 878f851d — guards and docs.

Suite: 164/165 files pass one at a time; `fixtures_mind_seed.js` is a fixture, not a test. Pytest handbook/ownership: 14 passed.
The branch uses WORKLOG 138 / PROGRESS 135 / §12 row 84; the coordinator renumbers them to 139/136.
One function in arith's file was changed: `ST.arithContest` in a46, because the S1 lives there. Check it against arith's branch at merge.

## Root causes
- **D27-2 (S1), in `a46` `ST.arithContest`:**
  - `CONTEST` fired inside a conditional sentence.
  - The re-check ran on her stored message clipped to 600 characters, and «not found» was taken as «correct».
  - The step had already been fixed by her in p2.

  Fix:
  - `ST.hypoCut` (a45) blanks hypothetical sentences without changing the text length. A fact stated later in the same message survives
    (C74).
  - The re-check drops ✗s she fixed herself and reads her full message.
  - It says «درست» only when the same calculation is read again and found correct; otherwise «نسنجیده» (`out.open`).
  - `readReply` and `pageFix` also ignore hypothetical sentences.
- **C56, a worked step at opening (A27-13, B27·D3, C25-7):** `STRONG25` missed a unit between a number and its operator, and `TEST25`
  dropped a trial she said worked.
  - `worked27` counts:
    - any calculation the a46 engine reads;
    - a word relation she marks as her own work;
    - «… ⇒ N».
  - `workMsg` brings the arithmetic block too.
  - A bare question («۷ × ۸ = ۵۶ بود دیگه؟») still gets none.
- **A27-21, a later report after closure:**
  - `priorPid27` / `ST.priorPid` point back to the closed problem's ledger.
  - `LAB27`/`near27` match her «گام N:» labels.
  - A new ledger opens only at an opening (`open0`).
- **D26-11, dispute by meaning:**
  - A dispute, a take-back, «کدام گام؟» and «دوباره» are heard after closure.
  - A clause naming one step's reason disputes that step (#162).
  - «درستش N» fixes a step only when exactly one wrong step's exact value is N (#165).
- **C27-21 / C27-24:** `whyNow27` keeps clauses resting on a fixed step, and «هنوز …» about a supplied piece, out of the turn question.
- **C57, ledger side:** `OTHER26` gains داداش، آبجی، عمو، دایی، خاله، عمه، شریک، رئیس and «گفت».

## Tests
- `tests/test_tour1_r27_prior.js` replays the runners' own turns from `tests/variants/R27_prior_runs.json` and `R26_prior_runs.json`.
  Each positive has its negative.
- On BASE27: 13 + 2 errors. Now green.
- Bank R4: 33/33 of the entries exercised.
  - #166 (B27·D2): reproduced, not fixed. It is story's `ST.finOf`/`ST.wholeRes`.
  - #167 (D27-15): reproduced, not fixed. It is a40 `addSessEvents`.
- Earlier breaks in r25/r26 arith/prior and r3_coach were fixed with three guards. No old assertion was changed.

## Not done
- #166, #167.
- s28 p4 (C25-7′): it needs story's split into a second problem.
- No real-model run of the «نسنجیده» re-check line.
- About 6 hours elapsed.

Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R27_prior_2026-11-15.md`.
