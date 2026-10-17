# VARIANTS_R18 — independent variant bank (round 18)

Written from DECISIONS_R18 + the round-18 runner reports only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-17 (Saturday; ۱۴۰۵/۰۷/۲۵) for all date expectations; Persian week: Sat 17, Sun 18, Mon 19, Tue 20, Wed 21, Thu 22, Fri 23.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Multi-message entries use « ‖ » between messages (U = user, A = assistant). `events` entries are event sequences (chat/live) with the expected mind-card state. RM6.head: pos = head dropped, neg = head kept. Machine-readable copy: VARIANTS_R18.json (fields rc, kind, role, text, expect, optional context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| RM1.evidence | 10 | 9 |
| RM1.close | 8 | 8 |
| RM2.plain | 14 | 9 |
| RM2.notation | 16 | 10 |
| RM3.trigger | 9 | 9 |
| RM4.guess | 8 | 8 |
| RM5.plan | 11 | 9 |
| RM5.defer | 9 | 8 |
| RM6.register | 11 | 8 |
| RM6.head | 8 | 8 |
| RM6.result | 8 | 8 |
| RM6.transf | 8 | 8 |
| RM6.leak | 9 | 8 |
| **total** | 129 | 110 |

## RM1.evidence · mind card evidence from successes and failures; empty stages never ranked

### Positive

1. [events] <span dir="rtl">chat: U «مجهول همون تعداد راه‌های رسیدن به گوشه‌ست» → coach_state.ans validated for understanding</span>  
   → understanding: 1 success / 0 failures; planning, execution, look-back: «هنوز داده‌ای نیست»; no stage named weakest
2. [events] <span dir="rtl">live: plan form saved (non-empty) ‖ live: next step marked «حل شد» by the user</span>  
   → planning: 1 success; execution: 1 success; understanding and look-back «هنوز داده‌ای نیست», not ranked
3. [events] <span dir="rtl">chat: coach fail flag at understanding (wrong unknown) ‖ chat: U restates «پس دنبال مساحتِ باقی‌مونده‌ایم» → ans validated</span>  
   → understanding: 1 success, 1 failure (shown «۱ از ۲»); other stages show «هنوز داده‌ای نیست» and none is named weakest/strongest
4. [events] <span dir="rtl">live: data-use gate passed («همه‌ی داده‌ها رو به کار بردم») ‖ live: auxiliary problem added and solved</span>  
   → planning: 2 successes (one event each, no weights); execution/understanding/look-back «هنوز داده‌ای نیست»
5. [events] <span dir="rtl">live: look-back check verified from her own messages (chkBy: msgs)</span>  
   → look-back: 1 success; other stages show «هنوز داده‌ای نیست» and none is named weakest/strongest
6. [events] <span dir="rtl">chat: chat_solved with model check whose quoted messages are validated substrings of her messages</span>  
   → execution: 1 success (solve) and look-back: 1 success (verified check); planning/understanding «هنوز داده‌ای نیست»
7. [events] <span dir="rtl">chat: model reports phase passed understanding→planning after she names data and unknown (validated)</span>  
   → understanding: 1 success; no failure added; planning still «هنوز داده‌ای نیست»
8. [events] <span dir="rtl">chat: 2 coach fail flags at planning ‖ live: step «حل شد» ‖ (no understanding / look-back events)</span>  
   → planning 0 of 2 is named weakest; execution 1 of 1; understanding and look-back «هنوز داده‌ای نیست» and excluded from the ranking (their ½ prior is never compared)
9. [events] <span dir="rtl">all four stages have data: understanding 2/2, planning 1/3, execution 2/2, look-back 1/1</span>  
   → weakest = planning (1 of 3) via the existing Rasch/Beta machinery; every stage shows its count
10. [events] <span dir="rtl">live: proof saved and look-back verified on an olympiad problem</span>  
   → the abilities radar shows a trace on the ability the card already maps that stage to; if the card has no mapping for that stage it says so in words — no invented mapping, radar never stays silently all-grey

### Negative (look-alike)

1. [events] <span dir="rtl">chat: U «گیر کردم، اصلاً نمی‌دونم از کجا شروع کنم» (stuck moment, coach fail flag)</span>  
   → counted as exactly one FAILURE at the coach's stage; never as a success; no other stage changes
2. [events] <span dir="rtl">chat: U «حل شد، جوابش ۴۹ تاست» with no model ans / check (unvalidated claim)</span>  
   → no success written for execution or look-back; card unchanged
3. [events] <span dir="rtl">chat: model coach_state.ans given but the page rejects it (quote not found in her message)</span>  
   → no success; stages stay as before
4. [events] <span dir="rtl">only execution has data (3 of 3 successes); the other three stages have 0 events</span>  
   → no stage is named weakest — the ½ prior of empty stages is never ranked; empty stages show «هنوز داده‌ای نیست»
5. [events] <span dir="rtl">live: plan form opened and closed empty (nothing saved)</span>  
   → no planning event
6. [events] <span dir="rtl">chat: the ASSISTANT states the final answer itself («پس جواب ۱۲ است»); she only says «آهان»</span>  
   → no success for her in any stage
7. [events] <span dir="rtl">live: problem closed with open steps, user dismisses the outcome dialog</span>  
   → no execution success and no execution failure recorded for those steps
8. [events] <span dir="rtl">chat: model check with quotes that are NOT in her messages (only «به گزارشِ گفت‌وگو»)</span>  
   → no verified look-back success; at most the unverified report, never «وارسی شد»
9. [events] <span dir="rtl">chat: U copies the problem statement verbatim, no model ans</span>  
   → no understanding success (restating by copy is not validated evidence)

## RM1.close · closing a problem with open steps

### Positive

1. [live] <span dir="rtl">problem with 2 open steps; she clicks «✅ حل شد»; nothing about the steps in chat</span>  
   → dialog asks the outcome of each of the 2 open steps (done / not done / don't know); nothing is recorded as done:"no" automatically
2. [live] <span dir="rtl">open step «فردا کیک رو می‌پزم» ‖ chat earlier: U «دیروز پختمش، خیلی خوب شد» with coach_state reporting it done</span>  
   → step recorded done (source: chat) without asking; never done:"no", auto:"solved"
3. [live] <span dir="rtl">open step «با صاحبخونه حرف می‌زنم» ‖ chat: U «باهاش حرف زدم ولی قبول نکرد»</span>  
   → step recorded done with outcome as reported (talk happened, result negative); not asked again
4. [live] <span dir="rtl">3 open steps; chat reported the 1st one done</span>  
   → dialog asks only about steps 2 and 3; step 1 recorded done from chat
5. [live] <span dir="rtl">2 open steps; in the dialog she answers «اولی رو انجام دادم، دومی رو نه»</span>  
   → step 1 done, step 2 not done — both from her answer, no auto flag
6. [live] <span dir="rtl">formal chat before closing: «مرحلهٔ دوم را اجرا کردم و نتیجه داد.»</span>  
   → matching open step recorded done from chat; only the remaining open steps are asked
7. [live] <span dir="rtl">problem closed via chat_solved while one live step is still open, no report about it</span>  
   → the outcome of that step is asked (in chat or dialog); not recorded "no"
8. [live] <span dir="rtl">open step «تست رو با n=۴ امتحان می‌کنم» ‖ chat: U «با ۴ امتحان کردم، جواب نداد»</span>  
   → step recorded done with negative outcome from chat, not asked

### Negative (look-alike)

1. [live] <span dir="rtl">problem with zero open steps; she clicks «✅ حل شد»</span>  
   → closes directly, no outcome question
2. [live] <span dir="rtl">all steps already marked done/not done before closing</span>  
   → no question asked
3. [live] <span dir="rtl">open step; chat: U «فردا حتماً انجامش میدم» (future intention)</span>  
   → NOT recorded done; the outcome is asked at closing
4. [live] <span dir="rtl">open step; chat: A «احتمالاً تا الان انجامش دادی»</span>  
   → assistant's words are not her report; outcome asked
5. [live] <span dir="rtl">open step of problem B; chat report «انجامش دادم» was about problem A's step</span>  
   → not applied to problem B; outcome of B's step asked
6. [live] <span dir="rtl">open step; chat: U «یه کمی شروع کردم ولی تموم نشد»</span>  
   → not recorded done; at most recorded "partial/not done" from her words, never auto:"solved"
7. [live] <span dir="rtl">problem abandoned («رهاش کن») with open steps</span>  
   → no auto done:"no", auto:"solved" — steps not marked by the solve path
8. [live] <span dir="rtl">coach_state reports step done but cites a message id that does not exist</span>  
   → not accepted; outcome asked

## RM2.plain · APP.MATH.toPlain for plain sinks (<option>, toasts, Today, e-mail)

### Positive

1. [sink] <span dir="rtl">$x^2+1$</span>  
   → <option> text = «x²+1» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
2. [sink] <span dir="rtl">$a_1 + a_2$</span>  
   → <option> text = «a₁ + a₂» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
3. [sink] <span dir="rtl">مقدارِ $p_1+p_2+p_3$ حداکثر چند است؟</span>  
   → <option> text = «مقدارِ p₁+p₂+p₃ حداکثر چند است؟» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
4. [sink] <span dir="rtl">$\frac{a}{b}$</span>  
   → <option> text = «a/b» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
5. [sink] <span dir="rtl">$\frac{a+1}{b-2}$</span>  
   → <option> text = «(a+1)/(b−2)» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
6. [sink] <span dir="rtl">اگر $b=a$ باشد، $\frac{a^2 b}{6}$ معقول است؟</span>  
   → <option> text = «اگر b=a باشد، a²b/6 معقول است؟» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
7. [sink] <span dir="rtl">$\sqrt{2}$ و $\sqrt{x+1}$</span>  
   → <option> text = «√2 و √(x+1)» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
8. [sink] <span dir="rtl">وقتی $y \to 0$ می‌رود</span>  
   → <option> text = «وقتی y → 0 می‌رود» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
9. [sink] <span dir="rtl">$1, 2, \dots, n$</span>  
   → <option> text = «1, 2, …, n» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
10. [sink] <span dir="rtl">نرخ \(\frac{dy}{dt}\) را بیاب</span>  
   → <option> text = «نرخ dy/dt را بیاب» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
11. [sink] <span dir="rtl">$a \le b \cdot c$</span>  
   → <option> text = «a ≤ b · c» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
12. [sink] <span dir="rtl">$2^{n}-1$</span>  
   → <option> text = «2ⁿ−1» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
13. [sink] <span dir="rtl">x^2 + y^2 = r^2</span>  
   → <option> text = «x² + y² = r²» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged
14. [sink] <span dir="rtl">$3 \times 4 \ge 10$</span>  
   → <option> text = «3 × 4 ≥ 10» — no $, no backslash, no _ or ^ left; surrounding Persian unchanged

### Negative (look-alike)

1. [sink] <span dir="rtl">قیمتش $5 بود الان $8 شده</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
2. [sink] <span dir="rtl">اول $100 دادم بعد $20 پس گرفتم</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
3. [sink] <span dir="rtl">ایمیلم ali_rezaei88@example.com ـه</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
4. [sink] <span dir="rtl">لینک: https://example.com/a_b?x=1&y=2</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
5. [sink] <span dir="rtl">فایل report_final_v2.pdf رو فرستادم</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
6. [sink] <span dir="rtl">فیلدهای order_id و idempotency-key</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
7. [sink] <span dir="rtl">هشتگ #بازی_فکری رو بزن</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
8. [sink] <span dir="rtl">مسیرش C:\new\folder هست</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)
9. [sink] <span dir="rtl">اسم متغیر user_name توی کد</span>  
   → unchanged character-for-character (no subscripts, no removed $, no Unicode math)

## RM2.notation · tokenizer: notation people actually type

### Positive

1. [user] <span dir="rtl">ع+۶ = ع² ⇒ ع² − ع − ۶ = ۰</span>  
   → one math run; ع is a variable; ۶ and ۰ displayed as Persian digits; left-to-right order inside the run; preview shown
2. [user] <span dir="rtl">۰٫۱×۲۰ + ۰٫۲۵×ح = ۰٫۱۵(۲۰+ح)</span>  
   → one run; ٫ kept as decimal separator; ح a variable; digits as typed
3. [user] <span dir="rtl">1/(2·3) + 1/(3·4) + … + 1/(n(n+1)) = n/(n+1) − 1/2</span>  
   → ONE run including «…»; order preserved (first term on the left); not split at «…»
4. [user] <span dir="rtl">S = ۱ + ۲ + ⋯ + ۱۰۰</span>  
   → one run including «⋯»; Persian digits as typed
5. [user] <span dir="rtl">۱/۵ − ۱/(۳(n+۲))</span>  
   → recognised as math (Persian-digit fraction triggers); one run; order kept, no bidi scramble
6. [user] <span dir="rtl">(10/n)^(n/2)</span>  
   → both parentheses kept; base (10/n), exponent n/2; has() true
7. [user] <span dir="rtl">(۲/k)^(k+۱) کوچک‌تر از ۱ است</span>  
   → math run «(۲/k)^(k+۱)» with both parens; rest is prose
8. [user] <span dir="rtl">پارامترِ g_EE را ۰٫۳ گرفتم</span>  
   → g with subscript «EE» (both letters); ۰٫۳ as typed
9. [user] <span dir="rtl">g_PV-E = 0.12</span>  
   → subscript «PV-E» as one name; the hyphen is NOT a minus
10. [user] <span dir="rtl">ثابتِ زمانی τ_I برابر ۵ است</span>  
   → τ with subscript I, base before subscript (τ_I, never I_τ) in the RTL bubble
11. [user] <span dir="rtl">۱۸۰n − (n−۲)×۱۸۰ = ۳۶۰</span>  
   → one run, no line break inside, token order preserved
12. [user] <span dir="rtl">x ≤ ۵ ⇒ ۲x ≤ ۱۰</span>  
   → one run with ≤ and ⇒
13. [user] <span dir="rtl">۱۲ ÷ ۴ = ۳</span>  
   → one run; ÷ kept
14. [user] <span dir="rtl">a_max − a_min ≥ 2</span>  
   → multi-letter subscripts «max», «min»
15. [user] <span dir="rtl">dV/dt = −5 و بعداً هم dV/dt رو لازم داریم</span>  
   → both dV/dt rendered the same way; −5 unary minus without binary spacing; no line break before «و»/«،»
16. [user] <span dir="rtl">پس حجم = ۲ × (a/2)² × b = a²b/6!</span>  
   → math run isolated; the «!» stays outside at the end and never glues into «!=»

### Negative (look-alike)

1. [user] <span dir="rtl">جلسه‌مون ۱۴۰۵/۰۷/۲۵ ساعت ۱۰ صبحه</span>  
   → plain prose; the date is not a fraction
2. [user] <span dir="rtl">شمارم ۰۹۱۲-۳۴۵-۶۷۸۹ هست</span>  
   → phone number, not math; hyphens not minus
3. [user] <span dir="rtl">۳ تا سیب و ۲ تا پرتقال خریدم</span>  
   → prose; no math run
4. [user] <span dir="rtl">یه کار دو-سه روزه‌ست</span>  
   → hyphenated Persian word, not math
5. [user] <span dir="rtl">rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2</span>  
   → FEN, not math; «8/4» etc. are not fractions
6. [user] <span dir="rtl">نسخه‌ی v2.3.1 رو نصب کردم</span>  
   → version number, not math
7. [user] <span dir="rtl">ساعت 10:30 بیا دنبالم</span>  
   → time, not a ratio
8. [user] <span dir="rtl">قیمتش ۱۲۰٬۰۰۰ تومنه</span>  
   → price; ٬ thousands separator; not math
9. [user] <span dir="rtl">فصل ۴ صفحه‌ی ۲۵-۳۰ رو بخون</span>  
   → page range, not subtraction
10. [user] <span dir="rtl">بند الف و ب رو خوندم، ج مونده</span>  
   → Persian letters are not variables (no operator/relation run)

## RM3.trigger · «# فرمول» line triggered by content, not view

### Positive

1. [context] <span dir="rtl">تعداد جواب‌های صحیحِ نامنفیِ x+y+z=10 چندتاست؟</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
2. [context] <span dir="rtl">آره، فرمول زاویه‌ها (n−۲)×۱۸۰ رو بلدم (view: today)</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
3. [context] <span dir="rtl">ثابت کن ۱+۳+…+(۲n−۱)=n²</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
4. [context] <span dir="rtl">حجم مخروط V = πr²h/3 و شعاع هم داره کم میشه</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
5. [context] <span dir="rtl">اگه ۳x−۵=۱۶ باشه x چند میشه؟ (view: chat on Today)</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
6. [context] <span dir="rtl">sqrt(a^2+b^2) رو حساب کردم</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
7. [context] <span dir="rtl">assistant last message: «نرخِ $\frac{dy}{dt}$ را می‌خواهیم»</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
8. [context] <span dir="rtl">ع² − ع − ۶ = ۰ رو چطوری حل کنم؟</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view
9. [context] <span dir="rtl">احتمال ۳/۸ ـه یا ۱/۴؟</span>  
   → «# فرمول» line present in the prompt, marked «(زمینه، نه پرسشِ دوم)», whatever the view

### Negative (look-alike)

1. [context] <span dir="rtl">با صاحبخونه سر ودیعه دعوامون شده</span>  
   → no «# فرمول» line, even on lprob/e_prob views
2. [context] <span dir="rtl">rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3 — حرکت بعدی چیه؟</span>  
   → no «# فرمول» line, even on lprob/e_prob views
3. [context] <span dir="rtl">جلسه ۱۴۰۵/۰۸/۰۱ ساعت ۱۰:۳۰ ـه</span>  
   → no «# فرمول» line, even on lprob/e_prob views
4. [context] <span dir="rtl">اجاره ۱۲ میلیون، ودیعه ۲۰۰ میلیون</span>  
   → no «# فرمول» line, even on lprob/e_prob views
5. [context] <span dir="rtl">اپ رو به v3.2.0 آپدیت کردم کرش می‌کنه</span>  
   → no «# فرمول» line, even on lprob/e_prob views
6. [context] <span dir="rtl">زنگ بزن ۰۹۱۲۳۴۵۶۷۸۹</span>  
   → no «# فرمول» line, even on lprob/e_prob views
7. [context] <span dir="rtl">هر روز ۳ ساعت گوشی دستمه و کارم عقب افتاده</span>  
   → no «# فرمول» line, even on lprob/e_prob views
8. [context] <span dir="rtl">می‌خوام هفته‌ای ۲ بار بازیافت ببرم</span>  
   → no «# فرمول» line, even on lprob/e_prob views
9. [context] <span dir="rtl">order_id و idempotency-key رو چطور طراحی کنم؟ (lprob view)</span>  
   → no «# فرمول» line, even on lprob/e_prob views

## RM4.guess · «(حدسِ تو: …)» only on the option made from coach_state.guess.q

### Positive

1. [chat] <span dir="rtl">U: فکر کنم جوابش ۱۲ باشه ‖ A: مجهول دقیقاً چیست؟ اگر n=۳ بگذاری چند می‌شود؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"۱۲", q:"اگر n=۳ بگذاری چند می‌شود؟"}</span>  
   → note «(حدسِ تو: «۱۲»)» ONLY on the option «اگر n=۳ بگذاری چند می‌شود؟»; «مجهول دقیقاً چیست؟» has none
