# FIX29 — prior fixer (R3) hand-back

- Branch `worktree-agent-aab9a9936d6e92893`, head `224c96e1`; merged into merge29 after arith as WORKLOG 157 / PROGRESS 154.
- Commits: 160040f5 (one judge C139, D29-7, B29·D25, C25-7′), 89ac944d (docs + handoff), 077d318b (retry reason once), 24293c29 (experience update), d3803648 (WORKLOG finding), 224c96e1 (bundle).

## Root causes (a45_story.js)
1. S1 B29·D11 `tryFix`: second, scale-blind reader re-checked `x.badC` → old ✗ re-judged by the engine's key (`kNorm(expr)`); light reader may only confirm or mark «نسنجیده»; `tryFix` returns true/false/null.
2. D29-7: page-built «متنِ تازه‌ات» from `subFrag/subNum` and word-only links to a stale step → page-built text is soft; stale step takes only an engine-read recomputation containing the new value (`stale29`, `strong29`); also `priorReply`, `pageFix` (C164 never rewritten).
3. B29·D25 `whyNow27`: reason split inside amounts → byte-exact reason when nothing dropped.
4. C25-7′: `stmtHit29` (statement words are a problem signal), `other29` (closed first problem doesn't block the second's opening). Also C163 `TAG163`, C98 scale words in `BAREW28`.

## Tests
- `test_tour1_r29_prior.js` (23 red on base → green), fixtures `tests/fixtures/r29_prior/`. Bank R3 33/33 + 4 reported (#112 compound exact proposals — correction+arith; #114 story B29·D15; #116/#133 unchanged paths).
- C136: 12 ledger scenarios old/new, only reason lines changed; look-alikes kept.
- Suite 176 others green; docs gate 14.

## Page-level proof (C137)
- B29·D11/C139: B, D. D29-7: D (B shows no fabricated retry). B29·D25: B (+C, D by replay). C25-7′: C, prompt side only.

## Not done (C153 → runner arms)
1. #112 exact proposals for dependants after a fix with compound amounts (`A.livePriorStale`, a38) — correction + arith.
2. s28 p4: the second problem's ledger is built only when the model reports `prior` (bank #113 scripted).
3. Ledger does not yet read arith's `ST.arithClauses` (keep `kNorm` key).
4. C160–C162 are correction's.
5. Step fixed from her own message stores the whole sentence, not the calculation clause.
