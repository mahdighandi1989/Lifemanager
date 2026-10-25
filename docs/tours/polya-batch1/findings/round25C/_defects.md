# Round 25 · group C — defects, tables (main 64dc0667)

## Results

- s21: FAIL (C25-2, C22-11)
- s22: PARTIAL (C22-5)
- s23: FAIL (C25-8, C25-4)
- s24: PARTIAL (C22-11)
- s25: FAIL (C25-1, C25-3, C25-4, C25-5, C25-6, C22-5)
- s26: PASS (—)
- s27: PASS (—)
- s28: PARTIAL (C22-11)
- s29: FAIL (C25-4)
- pC1: PARTIAL (C25-7, C25-9)
- pC2: PARTIAL (C25-7, C25-9)
- pC3: PARTIAL (C25-9)
- aC1: PARTIAL (C25-17)
- aC2: PARTIAL (C25-9)
- aC3: PARTIAL (C25-9)
- aC4: PARTIAL (C25-10)
- tC1: PASS (—)
- oC1: PARTIAL (C25-15)
- pwC1: FAIL (C25-11, C25-12, C25-14, C25-15, C25-9, C25-16, C25-19)
- pwC2: FAIL (C25-12, C25-13, C25-14, C25-18)

PASS 3 (s26, s27, tC1) · PARTIAL 11 · FAIL 6 (s21, s23, s25, s29, pwC1, pwC2) of 20.

## New defects (round 25)