2. [chat] <span dir="rtl">U: به نظرم کار همسایه‌ی طبقه‌ی بالاست ‖ A: چه چیزی می‌دانی؟ چطور می‌شود این را آزمود؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"کار همسایه‌ی طبقه‌ی بالاست", q:"چطور می‌شود این را آزمود؟"}</span>  
   → note «(حدسِ تو: «کار همسایه‌ی طبقه‌ی بالاست»)» only on «چطور می‌شود این را آزمود؟»
3. [chat] <span dir="rtl">U: حدس می‌زنم همیشه زوج دربیاد ‖ A: داده‌ها کدام‌اند؟ برای n=۵ امتحانش کرده‌ای؟ قانع شدی؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"همیشه زوج دربیاد", q:"برای n=۵ امتحانش کرده‌ای؟"}</span>  
   → note only on «برای n=۵ امتحانش کرده‌ای؟»
4. [chat] <span dir="rtl">U: احتمالاً مشکل از باتریه ‖ A: کِی شروع شد؟ اگر باتری را عوض کنی و باز خاموش شود، چه نتیجه می‌گیری؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"مشکل از باتریه", q:"اگر باتری را عوض کنی و باز خاموش شود، چه نتیجه می‌گیری؟"}</span>  
   → note «(حدسِ تو: «مشکل از باتریه»)» only on the second question
