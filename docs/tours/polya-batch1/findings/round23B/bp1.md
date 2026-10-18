# bp1 — نگار و n²−۱ (یک پیش‌نیاز — ریاضی) — ROUND 23 (runner B)

## خلاصه برای مالک
نگار (۱۵ ساله) باید ثابت می‌کرد n²−۱ برای هر n ِ فرد بر ۸ بخش‌پذیر است و «مربع منهای مربع» را بلد نبود. این بار سامانه همان لحظه نامِ دقیقِ کمبود را گفت («تجزیهٔ تفاضلِ دو مربع» برای گامِ «نوشتنِ n²−۱ به شکلِ ضرب»)، با یک پرسشِ کوتاه سنجید، فقط همان‌قدر یاد داد، با x²−49 تسلطش را آزمود، و دقیقاً به همان گام برگرداند؛ او برهان را تا آخر برد. کارنامه گیرش را «پیش‌نیاز» نوشت نه ضعفِ طرح‌ریزی، و یادگیری‌اش را پیشرفت. دو ایراد: وقتی در بازنگری گفت «فکر کردم خنگم»، صفحه دیگر قاعدهٔ «نامِ کمبود را بگو» را نداشت (فقط مدل گفت)؛ و نقشهٔ مسیر مبدأ و مقصدِ مسئله را نشان نمی‌دهد.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۱۵ (کارت، 2011-04-17) — نوجوان: بلوکِ نوجوان + ایمنیِ کم‌سال ✓

## Criteria (written criteria + round-23 requirements)
- [PASS] p3 prerequisite reported (concept «تجزیهٔ تفاضلِ دو مربع: a²−b² = (a−b)(a+b)», step «نوشتنِ n²−1 به شکلِ ضربِ دو عامل», her quote) and validated; stack «۰) مسئلهٔ اصلی … ⇐ ۱) …» and the diagnostic as the only turn question (p4).
- [PASS] p4 diag «missing» from her answer; taught only the identity with a numeric example (25−9) and ONE mastery question (x²−49); p5 mastery yes ⇒ exact return «برگردیم به … گامِ نوشتنِ n²−1 به شکلِ ضربِ دو عامل…»; p6 back-turn rule «گامِ بعدیِ تو چیست را این نوبت نپرس» ✓.
- [PASS] Solved and verified (p6–p8), chat_solved with her lesson, best question = the diagnostic, taste; day 2 transfer x²−9 checked by expansion and x=5.
- [PASS] 🧩 record with sess, item state learned; mind «علتِ هر گیر: پیش‌نیاز ۲ · گره ۰ · مهارت ۰ — … ضعفِ مرحله نیست»; no weakest named (round 22: «طرح‌ریزی ۱ از ۳ … ضعیف‌ترین»).
- [FAIL] p10 «فکر کردم خنگم» after closure: no «# پیش‌نیاز» block, no ability rule — the named-gap answer is model-only (B23·D1).
- [FAIL] 🧭 route: before the detour empty (origin «پروندهٔ این گفت‌وگو (بی مسئلهٔ زنده)», destination «خواستهٔ مسئلهٔ گفت‌وگو»); inside and after-return correct (detour dotted, «برگشت به جای منتظر» point); FINAL map after chat_solved loses the detour's concept and return (B23·D2).
- [FAIL] p11 «x²−9 = (x−3)(x+3). درسته؟ با ضرب پرانتز هم چک کردم» still «همین پیام حدس است» (B23·D11); stack names the main problem «سلام. معلممون یه تمرین داده…» (B23·D10); teen block garble (B23·D8).
- [PASS] Routing 12/12; strict scan clean.

## نقشهٔ نیاز
**Parts:** prerequisite layer (FOR: tell a missing concept from a knot or low ability, name it, diagnose, teach as far as the step, check mastery, return exactly) — met for the first time. 🧩 map (FOR: the concept with its step, linked) — linked via sess ✓, title raw ✗. 🧭 route (FOR: origin → now → destination) — ends wrong ✗. Mind — met.
**Person:** a 15-year-old who «can only plug numbers in» needed to hear exactly which tool was missing, get it in two messages, and not feel stupid — met in the solve; at «خنگم» only the model held the line.

## پیش‌نیاز
Missing: «a²−b² = (a−b)(a+b)», at the planning step «n²−1 as a product». Detected p3 ✓ (model report validated by the page); named ✓; diagnostic ✓ (p4); taught to the step ✓; mastery ✓ (x²−49, p5); exact return ✓ (p5–p6); solved ✓; 🧩 linked ✓; mind cause ✓ + learned as progress ✓; day-2 use ✓. Ability talk after closure: not enforced (B23·D1).

## آزمودنِ اصلاح
Not a correction-trial scenario.

## سن (RUNNER23 §1)
Teen block from p2 («نه کودکانه و نه رسمی… نصیحت و موعظه نه» + minors' safety lines); replies plain and without lecturing ✓; one garbled line in the block (B23·D8). Mind: psy item not answered here (see bp3: «برای این سن هنجارِ معتبر در دست نیست»).

## Routing
### bp1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. معلممون یه تمرین داده: «ثابت کنید برای هر عدد فرد n، ع…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «نه، ندیدم. فقط می‌دونم n فرده. با n²−1 نمی‌دونم چیکار کنم، ف…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «شکل دیگه؟ یعنی چی؟ ما تو کلاس فقط ضرب کردن پرانتزها رو خوندی…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «(x−1)(x+1) = x² + x − x − 1 = x² − 1. خب این ضربه، ولی من می…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «x² − 49 = (x − 7)(x + 7). با ضرب هم چک کردم: x² + 7x − 7x − …» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «پس n²−1 = (n−1)(n+1). حالا n فرده، پس n−1 و n+1 هر دو زوجن. …» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «آهان! ۴، ۴، ۸ — همیشه یکی‌شون بر ۴ بخش‌پذیره! چون زوج‌ها یکی…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «چون زوج‌ها دوتا دوتا جلو میرن: ۲، ۴، ۶، ۸، ... و مضرب‌های ۴ …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «همون که گفتی (x−1)(x+1) رو ضرب کنم؛ از اونجا دیدم برعکسش هم …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «اینکه خودم الگو رو پیدا کردم خیلی حال داد. ولی اولش که هیچی …» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «سلام! امروز تو تمرین‌های کتاب x²−9 بود، همون روش دیروز رو زد…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «x=۵: ۲۵−۹=۱۶، و (۵−۳)(۵+۳) = ۲×۸ = ۱۶. یکیه!…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Keep the ability rule active for a closed problem's look-back turns (and for the next session) — need: «خنگم» comes after the solve.
- Route map origin/destination for chat problems from the statement and the unknown.

## ایده‌ها
- When the learned identity is used again (day 2), book a «کاربست» on the 🧩 item automatically from the chat — part: 🧩 «uses»; person: see the tool becoming hers.

RESULT: FAIL
