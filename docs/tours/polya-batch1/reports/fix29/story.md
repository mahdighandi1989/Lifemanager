# FIX29 — story fixer (R6) hand-back

- Branch `worktree-agent-ad012dff85c2fbb7b`, head `9c493c51` (base BASE29 `40b34a51`).
- Commits: 07a49c92 (C138/C149/C125/C124/C97), ecf7a53d (runner sentences + bank R6), 0cd8973a (per-clause 📜 marks, C172, page replay), 9c493c51 (docs WL159/PR156).

## Root causes fixed
1. F15/C138/C157 (S1 A29-1): `a45 markOf27` gave one verdict per line → new `unreadClaims29` (clause spans vs engine `pos/pe`); mixed lines marked per clause «✓ … ؛ ؟ … نسنجیده». Adds «نسنجیده» only, never judges (C139).
2. F18/C149/C173: `onState` filed every numbered clause as «داده» and `ownCalc28` refiled per sentence → `dataKind29` (calc → «حسابِ تو», forecast never «داده», other-person clause never hers); per-clause filing; restatement makes no new line.
3. F9/C125: `attr28`/`otherWork27` read only the first other span, list ran to message end, «X گفت…، پس» given to X, «فروشندهٔ» missed → `ST.otherWorks29`, «پس/بنابراین» ends the saying, WHO27 accepts «ٔ».
4. F10/C124/C172: `a40 deps28` read dependants only from correction text → `ST.stepDeps29` from the ledger (transitive); left-behind line after «فقط همین»; «همه با هم» undone as one batch.
5. F11/C97 (C29-5): `NEWPROB25` reads «یه مسئله: … ؟».
6. C151: «(C57)» removed from 📜 other-work line.

## Tests
- `tests/test_tour1_r29_story.js` 51/51 (25/51 on base); `tests/test_tour1_r29_story_replay.js` 18/18 (0/18 on base), fixtures `tests/fixtures/r29_story/`.
- r28 story / story_bank: C95_step_and_fc and B192 now click «فقط گامِ ۱» (C124 gives step 1 a dependant).
- Bank R6: 34 green, 6 nc (#225 a46 coach, #227 arith C157, #242 forecast, #244 A29-19 not built, #245 prior, #253 unchanged 🎯 move).
- C136 sweep: no runner-✓ turned ✗; 16 mixed lines → per-clause; 93 claim lines gain «— … نسنجیده».
- Docs gate fails only on numbering (159/156 after 155/152) — renumber at merge.

## Page-level proof (C137)
- F15: a+b+c in A (only group showing it). F18: A, B. F9 (📜): A, B, C, D; coach half not done. F10/C124: A, B, C; C172 unit/bank only. F11: C29-5 in C only.

## Not done (C153 → runner arms)
1. a46 coach-line attribution (`otherSpans`, arith's file): «X یه حسابِ دیگه (هم) کرد: …», «X گفت …، پس <her calc>» (bank #232/#235, B29·D12, C29-4) — one-reader fix: a46 reads `A.STORY.otherWorks29`.
2. ✗ on «نصفش» / remainder clauses needs arith's per-clause reader (C141/C157); story shows «؟ نسنجیده» until then.
3. F11 beyond C29-5: A29-19, B27·D7, B28·D9/B29·D15 (shared with prior).
4. A moved 🎯's outcome (A29-27) — forecast.
