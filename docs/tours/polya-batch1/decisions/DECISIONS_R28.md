# DECISIONS — Pólya tour, batch 1, round 28 (page main 33f7de9f)

Sources: `reports/round28{A,B,C,D}_handback.md`, `T/round28X/defects.md` and `PARTS.md`, the per-scenario findings they cite.
Everything in DECISIONS_R25…R27 (C1–C83) still binds; this file adds R1–R7 and C84–C101.

## Results
| Group | Runs | PASS (strict) | S1 | S2 (new ids) | E-mails |
|---|---|---|---|---|---|
| A | 21 | 2 | 2 (A28-5, A28-40) | 21 | 21/21 |
| B | 30 | 11 | 1 (B28·D1) | 17 instances | 30/30 |
| C | 21 | 1 (+12 PARTIAL) | 1 (C28-13) | 9 | 22 |
| D | 34 | 3 | 0 | 11 | 35 |
| **Total** | **106** | **17/106** (round 27: 19/101) | **4, three families** | **≈58** | |

Routing was right on every turn except two opening turns of tD2 (D28-19). In every run the person reached a verified result or the
exact sticking point. All three round-27 S1 (D27-1, D27-2, D27-18) are FIXED in every group that has their shape.

## Progress metrics (roadmap §22 — first time; trend from round 25)
| Round | Runs | PASS | S1 (families) | S2 per run | New S2 families | Repeat S2 families | From merges | «Not built» carried |
|---|---|---|---|---|---|---|---|---|
| 25 | 92 | 13 | 2 (2) | — (not counted then) | — | — | — | — |
| 26 | 96 | 4 | ≈11 after re-rating (2) | — | — | — | 3 (WORKLOG 137) | — |
| 27 | 101 | 19 | 3 (1) | ≈0.45 | — | — | 2 (WORKLOG 145) | 📜 half of R6 (15 bank entries) |
| 28 | 106 | 17 | 4 (3) | ≈0.55 | 4 | 10 | 2 (D28-6, B28·D9 regressions) | 9 (list below) |

Rounds 25–27 were not counted this way at the time; their cells are reconstructed from the DECISIONS files and marked «—» where the
data does not exist. From this round on, every cell is counted from the defect lists.

**Reading:** S1 did not fall (3 ⇒ 4) and S2 per run rose. The cause is visible in the families: 10 of the 14 S2 families are
**repeats** of mechanisms the round-27 fixers reported as done (🎯 phrasings, idiom dates, date binding, C68, proposals, separate
problems, the bare question). Their unit tests passed on sentences the fixers chose; the runners' own sentences, in the live page,
failed. Two failures are not even partial: the move button that the history fixer built is not offered on misfiled lines (A28-33, 0
`.lp-dmv` in the DOM), and C68 did nothing in the prior ledger where it was reported built (A28-16). **Root cause in our process, not
in the requests:** a «done» claim was accepted on unit-level proof. Fix: C101 below — every fix is also proven through the page.
The pass bar is unchanged.

### The 14 S2/S1 families of round 28
| # | Family | Groups | New / repeat | Owner (fixer) |
|---|---|---|---|---|
| F1 | «N میلیون و M» read in one way only (S1 B28·D1, C28-13; C28-12, A28-9/10/11, D28-15) | A B C D | repeat (C63) | arith |
| F2 | a «… تا می‌مونه» clause glued to the sum (S1 A28-40) | A | new shape | arith |
| F3 | stale ✗ kept beside her fixed line in 📜 (S1 A28-5) | A | new (markOf27) | story |
| F4 | 🎯: phrasings, update, two forecasts, wrong settle, comparison outcomes, view state | A B C D | repeat (C53, C76, C77) | forecast |
| F5 | idiom dates asked with a false «امروز خودش جمعه است» | A B C D | repeat (C70) | dates |
| F6 | a date ask bound to the wrong act / booked without a yes / ✏️ into the past / ✏️ day from the edit day | A B C D | repeat (C49, C58) | dates |
| F7 | C68 acceptance: does nothing (A) or accepts a wrong base (D) | A C D | repeat (C68) | correction |
| F8 | proposals from the wrong number / equal digits / scaling; a fix of a result rewrites a datum or her quote | A B C D | repeat (C47, C66) | correction |
| F9 | «کارِ دیگری» over- and under-filing (a source of a datum, her own sentence, «X کرد: …») | A B C D | new (C57 mechanism) | story |
| F10 | move control not offered / destination missing / labelled «اصلاح» | A B C D | new (C78 capability) | story |
| F11 | a separate problem not registered, or merged into another ledger (D28-6 regression) | A B C D | repeat (C25-7′, A27-22) | prior + story |
| F12 | «۷ × ۸ = ۵۶ بود دیگه؟» opens prior work | A D | repeat (C56) | prior |
| F13 | a question about the system becomes the 🧭 destination / a chat problem | C D | repeat (C27-6) | surface |
| F14 | internal labels visible to her (C53, «maybe», «موعدِ … در موعدهای باز نیست») | A | new | surface |