5. [chat] <span dir="rtl">U: من میگم ۲۴ تا راه داره ‖ A: چطور شمردی؟ با یک نمونهٔ کوچک‌تر، مثلاً ۳ نفر، می‌توانی بشماری؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"۲۴", q:"با یک نمونهٔ کوچک‌تر، مثلاً ۳ نفر، می‌توانی بشماری؟"}</span>  
   → note only on the small-case question
6. [chat] <span dir="rtl">U: گمونم اصلاً نمیشه ‖ A: چرا فکر می‌کنید نمی‌شود؟ یک رنگ‌آمیزی را امتحان کرده‌اید؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"اصلاً نمیشه", q:"یک رنگ‌آمیزی را امتحان کرده‌اید؟"}</span>  
   → note «(حدسِ تو: «اصلاً نمیشه»)» only on «یک رنگ‌آمیزی را امتحان کرده‌اید؟»
7. [chat] <span dir="rtl">U: فکر کنم سرعت پایین آب ثابت بمونه ‖ A: مجهول چیست؟ وقتی عمق نصف شود، $\frac{dy}{dt}$ بزرگ‌تر می‌شود یا کوچک‌تر؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"سرعت پایین آب ثابت بمونه", q:"وقتی عمق نصف شود، $\frac{dy}{dt}$ بزرگ‌تر می‌شود یا کوچک‌تر؟"}</span>  
   → note only on the depth question; option text is plain Unicode (dy/dt)
