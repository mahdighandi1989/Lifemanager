# VARIANTS_R27 — independent variant bank (round 27 root mechanisms R1–R8)

Written from DECISIONS_R27 (root families R1–R8, «Severity made uniform», clarifications C40–C58), DECISIONS_R26 (C15–C39), DECISIONS_R25 (C1–C14), the round-27 runner handbacks and defect lists A, B, C, D, and roadmap §9 and §21 only; no source code of the page and no fixer's work was read. Paraphrased — new people, numbers and subjects — not copied from the scenarios; each entry tests the mechanism, not one sentence. The three S1 of round 27 (D27-18 «A و B میشه C» read as a sum in a product context; D27-1 «گرد کردم» bound to a fraction identity of another person; D27-2 a hypothetical question read as a dispute and a re-check that trusted) each have several pos and neg entries, marked «S1 family» in their context.
Every fix must pass the scenario sentence AND every entry of its mechanism here. **No fixed calendar dates in expectations:** D0 = the test clock's day when the test runs; «D0+n» = n days later; «the first Friday after D0» etc. are computed at run time and shown as Jalali dates; weeks run Saturday–Friday. Where an entry needs a weekday or a place in the Jalali month/year, its context says which (e.g. «clock on a Tuesday», «clock in Aban»). A date written inside a user text is given as «⟨D0+n, written yyyy/m/d⟩»: the test writes the Jalali date of D0+n in that form (Persian digits unless the entry says Latin). Idiom dates (C50) are stated as calendar rules («day 1 of the Jalali month after D0's month», «the last day of Esfand of D0's Jalali year», «1 Farvardin after D0»), never as a fixed date. A birth year inside a user text is an invented datum of the persona, not an expectation.
**Arithmetic verified:** every arithmetic fact in this bank — each value called right, each value called wrong, each exact value or proposal an expectation names — was recomputed with exact rational arithmetic (python3 `fractions.Fraction`; script VARIANTS_R27_verify.py beside this file, all assertions passing). It also sweeps every «a op b = c» written with symbols in the entries and asserts that the only mismatches are the values deliberately marked wrong, the C25/C44 ASK cases and the unit-scaled ones; word-operator shapes («A متر در B متر», «N تکه‌ی M متری», «N تا M تا», «سه تا A», «A و B میشه C», ellipsis sums, «N میلیون و M هزار», running sums, «A از B میشه N٪») are each asserted explicitly. Weekday offsets are asserted with the Saturday–Friday week. A value marked OK is exactly right (or a correct rounding, where said); a value marked FLAG is genuinely wrong.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result). **R1 states its own reading at its head:** every R1 expectation starts with the verdict the page's check must give to the coach (and, per R6, beside her line in 📜) — OK / FLAG / ASK / ASK× / ASK-WHICH / UNCHECKED / NOT-FLAG / NOT-OK / SILENT. «ASK» anywhere in the bank means: the decisions say the page asks her, and nothing is booked until she answers.
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views, [events] sheet replies, registry diffs, 🎯 rows, dossier / mind-card readings, [time] day sequences under the test clock, [prompt] what the prompt / reply / post-check contains, [route] 🧭 content.
Learners: adult unless the context says child (≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ deliberately missing in some entries — detection must not depend on it, and her text is stored and shown back exactly as typed (C55). Digits appear in Persian, Latin and mixed form on purpose; all must be read the same. All personal, school and shop names are invented.
Multi-message entries use « ‖ » (U = user, A = assistant, «[…]» = a page action / result / sheet event; «[clock → D0+n]» = the test clock moves). Old values always stay as history («اصلاح شد ⇐»); nothing is deleted. Named base problems («مسئلهٔ کاشی», «مسئلهٔ دوچرخه», «گامِ قفل», «نشستِ سه‌مسئله‌ایِ ۲۷») are defined in the head of their family. Machine-readable copy: VARIANTS_R27.json (fields rc, kind, role, text, expect, context). Points the decisions leave open are NOT turned into entries; they are listed at the end under «Ambiguities for the coordinator».

## Counts

| mechanism | pos | neg |
|---|---|---|
| R1.arith_reader | 41 | 23 |
| R2.correction_engine | 21 | 15 |
| R3.date_ask_engine | 30 | 21 |
| R4.prior_work | 21 | 14 |
| R5.forecast | 20 | 15 |
| R6.filing_dossier | 20 | 14 |
| R7.territory_loop | 20 | 13 |
| R8.register_quotes_names | 20 | 15 |
| **total** | 193 | 130 |


## R1.arith_reader · the page's exact-arithmetic reader, a46 (an operator word with two readings is never ✗ while one reading fits: «A و B میشه C» is a sum first, then the page asks «ضرب کردی؟» if only the product fits, ✗ only if neither — C40; «A ⟨unit⟩ در B ⟨unit⟩», «N تکه‌ی M ⟨unit⟩ی», «N تا M تا», «سه تا A» are products and a squared unit on the result is the product's unit, not a factor — C41; an ellipsis sum is computed exactly when it is an arithmetic progression fixed by its first two terms and its last, any other ellipsis is «نسنجیده» — C42; «آره، گرد کردم» binds only to the one line waiting in the C25 «؟» state, asks «کدام؟» if several wait, never binds to a fraction identity or to another person's line — C43; a rounded integer percentage with no approximation word takes the C25 question — C44; the page writes exact values in her own scale and unit — C45; a glued fraction «a/b = n» stays an identity and is never merged into a «÷» quotient — C26; «N میلیون و M هزار» and a running sum with a unit are read). Every expectation starts with the verdict the PAGE's check must give to the coach: «OK» = ✓ · «FLAG» = ✗ · «ASK» = neither ✓ nor ✗, the page states the exact value and asks whether she rounded (C25/C44) · «ASK×» = neither ✓ nor ✗, the page asks «ضرب کردی؟» (C40) · «ASK-WHICH» = the page asks which line she means (C43) · «UNCHECKED» = «نسنجیده» · «NOT-FLAG» = OK, or UNCHECKED when the unit/scale cannot be read; never ✗, never silence · «NOT-OK» = FLAG, or UNCHECKED when the shape cannot be parsed; never ✓, never silence · «SILENT» = outside the reader, no arithmetic line. pos = the mechanism's form read with the right verdict; neg = its confusable look-alike, which must get the OTHER verdict stated.


### Positive

1. [chat] <span dir="rtl">U: کاشیِ وسط ۶×۶=۳۶ تاست، با ۵ و ۷ میشه ۳۵ تا</span> — _context:_ <span dir="rtl">adult, tiling a courtyard: a square of tiles then a near-square rectangle; S1 family (D27-18 shape): a product line, then «A و B میشه C» in the same product context</span>  
   → first line OK (6 × 6 = 36). Second line ASK× — the sum reading gives 12, the product gives 35 = hers, so the page asks «ضرب کردی؟» and books neither ✓ nor ✗; never «✗ «۵ و ۷» را «۳۵» نوشته — حسابِ صفحه: ۱۲»; nothing is told to the coach as her slip
2. [chat] <span dir="rtl">U: ۸ و ۹ میشه ۷۲</span> — _context:_ <span dir="rtl">child 10, practising the times table aloud; S1 family; no «×» anywhere in the message</span>  
   → ASK× — 8 + 9 = 17 does not fit, 8 × 9 = 72 does; the page asks «ضرب کردی؟» in child register; never ✗; the mind card books no failure for this line
3. [chat] <span dir="rtl">U: هر ردیف ۱۲ تا صندلی، ۳ ردیف: ۱۲ و ۳ میشه ۳۶</span> — _context:_ <span dir="rtl">teen 14, chairs for a school play; S1 family; the sentence before names rows and seats</span>  
   → ASK× — sum 15 ≠ 36, product 36 = hers; asks «ضرب کردی؟»; never ✗ «حسابِ صفحه: ۱۵»
4. [chat] <span dir="rtl">U: 9 و 6 میشه 54</span> — _context:_ <span dir="rtl">adult; Latin digits around a Persian «و … میشه»; S1 family</span>  
   → ASK× — 9 + 6 = 15 ≠ 54 and 9 × 6 = 54; never ✗; Latin digits read like Persian ones
5. [chat] <span dir="rtl">U: ۶ و ۴ میشه ۱۰ کیلو آرد</span> — _context:_ <span dir="rtl">adult, baking for a wedding; two bags summed; C40 sum-first reading</span>  
   → OK — 6 + 4 = 10 under the sum reading; no «ضرب کردی؟» question, because the first reading already fits
6. [chat] <span dir="rtl">U: کفِ آشپزخونه ۴ متر در ۶ متر = ۲۴ مترمربع</span> — _context:_ <span dir="rtl">adult, buying floor tiles; C41 «A ⟨unit⟩ در B ⟨unit⟩ = C ⟨unit²⟩»</span>  
   → OK — 4 × 6 = 24; «مترمربع» is the product's unit and is not a factor; never silent, never «داده» only
7. [chat] <span dir="rtl">U: بالکن ۵ متر در ۷ متر = ۳۰ مترمربع، پس ۳۰ تا کاشیِ یه‌متری</span> — _context:_ <span dir="rtl">adult; a wrong «در» product (D27-5 / C27-25 / A27-3 shape: the wrong one used to pass silently — S2)</span>  
   → FLAG — 5 × 7 = 35, she wrote 30; the ✗ reaches the coach with her line quoted; the right number is not given away to her; the line is never booked as plain «داده»
8. [chat] <span dir="rtl">U: ۲٫۵ متر در ۳ متر = ۷٫۵ متر مربع</span> — _context:_ <span dir="rtl">adult; decimal factor; «متر مربع» written with a space, no ZWNJ</span>  
   → OK — 2.5 × 3 = 7.5; the spaced «متر مربع» is read as the unit like «مترمربع»
9. [chat] <span dir="rtl">U: میزِ کار ۶۰ سانت در ۴۰ سانت = ۲۴۰۰ سانتی‌مترمربع</span> — _context:_ <span dir="rtl">teen 16, woodwork class; centimetre units</span>  
   → OK — 60 × 40 = 2400; the unit word is not a factor
10. [chat] <span dir="rtl">U: ۳٫۵ متر در ۴ متر = ۱۲ مترمربع</span> — _context:_ <span dir="rtl">adult; a wrong decimal «در» product</span>  
   → FLAG — 3.5 × 4 = 14, she wrote 12; never silent
11. [chat] <span dir="rtl">U: ۲ متر در ۵۰ سانت = ۱ مترمربع</span> — _context:_ <span dir="rtl">adult, a shelf board; the two factors carry different length units</span>  
   → NOT-FLAG — 2 m × 0.5 m = 1 m² under the one consistent reading; OK if the units are read, UNCHECKED if not; never ✗ «حسابِ صفحه: ۱۰۰»
12. [chat] <span dir="rtl">U: ۵ تکه‌ی ۴ متری = ۲۰ متر سیم</span> — _context:_ <span dir="rtl">adult, electrician's helper; C41 «N تکه‌ی M متری = K»</span>  
   → OK — 5 × 4 = 20; never silent
13. [chat] <span dir="rtl">U: ۳ تکه ی ۶ متری = ۲۰ متر</span> — _context:_ <span dir="rtl">adult; ZWNJ missing («تکه ی»); a wrong one (B27·D9 shape, S2 when silent)</span>  
   → FLAG — 3 × 6 = 18, she wrote 20; read although «تکه ی» has no ZWNJ
14. [chat] <span dir="rtl">U: ۸ تکهٔ ۲٫۵ متری میشه ۲۰ متر</span> — _context:_ <span dir="rtl">adult; «تکهٔ» with the hamza form and «میشه» instead of «=»</span>  
   → OK — 8 × 2.5 = 20
15. [chat] <span dir="rtl">U: ۴ تا ۷ تا میشه ۲۸</span> — _context:_ <span dir="rtl">child 9, counting sweets in bags; C41 «N تا M تا میشه K» (A27-18 shape)</span>  
   → OK — 4 × 7 = 28; never silent
16. [chat] <span dir="rtl">U: ۶ تا ۸ تا میشه ۴۲</span> — _context:_ <span dir="rtl">child 11; a wrong grouped product</span>  
   → FLAG — 6 × 8 = 48, she wrote 42; in child register the coach is told without the right number being handed to her
17. [chat] <span dir="rtl">U: سه تا ۱۲۰ میشه ۳۶۰ هزار تومن</span> — _context:_ <span dir="rtl">elder 68, buying three blankets; number word «سه» + digits (D26-24 aD4 shape); «هزار تومن» only beside the result</span>  
   → OK — 3 × 120 = 360 (in thousands); the scale word stands only beside the result and is a unit (C15)
18. [chat] <span dir="rtl">U: چهار تا ۴۵ میشه ۱۹۰</span> — _context:_ <span dir="rtl">adult; a wrong «N تا A» product written with a number word</span>  
   → FLAG — 4 × 45 = 180, she wrote 190
19. [chat] <span dir="rtl">U: پنج تا ۲٫۴ لیتری میشه ۱۲ لیتر</span> — _context:_ <span dir="rtl">adult, water bottles for a hike</span>  
   → OK — 5 × 2.4 = 12
20. [chat] <span dir="rtl">U: جمعِ ۱ تا ۳۰ رو با قاعده زدم: ۱ + ۲ + … + ۳۰ = ۴۶۵</span> — _context:_ <span dir="rtl">teen 15, Gauss sum; C42 ellipsis fixed by the first two terms and the last</span>  
   → OK — 1 + 2 + … + 30 is an arithmetic progression with 30 terms, sum exactly 465; never «نسنجیده» any more for this shape
21. [chat] <span dir="rtl">U: ۱ + ۲ + … + ۱۲ = ۷۰</span> — _context:_ <span dir="rtl">teen 13; a wrong ellipsis sum (C27-13 / A27-6 shape: «۱ + … + ۱۰ = ۵۰» stayed «نسنجیده»)</span>  
   → FLAG — the progression 1, 2, …, 12 sums exactly to 78, she wrote 70; the coach is told ✗ (C42: exact arithmetic, not a convention)
22. [chat] <span dir="rtl">U: اولی شد ۴۶۵ و ۱ + ۲ + … + ۱۲ = ۷۰</span> — _context:_ <span dir="rtl">teen 13; the result of the previous sum glued before a new ellipsis by «و» (A27-6 boundary: «۲۱۰ و ۱ + ۲ + …»)</span>  
   → FLAG on «۱ + ۲ + … + ۱۲ = ۷۰» (exact 78) — the sum starts at 1, not at «۴۶۵ و ۱»; «۴۶۵» is not an addend of this line
23. [chat] <span dir="rtl">U: 2 + 4 + ... + 20 = 110</span> — _context:_ <span dir="rtl">teen 16; even numbers; Latin digits and three ASCII dots instead of «…»</span>  
   → OK — 2, 4, …, 20 is 10 terms of step 2, sum exactly 110; «...» read like «…»
24. [chat] <span dir="rtl">U: ۱ + ۳ + … + ۲۵ = ۱۶۹ یعنی ۱۳ به توان ۲</span> — _context:_ <span dir="rtl">teen 17, sum of odd numbers before an induction</span>  
   → OK — 1, 3, …, 25 is 13 terms, sum exactly 169
25. [chat] <span dir="rtl">U: ۵ + ۱۰ + … + ۵۰ = ۲۵۰</span> — _context:_ <span dir="rtl">adult, saving 5 more each week for ten weeks</span>  
   → FLAG — 5, 10, …, 50 is 10 terms, sum exactly 275, she wrote 250
26. [chat] <span dir="rtl">U: ۳ + ۷ + … + ۴۳ = ۲۳۰</span> — _context:_ <span dir="rtl">teen 16; step 4 progression</span>  
   → FLAG — 3, 7, …, 43 is 11 terms, sum exactly 253, she wrote 230
27. [chat] <span dir="rtl">U: تا الان ۷۵ میلیون خرج شده، با کابینت ۴۵ میلیون میشه ۱۲۰، با نقاشی ۱۸ میشه ۱۳۸</span> — _context:_ <span dir="rtl">adult, renovating a flat; running sum with a unit on some links only (C27-22 shape)</span>  
   → OK on both links — 75 + 45 = 120 and 120 + 18 = 138 under the one consistent reading (all in millions); never silent
28. [chat] <span dir="rtl">U: تا الان ۷۵ میلیون خرج شده، با کابینت ۴۵ میلیون میشه ۱۲۰، با نقاشی ۱۸ میشه ۱۴۸</span> — _context:_ <span dir="rtl">adult; the same running sum with a wrong second link</span>  
   → first link OK (75 + 45 = 120); second link FLAG — 120 + 18 = 138, she wrote 148; the ✗ names the second link only
29. [chat] <span dir="rtl">U: ۲ میلیون و ۴۰۰ هزار ÷ ۸ = ۳۰۰ هزار</span> — _context:_ <span dir="rtl">adult, splitting a deposit among eight flatmates; «N میلیون و M هزار» operand</span>  
   → OK — 2 400 000 ÷ 8 = 300 000; the compound amount is read as one number
30. [chat] <span dir="rtl">U: ۴ × ۲ میلیون و ۲۵۰ هزار = ۸ میلیون و ۲۵۰ هزار</span> — _context:_ <span dir="rtl">adult; four monthly instalments; a wrong product with compound amounts</span>  
   → FLAG — 4 × 2 250 000 = 9 000 000, she wrote 8 250 000; the page's value is written in her scale («۹ میلیون», C45)
31. [chat] <span dir="rtl">U: ۱۵۰۰ × ۹٫۸۱ × ۲۲ = ۳۲۴ هزار ژول</span> — _context:_ <span dir="rtl">adult, pump energy; integer in thousands for a non-integer product, no approximation word (C27/C25 + C45; B27·D13 shape)</span>  
   → ASK — exact 323 730 = 323.73 thousand; 324 is its rounding, so the page asks whether she rounded and writes the exact value in HER scale: «۳۲۳٫۷۳ هزار»; never «۳۲۳۷۳۰ هزار»
32. [chat] <span dir="rtl">U: ۲ میلیون × ۳ = ۶ هزار</span> — _context:_ <span dir="rtl">adult; scale words on operand and result disagree (C23 ✗) — display rule C45 (D27-7 shape: «۶۰۰۰ هزار»)</span>  
   → FLAG — 2 000 000 × 3 = 6 000 000; the page writes the exact value as «۶ میلیون», never «۶۰۰۰ هزار»
33. [chat] <span dir="rtl">U: ۴۵۰ × ۱۲۰۰ = ۵۰۰ هزار</span> — _context:_ <span dir="rtl">adult; she wrote «هزار» on the result; wrong value</span>  
   → FLAG — 450 × 1200 = 540 000; the page writes «۵۴۰ هزار» in her scale
34. [chat] <span dir="rtl">U: ۷ از ۳۰ میشه ۲۳٪</span> — _context:_ <span dir="rtl">teen 17, share of late buses; integer percentage with no approximation word (C44; D27-23 shape)</span>  
   → ASK — exact 23.33…٪; 23 is its rounding, so the page states the exact value and asks whether she rounded; never ✓ outright
35. [chat] <span dir="rtl">U: ۹ از ۲۲ نفر قبول شدن، میشه ۴۱ درصد</span> — _context:_ <span dir="rtl">adult, a class pass rate; «درصد» as a word</span>  
   → ASK — exact 40.909…٪; 41 is its rounding; C25 question
36. [chat] <span dir="rtl">U: ۵ از ۸ میشه ۶۲٪</span> — _context:_ <span dir="rtl">adult; 62 is the truncation of the exact 62.5٪</span>  
   → ASK — exact 62.5٪; 62 is its truncation, so the C25 question is asked (the same as for 63, the rounding)
37. [chat] <span dir="rtl">U: ۹۰ ÷ ۷ = ۱۳ ‖ [page: «دقیقش ۱۲٫۸۵… است؛ گرد کردی؟»] ‖ U: آره گرد کردم</span> — _context:_ <span dir="rtl">adult; one line waiting in the C25 «؟» state (C43)</span>  
   → ASK, then her «آره گرد کردم» binds to «۹۰ ÷ ۷ = ۱۳», the only waiting line: it is stored as approximate and ✓; no other line changes
38. [chat] <span dir="rtl">U: ۵۰ ÷ ۳ = ۱۷ و ۸۰ ÷ ۶ = ۱۳ ‖ [page asks about both] ‖ U: آره گرد کردم</span> — _context:_ <span dir="rtl">adult; two lines wait in the «؟» state (C43)</span>  
   → both lines ASK (exact 16.66… and 13.33…); her bare «آره گرد کردم» does not pick one: ASK-WHICH — the page asks «کدام؟»; nothing is stored as ✓ until she names one (or says «هر دو»)
39. [chat] <span dir="rtl">U: داداشم نوشته ۱۵/۱۴ = ۱. من هم ۱۰۰ ÷ ۶ = ۱۷ ‖ [page: brother's identity ✗, her quotient «؟»] ‖ U: آره، اون ۱۷ رو گرد کردم</span> — _context:_ <span dir="rtl">teen 15; S1 family (D27-1 shape): another person's glued fraction identity next to her own quotient (C43, C57, C26)</span>  
   → «۱۵/۱۴ = ۱» FLAG and filed as «کارِ دیگری» (exact 15/14); «۱۰۰ ÷ ۶ = ۱۷» ASK (exact 16.66…); her «آره، اون ۱۷ رو گرد کردم» binds ONLY to her own 100 ÷ 6 line, which becomes approximate ✓; the brother's identity is never stored as «approximate and correct»
40. [chat] <span dir="rtl">U: ۱۷ ÷ ۱۶ = ۱ ولی ۱۷/۱۶ = ۱ نیست دیگه، هست؟</span> — _context:_ <span dir="rtl">teen 16; the same numbers as a «÷» quotient and as a glued fraction in one message (C26, D27-6)</span>  
   → «۱۷ ÷ ۱۶ = ۱» ASK (exact 1.0625; 1 is its rounding and truncation); «۱۷/۱۶ = ۱» FLAG as a fraction identity; the two lines are judged separately and never merged into one «؟»
41. [chat] <span dir="rtl">U: (۸۵۰ − ۴۲۰) × ۲۶ = ۱۱ میلیون و ۱۸۰</span> — _context:_ <span dir="rtl">adult, prices in thousand tomans earlier in the chat; result «N میلیون و M» with a bare M (A27-16 shape)</span>  
   → NOT-FLAG — 430 × 26 = 11 180 thousand = 11 180 000; OK if «و ۱۸۰» is read as 180 thousand under the one consistent reading, UNCHECKED if not; never silent (C17), never ✗

### Negative (look-alike)

1. [chat] <span dir="rtl">U: ۷ و ۵ میشه ۳۰</span> — _context:_ <span dir="rtl">adult; neither the sum nor the product fits (C40 last clause)</span>  
   → FLAG — 7 + 5 = 12 and 7 × 5 = 35, neither is 30; no «ضرب کردی؟» question, because no reading fits
2. [chat] <span dir="rtl">U: ۵×۵=۲۵، با ۴ و ۶ میشه ۱۰ تا اضافه</span> — _context:_ <span dir="rtl">adult; S1 family look-alike: a product line, then a sum that fits in the same message</span>  
   → both OK — 5 × 5 = 25 and 4 + 6 = 10; the product context does not turn a fitting sum into a «ضرب کردی؟» question
3. [chat] <span dir="rtl">U: ۲ و ۲ میشه ۴</span> — _context:_ <span dir="rtl">child 7; both readings fit</span>  
   → OK — the sum reading fits (and the product too); no question is asked
4. [chat] <span dir="rtl">U: ۸ و ۳ میشه ۱۱ متر مربع</span> — _context:_ <span dir="rtl">adult; the unit hints at a product but the sum fits the number (C40 reads the sum first)</span>  
   → OK for the reader — 8 + 3 = 11 fits the first reading; no «ضرب کردی؟» and no ✗ from the reader; whether an area should be a product is the coach's matter, not an arithmetic ✗
5. [chat] <span dir="rtl">U: اتاقم ۳ متر در ۴ متره، یه فرش می‌خوام</span> — _context:_ <span dir="rtl">adult; «در» product with no claimed result</span>  
   → SILENT — no result is claimed, so there is no arithmetic line; nothing is booked as a computation
6. [chat] <span dir="rtl">U: ۳ تا ۴ تا مهمون میان</span> — _context:_ <span dir="rtl">adult; «۳ تا ۴ تا» means «three or four», no «میشه»</span>  
   → SILENT — a range, not «N تا M تا میشه K»; no product is read
7. [chat] <span dir="rtl">U: سه تا ۸۰ تومنی خریدم</span> — _context:_ <span dir="rtl">elder 71; «سه تا A» with no result</span>  
   → SILENT — no claimed value
8. [chat] <span dir="rtl">U: ۲ تکه ی ۵ متری خریدم که کم نیاد</span> — _context:_ <span dir="rtl">adult; «N تکه‌ی M متری» with no result; ZWNJ missing</span>  
   → SILENT — no claimed value
9. [chat] <span dir="rtl">U: ۸ در صد از ۲۵۰ میشه ۲۰</span> — _context:_ <span dir="rtl">adult; «در صد» written apart means «percent», not «۸ × ۱۰۰»</span>  
   → OK (8٪ of 250 = 20) or UNCHECKED; never FLAG with a page value of 800 or 200 000 from a «در» product
10. [chat] <span dir="rtl">U: ۱ + ۴ + … + ۲۰ = ۷۰</span> — _context:_ <span dir="rtl">teen 15; the first two terms fix step 3, but 20 is not a term of 1, 4, 7, …</span>  
   → UNCHECKED — not an arithmetic progression fixed by its first two terms and its last; neither ✓ nor ✗ (C42 last clause)
11. [chat] <span dir="rtl">U: ۱ + ۲ + ۴ + … + ۶۴ = ۱۲۷</span> — _context:_ <span dir="rtl">teen 17; a geometric series (true value 127)</span>  
   → UNCHECKED — the third term breaks the progression fixed by 1, 2; never ✓ by guessing the pattern, never ✗
12. [chat] <span dir="rtl">U: ۱² + ۲² + … + ۱۰² = ۳۸۵</span> — _context:_ <span dir="rtl">teen 17; a sum of squares (true value 385)</span>  
   → UNCHECKED — not an arithmetic progression of the written terms; never ✗
13. [chat] <span dir="rtl">U: n(n+1)/2 = 465 پس n = 30</span> — _context:_ <span dir="rtl">teen 16; symbolic, one unknown</span>  
   → SILENT — an equation with an unknown, not an operator line with two known operands
14. [chat] <span dir="rtl">U: ۱۷ ÷ ۱۶ = ۱</span> — _context:_ <span dir="rtl">adult; a «÷» quotient alone (C26 second clause)</span>  
   → ASK — exact 1.0625; 1 is its rounding; never FLAG as if it were a glued fraction identity
15. [chat] <span dir="rtl">U: ۳ از ۸ میشه ۳۷٫۵٪</span> — _context:_ <span dir="rtl">adult; the exact percentage</span>  
   → OK — 3/8 = 37.5٪ exactly; no C44 question
16. [chat] <span dir="rtl">U: ۷ از ۳۰ میشه حدود ۲۳٪</span> — _context:_ <span dir="rtl">adult; an approximation word stands before the percentage</span>  
   → OK under C9 — «حدود» marks her rounding; no C44 question
17. [chat] <span dir="rtl">U: ۷ از ۳۰ میشه ۲۵٪</span> — _context:_ <span dir="rtl">adult; an integer percentage that is neither the rounding nor the truncation</span>  
   → FLAG — exact 23.33…٪; 25 is neither 23 nor 24 (C25: any other integer is ✗); no rounding question
18. [chat] <span dir="rtl">U: ۹۰ ÷ ۷ = ۱۸</span> — _context:_ <span dir="rtl">adult; an integer far from the quotient</span>  
   → FLAG — exact 12.857…; 18 is not its rounding or truncation; no «گرد کردی؟»
19. [chat] <span dir="rtl">U: مامانم نوشته ۱۱/۱۰ = ۱ ‖ [page: ✗ «کارِ دیگری»] ‖ U: آره گرد کردم</span> — _context:_ <span dir="rtl">teen 14; S1 family look-alike: the only waiting line is another person's fraction identity (C43, C57)</span>  
   → the identity stays FLAG (exact 11/10) and filed as «کارِ دیگری»; «آره گرد کردم» binds to nothing — no line is in the «؟» state — and the page says so once; nothing becomes «approximate and correct»
20. [chat] <span dir="rtl">U: ۱/۲ + ۱/۳ + ۱/۴ = ۱ ‖ [page ✗] ‖ U: آره گرد کردم</span> — _context:_ <span dir="rtl">adult; S1 family look-alike: her own fraction identity, which is ✗ not «؟» (C26, C43)</span>  
   → stays FLAG — 1/2 + 1/3 + 1/4 = 13/12 ≠ 1; «گرد کردم» never binds to a fraction identity; the page may say an identity is exact and cannot be rounded
21. [chat] <span dir="rtl">U: ۹۰ ÷ ۷ = ۱۳ ‖ [page asks «گرد کردی؟»] ‖ U: نه، گرد نکردم، فکر کردم دقیقاً ۱۳ ـه</span> — _context:_ <span dir="rtl">adult; her «نه» to the C25 question (C26)</span>  
   → FLAG — exact 12.857…; her «نه» leaves ✗; nothing is stored as approximate
22. [chat] <span dir="rtl">U: ⟨D0+12, written yyyy/m/d⟩ قسطِ آخره</span> — _context:_ <span dir="rtl">adult; a written Jalali date with slashes</span>  
   → SILENT to the reader — a date, never read as a chain of divisions (it is R3's to read as a date)
23. [chat] <span dir="rtl">U: بچه‌ها ۱۳ و ۱۲ ساله‌ان</span> — _context:_ <span dir="rtl">adult; two numbers joined by «و» with no «میشه»</span>  
   → SILENT — no operator word, no claim

## R2.correction_engine · the correction engine (a number is stale only if the record shows it built from the corrected value — an expression containing it or a ledger step that depends on it; equal digits elsewhere are never dependency — C47; derived-of-derived numbers are reached too; a proposal is the exact recomputation of the stored expression, never a scaled guess, a rounded number or a text replacement; with no stored expression the number is marked stale and the page asks, with no number — C47/C11; her redo with the corrected value clears the mark; «X نه Y» and «Xایم نه Y» correct Y ⇒ X even when the old quote holds both numbers; a correction plus a question in one message: the correction is applied and the question goes to the coach — C48; the ✏️ copy-ask never rewrites a negated word; the correction header states the change exactly as made). Base problem — «مسئلهٔ کاشی» (adult, bathroom floor): گام ۱ «کفِ حمام ۲٫۴ متر در ۱٫۵ متر = ۳٫۶ مترمربع» ✓ · گام ۲ «هر کارتن ۱٫۲ مترمربع، پس ۳٫۶ ÷ ۱٫۲ = ۳ کارتن» ✓ · گام ۳ «هر کارتن ۴۵۰ هزار: ۳ × ۴۵۰ = ۱۳۵۰ هزار» ✓ · گام ۴ «۲۰ درصد اضافه برای برش: ۳٫۶ × ۱٫۲ = ۴٫۳۲ مترمربع» ✓ · گام ۵ «پس با ۲ میلیون بودجه کافیه» (depends on گام ۳, no expression); other data in the same chat: «ارتفاعِ دیوار ۳ متره», «۳ کیسه چسب خریدم». Base problem — «مسئلهٔ دوچرخه» (teen 16, interval training): «هر دور ۱۲ ثانیه، ۱۵ دور: ۱۲ × ۱۵ = ۱۸۰ ثانیه» · «با ۴۵ ثانیه استراحت: ۱۸۰ + ۴۵ = ۲۲۵ ثانیه» · «۲۲۵ ثانیه = ۳٫۷۵ دقیقه» · «گرم‌کردن: ۴۰ + ۱۲ = ۵۲ دقیقه». pos = a dependant that must be reached / a correction that must land / a proposal that must be exact; neg = a look-alike that must stay untouched.


### Positive

1. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; a direct datum and its first dependant</span>  
   → 2.4 ⇒ 2.8 is applied; گام ۱ is marked «با عددِ پیشین» with the proposal 3.6 ⇒ 4.2 (2.8 × 1.5 = 4.2, recomputed from the stored expression); the old 3.6 stays as history
2. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; derived-of-derived (A26-15 s04 shape: the second derivative was not marked)</span>  
   → گام ۲ (3 ⇒ 3.5, from 4.2 ÷ 1.2) AND گام ۳ (1350 ⇒ 1575 هزار, from 3.5 × 450) are both marked stale with exact proposals; the chain is followed to the end, not one level only
3. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; a second branch from the same datum</span>  
   → گام ۴ is marked stale with 4.32 ⇒ 5.04 (4.2 × 1.2); the proposal is never 4.32 × 2.8 / 2.4 or any rounded figure
4. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; a ledger step with no expression that depends on a stale step (C47 second half)</span>  
   → گام ۵ «پس با ۲ میلیون بودجه کافیه» is marked stale and the page asks her to re-check it, with NO proposed number and no rewritten sentence
5. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴ ‖ [stale marks on گام ۱–۵] ‖ U: دوباره حساب کردم: ۲٫۸ در ۱٫۵ میشه ۴٫۲ مترمربع</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; her own redo with the corrected value (B27·D6)</span>  
   → the stale mark of گام ۱ is cleared and 4.2 is her value (history: 3.6 ⇐); گام ۲–۵ stay marked until their own redo or her acceptance; her redo is not booked as a new unrelated result
6. [chat] <span dir="rtl">U: اولش نوشتم هر بسته ۰٫۴ کیلوئه؛ اشتباه بود، ۰٫۳۵ ـه</span> — _context:_ <span dir="rtl">adult, packing 12 parcels: earlier «۱۲ × ۰٫۴ = ۴٫۸ کیلو»; the correction re-quotes the old fragment (D27-16 regression: refused as «نقل از پیامِ فعلی»)</span>  
   → 0.4 ⇒ 0.35 is applied; «۱۲ × ۰٫۴ = ۴٫۸» is marked stale with 4.8 ⇒ 4.2 (12 × 0.35); never «این اصلاح انجام نشد»
7. [chat] <span dir="rtl">U: ۴ نفریم نه ۵ — حالا سهمِ هر نفر چقدر میشه؟</span> — _context:_ <span dir="rtl">adult; earlier «ما ۵ نفریم و ۴ میلیون پول داریم: ۴ ÷ ۵ = ۰٫۸ میلیون هر نفر» — the old quote holds BOTH 4 and 5 (A27-9 shape, C48)</span>  
   → people 5 ⇒ 4 is applied (never «مقدارِ درست با مقدارِ پیشین فرقی نداشت»); «۴ ÷ ۵ = ۰٫۸» is marked stale with 0.8 ⇒ 1 (4 ÷ 4); the money «۴ میلیون» is untouched; the question goes to the coach in the same turn
8. [chat] <span dir="rtl">U: ۷ تاییم نه ۸ تا</span> — _context:_ <span dir="rtl">adult, splitting a 2 800 000 bill: earlier «۲ میلیون و ۸۰۰ هزار ÷ ۸ = ۳۵۰ هزار»; C48 «Xایم نه Y» form</span>  
   → 8 ⇒ 7 is applied; the share is marked stale with 350 ⇒ 400 هزار (2 800 000 ÷ 7 = 400 000)
9. [chat] <span dir="rtl">U: یه اصلاح: کرایه ۳ میلیون بود نه ۲٫۵ — حالا سهمِ هر کدوم چقدر میشه؟</span> — _context:_ <span dir="rtl">adult; earlier «۲٫۵ ÷ ۵ = ۰٫۵ میلیون»; correction and question in one message (C27-26 / T11)</span>  
   → 2.5 ⇒ 3 is applied and «۰٫۵» is marked stale with 0.5 ⇒ 0.6 (3 ÷ 5); the question goes to the coach; never «این اصلاح انجام نشد: این پیام پرسش بود»
10. [chat] <span dir="rtl">U: صبر کن، قیمتِ هر کارتن ۵۰۰ ـه نه ۴۵۰، با این حساب پول کم نمیاد؟</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; correction plus a question about a stale dependant</span>  
   → 450 ⇒ 500 applied; گام ۳ stale with 1350 ⇒ 1500 هزار (3 × 500); گام ۵ stale with no number; the question about the budget goes to the coach, who sees the stale marks
11. [chat] <span dir="rtl">U: هر دور ۱۰ ثانیه‌ست نه ۱۲</span> — _context:_ <span dir="rtl">«مسئلهٔ دوچرخه»; a chain with a sum after the product (D27-11 shape: proposals were scaled, not recomputed)</span>  
   → 180 ⇒ 150 (10 × 15), 225 ⇒ 195 (150 + 45), 3.75 ⇒ 3.25 دقیقه (195 ÷ 60); never 225 ⇒ 187.5 (proportional scaling) and never 3.75 ⇒ 3.125
12. [chat] <span dir="rtl">U: ارتفاع ۱۰ ـه نه ۱۲</span> — _context:_ <span dir="rtl">teen 17; earlier «قطرِ قاب = √(۹² + ۱۲²) = ۱۵»; the exact new value is irrational (D27-30 shape: «۱۷ ⇒ ۱۴» was proposed)</span>  
   → the line is marked stale; the proposal is the exact recomputation «√۱۸۱» (shown with a labelled approximation ≈ ۱۳٫۴۵), or the page asks with no number; never a bare «۱۵ ⇒ ۱۳» presented as the recomputation
13. [chat] <span dir="rtl">U: ضریب ۰٫۷۵ ـه نه ۰٫۸</span> — _context:_ <span dir="rtl">adult, rain tank; earlier «حجم = ۲۰ × ۰٫۸ = ۱۶ لیتر» (B27·D8 shape: text replacement built «۲۴ × ۰٫۷۵ = ۱۶.۸»)</span>  
   → the proposal is the recomputed line «۲۰ × ۰٫۷۵ = ۱۵»; never «۲۰ × ۰٫۷۵ = ۱۶» (a false equation made by replacing text) and never a proposal that keeps 0.8 anywhere
14. [edit] <span dir="rtl">[✏️ on her bubble «۱۲ تا صندلی کرایه می‌کنم» ⇒ «۱۵ تا صندلی کرایه می‌کنم»]</span> — _context:_ <span dir="rtl">adult, a birthday; another of her sentences, «۱۲ تا صندلی برای مهمونا»، holds the same datum</span>  
   → the copy-ask «این‌جا هم عوض شود؟» is offered for «۱۲ تا صندلی برای مهمونا» with the proposal 12 ⇒ 15; nothing is rewritten without her yes
15. [edit] <span dir="rtl">[✏️ on her bubble «وزنم ۷۸ کیلو بود» ⇒ «وزنم ۷۶ کیلو بود»]</span> — _context:_ <span dir="rtl">adult; the correction header (B27·D11: header misstated the change)</span>  
   → the header states exactly «۷۸ ⇒ ۷۶» (old ⇒ new, in the page's one arrow convention); it never names another number of the bubble and never the reverse direction
16. [chat] <span dir="rtl">U: ۵۰ تا لیوان بین ۸ تا میز نه ۶ تا</span> — _context:_ <span dir="rtl">adult; earlier «۵۰ ÷ ۶ ≈ ۸٫۳ لیوان هر میز»; an approximate line corrected</span>  
   → 6 ⇒ 8 applied; the line is marked stale with 8.3 ⇒ 6.25 (50 ÷ 8 exactly, no invented rounding; if shown rounded, labelled)
17. [chat] <span dir="rtl">U: عرض 1.8 ـه نه ۱٫۵</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; the other factor of the same product, the new value in Latin digits, the old one in Persian</span>  
   → 1.5 ⇒ 1.8 applied; 3.6 ⇒ 4.32 (2.4 × 1.8), 3 ⇒ 3.6 (4.32 ÷ 1.2), 1350 ⇒ 1620 هزار (3.6 × 450), 4.32 ⇒ 5.184 (4.32 × 1.2); all exact
18. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴ — راستی چسب هم بیشتر لازمه؟</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; correction plus an unrelated question</span>  
   → the correction lands with its stale marks (as above); the question about glue goes to the coach; the «۳ کیسه چسب» datum is NOT marked stale
19. [chat] <span dir="rtl">U: یه اصلاح : قیمت هر متر ۱۲۰ هزاره نه ۱۴۰</span> — _context:_ <span dir="rtl">adult, curtain fabric, earlier «۶ × ۱۴۰ = ۸۴۰ هزار»; a space before the colon; ZWNJ missing in «هر متر»</span>  
   → 140 ⇒ 120 applied; «۶ × ۱۴۰ = ۸۴۰» stale with 840 ⇒ 720 هزار (6 × 120)
20. [chat] <span dir="rtl">U: ۱۸ نفر ثبت‌نام کردن نه ۱۶</span> — _context:_ <span dir="rtl">teen 15, class trip: earlier «۱۶ × ۸۵ = ۱۳۶۰ هزار» and then «۱۳۶۰ ÷ ۴ = ۳۴۰ هزار هر هفته»</span>  
   → 16 ⇒ 18 applied; 1360 ⇒ 1530 (18 × 85) and 340 ⇒ 382.5 (1530 ÷ 4), the second one as derived-of-derived
21. [chat] <span dir="rtl">U: مساحت همون مقدارِ قبل بود که حساب کردم، پس سود رو هم با همون بگیر</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی» after 2.4 ⇒ 2.8; a later ledger step built on step 1 by reference («همون مقدار»), with no digits</span>  
   → the step that refers to step 1 is marked stale like any dependant (ledger dependency, C47), with no proposed number

### Negative (look-alike)

1. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; equal digits elsewhere (C47; T9 coincidental number)</span>  
   → «ارتفاعِ دیوار ۳ متره» and «۳ کیسه چسب خریدم» are NOT marked stale, although گام ۲ (3 کارتن) is; no copy-ask for them
2. [chat] <span dir="rtl">U: ۲۵ درصد اضافه بگیر نه ۲۰ درصد</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; the factor 1.2 ⇒ 1.25 while the carton size is also 1.2</span>  
   → only گام ۴ changes: 4.32 ⇒ 4.5 (3.6 × 1.25); «هر کارتن ۱٫۲ مترمربع» and گام ۲ stay untouched; equal digits are not dependency
3. [chat] <span dir="rtl">U: هر دور ۱۰ ثانیه‌ست نه ۱۲</span> — _context:_ <span dir="rtl">«مسئلهٔ دوچرخه»; «گرم‌کردن: ۴۰ + ۱۲ = ۵۲ دقیقه» holds the same digits as a different quantity (D27-12 shape)</span>  
   → the warm-up line is NOT marked stale and no «۵۲ ⇒ ۵۰» proposal is made: its 12 is minutes of warm-up, not the corrected seconds per lap
4. [chat] <span dir="rtl">U: ۳۰ دقیقه طول کشید نه ۲۵</span> — _context:_ <span dir="rtl">adult, baking; earlier «۲۵ دقیقه پخت» and, separately, «قالب ۲۵ سانته، ۲۵ ÷ ۴ = ۶٫۲۵ سانت هر برش» (C27-14 shape)</span>  
   → only the baking time and what is built on it change; «۲۵ ÷ ۴ = ۶٫۲۵» is NOT marked stale and no «۶٫۲۵ ⇒ ۷٫۵» proposal appears
5. [chat] <span dir="rtl">U: اگه ۳ نفر بودیم چی؟</span> — _context:_ <span dir="rtl">adult; after «۴ ÷ ۵ = ۰٫۸ میلیون هر نفر»; a hypothetical question (C46)</span>  
   → no correction: the datum stays 5, nothing is marked stale, no «این اصلاح انجام نشد» line; the coach answers the hypothetical
6. [chat] <span dir="rtl">U: دوباره حساب کردم: ۲٫۴ در ۱٫۵ میشه ۳٫۶</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی» after 2.4 ⇒ 2.8; her redo uses the OLD value</span>  
   → the stale mark of گام ۱ stays (her redo used 2.4, not 2.8); the page may point at it once; the arithmetic itself is OK (2.4 × 1.5 = 3.6)
7. [chat] <span dir="rtl">U: ۹ نه ۷</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; no record holds 7</span>  
   → nothing is changed; the page says honestly that no record holds 7 (or asks which number she means); no stale marks anywhere
8. [edit] <span dir="rtl">[✏️ on her bubble «۱۲ تا صندلی کرایه می‌کنم» ⇒ «۱۵ تا صندلی کرایه می‌کنم»]</span> — _context:_ <span dir="rtl">adult; another of her sentences negates the old number: «نه ۱۲ تا، بیشتر لازمه» (A27-8 shape)</span>  
   → no copy-ask rewrites «نه ۱۲ تا» into «نه ۱۵ تا»; the negated sentence is left as she wrote it
9. [chat] <span dir="rtl">U: حدس زده بودم ۳ کارتن بسه</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی» after 2.4 ⇒ 2.8; her guess (a 🎯-less guess row), not built from 3.6</span>  
   → the guess is NOT marked stale and gets no proposal; only گام ۲, built from 3.6, is
10. [chat] <span dir="rtl">U: ۵ ÷ ۴ چند میشه؟</span> — _context:_ <span dir="rtl">adult; a plain question with two numbers</span>  
   → not a correction: nothing is changed and no «اصلاح» line appears
11. [chat] <span dir="rtl">U: ۱۰ نه، ۱۲ ساعت هم کار کنم تموم نمیشه</span> — _context:_ <span dir="rtl">adult; «X نه، Y» meaning «not even ten, even twelve hours won't do»; no datum 12 or 10 in her records</span>  
   → no correction is applied silently; at most the page asks once which number she means; nothing is marked stale
12. [chat] <span dir="rtl">U: رنگِ کاشی سفید باشه نه طوسی</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; a correction with no numbers</span>  
   → the datum changes; no number is marked stale and no proposal is made
13. [chat] <span dir="rtl">U: طولِ کف ۲٫۸ ـه نه ۲٫۴</span> — _context:_ <span dir="rtl">the same chat also holds a closed problem «میزِ ناهارخوری ۲٫۴ متر» in another record</span>  
   → the other problem's 2.4 is NOT marked stale; the correction stays inside «مسئلهٔ کاشی»
14. [chat] <span dir="rtl">U: آره، همون ۴٫۲ درسته</span> — _context:_ <span dir="rtl">«مسئلهٔ کاشی»; her acceptance of the proposal 3.6 ⇒ 4.2</span>  
   → گام ۱ becomes 4.2 with history; nothing else is re-proposed by scaling; گام ۲–۵ keep their own exact proposals
15. [chat] <span dir="rtl">U: ۵ تا خراب بود نه ۶ تا، ولی مهم نیست</span> — _context:_ <span dir="rtl">adult; «۵ … نه ۶» about broken cups that appear in no expression of the record</span>  
   → the datum is corrected (6 ⇒ 5) if a record holds it; no other record is marked; no proposal is invented

## R3.date_ask_engine · the date-ask engine and «امروز» (a yes — «بله/آره/باشه/ثبتش کن», alone or with more text — answers only the newest pending ask under the page's last reply; a yes to a non-date question books no date — C49; an ask lapses on its date or when she reports the act done, a lapsed ask is closed and never re-asked with a shifted or next-year date, and a relative day stays anchored to the day she said it — C49; a negated day is never booked, offered or used as the answer to another ask, and the day she gave instead takes the ask — C51; a ✏️ of a day or date re-derives the date and asks once, the old ask closes as «replaced», never «تاریخی ثبت نشد» — C58; written dates «yyyy/m/d» are read; idiom dates: «سرِ برج» = day 1 of the next Jalali month, «آخرِ سال» = the last day of Esfand of the current Jalali year, «عید» = 1 Farvardin, «بعد از عید» ⇒ the page asks which day, anchored on 1 Farvardin, each through «… درست است؟» — C50; one commitment makes one record, a follow-up ⏰ attaches to its 📌 — C52; no ask is raised by a count or narrative, today's own weekday, the problem's wording, the page's own schedule, a conditional, or other people's plans — C19/C35, restated in R3; «جمعهٔ بعد» on a non-Friday and «آخرِ هفته» ask with both options — C32/C33). All dates are relative to the test clock: D0 = the clock's day; weeks run Saturday–Friday; «the first ⟨weekday⟩ after D0» is computed at run time and shown in Jalali; where an entry needs a weekday or a place in the Jalali calendar its context says «clock on a Tuesday», «clock in Aban» etc. pos = the date must be asked / read / booked / closed as stated; neg = a look-alike with NO date ask (or the stated different result).


### Positive

1. [time] <span dir="rtl">[page: «📅 از حرفِ خودت: پنجشنبه ⟨D0+2⟩ — در «امروز» بیاید؛ درست است؟»] ‖ U: باشه، ولی صبح زود یادم بنداز</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; «باشه» followed by more text (A27-1 shape)</span>  
   → read as yes: the plan is booked for D0+2 (the first Thursday after D0) with one confirming line; the ask is never reported later as «بی‌جواب ماند»
2. [time] <span dir="rtl">[page: «📅 … فردا ⟨D0+1⟩ … درست است؟»] ‖ U: بله، لطفاً فردا صبح یادم بیندازید</span> — _context:_ <span dir="rtl">elder 72, register «شما»; «بله، لطفاً …» (aA3 shape)</span>  
   → yes: booked for D0+1; no repeat of the question; the ask is not reported as unanswered
3. [time] <span dir="rtl">[page: «📅 … شنبه ⟨D0+4⟩ … درست است؟»] ‖ U: ثبتش کن</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; the bare imperative</span>  
   → yes: booked for D0+4
4. [time] <span dir="rtl">[page reply 1: «📅 دندانپزشکی ⟨D0+3⟩ — درست است؟»] ‖ U: یه سؤال دیگه هم داشتم … ‖ [page reply 2: «📅 خریدِ کفش ⟨D0+5⟩ — درست است؟»] ‖ U: آره</span> — _context:_ <span dir="rtl">adult; two asks pending, the older one under an earlier reply (C49; B27·D5 «آره، ثبتش کن» booked two)</span>  
   → «آره» books ONLY the newest ask (the shoes, D0+5); the dentist ask stays pending (or lapses by its own rule); nothing is booked for D0+3 from this yes
5. [time] <span dir="rtl">U: امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست</span> — _context:_ <span dir="rtl">adult; clock on a Monday; the coming Friday negated in the same message (A27-2 shape, C51)</span>  
   → the coming Friday (D0+4) is negated, so «جمعهٔ بعد» can only be D0+11: the page asks «… ⟨D0+11⟩ — درست است؟»; D0+4 is never booked, never offered, and an earlier «امروز» line for D0+4 about the signing does not stay as her plan
6. [time] <span dir="rtl">[page, plan A: «📅 پس‌دادنِ کتاب‌ها: پنجشنبه ⟨D0+2⟩ یا جمعه ⟨D0+3⟩؟»] ‖ U: جلسه با مشاور: پنجشنبه نه، شنبه</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; a correction of plan B that negates a day while plan A's two-option ask is pending (C27-1 shape, C51)</span>  
   → plan B gets the ask «شنبه ⟨D0+4⟩ … درست است؟»; «پنجشنبه» is NOT taken as the answer to plan A's ask — plan A's question stays open; no record is booked on D0+2
7. [edit] <span dir="rtl">[page: «📅 … فردا ⟨D0+1⟩ — درست است؟» pending] ‖ [✏️ on her bubble «فردا میرم آزمایش» ⇒ «پس‌فردا میرم آزمایش»]</span> — _context:_ <span dir="rtl">adult; a ✏️ of the day while its ask is pending (A27-10 shape, C58)</span>  
   → the old ask closes as «replaced»; the page asks once «… پس‌فردا ⟨D0+2⟩ — درست است؟»; never «باشد — تاریخی ثبت نشد»; nothing booked before her yes
8. [edit] <span dir="rtl">[booked: «📌 تحویلِ مدارک — جمعه ⟨D0+6⟩»] ‖ [✏️ on her bubble «جمعه تحویل میدم» ⇒ «پنجشنبه تحویل میدم»]</span> — _context:_ <span dir="rtl">adult; clock on a Saturday; a ✏️ of the day after booking (B27·D10 regression: the old day was booked without her yes)</span>  
   → the page re-derives and asks once «پنجشنبه ⟨D0+5⟩ … درست است؟»; the Friday booking is closed as «replaced» (kept in history); the old day is never re-booked «به گفتهٔ خودت» and the new one is booked only on her yes
9. [time] <span dir="rtl">U: فردا صبح میرم آزمایش ‖ [asked, yes ⇒ 📌 ⟨D0+1⟩] ‖ U: فردا نه، پس‌فردا ‖ [page asks ⟨D0+2⟩] ‖ U: آره</span> — _context:_ <span dir="rtl">adult; a corrected relative day after booking (D27-21 shape)</span>  
   → the 📌 moves to D0+2 with history; «انجام شد؟» is asked on D0+2, never on D0+1; D0+1 (negated) is not kept as a second due date
10. [time] <span dir="rtl">[page: «📅 … ⟨D0+2⟩ — درست است؟»; no answer] ‖ [clock → D0+3] ‖ U: سلام</span> — _context:_ <span dir="rtl">adult; an ask whose date has passed unanswered (C27-11, B27·D5, D27-22)</span>  
   → the ask is closed as lapsed (one honest line at most); it is NEVER re-asked with a shifted date (D0+3, D0+9 …) or the same day next year; nothing is booked
11. [time] <span dir="rtl">U: فردا صبح زنگ می‌زنم به لوله‌کش ‖ [page asks ⟨D0+1⟩] ‖ [clock → D0+1] ‖ U: صبح بخیر</span> — _context:_ <span dir="rtl">adult; a relative day anchored to the day she said it (A27-19 shape: the ask drifted to the next day)</span>  
   → the pending ask still names D0+1 (which is now today); it never becomes D0+2; if it lapses, it lapses on D0+1 by its own rule
12. [time] <span dir="rtl">U: فردا صبح زنگ می‌زنم به لوله‌کش ‖ [page asks ⟨D0+1⟩] ‖ [clock → D0+1] ‖ U: زنگ زدم، گفت پس‌فردا میاد</span> — _context:_ <span dir="rtl">adult; the act reported done; another person's plan in the same message</span>  
   → her ask is closed as done (no «امروز» line asks it again); «پس‌فردا میاد» is the plumber's plan and raises no ask (C19); nothing is booked
13. [time] <span dir="rtl">U: کفشِ مدرسه رو پنجشنبه می‌خریم ‖ [asked ⟨D0+2⟩, no answer yet] ‖ U: خریدیم!</span> — _context:_ <span dir="rtl">adult, parent; clock on a Tuesday; done before the date (C27-5 shape)</span>  
   → the ask closes as done; «امروز» no longer shows «⟨D0+2⟩ — هنوز تأیید نشده؛ درست است؟»
14. [time] <span dir="rtl">U: ⟨D0+12, written yyyy/m/d⟩ وام رو تسویه می‌کنم</span> — _context:_ <span dir="rtl">adult; a written Jalali date in Persian digits (D27-4 shape: «در حرفِ خودت تاریخی نخواندم»)</span>  
   → the page reads the date and asks «… ⟨D0+12⟩ — درست است؟»; never «در حرفِ خودت تاریخی نخواندم»; the date is not read as arithmetic
15. [time] <span dir="rtl">U: تا ⟨D0+9, written yyyy/m/d in Latin digits⟩ پروژه رو می‌فرستم</span> — _context:_ <span dir="rtl">adult; a written date in Latin digits with «تا»</span>  
   → read as her own deadline (C34): asked «… ⟨D0+9⟩ — درست است؟»
16. [time] <span dir="rtl">U: سرِ برج اجاره رو می‌ریزم</span> — _context:_ <span dir="rtl">adult; clock in the middle of a Jalali month (C50; D27-32 shape)</span>  
   → «سرِ برج» = day 1 of the Jalali month after D0's month; the page asks «📅 … ⟨that day⟩ — درست است؟» and books on her yes
17. [time] <span dir="rtl">U: سر برج حتما قبضارو میدم</span> — _context:_ <span dir="rtl">adult; no ezafe, ZWNJ missing in «قبضارو»</span>  
   → read like «سرِ برج»: day 1 of the next Jalali month, through «… درست است؟»
18. [time] <span dir="rtl">U: آخرِ سال حسابِ صندوق رو می‌بندم</span> — _context:_ <span dir="rtl">adult; clock in Aban (C50)</span>  
   → «آخرِ سال» = the last day of Esfand of D0's Jalali year; asked through «… درست است؟»
19. [time] <span dir="rtl">U: عید میرم دیدنِ مادربزرگم</span> — _context:_ <span dir="rtl">teen 16; clock in Azar (C50)</span>  
   → «عید» = 1 Farvardin after D0; asked «… ⟨1 Farvardin⟩ — درست است؟»; booked only on her yes
20. [time] <span dir="rtl">U: بعد از عید ثبت‌نامِ کلاسِ شنا می‌کنم</span> — _context:_ <span dir="rtl">adult; clock in Dey (C50)</span>  
   → the page asks which day, anchored on 1 Farvardin after D0 (it may offer the days after it); nothing is booked until she names one; never booked silently on 1 Farvardin
21. [time] <span dir="rtl">U: قسطِ آخرو سرِ برج میدم، بقیهٔ پولو تا آخرِ سال، کاشی‌کاری هم بعد از عید</span> — _context:_ <span dir="rtl">adult; clock in Aban; three idiom dates in one message (D27-32: three dated plans lost silently — S2)</span>  
   → none is lost: «سرِ برج» ⇒ day 1 of the next Jalali month, «آخرِ سال» ⇒ the last day of Esfand of D0's year, each with «… درست است؟»; «بعد از عید» ⇒ the page asks which day; nothing is booked before her answers; all three appear in «امروز» as pending asks
22. [time] <span dir="rtl">[page: «📅 پس‌دادنِ کتاب: جمعه ⟨D0+3⟩ — درست است؟»] ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; one commitment (C52; C27-17: «📌 برنامه» and «⏰ پیگیری» both created)</span>  
   → ONE record: the 📌 plan with its ⏰ follow-up attached; no second «⏰ پیگیری» item for the same act in «امروز» or 📜
23. [time] <span dir="rtl">U: جمعهٔ بعد میرم کوه</span> — _context:_ <span dir="rtl">adult; clock on a FRIDAY (C1/C32)</span>  
   → read as D0+7, asked «… درست است؟»
24. [time] <span dir="rtl">U: جمعه‌ی بعد میرم کوه</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday (C32)</span>  
   → the page asks which Friday, offering D0+2 and D0+9; nothing booked until she answers
25. [time] <span dir="rtl">U: آخرِ هفته کمد رو مرتب می‌کنم</span> — _context:_ <span dir="rtl">adult; clock on a Saturday (C33)</span>  
   → the page asks which day, offering Thursday D0+5 and Friday D0+6
26. [time] <span dir="rtl">[page: «📅 … ⟨D0+1⟩ — درست است؟»] ‖ [clock → D0+2] ‖ U: آره</span> — _context:_ <span dir="rtl">adult; her yes arrives after the asked day has passed (C49 lapse)</span>  
   → nothing is booked for the past day D0+1; the page says once that the date has passed; it does not invent a new date from this yes
27. [time] <span dir="rtl">U: تا بیستم باید گزارش رو تحویل بدم</span> — _context:_ <span dir="rtl">adult; clock on the 5th of a Jalali month (C34)</span>  
   → her own deadline: the page asks «… بیستمِ همین ماه ⟨D0+15⟩ — درست است؟»
28. [time] <span dir="rtl">[page: «📅 … پنجشنبه ⟨D0+2⟩ یا جمعه ⟨D0+3⟩؟»] ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; a yes to a two-option question</span>  
   → «باشه» chooses neither: nothing is booked; the page asks once more which of the two
29. [time] <span dir="rtl">U: جلسه با مشاور: پنجشنبه نه، شنبه ‖ [asked ⟨D0+4⟩, yes] ‖ … ‖ [page later suggests a day for the follow-up]</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; a negated day later in the same thread (C51)</span>  
   → Thursday D0+2 is never offered back for this plan or its follow-up
30. [edit] <span dir="rtl">[page: «📅 … ⟨D0+12⟩ — درست است؟» pending] ‖ [✏️ on her bubble: the written date ⟨D0+12⟩ ⇒ ⟨D0+14⟩]</span> — _context:_ <span dir="rtl">adult; a ✏️ of a written date (C58)</span>  
   → the old ask closes as «replaced»; one new ask for D0+14; never «تاریخی ثبت نشد»

### Negative (look-alike)

1. [time] <span dir="rtl">U: دو روزه دارم روش کار می‌کنم</span> — _context:_ <span dir="rtl">adult; a count of days (R3 forbidden trigger)</span>  
   → no date ask; nothing in «امروز»
2. [time] <span dir="rtl">U: سلام، امتحانای بچه‌ها هفته‌ی بعده، خونه خیلی شلوغه</span> — _context:_ <span dir="rtl">adult; a greeting narrative about other people's week (B27·D1)</span>  
   → no date ask, no «بی‌جواب ماند» line, no «امروز» line
3. [time] <span dir="rtl">U: پنجشنبه‌ست، خیلی خسته‌ام</span> — _context:_ <span dir="rtl">adult; clock on a Thursday; today's own weekday (A27-17)</span>  
   → no ask «همین امروز یا پنجشنبهٔ بعد؟»; nothing booked
4. [time] <span dir="rtl">U: اگه قیمتِ ماهِ بعد ۱۰ درصد بره بالا، چقدر باید بدم؟</span> — _context:_ <span dir="rtl">adult; the problem's own wording (A27-15)</span>  
   → no date ask; the problem is not given a deadline
5. [time] <span dir="rtl">U: ولی موعدِ بعدی رو سه هفته بعد گذاشتی</span> — _context:_ <span dir="rtl">adult, practice dossier; a remark about the page's own schedule (D27-29)</span>  
   → no «📅 از حرفِ خودت …» ask
6. [time] <span dir="rtl">U: اگه اولی رو زودتر شروع کنم، شاید جمعه تموم شه</span> — _context:_ <span dir="rtl">adult; a conditional (A27-20, C35)</span>  
   → nothing booked, nothing asked; no «📌 برنامهٔ خودت» line
7. [time] <span dir="rtl">U: دومی! اگه با یه سنسور نشه، کلِ ایده می‌خوابه</span> — _context:_ <span dir="rtl">adult; a conditional opinion (C27-27)</span>  
   → no «📌 برنامهٔ خودت — قولِ بی‌تاریخ»
8. [time] <span dir="rtl">U: کلاسِ رباتیکش فقط سه‌شنبه‌هاست</span> — _context:_ <span dir="rtl">adult, parent; another person's schedule (D26-1)</span>  
   → no date ask
9. [time] <span dir="rtl">[page: «این را به‌عنوانِ مسئلهٔ تازه ثبت کنم؟»] ‖ U: آره ثبتش کن</span> — _context:_ <span dir="rtl">adult; an earlier date ask is still pending (A27-15)</span>  
   → the problem is registered; the yes books NO date — the pending date ask is not under the page's last reply
10. [time] <span dir="rtl">[reply 1: «📅 … ⟨D0+3⟩ — درست است؟»] ‖ U: … ‖ [reply 2, the coach: «یه مثال بزنم؟»] ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; the newest question is not a date question (C49)</span>  
   → «باشه» answers the coach; nothing is booked for D0+3
11. [time] <span dir="rtl">U: دیروز رفتم بانک</span> — _context:_ <span dir="rtl">adult; past tense</span>  
   → no date ask
12. [time] <span dir="rtl">U: یکشنبه با همسایه‌ها جلسه می‌ذارم ‖ [asked; lapsed] ‖ [clock → D0+20] ‖ U: یه مسئلهٔ تازه دارم</span> — _context:_ <span dir="rtl">adult; an old plan sentence days later (D27-22: re-asked with fresh dates)</span>  
   → no new ask about that Sunday; the old sentence is not re-parsed against the new day
13. [time] <span dir="rtl">U: این جمعه نه</span> — _context:_ <span dir="rtl">adult; clock on a Monday; a negated day alone</span>  
   → nothing is booked for D0+4; no ask offers D0+4
14. [time] <span dir="rtl">U: مامانم سرِ برج حقوق می‌گیره</span> — _context:_ <span dir="rtl">adult; an idiom date in another person's fact (C19)</span>  
   → no ask
15. [time] <span dir="rtl">U: عیدِ پارسال رفتیم شمال</span> — _context:_ <span dir="rtl">adult; «عید» in a past narrative</span>  
   → no ask
16. [time] <span dir="rtl">U: رفتیم سرِ برجِ میلاد، خیلی باد میومد</span> — _context:_ <span dir="rtl">teen 14; «سرِ برج» meaning the top of a tower</span>  
   → no date; nothing in «امروز»
17. [time] <span dir="rtl">U: عیدیِ بچه‌ها رو کنار گذاشتم</span> — _context:_ <span dir="rtl">adult; «عیدی» (a gift), not a date</span>  
   → no ask
18. [time] <span dir="rtl">U: ⟨D0−20, written yyyy/m/d⟩ قسطِ قبلی رو دادم</span> — _context:_ <span dir="rtl">adult; a written past date</span>  
   → no ask; nothing booked
19. [time] <span dir="rtl">U: یه کلاس سه‌شنبه‌ها و پنجشنبه‌ها تشکیل میشه؛ توی ۱۰ هفته چند جلسه میشه؟</span> — _context:_ <span dir="rtl">teen 15; weekdays inside a word problem (C19, owner bank 48)</span>  
   → no date ask
20. [time] <span dir="rtl">U: من ۱۳۸۸ به دنیا اومدم</span> — _context:_ <span dir="rtl">teen 17; a birth sentence</span>  
   → no ask
21. [time] <span dir="rtl">U: معلمش گفت فردا امتحان دارن</span> — _context:_ <span dir="rtl">adult, parent; another person's words</span>  
   → no ask

## R4.prior_work · prior work, a45 (a worked step at the OPENING — even one relation with a computed value, or «خودم حساب کردم» plus a relation — fires C7 — C56; every later report merges into the ledger, before or after closure, and never replaces it — C56; a hypothetical question about her work («اگه … بود چی؟», «یعنی اینم درسته؟») is neither a dispute nor a correction: the ledger does not change and the coach answers — C46; a re-check always recomputes and moves a verdict to ✓ only when the exact value equals hers under C9/C16 — C46; a dispute by meaning is read as a dispute; the stage moves forward when she reports her result; in 📜 a ledger step keeps its kind — never «برنامه», and a sticking point never «حدس»; a fixed step drops its old reason; the resume question never asks for a piece she already reported). Base problem — «مسئلهٔ تمرینِ دوچرخه» (teen 16): opening ledger گام ۱ «هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور» ✓ · گام ۲ «۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه» (1800 s = 30 min) ✗ unit · گام ۳ «پس با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه» depends on گام ۲. pos = the ledger must behave as stated; neg = a look-alike that must not fire / must not change it.


### Positive

1. [chat] <span dir="rtl">U: کاشی‌ها رو خودم شمردم: ۱۲ ردیف × ۱۸ = ۲۱۶ تا. حالا چند کارتن بخرم؟</span> — _context:_ <span dir="rtl">adult; a new chat opened with ONE worked step (C56; A27-13 / C25-7 shape)</span>  
   → C7 fires: «کارِ پیشینِ تو» with گام ۱ ✓ (12 × 18 = 216, read by the page); resume at the next step; the step is not asked again
2. [chat] <span dir="rtl">U: خودم حساب کردم: محیطِ زمین ۲ × (۴۰ + ۲۵) = ۱۳۰ متره. نرده‌ش چقدر درمیاد؟</span> — _context:_ <span dir="rtl">adult; «خودم حساب کردم» plus one computed relation</span>  
   → C7 fires; گام ۱ ✓ (2 × 65 = 130); resume at the cost step
3. [chat] <span dir="rtl">U: نصفِ محیط میشه طول + عرض = ۲۲ سانت. طول سه برابرِ عرضه؛ از اینجا گیر کردم</span> — _context:_ <span dir="rtl">teen 14; one relation with a computed value and a sticking point (B27·D3 shape)</span>  
   → C7 fires: گام ۱ (the half-perimeter relation) is a step, the sticking point is recorded as «گیر», resume there; the step is not presented as a mere datum
4. [chat] <span dir="rtl">U: سرعتِ متوسطِ رفت و برگشت رو حساب کردم: (۶۰ + ۹۰) ÷ ۲ = ۷۵</span> — _context:_ <span dir="rtl">adult; one step at opening whose arithmetic is right but whose method is wrong for equal distances</span>  
   → C7 fires; the page reads 150 ÷ 2 = 75 as OK arithmetic, while the step's verdict comes from the coach's validated check (the honest boundary of §21: the page guarantees the number, not the method); the ledger does not show the step ✓ merely because the division is right
5. [chat] <span dir="rtl">U: سرور ۳۰۰ درخواست در دقیقه می‌گیره × ۶۰ = ۱۸۰۰۰ در ساعت. ظرفیت کافیه؟</span> — _context:_ <span dir="rtl">adult, a new chat with one worked step (A27-13: neither block came)</span>  
   → both blocks: C7 fires with گام ۱, and the arithmetic block reads 300 × 60 = 18000 as OK; the reader's result reaches the coach
6. [chat] <span dir="rtl">U: I computed it myself: 48 / 6 = 8 قفسه، هر قفسه ۸ تا جعبه</span> — _context:_ <span dir="rtl">adult; Latin words and digits at the opening, Persian unit words</span>  
   → C7 fires; گام ۱ ✓ (48 ÷ 6 = 8)
7. [chat] <span dir="rtl">U: من تا نصفش رفتم: ۲۴ تا شیرینی رو ۳ تا ۳ تا گذاشتم شد ۸ بسته</span> — _context:_ <span dir="rtl">child 10; a half-done word problem (§21 scenario «کودکی که مسئلهٔ کلامی را تا نیمه حل کرده»)</span>  
   → C7 fires in child register; the step is credited; arithmetic NOT-FLAG (24 ÷ 3 = 8)
8. [chat] <span dir="rtl">[ledger گام ۱–۳ above] ‖ U: اگه هر دور ۱۰ ثانیه بود چی؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; S1 family (D27-2 shape): a hypothetical question (C46)</span>  
   → not a dispute and not a correction: the ledger is unchanged, گام ۲ stays ✗, no re-check line; the coach answers the hypothetical
9. [chat] <span dir="rtl">[ledger above] ‖ U: یعنی ۱۸ دقیقه هم درسته؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; S1 family: «یعنی اینم درسته؟» (C46)</span>  
   → the ledger is unchanged; if anything is re-checked it is a recomputation: 1800 seconds = 30 minutes ≠ 18, so گام ۲ stays ✗; never «۱۸۰۰ ثانیه = ۱۸ دقیقه … درست، ✗ پیشین خطای صفحه»
10. [chat] <span dir="rtl">[ledger above] ‖ U: نه، من مطمئنم ۱۸۰۰ ثانیه همون ۱۸ دقیقه‌ست</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; S1 family: an explicit dispute of a true ✗ (C29, C46)</span>  
   → the page re-checks once by recomputation; گام ۲ stays ✗; it says it re-checked and points at the seconds-to-minutes part without giving the right number; the dispute question is not asked again
11. [chat] <span dir="rtl">[ledger above; the model's coach_state after her dispute says گام ۲ «ok»] ‖ U: پس درسته دیگه؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; S1 family: the re-check must not trust the model (C46)</span>  
   → the page recomputes; 1800 s ≠ 18 min, so the page keeps ✗ and does not pass «درست» to her or to the coach
12. [chat] <span dir="rtl">[ledger: گام ۱ «معیارها: قیمت، فاصله تا محلِ کار، مدرسهٔ بچه‌ها» ⚠️ ناقص (the parents' care is missing)] ‖ U: ولی پدر و مادرم رو تو همون «فاصله» حساب کرده بودم</span> — _context:_ <span dir="rtl">adult, a city-move decision; a dispute by meaning, with no word «اشتباه» (D26-11)</span>  
   → read as a dispute of گام ۱: one re-check (by the coach's validated step), the verdict shown with its reason; never ignored as small talk
13. [chat] <span dir="rtl">[ledger with 3 steps, problem solved and closed] ‖ U: یه چیزِ دیگه هم حساب کرده بودم: ۴۸ ÷ ۶ = ۸ قفسه</span> — _context:_ <span dir="rtl">adult; a later report after closure (C56)</span>  
   → merged as گام ۴ with its verdict (OK); گام ۱–۳ keep their numbers and history; the closed problem stays closed
14. [chat] <span dir="rtl">[ledger with 5 steps; a second report already merged as 6–9; closed] ‖ U: کلِ اثبات رو از اول نوشتم: …</span> — _context:_ <span dir="rtl">teen 17, a proof; the third report after closure (A27-21: the ledger was replaced)</span>  
   → merged: new or changed steps get numbers from 10 on or are marked as updates of their own step with history; nothing is renumbered, nothing is dropped, no new prior-work block replaces the ledger
15. [chat] <span dir="rtl">[ledger above] ‖ U: درستش ۳۰ دقیقه‌ست، اشتباه تبدیل کرده بودم</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; her own fix that the page's check agrees with (C8)</span>  
   → گام ۲ becomes ✓ in the same turn with history («۱۸ ⇐»); گام ۳ is marked stale as a dependant
16. [chat] <span dir="rtl">U: جواب شد عرض ۵٫۵ و طول ۱۶٫۵ سانت؛ گذاشتم تو معادله، جور درومد</span> — _context:_ <span dir="rtl">teen 14, after the opening above; her result and her check (B27·D2)</span>  
   → the stage moves forward (to the look-back); the strip no longer says «فهمِ مسئله»; 5.5 + 16.5 = 22 and 16.5 = 3 × 5.5 are both OK
17. [page] <span dir="rtl">U: کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا. گیرِ من اینجاست که n = 73 جور درنمیاد</span> — _context:_ <span dir="rtl">teen 17, an opening with a planned method and a sticking point (D27-15)</span>  
   → in 📜, the first sentence is shown as «کارِ پیشین · گام ۱», never as «برنامهٔ خودت (موعد: …)»; the sticking point is shown as «گیر», never as «حدس · آزموده نشده»
18. [prompt] <span dir="rtl">[ledger: گام ۲ «توانِ پمپ = ۱۲۰۰ وات» ✗ fixed by her to 1360 ✓] ‖ U: خب، حالا گام ۳؟</span> — _context:_ <span dir="rtl">adult engineer; a fixed step keeps its old reason (C27-21)</span>  
   → the turn question no longer says گام ۳ rests on «۱۲۰۰ واتِ ناقصِ گامِ ۲»; the old reason stays only in history
19. [prompt] <span dir="rtl">[ledger waits on «افتِ فشار»] ‖ U: افتِ فشار رو هم حساب کردم: ۰٫۸ بار</span> — _context:_ <span dir="rtl">adult engineer; the third report supplies the missing piece (C27-24)</span>  
   → the piece is merged; the resume question never says «افتِ فشار هنوز حساب نشده»
20. [chat] <span dir="rtl">[after her dispute of گام ۲, the page re-checked and kept ✗] ‖ U: نه ببخشید، حق با تو بود</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; take-back of her own dispute (C5, T5)</span>  
   → the dispute is closed with history («رد ⇒ پس گرفته شد»); گام ۲ stays ✗ awaiting her fix
21. [chat] <span dir="rtl">U: خودم یه کم رفتم جلو: x + 2x = 36 پس x = 12</span> — _context:_ <span dir="rtl">teen 15; «خودم … رفتم جلو» + an equation with its solved value</span>  
   → C7 fires; گام ۱ is a step (the equation lies outside the reader, the coach checks it); resume at the next step

### Negative (look-alike)

1. [chat] <span dir="rtl">U: یه باغچه ۸ در ۵ متر دارم؛ چند تا بوته جا میشه؟</span> — _context:_ <span dir="rtl">adult; a bare problem statement with numbers, no worked step (C7 last clause)</span>  
   → no prior-work block; the problem opens normally
2. [chat] <span dir="rtl">[mid-session, problem already open] ‖ U: ۱۲ × ۱۸ = ۲۱۶</span> — _context:_ <span dir="rtl">adult; a computation mid-session (T12 negative)</span>  
   → no prior-work block; the arithmetic block reads it OK
3. [chat] <span dir="rtl">U: طولِ زمین دو برابرِ عرضشه و کلِ نرده ۹۰ متره</span> — _context:_ <span dir="rtl">adult; given relations with no value computed by her</span>  
   → no C7: these are data of the problem, not a worked step
4. [chat] <span dir="rtl">U: معلممون گفت ۲ × ۳۶ = ۷۲، حالا من باید بقیه‌ش رو حل کنم</span> — _context:_ <span dir="rtl">teen 13; another person's arithmetic at the opening (C57)</span>  
   → no prior-work block in her name; the line is filed as «کارِ دیگری» (checked: 2 × 36 = 72 OK) and never booked as her step
5. [chat] <span dir="rtl">U: ۱۲ × ۱۸ چند میشه؟</span> — _context:_ <span dir="rtl">adult; a question at the opening</span>  
   → no C7
6. [chat] <span dir="rtl">U: اول می‌خوام محیط رو حساب کنم، بعد مساحت</span> — _context:_ <span dir="rtl">adult; a plan only</span>  
   → no C7: a plan, not a worked step; booked as her plan if anything
7. [chat] <span dir="rtl">U: سلام، من ۱۴ سالمه و از ریاضی می‌ترسم</span> — _context:_ <span dir="rtl">teen 14; greeting and age</span>  
   → no C7, no step
8. [chat] <span dir="rtl">[ledger above] ‖ U: مطمئنی غلطه؟ من دوباره حساب کردم همون ۱۸ شد</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; a dispute phrased as a question — the confusable of C46</span>  
   → read as a dispute (she says she recomputed and insists): one re-check, ✗ stays; not treated as a hypothetical
9. [chat] <span dir="rtl">[ledger above] ‖ U: درستش ۲۵ دقیقه‌ست</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; her fix that the page's check does not agree with (C8)</span>  
   → not applied: گام ۲ stays ✗; the page says its check does not agree and asks (C8, C29)
10. [chat] <span dir="rtl">U: ۸ تا رو تو ذهنم شمردم و فکر کنم درسته</span> — _context:_ <span dir="rtl">teen 13, after her own enumeration in the same message (C27-3)</span>  
   → not stored as a guess «هنوز آزموده نشده»; it is her checked result (or the page asks how she checked); the text is not clipped
11. [chat] <span dir="rtl">[a practice card «۷ × ۸ = ?»] ‖ U: ۵۶</span> — _context:_ <span dir="rtl">adult; a mastery answer</span>  
   → no prior-work block
12. [chat] <span dir="rtl">[ledger with 3 steps] ‖ U: همون سه تا گامی که گفتم</span> — _context:_ <span dir="rtl">adult; a restatement with no new step</span>  
   → nothing is merged twice; no duplicate steps
13. [chat] <span dir="rtl">[ledger above] ‖ U: اگه دور ۱۴۰ ثانیه بود، ۱۲ دور میشه ۱۶۸۰ ثانیه دیگه؟</span> — _context:_ <span dir="rtl">«مسئلهٔ تمرینِ دوچرخه»; a hypothetical whose arithmetic is right</span>  
   → the ledger does not change (C46); the reader may read 140 × 12 = 1680 OK; گام ۲'s ✗ (the minutes) stays
14. [chat] <span dir="rtl">U: بابام حساب کرده ۱۵ میلیون کم داریم</span> — _context:_ <span dir="rtl">adult; another person's result at the opening</span>  
   → no C7 in her name; «کارِ دیگری»

## R5.forecast · forecasts 🎯 (any number of confidence attached to a FUTURE outcome — «N درصد مطمئنم», «احتمالش N٪ه», a number in words, «پنجاه‌پنجاه» — creates a 🎯 at once, under the live problem — C53/C37; vague words make no number and the page asks her number once — C37; a clearly reported outcome that matches exactly one open 🎯 settles it, and if two could match the page asks «کدام؟» — C53; «حل شد» settles only a 🎯 about solving; the 🎯 text excludes a glued counter word; a 🎯 is filed in its own problem's 📜; a settled 🎯 is no longer asked «شد یا نشد؟»). The round-27 groups disagreed on which phrasings fail (A and arD2 pass; B, C and pwD2 fail), so this family varies the phrasing widely. pos = the 🎯 behaviour stated; neg = a look-alike that must not create, settle or change a 🎯.


### Positive

1. [events] <span dir="rtl">U: ۷۰ درصد مطمئنم تا آخرِ ماه کار پیدا می‌کنم</span> — _context:_ <span dir="rtl">adult, a job search is the live problem (C53)</span>  
   → a 🎯 is created at once under the live problem: «کار پیدا می‌کنم» 70٪; its deadline «آخرِ ماه» = the last day of D0's Jalali month through «… درست است؟» (C37); nothing waits for the outcome to open it
2. [events] <span dir="rtl">U: احتمالش ۴۰٪ ـه که بورسیه رو بگیرم</span> — _context:_ <span dir="rtl">teen 17; «احتمالش N٪ه» (C53)</span>  
   → a 🎯 40٪ «بورسیه رو بگیرم» under the live problem; no deadline is invented (the page may ask for one)
3. [events] <span dir="rtl">U: هشتاد درصد مطمئنم این هفته سه شب قبل از ۱۱ می‌خوابم</span> — _context:_ <span dir="rtl">adult, sleep practice dossier live (U49 shape: no 🎯 at statement)</span>  
   → a 🎯 80٪ at statement, under the live practice/problem; not only when the outcome comes
4. [events] <span dir="rtl">U: پنجاه‌پنجاه‌ه که مشتری قبول کنه</span> — _context:_ <span dir="rtl">adult; «پنجاه‌پنجاه» glued with «ه» (C37)</span>  
   → a 🎯 50٪ «مشتری قبول کنه»
5. [events] <span dir="rtl">U: 85% مطمئنم که فردا بارون نمیاد و می‌تونیم بریم</span> — _context:_ <span dir="rtl">adult; Latin digits and the Latin percent sign</span>  
   → a 🎯 85٪; deadline «فردا» = D0+1 through «… درست است؟»
6. [events] <span dir="rtl">U: مطمئنم، نود درصد، که پروژه تا جمعه تحویل میشه</span> — _context:_ <span dir="rtl">adult; the number after «مطمئنم», between commas; clock on a Tuesday</span>  
   → a 🎯 90٪ «پروژه تا جمعه تحویل میشه», deadline D0+3 through «… درست است؟»
7. [events] <span dir="rtl">U: احتمالش ۳۰ درصده که امسال قبول شم</span> — _context:_ <span dir="rtl">teen 17; ZWNJ missing («درصده»)</span>  
   → a 🎯 30٪
8. [events] <span dir="rtl">U: یک: حصار تا آخرِ آبان تموم میشه، هفتاد درصد مطمئنم. دو: هزینه زیرِ ۴۰ میلیون می‌مونه، شصت درصد</span> — _context:_ <span dir="rtl">adult; clock in Aban; two forecasts with spoken counters (D27-31: the text kept a glued «دو»)</span>  
   → two 🎯: «حصار تا آخرِ آبان تموم میشه» 70٪ and «هزینه زیرِ ۴۰ میلیون می‌مونه» 60٪; neither text contains the counter «یک» or «دو»; deadlines through «… درست است؟»
9. [events] <span dir="rtl">[two open 🎯: «مدیرم درخواستِ مرخصی رو تأیید می‌کنه» 60٪ and «پاداشِ آخرِ سال می‌گیرم» 40٪] ‖ U: مدیرم امروز درخواستمو تأیید کرد</span> — _context:_ <span dir="rtl">adult; a clear outcome matching exactly one (A27-11)</span>  
   → the leave 🎯 is settled «شد — به گفتهٔ خودت» at once; the bonus 🎯 stays open; on its deadline «امروز» does not ask «شد یا نشد؟» about the settled one
10. [events] <span dir="rtl">[the same two open 🎯] ‖ U: خبرِ خوب: درست درومد!</span> — _context:_ <span dir="rtl">adult; an outcome that could match either (C53)</span>  
   → the page asks «🎯 کدام پیش‌بینی؟» naming both; nothing is settled before her answer
11. [events] <span dir="rtl">[open 🎯 «زمانِ دویدنم ۱۵ درصد بهتر میشه» 60٪] ‖ U: به نظرم این دیگه حل شد</span> — _context:_ <span dir="rtl">adult; «حل شد» against a 🎯 not about solving (D27-13)</span>  
   → the 🎯 is NOT settled by «حل شد»; the mind card counts nothing as «came true»; the 🎯 stays open until an outcome about the time is reported
12. [events] <span dir="rtl">[open 🎯 «بیشتر از ۱۲ کیلو گوجه برداشت می‌کنم» 65٪] ‖ U: برداشتم شد ۱۴ کیلو</span> — _context:_ <span dir="rtl">adult, a garden; an outcome given as a number</span>  
   → settled «شد» — 14 > 12; the reported value is kept beside the verdict
13. [events] <span dir="rtl">[open 🎯 «قبول میشم» 70٪] ‖ U: قبول نشدم</span> — _context:_ <span dir="rtl">teen 18; a negative outcome</span>  
   → settled «نشد»; the mind card's calibration counts a 70٪ forecast that did not come true
14. [events] <span dir="rtl">U: فکر کنم قبول شم ‖ [page asks her number once (C37)] ‖ U: شصت</span> — _context:_ <span dir="rtl">teen 17; vague first, a bare number after the page's question</span>  
   → a 🎯 60٪ «قبول شم» is created after her number; before it, no 🎯 with an invented number
15. [page] <span dir="rtl">[problem B «حدسِ تقسیم‌پذیری» live] ‖ U: هفتاد درصد مطمئنم برای n تا ۱۰۰۰ هم جواب میده</span> — _context:_ <span dir="rtl">teen 17; two problems in the session (D27-14, A27-12)</span>  
   → the 🎯 is filed under problem B and appears in B's 📜; it is not under a phantom session problem and not under problem A
16. [events] <span dir="rtl">U: احتمالِ اینکه تا عید وام جور شه رو ۲۰ درصد می‌دونم</span> — _context:_ <span dir="rtl">adult; clock in Azar; «تا عید» deadline</span>  
   → a 🎯 20٪; deadline 1 Farvardin after D0 through «… درست است؟» (C50)
17. [events] <span dir="rtl">[open 🎯 «تا جمعه ۵ کیلومتر می‌دوم» 50٪; clock on a Tuesday] ‖ U: امروز ۵ کیلومتر رو دویدم!</span> — _context:_ <span dir="rtl">adult; the outcome before the deadline (A27-11: still asked on Friday)</span>  
   → settled «شد» on D0; on D0+3 «امروز» does not ask «شد یا نشد؟»
18. [events] <span dir="rtl">U: نود و پنج درصد مطمئنم که رئیس با طرحم مخالفت می‌کنه</span> — _context:_ <span dir="rtl">adult; a number in words above 90</span>  
   → a 🎯 95٪ «رئیس با طرحم مخالفت می‌کنه» (the forecast of a negative event is still a forecast)
19. [events] <span dir="rtl">[open 🎯 «فروشِ این ماه بالای ۳۰۰ تا میشه» 55٪] ‖ U: این ماه ۲۸۰ تا فروختیم</span> — _context:_ <span dir="rtl">adult; a numeric outcome below the threshold</span>  
   → settled «نشد» (280 < 300)
20. [events] <span dir="rtl">[open 🎯 on problem A «لوله‌کش تا شنبه میاد» 80٪; problem B live] ‖ U: راستی لوله‌کش اومد</span> — _context:_ <span dir="rtl">adult; the outcome of problem A's 🎯 while B is live</span>  
   → problem A's 🎯 is settled «شد»; the line goes to A's 📜, not B's

### Negative (look-alike)

1. [events] <span dir="rtl">U: ۸۰ درصدِ بودجه رو خرج کردم</span> — _context:_ <span dir="rtl">adult; a percentage of an amount, not confidence</span>  
   → no 🎯
2. [events] <span dir="rtl">U: این کفش ۳۰ درصد تخفیف داره</span> — _context:_ <span dir="rtl">adult; a discount</span>  
   → no 🎯
3. [events] <span dir="rtl">U: احتمالاً فردا میام</span> — _context:_ <span dir="rtl">adult; a vague word (C37)</span>  
   → no 🎯 with a number; at most the page asks her number once; nothing settled or invented
4. [events] <span dir="rtl">U: ۹۰ درصد مطمئنم دیروز درِ خونه رو قفل کردم</span> — _context:_ <span dir="rtl">adult; confidence about a PAST fact</span>  
   → no 🎯 (not a future outcome)
5. [events] <span dir="rtl">U: یاد گرفتم ۷۰ درصدِ وقتا عجله می‌کنم</span> — _context:_ <span dir="rtl">adult; a lesson with a percentage</span>  
   → no 🎯; booked as a lesson if anything
6. [events] <span dir="rtl">U: احتمالِ اینکه جمعِ دو تاس ۷ بشه ۱/۶ ـه</span> — _context:_ <span dir="rtl">teen 16; a probability inside the math problem</span>  
   → no 🎯; the problem's content is not her forecast
7. [events] <span dir="rtl">U: ۱۰۰ درصد موافقم</span> — _context:_ <span dir="rtl">adult; agreement, not a forecast</span>  
   → no 🎯
8. [events] <span dir="rtl">U: ۷۰ درصدِ سؤالا رو درست زدم</span> — _context:_ <span dir="rtl">teen 15; a past score</span>  
   → no 🎯
9. [events] <span dir="rtl">U: دو تا مشتریِ تازه قبول می‌کنن، هفتاد درصد مطمئنم</span> — _context:_ <span dir="rtl">adult; «دو» here is part of the content, not a counter</span>  
   → one 🎯 70٪ whose text keeps «دو تا مشتریِ تازه قبول می‌کنن»; the word «دو» is not stripped
10. [events] <span dir="rtl">[open 🎯 «مدیرم درخواستِ مرخصی رو تأیید می‌کنه» 60٪] ‖ U: امروز ناهار رو با همکارا خوردیم</span> — _context:_ <span dir="rtl">adult; an unrelated report</span>  
   → no 🎯 is settled; no «کدام؟» question
11. [events] <span dir="rtl">[open 🎯 «تا جمعه ۵ کیلومتر می‌دوم» 50٪] ‖ U: هشتاد درصد مطمئنم تا جمعه ۵ کیلومتر می‌دوم</span> — _context:_ <span dir="rtl">adult; the same forecast repeated with a new number</span>  
   → no second 🎯 for the same outcome; the page may update the number with history or ask; never two open 🎯 for one prediction
12. [events] <span dir="rtl">[open 🎯 «زمانِ دویدنم ۱۵ درصد بهتر میشه» 60٪] ‖ U: مسئلهٔ مسیرِ دویدن حل شد</span> — _context:_ <span dir="rtl">adult; «حل شد» about a problem, not the 🎯 outcome (C53 last clause)</span>  
   → the 🎯 stays open; the problem may close; the 🎯 is not «شد»
13. [events] <span dir="rtl">U: به احتمالِ زیاد قبول میشم</span> — _context:_ <span dir="rtl">teen 18; «به احتمالِ زیاد» — words with no number</span>  
   → no 🎯 with an invented number (never «۸۰٪» guessed); the page asks once for her number (C37)
14. [events] <span dir="rtl">U: سه بار تا حالا ۶۰ درصد مطمئن بودم و نشد</span> — _context:_ <span dir="rtl">adult; a story about past confidence</span>  
   → no 🎯
15. [events] <span dir="rtl">[problem «اجاره یا خرید»] ‖ U: تورم ۴۰ درصده، فکر کنم سالِ بعد هم همین باشه</span> — _context:_ <span dir="rtl">adult; a rate inside the problem's data plus a vague guess</span>  
   → no 🎯 with 40٪ (the 40 is a rate, not her confidence); the page may ask her confidence once

## R6.filing_dossier · multi-problem filing and 📜 (each problem's 📜 window holds only its own lines and starts at its own first statement; a third problem raised mid-way gets its own record; a practice plan goes to the practice dossier; a return by naming — also by a short name — binds from the SAME message with no lag, and later unnamed messages stay with it — C30; questions about the page, a restated problem, a practice report and a birth sentence are not problems; arithmetic or results she quotes from another person are filed as «کارِ دیگری», checked and shown but never booked as her result or step — C57; the page's ✓/✗/؟ is shown beside her line in 📜 so 📜 and the record speak with one voice; one arrow convention, chronological order, no duplicate «برنامه» lines; she can move or undo a misfiled 📜 line, and the original stays in history — owner bank 42). Base session — «نشستِ سه‌مسئله‌ایِ ۲۷» (adult, one chat): problem A «قفسه‌های انباری» (registered first, plan exists), problem B «مهره‌های رنگی» (a counting puzzle, registered second), problem C «جلسهٔ ۴۵ دقیقه‌ای» (raised mid-way); a practice dossier «تمرینِ خوابِ زود» is open. pos = the line must land where stated; neg = a look-alike that must not create a record or move a line.


### Positive

1. [page] <span dir="rtl">[A and B open, B live] ‖ U: راستی یه مسئلهٔ دیگه: جلسهٔ هفتگی‌مون ۴۵ دقیقه‌ست و ۶ نفر باید حرف بزنن؛ به هر کی چقدر می‌رسه؟</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a third problem mid-way (A27-22)</span>  
   → problem C gets its own record and 📜 from this statement; its arithmetic later (45 ÷ 6 = 7.5) is filed in C, never in A or B; the session dossier counts three problems
2. [page] <span dir="rtl">[B was registered after nine chat lines about A] ‖ [open B's 📜]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; window start (aB2: B's 📜 carried A's nine lines)</span>  
   → B's 📜 starts at B's first statement; A's earlier chat lines are in A's 📜 only
3. [page] <span dir="rtl">U: برنامهٔ تمرین: هر شب ساعت ۱۰ و نیم گوشی رو می‌ذارم کنار</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; problem A live; a practice plan (D27-17)</span>  
   → the plan goes to the practice dossier «تمرینِ خوابِ زود», not under problem A; it appears once
4. [chat] <span dir="rtl">U: مهره‌ها رو حساب کردم: ۳ × ۴ = ۱۲ حالت، درست درومد</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; A live; a return by the short name «مهره‌ها» (C27-18, C30)</span>  
   → the result binds to B in the SAME message (12 OK) and lands in B's 📜; nothing goes to A; no one-message lag
5. [chat] <span dir="rtl">U: برگردیم به قفسه‌ها ‖ U: عرضِ هر طبقه رو ۸۰ سانت گرفتم</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; B live; a named return then an unnamed message (C30; B27·D15 lag)</span>  
   → both messages land in A; the second one, naming nothing, stays with A until she names another problem or A closes
6. [chat] <span dir="rtl">U: درباره‌ی جلسه: ۴۵ ÷ ۶ = ۷٫۵ دقیقه</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; B live; short name «جلسه»</span>  
   → bound to C at once; 45 ÷ 6 = 7.5 OK in C's 📜
7. [chat] <span dir="rtl">U: داداشم حساب کرد ۳ × ۵ = ۱۵ حالت میشه</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; B live; another person's arithmetic (C57; D27-8)</span>  
   → filed in B's 📜 as «کارِ دیگری» with the page's check (3 × 5 = 15 OK); never as her «نتیجه», never «اجرا +», never on her mind card; names follow C22/C38
8. [chat] <span dir="rtl">U: خاله‌م می‌گه ۲۰ درصدِ ۲۵۰ میشه ۶۰</span> — _context:_ <span dir="rtl">adult; another person's wrong result (C57)</span>  
   → «کارِ دیگری» with ✗ (20٪ of 250 = 50); she is not booked a failure; the ✗ is not hers
9. [page] <span dir="rtl">U: ۴ × ۶ = ۲۴ قفسه، ولی ۲۴ ÷ ۵ = ۴ ردیف</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; A live; one OK and one «؟» line (A27-4: 📜 showed results with no mark)</span>  
   → in A's 📜 the first line shows ✓ and the second «؟» (exact 4.8; 4 is its truncation, the C25 question), the same as the page told the coach; one voice
10. [page] <span dir="rtl">[A's 📜 has «۵ ⇒ ۴» corrected once by ✏️]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; history display (A27-14, B24·D16)</span>  
   → one ✏️ is one 📜 event; its history line uses one arrow convention; no fragments like «(۵ ⇒ ۴، ۴ ⇒ ۵،»
11. [page] <span dir="rtl">U: نتیجه رو هم از گزارشِ دو هفته وارسی می‌کنم</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; A live; a check plan (D26-2)</span>  
   → one line in A's 📜 — not both «برنامهٔ خودت» and «طرح» for the same sentence
12. [page] <span dir="rtl">[A's 📜 lines on day 1, day 3, day 2 (backfilled by a ✏️)]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; order (B24·D18)</span>  
   → 📜 shows lines in chronological order of what they record; a later edit is shown at its own time with the history link
13. [page] <span dir="rtl">[a result line of B misfiled in A's 📜] ‖ [she uses «این خط مالِ مسئلهٔ مهره‌هاست»]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; owner bank 42 (move a misfiled line)</span>  
   → the line moves to B's 📜; A's 📜 keeps a history note «جابه‌جا شد ⇒ مهره‌ها»; nothing is deleted
14. [page] <span dir="rtl">[after the move above] ‖ [she undoes the move]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; undo of a move (quarantine, not delete)</span>  
   → the line returns to A with both moves in history
15. [page] <span dir="rtl">U: منبعِ خبرِ خواب رو هم باید پیدا کنم، تا جمعه</span> — _context:_ <span dir="rtl">adult; a two-facet session «بیماری» + «خبرِ خواب»; the plan belongs to the news facet (C27-19)</span>  
   → the plan lands in the «خبرِ خواب» facet's record, not in the disease problem's 📜
16. [page] <span dir="rtl">U: درباره‌ی مهره‌ها: فکر کنم جوابش ۱۲ نیست ۱۶ ـه</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; C live; a guess about B</span>  
   → the guess lands in B; C is unchanged
17. [page] <span dir="rtl">[B closed; then] ‖ U: یه مسئلهٔ تازه از مهره‌ها درومد: اگه ۵ رنگ باشه چی؟</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a new problem born in B's look-back</span>  
   → a new record (or the look-back's new-problem row) — B stays closed and B's 📜 shows the birth line once
18. [page] <span dir="rtl">[session dossier view]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; the count</span>  
   → the session dossier lists three problems (A, B, C) plus the practice dossier, not one entry per message
19. [chat] <span dir="rtl">U: مهره ها رو دوباره شمردم، ۱۲ تا شد</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; ZWNJ missing in «مهره ها»</span>  
   → bound to B like «مهره‌ها»
20. [chat] <span dir="rtl">U: معلمِ کلاس گفت جوابِ مسئلهٔ قفسه‌ها ۹ ـه</span> — _context:_ <span dir="rtl">teen 15 variant of the session; another person's result naming A</span>  
   → filed in A as «کارِ دیگری» with «[نامِ معلم]» if a name is shown in a label; never her result

### Negative (look-alike)

1. [page] <span dir="rtl">U: این صفحه پرونده‌ها رو کجا نگه می‌داره؟</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a question about the page (B27·D14)</span>  
   → not a problem; the session count stays three
2. [page] <span dir="rtl">U: یعنی همون مسئلهٔ قفسه‌ها، فقط با ۶ طبقه بجای ۵</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a restated A (C26-1)</span>  
   → no new record; the datum (or a correction 5 ⇒ 6) lands in A
3. [page] <span dir="rtl">U: دیشب ساعت ۱۰ و نیم خوابیدم</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a practice report</span>  
   → filed in the practice dossier; not a problem; not counted in «مسئله‌های این گفت‌وگو»
4. [page] <span dir="rtl">U: من ۱۳۶۲ به دنیا اومدم</span> — _context:_ <span dir="rtl">adult; a birth sentence (C26-29)</span>  
   → not a problem
5. [chat] <span dir="rtl">U: این هم مثلِ همون قفسه‌هاست، ولی با کتاب</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; B live; A named only as an analogy (C31)</span>  
   → the turn stays with B; nothing is filed in A
6. [chat] <span dir="rtl">[A «قفسه‌های انباری» and another open problem «قفسهٔ کتابِ بچه‌ها»] ‖ U: قفسه‌ها رو تموم کردم</span> — _context:_ <span dir="rtl">adult; a short name that fits two problems</span>  
   → the page asks which one; nothing is filed until she answers
7. [chat] <span dir="rtl">U: داداشم گفت ۳ × ۵ = ۱۵، ولی من خودم دوباره شمردم شد ۱۲</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; B live; another's line and her own in one message (C57)</span>  
   → «۳ × ۵ = ۱۵» is «کارِ دیگری»; «شد ۱۲» is HER result in B; her line is not filed as someone else's
8. [events] <span dir="rtl">[mind card after the «کارِ دیگری» line above]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; mind card</span>  
   → the mind card counts nothing from «کارِ دیگری»: no «اجرا +», no failure
9. [page] <span dir="rtl">[she moves a line from A to B]</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; the move itself</span>  
   → the original entry is never deleted; A keeps a history note; the move is reversible
10. [page] <span dir="rtl">U: سلام، خوبی؟</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a greeting</span>  
   → no record, no 📜 line under any problem
11. [page] <span dir="rtl">U: بابام گفت جمعه درستش می‌کنه</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; A live; another person's plan</span>  
   → not filed as her «برنامه»; no date ask; at most a «کارِ دیگری»/data line in A
12. [page] <span dir="rtl">U: «سامانه روشی برای این داره؟»</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; a meta question in guillemets</span>  
   → not a problem, not a 📜 line of A/B/C
13. [chat] <span dir="rtl">U: برگردیم به قفسه‌ها ‖ U: … ‖ U: حالا مهره‌ها</span> — _context:_ <span dir="rtl">«نشستِ سه‌مسئله‌ایِ ۲۷»; naming B after A (C30 ends)</span>  
   → from «حالا مهره‌ها» on, messages bind to B; nothing after it is filed in A
14. [page] <span dir="rtl">U: ۴۵ دقیقه جلسه داشتیم، خسته‌م</span> — _context:_ <span dir="rtl">adult; a narrative, no problem raised, in a session without problem C</span>  
   → no new problem «جلسه» is created

## R7.territory_loop · territory loop, a44 (after a tie ❓, a reply naming one candidate by any DISTINCT part of its name is her choice — C54; a clear single best fit is not asked as a tie — C54/C3/C14; a reply where only frame or view words overlap is asked about, never silently marked «answered» and never rejected — C20/C2; a reply naming no area at all is rejected and the sheet reopened — C20; a take-back of «نه» closes the sheet; the sheet list is in order; a meta question is not credited as «گذر از مرحله»; the context line names the turn's question, not «پیش‌نیاز»; a piece arriving after closure gets an «امروز» line and a real 🧭 destination, and the closed problem stays closed — C36). Base step — «گامِ قفل» (adult, a home project): step «۲ — کدام روش برای باز کردنِ درِ حیاط با گوشی امن‌تر است؟» ⏸ waiting for system sheet #۱۰۵. A tie reply brings two candidates: «احرازِ دومرحله‌ایِ بلوتوث» and «کلیدِ موقتِ زمان‌دار». pos = the stated loop behaviour; neg = a look-alike with the other outcome.


### Positive

1. [events] <span dir="rtl">[❓ tie naming both candidates] ‖ U: همون بلوتوثیه</span> — _context:_ <span dir="rtl">«گامِ قفل»; a distinct part of one name (C54; C27-28, D27-28)</span>  
   → «احرازِ دومرحله‌ایِ بلوتوث» is her choice: the step resumes with it; the ❓ line leaves the chat, 📜 and «امروز»; the sheet is answered
2. [events] <span dir="rtl">[❓ tie] ‖ U: زمان‌دار</span> — _context:_ <span dir="rtl">«گامِ قفل»; one bare distinct word</span>  
   → «کلیدِ موقتِ زمان‌دار» is chosen; step resumes
3. [events] <span dir="rtl">[❓ tie] ‖ U: همون «کلیدِ موقتِ زمان‌دار» ـه، نه اون یکی</span> — _context:_ <span dir="rtl">«گامِ قفل»; full name in guillemets plus «نه اون یکی» (D27-28 shape)</span>  
   → chosen; no further ❓; the other candidate is recorded as not chosen
4. [events] <span dir="rtl">[❓ tie] ‖ U: دومرحله‌ای بهتره به نظرم</span> — _context:_ <span dir="rtl">«گامِ قفل»; a distinct part plus an opinion</span>  
   → «احرازِ دومرحله‌ایِ بلوتوث» chosen
5. [events] <span dir="rtl">[❓ tie] ‖ U: دو مرحله ای</span> — _context:_ <span dir="rtl">«گامِ قفل»; the distinct part written apart, ZWNJ missing</span>  
   → read like «دومرحله‌ای»: the Bluetooth candidate is chosen
6. [events] <span dir="rtl">[sheet #۱۰۵ reply: one new area «قفلِ هوشمند با کلیدِ موقت و زمان‌بندی» that shares two step-specific words; a second area «یادداشتِ روزانه» shares none]</span> — _context:_ <span dir="rtl">«گامِ قفل»; a clear single best fit (C54; B27·D19 regression)</span>  
   → it arrives as the answer for step 2 without a tie ❓; the second area is not offered
7. [events] <span dir="rtl">[sheet #۱۰۵ reply: an area named «نما: فهرستِ ابزارها» whose only shared words with the step are the frame words «روش» and «کدام»]</span> — _context:_ <span dir="rtl">«گامِ قفل»; frame/view-word-only overlap with a real candidate (C20/C2; B27·D16 silent, D27-27 rejected)</span>  
   → the page ASKS her whether this area answers step 2 (one ❓ line, also in «امروز»); the sheet is not marked «answered» and the reply is not rejected
8. [events] <span dir="rtl">[her «نه» rejected the arrival] ‖ U: نه ببخشید، اشتباهی زدم، همون بود</span> — _context:_ <span dir="rtl">«گامِ قفل»; take-back of her «نه» (C5; D26-21 sheet stayed «open»)</span>  
   → the previous arrival is restored with history and the sheet is CLOSED; it no longer shows «open» in the sheet list
9. [page] <span dir="rtl">[sheets #۱۰۳, #۱۰۴, #۱۰۵ created in that order; #۱۰۴ answered]</span> — _context:_ <span dir="rtl">«گامِ قفل»; the sheet list (D26-22)</span>  
   → the list shows #۱۰۳, #۱۰۴, #۱۰۵ in order, each with its current state; no reordering by update time that hides the order
10. [events] <span dir="rtl">U: سامانه برای این کار ابزاری داره؟</span> — _context:_ <span dir="rtl">«گامِ قفل»; a meta question while step 2 waits (B27·D18)</span>  
   → answered by the assistant; the mind card does NOT credit «گذر از مرحله» for it; the step stays waiting
11. [prompt] <span dir="rtl">[no prerequisite open; step 2 waiting; her message about the lock]</span> — _context:_ <span dir="rtl">«گامِ قفل»; the context line (B27·D17)</span>  
   → the context line names the turn's question (step 2), never «پیش‌نیاز» when no prerequisite is open
12. [events] <span dir="rtl">[the problem is closed] ‖ [sheet #۱۰۶ brings a piece «سنجشِ برد بلوتوث در حیاط» for it]</span> — _context:_ <span dir="rtl">«گامِ قفل»; a piece after closure (C36; C27-6/C27-7)</span>  
   → «امروز» gets a line offering the piece; the 🧭 destination is the real area, never a meta sentence like «سامانه روشی برای این داره؟»; the closed problem stays closed until she reopens it
13. [events] <span dir="rtl">[piece after closure offered in «امروز»] ‖ U: بازش کن، می‌خوام امتحانش کنم</span> — _context:_ <span dir="rtl">«گامِ قفل»; her decision on the offer (C36)</span>  
   → the problem reopens at her word with a history line; nothing reopened it before
14. [events] <span dir="rtl">[❓ tie] ‖ U: بلوتوث</span> — _context:_ <span dir="rtl">«گامِ قفل»; a one-word Latin-origin part</span>  
   → chosen: the Bluetooth candidate
15. [events] <span dir="rtl">[sheet #۱۰۵ reply: a real tie — both candidates share the same two step-specific words]</span> — _context:_ <span dir="rtl">«گامِ قفل»; a real tie (T1 first half)</span>  
   → one ❓ naming both, in the chat and in «امروز»; nothing is declared arrived
16. [events] <span dir="rtl">[❓ tie] ‖ U: اولی</span> — _context:_ <span dir="rtl">«گامِ قفل»; an ordinal reply to a ❓ that listed both in order</span>  
   → the first listed candidate is chosen (the order shown in the ❓ is the order used); if the page cannot tell the order, it asks once
17. [events] <span dir="rtl">[❓ tie answered by naming one] ‖ [open «امروز»]</span> — _context:_ <span dir="rtl">«گامِ قفل»; after the choice</span>  
   → no «❓» row about this step remains in «امروز»
18. [route] <span dir="rtl">[tie answered] ‖ [open 🧭]</span> — _context:_ <span dir="rtl">«گامِ قفل»; 🧭 after the choice</span>  
   → 🧭 shows step 2 resumed with the chosen tool; never «منتظرِ برگه» any more
19. [events] <span dir="rtl">[sheet #۱۰۵ reply names no area at all: «فعلاً چیزی نساختیم»]</span> — _context:_ <span dir="rtl">«گامِ قفل»; a reply naming no area (C20 second half)</span>  
   → rejected and the sheet reopened, with the C4 lag line «پاسخی آمد که برای این گام ابزاری نام نمی‌برد»; never «رسید»
20. [events] <span dir="rtl">[frame-only ask shown] ‖ U: آره همونه</span> — _context:_ <span dir="rtl">«گامِ قفل»; her yes to the frame-only ask</span>  
   → the area arrives for step 2 with history; the ask closes

### Negative (look-alike)

1. [events] <span dir="rtl">[❓ tie] ‖ U: همون قفلیه</span> — _context:_ <span dir="rtl">«گامِ قفل»; a word common to both candidates' context, distinct to neither</span>  
   → not a choice: the page asks again, naming both; nothing arrives
2. [events] <span dir="rtl">[❓ tie] ‖ U: بلوتوثیه یعنی چی؟</span> — _context:_ <span dir="rtl">«گامِ قفل»; naming a candidate inside a question</span>  
   → not a choice: the assistant explains; the ❓ stays open
3. [events] <span dir="rtl">[❓ tie] ‖ U: نمی‌دونم، هر دو خوبن</span> — _context:_ <span dir="rtl">«گامِ قفل»; no choice</span>  
   → the ❓ stays; nothing arrives; at most one gentle repeat
4. [events] <span dir="rtl">[sheet #۱۰۵ reply: two candidates each sharing two step-specific words equally]</span> — _context:_ <span dir="rtl">«گامِ قفل»; a real tie must not be declared a single best fit</span>  
   → the page asks naming both; no arrival
5. [events] <span dir="rtl">[sheet #۱۰۵ reply: an area sharing ONE generic word «امن»]</span> — _context:_ <span dir="rtl">«گامِ قفل»; a single shared word (C14 two-word rule)</span>  
   → asked, not arrived
6. [events] <span dir="rtl">[her «نه» to an arrival] ‖ U: نه، اصلاً به درد نمی‌خوره</span> — _context:_ <span dir="rtl">«گامِ قفل»; a firm «نه» with no take-back</span>  
   → the rejection stands with its history; the sheet is not closed as answered
7. [route] <span dir="rtl">[piece after closure] ‖ [open 🧭]</span> — _context:_ <span dir="rtl">«گامِ قفل»; the meta-destination look-alike (C27-6)</span>  
   → the destination is never «سامانه روشی برای این داره؟» or any meta sentence
8. [events] <span dir="rtl">[the problem is closed; a piece arrives]</span> — _context:_ <span dir="rtl">«گامِ قفل»; closure must hold (C36)</span>  
   → the closed problem does not reopen by itself; its 📜 gets no wait event for the new piece beyond the offer
9. [events] <span dir="rtl">U: درسته، الان می‌فهمم چرا گیر کرده بودم</span> — _context:_ <span dir="rtl">«گامِ قفل»; a reflective remark while step 2 waits</span>  
   → not a «گذر از مرحله» credit and not an answer to the sheet
10. [events] <span dir="rtl">[frame-only ask shown] ‖ U: نه، اون یه چیزِ دیگه‌ست</span> — _context:_ <span dir="rtl">«گامِ قفل»; her «نه» to the frame-only ask</span>  
   → the area does not arrive; the sheet stays open for step 2
11. [events] <span dir="rtl">[no ❓ open] ‖ U: بلوتوث</span> — _context:_ <span dir="rtl">«گامِ قفل»; a candidate word with no pending tie</span>  
   → no arrival is created from this word alone; the assistant answers
12. [prompt] <span dir="rtl">[a prerequisite «مفهومِ رمزِ یک‌بارمصرف» IS open]</span> — _context:_ <span dir="rtl">«گامِ قفل»; the context line when a prerequisite is really open</span>  
   → the context line may name the prerequisite (it is the turn's question) — the B27·D17 rule does not forbid a real one
13. [events] <span dir="rtl">[❓ tie] ‖ U: زمان‌دار نه، بلوتوثی</span> — _context:_ <span dir="rtl">«گامِ قفل»; a negated candidate and a named one in one reply</span>  
   → the Bluetooth candidate is chosen; the negated time-based one is never taken as the choice

## R8.register_quotes_names · register, quotes, names and small mechanisms (her own words are byte-exact everywhere she reads them back — bubble, statement, lesson, quote, «امروز» — letters, ZWNJ and guillemets included; only page-authored text goes through the register layer, and static labels follow the register too — C55; bare first names and other third-party names are shown as «[نامِ شخص]» / «[نامِ معلم]» / «[نامِ مدرسه]» in titles, 🧭 and «امروز», while her own words in the chat record and in a data row stay as typed — C22/C38; no raw id or internal marker such as «(prc)» in her bubble; no u0 question («کلِ مسئله را در یک جمله») after «حل شد»; the second follow-up says «open it», never «build» — C26-32; a typed plan survives a refused gate — C26-33, reproduce in the form path first). pos = the stated protection / behaviour; neg = a look-alike that is legitimately kept, caught or changed.


### Positive

1. [page] <span dir="rtl">U: این جدول رو مرتب کن، تو آناگرام گیر کردم</span> — _context:_ <span dir="rtl">elder 69, register «شما» stored; her statement saved to the problem (B27·D4 S2: «مرتب کن ⇒ مرتب کنید», «تو ⇒ شما»)</span>  
   → the statement, the 📜 line and any quote show «این جدول رو مرتب کن، تو آناگرام گیر کردم» byte-exact; the page's own sentences around it are in «شما»
2. [page] <span dir="rtl">U: جواب رو نگو، فقط راهنمایی کن</span> — _context:_ <span dir="rtl">elder 82, register «شما»; the sentence quoted later in «امروز» as «از حرفِ خودتان: «…»» (aB4)</span>  
   → the quote is «جواب رو نگو، فقط راهنمایی کن» exactly — never «نگویید», never a stray extra «»; the frame «از حرفِ خودتان» is in «شما»
3. [page] <span dir="rtl">U: می‌خوام هر شب ۲۰ دقیقه پیاده‌روی کنم</span> — _context:_ <span dir="rtl">adult; her plan text with ZWNJ (B27·D4 s19: ZWNJ stripped)</span>  
   → the plan in 📜 and «امروز» keeps «می‌خوام» and «پیاده‌روی» with their ZWNJ, byte-exact
4. [page] <span dir="rtl">U: میخوام هر شب پیاده روی کنم</span> — _context:_ <span dir="rtl">adult; the same plan typed WITHOUT ZWNJ</span>  
   → shown back exactly as typed, without ZWNJ — the page does not «fix» her spelling in her own words
5. [page] <span dir="rtl">U: درسی که گرفتم: «اول بنویس بعد حساب کن»</span> — _context:_ <span dir="rtl">adult; a lesson with her own guillemets</span>  
   → the lesson shows her guillemets and text byte-exact; no doubled «» around it
6. [page] <span dir="rtl">[static labels of 🧭 and the strip, e.g. «فقط بازنگریِ خودت»]</span> — _context:_ <span dir="rtl">elder 74, register «شما» (U37, D26-40)</span>  
   → every static label is in «شما» («فقط بازنگریِ خودتان» or equivalent page text); no «تو» label is left
7. [page] <span dir="rtl">U: داداشم کیان گفت این مسئله رو حل کنیم</span> — _context:_ <span dir="rtl">child 9; the problem is registered from this sentence (C27-4)</span>  
   → the title, 🧭 and «امروز» show «[نامِ شخص]» instead of «کیان»; her chat bubble keeps «کیان» as typed
8. [page] <span dir="rtl">U: تو مغازه‌ی حسن آقا هر کیلو سیب ۸۰ هزاره</span> — _context:_ <span dir="rtl">adult; a shopkeeper's name inside a datum that becomes a title (D27-33)</span>  
   → in titles, 🧭 and «امروز» the name is shown as «[نامِ شخص]»; the data row keeps her sentence as typed (C38)
9. [page] <span dir="rtl">U: خانم رستمی معلممون گفت تا شنبه تمرینا رو بدیم</span> — _context:_ <span dir="rtl">teen 13; a teacher's surname in a sentence that becomes a title or an «امروز» line</span>  
   → shown as «[نامِ معلم]» in titles and «امروز»; no date ask for the teacher's words (C19)
10. [page] <span dir="rtl">U: مدرسه‌ی شهید مطهریِ ما ۴۰۰ تا دانش‌آموز داره</span> — _context:_ <span dir="rtl">child 11; a school name in a title</span>  
   → «[نامِ مدرسه]» in the title and labels
11. [page] <span dir="rtl">[the page fails to save a session for a practice case]</span> — _context:_ <span dir="rtl">adult; the failure line in her bubble (D27-25)</span>  
   → the line speaks plainly («جلسه ثبت نشد …») with no raw id and no internal marker such as «(prc)» or «شناسهٔ پرونده»
12. [prompt] <span dir="rtl">[problem solved: «✅ حل شد»] ‖ U: یه بار دیگه چک کردم، درسته</span> — _context:_ <span dir="rtl">adult; after closure (D27-26)</span>  
   → the turn question is not the u0 question «اول کل … کلِ مسئله را در یک جمله»; it is a look-back or nothing
13. [edit] <span dir="rtl">[problem solved] ‖ [✏️ on one of her bubbles]</span> — _context:_ <span dir="rtl">adult; after closure and a ✏️ (D27-26)</span>  
   → no u0 question follows the ✏️
14. [chat] <span dir="rtl">[first follow-up: «همان را باز کن»] ‖ [second follow-up about the same item]</span> — _context:_ <span dir="rtl">adult; the destination already holds the item (C26-32 second follow-up)</span>  
   → the second follow-up also says to open it; it never says «پر کن … بساز»
15. [page] <span dir="rtl">[pC1-style plan form: she types a plan, presses «ثبتِ طرح», the gate refuses]</span> — _context:_ <span dir="rtl">adult; C26-33 — reproduce first in the form path</span>  
   → the typed plan is still in the field after the refusal; nothing she typed is lost
16. [page] <span dir="rtl">[a «ناقص» verdict on one of her prior-work steps]</span> — _context:_ <span dir="rtl">adult; the mind card reading (U24)</span>  
   → the mind card shows «ناقص» as «ناقص», never as «درست نبود»
17. [page] <span dir="rtl">U: بابام (علی) و مامانم (زهره) هر دو موافقن</span> — _context:_ <span dir="rtl">teen 16; two parents' first names in a sentence that is quoted in «امروز»</span>  
   → in «امروز» and titles both names become «[نامِ شخص]»; her bubble keeps them
18. [page] <span dir="rtl">[a page sentence that quotes her: «از حرفِ خودت: «فردا ۸ صبح میرم»»]</span> — _context:_ <span dir="rtl">adult, register «تو»; mixed Persian and digits inside a quote</span>  
   → the quoted part is byte-exact and sits in an RTL block; only the frame is page text
19. [page] <span dir="rtl">U: دخترم نازنین ۷ سالشه و ضرب رو تازه یاد گرفته</span> — _context:_ <span dir="rtl">adult, parent; the daughter's name in a problem title (C22/C38)</span>  
   → «[نامِ شخص]» in the title, 🧭 and «امروز»; the child's age stays as data
20. [page] <span dir="rtl">[the strip of a «شما» elder after «حل شد»]</span> — _context:_ <span dir="rtl">elder 70; static strip text (U37 strip STILL in s12)</span>  
   → the strip text is in «شما»

### Negative (look-alike)

1. [page] <span dir="rtl">U: داداشم کیان گفت این مسئله رو حل کنیم</span> — _context:_ <span dir="rtl">child 9; her own chat bubble and the data row (C38)</span>  
   → «کیان» stays in her bubble and in the data row exactly as typed; only titles/labels/«امروز» use the placeholder
2. [page] <span dir="rtl">[the page's own sentence «حالا بنویس که چه چیزی خواسته شده»]</span> — _context:_ <span dir="rtl">elder 69, register «شما»; page-authored text</span>  
   → converted to «شما» («بنویسید») — the register layer DOES apply to page text
3. [page] <span dir="rtl">U: (prc) یعنی چی؟ تو یه پیام دیدمش</span> — _context:_ <span dir="rtl">adult; she types the marker herself</span>  
   → her own bubble keeps «(prc)»; the rule is about the page's text only
4. [prompt] <span dir="rtl">[problem A solved] ‖ U: یه مسئلهٔ تازه دارم: …</span> — _context:_ <span dir="rtl">adult; a NEW problem after another's closure</span>  
   → the u0 question for the new problem is right here; the rule forbids it only for the solved one
5. [page] <span dir="rtl">U: «بنویسید» رو معلممون همیشه می‌گه</span> — _context:_ <span dir="rtl">teen 14, register «تو»; her own text containing a «شما» verb</span>  
   → her words stay «بنویسید»; the register layer does not turn her text into «بنویس»
6. [page] <span dir="rtl">U: من سارا هستم و ۱۶ سالمه</span> — _context:_ <span dir="rtl">teen 16; a self-introduction</span>  
   → not a problem title at all (Q9 of round 26); no placeholder needed because no title is made
7. [chat] <span dir="rtl">U: آره همونو باز کردم</span> — _context:_ <span dir="rtl">adult; after the first follow-up</span>  
   → no second follow-up is sent
8. [page] <span dir="rtl">[the plan form gate accepts the plan]</span> — _context:_ <span dir="rtl">adult; the accepted path</span>  
   → the plan is saved and the field may clear; the C26-33 rule is about the refused path only
9. [page] <span dir="rtl">U: تو کتابِ «چگونه مسئله را حل کنیم» یه جمله بود</span> — _context:_ <span dir="rtl">adult; a book title in guillemets inside her text</span>  
   → the book title is not masked; her text stays byte-exact; no «[نامِ شخص]»
10. [page] <span dir="rtl">U: خیابونِ ولیعصر خیلی ترافیک بود</span> — _context:_ <span dir="rtl">adult; a street name in a narrative</span>  
   → no title is made; nothing is masked in her bubble
11. [page] <span dir="rtl">[mind card: a step verdict «✗ نادرست»]</span> — _context:_ <span dir="rtl">adult; a real wrong step</span>  
   → shown as «درست نبود» with its reason — the U24 rule only protects «ناقص»
12. [page] <span dir="rtl">U: مرتب کنید لطفاً</span> — _context:_ <span dir="rtl">elder 69, register «شما»; her text already in «شما»</span>  
   → kept exactly; nothing converts it to «تو»
13. [page] <span dir="rtl">[the page's static label «نقشهٔ مسیرِ مسئله»]</span> — _context:_ <span dir="rtl">adult; a label with no pronoun or verb</span>  
   → unchanged in both registers
14. [page] <span dir="rtl">U: کیان</span> — _context:_ <span dir="rtl">child 9; a bare reply «کیان» to the assistant's question «اسمِ داداشت چیه؟»</span>  
   → kept in her bubble; not used in a title; no problem is made from it
15. [page] <span dir="rtl">U: «جواب رو نگو» — اینو یادت باشه</span> — _context:_ <span dir="rtl">adult, register «تو»; her quote</span>  
   → kept exactly; the page may quote it back with its own frame «از حرفِ خودت»

## Ambiguities for the coordinator

These are points DECISIONS_R25–R27 leave open. No rule was invented for them. The matching entries were either left out or, where noted, assert only the part the decisions do fix.

1. **R1 / C40 — a fitting sum in a product context.** Take «۸ و ۳ میشه ۱۱ متر مربع». The sum fits, but the unit points to a product. The entry asserts only that the reader gives OK and does not ask «ضرب کردی؟». Is the page itself meant to signal anything, or is it the coach's job alone?
2. **R1 / C28, C40 — all-word operands.** Take «پنج و شش میشه سی». C28 puts «و … میشه» inside the reader, and C17 keeps sentences without an operation word outside it. Are number words read as operands? No entry.
3. **R1 / C44 vs C9 — a short decimal ratio with no approximation word.** C44 sends «a percentage, ratio or decimal written as an integer or short decimal» to the C25 question. C9 accepts a decimal that is her rounding at her digits, and «۲۱٫۹۶ / ۶۰ = ۰٫۳۷» was judged ✓ and right in round 27 group A. Which rule wins for decimals? The bank has only integer percentages.
4. **R1 / C45 — no scale word anywhere.** Take «۲۴۰ × ۲۵ = ۶۰۰۰». Does the page write «۶۰۰۰» or «۶ هزار» («the largest scale word that keeps the integer part ≥ 1»)? No entry.
5. **R1 — «N میلیون و M» with a bare M.** Take «۱۱ میلیون و ۱۸۰» with prices in thousands. Is M thousands, as the colloquial reading has it, or units? The entry asserts NOT-FLAG (OK or UNCHECKED, never silence, never ✗).
6. **R1 / C42 — progressions not covered by the examples.** These are a descending progression («۲۰ + ۱۸ + … + ۲»), decimal steps, negative terms, and a symbolic last term («۱ + ۲ + … + n»). They are fixed by the first two terms and the last, but are they meant to be in scope? No entry.
7. **R1 / C43 — two lines wait, one hers and one someone else's (C57).** A bare «آره گرد کردم» comes in. Does it bind to hers without asking, or does the page ask «کدام؟»? The entry binds only where she names her own number («اون ۱۷»).
8. **R2 / C47 — equal digits inside an expression.** C47 says «an expression containing the value». The entry treats a different quantity as no dependency: «گرم‌کردن: ۴۰ + ۱۲ = ۵۲ دقیقه» versus the corrected «۱۲ ثانیه» per lap. What should happen when the unit is the same and only the meaning differs, e.g. two unrelated «۱۲ ثانیه»? Is that «not stale» or «ask once»?
9. **R2 / C47 — an irrational recomputation.** Is «√۱۸۱ (≈ ۱۳٫۴۵)» the required form, or is the page meant to ask instead? The entry accepts either one and forbids only a bare rounded integer.
10. **R2 — accepting a proposal for a step that has dependants.** Do the dependants update automatically, or does each keep its own proposal for her yes? The entry asserts only «no re-proposal by scaling».
11. **R3 / C49 — lapse timing.** R3 says «it lapses on its date», while C49 says «when its date passes». On the asked day itself, is the ask still open? The entries assume it is open on that day and closed from the next day.
12. **R3 / C50 — idioms at their own boundary.**
    - «عید» said between 1 and 13 Farvardin, or later in Farvardin.
    - «آخرِ سال» said on the last day of Esfand.
    - «سرِ برج» said on day 1 of a month.
    - Related idioms: «آخرِ سالِ تحصیلی», «اولِ ماه», «وسطِ ماه».

    The entries set the clock away from these boundaries.
13. **R3 / C51 — a negated day with no replacement.** Take «این جمعه نه» alone. Should the page ask for the day? The entry asserts only that nothing is booked or offered for that Friday.
14. **R3 / C49 — a yes whose own content changes the day.** A pending ask for «فردا» gets the reply «بله، پس‌فردا». Is that a yes, or a correction that re-asks? No entry.
15. **R3 / C52 — a follow-up on another day.** Take «جمعه پس می‌دم، پنجشنبه یادم بنداز». Is that one record with two dates, and is each asked? No entry.
16. **R4 / C46 — a hypothetical that turns into a fact.** Take «اگه دور ۱۰ ثانیه بود چی؟ راستش ۱۰ بود». Is it a correction (C48) or a hypothetical? No entry.
17. **R5 / C53 — someone else's confidence.** Take «مربی گفت ۷۰ درصد می‌بریم». Is it a 🎯 in her name, «کارِ دیگری» (C57 by analogy), or nothing? No entry.
18. **R5 — a confidence number with no outcome sentence.** Take «هفتاد درصد» given as a reply to the coach's own question. Does it attach to the coach's question? No entry.
19. **R5 — the same forecast repeated with a new number.** Should the page update the 🎯 with history or ask? The entry forbids only a second open 🎯.
20. **R6 / owner bank 42 — moving a 📜 line.** Does the move also move what the line produced, such as a ledger step, a result or a 🎯? The entries assert only the 📜 line and its history.
21. **R6 / C57 — what counts as «another person».** Is the coach's own number, or the page's value that she repeats, «کارِ دیگری»? No entry.
22. **R7 / C54 — choosing by negation.** With exactly two candidates she replies «بلوتوثی نه». Is that a choice of the other one, or should the page ask? The bank has the negation only together with a positive naming.
23. **R7 — an ordinal reply («اولی»).** The entry accepts «the order shown in the ❓» or one ask.
24. **R8 / C22, C38 — which names are masked.** Open cases:
    - public or historical names inside a problem name, e.g. «حدسِ اردوش–اشتراوس»;
    - her own first name;
    - a name with a title, e.g. «حسن آقا» (the entry masks it, per D27-33);
    - a book title (the entry keeps it).
25. **R8 / C55 — the page quoting its own earlier text back to her.** That text is page-authored, so is it re-converted to the current register? Her own words are byte-exact either way. No entry.
