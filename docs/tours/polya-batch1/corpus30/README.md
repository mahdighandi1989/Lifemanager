# Real-sentence corpus for F2 / F6 / F8 (ruling C178)

Built by an independent agent that does not fix code, from the runners' own turns in `T/round26X … T/round30X` (`<sid>/ai/pN.json`, the «# نوبتِ تازه» block; page lines read from the next prompt's history), `findings.md` and `defects.md`. Rounds 22–25 have no `ai/` prompts; their sentences recur in later replays. Exact repeats are merged (the `src` names the round-30 occurrence where the sentence was replayed); distinct surface forms are kept.

C178 names the destination `apps/learning-architecture/tests/variants/CORPUS_R30_<family>.json`; this agent does not edit the repo, so the files are here for the coordinator to copy.

## Fields
`id`, `family`, `src` (round/scenario/turn; D also gives the runner's step `sN`), `context` (minimum prior state; F6 entries carry the Jalali calendar used), `sentence` (her exact words), `expected` (from binding rulings C1–C188 and exact arithmetic only; `null` when the rulings do not decide), `ruling`, `verdict_in_round30` (held / failed / unknown, with the defect id when failed). Extra: `negative_lookalike: true` (C136 — must NOT trigger the family's reader), `needs_ruling` (the precise open question), `note`.

Some entries have both an `expected` (the decided part) and a `needs_ruling` (the undecided part); entries with `expected: null` are wholly undecided.

## Counts
| Family | Entries | held | failed | unknown | negative look-alikes | from round 30 | expected = null |
|---|---|---|---|---|---|---|---|
| F2 | 79 | 30 | 27 | 22 | 14 | 77 | 4 |
| F6 | 132 | 80 | 24 | 28 | 13 | 119 | 4 |
| F8 | 85 | 18 | 39 | 28 | 8 | 64 | 1 |
| **all** | **296** | **128** | **90** | **78** | **35** | **260** | **9** |

«held/failed» follow the round-30 evidence (page lines in the next prompt, the runner's findings, the group's defects); «unknown» means the round-30 evidence read here does not show the page's result for that turn (often the round-29 sentence or a turn whose page line is not in the prompt). Partial outcomes are booked under the first word (e.g. «held for the mark … (D30-2)»).