8. [chat] <span dir="rtl">U (live problem in focus): حدسم اینه که مساحت نصف میشه ‖ A: با یک شکل ساده آزمودی؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"مساحت نصف میشه", q:"با یک شکل ساده آزمودی؟"}</span>  
   → note on that option AND the guess stored on the focused live problem (solve.g)

### Negative (look-alike)

1. [chat] <span dir="rtl">U: نمی‌دونم ‖ A: یادت باشد: «حدس بزن، ولی حدست را بیازما». حالا مجهول چیست؟</span>  
   → no note on any option — a proverb quoted by the assistant is not her guess
2. [chat] <span dir="rtl">A: برهانش؟ فعلاً برچسبش «ناتمام — اکتشافی» است. حدسِ بعدی‌ات چیست؟</span>  
   → no note — a system label is not a guess
3. [chat] <span dir="rtl">U: تو جلسه گفتن «دو سال» طول می‌کشه ‖ A: حدست دربارهٔ این مدت چیست؟ با این حساب چه می‌کنی؟</span>  
   → no note — «دو سال» is a fact she reported, not her guess
4. [chat] <span dir="rtl">U (problem A earlier): حدسم ۷ ـه ‖ … ‖ U (problem B): مسئله‌ی جدید ‖ A: این را چطور می‌آزمایی؟</span>  
   → no note on problem B's options — the guess belongs to problem A
