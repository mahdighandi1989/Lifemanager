# bp3 — سارا و نردبان (چند پیش‌نیاز، تودرتو) — ROUND 23 (runner B)

## خلاصه برای مالک
سارا (۱۴ ساله) ارتفاعِ نردبان را «۵ منهای ۳» گفته بود. سه پیش‌نیاز نداشت: قضیهٔ فیثاغورس، و درونِ آن جذر، و بعد مساحتِ مثلث. این بار سامانه همان اول نامِ قضیه را گفت (دورِ پیش دو بار پنهانش کرد)، هر کدام را با یک پرسش سنجید، جذر را درونِ فیثاغورس یاد داد و به همان‌جا برگرداند، بعد به گامِ اصلی؛ مساحت را خودش از مستطیل ساخت و هر دو جواب را رسید. پرونده‌ای برای تمرینِ این سه باز کرد و فردا افتِ جذر را ثبت کرد. ایرادها: «خنگم» در بازنگری بی قاعدهٔ صفحه ماند، نقشهٔ مسیر مقصد را یکی از جمله‌هایش گذاشت و پس از حل ساختارِ تودرتو را گم کرد.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۱۴ (کارت، 2012-01-25) — نوجوان؛ معمای امروز ⇒ «برای این سن هنجارِ معتبر در دست نیست» ✓

## Criteria (written criteria + round-23 requirements)
- [PASS] p3 Pythagoras named at once for the step «ارتفاعِ سرِ نردبان از ۵ و ۳» (round 22: withheld twice); diagnostic p4 (missing) ⇒ taught with 6-8-10 and one mastery question.
- [PASS] p5 NESTED: «۲۲۵ متره؟» ⇒ «جذر» pushed with parent pq1 (stack «۰) … ⇐ ۱) فیثاغورس ⇐ ۲) جذر»); diag (missing) p6, mastery p7 ⇒ return to pq1 («برگردیم به پیش‌نیازِ قضیهٔ فیثاغورس (همان‌جا که برای … یادش می‌گرفتی)»); pq1 mastery p8 ⇒ return to the main step.
- [PASS] p9 second unknown: «مساحتِ مثلث = نصفِ قاعده × ارتفاع» pushed (not nested), self-made from the rectangle (p10); both answers 4 m and 6 m²; independent check with a ruler (p11–p12); chat_solved.
- [FAIL] p11 rewrite demanded «همان گام را چطور برمی‌داری؟» though she had just taken it (B23·D10).
- [FAIL] p14 «فکر می‌کردم شاید خنگم» after closure: no ability rule (B23·D1).
- [PASS] Practice from chat (p13, quoted consent) T41 «فیثاغورس، جذر و مساحتِ مثلث»; day 2 practice_log «✓ جلسهٔ ۲۷ مهر … · موعدِ بعد … روزِ ۳»; regression on «جذرِ ۸۱» recorded.
- [PARTIAL] mind: causes «پیش‌نیاز ۱ · هنوز نامعلوم ۱» — the first stuck stays «نامعلوم» (B23·D18); «پیش‌نیازهای آموخته (پیشرفت، نه ضعف)» lists all three ✓; no weakest ✓.
- [FAIL] 🧭 three moments: before = empty with origin «پروندهٔ این گفت‌وگو»; inside nested = two dotted detours, depth 1 for «جذر» ✓ but destination «ولی خب، ۵ منهای ۳ چرا نمیشه»; after return ✓ «برگشت به پیش‌نیازِ …»; FINAL after chat_solved: three flat detours, no concepts, no returns (B23·D2).
- [PARTIAL] p15 practice report as «مسئلهٔ گفت‌وگو «سلام! امروز برگه‌ی سفید…»» (B23·D13); retract hint on «غلطه» (B23·D14).
- [PASS] Routing 15/15.

## نقشهٔ نیاز
**Parts:** prerequisite stack (FOR: several + nested, ordered, exact return) — met; 🧭 route (FOR: see where she is during detours) — partly; practice — met; mind — mostly.
**Person:** a 14-year-old who missed a lesson needed the theorem's name at the first sign, the root just as far as needed, and her place kept across two unknowns — met (round 22: not met).

## پیش‌نیاز
Order by what blocks this solve: (1) Pythagoras at the height step; (1a, nested) square root inside (1); (2) triangle area for the second unknown. All detected ✓, named ✓, diagnosed ✓, taught only as far as needed ✓, mastery checked ✓ (36, 9-12-15, 8×5), returned exactly after each ✓ (nested return to pq1, then main), solved ✓, 🧩 linked (sess) ✓, mind causes partly (one «نامعلوم»), learned = progress ✓, «🧭» shot at three moments ✓ (gaps above).

## آزمودنِ اصلاح
Non-correction only: «جذر ۸۱ رو ۸ گفتم که غلطه» — no record changed ✓ (hint fired, harmless).

## سن (RUNNER23 §1)
Teen block + safety lines; tone plain; the explicit theorem name fits a teen who missed the class ✓. Mind card after the daily puzzle: «برای این سن هنجارِ معتبر در دست نیست (منبع: Zorowitz…؛ گروه‌های سنیِ معتبرش: ۱۸–۲۹، …)» ✓ (psy.txt, part_mind_age_1.png).

## Routing
### bp3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام! یه سؤال از کتاب: «نردبانی به طول ۵ متر به دیوار تکیه د…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه نردبون کج به دیوار تکیه داده، می‌خوایم بدونیم سرش تا کجای…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «نمی‌دونم... شاید چون نردبون کجه؟ اگه صاف بود ۵ میشد. ولی کج …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «اسمشو شنیدم ولی نمی‌دونم چی میگه. یه چیزی با مربع ضلع‌ها بود…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «۹×۹ = ۸۱، ۱۲×۱۲ = ۱۴۴، جمعشون ۲۲۵. پس وتر ۲۲۵ متره؟ یه کم زی…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «۸؟ چون ۱۶ تقسیم بر ۲ میشه ۸.…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «۶! چون ۶ × ۶ میشه ۳۶. پس جذر ۳۶ میشه ۶.…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «۲۲۵ بود، جذرش... ۱۵ × ۱۵ = ۲۲۵. پس وتر ۱۵!…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «۵ × ۵ = ۲۵، ۳ × ۳ = ۹. دیوار یکی از اون دو ضلعه، پس ۲۵ منهای…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «کشیدم. قطر مستطیل رو دقیقاً نصف می‌کنه! پس مثلث نصف مستطیله:…» | lla_coach | lla_coach | ✓ |
| p11 | rewrite (post-check) | «کشیدم. قطر مستطیل رو دقیقاً نصف می‌کنه! پس مثلث نصف مستطیله:…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «روی کاغذ شطرنجی یه مثلث ۳ و ۴ کشیدم و ضلع کجش رو با خط‌کش ان…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «همون پرسش تشخیصی که گفتی مربعِ ۱۶ خونه‌ای ضلعش چنده؛ اونجا ف…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «شمردن خونه‌ها و ساختن مساحت از مستطیل رو دوست داشتم. اینکه ا…» | lla_coach | lla_coach | ✓ |
| p15 | coaching (problem talk) | «سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت …» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Route map: keep nested depth and returns after chat_solved; origin/destination from the statement and both unknowns.
- Ability rule after closure (B23·D1).

## ایده‌ها
- A «prerequisite bridge» card: the next textbook problem that uses exactly the three learned concepts, offered by Today on day 3 — part: 🧩 → practice; person: real use, not only recall.

RESULT: FAIL
