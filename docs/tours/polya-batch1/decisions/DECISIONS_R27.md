# Round-27 decisions — ROOT MECHANISMS (main session; binding)

Round 27 ran on main 253b357a (the seven round-26 fixers, gate 41 green). Four runners on Opus re-ran every round-26 scenario with
the explicit arms T1–T12, the three compensations of `COMPARE26_result.md` (line-by-line 📜 match, booking a defect in every scenario
that shows it, named arms) and the owner bank 1–53. Reports: `reports/round27{A,B,C,D}_handback.md`; per-scenario findings under
`findings/round27X/`.

**Status of the evidence.** All defects are runner-reported and NOT independently verified. Every fixer reproduces a defect as a
failing test before touching code. A defect that does not reproduce is written down as «not reproduced» in the fixer's report, never
silently dropped.

## Results
| Group | Runs | PASS (runner, strict: no defect at all) | S1 | S2 scenarios | E-mails |
|---|---|---|---|---|---|
| A | 21 | 2 | 0 | 11 | 21/21 |
| B | 28 | 5 | 0 | 13 S2 defects | 28/28 |
| C | 20 (+1 branch run) | 3 (+5 PARTIAL) | 0 | 12 | 21 (one correction) |
| D | 32 | 9 | **3** (D27-1, D27-2, D27-18) | 9 | 32/32 |
| **Total** | **101** | **19/101** (round 26: 4/96) | **3, one family** | | |

Routing was right on every turn in all four groups (A 316/316, B all, C 290/290, D 0 wrong).
In every scenario the person reached a verified result or the exact sticking point.

## Severity made uniform
- **D27-18 is S1-a:** «۴ و ۶ میشه ۲۴» in a multiplication context was read as a sum and shown ✗. That is correct work shown ✗.
- **D27-1 is S1-b:** her «آره، اون ۱۴ رو گرد کردم» was bound to her brother's «۱۳/۱۲ = ۱», and that false identity was stored as
  «approximate and correct».
- **D27-2 is S1-b:** a hypothetical question was read as a dispute. The page's re-check then declared «۱۷۰۰ ثانیه = ۱۷ دقیقه» correct;
  the exact value is 28.3 minutes.
- **D27-23 stays S3:** «۴ از ۲۶ میشه ۱۵٪» is a correct rounding shown ✓ where C25 asks for «؟». It does not mislead.
- **A wrong line the page leaves silent stays S2**, as in round 26: B27·D9, C27-25, A27-3, D27-5.

## Better than round 26 (evidence in the reports)
- **The S1 count went from two families to one.** Every round-26 S1 is closed in every group that exercised it: A26-1, U1/U2,
  D26-16, D26-18, C26-9, C26-10, C26-26 and C26-31. No correct work was shown ✗ and no wrong work ✓ in groups A, B and C.
- **Prior work:**
  - per-step verdicts, fixes in the same turn and dependants;
  - a dispute re-checked once, and the take-back of a dispute (T5 PASS in A, B, C, D);
  - second-report merges, and third-report merges in B, C and D.
- **Territory loop:**
  - a real tie is asked naming both (T1, first half);
  - a piece after closure gets its own sheet and the closed problem stays closed (T2);
  - after-closure wait rows.
- **Corrections:**
  - the direct datum and its first dependants;
  - «۵ ⇒ ۴» in s07, oC1 and arD2;
  - correction with a question in tA1 and s07.
- **Dates:**
  - «جمعهٔ بعد» on a Friday and on other days (T6 PASS in B, C, D);
  - «باشه» in C and D;
  - every date was asked in C.
- **Dossier:** C26-1 and C26-12 (one problem, one record) are fixed in most scenarios, and «حل شد» appears only after the look-back.
- **Age and register:** age, child safety and register in messages are better (C26-22, C26-28, D26-53).

## Root mechanisms (for the round-27 fixers)

**R1 — ARITHMETIC READER (a46). One S1 family; many unread shapes.**

Defects:
- A27-3, A27-6, A27-13 (coach side), A27-16, A27-18, A26-20 «ذرع»;
- B27·D9, B27·D13, U26 «…»;
- C27-13, C27-22, C27-25;
- D27-1, D27-5, D27-6, D27-7, D27-18, D27-23, D26-24 (aD4).