5. [chat] <span dir="rtl">U: فکر کنم ۹ باشه ‖ A: چرا؟ با n=۲ امتحان کن.</span> — _context:_ <span dir="rtl">coach_state.guess={g:"۹", q:"با n=۳ امتحان کن"}</span>  
   → no note — q «با n=۳ امتحان کن» is not a substring of this message
6. [chat] <span dir="rtl">U: فکر کنم ۹ باشه ‖ A: چرا ۹؟ با n=۲ امتحان کن؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"۹"}</span>  
   → no note at all — guess has no q
7. [chat] <span dir="rtl">U: کمک کن ‖ A: حدسِ من این است که جواب ۴ است؛ تو چه می‌گویی؟</span>  
   → no note — the guess is the assistant's, not in a user message
8. [chat] <span dir="rtl">U: حدسم ۲۴ ـه ‖ A: مجهول را با عبارتِ دیگری بگو؟ این را می‌توانی بیازمایی؟</span> — _context:_ <span dir="rtl">coach_state.guess={g:"۲۴", q:"این را می‌توانی بیازمایی؟"}</span>  
   → note only on «این را می‌توانی بیازمایی؟»; the restate option with a clitic/demonstrative never inherits it

## RM5.plan · plan lifecycle (open/done/expired, dedupe, on_guess, next-session)

### Positive

1. [user] <span dir="rtl">فردا عصر یه ساعت میرم پیاده‌روی</span>  
   → plan offered, when=2026-10-18, state open
2. [user] <span dir="rtl">دوشنبه به استاد راهنمام ایمیل می‌زنم</span>  
   → plan when=2026-10-19; in the first session on/after 2026-10-20 the prompt asks «انجام شد؟» once; not asked again later
3. [user] <span dir="rtl">(session 2026-10-20) آره، ایمیل رو زدم</span>  
   → model plan_done:{id} accepted → state done; disappears from follow-up line and Today
4. [user] <span dir="rtl">(again on 2026-10-17, plan already stored) فردا عصر یه ساعت میرم پیاده‌روی دیگه</span>  
   → refused as duplicate (same validated text, same day) or reported plan.same:<id>; only one plan exists
5. [user] <span dir="rtl">دیگه بعد از ساعت ۴ عصر قهوه نمی‌خورم</span>  
   → plan when="next-session"; reminded once at the start of the next session
6. [user] <span dir="rtl">به نظرم صدا از واحد بالاییه؛ امشب میرم در خونه‌شون حسابی بهشون می‌گم</span>  
   → plan.on_guess:true → offer «اول حدس را بیازما», no follow-up of the confrontation
7. [user] <span dir="rtl">اینجانب پنج‌شنبه گزارش را از نو خواهم نوشت.</span>  
   → plan offered, when=2026-10-22
8. [user] <span dir="rtl">تا آخر همین هفته سه تا طرح اولیه می‌کشم</span>  
   → plan offered, when=2026-10-23 (Friday, end of the Persian week)
9. [user] <span dir="rtl">(plan for 2026-10-18 asked once on 10-19, never answered; session 2026-10-25)</span>  
   → state expired; not asked again; not in the follow-up line
10. [user] <span dir="rtl">از این به بعد قبل از حل، صورت مسئله رو بلند می‌خونم</span>  
   → self-commitment, plan when="next-session", reminded once
11. [user] <span dir="rtl">پس‌فردا ساعت ۹ میرم بانک وام رو بپرسم</span>  
   → plan offered, when=2026-10-19 09:00

### Negative (look-alike)

1. [user] <span dir="rtl">دیروز قرار بود برم باشگاه، نرفتم</span>  
   → no plan offered (past)
2. [user] <span dir="rtl">(model reports plan with when=2026-10-15)</span>  
   → page rejects: a past date is never offered
3. [user] <span dir="rtl">هر شب تا دو بیدارم و صبح داغونم</span>  
   → habit complaint, no plan
4. [user] <span dir="rtl">تا سه‌شنبه باید پروژه رو تحویل بدم</span>  
   → deadline she is under, not her plan; no follow-up
5. [user] <span dir="rtl">دیگه خسته شدم از این وضع</span>  
   → complaint, no plan
