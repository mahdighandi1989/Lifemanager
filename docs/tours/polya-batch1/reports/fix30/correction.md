# FIX30 — correction fixer (F8 + TAIL_correction) hand-back

Branch `worktree-agent-a6cce3b0212081b00` (worktree), BASE30 5c7ce364. Not pushed, main untouched.

## Root cause (DECISIONS_R30 «Reading» 2)
F8 repeated for five rounds because the correction/stale engine read numbers digit by digit. «۲ میلیون و ۴۰۰»
was two numbers, so every compound correction became «۴۰۰ ⇒ ۷۰۰»: unrelated «۴۰۰/۲۰۰» tokens matched, and no
written expression that held the amount had the datum as an operand. The same reader showed «۸ میلیون» as «۸»,
read her acceptance «۸ میلیون و ۶۴۰» as two numbers, and treated «۸ برش» as the same quantity as «۸ میلیون».
A second root: a correction that names a quantity with an ordinal («میزِ دوم») bound to every equal digit.
A third: C142 named only «نمیشه/نمیاد», so each new conjugation fell outside the reader.

## Mechanisms (one reader, one proposal function)
1. `a38` `occs24` → `mag30` (+ `numPair30`, `runs25`, `mag27`): a compound amount is one quantity.
2. `fmtQ30`/`fmtV30`/`fmtRe25`/`exact30`/`uq30`: proposals in her scale, exact fractions (C161), one proposal per number.
3. `qual30Of`/`qualHit30` + `staleCore25` `Q30`/`each30`/`member30`: named quantity with an ordinal (C143/C198).
4. `a27` `CORR_PAIR30` (+ `selfCorr`): negated verb, number, same verb (any conjugation); `numOnly29`/`retractCheck`: the correcting sentence's verb never enters a record.
5. Tail: `chLine20` (D26-43), `retractApply` statement guard (D26-50, C88), `uq30` (B28·D15).

## Tests
`tests/test_tour1_r30_correction.js`: 9 corpus entries from whole-scenario replays (B nB3, C s23, A s04). All 9 are green on the
branch. They were red on BASE30: the base replay dumps show «۸ ⇒ ۸٫۶۴», «۴۰۰ ⇒ ۷۰۰», «۲۵ ⇒ ۲۶ … ۴۲ ⇒ ۴۸», «نشانهٔ اصلاح نبود» and «≈ ۱٫۸۳۳۳».
`test_tour1_r29_correction.js` 14/14. Five display assertions were changed with comments, per C161/B30·D8.
Corpus file: `tests/variants/CORPUS_R30_F8.json`.