What must change:
- **Fix the S1 first.** An operator word that admits two readings must never give ✗ while one of the readings fits (C40).
- **«گرد کردم» binds only to a line waiting in the C25 «؟» state** (C43).
- **Read the new shapes:**
  - «A ⟨unit⟩ در B ⟨unit⟩ = C ⟨unit⟩»;
  - «N تکه‌ی M متری = K»;
  - «N تا M تا میشه K»;
  - «سه تا A میشه B»;
  - «N میلیون و M»;
  - an ellipsis sum of an arithmetic progression (C41, C42);
  - a running sum with a unit.
- **Glued fractions:** «۱۳/۱۲ = ۱» stays an identity under C26. It is never merged into a «÷» quotient.
- **Display the exact value in her own scale** (C45). Never «۳۵۳۱۶۰ هزار» or «۶۰۰۰ هزار».
- **A rounded percentage takes the C25 question** (C44).

**R2 — CORRECTION ENGINE (stale marks and proposals).**

Defects:
- A26-15 (s04), A27-8, A27-9, A27-14;
- B27·D6, B27·D8, B27·D11, B27·D12;
- C25-15, C27-14, C27-23, C27-26;
- D27-11, D27-12, D27-16, D27-24, D27-30.

What must change:
- **Stale marking follows dependency, never equal digits** (C47).
- **Proposals:**
  - recompute exactly from the stored expression;
  - with no expression, mark the number stale and ask, with no proposal;
  - never replace text into an equation.
- **Dependants:** derived-of-derived numbers are marked stale too.
- **Her redo with the corrected value clears the mark.**
- **«X نه Y» corrects even when the old quote holds both numbers** (C48).
- **A correction plus a question:** apply the correction, then hand the question to the coach (C48).
- **The ✏️ copy-ask never rewrites a negated word.**
- **The correction header states the change exactly as made.**

**R3 — DATE-ASK ENGINE (the largest family this round).**

Defects:
- A27-1, A27-2, A27-7, A27-10, A27-15, A27-17, A27-19, A27-20;
- B27·D1, B27·D5, B27·D10;
- C27-1, C27-2, C27-5, C27-11, C27-17, C27-27;
- D27-4, D27-21, D27-22, D27-29, D27-32;
- U50.

What must change:
- **A yes binds only to the newest pending ask** (C49):
  - a yes means «بله/آره/باشه/ثبتش کن», including a «باشه، …» with more text after it;
  - a yes to a non-date question books no date.
- **When an ask lapses** (C49):
  - it lapses on its date, or when she reports the act done;
  - a lapsed ask is never re-asked with a shifted or next-year date;
  - a relative day stays anchored to the day she said it.
- **Negated days:** a negated day is never booked, offered or taken as an answer elsewhere (C51).
- **A ✏️ of the day** re-derives the date and asks once for the new day. The old ask closes as «replaced» (C58).
- **Forbidden triggers** (C19 and C35, restated; none of these may raise an ask):
  - a count or narrative («دو روز», «هفته‌ی بعده» in a greeting);
  - today's own weekday;
  - the problem's wording;
  - the page's own schedule;
  - a conditional;
  - other people's plans.
- **Written dates** such as «۱۴۰۵/۹/۱۵» are read.
- **Idiom dates** «سرِ برج / آخرِ سال / عید / بعد از عید» are read (C50).
- **One commitment makes one record:** 📌 with its ⏰ attached (C52).

**R4 — PRIOR WORK (a45).**

Defects:
- A27-13, A27-21;
- B27·D2, B27·D3;
- C25-7 (pC1 p1, s28 p4), C27-3, C27-21, C27-24;
- D26-11 (dispute by meaning), D27-2 (S1), D27-15.

What must change:
- **A worked step at opening fires C7** (C56). This includes one relation with a computed value, or «خودم حساب کردم» plus a relation.
- **Every later report merges, before or after closure** (C56). It never replaces the ledger.
- **A hypothetical question is neither a dispute nor a correction** (C46).
- **A re-check recomputes; it never trusts.**
- **A dispute by meaning is read as a dispute.**
- **The stage moves forward when she reports her result.**
- **In 📜, a ledger step keeps its kind.** A step is never shown as «برنامه» and a sticking point never as «حدس».
- **A fixed step drops its old reason.**
- **The resume question never asks for a piece she already reported.**

**R5 — FORECASTS 🎯 (a story-layer family).**

Defects:
- A27-11, A27-12;
- U49 (B), C27-20;
- D27-13, D27-14, D27-31.