| id | sev | class | evidence | defect | where |
|---|---|---|---|---|---|
| C25-1 | S2 | a | s25 p1 | «کارِ پیشینِ تو»: حسابِ صفحه (A.STORY.arithChk) «با ۱/۲۰ میشه ۴/۵» را ۱/۲۰ = ۴/۵ خواند و گامِ درستِ جمعِ پیاپی را «✗ نادرست» کرد؛ ازسرگیری روی گامِ درست، گامِ ۳ «وابسته به گامِ ۲». | a45_story.js arithChk/priorOf |
| C25-2 | S2 | a | s21 p3 | پیگیریِ «این نما فیلدی ندارد — چیزی پر نکن و دکمه‌ای نزن» پس از go به فهرستِ lprob، دکمهٔ زبانهٔ «🔭» را هم ممنوع می‌کند؛ خواستهٔ «ثبتش کنیم» نیمه‌کاره می‌ماند (better/r3 = کلیک). | a26_assist.js follow-up text (R7 A24-16) |
| C25-3 | S3 | a | s25 p10 | خطِ سامانهٔ wake «حدسی که در بازنگری ساختی و می‌آزمایی…» با «تو» به ۶۱ ساله‌ای که گفت‌وگو با «شما» است. | a41/a38 inventGate line, regSys |
| C25-4 | S2 | a | s25 p12/p15، s23 p15، s29 p13 | APP.liveStale عددهای بی‌ربط را «کهنه پس از اصلاح» می‌کند و بازمحاسبهٔ بی‌معنا پیشنهاد می‌دهد: «۱، ۲ (۱ ⇒ ۰)» از ۱/(2·3·5)؛ «۱۱، ۱۲» از «۱۰ تاشو چک کردم»؛ اندازه‌های قالب و ۲٫۸ «⇐ ۰» از شکر/کره؛ و ۱۰ و ۱۰۰ ِ واقعاً مشتق را بی ۱۱ و ۱۲۱ می‌گذارد. | a38_live.js liveStale |
| C25-5 | S3 | a | s25 p12 | مسئلهٔ بیدارشده از بازنگری پرسشِ u0 «کلِ مسئله را … می‌گویید؟» می‌دهد با این‌که حدس و آزمونش را خودش گفته (better/r12). | a45 story / a27 turn question |
| C25-6 | S3 | a | s25 p13، pwC1 p7 | «# وضعِ کنونی» مرحله «فهمِ مسئله» و «# مسئلهٔ زنده» «اجرا» — دو منبعِ مرحله ناهم‌خوان. | a26 «وضعِ کنونی» vs A.liveTurnPhase |
| C25-7 | S3 | b | pC2 p1، pC1 p1 | بلوکِ «کارِ پیشینِ تو» برای پیامِ آغازینی که گامِ حساب‌شدهٔ خودش را دارد نمی‌آید («حساب کردم: ۲۰۰۰ × ۳ × ۳۰ × ۱۵۰۰ شد ۲۷۰ میلیون» — همان خطای واحد که R8 برایش ساخته شد). | A.STORY.workMsg |
| C25-8 | S2 | a | s23 p15 | ✏️ «۱⇐۱.۵، ۱۰۰⇐۱۲۰» (شکر و کره) سرانجامِ حدسِ «۱٫۷۵ برابر» (نسبتِ طول‌ها) و داوریِ کفایت را کنار می‌زند — هیچ‌کدام این دو عدد را به کار نبرده بودند (R3 basis-only). | a38/a27 retractRun20 stampUses |
| C25-9 | S2 | b | pwC1 p14 (+ s21 p7، pC2 p6، pC1 p7، pC3 p8، aC1 p5، aC2 p4، aC3 p5) | بلوکِ «کارِ پیشینِ تو» با دستورِ «prior گزارش کن» تقریباً روی هر پیامِ حساب‌دارِ میانهٔ کار می‌آید و خلاصهٔ کهنه‌اش در نوبت‌های بعد تکرار می‌شود؛ گزارشِ prior ِ تازه دفترِ آغازین را جایگزین می‌کند (pwC1: «۴ گام — ۴ درست» و گامِ ۴ ِ منتظرِ برگه از دفتر افتاد). | a45_story.js workMsg/priorOf store |
| C25-10 | S3 | a | aC4 p4 | مرحلهٔ مسئلهٔ زنده پس از آزمودنِ حدسِ نخستِ او (۱۵ در برابرِ ۲۰ روز) پیش از هر طرحی «اجرای طرح» شد. | A.liveStoryPhase |
| C25-11 | S3 | a | pwC1 p1 | معرفیِ «کیوانم، ۳۸ سالمه، مهندس مکانیکم و …» از صورتِ مسئلهٔ گفت‌وگو جدا نشد. | AS.stripIntro23 |
| C25-12 | S2 | a | pwC1 p1، pwC2 p1 | در پیامِ آغازینِ «کارِ پیشین» پرسشِ پررنگِ نوبت A191 «کلِ مسئله را در یک جمله … می‌گویی؟» است، در حالی که بلوکِ «کارِ پیشینِ تو» می‌گوید از نخستین گامِ نادرست ادامه بده — مدلِ لفظی کلِ مسئله را از کسی می‌پرسد که کل و چهار گام را گفته. | a27 turn-question priority vs priorTurnQ |
| C25-13 | S3 | b | pwC2 p2 | ردِ طبیعیِ حکم («ولی گامِ ۳ چرا غلطه؟ … پس احتمال ۹۰٪ـه!») ردِ حکم خوانده نمی‌شود؛ priorReply فقط پیامی را که با «نه/قبول ندارم…» شروع شود می‌گیرد. | a45 priorReply NO24 |
| C25-14 | S2 | a | pwC1 p3–p14، pwC2 p4–p15 | دفترِ «کارِ پیشینِ تو» هرگز درست‌شدنِ گام به دستِ خودش را نمی‌گیرد (فقط «آره» ِ تنها پیشنهادِ مدل را می‌پذیرد): پس از «۲۴۷۰ وات» گامِ ۲ «⚠️ ناقص» و «ازسرگیری از گامِ ۲» می‌ماند؛ در pwC2 پس از ۹٫۲٪ گام‌های ۳/۴ «✗/ناقص». | a45 priorReply YES24/fixed |
| C25-15 | S2 | a | pwC1 p11→p12 (+ oC1 p17 S3) | اصلاحِ داده‌ای که گام‌های پیشین بر آن بنا شده («۲ ⇐ ۲٫۵ هکتار») فقط صورتِ گفت‌وگو را عوض می‌کند؛ گامِ ۱ ِ دفتر «✓ … ۱۰۰ م³» می‌ماند و زنجیرهٔ نتیجه‌های گفت‌وگو (۱۲٫۵، ۱۳۶۰/۲۴۷۰ وات، ۱۹٫۸، ۱۰ پنل) نه کهنه می‌شود نه پرسیده. | a38 retract × a45 prior |
| C25-16 | S3 | a | pwC1 (route_end) | 🧭 «مانده: نامعلوم — طرح هنوز نیست» با این‌که پیامِ آغازین چهار گامِ شماره‌دار داشت؛ گام‌های پیشین فقط نقطهٔ «کارِ پیشینِ تو (از گفت‌وگو)» اند، نه خطِ اصلی. | a44_route.js MAIN_K.cprior |
| C25-17 | S3 | a/c | aC1 (out/s27) | کارنامهٔ کودکِ ۹ ساله می‌گوید «معمای امروز را جواب داده‌ای؛ معمای بعدی فردا» در حالی که معمایی پیشنهاد نشد و جوابی نداد. | a34/a29 psy daily state |
| C25-18 | S3 | c | pwC2 p7 | کارنامه پس از چهار گامِ داوری‌شده (دو ✓) فقط «اجرای طرح ۵۰٪ (۱/۲)» نشان می‌دهد؛ اعتبارِ گام‌های درستِ پیشین روشن نیست. | a29 coachEvent prior |
| C25-19 | S3 | b | pwC1 day 3 | جوابِ کلیِ روتین («یک ابزارِ تازه برای تغییر در مسئله‌ها…») خطِ «⏳ … ساخته‌اش هنوز دیده نمی‌شود — شاید نسخهٔ تازه منتشر نشده» می‌گیرد؛ از چشمِ او یعنی ابزاری در راه است، در حالی که جواب هیچ چیزی نام نبرد. | a44 sys lag line |

