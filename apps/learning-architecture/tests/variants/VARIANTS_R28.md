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
| **total** | 30 | 18 |


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
