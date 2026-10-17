# VARIANTS_R19c — independent variant bank (round 19c, longitudinal techniques)

Written from DECISIONS_R19c + LONGITUDINAL_AUDIT (technique list and each technique's own time prescription) only; no source code was read. Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = day 0 = 2026-10-17 (Saturday; ۱۴۰۵/۰۷/۲۵). Day table: d1 10-18 Sun, d2 10-19 Mon, d3 10-20 Tue, d4 10-21 Wed, d5 10-22 Thu, d6 10-23 Fri, d7 10-24 Sat, d9 10-26 Mon, d10 10-27 Tue, d11 10-28 Wed, d12 10-29 Thu, d14 10-31 Sat, d15 11-01 Sun, d17 11-03 Tue, d20 11-06 Fri, d21 11-07 Sat, d22 11-08 Sun, d30 11-16 Mon, d50 12-06 Sun.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Entries are TIME-SHAPED: simulated days separated by « ‖ » («روز n: …»; U = user, A = assistant, «[سامانه: …]» = a page action). Interval policies come from each technique's own text: T42 1 → 6 → ×2.5; T41 1/3/7 + weekly blank page; T31 2–7 days; T28 1 day and 1 week; T4 3 and 7 days; T26/T38 day+1; T23 retest +1 day, trend every 3–5 cycles; T21 1 day–4 weeks, ≤2 open, ≥3 experiments over ≥14 days; T22 weekly belief + verdict after observation; T24 daily, review at ≥50 resolved; T3/T9/T15/T34 monthly (T15 also on a major event); T16 weekly, admit after 3 real uses; T30 weekly 20-min walk; T35 weekly + on new data; T10 the user's own recheck date; T39 at the 3rd recurrence + monthly. Machine-readable copy: VARIANTS_R19c.json (fields rc, kind, role, text, expect, context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| LT1.sched | 11 | 9 |
| LT2.case | 10 | 8 |
| LT3.stable | 10 | 9 |
| LT4.mind | 9 | 8 |
| LT5.one | 8 | 8 |
| LT6.link | 9 | 8 |
| LT7.list | 9 | 9 |
| LT8.clock | 9 | 8 |
| **total** | 75 | 67 |

## Coverage

Longitudinal techniques (16): T3 (LT1, LT7), T9 (LT1, LT5), T10 (LT7), T15 (LT7), T16 (LT3, LT6, LT7), T21 (LT1–LT3, LT5, LT6, LT8), T22 (LT1–LT6), T23 (LT1–LT3), T24 (LT1, LT3–LT5, LT8), T30 (LT2, LT6), T31 (LT1–LT3, LT7), T34 (LT7), T35 (LT7), T39 (LT3, LT6), T41 (LT1–LT6, LT8), T42 (LT1, LT3, LT5, LT6, LT8). Redo techniques also exercised: T4, T26, T28. Running lists of LT7: T15 assumptions register, T16 models shelf, T31/T34 mistakes folder, T35 open ambiguities, T3 Pareto tracker, T10 signal-vs-noise log. Start points: live problem, epistemic case, knot, course, assistant, free.

## LT1.sched · one scheduler: Today + reminders, interval policy from each technique's own text

### Positive

1. [days] <span dir="rtl">روز ۰: نگار کارتِ «مشتقِ sin x چیست؟» را از برگهٔ T42 می‌سازد ‖ روز ۱: مرور، نمره «خوب» ‖ روز ۷: مرور، نمره «خوب»</span> — _context:_ Negar, calculus, T42  
   → Today shows the card on day 1 (2026-10-18 Sun); after the day-1 grade the next due is day 7 (2026-10-24 Sat) — T42's own «۱ روز، ۶ روز» — and the «cards:review» reminder payload is re-synced to 2026-10-24 immediately after grading; after the day-7 grade the next due is ≈×2.5 → 15 days → 2026-11-08 Sun. One A.SCHED entry per card at any time.
2. [days] <span dir="rtl">روز ۰: کاوه «قضیهٔ باقیماندهٔ چینی» را می‌خواند و از صفحهٔ T41 «شروع چرخهٔ بازیابی» را می‌زند ‖ روز ۱: بازیابی ۶۰٪ ‖ روز ۳: ۷۵٪ ‖ روز ۷: ۹۰٪ + برگهٔ سفیدِ هفتگی</span> — _context:_ Kaveh, number theory, T41  
   → Today has a T41 retrieval line on exactly day 1 (10-18), day 3 (10-20) and day 7 (10-24) — the technique's own 1/3/7 — and the weekly blank page on day 7 (10-24) and again day 14 (10-31); one HOST.remind payload per due date, keyed to the practice case; nothing on days 2, 4, 5, 6
3. [days] <span dir="rtl">روز ۰: فرزانه در 🎯 پیش‌بینی می‌کند «تا ۱۰ روز دیگر از شرکت الف پیشنهادِ کار می‌رسد»، ۶۰٪، موعد ۲۰۲۶-۱۰-۲۷ ‖ روز ۱۰: Today را باز می‌کند ‖ روز ۱۲: هنوز نتیجه را ننوشته ‖ روز ۱۲: «نیامد» را ثبت می‌کند</span> — _context:_ Farzaneh, job decision, forecast  
   → The standalone fcast appears in Today on day 10 (2026-10-27) asking for the outcome (a31_tools' promise finally kept); on day 12 it is still there marked overdue since 10-27; after the outcome it leaves Today and its reminder is cancelled
4. [days] <span dir="rtl">روز ۰: علی زنجیرهٔ نگرانیِ ⛓ «اگر وام دیر بیاید ← اجاره عقب می‌افتد ← …» را با موعدِ بررسی ۵ روز بعد می‌سازد ‖ روز ۵: Today</span> — _context:_ Ali, money worry, wchain  
   → A wchain line is in Today on day 5 (2026-10-22 Thu) with its question; it was not there on days 0–4
5. [days] <span dir="rtl">روز ۰: رضا راهبردِ تازه «اول حالت‌های کوچک را جدول کن» را در برگهٔ T31 برای مسائلِ شمارشی می‌گذارد ‖ روز ۱: Today ‖ روز ۲: Today ‖ روز ۵: Today</span> — _context:_ Reza, combinatorics, T31  
   → T31's own window «۲ تا ۷ روز بعد»: no line on day 1; the «آیا راهبردِ تازه جواب داد؟» line appears from day 2 (10-19 Mon), still present day 5, and is marked overdue only after day 7 (10-24); one reminder at the window start, not one per day
6. [days] <span dir="rtl">روز ۰: سارا آزمونِ T21 «اگر صبح‌ها ۲۰ دقیقه مسئله حل کنم، تمرکزِ عصرم بهتر می‌شود» را با بازهٔ ۹ روز تعریف می‌کند ‖ روز ۰: از گرهٔ «حواس‌پرتی» یک kexp دیگر هم دارد ‖ روز ۹: Today</span> — _context:_ Sara, habit experiment, T21  
   → The T21 test is due on day 9 (2026-10-26 Mon) and shows in Today; the «آزمون‌های باز» view counts 2 open tests across sources (standalone T21 + knot kexp) against T21's own cap «حداکثر دو آزمون باز»
7. [days] <span dir="rtl">روز ۰: بهرام جدولِ عواملِ کلیدیِ T3 «کدام ۲۰٪ مشتری‌ها ۸۰٪ درآمد را می‌سازند» را می‌سازد ‖ روز ۷ ‖ روز ۲۱ ‖ روز ۳۰</span> — _context:_ Bahram, small business, T3  
   → Only one dated line: the monthly review «بازبینیِ ماهانه با داده واقعی» on day 30 (2026-11-16 Mon); nothing on days 7 or 21 (no copied 1/3/7/21/60)
8. [days] <span dir="rtl">روز ۰: لیلا آزمونکِ T23 «قواعدِ لگاریتم» را می‌دهد (۶/۱۰) ‖ روز ۱: بازآزمایی ۸/۱۰ ‖ روز ۲: چرخهٔ دوم ‖ روز ۳: بازآزمایی ‖ روز ۴: چرخهٔ سوم ‖ روز ۵: بازآزمایی</span> — _context:_ Leila, logarithms, T23  
   → Each quiz schedules its own retest one day later (day 1 = 10-18, day 3 = 10-20, day 5 = 10-22); after the third completed cycle (day 5) a «مرورِ روند» line appears (T23: every 3–5 cycles) showing 6→8, …
9. [days] <span dir="rtl">روز ۰: نگار کارتِ «قاعدهٔ زنجیره‌ای» دارد با موعدِ روز ۱ ‖ روزهای ۱ تا ۳: برنامه را باز نمی‌کند ‖ روز ۴: مرور، «خوب»</span> — _context:_ Negar, calculus, T42 late return  
   → On day 4 (10-21) the card is in Today as overdue since 2026-10-18; exactly one reminder was sent for that due (not one per missed day); after grading, the next due is counted from the actual review day: day 4 + 6 = day 10 (2026-10-27)
10. [days] <span dir="rtl">روز ۰: مهسا در گرهٔ «عجله در خواندنِ صورتِ مسئله» یک آزمایشِ kexp با موعدِ ۵ روز می‌گذارد ‖ روز ۵: Today</span> — _context:_ Mahsa, reading-the-problem knot, wrapped scheduler  
   → The existing knot scheduler now registers through A.SCHED: Today on day 5 (10-22) shows exactly one line for that kexp, with the knot's name and the reason; its reminder key is the same one A.SCHED holds
11. [days] <span dir="rtl">روز ۰: پویا باورِ «بدونِ ارشد پیشرفت نمی‌کنم» را با T22 به‌عنوانِ «باورِ مقدسِ این هفته» می‌آزماید ‖ روز ۷ ‖ روز ۱۴</span> — _context:_ Pouya, career belief, T22  
   → T22 «هفته‌ای یک باور مقدس»: a weekly cue on day 7 (10-24) and day 14 (10-31) for the next belief; the open case's own observation due (if set) is a separate dated line, never merged into the weekly cue

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: کارتِ T42 «انتگرالِ جزءبه‌جزء» ‖ روز ۱: مرور «خوب»</span> — _context:_ Negar, T42 text-vs-code mismatch  
   → Next due must NOT be day 4 (2026-10-21, a 3-day interval); it is day 7 (2026-10-24) per T42's text «۶ روز»
2. [days] <span dir="rtl">روز ۰: در مسئلهٔ زندهٔ «۲۰ پله» گامِ «اگر n=۳ باشد ۳ راه» با پیش‌بینی ۷۰٪ و موعدِ فردا ثبت می‌شود (که خودش یک fcast هم می‌سازد) ‖ روز ۱: Today</span> — _context:_ Kaveh, live problem, double wrapper  
   → Exactly ONE Today line for that step on day 1 — not one from the live-step wrapper and another from the fcast wrapper
3. [days] <span dir="rtl">روز ۰: پرونده T22 پویا باز است با مشاهده‌ی موعدِ روز ۵ ‖ روز ۵: مشاهده ثبت و پرونده «بسته — رد شد» ‖ روز ۷</span> — _context:_ Pouya, closed case  
   → No reminder and no Today line for this closed case on day 7 or after (the weekly «new belief» cue may appear, but nothing names the closed case)
4. [days] <span dir="rtl">روز ۰: مریم برگهٔ T28 «توضیحِ مشتق برای خواهرم» ‖ روز ۱: «مکث — سفر کاری» ‖ روز ۷ ‖ روز ۱۰: «ادامه»</span> — _context:_ Maryam, T28 pause/resume  
   → No Today line and no reminder on days 1–9 while paused (the day-1 and day-7 rewrites are not shown as overdue); after resume on day 10 the rewrites are rescheduled from day 10 (day 11 = 10-28, day 17 = 11-03)
5. [days] <span dir="rtl">روز ۰: بهرام جدولِ T3 ‖ روز ۱ ‖ روز ۳ ‖ روز ۷</span> — _context:_ Bahram, T3  
   → No T3 line on days 1, 3, 7 — the generic 1/3/7/21/60 table must not be applied to a monthly technique
6. [days] <span dir="rtl">روز ۰: رضا راهبردِ T31 ‖ روز ۱: Today</span> — _context:_ Reza, T31 window start  
   → No «آیا جواب داد؟» line on day 1 (T31's window starts at 2 days)
7. [days] <span dir="rtl">روز ۰: کارتِ T42 ‖ روز ۱: مرور «خوب» ‖ (همان روز) گوشی را نگاه می‌کند</span> — _context:_ Negar, stale push reminder  
   → The phone reminder must NOT still say 2026-10-18 after the grade (stale cards:review payload); it now says 2026-10-24
8. [days] <span dir="rtl">روز ۰: فرزانه برگهٔ T9 را دو بار ذخیره می‌کند (ویرایشِ عدد) ‖ روز ۳۰</span> — _context:_ Farzaneh, same-day double save  
   → Two saves on the same day create ONE scheduled due, not two Today lines on day 30
9. [days] <span dir="rtl">روز ۰ تا ۳۰: آرش هر روز ۳ تا ۵ پیش‌بینیِ T24 می‌نویسد؛ تا روز ۳۰، ۴۱ تا داوری شده</span> — _context:_ Arash, T24 threshold  
   → No «۵۰ موردِ داوری‌شده ← مرورِ ماهانه» prompt on day 30 (only 41 resolved); it appears the day the 50th is resolved, not on the calendar month alone

## LT2.case · one open practice case per (technique × subject); create-or-continue, pause/resume

### Positive

1. [days] <span dir="rtl">روز ۰: مریم با T28 «مشتق چیست؟» را برای خواهرش می‌نویسد ‖ روز ۱: بازنویسیِ بدونِ منبع ‖ روز ۷: بازنویسیِ دوم</span> — _context:_ Maryam, calculus, T28  
   → ONE practice case (T28 × «مشتق») with 3 dated sessions; each rewrite is a version comparable with the previous (jargon count, length); next due after day 0 = day 1 (10-18), after day 1 = day 7 (10-24) — T28's own «۱ روز و ۱ هفته»; state open → stabilising
2. [days] <span dir="rtl">روز ۰: کاوه در صفحهٔ مسئلهٔ زندهٔ «به چند طریق از ۲۰ پله با گامِ ۱ یا ۲؟» دکمهٔ «تمرینِ T21» را می‌زند و حدس «فیبوناچی است» را آزمونی می‌کند ‖ روز ۱: دوباره از کتابخانه برگهٔ T21 را برای همین مسئله ذخیره می‌کند</span> — _context:_ Kaveh, live problem, T21  
   → The case is created on day 0 with subject = that live problem; the day-1 library save CONTINUES the same case (session 2), not a second case
3. [days] <span dir="rtl">روز ۰: پویا از پروندهٔ معرفتیِ «مهاجرت یعنی موفقیتِ شغلی» T22 را شروع می‌کند ‖ روز ۸: مشاهده «دو همکارِ مهاجر هنوز کار پیدا نکرده‌اند»</span> — _context:_ Pouya, emigration belief, T22  
   → Practice case T22 with subject = that epistemic case; session 2 on day 8 (10-25) holds the observation; the case appears inside the epistemic case
4. [days] <span dir="rtl">روز ۰: مهسا از گرهٔ «عجله در خواندنِ صورتِ مسئله» T23 را شروع می‌کند ‖ روز ۱: بازآزمایی</span> — _context:_ Mahsa, knot, T23  
   → Case subject = the knot (kind knot); the worksheet's ex carries the case id; day-1 retest is session 2 of the same case
5. [chat+days] <span dir="rtl">روز ۰: U: بیا برای قضیهٔ فیثاغورس یه برنامهٔ بازیابی بچینیم ‖ A: یک چرخهٔ بازیابیِ ۱، ۳ و ۷ روزه برای «فیثاغورس» شروع کنم؟ ‖ U: آره ‖ [سامانه: start_practice] ‖ روز ۱: Today</span> — _context:_ Hoda, geometry, T41 via assistant  
   → The assistant action start_practice creates ONE T41 case (subject = topic «فیثاغورس», source = assistant) only after her «آره»; day 1 (10-18) shows its retrieval line
6. [days] <span dir="rtl">روز ۰: لیلا درسِ T4 دوره را می‌بندد و نقشهٔ ساختاریِ «تابعِ نمایی» را می‌کشد ‖ روز ۳: بازکشیدن از حافظه ‖ روز ۷: بازکشیدن</span> — _context:_ Leila, exponentials, T4 via course  
   → Case T4 × «تابع نمایی» started from the course; redraws on day 3 (10-20) and day 7 (10-24) — T4's own «پس از ۳ و ۷ روز», not the card's 1-then-3 — stored as versions and diffed against map 1
7. [days] <span dir="rtl">روز ۰: رضا راهبردِ T31 ‖ روز ۲: «مکث — بیمارستان» ‖ روز ۹: «ادامه»</span> — _context:_ Reza, T31 pause/resume  
   → State open → paused (day 2, reason kept) → open (day 9); the return window is recomputed from day 9: line from day 11 (10-28) to day 16 (11-02); history keeps both transitions with dates
8. [days] <span dir="rtl">روز ۰: نیما نمودارِ T26 «چرخهٔ آب» را می‌کشد (بازکشیدن موعدِ روز ۱) ‖ روز ۲۰: بالاخره از حافظه می‌کشد</span> — _context:_ Nima, science teaching, T26 late return  
   → Session 2 is logged on its real date (11-06) with «۱۹ روز دیرتر از موعد»; it is NOT recorded as a day+1 redraw; the case stays open
9. [days] <span dir="rtl">روز ۰: هدی T41 روی «فیثاغورس» و T28 روی «فیثاغورس» ‖ روز ۰: T41 روی «اتحادهای مثلثاتی»</span> — _context:_ Hoda, case key  
   → Three distinct cases — key is (technique × subject): T41×فیثاغورس, T28×فیثاغورس, T41×اتحادها
10. [days] <span dir="rtl">روز ۰: سمیرا یادداشت‌های T30 بعد از جلسهٔ «آمارِ بیزی» (موضوعِ آزاد) ‖ روز ۷: گشت‌وگذارِ ۲۰ دقیقه‌ای ‖ روز ۱۴: گشت‌وگذار</span> — _context:_ Samira, Bayesian stats, T30  
   → One T30 case (subject free/topic) with the weekly 20-min walk due on day 7 (10-24) and day 14 (10-31); each walk is a session

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: مریم برگهٔ T28 ‖ روز ۱: از صفحهٔ کتابخانه «شروع تمرین» T28 روی «مشتق»</span> — _context:_ Maryam, duplicate case  
   → NO new unlinked ex/case; it opens the existing case and adds session 2
2. [chat+days] <span dir="rtl">روز ۰: کاوه T21 را از صفحهٔ مسئلهٔ «۲۰ پله» شروع کرده ‖ روز ۲: U: یه آزمون برای حدسِ فیبوناچی بذار ‖ [سامانه: start_practice]</span> — _context:_ Kaveh, assistant path duplicate  
   → No second case — start_practice finds the open T21 case for that problem and continues it
3. [days] <span dir="rtl">روز ۰: پویا پروندهٔ T22 را بست ‖ روز ۴۰: فقط صفحهٔ T22 را باز می‌کند و می‌خواند</span> — _context:_ Pouya, view is not a session  
   → Viewing adds no session and does not reopen the closed case
4. [days] <span dir="rtl">روز ۰: لیلا برگهٔ T23 را نیمه‌کاره (پیش‌نویس) رها می‌کند</span> — _context:_ Leila, draft  
   → A draft is not a completed session: no outcome, no next-due computed from it, the case (if created) is open with 0 completed sessions
5. [days] <span dir="rtl">روز ۰: هدی T41 روی «فیثاغورس» ‖ روز ۱: T41 روی «اتحادهای مثلثاتی»</span> — _context:_ Hoda, subject merge  
   → The second subject must NOT be appended as a session to the «فیثاغورس» case
6. [chat] <span dir="rtl">روز ۰: U: حس می‌کنم فرمول‌ها یادم می‌ره ‖ A: می‌خواهی برایش یک چرخهٔ بازیابی بگذاریم؟ ‖ U: بعداً</span> — _context:_ Hoda, assistant offer declined  
   → No case created (offer only; no start_practice without her yes)
7. [days] <span dir="rtl">روز ۰: رضا T31 ‖ روز ۲: مکث ‖ روز ۹: ادامه</span> — _context:_ Reza, pause keeps history  
   → The paused period must not erase the day-0 session, and no «overdue» badge is shown during days 2–8
8. [days] <span dir="rtl">روز ۰ ساعت ۱۰: مریم بازنویسیِ T28 ‖ روز ۰ ساعت ۲۲: دوباره ذخیره با یک تغییرِ کوچک</span> — _context:_ Maryam, same-day repeat  
   → One session for day 0 (the later save updates it), not two sessions

## LT3.stable · stability from the technique's own dated evidence; same-day once; decay after «تثبیت شد»

### Positive

1. [days] <span dir="rtl">روز ۰: کاوه چرخهٔ T41 «قضیهٔ چینی» ‖ روز ۱: ۸۰٪ ‖ روز ۳: ۸۵٪ ‖ روز ۷: ۹۰٪ ‖ روز ۱۴: برگهٔ سفید ۴۰٪</span> — _context:_ Kaveh, T41 decay  
   → «تثبیت شد» on day 7 (10-24) with evidence listed by date (10-18 80%, 10-20 85%, 10-24 90% — success at each longer interval); the day-14 (10-31) check-in catches decay: state back to stabilising, «تثبیت شد» withdrawn with the dated reason, new Today turns
2. [days] <span dir="rtl">روز ۰: مهسا در تمرینِ T23 گره ۳ پاسخِ درستِ پیاپی در ۳ شکل ‖ روز ۴: ۳ پاسخِ درست در شکل‌های دیگر با فریب</span> — _context:_ Mahsa, knot criterion  
   → Stable on day 4 (10-21): ≥2 sessions ≥3 days apart, varied forms, decoys — evidence lists both dates
3. [days] <span dir="rtl">روز ۰: آرش ۵ پیش‌بینیِ T24 با بازهٔ ۷۰٪ ‖ روز ۴: ۵ تای دیگر ‖ روز ۹: ۵ تای دیگر؛ همه داوری‌شده (۳/۵، ۴/۵، ۴/۵ درست)</span> — _context:_ Arash, T24 calibration  
   → Calibration stable on day 9 (10-26): hit rate 11/15 = 73% inside the stated 70% band across sessions on three different days; evidence shows each day's tally
4. [days] <span dir="rtl">روز ۰: سارا آزمایشِ T21 اول ‖ روز ۶: دوم ‖ روز ۱۵: سوم؛ هر سه کامل (پیش‌بینی، مشاهده، نتیجه)</span> — _context:_ Sara, T21 experiment criterion  
   → Stable/«آزموده» on day 15 (11-01): ≥3 complete experiments spread over 15 ≥ 14 days
5. [days] <span dir="rtl">روز ۰: کارت T42 ‖ روز ۱ «خوب» ‖ روز ۷ «خوب» ‖ روز ۲۲: «یادم نبود»</span> — _context:_ Negar, T42 regression  
   → On day 22 (11-08) the lapse resets the interval to 1 day (due 11-09) and any stability mark is revoked with the date; history keeps the earlier successes
6. [days] <span dir="rtl">روز ۰: رضا راهبردِ T31 ‖ روز ۴: روی مسئلهٔ «رنگ‌آمیزیِ صفحه» جواب داد ‖ روز ۱۱: روی مسئلهٔ «مسیرهای شبکه» هم جواب داد</span> — _context:_ Reza, T31  
   → Stable on day 11 (10-28): the strategy's outcome confirmed on two different problems on dates ≥3 days apart; evidence names both problems
7. [days] <span dir="rtl">روز ۰: مریم T28 ‖ روز ۱ ‖ روز ۷: «تثبیت شد» (اصطلاحِ فنی ۲ ← ۰) ‖ روز ۱۴: بازنویسی با ۵ اصطلاح و گیر در «حد»</span> — _context:_ Maryam, T28 decay  
   → Day 14 check-in (next interval after stable) reopens the case to stabilising; the stuck point «حد» is recorded; Today turn returns
8. [days] <span dir="rtl">روز ۰: پویا T22 «مهاجرت یعنی موفقیت» با پیش‌بینیِ ابطال‌پذیر ‖ روز ۱۰: مشاهدهٔ مخالف ‖ روز ۱۷: بازبینی پس از نتیجه</span> — _context:_ Pouya, T22 verdict  
   → Day 10 (10-27): verdict «رد شد» with the dated observation; a re-review after the outcome is scheduled and shows on day 17 (11-03); belief revision is stored as history
9. [days] <span dir="rtl">روز ۰: لادن مدلِ «هزینهٔ فرصت» را در T16 در تصمیمِ خرید خودرو به کار می‌برد ‖ روز ۵: در انتخابِ دوره ‖ روز ۱۲: در قبولِ پروژه</span> — _context:_ Ladan, decisions, T16  
   → Model admitted to the latticework on day 12 (10-29): 3 real uses on 3 different days — T16's «دست‌کم سه بار در موقعیت واقعی»
10. [days] <span dir="rtl">روز ۰: بهرام مشکلِ «تأخیر در تحویلِ سفارش» ‖ روز ۹: دوباره ‖ روز ۲۰: بارِ سوم</span> — _context:_ Bahram, T39 recurrence  
   → On the third recurrence (day 20, 11-06) T39 double-loop is suggested with the three dates; then a monthly governing-variable review is scheduled (day 50)

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: نگار شش بار برگهٔ T43 را با ۱۰۰٪ پر می‌کند</span> — _context:_ Negar, same-day repeats  
   → Counts as ONE session; never «روان»/«تثبیت شد»
2. [days] <span dir="rtl">روز ۱: کاوه سه بار بازیابیِ T41 (صبح، ظهر، شب)</span> — _context:_ Kaveh, same-day as spacing  
   → One day-1 session; the case does not advance to the day-3 or day-7 step
3. [days] <span dir="rtl">روز ۰: لیلا بدونِ هیچ جلسه‌ای دکمهٔ «تثبیت شد» را می‌زند</span> — _context:_ Leila, unsupported claim  
   → Not stable: no dated evidence; at most shown as her own claim, the case stays open with Today turns
4. [days] <span dir="rtl">روز ۰: آرش ۵۲ پیش‌بینیِ T24 می‌نویسد ‖ روز ۱: همه داوری می‌شوند (۷۲٪ در بازه)</span> — _context:_ Arash, single-day calibration  
   → Not stable — all from one session/day; hit rate shown but «across days» unmet
5. [days] <span dir="rtl">روز ۰، ۴، ۱۰: سه آزمایشِ کاملِ T21</span> — _context:_ Sara, short span  
   → Not stable on day 10 — span 10 < 14 days
6. [days] <span dir="rtl">روز ۰ T41 ‖ روز ۷: خودارزیابی ۲/۲ ولی بازیابیِ سنجیده ۳۰٪</span> — _context:_ Kaveh, self-score vs measured  
   → The measured result wins: no «تثبیت شد», the cycle steps back
7. [days] <span dir="rtl">روز ۷: T28 «تثبیت شد» ‖ روز ۱۴: بازبینی شکست خورد</span> — _context:_ Maryam, stale stable  
   → After the failed check-in the mind card and case must NOT still show «تثبیت شد»
8. [days] <span dir="rtl">روز ۰: لادن مدلِ «هزینهٔ فرصت» را ۳ بار در همان روز در سه سؤالِ فرضی به کار می‌برد</span> — _context:_ Ladan, T16 same-day uses  
   → Not admitted: one day and not real situations — counts as 1 use
9. [days] <span dir="rtl">روز ۰: کارت T42 ‖ روز ۴ (موعد روز ۱): «یادم نبود»</span> — _context:_ Negar, late failure  
   → A late failure is not counted as success at a longer interval; interval resets to 1

## LT4.mind · technique work feeds the mind card once, visible under «از کجا؟»

### Positive

1. [days] <span dir="rtl">روز ۱: کاوه بازیابیِ T41 ۸۰٪ ‖ روز ۳: ۸۵٪ ‖ روز ۷: ۹۰٪</span> — _context:_ Kaveh, T41 → card  
   → Mind card reflects retrieval for «قضیهٔ چینی»; «از کجا؟» lists three dated lines (2026-10-18 80%, 10-20 85%, 10-24 90%, source = practice case T41)
2. [days] <span dir="rtl">روز ۰ تا ۹: آرش ۱۵ پیش‌بینیِ T24 در سه روز؛ همه داوری‌شده</span> — _context:_ Arash, T24 → card  
   → Calibration on the mind card now includes T24 rows (Brier / hit rate); «از کجا؟» names the T24 sessions by date, alongside any fcast entries
3. [days] <span dir="rtl">روز ۰: لیلا در T32 پیش‌بینی می‌کند «فردا ۸ از ۱۰ را یادم است» ‖ روز ۱: ۵ از ۱۰</span> — _context:_ Leila, T32 JOL  
   → The judgement-of-learning prediction is resolved on day 1 and feeds the card as over-confidence (+30 points), with «از کجا؟» → T32 2026-10-18
4. [days] <span dir="rtl">روز ۷: کاوه برگهٔ سفیدِ هفتگیِ «نظریهٔ اعداد» ‖ روز ۱۴: دوباره</span> — _context:_ Kaveh, weekly blank page  
   → Both weekly blank-page recall % values show on the card with dates 10-24 and 10-31
5. [days] <span dir="rtl">روز ۰: نیما برگهٔ T13 روی ادعای «شیرِ گرم برای خواب خوب است» با روبریکِ ۲/۲/۱</span> — _context:_ Nima, T13 rubric  
   → The rubric score of the completed worksheet reaches the card as one dated session, labelled self-scored (not measured)
6. [days] <span dir="rtl">روز ۱۰: پروندهٔ T22 پویا «رد شد»</span> — _context:_ Pouya, T22 → s_epi  
   → The epistemic part of the card (s_epi) moves; «از کجا؟» shows the case, the observation and the date 2026-10-27
7. [days] <span dir="rtl">روز ۷: مریم T28 «تثبیت شد» ‖ روز ۱۴: بازنویسی شکست خورد</span> — _context:_ Maryam, regression visible  
   → The card shows the decline on 10-31 and the reason, not only the earlier success
8. [days] <span dir="rtl">روز ۰: سمیرا در T33 پیش از مطالعه «۴۰٪ می‌دانم» و پس از آن «۸۰٪» با آزمونکِ ۷۰٪</span> — _context:_ Samira, T33 calib  
   → The pre/post calib values feed the card once, with source T33 and date 10-17
9. [chat+days] <span dir="rtl">روز ۰: هدی از طریقِ دستیار چرخهٔ T41 را شروع کرد ‖ روز ۱: ۷۰٪</span> — _context:_ Hoda, assistant-started  
   → The session counts on the card; «از کجا؟» shows source «دستیار ← تمرین T41» and the date

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: آرش یک پیش‌بینی در برگهٔ T24 می‌نویسد که همان fcast است و در کارتِ مرور هم اطمینان دارد</span> — _context:_ Arash, once per act  
   → Counted ONCE in calibration — not three times (T24 + fcast + card confidence)
2. [days] <span dir="rtl">روز ۰: یک اجرای تور با ?clock=2026-11-01 روی حسابِ مالک پرونده‌ی T41 می‌سازد</span> — _context:_ owner card, test record  
   → Nothing from the test/tour record appears in the owner's mind card or «از کجا؟»
3. [days] <span dir="rtl">روز ۱: کاوه سه بار بازیابیِ T41</span> — _context:_ Kaveh, same-day  
   → One line under «از کجا؟» for that day, not three
4. [days] <span dir="rtl">روز ۰: آرش ۵ پیش‌بینیِ T24 که هنوز موعدشان نرسیده</span> — _context:_ Arash, unresolved  
   → Unresolved predictions are not counted as hits or misses
5. [days] <span dir="rtl">روز ۰: لیلا پیش‌نویسِ نیمه‌کارهٔ T23</span> — _context:_ Leila, draft  
   → A draft does not reach the card
6. [days] <span dir="rtl">روز ۰: منتقدِ هوش مصنوعی به برگهٔ T13 نیما نمرهٔ ۹۰ می‌دهد</span> — _context:_ Nima, AI critic  
   → The AI critic score is never shown as Nima's own measured result
7. [days] <span dir="rtl">روز ۰: علی با پروندهٔ مسئلهٔ زنده به برادرش (T29) یاد می‌دهد؛ برادر ۳ از ۵</span> — _context:_ Ali, other person's score  
   → The brother's score is not entered as Ali's own skill on Ali's card (it may appear as teaching activity)
8. [days] <span dir="rtl">روز ۰: نیما T13 ‖ روز ۵: T13 دیگر ‖ روز ۵: «از کجا؟» را باز می‌کند</span> — _context:_ Nima, provenance  
   → Every line under «از کجا؟» carries its date and opens its source record — never an undated aggregate like «تمرین‌ها: ۲»

## LT5.one · one record per act across parallel paths; the technique page opens the dated record

### Positive

1. [days] <span dir="rtl">روز ۰: آرش در برگهٔ T24 «برزیل بازی را می‌برد، ۷۰٪، موعد ۲۰۲۶-۱۰-۲۰» ‖ روز ۳: در 🎯 نتیجه «برد»</span> — _context:_ Arash, T24 ⇄ fcast  
   → One fcast-ledger record; the T24 page opens that dated record and shows the outcome «برد» on day 3 (10-20)
2. [days] <span dir="rtl">روز ۰: مهسا از گرهٔ «حواس‌پرتی» T21 را اجرا می‌کند ‖ روز ۵: مشاهده</span> — _context:_ Mahsa, T21 ⇄ kexp  
   → The worksheet is the knot's kexp record; the T21 page opens that kexp with plan/predict/observe/outcome
3. [days] <span dir="rtl">روز ۰: کاوه در مسئلهٔ زنده گامی با پیش‌بینی (T21) ‖ روز ۱: نتیجه</span> — _context:_ Kaveh, T21 ⇄ live step  
   → The T21 page shows the live-problem step itself (with its fcast), not a copy
4. [days] <span dir="rtl">روز ۰: پویا برگهٔ T22 را در کتابخانه پر می‌کند</span> — _context:_ Pouya, T22 ⇄ case  
   → It creates/attaches to an epistemic case with revdate; the case and T22 page show the same record
5. [days] <span dir="rtl">روز ۰: فرزانه در T9 تخمینِ نهایی «۴ ماه تا پیدا کردنِ کار» با کلاسِ مرجع ‖ روز ۳۰: مقایسهٔ ماهانه</span> — _context:_ Farzaneh, T9 ⇄ fcast  
   → The final estimate becomes ONE fcast with due 2026-11-16 (T9's «ماهانه با نتایج واقعی»); on day 30 the inside-vs-base gap is scored there
6. [days] <span dir="rtl">روز ۳: آرش نتیجهٔ پیش‌بینی را از صفحهٔ T24 ثبت می‌کند</span> — _context:_ Arash, resolve from either side  
   → The fcast ledger shows the same outcome immediately (same record)
7. [days] <span dir="rtl">روز ۰: کاوه برگهٔ T41 را از صفحهٔ تکنیک شروع می‌کند</span> — _context:_ Kaveh, T41 ⇄ P3  
   → It starts the existing P3 1/3/7 schedule for that topic (one schedule), the technique page opens it
8. [days] <span dir="rtl">روز ۰: نگار پیش از پاسخِ کارت «۸۰٪ مطمئنم» ‖ درست</span> — _context:_ Negar, card confidence ⇄ T24  
   → The card confidence is one calibration point; T24 page lists it once with source «مرور کارت»

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: آرش پیش‌بینی در T24 ‖ همان پیش‌بینی را در 🎯 هم وارد می‌کند</span> — _context:_ Arash, duplicate  
   → No second record — the 🎯 form offers the existing one
2. [days] <span dir="rtl">روز ۵: مشاهدهٔ kexp مهسا ثبت شد</span> — _context:_ Mahsa, stale copy  
   → The T21 page must NOT show an older copy without that outcome
3. [days] <span dir="rtl">روز ۰: فرزانه تخمینِ T9 ‖ روز ۳۰</span> — _context:_ Farzaneh, two lines  
   → Not two Today lines (T9 + fcast) for one estimate
4. [days] <span dir="rtl">روز ۰: پویا T22 را از پرونده شروع کرد ‖ روز ۲: همان T22 از کتابخانه</span> — _context:_ Pouya, second case  
   → No second epistemic case
5. [days] <span dir="rtl">روز ۳: آرش نتیجه را در 🎯 عوض کرد (برد ← مساوی)</span> — _context:_ Arash, edit propagation  
   → The T24 page never keeps the old outcome
6. [days] <span dir="rtl">روز ۰: کاوه گامِ پیش‌بینی‌دار در مسئلهٔ زنده</span> — _context:_ Kaveh, double count  
   → Not counted twice in calibration (step + fcast)
7. [days] <span dir="rtl">روز ۰: کاوه T41 ‖ روز ۰: P3 برای همان موضوع</span> — _context:_ Kaveh, two cycles  
   → Not two 1/3/7 cycles for one topic
8. [days] <span dir="rtl">روز ۰: ثبتِ پیش‌بینی در یک تور</span> — _context:_ owner, tour record  
   → Opening T24 from the owner's page does not show the tour's record

## LT6.link · links back to live problem / epistemic case / knot; outcome updates the problem

### Positive

1. [days] <span dir="rtl">روز ۰: کاوه از مسئلهٔ «۲۰ پله» T21 «حدس: فیبوناچی» ‖ روز ۱: آزمونِ n=۴ (۵ راه) تأیید ‖ روز ۲: n=۵ (۸ راه) تأیید</span> — _context:_ Kaveh, dossier  
   → The case shows in the problem's dossier (INF16) with its sessions; the problem's guess shows «تأیید در ۲ آزمون» with dates
2. [days] <span dir="rtl">روز ۰: هدی حدس «جوابِ مسئلهٔ دایره π است» را با T21 آزمونی می‌کند ‖ روز ۲: رد شد</span> — _context:_ Hoda, guess rejected  
   → The case outcome updates the problem's guess to «حدس رد شد» (dated, linked to the case); the problem stays open
3. [days] <span dir="rtl">روز ۰: پویا T22 روی پروندهٔ معرفتی</span> — _context:_ Pouya, epi link  
   → The epistemic case page lists the practice case and its next due
4. [days] <span dir="rtl">روز ۰: مهسا از گرهٔ «عجله» T2 (تجزیه) را شروع می‌کند</span> — _context:_ Mahsa, T2 from knot  
   → Possible now (T2 was unreachable from a knot); the case links to the knot
5. [days] <span dir="rtl">روز ۰: بهرام از گرهٔ «تکرار مشکلات تحویل» T39 را شروع می‌کند</span> — _context:_ Bahram, T39 from knot  
   → Possible now; the knot's «returned» status on a new recurrence suggests this T39 case
6. [days] <span dir="rtl">روز ۰: نیما از گرهٔ «فراموشیِ فرمول‌ها» T42 کارت می‌سازد</span> — _context:_ Nima, T42 from knot  
   → Possible now; the card's case links to the knot
7. [days] <span dir="rtl">روز ۰: سمیرا از گره T30 ‖ روز ۷: گشت‌وگذار</span> — _context:_ Samira, T30 from knot  
   → Linked; the knot shows the session
8. [days] <span dir="rtl">روز ۰: لادن T16 را از گرهٔ «تصمیم‌های عجولانه» شروع می‌کند</span> — _context:_ Ladan, T16 from knot  
   → Possible now; model uses link back to the knot
9. [days] <span dir="rtl">روز ۱۰: پروندهٔ T22 پویا «رد شد»</span> — _context:_ Pouya, outcome back  
   → The epistemic case's own state/revdate updates from the outcome (one place to see it)

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: هدی حدسِ «π» را با T21 می‌آزماید ‖ روز ۲: رد شد ‖ روز ۳: Today</span> — _context:_ Hoda, overreach  
   → The problem is NOT marked solved or closed; on day 3 the problem still has its own open step line
2. [days] <span dir="rtl">روز ۰: کاوه دو مسئلهٔ زنده دارد («۲۰ پله» و «دست‌دادن‌ها») و T21 را از «۲۰ پله» شروع می‌کند ‖ روز ۱: نتیجه</span> — _context:_ Kaveh, wrong link  
   → The case and its day-1 outcome never appear in «دست‌دادن‌ها»'s dossier
3. [days] <span dir="rtl">روز ۰: لیلا از گرهٔ «فراموشیِ قواعد لگاریتم» T41 را شروع می‌کند ‖ روز ۷: تثبیت شد و پرونده‌ی تمرین را می‌بندد</span> — _context:_ Leila, cascade  
   → Closing the practice case does not close the knot (the knot follows its own criterion and 30/90-day holds)
4. [days] <span dir="rtl">روز ۰: سمیرا T30 را با موضوعِ آزاد شروع می‌کند ‖ روز ۷: گشت‌وگذار</span> — _context:_ Samira, free subject  
   → No fake link to any problem/knot; the case is labelled «آزاد»
5. [days] <span dir="rtl">روز ۰: یک تور (اجراکنندهٔ آزمون) T21 را روی مسئلهٔ نمونه شروع می‌کند ‖ روز ۵: نتیجه</span> — _context:_ tour record  
   → Nothing is linked into the owner's live-problem dossier
6. [days] <span dir="rtl">روز ۰: کاوه حدسِ فیبوناچی ‖ روز ۲: یک آزمونِ تأییدکننده</span> — _context:_ Kaveh, confirmation ≠ proof  
   → The problem must not show «اثبات شد» — a confirming test is not a proof; the guess shows «تأیید در ۱ آزمون»
7. [days] <span dir="rtl">روز ۰: مهسا T21 را از گره شروع کرد ‖ روز ۵: گره را تغییرِ نام می‌دهد</span> — _context:_ Mahsa, island  
   → The case keeps its link (by id) and shows the new name; never an orphan
8. [days] <span dir="rtl">روز ۰: پویا T22 ‖ روز ۱۰: پیامد ثبت شد ‖ روز ۱۰: همان صفحه را دوباره ذخیره می‌کند</span> — _context:_ Pouya, duplicate history  
   → The outcome is not written twice into the epistemic case's history

## LT7.list · running lists (T15, T16, T31/T34, T35, T3, T10) with their own review cadence

### Positive

1. [days] <span dir="rtl">روز ۰: بهرام در فهرستِ فرض‌ها (T15) «مشتری‌ها به قیمت حساس نیستند» را باربر علامت می‌زند ‖ روز ۱۲: رویدادِ مهم «رقیب قیمت را ۲۰٪ کم کرد» ‖ روز ۳۰</span> — _context:_ Bahram, T15 assumptions register  
   → Assumptions register is a practice case of kind list; the day-12 major event triggers an immediate review line (10-29) for load-bearing assumptions; the monthly review is on day 30 (11-16) — T15 «هر ماه یا با هر رویداد مهم»
2. [days] <span dir="rtl">روز ۰: لادن مدلِ «هزینهٔ فرصت» را به قفسهٔ مدل‌ها (T16) می‌افزاید (کاربرد ۱) ‖ روز ۵: کاربرد ۲ ‖ روز ۷: مرورِ هفتگی ‖ روز ۱۲: کاربرد ۳</span> — _context:_ Ladan, T16 shelf  
   → Shelf shows a use counter 1→2→3 with dates; weekly review on day 7 (10-24); the model moves from «نامزد» to «پذیرفته» on day 12
3. [days] <span dir="rtl">روز ۰: رضا اشتباهِ فکریِ «تعمیم از یک نمونه» را در پوشهٔ «اشتباهاتِ فکری من» (T34) ثبت می‌کند ‖ روز ۴: راهبردِ T31 برای آن ‖ روز ۳۰: بازخوانیِ ماهانه</span> — _context:_ Reza, mistakes folder  
   → Mistakes folder (T31/T34 shared list) has the item with its strategy case linked; monthly reread on day 30 (11-16) — T34 «ماهانه»
4. [days] <span dir="rtl">روز ۰: سمیرا ابهامِ «آیا تغییر رشته به آمار درست است؟» با احتمالِ ۵۰٪ در فهرستِ ابهام‌های باز (T35) ‖ روز ۷: مرورِ هفتگی ‖ روز ۹: دادهٔ تازه «پذیرش از دانشگاه ب» ← ۷۰٪ ‖ روز ۱۴: مرور</span> — _context:_ Samira, T35 open ambiguities, life decision  
   → Weekly review lines on day 7 (10-24) and 14 (10-31); the day-9 data arrival logs a probability update 50→70 with date and reason (history kept, not overwritten)
5. [days] <span dir="rtl">روز ۰: بهرام ردیاب پارتو (T3) «۳ مشتری = ۶۰٪ درآمد» ‖ روز ۳۰: دادهٔ واقعیِ ماه «۳ مشتری = ۴۵٪»</span> — _context:_ Bahram, T3 vital-few tracker  
   → Monthly review on day 30 (11-16) records the new shares; a trend of driver shares (60→45) is shown
6. [days] <span dir="rtl">روز ۰: علی در دفترِ سیگنال و نویز (T10) ادعای «فروشِ این هفته به‌خاطرِ تبلیغ بالا رفت» را با «دوباره بررسی: ۲۱ روز بعد» ثبت می‌کند ‖ روز ۲۱: دادهٔ خارج از نمونه</span> — _context:_ Ali, T10 signal-vs-noise log  
   → The recheck date the user wrote becomes a real due: Today line on day 21 (11-07 Sat); the out-of-sample result is stored and gives a verdict (signal/noise)
7. [days] <span dir="rtl">روز ۰: پویا باور «بدونِ ارشد پیشرفت نمی‌کنم» را در T34 ‖ روز ۷: باورِ هفتگی بعدی ‖ روز ۱۴: بازنگری؛ «تا حدی نادرست»</span> — _context:_ Pouya, T34 belief  
   → Belief revision history kept with dates; weekly cue on day 7 and 14; item linked to the mistakes folder if marked a thinking mistake
8. [days] <span dir="rtl">روز ۰: لادن در قفسهٔ مدل‌ها ‖ روز ۵: از صفحهٔ مسئلهٔ زنده «انتخابِ دوره» مدلِ «هزینهٔ فرصت» را به کار می‌برد</span> — _context:_ Ladan, use from another path  
   → The use from the live problem increments the shelf counter (one list, many entry points) and links the use to the problem
9. [days] <span dir="rtl">روز ۰: سمیرا ابهام ‖ روز ۲۰: تصمیم گرفت و ابهام را «بسته» کرد</span> — _context:_ Samira, closing an item  
   → The item leaves the open list with its dated resolution; the list's weekly review continues for the remaining items

### Negative (must NOT happen)

1. [days] <span dir="rtl">روز ۰: علی ادعای T10 را با تاریخ ۲۱ روز ‖ روز ۱۵: داده آمد و حکم داد ‖ روز ۲۱</span> — _context:_ Ali, decided claim  
   → No reminder on day 21 for a claim already decided
2. [days] <span dir="rtl">روز ۰، ۱، ۲: لادن مدلِ تازه «اثرِ شبکه» را ۲ بار در موقعیتِ واقعی به کار برد</span> — _context:_ Ladan, T16 threshold  
   → Not admitted — 2 < 3 real uses
3. [days] <span dir="rtl">روز ۵: لادن دو بار در همان روز «هزینهٔ فرصت» را در یک تصمیم به کار برد</span> — _context:_ Ladan, same-day use  
   → Counter +1 for that day/decision, not +2
4. [days] <span dir="rtl">روز ۰: رضا اشتباه را از برگهٔ T31 و دوباره از T34 ثبت می‌کند</span> — _context:_ Reza, duplicate list item  
   → One item in the mistakes folder, not two
5. [days] <span dir="rtl">روز ۰: سمیرا فهرستِ ابهام‌ها ‖ روزهای ۱ تا ۶</span> — _context:_ Samira, cadence  
   → No daily review lines — T35 review is weekly (first on day 7)
6. [days] <span dir="rtl">روز ۰: بهرام فهرستِ فرض‌ها ‖ روز ۱، ۳، ۷</span> — _context:_ Bahram, cadence  
   → No 1/3/7 lines; only the monthly review or an event trigger
7. [days] <span dir="rtl">روز ۹: سمیرا احتمال را ۵۰ ← ۷۰ کرد</span> — _context:_ Samira, history  
   → The 50% is not overwritten without trace (history kept)
8. [days] <span dir="rtl">روز ۰: یک تور فهرستِ فرض‌ها با دو فرضِ آزمایشی می‌سازد</span> — _context:_ tour record  
   → None of those items appear in the owner's register
9. [days] <span dir="rtl">روز ۰: علی ادعا را بدونِ تاریخ ثبت کرد</span> — _context:_ Ali, no invented interval  
   → No invented generic due — the log asks him for the recheck date (T10's own question «چه زمانی دوباره بررسی‌اش می‌کنم؟»)

## LT8.clock · test clock: A.now offset, remind capture, Tehran edge, susp setter; tests never touch owner data

### Positive

1. [clock] <span dir="rtl">روز ۰: تورگردان صفحه را با ?clock=2026-10-20 باز می‌کند</span> — _context:_ tour runner, offset  
   → A.today() returns 2026-10-20; Today shows day-3 items (e.g. T41 day-3 line of a case started 10-17); a visible dev flag «ساعتِ آزمایشی» is shown
2. [clock] <span dir="rtl">روز ۰: پرونده‌ی T41 ‖ APP.clock.advance(7) ‖ reload</span> — _context:_ runner, advance  
   → Day 7 (10-24) line and weekly blank page appear; S.put stamps created/updated with the offset date
3. [clock] <span dir="rtl">روز ۰: کارتِ T42 ‖ گریدِ روزِ ۱ با ساعتِ آزمایشی</span> — _context:_ runner, remind capture  
   → The A.HOST.remind capture stub records {key: cards:review, due_date: 2026-10-24}; no real phone push
4. [clock] <span dir="rtl">روز ۰: تهران، ساعت ۰۰:۳۰ بامدادِ ۲۰۲۶-۱۰-۱۸ (۲۰۲۶-۱۰-۱۷T21:00Z)</span> — _context:_ Tehran midnight edge  
   → A.today() = 2026-10-18 (local Tehran day), so a day-1 due shows
5. [clock] <span dir="rtl">روز ۰: مهسا در kpractice پاسخ ثبت می‌کند با ساعتِ آزمایشی</span> — _context:_ consistent private clocks  
   → The log's d and at agree (both from A.now()), so the mind card and knot mastery read the same day
6. [clock] <span dir="rtl">روز ۰: کارتِ کهنه ‖ «بازنشسته کن»</span> — _context:_ susp setter  
   → The susp setter retires the card: it leaves the due queue and the cards:review reminder
7. [clock] <span dir="rtl">سرور: deliver_due(now=2026-10-24T05:00) با یادآورِ ثبت‌شده برای ۲۰۲۶-۱۰-۲۴</span> — _context:_ server reminder test  
   → The reminder is delivered by the injected senders; with now=10-23 it is not
8. [clock] <span dir="rtl">?clock=2026-11-01 ‖ setSystemTime به ۲۰۲۶-۱۰-۲۰ (عقب) ‖ reload</span> — _context:_ backward jump with reload  
   → After reload, sweeps run again at the earlier date (throttles reset); Today shows 10-20 state
9. [clock] <span dir="rtl">روز ۰: پروندهٔ T21 سارا ‖ advance(6) ‖ advance(9)</span> — _context:_ runner, multi-jump  
   → Experiment sessions dated 10-23 and 11-01 by the offset clock; stability check counts the 15-day span

### Negative (must NOT happen)

1. [clock] <span dir="rtl">روز ۰: مالک بدونِ حالتِ توسعه نشانیِ ?clock=2027-01-01 را باز می‌کند ‖ کارتی ذخیره می‌کند</span> — _context:_ owner, prod  
   → The offset is NOT applied in production without the dev flag; dates stay real
2. [clock] <span dir="rtl">روز ۰: تور با ?clock پرونده‌ی T24 می‌سازد ‖ روز ۳: داوری ‖ مالک صفحه را بدونِ ساعتِ آزمایشی باز می‌کند</span> — _context:_ test record in owner card  
   → Records made under the offset are tagged test and never enter the owner's mind card or Today
3. [clock] <span dir="rtl">روز ۰ → ۱۵ (setSystemTime) ‖ روز ۱۵ → ۳ (عقب) بدونِ reload ‖ Today</span> — _context:_ backward without reload  
   → Must not report a stale sweep as a feature result (runner must reload; absence is not a pass)
4. [clock] <span dir="rtl">روز ۰: فقط APP.today به ۲۰۲۶-۱۰-۲۴ وصله می‌شود ‖ پرونده‌ی T41 ذخیره می‌شود</span> — _context:_ partial patch  
   → Not a valid simulation: created stays real-clock; results are rejected as mixed state
5. [clock] <span dir="rtl">روز ۰: کارت با ساعتِ آزمایشی ‖ روز ۱: گرید</span> — _context:_ remind leak  
   → No real push to the owner's phone — captured by the stub only
6. [clock] <span dir="rtl">روز ۰: نگار کارتِ «sin x» را بازنشسته می‌کند ‖ advance(30) ‖ reload</span> — _context:_ retired card  
   → Not in the due queue and no reminder
7. [clock] <span dir="rtl">روز ۰: کارت با موعدِ روز ۱ ‖ تهران ۲۳:۵۰ همان روزِ ۲۰۲۶-۱۰-۱۷ (20:20Z)</span> — _context:_ Tehran edge neg  
   → Still 10-17: a day-1 due (10-18) does not show yet
8. [clock] <span dir="rtl">روز ۰: پرونده‌ی T41 ‖ advance(7) ‖ advance(7) ‖ reload</span> — _context:_ offset accumulation  
   → Each advance moves A.now by 7 days (total 14), never resets to the real day

