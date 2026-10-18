# bp3 — سارا و نردبان (چند پیش‌نیاز، تودرتو) — ROUND 22 (runner B)

## خلاصه برای مالک
سارا (۱۴ ساله) ارتفاعِ نردبانِ ۵ متری را «۵ منهای ۳» گفته بود و مساحتِ مثلث را «۳ × ۴». سه پیش‌نیاز نداشت: قضیهٔ فیثاغورس (آن جلسه غایب بود)، و درونِ آن جذر (فرقِ مربع و ضلعش)، و مساحتِ مثلث (نصفِ قاعده × ارتفاع). صفحه هیچ‌کدام را به‌عنوانِ پیش‌نیاز نشناخت؛ دو بار اسمِ قضیه را خواست و صفحه طبقِ قاعده‌اش نگفت تا کلافه شد و سرانجام پس از پنج پیام «ایدهٔ کلیدی» را شنید. بعد خودش جذر را از مربعِ ۱۶ خانه‌ای و مساحت را از نصفِ مستطیل ساخت، هر دو جواب با کتاب خواند و نردبانِ ۱۰ متری را بی‌کمک حل کرد. پروندهٔ تمرینی که از گفت‌وگو خواست باز شد و جلسهٔ روزِ بعدش ثبت شد. ولی کارنامه هر سه گیر را «شکستِ فهم» ثبت کرد؛ نقشهٔ پیش‌نیازها هرگز پیدا نشد؛ و «🧭 نقشهٔ مسیرِ مسئله» که جای او را در مسیر و انحراف‌ها نشان دهد هنوز ساخته نشده است.

## Run setup
Build main b70c1fe8 (round-21 fixes; + docs f5d855d9), `build.py --check` in sync, dist 10:23 after the merge. Replay of round21B/<sid>/ctl with harness5.js and the round-21 driver (round22B/tools/drv.py) that matches each AI call to its round-21 twin by her turn text; round-21 replies reused only where the round-22 prompt asked nothing new; NEW replies written as the literal average model wherever round 22 required (rewrite requests, correction result blocks, start_practice / practice_log, running lists, prerequisite scenarios, new trials). Every run ends with {"exit":true} (view_pre_* / view_post_* of mind card, maps, Today). After exit tools/post21.js reopened the profile at the final simulated day and shot full-page: part_dossier_<n>.png (part_dossier_sess_<n>.png for conversations without a live problem), part_tunnel_<n>.png, part_allwork_1.png, part_mind_1.png («از کجا؟» open), part_practice_1.png; text in post.txt. Mid-run shots are out/s<N>.png (+ s<N>_page.png for page actions); record dumps are the eval of the inserted «dump» steps (out/s<N>.json). Clock: the page's own Date shift (inject.js __adv; days counted by tools/advsum.py). Throw-away profiles, deleted at the end; no records seeded outside the UI/assistant. Defect ids: round22B/CATALOGUE.md.

## Criteria (written criteria + round-22 requirements)
- [PASS] She reached both results (height 4 m, area 6 m²) and transferred to a new case (10 m / 6 m ⇒ 8 m, 24 m²) unaided; chat_solved with lesson, check, best question and taste.
- [FAIL] §16 several prerequisites: none detected or ordered by the page (Pythagoras blocks first; square root nested inside it; triangle area for the second unknown); the theorem name withheld twice by the style rule until the end-of-ladder (5 messages, frustration «کلافه»); no page diagnostic or mastery re-check (B22·D6).
- [FAIL] Place in the main problem lost: after the first unknown the phase/turn question moved to «بازنگری» while the area was still open (p7) (B22·D12); «🧭 نقشهٔ مسیرِ مسئله» absent (B22·D7).
- [FAIL] Mind card: «فهمِ مسئله ۱ از ۴» (three prerequisite stucks booked as understanding failures), plan 0/1, «طرح‌ریزی» named weakest; no cause, later learning not progress (B22·D6).
- [PASS] PRACTICE FROM CHAT (3rd scenario): «می‌خوام یه جا داشته باشم که بعداً تمرینشون کنم» ⇒ T41 case «فیثاغورس، جذر و مساحتِ مثلث»; day-2 chat report ⇒ practice_log «✓ جلسهٔ ۲۷ مهر … · موعدِ بعد … روزِ ۳ (چرخه روز ۱، ۳ و ۷)».
- [FAIL] Her practice report taken as «مسئلهٔ گفت‌وگو» in the practice block, and «# اصلاحِ پیامِ پیشین (شاید)» fired on «غلطه» about her recall (B22·D17, B22·D14).
- [PASS] Routing 12/12.

