# DECISIONS — Pólya tour, batch 1, round 30 (page main 38ce2710)

Sources: `reports/round30{A,B,C,D}_handback.md`, `T/round30X/defects.md` and `PARTS.md`, the per-scenario findings they cite, and the
blocker count `T/../r30/block.py` (every failing scenario with its defect ids, from the four reports).
Everything in DECISIONS_R25…R29 (C1–C176) still binds; this file adds C177–C182 and the round-30 tail list.

## Results
| Group | Runs | PASS (strict) | S1 | S2 (≈, new + still) | E-mails |
|---|---|---|---|---|---|
| A | 21 | 1 (aA3) | 0 (A29-1 ×3 FIXED) | ≈14 (8 new) | 21/21 |
| B | 34 | 12 | 0 (B29·D11 FIXED) | 8 | 34/34 |
| C | 21 | 2 (pC2, oC1) + 11 PARTIAL | **1: C30-7** (aC1 p22 ✗ to the coach on a correct line; p33 ✓ on an unfounded remainder) — regression | ≈20 | 21/21 |
| D | 36 | 3 (dp1, dp3, aD1) | 0 (D29-1, D29-2 FIXED) | ≈15 (S2 in 9 runs) | 36/36 |
| **Total** | **112** | **18/112** (r29: 17/108, r28: 17/106) | **1 case-family (2 turns)** (r29: 9 cases in 5 families) | **≈57 (≈0.51/run)** | 112/112 |

Routing right on every turn (A 417, B all, C 450, D 422 judged turns). In every run the person reached a verified result or the exact
sticking point. All nine round-29 S1 cases are FIXED. Round-29 ids: A 18 FIXED / 2 CHANGED / 7 STILL; B 33 / 7 / 42; C 24 fixed, 6 changed,
the rest STILL; D 17 FIXED / 3 CHANGED / the rest STILL. My ruling C176 held in every group that reached it (A, B, C, D).

