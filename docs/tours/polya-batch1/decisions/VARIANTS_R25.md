# VARIANTS_R25 — independent variant bank (round 25 root mechanisms P1–P7)

Written from DECISIONS_R25, the round-25 runner handbacks and defect lists A, B, C, D and B_s, COMPARE25_result and roadmap §9 and §21 only; no source code was read. Paraphrased — new people, numbers and subjects — not copied from the scenarios; each entry tests the mechanism, not one sentence.
Every fix must pass the scenario sentence AND every entry of its mechanism here. **No fixed calendar dates in expectations:** D0 = the test clock's day when the test runs; «D0+n» = n days later; «the first Friday after D0» etc. are computed at run time and shown as Jalali dates. Ages are «full years to D0» (the band — child ≤ 12, teen 13–17, elder ≥ 60 — is what is asserted).
**Arithmetic verified:** every arithmetic fact in this bank — each value called right, each value called wrong, and each «right value» an expectation names — was recomputed with exact rational arithmetic (python3 `fractions.Fraction`; 100 assertions, all passing, script: VARIANTS_R25_verify.py in the tour scratchpad; plus a regex sweep of every «a op b = c» in the entries, whose only mismatches are the values deliberately marked wrong). A value marked OK is exactly right (or a correct rounding, where said); a value marked FLAG is genuinely wrong.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result). Two sections state their own reading at their head: in P2 every expectation starts with the verdict the page's check must give («OK» not flagged / «FLAG» flagged); in P6 the post-check entries are inverted (pos = must pass without rewrite, neg = must still be caught).
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views, [events] sheet replies, registry diffs, dossier/mind-card readings, [time] day sequences under the test clock, [prompt] what the prompt/reply/post-check contains, [route] AI task route or 🧭 content.
Learners: adult unless the context says child (≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ deliberately missing in some entries — detection must not depend on it and her text is stored as typed. Digits appear in Persian, Latin and mixed form on purpose; all must be read the same.
Multi-message entries use « ‖ » (U = user, A = assistant, «[…]» = a page action/result/sheet event). Old values always stay as history («اصلاح شد ⇐»); nothing is deleted. Named base problems («مسئلهٔ سرامیک», «مسئلهٔ همنهشتی», «گامِ داروخانه») are defined in the first entry that uses them. Machine-readable copy: VARIANTS_R25.json (fields rc, kind, role, text, expect, context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| P1.prior_ledger | 25 | 24 |
| P2.arith_check | 41 | 17 |
| P3.territory_unclear_fit | 17 | 14 |
| P4.stale_numbers | 13 | 11 |
| P5.one_stage_one_problem | 13 | 11 |
| P6.opening_classify_postcheck_register | 17 | 12 |
| P7.today_dossier_predictions | 14 | 12 |
| **total** | 140 | 101 |


## P1.prior_ledger · «کارِ پیشینِ من» ledger contract (fires only on the long opening or a message she calls her prior work; turn question = resume point; later reports merge; per-step state on a mixed reply; her own fix applied from the model's validated step; dispute by meaning ⇒ re-check with evidence, result on the page; tested cases ≠ ledger, test + proof ⇒ proof question; dependency by derivation, not by a shared number; the coach-facing check line never reaches her; recall never drops the story; mind card credit/cause; datum corrections reach ledger and chat chain; 🧭 main line from the prior steps; closing never re-asks given frame fields)


### Positive

1. [chat] <span dir="rtl">U: سلام. می‌خوام بدونم برای کفِ آشپزخونه چند جعبه سرامیک بخرم. ایده‌م اینه که مساحتِ کف رو به مساحتِ یه جعبه تقسیم کنم. گام ۱: کف ۳٫۲ در ۴٫۵ متره، میشه ۱۴٫۴ مترمربع. گام ۲: هر جعبه ۱٫۴۴ مترمربعه، پس ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۲ جعبه. گام ۳: ده درصد هم پرت می‌ذارم، پس همون ۱۲ جعبه کافیه.</span> — _context:_ <span dir="rtl">adult, craft; opening message of the session («مسئلهٔ سرامیک» — referred to below)</span>  
   → the «# کارِ پیشینِ تو» block fires; گام ۱ ✓ (3.2 × 4.5 = 14.4), گام ۲ ✗ (14.4 ÷ 1.44 = 10, not 12), گام ۳ «وابسته به گامِ ۲». The bold turn question IS the resume point — step 2 («گامِ ۲ … کجایش می‌لنگد؟»), never A191 «کلِ مسئله را در یک جمله …؟», never «مرحله: فهمِ مسئله»; the prompt carries ONE instruction, not two that disagree
2. [chat] <span dir="rtl">U: می‌خوام ثابت کنم برای هر n طبیعی، 2^(3n) − 1 بر ۷ بخش‌پذیره. ایده‌م همنهشتیه. گام ۱: 2^(3n) = (2^3)^n = 8^n. گام ۲: چون 8 ≡ 1 (mod 7)، پس 8^n ≡ n (mod 7). گام ۳: پس 2^(3n) − 1 ≡ 0 (mod 7). به نظرم درسته، نه؟</span> — _context:_ <span dir="rtl">teen 17, olympiad number theory; opening message («مسئلهٔ همنهشتی» — referred to below); the tail «به نظرم درسته، نه؟» looks like a guess</span>  
   → prior block fires; گام ۱ ✓, گام ۲ ✗ (8^n ≡ 1^n = 1, not n), گام ۳ «وابسته به گامِ ۲». Turn question = resume at step 2; never «همین پیام حدس است، نه نتیجه … چطور می‌آزمایی‌اش؟» — the guess detector does not outrank the resume point on a prior-work opening; formulas shown as formulas
3. [chat] <span dir="rtl">[six ordinary turns about her monthly budget] ‖ U: این کاریه که دیشب خودم روی کاغذ کرده بودم، ببین تا کجاش درسته: حقوقم ۴۲ میلیونه. اجاره ۱۵، خوراک ۹، قسط ۶٫۵، جمعِ خرج میشه ۳۰٫۵. پس ماهی ۱۲٫۵ می‌مونه. در ۸ ماه میشه ۱۰۰ میلیون.</span> — _context:_ <span dir="rtl">adult, money; NOT the opening — she herself calls it her prior work</span>  
   → prior block fires because she names it her earlier work; step «جمعِ خرج ۳۰٫۵» ✓ (15 + 9 + 6.5); step «ماهی ۱۲٫۵ می‌مونه» ✗ (42 − 30.5 = 11.5); step «۸ ماه ⇒ ۱۰۰» «وابسته» (12.5 × 8 = 100 is internally right but built on the wrong 12.5); resume = the «می‌مونه» step
4. [chat] <span dir="rtl">U: با سلام. برای آبیاریِ باغچه حساب کرده‌ام: روزی ۴۰ لیتر، هفته‌ای ۳ بار، در ۲۶ هفته، لیتری ۸ تومان، شد ۲۴۹۶۰ تومان. می‌خواهم بدانم با این حساب تانکر بگیرم یا نه.</span> — _context:_ <span dir="rtl">elder 74, «شما»; opening message that contains ONE computed step of her own (C25-7 shape)</span>  
   → the prior block fires for an opening that carries her own computed step even when it is a single step; the step is ✓ (40 × 3 × 26 × 8 = 24960, page-checked) and is NOT re-asked; resume = what comes after it (the comparison with the tanker), in «شما»
5. [page] <span dir="rtl">[مسئلهٔ سرامیک: ledger of 3 steps on 🔭] ‖ [a later turn: the model's `prior` report re-judges ONLY گام ۲]</span> — _context:_ <span dir="rtl">later report with fewer steps than the opening ledger</span>  
   → MERGE: 🔭 «کارِ پیشینِ تو» still lists all 3 steps; گام ۱ keeps its ✓ and her own «✓ درست است» confirmation; only گام ۲ changes; the header counts 3 steps (never «۱ گام — ۱ نادرست · ازسرگیری از گامِ ۱»); the opening verdicts stay in forms and prompt, not only in 📜
6. [page] <span dir="rtl">[opening ledger of 5 steps; گام ۴ ⏸ waits for sheet #101] ‖ [D0+2: a `prior` report covering گام ۱–۳ only, all ✓]</span> — _context:_ <span dir="rtl">adult, engineering; a waiting step in the ledger</span>  
   → after the merge the ledger still has 5 rows; گام ۴ stays «⏸ منتظرِ برگهٔ #۱۰۱» and گام ۵ keeps its own verdict; the header never says «۳ گام — ۳ درست · همه درست»; resume = the first non-✓ non-waiting step, and the waiting step is named as waiting
7. [chat] <span dir="rtl">[opening ledger: گام ۲ ✗, گام ۴ ✗ of 4] ‖ U: گام ۲ رو درست کردم: ۱۵ + ۳۰ میشه ۴۵. گام ۳ هم با اون میشه ۶۰ منهای ۴۵ یعنی ۱۵ تا برچسب مونده.</span> — _context:_ <span dir="rtl">child 11, sticker-album problem; the message fixes two steps; گام ۴ («پس ۳ روز») untouched and still wrong</span>  
   → گام ۲ and گام ۳ updated (15 + 30 = 45 ✓, 60 − 45 = 15 ✓); گام ۴ REMAINS ✗ in the ledger; resume = گام ۴; stage stays «اجرا» (never «بازنگری»); never «همهٔ گام‌های پیشینت درست درآمد — گامِ بعدی؟»
8. [chat] <span dir="rtl">[مسئلهٔ سرامیک verdicts shown] ‖ U: گامِ ۲ رو قبول ندارم، چون جعبه‌ها رو باز هم میشه خرید؛ ولی دربارهٔ گامِ ۳ حق با توئه، پرت رو حساب نکرده بودم.</span> — _context:_ <span dir="rtl">mixed reply, no leading «نه»</span>  
   → per-step state: گام ۲ = disputed (re-check queued), گام ۳ = accepted; never both «رد کردی — در گفت‌وگو دوباره سنجیده می‌شود»
9. [chat] <span dir="rtl">[مسئلهٔ همنهشتی verdicts shown] ‖ U: نه، گامِ ۲ رو قبول ندارم، ۸ به هر توانی برسه باقی‌مونده‌ش عوض میشه. ولی گامِ ۳ رو قبول دارم که بهش وابسته‌ست.</span> — _context:_ <span dir="rtl">teen 17; mixed reply WITH a leading «نه»</span>  
   → the leading «نه» applies only to the step it names: گام ۲ disputed, گام ۳ accepted (as dependent); two different states on the page
10. [chat] <span dir="rtl">[مسئلهٔ سرامیک: گام ۲ ✗] ‖ U: آها دیدم! ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰، نه ۱۲.</span> — _context:_ <span dir="rtl">her own fix of a judged step; the model reports the validated step/result</span>  
   → گام ۲ becomes ✓ «۱۰ جعبه (اصلاح شد ⇐ ۱۲)» from the model's validated step (page re-checks 14.4 ÷ 1.44 = 10); the resume point MOVES to گام ۳ (now to be redone: 10 + 10% ⇒ 11); the turn question is no longer «گامِ ۲ … کجایش می‌لنگد؟»; the page never says «از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود» / «چیزی برای عوض کردن نبود»; not only a bare «آره» can fix a step
11. [chat] <span dir="rtl">[verdict: «۴۵۰ دقیقه یعنی ۴٫۵ ساعت» ✗; next step marked dependent] ‖ U: بله متوجه شدم، ۴۵۰ دقیقه ۷٫۵ ساعت است نه ۴٫۵. پس کلِ کار ۷٫۵ + ۲ یعنی ۹٫۵ ساعت می‌شود.</span> — _context:_ <span dir="rtl">elder 68, «شما»; her fix plus the redone dependent step in one message</span>  
   → both land in the ledger: the unit step ✓ (450 ÷ 60 = 7.5, «اصلاح شد ⇐ ۴٫۵»), the dependent step re-judged with the new value (7.5 + 2 = 9.5 ✓) and its «وابسته» mark cleared; resume moves past both; the correction engine recognises the prior record
12. [chat] <span dir="rtl">[مسئلهٔ همنهشتی: گام ۲ ✗] ‖ U: ولی گامِ ۲ چرا غلطه؟ ۸ به توانِ هر چی باشه باقی‌مونده‌ش همون توانه دیگه!</span> — _context:_ <span dir="rtl">teen 17; a natural dispute with NO leading «نه / قبول ندارم»</span>  
   → read by meaning as a dispute of گام ۲ ⇒ a re-check WITH evidence (e.g. 8² = 64 = 7·9 + 1 ⇒ remainder 1, not 2); the re-check's result lands on the page (🔭/📜: «دوباره سنجیده شد — حکم ماند، شاهد: …»), not a permanent «رد کردی — در گفت‌وگو دوباره سنجیده می‌شود»; never the A073 line «خودت فکر می‌کنی چرا؟ … توضیحِ آماده را نده»
13. [chat] <span dir="rtl">[verdict: her step «۹۰ کیلومتر بر ساعت = ۲۵ متر بر ثانیه» judged ✗ by the model] ‖ U: اشتباه می‌کنی. ۹۰ کیلومتر یعنی ۹۰ هزار متر، تقسیم بر ۳۶۰۰ ثانیه میشه ۲۵.</span> — _context:_ <span dir="rtl">adult, driving-distance problem; SHE is right</span>  
   → dispute ⇒ re-check ⇒ the page can compute the evidence itself (90 000 ÷ 3600 = 25) ⇒ the verdict CHANGES to ✓ on the page with the evidence; resume point moves on; neither caving without evidence nor insisting
14. [chat] <span dir="rtl">[a dispute of گام ۳ was re-checked in turn n; the verdict stayed with evidence] ‖ [turns n+1 … n+4 on other steps]</span> — _context:_ <span dir="rtl">any learner</span>  
   → the turn question «دلیلِ تازه‌ات برای گامِ ۳ …؟ / حکمِ گامِ ۳ را رد کردی — به چه دلیل درست است؟» is asked at most once; after the re-check is recorded («دوباره سنجیده شد») it is never repeated on the following turns
15. [page] <span dir="rtl">[she pressed «✗ نه» on گام ۵ by mistake] ‖ U: اشتباهی زدم، گامِ ۵ رو قبول دارم</span> — _context:_ <span dir="rtl">adult; a misclick withdrawn in words</span>  
   → the rejection of گام ۵ is withdrawn (state back to accepted); the dispute question for گام ۵ stops immediately; 📜 keeps «رد ⇒ پس گرفته شد»
16. [chat] <span dir="rtl">U: برای n=۶ و n=۷ امتحان کردم: ۱+۲+…+۶ میشه ۲۱ و تا ۷ میشه ۲۸، با n(n+1)/2 جور دراومد. اثباتش رو هم پیدا کردم: دنباله رو یه بار رو به جلو و یه بار برعکس می‌نویسم، هر ستون میشه n+1 و n تا ستون داریم، پس دو برابرِ مجموع میشه n(n+1).</span> — _context:_ <span dir="rtl">teen 14; a test FOLLOWED by a proof</span>  
   → the turn question is the proof question (check the proof's own steps / does it cover every n), never «همین پیام حدس است … چطور می‌آزمایی‌اش؟»; the tested cases are recorded as her tests, the proof as her argument
17. [page] <span dir="rtl">[a step with a page-detected slip: «۴۵ میلی‌متر = ۰٫۴۵ متر»] ‖ [open 🧭 tooltip, 📜, 🔭 «کارِ پیشینِ تو», the printed/downloaded dossier]</span> — _context:_ <span dir="rtl">every person-facing surface</span>  
   → none of them shows the coach-facing check line: no «(… نه ۰٫۴۵ (عددِ درست را لو نده))», no correct value 0.045, no internal instruction; the person-facing wording says only where to look (the unit conversion)
18. [chat] <span dir="rtl">[prior-work problem, گام ۳ in progress] ‖ U: خب گامِ ۳ رو دوباره رفتم، شد ۸۴۰ هزار تومن. راستی یه چیزی یادم رفته بود بگم: کرایهٔ وانت رو هم باید اضافه کنم.</span> — _context:_ <span dir="rtl">adult; the message contains a «یادم رفت» phrase AND a step result AND a new plan item</span>  
   → the turn's story is NOT dropped: the result of گام ۳ («۸۴۰ هزار تومن») is recorded/merged, the new item («کرایهٔ وانت») enters the plan/steps, and the page question on the next turns no longer asks for what she already found
19. [events] <span dir="rtl">[mind card «از کجا؟» after مسئلهٔ سرامیک]</span> — _context:_ <span dir="rtl">adult</span>  
   → a prior event credits her correct گام ۱ («اجرا +», labelled as her prior step); the wrong گام ۲ is booked WITH a cause (skill: decimal division), not «علت نامعلوم» and not a blanket «گیر»; the list is not only «طرحی که گفت / نتیجه‌ای که گفت»
20. [events] <span dir="rtl">[mind card after a child's prior-work opening with 2 ✓ steps and 1 ✗]</span> — _context:_ <span dir="rtl">child 10</span>  
   → the child (and her parent) can see which of her steps were right: 2 credited, 1 with a cause in child-simple words; the card does not show only «اجرای طرح ۵۰٪ (۱/۲)» with no source
21. [chat] <span dir="rtl">[opening ledger: گام ۱ ✓ «۴۰۰ مترمربع × ۶ لیتر = ۲۴۰۰ لیتر در روز»; chat results built on it over later turns] ‖ U: ببخشید، گلخونه ۴۰۰ متر نیست، ۴۵۰ متره.</span> — _context:_ <span dir="rtl">adult, greenhouse; a datum that earlier ✓ steps and chat results used</span>  
   → the correction reaches (a) the chat statement, (b) the ledger: گام ۱ is no longer a plain ✓ on «۲۴۰۰» — marked «کهنه پس از اصلاح» / asked (450 × 6 = 2700), and (c) the chat result chain built on 2400 (each marked stale or asked once); not only the statement changes
22. [route] <span dir="rtl">[🧭 after an opening with four numbered prior steps, two ✓]</span> — _context:_ <span dir="rtl">any prior-work problem</span>  
   → the main line is built from the prior steps (✓ steps as passed, the resume step as «اکنون»): «مانده: ۲ گام از ۴» or the like; never «مانده: نامعلوم — طرح هنوز نیست»; the prior steps are not only side dots
23. [page] <span dir="rtl">[the problem was solved in chat; whole sentence, unknown, data and result all given there] ‖ [she presses «✅ حل شد»]</span> — _context:_ <span dir="rtl">adult</span>  
   → the close gate accepts what she already gave: her own whole sentence is not rejected as «رونوشتِ صورت»; no list of «هنوز نه: … مفهومِ مبهم، تقریبِ کافی، ریاضی‌کردن، حدس» for fields answered in chat; only a genuinely missing field (if any) is asked, once
24. [page] <span dir="rtl">[مسئلهٔ سرامیک after her fix of گام ۲ and after the problem is closed] ‖ [open 🔭 of the closed problem]</span> — _context:_ <span dir="rtl">the ledger follows fixes and closure</span>  
   → the section no longer says «ازسرگیری از گامِ ۲/۳»; it shows the final states (fixed, ✓) as history
25. [page] <span dir="rtl">[گام ۲ ✗ «۱۲ جعبه»; گام ۳ «ده درصد پرت ⇒ همون ۱۲ جعبه»]</span> — _context:_ <span dir="rtl">dependency by derivation</span>  
   → گام ۳ is «وابسته به گامِ ۲» because it USES the wrong result of step 2 (derivation), and the mark clears/recomputes when step 2 is fixed

### Negative (look-alike)

1. [chat] <span dir="rtl">[the coach is guiding her through مسئلهٔ سرامیک step by step] ‖ U: خب ۱۴٫۴ رو تقسیم بر ۱٫۴۴ کردم شد ۱۰. بعد ده درصد اضافه کردم، پس میشه ۱۱ جعبه.</span> — _context:_ <span dir="rtl">an ordinary mid-solve step report with «بعد / پس / شد»</span>  
   → NO «# کارِ پیشینِ تو … گزارش کن prior» block or request in the prompt; recorded as the result of the current step; the opening ledger (if any) is not rebuilt
2. [chat] <span dir="rtl">U: اول ۷ تا مهره برداشتم، بعد ۵ تا دیگه، پس میشه ۱۲ تا</span> — _context:_ <span dir="rtl">child 9, thinking aloud in the middle of a problem</span>  
   → no prior block; a step result only
3. [chat] <span dir="rtl">U: معلممون امروز گفت اول صورتِ مسئله رو بخونید، بعد شکل بکشید. پس منم شکل کشیدم ولی بازم نفهمیدم.</span> — _context:_ <span dir="rtl">teen 13; a classroom anecdote with «اول / بعد / پس»</span>  
   → no prior block; nothing booked as «اجرا −» on the mind card for the teacher's words; treated as stuck at understanding
4. [chat] <span dir="rtl">U: اول باید مسئله رو ثبت کنم بعد برگه‌ها رو ببینم؟ پس این فرم‌ها کجا ذخیره میشن؟</span> — _context:_ <span dir="rtl">a pure question about the system</span>  
   → no prior block; answered/routed as a question
5. [chat] <span dir="rtl">[the coach checks a prerequisite: «نصفِ ۳۰ چند است؟»] ‖ U: نصفِ ۳۰ میشه ۱۵، پس یک‌چهارمش میشه ۷٫۵</span> — _context:_ <span dir="rtl">child 12; a prerequisite answer</span>  
   → no prior block; goes to the prerequisite check (✓: 30 ÷ 4 = 7.5)
6. [chat] <span dir="rtl">A: برای این دیوار دو قوطی رنگ بس است؟ ‖ U: نه، بس نیست!</span> — _context:_ <span dir="rtl">elder 81, «شما»; a ledger with judged steps exists; her «نه» answers the assistant's question</span>  
   → NOT a dispute of any verdict: no «حکمِ گامِ ۲ را رد کردید — به چه دلیل درست است؟» on this or later turns; her answer goes to the question asked
7. [chat] <span dir="rtl">[verdict گام ۲ ✗] ‖ U: نه نه، درست میگی، گامِ ۲ غلطه، خودمم شک داشتم</span> — _context:_ <span dir="rtl">leading «نه» but an acceptance by meaning</span>  
   → گام ۲ = accepted (not disputed); no re-check queue, no «رد کردی»
8. [chat] <span dir="rtl">[verdicts shown] ‖ U: نه دیگه، امروز خسته شدم. فردا ادامه میدیم.</span> — _context:_ <span dir="rtl">any</span>  
   → not a dispute; every step keeps its state; the resume point is kept for the return
9. [chat] <span dir="rtl">[verdict گام ۲ ✗] ‖ U: نه، منظورم اینه که گامِ ۲ رو یه کم بیشتر باز کن، نفهمیدم ایرادش کجاست</span> — _context:_ <span dir="rtl">a request for explanation</span>  
   → not registered as a rejection of the verdict; the coach explains where to look (without giving the number); no dispute question
10. [chat] <span dir="rtl">U: 2^n − 1 رو برای n=۲ و ۳ و ۵ و ۷ امتحان کردم: ۳، ۷، ۳۱، ۱۲۷، همه اول‌ان. ولی نمی‌دونم همیشه همین‌طوره یا نه. گیر کردم.</span> — _context:_ <span dir="rtl">teen 16; tested cases of a claim, then stuck</span>  
   → tested cases are NOT a prior ledger: no «کارِ پیشینِ تو: ۴ گام — همه درست», no turn question «همهٔ گام‌های پیشینت درست درآمد — گامِ بعدی؟», stage not «اجرای طرح»; the turn helps her stuck (how would she test the next case / look for a counterexample — the page does not announce that n = 11 fails); register «تو» for a teen who does not use «شما»
11. [page] <span dir="rtl">[گام ۲: «انرژی = ۱۵۰۰ وات × ۱۲۰۰ ثانیه = ۱۸۰۰۰۰۰ ژول، یعنی ۱۸ کیلووات‌ساعت» ✗ for the kWh part] ‖ [گام ۴: «۱۸۰۰۰۰۰ ژول تقسیم بر (۴۲۰۰ × ۲۰) یعنی آبِ ۲۰ لیتری حدودِ ۲۱٫۴ درجه گرم می‌شود» ✓]</span> — _context:_ <span dir="rtl">adult, water-heater problem; step 4 uses the CORRECT joule value of step 2</span>  
   → گام ۴ is NOT «وابسته به گامِ ۲»: it shares the number 1800000 but rests on the correct part (1500 × 1200 = 1 800 000 J ✓; 1 800 000 ÷ 84 000 ≈ 21.4 ✓); the wrong part was only the kWh conversion (1.8 MJ = 0.5 kWh)
12. [page] <span dir="rtl">[گام ۱ ✗ «۱۲ جعبه»] ‖ [گام ۳: «قسطِ ۱۲ ماهه می‌گیرم»]</span> — _context:_ <span dir="rtl">the same numeral in an unrelated role</span>  
   → no dependency mark from the coincidence of «۱۲»
13. [chat] <span dir="rtl">[مسئلهٔ سرامیک: گام ۲ ✗] ‖ U: آها، پس میشه ۱۱ جعبه</span> — _context:_ <span dir="rtl">her «fix» is still wrong for step 2 (14.4 ÷ 1.44 = 10)</span>  
   → NOT applied as fixed: the model's validated step does not confirm it and the page's own check disagrees; گام ۲ stays ✗; resume stays; the correct number is not given away
14. [prompt] <span dir="rtl">[the model, unasked, sends a one-step `prior` report on an ordinary mid-solve message]</span> — _context:_ <span dir="rtl">a ledger of 4 steps from the opening exists</span>  
   → the opening ledger is never REPLACED: the report is merged into the matching step or ignored; the counts still cover 4 steps
15. [prompt] <span dir="rtl">[the coach block of the prompt for a step with a page-detected slip]</span> — _context:_ <span dir="rtl">coach-facing text</span>  
   → the coach-facing check line (with «عددِ درست را لو نده») MAY be in the model's prompt — it is forbidden only on 🧭, 📜, 🔭 and any view or export the person sees
16. [chat] <span dir="rtl">U: یادم رفت دیروز تا کجا رسیدیم، یادم بنداز</span> — _context:_ <span dir="rtl">a real recall request, no new content in the message</span>  
   → the recall answer is given as before; nothing is invented as a prior step; the ledger and resume point are unchanged
17. [events] <span dir="rtl">[prior-work proof problem] ‖ U: ادعای خودم رو با یه مثالِ نقض رد کردم: برای n=۴ جور درنمیاد.</span> — _context:_ <span dir="rtl">teen 17; a successful refutation of her own claim</span>  
   → the mind card does not book it as «گیر (−۱، علت نامعلوم)»; it is a tested-and-refuted guess credited to her checking
18. [chat] <span dir="rtl">[prior-work ledger about the greenhouse's daily water] ‖ U: راستی جلسه با پیمانکار ساعت ۱۰ نیست، ساعت ۱۱ است.</span> — _context:_ <span dir="rtl">a correction of a number NO prior step used</span>  
   → the ledger and the chat result chain are untouched (no stale marks); only the appointment datum changes
19. [route] <span dir="rtl">U: یه مسئله دارم: چطور قبضِ گاز رو کم کنیم؟ فکر می‌کنم باید درزِ پنجره‌ها رو بگیریم.</span> — _context:_ <span dir="rtl">problem + idea, no steps</span>  
   → no prior section, no invented verdicts; 🧭 «طرح هنوز نیست» is correct here
20. [page] <span dir="rtl">[solved in chat; she never said what she learned] ‖ [she presses «✅ حل شد»]</span> — _context:_ <span dir="rtl">a field she really did not give</span>  
   → that one missing field may be asked once; the fields she gave in chat are not re-asked
21. [chat] <span dir="rtl">U: به نظرم حاصل‌ضربِ هر دو عددِ متوالی همیشه زوجه</span> — _context:_ <span dir="rtl">teen 15; a bare claim, no test, no proof</span>  
   → the guess question («چطور می‌آزمایی‌اش؟») is legitimate here — the proof question is only for a test followed by a proof
22. [chat] <span dir="rtl">[مسئلهٔ سرامیک verdicts shown] ‖ U: گامِ ۲ و ۳ هر دو رو قبول دارم، اشتباه از من بود</span> — _context:_ <span dir="rtl">both accepted in one sentence</span>  
   → both steps = accepted; nothing disputed; the model's proposed fixes may now be written (her yes)
23. [chat] <span dir="rtl">[a dispute of گام ۲ was re-checked and the verdict stayed with evidence] ‖ U: نه! من درست میگم</span> — _context:_ <span dir="rtl">a bare repeat with no new reason</span>  
   → the verdict is not withdrawn to please her and not re-argued in a loop: the page shows the recorded evidence once more and asks which part of it she doubts; no new «رد کردی» entry
24. [chat] <span dir="rtl">U: می‌خوام ببینم برای ۳۵ مهمون چند کیلو برنج لازمه. گام ۱: هر نفر ۱۲۰ گرم. گام ۲: ۳۵ × ۱۲۰ = ۴۲۰۰ گرم. گام ۳: یعنی ۴٫۲ کیلو. بعدش نمی‌دونم چقدر اضافه بگیرم.</span> — _context:_ <span dir="rtl">adult; a prior-work opening whose steps are ALL ✓ (35 × 120 = 4200; 4200 g = 4.2 kg)</span>  
   → no «گامِ … کجایش می‌لنگد؟» on any step: the resume point is the open part she named (the margin); correct steps are not re-asked

## P2.arith_check · the page's own arithmetic check (whole right-hand side evaluated, fraction sums included; running sums and chained a = b = c; «n و خرده‌ای، یعنی …» and the Unicode minus; unit factors; never «درست» beside a ✗ step; later chat messages of a prior-work problem re-checked). Every expectation starts with the verdict the PAGE's check must give: «OK» = not flagged (and a model ✓ stays ✓) · «FLAG» = flagged, the model's ✓ is overridden. pos = one of the listed forms is read with the right verdict (both directions); neg = a look-alike the check must not evaluate as that arithmetic / must stay silent on.


### Positive

1. [chat] <span dir="rtl">U: … گام ۲: 5/6 = 1/2 + 1/3</span> — _context:_ <span dir="rtl">adult; Latin digits; a fraction sum on the right-hand side</span>  
   → OK — the whole right side is evaluated (1/2 + 1/3 = 5/6); never «۵/۶ با ۱/۲ نمی‌خواند» from comparing the left side with the first fraction only
2. [chat] <span dir="rtl">U: … گامِ ۳: ۳/۷ = ۱/۳ + ۱/۱۱ + ۱/۲۳۱</span> — _context:_ <span dir="rtl">teen 17, olympiad (unit-fraction decomposition); Persian digits; three fractions</span>  
   → OK — 1/3 + 1/11 + 1/231 = 3/7 exactly; the model's ✓ stays; the resume point is not put on this step; the mind card does not count it negative
3. [chat] <span dir="rtl">U: برای n=17 پیدا کردم: 4/17 = 1/5 + 1/30 + 1/510</span> — _context:_ <span dir="rtl">adult, number-theory hobbyist</span>  
   → OK — exact (1/5 + 1/30 = 7/30; 4/17 − 7/30 = 1/510)
4. [chat] <span dir="rtl">U: 4/13 = 1/4 + 1/18 + 1/468 رو هم چک کردم</span> — _context:_ <span dir="rtl">teen 16</span>  
   → OK — exact
5. [chat] <span dir="rtl">U: 6/4 = 1/1 + 1/4 + 1/4</span> — _context:_ <span dir="rtl">adult; a first term «1/1»</span>  
   → OK — 1 + 1/4 + 1/4 = 3/2 = 6/4; never «۶/۴ = ۱٫۵، نه ۱/۱»
6. [chat] <span dir="rtl">U: 1/365 = 1/366 + 1/133590</span> — _context:_ <span dir="rtl">adult; large denominators</span>  
   → OK — exact (365 × 366 = 133590); exact rational arithmetic, no float tolerance error
7. [chat] <span dir="rtl">U: ۷/12 = 1/۳ + ۱/4</span> — _context:_ <span dir="rtl">mixed Persian/Latin digits inside one equality</span>  
   → OK — digits normalised; 1/3 + 1/4 = 7/12
8. [chat] <span dir="rtl">U: گام ۲: 1/6 + 1/10 + 1/15 = 1/3</span> — _context:_ <span dir="rtl">the sum on the LEFT side</span>  
   → OK — (5 + 3 + 2)/30 = 1/3
9. [chat] <span dir="rtl">U: 1/12 = 1/3 − 1/4</span> — _context:_ <span dir="rtl">a difference on the right side with the Unicode minus «−»</span>  
   → OK — 1/3 − 1/4 = 1/12
10. [chat] <span dir="rtl">U: … گام ۲: 2/3 = 1/2 + 1/5</span> — _context:_ <span dir="rtl">teen 15; genuinely wrong fraction sum</span>  
   → FLAG — 1/2 + 1/5 = 7/10 ≠ 2/3; the model's ✓ (if any) is overridden; resume on this step; the person-facing line does not give the right decomposition
11. [chat] <span dir="rtl">U: ۲/۱۵ = ۱/۸ + ۱/۱۰۰</span> — _context:_ <span dir="rtl">adult; genuinely wrong (the right partner of 1/8 is 1/120)</span>  
   → FLAG — 1/8 + 1/100 = 27/200 ≠ 2/15
12. [chat] <span dir="rtl">U: ۱/۲ با ۱/۳ میشه ۵/۶، با ۱/۴۲ میشه ۶/۷</span> — _context:_ <span dir="rtl">teen 16; a running sum in words («با … میشه …»)</span>  
   → OK — read as a running total: 1/2 + 1/3 = 5/6, then 5/6 + 1/42 = 6/7; never read as «۱/۴۲ = ۶/۷»; the next step is not marked dependent on a false ✗
13. [chat] <span dir="rtl">U: نون ۴۵ تومن، با پنیر که ۱۲۰ تومنه میشه ۱۶۵، با شیر ۸۰ تومنی میشه ۲۴۵ هزار تومن</span> — _context:_ <span dir="rtl">elder 70, shopping; running sum with words between the numbers</span>  
   → OK — 45 + 120 = 165; 165 + 80 = 245
14. [chat] <span dir="rtl">U: ۸ تا داشتم، با ۵ تا میشه ۱۳ تا، با ۶ تا دیگه میشه ۱۹ تا</span> — _context:_ <span dir="rtl">child 8</span>  
   → OK — 8 + 5 = 13; 13 + 6 = 19; said to the child in simple words, no decimal framing
15. [chat] <span dir="rtl">U: ۳۸ با ۲۷ میشه ۶۵، با ۱۹ میشه ۸۲</span> — _context:_ <span dir="rtl">adult; running sum whose SECOND link is wrong</span>  
   → FLAG the second link only (65 + 19 = 84, not 82); the first link (38 + 27 = 65) is OK
16. [chat] <span dir="rtl">U: امتیازِ خونهٔ اول: 0.3×14 + 0.5×8 + 0.2×15 = 4.2 + 4 + 3 = 11.2</span> — _context:_ <span dir="rtl">adult, weighted decision; chained equality a = b = c</span>  
   → OK — each link holds (4.2 + 4 + 3 = 11.2); never «حسابِ «۰.۳ × ۱۴ + …» با عددِ نوشته‌شده («۴.۲») نمی‌خواند»
17. [chat] <span dir="rtl">U: ۱۲×۱۵ = ۱۲×۱۰ + ۱۲×۵ = ۱۲۰ + ۶۰ = ۱۸۰</span> — _context:_ <span dir="rtl">child 12; a four-member chain</span>  
   → OK — all four members equal 180
18. [chat] <span dir="rtl">U: 2^10 = 1024 = 7·146 + 2، پس باقی‌مانده ۲ است</span> — _context:_ <span dir="rtl">teen 17, olympiad; powers, a middle dot for multiplication</span>  
   → OK — 2^10 = 1024 and 7 × 146 + 2 = 1024
19. [chat] <span dir="rtl">U: برای n=5: 5^3 − 5 = 125 − 5 = 120 = 6·20</span> — _context:_ <span dir="rtl">teen 16; chain with the Unicode minus «−»</span>  
   → OK — every member is 120
20. [chat] <span dir="rtl">U: ۰٫۴×۷ + ۰٫۶×۵ = ۲٫۸ + ۳ = ۶٫۸</span> — _context:_ <span dir="rtl">adult; chain whose LAST link is wrong; Persian decimal separator «٫»</span>  
   → FLAG the last link only (2.8 + 3 = 5.8, not 6.8); the first link (0.4×7 = 2.8, 0.6×5 = 3) is OK
21. [chat] <span dir="rtl">U: ۱۷×۶ = ۹۲ = ۹۰ + ۲</span> — _context:_ <span dir="rtl">child 11; chain whose FIRST link is wrong while the second is true</span>  
   → FLAG the first link (17 × 6 = 102); the true link «۹۲ = ۹۰ + ۲» does not rescue the chain and is not itself flagged
22. [chat] <span dir="rtl">U: 1 + 2 + … + 100 = 100·101/2 = 5050</span> — _context:_ <span dir="rtl">teen 15; an ellipsis sum</span>  
   → OK — the ellipsis side is not evaluated as «1 + 2 + 100»; 100 × 101 ÷ 2 = 5050 holds
23. [chat] <span dir="rtl">U: ۵۰۰ تقسیم بر ۱۸۰ میشه ۲ و خرده‌ای، یعنی ۲٫۷۸ رول</span> — _context:_ <span dir="rtl">elder 76, «شما», wallpaper rolls</span>  
   → OK — «۲ و خرده‌ای» is «between 2 and 3», and «یعنی ۲٫۷۸» is the value compared (500 ÷ 180 = 2.777…); never «با عددِ نوشته‌شده («۲») نمی‌خواند»
24. [chat] <span dir="rtl">U: ۱۷ تقسیم بر ۵ میشه ۳ و یه چیزی</span> — _context:_ <span dir="rtl">child 9</span>  
   → OK — not flagged; if anything is said it is in the remainder frame (۳ و ۲ تا باقی‌مانده), never «۱۷ / ۵ = ۳٫۴، نه ۳»
25. [chat] <span dir="rtl">U: ۱۰ تقسیم بر ۴ میشه ۲ و نیم</span> — _context:_ <span dir="rtl">adult</span>  
   → OK — «۲ و نیم» = 2.5
26. [chat] <span dir="rtl">U: ۹۵ تقسیم بر ۱۲ میشه ۷ و خرده‌ای، یعنی ۷٫۹</span> — _context:_ <span dir="rtl">adult, no ZWNJ in «خرده ای» variant accepted too</span>  
   → OK — 95 ÷ 12 = 7.9166…, rounds to 7.9
27. [chat] <span dir="rtl">U: ۹۰۰ تقسیم بر ۳۵۰ میشه ۳ و خرده‌ای</span> — _context:_ <span dir="rtl">adult; the whole part is wrong</span>  
   → FLAG — 900 ÷ 350 = 2.57…, i.e. «۲ و خرده‌ای»
28. [chat] <span dir="rtl">U: ۲۶۰ تقسیم بر ۴۸ میشه ۵ و خرده‌ای، یعنی ۵٫۸</span> — _context:_ <span dir="rtl">adult; whole part right, stated decimal wrong</span>  
   → FLAG on «۵٫۸» (260 ÷ 48 = 5.4166…); «۵ و خرده‌ای» itself is right
29. [chat] <span dir="rtl">U: گام ۴: −۷ + ۵۰ = ۴۳</span> — _context:_ <span dir="rtl">adult; a leading Unicode minus «−» (U+2212)</span>  
   → OK — read as −7 + 50 = 43; never «حسابِ «۷ + ۵۰» با «۴۳» نمی‌خواند»
30. [chat] <span dir="rtl">U: گام ۴: −۴ + ۳۱ = ۳۵</span> — _context:_ <span dir="rtl">adult; wrong, and dropping the minus would make it look right (4 + 31 = 35)</span>  
   → FLAG — −4 + 31 = 27
31. [chat] <span dir="rtl">U: ۱۲ − ۲۰ = −۸ ‖ U: (−3)×(−4) = 12 ‖ U: ۱۵ – ۹ = ۶</span> — _context:_ <span dir="rtl">Unicode minus on both sides; signed factors; an en dash «–» typed as minus</span>  
   → OK ×3 — 12 − 20 = −8; (−3)(−4) = 12; 15 − 9 = 6
32. [chat] <span dir="rtl">U: سقف ۶۰ مترمربعه و بارش ۳۲۰ میلی‌متر، پس ۶۰ × ۳۲۰ = ۱۹۲۰۰ مترمکعب آب جمع میشه</span> — _context:_ <span dir="rtl">adult; mm ⇒ m unit factor missed; the bare product 60 × 320 = 19200 is numerically right</span>  
   → FLAG as a unit slip (mm ⇒ m: 60 × 0.32 = 19.2 m³); the check does not pass it because the product is right
33. [chat] <span dir="rtl">U: ۳۲۰ میلی‌متر یعنی ۰٫۳۲ متر، پس ۶۰ × ۰٫۳۲ = ۱۹٫۲ مترمکعب</span> — _context:_ <span dir="rtl">the same problem done right</span>  
   → OK — unit factor and product both right
34. [chat] <span dir="rtl">U: مصرف ۵۴۰۰ کیلوژول بود، یعنی ۵٫۴ کیلووات‌ساعت</span> — _context:_ <span dir="rtl">adult; kJ ⇒ kWh</span>  
   → FLAG — 5400 kJ ÷ 3600 = 1.5 kWh
35. [chat] <span dir="rtl">U: ۷۲۰۰ کیلوژول = ۲ کیلووات‌ساعت ‖ U: ۹ مگاژول = ۲٫۵ کیلووات‌ساعت</span> — _context:_ <span dir="rtl">correct energy conversions</span>  
   → OK ×2 — 7200 ÷ 3600 = 2; 9 MJ ÷ 3.6 MJ = 2.5
36. [chat] <span dir="rtl">U: ضخامت ۴۵ میلی‌متره یعنی ۰٫۴۵ متر ‖ U: طولِ تخته ۲۴۰ سانته یعنی ۲٫۴ متر ‖ U: ۷۵۰ گرم = ۰٫۷۵ کیلو</span> — _context:_ <span dir="rtl">elder 66, carpentry; length and mass conversions</span>  
   → FLAG the first (45 mm = 0.045 m); OK the second (2.4 m) and third (0.75 kg)
37. [chat] <span dir="rtl">U: ۱۵۰۰ ثانیه یعنی ۱۵ دقیقه ‖ U: ۲۱۰۰ ثانیه = ۳۵ دقیقه ‖ U: ۹۰ کیلومتر بر ساعت = ۲۵ متر بر ثانیه</span> — _context:_ <span dir="rtl">time and speed conversions</span>  
   → FLAG the first (1500 s = 25 min); OK the second (35) and third (90 000 ÷ 3600 = 25)
38. [page] <span dir="rtl">[a step judged ✗ for its unit or its reasoning; its bare numbers multiply correctly] ‖ [the her-facing line under that step]</span> — _context:_ <span dir="rtl">🔭 «کارِ پیشینِ تو», 📜</span>  
   → the word «درست» never stands next to the ✗: no «حسابِ عددی‌اش را صفحه سنجید: درست — پس نادرستیِ این گام … از جای دیگری است» beside ✗; the line points to where to look (unit / reasoning) without a «درست» verdict that contradicts the mark
39. [time] <span dir="rtl">[D0: prior-work opening, ledger shown] ‖ [D0+1, a later chat message] U: پس ۱۸ × ۲۵ = ۴۶۰ تا آجر لازم دارم</span> — _context:_ <span dir="rtl">adult; arithmetic in a LATER chat message of a prior-work problem</span>  
   → FLAG — 18 × 25 = 450; the page's check also runs on later chat messages of the problem, not only on the opening
40. [time] <span dir="rtl">[D0: prior-work opening] ‖ [D0+1] U: پس ۱۸ × ۲۵ = ۴۵۰ تا آجر لازم دارم</span> — _context:_ <span dir="rtl">the same, correct</span>  
   → OK — no flag; the model's ✓ stays; nothing shown to her as doubtful
41. [chat] <span dir="rtl">U: ۰٫۳۴۶ ÷ ۰٫۴ = ۰٫۸۷ ‖ U: ۱۸٪ از ۲۵۰ = ۴۵ ‖ U: ۱٬۲۵۰ × ۴ = ۵٬۰۰۰ ‖ U: 1,250 × 4 = 5,000</span> — _context:_ <span dir="rtl">a rounded quotient (exactly 0.865); a percentage; Persian and Latin thousands separators</span>  
   → OK ×4 — 0.865 rounded to two places as she wrote is accepted (a rounding is not an error); 0.18 × 250 = 45; 1250 × 4 = 5000 in both separator styles

### Negative (look-alike)

1. [chat] <span dir="rtl">U: امتحانم ۱۴۰۴/۷/۲۶ = روزِ شنبه بود</span> — _context:_ <span dir="rtl">a date written with slashes</span>  
   → not read as a fraction or a division; no arithmetic line
2. [chat] <span dir="rtl">U: ۲/۳ ِ کلاس = ۲۴ نفر</span> — _context:_ <span dir="rtl">a fraction OF a quantity (class of 36)</span>  
   → not read as «2/3 = 24»; no flag (2/3 × 36 = 24 if the class size is known)
3. [chat] <span dir="rtl">U: 2x + 3 = 11 پس x = 4</span> — _context:_ <span dir="rtl">an equation with an unknown</span>  
   → not evaluated as «2 + 3 = 11»; no flag (the solution x = 4 fits)
4. [chat] <span dir="rtl">U: 17 ≡ 2 (mod 5) ‖ U: ۲۳ = ۳ به پیمانهٔ ۵</span> — _context:_ <span dir="rtl">teen 17, congruences, the second written with «=»</span>  
   → not flagged as «17 = 2» / «23 = 3»; a congruence is not an equality of numbers (both are true mod 5)
5. [chat] <span dir="rtl">U: ۷/۱۲ < ۲/۳ ‖ U: π ≈ ۳٫۱۴ ‖ U: ۲۲ تقسیم بر ۷ تقریباً ۳٫۱۴ ‖ U: ۱۷ × ۱۸ حدوداً ۳۰۰</span> — _context:_ <span dir="rtl">an inequality and approximations («≈، تقریباً، حدوداً»)</span>  
   → no flag on any: the inequality is true; approximations are not held to exact equality (22/7 = 3.1428…, 17 × 18 = 306)
6. [chat] <span dir="rtl">U: f(3) = 10 ‖ U: n = 12 ‖ U: a₁ = 5</span> — _context:_ <span dir="rtl">definitions and assignments</span>  
   → not evaluated as arithmetic claims («f × 3», «3 = 10»); no flag
7. [chat] <span dir="rtl">U: (a+b)^2 = a^2 + 2ab + b^2</span> — _context:_ <span dir="rtl">a symbolic identity</span>  
   → not numerically evaluated; no arithmetic line (the model judges it)
8. [chat] <span dir="rtl">U: دوستم نوشته بود ۷×۸ = ۵۴ که غلطه، من ۵۶ گرفتم</span> — _context:_ <span dir="rtl">child 10; she quotes someone else's wrong product and says it is wrong</span>  
   → no ✗ on HER step for the quoted «۷×۸ = ۵۴»; her own value 56 is OK
9. [chat] <span dir="rtl">U: از ۸:۴۵ با ۴۰ دقیقه راه میشه ۹:۲۵</span> — _context:_ <span dir="rtl">clock times</span>  
   → not read as ratios or divisions («8/45»); no flag (8:45 + 40 min = 9:25)
10. [chat] <span dir="rtl">U: بازی ۳-۲ شد ‖ U: صفحه‌های ۱۲-۲۰ = فصلِ دو ‖ U: کدِ ۰۲۱-۵۵۵ = دفتر</span> — _context:_ <span dir="rtl">a score, a page range, a phone prefix with hyphens</span>  
   → none is a subtraction; no arithmetic line
11. [chat] <span dir="rtl">U: مقیاسِ نقشه ۱/۱۰۰ = هر سانت یک متر</span> — _context:_ <span dir="rtl">a scale</span>  
   → not flagged as «1/100 = 1»; (1 cm on the map = 100 cm = 1 m is consistent)
12. [chat] <span dir="rtl">U: یک‌سوم به‌علاوهٔ یک‌ششم میشه نصف</span> — _context:_ <span dir="rtl">fractions in words</span>  
   → never flagged; if the page reads number words it reads them as true (1/3 + 1/6 = 1/2), otherwise it stays silent
13. [chat] <span dir="rtl">U: ۱۰۱ در مبنای ۲ = ۵</span> — _context:_ <span dir="rtl">teen 14; another base</span>  
   → not flagged as «101 = 5» (binary 101 is 5)
14. [chat] <span dir="rtl">U: ۱۲۰ هزار تومن = ۱٫۲ میلیون ریال</span> — _context:_ <span dir="rtl">currency units toman/rial</span>  
   → not flagged (120 000 × 10 = 1 200 000); number words «هزار / میلیون» read as scale
15. [chat] <span dir="rtl">U: گام ۲ = گام ۳ منهای پرت ‖ U: نسخهٔ ۲٫۵ = نسخهٔ تازه</span> — _context:_ <span dir="rtl">step labels and a version number with «=»</span>  
   → no arithmetic evaluation («2 = 3 − …»); no flag
16. [page] <span dir="rtl">[a ✓ step whose arithmetic the page also finds right]</span> — _context:_ <span dir="rtl">the look-alike of the «درست beside ✗» rule</span>  
   → «حسابِ صفحه: درست» may stand beside a ✓ step — the ban is only on a ✗ step
17. [time] <span dir="rtl">[D0: step «۱۸ × ۲۵ = ۴۶۰» flagged] ‖ [D0+1] U: قبلاً نوشته بودم ۱۸ × ۲۵ = ۴۶۰ که غلط بود؛ درستش ۴۵۰ ـه</span> — _context:_ <span dir="rtl">a later message that QUOTES her old wrong product while fixing it</span>  
   → the quoted old product is not flagged a second time as a new error; her new value 450 is OK and fixes the step

## P3.territory_unclear_fit · territory loop on an unclear fit (words from the sheet's own framing — view names, sheet-title words — are generic; token fragments dropped; generic words weigh little; a match resting on such words ⇒ ask her, never «رسید»; her «نه / همون نیست» after an arrival or an ask ⇒ back to waiting, sheet reopened with a note, Today line restored (sys_fit false); never ask and declare in the same pass; honest lag line for generic replies; a sub-problem brought after closure gets its own waiting entry; no duplicate waiting rows)


### Positive

1. [events] <span dir="rtl">[sheet #101 «دقیقاً چه کم است»: «… در نمای «🧮 ماشینِ برآورد» چیزی برای این گام نیست»] ‖ [reply] حوزهٔ تازهٔ «برآوردِ هزینهٔ ساخت» افزوده شد. [registry diff: + one area with that title]</span> — _context:_ <span dir="rtl">adult; step «۴ — آیا داروخانه‌های محل حاضرند همکاری کنند؟» ⏸ waiting for sheet #101 (gap.step = 4) — referred to below as «گامِ داروخانه»</span>  
   → the only shared word «برآورد» comes from a VIEW NAME inside the sheet's own framing ⇒ counts as generic ⇒ no clear fit ⇒ the page ASKS her «این ابزارِ تازه همان است که برای گامِ «۴ …» لازم بود؟»; state stays wait; no «🛎 ابزارِ لازم آمد», no «سنجیدم که نیازِ گام را جواب می‌دهد»
2. [events] <span dir="rtl">[sheet title: «[دستیار · کمبودِ سامانه] ابزارِ سنجشِ همکاریِ فروشنده‌ها»] ‖ [reply] یک ابزارِ تازهٔ دستیار برای کمبودهای سامانه ساخته شد. [registry diff: + area «رفعِ کمبودهای دستیار»]</span> — _context:_ <span dir="rtl">گامِ داروخانه waits</span>  
   → «دستیار، کمبود، سامانه، ابزار» are sheet-title scaffolding ⇒ generic ⇒ never an arrival; ask her or report a mismatch — one of the two, not both
3. [events] <span dir="rtl">[reply] حوزهٔ «آرشیوِ اندازه‌گیری‌ها» افزوده شد. [registry diff: + that area]</span> — _context:_ <span dir="rtl">step «۳ — برای ۴۰ نان چقدر آرد اندازه کنم؟» ⏸ waits (gap.step = 3); craft (baking), elder 67</span>  
   → the fragment «آر» (a piece of «آرد» / «آرشیو») is not a token ⇒ dropped; «اندازه / اندازه‌گیری» is generic ⇒ no arrival; ask her in «شما» or mismatch
4. [events] <span dir="rtl">[reply] حوزهٔ «کار با عدد و داده و اندازه» افزوده شد. [registry diff: + that area]</span> — _context:_ <span dir="rtl">step «۲ — چند عدد از دادهٔ فروش برای دیدنِ روند بس است؟» ⏸ waits</span>  
   → the shared words «عدد، داده، اندازه» are generic and carry low weight ⇒ the score is not clear ⇒ ask her; never «رسید»
5. [chat] <span dir="rtl">[the page declared «🛎 ابزارِ لازم آمد … همان گام را از سر می‌گیریم»] ‖ U: نه، این همون نیست؛ با این نمیشه فهمید همکاری می‌کنن یا نه.</span> — _context:_ <span dir="rtl">گامِ داروخانه; the model reports sys_fit {fit:false}</span>  
   → the step goes BACK to ⏸ waiting (never «resumed / از سر گرفته شد ✓»); sheet #101 is reopened with a note carrying her objection; the Today line «⏸ منتظرِ برگهٔ #۱۰۱» is restored and «🛎 … همان گام را از سر بگیر» is gone; 📜 outcome «جور نبود (به گفتهٔ خودت) — برگه دوباره باز شد»
6. [chat] <span dir="rtl">[the page asked «این ابزارِ تازه همان است که برای گامِ «۴ …» لازم بود؟»] ‖ U: نه</span> — _context:_ <span dir="rtl">her no after an ASK</span>  
   → step stays ⏸; sheet reopened with a note; Today waiting line stays; no resume turn
7. [chat] <span dir="rtl">[arrival declared for the area «بررسیِ قیمتِ عمده»] ‖ U: این که ابزارِ قیمته، من دنبالِ اینم که اصلاً قبول می‌کنن یا نه</span> — _context:_ <span dir="rtl">rejection by meaning, no «نه», no «همون نیست»</span>  
   → read as sys_fit false ⇒ back to waiting, sheet reopened with the note, Today line restored
8. [chat] <span dir="rtl">[arrival declared] ‖ U: خیر، این آن چیزی نیست که لازم داشتم. لطفاً دوباره پیگیری بفرمایید.</span> — _context:_ <span dir="rtl">elder 79, «شما»</span>  
   → the same return to waiting, said in «شما» («گامِ … دوباره منتظر است؛ زیرِ برگه نوشتم»)
9. [events] <span dir="rtl">[reply names two new areas; both score the same against the step]</span> — _context:_ <span dir="rtl">tie; گامِ داروخانه waits</span>  
   → exactly ONE outcome in the pass: the page asks her (naming the candidates); it does not also print «🛎 ابزارِ لازم آمد» for one of them; the step stays ⏸ until she answers
10. [events] <span dir="rtl">[unclear fit ⇒ the page asks her] ‖ [the same pass over the sheet]</span> — _context:_ <span dir="rtl">ask vs mismatch</span>  
   → while the ask is pending, no mismatch note is written under the sheet and the sheet is not reopened; the note/reopen happens only after her «نه»
11. [chat] <span dir="rtl">[reply] یه چیزِ تازه برای بهتر شدنِ کارِ مسئله‌ها اضافه کردیم. [no registry diff]</span> — _context:_ <span dir="rtl">a generic reply that names nothing; a step waits</span>  
   → no arrival and no resume; the her-facing line says plainly that the routine's reply named no tool for her step (and the sheet stays open / was noted); it does NOT say «ساخته‌اش هنوز در سامانه دیده نمی‌شود — شاید نسخهٔ تازه منتشر نشده», which reads as «a tool is on its way»
12. [chat] <span dir="rtl">[reply names only an area the sheet's own diagnosis had ruled out]</span> — _context:_ <span dir="rtl">a step waits</span>  
   → mismatch + reopen as in round 24, and the line tells her the reply did not answer her step and why (the diagnosis had set that area aside) — not the «هنوز دیده نمی‌شود» lag wording
13. [chat] <span dir="rtl">[D0+1: mismatch on reply A] ‖ [D0+2: mismatch on reply B]</span> — _context:_ <span dir="rtl">two different unfit replies on consecutive days</span>  
   → each ⚠️ line names what came THAT time and gives its reason; the two lines are not word-for-word identical
14. [chat] <span dir="rtl">[the problem is closed ✅] ‖ U: یه تکهٔ تازه هم هست: «۷ — بیمهٔ حملِ دارو رو چطور حساب کنم؟» برای این هیچ ابزاری ندیدم.</span> — _context:_ <span dir="rtl">a sub-problem brought AFTER closure that needs a missing tool; the assistant files sheet #103 with gap.step = 7</span>  
   → the new piece gets its OWN waiting entry («۷ — بیمهٔ حمل» ⏸ منتظرِ برگهٔ #۱۰۳) and a page line saying so; it is shown where it waits (🔭/🧭/Today); if it is unclear which step the sheet belongs to, the page asks her
15. [page] <span dir="rtl">[📜 and 🧭 after: filed ⇒ unclear ask ⇒ her «نه» ⇒ real build ⇒ arrival]</span> — _context:_ <span dir="rtl">one sheet, one step</span>  
   → ONE waiting row for the sheet whose outcome changes over time (منتظر ⇒ … ⇒ رسید), never two rows «⏸ منتظرِ برگهٔ #۱۰۱» with different outcomes; 🧭 draws one detour
16. [time] <span dir="rtl">[D0 filed #101] ‖ [D0+2 unclear build ⇒ ask] ‖ [D0+2 U: نه] ‖ [D0+5 a build whose title uses the step's own words ⇒ arrival]</span> — _context:_ <span dir="rtl">relative test clock</span>  
   → 📜 lists in time order: filed → asked → rejected by her (reopened) → arrival → resumed, each under its own day; because the entry went back to wait after her «نه», the D0+5 build is still checked and arrives
17. [chat] <span dir="rtl">[she said «نه» to the ask; the step is waiting again] ‖ U: ببخشید اشتباه گفتم، همونه. بریم سراغش.</span> — _context:_ <span dir="rtl">taking back a mistaken «نه»</span>  
   → the page accepts the reversal: arrival «تأییدِ تو» ⇒ resume of the same step; the sheet note is updated (not a second sheet)

### Negative (look-alike)

1. [events] <span dir="rtl">[reply] حوزهٔ «سنجشِ آمادگیِ همکاریِ فروشندگان» افزوده شد. [registry diff: + that area]</span> — _context:_ <span dir="rtl">گامِ داروخانه waits; the title shares the step's own specific word «همکاری»</span>  
   → a clear fit on the step's own words ⇒ arrival without asking; resume of that step (the page does not over-ask)
2. [events] <span dir="rtl">[reply] پاسخ به برگهٔ #101 — حوزهٔ `sc_partner_readiness` افزوده شد. [registry diff: + sc_partner_readiness]</span> — _context:_ <span dir="rtl">matched by id from the reply; the title also contains generic words</span>  
   → arrival by id; generic words in the title do not downgrade an id match to an ask
3. [chat] <span dir="rtl">[arrival accepted, step resumed] ‖ A: با این ابزار اول فهرستِ داروخانه‌ها را می‌نویسی؟ ‖ U: نه، اول با یکی‌شون حرف می‌زنم</span> — _context:_ <span dir="rtl">her «نه» answers a coaching question</span>  
   → not sys_fit false; the step stays resumed; no reopen, no note
4. [chat] <span dir="rtl">[arrival declared] ‖ U: نه هنوز وقت نکردم نگاهش کنم</span> — _context:_ <span dir="rtl">«نه» about her time, not about the fit</span>  
   → no return to waiting; the arrival stands; the resume question stays for later
5. [chat] <span dir="rtl">[arrival declared; page asks «همان گام را با آن چطور برمی‌داری؟»] ‖ U: نمی‌دونم چطوری باهاش کار کنم</span> — _context:_ <span dir="rtl">stuck on USING the tool</span>  
   → not a rejection of the fit; the coach helps her use it; state stays arrived/resumed
6. [events] <span dir="rtl">[reply] حوزهٔ «حسابِ مصرفِ آبِ خانگی» افزوده شد.</span> — _context:_ <span dir="rtl">step «۲ — مصرفِ آبِ ماهانه‌مان چقدر است؟» waits</span>  
   → «آب» is a whole two-letter word, not a fragment ⇒ it counts; with «مصرف» the fit is clear ⇒ arrival
7. [events] <span dir="rtl">[the step's own text says «جایگاهِ محصول بینِ رقیبان»; a view name in the sheet also contains «جایگاه»] ‖ [reply] حوزهٔ «جایگاه‌یابی بینِ رقیبان» افزوده شد.</span> — _context:_ <span dir="rtl">a word that is both in a view name and in HER step</span>  
   → the step's own words («جایگاه»، «رقیبان») are not thrown away because a view name shares one ⇒ at least the page asks, and with two specific shared words it may arrive; never a silent mismatch
8. [chat] <span dir="rtl">[the page asked «این ابزارِ تازه همان است…؟»] ‖ U: آره همینه</span> — _context:_ <span dir="rtl">yes after an ask</span>  
   → arrival «تأییدِ تو» ⇒ resume of that step; no reopen
9. [events] <span dir="rtl">[reply names two areas; one shares three of the step's own words, the other one generic word]</span> — _context:_ <span dir="rtl">not a tie</span>  
   → the better one arrives; no ask
10. [events] <span dir="rtl">[the assistant files a system-self sheet «دکمهٔ چاپ کار نمی‌کند» while a step waits for #101]</span> — _context:_ <span dir="rtl">system-self sheet</span>  
   → no second waiting row, no new ⏸; the existing waiting row is unchanged
11. [chat] <span dir="rtl">[the problem is closed ✅] ‖ U: یه تکهٔ دیگه: هزینهٔ بسته‌بندی رو هم جمع بزنم؟</span> — _context:_ <span dir="rtl">a piece after closure that needs NO missing tool</span>  
   → no waiting entry, no sheet; handled as a further step / new problem
12. [page] <span dir="rtl">[two sheets #101 and #102 for two different steps]</span> — _context:_ <span dir="rtl">legitimate two rows</span>  
   → two waiting rows, one per sheet — the no-duplicate rule is per sheet and step
13. [events] <span dir="rtl">[reply names only an area the diagnosis had ruled out]</span> — _context:_ <span dir="rtl">ruled-out area</span>  
   → mismatch (not an ask): ruled-out areas are excluded from candidates as in round 24
14. [chat] <span dir="rtl">[reply] پاسخ به برگهٔ #۱۰۱ — حوزهٔ `sc_partner_readiness` ساخته شد و در نسخهٔ بعدی می‌آید. [no registry diff yet]</span> — _context:_ <span dir="rtl">a reply that names a SPECIFIC build not yet published</span>  
   → here the lag line «⏳ … ساخته‌اش هنوز در سامانه دیده نمی‌شود — شاید نسخهٔ تازه منتشر نشده» is right; the step stays ⏸ and the next registry change is checked

## P4.stale_numbers · stale-number marking after a correction (only numbers actually derived from the changed value; never her goals, measured results, data percentages, deadline times, list indices or distance bounds; derived numbers that really follow must be caught, with a right recomputation; a ✏️ on numbers a guess or verdict never used does not set it aside; chat results and the prior ledger are covered)


### Positive

1. [edit] <span dir="rtl">[chat: «ضلعِ مربع ۱۲ متره، پس مساحت ۱۴۴ و محیط ۴۸»] ‖ ✏️ «۱۲ ⇐ ۱۳»</span> — _context:_ <span dir="rtl">teen 14</span>  
   → both derived numbers are caught: «۱۴۴ ⇒ ۱۶۹» and «۴۸ ⇒ ۵۲» (13² = 169, 4 × 13 = 52); none missed, nothing else listed
2. [chat] <span dir="rtl">[statement: «دیگ ۳۰ لیتر است و ۸٪ آن رب»; result «۲٫۴ لیتر رب»] ‖ U: دیگ ۳۰ لیتر نیست، ۴۰ لیتره</span> — _context:_ <span dir="rtl">adult, cooking for a ceremony</span>  
   → only «۲٫۴ لیتر» is stale (30 × 0.08 = 2.4 ⇒ 40 × 0.08 = 3.2); the DATA percentage «۸٪» is never listed as «حساب‌شده از ۳۰ لیتر» and never offered a new value
3. [chat] <span dir="rtl">[her goal: «می‌خوام ۹۰ میلیون پس‌انداز کنم»; plan «در ۱۸ ماه، یعنی ماهی ۵ میلیون»; a reported balance «الان ۲۳ میلیون توی حسابمه»] ‖ U: ۱۸ ماه وقت ندارم، ۱۵ ماهه</span> — _context:_ <span dir="rtl">adult, money</span>  
   → stale: only the rate «۵ ⇒ ۶ میلیون» (90 ÷ 18 ⇒ 90 ÷ 15); her GOAL «۹۰ میلیون» is not marked or re-proposed; her MEASURED «۲۳ میلیون» is not set aside («بر ۱۸ ماه بنا بود» never appears on it)
4. [chat] <span dir="rtl">[«از ساعت ۷ شروع می‌کنم و تحویل ساعت ۹ است، پس ۲ ساعت وقت دارم»; separately a geometry result «مجموعِ زاویه‌ها ۵۴۰ درجه، چون پنج‌ضلعی سه مثلث می‌شود»] ‖ U: تحویل ساعت ۹ نیست، ۱۱ است</span> — _context:_ <span dir="rtl">teen 17; a deadline-hour correction next to an unrelated maths result</span>  
   → the geometry result stays valid (never «دیگر برقرار نیست — بر «۹» بنا بود»); only the derived «۲ ساعت» is stale (⇒ ۴ ساعت)
5. [chat] <span dir="rtl">[«جایزه ۱۲ میلیون است. ۱. چهار نفریم ۲. مساوی تقسیم می‌کنیم ۳. سهمِ هر نفر ۳ میلیون»] ‖ U: جایزه ۱۲ میلیون نبود، ۱۶ میلیون است</span> — _context:_ <span dir="rtl">elder 71, «شما»; a list index «۳.» beside a derived value «۳ میلیون»</span>  
   → the derived share «۳ میلیون ⇒ ۴ میلیون» is caught (16 ÷ 4); the list indices «۱. ۲. ۳.» and the head-count «چهار» are not marked; in «شما»
6. [chat] <span dir="rtl">[statement: «۱۳ نقطه در مثلثی به ضلعِ ۳؛ ثابت کن دو تا از آن‌ها فاصله‌شان حداکثر ۱ است»; her count «۷۸ جفت نقطه»] ‖ U: ۱۳ نقطه نیست، ۱۴ نقطه است</span> — _context:_ <span dir="rtl">teen 17, olympiad (pigeonhole)</span>  
   → the pair count is stale «۷۸ ⇒ ۹۱» (C(13,2) ⇒ C(14,2)); the distance bound «۱» and the side length «۳» in the statement are not marked
7. [edit] <span dir="rtl">[mix: «رنگ ۲ قوطی، تینر ۳۰۰ سی‌سی»; a separate guess «دیوارِ ۶ متری دو برابرِ دیوارِ ۳ متری رنگ می‌خواهد» already judged; a sufficiency verdict on the roller] ‖ ✏️ «۲ ⇐ ۳» and «۳۰۰ ⇐ ۴۵۰»</span> — _context:_ <span dir="rtl">adult, painting; neither the guess nor the verdict used the cans or the thinner</span>  
   → the guess's outcome and the sufficiency verdict are NOT set aside; the wall lengths (6, 3) are not listed as stale; no nonsense proposal such as «⇐ ۰»
8. [chat] <span dir="rtl">[chat results over three turns: «۶۰ × ۱۲۰ = ۷۲۰۰ وات»، «۷۲۰۰ تقسیم بر ۲۰۰۰ میشه ۳٫۶»، «پس ۴ تا بخاری»] ‖ U: سالن ۶۰ متر نیست، ۸۰ متره</span> — _context:_ <span dir="rtl">adult; a chain of CHAT results (no form)</span>  
   → the whole chain is covered: 7200 ⇒ 9600, 3.6 ⇒ 4.8, 4 ⇒ 5 heaters (each marked stale or asked once, with right values); not only the statement changes
9. [page] <span dir="rtl">[prior ledger: گام ۱ ✓ «۴۰۰ مترمربع × ۶ لیتر = ۲۴۰۰ لیتر»] ‖ U: ۴۰۰ متر نیست، ۴۵۰ متره</span> — _context:_ <span dir="rtl">with P1; a ✓ ledger step built on the corrected datum</span>  
   → the ledger step is marked «کهنه پس از اصلاح — دوباره بسنج» (2400 ⇒ 2700), and its dependants with it; it does not stay a plain ✓ on the old value
10. [chat] <span dir="rtl">[«دیوار ۲٫۴ متر در ۳ متر، یعنی ۷٫۲ مترمربع»; elsewhere «فاصلهٔ پریز از کف ۳۰ سانت»] ‖ U: ۲٫۴ نبود، ۲٫۶ متره</span> — _context:_ <span dir="rtl">metres and centimetres in the same chat</span>  
   → stale: «۷٫۲ ⇒ ۷٫۸ مترمربع» only (2.6 × 3); the «۳۰ سانت» (or «۰٫۳») socket height is not listed as derived from 2.4; no proposal mixing metres with centimetres
11. [chat] <span dir="rtl">[«حیاط ۸ در ۵ متر: محیط ۲۶ و مساحت ۴۰»] ‖ U: عرضش ۵ نیست، ۶ متره</span> — _context:_ <span dir="rtl">elder 64, fencing; Persian digits</span>  
   → «۲۶ ⇒ ۲۸» and «۴۰ ⇒ ۴۸» both caught (2 × (8 + 6) = 28; 8 × 6 = 48)
12. [page] <span dir="rtl">[any «عددهای کهنه پس از اصلاح» card]</span> — _context:_ <span dir="rtl">the card's own proposals</span>  
   → every proposed new value is itself a right recomputation of an identified relation; where the relation cannot be identified the card asks «این عدد از آن حساب شده بود؟» instead of inventing a value
13. [chat] <span dir="rtl">[«مهلت روزِ ۱۵ام است؛ کارم ۱۸ام تمام می‌شود، یعنی ۳ روز بعد از مهلت»] ‖ U: تمام شدنش ۱۸ام نیست، ۲۲ام است</span> — _context:_ <span dir="rtl">adult; a number really derived from the corrected date</span>  
   → «۳ روز بعد از مهلت ⇒ ۷ روز» is caught (22 − 15); the deadline day «۱۵» itself is not touched

### Negative (look-alike)

1. [chat] <span dir="rtl">[«دیگ ۳۰ لیتر است» … elsewhere «۵ ردیفِ ۶ تایی یعنی ۳۰ تا کاسه»] ‖ U: دیگ ۴۰ لیتره نه ۳۰</span> — _context:_ <span dir="rtl">an equal number in another role</span>  
   → «۳۰ تا کاسه» (5 × 6) is not stale and not rewritten to 40
2. [chat] <span dir="rtl">[«تا n=۲۰ درست بود؛ ۲۰ تاشو با دست چک کردم»] ‖ U: تا ۱۵ بود نه ۲۰</span> — _context:_ <span dir="rtl">a count of checks vs a bound</span>  
   → no invented derived list such as «۲۱، ۲۲»; at most the page asks whether «۲۰ تا چک» also changes; a proved result («✅ اثبات شد») is not set aside by this
3. [edit] <span dir="rtl">✏️ fixes a spelling in her message («کیلوگرم» for «کیلو گرم»), no number changes</span> — _context:_ <span dir="rtl">a non-numeric edit</span>  
   → no stale card at all
4. [edit] <span dir="rtl">[guess «با ۱۵۰ گرم کره خمیر شل می‌شود» judged] ‖ ✏️ «۱۵۰ ⇐ ۱۲۰» on the butter</span> — _context:_ <span dir="rtl">the look-alike of the basis rule: the guess DID use the corrected number</span>  
   → here the guess's outcome IS set aside / re-asked — the «never set aside» rule is only for guesses and verdicts that did not use the number
5. [chat] <span dir="rtl">[«با متر اندازه گرفتم، ۳٫۴ متر بود»] ‖ U: طولِ نقشه ۳٫۲ نیست، ۳٫۵ است</span> — _context:_ <span dir="rtl">a measured value near a corrected planned value</span>  
   → the measured «۳٫۴» is not marked stale
6. [chat] <span dir="rtl">[her correction is of the goal itself] U: هدفم ۶ کیلو نیست، ۸ کیلوئه</span> — _context:_ <span dir="rtl">the goal is the corrected datum</span>  
   → the goal changes (it is her own correction) and the rate derived from it is stale — the «never mark goals» rule is about goals she did NOT correct
7. [chat] <span dir="rtl">[«سالِ ۱۴۰۳ شروع کردم»، «گامِ ۳»، «صفحهٔ ۳ِ جزوه»] ‖ U: ۳ نفر نیستیم، ۴ نفریم</span> — _context:_ <span dir="rtl">years, step numbers and page numbers containing the same digit</span>  
   → none is stale; only numbers computed from the head-count are
8. [chat] <span dir="rtl">[problem A (closed) had «۱۲ متر»] ‖ [in problem B] U: ۱۲ نبود، ۱۳ بود</span> — _context:_ <span dir="rtl">two problems</span>  
   → nothing in problem A is marked stale by a correction made in problem B
9. [chat] <span dir="rtl">[sequence data in the statement: «۷، ۱۹»; her computed terms «۸، ۱۸»] ‖ U: جملهٔ دوم ۱۹ نیست، ۲۱ است</span> — _context:_ <span dir="rtl">teen 16; given data beside computed terms</span>  
   → the given «۷» is not listed as derived; only her terms that really used 19 are marked or asked
10. [chat] <span dir="rtl">[«۲۰۰ تومان تخفیف گرفتم» reported as what happened; «قیمت ۱۵۰۰»] ‖ U: قیمت ۱۸۰۰ بود نه ۱۵۰۰</span> — _context:_ <span dir="rtl">a reported fact, not a computation</span>  
   → «۲۰۰ تومان تخفیف» is not recomputed or marked (she reported it; the page may ask if it changes, never invent)
11. [edit] <span dir="rtl">✏️ «۱۲ ⇐ ۱۲٫۰»</span> — _context:_ <span dir="rtl">the same value retyped</span>  
   → no stale card (the value did not change)

## P5.one_stage_one_problem · one stage, one problem (one stage source for «# وضعِ کنونی», the prompt's live block, 🧭, 🔭 and the strip; a sub-result never moves the problem to look-back; a new problem raised mid-chat gets its own record, stage, route and dossier and is never data of the first; a woken problem never asks u0; the stage never jumps to «اجرا» before a plan)


### Positive

1. [prompt] <span dir="rtl">[chat holds unknown, data, a plan and one executed step] ‖ [live_new] ‖ [the next turn's prompt]</span> — _context:_ <span dir="rtl">any learner</span>  
   → «# وضعِ کنونی … مرحله» and «# مسئلهٔ زندهٔ این سشن … مرحله» name the SAME stage, and it is the one 🧭 «اکنون», 🔭 and the strip show; never «فهمِ مسئله» in one block and «اجرا» in the other
2. [time] <span dir="rtl">[D0: solved and closed in chat] ‖ [D0+180: she returns to report how it went]</span> — _context:_ <span dir="rtl">adult, life decision; a return after six months</span>  
   → prompt, strip, form banner and 🧭 agree on «بازنگری / اجرا روی واقعیت» (one source); the strip does not lag at «اجرای طرح» while the prompt says «بازنگری»; the form does not say «گفت‌وگو تا «اجرا» جلو رفته» after a full solution
3. [chat] <span dir="rtl">U: خب حجمِ استخر شد ۲٫۵ × ۴ × ۱٫۲ = ۱۲ مترمکعب. حالا باید ببینم پمپ چند ساعته پرش می‌کنه.</span> — _context:_ <span dir="rtl">adult; unknown = filling time; the volume is an intermediate result</span>  
   → recorded as a sub-result (12 m³ ✓); the problem stays «اجرای طرح»; 🧭 never «اکنون: بازنگری»; the turn question is about the next step
4. [chat] <span dir="rtl">[prior-work problem with 5 steps; she redoes گام ۳] ‖ U: گامِ ۳ درست شد: ۲۷۰۰ لیتر</span> — _context:_ <span dir="rtl">a step result inside a prior-work problem</span>  
   → the stage stays «اجرا» with resume at گام ۴; never «مرحله: بازنگری» from one step's result
5. [chat] <span dir="rtl">[problem 1 in focus: cutting the electricity bill] ‖ U: یه مسئلهٔ دیگه هم دارم که ربطی به این نداره: می‌خوام بدونم برای جهیزیهٔ دخترم وام بگیرم یا طلا بفروشم.</span> — _context:_ <span dir="rtl">adult; a NEW problem raised mid-chat</span>  
   → a second problem record with its own stage (فهمِ مسئله), its own 🧭 route and its own 📜 dossier; nothing of it appears as «داده (از گفت‌وگو)» on problem 1's route; «# وضعِ کنونی» names the problem now in focus; the map shows two problems
6. [chat] <span dir="rtl">[problem 1 is at «اجرا روی واقعیت» with a judged prediction] ‖ U: حالا یه چیزِ تازه: مغازهٔ پدری رو اجاره بدم یا خودم بچرخونمش؟</span> — _context:_ <span dir="rtl">adult; the new problem must not inherit the old stage</span>  
   → the new problem starts at understanding; no card «آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت؟» and no «مرحله: اجرا روی واقعیت» before she has done anything on it
7. [chat] <span dir="rtl">U: اولی حل شد، جواب ۱۲ مترمکعبه. یه مسئلهٔ دیگه: دخترم می‌پرسه چرا ماه شکلش عوض میشه، چطور براش توضیح بدم؟</span> — _context:_ <span dir="rtl">elder 69, «شما» elsewhere; one message carries the result of the old problem AND a new problem</span>  
   → the result goes to the old problem (may move it to look-back); the new problem gets its own record; neither is data of the other
8. [chat] <span dir="rtl">[two problems exist] ‖ U: برگردیم به مسئلهٔ اول، پمپ ساعتی ۳ مترمکعب می‌کشه</span> — _context:_ <span dir="rtl">switching back</span>  
   → focus returns to problem 1; the datum goes to problem 1 only; each problem keeps its own stage; (12 ÷ 3 = 4 hours if she computes it)
9. [chat] <span dir="rtl">[look-back of a solved problem] U: یه حدس: این فرمول برای هر چندضلعی هم جواب میده. با پنج‌ضلعی و شش‌ضلعی امتحانش می‌کنم. ‖ [the conjecture wakes as the live problem]</span> — _context:_ <span dir="rtl">elder 64, «شما»; a woken problem whose statement and test plan she herself gave</span>  
   → the woken problem never opens with u0 «کلِ مسئله را در یک جمله … می‌گویید؟»; its question follows what she said (the test she named), in «شما»
10. [chat] <span dir="rtl">[day 7 use-report on an applied solution wakes the problem] U: یه هفته اجراش کردم، سه روزش شد</span> — _context:_ <span dir="rtl">adult; application report</span>  
   → no «مجهول چیست؟» / u0 on the woken problem; the question is about the report (what happened vs what was expected)
11. [chat] <span dir="rtl">U: حدسِ اولم ۸ بسته بود ولی شمردم دیدم ۱۱ بسته لازمه. هنوز نمی‌دونم از کجا شروع کنم.</span> — _context:_ <span dir="rtl">child 12; a first guess tested, no plan yet</span>  
   → stage = «فهم» or «طرح», never «اجرای طرح» before any plan
12. [chat] <span dir="rtl">U: نمی‌تونم ثابتش کنم. فقط یه فکر دارم: شاید بشه عددها رو به زوج و فرد جدا کرد.</span> — _context:_ <span dir="rtl">teen 16; an idea, not a plan carried out</span>  
   → stage «طرح» (an idea to shape), not «اجرا»; the strip does not say «مانده: فقط بازنگریِ خودت — حل به نتیجه رسید» before a solution exists
13. [chat] <span dir="rtl">[she corrects a datum] U: ببخشید طول ۴ متر نبود، ۵ متر بود</span> — _context:_ <span dir="rtl">a correction turn in the middle of «اجرا»</span>  
   → the turn question is the re-check with the new value; never a fallback to «مجهول (یا حکم) چیست؟»; the stage does not drop back to «فهم» or «طرح»

### Negative (look-alike)

1. [chat] <span dir="rtl">U: پس پمپ ۴ ساعته استخر رو پر می‌کنه. همینه.</span> — _context:_ <span dir="rtl">the result answers the WHOLE unknown (12 ÷ 3 = 4)</span>  
   → the stage may move to «بازنگری»; 🔭/🧭/prompt agree
2. [chat] <span dir="rtl">U: یه سؤالِ دیگه دربارهٔ همین استخر: اگه دو تا پمپ بذارم چی؟</span> — _context:_ <span dir="rtl">a follow-up on the SAME problem</span>  
   → no new problem record; a variation/look-back question of problem 1
3. [chat] <span dir="rtl">U: این منو یادِ مسئلهٔ قطارها می‌ندازه که پارسال حل کردیم</span> — _context:_ <span dir="rtl">a mention of a related problem</span>  
   → no new problem record (it is the «مسئلهٔ خویشاوند» heuristic)
4. [chat] <span dir="rtl">U: یه مشکلِ دیگه هم هست: پمپ برق‌کشیِ سه‌فاز می‌خواد و ما نداریم</span> — _context:_ <span dir="rtl">an obstacle of the same problem said as «یه مشکلِ دیگه»</span>  
   → a condition/stuck of problem 1, not a second problem
5. [chat] <span dir="rtl">U: اگه یه مسئلهٔ دیگه هم بیارم، نقشه‌ش جدا میشه یا قاطی میشن؟</span> — _context:_ <span dir="rtl">a hypothetical question about the system</span>  
   → answered as a question; no record created
6. [chat] <span dir="rtl">U: طرحم: ۱) حجم ۲) دبیِ پمپ ۳) تقسیم. گامِ ۱ رو رفتم: ۱۲ مترمکعب</span> — _context:_ <span dir="rtl">a plan and then a step</span>  
   → «اجرای طرح» is right here — the «no اجرا before a plan» rule does not block it
7. [chat] <span dir="rtl">U: راستی هوا امروز چقدر خوبه</span> — _context:_ <span dir="rtl">chit-chat</span>  
   → no new problem, no stage change
8. [chat] <span dir="rtl">U: یه مسئله دارم ولی نمی‌دونم چطور بگمش</span> — _context:_ <span dir="rtl">a brand-new, unstated problem</span>  
   → asking for the whole in one sentence is legitimate here — the «never u0» rule is for woken problems
9. [chat] <span dir="rtl">U: اول حجم رو حساب کنم بعد ببینم پمپ چقدر می‌کشه؟</span> — _context:_ <span dir="rtl">a plan offered as a question</span>  
   → stage «طرح» (she is planning), not «اجرا»
10. [chat] <span dir="rtl">[two problems exist; focus on problem 2] ‖ U: توی اون مسئلهٔ استخر، عمق ۱٫۲ نیست ۱٫۵ ـه</span> — _context:_ <span dir="rtl">she names problem 1 while problem 2 is in focus</span>  
   → the correction goes to problem 1 (named by her), not to the problem in focus; problem 2 untouched
11. [page] <span dir="rtl">[two problems: the pool at «اجرای طرح», the dowry decision at «فهمِ مسئله»] ‖ [the problems list / the map]</span> — _context:_ <span dir="rtl">two different stages for two different problems</span>  
   → legitimate — the one-source rule is per problem; each problem's own surfaces agree with each other

## P6.opening_classify_postcheck_register · opening, classification, post-check, register (the follow-up after a navigation never forbids the tab she needs; long self-introductions and ages in words stripped from statements; teens get «تو» unless they use «شما»; one register per sentence; post-check false positives — hypothetical «می‌گویی «…»», plural «دارید», a TeX quote of her formula; explicit «پیگیری کنم مثلِ یه مسئلهٔ واقعی» ⇒ chat_invent; the page's own turn questions are single and not repeated; «n!» wrapped in bdi). For post-check entries: pos = must PASS without a rewrite, neg = must still be CAUGHT.


### Positive

1. [chat] <span dir="rtl">U: این مسئله رو ثبتش کنیم ‖ [the assistant navigates to the problems list] ‖ [the page's automatic follow-up to the model]</span> — _context:_ <span dir="rtl">adult; the list view has no fields but has the «🔭» tab button she needs</span>  
   → the follow-up does not forbid the next needed action: no blanket «این نما فیلدی ندارد — چیزی پر نکن و دکمه‌ای نزن»; the model may open the «🔭» tab, and «ثبتش کنیم» is completed
2. [prompt] <span dir="rtl">[navigation to «🗺 قلمروِ سامانه‌ها», a view without fields] ‖ [follow-up]</span> — _context:_ <span dir="rtl">any</span>  
   → the follow-up does not say «فیلدها را پر کن» for a view that has none
3. [chat] <span dir="rtl">U: سلام. مهتابم، ۴۱ سالمه، حسابدارِ یه شرکتِ پخشم و دو تا بچه دارم، تازه هم اسباب‌کشی کردیم. مسئله‌م اینه که نمی‌دونم ماشین رو الان عوض کنم یا تا عید صبر کنم.</span> — _context:_ <span dir="rtl">adult; a long self-introduction before the problem</span>  
   → the chat-problem statement, its title, the session pin and the «↩ برگرد به …» breadcrumb start at the problem («نمی‌دونم ماشین رو الان عوض کنم یا …»), without the greeting, name, age, job and family; the age is still read for the band
4. [chat] <span dir="rtl">U: من هفتاد و سه سالمه، تولدم ۹ مهره. می‌خواستم بدانم برای ۴۰ مترمربع حیاط چند کیسه سیمان لازم است.</span> — _context:_ <span dir="rtl">elder 73, «شما»; age in words + birthday before the problem</span>  
   → the age in words is read (elder) and stripped from the statement/title; the title starts at the problem; one Jalali confirmation, «تاریخِ تولدتان»
5. [page] <span dir="rtl">[birth-date confirmation line, the wake line and any system line addressed to her]</span> — _context:_ <span dir="rtl">teen 15 who writes «میخوام / بگو» (no «شما» form anywhere)</span>  
   → «تو» forms: «تاریخِ تولدت ثبت شد», «سلیقه‌ات»; never «شما» for a teen who does not use it
6. [page] <span dir="rtl">U: ببخشید، ممکن است بفرمایید این فرم را چگونه پر کنم؟ ‖ [system lines after it]</span> — _context:_ <span dir="rtl">teen 16 who herself uses «شما» verbs</span>  
   → «شما» forms for her («تاریخِ تولدتان»); the register follows her verbs
7. [page] <span dir="rtl">[the page's own line after she re-tested a corrected result]</span> — _context:_ <span dir="rtl">elder 66, «شما»</span>  
   → one register in the sentence: «آن نتیجه را خودتان آزمودید … عددِ تازه نتیجهٔ تازهٔ شماست»; never half «خودتان آزمودید» and half «نتیجهٔ تازهٔ توست»; the birth line reads «✓ تاریخِ تولدتان ثبت شد»
8. [page] <span dir="rtl">[system wake line: «حدسی که در بازنگری ساخت… و می‌آزمای…»]</span> — _context:_ <span dir="rtl">elder 61 whose chat is in «شما»</span>  
   → «ساختید / می‌آزمایید» — system lines follow the chat's register
9. [prompt] <span dir="rtl">A: اگر فردا مشتری نیاید و بگویی «پس مغازه را می‌بندم»، آن وقت چه چیزی را نسنجیده‌ای؟</span> — _context:_ <span dir="rtl">post-check; she never said those words — the sentence is hypothetical</span>  
   → PASS — a hypothetical «اگر … بگویی «…»» is not a quotation of her; no «نقلِ نادرست» rewrite
10. [prompt] <span dir="rtl">A: تو و خواهرت با هم این مغازه را دارید؛ اول سهمِ کدام‌تان را حساب کنیم؟</span> — _context:_ <span dir="rtl">post-check; she is addressed with «تو»; «دارید» is a real plural (two people)</span>  
   → PASS — the plural verb is not flagged as a «شما» register slip
11. [prompt] <span dir="rtl">U: به نظرم (a+b)/2 >= sqrt(ab) همیشه درسته ‖ A: نوشتی «$\frac{a+b}{2} \ge \sqrt{ab}$» — برای کدام a و b؟</span> — _context:_ <span dir="rtl">post-check; teen 17, olympiad inequality; the reply quotes her ASCII formula in TeX</span>  
   → PASS — a TeX rendering of her own formula is a valid quote (same tokens after normalisation)
12. [prompt] <span dir="rtl">A: خوب. بازبینی؟</span> — _context:_ <span dir="rtl">post-check; elder, «شما»; the reply has no second-person form</span>  
   → PASS — no register rewrite (a noun + «ی» + «؟» is not a «تو» verb)
13. [chat] <span dir="rtl">U: این فکر ولم نمی‌کنه؛ می‌خوام مثلِ یه مسئلهٔ درست‌وحسابی دنبالش برم و پیگیرش باشم، نه این‌که لای یادداشت‌ها گم بشه.</span> — _context:_ <span dir="rtl">adult; an explicit request to track it as a real problem, without the word «ثبت»</span>  
   → chat_invent is accepted the first time (a problem record is created); the gate does not answer «کاربر نخواسته بود مسئله‌ای ثبت شود»; she does not have to say «ثبتش کن» a second time
14. [chat] <span dir="rtl">U: میشه اینو پیگیری کنم مثلِ یه مسئلهٔ واقعی؟ فعلاً فقط یه حدسه دربارهٔ عددهای اول</span> — _context:_ <span dir="rtl">teen 16; the same request phrased as a question</span>  
   → chat_invent accepted on this message; one confirmation line; no second «ثبتش کن» needed
15. [prompt] <span dir="rtl">[the page's own «پرسشِ این نوبت» for a step-outcome turn and for a look-back turn]</span> — _context:_ <span dir="rtl">the page-built turn questions that used to carry two questions</span>  
   → each page-built turn question contains exactly ONE question (one «؟»); the page never hands the model a two-question turn while the post-check forbids two questions
16. [time] <span dir="rtl">[turn n: page asks «این گام جواب نداد؟»] ‖ U: چرا، جواب داد، ۳ کیلو کم شد ‖ [turns n+1 … n+6: she keeps reporting success]</span> — _context:_ <span dir="rtl">adult, multi-week habit problem</span>  
   → «این گام جواب نداد؟» is not asked again after her answer; the following turn questions move with her reports; the same live page question is not repeated turn after turn
17. [page] <span dir="rtl">U: توانِ ۲ توی n! رو می‌خوام حساب کنم ‖ U: 5! = 120 ‖ U: (2n)!/n! ‖ U: جمعِ [n/2] + [n/4] + [n/8]</span> — _context:_ <span dir="rtl">teen 17; factorials and brackets inside Persian chat lines</span>  
   → «n!» displays as «n!» (wrapped in bdi), never «!n»; likewise «5!» and «(2n)!/n!»; the bracket sum is isolated LTR the same way as other formulas (one treatment, not text in one place and formula in another); a statement cut never ends in the middle of «n!»

### Negative (look-alike)

1. [prompt] <span dir="rtl">A: خودت گفتی «قیمت مهم نیست»، پس چرا ارزان‌ترین را برداشتی؟</span> — _context:_ <span dir="rtl">post-check; she never said «قیمت مهم نیست»</span>  
   → CAUGHT — an asserted quote («گفتی «…»») with words not in her text is a misquote and is rewritten
2. [prompt] <span dir="rtl">U: (a+b)/2 >= sqrt(ab) ‖ A: نوشتی «$\frac{a+b}{2} > \sqrt{ab}$»</span> — _context:_ <span dir="rtl">post-check; the TeX quote changes «>=» to «>»</span>  
   → CAUGHT — a TeX quote that changes the formula is not a valid quote
3. [prompt] <span dir="rtl">A: شما دارید خوب پیش می‌روید؛ حالا گامِ بعدی‌ات چیست؟</span> — _context:_ <span dir="rtl">post-check; a single addressee who uses «تو»</span>  
   → CAUGHT — «شما دارید» to one «تو» person and two registers in one sentence
4. [prompt] <span dir="rtl">A: مجهول چیست؟ و داده‌ها کدام‌اند؟</span> — _context:_ <span dir="rtl">post-check; a MODEL reply with two questions</span>  
   → CAUGHT — the two-question rule still binds the model's replies
5. [prompt] <span dir="rtl">A: تولدت مبارک! حالا بفرمایید مسئله چیست.</span> — _context:_ <span dir="rtl">post-check; elder 78 who uses «شما»</span>  
   → CAUGHT — «تو» form («تولدت») to an elder in «شما», and mixed register
6. [chat] <span dir="rtl">U: ۴۱ سالمه و می‌خوام بدونم با این سن میشه رشته عوض کرد و برنامه‌نویس شد یا نه</span> — _context:_ <span dir="rtl">the age is a datum OF the problem</span>  
   → the age stays in the statement (not stripped as an introduction)
7. [chat] <span dir="rtl">U: اینو فقط یه جا یادداشت کن که یادم نره ‖ U: جالبه، شاید یه روز دنبالش برم</span> — _context:_ <span dir="rtl">a note request; a passing musing</span>  
   → no chat_invent in either: a note stays a note; a musing creates nothing
8. [page] <span dir="rtl">U: معلممون همیشه میگه «شما باید خودتان فکر کنید» ولی من نمی‌فهمم از کجا شروع کنم</span> — _context:_ <span dir="rtl">teen 14; «شما» only inside a quotation of her teacher</span>  
   → register stays «تو» — only her own second-person forms toward the assistant count
9. [prompt] <span dir="rtl">[navigation to a view WITH fields (the understanding form)] ‖ [follow-up]</span> — _context:_ <span dir="rtl">a view that has fields</span>  
   → the follow-up may ask to fill fields; the tab-allowing rule does not remove it
10. [page] <span dir="rtl">U: چه خوب! ‖ U: نه! ‖ U: آفرین!</span> — _context:_ <span dir="rtl">exclamation marks in ordinary Persian text</span>  
   → no bdi isolation that moves the mark; the text reads «چه خوب!»
11. [time] <span dir="rtl">[turn n] U: این گام هم جواب نداد، دوباره خوابم برد</span> — _context:_ <span dir="rtl">she reports a failure</span>  
   → asking once what went wrong with the step is legitimate — the ban is on repeating it after she answered or while she reports success
12. [prompt] <span dir="rtl">A: گفتی «میخوام زودتر بیدار شم» — چه چیزی جلویش را می‌گیرد؟</span> — _context:_ <span dir="rtl">post-check; her exact words quoted (her «تو»-style words inside a reply)</span>  
   → PASS — a verbatim quote of her is valid whatever its own register; it is not «two registers»

## P7.today_dossier_predictions · today, dossier, mind card, predictions (one prediction ⇒ one 🎯, also when judged through practice_log; a judged prediction leaves Today; «تا جمعه» = the coming Friday; guesses refuted in chat get their outcome on the route; a child's school name is not kept in 📜; no «معمای امروز را جواب داده‌ای» for a child with no puzzle; no route duplicates; the deadline-correction «why» quotes her; «امروز» shows her own stated dates, not an invented plan date)


### Positive

1. [events] <span dir="rtl">U: پیش‌بینی می‌کنم تا جمعه جوابِ وام میاد، ۶۰ درصد مطمئنم ‖ [due day] ‖ [she judges it through the practice log: «شد»]</span> — _context:_ <span dir="rtl">adult, money</span>  
   → still ONE 🎯 for this prediction: no second 🎯 «داوریِ پیش‌بینیِ … (۶۰٪): شد»; the original leaves Today's «به موعد رسیده — شد یا نشد؟»; the calibration counts it once
2. [chat] <span dir="rtl">[a 70% prediction is due] ‖ U: اون پیش‌بینیِ هفتاد درصدیم غلط از آب دراومد، نشد</span> — _context:_ <span dir="rtl">judged in chat by her words</span>  
   → the prediction is judged «نشد» and leaves the «🎯 n پیش‌بینی به موعد رسیده» count in Today; it stays in history/📜
3. [events] <span dir="rtl">[a prediction judged in chat on D0+5] ‖ [D0+6: she also presses «شد/نشد» for it in the practice log]</span> — _context:_ <span dir="rtl">judged twice by two paths</span>  
   → counted once; the second judgment updates or is refused with a line («پیش‌تر داوری شده»), never a second 🎯 or a double count in calibration
4. [time] <span dir="rtl">U: تا جمعه معلوم میشه قبولم کردن یا نه، ۵۵ درصد احتمال میدم</span> — _context:_ <span dir="rtl">said on D0 where D0 is not a Friday</span>  
   → the 🎯 due date = the first Friday after D0 (shown as a Jalali date), never D0 itself; Today asks «شد یا نشد؟» only from that Friday on
5. [time] <span dir="rtl">U: تا پنجشنبه تمومش می‌کنم</span> — _context:_ <span dir="rtl">elder 70; another weekday; D0 is not a Thursday</span>  
   → due = the first Thursday after D0, shown in Jalali; not D0, not D0+7 by default
6. [route] <span dir="rtl">U: حدسم اینه که مشکل از کم‌خوابیه ‖ … ‖ U: یه هفته زودتر خوابیدم و هیچ فرقی نکرد، پس کم‌خوابی نبود</span> — _context:_ <span dir="rtl">adult; a guess she herself refuted in chat</span>  
   → 🧭 and 📜 show the guess with outcome «رد شد (به آزمونِ خودش)», never «هنوز آزموده نشده»; one guess point, not two
7. [route] <span dir="rtl">U: فکر کنم با ۵ تا کاشی پر میشه ‖ U: چیدم، با ۵ تا شد</span> — _context:_ <span dir="rtl">child 11; a guess confirmed by her own test</span>  
   → route outcome «تأیید شد»; not «آزموده نشده»
8. [page] <span dir="rtl">U: من کلاس چهارمم، مدرسمون اسمش پروینه. یه مسئله دارم…</span> — _context:_ <span dir="rtl">child 10; colloquial, no ZWNJ, the school name in the middle of the sentence</span>  
   → 📜 (and its export) does not keep the school's name — masked or dropped everywhere her message is shown; the problem text is kept
9. [page] <span dir="rtl">U: توی دبستانِ نرگس، کلاسِ دوم ج هستم</span> — _context:_ <span dir="rtl">child 9; school and class name</span>  
   → neither the school name nor the class label of a minor is kept in 📜; her message is not repeated three times in the dossier
10. [events] <span dir="rtl">[mind card of a child for whom no puzzle is offered]</span> — _context:_ <span dir="rtl">child 9; no puzzle proposed, none answered</span>  
   → no line «معمای امروز را جواب داده‌ای؛ معمای بعدی فردا»; the card shows the no-norm line («برای این سن هنجارِ معتبر در دست نیست — معمایی پیشنهاد نمی‌شود»)
11. [route] <span dir="rtl">[🧭 after: one result stated once, one look-back, one waiting sheet]</span> — _context:_ <span dir="rtl">any problem</span>  
   → each event is one point: no «نتیجه» ×3, no «بازنگری» ×2, no doubled «منتظرِ برگه» or «آزموده نشده» points
12. [chat] <span dir="rtl">[deadline recorded: «دوشنبه»] ‖ U: مهلتش دوشنبه نیست، بهم گفتن تا آخرِ ماه وقت دارم</span> — _context:_ <span dir="rtl">adult; a deadline correction in words</span>  
   → the change's «why» quotes HER («به گفتهٔ خودش: «… تا آخرِ ماه وقت دارم»»), not the old value («اصلاح شد ⇐ «دوشنبه …»») presented as the reason
13. [time] <span dir="rtl">U: سه‌شنبه به دکتر زنگ می‌زنم و ۱۴ اسفند هم نوبتِ آزمایش دارم</span> — _context:_ <span dir="rtl">adult, health logistics; her own stated dates</span>  
   → «امروز» carries HER dates: the call on the first Tuesday after D0 and the test on ۱۴ اسفند (Jalali, the next occurrence); no invented «📌 برنامهٔ خودت … موعد: D0+7»; the model has a way to register a chat check date
14. [time] <span dir="rtl">U: یه هفته دیگه دوباره وزن می‌کنم</span> — _context:_ <span dir="rtl">an explicit relative date</span>  
   → «امروز» shows D0+7 because SHE said «یه هفته دیگه» — her stated date, in Jalali

### Negative (look-alike)

1. [events] <span dir="rtl">U: دو تا پیش‌بینی دارم: تا جمعه جوابِ وام میاد (۶۰٪)، و تا آخرِ ماه خونه رو می‌فروشیم (۳۰٪)</span> — _context:_ <span dir="rtl">two different predictions</span>  
   → two 🎯 — the one-🎯 rule is per prediction
2. [events] <span dir="rtl">[a prediction is due; she has not judged it]</span> — _context:_ <span dir="rtl">unjudged</span>  
   → it stays in Today's «به موعد رسیده — شد یا نشد؟» until she judges it
3. [time] <span dir="rtl">U: جمعهٔ هفتهٔ بعد جواب میدم</span> — _context:_ <span dir="rtl">said on D0; «هفتهٔ بعد»</span>  
   → due = the Friday of the week (Saturday–Friday) after the week containing D0 — not the nearest Friday
4. [time] <span dir="rtl">U: جمعه‌ها معمولاً کوه میرم</span> — _context:_ <span dir="rtl">a habit, not a deadline</span>  
   → no 🎯 and no dated Today item
5. [route] <span dir="rtl">U: حدسم اینه که مشکل از قهوه‌ست. هنوز امتحانش نکردم.</span> — _context:_ <span dir="rtl">an untested guess</span>  
   → «آزموده نشده» is right here
6. [page] <span dir="rtl">U: من دبیرِ دبیرستانِ فرهنگ هستم و یک مسئله برای کلاسم می‌خواهم</span> — _context:_ <span dir="rtl">adult teacher naming her workplace</span>  
   → kept as typed — the school-name rule is for minors' own schools
7. [page] <span dir="rtl">U: من بچهٔ کرمانم و کلاس پنجمم</span> — _context:_ <span dir="rtl">child 11; a city and a grade (no school name, no class label)</span>  
   → the grade is used for the age band; nothing to mask; the city is not treated as a school name
8. [events] <span dir="rtl">[mind card of an adult who answered today's puzzle]</span> — _context:_ <span dir="rtl">adult</span>  
   → «معمای امروز را جواب داده‌ای؛ معمای بعدی فردا» is right here
9. [route] <span dir="rtl">U: مساحت شد ۴۰ ‖ … ‖ U: محیط شد ۲۶</span> — _context:_ <span dir="rtl">two genuinely different results</span>  
   → two result points — not collapsed as duplicates
10. [edit] <span dir="rtl">✏️ changes «سه‌شنبه» to «پنجشنبه» in her own bubble, no words</span> — _context:_ <span dir="rtl">a deadline corrected by ✏️</span>  
   → «why» = «با ✏️ ِ خودش روی همان پیام»; no empty quote and no old value as the reason
11. [time] <span dir="rtl">[she named no date for her plan] U: یه روزی شروعش می‌کنم</span> — _context:_ <span dir="rtl">no date stated</span>  
   → no dated Today item is invented; the page may ask her for a date once
12. [page] <span dir="rtl">[a judged prediction]</span> — _context:_ <span dir="rtl">after leaving Today</span>  
   → it remains in 📜 and in the calibration history — leaving Today is not deletion

