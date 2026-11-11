# oB1 — owner-like questions over a real life problem (wake-up and study), a second and third problem, return by naming, round 26 (group B)

## خلاصه برای مالک
مردی ۳۷ ساله با مسئلهٔ واقعیِ بیداریِ صبح: حدسِ «اراده» را با شاهدِ خودش رد کرد، آزمونِ «گوشی ۱۰:۳۰ در آشپزخانه» را با پیش‌بینیِ ۵ از ۷ (۶۰٪) گذاشت، یک هفته بعد ۵ از ۷ گرفت، درسش را نوشت و مسئله حل شد. در میانه ده پرسشِ «مالک‌گونه» پرسید (آفلاین، ایدهٔ اختراع، کتاب، تصویرِ قبل/بعد، ایمیل، دو مسئله، زمانِ جوابِ برگه، بیش‌اطمینانی، فهرستِ همه‌چیز، ساعتِ هوشمند). بیشترِ پاسخ‌ها راست و دقیق بود و کارنامهٔ ذهن بیش‌اطمینانی‌اش را نشان داد. دو جای جدی خراب بود: اصلاحِ «دو روز ⇐ سه روز» پذیرفته شد ولی صورتِ مسئله همان «دو روز» ماند؛ و وقتی مسئلهٔ دوم و سوم را آورد، برنامه و نتیجهٔ مسئلهٔ بیداری در پروندهٔ «شام» و «ورزش» هم نشست و حدسِ شام در پروندهٔ ورزش ثبت شد — همان چیزی که پرسیده بود «قاطی نمیشن؟».

