# tB1 — invention idea (smart pill box for her mother) ⇒ a missing area filed as a sheet ⇒ the territory loop, round 26 (group B)

## خلاصه برای مالک
او ایدهٔ جعبه‌قرصِ هوشمند را آورد، دو گام را خودش با آزمایش و حساب جلو برد، و برای گامِ «کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟» صفحه کمبودِ سامانه را برگه کرد. این بار حلقهٔ قلمرو درست رفتار کرد: سه جوابِ بی‌ربطِ روتین را رد کرد و هر بار دلیلِ خودش را گفت؛ وقتی ابزاری آمد که فقط در یک واژهٔ کلی شریک بود («بررسیِ بازار و رقیبان»)، به‌جای «رسید» از خودِ او پرسید؛ «نه» ِ او گام را دوباره منتظر کرد و برگه را با یادداشت باز کرد؛ وقتی ابزارِ درست آمد و او گفت «همون نیست»، «رسید» پس گرفته شد؛ و وقتی گفت اشتباه کرده، با تاریخچه برگشت. دو نقصِ کوچک ماند: پس از پس گرفتنِ «نه»، برگه «باز» ماند هرچند گام دیگر منتظرش نیست؛ و پیامِ «سنجیدم که نیازِ گام را جواب می‌دهد» فقط بر هم‌خوانیِ واژه‌ها تکیه دارد، نه آزمودنِ ابزار روی کارِ او.