What must change:
- **Any number of confidence attached to a future outcome creates a 🎯 at once, under the live problem** (C53).
- **A clear outcome that matches exactly one open 🎯 settles it.** If two could match, the page asks (existing behaviour).
- **«حل شد» is never the outcome of a 🎯** that is not about solving.
- **The 🎯 text excludes a glued counter word.**

**R6 — MULTI-PROBLEM FILING AND 📜.**

Defects:
- A27-4, A27-5, A27-12, A27-14, A27-22;
- B27·D7, B27·D14, B27·D15, B24·D16, B24·D18;
- C26-1 (s21, s25), C26-29, C27-18, C27-19;
- D26-2, D27-8, D27-9, D27-17.

What must change:
- **Each problem's 📜 window holds only its own lines:**
  - it starts at its own first statement;
  - a third problem raised mid-way gets its own record;
  - a practice plan goes to the practice dossier.
- **Return by naming binds from the same message, with no lag** (C30). This includes a short name such as «مهره‌ها».
- **Not problems:**
  - questions about the page;
  - a restated problem;
  - a practice report;
  - a birth sentence.
- **Someone else's arithmetic is filed as «کارِ دیگری»** (C57).
- **The page's ✓/✗/؟ is shown beside her line in 📜**, so 📜 and the record speak with one voice.
- **One arrow convention, chronological order, and no duplicate «برنامه» lines.**
- **She can move or undo a misfiled 📜 line** (owner bank 42; quarantine: the original stays in history).

**R7 — TERRITORY LOOP (a44).**

Defects:
- B27·D16, B27·D17, B27·D18, B27·D19, U59;
- C27-6, C27-7, C27-28;
- D26-21, D26-22, D27-27, D27-28.

What must change:
- **After a tie ❓, a reply naming one candidate by any distinct part of its name is her choice** (C54).
- **A clear single best fit is not asked as a tie.**
- **A reply where only frame words overlap is asked about (C20, C2)**, never silently marked «answered» and never rejected.
- **A take-back of «نه» closes the sheet.**
- **The sheet list is in order.**
- **A meta question is not credited as «گذر از مرحله».**
- **The context line names the turn's question, not «پیش‌نیاز».**
- **A piece after closure gets an «امروز» line, and its 🧭 destination is a real one**, not a meta sentence.

**R8 — REGISTER, QUOTES, NAMES, SMALL MECHANISMS.**

Defects:
- B27·D4 (S2), U37, U24, U35, U36, U48, U52;
- C27-4 (S2), C26-32 (second follow-up), C26-33;
- D26-40 (static labels), D27-25, D27-26, D27-33, D26-30/42/47 (practice cadence);
- A26-19, A26-25 (mind card).

What must change:
- **Her own words are byte-exact everywhere she reads them back** (C55): bubble, statement, lesson, quote. This includes ZWNJ.
- **Only page-authored text goes through the register layer.** Static labels follow the register too.
- **Bare first names are shown as «[نامِ شخص]»** in titles, 🧭 and «امروز» (C22, C38).
- **No raw id or internal marker («(prc)») appears in her bubble.**
- **No u0 question after «حل شد».**
- **The second follow-up says «open it», never «build».**
- **C26-33** (typed plan lost at a refused gate): reproduce in pC1's form path.

## Clarifications (binding; continue the numbering of DECISIONS_R26)
Principle for all, as before: where the text itself does not decide, the page asks; no number or convention is invented.

- **C40. An operator word with two readings is never ✗ if one reading fits.**
  - «A و B میشه C» is read as a sum first (C28).
  - If the sum fails and the product gives C, the page asks «ضرب کردی؟».
  - If neither gives C ⇒ ✗.
  - This is the C24 rule applied to word operators.
- **C41. These are products, like «ضربدر» (C28):**
  - «A ⟨unit⟩ در B ⟨unit⟩»;
  - «N تکه‌ی M ⟨unit⟩ی»;
  - «N تا M تا»;
  - «سه تا A».
  - A unit squared on the result («مترمربع») is the product's unit and is not a factor.
- **C42. An ellipsis sum is computed exactly when it is an arithmetic progression.**
  - The progression must be fixed by the first two terms and the last («۱ + ۲ + … + ۲۰», «۱ + ۳ + … + ۱۹»).
  - The sum is then exact arithmetic, not a convention: «۱ + … + ۱۰ = ۵۰» is ✗.
  - Any other ellipsis stays «نسنجیده» (C17).
