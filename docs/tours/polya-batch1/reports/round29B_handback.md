# دورِ ۲۹ · گروهِ B — گزارشِ نهایی (runner)

32 runs on main e0e26045 (dist in sync, `build.py --check` OK): the 30 round-28 B scenarios replayed with the round-28 controls and model answers (prompt-signature diffs logged and reviewed) + 2 new arm scenarios (nB2: T21–T25; dB2: T26–T27, U56, bank 66/67). All 32 judged, findings UTF-8-checked, DONE written, 32 e-mails sent to the owner (ids in round29B/sent.txt). Totals: **11 PASS, 21 FAIL; 1 S1** (B29·D11, nB2: the prior ledger rejects her correct «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰»); 13 S2; round-28 S1 B28·D1 FIXED. Browser profiles deleted; all own PIDs exited.

## 1. Per scenario: RESULT, defects (p<N>, family), ارتقای لازم
### s11 — برنامه‌نویسِ ۱۹ ساله و دومینوی صفحهٔ بی‌دوگوشه
RESULT: FAIL — 3 S3
- s49 — U35 (S3, c, new (repeat since R26)): ask list «این‌جا هم عوض شود؟» names «صورتِ مسئله» twice
- post 📜 — B25·D26 (S3, b, new (repeat since R25)): correct prior counts (98, 49) never credited in either live problem
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: پلِ «کارِ پیشینِ تو» از دفترِ گفت‌وگو به مسئلهٔ زنده‌ای که از آن ساخته شد.

### s12 — بانوی ۶۷ ساله و جدولِ روزنامه
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### s13 — کارمندِ ۳۳ ساله و همکاری که فاکتور را بیشتر می‌نویسد
RESULT: FAIL — 1 S3
- c28 (p6) — B29·D1 (S3, c, F14 repeat): the page line in her chat shows raw record ids: «… (it1_o4sv) · …» and «… (it1_drm4) · …» after list_add (also present in r28, unbooked)
ارتقای لازم: شناسه‌های درونی هرگز در خطِ صفحه برای او.

### s14 — دانشجوی ۲۰ ساله و «کدوم فرمول کی» (آمار)
RESULT: FAIL — 4 S3
- s17 — B26·D3 (S3, b, F6 repeat): deadline booked without her yes and the same date asked in the same turn
- p3 — U26 (S3, b, new (repeat since R26)): «۱ + ۰.۳ … یعنی تقریباً ۱.۳» unread
- post 📜 — B27·D7 (S3, b, F11 repeat): packet-problem lines, the n−1 question and the practice result «۴۰٪» filed under «میانگینِ ۳۶ …»
- post 📜 — B28·D16 (S3, b, F3 repeat): no page ✓/✗ beside her «کارِ تو» arithmetic lines (−28/4 = −7, 1.3) although other runs now show them
ارتقای لازم: پنجرهٔ 📜 هر مسئله از صورتِ خودش؛ ✓/✗ کنارِ هر سطرِ حسابِ او.

### s15 — ژیلا، معلمِ ریاضی، و کلاسِ ساکت
RESULT: PASS
- (no defects)
ارتقای لازم: دفترِ آزمایشِ کلاس.

### s16 — پدر و باغچهٔ دخترش
RESULT: PASS
- (no defects)
ارتقای لازم: کارتِ «پرسش برای بچه».

### s17 — باغدارِ ۵۲ ساله و مخزنِ آبِ باران
RESULT: FAIL — 2 S3
- post — U38 (S3, b, F8 repeat): the proposed «ریاضی‌کردن» line keeps the old ۰٫۸ factor
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: یک قراردادِ پیکان برای همهٔ سطرهای تاریخچه.

### s18 — نوجوانِ ۱۸ ساله و قیفِ مخروطی
RESULT: FAIL — 3 S3
- p10–p16, post strip — B28·D13 (S3, b, new (story stage)): after her re-check and look-back the strip still says «اکنون: اجرای طرح · مانده: نامعلوم — طرح هنوز نیست»
- c45 — B29·D1 (S3, c, F14 repeat): raw ids «(it1_i5hd)», «(it1_56fj)» in the page line after list_add
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: وارسیِ دوبارهٔ او مرحله را به بازنگری برگرداند.

### s19 — ۳۶ ساله و ۸ کیلو تا عروسیِ برادر (۱۸ هفته)
RESULT: FAIL — 1 S2 + 4 S3
- c77 (p13) → post — B29·D4 (S2, b, F4 repeat): clear outcome «دیروز یکشنبه رفتم باشگاه! خسته شدم ولی رفتم، همون که پیش‌بینی کرده بودم» ⇒ «جلسه ثبت نشد … کدام؟» listing three (one is not a forecast, two are the same forecast); later the NON-forecast 🎯 «می‌خوام ببینم پیش‌بینی‌هام چقدر درست درمیان…» is settled «شد», the real 🎯 «جلسه‌ی اول خسته می‌شم ولی می‌رم» stays open and the practice session is lost ⇒ mind card T24 «۰ از ۲ درست، Brier ۰٫۵۰۰، بیش‌اطمینانی +۷۰» (r28: ۱ از ۲, Brier ۰٫۲۲۵)
- c? (p8), c81 — B29·D5 (S3, b, F4 repeat): a 🎯 made from her wish sentence «می‌خوام ببینم پیش‌بینی‌هام چقدر درست درمیان — مثل همین « » …» (the counter stripped inside her quote); «شد یا نشد؟» asked on the correction message c81
- post 📜 — B27·D11 (S3, c, new (repeat since R27)): correction header misstates the change
- post 📜 — B27·D4 (S3, b, new (repeat since R27)): her plan text with ZWNJ stripped («هفته ای … می رم»)
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: سرانجامِ 🎯 فقط از جملهٔ نتیجهٔ همان پیش‌بینی؛ جملهٔ آرزو هرگز پیش‌بینی نیست.

### s20 — پژوهشگرِ گامای E–I–PV
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### bp1 — ۱۵ ساله و n²−1 بخش‌پذیر بر ۸
RESULT: FAIL — 1 S3
- p11 — B24·D15 (S3, b, new (repeat since R24)): turn question ignores her own check (expansion) in the same message
ارتقای لازم: پرسشِ نوبت وارسیِ خودِ او را نام ببرد و فقط از کلیت بپرسد.

### bp2 — کشاورزِ ۴۸ ساله و آبِ بارانِ پشت‌بام
RESULT: FAIL — 4 S3
- post strip — B27·D6 (S3, b, F8 repeat): stale mark not cleared after his redo
- s29 — B26·D12 (S3, b, new (repeat since R26)): self-label line names the wrong prerequisite
- post 📜 — B28·D15 (S3, c, F4 repeat): stale line garbled «(۷ ⇐ ۷٫۵،» (اصلاح شد ⇐ «۷٫۵،»)، «۷۰۰۰ ⇐ ۷۵۰۰)»» and the 🎯 text is only «هشتاد درصد مطمئنم»
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: متنِ 🎯 خودِ پیش‌بینی را بگوید؛ بازحسابِ او نشانِ کهنه را بردارد.

### bp3 — نردبان و سه پیش‌نیازِ تودرتو (۱۴ ساله)
RESULT: FAIL — 1 S3
- s19 — B26·D12 (S3, b, new (repeat since R26)): self-label line names the wrong prerequisite
ارتقای لازم: خطِ «این کم‌هوشی نیست» دلیلِ خودِ او را نقل کند.

### aB1 — آوا، ۹ ساله، و اتوبوس‌های اردو
RESULT: FAIL — 2 S3
- p9 — B26·D16 (S3, b, new (repeat since R26)): birth sentence already stored: no page line
- p5 — U26 (S3, b, new (repeat since R26)): «۴۲ ضربدر ۵ … ۲۱۰» unread (ellipsis between factor and product)
ارتقای لازم: کارتِ «ضرب کن ببین همه جا می‌شن؟» برای کودک.

### aB2 — ۱۶ ساله، استقرا و «چرا» ی جمعِ فردها (بازنگری)
RESULT: FAIL — 1 S2 + 1 S3
- post 📜 — B27·D7 (S2, b, F11 repeat): problem 2 «1+3+5+…+99» carries problem-1 chat entries dated ۳ آبان; problem 1 lacks «پرسشی که کمک کرد» and taste
- post 📜 — B24·D18 (S3, b, new (repeat since R24)): «فرمِ فهم» listed after the results
ارتقای لازم: پنجرهٔ 📜 هر مسئله از صورتِ خودش.

### aB2f — نوجوانی که جمعِ فردها را خودش می‌خواهد حل کند
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### aB3 — بازنشستهٔ ۶۷ ساله و پس‌انداز (شش ماه)
RESULT: FAIL — 5 S3
- p15 — U26 (S3, b, new (repeat since R26)): «۲۰ درصدِ ۳۰۰ میلیون رو بذارم طلا، میشه ۶۰ میلیون» unread and filed in 📜 as «داده»
- post 📜 / form — B29·D2 (S3, b, new (story ownCalc28)): her forecast sentence «۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره» filed as «داده (از گفت‌وگو)» and in the draft form as «داده: …»; no 🎯 line in 📜
- post strip — B29·D3 (S3, b, new (surface register guard)): register flip for a 67-year-old «شما» user: strip «فقط بازنگریِ خودت … 🔭 برگرد به مسئله» beside «برگردید / حسابِ شما / آمدید» on the same page (r28: «خودتان / برگردید»)
- post 📜 — B25·D24 (S3, b, new (repeat since R25)): data rows are sentence fragments («ولی حقوقم هر سال فقط حدود ۲۰ درصد») plus the whole sentence again
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: هر «N درصد مطمئنم» با نتیجهٔ آینده فقط 🎯، نه داده.

