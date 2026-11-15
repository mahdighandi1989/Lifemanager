# tB1x — جعبه‌قرص — «خودم یه راه دیگه پیدا کردم» (بازوی sys_done) — ROUND 27 (runner B)

## خلاصه برای مالک
همان مخترع، این بار منتظرِ ابزار نماند و گامِ «پیشینهٔ اختراع» را با پرسیدن از یک کارشناس خودش برداشت. صفحه گام را «از راهِ دیگری برداشته شد» کرد، برای روتین یادداشت گذاشت و برگه را برای دیگران نگه داشت؛ یک روز بعد که ابزارِ «جستجوی پیشینهٔ اختراع» واقعاً ساخته شد، صفحه به‌درستی چیزی را «از سر» نگرفت.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p8 preamble as tB1 (sheet #101, step waiting).
- [PASS] p9 (+2 d) «خودم یه راه دیگه پیدا کردم … پس اون گام رو خودم برداشتم» ⇒ «✓ گامِ «(۳) …» از راهِ دیگری برداشته شد — دیگر منتظرِ برگهٔ #۱۰۱ نیست؛ زیرِ برگه برای روتینِ مسئول نوشتم (برگه برای کاربرانِ دیگر سرِ جایش می‌ماند)»; entry state «other»; sheet note «… هنوز لازم است؟».
- [PASS] arm «the build arrives after that» (+1 d; scratch page with the real area «جستجوی پیشینهٔ اختراع» + routine note): entry stays «other»; no «🛎 ابزارِ لازم آمد», no «از سر بگیر» in chat or Today.

## نقشهٔ نیاز
Parts: territory loop (FOR releasing a step she took herself and not nagging later) — met. Person: an inventor who moved on needed the page to follow her — met.

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
| sys_done (her own way) | step released, routine told, sheet stays | ✓ | PASS |
| build arrives after sys_done | silent | silent | PASS |

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Owner bank (this scenario)
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- (round 26 PASS; unchanged)

## Routing (9/9 correct)
### tB1x routing
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
| p9 | coaching (problem talk) | «راستش منتظر نموندم. خودم یه راه دیگه پیدا کردم: رفتم از یه ک…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- (none)

RESULT: PASS
