# VARIANTS_R19b — independent variant bank (round 19b infrastructure: INF15–INF17)

Written from DECISIONS_R19b only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-17 (Saturday; ۱۴۰۵/۰۷/۲۵) for all date expectations; Persian week: Sat 17, Sun 18, Mon 19, Tue 20, Wed 21, Thu 22, Fri 23, Sat 24.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Multi-message entries use « ‖ » between messages (U = user, A = assistant, «[سامانه: …]» = a page-action system turn); _context_ says how many user turns back the corrected message is. Old values always stay as history («اصلاح شد ⇐»); nothing is deleted. Machine-readable copy: VARIANTS_R19b.json (fields rc, kind, role, text, expect, optional context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| INF15.retract | 15 | 13 |
| INF15.edit | 10 | 10 |
| INF16.dossier | 11 | 10 |
| INF17.trace | 10 | 10 |
| **total** | 46 | 43 |

## INF15.retract · chat self-correction of an earlier message (1, 3, 5+ turns back)

### Positive

1. [chat] <span dir="rtl">U: حدسم اینه که جواب ۲^n هست ‖ A: چرا این حدس؟ اگر n=۱ باشد چه؟ ‖ U: نه اشتباه نوشتم، منظورم ۲^n − ۱ بود</span> — _context:_ <span dir="rtl">corrected message is 1 user turn back; g1 was validated from it; math</span>  
   → retract {msg:«جواب ۲^n هست», what:guess, fix:«۲^n − ۱»}; problem guess g1 and coach.guess become «۲^n − ۱»; old value kept as history «اصلاح شد ⇐»; nothing deleted; the old guess's mind-card event withdrawn (not counted as a failure); the self-correction is look-back evidence; assistant states the change in one line
2. [chat] <span dir="rtl">U: داده‌ها: طول مستطیل ۱۲ و عرضش ۵ ‖ A: مجهول چیست؟ ‖ U: قطرش ‖ A: کدام قضیه به قطر ربط دارد؟ ‖ U: فیثاغورس ‖ A: خب، بنویس. ‖ U: ببخشید عرض رو اشتباه گفتم، ۹ بود نه ۵</span> — _context:_ <span dir="rtl">corrected message is 3 user turns back; Persian digits; math</span>  
   → retract {msg:«عرضش ۵», what:fact, fix:«۹»}; live-problem data field and the understand-form «داده‌ها» (filled from that turn) change ۵→۹; old value kept as history «اصلاح شد ⇐»; nothing deleted; later messages untouched; assistant says «عرض از ۵ به ۹ اصلاح شد» (or equivalent one line)
3. [chat] <span dir="rtl">U: برنامه‌م اینه که سه‌شنبه با صاحبخونه حرف بزنم ‖ A: قبلش چه می‌خواهی بگویی؟ ‖ U: اینکه اجاره زیاده ‖ A: عددی داری؟ ‖ U: آره، ۱۵ درصد بالاتر از محله ‖ A: خوب است. ‖ U: اون برنامه رو اصلاح کن، منظورم پنج‌شنبه بود</span> — _context:_ <span dir="rtl">corrected message is 3 user turns back; life problem; Today Sat 2026-10-17</span>  
   → retract {msg:«سه‌شنبه با صاحبخونه حرف بزنم», what:plan, fix:«پنج‌شنبه»}; plan date 2026-10-20 (Tue) → 2026-10-22 (Thu); any promise/reminder tied to it moves too; Tue kept as history «اصلاح شد ⇐»
4. [chat] <span dir="rtl">U: گام دوم رو انجام دادم و جواب داد ‖ A: عالی؛ نتیجه را ثبت کردم. ‖ U: نه، درستش اینه که جواب نداد، فقط شروعش کردم</span> — _context:_ <span dir="rtl">corrected message is 1 user turn back; s2 outcome was recorded from it</span>  
   → retract {msg:«گام دوم رو انجام دادم و جواب داد», what:step, fix:«جواب نداد، فقط شروعش کردم»}; step s2 outcome done → started/not-yet (via a38); old value kept as history «اصلاح شد ⇐»; nothing deleted; the «اجرا» mind-card + event from the wrong message withdrawn
5. [chat] <span dir="rtl">U: جواب نهایی ۸۹ است ‖ A: چطور چک می‌کنی؟ ‖ U: با n کوچک ‖ A: n=۳؟ ‖ U: ۳ تا میشه ‖ A: n=۴؟ ‖ U: ۵ تا ‖ A: الگو؟ ‖ U: فیبوناچی ‖ A: پس برای ۹ پله؟ ‖ U: جوابی که اول نوشتم اشتباه بود، منظورم ۵۵ بود</span> — _context:_ <span dir="rtl">corrected message is 5 user turns back; math (stairs)</span>  
   → retract {msg:«جواب نهایی ۸۹ است», what:ans, fix:«۵۵»}; stored answer evidence ۸۹→۵۵; any check verdict computed on ۸۹ is marked superseded (not silently kept as the verdict); old value kept as history «اصلاح شد ⇐»; nothing deleted
6. [chat] <span dir="rtl">U: فرمول مساحت دایره رو نوشتم S = πr ‖ A: واحدش چیست؟ ‖ U: متر ‖ A: مطمئنی؟ ‖ U: آره ‖ A: r=۲ بگذار. ‖ U: ۶.۲۸ ‖ A: با شکل بخوان. ‖ U: کمه ‖ A: چرا؟ ‖ U: اون S = πr رو اصلاح کن، درستش S = πr² هست</span> — _context:_ <span dir="rtl">corrected message is 5+ user turns back; formula input</span>  
   → retract {msg:«S = πr», what:fact (or said), fix:«S = πr²»}; the stored formula becomes S = πr² and renders as a formula; old value kept as history «اصلاح شد ⇐»; nothing deleted; the fragment match is on the EARLIER message, not on «S = πr» inside the current one
7. [chat] <span dir="rtl">U: مجهول سرعت متوسطه ‖ A: [فرمِ فهم: مجهول ← «سرعت متوسط»] داده‌ها؟ ‖ U: مسافت ۱۲۰ کیلومتر ‖ A: و زمان؟ ‖ U: دو ساعت رفت ‖ A: برگشت؟ ‖ U: منظورم زمان کل بود نه سرعت متوسط، اون مجهول رو اصلاح کن</span> — _context:_ <span dir="rtl">corrected message is 3 user turns back; form filled by an assistant action</span>  
   → retract {msg:«مجهول سرعت متوسطه», what:form, fix:«زمان کل»}; the understand-form field «مجهول» filled by the assistant action of that turn becomes «زمان کل»; old value kept as history «اصلاح شد ⇐»; nothing deleted
8. [chat] <span dir="rtl">U: شرطش اینه که عددا مثبت باشن ‖ A: فقط همین؟ ‖ U: نه اشتباه گفتم، شرط اینه که عددا صحیح باشن</span> — _context:_ <span dir="rtl">1 user turn back; colloquial, ZWNJ missing («عددا»)</span>  
   → retract {msg:«عددا مثبت باشن», what:said, fix:«عددا صحیح باشن»}; the stored condition (said evidence / live-problem condition) updated; old value kept as history «اصلاح شد ⇐»; nothing deleted
9. [chat] <span dir="rtl">U: مبلغ وام ۲۰۰ میلیون تومان است و قسط ماهانه ۸ میلیون. ‖ A: مدت بازپرداخت چقدر است؟ ‖ U: پوزش می‌خواهم؛ در پیام قبلی‌ام مبلغ وام را اشتباه نوشتم؛ صحیح آن ۱۲۰ میلیون است.</span> — _context:_ <span dir="rtl">1 user turn back; formal register; life/finance problem</span>  
   → retract {msg:«مبلغ وام ۲۰۰ میلیون», what:fact, fix:«۱۲۰ میلیون»}; only the loan amount changes; «قسط ماهانه ۸ میلیون» from the same message stays; old value kept as history «اصلاح شد ⇐»; nothing deleted; assistant answers in شما
10. [chat] <span dir="rtl">U: تصمیمم اینه که روزی دو ساعت درس بخونم ‖ A: از کی؟ ‖ U: از فردا ‖ A: کجا؟ ‖ U: کتابخونه ‖ A: چه ساعتی؟ ‖ U: عصر ‖ A: با چه کسی؟ ‖ U: تنها ‖ A: ثبت شد. ‖ U: اینکه گفتم روزی دو ساعت رو اصلاح کن، منظورم یک ساعت بود</span> — _context:_ <span dir="rtl">corrected message is 5 user turns back; life plan</span>  
   → retract {msg:«روزی دو ساعت درس بخونم», what:plan, fix:«یک ساعت»}; plan text becomes «روزی یک ساعت»; start date (2026-10-18) unchanged; old value kept as history «اصلاح شد ⇐»; nothing deleted
11. [chat] <span dir="rtl">U: حدسم اینه که سرایدار کلید رو برداشته ‖ A: چه شاهدی داری؟ ‖ U: دیشب دیدمش ‖ A: کجا؟ ‖ U: دم در ‖ A: ساعت؟ ‖ U: نه، منظورم همسایه‌ی طبقه‌ی دوم بود نه سرایدار</span> — _context:_ <span dir="rtl">3 user turns back; life guess</span>  
   → retract {msg:«سرایدار کلید رو برداشته», what:guess, fix:«همسایه‌ی طبقه‌ی دوم»}; guess g1 text becomes «همسایه‌ی طبقه‌ی دوم کلید رو برداشته»; any plan on_guess g1 stays linked to the (corrected) g1; old value kept as history «اصلاح شد ⇐»; nothing deleted
12. [chat] <span dir="rtl">U: جمعه بهت خبر می‌دم نتیجه چی شد ‖ A: باشد، جمعه منتظرم. ‖ U: اشتباه گفتم، منظورم شنبه‌ی بعد بود</span> — _context:_ <span dir="rtl">1 user turn back; promise derived from that message</span>  
   → retract {msg:«جمعه بهت خبر می‌دم», what:plan, fix:«شنبه‌ی بعد»}; the promise due 2026-10-23 (Fri) moves to 2026-10-24 (Sat); old value kept as history «اصلاح شد ⇐»; nothing deleted
13. [chat] <span dir="rtl">U: گام اول: x = 3 به دست اومد ‖ A: جایگذاری کن. ‖ U: 3 در معادله‌ی دوم ‖ A: چه شد؟ ‖ U: نمی‌خونه ‖ A: چرا؟ ‖ U: نه، x = ۷ درسته، اون گام اول رو اشتباه نوشتم</span> — _context:_ <span dir="rtl">3 user turns back; mixed Latin/Persian digits; math</span>  
   → retract {msg:«x = 3 به دست اومد», what:step, fix:«x = ۷»}; step s1 result 3→۷ (Latin digit in the old message, Persian in the fix both accepted); old value kept as history «اصلاح شد ⇐»; nothing deleted
14. [chat] <span dir="rtl">U: تا محل کار ۴۰ دقیقه راهه ‖ A: با چه وسیله‌ای؟ ‖ U: نوشتم ۴۰ دقیقه، ولی ۴۵ دقیقه بود</span> — _context:_ <span dir="rtl">1 user turn back; the current message repeats the old value</span>  
   → retract {msg:«۴۰ دقیقه راهه», what:fact, fix:«۴۵ دقیقه»}; the fragment is found in the EARLIER message (the current message also contains «۴۰ دقیقه» — that is not the target); old value kept as history «اصلاح شد ⇐»; nothing deleted
15. [chat] <span dir="rtl">U: فکر کنم جواب ۱۲۰ باشه، داده‌ها ۵ و ۴ ان ‖ A: [g1 «۱۲۰» ثبت شد؛ داده‌ها ← ۵ و ۴] ‖ U: داده‌ها رو اشتباه نوشتم، ۵ و ۳ بود</span> — _context:_ <span dir="rtl">1 user turn back; one message produced a guess and a data fill</span>  
   → retract {msg:«داده‌ها ۵ و ۴ ان», what:fact, fix:«۵ و ۳»}; data ۴→۳; old value kept as history «اصلاح شد ⇐»; nothing deleted; the guess g1 «۱۲۰» from the same message is not duplicated (one g1, re-linked to the corrected message) and the assistant may ask whether ۱۲۰ still holds

### Negative (look-alike)

1. [chat] <span dir="rtl">U: اشتباه کردم، کلید رو تو ماشین جا گذاشتم ‖ A: الان کجایی؟</span>  
   → NO retract — «اشتباه کردم» is about a real-world action, not an earlier message; nothing reversed (it may be new data/step info)
2. [chat] <span dir="rtl">U: دیروز سر امتحان اشتباه کردم و علامت منفی رو جا انداختم ‖ A: بعدش چه شد؟</span>  
   → NO retract — a real-world mistake reported; no record reversed; not a failure act of this session
3. [chat] <span dir="rtl">U: حدسم اینه که جواب فیبوناچیه ‖ A: چطور امتحانش می‌کنی؟ ‖ U: یه فکر دیگه: شاید بشه با استقرا رفت</span>  
   → NO retract — a new idea, not a correction; g1 stays as is; the new idea may become its own plan/guess
4. [chat] <span dir="rtl">U: معلممون تو جزوه اشتباه نوشته بود که جواب ۲۰ هست ‖ A: تو خودت چه فکر می‌کنی؟</span>  
   → NO retract — quoting someone else's mistake; nothing she said earlier is corrected
5. [chat] <span dir="rtl">U: جواب ۸۹ه ‖ A: چطور؟ ‖ U: دوستم گفت اشتباه گفتی، ولی من مطمئنم ۸۹ درسته</span>  
   → NO retract — she keeps her answer; the stored answer ۸۹ stays
6. [chat] <span dir="rtl">U: عرضش ۹ه ‖ A: پس عرض ۵ است؛ حالا قطر را حساب کن. ‖ U: نه، تو اشتباه گفتی، من نوشتم ۹</span>  
   → NO retract of her message — she corrects the ASSISTANT; her record (عرض = ۹) was already right and stays; the assistant acknowledges its misreading
7. [chat] <span dir="rtl">U: اشتباه نکنم این همون مسئله‌ی پله‌هاست که هفته‌ی پیش حل کردیم ‖ A: شاید؛ چه شباهتی می‌بینی؟</span>  
   → NO retract — rhetorical «اشتباه نکنم», no earlier message corrected
8. [chat] <span dir="rtl">U: اگه اشتباه نکرده باشم جواب ۵۵ میشه ‖ A: چک کن.</span>  
   → NO retract — a hedged new answer; at most it is stored as an answer/guess, nothing reversed
9. [chat] <span dir="rtl">U: سلام، امروز خیلی خسته‌ام ‖ A: سلام؛ مسئله را بخوان. ‖ U: منظورم این بود که خواب‌آلودم نه خسته</span> — _context:_ <span dir="rtl">correction of something never stored</span>  
   → nothing reversed — the corrected message produced no stored record; no record or mind-card change; the assistant must not claim it «changed» a record
10. [chat] <span dir="rtl">U: یه عدد بین ۱ تا ۱۰ ‖ A: فرض کنیم ۵ است. ‖ U: نه، منظورم ۷ بود</span> — _context:_ <span dir="rtl">model reported retract {msg:«۵», what:fact, fix:«۷»}</span>  
   → page REJECTS a retract whose fragment «۵» is not in any earlier USER message (only the assistant said ۵); nothing reversed
11. [chat] <span dir="rtl">U: حدسم ۲^n ‖ A: ... ‖ U: برنامه‌م فردا ‖ A: ... ‖ U: اشتباه گفتم</span> — _context:_ <span dir="rtl">the reply omitted coach_state</span>  
   → fallback only: ASK «کدام را اصلاح کنم؟» listing the candidates (حدس «۲^n»، برنامه «فردا»); NOTHING reversed by the pattern alone
12. [chat] <span dir="rtl">U: عرضش ۵ ‖ A: مجهول؟ ‖ U: اون عرض رو اصلاح کن</span> — _context:_ <span dir="rtl">model reported retract {msg:«عرضش ۵», what:fact, fix:«۹»}</span>  
   → page REFUSES the retract (fix «۹» not in the current message); nothing reversed; assistant asks for the correct value
13. [chat] <span dir="rtl">U: جواب ۵۵ه ‖ A: پس جواب ۵۵ نیست؟ ‖ U: نه، ۵۵ درسته</span>  
   → NO retract — «نه، … درسته» here confirms her own earlier value; stored ۵۵ unchanged, no history entry

## INF15.edit · ✏️ edit on her own bubble

### Positive

1. [live] <span dir="rtl">✏️ on her bubble «حدسم اینه که جواب ۲^n هست» → saved as «حدسم اینه که جواب ۲^n − ۱ هست»</span>  
   → a user turn «[اصلاحِ پیامِ قبلی] …» is sent; g1 → «۲^n − ۱» applied directly (no model needed); the bubble shows the new text with «اصلاح شد ⇐ ۲^n» history; old guess mind-card event withdrawn
2. [live] <span dir="rtl">✏️ on a bubble 5 turns back «سه‌شنبه با صاحبخونه حرف می‌زنم» → «چهارشنبه با صاحبخونه حرف می‌زنم»</span>  
   → plan date 2026-10-20 → 2026-10-21; reminder moves; history «اصلاح شد ⇐ سه‌شنبه»
3. [live] <span dir="rtl">✏️ on «گام دوم انجام شد و جواب داد» → «گام دوم رو هنوز انجام ندادم»</span>  
   → step s2 outcome reverted to open (via a38); its «اجرا» + event withdrawn; history kept
4. [live] <span dir="rtl">✏️ on «طول ۱۲ متر» → «طول ۱۵ متر»</span>  
   → live-problem datum and the form field filled from that turn ۱۲→۱۵; «اصلاح شد ⇐ ۱۲» visible on the bubble and the form
5. [live] <span dir="rtl">✏️ on «مجهول سرعت متوسطه» (the assistant had filled the form field from that turn) → «مجهول زمان کله»</span>  
   → the form field filled by the assistant action of that turn is reverted and becomes «زمان کل»; old value as history
6. [live] <span dir="rtl">✏️ on «جواب نهایی ۸۹» → «جواب نهایی ۵۵»</span>  
   → answer evidence ۸۹→۵۵; the check verdict based on ۸۹ shown as superseded; history kept
7. [live] <span dir="rtl">✏️ edited twice: «عرض ۵» → «عرض ۹», later «عرض ۹» → «عرض ۸»</span>  
   → current value ۸; history chain shows ۵ ⇐ ۹ ⇐ ۸ (both corrections); two «[اصلاحِ پیامِ قبلی]» turns
8. [live] <span dir="rtl">✏️ on «فکر کنم کلید دستِ سرایداره» → «کلید رو دیروز خودم گم کردم»</span>  
   → guess g1 withdrawn (status withdrawn, kept as history, not deleted); its mind-card guess event withdrawn; the new statement may be stored as data
9. [live] <span dir="rtl">✏️ on «S = πr» → «S = πr²»</span>  
   → stored formula updated and rendered as a formula in the bubble and records; old formula in history
10. [live] <span dir="rtl">✏️ save while the model is unavailable (no coach_state comes back)</span>  
   → the reversal is applied anyway by the page (the user is the authority); the «[اصلاحِ پیامِ قبلی]» turn is still recorded

### Negative (look-alike)

1. [live] <span dir="rtl">✏️ opened on «جواب ۵۵ه», saved with the identical text</span>  
   → nothing sent, no «[اصلاحِ پیامِ قبلی]» turn, no history entry, no record touched
2. [live] <span dir="rtl">✏️ saved with only a trailing space added</span>  
   → treated as identical: nothing sent, no history entry
3. [live] <span dir="rtl">✏️ on «سلام، خسته‌ام» → «سلام، خواب‌آلودم»</span>  
   → bubble text updated with history, but NO record reversed and no mind-card change (the bubble produced nothing stored); assistant does not claim records changed
4. [live] <span dir="rtl">looking for ✏️ on an assistant bubble</span>  
   → no ✏️ on assistant bubbles — only on her own
5. [live] <span dir="rtl">looking for ✏️ on a «[سامانه: گام «۱» ثبت شد]» system-turn bubble</span>  
   → no ✏️ on system turns
6. [live] <span dir="rtl">✏️ opened then cancelled</span>  
   → nothing sent, nothing changed
7. [live] <span dir="rtl">✏️ saved with empty text</span>  
   → refused (an empty edit is not a delete); bubble and records unchanged
8. [live] <span dir="rtl">✏️ on «حدسم ۲^n» → «حدسم ۲^n − ۱»</span>  
   → the old guess must NOT be hard-deleted from the store or vanish from the dossier — it stays as history «اصلاح شد ⇐»
9. [live] <span dir="rtl">✏️ on a bubble already corrected by a chat retract (same value ۵→۹), saved as «… ۹»</span>  
   → no second reversal: no duplicate history entry and no double mind-card withdrawal
10. [live] <span dir="rtl">✏️ on a bubble of problem B's session while problem A is open</span>  
   → only problem B's records change; problem A untouched

## INF16.dossier · «📜 پروندهٔ کامل» per problem: completeness, order, exclusions

### Positive

1. [events] <span dir="rtl">Problem «۲۰ پله»: statement 10:00 Sat 17; understand form filled 10:05, «مجهول» corrected 10:20; g1 «۲^n» 10:10 refuted 10:30; plan pl1 «حالت‌های کوچک» 10:32; steps s1, s2 done 10:40/10:50; check verdict pass 11:00; look-back 11:05</span>  
   → one chronological read-only page: statement → understand form (as filled + «اصلاح شد ⇐» history) → g1 with outcome refuted → pl1 → s1, s2 with outcomes → check verdict → look-back; in that time order
2. [events] <span dir="rtl">Life problem «اجاره»: session 1 Sat 2026-10-17 (plan pl1 dated Tue 2026-10-20), session 2 Tue 2026-10-20 (step s1 «حرف زدن با صاحبخونه» done, outcome «۵ درصد کم کرد»)</span>  
   → both days shown with day separators; both sessions linked; pl1 shows its date; s1 shows its outcome
3. [events] <span dir="rtl">form «داده‌ها» filled by the assistant action after U «مسافت ۱۲۰ کیلومتر»</span>  
   → the form entry shows the chat message that fed it, linked to its session
4. [events] <span dir="rtl">stored formula S = πr² and the guess «۲^n − ۱»</span>  
   → formulas rendered (superscripts/π), not raw markup
5. [events] <span dir="rtl">step s2 done → «اجرا» +1; g1 refuted → its recorded mind-card effect</span>  
   → each act shows the mind-card events it produced (row + sign)
6. [events] <span dir="rtl">g1 «۲^n» corrected by retract to «۲^n − ۱» at 10:12</span>  
   → g1 shows old and new («اصلاح شد ⇐ ۲^n») with the correcting message linked; the withdrawn mind-card event shown as withdrawn
7. [events] <span dir="rtl">all-work index: problem P1 last 10-15, idea I1 last 10-17, factory case F1 last 10-16, session S9 last 10-17 09:00 (I1 at 10-17 08:00)</span>  
   → sorted by last activity: S9, I1, F1, P1
8. [events] <span dir="rtl">export one dossier as Markdown and as HTML</span>  
   → same sections in the same order as on screen, formulas preserved, corrections with history
9. [events] <span dir="rtl">open the dossier from the problem header, from the assistant session, and from the mind-card timeline</span>  
   → all three entry points open the same dossier of that problem
10. [events] <span dir="rtl">problem paused after the plan (no steps, no check, no look-back)</span>  
   → dossier shows up to the last activity with state paused; stages not reached shown as not reached
11. [events] <span dir="rtl">step s3 outcome «done» withdrawn by a ✏️ edit</span>  
   → s3 shown with its current state and the withdrawn outcome as history, not as an active result

### Negative (look-alike)

1. [events] <span dir="rtl">the same assistant session also discussed problem «اجاره» while working «۲۰ پله»</span>  
   → the «۲۰ پله» dossier does NOT show «اجاره» guesses/plans/steps
2. [events] <span dir="rtl">tour/test runner seeded problems and acts on the same account</span>  
   → they do NOT appear in the owner's index or mind-card contributions
3. [events] <span dir="rtl">dossier opened</span>  
   → no edit controls on it (read-only)
4. [events] <span dir="rtl">look-back never done</span>  
   → no look-back entry claiming it was done
5. [events] <span dir="rtl">an unrelated chit-chat session with no link to the problem</span>  
   → not listed among the problem's messages
6. [events] <span dir="rtl">a step reported in chat and the same step confirmed via the form (same act id)</span>  
   → appears ONCE in the dossier
7. [events] <span dir="rtl">old problem P1 (created 2026-09-01) got a new step today</span>  
   → NOT left at the bottom by creation date — it moves up by last activity
8. [events] <span dir="rtl">a withdrawn mind-card event</span>  
   → not shown as an active contribution
9. [events] <span dir="rtl">stored formula «\frac{n(n+1)}{2}»</span>  
   → never shown as raw LaTeX in the dossier or the export
10. [events] <span dir="rtl">an ask-only deferred candidate (never stored)</span>  
   → does not appear as a record in the dossier

## INF17.trace · mind card «از کجا؟»: acts per row, once

### Positive

1. [events] <span dir="rtl">s2 done (2026-10-17, problem «۲۰ پله»)</span>  
   → «اجرا» row «از کجا؟» lists s2 · 2026-10-17 · + · link to the dossier at s2
2. [events] <span dir="rtl">g1 validated (10-17) and g2 validated (10-18), different problems</span>  
   → the guessing row lists both, each with its source problem and date
3. [events] <span dir="rtl">retract: she corrected her own guess</span>  
   → look-back row lists the self-correction as +, never −
4. [events] <span dir="rtl">check verdict pass on problem P1 (10-16)</span>  
   → the check/look-back stage row lists it with date and +
5. [events] <span dir="rtl">understand form completed (10-17)</span>  
   → the «فهمِ مسئله» stage row lists the form act
6. [events] <span dir="rtl">one step act that moves both an ability row and a stage row</span>  
   → listed once in each of the two rows
7. [events] <span dir="rtl">row «اجرا» aggregate +3 −1</span>  
   → its «از کجا؟» lists exactly 4 acts whose signs sum to that aggregate
8. [events] <span dir="rtl">step s1 outcome corrected 3→۷ by retract</span>  
   → the row lists the corrected act once, with the corrected value
9. [events] <span dir="rtl">click an act in «از کجا؟»</span>  
   → opens the dossier at that act
10. [events] <span dir="rtl">a failed step (outcome «نشد», 10-17)</span>  
   → listed with − under its row, with date and source

### Negative (look-alike)

1. [events] <span dir="rtl">the same step reported in chat and via the form (same act id)</span>  
   → listed once, counted once
2. [events] <span dir="rtl">a step outcome withdrawn by a chat retract</span>  
   → not listed as a counted act (at most as withdrawn, not in the sum)
3. [events] <span dir="rtl">a guess withdrawn by ✏️ edit</span>  
   → not counted under the guessing row
4. [events] <span dir="rtl">tour/test acts on the account</span>  
   → not listed in the owner's card
5. [events] <span dir="rtl">the assistant's own messages</span>  
   → never listed as acts
6. [events] <span dir="rtl">an ask-only deferred candidate</span>  
   → not an act; not listed
7. [events] <span dir="rtl">page reloaded twice</span>  
   → no act appears twice
8. [events] <span dir="rtl">a retract replaced the old act with a new one</span>  
   → only the new act listed; old not counted alongside it
9. [events] <span dir="rtl">a self-correction</span>  
   → never listed with − under any row
10. [events] <span dir="rtl">acts of problem B while looking at the card filtered to problem A</span>  
   → B's acts not listed under A's filter
