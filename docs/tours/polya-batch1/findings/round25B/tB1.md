# tB1 — نسرین و جعبه‌قرصِ هوشمند — حلقهٔ قلمرو (بازوهای منفی و «ابزارِ نامربوط») — ROUND 25 (runner B)

## خلاصه برای مالک
نسرین ایدهٔ جعبه‌قرص را به برنامه تبدیل کرد و گامِ «پیشینهٔ اختراع» منتظرِ برگهٔ #۱۰۱ ماند. سه پاسخِ نادرستِ روتین (نمای کارنامه، حوزه‌ای که تشخیص کنار گذاشته بود، و جوابِ پر از واژه‌های عام) درست رد شدند و برگه دوباره باز شد. ولی وقتی یک حوزهٔ نامربوط («بررسیِ بازار و رقیبان») ساخته شد، صفحه بی پرسیدن نوشت «ابزارِ لازم آمد … سنجیدم که نیازِ گام را جواب می‌دهد» — فقط به خاطرِ دو واژهٔ «ایده» و «جایگاه». وقتی نسرین گفت «این به کارِ گامِ سوم نمیاد»، صفحه گام را «از سر گرفته‌شده» ثبت کرد و برگه را باز نکرد؛ گامِ منتظرش گم شد.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p3 gap with gap.step + why_not by id ⇒ entry.ruled=[pr_hypothesis_testing, pr_creativity, …]; waiting marker in chat/🔭/🧭 (WAIT)/📜.
- [PASS] ARM 1 (+1 d, reply names `mind`): mismatch, built list «🧠 کارنامهٔ ذهن» only (no `whole`; B24·D19 part FIXED), note, reopened, waits (s14).
- [PASS] ARM 2a (+2 d, reply names the RULED-OUT pr_hypothesis_testing with need-words): «(تشخیصِ افتراقیِ برگه همین را کنار گذاشته بود)», reopened, not resumed (s15).
- [PASS] ARM 2b (+3 d, generic words «ابزارِ تازه … مسئله‌ها … تغییر» + `practice`): mismatch, reopened (s16).
- [FAIL] ARM unclear (+4 d, scratch page, one new area pr_market_scan): declared ARRIVED on «ایده»، «جایگاه» (view name «💡 جایگاهِ ایده» in the sheet's «چه کم است» + title word), no ask; Today «🛎 ابزارِ لازم آمد … همان گام را از سر بگیر» (s17; B25·D1, S1).
- [FAIL] p9 page turn question pushes the unfit tool «همان گام را با آن چطور برمی‌داری؟»; her rejection + sys_fit false ⇒ state resumed, sheet stays answered, no note, Today line gone; 📜 «↩ گامِ «(۳)…» از سر گرفته شد — با ابزارِ «بررسیِ بازار و رقیبان»» (s19; B25·D1, S1).
- [FAIL] chat ⚠️ mismatch lines identical, no reason for her (B25·D18, S3); 📜 two «⏸ منتظرِ برگهٔ #۱۰۱» rows («رسید» / «منتظر») (B25·D19, S3).
- [PASS] routing 8/8 user turns (+ internal second opinion).

## نقشهٔ نیاز
Parts: territory loop (FOR not losing a step that waits on the system; noticing a build; checking it answers THAT step; asking her when unclear) — three negative arms met; the unclear build was declared arrived and her rejection was ignored (D1, S1). Person: needed honesty about what was built and her step kept waiting until a fitting tool came — not met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
Adult; birth confirmation now one line, Jalali only (B24·D6 fixed).

## Territory arms (R1) — tB1 / tB1y / tB1z / tB1x
| arm | how simulated | expected | page | verdict |
|---|---|---|---|---|
| unrelated reply | routine note on #101 naming `mind` (+1 d) | mismatch, reopen, wait | mismatch, note, reopen, wait (tB1 s14) | PASS |
| (a) ruled-out area | note naming `pr_hypothesis_testing` (in why_not) with need words (+2 d) | not resumed | «تشخیصِ افتراقیِ برگه همین را کنار گذاشته بود», reopen (s15) | PASS |
| (b) generic words | «ابزارِ تازه … مسئله‌ها … تغییر» + `practice` (+3 d) | not resumed | mismatch, reopen (s16) | PASS |
| unclear ⇒ ask | scratch page + `pr_market_scan` («بررسیِ بازار و رقیبان») (+4 d) | ask her | ARRIVED on «ایده»، «جایگاه»; resumed; her «نه» ignored (s17–s19) | FAIL (S1) |
| unclear ⇒ ask (tB1y) | scratch page + `pr_tech_history` (only «پیشینه») | ask her | ask ✓; «نه» ⇒ rejected, reopen ✓ (+ simultaneous mismatch line) | PASS (S3) |
| positive, 3 new areas (tB1z) | scratch page + market, claims, prior_art; reply names claims first | best fit wins, resume | prior_art arrived, Today 🛎, resumed, step done | PASS |
| sys_done (tB1x) | «خودم یه راه دیگه پیدا کردم» | state other, line + sheet note | ✓ | PASS |
| system-self sheet (oB1 #102–#104) | local model / book / reports | no waiting step | none marked | PASS |

## Round-24 defects in this scenario
- D19 (whole in built list): FIXED
- D3: FIXED (no comma-split plan points; see tB1z)
- D18 (tB1 dossier dates): CHANGED — artefact of my harness restart only (class d), duplicates remain (B25·D19)
- D12 (tB1 p9 label «همان «پیش‌نیاز»»): STILL (tB1z p9)

## Routing
### tB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه ایده دارم و می‌خوام از ایده برسم به یه برنامه‌ی واق…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «اگه ماهی بیشتر از یه بار هشدار اشتباه بده مادرم کلافه میشه، …» | lla_coach | lla_coach | ✓ |
| p4 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p5 | coaching (problem talk) | «ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ ت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ ی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «این جعبه‌قرص رو به‌عنوانِ مسئله‌ی خودم ثبت کن که مرحله‌هاش و…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «سلام. تو «امروز» نوشته ابزارِ لازم اومد، ولی «بررسیِ بازار و…» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- Match on step/need words only; exclude words from the sheet's own scaffolding (view names like «💡 جایگاهِ ایده») and generic «ایده».
- After an arrival, a «همان نیست» from her (sys_fit false) must reopen the sheet and re-mark the step waiting.
- A dated «یافته‌های پیشینه» record (still open from round 24).

## ایده‌ها
- «اگر ابزاری که آمد به کارم نیامد، از کجا بفهمم دوباره منتظر است؟»

## Defects (catalogue round25B/defects.md)
- B25·D1 (S1)
- B25·D18, D19 (S3)

RESULT: FAIL — 1 S1 + 2 S3
