# bp1 — نگار و n²−۱ (پیش‌نیازِ یگانه — ریاضی) — ROUND 22 (runner B)

## خلاصه برای مالک
نگار (۱۵ ساله) باید ثابت می‌کرد برای هر عددِ فرد n، عددِ n²−۱ بر ۸ بخش‌پذیر است. حالت‌های ۳ و ۵ و ۷ را خودش آزموده بود ولی یک ابزار را نداشت: این‌که «مربع منهای مربع» را می‌شود به صورتِ ضرب نوشت (n²−۱ = (n−۱)(n+۱)). سامانه این کمبود را نشناخت و نامش را نبرد؛ با پرسش‌های «حالتِ خاص» خودش الگو را دید، با ضربِ پرانتز ثابتش کرد و مسئله را تا آخر حل کرد و روزِ بعد همان ابزار را روی x²−۹ به کار برد. ولی کارنامهٔ ذهن آن دو لحظهٔ گیر را «شکست در طرح‌ریزی» ثبت کرد و «طرح‌ریزی» را ضعیف‌ترین مرحلهٔ او نامید — درحالی‌که او فقط یک پیش‌نیاز را نداشت؛ «🧩 نقشهٔ پیش‌نیازها» هم هیچ‌جا پیشنهاد نشد. وقتی گفت «فکر کردم خنگم»، فقط پاسخِ خودِ دستیار بود که گفت یک ابزار جا افتاده بود؛ صفحه چنین چیزی نمی‌خواهد.

## Run setup
Build main b70c1fe8 (round-21 fixes; + docs f5d855d9), `build.py --check` in sync, dist 10:23 after the merge. Replay of round21B/<sid>/ctl with harness5.js and the round-21 driver (round22B/tools/drv.py) that matches each AI call to its round-21 twin by her turn text; round-21 replies reused only where the round-22 prompt asked nothing new; NEW replies written as the literal average model wherever round 22 required (rewrite requests, correction result blocks, start_practice / practice_log, running lists, prerequisite scenarios, new trials). Every run ends with {"exit":true} (view_pre_* / view_post_* of mind card, maps, Today). After exit tools/post21.js reopened the profile at the final simulated day and shot full-page: part_dossier_<n>.png (part_dossier_sess_<n>.png for conversations without a live problem), part_tunnel_<n>.png, part_allwork_1.png, part_mind_1.png («از کجا؟» open), part_practice_1.png; text in post.txt. Mid-run shots are out/s<N>.png (+ s<N>_page.png for page actions); record dumps are the eval of the inserted «dump» steps (out/s<N>.json). Clock: the page's own Date shift (inject.js __adv; days counted by tools/advsum.py). Throw-away profiles, deleted at the end; no records seeded outside the UI/assistant. Defect ids: round22B/CATALOGUE.md.

## Criteria (written criteria + round-22 requirements)
- [PASS] She reached a verified solution: n²−1=(n−1)(n+1), two consecutive evens, one a multiple of 4 ⇒ 8 | n²−1; chat_solved with her lesson and check; look-back (best question, taste) recorded; day 2 transfer to x²−9 checked by expansion and x=5.
- [FAIL] §15 — the page did not tell the missing prerequisite apart from a planning stuck: the coach block offered only the stuck ladder; the style rule «نامِ قضیه … را لو نده» discourages naming «تجزیهٔ تفاضلِ دو مربع»; no diagnostic question came from the page; the 🧩 map was never offered (B22·D6).
- [FAIL] Mind card: «طرح‌ریزی ۱ از ۳ … ضعیف‌ترین ۶۹٪» (dump: plan 1/3 with two «گیر … در گفت‌وگو با مربی» from the prerequisite turns), no cause recorded, the later learning (x²−9 transfer) not marked as progress (B22·D6).
- [FAIL] Guess detector p10: «x²−9 = (x−3)(x+3). درسته؟ با ضرب پرانتز هم چک کردم» classified as an untested guess (B22·D13); offer line «می‌خواهی تمرینش کنیم؟» unmarked beside the taste question p8 (B22·D11).
- [PARTIAL] «خنگم» answered without blame and with the exact missing tool — model-only (the prompt has no prerequisite/ability rule); the page enforces only «بی حکم دربارهٔ او».
- [PASS] Routing 11/11 lla_coach.