## Criteria
- [PASS] p1 «اگه … اشتباه بگم و چند پیام بعد درستش کنم …» answered; birth card «۱۷ اسفند ۱۳۶۷» exact.
- [PASS] p3 «فکر کنم مشکل اصلی اراده‌ست» ⇒ page «همین پیام حدس است» + test question; p4 her own test refutes it (model `guess_res refuted`).
- [FAIL S2] B26x·D35 p4 correction «اول گفتم دو روز موفق می‌شم؛ … هفته‌ی پیش سه روز بوده» ⇒ retract stored `ok:true` (coachRetr src u2, frag «ولی الان فقط دو…») but the page told him «از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود — چیزی برای عوض کردن نبود» while the statement record WAS made from that very message u2 (`src.key:"stmt"`, «… ولی الان فقط دو روز موفق می‌شم»); 📜 «صورتِ مسئله … فقط دو روز» and «فرمِ فهم — کل: … دو روز» unchanged to the end (bank #1/#24).
- [PASS] p5 plan + practice case on «request» (honest note: «تثبیت شد» never comes for this topic) + deadline; the 🎯 «پیش‌بینیم: ۵ روز از ۷ موفق؛ ۶۰ درصد» booked from chat by the page.
- [FAIL S3] B26x·D32 p6–p10 the page's suggested question stays «پیش از این گام: فکر می‌کنی چه می‌شود، و چقدر مطمئنی؟» though he had stated both (5/7, 60%) in p5.
- [PASS] p8 missing daily sleep log ⇒ gap + p9 agree ⇒ sheet #101 «⏸ گامِ «ثبتِ روزانهٔ ساعتِ خواب و بیداری» منتظرِ برگهٔ #۱۰۱».
- [PASS] p10 result «۵ روز از ۷» (exact: 6:05, 6:10, 6:00, 6:20, 6:15 = 5 before 6:30 ✓), plan_done; p14 lesson ⇒ chat_solved, «حل شد» + review card.
- [FAIL S3] B26x·D34 his «پیش‌بینیم ۵ بود، درست درومد!» (p10) did not judge the booked 🎯; it stayed «— هنوز —» until the assistant set it by hand on the 🎯 form (p26).
- [FAIL S3] B25·D22 STILL p14 his lesson «درسم: وقتی فکر می‌کنم مشکل «اراده»ست …» ⇒ «**همین پیام حدس است** («فکر می‌کنم مشکل «» ست …»)» — lesson read as a guess, quote emptied.
- [FAIL S3] B25·D23 CHANGED: the solved problem's 📜 has NO guess row at all — neither «اراده» (refuted) nor «خواب و گوشی» (confirmed); mind card has no guess event either.
- [PASS] p13 (bank #6) exact birth date; honest «همین مرورگر ⇒ قاطی می‌شوند — نمایهٔ جدا».
- [FAIL S3] B26x·D20 family p13 post-check «دو ضمیر … («شما» و «تو»)» on the plural «هر کدام … داشته باشید» (him and his wife) — false positive forced a rewrite.
- [PASS] p21–p22 «اینم یه مسئله‌ی جدا ثبت کن» ⇒ two live problems (dinner, exercise) with their own 🧭/📜.
- [FAIL S2] B26x·D33 = B25·D12 CHANGED (bank #16): the wake-up plan «آزمونش: از امشب یک هفته گوشی…» and its «سرانجام: انجام شد» appear in BOTH the dinner and the exercise 📜; the wake-up result «فقط ۴ روز از ۷ شد. پیش‌بینیم غلط بود» is the dinner problem's «نتیجه (از گفت‌وگو)» on its 🧭 main line; the dinner guess «اگه شام رو ساعت ۸ بخورم …» (p23, return by naming «برگردیم سرِ همون مسئله‌ی شام و خواب») is stored in the EXERCISE 📜 — the page kept the exercise problem bound although he named dinner; only the model's `go lprob` switched it, after the guess was filed.
- [PASS] p25–p28 (bank #18) new prediction auto-booked as 🎯; judged «نشد»; mind card «بیش‌اطمینانی در پیش‌بینی‌های «تصمیم…»: طرفِ محتمل‌تر را به‌طورِ میانگین ۷۵٪ گفتی، ولی همان طرف ۱ بار از ۲ رخ داد»; Brier 0.16 for the first (exact (1−0.6)² = 0.16 ✓); no duplicate 🎯 (the assistant's extra form submit was refused by the page).
- [FAIL S3] B26x·D21 family: the assistant's deadline «داوریِ پیش‌بینی …» stays as Today «⏰ … موعدش گذشت؛ انجام شد؟» after the 🎯 was judged.
- [FAIL S3] B26x·D30 family: the waiting step of sheet #101 (closed problem) has no Today line; only 📜 of the closed problem shows «⏸ … سرانجام: منتظر».
- [PASS] routing 31/31.

## Owner bank 11–20
| # | question | his words (turn) | answer given | verdict |
|---|---|---|---|---|
| 11 | offline / own local model | «این صفحه آفلاین هم کار می‌کنه؟ … یه مدلِ خودتون می‌سازید…» (p15) | page + records offline yes; chat needs a model; no local model known to the page | partial (offline yes; local-model plan unknown to the page) |
| 12 | invention idea to a plan with current tools | «یه ساعت زنگ‌دار که تا گوشی رو … نذاری …» (p16) | existing tools named (Pólya, 💡, creativity, Fermi, 🎯); gaps named (prior art, circuit design) | partial (gaps named, nothing filed until a step needs it) |
| 13 | companion book for a 10- and a 70-year-old | «یه کتاب هم هست …» (p17) | none in page; sheet attempted, page refused it «اطمینانِ دستیار کم بود (0.7)» | «نیست» (honest refusal shown) |
| 14 | pictures of every part before/after | «عکس یا تصویری هست که قبل و بعد رو نشون بده؟» (p18) | mind-card trends per part; no system before/after picture in the page | partial |
| 15 | e-mail after every session | (p18) | «📧 گزارشِ تور» only during a tour | exists during a tour only |
| 16 | two problems: whose map/dossier/mind entry is whose | (p20, then p21–p23) | told correctly; but the page then bound events across problems (D33) | FAIL — mixed (S2) |
| 17 | when does the sheet get an answer, how will I know | «… کِی جواب می‌گیره …» (p29) | #101 open, urgent queue every 3 h, no promised date; Today «🛎» on arrival | exists, no date |
| 18 | where the mind card shows over-confidence | «کارنامه‌ی ذهنم کجا نشون میده …» (p28) | 🎯 judged «نشد»; mind card over-confidence row | exists |
| 19 | one list of every record made from my words | (p30) | «📚 همهٔ کارها» (problems + sessions) + 🎯 + sheets + 🧪 separately | partial (no single index) |
| 20 | feed wearable sleep data | (p31) | not possible; linked to #101 | «نیست» |

## نقشهٔ نیاز
- Retract engine (FOR: a corrected datum follows into every derived record): unmet for the statement (D35).
- Multi-problem binding (FOR: each event on its own problem): unmet (D33).
- 🎯 / mind card (FOR: honest calibration): met, with a manual step (D34).
- Sheet loop (FOR: file, wait, tell when): met; Today silent for a closed problem's waiting step.
- Person: a methodical man who tests the system as much as his habit; most of his questions got exact, honest answers — but the two he cares about most (corrections follow; problems don't mix) failed in front of him.

## پیش‌نیاز / آزمودنِ اصلاح / سن
- Prerequisite question was hypothetical (p7): explained, nothing built (correct).
- Fix tests: P5 return by naming ✗ (D33); P4 none here; C5 n/a.
- Age: 1367-12-17 ⇒ 37, adult band ✓.

## Round-25 defects
- B25·D12 CHANGED (now the first problem's plan/result leaks into BOTH new problems, guess into the wrong one).
- B25·D22 STILL. - B25·D23 CHANGED (guesses vanish from 📜 instead of «آزموده نشده»).

## Arithmetic
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| wake times ⇒ «۵ روز از ۷ قبل از ۶:۳۰» | 5 | silent | PASS (unread) |
| «۴ روز از ۷» vs prediction 6/7 | miss | 🎯 «نشد» (after manual set) | PASS |
| Brier of 60 % «شد» | 0.16 | «Brier = ۰.۱۶ از ۱ نتیجه» | PASS |

## Routing
31/31 (routing.md).

## ارتقای لازم
- Retract: match the corrected fragment against EVERY record whose source span contains it (statement included) — «دو روز ⇒ سه روز» (D35).
- Bind each chat event to the problem named in the same message («برگردیم سرِ همون مسئله‌ی شام») before filing it; never copy an earlier problem's plan/result into a newly created one (D33).
- His «پیش‌بینیم … درست درومد / غلط بود» ⇒ judge the open 🎯 at once (D34); stop suggesting a prediction question once he gave one (D32).
- Keep guesses (and their outcomes) of a chat problem when it is solved (D23).

## ایده‌ها
- A «📇 همه‌چیزِ من» index (problems, 🎯, sheets, practice) would answer bank #19 in one place.

## Defects
- S2 B26x·D35, S2 B26x·D33 (= B25·D12 CHANGED), S3 B26x·D32, S3 B26x·D34, S3 B25·D22, S3 B25·D23, S3 B26x·D20 fam., S3 B26x·D21 fam., S3 B26x·D30 fam.

RESULT: FAIL (2 S2, 7 S3)
