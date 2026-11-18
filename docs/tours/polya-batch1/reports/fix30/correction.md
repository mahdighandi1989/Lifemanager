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

## Corpus F8 (85 entries) — page-level, from whole-scenario replays of the round-30 runs
- **Green (10):** F8-023, 024, 025, 026, 027 (B nB3); 035 (B nB2); 041, 042, 043 (D tD3); 064 (A s04). Negative look-alike F8-085 holds.
- **Partial (6):**
  - 028: the compound amount is replaced and its dependants are right, but the discount line reads as a fixed amount («۲ میلیون و ۴۶۰»). It is not re-derived as 10 % (C197) and there is no ask.
  - 030: «۴۲ ⇒ ۴۳» is right and the false 25/96/ledger marks are gone, but the remainder «۸ ⇒ ۷» gets no number.
  - 009: the reader and the statement are right, but no ledger proposal is made.
  - 036: 15.96 and 4.04 M are right; the shortfall «۱ میلیون» is missing and «۱۵٫۵۴» is listed twice.
  - 021: the sum «۶ میلیون» is right; the remainder «۲ میلیون» is missing.
  - 074: no ratio and the mean 11.4 is right, but «۱۳ − ۸» is not marked.
- **Not satisfied (reason):**
  - Take-back that cites the correcting message (011, 020, 040, 065, 068 and 069/A30-10, 070): the page does not map the cited correction back to the datum's original record.
  - Repeated corrections in a chat-only statement with a ledger (s23: 002, 004–008, 010; C30-2/C30-4): the registry chain is not built for that path.
  - Ranges (012, 029, 044; C199): not built.
  - Chat-only record sums and remainders (017, 018, 019; C30-9 pwC1): records were not reached.
  - C30-15 (016) implicit-tier dependants: unchanged.
  - 001: «۱٫۷۵ ⇒ ۱ و ۹ یازدهم» is still on the old 35 base.
  - 037/038: the 190⇒195 chain gives no current value.
  - 039/045: no shortfall proposal.
  - 071/072: the model sent no retract. Page-side autonomous reading needs a C136 ruling (F8-072 is her own result fix).
  - 083 (C200): not built.
- **Not checked at page level:** round-29 sentences (031–033, 046–057), A s04 060/063, A s01/s02 073/076, B nB1/dB1 079–081, pwA1 078, s35 077, pwC1 082.

## Whole-scenario replays (C179), base vs branch, every turn
Scenarios replayed: A s02, s04, s07; B nB3, nB2, oB1, pwB1, s17, s12, tB1; C s23, pwC1, aC3, s25, aC1; D tD3, tD1, s35, s36, dp2.
- **No change:** A s02 (A30-7 not reached: no retract from the model), A s07, B s17, s12 (B30·D1), tB1 (B30·D3), C s25, aC1 (C30-7), D s35 (D30-4), s36 (sys lines identical; the ✏️ result block changes as intended, D26-43).
- **Intended changes:** amounts in her scale and exact fractions everywhere (A s04, B nB3/nB2, C pwC1/s23, D tD1/tD3); compound dependants and proposals (B nB3/nB2, C aC3, D tD3); named quantity (B nB3 p17, D tD3 s33); plural reader (C s23 p23); B pwB1 duplicate removed (B28·D15); D dp2 statement no longer rewritten (D26-50).
- **Side effects:**
  - (1) D tD1 p8 «۵ ⇒ ۵٫۵ متر»: two new number-less asks «۱۸ میلیون، ۴ میلیون و ۷۰۰ … حساب شده بود؟». Not fixed. It is an ask, not a wrong number.
  - (2) B oB1 wake-up: the record header is now one exact window «۴ روز از ۷ بوده، نه ۵ قبل …» instead of two garbled pieces. This exposes a record text that was already garbled before this change.
  - (3) D tD3: after the 185⇒190 correction the 📜 prior line now resumes from step 2, because steps 2/4/5 are now stale, as intended.
  - (4) B nB2 15⇒18: «۵۷۰ هزار کم میارم» is now «دیگر برقرار نیست — بر ۱۵ هزار بنا بود» instead of «حساب شده بود؟», because the compound chain now links it.

## Tail
| id | scenarios replayed | result |
|---|---|---|
| B28·D15 | B pwB1 | closed (one proposal per number) |
| D26-43 | D s36 | closed. Base (page-built prompt block of p6): «حدس: «۲۸ میشه ۱۴٪. پس» (اصلاح شد ⇐ «پس»)، «کمه» (⇐ «جوابه»)». Branch: «حدس: «۲۸ میشه ۱۴٪. پس ۸ لیتر کمه» (اصلاح شد ⇐ «پس ۸ لیتر جوابه»)». The old side is the guess record's own earlier text. |
| D26-50 | D dp2 | closed (statement keeps her words) |
| U38 | B s17 | not done (replay shows no change; «ریاضی‌کردن» proposal path untouched) |

## Not done (verbatim)
1. Take-back through the same function when the model cites the correcting message (C160/C111 across take-back; A30-10/A30-11, C30-16, D30-11).
2. Ranges (C143/C199; C29-15, D30-9, A30-11).
3. Chat-only record sums/remainders in pwC1 (C30-9), and a remainder clause («۲ میلیون می‌مونه», «۱ میلیون کم دارم») as a dependant of a compound (C162).
4. Repeated corrections of one datum in the chat-statement + ledger path (C30-2/C30-4, s23).
5. C197 percentage discount re-derivation and asking when undecidable; C200 disputed value without a new one.
6. A30-7: no page-side correction without a model retract (needs a C136 ruling).
7. C30-15 implicit-tier dependants (54/12/52 in pwC1).
8. U38.
