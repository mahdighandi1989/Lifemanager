# oB1 — کاربرِ مالک‌مانند: بیداریِ ساعت ۶، شام و سه مسئله (چندروزه) — ROUND 27 (runner B)

## خلاصه برای مالک
کاربری کنجکاو مثلِ مالک روشِ پولیا را روی بیداریِ ساعت ۶ آزمود: «اراده» را با روزهای موفق/ناموفق کنار گذاشت، پیش‌بینیِ ۵ از ۷ با ۶۰٪ را ثبت و آزمود، یک روز را دوباره شمرد (۵ ⇐ ۴)، مسئلهٔ شام را جدا ثبت کرد و ده‌ها پرسشِ «این هست؟» پرسید. این دور بازگشت با نام («برگردیم به مسئله‌ی بیداری») یک بار درست بست، اصلاحِ ۵ ⇐ ۴ به 🎯 و جلسهٔ تمرین رسید، نتیجهٔ بیداری دیگر روی پیش‌بینیِ شام ننشست و کارنامه بی‌اطمینانیِ زیاد را بی تعمیرِ دستی نشان داد (Brier ۰٫۵۵۳ درست). ولی: بستن به مسئله یک پیام عقب می‌ماند (نتیجهٔ شام در پروندهٔ بیداری، نتیجهٔ بیداری در پروندهٔ شام)، «آره، ثبتش کن» برای ثبتِ شام دو پرسشِ تاریخِ کهنه را هم ثبت کرد (از جمله «ولی الان فقط دو روز موفق می‌شم» به‌عنوانِ موعد!)، پیش‌بینی‌ها تا لحظهٔ نتیجه 🎯 نمی‌شوند، و بازنگریِ بیداری هنوز «۵ روز … درست درومد» می‌گوید.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p5 whole-first; «اراده» guess tested against successful/failed days; refuted by his own data.
- [FAIL] p1/s1 «ولی الان فقط دو روز موفق می‌شم» ⇒ «📅 … سه‌شنبه ۵ آبان ۱۴۰۵ — در «امروز» بیاید؟» — «دو روز» (a count) read as a date. B27·D1 instance (S3).
- [PASS] p4–p5 correction «دو ⇒ سه روز»: «در صفحه می‌پرسم «این‌جا هم عوض شود؟» برای «مجهول» («سه» به‌جای «دو»)» (round 26 U16/B26·D29: «چیزی برای عوض کردن نبود»); p5 automatic follow-up answered in one honest line.
- [PASS] p6–p7 forecast as practice T24 on his quoted request; p10 (+7 d) outcome via practice_log ⇒ «🎯 تازه … (۶۰٪) ⇐ شد».
- [PASS] bank 11–15, 20 (p15–p21, p25–p26): sheets #101 (local model), #102 (book), #103 (pictures/e-mail), #104 (wearable — his step waits «⏸ … منتظرِ برگهٔ #۱۰۴»), #105; self-sheets put no step of his on hold.
- [PASS] p22–p24 second problem «شامِ ساعت ۱۰ و بی‌خوابی» own record, own 🧭 and 📜 after «آره، ثبتش کن که جدا باشه».
- [FAIL] p23/s23 that same «آره، ثبتش کن» also booked «⏰ «ولی الان فقط دو روز موفق می‌شم» — ۵ آبان» and «📌 «از امشب یک هفته گوشی …» — ۱۸ آبان» — two lapsed date asks; «از امشب یک هفته…» had been re-asked with ۱۰, ۱۷, ۱۸ آبان; «آزمون بعدی … جمعه‌ی بعد» re-asked ۲۲ then ۲۹ آبان; «اون پنجشنبه هم قرار نیست» (a day he negated) asked. C12/C19. B27·D5 (S2).
- [PASS] T7 p29–p31 «یکی از اون ۵ روز … ۴ روز از ۷ بوده، نه ۵»: guess outcome set aside, result «۴ … اصلاح شد ⇐ «۵ …»», practice session re-judged «(نشد)», 🎯 «… (۶۰٪) ⇐ نشد — همان پیش‌بینی» (round 26 U14/B26·D31: 🎯 stayed «شد»).
- [FAIL] T7 post 📜 of the closed wake-up problem: «وارسی: یعنی ۵ روز از ۷ … پیش‌بینیم ۵ بود، درست درومد!» and «حل شد» stay unmarked after 5 ⇒ 4 (his goal 5/7 is now not met). B26·D31 remainder (S2).
- [PASS] T8 p30–p31 «گفته بودم ۵ روز با ۶۰ درصد، شد ۴» judged on the wake-up 🎯 only; nothing booked on the dinner forecast before its date (round 26 U15/B26·D32).
- [PASS] p28 return by naming «برگردیم به مسئله‌ی بیداری ساعت ۶» ⇒ «او … با نام به «بیداریِ ساعت ۶…» برگشت — صفحه همین نوبت را به آن بست» (round 26 U12/B26·D30: stayed on dinner).
- [FAIL] p36–p40 the binding lags one message: p36 «نتیجه‌ی آزمون شام: سه شب از چهار» stays bound to wake-up (the 📜 of WAKE-UP gets «نتیجه: سه شب از چهار شب…» and the dinner plan «آزمون بعدی … شام ساعت ۸»); p38 (added) «برگردیم به مسئله‌ی بیداری ساعت ۶: …» ⇒ «او در همین پیام با نام به «شامِ ساعت ۱۰ …» برگشت — صفحه همین نوبت را به آن بست» (false); p40 wake-up outcome «شد ۵ روز» lands in the DINNER 📜. C21/C30. U12 CHANGED (S2) — booked as B27·D15.
- [FAIL] T8 (added) p38–p39 two predictions stated («۶ روز از ۷ … ۷۰ درصد» for wake-up, «۵ شب از ۷ … ۸۰ درصد» for dinner) create no 🎯 when said; the wake-up one appears only as «🎯 تازه … ⇐ نشد» at its outcome (p40, routed right by content without «پیش‌بینی»), the dinner one never; the round-26 dinner forecast (90 %) likewise appeared only at its outcome — and all three sit in the wake-up practice case. U49 family (S3).
- [PASS] bank 18: mind card «پیش‌بینی‌های رویداد (۳): … ۷۳٪ … ۰ بار از ۳ رخ داد · احتمالِ بیش‌اطمینانی», Brier ۰٫۵۵۳ = (0.6² + 0.9² + 0.7²)/3 exact — no manual repair needed this round.
- [PASS/half] bank 46 p41 (added) «این آخری توی کدوم مسئله نشست؟ وقتی اسمِ مسئله‌ی قبلی رو میارم، جمله‌ی بعدیم کجا می‌ره؟» ⇒ page TQ «او مسئله‌ای را نام برد که به ۳ مسئلهٔ این گفت‌وگو می‌خورد … فقط بپرس «منظورت کدام است؟»» — an ask (C21) exists; but the facts underneath are the lagging binding above.
- [FAIL] multi-problem block counts «یه روز گذشت. چند تا سؤالِ دیگه دارم که برام مهمه…» (his questions about the page) as problem 2. Q9 «a question about the page is not a problem». New B27·D14 (S3).

