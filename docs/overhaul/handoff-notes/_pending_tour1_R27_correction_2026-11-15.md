# Tour 1 (Pólya), round 27: fixer «correction» (R2: C47, C48, C66, C67, C74) — handoff (2026-11-15)

Scope: R2 of `DECISIONS_R27.md` (the stale engine in a38 and retract). Docs: WORKLOG 138 / PROGRESS 135 on this branch (assigned 140 / 137 —
the gate rejects gaps, the coordinator renumbers at merge), HANDBOOK §10 row (2026-11-15) + §12 row 84, AUDIT_LOG, REMOVAL_CANDIDATES.
Tests: `apps/learning-architecture/tests/test_tour1_r27_correction.js` (runners' own turns replayed; fixtures `tests/fixtures/r27_correction/*.json`,
cases `tests/tour1_r27_correction_cases.js`) and `test_tour1_r27_correction_bank.js` (+ `tour1_r27_correction_bank.js`; VARIANTS_R27 R2 entries #64–#99).
Bank copy `tests/variants/VARIANTS_R27.json` — **other fixers: use it, do not re-add it.** The replay library `tests/tour1_r26_replay.js` takes `opt.dir`.

## Functions changed (exact)
- `a38_live.js`:
  - new: `negStrip48` (`A.liveNegStrip48`), `negated27` (used by `copyCands` / `sessCands` only), `fixVal` (wrapper) over the old body renamed `fixVal0` (the `D.parts` recursion calls `fixVal0`),
    `chgSpans27`, `datumKey27`, `ord27Of` (`A.liveOrd27`), `redoClear27` (`A.liveRedoClear27`, an afterTurn hook);
  - changed: `coreDiff` (negated part of the old quote stripped), `staleRecs` (records carry `at`, `mid`, `hmid`; form records carry their own `at`),
    `staleCore25` (opt `ord27`, `prev27`; inner `rootOf` follow-up for `u27`/magnitude, `derOf` with magnitude and `loc27`, `push` keeps `mag`, `newV` reads `prev27`,
    `dimOk` division rule, the ctx-zone branch checks `dimOk`, tier (ج) only in a sentence holding the datum (tier (د) unchanged), the
    «۱ ± درصد» factor, rounded proposals flagged `rd`), `runs25` («A×B (C)» parenthesised result), `numOccs` (a number before «²/³» is an operand),
    `fmtRe25` (`≈` for `rd`; `√N ≈ …` for an irrational square root), `staleMark` (passes `ord27`, `prev27`), `A.liveStale` (her redo clears),
    `A.retractMsg` and `A.liveRetract` (build `ord27`), `A.livePriorStale` (steps may carry `dep`).
- `a27_tour.js`: `retractCheck` (C48 negated part; `old`-based sameness; the «نقل از پیامِ فعلی» refusal only after the cross-session search and the
  same-value re-quote search), `CORR19b` (one more alternative: «X ⟨unit/noun⟩ (بود)? نه Y» without comma), `tok20` (Persian decimal «٫» between digits is
  part of the number).
- `a45_story.js`: one field only — `priorTurn25`'s call to `A.livePriorStale` now passes `dep: x.dep || []` per step (prior/story: keep it when you edit that line).

## Shared shapes touched (the WORKLOG 137 lesson)
- `tok20` no longer cuts «۴٫۵» into «۴» and «۵» — any token offsets read from `tok20` on a Persian decimal now span the whole number. No text length changed.
- `numOccs` now returns the base of «۱۵²» (it used to skip it). `A.liveRuns25` therefore parses `√(۱۵² + ۸²)`.
- `A.liveStale` items may carry `rd: true` (a proposal rounded to her own digits) — display it with «≈».
- `CORR19b` (`AS.CORR_RE`) matches more correction shapes; it is still a gate for the model's report, never a correction by itself.

## Contracts for the other fixers
1. **Writing order is dependency (C47/C66).** A record's time is its message's time (or the form record's own `at`). Do not add records to `staleRecs`
   without `at` when you know it; a record without time is never excluded by order, so it can still be asked about.
2. **Never rewrite a negated word** (`negated27`): a text that says «نه X» already states the correction.
3. **Proposals are recomputations:** never scale a number by the correction ratio; take the engine's `re` or ask.
4. **Prior ledger (prior fixer):** to have dependants with no expression marked (C47 second half), keep passing `dep` to `A.livePriorStale`.
   A step that refers to another only by words («همون مقدار») needs a `dep` link from the ledger reader (bank R27 #84, not built here).
5. **arith fixer:** bank R27 #71 («۲ میلیون و ۸۰۰ هزار ÷ ۸») needs the «N میلیون و M هزار» reading in a46; the stale engine then follows it.

## Not done (reported)
- C68 (accepting a proposal is a correction whose dependants get proposals) — not built; #98 checks only that the other marks stay.
- D27-24: form steps with no recorded time can still be asked about (no number); those of s37 are now excluded by their time.
- C27-23 «۱۰ پنل ⇒ ۱۲٫۵» (tier (د) «۱۰ = ۲ × ۵»; exact is 12): removing tier (د) broke nine entries of the R24–R26 banks, so it stays and this is reported.
- C27-23 step 2 («۱۳۶۰ وات», computed by the coach) and s23 «۱۰۰ دقیقه» (35 × 2.8 = 98 ≠ 100, and she rejected it herself): no written dependency.
- B27·D11 (📜 header «عروسی ۱۵ اسفنده (اصلاح شد ⇐ «۱۶ هفته …»)») and A27-14 (fragmented 📜 history) are 📜 rendering (story, a45) — not reproduced here.
- C25-15 (percent-of-population chain): unchanged since round 26.
