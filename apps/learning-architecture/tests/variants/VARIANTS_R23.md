# VARIANTS_R23 — independent variant bank (round 23 root mechanisms Q1–Q7)

Written from DECISIONS_R23 and the round-23 runner handbacks A–D only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-19 (Monday; ۱۴۰۵/۰۷/۲۷ = ۲۷ مهر) for all date expectations; Persian week: Sun 18 (دیروز, ۲۶ مهر), **Mon 19 (today)**, Tue 20 (فردا, ۲۸ مهر), Wed 21 (پس‌فردا, ۲۹ مهر), Thu 22 (۳۰ مهر), Fri 23 (۱ آبان), Sat 24 (۲ آبان). Jalali⇄Gregorian by the standard 33-year arithmetic (as jalaali-js): ۲۰ اردیبهشت ۱۳۳۸ = 1959-05-11; ۱۲ خرداد ۱۳۳۸ = 1959-06-03; ۵ فروردین ۱۳۹۶ = 2017-03-25; ۲۷ مهر ۱۳۹۶ = 2017-10-19; ۱۳۸۸/۱۱/۲۲ = 2010-02-11; ۳۱ شهریور ۱۳۸۹ = 2010-09-22; ۱۰ آذر ۱۳۴۰ = 1961-12-01; ۷ دی ۱۳۴۲ = 1963-12-28; ۳۰ اسفند ۱۳۹۵ = 2017-03-20 (1395 leap; 1396 not). Ages are computed on 2026-10-19.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / cards / panels / views, [events] dossier/mind-card readings, [time] day sequences under the test clock (D0 = Mon 2026-10-19), [prompt] what the prompt/reply/post-check contains, [route] AI task route chosen or 🧭 route map content.
Learners: adult unless the context says child (age ≤ 12), teen (13–17) or elder (≥ 60); register «تو» unless the context says «شما»; ZWNJ is deliberately missing in some entries — detection must not depend on it and her text must be stored as she typed it. Digits appear in Persian, Latin and mixed form on purpose; all must be read the same.
Multi-message entries use « ‖ » between messages (U = user, A = assistant, «[…]» = a page action/result). Old values always stay as history («اصلاح شد ⇐»); nothing is deleted; withdrawn ≠ deleted. Machine-readable copy: VARIANTS_R23.json (fields rc, kind, role, text, expect, context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| Q1.age_identity | 22 | 16 |
| Q2.prereq_refinements | 11 | 8 |
| Q3.chat_page_story | 20 | 14 |
| Q4.corrections | 22 | 16 |
| Q5.classification_turnq | 13 | 8 |
| Q6.territory_loop | 10 | 8 |
| Q7.today_dossier_lists | 12 | 8 |
| **total** | 110 | 78 |


## Q1.age_identity · age and identity surface (Jalali birth date in every form on card / birth action / «X سالمه، تولدم Y»; human error message; page lines follow the conversation's register; teen line not garbled; system-map self-knowledge on age; no adult puzzle for children; greetings, self-introductions and a child's name stripped from titles)


### Positive

1. [page] <span dir="rtl">[page] birth card: ۲۰ اردیبهشت ۱۳۳۸</span> — _context:_ <span dir="rtl">elder 67, «شما»</span>  
   → accepted on the page (no model round-trip needed); converted to 1959-05-11 and shown back with both forms («۲۰ اردیبهشت ۱۳۳۸ ـ 1959-05-11»); age 67, band elder; «# مخاطب» elder block in the next prompt; mind card «سن: ۶۷»
2. [page] <span dir="rtl">[page] birth card: ۱۳۳۸/۰۳/۱۲</span> — _context:_ <span dir="rtl">elder 67, «شما» (round-23 s12 form)</span>  
   → accepted; 1338/03/12 = 1959-06-03; age 67; no «تاریخ نامعتبر / YYYY-MM-DD» error; card line in «شما» («تاریخِ تولدتان ثبت شد»)
3. [chat] <span dir="rtl">U: ۶۷ سالمه، تولدم ۱۲ خرداده</span> — _context:_ <span dir="rtl">elder, chat only, no card used yet</span>  
   → page itself resolves the year: ۱۲ خرداد has already passed in ۱۴۰۵ ⇒ born ۱۴۰۵−۶۷ = ۱۳۳۸ ⇒ 1338/03/12 = 1959-06-03, age 67; stored even if the model sends no birth action; card shows the stored date
4. [page] <span dir="rtl">[page] birth card: 1338/2/20</span> — _context:_ <span dir="rtl">elder, Latin digits, no zero padding</span>  
   → read as Jalali (year < 1700) ⇒ 1959-05-11, age 67 — same result as «۲۰ اردیبهشت ۱۳۳۸»
5. [page] <span dir="rtl">[page] birth card: ۲۰ اردی‌بهشت ماهِ ۱۳۳۸</span> — _context:_ <span dir="rtl">elder; month written with ZWNJ and «ماهِ»</span>  
   → month name normalised (اردی‌بهشت ≡ اردیبهشت, «ماه/ماهِ» ignored) ⇒ 1959-05-11
6. [page] <span dir="rtl">[page] birth card: ۱۳۳۸/03/۱۲</span> — _context:_ <span dir="rtl">mixed Persian and Latin digits in one string</span>  
   → digits normalised ⇒ 1959-06-03, age 67
7. [page] <span dir="rtl">[page] birth card: ۵ فروردین ۱۳۹۶</span> — _context:_ <span dir="rtl">child 9, «تو»</span>  
   → 1396/01/05 = 2017-03-25, age 9, band child; child block (safety lines) in the prompt; card line in «تو» and simple words
8. [chat] <span dir="rtl">U: امروز تولدمه!! ۹ سالم شد 🎂</span> — _context:_ <span dir="rtl">child; today = Mon 2026-10-19 = ۲۷ مهر ۱۴۰۵</span>  
   → birth date = today's month/day ⇒ 1396/07/27 = 2017-10-19, age 9 exactly (birthday counted as passed); child band
9. [chat] <span dir="rtl">U: ۸ سالمه، تولدم فرداست</span> — _context:_ <span dir="rtl">child; tomorrow = ۲۸ مهر</span>  
   → birthday not yet passed ⇒ born ۱۴۰۵−۸−۱ = ۱۳۹۶ ⇒ 1396/07/28 = 2017-10-20, age 8 (not 9)
10. [page] <span dir="rtl">[page] birth card: ۱۳۸۸/۱۱/۲۲</span> — _context:_ <span dir="rtl">teen 16</span>  
   → 1388/11/22 = 2010-02-11, age 16, teen block with minors' safety lines
11. [chat] <span dir="rtl">U: متولد ۳۱ شهریور ۸۹ ام</span> — _context:_ <span dir="rtl">teen, two-digit year, colloquial «ام»</span>  
   → two-digit year expanded to ۱۳۸۹ ⇒ 1389/06/31 = 2010-09-22, age 16; ۳۱ شهریور valid (first-half months have 31 days)
12. [page] <span dir="rtl">[page] birth card: 1340-09-10</span> — _context:_ <span dir="rtl">elder, Latin digits with dashes</span>  
   → year 1340 < 1700 ⇒ Jalali (not rejected as a malformed Gregorian) ⇒ 1961-12-01, age 64
13. [chat] <span dir="rtl">U: ۷ دی ۴۲ به دنیا اومدم، الان بازنشسته‌ام</span> — _context:_ <span dir="rtl">elder, two-digit year</span>  
   → ⇒ 1342/10/07 = 1963-12-28, age 62; band elder
14. [page] <span dir="rtl">[page] birth card: ۳۰ اسفند ۱۳۹۵</span> — _context:_ <span dir="rtl">child; 1395 is a leap year</span>  
   → valid ⇒ 2017-03-20, age 9 (leap-day case accepted, not refused)
15. [prompt] <span dir="rtl">U (elder): سلام وقتتون بخیر، بنده می‌خواستم بدونم… ‖ [page] card saved, turn question, Today line, copy ask</span> — _context:_ <span dir="rtl">«شما» register throughout her messages</span>  
   → every page-written line (card confirmation, turn question, Today lines, copy asks, prerequisite return line) uses «شما» forms: «ثبت شد؛ گامِ بعدیِ شما…»; no «تو / تولدت / بگو / دادی؟»
16. [prompt] <span dir="rtl">U (elder 67): لطفاً با من راحت باش، «تو» صدام کن</span> — _context:_ <span dir="rtl">she explicitly switches register</span>  
   → from this turn page lines switch to «تو»; the switch is remembered for later sessions; earlier lines are not rewritten
17. [prompt] <span dir="rtl">[prompt] teen 14, any turn</span> — _context:_ <span dir="rtl">teen block + one-question pass</span>  
   → the teen «# مخاطب» line reads as a grammatical sentence after the one-question pass; the string «فقط پرسشِ همین پاسخ کن» never appears; the strict scan still counts exactly one question directive
18. [chat] <span dir="rtl">U (owner-like adult): سنِ منو برای چی می‌خوای؟ کجا نگهش می‌داری؟ آفلاین هم کار می‌کنه؟ اگه مدل رو عوض کنم چی میشه؟</span> — _context:_ <span dir="rtl">adult band (no audience block)</span>  
   → the prompt's system map carries an age/self-knowledge line even for adults: what age is used for (tone/safety block, same-band comparison or «هنجارِ معتبر نیست»), where it is stored, whether it works offline, that the logic is model-independent; the reply answers all four from that line, not invented
19. [chat] <span dir="rtl">U: سلام من کیانم کلاس سومم. ۱۲ تا مداد رو باید بین ۳ نفر تقسیم کنیم هر کی چند تا میگیره</span> — _context:_ <span dir="rtl">child 9</span>  
   → problem title, chat statement and 🧩 title = the problem only (≈ «۱۲ مداد بینِ ۳ نفر: هر نفر چند تا؟»); no «سلام», no «کیان», no «کلاس سوم»; the restatement to her does not quote her greeting; route = lla_coach
20. [chat] <span dir="rtl">U: با سلام و احترام؛ بنده رضایی هستم. می‌خواستم بپرسم اگر وام ۲۰۰ میلیونی با سود ۲۳٪ بگیرم قسط ماهانه چقدر می‌شود؟</span> — _context:_ <span dir="rtl">adult formal «شما», ZWNJ mixed</span>  
   → title/statement start at «اگر وام ۲۰۰ میلیونی…»; «با سلام و احترام» and «بنده رضایی هستم» stripped; her full message kept as typed in the dossier
21. [chat] <span dir="rtl">U: سلاااام 😅 من سارام ۱۵ سالمه این سواله رو نمیفهمم: دو تا عدد جمعشون ۲۰ ضربشون ۹۶</span> — _context:_ <span dir="rtl">teen, no ZWNJ, emoji</span>  
   → title = «دو عدد با جمعِ ۲۰ و ضربِ ۹۶»; name and age stripped from the title; teen band applied from «۱۵ سالمه»; no birth day/month invented from age alone (card still asks for the date)
22. [page] <span dir="rtl">[page] Today for a 9-year-old</span> — _context:_ <span dir="rtl">child band</span>  
   → the adult-normed daily puzzle is not offered (no puzzle line/button); the mind card has no adult-norm comparison for her

### Negative (look-alike)

1. [page] <span dir="rtl">[page] birth card: ۳۱ مهر ۱۳۹۶</span> — _context:_ <span dir="rtl">child; Mehr has 30 days</span>  
   → refused with a human Persian message («مهر ۳۰ روز دارد؛ روز را دوباره ببین») in her register; nothing saved; no regex/technical/«YYYY-MM-DD» text
2. [page] <span dir="rtl">[page] birth card: ۳۰ اسفند ۱۳۹۶</span> — _context:_ <span dir="rtl">1396 is not a leap year</span>  
   → refused with a human message; nothing saved
3. [page] <span dir="rtl">[page] birth card: ۱۴۰۶/۰۲/۰۱</span> — _context:_ <span dir="rtl">future date</span>  
   → refused: «این تاریخ هنوز نیامده»; nothing saved
4. [page] <span dir="rtl">[page] birth card: ۱۳۳۸/۱۳/۰۵</span> — _context:_ <span dir="rtl">month 13</span>  
   → refused with a human message naming the month part; not silently clamped to Esfand
5. [page] <span dir="rtl">[page] birth card: 1959-05-11</span> — _context:_ <span dir="rtl">Gregorian still allowed</span>  
   → accepted as Gregorian (not reinterpreted as Jalali year 1959) ⇒ age 67; card may show «۲۰ اردیبهشت ۱۳۳۸» beside it
6. [page] <span dir="rtl">[page] birth card: 2017/03/25</span> — _context:_ <span dir="rtl">Gregorian with slashes</span>  
   → year > 1700 ⇒ Gregorian ⇒ age 9 (not refused, not read as Jalali)
7. [chat] <span dir="rtl">U: تولد مامانم ۲۰ اردیبهشته، چی براش بخرم که خوشش بیاد؟</span> — _context:_ <span dir="rtl">adult 39</span>  
   → NOT her birth date: no birth action accepted, card unchanged, age stays 39
8. [chat] <span dir="rtl">U: قرارداد اجاره ۱۴۰۵/۰۸/۱۵ تموم میشه، تا اون موقع باید خونه پیدا کنم</span> — _context:_ <span dir="rtl">adult</span>  
   → a deadline date (۱۴۰۵/۰۸/۱۵ = 2026-11-06), never a birth date
9. [chat] <span dir="rtl">U: ۶۷ کیلومتر تا روستا راهه، با ۴۰ تا سرعت چقدر طول میکشه</span> — _context:_ <span dir="rtl">adult 39</span>  
   → «۶۷» is a distance, not an age; band unchanged
10. [chat] <span dir="rtl">U: تولدم ۱۲ خرداده</span> — _context:_ <span dir="rtl">no age known, no year</span>  
   → the page asks for the year in one short question; no year guessed, nothing saved yet
11. [chat] <span dir="rtl">U: پارسال ۱۲ خرداد رفتیم شمال</span> — _context:_ <span dir="rtl">adult</span>  
   → a past event date, not a birth date
12. [prompt] <span dir="rtl">U (teen 16): بگو ببینم این درسته یا نه</span> — _context:_ <span dir="rtl">«تو» register</span>  
   → page lines stay «تو»; no forced «شما» because of a respectful elder default
13. [chat] <span dir="rtl">U: توی یه مهمونی هر کی به همه سلام کرد، ۴۵ تا سلام شد. چند نفر بودن؟</span> — _context:_ <span dir="rtl">adult; «سلام» is part of the problem</span>  
   → «سلام» kept in the title and statement (it is content, not a greeting)
14. [chat] <span dir="rtl">U (child کیان, 8): علی ۳ تا سیب داره، مریم ۲ تا بیشتر. روی هم چند تا؟</span> — _context:_ <span dir="rtl">a character's name inside the problem</span>  
   → «علی» and «مریم» stay in the title (problem characters); nothing stripped
15. [page] <span dir="rtl">[page] Today for a 39-year-old</span> — _context:_ <span dir="rtl">adult</span>  
   → the daily puzzle IS offered (adult-normed is right for him)
16. [prompt] <span dir="rtl">[prompt] adult 39, no audience block</span> — _context:_ <span dir="rtl">adult band</span>  
   → no «# مخاطب» block (correct) — but the system-map age/storage/offline/model line is still present

## Q2.prereq_refinements · prerequisite refinements (PRE.scope on the opening turn; stucks inside an open stack and earlier «نامعلوم» stucks of the same step booked cause = prerequisite in mind card AND dossier; missing-tool stuck = system; stack order; no double question; no forced restatement; ability rule after close; «مغزم نمی‌کشه»; 🧩 link follows chat ⇒ live)


### Positive

1. [prompt] <span dir="rtl">U (first message): مستطیلو بلدم، طول ضربدر عرض… ولی این مثلثه، مساحتشو نمیدونم چجوری</span> — _context:_ <span dir="rtl">teen 13, opening turn, no chatFocus yet</span>  
   → the turn-1 prompt already carries the «# پیش‌نیاز» block; a valid coach_state.prereq {concept:«مساحتِ مثلث»} is accepted on turn 1; diagnostic question follows
2. [events] <span dir="rtl">U: (during the √ teaching turn) نفهمیدم اصلاً</span> — _context:_ <span dir="rtl">adult, stack [main s3 ← فیثاغورس ← جذر] open</span>  
   → stuck booked cause = «پیش‌نیاز: جذر» in the mind card AND the dossier; «طرح‌ریزی» percent unchanged; never «ضعیف‌ترین»
3. [events] <span dir="rtl">U (turn 3): گیر کردم ‖ … ‖ (turn 5: diagnosis lands: prereq «تجزیهٔ اتحاد»)</span> — _context:_ <span dir="rtl">teen, same step s2</span>  
   → the turn-3 stuck, booked «نامعلوم» before, is re-attributed to cause = prerequisite in both mind card and dossier once the diagnosis lands
4. [events] <span dir="rtl">U: می‌خوام نمودار سه‌بعدی‌شو ببینم ولی اینجا هیچ ابزاری نداره، گیر کردم</span> — _context:_ <span dir="rtl">adult; no 3-D plot tool in the system</span>  
   → stuck booked cause = «سامانه» (missing tool), not her «فهم» weakness; no percent drop on her side
5. [chat] <span dir="rtl">A: (inner √ re-check) √۸۱؟ ‖ U: ۹</span> — _context:_ <span dir="rtl">nested stack, inner child just mastered</span>  
   → stack pops ONE level: return to «فیثاغورس» (the nearest open waiting step), restated; the main step is not reopened yet; parent not marked mastered before this
6. [chat] <span dir="rtl">U: آهان پس فیثاغورس اینه، فهمیدم. ولی حالا این ۱۴۴ رو چطوری رادیکال بگیرم؟</span> — _context:_ <span dir="rtl">teen; mastery «yes» for فیثاغورس and a NEW prereq «جذر» in the same turn</span>  
   → turn question = only the new diagnostic for جذر; no second mastery question beside it (one question)
7. [chat] <span dir="rtl">A: [return to step s3] ‖ U: خب پس ارتفاع ۱۲ میشه، مساحت ۶۰</span> — _context:_ <span dir="rtl">adult; she took the waiting step herself</span>  
   → no forced «اول بگو کجا بودیم» restatement; the step is booked done; next turn question moves forward
8. [chat] <span dir="rtl">[problem closed via chat_solved] ‖ U: من کلاً خنگم، این چیزا تو کتم نمیره</span> — _context:_ <span dir="rtl">teen; the problem had prereq «فیثاغورس»</span>  
   → the ability rule still fires after closure: page line names the gap («کمبود قضیهٔ فیثاغورس بود، نه توانِ تو»); no bare reassurance
9. [chat] <span dir="rtl">U: مغزم دیگه نمی‌کشه</span> — _context:_ <span dir="rtl">adult during an open prerequisite</span>  
   → counted as a self-label: the gap-naming line appears; mind card books no ability cause
10. [chat] <span dir="rtl">U: بنده کلاً استعداد ریاضی ندارم</span> — _context:_ <span dir="rtl">elder 64, «شما»</span>  
   → self-label recognised; the gap is named in «شما» («آنچه کم بود …، نه استعدادِ شما»)
11. [page] <span dir="rtl">[page] chat problem with 🧩 «فیثاغورس» ‖ [page] «🎯 مسئلهٔ زنده بساز» from that chat</span> — _context:_ <span dir="rtl">chat ⇒ live</span>  
   → the 🧩 record now carries the live problem's pid (visible from its page), not only the chat session id

### Negative (look-alike)

1. [events] <span dir="rtl">U: نمی‌دونم کدوم دانشگاه رو انتخاب کنم</span> — _context:_ <span dir="rtl">adult; decision, no stack open</span>  
   → not a prerequisite; no cause = prerequisite booked
2. [events] <span dir="rtl">[stack closed, step resumed] ‖ U: اینجا گیر کردم</span> — _context:_ <span dir="rtl">after the return</span>  
   → booked normally (knot/skill per evidence), not prerequisite
3. [events] <span dir="rtl">U (turn 2, step s1): نمی‌دونم ‖ … (prereq diagnosed on step s3)</span> — _context:_ <span dir="rtl">different step</span>  
   → the s1 «نامعلوم» stuck stays «نامعلوم»; only same-step stucks are re-attributed
4. [events] <span dir="rtl">U: نمودارشو کشیدم ولی نمی‌فهمم چرا اینجوریه</span> — _context:_ <span dir="rtl">the plot tool exists and worked</span>  
   → not cause = system; booked by the usual rules
5. [chat] <span dir="rtl">U: وای مغزم کار کرد!! حل شد</span> — _context:_ <span dir="rtl">joy, not a self-label</span>  
   → no ability line; no gap-naming
6. [chat] <span dir="rtl">U: داداشم خنگه، هیچی بلد نیست</span> — _context:_ <span dir="rtl">about someone else</span>  
   → not her self-label; no ability line about her
7. [chat] <span dir="rtl">A: √۸۱؟ ‖ U: ۴۰٫۵</span> — _context:_ <span dir="rtl">mastery re-check failed</span>  
   → no pop, waiting step not marked done; one more teaching move at the same level
8. [chat] <span dir="rtl">[inner child closed, parent re-check passed]</span> — _context:_ <span dir="rtl">both levels done</span>  
   → parent may now be marked mastered and the main step resumes — closing is allowed here

## Q3.chat_page_story · chat ⇄ page is one story (validated chat statement/plan/u-b answers/step reports/guesses feed forms as «از گفت‌وگو: … درست است؟», never re-asked; live stage advances from coach_state; whole-first dropped; a later live problem imports chat work; route map for chat problems: origin = statement, destination = unknown, main line from chat plan, nesting kept after closure, events bound to their own problem, unclipped concept labels with real outcomes and hover tips, geo strip never stale; model can open a chat problem's route)


### Positive

1. [page] <span dir="rtl">U: می‌خوام کف اتاق ۴ در ۶ رو کاشی کنم، کاشی‌ها ۴۰ در ۴۰ ان. چند تا بخرم؟ ‖ [page] open u-form</span> — _context:_ <span dir="rtl">adult chat problem</span>  
   → statement field shows «از گفت‌وگو: «کفِ اتاقِ ۴×۶ با کاشیِ ۴۰×۴۰؛ چند کاشی؟» درست است؟» with confirm/edit; the u-form does NOT ask «مسئله را بنویس» again
2. [route] <span dir="rtl">U: اول مساحت کفو حساب میکنم، بعد تقسیم بر مساحت یه کاشی، آخرشم ۱۰ درصد اضافه برای شکستگی</span> — _context:_ <span dir="rtl">same problem, plan in chat (no ZWNJ)</span>  
   → plan form prefilled as «از گفت‌وگو» with three steps; route map main line shows three points in her order: مساحتِ کف ⇐ تقسیم ⇐ ۱۰٪ اضافه
3. [route] <span dir="rtl">[page] 🧭 route map of that chat problem</span> — _context:_ <span dir="rtl">chat problem, no live problem</span>  
   → origin = her statement (not «پروندهٔ این گفت‌وگو (بی مسئلهٔ زنده)»); destination = the unknown «تعدادِ کاشی‌ها»
4. [route] <span dir="rtl">U: ولی خب ۲۴ تقسیم بر ۰٫۱۶ چرا اینقدر زیاد میشه؟ ‖ [page] 🧭</span> — _context:_ <span dir="rtl">side sentence after the statement</span>  
   → destination stays «تعدادِ کاشی‌ها»; her side sentence is never taken as the destination
5. [events] <span dir="rtl">U: حدسم حدود ۲۰۰ تاست ‖ … ‖ U: نه ۱۵۰ شد، پس حدسم غلط بود</span> — _context:_ <span dir="rtl">guess then her own test</span>  
   → guess point on the map and dossier line show «رد شد» (not «آزموده نشده»); hover tip says what refuted it
6. [page] <span dir="rtl">U: خب مساحت کف شد ۲۴ متر مربع</span> — _context:_ <span dir="rtl">stage was «طرح»; coach_state step report</span>  
   → live stage advances to «اجرا» from coach_state; geo strip «اکنون: اجرا»
7. [prompt] <span dir="rtl">U: کل مسئله اینه که بفهمم با ۵ میلیون کدوم یکی از سه تا لپ‌تاپ به کارم میاد</span> — _context:_ <span dir="rtl">whole stated in chat, turn 1</span>  
   → the whole-first question «کلِ مسئله را در یک جمله…» is never asked afterwards in this problem (not on turn 2, not after a reload)
8. [page] <span dir="rtl">[9 chat turns: statement, plan, two step reports] ‖ [page] «🎯 مسئلهٔ زنده بساز»</span> — _context:_ <span dir="rtl">elder 67, «شما»</span>  
   → the new live problem imports statement, plan and step reports; stage starts at the current stage (e.g. «اجرا»), not «فهمِ مسئله»; u0 whole-first not re-asked; lines in «شما»
9. [time] <span dir="rtl">D0: plan in chat ‖ D2 (Wed 2026-10-21): her review day, open Today/strip</span> — _context:_ <span dir="rtl">multi-day</span>  
   → strip shows the chat plan and current step, never «طرح هنوز نیست»
10. [route] <span dir="rtl">[problem with nested prereq فیثاغورس ← جذر closed via chat_solved] ‖ [page] 🧭</span> — _context:_ <span dir="rtl">teen</span>  
   → after closure the map still shows both detours with their nesting depth and both rejoins; concepts kept; not flattened
11. [route] <span dir="rtl">[problem 1 guess + correction] ‖ U: حالا یه مسئله‌ی دیگه: … ‖ [page] 🧭 of problem 2</span> — _context:_ <span dir="rtl">two chat problems in one session</span>  
   → problem 2's map and dossier show only problem 2 events; problem 1's guess/correction stay on problem 1
12. [route] <span dir="rtl">[page] hover on a prerequisite point</span> — _context:_ <span dir="rtl">detour «قضیهٔ فیثاغورس»</span>  
   → label shows «قضیهٔ فیثاغورس» unclipped (not «پیش‌نیاز پیش…»); «پیش‌نیاز» once; hover tip non-empty (concept + her quote + outcome)
13. [route] <span dir="rtl">[problem solved] ‖ [page] geo strip</span> — _context:_ <span dir="rtl">after a solve</span>  
   → strip «حل شد» / «بازنگری», never stale «اکنون: فهمِ مسئله»
14. [route] <span dir="rtl">U: نقشه‌ی مسیر همون مسئله‌ی کاشی رو نشونم بده</span> — _context:_ <span dir="rtl">chat problem, no live pid</span>  
   → the model has a session id / route action in its prompt and opens that problem's route; no «باید از پنل باز کنی»
15. [page] <span dir="rtl">U: آره با نسبت هم میشه حلش کرد، سریع‌تره</span> — _context:_ <span dir="rtl">look-back answer in chat</span>  
   → look-back form shows it «از گفت‌وگو: … درست است؟», not re-asked
16. [page] <span dir="rtl">U: اول می‌شمارم بعد تقسیم می‌کنم</span> — _context:_ <span dir="rtl">child 9, plan in chat</span>  
   → plan form prefilled with her words; confirm line in simple «تو» words
17. [page] <span dir="rtl">U: فرض کنید زمینی ۳۰۰ متری داریم و شرط این است که نصفش فضای سبز باشد</span> — _context:_ <span dir="rtl">elder «شما», u-answers (data, condition)</span>  
   → u-form data row «۳۰۰ متر» and condition «نصف فضای سبز» prefilled «از گفت‌وگو» in «شما»; not re-asked
18. [page] <span dir="rtl">U: جوابش ۶۰ شد، واحدشم چک کردم درسته</span> — _context:_ <span dir="rtl">result + check</span>  
   → stage advances to «بازنگری»; turn question does not re-ask the check she reported
19. [route] <span dir="rtl">U: ببخشید، ۴ در ۶ نبود، ۵ در ۶ بود</span> — _context:_ <span dir="rtl">correction in a chat problem</span>  
   → back-jump arc on THIS problem's map at the statement point; dossier one correction event
20. [page] <span dir="rtl">[page] «از گفت‌وگو: «۳۰۰ متر» درست است؟» ‖ [page] she clicks «درست است»</span> — _context:_ <span dir="rtl">confirmation</span>  
   → value saved to the form; one event booked (no duplicate «ثبت شد» lines)

### Negative (look-alike)

1. [page] <span dir="rtl">A: (suggests) شاید بهتر باشه اول محیط رو حساب کنی ‖ U: نه، همون مساحت</span> — _context:_ <span dir="rtl">assistant suggestion she rejected</span>  
   → the assistant's suggestion is NOT fed into the plan form
2. [page] <span dir="rtl">[problem 1 plan in chat] ‖ [page] problem 2 plan form</span> — _context:_ <span dir="rtl">two problems</span>  
   → problem 1's plan does not appear in problem 2's form
3. [page] <span dir="rtl">[page] «از گفت‌وگو: … درست است؟» ‖ [page] she clicks «ویرایش» and types another value</span> — _context:_ <span dir="rtl">rejected prefill</span>  
   → her typed value is saved; the chat value is not; no silent overwrite later
4. [prompt] <span dir="rtl">U: یه دونه عدد بهم دادن، ۲۴</span> — _context:_ <span dir="rtl">only a datum, no whole</span>  
   → whole-first question may still be asked (once) — not dropped
5. [page] <span dir="rtl">A: حل شد! ‖ (no coach_state step report, she said nothing)</span> — _context:_ <span dir="rtl">model claim only</span>  
   → stage does not advance on the model's claim
6. [page] <span dir="rtl">[coach_state step report quoting a sentence she never wrote]</span> — _context:_ <span dir="rtl">invalid quote</span>  
   → rejected; stage unchanged; not fed to forms
7. [page] <span dir="rtl">[page] she typed plan step «تقسیم بر ۰٫۱۶» ‖ U (chat): تقسیم بر ۰٫۲</span> — _context:_ <span dir="rtl">her typed copy exists</span>  
   → page form not overwritten silently; asked «این‌جا هم عوض شود؟»
8. [route] <span dir="rtl">[live problem with page-typed plan] ‖ [page] 🧭</span> — _context:_ <span dir="rtl">live problem</span>  
   → map from the page plan; no duplicate points from chat echoes
9. [page] <span dir="rtl">U: امروز ۸۰٪ کارت‌ها یادم بود</span> — _context:_ <span dir="rtl">practice self-report</span>  
   → not a step report; stage unchanged; no form prefill
10. [route] <span dir="rtl">[problem still open at «طرح»] ‖ [page] geo strip</span> — _context:_ <span dir="rtl">open problem</span>  
   → strip «اکنون: طرح» (not «حل شد»)
11. [route] <span dir="rtl">U: حدسم ۲۰۰ تاست (never tested) ‖ [page] hover</span> — _context:_ <span dir="rtl">untested guess</span>  
   → «آزموده نشده» is correct here
12. [route] <span dir="rtl">[page] point label «مساحت»</span> — _context:_ <span dir="rtl">short label</span>  
   → shown as is, no ellipsis
13. [route] <span dir="rtl">[earlier session's problem P3 events] ‖ [page] today's problem P5 🧭</span> — _context:_ <span dir="rtl">other session</span>  
   → P3 events not shown on P5
14. [route] <span dir="rtl">U: (in problem 2) مجهولِ اون یکی سرعت بود</span> — _context:_ <span dir="rtl">talking about the other problem</span>  
   → not taken as problem 2's destination

## Q4.corrections · corrections (copy candidates incl. pinned goal, numeric results/ans, live statement, every typed form row; number role: range bounds, count words, masked digits; every pair of a multi-pair ✏️; deadline what-part; no garble; misstated ≠ refuted; neighbour words kept; verdicts without `rests`; chat «بله» answers the copy ask; never silent; change line with differing part + reason; dependent guesses; title)


### Positive

1. [chat] <span dir="rtl">U: ببخشید مهمونا ۱۰ نفر نیستن، ۱۲ نفرن</span> — _context:_ <span dir="rtl">adult; pinned goal «هدف: غذای ۱۰ نفر»; result line «۴۵ پرس» computed from 10</span>  
   → statement fixed; copy ask for the pinned goal «۱۰ نفر ⇒ ۱۲ نفر؟»; result «۴۵» marked as depending on 10 (set aside or asked), shown as the full result line, not a fragment
2. [chat] <span dir="rtl">U: قیمت ۸۰۰ نبود، ۷۵۰ بود</span> — _context:_ <span dir="rtl">she typed data row «قیمت: ۸۰۰ تومان» in the u-form herself</span>  
   → copy ask on that typed row «این‌جا هم عوض شود؟» (round-22 behaviour restored); row stays ۸۰۰ until she answers
3. [chat] <span dir="rtl">U: ۸۰۰ رو اشتباه گفتم، ۷۵۰ه</span> — _context:_ <span dir="rtl">typed row says «هشتصد تومان» in words</span>  
   → number word «هشتصد» matched ⇒ copy asked
4. [chat] <span dir="rtl">U: ۱۸۰ متره نه ۲۰۰</span> — _context:_ <span dir="rtl">data line «۲۰۰ مترمربع»; her first message «200 m^2»</span>  
   → both copies asked (Latin digits + unit «m^2» ≡ «مترمربع»)
5. [edit] <span dir="rtl">[✏️] «۲۰ لیتر» ⇒ «۳۰ لیتر»</span> — _context:_ <span dir="rtl">live statement, plan row «۲۰ لیتر رو تقسیم بر ۴»</span>  
   → live statement copy and the typed plan row both asked
6. [chat] <span dir="rtl">U: ۱۲ کارتن نبود، ۱۵ تا بود</span> — _context:_ <span dir="rtl">plan row she typed: «۱۲ تا کارتن × ۲۴»</span>  
   → count words (کارتن/تا) count: plan row asked; «۱۲ تا کارتن» ≡ «۱۲ کارتن»
7. [chat] <span dir="rtl">U: عدد ؟۴۸۷؟ بود نه ؟۴۵۷؟</span> — _context:_ <span dir="rtl">masked-digit puzzle (s37 form); guess «۱۴۵۷۰» and verdict reference «؟۴۵۷؟»</span>  
   → applied: statement «؟۴۸۷؟»; dependent guess and verdict set aside/asked; never «چیزی ثبت نشد»; no spurious ask on the plan
8. [edit] <span dir="rtl">[✏️] شکر ۱ ⇒ ۱٫۵ پیمانه، کره ۱۰۰ ⇒ ۱۲۰ گرم</span> — _context:_ <span dir="rtl">two pairs in one edit</span>  
   → both pairs applied (changed has two entries); change line shows both differing parts; copies of each asked separately
9. [chat] <span dir="rtl">U: مهلت رو باید به شهرداری منطقه بدم نه شورایاری</span> — _context:_ <span dir="rtl">deadline «تحویلِ طرح به شورایاری» (s35 form)</span>  
   → deadline what-part changed to «شهرداریِ منطقه»; date unchanged; old kept as «اصلاح شد ⇐»
10. [chat] <span dir="rtl">U: عروسی برادرم ۱۸ اسفنده نه ۱۵</span> — _context:_ <span dir="rtl">statement «عروسی برادرم ۱۵ اسفنده، ۵ ماه مونده»</span>  
   → statement reads «عروسی برادرم ۱۸ اسفنده، ۵ ماه مونده» — no garble, word order kept
11. [chat] <span dir="rtl">U: اشتباه تایپ کردم، ۷۶ نه ۶۷</span> — _context:_ <span dir="rtl">a misstated datum</span>  
   → treated as «I misstated» ⇒ datum rewritten with history
12. [chat] <span dir="rtl">U: هر قرص ۵۰۰ نیست، ۲۵۰ میلی‌گرمه</span> — _context:_ <span dir="rtl">datum «هر قرص ۵۰۰ میلی‌گرم، روزی ۳ بار»</span>  
   → becomes «هر قرص ۲۵۰ میلی‌گرم، روزی ۳ بار»; «هر قرص» and «روزی ۳ بار» kept
13. [events] <span dir="rtl">U: ضلع ۱۰ نبود، ۸ بود (no `rests` reported)</span> — _context:_ <span dir="rtl">verdicts: «برهانِ کلی برای هر n» (does not use 10), «مساحت = ۱۰۰» (uses 10)</span>  
   → only the verdict consuming 10 is set aside; the general proof is kept with reason
14. [chat] <span dir="rtl">A: [copy ask open: «دادهٔ ۲: ۱۲۰؟»] ‖ U: آره عوض کن</span> — _context:_ <span dir="rtl">chat answer</span>  
   → applied exactly as pressing «بله»; the ask closes
15. [chat] <span dir="rtl">A: [ask on دادهٔ ۲] ‖ U: بله، دادهٔ ۲ رو هم عوض کن</span> — _context:_ <span dir="rtl">explicit target</span>  
   → «دادهٔ ۲» changed; no other copy touched
16. [page] <span dir="rtl">[page] change line after «۱۵ ⇒ ۱۲»</span> — _context:_ <span dir="rtl">clip test</span>  
   → change line shows the differing part «۱۵ ⇒ ۱۲» with a non-empty reason (her quote); never old == new
17. [events] <span dir="rtl">U: مخزن ۳۰ لیتره نه ۲۰</span> — _context:_ <span dir="rtl">guess «حدود ۱۰ لیتر — درست» derived from 20</span>  
   → dependent guess set aside/asked; not left «درست»
18. [page] <span dir="rtl">U: قالب ۲۲ سانتی‌ه نه ۲۰</span> — _context:_ <span dir="rtl">title «کیک برای قالبِ ۲۰»</span>  
   → title follows: «کیک برای قالبِ ۲۲»
19. [chat] <span dir="rtl">U: ببخشید، عرض کردم ۱۵۰ ولی درستش ۱۲۰ است</span> — _context:_ <span dir="rtl">elder «شما»</span>  
   → applied; copy asks and change line in «شما»
20. [chat] <span dir="rtl">U: نه نه ۷ تا بود نه ۶ تا</span> — _context:_ <span dir="rtl">child 9, statement «۶ تا بادکنک»</span>  
   → statement «۷ تا بادکنک»; her typed answer row asked
21. [chat] <span dir="rtl">U: 7 بود نه ۸</span> — _context:_ <span dir="rtl">Latin new, Persian old</span>  
   → «۸» copies matched across digit systems; stored in her own spelling
22. [chat] <span dir="rtl">U: هدفم ۵ کیلو نیست، ۳ کیلوئه</span> — _context:_ <span dir="rtl">pinned goal «۵ کیلو کم کنم تا عید»</span>  
   → pinned goal asked/updated; Today goal line follows after «بله»

### Negative (look-alike)

1. [edit] <span dir="rtl">[✏️] مخزن ۲۰ ⇒ ۱۷ مترمکعب</span> — _context:_ <span dir="rtl">her approximation «بین ۱۰ تا ۲۰ مترمکعب» elsewhere</span>  
   → the range bound «۲۰» is NOT a copy candidate; no ask; her approximation unchanged
2. [chat] <span dir="rtl">U: ۸ نفر نبودیم، ۹ نفر</span> — _context:_ <span dir="rtl">her line «۵ تا ۸ نفر جا داره»</span>  
   → range «۵ تا ۸» not offered
3. [chat] <span dir="rtl">U: جوابم ۶۱٫۵ بود ولی تست کردم رد شد</span> — _context:_ <span dir="rtl">refuted own result</span>  
   → not rewritten; outcome «رد شد» kept; no correction event
4. [chat] <span dir="rtl">U: ۶۷ ماه اشتباه بود</span> — _context:_ <span dir="rtl">aD3: her own guess ۶۷ refuted by her check</span>  
   → read as «my result was refuted», not a misstatement: guess text stays ۶۷ with «رد شد»; never rewritten to ۶۱٫۵
5. [page] <span dir="rtl">U: ۱۲ نفر بودن نه ۱۰ ‖ (she never answers the ask)</span> — _context:_ <span dir="rtl">typed copy</span>  
   → her typed row stays ۱۰ (never changed silently)
6. [chat] <span dir="rtl">U: مهمونا ۲۰ نفرن نه ۱۸</span> — _context:_ <span dir="rtl">her line «۲۰ دقیقه پیاده تا تالار»</span>  
   → «۲۰ دقیقه» not offered (different unit/role)
7. [chat] <span dir="rtl">U: ۱۲ نفر نه ۱۰</span> — _context:_ <span dir="rtl">her row «اتاق ۱۰ متری»</span>  
   → «۱۰ متری» not offered
8. [chat] <span dir="rtl">U: عدد ؟۴۸۷؟ بود</span> — _context:_ <span dir="rtl">another number «۱۴۸۷۰» in the plan</span>  
   → «۱۴۸۷۰» not matched as a copy of the masked pattern
9. [chat] <span dir="rtl">U: بله</span> — _context:_ <span dir="rtl">no copy ask open</span>  
   → nothing applied as a copy answer
10. [edit] <span dir="rtl">[✏️] شکر ۱ ⇒ ۱٫۵، نمک ۲ ⇒ ۳</span> — _context:_ <span dir="rtl">«نمک» not in her texts</span>  
   → sugar applied; the unmatched pair reported plainly; not «changed: []» for all
11. [chat] <span dir="rtl">U: مهلت سه‌شنبه نیست، چهارشنبه است</span> — _context:_ <span dir="rtl">deadline date-only</span>  
   → what-part unchanged; date ⇒ Wed 2026-10-21
12. [chat] <span dir="rtl">U: ۱۰۰ درصد مطمئنم که درسته</span> — _context:_ <span dir="rtl">not a correction</span>  
   → no copy candidates; nothing rewritten
13. [chat] <span dir="rtl">U: ۵ نفر نه ۴ نفر</span> — _context:_ <span dir="rtl">statement contains «سال ۱۴۰۵»</span>  
   → «۱۴۰۵» not touched
14. [chat] <span dir="rtl">U: یه کارتن دیگه هم اضافه کن</span> — _context:_ <span dir="rtl">indefinite «یه», not a fix</span>  
   → not a correction of «۱»
15. [chat] <span dir="rtl">U (in problem 2): ۱۲ نه ۱۰</span> — _context:_ <span dir="rtl">problem 1 also has «۱۰»</span>  
   → problem 1 copies untouched
16. [chat] <span dir="rtl">U: اشتباه کردم امروز اومدم سرکار</span> — _context:_ <span dir="rtl">no number fact</span>  
   → no correction, no copy ask

## Q5.classification_turnq · classification, routing, turn question, post-check (practice / model-use reports and greetings never a new problem or A191; openings behind a greeting or self-introduction route lla_coach; «بگو نه دیگه» not a correction; correction backup block only on corrections; page's own two-sentence turn question counted as ONE; «ثبت شد / ثبت می‌شود» without a correction is not a claim; cheat-sheet false positive; turn question fits the moment; never three questions; quotes validated)


### Positive

1. [prompt] <span dir="rtl">U: امروز تمرینو کامل یادم بود</span> — _context:_ <span dir="rtl">adult, practice case due today</span>  
   → booked as a practice result; NOT the «مسئلهٔ گفت‌وگو» subject; no A191 «کلِ مسئله را در یک جمله…»
2. [prompt] <span dir="rtl">U: ۸۰٪ کارت‌ها رو یادم بود، ۲ تاشو نه</span> — _context:_ <span dir="rtl">teen, practice report, Persian digits + «٪»</span>  
   → practice result 80% booked; no new problem; turn question about the two missed cards, not the whole-first
3. [prompt] <span dir="rtl">U: دیروز با مدلِ «کار از آخر» یه مشکلِ کاری‌مو حل کردم</span> — _context:_ <span dir="rtl">model-use report</span>  
   → booked as a use day of that model; no new problem; no A191
4. [route] <span dir="rtl">U: سلام من کیانم کلاس سومم. ۱۲ تا مداد رو چجوری بین ۳ نفر تقسیم کنیم</span> — _context:_ <span dir="rtl">child 9, opening turn</span>  
   → route = lla_coach (not lla_assistant); problem created without greeting/name
5. [route] <span dir="rtl">U: سلام وقتتون بخیر. بنده ۶۷ سالمه. می‌خواستم ببینم با این حقوق بازنشستگی می‌تونم قسط ۸ میلیونی بدم یا نه</span> — _context:_ <span dir="rtl">elder «شما», opening hidden behind greeting + self-introduction</span>  
   → route = lla_coach; age line parsed separately; problem = the instalment question
6. [route] <span dir="rtl">U: همسایه‌مون ماشینشو جلوی در ما پارک کرده، حق داره؟ بگو نه دیگه.</span> — _context:_ <span dir="rtl">s33 form</span>  
   → not a correction; route lla_coach; no correction backup block; no «(شاید) اصلاح» line
7. [prompt] <span dir="rtl">[page turn question: «اول ببین داده‌ها چه می‌گویند. مجهول دقیقاً چیست؟»] + model reply contains it verbatim</span> — _context:_ <span dir="rtl">two sentences, ONE «؟»</span>  
   → post-check counts ONE question in every path (live, chat, prerequisite, look-back); no «بیش از یک پرسش» flag
8. [prompt] <span dir="rtl">A: باشه، ثبت شد؛ فردا یادآوری می‌کنم</span> — _context:_ <span dir="rtl">no correction in play</span>  
   → post-check does not raise «صفحه هنوز اصلاح را انجام نداده»
9. [prompt] <span dir="rtl">U: خودم الان چک کردم، با واحدا هم جور درمیاد</span> — _context:_ <span dir="rtl">she just reported her check</span>  
   → turn question does not re-ask «آیا نتیجه را آزموده‌ای؟»; moves to look-back
10. [prompt] <span dir="rtl">U: این رو به لیستِ فرض‌هام اضافه کن: قیمت‌ها تا عید ثابت می‌مونه</span> — _context:_ <span dir="rtl">list request</span>  
   → turn question (if any) concerns that assumption (e.g. when to recheck it), not an unrelated step
11. [prompt] <span dir="rtl">U: مجهول همون تعداد کاشی‌هاست دیگه</span> — _context:_ <span dir="rtl">she has just stated the unknown</span>  
   → next turn question is not «مجهول چیست؟»
12. [prompt] <span dir="rtl">U: ثابتش کردم، ولی آخه چرا درسته؟</span> — _context:_ <span dir="rtl">aA2 form, teen 16</span>  
   → stage = look-back (not «طرح‌ریزی»); turn question about why / what else the proof shows
13. [prompt] <span dir="rtl">A: …تو گفتی «من هیچ‌وقت هندسه نخوندم»… (she never wrote it)</span> — _context:_ <span dir="rtl">invented quote inside the reply text</span>  
   → post-check flags the quote as not found in her messages

### Negative (look-alike)

1. [prompt] <span dir="rtl">U: سلام، خوبی؟</span> — _context:_ <span dir="rtl">greeting only, no problem yet</span>  
   → no problem/title created; no A191; a short greeting reply is fine
2. [prompt] <span dir="rtl">U: غلطه، یادم رفته بود فرمولش چی بود</span> — _context:_ <span dir="rtl">about her own recall</span>  
   → no correction hint or backup block
3. [prompt] <span dir="rtl">U: سقف ۱۲ بود نه ۱۰</span> — _context:_ <span dir="rtl">real correction</span>  
   → backup block may fire here (correct)
4. [prompt] <span dir="rtl">[page turn question] + model adds its own extra «این را چطور بررسی می‌کنی؟»</span> — _context:_ <span dir="rtl">two real questions</span>  
   → post-check counts two (the flag is right)
5. [prompt] <span dir="rtl">A: «۷۵۰» ثبت شد</span> — _context:_ <span dir="rtl">a correction IS in play</span>  
   → the claim is checked against changed[] (not exempted)
6. [prompt] <span dir="rtl">U: یه چیز جدید: می‌خوام عید سفر برم با بودجه ۲۰ میلیون، کجا برم؟</span> — _context:_ <span dir="rtl">real new problem after a practice report</span>  
   → new problem created; A191 allowed once
7. [prompt] <span dir="rtl">A: (cheat-sheet: list of 6 formulas, no question)</span> — _context:_ <span dir="rtl">B·D20 form</span>  
   → post-check raises no false positive
8. [prompt] <span dir="rtl">U: الان کجا بودیم؟</span> — _context:_ <span dir="rtl">neutral</span>  
   → turn question restates the place; may ask the next step — one question, never three

## Q6.territory_loop · territory loop (roadmap §19: sub-problem waiting on a sheet marked with its id on 🔭 / route map / dossier; page notices a registry change or the sheet closed with «پاسخ به برگهٔ دستیار #n»; verifies the new thing answers that step; Today «ابزارِ لازم آمد»; resumes the step; full territory list in the prompt before the gap decision)


### Positive

1. [page] <span dir="rtl">[gap sheet #101 filed for sub-problem «شبیه‌سازیِ جریانِ آب در لوله»]</span> — _context:_ <span dir="rtl">adult owner-like, D0 = Mon 2026-10-19</span>  
   → 🔭 shows the sub-problem «منتظرِ برگهٔ #101»; the route map point reads «منتظر #101»; the dossier line names #101 and the date
2. [time] <span dir="rtl">D0 sheet #101 ‖ D3 (Thu 2026-10-22): the registry gains the matching tool</span> — _context:_ <span dir="rtl">registry change</span>  
   → page notices on load, verifies the new tool answers the waiting step, adds Today «ابزارِ لازم آمد: …» on D3, and resumes the step
3. [time] <span dir="rtl">D0 sheet #102 ‖ D2: sheet closed with «پاسخ به برگهٔ دستیار #102»</span> — _context:_ <span dir="rtl">sheet closed by reply</span>  
   → verify ⇒ Today line ⇒ resume, same as a registry change
4. [prompt] <span dir="rtl">[the turn where the gap decision is made]</span> — _context:_ <span dir="rtl">prompt content</span>  
   → the full territory/system list is present (including s_comm and s_self), not truncated before the decision
5. [chat] <span dir="rtl">U: اون ابزاری که منتظرش بودیم بالاخره اومد؟</span> — _context:_ <span dir="rtl">owner-like, D1</span>  
   → answer from the waiting record: «هنوز نه — برگهٔ #101 باز است»
6. [page] <span dir="rtl">[two waiting sub-problems: #101 and #103] ‖ D4: #103 resolved</span> — _context:_ <span dir="rtl">two sheets</span>  
   → each marked with its own id; only #103's step resumes; #101 stays waiting
7. [time] <span dir="rtl">D5: tool built ‖ she opens the problem</span> — _context:_ <span dir="rtl">resume moment</span>  
   → turn question resumes exactly at the waiting step with the place restated
8. [events] <span dir="rtl">[waiting D0–D5, then resume]</span> — _context:_ <span dir="rtl">mind card</span>  
   → the waiting time is never booked as her stuck or weakness (cause = system if anything)
9. [chat] <span dir="rtl">U: کی میشه ادامه‌شو بریم؟</span> — _context:_ <span dir="rtl">teen 15, waiting</span>  
   → honest line in «تو»: «منتظرِ برگهٔ #101 است؛ وقتی ساخته شد خودم خبرت می‌کنم»
10. [page] <span dir="rtl">[dossier after resume]</span> — _context:_ <span dir="rtl">history</span>  
   → dossier shows «منتظرِ #101 (D0) ⇐ ابزار آمد (D3) ⇐ ادامه» — nothing deleted

### Negative (look-alike)

1. [page] <span dir="rtl">[ordinary stuck, no sheet filed]</span>  
   → no waiting marker anywhere
2. [time] <span dir="rtl">D3: registry change for an unrelated tool</span> — _context:_ <span dir="rtl">different tool</span>  
   → no «ابزارِ لازم آمد»; #101 still waiting
3. [time] <span dir="rtl">D2: sheet #101 closed as «ساخته نمی‌شود»</span> — _context:_ <span dir="rtl">closed without build</span>  
   → no resume; an honest Today/dossier line; step stays open for another way
4. [time] <span dir="rtl">D3: tool built but its check against the step fails</span> — _context:_ <span dir="rtl">verification fails</span>  
   → not resumed; the mismatch recorded
5. [chat] <span dir="rtl">U: پاسخ به برگه‌ی دستیار #999</span> — _context:_ <span dir="rtl">unknown sheet id</span>  
   → nothing resumed; plain reply that no such waiting step exists
6. [page] <span dir="rtl">[she solves the sub-problem another way before the tool arrives]</span>  
   → marker closed with history; no later duplicate resume
7. [time] <span dir="rtl">D6: tool arrives for an already-closed problem</span>  
   → the closed problem is not reopened
8. [page] <span dir="rtl">[gap sheet filed for an idea, no sub-problem in a live problem]</span>  
   → no route-map waiting point invented; the sheet stays on its own record

## Q7.today_dossier_lists · Today / dossier / lists / practice / promises (one Today line per act; look-back invented problems in Today; deadline_done; no raw ids or raw refuted/confirmed; chat guess outcomes in the dossier; no duplicate correction/result lines; deferred requests stored as promises; list_add with a composed quote; no duplicate model items; consistent practice window; a prediction is never re-read as a guess)


### Positive

1. [time] <span dir="rtl">[plan «پنجشنبه برم بانک» + its follow-up + forecast «فکر کنم ۱ ساعت طول بکشه»] ‖ Thu 2026-10-22</span> — _context:_ <span dir="rtl">one act</span>  
   → ONE Today line on Thu that links plan, follow-up and forecast
2. [time] <span dir="rtl">D0 look-back invented «اگر ۴ شیر بود؟» ‖ D3 (Thu 2026-10-22)</span> — _context:_ <span dir="rtl">look-back family</span>  
   → the invented problem appears in Today
3. [chat] <span dir="rtl">U: امتحانو دیروز دادم</span> — _context:_ <span dir="rtl">deadline exam Sun 2026-10-18</span>  
   → deadline_done booked; Today no longer asks «تحویل دادی؟»
4. [page] <span dir="rtl">[Today and plan view]</span>  
   → no raw ids such as «(pl1)» or «dl_3»
5. [page] <span dir="rtl">[session dossier]</span>  
   → outcomes in Persian («رد شد / تأیید شد»), never raw «refuted / confirmed»
6. [events] <span dir="rtl">U: حدسم ۱۲ ـه ‖ … ‖ U: نه، امتحان کردم ۱۵ شد</span> — _context:_ <span dir="rtl">chat guess tested by her</span>  
   → dossier line «حدس ۱۲ — رد شد»
7. [events] <span dir="rtl">[one ✏️ correction ۸۰۰ ⇒ ۷۵۰]</span>  
   → exactly one correction line and one result line in the dossier
8. [chat] <span dir="rtl">U: فردا یادم بنداز اینو با هم حساب کنیم</span> — _context:_ <span dir="rtl">deferred request</span>  
   → stored as a promise; returns in Today on Tue 2026-10-20 (۲۸ مهر)
9. [chat] <span dir="rtl">U: فرضم اینه که ‖ U: قیمتا تا عید ثابت می‌مونه ‖ A: list_add(assumptions, quote = both)</span> — _context:_ <span dir="rtl">two consecutive messages</span>  
   → list_add accepts the composed quote «فرضم اینه که قیمتا تا عید ثابت می‌مونه»
10. [chat] <span dir="rtl">U: امروز مدلِ «کار از آخر» رو استفاده کردم</span> — _context:_ <span dir="rtl">model already on the shelf</span>  
   → no duplicate item; a use day added to the existing one
11. [page] <span dir="rtl">[practice case view, Today line, mind card]</span>  
   → the same practice window (e.g. «۳ روز دیگر») everywhere
12. [chat] <span dir="rtl">U: پیش‌بینی می‌کنم تا جمعه تموم شه</span> — _context:_ <span dir="rtl">prediction</span>  
   → booked as a prediction due Fri 2026-10-23; never re-read later as a new guess

### Negative (look-alike)

1. [time] <span dir="rtl">[two different acts on Thu]</span>  
   → two Today lines (correct)
2. [time] <span dir="rtl">deadline Tue 2026-10-20 (tomorrow)</span> — _context:_ <span dir="rtl">future</span>  
   → no «تحویل دادی؟» yet
3. [chat] <span dir="rtl">U: هنوز امتحانو ندادم، هفته‌ی بعده</span>  
   → no deadline_done
4. [events] <span dir="rtl">U: حدسم ۱۲ (never tested)</span>  
   → «آزموده نشده» is right
5. [chat] <span dir="rtl">U: فرضم اینه ‖ U: راستی ناهار چی بخورم ‖ U: قیمتا ثابت</span> — _context:_ <span dir="rtl">non-consecutive</span>  
   → not composed silently; ask or take one message
6. [chat] <span dir="rtl">U: یه مدل جدید ساختم به اسم «سه قدم»</span> — _context:_ <span dir="rtl">new model</span>  
   → a new item (correct)
7. [chat] <span dir="rtl">U: حدس می‌زنم جواب ۱۲ باشه</span> — _context:_ <span dir="rtl">a guess</span>  
   → booked as a guess, not a prediction
8. [chat] <span dir="rtl">U: شاید یه روز بعداً</span> — _context:_ <span dir="rtl">vague</span>  
   → no promise invented
