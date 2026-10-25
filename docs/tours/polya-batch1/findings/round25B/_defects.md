# Round 25 — runner B — defect catalogue (B25·Dn) + round-24 defect table
Build main 64dc0667 (`build.py --check` in sync; dist 12:20 after the 12:19 merge). Harness harness5.js (+ tools/harness5s.js for scratch pages), driver tools/drv25b.py (replays round24B/<sid>; reuse by her turn text; new replies as the literal average model where round 25 asks for something new). Turn ids pN = <sid>/ai/pN.json; sN = <sid>/out/sN.

## S1
- **B25·D1** (b, R1) Territory loop: an unfit build is declared arrived and her rejection is ignored. tB1 +4 d, scratch page with ONE new area `pr_market_scan` «بررسیِ بازار و رقیبان» + routine reply ⇒ «🛎 ابزارِ لازم آمد … — سنجیدم که نیازِ گامِ «(۳) پیشینه…» را جواب می‌دهد؛ همان گام را از سر می‌گیریم.» (s17), Today «🛎 … همان گام را از سر بگیر». Shared words «ایده» (sheet title) and «جایگاه» (from the VIEW name «💡 جایگاهِ ایده» inside the sheet's own «دقیقاً چه کم است») — the R1 generic list misses scaffolding words. No ask. p9 page turn question «همان گام را با آن چطور برمی‌داری؟»; her «به کارِ گامِ سوم نمیاد» + sys_fit false ⇒ state **resumed**, sheet stays «answered», no note, Today line gone; 📜 «↩ گامِ «(۳)…» از سر گرفته شد — با ابزارِ «بررسیِ بازار و رقیبان»» (s19). a44 rank/negFree/generic + sysFit only for a pending ask.

## S2
- **B25·D2** (b, R8) Prior-work opening ⇒ wrong turn question: pwB1 p1 («… فکر کنم تمومه») and pwB2 p1 («… درسته؟») get «**همین پیام حدس است، نه نتیجه** … «درست است/نه» نگو … چطور می‌آزمایی‌اش؟» while the same prompt's «# کارِ پیشینِ تو» says resume at the first non-✓ step and name the wrong step with evidence. a27 guess detector outranks a45 priorTurnQ on the opening.
- **B25·D3** (b, R8) Verdict dispute ⇒ A073: pwB1 p2 «نه، گامِ ۲ درسته … چرا میگی غلطه؟» and pwB2 p2 «مادرم معیار نیست … چرا میگی…؟» get «خودت فکر می‌کنی چرا؟ … توضیحِ آماده را نده» instead of a re-check with evidence (the page could compute 1 kWh = 3.6 MJ itself). pwB2's dispute has no leading «نه» ⇒ not registered at all (NO24 regex). a27 whyAsk / a45 priorReply.
- **B25·D4** (b, R8) Every new `prior` report REPLACES the ledger (a45 onState `E2.prior = pr24`, live `LP.prior = cp`): pwB1 p3 ⇒ «۲ گام — ۲ درست · همه درست» and priorTurnQ «همهٔ گام‌های پیشینت درست درآمد» while step 5 is still wrong; 🔭 «کارِ پیشینِ تو» after live_new shows ONE step (pwB1 s13), at the end the last batch only (pwB1 s21, pwB2 s12/s19); the opening verdicts, the dispute and the fixes vanish from forms/prompt (📜 keeps all batches). bp2 p7 same. With no new report the ledger never moves (s20 p4–p5 «ازسرگیری از گامِ ۱»/«نسنجیده» after her 38/40 test). A judged wrong step is marked «fixed» only via a bare «آره».
- **B25·D5** (c) arithChk misparses chained equalities «a×b + … = 3.6 + 2.4 + … = 8.7»: pwB2 p1/p4/p7 ⇒ «حسابِ «۰.۴ * ۹ + …» با عددِ نوشته‌شده («۳.۶») نمی‌خواند؛ حسابِ «۲.۴ + ۱.۵ + ۱.۲» … («۸.۷») نمی‌خواند» on CORRECT sums, forces ✗ over the model's ✓, and the final resume tells him «گامِ ۱ … جای درنگ است … کجایش می‌لنگد؟».
- **B25·D6** (b) Coach-facing chkM shown to the person: 🧭 tooltip (pwB1 s4.png) and 📜 «(حسابِ صفحه: ۰.۲۹ / ۰.۵ = ۰٫۵۸، نه ۰.۵۹ (عددِ درست را لو نده))» (pwB2 the same) — value and internal instruction leak. a44 route tip / a40 dossier read `priorLines` (chkM||chk).
- **B25·D7** (b) Dependency by number match: pwB1 step 4 (✓, uses the correct 294300 J of step 2) auto-marked «وابسته به گامِ ۲» (dep added by `said` number match though the wrong part was the kWh).
- **B25·D8** (b, R2/R8) AS.RECALL22 («یادم … رفت») makes a45 onState return early: pwB1 p5 «… یه چیزی هم یادم رفته بود: اصطکاکِ لوله …» — the turn's prior/result/plan are dropped; p6/p7 page question still «توانِ لحظه‌ای هنوز سنجیده نشده: چه چیزی کم دارد؟» two days after she found it.
- **B25·D9** (b, R2) Sub-result ⇒ look-back STILL: pwB1 p4 «مرحله: بازنگری» after a step-3 result; bp2 p5/p7 after the intermediate m³ (same as round 24).
- **B25·D10** (b, R3) Stale-derived over-reach: s19 c81 «۱۸ هفته نه ۱۶» marks her GOAL «۸» kg «عددهای حساب‌شده از «۱۶ هفته»: «۸، ۲» — کهنه … (۸ ⇒ ۱۰)» and sets aside her weigh-in «۷۴٫۵ بود نه ۷۴. پس ۳٫۵ کیلو کم کردم نه ۴» («بر «۱۶ هفته» بنا بود»).
- **B25·D11** (b, R8) Mind card does not credit her correct prior steps: pwB1/pwB2 «از کجا؟» lists only «طرحی که گفت / نتیجه‌ای که گفت» (no prior events); s15 instead books a teacher's anecdote as «اجرا −» ×2.
- **B25·D12** (b, bank #16) New problem mid-chat bound to the old one: oB1 p22 «یه مسئله‌ی دیگه هم دارم … شام … خوابم نمی‌بره» ⇒ «داده (از گفت‌وگو)» on the wake-up problem's 🧭 main line (s23 TWO-PROBLEMS); «# وضعِ کنونی» keeps the old problem.

## S3
- **B25·D13** prior block (WORK24, two sentences with «بعد/پس/…») fires on non-prior text: s15 p2 classroom anecdote, oB1 p20 a pure question, and mid-solve step reports in most math runs (bp1 p6–p8, bp3 p5–p11, aB2 p3–p6, s18 p5/p8 …).
- **B25·D14** page unit check: kJ⇒kWh (pwB1 p1) and mm⇒m (bp2 p4) slips pass; the her-facing line «حسابِ عددی‌اش را صفحه سنجید: درست — پس نادرستیِ این گام (اگر هست) از جای دیگری است» beside ✗ (pwB1, bp2, bp3 p9); rounding flagged (0.29/0.5 = 0.58 vs her 0.59 from 0.294).
- **B25·D15** self-fix of a judged step: pwB1 p3 retract refused «نشانهٔ اصلاح … نبود»; 📜 ««0.082…» (اصلاح شد ⇐ …) / صفحه نپذیرفت»; 🧭 draws the refused retract as a back-jump. pwB2 p3 accepted but «چیزی در صفحه ثبت نشده بود» though the ledger held that step.
- **B25·D16** s12 p10 elder register post-check rewrite on «عالی. وارسی؟» (no second-person form).
- **B25·D17** aB3x p2: page keeps its parse (1959-05-03) but the assistant's text «… برابر است با ۲ مهٔ ۱۹۵۹» stays, no page line.
- **B25·D18** territory chat lines: ⚠️ mismatch line identical each time, no reason for her (tB1 s14–s16); tB1y: the ask and a mismatch note + reopen in the same pass (two outcomes).
- **B25·D19** duplicate waiting rows: 📜 two «⏸ منتظرِ برگهٔ #۱۰۱» («رسید» / «منتظر») (tB1), 🧭 detour ×2 (tB1z).
- **B25·D20** «# وضعِ کنونی» «مرحله: فهمِ مسئله» vs live block «اجرا روی واقعیت» in the same prompt (pwB1 p7, aB3 p11–p14, tB1 p9).
- **B25·D21** the same live page question repeated: s18 p13–p15, bp2 p8–p12 (incl. ✏️ p10, self-label p12), s19 p8–p14/p16.
- **B25·D22** oB1 p14 her LESSON «درسم: وقتی فکر می‌کنم مشکل «اراده»ست …» ⇒ «همین پیام حدس است … («فکر می‌کنم مشکل «» ست …»)» (lesson as guess; quote emptied) — also in round 24, unreported.
- **B25·D23** oB1 🧭: refuted «اراده» guess still «آزموده نشده»; destination = his opening meta-sentence.
- **B25·D24** importer takes results/inferences as data: pwB2 «داده: شیراز = … = ۷٫۷»، «داده: تهران همون ۶٫۳»; tB1 «پس ۰.۳ گرم یعنی ۳ تا پله»; aB3 «پس سالی حدود ۳۰ میلیون».
- **B25·D25** pwB1 breadcrumb «↩ برگرد به «سلام. من نگارم، مهندس تأسیساتم…»» (greeting/self-intro in a title).
- **B25·D26** s11 p2 prior never reaches the later live problem (📜/🔭) and leaves the prompt from p3.
- **B25·D27** s17 p8 changed «ریاضی‌کردن» field keeps the stale «= ۱۹ متر».
- **B25·D28** bp2 final strip «۱ پیش‌نیازِ باز تا برگشت به خط» while the mind card lists it learned.
- (class d, not a defect) tB1z 📜 dates «🛎 ابزارِ لازم آمد» under ۳ آبان: my harness restart — the scratch page notices the registry change on load before my ctl advances the clock.

## Round-24 defect table (B24·Dn)
| id | verdict | evidence |
|---|---|---|
| D1 birth card forms | FIXED | aB1 s3 «96/2/30» ⇒ 2017-05-20; aB2 s3–s4 «۱۷ اسفند» + «88» ⇒ 2010-03-08; aB2f s2 «17 Esfand 1388» |
| D2 chat ⇄ page two stories | CHANGED | aB3 p11/p12 no unknown re-ask, live stage «اجرا روی واقعیت»; but «# وضعِ کنونی» still «فهمِ مسئله» (B25·D20); aB4 chat_solved still imports only the statement (u/dl/c empty) |
| D3 comma-split plan | FIXED | tB1z 🧭 main line cunk/cdata/cres only; pwB2 plan = one entry |
| D4 re-check demoted | FIXED | s18 p10 turn question «با مقدارِ اصلاح‌شده … دوباره وارسی کند» |
| D5 weeks vs day | FIXED | s19 c81 «(«۱۸» به‌جای «۱۶»)»; new over-reach B25·D10 |
| D6 ISO / duplicate birth line | FIXED | every confirmation Jalali only, once (aB1, aB2, aB3x, s11, s12, pwB1, pwB2) |
| D7 model ISO override | FIXED | aB3x stored 1959-05-03 despite {"date":"1959-05-02"}; text issue B25·D17 |
| D8 «از تاریخِ تولدِ ثبت‌شده» | FIXED | aB4 p1 «از سنی که خودش گفت؛ تاریخِ تولد هنوز ثبت نشده» |
| D9 false promises | FIXED | no promise block in s13 p7, aB4 p9–p11 |
| D10 quote false positive | FIXED | s11, bp1: no rewrite at the old p3/p4 |
| D11 forced «تو» on elder | FIXED | aB4 no rewrite at old p8; p9/p11 «شما» asked (legit) |
| D12 turn-question fit | CHANGED | FIXED oB1 p8, aB4 p9–p10 (asked on the new result); STILL two questions s13 p7, s19 p5–p7/p15, aB3 p13; s18 p4 dangling + p16 contradiction STILL; tB1z p9 «همان «پیش‌نیاز»» label STILL |
| D13 exam asked after reported | FIXED | s14 s43–s45 |
| D14 chat guess outcomes | CHANGED | FIXED aB2 «تأیید شد», tB1z «رد شد», aB4 «رد شد», pwB1 «رد شد»; STILL oB1 route «آزموده نشده» (B25·D23) |
| D15 her check read as guess | CHANGED | bp1 p11 now «ادعا … ثابتش می‌کنی یا …» — still asks to prove what she checked |
| D16 correction display | CHANGED | FIXED s17 why/duplicate; STILL s11 «صورتِ مسئله» ×2, aB3 📜 two arrow forms |
| D17 stale derived numbers | FIXED | s11 s49 «کهنه پس از اصلاح … (۱۰۰ ⇒ ۶۴ …)» |
| D18 route/dossier order+dup | CHANGED | FIXED aB4 sys line; STILL aB4/aB2 route duplicates, tB1 📜 duplicate waiting rows (B25·D19) |
| D19 loop details | FIXED | built list from reply only (tB1 s14); sys_done line + sheet note (tB1x) |
| D20 triple stuck | FIXED | bp2 «… · در ۳ نوبت» |
| D21 «خوبه؟» as plan / strip | CHANGED | plan FIXED (s15 p6); strip «اکنون: طرحِ نقشه … مقصد: چیکار کنم؟» |
| D22 import of correction msg | CHANGED | message not imported; fragments/inference remain (B25·D24) |
