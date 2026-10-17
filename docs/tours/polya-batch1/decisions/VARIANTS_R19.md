# VARIANTS_R19 — independent variant bank (round 19)

Written from DECISIONS_R19 + the round-19 runner reports only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-17 (Saturday; ۱۴۰۵/۰۷/۲۵) for all date expectations; Persian week: Sat 17, Sun 18, Mon 19, Tue 20, Wed 21, Thu 22, Fri 23.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Multi-message entries use « ‖ » between messages (U = user, A = assistant, «[سامانه: …]» = a page-action system turn). `events` entries are event sequences with the expected mind-card / plan state; stage tallies are successes/events. RN1.defer: a candidate stays ASK-only (never stored). Machine-readable copy: VARIANTS_R19.json (fields rc, kind, role, text, expect, optional context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| RN1.defer | 10 | 11 |
| RN2.step | 9 | 9 |
| RN2.gate | 8 | 8 |
| RN2.link | 8 | 8 |
| RN3.label | 10 | 9 |
| RN4.run | 13 | 9 |
| RN5.q | 8 | 8 |
| RN6.edge | 12 | 8 |
| **total** | 78 | 70 |

## RN1.defer · deferred-request candidate: paired with THE reply, requests only

### Positive

1. [chat] <span dir="rtl">U: میشه آخرش یه خلاصه از همه‌ی روش‌ها بهم بدی؟ ‖ A: اول بگو مجهول دقیقاً چیست؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE «میشه آخرش یه خلاصه از همه‌ی روش‌ها بهم بدی؟» (ask-only line; nothing stored)
2. [chat] <span dir="rtl">U: بعداً توضیح بده چرا جذر گرفتیم ‖ A: داده‌ها را یک بار دیگر بشمار. ‖ U: [سامانه: فرمِ فهمِ مسئله ذخیره شد] ‖ A: ثبت شد.</span> — _context:_ <span dir="rtl">first A omitted coach_state; the system-turn reply also has none</span>  
   → CANDIDATE «بعداً توضیح بده چرا جذر گرفتیم» — paired with the FIRST A (its own reply), the system-turn reply is skipped
3. [chat] <span dir="rtl">U: لطفاً یک مثال ساده‌تر هم بزنید. ‖ A: شرط مسئله را با کلمات خودتان بگویید.</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE «لطفاً یک مثال ساده‌تر هم بزنید.»
4. [chat] <span dir="rtl">U: قیمت نهایی شد ۳.۶۷ میلیون. می‌شه بگی این منطقیه؟ ‖ A: چه چیزهایی در این قیمت حساب شده؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE exactly «می‌شه بگی این منطقیه؟»; the sentence is not split at «۳.۶۷»; «۶۷ میلیون» / «شد ۳.۶۷ میلیون» never a candidate
5. [chat] <span dir="rtl">U: بگو ببینم شرط دوم اصلاً چرا لازمه ‖ A: اگر شرط دوم را برداری چه می‌شود؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE «بگو ببینم شرط دوم اصلاً چرا لازمه» (the reply asked back, did not explain)
6. [chat] <span dir="rtl">U: یه سؤال، توضیح بدین قضیه‌ی فیثاغورس از کجا اومده؟ ‖ A: در این مسئله کدام ضلع را می‌خواهی؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE «توضیح بدین قضیه‌ی فیثاغورس از کجا اومده؟»
7. [chat] <span dir="rtl">U: x=۴ شد. حالا یادم بده چطوری چکش کنم ‖ A: آفرین. حالا مسئلهٔ بعدی را بخوان.</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE «حالا یادم بده چطوری چکش کنم»; «x=۴ شد» is not a candidate
8. [chat] <span dir="rtl">U: میشه بعدا نحوه ی رسم نمودارشم نشونم بدی؟ ‖ A: فعلاً جدول مقادیر را کامل کن.</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE «میشه بعدا نحوه ی رسم نمودارشم نشونم بدی؟» (ZWNJ missing still recognised)
9. [chat] <span dir="rtl">U: سرعت ۲.۵ برابر میشه. بعداً بگو این چطور با زمان جور درمیاد ‖ A: فاصله چقدر است؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → CANDIDATE exactly «بعداً بگو این چطور با زمان جور درمیاد»; «سرعت ۲.۵ برابر میشه» (copula) is not
10. [chat] <span dir="rtl">U: آخر جلسه یادم بنداز درباره‌ی مدیریت وقت سر امتحان حرف بزنیم ‖ A: باشد؛ اکنون داده‌ها چیست؟ ‖ U: [سامانه: گام «۱» ثبت شد] ‖ A: گام ثبت شد.</span> — _context:_ <span dir="rtl">first A omitted coach_state (said «باشد» but did not record a promise)</span>  
   → CANDIDATE «آخر جلسه یادم بنداز درباره‌ی مدیریت وقت سر امتحان حرف بزنیم» — never the claim «گزارشِ وضعِ آن نوبت نیامد» for the system-turn reply

### Negative (look-alike)

1. [chat] <span dir="rtl">U: اگه سرعت نصف بشه، زمان دو برابر میشه. ‖ A: درست. حالا فاصله را بنویس.</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate — «میشه» is the copula («becomes»), no request
2. [chat] <span dir="rtl">U: باز ۴.۲۵ میشه. ‖ A: از کجا به ۴.۲۵ رسیدی؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate; never the fragment «۲۵ میشه.» (no split at the decimal point)
3. [chat] <span dir="rtl">U: جمعشون می‌شه ۱۲۰ تا ‖ A: چطور جمع زدی؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate (copula with a number)
4. [chat] <span dir="rtl">U: خب پس به چند روش می‌شه از ۲۰ تا پله بالا رفت؟ ‖ A: اگر فقط ۳ پله بود چند راه داشتی؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate — this is the live problem's own question (problem: «به چند طریق می‌توان از ۲۰ پله با گام‌های ۱ یا ۲ بالا رفت؟»)
5. [chat] <span dir="rtl">U: لطفاً جوابو نگو، فقط راهنمایی کن ‖ A: جواب را نمی‌گویم؛ فقط بپرس: اگر n=۱ باشد چه؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate — the request was honoured by the reply
6. [chat] <span dir="rtl">U: بیا این گام رو ثبت کنیم ‖ A: باشد. ‖ U: [سامانه: گام «پرسیدن از سرایدار» ثبت شد] ‖ A: ثبت شد.</span> — _context:_ <span dir="rtl">neither A carries coach_state</span>  
   → NO candidate — honoured by the page action
7. [chat] <span dir="rtl">U: مرسی، خیلی خوب بود ‖ A: خوشحالم. وارسی کردی؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state; pr1 already closed</span>  
   → NO candidate; the closed promise pr1 («بعداً یه مثال واقعی بزن», closed with promise_done two turns ago) is never offered again
8. [chat] <span dir="rtl">U: میشه بدون x هم حلش کرد؟ ‖ A: لازم نیست حتماً متغیر بگذاری؛ با یک شکل ساده هم می‌شود رسید.</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate — the reply answered it in different words (no token-overlap test)
9. [chat] <span dir="rtl">U: میشه یه راهنمایی کوچیک بدی؟ ‖ A: (راهنمایی داد) ‖ U: [سامانه: فرمِ طرح ذخیره شد] ‖ A: ذخیره شد.</span> — _context:_ <span dir="rtl">first A has coach_state; the system-turn reply has none</span>  
   → NO candidate and no «گزارشِ وضعِ آن نوبت نیامد» — the reply to her message carried a valid coach_state; the system-turn reply is not her reply
10. [chat] <span dir="rtl">U: پس شاید تبلیغ فقط یه ذره فروشو بالا برده؟ ‖ A: چطور می‌شود این را آزمود؟</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate — a guess about the problem, not a request addressed to the assistant
11. [chat] <span dir="rtl">U: رمهب‌ستان؟ ‖ A: حروف را بشمار.</span> — _context:_ <span dir="rtl">the reply to this message omitted coach_state</span>  
   → NO candidate — her own trial word

## RN2.step · chat step report applied to the step at once («از گفت‌وگو»)

### Positive

1. [live] <span dir="rtl">open step s1 «فردا با صاحبخونه حرف می‌زنم» ‖ U: دیروز باهاش صحبت کردم، قبول کرد ‖ A: coach_state.step={id:s1, done:yes, result:"قبول کرد"} (validated)</span>  
   → s1 applied AT ONCE: execution form shows done + «قبول کرد» prefilled, tagged «از گفت‌وگو»; prompt never says «نتیجه را خودش در صفحه ثبت می‌کند»; not asked again
2. [live] <span dir="rtl">open step «این هفته شام سبک» ‖ U: عروسی بود، نیم کیلو اضافه کردم ‖ A: step done:no, result:"نیم کیلو اضافه" (validated)</span>  
   → step shows not-done with «نیم کیلو اضافه» «از گفت‌وگو»; the form does NOT ask the same step with empty fields; mind card books ONE execution failure
3. [live] <span dir="rtl">open step «کیک را می‌پزم» ‖ U: دیروز کیک را پختم و خوب درآمد ‖ A: step done:yes (validated)</span>  
   → step done immediately (source chat); «✅ حل شد» dialog later does not list it
4. [live] <span dir="rtl">open step «فرم ثبت نام» ‖ U: فرم ثبت نام رو پر کردم و فرستادمش ‖ A: step done:yes</span>  
   → applied at once; prefilled «از گفت‌وگو» (ZWNJ-less text matched)
5. [live] <span dir="rtl">open step «تمرین‌های فصل ۳» ‖ U: نصفشو حل کردم، بقیه‌ش مونده ‖ A: step done:partial</span>  
   → step shows partial with her words prefilled «از گفت‌وگو»; still open for the rest, not asked as if unreported
6. [live] <span dir="rtl">open step «معادله‌ی دوم رو حل کن» ‖ U: حلش کردم، y=۳ درمیاد ‖ A: step done:yes, result:"y=۳"</span>  
   → step done; prefilled result renders «y=۳» as math; next coach line treats it as reported
7. [live] <span dir="rtl">after an applied chat report, she opens the execution form and edits the result</span>  
   → one record: her edit replaces the chat text (tag changes to her own entry); no second outcome row
8. [live] <span dir="rtl">open step s2 «به مامانم زنگ می‌زنم» ‖ U: به مادرم زنگ زدم، گفت آخر هفته میاد ‖ A: step done:yes (validated) ‖ next turn</span>  
   → next prompt lists s2 as reported/closed, not as «گامِ واقعیِ باز»
9. [live] <span dir="rtl">two open steps s1 s2 ‖ U: دومی رو انجام دادم ‖ A: step={id:s2, done:yes}</span>  
   → only s2 applied; s1 untouched and still open

### Negative (look-alike)

1. [live] <span dir="rtl">open step «با صاحبخونه حرف می‌زنم» ‖ U: فردا می‌خوام باهاش حرف بزنم</span>  
   → NOT applied — future intention; step stays open with empty form
2. [live] <span dir="rtl">open step «بانک» ‖ U: قراره شنبه برم بانک</span>  
   → NOT applied — plan for later
3. [live] <span dir="rtl">live problem «رژیم» with step «شام سبک» ‖ U: توی اون مسئله‌ی قبلی کیک رو پختم</span>  
   → NOT applied to the live problem's steps — report about another problem
4. [live] <span dir="rtl">open step ‖ U: اگه بپزمش احتمالاً خوب درمیاد</span>  
   → NOT applied — conditional
5. [live] <span dir="rtl">open step ‖ U: دارم انجامش میدم</span>  
   → NOT applied as done — in progress; no outcome recorded
6. [live] <span dir="rtl">open step ‖ U: انجام دادم ‖ A: (no coach_state)</span>  
   → NOT applied (no validated report; asymmetric) — the form stays as it was
7. [live] <span dir="rtl">A: coach_state.step result quotes «قبول کرد» but her message says «هنوز جواب نداده»</span>  
   → REJECTED — quote not in her message; form stays empty
8. [live] <span dir="rtl">step already closed earlier ‖ U: اون کارو کردم ‖ A: step={id:s1, done:yes}</span>  
   → refused («گام پیش‌تر بسته شده»); no duplicate outcome
9. [live] <span dir="rtl">open step ‖ A: فرض کن انجامش داده‌ای؛ بعد چه؟ ‖ U: باشه</span>  
   → NOT applied — a hypothetical from the assistant

## RN2.gate · open-item wording per kind (aux / intuitive / real step) and moment

### Positive

1. [prompt] <span dir="rtl">auxiliary problem solved, main problem open; she clicks «✅ حل شد» on the main problem</span>  
   → gate line names the aux problem and includes «مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد»
2. [prompt] <span dir="rtl">proof problem with one step marked intuitive and unproved; she says «حل شد» in chat</span>  
   → line «گامِ شهودیِ ثابت‌نشدهٔ «…»» for that step; no aux caveat (no aux problem exists)
3. [prompt] <span dir="rtl">practical problem, open real step «فردا ساعت ۹ به اداره زنگ می‌زنم»; she clicks «✅ حل شد»</span>  
   → closing asks the outcome of that real step with real-step wording (e.g. «گامِ باز»); never «شهودی», never «مسئلهٔ کمکی»
4. [prompt] <span dir="rtl">open real step «پیاده‌روی عصرها»; she writes «امروز پیاده‌روی نرفتم» (report on it)</span>  
   → the step is mentioned in this turn as a real open step; no intuitive/aux wording
5. [prompt] <span dir="rtl">at closing: aux problem solved AND an intuitive unproved step</span>  
   → two items, each in its own wording; the aux caveat appears exactly once
6. [prompt] <span dir="rtl">aux problem added but not solved; she closes the main problem</span>  
   → item names the open aux problem; the «حل شد ≠» caveat is not used (aux not solved)
7. [prompt] <span dir="rtl">open intuitive step in a geometry proof; look-back phase, she says «فکر کنم تمومه»</span>  
   → the unproved intuitive step is named before closing
8. [prompt] <span dir="rtl">at closing: aux solved, real step already reported from chat (RN2a)</span>  
   → only the aux item appears; the reported step is not listed

### Negative (look-alike)

1. [prompt] <span dir="rtl">practical problem, open real step «فردا ساعت ۱۰ با سرایدار صحبت می‌کنم»; ordinary turn, no report, no closing</span>  
   → NO gate line in this turn
2. [prompt] <span dir="rtl">diet problem, open real step; any turn</span>  
   → never «گامِ شهودیِ ثابت‌نشده» for a practical step
3. [prompt] <span dir="rtl">practical problem with no auxiliary problem; closing</span>  
   → never «مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد»
4. [prompt] <span dir="rtl">all steps closed, no aux, no intuitive step; closing</span>  
   → NO gate line
5. [prompt] <span dir="rtl">open real step whose outcome was already applied from chat</span>  
   → never «نتیجه را خودش در صفحه ثبت می‌کند»
6. [prompt] <span dir="rtl">open real step «شام سبک»; she writes «امروز خیلی خسته‌م»</span>  
   → NO gate line (not a report on that step, not closing)
7. [prompt] <span dir="rtl">intuitive step later marked proved; closing</span>  
   → NO intuitive item
8. [prompt] <span dir="rtl">aux solved, main still being worked mid-turn (no closing)</span>  
   → NO «حل شد ≠» line in the ordinary turn

## RN2.link · one act, one state: plan ↔ live step, plan ↔ guess

### Positive

1. [events] <span dir="rtl">plan pl2 «هر هفته یکی از غذاها رو عوض می‌کنیم» reported same as live step s3; s3 outcome recorded done; problem solved</span>  
   → pl2 state = done (shared); no «انجام شد؟» in the prompt; Today shows no «📌» line for it
2. [events] <span dir="rtl">plan pl1 «همین امروز باهاش روبه‌رو می‌شم» on_guess g1; g1 refuted (caretaker cleared)</span>  
   → pl1 closed for review; prompt never asks «انجام شد یا نه»; Today shows no «📌 … — انجام شد؟»
3. [events] <span dir="rtl">plan pl1 on_guess g1; g1 confirmed by her test</span>  
   → pl1 closed for review (not left open); no «انجام شد؟»
4. [events] <span dir="rtl">plan pl1 same as step s2; s2 outcome done:no from chat</span>  
   → pl1 shows not done — one state; no separate ask
5. [events] <span dir="rtl">plan pl1 due 2026-10-17; she taps «انجام دادم» on Today's «📌 برنامهٔ خودت» line</span>  
   → pl1 done (same state as chat plan_done); the next prompt has no ask; Today line gone
6. [events] <span dir="rtl">plan pl1 linked to step s1; validated plan_done:true in chat</span>  
   → s1 shows done too; neither asks again
7. [events] <span dir="rtl">model reports plan.same:"pl1" for a restated plan</span>  
   → one plan (pl1), not two; Today one line at most
8. [events] <span dir="rtl">plan pl1 due today (۱۴۰۵/۰۷/۲۵); she taps «هنوز نه»</span>  
   → pl1 stays open, not duplicated; asked again at most once later

### Negative (look-alike)

1. [events] <span dir="rtl">plan pl1 «ورزش صبح» open, unrelated live step «خرید» done</span>  
   → pl1 unchanged — still open, its own due ask stays
2. [events] <span dir="rtl">plan pl1 on_guess g1; g1 still untested</span>  
   → pl1 not closed; prompt carries «اول حدس را بیازما», not «انجام شد؟»
3. [events] <span dir="rtl">plan pl1 on_guess g2; a different guess g1 refuted</span>  
   → pl1 unaffected
4. [events] <span dir="rtl">plan pl1 with no linked step or guess, due date 2026-10-16 passed</span>  
   → «انجام شد؟» asked ONCE (legitimate); Today line present
5. [events] <span dir="rtl">plan «هر ماه یه بار» and step «هر هفته» with no plan.same report</span>  
   → not linked; two separate states
6. [events] <span dir="rtl">plan pl1 already done</span>  
   → never asked again in prompt or Today
7. [events] <span dir="rtl">plan pl1 expired</span>  
   → not asked; no Today line
8. [events] <span dir="rtl">she taps «انجام ندادم» on Today</span>  
   → pl1 recorded not done; no further «انجام شد؟» about it

## RN3.label · mind-card labels only from enough evidence; new evidence sources

### Positive

1. [events] <span dir="rtl">und 1/2, plan 2/2, exec 2/2, back 1/1</span>  
   → weakest «فهمِ مسئله» (only stage with a failure, strictly lowest)
2. [events] <span dir="rtl">und 3/3, plan 1/3, exec 2/2, back —</span>  
   → weakest «طرح‌ریزی»
3. [events] <span dir="rtl">exec 1/2, und 1/1, plan 1/1, back 1/1</span>  
   → weakest «اجرای طرح»
4. [events] <span dir="rtl">back 0/1, und 2/2, plan 2/2, exec 2/2</span>  
   → weakest «بازنگری»
5. [events] <span dir="rtl">chat: U «یعنی دنبال کم‌ترین تعداد وزنه‌ایم» ‖ A said:["u"] validated</span>  
   → understanding +1 success (her own restatement)
6. [events] <span dir="rtl">chat: U «پس شرطش اینه که هیچ دو تا کنار هم نباشن» ‖ A said:["c"] validated</span>  
   → understanding +1 success
7. [events] <span dir="rtl">chat: validated plan_done:true (she did her small step)</span>  
   → execution +1 success
8. [events] <span dir="rtl">chat: U «اول جدول کشیدم، شد ۱۴ تا» ‖ A said:["plan","result"] validated</span>  
   → planning +1 AND execution +1 success
9. [events] <span dir="rtl">guess with confidence 85% refuted</span>  
   → black spot «بیش‌اطمینانی» shown, «۱ بار از ۱»
10. [events] <span dir="rtl">two guesses at 80% and 90%, both refuted</span>  
   → black spot «بیش‌اطمینانی», «۲ بار از ۲»

### Negative (look-alike)

1. [events] <span dir="rtl">und 3/3, plan 4/4, exec 4/4, back 2/2 (no failure anywhere)</span>  
   → NO weakest; «هنوز تمایزی دیده نشده» on the card AND in the coach line
2. [events] <span dir="rtl">und 2/2, plan 1/2, back 1/2, exec 1/1</span>  
   → NO weakest — tie between planning and look-back; «هنوز تمایزی دیده نشده»
3. [events] <span dir="rtl">und 2/2, plan 1/1, exec 1/1, back 1/1</span>  
   → NO weakest (not decided by table order)
4. [events] <span dir="rtl">one guess at 80% confirmed</span>  
   → NO black spot (a correct prediction never produces «بیش‌اطمینانی»)
5. [events] <span dir="rtl">guess refuted in a turn without coach_state</span>  
   → not booked to any stage
6. [events] <span dir="rtl">one setback reported in chat (fail) AND the same step's outcome applied to the form</span>  
   → ONE execution failure, not two (same act id)
7. [events] <span dir="rtl">A: «پس مجهول همان کم‌ترین وزنه است» ‖ U: «آره»</span>  
   → NO understanding success (assistant's restatement)
8. [events] <span dir="rtl">plan 1/1 only (others no data)</span>  
   → no weakest named; empty stages «هنوز داده‌ای نیست»
9. [events] <span dir="rtl">guess at 30% refuted</span>  
   → NO «بیش‌اطمینانی» black spot

## RN4.run · math run boundaries, notation, codes, plot digits/attachment

### Positive

1. [user] <span dir="rtl">عدد ۴۷y بر ۸ ⇒ y=۶</span>  
   → run contains «y=۶»; «۸» is NOT in any run; the bubble reads exactly as typed (RTL order intact)
2. [user] <span dir="rtl">مجموع ارقام بر ۳: x+۴+۱+۲ بر ۳ ⇒ x=۲، ۵ یا ۸</span>  
   → runs «x+۴+۱+۲» and «x=۲»; the «۳» after each «بر» stays in the sentence; never «بر ۲ = x ⇒ ۳»
3. [user] <span dir="rtl">پس n≈3.7 درمیاد</span>  
   → run «n≈3.7»
4. [user] <span dir="rtl">باید بیشینه‌ی n·ln(10/n) رو پیدا کنم</span>  
   → run «n·ln(10/n)»
5. [user] <span dir="rtl">log(x)+log(y)=۲ پس xy=۱۰۰</span>  
   → runs «log(x)+log(y)=۲» and «xy=۱۰۰»
6. [user] <span dir="rtl">می‌دونیم sin²x + cos²x = 1 همیشه برقراره</span>  
   → run «sin²x + cos²x = 1»
7. [user] <span dir="rtl">خودم ساختمش: ۱/(1·2·3) + ۱/(2·3·4) + … و همینطور ادامه</span>  
   → run ends with «+ …» (ellipsis kept inside); no dangling «+»
8. [assistant] <span dir="rtl">الگوی a₁ + a₂ + … را با هم بنویسیم</span>  
   → run «a₁ + a₂ + …»
9. [user] <span dir="rtl">برای x کوچیک e^x ≈ 1 + x</span>  
   → run «e^x ≈ 1 + x»
10. [user] <span dir="rtl">نمودار exp(-t/2) رو می‌خوام</span>  
   → run «exp(-t/2)»
11. [user] <span dir="rtl">وزن‌هام این هفته: ۸۰، ۷۹، ۷۸.۵، ۷۷</span>  
   → plot attached to THIS message; x and y tick labels in Persian digits (۱ ۲ ۳ ۴), none Latin
12. [user] <span dir="rtl">times: 5, 4, 3, 1</span>  
   → plot with Latin tick digits on both axes
13. [user] <span dir="rtl">ساعت | ارتفاع ⏎ ۱ | ۲۰ ⏎ ۲ | ۳۵ ⏎ ۳ | ۴۵</span>  
   → plot axis names «ساعت» and «ارتفاع» (from her header); Persian ticks

### Negative (look-alike)

1. [user] <span dir="rtl">کد رزرو من TR-2026/10 هست</span>  
   → NO run; never «TR − 2026/10» nor a fraction
2. [user] <span dir="rtl">شماره‌ی پرونده A-12 رو بفرستید</span>  
   → NO run
3. [user] <span dir="rtl">شرکت گواهی ISO-9001 داره</span>  
   → NO run
4. [user] <span dir="rtl">این عدد بر ۸ بخش‌پذیره</span>  
   → NO run (lone number after a Persian word, no relation)
5. [user] <span dir="rtl">قیمت ۱۲۰٬۰۰۰ تومن، ساعت ۱۴:۳۰</span>  
   → NO run
6. [user] <span dir="rtl">صبر کن… یه لحظه</span>  
   → NO run («…» with no operator)
7. [user] <span dir="rtl">تاریخ ۱۴۰۵/۰۷/۲۵ جلسه داریم</span>  
   → NO run
8. [user] <span dir="rtl">فایل log رو چک کردم</span>  
   → NO run («log» without an argument)
9. [assistant] <span dir="rtl">(reply quoting her earlier series «۸۰، ۷۹، ۷۸.۵، ۷۷») روند نزولی است.</span>  
   → NO plot on this reply — the plot stays only under her message

## RN5.q · question segmentation around q keeps order and whole questions

### Positive

1. [assistant] <span dir="rtl">A: چطور می‌آزمایی‌اش؟ کدام داده را هنوز به کار نبرده‌ای؟</span> — _context:_ <span dir="rtl">q=«چطور می‌آزمایی‌اش؟»</span>  
   → options in order: [«چطور می‌آزمایی‌اش؟ (حدسِ تو: …)», «کدام داده را هنوز به کار نبرده‌ای؟»]
2. [assistant] <span dir="rtl">A: چطور امتحانش می‌کنی؟ با کدام حالتِ خاص؟</span> — _context:_ <span dir="rtl">q=«چطور امتحانش می‌کنی؟»</span>  
   → ONE option «چطور امتحانش می‌کنی؟ با کدام حالتِ خاص؟ (حدسِ تو: …)»; no orphan «با کدام حالتِ خاص؟»
3. [assistant] <span dir="rtl">A: مجهول چیست؟ اگر n=۲ بگذاری چند می‌شود؟ شرط چه می‌گوید؟</span> — _context:_ <span dir="rtl">q=«اگر n=۲ بگذاری چند می‌شود؟»</span>  
   → options in order: [مجهول…, «اگر n=۲ بگذاری چند می‌شود؟ (حدسِ تو: …)», شرط…]
4. [assistant] <span dir="rtl">A: داده‌ها کدام‌اند؟ حدست را با چه مثالی رد می‌کنی؟</span> — _context:_ <span dir="rtl">q=second</span>  
   → order kept: [داده‌ها…, «حدست را با چه مثالی رد می‌کنی؟ (حدسِ تو: …)»]
5. [assistant] <span dir="rtl">A: چگونه آن را می‌آزمایید؟ با کدام مثالِ نقض؟</span> — _context:_ <span dir="rtl">q=«چگونه آن را می‌آزمایید؟»; register شما</span>  
   → ONE option «چگونه آن را می‌آزمایید؟ با کدام مثالِ نقض؟ (حدسِ شما: …)»
6. [assistant] <span dir="rtl">A: کدام حالت ردش می‌کند؟ مثلاً با n=۱؟ و هدف دقیقاً چیست؟</span> — _context:_ <span dir="rtl">q=«کدام حالت ردش می‌کند؟»</span>  
   → [«کدام حالت ردش می‌کند؟ مثلاً با n=۱؟ (حدسِ تو: …)», «و هدف دقیقاً چیست؟»]
7. [assistant] <span dir="rtl">A: اگه ۱۲ باشه، با ۳ پله چند راه داری؟ یعنی دقیقا چندتا؟</span> — _context:_ <span dir="rtl">q=«اگه ۱۲ باشه، با ۳ پله چند راه داری؟»</span>  
   → ONE option including «یعنی دقیقا چندتا؟» with the note
8. [assistant] <span dir="rtl">A: شکل را کشیده‌ای؟ حدست را چطور وارسی می‌کنی؟ از کدام وارسی؟</span> — _context:_ <span dir="rtl">q=«حدست را چطور وارسی می‌کنی؟»</span>  
   → [«شکل را کشیده‌ای؟», «حدست را چطور وارسی می‌کنی؟ از کدام وارسی؟ (حدسِ تو: …)»]

### Negative (look-alike)

1. [assistant] <span dir="rtl">A: مجهول چیست؟ داده‌ها کدام‌اند؟</span> — _context:_ <span dir="rtl">no q</span>  
   → two options, no «حدسِ» note
2. [assistant] <span dir="rtl">A: حدست را چطور می‌آزمایی؟ داده‌ها چه هستند؟</span> — _context:_ <span dir="rtl">q=first</span>  
   → two options (two complete questions are split), note only on the first; order kept
3. [assistant] <span dir="rtl">A: مجهول چیست؟ چه می‌دانی؟</span> — _context:_ <span dir="rtl">q text not in the message</span>  
   → no note on any option
4. [assistant] <span dir="rtl">A: داده‌ها چیست؟ مثلاً طولِ ضلع؟ حدست را چطور می‌آزمایی؟</span> — _context:_ <span dir="rtl">q=«حدست را چطور می‌آزمایی؟»</span>  
   → the fragment «مثلاً طولِ ضلع؟» stays with «داده‌ها چیست؟», NOT merged into q; order kept
5. [assistant] <span dir="rtl">A: حدست را چطور می‌آزمایی؟</span> — _context:_ <span dir="rtl">q=that question</span>  
   → ONE option with the note (nothing to split)
6. [assistant] <span dir="rtl">A: چطور می‌آزمایی‌اش؟ کدام شرط را هنوز استفاده نکرده‌ای؟</span> — _context:_ <span dir="rtl">q=first</span>  
   → «کدام شرط…» is a complete question → separate second option, not merged into q
7. [assistant] <span dir="rtl">A: مجهول چیست؟ اگر n=۲ چه؟</span> — _context:_ <span dir="rtl">q=«مجهول چیست؟» (guess.q mis-set)</span>  
   → no reorder; note on «مجهول چیست؟» only as given, «اگر n=۲ چه؟» kept second
8. [assistant] <span dir="rtl">A: آیا این روش جواب می‌دهد؟ (بدون guess در coach_state)</span> — _context:_ <span dir="rtl">no q</span>  
   → one option, no note

## RN6.edge · phase / register / prompt edges

### Positive

1. [chat] <span dir="rtl">chat_solved recorded ‖ U: بعدی؟</span>  
   → no new problem, no phase card, no «مجهول … چیست؟» suggestion
2. [chat] <span dir="rtl">chat_solved ‖ U: خب؟</span>  
   → no new problem, no phase card
3. [chat] <span dir="rtl">chat_solved ‖ U: ادامه؟</span>  
   → no new problem, no phase card
4. [chat] <span dir="rtl">chat_solved ‖ U: هنوز نمی‌دونم کدومش بیشتر به دلم میشینه. بعدی؟</span>  
   → no new problem statement; session stays bound to the closed problem
5. [chat] <span dir="rtl">U: پس حجم = ۲ × (…) = a²b/6 ‖ A: said:["result"] validated (result text present in her message)</span>  
   → phase moves to look-back (next suggestion is a check, not «پیش‌تر همین را … دیده‌ای؟»)
6. [chat] <span dir="rtl">U: مساحت ۲۴ سانتی‌متر مربع شد ‖ A: said:["result"] validated</span>  
   → phase moves past execution
7. [prompt] <span dir="rtl">U: نگو، فقط بپرس ‖ (model gave no register)</span>  
   → register fallback = تو
8. [prompt] <span dir="rtl">U: باورت میشه بالاخره حلش کردم؟ ‖ (no model register)</span>  
   → register = تو
9. [prompt] <span dir="rtl">U: صبر کن یه لحظه ‖ A: …می‌پرسید… ‖ (no model register)</span>  
   → register stays تو; the assistant's «می‌پرسید» never flips it
10. [prompt] <span dir="rtl">U: لطفاً بفرمایید از کجا شروع کنم ‖ (no model register)</span>  
   → register = شما
11. [assistant] <span dir="rtl">conversation in شما; guess note on q option</span>  
   → note reads «(حدسِ شما: …)»
12. [prompt] <span dir="rtl">two open plans</span>  
   → prompt shows «pl1: …» and «pl2: …» (ids visible) in the plan follow-up block

### Negative (look-alike)

1. [chat] <span dir="rtl">chat_solved ‖ U: بعدی: مثلثی با ضلع‌های ۳ و ۴ و ۵ داریم، مساحتش چنده؟</span>  
   → a NEW problem IS created (real statement)
2. [chat] <span dir="rtl">mid-solve (not closed) ‖ U: خب؟</span>  
   → no new problem; stays in the current phase
3. [chat] <span dir="rtl">U: فکر کنم تموم شد ‖ A: said:["result"] with result «۲۴» not in her message</span>  
   → REJECTED — phase does not move
4. [chat] <span dir="rtl">U: جواب ۱۲ (no coach_state)</span>  
   → unvalidated pattern — phase does not move
5. [prompt] <span dir="rtl">A: …می‌پرسید… ; user wrote no register-bearing form; no model register</span>  
   → no flip from the assistant's form; default unchanged
6. [assistant] <span dir="rtl">conversation in تو; guess note</span>  
   → «(حدسِ تو: …)», never «شما»
7. [prompt] <span dir="rtl">model register "sh" given; user once wrote «نگو»</span>  
   → model's register wins (شما)
8. [prompt] <span dir="rtl">plan block</span>  
   → never a plan line without its id
