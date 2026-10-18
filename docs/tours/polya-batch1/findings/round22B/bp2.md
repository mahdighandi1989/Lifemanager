# bp2 — رضا و آبِ بارانِ پشت‌بام (پیش‌نیازِ یگانه — علم/زندگی) — ROUND 22 (runner B)

## خلاصه برای مالک
رضا (۴۸ ساله، باغدار) می‌خواست بداند از پشت‌بامِ ۵۰ متری با ۱۵۰ میلی‌متر باران چقدر آب جمع می‌شود. یک پیش‌نیاز را نداشت: تبدیلِ واحد (یک متر = هزار میلی‌متر، یک مترمکعب = هزار لیتر). با سنجیدن با بارانِ واقعی خطایش را دید و با خط‌کش و مکعب هر دو تبدیل را ساخت، به ۷۵۰۰ لیتر رسید و مسئله را زنده کرد. بعد دو اصلاح کرد: «پشت‌بام ۶۰ متر است» و با ✏️ سه عدد را در پیامِ دومش عوض کرد. صورتِ مسئله دنبال کرد ولی جمله‌اش خراب شد («۶۰ متر مربعه متر مربعه»)، و داده‌ها و خطِ حسابی که خودش در صفحه نوشته بود عوض نشدند و از او پرسیده هم نشد. کارنامه گیرِ واحد را «ضعف در اجرا» ثبت کرد و او خودش گفت «فکر کردم سنم رفته بالا و ریاضیم ضعیفه».

## Run setup
Build main b70c1fe8 (round-21 fixes; + docs f5d855d9), `build.py --check` in sync, dist 10:23 after the merge. Replay of round21B/<sid>/ctl with harness5.js and the round-21 driver (round22B/tools/drv.py) that matches each AI call to its round-21 twin by her turn text; round-21 replies reused only where the round-22 prompt asked nothing new; NEW replies written as the literal average model wherever round 22 required (rewrite requests, correction result blocks, start_practice / practice_log, running lists, prerequisite scenarios, new trials). Every run ends with {"exit":true} (view_pre_* / view_post_* of mind card, maps, Today). After exit tools/post21.js reopened the profile at the final simulated day and shot full-page: part_dossier_<n>.png (part_dossier_sess_<n>.png for conversations without a live problem), part_tunnel_<n>.png, part_allwork_1.png, part_mind_1.png («از کجا؟» open), part_practice_1.png; text in post.txt. Mid-run shots are out/s<N>.png (+ s<N>_page.png for page actions); record dumps are the eval of the inserted «dump» steps (out/s<N>.json). Clock: the page's own Date shift (inject.js __adv; days counted by tools/advsum.py). Throw-away profiles, deleted at the end; no records seeded outside the UI/assistant. Defect ids: round22B/CATALOGUE.md.

## Criteria (written criteria + round-22 requirements)
- [PASS] Reached the result: 60 m² × 0.14 m = 8.4 m³ = 8400 L after both corrections; decision (10 000-litre tank) with a date (Friday next week) and 80% confidence.
- [FAIL] Routing p1 lla_assistant (goal message with the coach block and A191 turn question) (B22·D1).
- [PASS] NEW composite-record trial: live_new statement composed from two messages carries src.parts (u1 «پشت‌بوم انبارم ۵۰ متر مربعه», u2 «بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره …»); the u1 correction changed only the u1 clause, the u2 clause stayed ✓; sufficiency judgement set aside ✓.
- [FAIL] Same trial: statement garbled «۶۰ متر مربعه متر مربعه» (B22·D4); her typed measure line «حجم = ۵۰ مترمربع × ۰٫۱۵ متر …» and d1 «پنجاه متر مربع» never asked «این‌جا هم عوض شود؟» (B22·D2).
- [PARTIAL] NEW ✏️ multi-number trial (۱۵۰⇒۱۴۰، دو⇒سه، ۲۲۰⇒۲۰۰): all three landed in the statement with minimal spans ✓; d2 «۱۵ سانتی‌متر» not asked (B22·D2); page block and coach result block contradict, clipped identical change line (B22·D15).
- [FAIL] Turn question re-asked the re-check he had just done (p9); phase «بازنگری» after his failed unit step (p5) (B22·D12).
- [FAIL] §15: unit conversion (mm→m, m³→L) not detected/named by the page; the mind card books execution as weakest («اجرای طرح ۳ از ۶ … ضعیف‌ترین»); the «ریاضیم ضعیفه» worry answered only by the model (B22·D6).

