# VARIANTS_R29 — independent variant bank (round 29 root mechanisms R1–R7)

Written from DECISIONS_R29 (the families F1–F19, root mechanisms R1–R7, clarifications C136–C153 — C135 revokes C105, C148 narrows C118), DECISIONS_R28 (C84–C135), DECISIONS_R27 (C40–C83), DECISIONS_R26 (C15–C39), DECISIONS_R25 (C1–C14), the round-29 runner hand-backs and defect lists A, B, C, D, and roadmap §9, §21 and §22 only; no source code of the page and no fixer's work was read. Paraphrased — new people, numbers and subjects — not copied from the scenarios; each entry tests the mechanism, not one sentence. Every S1 of round 29 has several pos and neg entries, marked «S1 family» in their context: **A29-1** (a sentence-wide ✓ in 📜 over an unread wrong clause — R6 with R1's per-clause export), **B29·D11** (the prior ledger re-judges a step with a second, scale-blind reader — R3), **C29-1** (a remainder clause glued after a subtraction — R1), **C29-2** («درصد» as the unit of a result — R1), **C29-3** (more than five compound amounts — R1), **D29-1 / D29-2** («… میلیون و M تومن» read through the revoked C105 — R1).
**C136 applied to this bank:** every rule has negative look-alikes; the ones DECISIONS_R29 names (C140, C148) are all here, and more of the same shape were taken from the runners' real sentences in `round28*/*/ctl` and `round29*/*/ctl` (paraphrased). Where a runner judged a sentence correct, the entry keeps that verdict and says «C136 look-alike» in its context.
Every fix must pass the scenario sentence AND every entry of its mechanism here. **No fixed calendar dates in expectations:** D0 = the test clock's day when the test runs; «D0+n» = n days later, «D0−n» n days earlier; «the first Friday after D0» etc. are computed at run time and shown as Jalali dates; weeks run Saturday–Friday. Where an entry needs a weekday or a place in the Jalali month, its context says which («clock on a Monday»). A date inside a user text is given as «⟨D0+n, written as day + month name⟩» or «⟨D0+n, written yyyy/m/d⟩»; idiom dates are calendar rules («day 15 of the next Jalali month»), never a fixed date.
**Arithmetic verified:** every arithmetic fact in this bank — each value called right or wrong, each reading of «N میلیون و M», each exact proposal and each forbidden ratio/stale value, each remainder and percent case — was recomputed with exact rational arithmetic (python3 `fractions.Fraction`; script VARIANTS_R29_verify.py beside this file, all assertions passing). For every «N میلیون و M» line the script applies C102/C103/C135: the thousand reading first; the units reading only when it alone fits (then ✓ with the reading named); none ⇒ ✗ with both values. It also sweeps every «a op b = c» written with symbols in the entries and asserts that the only mismatches are the deliberate ✗ lines, the quotient-with-remainder forms (checked with `divmod`), the percent-unit line and one misreading the bank forbids. Weekday offsets are asserted with the Saturday–Friday week.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result). Every pos has at least one neg of the same shape in its family. **R1 states its verdicts at its head:** every R1 expectation starts with the verdict the page's check must give to the coach AND beside her line (or clause) in 📜 — OK / OK (units reading named) / FLAG / ASK / UNCHECKED / NOT-FLAG / NOT-OK / SILENT. «ASK» anywhere means the decisions say the page asks her, and nothing is booked until she answers.
**C101 + C137 (page-level proof):** an entry whose expectation can only be seen in the page — a button in the DOM, the state of a view, 📜, «امروز», 🧭, the 🎯 book — says so with «PAGE-LEVEL:» and names what to look at. Such an entry is proven only by a replay through the real harness, in EVERY group that showed the family (DECISIONS_R29 families table); a unit test of the function alone is «unit-only», and a replay in one group only is «proven in X only». The four C124 entries of R6 are written one per group shape (A oA1, B nB2, C s23/pwC1, D tD1) for that reason.
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views / 📜 / buttons, [events] sheet replies, registry diffs, 🎯 rows, ledger and dossier readings, [time] day sequences under the test clock, [prompt] what the prompt / reply / post-check contains, [route] 🧭 content and problem records.
Learners: adult unless the context says child (≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ deliberately missing in some entries («میمونه», «پسفردا») — detection must not depend on it, and her text is stored and shown back exactly as typed (C55). Digits appear in Persian, Latin and mixed form on purpose; all must be read the same. All personal, school and shop names are invented.
Multi-message entries use « ‖ » (U = user, A = assistant, «[…]» = a page action / result / state; «[clock → D0+n]» = the test clock moves). Old values always stay as history; nothing is deleted. Named base problems («مسئلهٔ موکت», «مسئلهٔ اسباب‌کشی», «نشستِ دوپرونده‌ایِ ۲۹») are defined in the head of their family. Machine-readable copy: VARIANTS_R29.json (fields rc, kind, role, text, expect, context). Points the decisions leave open are NOT turned into rules; they are listed at the end under «Ambiguities for the coordinator» (where an entry touches one, it asserts only the part the decisions fix).

## Counts

| mechanism | pos | neg |
|---|---|---|
| R1.arith_reader | 39 | 20 |
| R2.correction_engine | 25 | 17 |
| R3.prior_work | 21 | 16 |
| R4.date_ask_engine | 22 | 16 |
| R5.forecast | 25 | 21 |
| R6.filing_story | 24 | 16 |
| R7.surface | 22 | 16 |
| **total** | 178 | 122 |


## R1.arith_reader · the page's exact-arithmetic reader (F1, F2, F16; S1 D29-1/D29-2, C29-1, C29-2, C29-3 first). «N میلیون و M» (M < 1000, no unit after M) is read first as M thousand; ✓ with no question when that fits; ✓ naming the units reading («یعنی ۹۰۰ تومان») only when that reading alone fits; ✗ otherwise with the thousand and the units value in her words — C102/C103. «تومن / تومان / ریال» after M is the currency of the whole amount and never fixes M to units — C135 (C105 revoked and quarantined). Any number of compound amounts in one line; item names between amounts are skipped («یخچال … + لباسشویی … = …»); a ✗ or ≈ value is always written in her scale and her «≈» stays «≈» — C45/C103, C29-18/20. «N تا می‌مونه / باقی می‌مونه / اضافه میاد / کم میاد» is its own statement after ANY operation (sum, subtraction, product, chain), never an operand or result of the equation before it; «کم/اضافه میاد» is judged against her own need/have numbers when both are in her text, otherwise «نسنجیده» — never silent — C141 (C85/C108/C109). «… = N درصد» with no percent operand: ✓ if the value equals N or N/100, ✗ only if neither (showing both); with a percent operand the result is in percent; never scaled twice; a rounded integer percent keeps C44's question — C140. The engine exports a per-clause verdict list that story and prior consume — C138/C139. Verdicts: «OK» = ✓ · «OK (units reading named)» = ✓ with «یعنی … تومان» · «FLAG» = ✗ · «ASK» = the C25/C44 rounding question · «UNCHECKED» = «نسنجیده» · «NOT-FLAG» = OK or UNCHECKED, never ✗, never silence · «NOT-OK» = FLAG or UNCHECKED, never ✓, never silence · «SILENT» = outside the reader.


### Positive

1. [chat] <span dir="rtl">U: ۲۴ تا کارتن، هر کدوم ۶۵۰ هزار: ۲۴ × ۶۵۰ هزار = ۱۵ میلیون و ۶۰۰ تومن</span> — _context:_ <span dir="rtl">adult, flooring; S1 family D29-1 (the C105 branch made this ✗ «۱۸٫۷»)</span>  
   → OK — 24 × 650 000 = 15 600 000 = «۱۵ میلیون و ۶۰۰ تومن» under the thousand reading (C102); «تومن» is the currency of the whole amount, never a units marker on «۶۰۰» (C135); the units reading 15 000 600 is never used; never ✗, never a bare «۱۵٫۶» in the prompt, the 🧭 map or 📜; PAGE-LEVEL: the 📜 mark beside the line is ✓ and the route map step is not «نادرست»
2. [chat] <span dir="rtl">U: ۲۴ × ۶۵۰ هزار = ۱۵ میلیون و ۶۰۰ تومن ‖ [page ✓] ‖ U: این رو دوباره بسنج، مطمئنم درسته</span> — _context:_ <span dir="rtl">adult; S1 family D29-1 (after her objection the false ✗ was kept)</span>  
   → OK stays OK — the re-check (C29) recomputes 15 600 000 and says it re-checked once with the same ✓; no «حکم ماند» over a ✗; chat and page say the same thing
3. [chat] <span dir="rtl">U: کرایهٔ وانت ۱ میلیون و ۴۰۰ تومن، باربر ۶۰۰ هزار تومن: ۱ میلیون و ۴۰۰ تومن + ۶۰۰ هزار تومن = ۲ میلیون تومن</span> — _context:_ <span dir="rtl">adult, moving house; S1 family D29-2</span>  
   → OK — 1 400 000 + 600 000 = 2 000 000 under the thousand reading; the units reading gives 1 600 400 and is never shown; never «؟ دقیقاً ۱٫۶۰۰۴ میلیون … گرد کرده؟»; the coach is never told to ask her about rounding
4. [chat] <span dir="rtl">U: کرایهٔ ون ۳ میلیون و ۷۰۰ تومن + باربر ۹۰۰ هزار تومن = ۴ میلیون و ۶۰۰ تومن</span> — _context:_ <span dir="rtl">adult; S1 family D29-2 with item labels (D29-8 shape)</span>  
   → OK — 3 700 000 + 900 000 = 4 600 000 (thousand reading, carry in the M part); units reading 3 900 700 against 4 000 600 does not fit; labels between the amounts do not stop the reader
5. [chat] <span dir="rtl">U: 12 × 1 میلیون و 250 تومن = 15 میلیون تومن</span> — _context:_ <span dir="rtl">adult, twelve monthly instalments; Latin digits; S1 family D29-1</span>  
   → OK — 12 × 1 250 000 = 15 000 000; Latin digits read like Persian; the units reading 12 003 000 is not the reading; never ✗
6. [chat] <span dir="rtl">U: ۲ میلیون و ۵۰۰ تومن + ۳۰۰ هزار تومن = ۳ میلیون تومن</span> — _context:_ <span dir="rtl">adult; S1 family D29-2 second line (verdict was right, the value raw)</span>  
   → FLAG — thousand reading 2 800 000, units reading 2 300 500, her 3 000 000 fits neither; the ✗ names both in her words («۲ میلیون و ۸۰۰ هزار» and «۲ میلیون و ۳۰۰ هزار و ۵۰۰»), never a raw «۲٫۵۰۰۳ میلیون» or «۲٫۸۰۰۳» (C103, C45)
7. [chat] <span dir="rtl">U: ۲ میلیون و ۹۰۰ تومن − ۹۰۰ تومن = ۲ میلیون تومن</span> — _context:_ <span dir="rtl">adult, bank fee; C136 look-alike of a sentence runner C judged ✓ (it must keep ✓ after C105 is quarantined); A29-10 shape</span>  
   → OK (units reading named) — the thousand reading 2 900 000 − 900 = 2 899 100 does not fit; only the units reading 2 000 900 − 900 = 2 000 000 does, so it is ✓ and the page names it («یعنی ۹۰۰ تومان») per C102/C135; never «نسنجیده», never ✗
8. [chat] <span dir="rtl">U: پول خرد قلک: ۳ میلیون و ۴۰۰ تومن منهای ۴۰۰ تومن میشه ۳ میلیون تومن</span> — _context:_ <span dir="rtl">adult; A29-10 shape with the word operator «منهای … میشه»</span>  
   → OK (units reading named) — only 3 000 400 − 400 = 3 000 000 fits; thousand reading 3 399 600 does not; the page says which reading it used; never «نسنجیده» (A29-10 was «نسنجیده»)
9. [chat] <span dir="rtl">U: قسط‌های شش ماه: ۲ میلیون و ۱۰۰ + ۲ میلیون و ۴۰۰ + ۱ میلیون و ۹۰۰ + ۲ میلیون و ۳۰۰ + ۱ میلیون و ۸۰۰ + ۲ میلیون و ۵۰۰ = ۱۳ میلیون</span> — _context:_ <span dir="rtl">adult, six instalments; S1 family C29-3 (beyond five compounds only the units reading was used)</span>  
   → OK — six compound terms, thousand reading 13 000 000 exactly; the units reading 10 003 000 is never the verdict; never «✗ ۱۰٫۰۰۳ میلیون»; no limit on the number of terms
10. [chat] <span dir="rtl">U: خرجِ هفت روزِ سفر: ۸۰۰ هزار + ۱ میلیون و ۲۰۰ + ۱ میلیون و ۳۵۰ + ۹۰۰ هزار + ۱ میلیون و ۱۵۰ + ۱ میلیون و ۶۰۰ + ۱ میلیون = ۸ میلیون</span> — _context:_ <span dir="rtl">adult, travel diary; S1 family C29-3 (mixed compound and «هزار» terms, seven in all)</span>  
   → OK — seven terms, four of them compound: 0.8 + 1.2 + 1.35 + 0.9 + 1.15 + 1.6 + 1.0 = 8.0 million; the units reading 6 701 300 does not fit; ✓ with no question
11. [chat] <span dir="rtl">U: ۱ میلیون و ۶۰۰ + ۱ میلیون و ۲۰۰ + ۱ میلیون و ۸۰۰ + ۱ میلیون و ۴۰۰ + ۱ میلیون و ۷۰۰ + ۱ میلیون و ۳۰۰ = ۸ میلیون و ۵۰۰</span> — _context:_ <span dir="rtl">adult; S1 family C29-3, a genuinely wrong six-term sum</span>  
   → FLAG — thousand reading 9 000 000, units reading 6 003 000, her 8 500 000 (or 8 000 500) fits neither; the ✗ names «۹ میلیون» and «۶ میلیون و ۳ هزار» in her words; the right sum is not given to her
12. [chat] <span dir="rtl">U: ۲ میلیون و ۷۵۰ + ۱ میلیون و ۲۵۰ + ۳ میلیون و ۴۰۰ + ۲ میلیون و ۶۰۰ + ۱ میلیون و ۵۰۰ + ۲ میلیون و ۵۰۰ = ۱۴ میلیون</span> — _context:_ <span dir="rtl">adult, car repairs; S1 family C29-3</span>  
   → OK — 2.75 + 1.25 + 3.4 + 2.6 + 1.5 + 2.5 = 14.0 million under the thousand reading; units 11 003 000 does not fit; never ✗
13. [chat] <span dir="rtl">U: یخچال ۲۸ میلیون و ۴۰۰ + لباسشویی ۱۹ میلیون و ۸۰۰ = ۴۸ میلیون و ۲۰۰</span> — _context:_ <span dir="rtl">adult, buying appliances; D29-8 / B29·D9 shape</span>  
   → OK — 28.4 M + 19.8 M = 48.2 M (thousand reading); the item names between the amounts are skipped, the sum is read; never silent
14. [chat] <span dir="rtl">U: سینک ۳ میلیون و ۴۰۰ + شیرآلات ۱ میلیون و ۸۰۰ = ۴ میلیون و ۲۰۰</span> — _context:_ <span dir="rtl">adult, kitchen; D29-8 (the wrong labelled sum was silent)</span>  
   → FLAG — thousand reading 5 200 000, units reading 4 001 200, her 4 200 000 fits neither; ✗ with both values in her words; never silent because of the labels (D29-8 let a wrong labelled sum pass)
15. [chat] <span dir="rtl">U: بلیت ۲ میلیون و ۶۵۰ + هتل ۵ میلیون و ۴۰۰ + غذا ۱ میلیون و ۹۵۰ = ۱۰ میلیون</span> — _context:_ <span dir="rtl">adult, trip budget; B29·D9 shape with three labels</span>  
   → OK — 2.65 + 5.4 + 1.95 = 10.0 million; three labelled compound terms; units reading 8 002 000 does not fit
16. [chat] <span dir="rtl">U: پیش‌پرداخت ۳ میلیون و ۲۰۰ هزار دادم، با ۲ میلیونِ دیگه میشه ۵ میلیون و ۲۰۰</span> — _context:_ <span dir="rtl">adult; D29-17 shape (no line at all in round 29)</span>  
   → NOT-FLAG — «با ۲ میلیونِ دیگه میشه» is a sum word; 3 200 000 + 2 000 000 = 5 200 000; ✓ if the reader takes the word operator, otherwise «نسنجیده» — never silent, never ✗
17. [chat] <span dir="rtl">U: ۲۰ میلیون ÷ ۷ ≈ ۲ میلیون و ۵۰۰ هزار</span> — _context:_ <span dir="rtl">adult, splitting an inheritance; C29-20 shape</span>  
   → FLAG — 20 000 000 ÷ 7 = 2 857 142.86…; her 2 500 000 is neither its rounding nor its truncation at the thousand she wrote; the ✗ states the value in her scale («≈ ۲ میلیون و ۸۵۷ هزار»), never a bare «≈ ۲٫۹» or «۲٫۸۶»
18. [chat] <span dir="rtl">U: ۹ هزار و ۵۰۰ × ۳ = ۲۷ هزار و ۵۰۰</span> — _context:_ <span dir="rtl">adult, bus tickets; B28·D15 shape seen again in round 29</span>  
   → FLAG — «N هزار و M» has M in units (C104): 9 500 × 3 = 28 500; the ✗ says «۲۸ هزار و ۵۰۰», never «۲۸٫۵ هزار» (C103 in her words)
19. [prompt] <span dir="rtl">U: سهم هر کدوم از ۱۵ میلیون ÷ ۴ ≈ ۳ میلیون و ۸۰۰ هزار</span> — _context:_ <span dir="rtl">adult; C29-20 with C29-18 (coach line wrote her «≈» as «=»)</span>  
   → FLAG in the prompt line too — 15 000 000 ÷ 4 = 3 750 000 exactly; «≈ ۳ میلیون و ۸۰۰ هزار» is not its rounding at her thousand digits (3 750 000); the coach line quotes her «≈» as «≈» (never «=») and writes the exact value «۳ میلیون و ۷۵۰ هزار»
20. [chat] <span dir="rtl">U: ۲۲ تا مداد داشتیم، ۱۷ تا رو دادیم به کلاس: ۲۲ − ۱۷ = ۵، ۵ تا می‌مونه.</span> — _context:_ <span dir="rtl">child, 9; S1 family C29-1 (after a subtraction the clause was glued)</span>  
   → OK and OK — two statements: «۲۲ − ۱۷ = ۵» ✓ and the remainder clause «۵ تا می‌مونه» ✓ (22 − 17 = 5); the clause is never glued into «۱۷ − ۵» or «۵ − ۵»; the coach is never told «✗ … ۱۲»
21. [chat] <span dir="rtl">U: 23 - 16 = 7, 7 تا میمونه</span> — _context:_ <span dir="rtl">child, 8; S1 family C29-1, Latin digits</span>  
   → OK and OK — 23 − 16 = 7, the clause «۷ تا میمونه» repeats the remainder; Latin digits and missing ZWNJ read the same; no «۱۶ − ۷ = ۹» anywhere
22. [chat] <span dir="rtl">U: ۳۵ − ۱۲ − ۹ = ۱۴، ۱۴ تا می‌مونه</span> — _context:_ <span dir="rtl">teen, 13, stickers; S1 family C29-1 (chain)</span>  
   → OK and OK — the chain 35 − 12 − 9 = 14; the remainder clause is its own statement (C141 «a chain»)
23. [chat] <span dir="rtl">U: ۶ × ۷ = ۴۲ تا تخم‌مرغ، از ۵۰ تا ۸ تا می‌مونه</span> — _context:_ <span dir="rtl">adult, bakery; C141 after a multiplication</span>  
   → OK and OK — 6 × 7 = 42 and 50 − 42 = 8; the remainder after a multiplication is its own statement with its operands in her text
24. [chat] <span dir="rtl">U: ۶ × ۷ = ۴۲ تا تخم‌مرغ، از ۵۰ تا ۷ تا می‌مونه</span> — _context:_ <span dir="rtl">adult; C141 after a multiplication, wrong remainder</span>  
   → OK then FLAG — the product is ✓; the clause «۷ تا می‌مونه» is ✗ on its own line (50 − 42 = 8); the product line keeps its ✓ (one mark per clause, C138)
25. [chat] <span dir="rtl">U: ۴۰ تا صندلی لازمه، ۳۲ تا داریم، ۹ تا کم میاد</span> — _context:_ <span dir="rtl">adult, a wedding hall; D29-9 shape («۳۰ لازمه، ۲۵ داریم، ۶ تا کم میاد» was silent)</span>  
   → FLAG — need 40, have 32, short by 8; «۹ تا کم میاد» is ✗ against the problem's own numbers (C141), shown as its own line; never silent
26. [chat] <span dir="rtl">U: ۴۰ تا صندلی لازمه، ۳۲ تا داریم، ۸ تا کم میاد</span> — _context:_ <span dir="rtl">adult; C141 positive with the right shortfall</span>  
   → OK — 40 − 32 = 8; judged against her own need/have numbers (C141)
27. [chat] <span dir="rtl">U: ۳ × ۹ = ۲۷ تا شیرینی گرفتیم، ۲۵ نفریم، پس ۳ تا اضافه میاد</span> — _context:_ <span dir="rtl">adult; A29-1 s08 shape («پس ۸ لیتر اضافه میاد» was under a sentence-wide ✓)</span>  
   → OK then FLAG — 3 × 9 = 27 ✓; «۳ تا اضافه میاد» is ✗ (27 − 25 = 2) on its own line; the sentence is never ✓ as a whole (C138 with story)
28. [chat] <span dir="rtl">U: روزی ۴ صفحه: ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۲ تا کم میاد</span> — _context:_ <span dir="rtl">child, 8, reading pages; A29-1 pwA2 shape without a stated total</span>  
   → OK then UNCHECKED — the sum 16 ✓; her text gives no total to compare «۲ تا کم میاد» with, so it is «نسنجیده» on its own line (C141 «otherwise نسنجیده»); never silent and never glued to the sum
29. [chat] <span dir="rtl">U: ۱۸ صفحه مونده. روزی ۴ تا: ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد</span> — _context:_ <span dir="rtl">child, 8; S1 A29-1 pwA2 shape with the total in her text</span>  
   → OK then FLAG — the sum 16 ✓; with her stated total 18, 18 − 16 = 2, so «۳ تا کم میاد» is ✗ on its own line; the line is never ✓ as a whole (C138, C141)
30. [chat] <span dir="rtl">U: ۵۰ ÷ ۶ = ۸ و ۲ تا می‌مونه</span> — _context:_ <span dir="rtl">adult, packing; B29·D10 shape (a right remainder was asked as rounding)</span>  
   → OK — quotient 8, remainder 2; never «؟ گرد شده؟» (B29·D10)
31. [chat] <span dir="rtl">U: ۴۷ ÷ ۵ = ۹ و ۳ تا می‌مونه</span> — _context:_ <span dir="rtl">adult; B29·D10 shape</span>  
   → FLAG — 47 = 5 × 9 + 2, so the remainder is 2, not 3; ✗ names the remainder, never «؟» (B29·D10 gave «؟» for a wrong remainder)
32. [chat] <span dir="rtl">U: سودِ ماهانه ۱ و ۵ دهم درصده؛ ۶ ماه میشه ۱ و ۵ دهم × ۶ = ۹ درصد</span> — _context:_ <span dir="rtl">adult, a deposit; S1 family C29-2</span>  
   → OK — 1.5 × 6 = 9, percent context, the result is labelled in percent (C140); never «✗ … ۹۰۰٪» and never scaled twice
33. [chat] <span dir="rtl">U: ۳ و ۲ دهم × ۵ = ۱۶ درصد</span> — _context:_ <span dir="rtl">adult; S1 family C29-2 without a percent context</span>  
   → OK — no operand is a percentage; the computed value 16 equals N (she labels the result in percent), so ✓ (C140)
34. [chat] <span dir="rtl">U: ۴۸ تقسیم بر ۶۰۰ = ۸٪</span> — _context:_ <span dir="rtl">adult, defect rate; C140 look-alike («۱۷۵ تقسیم بر ۱۲۵۰ = ۱۴٪»)</span>  
   → OK — 48 / 600 = 0.08 = 8/100, a fraction written as a percent (C140)
35. [chat] <span dir="rtl">U: ۳ × ۵ = ۱۲ درصد</span> — _context:_ <span dir="rtl">adult; C140 negative shape</span>  
   → FLAG — computed 15; neither 12 nor 0.12; ✗ showing both readings («۱۵» and «۱۵۰۰٪»), never silent (C140 negative)
36. [chat] <span dir="rtl">U: ۷ از ۴۵ میشه ۱۶٪</span> — _context:_ <span dir="rtl">adult; C140 look-alike «۴ از ۲۶ میشه ۱۵٪»</span>  
   → ASK — 7/45 = 15.55…%; 16 is its rounding with no approximation word, so the C44/C25 question («دقیقاً ۱۵٫۵۵…٪ — گرد کردی؟»); never ✗, never ✓ before her answer (C140 keeps C9/C44)
37. [chat] <span dir="rtl">U: ۱۵٪ِ ۴۰۰ = ۵۰</span> — _context:_ <span dir="rtl">adult; a percent-of shape, wrong</span>  
   → FLAG — 15% of 400 = 60; ✗ (the result is not in percent, so no percent unit applies)
38. [events] <span dir="rtl">U: ۵ میلیون و ۲۰۰ − ۲ میلیون و ۷۰۰ = ۲ میلیون و ۵۰۰، نصفش هم میشه ۱ میلیون و ۳۰۰</span> — _context:_ <span dir="rtl">adult; S1 A29-1 s06 shape, arith side (C138 export)</span>  
   → the arith export for this sentence has TWO clause entries: «۵ میلیون و ۲۰۰ − ۲ میلیون و ۷۰۰ = ۲ میلیون و ۵۰۰» OK (5.2 M − 2.7 M = 2.5 M) and «نصفش هم میشه ۱ میلیون و ۳۰۰» NOT-OK (half of 2 500 000 is 1 250 000: ✗ if read, «نسنجیده» if not) — never a single sentence-level OK
39. [events] <span dir="rtl">U: ۱۱ + ۱۱ = ۲۲ لیتر، پس ۹ لیتر اضافه میاد</span> — _context:_ <span dir="rtl">adult, jug puzzle; S1 A29-1 s08 shape, arith side</span>  
   → the export has two entries: «۱۱ + ۱۱ = ۲۲» OK and «۹ لیتر اضافه میاد» UNCHECKED (no need/have in her text) — or FLAG if the problem statement in the same record gives the target (for a 15-litre target, 22 − 15 = 7); never folded into the sum entry


### Negative (look-alike)

1. [chat] <span dir="rtl">U: حقوقم ۲۱ میلیون و ۳۰۰ تومنه</span> — _context:_ <span dir="rtl">elder, 66, «شما» register; look-alike of the D29-1 shape</span>  
   → SILENT — an amount with no operation; no line, no reading question (C17)
2. [chat] <span dir="rtl">U: ۲ میلیون و ۵۰۰ تومن نقد دارم و ۸۰۰ تومن پول خرد</span> — _context:_ <span dir="rtl">adult; look-alike of D29-2 with no result</span>  
   → SILENT — no operation word, no «=»/«میشه»; «و» between two amounts is not a sum without «میشه» (C28)
3. [chat] <span dir="rtl">U: یخچال ۲۸ میلیون و ۴۰۰، لباسشویی ۱۹ میلیون و ۸۰۰</span> — _context:_ <span dir="rtl">adult; look-alike of the labelled-sum shape</span>  
   → SILENT — a price list with labels and no operation; nothing to judge
4. [chat] <span dir="rtl">U: قسط‌ها: ۱ میلیون و ۲۰۰، ۱ میلیون و ۳۰۰، ۱ میلیون و ۱۰۰، ۱ میلیون و ۴۰۰، ۱ میلیون و ۵۰۰، ۱ میلیون و ۵۰۰</span> — _context:_ <span dir="rtl">adult; look-alike of the C29-3 shape with no claim</span>  
   → SILENT — six compound amounts with no «+», «=» or «میشه»; no line
5. [chat] <span dir="rtl">U: ۱۰ میلیون ÷ ۳ ≈ ۳ میلیون و ۳۳۳ هزار</span> — _context:_ <span dir="rtl">adult; C136 look-alike a runner judged ✓ (aC3 p35)</span>  
   → OK — 3 333 333.3…, «۳ میلیون و ۳۳۳ هزار» is its truncation at the thousand she wrote (C9); stays ✓; the coach line keeps her «≈» (C29-18)
6. [chat] <span dir="rtl">U: ۸ میلیون ÷ ۷ ≈ ۱ میلیون و ۱۴۳ هزار</span> — _context:_ <span dir="rtl">adult; C136 look-alike (nB2, judged ✓)</span>  
   → OK — 1 142 857.1…; «۱ میلیون و ۱۴۳ هزار» is its rounding at her thousand digits (C9); stays ✓
7. [chat] <span dir="rtl">U: ۷ میلیون و ۶۰۰ − ۶۰۰ = ۷ میلیون</span> — _context:_ <span dir="rtl">adult; C29-19 shape (runner C rated the units-only wording S3); C136: no ✗ either way</span>  
   → NOT-FLAG — the units reading (7 000 600 − 600) fits, and a bare «۶۰۰» read as 600 thousand beside it fits too; never ✗; which reading the page names is open (see ambiguities)
8. [chat] <span dir="rtl">U: ۱۸ + ۱۲ = ۳۰ تا کارتن، ۴ تا هم برای فردا می‌مونه</span> — _context:_ <span dir="rtl">adult; look-alike of C29-1 with a narrative remainder</span>  
   → OK for the sum; the clause «۴ تا هم برای فردا می‌مونه» has no operands in her text, so it gets no ✗ and is never glued into «۳۰ − ۴» or «۳۰ + ۴» (C85/C108)
9. [chat] <span dir="rtl">U: ۸ + ۷ = ۱۵ و ۳ تا می‌مونه برای داداشم</span> — _context:_ <span dir="rtl">child, 9; C109 look-alike (a runner judged «۸ + ۶ = ۱۴ و ۲ تا می‌مونه» ✓)</span>  
   → OK — the sum ends at «۱۵» (C109); «و ۳ تا می‌مونه» starts its own statement; the sum is never read as «۸ + ۷ = ۱۵۳» or «۱۵ − ۳»
10. [chat] <span dir="rtl">U: ۳۴ ÷ ۴ = ۸، ۲ تا می‌مونه</span> — _context:_ <span dir="rtl">child, 9, marbles; C136 look-alike</span>  
   → OK — 34 = 4 × 8 + 2; stays ✓ (runner C judged the same shape right after a division)
11. [chat] <span dir="rtl">U: امروز ۲ × ۳ = ۶ تا نون خریدم، یکی هم از دیروز مونده</span> — _context:_ <span dir="rtl">elder, 70; small-talk look-alike</span>  
   → OK for «۲ × ۳ = ۶»; «یکی هم … مونده» is narrative with no operands: no line, no ✗, nothing glued
12. [chat] <span dir="rtl">U: ۲۰ درصدِ ۳۵۰ = ۷۰</span> — _context:_ <span dir="rtl">adult; C136 look-alike («۲۰ درصدِ ۳۰۰ = ۶۰», judged ✓)</span>  
   → OK — 20% of 350 = 70; the result has no percent unit; never scaled by 100 (C140 «never scale twice»)
13. [chat] <span dir="rtl">U: ۱۵ درصد × ۴ = ۶۰ درصد</span> — _context:_ <span dir="rtl">adult; C140 percent-operand look-alike</span>  
   → OK — a percent operand, so the result is in percent units: 15% × 4 = 60% (C140); never «۶۰۰۰٪» or «۰٫۶٪»
14. [chat] <span dir="rtl">U: ماهی ۲ و ۵ دهم درصد × ۴ ماه = ۱۰ درصد</span> — _context:_ <span dir="rtl">adult; runner C's owner-like question shape (C140)</span>  
   → OK — 2.5% × 4 = 10%, percent on both sides; never ✗ «۱۰۰۰٪»
15. [chat] <span dir="rtl">U: ۲۷۰ تقسیم بر ۶۰۰ میشه ۰٫۴۵، یعنی ۴۵ درصد</span> — _context:_ <span dir="rtl">adult, electricity bill share; C136 look-alike («۳۶۰ تقسیم بر ۵۰۰ میشه ۰٫۷۲، یعنی ۷۲ درصد»)</span>  
   → OK and OK — 270 / 600 = 0.45 and «یعنی ۴۵ درصد» restates it (0.45 = 45/100); no ✗ on the «یعنی» clause
16. [chat] <span dir="rtl">U: ۱۲ ÷ ۱۳۰٫۵ ≈ ۹٫۲٪</span> — _context:_ <span dir="rtl">adult, a screening test; C136 look-alike («۹ ÷ ۹۸٫۱ ≈ ۹٫۲٪»)</span>  
   → OK — 12 / 130.5 = 0.0919…, i.e. 9.195…%; «≈ ۹٫۲٪» is its rounding at her one decimal (C9); never scaled on one side only
17. [chat] <span dir="rtl">U: ۲/۶ × ۳/۵ = ۶/۳۰ = ۱/۵، یعنی ۲۰٪</span> — _context:_ <span dir="rtl">teen, 16, probability; C136 look-alike («… = ۳/۱۰، یعنی ۳۰٪»)</span>  
   → OK — 6/30 = 1/5 = 20%; the percent restatement is not ✗
18. [chat] <span dir="rtl">U: ۴۰۰ میلیون ضربدر ۱۸ درصد میشه ۷۲ میلیون</span> — _context:_ <span dir="rtl">elder, 67, savings; C136 look-alike («۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون»)</span>  
   → OK — 400 M × 18% = 72 M; a percent operand with a scaled result is not double-scaled
19. [chat] <span dir="rtl">U: جلسه ساعت ۱۰:۳۰ تا ۱۲ بود، ۱۸ از ۲۰ گرفتم</span> — _context:_ <span dir="rtl">teen, 15; look-alike</span>  
   → SILENT — a clock time and a score are not arithmetic
20. [events] <span dir="rtl">U: ۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰</span> — _context:_ <span dir="rtl">adult; C138 look-alike: nothing unread, so the sentence ✓ is right</span>  
   → the export has ONE clause entry, OK (5.7 M, thousand reading, no question); a sentence with only read clauses may be ✓ as a whole


## R2.correction_engine · the correction engine (F8). A proposal is the exact recomputation along RECORDED dependency with the current value of EVERY corrected datum — one proposal function; the ratio path is quarantined, never a fallback — C89 (C47, C66, C68, C111, C112). «X نیست، Y» / «X نه Y» / «X نمیشه، Y میشه» / «یه اصلاحِ دیگه: …» / «X نبود، Y بود» are corrections; a second correction of the same datum replaces the first with both in history; «پس جوابم غلط بود» marks her result as rejected by her and never rewrites it — C142 (C74). The correction binds to the quantity her sentence names; when the digit occurs as two quantities and her sentence names none, the page asks which; a range «از a تا b» is replaced as one unit or the page asks — C143 (C88). Fixing a result never changes a datum; her quote outside the replaced fragment stays byte-exact (D29-26). Accepting a proposal rewrites only if every base is current, otherwise the page names the stale base and its current value — C87/C111. A datum change re-marks every dependent ledger step and open proposal (C29-12). Base problem — «مسئلهٔ موکت» (adult; every step ✓): گام ۱ «اتاق ۶ متر در ۴ متر = ۲۴ مترمربع» · گام ۲ «متری ۲۵۰ هزار: ۲۴ × ۲۵۰ = ۶۰۰۰ هزار» · گام ۳ «نصبِ متری ۴۰ هزار: ۲۴ × ۴۰ = ۹۶۰ هزار» · گام ۴ «جمع: ۶۰۰۰ + ۹۶۰ = ۶۹۶۰ هزار» · گام ۵ «سه نفری: ۶۹۶۰ ÷ ۳ = ۲۳۲۰ هزار»; other lines in the same chat: «نصاب ساعتِ ۴ میاد», «اتاق ۴ تا پنجره داره», «۶ سال پیش موکت کرده بودیم». pos = a correction that must land on exactly its fragment / a proposal that must be exact / an acceptance that must act or be refused with the stale base named; neg = a look-alike that must stay untouched.


### Positive

1. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵</span> — _context:_ <span dir="rtl">adult; base correction (C29-12 shape: a datum change must reach every dependent ledger step)</span>  
   → the datum reads «اتاق ۶ متر در ۵ متر»; only that «۴» changes; exact proposals along recorded dependency: گام ۱ ۲۴ ⇒ ۳۰، گام ۲ ۶۰۰۰ ⇒ ۷۵۰۰، گام ۳ ۹۶۰ ⇒ ۱۲۰۰، گام ۴ ۶۹۶۰ ⇒ ۸۷۰۰، گام ۵ ۲۳۲۰ ⇒ ۲۹۰۰ (هزار); «۴ تا پنجره» and «ساعتِ ۴» untouched; PAGE-LEVEL: the ledger marks steps 1–5 stale with these values
2. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ [page proposals] ‖ U: متری ۲۵۰ نیست، ۲۸۰</span> — _context:_ <span dir="rtl">adult; B29·D13, C29-14, D29-10 shape (proposals by ratio or on a stale value)</span>  
   → proposals recomputed from BOTH current values (width 5, price 280): گام ۲ ⇒ ۸۴۰۰، گام ۴ ⇒ ۹۶۰۰، گام ۵ ⇒ ۳۲۰۰ (هزار); گام ۳ stays ۱۲۰۰; never the ratio values ۹۷۴۴ / ۳۲۴۸ and never ۶۷۲۰ (the stale area 24 × 280); the earlier proposals built on 250 are re-marked, not left as current
3. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ U: عرض ۵ هم نیست، ۵٫۵</span> — _context:_ <span dir="rtl">adult; A29-14 (a second correction of the same datum was refused) + D29-5 label</span>  
   → the second correction of the same datum is accepted (C142): the datum reads «۶ متر در ۵٫۵ متر», history keeps both («۴ ⇒ ۵ ⇒ ۵٫۵»); proposals: ۳۳، ۸۲۵۰، ۱۳۲۰، ۹۵۷۰، ۳۱۹۰ (هزار); the step label «گام ۵» never becomes «گام ۵٫۵» (D29-5); never «از آن بخش چیزی ثبت نشده بود»
4. [chat] <span dir="rtl">U: ما ۴ نفریم نه ۳ ‖ U: نه ببخشید، ۵ نفریم نه ۴</span> — _context:_ <span dir="rtl">adult, sharing a rent; A29-14 shape with «نه ببخشید»</span>  
   → both corrections land; the datum shows 5 with history «۳ ⇒ ۴ ⇒ ۵»; every share is recomputed with 5; never refused as «already corrected»
5. [chat] <span dir="rtl">U: ارثیه ۹ میلیارد، ۴ نفریم: ۹ ÷ ۴ = ۲٫۲۵ میلیارد ‖ U: ۶ نفریم نه ۴ ‖ U: ۹ نیست، ۱۰٫۸ میلیارد</span> — _context:_ <span dir="rtl">adult, inheritance; A29-15 (proposals after «۱۲ میلیارد» used the stale 4 heirs)</span>  
   → after the second correction the proposal is ۱٫۸ میلیارد (10.8 ÷ 6, both current values); never ۲٫۷ (10.8 ÷ 4 on the stale heirs, or 2.25 × 1.2 by ratio); the first proposal 1.5 is shown as superseded in history
6. [chat] <span dir="rtl">U: ۴۰ ÷ ۱۶ = ۲٫۵ ‖ U: ۴۰ نیست، ۳۶ ‖ U: ۱۶ هم نیست، ۱۸</span> — _context:_ <span dir="rtl">teen, 16, a recipe ratio; C29-14 shape</span>  
   → the last proposal is ۲ (36 ÷ 18, exact); never ≈ ۲٫۲۲ (40 ÷ 18 with the stale 40)
7. [chat] <span dir="rtl">U: ۲۰ تا کارتن، هر کدوم ۱۸ هزار: ۲۰ × ۱۸ = ۳۶۰ هزار؛ با ۵۰ هزار نوارچسب: ۳۶۰ + ۵۰ = ۴۱۰ هزار ‖ U: ۱۸ نیست، ۲۰</span> — _context:_ <span dir="rtl">adult, moving; B29·D13 shape (her carton count was marked stale; ratio proposals)</span>  
   → exact proposals: ۳۶۰ ⇒ ۴۰۰، ۴۱۰ ⇒ ۴۵۰ (هزار); never ۴۱۰ ⇒ ≈ ۴۵۵٫۵۶ (ratio 20/18); her own count «۲۰ تا کارتن» is a datum and is never marked stale by the price
8. [chat] <span dir="rtl">U: ۲۰ تا کارتن، هر کدوم ۱۵ هزار … ‖ U: ۱۵ نیست، ۱۸ ‖ U: ۱۸ هم نیست، ۲۰</span> — _context:_ <span dir="rtl">adult; B29·D13 (two corrections of one datum)</span>  
   → the second correction of the price replaces the first (history «۱۵ ⇒ ۱۸ ⇒ ۲۰»); the current proposal for the product is ۴۰۰ هزار (20 × 20); the accept-stale line never says «پیشنهادِ دقیقِ جاری» about a value built on 18
9. [chat] <span dir="rtl">[مسئلهٔ موکت] U: نصبِ متری ۴۰ نبود، ۴۵ بود</span> — _context:_ <span dir="rtl">adult; C142 shape</span>  
   → «X نبود، Y بود» is a correction (C142): گام ۳ ۹۶۰ ⇒ ۱۰۸۰، گام ۴ ۶۹۶۰ ⇒ ۷۰۸۰، گام ۵ ۲۳۲۰ ⇒ ۲۳۶۰ (هزار); گام ۱ and گام ۲ untouched
10. [chat] <span dir="rtl">U: یه اصلاحِ دیگه: هر قوطی ۴ لیتر نمیشه، ۵ لیتر میشه</span> — _context:_ <span dir="rtl">adult, painting; C29-13 shape</span>  
   → «X نمیشه، Y میشه» after «یه اصلاحِ دیگه:» is a correction (C142): the can size becomes 5 with history; never «این اصلاح انجام نشد: … نشانهٔ اصلاح … نبود»
11. [chat] <span dir="rtl">U: هر سبد ۱۲ تا سیب نمیشه، ۱۰ تا میشه</span> — _context:_ <span dir="rtl">child, 10, «نمیشه، … میشه» with no «اصلاح» word</span>  
   → a correction (C142) without a lead phrase: the count 12 ⇒ 10 in the datum it names; dependent steps get exact proposals
12. [chat] <span dir="rtl">[مسئلهٔ موکت] U: ۴ نیست، ۵</span> — _context:_ <span dir="rtl">adult; C143 (her sentence names no quantity)</span>  
   → the page asks which «۴» (C143/C88): the width, the windows («۴ تا پنجره») or the hour («ساعتِ ۴»); nothing changes until she answers; no proposal shown yet
13. [chat] <span dir="rtl">U: ۸ تا پنل، هر کدوم ۵ میلیون: ۸ × ۵ = ۴۰ میلیون. شیشه‌ش ۵ میلی‌متره ‖ U: ضخامتِ شیشه ۵ نیست، ۶ میلی‌متره</span> — _context:_ <span dir="rtl">adult, solar panels; C29-10 shape (the price «۵» was confused with «۵ میلی‌متر»)</span>  
   → the correction binds to the thickness her sentence names; the panel price «۵ میلیون» and «۴۰ میلیون» are untouched and not stale; no proposal on 40
14. [chat] <span dir="rtl">U: ۸ تا پنل، هر کدوم ۴٫۵ میلیون: ۸ × ۴٫۵ = ۳۶ میلیون. شیشه ۵ میلی‌متره ‖ U: پنل ۴٫۵ نیست، ۵ میلیون ‖ [page: ۳۶ ⇒ ۴۰] ‖ U: ضخامت ۵ نیست، ۶ ‖ U: آره، همون ۴۰ میلیون درسته</span> — _context:_ <span dir="rtl">adult; C29-10 p31 (a correct acceptance was refused)</span>  
   → the acceptance acts: the step is rewritten to «۸ × ۵ = ۴۰ میلیون» (its base, the price 5, is current; the thickness change is not a base of it); never «پیشنهادِ «۳۶ ⇒ ۴۰» بر «۵» بنا بود که بعداً «۶ میلی‌متر» شد»
15. [chat] <span dir="rtl">U: مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۱۵ چند میشه؟ ‖ U: منظورم n از ۱ تا ۳۰ بود، نه از ۱ تا ۱۵</span> — _context:_ <span dir="rtl">teen, 17, a telescoping sum; C29-15 shape</span>  
   → the range is replaced as one unit: the statement reads «… برای n از ۱ تا ۳۰ چند میشه؟» (or the page asks which part to change); never a garbled «n از ۱ تا ۳۰ n = ۱ تا ۱۵»; the old statement stays in history
16. [chat] <span dir="rtl">U: عرضِ باغچه ۶ نیست، ۵ متره</span> — _context:_ <span dir="rtl">adult, a garden plot; D29-26 shape («عرض ۵ نیست، ۴» no longer changed the statement)</span>  
   → the statement «باغچه‌ای به طولِ ۹ متر و عرضِ ۶ متر …» becomes «… عرضِ ۵ متر …»; «متره» is never pasted into it; the rest of her statement stays byte-exact (D29-26 regression)
17. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ [page: گام ۴ ۶۹۶۰ ⇒ ۸۷۰۰] ‖ U: متری ۲۵۰ نیست، ۲۸۰ ‖ U: آره، همون ۸۷۰۰ درسته</span> — _context:_ <span dir="rtl">adult; C29-11 shape (a proposal built on a value corrected later was accepted)</span>  
   → NOT rewritten: the page names the stale base and its current value («این پیشنهاد روی ۲۵۰ ِ کهنه ساخته شده — الان ۲۸۰ است») and shows the current exact value ۹۶۰۰; never «✓ پیشنهادِ صفحه را پذیرفتی — «۶۹۶۰ ⇒ ۸۷۰۰»»
18. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ U: آره، همون ۸۷۰۰ درسته</span> — _context:_ <span dir="rtl">adult; C87/C68 positive</span>  
   → accepted (all bases current): گام ۴ reads ۸۷۰۰ with history «اصلاح شد ⇐ ۶۹۶۰»; its dependant گام ۵ gets its own exact proposal ۲۳۲۰ ⇒ ۲۹۰۰ (C68); nothing else changes silently
19. [chat] <span dir="rtl">U: قرنیز: دورِ اتاق ۲ × (۶ + ۴) = ۲۰ متر، متری ۱۵۰ هزار: ۲۰ × ۱۵۰ = ۳۰۰۰ هزار. شاخه‌ها ۳ متری‌ان: ۸ × ۳ = ۲۴، ۴ متر می‌مونه ‖ U: متری ۱۵۰ نیست، ۱۸۰</span> — _context:_ <span dir="rtl">adult; D29-11 shape (a remainder clause and counts were scaled by 180/150)</span>  
   → one proposal ۳۰۰۰ ⇒ ۳۶۰۰ هزار (20 × 180); the perimeter 20, «۸ × ۳ = ۲۴» and «۴ متر می‌مونه» are not dependants of the price and are never stale; never «۲۰ ⇒ ۲۴» or «۸ ⇒ ۹٫۶» by scaling
20. [chat] <span dir="rtl">U: کفِ هال ۵٫۵ در ۴ = ۲۲ متر، متری ۱۵۰ هزار: ۲۲ × ۱۵۰ = ۳۳۰۰ هزار ‖ U: ۱۵۰ نیست، ۱۶۰ ‖ U: ۱۶۰ هم نیست، ۱۸۰</span> — _context:_ <span dir="rtl">adult, flooring; D29-10/D29-11 (three values of one price; exact 3960)</span>  
   → the current proposal is ۳۹۶۰ هزار (22 × 180); never ۳۶۰۰ (built on the stale 20 m² or by a ratio of the last step only); the 📜 line text agrees with the ledger
21. [chat] <span dir="rtl">U: ۵ × ۵ = ۲۵ تا کاشی لازمه ‖ U: … با ۴ تا ردیف کافیه. پس جوابم غلط بود</span> — _context:_ <span dir="rtl">adult; D29-23 shape (the rejected record was rewritten)</span>  
   → her earlier result is marked as rejected by her («ردشده به حرفِ خودت») and stays as written in history; the record is never rewritten into another of her lines (C74); the coach is told she withdrew it
22. [page] <span dir="rtl">[مسئلهٔ موکت in the prior ledger] U: اتاق ۶ در ۴ نبود، ۶ در ۴٫۵ بود</span> — _context:_ <span dir="rtl">adult; C29-12 (a datum change did not re-mark the ledger)</span>  
   → PAGE-LEVEL: the ledger view shows steps 1–5 re-marked stale with exact proposals (۲۷، ۶۷۵۰، ۱۰۸۰، ۷۸۳۰، ۲۶۱۰ هزار) and the earlier open proposals re-marked; not only «داده به حرفِ خودت» changed
23. [page] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ U: متری ۲۵۰ نیست، ۲۸۰</span> — _context:_ <span dir="rtl">adult; B24·D16 seen with two corrections</span>  
   → PAGE-LEVEL: the 📜 history of گام ۴ shows the two corrections in order and the current proposal ۹۶۰۰; one history line per change, each with only «اصلاح شد ⇐» (never «⇐» and «→» in one line)
24. [chat] <span dir="rtl">[مسئلهٔ موکت] U: متری ۲۵۰ نیست، ۲۸۰ ‖ U: عرض ۴ نیست، ۵</span> — _context:_ <span dir="rtl">adult; C89 order-independence</span>  
   → the same end state in the other order: current proposals ۳۰، ۸۴۰۰، ۱۲۰۰، ۹۶۰۰، ۳۲۰۰ (هزار); never ۶۷۲۰ × 30/24 = ۸۴۰۰ reached by scaling the first proposal, never ۹۷۴۴ — the function recomputes from the data, so order does not matter
25. [chat] <span dir="rtl">[مسئلهٔ موکت, where the datum «اتاق ۶ متر در ۴ متر» and گام ۱ «۶ × ۴ = ۲۴» both carry the width] U: عرض ۴ نیست، ۵</span> — _context:_ <span dir="rtl">adult; C110 one quantity written twice</span>  
   → the width changes in BOTH places (same quantity, same meaning) with ONE history line naming both (C110); «۴ تا پنجره» untouched; گام ۱ proposal ۳۰


### Negative (look-alike)

1. [chat] <span dir="rtl">[مسئلهٔ موکت] U: اگه عرض ۵ بود چی؟</span> — _context:_ <span dir="rtl">adult; C46 look-alike of a correction</span>  
   → a hypothetical (C46): nothing changes, no proposal is booked; the coach answers
2. [chat] <span dir="rtl">[مسئلهٔ موکت] U: اتاق ۵ تا پنجره داره نه ۴</span> — _context:_ <span dir="rtl">adult; C143 named quantity</span>  
   → only the window count changes; no ledger step is stale (no recorded dependency on windows); no proposal; the width 4 untouched
3. [chat] <span dir="rtl">U: ۲۳ تا سیب رو با ۱۲ تا سبد نمیشه مساوی تقسیم کرد</span> — _context:_ <span dir="rtl">child, 10; C142 look-alike</span>  
   → not a correction («نمیشه» without a replacement value): nothing changes; the coach answers
4. [chat] <span dir="rtl">U: پارسال قیمتش ۲۵۰ نبود، خیلی ارزون‌تر بود</span> — _context:_ <span dir="rtl">adult; C142 look-alike («X نبود، Y بود» needs Y)</span>  
   → not a correction: past narrative, «X نبود» without Y; the price 250 stays; nothing re-marked
5. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ U: آره، همون ۸۸۰۰ درسته</span> — _context:_ <span dir="rtl">adult; a wrong value accepted (C87)</span>  
   → nothing rewritten: 8800 is not the page's proposal (8700); the page says so and keeps the step
6. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ U: نه، ۸۷۰۰ رو قبول ندارم، خودم دستی حساب می‌کنم</span> — _context:_ <span dir="rtl">adult; negation look-alike</span>  
   → not an acceptance: the proposal stays open; nothing rewritten
7. [chat] <span dir="rtl">[مسئلهٔ موکت] U: جمع ۶۹۶۰ نیست، ۶۹۰۰</span> — _context:_ <span dir="rtl">adult; C88 «fixing a result never changes a datum» with a wrong fix</span>  
   → a result fix the page's own check rejects (6000 + 960 = 6960, C8): not applied; the page shows its computation and asks; no datum changes
8. [chat] <span dir="rtl">[مسئلهٔ موکت] U: فکر کنم جوابم غلط باشه؟</span> — _context:_ <span dir="rtl">adult; look-alike of «پس جوابم غلط بود»</span>  
   → a question: nothing is marked rejected, nothing rewritten; the coach answers (C46)
9. [chat] <span dir="rtl">[مسئلهٔ موکت] U: طول ۶ نیست، ۷</span> — _context:_ <span dir="rtl">adult; C66/C112</span>  
   → the length becomes 7; «۶ سال پیش موکت کرده بودیم» is untouched and not stale (equal digits are not dependency, C66); proposals ۲۸، ۷۰۰۰، ۱۱۲۰، ۸۱۲۰ and the exact third ۸۱۲۰/۳ (≈ ۲۷۰۶٫۶۷) — no invented rounding
10. [chat] <span dir="rtl">U: یه اصلاحِ دیگه هم بکنم؟</span> — _context:_ <span dir="rtl">adult; C142 look-alike (lead phrase without content)</span>  
   → a question: no correction, no refusal line; the coach answers
11. [chat] <span dir="rtl">U: ۸ × ۳ = ۲۴، ۴ متر می‌مونه ‖ U: شاخه‌ها ۳ متری نیست، ۴ متری‌ان</span> — _context:_ <span dir="rtl">adult; C141 with a correction (the clause has its own recorded operands)</span>  
   → the product gets the exact proposal ۸ × ۴ = ۳۲ and the remainder clause its own recomputation (if 20 m was stated, 32 − 20 = 12 left over — shown as a proposal, not silently rewritten); the remainder is never treated as a factor of the product
12. [chat] <span dir="rtl">U: عرضِ اتاقِ دوم ۴ نیست، ۳</span> — _context:_ <span dir="rtl">adult; C110 look-alike (same digits, another quantity)</span>  
   → only the second room's width changes; the first room («۶ متر در ۴ متر») and its ledger are untouched; never «both changed» (C110 needs the same meaning)
13. [chat] <span dir="rtl">U: منظورم n از ۱ تا ۲۰ بود</span> — _context:_ <span dir="rtl">teen; C88 range with a bare restatement</span>  
   → with no old range named and one range in the statement, the range «از ۱ تا ۱۵» is replaced as one unit (or the page asks); no other «۱» in the statement changes
14. [chat] <span dir="rtl">U: آهان، اصلاً ۵ متر بود، نه ۴ — اگه ۶ بود چی می‌شد؟</span> — _context:_ <span dir="rtl">adult; C74 mixed message</span>  
   → the fact is a correction (4 ⇒ 5, C74); the hypothetical «اگه ۶ بود» changes nothing and goes to the coach
15. [chat] <span dir="rtl">[مسئلهٔ موکت] U: نصاب ساعتِ ۴ نمیاد، ساعتِ ۵ میاد</span> — _context:_ <span dir="rtl">adult; C143 equal digits with a named quantity</span>  
   → only the hour changes («X نمیشه/نمیاد، Y» about the visit time); the width «۴» and every ledger step are untouched; no proposal
16. [chat] <span dir="rtl">[مسئلهٔ موکت] U: عرض ۴ نیست، ۵ ‖ U: نه ببخشید، همون ۴ درست بود</span> — _context:_ <span dir="rtl">adult; C5/C142 look-alike (a correction undone)</span>  
   → a take-back: the width returns to 4 with both changes in history; the proposals built on 5 are withdrawn (marked superseded), nothing stays stale
17. [chat] <span dir="rtl">U: ۵ × ۵ = ۲۵ تا کاشی لازمه ‖ U: پس جوابم غلط نبود، درسته</span> — _context:_ <span dir="rtl">adult; D29-23 look-alike</span>  
   → not a rejection: nothing is marked «ردشده»; the line keeps its ✓


## R3.prior_work · prior work, «کارِ پیشینِ من» (F17, F11 with story; roadmap §21). ONE judge: every place that judges her arithmetic — 📜 mark, prior-ledger fix, correction, coach line — uses the page's engine and its per-clause export; a second reader may only add «نسنجیده», never contradict the engine — C139 (S1 B29·D11: «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰» was ✓ in the engine and «نمی‌خواند» ×4 in the ledger). A step is never given a text she did not write, and later messages are not redos of a step (D29-7). An unchanged step keeps its reason intact — no cut at «و», no «دلیلِ پیشینی … کنار رفت» (B29·D25); a FIXED step does drop its old reason (C27-21). A second problem's opening with its own worked steps gets its own record and its own prior block (s28 p4 / C25-7′, C97, C7/C56). Her fix is applied when the engine agrees (C8); a dispute is re-checked once (C6/C29); a hypothetical is neither dispute nor correction (C46); a bare question about a calculation opens nothing (C98). Base problem — «مسئلهٔ اسباب‌کشی» (adult, opening ledger): گام ۱ «کامیون ۳ میلیون و ۶۰۰ + کارگر ۱ میلیون و ۴۰۰ = ۵ میلیون» ✓ · گام ۲ «۳۰ تا کارتن، چون سه اتاق و یه آشپزخونه داریم: ۳۰ × ۲۵ هزار = ۷۵۰ هزار» ✓ · گام ۳ «۵ میلیون + ۷۵۰ هزار = ۵ میلیون و ۷۵۰» ✓ · گام ۴ «از ۹ میلیون بودجه: ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۴ میلیون و ۲۵۰» ✗ (3 250 000); resume point گام ۴. pos = the ledger must behave as stated; neg = a look-alike that must not open, extend, re-judge or change it.


### Positive

1. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: آهان، ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۲۵۰</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11 (the ledger re-read «۵ میلیون و ۷۵۰» as 5 and 750 and contradicted the engine)</span>  
   → her fix of گام ۴ is applied: the engine reads 9 000 000 − 5 750 000 = 3 250 000 ✓ (thousand reading), and the ledger uses the SAME verdict (C139): گام ۴ ✓ «اصلاح‌شده به حرفِ خودت», the resume point moves past it; never «گامِ ۴ متنِ تازه هنوز نمی‌خواند»; the coach is told گام ۴ ✓
2. [page] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: آهان، ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۲۵۰</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11, the view the runner saw</span>  
   → PAGE-LEVEL: in her 📜 the line carries ✓ and the ledger step 4 shows ✓ with its old ✗ in history; no line «… هنوز نمی‌خواند» anywhere in 📜; the turn question no longer asks her to re-check گام ۴
3. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: کامیون ۳ میلیون و ۶۰۰ نیست، ۴ میلیون ‖ U: پس ۹ میلیون منهای ۶ میلیون و ۱۵۰ = ۲ میلیون و ۸۵۰</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11, second fix after a datum change («… منهای ۶ میلیون و ۶۰۰ = ۱ میلیون و ۴۰۰» shape)</span>  
   → after the correction (گام ۱ ⇒ ۵ میلیون و ۴۰۰، گام ۳ ⇒ ۶ میلیون و ۱۵۰) her redo of گام ۴ is ✓ (9 − 6.15 = 2.85 million) in the engine AND in the ledger; one judge, no second verdict
4. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۳۵۰</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11, the negative side (one judge also when she is wrong)</span>  
   → a wrong fix is not applied (C8): the ledger says what the ENGINE says — ✗ with «۳ میلیون و ۲۵۰ هزار» and «۳ میلیون و ۹۹۹ هزار و ۲۵۰» in her words (C103); no separate «نمی‌خواند» wording from a second reader
5. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: گامِ ۴: ۹ میلیون منهای ۵ میلیون و ۷۵۰ هزار تومن = ۳ میلیون و ۲۵۰ هزار تومن</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11 with explicit scale words (C135)</span>  
   → applied ✓ — explicit «هزار» and «تومن» are read by the same engine; the ledger never reads «هزار تومن» as an extra factor
6. [prompt] <span dir="rtl">[مسئلهٔ اسباب‌کشی, گام ۴ ✗ «۴ میلیون و ۲۵۰»] U: اون گامِ ۴ رو یه لحظه کنار بذار؛ کارتن‌ها رو چطور ببندم؟</span> — _context:_ <span dir="rtl">adult; C139 rule stated in the prompt view</span>  
   → a second reader that cannot parse a ledger step may only add «نسنجیده» (C139); the prompt never carries two contradicting verdicts for one step (engine ✗ and ledger «✓» or vice versa)
7. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: راستی کارتن‌ها رو مامانم آورد، ۳۰ تا بود</span> — _context:_ <span dir="rtl">adult; D29-7 (each later message became a fake redo of step 1)</span>  
   → not a redo of گام ۱ or گام ۲: no «متنِ تازه‌ات» is recorded for any step; گام ۲ stays as she wrote it (the count agrees)
8. [page] <span dir="rtl">[opening: «گام ۱: پذیرایی ۵ متر در ۴ متر = ۲۰ … گام ۲: …»] U: نه، ۲۰ نیست؛ منظورم طول بود: ۵٫۵ متر</span> — _context:_ <span dir="rtl">adult, parquet; D29-7 shape</span>  
   → PAGE-LEVEL: the ledger shows گام ۱ as «پذیرایی ۵٫۵ متر در ۴ متر = ۲۰» stale with the exact proposal ۲۲, or the page asks; never a fabricated sentence «پذیرایی ۵٫۵ متر در ۴ متر = ۲۰» presented as «متنِ تازه‌ات», and no «گامِ ۱ متنِ تازه هنوز نمی‌خواند» lines in 📜 for her later messages
9. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: کارگر رو هم داداشم پیدا کرد. ساعت ۸ صبح میان.</span> — _context:_ <span dir="rtl">adult; D29-7 negative-shape sentence that must stay inert (asserted as the pos of «no fabrication»)</span>  
   → no ledger step is touched: no redo, no new «متنِ تازه», no stale mark
10. [page] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: آهان، ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۲۵۰</span> — _context:_ <span dir="rtl">adult; B29·D25 (whyLine misfire on unchanged steps, seen in four B runs)</span>  
   → PAGE-LEVEL: گام ۲ (unchanged) keeps its whole reason «۳۰ تا کارتن، چون سه اتاق و یه آشپزخونه داریم» — never cut at «و», never stamped «دلیلِ پیشینی که دیگر برقرار نیست کنار رفت»; only گام ۴ gets a history line
11. [page] <span dir="rtl">[opening: «گام ۱: ۳۶ ÷ ۲ = ۱۸ و نصفِ محیط همینه … گام ۲: …»] U: گامِ ۲ رو درست کردم: …</span> — _context:_ <span dir="rtl">adult, a picture frame; B29·D25 shape</span>  
   → PAGE-LEVEL: گام ۱'s reason stays «۳۶ ÷ ۲ = ۱۸ و نصفِ محیط همینه» byte-exact; no «کنار رفت» line on it; only گام ۲ changes
12. [page] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: گامِ ۲ رو عوض کنم: ۳۲ تا کارتن، چون انباری هم هست: ۳۲ × ۲۵ هزار = ۸۰۰ هزار</span> — _context:_ <span dir="rtl">adult; the C27-21 rule where it SHOULD fire (look-alike of B29·D25)</span>  
   → PAGE-LEVEL: گام ۲ IS fixed (32 × 25 000 = 800 000 ✓), so its OLD reason goes to history with «کنار رفت» — correct here; dependants گام ۳ and گام ۴ get exact proposals (۵ میلیون و ۸۰۰؛ ۳ میلیون و ۲۰۰)
13. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی open] U: یه مسئلهٔ دیگه هم دارم: میزِ آشپزخونه. خودم حساب کردم: گام ۱: دیوار ۲۴۰ سانته؛ گام ۲: ۹۰ + ۷۰ + ۷۰ = ۲۳۰، پس جا میشه.</span> — _context:_ <span dir="rtl">adult; s28 p4 / C25-7′ (no prior block at a second problem's opening)</span>  
   → the second problem gets its own record AND its own prior block (C7/C56 at its opening): two steps with verdicts (۹۰ + ۷۰ + ۷۰ = ۲۳۰ ✓); nothing is merged into the moving ledger
14. [page] <span dir="rtl">[two problems as above]</span> — _context:_ <span dir="rtl">adult; C97 + C25-7′, page view</span>  
   → PAGE-LEVEL: the kitchen-table dossier shows «کارِ پیشینِ تو» with its 2 steps; the moving dossier still shows its own 4 steps only; each 🧭 strip is its own (B29·D15 shape)
15. [events] <span dir="rtl">U: سلام، یه مسئله دارم: می‌خوام قفسه بسازم. خودم حساب کردم: سه تا طبقهٔ ۸۰ سانتی میشه ۳ × ۸۰ = ۲۴۰، اندازهٔ دیوار.</span> — _context:_ <span dir="rtl">adult; C56 one-step opening</span>  
   → one relation with a computed value at the opening fires the prior block, even as the only step (C7/C56): گام ۱ ✓ (240)
16. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی closed] U: یه چیزی یادم اومد: انعامِ کارگرها هم ۲۰۰ هزار شد، پس ۵ میلیون و ۹۵۰</span> — _context:_ <span dir="rtl">adult; C56 after closure</span>  
   → a later report about the SAME problem merges into its ledger after closure (C56): a new step 5.75 M + 0.2 M = 5.95 M ✓ (thousand reading); the closed problem is offered on «امروز», not silently reopened (C36)
17. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: گامِ ۴ رو قبول ندارم، ۹ منهای ۵ و ۷۵۰ همون ۴ و ۲۵۰ میشه</span> — _context:_ <span dir="rtl">adult; C29/C139</span>  
   → a dispute: the page re-checks by recomputation once and keeps ✗ (C6/C29), pointing at the part that does not read («۹ − ۵٫۷۵ = ۳٫۲۵») without overriding the engine; at most one dispute question
18. [events] <span dir="rtl">[opening: «گام ۱: کامیون ۲ میلیون و ۸۰۰ + کارگر ۱ میلیون و ۷۰۰ = ۴ میلیون و ۵۰۰ · گام ۲: ۷ میلیون منهای ۴ میلیون و ۵۰۰ = ۳ میلیون و ۵۰۰»]</span> — _context:_ <span dir="rtl">adult; C139 at the opening (the ledger and the engine agree from the first message)</span>  
   → the prior block judges with the engine: گام ۱ ✓ (2.8 + 1.7 = 4.5 million), گام ۲ ✗ (7 − 4.5 = 2.5 million; ✗ names «۲ میلیون و ۵۰۰ هزار» and the units reading «۲ میلیون و ۹۹۹ هزار و ۵۰۰»); resume point گام ۲
19. [events] <span dir="rtl">[opening as above] U: آره، ۷ میلیون منهای ۴ میلیون و ۵۰۰ میشه ۲ میلیون و ۵۰۰</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11, second shape</span>  
   → her fix lands ✓ in the ledger (one judge); the resume point moves on; the turn question asks the next piece, not گام ۲ again
20. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی closed] U: یه مسئله‌ی دیگه: خونه‌ی جدید ۳ تا اتاق داره؛ خودم حساب کردم ۳ × ۴ = ۱۲ لیتر رنگ لازمه</span> — _context:_ <span dir="rtl">adult; C97 after closure</span>  
   → a new problem after closure gets its own record and its own prior block (one step, 3 × 4 = 12 ✓); the closed moving ledger is never extended (C97, D28-6)
21. [page] <span dir="rtl">[مسئلهٔ اسباب‌کشی, after her fix of گام ۴]</span> — _context:_ <span dir="rtl">adult; S1 family B29·D11, view check (roadmap §21 «کارنامه»)</span>  
   → PAGE-LEVEL: 🧭 and the dossier show «کارِ پیشینِ تو» with گام ۱–۳ ✓ and گام ۴ ✓ (fixed), the counts agree with 📜; the mind card credits the fixed step to her


### Negative (look-alike)

1. [events] <span dir="rtl">U: ۹ منهای ۵ و ۷۵۰ صدم میشه ۳ و ۲۵ صدم دیگه، نه؟</span> — _context:_ <span dir="rtl">adult; C98 look-alike</span>  
   → a bare question about a calculation (C98): no prior block, at an opening or mid-chat; the coach answers
