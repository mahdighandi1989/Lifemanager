# oB1 — کاربرِ مالک‌مانند، بیداریِ ساعت ۶ — بانکِ ۹ تا ۱۶ — ROUND 25 (runner B)

## خلاصه برای مالک
مردی کنجکاو که پشتِ هر جواب پرسشی دربارهٔ خودِ سامانه داشت. پرسش‌های ۹ تا ۱۶ ِ بانک در دلِ مسئلهٔ بیداری پرسیده شد: آفلاین (هست؛ گفت‌وگو مدل می‌خواهد)، مدلِ محلی، کتابِ همراه، تصویرِ پیش/پس و ایمیلِ گزارش (نیست ⇐ برگه‌های #۱۰۲، #۱۰۳، #۱۰۴ بی آن‌که گامی منتظر شود)، اختراع (بیشترش هست، کمبودها نام برده شد). ولی وقتی مسئلهٔ دومی (شام و بی‌خوابی) آورد، صفحه آن را دادهٔ همان مسئلهٔ بیداری کرد.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] bank #9 p9 (reuse r24), #10 p13 (reuse), #11 p15, #12 p17, #13 p18, #14–#15 p20, #16 p22–p23 — see table.
- [PASS] system-self sheets #102–#104 filed with second opinion and NO waiting step (R1).
- [FAIL] new problem «یه مسئله‌ی دیگه هم دارم … شام … خوابم نمی‌بره» imported as «داده (از گفت‌وگو)» on the wake-up problem's route; «# وضعِ کنونی» keeps the old problem (B25·D12, S2).
- [FAIL] p14 lesson read as a guess, quote emptied «فکر می‌کنم مشکل «» ست» (B25·D22, S3); route: refuted guess «اراده» «آزموده نشده», destination = his meta-sentence (B25·D23, S3); p20 prior block on a pure question (B25·D13).
- [PASS] p7 follow-up «این نما فیلدی برای پر کردن ندارد» (A24-16 class FIXED); p8 no «خودت فکر می‌کنی چرا؟» (B24·D12 oB1 FIXED).
- [PASS] routing 19/19 user turns (+4 internal second opinions).

## نقشهٔ نیاز
Parts: assistant self-knowledge («خودِ سامانه») — honest «هست/نیست» with sheets; problem binding (FOR keeping two problems apart) — not met (D12). Person (owner-like): wanted evidence, not a show — met for #9–#15, partly for #16.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
Adult; birth confirmation now one line, Jalali only (B24·D6 fixed).

## پرسش‌های بانکِ مالک (۹–۱۶)
| # | his words (abridged) | answer | where / evidence |
|---|---|---|---|
| 9 | «اگه یه چیزی که لازم دارم تو سیستم نباشه … ثبت میشه؟ وقتی ساختینش خودش بهم خبر میده …؟» | هست — برگه، علامتِ منتظر، «🛎 ابزارِ لازم آمد» و ازسرگیری؛ ولی تطبیق هنوز می‌تواند ابزارِ نامربوط را «رسید» بخواند | p9 (reuse); evidence tB1/tB1y/tB1z (B25·D1) |
| 10 | «اگه فردا مدل … عوض شه، این روش و این پرونده‌ها همین‌طور می‌مونن؟» | هست — رکوردها مالِ صفحه‌اند، روش مستقل از مدل | p13 (reuse), «خودِ سامانه» |
| 11 | «اینترنت نداشتم … آفلاین؟ … مدلِ خودتون رو گوشیِ خودم؟» | هست (صفحه و داده‌ها آفلاین؛ گفت‌وگو مدل می‌خواهد) / نیست ⇐ برگهٔ #۱۰۲ | p15–p16, sheets/sh102.json |
| 12 | «ساعتِ زنگ‌داری که تا گوشی سرِ جاش نره قطع نشه … تا برنامهٔ ساخت؟» | هست با نامِ کمبودها (پیشینه، ایمنیِ سخت‌افزار ⇒ برگه هنگامِ رسیدن به گام) | p17 |
| 13 | «یه کتاب … برای پسرِ ۱۰ ساله و پدرِ ۷۰ ساله؟» | نیست ⇐ برگهٔ #۱۰۳ (منبعِ پولیا در «📚 منبع‌ها و پوشش» هست) | p18–p19, sh103 |
| 14 | «از کجا ببینم هر بخش … بهتر شده؟ عکسِ قبل و بعد؟» | برای کارِ خودش هست (کارنامه/پرونده)؛ برای بخش‌های سامانه نیست ⇐ #۱۰۴ | p20–p21, sh104 |
| 15 | «بعد از هر جلسه گزارش ایمیل بشه؟» | نیست ⇐ #۱۰۴ | p20 |
| 16 | «دو تا مسئله شد، نقشه و پرونده و کارنامه هر کدوم مالِ کدوم؟» | نیمه — دومی تا ثبتِ جدا در 🔭 همان نقشه/پروندهٔ گفت‌وگو را می‌گیرد؛ صفحه آن را دادهٔ مسئلهٔ اول کرد (B25·D12) | p22–p23, s23 (🧭 TWO-PROBLEMS) |

## Round-24 defects in this scenario
- D12 (oB1 p8): FIXED
- D14 class (oB1 guess): STILL (route)

## Routing
### oB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. می‌خوام روش پولیا رو روی زندگی خودم امتحان کنم، با یه …» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «هفته‌ای پنج روز از هفت روز صبح زود بیدار شم و یه ساعت مطالعه…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «دو روز موفق، شب قبلش ساعت ۱۱ خوابیده بودم و گوشی رو گذاشته ب…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه، اون دو روز راحت بیدار شدم! پس شاید اراده نیست، خواب و گو…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «آزمونش: از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ م…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «اگه کمتر شد یعنی خواب و گوشی تنها علت نیست و باید دنبال یه چ…» | lla_coach | lla_coach | ✓ |
| p7 | automatic follow-up | «[سامانه: «🧭 نقشهٔ مسیرِ مسئله» باز شد. این نما فیلدی برای پر…» | lla_assistant | lla_assistant | ✓ |
| p8 | coaching (problem talk) | «یه سؤالِ دیگه قبل از ادامه: فرض کن وسطِ همین کار گیر کنم چون…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «دیدمش، اون پرش اصلاح هم توشه. حالا اگه یه چیزی که لازم دارم …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «سلام، یه هفته گذشت. ساعت بیداری این هفت روز: ۶:۰۵، ۶:۱۰، ۷:۳…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «مهمونی آخرش یعنی دیر خوابیدن، پس همون خوابه، علت تازه نیست. …» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «یه چیز دیگه هم برام مهمه: کارنامه‌ی ذهنم منو با کی مقایسه می…» | lla_coach | lla_coach | ✓ |
| p13 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p14 | coaching (problem talk) | «درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموف…» | lla_coach | lla_coach | ✓ |
| p15 | coaching (problem talk) | «سلام، یه روز گذشت. چند تا سؤالِ دیگه دارم که برام مهمه، یکی‌…» | lla_coach | lla_coach | ✓ |
| p16 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p17 | coaching (problem talk) | «یه ایده هم برای همین بیداری دارم: یه ساعت زنگ‌دار که تا گوشی…» | lla_coach | lla_coach | ✓ |
| p18 | coaching (problem talk) | «یه کتاب هم هست که همین روش رو با مثال‌های واقعی یاد بده؟ می‌…» | lla_coach | lla_coach | ✓ |
| p19 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p20 | coaching (problem talk) | «و از کجا ببینم هر بخشِ این سیستم توی این مدت چطور کار کرده و…» | lla_coach | lla_coach | ✓ |
| p21 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p22 | coaching (problem talk) | «راستی یه مسئله‌ی دیگه هم دارم که به همین بیداری ربط داره ولی…» | lla_coach | lla_coach | ✓ |
| p23 | coaching (problem talk) | «حالا که دو تا مسئله شد، از کجا بفهمم نقشه‌ی مسیر و پرونده و …» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- New chat problem detection mid-session ⇒ new pk + its own 🧭/📜 (or the 🔭 offer) instead of importing it as data of the old one.
- «خودِ سامانه» facts for: local model plans, companion book status, per-part progress pictures, e-mail reports (so the model can answer «هست/نیست» from the map).

## ایده‌ها
- «وقتی دو مسئله را با هم آوردم، نقشه خودش دو تا می‌شود؟» (two-need map: part = route binding; person = no mixing) — partly missing.
- «برگه‌هایی که برای من ثبت شد کجاست و کی جواب می‌گیرد؟» — a list of «my sheets» with status.

## Defects (catalogue round25B/defects.md)
- B25·D12 (S2)
- B25·D22, D23, D13 (S3)

RESULT: FAIL — 1 S2 + 3 S3