## نقشهٔ نیاز
**Parts:** coach — Pólya reality check met; prerequisite diagnosis not. Correction engine (FOR one fix ⇒ every record of the fact) — statement yes but garbled; his copies no. 🔭 live problem — opened on his «ثبتش کن» ✓. Mind — misattributes. 🧩 map — absent.
**Person:** a farmer who mixed up units needed the exact missing school fact and confidence that it is not age — he got the facts by discovery and the reassurance from the model only; and needed his page numbers to follow his re-measurement — they did not.

## پیش‌نیاز
Missing prerequisite: unit conversion «۱ متر = ۱۰۰۰ میلی‌متر» (he believed 100) and «۱ مترمکعب = ۱۰۰۰ لیتر», needed at the execution step. Detected/named by the page: no. Diagnostic: the reality check (model) exposed it. Taught to the needed depth: yes (ruler, cube — model-only). Returned and solved: yes. Mastery: re-applied correctly in two re-computations (9 000 L, 8 400 L). Mind card: cause missing, execution weakest ✗. 🧩 map: not connected.

## آزمودنِ اصلاح
| # | turns back / path | should change | what did | must stay — did it | assistant vs page | vs round 21 |
|---|---|---|---|---|---|---|
| 1 (new, composite + typed copy with different wording) | 7 user messages, chat | u1 clause of the statement; ask for d1 «پنجاه…» and the measure line | u1 clause ✓ (garbled); judgement set aside ✓; no ask | u2 clause ✓ | «فرستادم» then page ✓ | new — FAIL |
| 2 (new, ✏️ several numbers) | 8 back · ✏️ | statement u2 clause ×3 numbers; ask d2 | statement ✓ (one span per number); no ask | u1 clause ✓ | reply = top page block; coach block contradicts | new — PARTIAL |

## پروندهٔ کامل (dossier) و کارنامه
Problem dossier: statement (src parts), form as filled, corrections with old/new; mind: execution weakest (unit stucks).

## تمرین و زمان
Plan «جمعه» stored with date; no case (not asked).

## بخش‌ها (خلاصه؛ جدولِ کامل در PARTS.md)
correction engine (better: multi-span, ✏️ spans; worse: garbling), routing (opening miss), mind (lens).

## مسیردهی (routing)
### bp2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع ک…» | lla_assistant | lla_coach | ✗ |
| p2 | coaching (problem talk) | «بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. می‌خوام بدونم در سال…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «خب حجم میشه سطح ضرب در ارتفاع بارون دیگه: ۵۰ × ۱۵۰ = ۷۵۰۰. و…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «یعنی ۱۵۰ میلی‌متر رو متر کنم؟ یه متر صد میلی‌متره دیگه، پس م…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «نه بابا، ۱.۵ متر یعنی تا سینه‌ی آدم! اینجا خشکه. پس اشتباه ک…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آهان، صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «ده تا در طول، ده تا در عرض، ده تا در ارتفاع... هزارتا! پس هر…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «یه اصلاح: اولِ کار که گفتم پشت‌بوم ۵۰ متر مربعه اشتباه بود؛ …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «با ۶۰: ۶۰ × ۰.۱۵ = ۹ متر مکعب، یعنی ۹۰۰۰ لیتر در سال.…» | lla_coach | lla_coach | ✓ |
| p10 | ✏️ edit turn | «[اصلاحِ پیامِ قبلی] «۱۵۰» ⇐ «۱۴۰»، «دو» ⇐ «سه»، «۲۲۰» ⇐ «۲۰۰…» | lla_assistant | lla_assistant | ✓ |
| p11 | coaching (problem talk) | «با ۱۴۰ میلی‌متر: ۶۰ × ۰.۱۴ = ۸.۴ متر مکعب، یعنی ۸۴۰۰ لیتر. ت…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «هشتاد درصد مطمئنم. راستش اولش که میلی‌متر و متر رو قاطی کردم…» | lla_coach | lla_coach | ✓ |



## ارتقای لازم
- Unit-aware same-fact matching (۱۵۰ میلی‌متر = ۱۵ سانتی‌متر = ۰٫۱۵ متر; «پنجاه» = ۵۰) for copy candidates.
- Prerequisite move (see bp1).

## Defects (catalogue ids; full text in CATALOGUE.md)
- B22·D1 (S2), B22·D2 (S2), B22·D4 (S2), B22·D6 (S2), B22·D12 (S3), B22·D15 (S3)

Prerequisite scenario designed this round (RUNNER22 ADDENDUM). The person behaves naturally and never announces the gap. Re-run from scratch after the container restart (same user turns; the model replies were the akey answers written in the first run, ids re-mapped by the driver); results identical to the first run.

RESULT: FAIL