6. [user] <span dir="rtl">(session 2026-10-21; previous user message from 2026-10-17 was «فردا صبح انجامش میدم»; she has done it since)</span>  
   → no follow-up offer dated 2026-10-18; not re-paired with the old message; not stored again
7. [user] <span dir="rtl">شاید یه روزی برم کلاس گیتار</span>  
   → vague, no date — no plan
8. [user] <span dir="rtl">(guess already tested and confirmed in chat) پس فردا میرم باهاش حرف می‌زنم</span>  
   → on_guess false → normal follow-up offered, NOT «اول حدس را بیازما»
9. [user] <span dir="rtl">مدیرم گفته از شنبه ساعت ۷ باید سر کار باشم</span>  
   → someone else's instruction, no plan

## RM5.defer · deferred-request candidate when coach_state is omitted

### Positive

1. [user] <span dir="rtl">بعداً یه نمونه پیام برام بنویس که بفرستم</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
2. [user] <span dir="rtl">بذار برای بعد، ولی آخرش بگو چرا این فرمول جواب میده</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
3. [user] <span dir="rtl">اینکه چرا این روش کار می‌کنه رو بذار برای وقتی خودت دیدی وقتشه</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
4. [user] <span dir="rtl">اصلاً این اثبات‌ها به چه درد من می‌خوره؟</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
5. [user] <span dir="rtl">میشه یه جدول برنامه‌ی هفتگی بهم بدی؟</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
6. [user] <span dir="rtl">لطفاً در فرصت مناسب چند منبع برای مطالعهٔ بیشتر معرفی بفرمایید.</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
7. [user] <span dir="rtl">یه سؤال: این فرمول رو از کجا آوردن؟</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
8. [user] <span dir="rtl">یادم بنداز آخر جلسه درباره‌ی تست‌زنی حرف بزنیم</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise
9. [user] <span dir="rtl">فعلاً نه، ولی بعدش می‌خوام بدونم چطور به مامانم بگم</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → CANDIDATE: next prompt carries «اگر هنوز پاسخش نداده‌ای…» with this request; nothing stored as a promise

### Negative (look-alike)

1. [user] <span dir="rtl">این فرمول رو از کجا آوردن؟</span> — _context:_ <span dir="rtl">assistant reply answered it</span>  
   → no candidate — the same assistant reply answered it
2. [user] <span dir="rtl">آخه کی حوصله داره؟</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → rhetorical, no candidate
3. [user] <span dir="rtl">باشه، بریم سراغ مرحله‌ی بعد</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → agreement, no candidate
4. [user] <span dir="rtl">ممنون، کافیه</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → closing, no candidate
5. [user] <span dir="rtl">بعداً خودم یه نگاه بهش می‌ندازم</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → her own deferred action, not a request to the assistant; no candidate
6. [user] <span dir="rtl">مامانم پرسید «کی تموم میشه؟»</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → quoted question of someone else, no candidate
7. [user] <span dir="rtl">نمی‌دونم چرا اینجوری شد</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → statement, no candidate
8. [user] <span dir="rtl">(assistant asked) «می‌خواهی متن را بنویسم؟»</span> — _context:_ <span dir="rtl">assistant reply did not answer it; coach_state omitted</span>  
   → the assistant's own question is never a candidate

## RM6.register · register evidence from the user's own text only

### Positive

1. [user] <span dir="rtl">آره ثبتش کن</span>  
   → register evidence: تو (compound imperative without -ید); model register accepted when it matches
2. [user] <span dir="rtl">یه کم کمک کن</span>  
   → register evidence: تو; model register accepted when it matches
3. [user] <span dir="rtl">باورت میشه؟ بازم نشد</span>  
   → register evidence: تو (clitic -ت, «میشه» without ZWNJ); model register accepted when it matches
4. [user] <span dir="rtl">تو چی میگی؟</span>  
   → register evidence: تو («میگی» without ZWNJ, 2sg); model register accepted when it matches
5. [user] <span dir="rtl">مطمئنی؟</span>  
   → register evidence: تو (2sg -ی); model register accepted when it matches
6. [user] <span dir="rtl">بهم بگو از کجا شروع کنم</span>  
   → register evidence: تو; model register accepted when it matches
7. [user] <span dir="rtl">لطفاً ثبت کنید</span>  
   → register evidence: شما (-ید); model register accepted when it matches
8. [user] <span dir="rtl">ممکن است بیشتر توضیح بدهید؟</span>  
   → register evidence: شما; model register accepted when it matches
9. [user] <span dir="rtl">بگین ببینم چی شد</span>  
   → register evidence: شما (colloquial -ین); model register accepted when it matches
10. [user] <span dir="rtl">میشه کمکم کنین؟</span>  
   → register evidence: شما; model register accepted when it matches
11. [user] <span dir="rtl">شما چه فکر می‌کنید؟</span>  
   → register evidence: شما; model register accepted when it matches

### Negative (look-alike)

1. [user] <span dir="rtl">مرسی</span>  
   → none — no evidence; model register kept
2. [user] <span dir="rtl">جواب شد ۱۲</span>  
   → none
3. [user] <span dir="rtl">(assistant) «چه می‌پرسید؟» while she only wrote تو forms</span>  
   → the assistant's own words never count; session stays تو
4. [user] <span dir="rtl">استادمون گفت «همه بنویسید»</span>  
   → quoted «بنویسید» is not her address to the assistant; none
5. [user] <span dir="rtl">نمی‌دونم</span>  
   → none (1sg is not 2nd-person evidence)
6. [user] <span dir="rtl">دیروز رفتم دیدم بسته‌ست</span>  
   → none (1sg/3sg)
