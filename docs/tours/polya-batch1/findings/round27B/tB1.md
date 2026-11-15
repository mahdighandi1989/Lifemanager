# tB1 — جعبه‌قرصِ هوشمند برای مادر — حلقهٔ قلمرو (بازوهای اصلی) — ROUND 27 (runner B)

## خلاصه برای مالک
زنی ایدهٔ جعبه‌قرصِ هوشمند را تا برنامه برد؛ گامِ «قبلاً کسی همینو ساخته؟» ابزاری در سامانه نداشت، پس برگهٔ #۱۰۱ ثبت شد و گام منتظر ماند. سه پاسخِ نامربوط، کنارگذاشته و کلی درست رد شد؛ پایگاهِ ثبتِ اختراع رسید، او «نه» گفت و بعد پس گرفت — و این دور پرونده هر سه رویداد را جدا نگه داشت. ولی وقتی حوزهٔ «بررسیِ بازار و رقیبان» آمد (فقط واژه‌های قالبی مشترک)، صفحه نه پرسید نه رد کرد: هیچ خطی، هیچ بازگشایی؛ «نه» ی بعدیِ او هم به جایی نرسید. برگه پس از پس‌گرفتنِ «نه» هم «باز» ماند.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p3 whole-first; measurable criterion; three sub-problems as known/unknown.
- [PASS] p3–p4 gap: differential diagnosis (two ruled-out areas), second opinion agrees, urgent sheet #101; «⏸ گامِ «(۳) …» منتظرِ برگهٔ #۱۰۱ ماند»; 🔭/🧭/📜 waiting row.
- [PASS] p5–p8 guess «فکر کنم کافیه» tested, refuted by her own 20 trials; «۱/۲۰ × ۱/۲۰ = ۱/۴۰۰» plan; stage «طرح ⇒ اجرا», never «بازنگری» with a waiting step (round 26 B26·D26/U11: «بازنگری»).
- [PASS] arm unrelated reply (+1 d): «⚠️ … جواب نداد — جواب هیچ نما یا حوزه‌ای … نام نبرد — زیرِ برگه نوشتم و دوباره باز شد».
- [PASS] arm ruled-out area (+1 d): «… آنچه آمد «خلاقیت و تفکرِ واگرا» است که خودِ برگه از اول کنار گذاشته بود …».
- [PASS] arm generic words (+1 d): ⚠️ mismatch, reopened.
- [FAIL] arm frame/view-name words only (+1 d, scratch page with the real area «بررسیِ بازار و رقیبان» + routine note naming it): no ask, no reject, no page note, no Today line; sheet stays «answered» (s17–s19); her p9 «نه، «بررسیِ بازار و رقیبان» به کارِ گامِ سوم نمیاد» changes nothing. C2/C20: a named candidate with only frame overlap ⇒ ask. Round 26 asked here. New B27·D16 (S2).
- [PASS] arm two new areas, unequal fit (+1 d): «🛎 ابزارِ لازم آمد: «جستجو در پایگاه‌های ثبتِ اختراع» … سنجیدم …» (patent-db over product-db).
- [PASS] p10 her «نه، این همون نیست» after arrival ⇒ «… «رسید» اعلام کرده بودم و نادرست بود — … دوباره باز شد؛ گام دوباره منتظر»; p11 take-back ⇒ «گفتی همان است؛ همان گام را از سر می‌گیریم».
- [PASS] post 📜 keeps every event in order: arrival · «پس گرفته شد — به گفتهٔ خودش همان نبود» · «↩ «نه» پس گرفته شد» · arrival · «از سر گرفته شد» (round 26 B26·D27/U58: first arrival lost).
- [FAIL] s24 after the take-back the sheet #101 status is still «open» although its last note says the step resumed. U59 STILL (S3).
- [PASS] p12 (+30 d) her result; look-back registered.
- [FAIL] p11 prompt: a context line «زمینه (نه پرسشِ دوم؛ پرسشِ این نوبت همان «پیش‌نیاز» است): پرسشِ صفحه برای پس از پیش‌نیاز …» while no prerequisite is open and the turn question is the territory ask — the label names the wrong turn question (strict scan flags it). New B27·D17 (S3).

## نقشهٔ نیاز
Parts: territory loop (FOR telling her honestly what each reply does for her waiting step) — met in six arms, silent in one; 📜 — met. Person: an inventor waiting on a missing tool needed to hear about every arrival — the market-scan arrival vanished.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
—

## Arms (RUNNER27 T1–T12) in this scenario
| arm | expected | got | verdict |
|---|---|---|---|
| unrelated reply | reject, reopen | ✓ | PASS |
| ruled-out area | reject naming the sheet's own ruling | ✓ | PASS |
| generic words | reject | ✓ | PASS |
| frame/view words only | ASK | silent, sheet «answered» | FAIL (B27·D16) |
| two areas unequal | best fit arrives | patent-db | PASS |
| «نه» after arrival | wait again, note, Today | ✓ | PASS |
| take-back of «نه» | restored with history | ✓ (📜 keeps both) | PASS; sheet stays open (U59) |

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Owner bank (this scenario)
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D26 / U11 (stage «بازنگری» with a waiting step): FIXED — p7–p8 «اجرا».
- B26·D27 / U58 (📜 loses the first arrival): FIXED.
- U59 (sheet stays open after take-back): STILL.
- B25·D1 (frame-word arm, round-25 S1 then fixed to ask in round 26): CHANGED — now silent (B27·D16).

## Routing (12/12 correct)
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
| p9 | coaching (problem talk) | «نه، «بررسیِ بازار و رقیبان» به کارِ گامِ سوم نمیاد؛ من می‌خو…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «نه، این همون نیست؛ فقط ثبتِ اختراع رو می‌گرده. من می‌خوام مح…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «ببخشید، اشتباهی گفتم نه؛ همون بود. با همون پایگاه‌های ثبتِ ا…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «خبرِ خوب: با همون پایگاه‌ها گشتم، چیزی که عیناً همین باشه ثب…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Every routine note under a waiting sheet gets exactly one visible outcome line (arrived / asked / rejected) — never silence.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D16 (S2, b, C2/C20) s17–s19, p9: a named area with only frame-word overlap is neither asked nor rejected; nothing shown; her «نه» lost.
- U59 STILL (S3, b) s24.
- B27·D17 (S3, b) p11: context line names «پیش‌نیاز» as the turn question with no prerequisite open.

RESULT: FAIL — 1 S2 + 2 S3
