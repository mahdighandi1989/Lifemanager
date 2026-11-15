# pwB2 — پدرِ ۴۴ ساله: شیراز یا تهران (کارِ پیشین با معیارِ جاافتاده) — ROUND 27 (runner B)

## خلاصه برای مالک
پدری با کارِ نیمه‌تمامِ خودش آمد: معیارها، وزن‌ها (۱۱۰٪)، نمره‌ها و نتیجهٔ «شیراز با اختلافِ زیاد». صفحه هر گام را داوری کرد؛ این دور اعتراضِ «به معنا» («مادرم معیار نیست…») اعتراض شنیده شد، اصلاحِ دو‌زنجیره‌ایِ گامِ ۴ همان نوبت نشست، پس گرفتنِ اعتراض با تاریخچه برگشت، «جمعه‌ی بعد» و «باشه» خوانده و ثبت شدند. ولی دو ایرادِ جدی آمد: جملهٔ «امشب با خانمم و فردا با مادرم حرف می‌زنم» شش بار با شش تاریخِ مختلف دوباره پرسیده شد و آخر با «باشه»ای که برای قرارِ دیگری بود ثبت شد؛ و اصلاحِ «نمرهٔ مادر ۲ ⇒ ۷» عددِ بی‌ربطِ ۶٫۰۵ (جمعِ تهران) را کهنه خواند و ۱۱٫۰۵ پیشنهاد داد.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 prior block: step verdicts (1 ⚠️ missing criterion «مراقبت از مادر», 2 ✗ weights 110 %, 3 ✓, 4 ✗/dependent, 5 ✗ dependent), resume at step 1; the opening «۰٫۴×۹ + … = ۸٫۷» and «… = ۶٫۰۵» chains read.
- [PASS] p2 dispute BY MEANING («مادرم معیار نیست … چرا میگی معیارِ جاافتاده‌ست؟») ⇒ «همین پیام حکمِ گامِ ۱ … را رد می‌کند … با شاهد دوباره بسنج» (round 26 U8/B25·D3: A073 «خودت فکر می‌کنی چرا؟»).
- [PASS] p3 «راست میگی … قبول» ⇒ read as taking back that dispute; steps 1–2 fixed by his own words ✓.
- [PASS] p4–p5 his two-chain fix of step 4 (all links ✓) applied the same turn: ledger «۴ درست، ۱ نادرست · ازسرگیری از گامِ ۵» (round 26 U18/B26·D22: refused).
- [PASS] p5 explicit «حکمِ گامِ ۵ رو قبول ندارم» ⇒ one re-check; p6 «نه، بس نیست!» not a dispute.
- [PASS] T5 p7 «اون «قبول ندارم» … اشتباهی بود؛ حکمِ اولت درست بود» ⇒ TQ «ردِ خودش … را **پس می‌گیرد** — … حالتِ پیش از رد را با تاریخچه برمی‌گرداند»; 📜 «خودش ردِ حکم را پس گرفت؛ حکم همان می‌ماند» (round 26 U9/B26·D23: read as a new dispute).
- [PASS] p9 (+3 d) mother's score 2 ⇒ 7: step 5 rewritten «شیراز = … = ۷٫۷» «به دستِ خودش» with the page's arithmetic «درست».
- [FAIL] p9/s18 the same correction lists «عددهای حساب‌شده از «شیراز ۲»: «۶٫۰۵» — کهنه … (۶٫۰۵ ⇒ ۱۱٫۰۵)» — 6.05 is TEHRAN's opening sum (no mother term at all); 11.05 = 6.05 + 5 is no recomputation of anything. C11/P4. New B27·D12 (S2).
- [PASS] T6 p11/s20 «تا جمعه به مدیرِ شیراز جواب می‌دم» said on a Friday ⇒ «همین امروز یا جمعهٔ بعد (۱۵ آبان ۱۴۰۵)؟» once; p12 «جمعه‌ی بعد.» ⇒ «✓ به گفتهٔ خودت ثبت شد … 📌 … — ۱۵ آبان ۱۴۰۵» (round 26 U10/B26·D24).
- [PASS] T6 p13 «۲۵ آبان با صاحب‌خونه‌ی شیراز قرار دارم» asked; p14 «باشه.» ⇒ «⏰ «۲۵ آبان با صاحب‌خونه‌ی شیراز …» — ۲۵ آبان ۱۴۰۵» (round 26 U19/B26·D25).
- [FAIL] s13–s23 the sentence «امشب با خانمم و فردا با مادرم حرف می‌زنم و برمی‌گردم» (p8, a past plan by s18) is asked SIX times with drifting dates — ۴ آبان, ۷ آبان, ۹ آبان, ۱۵ آبان, ۹ آبان — glued into the Friday line and the 25-Aban line; his «باشه.» (for the 25-Aban appointment) also booked «📌 «امشب با خانمم …» — ۹ آبان»; his «آره، درسته.» (answering the coach's «جور باشد؟») revived the long-lapsed «تا آخرِ ماه باید جواب بدم» ask and booked «⏰ «جواب به پیشنهادِ کارِ شیراز» — ۳۰ آبان». C12/C19: stale asks lapse; one question per line; a yes binds only the question it answers. B27·D5 (S2 here).
- [FAIL] post 📜 data rows «داده: وزن‌ها هم جمعشون ۱۱۰ بود», «داده: درستش می‌کنم: حقوق ۳۰», «داده: مسکن ۲۰» (comma split of his fix). B25·D24 STILL (S3).

## نقشهٔ نیاز
Parts: prior-work ledger (FOR per-step verdicts, his fixes and disputes, by meaning) — met; correction engine (FOR marking only what used the old score) — unmet (unrelated 6.05); date layer (FOR his own dated commitments after his yes) — met for Friday/«باشه», but a stale sentence haunts every turn and two yeses book the wrong things. Person: a father deciding a family move needed honest arithmetic and his mother as a criterion — met; needed «امروز» to hold only what he agreed — unmet.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۰٫۴×۹ + ۰٫۳×۸ + ۰٫۲۵×۶ + ۰٫۱۵×۸ = ۳٫۶ + ۲٫۴ + ۱٫۵ + ۱٫۲ = ۸٫۷» | 8.7 | ✓ | ✓ |
| «تهران = ۲٫۴ + ۱٫۲ + ۲ + ۰٫۴۵ = ۶٫۰۵» | 6.05 | ✓ | ✓ |
| «شیراز = ۰٫۳×۹ + … + ۰٫۲×۲ = … = ۶٫۷» | 6.7 | ✓ | ✓ |
| «تهران = ۱٫۸ + ۰٫۸ + ۱٫۶ + ۰٫۳ + ۱٫۸ = ۶٫۳» | 6.3 | ✓ | ✓ |
| step 5 «… + ۱٫۴ = ۷٫۷» (score 7) | 7.7 | ✓ | ✓ |
| «۰٫۲×۹ + … + ۰٫۳×۷ = … = ۷٫۵»; «تهران = … = ۶٫۶» | 7.5, 6.6 | (block) | ✓ |
| page proposal «۶٫۰۵ ⇒ ۱۱٫۰۵» | — | — | ✗ B27·D12 |

## سن
44; «تو».

## Arms (RUNNER27 T1–T12) in this scenario
- T5 (take back her own dispute): p7 — PASS.
- T6 («جمعهٔ بعد» and «باشه» as answers): p12, p14 — PASS (but see B27·D5 riding on the same answers).

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
| step | his text | verdict | after |
|---|---|---|---|
| 1 | «معیارها رو نوشتم …» | ⚠️ ناقص (mother missing) | disputed by meaning (p2) ⇒ re-check; his take-back «قبول» (p3); fixed by him ✓ |
| 2 | «وزن دادم: … ۱۱۰٪» | ✗ | fixed by him ✓ (p3) |
| 3 | نمره‌ها | ✓ | never re-asked |
| 4 | «جمعِ وزنی … ۸٫۷ … ۶٫۰۵» | ✗ (dependent) | his two-chain fix ✓ same turn (p4) |
| 5 | «پس شیراز، با اختلافِ زیاد» | ✗ ⇒ ⚠️ after re-check | disputed (p5), take-back with history (p7), fixed by him ✓ 7.7 (p9) |

## Chat ⇄ page
- Chat ⇒ ledger: dispute by meaning, take-back, fixes all reach the ledger and 📜 with history. Chat ⇒ «امروز»: «جمعه‌ی بعد» and «باشه» reach it; two wrong bookings ride on them (B27·D5).

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B25·D3 remainder / U8 (dispute by meaning ⇒ A073): FIXED — p2.
- B26·D22 / U18 (two-computation fix refused): FIXED — p4–p5.
- B26·D23 / U9 (take-back read as a new dispute): FIXED — p7.
- B26·D24 / U10 (Friday booked today; «جمعه‌ی بعد» unread): FIXED — p11–p12.
- B26·D25 / U19 («باشه» unread): FIXED — p14.
- B25·D24 (inferences/fragments as data): STILL — 📜.
- B26·D6 (undefined label), B26·D17 (wording of a self-fix): FIXED (mind card label «گامِ کارِ پیشین»; ledger wording «به دستِ خودش»).

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
- A date ask belongs to one message and one day; it lapses once, and a yes binds only the newest pending question.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D5 (S2, b, C12/C19) s13–s23: a stale sentence re-asked six times with drifting dates; «باشه» and «آره، درسته» book questions they did not answer.
- B27·D12 (S2, b, C11/P4) p9: unrelated 6.05 marked stale, proposal 11.05.
- B25·D24 STILL (S3, b) 📜 data rows.

RESULT: FAIL — 2 S2 + 1 S3
