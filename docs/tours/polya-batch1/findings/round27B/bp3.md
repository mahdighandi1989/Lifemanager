# bp3 — نردبان و سه پیش‌نیازِ تودرتو (۱۴ ساله) — ROUND 27 (runner B)

## خلاصه برای مالک
نوجوانی ارتفاعِ نردبان و مساحتِ مثلث را می‌خواست و سه چیز را نمی‌دانست: قضیهٔ فیثاغورس، جذر (پیش‌نیازِ آن) و مساحتِ مثلث. سامانه هر سه را به ترتیبِ گیر پیدا کرد، تودرتو یاد داد، هر بار وارسیِ تسلط گرفت و دقیق به همان جای مسئله برگشت؛ او جواب را با کاغذِ شطرنجی وارسی کرد و روزِ بعد برگهٔ سفید را از حافظه نوشت. عنوانِ نشستِ روزِ دوم دیگر «سلام!…» نیست. تنها ایراد: جملهٔ «این کم‌هوشی نیست» پیش‌نیازِ دیگری را نام برد، نه همان که او درباره‌اش احساسِ خنگی کرده بود.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p3 «۵ منهای ۳» intuition handled; stuck named (no theorem), no ability blame.
- [PASS] p4–p9 nested prerequisites: Pythagoras → square root (nested) → back; triangle area; each with diagnostic («۱۶ خونه‌ای ضلعش چنده؟»), mastery check, exact return (s-lines «🧩 … آموخته شد (پیشرفت، نه ضعف) — برگشت به …»).
- [PASS] arithmetic: «۹×۹ = ۸۱» ✓, «۱۲×۱۲ = ۱۴۴» ✓, «۸۱ + ۱۴۴ = ۲۲۵» ✓, «۱۶ / ۲ = ۸» ✓ (arithmetic right, concept wrong — the coach handled the concept), «۶ × ۶ = ۳۶» ✓, «۱۵ × ۱۵ = ۲۲۵» ✓, «۵ × ۵ = ۲۵» ✓, «۲۵ − ۹ = ۱۶» ✓, «۱۲ / ۲ = ۶» ✓.
- [PASS] p10–p13 solved, check on grid paper, registered + «حل شد», look-back items booked, practice case «تمرین بازیابی فعال — فیثاغورس، جذر و مساحتِ مثلث» from her consent.
- [PASS] p14 (+1 d) blank-sheet recall 2 of 3 (√81 = 8 ⇒ she corrected to 9) booked as a session, next due «۶–۷ آبان»; breadcrumb «نردبان و دیوار» (round 26 «سلام! امروز برگه‌ی سفید…» = B26·D9).
- [FAIL] p13/s-line «🧩 این کم‌هوشی نیست: گیر از نبودنِ «مساحتِ مثلث …» بود» — her «فکر می‌کردم شاید خنگم» was about not knowing the theorem («اینکه اسم قضیه رو همون اول گفتی خیلی کمک کرد؛ قبلش فکر می‌کردم شاید خنگم»), so the line names the wrong prerequisite. B26·D12 instance (S3).

## نقشهٔ نیاز
Parts: prerequisite stack (FOR nested detours with exact return) — met; practice case (FOR spaced recall) — met; self-label answer (FOR naming the real cause of HER feeling) — names the wrong gap. Person: a teen who felt dumb needed the gap she felt named — partly met.

## پیش‌نیاز
Three prerequisites, one nested (√ under Pythagoras), ordered by what blocked first; each diagnosed, taught to the step, checked; exact return each time; solved. Met.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
14 (birth ۵ بهمن ۱۳۹۰ via card ⇒ 14); «تو».

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D9 / U29 (greeting kept as session title): FIXED — breadcrumb «نردبان و دیوار» (s28).
- B26·D12 / U67 family («کم‌هوشی نیست» names another prerequisite): STILL here (bp3 instance; booked by compensation (b)).

## Routing (14/14 correct)
### bp3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام! یه سؤال از کتاب: «نردبانی به طول ۵ متر به دیوار تکیه د…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه نردبون کج به دیوار تکیه داده، می‌خوایم بدونیم سرش تا کجای…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «نمی‌دونم... شاید چون نردبون کجه؟ اگه صاف بود ۵ میشد. ولی کج …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «اسمشو شنیدم ولی نمی‌دونم چی میگه. یه چیزی با مربع ضلع‌ها بود…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «۹×۹ = ۸۱، ۱۲×۱۲ = ۱۴۴، جمعشون ۲۲۵. پس وتر ۲۲۵ متره؟ یه کم زی…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «۸؟ چون ۱۶ تقسیم بر ۲ میشه ۸.…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «۶! چون ۶ × ۶ میشه ۳۶. پس جذر ۳۶ میشه ۶.…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «۲۲۵ بود، جذرش... ۱۵ × ۱۵ = ۲۲۵. پس وتر ۱۵!…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «۵ × ۵ = ۲۵، ۳ × ۳ = ۹. دیوار یکی از اون دو ضلعه، پس ۲۵ منهای…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «کشیدم. قطر مستطیل رو دقیقاً نصف می‌کنه! پس مثلث نصف مستطیله:…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «روی کاغذ شطرنجی یه مثلث ۳ و ۴ کشیدم و ضلع کجش رو با خط‌کش ان…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «همون پرسش تشخیصی که گفتی مربعِ ۱۶ خونه‌ای ضلعش چنده؛ اونجا ف…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «شمردن خونه‌ها و ساختن مساحت از مستطیل رو دوست داشتم. اینکه ا…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت …» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- The self-label line should quote her own reason clause and pick the prerequisite it points to; if unclear, name all three.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B26·D12 instance (S3, b) p13: self-label line names «مساحتِ مثلث» while her feeling was about the theorem.

RESULT: FAIL — 1 S3
