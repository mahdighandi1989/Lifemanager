# pwB1 — نگار و پمپِ خورشیدی — کارِ پیشینِ مهندسی با لغزشِ واحد (عمیق، چندروزه) — ROUND 25 (runner B)

## خلاصه برای مالک
نگار در پیامِ اول پنج گام حساب آورد: ۱ و ۴ درست، تبدیلِ کیلوژول به کیلووات‌ساعت غلط (۰٫۲۹ به‌جای ۰٫۰۸۲)، گامِ ۳ وابسته و گامِ ۵ بی معیارِ توانِ لحظه‌ای. سامانه گام‌ها را درست سنجید و از گامِ ۲ ادامه داد؛ او حکم را رد کرد، دوباره سنجیده شد و خودش اشتباه را پیدا کرد؛ بعد معیارِ گم‌شده را یافت و دو روز بعد با پمپِ ۱۲۰ واتی و پنلِ ۱۵۰ واتی حسابِ وارسی‌شده آورد؛ تنها گامِ باز، توانِ واقعیِ ظهرِ پنل، دقیق نام برده شد. ولی صفحه: پرسشِ نوبتِ اول را «حدس» خواند، در ردِ حکم گفت «توضیح نده، خودت فکر کن چرا»، هر گزارشِ تازه کلِ دفترِ «کارِ پیشین» را پاک کرد (در فرمِ مسئله فقط آخرین تکه ماند)، یک گامِ درست را «وابسته به گامِ نادرست» خواند، و در نقشهٔ مسیر یادداشتِ داخلیِ «عددِ درست را لو نده» را به خودِ او نشان داد.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 prior recognised: 5 steps — 1 ✓, 2 ✗ (unit), 3 ✗ dep 2, 4 ✓, 5 ✗ dep 3; resume 2; correct steps not re-asked.
- [FAIL] p1 page turn question = guess test «درست است/نه نگو … چطور می‌آزمایی‌اش؟» against the prior resume (B25·D2, S2).
- [FAIL] p1 page unit check passes the kJ⇒kWh slip as «حسابِ عددی‌اش … درست» (B25·D14); step 4 (✓) auto «وابسته به گامِ ۲» (B25·D7, S2); 🧭 tip/📜 show chkM «(… عددِ درست را لو نده)» (B25·D6, S2).
- [FAIL] p2 dispute ⇒ A073 «خودت فکر می‌کنی چرا؟ … توضیحِ آماده را نده» instead of re-check with evidence (B25·D3, S2); dispute recorded «حکم را رد کردی» ✓.
- [FAIL] p3–p8 each new prior report replaces the ledger; 🔭 «کارِ پیشینِ تو» shows only the last batch (s13, s21); «همهٔ گام‌های پیشینت درست درآمد» while step 5 still open (B25·D4, S2).
- [FAIL] p3 self-fix refused as correction; 📜 «اصلاح شد ⇐ … / صفحه نپذیرفت»; route back-jump for a refused retract (B25·D15, S3).
- [FAIL] p4 «مرحله: بازنگری» after a sub-result (B25·D9, S2); p5 RECALL22 «یادم رفته بود» drops the turn's story/prior (B25·D8, S2); p7 «# وضعِ کنونی» فهم vs live اجرا (B25·D20).
- [FAIL] mind card no credit for her correct prior steps (B25·D11, S2).
- [PASS] p6 live_new opened; stage chips «اجرا روی واقعیت (گفت‌وگو)» ✓; guess «۵۰ وات بسه» ⇒ «رد شد» ✓; card «۱۴ مهر ۱۳۷۴» ⇒ 1995-10-06 ✓; routing 8/8.
- [PASS] arrival: verified design (102 min, 48 × 6131 ≈ 294 kJ) + exact sticking point (real noon output vs 120 W).

## نقشهٔ نیاز
Parts: «کارِ پیشینِ تو» (FOR recognising how far she got, one verdict per step, resume at the first non-✓, never re-asking ✓, visible in forms/🧭/📜) — recognition met at p1, lost afterwards (ledger replaced, D4); turn question (FOR resuming at step 2) — not met at p1/p2 (D2, D3); page numeric/unit check (FOR guaranteeing numbers and units) — missed the unit slip, mislabeled, leaked chkM (D14, D6, D7). Person (engineer about to spend money): needed the slip found with evidence, her correct work credited, the missing criterion surfaced without being told the answer, and a verified design — met in chat, poorly on the page.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
Her self-fix of a judged step (0.29⇒0.082) is refused as a retract (no «اشتباه گفتم»); prior step never marked «fixed» (D15).

