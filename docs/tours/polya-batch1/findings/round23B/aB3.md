# aB3 — آقای رضایی، پس‌انداز و سپرده (۶۷ ساله) — ROUND 23 (runner B)

## خلاصه برای مالک
آقای رضایی (۶۷ ساله، بازنشسته) می‌خواست بداند پس‌اندازش تا کی دوام می‌آورد و سپرده بگذارد یا نه. با پرسش‌ها تورم و خرجِ ناگهانیِ درمان را خودش آورد، اول مسئلهٔ ساده‌تر (بی‌تورم) را حل کرد و بعد تورم را برگرداند و دید از سالِ دوم اصلِ پول خورده می‌شود؛ یک اصلاح کرد (حقوق ۱۹ نه ۱۸) و دوباره حساب کرد؛ تصمیم گرفت و برای ۶ ماه بعد بازبینی گذاشت. شش ماه بعد «امروز» همان بازبینی را آورد و پیش‌بینی‌اش درست درآمد. گفت‌وگو محترمانه و با حوصله بود. ایرادها: تاریخِ شمسی را فقط مدل تبدیل کرد، و وقتی مسئله را در «🔭» ثبت کرد، صفحه از اول «فهمِ مسئله» شروع کرد و پرسش‌هایی را که جواب داده بود دوباره پیش کشید.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۶۷ — کارت «بعداً»، تاریخ در گفت‌وگو «۱۲ اردیبهشت ۱۳۳۸» ⇒ مدل 1959-05-02 ⇒ «سالمند»

## Criteria (written criteria + round-23 requirements)
- [PASS] Understanding: whole, unknown, data incl. inflation and health costs (from his notebook), condition (50 M kept liquid).
- [PASS] Plan: auxiliary simpler problem (no inflation) ⇒ 4.8 M interest > 3 M deficit; then the set-aside datum returned ⇒ year-2 deficit 5.7 > 4.8 (later 4.5 < 4.8 with 19 M).
- [PASS] Correction (3 back, chat): «۱۹» ⇐ «۱۸» in the chat and live statements (minimal span); his decision/plan untouched (nothing rested on it) ✓; recomputation asked.
- [PASS] Decision with date and 70 %; Today on 2027-04-21 brings «📌 برنامهٔ خودت (pl1)»; the review reported ⇒ plan_done; prediction came true.
- [FAIL] live_new after nine chat turns restarts at «فهمِ مسئله»; u0 re-asked p11–p12; strip «اکنون: فهمِ مسئله · مانده: نامعلوم — طرح هنوز نیست» on the review day (B23·D5).
- [FAIL] Birth: page cannot take «۱۲ اردیبهشت ۱۳۳۸»; only the model's conversion (B23·D6). p2 reply said «ثبت کردم» before the page result (my reply; better/r2.txt).
- [PARTIAL] p4 «فکر کنم سود بانک هم مهمه» read as a guess (B23·D11); p7/p8 suggestions misfit (B23·D12).
- [PASS] Age: elder block («با حوصله… تجربه‌اش را به رسمیت بشناس… بی تحقیر»); replies «شما», short paragraphs, his notebook data respected; mind after the daily puzzle «برای این سن هنجارِ معتبر در دست نیست …» ✓.
- [PASS] Routing 14/14 («آره، ثبتش کن» ⇒ lla_assistant ✓).

## نقشهٔ نیاز
**Parts:** coach (practical, reality as judge) — met; 🔭 live problem (FOR: keep understanding/plan/steps and return in Today) — creation lost the chat work ✗; Today plan — met; retract — met; mind — honest.
**Person:** a retiree needed a clear, honest picture with a dated check, not advice — met; he needed the page not to treat him as a beginner after he moved his work into «🔭» — not met.

## پیش‌نیاز
No prerequisite: compound/inflation arithmetic he did himself; the «simpler problem first» move was enough.

## آزمودنِ اصلاح
| # | turns back / path | should change | what did | must stay — did it | assistant vs page | vs round 22 |
|---|---|---|---|---|---|---|
| 1 (new) | 3 · chat · a datum in a chat statement copied into a live problem | chat + live statement 18⇒19 | ✓ both, minimal | plan pl1, 70 % ✓ | «فرستادم» then page ✓ | new — PASS |

## سن (RUNNER23 §1)
Elder band ✓; respectful tone ✓; Jalali via model only (B23·D6).

## Routing
### aB3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق با…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «آره، تورم! خرج‌مون هر سال حدود ۳۰ درصد زیاد میشه، ولی حقوقم …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «فکر کنم سود بانک هم مهمه، و اینکه یه وقتی مریض بشیم خرج یهوی…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «دفترچه‌م رو نگاه کردم: پارسال حدود ۴۰ میلیون خرج دندون و دکت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «خانمم میگه همیشه باید حداقل ۵۰ میلیون دم دست باشه. پس ۲۵۰ تا…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون در سال، تقسیم بر ۱…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «خرج میشه ۲۱ ضربدر ۱.۳ = ۲۷.۳، حقوق ۱۸ ضربدر ۱.۲ = ۲۱.۶. کسری…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست. و هر شش ماه یه با…» | lla_coach | lla_coach | ✓ |
| p10 | action-only | «آره، ثبتش کن.…» | lla_assistant | lla_assistant | ✓ |
| p11 | coaching (problem talk) | «ببخشید، یه اشتباه کردم: حقوقم ماهی ۱۸ نیست، ۱۹ میلیونه؛ فیشم…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «با ۱۹: حقوق سال دوم ۱۹ ضربدر ۱.۲ = ۲۲.۸، کسری ۲۷.۳ منهای ۲۲.…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «سالانه بسه، ولی خرج درمان رو جدا می‌نویسم چون یهویی میاد.…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «سلام، اول اردیبهشته. همون حساب رو کردم: الان کسری ماهانه حدو…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Carry the conversation's understanding/plan/result into a live problem created from it (fill-empty, with «از گفت‌وگو» source).
- Jalali dates in birth input (B23·D6).

## ایده‌ها
- A money-plan worksheet with yearly rows (deficit vs interest) the elder can fill at each review — part: 🔭 steps/measure; person: his six-monthly check in one table.

RESULT: FAIL