### aB3x — بازنشسته — تاریخِ تولد در گفت‌وگو
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### aB3y — بازنشسته — تبدیلِ نادرست در متنِ پاسخ
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### aB4 — مادربزرگِ ۸۲ ساله و معمای مرغ و خرگوش
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### oB1 — کاربرِ مالک‌مانند: بیداریِ ساعت ۶، شام و سه مسئله (چندروزه)
RESULT: FAIL — 1 S2 + 3 S3
- post 📜 — B26·D31 (S2, b, F8 repeat): closed wake-up problem: «حکمِ وارسی: شاید» and «حل شد» stand unmarked after 5⇒4
- c16–c17 — B27·D14 (S3, b, F13 repeat): questions about the page counted as a chat problem (offered as a ↪ destination)
- post 📜 — B27·D7 (S3, b, F11 repeat): wake-up result «شد ۵ روز» and «گفته بودم ۶ روز با ۷۰ درصد…» (۲۲ آبان) filed under dinner
- post 📜 — B29·D2 (S3, b, new (story ownCalc28)): forecast sentences filed as «داده (از گفت‌وگو)»: «پیش‌بینیم: ۵ روز از ۷ موفق؛ ۶۰ درصد مطمئنم.», «پیش‌بینیم ۶ روز از ۷ ـه، ۷۰ درصد مطمئنم.», «پیش‌بینیم: هر ۴ شب…», «برای شام هم … ۸۰ درصد مطمئنم.» and the past report «پیش‌بینیم ۴ از ۴ با ۹۰ درصد بود»; the wake-up 🎯 lines are missing from the wake-up 📜
ارتقای لازم: هر جمله زیرِ مسئلهٔ خودش؛ پیش‌بینی همیشه 🎯.

### pwB1 — مهندسِ ۳۱ ساله و پمپِ خورشیدیِ باغِ پدر (سه گزارش)
RESULT: FAIL — 1 S2 + 3 S3
- c19 → c22 — B29·D6 (S2, b, F4 repeat): a 🎯 made from her calculation «۱۲۰ × ۰٫۵ = ۶۰ وات هیدرولیکی؛ با ۲۰٪ اصطکاک ۴۸ وات مفید؛ …» («اطمینان: ۲۰٪» = the friction loss); «شد یا نشد؟» asked on her prior-work report and at c22 settled «نشد» from «پس گامِ ۱۶ غلط بود…» — a non-forecast enters calibration
- c22 (p13) — B28·D15 (S3, c, F8 repeat): correction list repeats «۰٫۰۸۲ ⇒ ≈ ۰٫۰۹۸، ۰٫۰۸۲ ⇒ ۰٫۰۹۸»
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
- post 📜 — B29·D25 (S3, b, new (prior)): the prior-ledger reason of an UNCHANGED step is cut at «و» (e.g. «۳۶ ÷ ۲ = ۱۸ و نصفِ محیط…» ⇒ «…، نصفِ محیط…») and stamped «دلیلِ پیشینی که دیگر برقرار نیست کنار رفت (در تاریخچه می‌ماند)» although nothing was fixed (C27-21 whyLine28 misfire)
ارتقای لازم: «N٪» ِ یک کمیتِ فیزیکی هرگز اطمینان نیست.

### pwB2 — پدرِ ۴۴ ساله: شیراز یا تهران
RESULT: FAIL — 2 S3
- post 📜 — B25·D24 (S3, b, new (repeat since R25)): data rows are comma fragments of his fix («داده: مسکن ۲۰»)
- post 📜 (steps 1, 5 «۶٫۷، ۶٫۳») — B29·D25 (S3, b, new (prior)): the prior-ledger reason of an UNCHANGED step is cut at «و» (e.g. «۳۶ ÷ ۲ = ۱۸ و نصفِ محیط…» ⇒ «…، نصفِ محیط…») and stamped «دلیلِ پیشینی که دیگر برقرار نیست کنار رفت (در تاریخچه می‌ماند)» although nothing was fixed (C27-21 whyLine28 misfire)
ارتقای لازم: دادهٔ فرم از جملهٔ کامل، نه تکه‌های ویرگولی.

### pwB3 — قابِ عکس — آغاز با یک گامِ حل‌شده
RESULT: FAIL — 1 S3
- post 📜 (ledger step 1) — B29·D25 (S3, b, new (prior)): the prior-ledger reason of an UNCHANGED step is cut at «و» (e.g. «۳۶ ÷ ۲ = ۱۸ و نصفِ محیط…» ⇒ «…، نصفِ محیط…») and stamped «دلیلِ پیشینی که دیگر برقرار نیست کنار رفت (در تاریخچه می‌ماند)» although nothing was fixed (C27-21 whyLine28 misfire)
ارتقای لازم: دلیلِ گام فقط وقتی کنار برود که پایه‌اش واقعاً عوض شده باشد.

### tB1 — جعبه‌قرصِ هوشمند برای مادر — حلقهٔ قلمرو
RESULT: FAIL — 1 S2 + 1 S3
- c17–c19 — B27·D16 (S2, b, new (loop)): a reply whose only overlap is frame words is rejected («جواب نداد») instead of asked (C2/C20); output identical to rounds 27–28
- s24 — U59 (S3, b, new (loop)): sheet #101 stays «open» after the take-back closed the need
ارتقای لازم: پس از هر رسیدن، آزمونِ ابزار روی دادهٔ خودِ او.

### tB1x — جعبه‌قرص — «خودم یه راه دیگه پیدا کردم»
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### tB1y — جعبه‌قرص — تساویِ واقعیِ دو ابزار (T1)
RESULT: PASS
- (no defects)
ارتقای لازم: (هیچ)

### tB1z — جعبه‌قرص — سه ابزارِ تازه، بستن و تکه‌ای پس از بستن
RESULT: PASS
- (no defects)
ارتقای لازم: آزمونِ «روی دادهٔ خودت».

### nB1 — کافه‌دارِ ۳۸ ساله: سرامیکِ کف و قفسه‌ها (تازه: T3/T11/T13/T14/T15/T19/T20)
RESULT: FAIL — 1 S2 + 7 S3
- post 📜 — B28·D9 (S2, b, F11 repeat): the floor problem 📜 shows the shelves 2-step prior ledger and shelves lines; its own 4-step ledger (stale marks, accepted 20.83) is absent
- c27 → c29 — B28·D14 (S3, b, F6 repeat): forecast «فکر کنم ۷۰ درصد نصب تا عصرِ شنبه تموم میشه» raised «📅 … در «امروز» بیاید؛ درست است؟», later «بی‌جواب ماند» (C132)
- post 📜 — B29·D7 (S3, b, F4 repeat): the floor forecast 🎯 «نصب تا عصرِ شنبه تموم میشه» and the floor plan «نصبِ سرامیک افتاد برای شنبه» filed under the shelves problem (C121)
- p1 — B28·D15 (S3, c, F1 repeat): exact value told as «۹٫۹ میلیون» for her «۹۸۰۰ هزار» (C45)
- p9 — B28·D17 (S3, b, new (repeat since R27)): «۴ ردیف و ۵ ستون میشه ۲۰ تا» unread
- p8 — B28·D19 (S3, b, F8 repeat): dependent step 4 gets no fresh exact proposal after her own fix of step 3
- post 📜 — B29·D2 (S3, b, new (story ownCalc28)): forecast sentences («فکر کنم ۲۳ تا مصرف بشه … ۷۰ درصده», «… ۶۰ درصد مطمئنم، نه ۷۰», «اون ۶۰ درصدی و ۹۰ درصدی یکی‌ان …») filed as «داده»
- post 📜 — B29·D1 (S3, c, F14 repeat): «(C57)» printed in her 📜 «کارِ دیگری» line
ارتقای لازم: هر مسئله دفترِ پیشینِ خودش را نگه دارد؛ پیش‌بینی همیشه زیرِ مسئلهٔ خودش.

### dB1 — معلمِ ۴۵ ساله و برنامهٔ مرورِ کلاس (تازه: T16/T17/T18، U21، U41)
RESULT: FAIL — 5 S3
- c42 — B28·D14 (S3, b, F6 repeat): after ✏️ into the past the same message also proposes «شنبه ۱۴ آذر — در «امروز» بیاید؛ درست است؟» (two asks for one act) and asks «🎯 … شد یا نشد؟» on the ✏️ correction (C91)
- c25 → c28 — B29·D8 (S3, b, F6 repeat): forecast «۷۰ درصد مطمئنم میانگینِ آزمونِ یکشنبه به ۱۳ می‌رسه» raised the plan-style «📅 … در «امروز» بیاید؛ درست است؟», later «بی‌جواب ماند … در «امروز» به‌شکلِ پرسش می‌ماند» (C132)
- post 📜 — B29·D2 (S3, b, new (story ownCalc28)): forecast sentences filed as «داده» («۷۰ درصد مطمئنم میانگینِ …», «احتمالش ۶۰ درصده …», «میانگینِ ۱۳ رو هم الان ۸۰ درصد …»)
- p18 — D27-29 (S3, b, new (practice)): practice prompt has «۰ جلسه · موعد … (گذشته)» but no schedule ladder
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: اصلاحِ روزِ گذشته فقط یک پرسش؛ پیش‌بینی هرگز ردیفِ «امروز».