- **C43. «آره، گرد کردم» binds to the one line in the C25 «؟» state.**
  - If several lines wait, the page asks «کدام؟».
  - It never binds to a fraction identity (C26) or to a line by someone else (C57).
- **C44. A percentage, ratio or decimal written as an integer or short decimal with no approximation word**, which is the rounding of
  the exact value, takes C25's question. Example: «۴ از ۲۶ میشه ۱۵٪».
- **C45. The page writes exact values in her own scale and unit.**
  - If she wrote «۳۵۳ هزار», the page writes «۳۵۳٫۱۶ هزار».
  - Otherwise it uses the largest scale word that keeps the integer part ≥ 1: «۶ میلیون», never «۶۰۰۰ هزار».
- **C46. A hypothetical question about her work is not a dispute or a correction.**
  - Examples: «اگه … بود چی؟», «یعنی اینم درسته؟».
  - The ledger does not change; the coach answers.
  - A re-check is always a recomputation: a verdict moves to ✓ only when the exact value equals hers under C9/C16.
- **C47. A number is stale only if the record shows it built from the corrected value.**
  - The record must show an expression containing the value, or a ledger step that depends on it.
  - Equal digits elsewhere are not dependency.
  - A proposed new value is the exact recomputation of the stored expression. With no stored expression, the page marks it stale and
    asks, without a number.
  - Proposals are never made by text replacement.
- **C48. Corrections.**
  - «X نه Y» and «Xایم نه Y» correct Y ⇒ X, even when the old quote holds both numbers.
  - A correction and a question in one message: the correction is applied and the question goes to the coach. Neither is refused.
- **C49. A yes («بله/آره/باشه/ثبتش کن», alone or with more text) answers only the newest pending ask under the page's last reply.**
  - Older asks are not booked by it.
  - An ask lapses when its date passes or when she reports the act done. A lapsed ask is closed, never re-asked with a new date.
  - A relative day («فردا», «جمعهٔ بعد») is anchored to the day she said it.
- **C50. Idiom dates are calendar facts.**
  - «سرِ برج» = day 1 of the next Jalali month.
  - «آخرِ سال» = the last day of Esfand of the current Jalali year.
  - «عید» = 1 Farvardin.
  - «بعد از عید» ⇒ the page asks which day, anchored on 1 Farvardin.
  - Each goes through «… درست است؟» (like C37).
- **C51. A negated day is never booked, offered or used as the answer to another ask.**
  - Examples: «پنجشنبه نه، شنبه», «این جمعه نه».
  - The day she gave instead takes the ask.
- **C52. One commitment makes one record.** A follow-up ⏰ attaches to its 📌 plan; it is not a second item.
- **C53. A number of confidence attached to a future outcome creates a 🎯 at once, under the live problem.**
  - Examples: «N درصد مطمئنم», «احتمالش N٪ه».
  - Vague words still follow C37.
  - A clearly reported outcome that matches exactly one open 🎯 settles it; otherwise the page asks «کدام؟».
  - «حل شد» settles only a 🎯 about solving.
- **C54. Tie answers.**
  - After a tie ❓, a reply naming one candidate by a distinct part of its name is her choice.
  - When exactly one candidate fits clearly, there is no tie ❓.
- **C55. Her own text is byte-exact wherever the page shows it back.** This includes letters, ZWNJ and quotes. The register layer
  rewrites only page-authored text, including static labels.
- **C56. Prior work.**
  - A worked step at opening (a relation with a computed value) fires C7, even when it is the only step.
  - Every later report merges into the ledger, before or after closure.
- **C57. Arithmetic or results she quotes from another person are filed as «کارِ دیگری».**
  - Example: «داداشم حساب کرد …».
  - They are checked and shown, but never booked as her result or her step.
  - Names follow C22/C38.
- **C58. A ✏️ of a day or date re-derives the date and asks once for the new one.** The old ask is closed as «replaced» and never
  reported as «تاریخی ثبت نشد».

