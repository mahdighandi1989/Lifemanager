# pwB2 — بهنام و پیشنهادِ کارِ شیراز (کارِ پیشینِ من · تصمیمِ زندگی) + تاریخ‌ها — ROUND 26 (runner B)

## خلاصه برای مالک
بهنام جدولِ معیار و وزنِ خودش را برای رفتن به شیراز آورد. حسابِ درستِ او (جمع‌های زنجیره‌ای) این بار درست خوانده شد؛ معیارِ جاافتاده (مراقبت از مادر) و وزن‌های ۱۱۰٪ حکم گرفتند، او هر دو را خودش درست کرد، با همسر و مادرش حرف زد، نمرهٔ مادر را از حرفِ خودِ مادر گذاشت و با آزمونِ حساسیت به تصمیمِ مشروط رسید. دفتر همهٔ نسخه‌هایش را در پرونده نگه داشت و ردِ صریحِ حکم («قبول ندارم») دوباره سنجیده شد. پنج ایرادِ مهم: ردِ حکم «به معنا» خوانده نشد؛ اصلاحِ درستِ گامِ ۴ در دفتر ننشست؛ پس گرفتنِ «قبول ندارم» ردِ تازه حساب شد؛ جوابِ «جمعه‌ی بعد» و «باشه» به پرسش‌های تاریخِ صفحه خوانده نشد.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 prior-work opening: resume-point turn question; page arithmetic reads his chained sums — «۰.۴×۹ + ۰.۳×۸ + ۰.۲۵×۶ + ۰.۱۵×۸ = ۳.۶ + ۲.۴ + ۱.۵ + ۱.۲» ✓, «= ۸.۷» ✓, «۲.۴ + ۱.۲ + ۲ + ۰.۴۵ = ۶.۰۵» ✓ (B25·D5 FIXED: round 25 called these wrong three times).
- [PASS] p2 ledger: 5 steps — 1 ✓, 1 ناقص, 3 ✗, resume at step 1; step 4 «حساب … می‌خواند؛ ایرادِ این گام در خودِ این حساب نیست».
- [FAIL] p2 dispute by meaning «مادرم معیار نیست، اون یه موضوعِ جداست … چرا میگی معیارِ جاافتاده‌ست؟» ⇒ turn question A073 «خودت فکر می‌کنی چرا؟ … توضیحِ آماده را نده»; nothing recorded on step 1 (B25·D3 remainder, S2).
- [PASS] p3 he accepts and fixes steps 1 and 2 ⇒ both ✓ with history, resume moves to step 4.
- [FAIL] p4–p5 his recomputation of step 4 (three chains, all «می‌خواند») is not applied: «متنِ تازه‌ات … هنوز با حسابِ صفحه یا حکم نمی‌خواند — گام همان می‌ماند»; p6 the page then asks him to «درستِ همین گام را خودت چطور می‌نویسی؟» — he already had (B26·D22, S2). It lands only at p9 through the validated `result`.
- [PASS] p5 mixed reply «گامِ ۴ رو که قبول کردی، خوبه. ولی حکمِ گامِ ۵ رو قبول ندارم: …» ⇒ step 5 disputed and re-checked with evidence (✗ ⇒ ⚠️ ناقص, «دوباره سنجیده شد: شیراز جلوتر است … ولی نه با اختلافِ زیاد»), step 4 keeps its own state; the re-check is on the ledger and in 📜.
- [PASS] p6 «نه، بس نیست! …» is not read as a dispute.
- [FAIL] p7 «اون «قبول ندارم» که درباره‌ی گامِ ۵ گفتم اشتباهی بود؛ حکمِ اولت درست بود» ⇒ turn question «همین پیام حکمِ گامِ ۵ … را رد می‌کند … دوباره بسنج» (B26·D23, S2: C5 take-back not read; C6 asked again).
- [PASS] p8 live_new: ledger carried to 🔭, stage «اجرا» in both blocks; p9 (+3 d) correction «نمره‌ی مادر … ۷ نه ۲» ⇒ «داده به حرفِ خودت: «۷» (اصلاح شد ⇐ «شیراز ۲»)», step 4 updated, resume ⇒ step 5; p10 sensitivity sums ✓ ✓ ✓, step 5 ✓ by his own decision; final ledger «۵ گام — ۵ درست» with every earlier version kept in 📜 («به‌روز شد» ×6).
- [PASS] p11 (Friday ۸ آبان) «تا جمعه …» ⇒ «امروز خودش جمعه است: همین امروز یا جمعهٔ بعد (۱۵ آبان ۱۴۰۵)؟» asked once (C1).
- [FAIL] p11–p13 the same plan is booked for today at once, and «جمعه‌ی بعد.» changes nothing; Today: «📌 … تا جمعه به مدیرِ شیراز جواب می‌دم — موعد: ۸ آبان ۱۴۰۵ — انجام شد؟» (B26·D24, S2).
- [PASS] p13 «۲۵ آبان با صاحب‌خونه‌ی شیراز قرار دارم…» (no model action) ⇒ page: «دوشنبه ۲۵ آبان ۱۴۰۵ — در «امروز» بیاید؛ درست است؟» — correct date and weekday (C12 ask).
- [FAIL] p14 «باشه.» not read; p15 «آره، درسته.» too late — no deadline, no line (s25: deadlines = only the model's «آخرِ ماه») (B26·D25, S2).
- [FAIL] p1 «تا آخرِ ماه باید جواب بدم» booked 2026-11-21 through the model's `deadline` with no «درست است؟» and no line (B26·D3 again, S3); 📜 «داده: وزن‌ها هم جمعشون ۱۱۰ بود»، «داده: درستش می‌کنم: حقوق ۳۰»، «داده: مسکن ۲۰» … — his correction sentence split at commas into «data» (B25·D24 STILL, S3); mind card «undefined: ۵ از ۹» (B26·D6); 📜 shows the D22 sentence (B26·D17).
- [PASS] arrival: a conditional decision with a sensitivity check (7.7 vs 6.3; 7.5 vs 6.6) and the exact sticking point (the house for his mother, 25 Aban). Routing 15/15.

## نقشهٔ نیاز
Parts: prior ledger — verdicts, accept-and-fix, explicit dispute, re-check, history in 📜 all met; dispute by meaning, a two-computation fix and a take-back not met (D3r, D22, D23). Page arithmetic — met (no false ✗). Date reader — asks the right questions, cannot read two ordinary answers (D24, D25), books a model date beside its own question. Importer — fragments as data. Person (a father deciding for five people): needed the missing person in his criteria named without being told what to decide, and his dates kept — first met, second not.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
| # | path | should change | did | vs round 25 |
|---|---|---|---|---|
| 1 | chat · his own fix of judged steps 1, 2 | ledger | ✓ | round 25: accepted but «چیزی ثبت نشده بود» |
| 2 | chat · his own fix of judged step 4 (two computations) | ledger step 4 | ✗ refused (D22); applied 5 turns later through `result` | new |
| 3 | chat · datum «نمره‌ی مادر ۷ نه ۲» | datum + step 4 | ✓ both | new PASS |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| p1 «۰٫۴×۹ + ۰٫۳×۸ + ۰٫۲۵×۶ + ۰٫۱۵×۸ = ۳٫۶ + ۲٫۴ + ۱٫۵ + ۱٫۲ = ۸٫۷» | 8.7 | ✓ ✓ (two links) | correct |
| p1 «تهران = ۲٫۴ + ۱٫۲ + ۲ + ۰٫۴۵ = ۶٫۰۵» | 6.05 | ✓ | correct |
| p1 weights «۴۰٪، ۳۰٪، ۲۵٪، ۱۵٪» | sum 110% | not summed by the page (the coach's verdict) | n/a |
| p4 «… = ۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۰٫۴ = ۶٫۷»؛ «تهران = ۱٫۸ + ۰٫۸ + ۱٫۶ + ۰٫۳ + ۱٫۸ = ۶٫۳» | 6.7; 6.3 | ✓ ✓ ✓ | correct — yet the fix was refused (D22) |
| p9 «۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۱٫۴ = ۷٫۷» | 7.7 | ✓ | correct |
| p10 «… = ۱٫۸ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۲٫۱ = ۷٫۵»؛ «۱٫۲ + ۰٫۸ + ۱٫۶ + ۰٫۳ + ۲٫۷ = ۶٫۶» | 7.5; 6.6 | ✓ ✓ ✓ | correct |

## سن
44: card «۲۲ مهر ۱۳۶۱» ⇒ one Jalali confirmation.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B25·D2: FIXED p1. B25·D4 (ledger replaced): FIXED (merge; all versions in 📜). B25·D5 (chained sums misread): FIXED p1/p4/p9/p10. B25·D11 (mind credit): FIXED with the raw label (B26·D6). B25·D15 («چیزی در صفحه ثبت نشده بود»): FIXED for steps 1–2, see B26·D22 for step 4.
- B25·D3 (dispute without «نه» not recorded): STILL at p2 (a «چرا میگی…؟» form); FIXED for «قبول ندارم» (p5).
- B25·D24 (importer takes results/fragments as data): STILL (📜).

## Routing (15/15 correct)
### pwB2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه تصمیمِ بزرگ دارم و خودم تا یه جایی جلو رفتم، می‌خوا…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «مادرم معیار نیست، اون یه موضوعِ جداست؛ تصمیمِ کاری رو با عدد…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «راست میگی، اگه برم کی بهش سر بزنه… قبول. وزن‌ها هم جمعشون ۱۱…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «شیراز = ۰٫۳×۹ + ۰٫۲×۸ + ۰٫۲×۶ + ۰٫۱×۸ + ۰٫۲×۲ = ۲٫۷ + ۱٫۶ + …» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «گامِ ۴ رو که قبول کردی، خوبه. ولی حکمِ گامِ ۵ رو قبول ندارم:…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «نه، بس نیست! نمره‌ی ۲ برای مادر رو از خودم درآوردم؛ باید با …» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «یه چیزی رو پس می‌گیرم: اون «قبول ندارم» که درباره‌ی گامِ ۵ گ…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «اینو مسئله‌ی خودم ثبت کن؛ امشب با خانمم و فردا با مادرم حرف …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «سلام، برگشتم. با خانمم حرف زدم، گفت اگه مادرم بیاد شیراز مشک…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «وارسی کردم: اگه وزنِ مادر رو حتی ۳۰ بگیرم و از حقوق کم کنم، …» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «تا جمعه به مدیرِ شیراز جواب می‌دم.…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «جمعه‌ی بعد.…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «۲۵ آبان با صاحب‌خونه‌ی شیراز قرار دارم که خونه‌ی مادرم رو بب…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «باشه.…» | lla_coach | lla_coach | ✓ |
| p15 | coaching (problem talk) | «آره، درسته.…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Read «قبول ندارم … اشتباهی بود / پس می‌گیرم» as withdrawal; read «جمعه‌ی بعد / هفته‌ی بعد / باشه / چشم / اوکی» as answers to the page's own date questions; when an answer is not understood, say so in one line instead of silence.

## ایده‌ها
- «حکمی را که رد کردم کجا ببینم که دوباره سنجیده شد؟» — now on the ledger line and in 📜 (owner question 32: هست).
- «اگر بخشی را قبول و بخشی را رد کنم؟» — each step keeps its own state (question 34: هست), but only for an explicit «قبول ندارم».

## کارِ پیشینِ تو — حکم‌ها (prior-work verdict table)
| step | truth | page verdict | his reply | end state |
|---|---|---|---|---|
| ۱ معیارها | incomplete (mother's care missing) | ⚠️ ناقص | disputes by meaning (not read) ⇒ then accepts, adds the criterion | ✓ |
| ۲ وزن‌ها ۴۰/۳۰/۲۵/۱۵ | ✗ (110%) | ✗ | accepts, new weights sum 100 | ✓ |
| ۳ نمره‌ها | his judgement | ✓, never re-asked | — | ✓ |
| ۴ جمعِ وزنی | arithmetic right, built on step 2 | ✗ · وابسته به گامِ ۲ (arithmetic «می‌خواند») | recomputes correctly ⇒ refused (D22) ⇒ applied at p9 | ✓ |
| ۵ «پس شیراز، با اختلافِ زیاد» | dependent | ✗ · وابسته به گامِ ۴ | «قبول ندارم» ⇒ re-check ⇒ ⚠️ ناقص; take-back read as a new dispute (D23); final decision | ✓ |

## Defects (catalogue round26B/defects.md)
- B25·D3 remainder (S2) · B26·D22 (S2) · B26·D23 (S2) · B26·D24 (S2) · B26·D25 (S2) · B26·D3 (S3) · B25·D24 (S3) STILL · B26·D6 (S3) · B26·D17 (S3).

RESULT: FAIL — 5 S2 + 4 S3
