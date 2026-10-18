# aB4 — آقای ۸۲ ساله و معمای مرغ و خرگوش (تازه) — ROUND 24 (runner B)

## خلاصه برای مالک
معلمِ بازنشستهٔ ۸۲ ساله معمای نوه‌اش را خودش با حدس و اصلاح حل کرد (۲۳ مرغ و ۱۲ خرگوش)، وارسی کرد، از راهِ دوم («همه مرغ باشند») هم رسید و فردا به نوه‌اش یاد داد؛ نوه خودش مسئلهٔ تازه ساخت. کارت: «۳۰ اسفند ۱۳۲۲» با جملهٔ «کبیسه نبود» رد شد، «1323/5/10» درست ثبت شد. ایرادها: صفحه وسطِ کار او را به «تو» برگرداند، «قولِ عقب‌افتاده»ای ساختگی ساخت، وارسیِ انجام‌شده را دوباره پرسید و در ثبتِ مسئله فقط صورت را برد.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] unknown/data/condition, guess-test-adjust, check, second method, look-back lesson, taught the grandchild (all replies new).
- [PASS] «۸۲ سالمه» ⇒ elder band at once; card invalid/valid; 1944-08-01 = ICU; mind no-norm.
- [FAIL] «از تاریخِ تولدِ ثبت‌شده» before any date (B24·D8).
- [FAIL] p8 forced «تو» (B24·D11; better/r8).
- [FAIL] false promise p9/p10 (B24·D9); stale check question p9/p10 (B24·D12).
- [FAIL] chat_solved imports only the statement; route duplicates; «حل شد خورد» vs «هنوز بسته نشده» (B24·D2, D18).
- [PASS] routing 10/10 (incl. the rewrite).

## نقشهٔ نیاز
Parts: assistant tone for elders (FOR respect without condescension) — the register guard overrode it; chat ⇄ 🔭 (FOR keeping his work for tomorrow) — only the statement kept. Person: real arrival and teaching — met.

## پیش‌نیاز
None (multiplication known).

## آزمودنِ اصلاح
n/a

## سن
80+ (new for B) ✓ band; ICU ✓; tone respectful in replies; register flip by the page.

## Round-23 defects in this scenario
new scenario

## Routing
### aB4 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من ۸۲ سالمه، معلم بازنشستهٔ جغرافیا. نوه‌م یه معما ازم…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «مجهول: تعداد مرغ‌ها و تعداد خرگوش‌ها. داده‌ها: ۳۵ تا سر و ۹۴…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «یه حدس بزنم: تقریباً نصف نصف، مثلاً ۲۰ مرغ و ۱۵ خرگوش. پاها …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «اگه یه خرگوش رو بکنم مرغ، سرها همون ۳۵ می‌مونه ولی پاها ۲ تا…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «وارسی کردم: ۲۳ + ۱۲ = ۳۵ سر. پاها: ۲۳×۲ = ۴۶ و ۱۲×۴ = ۴۸، رو…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «از یه راه دیگه... اگه همه مرغ بودن: ۳۵×۲ = ۷۰ پا. ۹۴ − ۷۰ = …» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اینو یه جا ثبتش کن که فردا وقتی نوه‌م اومد، از روی همون براش…» | lla_coach | lla_coach | ✓ |
| p8 | rewrite (post-check) | «اینو یه جا ثبتش کن که فردا وقتی نوه‌م اومد، از روی همون براش…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «سلام. نوه‌م اومد. با همون راهِ «همه مرغ باشن» براش گفتم، خود…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «درسم این بود: وقتی حدس زدم و زیاد شد، نگاه کردم هر تغییرِ کو…» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- Register guard: for 60+ keep «شما» unless he asks for «تو».
- chat_solved should carry his unknown/data/condition and both methods.

## ایده‌ها
- A «puzzles for my grandchild» list with hints only (part: lists; person: teaching role).

RESULT: FAIL — 1 S2 (D2 part), 5 S3 (D6, D8, D9, D11, D12, D18).
