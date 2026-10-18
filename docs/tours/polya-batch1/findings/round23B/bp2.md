# bp2 — رضا و آبِ بارانِ پشت‌بام (دو پیش‌نیاز — علم/زندگی) — ROUND 23 (runner B)

## خلاصه برای مالک
رضا (۴۸ ساله، باغدار) می‌خواست بداند از پشت‌بامش چقدر آب جمع می‌شود. دو دانستهٔ مدرسه‌ای را نداشت: «متر = هزار میلی‌متر» و «مترمکعب = هزار لیتر». این بار سامانه هر دو را جدا نام برد، هر کدام را با یک پرسش سنجید، او هر دو را خودش ساخت و به کار برد؛ کارنامه گیرها را «پیش‌نیاز» نوشت نه ضعف. وقتی گفت «سنم رفته بالا و ریاضیم ضعیفه»، صفحه این بار قاعدهٔ «گیر را دقیق نام ببر» را داشت. اصلاحِ «۶۰ متر نه ۵۰» تمیز نشست و صفحه برای «پنجاه متر مربع»ی که خودش نوشته بود پرسید «این‌جا هم عوض شود؟». ایرادها: یادگیریِ دومش در کارنامه نیامد، صفحه دو بار بی‌جا خواست «به گامِ منتظر برگرد»، و ✏️ برای «۱۵ سانتی‌متر» نپرسید.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۴۸ (کارت) — بزرگسال

## Criteria (written criteria + round-23 requirements)
- [PASS] p5 (NEW reply) prerequisite «تبدیلِ متر به میلی‌متر» named for the step «۱۵۰ میلی‌متر به متر», validated; diagnostic; p6 self-made (diag missing + mastery yes) ⇒ learned; p6 second prerequisite «مترمکعب به لیتر» pushed; p8 self-made ⇒ live problem created on his «ثبتش کن».
- [FAIL] p7, p9 rewrite requests demanded the return restatement although he had already taken the step in the same message and the reply named it in other words (B23·D10/D22).
- [PASS] p14 «ریاضیم ضعیفه»: live problem open ⇒ ability line «… گیر را دقیق کن: کدام مفهوم در کدام گام کم است…» present; reply names both gaps.
- [PARTIAL] mind: «علتِ هر گیر: پیش‌نیاز ۳» with the first stuck twice; «پیش‌نیازهای آموخته» lists only the first (B23·D22).
- [PASS] correction (chat, 7 back, composite statement): u1 clause «۶۰» ⇐ «۵۰» clean (round 22: «متر مربعه متر مربعه»); sufficiency set aside; copy asks for d1 «سطحِ بامِ انبار پنجاه متر مربع» and the measure line «حجم = ۵۰ مترمربع × …» (by meaning, number word) ✓.
- [PARTIAL] ✏️ three numbers (۱۵۰⇒۱۴۰، دو⇒سه، ۲۲۰⇒۲۰۰): statement ✓ minimal; d2 «۱۵ سانتی‌متر» never asked (B23·D3).
- [PARTIAL] 🧭 (live): origin = his statement, destination = «حجمِ آبی که در یک سال از بام جمع می‌شود…» ✓; detours without concept/return; five back-jump points for two corrections (route.txt, part_route_1.png).
- [PASS] Routing 14/14 (p1 now lla_coach; B22·D1 fixed).

## نقشهٔ نیاز
**Parts:** prerequisite layer — met (two in sequence); post-check — over-strict; correction engine — statement and copies met, ✏️ second datum not; mind — partly; route — ends ✓, detours thin.
**Person:** a farmer who feared «age» needed the two exact school facts and the reassurance that it was not age — met by page and model together.

## پیش‌نیاز
Missing (1) «۱ متر = ۱۰۰۰ میلی‌متر» at the step «۱۵۰ mm ⇒ m» and (2) «۱ مترمکعب = ۱۰۰۰ لیتر» at «m³ ⇒ L», ordered by what blocked first ✓; both diagnosed, self-made (mastery in the same message), applied again in two re-computations (9 000 L, 8 400 L) ✓; exact return ✓ (but forced restatement twice); 🧩 linked to the session ✓; mind cause ✓, second learning not booked ✗.

## آزمودنِ اصلاح
| # | turns back / path | should change | what did | must stay — did it | assistant vs page | vs round 22 |
|---|---|---|---|---|---|---|
| 1 | 7 · chat · composite statement + typed copy (number word) | u1 clause; ask d1 «پنجاه…» + measure line; suff set aside | ✓ all | u2 clause ✓ | «فرستادم» then page ✓ | FAIL → PASS |
| 2 | 8 · ✏️ · three numbers | statement ×3; ask d2 «۱۵ سانتی‌متر» | statement ✓; d2 no ask | u1 ✓ | reply = page ✓ | PARTIAL → PARTIAL |

## سن (RUNNER23 §1)
Adult; no block ✓. «سنم رفته بالا» handled as a named gap, not age ✓.

## Routing
### bp2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع ک…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. می‌خوام بدونم در سال…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «خب حجم میشه سطح ضرب در ارتفاع بارون دیگه: ۵۰ × ۱۵۰ = ۷۵۰۰. و…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «یعنی ۱۵۰ میلی‌متر رو متر کنم؟ یه متر صد میلی‌متره دیگه، پس م…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «نه بابا، ۱.۵ متر یعنی تا سینه‌ی آدم! اینجا خشکه. پس اشتباه ک…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آهان، صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه…» | lla_coach | lla_coach | ✓ |
| p7 | rewrite (post-check) | «آهان، صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «ده تا در طول، ده تا در عرض، ده تا در ارتفاع... هزارتا! پس هر…» | lla_coach | lla_coach | ✓ |
| p9 | rewrite (post-check) | «ده تا در طول، ده تا در عرض، ده تا در ارتفاع... هزارتا! پس هر…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «یه اصلاح: اولِ کار که گفتم پشت‌بوم ۵۰ متر مربعه اشتباه بود؛ …» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «با ۶۰: ۶۰ × ۰.۱۵ = ۹ متر مکعب، یعنی ۹۰۰۰ لیتر در سال.…» | lla_coach | lla_coach | ✓ |
| p12 | ✏️ edit turn | «[اصلاحِ پیامِ قبلی] «۱۵۰» ⇐ «۱۴۰»، «دو» ⇐ «سه»، «۲۲۰» ⇐ «۲۰۰…» | lla_assistant | lla_assistant | ✓ |
| p13 | coaching (problem talk) | «با ۱۴۰ میلی‌متر: ۶۰ × ۰.۱۴ = ۸.۴ متر مکعب، یعنی ۸۴۰۰ لیتر. ت…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «هشتاد درصد مطمئنم. راستش اولش که میلی‌متر و متر رو قاطی کردم…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Post-check: accept a paraphrased waiting step / a step already taken in the same message as the return — need: no forced repetition.
- ✏️ copy candidates for every changed number in a multi-number edit.

## ایده‌ها
- A «یکاها» mini-card returned on day 3 (the two facts he rebuilt) — part: 🧩 «practised»; person: not to lose them again.

RESULT: FAIL
