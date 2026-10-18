# aB2 — کیان و ۱+۳+…+(2n−1) = n² (نوجوانِ ۱۶ ساله؛ بازنگری به‌عنوانِ کارِ اصلی) — ROUND 23 (runner B)

## خلاصه برای مالک
کیان (۱۶ ساله) برهانِ استقرایی‌اش نمرهٔ کامل گرفته بود ولی نمی‌فهمید «چرا» درست است. این سناریو فقط بازنگری بود: جای فرض و تعریف را در برهانش پیدا کرد، با چیدنِ خانه‌ها دید هر عددِ فرد یک L دورِ مربعِ قبلی است، همین روش را به مجموعِ زوج‌ها برد (n(n+1))، با حالت‌ها و استقرا ثابتش کرد، و سه روز بعد ۱+۳+…+۹۹ را خودش ۲۵۰۰ گفت و با 2n−1=99 وارسی کرد. صفحه بازنگری را درست شناخت و فهرستِ پرسش‌های بازنگریِ اثبات را داد؛ فقط حدس‌های آزموده‌اش «آزموده نشده» ماندند.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۱۶ (کارت، 2010-03-08) — نوجوان

## Criteria (written criteria + round-23 requirements)
- [PASS] Page recognised look-back at p1 («مرحلهٔ محتمل: بازنگری · اثباتی»), proof look-back list b1–b5; b1 (hypothesis used), b2 (definition 2n−1), b4 (another way: L-shapes, «در یک نگاه»), b5 (use elsewhere: evens = n(n+1)) all done by him.
- [PASS] New problem built and proved (three cases + rectangle + induction); lesson, best question, taste via chat_solved/chat_lookback.
- [PASS] Multi-day: day 3 transfer 1+3+…+99 = 2500 with his own check (2n−1 = 99 ⇒ n = 50; 50×50 square).
- [FAIL] guesses tested in chat stay «آزموده نشده» (route FINAL) (B23·D23); p7 suggestion «پس از تبدیل‌ها … هم‌ارز؟» irrelevant (B23·D12).
- [PASS] Age: teen block; replies plain, no lecturing, let him propose the next move (b5 «کدام حکمِ دیگر؟»); taste «حوصله‌م سر میره» answered with a concrete suggestion, not a sermon.
- [PASS] Routing 11/11.

## نقشهٔ نیاز
**Parts:** look-back list for proofs (FOR: understanding why, not only that) — met; chat_solved/lookback — met; route — guesses wrong state.
**Person:** a teen who wanted to «see why» — met (the L picture), and to own the method — met (day-3 transfer).

## پیش‌نیاز
No prerequisite (he had induction and algebra; the gap was meaning, addressed by look-back).

## آزمودنِ اصلاح
Not a correction-trial scenario.

## سن (RUNNER23 §1)
Teen ✓ (block garble B23·D8 in prompt only).

## Routing
### aB2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. دیروز تکلیفمون رو حل کردم: با استقرا ثابت کردم مجموع n…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «خب تو گام استقرا نوشتم: 1+3+…+(2n−1)+(2n+1) = n² + (2n+1) = …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «کشیدم! ۱ یه خونه‌ست. ۳ تا خونه دورش یه L درست می‌کنن، میشه م…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «تو پایه‌ی استقرا n=1، عدد فرد اول 2×1−1 = 1. و تو گام، عدد ف…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «مثلاً مجموع n عدد زوج اول: 2+4+…+2n. اگه خونه بچینم، ۲ تا، ب…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «n=1: ۲ = 1×2 ✓. n=2: ۲+۴=۶ = 2×3 ✓. n=3: ۱۲ = 3×4 ✓. شکلشم ک…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «درسم اینه: بعد از اینکه با استقرا ثابت کردم، یه شکل بکشم که …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «همون که گفتی اعداد فرد رو با خونه‌ها بچینم. اونجا تازه دیدم …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «اون شکله خیلی باحال بود! ولی خوندن استقرای معلم سخته، حوصله‌…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «سلام! امروز تو کتاب یه سؤال بود: 1+3+5+…+99 چنده؟ سریع گفتم:…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «چون nامین فرد 2n−1 ـه: 2n−1 = 99 پس n = 50. پس ۵۰ تا فرده و …» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Chat guess outcomes from the next message's test (three cases / proof) — need: the route and mind must show his tests.

## ایده‌ها
- Picture-proof gallery of his own («L دورِ مربع») attached to the theorem in 🧩/farm — part: look-back «see at a glance»; person: he loves the picture, dislikes formal induction.

RESULT: FAIL
