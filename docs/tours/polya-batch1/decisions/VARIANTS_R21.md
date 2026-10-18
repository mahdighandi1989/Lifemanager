# VARIANTS_R21 — independent variant bank (round 21 root mechanisms R1–R9)

Written from DECISIONS_R21, the round-21 runner reports (B–D; no A handback existed when this was written) and models21/SUMMARY.md only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-18 (Sunday; ۱۴۰۵/۰۷/۲۶) for all date expectations; Persian week: Sat 17 (دیروز, ۲۵ مهر), **Sun 18 (today)**, Mon 19, Tue 20 (پس‌فردا, ۲۸ مهر), Wed 21 (۲۹ مهر), Thu 22 (۳۰ مهر), Fri 23 (۱ آبان), Sat 24 (۲ آبان), Sun 25, Mon 26. «شنبه» without qualifier = Sat 2026-10-24.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / panels, [events] dossier/mind-card readings, [time] day sequences under the test clock (D0 = Sun 2026-10-18), [prompt] what the prompt/reply/post-check contains, [route] AI task route chosen.
Multi-message entries use « ‖ » between messages (U = user, A = assistant, «[…]» = a page action/result); _context_ says how many user turns back the corrected message is. Old values always stay as history («اصلاح شد ⇐»); nothing is deleted; withdrawn ≠ deleted. Machine-readable copy: VARIANTS_R21.json (fields rc, kind, role, text, expect, optional context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| R1.routing_by_page | 22 | 16 |
| R2.practice_from_chat | 9 | 8 |
| R3.correction_reach | 24 | 14 |
| R4.dossier | 9 | 8 |
| R5.practice_time | 12 | 9 |
| R6.floor_compensation | 9 | 8 |
| R7.postcheck | 8 | 8 |
| R8.turn_edges | 8 | 8 |
| R9.small | 8 | 8 |
| **total** | 109 | 87 |

## R1.routing_by_page · routing by the page's own classification (opening turns of every kind ⇒ lla_coach; pure commands / ✏️ / «[سامانه]» ⇒ lla_assistant)

### Positive

1. [route] <span dir="rtl">U: یه معما: سه تا جعبه داریم، روی هر سه برچسب غلط خورده؛ با برداشتن فقط یه میوه از یه جعبه چطوری همه رو درست کنم؟</span> — _context:_ <span dir="rtl">opening turn, no live problem, puzzle</span>  
   → «lla_coach» — first message that states a problem (page's own problem detector); no keyword like «مسئله/گیر» needed; the same turn writes «مسئلهٔ گفت‌وگو» into «# وضعِ کنونی»
2. [route] <span dir="rtl">U: دو تا شیر آب، یکی مخزن رو ۳ ساعته پر می‌کنه یکی ۶ ساعته. با هم چقدر طول می‌کشه؟</span> — _context:_ <span dir="rtl">opening turn, rate problem</span>  
   → «lla_coach»; the reply coaches (asks what is unknown / what she already tried), does not just output «۲ ساعت»
3. [route] <span dir="rtl">U: بزرگترین عدد سه رقمی که هم بر ۷ بخش‌پذیره هم بر ۱۱ چنده؟</span> — _context:_ <span dir="rtl">opening turn, extremum question, ZWNJ missing</span>  
   → «lla_coach» — a «بزرگ‌ترین … ؟» question with ZWNJ missing («بزرگترین») is still a problem statement
4. [route] <span dir="rtl">U: بزرگ‌ترین مساحتِ مستطیلی که محیطش ۲۰ متره چقدره؟</span> — _context:_ <span dir="rtl">opening turn</span>  
   → «lla_coach» (ZWNJ present variant of the previous entry)
5. [route] <span dir="rtl">U: فقط جواب رو بگو: ۱+۲+…+۱۰۰ چند می‌شه؟</span> — _context:_ <span dir="rtl">opening turn, answer-only request</span>  
   → «lla_coach» — «فقط جواب رو بگو» is a request style, not a page command; the problem detector fires; coach may give the answer briefly with a check offer per R2–R20 rules, but the tier is lla_coach
6. [route] <span dir="rtl">U: لطفاً فقط پاسخ نهایی را بفرمایید: معادلهٔ x² − 5x + 6 = 0 چه ریشه‌هایی دارد؟</span> — _context:_ <span dir="rtl">formal register, opening turn</span>  
   → «lla_coach»; reply in «شما»
7. [route] <span dir="rtl">U: بین دو تا پیشنهاد کار موندم؛ یکی حقوقش ۴۰ میلیونه ولی دوره، یکی ۳۲ ولی نزدیک خونه. کدومو بگیرم؟</span> — _context:_ <span dir="rtl">opening turn, life decision</span>  
   → «lla_coach» — life decision as the first message; «مسئلهٔ گفت‌وگو» written into «# وضعِ کنونی»
8. [route] <span dir="rtl">U: می‌خوام هر روز صبح ۲۰ دقیقه انگلیسی بخونم ولی همیشه بعد از سه روز ول می‌کنم</span> — _context:_ <span dir="rtl">opening turn, habit</span>  
   → «lla_coach» — habit plan problem, no «؟» at all
9. [route] <span dir="rtl">U: یه معما: سه تا جعبه … ‖ A: چه چیزی را می‌دانی؟ ‖ U: که همه‌ی برچسب‌ها غلطن</span> — _context:_ <span dir="rtl">2nd turn; problem stated 1 user turn back</span>  
   → «lla_coach» on the 2nd turn — chat problem in focus (the «مسئلهٔ گفت‌وگو» condition) even though the message has no problem keyword
10. [route] <span dir="rtl">U: دو تا شیر آب … ‖ A: … ‖ U: نمی‌دونم ‖ A: … ‖ U: باشه</span> — _context:_ <span dir="rtl">3rd turn; problem stated 2 user turns back</span>  
   → «lla_coach» on turn 3 «باشه» — focus persists; short acknowledgements in a chat problem stay coach
11. [route] <span dir="rtl">U: بین دو تا پیشنهاد کار موندم … ‖ A: … ‖ U: خب حقوق برام مهم‌تره ولی خسته می‌شم. اینو یه جا ثبتش کن</span> — _context:_ <span dir="rtl">2nd turn; mixed content + command</span>  
   → «lla_coach» — mixed message (content + «ثبتش کن») is NOT ACT_ONLY; the record action is still carried out in the same coach turn
12. [route] <span dir="rtl">U: حدسم اینه که جوابش ۵۰۵۰ ـه، ثبت کن</span> — _context:_ <span dir="rtl">mixed guess + command, ZWNJ n/a</span>  
   → «lla_coach» — a guess with a trailing command stays coach (guess booked)
13. [route] <span dir="rtl">U: گیر کردم سر همون مسئله‌ی مخزن، باز کن ببینم کجا بودم</span> — _context:_ <span dir="rtl">live problem exists; «باز کن» inside a stuck report</span>  
   → with a live problem present: «lla_coach»; the live-problem head is checked BEFORE the «باز کن» action-only test
14. [route] <span dir="rtl">U: اشتباه گفتم، شیر دوم ۴ ساعته پر می‌کنه نه ۶</span> — _context:_ <span dir="rtl">chat correction, 2 user turns after the statement</span>  
   → «lla_coach» — a correction typed in chat (coach layer on), even without a live problem
15. [route] <span dir="rtl">U: حالا که حل شد، چی ازش یاد گرفتم؟</span> — _context:_ <span dir="rtl">look-back turn</span>  
   → «lla_coach» — look-back
16. [route] <span dir="rtl">[page] «# مربیِ حل» block present (live problem at stage «طرح»), U: هوم</span> — _context:_ <span dir="rtl">live problem, one-word message</span>  
   → «lla_coach» — coach block on ⇒ coach tier, however short the message
17. [route] <span dir="rtl">[page] an open practice case T41 being worked; U: این دفعه ۶۰ درصدش یادم بود</span> — _context:_ <span dir="rtl">practice case open</span>  
   → «lla_coach» — open practice case being worked (practice report)
18. [route] <span dir="rtl">[page] tour tutor block on; U: نفهمیدم این قسمت چی می‌گه</span> — _context:_ <span dir="rtl">tour tutor</span>  
   → «lla_coach»
19. [route] <span dir="rtl">U: Prove that the sum of two odd numbers is even</span> — _context:_ <span dir="rtl">opening turn, English</span>  
   → «lla_coach» — Latin-only problem statement is detected the same way
20. [route] <span dir="rtl">U: مسئله‌ی دیروزمون رو ادامه بدیم؟ همون که با ۷ و ۱۱ بود</span> — _context:_ <span dir="rtl">new session, references yesterday's chat problem</span>  
   → «lla_coach» — resuming a chat problem in a new session
21. [route] <span dir="rtl">U: یه معما … (lla_coach) ‖ [page] post-check rewrite request</span> — _context:_ <span dir="rtl">rewrite of a coach turn</span>  
   → the rewrite call keeps «lla_coach» (rewrites keep the turn's tier)
22. [route] <span dir="rtl">U: چطور می‌تونم ثابت کنم بین هر ۵ نقطه در یک مربع با ضلع ۲، دو تاشون فاصله‌شون حداکثر √2 ـه؟</span> — _context:_ <span dir="rtl">olympiad opening, √ symbol</span>  
   → «lla_coach»; formula text kept as typed

### Negative (look-alike)

1. [route] <span dir="rtl">U: یه یادآور برای پنجشنبه ساعت ۱۰ بذار</span> — _context:_ <span dir="rtl">no chat problem</span>  
   → «lla_assistant» — pure command, no problem in focus; reminder 2026-10-22 10:00
2. [route] <span dir="rtl">U: آره، ثبتش کن.</span> — _context:_ <span dir="rtl">inside chat problem, pure command</span>  
   → «lla_assistant» — nothing but a command (ACT_ONLY), even inside a chat problem
3. [route] <span dir="rtl">U: ثبت کن</span> — _context:_ <span dir="rtl">pure command, no ZWNJ issue</span>  
   → «lla_assistant» — bare command
4. [route] <span dir="rtl">U: صفحه‌ی تمرین‌ها رو باز کن</span> — _context:_ <span dir="rtl">pure navigation</span>  
   → «lla_assistant» — navigation only; no live problem head fires
5. [route] <span dir="rtl">✏️ on her bubble «شیر دوم ۶ ساعته» → «شیر دوم ۴ ساعته»</span> — _context:_ <span dir="rtl">✏️ turn</span>  
   → «lla_assistant» — ✏️ turns stay on the fast tier even inside a chat problem
6. [route] <span dir="rtl">[سامانه: نتیجهٔ ثبت — انجام نشد]</span> — _context:_ <span dir="rtl">automatic follow-up</span>  
   → «lla_assistant» — automatic «[سامانه …]» follow-up
7. [route] <span dir="rtl">[سامانه: رکورد ساخته شد] (follow-up after a coach turn)</span> — _context:_ <span dir="rtl">automatic follow-up</span>  
   → «lla_assistant»; NOT promoted to lla_coach because the previous turn was coach
8. [route] <span dir="rtl">U: سلام</span> — _context:_ <span dir="rtl">fresh session</span>  
   → «lla_assistant» — greeting, no problem stated, no focus
9. [route] <span dir="rtl">U: ممنون، فعلاً خداحافظ</span> — _context:_ <span dir="rtl">closing pleasantry, no focus</span>  
   → «lla_assistant» if no coach layer was on; (if a chat problem is in focus the tier may stay coach — not graded)
10. [route] <span dir="rtl">U: لیست کارهای امروزم رو نشون بده</span> — _context:_ <span dir="rtl">pure command</span>  
   → «lla_assistant» — data lookup command
11. [route] <span dir="rtl">U: تاریخ امروز چنده؟</span> — _context:_ <span dir="rtl">factual one-liner, not a problem</span>  
   → «lla_assistant»; answer «یکشنبه ۲۶ مهر ۱۴۰۵» (2026-10-18)
12. [route] <span dir="rtl">U: همون یادآور پنجشنبه رو یه ساعت عقب بنداز</span> — _context:_ <span dir="rtl">pure command</span>  
   → «lla_assistant» — command on an existing record, no problem focus
13. [route] <span dir="rtl">U: لطفاً پروندهٔ این گفت‌وگو را باز کنید</span> — _context:_ <span dir="rtl">formal command</span>  
   → «lla_assistant» — formal pure command
14. [route] <span dir="rtl">[سامانه: نتیجهٔ ✏️ — تغییرات: …]</span> — _context:_ <span dir="rtl">✏️ follow-up</span>  
   → «lla_assistant»
15. [route] <span dir="rtl">U: یه معما … (lla_coach) ‖ U: آره ثبتش کن</span> — _context:_ <span dir="rtl">ACT_ONLY inside focus</span>  
   → 2nd message is «lla_assistant» (pure command), the 1st stays «lla_coach»; focus is not lost for the next content turn
16. [route] <span dir="rtl">U: «بزرگ‌ترین» یعنی چی؟ املاش با فاصله‌ست؟</span> — _context:_ <span dir="rtl">keyword look-alike</span>  
   → «lla_assistant» — spelling question about a word; no problem detector hit (only the word «بزرگ‌ترین»)

## R2.practice_from_chat · practice can start from chat (start_practice with a subject, look-back offer, complete technique list, «🧪» button)

### Positive

1. [prompt] <span dir="rtl">U: یه پرونده‌ی تمرین براش باز کن (chat problem in focus, no case open)</span> — _context:_ <span dir="rtl">chat problem, no case</span>  
   → prompt describes start_practice even with no case open; model emits start_practice for the subject; with her consent already given (her own request) the case opens; no navigation-only answer
2. [prompt] <span dir="rtl">U: برای سنجیدن پیش‌بینی‌هام یه پرونده‌ی تمرین باز کن</span> — _context:_ <span dir="rtl">life calibration, no case</span>  
   → start_practice offered/emitted with technique T24 (calibration); case opens from chat; Today shows the case line
3. [prompt] <span dir="rtl">U: می‌خوام تکنیک «اول حالت خاص» رو تمرین کنم</span> — _context:_ <span dir="rtl">technique subject</span>  
   → start_practice available with the technique subject; technique list sent to the model includes it even if its index > 25
4. [prompt] <span dir="rtl">[page] technique list in prompt</span> — _context:_ <span dir="rtl">list completeness</span>  
   → complete list: T1…T41+ all present (T41 visible); no 1–25 clip
5. [prompt] <span dir="rtl">U: … حالا که حل شد درسم اینه که اول شکل بکشم (look-back)</span> — _context:_ <span dir="rtl">look-back offer</span>  
   → look-back prompt includes start_practice as an OFFER («می‌خواهی تمرینش کنیم؟»); the case does not open until she says yes
6. [prompt] <span dir="rtl">U: … (look-back offer shown) ‖ U: آره بازش کن</span> — _context:_ <span dir="rtl">1 turn after offer</span>  
   → case opens on her yes (consent rule R20 unchanged); one case, linked to the problem
7. [page] <span dir="rtl">«🧪» view with no open case</span> — _context:_ <span dir="rtl">page</span>  
   → a «شروعِ تمرین» button exists and opens the case for the chosen technique
8. [prompt] <span dir="rtl">U: لطفاً برای این روش یک برنامهٔ تمرین بسازید</span> — _context:_ <span dir="rtl">formal</span>  
   → formal request ⇒ start_practice; reply in «شما»
9. [prompt] <span dir="rtl">U: یه پرونده تمرین براش باز کن (no ZWNJ / ezafe written as «پرونده تمرین»)</span> — _context:_ <span dir="rtl">ZWNJ missing</span>  
   → same as with ZWNJ: start_practice

### Negative (look-alike)

1. [prompt] <span dir="rtl">U: ممنون، فعلاً نه</span> — _context:_ <span dir="rtl">declined offer</span>  
   → after the look-back offer: no case opened; offer not repeated in the same session
2. [prompt] <span dir="rtl">U: سلام (no subject in session)</span> — _context:_ <span dir="rtl">no subject</span>  
   → start_practice NOT described in the prompt (no subject)
3. [prompt] <span dir="rtl">model emits start_practice on its own at look-back without her yes</span> — _context:_ <span dir="rtl">no consent</span>  
   → page refuses (consent rule); she sees one plain line; the model is told in the next turn
4. [prompt] <span dir="rtl">U: پرونده‌ی کارخونه رو باز کن</span> — _context:_ <span dir="rtl">word look-alike</span>  
   → «پرونده» of the factory, not a practice case — no start_practice
5. [prompt] <span dir="rtl">U: یه پرونده‌ی تمرین براش باز کن (case for that technique already open)</span> — _context:_ <span dir="rtl">duplicate request</span>  
   → no second case; the existing case is shown/focused
6. [page] <span dir="rtl">«🧪» start button with no technique chosen</span> — _context:_ <span dir="rtl">page</span>  
   → button asks which technique; does not create an empty case
7. [prompt] <span dir="rtl">U: تمرین‌هام کجان؟</span> — _context:_ <span dir="rtl">question</span>  
   → navigation only; no new case
8. [prompt] <span dir="rtl">U: دیروز تمرینمو کردم، ۷۰ درصد</span> — _context:_ <span dir="rtl">practice report</span>  
   → practice_log on the existing case, not start_practice

## R3.correction_reach · a correction reaches every record of the fact (copies by meaning/units, multi-message records, dependencies, deadlines, minimal spans, one result told to her and the model)

### Positive

1. [chat] <span dir="rtl">[page] her form d1 «سطحِ بامِ انبار ۲۰۰ مترمربع» ‖ U: بام انبار 200 m^2 ـه و بارش سالانه ۲۵۰ میلی‌متر ‖ A: … ‖ U: بام ۱۸۰ ـه نه ۲۰۰</span> — _context:_ <span dir="rtl">1 user turn back; units differ</span>  
   → normalized value+unit equivalence (200 m^2 = ۲۰۰ مترمربع) ⇒ chat datum changes ۲۰۰→۱۸۰ with history AND the page asks «این‌جا هم عوض شود؟» for d1 showing her field name (not an id) with both values «۲۰۰ مترمربع → ۱۸۰ مترمربع»; rainfall ۲۵۰ untouched
2. [chat] <span dir="rtl">[page] form «مساحت: ۲۰۰ متر مربع» (space instead of ZWNJ) ‖ U: مساحت‌و ۲۰۰ مترمربع گفته بودم، ۲۲۰ ـه</span> — _context:_ <span dir="rtl">copy wording differs by spacing</span>  
   → copy ask for the form field (۲۰۰ متر مربع ≡ ۲۰۰ مترمربع); on «بله» field → ۲۲۰ with history
3. [chat] <span dir="rtl">[page] step outcome she typed «یک کیلو اضافه شد» ‖ U: گام ۱ رو رفتم، یه کیلو اضافه شد ‖ … (5 turns) … ‖ U: نیم کیلو بود نه یه کیلو</span> — _context:_ <span dir="rtl">6 user turns back; colloquial vs formal copy</span>  
   → chat step report changes «یه کیلو»→«نیم کیلو»; page asks about her step outcome copy («یک کیلو» ≡ «یه کیلو»); step failure verdict stays (it doesn't depend on the amount)
4. [chat] <span dir="rtl">[page] 🌱 check-in «امروز سه تا اسکیس کشیدم» ‖ U: … سه تا اسکیس کشیدم ‖ U: دو تا بود</span> — _context:_ <span dir="rtl">🌱 copy</span>  
   → copy candidates include 🌱 check-ins ⇒ ask shown for the 🌱 text
5. [chat] <span dir="rtl">[page] understanding-form field «داده‌ها» contains «۸ ساعت کار در روز» ‖ U: روزی ۸ ساعت کار می‌کنم ‖ A: … ‖ U: ۹ ساعته، ببخشید</span> — _context:_ <span dir="rtl">understanding form copy</span>  
   → field-level key field:<data> found; ask shows the field name «داده‌ها»
6. [chat] <span dir="rtl">U: ساعت ۹ صبح نگهبان دیدم ‖ A: کی گزارشش رو نوشت؟ ‖ U: همون صبح. [A fills statement «نگهبان صبح ساعت ۹ دید و همان صبح گزارش نوشت»] ‖ … ‖ U: ظهر بود نه صبح</span> — _context:_ <span dir="rtl">composed record, 4 user turns back</span>  
   → statement composed from two messages carries one src per span; the span from msg 1 («ساعت ۹ صبح») ⇒ statement updated to «ظهر» in that span only, with history; the other span unchanged
7. [chat] <span dir="rtl">[سامانه] follow-up filled title «تابه‌ی ۲۵×۳۵» quoting her «تابه‌م ۲۵ در ۳۵ ـه» ‖ … ‖ U: تابه ۳۰ در ۴۰ بود</span> — _context:_ <span dir="rtl">9 user turns back; verdict depends</span>  
   → title + statement follow (src = her quoted message); «حل شد» that used the factor ۲٫۸ (from ۲۵×۳۵) is set aside with reason «یک داده‌ای که به کار رفته بود عوض شد»; execution reopens
8. [chat] <span dir="rtl">U: رسیدش ۱۲ مهر بود؛ مبلغ ۳ میلیون؛ امضای معاون داشت ‖ A: … ‖ U: تاریخش ۱۴ مهر بود</span> — _context:_ <span dir="rtl">1 user turn back; verdict depends on corrected datum</span>  
   → only the date datum changes; guess g2 «قبل از مهلت رسیده» whose test used the date is set aside with reason; «۳ میلیون» and «امضای معاون» stay
9. [chat] <span dir="rtl">U: ۵ تا تخم مرغ لازمه؛ فر ۱۸۰ درجه ‖ A: ✓ وارسی شد (counted with 5 eggs) ‖ U: ۴ تا تخم مرغ بود</span> — _context:_ <span dir="rtl">verdict depends</span>  
   → eggs ۵→۴; the check verdict that used eggs=۵ set aside («نیاز به وارسیِ دوباره»); oven ۱۸۰ stays
10. [chat] <span dir="rtl">U: ۵ تا تخم مرغ؛ فر ۱۸۰ ‖ A: درس: دمای فر مهمه ✓ ‖ U: ۴ تا تخم مرغ بود</span> — _context:_ <span dir="rtl">verdict independent; contrast pair</span>  
   → eggs changes; the lesson about the oven (doesn't use eggs) stays; no verdict set aside
11. [chat] <span dir="rtl">U: یادم بنداز پنجشنبه فرم رو بفرستم، فرمش سه صفحه‌ست ‖ … (10 turns) … ‖ U: فرم رو جمعه باید بفرستم نه پنجشنبه</span> — _context:_ <span dir="rtl">11 user turns back; deadline</span>  
   → deadline span = her clause «پنجشنبه فرم رو بفرستم»; `deadline` key in the prompt key list; reminder 2026-10-22 → 2026-10-23 (۱ آبان) with history; «سه صفحه» untouched; line shown to her «جمعه ۱ آبان»
12. [chat] <span dir="rtl">U: مهلت ثبت‌نام تا ۳۰ مهره ‖ A: … ‖ U: مهلتش تا ۲ آبانه</span> — _context:_ <span dir="rtl">1 back; Persian dates</span>  
   → deadline 2026-10-22 → 2026-10-24; reminder follows; one line «مهلت: پنجشنبه ۳۰ مهر ⇐ شنبه ۲ آبان»
13. [chat] <span dir="rtl">U: درسم اینه: اول حالت خاص رو امتحان کنم، با یه صفحه ببُرم ‖ … ‖ U: اولی رو این‌جوری درست کن: اول شکل بکشم</span> — _context:_ <span dir="rtl">4 back; lesson clause</span>  
   → minimal span: only clause 1 → «اول شکل بکشم»; clause 2 «با یه صفحه ببُرم» kept in lesson + card; verdict stays; self-correction event booked; corrected lesson re-booked
14. [edit] <span dir="rtl">✏️ «مخزن بتنی ۲۰ مترمکعبی، دیوار ۳ متر، ۴ ستون» → «مخزن بتنی ۲۵ مترمکعبی، دیوار ۳ متر، ۶ ستون»</span> — _context:_ <span dir="rtl">✏️ several numbers</span>  
   → one fragment per changed span (۲۰→۲۵, ۴→۶); plan pl1 «مخزن ۲۰ مترمکعبی» (plan src has a span) follows to ۲۵ and Today shows ۲۵; «دیوار ۳ متر» untouched; page result lists the plan change
15. [edit] <span dir="rtl">✏️ «حدسم ۱۲ ـه و ۱۵ دقیقه طول کشید» → «حدسم ۱۴ ـه و ۲۰ دقیقه طول کشید»</span> — _context:_ <span dir="rtl">✏️ two numbers</span>  
   → two fragments: guess 12→14 and duration 15→20 separate keys; change line shows «۱۲ ⇐ ۱۴» and «۱۵ ⇐ ۲۰»
16. [chat] <span dir="rtl">U: جوابم ۳۰ ـه ‖ … ‖ U: اون ۳۰ رو اشتباه زدم</span> — _context:_ <span dir="rtl">fix value missing</span>  
   → result structure {changed:[ans 30→?], ask:[«عددِ درست؟»], note} — fix missing ⇒ ask her once for the value; model receives the structure verbatim next turn
17. [chat] <span dir="rtl">U: امروز خیلی خسته‌ام، حدسم ۱۲ ـه ‖ U: خسته نبودم</span> — _context:_ <span dir="rtl">no-op told to both</span>  
   → no-op ⇒ {changed:[], note:«از آن تکه رکوردی ساخته نشده بود»}; she sees one plain line saying nothing needed changing; the model receives the same note (not dropped because it starts with «چیزی…»/«از…»)
18. [chat] <span dir="rtl">U: چیزی که گفتم غلط بود، اون ۸ ساعت نه ۷</span> — _context:_ <span dir="rtl">«چیزی» prefix not dropped</span>  
   → the page result whose note begins «چیزی…» still reaches the model verbatim
19. [chat] <span dir="rtl">model retract quotes the CURRENT message as msg</span> — _context:_ <span dir="rtl">refusal told to both</span>  
   → refusal ⇒ {changed:[], note:«نقل از پیامِ فعلی است»}; she sees one plain line; model told; no record changed
20. [chat] <span dir="rtl">U: تابه ۲۵×۳۵ ‖ … ‖ [page ask «این‌جا هم عوض شود؟» on her typed copy] ‖ U: بله</span> — _context:_ <span dir="rtl">copy-yes dependency</span>  
   → copy-yes changes the field AND sets aside verdicts/guesses that used that datum (same as retract)
21. [chat] <span dir="rtl">U: بارش ۲۰۰ میلی‌متر ‖ U: ببخشید ۲۵۰ ـه</span> — _context:_ <span dir="rtl">change line</span>  
   → change line shows the differing fragment «۲۰۰ ⇐ ۲۵۰» — not «بارش … ⇐ بارش …» clipped at the common prefix
22. [chat] <span dir="rtl">U: هفته‌ی هشتم وزنم ۷۴ شد ‖ U: ۷۴ و نیم بود</span> — _context:_ <span dir="rtl">plot + record</span>  
   → bubble marked «اصلاح شد ⇐»; weight log record (not just bubble text) changes; plot redrawn at ۷۴٫۵; week-8 result record no longer reports «رکوردی ساخته نشده بود»
23. [chat] <span dir="rtl">U: گام ۲ رو ۲۰ دقیقه رفتم ‖ U: ۳۰ دقیقه بود</span> — _context:_ <span dir="rtl">re-book + event</span>  
   → corrected result re-booked (new act src=current msg) + self-correction event; mind «از کجا؟» shows «پیامِ شما» not «rebook:u6»
24. [page] <span dir="rtl">copy candidates list for any correction</span> — _context:_ <span dir="rtl">candidate hygiene</span>  
   → excludes stale drafts and placeholders («مثلاً «پیشنهادِ کارِ دوم…»», «lpNewS»); includes plans, step outcomes, 🌱 check-ins, look-back fields, understanding-form fields; labels = her field names

### Negative (look-alike)

1. [chat] <span dir="rtl">U: بام ۲۰۰ مترمربع ‖ U: اگه بام ۱۵۰ بود چی می‌شد؟</span> — _context:_ <span dir="rtl">hypothetical</span>  
   → a question ⇒ nothing changes; no copy ask
2. [chat] <span dir="rtl">[page] form «۲۰۰ مترمربع» ‖ U: ۲۰۰ لیتر آب ریختم ‖ U: ۱۸۰ لیتر بود</span> — _context:_ <span dir="rtl">same number, different unit</span>  
   → different unit/meaning (لیتر ≠ مترمربع) ⇒ NO copy ask for the area field
3. [chat] <span dir="rtl">[page] stale draft «پیشنهادِ کارِ دوم ۳۲ میلیون» (never saved) ‖ U: ۳۲ نه ۳۵</span> — _context:_ <span dir="rtl">stale draft</span>  
   → no ask for the stale draft
4. [chat] <span dir="rtl">U: تابه ۲۵×۳۵ ‖ … verdict «پخت ۴۰ دقیقه کافیه» based on oven temp only ‖ U: تابه ۳۰×۴۰</span> — _context:_ <span dir="rtl">verdict independent</span>  
   → that verdict did not use the pan size ⇒ stays (no blanket set-aside)
5. [chat] <span dir="rtl">U: درسم: اول حالت خاص، بعد شکل ‖ U: اولی رو درست کن: اول جدول</span> — _context:_ <span dir="rtl">partial lesson fix must not replace whole</span>  
   → clause 2 «بعد شکل» NOT replaced; lesson is not overwritten by the whole fix
6. [edit] <span dir="rtl">✏️ adds only a comma</span> — _context:_ <span dir="rtl">punctuation edit</span>  
   → no record change; no fragment; no self-correction event
7. [chat] <span dir="rtl">U: مهلت ۳۰ مهره ‖ U: تصمیم گرفتم زودتر بفرستم، چهارشنبه</span> — _context:_ <span dir="rtl">plan change look-alike</span>  
   → decision change, not correction: new dated act; original deadline event not withdrawn
8. [chat] <span dir="rtl">U: … ‖ A: پس ۲۰ دقیقه. ‖ U: اون ۲۰ که گفتی غلطه</span> — _context:_ <span dir="rtl">assistant's text</span>  
   → fragment only in the assistant's message ⇒ not a self-correction; nothing of hers withdrawn
9. [chat] <span dir="rtl">U: معلمم گفت «۲۰۰ نه، ۱۸۰ مترمربعه»</span> — _context:_ <span dir="rtl">quote</span>  
   → quoted speech ⇒ no retract; may be booked as new info
10. [chat] <span dir="rtl">U: بام ۱۸۰ ـه نه ۲۰۰ ‖ [ask shown] ‖ U: نه، اون یکی درسته</span> — _context:_ <span dir="rtl">copy no</span>  
   → her «نه» kept; field unchanged; chat datum stays changed; no repeated ask
11. [chat] <span dir="rtl">U: ۷۴ ‖ U: ۷۴ و نیم ‖ U: آره همون ۷۴ و نیم</span> — _context:_ <span dir="rtl">confirmation</span>  
   → no second retract, one history entry
12. [chat] <span dir="rtl">U: دیروز اشتباه کردم و قند زیاد خوردم</span> — _context:_ <span dir="rtl">real-world</span>  
   → real-world mistake ⇒ no retract
13. [chat] <span dir="rtl">any no-op</span> — _context:_ <span dir="rtl">no false claim</span>  
   → the assistant never says «عوض کردم/اصلاح شد» when changed=[]
14. [chat] <span dir="rtl">U: خونه با واو (spelling)</span> — _context:_ <span dir="rtl">spelling</span>  
   → no value change; no verdict set aside

## R4.dossier · session/problem dossier complete and Persian

### Positive

1. [events] <span dir="rtl">chat problem (no live problem): 2 guesses, 1 verdict «رد شد», 1 plan, 1 correction ‖ open «📜 پروندهٔ این گفت‌وگو»</span> — _context:_ <span dir="rtl">session dossier</span>  
   → all five appear as Persian lines from the event log (guesses, verdict, plan, correction with old⇐new); no «chat|», «chatok|», «rebook:», «more», «intuitive»
2. [events] <span dir="rtl">session with a live problem ‖ open the session dossier</span> — _context:_ <span dir="rtl">title</span>  
   → title names the live problem (not «(بی مسئلهٔ زنده)») and links to its problem dossier
3. [events] <span dir="rtl">chat-closed problem (solved in chat) with similar-triangles step and derivative</span> — _context:_ <span dir="rtl">closed in chat</span>  
   → dossier keeps the chat work steps, not just «حل شد»
4. [events] <span dir="rtl">no-op correction «خسته نبودم» and a refused retract</span> — _context:_ <span dir="rtl">no-op in dossier</span>  
   → both appear as correction acts with their plain note
5. [events] <span dir="rtl">T41 case: practice_log from chat on Sat 17 («دیروز») + page judgement on Sun 18</span> — _context:_ <span dir="rtl">practice evidence</span>  
   → both sessions listed with their day (۲۵ مهر, ۲۶ مهر), judgement in Persian
6. [events] <span dir="rtl">T24 row judged on the page</span> — _context:_ <span dir="rtl">T24</span>  
   → appears once as the 🎯 judgement (row = 🎯), with date
7. [events] <span dir="rtl">verdict «intuitive»</span> — _context:_ <span dir="rtl">verdict label</span>  
   → shown via VERD_FA as a Persian word, never «intuitive»
8. [events] <span dir="rtl">statement text filled from her msg u1 (assistant reply was u2)</span> — _context:_ <span dir="rtl">source pointer</span>  
   → «منبع» points to u1 (the message the text came from)
9. [events] <span dir="rtl">Latin tokens in her text (e.g. «x² − 5x»)</span> — _context:_ <span dir="rtl">Latin kept</span>  
   → kept in dossier lines, not dropped

### Negative (look-alike)

1. [events] <span dir="rtl">U (new session): دیروز ۷۰ درصدش یادم بود</span> — _context:_ <span dir="rtl">practice report new session</span>  
   → practice report is NOT a new «مسئلهٔ گفت‌وگو»; it goes to the case session
2. [events] <span dir="rtl">session with only a greeting</span> — _context:_ <span dir="rtl">empty</span>  
   → dossier says there is nothing yet; does not invent entries
3. [events] <span dir="rtl">withdrawn record version</span> — _context:_ <span dir="rtl">withdrawn</span>  
   → shown once as «نسخهٔ پیشین», not as a separate act or a failure
4. [events] <span dir="rtl">same 🎯 judged by practice_log and page</span> — _context:_ <span dir="rtl">dedupe</span>  
   → one line, not two
5. [events] <span dir="rtl">dossier of a live problem</span> — _context:_ <span dir="rtl">scope</span>  
   → does not include unrelated chat problems from other sessions
6. [events] <span dir="rtl">raw key «more» in the mid-course card</span> — _context:_ <span dir="rtl">raw label</span>  
   → never shown; Persian label instead
7. [events] <span dir="rtl">mind card «از کجا؟» for a re-booked result</span> — _context:_ <span dir="rtl">rebook</span>  
   → shows «پیامِ شما (…)», never «rebook:u5»
8. [events] <span dir="rtl">assistant's own suggestions not accepted by her</span> — _context:_ <span dir="rtl">not hers</span>  
   → not listed as her acts

## R5.practice_time · practice time rules (stability after regression, T24 row = 🎯, late/forgotten days, «دیروز», her rhythm)

### Positive

1. [time] <span dir="rtl">T41 case: D0 Sun 10-18 ✓80 ‖ Tue 10-20 ✓80 ‖ Thu 10-22 ✗30 ‖ Fri 10-23 ✓80</span> — _context:_ <span dir="rtl">regression resets</span>  
   → NOT «تثبیت شد»; the run restarts at the ✗ on 10-22 (count after last failure = 1)
2. [time] <span dir="rtl">…continuing: Sun 10-25 ✓85 ‖ Sun 11-01 ✓85 ‖ Sun 11-15 ✓90</span> — _context:_ <span dir="rtl">stability after regression</span>  
   → «تثبیت شد» only once the technique's own run (successes at growing intervals after 10-22) is complete — here on 11-15 if the run is 3+ at growing gaps 2→7→14; not earlier
3. [time] <span dir="rtl">T41: Sun 10-18 ✓ ‖ Mon 10-19 ✗40 (due was 10-20)</span> — _context:_ <span dir="rtl">early failure</span>  
   → the ✗ is a failure, labelled as failure — never «زودتر از موعد»; stability not declared
4. [time] <span dir="rtl">T24: worksheet row «پیش‌بینی: باشگاه سه‌شنبه می‌رم، ۷۰٪» judged ✓ on the page Tue 10-20</span> — _context:_ <span dir="rtl">T24 = 🎯</span>  
   → the row IS the 🎯 record: one record; Today stops asking «شد یا نشد؟»; case due advances; calibration n=1
5. [time] <span dir="rtl">T24 row judged via chat practice_log «باشگاه رفتم (درست)» Wed 10-21</span> — _context:_ <span dir="rtl">T24 via chat</span>  
   → same single record judged; no second 🎯; no overdue on Today
6. [time] <span dir="rtl">T41 due Tue 10-20; she does nothing until Fri 10-23</span> — _context:_ <span dir="rtl">forgotten days</span>  
   → Today on 10-21/22/23 shows the case line with an overdue label («عقب‌افتاده از ۲۸ مهر»); one line per day
7. [time] <span dir="rtl">Mon 10-19, U: دیروز تمرین کردم، ۷۰ درصد</span> — _context:_ <span dir="rtl">«دیروز» session</span>  
   → practice_log session day = Sun 10-18 (not 10-19); next window computed from 10-18
8. [time] <span dir="rtl">U: پریروز ۶۰ درصدش یادم بود (on Tue 10-20)</span> — _context:_ <span dir="rtl">«پریروز» + number</span>  
   → session day Sun 10-18; typed number ۶۰ stored as the measure
9. [time] <span dir="rtl">U: من هر دو هفته یه بار تمرین می‌کنم</span> — _context:_ <span dir="rtl">her rhythm</span>  
   → udue = her rhythm: next due 2026-11-01 (14 days after D0), not the technique's default 1/3/7
10. [time] <span dir="rtl">T23 late chat log (steps shape, steps:[1], crit≠steps)</span> — _context:_ <span dir="rtl">T23 due</span>  
   → due is a valid date (never NaN / «Invalid Date»); case stays on Today
11. [time] <span dir="rtl">Today recall-trend chart after 6 measured case sessions</span> — _context:_ <span dir="rtl">trend chart</span>  
   → chart shows 6 points from case sessions, not «هنوز داده‌ای نیست»
12. [time] <span dir="rtl">🌱 «امشب شام سبک» created Sun 10-18</span> — _context:_ <span dir="rtl">one-night 🌱 expires</span>  
   → asked on 10-18 evening / 10-19 at most; gone from Today by Tue 10-20

### Negative (look-alike)

1. [time] <span dir="rtl">calibCrit before any judged prediction</span> — _context:_ <span dir="rtl">no data</span>  
   → shows nothing (no «۰٪ … ۵۰٪ ± ۲۹»)
2. [time] <span dir="rtl">T41: ✓ ✓ ✓ all on the same day 10-18</span> — _context:_ <span dir="rtl">same-day</span>  
   → no stability (intervals not growing)
3. [time] <span dir="rtl">U: فردا تمرین می‌کنم (on 10-18)</span> — _context:_ <span dir="rtl">future talk</span>  
   → a plan, not a session: no practice_log; due unchanged
4. [time] <span dir="rtl">T41 on-time ✓ on its due day</span> — _context:_ <span dir="rtl">on time</span>  
   → no overdue label; no «زودتر از موعد»
5. [time] <span dir="rtl">case on a live problem with its lesson card (T28)</span> — _context:_ <span dir="rtl">one act one line</span>  
   → Today shows ONE line (the case), the lesson card is owned by the case — not «عقب‌افتاده از ۲۷ مهر» beside it
6. [time] <span dir="rtl">plan «سه‌شنبه باشگاه» + 🎯 for the same visit</span> — _context:_ <span dir="rtl">duplicate lines</span>  
   → one Today line, linked at creation
7. [time] <span dir="rtl">U: دیروز ۷۰ درصد (message sent at 00:20 Mon 10-19)</span> — _context:_ <span dir="rtl">midnight edge</span>  
   → «دیروز» = Sun 10-18 by calendar day; not double-logged
8. [time] <span dir="rtl">«خفته تا» on a sleeping item</span> — _context:_ <span dir="rtl">sleep date</span>  
   → never a past date
9. [time] <span dir="rtl">her rhythm «هر دو هفته» stated for T41 case A</span> — _context:_ <span dir="rtl">scope</span>  
   → does not change case B's schedule

## R6.floor_compensation · floor-model compensations (closure fallback, step alias, «ثبت کن» ⇒ live, quote matching, reread stop, model-directed notes hidden)

### Positive

1. [chat] <span dir="rtl">U: جواب ۵۰۵۰ ـه، چک کردم درسته ‖ A: ✓ ‖ U: درسم اینه که جفت جفت جمع کنم (model sends no chat_solved)</span> — _context:_ <span dir="rtl">closure fallback</span>  
   → page books the lesson itself and asks HER once «حل شد؟» with buttons; on «بله» closes; lesson not lost
2. [chat] <span dir="rtl">[live step 2 open] U: زنگ زدم بانک ولی جواب ندادن (model: result+fail, no step)</span> — _context:_ <span dir="rtl">step alias</span>  
   → page asks «نتیجهٔ گامِ ۲؟» with buttons (انجام شد/بخشی/نه); answer lands on step 2
3. [chat] <span dir="rtl">U: همین مسئله‌ی دو شیر رو ثبتش کن (model emits chat_invent)</span> — _context:_ <span dir="rtl">«ثبتش کن» ⇒ live</span>  
   → page opens live_new for the problem she is working on; chat_invent used only for a problem to keep for later
4. [chat] <span dir="rtl">U: اینو ثبت کن (ZWNJ n/a, mid chat problem)</span> — _context:_ <span dir="rtl">«ثبت کن»</span>  
   → live_new opened; statement from her messages with src spans
5. [chat] <span dir="rtl">model guess quote «n(n+1)/2» vs her text «n ضربدر n+1 تقسیم بر ۲»</span> — _context:_ <span dir="rtl">quote matching</span>  
   → matched by formula equivalence; guess booked
6. [chat] <span dir="rtl">model defer quote paraphrases her «بعداً بهش فکر می‌کنم» as «بعدا فکر میکنم»</span> — _context:_ <span dir="rtl">normalized</span>  
   → normalized token match (ZWNJ/spacing) ⇒ accepted
7. [chat] <span dir="rtl">model asks reread of file id F1 ‖ [سامانه] ‖ model: «فایل را دریافت نکردم» ‖ model asks F1 again</span> — _context:_ <span dir="rtl">reread loop</span>  
   → page stops the loop and tells her plainly the file could not be read; no 3rd request
8. [chat] <span dir="rtl">refused deadline (bad date) from the model</span> — _context:_ <span dir="rtl">N4</span>  
   → she sees one plain user line («یادآور ثبت نشد: …»); the model gets one corrective turn; the model-directed note is not shown to her
9. [chat] <span dir="rtl">unrequested chat_invent refused</span> — _context:_ <span dir="rtl">C21-8</span>  
   → she sees no «کاربر نخواسته… فقط پیشنهاد بده»; one honest user line + corrective turn

### Negative (look-alike)

1. [chat] <span dir="rtl">U: یه مسئله‌ی دیگه هم دارم، بذارش برای بعد ثبتش کن</span> — _context:_ <span dir="rtl">for later</span>  
   → chat_invent (kept for later) is correct here; no live_new
2. [chat] <span dir="rtl">U: جوابم ۵۰ ـه (unverified) ‖ U: درسم اینه…</span> — _context:_ <span dir="rtl">unverified</span>  
   → no closure ask without a verified answer
3. [chat] <span dir="rtl">[no step open] U: نشد</span> — _context:_ <span dir="rtl">no open step</span>  
   → no «نتیجهٔ گام؟» buttons
4. [chat] <span dir="rtl">model quote with a different number «n(n−1)/2» vs her «n(n+1)/2»</span> — _context:_ <span dir="rtl">non-equivalent</span>  
   → rejected; refusal shown to her and the model
5. [chat] <span dir="rtl">U: ۴۲ ـه جوابم</span> — _context:_ <span dir="rtl">C21-15</span>  
   → «صفحه در پیامش نتیجه‌ای نیافت» NOT sent (her message holds a result)
6. [chat] <span dir="rtl">model asks for file F2 after F1 failed</span> — _context:_ <span dir="rtl">different file</span>  
   → different id ⇒ allowed once
7. [chat] <span dir="rtl">model closes with chat_solved</span> — _context:_ <span dir="rtl">model did it</span>  
   → no extra page «حل شد؟» ask (no double)
8. [events] <span dir="rtl">mind card weakest stage</span> — _context:_ <span dir="rtl">mind stage</span>  
   → from her evidence (e.g. no check made ⇒ «وارسی»), not from session phase/model label

## R7.postcheck · post-check accuracy

### Positive

1. [prompt] <span dir="rtl">reply: «چه چیزی مجهول است؟ و الان چه داده‌ای داری؟»</span> — _context:_ <span dir="rtl">two questions</span>  
   → two independent «؟» asks ⇒ rewrite to one question
2. [prompt] <span dir="rtl">reply: «راهت چیست؟ کِی امتحانش می‌کنی؟»</span> — _context:_ <span dir="rtl">two questions no «و»</span>  
   → two «؟» ⇒ rewrite
3. [prompt] <span dir="rtl">reply after correction with two turn questions</span> — _context:_ <span dir="rtl">after correction</span>  
   → one turn question only
4. [prompt] <span dir="rtl">reply: «عوض کردم: بام ۱۸۰ شد» before the page result</span> — _context:_ <span dir="rtl">premature claim</span>  
   → flagged as claim ⇒ rewrite to «فرستادم»
5. [prompt] <span dir="rtl">reply in «شما» to a «تو» user</span> — _context:_ <span dir="rtl">register</span>  
   → register rewrite
6. [prompt] <span dir="rtl">reply: «حل شد!» without page confirmation</span> — _context:_ <span dir="rtl">حل شد</span>  
   → rewrite
7. [prompt] <span dir="rtl">reply: «پرونده‌ی تمرینت باز شد» before page result</span> — _context:_ <span dir="rtl">practice claim</span>  
   → claim ⇒ rewrite
8. [prompt] <span dir="rtl">rewrite of a coach turn</span> — _context:_ <span dir="rtl">rewrite tier</span>  
   → stays lla_coach; same actions

### Negative (look-alike)

1. [prompt] <span dir="rtl">reply: «۱۰ است یا ۲۰؟»</span> — _context:_ <span dir="rtl">alternative</span>  
   → alternative «… یا …؟» is ONE question ⇒ no rewrite
2. [prompt] <span dir="rtl">reply: «صفحه می‌گوید چه چیزی عوض شد»</span> — _context:_ <span dir="rtl">not claim</span>  
   → not a claim ⇒ no rewrite
3. [prompt] <span dir="rtl">reply: «کجاها عوض شد را صفحه نشان می‌دهد»</span> — _context:_ <span dir="rtl">not claim</span>  
   → no rewrite
4. [prompt] <span dir="rtl">reply: «فرستادم؛ منتظر نتیجهٔ صفحه»</span> — _context:_ <span dir="rtl">فرستادم</span>  
   → no rewrite
5. [prompt] <span dir="rtl">reply: «معلمت می‌گوید…» to a «تو» user</span> — _context:_ <span dir="rtl">register false positive</span>  
   → «می‌گوید» is not «شما» ⇒ no register rewrite
6. [prompt] <span dir="rtl">reply: «پروندهٔ کارخانه را دیدی؟»</span> — _context:_ <span dir="rtl">پرونده</span>  
   → factory «پرونده» ≠ practice case ⇒ no rewrite
7. [prompt] <span dir="rtl">reply quoting her question «گفتی ‹چرا؟›» + one own question</span> — _context:_ <span dir="rtl">quoted ؟</span>  
   → quoted «؟» not counted ⇒ no rewrite
8. [prompt] <span dir="rtl">reply «داشته باشیم» (inclusive first person)</span> — _context:_ <span dir="rtl">borderline</span>  
   → not a register violation by itself

## R8.turn_edges · turn question / statement edges

### Positive

1. [prompt] <span dir="rtl">U: سه تاشو چک کردم</span> — _context:_ <span dir="rtl">unknown</span>  
   → turn question unknown is never her sentence («مجهول هنوز «سه تاشو چک کردم»» forbidden)
2. [prompt] <span dir="rtl">U: ممنون حل شد، عالی بود</span> — _context:_ <span dir="rtl">closure</span>  
   → closure message never taken as the statement
3. [edit] <span dir="rtl">✏️ «از ساعت ۹ تا ۱۲» → «ساعت ۱۰ تا ۱۲»</span> — _context:_ <span dir="rtl">stray word</span>  
   → substitution leaves no stray «از»
4. [prompt] <span dir="rtl">U: بام ۱۸۰ ـه نه ۲۰۰</span> — _context:_ <span dir="rtl">no taste q</span>  
   → no taste question on the datum-correction turn
5. [prompt] <span dir="rtl">A (p5): مجهول چیست؟ ‖ U: زمان پر شدن ‖ next turn</span> — _context:_ <span dir="rtl">answered q</span>  
   → not re-asked
6. [prompt] <span dir="rtl">U: اول شکل کشیدم بعد جدول</span> — _context:_ <span dir="rtl">echo</span>  
   → turn question built from the problem, not echoing her step
7. [prompt] <span dir="rtl">U: نمی‌دونم از کجا شروع کنم (statement 3 turns back)</span> — _context:_ <span dir="rtl">3 back</span>  
   → unknown taken from the statement turn
8. [prompt] <span dir="rtl">U: خب</span> — _context:_ <span dir="rtl">short</span>  
   → no new statement inferred from «خب»

### Negative (look-alike)

1. [prompt] <span dir="rtl">U: مجهول زمانه</span> — _context:_ <span dir="rtl">legit</span>  
   → here her sentence IS about the unknown; using «زمان» is fine
2. [prompt] <span dir="rtl">U: حل شد؟ (question)</span> — _context:_ <span dir="rtl">question</span>  
   → not closure; no statement change
3. [prompt] <span dir="rtl">A asked p5, she didn't answer</span> — _context:_ <span dir="rtl">unanswered</span>  
   → may re-ask once
4. [edit] <span dir="rtl">✏️ replaces whole sentence</span> — _context:_ <span dir="rtl">whole</span>  
   → full substitution, no stray words, no extra fragment
5. [prompt] <span dir="rtl">turn with no correction</span> — _context:_ <span dir="rtl">normal</span>  
   → taste question allowed
6. [prompt] <span dir="rtl">U: سلام</span> — _context:_ <span dir="rtl">greeting</span>  
   → no turn question
7. [prompt] <span dir="rtl">statement updated by correction</span> — _context:_ <span dir="rtl">after fix</span>  
   → turn question uses the corrected statement
8. [prompt] <span dir="rtl">U: جوابم ۲۴ ـه</span> — _context:_ <span dir="rtl">answer msg</span>  
   → statement not replaced by the answer

## R9.small · small (look-back new problems, «خفته تا», weight log as records)

### Positive

1. [page] <span dir="rtl">look-back: U: سه تا مسئله‌ی جدید به ذهنم رسید: … ، … ، …</span> — _context:_ <span dir="rtl">new problems kept</span>  
   → all 3 kept in the look-back record even if no live problem is created
2. [page] <span dir="rtl">item «خفته تا» set with 3 days</span> — _context:_ <span dir="rtl">sleep date</span>  
   → shows 2026-10-21 (۲۹ مهر), future
3. [chat] <span dir="rtl">U: هفته‌ی ۱: ۷۸، هفته‌ی ۲: ۷۷٫۵، هفته‌ی ۳: ۷۷</span> — _context:_ <span dir="rtl">weight records</span>  
   → weight log stored as records (3 points); plot from records
4. [chat] <span dir="rtl">weight log ‖ U: هفته ۲ ۷۷ بود نه ۷۷٫۵</span> — _context:_ <span dir="rtl">plot follows</span>  
   → plot redrawn from the corrected record
5. [page] <span dir="rtl">look-back new problem chosen later</span> — _context:_ <span dir="rtl">promote</span>  
   → can become live_new from the look-back list
6. [page] <span dir="rtl">«خفته تا» passes</span> — _context:_ <span dir="rtl">wake</span>  
   → item wakes on its day; label disappears
7. [chat] <span dir="rtl">U: وزنم امروز ۷۶ (Sun 10-18)</span> — _context:_ <span dir="rtl">dated</span>  
   → record dated 2026-10-18
8. [page] <span dir="rtl">look-back «مسئله‌های جدید» in dossier</span> — _context:_ <span dir="rtl">dossier</span>  
   → listed

### Negative (look-alike)

1. [page] <span dir="rtl">look-back with no new problems</span> — _context:_ <span dir="rtl">none</span>  
   → no empty placeholder records
2. [page] <span dir="rtl">«خفته تا» computed from a past base</span> — _context:_ <span dir="rtl">past</span>  
   → never shown as past (e.g. not ۲۰ مهر)
3. [chat] <span dir="rtl">U: وزن بابام ۹۰ ـه</span> — _context:_ <span dir="rtl">someone else</span>  
   → not in her weight log
4. [chat] <span dir="rtl">U: اگه ۷۰ بشم خوبه</span> — _context:_ <span dir="rtl">hypo</span>  
   → hypothetical, no record
5. [page] <span dir="rtl">duplicate new problem typed twice</span> — _context:_ <span dir="rtl">dedupe</span>  
   → kept once
6. [chat] <span dir="rtl">weight with unit «پوند»</span> — _context:_ <span dir="rtl">unit</span>  
   → not mixed silently with kg (asks or converts with label)
7. [page] <span dir="rtl">look-back problems</span> — _context:_ <span dir="rtl">consent</span>  
   → not auto-opened as live without her choice
8. [chat] <span dir="rtl">weight correction no-op (same value)</span> — _context:_ <span dir="rtl">no-op</span>  
   → no history entry
