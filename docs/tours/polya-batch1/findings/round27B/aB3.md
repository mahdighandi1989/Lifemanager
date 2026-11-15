# aB3 — بازنشستهٔ ۶۷ ساله و پس‌انداز (تصمیمِ مالی، شش ماه) — ROUND 27 (runner B)

## خلاصه برای مالک
بازنشسته‌ای با ۳۰۰ میلیون پس‌انداز تورم، سود و خرجِ درمان را وارد کرد، دید سود تا سالِ دوم کسری را می‌پوشاند، حقوقش را از ۱۸ به ۱۹ اصلاح کرد و دوباره حساب کرد، و شش ماه بعد با عددهای واقعی برگشت. این دور «میشه» خوانده شد، نتیجهٔ ساخته‌شده بر ۱۸ «کهنه» نام برده شد، مرحله وقتِ گفتنِ برنامه «بازنگری» نشد و گردکردنِ «۵ میلیون» پرسیده شد. ماند: پیش‌بینیِ «۷۰ درصد مطمئنم» هیچ 🎯 نساخت، «سرِ برج» و «عید» خوانده نشد، «۲۰ درصدِ ۳۰۰ میلیون … میشه ۶۰» نه سنجیده شد نه «نسنجیده» گفته شد، و یک قول دو رکورد ساخت.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p6 whole-first in «شما»; data that changes yearly (inflation 30 % / salary 20 %) found by him; card birth Jalali.
- [PASS] p7 «۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون … تقسیم بر ۱۲ میشه حدود ۴.۸» ✓ ✓ (round 26 B26·D35 instance: unread).
- [PASS] p8 «۲۱ × ۱.۳ = ۲۷.۳» ✓, «۱۸ × ۱.۲ = ۲۱.۶» ✓.
- [PASS] p9 stage «اجرا» while he states the plan (round 26 B26·D26 instance: «بازنگری»); date «اولیش ۱ اردیبهشت» asked and booked after his «آره، ثبتش کن».
- [FAIL] p9–p10 one commitment, two records: «📌 … به گفتهٔ خودتان ثبت شد — ۱ اردیبهشت» AND «⏰ «پیگیری: بازحسابِ پس‌انداز با عددهای واقعی» — ۱ اردیبهشت»; both closed after his report (round 26: ⏰ stayed «انجام شد؟»). B26·D21 / U50 CHANGED (S3: two records remain).
- [FAIL] p9 «۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره» and p14 «پیش‌بینیم درست درومد» — no 🎯 at all (post: none). U49 / B26·D22 (Bx) STILL (S3).
- [PASS] p11–p12 correction 18 ⇒ 19: statement, form datum, guess outcome set aside; 📜 «نتیجهٔ «کسری ۵.۷ میلیون …» دیگر برقرار نیست — بر «۱۸» بنا بود — با «۱۹ میلیونه» دوباره حساب شود» (round 26 D4 class: unmarked); his redo «۱۹ × ۱.۲ = ۲۲.۸» ✓, «۲۷.۳ − ۲۲.۸ = ۴.۵» ✓.
- [PASS] no false «دو ضمیر» rewrite on any turn (round 26 U55 instance).
- [PASS] guess row in 📜 «پس اصلاً تموم نمیشه؟» (round 26 B26·D39: the message's first sentence).
- [FAIL] post 📜 data rows «پس سالی حدود ۳۰ میلیون» (his inference), «سال قبلش ۲۵ میلیون», «ولی حقوقم هر سال فقط حدود ۲۰ درصد» (fragments). B25·D24 STILL (S3).
- [FAIL] post 📜 «اصلاح شد ⇐ «رد شد» → «سر…»» two arrow forms. B24·D16 STILL (S3).
- [PASS] p15 (added) «۵۷٫۵ تقسیم بر ۱۲ = ۵ میلیون» ⇒ «؟ … ≈ ۴٫۷۹ … جویا شو گرد کرده» (C25); «۳۰ درصدِ ۲۱ میلیون میشه ۷ میلیون» ⇒ ✗ «۶٫۳ میلیون» (exact 6.3).
- [FAIL] p15 «اگه ۲۰ درصدِ ۳۰۰ میلیون رو بذارم طلا، میشه ۶۰ میلیون» (exact 60, correct) — no line (C17/C28). U26 family (S3).
- [FAIL] p15 «سرِ برج دوباره حساب می‌کنم، عید هم با بچه‌ها … حرف می‌زنم» — no date ask; model plan.when (2027-05-22 = ۱ خرداد ۱۴۰۶) dropped, booked «موعد: جلسهٔ بعد»; «عید» unread. Fixer «Not done» confirmed (S3).

## نقشهٔ نیاز
Parts: arithmetic reader — met for «میشه», scale, %, rounding; one form silent; forecast ledger (FOR his 70 % claim and its outcome) — unmet; correction engine — met; date reader — misses «سرِ برج/عید»; register — «شما» kept. Person: an elder planning money needed to see when savings run out and to be reminded at the next check — met for the first, the «سرِ برج» reminder is dateless.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
| turns back | path | change | did | ✓ |
|---|---|---|---|---|
| 3 (p11) | chat | 18 ⇒ 19; result «کسری ۵.۷» stale; guess outcome set aside | all, with history | ✓ |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون» | 57.5 | ✓ | ✓ |
| «تقسیم بر ۱۲ میشه حدود ۴.۸» | 4.79 | ✓ | ✓ (C9) |
| «۲۱ × ۱.۳ = ۲۷.۳», «۱۸ × ۱.۲ = ۲۱.۶» | 27.3, 21.6 | ✓ ✓ | ✓ |
| «۱۹ × ۱.۲ = ۲۲.۸», «۲۷.۳ − ۲۲.۸ = ۴.۵» | 22.8, 4.5 | ✓ ✓ | ✓ |
| «۲۰ درصدِ ۳۰۰ میلیون … میشه ۶۰ میلیون» | 60 | silent | S3 (C17) |
| «۵۷٫۵ تقسیم بر ۱۲ = ۵ میلیون» | 4.7917 | ؟ ask rounding | ✓ (C25) |
| «۳۰ درصدِ ۲۱ میلیون میشه ۷ میلیون» | 6.3 | ✗ (۶٫۳) | ✓ |

## سن
67; «شما» in chat and stored lines; no rewrite.

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D4 class / U4 (aB3: derived result unmarked after 18⇒19): FIXED — 📜 stale line for «کسری ۵.۷».
- B26·D26 instance / U11 (aB3 p9 «بازنگری» while stating the plan): FIXED — p9 «اجرا».
- B26·D35 instance / U26 (aB3 p7 «میشه» unread): FIXED — p7 ✓ ✓.
- B26·D39 (guess row shows wrong sentence): FIXED.
- U55 (aB3 false «دو ضمیر» rewrite): FIXED — no rewrite.
- U50 / Bx D21 (one commitment two records; ⏰ stays after done): CHANGED — both close; two records remain.
- U49 / Bx D22 (70 % prediction makes no 🎯): STILL.
- B25·D24 (inferences/fragments as data): STILL.
- B24·D16 (two arrow forms): STILL.

## Routing (15/15 correct)
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
| p15 | coaching (problem talk) | «دو تا حسابِ دیگه کردم: اگه ۲۰ درصدِ ۳۰۰ میلیون رو بذارم طلا،…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- A «پیش‌بینی» card offered whenever a sentence carries «N درصد مطمئنم» + a dated outcome.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- U50 remainder (S3, b) p9–p10: one commitment ⇒ 📌 + ⏰.
- U49 STILL (S3, b) p9/p14.
- B25·D24 STILL (S3, b) 📜.
- B24·D16 STILL (S3, c) 📜.
- U26 family (S3, b) p15 «۲۰ درصدِ ۳۰۰ … میشه ۶۰» silent.
- «سرِ برج/عید» unread (S3, b) p15.

RESULT: FAIL — 6 S3
