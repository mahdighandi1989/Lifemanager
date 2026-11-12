# VARIANTS_R26 — independent variant bank (round 26 root mechanisms Q1–Q10)

Written from DECISIONS_R26 (root families Q1–Q10, «Severity made uniform», clarifications C15–C22), DECISIONS_R25 with its clarifications C1–C14, the round-26 runner handbacks and defect lists A, B, B_x, C, D, COMPARE26_judge / COMPARE26_result and roadmap §9 and §21 only; no source code of the page and no fixer's work was read. Paraphrased — new people, numbers and subjects — not copied from the scenarios; each entry tests the mechanism, not one sentence.
Every fix must pass the scenario sentence AND every entry of its mechanism here. **No fixed calendar dates in expectations:** D0 = the test clock's day when the test runs; «D0+n» = n days later; «the first Friday after D0» etc. are computed at run time and shown as Jalali dates; weeks run Saturday–Friday. Where an entry needs a weekday, its context says which weekday the clock is set to. A birth date inside a user text is an invented datum of the persona, not an expectation.
**Arithmetic verified:** every arithmetic fact in this bank — each value called right, each value called wrong, and each «right value» an expectation names — was recomputed with exact rational arithmetic (python3 `fractions.Fraction`; script VARIANTS_R26_verify.py beside this file, all assertions passing; it also sweeps every «a op b = c» written in the entries and asserts that the only mismatches are the values deliberately marked wrong). A value marked OK is exactly right (or a correct rounding, where said); a value marked FLAG is genuinely wrong.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result). **Q1 states its own reading at its head:** every Q1 expectation starts with the verdict the page's check must give — OK / FLAG / ASK / UNCHECKED / NOT-FLAG / NOT-OK / SILENT. «ASK» anywhere in the bank means: the decisions say the page asks her, and nothing is booked until she answers.
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views, [events] sheet replies, registry diffs, 🎯 rows, dossier / mind-card readings, [time] day sequences under the test clock, [prompt] what the prompt / reply / post-check contains, [route] 🧭 content.
Learners: adult unless the context says child (≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ deliberately missing in some entries — detection must not depend on it and her text is stored as typed. Digits appear in Persian, Latin and mixed form on purpose; all must be read the same. All personal and school names are invented.
Multi-message entries use « ‖ » (U = user, A = assistant, «[…]» = a page action / result / sheet event). Old values always stay as history («اصلاح شد ⇐»); nothing is deleted. Named base problems («مسئلهٔ رنگ», «نشستِ سه‌مسئله», «مسئلهٔ وام», «گامِ عایق») are defined in the head of their family or in the first entry that uses them. Machine-readable copy: VARIANTS_R26.json (fields rc, kind, role, text, expect, context). Points the decisions leave open are NOT turned into entries; they are listed at the end under «Ambiguities for the coordinator».

## Counts

| mechanism | pos | neg |
|---|---|---|
| Q1.arith_reader | 25 | 17 |
| Q2.correction_reach | 17 | 13 |
| Q3.one_problem_one_record | 16 | 11 |
| Q4.prior_reply_reading | 17 | 13 |
| Q5.dates_today | 17 | 16 |
| Q6.stage_closure | 13 | 7 |
| Q7.territory_polish | 13 | 7 |
| Q8.forecast_ledger | 11 | 8 |
| Q9.person_register_titles | 19 | 9 |
| Q10.small_mechanisms | 5 | 3 |
| **total** | 153 | 104 |


## Q1.arith_reader · the page's exact-arithmetic reader (a scale or unit word beside the result is a unit, never a factor — C15; the claimed value is what follows the last «=» / «میشه», never a condition number — C18; rounding never rescues a false exact identity, and an integer for a non-integer quotient is asked — C16; an operator line the reader cannot parse is «نسنجیده», never silence — C17; the block also runs on a live problem with no ledger; a division slip is not a unit error; the page's value is shown in her form; she can contest a ✗). Every expectation starts with the verdict the PAGE's check must give to the coach: «OK» = «می‌خواند» ✓ · «FLAG» = ✗ · «ASK» = neither ✓ nor ✗: the page states the exact value and asks whether she rounded (C16) · «UNCHECKED» = «نسنجیده» · «NOT-FLAG» = OK, or UNCHECKED when the scale/shape cannot be read; never ✗, never silence · «NOT-OK» = FLAG, or UNCHECKED when the shape cannot be parsed; never ✓, never silence · «SILENT» = outside the reader, no arithmetic line, as before. pos = the mechanism's form read with the right verdict; neg = its confusable look-alike, which must get the OTHER verdict stated.


### Positive

1. [chat] <span dir="rtl">U: … گام ۳: سودِ سالانه ۲۴ × ۱٫۲۵ = ۳۰ میلیون</span> — _context:_ <span dir="rtl">adult, shop-loan decision; prior-work opening; the scale word stands only after the result</span>  
   → OK — 24 × 1.25 = 30; «میلیون» is the unit of the result, not a factor (never «✗ … را «۳۰ میلیون» نوشته — حسابِ صفحه: ۳۰»); the step is ✓ in the ledger, the coach is not told to make her look for a slip, the mind card books no failure
2. [chat] <span dir="rtl">U: سهمِ هر شریک میشه 13 / 4 = 3.25 میلیارد</span> — _context:_ <span dir="rtl">adult; Latin digits; slash division with a decimal result and «میلیارد» after it</span>  
   → OK — 13 ÷ 4 = 3.25; never ✗ on the word «میلیارد»
3. [chat] <span dir="rtl">U: تا الان ۱۴۰ هزار تومن خرج کردم، با ۶۵ میشه ۲۰۵، با ۳۰ میشه ۲۳۵ هزار تومن</span> — _context:_ <span dir="rtl">teen 15, school-trip budget; a running sum whose first and last numbers carry «هزار تومن» and whose middle ones do not</span>  
   → OK on both links — 140 + 65 = 205 and 205 + 30 = 235 under the one consistent reading (all in thousands); never «✗ «۲۰۵ با ۳۰» را «۲۳۵ هزار» نوشته — حسابِ صفحه: ۲۳۵»; no «عددِ درست را لو نده» instruction for a correct sum
4. [chat] <span dir="rtl">U: کلِ هزینه ۱۹ × ۴٫۳ = حدود ۸۱٫۷ میلیون</span> — _context:_ <span dir="rtl">adult; an approximation word AND a scale word between «=» and after the number</span>  
   → OK — 19 × 4.3 = 81.7 exactly; «حدود» and «میلیون» are both read as non-factors
5. [chat] <span dir="rtl">U: درآمد منهای خرج: ۴۵ − ۲۸ = ۱۷ میلیون. در سال میشه ۱۷ × ۱۲ = ۲۱۴ میلیون</span> — _context:_ <span dir="rtl">adult; one message with a correct line and a wrong line, both ending in «میلیون»</span>  
   → first line OK (45 − 28 = 17); second line FLAG because the NUMBERS disagree (17 × 12 = 204, she wrote 214) — the ✗ names 214 against the page's value in her form, and is not caused by the word; the correct value is not given away to her
6. [chat] <span dir="rtl">U: مصرفِ کولر: ۱۸۵۰ × ۶ ≈ ۱۱٫۱ کیلووات‌ساعت</span> — _context:_ <span dir="rtl">adult, electricity bill; watts × hours written, result given with the «کیلو» prefix</span>  
   → NOT-FLAG — 1850 × 6 = 11 100 Wh = 11.1 kWh under the consistent reading; OK if the prefix is read, UNCHECKED if it cannot be; never «✗ … حسابِ صفحه: ۱۱۱۰۰»
7. [chat] <span dir="rtl">U: با n = 5 میشه 1+3+5+7+9 = 25</span> — _context:_ <span dir="rtl">teen 16, sum of odd numbers; a condition number before «میشه»</span>  
   → OK — the claim is «1+3+5+7+9» against «25» (the value after the last «=»); never «✗ … را «۵» نوشته»; the 5 of the condition is not the claimed value
8. [chat] <span dir="rtl">U: a=5 و b=2 میشه 25−4=21</span> — _context:_ <span dir="rtl">teen 17, difference of squares; two assignments, then an expression with the Unicode minus and no spaces</span>  
   → OK — 25 − 4 = 21; neither «2» nor «5» is taken as the claimed value
9. [chat] <span dir="rtl">U: اگه x = ۳ باشه میشه ۲×۳+۷ = ۱۳</span> — _context:_ <span dir="rtl">child 12; «اگر … باشه … میشه»; Persian digits, Latin x</span>  
   → OK — 2 × 3 + 7 = 13; the condition «x = ۳» is not evaluated as a claim and not compared with 13
10. [chat] <span dir="rtl">U: سهم‌ها رو جمع زدم: ۱/۲ + ۱/۴ + ۱/۵ = ۱، پس چیزی نمی‌مونه</span> — _context:_ <span dir="rtl">adult, inheritance shares; a FALSE exact fraction identity whose value rounds to 1</span>  
   → FLAG — 1/2 + 1/4 + 1/5 = 19/20, not 1; an «=» between exact rationals is exact, C9's rounding does not apply (never «✓ «۱/۲ + ۱/۴ + ۱/۵ = ۱» می‌خواند»); the dependent sentence «چیزی نمی‌مونه» is not confirmed; shown to her as fractions (her form)
11. [chat] <span dir="rtl">U: 1 = 1/2 + 1/3 + 1/5</span> — _context:_ <span dir="rtl">teen 17, unit-fraction decomposition; the integer on the LEFT, Latin digits</span>  
   → FLAG — 1/2 + 1/3 + 1/5 = 31/30 ≠ 1 (side order does not matter); the model's ✓, if any, is overridden
12. [chat] <span dir="rtl">U: ۱۹ تقسیم بر ۷ میشه ۲ و خرده‌ای، یعنی ۲٫۹</span> — _context:_ <span dir="rtl">adult; «n و خرده‌ای» followed by a decimal restatement</span>  
   → FLAG on the second half — 19 ÷ 7 = 2.714…, so «۲ و خرده‌ای» is right but «۲٫۹» is not (2.7 at her one digit); BOTH halves are checked, the true first half does not rescue the line
13. [chat] <span dir="rtl">U: تا الان ۱۴۰ هزار تومن دادم، با ۶۵ میشه ۲۱۵</span> — _context:_ <span dir="rtl">teen 15; a WRONG running sum with a unit between the numbers</span>  
   → NOT-OK — 140 + 65 = 205, not 215: FLAG (UNCHECKED only if the reader truly cannot parse the shape); never ✓ and never silence
14. [chat] <span dir="rtl">U: مساحتِ باغچهٔ گرد: π × ۶² ≈ ۱۱۳٫۱ مترمربع</span> — _context:_ <span dir="rtl">adult; a correct line with π and a power</span>  
   → NOT-FLAG and never silent — π·36 = 113.097… rounds to 113.1: OK if π is read, otherwise the coach is told «نسنجیده» for this line
15. [chat] <span dir="rtl">U: شیب در اون نقطه میشه −48/(96π) ≈ −0.26</span> — _context:_ <span dir="rtl">teen 17, related-rates problem; a WRONG value with π in the denominator</span>  
   → NOT-OK — −48/(96π) = −1/(2π) = −0.159…, not −0.26: FLAG if π is read, otherwise «نسنجیده»; never passes silently, never ✓
16. [chat] <span dir="rtl">U: ۶ از ۴۸ میشه ۱۲٫۵٪ ‖ U: ۹ از ۶۰ میشه ۱۸٪</span> — _context:_ <span dir="rtl">adult, survey counts; the «A از B میشه N٪» shape, one right and one wrong</span>  
   → first NOT-FLAG (6/48 = 12.5 %), second NOT-OK (9/60 = 15 %, not 18 %); each line gets a verdict or «نسنجیده» — neither is left without a line
17. [chat] <span dir="rtl">U: 0.9^4 ≈ 0.66 ‖ U: ۱٫۱^۳ = ۱٫۴۴</span> — _context:_ <span dir="rtl">adult, yearly depreciation / growth; powers</span>  
   → first NOT-FLAG (0.9⁴ = 0.6561 → 0.66), second NOT-OK (1.1³ = 1.331, not 1.44); never silence on either
18. [chat] <span dir="rtl">U: ۰٫۴۵ تقسیم بر ۰٫۰۹ میشه ۵ برابر</span> — _context:_ <span dir="rtl">adult; operator in words, result after «میشه» followed by the word «برابر»</span>  
   → NOT-FLAG and never silent — 0.45 ÷ 0.09 = 5 exactly; «برابر» is a unit word; the page's own line exists (not only the model's confirmation)
19. [chat] <span dir="rtl">U: ۱ + ۲ + … + ۲۰ = ۲۱۰ ‖ U: 1+2+...+20 = 200</span> — _context:_ <span dir="rtl">teen 14; ellipsis sums, one right and one wrong, with «…» and with three dots</span>  
   → first NOT-FLAG (20·21/2 = 210), second NOT-OK (not 200); a line the reader cannot expand is «نسنجیده», never silence and never ✓
20. [chat] <span dir="rtl">[the chat is bound to a registered live problem that has NO prior-work ledger] ‖ U: تعدادِ بازی‌ها ۱۴ × ۱۳ ÷ ۲ = ۹۱ ‖ U: امتیازها ۳۰×۳ + ۱۲×۵ = ۹۰ + ۶۰ = ۱۵۰</span> — _context:_ <span dir="rtl">adult, league schedule; mid-solution messages in the execution stage of a live problem</span>  
   → OK on both — 14 × 13 ÷ 2 = 91; 30·3 + 12·5 = 90 + 60 = 150 (every link of the chain); the «# حسابِ صفحه» block IS in the prompt although the chat is bound to a live problem with no ledger
21. [chat] <span dir="rtl">U: هر قسط میشه ۲۶۸۸۰۰ ÷ ۳۲ = ۸۳۰۰ تومن</span> — _context:_ <span dir="rtl">adult; a plain division slip, no unit conversion anywhere in the line</span>  
   → FLAG — 268 800 ÷ 32 = 8400, not 8300; the reason given to the coach is a computation slip in the division — it is NOT labelled a unit / conversion error
22. [chat] <span dir="rtl">U: افتِ واقعی: ۱٫۰۳/۱٫۰۴۵ − ۱ ≈ −۱٫۴۴٪</span> — _context:_ <span dir="rtl">adult, wage vs inflation; an approximate percent result with a minus sign</span>  
   → OK — 1.03/1.045 − 1 = −3/209 = −1.4354… %, which rounds to −1.44 % at her two digits (C9, she wrote «≈»); if the page shows its own value it is a percent or a decimal, never the raw fraction «-۳/۲۰۹»
23. [chat] <span dir="rtl">U: هفت هشتم یعنی ۷ ÷ ۸ = ۰٫۸۵</span> — _context:_ <span dir="rtl">teen 13; a wrong decimal result</span>  
   → FLAG — 7 ÷ 8 = 0.875 (0.88 or 0.87 at two digits, not 0.85); the page's value in the coach line is a decimal (her form), never «۷/۸»
24. [chat] <span dir="rtl">U: هر جعبه ۱۰۰ ÷ ۷ = ۱۴ تا ‖ U: ۲۰۰ تقسیم بر ۶ میشه ۳۳</span> — _context:_ <span dir="rtl">adult; an INTEGER written for a non-integer quotient, no decimal digits and no approximation word</span>  
   → ASK ×2 — neither ✓ nor ✗: the page states the exact value (100 ÷ 7 = 14.28…, 200 ÷ 6 = 33.33…) in decimal form and asks whether she rounded; the step is not booked as a failure and not as confirmed until she answers