## نقشهٔ نیاز
Parts: multi-problem binding (FOR each sentence landing on its own problem) — half met; forecast ledger (FOR every stated prediction, judged on its own) — judged right, never opened at statement; correction engine — met for 🎯/practice, not for the closed problem's look-back; date layer — re-asks and wrong yeses; sheets/self-knowledge — met. Person: a demanding owner-like user needed his records to match his words and his «yes» to mean only what he said yes to — unmet in four places.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
| turns back | path | change | did | ✓ |
|---|---|---|---|---|
| 1 (p4) | chat | دو ⇒ سه روز | copy ask for «مجهول» | ✓ |
| many (p29) | chat, after return by naming | 5 ⇒ 4 days | guess set aside, result, practice, 🎯 re-judged; look-back check and «حل شد» not | ✗ part (D31) |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
37 (birth ۱۷ اسفند ۱۳۶۷); «تو».

## Arms (RUNNER27 T1–T12) in this scenario
- T7 (5 ⇒ 4 on a datum earlier work used): p29–p31 — PASS for 🎯/practice/guess/result; FAIL for the closed problem's look-back check («درست درومد!») and «حل شد».
- T8 (two open predictions; outcome to the right one): p30 (round-26 turn) and p40 (added) — outcome routed right both times; FAIL that the predictions are not opened when stated (no two open 🎯 ever exist).
- T12 negative: no prior block on mid-session numbers (p10, p30, p36) — PASS.