2. [events] <span dir="rtl">U: سلام، ماهِ دیگه اسباب‌کشی داریم؛ بودجه‌ام ۹ میلیونه. از کجا شروع کنم؟</span> — _context:_ <span dir="rtl">adult; C7 look-alike</span>  
   → a bare problem statement with no worked step: no prior block (C7)
3. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: اگه کامیون ۴ میلیون بود چی؟</span> — _context:_ <span dir="rtl">adult; C46</span>  
   → a hypothetical (C46): not a dispute, not a correction; the ledger and its verdicts do not change; no retract block
4. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: راستی بچه‌ها امروز ۲ × ۵ = ۱۰ تا شیرینی خوردن</span> — _context:_ <span dir="rtl">adult; C136 look-alike (runner B judged it right: «not prior work»)</span>  
   → small talk mid-session: ✓ for the arithmetic, but no ledger step, no prior block, no redo of any step
5. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۴ میلیون و ۲۵۰</span> — _context:_ <span dir="rtl">adult; re-typed wrong line</span>  
   → re-typing her ✗ line without objection is not a dispute and not a fix: گام ۴ stays ✗, no «re-checked» message, no second ✗ line in 📜
6. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: یه سؤالِ دیگه: کارتن‌ها رو چطور ببندم که نشکنن؟</span> — _context:_ <span dir="rtl">adult; C97 look-alike</span>  
   → not a new problem with its own unknown that needs a ledger (no statement, no numbers): no second prior block; the coach answers inside the same session
7. [events] <span dir="rtl">[opening as in the base] U: باشه، از گامِ ۴ شروع کنیم</span> — _context:_ <span dir="rtl">adult; resume-point look-alike</span>  
   → the resume question never asks again for steps 1–3 (they are ✓); nothing is re-judged
8. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۲۵۰، درسته؟</span> — _context:_ <span dir="rtl">adult; C98/C139 boundary — ambiguity noted</span>  
   → a fix with a question tag still lands (✓ by the engine) and the coach answers «درسته»; not treated as a bare question about someone else's number (C98 is for a question with no worked claim of hers in the ledger context)
9. [page] <span dir="rtl">[مسئلهٔ اسباب‌کشی] (no message changes گام ۲)</span> — _context:_ <span dir="rtl">adult; B29·D25 control</span>  
   → PAGE-LEVEL: at the end of the session گام ۲ has no history line at all (no «کنار رفت», no «اصلاح شد»)
10. [events] <span dir="rtl">U: یه مسئلهٔ دیگه: دخترم می‌پرسه ۷ × ۸ چند میشه</span> — _context:_ <span dir="rtl">adult; C97 vs C7 boundary</span>  
   → a separate question with its own unknown gets its own record if she calls it «مسئله» (C97), but no prior block (no worked step); the moving ledger is untouched
11. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: همون ۵ میلیون و ۷۵۰ که خودت گفتی رو قبول دارم</span> — _context:_ <span dir="rtl">adult; C79</span>  
   → repeating the coach's or page's number as hers keeps it hers (C79); no «کارِ دیگری»; no new step
12. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: ۱۸ + ۱۲ = ۳۰ تا کارتن؛ مامانم کمکم کرد بشمارم</span> — _context:_ <span dir="rtl">adult; C136 look-alike (runner C judged «مامانم کمکم کرد» right)</span>  
   → her own sentence that mentions a helper stays hers (C96): a step of her ledger with ✓, never «کارِ دیگری»; no redo of گام ۲ text since the count is the same
13. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: داداشم حساب کرد ۳ × ۲۵۰ هزار = ۷۵۰ هزار برای کارتن</span> — _context:_ <span dir="rtl">adult; C57 look-alike</span>  
   → another person's calculation: «کارِ دیگری» (C57/C125), checked ✓ but never booked as her step or a redo of گام ۲
14. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: گامِ ۲ درسته دیگه؟</span> — _context:_ <span dir="rtl">adult; C98 look-alike</span>  
   → a bare question about her own ✓ step: no dispute, no re-check message, no change; the coach answers
15. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: کامیون ۳ میلیون و ۶۰۰ بود؛ همون رو گفتم</span> — _context:_ <span dir="rtl">adult; D29-7 look-alike</span>  
   → restating a datum unchanged: no correction, no history line, no redo of گام ۱
16. [events] <span dir="rtl">[مسئلهٔ اسباب‌کشی] U: ۵ میلیون و ۷۵۰ هزار تومن = ۵ میلیون و ۷۵۰</span> — _context:_ <span dir="rtl">adult; C139 look-alike</span>  
   → an identity she writes about her own scale (thousand reading, ✓); it changes no step and the ledger does not re-read it with a second reader