## Round-24 defect table

| id | status | evidence |
|---|---|---|
| C24-1 | FIXED | s21 p1, aC1 p1 — self-intro opening is a chat problem from turn one, lla_coach, «# پیش‌نیاز» present |
| C24-2 | FIXED | pC1 p1 — «سارام کلاس دهم.» stripped; NEW sibling C25-11 for «کیوانم، ۳۸ سالمه، مهندسم» (pwC1) |
| C24-3 | FIXED | aC1 p1 — no correction block on the opening |
| C24-4 | FIXED | pC1 p3, pC2 p3 — the page's composite question no longer triggers «دو پرسش» |
| C24-5 | FIXED | s25 p10 — her look-back conjecture woke the dormant child as THE live problem (new C25-3, C25-5 on it) |
| C24-6 | FIXED | s22 p9, s23 p8 — why «با ✏️ ِ خودش روی همان پیام» / «به گفتهٔ خودش: «…»» (no empty quotes) |
| C24-7 | FIXED | s28 p7 — «بعدش چی کار کنم؟» keeps a turn question (e1, stage اجرا) |
| C24-8 | CHANGED | FIXED tC1 p3 (stage طرح), oC1 p6, s28 p7; still a stale u0 on the woken s25 problem (C25-5) |
| C24-9 | FIXED | s22 p12, s23 p12 — post-correction re-check is the turn question |
| C24-10 | FIXED | aC4 — no false «تو» rewrite on «ببینم» |
| C24-11 | FIXED | oC1 p8 — «۱۵⇐۱۲» reaches the «از گفت‌وگو» drafts (u, d1) and the 🧭 destination; draft no longer swallows the meta-question |
| C24-12 | CHANGED | s23 p15 — guess no longer corrupted; but C25-8 (wrong set-asides) and C25-4 (garbage stale list) |
| C24-13 | FIXED | oC1 p13, pwC1 p10 — system-self sheets mark no step waiting |
| C24-14 | FIXED | tC1 #102 — ruled-out sc_persuasion reply ⇒ «جواب نداد … دوباره باز شد», note under the sheet |
| C24-15 | FIXED | tC1 — no «شما» rewrite on «روتین» |
| C24-16 | FIXED | aC1 p5, pC3 p10 — natural return accepted, no rewrite |
| C24-17 | FIXED | pC1 🧭 after solve «فقط بازنگریِ خودت — حل به نتیجه رسید» |
| C24-18 | FIXED | aC1 psy_item «برای این سن هنجارِ معتبر در دست نیست — معمایی پیشنهاد نمی‌شود» (new C25-17) |
| C22-2 | FIXED (not re-seen) | no statement-read-as-result in the 20 runs; s29 p7 «گزارشِ نوبتِ پیش» asks for result text instead |
| C22-5 | CHANGED | fixed s23 p12 (4 copies), s29 p13 (3 copies); still s22 p9 (typed step outcome), s25 p13 (check evidence) |
| C22-11 | STILL | s21 (rook guess refuted by her, 📜 «هنوز آزموده نشده»), s24, s28 |
| C23-5 | FIXED | s25 p15 — «۱۰⇐۸» leaves «✅ اثبات شد» |
| C23-13 | not re-judged | pC3 route labels not re-shot this round (class d: I did not review that shot) |
| age S3 (two confirmations, ISO to a child, «تو» to 81y, «از تاریخِ ثبت‌شده») | FIXED | aC1–aC4, s21, s25 — one confirmation, Jalali only, «تولدتان» for 67/81, s21 «از سنی که خودش گفت» |

