# FIX29 — arith fixer (R1) hand-back

- Branch `worktree-agent-ae1bbd433e7ef3e3d`, head `4476d561` (base BASE29). WORKLOG 156, PROGRESS 153, HANDBOOK §12 row 101.
- Commits: 2f4c7394 (mechanisms + r29 arith test + VARIANTS copy), ceeea8c6 (replay + docs + handoff), 4476d561 (r28 replay accepts «≈» quoting, C29-18).

## Fixed (all in `src/app/a46_arith.js`)
- S1 C29-1: C108 inline remainder rule quarantined (`ST.arithC108R28On`) → `remains29` (C141/C156): division remainder; subtraction remainder must equal result; else total from «از N تا»/earlier numbers/recorded statement; else «نسنجیده» with reason.
- S1 C29-2: «درصد» as a label reading (C140), ✗ shows both readings scaled once; never replaces a rounding question (C159).
- S1 C29-3: C84 enumeration up to 8 compound amounts, uniform readings above.
- S1 D29-1/D29-2: C105 branch quarantined (`ST.arithC105R28On`, C135).
- C154/C158 bare amount both scales; «تومن X» = item name. C155 mixed-only → «؟» + ask. `lblStrip` item names between amounts. `fmtCmApx` ✗ value in her scale. `intSum` integer sums ✗ not rounding. `tolSaid` «≈» on compounds. Coach keeps her «≈». `ofPrev29` «نصفش/دو برابرش» (C157).
- New export `ST.arithClauses(q)` (per-clause marks, C138) and `ST.arithExactT` (C161).

## Tests
- `test_tour1_r29_arith.js`: base 69 errors / bank 26/59 → 0 / 59/59. `test_tour1_r29_arith_replay.js` 16/16 (red on base), fixtures `tests/fixtures/r29_arith/`.
- r28 assertions changed (commented): C102 sentence, C105 negative (revoked), A28-40 remainder now ✓, bank OK may carry remainder «نسنجیده», «≈» quoting.
- C136: 909 numeric turns diffed, 55 differ, all intended; 3 false remainder triggers caught and made tests. No runner-✓ became ✗.
- Suite 178/178; docs gate 14 passed.

## Page-level proof (C137)
- F1, F2: a+b+c in A, B, C, D. F16: C (only group). C155, C161: unit only. A29-1 arith side: A.

## Not done (C153 → runner arms)
1. 📜 mark (story) and prior ledger `tryFix` do not read `ST.arithClauses` yet (A29-1 on screen, B29·D11).
2. «N … کم دارم» and money remainders not judged.
3. «هیچی نمی‌مونه», «… ۴ تا هم برای فردا می‌مونه» get no line.
4. Correction proposals do not call `ST.arithExactT` (C161).
5. >8 compound amounts: mixed-only fit not «؟».
6. C156 reads statement only from current session coach.stmt, not ledger/problem record.
