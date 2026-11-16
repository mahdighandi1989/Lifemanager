# Fixer «prior», round 28 — hand-back (branch worktree-agent-ace81715d1a1bdc6b, head 05f9b629)

Base BASE28 4001c4cf. Branch numbers WORKLOG 148 / PROGRESS 145 (renumbered to 149/146 at merge). All four items proven (a+b+c).

## Items
- **C98 / F12 (A28-37, D28-30, nB1 p7):** `a45` `priorAsk` — STRONG25 took «۷ × ۸ = ۵۶ بود دیگه؟» as a worked step; C56 lived only in
  `workMsg`. `bareQ28`/`bareMsg28` in `priorAsk` and `priorTurn25`.
- **D28-6 regression + C97 ledger side (dp2 p6):** `priorPid27` knew a new problem only by «یه سؤالِ تازه»; `newProb28`, `closedNew28`,
  `splitNow28` (C126: «اگه … چی؟», naming a closed step, «گزارشِ سوم» stay; «یه گامِ تازه» merges — `NEWSTEP28`).
- **B28·D9 (pwB2 p9, nB1 p14):** (1) `ST.otherWork27` (story's function, one line) stretched «مادرم … گفت» to the end of the message —
  the span now ends at «پس / بنابراین / در نتیجه»; (2) `importChat` copied the ledger from the current chat key — now picks the chat
  problem whose statement matches the live problem.
- **C27-21 (pwC1 p3):** `whyLine28` removes the reason that rested on the fixed step from the ledger line, 🔭 card and prompt.
- Also: `prop28` (exact proposals for dependants after her own fix; `accept27` can accept; bank #221, #234); `a46` `ST.arithContest`
  (arith's file, one guard): re-typing her own ✗ line is not a dispute (C28-4, #247).

## Tests and proof
`tests/test_tour1_r28_prior.js` + `tests/variants/R28_prior_runs.json` (11 red on BASE28, green now). Bank R6: 33/36; #226 (correction:
«اصلاً ۴ لیتر» not accepted by retract), #229 partial (stage is story's `finOf`), #235 (title from the model's `live_new`).
Page replays through the runners' harness, 0 prompt divergence: pwA1 p19, tD2 p25, dp2, pwB2, nB1, pwC1 p3; pwA1 p18 caught and fixed
a regression of the fixer's own. Suite: 157 files green one at a time (TMPDIR=/dev/shm during the full-disk spell); r25–r27 prior
fixed after new guards; after the last commit only r25–r28 prior re-run. Pytest 14 passed.

## Not done
#226, #229, #235; the record side of C97 (story). Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R28_prior_2026-11-16.md`.