## Territory loop — five arms

| arm | scenario | what came | page did | verdict |
|---|---|---|---|---|
| positive (two new areas) | tC1 #102 (day 6) | dc_market_sizing + dc_customer_validation in the scratch build, reply names both | «ابزارِ لازم آمد: اعتبارسنجیِ ایده با مشتری» (best fit), Today line, resume turn; she took the step | PASS |
| reply does not answer (not ruled out) | tC1 #102 (day 4) | pr_creativity | asked «این ابزارِ تازه همان است…؟ — خلاقیت»; no resume; her no ⇒ sys_fit false | PASS |
| sys_done | tC1 #101 | — | «از راهِ دیگری برداشته شد ✓» on 🔭 syscard | PASS |
| (a) area the diagnosis ruled out | tC1 #102 (day 3) | sc_persuasion (ruled out in «missing») | «⚠️ … جواب نداد — زیرِ برگه نوشتم و دوباره باز شد»; note «تشخیصِ افتراقیِ برگه همین را کنار گذاشته بود» | PASS |
| (b) generic words only | pwC1 #101 (day 3) | «یک ابزارِ تازه برای تغییر در مسئله‌ها…» | no resume, no «آمد»; lag line «⏳ … هنوز دیده نمی‌شود» (C25-19 S3) | PASS |
| system-self sheet never waits | pwC1 #102, oC1 #101, pwC2 #101/#102 | — | no ⏸, no «گام‌های منتظرِ برگه» | PASS |

Build simulation: tools/mkbuild.py writes tC1_build/learning-architecture.html (two areas added to SYS_TERR s_decision); the harness switches with __setPage after the routine reply in sheets/sh102.json. pwC1 used only a sheet reply (no build).

## Prior work (R8) — verdict table

| criterion | pwC1 (deep, engineering + territory) | pwC2 (multi-facet) |
|---|---|---|
| every prior step recognised with verdict + why | PASS p1 (✓/⚠️/✗/؟, why, dep 3←2) | PASS p1 (✓✓✗⚠️) |
| correct steps never re-asked | PASS | PASS |
| dependents of a wrong step marked | PASS (3 «وابسته به گامِ ۲») | n/a |
| resume point = first non-✓ step | FAIL in turn question (A191, C25-12); ledger resume stuck after her fix (C25-14) | same |
| «کارِ پیشینِ تو» in forms / 🧭 / 📜 with «درست است؟» | forms ✓ (buttons), 📜 ✓, 🧭 only dots + «طرح هنوز نیست» (C25-16) | forms ✓, 📜 ✓ |
| nothing rewritten without her yes | PASS (fix only via «آره») — but her own fixes never recorded (C25-14) | PASS |
| facets ordered | n/a | asked by the model (p1); page keeps the whole text as one statement |
| mind card credits correct prior steps | unclear | «اجرای طرح ۱/۲» (C25-18) |
| dispute ⇒ re-check with evidence | n/a | model re-checked with her numbers, no caving; page did not read the dispute (C25-13) |
| verified solution or exact sticking point | exact sticking point: steps 1–3 recomputed with 2.5 ha; step 4 waits for #101 | verified 9.2% (her own); other facets routed |
| correction of a datum prior steps used | FAIL (C25-15) | — |

Also: s25 p1 (prior on the opening): C25-1; s28/s29 openings got the block and behaved.

## Chat ⇄ page (R2)

