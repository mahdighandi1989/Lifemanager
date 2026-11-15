# tB1y — جعبه‌قرص — یک واژهٔ مشترک و تساویِ واقعیِ دو ابزار (T1) — ROUND 27 (runner B)

## خلاصه برای مالک
همان مخترع: اول حوزهٔ «تاریخِ فناوری و پیشینهٔ ابزارها» آمد که فقط یک واژه با گامش مشترک داشت؛ صفحه پرسید و او گفت «نه». بعد دو حوزهٔ هم‌امتیاز آمد (بانکِ ثبت‌های اختراعِ ایران و جهانی). صفحه این بار هم در گفت‌وگو و هم در «امروز» هر دو را با نام پرسید، او «دومی» را گفت و همان جواب پذیرفته شد و گام از سر گرفته شد؛ ردیفِ «امروز» هم دکمهٔ «✓ همان است / ✗ همان نیست» دارد و پرونده همهٔ پرسش‌ها و جواب‌ها را نگه داشت.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p8 preamble as tB1.
- [PASS] arm single shared word (+1 d, scratch page «تاریخِ فناوری و پیشینهٔ ابزارها»): «❓ برگهٔ #۱۰۱ جواب گرفت … مطمئن نیستم همان … — پیش از ادامه از تو می‌پرسم؛ تا آن وقت گام منتظر می‌ماند»; Today «❓ …» row; the 🔭 waiting row now carries «✓ همان است / ✗ همان نیست» buttons (round 26 B26·D28/U61: no control).
- [PASS] p9 her «نه، این که تاریخِ ابزارهاست …» ⇒ «⚠️ … جواب نداد (گفتی همان نیست) — زیرِ برگه نوشتم و دوباره باز شد»; Today «⏸ … دوباره منتظرِ برگهٔ #۱۰۱ است — «…» همان نبود».
- [PASS] T1 (added, +1 d; scratch page with two equal areas «بانکِ ثبت‌های اختراعِ ایران» / «… جهانی» + routine note naming both): chat «❓ … «بانکِ ثبت‌های اختراعِ ایران» (هم‌امتیاز با «بانکِ ثبت‌های اختراعِ جهانی» آمد …). میانِ این‌ها برنمی‌گزینم — نامِ همان را … بگو (یا «هیچ‌کدام»)»; Today «❓ … «… ایران» یا «… جهانی» — کدام همان ابزارِ گامِ … است؟» — both named in chat AND Today, no arrival declared in the same pass (round 26 Bx D28: Today named one).
- [PASS] T1 p10 her «دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه …» ⇒ «🛎 ابزارِ لازم آمد: «بانکِ ثبت‌های اختراعِ جهانی» (برگهٔ #۱۰۱) — گفتی همان است؛ همان گام را از سر می‌گیریم» — no second ask, no reject line for the other (C20; round 26 Bx D27: second ask).
- [PASS] post 📜: both ❓ asks with «سرانجام: جواب: همان نیست / همان است — «… جهانی»», the ⚠️ reopen, and the arrival — every event kept (round 26 Bx D29: only the latest ask).
- [FAIL] p9–p10 prompt: a context line «زمینه (نه پرسشِ دوم؛ پرسشِ این نوبت همان «پیش‌نیاز» است): پرسشِ صفحه برای پس از پیش‌نیاز …» while no prerequisite is open and the turn question is the territory ask — the label names the wrong turn question (strict scan flags it). New B27·D17 (S3).

## نقشهٔ نیاز
Parts: territory loop (FOR asking when unsure and taking her naming as the answer) — met; Today (FOR answering where she sees the question) — met. Person: an inventor choosing between two near-identical tools needed to be asked, not decided for — met.

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
| single shared word | ask | ask + Today buttons | PASS |
| her «نه» to the ask | reject, reopen, Today | ✓ | PASS |
| T1 real tie | ask naming both (chat + Today); naming one = answer | ✓ | PASS |

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Owner bank (this scenario)
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D28 / U61 (Today ❓ opens a row with no answer control): FIXED.
- U62 (Bx tie: second ask; Today names one; 📜 keeps only the last ask): FIXED.

## Routing (10/10 correct)
### tB1y routing
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
| p9 | coaching (problem talk) | «نه، این که تاریخِ ابزارهاست. من می‌خوام بدونم همین الان کسی …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه که برای گامِ سوم…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: ## tB1y/ai/p10.json
   STRAY[# مسئلهٔ زندهٔ این سشن (pb_l_m] - زمینه (نه پرسشِ دوم؛ پرسشِ این نوبت همان «پیش‌نیاز» است): پرسشِ صفحه برای پس از پیش‌نیاز (برای وضعِ همین نوبت؛ کارتِ صفحه پرسشِ دیگری نشان می‌دهد — این را (در همان یک پرسشِ این پاسخ) جویا شو، نه آن

## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D17 (S3, b) p9–p10: context line names «پیش‌نیاز» as the turn question with no prerequisite open.

RESULT: FAIL — 1 S3