25. [chat] <span dir="rtl">[the page marked a line of hers ✗; her arithmetic on that line is in fact right] ‖ U: نه، من درست حساب کردم؛ دوباره نگاه کن، ۲۴ ضرب در ۱٫۲۵ همون ۳۰ میشه</span> — _context:_ <span dir="rtl">adult; owner bank 36 — she contests the page's ✗ and she is right</span>  
   → the page re-runs the check and shows both computations (hers and its own, 24 × 1.25 = 30); the ✗ is cleared EVERYWHERE — ledger step, 🧭, 📜, mind card (no «شکست» stays for that step) — with history («بازسنجی شد ⇒ درست»); the page is not silent and the chat does not disagree with 🧭/📜

### Negative (look-alike)

1. [chat] <span dir="rtl">U: … گام ۳: سودِ سالانه ۲۴ × ۱٫۲۵ = ۳۲ میلیون</span> — _context:_ <span dir="rtl">adult; the same shape as the first positive but the NUMBER is wrong</span>  
   → FLAG — 24 × 1.25 = 30, she wrote 32; a scale word beside the result does not shield a wrong number (the fix must not turn every «= N میلیون» into ✓)
2. [chat] <span dir="rtl">U: سهمِ هر شریک میشه 13 / 4 = 3.5 میلیارد</span> — _context:_ <span dir="rtl">adult; scale word beside a wrong decimal</span>  
   → FLAG — 13 ÷ 4 = 3.25, not 3.5
3. [chat] <span dir="rtl">U: تا الان ۱۴۰ هزار تومن خرج کردم، با ۶۵ میشه ۲۰۵، با ۳۰ میشه ۲۴۵ هزار تومن</span> — _context:_ <span dir="rtl">teen 15; running sum with scale words whose LAST link is wrong</span>  
   → first link OK (140 + 65 = 205); last link NOT-OK — 205 + 30 = 235, not 245: FLAG (UNCHECKED only if unparseable); never ✓
4. [chat] <span dir="rtl">U: ۱/۳ + ۱/۷ ≈ ۰٫۴۸ ‖ U: ۱/۲ + ۱/۳ + ۱/۴ ≈ ۱٫۰۸</span> — _context:_ <span dir="rtl">adult; fraction sums given as legitimately rounded decimals with «≈»</span>  
   → OK ×2 — 1/3 + 1/7 = 10/21 = 0.476… → 0.48; 1/2 + 1/3 + 1/4 = 13/12 = 1.083… → 1.08; C9 applies because she wrote decimal digits and «≈» — the exactness rule is only for an «=» between exact rationals
5. [chat] <span dir="rtl">U: ۱/۲ + ۱/۳ + ۱/۶ = ۱ ‖ U: ۳/۴ + ۵/۴ = ۲</span> — _context:_ <span dir="rtl">teen 16; TRUE exact identities with an integer result</span>  
   → OK ×2 — both sums are exact (1 and 2); they are read and reported ✓, not left unread and not flagged by an over-strict exactness rule
6. [chat] <span dir="rtl">U: ۹۶ ÷ ۸ = ۱۲ ‖ U: ۱۰۰ ÷ ۷ ≈ ۱۴ ‖ U: ۲۰۰ تقسیم بر ۶ حدوداً میشه ۳۳</span> — _context:_ <span dir="rtl">adult; an exact integer quotient, and non-integer quotients WITH an approximation word</span>  
   → OK ×3 and no ASK — 96 ÷ 8 = 12 exactly; 14.28… ≈ 14 and 33.33… ≈ 33 are accepted roundings because she wrote «≈» / «حدوداً»
7. [chat] <span dir="rtl">U: ۱۰۰ ÷ ۷ = ۱۴٫۲۹ ‖ U: ۱۰۰ ÷ ۷ = ۱۴٫۲۸ ‖ U: ۱۰۰ ÷ ۷ = ۱۴٫۳۹</span> — _context:_ <span dir="rtl">adult; a non-integer quotient written WITH decimal digits</span>  
   → OK, OK, FLAG — 100 ÷ 7 = 14.2857…: 14.29 (rounded) and 14.28 (truncated) pass by C9 with no ASK; 14.39 is neither and is flagged
8. [chat] <span dir="rtl">U: با n = 5 میشه 1+3+5+7+9 = 24</span> — _context:_ <span dir="rtl">teen 16; the C18 shape with a genuinely wrong value after the last «=»</span>  
   → FLAG — 1+3+5+7+9 = 25, she wrote 24; the ✗ names «24» as what she wrote (never «5»)
9. [chat] <span dir="rtl">U: روی هم سه تا بسته خریدم هر کدوم هشتاد تومن، دویست و چهل دادم</span> — _context:_ <span dir="rtl">adult; sentence arithmetic in number words with no operator</span>  
   → SILENT — outside the reader as before (C17 covers only lines with an operator); no ✗, no «نسنجیده» line required (3 × 80 = 240 happens to be right)
10. [chat] <span dir="rtl">U: طولِ پارچه ۱۲ ذرع × ۱٫۰۴ = ۱۲٫۴۸ متر</span> — _context:_ <span dir="rtl">elder 70, «شما»; a unit the page cannot convert, with an explicit operator</span>  
   → NOT-FLAG and never silent — the numbers agree (12 × 1.04 = 12.48), so ✓ under that reading or «نسنجیده» because the unit factor cannot be read (C10/C15); never ✗ and never a missing line
11. [chat] <span dir="rtl">U: برای n بعدی، ۳×۴ می‌شه ۴×۵</span> — _context:_ <span dir="rtl">teen 17, induction step on n(n+1); «می‌شه» between two expressions means «becomes», not «equals»</span>  
   → NOT-FLAG — not a claim that 12 = 20; never «✗ «۳×۴» را «۴×۵» نوشته»
12. [chat] <span dir="rtl">U: ۴۵۰ دقیقه = ۴٫۵ ساعت</span> — _context:_ <span dir="rtl">adult; a real unit-conversion error (look-alike of the division slip)</span>  
   → FLAG — 450 min = 7.5 h; here the label «تبدیلِ واحد» IS right
13. [chat] <span dir="rtl">U: انرژی ۲۵ کیلووات‌ساعت × ۳٫۶ = ۸۰ مگاژول</span> — _context:_ <span dir="rtl">adult; unit words on an operand and on the result, numbers wrong</span>  
   → FLAG — 25 × 3.6 = 90, she wrote 80; the unit words do not hide the wrong number and the line is not silent
14. [chat] <span dir="rtl">U: افتِ واقعی: ۱٫۰۳/۱٫۰۴۵ − ۱ ≈ −۱٫۶۴٪</span> — _context:_ <span dir="rtl">adult; the approximate-percent shape with a wrong value</span>  
   → FLAG — the exact value is −1.4354… %; −1.64 % is neither its rounding nor its truncation; the page's value is shown as a percent or decimal, never «-۳/۲۰۹»
15. [chat] <span dir="rtl">U: قیمتِ ماشین = ۴۵۰ میلیون ‖ U: بودجه: ۱۲ میلیون</span> — _context:_ <span dir="rtl">adult; a scale word after a number with no operator at all</span>  
   → SILENT — a datum, not arithmetic; no ✓/✗/«نسنجیده» line
16. [chat] <span dir="rtl">[the page marked «۱۷ × ۱۲ = ۲۱۴» ✗] ‖ U: نه بابا درست حساب کردم، همون ۲۱۴ میشه</span> — _context:_ <span dir="rtl">adult; she contests a ✗ and she is WRONG (17 × 12 = 204)</span>  
   → the page re-runs the check once and says the verdict stayed, with its computation as evidence; the ✗ is NOT cleared anywhere; the contest is recorded as re-checked and is not asked again in a loop; no caving to please her
17. [chat] <span dir="rtl">[no arithmetic verdict of the page is on the table] ‖ U: نه، درست حساب کردم که گفتم دیرم میشه</span> — _context:_ <span dir="rtl">adult; «درست حساب کردم» as an idiom about time, not a contest of a ✗</span>  
   → no re-check, no «بازسنجی» line, nothing cleared or changed in the ledger

## Q2.correction_reach · a correction reaches everything built on it, and nothing else (every record DERIVED from the corrected datum — ledger steps, chat-recorded results, plan, forecast row, practice session, look-back check, the strip state «حل به نتیجه رسید» — is marked «با عددِ پیشین» or asked once; marking follows dependency, never equal digits; a message with a correction AND a question records the correction or asks once; «چیزی برای عوض کردن نبود» only when no record holds the old value; a proposed replacement is the page's exact recomputation of the whole expression, or the page asks — C11; ✏️ refreshes the chat-recorded result; the page tells her and the model the same thing; the re-check question stays until answered). pos = a dependant that must be reached / a correction that must land; neg = a look-alike that must stay untouched.


### Positive

1. [chat] <span dir="rtl">[prior-work ledger: گام ۱ «دیوار ۶ در ۲٫۸ متره، میشه ۱۶٫۸ مترمربع» ✓ · گام ۲ «هر لیتر ۸ مترمربع رو می‌پوشونه، پس ۲٫۱ لیتر» ✓ · گام ۳ «دو دست می‌زنم، میشه ۴٫۲ لیتر» ✓] ‖ U: ببخشید طولِ دیوار ۷ متره، نه ۶</span> — _context:_ <span dir="rtl">adult, painting a wall («مسئلهٔ رنگ» — referred to below); a datum that three ✓ steps were built on</span>  
   → all three steps are marked «با عددِ پیشین» (or asked once): 16.8 ⇒ 19.6, 2.1 ⇒ 2.45, 4.2 ⇒ 4.9 — every value the page proposes is its own exact recomputation (7 × 2.8 = 19.6; 19.6 ÷ 8 = 2.45; 2.45 × 2 = 4.9); the ledger no longer shows three plain ✓ on the old numbers; the old values stay as history
2. [chat] <span dir="rtl">[chat results recorded over three turns: «۴۲۰ کیلومتر راهه»، «صدی ۸ لیتر می‌سوزونه، پس ۳۳٫۶ لیتر»، «لیتری ۳۰۰۰ تومن، میشه ۱۰۰۸۰۰ تومن»] ‖ U: مسیر ۴۲۰ نیست، از جادهٔ جدید ۴۵۰ کیلومتره</span> — _context:_ <span dir="rtl">adult, trip cost; a chain of CHAT-recorded results, no form and no ledger</span>  
   → both derived results are reached: 33.6 ⇒ 36 litres and 100 800 ⇒ 108 000 tomans (450 × 8 ÷ 100 = 36; 36 × 3000 = 108 000), each marked «با عددِ پیشین» or asked once with the right value; not only the statement changes
3. [chat] <span dir="rtl">[chat problem at «حل به نتیجه رسید»: «کلاس ۲۸ نفره، گروه‌های ۴ نفره، پس ۷ گروه»] ‖ U: کلاس ۲۸ نفر نیست، ۳۲ نفره</span> — _context:_ <span dir="rtl">teen 14; a datum correction AFTER the chat problem reached its result</span>  
   → the recorded result «۷ گروه» is marked «با عددِ پیشین» (32 ÷ 4 = 8); the strip no longer says a plain «حل به نتیجه رسید» for a result built on the old datum — it says the result must be redone or asks; 🧭 and 📜 agree with the strip
4. [chat] <span dir="rtl">[recorded: datum «بام ۱۵۰ مترمربع»، datum «بارش ۰٫۲ متر»، datum «ضریبِ جمع‌آوری ۰٫۸»، result «۱۵۰ × ۰٫۲ × ۰٫۸ = ۲۴ مترمکعب»، plan «مخزنِ ۲۵ مترمکعبی می‌گیرم که ۲۴ تا جا بشه»] ‖ U: بام ۱۵۰ متر نیست، ۱۲۰ متره</span> — _context:_ <span dir="rtl">adult, rain-water tank; result AND plan depend on the corrected datum; a coefficient stands beside them</span>  
   → the result «۲۴ مترمکعب» is named stale (120 × 0.2 × 0.8 = 19.2) and the plan «مخزنِ ۲۵ مترمکعبی» is marked «با عددِ پیشین» in 🔭, 📜 and «امروز»; the page names the RESULT as stale — never the coefficient «۰٫۸» or the rainfall «۰٫۲»
5. [chat] <span dir="rtl">[recorded sequence datum «۲، ۹، ۱۴، ۱۷»; chat result «تفاضل‌ها ۷ و ۵ و ۳ هستن»] ‖ U: جملهٔ دوم رو اشتباه نوشتم، ۱۰ است نه ۹</span> — _context:_ <span dir="rtl">teen 16, pattern problem; only the differences that touch the corrected term depend on it</span>  
   → the differences «۷» and «۵» are stale (10 − 2 = 8, 14 − 10 = 4); the third difference «۳» (17 − 14) is NOT listed; none of the really derived numbers is missed and nothing independent is added to the list
6. [events] <span dir="rtl">[🎯 «از ۱۰ جلسه ۷ تا رو می‌رم؛ ۶۰ درصد» judged «شد» on her report «۷ تا رفتم»; practice session booked «(درست)»; look-back check of the closed problem: «یعنی ۷ از ۱۰، درست درومد»] ‖ U: اشتباه شمردم، ۶ جلسه رفته بودم نه ۷</span> — _context:_ <span dir="rtl">adult, habit problem; the corrected count is what the forecast verdict, the practice session and the look-back check were built on</span>  
   → all three are reached: the 🎯 row's verdict «شد» is marked «با عددِ پیشین» / re-opened for her judgment, the practice session's «(درست)» likewise, and the look-back check sentence is marked — not only a «سرانجامِ حدس» line changes; the calibration count follows the re-judgment; history kept
7. [chat] <span dir="rtl">[recorded unknown draft: «… الان فقط هفته‌ای دو بار ورزش می‌کنم»] ‖ U: اول گفتم هفته‌ای دو بار؛ دفترم رو نگاه کردم، سه بار بوده</span> — _context:_ <span dir="rtl">adult; a correction in narrative form («اول گفتم … بوده») while a record still holds the old value</span>  
   → the record is corrected («دو بار» ⇒ «سه بار», history kept) or the page asks once whether that record should change; it never answers «از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود — چیزی برای عوض کردن نبود» while a record still reads «دو بار»
8. [chat] <span dir="rtl">[recorded datum «قطرِ لوله ۲ سانت»; recorded result «دورِ لوله حدودِ ۶٫۳ سانت»] ‖ U: دوباره اندازه گرفتم، قطرش ۱٫۶ شد نه ۲؛ حالا چند تا بست لازم دارم؟</span> — _context:_ <span dir="rtl">adult, repair job; ONE message carries a correction AND a question</span>  
   → the correction is recorded (2 ⇒ 1.6) or asked once — never refused as «پرسش بود»; the derived «۶٫۳ سانت» is marked «با عددِ پیشین» (π × 1.6 = 5.03, π × 2 = 6.28); the question is then answered on the corrected value
9. [chat] <span dir="rtl">[recorded guess: «۴۵ تقسیم بر ۳۰ یعنی ۱٫۵ برابر»] ‖ U: ۴۵ نبود، ۳۶ بود</span> — _context:_ <span dir="rtl">adult; the page offers «این‌جا هم عوض شود؟» for the guess text that contains the old number AND a number derived from it</span>  
   → the proposed replacement is the exact recomputation of the WHOLE expression — «۳۶ تقسیم بر ۳۰ یعنی ۱٫۲ برابر» (36 ÷ 30 = 1.2) — or the page asks her instead of proposing; never a half-replaced «۳۶ تقسیم بر ۳۰ یعنی ۱٫۵ برابر»