## نقشهٔ نیاز
**Parts:** coach — guess-testing and end-of-ladder met; prerequisite diagnosis not; place-keeping across two unknowns not. 🧩 map — never steps in. 🧭 route map — missing. Practice — met. Mind — misattributes.
**Person:** a 14-year-old who missed a lesson needed to hear «this is the theorem you missed; here is what it says; now use it» at the first sign, then the root and the area just as far as needed, and to see where she was in the problem; instead she was refused the name twice and felt stupid-adjacent («داشتم کلافه می‌شدم»).

## پیش‌نیاز
Missing prerequisites (order by what blocks this solve): (1) Pythagoras a²+b²=c² — height step; (1a, nested) square vs side / square root (√16=4) — inside step 1; (2) triangle area = ½·base·height — second unknown. Detected by the page: none. Named: (1) only at end-of-ladder by the model; (1a) confirmed by the model when she asked «جذر یعنی همین؟»; (2) discovered by her through the rectangle hint. Ordered: not by the page. Taught to needed depth: yes (model-only). Mastery checked: transfer problem (model's look-back b4) ✓ and the day-2 practice session (2/3 — root of 81 wrong) — the page logged it but did not tie it back to the prerequisite. Returned to the exact waiting step: yes for height; the page itself lost the second unknown. 🧩 map connected: no. Mind card cause: none.

## آزمودنِ اصلاح
Not a correction-trial scenario.

## پروندهٔ کامل (dossier) و کارنامه
Session dossier: chat work, chat_solved record, practice case events. Mind: understanding failures from prerequisite gaps (implausible).

## تمرین و زمان
Day 1 → day 2 (page clock): T41 case from chat, first session logged from her report, next window «روزِ ۳» ✓.

## بخش‌ها (خلاصه؛ جدولِ کامل در PARTS.md)
coach (lens), mind (lens), 🧩 map (island), 🧭 route map (missing), practice (better).

## مسیردهی (routing)
### bp3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام! یه سؤال از کتاب: «نردبانی به طول ۵ متر به دیوار تکیه د…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه نردبون کج به دیوار تکیه داده، می‌خوایم بدونیم سرش تا کجای…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «نمی‌دونم... شاید چون نردبون کجه؟ اگه صاف بود ۵ میشد. ولی کج …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «کشیدم: یه مثلثه که گوشه‌ی پایینش، کنار دیوار، قائمه‌ست. یه ض…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «روی ۳ میشه ۹ خونه، روی ۵ میشه ۲۵ خونه. خب که چی؟ روی دیوار ر…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آهان! پس مربع روی دیوار میشه ۲۵ منهای ۹، یعنی ۱۶. پس دیوار ۱…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «۴ تا! چون ۴ × ۴ میشه ۱۶. آهان، پس دیوار ۴ متره! این همون «جذ…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «کشیدم. نردبون مستطیل رو از وسط قطری نصف می‌کنه! پس مثلث نصف …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «باشه: ۱۰ × ۱۰ = ۱۰۰، ۶ × ۶ = ۳۶، ۱۰۰ منهای ۳۶ = ۶۴، جذر ۶۴ م…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «همون که گفتی روی ضلع‌ها مربع بکشم و خونه‌ها رو بشمرم. راستی،…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «شمردن خونه‌ها رو دوست داشتم. اونجا که گفتی اسم قضیه رو نمیگی…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت …» | lla_coach | lla_coach | ✓ |



## ارتقای لازم
- 🧭 «نقشهٔ مسیرِ مسئله» (roadmap §16): origin → now → destination with dotted detours (Pythagoras → root → area), returns, hover details, a geography strip — from APP.EVLOG.
- Prerequisite stack in the coach: keep the waiting step while a prerequisite (and its nested one) is taught; return there; book cause.

## Defects (catalogue ids; full text in CATALOGUE.md)
- B22·D6 (S2), B22·D7 (S2), B22·D12 (S3), B22·D14 (S3), B22·D17 (S3)

Prerequisite scenario (ADDENDUM 2, several + nested). Re-run from scratch after the container restart (and once more after fixing an id re-mapping in my driver); same user turns and replies; results identical to the first run.

RESULT: FAIL
