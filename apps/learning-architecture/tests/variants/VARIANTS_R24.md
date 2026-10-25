# VARIANTS_R24 — independent variant bank (round 24 root mechanisms R1–R8)

Written from DECISIONS_R24, the round-24 runner handbacks and defect lists A–D, and roadmap §21 only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. **No fixed calendar dates in expectations:** D0 = the test clock's day when the test runs; «D0+n» = n days later; «the first Saturday after D0» etc. are computed at run time and shown as Jalali dates. Ages are «full years from the birth date to D0» (the band — child ≤ 12, teen 13–17, elder ≥ 60 — is what is asserted). Birth dates are past dates and safe to hard-code; their Gregorian values below are ICU-verified in round 24: ۱۲ اردیبهشت ۱۳۳۸ = 1959-05-03; ۵ تیر ۱۳۲۴ = 1945-06-26; 1396/02/30 = 2017-05-20; ۱۷ اسفند ۱۳۸۸ = 2010-03-08 (1388 not leap: اسفند has 29 days). (Bank written 2026-10-25; that is provenance, not an expectation.)
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result). R6 is inverted by nature: pos = must pass without rewrite, neg = must still be caught.
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views, [events] sheet replies, registry diffs, dossier/mind-card readings, [time] day sequences under the test clock, [prompt] what the prompt/reply/post-check contains, [route] AI task route or 🧭 content.
Learners: adult unless the context says child (≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ deliberately missing in some entries — detection must not depend on it and her text is stored as typed. Digits appear in Persian, Latin and mixed form on purpose; all must be read the same.
Multi-message entries use « ‖ » (U = user, A = assistant, «[…]» = a page action/result/sheet event). Old values always stay as history («اصلاح شد ⇐»); nothing is deleted. Machine-readable copy: VARIANTS_R24.json (fields rc, kind, role, text, expect, context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| R1.territory_loop | 14 | 13 |
| R2.story_stage_turnq | 16 | 12 |
| R3.corrections_numbers | 15 | 13 |
| R4.opening_classification | 10 | 9 |
| R5.age_register | 13 | 10 |
| R6.postcheck_calibration | 8 | 8 |
| R7.today_dossier_promises | 10 | 9 |
| R8.prior_work | 16 | 12 |
| **total** | 102 | 86 |


## R1.territory_loop · territory loop matching (read only the routine's reply; exclude ruled-out areas; negation-aware; generic words ignored; best candidate, ask when unclear; system-self sheets never mark a step; sys_done page line + sheet note; 📜 outcome/step names/time order)


### Positive

1. [events] <span dir="rtl">[sheet #101 reply note] پاسخ به برگهٔ دستیار #۱۰۱ — حوزهٔ تازهٔ `pr_prior_art` («جست‌وجوی سابقهٔ اختراع») در s_problem افزوده شد. [registry diff: + pr_prior_art]</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → state wait ⇒ arrived; chat/Today line «🛎 ابزارِ لازم آمد: «جست‌وجوی سابقهٔ اختراع»» naming THAT area; the resume turn asks exactly step «۶-ب ثبتِ اختراع» again (not step 1, not «now»); 🔭, 🧭 and 📜 show «رسید»
2. [events] <span dir="rtl">[reply] ابزارِ «سنجشِ نیازِ مشتری» ساخته شد و در ساحتِ تصمیم است. [registry diff: + dc_customer_validation, title «سنجشِ نیازِ مشتری»; the note gives no id]</span> — _context:_ <span dir="rtl">step «۳ — آیا کسی حاضر است بخرد؟» waits for #104 (gap.step = 3)</span>  
   → matched by the Persian title in the reply alone ⇒ arrived for the step whose gap.step names «اعتبارسنجیِ مشتری»; Today «🛎 ابزارِ لازم آمد» once
3. [events] <span dir="rtl">[reply] دو حوزه افزوده شد: «سنجشِ ایمنیِ ساخته‌های برقیِ خانگی» و «جست‌وجوی سابقهٔ اختراع و مرزِ نوآوری». [registry diff lists the safety area FIRST]</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → every candidate is scored; the prior-art area wins on the step's own words (سابقه، اختراع، ثبت); the safety area (shares only «سنجش، مرز») is NOT chosen although listed first; the arrival line and resume name step ۶-ب
4. [chat] <span dir="rtl">[reply] یه حوزه‌ی جدید برای سنجش اضافه شد ‖ [registry diff: + one area whose title shares one specific word with the step]</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب); reply written colloquially, ZWNJ missing</span>  
   → score not clear ⇒ before resuming the page asks her «این ابزارِ تازه همان است که برای گامِ «۶-ب ثبتِ اختراع» لازم بود؟»; state stays wait until she answers; no «🛎 ابزارِ لازم آمد» yet
5. [chat] <span dir="rtl">[page asks «این ابزارِ تازه همان است…؟»] ‖ U: آره همونه، بریم</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → her yes ⇒ arrived ⇒ resumed; the resume question is step ۶-ب; 📜 event «سرانجام: رسید (تأییدِ تو)»
6. [chat] <span dir="rtl">U: خودم یه راه دیگه پیدا کردم، با سایتِ ثبتِ شرکت‌ها گشتم و چیزی نبود</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → sys_done: state other; a page line «گامِ ۶-ب از راهِ دیگری برداشته شد ✓»; a note under sheet #101 for the routine («کاربر از راهِ دیگری برداشت — هنوز لازم است؟»); the sheet is not deleted; 📜 event outcome «از راهِ دیگری»
7. [chat] <span dir="rtl">U: شما زحمت نکشید، خودم با جدول حلش کردم. دیگر آن ابزار لازم نیست.</span> — _context:_ <span dir="rtl">elder 81, «شما»; step waits for #102</span>  
   → sys_done as above in «شما» register («از راهِ دیگری برداشتید ✓»); 🔭 card stops saying «وقتی روتین ساخت، صفحه خودش می‌فهمد…»
8. [page] <span dir="rtl">[📜 after arrival] event «⏸ منتظرِ برگهٔ #۱۰۲»</span> — _context:_ <span dir="rtl">arrival happened two days after filing (D0+2)</span>  
   → the event now carries «سرانجام: رسید» (or «از راهِ دیگری» after sys_done), never still «منتظر»; the 🔭 card no longer repeats the fixed waiting text
9. [page] <span dir="rtl">[📜 / 🔭 / 🧭 titles for sheet #101]</span> — _context:_ <span dir="rtl">gap.step = 5</span>  
   → all three name the SAME waiting step — the one gap.step points to (e.g. «۵ ایمنی»), never the first step «۱ آبِ روزانه» and never a renamed «(برگهٔ دوم)» variant; her complaint text never becomes a story step
10. [time] <span dir="rtl">[D0 filed #101] ‖ [D0+1 unrelated reply ⇒ mismatch] ‖ [D0+3 real build ⇒ arrival]</span> — _context:_ <span dir="rtl">relative test clock; no fixed dates</span>  
   → 📜 and the route list events in time order: filed → mismatch (reopened) → arrival → resumed; the dossier never puts «🛎 ابزارِ لازم آمد» under D0 before the D0+1 mismatch
11. [events] <span dir="rtl">[gap sheet with gap.step = 2, filed while the focus is on step 4]</span>  
   → the ⏸ mark goes on step 2 (the named one), not on the current step 4; prompt tells the model step 2 waits
12. [events] <span dir="rtl">[sheet text from her own problem: «برای گامِ #۳ ابزارِ تخمینِ فرمی لازم است»; no gap.step]</span>  
   → a step explicitly named «#۳» counts ⇒ step 3 ⏸ waiting for this sheet
13. [events] <span dir="rtl">[reply] reply to sheet #101: added area pr_change_detection (تشخیصِ تغییر) [registry diff: + pr_change_detection]</span> — _context:_ <span dir="rtl">step «۲ — آیا روند واقعاً عوض شده؟» waits (gap.step = 2)</span>  
   → Latin «#101» ≡ «#۱۰۱»; matched by id from the REPLY ⇒ arrived for the step needing «تشخیصِ تغییر»
14. [events] <span dir="rtl">[reply] واسه تخمین فرمی یه بخش جدید ساختیم [registry diff: + pr_estimation_fermi]</span> — _context:_ <span dir="rtl">teen 15; step «۱ — چند تا کوک‌ساز در تهران؟» waits (gap.step = 1)</span>  
   → colloquial, no ZWNJ, no id ⇒ still matched on the title words «تخمین/فرمی» ⇒ arrived for the estimation step

### Negative (look-alike)

1. [events] <span dir="rtl">[reply under #101 names only the `farm` view] [the sheet's own filing text — the assistant's differential — mentions pr_hypothesis_testing]</span> — _context:_ <span dir="rtl">round-24 A24-4 shape; step 5 waits</span>  
   → NOT arrived: ids are read from the routine's reply only; page line «⚠️ پاسخِ روتین به گامِ «۵ ایمنی» جواب نداد»; a note is left under the sheet; the sheet is reopened; the step stays ⏸; nothing in Today says «آمد»
2. [events] <span dir="rtl">[reply names `pr_estimation_fermi`] [the sheet's «کجا افزوده شود» line named pr_representation]</span>  
   → NOT arrived for «بازنماییِ مسئله»; no «سنجیدم که نیازِ گام را جواب می‌دهد»; entry stays wait so the NEXT real build is still checked (S1 D24-1)
3. [events] <span dir="rtl">[assistant's `whole` text of the sheet contains «🧭 این برنامه چیست؟»; reply mentions nothing built]</span>  
   → the «built» list of the mismatch record never contains «🧭 این برنامه چیست؟» (taken from `whole`); built = []
4. [events] <span dir="rtl">[differential in the sheet: «نه آزمونِ فرضیه — آن هست و کافی نیست»] [reply: «آزمونِ فرضیه را کمی بهتر کردیم»]</span>  
   → pr_hypothesis_testing is a ruled-out area ⇒ excluded from candidates ⇒ not arrived; at most the page asks her whether this helps; step stays ⏸
5. [events] <span dir="rtl">[reply] هیچ ابزارِ تازه‌ای برای اقناع و تعهد ساخته نشد؛ فعلاً نیست.</span> — _context:_ <span dir="rtl">step «۴ — چطور قانعش کنم که تعهد بده؟» waits</span>  
   → words inside the «هیچ/نشد/نیست» clause never count ⇒ score 0 ⇒ not arrived; mismatch line + note
6. [events] <span dir="rtl">[reply] در واقع تغییری در مسئله و ابزار و نمودار نبود، هیچ.</span>  
   → only generic words (مسئله، تغییر، ابزار، نمودار، واقع، هیچ) ⇒ score 0 ⇒ not arrived
7. [events] <span dir="rtl">[reply names only «سنجشِ ایمنیِ ساخته‌های برقیِ خانگی»; shared words with the step: «سنجش، مرز»]</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → two shared generic words are not a match ⇒ not arrived for «۶-ب ثبتِ اختراع» (A24-5 shape); ask or mismatch
8. [events] <span dir="rtl">[assistant files kind=fix sheet «دکمهٔ ✏️ روی گوشی کار نمی‌کند» while her problem is in focus]</span>  
   → a sheet about the system itself never marks a step of her problem ⏸; her steps unchanged; no «گامِ منتظر» in the next prompt
9. [events] <span dir="rtl">[self-knowledge sheet: «آیا روش روی چند مدل سنجیده شده؟» (bank #4) while «تصمیمِ پیشنهادِ کار» is in focus]</span>  
   → no ⏸ on «فهمِ مسئله (دادهٔ ثبات)» or any step (A24-6); the sheet is listed as filed only
10. [events] <span dir="rtl">[companion-book sheet «کتابِ همراه هنوز نیست» while the battery problem is in focus]</span>  
   → no step «⏸ منتظرِ برگهٔ #۱۰۲»; the next prompt has no «در جمع‌بندی گامِ منتظر را صریح بگو» (D24-2)
11. [events] <span dir="rtl">[gap sheet about her domain WITHOUT gap.step and without any «#n» in a step]</span>  
   → no fallback to the «now» step; nothing marked waiting; the page may ask her which step needs it
12. [chat] <span dir="rtl">U: امروز خیلی خسته‌ام، بعداً ادامه بدیم</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → not sys_done, not arrival; the step stays ⏸; the waiting marker still shows
13. [chat] <span dir="rtl">U: راهِ دیگه‌ای هم هست که خودم برم جلو؟</span> — _context:_ <span dir="rtl">problem in focus; step «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» ⏸ waiting for sheet #101 (gap.step = 6-ب)</span>  
   → a question about another way is not a report of having done it ⇒ no sys_done; the coach may offer one

## R2.story_stage_turnq · one story, stage and turn question (stage from the chat story; chat answers imported before live_new; no stale u1; sub-result never moves the whole problem to look-back; plan steps only from a marked plan / list / validated plan, never cut at commas; importer never takes rejected attempts, correction messages or meta-questions; page re-check kept)


### Positive

1. [chat] <span dir="rtl">U: می‌خوام بدونم چند تا تخته‌ی ۲۴۰ سانتی بخرم ‖ [later the problem becomes live (live_new)]</span> — _context:_ <span dir="rtl">elder 81, carpentry</span>  
   → 🔭 «مجهول» pre-filled «از گفت‌وگو: چند تخته‌ی ۲۴۰ سانتی؟ — درست است؟»; no turn question «مجهول چیست؟ / به مجهول نگاه کن…»; the coach block's «پیشنهادِ این نوبت» is not «مجهول چیست؟»
2. [prompt] <span dir="rtl">[chat already holds: unknown, data, a plan and one executed step] ‖ [any next turn]</span>  
   → the live-problem block's stage = A.liveStoryPhase («اجرای طرح»), the same as 🧭 «اکنون» and the 🔭 stage; never «فهمِ مسئله» from the empty form
3. [chat] <span dir="rtl">U: طرحم اینه: ۱) مساحتِ کف رو حساب کنم ۲) تقسیم بر مساحتِ یه کاشی ۳) ده درصد اضافه برای پرت</span>  
   → exactly three plan steps with her words; 🧭 «مانده: ۳ گام از ۳»
4. [chat] <span dir="rtl">U: plan: / - قیمتِ هر سه تا خونه رو بنویسم / - هزینه‌ی رفت‌وآمد رو اضافه کنم / - مقایسه</span> — _context:_ <span dir="rtl">teen 17, Latin header</span>  
   → a bulleted list ⇒ three plan steps, one per bullet; «plan:» header not a step
5. [chat] <span dir="rtl">U: طرحم این است که اول مساحت را حساب کنم، بعد بر ۰٫۳۶ تقسیم کنم و گرد کنم.</span> — _context:_ <span dir="rtl">formal «شما»</span>  
   → marked as a plan but written as one sentence ⇒ stored as ONE plan entry (or exactly the model's validated `plan` items, each quote found in her text); never pieces cut at the commas
6. [prompt] <span dir="rtl">[model coach_state.plan = 3 steps, each quote found verbatim in her message]</span>  
   → the validated plan is imported (3 steps); a plan item whose quote is not in her text is rejected
7. [chat] <span dir="rtl">U: ۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابر</span> — _context:_ <span dir="rtl">multi-part dose problem; sub-problem 2 in focus</span>  
   → recorded as the result of sub-problem 2 only; the whole problem stays «اجرای طرح»; 🧭 never «اکنون: بازنگری · ۰ مرحله از ۴»
8. [chat] <span dir="rtl">U: پس کلاً ۱۴ تا تخته لازمه، با یه دونه اضافه. فکر کنم همینه</span> — _context:_ <span dir="rtl">elder 81, «شما» earlier; unknown = number of boards</span>  
   → a result that answers the whole unknown ⇒ stage may move to «بازنگری»; 🔭/🧭/prompt agree
9. [chat] <span dir="rtl">U: اولی رو امتحان کردم ساعت ۸ صبح، نشد. ۴ بعدازظهر و ۱۲ شب هم نشد. الان ۱۰ شب رو گذاشتم و دو هفته‌ست خوبه</span> — _context:_ <span dir="rtl">sleep problem</span>  
   → import: data/plan = «۱۰ شب، دو هفته خوب»; 8am/4pm/12am go to «امتحان‌های ردشده» history, never to «داده»
10. [chat] <span dir="rtl">U: ببخشید یه اشتباه کردم: حقوقم ماهی ۱۸ نیست، ۱۹ میلیونه</span>  
   → the datum becomes «حقوقِ ماهانه: ۱۹ میلیون (اصلاح شد ⇐ ۱۸)»; her correction message is never itself an imported item; one datum, not fragments
11. [chat] <span dir="rtl">U: راستی این فرم‌ها کجا ذخیره میشن؟ مجهولم کلِ هزینه‌ی سفره</span>  
   → the meta-question is answered/routed (not swallowed into a draft); «مجهول: کلِ هزینهٔ سفر» drafted «از گفت‌وگو … درست است؟»
12. [chat] <span dir="rtl">U: فکر کردم دورش سه تا مثلثِ دیگه هست که اگه مساحتشونو کم کنم میشه، ولی مساحتِ مثلث رو نمی‌دونم</span> — _context:_ <span dir="rtl">child 11</span>  
   → goes to plan idea + stuck (prerequisite: area of a triangle); NOT to «مجهول»
13. [chat] <span dir="rtl">[datum corrected to ۶] ‖ U: کل مسئله: آهنگِ تغییر میشه -54/(144π) ≈ -0.37</span>  
   → the page keeps ITS re-check question («با دادهٔ تازه دوباره بسنج») — never demoted as «پرسشِ فرمِ فهم کهنه است»; -54/(144π) ≈ -0.119, so her -0.37 is flagged for checking
14. [chat] <span dir="rtl">U: حل شد! ۲۰ تا مرغ و ۱۵ تا خرگوش. با ضرب چک کردم ‖ [chat_solved]</span> — _context:_ <span dir="rtl">elder 82</span>  
   → chat_solved imports unknown, data, condition and solution named earlier in the chat, not only the statement
15. [chat] <span dir="rtl">U: حکم اینه که مجموعِ زاویه‌های داخلیِ هر پنج‌ضلعی ۵۴۰ درجه‌ست. می‌خوام ثابتش کنم ‖ [live_new]</span> — _context:_ <span dir="rtl">teen 14, proof problem</span>  
   → 🔭 «حکم» filled from the chat («از گفت‌وگو»); no «حکم چیست؟» turn question; no stack line «مجهول» for a proof
16. [prompt] <span dir="rtl">[she named the unknown in the same message] coach block</span>  
   → no stale suggestion «مجهول چیست؟»; the suggestion follows the story's stage (e.g. «طرح» or «دادهٔ لازم»)

### Negative (look-alike)

1. [chat] <span dir="rtl">U: اگه مستقل باشن، احتمال ضرب میشه، بعد با جدول چک می‌کنم، حالا جمع‌بندی کن ببینم کجام</span> — _context:_ <span dir="rtl">B24·D3 shape</span>  
   → no plan steps cut at commas (never «گامِ ۱ ِ طرح: اگه مستقل باشن» … «گامِ ۴ ِ طرح: حالا جمع‌بندی کن…»); 🧭/Today never «مانده: ۰ گام از ۸»; at most one «این طرحت است؟»
2. [chat] <span dir="rtl">U: اون کارتِ تاریخ رو زدم، قبول نکرد، بعد دوباره زدم، من ۵ تیر ۱۳۲۴ به دنیا اومدم</span> — _context:_ <span dir="rtl">elder 81</span>  
   → no plan steps; the birth date is never a «گامِ طرح»; it goes to the birth parser only
3. [chat] <span dir="rtl">U: نصفِ ۴ در ۶ میشه ۱۲، جمع ۳۰، ولی طولش رو ندارم</span> — _context:_ <span dir="rtl">parent helping a child</span>  
   → computations + a stuck, never three plan steps
4. [chat] <span dir="rtl">U: بعدش چی کار کنم؟</span>  
   → not «مجهول را گفت»; the turn question is still given (next-step question for the stage)
5. [chat] <span dir="rtl">U: کتاب‌ها رو به ترتیب بخونم. خوبه؟</span> — _context:_ <span dir="rtl">teacher, three weeks in</span>  
   → a question ⇒ not stored as her plan; no موعد attached
6. [page] <span dir="rtl">[after the sub-result «۶ برابر» of sub-problem 2]</span>  
   → 🧭 must not show «اکنون: بازنگری»; 🔭 must not jump to look-back
7. [chat] <span dir="rtl">[datum corrected] ‖ U: کل مسئله: … (her message begins with «کل مسئله»)</span>  
   → her opening word «کل» does not mark the story «ahead of understanding»; the page's own re-check stays
8. [page] <span dir="rtl">[import after «اولی رو امتحان کردم ساعت ۸ صبح، نشد»]</span>  
   → «ساعت ۸ صبح» never appears as «داده (از گفت‌وگو)»
9. [chat] <span dir="rtl">U: ۱۶ نه، ۱۵</span>  
   → the correction message is never imported as a datum; «اصلاحِ خودم: …» is never appended to the statement text («می‌خوام (اصلاحِ خودم…)» must not appear)
10. [chat] <span dir="rtl">U: خسته‌ام، دیروز تا دیروقت کار کردم، امروزم جلسه دارم</span>  
   → no plan, no data from a non-problem message with commas
11. [chat] <span dir="rtl">U: سؤالم اینه که الان کجای کارم؟</span>  
   → a meta-question is not stored as the unknown; it is answered from the stage
12. [page] <span dir="rtl">[a NEW problem started in the same session after the first was solved]</span>  
   → the first problem's unknown/plan never appear as «از گفت‌وگو» drafts of the new one

## R3.corrections_numbers · corrections spread and number boundaries (✏️ number-boundary-aware; number roles; unit kept; typed form row changed or asked; drafts and 🧭 updated; derived values marked stale; real quotes in «why»; one line, one arrow direction)


### Positive

1. [edit] <span dir="rtl">[✏️ on «طول ۵ متر، عرض ۳ متر، حدسم ۱.۷۵ متره»] pairs ۵⇐۴ and ۳⇐۲</span> — _context:_ <span dir="rtl">C24-12 shape</span>  
   → only standalone numbers change: «طول ۴ متر، عرض ۲ متر»; «۱.۷۵» untouched (never «۱.۴۷»/«۱.۵.۷۵»/«۱۲۰»)
2. [chat] <span dir="rtl">U: ۱۶۰ سانت نبود، ۱۵۰ سانته</span> — _context:_ <span dir="rtl">A24-3 shape</span>  
   → statement «… ۱.۸ عرض، ۱۵۰ سانت ارتفاع …» — the unit stays; form datum «۱.۵ متر» consistent
3. [edit] <span dir="rtl">[✏️ «height 160cm» ⇒ «height 150cm»]</span>  
   → Latin digits and unit preserved: «150cm»; the Persian form datum shows ۱۵۰ سانت
4. [chat] <span dir="rtl">U: ۱۸ هفته مونده نه ۱۶؛ عروسی ۱۵ اسفنده</span> — _context:_ <span dir="rtl">B24·D5 shape</span>  
   → number roles: «۱۶ هفته ⇒ ۱۸ هفته»; «۱۵ اسفند» is a day of the month; no ask to change «۱۶» into «۱۵»; «بله» cannot corrupt the weeks
5. [chat] <span dir="rtl">U: بر ۴ بخش‌پذیر نه، باید بر ۵ بخش‌پذیر باشه</span> — _context:_ <span dir="rtl">D23-5 shape</span>  
   → the plan step «بخش‌پذیری بر ۴» is changed or asked; the digit «۴» inside «۴۵۷» is not touched; step 1 is not rewritten as «بر ۵ … بر ۵»
6. [edit] <span dir="rtl">[✏️ ۱۶⇐۱۵ on the bubble that produced the typed form row «داده: ۸ ساعت ⇒ ۱۶ سانت»]</span> — _context:_ <span dir="rtl">A22-17 shape</span>  
   → the typed form row is changed after a yes or the page asks «ردیفِ داده هم عوض شود؟» (ask list not empty)
7. [chat] <span dir="rtl">U: نه ۱۵ نفر نبودیم، ۱۲ نفر بودیم</span> — _context:_ <span dir="rtl">C24-11 shape</span>  
   → the correction flows into every «از گفت‌وگو» draft and the 🧭 destination (12); old value kept as history
8. [chat] <span dir="rtl">U: صفحه ۸ در ۸ بود نه ۱۰ در ۱۰ ‖ U: بله</span> — _context:_ <span dir="rtl">B24·D17 shape</span>  
   → derived values recomputed or marked «کهنه پس از اصلاح»: «۱۰۰ خانه»→۶۴, «۹۸ خانه»→۶۲, «۴۹ دومینو»→۳۱; plan «(۵۰ و ۴۸)» and «10^2 = 100» marked stale
9. [page] <span dir="rtl">[result «why» after the correction «۱۶۰ ⇐ ۱۵۰»]</span>  
   → why shows the real quotes: «۱۶۰ سانت» ⇐ «۱۵۰ سانت»; never «گفتم «» — اشتباه گفتم» or ««» ⇐ «»»
10. [page] <span dir="rtl">[dossier/route after one correction touching statement and lesson]</span>  
   → exactly one change line per corrected field; every arrow points the same way («new (اصلاح شد ⇐ old)»)
11. [edit] <span dir="rtl">[✏️ «۲.۵ میلیون» ⇒ «۲.۸ میلیون» on «۵ نفریم، هر کدوم ۲.۵ میلیون»]</span>  
   → only the amount changes; «۵ نفر» untouched; the total (۱۲.۵ ⇒ ۱۴) marked stale or recomputed
12. [chat] <span dir="rtl">U: ۳ کیلو نه، ۲ کیلو</span>  
   → statement keeps «کیلو»: «۲ کیلو»; no unit borrowed from another field
13. [chat] <span dir="rtl">U: عذر می‌خواهم، مبلغِ وام ۳۰۰ میلیون است نه ۲۰۰</span> — _context:_ <span dir="rtl">elder 72, «شما»</span>  
   → copy asks in «شما» («این‌جا هم عوض شود؟»); the derived monthly installment marked «کهنه پس از اصلاح» until recomputed
14. [chat] <span dir="rtl">U: نه ۱۲ تا مداد نبود، ۱۵ تا بود!</span> — _context:_ <span dir="rtl">child 9</span>  
   → answer per child «۴» recomputed to ۵ or marked stale; simple child wording
15. [chat] <span dir="rtl">U: 3.5 نه، 3.75 بود (Latin digits)</span>  
   → «۳.۵» ⇒ «۳.۷۵»; a «۳» elsewhere and «۵۰» untouched

### Negative (look-alike)

1. [edit] <span dir="rtl">[✏️ pair ۵⇐۶ on «۲۵ نفر، ۵ گروه، سال ۱۴۰۵»]</span>  
   → only «۵ گروه» changes; «۲۵» and «۱۴۰۵» untouched
2. [edit] <span dir="rtl">[✏️ pair ۲⇐۳ (people) on «x² + ۲ نفر»]</span>  
   → the exponent in «x²» is never changed
3. [chat] <span dir="rtl">U: عروسی ۱۵ اسفنده (no correction, a new datum)</span>  
   → no copy ask, no stale marks; nothing replaced
4. [chat] <span dir="rtl">U: ۱۵۰ همون ۱.۵ متره دیگه، فقط دقیق‌تر گفتم</span>  
   → same value restated ⇒ no correction, no stale marks, no «اصلاح شد» line
5. [chat] <span dir="rtl">U: نه، اون ۵ متر رد شد، ۷ متر بود</span>  
   → a result she tested and refuted keeps «رد شد»; the correction does not turn it into «درست بود»
6. [page] <span dir="rtl">[correction in today's problem]</span>  
   → a closed older problem with the same number is not changed
7. [page] <span dir="rtl">[why line after any correction]</span>  
   → never empty quotes «[اصلاحِ پیامِ قبلی] «» ⇐ «»»
8. [page] <span dir="rtl">[after one ✏️]</span>  
   → the same change line never appears two or three times
9. [page] <span dir="rtl">[statement and lesson after one correction]</span>  
   → the lesson arrow is never reversed («old ⇐ new») while the statement shows «new ⇐ old»
10. [chat] <span dir="rtl">[copy ask after «۱۸ هفته … عروسی ۱۵ اسفند»] ‖ U: بله</span>  
   → «بله» never writes ۱۵ into «۱۶ هفته» nor into «کل در یک جمله»
11. [page] <span dir="rtl">[after «صفحه ۸ در ۸ بود»]</span>  
   → a value not derived from the side (the deadline date, her name) is not marked stale
12. [chat] <span dir="rtl">U: ۱۲ نفر بودیم ولی ۱۵ صندلی داریم</span>  
   → two different quantities, no correction; neither replaced
13. [edit] <span dir="rtl">[✏️ ۱۲⇐۱۵ where «۱۲» also appears in «ساعت ۱۲»]</span>  
   → only the people count changes, or the page asks which; the clock time «ساعت ۱۲» is not silently changed

## R4.opening_classification · opening and classification (self-introduction openings are problems; stuck vs use report; silence keeps the coach block; practice report with a solution ⇒ coach; next-step question ≠ unknown; age self-label; her check ≠ guess; confidence only when given)


### Positive

1. [chat] <span dir="rtl">U: سلام من کیانم ۹ سالمه. ۱۲ تا مداد رو بین ۳ نفر تقسیم کنیم هر کی چند تا میگیره؟</span> — _context:_ <span dir="rtl">child 9</span>  
   → a problem from turn one: route lla_coach; «# پیش‌نیاز» present; title «۱۲ مداد بینِ ۳ نفر» without greeting/name/age; no «هنوز مسئله نیست»
2. [chat] <span dir="rtl">U: سارام کلاس دهم، این سواله رو نمی‌فهمم: دو عدد جمعشون ۲۰ ضربشون ۹۶</span> — _context:_ <span dir="rtl">teen 16, ZWNJ missing</span>  
   → chat statement stripped of «سارام کلاس دهم»; title = the problem; same stripping as «پروندهٔ تازه»
3. [chat] <span dir="rtl">U: با سلام، اینجانب احمدی هستم، ۷۲ سال دارم. می‌خواستم بدانم پس‌انداز ۵۰۰ میلیونی با سود ۲۰٪ پس از سه سال چه می‌شود.</span> — _context:_ <span dir="rtl">elder 72, formal</span>  
   → problem from turn one; lla_coach; the session dossier does not count the greeting as «مسئلهٔ ۱»
4. [chat] <span dir="rtl">U: خب ۳.۲ رو که تو همون قطر کف به کار بردم، ۱.۸ رو هم. دیگه نمی‌دونم چی کار کنم.</span> — _context:_ <span dir="rtl">A24-1 shape</span>  
   → a stuck, not a use report: the stuck question (e.g. «از خواسته به عقب») is asked
5. [chat] <span dir="rtl">U: ...</span> — _context:_ <span dir="rtl">A24-2 regression</span>  
   → the «# مربیِ حل» block and the silence rule stay in the prompt
6. [chat] <span dir="rtl">U: چند روز دیر شد. امروز مدخلِ «۱۵ ذرع کرباس» رو با همون روش حل کردم. درسته؟</span> — _context:_ <span dir="rtl">D24-13 regression</span>  
   → practice report with a new solution ⇒ lla_coach (not lla_assistant)
7. [chat] <span dir="rtl">U: پیر شدم، مغزم دیگه مثلِ قدیم کار نمی‌کنه</span> — _context:_ <span dir="rtl">elder 81</span>  
   → read as an ability self-label; a page line says the stuck came from the missing datum (e.g. blade width), not age; route stays coach
8. [chat] <span dir="rtl">U: x²−9 = (x−3)(x+3). درسته؟ با ضرب هم چک کردم</span> — _context:_ <span dir="rtl">teen</span>  
   → her own reported check is recorded as a check, not «همین پیام حدس است … چطور می‌آزمایی‌اش؟»
9. [chat] <span dir="rtl">U: هشتاد درصد مطمئنم جواب «ج» است</span>  
   → prediction booked with confidence 80
10. [chat] <span dir="rtl">U: بعدش چی کار کنم؟</span>  
   → a next-step question, not «unknown named»; the turn question is still produced

### Negative (look-alike)

1. [chat] <span dir="rtl">U: فکر کنم ج رو انتخاب می‌کنم</span> — _context:_ <span dir="rtl">A24-8 shape</span>  
   → no confidence booked; the e1 confidence question is not skipped as «already said»
2. [chat] <span dir="rtl">U: سلام من مینام ۱۳ سالمه، می‌خواستم بپرسم ۲ به توانِ ۱۰ چند میشه؟</span> — _context:_ <span dir="rtl">teen 13</span>  
   → an opening never gets the «# اصلاحِ پیامِ پیشین (شاید)» block
3. [chat] <span dir="rtl">U: سلام، من مریمم</span>  
   → greeting only ⇒ no problem detected; no «مسئلهٔ ۱» in the session dossier
4. [chat] <span dir="rtl">U: امروز روشِ «کار از آخر» رو به کار بردم و جواب داد</span>  
   → a real use report (no stuck words) ⇒ use, not stuck
5. [chat] <span dir="rtl">U: پیر شدم دیگه، نوه‌م امسال رفت دانشگاه</span> — _context:_ <span dir="rtl">elder</span>  
   → not an ability self-label (no claim about thinking); no «این کم‌هوشی نیست» line
6. [chat] <span dir="rtl">U: حدس می‌زنم x=3 باشه</span>  
   → a guess (no check reported) ⇒ booked as a guess
7. [chat] <span dir="rtl">U: می‌شه چک کنی ببینی درسته؟</span>  
   → a request to check is not her own check
8. [chat] <span dir="rtl">U: مجهولش چیه اصلاً؟</span> — _context:_ <span dir="rtl">child 10</span>  
   → she asks what the unknown is ⇒ not «unknown named»
9. [chat] <span dir="rtl">U: امروز وقت نکردم تمرین کنم</span>  
   → no new solution ⇒ not routed as a solved practice report; no «حل شد»

## R5.age_register · age and register surfaces (one Jalali-only birth confirmation; no ISO to a person; page parse wins; card forms; age in words; register from verbs only; minors' puzzle/no-norm line; school name not kept)


### Positive

1. [page] <span dir="rtl">[birth card] ۱۲ اردیبهشت ۱۳۳۸</span> — _context:_ <span dir="rtl">elder, «شما»</span>  
   → stored 1959-05-03; exactly ONE confirmation «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸» with no Gregorian/ISO in brackets; age = full years at D0; band elder
2. [chat] <span dir="rtl">U: ۵ تیر ۱۳۲۴ به دنیا اومدم ‖ [model also sends {"do":"birth"}]</span> — _context:_ <span dir="rtl">elder 81</span>  
   → page + model save ⇒ still one confirmation line; stored 1945-06-26
3. [page] <span dir="rtl">[birth card] 96/2/30</span> — _context:_ <span dir="rtl">child</span>  
   → two-digit Jalali year accepted ⇒ 1396/02/30 = 2017-05-20; child band
4. [page] <span dir="rtl">[birth card] ۱۷ اسفند ‖ [card asks for the year] 88</span> — _context:_ <span dir="rtl">teen</span>  
   → the day typed in the card is kept; «88» ⇒ ۱۳۸۸ ⇒ 1388/12/17 = 2010-03-08
5. [page] <span dir="rtl">[birth card] 17 Esfand 1388</span> — _context:_ <span dir="rtl">teen, Latin script</span>  
   → Finglish month accepted ⇒ 2010-03-08
6. [chat] <span dir="rtl">U: هشتاد و یک سالمه</span> — _context:_ <span dir="rtl">elder</span>  
   → age in words read ⇒ 81, elder; «# مخاطب» never says «ممکن است کم‌سال باشد»; no date invented
7. [page] <span dir="rtl">[mind-card date field] ۱۳۲۴/۴/۵۱</span> — _context:_ <span dir="rtl">elder 81, «شما»</span>  
   → not saved AND a visible human error («روز ۵۱ نداریم؛ لطفاً روز را دوباره ببینید»)
8. [prompt] <span dir="rtl">U: ۸۲ سالمه (no date given)</span>  
   → «# مخاطب» elder block WITHOUT «از تاریخِ تولدِ ثبت‌شده»
9. [page] <span dir="rtl">[page lines for an 81-year-old «شما» user: card, system lines, turn questions, card error]</span>  
   → all «شما»: «تاریخِ تولدتان»، «سلیقه‌تان»، «روز را دوباره ببینید»; no «تو» form
10. [chat] <span dir="rtl">U: لطفاً اینو ثبتش کن</span> — _context:_ <span dir="rtl">elder 82</span>  
   → an imperative to the machine is not a «تو» sign; the post-check does not force «تو» on the elder after six «شما» turns
11. [page] <span dir="rtl">[Today and mind card for a 9-year-old]</span> — _context:_ <span dir="rtl">child 9</span>  
   → no adult-normed puzzle (no MaRs-IB «مقایسهٔ منصفانه با آن‌ها»); mind card «برای این سن هنجارِ معتبر در دست نیست»
12. [events] <span dir="rtl">U: من کلاس هشتمِ مدرسه‌ی شهید بهشتی‌ام</span> — _context:_ <span dir="rtl">teen 14</span>  
   → dossier keeps the grade, not the school name verbatim
13. [chat] <span dir="rtl">U: پیش‌بینی می‌کنم تا شنبه‌ی بعد تموم شه</span>  
   → 🎯 «موعد: شنبه <Jalali date of the first Saturday after D0>» — computed from the test clock, shown in Persian; never «۲۰۲۶-…» ISO

### Negative (look-alike)

1. [events] <span dir="rtl">[page parsed «۱۲ اردیبهشت ۱۳۳۸» = 1959-05-03] ‖ [model {"do":"birth","date":"1959-05-02"}]</span>  
   → the page's parse is kept; the model ISO never silently overrides it
2. [chat] <span dir="rtl">U: بذار ببینم چی میشه</span> — _context:_ <span dir="rtl">elder</span>  
   → «ببینم» is not a «تو» sign; an elder «شما» register is unchanged
3. [chat] <span dir="rtl">U: روتینِ صبحم به هم ریخته</span> — _context:_ <span dir="rtl">adult «تو»</span>  
   → the noun «روتین» is not a «شما» sign
4. [page] <span dir="rtl">[birth card] ۳۰ اسفند ۱۳۸۸</span> — _context:_ <span dir="rtl">teen</span>  
   → refused with a human line («اسفندِ ۱۳۸۸ ۲۹ روز دارد») in her register; nothing saved
5. [page] <span dir="rtl">[mind card for a 35-year-old]</span> — _context:_ <span dir="rtl">adult</span>  
   → the 30–39 comparison with its source IS shown (no-norm line only where no valid norm exists)
6. [chat] <span dir="rtl">U: لطفاً با من راحت باش، «تو» صدام کن</span> — _context:_ <span dir="rtl">elder 67</span>  
   → after an explicit request, «تو» is right for this elder
7. [chat] <span dir="rtl">U: ۸۱ کیلو وزنمه</span>  
   → not an age
8. [chat] <span dir="rtl">U: این خونه هشتاد و یک سال پیش ساخته شده</span>  
   → not her age
9. [chat] <span dir="rtl">U: لطفاً بگو چی کار کنم (adult, «تو» elsewhere)</span> — _context:_ <span dir="rtl">adult 30</span>  
   → «لطفاً» alone does not switch to «شما»
10. [page] <span dir="rtl">[confirmation for a child]</span> — _context:_ <span dir="rtl">child 9</span>  
   → no Latin ISO run inside the child's chat; Jalali only

## R6.postcheck_calibration · post-check calibration (pos = must PASS without rewrite; neg = must still be CAUGHT)


### Positive

1. [prompt] <span dir="rtl">[page's own turn question: «با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟»]</span> — _context:_ <span dir="rtl">pass = no rewrite</span>  
   → counted as ONE question; no «دو پرسش» rewrite
2. [prompt] <span dir="rtl">[reply: «گفتی هر دومینو «دو خانهٔ مجاور را می‌پوشاند»…» where the quoted phrase is the assistant's own earlier wording]</span>  
   → the assistant's own «…» phrase is not treated as a quote of her; no rewrite
3. [chat] <span dir="rtl">U: خب برگردیم به همون سکه‌ها که گیر کرده بودیم</span> — _context:_ <span dir="rtl">child 9</span>  
   → a natural return to the waiting step accepted; no heavy template demanded
4. [chat] <span dir="rtl">U: این برنامه داده‌هامو کجا نگه می‌داره؟</span> — _context:_ <span dir="rtl">owner-like adult</span>  
   → no «خودت فکر می‌کنی چرا؟» on a question about the system; answered from the system map
5. [prompt] <span dir="rtl">[she reported «با جای‌گذاری چک کردم، درست درومد» one turn earlier]</span> — _context:_ <span dir="rtl">elder 82</span>  
   → no «جواب را در شرط جای‌گذاری کن» in the next turn question
6. [prompt] <span dir="rtl">[page composite question «طرحت چیست و از کدام داده شروع می‌کنی؟»]</span>  
   → one question
7. [prompt] <span dir="rtl">[reply quotes her two consecutive messages joined]</span>  
   → accepted when both parts are her consecutive words
8. [chat] <span dir="rtl">U: برگشتم سرِ همون گامِ دوم که منتظر بودیم</span> — _context:_ <span dir="rtl">adult</span>  
   → accepted return; no rewrite

### Negative (look-alike)

1. [prompt] <span dir="rtl">[model reply: «چند تا داری؟ چرا این‌طوری حساب کردی؟»]</span> — _context:_ <span dir="rtl">catch = rewrite</span>  
   → two independent questions ⇒ still caught
2. [prompt] <span dir="rtl">[reply: «گفتی «همه‌اش غلطه»» — she never wrote it]</span>  
   → fabricated quote still caught
3. [prompt] <span dir="rtl">[return reply that moves to a different step than the waiting one]</span>  
   → caught
4. [prompt] <span dir="rtl">[reply gives a child the full next step]</span> — _context:_ <span dir="rtl">child 9</span>  
   → caught (child: ask, not tell)
5. [prompt] <span dir="rtl">[reply with «تو» to an elder «شما» user]</span> — _context:_ <span dir="rtl">elder</span>  
   → caught
6. [prompt] <span dir="rtl">[reply asks for a check she reported in THIS message]</span>  
   → caught
7. [prompt] <span dir="rtl">[reply writes «1959-05-03» to the person]</span>  
   → caught (never ISO to a person)
8. [prompt] <span dir="rtl">[reply with «خودت فکر می‌کنی چرا؟» to a math stuck where it fits]</span>  
   → allowed on her problem (not suppressed)

## R7.today_dossier_promises · today, dossier, mind card, promises


### Positive

1. [chat] <span dir="rtl">U: میان‌ترم رو ۱۴ گرفتم</span> — _context:_ <span dir="rtl">exam deadline was three days before D0</span>  
   → deadline_done; Today no longer «امتحانش را دادی؟ چطور شد؟»
2. [chat] <span dir="rtl">U: حدسم ۲۵۰۰ بود ‖ U: آره چون ۵۰ در ۵۰ میشه ۲۵۰۰</span>  
   → the guess gets outcome «تأیید شد/موجه شد» in her words
3. [chat] <span dir="rtl">U: فکر می‌کردم یه بار خوندن بسه ‖ U: ولی ۱۹ از ۲۰ گرفتم وقتی دو بار خوندم و بار اول ۱۲</span> — _context:_ <span dir="rtl">teen</span>  
   → guess outcome «رد شد» recorded
4. [chat] <span dir="rtl">U: به نظرم چهار تا بسه … نه، از یه تخته‌ی ۲۴۰ درنمیاد، پنج تا</span> — _context:_ <span dir="rtl">elder 81</span>  
   → the guess refuted in the same message gets outcome «رد شد»; 🧭 never «آزموده نشده»
5. [chat] <span dir="rtl">U: اینو یه جا بنویس که فردا یادم بیاد بقیه‌شو حساب کنیم</span>  
   → left unfulfilled this turn ⇒ promise with HER request text; returns in Today on D0+1
6. [chat] <span dir="rtl">U: پیش‌بینی: صفر یا یک، ۷۰ درصد</span>  
   → exactly one 🎯 record (page and form follow-up merge); calibration counts it once
7. [chat] <span dir="rtl">U: فکر کنم این برای هر n فرد هم درسته، بذار امتحان کنم</span>  
   → the look-back conjecture she is testing becomes a live problem (coach has a problem in play)
8. [page] <span dir="rtl">[🧭 after the problem is solved]</span>  
   → never «مانده: طرح هنوز نیست · ۰ مرحله از ۴»
9. [page] <span dir="rtl">[route map after a detour problem in the session]</span>  
   → every session event bound to its own problem; the decision problem shows no guess «۱۰۰» from another one
10. [chat] <span dir="rtl">U: تا شنبه‌ی بعد باید تحویلش بدم</span>  
   → deadline = the first Saturday after D0 (computed from the test clock); shown as a Jalali date

### Negative (look-alike)

1. [chat] <span dir="rtl">U: کتاب‌ها رو به ترتیب بخونم. خوبه؟ [model when = some date]</span>  
   → not stored as a plan; the model `when` without her words is rejected
2. [chat] <span dir="rtl">U: اینا رو یه جا نگه دار که یادم نره ‖ [same turn: two list_add done]</span>  
   → fulfilled ⇒ no promise
3. [page] <span dir="rtl">[any promise]</span>  
   → its text is never the assistant's own question («پاسخ به «…؟»»)
4. [chat] <span dir="rtl">U: هنوز امتحانو ندادم، هفته‌ی بعده</span>  
   → no deadline_done
5. [events] <span dir="rtl">U: حدسم ۱۲ه (never tested later)</span>  
   → «آزموده نشده» is right
6. [page] <span dir="rtl">[one stuck recorded once]</span>  
   → mind card lists it once, never three times
7. [page] <span dir="rtl">[follow-up after opening 🧭, a view with no fields]</span>  
   → never «فیلدهای این صفحه را پر کن»
8. [chat] <span dir="rtl">U: شاید یه الگو باشه، ولش کن</span>  
   → no live problem from an idle remark
9. [page] <span dir="rtl">[page «🔭 نگه داشتم: …» shown]</span>  
   → the assistant never says «ثبت نشده» in the same turn

## R8.prior_work · «کارِ پیشینِ من» (roadmap §21: long first message with problem, idea and prior steps ⇒ verdict per step, resume at the first non-✓ step, dependents marked, nothing re-asked, nothing rewritten without her yes, honest boundary, multi-facet order)


### Positive

1. [chat] <span dir="rtl">U: می‌خوام بدونم کابلِ ۲.۵ برای کولرِ ۳۵۰۰ واتی کافیه یا نه. ایده‌م اینه که جریان رو حساب کنم و با جدول مقایسه کنم. گام ۱: P=V·I پس I=P/V. گام ۲: ۳۵۰۰ تقسیم بر ۲۲۰ میشه ۱۵.۹ میلی‌آمپر. گام ۳: با ضریبِ ۱.۲۵ برای راه‌اندازی میشه ۱۹.۹. گام ۴: جدول میگه کابلِ ۲.۵ تا ۲۰ آمپر رو می‌کشه، پس کافیه.</span> — _context:_ <span dir="rtl">adult, engineering</span>  
   → a «کارِ پیشینِ تو» section: گام ۱ ✓; گام ۲ ✗ unit (۱۵.۹ is right, but amperes, not milliamperes — page checks 3500/220 ≈ 15.9); گام ۳ number right (≈19.9) but «وابسته به گامِ ۲»; گام ۴ ناقص (margin 19.9 vs 20 too thin; length/installation method missing). Resume = گام ۲. گام ۱ never re-asked
2. [page] <span dir="rtl">[after the section above] ‖ U: آره درسته</span>  
   → only after her yes is گام ۲ written as «۱۵.۹ آمپر (اصلاح شد ⇐ میلی‌آمپر)»; گام ۳ dependency mark cleared/recomputed; nothing rewritten before the yes
3. [chat] <span dir="rtl">U: می‌خوام ثابت کنم برای هر n طبیعی، n³−n بر ۶ بخش‌پذیره. ایده‌م تجزیه‌ست. گام ۱: n³−n = (n−1)n(n+1). گام ۲: سه عدد متوالی‌ان پس یکی‌شون بر ۳ بخش‌پذیره. گام ۳: چون حاصل بر ۶ بخش‌پذیره پس بر ۲ هم بخش‌پذیره. گام ۴: بر ۲ و ۳ بخش‌پذیره پس بر ۶.</span> — _context:_ <span dir="rtl">teen 17, olympiad-style proof</span>  
   → گام ۱ ✓, گام ۲ ✓, گام ۳ ✗ (assumes what is to be proved; why + where; hint: among two consecutive numbers one is even), گام ۴ «وابسته به گامِ ۳». Resume = گام ۳; steps 1–2 never re-asked; stage from verdicts = اجرا (not «بازنگری» from the last sentence); formulas displayed properly
4. [chat] <span dir="rtl">U: بین سه تا کار موندم. الف: ۴۰ میلیون، ۱۰ دقیقه راه. ب: ۵۵ میلیون، ۹۰ دقیقه راه. ج: ۴۸ میلیون، دورکاری. معیارهام حقوق و راهه. گام ۱: به حقوق وزن ۰.۶ دادم و به راه ۰.۴. گام ۲: به هر کدوم از ۱۰ نمره دادم و ب برنده شد.</span> — _context:_ <span dir="rtl">adult life decision</span>  
   → گام ۱ ناقص — the page asks whether an important criterion is missing (does NOT invent one for her); گام ۲ «نسنجیده» (her scores are value judgments; the model judges, the page only checks structure and quotes) — the honest boundary is said in the reply. Resume = گام ۱
5. [chat] <span dir="rtl">U: من ۱۰ سالمه. مامان ۲۴ تا شیرینی داشت، نصفشو به مهمونا داد، بعد ۳ تا خودش خورد. چند تا موند؟ اول نصفِ ۲۴ رو حساب کردم میشه ۱۲. بعد ۱۲ منهای ۳ میشه ۸. جوابم ۸.</span> — _context:_ <span dir="rtl">child 10</span>  
   → گام ۱ ✓ (said simply); گام ۲ ✗ (page computes 12−3 = 9); answer «۸» «وابسته به گامِ ۲». Resume at گام ۲ with a child-simple question (never gives «۹» outright); «# پیش‌نیاز» checks subtraction
6. [chat] <span dir="rtl">U: من کلاً استعدادِ ریاضی ندارم. یه جا خوندم آدم‌ها فقط ۱۰ درصدِ مغزشون رو استفاده می‌کنن. حالا این مسئله: یه مستطیل محیطش ۳۰ و طولش دو برابرِ عرضشه. عرض رو x گرفتم، پس طول 2x. محیط = 2(x+2x) = 6x پس x = 5.</span> — _context:_ <span dir="rtl">teen 15, colloquial, no ZWNJ in «مغزشون»</span>  
   → multi-facet tour with an order: the problem (steps ✓: x=5, 6x=30), the belief «استعداد ندارم» (self-label facet), the factual claim «۱۰ درصدِ مغز» (epistemic facet); each facet named; problem resumes at look-back (all steps ✓; answer: width 5, length 10)
7. [chat] <span dir="rtl">U: ایده‌ی یه دستگاه دارم که آبِ باران رو از ناودون جمع کنه و برای باغچه بده. گام ۱: حجم: سقفم ۸۰ متره، بارشِ سالانه ۲۵۰ میلی‌متر، پس ۲۰ مترمکعب. گام ۲: مخزنِ ۲ تُنی کافیه. گام ۳: باید ببینم قبلاً کسی ثبتش کرده یا نه، نمی‌دونم از کجا.</span> — _context:_ <span dir="rtl">adult invention</span>  
   → گام ۱ ✓ (page checks 80 m² × 0.25 m = 20 m³); گام ۲ ناقص (2 m³ holds a tenth of the year — depends on usage timing); گام ۳ needs a tool that does not exist ⇒ territory sheet «[دستیار · کمبودِ سامانه]» with gap.step = 3; step 3 ⏸; resume = گام ۲
8. [chat] <span dir="rtl">U: x^2-5x+6=0 رو حل کردم. گام1: delta=25-24=1. گام2: x=(5±1)/2 پس 3 و 2. میخواستم با تجزیه هم برم ولی نمیدونم چطوری</span> — _context:_ <span dir="rtl">teen 16, Latin digits, no ZWNJ</span>  
   → both steps ✓ (page checks delta and roots); nothing re-asked; resume = the open part «با تجزیه» (look-back / another method), stage from verdicts
9. [chat] <span dir="rtl">U: با سلام. سپردهٔ ۱۰۰ میلیونی با سودِ سالانهٔ ۲۰ درصد دارم. گام ۱: پایانِ سالِ اول ۱۲۰ میلیون. گام ۲: پایانِ سالِ دوم ۱۴۰. گام ۳: پایانِ سالِ سوم ۱۶۰. پس سه سال بعد ۱۶۰ میلیون دارم.</span> — _context:_ <span dir="rtl">elder 72, formal «شما»</span>  
   → گام ۱ ✓; گام ۲ cannot be judged until the kind of interest is known ⇒ the page asks in «شما» «سودِ شما ساده است یا مرکب؟»; if مرکب: گام ۲ ✗ (۱۴۴), گام ۳ ✗ and «وابسته به گامِ ۲» (۱۷۲.۸); if ساده: all ✓. Resume = گام ۲
10. [page] <span dir="rtl">[🧭, 🔭 forms and 📜 after any prior-work opening]</span>  
   → all show the «کارِ پیشینِ تو» section with each step's verdict (✓ / ناقص / نادرست / نسنجیده) and the dependency marks
11. [events] <span dir="rtl">[mind card after P2]</span>  
   → steps 1–2 credited to her (not «گیر»); step 3 has a cause (skill/prerequisite/unknown), not a blanket «فهمِ مسئله»
12. [chat] <span dir="rtl">[verdict گام ۳ ✗ on P2] ‖ U: نه، گام ۳ درسته چون حاصل‌ضربِ سه عدد متوالی همیشه زوجه</span> — _context:_ <span dir="rtl">teen 17</span>  
   → re-judged: her new reason is a valid argument (among consecutive numbers one is even) ⇒ گام ۳ rewritten only with her yes as «… چون یکی از دو عددِ متوالی زوج است»; neither caving without reason nor insisting
13. [time] <span dir="rtl">[D0: verdict on P2 rejected, she leaves] ‖ [D0+3: U: یه راهِ دیگه برای گامِ ۳ پیدا کردم: n(n+1) همیشه زوجه]</span> — _context:_ <span dir="rtl">owner-like persona, multi-day return</span>  
   → the prior section is remembered; the return resumes at گام ۳ with the new step judged; steps 1–2 not re-asked
14. [prompt] <span dir="rtl">[a 2,500-word first message with 7 steps]</span>  
   → the prompt carries all 7 prior steps (full reading); the budget never drops prior steps
15. [chat] <span dir="rtl">U: سلام. ۱۵۰ سانت = ۱.۵ متر. پس مساحت ۱.۵ در ۲ میشه ۳ مترمربع. گام بعدی رو نمی‌دونم</span> — _context:_ <span dir="rtl">adult</span>  
   → unit conversion ✓ and area ✓ (page checks); resume at the next step (not re-asking the data)
16. [prompt] <span dir="rtl">[model coach_state.prior with a quote using Persian digits; her text uses Latin digits]</span>  
   → the quote validates after digit normalisation

### Negative (look-alike)

1. [chat] <span dir="rtl">U: یه مسئله دارم: چطور هزینه‌ی سفرمونو کم کنیم؟ فکر می‌کنم باید زودتر بلیت بخریم.</span>  
   → problem + idea but no steps ⇒ no «کارِ پیشین» section with invented verdicts; normal stage
2. [chat] <span dir="rtl">U: (long story about her day, no problem)</span>  
   → no prior section
3. [chat] <span dir="rtl">U: اول مساحت رو حساب کردم، بعد تقسیم کردم، بعد گرد کردم، جوابم ۱۴ شد</span>  
   → no prior steps cut at commas by the page; only the model's `prior` items whose quotes are found in her text; each verdict justified
4. [prompt] <span dir="rtl">[model prior item quote «گام ۵: …» not in her text]</span>  
   → rejected; never shown
5. [prompt] <span dir="rtl">[model verdict ✓ on «۱۲ منهای ۳ میشه ۸»]</span> — _context:_ <span dir="rtl">child 10</span>  
   → the page's own arithmetic check overrides: shown as ✗ (or flagged), never ✓
6. [page] <span dir="rtl">[any verdict before her answer to «درست است؟»]</span>  
   → none of her steps is rewritten
7. [chat] <span dir="rtl">[verdict ✗ on P1 گام ۲] ‖ U: نه اشتباه نکردم!</span>  
   → without a reason, the verdict is re-checked and kept with evidence (۳۵۰۰÷۲۲۰ is in amperes), not withdrawn to please her
8. [events] <span dir="rtl">[mind card after P4]</span> — _context:_ <span dir="rtl">child 10</span>  
   → her correct step 1 is never counted as a stuck
9. [page] <span dir="rtl">[P1 step 2 result «۱۵.۹»]</span>  
   → a sub-result in prior work never moves the whole problem to «بازنگری»
10. [chat] <span dir="rtl">[all prior steps ✓ and a complete answer]</span>  
   → the unknown/data are never re-asked; resume = look-back
11. [chat] <span dir="rtl">U: ۱۵۰ سانت = ۱.۵ متر (correct conversion)</span>  
   → the page never flags a correct unit conversion as wrong
12. [page] <span dir="rtl">[non-numeric step in P3]</span>  
   → the page never claims it verified a value judgment; verdict «نسنجیده» or model-judged with the boundary said