### nB2 — بودجهٔ اسباب‌کشی و میزِ آشپزخانه (تازه: T21–T25)
RESULT: FAIL — 1 S1 + 2 S2 + 9 S3
- p2 → p15 — B29·D11 (S1, b, F1 repeat): her correct fix of ledger step 4 «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰» (and later «۸ میلیون منهای ۶ میلیون و ۶۰۰ = ۱ میلیون و ۴۰۰») is rejected by the ledger: «گامِ ۴ متنِ تازه هنوز نمی‌خواند» ×4 in her 📜 (beside the page’s own ✓ on the same sentence) and the coach is told «گامِ ۴ ✗» to the end; the turn question keeps asking her to re-check a fixed step
- p8–p9 — B29·D13 (S2, b, F8 repeat): second correction ۱۸ ⇒ ۲۰: proposals «۴۵۰ ⇒ ۴۸۰، ۶ ⇒ ۶٫۴، ۳۰ ⇒ ۳۲» (ratio scaling; her carton count ۳۰ marked stale; exact ۶۰۰), ledger step 1 (truck + workers) marked stale by the carton price; the accept-stale line tells her «پیشنهادِ دقیقِ جاری: ۴۵۰ ⇒ ۴۸۰» (C89)
- p10 — B29·D14 (S2, b, F8 repeat): «کامیون ۴ میلیون و ۲۰۰ نیست، ۴ میلیون و ۵۰۰» ⇒ asks to change the painter’s wage «۱ میلیون و ۲۰۰ ⇒ ۱ میلیون و ۵۰۰», the paint sum and the hourly-truck result (bare «۲۰۰», C88); dependent steps without exact values
- p4 — B29·D10 (S3, b, F2 repeat): remainder clauses: «۵۰ ÷ ۴ = ۱۲ بسته و ۲ تا می‌مونه» (right) ⇒ «؟ گرد شده؟»; «۲۳ ÷ ۵ = ۴ بسته و ۲ تا می‌مونه» (remainder 3) ⇒ «؟» not ✗; «… پس ۴ تا کم میاد» unread (C85/C108/C109)
- p1 — B29·D9 (S3, b, F1 repeat): the everyday sum «کامیون ۴ میلیون و ۲۰۰ + کارگر ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» is not read at all (labels between the operands)
- p5 — B29·D12 (S3, b, F9 repeat): «همسایه‌مون گفت کامیون ۲ ساعت طول می‌کشه، پس ۲ × ۶۰۰ هزار = …» told to the coach as «کارِ دیگری — همسایه‌مون» (her inference; 📜 keeps it hers); «داداشم یه حسابِ دیگه هم کرد: …» not attributed (coach line and 📜 «داده») and its «+ ۱۲ درصد» unread
- T23 (s18) — B29·D16 (S3, b, F10 repeat): moving ledger step 2 that has dependant step 3: no «همه / فقط همین / هیچ» ask — the step moved alone (C124)
- p13 — B29·D7 (S3, b, F4 repeat): the forecast about the budget «بودجه‌ی اسباب‌کشی برای رنگ کافی میشه» filed under the table problem (C121)
- post (s16) — B29·D15 (S3, b, new (story)): the budget chat-problem dossier shows the TABLE problem’s 🧭 strip at its top
- p6 — B28·D15 (S3, c, F1 repeat): ✗ «۷ هزار و ۵۰۰ × ۳ = ۲۱ هزار و ۵۰۰» told as «۲۲٫۵ هزار», not in her words (C103)
- post 📜 — B29·D1 (S3, c, F14 repeat): «(C57)» printed in her 📜 «کارِ دیگری» line
- p1 → post (step 4 «با ۲ میلیون، ۸۵۰») — B29·D25 (S3, b, new (prior)): the prior-ledger reason of an UNCHANGED step is cut at «و» (e.g. «۳۶ ÷ ۲ = ۱۸ و نصفِ محیط…» ⇒ «…، نصفِ محیط…») and stamped «دلیلِ پیشینی که دیگر برقرار نیست کنار رفت (در تاریخچه می‌ماند)» although nothing was fixed (C27-21 whyLine28 misfire)
ارتقای لازم: دفترِ کارِ پیشین همان خوانندهٔ «N میلیون و M» ِ صفحه را به کار ببرد. · پیشنهاد فقط بازحسابِ دقیق؛ اصلاحِ «N میلیون و M» فقط همان عدد.

### dB2 — رایتینگِ آیلتس از ۶ به ۷ (تازه: T26–T27، U56)
RESULT: FAIL — 5 S2 + 6 S3
- p3 → p21 — B29·D17 (S2, b, F4 repeat): «۷۰ درصد مطمئنم ریدینگ ۷ میشه و ۵۰ درصد که لیسنینگ ۷٫۵ بشه» ⇒ ONE 🎯 «ریدینگ ۷ میشه و ۵۰ درصد که لیسنینگ ۷٫۵ بشه» (۷۰٪); at the exam it is settled «شد» though listening came out ۷ (not ۷٫۵) — bank 67 fails, calibration wrong (C90)
- c12–c14 (✏️) — B29·D21 (S2, b, F6 repeat): the ✏️ that changed only «پنجشنبه ⇒ سه‌شنبه» for the meeting also closed the EXAM deadline (۱۵ دی) from the same message («✏️ ِ خودش — جایگزین شد؛ روزِ تازه پرسیده شد») — the exam disappears from «امروز»
- c9–c10 — B29·D19 (S2, b, F6 repeat): «زنگ زدم» with two call acts: no «کدام؟» (C117); the landlord call (the one she had not made) was closed «انجام شد» from «زنگ زدم» and her «به بانک. صاحب‌خونه بمونه برای فردا» did not reopen it
- c8 → c9 — B29·D18 (S2, b, F6 repeat): «آره، فردا و پس‌فردا» to the two-call ask booked only the landlord call; the next day the bank call is re-asked as «چهارشنبه ۴ آذر (به‌جای ۳ آذر)» — «فردا» re-anchored to the new day
- c15 → post — B29·D20 (S2, b, F6 repeat): after the ✏️-into-the-past ask, her explicit «سه‌شنبه‌ی هفته‌ی بعد، ۱۰ آذر» is not read («پرسشِ تاریخ بی‌جواب ماند»), Today still «هنوز تأیید نشده»; the meeting drops out of the open-plans list (C92)
- p4 — B29·D23 (S3, b, F4 repeat): plain «مطمئنم … حدودِ ۶٫۵» makes no 🎯 and the page never asks the number (C119); a bare «۶۰» therefore cannot answer anything (C122 not reachable)
- p4, p14 — B29·D8 (S3, b, F6 repeat): forecasts with a weekday raise the plan-style «📅 … در «امروز» بیاید؛ درست است؟» (her «آره» then sets the 🎯 due date) instead of the forecast’s own due confirm (C132)
- p16 → post Today — B29·D22 (S3, b, new (story promises)): «اینو ثبتش کن: جمعه ساعت ۱۰ کلاس…» also stored as a deferred request «↩ خواسته‌ای که گذاشتی برای بعد» that stays in Today after the class was done
- post 📜 — B29·D24 (S3, b, new (story ownCalc28)): span/kind misfiling: her refusal «نه، اون تاریخ رو نمی‌خوام…» filed as «مجهول»; her related-problem plan as «بازنگری»; forecasts as «داده», no 🎯 line in 📜
- p11 — B27·D4 (S3, b, new (repeat since R27)): her «سه‌شنبه» stored and shown as «سه شنبه» (ZWNJ stripped)
- post 📜 — B24·D16 (S3, c, new (repeat since R24)): one history line still carries both «⇐» and «→» («اصلاح شد ⇐ «…» → «…»»)
ارتقای لازم: هر پیش‌بینی جدا با عدد و موعدِ خودش؛ ✏️ فقط همان کاری را که عوض شد لمس کند. · «زنگ زدم» با دو تماسِ باز همیشه «کدام؟».

## 2. Round-28 defect table (FIXED | STILL | CHANGED)