10. [edit] <span dir="rtl">[chat: «هر دور ۲۵ دقیقه‌ست، ۴ دور یعنی ۱۰۰ دقیقه»; mind-card event built on that message] ‖ ✏️ «۲۵ ⇐ ۳۰ دقیقه»</span> — _context:_ <span dir="rtl">adult, study plan; ✏️ on the datum inside her own bubble</span>  
   → «یعنی ۱۰۰ دقیقه» is marked «با عددِ پیشین» (4 × 30 = 120); if a mind-card event is withdrawn the line NAMES which event («… پس گرفته شد: ⟨label⟩»), not only «۱ رویدادِ کارنامه»
11. [edit] <span dir="rtl">[chat: «تا حالا دو تا طرحِ اولیه کشیدم» ⇒ recorded «نتیجه (از گفت‌وگو): دو تا طرحِ اولیه کشیدم»] ‖ ✏️ «دو تا ⇐ سه تا»</span> — _context:_ <span dir="rtl">adult, design problem; ✏️ of a message whose result the page recorded from chat</span>  
   → the chat-recorded result is refreshed to the edited text (history: «اصلاح شد ⇐ دو تا»), also in the 📜 of a problem already «حل شد»; the page never says «از آن تکه هیچ رکوردی ساخته نشده بود» while «نتیجه (از گفت‌وگو)» keeps the old words