## نقشهٔ نیاز
**Parts:** coach (FOR the right help at the right moment — HANDBOOK «help neither too much nor too little») — met as a Pólya ladder, not met as prerequisite diagnosis. 🧩 prerequisite map (VIEW_META: «برای مسئله/مطلبی که فهمیده نشد، هر مفهومِ لازم … پرسشِ تشخیصی … بازگشت به مسئله») — never steps in. Mind card (FOR an honest picture) — misattributes. Chat closure → 🔭 — met.
**Person:** a 15-year-old who «can only plug numbers in» needed to hear that one specific tool was missing, get it quickly, and not feel stupid — she got the tool by discovery, the reassurance only from the model.

## پیش‌نیاز
Missing prerequisite: «a²−b² = (a−b)(a+b)», needed at the planning step (rewriting n²−1). Detected by the page: no. Named: no (named only implicitly by the model's hint «مربع منهای مربع»). Diagnostic question: no (page). Taught as far as needed: yes, via special cases (model-only path). Returned to the main problem and solved: yes. Mastery check: day-2 transfer (her own). 🧩 map connected: no (island). Mind card cause: none; booked as planning weakness ✗.

## آزمودنِ اصلاح
Not a correction-trial scenario.

## پروندهٔ کامل (dossier) و کارنامه
Session/problem dossier: statement, chat work, guess (confirmed), verdict, look-back. Mind: planning weakest from prerequisite stucks (implausible attribution).

## تمرین و زمان
Day 1 → day 2 (page clock): transfer by her; the «بازسازی» card due next day appeared in Today.

## بخش‌ها (خلاصه؛ جدولِ کامل در PARTS.md)
coach, mind, 🧩 map (first judged; island).

## مسیردهی (routing)
### bp1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. معلممون یه تمرین داده: «ثابت کنید برای هر عدد فرد n، ع…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «نه، ندیدم. فقط می‌دونم n فرده. با n²−1 نمی‌دونم چیکار کنم، ف…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «شکل دیگه؟ یعنی چی؟ ما تو کلاس فقط ضرب کردن پرانتزها رو خوندی…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «۸ = ۲×۴، ۲۴ = ۴×۶، ۴۸ = ۶×۸. آهان! همیشه یکی کمتر از n ضرب د…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «(n−1)(n+1) = n² + n − n − 1 = n² − 1. آره درسته! پس n²−1 همو…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آهان! ۴، ۴، ۸ — همیشه یکی‌شون بر ۴ بخش‌پذیره! چون زوج‌ها یکی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «چون زوج‌ها دوتا دوتا جلو میرن: ۲، ۴، ۶، ۸، ... و مضرب‌های ۴ …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «همون که گفتی ۸ و ۲۴ و ۴۸ رو به شکل ضرب دو عدد بنویسم که به n…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «اینکه خودم الگو رو پیدا کردم خیلی حال داد. ولی اولش که هیچی …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «سلام! امروز تو تمرین‌های کتاب x²−9 بود، همون روش دیروز رو زد…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «x=۵: ۲۵−۹=۱۶، و (۵−۳)(۵+۳) = ۲×۸ = ۱۶. یکیه!…» | lla_coach | lla_coach | ✓ |



## ارتقای لازم
- A prerequisite move in the coach: when her words show a missing concept («ما فقط … خوندیم»، «نمی‌دونم چطوری … نوشت»), name the exact concept and the step that needs it, ask one diagnostic question, teach to the needed depth, return to the waiting step; book the stuck with cause «پیش‌نیاز» and the later learning as progress; link the 🧩 map item to the live problem.

## Defects (catalogue ids; full text in CATALOGUE.md)
- B22·D6 (S2), B22·D11 (S3), B22·D13 (S3)

Prerequisite scenario designed this round (RUNNER22 ADDENDUM). The person behaves naturally and never announces the gap. Re-run from scratch after the container restart (same user turns; the model replies were the akey answers written in the first run, ids re-mapped by the driver); results identical to the first run.

RESULT: FAIL
