# FIX29 — forecast fixer (R5) hand-back

- Branch `worktree-agent-a5893553a1b503d73`, head `8834e1dc`; merged into merge29 as WORKLOG 159 / PROGRESS 156 (arrival order: arith, prior, story, forecast; correction waits).
- 8 commits: 55604088 core, badbd931 A29-24, 48a810af C170, 37aed39f ✏️/new-day/C120, d517121e docs, 26e0fe2e only-🎯 settles + replay, 2a8e3c05 C121 fallback, 8834e1dc handoff.

## Root causes (a41_practice.js unless noted)
1. C148/C168 `CONF28`: any «با N٪» was a confidence → only with اطمینان/احتمال, phrase end, or گفته/گفتم/بود/پیش‌بینی; belief words win.
2. Duplicate 🎯: `PR.bookPred` same message + same claim = one record (C29-8); «یعنی» not an outcome word (A29-16).
3. Two % in one clause (B29·D17): `read28` reads a second 🎯; `outcome28` settles chunk by chunk (`vb29`).
4. C152 (B29·D8, C29-7): forecast items leave `PR.datePend`'s plan ask; own «🎯 موعدِ …» line; vague 🎯 asks due after its number; `PR.predPendDue29`; a31 `A.V.fcast` «موعدِ پیشنهادی».
5. C119 (B29·D23): VAGUE28 blocked only by a percentage.
6. C121 (B29·D7, C28-19): `probOf27` most unique words wins; fallback to the conversation's open live problem.
7. Settling non-🎯: masked quotes (B29·D5), unit conversions removed (A29-24), ✏️ never settles, non-🎯 dropped (B29·D4), `isRep28`, `EXC28`, `verdict28` «پیش‌بینیم N بود», `approx28`.
8. `apply28` «نه N», `clean28`, new day = new 🎯, C170.

## Tests
- `test_tour1_r29_forecast.js` 12/12 (1/10 on base); `_bank.js` R5 #177–#222 46/46 (26/46 base); `_replay.js` 12/12. No old assertion changed; R28 forecast 12/12, 42/42, 5/5. C136 grep of every «با N٪» / «N درصد که» — runner-✓ verdicts kept. Suite 182/182; docs gate 14.

## Page-level proof (C137)
- C148/C168: A, B, C, D. No duplicate 🎯: A, C. C152: B, C. B29·D17, D4, D23: B. C121: B, C. A29-24: A. C170: unit only.

## Not done (C153 → runner arms)
1. Unanswered due-date confirm still closes with the shared dates line (dates' `dateAnswer`).
2. Mind card (T24 calibration) after a correct settle (s19) not checked at page level.
3. C120 question shows «۶.۵» (Latin point) from `fa()` in `approx28`.
4. dB1: a vague 🎯 got a due date through `bookItem26` plan path — not investigated.
5. B29·D2/C149 belongs to story.