## 📜 line match (multi-problem only)
| 📜 of | line | belongs to | verdict |
|---|---|---|---|
| wake-up | statement, unknown, data, plan, guess tests, result «۴ از ۷ (⇐ ۵)», lesson, «حل شد» | wake-up | ✓ |
| wake-up | «کارِ تو» = his questions about chain of sleep / missing tool / mind-card comparison | session (no problem) | ✗ (minor) |
| wake-up | «وارسی: … ۵ روز از ۷ … درست درومد!», «حل شد» | wake-up | ✗ not marked after 5⇒4 (D31 remainder) |
| wake-up | ۱۵ آبان plan «آزمون بعدی … جمعه‌ی بعد: شام ساعت ۸» | dinner | ✗ wrong problem |
| wake-up | ۱۵ آبان result «سه شب از چهار شب تا ۱۱:۳۰ خوابم برد» | dinner | ✗ wrong problem |
| dinner | statement, data ×3, guess, ⏸ #104, unknown, plan «تا جمعه … سوپ», plan outcome | dinner | ✓ |
| dinner | ۲۲ آبان result «شد ۵ روز» (wake-up outcome) | wake-up | ✗ wrong problem |
| dinner | (missing) his 3/4 result, his 90 % and 80 % predictions | dinner | ✗ missing |

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
- Chat ⇒ 🔭: second problem registered separately; return by naming bound once, then lagged. Chat ⇒ 🎯: only via practice_log at outcome. Chat ⇒ «امروز»: «آره، ثبتش کن» booked two lapsed date asks.