## Progress metrics (roadmap §22)
| Round | Runs | PASS | S1 cases (families) | S2 per run | New S1/S2 families | Repeat S1/S2 families | From merges / my rulings | «Not built» carried |
|---|---|---|---|---|---|---|---|---|
| 28 | 106 | 17 | 4 (3) | ≈0.55 | 4 | 10 | 2 | 9 |
| 29 | 108 | 17 | 9 (5) | ≈0.47 | 5 (F15–F19) | 10 | 6 | 8 |
| **30** | **112** | **18** | **1 (1: F2)** | **≈0.51** | **0** | **10** (F2 F4 F6 F8 F10 F11 F13 F15 F17 + loop) | **merges: 2 caught by the gate (1015b #12, r27_arith), 0 shipped; fixes that shipped a regression: 4** (C30-7 arith, D30-4 dates, B30·D1 and B30·D3 surface); **my rulings: 0** | 6 (list below) |

Families closed this round (no S1/S2 instance anywhere): F1 at S1/S2 level (S3 remains: A29-8, A29-11, A30-20), F9 at S2 (one S3 in B,
one label cut in A), F14 at S2, F16, F18 at S2, F19 at S2 (B30·D23 is S3).

**Reading — PASS flat for the THIRD round (17, 17, 18) ⇒ root cause and a change of METHOD (not of the bar), as §22 requires.**

1. **The S3 tail had no owner. This is the main cause.** Every fixer split since round 26 followed the S1/S2 families. Old S3 defects
   were never assigned, so every scenario that carries one fails, and PASS cannot move however many S1/S2 are fixed. The numbers
   (from the four reports):
   - 62 of the 94 failing scenarios fail ONLY on ids born before round 30;
   - 49 fail on one or two defects, held by 58 distinct ids;
   - D25-8 + D28-10 alone hold all ten oD1-family runs; B24·D16 (history arrows ⇐/→) sits in nine B runs; C28-21 in four C runs; D26-28 in four D runs.

   In the same three rounds S1 fell 4 ⇒ 9 ⇒ 1, and the round-29 families were really fixed (A 18 of 27, B 33, D 17). PASS is not a
   measure of those fixes; it is a measure of the tail. **Method change C177.**
2. **F8 (corrections) repeats for the fifth round.** Each fixer proves the shapes named in its brief. The runners then speak the same
   intent in a new surface form, and the engine misses it:
   - plural verbs «نمیشن/میشن» (C30-5);
   - a named quantity «میزِ دوم», «اتاقِ دوم», «گلدانِ دوم» (B30·D6, D30-8, A30-16);
   - compound amounts in a chat-only record (A30-7, C30-9, D30-7);
   - «همون N درست بود» after a correction (C30-16, D30-11);
   - a value that already sits in a ledger step (D30-6);
   - ranges (C29-15, D30-9, A30-11).

   The proof set is too narrow, not the code alone. **Method change C178** (a corpus from the runners' real sentences). The same holds for F6 (dates) and F2 (remainders).
3. **Four fixes shipped a regression that no gate saw:**
   - C30-7 (arith `remains29` takes a total from an unrelated earlier turn);
   - D30-4 («نه، شنبه نه — یکشنبه» booked on Saturday);
   - B30·D1 (strip register flips to «تو» for a «شما» user);
   - B30·D3 (taking back «نه» no longer brings the tool back).

   Each fixer's C137 replay checked the TARGET turn of each scenario, not the whole scenario. **Method change C179.**

The pass bar is unchanged. Nothing above lowers it.

### The S1/S2 families of round 30 (all repeat; none new)
| # | Family | Instances (S1/S2 unless marked) | Owner |
|---|---|---|---|
| F2 | remainders «می‌مونه / کم دارم / اضافه میاد / هیچی نمی‌مونه / N تا برای فردا»: **S1 C30-7** (total borrowed from an unrelated earlier number; correct line ✗ to the coach, unfounded line ✓); wrong «۷۵۰ هزار موند» (650) and «۲ میلیون و ۵۰۰ کم دارم» silent (C30-13); «از ۴۲ تا ۸ تا کم دارم» (7) as «داده» (D30-5); S3 A30-2, A30-9, B30·D11, D26-24 | arith |
| F4 | 🎯: a present/past fact made a 🎯 («الان مدیرم سرِ جلسه‌ست» A30-13; «تستِ ۱ غلط بوده» C30-19); two percents in one clause made one 🎯 / settled «شد» on half (C30-20, B30·D17); S3: Latin «۶.۵» (A30-14, B30·D4, D30-14), her «نشد» to the page's own C120 question unbound (B30·D5), «حدودِ N» settled without asking (C30-18), unanswered 🎯 due confirms return as 📅 plan asks (D30-3, C30-17), data clause inside the 🎯 text (A30-14), chat settles absent from calibration (A30-15) | forecast |
| F6 | dates: «آره، فردا و پس‌فردا» also books an old negated row (A30-3); a past act «۲۰ آبان رفتم بانک» closes tomorrow's plan (A30-6) or leaves no line (D30-16, B30·D21); «نه، شنبه نه — یکشنبه» booked on Saturday (D30-4, regression); booked 📌 vanish from «امروز» after their day (D30-15); S3: weekday/date disagree without «کدام یکی؟» (A30-4, B30·D20, C30-10, D30-13), a second act sharing an idiom gets no ask (A30-5, B30·D25, D30-12), «فردا بانک.» alone not asked (B30·D19, C30-14), ✏️ removes another act's ask (D30-17) | dates |
| F8 | corrections / proposals: see Reading 2 — A30-7, A30-10, A30-16, B30·D6, B30·D7, B30·D9, B26·D31, B29·D14, C30-2…C30-5, C30-9, C30-15, C30-16, C29-14, C29-15, C25-8, C25-15, C29-10, D30-6…D30-9, D28-14, D29-10; S3 A30-11, A30-24, B30·D8, D30-10, D30-11 | correction |
| F10 | moving a ledger step with dependants asks nothing in a chat problem (A29-28; D29-16 S3) — C124/C172 held in B, C | story |
| F11 | lines / ledger under the wrong problem: C30-11 (a second garden's prior ledger under the live problem), B27·D7, B28·D9, A29-19, A27-22, C27-19; S3 A30-18, D29-13, B29·D15 | story + prior |
| F13 | a system question after a data clause becomes «مسئلهٔ ۲ از ۲» (A30-1); D28-10 «این سامانه اصلاً … ساخته شده؟» (S3, holds 11 runs) | surface |
| F15 | 📜 breaks «…» sums at the ellipsis and marks every piece «نسنجیده»; her wrong «۱ + … + ۱۰ = ۵۰» shows no ✗ though the coach said ✗ (A30-8); S3 A30-9 (mod / an equation with an unknown / «یکی می‌مونه» under a sentence-wide ✓), C30-1 («a_2 = 2» defined term gets «نسنجیده»), C30-8 | story (with arith's export) |
| F17 | a sentence with another person's words rewrites her ledger step and labels it «به دستِ خودش» (D30-1); S3 a fixed step stores the whole sentence (A30-22, D30-2), a second problem with numbered steps gets no ledger without a model `prior` (A30-21, B30·D14) | prior |
| loop | after her «نه» a re-sweep rejects the tool with false reasons; «اشتباهی گفتم نه؛ همون بود» not read; the problem closes without the tool (B30·D3, regression); S3 taking back «نه، همون نیست» leaves sheet #102 open (A30-23) | surface |

### «Not built» carried into round 31
1. The `m2` ask: not reachable in any group (C102 made it rare). It stays, and it is not a defect.
2. «a√b» judged: C107 allows «نسنجیده», and that stays allowed.
3. C155, the mixed reading: not reachable in A, B, C or D. It stays a unit claim, and runners try the shape again.
4. D27-29, the practice ladder.
5. N7 #5, a raw ISO date in a step card: C28-22 was seen in C only.
6. T32 «long page»: not reachable in C's shapes.

## Clarifications (binding; continue C176)
- **C177 (process — the tail has an owner).** From round 31, the fixer split covers TWO lists:
  - **(a)** the S1/S2 families;
  - **(b)** the TAIL. Every defect id that, in the last round, sits in a failing scenario with at most two defects is assigned by name to one fixer, by the triage table `reports/fix30/tail_triage.md`.

  A tail id is closed only when the scenarios it held are re-run at page level and pass on that id. A tail id the fixer judges «not a page defect» or «needs a ruling» goes back to the coordinator in the hand-back, with evidence. It is never silently dropped. The progress table gets a new column «tail ids closed / assigned». (Root cause 1.)
- **C178 (process — real-sentence corpus).** For F2, F6 and F8, the proof set is no longer the brief's named shapes. It is a corpus of every sentence the runners actually wrote for that family in rounds 22–30, taken from `T/round*X/*/ai/` and the findings, with each sentence's expected page result per the binding rulings. The file is `apps/learning-architecture/tests/variants/CORPUS_R30_<family>.json`, built by an independent agent who does not fix code.
  - A fixer of F2, F6 or F8 makes the whole corpus green, or reports each entry it cannot satisfy with the reason.
  - An entry is never edited to match the code. A disputed expectation goes to the coordinator, who rules under C136. (Root cause 2.)
- **C179 (process — whole-scenario replay).** C137's page-level replay compares EVERY turn of each replayed scenario with its round-30 output: every 📜 line, every coach-line mark, every date row and every 🎯. It does not compare only the target turn.
  - Any change the fixer did not intend is listed in the hand-back as «side effect», with turn and quote. An unintended change on a line that was right is a regression and blocks the merge.
  - Groups and scenarios: every scenario of every group that shows the fixer's family or tail ids, plus the regression scenarios C30-7 (aC1), D30-4 (s35), B30·D1 (s12), B30·D3 (tB1). (Root cause 3.)
- **C180 (C30-7 — where a remainder's total may come from).** A remainder clause «M تا می‌مونه / کم میاد / اضافه میاد / کم دارم» is judged against the numbers in two places only:
  - the same sentence;
  - the problem's recorded statement, as in C156 — the live problem's statement, never an earlier turn's arithmetic and never another problem's numbers.

  If neither holds a total that the clause can be read against, the clause gets «؟ نسنجیده». Never ✓, never ✗.
  - Positive: «از ۵۰ تا … ۶ × ۷ = ۴۲، ۷ تا می‌مونه» ✗ 8.
  - Negative look-alikes from the runners: «۸ + ۶ = ۱۴ و ۲ تا می‌مونه برای داداشم» (aC1 p22) and «۵ × ۴ = ۲۰ تا، پس ۸ تا اضافه میاد» (aC1 p33) both get «؟ نسنجیده». Checked against A s06 p10/p11, B nB3 p6–p7, D tD3 s4/s5/s9, C aC1 p21/p32/p37: no verdict a runner judged correct changes.
- **C181 (D30-4, A30-3 — a negated day).** In «نه، X نه — Y» and «X نه، Y»:
  - X is never booked;
  - an old row carrying X is withdrawn, not confirmed by a later «آره»;
  - Y is asked or booked by C49 like any day she states.

  A later multi-day «آره، فردا و پس‌فردا» answers only the asks open in that turn.
  - Negative look-alike: «پنجشنبه نه، شنبه» answered with «آره» to a different ask (A s01 p43) must not book Thursday.
- **C182 (A30-6, D30-16, B30·D21 — a past act).** «<past day> رفتم/دادم/زدم …» records a past act: one 📜 line «کارِ گذشته — <day>», as in C166. It never closes a FUTURE plan or reminder, even one with the same verb and object, and it asks nothing.
  - Negative look-alike: «فردا میرم بانک» (open ⏰) followed by «۲۰ آبان رفتم بانک» — the ⏰ stays open.

## Round-30 tail (C177 list (b))
The 58 ids that hold 49 scenarios are mapped to owners in `reports/fix30/tail_triage.md` (independent triage, evidence path per id).
Top blockers: D25-8 (13 runs), D28-10 (11), B24·D16 (9), C28-21 (4), D26-28 (4), A30-9 (3), B27·D7 (3), U26 (3), B28·D15 (3), C26-18 (3).

## Owner bank (round-30 verdicts, summary)
| Group | Exist | Partial | Missing |
|---|---|---|---|
| A | most; 84 with A30-15 | 1, 8, 64, 65, 85 | 4 (sheet #101) |
| B | 12, 15, 46, 57, 58, 59, 66, 87, 88 | 11, 14, 16, 17, 18, 19, 47, 67, 89, 90, 91 | 13, 20, 45 |
| C | 22, 23, 25, 26, 27, 30, 48, 49, 60, 61, 68, 69, 94, 95, 96, 97 | 24, 31, 50, 93 | 21, 28, 29, 92 |
| D | 32–35, 37, 41, 53, 62, 63, 71, 73–75, 77, 80, 81 | 36, 38–40, 51, 70, 72, 78, 79 | 52, 76 |

The runners' new owner-like questions go to the bank as 98+.

## Fixer split (seven, one concern each; FIX29 isolation; C101 + C137 + C177 + C178 + C179 binding)
arith (F2 + S1 C30-7 + tail) · correction (F8 + tail) · prior (F17 + F11 prior side + tail) · dates (F6 + C181/C182 + tail) · forecast (F4 + tail) · story (F15, F10, F11 story side + tail) · surface (F13, loop, B30·D1 + tail incl. B24·D16, D28-10).

Merge order: arith ⇒ prior ⇒ correction ⇒ story ⇒ forecast ⇒ dates ⇒ surface. The families' tests are re-run after each merge, and the full gate once on the whole merge.
