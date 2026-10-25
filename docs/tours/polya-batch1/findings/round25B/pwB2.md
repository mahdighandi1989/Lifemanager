# pwB2 — مهدی و پیشنهادِ کار در شیراز — کارِ پیشینِ تصمیم با معیارِ جاافتاده (چندروزه) — ROUND 25 (runner B)

## خلاصه برای مالک
مهدی جدولِ تصمیمش را آورد: معیارِ «مراقبت از مادر» را که خودش در همان پیام گفته بود جا انداخته بود و وزن‌هایش ۱۱۰٪ می‌شد. سامانه هر دو را با دلیل گفت؛ او اول قبول نکرد («مادرم معیار نیست»)، حکم با دلیل نگه داشته شد، بعد خودش وزن‌ها را درست کرد، معیار را افزود، دید اختلاف تقریباً صفر شد، با همسر و مادرش حرف زد و سه روز بعد با وارسیِ حساسیت تصمیمی مشروط گرفت؛ گامِ باز (آزمونِ مادر) دقیق نام برده شد. ولی صفحه جمع‌های درستِ او را سه بار «حسابش نمی‌خواند» اعلام کرد (زنجیرهٔ «=» را بد خواند)، در پرسشِ پایانی به او گفت «گامِ ۱ جای درنگ است»، و ردِ بی‌«نه» ِ او را ثبت نکرد.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 prior: criteria ⚠️ (mother missing), weights ✗ (110%), scores ؟, sum ✗ dep, conclusion ✗ dep; resume 1.
- [FAIL] p1 guess-test turn question vs prior resume (B25·D2, S2); p2 «… چرا میگی…؟» ⇒ A073 (B25·D3) and the dispute not registered (no leading «نه») (B25·D3, S3 part).
- [FAIL] p1/p4/p7 chained «a×b + … = 3.6 + … = 8.7» misparsed ⇒ correct sums flagged «نمی‌خواند» and forced ✗; final resume «گامِ ۱ … جای درنگ است» on a correct check (B25·D5, S2).
- [FAIL] ledger replaced each turn; 🔭 shows the last 2–3 steps only (B25·D4, S2); p3 retract accepted but «چیزی در صفحه ثبت نشده بود» though the ledger held it (B25·D15, S3).
- [FAIL] his sums imported as «داده: شیراز = … = ۷٫۷» (B25·D24, S3); mind no prior credit (B25·D11, S2).
- [PASS] p5 live_new; plan pl1 ⇒ plan_done ✓; card «1361/7/22» ⇒ 1982-10-14 ✓; routing 7/7.
- [PASS] arrival: conditional decision checked by sensitivity (7.5 vs 6.6) + sticking point (mother's trial).

## نقشهٔ نیاز
Parts: prior ledger, arithmetic check, dispute path — see criteria (D4, D5, D3). Person (father deciding a move): needed the missing criterion named from his own words without moralising, the 110% caught, his own correct sums trusted, and the decision left to him with the sticking point clear — met in chat; the page told him three times his correct arithmetic was wrong (D5).

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
«وزن‌ها هم جمعشون ۱۱۰ بود، درستش می‌کنم» accepted, but «چیزی در صفحه ثبت نشده بود» while the prior ledger held it (D15).

## سن
44, card «1361/7/22» ⇒ 1982-10-14 ✓.

## کارِ پیشینِ تو — حکم‌ها (R8)
| step | truth | page verdict (p1) | later |
|---|---|---|---|
| ۱ معیارها (بی «مادر») | incomplete — missing criterion he named himself | ⚠️ ناقص ✓ (resume) | p2 dispute «مادرم معیار نیست» not registered (no leading «نه»); p3 he adds it |
| ۲ وزن‌ها ۴۰/۳۰/۲۵/۱۵ | ✗ sum 110% | ✗ (model; page did not check the sum) | p3 fixed 30/20/20/10/20 ✓ |
| ۳ نمره‌ها | unchecked (his values) | ؟ نسنجیده ✓ | |
| ۴ جمعِ وزنی ۸٫۷ / ۶٫۰۵ | arithmetic ✓, basis ✗ | ✗ dep ✓, but chk «حسابِ «۰.۴ * ۹ + …» با «۳.۶» نمی‌خواند؛ «۲.۴ + ۱.۵ + ۱.۲» با «۸.۷» نمی‌خواند» (D5) | p4 6.7/6.3 and p7 7.5/6.6 also flagged ✗ |
| ۵ «پس شیراز» | ✗ dependent | ✗ dep 2,4 | conditional decision p7 |
Shots: s3 (prior), s4 (🧭 AFTER-FIRST), s5 (📜 session), s11/s12.png (🔭: last batch only), s18/s19.png, s20 (🧭 FINAL), part_dossier_1.png.
Reached: conditional decision with sensitivity check + sticking point (mother's trial).

## Round-24 defects in this scenario
- (new scenario)

## Routing
### pwB2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه تصمیمِ بزرگ دارم و خودم تا یه جایی جلو رفتم، می‌خوا…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «مادرم معیار نیست، اون یه موضوعِ جداست؛ تصمیمِ کاری رو با عدد…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «راست میگی، اگه برم کی بهش سر بزنه… قبول. وزن‌ها هم جمعشون ۱۱…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «شیراز = ۰٫۳×۹ + ۰٫۲×۸ + ۰٫۲×۶ + ۰٫۱×۸ + ۰٫۲×۲ = ۲٫۷ + ۱٫۶ + …» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «اینو مسئله‌ی خودم ثبت کن؛ امشب با خانمم و فردا با مادرم حرف …» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «سلام، برگشتم. با خانمم حرف زدم، گفت اگه مادرم بیاد شیراز مشک…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «وارسی کردم: اگه وزنِ مادر رو حتی ۳۰ بگیرم و از حقوق کم کنم، …» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- Chained-equality parser in arithChk (split «=» chains left to right).
- Dispute detection by meaning (model reports `coach_state.prior_dispute`), not only a leading «نه».

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B25·D2, D3, D4, D5, D11 (S2)
- B25·D15, D24 (S3)

RESULT: FAIL — 5 S2 + 2 S3