## Owner bank 1–53 (round 27)
| # | verdict | # | verdict | # | verdict | # | verdict |
|---|---|---|---|---|---|---|---|
| 1 | نیمه (A27-9) | 15 | نیست (#103) | 29 | نیست (#101) | 43 | هست |
| 2 | هست (A27-22) | 16 | نیمه (B27·D15) | 30 | نیمه (C27-20) | 44 | نیمه (A27-11/12) |
| 3 | هست | 17 | نیمه (بی تاریخ) | 31 | نیمه (C25-7) | 45 | نیست (فقط هم‌پوشانیِ واژه) |
| 4 | نیست (#101) | 18 | هست | 32 | هست | 46 | نیمه (B27·D15) |
| 5 | هست | 19 | نیمه | 33 | هست | 47 | نیمه (🧭/🔭 دو معنا) |
| 6 | نیمه (#102) | 20 | نیست (#104) | 34 | هست | 48 | هست |
| 7 | هست | 21 | نیست (#102) | 35 | هست | 49 | هست (C27-17) |
| 8 | هست (A23-8) | 22 | هست | 36 | نیمه (D27-2) | 50 | نیمه (C27-14, C27-23) |
| 9 | هست | 23 | هست | 37 | هست | 51 | نیمه (D27-29, D27-32) |
| 10 | هست | 24 | نیمه (C25-15, C27-23) | 38 | هست | 52 | نیست (#101) |
| 11 | نیمه (#101) | 25 | هست | 39 | نیست (#102) | 53 | هست |
| 12 | هست | 26 | هست | 40 | نیمه (D27-11/12) | | |
| 13 | نیست (#102) | 27 | هست | 41 | هست | | |
| 14 | نیمه (#103) | 28 | نیست (#103) | 42 | نیمه (no undo of a 📜 line) | | |

**Totals:** هست ۲۵ · نیمه ۱۸ · نیست ۱۰ (round 26: ۱۹ / ۱۳ / ۹ of 41).

- Each «نیمه» names its defect family above.
- Each «نیست» has its open sheet.
- **#45 (a tool tested on her own data, not only matched by words)** is a real gap. It stays an open item for the next feature step,
  not this fix round: building a «test on your data» step inside the territory loop is a new capability, not a defect fix. It is
  written down here so it is not lost.

New owner-like questions for the bank (54–63), taken from the runners' lists:
54. وقتی گفتم بله، دقیقاً به کدام پرسش بله گفتم؟
55. پیش‌بینی‌هایی که هنوز باز است کدام‌اند؟
56. وقتی دو ابزار آمد و من یکی را نام بردم، صفحه حرفم را می‌گیرد؟
57. اگر در یک پیام یک عدد را اصلاح کنم و یک سؤال هم بپرسم، اصلاح می‌ماند؟
58. اگر گفتم «پنجشنبه نه، شنبه»، آن پنجشنبه جای دیگری ثبت می‌شود؟
59. تاریخی که تأیید نکردم، چرا با تاریخِ سالِ بعد برمی‌گردد؟
60. سومین مسئله‌ای که وسطِ کار گفتم کجاست؟ پرونده‌اش کو؟
61. حسابی که از کسِ دیگری نقل کردم به اسمِ من ثبت می‌شود؟
62. اگر گفتم سرِ برج یا بعد از عید، کدام روز ثبت می‌شود؟
63. کنارِ هر حسابِ من ✓/✗/؟ ِ صفحه کجا دیده می‌شود؟

## Not exercised or not settled in round 27 (carried into RUNNER28 as explicit arms)
- **A:** the story bank #78/#92, and «آخرِ سال / عید» (run in B, C and D instead).
- **B:** U21, U27, U28, U41 and U56. Their turns exist only in run Y, or the defect did not reproduce.
- **C:**
  - C26-17 and C25-16 not re-seen;
  - C26-33 confirmed in pC1 but not reproduced in pC3;
  - the screenshots were not reviewed one by one.
- **D:** D26-13, D26-27 and D26-35 were not re-measured.
- **The four groups do not agree on «N درصد مطمئنم ⇒ 🎯»:** A and arD2 pass; B, C and pwD2 fail. The fixer must find which phrasings
  fail.

## Fixer split (seven, one concern each; same isolation rules as FIX26)
| Fixer | Family |
|---|---|
| arith | R1 (the S1 D27-18 and D27-1 first) |
| correction | R2 |
| dates | R3 |
| prior | R4 (the S1 D27-2 first) |
| story | R5 + R6 |
| loop | R7 |
| classify | R8 |

Each fixer works where its round-26 namesake worked; `reports/fix26/<name>.md` lists the functions. The «today» fixer of round 26
becomes «dates» and works where today worked.

**Merge order:** arith first, then prior (the S1 families), then the rest in any order. After every merge the whole gate runs: the
three round-26 clashes came from cross-fixer interaction, and gate 40 caught them only at the end. Round 28 starts only after
`GATE_DONE fail=0`.
