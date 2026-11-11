# aB3 — بازنشستهٔ ۶۷ ساله و پس‌اندازِ ۳۰۰ میلیونی (تصمیمِ سپرده) — ROUND 26 (runner B)

## خلاصه برای مالک
مردی بازنشسته می‌خواست بداند پس‌اندازش تا کی دوام می‌آورد و سپردهٔ ۲۳ درصدی بگذارد یا نه. خودش تورم را پیدا کرد، خرجِ درمان را از دفترچه‌اش درآورد، قیدِ «۵۰ میلیون دمِ دست» را گذاشت، حدسِ «اصلاً تمام نمی‌شود» را با حسابِ سالِ دوم رد کرد، طرح و پیش‌بینی‌اش را با موعدِ ۱ اردیبهشت ثبت کرد، حقوق را از ۱۸ به ۱۹ اصلاح کرد و شش ماه بعد با عددهای واقعی برگشت. اصلاحِ ۱۸⇐۱۹ این بار به صورتِ مسئله، دادهٔ فرم و سرانجامِ حدس رسید و صفحه خواست نتیجه دوباره وارسی شود؛ روزِ موعد هم برنامه در «امروز» آمد. دو ایرادِ مهم‌تر ماند: نتیجهٔ کهنه‌ای که با ۱۸ حساب شده بود بی هیچ نشانی در پرونده ماند، و هنگامِ گفتنِ طرح، صفحه مرحله را «بازنگری» نوشت.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p6 whole-first; unknown, data, condition asked one per turn; inflation and medical cost found by himself; no decision made for him.
- [PASS] p2 birth «۱۲ اردیبهشت ۱۳۳۸» ⇒ one line «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸ …» (exact: 1959-05-03 ✓); «شما» kept.
- [FAIL] p7 word arithmetic «۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ … تقسیم بر ۱۲ میشه حدود ۴.۸» — no block (B26·D35 instance, S3).
- [PASS] p8 ✓ «۲۱ × ۱.۳ = ۲۷.۳», ✓ «۱۸ × ۱.۲ = ۲۱.۶»; his own test refutes «اصلاً تموم نمیشه».
- [FAIL] p9 «# وضعِ کنونی … مرحله: بازنگری» while he states his plan (B26·D26 instance, S2).
- [PASS] p9–p10 plan with his own date («اولیش ۱ اردیبهشت» ⇒ 2027-04-21, ۱ اردیبهشت ۱۴۰۶ ✓) and, after «آره، ثبتش کن», «🔭 مسئله ثبت شد …»; prompt stage and live stage agree («اجرا» / «اجرا روی واقعیت») (B25·D20 FIXED).
- [PASS] p11–p12 correction 18⇒19: «✓ اصلاح شد: سرانجامِ حدسِ «پس اصلاً تموم نمیشه؟» («رد شد») دیگر برقرار نیست — با مقدارِ درست دوباره آزموده شود · صورتِ مسئلهٔ گفت‌وگو … · پیش‌نویسِ فرمِ فهم: داده … · صورتِ مسئله …»; turn question «با مقدارِ اصلاح‌شده («۱۹ میلیونه») نتیجه را دوباره وارسی کند …»; p12 ✓ «۱۹ × ۱.۲ = ۲۲.۸», ✓ «۲۷.۳ − ۲۲.۸ = ۴.۵».
- [FAIL] 📜 after the correction: the old derived result «کسری ۵.۷ میلیون … از سال دوم کم‌کم از اصل پول می‌خوره» stays unmarked (B26·D4 class STILL, S2).
- [PASS] p13 page question is one question («نتیجه‌ای گفتید — با واقعیت سنجیدیدش؟ …») (B24·D12 p13 FIXED).
- [PASS] s17 (+185 d) Today: «📌 برنامهٔ خودتان: «هر شش ماه … اولیش ۱ اردیبهشت» — موعد: ۱ اردیبهشت ۱۴۰۶ — انجام شد؟ · همان کار: ⏰ «پیگیری: بازحسابِ پس‌انداز با عددهای واقعی»» (one item, not two); p14 «# برنامهٔ خودش که موعدش رسید»; his report closes pl1.
- [FAIL] 📜: guess row shows his computation sentence, not the guess (B26·D39, S3); inference and fragments as data (B25·D24 STILL, S3); two arrow forms (B24·D16 STILL, S3).
- [PASS] routing 14/14.

## نقشهٔ نیاز
Parts: coach for a real decision (FOR his own numbers and his own judgment) — met; correction (FOR reaching everything built on the old value) — reached statement, datum, guess; missed the derived result (D4 class); date/plan keeper — met (right date, came back on the day, one item); stage tracker — wrong once (D26). Person (a retiree deciding about his savings): needed not to be told what to do, to see his own arithmetic confirmed, and to be reminded on the day — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| p7 «۲۵۰ … ضربدر ۲۳ درصد میشه ۵۷.۵ … تقسیم بر ۱۲ میشه حدود ۴.۸» | 57.5; 4.79 | no block | unread (D35) |
| p8 «۲۱ ضربدر ۱.۳ = ۲۷.۳» | 27.3 | ✓ «۲۱ × ۱.۳ = ۲۷.۳» | correct |
| p8 «۱۸ ضربدر ۱.۲ = ۲۱.۶» | 21.6 | ✓ | correct |
| p8 «کسری ۵.۷» (27.3 − 21.6) | 5.7 | no line (no «=») | unread |
| p12 «۱۹ ضربدر ۱.۲ = ۲۲.۸» | 22.8 | ✓ | correct |
| p12 «۲۷.۳ منهای ۲۲.۸ = ۴.۵» | 4.5 | ✓ «۲۷.۳ − ۲۲.۸ = ۴.۵» | correct |

## سن
67 (born ۱۲ اردیبهشت ۱۳۳۸ = 3 May 1959): said in chat, sent as he wrote it, converted by the page; «شما» kept.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B25·D20 (prompt stage vs live stage): FIXED.
- B24·D12 (p13 two questions): FIXED.
- B25·D24 (inference/fragments as data): STILL.
- B24·D16 (two arrow forms): STILL.
- B24·D2 (aB3): correction now reaches statement + form datum; derived result still not (D4 class).
- B24·D7: FIXED (see aB3x).

## Routing (14/14 correct)
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

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Mark every result that used a corrected number as «با عددِ پیشین» until he re-does it, then link old and new.
- Read «میشه» as «=».

## ایده‌ها
- He would ask: «سالِ سوم را خودش برام حساب می‌کنه؟» — the page holds his numbers but offers no year-by-year table for him to fill.

## Defects (catalogue round26B/defects.md)
- B26·D4 class STILL (S2) 📜 · B26·D26 instance (S2) p9 · B26·D35 instance (S3) p7 · B26·D39 (S3) 📜 · B25·D24 STILL (S3) · B24·D16 STILL (S3).

RESULT: FAIL — 2 S2 + 4 S3