- s28 p7, tC1 p3, oC1 p6/p9: stage from the chat story, plan steps from her list («۳ گام از ۳ گامِ طرحت (از گفت‌وگو)»), no stale u1 — PASS.
- pwC1/pwC2: forms carry «از گفت‌وگو: … درست است؟» and the prior ledger — PASS; 🧭 main line not built from prior steps (C25-16).
- s25 woken problem: u0 asked after she stated it (C25-5); «# وضعِ کنونی» vs live stage mismatch (C25-6); aC4 stage «اجرا» before a plan (C25-10).

## Corrections (R3) vs round 24

| scenario | trial | r24 | r25 |
|---|---|---|---|
| s22 p10–p12 | plan «امروز⇐شنبه»; «صبح⇐ظهر»; non-correction | pass; re-check dropped (C24-9) | pass; re-check is the turn Q |
| s22 p9 ✏️ | step report | typed outcome not asked | same (C22-5) |
| s23 p8 ✏️ «۳۵⇐۴۰» | — | why empty (C24-6) | why fixed |
| s23 p11–p12 | pan 35⇐30 | ok | ok + 4 copies asked + stale ۱٫۷۵⇒۱٫۵ |
| s23 p15 ✏️ two pairs | sugar/butter | guess corrupted | no corruption; wrong set-asides (C25-8), garbage stale (C25-4) |
| s25 p11 typo | 2·3·5⇐2·3·4 | note only | u-draft follows ✓; garbage stale (C25-4) |
| s25 p14 «۱۰⇐۸» | — | proof set aside (C23-5) | proof stays ✓; stale 11/12 garbage |
| s29 p12 «۴۰⇐۴۴» | — | ok | ok + stale list wrong (C25-4) |
| oC1 p7 «۱۵⇐۱۲» | — | drafts/destination stale (C24-11) | all follow ✓ |
| oC1 p16 «۱۲۰⇐۱۴۰» | typed d2 | asked | asked; «بله» applied + verdict set aside ✓ |
| pwC1 p11 «۲⇐۲٫۵ هکتار» | NEW (prior work) | — | only chat statement (C25-15) |

## Owner question bank 17–24

| # | verdict | where (evidence) |
|---|---|---|
| 17 when does a sheet get answered, how will I know | هست (بی تاریخ) | pwC1 p7: urgent queue every 3 h / full Sun-Wed; ⏸ on 🔭/🧭/📜; «🛎 ابزارِ لازم آمد» in Today; honest «no date» |
| 18 where does the mind card show over-confidence | نیست (برگه) | pwC2 p6–p7: «فراشناخت» row empty after her 80% refuted guess; sheet #101 (caveat: my guess_res named g1 not g2 — class d) |
| 19 one place for everything I said | هست | pwC2 p13–p14: «📜 پروندهٔ این گفت‌وگو» + «📜 پروندهٔ کامل» (prior ledger, data, result) + «از کجا؟» |
| 20 wearable sleep data | نیست (برگه) | pwC2 p11: sheet #102 |
| 21 untested new tool — will you tell me | نیست (برگه) | pwC1 p8: matching only; sheet #102 (system-self, no waiting) |
| 22 unfit built tool — notice or «arrived» | هست | pwC1 p10 explained; evidence tC1 arms (a), mismatch-ask, pwC1 arm (b) |
| 23 self-intro first — still my problem | هست | pwC2 p15; s21 p1, aC1 p1 (C24-1 fixed); caveat C25-11 |
| 24 fix a number days later — every draft/form/map | partly | oC1 p8 everything follows; pwC1 p12 prior ledger + chat results do not (C25-15, sheet #103) |

## Class d (mine)

- Restart of all runs: real date 2026-10-25 vs round-24 day 1 2026-10-18 ⇒ every src c1 sets the dev clock to 2026-10-18.
- s29: sketch.png path (round3C) gone ⇒ restored from round24C drive copy; rerun.
- pC1 rerun: replayed understanding form filled d2/d3 before their rows existed ⇒ soft gate; c5 now adds the rows.
- oC1/tC1 re-scripts: user lines that reacted to round-24 bugs rewritten to what the page now shows (NOTES).
- s25 p9: auto-reused round-24 reply in «تو» to the 61-year-old; pwC2 p4: guess_res g1 instead of g2.
- s21 p3 and s25 p12: used the better reply for continuity (better/).

## Prompt scan

238 prompts (consultant prompts excluded): 0 with more than one question directive; 1 unmarked «بپرس» on the judge-unset line of s22 p4 (it is the only question; same as round 24).