## R4.date_ask_engine · the date-ask engine (F6). «زنگ زدم» with two open call plans ⇒ «کدام؟» naming both, nothing closes until she answers; her answer closes only the one she names — C117, at page level in the B and D shapes (C held — compare the paths). An edit of a message changes only the records born of the edited clause; another act's deadline from the same message is never closed or moved — C144. «آره، فردا و پس‌فردا» answering two open asks books both in order; a single yes binds the newest (C49); an explicit day answering the ✏️ past-day ask books it; restating the asked day books it (D29-25 regression) — C145. A past-tense act with a past day records that act as done on that day, with no «کدام روز؟» — C146 (C93 is only for a plan whose day lands in the past). A day answers only the act in its own clause; a mood sentence never moves a plan; a past day said for a plan gets C93's question, never next year — C147. Her own «یعنی حدودِ ⟨day⟩» books that day with her words and no question — C133. A forecast clause is the forecast reader's: no 📌 and no 📅 plan ask from it — C152/C132. Weeks run Saturday–Friday; offsets are asserted in the verify script. pos = the ask / booking / closing stated; neg = a look-alike with no ask (or the stated different result).


### Positive

1. [time] <span dir="rtl">[booked: 📌 «فردا به بانک زنگ می‌زنم» (D0+1) and 📌 «پس‌فردا به صاحب‌خونه زنگ می‌زنم» (D0+2)] [clock → D0+1] U: زنگ زدم</span> — _context:_ <span dir="rtl">adult; B29·D19 shape (the call she had not made was closed)</span>  
   → the page asks «کدام؟» naming both («به بانک» / «به صاحب‌خونه»); NOTHING closes until she answers; PAGE-LEVEL: both stay in the open-plans list
2. [time] <span dir="rtl">[same two calls] [clock → D0+1] U: زنگ زدم ‖ [page: «کدام؟»] ‖ U: به بانک</span> — _context:_ <span dir="rtl">adult; A29-6 + C117</span>  
   → the bank call closes «انجام شد» on D0+1; the landlord call stays open on D0+2; PAGE-LEVEL: «امروز» and the plan list show the bank done and the landlord open (A29-6: the answer had no visible effect)
3. [time] <span dir="rtl">[same two calls] [clock → D0+1] U: به بانک زنگ زدم. صاحب‌خونه بمونه برای فردا</span> — _context:_ <span dir="rtl">adult; B29·D19 (her reopening sentence was not read)</span>  
   → bank closed on D0+1 (named object, no «کدام؟»); «صاحب‌خونه بمونه برای فردا» is read as the landlord call's day counted from D0+1, i.e. D0+2 — its own booked day, so it stays booked there with no new ask; it is never closed
4. [time] <span dir="rtl">[one ask row for two acts: «گاز ⟨D0+2⟩ · مدرسه ⟨D0+3⟩ — درست است؟»] U: زنگ زدم</span> — _context:_ <span dir="rtl">adult; D29-18 shape (one plan «انجام شد», the ask vanished, the school call nowhere)</span>  
   → the page asks «کدام؟» (C117); the pending date ask is neither booked nor silently dropped — it stays open or is closed with «بی‌جواب ماند» shown; the school call is never lost from every list
5. [time] <span dir="rtl">[same row] U: ⟨D0+2, written as day + month name⟩ و ⟨D0+3, written as day + month name⟩ درسته</span> — _context:_ <span dir="rtl">adult; D29-18 + C145 «X درسته» with two days</span>  
   → both acts are booked: gas on D0+2, school on D0+3; never «هیچ» (D29-18: «۲ آذر و ۳ آذر درسته» booked nothing)
6. [time] <span dir="rtl">[two pending asks: «فردا بانک — ⟨D0+1⟩ — درست است؟», «پس‌فردا صاحب‌خونه — ⟨D0+2⟩ — درست است؟»] U: آره، فردا و پس‌فردا</span> — _context:_ <span dir="rtl">adult; B29·D18 (only the landlord was booked, «فردا» re-anchored)</span>  
   → both are booked in order: bank D0+1, landlord D0+2; [clock → D0+1] the bank call is never re-asked as «D0+2 (به‌جای D0+1)» — «فردا» stays anchored to the day she said it (C49)
7. [edit] <span dir="rtl">[📌 «پنجشنبه جلسه با مدیر» booked; ✏️ → «سه‌شنبه جلسه با مدیر», and that Tuesday has passed] [page: «این روز گذشته — کدام روز؟»] U: سه‌شنبه‌ی هفته‌ی بعد، ⟨D0+8, written as day + month name⟩</span> — _context:_ <span dir="rtl">adult; B29·D20</span>  
   → clock on a Monday: «سه‌شنبه‌ی هفته‌ی بعد» = D0+8 and matches the written day, so it is booked on D0+8; the meeting stays in the open-plans list; never «پرسشِ تاریخ بی‌جواب ماند» and never «هنوز تأیید نشده» after this answer
8. [time] <span dir="rtl">[page: «پس‌فردا — ⟨D0+2⟩ — درست است؟»] U: باشه، پس‌فردا صبح انجامش میدم</span> — _context:_ <span dir="rtl">adult; D29-25 regression</span>  
   → booked on D0+2 (a yes plus her restating the asked day, C49); never «بی‌جواب ماند و چیزی ثبت نشد»
9. [time] <span dir="rtl">[page: «پس‌فردا — ⟨D0+2⟩ — درست است؟»] U: یادداشتش کردم. پس‌فردا صبح انجامش میدم</span> — _context:_ <span dir="rtl">adult; D29-25 shape («ثبتش کردم. …», round 28 booked it)</span>  
   → booked on D0+2 — restating the asked day books it even without «بله» (C49/C145); the past-tense «یادداشتش کردم» refers to her own note and closes nothing