| scenario | id | status | evidence |
|---|---|---|---|
| s11 | U35 | STILL | s49 ask list names «صورتِ مسئله» twice |
| s11 | B25·D26 | STILL | post 📜: 98/49 never credited |
| s11 | B24·D16 | STILL | post 📜 line 111 |
| s14 | B26·D3 | STILL | s17 ⏰ booked without her yes + same-date ask (identical output) |
| s14 | U26 | STILL | p3 «۱ + ۰.۳ … ≈ ۱.۳» no arith line |
| s14 | B27·D7 | STILL | post 📜 packet/n−1/practice lines under «میانگینِ ۳۶ …» |
| s14 | B28·D16 | STILL | post 📜 no ✓/✗ beside her −28/4, 1.3 lines (post identical to r28) |
| s17 | U38 | STILL | post «ریاضی‌کردن» keeps ۰٫۸ |
| s17 | B24·D16 | STILL | post 📜 line 88 |
| s18 | B28·D13 | STILL | post strip «اکنون: اجرای طرح · مانده: نامعلوم — طرح هنوز نیست» |
| s18 | B24·D16 | STILL | post 📜 lines 36, 46 |
| s19 | B28·D2 | FIXED | c62 no settle from the correction |
| s19 | B28·D7 | FIXED | c87 ⏰ ۱۵ اسفند booked |
| s19 | B27·D11 | STILL | post header «عروسی ۱۵ اسفنده» (⇐ «۱۶ هفته…») |
| s19 | B27·D4 | STILL | plan text «هفته ای … می رم» ZWNJ stripped |
| s19 | B24·D16 | STILL | post 📜 lines 36, 90 |
| s20 | B28·D12 | FIXED | post 📜 «کارِ دیگری» line gone |
| bp1 | B24·D15 | STILL | p11 TQ «ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی» after her own expansion check |
| bp2 | B27·D6 | STILL | post strip «نتیجه با عددِ پیشین…» |
| bp2 | B26·D12 | STILL | s29 «تبدیلِ مترمکعب به لیتر» |
| bp2 | B28·D15 | STILL | post 📜 «(۷ ⇐ ۷٫۵،» (اصلاح شد ⇐ «۷٫۵،»)…» + 🎯 text «هشتاد درصد مطمئنم» |
| bp2 | B24·D16 | STILL | post 📜 lines 36–37 |
| bp3 | B26·D12 | STILL | s19 «مساحتِ مثلث» while her feeling was about the theorem |
| aB1 | B26·D16 | STILL | p9 birth sentence already stored: no page line (sysdiff empty) |
| aB1 | U26 | STILL | p5 «۴۲ ضربدر ۵ … ۲۱۰» no arith line, no 📜 mark |
| aB2 | B27·D7 | STILL | post 📜 problem 2 still carries ~10 problem-1 entries (now with ↪) |
| aB2 | B24·D18 | STILL | post 📜 problem 1 «فرمِ فهم» after the results |
| aB2 | B28·D16 | FIXED | post 📜 marks beside her lines |
| aB3 | U49 | FIXED | 🎯 «تا اون موقع کسری از سود کمتره» 70%, judged |
| aB3 | U26 | STILL | p15 «۲۰ درصدِ ۳۰۰ … ۶۰» filed as «داده», no mark |
| aB3 | B25·D24 | STILL | post 📜 fragments + duplicate sentence |
| aB3 | B24·D16 | STILL | post 📜 |
| aB4 | B27·D4 inst. | FIXED | s1: the date ask with the stray «» is no longer raised |
| oB1 | B28·D10 | FIXED | c21 «🔭 مسئله ثبت شد … صفحه‌اش باز شد» |
| oB1 | B28·D2 | FIXED | c31 no settle |
| oB1 | B28·D3 | FIXED | c34 no 🎯 from the past report |
| oB1 | B28·D5 | FIXED | c29 no ask on the complaint; c36 settles the wake-up 🎯 only |
| oB1 | B26·D31 | STILL | post 📜 wake-up «حکمِ وارسی: شاید»/«حل شد» unmarked after 5⇒4 |
| oB1 | B27·D14 | STILL | page questions «یه روز گذشت. چند تا سؤالِ دیگه دارم…» still a problem (↪ destination) |
| oB1 | B27·D7 inst. | STILL | ۲۲ آبان «شد ۵ روز» under dinner |
| pwB1 | B28·D15 | STILL | c22 «۰٫۰۸۲ ⇒ ≈ ۰٫۰۹۸، ۰٫۰۸۲ ⇒ ۰٫۰۹۸» |
| pwB1 | B24·D16 | STILL | post 📜 one line |
| pwB2 | B28·D9 | FIXED | c18 «✓ در «کارِ پیشینِ تو» نشست: گامِ ۵ …» |
| pwB2 | B28·D7 | FIXED | c23 ⏰ «۲۵ آبان با صاحب‌خونه…» |
| pwB2 | B25·D24 | STILL | post 📜 «داده: مسکن ۲۰» fragments |
| tB1 | B27·D16 | STILL | c17 frame-word reply «یک ابزارِ تازه برای تغییر …» ⇒ «جواب نداد» (not asked); surface fixer: harness timing |
| tB1 | U59 | STILL | sheet #101 «open» after the take-back |
| nB1 | B28·D1 | FIXED | p3 ✓ (thousand reading) |
| nB1 | B28·D8 | FIXED | c4 only the result changes |
| nB1 | B28·D3 | FIXED | c25 🎯 ۷۰ |
| nB1 | B28·D2 | FIXED | c30 |
| nB1 | B28·D4 | FIXED | c27 one record with history |
| nB1 | B28·D5 | FIXED | c27/c29 |
| nB1 | B28·D11 | FIXED | floor 📜 copy + «↩ برگرداندنِ این سطر» |
| nB1 | B28·D9 | STILL | floor 📜 shows the shelves 2-step ledger, own 4-step ledger absent |
| nB1 | B28·D14 | CHANGED | c27 «نصب تا عصرِ شنبه…» (forecast) now raises the 📅 ask |
| nB1 | B28·D15 | STILL | p1 «۹٫۹ میلیون» for «۹۸۰۰ هزار» |
| nB1 | B28·D17 | STILL | «۴ ردیف و ۵ ستون میشه ۲۰ تا» no mark |
| nB1 | B28·D19 | STILL | p8 step 4 «وابسته به گامِ ۳ …» no exact value |
| nB1 | B27·D7 inst. | STILL | shelves 📜 has the floor plan/🎯 |
| dB1 | B28·D6 | FIXED | c19/c21 |
| dB1 | B28·D7 | FIXED | c25 |
| dB1 | B28·D2 | FIXED | c34 |
| dB1 | B28·D4 | FIXED | c31 + mind card «(۱) … ۱ بار از ۱» |
| dB1 | B28·D5 | FIXED | c28/c31 |
| dB1 | B28·D14 | CHANGED | Sunday asked ✓, «آخرِ سالِ تحصیلی» asked ✓, ✏️ past asked ✓ — but the ✏️ message also proposes «شنبه ۱۴ آذر … درست است؟» and asks «شد یا نشد؟» on the ✏️ |
| dB1 | D27-29 rem. | STILL | p18 «۰ جلسه · موعد … (گذشته)», no ladder |
| dB1 | B24·D16 | STILL | post 📜 3 lines |

## 3. ARMS TABLE (T1–T27)

| arm | scenario | p<N>/c<N> | verdict |
|---|---|---|---|
| T1 real tie | tB1y | p9–p10 | PASS (both named; «دومی» read) |
| T2 piece after closure | tB1z | after closure | PASS |
| T3 «= N unit» | s17 / pwB1 / nB1 | post 📜 / p14 / p1 | PASS («۳ متر در ۴ متر = ۱۲ … ۱۸» ✓, «۲٫۵ متر در ۴ متر = ۱۲» ✗, «۲ تکه‌ی ۷ متری = ۱۵» ✗, «۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ … ۱۰۲ دقیقه» ؟) |
| T4 third prior report | pwB1 | p11–p12 | PASS (merged) |
| T5 take back own dispute | pwB2 | p7 | PASS |
| T6 «جمعهٔ بعد» / «باشه» | pwB2 / dB1 | c20, c23 / c15 | PASS (B28·D7 fixed: «باشه» books her own appointment) |
| T7 5⇒4 on a used datum | oB1 | c28–c31 | PARTIAL — 🎯/practice ✓; closed problem's «حل شد»/verdict unmarked (B26·D31) |
| T8 two open predictions | nB1 / dB1 / oB1 / s19 | c29 / c34 / c36 / c77 | PARTIAL — nB1, dB1, oB1 settle correctly; s19 asks «کدام؟» with a non-forecast candidate and later settles the wrong one (B29·D4) |
| T9 coincidental number | pwB1 | s22 | PASS (cable ۱۵ متر not stale) |
| T10 ÷ / تقسیم بر / glued fraction | aB2 | p12 | PASS («۲۶ ÷ ۴ = ۶٫۵» ✓, «۲۰ تقسیم بر ۷ … ۲٫۸۶» ✓, «۲۲ تقسیم بر ۷ … ۳٫۵» ✗, «۱۳/۱۲ از ۱ بزرگ‌تره» fraction) |
| T11 correction + question | nB1 / s17 | c8 / c9 | PASS |
| T12 one worked step (+) / mid-session calc (−) | pwB3, nB2 table (+) / nB1 c2, c7, nB2 c2 (−) | p1, p12 / p2, p7, p2 | PASS |
| T13 move misfiled 📜 line + undo | nB1 / nB2 | c19–c20 / s15–s24 | PASS — copy with «↩ برگرداندن» in the destination, «جابه‌جا شد ⇒» in the source, undo «برگشت … (جابه‌جایی پس گرفته شد)» (nB2) |
| T14 accept proposal / negation / chat-only | nB1 / nB2 | c7 / p9 | PARTIAL — nB1 accept + negation as r28; nB2 chat-only accept of a stale-base proposal: base named ✓ but «پیشنهادِ دقیقِ جاری: ۴۵۰ ⇒ ۴۸۰» wrong (B29·D13) |
| T15 scale ambiguity and roots | nB1 | p3–p5 | PASS (C102: S1 fixed; ✗ with both values; √(۱۵²+۸²) ≈ ۱۷ ✓; «۲√۳ متره» no «=», silent) |
| T16 date asks | dB1 / dB2 | c3–c4, c42 / c8, c12–c15 | FAIL — newest-only yes ✓, «پنجشنبه نه، یکشنبه» asks Sunday ✓, ✏️ past asks ✓; but ✏️ also proposes a second day (dB1), closes the exam deadline (dB2 B29·D21), her explicit new day is unread (B29·D20), «آره، فردا و پس‌فردا» books one (B29·D18) |
| T17 idiom dates | dB1 / dB2 / nB2 | c19–c25 / c1–c2, c12 / c1 | PASS («بعد از عید (از ۱ فروردین ۱۴۰۶ به بعد) — کدام روز؟», «وسطِ ماه — کدام روز؟», «آخرِ سالِ تحصیلی — کدام روز؟», «عید» ⇒ ۱ فروردین with yes, «ماهِ دیگه/وسطِ ماهِ دیگه» ⇒ «کدام روز؟», «اولِ ماه» NOT RUN: not in the B scripts) |
| T18 confidence phrasings | nB1 / dB1 / dB2 | c25–c27 / c28–c31 / p3–p4 | PARTIAL — «احتمالش N درصده», «فکر کنم ۷۰ درصد», «تقریباً مطمئنم» ⇒ ask, bare «۶۵ درصد», past/others' ignored, new number updates ✓; «۷۰ درصد … و ۵۰ درصد …» in one clause merged (B29·D17), plain «مطمئنم» ignored (B29·D23) |
| T19 someone else's work + adoption | nB1 / nB2 | c6 / p5 | PARTIAL — brother ✓; adoption «منم همینو قبول دارم» NOT RUN (not scripted); «X گفت … پس …» her inference told to coach as another's (B29·D12) |
| T20 hypothetical / bare question | nB1 | c6, c7 | PASS |
| T21 «N میلیون و M» sums | nB2 | p1–p6 | PARTIAL — no-carry sum ✓ no question («۵ میلیون و ۷۰۰ + ۴۵۰ هزار = ۶ میلیون و ۱۵۰», «۴ میلیون و ۵۰۰ + ۱ میلیون و ۵۰۰ + ۶۰۰ هزار = ۶ میلیون و ۶۰۰», «۱ میلیون و ۲۰۰ + ۱ میلیون و ۱۲۰ = ۲ میلیون و ۳۲۰»); units-only ✓ «یعنی ۵۰۰ تومان» to the coach; none-fits ✗ with both values ✓; «تومن» ✓ (C105); «N هزار و M» ✓ (C104); but «کامیون ۴ میلیون و ۲۰۰ + کارگر ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» unread (B29·D9); m2 answer (C106) NOT REACHABLE: the page never asked m2 |
| T22 remainder clauses | nB2 | p4 | FAIL — after a division the right remainder is read as rounding «؟», a wrong remainder is not ✗, «۴ تا کم میاد» unread (B29·D10); after a sum «۱۸ + ۱۲ = ۳۰» ✓ (no clause) |
| T23 MOVE 🎯 / ledger step with dependants / statement + undo | nB2 | s15–s24 | PARTIAL — 🎯 ✓, statement ✓ (C123), undo ✓ in both places with history and page clock ۳ آبان; ledger step 2 with dependant step 3 moved with no ask (C124 failed, B29·D16) |
| T24 attribution | nB2 | p5, p4 | PARTIAL — «فروشنده گفت ۱۲٪» datum with source ✓; «داداشم حساب کرد …» کارِ دیگری ✓; «مامانم کمکم کرد … ۱۸ + ۱۲ = ۳۰» hers ✓; «داداشم یه حسابِ دیگه هم کرد: …» not attributed; «همسایه‌مون گفت … پس … = ۱ میلیون و ۲۰۰» told to the coach as another's (B29·D12) |
| T25 two corrections / accept stale-base proposal / «X نیست، Y» twice | nB2 | p7–p10 | FAIL — first correction exact; second ratio-scaled and touches step 1; accept: base named ✓ but wrong «exact current»; «۱۵ نیست، ۱۸» with «۱۵» twice: one place changed, the other only marked stale (partial C110); chat-only accept ✓ (no rewrite) |
| T26 dates | dB2 | c1–c17 | FAIL — ✏️ to a past day asks + keeps booking ✓ (C93); «زنگ زدم» with two calls: no «کدام؟», wrong call closed (B29·D19); D28-7 plan not closed at birth ✓; «پنجشنبه درسته» ✓; «ماهِ دیگه» ✓; «وسطِ ماهِ دیگه یعنی حدودِ ۱۵ دی» ⇒ ⏰ ۱۵ دی with no question ✓ (C133) |
| T27 forecasts | dB2 / nB2 | p4, p14–p21 / p13–p15 | PARTIAL — weekday forecast: no 📌 row, but the plan-style «در امروز بیاید؟» ask (yes ⇒ due date) (B29·D8); «حدودِ ۶٫۵» vs «۷ شد» asks ✓ and «نشد» settles ✓ (C120); plain «مطمئنم» ✗ (C119); bare «۶۰» answering «چند درصد؟» NOT REACHABLE (the page never asked); «باز (۲) / داوری‌شده (۱)» lists ✓ |
| U56 page suggestion repeated after answered | dB2 | c4–c8 | PASS — after her «نه، اون تاریخ رو نمی‌خوام» the forecast's date ask never came back (checked over the next 12 turns) |

## 4. 📜 line-match tables (multi-problem scenarios, with page marks)

**nB2 (budget c:0 / table c:1, chat problems)**
| 📜 of | line | belongs to | mark | verdict |
|---|---|---|---|---|
| budget | statement, plan «ماهِ دیگه اسباب‌کشی», prior ledger (4 steps) | budget | ✓✓✓✗ | ✓ |
| budget | «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰» | budget | ✓ (line) / ledger «متنِ تازه هنوز نمی‌خواند» ×4 | ✗ contradiction (B29·D11) |
| budget | data «رنگ‌کار گفت …», «روی هم … = ۲ میلیون و ۴۲۰» | budget | ✗ (right) | ✓ |
| budget | «۵۰ ÷ ۴ = ۱۲ …», «۲۳ ÷ ۵ = ۴ …» | budget | ؟ / ؟ | ✗ (B29·D10) |
| budget | «فروشنده گفت … منبع: به گفتهٔ «فروشنده»», brother کارِ دیگری (with «(C57)») | budget | ✓ | ✓ / ✗ label |
| budget | «۲ × ۶۰۰ هزار = ۱ میلیون و ۲۰۰» نتیجه | budget | ✓ | ✓ (hers in 📜) |
| budget | corrections ۱۵⇒۱۸⇒۲۰, ۴٫۲⇒۴٫۵, accept, ۳۰ × ۲۰ = ۶۰۰ | budget | ✓ | ✓ |
| budget | strip 🧭 «میزِ ناهارخوری…» | table | — | ✗ (B29·D15) |
| table | statement, prior (1 step), width result | table | ✓ | ✓ |
| table | 🎯 «بودجه‌ی اسباب‌کشی برای رنگ کافی میشه» | budget | — | ✗ (C121, B29·D7); moved ⇒ budget ✓; undone ⇒ table |

**nB1** — floor 📜 holds shelves statement/data/prior ledger/plan lines and lacks its own ledger (✗ B28·D9); shelves 📜 holds floor plan «نصبِ سرامیک افتاد برای شنبه» and floor 🎯 «نصب تا عصرِ شنبه» (✗ B29·D7); moved plan «برای کف ۲۳ کارتن کمه …» shows in floor with «↩ برگرداندن» (✓); marks ✓ on «۵ تا ۶۰ تا = ۳۰۰», «۲۴۰ ÷ ۶۰ = ۴», «۲۴ × ۴۸۰ = ۱۱۵۲۰ هزار»; none on «۴ ردیف و ۵ ستون = ۲۰» (B28·D17).
**oB1** — wake-up: statement, data, plan, result «۴ روز از ۷ (⇐ ۵)», lesson, «حل شد» ✓ (but «حکمِ وارسی: شاید»/«حل شد» unmarked after 5⇒4 ✗); forecast sentences as «داده» ✗; dinner: own record now ✓, statement, data, guess, ⏸ #104, plans, result ✓; «شد ۵ روز» + «گفته بودم ۶ روز…» (wake-up) under dinner ✗.
**aB2** — problem 2 still carries ~10 problem-1 lines dated ۳ آبان (✗, now with ↪); problem 2 marks: «۵۰² = ۲۵۰۰» ✓, «۱/۲ + ۱/۳ + ۱/۴ = ۱» ✗, «۲۰ تقسیم بر ۷ … ۲٫۸۶» ✓, «۲۲ تقسیم بر ۷ … ۳٫۵» ✗, «۲۶ ÷ ۴ = ۶٫۵» ✓.
**s14** — identical to r28 (✗ packet / n−1 / practice lines under the mean problem; no marks).
**dB2 (one problem)** — forecasts filed as «داده», her refusal as «مجهول» (✗ B29·D24); plan «سه شنبه …» history with both arrows.

## 5. Prior-work verdict table

| scenario | step | her text | page verdict | expected | verdict |
|---|---|---|---|---|---|
| nB2 | 1–3 | «کامیون … = ۵ میلیون و ۷۰۰», «۳۰ × ۱۵ = ۴۵۰ هزار», «۵ میلیون و ۷۰۰ + ۴۵۰ هزار = ۶ میلیون و ۱۵۰» | ✓ ✓ ✓ (step 1 from the model only, unread by the page) | ✓ | PASS / S3 (B29·D9) |
| nB2 | 4 | «۸ میلیون منهای ۶ میلیون و ۱۵۰ = ۲ میلیون و ۸۵۰» | ✗ | ✗ (1 850 000) | PASS |
| nB2 | 4 fix | «… میشه ۱ میلیون و ۸۵۰» | «متنِ تازه هنوز نمی‌خواند» | ✓ | **S1 FAIL** (B29·D11) |
| nB2 | 2 after ۱۵⇒۱۸⇒۲۰ | — | stale, ۴۵۰⇒۵۴۰ then ۴۵۰⇒۴۸۰ | ۶۰۰ | FAIL (B29·D13) |
| nB2 | 2 own fix | «۳۰ × ۲۰ = ۶۰۰ هزار» | ✓ «اصلاح شد … به دستِ خودش» | ✓ | PASS |
| nB2 | 3 own fix | «۴ میلیون و ۵۰۰ + ۱ میلیون و ۵۰۰ + ۶۰۰ هزار = ۶ میلیون و ۶۰۰» | ✓ | ✓ | PASS |
| nB2 table | 1 | «۱۶۰ + ۷۰ + ۷۰ = ۳۰۰» | ✓ (block fired, one step) | ✓ | PASS |
| pwB2 | 5 fix | «شیراز = ۲٫۷ + … = ۷٫۷» | ✓ نشست | ✓ | PASS (B28·D9 fixed) |
| pwB1 | 1–19 | three reports | merged, 15⇒18 stale exact | — | PASS; reason cut on untouched steps (B29·D25) |
| pwB3 | 1 | «نصفِ محیط … = ۱۸» | ✓ | ✓ | PASS / S3 (B29·D25 reason cut) |
| nB1 | 1–4 | four steps | ✓✓✓✗, fix ✓, stale 20.83 / 22.83 / 10275 | — | PASS; floor ledger lost (B28·D9) |
| s11 | 1 | backtracking 98/49 | ⚠️ ناقص | — | as r28 (U36) |

## 6. Arithmetic table (what she wrote · exact · page said · verdict)

| scenario | what she wrote | exact | page said | verdict |
|---|---|---|---|---|
| nB1 | «۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰» | 12 700 000 | ✓ (thousand reading) | ✓ (S1 fixed) |
| nB1 | «۲ میلیون و ۸۰۰ منهای ۵۰۰ هزار = ۲ میلیون و ۵۰۰» | 2 300 000 | ✗ «۲ میلیون و ۳۰۰ هزار … یا ۱ میلیون و ۵۰۰ هزار و ۸۰۰» | ✓ |
| nB1 | «۲۲ × ۴۵۰ = ۹۸۰۰ هزار» | 9 900 هزار | ✗ «۹٫۹ میلیون» | ✓ verdict, S3 scale |
| nB2 | «کامیون ۴ میلیون و ۲۰۰ + کارگر ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» | 5 700 000 | — unread | S3 (B29·D9) |
| nB2 | «۵ میلیون و ۷۰۰ + ۴۵۰ هزار = ۶ میلیون و ۱۵۰» | 6 150 000 | ✓ no question | ✓ (C102) |
| nB2 | «۸ میلیون منهای ۶ میلیون و ۱۵۰ = ۲ میلیون و ۸۵۰» | 1 850 000 | ✗ with both readings | ✓ (C103) |
| nB2 | «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰» | 1 850 000 | ✓ in the arith block / ledger «نمی‌خواند» | **S1** (B29·D11) |
| nB2 | «۲ میلیون و ۶۰۰ منهای ۱۰۰ میشه ۲ میلیون و ۵۰۰» | units only: 2 000 500 | ✓ «فقط با خوانشِ واحد» | ✓ (C102) |
| nB2 | «۲ × ۵ = ۱۰ تا شیرینی» | 10 | ✓, not prior work | ✓ |
| nB2 | «۴ گالن × ۲۸۰ هزار = ۱ میلیون و ۱۲۰» | 1 120 000 | ✓ | ✓ |
| nB2 | «۱ میلیون و ۲۰۰ + ۱ میلیون و ۱۲۰ = ۲ میلیون و ۴۲۰» | 2 320 000 | ✗ both values | ✓ |
| nB2 | «۲ میلیون و ۴۲۰ منهای ۱ میلیون و ۸۵۰ = ۵۷۰ هزار» | 570 000 | ✓ | ✓ |
| nB2 | «۴ و ۵ دهم × ۳ = ۱۳ و ۵ دهم» | 13.5 | ✓ | ✓ |
| nB2 | «۱۸ + ۱۲ = ۳۰» | 30 | ✓ | ✓ |
| nB2 | «۵۰ ÷ ۴ = ۱۲ بسته و ۲ تا می‌مونه» | 12 r 2 | ؟ «گرد شده؟» | S3 (B29·D10) |
| nB2 | «۲۳ ÷ ۵ = ۴ بسته و ۲ تا می‌مونه» | 4 r 3 | ؟ (not ✗) | S3 (B29·D10) |
| nB2 | «۳۰ … ۲۶ تا پُر … ۴ تا کم میاد» | 4 | — unread | S3 |
| nB2 | brother «۳ اتاق × ۹۰۰ هزار = ۲ میلیون و ۷۰۰» | 2 700 000 | ✓ کارِ دیگری | ✓ |
| nB2 | brother «۲ میلیون و ۷۰۰ + ۱۲ درصد = ۳ میلیون و ۲۴» | 3 024 000 | — «درصدِ چه؟» | S3 |
| nB2 | «۲ × ۶۰۰ هزار = ۱ میلیون و ۲۰۰» | 1 200 000 | ✓ (told as کارِ دیگری) | S3 label |
| nB2 | «۱ میلیون و ۸۰۰ تومن منهای ۲۰۰ تومن = ۱ میلیون و ۶۰۰ تومن» | 1 000 600 | ✓ | ✓ (C105) |
| nB2 | «۱۲ هزار و ۵۰۰ × ۴ = ۵۰ هزار» | 50 000 | ✓ | ✓ (C104) |
| nB2 | «۷ هزار و ۵۰۰ × ۳ = ۲۱ هزار و ۵۰۰» | 22 500 | ✗ «۲۲٫۵ هزار» | ✓ verdict, S3 wording |
| nB2 | «۸ میلیون ÷ ۷ ≈ ۱ میلیون و ۱۴۳ هزار» | 1 142 857 | ✓ | ✓ (C9) |
| nB2 | «۳۰ × ۲۰ = ۶۰۰ هزار», «۱۶۰ + ۷۰ + ۷۰ = ۳۰۰», «۹۰ + ۷۰ + ۷۰ = ۲۳۰» | 600 / 300 / 230 | ✓ ✓ ✓ | ✓ |
| nB2 | «۴ میلیون و ۵۰۰ + ۱ میلیون و ۵۰۰ + ۶۰۰ هزار = ۶ میلیون و ۶۰۰» | 6 600 000 | ✓ | ✓ |
| nB2 | «۱۲ درصدِ ۱ میلیون و ۱۲۰ میشه ۱۳۴ هزار و ۴۰۰» | 134 400 | ✓ | ✓ |
| s17 | «۳ متر در ۴ متر = ۱۲ … ۱۲ × ۱٫۵ = ۱۸», «۲٫۵ متر در ۴ متر = ۱۲», «۲۰ درصدِ ۱۸ = ۳٫۶» | 18 / 10 / 3.6 | ✓ / ✗ / ✓ | ✓ |
| s18 | «−45/(144π) ≈ −0.1», «−54/(144π) ≈ −0.12» | −0.0995 / −0.1194 | ✓ ✓ | ✓ |
| pwB1 | «294300 ÷ 48 = 6131 … ۱۰۲ دقیقه», «294300 ÷ 50 = 5886», «۴۸ × ۶۱۳۱ ≈ ۲۹۴ هزار», «۱۸۰ ÷ ۱۲ = ۱۵», «۶ و ۴ و ۳ میشه ۱۳ دوازدهم» | 6131.25 / 5886 / 294 288 / 15 / 13 | ؟ / ✓ / ✓ / ✓ / ✓ | ✓ |
| aB2 | «۱/۲ + ۱/۳ + ۱/۴ = ۱», «۲۲ تقسیم بر ۷ … ۳٫۵», «۲۰ تقسیم بر ۷ … ۲٫۸۶» | 13/12 / 3.14 / 2.857 | ✗ / ✗ / ✓ | ✓ |
| aB3 | «۳۰ درصدِ ۲۱ میلیون میشه ۷», «۵۷٫۵ ÷ ۱۲ = ۵ میلیون», «۲۰ درصدِ ۳۰۰ … ۶۰» | 6.3 / 4.79 / 60 | ✗ / ؟ / — | ✓ / ✓ / S3 |
| aB1 | «۴۲ ضربدر ۴ میشه ۱۶۸، ۱۷۸ منهای ۱۶۸ میشه ۱۰», «۴۲ ضربدر ۵ … ۲۱۰» | 168, 10 / 210 | ✓ / — | ✓ / S3 |
| bp3, bp2, pwB3 | «۹² = ۸۱ … جمعشون ۲۲۵», «۵۰ × ۱۵۰ = ۷۵۰۰», «۲ × (۱۲ + ۶) = ۳۶» | 225 / 7500 / 36 | ✓ ✓ ✓ | ✓ |
| look-alikes | dates «۱۴۰۵/۹/۱۵», score «۱۸ از ۲۰», «۵ × x = ۳۰۰», congruence-free; small talk «۲ × ۵ = ۱۰ تا شیرینی», «۷ × ۸ = ۵۶ بود دیگه؟» | — | no prior work, no ✗ | ✓ |

## 7. 🎯 table (forecast · confidence · 🎯 made? · outcome · settled where)

| scenario | forecast | conf | 🎯 made? | outcome | settled |
|---|---|---|---|---|---|
| nB1 | «۲۲ کارتن بسه» | 80 | ✓ | نشد | نشد ✓ (c30) |
| nB1 | «۲۳ تا مصرف بشه و یکی بمونه» | 70 ⇒ 60 | ✓ one record, history | شد | شد ✓ (c29) |
| nB1 | «نصب تا عصرِ شنبه تموم میشه» | 70 | ✓ (under shelves ✗) | شد | شد ✓ (c29) |
| nB1 | «کاشی‌ها بشکنن یکی‌دوتا» | 50 | ✓ | شد | شد ✓ |
| dB1 | «میانگینِ آزمونِ یکشنبه به ۱۳ می‌رسه» | 70 ⇒ 80 | ✓ one record | شد (۱۳٫۲) | شد ✓ (c34) |
| dB1 | «هیچ‌کس زیرِ ۱۰ نگیره» | 60 | ✓ | not said | open ✓ |
| dB1 | «بچه‌ها از آزمونِ کوتاه استقبال می‌کنن» | asked ⇒ 65 | ✓ | — | open |
| dB1 | «پارسال ۹۰ درصد …» / «مدیرمون … ۸۰» | — | none ✓ | — | — |
| oB1 | wake-up «۵ روز از ۷ موفق» / «۶ روز از ۷» | 60 / 70 | ✓ | ۴ / ۵ | نشد ✓ / نشد ✓ |
| oB1 | dinner «هر ۴ شب تا ۱۱:۳۰» | 90 | ✓ | ۳ از ۴ | نشد ✓ (no false «شد») |
| s19 | «جلسه‌ی اول خسته می‌شم ولی می‌رم» (chat + practice copy) | 70 | ✓ ×2 | شد | chat copy open, practice copy «شد» but session lost ✗ (B29·D4) |
| s19 | «می‌خوام ببینم پیش‌بینی‌هام چقدر درست درمیان — مثل همین « » …» | 70 | ✗ made (not a forecast) | — | settled «شد» ✗ |
| pwB1 | «۱۲۰ × ۰٫۵ = ۶۰ وات … با ۲۰٪ اصطکاک …» | «20» | ✗ made (friction) | — | «نشد» ✗ (B29·D6) |
| aB3 | «تا اون موقع کسری از سود کمتره» | 70 | ✓ (U49 fixed) | شد | شد ✓ |
| bp2 | «هشتاد درصد مطمئنم» | 80 | ✓ (text only the phrase) | — | — |
| nB2 | «بودجه‌ی اسباب‌کشی برای رنگ کافی میشه» | 70 | ✓ (under the table ✗) | نشد | نشد ✓ |
| dB2 | «ریدینگ ۷ … و ۵۰ درصد که لیسنینگ ۷٫۵» | 70 (+50) | ONE 🎯 ✗ | ۷ / ۷ | شد ✗ (listening failed) |
| dB2 | «مطمئنم … حدودِ ۶٫۵» (Saturday) | — | ✗ none, no ask | ۶ | — |
| dB2 | «۶۰ درصد … آزمایشیِ شنبه‌ی بعد حدودِ ۶٫۵» | 60 | ✓ (due by her yes) | ۷ | asked ⇒ نشد ✓ (C120) |
| dB2 | «احتمالش ۴۰ درصده که جمعه بارون بیاد …» | 40 | ✓ (due ۱۳ آذر) | شد | شد ✓ |

## 8. Date-ask table (ask · her answer · what was booked)

| scenario | ask | her answer | booked |
|---|---|---|---|
| dB1 | Thursday test + Saturday director | «آره.» | only the newest (Saturday) ✓ |
| dB1 | «پنجشنبه نه، یکشنبه» | — | «یکشنبه ۸ آذر (به‌جای ۵ آذر) … درست است؟» ✓ |
| dB1 | «بعد از عید / وسطِ ماه / آخرِ سالِ تحصیلی» | «نه، منظورم … نوروزه», «وسطِ ماه یعنی حدودِ ۱۵ دی» | «کدام روز؟» ✓; ۱۵ دی booked with no question ✓ |
| dB1 | «عید» ⇒ ۱ فروردین | «عید درسته» | ⏰ ۱ فروردین ۱۴۰۶ ✓ |
| dB1 | ✏️ Monday ⇒ «شنبه» (said Mon 2 Azar) | «نه، اون شنبه گذشت…» | «این روز (۷ آذر) گذشته — کدام روز؟» ✓ + extra «شنبه ۱۴ آذر … درست است؟» ✗ |
| dB2 | «وسطِ ماهِ دیگه» + «پنجشنبه جلسه» | «آره، پنجشنبه درسته. … یعنی حدودِ ۱۵ دی» | 📌 ۵ آذر ✓, ⏰ ۱۵ دی ✓ |
| dB2 | forecast «… شنبه … حدودِ ۶٫۵» ⇒ «در امروز بیاید؟» | «نه، اون تاریخ رو نمی‌خوام» | nothing ✓; never asked again ✓ (U56) |
| dB2 | «فردا بانک» + «پس‌فردا صاحب‌خونه» | «آره، فردا و پس‌فردا» | only landlord ⏰ ۴ آذر ✗; bank re-asked next day «۴ آذر (به‌جای ۳ آذر)» ✗ |
| dB2 | (no ask) «زنگ زدم» with two calls | «به بانک. صاحب‌خونه بمونه برای فردا» | landlord closed ✗ (C117) |
| dB2 | ✏️ «پنجشنبه ⇒ سه‌شنبه» (past) | «سه‌شنبه‌ی هفته‌ی بعد، ۱۰ آذر» | «بی‌جواب ماند»; ۵ آذر kept; exam deadline closed ✗ |
| dB2 | «جمعه ساعت ۱۰ کلاس» (ثبتش کن) | «آره درسته» | 📌 ۱۳ آذر ✓ (+ stray deferred request ✗) |
| dB2 | two weekday forecasts | «آره، درسته» | 🎯 due ۱۳ / ۱۴ آذر ✓ (plan-style wording) |
| nB2 | «ماهِ دیگه اسباب‌کشی» | — | «ماهِ بعد — کدام روز؟» ✓, lapsed |
| nB1 | «نصبِ سرامیک افتاد برای شنبه», «تا ۱۴۰۵/۹/۱۵» | «آره», «آره، ۱۵ آذر درسته» | ۳۰ آبان ✓, ۱۵ آذر ✓; forecast «نصب تا عصرِ شنبه» asked as a plan ✗ |
| pwB2 | «تا جمعه» (Friday) / «۲۵ آبان با صاحب‌خونه» | «جمعه‌ی بعد» / «باشه» | ۱۵ آبان ✓ / ⏰ ۲۵ آبان own record ✓ |
| s19 | «عروسی ۱۵ اسفنده … درست است؟» | «همون ۱۵ اسفند درسته» | ⏰ ۱۵ اسفند ✓ |

## 9. Chat ⇄ page verdicts
- Separate problems: «جدا» now gets its own record in oB1 and nB2; return by naming is immediate; but stray lines/strips of the other problem persist (nB1, aB2, oB1, nB2 strip).
- Prior ledger ⇄ chat: her own fixes land in pwB2 and nB2 (steps 2, 3), but the ledger's own number check rejects a correct «N میلیون منهای N میلیون و M» fix (S1) while the chat arith block and the 📜 line mark it ✓ — two readers disagree.
- 🎯 ⇄ chat: many r28 failures fixed (no settle from corrections, past or foreign confidence; updates; per-clause outcomes); new holes: one-clause double forecasts, plain «مطمئنم», «N٪» of a physical quantity, s19's outcome to a non-forecast.
- Dates ⇄ chat: idioms fixed; ✏️ and «زنگ زدم» are the weak points now (dB2).

## 10. Owner-bank table (B: 11–20, 45–47, 57–59, 66–67)

| # | verdict | where |
|---|---|---|
| 11 offline / local model | نیمه — offline page yes; local model no (sheet #101), unchanged | oB1 p15–16 (replay of r28) |
| 12 alarm clock / invention to plan | هست | oB1 p17; tB1 loop |
| 13 book for 10y/70y | نیست (#102) | oB1 p18–19 |
| 14 before/after pictures | نیمه (#103) | oB1 p20–21 |
| 15 per-session e-mail | نیست (#103) — runner e-mails only | oB1 p20 |
| 16 two problems not mixed | نیمه — «جدا» ⇒ own record now (oB1 c21, nB2 p12), move/undo works (nB2 T23), but misfiled lines and a foreign strip remain (nB1, aB2, oB1, nB2) | oB1 c21, nB2 s15–s24 |
| 17 when does a sheet get answered | نیمه (no date) | oB1 p26 |
| 18 over-confidence on the mind card | نیمه — oB1/dB1 calibration now from true outcomes; s19 shows false «۰ از ۲ … بیش‌اطمینانی +۷۰» (B29·D4) and dB2 counts a half-failed merged forecast as «شد» | s19 post mind card, dB2 |
| 19 all records in one place | نیمه | oB1 p35, 📚 همهٔ کارها |
| 20 smartwatch data | نیست (#104) | oB1 p25 |
| 45 tool tested on my data | نیست (word overlap only) | tB1z p10 |
| 46 sentence after naming a previous problem | هست — binds in the same message | oB1 c38, nB1 c24, nB2 p14 |
| 47 «حل شد» same meaning everywhere | نیمه (🧭 «حل به نتیجه رسید» vs 📜 «حل شد» vs mind card) — unchanged | tB1z, nB2 |
| 57 correction + question in one message | هست | nB1 c8 |
| 58 «پنجشنبه نه، شنبه» booked elsewhere? | هست — the negated day is never booked; the new day is asked «(به‌جای ۵ آذر)» | dB1 c4 |
| 59 unconfirmed date back with next year's date | هست (no drift seen) — but an unconfirmed ask is re-anchored to the new day (dB2 bank call «۴ آذر به‌جای ۳ آذر») | dB2 c9 |
| 66 what did my «ثبتش کن» record? | نیمه — exactly the named class (📌 ۱۳ آذر) and the coach said so; but a stray «خواسته‌ای که گذاشتی برای بعد» was also made and stays in Today (B29·D22) | dB2 p16–p17, post Today |
| 67 two forecasts in one sentence — two recorded? | نیمه — in two sentences yes (dB2 p14, nB1 c27); in ONE clause «۷۰ درصد … و ۵۰ درصد …» no: one merged 🎯 (B29·D17) | dB2 p3, p14 |

## 11. Routing
Every coaching turn of all 32 runs went to lla_coach; ✏️ turns (s17 p6, s18 p11, s19 p11, bp2 p10, dB1 p5/p15, dB2 p11), «آره، ثبتش کن» (s19 p2, aB3 p10) and system follow-ups (oB1, tB1z) went to lla_assistant; the «خودِ سامانه» self-knowledge sub-calls ran as learning_architecture (as in r28). No mis-route. Post-check rewrites: nB2 p11 («درست شد» about her own calc — false positive), dB2 p6 (two questions — correct).

## 12. PARTS.md «نسبت به دورِ ۲۸» (round29B/PARTS.md)
| part | نسبت به دورِ ۲۸ |
|---|---|
| arithmetic reader | بهتر — S1 fixed, ✓/✗ beside her 📜 lines; still unread shapes |
| prior-work ledger | بدتر — new S1 (ledger rejects a correct million fix), reason-cut misfire on untouched steps |
| correction engine | مختلط — single corrections exact; two in a row and «N میلیون و M» corrections wrong |
| dates / Today | بهتر در اصطلاح‌ها، بدتر در ✏️ و تماس‌ها |
| forecast book | بهتر در ساختن و بیشترِ داوری‌ها؛ لغزش‌های تازه (پیش‌بینیِ دوتایی، «مطمئنم»، ٪ ِ فیزیکی) |
| 📜 dossier / story | بهتر (move/undo, register) با نقص‌های تازهٔ ثبت (پیش‌بینی ⇒ داده) |
| multi-problem binding | بهتر |
| territory loop, routing | همان |
| mind card | مختلط |

## 13. Unit-only claims (round-28 fixers)

| claim | scenario | p<N> | held / failed / not reachable |
|---|---|---|---|
| surface A28-36 (undated 🎯 label) | dB2 | s27 🎯 view «بی موعد — داوری با گزارشِ خودت» | held |
| surface C27-6 (group C half) | — | — | not reachable (group C shape) |
| story C123 statement move | nB2 | s22, s24 | held |
| story C124 ledger step with dependants | nB2 | s18 | failed (no ask, B29·D16) |
| story 🎯 / ledger moves | nB2 | s15, s18, s20, s21 | held (🎯 and step move + undo) |
| story A28-13 (correction to the corrected message's problem) | nB2 | p10, p12 | held at the page level — the truck correction stayed in the budget problem after the table problem opened (but touched unrelated amounts, B29·D14) |
| forecast C118 (bare «N درصد» in the next clause) | dB2 | p3 | failed — «… و ۵۰ درصد که …» stayed inside the first 🎯 |
| forecast C119 (plain «مطمئنم») | dB2 | p4 | failed (B29·D23) |
| forecast C120 («حدودِ N») | dB2 | s26–s28 | held (asked; «نشد» settled) |
| forecast C121 (🎯 under its problem) | nB2, nB1 | p13, c27 | failed (B29·D7) |
| forecast C122 (bare «۶۰» answer) | dB2 | — | not reachable (the page never asked «چند درصد؟» for «مطمئنم»); dB1 «۶۵ درصد» answer to the «تقریباً مطمئنم» ask held |
| arith C105 «تومن» | nB2 | p6 | held |
| arith C106 m2 answer forms | — | — | not reachable (no m2 ask raised) |
| arith C108 remainder with stated total | nB2 | p4 | failed (B29·D10) |
| arith «A و N دهم» | nB2 | p3 | held |
| arith narrower «≈» (C9) | nB2, aB2, s18 | p6, p12 | held |
| dates C117 «زنگ زدم» with two calls | dB2 | c9 | failed (B29·D19) |
| correction C89 with two corrections | nB2 | p8 | failed (B29·D13) |
| correction C28-14 (pwC1) | — | — | not reachable (group C) |
| correction D28-14 «۱۸ ⇒ ۲۰» | — / nB2 | p10 | tD1 not in B; the same `runs25` family seen in nB2: «۴ میلیون و ۲۰۰ ⇒ ۴ میلیون و ۵۰۰» became «۲۰۰ ⇒ ۵۰۰» on unrelated amounts — still wrong, as expected |
| C134 (weekday nearest to the replaced date) | dB2 / dB1 | c12 / c42 | held for the past-day ask; the «what» part not exercised |

## 14. Fixers' «Not done» lists (run where B has the shape)
- arith: «M تا کم میاد» unread (nB2 p4) — confirmed; «a√b» not computed — nB1 «۲√۳ متره» silent (no «=»); 📜 mark after an m2 answer — not reachable; >5 compounds — not run.
- correction: #57 (chat line not rewritten) — nB2 accept left her chat line; #64/#78 not shaped; D28-14 family confirmed (nB2 p10).
- dates: «حدودِ ۱۵ دی» booked with her words ✓ (dB1, dB2); «وسطِ ماه کارگر میاد» — no ask ✓ (dB2 c15).
- forecast: C121 not done — confirmed (nB1, nB2); B28·D14 forecast-sentence date ask — still (nB1, dB1, dB2).
- prior: #226/#229/#235 not shaped in B.
- story: «X یه حسابِ دیگه (هم) کرد:» coach line — confirmed AND 📜 also «داده» (nB2 p5); moved 🎯 does not rewrite x.prob — the moved 🎯 is still settled from the budget turn (nB2 p15, it had been moved back) — not separable here.
- surface: C27-6, A28-36 see table 13.

## 15. Progress metrics (roadmap §22, group B)
| round | runs | PASS | S1 | S2 | S2 per run | repeat-family S2 | new-family S2 |
|---|---|---|---|---|---|---|---|
| 28 | 30 | 11 | 1 (F1) | 17 | 0.57 | — | — |
| 29 | 32 | 11 | 1 (F1: prior ledger) | 13 | 0.41 | 12 (F4 ×3, F6 ×4, F8 ×3, F11 ×2) | 1 (loop B27·D16, carried) |
S2 list: B29·D4, D6, D17 (F4); D18, D19, D20, D21 (F6); D13, D14, B26·D31 (F8); B27·D7 aB2, B28·D9 nB1 (F11); B27·D16 (loop). 22 of the 30 round-28 B defect instances re-run are FIXED or CHANGED to milder; the two new arm scenarios carry most new S2 (dB2 5, nB2 2).

## 16. New owner-like questions
- «وقتی خودم گامِ غلطم را درست کردم، چرا دفتر هنوز می‌گوید «نمی‌خواند» در حالی که کنارِ همان جمله ✓ هست؟»
- «اگر یک پیام را با ✏️ اصلاح کنم، چه چیزهای دیگری از همان پیام بی‌صدا عوض یا بسته می‌شود؟»
- «وقتی دو تماس دارم و فقط می‌گویم «زنگ زدم»، کدام را بستی و چرا نپرسیدی؟»
- «پیش‌بینیِ دوتایی‌ام (ریدینگ و لیسنینگ) یکی شد؛ وقتی نیمه‌اش غلط درآمد، کالیبراسیونم چه شد؟»
- «پیشنهادِ «دقیق» از کجا آمد — از حسابِ واقعی یا از نسبتِ دو عدد؟»
- «چرا جملهٔ پیش‌بینی‌ام در پرونده «داده» است و 🎯 ندارد؟»

## 17. Time / tokens
About 1 h 55 min wall time (07:28–09:23 UTC): 30 replays of round 28 (signature-logged reuse of the 288 round-28 model answers; prompts that changed were reviewed through sysdiff/pdiff and the replies kept where the page result did not depend on them — nB1 p3 reply is stale against the new ✓ line, better/r3.txt written), 2 new arm scenarios with 37 hand-written model answers (nB2 16, dB2 21) and 13 page-move/probe evals. Token count not visible.

## Files
- per scenario: round29B/<sid>/{findings.md, mail.html, mail.subject.txt, DONE, out/, ai/, ctl/, post.txt}; nB1/better/r3.txt
- round29B/defects.md, round29B/PARTS.md, round29B/notes.txt (raw observations), round29B/sent.txt (32 sent e-mail ids)
- harness/driver: round29B/tools/ (drv27.py replaying round28B, data29.py, gen29.py, fa29.py, marks.py, dos2.py, leak.py, mvjs.py)
