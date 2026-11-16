# VARIANTS_R28 — independent variant bank (round 28 root mechanisms R1–R7)

Written from DECISIONS_R28 (the fourteen families F1–F14, root mechanisms R1–R7, clarifications C84–C101), DECISIONS_R27 (C40–C83), DECISIONS_R26 (C15–C39), DECISIONS_R25 (C1–C14), the round-28 runner hand-backs and defect lists A, B, C, D, and roadmap §9, §21 and §22 only; no source code of the page and no fixer's work was read. Paraphrased — new people, numbers and subjects — not copied from the scenarios; each entry tests the mechanism, not one sentence. The three S1 of round 28 each have several pos and neg entries, marked «S1 family» in their context: **B28·D1 = C28-13** («N میلیون و M» read in one scale only, so correct work was called ✗ or a false rounding — R1), **A28-40** («… N تا می‌مونه» glued to the sum before it — R1), **A28-5** (a stale ✗ kept beside her own fixed line in 📜 — R5).
Every fix must pass the scenario sentence AND every entry of its mechanism here. **No fixed calendar dates in expectations:** D0 = the test clock's day when the test runs; «D0+n» = n days later, «D0−n» n days earlier; «the first Friday after D0» etc. are computed at run time and shown as Jalali dates; weeks run Saturday–Friday. Where an entry needs a weekday or a place in the Jalali month/year, its context says which («clock on a Wednesday», «clock in Aban», «clock on day 1 of a Jalali month»). A date written inside a user text is given as «⟨D0+n, written yyyy/m/d⟩» (Persian digits unless the entry says Latin) or «⟨D0+n, written as day + month name⟩». Idiom dates are stated as calendar rules («day 1 of the Jalali month after D0's month», «the last day of Esfand of D0's Jalali year», «1 Farvardin of the next Jalali year»), never as a fixed date.
**Arithmetic verified:** every arithmetic fact in this bank — each value called right, each value called wrong, each reading of «N میلیون و M», each exact value or proposal an expectation names — was recomputed with exact rational arithmetic (python3 `fractions.Fraction`; script VARIANTS_R28_verify.py beside this file, all assertions passing). For every «N میلیون و M» line the script enumerates every combination of readings (each bare M as units or as the next lower named scale) and asserts the verdict the entry states: one fitting combination ⇒ OK, two or more ⇒ ASK-SCALE, none ⇒ FLAG. It also sweeps every «a op b = c» written with symbols in the entries and asserts that the only mismatches are the values deliberately marked wrong, the C25 ASK cases and the scale-worded ones; word-operator shapes («A و B و C میشه D», «N تا M تا», «A و N دهم», «sqrt(…)», «a√b ≈ c», the C85 remainder clauses) are each asserted explicitly. Weekday offsets are asserted with the Saturday–Friday week. A value marked OK is exactly right (or a correct rounding at her digits, where said); a value marked FLAG is genuinely wrong.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result). Every pos has at least one neg of the same shape in its family. **R1 states its own reading at its head:** every R1 expectation starts with the verdict the page's check must give to the coach (and, per C86, beside her line in 📜) — OK / FLAG / ASK / ASK× / ASK-SCALE / UNCHECKED / NOT-FLAG / NOT-OK / SILENT. «ASK» anywhere in the bank means: the decisions say the page asks her, and nothing is booked until she answers.
**C101 (page-level proof):** an entry whose expectation can only be seen in the page — a button in the DOM, the state of a view, the 📜 window, «امروز», 🧭 — says so with «PAGE-LEVEL:» and names what to look at (for example «`.lp-dmv` present on the line», «the 🎯 view lists it under settled, not open»). Such an entry is proven only by a replay through the real harness; a unit test of the function alone is «unit-only» and does not count.
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views / 📜 / buttons, [events] sheet replies, registry diffs, 🎯 rows, dossier / mind-card readings, [time] day sequences under the test clock, [prompt] what the prompt / reply / post-check contains, [route] 🧭 content.
Learners: adult unless the context says child (≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ deliberately missing in some entries — detection must not depend on it, and her text is stored and shown back exactly as typed (C55). Digits appear in Persian, Latin and mixed form on purpose; all must be read the same. All personal, school and shop names are invented.
Multi-message entries use « ‖ » (U = user, A = assistant, «[…]» = a page action / result / sheet event; «[clock → D0+n]» = the test clock moves). Old values always stay as history («اصلاح شد ⇐» for a correction, «جابه‌جا شد» for a move); nothing is deleted. Named base problems («مسئلهٔ رنگ‌آمیزی», «مسئلهٔ سیمان», «مسئلهٔ تانکر», «نشستِ دوپرونده‌ایِ ۲۸») are defined in the head of their family. Machine-readable copy: VARIANTS_R28.json (fields rc, kind, role, text, expect, context). Points the decisions leave open are NOT turned into entries; they are listed at the end under «Ambiguities for the coordinator».

## Counts

| mechanism | pos | neg |
|---|---|---|
| R1.arith_reader | 30 | 18 |
| R2.correction_engine | 23 | 16 |
| R3.date_ask_engine | 27 | 21 |
| R4.forecast | 26 | 16 |
| R5.filing_story | 26 | 15 |
| R6.prior_work | 21 | 15 |
| R7.surface | 22 | 16 |
| **total** | 175 | 117 |


## R1.arith_reader · the page's exact-arithmetic reader (F1, F2; S1 B28·D1 = C28-13 and A28-40 first). «N میلیون و M» (also «N میلیارد و M») is read with EVERY operand in both scales — a bare M as units or as M of the next lower named scale — and every combination is tried: exactly one combination makes her line right ⇒ ✓ with that reading; two or more ⇒ the page asks once («۹۰۰ هزار یا ۹۰۰ تومان؟») and reads her answer (`m2`); none ⇒ ✗ with each reading's exact value written in her own scale words, never a raw digit string, never one value only — C84 (C63); a scale word on an operand is part of the arithmetic, and the page writes values in her scale — C23/C45/C62. «N تا می‌مونه / باقی می‌مونه / اضافه میاد / کم میاد» starts its own statement and is never an operand or the result of the sum before it — C85. «sqrt(…)» is read like «√» (C67); «a√b ≈ c» is never silent; «A و N دهم» is the decimal A.N (D26-24); C40 (sum first, «ضرب کردی؟» if only the product fits), C41, C25, C9 still bind. Verdicts the PAGE's check must give to the coach (and beside her line in 📜, C86): «OK» = ✓ · «FLAG» = ✗ · «ASK» = neither, the page states the exact value and asks whether she rounded (C25) · «ASK×» = neither, the page asks «ضرب کردی؟» (C40) · «ASK-SCALE» = neither, the page asks once which reading of «و M» she meant (C84) · «UNCHECKED» = «نسنجیده» · «NOT-FLAG» = OK, or UNCHECKED when the form cannot be computed; never ✗, never silence · «NOT-OK» = FLAG, or UNCHECKED when the form cannot be computed; never ✓, never silence · «SILENT» = outside the reader. Combination counts below were enumerated in the verify script (k = M as thousand / million, u = M as units).


### Positive

1. [chat] <span dir="rtl">U: پولِ پیش‌قسطِ ماشین: ۷ میلیون و ۶۰۰ + ۳ میلیون و ۵۰۰ = ۱۱ میلیون و ۱۰۰</span> — _context:_ <span dir="rtl">adult, saving for a car; S1 family (B28·D1 shape: a carry in the M part, so only the thousand reading fits)</span>  
   → OK — only the reading «۶۰۰ هزار + ۵۰۰ هزار = ۱۱ میلیون و ۱۰۰ هزار» fits (7.6 M + 3.5 M = 11.1 M); both-units gives 10 001 100, the mixed ones 10 600 500 and 10 500 600, none of which is either reading of her result; never ✗, never «؟ گرد کرده؟», no scale question; the coach is never told it does not fit
2. [chat] <span dir="rtl">U: ۲ میلیون و ۴۰۰ + ۶۰۰ هزار = ۳ میلیون</span> — _context:_ <span dir="rtl">adult, a used fridge plus delivery; S1 family (C28-13 shape: one operand with an explicit «هزار»)</span>  
   → OK — thousand reading 2.4 M + 0.6 M = 3 M fits; the units reading gives 2 600 400 and does not; never «؟ دقیقاً ۲٫۶۰۰۴ میلیون … گرد کرده؟», never a false exact value reaching her through the coach
3. [chat] <span dir="rtl">U: 4 میلیون و 300 + ۱ میلیون و ۷۰۰ = ۶ میلیون</span> — _context:_ <span dir="rtl">adult; Latin and Persian digits mixed in one line; S1 family (the M parts carry into a whole million)</span>  
   → OK — 4.3 M + 1.7 M = 6 M under the thousand reading; both-units 5 001 000, mixed 5 300 700 / 5 700 300 do not fit; read the same with Latin digits; never ✗
4. [chat] <span dir="rtl">U: از ۱۵ میلیون و ۲۵۰ پس‌انداز، ۴ میلیون و ۷۵۰ رفت برای بیمه: ۱۵ میلیون و ۲۵۰ − ۴ میلیون و ۷۵۰ = ۱۰ میلیون و ۵۰۰</span> — _context:_ <span dir="rtl">adult, household budget; S1 family with a borrow in the M part</span>  
   → OK — 15.25 M − 4.75 M = 10.5 M under the thousand reading; both-units gives 10 999 500, mixed 11 249 250 / 10 250 250; exactly one fitting combination; never ✗, never ASK-SCALE
5. [chat] <span dir="rtl">U: ۵ میلیون و ۸۰۰ + ۲ میلیون و ۶۰۰ = ۷ میلیون و ۴۰۰</span> — _context:_ <span dir="rtl">adult; a genuinely wrong sum; S1 family (C84 «none fits», A28-10 showed one raw value)</span>  
   → FLAG — no combination fits: thousand 8 400 000, units 7 001 400, mixed 7 800 600 / 7 600 800, against her 7 000 400 / 7 400 000; the ✗ names each reading's exact value in her own scale words (at least «۸ میلیون و ۴۰۰ هزار» and «۷ میلیون و ۱ هزار و ۴۰۰»); never a raw digit string such as «۷۰۰۱۴۰۰», never one value only; the right number is not given away to her
6. [chat] <span dir="rtl">U: اجارهٔ ده ماه: ۴ میلیون و ۵۰۰ × ۱۰ = ۴۰ میلیون</span> — _context:_ <span dir="rtl">adult; S1 family (C28-12 shape: the units reading is close to her result, so it used to become a rounding question)</span>  
   → FLAG — thousand reading 45 000 000, units reading 40 005 000, her result 40 000 000 fits neither; ✗ with both values in her words («۴۵ میلیون» and «۴۰ میلیون و ۵ هزار»); never «؟ … گرد کرده؟» — a later «آره» must not be able to turn this wrong line into accepted rounding
7. [chat] <span dir="rtl">U: سه تا قسط: ۲ میلیون و ۳۰۰ × ۳ = ۶ میلیون و ۹۰۰</span> — _context:_ <span dir="rtl">adult; both consistent readings fit (C84 «two make it right»)</span>  
   → ASK-SCALE — thousand 6 900 000 = «۶ میلیون و ۹۰۰ هزار» and units 6 000 900 = «۶ میلیون و ۹۰۰» both fit; the page asks ONCE «۹۰۰ هزار یا ۹۰۰ تومان؟» (or the same question in its words); neither ✓ nor ✗ until she answers; no second ask in the same reply
8. [chat] <span dir="rtl">U: سه تا قسط: ۲ میلیون و ۳۰۰ × ۳ = ۶ میلیون و ۹۰۰ ‖ [page: «۹۰۰ هزار یا ۹۰۰ تومان؟»] ‖ U: هزار، ۹۰۰ هزار</span> — _context:_ <span dir="rtl">adult; the `m2` answer reader (A28-11: her answer to «کدام خوانش؟» was not read)</span>  
   → her answer is read: the line becomes OK under the thousand reading and is stored with it (2.3 M × 3 = 6.9 M); the question is not repeated; 📜 shows ✓ beside her line, not «؟»
9. [chat] <span dir="rtl">U: ۱۲ میلیون و ۴۰۰ ÷ ۴ = ۳ میلیون و ۱۰۰ ‖ [page: asks which reading of «و ۴۰۰ / و ۱۰۰»] ‖ U: تومن منظورم بود، نه هزار</span> — _context:_ <span dir="rtl">adult; `m2` with a units answer and a negated alternative</span>  
   → first message ASK-SCALE (thousand 3 100 000 and units 3 000 100 both fit); her answer is read as the units reading: OK (12 000 400 ÷ 4 = 3 000 100); «نه هزار» is not read as a third value; no second ask
10. [chat] <span dir="rtl">U: ۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰</span> — _context:_ <span dir="rtl">adult; a sum with no carry, so both consistent readings fit</span>  
   → ASK-SCALE — thousand 5 700 000 and units 5 000 700 both make her line right; the page asks once which she meant; never ✗, never ✓ by a silent choice
11. [chat] <span dir="rtl">U: ۱ میلیارد و ۲۰۰ + ۸۰۰ میلیون = ۲ میلیارد</span> — _context:_ <span dir="rtl">adult, a flat deposit; «N میلیارد و M» (M of the next lower named scale = million)</span>  
   → OK — 1.2 billion + 0.8 billion = 2 billion under the million reading; the units reading 1 800 000 200 does not fit; the page writes values with «میلیارد / میلیون», never a raw ten-digit string
12. [chat] <span dir="rtl">U: ۱۴ نفر، نفری ۲۵۰ هزار: ۱۴ × ۲۵۰ هزار = ۳ میلیون و ۴۰۰</span> — _context:_ <span dir="rtl">adult, a group dinner; D28-15 shape (the scale word was dropped from the page's value)</span>  
   → FLAG — 14 × 250 000 = 3 500 000; her result read as 3 000 400 or 3 400 000 fits neither; the coach line writes the exact value with her scale words («۳ میلیون و ۵۰۰ هزار») and both readings of her result; never «حسابِ صفحه: ۳٫۵» with the scale dropped
13. [chat] <span dir="rtl">U: کرایه ۳ میلیون و ۷۰۰، با ۳۰۰ هزار انعام: ۳ میلیون و ۷۰۰ + ۳۰۰ هزار = ۴ میلیون</span> — _context:_ <span dir="rtl">adult, moving costs; A28-9 shape (the correct line got no line at all)</span>  
   → OK — 3.7 M + 0.3 M = 4 M under the thousand reading (units 3 300 700 does not fit); never silent: a ✓ line reaches the coach and 📜
14. [chat] <span dir="rtl">U: دو تا لپ‌تاپ: ۸ میلیون و ۵۰۰ × ۲ = ۱۷ میلیون</span> — _context:_ <span dir="rtl">teen 17, comparing prices; result without an M part</span>  
   → OK — 8.5 M × 2 = 17 M (units 16 001 000 does not fit); no scale question
15. [chat] <span dir="rtl">U: کل خرج: ۲ میلیون و ۲۵۰ + ۱ میلیون و ۸۰۰ + ۹۵۰ هزار = ۵ میلیون</span> — _context:_ <span dir="rtl">adult; three terms, two of them «N میلیون و M»</span>  
   → OK — only the thousand reading of both M parts fits (2.25 M + 1.8 M + 0.95 M = 5 M); units/mixed give 3 951 050, 4 200 800, 4 750 250; never ✗, never ASK-SCALE
16. [chat] <span dir="rtl">U: ۲۰ تا مداد داریم، هر جعبه ۶ تا: ۶ و ۶ و ۶ میشه ۱۸، ۲ تا می‌مونه</span> — _context:_ <span dir="rtl">child 8, packing pencils; S1 family (A28-40 shape: a remainder clause right after the sum)</span>  
   → OK — 6 + 6 + 6 = 18; «۲ تا می‌مونه» starts its own statement (20 − 18 = 2, true) and is never glued to the sum; the coach never receives «✗ … را «۱۸ و باقی‌ماندهٔ ۲» نوشته»; nothing tells the child the sum is wrong
17. [chat] <span dir="rtl">U: ۳۰ تا آبنبات بین چهار نفر: ۷ و ۷ و ۷ و ۷ میشه ۲۸، ۲ تا باقی می‌مونه</span> — _context:_ <span dir="rtl">child 9, sharing sweets; S1 family; «باقی می‌مونه»</span>  
   → OK — 7 + 7 + 7 + 7 = 28; the remainder clause (30 − 28 = 2) is its own statement, not the sum's result
18. [chat] <span dir="rtl">U: ۳۵ تا صندلی، ۴ ردیف ۸تایی: ۴ × ۸ = ۳۲، ۳ تا اضافه میاد</span> — _context:_ <span dir="rtl">teen 13, a class play; S1 family with «اضافه میاد» after a symbolic product</span>  
   → OK — 4 × 8 = 32; «۳ تا اضافه میاد» (35 − 32 = 3) is a separate statement; never «۳۲ و ۳»
19. [chat] <span dir="rtl">U: ۱۴ تا مهمون داریم ولی بشقاب‌ها: ۵ و ۵ میشه ۱۰، ۴ تا کم میاد</span> — _context:_ <span dir="rtl">adult, a family dinner; S1 family with «کم میاد»</span>  
   → OK — 5 + 5 = 10; «۴ تا کم میاد» (14 − 10 = 4) is its own statement; the sum is never ✗
20. [chat] <span dir="rtl">U: 9 و 9 میشه 18، 1 تا می‌مونه</span> — _context:_ <span dir="rtl">child 10; Latin digits throughout; S1 family (19 marbles in two bags)</span>  
   → OK — 9 + 9 = 18; the remainder clause is not an operand; Latin digits read like Persian ones
21. [chat] <span dir="rtl">U: ۸ و ۸ و ۸ میشه ۲۴، ۳ تا میمونه</span> — _context:_ <span dir="rtl">child 11; ZWNJ missing in «میمونه»; S1 family (27 stickers)</span>  
   → OK — 8 + 8 + 8 = 24; detection of the remainder clause does not depend on the ZWNJ
22. [chat] <span dir="rtl">U: ۶ و ۶ و ۶ میشه ۱۹، ۱ تا می‌مونه</span> — _context:_ <span dir="rtl">child 8; S1 family look-alike that is genuinely wrong in the sum itself</span>  
   → FLAG — 6 + 6 + 6 = 18, not 19; the ✗ quotes only «۶ و ۶ و ۶ میشه ۱۹», never «۱۹ و باقی‌ماندهٔ ۱»; the remainder clause is judged on its own (if at all) and does not change the sum's verdict
23. [chat] <span dir="rtl">U: ۲۵ تا تخم‌مرغ، ۳ تا شونه‌ی ۷ تایی: ۳ تا ۷ تا میشه ۲۱، ۴ تا می‌مونه</span> — _context:_ <span dir="rtl">adult; C41 product followed by a remainder clause; S1 family</span>  
   → OK — 3 × 7 = 21 (C41 «N تا M تا»); «۴ تا می‌مونه» (25 − 21 = 4) is its own statement; the «تا» of the remainder clause is never read as a third factor
24. [chat] <span dir="rtl">U: ۱۷ تا سیب، هر کیسه ۴ تا: ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۱ تا می‌مونه، پس ۵ تا کیسه لازمه</span> — _context:_ <span dir="rtl">child 10; S1 family with a conclusion after the remainder</span>  
   → OK — 4 + 4 + 4 + 4 = 16; the remainder and «پس ۵ تا کیسه» are separate statements; the sum is never ✗ and the child is never told the sum was wrong; if the coach later learns the ✗ was false, the false ✗ never existed to withdraw
25. [chat] <span dir="rtl">U: قطرِ صفحه: sqrt(۵۰) ≈ ۷٫۰۷</span> — _context:_ <span dir="rtl">teen 16, geometry homework; «sqrt(…)» typed instead of «√» (A28-7)</span>  
   → OK — √50 = 7.0710…, 7.07 at her two digits; read exactly like «√۵۰ ≈ ۷٫۰۷»; never «نسنجیده» because of the spelling
26. [chat] <span dir="rtl">U: sqrt(20) ≈ 4.72</span> — _context:_ <span dir="rtl">adult; Latin «sqrt» and Latin digits</span>  
   → FLAG — √20 = 4.4721…, 4.72 is neither its rounding nor its truncation at two digits
27. [chat] <span dir="rtl">U: قطرِ مربعِ ۳ سانتی: ۳√۲ ≈ ۴٫۲۴</span> — _context:_ <span dir="rtl">teen 15; «a√b ≈ c» (A28-8: such a line got no line at all)</span>  
   → NOT-FLAG — 3√2 = 4.2426…, so 4.24 is right; OK if the page computes «a√b», UNCHECKED («نسنجیده») if it does not; never silent, never ✗
28. [chat] <span dir="rtl">U: ۳ و ۵ دهم ضربدر ۴ میشه ۱۴</span> — _context:_ <span dir="rtl">adult, buying fabric (3.5 m per curtain); «A و N دهم» (D26-24)</span>  
   → OK — 3.5 × 4 = 14; «۳ و ۵ دهم» is one operand 3.5, never a C40 sum «۳ و ۵»
29. [chat] <span dir="rtl">U: ۲ و ۷ دهم کیلو + ۱ و ۸ دهم کیلو = ۴ و ۵ دهم کیلو</span> — _context:_ <span dir="rtl">elder 66, register «شما», weighing fruit</span>  
   → OK — 2.7 + 1.8 = 4.5; all three «A و N دهم» are read as decimals; the unit «کیلو» is not a factor
30. [chat] <span dir="rtl">U: ۵√۳ ≈ ۸٫۶۶</span> — _context:_ <span dir="rtl">adult, a hexagon's height</span>  
   → NOT-FLAG — 5√3 = 8.6602…, 8.66 right at her digits; OK if computed, UNCHECKED if not; never silent, never ✗

### Negative (look-alike)

1. [chat] <span dir="rtl">U: ۵ میلیون و ۸۰۰ + ۲ میلیون و ۶۰۰ = ۸ میلیون و ۴۰۰</span> — _context:_ <span dir="rtl">adult; look-alike of the «none fits» entry: the same operands with the right result; S1 family</span>  
   → OK — the thousand reading fits (8.4 M) and no other combination does (units 7 001 400 against 8 000 400); never ✗, never ASK-SCALE
2. [chat] <span dir="rtl">U: ۲ میلیون و ۴۰۰ + ۶۰۰ هزار = ۳ میلیون و ۲۰۰</span> — _context:_ <span dir="rtl">adult; look-alike of the C28-13 entry with a wrong result; S1 family</span>  
   → FLAG — thousand reading gives 3 000 000, units 2 600 400; her 3 000 200 / 3 200 000 fits neither; never OK, never «؟ گرد کرده؟», never ASK-SCALE
3. [chat] <span dir="rtl">U: ۶ میلیون و ۸۰۰ هزار + ۲ میلیون و ۳۰۰ هزار = ۹ میلیون و ۱۰۰ هزار</span> — _context:_ <span dir="rtl">adult; every M carries its own «هزار», so there is only one reading</span>  
   → OK — 6.8 M + 2.3 M = 9.1 M; no scale question is asked (nothing is ambiguous)
4. [chat] <span dir="rtl">U: ۴ میلیون و ۵۰۰ × ۱۰ = ۴۵ میلیون</span> — _context:_ <span dir="rtl">adult; look-alike of the C28-12 entry with the right result</span>  
   → OK — thousand reading 45 M fits, units 40 005 000 does not; no ✗, no rounding question, no scale question
5. [chat] <span dir="rtl">U: ۳ میلیون و ۶۰۰ ÷ ۲ = ۱ میلیون و ۸۰۰</span> — _context:_ <span dir="rtl">adult; look-alike of the ASK-SCALE «÷» entry: here the units reading does not fit (3 000 600 ÷ 2 = 1 500 300)</span>  
   → OK — only the thousand reading fits (1.8 M); no scale question
6. [chat] <span dir="rtl">U: ۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰ هزار</span> — _context:_ <span dir="rtl">adult; look-alike of the ASK-SCALE «+» entry: the explicit «هزار» on the result leaves one fitting reading</span>  
   → OK — 4.2 M + 1.5 M = 5.7 M; the units reading gives 5 000 700 ≠ 5 700 000; no scale question
7. [chat] <span dir="rtl">U: سه تا قسط: ۲ میلیون و ۳۰۰ × ۳ = ۶ میلیون و ۹۰۰ ‖ [page: «۹۰۰ هزار یا ۹۰۰ تومان؟»] ‖ U: راستی فردا جلسه‌ی مدرسه دارم</span> — _context:_ <span dir="rtl">adult; look-alike of the `m2` entries: the next message does not answer the scale question</span>  
   → the message is not read as an answer: the line stays «؟» (neither ✓ nor ✗), no reading is booked from «فردا», and the page does not invent her choice
8. [chat] <span dir="rtl">U: حقوقم ۹ میلیون و ۸۰۰ ـه و اجاره ۴ میلیون</span> — _context:_ <span dir="rtl">adult; amounts with no operation word or symbol</span>  
   → SILENT — no arithmetic line (C17); the amounts are data, not a calculation
9. [chat] <span dir="rtl">U: ۲۰ − ۱۵ = ۵ تا می‌مونه</span> — _context:_ <span dir="rtl">child 10; look-alike of C85: here the remainder number IS the result after «=»</span>  
   → OK — 20 − 15 = 5; the number after «=» is the claimed value (C18); the word «می‌مونه» does not split it off
10. [chat] <span dir="rtl">U: ۲۰ تا کارت داشتم: ۶ و ۶ و ۶ میشه ۱۸، ۵ تا می‌مونه</span> — _context:_ <span dir="rtl">child 9; the sum is right and the remainder clause is false (20 − 18 = 2); S1 family look-alike</span>  
   → the sum line is OK (18) and is never ✗; the false remainder is its own statement and never glued into the sum's verdict; whatever the coach says about the remainder, the sum is not reported as wrong
11. [chat] <span dir="rtl">U: ۸ و ۸ میشه ۱۶ تا، ۲ تا اضافه آوردم</span> — _context:_ <span dir="rtl">adult; a past-tense remainder clause after a comma</span>  
   → OK — 8 + 8 = 16; the clause after the comma is not an operand or result
12. [chat] <span dir="rtl">U: sqrt(۴۹) = ۸</span> — _context:_ <span dir="rtl">teen 14; look-alike of the «sqrt» entries with a wrong exact value</span>  
   → FLAG — √49 = 7; «sqrt» read like «√»; never UNCHECKED because of the spelling
13. [chat] <span dir="rtl">U: sqrt(۲) ≈ ۱٫۴۲</span> — _context:_ <span dir="rtl">teen 16; a near miss at her digits</span>  
   → FLAG — √2 = 1.41421…, rounds and truncates to 1.41, not 1.42 (C9)
14. [chat] <span dir="rtl">U: ۲√۵ ≈ ۴٫۹۷</span> — _context:_ <span dir="rtl">adult; look-alike of the «a√b ≈ c» entries with a wrong value</span>  
   → NOT-OK — 2√5 = 4.4721…; FLAG if the page computes «a√b», UNCHECKED if not; never ✓, never silent
15. [chat] <span dir="rtl">U: sqrt رو با ماشین‌حساب زدم، خیالم راحت شد</span> — _context:_ <span dir="rtl">adult; the word «sqrt» with no numbers</span>  
   → SILENT — nothing to compute; no «نسنجیده» line
16. [chat] <span dir="rtl">U: ۶ و ۴ دهم ضربدر ۲ میشه ۱۳ و ۸ دهم</span> — _context:_ <span dir="rtl">adult; look-alike of «A و N دهم» with a wrong product</span>  
   → FLAG — 6.4 × 2 = 12.8, not 13.8; both «… و N دهم» read as decimals
17. [chat] <span dir="rtl">U: ۷ و ۳ میشه ۱۰، دهم کلاس شدم</span> — _context:_ <span dir="rtl">teen 15; «دهم» as a rank right after a C40 sum</span>  
   → OK — 7 + 3 = 10 (C40 sum reading); «دهم کلاس» is not a decimal word and is not attached to the result
18. [chat] <span dir="rtl">U: ۱۴ × ۲۵۰ هزار = ۳ میلیون و ۵۰۰ هزار</span> — _context:_ <span dir="rtl">adult; look-alike of the D28-15 entry with the right result</span>  
   → OK — 14 × 250 000 = 3 500 000; one reading only; no ✗, no scale question

## R2.correction_engine · the correction engine (F7, F8). A correction «X نیست، Y» / «X نه Y» / «Xایم نه Y» changes the occurrence of X it names and nothing else — the smallest fragment; if X does not occur in the record, or occurs more than once and the message does not say which, the page asks which number; fixing a RESULT never changes a datum; her quote outside the replaced fragment stays byte-exact — C88 (C48, C55). A proposal is the exact recomputation along RECORDED dependency with the current value of EVERY corrected datum; scaling by the ratio of a correction or text replacement is never a proposal; equal digits elsewhere are not dependency — C89, C47, C66; an irrational value is shown exactly and approximately — C67. Accepting a proposal («آره، همون X درسته») is a correction wherever the proposal was shown (ledger, chat-only, live): it rewrites the step only if every base value of the proposal is still current, otherwise the page names the stale base instead of rewriting; the accepted step's dependants get their own proposals; nothing changes silently — C87, C68. A hypothetical is not a correction — C46. Base problem — «مسئلهٔ رنگ‌آمیزی» (adult, painting a room; every step ✓): گام ۱ «دیوارها: ۲ × (۵ + ۴) × ۳ = ۵۴ مترمربع» (length 5, width 4, height 3) · گام ۲ «هر لیتر ۹ مترمربع رو می‌پوشونه: ۵۴ ÷ ۹ = ۶ لیتر» · گام ۳ «دو دست: ۶ × ۲ = ۱۲ لیتر» · گام ۴ «هر قوطی ۴ لیتره: ۱۲ ÷ ۴ = ۳ قوطی» · گام ۵ «هر قوطی ۸۵۰ هزار: ۳ × ۸۵۰ = ۲۵۵۰ هزار» · گام ۶ «با ۳۰۰ هزار قلم‌مو و نوارچسب: ۲۵۵۰ + ۳۰۰ = ۲۸۵۰ هزار»; other lines in the same chat: «ساعتِ ۹ صبح شروع می‌کنیم», «اتاق ۴ تا پنجره داره», «۳ نفر کمکم می‌کنن». Base problem — «مسئلهٔ سیمان» (adult): «هر کیسه سیمان ۲۸۰ هزار؛ ۵ کیسه: ۵ × ۲۸۰ = ۱۴۰۰ هزار» ✓ · «چسبِ کاشی ۸۰۰ هزار؛ جمع: ۱۴۰۰ + ۸۰۰ = ۲۲۰۰ هزار» ✓ · «منهای ۳۰۰ هزار تخفیف میشه ۱ میلیون و ۸۰۰» ✗ (2200 − 300 = 1900). pos = a correction that must land on exactly its fragment / a proposal that must be exact / an acceptance that must act; neg = a look-alike that must stay untouched.


### Positive

1. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; the digit 4 also occurs as the can size (گام ۴) and the window count; the message names «عرض»</span>  
   → only the width inside گام ۱ changes («(۵ + ۴)» ⇒ «(۵ + ۵٫۵)»), old value kept as history; exact proposals along the recorded chain: گام ۱ 63, گام ۲ 7, گام ۳ 14, گام ۴ 3.5, گام ۵ 2975 هزار, گام ۶ 3275 هزار; never 3325 (2850 × 63/54, a scaled guess); the «۴ لیتر» of گام ۴ and «۴ تا پنجره» are untouched
2. [chat] <span dir="rtl">U: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; coverage correction; «ساعتِ ۹ صبح» is in the same chat</span>  
   → گام ۱ is NOT stale (it does not use the coverage); proposals: گام ۲ 5.4, گام ۳ 10.8, گام ۴ 2.7, گام ۵ 2295, گام ۶ 2595; never 2565 (2850 × 9/10); the line «ساعتِ ۹ صبح شروع می‌کنیم» is untouched
3. [chat] <span dir="rtl">U: قوطی‌ها ۸۵۰ نیستن، ۹۰۰ هزارن</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; price correction; گام ۶ adds a constant, so scaling and recomputation differ</span>  
   → only گام ۵ and گام ۶ are reached: proposals 2700 and 3000; never 3017.6 (2850 × 900/850); گام ۱ to ۴ carry no stale mark
4. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره ‖ [proposals shown, none accepted] ‖ U: یه چیز دیگه: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; two corrections in a row (C89 «current value of EVERY corrected datum»; C28-14 used a stale datum)</span>  
   → after the second message every open proposal uses BOTH current values: گام ۱ 63, گام ۲ 6.3, گام ۳ 12.6, گام ۴ 3.15, گام ۵ 2677.5, گام ۶ 2977.5; the earlier proposals (7, 14, 3.5 …) are replaced, never shown beside the new ones as current; never 5.4 / 2.7 (coverage only)
5. [chat] <span dir="rtl">U: قوطی‌ها ۴ لیتری نیستن، ۵ لیتری‌ان</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; the can size, while the width is also 4</span>  
   → only the «۴» of گام ۴ changes; proposals گام ۴ 2.4, گام ۵ 2040, گام ۶ 2340; the width «۴» in گام ۱ and «۴ تا پنجره» are untouched and not stale
6. [chat] <span dir="rtl">U: ۴ نیست، ۵ ـه</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; the bare number 4 occurs three times (width, can size, windows) and the message names none (C88)</span>  
   → the page asks which «۴» she means (listing the occurrences in her words); nothing is changed, no stale mark and no proposal until she answers
7. [chat] <span dir="rtl">U: ۸۰۰ نیست، ۹۰۰ ـه</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; 800 does not occur in this record (the price is 850)</span>  
   → the page asks which number she means; it never rewrites «۸۵۰», never proposes from 900; nothing changes
8. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره ‖ [proposal for گام ۲: «۶ ⇒ ۷»] ‖ U: آره، همون ۷ درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; C87/C68 acceptance in a ledger (A28-16: «آره، همون X درسته» did nothing)</span>  
   → گام ۲ is rewritten to «۶۳ ÷ ۹ = ۷ لیتر» with «اصلاح شد ⇐ ۶» kept; its dependants keep or receive exact proposals (گام ۳ 14, گام ۴ 3.5, گام ۵ 2975, گام ۶ 3275) and none changes silently; PAGE-LEVEL: the ledger card and 📜 show the new step text and its history after the reply
9. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره ‖ [proposal for گام ۲: «۶ ⇒ ۷»] ‖ U: راستی هر لیتر ۱۰ مترمربع رو می‌پوشونه، نه ۹ ‖ U: آره، همون ۷ درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; acceptance of a proposal whose base is no longer current (D28-13 shape)</span>  
   → گام ۲ is NOT rewritten to 7; the page names the stale base (the proposal was built with 9 m² per litre, now 10) and shows the fresh exact value 6.3 for her yes; nothing else changes
10. [chat] <span dir="rtl">U: اجاره‌ی ویلا ۱۸ میلیون، سهمِ هر نفر: ۱۸ میلیون ÷ ۴ = ۴ میلیون و ۵۰۰ هزار ‖ U: ۴ نفر نیستیم، ۵ نفریم ‖ [proposal «۴ میلیون و ۵۰۰ هزار ⇒ ۳ میلیون و ۶۰۰ هزار»] ‖ U: آره همون ۳ میلیون و ۶۰۰ درسته</span> — _context:_ <span dir="rtl">adult; a chat-only problem with no ledger (C87 «wherever a proposal was shown»; A28-16 s04)</span>  
   → the chat line is rewritten to «۱۸ میلیون ÷ ۵ = ۳ میلیون و ۶۰۰ هزار» with the old value as history; ✓ beside it in 📜; the reply confirms what was rewritten
11. [chat] <span dir="rtl">U: ببخشید، منهای ۳۰۰ هزار میشه ۱ میلیون و ۹۰۰</span> — _context:_ <span dir="rtl">«مسئلهٔ سیمان»; she fixes a RESULT (B28·D8 shape: the fix rewrote the glue datum 800 ⇒ 300)</span>  
   → only the result fragment «۱ میلیون و ۸۰۰» ⇒ «۱ میلیون و ۹۰۰» changes, with history; the datum «چسبِ کاشی ۸۰۰ هزار» and «۲۸۰ هزار» stay as typed; the line is now OK (2200 − 300 = 1900 هزار)
12. [chat] <span dir="rtl">[page had wrongly rewritten «چسبِ کاشی ۸۰۰ هزار» to «۳۰۰ هزار»] ‖ U: اون ۸۰۰ رو عوض نکن، چسب همون ۸۰۰ هزاره</span> — _context:_ <span dir="rtl">«مسئلهٔ سیمان»; her restore of a datum the page changed (B28·D8: the restore was refused «مقدارِ درست با مقدارِ پیشین فرقی نداشت»)</span>  
   → the datum is restored to «۸۰۰ هزار» with both moves in history; never refused; the sum line reads 1400 + 800 = 2200 again
13. [chat] <span dir="rtl">U: ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار: ۴ × ۲ × ۶۰۰ = ۴۸۰۰ هزار ‖ U: ۴ نفر نیستیم، ۵ نفریم</span> — _context:_ <span dir="rtl">adult, a trip; A28-14 shape (the whole datum sentence became «۵»)</span>  
   → the datum reads «ما ۵ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار» — only «۴» replaced; the product gets the exact proposal 6000 هزار (5 × 2 × 600); «۲ شب» and «۶۰۰» untouched
14. [chat] <span dir="rtl">[prior ledger quote: «۲۰ تا فاکتور رو شمردم، ۱۲ تاش مهر داشت»] ‖ U: نه، ۱۲ نه، ۱۴ تاش مهر داشت</span> — _context:_ <span dir="rtl">adult, an audit check in her opening ledger; C28-2 shape (her words were dropped from the quote)</span>  
   → the quote reads «۲۰ تا فاکتور رو شمردم، ۱۴ تاش مهر داشت» — byte-exact outside the replaced «۱۲»; never «۱۴. درسته دیگه؟ ثابت شد» or any rewrite of her words; old quote in history
15. [chat] <span dir="rtl">U: اتاقِ کار ۴ متر در ۵ متر = ۲۰ مترمربع، هر مترمربع موکت ۱۵۰ هزار: ۲۰ × ۱۵۰ = ۳۰۰۰ هزار ‖ U: طولش ۵ متر نیست، ۵٫۵ متره</span> — _context:_ <span dir="rtl">adult; D28-12 shape (the correction replaced the other factor)</span>  
   → the line becomes «۴ متر در ۵٫۵ متر»; exact proposals 22 مترمربع and 3300 هزار (22 × 150); never «۵٫۵ متر در ۵ متر», never 27.5 or 4125
16. [chat] <span dir="rtl">U: فروشنده گفته بود ۱۰ درصد تخفیف می‌ده: ۲۰ × ۰٫۹ = ۱۸ میلیون ‖ U: آهان، فروشنده ۱۲ درصد گفته بود نه ۱۰</span> — _context:_ <span dir="rtl">adult, buying a sofa set; a datum with a source corrected (D28-11 shape: filed as «کارِ دیگری» and nothing went stale)</span>  
   → a datum correction 10 ⇒ 12: the product line is marked stale with the exact proposal 17.6 میلیون (20 × 0.88); the datum keeps its source label; nothing is filed as «کارِ دیگری»
17. [chat] <span dir="rtl">U: نردبون: √(۳² + ۴²) = ۵ متر ‖ U: ارتفاع ۴ نیست، ۵ متره</span> — _context:_ <span dir="rtl">adult; an irrational recomputation (C67)</span>  
   → proposal shown exactly and approximately in her form: «√۳۴ ≈ ۵٫۸۳» (√34 = 5.8309…); never a bare «۶», never «۵» kept as current
18. [chat] <span dir="rtl">U: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه ‖ U: خب پس ۵۴ ÷ ۱۰ = ۵٫۴ لیتر</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; her own redo with the corrected value</span>  
   → گام ۲ is updated from her redo (✓, 5.4) and its stale mark clears; گام ۳ to ۶ stay stale with exact proposals (10.8, 2.7, 2295, 2595)
19. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; the correction header</span>  
   → PAGE-LEVEL: the header in 📜 states the change exactly as made — one arrow form, «عرض: ۴ ⇒ ۵٫۵» (or the same in the page's single arrow convention) — never a garbled or doubled line, never the result line repeated
20. [chat] <span dir="rtl">U: کتاب: ۴۸ صفحه مونده، روزی ۱۲ صفحه: ۴۸ ÷ ۱۲ = ۴ روز. فصلِ بعدی از صفحه‌ی ۱۲۰ شروع میشه ‖ U: روزی ۱۲ نه، ۱۶ صفحه</span> — _context:_ <span dir="rtl">teen 15, a reading plan; equal leading digits elsewhere (A28-38)</span>  
   → proposal «۴ ⇒ ۳ روز» (48 ÷ 16); the «۱۲۰» of the chapter line is untouched and not stale
21. [chat] <span dir="rtl">U: عرض ۵٫۵ ـه نه ۴؛ حالا چند قوطی لازمه؟</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; correction plus question in one message (C48)</span>  
   → the correction lands exactly as in the first entry (proposals 63, 7, 14, 3.5, 2975, 3275) AND the question goes to the coach; neither is refused, the reply does not say «این اصلاح انجام نشد»
22. [chat] <span dir="rtl">U: ۵ نفریم نه ۴</span> — _context:_ <span dir="rtl">adult, the trip datum above; the «Xایم نه Y» form (C48)</span>  
   → corrects 4 ⇒ 5 in the datum, only that fragment; exact proposal 6000 هزار for the product
23. [chat] <span dir="rtl">U: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه ‖ [proposals shown] ‖ U: آره، همون ۵٫۴ درسته ‖ U: آره، ۱۰٫۸ هم درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; successive acceptances down the chain (C68)</span>  
   → گام ۲ rewritten to 5.4, then گام ۳ to 10.8, each with history; after each acceptance the remaining dependants (گام ۴ 2.7, گام ۵ 2295, گام ۶ 2595) still show exact proposals; nothing is rewritten without her yes

### Negative (look-alike)

1. [chat] <span dir="rtl">U: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; look at the unrelated «ساعتِ ۹ صبح شروع می‌کنیم» and «۳ نفر کمکم می‌کنن»</span>  
   → neither line gets a stale mark, a proposal or a rewrite (equal digits are not dependency, C47/C66)
2. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; look at «اتاق ۴ تا پنجره داره» and گام ۴ «هر قوطی ۴ لیتره»</span>  
   → both stay exactly as typed, unmarked; the proposal for گام ۴ (3.5) comes from 14 ÷ 4 with the can size kept at 4
3. [chat] <span dir="rtl">U: قوطی‌ها ۸۵۰ نیستن، ۹۰۰ هزارن</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; look at گام ۱ to ۴</span>  
   → no stale mark, no proposal on گام ۱–۴ (they do not depend on the price)
4. [chat] <span dir="rtl">U: اگه عرض ۵٫۵ بود چی میشد؟</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; a hypothetical (C46)</span>  
   → no correction: no datum changes, no stale mark, no proposal; the coach answers the question
5. [chat] <span dir="rtl">U: عرضِ اتاق ۴ نیست، ۵٫۵ متره ‖ [proposal for گام ۲: «۶ ⇒ ۷»] ‖ U: نه، اون ۷ رو قبول ندارم</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; negation of a proposal</span>  
   → گام ۲ is not rewritten; the stale mark and the proposal stay; the page does not treat «۷» as accepted
6. [chat] <span dir="rtl">U: ۵۴ ÷ ۹ چند میشه دقیقاً؟</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; a question with numbers from the ledger</span>  
   → not a correction: nothing changes, nothing is marked stale; the coach answers
7. [chat] <span dir="rtl">U: کتاب: ۴۸ صفحه مونده، روزی ۱۲ صفحه: ۴۸ ÷ ۱۲ = ۴ روز. فصلِ بعدی از صفحه‌ی ۱۲۰ شروع میشه ‖ U: روزی ۱۲ نه، ۱۶ صفحه</span> — _context:_ <span dir="rtl">teen 15; look at the chapter line only (A28-38)</span>  
   → «فصلِ بعدی از صفحه‌ی ۱۲۰ شروع میشه» has no stale mark and no proposal (never «۱۲۰ ⇒ ۱۶۰»)
8. [chat] <span dir="rtl">U: هر دور ۱۲ ثانیه، ۱۰ دور: ۱۲ × ۱۰ = ۱۲۰ ثانیه. کشش: ۱۲ + ۸ = ۲۰ ثانیه ‖ U: هر دور ۱۲ نیست، ۱۴ ثانیه‌ست</span> — _context:_ <span dir="rtl">teen 16, interval training; equal digits with the same unit, another meaning (C66)</span>  
   → «۱۲ × ۱۰» gets the proposal 140; the stretching line «۱۲ + ۸ = ۲۰ ثانیه» is not stale and the page does not ask about it
9. [chat] <span dir="rtl">U: ببخشید، منهای ۳۰۰ هزار میشه ۱ میلیون و ۹۰۰</span> — _context:_ <span dir="rtl">«مسئلهٔ سیمان»; look at «۵ کیسه: ۵ × ۲۸۰ = ۱۴۰۰ هزار»</span>  
   → no stale mark, no proposal, no rewrite of the bag line or its datum: fixing a result reaches no datum
10. [chat] <span dir="rtl">U: [two problems live: «مسئلهٔ رنگ‌آمیزی» and a trip problem «۴ نفریم»] ‖ U: تو مسئله‌ی سفر، ۴ نفر نیستیم ۵ نفریم</span> — _context:_ <span dir="rtl">adult; the correction names the other problem</span>  
   → the trip datum changes; «مسئلهٔ رنگ‌آمیزی» (width 4, can 4, windows 4) is untouched and unmarked
11. [chat] <span dir="rtl">U: اون ۸۰۰ رو عوض نکن</span> — _context:_ <span dir="rtl">«مسئلهٔ سیمان»; the page did NOT change the glue datum (look-alike of the restore entry)</span>  
   → nothing is changed; the page says the datum is still «۸۰۰ هزار» (no fake restore, no history line)
12. [chat] <span dir="rtl">U: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه ‖ U: ۵۴ ÷ ۹ = ۶، همونه دیگه</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; her «redo» with the OLD coverage</span>  
   → گام ۲ stays stale (built from 9, now 10); the line is OK as arithmetic but the stale mark is not cleared by it
13. [chat] <span dir="rtl">[coach: «می‌خوای اول سقف رو حساب کنیم؟»] ‖ U: آره</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; open proposals exist but the yes answers the coach's question</span>  
   → no proposal is accepted, no step rewritten (the yes is not «آره، همون X درسته»)
14. [chat] <span dir="rtl">U: عرض همون ۴ ـه، درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; restating the current value</span>  
   → no correction, no history line, no stale mark
15. [chat] <span dir="rtl">U: داداشم میگه باید ۱۰ درصد بیشتر بخرم</span> — _context:_ <span dir="rtl">«مسئلهٔ رنگ‌آمیزی»; advice with a number, no «X نیست، Y»</span>  
   → not a correction: no datum or step changes; no proposal
16. [chat] <span dir="rtl">U: ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار: ۴ × ۲ × ۶۰۰ = ۴۸۰۰ هزار ‖ U: ۲ شب نه، ۳ شب</span> — _context:_ <span dir="rtl">adult; the correction names «شب», so «۲» of nights changes and «۴ نفر» does not</span>  
   → datum reads «ما ۴ نفریم و هر نفر ۳ شب می‌مونه، شبی ۶۰۰ هزار»; proposal 7200 هزار (4 × 3 × 600); «۴ نفر» untouched

## R3.date_ask_engine · the date-ask engine (F5, F6). Date asks are per act: «X نه، Y» moves only the act in its own clause; a pending ask is booked only by a yes to it or by her restating its day; an idiom without an exact day («بعد از عید», «وسطِ ماه», «آخرِ سالِ تحصیلی», «ماهِ دیگه») ⇒ «کدام روز؟» with no suggested day and NO «امروز …» sentence — the «امروز خودش جمعه است: همین امروز یا جمعهٔ بعد؟» template belongs only to «تا جمعه» said on a Friday (C1) — and such a row is answered only by an explicit day given in reply to it — C92 (C49, C70). ✏️ that puts a day in the past ⇒ the page asks «این روز گذشته — کدام روز؟» and keeps the booking until she answers; it never drifts to next year; a relative day in an edited sentence is computed from the day the sentence was SAID — C93 (C58). The past tense of the act's verb («زنگ زدم», «خریدم», «رفتم») closes that act; a new plan is never «انجام شد» at birth — C94. Calendar idioms stay calendar facts through «… درست است؟»: «سرِ برج / اولِ ماه» = day 1 of the next Jalali month, «آخرِ سال» = the last day of Esfand of the current Jalali year, «عید» = 1 Farvardin (of the next Jalali year once this year's has passed) — C50/C70. An ask is open on its own day and lapses when that day ends — C69; «بله، ⟨another day⟩» — her day wins — C72; a negated day alone books nothing and the page asks — C71; one commitment = one record, a reminder on another day is a second date of the same record — C52/C73; no ask from another person's act, a conditional, a forecast, a quoted page line, a past narrative or elapsed time — C19/C35. Weeks run Saturday–Friday; «the first ⟨weekday⟩ after D0» is computed at run time (verified offsets are in the verify script). pos = the ask / booking / closing stated; neg = a look-alike with no ask (or the stated different result).


### Positive

1. [time] <span dir="rtl">U: بعد از عید کاشی‌های حموم رو عوض می‌کنم</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday in Aban (F5: the false «امروز خودش جمعه است» on a non-Friday, all four groups)</span>  
   → the page asks «کدام روز؟» anchored on 1 Farvardin of the next Jalali year, with no suggested day; never «امروز خودش جمعه است», never «همین امروز یا جمعهٔ بعد»; nothing is booked
2. [time] <span dir="rtl">U: وسطِ ماه می‌رم بانک برای وام</span> — _context:_ <span dir="rtl">adult; clock on a Monday (dB1: the today-Friday template on a Monday)</span>  
   → «کدام روز؟» with no number proposed (C70: not a calendar fact); no «امروز …» sentence; nothing booked
3. [time] <span dir="rtl">U: آخرِ سالِ تحصیلی ثبت‌نامِ کلاسِ شنا رو انجام می‌دم</span> — _context:_ <span dir="rtl">adult, for her son; clock on a Saturday</span>  
   → «کدام روز؟» with no number (C70); never a booking or a proposed date; the act is her own, so the ask is raised (not silent, B28·D14)
4. [time] <span dir="rtl">U: بعد از عید ماشین رو می‌فروشم</span> — _context:_ <span dir="rtl">adult; clock on a Friday — the C1 template must still not appear</span>  
   → «کدام روز؟» anchored on 1 Farvardin of the next Jalali year; the Friday question «همین امروز یا جمعهٔ بعد؟» is NOT used, because she did not say «تا جمعه»
5. [time] <span dir="rtl">U: ماهِ دیگه اسباب‌کشی داریم</span> — _context:_ <span dir="rtl">adult; clock on a Monday (D28-20: a weekday date was invented for a vague span)</span>  
   → «کدام روز؟» with no suggested day; never a booked or proposed date such as «چهارشنبه ⟨…⟩»
6. [time] <span dir="rtl">U: اولِ ماه اجاره رو می‌دم، عید می‌ریم شمال، وسطِ ماه هم دندون‌پزشکی دارم</span> — _context:_ <span dir="rtl">adult; clock in Aban, not on day 1 of the month; three acts in one message (D28-22: only one was handled, the rest lost silently)</span>  
   → three separate rows, one per act: the rent at day 1 of the next Jalali month through «… درست است؟»; the trip at 1 Farvardin of the next Jalali year through «… درست است؟»; the dentist «کدام روز؟» with no number; none is lost, none answers another
7. [time] <span dir="rtl">[page row: «بعد از عید — کدام روز؟» for «رنگ‌کاریِ اتاق»] ‖ U: پنجم فروردین</span> — _context:_ <span dir="rtl">adult; clock in Azar; an explicit day given in reply to the idiom row (C92)</span>  
   → the row is answered with 5 Farvardin of the next Jalali year, shown once with «… درست است؟» (or booked with one confirming line); no other row is touched
8. [time] <span dir="rtl">[page reply 1: «📅 قبضِ گاز — پنجشنبه ⟨D0+1⟩ — درست است؟»] ‖ [page reply 2: «📅 تعمیرِ کولر — شنبه ⟨D0+3⟩ — درست است؟»] ‖ U: قبض رو پنجشنبه نه، چهارشنبه می‌دم</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday; the negation names the OLDER act (A28-1: a negated/new day moved another act's ask)</span>  
   → only the gas-bill ask moves: «چهارشنبه ⟨D0+7⟩ … درست است؟» asked once; the cooler ask stays «شنبه ⟨D0+3⟩» untouched; Thursday is never booked or offered again for either act
9. [time] <span dir="rtl">U: پنجشنبه نه، یکشنبه می‌رم دکتر</span> — _context:_ <span dir="rtl">adult; clock on a Monday (B28·D14: Sunday was never asked)</span>  
   → «یکشنبه ⟨D0+6⟩ … درست است؟» asked once; Thursday (D0+3) is never booked, offered or used for another ask
10. [time] <span dir="rtl">[page: «📅 ثبت‌نامِ آزمون — ⟨D0+9, written as day + month name⟩ — درست است؟»] ‖ U: همون ⟨D0+9, written as day + month name⟩ درسته</span> — _context:_ <span dir="rtl">adult; restating the asked day is a yes (C92; B28·D7 «همون ۱۵ اسفند درسته» was «بی‌جواب ماند»)</span>  
   → booked for D0+9 with one confirming line; never «بی‌جواب ماند، ثبت نشد»
11. [time] <span dir="rtl">[📌 open: «تا جمعه به مدیر جواب می‌دم»] ‖ U: پنجشنبه با صاحب‌خونه قرار دارم ‖ [page: «📅 قرار با صاحب‌خونه — پنجشنبه ⟨D0+3⟩ — درست است؟»] ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; clock on a Monday (pwB2 B28·D7: «باشه» booked the appointment as a reminder of the other plan)</span>  
   → the appointment becomes its own 📌 on D0+3; the manager plan is unchanged; never «⏰ یادآورِ … (همان 📌؛ یک کار، دو تاریخ)»
12. [time] <span dir="rtl">[📌 open: «تا جمعه کابینت‌ها رو تموم می‌کنم»] ‖ U: قسطِ آخرِ وام رو سرِ برج می‌دم</span> — _context:_ <span dir="rtl">adult; clock in Aban, not on day 1 (D28-4: the payment was booked as a ⏰ of the cabinet plan)</span>  
   → the payment is its own act with its own ask: day 1 of the next Jalali month through «… درست است؟»; it is never attached to the cabinet 📌
13. [edit] <span dir="rtl">[📌 booked: «پنجشنبه بلیت می‌خرم» ⟨D0+2⟩] ‖ ✏️ «پنجشنبه» ⇒ «دیروز»</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; ✏️ into the past (A28-2: the text changed, the booking stayed with no question)</span>  
   → the page asks «این روز گذشته — کدام روز؟»; the D0+2 booking is kept until she answers and is not reported as «تاریخی ثبت نشد»
14. [edit] <span dir="rtl">[⏰ booked: «پس‌فردا کارتن‌ها رو می‌خرم» ⟨D0+2⟩] ‖ ✏️ «پس‌فردا» ⇒ «⟨D0−1, written yyyy/m/d⟩»</span> — _context:_ <span dir="rtl">adult; a written date one day before the message (D28-28: moved to the same day of the next Jalali year)</span>  
   → «این روز گذشته — کدام روز؟»; never a date in the next Jalali year; the D0+2 booking stays until she answers
15. [edit] <span dir="rtl">U: جمعه می‌رم کتابخونه ‖ [booked ⟨D0+2⟩] ‖ [clock → D0+1] ‖ ✏️ «جمعه» ⇒ «پنجشنبه»</span> — _context:_ <span dir="rtl">adult; message said on a Wednesday, edited on Thursday (D28-27 / B28·D14: the new day was computed from the edit day)</span>  
   → the new date is the Thursday after the day she SAID it = D0+1 (still open on its own day, C69), asked once; never D0+8 (the Thursday after the edit day); the old ask closes as «replaced», never «تاریخی ثبت نشد»
16. [time] <span dir="rtl">[📌 booked: «پنجشنبه به مادربزرگ زنگ می‌زنم»] ‖ [clock → D0+1] ‖ U: به مادربزرگ زنگ زدم، حالش خوبه</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday; the past tense of the act's verb (A27-19 / aA3: «انجام شد؟» stayed after «زنگ زدم»)</span>  
   → the act is closed as done from her sentence; no later «انجام شد؟», no «بی‌جواب ماند»; «امروز» no longer lists it
17. [time] <span dir="rtl">[⏰ booked: «پس‌فردا کارتن‌ها رو می‌خرم»] ‖ [clock → D0+1] ‖ U: کارتن‌ها رو خریدم، ۱۲ تا</span> — _context:_ <span dir="rtl">adult; «خریدم»</span>  
   → the act is closed as done; the count «۱۲ تا» does not raise any ask
18. [time] <span dir="rtl">[📌 booked: «شنبه می‌رم اداره‌ی مالیات»] ‖ [clock → that Saturday] ‖ U: رفتم اداره، کارم راه افتاد</span> — _context:_ <span dir="rtl">elder 63, register «شما»; «رفتم»</span>  
   → the act is closed as done; nothing is re-asked
19. [page] <span dir="rtl">U: از فردا هر شب ۲۰ دقیقه انگلیسی می‌خونم؛ با این روش خیالم راحته که قبول میشم</span> — _context:_ <span dir="rtl">teen 17; a new plan with a confident clause (D28-7: a fresh plan closed «سرانجام: انجام شد» at birth)</span>  
   → a new open plan starting D0+1; PAGE-LEVEL: 📜 and «امروز» show it open, never «سرانجام: انجام شد» in the same minute
20. [time] <span dir="rtl">U: سرِ برج قسط رو می‌دم</span> — _context:_ <span dir="rtl">adult; clock on day 1 of a Jalali month (C70 boundary)</span>  
   → the page asks once: today, or day 1 of the next Jalali month; nothing booked until she answers
21. [time] <span dir="rtl">U: آخرِ سال حساب‌ها رو می‌بندم</span> — _context:_ <span dir="rtl">adult; clock on the last day of Esfand (C70 boundary)</span>  
   → today through «… درست است؟»; never next year's last day of Esfand
22. [time] <span dir="rtl">U: عید می‌رم دیدنِ پدربزرگ</span> — _context:_ <span dir="rtl">adult; clock on 6 Farvardin (after this year's 1 Farvardin, C70)</span>  
   → the page asks whether 1 Farvardin of the next Jalali year is meant; never books this year's (past) 1 Farvardin
23. [time] <span dir="rtl">[page: «📅 … فردا ⟨D0+1⟩ — درست است؟»] ‖ [clock → D0+1] ‖ U: آره</span> — _context:_ <span dir="rtl">adult; the ask is still open on its own day (C69)</span>  
   → booked for D0+1 (today now); no «بی‌جواب ماند»
24. [time] <span dir="rtl">[page: «📅 خریدِ دارو فردا ⟨D0+1⟩ — درست است؟»] ‖ U: بله، پس‌فردا</span> — _context:_ <span dir="rtl">elder 70, register «شما» (C72)</span>  
   → her day wins: D0+2 confirmed once with its date; D0+1 is not booked
25. [time] <span dir="rtl">U: این جمعه نه</span> — _context:_ <span dir="rtl">adult; a negated day alone while a Friday ask is pending (C71)</span>  
   → the Friday is not booked; the page asks which day; it offers no day itself and never re-offers that Friday
26. [time] <span dir="rtl">[page reply 1: «📅 دندون‌پزشکی ⟨D0+3⟩ — درست است؟»] ‖ U: یه سؤالِ دیگه هم داشتم … ‖ [page reply 2: «📅 خریدِ کتاب ⟨D0+5⟩ — درست است؟»] ‖ U: آره، ثبتش کن</span> — _context:_ <span dir="rtl">adult; two asks pending (C49)</span>  
   → only the newest ask (the book, D0+5) is booked; the dentist ask stays pending or lapses by its own date; nothing is booked for D0+3 from this yes
27. [time] <span dir="rtl">[page: «📅 تحویلِ پروژه — پنجشنبه ⟨D0+1⟩ — درست است؟»] ‖ U: مهلت پنجشنبه نیست، شنبه‌ست</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday (C28-1: the same reply moved the ask and said «چیزی برای عوض کردن نبود»)</span>  
   → the ask moves to «شنبه ⟨D0+3⟩ … درست است؟» once; the same reply never also says that nothing was changed

### Negative (look-alike)

1. [time] <span dir="rtl">U: چرا توی «امروز» نوشتی «زنگ به بیمه — پنجشنبه»؟ من که گفتم بعداً</span> — _context:_ <span dir="rtl">adult; a complaint that quotes a page line (A28-34)</span>  
   → no date ask from the quoted day; the quoted line is page text, not a new commitment
2. [time] <span dir="rtl">U: ودیعه رو صاحبخونه آخرِ سال پس میده</span> — _context:_ <span dir="rtl">adult; another person's act with an idiom date (D28-21)</span>  
   → no ask, no booking (C19)
3. [time] <span dir="rtl">U: احتمالش ۴۰ درصده که جمعه بارون بیاد</span> — _context:_ <span dir="rtl">adult; a forecast with a weekday (B28·D14)</span>  
   → no date ask; no «بی‌جواب ماند» later (the 🎯 belongs to R4.forecast)
4. [time] <span dir="rtl">U: اگه سرِ برج حقوق بیاد، کفش می‌خرم</span> — _context:_ <span dir="rtl">adult; a conditional (C35)</span>  
   → nothing booked, nothing asked
5. [time] <span dir="rtl">[page: «🎯 … موعدِ داوری کِی؟ ⟨D0+14⟩ — درست است؟»] ‖ U: یه مسئله‌ی دیگه هم دارم، ثبتش کن: یه باغچه‌ی ۶ در ۸ …</span> — _context:_ <span dir="rtl">adult; «ثبتش کن» whose object is the new problem (D28-16)</span>  
   → the 🎯 date ask is NOT booked by this message; the new problem gets its own record; no «✓ به گفتهٔ خودت ثبت شد»
6. [time] <span dir="rtl">[page row: «بعد از عید — کدام روز؟»] ‖ U: عید که شد می‌ریم خونه‌ی خاله‌م، بعدش ببینیم</span> — _context:_ <span dir="rtl">adult; narrative mentioning the idiom (D28-22: it booked 1 Farvardin)</span>  
   → not an answer: nothing booked; the row stays open; no 1 Farvardin booking
7. [time] <span dir="rtl">[page: «📅 سرِ برج ⟨day 1 of the next Jalali month⟩ — درست است؟»] ‖ U: راستی کتابِ جدید رو شروع کردم</span> — _context:_ <span dir="rtl">adult; the next message carries no yes (A28-3)</span>  
   → nothing booked; the ask stays pending (or lapses by its own day)
8. [time] <span dir="rtl">U: پارسال سرِ برج اجاره رو دیر دادم</span> — _context:_ <span dir="rtl">adult; past narrative with an idiom</span>  
   → no ask
9. [time] <span dir="rtl">[📌 booked: «پنجشنبه به مادربزرگ زنگ می‌زنم»] ‖ U: به تعمیرکار زنگ زدم</span> — _context:_ <span dir="rtl">adult; the past verb with another object (C94 look-alike)</span>  
   → the grandmother plan stays open; nothing is closed
10. [time] <span dir="rtl">[⏰ booked: «پس‌فردا کارتن‌ها رو می‌خرم»] ‖ U: هنوز نخریدم، فردا می‌خرم</span> — _context:_ <span dir="rtl">adult; future / negated past</span>  
   → not closed; the reply may ask about the new day (C72-style) but never marks it done
11. [page] <span dir="rtl">U: کلاسِ امروز تموم شد؛ از فردا هر شب ۲۰ دقیقه تمرین می‌کنم</span> — _context:_ <span dir="rtl">teen 14; a finished class and a new plan in one message (D28-7 look-alike)</span>  
   → PAGE-LEVEL: the new plan is open; «تموم شد» belongs to the class and never closes the plan
12. [edit] <span dir="rtl">[📌 booked: «پنجشنبه بلیت می‌خرم» ⟨D0+2⟩] ‖ ✏️ «پنجشنبه» ⇒ «شنبه»</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; ✏️ to a future day</span>  
   → no «این روز گذشته» question; the new date «شنبه ⟨D0+4⟩» is asked once; the old ask closes as «replaced»
13. [edit] <span dir="rtl">[📌 booked: «پنجشنبه بلیت می‌خرم» ⟨D0+2⟩] ‖ ✏️ «بلیت» ⇒ «بلیتِ قطار»</span> — _context:_ <span dir="rtl">adult; ✏️ that does not touch the day</span>  
   → the date stays D0+2; no new ask; no «replaced» line
14. [time] <span dir="rtl">U: امروز چهارشنبه‌ست و خیلی خسته‌ام</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday; today's weekday</span>  
   → no ask; the page never says «امروز خودش جمعه است»
15. [time] <span dir="rtl">U: سرِ برج قسط رو می‌دم</span> — _context:_ <span dir="rtl">adult; clock in Aban, not on day 1 (look-alike of the idioms with no exact day)</span>  
   → day 1 of the next Jalali month through «… درست است؟» — a calendar fact, so NOT «کدام روز؟» with no day
16. [time] <span dir="rtl">U: آخرِ سال حساب‌ها رو می‌بندم</span> — _context:_ <span dir="rtl">adult; clock in Aban (look-alike of «آخرِ سالِ تحصیلی»)</span>  
   → the last day of Esfand of the current Jalali year through «… درست است؟»; not «کدام روز؟»
17. [time] <span dir="rtl">U: تا جمعه گزارش رو می‌فرستم</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday</span>  
   → «جمعه ⟨D0+2⟩ … درست است؟»; never «امروز خودش جمعه است»
18. [time] <span dir="rtl">U: تا جمعه گزارش رو می‌فرستم</span> — _context:_ <span dir="rtl">adult; clock on a Friday — the only place the C1 question is right</span>  
   → «همین امروز یا جمعهٔ بعد؟» once, with today and D0+7; nothing booked until she answers
19. [time] <span dir="rtl">[page: «📅 … فردا ⟨D0+1⟩ — درست است؟»] ‖ [clock → D0+2] ‖ U: آره</span> — _context:_ <span dir="rtl">adult; the ask lapsed when its day ended (C69)</span>  
   → not booked; the lapsed ask is closed and never re-asked with a shifted or next-year date
20. [time] <span dir="rtl">U: ۸ ماهه دارم پس‌انداز می‌کنم</span> — _context:_ <span dir="rtl">adult; elapsed time</span>  
   → no ask
21. [time] <span dir="rtl">[older reply: «📅 خریدِ کتاب ⟨D0+5⟩ — درست است؟»] ‖ [last reply: «می‌خوای یه مثال ببینی؟»] ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; the newest question under the page's last reply is not a date question (C49)</span>  
   → no date is booked from this «باشه»; the book ask is not booked by it

## R4.forecast · forecasts 🎯 (F4; the new forecast fixer). One 🎯 per future outcome with a stated confidence: «N درصد» with مطمئن / احتمال / فکر کنم / می‌دم / شانس anywhere in the clause; a bare «N درصد.» answering the page's «چند درصد؟»; a bare number answering a question about a NAMED outcome makes that outcome's 🎯 (C76); «تقریباً / خیلی مطمئنم» without a number ⇒ the page asks the number once; a new number for the same outcome updates that 🎯 with history (C77); «A … N٪ و B … M٪» makes two 🎯, each with its own text; the 🎯 text strips the counter and the lead words — C90 (C53, C37). A 🎯 is settled only by a sentence reporting THAT outcome; numeric outcomes are judged by the numbers; a correction, a past confidence, a complaint, a remark about the page or an unrelated sentence never settles and never asks «شد یا نشد؟»; several candidates ⇒ «کدام؟»; a settled 🎯 leaves the open list in EVERY view — C91. Someone else's confidence is «کارِ دیگری», never her 🎯 — C75. Numbers in words and Latin digits count. pos = the 🎯 behaviour stated; neg = a look-alike that must not create, settle, update or ask.


### Positive

1. [events] <span dir="rtl">U: فکر کنم ۷۰ درصد مدیرم با مرخصیم موافقت می‌کنه</span> — _context:_ <span dir="rtl">adult; «فکر کنم» before the number (A28-18, C28-15: no 🎯, coached as a guess)</span>  
   → one 🎯 at 70 with the text «مدیرم با مرخصیم موافقت می‌کنه» (lead words stripped); never «همین پیام حدس است»
2. [events] <span dir="rtl">U: ۶۵ درصد شانس دارم تو مسابقه‌ی شطرنج سوم بشم</span> — _context:_ <span dir="rtl">teen 15; «شانس»</span>  
   → one 🎯 at 65: «تو مسابقه‌ی شطرنج سوم بشم»
3. [events] <span dir="rtl">U: به این که تا پنجشنبه جوابِ آزمایش بیاد ۸۰ درصد می‌دم</span> — _context:_ <span dir="rtl">adult; «می‌دم» at the end of the clause</span>  
   → one 🎯 at 80: «تا پنجشنبه جوابِ آزمایش بیاد»; no date ask is raised by the weekday inside the forecast (R3)
4. [events] <span dir="rtl">U: احتمالش ۳۰ درصده که این ترم مشروط بشم</span> — _context:_ <span dir="rtl">teen 17; a negative outcome</span>  
   → one 🎯 at 30 for «این ترم مشروط بشم» — the outcome as she stated it, not inverted
5. [events] <span dir="rtl">U: هفتاد درصد مطمئنم که سه تا مقاله رو تا جمعه می‌فرستم</span> — _context:_ <span dir="rtl">adult; number in words; a counter inside the outcome (A28-17: «(۷۰٪)» and the lead word stayed in the text)</span>  
   → one 🎯 at 70; text «سه تا مقاله رو تا جمعه می‌فرستم» — never «(۷۰٪)» or «هفتاد درصد مطمئنم که» inside the text
6. [events] <span dir="rtl">U: 90% مطمئنم کلید رو پیدا می‌کنم</span> — _context:_ <span dir="rtl">adult; Latin digits and «%»</span>  
   → one 🎯 at 90: «کلید رو پیدا می‌کنم»
7. [events] <span dir="rtl">U: تقریباً مطمئنم که فردا جلسه کنسل میشه</span> — _context:_ <span dir="rtl">adult; vague confidence (A28-19, C28-25, D28-23: the number was never asked)</span>  
   → no 🎯 yet; the page asks her number once («چند درصد؟»); it does not ask again in the next reply
8. [events] <span dir="rtl">U: خیلی مطمئنم پروژه رو تحویل می‌گیرن ‖ [page: «چند درصد؟»] ‖ U: ۸۵ درصد.</span> — _context:_ <span dir="rtl">adult; the bare answer to the page's own question (D28-25: a bare «۶۰ درصد.» made no 🎯)</span>  
   → one 🎯 at 85: «پروژه رو تحویل می‌گیرن»
9. [events] <span dir="rtl">[coach: «چقدر مطمئنی که تا جمعه دیوار رو رنگ کنی؟»] ‖ U: ۶۰</span> — _context:_ <span dir="rtl">adult; a bare number answering a question about a named outcome (C76; dB1: «۶۵ درصد» made none)</span>  
   → one 🎯 at 60: «تا جمعه دیوار رو رنگ کنم»
10. [events] <span dir="rtl">[🎯 open: «نمایشگاه رو تا آخرِ هفته تموم کنم» (۷۰)] ‖ U: نمایشگاه رو حالا ۵۰ درصد مطمئنم، نه ۷۰</span> — _context:_ <span dir="rtl">adult (C77; A28-21, C28-17, B28·D4: a second 🎯)</span>  
   → the same 🎯 now 50 with «اصلاح شد ⇐ ۷۰» as history; no second 🎯; the mind card counts one forecast
11. [events] <span dir="rtl">[🎯 open: «اثاث تا شنبه جمع بشه» (۷۰); an old date ask for it pending] ‖ U: اثاث تا شنبه رو ۵۰ درصد می‌دم</span> — _context:_ <span dir="rtl">adult (D28-24: no update, and the old date ask was booked instead)</span>  
   → the 🎯 is updated to 50 with history; the message does not book the pending date ask
12. [events] <span dir="rtl">U: ۸۰ درصد مطمئنم بارکش سرِ وقت میاد و ۶۰ درصد مطمئنم هیچ ظرفی نمی‌شکنه</span> — _context:_ <span dir="rtl">adult, moving house (D28-26: one 🎯 with both texts, the 60 lost)</span>  
   → two 🎯: «بارکش سرِ وقت میاد» at 80 and «هیچ ظرفی نمی‌شکنه» at 60, each with its own text
13. [events] <span dir="rtl">U: احتمالِ قبولی تو دانشگاهِ اول ۷۰٪ و تو دومی ۹۵٪ ـه</span> — _context:_ <span dir="rtl">teen 17; «A … N٪ و B … M٪» (C90)</span>  
   → two 🎯: «قبولی تو دانشگاهِ اول» at 70 and «قبولی تو دانشگاهِ دوم» at 95 (or her words for each); never one 🎯, never empty text (C28-24)
14. [events] <span dir="rtl">U: پنجاه‌پنجاه‌ه که تیم‌مون بره فینال</span> — _context:_ <span dir="rtl">teen 13; «پنجاه‌پنجاه» (C37)</span>  
   → one 🎯 at 50: «تیم‌مون بره فینال»
15. [events] <span dir="rtl">[🎯 open: «حداقل ۵ تا مشتری جدید بگیرم» (۶۰)] ‖ U: شد ۳ تا</span> — _context:_ <span dir="rtl">adult; a numeric outcome below the threshold (A28-24, bank #78: «شد یا نشد؟» asked)</span>  
   → settled «نشد» (3 < 5) from her sentence; no «شد یا نشد؟»
16. [events] <span dir="rtl">[🎯 open: «نمره‌م بالای ۱۶ بشه» (۷۵)] ‖ U: ۱۷ و نیم شدم!</span> — _context:_ <span dir="rtl">teen 16; a numeric outcome above the threshold</span>  
   → settled «شد» (17.5 > 16); no question
17. [events] <span dir="rtl">[🎯 open: «کلِ هفته ۲ تا باگ بیشتر پیدا نشه» (۷۰)] ‖ U: پیش‌بینیم ۲ بود، شد ۴</span> — _context:_ <span dir="rtl">adult, software tester (D28-8: «شد ۳» read as «came true»)</span>  
   → settled «نشد» (4 > 2); never «شد — به گفتهٔ خودت»; calibration counts a miss
18. [events] <span dir="rtl">[🎯 open: «حدودِ ۸ درصد سود کنم» (۶۰)] ‖ U: ۱۵ درصد سود کردم — خیلی بیشتر از پیش‌بینیم</span> — _context:_ <span dir="rtl">adult (D28-2: a clear numeric outcome was not settled)</span>  
   → settled «نشد» (15 is far from «حدودِ ۸»); no «شد یا نشد؟», no lapse «چیزی داوری نشد»
19. [events] <span dir="rtl">[🎯 open: «امتحانِ شیمی بالای ۱۷ بشم» (۹۰)] ‖ U: شیمی رو ۱۸ شدم، همون‌طور که با ۹۰ درصد گفته بودم</span> — _context:_ <span dir="rtl">teen 17; the outcome report quotes the old confidence (A28-25, bank #92)</span>  
   → settled «شد»; the quoted «۹۰ درصد» makes no new 🎯 and no update
20. [events] <span dir="rtl">[four 🎯 open, three of them at 70] ‖ U: یکی از ۷۰ درصدی‌هام درست شد</span> — _context:_ <span dir="rtl">adult (A28-26: no «کدام؟»)</span>  
   → the page asks «کدام؟» listing only the 70 ones; nothing is settled until she answers
21. [events] <span dir="rtl">[🎯 «۲۳ کارتن کافیه» (۷۰) and «۲۲ کارتن کافیه» (۴۰) open] ‖ U: شد. پیش‌بینیِ ۲۳ کارتن درست درومد، ۲۲ تا غلط بود</span> — _context:_ <span dir="rtl">adult (B28·D2: «۲۳» settled «نشد» although it came true)</span>  
   → «۲۳ کارتن کافیه» ⇐ شد and «۲۲ کارتن کافیه» ⇐ نشد; neither inverted; no «کدام؟»
22. [page] <span dir="rtl">[🎯 «جلسه رو جابه‌جا کنن» settled «⇐ شد»] ‖ [open «🎯 دفترِ پیش‌بینی»]</span> — _context:_ <span dir="rtl">adult; view state after settling (A28-35; C101)</span>  
   → PAGE-LEVEL: in «🎯 دفترِ پیش‌بینی» the 🎯 is listed as settled («شد»), has no «شد / نشد» buttons and is not in the open list; the same holds in the dossier, «امروز» and the mind card
23. [events] <span dir="rtl">U: داداشم ۹۰ درصد مطمئنه ۲۳ تا بسه، من ۷۰ درصد</span> — _context:_ <span dir="rtl">adult; her own confidence beside her brother's (B28·D3: stored at 90)</span>  
   → her 🎯 «۲۳ تا بسه» at 70; the brother's 90 is «کارِ دیگری» (C75) and never her number
24. [events] <span dir="rtl">[🎯 open: «جواب‌ها تا پنجشنبه بیاد» (۸۰)] ‖ U: جواب‌ها چهارشنبه اومد</span> — _context:_ <span dir="rtl">adult; an outcome sentence without «شد»</span>  
   → settled «شد» from her report; no question
25. [events] <span dir="rtl">[🎯 open: «جواب‌ها تا پنجشنبه بیاد» (۸۰)] ‖ U: جواب‌ها چهارشنبه اومد ‖ [clock → D0+2]</span> — _context:_ <span dir="rtl">adult; after settling (C91 «a settled 🎯 leaves the open list»)</span>  
   → no later «شد یا نشد؟» for this 🎯, in chat or «امروز»
26. [events] <span dir="rtl">U: احتمال می‌دم ۴۰ درصد که دخترم کلاسِ پیانو رو ادامه بده</span> — _context:_ <span dir="rtl">adult; «احتمال می‌دم … درصد» — her own confidence about another person's future act</span>  
   → one 🎯 at 40 (it is HER confidence; C75 is about another person's confidence)

### Negative (look-alike)

1. [events] <span dir="rtl">U: مربی گفت ۸۰ درصد می‌بریم</span> — _context:_ <span dir="rtl">teen 15; someone else's confidence (C75)</span>  
   → no 🎯 of hers; filed as «کارِ دیگری»
2. [events] <span dir="rtl">U: یه اشتباه کردم: اولش گفتم هر بسته ۲۰۰ گرمه، ۲۵۰ ـه</span> — _context:_ <span dir="rtl">adult; a datum correction while a 🎯 is open (D28-9)</span>  
   → no «🎯 … شد یا نشد؟»; no 🎯 is settled or touched
3. [events] <span dir="rtl">U: پارسال ۹۰ درصد مطمئن بودم قبول میشم و نشد</span> — _context:_ <span dir="rtl">adult; a past confidence while unrelated 🎯 are open (A28-20, C28-16, B28·D3)</span>  
   → no new 🎯; no «شد یا نشد؟» on any open 🎯
4. [events] <span dir="rtl">U: دیدم، الان درست شد</span> — _context:_ <span dir="rtl">adult; about the page, while a 🎯 «شام تا جمعه آماده بشه» is open (B28·D2)</span>  
   → no 🎯 is settled; no question
5. [events] <span dir="rtl">U: یه چیز قدیمی رو هم اصلاح کنم: اون شب مهمونی ساعت ۸ بود نه ۹</span> — _context:_ <span dir="rtl">adult; an unrelated correction while a 🎯 is open (B28·D2)</span>  
   → no 🎯 settled; no «شد یا نشد؟»
6. [events] <span dir="rtl">[🎯 open: «مسئله رو تا فردا حل کنم» and «نمره‌ی بالای ۱۵»] ‖ U: حل شد</span> — _context:_ <span dir="rtl">adult; «حل شد» (C53)</span>  
   → settles only the 🎯 about solving; the grade 🎯 stays open
7. [events] <span dir="rtl">[🎯 open: «حصار تا آخرِ آبان تموم بشه»] ‖ [page: «کدام پیش‌بینی؟»] ‖ U: قسطِ آخرِ حصار رو سرِ برج میدم</span> — _context:_ <span dir="rtl">adult; a shared word only (D28-3)</span>  
   → no 🎯 settled; the word «حصار» alone is not an outcome report
8. [events] <span dir="rtl">U: ۷۰ درصدِ کلاس قبول شدن</span> — _context:_ <span dir="rtl">teacher; a statistic about the past</span>  
   → no 🎯
9. [events] <span dir="rtl">U: این کفش ۳۰ درصد تخفیف داره</span> — _context:_ <span dir="rtl">adult; a percentage that is not a confidence</span>  
   → no 🎯
10. [events] <span dir="rtl">U: ۲۰٪ × ۳۰۰ = ۶۰</span> — _context:_ <span dir="rtl">adult; a percentage inside arithmetic</span>  
   → no 🎯 (R1 checks the line: OK)
11. [events] <span dir="rtl">U: چرا هنوز ازم نپرسیدی پیش‌بینی‌م چی شد؟</span> — _context:_ <span dir="rtl">adult; a complaint, no outcome (oB1 c29)</span>  
   → no 🎯 settled; no «شد یا نشد؟» raised by this sentence
12. [events] <span dir="rtl">[🎯 open: «پروژه تا جمعه تموم بشه» (۷۰)] ‖ U: ۷۰ درصد هم مطمئنم که مشتری راضی میشه</span> — _context:_ <span dir="rtl">adult; a different outcome with the same number (look-alike of C77)</span>  
   → a second, separate 🎯 «مشتری راضی میشه» at 70; the first 🎯 is not updated
13. [events] <span dir="rtl">[🎯 open: «پروژه تا جمعه تموم بشه» (۷۰)] ‖ U: پروژه تا جمعه تموم میشه، ۷۰ درصد مطمئنم</span> — _context:_ <span dir="rtl">adult; the same forecast repeated with the same number</span>  
   → no second 🎯 and no history line (nothing changed)
14. [events] <span dir="rtl">[🎯 open: «حداقل ۵ تا مشتری جدید بگیرم»] ‖ U: امروز ۳ تا تماس داشتم</span> — _context:_ <span dir="rtl">adult; a number about another quantity, before the outcome is known</span>  
   → not settled; no «شد یا نشد؟» (calls are not clients)
15. [events] <span dir="rtl">[no 🎯 open; coach: «چند درصد مطمئنی؟» with no outcome named] ‖ U: ۶۰</span> — _context:_ <span dir="rtl">adult (C76 second half)</span>  
   → no 🎯 is made blindly; the page asks which outcome she means
16. [events] <span dir="rtl">U: خاله‌م گفت احتمالش ۵۰ درصده که بارون بیاد</span> — _context:_ <span dir="rtl">elder 64, register «شما»; another person's «احتمالش … درصده»</span>  
   → no 🎯 of hers (C75)

## R5.filing_story · multi-problem filing, 📜 and history (F3 S1 A28-5 first, F9, F10, F11 with prior). A ✓/✗/؟ in 📜 is computed from the line's CURRENT text; when she fixes a line (✏️ or a correction), the old mark moves into that line's history and the dossier counts follow the new mark — C86. «کارِ دیگری» only when another person is the doer of the calculation or claim («داداشم حساب کرد / کرد: …»); the source of a datum («فروشنده گفت ۱۲٪», «استادم میگه …») is a datum of HER problem with a source label; her own sentence that mentions a helper stays hers; a number of the coach or the page she repeats as her own is hers — C96, C57, C79, C75. Every line under a problem in 📜 (including «کارِ تو» lines), every 🎯 and every ledger step offers «↪»; the destination shows the moved line with its undo «↩»; moving a line moves its record (step, result, 🎯); the history label is «جابه‌جا شد», stamped with the PAGE clock — C95, C78. A problem she calls separate («جدا», «یه مسئلهٔ دیگه») or a statement with its own unknown gets its own record and ledger — C97. Calculations the model did not report still reach 📜 from her own text, with the page's mark; a side problem never receives the main problem's lines; a datum sentence lands in its problem's 📜. Base session — «نشستِ دوپرونده‌ایِ ۲۸» (adult, one chat): problem P «قفسه‌های کتابخونه» (registered first), problem Q «کفِ انباری» (registered second, live), a practice dossier «تمرینِ پیاده‌رویِ صبح» open. PAGE-LEVEL (C101) applies to every entry that names 📜, a button or a view: the harness opens the dossier and checks the DOM, not the function. pos = the line / mark / button must be where stated; neg = a look-alike that must not move, relabel or remark.


### Positive

1. [page] <span dir="rtl">U: قسطِ ماهانه: ۲۵ میلیون × ۱۲ = ۳۰۰ هزار ‖ [page: ✗ «… نمی‌خواند»] ‖ ✏️ «۳۰۰ هزار» ⇒ «۳۰۰ میلیون»</span> — _context:_ <span dir="rtl">adult, a yearly cost; S1 family (A28-5: her fixed line kept the stale ✗ in 📜)</span>  
   → PAGE-LEVEL: in 📜 the line reads «۲۵ میلیون × ۱۲ = ۳۰۰ میلیون» with ✓ beside it (25 M × 12 = 300 M); the old ✗ appears only inside that line's history; never ✗ «نمی‌خواند» beside the corrected text, in «داده» or in «نتیجه»
2. [page] <span dir="rtl">U: کرایه‌ی ۱۸ ماه: ۱۵ میلیون × ۱۸ = ۲۷۰ هزار ‖ [page: ✗] ‖ U: ببخشید، ۲۷۰ هزار نه، ۲۷۰ میلیون</span> — _context:_ <span dir="rtl">adult; S1 family; the fix arrives as a correction message instead of ✏️</span>  
   → PAGE-LEVEL: the 📜 line shows the corrected text «… = ۲۷۰ میلیون» with ✓ (15 M × 18 = 270 M); the earlier ✗ sits in its history only; the result line is never marked ✗
3. [page] <span dir="rtl">U: هر نفر: ۱۰۰ ÷ ۸ = ۱۳ ‖ [page: ؟ (12.5)] ‖ ✏️ «۱۳» ⇒ «۱۲٫۵»</span> — _context:_ <span dir="rtl">adult; S1 family with a «؟» mark</span>  
   → PAGE-LEVEL: the 📜 line shows ✓ beside «۱۰۰ ÷ ۸ = ۱۲٫۵»; the old «؟» moves into history; no open rounding question remains for this line
4. [page] <span dir="rtl">U: ۶ × ۷ = ۴۲ ‖ [page: ✓] ‖ ✏️ «۴۲» ⇒ «۴۸»</span> — _context:_ <span dir="rtl">teen 14; S1 family in the other direction: a right line edited into a wrong one</span>  
   → PAGE-LEVEL: the 📜 line now shows ✗ (6 × 7 = 42 ≠ 48); the old ✓ is in history; the mark always follows the current text
5. [events] <span dir="rtl">U: هزینه‌ی سالانه: ۴ میلیون × ۱۲ = ۴۸ هزار ‖ [page: ✗] ‖ ✏️ «۴۸ هزار» ⇒ «۴۸ میلیون» ‖ [open the dossier / mind card]</span> — _context:_ <span dir="rtl">adult; S1 family: the counts behind 📜</span>  
   → the dossier no longer says «در کارنامه شمرده نشد · چرا: ✗» for this line; it is counted as a correct line of hers (4 M × 12 = 48 M), with the earlier ✗ visible only in history
6. [page] <span dir="rtl">U: کفِ انباری ۶ متر در ۴ متر = ۲۴ مترمربع ‖ [page: ✓] ‖ U: ببخشید عرضش ۴ نیست، ۵ ـه ‖ ✏️ her line ⇒ «۶ متر در ۵ متر = ۳۰ مترمربع»</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», problem Q; S1 family: after a correction and her redo, the line is right again</span>  
   → PAGE-LEVEL: Q's 📜 shows ✓ beside «۶ متر در ۵ متر = ۳۰ مترمربع»; the history shows the old text and its old mark; no stale mark remains on the redone line
7. [page] <span dir="rtl">U: داداشم حساب کرد: ۶ × ۲۵۰ = ۱۴۰۰</span> — _context:_ <span dir="rtl">adult; another person is the doer of a calculation (C57/C96)</span>  
   → filed as «کارِ دیگری — [نامِ شخص]» (or «— از زبانِ داداشت»): checked and shown ✗ (6 × 250 = 1500), but never booked as her ✗, her step or her result
8. [page] <span dir="rtl">U: داداشم یه حسابِ دیگه هم کرد: ۳ × ۱۵۰ = ۴۵۰</span> — _context:_ <span dir="rtl">adult; «یه حسابِ دیگه هم کرد:» (C28-8: filed as her own ✗ line)</span>  
   → «کارِ دیگری», shown ✓ (3 × 150 = 450); not counted as her work
9. [page] <span dir="rtl">U: خاله‌م حساب کرد که ۱۲ × ۱۲ = ۱۴۴ ـه</span> — _context:_ <span dir="rtl">elder 67, register «شما»; «حساب کرد که …»</span>  
   → «کارِ دیگری», ✓ shown; not her result
10. [page] <span dir="rtl">U: فروشنده گفت ۹ درصد تخفیف می‌ده</span> — _context:_ <span dir="rtl">adult, problem Q live; the source of a datum (C96; D28-11 filed it as «کارِ دیگری»)</span>  
   → a datum of Q with a source label (e.g. «به گفتهٔ فروشنده»); never «کارِ دیگری — از زبانِ فروشنده»; a later «۹ نه، ۱۱ درصد» works as a datum correction (R2)
11. [page] <span dir="rtl">U: استادم میگه «یه طرح بده»… ببین، ضریب رو ۰٫۶ گذاشتم و زمان رو ۱۲ میلی‌ثانیه</span> — _context:_ <span dir="rtl">graduate student; her own parameter work with one quoted sentence of her professor (B28·D12)</span>  
   → her own work: filed as her line in the live problem, never «کارِ دیگری — نه نتیجهٔ تو»; the professor's quoted sentence stays inside her text byte-exact
12. [page] <span dir="rtl">U: بابام کمکم کرد جدول رو کشیدم. ۴ × ۹ = ۳۶</span> — _context:_ <span dir="rtl">child 9; her own sentence mentioning a helper (A28-29: «کارِ دیگری — از زبانِ مامانم»)</span>  
   → her line with ✓; never «کارِ دیگری»
13. [page] <span dir="rtl">U: داداشم حساب کرد: ۳ × ۴۰۰ = ۱۲۰۰ هزار</span> — _context:_ <span dir="rtl">child 10 (A28-30: the brother's work was neither in 📜 nor labelled)</span>  
   → PAGE-LEVEL: the line appears in 📜 under the live problem with the «کارِ دیگری» label and ✓ (3 × 400 = 1200); it is not missing
14. [page] <span dir="rtl">[open P's 📜, which holds a line that belongs to Q]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; the move control (A28-33: 0 `.lp-dmv` in the DOM; C95)</span>  
   → PAGE-LEVEL: the misfiled line offers «↪ این سطر مالِ مسئلهٔ …»; the DOM has the move control on that line and on every other line under P, including «کارِ تو» lines
15. [page] <span dir="rtl">[open the dossier of Q; Q has an open 🎯 «کفِ انباری تا جمعه کاشی بشه»]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; a 🎯 offers «↪» (C95)</span>  
   → PAGE-LEVEL: the 🎯 row has a move control; moving it to P moves the 🎯 itself (C78)
16. [page] <span dir="rtl">[Q has a prior ledger; open Q's ledger]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; a ledger step offers «↪» (C95)</span>  
   → PAGE-LEVEL: each ledger step has a move control; moving a step moves the step record and P's ledger shows it
17. [page] <span dir="rtl">[P's 📜] ‖ [click «↪» on the line «کفِ انباری ۶ متر در ۵ متر = ۳۰ مترمربع», choose Q]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; destination and undo (B28·D11: no copy in the destination, no ↩; C28-23, D28-18: real clock, «اصلاح شد ⇐ «—» →»)</span>  
   → PAGE-LEVEL: Q's 📜 shows the moved line with its ✓ and a «↩» undo; P keeps one history line «جابه‌جا شد ⇒ Q» stamped with the page clock (D0), never the real clock, never labelled «اصلاح شد ⇐ «—» →»; the line is not duplicated as current in P
18. [page] <span dir="rtl">[after the move above] ‖ [click «↩» in Q]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; undo</span>  
   → PAGE-LEVEL: the line is back in P; both moves stay in history («جابه‌جا شد», «برگشت»), each with the page clock; Q no longer lists it as current
19. [page] <span dir="rtl">[after moving a line to Q] ‖ [open Q's dossier]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸» (B28·D11: opening the floor dossier showed the shelves dossier)</span>  
   → PAGE-LEVEL: Q's own dossier opens (its title, its ledger, its 📜), never P's
20. [page] <span dir="rtl">U: یه مسئله‌ی جدا: یه مخزنِ ۲۴۰ لیتری با شیرِ دقیقه‌ای ۸ لیتر چقدر طول می‌کشه پر بشه؟</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», Q live; a separate problem (C97)</span>  
   → a third record with its own 📜 from this statement; its later arithmetic (240 ÷ 8 = 30) is filed there, never in P or Q
21. [page] <span dir="rtl">U: به همین انباری ربط داره ولی جداست: درِ انباری قفل نمیشه و باید یه قفلِ تازه بخرم که با کلیدِ قبلی جور باشه</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», Q closed earlier (B28·D10: bound to the closed problem as a look-back note)</span>  
   → a new record of its own, registered; never «مسئلهٔ زنده ساخته نشد»; Q stays closed and does not receive it
22. [page] <span dir="rtl">U: من حساب کردم: ۱۸ × ۱٫۲۵ = ۲۲٫۵ و بعدش ۲۲٫۵ ÷ ۳ = ۷٫۵</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», Q live; the model's report omits these (A28-12)</span>  
   → PAGE-LEVEL: both lines reach Q's 📜 from her own text with the page's ✓ beside each (18 × 1.25 = 22.5, 22.5 ÷ 3 = 7.5)
23. [page] <span dir="rtl">[P live; a side problem «اگه قفسه‌ها ۵ طبقه باشن چی؟» registered earlier] ‖ U: برنامه‌ی P رو عوض کنم: اول طبقه‌ها، بعد رنگ</span> — _context:_ <span dir="rtl">adult; a plan correction of the main problem (A28-13: also filed under the side problem)</span>  
   → PAGE-LEVEL: the correction appears in P's 📜 only; the side problem's 📜 does not get it
24. [page] <span dir="rtl">[puzzle «۷ و ۱۱» live; she invents a puzzle «۵ و ۹» from it] ‖ U: ۹ − ۵ = ۴ و ۹ + ۴ = ۱۳</span> — _context:_ <span dir="rtl">adult; an invented puzzle's result (A28-27: also under the parent)</span>  
   → PAGE-LEVEL: the result lines sit under «۵ و ۹» only, with ✓ (9 − 5 = 4, 9 + 4 = 13)
25. [page] <span dir="rtl">U: هزینه‌ی جمع کردنِ موکتِ قدیمیِ انباری هم ۴۰۰ هزار تومنه</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», Q live; a datum sentence (D28-17: in no problem's 📜)</span>  
   → PAGE-LEVEL: the sentence lands in Q's 📜 as a datum; it is not lost
26. [page] <span dir="rtl">U: −۳۵/۵ = −۷ و بعد ۱ + ۰٫۳ = ۱٫۳</span> — _context:_ <span dir="rtl">teen 16; «کارِ تو» lines (B28·D16: no page mark beside them)</span>  
   → PAGE-LEVEL: each «کارِ تو» line in 📜 carries the page's mark: ✓ for −35/5 = −7 and ✓ for 1 + 0.3 = 1.3

### Negative (look-alike)

1. [page] <span dir="rtl">U: ۶ × ۸ = ۴۶ ‖ [page: ✗] ‖ ✏️ in another line «۳ × ۳ = ۹» ⇒ «۳ × ۳ = ۹ تا»</span> — _context:_ <span dir="rtl">adult; S1 family look-alike: an unrelated edit elsewhere</span>  
   → «۶ × ۸ = ۴۶» keeps its ✗ (6 × 8 = 48); the edited line keeps ✓; no mark moves to history for the unfixed line
2. [page] <span dir="rtl">U: ۲۵ میلیون × ۱۲ = ۳۰۰ میلیون ‖ [page: ✓] ‖ ✏️ «۲۵ میلیون × ۱۲» ⇒ «۲۵ میلیون ضربدر ۱۲»</span> — _context:_ <span dir="rtl">adult; S1 family look-alike: wording changes, the arithmetic does not</span>  
   → the line keeps ✓; no false ✗ appears; history records the text change only
3. [page] <span dir="rtl">U: ۸ × ۱۵ = ۱۱۰ ‖ [page: ✗] ‖ U: نه، درسته، مطمئنم</span> — _context:_ <span dir="rtl">adult; S1 family look-alike: a contest, not a fix</span>  
   → the ✗ stays beside the unchanged line (8 × 15 = 120, C29); nothing moves into history as «fixed»
4. [page] <span dir="rtl">U: فروشنده حساب کرد: ۳ × ۴۵۰ = ۱۳۰۰</span> — _context:_ <span dir="rtl">adult; the seller IS the doer of a calculation (look-alike of the «فروشنده گفت» datum)</span>  
   → «کارِ دیگری», shown ✗ (3 × 450 = 1350); not her line, not a datum of hers
5. [page] <span dir="rtl">U: خودم حساب کردم، داداشم فقط نگاه کرد: ۸ × ۱۲ = ۹۶</span> — _context:_ <span dir="rtl">adult; she is the doer</span>  
   → her own line ✓; never «کارِ دیگری»
6. [page] <span dir="rtl">[coach: «یعنی ۴۸ قوطی؟»] ‖ U: آره همون ۴۸ که گفتی درسته</span> — _context:_ <span dir="rtl">adult; repeating the coach's number as her own (C79)</span>  
   → hers; never «کارِ دیگری»
7. [page] <span dir="rtl">U: مربی گفت ۷۰ درصد می‌بریم</span> — _context:_ <span dir="rtl">teen 15 (C75)</span>  
   → «کارِ دیگری»; no 🎯 of hers; not a datum of her problem
8. [page] <span dir="rtl">U: یه مسئله‌ی دیگه هم مثلِ همین داشتم، ولی ولش کن</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; an analogy with no statement (C31)</span>  
   → no new record
9. [page] <span dir="rtl">U: این دکمه‌ی ↪ چیکار می‌کنه؟</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; a question about the page</span>  
   → no problem record; nothing filed as a problem line (R7 handles the answer)
10. [page] <span dir="rtl">U: صورتِ مسئله رو دوباره بگم: قفسه‌ها ۸۰ سانتی‌ان و ۵ تا طبقه دارن</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», P live; a restated problem</span>  
   → no new record; filed in P
11. [page] <span dir="rtl">U: امروز ۴۰ دقیقه پیاده رفتم</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; a practice report</span>  
   → filed in the practice dossier «تمرینِ پیاده‌رویِ صبح»; not a problem, not in P or Q
12. [page] <span dir="rtl">[P's 📜 after moving one line to Q]</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸»; the source after a move</span>  
   → PAGE-LEVEL: P shows only the history line «جابه‌جا شد ⇒ Q», not the moved line as current; P's counts no longer include it
13. [page] <span dir="rtl">U: با کمکِ معلمم فهمیدم چرا ضرب می‌کنیم</span> — _context:_ <span dir="rtl">teen 13; a helper mentioned, no calculation</span>  
   → her own line; no «کارِ دیگری»
14. [page] <span dir="rtl">U: مامانم گفت برنج ۲ کیلوئه</span> — _context:_ <span dir="rtl">adult; another person gives a datum (C96)</span>  
   → a datum of her problem with a source label; not «کارِ دیگری»; no arithmetic line
15. [page] <span dir="rtl">U: قفسه‌ها: ۵ × ۸۰ = ۴۰۰ سانت</span> — _context:_ <span dir="rtl">«نشستِ دوپرونده‌ایِ ۲۸», P live and named by its content</span>  
   → filed in P only; Q and the side problems do not get it

## R6.prior_work · prior work, «کارِ پیشینِ من» (F11 with story, F12; roadmap §21). A worked step at the OPENING — even one relation with a computed value, or a decision with its reason — fires the prior block — C7/C56; a bare question about a calculation («… بود دیگه؟», «… دیگه، نه؟») never opens prior work, at an opening or mid-chat — C98; a NEW problem (her own unknown, «یه مسئلهٔ دیگه», a new day's question) gets its own record and ledger and never extends another ledger, open or closed — C97 (D28-6 regression); a later report about the SAME problem merges into its ledger, before or after closure — C56; her fix of a ledger step lands when the page's own check agrees (C8), the fixed step drops its stale reason (C27-21) and the resume point moves; a hypothetical («اگه … بود چی؟», «اگه … غلط باشه چی؟») is neither a dispute nor a correction and raises no retract block, but a fact stated in the same message is a correction — C46/C74; a dispute is re-checked by recomputation, at most one dispute question — C6/C29; re-typing a ✗ line without objection is not a dispute; accepting a proposal works in the ledger — C87. Base problem — «مسئلهٔ تانکر» (adult, watering a garden), opening ledger: گام ۱ «باغ ۲ هکتاره، یعنی ۲۰۰۰۰ مترمربع» ✓ · گام ۲ «هر مترمربع روزی ۵ لیتر: ۲۰۰۰۰ × ۵ = ۱۰۰۰۰۰ لیتر» ✓ · گام ۳ «تانکرِ ۸۰۰۰ لیتری: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۵ بار» ✗ (12.5) · گام ۴ «هر بار ۲۰۰ هزار: ۱۵ × ۲۰۰ = ۳۰۰۰ هزار» dependent on گام ۳; resume point گام ۳. pos = the ledger must behave as stated; neg = a look-alike that must not open, extend or change it.


### Positive

1. [chat] <span dir="rtl">U: ۳۶ نفر مهمون داریم و میزها ۴ نفره‌ان؛ من حساب کردم ۳۶ ÷ ۴ = ۹ میز. ولی ۲ نفر ویلچر دارن و هر کدوم جای ۲ نفر رو می‌گیرن، حالا چند میز لازمه؟</span> — _context:_ <span dir="rtl">adult; an opening with ONE worked relation (C56; confusable with the C98 bare question)</span>  
   → the prior block fires: گام ۱ «۳۶ ÷ ۴ = ۹» ✓; the resume point is the wheelchair part; the 9 is not asked again
2. [chat] <span dir="rtl">[«مسئلهٔ تانکر» closed on D0] ‖ [clock → D0+2] ‖ U: امروز معلم یه سؤال داد: ماشین ۷۲ کیلومتر در ساعت میره؛ من حساب کردم ۷۲۰۰۰ ÷ ۳۶۰۰ = ۲۰ متر بر ثانیه، پس تو ۱۰ ثانیه ۲۰۰ متر میره</span> — _context:_ <span dir="rtl">teen 15; a new day's opening of a NEW problem with her own steps (D28-6 regression: merged as «گامِ ۳ و ۴ افزوده شد» into the closed problem)</span>  
   → a new record with its own ledger: «۷۲۰۰۰ ÷ ۳۶۰۰ = ۲۰» ✓ and «۲۰ × ۱۰ = ۲۰۰» ✓ (the second as her relation); the tanker ledger keeps exactly its four steps and stays closed; never «گامِ ۵ … افزوده شد»
3. [chat] <span dir="rtl">[«مسئلهٔ تانکر» live] ‖ U: یه مسئله‌ی دیگه: استخرِ ۴۸ مترمکعبی با پمپِ ساعتی ۶ مترمکعب؛ من حساب کردم ۴۸ ÷ ۶ = ۸ ساعت</span> — _context:_ <span dir="rtl">adult; «یه مسئلهٔ دیگه» while another problem is LIVE (C97)</span>  
   → its own record and ledger (۸ ✓); none of its steps is added to the tanker ledger; the tanker stays live in its own record
4. [chat] <span dir="rtl">U: تانکر رو درست کردم: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; her fix of گام ۳ (B28·D9 regression: the fix no longer landed)</span>  
   → گام ۳ becomes ✓ (her value equals the page's 12.5) with the old ✗ in history; the resume point moves to گام ۴; گام ۴ is marked dependent with the exact proposal 2500 هزار (12.5 × 200)
5. [page] <span dir="rtl">U: تانکر رو درست کردم: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار ‖ [open the ledger card / 📜]</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; the fixed step's old reason (C27-21)</span>  
   → PAGE-LEVEL: گام ۳ shows ✓ with no leftover reason («۱۵ نیست …», «نادرست») beside it; the reason survives only in its history
6. [chat] <span dir="rtl">U: تانکر: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۱ بار</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a fix that is still wrong (C8)</span>  
   → not applied as ✓: گام ۳ stays ✗ (12.5), the page shows its own computation and asks; the resume point stays at گام ۳; no proposal for گام ۴ built from 11
7. [chat] <span dir="rtl">[«مسئلهٔ تانکر» closed after گام ۴ was fixed to 2500] ‖ U: یه گامِ دیگه هم حساب کرده بودم: ۲۵۰۰ هزار تقسیم بر ۵ ماه = ۵۰۰ هزار در ماه</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a later report about the SAME problem after closure (C56; look-alike of D28-6)</span>  
   → merged as گام ۵ of the tanker ledger with ✓ (2500 ÷ 5 = 500); the closed problem's other steps keep their verdicts; no new record
8. [chat] <span dir="rtl">U: اگه تانکر ۱۰۰۰۰ لیتری بود چی؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a hypothetical (C46)</span>  
   → the ledger does not change (no step, verdict or resume point moves); the coach answers (10 bars); nothing is re-checked
9. [chat] <span dir="rtl">U: اگه روزی ۴ لیتر بود چی؟ آهان، اصلاً ۴ لیتر بوده، اشتباه نوشتم</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a hypothetical that turns into a fact (C74)</span>  
   → the fact is a correction 5 ⇒ 4: گام ۲ proposal 80000, گام ۳ 10, گام ۴ 2000 (exact chain, C89); the hypothetical part goes to the coach
10. [chat] <span dir="rtl">U: اگه گامِ ۲ غلط باشه چی؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a dispute word inside a conditional (C28-3)</span>  
   → no «# اصلاحِ پیامِ پیشین (شاید)» block, no retract candidates; گام ۲ stays ✓; the coach answers
11. [chat] <span dir="rtl">U: مطمئنی؟ به نظرم ۱۵ بار درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a dispute by meaning</span>  
   → one re-check by recomputation: ✗ stays (100000 ÷ 8000 = 12.5); the page says it re-checked once and points at the division without handing her the number (C29); the dispute question is not repeated in later turns (C6)
12. [chat] <span dir="rtl">U: کلش رو حساب کردم: ۱۲٫۵ بار، یعنی ۲۵۰۰ هزار تومن</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; she reports her result</span>  
   → the stage moves forward (to the look-back), not left at «اجرای طرح · طرح هنوز نیست»; گام ۳ and ۴ take her values with ✓
13. [prompt] <span dir="rtl">[after the opening ledger was read] ‖ [coach's next turn]</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; the resume question</span>  
   → the turn question is about گام ۳ (the first step that is not ✓); it never asks the garden's area or the litres per m², which she already reported
14. [page] <span dir="rtl">[open the tanker 📜 after the opening]</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; kinds in 📜</span>  
   → PAGE-LEVEL: ledger steps appear as prior-work steps with their verdicts (✓ ✓ ✗ «وابسته به گامِ ۳»); never labelled «برنامه»; the sticking point is never labelled «حدس»
15. [chat] <span dir="rtl">U: ۳ تا جعبه داریم، هر کدوم ۸ تا مداد، ۳ تا ۸ تا میشه ۲۴، ۵ تاش رو دادم به دوستم، بعدش نمی‌دونم چی کار کنم</span> — _context:_ <span dir="rtl">child 8, a half-solved word problem (roadmap §21)</span>  
   → prior block in child register: گام ۱ «۳ تا ۸ تا میشه ۲۴» ✓ (C41); the sticking point is the subtraction 24 − 5; the resume question is there; 24 is not asked again
16. [chat] <span dir="rtl">[the page said گام ۳ ✗] ‖ U: قبول ندارم ‖ [re-check: ✗ stays] ‖ [clock → D0+3] ‖ U: یه گامِ تازه: هر بار ۲۰۰ هزار، ۱۲٫۵ بار، پس ۲۵۰۰ هزار</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; owner-like persona (§20): disputes, leaves, returns days later with a new step</span>  
   → the new step merges into the same ledger with its own verdict ✓; the old dispute and re-check stay in history; no second record is made
17. [chat] <span dir="rtl">U: تانکر رو درست کردم: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار ‖ [proposal for گام ۴: «۳۰۰۰ ⇒ ۲۵۰۰»] ‖ U: آره، همون ۲۵۰۰ درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; C87 acceptance in the prior ledger (A28-16 pwA2: nothing happened)</span>  
   → گام ۴ is rewritten to «۱۲٫۵ × ۲۰۰ = ۲۵۰۰ هزار» with «اصلاح شد ⇐ ۳۰۰۰»; PAGE-LEVEL: the ledger card shows the new text
18. [route] <span dir="rtl">U: خودم حساب کردم ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۵ بار، ولی مطمئن نیستم؛ باغم ۲ هکتاره و …</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر» as an opening that starts with her lead-in (C28-5)</span>  
   → the problem's title names the problem (e.g. the number of tanker trips for the garden), never her lead-in «خودم حساب کردم …» or a worked clause
19. [events] <span dir="rtl">[after the opening ledger and her fix of گام ۳] ‖ [open the mind card]</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; credit (§21.6)</span>  
   → گام ۱ and ۲ (and the fixed ۳) are credited to her as her own correct work, never as «گیر»; the earlier ✗ of گام ۳ keeps its cause
20. [chat] <span dir="rtl">U: تصمیم گرفتم خونه‌ی نزدیک‌تر رو بگیرم، چون روزی ۲ ساعت رفت‌وآمدم کم میشه؛ اجاره‌ش ماهی ۳ میلیون بیشتره. معیاری جا نیفتاده؟</span> — _context:_ <span dir="rtl">adult; an opening with a decision already made with its reason (C7)</span>  
   → the prior block fires with the decision as a step and her reasons recorded; the resume point is the missing-criterion question
21. [chat] <span dir="rtl">U: باغ ۲ هکتاره، یعنی ۲۰۰۰۰ مترمربع. هر مترمربع روزی ۵ لیتر: ۲۰۰۰۰ × ۵ = ۱۰۰۰۰۰ لیتر. تانکرِ ۸۰۰۰ لیتری: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۵ بار. ریاضیم هم کلاً ضعیفه، از بچگی استعدادشو نداشتم</span> — _context:_ <span dir="rtl">adult; a multi-facet opening (§21.4): problem steps plus a belief about herself</span>  
   → the ledger as in the head (✓ ✓ ✗) AND a separate facet for the belief «استعداد ندارم», in an order the page states; the belief is not filed as a ledger step

### Negative (look-alike)

1. [chat] <span dir="rtl">U: ۷ × ۸ = ۵۶ بود دیگه؟</span> — _context:_ <span dir="rtl">adult; a bare question as the FIRST message (A28-37, C98)</span>  
   → no «# کارِ پیشینِ تو» block, no resume question; the coach answers; the reader may show ✓
2. [chat] <span dir="rtl">[«مسئلهٔ تانکر» live] ‖ U: یه سؤالِ کوچیک: ۹ × ۶ = ۵۴ بود دیگه؟</span> — _context:_ <span dir="rtl">adult; the bare question mid-chat (D28-30, C98)</span>  
   → no prior block; the tanker ledger and its resume point do not change
3. [chat] <span dir="rtl">U: ۱۲ × ۱۲ = ۱۴۴ دیگه، نه؟</span> — _context:_ <span dir="rtl">teen 13; another bare-question form</span>  
   → no prior block
4. [chat] <span dir="rtl">U: ۲۴۰ ÷ ۸ چند میشه؟</span> — _context:_ <span dir="rtl">adult; a question with no claimed value</span>  
   → no prior block; no arithmetic verdict on her (she claimed nothing)
5. [chat] <span dir="rtl">U: ۲ × ۳ = ۶ تا تخم‌مرغ خریدم برای کیک</span> — _context:_ <span dir="rtl">adult; small talk with a product</span>  
   → ✓ by the reader at most; never prior work
6. [chat] <span dir="rtl">U: باغم ۲ هکتاره و هر مترمربع روزی ۵ لیتر آب می‌خواد، تانکر ۸۰۰۰ لیتریه. چند بار باید بیاد؟</span> — _context:_ <span dir="rtl">adult; the tanker as a bare statement with no worked step (C7)</span>  
   → no prior block; a normal problem opening
7. [page] <span dir="rtl">[after the D28-6-shape new problem above] ‖ [open the tanker ledger]</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»</span>  
   → PAGE-LEVEL: the tanker ledger still has exactly its own four steps and its closed state
8. [chat] <span dir="rtl">U: یعنی گامِ ۲ هم درسته؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; «یعنی اینم درسته؟» (C46)</span>  
   → no change: گام ۲ stays ✓, no dispute flow; the coach answers
9. [chat] <span dir="rtl">U: تانکرِ ۸۰۰۰ لیتری: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۵ بار</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; re-typing the ✗ line with no objection (C28-4)</span>  
   → no re-check block «بازسنجی … (به درخواستِ خودتان)»; 📜 never «اعتراضِ خودتان»; the ✗ stays
10. [chat] <span dir="rtl">U: ممنون، درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; thanks after the verdicts</span>  
   → not a dispute, not a fix: nothing is re-checked or rewritten
11. [chat] <span dir="rtl">[«مسئلهٔ تانکر» and «مسئلهٔ استخر» both live] ‖ U: تو استخر، پمپ ساعتی ۸ مترمکعبه نه ۶</span> — _context:_ <span dir="rtl">adult; a correction in the other problem</span>  
   → only the pool ledger changes (proposal 48 ÷ 8 = 6); the tanker ledger is untouched
12. [chat] <span dir="rtl">U: هر مترمربع روزی ۵ لیتر: ۲۰۰۰۰ × ۵ = ۱۰۰۰۰۰ لیتر</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; re-typing a ✓ step</span>  
   → no duplicate step; گام ۲ stays one ✓ step
13. [chat] <span dir="rtl">U: اگه ۱۵ بار باشه، کلش چقدر میشه؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر»; a hypothetical on her wrong value</span>  
   → not an acceptance of 15: گام ۳ stays ✗; the ledger does not change; the coach answers
14. [chat] <span dir="rtl">U: مثلِ همون تانکر که گفتم، بقیه‌ش رو بعداً می‌گم</span> — _context:_ <span dir="rtl">«مسئلهٔ تانکر» closed; a mention with no new unknown or step</span>  
   → no new record, no merge, no reopening of the closed problem (C36)
15. [chat] <span dir="rtl">U: سلام، امروز ۲ ساعت وقت دارم، از کجا شروع کنیم؟</span> — _context:_ <span dir="rtl">adult; an opening with a number and no relation</span>  
   → no prior block

## R7.surface · the surface: loop and classify (F13, F14). A question about the system itself — the page, its buttons, its sheets, its records, its dates — is never a problem's 🧭 destination and never makes a chat problem; a real problem that merely contains a word like «سیستم» or «برنامه» is still a problem — C99 (C27-6). Internal labels — round or C numbers, English words such as «maybe», raw ISO dates, «… در موعدهای باز نیست», doubled guillemets — never appear in her view; her own words that contain such strings stay byte-exact — C100, C55. A life-plan opening goes to the coach, not to the bare assistant route (D28-19). Tie ❓: two candidates are never shown with identical names; a distinct part of a name or an ordinal is her choice; negating one of two asks «پس آن یکی؟»; a single clear fit is not a tie — C54, C80, C81, A28-32. A reply whose only overlap is frame or view words is asked about, never rejected; a reply naming no area is rejected and reopened; a take-back closes the sheet — C20, B27·D16, U59. The register layer converts a whole static label (pronoun AND verb) and never demands a rewrite of a reply written in one register — D28-29, C28-6, C83. 🧭 and the prerequisite map name a problem by its title and never repeat one node consecutively — C28-7, C28-20. pos = the stated surface behaviour (PAGE-LEVEL where it names the DOM or a view: the harness inspects her view); neg = a look-alike that is legitimately a problem, kept, asked or changed.


### Positive

1. [route] <span dir="rtl">U: اون برگه‌ی سیستم که هنوز جواب نگرفته، اگه بعداً جواب بیاد خبرم می‌کنی؟</span> — _context:_ <span dir="rtl">adult, a live problem with a waiting step (D28-10: became a chat problem's 🧭 destination)</span>  
   → answered as a question about the system; PAGE-LEVEL: 🧭 keeps the live problem's own destination; no chat problem is created; the turn question of the live problem is unchanged
2. [route] <span dir="rtl">U: این دکمه‌ی ↪ دقیقاً چی کار می‌کنه؟</span> — _context:_ <span dir="rtl">adult; a question about a page control</span>  
   → answered about the page; no problem record, no 🧭 destination from it
3. [route] <span dir="rtl">U: پیش‌بینی‌هام کجا ثبت میشن و چطوری ببینمشون؟</span> — _context:_ <span dir="rtl">teen 16; a question about the page's records</span>  
   → answered (pointing to «🎯 دفترِ پیش‌بینی»); no chat problem; no 🎯 is created or settled
4. [route] <span dir="rtl">U: چرا تاریخِ پنجشنبه رو برای قرارم نوشتی؟</span> — _context:_ <span dir="rtl">adult; a question about a date the page wrote</span>  
   → a system question: no chat problem, no 🧭 destination, and no new date ask from the quoted weekday
5. [route] <span dir="rtl">U: سرکشی‌ها رو کی جواب میده؟ معمولاً چقدر طول می‌کشه؟</span> — _context:_ <span dir="rtl">elder 68, register «شما»; a question about the sheet process</span>  
   → no chat problem; 🧭 unchanged; the reply is in «شما»
6. [route] <span dir="rtl">U: سؤالِ اول: این صفحه داده‌هامو کجا نگه می‌داره؟ ‖ U: سؤالِ دوم: اگه گوشیم عوض شد چی میشه؟</span> — _context:_ <span dir="rtl">adult; two questions about the page in a row (B27·D14)</span>  
   → neither becomes a problem; the dossier counts no new problem; no 🧭 node is added
7. [page] <span dir="rtl">[open her view after a 🎯 was created and a date asked: chat, 📜, «امروز», «🎯 دفترِ پیش‌بینی»]</span> — _context:_ <span dir="rtl">adult; internal labels (A28-36 «(دورِ ۲۷، C53)», A28-39 «maybe», A28-31 «موعدِ … در موعدهای باز نیست»)</span>  
   → PAGE-LEVEL: no page-authored text in her view matches round or clarification numbers («دورِ ۲۷», «C53», «C\d+»), English internal words («maybe», «unit-only», «stale»), or «… در موعدهای باز نیست»
8. [page] <span dir="rtl">[open the step card where «پیش‌بینی‌ات» shows a due date]</span> — _context:_ <span dir="rtl">adult (C28-22: raw «2026-10-18» beside «پیش‌بینی‌ات»)</span>  
   → PAGE-LEVEL: the date is shown in Jalali, in the page's date style; no raw ISO date string anywhere in her view
9. [page] <span dir="rtl">[open the back buttons and page messages that quote her phrase]</span> — _context:_ <span dir="rtl">adult (C28-21: doubled guillemets «««…»»»)</span>  
   → PAGE-LEVEL: each quote is wrapped in exactly one pair «…»; never «««» or «»»»
10. [route] <span dir="rtl">U: ماهِ دیگه باید اسباب‌کشی کنم و می‌خوام برنامه‌ش رو درست بچینم: کارتن، کارگر، قطع و وصلِ اینترنت</span> — _context:_ <span dir="rtl">adult; a life-plan opening (D28-19: routed to the bare assistant with no coach block)</span>  
   → routed to the coach with its coach block (a plan with parts); PAGE-LEVEL: the turn shows the coach's planning view, not a bare assistant reply; «ماهِ دیگه» is asked as «کدام روز؟» (R3)
11. [page] <span dir="rtl">[territory tie ❓ with two candidates whose view names are identical, «🗂 ابزارِ زمان‌بندی» twice]</span> — _context:_ <span dir="rtl">adult (A28-32: the tie showed two identical names)</span>  
   → PAGE-LEVEL: the ❓ lists the two candidates under distinct names (each with what tells it apart: its area or its distinct words); never two identical labels
12. [events] <span dir="rtl">[tie ❓: «یادآورِ پیامکی» and «تقویمِ مشترکِ خانواده»] ‖ U: دومی</span> — _context:_ <span dir="rtl">adult; an ordinal reply (C81)</span>  
   → her choice is «تقویمِ مشترکِ خانواده» (the second in the order the page listed); no further ask
13. [events] <span dir="rtl">[tie ❓: «یادآورِ پیامکی» and «تقویمِ مشترکِ خانواده»] ‖ U: همون مشترکه</span> — _context:_ <span dir="rtl">adult; a distinct part of one name (C54)</span>  
   → her choice is «تقویمِ مشترکِ خانواده»; no re-ask
14. [events] <span dir="rtl">[tie ❓: «یادآورِ پیامکی» and «تقویمِ مشترکِ خانواده»] ‖ U: پیامکی نه</span> — _context:_ <span dir="rtl">adult; negating one of two (C80)</span>  
   → not yet a choice: the page asks once «پس آن یکی؟» (the shared calendar); nothing is marked answered
15. [events] <span dir="rtl">[step ⏸ waiting for a sheet; the routine replies with only frame and view words: «این بخش در نما‌ی برنامه‌ریزی است و برای گام‌ها کاربرد دارد»]</span> — _context:_ <span dir="rtl">adult (B27·D16 / tB1: rejected «جواب نداد» instead of asked)</span>  
   → the page asks her whether this reply answers the step (C20/C2); never silently «answered», never rejected as «جواب نداد»
16. [events] <span dir="rtl">[sheet open for her step] ‖ U: نه، اصلاً لازم نیست، خودم با کاغذ حلش کردم</span> — _context:_ <span dir="rtl">adult; a take-back (U59: the sheet stayed «open»)</span>  
   → PAGE-LEVEL: the sheet shows closed (withdrawn by her) in the sheet list and the step leaves «⏸ waiting»; history keeps the take-back
17. [page] <span dir="rtl">[register «شما»] ‖ [open the static label that reads «تو کجای آنی» in «تو»]</span> — _context:_ <span dir="rtl">elder 71 (C28-6: only the pronoun was converted)</span>  
   → PAGE-LEVEL: the whole label is in «شما», pronoun and verb («شما کجای آن هستید» or equivalent); never «شما کجای آنی»
18. [prompt] <span dir="rtl">[her reply is written only in «تو»: «باشه، پس فردا بهت می‌گم چی شد»] ‖ [register «تو»]</span> — _context:_ <span dir="rtl">teen 15 (D28-29: the register guard demanded «دو ضمیر … همه را «تو» بنویس»)</span>  
   → no rewrite is demanded and no register warning is raised; her message stays byte-exact
19. [route] <span dir="rtl">U: یه تیکه زمینِ مثلثی دارم که دو ضلعش ۳۰ و ۴۰ متره و زاویه‌ی بینشون قائمه، ضلعِ سوم چقدره؟</span> — _context:_ <span dir="rtl">adult; the prerequisite map item (C28-7: named by her raw first message)</span>  
   → PAGE-LEVEL: the prerequisite-map item and 🧭 name the problem by its title (e.g. «ضلعِ سومِ زمینِ مثلثی»), never by her raw first sentence
20. [route] <span dir="rtl">[three page events about the same prerequisite in a row]</span> — _context:_ <span dir="rtl">adult (C28-20: 🧭 repeated the same node three times)</span>  
   → PAGE-LEVEL: 🧭 shows that prerequisite node once; repeated events update it, never stack identical consecutive nodes
21. [events] <span dir="rtl">U: این صفحه کجاش گفت که گامِ بعدی چیه؟</span> — _context:_ <span dir="rtl">adult, mid-problem; a meta question</span>  
   → not credited as «گذر از مرحله»; the stage and the turn question stay as they were
22. [route] <span dir="rtl">U: سیستمِ آبیاریِ باغم روزی ۱۲۰۰ لیتر می‌خواد و مخزنم ۳۰۰۰ لیتره، چند روز دووم میاره؟</span> — _context:_ <span dir="rtl">adult; a REAL problem that contains the word «سیستم» (look-alike of C99, listed under pos because the problem must be made)</span>  
   → a problem record is made (3000 ÷ 1200 = 2.5 days is its arithmetic); it is never answered as a question about the page

### Negative (look-alike)

1. [route] <span dir="rtl">U: اپلیکیشنِ بانکم کارمزد رو چطوری حساب می‌کنه؟ برای ۲۰۰ هزار تومن ۰٫۵ درصد گرفت</span> — _context:_ <span dir="rtl">adult; a question about ANOTHER system, with her own numbers</span>  
   → a problem of hers (fee arithmetic: 0.5 % of 200 000 = 1000), not a question about this page
2. [route] <span dir="rtl">U: برنامه‌ی هفته‌م رو چطوری بچینم که هم کار برسه هم ورزش؟</span> — _context:_ <span dir="rtl">adult; «برنامه» about her life, not the page</span>  
   → coach planning; never answered as a question about the page
3. [page] <span dir="rtl">U: تو آزمایشگاه نمونه‌ی C53 رو گذاشتم کنار و maybe فردا تکرارش کنم</span> — _context:_ <span dir="rtl">graduate student; her own text contains «C53» and «maybe»</span>  
   → PAGE-LEVEL: her bubble, 📜 line and any quote of it keep «C53» and «maybe» byte-exact; the C100 filter applies only to page-authored text
4. [page] <span dir="rtl">U: جلسه رو گذاشتم برای ⟨D0+4, written yyyy-mm-dd in Latin⟩</span> — _context:_ <span dir="rtl">adult; she typed an ISO-like date herself</span>  
   → her bubble keeps the date as typed; the page's own lines about it use Jalali
5. [prompt] <span dir="rtl">[register «تو»] ‖ her reply: «باشه، فردا بهتون می‌گم ولی تو هم یادت باشه»</span> — _context:_ <span dir="rtl">adult; a reply that genuinely mixes «شما» and «تو»</span>  
   → her text is kept byte-exact; the page's own next reply stays in «تو»; a rewrite request, if the page makes one, refers to this real mix only (no false alarm on a pure «تو» text)
6. [events] <span dir="rtl">[territory reply: «ابزارِ یادآورِ پیامکی» clearly fits her step «پیامک بفرستم یادم بیاد قرص بخورم» — step-specific words match]</span> — _context:_ <span dir="rtl">adult; a single clear fit (C54/C3)</span>  
   → no tie ❓; the area is marked arrived for her step
7. [events] <span dir="rtl">[tie ❓: «یادآورِ پیامکی» and «تقویمِ مشترکِ خانواده»] ‖ U: نمی‌دونم، هر کدوم بهتره</span> — _context:_ <span dir="rtl">adult; no candidate named</span>  
   → not a choice; the page asks again or explains; nothing is marked answered
8. [events] <span dir="rtl">[step ⏸ waiting for a sheet] ‖ [routine reply that names no area at all: «پیام دریافت شد»]</span> — _context:_ <span dir="rtl">adult (C20 second half)</span>  
   → rejected and the sheet reopened; never asked as if it might fit, never «answered»
9. [events] <span dir="rtl">[sheet open] ‖ U: نه، هنوز لازمش دارم، فقط دیر شده</span> — _context:_ <span dir="rtl">adult; not a take-back</span>  
   → the sheet stays open; nothing is withdrawn
10. [route] <span dir="rtl">U: کدوم فرمول برای این مسئله‌ی مثلث بهتره؟</span> — _context:_ <span dir="rtl">adult, mid-problem; a question about the problem's own method</span>  
   → part of the live problem (to the coach); not a system question, no new chat problem
11. [page] <span dir="rtl">[register «شما»] ‖ [her own message: «تو کجای کاری؟ این جمله رو معلمم همیشه می‌گفت»]</span> — _context:_ <span dir="rtl">elder 66; her own words in «تو» inside a «شما» session</span>  
   → her text stays byte-exact everywhere it is shown (C55); only page-authored labels follow «شما»
12. [route] <span dir="rtl">[one prerequisite node in 🧭, then a DIFFERENT prerequisite event]</span> — _context:_ <span dir="rtl">adult; two different nodes</span>  
   → PAGE-LEVEL: 🧭 shows both nodes in order (dedup applies only to identical consecutive nodes)
13. [events] <span dir="rtl">U: این صفحه کجاش گفت که گامِ بعدی چیه؟ ‖ U: آهان دیدم. خب، گامِ بعد رو حساب کردم: ۳۰² = ۹۰۰ و ۴۰² = ۱۶۰۰</span> — _context:_ <span dir="rtl">adult; a meta question followed by real work</span>  
   → the meta question is not credited; the second message is her work and moves the stage as work does
14. [route] <span dir="rtl">U: این صفحه یه کم کنده، ولی بریم سراغِ مسئله: سه تا قفسه‌ی ۸۰ سانتی تو دیوارِ ۲ متر و ۴۰ جا میشه؟</span> — _context:_ <span dir="rtl">adult; a remark about the page and a real problem in one message</span>  
   → the problem part makes (or continues) a problem with its own 🧭; the remark is not filed as a problem and changes no destination
15. [page] <span dir="rtl">U: اسمِ فایل رو گذاشتم «گزارشِ «فصلِ دوم»» که قاطی نشه</span> — _context:_ <span dir="rtl">adult; nested guillemets in her own words (look-alike of C28-21)</span>  
   → her text is kept exactly as typed, nested quotes included; the page's own frame around a quote of it still uses one pair
16. [events] <span dir="rtl">[tie ❓: «یادآورِ پیامکی» and «تقویمِ مشترکِ خانواده»] ‖ U: اولی نه</span> — _context:_ <span dir="rtl">adult; an ordinal inside a negation (look-alike of the ordinal choice)</span>  
   → not a choice of the first; the page asks once «پس آن یکی؟» (the shared calendar), as for any negation of one of two (C80)

## Ambiguities for the coordinator

These are points DECISIONS_R25–R28 leave open. No rule was invented for them. The matching entries were either left out or, where noted, assert only the part the decisions do fix.

1. **R1 / C84 — «N هزار و M».** C84 names it, but there is no named scale below «هزار», so «the next lower named scale» gives no second reading. Is M then units only (one reading, ordinary arithmetic)? No entry.
2. **R1 / C84 — which values a ✗ names.** «✗ with each reading's exact value» — every combination (both-thousand, both-units AND the mixed ones), or only the consistent ones? The entries require at least the both-thousand and both-units values, in her scale words, never a raw digit string and never one value only.
3. **R1 / C84 — sums without a carry always fit both readings.** «۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» (and every «÷ / ×» whose M part divides cleanly) fits as thousand AND as units, so C84 asks every time, although colloquial Persian almost always means thousand. The bank follows C84 literally (ASK-SCALE). Confirm that this question is wanted on such everyday lines.
4. **R1 / C84 — an explicit «تومن» after the M part.** «۱ میلیون و ۵۰۰ تومن» is colloquially often 1.5 million toman too. Does the currency word fix the units reading? No entry.
5. **R1 / `m2` — answer forms.** The entries use «هزار، ۹۰۰ هزار» and «تومن منظورم بود، نه هزار». Are an ordinal («اولی»), a restated full amount («۶ میلیون و ۹۰۰ هزار») or a bare «هزار» also answers? Only the first two forms have entries.
6. **R1 — «a√b ≈ c».** DECISIONS_R28 writes «"a√b ≈ c" نسنجیده». May the page compute it (OK / FLAG), or must it stay UNCHECKED? The entries accept either (NOT-FLAG / NOT-OK) and forbid only silence and the wrong verdict.
7. **R1 / C85 — the remainder clause itself.** Should the page check «۲ تا می‌مونه» against a total she stated earlier, as its own statement, or leave it to the coach? The entries assert only that it is never glued to the sum and never changes the sum's verdict.
8. **R1 / C85 — no separator.** «۵ و ۵ و ۵ میشه ۱۵ و ۳ تا می‌مونه» (with «و», no comma). Where does the sum end? No entry.
9. **R2 / C88 — a named quantity whose digits occur twice in ONE expression.** «عرض ۴ نیست» when the same «۴» occurs as width in two different steps (both meaning width). Change both, or ask? The entries have one width occurrence only.
10. **R2 / C87 — the wording of «names the stale base».** The entry asserts that the step is not rewritten, the base is named and the fresh value is shown; the exact sentence is open.
11. **R2 / C89 — exact proposals that are not whole units.** «۳٫۱۵ قوطی» is the exact recomputation. Should the page also note that cans come whole, or is that the coach's? The entries assert only the exact value.
12. **R3 / C49 vs D28-16 — «ثبتش کن» with an explicit other object.** C49 says a yes «with more text» answers the newest pending ask; D28-16 calls it a defect when the object was a new problem. The entry asserts that the named object wins. Confirm.
13. **R3 — «وسطِ ماه یعنی حدودِ ⟨a day⟩».** An approximation word plus an explicit day: confirm the named day through «… درست است؟», or ask which day? No entry.
14. **R3 / C70 — «عید» said in Aban.** C70's «said after 1 Farvardin of this year ⇒ ask whether next year's 1 Farvardin is meant» literally covers every day after 1 Farvardin. The entries treat that as the same single question as C50's «1 Farvardin … درست است؟». Confirm that no extra question is wanted outside Farvardin.
15. **R3 / C93 — the day-said rule lands in the past.** An edited relative day computed from the day it was said can fall before the edit day. Then C93's «this day has passed» question applies? The entry uses a case that lands on today.
16. **R3 / C94 — a past verb with no object while two acts of that verb are open.** «زنگ زدم» with two open call plans: close which, or ask «کدام؟»? No entry.
17. **R4 / C90 — a bare «N درصد» after a forecast clause, with no keyword and no page question.** A28-22 «…؛ ۷۰ درصد. …؛ ۹۰ درصد.» was rated S2, but C90's keyword list does not cover it. No entry.
18. **R4 / C90 — plain «مطمئنم» with no number and no «تقریباً / خیلی».** Ask the number, or nothing? No entry.
19. **R4 / C91 — tolerance of «حدودِ N».** Which outcomes meet «حدودِ ۸ درصد» (9? 10?) is not fixed; the entry uses 15 only.
20. **R4 / C53 vs C28-19 — where a 🎯 is filed.** C53 says «under the live problem»; C28-19 calls a course-exam forecast filed under the focused puzzle a defect. Under the live problem, or under the problem/dossier it is about? No entry.
21. **R4 / C76 — a bare number with no «درصد».** The entry treats «۶۰» answering «چقدر مطمئنی …؟» as 60 %. Confirm.
22. **R5 / C95 — which lines offer «↪».** The entries require her lines (including «کارِ تو»), 🎯 and ledger steps. Do the problem's statement line and page-authored lines (correction headers, «امروز» echoes) offer it too?
23. **R5 / C78 + C95 — moving a ledger step that has dependants.** Do the dependants move with it, stay with a cross-problem dependency, or does the page ask? No entry.
24. **R5 / C96 — «X گفت» followed by a calculation.** «فروشنده گفت ۳ × ۴۵۰ میشه ۱۳۰۰»: a datum with a source, or another person's claim («کارِ دیگری»)? The bank uses «حساب کرد / کرد:» for other-person work and «گفت + a datum» for sources only.
25. **R5 / C97 vs C46 — a variant of the same problem.** «حالا اگه ۶ نفر باشیم چی؟» has its own unknown; A28-13 shows such a side problem as its own record. Own record (C97) or a hypothetical of the same problem (C46)? No entry.
26. **R7 / C99 — reminder requests.** «خبرم کن وقتی کارگر اومد» is about her life, but it asks the page to act. System question, plan, or ask? No entry.
27. **R7 / C100 — Latin words that belong to mathematics.** «sqrt», «mod», «x» in page-authored math lines: allowed? The entries forbid only the internal labels named in C100.
28. **R7 / A28-32 — candidates whose names share every word.** The entry asserts distinct labels. What distinguishes them is open: area, view, sheet number.
29. **R7 / C28-6 — the exact «شما» form of a static label.** The entry accepts any form in which pronoun and verb agree.
30. **C101 — «the real harness» for [time] entries.** For entries that move the clock, is the round's time-advance harness the required replay, or is a page replay at a fixed clock enough?
