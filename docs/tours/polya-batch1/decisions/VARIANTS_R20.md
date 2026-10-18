# VARIANTS_R20 — independent variant bank (round 20 root mechanisms RO1–RO9, model tier MT1–MT2)

Written from DECISIONS_R20, the round-20 runner reports (A–D) and models20/SUMMARY.md only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-18 (Sunday; ۱۴۰۵/۰۷/۲۶) for all date expectations; Persian week: Sat 17, **Sun 18 (today)**, Mon 19, Tue 20 (پس‌فردا), Wed 21, Thu 22 (۳۰ مهر), Fri 23 (۱ آبان), Sat 24, Sun 25, Mon 26. «شنبه» without qualifier = Sat 2026-10-24; «یکشنبه‌ی بعد» = 2026-10-25.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Roles: [chat] conversation, [edit] ✏️ on her bubble, [page] page-typed fields / panels, [events] dossier/mind-card readings, [time] day sequences under the test clock (D0 = Sun 2026-10-18), [prompt] what the prompt/reply/post-check contains, [route] AI task route chosen.
Multi-message entries use « ‖ » between messages (U = user, A = assistant, «[…]» = a page action/result); _context_ says how many user turns back the corrected message is. Old values always stay as history («اصلاح شد ⇐»); nothing is deleted; withdrawn ≠ deleted. Machine-readable copy: VARIANTS_R20.json (fields rc, kind, role, text, expect, optional context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| RO1.by_fact | 14 | 10 |
| RO2.src_everywhere | 12 | 10 |
| RO3.claim_after_result | 9 | 8 |
| RO4.normalized_match | 15 | 10 |
| RO5.edit_path | 8 | 8 |
| RO6.dossier_log | 9 | 8 |
| RO7.one_act_one_record | 10 | 8 |
| RO8.turn_edges | 9 | 9 |
| RO9.small | 8 | 8 |
| MT1.page_compensation | 14 | 9 |
| MT2.routing | 10 | 9 |
| **total** | 118 | 97 |

## RO1.by_fact · correction reverses by fact, not by message (multi-fact messages; re-booking; verdict dependence)

### Positive

1. [chat] <span dir="rtl">U: فردا ساعت ۱۰ با خواهرم حرف می‌زنم؛ قیمت خونه‌ی بابا حدوداً ۸ میلیارده؛ حدسم اینه که مامان راضی نمی‌شه ‖ A: قبل از حرف زدن چه چیزی را می‌خواهی روشن کنی؟ ‖ U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود</span> — _context:_ <span dir="rtl">corrected message is 1 user turn back; one message produced plan + datum + guess; life decision</span>  
   → retract {span:«قیمت خونه‌ی بابا حدوداً ۸ میلیارده», key:datum:price, fix:«۱۱ میلیارد»}; ONLY datum:price changes ۸→۱۱; old value kept as history «اصلاح شد ⇐»; nothing deleted; plan pl1 (2026-10-19 10:00, «با خواهرم حرف می‌زنم») unchanged and its planning mind event stays; guess g1 «مامان راضی نمی‌شه» unchanged and its event stays; the corrected datum is re-booked as a new act with src {msg: current, key: datum:price}; one self-correction look-back event; nothing else withdrawn
2. [chat] <span dir="rtl">U: حدسم n(n−1)/2 ـه؛ برای n=۴ شمردم و شد ۶ تا ‖ A: n=۵ را هم می‌شماری؟ ‖ U: هنوز نه ‖ A: باشد. ‖ U: شکل رو کشیدم ‖ A: خب؟ ‖ U: حدسمو بد نوشتم، منظورم n(n+1)/2 بود</span> — _context:_ <span dir="rtl">corrected message is 3 user turns back; verdict depends on the changed guess only; math</span>  
   → retract key guess:g1 → g1 becomes «n(n+1)/2» with history; the datum record «n=۴ → ۶ تا» (key datum:count) stays with its event; the guess test that used g1 at n=۴ is re-evaluated against the corrected guess (۱۰ ≠ ۶ ⇒ marked «نیاز به وارسیِ دوباره»/refuted, NOT left «تأیید شد»); the counted datum is not withdrawn
3. [chat] <span dir="rtl">U: گام ۱ رو انجام دادم و جواب داد؛ برنامه‌م اینه که چهارشنبه گام ۲ رو برم ‖ A: گام ۲ دقیقاً چیست؟ ‖ U: زنگ زدن به بانک ‖ A: ساعتش؟ ‖ U: صبح ‖ A: باشد. ‖ U: منظورم سه‌شنبه بود نه چهارشنبه</span> — _context:_ <span dir="rtl">corrected message is 3 user turns back; Today = Sun 2026-10-18</span>  
   → only plan pl (key plan:pl1) moves 2026-10-21 (Wed) → 2026-10-20 (Tue); old value kept as history «اصلاح شد ⇐»; nothing deleted; step 1 outcome «done» and its «اجرا +» mind event stay; the plan's planning event is not withdrawn (re-linked to the corrected text); Today shows the plan on Tue 20, not on Wed 21
4. [chat] <span dir="rtl">U: درسی که گرفتم: اول حالت خاص رو امتحان کنم. با n=۱ و n=۲ هم چک کردم، درست بود. ‖ A: این درس را کجا دوباره به کار می‌بری؟ ‖ U: تو هندسه ‖ A: خوب است. ‖ U: اون درسی که گفتم رو این‌جوری درست کن: اول شکل بکشم</span> — _context:_ <span dir="rtl">corrected message is 2 user turns back; lesson + check in one message</span>  
   → ONLY the lesson changes (look-back lesson / lessons[] / its card) to «اول شکل بکشم» with history; the check verdict «وارسی شد» stays (its data n=۱, n=۲ were not touched); «حل شد» stays; no ans record rewritten; the corrected lesson is re-booked from the current message
5. [chat] <span dir="rtl">U: حقوق ماهانه‌ام ۴۰ میلیون تومان است، اجاره ۱۵ میلیون و قسط وام ۸ میلیون. ‖ A: چه مقدار پس‌انداز در نظر دارید؟ ‖ U: تصحیح می‌کنم: اجاره ۱۸ میلیون تومان است، نه ۱۵.</span> — _context:_ <span dir="rtl">1 user turn back; formal register; three facts, one corrected</span>  
   → only datum:rent ۱۵→۱۸ with history; datum:salary ۴۰ and datum:loan ۸ (same message) stay with their events; any computed remainder that used rent is recomputed (۱۷ → ۱۴); reply in «شما»
6. [edit] <span dir="rtl">✏️ on her bubble «با استقرا ثابت می‌کنم؛ پایه n=۱ درسته، فرض رو برای k گرفتم» → edited to «با استقرا ثابت می‌کنم؛ پایه n=۰ درسته، فرض رو برای k گرفتم»</span> — _context:_ <span dir="rtl">✏️ path; 2 user turns back; same engine as chat</span>  
   → only the span «پایه n=۱ درسته» (key step:base) changes to n=۰ with history; the plan:induction record and its planning mind event stay; the assumption step stays; one self-correction look-back event; no «اصلاح شاید» block on the ✏️ turn
7. [chat] <span dir="rtl">U: جوابم ۴۲ ـه، با جایگذاری چک کردم درست درمیاد ‖ A: ✓ ‖ U: حالا بازنگری ‖ A: چه چیزی آموختی؟ ‖ U: که جایگذاری مهمه ‖ A: باشد. ‖ U: صبر کن جواب ۴۸ بود نه ۴۲</span> — _context:_ <span dir="rtl">corrected message is 3 user turns back; contrast with the lesson entry: verdict changes because its datum changed</span>  
   → ans 42→48 with history; the check verdict that USED ans=42 is downgraded to «نیاز به وارسیِ دوباره» (a datum it used changed); «حل شد» is reopened/withdrawn as a consequence of that verdict only; the look-back lesson «جایگذاری مهمه» (different message) stays
8. [chat] <span dir="rtl">U: امروز خیلی خسته‌ام، ولی حدسم ۱۲ ـه ‖ A: چرا ۱۲؟ ‖ U: خسته نبودم راستش، فقط حوصله نداشتم</span> — _context:_ <span dir="rtl">1 user turn back; corrected clause has no derived record</span>  
   → the clause «امروز خیلی خسته‌ام» produced no record ⇒ no record changes; guess g1 «۱۲» and its event stay; page result to the model: changes=[] with reason «از آن تکه رکوردی ساخته نشده بود»; the assistant does NOT say anything was changed; at most the bubble text history
9. [chat] <span dir="rtl">U: طرحم اینه که از آخر به اول برم ‖ A: از کجا شروع می‌کنی؟ ‖ U: از حالت n ‖ A: بعد؟ ‖ U: n−۱ ‖ A: ادامه بده. ‖ U: صبر کن ‖ A: بله؟ ‖ U: نه، طرحم این بود که مسئله رو به دو حالت زوج و فرد تقسیم کنم</span> — _context:_ <span dir="rtl">corrected message is 4 user turns back; corrected content re-booked</span>  
   → plan pl1 text → «دو حالت زوج و فرد» with history; the old planning event is marked withdrawn (not deleted) AND a new planning event is booked with src {msg: current, key: plan:pl1}; mind card planning count unchanged (never «۰ از N»); the intermediate turns' step records stay
10. [chat] <span dir="rtl">U: دو تا حدس دارم: یا ۱۰ ـه یا ۲۰ ‖ A: کدام را اول می‌آزمایی؟ ‖ U: دومی رو اشتباه گفتم، ۲۵ بود</span> — _context:_ <span dir="rtl">1 user turn back; two guesses in one message</span>  
   → only g2 20→25 with history; g1 «۱۰» untouched with its event; one message, two guess keys (guess:g1, guess:g2) kept separate
11. [chat] <span dir="rtl">U: یادم بنداز پنجشنبه ساعت ۸ صبح فرم رو بفرستم؛ فرمش ۳ صفحه‌ست ‖ A: باشد. ‖ U: … (۸ پیامِ دیگر) … ‖ U: ساعت فرم ۱۰ صبحه نه ۸</span> — _context:_ <span dir="rtl">corrected message is 9 user turns back; deadline from her message</span>  
   → reminder 2026-10-22 08:00 → 2026-10-22 10:00 (date unchanged) with history; datum «۳ صفحه» untouched; page result lists the reminder change; the sys line shows «پنجشنبه ۳۰ مهر، ساعت ۱۰» (Persian, no raw id, no ISO)
12. [chat] <span dir="rtl">U: آب با نرخ ۵ لیتر در دقیقه وارد می‌شه و مخزن ۲ ساعته پر می‌شه ‖ A: حجم مخزن؟ ‖ U: عددشو اشتباه گفتم، ۶ بود</span> — _context:_ <span dir="rtl">1 user turn back; key decides when the span is ambiguous</span>  
   → span ambiguous («عدد») ⇒ page uses the model's reported key datum:rate: rate ۵→۶ with history; datum:time «۲ ساعت» stays; if the model reports no key, the page asks once «کدام: نرخ ۵ یا زمان ۲؟» instead of guessing
13. [chat] <span dir="rtl">U: هفته‌ی هشتم: وزنم ۷۴ شد، هر روز نیم ساعت پیاده رفتم، فقط یه روز شیرینی خوردم ‖ A: آفرین. ‖ U: ۷۴ و نیم بود</span> — _context:_ <span dir="rtl">1 user turn back; life habit problem with a plot</span>  
   → only datum:weight(week 8) 74→74.5 with history; the plot point moves to ۷۴٫۵ and the bubble shows «اصلاح شد ⇐»; the week-8 step success (walking) and its «اجرا +» event stay
14. [events] <span dir="rtl">after any of the corrections above, open «📜 پروندهٔ کامل»</span>  
   → the withdrawn record version appears as «نسخهٔ پیشین» once, the corrected version as current, and the correction act itself with its time; withdrawn ≠ deleted; mind card shows the withdrawn event as withdrawn (not as a failure)

### Negative (look-alike)

1. [chat] <span dir="rtl">U: اشتباه کردم، دیروز به‌جای جلسه رفتم سر کار ‖ A: بعدش چه شد؟</span>  
   → NO retract — a real-world mistake; no record withdrawn; may be booked as new data
2. [chat] <span dir="rtl">U: معلممون گفت «اشتباه نوشتی، علامتش منفیه» ‖ A: تو چه فکر می‌کنی؟</span>  
   → NO retract — quoted speech of someone else; nothing changes
3. [chat] <span dir="rtl">U: یه راه دیگه هم به ذهنم رسید: شاید با استقرا بشه</span>  
   → NO retract — new idea; the old plan stays; the new idea may become its own plan/guess
4. [chat] <span dir="rtl">U: قیمت خونه ۸ میلیارده ‖ A: … ‖ U: یه چیز دیگه هم بگم: قسطش ۱۲ ماهه‌ست</span>  
   → NO retract — an addition; a new datum is booked; datum:price ۸ and its event stay
5. [chat] <span dir="rtl">U: … ‖ A: پس مساحت ۲۰ است. ‖ U: اون ۲۰ که گفتی غلطه</span>  
   → NOT a self-correction — the fragment is only in the assistant's message; none of her records is withdrawn; no self-correction look-back event
6. [chat] <span dir="rtl">U: برنامه‌م سه‌شنبه‌ست ‖ A: … ‖ U: تصمیمم عوض شد، دیگه سه‌شنبه نمی‌رم، بذارش برای شنبه</span>  
   → a plan change, not a correction of a mis-typed message: the plan gets a new act (moved to 2026-10-24) and the original planning event is NOT withdrawn (it was true when said); the change is a dated act in the dossier
7. [chat] <span dir="rtl">U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود ‖ A: … ‖ U: آره همون ۱۱ دیگه</span>  
   → no second retract, no duplicate record; datum:price stays ۱۱ with one history entry
8. [chat] <span dir="rtl">U: سلام ‖ A: سلام! ‖ U: اون سلامو بی‌خیال</span>  
   → no record changed, no mind event withdrawn; page result changes=[]; assistant claims no change
9. [chat] <span dir="rtl">U: جوابم ۲۴ ـه ‖ A: چطور چک می‌کنی؟ ‖ U: جوابم غلط بود؟</span>  
   → a question, not a correction: no retract; the page may ask what she means; ans ۲۴ stays
10. [chat] <span dir="rtl">U: خونه رو با واو ننوشتم، ببخشید (پیامِ قبلی: «خنه‌ی بابا ۸ میلیارده»)</span>  
   → spelling-only fix: bubble text may update with history; no derived record value changes (۸ stays); no mind event withdrawn

## RO2.src_everywhere · every chat write path stamps src; page-typed copies ask «این‌جا هم عوض شود؟»

### Positive

1. [chat] <span dir="rtl">U: یه مسئله برای خودم بساز: ۱۰ نقطه روی دایره، چند تا مثلث؟ ‖ A: [chat_invent ثبت شد] ‖ U: … ‖ U: ۱۰ نه، ۸ نقطه</span> — _context:_ <span dir="rtl">corrected message is 2 user turns back</span>  
   → the chat_invent problem carries src {msg, span:«۱۰ نقطه», key:datum:points}; its statement → «۸ نقطه روی دایره» with history; no duplicate problem left behind; page reply is not «از آن پیام چیزی در صفحه ثبت نشده بود»
2. [chat] <span dir="rtl">U: نرخ خروج ۵ سانتی‌متر مکعب در ثانیه‌ست … (۶ پیام کار در گفت‌وگو، بسته شد «حل شد — وارسی شد») ‖ U: تو پیام اولم اشتباه نوشتم، نرخ ۶ ـه نه ۵</span> — _context:_ <span dir="rtl">corrected message is 6 user turns back; chat-closed problem</span>  
   → chat_solved records (statement, understanding form, check) each carry src of the message they came from — the statement/datum from message 1 (NOT the closing message); statement and form change ۵→۶ with history; the verdict that used ۵ becomes «نیاز به وارسیِ دوباره»; dossier cites «از پیامِ گفت‌وگو: <پیامِ اول>»
3. [chat] <span dir="rtl">U: مجهول زمانِ کل رفت‌وبرگشته ‖ A: [فرمِ فهم ← مجهول: «زمانِ کل»] ‖ U: … ‖ U: منظورم فقط زمانِ رفت بود</span> — _context:_ <span dir="rtl">assistant form fill; 2 user turns back</span>  
   → the form field filled by the assistant action carries src of her message ⇒ it follows automatically to «زمانِ رفت» with history; no «این‌جا هم عوض شود؟» ask (she did not type it)
4. [chat] <span dir="rtl">U: درسم اینه که همیشه واحدها رو چک کنم ‖ A: [درس و کارت 🌱 ساخته شد] ‖ U: نه، درسم این بود که اول حالت خاص رو امتحان کنم</span> — _context:_ <span dir="rtl">1 user turn back; lesson + card</span>  
   → the look-back lesson AND the card made from it carry src ⇒ both change with history; one look-back self-correction event
5. [chat] <span dir="rtl">U: مهلت تحویل پروژه دوشنبه‌ست ‖ A: [مهلت ۲۰۲۶-۱۰-۱۹ ثبت شد] ‖ U: مهلتش سه‌شنبه‌ست نه دوشنبه</span> — _context:_ <span dir="rtl">1 user turn back; deadline</span>  
   → the deadline record carries src ⇒ moves 2026-10-19 → 2026-10-20; reminder moves with it; Today on Mon shows nothing for it, on Tue shows it
6. [page] <span dir="rtl">she typed «۸ میلیارد» herself into the live problem's data field; in chat earlier «قیمت ۸ میلیارده», later «قیمتو اشتباه گفتم، ۱۱ بود»</span> — _context:_ <span dir="rtl">page-typed copy, same key/text</span>  
   → chat-derived records change automatically; the page-typed data field is NOT silently overwritten — the page asks once «این‌جا هم عوض شود؟» showing «۸ میلیارد» → «۱۱ میلیارد»; on «بله» it changes with history; on «نه» it stays and is not asked again
7. [page] <span dir="rtl">she typed condition 4 «باید امسال بفروشیم» on the page; later ✏️ on her chat message «امسال باید بفروشیم» → «تا آخرِ سالِ بعد باید بفروشیم»</span> — _context:_ <span dir="rtl">page-typed condition; ✏️ path; 7 turns back</span>  
   → the ✏️ result asks «این‌جا هم عوض شود؟» for condition 4 with both values; after «بله» condition 4 → «تا آخرِ سالِ بعد» and the problem's contradiction flag (which depended on condition 4) is recomputed
8. [page] <span dir="rtl">the assistant filled the live statement «… قرارداد سه ماهه …» from her first message; she then edited the statement on the page herself (kept «سه ماهه»); 8 turns later in chat: «قرارداد شش ماهه بود نه سه ماهه»</span> — _context:_ <span dir="rtl">mixed origin field; ask wins over silent overwrite</span>  
   → since she edited the field herself, the page asks once «این‌جا هم عوض شود؟» («سه ماهه» → «شش ماهه») for the statement; the chat statement changes automatically; dossier shows the change after she answers
9. [page] <span dir="rtl">she typed «۸ میلیارد» in BOTH the statement and the understanding card; chat correction ۸→۱۱</span>  
   → one grouped ask listing both fields (or one ask per field), each shown once; each field changes only on her yes
10. [chat] <span dir="rtl">U: یه پرونده‌ی تمرین برای «اثبات با برهان خلف» باز کن ‖ A: [پرونده باز شد · موضوع: برهان خلف] ‖ U: موضوع رو اشتباه گفتم، استقرا</span> — _context:_ <span dir="rtl">1 user turn back; practice case from chat</span>  
   → the practice case topic carries src ⇒ becomes «استقرا» with history; sessions (none yet) unaffected
11. [chat] <span dir="rtl">U: هر شب ساعت ۱۱ بخوابم — این عادتمه که می‌خوام بسازم ‖ A: [🌱 ساعت ۲۳ ساخته شد] ‖ U: ساعت ۱۱ نه، ۱۰ و نیم</span> — _context:_ <span dir="rtl">1 user turn back; habit card</span>  
   → 🌱 reminder carries src ⇒ 23:00 → 22:30 with history; one Today line at the new time
12. [events] <span dir="rtl">after a chat correction that touched a chat-derived record and a page-typed copy she declined</span>  
   → dossier shows: the correction act, the chat-derived change, and «در صفحه نگه داشته شد (۸ میلیارد)» for the declined copy — nothing silently differs

### Negative (look-alike)

1. [page] <span dir="rtl">she typed «قیمت آپارتمان خواهرم ۸ میلیارد» in another data row (different fact); chat corrects datum:price ۸→۱۱</span>  
   → no ask on that row (different key); untouched
2. [page] <span dir="rtl">page data field «۱۸ میلیارد»; chat corrects «۸ میلیارد» → «۱۱»</span>  
   → no ask, untouched — «۸» is only a substring of «۱۸»
3. [page] <span dir="rtl">she answered «نه» to «این‌جا هم عوض شود؟» for the statement; later she corrects an unrelated datum</span>  
   → the statement ask is not re-raised; only the new datum's copies are considered
4. [page] <span dir="rtl">an older record with no src (made before stamping existed) holds the corrected value</span>  
   → not silently changed; page tells her one plain line «این مورد منبع ندارد؛ اگر می‌خواهید دستی عوض کنید» and tells the model the reason
5. [chat] <span dir="rtl">U: سلام، امروز چیکار کنیم؟ ‖ A: … ‖ U: اون پیامِ اولمو بی‌خیال</span>  
   → message produced no record ⇒ nothing to change; page result changes=[]; assistant does not claim a change
6. [chat] <span dir="rtl">A: «… پس قیمت ۸ میلیارد است.» ‖ U: نه، اون ۸ رو تو گفتی، من گفتم ۱۱</span>  
   → the assistant's message was wrong, not hers: her records (already ۱۱) unchanged; no self-correction event; no ask
7. [chat] <span dir="rtl">U: اشتباه کردم که این مسئله رو انتخاب کردم</span>  
   → not a correction of a message: no retract, no ask about page fields
8. [page] <span dir="rtl">the «این‌جا هم عوض شود؟» ask is shown; she ignores it and sends two more messages</span>  
   → the field keeps the old value; the ask is not repeated every turn (stays reachable on the field); never silently applied
9. [page] <span dir="rtl">problem B (a different problem) also has «۸ میلیارد» typed by her; she corrects datum:price in problem A's chat</span>  
   → no ask in problem B; only records linked to problem A / this session
10. [events] <span dir="rtl">dossier of a chat-closed problem</span>  
   → the understanding form is never attributed to the closing message («مرسی، حل شد»); if no src exists it says «منبع: نامعلوم» rather than inventing one

## RO3.claim_after_result · what the assistant may say before / after the page's result block; refusals told

### Positive

1. [prompt] <span dir="rtl">turn N: model sends retract {key:datum:price, fix:«۱۱»}; the page has NOT yet applied it when the reply is shown</span>  
   → reply may say only an intent («اگر صفحه بپذیرد، قیمت ۱۱ می‌شود» / «درخواستِ اصلاح را فرستادم»), never «عوض شد/انجام دادم»; the prompt of turn N contains no «صفحه برمی‌گرداند/انجام داد»
2. [prompt] <span dir="rtl">turn N+1: the prompt carries the page's result block «✓ اصلاح شد: قیمت ۸ → ۱۱ میلیارد»</span>  
   → now the reply may say «قیمت را ۱۱ کردم» once; it names exactly the records in the result block, nothing more
3. [prompt] <span dir="rtl">the page applied the retract BEFORE the reply is shown (same turn) and the result block is in the same turn's context</span>  
   → the reply may state the change in the same turn; wording matches the result block
4. [chat] <span dir="rtl">model sends retract {fix:«شنبه»} for a fragment the page cannot find</span>  
   → she sees one plain line «این اصلاح انجام نشد: آن تکه در پیام‌های قبلیِ شما پیدا نشد»; the next prompt carries the refusal with its reason; the assistant says it was not changed and asks for the exact words — never «درست شد»
5. [prompt] <span dir="rtl">result block: changes=[] («از آن پیام رکوردی ساخته نشده بود»)</span>  
   → the reply says nothing needed changing (or says nothing about it); never claims a change
6. [chat] <span dir="rtl">U: یه پرونده‌ی تمرین براش باز کن ‖ model: start_practice; page refuses (consent not validated)</span>  
   → she sees «پرونده باز نشد: …» in one line; the reply never says «باز کردم»; next turn the model sees the reason and may ask for confirmation once
7. [prompt] <span dir="rtl">result: 2 records changed + 1 page-typed copy awaiting «این‌جا هم عوض شود؟»</span>  
   → the reply names the 2 changed records and says the page is asking her about the field she typed — it does not claim that field changed
8. [prompt] <span dir="rtl">model sends live_new; next turn's result says «مسئلهٔ زنده باز شد: …»</span>  
   → only on that next turn may the reply say «باز شد»; on the sending turn it may say «دارم بازش می‌کنم»
9. [prompt] <span dir="rtl">deadline correction accepted: result «یادآوری: پنجشنبه ساعت ۱۰»</span>  
   → reply «یادآوری را ساعت ۱۰ کردم» appears only after this result; before it, no claim

### Negative (look-alike)

1. [prompt] <span dir="rtl">same turn as the action, page not yet applied, reply: «انجام دادم، تاریخ عوض شد»</span>  
   → post-check flags it as a premature claim and requests one rewrite (or the page strips the claim)
2. [prompt] <span dir="rtl">a result block from two turns ago («✓ اصلاح شد: عرض ۵→۹») and a NEW retract this turn</span>  
   → the old block may not be used to claim the new change; no claim until the new result arrives
3. [prompt] <span dir="rtl">reply «پرونده را باز کردم» with no start_practice action at all</span>  
   → flagged; no case exists; she is not told one was opened
4. [chat] <span dir="rtl">a refusal occurred but nothing is shown to her</span>  
   → FAIL condition: every refusal must show one plain line to her; checker expects the line
5. [prompt] <span dir="rtl">previous turn's result: «✓ اصلاح شد (pl1)»; next prompt text</span>  
   → must NOT contain «هیچ رکوردی ثبت نشده بود — نگو که چیزی را عوض کردی» (contradiction)
6. [prompt] <span dir="rtl">reply: «می‌خواهم این را درست کنم؛ صفحه خبر می‌دهد»</span>  
   → allowed (intent, not a claim); post-check does not flag it
7. [prompt] <span dir="rtl">reply «حدست را ثبت کردم» while the page refused guess_res («خرید بهتره» was never a stored guess)</span>  
   → flagged; she sees the refusal line; the reply on the next turn corrects itself
8. [prompt] <span dir="rtl">reply «باشه، فهمیدم.» after a retract was sent</span>  
   → not a claim; not flagged

## RO4.normalized_match · normalized token matching (weekday/number substrings, ZWNJ, digits, punctuation, minimal span, full-sentence fixes)

### Positive

1. [chat] <span dir="rtl">U: پنجشنبه با خواهرم حرف می‌زنم ‖ A: … ‖ U: شنبه بود نه پنجشنبه</span> — _context:_ <span dir="rtl">1 user turn back; Today = Sun 2026-10-18</span>  
   → old token «پنجشنبه», fix «شنبه» matched at word boundaries — accepted (NOT refused because «شنبه» ⊂ «پنجشنبه»); plan 2026-10-22 → 2026-10-24 with history; Today shows it Sat 24, not Thu 22
2. [chat] <span dir="rtl">U: شنبه می‌رم بانک، پنجشنبه هم دکتر ‖ A: … ‖ U: بانکو اشتباه گفتم، پنجشنبه‌ست</span> — _context:_ <span dir="rtl">1 user turn back; two weekdays in one message</span>  
   → only the bank plan «شنبه» → «پنجشنبه» (2026-10-24 → 2026-10-22); the doctor plan «پنجشنبه» untouched; the replacement hits the standalone token «شنبه», not the «شنبه» inside «پنجشنبه»
3. [chat] <span dir="rtl">U: پنج‌شنبه جلسه دارم ‖ A: … ‖ U: پنجشنبه نه، جمعه</span> — _context:_ <span dir="rtl">1 user turn back; ZWNJ present in original, missing in fix</span>  
   → ZWNJ difference («پنج‌شنبه» vs «پنجشنبه») normalized ⇒ match; 2026-10-22 → 2026-10-23
4. [chat] <span dir="rtl">U: ۱۰ نقطه روی دایره داریم و حداکثر ۱۰۰ خط ‖ A: … ‖ U: … ‖ U: ۱۰ نه، ۱۲ نقطه</span> — _context:_ <span dir="rtl">2 user turns back; number substring of another number</span>  
   → only «۱۰ نقطه» → «۱۲ نقطه»; «۱۰۰ خط» intact; statement reads «۱۲ نقطه روی دایره داریم و حداکثر ۱۰۰ خط»
5. [chat] <span dir="rtl">U: x = 3 به دست اومد ‖ A: جایگذاری کن. ‖ U: x=۷ درسته، اولی رو اشتباه نوشتم</span> — _context:_ <span dir="rtl">1 user turn back; digits + spacing</span>  
   → Latin «3» and Persian «۷», spacing «x = » vs «x=» normalized ⇒ match; step result 3 → ۷; minimal span replaced
6. [edit] <span dir="rtl">✏️ original «جمعه می‌رم، اولین شنبه هم استراحت» edited to «جمعه می‌رم اولین یکشنبه هم استراحت»</span> — _context:_ <span dir="rtl">✏️ path; punctuation</span>  
   → punctuation difference (comma dropped in the edit) does not break matching; the plan follows «شنبه» → «یکشنبه» (2026-10-24 → 2026-10-25); the stored text keeps her comma unless she removed it on purpose (minimal differing span = the weekday)
7. [chat] <span dir="rtl">U: حدسم: ارتفاع تقسیم بر ۵ سانتی‌متر مکعب در ثانیه ‖ A: … ‖ U: نرخ ۶ سانتی‌متر مکعب در ثانیه بود</span> — _context:_ <span dir="rtl">1 user turn back; full-phrase fix</span>  
   → minimal differing span = «۵» → «۶»; guess becomes «ارتفاع تقسیم بر ۶ سانتی‌متر مکعب در ثانیه» (no «ثانیه ثانیه», no whole fix phrase pasted in)
8. [chat] <span dir="rtl">U: حدسم اینه که مساحت √3/2 ـه ‖ A: … ‖ U: حدسمو اشتباه نوشتم، مساحت ۱ میشه</span> — _context:_ <span dir="rtl">1 user turn back; full-sentence guess fix</span>  
   → guess becomes «مساحت ۱» (clean), not a concatenation like «مساحت √3/2 حدسمو … ۱»; history keeps «√3/2»
9. [chat] <span dir="rtl">U: پس‌فردا صبح ۲۰ دقیقه پیاده‌روی ‖ A: … ‖ U: پس‌فردا صبح ۳۰ دقیقه منظورم بود</span> — _context:_ <span dir="rtl">1 user turn back; overlapping words in fix</span>  
   → plan text «پس‌فردا صبح ۳۰ دقیقه پیاده‌روی» (no «صبح صبح»); date 2026-10-20 unchanged
10. [chat] <span dir="rtl">U: حجم = ۲ × (۱/۳) × (ab/2) × a ‖ A: … ‖ U: ضریب ۲ نبود، ۴ بود</span> — _context:_ <span dir="rtl">1 user turn back; formula with parentheses</span>  
   → only «۲ ×» at the start → «۴ ×»; parentheses kept; the «2» inside «ab/2» untouched; frag/fix shown with parentheses
11. [chat] <span dir="rtl">U: جوابم ۲۴ ـه ‖ A: با n=۲ چک کن. ‖ U: شد ۶، نه ۸ ـ پس جوابم غلط بود!</span> — _context:_ <span dir="rtl">1 user turn back; models class 4</span>  
   → the model reports retract {key:ans, msg:«جوابم ۲۴»}; the fragment exists in her earlier message ⇒ validated as self-correction (no closed phrase list needed); ans marked wrong/withdrawn with history; one self-correction look-back event
12. [chat] <span dir="rtl">U: روزی ۲ كيلو ميوه ‖ A: … ‖ U: ۲ کیلو نه، نیم کیلو</span> — _context:_ <span dir="rtl">1 user turn back; Arabic letters</span>  
   → Arabic «ك/ي» vs Persian «ک/ی» normalized ⇒ match; step amount → «نیم کیلو»; the step's existing outcome stays
13. [chat] <span dir="rtl">U: تا محل کار ۴۰دقیقه راهه ‖ A: … ‖ U: ۴۰ دقیقه نه، ۴۵</span> — _context:_ <span dir="rtl">1 user turn back</span>  
   → spacing «۴۰دقیقه» vs «۴۰ دقیقه» normalized ⇒ match; datum → «۴۵دقیقه»/«۴۵ دقیقه»
14. [chat] <span dir="rtl">U: یکشنبه‌ها یک ساعت تمرین ‖ A: … ‖ U: یک ساعت نه، دو ساعت</span> — _context:_ <span dir="rtl">1 user turn back; number word inside a weekday</span>  
   → only the standalone «یک» before «ساعت» → «دو»; result «یکشنبه‌ها دو ساعت تمرین» (NOT «دوشنبه‌ها …»)
15. [edit] <span dir="rtl">✏️ original «سه‌شنبه ساعت ۹ صبح» edited to «سه شنبه ساعت ۱۰ صبح» (she also replaced ZWNJ with a space)</span> — _context:_ <span dir="rtl">✏️ path; ZWNJ vs space</span>  
   → ZWNJ/space difference in an unchanged word is not a change; minimal span = «۹» → «۱۰»; date stays 2026-10-20, time 09:00 → 10:00

### Negative (look-alike)

1. [chat] <span dir="rtl">U: پنجشنبه با خواهرم حرف می‌زنم ‖ A: … ‖ U: اون شنبه رو یکشنبه کن</span>  
   → no standalone «شنبه» exists in the earlier message ⇒ not matched into «پنجشنبه»; page asks once «منظورتان پنجشنبه است؟» or refuses with one plain line; no silent change to «پنجیکشنبه»
2. [chat] <span dir="rtl">U: حداکثر ۱۰۰ خط ‖ A: … ‖ U: ۱۰ رو ۱۲ کن</span>  
   → no standalone «۱۰» ⇒ «۱۰۰» untouched; page asks/refuses plainly
3. [chat] <span dir="rtl">U: اشتباه کردم</span>  
   → phrase alone with no model retract report ⇒ no change; at most a question
4. [chat] <span dir="rtl">A: «پس ۳۵ است.» ‖ U: ۳۵ نه، ۳۶ (model reports retract on «۳۵»)</span>  
   → the fragment exists only in the assistant's message ⇒ refused as self-correction with reason; she sees one plain line; no look-back event
5. [chat] <span dir="rtl">U: نوشتم ۴۰ دقیقه، ولی ۴۵ بود (no earlier message of hers contains «۴۰»)</span>  
   → the only «۴۰» is in the current message ⇒ not a target; refused/asked; nothing changed
6. [chat] <span dir="rtl">U: معلم نوشته: «جواب غلط است»</span>  
   → quoted «غلط» is not a self-correction signal; no fallback block
7. [chat] <span dir="rtl">U: جوابم غلط بود؟ (no earlier answer of hers exists)</span>  
   → no retract; page asks what she means
8. [chat] <span dir="rtl">U: می‌رم کتابخونه ‖ A: … ‖ U: «کتاب» رو «دفتر» کن</span>  
   → no partial-word match («کتاب» ⊂ «کتابخونه») ⇒ no «دفترخونه»; asks
9. [chat] <span dir="rtl">U: طرحمو نوشتم ولی گیر کردم</span>  
   → no correction signal; no «# اصلاحِ پیامِ پیشین (شاید)» block in the prompt
10. [chat] <span dir="rtl">U: ۱۲۰ دقیقه طول کشید ‖ A: … ‖ U: ۱۲ رو ۱۵ کن</span>  
   → «۱۲» ⊂ «۱۲۰» ⇒ untouched; asks/refuses plainly

## RO5.edit_path · the ✏️ path: visible editor, system-origin turn, one engine

### Positive

1. [edit] <span dir="rtl">open ✏️ on her bubble in light theme, then dark theme, type a change</span>  
   → the textarea shows the message and the typed text legibly in both themes (contrast ≥ 4.5:1); «اصلاح شد ⇐» readable
2. [prompt] <span dir="rtl">the ✏️ «[اصلاحِ پیامِ قبلی]» system turn</span>  
   → its prompt carries NO «# اصلاحِ پیامِ پیشین (شاید)» block and no candidate list
3. [prompt] <span dir="rtl">the ✏️ turn's coach_state contains «اجرا +» quoting «[اصلاحِ پیامِ قبلی]»</span>  
   → page books NO evidence from it (system-origin turn); only the self-correction look-back event is booked
4. [edit] <span dir="rtl">✏️ fixes a datum</span>  
   → exactly one self-correction look-back event is booked (same as a chat correction)
5. [edit] <span dir="rtl">the same fix done once by chat and once by ✏️ on fresh copies of the same session</span>  
   → identical record changes and identical result blocks (one engine)
6. [edit] <span dir="rtl">✏️ «گام ۲ رو انجام دادم و جواب داد» → «گام ۲ رو انجام دادم و جواب نداد»</span>  
   → step 2 outcome done → failed with history; step 1's success event stays; the step outcome prefilled from that message follows (no two contradictory notices)
7. [prompt] <span dir="rtl">turn after a ✏️ edit that changed pl1</span>  
   → prompt says what changed (from the result block); never «هیچ رکوردی ثبت نشده بود»
8. [edit] <span dir="rtl">✏️ with a page-typed copy of the same fact</span>  
   → the «این‌جا هم عوض شود؟» ask appears after the ✏️ result exactly as for chat

### Negative (look-alike)

1. [edit] <span dir="rtl">✏️ opened and saved with the same text</span>  
   → no system turn sent, nothing booked, no history entry
2. [edit] <span dir="rtl">assistant's bubble</span>  
   → no ✏️ affordance on assistant bubbles
3. [edit] <span dir="rtl">✏️ opened then cancelled</span>  
   → nothing changes; no system turn
4. [prompt] <span dir="rtl">the ✏️ system turn text (formal wording)</span>  
   → not register evidence; the register stays as computed from her own messages
5. [edit] <span dir="rtl">✏️ fixes a typo in a message that produced no record</span>  
   → bubble history only; no records changed; no withdrawals; result changes=[] told plainly
6. [prompt] <span dir="rtl">the ✏️ system turn</span>  
   → never produces a deferred-request candidate
7. [prompt] <span dir="rtl">the ✏️ system turn after a plan fix</span>  
   → the plan is not booked as a second planning success
8. [chat] <span dir="rtl">after a ✏️ edit, her next ordinary message «اشتباه کردم که دیر رفتم»</span>  
   → no fallback block, no retract

## RO6.dossier_log · dossier from one event log, event-time order, one status, typed rendering

### Positive

1. [events] <span dir="rtl">chat plan pl1 (Sun 18) → plan_done (Tue 20) → step s1 created from it</span>  
   → dossier lists, in event-time order: plan pl1 (۲۶ مهر), its completion (۲۸ مهر), then step s1 — the plan before the step it produced
2. [events] <span dir="rtl">a chat correction (datum ۸→۱۱) and a ✏️ correction (plan date) in one problem</span>  
   → both appear in a corrections lane with time, old → new, and «از پیامِ …»; neither is missing
3. [events] <span dir="rtl">a problem worked and closed entirely in chat (chat_solved)</span>  
   → a dossier exists for it: statement, her derivation turns, check, ✏️ edits, «حل شد», look-back — each with its source message
4. [events] <span dir="rtl">a session with no live problem (talk about a decision, two chat plans, a check-in)</span>  
   → a session dossier exists and lists the plans and check-in
5. [events] <span dir="rtl">«حل شد» at 10:00, look-back saved at 10:20, then the problem re-saved at 11:00 (a typo fixed)</span>  
   → order is «حل شد» → look-back; the 11:00 re-save does not move either
6. [events] <span dir="rtl">practice sessions logged under the test clock at +10 days</span>  
   → sessions dated on the simulated day (A.now), not the real day
7. [events] <span dir="rtl">set-aside on day 0 with return on D+30, day-30 mid-course check-in, a Today answer</span>  
   → all three listed with their event dates; «بازگشت: ۲۶ آبان» rendered as text (never «[object Object]»)
8. [events] <span dir="rtl">problem in execution with an open step</span>  
   → one status shown everywhere (e.g. «در جریان — اجرای طرح»); the stage list does not say «هنوز نرسیده» for that stage
9. [events] <span dir="rtl">a step outcome counted «اجرا +» on the mind card</span>  
   → the dossier shows the same sign «+» for that act (one act sign shared by dossier and mind card)

### Negative (look-alike)

1. [events] <span dir="rtl">one correction of a plan</span>  
   → exactly one «نسخهٔ پیشین» entry, never two identical ones
2. [events] <span dir="rtl">verdict downgraded after a datum correction</span>  
   → never «وارسی نشد» next to «نتیجه سالم ماند» without the «اصلاح شد ⇐» link explaining it
3. [events] <span dir="rtl">a withdrawn record</span>  
   → shown as withdrawn (struck/labelled), not as current, not deleted
4. [events] <span dir="rtl">acts of problem B</span>  
   → not in problem A's dossier
5. [events] <span dir="rtl">dossier rendering of plan ids and dates</span>  
   → no raw ids («pl1», «lpNewS») and no Latin ISO dates shown to her
6. [events] <span dir="rtl">a guess that was never refuted</span>  
   → not labelled «رد شد» and no calibration minus
7. [events] <span dir="rtl">the page itself re-saves a record during load</span>  
   → no new dossier event
8. [events] <span dir="rtl">an assistant message with no act</span>  
   → not listed as her act

## RO7.one_act_one_record · practice / Today: one act, one record, one line (time-shaped day sequences)

### Positive

1. [time] <span dir="rtl">D0 (Sun 18): T41 case started, session 1 = 80% ‖ D1, D3: skipped ‖ D7 (Sun 25): late session 45%</span>  
   → the D7 session closes the overdue day-1/day-3 lines (they disappear from Today on D7); the cycle re-anchors from D7 (failed ⇒ next due D8 Mon 26); the case shows that due (never «موعدی ندارد»); D14 Today has no stale «روز ۱/۳» lines; one Today line per act
2. [time] <span dir="rtl">D0: problem closed with 🔭 spaced review due D3 AND a practice case on the same problem with day-3 session</span>  
   → D3 Today shows ONE line for that problem (the case owns the schedule); logging the case session also satisfies the review
3. [time] <span dir="rtl">D0: T24 — she writes 3 predictions with outcome date D+5 (Fri 23) ‖ D+5: outcomes known ‖ D+6</span>  
   → each prediction becomes a dated 🎯 the moment it is written (dated D0, due D+5); D+1..D+4 Today does not say «جلسهٔ نخست … عقب‌افتاده»; D+5 Today shows the 🎯s; reflections are asked only after outcomes; the case's next turn is computed from the open criterion («۳ روزِ جدا») and appears on Today D+6
4. [time] <span dir="rtl">D0: chat plan «فردا صبح ۲۰ دقیقه پیاده‌روی» ‖ D0: she creates live step «پیاده‌روی ۲۰ دقیقه»</span>  
   → a one-click «همان برنامه؟» appears at step creation; after yes, plan ⇄ step ⇄ 🌱 share one state; D1 Today shows ONE line; marking the step done closes the plan and the 🌱 occurrence; chat no longer asks «انجام شد؟»
5. [page] <span dir="rtl">guess g1 refuted in the guess kit; problem then proved impossible</span>  
   → the practice box says the guess is «رد شد» (from the problem's guess records), never «هنوز آزموده نشده»
6. [time] <span dir="rtl">T41 case: 7 dated sessions 60/70/80/…, «تثبیت شد», later withdrawn at 40%</span>  
   → mind card «🏋 کارِ تکنیک‌ها» shows ONE row for the case with the measured values (80% → 40%) and the withdrawal; never «هنوز کارِ تکنیکیِ کامل‌شده‌ای نیست»
7. [time] <span dir="rtl">new user D0 ‖ D3 she starts the built-in routine «بازیابی پیش از نگاه به پاسخ»</span>  
   → D0–D2 Today shows no such routine line; from D3 it appears with its own schedule
8. [time] <span dir="rtl">test clock +10 days; she logs a case session</span>  
   → session dated the simulated day; dossier and Today agree
9. [chat] <span dir="rtl">U: یه پرونده‌ی تمرین براش باز کن ‖ (later) U: آره، بازش کن دیگه</span>  
   → start_practice accepted from the model's validated consent report (not a keyword at the start); case opened; reply claims it only after the result
10. [time] <span dir="rtl">D7 return turn with an open case: U: امروز دوباره امتحان کردم، ۴۰٪ شد</span>  
   → the practice block is in the prompt (an open case exists for the subject — no keyword needed); a chat action logs the session (dated D7, 40%); Today line for that due closes

### Negative (look-alike)

1. [chat] <span dir="rtl">U: ذهنم داره می‌چرخه ‖ U: بیا تمرین کنیم (no open case)</span>  
   → no practice block triggered by words; the case block depends only on an open case
2. [page] <span dir="rtl">a practice record saved with withdrawn = []</span>  
   → treated as NOT withdrawn; counted on the mind card
3. [time] <span dir="rtl">case quick-form session logged on D3</span>  
   → does not create a second Today line; the linked P3 day-3 item closes
4. [time] <span dir="rtl">one 80% session</span>  
   → no «تثبیت شد» declared
5. [chat] <span dir="rtl">U: نه، فعلاً پرونده نمی‌خوام</span>  
   → no start_practice; no case
6. [time] <span dir="rtl">chat plan «فردا به بانک زنگ بزنم» and an unrelated new step «شکل را بکش»</span>  
   → no auto-link; «همان برنامه؟» not forced (at most offered only when content matches)
7. [time] <span dir="rtl">case closed on D10</span>  
   → no Today lines for it after D10
8. [time] <span dir="rtl">T24 prediction written with no outcome date</span>  
   → no dated 🎯 forged; the page asks for the date

## RO8.turn_edges · turn question / register / defer edges

### Positive

1. [chat] <span dir="rtl">U (17-year-old, informal elsewhere): سؤال: ثابت کنید که مجموع زوایای مثلث ۱۸۰ درجه است. نمی‌دونم از کجا شروع کنم</span>  
   → quoted statement after «سؤال:» is not register evidence ⇒ reply and page questions in «تو» («بنویس»), from «نمی‌دونم از کجا شروع کنم»
2. [chat] <span dir="rtl">U: «اول کل مسئله رو بخون» این جمله‌ی کتابه، ولی من گیج شدم</span>  
   → quoted «…» text not register evidence; register from «من گیج شدم»
3. [chat] <span dir="rtl">U: بیا توی سامانه ثبتش کنیم. ‖ A: [go → صفحهٔ مسئله] ثبتش کردیم</span>  
   → request already satisfied by the action in the reply ⇒ NOT a deferred-request candidate next turn
4. [chat] <span dir="rtl">step failed; she saved a restatement in the form and answered the gap-vs-prediction in the outcome form</span>  
   → turn question does not ask e5 (restate) or e4 (gap) again; no alternation; next question moves on
5. [chat] <span dir="rtl">U (first message, flood of parameters): ارتفاع ۲ متر، شعاع ۳۰ سانت، نرخ ۵ لیتر، شیر دوم ۳ لیتر، زمان ۱ ساعت، ضخامت ۲ میلی…</span>  
   → the A191 intro turn question appears («کلِ مسئله را در یک جمله…» / «اول کل را ببین») — not just «مجهول چیست؟»
6. [chat] <span dir="rtl">after a datum correction in a solved problem</span>  
   → turn question recomputed from the corrected state (e.g. «با ۶ دوباره وارسی کن»), not the whole-first question and not the taste question
7. [chat] <span dir="rtl">U: سه هفته‌ست فکر می‌کنم شکست می‌خورم ولی نخوردم</span>  
   → not read as a failed step; no «این گام جواب نداد؟»
8. [chat] <span dir="rtl">after closure: U: بعدی؟ (an open look-back item exists)</span>  
   → header follows the open item's phase («بازنگری») or is omitted; never «فهمِ مسئله» with «مجهول … چیست؟»; no problem created
9. [chat] <span dir="rtl">U: اثبات‌ها اصلاً به چه درد من می‌خوره؟ (not answered in the reply)</span>  
   → a real question ⇒ deferred-request candidate kept until answered

### Negative (look-alike)

1. [chat] <span dir="rtl">U: می‌خوام کل این نظریه‌ی تحلیل رو بندازم دور (previous reply already addressed it)</span>  
   → first-person intent, already addressed ⇒ NOT a deferred-request candidate
2. [chat] <span dir="rtl">U: استادم گفت «باید فصل ۳ رو دوباره بخونی»</span>  
   → the advisor's quoted words are not her request ⇒ no defer candidate
3. [chat] <span dir="rtl">U: با سلام؛ لطفاً در حل این مسئله راهنمایی بفرمایید.</span>  
   → her own formal words ⇒ «شما» is correct (not a register error)
4. [chat] <span dir="rtl">U: ۶۷ میشه</span>  
   → a result, not a request
5. [chat] <span dir="rtl">a question she answered via the understanding form (مجهول filled)</span>  
   → not re-asked in chat
6. [chat] <span dir="rtl">U: کدام حالتِ خاص حدسم رو ردش کنه؟</span>  
   → kept as one question with the guess (not split into a separate option)
7. [chat] <span dir="rtl">normal second message with three parameters only</span>  
   → A191 intro not forced when the message is not a flood
8. [chat] <span dir="rtl">after a correction: U: مرسی</span>  
   → no new turn question invented from the correction; no header
9. [chat] <span dir="rtl">quoted textbook line in «شما» inside a «تو» conversation, repeated twice</span>  
   → register does not flip at any turn

## RO9.small · small: formula run boundary, plot add form, «ردش», ⏱ badge

### Positive

1. [chat] <span dir="rtl">U: در سال ۱۳۵۲ مقدار y=۲ (۳۵۲) بود</span>  
   → formula run ends before the label: renders «y = ۲» then text «(۳۵۲)»; never «y = ۲(۳۵۲)»
2. [page] <span dir="rtl">two plots in the panel; click «➕ افزودنِ نقطه» on plot 1</span>  
   → only plot 1's add form opens
3. [page] <span dir="rtl">test clock on; narrow screen</span>  
   → the «⏱ ساعتِ آزمایشی» badge does not cover «↩ برگرد» (both clickable)
4. [chat] <span dir="rtl">guess question «کدام حالتِ خاص … ردش کند؟»</span>  
   → «ردش» stays inside the guess question (one option)
5. [chat] <span dir="rtl">U: نقطه‌ی (۲، ۵) رو اضافه کن</span>  
   → point added to the focused plot only; ticks in Persian digits
6. [chat] <span dir="rtl">U: y = 2x + 1 (خط اول)</span>  
   → formula «y = 2x + 1», label «(خط اول)» as text
7. [page] <span dir="rtl">plot 2's add form opened after plot 1's</span>  
   → plot 1's form closes or stays independent; no cross-filling
8. [page] <span dir="rtl">test clock badge in dark theme</span>  
   → readable and not overlapping navigation

### Negative (look-alike)

1. [chat] <span dir="rtl">U: y=2(x+1)</span>  
   → one formula «y = 2(x + 1)» (parenthesis is part of the formula)
2. [chat] <span dir="rtl">U: ۲(۳+۵)=۱۶</span>  
   → one formula, multiplication kept
3. [chat] <span dir="rtl">U: f(x) = x² (برای x مثبت)</span>  
   → formula «f(x) = x²», «(برای x مثبت)» text
4. [page] <span dir="rtl">test clock off</span>  
   → no badge shown
5. [page] <span dir="rtl">single plot</span>  
   → ➕ opens its own form normally
6. [chat] <span dir="rtl">U: ردش کن</span>  
   → an instruction (reject), not merged into a guess question
7. [chat] <span dir="rtl">U: سال (۱۳۵۲)</span>  
   → no formula created
8. [chat] <span dir="rtl">U: (a+b)² = a² + 2ab + b²</span>  
   → one formula across the whole run

## MT1.page_compensation · page compensations for model slips (aliases, quotes, step line, live_new, post-checks)

### Positive

1. [prompt] <span dir="rtl">model output: top-level «retract»: {...} (not inside coach_state)</span>  
   → accepted as an alias; same result as the canonical field
2. [prompt] <span dir="rtl">model output: taste as an object {«q»: …} instead of a string</span>  
   → accepted as an alias
3. [prompt] <span dir="rtl">model output: said:result with no text</span>  
   → page asks once (structured) for the result text; nothing booked as a result yet
4. [prompt] <span dir="rtl">her message «حدسم n(n-1)/2 ـه»; model quotes the guess as «n(n−1)/۲»</span>  
   → normalized token / formula matching accepts it (hyphen vs minus, Latin vs Persian digits)
5. [prompt] <span dir="rtl">her «حدس می‌زنم جواب x به توان ۲ باشه»; model quotes «x^2»</span>  
   → formula-notation equivalence accepts (x^2 ≡ x² ≡ «x به توان ۲»)
6. [prompt] <span dir="rtl">model's guess quote is a faithful paraphrase that still fails matching</span>  
   → ONE structured re-ask («عینِ عبارتِ او را بیاور»); after that, drop rather than invent
7. [chat] <span dir="rtl">live step 2 open; U: زنگ زدم، گفتن هفته‌ی بعد</span>  
   → prompt carries «آیا این پیام نتیجهٔ گامِ ۲ است؟ (بله/بخشی/نه)»; with yes the outcome is recorded on step 2
8. [chat] <span dir="rtl">U: یه مسئله‌ی جدید باز کن برای انتخاب رشته</span>  
   → live_new created on her request AND the page navigates to it (opened)
9. [chat] <span dir="rtl">U: یه مسئله شبیه این برام بساز، همین الان روش کار کنیم</span>  
   → chat_invent becomes live_new (opened now)
10. [prompt] <span dir="rtl">reply with two questions («مجهول چیست؟ و داده‌ها؟»)</span>  
   → post-check: one rewrite request ⇒ one question per turn
11. [prompt] <span dir="rtl">reply confirming «حل شد» on its own</span>  
   → post-check: one rewrite request; «حل شد» comes only from the page's check
12. [prompt] <span dir="rtl">any turn</span>  
   → a one-line «وضعِ کنونی» (live problem, open step, what she just answered) is at the top of the prompt
13. [chat] <span dir="rtl">U: می‌خوام عادت سحرخیزی بسازم ولی همش شکست می‌خورم</span>  
   → in scope of the life tunnel (habit problem), not refused as medical
14. [chat] <span dir="rtl">U: یه دسته مداد، پاک‌کن و خط‌کش داریم با هم ۲۰ تا؛ … چند تا از هر کدوم؟</span>  
   → page hint makes the coach check the plurals: three unknowns, not reduced to «x و ۲۰−x»

### Negative (look-alike)

1. [prompt] <span dir="rtl">model labels ph:result for «فکر کنم بشه ۱۲»</span>  
   → no result booked from the label alone; stage from her evidence (a guess)
2. [prompt] <span dir="rtl">model quotes a guess that appears nowhere in her messages</span>  
   → rejected even after normalization; no record
3. [prompt] <span dir="rtl">second failed re-ask on the same quote</span>  
   → no third ask; dropped
4. [chat] <span dir="rtl">U: این مسئله رو خودم ساختم: …</span>  
   → no unasked chat_invent; at most an offer
5. [chat] <span dir="rtl">U: فقط ببینم چیه، فعلاً نمی‌خوام کار کنم</span>  
   → no live_new navigation
6. [chat] <span dir="rtl">U: یه رژیم غذایی دقیق برام بنویس</span>  
   → the nutrition prescription stays out of scope (said plainly); the habit/plan part may be offered in the life tunnel
7. [prompt] <span dir="rtl">stale said:result from an earlier turn resent</span>  
   → not booked again
8. [prompt] <span dir="rtl">reply with one question plus a rhetorical exclamation</span>  
   → not flagged as two questions
9. [chat] <span dir="rtl">no live step open; U: زنگ زدم</span>  
   → no «نتیجهٔ گامِ N؟» line

## MT2.routing · which turns go to «lla_coach» vs «lla_assistant»

### Positive

1. [route] <span dir="rtl">coaching turn with a live problem in focus (olympiad proof)</span>  
   → request uses task route «lla_coach»
2. [route] <span dir="rtl">tour coaching turn (life decision, ill-posed)</span>  
   → «lla_coach»
3. [route] <span dir="rtl">look-back turn after «حل شد»</span>  
   → «lla_coach»
4. [route] <span dir="rtl">coaching turn with an attached photo of her handwritten work</span>  
   → «lla_coach»; the selected model supports vision
5. [route] <span dir="rtl">coaching turn with an attached PDF</span>  
   → «lla_coach»; the selected model supports documents
6. [route] <span dir="rtl">catalog listing of task routes</span>  
   → «lla_coach» exists, preferred tier = balanced/reasoning (not the top tier), requires vision + documents
7. [route] <span dir="rtl">auto model selection for «lla_coach»</span>  
   → picks within the tier from configured providers; no model name hard-coded in page or backend
8. [route] <span dir="rtl">GET of app-records AI tasks list</span>  
   → includes «lla_coach» next to «lla_assistant» (both keys present)
9. [route] <span dir="rtl">habit/health-habit problem in the life tunnel, coaching turn</span>  
   → «lla_coach»
10. [route] <span dir="rtl">day-N return turn on an open live problem</span>  
   → «lla_coach»

### Negative (look-alike)

1. [route] <span dir="rtl">U: این رو تو امروز ثبت کن (action only, no live problem in focus)</span>  
   → «lla_assistant»
2. [route] <span dir="rtl">automatic follow-up turn after a page action result</span>  
   → «lla_assistant»
3. [route] <span dir="rtl">U: برو به صفحه‌ی امروز</span>  
   → «lla_assistant»
4. [route] <span dir="rtl">form-fill-only turn («مجهول رو بنویس زمان کل»)</span>  
   → «lla_assistant»
5. [route] <span dir="rtl">general question with no coach layer active («ساعت جلسه‌م کِیه؟»)</span>  
   → «lla_assistant»
6. [route] <span dir="rtl">«lla_coach» has no configured model</span>  
   → falls back to the assistant route without error; she is not told a model name
7. [route] <span dir="rtl">model selection for «lla_coach»</span>  
   → never prefers the top tier
8. [route] <span dir="rtl">✏️ system turn with no coaching needed (result-only)</span>  
   → «lla_assistant»
9. [route] <span dir="rtl">the old «lla_assistant» route</span>  
   → still exists and works unchanged (dual path kept)