## Owner bank (this scenario)
| # | question (his words) | verdict | evidence |
|---|---|---|---|
| 11 | آفلاین؟ مدلِ محلی؟ | نیمه: page offline هست; local model نیست ⇒ sheet #101 | p15–p16 |
| 12 | ساعتِ زنگ‌دار با همین ابزارها تا برنامهٔ ساخت؟ | هست, gaps named | p17 |
| 13 | کتاب برای پسرِ ۱۰ ساله و پدرِ ۷۰ ساله؟ | نیست ⇒ sheet #102 | p18–p19 |
| 14 | عکسِ قبل و بعدِ هر بخش؟ | نیمه: his own work هست; system parts نیست ⇒ #103 | p20–p21 |
| 15 | گزارشِ هر جلسه با ایمیل؟ | نیست ⇒ #103 | p20 |
| 16 | دو مسئله قاطی نمی‌شن؟ | نیمه: own record/🧭/📜; binding lags one message (B27·D15), lines crossed (scroll table) | p23, p36–p40 |
| 17 | برگه کِی جواب می‌گیره؟ | نیمه: no date; three places to look | p26 |
| 18 | کارنامه کجا بیش‌اطمینانی را نشان می‌دهد؟ | هست (Brier 0.553, ۷۳٪ vs ۰ از ۳) — no manual repair | post MIND |
| 19 | همهٔ رکوردها یک‌جا؟ | نیمه: «📚 همهٔ کارها» + 📜 per problem; no single records index | p35 |
| 20 | دادهٔ ساعتِ هوشمند؟ | نیست ⇒ #104, his step waits ⏸ | p25 |
| 46 | جملهٔ بعد از نامِ مسئلهٔ قبلی کجا می‌رود؟ | نیمه: page asks «منظورت کدام است؟» (C21); actual binding lags one message | p41, p36–p40 |

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D30 / U12 (return by naming not recognised): CHANGED — p28 binds; p36/p38 lag one message (B27·D15).
- B26·D31 / U14 (5⇒4 does not reach 🎯/practice/look-back): CHANGED — 🎯 and practice re-judged; look-back check and «حل شد» not.
- B26·D32 / U15 (result booked on the other open forecast): FIXED.
- B26·D29 / U16 («دو ⇒ سه روز»: «چیزی برای عوض کردن نبود»): FIXED (copy ask).
- B26·D33 / U13 (records copied into the other problem's 📜): CHANGED — no copies; lines now land on the wrong problem through the lag (scroll table).
- B26·D34 / U22 (two questions in one 📅 line; past report read as a date): STILL — «اون پنجشنبه هم قرار نیست» asked; stale asks glued into one line.
- B26·D3 instance (model dates booked silently): CHANGED — asked first; then booked by an unrelated «آره».
- B25·D22 / U64 (lesson read as a guess): FIXED — p16 lesson booked as «بازنگری — درس».
- U56 (page suggestion repeated after it was answered): not seen.

## Routing (41/41 correct)
### oB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. می‌خوام روش پولیا رو روی زندگی خودم امتحان کنم، با یه …» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «هفته‌ای پنج روز از هفت روز صبح زود بیدار شم و یه ساعت مطالعه…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «دو روز موفق، شب قبلش ساعت ۱۱ خوابیده بودم و گوشی رو گذاشته ب…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه، اون دو روز راحت بیدار شدم! پس شاید اراده نیست، خواب و گو…» | lla_coach | lla_coach | ✓ |
| p5 | automatic follow-up | «[سامانه: این کارهای نوبتِ پیش انجام نشد: «اصلاحت رسید. در صف…» | lla_assistant | lla_assistant | ✓ |
| p6 | coaching (problem talk) | «آزمونش: از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ م…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اگه کمتر شد یعنی خواب و گوشی تنها علت نیست و باید دنبال یه چ…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «یه سؤالِ دیگه قبل از ادامه: فرض کن وسطِ همین کار گیر کنم چون…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «دیدمش، اون پرش اصلاح هم توشه. حالا اگه یه چیزی که لازم دارم …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «سلام، یه هفته گذشت. ساعت بیداری این هفت روز: ۶:۰۵، ۶:۱۰، ۷:۳…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «مهمونی آخرش یعنی دیر خوابیدن، پس همون خوابه، علت تازه نیست. …» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «یه چیز دیگه هم برام مهمه: کارنامه‌ی ذهنم منو با کی مقایسه می…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموف…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «سلام، یه روز گذشت. چند تا سؤالِ دیگه دارم که برام مهمه، یکی‌…» | lla_coach | lla_coach | ✓ |
| p15 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p16 | coaching (problem talk) | «یه ایده هم برای همین بیداری دارم: یه ساعت زنگ‌دار که تا گوشی…» | lla_coach | lla_coach | ✓ |
| p17 | coaching (problem talk) | «یه کتاب هم هست که همین روش رو با مثال‌های واقعی یاد بده؟ می‌…» | lla_coach | lla_coach | ✓ |
| p18 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p19 | coaching (problem talk) | «و از کجا ببینم هر بخشِ این سیستم توی این مدت چطور کار کرده و…» | lla_coach | lla_coach | ✓ |
| p20 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p21 | coaching (problem talk) | «راستی یه مسئله‌ی دیگه هم دارم که به همین بیداری ربط داره ولی…» | lla_coach | lla_coach | ✓ |
| p22 | coaching (problem talk) | «حالا که دو تا مسئله شد، از کجا بفهمم نقشه‌ی مسیر و پرونده و …» | lla_coach | lla_coach | ✓ |
| p23 | coaching (problem talk) | «آره، ثبتش کن که جدا باشه. داده‌هام اینه: شام ساعت ۱۰ شب، خوا…» | lla_coach | lla_coach | ✓ |
| p24 | coaching (problem talk) | «حل‌شدن یعنی هفته‌ای دست‌کم ۵ شب تا ۱۱:۳۰ خوابم ببره. فکر کنم…» | lla_coach | lla_coach | ✓ |
| p25 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p26 | coaching (problem talk) | «این برگه‌ای که الان ثبت کردی کِی جواب می‌گیره و من از کجا بف…» | lla_coach | lla_coach | ✓ |
| p27 | coaching (problem talk) | «اگه یه شب خوابم نبرد یعنی فقط سنگینی نیست و ساعتش هم مهمه. ی…» | lla_coach | lla_coach | ✓ |
| p28 | coaching (problem talk) | «اون رو فعلاً ثبت نکن، بعداً میام سراغش. برگردیم به مسئله‌ی ب…» | lla_coach | lla_coach | ✓ |
| p29 | rewrite (post-check) | «اون رو فعلاً ثبت نکن، بعداً میام سراغش. برگردیم به مسئله‌ی ب…» | lla_coach | lla_coach | ✓ |
| p30 | coaching (problem talk) | «پس پیش‌بینیم غلط درومده: گفته بودم ۵ روز با ۶۰ درصد اطمینان،…» | lla_coach | lla_coach | ✓ |
| p31 | coaching (problem talk) | «صبر کن، اشتباه شد. این خط پیش‌بینیِ شام رو «نشد» زده؛ اون که…» | lla_coach | lla_coach | ✓ |
| p32 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p33 | automatic follow-up | «[سامانه: «🎯 دفترِ پیش‌بینی» باز شد. حالا از روی همین گفت‌وگو…» | lla_assistant | lla_assistant | ✓ |
| p34 | coaching (problem talk) | «دیدم، الان درست شد؛ فقط یه سطر سوم هم اونجا هست که جمله‌ی خو…» | lla_coach | lla_coach | ✓ |
| p35 | automatic follow-up | «[سامانه: «🧗 مسئله‌های بزرگ ›» باز شد. این نما فیلدی برای پر …» | lla_assistant | lla_assistant | ✓ |
| p36 | coaching (problem talk) | «سلام، امروز جمعه‌ست. نتیجه‌ی آزمون شام: سه شب از چهار شب تا …» | lla_coach | lla_coach | ✓ |
| p37 | coaching (problem talk) | «جمعه‌ی بعد، همون ۲۲ آبان. اون پنجشنبه هم قرار نیست؛ گزارشِ ه…» | lla_coach | lla_coach | ✓ |
| p38 | coaching (problem talk) | «برگردیم به مسئله‌ی بیداری ساعت ۶: این هفته هم ادامه می‌دم. پ…» | lla_coach | lla_coach | ✓ |
| p39 | coaching (problem talk) | «برای شام هم: این هفته ۵ شب از ۷ شامِ سبک می‌خورم، ۸۰ درصد مط…» | lla_coach | lla_coach | ✓ |
| p40 | coaching (problem talk) | «سلام، یه هفته گذشت. گفته بودم ۶ روز با ۷۰ درصد؛ شد ۵ روز.…» | lla_coach | lla_coach | ✓ |
| p41 | coaching (problem talk) | «این آخری توی کدوم مسئله نشست؟ وقتی اسمِ مسئله‌ی قبلی رو میار…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- A per-sentence «این حرف مالِ کدام مسئله است؟» chip under each message (one tap to move it).
- A 🎯 is opened the moment a prediction with a percent is said, on the named problem, and judged later.

## ایده‌ها
- «وقتی گفتم بله، دقیقاً به کدام پرسش بله گفتم؟» — a visible link from each yes to its question.
- «پیش‌بینی‌هایی که هنوز باز است کدام‌اند؟» — an open-forecast list per problem.

## Defects (catalogue round27B/defects.md)
- B27·D15 (S2, b, C21/C30) p36–p40: problem binding lags one message; results land in the other problem's 📜.
- B27·D5 (S2, b, C12/C19) s1–s36: stale date asks re-asked with drifting dates; «آره، ثبتش کن» booked two of them; a negated day asked.
- B26·D31 remainder (S2, b) 📜: closed problem's look-back check «۵ … درست درومد!» and «حل شد» unmarked after 5⇒4.
- U49 family (S3, b) p38–p40: stated predictions not booked as 🎯 until the outcome; all in one practice case.
- B27·D1 instance (S3, b) s1: «دو روز» read as a date.
- B27·D14 (S3, b) multi-problem block: questions about the page counted as a problem.

RESULT: FAIL — 3 S2 + 3 S3
