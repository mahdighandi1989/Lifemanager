# aB4 — آقای رحمانی، ۸۲ ساله، و معمای مرغ و خرگوش — ROUND 25 (runner B)

## خلاصه برای مالک
آقای رحمانی با حدس و اصلاحِ حدس به ۲۳ و ۱۲ رسید، از راهِ «همه مرغ باشند» دوباره به همان رسید و فردا آن را به نوه‌اش یاد داد. این بار «شما» از او گرفته نشد، «# مخاطب» درست گفت سن را خودش گفته، حدسِ «۲۰ مرغ و ۱۵ خرگوش» در پرونده «رد شد» و قولِ ساختگی ساخته نشد. ولی ثبتِ «حل شد» از گفت‌وگو فقط صورت را به فرم برد (مجهول، داده‌ها و دو روشِ او نه)، و نقشهٔ مسیر «نتیجه» و «بازنگری» را چند بار تکرار کرد.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] «# مخاطب» «(سالمند؛ از سنی که خودش گفت؛ تاریخِ تولد هنوز ثبت نشده)» (B24·D8 FIXED).
- [PASS] no forced «تو» (B24·D11 FIXED); p9/p11 elder rule asked «شما» (legit; new replies).
- [PASS] no promise block (B24·D9 FIXED); guess «رد شد» (B24·D14 FIXED); sys line «حل شد خورد؛ بازنگری هنوز نیست» (contradiction gone).
- [FAIL] chat_solved import: u1 only «one»; u/dl/c empty (B24·D2 aB4 part STILL, S3).
- [FAIL] route AFTER-LIVE/FINAL «نتیجه (از گفت‌وگو)» ×3, «بازنگری (از گفت‌وگو)» ×2 (B24·D18 STILL, S3).
- [PASS] routing 11/11.

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
82 said in words ⇒ «از سنی که خودش گفت» ✓ (D8 fixed); card ✓; «شما» kept, no forced «تو» ✓.

## Round-24 defects in this scenario
- D8: FIXED
- D9: FIXED
- D11: FIXED
- D14: FIXED
- D2 (aB4): STILL
- D18 (aB4): STILL (duplicates) / FIXED (sys line)
- D12 (aB4 p9–p10): CHANGED — asked on the grandchild's NEW result (fits)

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
| p8 | coaching (problem talk) | «سلام. نوه‌م اومد. با همون راهِ «همه مرغ باشن» براش گفتم، خود…» | lla_coach | lla_coach | ✓ |
| p9 | rewrite (post-check) | «سلام. نوه‌م اومد. با همون راهِ «همه مرغ باشن» براش گفتم، خود…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «درسم این بود: وقتی حدس زدم و زیاد شد، نگاه کردم هر تغییرِ کو…» | lla_coach | lla_coach | ✓ |
| p11 | rewrite (post-check) | «درسم این بود: وقتی حدس زدم و زیاد شد، نگاه کردم هر تغییرِ کو…» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B24·D2, D18 (S3)

RESULT: FAIL — 2 S3