### «Not built» carried into round 29
C68 in chat-only problems; the `m2` answer reader; ✏️ into the past; moving 🎯 and ledger steps; #233; #236 (facet record); s28 p4 /
C25-7′; D27-16 replay; D27-29 (not reproduced in A/C, half-seen in D).

## Root mechanisms for the round-28 fixers
- **R1 arith (S1 first: B28·D1 = C28-13, A28-40):** C84, C85; `m2` answer reader in `ST.arithAnswer`; «sqrt(…)» like «√»; «a√b ≈ c»
  نسنجیده; «A و N دهم» (D26-24); a ✗ shows every reading in her scale (A28-10, D28-15).
- **R2 correction:** C87, C88, C89 — the smallest fragment, never a datum by fixing a result (B28·D8), never her quote outside it (C28-2,
  A28-14); proposals only from recorded dependency with current values of every corrected datum (C28-14, D28-12/14, A28-38).
- **R3 dates:** C92, C93, C94. Start from `a41_practice.js` ~3298: an idiom row that reaches the `amb` branch without `free` falls into
  the «امروز خودش {wd} است» template — find why `free` is lost (all four groups, three weekdays). Also «زنگ زدم» (A27-19), D28-7 (a plan
  is never «انجام شد» at birth), D28-4 (a payment is its own act), D28-22.
- **R4 forecast (new fixer; 🎯 leaves story):** C90, C91; the 🎯 view agrees with the settled state (A28-35); no settle ask from a
  correction (D28-9) or a past confidence (A28-20).
- **R5 story/history:** F3 (C86), F9 (C96), F10 (C95), F11 together with prior (C97); calculations the model did not report still reach
  📜 from her own text (A28-12); a side problem never receives the main problem's lines (A28-13, A28-27).
- **R6 prior:** C98 (F12), D28-6 regression (a new problem never extends another ledger), B28·D9 (her fix of a ledger step lands),
  C27-21 (a fixed step drops its stale reason).
- **R7 surface (loop + classify):** C99 (F13, D28-10, C27-6), C100 (F14), D28-19 routing of a life-plan opening, A28-32 identical tie
  names, D28-29 / C28-6 register guard, B27·D16 frame-word reply.

## Clarifications (binding; continue C83)
- **C84.** «N میلیون و M» (and «N هزار و M»): every operand is read in both scales (M units, M of the next lower named scale). If exactly
  one combination makes her line right, it is ✓ with that reading. If two make it right, the page asks once («۸۰۰ هزار یا ۸۰۰ تومان؟»)
  and reads her answer (`m2`). If none does, ✗ with each reading's exact value in her own words («۱۱ میلیون و ۹۰۰ یا ۱۲ میلیون و ۷۰۰»).
- **C85.** «N تا می‌مونه / باقی می‌مونه / اضافه میاد / کم میاد» starts its own statement; it is never an operand or result of the sum
  before it.
- **C86.** A ✓/✗/؟ in 📜 is computed from the line's current text. When she fixes a line, the old mark moves into that line's history.
- **C87.** C68 holds wherever a proposal was shown (ledger, chat-only, live). Acceptance rewrites a step only if every base value of the
  proposal is current; otherwise the page names the stale base instead of rewriting.
- **C88.** A correction «X نیست، Y» changes the occurrence of X it names, nothing else. If X does not occur in the corrected record, the
  page asks which number. Fixing a result never changes a datum; her quote outside the replaced fragment stays byte-exact.
- **C89.** A proposal is an exact recomputation along recorded dependency with the current value of EVERY corrected datum. Scaling a
  number by the ratio of a correction is never a proposal.
- **C90.** One 🎯 per future outcome with a stated confidence: «N درصد» with مطمئن / احتمال / فکر کنم / می‌دم / شانس anywhere in the
  clause; a bare «N درصد.» answering the page's «چند درصد؟»; «تقریباً / خیلی مطمئنم» without a number ⇒ ask the number once.
  A new number for the same outcome updates that 🎯 with history. «A … N٪ و B … M٪» makes two 🎯, each with its own text. The text
  strips the counter and lead words.