12. [prompt] <span dir="rtl">[مسئلهٔ رنگ: her correction 6 ⇒ 7 marked گام ۱–۳ stale on the page] ‖ [the same turn's prompt to the model]</span> — _context:_ <span dir="rtl">one result, two audiences</span>  
   → the model is told the SAME outcome she sees — which records went stale (گام ۱، ۲، ۳) — never `changed: []` / «بگو چیزی عوض نشد» beside a page line «✓ … گام‌ها کهنه شد»; the assistant's sentence and the page line do not contradict each other
13. [time] <span dir="rtl">[after a correction the page asks «نتیجهٔ ⟨…⟩ با عددِ تازه دوباره سنجیده شود؟»; verdict of the old result «کنار رفت»] ‖ [turn n+1: she talks about something else] ‖ [turn n+2]</span> — _context:_ <span dir="rtl">adult; an unanswered re-check question</span>  
   → the re-check question is still pending on turn n+2 (in the prompt and on the page) — it stays until she answers it; it is not dropped after one turn while the verdict still reads «کنار رفت»
14. [chat] <span dir="rtl">[recorded title and datum «جدولِ ۱۲×۱۲»; her written results «۱۴۴ خانه» and «نصفش ۷۲ تا»] ‖ U: جدول ۱۰×۱۰ بود نه ۱۲×۱۲ ‖ [page asks] ‖ U: بله عوض کن</span> — _context:_ <span dir="rtl">teen 17, tiling puzzle; title, datum and two of her own results hold the old size</span>  
   → the stale list contains BOTH her results (144 ⇒ 100, 72 ⇒ 50); after her «بله» the datum and the title read consistently «۱۰×۱۰ (۱۰۰ خانه)» — never «جدولِ ۱۰×۱۰ (۱۴۴ خانه)» and never a title left at 12×12; the ask list names each record once
15. [page] <span dir="rtl">[live problem form «ریاضی‌کردن»: «تعدادِ جعبه = ۱۶٫۸ ÷ ۸ … = ۲٫۱»; chat correction of the wall length as in مسئلهٔ رنگ]</span> — _context:_ <span dir="rtl">a FORM field that holds a number derived from the corrected datum</span>  
   → the form field is reached too — marked «با عددِ پیشین» or offered for change with the exact new value (2.45) — the forms do not keep the stale «= ۲٫۱» silently
16. [chat] <span dir="rtl">[مسئلهٔ رنگ ledger, all three steps stale after 6 ⇒ 7] ‖ U: گامِ ۱ رو از نو حساب کردم: ۷ × ۲٫۸ = ۱۹٫۶</span> — _context:_ <span dir="rtl">she redoes the first dependant herself</span>  
   → گام ۱ becomes ✓ on the new value (7 × 2.8 = 19.6, page-checked) and loses its stale mark; گام ۲ and ۳ REMAIN marked until redone; the resume point is گام ۲
17. [chat] <span dir="rtl">[recorded: «وام ۱۸۰ میلیونه، سودش ۱۸ درصد، سالی ۳۲٫۴ میلیون سود میدم»] ‖ U: یه چیزی رو اشتباه گفتم، سودش ۲۱ درصده. راستی این وام رو بگیرم اصلاً یا نه؟</span> — _context:_ <span dir="rtl">adult, high-stakes decision; correction + a second, larger question</span>  
   → the correction lands (18 ⇒ 21 %) and «۳۲٫۴ میلیون» is marked «با عددِ پیشین» (180 × 0.21 = 37.8); the question is treated as her question for this turn; nothing is refused as «پرسش بود»

### Negative (look-alike)

1. [chat] <span dir="rtl">[مسئلهٔ رنگ ledger] + [elsewhere in the chat: «قلم‌موی ۶ سانتی دارم» and «ساعتِ ۶ عصر شروع می‌کنم»] ‖ U: طولِ دیوار ۷ متره، نه ۶</span> — _context:_ <span dir="rtl">the old value «۶» appears in two unrelated roles</span>  
   → the brush width and the hour are NOT marked and not offered for change; only the three derived steps are
2. [chat] <span dir="rtl">[recorded: «ارتفاعِ دیوار ۳ متره، پس مساحت ۳ × ۵ = ۱۵ مترمربع» and separately «سیمِ ۱۵ متری که از قبل داشتم کافیه» and «۳ تا کارگر میان»] ‖ U: ارتفاع ۳ نیست، ۳٫۲ متره</span> — _context:_ <span dir="rtl">adult; a derived 15 beside a coincidental 15 and a coincidental 3</span>  
   → only «۱۵ مترمربع» is stale (3.2 × 5 = 16); the «سیمِ ۱۵ متری» and «۳ تا کارگر» are never marked — marking follows derivation, not equal digits
3. [chat] <span dir="rtl">[recorded goal «تو ۱۲ هفته ۶ کیلو کم کنم، یعنی هفته‌ای ۰٫۵ کیلو»; measured report «این هفته ترازو ۰٫۵ کیلو کمتر نشون داد»] ‖ U: مهلتم ۱۲ هفته نیست، ۱۵ هفته‌ست</span> — _context:_ <span dir="rtl">adult; a DERIVED 0.5 and a MEASURED 0.5 that happen to be equal</span>  
   → the derived rate «هفته‌ای ۰٫۵ کیلو» is stale (6 ÷ 15 = 0.4); the measured «۰٫۵ کیلو» of this week is NOT marked and gets no «⇒ ≈ …» recomputation — a measurement is not derived
4. [chat] <span dir="rtl">[rain-water tank records as in the positive] ‖ U: بام ۱۵۰ متر نیست، ۱۲۰ متره</span> — _context:_ <span dir="rtl">the same correction, looking at the independent data</span>  
   → «ضریبِ جمع‌آوری ۰٫۸» and «بارش ۰٫۲ متر» keep their state; neither is called «نتیجهٔ کهنه»; her goal sentence (if any) is untouched
5. [chat] <span dir="rtl">[no record of any kind holds «چهارشنبه»: she only said it inside a greeting that was stripped] ‖ U: گفتم چهارشنبه، منظورم پنجشنبه بود</span> — _context:_ <span dir="rtl">a correction of words that were never recorded</span>  
   → here «چیزی برای عوض کردن نبود» IS the right answer (said once, plainly); nothing is marked stale
6. [chat] <span dir="rtl">[recorded datum «قطرِ لوله ۲ سانت»] ‖ U: به نظرت لولهٔ ۱٫۶ بهتره یا همین ۲؟</span> — _context:_ <span dir="rtl">a pure question that mentions two values</span>  
   → NOT a correction — no record changes, no stale mark; answered as a question
7. [chat] <span dir="rtl">[مسئلهٔ رنگ ledger] ‖ U: اگه دیوار ۷ متر بود چقدر رنگ می‌خواست؟</span> — _context:_ <span dir="rtl">a what-if, not a correction («اگه … بود»)</span>  
   → the datum stays 6; nothing is marked stale; the what-if is answered beside the record (19.6 m² ⇒ 2.45 L per coat) without rewriting it
8. [chat] <span dir="rtl">[problem A recorded: «۴۵۰ کیلومتر» (trip)] · [problem B, another record in the same session: «۴۵۰ گرم آرد»] ‖ U: (bound to problem A) مسیر ۴۵۰ نیست، ۴۸۰ کیلومتره</span> — _context:_ <span dir="rtl">two problems in one session with an equal number</span>  
   → nothing in problem B is marked or offered; the correction and its stale marks stay inside problem A
9. [chat] <span dir="rtl">U: گزارشِ دو هفتهٔ قبل رو فرستادم ‖ … ‖ U: گزارشِ ۵ روزِ آخر هم آماده‌ست</span> — _context:_ <span dir="rtl">adult; two different quantities in two messages, no correction words at all</span>  
   → no «این‌جا هم عوض شود؟ («۵» به‌جای «دو»)»; no stale mark; nothing is treated as a correction
10. [chat] <span dir="rtl">[chat problem statement: «فاصلهٔ دو شهر ۳۴۰ کیلومتره، با سرعتِ ۸۵ چقدر طول می‌کشه؟»; her result «۳۴۰ دقیقه»] ‖ U: جوابم رو اشتباه گفتم، ۳۴۰ دقیقه نه، ۲۴۰ دقیقه</span> — _context:_ <span dir="rtl">teen 15; her wrong ANSWER shares its digits with a datum of the statement</span>  
   → only the result changes (340 ÷ 85 = 4 h = 240 min); the statement's «۳۴۰ کیلومتر» is NOT rewritten to 240
11. [edit] <span dir="rtl">[chat: «گامِ ۳ رو فردا انجام میدم» and a recorded result «۳ تا نمونه گرفتم» in another message] ‖ ✏️ on the second message: «۳ تا ⇐ ۴ تا»</span> — _context:_ <span dir="rtl">a step index equal to the edited number</span>  
   → «گامِ ۳» (an index) is not changed and not marked; only the recorded «نمونه» result is refreshed
12. [chat] <span dir="rtl">[recorded: «x + 4 + 8 + 7 + y = ۳۰» as step text; separately datum «۴ نفر مهمون داریم»] ‖ U: مهمونا ۴ نفر نیستن، ۵ نفرن</span> — _context:_ <span dir="rtl">the corrected «۴» also appears as a term of an unrelated expression</span>  
   → no proposal «x+4+8+7+y ⇐ x+5+8+7+y»; the expression is not derived from the guest count and stays as written
13. [chat] <span dir="rtl">[the re-check question after a correction was asked] ‖ U: آره دوباره بسنج</span> — _context:_ <span dir="rtl">she answers the pending re-check question</span>  
   → the question is answered and STOPS — it is not asked again on the following turns

## Q3.one_problem_one_record · one problem, one record (naming another problem binds the turn to it or the page asks which — C21; plan, result, guess, forecast verdict, prerequisite and route destination belong to the problem they were said about, with no copies into another problem's 📜 or 🧭; with two open forecasts an outcome names its forecast or the page asks; question sentences about another problem never become «داده» of the live one; a second AND a third problem each get their own record; the session dossier counts problems, not messages). Base session for many entries — «نشستِ سه‌مسئله»: problem A «چیدنِ قفسه‌های انباری» (registered earlier, plan exists), problem B «برنامهٔ امتحانِ فیزیک» (the one live in the chat now), problem C «قبضِ آبِ زیاد» (raised third). pos = the record must land on the problem it was said about (or the page must ask); neg = a look-alike where no re-binding, no ask or no extra record is right.


### Positive

1. [chat] <span dir="rtl">[نشستِ سه‌مسئله; B is live] ‖ U: برگردیم به مسئلهٔ قفسه‌های انباری: اشتباه شمرده بودم، ۵ طبقه جا میشه نه ۴</span> — _context:_ <span dir="rtl">adult; return by naming, with a correction of A's result</span>  
   → the turn is bound to A (or the page asks «کدام مسئله؟» once): «# وضعِ کنونی», stage and turn question are A's; the correction candidates come from A's records; nothing — datum, result or correction — is filed under B, which was merely live
2. [chat] <span dir="rtl">[B live] ‖ U: واسه همون قفسه‌ها، پنجشنبه میرم چوب بخرم</span> — _context:_ <span dir="rtl">adult; a PLAN said about A by name («همون قفسه‌ها»), ZWNJ missing</span>  
   → the plan is recorded on A (its 🧭 and 📜), or the page asks which problem; B's 🧭 «مانده» and plan list do not change and B's 📜 gets no «برنامه» line
3. [chat] <span dir="rtl">[B live] ‖ U: راستی حدسم دربارهٔ قبضِ آب اینه که فلوترِ کولر خرابه</span> — _context:_ <span dir="rtl">adult; a GUESS about problem C while B is live</span>  
   → the guess is recorded on C (or the page asks); B gets no guess point on its 🧭 and no «حدس (از گفت‌وگو)» in its 📜
4. [chat] <span dir="rtl">[B live; while talking about A she turned out not to know how to read a tape measure in inches] ‖ U: توی اون مسئلهٔ قفسه‌ها بود که فهمیدم اینچ رو بلد نیستم تبدیل کنم</span> — _context:_ <span dir="rtl">adult; a PREREQUISITE said about A</span>  
   → the prerequisite point is on A's 🧭 (or asked); it is not shown as an open prerequisite of B («۱ پیش‌نیازِ باز تا برگشت به خط» must not appear on B)
5. [route] <span dir="rtl">[B live, destination «نمرهٔ بالای ۱۷ در فیزیک»] ‖ U: مقصدِ من تو مسئلهٔ قبض اینه که ماهی زیرِ ۲۰ مترمکعب مصرف کنیم</span> — _context:_ <span dir="rtl">adult; a destination sentence about C</span>  
   → C's strip/🧭 destination takes that sentence; B's destination stays «نمرهٔ بالای ۱۷ در فیزیک»; the second problem never becomes the destination of the first
6. [events] <span dir="rtl">[two open 🎯: (1) on A «تا آخرِ هفته ۴ تا قفسه رو سوار می‌کنم؛ ۷۰ درصد», due passed · (2) on B «امتحان رو بالای ۱۷ میشم؛ ۹۰ درصد», due in D0+6] ‖ U: گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا</span> — _context:_ <span dir="rtl">adult; an outcome that NAMES its forecast by its content</span>  
   → the verdict «نشد» is booked on forecast (1) only; forecast (2) keeps «باز» until its own due date — nothing is judged four-plus days early on the other forecast; no third forecast row is created from the outcome sentence
7. [events] <span dir="rtl">[the same two open 🎯] ‖ U: پیش‌بینیم درست درومد!</span> — _context:_ <span dir="rtl">adult; an outcome that does NOT say which forecast</span>  
   → ASK — the page asks once which forecast she means, naming both; nothing is booked until she answers
8. [chat] <span dir="rtl">[live: decision «لپ‌تاپ بخرم یا نه»] ‖ U: راستی اون قضیهٔ اجاره چی شد؟ صاحبخونه قبول کرد تمدید کنه؟ اصلاً جواب داد؟</span> — _context:_ <span dir="rtl">adult; three QUESTION sentences about another problem</span>  
   → none of the three becomes a «داده» row (or any record) of the laptop decision; they are treated as questions about the other problem (bind or ask)
9. [page] <span dir="rtl">[one chat: problem B registered ‖ later U: یه مسئلهٔ دیگه: قبضِ آبمون دو برابر شده ‖ later U: یه مسئلهٔ سوم هم هست، باید برای مادرم پرستار پیدا کنم]</span> — _context:_ <span dir="rtl">adult; a second and a third problem raised mid-chat</span>  
   → three records — each of the second AND the third problem has its own record, stage, 🧭 and 📜; the second is not swallowed when the third appears, and neither is data of the first
10. [page] <span dir="rtl">[📜 session dossier after ONE problem with: the opening, a day-2 report «دیروز گامِ ۲ رو رفتم»، a practice request، and the sentence «راستی من متولدِ ۱۳۶۲ هستم»]</span> — _context:_ <span dir="rtl">adult; several messages, one problem</span>  
   → the dossier shows «مسئلهٔ ۱ از ۱» — later messages of the same problem (a report, a practice request, a birth sentence) are not new «مسئلهٔ گفت‌وگو» entries; never «۲ از ۲» or «۴ از ۴»
11. [page] <span dir="rtl">[A has plan «اول اندازه می‌گیرم، بعد چوب می‌خرم» and a line «انجام شد: اندازه گرفتم»] ‖ [open the 📜 of B and of C]</span> — _context:_ <span dir="rtl">each problem's 📜 matched line by line against its own events</span>  
   → neither B's nor C's 📜 contains A's plan or A's «انجام شد» line; every line of a problem's 📜 comes from that problem's own events
12. [route] <span dir="rtl">[A registered with «مانده: ۲ گام از ۴»] ‖ [C is created in the same chat at her request and gets a plan «شیرها رو یکی‌یکی می‌بندم»]</span> — _context:_ <span dir="rtl">adult; two problems in one conversation</span>  
   → A's 🧭 «مانده» still names A's own next step; C's plan appears only in C's 🧭/📜/form; no «برنامه» record of C sits in A's form
13. [chat] <span dir="rtl">[three earlier problems in the session; B live] ‖ U: برگردیم به اون مسئلهٔ قبلی</span> — _context:_ <span dir="rtl">adult; «the previous problem» with more than one candidate</span>  
   → ASK — the page asks which problem, naming the candidates; nothing from this or the next message is filed under B until she answers
14. [events] <span dir="rtl">[🎯 made inside A: «با ۳ تا قفسه جا میشه؛ ۸۰ درصد»] ‖ [B live] ‖ U: اون پیش‌بینیِ قفسه‌ها غلط بود، ۴ تا لازم شد</span> — _context:_ <span dir="rtl">adult; a forecast verdict reported while another problem is live</span>  
   → the 🎯 of A is judged «نشد» and leaves «امروز»; the verdict line is in A's 📜; B's 📜 and mind-card rows gain nothing from it
15. [chat] <span dir="rtl">[B live] ‖ U: مسئلهٔ قفسه‌ها تموم شد، هر ۵ طبقه سوار شد. حالا یه چیزِ تازه: ماشینم صبح‌ها دیر روشن میشه</span> — _context:_ <span dir="rtl">adult; one message with A's RESULT (by name) and a brand-new problem</span>  
   → the result goes to A; the new problem gets its own record; B — merely live — receives neither
16. [prompt] <span dir="rtl">[A closed, B live] ‖ U: یه سؤال دربارهٔ قفسه‌ها: اگه طبقه‌ها رو ۳۵ سانتی بگیرم چند تا جا میشه؟</span> — _context:_ <span dir="rtl">adult; a question about a named, closed problem</span>  
   → the prompt carries A's block (its data and result) for this turn or the page asks; the answer is not computed from B's data; nothing is recorded as a datum of B

### Negative (look-alike)

1. [chat] <span dir="rtl">[B live] ‖ U: این هم مثلِ همون قفسه‌هاست، اول باید اندازه بگیرم؛ پس اول ببینم امتحان چند فصل داره</span> — _context:_ <span dir="rtl">adult; A is mentioned only as an ANALOGY, the content is about B</span>  
   → not a return — the plan «اول ببینم امتحان چند فصل داره» is B's (or the page asks which); A's record gains no plan, datum or result
2. [chat] <span dir="rtl">[B live, one problem in the session] ‖ U: یه سؤالِ دیگه دربارهٔ همین: فصلِ نوسان رو اول بخونم یا آخر؟</span> — _context:_ <span dir="rtl">adult; a further question about the SAME problem</span>  
   → no new record, no «کدام مسئله؟»; the dossier still counts one problem
3. [events] <span dir="rtl">[exactly ONE open 🎯] ‖ U: پیش‌بینیم درست درومد!</span> — _context:_ <span dir="rtl">adult; only one forecast is open</span>  
   → no ask — the single open forecast is judged «شد»
4. [events] <span dir="rtl">[two open 🎯 as in the positive] ‖ U: امتحان رو ۱۸ شدم، همون‌طور که با ۹۰ درصد گفته بودم</span> — _context:_ <span dir="rtl">adult; the outcome names forecast (2) by content</span>  
   → forecast (2) is judged «شد» with no ask; forecast (1) is untouched
5. [page] <span dir="rtl">[one chat with two REAL problems: B, then «قبضِ آب» registered at her request]</span> — _context:_ <span dir="rtl">adult; two genuine problems</span>  
   → «مسئلهٔ ۲ از ۲» is right here — the count is per problem
6. [chat] <span dir="rtl">[B live, the only problem] ‖ U: فردا صبح فصلِ ۳ رو می‌خونم</span> — _context:_ <span dir="rtl">adult; a plan sentence with no problem name and one live problem</span>  
   → recorded on B directly — no «کدام مسئله؟» when there is nothing to choose between
7. [chat] <span dir="rtl">[B live] ‖ U: برگردیم به برنامهٔ امتحانِ فیزیک، کجا بودیم؟</span> — _context:_ <span dir="rtl">adult; she names the problem that is ALREADY live</span>  
   → no re-binding and no ask; the turn continues B
8. [chat] <span dir="rtl">[live: decision «لپ‌تاپ بخرم یا نه»] ‖ U: لپ‌تاپِ فعلیم ۸ گیگ رم داره و باتریش ۴۰ دقیقه دووم میاره. به نظرت همین کافی نیست؟</span> — _context:_ <span dir="rtl">adult; data sentences plus a question about the LIVE problem</span>  
   → the two data sentences may become «داده» of the laptop decision (they are about it); the question sentence is not a datum
9. [chat] <span dir="rtl">[B live; A exists] ‖ U: قفسهٔ کتابام رو هم باید مرتب کنم ولی الان مهم نیست. بگو فصلِ ۲ رو چطور خلاصه کنم</span> — _context:_ <span dir="rtl">adult; the word «قفسه» in passing (a different shelf, not problem A), then B's content</span>  
   → no binding to A and nothing filed on A from the shared word; at most one ask; the request about «فصلِ ۲» is B's
10. [page] <span dir="rtl">[A has plan «اول اندازه می‌گیرم، بعد چوب می‌خرم» and «انجام شد: اندازه گرفتم»] ‖ [open A's OWN 📜]</span> — _context:_ <span dir="rtl">the owner problem's dossier</span>  
   → both lines ARE there — keeping records apart must not remove a problem's own events
11. [chat] <span dir="rtl">[B live; records exist only for A, B and C] ‖ U: برگردیم به مسئلهٔ ماشین</span> — _context:_ <span dir="rtl">adult; she names a problem that has NO record</span>  
   → no binding to any existing record and nothing filed under B; the page asks (which problem / is it a new one?) and creates nothing silently

## Q4.prior_reply_reading · prior-work reply reading (any later report she calls her own work merges — the third as well as the second; her fix lands the same turn when the page's check agrees — C8 — whether one computation, a chain with each link judged, or a non-numeric repair the model's validated step confirms; a dispute by meaning is heard like an explicit one; a take-back of a dispute restores the earlier state with history — C5; «X را قبول کردم و Y را نه» gives each step its own state; an intermediate or unrelated result is never «her fix» of the resume step; the resume question never lands on a step she made obsolete; the turn question never says «همه درست» beside a ✗; no prior block on mid-solution or post-closure arithmetic or on a mastery answer; a fixed step drops its old dispute reason). Base problem — «مسئلهٔ وام» (adult, high-stakes): opening ledger گام ۱ «قسط ماهی ۴٫۵ میلیون، ۲۴ ماه، روی هم ۱۰۸ میلیون» ✓ · گام ۲ «اصلِ وام ۸۰ میلیونه، پس سود ۱۰۸ − ۸۰ = ۳۸ میلیون» ✗ · گام ۳ «۳۸ ÷ ۸۰ = ۰٫۴۷۵ یعنی ۴۷٫۵ درصد» وابسته به گامِ ۲ · گام ۴ «پس بانکِ دوم که ۴۰ درصد می‌گیره ارزون‌تره» وابسته. pos = the reply must be read as stated; neg = a look-alike that must not be.


### Positive

1. [chat] <span dir="rtl">[مسئلهٔ وام, 4 steps] ‖ [D0+1: a second report of hers, گام ۵–۶, merged] ‖ D0+2 U: اینم ادامهٔ کارِ خودمه، ببین: گامِ ۷: با کارمزد میشه ۱۰۸ + ۱٫۶ = ۱۰۹٫۶ میلیون. گامِ ۸: ماهی ۱۰۹٫۶ ÷ ۲۴ ≈ ۴٫۵۷</span> — _context:_ <span dir="rtl">a THIRD report she calls her own work, with numbered steps</span>  
   → the report request fires and گام ۷–۸ enter the ledger (108 + 1.6 = 109.6 ✓; 109.6 ÷ 24 = 4.566… ≈ 4.57 ✓): the ledger now has 8 rows and its header counts 8 — it does not stay at the earlier count, and if anything is not merged a page line says so
2. [chat] <span dir="rtl">[مسئلهٔ وام] ‖ U: آها دیدم، ۱۰۸ منهای ۸۰ میشه ۲۸، نه ۳۸</span> — _context:_ <span dir="rtl">her fix of the judged step as ONE computation</span>  
   → گام ۲ becomes ✓ «۲۸ میلیون (اصلاح شد ⇐ ۳۸)» in the SAME turn (108 − 80 = 28, the page's check agrees); the resume point moves to گام ۳; never «متنِ تازه‌ات … هنوز با حسابِ صفحه یا حکم نمی‌خواند — گام همان می‌ماند»
3. [chat] <span dir="rtl">[مسئلهٔ وام] ‖ U: درستش کردم: سود = ۱۰۸ − ۸۰ = ۲۸. نسبت = ۲۸ ÷ ۸۰ = ۰٫۳۵، یعنی ۳۵ درصد</span> — _context:_ <span dir="rtl">her fix as a CHAIN of computations covering the wrong step and its dependant</span>  
   → each link is judged (108 − 80 = 28 ✓; 28 ÷ 80 = 0.35 ✓) and both land the same turn: گام ۲ ✓, گام ۳ ✓ with its «وابسته» mark cleared; the resume point moves to گام ۴ (the conclusion must now be redone — 35 % against 40 %); the fix is not refused because the message has «=» and «÷» in it
4. [chat] <span dir="rtl">[مسئلهٔ وام, گام ۴ now the resume step] ‖ U: دوباره حساب کردم. بانکِ اول = ۲۸ ÷ ۸۰ = ۰٫۳۵. بانکِ دوم = ۳۲ ÷ ۸۰ = ۰٫۴. پس بانکِ اول ارزون‌تره.</span> — _context:_ <span dir="rtl">her fix of ONE judged step made of two computations and a conclusion</span>  
   → both computations ✓ (0.35; 0.4), the model's validated step agrees ⇒ گام ۴ is fixed this turn with the new text; the ledger does not keep the old conclusion «بانکِ دوم ارزون‌تره»; resume moves past it
5. [chat] <span dir="rtl">[proof ledger: گام ۲ «چون مجموعِ دو عددِ فرد زوجه، پس حاصل‌ضربشون هم زوجه» ✗ (non-numeric)] ‖ U: گامِ ۲ رو عوض کردم: حاصل‌ضربِ دو عددِ فرد فرده، چون (2a+1)(2b+1) = 2(2ab+a+b)+1</span> — _context:_ <span dir="rtl">teen 17; a NON-numeric repair; the model reports the step valid with her fresh quote</span>  
   → the repair lands the same turn from the model's validated step (the identity (2a+1)(2b+1) = 2(2ab+a+b)+1 holds); the ledger shows the new text ✓ with history, no longer the old claim ✗ as the resume point; the turn question is not stale for turns afterwards
6. [chat] <span dir="rtl">[the same proof ledger] ‖ U: آره حق با توئه، گامِ ۲ غلط بود</span> — _context:_ <span dir="rtl">teen 17; she confirms that her non-numeric step was wrong, with no new text yet</span>  
   → گام ۲ = accepted-as-wrong (her «تأیید»); the page does not answer «متنِ تازه‌ات … نمی‌خواند — گام همان می‌ماند» to a plain agreement; resume stays at گام ۲ awaiting her repair
7. [chat] <span dir="rtl">[مسئلهٔ وام verdicts shown] ‖ U: گامِ اول به نظرم یه جاش می‌لنگه، مطمئن نیستم ۲۴ ماه بوده باشه</span> — _context:_ <span dir="rtl">a dispute BY MEANING of a ✓ verdict, the step named with an ordinal word («گامِ اول»), no «قبول ندارم»</span>  
   → read as a dispute of گام ۱'s verdict ⇒ a re-check block with evidence this turn and the state on the page («بازسنجی»), with a way to take it back; never the A073 line «خودت فکر می‌کنی چرا؟», never ignored
8. [chat] <span dir="rtl">[مسئلهٔ وام verdicts shown] ‖ U: نه، گامِ ۱ رو قبول ندارم</span> — _context:_ <span dir="rtl">an explicit rejection of a verdict that was «✓ درست»</span>  
   → heard as a dispute of گام ۱ — re-check with evidence (4.5 × 24 = 108), result recorded («دوباره سنجیده شد — حکم ماند»); the rejection of a ✓ verdict is not dropped
9. [chat] <span dir="rtl">[she had disputed گام ۳; the dispute is recorded] ‖ U: اون «قبول ندارم» که دربارهٔ گامِ ۳ گفتم اشتباهی بود؛ حکمِ اولت درست بود</span> — _context:_ <span dir="rtl">a TAKE-BACK of a dispute, in words, with the word «قبول ندارم» quoted inside it</span>  
   → the earlier state of گام ۳ is restored with history («رد ⇒ پس گرفته شد»); it is NOT read as a new dispute — no turn question «همین پیام حکمِ گامِ ۳ را رد می‌کند … با شاهد دوباره بسنج»
10. [chat] <span dir="rtl">[مسئلهٔ وام verdicts shown] ‖ U: گامِ ۴ رو قبول کردم و گامِ ۳ رو نه</span> — _context:_ <span dir="rtl">a mixed reply whose «نه» comes at the END</span>  
   → گام ۴ = accepted, گام ۳ = disputed (re-check queued) — each step its own state; never گام ۳ «تأییدِ تو ✓» with the turn question «حکمِ گامِ ۳ را پذیرفتی …»
11. [chat] <span dir="rtl">[مسئلهٔ وام; resume at گام ۲] ‖ U: گامِ ۳ همون‌طور که گفتی به ۲ وابسته‌ست قبول، ولی گامِ ۲ رو نمی‌پذیرم، ۳۸ درسته</span> — _context:_ <span dir="rtl">acceptance first, rejection second, different verbs («قبول» / «نمی‌پذیرم»)</span>  
   → گام ۳ accepted, گام ۲ disputed ⇒ ONE re-check with evidence (108 − 80 = 28); the verdict stays; the dispute question is asked at most once after the re-check
12. [chat] <span dir="rtl">[مسئلهٔ وام; گام ۲ was disputed, re-checked («حکم ماند — ۱۰۸ − ۸۰ = ۲۸»), then she fixed it and it is ✓]</span> — _context:_ <span dir="rtl">a fixed step that carries an old dispute reason</span>  
   → the ✓ row no longer shows the stale «حکم ماند — …» dispute reason beside it; the dispute and the fix remain in 📜 as history only
13. [chat] <span dir="rtl">[مسئلهٔ وام; گام ۲ ✗ «ناقص/نادرست» with old text] ‖ U: ۱۰۸ − ۸۰ = ۲۸ میلیون سود</span> — _context:_ <span dir="rtl">her correct recomputation, result followed by a scale word</span>  
   → the ledger row shows her NEW text as the step (28 ✓ — the scale word is a unit, Q1) and the old text only as «اصلاح شد ⇐ …»; no misleading line that the new text «هنوز نمی‌خواند» while the arithmetic block reads the same numbers ✓
14. [chat] <span dir="rtl">[مسئلهٔ وام; resume at گام ۲] ‖ U: گامِ ۲ رو درست کردم شد ۲۸. ولی نسبتش: ۲۸ ÷ ۸۰ = ۰٫۴۵</span> — _context:_ <span dir="rtl">one message with a correct fix AND a new wrong line</span>  
   → گام ۲ ✓ (28); the new line is ✗ (28 ÷ 80 = 0.35, not 0.45) and گام ۳ stays not-✓; the bold turn question is the resume at that step — never «همهٔ گام‌های پیشینت درست درآمد — گامِ بعدی؟» beside a ✗ of the same message
15. [chat] <span dir="rtl">[مسئلهٔ وام] ‖ U: گامِ ۴ رو کلاً گذاشتم کنار؛ بانکِ دوم دیگه وام نمیده، مقایسه بی‌معنی شد</span> — _context:_ <span dir="rtl">she makes a step OBSOLETE</span>  
   → the resume question never lands on گام ۴ afterwards; the ledger shows it as set aside by her (history kept), not as an open ✗ to be repaired
16. [events] <span dir="rtl">[مسئلهٔ وام; she restates گام ۱ three times across later reports, unchanged]</span> — _context:_ <span dir="rtl">mind card after repeated reports</span>  
   → گام ۱ is credited ONCE — a re-report of the same step does not add another «+ … خودش درست کرد» row (5 steps never become 14 positives)
17. [chat] <span dir="rtl">[she disputed the ✓ of گام ۱ by pressing «✗ نه» by mistake] ‖ U: نه نه اشتباه زدم، گامِ ۱ همون درست بود</span> — _context:_ <span dir="rtl">take-back from chat of a mistaken rejection of a ✓ verdict</span>  
   → restored to accepted ✓ with history; the dispute question for گام ۱ stops; no re-check is queued

### Negative (look-alike)

1. [chat] <span dir="rtl">[the coach is guiding her through a live problem, execution stage] ‖ U: خودم نشستم حساب کردم: ۳ × ۴۵ = ۱۳۵ و با ۲۰ تا میشه ۱۵۵</span> — _context:_ <span dir="rtl">mid-solution arithmetic with «خودم … حساب کردم»</span>  
   → NO «# کارِ پیشینِ تو» block and no report request (the arithmetic itself is still checked by the reader: 3 × 45 = 135, 135 + 20 = 155 ✓); recorded as the current step's result
2. [chat] <span dir="rtl">[the problem is closed «✅ حل شد»] ‖ U: واسه اطمینان دوباره حساب کردم، همون ۲۸ میلیون درمیاد</span> — _context:_ <span dir="rtl">post-closure arithmetic</span>  
   → no prior block, no new ledger rows; at most a look-back note
3. [chat] <span dir="rtl">[after chat_solved the page gives a mastery question] ‖ U: جوابش میشه ۳۵ درصد، چون ۲۸ تقسیم بر ۸۰ رو حساب کردم</span> — _context:_ <span dir="rtl">a mastery / test answer</span>  
   → goes to the mastery check — no prior-work contract, no «کارِ پیشین» request in the prompt
4. [chat] <span dir="rtl">U: جلسهٔ تمرینِ امروز: از ۶ تا سؤال ۴ تا رو درست زدم</span> — _context:_ <span dir="rtl">a practice-session report</span>  
   → booked as the practice session; no prior block and no «کلِ مسئله را در یک جمله …» question
5. [chat] <span dir="rtl">[مسئلهٔ وام; resume at گام ۲] ‖ U: راستی کارمزد رو هم حساب کردم: ۸۰ × ۰٫۰۲ = ۱٫۶ میلیون</span> — _context:_ <span dir="rtl">an intermediate result about something else, correct in itself</span>  
   → NOT booked as «اصلاحِ خودش» of گام ۲ and no «تأییدِ تو ✓» on it (80 × 0.02 = 1.6 is a new step/result of its own); گام ۲ stays ✗ and stays the resume point
6. [chat] <span dir="rtl">[مسئلهٔ وام; resume at گام ۲] ‖ U: آها، پس سود میشه ۲۹ میلیون</span> — _context:_ <span dir="rtl">her «fix» is still wrong (108 − 80 = 28)</span>  
   → NOT applied even if the model calls it valid (C8): the page's own check disagrees, shows its computation and asks; گام ۲ stays ✗; the right number is not given away
7. [chat] <span dir="rtl">[she had ACCEPTED the verdict of گام ۳] ‖ U: اشتباهی بود که گامِ ۳ رو قبول کردم، الان که نگاه می‌کنم قبولش ندارم</span> — _context:_ <span dir="rtl">looks like a take-back, but what she takes back is an ACCEPTANCE</span>  
   → this IS a new dispute of گام ۳ ⇒ re-check with evidence; it is not «restored to accepted»
8. [chat] <span dir="rtl">[مسئلهٔ وام verdicts shown] ‖ U: گامِ ۴ رو قبول کردم و گامِ ۳ رو هم</span> — _context:_ <span dir="rtl">look-alike of the mixed reply, both accepted</span>  
   → both steps accepted; nothing disputed, no re-check
9. [chat] <span dir="rtl">[مسئلهٔ وام verdicts shown] ‖ U: گامِ ۳ رو نه هنوز، نرسیدم نگاهش کنم</span> — _context:_ <span dir="rtl">«نه هنوز» about her time</span>  
   → not a dispute and not an acceptance; گام ۳ keeps its state
10. [chat] <span dir="rtl">[مسئلهٔ وام] ‖ U: گامِ ۴ رو فعلاً نگه می‌دارم برای بعد، اول ۲ رو درست کنم</span> — _context:_ <span dir="rtl">postponing, not discarding</span>  
   → گام ۴ is NOT set aside as obsolete; it stays in the ledger in its state; resume = گام ۲
11. [chat] <span dir="rtl">[مسئلهٔ وام after گام ۲, ۳, ۴ were all fixed and judged ✓] ‖ U: خب دیگه چی مونده؟</span> — _context:_ <span dir="rtl">every row of the ledger is ✓</span>  
   → here «همهٔ گام‌های پیشینت درست درآمد — گامِ بعدی؟» is legitimate
12. [chat] <span dir="rtl">[مسئلهٔ وام] ‖ U: همکارم این‌طوری حساب کرده بود: گام ۱: ۴ × ۲۴ = ۹۶ …</span> — _context:_ <span dir="rtl">a report of SOMEONE ELSE's work</span>  
   → not merged into HER ledger as her steps and not credited to her on the mind card (4 × 24 = 96 may still be read by the arithmetic reader)
13. [chat] <span dir="rtl">[مسئلهٔ وام] ‖ U: گامِ ۱ همون ۱۰۸ میلیون میشه دیگه، درسته؟</span> — _context:_ <span dir="rtl">she restates a ✓ step</span>  
   → no change, no new credit, no dispute; the resume point stays at گام ۲

## Q5.dates_today · dates and «امروز» (a date ask is made only for her OWN FUTURE action — C19; every date that reaches «امروز», from her or from the model's report, passes the page's «… درست است؟» and her yes — C12 on both paths; «جمعهٔ بعد», «هفتهٔ بعد، جمعه», «آخرِ هفتهٔ بعد» are read; «باشه» is a yes to the page's pending question; a pending ask is never dropped silently and her typed answer gets one confirming line; a day she negated is never offered back). All dates are relative to the test clock: D0 = the clock's day; weeks run Saturday–Friday; «the first ⟨weekday⟩ after D0» is computed at run time and shown in Jalali. Where an entry needs a particular weekday the context says «clock on a Monday / a Friday». pos = the date must be asked / read / booked as stated; neg = a look-alike with NO date ask (or the stated different result).


### Positive

1. [time] <span dir="rtl">U: شنبه میرم بانک و پرونده رو تحویل میدم</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday; her own future action with a weekday</span>  
   → the page asks once «📅 از حرفِ خودت: … ⟨the first Saturday after D0 = D0+4⟩ — در «امروز» بیاید؛ درست است؟» and books it on her yes; nothing is booked before her yes
2. [time] <span dir="rtl">U: تا جمعه فرمِ ثبت‌نام رو می‌فرستم ‖ [page: «همین امروز یا جمعهٔ بعد؟»] ‖ U: جمعهٔ بعد</span> — _context:_ <span dir="rtl">adult; clock on a FRIDAY; C1 ask, then her typed answer</span>  
   → «جمعهٔ بعد» is read as the answer: due = D0+7, with ONE confirming line in the chat («📅 ثبت شد: …»); while the question was pending nothing was booked for D0 from the model's `when`; the plan does not stay «موعد: ⟨D0⟩ — انجام شد؟»
3. [time] <span dir="rtl">U: جمعه‌ی بعد شام رو ساعت ۸ می‌خوریم که زودتر بخوابم</span> — _context:_ <span dir="rtl">adult; clock on a FRIDAY; she herself wrote «جمعه‌ی بعد» (with «ه‌ی»)</span>  
   → read as D0+7 and confirmed with «… درست است؟»; the page does NOT ask «امروز خودش جمعه است: همین امروز یا جمعهٔ بعد؟» — she already said which; one question, not two in one 📅 line
4. [time] <span dir="rtl">U: هفته‌ی بعد، جمعه میرم می‌خرمش</span> — _context:_ <span dir="rtl">adult; clock on a MONDAY; «هفتهٔ بعد، جمعه» with a comma between</span>  
   → the page's own reading from her sentence is the Friday of the following week = D0+11, shown with «… درست است؟»; it is never booked as the coming Friday (D0+4) from the model's `when` without the question
5. [time] <span dir="rtl">U: آخرِ هفتهٔ بعد میرم شهرستان سراغش</span> — _context:_ <span dir="rtl">adult; clock on a Sunday; «آخرِ هفتهٔ بعد»</span>  
   → read as the end of the week AFTER the one containing D0 (a day in D0+11 … D0+12, never the coming Friday D0+5), shown with «… درست است؟» and booked only on her yes
6. [time] <span dir="rtl">[page asked «📅 … ⟨D0+3⟩ — در «امروز» بیاید؛ درست است؟»] ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; «باشه» typed as the next message</span>  
   → read as YES to the page's pending question: the appointment is booked for D0+3 and a confirming line appears in the chat; it does not lapse unread
7. [time] <span dir="rtl">[page asked «📅 … درست است؟»] ‖ U: (answers the assistant's other question) آره همون فصلِ ۲ رو میگم ‖ U: آره، تاریخش هم درسته</span> — _context:_ <span dir="rtl">adult; her first reply goes to the assistant, the second to the page's date question</span>  
   → the pending date ask is NOT dropped silently after the first reply: it is still pending (or the page says it is still waiting) and the second message books it with a confirming line; the appointment is never lost without a line
8. [time] <span dir="rtl">U: میان‌ترمم دوازده روزِ دیگه‌ست ‖ [the model reports a `deadline` action for it]</span> — _context:_ <span dir="rtl">teen 17; a date that reaches the page through the MODEL's report</span>  
   → the page checks the date against her own sentence (D0+12) and asks «… درست است؟»; it is booked on her yes with a visible line — never booked silently from the model's action
9. [time] <span dir="rtl">U: هفتهٔ بعد، جمعه جواب میدم ‖ [the model's `when` = the coming Friday]</span> — _context:_ <span dir="rtl">adult; clock on a Wednesday; the model's date DISAGREES with her sentence</span>  
   → the page's reading from her words is D0+9 (Friday of next week), the model's is D0+2: the page shows ITS reading with «… درست است؟» (or asks which) and never books the model's date without her yes
10. [time] <span dir="rtl">[page asked «📅 … درست است؟»] ‖ U: بله</span> — _context:_ <span dir="rtl">elder 72, «شما»; a typed yes</span>  
   → booked, and exactly ONE confirming line in the chat, in «شما»; her typed answer is not left without any reflection in the conversation
11. [time] <span dir="rtl">U: سه‌شنبه نه، چهارشنبه میرم دکتر</span> — _context:_ <span dir="rtl">adult; clock on a Saturday; a negated day and an affirmed day in one sentence</span>  
   → the ask (if made) is for the first Wednesday after D0 (D0+4) only; Tuesday — the day she negated — is never offered back
12. [time] <span dir="rtl">U: تا جمعه پیش‌نویس رو تموم می‌کنم ‖ [page: «همین امروز یا جمعهٔ بعد؟»] ‖ U: همین امروز</span> — _context:_ <span dir="rtl">adult; clock on a FRIDAY; she picks today</span>  
   → the plan's date is D0 — the plan does not keep a guessed «جمعهٔ بعد» (D0+7) after she answered «همین امروز»; asked once
13. [time] <span dir="rtl">U: تا جمعه گزارش رو می‌فرستم</span> — _context:_ <span dir="rtl">adult; clock on a Tuesday (not a Friday)</span>  
   → due = the first Friday after D0 (D0+3), through «… درست است؟» and her yes; no «همین امروز یا جمعهٔ بعد؟» on a non-Friday
14. [time] <span dir="rtl">U: با مشاورِ مؤسسه شنبه صبح حرف می‌زنم</span> — _context:_ <span dir="rtl">adult; clock on a Monday; the word before «شنبه» ends in «سه» («مؤسسه شنبه»)</span>  
   → read as SATURDAY (the first after D0 = D0+5); never «سه‌شنبه» found across the word boundary
15. [time] <span dir="rtl">U: پس‌فردا زنگ می‌زنم بنگاه ‖ U: سه روز دیگه نمونه رو می‌برم آزمایشگاه</span> — _context:_ <span dir="rtl">adult; relative days, her own future actions</span>  
   → D0+2 and D0+3, each through one «… درست است؟» and her yes
16. [time] <span dir="rtl">[page asked «📅 … ⟨D0+6⟩ … درست است؟»] ‖ U: باشه ‖ [the model then reports the deadline]</span> — _context:_ <span dir="rtl">adult; «باشه» followed by a model report of the same date</span>  
   → the date sits in «امروز» ONCE and a record line appears in the chat («📅 ثبت شد»); not booked twice, not booked without any line
17. [time] <span dir="rtl">[page asked «📅 … ⟨the first Saturday after D0⟩ … درست است؟»] ‖ U: باشه ولی شنبه نه، یکشنبه</span> — _context:_ <span dir="rtl">adult; «باشه» followed by a correction of the day</span>  
   → NOT a plain yes: Saturday is not booked and is not offered again; the page reads Sunday (the first after D0) and confirms that instead

### Negative (look-alike)

1. [time] <span dir="rtl">U: پنجشنبه رفتم و جوابش رو دادم</span> — _context:_ <span dir="rtl">adult; PAST tense with a weekday</span>  
   → no date ask; nothing in «امروز»; the follow-up reminder does not quote a past sentence as a plan
2. [time] <span dir="rtl">U: کلاسِ پنجشنبه رو نرفتم</span> — _context:_ <span dir="rtl">teen 15; past, negative</span>  
   → no date ask
3. [time] <span dir="rtl">U: جلسه‌های خواهرم سه‌شنبه عصره، واسه همین اون روز ماشین دستِ اونه</span> — _context:_ <span dir="rtl">adult; ANOTHER person's standing schedule</span>  
   → no date ask and no «امروز» line for the sister's sessions
4. [time] <span dir="rtl">U: خانمِ ⟨نام⟩ گفت دوشنبه از فصلِ ۴ امتحان می‌گیره</span> — _context:_ <span dir="rtl">child 11; a teacher's words, with the teacher's name</span>  
   → no «📅 از حرفِ خودت …» ask for the teacher's plan, and no page line carries the teacher's name (Q9)
5. [time] <span dir="rtl">U: مهلتِ ثبت‌نام بیستم نیست، بیست‌وپنجمه</span> — _context:_ <span dir="rtl">adult; a retracted day</span>  
   → the negated day («بیستم») is never offered in a «… درست است؟» line or booked
6. [time] <span dir="rtl">U: مسئله میگه قطار شنبه راه میفته و سه روز تو راهه، چه روزی می‌رسه؟</span> — _context:_ <span dir="rtl">child 12; a weekday INSIDE the problem's wording</span>  
   → no date ask, no appointment; «شنبه» is a datum of the problem (owner bank 48)
7. [time] <span dir="rtl">U: نسخه‌ی سه‌شنبه‌ی جدول رو آوردم، همون که سخت‌تره</span> — _context:_ <span dir="rtl">adult; a weekday as the NAME of a puzzle edition</span>  
   → no «سه‌شنبه ⟨date⟩ — در «امروز» بیاید؛ درست است؟»
8. [time] <span dir="rtl">U: ۵ ماهه دنبالِ این کارم و هنوز نتونستم نشون بدم جواب میده</span> — _context:_ <span dir="rtl">adult; elapsed time («۵ ماهه»)</span>  
   → no date ask — never a day five months ahead offered for «امروز»
9. [time] <span dir="rtl">U: من متولدِ ۱۲ خردادِ ۱۳۴۱ هستم</span> — _context:_ <span dir="rtl">elder; a birth sentence with a four-digit year</span>  
   → no dated plan and no «۱۲ خرداد ⟨next occurrence⟩ … درست است؟»; the sentence goes only to the age band; if the date is already stored the page says so in one line
10. [time] <span dir="rtl">U: سه‌شنبه‌ها کلاسِ زبان دارم</span> — _context:_ <span dir="rtl">adult; a habit (plural weekday)</span>  
   → no dated item and no ask
11. [time] <span dir="rtl">A: می‌خوای اول از بخشِ دوم شروع کنیم؟ ‖ U: باشه</span> — _context:_ <span dir="rtl">adult; NO page date question is pending — «باشه» answers the assistant</span>  
   → nothing is booked and no «📅 ثبت شد» line appears
12. [time] <span dir="rtl">U: حالا یه روزِ دیگه می‌خونمش</span> — _context:_ <span dir="rtl">child 10; a vague future with no day</span>  
   → no «📅 … درست است؟» with an invented date; at most the page asks her for a day once, proposing none
13. [time] <span dir="rtl">[the Saturday session was booked through the page two turns ago] ‖ U: واسه همون جلسهٔ شنبه سؤال‌ها رو آماده می‌کنم</span> — _context:_ <span dir="rtl">adult; a reference to an ALREADY booked appointment</span>  
   → the booked session is not asked again and not re-read as another weekday; no second «امروز» item
14. [time] <span dir="rtl">U: دکترم گفت دوشنبه بیا آزمایشت رو تکرار کنیم</span> — _context:_ <span dir="rtl">adult; another person's words (C19)</span>  
   → no page-initiated date ask from the quoted words
15. [time] <span dir="rtl">U: یه وقتی بهش زنگ می‌زنم ‖ [the model reports `when` = D0+3]</span> — _context:_ <span dir="rtl">adult; her sentence carries NO date; the model invents one</span>  
   → nothing is booked for D0+3 and the page does not ask «⟨D0+3⟩ … درست است؟» — a date that is not in her own sentence does not reach «امروز» (C12)
16. [time] <span dir="rtl">U: برنامه‌م اینه: شنبه میرم بانک ‖ [the model reports the plan with `when` = that Saturday, and the page books it through «درست است؟» + her yes in the same turn]</span> — _context:_ <span dir="rtl">adult; the same date arriving by two paths in one turn</span>  
   → ONE question and one booking — the plan booked this turn is not asked a second time

## Q6.stage_closure · stage and closure follow the page (a sub-result or a first wrong result never moves the stage to «بازنگری» or shows «حل شد»; «حل شد / بسته شد» in 🧭, 📜 and the ledger comes only from the page's own closure; a problem proved in chat and registered afterwards opens with the «✅ حل شد» card, not at «فهم»; the strip destination is the problem, not a meta sentence; an answered question does not return as the bold question; a closed problem suggests nothing). pos = the page must behave as stated; neg = a look-alike where the opposite is right.


### Positive

1. [chat] <span dir="rtl">[chat problem with three sub-problems: one tested, one planned, one ⏸ waiting on sheet #101] ‖ U: خب بخشِ اول دراومد: ماهی ۴ تا تماسِ بی‌جواب داریم</span> — _context:_ <span dir="rtl">adult; a SUB-result while two sub-problems are open</span>  
   → the stage does not become «بازنگری»: no «مرحله: بازنگری» / «مرحلهٔ محتمل: بازنگری» in the prompt, no 🧭 «اکنون: بازنگری — حل به نتیجه رسید», no turn suggestion «نتیجه را با واقعیت سنجیدی …؟»; the next open sub-problem is the current point
2. [chat] <span dir="rtl">U: پارچهٔ هر پرده ۲٫۴ متره و ۳ تا پرده دارم، ۲٫۴ × ۳ = ۶، پس ۶ متر می‌خرم</span> — _context:_ <span dir="rtl">child 12; her FIRST result, and the page's reader marks it ✗ (2.4 × 3 = 7.2)</span>  
   → the stage stays in execution with the slip as the turn's point; no move to «بازنگری», no «✅ حل شد» card, no «حل به نتیجه رسید» on the strip for a result the page itself flagged
3. [page] <span dir="rtl">[a problem whose closure.state = review: «در بازنگری — هنوز بسته نشده»] ‖ [open 🧭, 📜 and the prior-work ledger]</span> — _context:_ <span dir="rtl">adult; look-back in progress, the page's own closure not done</span>  
   → none of the three says closed: no 🧭 «مقصد — حل شد ✓ · هیچ — به مقصد رسیدی», no 📜 «وضع: حل شد», no ledger line «مسئله بسته شد — این دفتر تاریخچه است»; all three say «در بازنگری»
4. [page] <span dir="rtl">[she proves the claim fully in chat: statement, argument, check] ‖ U: خب حالا همین رو به‌عنوانِ مسئله ثبت کن</span> — _context:_ <span dir="rtl">teen 17, proof problem; proved in chat FIRST, registered afterwards</span>  
   → the registered problem opens with the «✅ حل شد» card (or «در گفت‌وگو به نتیجه رسیدی») carrying the chat's statement and result; it does not open at «فهم» and does not re-ask «مجهول چیست؟ / داده‌ها چیست؟» for what the chat already holds
5. [page] <span dir="rtl">U: چیکار کنم؟ هر ماه آخرش پول کم میارم و نمی‌دونم خرجم کجا میره</span> — _context:_ <span dir="rtl">adult; the first sentence is a meta question, the second is the problem</span>  
   → the strip destination («مقصد») is built from the problem (where the money goes / not running short), never «مقصد: چیکار کنم؟»
6. [page] <span dir="rtl">U: چطور شروع کنم؟ می‌خوام واسه کتابخونهٔ محل یه سیستمِ امانت راه بندازم</span> — _context:_ <span dir="rtl">elder 66, «شما»; «چطور شروع کنم؟» + the real goal</span>  
   → destination = the lending system for the library; never «مقصد: چطور شروع کنم؟»
7. [chat] <span dir="rtl">A (page question, bold): مجهول چیست؟ ‖ U: مجهول اینه که چند تا گلدون تو هر ردیف جا میشه ‖ [next turn]</span> — _context:_ <span dir="rtl">adult; she ANSWERED the bold question</span>  
   → the same question does not come back as the bold turn question on the following turns; the next question follows her answer
8. [page] <span dir="rtl">[a problem closed by the page's own closure] ‖ [open it again; open the chat bound to it]</span> — _context:_ <span dir="rtl">adult; a CLOSED problem</span>  
   → it suggests nothing: no «مجهول چیست؟», no «به مجهول نگاه کن», no next-step nudge; only history and the optional look-back note
9. [prompt] <span dir="rtl">[live problem registered; the understanding form typed but not saved; page stage = «فهم»] ‖ U: فکر کنم جواب ۱۸ تا باشه</span> — _context:_ <span dir="rtl">adult; a result said in chat while the page stage is earlier</span>  
   → ONE stage source — the coach block does not say «مرحلهٔ محتمل: بازنگری» while the page says «فهم»; the turn asks her to save/confirm the understanding or test the value, in the page's stage
10. [page] <span dir="rtl">U: یه مسئلهٔ دیگه دارم. برای اینکه مطمئن شم می‌خوام با ساعتِ مچیم ببینم هر شب چند ساعت می‌خوابم. حل‌شدن یعنی هفته‌ای دست‌کم ۵ شب، ۷ ساعت بخوابم.</span> — _context:_ <span dir="rtl">adult; a means sentence followed by her GOAL sentence</span>  
   → the unknown/destination of the new problem is the goal sentence («حل‌شدن یعنی …»), not the means sentence; data rows are whole sentences, not clipped mid-word
11. [prompt] <span dir="rtl">[a new live problem was registered this turn]</span> — _context:_ <span dir="rtl">adult; the FIRST turn of a new live problem</span>  
   → the prompt does not say «نردبانِ پرسش‌های این مرحله تمام شد … فقط گامِ بعد را بگو» on the first turn — the stage's own questions start here
12. [chat] <span dir="rtl">U: جواب شد ۱۸ گلدون تو هر ردیف. خودم هم وارسی کردم: ۱۸ × ۴ = ۷۲، با کلِ گلدون‌ها می‌خونه</span> — _context:_ <span dir="rtl">adult; result AND her own check in one message</span>  
   → her check is recorded as the look-back check (18 × 4 = 72 ✓); the page does not ask her again whether she checked the result — an answered question does not return
13. [page] <span dir="rtl">[one problem: 🧭 strip, 📜 dossier, the problem page] at three moments — in execution, in look-back, after the page's closure</span> — _context:_ <span dir="rtl">owner bank 47 — one meaning of «حل شد»</span>  
   → at each moment the three surfaces show the SAME state word; «حل شد» appears on all three only after the page's closure

### Negative (look-alike)

1. [chat] <span dir="rtl">[a one-part problem, plan done] ‖ U: تموم شد، جوابِ آخر ۱۸ تا در هر ردیفه و با شمارش هم جور دراومد</span> — _context:_ <span dir="rtl">adult; the FINAL result of the whole problem</span>  
   → moving to «بازنگری» is right here (the card «در گفت‌وگو به نتیجه رسیدی» may come)
2. [page] <span dir="rtl">[she pressed «✅ حل شد» and the close gate passed]</span> — _context:_ <span dir="rtl">adult; the page's own closure happened</span>  
   → «حل شد» in 🧭, 📜 and the ledger («این دفتر تاریخچه است») is right
3. [page] <span dir="rtl">U: یه مسئله ثبت کن: چند تا گلدون تو هر ردیفِ بالکن جا میشه؟</span> — _context:_ <span dir="rtl">adult; registered BEFORE any solving</span>  
   → opens at «فهم» with the first understanding question — no «✅ حل شد» card
4. [page] <span dir="rtl">U: چطور قبضِ برق رو تا تابستون نصف کنم؟</span> — _context:_ <span dir="rtl">adult; a how-question that IS the problem</span>  
   → the destination may be built from it (halving the bill) — it is not discarded as a meta sentence
5. [chat] <span dir="rtl">A (page question, bold): مجهول چیست؟ ‖ U: یه لحظه، اول بگو این دکمهٔ بالا چیه؟</span> — _context:_ <span dir="rtl">adult; she did NOT answer the bold question</span>  
   → the question stays pending and may return after her side question is answered
6. [chat] <span dir="rtl">[three sub-problems; two already done] ‖ U: سومی هم دراومد، پس کلِ برنامه جور شد</span> — _context:_ <span dir="rtl">adult; the LAST sub-result, which completes the whole</span>  
   → look-back may start now — the rule is about a sub-result while others are open
7. [page] <span dir="rtl">[a problem in look-back, not closed]</span> — _context:_ <span dir="rtl">adult; an OPEN problem in review</span>  
   → look-back questions («راهِ دیگری هم هست؟») may be suggested — «suggests nothing» is for closed problems only

## Q7.territory_polish · territory loop polish (a real tie is asked naming both, in the chat and in «امروز», and answering by naming one IS the answer — C20; a clear single best fit arrives and is not asked; after a take-back the sheet is closed with a note and 📜 keeps every arrival and rejection as its own event; the «❓» line in «امروز» opens a row that can be answered there; a step-less system sheet that gets a reply gives her one notice; a piece waiting after closure has its «امروز» line; no waiting point is attached to an unrelated closed problem; frame-only overlap with a candidate ⇒ ask, a reply naming no area ⇒ reject and reopen — C20). Base step — «گامِ عایق»: step «۳ — کدام عایق برای سقفِ کارگاه صدا را کمتر رد می‌کند؟» ⏸ waiting for system sheet #101 (gap.step = 3). pos = the stated loop behaviour; neg = a look-alike with the other outcome.


### Positive

1. [events] <span dir="rtl">[reply to #101] دو حوزهٔ تازه افزوده شد: «مقایسهٔ عایق‌های صوتیِ سقف» و «سنجشِ ردشدنِ صدا از عایقِ سقف». [registry diff: + both areas]</span> — _context:_ <span dir="rtl">گامِ عایق waits; both titles carry the step's own specific words equally — a REAL tie</span>  
   → ASK — one question naming BOTH candidates, in the chat and in the «امروز» ❓ line (which also names both, not only the first); the step stays ⏸; no «🛎 ابزارِ لازم آمد» for either one; the tie is not broken by the sheet's own frame words
2. [chat] <span dir="rtl">[the tie ask above] ‖ U: دومی، همون سنجشِ ردشدنِ صدا</span> — _context:_ <span dir="rtl">she answers by NAMING one candidate</span>  
   → that IS the answer: arrival for the named area («تأییدِ تو») and resume of گامِ عایق; no second ask; 📜 keeps the ask and her choice as two events (not only the last one)
3. [events] <span dir="rtl">[reply to #101] حوزهٔ «برآوردِ هزینهٔ کارگاه» افزوده شد. [registry diff: + that area] ‖ [sheet frame: «… در نمای «🧮 ماشینِ برآورد» چیزی برای این گام نیست»]</span> — _context:_ <span dir="rtl">گامِ عایق waits; a candidate area EXISTS but it overlaps the step only through frame / view words</span>  
   → ASK her whether this is the tool for گام ۳ (C2/C20) — no arrival, no silent rejection; the mismatch/ask wording cites only words that really are in her step
4. [events] <span dir="rtl">[reply to #101] بررسی شد؛ فعلاً چیزی برای این نیاز ساخته نشده است. [registry diff: none]</span> — _context:_ <span dir="rtl">گامِ عایق waits; the reply names NO area at all</span>  
   → REJECT and reopen #101 with a note; there is nothing to ask her about; the lag line says a reply came that names no tool for this step and the step is still waiting — never arrival, never «همان است؟»
5. [chat] <span dir="rtl">[arrival declared] ‖ U: نه، این همون نیست ‖ [sheet reopened] ‖ U: اشتباه گفتم، همون بود</span> — _context:_ <span dir="rtl">adult; rejection, then a TAKE-BACK of the rejection</span>  
   → the arrival is restored with history and گامِ عایق resumes; sheet #101 is CLOSED with a note about the take-back — it does not stay «open», its last note is not «همان نیست», and the prompt's list of open sheets no longer carries it in a stale state
6. [page] <span dir="rtl">[the same sequence: arrival ‖ «نه» ‖ take-back] ‖ [open 📜]</span> — _context:_ <span dir="rtl">dossier after a take-back</span>  
   → 📜 lists, in time order and each as its own event: 🛎 arrival → her rejection (reopened) → take-back (arrival restored); the first arrival event is still there (not re-stamped, not shown after the rejection)
7. [page] <span dir="rtl">[«امروز»: «❓ برگهٔ #۱۰۱ جواب گرفت … همان ابزارِ گامِ ۳ است؟»] ‖ [she opens the line]</span> — _context:_ <span dir="rtl">adult; answering from «امروز»</span>  
   → the row it opens can be answered there (✓ همان است / ✗ نه) or points clearly to where to answer; never a row that only says «پرسیدم همان است یا نه» with no way to reply
8. [events] <span dir="rtl">[a system sheet she filed about the page itself — no step of any problem waits on it] ‖ [the routine replies to it]</span> — _context:_ <span dir="rtl">adult; a STEP-LESS system sheet (owner bank 53)</span>  
   → she gets ONE notice that the sheet got a reply (in «امروز» / the chat), with the reply's gist; not silence, and not a notice on every later turn
9. [events] <span dir="rtl">[the problem of گامِ عایق is closed by her while #101 still waits] ‖ [D0+3: a fitting area arrives]</span> — _context:_ <span dir="rtl">adult; a piece that arrives AFTER closure</span>  
   → «امروز» shows a line that the awaited piece arrived for that closed problem; the session's current step is not a stale one from before the closure
10. [route] <span dir="rtl">[a profile question's system sheet waits: «⏸ منتظرِ برگهٔ #۱۰۲»] ‖ [open the 🧭 of an unrelated, already closed library problem]</span> — _context:_ <span dir="rtl">adult; an unrelated closed problem</span>  
   → the closed problem's 🧭 and 📜 carry no «⏸ منتظرِ برگهٔ #۱۰۲» point; the waiting point belongs to its own owner only
11. [events] <span dir="rtl">[#101 was rejected by her and reopened] ‖ [the routine marks the sheet done with no new area]</span> — _context:_ <span dir="rtl">adult; sys_done on a rejected sheet</span>  
   → not silent — she gets a line that the sheet was closed without a new tool and the step is still waiting (or reopened)
12. [page] <span dir="rtl">[five sheet checks on five days: nothing, nothing, an unfit reply, an ask, an arrival] ‖ [open 📜]</span> — _context:_ <span dir="rtl">adult; the dossier of the loop</span>  
   → each check line names what came THAT time; not five identical «وارسیِ برگه» lines
13. [chat] <span dir="rtl">[mismatch declared on a reply titled «پایهٔ دادهٔ مصالح»] ‖ [the page's reason line]</span> — _context:_ <span dir="rtl">adult; the reason for «جواب نداد»</span>  
   → the reason cites only overlap that exists: it never says «فقط در «پایه» مشترک است» when «پایه» is not a word of her step

### Negative (look-alike)

1. [events] <span dir="rtl">[reply to #101] دو حوزه افزوده شد: «مقایسهٔ عایق‌های صوتیِ سقف» و «بودجه‌بندیِ خریدِ کارگاه». [registry diff: + both]</span> — _context:_ <span dir="rtl">گامِ عایق waits; two candidates, ONE clearly fits the step's own words</span>  
   → ARRIVAL for «مقایسهٔ عایق‌های صوتیِ سقف» without asking; the second area is not offered as a tie
2. [events] <span dir="rtl">[reply to #101] حوزهٔ «سنجشِ ردشدنِ صدا از عایقِ سقفِ کارگاه» افزوده شد. [registry diff: + that area]</span> — _context:_ <span dir="rtl">گامِ عایق waits; one new area whose description uses several of the step's own words</span>  
   → ARRIVAL, not an ask — a clear single fit is not over-asked
3. [chat] <span dir="rtl">[the tie ask] ‖ U: هیچ‌کدوم، من دنبالِ یه جدولِ مقایسه بودم نه این‌ها</span> — _context:_ <span dir="rtl">she rejects both</span>  
   → both rejected; #101 reopened with her note; the step stays ⏸; no arrival
4. [chat] <span dir="rtl">[arrival declared] ‖ U: نه، این همون نیست ‖ U: نه واقعاً، دوباره نگاه کردم، همون نیست</span> — _context:_ <span dir="rtl">a repeated «نه», not a take-back</span>  
   → stays rejected/reopened; nothing restored
5. [events] <span dir="rtl">[a step-less system sheet; no reply yet]</span> — _context:_ <span dir="rtl">adult</span>  
   → no notice — nothing has arrived
6. [route] <span dir="rtl">[گامِ عایق waits on #101] ‖ [open the 🧭 of ITS OWN open problem]</span> — _context:_ <span dir="rtl">the owner problem</span>  
   → the «⏸ منتظرِ برگهٔ #۱۰۱» point is shown there — correctly
7. [chat] <span dir="rtl">[the tie ask] ‖ U: یه لحظه صبر کن، اول یه سؤالِ دیگه دارم</span> — _context:_ <span dir="rtl">she does not answer the ask</span>  
   → the ask stays pending (❓ line stays in «امروز»); no arrival, no rejection

## Q8.forecast_ledger · forecast ledger 🎯 (confidence said in WORDS makes a 🎯; one prediction is one 🎯 and one deadline; an outcome she reports in chat settles that 🎯, or the page asks once; a booked verdict can be taken back with history; a lesson is not read as a guess; a guess she repeats verbatim is accepted). pos = the 🎯 behaviour stated; neg = a look-alike that must not create, judge or change a 🎯.


### Positive

1. [events] <span dir="rtl">U: هفتاد درصد مطمئنم تا آخرِ همین هفته فصلِ ۳ رو تموم می‌کنم</span> — _context:_ <span dir="rtl">adult; confidence in WORDS, no digits</span>  
   → one 🎯 with 70 % and her deadline (the end of the week containing D0, through the page's date confirmation); a prediction with worded confidence is not lost
2. [events] <span dir="rtl">U: به احتمالِ نود درصد فردا جوابِ آزمایش میاد</span> — _context:_ <span dir="rtl">elder 67, «شما» elsewhere; «نود درصد» in words, ZWNJ missing</span>  
   → one 🎯 with 90 %, due D0+1
3. [events] <span dir="rtl">U: پیش‌بینیم اینه که تا سه روز دیگه سفارش می‌رسه ‖ U: هشتاد درصد مطمئنم ‖ [D0+3] U: سفارش رسید، همون‌طور که گفته بودم</span> — _context:_ <span dir="rtl">adult; the prediction, its confidence and its outcome arrive in three separate messages</span>  
   → ONE 🎯 (80 %, due D0+3) — the confidence sentence and the outcome report do not each create a 🎯; the outcome judges that one 🎯 «شد»; one deadline, not two
4. [events] <span dir="rtl">[exactly one open 🎯: «تا جمعه طرح رو تحویل میدم؛ ۶۰ درصد»] ‖ U: پیش‌بینیم غلط از آب دراومد، نرسیدم</span> — _context:_ <span dir="rtl">adult; an outcome reported in chat</span>  
   → that 🎯 is judged «نشد» and leaves «امروز»'s «به موعد رسیده — شد یا نشد؟»; it stays in 📜 and the calibration counts it once
5. [events] <span dir="rtl">[one open 🎯, not yet due] ‖ U: فکر کنم اون چیزی که گفته بودم داره همون‌طور میشه</span> — _context:_ <span dir="rtl">adult; an unclear, not-yet-final outcome</span>  
   → the page asks ONCE whether to book the outcome now («شد یا نشد؟»); nothing is booked on a guess of her meaning
6. [events] <span dir="rtl">[a 🎯 booked «نشد» on her report] ‖ U: اشتباه گفتم، در واقع شد؛ بسته همون روز رسیده بود و من ندیده بودم</span> — _context:_ <span dir="rtl">adult; take-back of a booked verdict</span>  
   → the verdict changes to «شد» WITH history («نشد ⇒ شد — به گفتهٔ خودت»); the calibration follows; no second 🎯
7. [chat] <span dir="rtl">U: یاد گرفتم که بدونِ فهرست خرید نرم، وگرنه دو برابر خرج می‌کنم</span> — _context:_ <span dir="rtl">adult; a LESSON said in chat</span>  
   → stored as a lesson (look-back / what she learned); NOT read as a guess, no 🎯, no «چطور می‌آزمایی‌اش؟»; it does not come back later as «درخواستِ عقب‌افتاده (شاید)»
8. [chat] <span dir="rtl">U: حدسم اینه: صفر یا یک بار در هفته دیر می‌رسم ‖ [the model reports the guess with exactly these words as its quote]</span> — _context:_ <span dir="rtl">adult; a guess reported VERBATIM</span>  
   → accepted and recorded; never «حدس … عیناً در پیامِ او نبود و ثبت نشد» when the quote is literally in her message (digit-words, ZWNJ and spacing differences do not break the match)
9. [events] <span dir="rtl">U: قول میدم تا پس‌فردا فرم رو پر کنم ‖ [D0+2] U: فرم رو پر کردم</span> — _context:_ <span dir="rtl">adult; one commitment, later reported done</span>  
   → ONE record for the commitment; after her report the ⏰ line «گذشت؛ انجام شد؟» is gone from «امروز»; it is not kept as a second open item
10. [events] <span dir="rtl">[a 🎯 whose plan she reported done AND whose result she reported, in chat]</span> — _context:_ <span dir="rtl">adult; «امروز» after plan_done + result</span>  
   → the 🎯 card no longer asks «شد یا نشد؟»; it shows its verdict
11. [page] <span dir="rtl">[three 🎯 judged over a week] ‖ [open the calibration row]</span> — _context:_ <span dir="rtl">adult; calibration count</span>  
   → the row counts 3 judged — every judged 🎯 once, none missing

### Negative (look-alike)

1. [events] <span dir="rtl">U: هنوز هفتاد درصدِ کار مونده</span> — _context:_ <span dir="rtl">adult; a percentage of work, not a confidence</span>  
   → no 🎯
2. [events] <span dir="rtl">U: صد درصد باهات موافقم</span> — _context:_ <span dir="rtl">adult; an idiom</span>  
   → no 🎯 and no deadline
3. [events] <span dir="rtl">U: دو تا پیش‌بینی: هفتاد درصد فردا بارون میاد؛ و سی درصد تا آخرِ ماه اسباب‌کشی می‌کنیم</span> — _context:_ <span dir="rtl">adult; two different predictions, both with worded confidence</span>  
   → TWO 🎯 (70 % due D0+1; 30 % due the end of the month containing D0) — one per prediction
4. [events] <span dir="rtl">[no open 🎯] ‖ U: امتحانم خوب شد</span> — _context:_ <span dir="rtl">teen 16; an outcome of something she never predicted</span>  
   → no verdict is booked and no 🎯 is created after the fact
5. [chat] <span dir="rtl">U: فکر کنم مشکل از باتری باشه، هنوز امتحانش نکردم</span> — _context:_ <span dir="rtl">adult; a real guess</span>  
   → read as a guess («آزموده نشده») — the lesson rule does not swallow guesses
6. [chat] <span dir="rtl">U: ماشین صبح‌ها دیر روشن میشه ‖ [the model reports a guess «باتری ضعیف شده» — words that are NOT in her message]</span> — _context:_ <span dir="rtl">adult; a guess she never said</span>  
   → refused: «عیناً در پیامِ او نبود و ثبت نشد» is right here
7. [events] <span dir="rtl">[a 🎯 booked «نشد»] ‖ U: نه، همون «نشد» درست بود</span> — _context:_ <span dir="rtl">adult; she confirms the booked verdict</span>  
   → nothing changes; no history entry of a take-back
8. [events] <span dir="rtl">U: هفتاد درصدِ کتاب رو تا دیروز خونده بودم</span> — _context:_ <span dir="rtl">adult; worded percent about the PAST</span>  
   → no 🎯, no deadline

## Q9.person_register_titles · who she is — personal data, register, titles, mind card (a child's or a third party's school, teacher or personal name never becomes a title or a visible label — a placeholder such as «[نامِ مدرسه]» is shown instead, C22; greetings, self-introductions and birth sentences are not problem titles; a question about the page is not a problem; static page strings follow the stored register; the post-check does not fire on guillemets, on «ندید», or on a verb that merely contains «شو»; the mind card shows a readable label, does not book «ناقص» or a refuted assumption as a failure, and does not credit a message the page marked ✗). All names in the texts are invented. pos = the stated protection / behaviour; neg = a look-alike that is legitimately kept, caught or booked.


### Positive

1. [page] <span dir="rtl">U: من کلاس چهارمِ دبستانِ سرونازم و نمی‌دونم این مسئلهٔ کسرها رو چطور حل کنم</span> — _context:_ <span dir="rtl">child 10; her own school's name in the opening</span>  
   → wherever the page writes a title or label from this message — chat-problem title, 📜 list, «امروز», the 🧭 strip, «برگرد به» — the school name is replaced by «[نامِ مدرسه]»; the name is visible in none of them
2. [page] <span dir="rtl">U: خانمِ مهرپرور گفته تا فردا این جدول رو پر کنیم ولی من ستونِ آخر رو بلد نیستم</span> — _context:_ <span dir="rtl">child 11; her TEACHER's personal name</span>  
   → no title, label or page question shows «مهرپرور»: a placeholder stands in its place (e.g. «[نامِ معلم]»); the problem (the last column) is the title's content
3. [page] <span dir="rtl">U: می‌خوام واسه پسرم که دبیرستانِ آفتابِ دانش میره یه برنامهٔ درسی بچینم</span> — _context:_ <span dir="rtl">adult parent; her CHILD's school name</span>  
   → the child's school name is not shown in any title or label (placeholder); the plan itself is recorded
4. [page] <span dir="rtl">U: همسایه‌مون آقای کیانفر دیوارِ مشترک رو خراب کرده، چطور باهاش کنار بیام؟</span> — _context:_ <span dir="rtl">adult; a third party's personal name inside the problem</span>  
   → titles and labels (problem title, 📜, strip, «امروز») show a placeholder instead of «کیانفر»; her own bubble keeps what she typed
5. [page] <span dir="rtl">U: سلام! امروز یه برگهٔ سفید آوردم که از اول شروع کنیم ‖ [the reply carries no title]</span> — _context:_ <span dir="rtl">adult; day 2 of a multi-day problem, the session's first message is a greeting</span>  
   → the session title is not the greeting sentence; with no title from the reply the fallback is the problem's own title (or a neutral one)
6. [page] <span dir="rtl">U: سلام، من نرگسم، ۳۴ سالمه، حسابدارم و دو تا بچه دارم. مسئله‌م اینه که وقت کم میارم.</span> — _context:_ <span dir="rtl">adult; a self-introduction before the problem</span>  
   → the 📜 problem list and the title show the problem («وقت کم میارم»), not the stripped introduction; the introduction is not listed as a problem line
7. [page] <span dir="rtl">[one problem in progress] ‖ U: راستی من متولدِ ۲۵ دیِ ۱۳۵۰ام</span> — _context:_ <span dir="rtl">adult; a birth sentence mid-chat</span>  
   → it does not become the title of a new «مسئلهٔ گفت‌وگو», is not shown in 📜 as a problem and not in the «برگرد به» strip; it goes only to the age band
8. [chat] <span dir="rtl">U: این دکمهٔ 🧭 بالای صفحه دقیقاً چی رو نشون میده؟</span> — _context:_ <span dir="rtl">adult; a question ABOUT the page</span>  
   → answered as a question about the page; NOT classified as a problem — no problem record, no «کلِ مسئله را در یک جمله …؟»
9. [page] <span dir="rtl">[stored register «شما»; elder 78] ‖ [open «امروز», 🔭, the forms' static lines]</span> — _context:_ <span dir="rtl">an elder who is addressed with «شما»</span>  
   → every static page string addressed to her is in «شما» («تقریبتان بس بود», «اصلاحتان رسید») — no «تو» line in «امروز» or 🔭 and no sentence mixing the two («اصلاحت رسید … پیامتان»)
10. [prompt] <span dir="rtl">[page's own stage question in a «شما» conversation]</span> — _context:_ <span dir="rtl">elder; page-authored question</span>  
   → one register inside the sentence: «می‌توانید نتیجه را از راهِ دیگری به دست آورید؟» — never «می‌توانید … به دست آوری»; and one question, not two glued with a comma
11. [prompt] <span dir="rtl">A: این بخش را «گامِ میانی» می‌نامیم تا گم نشود.</span> — _context:_ <span dir="rtl">post-check; guillemets around a LABEL, not around a quote of her words</span>  
   → PASS — the quote check does not fire on guillemets that are not a quotation of her
12. [prompt] <span dir="rtl">A: او نقشه را ندید و برای همین مسیر را اشتباه رفت.</span> — _context:_ <span dir="rtl">post-check; she is addressed with «تو»; «ندید» is third person singular</span>  
   → PASS — «ندید» is not read as a «شما» verb
13. [prompt] <span dir="rtl">A: حاصلِ این برش ۶ دهم سانت می‌شود؛ خودتان اندازه بگیرید.</span> — _context:_ <span dir="rtl">post-check; «شما» conversation; «می‌شود» follows a word ending in «ت»</span>  
   → PASS — a verb that merely contains «شو» / follows «…ت» is not read as a «تو» form; a uniformly «شما» reply is not sent back for rewriting
14. [prompt] <span dir="rtl">A: نمی‌گویم راهت غلط است؛ فقط یک گام را دوباره ببین. ‖ A: شبِ قبلش همه مهمانی بودید؟</span> — _context:_ <span dir="rtl">post-check; a «تو» conversation; first-person «نمی‌گویم»; a real plural (her and her family)</span>  
   → PASS ×2 — neither is a register slip; no rewrite call
15. [events] <span dir="rtl">[mind card «از کجا؟» after a prior-work problem with credited steps]</span> — _context:_ <span dir="rtl">any learner</span>  
   → every source cell has a readable label («گامِ کارِ پیشین: k از n»); the string «undefined» never appears
16. [events] <span dir="rtl">[prior ledger: one step judged «⚠️ ناقص»] ‖ [mind card]</span> — _context:_ <span dir="rtl">adult</span>  
   → the incomplete step is not booked as «− گامِ کارِ پیشین که درست نبود»; a step that is only «وابسته» is not booked «−» on its own either
17. [events] <span dir="rtl">[technique «فهرستِ فرض‌ها»: she lists an assumption, tests it herself and refutes it] ‖ [mind card]</span> — _context:_ <span dir="rtl">adult</span>  
   → the refuted assumption is credited to her checking — it is not a «−» row (the technique's success is not shown as a failure)
18. [events] <span dir="rtl">[a message of hers in which the page's reader marked a line ✗] ‖ [mind card]</span> — _context:_ <span dir="rtl">adult</span>  
   → no «+ نتیجه‌ای که گفت» credit for that message
19. [chat] <span dir="rtl">[the page's understanding question for a child of 9]</span> — _context:_ <span dir="rtl">child 9</span>  
   → child-simple wording («دنبالِ چی می‌گردیم؟»), never «مجهول (یا حکمی که باید ثابت شود) چیست؟»

### Negative (look-alike)

1. [page] <span dir="rtl">U: من معلمِ ریاضیِ دبیرستانِ اندیشهٔ فردام و برای کلاسم یه مسئلهٔ احتمال می‌خوام</span> — _context:_ <span dir="rtl">adult teacher naming her OWN workplace</span>  
   → kept as typed — the placeholder rule is for a child's or a third party's names
2. [page] <span dir="rtl">U: می‌خوام قضیهٔ فیثاغورس رو با روشِ پولیا برای خودم ثابت کنم</span> — _context:_ <span dir="rtl">adult; public names that are part of the subject</span>  
   → «فیثاغورس» and «پولیا» stay in the title — not masked as personal names
3. [page] <span dir="rtl">U: من بچهٔ بوشهرم و کلاس ششمم</span> — _context:_ <span dir="rtl">child 12; a city and a grade</span>  
   → nothing to mask; the grade feeds the age band
4. [page] <span dir="rtl">U: سلام، می‌خوام بدونم واسه اتاقِ ۳ در ۴ چند متر موکت لازمه</span> — _context:_ <span dir="rtl">adult; a greeting word followed by a real problem in the same sentence</span>  
   → the title is the problem (carpet for a 3 × 4 room = 12 m² as her datum) — the sentence is not dropped as a greeting
5. [chat] <span dir="rtl">U: چطور از همین صفحه برای کنکورم برنامه بریزم؟</span> — _context:_ <span dir="rtl">teen 17; mentions the page, but the content is HER goal</span>  
   → this IS a problem (planning for the exam) — not answered only as a question about the page
6. [prompt] <span dir="rtl">A: شما می‌توانید از همین‌جا ادامه بدهید، فقط اول عددت رو دوباره نگاه کن.</span> — _context:_ <span dir="rtl">post-check; «شما» conversation; a REAL mix of «شما» and «تو»</span>  
   → still CAUGHT — rewritten into one register
7. [prompt] <span dir="rtl">A: گفتی «جواب ۱۲ میشه» ولی من چنین چیزی در پیامت نمی‌بینم.</span> — _context:_ <span dir="rtl">post-check; guillemets around an alleged quote of HER words that is not in her message</span>  
   → the quote check still applies here — a false quotation of her is caught
8. [events] <span dir="rtl">[prior ledger: one step judged ✗ with cause «تقسیمِ اعشاری»] ‖ [mind card]</span> — _context:_ <span dir="rtl">adult</span>  
   → booked «−» with its cause — a really wrong step is still recorded
9. [events] <span dir="rtl">[a message whose every line the page read ✓ and which states her result] ‖ [mind card]</span> — _context:_ <span dir="rtl">adult</span>  
   → «+ نتیجه‌ای که گفت» is right here

## Q10.small_mechanisms · small mechanisms (after «go», when the destination already holds the item the follow-up says «open it», never «build»; a prerequisite diagnosed before registration is one point on 🧭; a typed plan survives a refused «ثبتِ طرح» — reproduce first, not yet confirmed; after a failed retrieval one success does not schedule the long interval while the line says «۱ از ۳»; two people in one browser is not built and is said so). pos = the stated behaviour; neg = its look-alike.


### Positive

1. [prompt] <span dir="rtl">[the prerequisite list already holds her map «مساحتِ مثلث»] ‖ [«go → prereq» for that same prerequisite] ‖ [the automatic follow-up]</span> — _context:_ <span dir="rtl">adult; the destination already holds the item</span>  
   → the follow-up says to OPEN the existing map («نقشهٔ «مساحتِ مثلث» همین‌جاست — بازش کن»); never «فیلدها را پر کن … دکمهٔ ساخت را بزن»; a literal model cannot end up with a second, empty map of the same title
2. [route] <span dir="rtl">[a prerequisite «جمعِ کسرها» was diagnosed in chat BEFORE the live problem was registered] ‖ [she registers the problem; later learns the prerequisite] ‖ [open 🧭]</span> — _context:_ <span dir="rtl">child 12; diagnosis before registration</span>  
   → ONE prerequisite point on 🧭; once learned it is closed — no second open copy, no «اکنون: پیش‌نیازِ … ۱ پیش‌نیازِ باز تا برگشت به خط» long after it was learned
3. [page] <span dir="rtl">[she types a plan in the plan field] ‖ [presses «ثبتِ طرح»; the gate refuses: «هنوز نه: …»] ‖ [adds a move] ‖ [looks at the plan field]</span> — _context:_ <span dir="rtl">adult; C26-33 — NOT yet confirmed: the fixer reproduces it first and records «not reproduced» if it does not fail</span>  
   → the typed plan text is still in the field after the refusal and after adding a move; the refusal names what is missing without discarding what she typed
4. [time] <span dir="rtl">[a practice file: retrieval FAILED on D0] ‖ [next session: one success; the line reads «۱ از ۳»]</span> — _context:_ <span dir="rtl">adult; one success after a forgetting (owner bank 51)</span>  
   → the next reminder is consistent with «۱ از ۳» — it is NOT set to the long post-consolidation gap (three weeks out) while two more successes are still required; the line and the schedule tell the same story
5. [chat] <span dir="rtl">U: نوه‌م که بیاد پای همین مرورگر، چطور بگم این منم یا اون؟</span> — _context:_ <span dir="rtl">elder 71, «شما»; owner bank 52 — two people in one browser</span>  
   → an honest answer in «شما»: this is not built yet, both would share one record in this browser, and an open sheet exists for it; the page does not pretend to separate them and files no duplicate sheet

### Negative (look-alike)

1. [prompt] <span dir="rtl">[the prerequisite list holds no map for «نسبت و تناسب»] ‖ [«go → prereq» for it]</span> — _context:_ <span dir="rtl">adult; the destination is empty for this item</span>  
   → «build it» (fill the fields, press the build button) is the right follow-up
2. [route] <span dir="rtl">[two DIFFERENT prerequisites diagnosed: «جمعِ کسرها» and «مخرجِ مشترک»; only the first learned]</span> — _context:_ <span dir="rtl">child 12</span>  
   → two points; the second is rightly still open
3. [time] <span dir="rtl">[the same practice file after three successes in a row; the line reads «۳ از ۳ — تثبیت شد»]</span> — _context:_ <span dir="rtl">adult</span>  
   → the long interval is right here

## Ambiguities for the coordinator

Points DECISIONS_R26 leaves open. No rule was invented for them; the matching entries were left out (or, where noted, the entry asserts only the part the decisions do fix).

1. **Q1 / C15 — scale words that disagree with each other.** «۲ میلیون × ۳ = ۶ هزار»: the bare numbers agree (2 × 3 = 6) but no consistent reading of the scale words does. «Never ✗ because of the word» and «if the numbers agree under one consistent reading ✓» pull apart here. Is it ✗, «نسنجیده», or ASK? No entry.
2. **Q1 / C15 — mixed scales among the operands.** The A26-1 shape «۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۸۰۰ هزار» is right only if the bare 300 is read in thousands. Which readings count as «one consistent reading», and is «نسنجیده» acceptable there? No entry of this shape (the bank's running-sum entries keep one scale throughout).
3. **Q1 / C16 — which integers are asked.** «An integer written for a non-integer quotient … is neither ✓ nor ✗». Does that hold only when the integer is the rounding or truncation of the quotient (100 ÷ 7 = 14), or for any integer (100 ÷ 7 = 18)? The bank has only the first case.
4. **Q1 / C16 — «a/b = integer» with a slash.** «۱۳/۱۲ = ۱»: a fraction identity (exact ⇒ ✗) or a quotient (⇒ ASK)? The bank uses «÷» / «تقسیم بر» for the ASK entries and fraction SUMS for the ✗ entries. Also open: what her answer to the ASK does (her «آره گرد کردم» ⇒ ✓? her «نه» ⇒ ✗?).
5. **Q1 / C16 vs C9 — an integer result for a non-integer product or sum of decimals** («۲٫۵ × ۳ = ۸», exact 7.5): accepted by C9 (she wrote decimal digits in the operands), asked, or flagged? No entry.
6. **Q1 / C17 — what counts as «an operator».** D26-24 lists «۱۶ و ۱۲ میشه ۲۸» and «سه تا ۸۰ میشه ۲۴۰» as lines with no block, while C17 keeps «sentence arithmetic with no operator» outside the reader. Is «و … میشه» (digits) an operator line? Is «سه تا ۸۰ میشه …» (number word + digits)? The bank has only explicit operators («×, ÷, +, −, /, ^, تقسیم بر, با … میشه, A از B میشه N٪») and one all-words sentence as SILENT.
7. **Q1 / owner bank 36 — contest when she is wrong.** «Shows both computations» would reveal the right number, against the standing «عددِ درست را لو نده». The entry asserts only that the ✗ stays, is re-checked once and is not re-asked.
8. **Q3 / C21 — the message after a named return.** After «برگردیم به مسئلهٔ X» binds the turn, does the NEXT message that names no problem stay with X or fall back to the previously live one (owner question 46)? No entry.
9. **Q3 / C21 — a problem named only as an analogy** («این هم مثلِ همون قفسه‌هاست …»). The entry allows «stays with the live problem OR asks» and asserts only that the named problem's record gains nothing.
10. **Q5 — «جمعهٔ بعد» said on a day that is not Friday.** The coming Friday or the one after? The bank uses it only on a Friday clock (D0+7), where the decisions are clear.
11. **Q5 — «آخرِ هفتهٔ بعد».** Which day exactly (Thursday or Friday of next week)? The entry asserts only «a day at the end of the week after the one containing D0, never the coming Friday, confirmed with «درست است؟»».
12. **Q5 / C19 vs C12 — an external deadline she states herself** («امتحانم ⟨روز⟩ است», no model report). C19 limits page-initiated asks to her own future action; B26·D3 expects a confirmation when the MODEL reports the deadline. Does the page itself ask when the model reports nothing? The bank covers the model-reported path and the negated-day rule only.
13. **Q5 — a conditional future** («اگه شنبه برم چی میشه؟»). Not in C19's list. No entry.
14. **Q7 — a piece that arrives after closure.** The decisions fix the «امروز» line; whether the closed problem is offered for reopening is not said. The entry asserts only the line and the non-stale session step.
15. **Q8 — worded odds without «درصد» and soft deadlines.** «پنجاه‌پنجاه», «تقریباً مطمئنم», and which day «آخرِ همین هفته / آخرِ ماه» resolves to. The bank uses only «⟨عدد به حروف⟩ درصد»; deadline expectations for week/month ends are stated as «the end of the week/month containing D0».
16. **Q9 / C22 — the placeholder's wording and reach.** Only «[نامِ مدرسه]» is given. What is shown for a teacher's or a neighbour's name, and are third-party names also masked in data rows and in 📜 quotations of her own sentence, or only in titles and labels? The entries accept any placeholder and assert titles/labels only.
17. **Q10 / C26-42 — the right interval after one success following a failure.** Only «not the long gap while the line says ۱ از ۳» is decided; the entry asserts consistency between the line and the schedule, no number.


## Coordinator answers
The 17 ambiguities above are decided in DECISIONS_R26.md, «Clarifications after the independent bank» C23–C39 (same order). Fixers: re-read that section.