## Questions that need a ruling (`needs_ruling`)
- **F2-005** (round30D/tD3 p3 (s4)): C157 reads «نصفش» only when its antecedent is «the immediately preceding RESULT in the same message». Here the antecedent is a stated quantity («۸۴ متر پارچه»), not a computed result. Read (84/2 = 42 ✓) or «؟ نسنجیده»? Either way never a sentence-wide ✓ and never glued to the remainder clause.
- **F2-047** (round30A/s06 p13): C180 allows a total only from the same sentence or the live statement, «never an earlier turn's arithmetic». Is an earlier turn's DATUM («۴ میلیون داشتم», p11) also excluded (⇒ «؟ نسنجیده»), or may the page read 4,000 − 3,600 = 400 ✓ when this message is her fix of that earlier ✗ line (C8/C86)?
- **F2-064** (round30D/tD1 p23 (=round29D/tD1 p23)): First clause 18 − 12 = 6 ⇒ ✓ (decided). For «۴ + ۵ = ۹ … و ۳ تا می‌مونه» the sentence holds several candidate totals (18, 12, 6). The round-30 runner judged ✓ (12 − 9 = 3, PASS). Does C180 allow choosing among several totals of the same sentence, or must the page give «؟ نسنجیده» when the total is not unique?
- **F2-071** (round30B/aB4 p4): «سرها همون ۳۵ می‌مونه» states an invariant («stays 35»), not a remainder, and «۲ تا کم میشه» is a change per swap, not a shortage. Are these outside the remainder reader (no line), or C85 clauses to be judged? (Decided part: «۱۰۰ منهای ۹۴ میشه ۶» ✓.)
- **F6-031** (round30A/s01 p49): «بیمه رو بعداً» postpones a booked call without a day. Does the booking stay (nothing changes until a day is given), or is it withdrawn into a «کدام روز؟» row (C92)? No ruling covers a postponement without a day.
- **F6-050** (round30B/dB3 p20): A course's schedule («اولیش ۱ اردیبهشت») with no commitment verb of hers: is it «another person's schedule» (C19: no ask) or her own plan date (C12: ask «چهارشنبه ۱ اردیبهشت ۱۴۰۶ — درست است؟», the nearest future 1 Ordibehesht)? The runner (B30·D22) expected an ask.
- **F6-063** (round30D/tD4 p13): Are undated intents («یه روز باید … زنگ بزنم») open call plans for C117? If yes, «کدام؟» naming both; if not, nothing to close and no question.
- **F6-119** (round30A/s03 p20): The contest date is the organiser's schedule (C19: no ask), but «تا اون موقع تمرین می‌کنم» makes it the deadline of her own action (C34: ask «چهارشنبه ۱ اردیبهشت ۱۴۰۶ — درست است؟»). Which rule wins?
- **F8-028** (round30B/nB3 p14): The aunt's line «۲ میلیون و ۴۰۰ منهای ۲۴۰ هزار = ۲ میلیون و ۱۶۰» stores 240 as a bare number (10 % was in the sentence but not in the expression). C47 says the proposal is the exact recomputation of the STORED expression ⇒ 2,700 − 240 = «۲ میلیون و ۴۶۰»; the runner (B30·D7) expected 10 % re-derived ⇒ «۲ میلیون و ۴۳۰». Which?
- **F8-030** (round30B/nB3 p17): The stored expression «۶ × ۷» has no per-table structure. Is the page to propose 5 × 7 + 8 = 43 (and the slices remainder 50 − 43 = 7, C162), as the runner expected, or mark «۴۲» stale and ask without a number (C47: no stored expression for the split)?
- **F8-070** (round30A/s04 p27): A point value replaced by a RANGE («۱۲ میلیارد نه، از ۱۱٫۵ تا ۱۲٫۵»). C143 covers replacing a range as a unit, not a value becoming a range. Should the page propose range dependants (share 2.3 to 2.5 bn, 11.5/5 and 12.5/5), mark them stale and ask, or keep 12?
- **F8-083** (round30C/pwC1 p29): «X نیست» with no replacement Y: C88 asks which number only when X is absent; there is no ruling for a bare negation of a present value with no new value (cf. C71 for days: ask). Should the page mark X disputed and ask for the value?

## Method notes
- Every number in `expected` was recomputed exactly (fractions per C161: «۸۸ و ۸ نهم ≈ ۸۸٫۸۹», «۵ و ۱ سوم ≈ ۵٫۳۳», «۱ و ۵ ششم ≈ ۱٫۸۳», «۱۷ و ۷ نهم ≈ ۱۷٫۷۸», «۹ و ۱ سوم ≈ ۹٫۳۳», «۴۰ و ۱ سوم ≈ ۴۰٫۳۳», «۱ و ۴ یازدهم ≈ ۱٫۳۶»). Amounts are given in her own scale (C45).
- Proposals use the current value of EVERY corrected datum at that turn (C89), including accepted earlier proposals and take-backs (C160).
- Date entries use the page clock visible in the turn (e.g. «فردا» ⇒ the page's own date) and 1 Azar 1405 = Sunday.
- «Weekday and date disagree ⇒ one «کدام یکی؟» naming both» is the round-30 F6 expectation (dates Not-done 1, DECISIONS_R30 F6 S3); no C-number states that exact wording — it rests on the standing principle «where the text does not decide, the page asks» plus C12/C92. Marked with a `note`.
- Scripts: `scratchpad/corpus_tools/{extract,filt,f2,f6,f8,common}.py`; raw turn dump `corpus30/work/turns.json`.