7. [user] <span dir="rtl">کتابش اسمش «کمک کنید» ـه</span>  
   → title in quotes, none
8. [user] <span dir="rtl">رفیقم میگه «ولش کن»</span>  
   → quoted imperative, none

## RM6.head · verbless head kept/dropped in look-back options

### Positive

1. [assistant] <span dir="rtl">یک پرسشِ دیگر: مجهول دقیقاً چیست؟</span>  
   → option text = «مجهول دقیقاً چیست؟» (verbless head dropped; question self-contained)
2. [assistant] <span dir="rtl">پیش از هر چیز: داده‌ها کدام‌اند؟</span>  
   → option text = «داده‌ها کدام‌اند؟» (verbless head dropped; question self-contained)
3. [assistant] <span dir="rtl">خب، پرسشِ بعدی: آیا مسئلهٔ مشابهی دیده‌ای؟</span>  
   → option text = «آیا مسئلهٔ مشابهی دیده‌ای؟» (verbless head dropped; question self-contained)
4. [assistant] <span dir="rtl">حالا یک قدم عقب‌تر: شرط مسئله را می‌شود به چند بخش تقسیم کرد؟</span>  
   → option text = «شرط مسئله را می‌شود به چند بخش تقسیم کرد؟» (verbless head dropped; question self-contained)
5. [assistant] <span dir="rtl">برای بازنگری: نتیجه را می‌توانی وارسی کنی؟</span>  
   → option text = «نتیجه را می‌توانی وارسی کنی؟» (verbless head dropped; question self-contained)
6. [assistant] <span dir="rtl">یه سؤال کوچیک: از همه‌ی داده‌ها استفاده کردی؟</span>  
   → option text = «از همه‌ی داده‌ها استفاده کردی؟» (verbless head dropped; question self-contained)
7. [assistant] <span dir="rtl">در ادامه: می‌توانی مسئله را با کلماتِ خودت بگویی؟</span>  
   → option text = «می‌توانی مسئله را با کلماتِ خودت بگویی؟» (verbless head dropped; question self-contained)
8. [assistant] <span dir="rtl">و اما مهم‌تر: آیا مسئلهٔ کمکیِ ساده‌تری به ذهنت می‌رسد؟</span>  
   → option text = «آیا مسئلهٔ کمکیِ ساده‌تری به ذهنت می‌رسد؟» (verbless head dropped; question self-contained)

### Negative (look-alike)

1. [assistant] <span dir="rtl">حالا پیش از امتحان با گزینهٔ ب: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟</span>  
   → option keeps the head: «حالا پیش از امتحان با گزینهٔ ب: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟» — the question needs its referent (option letter / named object / deictic or clitic)
2. [assistant] <span dir="rtl">دربارهٔ پیشنهادِ دوم: چقدر به آن اطمینان داری؟</span>  
   → option keeps the head: «دربارهٔ پیشنهادِ دوم: چقدر به آن اطمینان داری؟» — the question needs its referent (option letter / named object / deictic or clitic)
3. [assistant] <span dir="rtl">در مورد خانهٔ خیابانِ بهار: هزینهٔ ماهانه‌اش را حساب کرده‌ای؟</span>  
   → option keeps the head: «در مورد خانهٔ خیابانِ بهار: هزینهٔ ماهانه‌اش را حساب کرده‌ای؟» — the question needs its referent (option letter / named object / deictic or clitic)
4. [assistant] <span dir="rtl">با راهِ الف: اولین گام چیست؟</span>  
   → option keeps the head: «با راهِ الف: اولین گام چیست؟» — the question needs its referent (option letter / named object / deictic or clitic)
5. [assistant] <span dir="rtl">برای مثلثِ قائم‌الزاویهٔ ABC: وترش چند است؟</span>  
   → option keeps the head: «برای مثلثِ قائم‌الزاویهٔ ABC: وترش چند است؟» — the question needs its referent (option letter / named object / deictic or clitic)
6. [assistant] <span dir="rtl">دربارهٔ آن ستونِ اضافه: لازمش داری؟</span>  
   → option keeps the head: «دربارهٔ آن ستونِ اضافه: لازمش داری؟» — the question needs its referent (option letter / named object / deictic or clitic)
7. [assistant] <span dir="rtl">با فرضِ n زوج: این حکم درست است؟</span>  
   → option keeps the head: «با فرضِ n زوج: این حکم درست است؟» — the question needs its referent (option letter / named object / deictic or clitic)
8. [assistant] <span dir="rtl">برای مسئلهٔ دومینوها: اگر دو خانهٔ گوشه را برداریم، چه می‌شود؟</span>  
   → option keeps the head: «برای مسئلهٔ دومینوها: اگر دو خانهٔ گوشه را برداریم، چه می‌شود؟» — the question needs its referent (option letter / named object / deictic or clitic)

## RM6.result · reported result vs claim/statement

### Positive

1. [user] <span dir="rtl">حسابش کردم: x = ۷ درمیاد</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
2. [user] <span dir="rtl">جواب نهایی شد ۴۹</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
3. [user] <span dir="rtl">تموم شد، کل هزینه شد ۳۲ میلیون</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
4. [user] <span dir="rtl">با n=۵ امتحان کردم شد ۱۲۰، پس جواب ۱۲۰ ـه</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
5. [user] <span dir="rtl">آخرش رسیدم به a=b=c</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
6. [user] <span dir="rtl">وزنم رسید به ۷۲، یعنی ۴ کیلو کم کردم</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
7. [user] <span dir="rtl">محاسبه کردم: √(۹+۱۶)=۵ پس قطرش ۵ سانته</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result
8. [user] <span dir="rtl">نتیجه گرفتم که احتمالش ۳/۸ است.</span> — _context:_ <span dir="rtl">phase: execution</span>  
   → reported result (phase execution/after): the pattern may OFFER look-back; the phase moves to look-back only on the model's report or a recorded result

