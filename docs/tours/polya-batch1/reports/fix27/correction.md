# Fixer «correction», round 27 — hand-back (branch worktree-agent-a16e384ca599e7586, head 02071946)

Commits:
- 272b182d — engine checkpoint.
- 47ff897c — tests, bank and docs.
- b7b718f5 — docs.
- 02071946 — final magnitude rule; bank #71 reported.

Numbering used: WORKLOG 138 / PROGRESS 135; the coordinator renumbers them to 140/137.

## Root causes and fixes
**a38_live.js (stale engine)**
1. **Equal digits read as dependency** (B27·D12, C27-14, D27-12, D27-24):
   - Every record carries the time of its message (`staleRecs`, `ord27Of`, `chgSpans27`).
   - A record written before the datum is neither a root nor a candidate.
   - The correcting message and anything after it are never stale and never an operand.
   - An untouched equal digit in a ✏️ bubble is not the datum.
   - Units are inferred from her writing, and a magnitude word is part of the value.
2. **Proposals were not exact recomputations:**
   - D27-11: dividing by a physical quantity no longer gives that unit to the result.
   - D27-30 / C67: «√(۱۵² + ۸²)» is read and the proposal shows «√۲۰۸ ≈ ۱۴٫۴۲».
   - «A×B (C)» is read as a written result.
   - B27·D8: an operand made stale by an earlier open correction enters with its new value (`prev27`). The new `fixVal` refuses a text
     replacement that would break a written equation; the old body stays as `fixVal0` (REMOVAL_CANDIDATES).
   - A «میلیون» result needs a «میلیون» operand.
3. **Derived-of-derived** (A26-15):
   - `derOf` is magnitude-aware.
   - A «۱ ± درصد» factor in the same sentence counts.
   - Ledger steps with a `dep` on a stale step are marked (`A.livePriorStale`; one field added in a45 `priorTurn25`).
4. **Her redo clears the mark** (B27·D6): `redoClear27`.
5. **A27-8:** no copy-ask for a text that negates the old value (`negated27`).

**a27_tour.js (retract)**
- **C48 / A27-9:** `negStrip48` ignores the negated part of the old quote; «same value» is judged by the model's `old`.
- **C27-26 / C74:** `CORR19b`/`CORR20` read «X بود نه Y» without a comma, and «آهان، اصلاً ۵ نفر بودیم».
- **`tok20`:** reads «۴٫۵» as one number.
- **D27-16:** the «نقل از پیامِ فعلی» refusal comes only after the other searches.

## Tests
- `test_tour1_r27_correction.js`: 12 replay cases (fixtures in `tests/fixtures/r27_correction/`). 10 failed on BASE27; the two that passed
  are the negatives. Now 12/12.
- Bank R2 #64–#99: 34 pass.
  - #71 not satisfied: «N میلیون و M هزار» is arith's reader.
  - #84 not satisfied: a word-only dependency needs the prior reader.
- One R26 assertion widened (C47): pwB1 ledger step 5 is now stale through its dep.
- Suite: 149 tests one at a time. All nine correction files re-run green on the final build. The other 140 passed on the build just before
  the final change and were not re-run.

## Not done
- C27-23 «۱۰ پنل ⇒ ۱۲٫۵» comes from tier (د); removing tier (د) breaks nine older bank entries.
- C68 is not built.
- D27-16: not reproduced in the recorded run; fixed from reading the code, with no replay test.
- D27-24: a form step with no recorded time can still be asked about.
- B27·D11 and A27-14 (📜 rendering) belong to story.
- C25-15 is unchanged.

Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R27_correction_2026-11-15.md`.
