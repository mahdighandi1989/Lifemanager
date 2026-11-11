# defects — group B control run, round 26

Ids: B26x·Dn = new this round (D3 not assigned); B25·Dn / B24·Dn = earlier-round ids re-tested. Class (b) = page/system, (c) = parser. Evidence p<N>/c<N>/s<N> refer to each scenario folder (ai/pN.json, ctl, out/sN.json, post.txt).

## S1
- pwB2 · S1 · (b/c) B26x·D19 page arithmetic reads CORRECT products as wrong when a unit word follows: c18 «۳۵ × ۱٫۴ = ۴۹ میلیون», «۲۵ − ۱۸ = ۷ میلیون» ⇒ p9 «✗ «۳۵ × ۱.۴» را «۴۹ میلیون» نوشته — حسابِ صفحه: ۴۹», «✗ «۲۵ − ۱۸» را «۷ میلیون» نوشته — حسابِ صفحه: ۷» (the page's own value equals hers). The literal coach relayed the ✗ (p9) and he had to protest (c19); the page then gave the stuck-step question «این گام جواب نداد…» (p10) and offers no way to see that the mark was the page's error (owner #36 «نیست»). The real slip «۲۱ × ۱۲ = ۲۴۲» (252) was caught; 49 ÷ 18 ≈ 2.72 ✓; fraction sum «۱ = ۱/۲ + ۱/۳ + ۱/۶» unread (silent); date 1405/1/15 and score 18/20 ignored (correct).

## S2
- s17 · S2 · (b) B26x·D5 stale-number engine marks her FACTOR as a result: c36 «بام ۱۸۰ نه ۲۰۰» ⇒ sys «✓ اصلاح شد: نتیجهٔ «۰.۷» دیگر برقرار نیست — بر «200 m^2» بنا بود — با «۱۸۰ مترمربع» دوباره حساب شود» (p8 «نتیجهٔ صفحه» changed[0] rec «نتیجهٔ «۰.۷»»). ۰.۷ is her chosen collection factor (data), not derived from the area; the derived numbers (۲۴، ۱۶.۸، ۱۷) are not named. P4 «only numbers really derived».
- s19 · S2 · (b) B25·D10 CHANGED: c81 «۱۸ هفته نه ۱۶» no longer touches her goal «۸» kg (improved) but marks her MEASURED loss «۳٫۵» (c40 «۳٫۵ کیلو کم کردم») stale and proposes «۳٫۵ ⇒ ≈ ۳٫۴۴۴» — not a recomputation of anything (C11: a proposed value must be the page's correct recomputation; P4: never her measured results). «۰٫۵ ⇒ ≈ ۰٫۴۴» (8/18 kg a week) is right.
- pwB1 · S2 · (b) B26x·D14 a datum correction does not reach the prior ledger or the chat result chain: c21 «اختلافِ ارتفاع ۱۸ متره نه ۱۵» ⇒ statement/datum/draft changed, but p13 ledger still «۵ گام — ۵ درست · همه درست» with every step on 294300 J (15 m), and the chat results 5886 s / 6131 s (102 min) are not marked stale (RUNNER26 2c, C25-15 STILL).
- pwB1 · S2 · (b) B25·D9 STILL (pwB1): after the p8 sub-result («… حدودِ ۹۸ دقیقه» with two options still open) p9 «# وضعِ کنونی … مرحله: بازنگری».
- pwB2 · S2 · (b) B25·D3 (pwB2) STILL in the page: the dispute by meaning «مادرم معیار نیست … چرا میگی معیارِ جاافتاده‌ست؟» (p2) gets A073 «خودت فکر می‌کنی چرا؟ … توضیحِ آماده را نده» instead of the dispute re-check question; the re-check reached the ledger only through the model's report.
- aB3 · S2 · (b) B25·D9 STILL (aB3): after her sub-result «سالی حدود ۳۰ میلیون، یعنی ماهی دو سه میلیون» (p5), p6 «# وضعِ کنونی … مرحله: بازنگری» and the page suggestion «نتیجه را با واقعیت سنجیدید…» before any plan.
- tB1x · S2 · (b) B25·D9 STILL (tB1x): p7 «مرحله: بازنگری», 🧭 «حل به نتیجه رسید» after two sub-results (tB1 p7 same prompt stage; its live strip stays «طرح»).
- oB1 · S2 · (b) B26x·D35 statement correction «دو روز ⇒ سه روز» (p4): retract ok:true but «changed: []» and «از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود» though the statement came from that message (src u2 stmt); 📜/فرمِ فهم keep «دو روز».
- oB1 · S2 · (b) B26x·D33 = B25·D12 CHANGED: wake-up plan+done copied into dinner AND exercise 📜; wake-up result «۴ از ۷» on dinner's 🧭; dinner guess (return by naming p23) filed in exercise.

## S3
- s11 · S3 · (b) B26x·D1 copy-apply keeps a stale derived number in her datum: c49 sys line itself lists «۱۰۰ ⇒ ۶۴» as stale, but after her «بله، این‌جا هم» (c54) the data field reads «صفحهٔ ۸×۸ (۱۰۰ خانه)» (📜 «اصلاح شد ⇐ «صفحهٔ ۱۰×۱۰ (۱۰۰ خانه)» → «صفحهٔ ۸×۸ (۱۰۰ خانه)»»). Session/chat title stays «دومینو روی صفحهٔ ۱۰×۱۰» (📜 «گفت‌وگوهای این مسئله»).
- s11 · S3 · (b) B25·D16 STILL: c49 ask list «صورتِ مسئله», «صورتِ مسئله», «فهمِ مسئله — کلِ مسئله در یک جمله».
- s11 · S3 · (b) B25·D26 CHANGED: p2 arithmetic block ✓ both sums; the p2 prior report (98 ✓ 49 ✓ «حتماً جواب داره» ✗) is not merged (ledger = only p1's backtracking step, probe), no «کارِ پیشینِ تو» in the live problem's 🔭/📜; mind card books the incomplete backtracking step as «−» and credits neither correct count.
- s12 · S3 · (b) B26x·D2 register in «امروز» for a «شما» elder (67): static page lines «نمی‌دانی از کجا شروع کنی؟ دوره قدم‌به‌قدم می‌بردت»، «پیشرفتت اینجاست»، route strip «مانده: فقط بازنگریِ خودت» beside «با فکرِ خودتان» on the same view (post TODAY). P6 «page-written lines follow her register».
- s20 · S3 · (b) B26x·D4 C12 date reader false positive: c1 «۸ ماهه می‌خوام نشون بدم …» (= "for eight months I have wanted to show") ⇒ sys «📅 از حرفِ خودت: «۸ ماهه می‌خوام نشون بدم…» — جمعه ۱۸ تیر ۱۴۰۶ — در «امروز» بیاید؛ درست است؟». A duration in the past read as a future date (a41/a27 PR.herDates).
- s17 · S3 · (b) B25·D27 STILL (same mechanism as B26x·D1): after her «بله» the «ریاضی‌کردن» field reads «حجم = ۱۸۰ مترمربع × ۰٫۱۲ متر × ۰٫۸ = ۱۹ متر» — the stale «= ۱۹» (180×0.12×0.8 = 17.28) and the factor ۰٫۸ she had already corrected to ۰٫۷ with ✏️ both stay.
- s17 · S3 · (b) B26x·D6 running sum with a unit between not read: c44 «V = … = 21.6 مترمکعب، با ۲ مترمکعبِ آبِ چاه میشه ۲۴٫۶» (exact 23.6) — no line in p8 «# حسابِ صفحه» (the ✗ on 21.6 × 0.7 = 16.12 → 15.12 and the ✓ on 180 × 0.12 were right; date 1405/12/15 correctly ignored).
- s17 · S3 · (b) B26x·D7 C12: her «قراره تا ۱۴۰۵/۱۲/۱۵ تمومش کنم» booked as «موعد: ۱۵ اسفند ۱۴۰۵» straight from coach_state.plan, no «… درست است؟» from the page, no yes from her (fixer «Not done» confirmed).
- s18 · S3 · (b) B26x·D8 arithmetic with π never checked: c27 «dy/dt = −6·9/(144π) = −54/(144π) ≈ −0.37» (exact −0.1194) passes silently — no «# حسابِ صفحه» block in p10; only the coach (replayed reply) asked her to re-check. The correct c6 «−5·9/(144π) = −45/(144π) ≈ −0.1» is also unread. π is a constant, not an unknown (P2 «wrong work passed»).
- bp2 · S3 · (b) B25·D28 STILL: route strip at the end «اکنون: پیش‌نیازِ «تبدیلِ مترمکعب به لیتر (۱ مترمکعب = ۱۰۰۰ لیتر)» · مانده: فقط بازنگری» while the mind card lists both prerequisites «آموخته» (post 📜/🔭 strip, mind «پیش‌نیازهای آموخته»).
- bp2 · S3 · (b) B26x·D7 (same): her «هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش» booked «موعد: ۲۵ آبان ۱۴۰۵» straight from the model's plan.when — no «… درست است؟», and the page did not read «جمعه» from her sentence (the replayed date was a Monday, my replay shift; the page accepted it as given).
- s19 · S3 · (b) B26x·D9 C1 same-weekday: c44 «از شنبه … اولین جلسه شنبه» said ON a Saturday ⇒ booked «شنبه ۲۶ دی» with no «همین امروز یا شنبهٔ بعد؟» (asked only later on her ✏️, c57); c109 «تا جمعه» said ON a Friday (test clock, dow=5) ⇒ no question at all, plan pl1 booked 2027-02-26 from the model's report.
- s19 · S3 · (b) B26x·D10 weekday misread: c44 «اولین جلسه شنبه ساعت ۶ عصر» ⇒ «سه‌شنبه ۲۲ دی ۱۴۰۵» in the page's date line; the ✏️ follow-up line (c57) lists four overlapping fragments with nested quotes («[اصلاحِ پیامِ قبلی] …»).
- s19 · S3 · (b) B26x·D7 (same): c111 «وزن‌کشیِ بعدیم ۸ اسفنده» booked as pl2 (2027-02-27) from the model's report, no «… درست است؟»; c113 «جلسه‌ی بعدیِ مربی باشگاهم ۱۰ اسفنده» (her own stated date, model did not report) ⇒ the page did not ask either — so the «باشه» answer to the date question could not be exercised here.
- s19 · S3 · (b) B26x·D11 calibration count disagrees inside the mind card: 🏋 row «کالیبراسیونِ برگه‌ها و تمرین‌ها: ۲ پیش‌بینیِ داوری‌شده · درست ۵۰٪» while 📜 has three judged 🎯 (gym ✓, sweets ✗, weight ✗) and «⚫ نقطه‌های سیاه» counts «۲ بار از ۳ رخ نداد»; the sweets judgement is missing from the 🏋 calibration.
- bp1 · S3 · (b) B24·D15 STILL: c18 «x²−9 = (x−3)(x+3). درسته؟ با ضرب پرانتز هم چک کردم، x² + 3x − 3x − 9 میشه» ⇒ p11 «**پرسشِ این نوبت همین است:** ادعای محلِ بحث … «ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی؟»» — her expansion already proves the identity; the page reads «درسته؟» as an untested claim.
- pwB1 · S3 · (b) B26x·D12 a step fixed by her shows ✓ next to the stale dispute reason: ledger step 2 «✓ درست: «294300 ÷ 3600000 = 0.082 …» … · دوباره سنجیده شد (مربی): حکم ماند — … ۲۹۴٫۳ کیلوژول ≠ ۰٫۲۹ کیلووات‌ساعت» (📜 line 163, prompt p6+); and right after p4 the stored step kept her OLD quote with verdict ok (probe c9) until the next turn.
- pwB1 · S3 · (b) B26x·D13 a dispute by meaning on a dependent step is stored as a failed self-fix: c10 «گامِ ۵ … روشش درسته؛ … خودِ گام که غلط نیست» ⇒ ledger «متنِ تازه‌ات («گامِ ۵ رو که وابسته گفتی…») هنوز با حسابِ صفحه یا حکم نمی‌خواند — گام همان می‌ماند»; the model's re-check reason (method right, only the input stale) is not shown (C6).
- pwB1 · S3 · (b) B26x·D15 arithmetic slip labelled a unit error: p13 «✗ واحد (تقسیمِ ژول بر وات بی تبدیل به ثانیه): «۳۵۳۱۶۰ / ۴۸» را «۷۲۵۷» نوشته — … ۷۳۵۷٫۵» — J ÷ W is already seconds; the error is in the division.
- pwB1 · S3 · (b) B26x·D16 mind card credits a result the page itself marked ✗: «+ ۲۳ آبان · نتیجه‌ای که گفت — «با ۱۸ متر: … 353160 ÷ 48 = 7257 …»».
- pwB1 · S3 · (b) B26x·D17 correction line shows identical before/after: c21 «صورتِ مسئلهٔ گفت‌وگو: «برای باغِ پدرم … آبِ چاه رو بب…» (اصلاح شد ⇐ «برای باغِ پدرم … آبِ چاه رو بب…»)» — the truncation hides the changed number.
- pwB1 · S3 · (b) B25·D24 STILL: 🧭/form draft «داده: آخ… پمپ موقعِ کار ۴۹۰ وات می‌کشه» (an interjection-led inference imported as data).
- pwB2 · S3 · (b) B26x·D18 her own correct fix of step 4 not applied: c9 (p4) the new weighted sums (page ✓ on all three) with prior [{n:4,…ok}] ⇒ ledger still «ازسرگیری از گامِ ۴» at p5–p7 and the p7 page question re-asks step 4 «جای درنگ است … خودت این گام را دوباره وارسی می‌کنی»; applied only on the second report (p7).
- pwB2 · S3 · (b) B25·D24 STILL + comma split: 🔭/📜 data «داده: وزن‌ها هم جمعشون ۱۱۰ بود», «داده: درستش می‌کنم: حقوق ۳۰», «داده: مسکن ۲۰», «داده: شیراز = …», «داده: تهران همون ۶٫۳».
- pwB2 · S3 · (b) B26x·D16 (same): mind card «+ نتیجه‌ای که گفت — «حسابِ پول …»» for the message whose «۲۱ × ۱۲ = ۲۴۲» the page itself marked ✗.
- aB1 · S3 · (b) B25·D9 STILL (aB1, mild effect): after the sub-result «۱۰ تا … ۱۷۸ منهای ۱۶۸ میشه ۱۰» (p3, before any answer to the question) p4 «# وضعِ کنونی … مرحله: بازنگری» and the page's suggestion «می‌توانی نتیجه را وارسی کنی…».
- aB3 · S3 · (b) B26x·D20 post-check false positive on an elder: p14 reply all in «شما» («کردید … درصدی‌تان … ببرید») ⇒ «دو ضمیر در یک پاسخ («شما» و «تو») — کاربر سالمند است…» rewrite requested (p15; the rewrite changed only «پرداخت شد» → «دادید» and dropped the brackets, then passed); a26/a27 TOPOS25 / regSigns reads a «ـت»-ending word as «تو».
- aB3 · S3 · (b) B26x·D21 one commitment, two deadlines: her yes to the page's «📅 … «اولیش ۱ اردیبهشت» … درست است؟» booked «اولیش ۱ اردیبهشت», and the model's {"do":"deadline"} the same turn booked a second record «حسابِ دوبارهٔ پس‌انداز با عددهای واقعی» on the same date; after she reported it done (p14) Today still shows «⏰ «حسابِ دوبارهٔ پس‌انداز…» — موعدش گذشت؛ انجام شد؟» (deadline_done closed only the first).
- aB3 · S3 · (b) B26x·D22 a stated prediction never becomes a 🎯: «۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره» (p9) and later «پیش‌بینیم درست درومد» (p14) leave no 🎯 record and no calibration entry (post: 0 «🎯»).
- aB3 · S3 · (b) B26x·D14 (same): the salary correction 18 ⇒ 19 changes only the statement; the chat results «۱۸ × ۱.۲ = ۲۱.۶» and «کسری ۵.۷» are not marked stale.
- aB3x · S3 · (b) B25·D17 STILL: model action {"do":"birth","date":"1959-05-02"} ignored (page stores 1959-05-03 = ICU, correct), but the reply text shown to him «۱۲ اردیبهشت ۱۳۳۸ برابر است با ۲ مهٔ ۱۹۵۹» (wrong by one day) stays, with no page line and no post-check rewrite.
- aB4 · S3 · (b) B26x·D23 C12 «باشه» not read as a yes: the page asked «📅 از حرفِ خودتان: «فردا برای نوه‌م توضیح بدم» — پنجشنبه ۲۱ آبان ۱۴۰۵ — در «امروز» بیاید؛ درست است؟» (p1 turn); her next message «باشه.» (c6) booked nothing (no «✓ … ثبت شد» line; Today has no such entry) — fixer «Not done» confirmed.
- aB4 · S3 · (b) B26x·D24 self-introduction in a title: 🧭/Today strip «🧭 «معلم بازنشستهٔ جغرافیا. نوه‌م یه معما ا…»» (P6: long self-introductions stripped); and the strip says «مانده: فقط بازنگریِ خودت» to an 82-year-old in «شما» (B26x·D2).
- aB4 · S3 · (b) B24·D15 family: p9 after her own complete check (p6 «۲۳ + ۱۲ = ۳۵ سر … روی هم ۹۴. درسته!») the page turn question is «جواب را در شرط جای‌گذاری کنید — همهٔ شرط برقرار است؟».
- aB4 · S3 · (b) B25·D21 family: the page suggestion «پیش‌تر همین را — یا همین را به شکلِ کمی دیگر — دیده‌اید؟» stays for p2–p5 while she guessed, tested and adjusted (never answered, never dropped).
- tB1 · S3 · (b) B26x·D25 after the C5 take-back (p11 sys_fit true) the sheet #101 stays status "open" although its own note says «این گام دیگر منتظرِ این برگه نیست» (s28).
- tB1 · S3 · (b) B26x·D26 arrival line «سنجیدم که نیازِ گامِ … را جواب می‌دهد» (s23) rests on shared words only; next turn she found it «فقط یه فهرست کلی میده» (bank #39).
- tB1x · S3 · (b) B25·D23 family: chat problem title = opening «یه ایده دارم …», destination «از کجا شروع کنم؟».
- tB1y · S3 · (b) B26x·D27 tie answered by naming the other candidate («دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه») ⇒ fit=false for the first + a NEW ask for the one she chose; she must repeat «آره، گفتم که» (p11); reject line «(گفتی همان نیست)».
- tB1y · S3 · (b) B26x·D28 Today tie line names only the first candidate.
- tB1y · S3 · (b) B26x·D29 📜 keeps only the latest ❓ ask row; earlier asks (tech_history, patent_ir) vanish.
- tB1z · S3 · (b) B26x·D30 a piece waiting after closure (#102) has no Today line (closed problem ⇒ no 🧭 strip); only 📜 shows it, with «همین گام از سر گرفته می‌شود».
- tB1z · S3 · (b) B26x·D31 stale session steps after resume+closure: «(۳) پیشینهٔ اختراع (منتظرِ برگهٔ #۱۰۱) [todo]» (p13–p15).
- oB1 · S3 · (b) B26x·D32 page suggestion re-asks a stated prediction p6–p10.
- oB1 · S3 · (b) B26x·D34 «پیش‌بینیم ۵ بود، درست درومد» did not judge the booked 🎯.
- oB1 · S3 · (b) B25·D22 STILL lesson read as guess, quote emptied (p14).
- oB1 · S3 · (b) B25·D23 CHANGED guesses (refuted/confirmed) absent from the solved problem's 📜.
- oB1 · S3 · (b) B26x·D20 family plural «داشته باشید» flagged as «شما/تو» (p13); B26x·D21 family assistant deadline left open after 🎯 judged; B26x·D30 family waiting step of a closed problem not in Today.

## Fixed / positive (re-test of round-25 fixes)
- tB1 · FIXED B25·D1 (frame-word overlap ⇒ ask, s17), B25·D18 (different reasons s14/s15), B25·D19 (one ⏸ row in 📜).
- tB1x · FIXED B25·D19 (sys_done line + note).
- tB1y · FIXED B25·D1 (frame-word ask), B25·D18 (ask without reopen), tie asked naming both.
- tB1z · FIXED A25-22 (own waiting entry sw2 + sheet #102), B25·D19 (no 🧭 dup), three-area best fit.
- aB3 · INFO · the page's own date question «📅 از حرفِ خودتان: «اولیش ۱ اردیبهشت» — چهارشنبه ۱ اردیبهشت ۱۴۰۶ — … درست است؟» then «✓ به گفتهٔ خودتان ثبت شد» on her yes = C12 positive path PASS (her answer was «آره، ثبتش کن»).

## Round-25 defect table (B25·D1–D28)
| id | what (round 25) | round 26 | evidence |
|---|---|---|---|
| D1 | territory: unfit build declared arrived, her «نه» ignored (S1) | FIXED | tB1 s17 frame-word-only ⇒ «❓ … از تو می‌پرسم», p9 «نه» ⇒ waiting again; tB1y s14 «پیشینه»-only ⇒ ask; tie ⇒ ask naming both |
| D2 | prior-work opening ⇒ wrong turn question | FIXED | pwB1 p1, pwB2 p1 resume-point question |
| D3 | verdict dispute ⇒ A073 | FIXED pwB1 / STILL page-side pwB2 | pwB2 p2 «خودت فکر می‌کنی چرا؟» on «چرا میگی معیارِ جاافتاده‌ست؟» |
| D4 | new prior report replaces the ledger | FIXED | pwB1 p3–p13 merged batches |
| D5 | chained equalities misparsed | FIXED | pwB2 p1/p4/p7 ✓ |
| D6 | coach-facing chkM shown to her | FIXED | pwB1 🧭/📜 clean |
| D7 | dependency by number match | FIXED | pwB1 step 4 not dependent |
| D8 | RECALL22 early return | FIXED | pwB1 p5 |
| D9 | sub-result ⇒ look-back | STILL | pwB1 p9, aB1 p4, aB3 p6, tB1x p7 (🧭 «حل به نتیجه رسید»), tB1 p7 (mild); FIXED bp2 |
| D10 | stale over-reach on her goal | CHANGED | s19 c81: goal untouched, but her measured «۳٫۵» proposed «≈ ۳٫۴۴۴» (S2) |
| D11 | mind card no credit for correct prior steps | FIXED | pwB1/pwB2 MIND «از کجا؟» |
| D12 | new problem mid-chat bound to the old | CHANGED (S2) | oB1: plan+done of problem 1 copied into problems 2 AND 3; result «۴ از ۷» on problem 2; guess of problem 2 filed under problem 3 (B26x·D33) |
| D13 | prior block fires on non-prior text | FIXED | s15 p2, oB1 p20 |
| D14 | unit slips pass | FIXED | pwB1 p1 kJ⇒kWh ✗, bp2 p4 mm⇒m ✗ |
| D15 | self-fix of a judged step refused | FIXED | pwB1 p3 |
| D16 | elder register false positive | STILL s11 / FIXED s12 | s11 c49 ask list duplicates; family B26x·D20 (aB3 p14, oB1 p13 plural) |
| D17 | wrong conversion text left in reply | STILL | aB3x p2 «۲ مهٔ ۱۹۵۹» |
| D18 | identical ⚠️ lines; ask + reopen together | FIXED | tB1 s14/s15 different reasons; tB1y s14 ask only |
| D19 | duplicate waiting rows / 🧭 detours | FIXED | tB1 📜 one ⏸ row; tB1z 🧭 single detours; tB1x sys_done note |
| D20 | «# وضعِ کنونی» stage contradiction | FIXED | aB3, pwB1 |
| D21 | same page question repeated | FIXED (s18, bp2, s19) / family | aB4 p2–p5; oB1 p6–p10 prediction re-asked (B26x·D32) |
| D22 | lesson read as guess, quote emptied | STILL | oB1 p14 «فکر می‌کنم مشکل «» ست» |
| D23 | refuted guess «آزموده نشده»; destination = meta sentence | CHANGED | oB1: guesses vanish from the solved problem's 📜; tB1x destination «از کجا شروع کنم؟» |
| D24 | results/inferences imported as data | STILL | pwB1 «داده: آخ… ۴۹۰ وات»; pwB2 «داده: درستش می‌کنم: حقوق ۳۰» |
| D25 | greeting/self-intro as breadcrumb | FIXED (pwB1) / family | aB4 strip title «معلم بازنشستهٔ جغرافیا…» (B26x·D24) |
| D26 | prior never reaches later live problem | CHANGED | s11: prior batch of p2 not merged, no «کارِ پیشینِ تو» in live 🔭/📜 |
| D27 | stale derived value left after copy | STILL | s17 «حجم = ۱۸۰ … × ۰٫۸ = ۱۹ متر» |
| D28 | strip keeps a learned prerequisite open | STILL | bp2 strip «اکنون: پیش‌نیازِ …» while mind card «آموخته» |
| B24·D15 | own complete check ignored («با ضرب پرانتز هم چک کردم») | STILL | bp1 p11; aB4 p9 family |