## Criteria
- [PASS] p3 gap filed for step «(۳) قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟»; p4 second opinion agree ⇒ sheet #101, Today «⏸ … منتظرِ برگهٔ #۱۰۱»; the rest of the work continued (p5–p8).
- [PASS] arm 1 (+1 d, reply naming `mind`): s14 «⚠️ … جواب نداد — جواب هیچ نما یا حوزه‌ای را که برای این گام ساخته شده باشد نام نبرد — زیرِ برگه نوشتم و دوباره باز شد»; sheet open; step waits.
- [PASS] arm 2 (+1 d, reply naming the ruled-out `pr_hypothesis_testing` with need words): s15 «آنچه آمد «استدلالِ علمی و آزمونِ فرضیه» است که خودِ برگه از اول کنار گذاشته بود» — a reason different from arm 1 (B25·D18 FIXED).
- [PASS] arm 3 (+1 d, generic «تمرینِ تازه … کار تمام است»): s16 rejected, step waits.
- [PASS] arm 4 NEW (+4 d, scratch page with ONE area `pr_market_scan`, overlap = one frame word «ایده»): s17 «❓ برگهٔ #۱۰۱ جواب گرفت: «بررسیِ بازار و رقیبان». مطمئن نیستم همان … پیش از ادامه از تو می‌پرسم» + Today «❓ … همان ابزارِ گامِ … است؟»; p9 turn question = that ask (B25·D1 FIXED — round 25 declared it arrived).
- [PASS] her «نه» (p9) ⇒ s19 «⏸ گامِ «(۳) …» دوباره منتظرِ برگهٔ #۱۰۱ است — «بررسیِ بازار و رقیبان» همان نبود», sheet reopened with her quote in the note, sys entry `rejected:[pr_market_scan]`.
- [PASS] arm 5 NEW (+1 d, scratch page with `pr_prior_art`, best fit): s23 «🛎 ابزارِ لازم آمد: «جست‌وجوی پیشینهٔ اختراع» … همان گام را از سر می‌گیریم», sheet answered.
- [PASS] her «نه، همون نیست» AFTER arrival (p10) ⇒ handled by the page before the model: «… «رسید» اعلام کرده بودم و نادرست بود — زیرِ برگه نوشتم و دوباره باز شد؛ گام دوباره منتظر می‌ماند»; Today «⏸ … دوباره منتظرِ برگهٔ #۱۰۱ است»; sheet open with note «(پیش‌تر «رسید» اعلام شده بود — پس گرفته شد)»; 🧭 detour `syswait` back.
- [PASS] C5 take-back (p11 «اشتباهی گفتم «همون نیست» … همون بود») ⇒ model `sys_fit fit:true` ⇒ «🛎 … گفتی همان است؛ همان گام را از سر می‌گیریم»; 📜 «↩ «نه» پس گرفته شد: «جست‌وجوی پیشینهٔ اختراع» همان است — از حرفِ خودت: «…»»; sheet note «یادداشتِ پیشینِ «همان نیست» دیگر برقرار نیست».
- [PASS] no duplicate waiting rows: 📜 has ONE «⏸ منتظرِ برگهٔ #۱۰۱» row (outcome «رسید (تأییدِ تو)») + one row per check (B25·D19 FIXED).
- [FAIL S3] B26x·D25 after the take-back the sheet stays `open` (s28 `status:"open"`) though its own note says «این گام دیگر منتظرِ این برگه نیست» — the routine keeps an already-satisfied sheet in its queue.
- [FAIL S3] B26x·D26 arrival text «سنجیدم که نیازِ گامِ … را جواب می‌دهد» (s23) rests on shared words only («جستوجو، پیشینه، اختراع، ثبت، واژهکلید، پایگاه»); the tool was never tried on her idea, and she found next turn that it «فقط یه فهرست کلی میده» (bank #39 still missing; wording overstates).
- [FAIL S3] B25·D9 STILL (mild): p7 «# وضعِ کنونی … مرحله: بازنگری» after two sub-results; the model kept planning and p8 registered the live problem at «طرح», so no visible effect beyond the prompt.
- [PASS] routing 11/11.

## نقشهٔ نیاز
- Territory loop (FOR: keep a step waiting until a tool that truly fits arrives; never announce arrival on weak evidence; let her overrule both ways): met in all five arms + both overrules.
- Sheet (FOR: tell the routine what is still needed): met — each reopen note says why; unmet once: not closed again after the take-back (D25).
- Today (FOR: one line per real state): met — ❓ ask, ⏸ back-to-waiting, 🛎 arrival each replace the previous line.
- 📜 (FOR: whole history once): met — ask, two rejects, take-back, arrival each one row, single waiting row.
- Person: an inventor who wants to know whether her idea already exists; she was never told «arrived» for a market tool, her «نه» was believed at once, and her own correction of her «نه» was believed too. What she still lacks: proof that the arrived tool works on HER idea (D26).

## پیش‌نیاز
None detected (correct: she reasons fluently).

## آزمودنِ اصلاح
- Round-25 territory fix (P3 «unclear fit ⇒ ask»): tested on a frame-word-only overlap ⇒ asked. ✓
- P3 «نه after arrival ⇒ back to waiting»: ✓. C5 take-back: ✓.

## سن
Birth 1374-04-23 ⇒ 31, adult band; register plain «تو». ✓

## Round-25 defects
- B25·D1 FIXED (s17 ask instead of arrival; p9 «نه» ⇒ waiting again).
- B25·D18 FIXED (s14/s15 mismatch lines give different reasons; no ask + reopen in the same pass).
- B25·D19 FIXED (one waiting row in 📜).
- B25·D9 STILL (p7 prompt stage, mild).

## Arithmetic
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| ۰٫۳ ÷ ۰٫۱ ⇒ «۳ تا پله» | 3 | silent (model: «حسابش درست است») | PASS |
| ۶۰ × ۱/۲۰ ⇒ «ماهی ۳ تا هشدار» | 3 | silent | PASS (unread) |
| ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰ | 1/400 | silent | PASS (unread; fraction shape not parsed) |
| ۶۰ × ۱/۴۰۰ ⇒ «۰.۱۵ هشدار در ماه» | 0.15 | silent | PASS (unread) |

## Routing
11/11 correct (routing.md).

## ارتقای لازم
- On a take-back that restores an arrival, set the sheet back to its arrived state (answered), not `open` (D25).
- Say «هم‌خوان است (واژه‌ها: …) — هنوز روی کارِ تو آزموده نشده» instead of «سنجیدم که … جواب می‌دهد» until a real use on her data (D26, bank #39).
- Parse fraction products («۱/۲۰ × ۱/۲۰ = ۱/۴۰۰») in the arithmetic check.

## ایده‌ها
- After an arrival, the page's first question could be «با همین ابزار روی جعبه‌قرصِ خودت یک جست‌وجو بکن و بگو چه دیدی» — the honest test the arrival line now only claims.

## Defects
- S3 B26x·D25 sheet left open after take-back.
- S3 B26x·D26 arrival claims «سنجیدم» on word overlap only.
- S3 B25·D9 STILL (mild).

RESULT: FAIL (3 S3)