## سن
31, card «۱۴ مهر ۱۳۷۴» ⇒ 1995-10-06 ✓.

## کارِ پیشینِ تو — حکم‌ها (R8)
| step (her words) | truth | page verdict (p1) | later | note |
|---|---|---|---|---|
| ۱ «۲ متر مکعب = ۲۰۰۰ کیلوگرم» | ✓ | ✓ | lost from ledger at p3 | never re-asked ✓ |
| ۲ «… = 294300 ژول = ۲۹۴٫۳ کیلوژول، یعنی حدودِ ۰٫۲۹ کیلووات‌ساعت» | ✗ unit (kJ⇒kWh ÷3600) | ✗ (model); page numeric check «درست» | p2 she disputes ⇒ «حکم را رد کردی — دوباره سنجیده می‌شود»; p3 she fixes (0.082) — old step never «fixed» | resume point ✓ |
| ۳ «۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹» | ✗ dependent | ✗ · «وابسته به گامِ ۲» ✓ (+ rounding flag 0.58) | fixed p3 (0.164) | |
| ۴ «P = 294300 ÷ 1200 = 245 … ۴۹۰ وات» | ✓ independent | ✓ but «وابسته به گامِ ۲» (wrong dep, D7) | | |
| ۵ «۰٫۵۹ ÷ ۴٫۵ = ۱۳۱ وات؛ … ۱۵۰ واتی کافیه» | ✗ dep + missing criterion | ✗ · «وابسته به گامِ ۳» ✓ | p4 «۳۶ وات» ⚠️ ناقص; p5 she finds instantaneous power (dropped by RECALL22, D8) | |
Forms/🧭/📜 shots: after first message s3 (prior eval), s4.png (🧭 AFTER-FIRST), s5.png (📜 session); after live s13/s14.png (🔭 shows ONE step); end s20/s21.png (🔭 four day-2 steps), s22 (🧭 FINAL), part_dossier_1.png (all batches in order).
Reached: verified design (۱۲۰ W pump, ۱۵۰ W panel, ~۱۰۲ min, energy check) + exact sticking point (real noon output vs 120 W).

## Round-24 defects in this scenario
- (new scenario)

## Routing
### pwB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من نگارم، مهندس تأسیساتم. برای باغِ پدرم تو روستا می‌خ…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «نه، گامِ ۲ درسته. کیلو یعنی هزار؛ ۲۹۴٫۳ کیلوژول میشه ۰٫۲۹ کی…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «آهان، کیلووات‌ساعت یعنی ۱۰۰۰ وات ضربدر ۳۶۰۰ ثانیه. پس 294300…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «پس پنل: ۰٫۱۶۴ ÷ ۴٫۵ = ۰٫۰۳۶ کیلووات، یعنی ۳۶ وات! پس حتی یه …» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «آخ… پمپ موقعِ کار ۴۹۰ وات می‌کشه ولی پنلِ ۵۰ واتی ظهر نهایتا…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «اینو به‌عنوانِ مسئله‌ی خودم ثبت کن که بعد از حرف زدن با فروش…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «سلام، با فروشنده حرف زدم: پمپِ ۱۲ ولتِ ۱۲۰ واتی دارن و پنلِ …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «درسم: واحد رو تا آخر با خودم ببرم و کنارِ انرژی، توانِ لحظه‌…» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- Prior ledger as ONE record per problem with step history (fixed/was/at), merged by quote, never replaced; dependency by quantity, not by number match.
- Unit/dimension check for common conversions (kJ⇄kWh, mm⇄m, m³⇄L) in arithChk; rounding-aware comparison.
- A dispute path: «re-check with evidence» turn question + the page's own computed evidence for numeric steps.

## ایده‌ها
- «اگر حکمِ یک گام را قبول نکنم، شاهد را خودِ صفحه حساب می‌کند؟» (page-computed evidence on dispute).

## Defects (catalogue round25B/defects.md)
- B25·D2, D3, D4, D6, D7, D8, D9, D11 (S2)
- B25·D14, D15, D20, D25 (S3)

RESULT: FAIL — 8 S2 + 4 S3