10. [edit] <span dir="rtl">U (original): پنجشنبه با مدیرم جلسه دارم و تا ⟨D0+30, written as day + month name⟩ باید امتحانِ آیلتس بدم ‖ ✏️ → سه‌شنبه با مدیرم جلسه دارم و تا ⟨D0+30, …⟩ باید امتحانِ آیلتس بدم</span> — _context:_ <span dir="rtl">adult; B29·D21 (the ✏️ closed the other act's deadline)</span>  
   → only the meeting is re-dated (one confirm for the new Tuesday); the exam deadline D0+30 is untouched: never «جایگزین شد؛ روزِ تازه پرسیده شد» on it; PAGE-LEVEL: the exam stays in «امروز» / the plan list
11. [edit] <span dir="rtl">U (original): فردا بانک، پس‌فردا داروخونه ‖ ✏️ → فردا بانک، سه روز دیگه داروخونه</span> — _context:_ <span dir="rtl">adult; C144 with two plans in one sentence</span>  
   → only the pharmacy act changes: D0+2 ⇒ D0+3 counted from the day the sentence was SAID (C93), one confirm; the bank plan keeps its booking and history has no line for it
12. [time] <span dir="rtl">[open 📌 «⟨D0−5⟩ برم بانک فرم رو بدم» still open] U: ⟨D0−3, written as day + month name⟩ رفتم بانک و فرم رو دادم</span> — _context:_ <span dir="rtl">adult; C146 (runner C's question to the coordinator)</span>  
   → the bank act is recorded done on D0−3 (C94/C146); no «کدام روز؟», no plan date, no «این روز گذشته» question
13. [edit] <span dir="rtl">[📌 «فردا می‌رم بانک»] ✏️ → ⟨D0−2, written as day + month name⟩ رفتم بانک</span> — _context:_ <span dir="rtl">adult; C146 vs C93 in the ✏️ path</span>  
   → a past-tense act with a past day: recorded done on D0−2; C93's «این روز گذشته — کدام روز؟» is NOT asked (C146: it applies only to a plan whose day lands in the past)
14. [time] <span dir="rtl">[pending «⟨D0−1⟩ می‌رم داروخونه … گذشته — کدام روز؟»] U: پسفردا می‌رم بیمه رو تمدید کنم</span> — _context:_ <span dir="rtl">adult; C29-6 (the insurance day booked the pharmacy ask; ZWNJ missing in «پسفردا»)</span>  
   → a NEW plan «بیمه» on D0+2 with its own confirm; the pharmacy ask stays open and untouched — never «📌 «… داروخونه» — D0+2»; PAGE-LEVEL: the plan list contains the insurance plan
15. [time] <span dir="rtl">U: اندازه‌گیریِ بعدی ⟨D0−20, written as day + month name⟩ ـه</span> — _context:_ <span dir="rtl">adult; A29-17 (30 Aban said on 3 Dey became next year)</span>  
   → a plan whose stated day is already past ⇒ «این روز گذشته — کدام روز؟» (C93/C147); never the same day of next year offered or booked
16. [time] <span dir="rtl">U: بنگاه پنجشنبه، بانک هم پنجشنبه ‖ [two asks] ‖ U: بانک پنجشنبه نه، شنبه</span> — _context:_ <span dir="rtl">adult, clock on a Tuesday (Thursday = D0+2, Saturday = D0+4); A28-1 p24 STILL in round 29</span>  
   → only the bank moves to the first Saturday after D0 (with its confirm); the agency stays on Thursday; the negated Thursday is never booked for the bank (C51/C92)
17. [time] <span dir="rtl">U: وسطِ ماهِ دیگه، یعنی حدودِ ⟨day 15 of the next Jalali month, written as day + month name⟩، کولر رو سرویس می‌کنم</span> — _context:_ <span dir="rtl">adult; C29-21, D29-20, A29-5 (two contradictory asks)</span>  
   → booked on that day with her own words as label («از حرفِ خودت: حدودِ …»); no «وسطِ ماه — کدام روز؟» row and no «… درست است؟» (C133)
18. [time] <span dir="rtl">[pending «وسطِ ماه — کدام روز؟» for «وسطِ ماه بیمه رو تمدید می‌کنم»] U: وسطِ ماه یعنی حدودِ ⟨day 15 of D0's Jalali month or the next, as she writes it⟩</span> — _context:_ <span dir="rtl">adult; A29-5 (a second row remained)</span>  
   → her reply answers the pending row: booked with her words, one row in all (no second row, no extra confirm)
19. [page] <span dir="rtl">[after the two entries above]</span> — _context:_ <span dir="rtl">adult; C133 view check</span>  
   → PAGE-LEVEL: «امروز» shows exactly one row per act with the day she gave; no row reads «کدام روز؟» for an act already booked
20. [time] <span dir="rtl">[booked 📌 «فردا ساعت ۱۰ کلاس» (D0+1) via «اینو ثبتش کن: فردا ساعت ۱۰ کلاس …»] [clock → D0+2]</span> — _context:_ <span dir="rtl">adult; B29·D22</span>  
   → PAGE-LEVEL: «امروز» shows no stray «↩ خواسته‌ای که گذاشتی برای بعد» for this plan; one commitment, one record (C52)
21. [time] <span dir="rtl">[pending two asks: «فردا بانک», «پس‌فردا صاحب‌خونه»] U: فردا آره، پس‌فردا نه، شنبه</span> — _context:_ <span dir="rtl">adult, clock on a Wednesday (Saturday = D0+3); C145 with a mixed answer</span>  
   → bank booked on D0+1; the landlord moves to the first Saturday after D0 with one confirm; the negated «پس‌فردا» is never booked (C51, C145)
22. [time] <span dir="rtl">U: سرِ برج قسطِ بیمه رو می‌دم و آخرِ ماه هم اجاره رو</span> — _context:_ <span dir="rtl">adult; C145 with idioms</span>  
   → two acts, two asks: day 1 of the next Jalali month (C50) and the last day of D0's Jalali month (C37), each «… درست است؟»; a later «آره، هر دو» books both (C145)


### Negative (look-alike)

1. [time] <span dir="rtl">[two pending asks as in C145] U: آره</span> — _context:_ <span dir="rtl">adult; C145 «a single yes binds the newest»</span>  
   → a bare yes binds only the newest ask (C49): the landlord call on D0+2 is booked; the bank ask stays open
2. [time] <span dir="rtl">[pending «پنجشنبه برهانِ دوم رو می‌نویسم — ⟨first Thursday after D0⟩ — درست است؟»] U: امروز خیلی خسته‌ام، دیشب بد خوابیدم</span> — _context:_ <span dir="rtl">adult; A29-12</span>  
   → a mood sentence never moves a plan (C147): the Thursday ask stays as it is; never re-dated to today
3. [time] <span dir="rtl">U: ۶۰ درصد مطمئنم جمعه بارون میاد و کوه کنسل میشه</span> — _context:_ <span dir="rtl">adult; B29·D8 / C29-7 shape, date side</span>  
   → no 📌, no 📅 plan ask «در «امروز» بیاید؛ درست است؟» from the date reader (C152); the only question is the 🎯 due confirm, owned by forecast
4. [time] <span dir="rtl">[one open 📌 «فردا به بانک زنگ می‌زنم»] [clock → D0+1] U: زنگ زدم</span> — _context:_ <span dir="rtl">adult; C117 look-alike with one candidate</span>  
   → one call plan: it closes «انجام شد» on D0+1 with no «کدام؟» (C94)
5. [time] <span dir="rtl">[open 📌 «فردا به بانک زنگ می‌زنم»] U: هفتهٔ پیش به مامانم زنگ زدم، حالش خوب بود</span> — _context:_ <span dir="rtl">adult; C94 look-alike</span>  
   → another object and a past week: the bank call does not close; no ask
6. [time] <span dir="rtl">[open 📌 «فردا می‌رم بانک»] U: داداشم دیروز رفت بانک</span> — _context:_ <span dir="rtl">adult; C146 look-alike</span>  
   → another person's past act (C19): nothing closes, no ask
7. [time] <span dir="rtl">U: دیروز رفتم کتابخونه، کتابِ آمار رو گرفتم</span> — _context:_ <span dir="rtl">teen, 16; C146 look-alike</span>  
   → a past narrative with no open plan: no plan, no «کدام روز؟», no «انجام شد» row invented
8. [time] <span dir="rtl">[pending pharmacy «کدام روز؟»] U: پسفردا مامانم می‌ره داروخونه</span> — _context:_ <span dir="rtl">adult; C29-6 look-alike</span>  
   → another person's act: no plan of hers, and the pending pharmacy ask is NOT answered by this day (C147/C19)
9. [time] <span dir="rtl">U: اگه شنبه برم بانک، فرم رو هم می‌برم</span> — _context:_ <span dir="rtl">adult; C35</span>  
   → a conditional (C35): nothing booked, nothing asked
10. [time] <span dir="rtl">U: وسطِ ماه کارگر میاد کولر رو ببینه</span> — _context:_ <span dir="rtl">adult; runner C judged this right (aC3 p45)</span>  
   → a fact about another person (C19/C34): no plan of hers, no «کدام روز؟»
11. [time] <span dir="rtl">[page: «پس‌فردا — ⟨D0+2⟩ — درست است؟»] U: نه، پس‌فردا نمی‌تونم</span> — _context:_ <span dir="rtl">adult; D29-25 look-alike (restating a day inside a negation)</span>  
   → a negated day is never booked (C51); the page asks which day
12. [edit] <span dir="rtl">U (original): پنجشنبه با مدیرم جلسه دارم و تا ⟨D0+30, …⟩ باید امتحان بدم ‖ ✏️ → پنجشنبه با مدیرِ بخش جلسه دارم و تا ⟨D0+30, …⟩ باید امتحان بدم</span> — _context:_ <span dir="rtl">adult; C144 look-alike</span>  
   → an edit that changes neither day: no re-dating, no new ask for either act; history notes the text change only
13. [time] <span dir="rtl">[page: «📌 … — ⟨D0+1⟩ — درست است؟»] U: آره، راستی کتابی که گفتی رو خریدم</span> — _context:_ <span dir="rtl">adult; C94 look-alike</span>  
   → the yes books the pending ask (C49); «خریدم» about a book closes no plan unless a plan «کتاب رو بخرم» is open
14. [edit] <span dir="rtl">[📌 «فردا می‌رم بانک»] ✏️ → ⟨D0−2, written as day + month name⟩ می‌رم بانک</span> — _context:_ <span dir="rtl">adult; C146/C93 boundary</span>  
   → a plan (not past tense) whose day is now past: C93 asks «این روز گذشته — کدام روز؟» and keeps the booking until she answers — the C146 path is not taken
15. [time] <span dir="rtl">U: ⟨D0+5, written yyyy/m/d⟩ تحویلِ پروژه‌ی همکارمه</span> — _context:_ <span dir="rtl">adult; written date look-alike</span>  
   → a date that is a fact about someone else (C34/C19): no ask
16. [time] <span dir="rtl">[booked 📌 «فردا بانک» (D0+1)] U: آره، فردا می‌رم</span> — _context:_ <span dir="rtl">adult; C49 look-alike</span>  
   → restating the booked day books nothing new: no second row, no new ask (C52)


## R5.forecast · forecasts 🎯 (F4). What the percent attaches to decides (C148, narrowing C118): «با N٪ X» / «با N درصد X» with a quantity word X (افزایش، تخفیف، پرت، راندمان، اصطکاک، سود، مالیات، بهره، کارمزد …), «N درصدِ Y», «با راندمانِ N٪», «یعنی N لیتر» are DATA, never a confidence; a percentage that ends its phrase or is followed by «اطمینان» after a predicted value or a quoted claim IS its confidence, as are the belief words of C90 (مطمئن، احتمال، فکر کنم، شانس، می‌دم) and the answer to the page's «چند درصد؟». A report on an existing 🎯 («گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا») settles it and makes no new 🎯. The forecast reader runs before the date reader: a weekday or date in a forecast is the 🎯's due date through ONE confirm, never a 📅 plan ask, never «بی موعد» — C152/C132. One clause with two outcomes and two confidences makes two 🎯 — C90; a restatement («یعنی: …») or a replay makes no duplicate (A29-16, C29-8). An outcome settles only a 🎯 about it; numeric outcomes are judged by the numbers; corrections, past confidences and unrelated sentences never settle and never ask «شد یا نشد؟» — C91; «حدودِ N»: equal ⇒ شد, otherwise ask, and no ask from an unrelated line — C120 (A29-24). Plain «مطمئنم» ⇒ ask the number once; a bare number answers it — C119/C122. A 🎯 is filed under the problem it is about — C121. The 🎯 text strips lead words and counters — C90. pos = the 🎯 behaviour stated; neg = a look-alike that must not create, settle, update or ask.


### Positive

1. [events] <span dir="rtl">U: یه پیش‌بینی: اجاره‌ی سالِ بعد با ۱۸٪ افزایش میشه ۱۵ × ۱٫۱۸ = ۱۷٫۷ میلیون؛ ۷۵ درصد مطمئنم</span> — _context:_ <span dir="rtl">adult, renting; C148 (a data percent and a confidence in one sentence)</span>  
   → exactly ONE 🎯 with confidence 75% (the «۱۸٪ افزایش» is a datum, C148); its text is the outcome («اجاره‌ی سالِ بعد … ۱۷٫۷ میلیون میشه»), without «یه پیش‌بینی:» and the counter; the arithmetic 15 × 1.18 = 17.7 is ✓
2. [events] <span dir="rtl">[open 🎯 «۵ تا قفسه تا جمعه سوار می‌کنم» 70%] U: گفته بودم ۵ تا با ۷۰ درصد، شد ۴ تا</span> — _context:_ <span dir="rtl">adult; C148 positive look-alike («گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا»)</span>  
   → a report on the existing 🎯: it settles «نشد» by the numbers (4 < 5, C91); NO new 🎯 from «با ۷۰ درصد»
3. [events] <span dir="rtl">[open 🎯 «نمره‌ی پایانی بالای ۱۸ میشه» 80%] U: ۱۹ گرفتم، همون‌طور که با ۸۰ درصد گفته بودم</span> — _context:_ <span dir="rtl">teen, 17; C148 look-alike («همون‌طور که با ۹۰ درصد گفته بودم»)</span>  
   → settles «شد» (19 > 18); no new 🎯 and no confidence update from the past «با ۸۰ درصد گفته بودم»
4. [events] <span dir="rtl">U: یه پیش‌بینیِ تازه: «برای ۴۰ بهترین تعداد ۱۵ است» با ۶۵٪ اطمینان</span> — _context:_ <span dir="rtl">adult; C148 look-alike («… ۱۱ است» با ۷۰٪ اطمینان»)</span>  
   → one 🎯, 65%, text «برای ۴۰ بهترین تعداد ۱۵ است»; «با ۶۵٪ اطمینان» after a quoted claim is its confidence (C148)
5. [events] <span dir="rtl">U: تمرین‌های فصلِ ۶ رو تا چهارشنبه تموم می‌کنم. ۸۰ درصد.</span> — _context:_ <span dir="rtl">adult, clock on a Saturday (Wednesday = D0+4); C29-7 p45 shape</span>  
   → one 🎯 at 80% (a percentage ending its phrase right after a predicted outcome, C148); its due date is the first Wednesday after D0 through the single «موعدِ این پیش‌بینی … است؟» confirm (C152); no 📅 plan ask
6. [events] <span dir="rtl">U: احتمالش ۳۰ درصده که پنجشنبه کلاسِ جبرانی تشکیل بشه</span> — _context:_ <span dir="rtl">adult, clock on a Monday (Thursday = D0+3); C29-7, B29·D8</span>  
   → one 🎯 at 30%; the forecast reader runs first (C152): its due date is the first Thursday after D0 through ONE confirm; never «📅 … در «امروز» بیاید؛ درست است؟», never «بی موعد»
7. [page] <span dir="rtl">U: احتمالش ۳۰ درصده که پنجشنبه کلاسِ جبرانی تشکیل بشه ‖ [page: «موعدِ این پیش‌بینی ⟨D0+3⟩ است؟»] ‖ U: آره</span> — _context:_ <span dir="rtl">adult, clock on a Monday; C132/C152 at page level (B and C shapes)</span>  
   → PAGE-LEVEL: the 🎯 book lists it under «باز» with due D0+3; «امروز» has no plan row for it and no «بی‌جواب ماند … به‌شکلِ پرسش می‌ماند» line later
8. [events] <span dir="rtl">U: ۸۰ درصد مطمئنم کابینت تا آخرِ ماه نصب میشه</span> — _context:_ <span dir="rtl">adult; D29-14 («تا آخرِ آذر» shown as no due date)</span>  
   → one 🎯 at 80% with due date the last day of D0's Jalali month (C37) through one confirm; never «موعدی نگفتی»
9. [events] <span dir="rtl">U: فکر کنم ۷۰ درصد کارتن‌ها تا جمعه بسته میشن</span> — _context:_ <span dir="rtl">adult; C136: a sentence a runner judged a 🎯 must stay one (see ambiguities on «N درصد Y»)</span>  
   → one 🎯 at 70% due the first Friday after D0 — the belief word «فکر کنم» makes it a confidence (C90/C148), as runner D judged; no 📌
10. [events] <span dir="rtl">U: ۷۵ درصد مطمئنم ریاضی ۱۸ میشم و ۵۵ درصد که فیزیک ۱۶ بشم</span> — _context:_ <span dir="rtl">teen, 17; B29·D17</span>  
   → TWO 🎯: «ریاضی ۱۸ میشم» 75% and «فیزیک ۱۶ بشم» 55%, each with its own text; never one 🎯 «ریاضی ۱۸ میشم و ۵۵ درصد که فیزیک …»
11. [events] <span dir="rtl">[two 🎯 as above] U: ریاضی ۱۸ شدم، فیزیک ۱۵</span> — _context:_ <span dir="rtl">teen, 17; B29·D17 (one 🎯 settled «شد» although listening failed)</span>  
   → math settles «شد» (18 ≥ 18), physics «نشد» (15 < 16); the calibration counts one hit and one miss
12. [events] <span dir="rtl">U: ۸۰ درصد مطمئنم مهمونا قبل از ۸ می‌رسن و ۶۰ درصد مطمئنم غذا کم نمیاد</span> — _context:_ <span dir="rtl">adult; C90 positive (worked in round 29 D, must keep)</span>  
   → two 🎯 (80%, 60%), each with its own text; «قبل از ۸» is part of the first outcome, not a date ask
13. [events] <span dir="rtl">U: مطمئنم آزمونِ آزمایشیِ شنبه حدودِ ۶٫۵ میشه</span> — _context:_ <span dir="rtl">adult, IELTS; B29·D23 (no 🎯 and no ask)</span>  
   → plain «مطمئنم» without a number: the page asks the number once (C119); the due date (first Saturday after D0) waits for the 🎯; no 📅 plan ask
14. [events] <span dir="rtl">U: مطمئنم آزمونِ آزمایشیِ شنبه حدودِ ۶٫۵ میشه ‖ [page: «چند درصد؟»] ‖ U: ۶۰</span> — _context:_ <span dir="rtl">adult; B29·D23 / C122 reachable once C119 asks</span>  
   → a bare «۶۰» answers the page's question: one 🎯 at 60% (C122)
15. [events] <span dir="rtl">U: تقریباً مطمئنم بچه‌ها از آزمونِ کوتاه استقبال می‌کنن</span> — _context:_ <span dir="rtl">adult, teacher; C90</span>  
   → the page asks the number once (C90); nothing else
16. [events] <span dir="rtl">[🎯 «گزارش رو تا آخرِ هفته‌ی بعد تحویل میدم» 70%] U: الان دیگه ۸۵ درصد مطمئنم، نه ۷۰</span> — _context:_ <span dir="rtl">adult; C77</span>  
   → the same 🎯 is updated to 85% with history «اصلاح شد ⇐ ۷۰» (C77); no second 🎯
17. [events] <span dir="rtl">[🎯 «تو کوییز فقط ۱ سؤال غلط می‌زنم» 60%] U: پیش‌بینیم ۱ بود، شد ۲</span> — _context:_ <span dir="rtl">adult; C29-22 (owner bank 68)</span>  
   → settled «نشد» from the numbers (C91); never «شد یا نشد؟»
18. [events] <span dir="rtl">[🎯 «کارتن‌ها روی هم حدودِ ۵۰ تا میشن» 70%] U: ۵۳ تا شد</span> — _context:_ <span dir="rtl">adult; D29-21 («۴۲ تا شد» against «حدودِ ۴۰» got no reaction)</span>  
   → the page asks «این حدودِ ۵۰ حساب می‌شود؟» (C120); never silent, never settled by an invented tolerance
19. [events] <span dir="rtl">[🎯 «کارتن‌ها روی هم حدودِ ۵۰ تا میشن» 70%] U: دقیقاً ۵۰ تا شد</span> — _context:_ <span dir="rtl">adult; C120</span>  
   → settled «شد» (equal to N, C120)
20. [events] <span dir="rtl">[🎯 «جلسه‌ی اولِ باشگاه خسته می‌شم ولی می‌رم» 70%] U: دیروز رفتم باشگاه! خسته شدم ولی رفتم، همون که پیش‌بینی کرده بودم</span> — _context:_ <span dir="rtl">adult; B29·D4</span>  
   → that 🎯 settles «شد»; the page never offers «کدام؟» with a non-forecast sentence as a candidate; PAGE-LEVEL: the mind card counts 1 of 1 for it
21. [events] <span dir="rtl">[two 🎯: «مدیرم تا جمعه تأیید می‌کنه» 70%, «همکارم تا جمعه ثبت‌نام می‌کنه» 40%] U: یکی از پیش‌بینی‌های ۷۰ درصدیم درست شد</span> — _context:_ <span dir="rtl">adult; C91 (a confidence that names one candidate)</span>  
   → one candidate by confidence: the manager 🎯 settles «شد»; no «کدام؟»
22. [events] <span dir="rtl">[the marbles forecast said once: «احتمالِ دو قرمز حدودِ ۲۵٪ درمیاد، ۶۰ درصد مطمئنم»] U: حساب کردم، همون ۲۵٪ درست درومد</span> — _context:_ <span dir="rtl">teen; C29-8 regression</span>  
   → exactly one 🎯 exists (60%; the 25% is the predicted value), and it settles «شد» with no «کدام؟»
23. [events] <span dir="rtl">[problems: «اسباب‌کشی» and «میزِ آشپزخونه» (focused)] U: ۷۰ درصد مطمئنم بودجه‌ی اسباب‌کشی برای رنگ کافی میشه</span> — _context:_ <span dir="rtl">adult; B29·D7</span>  
   → the 🎯 is filed under «اسباب‌کشی», the problem it is about (C121), not under the focused table problem
24. [events] <span dir="rtl">[focused: a probability puzzle; a course dossier «دورهٔ آمار» open] U: ۶۰ درصد مطمئنم کوییزِ فصلِ ۳ رو کامل جواب میدم</span> — _context:_ <span dir="rtl">adult; C28-19 / C29 pwC2 p37</span>  
   → filed under the course dossier it is about, not the puzzle (C121)
25. [events] <span dir="rtl">U: باشه، قبل از این‌که حساب کنم، حدسم اینه که جواب حدودِ ۴۰٪ باشه. ۷۰ درصد مطمئنم.</span> — _context:_ <span dir="rtl">adult; C29-26</span>  
   → one 🎯 at 70% whose text is «جواب حدودِ ۴۰٪ باشه» — lead words «باشه، قبل از این‌که حساب کنم، حدسم اینه که» stripped (C90); the 40% is the predicted value


### Negative (look-alike)

1. [events] <span dir="rtl">U: اجاره با ۱۸٪ افزایش میشه ۱۵ × ۱٫۱۸ = ۱۷٫۷ میلیون</span> — _context:_ <span dir="rtl">adult; A29-4 s01 (a false 🎯 at 22%)</span>  
   → NO 🎯 (a data percent: «با N٪ افزایش»), no «شد یا نشد؟» later, nothing in «امروز»; the arithmetic is ✓ (15 × 1.18 = 17.7)
2. [events] <span dir="rtl">U: با ۱۲ درصد برای درز و دوخت میشه ۴٫۵ × ۱٫۱۲ = ۵٫۰۴ متر پارچه</span> — _context:_ <span dir="rtl">adult, sewing; A29-4 pA3</span>  
   → NO 🎯; arithmetic ✓ (4.5 × 1.12 = 5.04)
3. [events] <span dir="rtl">U: ۱۰۰ × ۰٫۴ = ۴۰ وات هیدرولیکی؛ با ۱۵٪ اصطکاک ۳۴ وات مفید</span> — _context:_ <span dir="rtl">adult, engineer; B29·D6</span>  
   → NO 🎯 (B29·D6: «اطمینان: ۲۰٪» was the friction); no «شد یا نشد؟» on later prior-work reports; 40 × 0.85 = 34 ✓ if read
4. [events] <span dir="rtl">U: پمپ‌ها حدودِ ۴۰ تا ۵۰ درصدن. با راندمانِ ۴۵٪ میشه ۹۰۰ ÷ ۰٫۴۵ = ۲۰۰۰ وات</span> — _context:_ <span dir="rtl">adult; C29-9</span>  
   → NO 🎯 (efficiency, C148); no «شد یا نشد؟» next turn; 900 / 0.45 = 2000 ✓
5. [events] <span dir="rtl">U: با ۸ درصد پرت، ۲۵ × ۱٫۰۸ = ۲۷ متر</span> — _context:_ <span dir="rtl">adult; D29-3 tD1</span>  
   → NO 🎯; no «⇐ نشد» from a later unrelated sentence; 25 × 1.08 = 27 ✓
6. [events] <span dir="rtl">U: ۳۰ لیتر شربت با ۱۲٪ یعنی ۳٫۶ لیتر شکر</span> — _context:_ <span dir="rtl">adult; D29-3 s36 («۲۰ لیتر یعنی ۲ لیتر نمک»)</span>  
   → NO 🎯 («یعنی N لیتر» marks a datum, C148); 30 × 0.12 = 3.6
7. [events] <span dir="rtl">U: خرج‌مون هر سال حدود ۲۵ درصد زیاد میشه، ولی حقوقم فقط حدود ۱۵ درصد</span> — _context:_ <span dir="rtl">elder, 67; C136 look-alike from the round-29 B transcripts</span>  
   → NO 🎯 — the percents are rates of change (a quantity word after N درصد), even with the future verb «زیاد میشه»
8. [events] <span dir="rtl">U: اگه بفروشیم، خریدار ۳ درصد کمیسیون میده</span> — _context:_ <span dir="rtl">adult; C136 look-alike («… ۵ درصد کمیسیون میده»)</span>  
   → NO 🎯 — «میده» (he gives) is not the belief word «می‌دم» (I give, C90); a fee rate
9. [events] <span dir="rtl">U: فروشنده گفت از ماهِ بعد ۱۲٪ گرون میشه</span> — _context:_ <span dir="rtl">adult; C136 look-alike</span>  
   → NO 🎯 and not someone else's confidence: a datum with a source label (C96/C125)
10. [events] <span dir="rtl">U: الان ۶ هزار کاربر داریم و ماهی حدودِ ۵٪ رشد می‌کنیم</span> — _context:_ <span dir="rtl">adult; C136 look-alike</span>  
   → NO 🎯 (a growth rate)
11. [events] <span dir="rtl">U: صاحبخونه قبول کرد: ۵ ساله با افزایشِ ۲۰٪</span> — _context:_ <span dir="rtl">adult; C136 look-alike (past datum)</span>  
   → NO 🎯, and it settles nothing (no open 🎯 is about this)
12. [events] <span dir="rtl">U: مشاور گفت ۸۰ درصد مطمئنه صاحبخونه اجاره رو بالا نمی‌بره</span> — _context:_ <span dir="rtl">adult; C75</span>  
   → another person's confidence: no 🎯 of hers (C75), filed as «کارِ دیگری»
13. [events] <span dir="rtl">U: پارسال ۹۰ درصد مطمئن بودم ترفیع می‌گیرم و نشد</span> — _context:_ <span dir="rtl">adult; C91</span>  
   → a past confidence: no 🎯, no settle, no «شد یا نشد؟»
14. [events] <span dir="rtl">U: می‌خوام ببینم پیش‌بینی‌هام چقدر درست درمیان — مثل همون «۷۰ درصد مطمئنم» برای جلسه</span> — _context:_ <span dir="rtl">adult; B29·D5</span>  
   → a wish about forecasting, quoting a counter: NO 🎯 (B29·D5); the quote is shown byte-exact, never stripped to «« »»
15. [events] <span dir="rtl">[open 🎯 «کفِ حیاط حدودِ ۶ مترمربع میشه» 70%] U: ۶٫۴ متر مربع = ۶۴۰۰۰ سانتی‌متر مربع</span> — _context:_ <span dir="rtl">adult; A29-24</span>  
   → no «این ۶٫۴ حدودِ ۶ حساب می‌شود؟» — a unit conversion is not a report of the outcome (A29-24); 6.4 m² = 64 000 cm² ✓
16. [events] <span dir="rtl">[open 🎯 «پارکت تا آخرِ ماه نصب میشه» 80%] U: برگردیم به کارتن‌های پارکت</span> — _context:_ <span dir="rtl">adult; D29-4</span>  
   → no «شد یا نشد؟» (D29-4)
17. [events] <span dir="rtl">[open 🎯 «پارکت تا آخرِ ماه نصب میشه» 80%] U: دستمزدِ نصب ۱۵۰ نیست، ۱۸۰</span> — _context:_ <span dir="rtl">adult; D29-4 / dB1 shape</span>  
   → a correction never settles and never asks «شد یا نشد؟» (C91)
18. [events] <span dir="rtl">[🎯 «تا آخرِ همین هفته ۴ تا قفسه رو سوار می‌کنم» 70%] U: یعنی: ۷۰ درصد مطمئنم تا آخرِ همین هفته ۴ تا قفسه رو سوار می‌کنم</span> — _context:_ <span dir="rtl">adult; A29-16</span>  
   → a restatement: no second 🎯 (A29-16); a later «شد ۳ تا» settles the one 🎯 «نشد» with no «کدام؟»
19. [events] <span dir="rtl">U: ۶۰ درصد مطمئنم درصدِ خطام حدودِ ۸ درصد درمیاد</span> — _context:_ <span dir="rtl">adult, Anki statistics; C90 look-alike</span>  
   → ONE 🎯 (60%); «حدودِ ۸ درصد» is the predicted value, not a second confidence (C90 needs two outcomes)
20. [events] <span dir="rtl">U: ۲۰ درصدِ ۳۰۰ میلیون رو می‌ذارم طلا، میشه ۶۰ میلیون</span> — _context:_ <span dir="rtl">elder, 67; C136 look-alike (aB3)</span>  
   → NO 🎯 («N درصدِ Y» is a datum, C148); 20% × 300 M = 60 M
21. [events] <span dir="rtl">[🎯 «مدیرم تا جمعه تأیید می‌کنه» 70%] U: امروز خیلی کار داشتم، فردا بیشتر می‌نویسم</span> — _context:_ <span dir="rtl">adult; C91</span>  
   → an unrelated sentence: no settle, no «شد یا نشد؟»


## R6.filing_story · multi-problem filing, 📜 and history (F15 S1 A29-1 first, F18, F9, F10, F11 with prior). A ✓/✗/؟ in 📜 covers only the clauses the engine read; a clause with a numeric claim the engine did not read gets «؟ نسنجیده» beside that clause, and the line is never ✓ «درست» as a whole while such a clause exists — C138 (uses arith's per-clause export, C139). One clause yields one 📜 line: never «داده» and «حسابِ تو» for the same clause, never four «داده»; a forecast sentence is filed as 🎯, never as «داده» — C149. «X یه حسابِ دیگه هم کرد: …» and «X حساب کرد …» are «کارِ دیگری» (labelled, once); «X گفت …، پس … = N» is HER inference with X as the source of the datum; «X گفت N٪» is a datum of her problem with a source label — C125/C96 (C57, C79). Moving a ledger step that has dependants lists them (transitive ones included) and asks «همه / فقط همین / هیچ»; nothing moves silently; a moved 🎯 keeps its outcome and lands in the destination's 🎯 list — C124/C78/C95, proven at page level in EVERY group (C137). A problem she calls separate or a statement with its own unknown gets its own record; lines go to the problem they name — C97. Base session — «نشستِ دوپرونده‌ایِ ۲۹» (adult, one chat): problem P «بودجهٔ اسباب‌کشی» (registered first), problem Q «میزِ آشپزخونه» (registered second, live). pos = the line / mark / button must be where stated (PAGE-LEVEL); neg = a look-alike that must not move, relabel or re-mark.


### Positive

1. [page] <span dir="rtl">U: از ۵ میلیون و ۲۰۰ پس‌انداز، ۲ میلیون و ۷۰۰ رفت: ۵ میلیون و ۲۰۰ − ۲ میلیون و ۷۰۰ = ۲ میلیون و ۵۰۰، نصفش هم میشه ۱ میلیون و ۳۰۰</span> — _context:_ <span dir="rtl">adult; S1 A29-1 s06 shape</span>  
   → PAGE-LEVEL: in 📜 the subtraction clause carries ✓ and the clause «نصفش هم میشه ۱ میلیون و ۳۰۰» carries ✗ (half of 2 500 000 = 1 250 000) or «؟ نسنجیده» beside THAT clause; the line never shows «✓ حسابِ عددی‌اش را صفحه سنجید: درست» for the whole sentence
2. [page] <span dir="rtl">[problem: «با یه پارچِ ۷ و یه پارچِ ۱۱ لیتری، ۱۵ لیتر آب بردار»] U: با پارچِ ۱۱: ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد</span> — _context:_ <span dir="rtl">adult; S1 A29-1 s08 shape</span>  
   → PAGE-LEVEL: ✓ beside «۱۱ + ۱۱ = ۲۲» and ✗ beside «۸ لیتر اضافه میاد» (22 − 15 = 7) — or «؟ نسنجیده» if the engine does not take the target from the statement — never a sentence-wide ✓
3. [page] <span dir="rtl">[child, 8; problem: «۱۸ صفحه مونده، روزی ۴ تا بخونم چند روز طول می‌کشه؟»] U: ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد</span> — _context:_ <span dir="rtl">child, 8; S1 A29-1 pwA2 shape</span>  
   → PAGE-LEVEL in the child's view: ✓ beside the sum and ✗ (18 − 16 = 2) or «؟ نسنجیده» beside «۳ تا کم میاد»; never «درست» for the whole line
4. [prompt] <span dir="rtl">U: … = ۲ میلیون و ۵۰۰، نصفش هم میشه ۱ میلیون و ۳۰۰</span> — _context:_ <span dir="rtl">adult; S1 A29-1, one voice</span>  
   → chat ⇄ page agree: the coach is told the half clause is wrong (or unchecked); 📜 never says ✓ where the coach flags the clause (A29-1 «disagree» rows)
5. [page] <span dir="rtl">U: ۶ × ۷ = ۴۲ تا تخم‌مرغ، از ۵۰ تا ۷ تا می‌مونه</span> — _context:_ <span dir="rtl">adult; F15 with a remainder after a product</span>  
   → PAGE-LEVEL: two marks on the line — ✓ for the product, ✗ for the remainder clause (8) — taken from arith's per-clause export (C138); the dossier counts one right and one wrong
6. [page] <span dir="rtl">[🎯 and 📜 after her fix] U: نصفش ۱ میلیون و ۲۵۰ میشه، ببخشید</span> — _context:_ <span dir="rtl">adult; S1 A29-1, after the fix</span>  
   → PAGE-LEVEL: the clause's mark moves to ✓ with the old ✗/؟ in its history (C86); the subtraction clause keeps its ✓
7. [page] <span dir="rtl">U: اجاره ماهی ۱۵ میلیونه و ۴ نفریم: ۱۵ ÷ ۴ = ۳٫۷۵ میلیون</span> — _context:_ <span dir="rtl">adult; A29-2 (s02, s06, s09, pA2)</span>  
   → PAGE-LEVEL: 📜 has one «داده» line for «اجاره ماهی ۱۵ میلیونه», one for «۴ نفریم» (or one for the data clause as she wrote it) and ONE «حسابِ تو» line with ✓ for «۱۵ ÷ ۴ = ۳٫۷۵»; never four «داده» lines and never the sentence again as «حسابِ تو»
8. [page] <span dir="rtl">U: پیش‌بینیم: این هفته ۵ روز از ۷ صبح زود بیدار میشم؛ ۶۵ درصد مطمئنم.</span> — _context:_ <span dir="rtl">adult; B29·D2</span>  
   → PAGE-LEVEL: 📜 files it as a 🎯 line (with 65%), never as «داده (از گفت‌وگو)»; the draft form never shows it as «داده: …»
9. [page] <span dir="rtl">[🎯 «۵ روز از ۷ صبح زود بیدار میشم» 65%] U: یه هفته گذشت؛ پیش‌بینیم ۵ از ۷ با ۶۵ درصد بود، شد ۴</span> — _context:_ <span dir="rtl">adult; B29·D2 past report + B27·D7 filing</span>  
   → PAGE-LEVEL: filed as the outcome of that 🎯 («نشد»), under the problem the 🎯 belongs to; never «داده»
10. [page] <span dir="rtl">U: ۳ × ۴ = ۱۲ صندلی داریم</span> — _context:_ <span dir="rtl">adult; C149</span>  
   → PAGE-LEVEL: exactly one 📜 line, kind «حسابِ تو», with ✓; not also a «داده» line
11. [events] <span dir="rtl">U: داداشم یه حسابِ دیگه هم کرد: ۱۶ × ۲۵ = ۳۸۰</span> — _context:_ <span dir="rtl">adult; B29·D12, D29-12, A29-21, C28-8</span>  
   → «کارِ دیگری» with the label for her brother (shown as «[نامِ شخص]» / «داداشت» per C38), checked ✗ (16 × 25 = 400); never her «داده» and never her step; the coach line carries the label
12. [events] <span dir="rtl">U: داداشم حساب کرد ۴ × ۲۵۰ = ۱۰۰۰ هزار برای حمل</span> — _context:_ <span dir="rtl">adult; A29-21</span>  
   → filed ONCE as «کارِ دیگری» ✓; never also as her «داده» (A29-21 filed it both ways)
13. [events] <span dir="rtl">U: بابام گفت هر جعبه ۱۵ تا مداد داره، پس ۳ تا جعبه میشه ۳ × ۱۵ = ۴۵ تا</span> — _context:_ <span dir="rtl">child, 10; C29-4</span>  
   → the datum «هر جعبه ۱۵ تا مداد» is hers with source «بابام»; the inference after «پس» is HER calculation (✓ 45) — never «کارِ دیگری — بابام» (C125: X is not the doer of the calculation)
14. [prompt] <span dir="rtl">U: همسایه‌مون گفت جابه‌جایی ۳ ساعت طول می‌کشه، پس ۳ × ۵۰۰ هزار = ۱ میلیون و ۵۰۰</span> — _context:_ <span dir="rtl">adult; B29·D12 first half</span>  
   → the coach line treats the product as hers (✓ 1 500 000) with «۳ ساعت» as a datum from the neighbour; never «کارِ دیگری — همسایه‌مون»
15. [page] <span dir="rtl">U: فروشنده گفت اگه نقد بدم ۱۵٪ تخفیف میده</span> — _context:_ <span dir="rtl">adult; A29-22</span>  
   → PAGE-LEVEL: a «داده» line of her problem with a source label («به گفتهٔ فروشنده»); not «کارِ دیگری», not a 🎯
16. [events] <span dir="rtl">U: داداشم یه حسابِ دیگه هم کرد: ۲ میلیون و ۴۰۰ + ۱۲ درصد = ۲ میلیون و ۶۸۸</span> — _context:_ <span dir="rtl">adult; B29·D12 second half</span>  
   → «کارِ دیگری» (labelled); the «+ ۱۲ درصد» is read as 12% of the amount: 2 400 000 × 1.12 = 2 688 000 ✓ — or «نسنجیده»; never a silent «درصدِ چه؟»
17. [page] <span dir="rtl">[ledger (proof): گام ۱ «هر نفر با ۷ نفرِ دیگه دست میده» · گام ۲ «۸ × ۷ = ۵۶» (depends on 1) · گام ۳ «۵۶ ÷ ۲ = ۲۸» (depends on 2)] [click «↪» on گام ۱ → another problem]</span> — _context:_ <span dir="rtl">adult; A shape (oA1 handshakes, A29-28)</span>  
   → PAGE-LEVEL: before moving, the page lists گام ۲ and گام ۳ (the transitive dependant included) and asks «همه / فقط همین / هیچ»; nothing moves until she answers
18. [page] <span dir="rtl">[ledger (cost): گام ۲ «۲۰ × ۱۸ = ۳۶۰ هزار» · گام ۳ «۳۶۰ + ۵۰ = ۴۱۰ هزار» (depends on 2)] [click «↪» on گام ۲]</span> — _context:_ <span dir="rtl">adult; B shape (nB2 s18, B29·D16)</span>  
   → PAGE-LEVEL: the all / only this / none ask names گام ۳; the step never moves alone silently
19. [page] <span dir="rtl">[chat-only ledger: گام ۱ «۱۲ × ۲ = ۲۴ برش» · گام ۲ «۲۴ ÷ ۸ = ۳ کیک» (depends on 1)] [click «↪» on گام ۱]</span> — _context:_ <span dir="rtl">adult; C shape (s23 / pwC1, C29-16)</span>  
   → PAGE-LEVEL: the ask appears for a chat-only ledger too; «فقط همین» moves گام ۱ and leaves گام ۲ with a history line that its base moved; undo restores both places
20. [page] <span dir="rtl">[ledger: گام ۴ «۲ × (۵ + ۴) = ۱۸» · گام ۵ «۱۸ × ۱۶۰ = ۲۸۸۰» (on 4) · گام ۶ «۲۸۸۰ + ۶۰۰ = ۳۴۸۰» (on 5)] [click «↪» on گام ۴] ‖ U: همه</span> — _context:_ <span dir="rtl">adult; D shape (tD1 T23, D29-15 transitive dependant)</span>  
   → PAGE-LEVEL: the ask names گام ۵ AND گام ۶; «همه» moves all three with «جابه‌جا شد» on the page clock; «↩» brings all three back
21. [page] <span dir="rtl">[🎯 «گزارشِ مالیشون باثباته» 70%, settled «نشد», under the wrong problem] [click «↪» → the right problem]</span> — _context:_ <span dir="rtl">adult; A29-27, D29-16</span>  
   → PAGE-LEVEL: the moved 🎯 shows «سرانجام: نشد» AND the «جابه‌جا شد» history; it appears in the destination problem's 🎯 list, not the source's
22. [events] <span dir="rtl">[live: «سه تا دفتر …»] U: یه مسئله: هر جعبه ۸ تا ماژیک داره. ۶ تا جعبه چند تا میشه؟</span> — _context:_ <span dir="rtl">child, 10; C29-5</span>  
   → a statement with its own unknown gets its own record (C97); the next lines about the boxes go there, not under «سه تا دفتر …»
23. [page] <span dir="rtl">[problems «۷ و ۱۱» (15-litre target) and «۵ و ۹» (focused)] U: برای ۱۵ لیتر یه راهِ دیگه هم امتحان کردم: ۷ × ۲ = ۱۴، پس ۱ لیتر کم میاد</span> — _context:_ <span dir="rtl">adult; A29-19</span>  
   → PAGE-LEVEL: the line is filed under the 15-litre problem (it names it), with ✓ for 7 × 2 = 14 and ✓ for «۱ لیتر کم میاد» (15 − 14 = 1); never under «۵ و ۹»
24. [page] <span dir="rtl">[problems «قفسه‌ها» (2-step prior ledger) and «کفِ سالن» (own 4-step ledger)]</span> — _context:_ <span dir="rtl">adult; B28·D9, B29·D15</span>  
   → PAGE-LEVEL: the floor dossier's 📜 shows its own 4 steps (with stale marks and accepted values), never the shelves' 2 steps; each dossier's 🧭 strip is its own


### Negative (look-alike)

1. [page] <span dir="rtl">U: ۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰</span> — _context:_ <span dir="rtl">adult; C138 look-alike</span>  
   → PAGE-LEVEL: one clause, read ✓ ⇒ the sentence-level ✓ is right here (C138 forbids it only when an unread numeric clause exists)
2. [page] <span dir="rtl">U: ۵ میلیون و ۲۰۰ − ۲ میلیون و ۶۰۰ = ۲ میلیون و ۶۰۰، نصفش میشه ۱ میلیون و ۳۰۰</span> — _context:_ <span dir="rtl">adult; A29-1 look-alike with a right half</span>  
   → PAGE-LEVEL: both clauses are right (half of 2 600 000 = 1 300 000): ✓ and ✓, or ✓ and «؟ نسنجیده»; never ✗ beside «نصفش»
3. [page] <span dir="rtl">U: ۱۸ + ۱۲ = ۳۰ تا کارتن؛ مامانم کمکم کرد بشمارم</span> — _context:_ <span dir="rtl">adult; C136 look-alike (judged right in A and C)</span>  
   → PAGE-LEVEL: hers («حسابِ تو» ✓), never «کارِ دیگری» — a helper mentioned in her own sentence (C96)
4. [events] <span dir="rtl">U: همون ۳ میلیون و ۲۵۰ که خودت گفتی رو قبول دارم</span> — _context:_ <span dir="rtl">adult; C79</span>  
   → a number of the coach repeated as hers stays hers (C79)
5. [events] <span dir="rtl">U: فروشنده گفت هر متر ۱۶۰ هزاره</span> — _context:_ <span dir="rtl">adult; C125 look-alike</span>  
   → a bare value from a source: a datum with source label, not «کارِ دیگری» (C125)
6. [events] <span dir="rtl">U: استادم گفت دامنه‌ی واژه‌هام کمه</span> — _context:_ <span dir="rtl">adult; C96 look-alike</span>  
   → no numbers, no calculation: not «کارِ دیگری» with arithmetic, not a 🎯; at most a note in her record
7. [page] <span dir="rtl">[ledger: گام ۳ «۵۶ ÷ ۲ = ۲۸» is the last step, nothing depends on it] [click «↪» on گام ۳]</span> — _context:_ <span dir="rtl">adult; C124 look-alike</span>  
   → PAGE-LEVEL: moves at once with its undo; no all / only / none question (no dependants)
8. [page] <span dir="rtl">[🎯 with no dependants] [click «↪»]</span> — _context:_ <span dir="rtl">adult; C124 look-alike</span>  
   → PAGE-LEVEL: moves at once; no dependants ask
9. [events] <span dir="rtl">[live: «میزِ آشپزخونه»] U: اگه ۶ نفر باشیم چی؟</span> — _context:_ <span dir="rtl">adult; C126</span>  
   → a hypothetical inside the same problem (C126): no new record
10. [events] <span dir="rtl">[problems P and Q] U: برگردیم به مسئله‌ی اسباب‌کشی</span> — _context:_ <span dir="rtl">adult; C97 look-alike</span>  
   → a return by naming (C30): no new record; later unnamed lines go to P until she names another
11. [page] <span dir="rtl">U: اجاره ماهی ۱۵ میلیونه. ۱۵ × ۱۲ = ۱۸۰ میلیون در سال</span> — _context:_ <span dir="rtl">adult; C149 look-alike</span>  
   → PAGE-LEVEL: two clauses ⇒ two lines (one «داده», one «حسابِ تو» ✓) — splitting distinct clauses is right; what C149 forbids is the SAME clause twice
12. [events] <span dir="rtl">U: یه مسئلهٔ تازه نیست، همون میزه؛ فقط عرضش رو دوباره گفتم: ۹۰ سانت</span> — _context:_ <span dir="rtl">adult; C97 look-alike</span>  
   → a restated datum of Q: no new record (C97 needs a separate problem or its own unknown)
13. [page] <span dir="rtl">U: پیش‌بینیم این بود که دیر میرسم، ولی به موقع رسیدم</span> — _context:_ <span dir="rtl">adult; C149/C91 look-alike</span>  
   → PAGE-LEVEL: an outcome report with no confidence and no open 🎯 about it: not a 🎯 line, not «داده» of a forecast; at most an ordinary line
14. [events] <span dir="rtl">U: مامانم گفت هر کیسه برنج ۱۰ کیلوئه؛ ۳ تا کیسه گرفتیم</span> — _context:_ <span dir="rtl">adult; C125 look-alike</span>  
   → a datum with source label (C125); no calculation by anyone, so no «کارِ دیگری»; no arithmetic line
15. [page] <span dir="rtl">[problems P and Q; a line already filed under the right problem] (no move)</span> — _context:_ <span dir="rtl">adult; C95 control</span>  
   → PAGE-LEVEL: the «↪» button is present on the line but nothing moves without her click; no automatic re-filing
16. [page] <span dir="rtl">U: ۱۵ ÷ ۴ = ۳٫۷۵</span> — _context:_ <span dir="rtl">adult; A29-2 look-alike</span>  
   → PAGE-LEVEL: one «حسابِ تو» line with ✓; repeating the same sentence later as «یعنی ۱۵ ÷ ۴ = ۳٫۷۵» adds no duplicate line (it is the same clause restated)


## R7.surface · the surface (F13, F14, F19, the B27·D16 loop). A question about the system itself — the page, its records, its sheets, its rules — is never a problem, never «مسئلهٔ n از n» and never a «↪» or 🧭 destination; a real problem that merely contains «نقشه», «سامانه» or «برنامه» is still a problem; «یادم بنداز» is a plan — C99/C127. Rule labels («(C57)») and raw item ids («it1_…») never reach her view or the coach's quoted lines; her own words containing such strings stay byte-exact — C151/C100/C55/C128. The «خودِ سامانه» block the assistant reads is built from the same registry as the rules the page enforces (page-built user-prompt block, not the static system text), so owner bank 42/64/65 are answered with evidence and a new rule shows up with no hand edit — C150. A reply whose only overlap is frame words is asked about, never rejected; a reply naming no area is rejected and reopened; a take-back closes the sheet — C20 (B27·D16, U59). The register guard never demands a rewrite of a reply written in one register; static labels follow «شما» consistently — C83/C130. Identical tie names ⇒ the page asks whether to merge — C129. pos = the stated surface behaviour (PAGE-LEVEL where it names the DOM or a view); neg = a look-alike that is legitimately a problem, kept, asked or changed.


### Positive

1. [route] <span dir="rtl">[one open problem «جلسه‌ی ۴۵ دقیقه‌ای»] U: یه نقشه از همه‌ی پرونده‌هام نشونم میدی؟</span> — _context:_ <span dir="rtl">adult; A29-26</span>  
   → a question about the system: never «مسئلهٔ ۲ از ۲», never a chat problem; PAGE-LEVEL: it is not offered as a «↪» destination and 🧭 shows only the real problem
2. [route] <span dir="rtl">U: این برنامه اصلاً برای این‌جور حساب‌کتابا ساخته شده؟</span> — _context:_ <span dir="rtl">adult; D28-10 shape (oD1b and ten branches)</span>  
   → a question about the system (D28-10 shape): no problem record, no 🧭 destination; the assistant answers
3. [route] <span dir="rtl">U: سه تا سؤال دربارهٔ خودِ سامانه: اون گامی که جابه‌جا کردم، گام‌هایی که بهش تکیه داشتن چی شدن؟</span> — _context:_ <span dir="rtl">adult; oA1 p38 shape (bank 42)</span>  
   → not a problem; answered by the assistant from the system map (C150) — the dependants ask, «↩» undo — never filed under a problem
4. [route] <span dir="rtl">U: این برگه‌ای که الان ثبت کردی کِی جواب می‌گیره؟ از کجا بفهمم؟</span> — _context:_ <span dir="rtl">adult; B27·D14</span>  
   → a question about the page's sheets: not a chat problem, not a «↪» destination (B27·D14)
5. [route] <span dir="rtl">[a problem closed] U: آها یه چیزی یادم رفت بگم: دیشب مادرم دو تا قرص رو با هم برداشت</span> — _context:_ <span dir="rtl">adult; C27-6</span>  
   → a piece after closure: offered on «امروز» (C36) for her to decide; never a new chat problem by itself (C27-6, C half)
6. [page] <span dir="rtl">U: داداشم حساب کرد ۲۲ × ۵۰ = ۱۱۰۰ هزار برای حمل</span> — _context:_ <span dir="rtl">adult; B29·D1 (nB1, nB2), A29-23 (s09, aA1)</span>  
   → PAGE-LEVEL: the «کارِ دیگری» line in her 📜 never contains «(C57)» or any «C<number>» label
7. [page] <span dir="rtl">U: اینا رو به فهرستِ خریدم اضافه کن: قرصِ ویتامین، باتری</span> — _context:_ <span dir="rtl">adult; B29·D1 (s13, s18)</span>  
   → PAGE-LEVEL: the page line after the add names the items in her words; never raw ids such as «(it1_…)»
8. [prompt] <span dir="rtl">U: داداشم حساب کرد ۲۲ × ۵۰ = ۱۱۰۰ هزار</span> — _context:_ <span dir="rtl">adult; C151 in the prompt view</span>  
   → the coach's quoted lines carry no «C57», no «it1_…» id and no English words; the label is «کارِ دیگری — [نامِ شخص]» (C151, C128)
9. [page] <span dir="rtl">[🎯 with no due date]</span> — _context:_ <span dir="rtl">adult; C100 (A28-36 held; C28-22 «2026-…» in a step card)</span>  
   → PAGE-LEVEL: no internal text such as «… در موعدهای باز نیست» or a raw ISO date in the 🎯 book or the step card
10. [prompt] <span dir="rtl">[any session; prompt inspected]</span> — _context:_ <span dir="rtl">adult; A29-29</span>  
   → the page-built user-prompt block «خودِ سامانه» (not the static system text) carries one line each for: accepting a proposal with a stale base (C87/C111), a source of a datum vs another person's work (C96/C125), moving a step with dependants (C124), one mark per clause (C138); each line is generated from the same registry the page enforces
11. [chat] <span dir="rtl">U: اگه یه گام رو جابه‌جا کنم، گام‌هایی که روش بنا شدن چی میشن؟</span> — _context:_ <span dir="rtl">adult; owner bank 42</span>  
   → the assistant answers from the map's evidence: the page lists the dependants and asks «همه / فقط همین / هیچ», nothing moves silently, «↩» undoes; it names where that rule is written
12. [chat] <span dir="rtl">U: پیشنهادی که از عددِ کهنه ساخته شده بود رو قبول کردم — گامم با همون بازنویسی شد؟</span> — _context:_ <span dir="rtl">adult; owner bank 64</span>  
   → the assistant answers with the rule: no — the page names the stale base and its current value and does not rewrite; it shows the current exact value
13. [chat] <span dir="rtl">U: «فروشنده گفت ۱۲٪» دادهٔ منه یا کارِ یکی دیگه؟</span> — _context:_ <span dir="rtl">adult; owner bank 65</span>  
   → the assistant answers with the rule: a datum of her problem with a source label; «کارِ دیگری» only when another person does the calculation
14. [prompt] <span dir="rtl">[after a fixer adds a new rule to the registry]</span> — _context:_ <span dir="rtl">adult; C150 registry check</span>  
   → the «خودِ سامانه» block shows the new rule the next time it is built, with no hand edit (C150 test: a registry entry added in a test appears in the block)
15. [events] <span dir="rtl">[sheet for her step «سنجشِ تعدادِ قرص‌های برداشته‌شده»] [routine reply naming only frame words: «برگه»، «ابزار»، «ثبت»]</span> — _context:_ <span dir="rtl">adult; B27·D16 (identical r27–r29)</span>  
   → the page asks her whether the reply fits her step (C2/C20); never «جواب نداد» rejection, never «answered»
16. [events] <span dir="rtl">[sheet #N open] U: نه، لازم نیست دیگه، خودم یه راه پیدا کردم</span> — _context:_ <span dir="rtl">adult; U59</span>  
   → a take-back closes the sheet; PAGE-LEVEL: the sheet list shows it closed, not «open»
17. [prompt] <span dir="rtl">[register «تو»] model reply written fully in «تو»</span> — _context:_ <span dir="rtl">adult; A29-7</span>  
   → no «please rewrite» demand from the register guard (A29-7); the reply is shown as written
18. [page] <span dir="rtl">[«شما» user, 67]</span> — _context:_ <span dir="rtl">elder, 67; B29·D3 (C130)</span>  
   → PAGE-LEVEL: the strip and static labels use the «شما» forms consistently («برگردید»، «خودتان»); never «خودت … برگرد» beside «حسابِ شما» on the same page
19. [events] <span dir="rtl">[tie ❓ between two identical candidate names]</span> — _context:_ <span dir="rtl">adult; A28-32 / C129</span>  
   → the page says they look like duplicates and asks whether to merge (C129); never two identical names offered as a choice
20. [route] <span dir="rtl">U: دفترِ پیش‌بینی کجاست؟ می‌خوام فقط ببینمشون</span> — _context:_ <span dir="rtl">adult; C29-23 / C99</span>  
   → a question about the page: it opens/points to the 🎯 book; no problem record; the follow-up never asks the model to fill fields and press «ثبت» (C29-23)
21. [route] <span dir="rtl">U: الان که گفتم «بله»، دقیقاً به کدوم پرسش بله گفتم؟</span> — _context:_ <span dir="rtl">adult; owner bank 54 shape</span>  
   → a question about the system: answered (the ask it bound to, by name); no problem record
22. [page] <span dir="rtl">[after any correction]</span> — _context:_ <span dir="rtl">adult; B24·D16, B27·D11 (surface labels)</span>  
   → PAGE-LEVEL: the correction header in 📜 states the change exactly as made, with one arrow convention (never «⇐» and «→» in one history line)


### Negative (look-alike)

1. [route] <span dir="rtl">U: نقشه‌ی آپارتمان ۸۰ متره؛ اگه ۶۵ درصدش کاشی بشه چند متر کاشی لازمه؟</span> — _context:_ <span dir="rtl">adult; C99 look-alike</span>  
   → a real problem that contains «نقشه»: a problem record and a 🧭 destination (C99 last clause); 0.65 × 80 = 52
2. [route] <span dir="rtl">U: سامانه‌ی آبیاریِ قطره‌ای ۲۰ تا نازل داره، هر کدوم ساعتی ۴ لیتر؛ ۳ ساعت چند لیتر میشه؟</span> — _context:_ <span dir="rtl">adult; C99 look-alike</span>  
   → a real problem that contains «سامانه»: a problem record (20 × 4 × 3 = 240)
3. [route] <span dir="rtl">U: فردا ساعت ۹ یادم بنداز به بانک زنگ بزنم</span> — _context:_ <span dir="rtl">adult; C127</span>  
   → a reminder request (C127): a plan with its date ask, not a question about the system
4. [page] <span dir="rtl">U: کدِ کلاسم C57 ـه، اینو یادداشت کن</span> — _context:_ <span dir="rtl">teen, 15; C100 look-alike</span>  
   → PAGE-LEVEL: her own words stay byte-exact in her bubble and data line (C55); the label rule removes only page-authored labels
5. [page] <span dir="rtl">U: مدلِ دستگاه it1_x200 ـه</span> — _context:_ <span dir="rtl">adult; C151 look-alike</span>  
   → PAGE-LEVEL: her own text is shown as she typed it; only page-made ids are hidden
6. [prompt] <span dir="rtl">U: 2x + 3 = 11، پس x = 4</span> — _context:_ <span dir="rtl">teen, 14; C128</span>  
   → a variable she wrote may be quoted («x»), per C128; not counted as an English word in the page text
7. [events] <span dir="rtl">[sheet open] [routine reply that names no area at all: «فعلاً چیزی نداریم»]</span> — _context:_ <span dir="rtl">adult; C20 look-alike</span>  
   → rejected and the step reopened (C20) — this is the right result here, not an ask
8. [chat] <span dir="rtl">U: چرا کارت‌های Anki رو زود فراموش می‌کنم؟</span> — _context:_ <span dir="rtl">adult; C150 look-alike</span>  
   → a question about her learning, not about the page: the coach answers; no «خودِ سامانه» rule is cited for it and no problem record unless she makes one
9. [prompt] <span dir="rtl">[register «تو»] model reply with one «شما» verb among «تو» forms</span> — _context:_ <span dir="rtl">adult; A29-7 look-alike</span>  
   → the guard may ask for a rewrite here (a real mix) — the right result for this look-alike
10. [route] <span dir="rtl">U: می‌خوام یه برنامه‌ی پس‌انداز بچینم؛ ماهی ۳ میلیون کنار بذارم، ۱۰ ماه میشه ۳۰ میلیون</span> — _context:_ <span dir="rtl">adult; C99 look-alike</span>  
   → a real problem with «برنامه» in it: a record, not a system question (3 × 10 = 30)
11. [events] <span dir="rtl">[tie ❓ between «شارژرِ بلوتوثی» and «شارژرِ سیمی»] U: سیمی</span> — _context:_ <span dir="rtl">adult; C54/C129 look-alike</span>  
   → a distinct part of a name is her choice (C54); no merge question
12. [route] <span dir="rtl">U: یه نقشه‌ی راه برای یادگیریِ آمار می‌خوام بچینم</span> — _context:_ <span dir="rtl">adult; C99 look-alike</span>  
   → a learning plan of hers (a real topic), not a question about the page: the coach takes it; not rejected as «system»
13. [page] <span dir="rtl">U: نسخه‌ی C۲ و C۳ گزارش رو مقایسه کردم</span> — _context:_ <span dir="rtl">adult; C100 look-alike</span>  
   → PAGE-LEVEL: her words with «C۲»/«C۳» stay byte-exact (C55)
14. [route] <span dir="rtl">U: این مسئله‌ی جدول رو کجای پرونده‌م ببینم؟</span> — _context:_ <span dir="rtl">adult; C99 look-alike</span>  
   → a question about where a record is: answered with the place; no new problem; the existing table problem is not duplicated
15. [prompt] <span dir="rtl">[the «خودِ سامانه» block]</span> — _context:_ <span dir="rtl">adult; C150/C100 boundary — see ambiguities</span>  
   → the block carries no secrets, no raw ids and no rule numbers in her view; rule numbers may appear only in the model-facing evidence, never quoted to her (C100)
16. [events] <span dir="rtl">[sheet reply that names her step's specific tool «شمارندهٔ قرص»]</span> — _context:_ <span dir="rtl">adult; C20 look-alike</span>  
   → a clear single fit: marked as arrived with no tie ❓ and no ask (C54/C3)


## Ambiguities for the coordinator

These are points DECISIONS_R25–R29 leave open. No rule was invented for them. The matching entries were either left out or, where noted, assert only the part the decisions do fix.

1. **R1 / C102 — a lone bare number beside a compound amount** (C29-19). «۵ میلیون و ۸۰۰ − ۸۰۰ = ۵ میلیون»: is the bare «۸۰۰» operand also read as 800 thousand (then both-thousand fits and C102 gives ✓ with no naming), or only as units (✓ «یعنی … واحد», which runner C rated S3)? The entry («۷ میلیون و ۶۰۰ − ۶۰۰ = ۷ میلیون») asserts NOT-FLAG only.
2. **R1 / C102 — a line right only under a MIXED reading** (one compound in thousands, another in units). C103 keeps mixed readings out of a ✗; C102's «right only under another reading ⇒ ✓ and name it» does not say whether a mixed reading counts. No entry.
3. **R1 / C141 + C138 — where «need/have» may come from.** «۸ لیتر اضافه میاد» when the target (15 لیتر) is in the problem's statement, not in the same message: does «both in her text» include her own earlier statement in the same record (⇒ ✗), or only the same message (⇒ «نسنجیده»)? The entries accept either (NOT-OK) and forbid ✓ and silence.
4. **R1 / C138 — word operations «نصفش میشه / دو برابرش میشه / با N دیگه میشه».** Must the engine read them (✓/✗), or is «؟ نسنجیده» beside the clause enough? Entries accept either (NOT-OK for a wrong clause, NOT-FLAG for a right one).
5. **R1 / C135 — «تومن» written on a BARE operand in a compound line** («۲ میلیون و ۹۰۰ تومن − ۹۰۰ تومن = ۲ میلیون تومن»). Only the units reading fits, so C102 says ✓ and name it. The «تومن» on «۹۰۰» already says units; is the naming («یعنی ۹۰۰ تومان») still wanted? The entries assert ✓ with the reading named.
6. **R1 / C140 vs C44 — a rounded integer percent with no approximation word** («۷ از ۴۵ میشه ۱۶٪»). C140 says it «follows the existing rounding rule (C9)»; C44 gives it C25's question. The entry uses the question (ASK). Confirm that C140 does not turn it into ✓ (C9 rounding at her digits) instead.
7. **R2 / C142 — a take-back of a correction** («نه ببخشید، همون ۴ درست بود»). The entry assumes C5's restore with history and the proposals built on the withdrawn value marked superseded.
8. **R2 / C89 / C112 — a repeating-decimal proposal** (8120 ÷ 3). The entry asks for the exact value and an approximation (as C67 does for irrationals) and forbids an invented whole-number rounding; the display form (fraction or «≈ ۲۷۰۶٫۶۷») is open.
9. **R2 / C143 — a correction of a remainder clause's base.** When a factor of a product changes and the remainder clause has its own recorded operands, the entry asks for a proposal for the clause too; DECISIONS_R29 does not say whether remainder clauses are dependants in the C89 sense.
10. **R3 / C98 vs C8 — her fix with a question tag** («… میشه ۳ میلیون و ۲۵۰، درسته؟»). A worked fix (applied when the engine agrees) or a bare question about a calculation (opens nothing)? The entry asserts the fix lands and the coach answers the tag.
11. **R3 / D29-7 — a correction to a datum that a ledger step quotes.** Rewrite the step's text as a proposal, mark it stale, or ask? The entry accepts a stale mark with an exact proposal or an ask, and forbids only a fabricated text labelled as hers.
12. **R4 / C145 — «آره، هر دو» / «هر دو درسته».** Counted as answering both asks (entry), or only the newest (C49)? C145 names «فردا و پس‌فردا» only.
13. **R4 / C146 — a past act with a past day and NO open plan.** Record a new done act, or nothing? The entry forbids an invented row and any question.
14. **R4 / B29·D19 — «صاحب‌خونه بمونه برای فردا» when that «فردا» is the call's own booked day.** No new ask (entry) or a confirm of the same day?
15. **R5 / C148 vs C90 — «فکر کنم ۷۰ درصد کارتن‌ها تا جمعه بسته میشن».** «N درصد Y» (70 % of the cartons, a datum) or the belief word «فکر کنم» (a confidence)? Runner D counted a 🎯 at 70 %; the entry keeps that verdict per C136, but C148 does not say which part wins when both shapes occur.
16. **R5 / C148 — a rate followed by a VERB, not a noun** («خرج‌مون هر سال ۲۵ درصد زیاد میشه»). The C148 noun list names «افزایش» but not «زیاد میشه / گرون میشه / رشد می‌کنیم». The entries treat these as data. Confirm.
17. **R5 — probabilities of competing hypotheses** («اشتباهِ شمارش ۲۰ درصد، برداشت ۷۰ درصد، دزدی ۱۰ درصد») and a recall estimate of a past attempt («شاید ۴۰٪»): 🎯 or not? No entry.
18. **R5 / D29-14 — «تا آخرِ ⟨a named month⟩»** as a 🎯 due date. The entry uses «تا آخرِ ماه» (C37). For a named month, is it the last day of that month through the same single confirm?
19. **R6 / C124 «فقط همین» — what the dependants show** after their base moved (stale mark, «پایه جابه‌جا شد», nothing?). The entry asserts a history line and a working undo only.
20. **R6 / C149 — the same clause restated later** («یعنی ۱۵ ÷ ۴ = ۳٫۷۵»): no new 📜 line (entry), or a history line on the first?
21. **R7 / C150 — rule numbers in the model-facing «خودِ سامانه» block.** Allowed as evidence the model reads but never quotes to her (entry), or removed everywhere (C100)?
22. **R7 / C29-23 — «دفترِ پیش‌بینی کجاست؟»** Open the 🎯 view, or say where it is? The entry accepts either and forbids only a follow-up that tells the model to fill the fields and press «ثبت».