### Negative (look-alike)

1. [user] <span dir="rtl">مطمئنم جواب داره: 8^2 - 4 = 60 پس 30 تا</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → claim while stating the problem → stays understanding; no look-back
2. [user] <span dir="rtl">مسئله اینه: ۲x+۳=۱۱، x رو پیدا کن</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → problem statement → understanding
3. [user] <span dir="rtl">معلممون گفته جواب ۱۲ ـه ولی نمی‌فهمم چرا</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → someone else's answer, not her result
4. [user] <span dir="rtl">حدسم اینه که ۲۴ باشه</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → guess, not result
5. [user] <span dir="rtl">اگه x=۳ باشه، پس y=۵ میشه؟</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → hypothetical question, not result
6. [user] <span dir="rtl">داده‌ها: a=۳ و b=۴</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → data list → understanding
7. [user] <span dir="rtl">تو صورت سوال نوشته ۱۰^۲ خونه داریم</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → statement detail, not result
8. [user] <span dir="rtl">(assistant) پس ۴۹ دومینو لازم است</span> — _context:_ <span dir="rtl">phase: understanding</span>  
   → assistant text never counts as her result

## RM6.transf · equation transformation vs numeric evaluation

### Positive

1. [step] <span dir="rtl">2x + 3 = 11 ⇒ 2x = 8 ⇒ x = 4</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
2. [step] <span dir="rtl">x² − 5x + 6 = 0 → (x−2)(x−3) = 0</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
3. [step] <span dir="rtl">طرفین رو در (n+1) ضرب کردم: n(n+2) + 1 = (n+1)²</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
4. [step] <span dir="rtl">ع² − ع − ۶ = ۰ ⇒ (ع−۳)(ع+۲) = ۰</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
5. [step] <span dir="rtl">sqrt(x+1) = 3 ⇒ x + 1 = 9</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
6. [step] <span dir="rtl">۲/x = ۴ ⇒ x = ۱/۲</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
7. [step] <span dir="rtl">a + b ≥ 2√(ab) ⇔ (√a − √b)² ≥ 0</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies
8. [step] <span dir="rtl">log(x) = 2 پس x = 100</span>  
   → equation transformation of an expression with an unknown → look-back gate «تبدیل‌ها هم‌ارز بودند؟» applies

### Negative (look-alike)

1. [step] <span dir="rtl">sqrt((1/3)^2 + (1/3)^2) = sqrt(2)/3</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
2. [step] <span dir="rtl">√(¼+¼)=√۲/۲</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
3. [step] <span dir="rtl">۳×۴ + ۵ = ۱۷</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
4. [step] <span dir="rtl">10^2 − 2 = 98</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
5. [step] <span dir="rtl">(۱۸−۲)×۱۸۰ = ۲۸۸۰</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
6. [step] <span dir="rtl">1/(1·2) + 1/(2·3) = 2/3</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
7. [step] <span dir="rtl">C(5,2) = 10</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure
8. [step] <span dir="rtl">n=۳ گذاشتم: ۳² + ۳ = ۱۲</span>  
   → numeric evaluation (no unknown on both sides) → NOT a transformation; the gate does not block closure

## RM6.leak · developer notes never reach the model

### Positive

1. [prompt] <span dir="rtl">(دورِ ۱۷، RC3: یک منبع برای وجهِ هر کنش)</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
2. [prompt] <span dir="rtl">طبقِ DECISIONS_R18 فقط پیشنهاد بده</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
3. [prompt] <span dir="rtl">R16: plan فقط پیشنهاد می‌شود</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
4. [prompt] <span dir="rtl">نگاه کن به a27_tour.js:2735</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
5. [prompt] <span dir="rtl">RC1 — guess را فقط از پیامِ کاربر بگیر</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
6. [prompt] <span dir="rtl">این قاعده در دورِ ۹ ثابت شد</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
7. [prompt] <span dir="rtl">موارد در VARIANTS_R18.json آمده</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
8. [prompt] <span dir="rtl">(R12/R13) نشانه‌گذاری شود</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails
9. [prompt] <span dir="rtl">پس از build.py دوباره بساز</span>  
   → REJECTED: page-authored prompt line contains a developer note (round/RC/R-number/DECISIONS/file name) → structural test fails

### Negative (look-alike)

1. [prompt] <span dir="rtl"># فرمول (زمینه، نه پرسشِ دوم)</span>  
   → allowed
2. [prompt] <span dir="rtl">مرحلهٔ محتمل: فهمِ مسئله</span>  
   → allowed
3. [prompt] <span dir="rtl">تاریخِ امروز: ۱۴۰۵/۰۷/۲۵</span>  
   → allowed
4. [prompt] <span dir="rtl"># پیگیریِ برنامهٔ خودش</span>  
   → allowed
5. [prompt] <span dir="rtl">اگر هنوز پاسخش نداده‌ای…</span>  
   → allowed
6. [prompt] <span dir="rtl">این گفت‌وگو با «تو» است</span>  
   → allowed
7. [prompt] <span dir="rtl">(her message quoted in the conversation block) «دورِ ۲ مسابقه رو باختم»</span>  
   → allowed — user content is not a developer line; never stripped from her message
8. [prompt] <span dir="rtl">(her message) «R2 مدلم شد ۰٫۹۳»</span>  
   → allowed — user content (R-squared), not a developer note
