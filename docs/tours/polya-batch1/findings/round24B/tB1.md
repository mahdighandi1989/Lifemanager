# tB1 — نسرین و جعبه‌قرصِ هوشمند · حلقهٔ قلمرو (ساخته شد ⇒ برگشت) — ROUND 24 (runner B)

## خلاصه برای مالک
نسرین ایدهٔ جعبه‌قرص را به برنامه تبدیل کرد. برای «پیشینهٔ اختراع» سامانه روشی نداشت؛ برگهٔ #۱۰۱ ثبت شد و آن گام «منتظر» علامت خورد — این بار در گفت‌وگو، صفحهٔ مسئله، نقشهٔ مسیر و پرونده. وقتی روتین با چیزی نامربوط جواب داد، صفحه نپذیرفت و برگه را دوباره باز کرد. وقتی حوزهٔ «جست‌وجوی پیشینهٔ اختراع» واقعاً ساخته شد، صفحه خودش فهمید، در «امروز» نوشت «🛎 ابزارِ لازم آمد» و همان گام را از سر گرفت؛ نسرین با آن روش گشت و تازگیِ ایده‌اش (وزنِ هر خانه) را یافت. ایرادها: کارِ گفت‌وگو هنگامِ ساختنِ مسئله به «۸ گامِ طرح»ِ ساختگی شکسته شد و صفحهٔ مسئله در «فهمِ مسئله» ماند. شاخهٔ دوم: وقتی گفت «خودم یه راه دیگه پیدا کردم»، علامتِ منتظر بسته شد.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] idea ⇒ known/unknown map; (1) by her test; (2) known method (reuse).
- [PASS] p3 gap with gap.step; second opinion; sheet #101; chat «⏸ … منتظرِ برگهٔ #۱۰۱» (B23·D7 FIXED); full territory list in prompt (B23·D16 FIXED).
- [PASS] p8 live_new on her request; marker on 🔭 (s11), 🧭 (s12), 📜 (post).
- [PASS] negative arm 1 (reply naming `mind`): mismatch, note under the sheet, sheet reopened, step waits.
- [PASS] positive arm (real registry area on a scratch copy + routine reply): arrived, Today «🛎 ابزارِ لازم آمد», p9 resume question, state resumed, step done, problem finished.
- [PASS] negative arm 2 (tB1x p8 «خودم یه راه دیگه پیدا کردم»): sys_done ⇒ state other, no resume.
- [FAIL] bogus plan steps from comma split; «کل در یک جمله» mis-import (B24·D3 S2); stage frozen + unknown re-asked p11 (B24·D2).
- [FAIL] dossier date of arrival, route order, `whole` counted as built, no line on sys_done (B24·D18, D19).
- [FAIL] refuted guess «آزموده نشده» (B24·D14).
- [PASS] routing 9/9 user turns (+1 auto follow-up lla_assistant; p4 internal second opinion).

## نقشهٔ نیاز
Parts: territory loop (FOR not losing a step that waits on the system and resuming it when built) — met end to end; 🔭/route import — poorly (D3, D2). Person (inventor): each sub-problem solved or honestly parked, told when it became possible — met.

## پیش‌نیاز
No prerequisite of hers; the missing method was booked as a system gap, not her weakness.

## آزمودنِ اصلاح
n/a

## سن
Card ⇒ 31 adult. Birth confirmation shows the ISO date (B24·D6).

## Round-23 defects in this scenario
D7 FIXED · D16 FIXED · D23 STILL

## Routing
### tB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه ایده دارم و می‌خوام از ایده برسم به یه برنامه‌ی واق…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «اگه ماهی بیشتر از یه بار هشدار اشتباه بده مادرم کلافه میشه، …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه
## خودِ سامانه (کاربرد، جا، آفلاین، مدل — پرسشِ «کجا نگهش…» | learning_architecture | lla_coach | ✗ |
| p5 | coaching (problem talk) | «ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ ت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ ی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «این جعبه‌قرص رو به‌عنوانِ مسئله‌ی خودم ثبت کن که مرحله‌هاش و…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «سلام. تو «امروز» دیدم نوشته ابزارِ لازم برای پیشینه اومده. ب…» | lla_coach | lla_coach | ✓ |
| p10 | automatic follow-up | «[سامانه: «🗺 قلمروِ سامانه‌ها» باز شد. حالا از روی همین گفت‌و…» | lla_assistant | lla_assistant | ✓ |
| p11 | coaching (problem talk) | «کارکرد در یک جمله: «جعبه‌قرصی که با وزن‌سنجیِ هر خانه می‌فهم…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «فرقش اینه که من هر خونه رو جدا وزن می‌کنم، پس می‌فهمم کدوم ق…» | lla_coach | lla_coach | ✓ |


### tB1x routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه ایده دارم و می‌خوام از ایده برسم به یه برنامه‌ی واق…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «اگه ماهی بیشتر از یه بار هشدار اشتباه بده مادرم کلافه میشه، …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه
## خودِ سامانه (کاربرد، جا، آفلاین، مدل — پرسشِ «کجا نگهش…» | learning_architecture | lla_coach | ✗ |
| p5 | coaching (problem talk) | «ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ ت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ ی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «راستش برای (۳) منتظر نموندم: خودم یه راه دیگه پیدا کردم — دی…» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- A dated «findings» record for prior-art results (the new area's last step has no place).
- On sys_done: a page line and a note under the sheet («دیگر لازم نیست برای این گام»).

## ایده‌ها
- When a built area is still stage 0, say so on arrival («تازه ساخته شده، هنوز آزموده نیست»).

RESULT: FAIL — 1 S2 (D3) + S2 class D2, 4 S3 (D14, D18, D19, D6).