- **C91.** A 🎯 is settled only by a sentence reporting THAT outcome. Numeric outcomes are judged by the numbers («پیش‌بینیم ۱ بود، شد
  ۳» ⇒ نشد; «۱۸ شدم» against «بالای ۱۷» ⇒ شد; «شد ۳ تا» against 4 ⇒ نشد). A correction, a past confidence or an unrelated sentence
  never settles and never asks «شد یا نشد؟». Several candidates ⇒ «کدام؟». A settled 🎯 leaves the open list in every view.
- **C92.** Date asks are per act. «X نه، Y» moves only the act in its own clause. A pending ask is booked only by a yes to it or her
  restating its day (C49). An idiom without an exact day ⇒ «کدام روز؟» with no suggested day and no «امروز …» sentence; such a row is
  answered only by an explicit day given in reply to it.
- **C93.** ✏️ that puts a day in the past ⇒ the page asks («این روز گذشته — کدام روز؟») and keeps the booking until she answers. A
  relative day in an edited sentence is computed from the day the sentence was said.
- **C94.** The past tense of the act's verb («زنگ زدم», «خریدم», «رفتم») closes the act. A new plan is never «انجام شد» at birth.
- **C95.** Every line under a problem in 📜 (including «کارِ تو» lines), every 🎯 and every ledger step offers «↪». The destination shows
  the moved line with its undo. The history label is «جابه‌جا شد», stamped with the page clock.
- **C96.** «کارِ دیگری» only when another person is the doer of the calculation or claim («داداشم حساب کرد / کرد: …»). The source of a
  datum («فروشنده گفت ۱۲٪», «استادم میگه …») is a datum of her problem with a source label. Her own sentence that mentions a helper stays
  hers.
- **C97.** A problem she calls separate («جدا», «یه مسئلهٔ دیگه») or a statement with its own unknown gets its own record and its own
  ledger. It never becomes steps of another ledger.
- **C98.** A bare question about a calculation («… بود دیگه؟») never opens prior work, at an opening or mid-chat (C56, both groups).
- **C99.** A question about the system itself is never a problem's 🧭 destination and never makes a chat problem.
- **C100.** Internal labels (round or C numbers, English words, «… در موعدهای باز نیست») never appear in her view.
- **C101 (process).** A fix is proven three ways: (a) a red-first test from the runner's own turn, (b) every bank entry for that
  mechanism, and (c) a page-level replay through the real harness in which the defect was seen, checking the DOM or the view the runner
  saw (for example, that the move button exists on a misfiled line, or that the 🎯 view shows the settled state). A «done» claim without
  (c) is reported as «unit-only», and the coordinator does not count it as done.

## Owner bank 54–63 (first verdicts)
| # | Verdict |
|---|---|
| 54 | partial — a yes that books names the item; a yes that binds nothing is silent (A), «ثبتش کن» booked the wrong thing (D28-16) |
| 55 | partial — «🎯 دفترِ پیش‌بینی» exists; a settled 🎯 still shows open (A28-35) |
| 56 | partial — D yes; A: the tie shows two identical names (A28-32) |
| 57 | exists (B nB1 c8, D) |
| 58 | partial — D yes; A28-1 moves another act; B: the new day is not asked |
| 59 | partial / missing — no next-year drift in B; ✏️ into the past goes to next year (D28-28) |
| 60 | exists (C) |
| 61 | partial — C28-8, B28·D12, A28-29 |
| 62 | partial — سرِ برج / آخرِ سال / عید right; بعد از عید / وسطِ ماه wrong (F5) |
| 63 | exists (D); stale mark after her fix (A28-5) |

New owner-like questions 64–70 (from D) and the runners' lists, to add to the bank: «پیشنهادِ ساخته از عددِ غلط را قبول کردم — گامم با
همان غلط بازنویسی شد؟»، «فروشنده گفت … دادهٔ من است یا کارِ دیگری؟»، «ثبتش کن دقیقاً چه چیزی را ثبت کرد؟»، «دو پیش‌بینیِ یک جمله دو تا
ثبت شد؟»، «شد ۳ را چه خواند؟»، «✏️ ِ روزِ گذشته چرا سالِ بعد شد؟»، «جمله‌ای که هیچ‌جا ثبت نشد کجاست؟»، «خطی که جابه‌جا کردم کجاست و چطور
برگردانم؟»، «کدام پیش‌بینی‌هایم به‌خاطرِ شکلِ گفتنم ثبت نشد؟».

## Fixer split (seven, one concern each; FIX27 isolation; C101 binding)
arith (R1) · correction (R2) · dates (R3) · forecast (R4) · story (R5) · prior (R6) · surface (R7). Merge order: arith ⇒ correction ⇒
prior ⇒ dates ⇒ forecast ⇒ story ⇒ surface; the families' tests re-run after each merge, the full gate once on the whole merge (WORKLOG 137/145: clashes show only after merging).
