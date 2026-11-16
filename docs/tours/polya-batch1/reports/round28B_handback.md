# دورِ ۲۸ · گروهِ B — گزارشِ نهایی (runner)

30 runs (28 round-27 replays on main 33f7de9f + 2 new arm scenarios nB1, dB1), all judged, 30 e-mails sent to the owner (ids in round28B/sent.txt). Totals: 11 PASS, 19 FAIL; **1 S1** (B28·D1, nB1 p3: correct million-sum told ✗); 17 S2 instances; harness note: every replayed model answer was checked against the new prompt with a strict signature stop and re-answered where the turn question or a page block changed.

## 1. Per scenario: RESULT, defects (p<N>), ارتقای لازم
### s11 — برنامه‌نویسِ ۱۹ ساله و دومینوی صفحهٔ بی‌دوگوشه
RESULT: FAIL — 3 S3
Defects:
- U35 (S3, c) s49: ask list names «صورتِ مسئله» twice
- B25·D26 (S3, b) post 📜: correct prior counts (98, 49) never credited in either live problem
- B24·D16 (S3, c) post 📜: «اصلاح شد ⇐ «صفحهٔ ۱۰×۱۰» → «صفحهٔ ۸×۸»» two arrow forms
ارتقای لازم:
- پلِ «کارِ پیشینِ تو» از دفترِ گفت‌وگو به مسئلهٔ زنده‌ای که از آن ساخته شد.

### s12 — بانوی ۶۷ ساله و جدولِ روزنامه
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ؛ فقط نگه‌داشتنِ همین رفتار)

### s13 — کارمندِ ۳۳ ساله و همکاری که فاکتور را بیشتر می‌نویسد
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### s14 — دانشجوی ۲۰ ساله و «کدوم فرمول کی» (آمار)
RESULT: FAIL — 4 S3
Defects:
- B26·D3 (S3, b) s17: deadline booked without her yes and the same date asked in the same turn
- U26 (S3, b) p3: «۱ + ۰.۳ … ≈ ۱.۳» unread
- B27·D7 (S3, b) post 📜: five «کارِ تو» lines of the packet problem (۳ آبان), the n−1 guess/unknown (۱۲ آبان) and the practice result «۴۰٪» filed under «میانگینِ ۳۶ …»
- B28·D16 (S3, b) post 📜: no page ✓/✗ beside her «کارِ تو» arithmetic lines (−28/4 = −7, 1.3)
ارتقای لازم:
- پنجرهٔ 📜 هر مسئله از صورتِ خودش؛ ✓/✗ ِ صفحه کنارِ هر سطرِ حسابِ او.

### s15 — ژیلا، معلمِ ریاضی، و کلاسِ ساکت
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- دفترِ آزمایشِ کلاس (روز، پرسش، چند نفر جواب دادند).

### s16 — پدر و باغچهٔ دخترش
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- کارتِ «پرسش برای بچه» که پدر بلند بخواند.

### s17 — باغدارِ ۵۲ ساله و مخزنِ آبِ باران
RESULT: FAIL — 2 S3
Defects:
- U38 (S3, b) post: proposed «ریاضی‌کردن» keeps the old 0.8 factor
- B24·D16 (S3, c) post 📜: «⇐ … →» in one line
ارتقای لازم:
- یک قراردادِ پیکان برای همهٔ سطرهای تاریخچه.

### s18 — نوجوانِ ۱۸ ساله و قیفِ مخروطی
RESULT: FAIL — 2 S3
Defects:
- B28·D13 (S3, b) p10–p16, post strip: after the correction re-opened the check, her new check (p12) and look-back answers never move the stage back: «اکنون: اجرای طرح · مانده: نامعلوم — طرح هنوز نیست» (r27: بازنگری, حل به نتیجه رسید)
- B24·D16 (S3, c) post 📜: two arrow forms
ارتقای لازم:
- وارسیِ دوبارهٔ او پس از اصلاح مرحله را به بازنگری برگرداند.

### s19 — ۳۶ ساله و ۸ کیلو تا عروسیِ برادر (۱۸ هفته)
RESULT: FAIL — 2 S2 + 3 S3
Defects:
- B28·D2 (S2, b) c62 (p12): 🎯 «جلسه‌ی اول خسته می‌شم ولی می‌رم» (۷۰٪) settled «⇐ شد» by the unrelated correction «یه چیز قدیمی رو هم اصلاح کنم: اون شب مهمونی…» before the Sunday outcome
- B28·D7 (S2, b) c87: «همون ۱۵ اسفند درسته» to the page's «شنبه ۱۵ اسفند … درست است؟» not read as yes ⇒ «بی‌جواب ماند، ثبت نشد» (r27 booked it)
- B27·D11 (S3, c) post 📜: correction header misstates the change
- B27·D4 (S3, b) post 📜: her plan text with ZWNJ stripped
- B24·D16 (S3, c) post 📜: two arrow forms
ارتقای لازم:
- سرانجامِ 🎯 فقط از جمله‌ای که نتیجهٔ همان پیش‌بینی را می‌گوید.
- «درسته» با متنِ بیشتر هم «آره» است.

### s20 — پژوهشگرِ گامای E–I–PV
RESULT: FAIL — 1 S2
Defects:
- B28·D12 (S2, b) post 📜: her own parameter message «استادم میگه «یه ایده بده»… ببین، g_EE رو ۰.۸ گذاشتم، τ_I رو ۸ میلی‌ثانیه…» filed as «کارِ دیگری — نه نتیجهٔ تو» (one quoted sentence of her professor makes her own work someone else's; C57/C79)
ارتقای لازم:
- «کارِ دیگری» فقط برای جمله‌ای که خودِ حساب یا نتیجه را به دیگری نسبت می‌دهد.

### bp1 — ۱۵ ساله و n²−1 بخش‌پذیر بر ۸
RESULT: FAIL — 1 S3
Defects:
- B24·D15 (S3, b) p11: turn question ignores her own check in the same message
ارتقای لازم:
- پرسشِ نوبت وارسیِ خودِ او را نام ببرد و فقط از کلیت بپرسد.

### bp2 — کشاورزِ ۴۸ ساله و آبِ بارانِ پشت‌بام
RESULT: FAIL — 4 S3
Defects:
- B27·D6 (S3, b) post strip: stale mark not cleared after his redo
- B26·D12 (S3, b) p12: self-label line names the wrong prerequisite
- B28·D15 (S3, c) post 📜: stale line garbled: «(۷ ⇐ ۷٫۵،» (اصلاح شد ⇐ «۷٫۵،»)، «۷۰۰۰ ⇐ ۷۵۰۰)»» and 🎯 text is only «هشتاد درصد مطمئنم» (no outcome)
- B24·D16 (S3, c) post 📜: two arrow forms
ارتقای لازم:
- متنِ 🎯 خودِ پیش‌بینی را بگوید؛ بازحسابِ او نشانِ کهنه را بردارد.

### bp3 — نردبان و سه پیش‌نیازِ تودرتو (۱۴ ساله)
RESULT: FAIL — 1 S3
Defects:
- B26·D12 (S3, b) p13: self-label line names the wrong prerequisite
ارتقای لازم:
- خطِ «این کم‌هوشی نیست» دلیلِ خودِ او را نقل کند.

### aB1 — آوا، ۹ ساله، و اتوبوس‌های اردو
RESULT: FAIL — 2 S3
Defects:
- B26·D16 (S3, b) p9: birth sentence already stored: no page line
- U26 (S3, b) p5: «۴۲ ضربدر ۵ … ۲۱۰» unread
ارتقای لازم:
- کارتِ «ضرب کن ببین همه جا می‌شن؟» برای کودک.

### aB2 — ۱۶ ساله، استقرا و «چرا» ی جمعِ فردها (بازنگری)
RESULT: FAIL — 1 S2 + 2 S3
Defects:
- B27·D7 (S2, b) post 📜: problem 2 «1+3+5+…+99» carries nine problem-1 chat entries (۳ آبان); problem 1 misses its «پرسشی که کمک کرد» and taste lines
- B24·D18 (S3, b) post 📜: «فرمِ فهم» listed after the results
- B28·D16 (S3, b) post 📜: no ✓/✗ beside «کارِ تو» lines such as «۲ + ۴ = ۶ = 2 × 3 ✓»
ارتقای لازم:
- پنجرهٔ 📜 هر مسئله از صورتِ خودش.

### aB2f — نوجوانی که جمعِ فردها را خودش می‌خواهد حل کند
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### aB3 — بازنشستهٔ ۶۷ ساله و پس‌انداز (شش ماه)
RESULT: FAIL — 4 S3
Defects:
- U49 (S3, b) p9/p14: stated confidence makes no 🎯
- U26 (S3, b) p15: «۲۰ درصدِ ۳۰۰ میلیون رو بذارم طلا، میشه ۶۰ میلیون» unread
- B25·D24 (S3, b) post 📜: data rows are sentence fragments
- B24·D16 (S3, c) post 📜: two arrow forms
ارتقای لازم:
- هر «N درصد مطمئنم» با نتیجهٔ آینده یک 🎯.

### aB3x — بازنشسته — تاریخِ تولد در گفت‌وگو
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### aB3y — بازنشسته — تبدیلِ نادرست در متنِ پاسخ
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### aB4 — مادربزرگِ ۸۲ ساله و معمای مرغ و خرگوش
RESULT: FAIL — 1 S3
Defects:
- B27·D4 (S3, b) s1/Today: quote shown as «» جواب رو نگو، …» — a stray empty «» before her words
ارتقای لازم:
- نقل‌ها بی نشانهٔ اضافه.

### oB1 — کاربرِ مالک‌مانند: بیداریِ ساعت ۶، شام و سه مسئله (چندروزه)
RESULT: FAIL — 4 S2 + 3 S3
Defects:
- B28·D10 (S2, b) c21 (p21): dinner problem «به همین بیداری ربط داره ولی جداست…» not registered: bound to the closed wake-up problem, kept as look-back note «مسئلهٔ زنده ساخته نشد» (r27: own problem 3) — regression
- B28·D2 (S2, b) c31: «دیدم، الان درست شد» (about the page) settled the dinner 🎯 (۹۰٪) «⇐ شد» days before its Friday; corrected only at c32
- B28·D3 (S2, b) c34: a new 🎯 made from her past report «پیش‌بینیم ۴ از ۴ با ۹۰ درصد بود، پس غلط درومد»
- B28·D5 (S3, b) c29, c36: «شد یا نشد؟» asked on a complaint sentence; at c36 the page settles the wake-up 🎯 and in the same turn asks «کدام پیش‌بینی؟» listing two non-matching ones
- B26·D31 (S2, b) post 📜: closed problem's «حل شد» and look-back stand unmarked after 5⇒4
- B27·D14 (S3, b) c17: questions about the page counted as a problem
- B27·D7 inst. (S3, b) post 📜: ۲۲ آبان wake-up result «شد ۵ روز» filed under dinner; session questions under wake-up
ارتقای لازم:
- مسئلهٔ تازه‌ای که «جدا» خوانده شد همیشه رکوردِ خودش را بگیرد.
- 🎯 فقط با جملهٔ نتیجهٔ همان پیش‌بینی بسته شود.

### pwB1 — مهندسِ ۳۱ ساله و پمپِ خورشیدیِ باغِ پدر (سه گزارش)
RESULT: FAIL — 2 S3
Defects:
- B28·D15 (S3, c) c22 (p13): correction result lists «۰٫۰۸۲ ⇒ ≈ ۰٫۰۹۸، ۰٫۰۸۲ ⇒ ۰٫۰۹۸» twice
- B24·D16 (S3, c) post 📜: two arrow forms
ارتقای لازم:
- فهرستِ پیشنهادها بی تکرار.

### pwB2 — پدرِ ۴۴ ساله: شیراز یا تهران
RESULT: FAIL — 2 S2 + 1 S3
Defects:
- B28·D9 (S2, b) c18 (p9): her fix of step 5 «شیراز = ۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۱٫۴ = ۷٫۷» no longer lands in the ledger (r27: «✓ … نشست»): step 5 stays «⚠️ ناقص», resume point stays at step 5 — regression
- B28·D7 (S2, b) c23 (p14): «باشه» to «۲۵ آبان با صاحب‌خونه… قرار دارم» booked it as a ⏰ reminder of the other plan «تا جمعه به مدیرِ شیراز جواب می‌دم» («یک کار، دو تاریخ») — her appointment swallowed by another record
- B25·D24 (S3, b) post 📜: data rows are comma fragments of his fix
ارتقای لازم:
- اصلاحِ خودِ او در همان پیام به دفتر برسد؛ یک قرارِ تازه هرگز یادآورِ کارِ دیگری نشود.

### pwB3 — قابِ عکس — آغاز با یک گامِ حل‌شده
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### tB1 — جعبه‌قرصِ هوشمند برای مادر — حلقهٔ قلمرو
RESULT: FAIL — 1 S2 + 1 S3
Defects:
- B27·D16 (S2, b) c17–c19: a reply whose only overlap is frame words is rejected («جواب نداد») instead of asked (C2/C20); output identical to round 27
- U59 (S3, b) s24: sheet stays «open» after the take-back closed the need
ارتقای لازم:
- پس از هر رسیدن، آزمونِ ابزار روی دادهٔ خودِ او.

### tB1x — جعبه‌قرص — «خودم یه راه دیگه پیدا کردم»
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### tB1y — جعبه‌قرص — تساویِ واقعیِ دو ابزار (T1)
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (هیچ)

### tB1z — جعبه‌قرص — سه ابزارِ تازه، بستن و تکه‌ای پس از بستن
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- آزمونِ «روی دادهٔ خودت» پس از رسیدنِ ابزار (بانکِ ۴۵).

### nB1 — کافه‌دارِ ۳۸ ساله: سرامیکِ کف و قفسه‌ها (تازه: T3/T11/T13/T14/T15/T19/T20)
RESULT: FAIL — 1 S1 + 5 S2 + 7 S3
Defects:
- B28·D1 (S1, b) p3 (c3): correct «۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰» (9.9M + 2.8M = 12.7M; the only fitting reading, C63) told to the coach ✗ «۱۱٫۰۰۱۷ میلیون (با … ۹۰۰ هزار: ۱۱٫۹۰۰۸)» — the both-thousand reading never tried; the coach said it does not fit
- B28·D8 (S2, b) p4–p5: her fix of a RESULT «… منهای ۵۰۰ هزار میشه ۲ میلیون و ۳۰۰» changed the glue price datum «۸۰۰ ⇒ ۳۰۰»; her «اون ۸۰۰ رو عوض نکن» restore refused «مقدارِ درست با مقدارِ پیشین فرقی نداشت»
- B28·D3 (S2, b) p15 (c23): 🎯 «۲۳ تا مصرف بشه و یکی بمونه» stored at ۹۰٪ — her own was ۷۰٪; ۹۰ is the brother's
- B28·D2 (S2, b) p18 (c26): «شد. پیش‌بینیِ ۲۳ کارتن درست درومد … ۲۲ کارتن بسه غلط بود» settled «۲۳ کارتن» ⇐ نشد (it came true)
- B28·D11 (S2, b) c16–c20 (T13): move «↪ این سطر مالِ مسئلهٔ سرامیک» marks the source «جابه‌جا شد» but no copy appears in the floor problem and no ↩ undo anywhere; opening the floor dossier shows the shelves dossier
- B28·D9 (S2, b) p14 (c22): after both became live problems the floor problem shows the SHELVES 2-step ledger; its own 4-step ledger (stale marks, accepted 20.83) is gone
- B28·D4 (S3, b) p16: «پیش‌بینیِ ۲۳ تا رو الان ۶۰ درصد مطمئنم، نه ۷۰» made a second 🎯 instead of updating (C77)
- B28·D5 (S3, b) p16–p19: «فکر کنم ۷۰ درصد نصب تا عصرِ شنبه تموم میشه» no 🎯 (two forecasts, one made); clear outcome asked «شد یا نشد؟» instead of settled; her naming of three outcomes answered with «کدام پیش‌بینی؟» listing four
- B28·D14 (S3, b) p16–p17: a forecast sentence («احتمالش ۵۰ درصده که کاشی‌ها بشکنن») raised a date ask, later «بی‌جواب ماند»
- B28·D15 (S3, c) p1, p5: exact value told as «۹٫۹ میلیون» for her «۹۸۰۰ هزار» (C45); correction result line repeated ×5
- B28·D17 (S3, b) p9: «۴ ردیف و ۵ ستون میشه ۲۰ تا» unread (C40/C41)
- B28·D19 (S3, b) p7–p8: after accepting 20.83 (C68) the dependent step 4 gets no fresh exact proposal
- B27·D7 inst. (S3, b) post 📜: shelves 📜 starts with the floor's correction line (۱۰:۴۲) before its own statement
ارتقای لازم:
- خواندنِ «N میلیون و M» با هر دو خوانش برای همهٔ عملوندها.
- اصلاحِ یک نتیجه هرگز رقمِ یک داده را عوض نکند.
- جابه‌جاییِ سطر: رونوشت و دکمهٔ برگرداندن در مقصد.

### dB1 — معلمِ ۴۵ ساله و برنامهٔ مرورِ کلاس (تازه: T16/T17/T18، U21، U41)
RESULT: FAIL — 3 S2 + 5 S3
Defects:
- B28·D6 (S2, b) p8–p10: «بعد از عید …», «وسطِ ماه …» and even «وسطِ ماه یعنی حدودِ ۱۵ دی» answered «امروز خودش جمعه است: همین امروز یا جمعهٔ بعد (۹ آذر ۱۴۰۵)؟» on a MONDAY (9 Azar is a Monday); C50/C70 want an ask anchored on 1 Farvardin / an ask with no number
- B28·D7 (S2, b) p11: «عید درسته» booked the OLDER ask «وسطِ ماه یعنی حدودِ ۱۵ دی» on ۲ آذر ۱۴۰۵ (a past day) and left the عید ask «بی‌جواب ماند»; Monday asks still «open» on Friday (C69)
- B28·D2 (S2, b) p14: «آزمون رو امروز گرفتم: میانگین شد ۱۳٫۲!» settled «هیچ‌کس زیرِ ۱۰ نگیره» ⇐ شد (not mentioned); the mean 🎯 stayed open
- B28·D4 (S3, b) p13, p17: «میانگینِ ۱۳ رو هم الان ۸۰ درصد مطمئنم، نه ۷۰» a duplicate 🎯; both later settled «شد» ⇒ one forecast counted twice in the mind card («۳ بار از ۳»)
- B28·D5 (S3, b) p12–p15: «تقریباً مطمئنم» not asked by the page; bare «۶۵ درصد» reply makes no 🎯 (C76); «شد یا نشد؟» asked on three messages with no outcome
- B28·D14 (S3, b) p4, p15, p10: «پنجشنبه نه، یکشنبه»: Sunday never asked (undated plan); ✏️ Monday⇒«شنبه» re-anchored to the edit day (۱۴ آذر) not to the day said (past ۷ آذر); «آخرِ سالِ تحصیلی» neither asked nor booked
- D27-29 rem. (S3, b) p18: practice prompt has «۰ جلسه · موعد … (گذشته)» but no schedule ladder
- B24·D16 (S3, c) post 📜: two arrow forms
ارتقای لازم:
- اصطلاحِ تاریخی که روزِ دقیق ندارد فقط «کدام روز؟» بپرسد، بی عدد و بی «جمعه».
- «آره/درسته» به پرسشی بخورد که او نامش را برد.
- یک پیش‌بینی با عددِ تازه یک 🎯 با تاریخچه.
## 2. Round-27 defect table

| id | status | evidence |
|---|---|---|
| B26·D7/U24 | FIXED | s11: post mind card: no «درست نبود» line |
| U35 | STILL | s11: s49 «صورتِ مسئله» named twice in the ask list |
| B25·D26/U36 | STILL | s11: post 📜: no «کارِ پیشینِ تو» entry, 98/49 never credited |
| B24·D16 | STILL | s11: post 📜 «⇐ … →» in one line |
| B27·D4 | FIXED | s12: post 📜 «مرتب کن»، «تو آناگرام» byte-exact |
| U37 rem. | FIXED | s12: strip «بازنگریِ خودتان» |
| B27·D5 inst. | FIXED | s13: c35: no shifted re-ask |
| B27·D5 | FIXED | s14: c41: no 1406 re-ask |
| «آخرِ سال» | FIXED | s14: c42 ⇒ ۲۹ اسفند ۱۴۰۵ |
| B26·D3 | STILL | s14: c17 ⏰ «میان‌ترمِ آمار» booked without yes + same-date ask |
| U26 fam. | STILL | s14: p3 «۱ + ۰.۳ ... یعنی تقریباً ۱.۳» silent |
| B27·D7 inst. | STILL | s14: post 📜 packet work / n−1 question / practice result under the mean problem |
| B27·D1 | FIXED | s15: c6/c7 no 📅 ask, no Today line |
| B27·D9 | FIXED | s17: p10 ✗ «۲.۵ متر × ۴» ⇒ ۱۰ مترمربع |
| B27·D8 | FIXED | s17: c45 ۱۶٫۸ ⇒ ۱۶٫۲ |
| U38 | STILL | s17: post proposal «حجم = ۱۸۰ × ۰٫۱۲ × ۰٫۸ = ۱۷» keeps 0.8 |
| B24·D16 | STILL | s17: post 📜 two arrow forms |
| B24·D16 | STILL | s18: post 📜 4 lines with two arrow forms |
| B27·D10 | FIXED | s19: c57 one ask «به‌جای ۲۸ آذر» |
| «عید» | FIXED | s19: c88 ⇒ ۱ فروردین ۱۴۰۶ |
| B27·D11 | STILL | s19: post header «عروسی ۱۵ اسفنده» (⇐ «۱۶ هفته…») |
| B27·D4 fam. | STILL | s19: plan text «هفته ای … می رم» ZWNJ stripped |
| B24·D16 | STILL | s19: post 📜 |
| B24·D15 | STILL | bp1: p11 turn question «ثابتش می‌کنی یا ردش می‌کنی؟» after her own expansion |
| U49 | FIXED | bp2: post 🎯 «هشتاد درصد مطمئنم» 80% |
| B27·D6 | STILL | bp2: strip «نتیجه با عددِ پیشین…» after his redo |
| B26·D12 | STILL | bp2: s29 self-label names «تبدیلِ مترمکعب به لیتر» |
| B24·D16 | STILL | bp2: post 📜 |
| B26·D12 | STILL | bp3: s19 «مساحتِ مثلث» while her feeling was about the theorem |
| B26·D16 | STILL | aB1: p9 birth sentence, no page line |
| U26 fam. | STILL | aB1: p5 «۴۲ ضربدر ۵ … ۲۱۰» silent |
| U26 «…» | FIXED | aB2: p12 ✓ 210, ✗ 104 |
| B27·D7 | STILL | aB2: post 📜 problem 2 carries 9 problem-1 entries |
| B24·D18 rem. | STILL | aB2: problem 1 «فرمِ فهم» after results |
| U50 | FIXED | aB3: c13 ⏰ attached to 📌 |
| «سرِ برج/عید» | FIXED | aB3: c20 |
| U49 | STILL | aB3: p9 «۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره» no 🎯 |
| U26 fam. | STILL | aB3: p15 «۲۰ درصدِ ۳۰۰ … میشه ۶۰» silent |
| B25·D24 | STILL | aB3: post 📜 data fragments |
| B24·D16 | STILL | aB3: post 📜 |
| U52/B25·D17 | FIXED | aB3y: p3 rewrite «تبدیلِ صفحه ۳ مه ۱۹۵۹» |
| B27·D4 inst. | CHANGED | aB4: «نگو» byte-exact; a stray «» still opens the quote |
| B27·D1 inst. | FIXED | oB1: c3/c4 |
| U49 fam. | FIXED | oB1: c12 🎯 existed before outcome |
| B27·D15 | FIXED | oB1: c38 binds at once; dinner results under dinner |
| B27·D5 | FIXED | oB1: c23 |
| B26·D31 rem. | STILL | oB1: post wake-up «حل شد» unmarked after 5⇒4 |
| B27·D14 | STILL | oB1: c17 page questions registered as chat problem 2 |
| B27·D9 inst. | FIXED | pwB1: p14 ✗ ۱۴ |
| B27·D13 | FIXED | pwB1: p14 «۳۵۳٫۱۶ هزار» |
| B24·D16 | STILL | pwB1: post 📜 |
| B27·D12 | FIXED | pwB2: c18 no 6.05 |
| B27·D5 | FIXED | pwB2: c18–c24 |
| B25·D24 | STILL | pwB2: post 📜 data fragments |
| B27·D3 | FIXED | pwB3: p1 prior block, step 1 ✓ |
| B27·D2 | FIXED | pwB3: p3 stage بازنگری |
| B27·D17 | FIXED | tB1: no «پرسشِ این نوبت همان «پیش‌نیاز»» line |
| B27·D16 | STILL | tB1: c17–c19 output identical to r27 |
| U59 | STILL | tB1: sheet #101 «open» after take-back |
| B27·D17 | FIXED | tB1y: p9–p10 no wrong context line |
| B27·D19 | FIXED | tB1z: c14 |
| B27·D18 | FIXED | tB1z: post mind card |

New this round (B28·D*): D1 S1 million-sum readings · D2 S2 🎯 settled by the wrong sentence/outcome · D3 S2 🎯 from another person's or a past confidence · D4 S3 duplicate 🎯 for a re-stated number · D5 S3 🎯 asks/misses · D6 S2 false «امروز جمعه است» date fallback · D7 S2 yes bound to the wrong ask / «درسته» unread / appointment swallowed · D8 S2 result fix rewrites a datum, undo refused · D9 S2 prior fix not merged / wrong ledger shown · D10 S2 third problem not registered · D11 S2 📜 move loses the line · D12 S2 own work filed as «کارِ دیگری» · D13 S3 stage strip regresses · D14 S3 date-ask edges · D15 S3 duplicate/garbled lists, C45 scale · D16 S3 no ✓/✗ beside «کارِ تو» lines · D17 S3 «N ردیف و M ستون» unread · D19 S3 C68 dependants.
Fixers' «Not done» claims run: #233 not reproduced in this replay (no ✏️-backfilled line order issue seen in s19); #236 not exercised; s28 p4 (second problem inside a prior-work report) works in nB1 p9; C27-6 (sentence after closure) PASS in nB1 p21 (no new chat problem); `m2` «کدام؟» answered by her — not reached (the page never asked m2; it judged both-fit lines ✓); C68 in a chat-only problem worked in nB1 p7 (chat ledger); D27-16 not in group B; dates «done» stem: «با مدیر شنبه‌ی پیش صحبت کردم» closed via the coach (plan_done) — page stem alone not observed; D27-29 second half PARTIAL (dB1 p18: due date, no schedule); ✏️ into the past: re-anchored to the edit day and asked (dB1).

## 3. ARMS TABLE (T1–T20)

| arm | scenario | p<N> | verdict |
|---|---|---|---|
| T1 real tie | tB1y | p9–p10 | PASS (both named; ordinal «دومی» read, C81) |
| T2 piece after closure | tB1z | after closure | PASS |
| T3 «= N unit» | s17 / pwB1 / nB1 | p10 / p14 / p1 | PASS («۲٫۵ متر × ۴ = ۱۲» ✗ ۱۰; «۲ تکه‌ی ۷ متری = ۱۵» ✗ ۱۴; «۶ متر در ۵ = ۳۰» ✓) |
| T4 third prior report | pwB1 | p11–p12 | PASS |
| T5 take back own dispute | pwB2 | p7 | PASS |
| T6 «جمعهٔ بعد» / «باشه» | pwB2 / dB1 | p12, p14 / p7 | PARTIAL — read; pwB2 p14 «باشه» attached her new appointment to another plan (B28·D7) |
| T7 5⇒4 on used datum | oB1 | p29–p31 | PARTIAL — 🎯/practice ✓; closed problem's «حل شد»/look-back unmarked (B26·D31) |
| T8 two open predictions | oB1 / nB1 / dB1 | c36 / p17–p19 / p14 | FAIL — wrong 🎯 settled, ask+declare, naming not read (B28·D2, B28·D5) |
| T9 coincidental 15 | pwB1 | s22 | PASS |
| T10 ÷ / تقسیم بر / glued fraction | aB2 / nB1 | p13 / p1, p3 | PASS |
| T11 correction + question | nB1 / s17 | p8 / p9 | PASS |
| T12 one worked step (+) / mid-session calc (−) | pwB3 (+) / nB1 p2 «۲ × ۳ = ۶ تا تخم‌مرغ», p7 «۷ × ۸ = ۵۶ بود دیگه؟» (−) | p1 / p2, p7 | PASS (B27·D3 fixed) |
| T13 move misfiled 📜 line + undo | nB1 | c16–c20 | FAIL — source marked moved, copy invisible, no undo (B28·D11); 🎯 and ledger steps: no move button (as the fixer said) |
| T14 accept proposal / negation / chat-only | nB1 | p7–p8 | PARTIAL — «آره، همون ۲۰٫۸۳ درسته» rewrites step 2 with history; «۲۲٫۸۳ نیست» keeps the mark and her own 22.91 is accepted; dependants get no fresh proposal (B28·D19); this was a chat-only problem and acceptance worked through the chat ledger |
| T15 scale ambiguity and roots | nB1 | p3–p5 | FAIL — one-reading-fits sum shown ✗ (S1 B28·D1); both-fit «… تقسیم بر ۲ = ۱ میلیون و ۴۰۰» ✓; none-fits ✗ with a wrong alternative value «۲٫۰۰۰۳»; «√(۱۵² + ۸²) ≈ ۱۷» ✓; «≈ ۱۶» NOT RUN (not sent); «۲√۳ متره» silent (no «=») |
| T16 date asks | dB1 | p2–p4, ✏️ c9–c12, ✏️ c40s | PARTIAL — newest-only yes ✓; ✏️ day change one line one ask ✓; ✏️ into the past re-anchored to edit day (S3); «پنجشنبه نه، یکشنبه» Thursday not booked ✓, Sunday not asked ✗ |
| T17 idiom dates | dB1 / aB3 / s14 / s19 | p6–p10 / c20 / c42 / c88 | FAIL — «سرِ برج», «آخرِ سال», «عید» ✓ (and «عید» after Farvardin ⇒ 1407 proposal ✓); «بعد از عید», «وسطِ ماه» ⇒ false «امروز جمعه است … ۹ آذر» (B28·D6); «آخرِ سالِ تحصیلی» not asked, not booked; «اولِ ماه» NOT RUN (not sent) |
| T18 confidence phrasings | dB1 / nB1 / oB1 / aB3 | p11–p17 / p5, p15–p16 / c34 / p9 | FAIL — «N درصد مطمئنم» ✓, «احتمالش N درصده» ✓, «فکر کنم ۷۰ درصد» ✗, «تقریباً مطمئنم» not asked by the page, past ✓ (dB1) / ✗ (oB1), someone else's ✓ (dB1) / ✗ contaminates hers (nB1), new number ⇒ duplicate 🎯, two in one message ⇒ one, outcome ⇒ wrong 🎯 settled |
| T19 someone else's work | nB1 / s20 | p6 / post | PARTIAL — brother's «۳ روز × ۴۰۰ هزار = ۱۲۰۰ هزار» «کارِ دیگری» ✓; adoption «منم همینو قبول دارم» NOT RUN (not sent); over-filing of her own work (s20, B28·D12) |
| T20 hypothetical / bare question | nB1 / pwB3 | p6, p7 / p1 | PASS |
| U21 «تا جمعه» on a Friday | dB1 | p11 | FIXED («همین امروز یا جمعهٔ بعد (۱۳ آذر)؟») |
| U27 wrong running sum with unit | nB1 | p8 | FIXED (✗ 23.6) |
| U28 division slip vs unit error | nB1 | p8 | FIXED (arithmetic ✗, exact ۴۸۰ هزار) |
| U41 calibration row count | dB1 | post mind card | FIXED for the count (۳ of ۳ = three judged 🎯) — but two are the same forecast (B28·D4) |
| U56 page suggestion repeated | — | — | NOT RUN: no turn built where a page suggestion is answered and then repeated |

## 4. 📜 line-match tables (multi-problem scenarios, with page marks)

**nB1**
| 📜 of | line | belongs to | mark | verdict |
|---|---|---|---|---|
| قفسه‌ها | ۱۰:۴۲ «۲ میلیون و ۳۰۰ (⇐ … ۲ میلیون و ۵۰۰)», «ثبتِ از گفت‌وگو ۳۰۰ ⇐ ۸۰۰» | سرامیک (and a wrong change) | — | ✗ wrong problem, before its own statement |
| قفسه‌ها | statement, unknown, data «۵ تا ۶۰ تا میشه ۳۰۰ سانت» | قفسه‌ها | ✓ «حسابِ صفحه: درست» | ✓ |
| قفسه‌ها | data «۴ ردیف و ۵ ستون میشه ۲۰» | قفسه‌ها | none (unread) | ⚠ no mark |
| قفسه‌ها | prior ledger (2 steps), data «۲۴۰ ÷ ۶۰ = ۴» | قفسه‌ها | ✓ | ✓ |
| قفسه‌ها | plan «نصبِ سرامیک افتاد برای شنبه» (۱۰:۴۵) | سرامیک | — | ✗ wrong problem (no move button: imported line) |
| قفسه‌ها | plan «برای کف ۲۳ کارتن کمه و ۲۴ تا بگیرم» | سرامیک | — | ✗ → moved: «جابه‌جا شد ⇒ سرامیک», copy not visible in سرامیک (B28·D11) |
| قفسه‌ها | result «یخچال … ۱۹ تا قفسه» | قفسه‌ها | — | ✓ |
| سرامیک | dossier not reachable (opens the shelves dossier); its evlog holds the same two shelves lines | — | — | ✗ (B28·D11) |

**oB1**
| 📜 of | line | belongs to | mark | verdict |
|---|---|---|---|---|
| wake-up | statement, unknown, data, plan, result «۴ روز از ۷ … (⇐ ۵)», lesson, «حل شد» | wake-up | — | ✓ |
| wake-up | «کارِ تو» = his questions about the page / mind card | session | — | ✗ minor |
| wake-up | «حکمِ وارسی: شاید», «حل شد» after 5⇒4 | wake-up | — | ✗ unmarked (B26·D31) |
| dinner | statement, data ×3, guess, ⏸ #104, unknown, plans, result «سه شب از چهار شب» | dinner | — | ✓ (r27 had two of these under wake-up — fixed) |
| dinner | 🎯 «پیش‌بینیم ۴ از ۴ با ۹۰ درصد بود، پس غلط درومد» | not a forecast (past report) | — | ✗ (B28·D3) |
| dinner | 🎯 «۵ شب از ۷ … ۸۰ درصد» | dinner | — | ✓ |
| dinner | ۲۲ آبان «شد ۵ روز» | wake-up | — | ✗ wrong problem |

**s14** — packet work (۳ آبان, 5 lines), n−1 guess/unknown (۱۲ آبان) and practice result «۴۰٪» under «میانگینِ ۳۶ …» ✗; own statement/check/look-back/«حل شد» ✓; no ✓/✗ beside «کارِ تو» arithmetic lines.

**aB2** — problem 2 carries nine problem-1 entries (✗); problem 1 lacks «پرسشی که کمک کرد» and taste (✗); problem 1 «فرمِ فهم» after results (✗ order); problem 2 own result «۵۰² = ۲۵۰۰» with «✓ حسابِ صفحه» (✓).

## 5. Prior-work verdict table

| scenario | step | her text | page verdict | expected | verdict |
|---|---|---|---|---|---|
| pwB3 | 1 | «نصفِ محیط میشه طول + عرض = ۱۸ سانت» | ✓ (block fired) | ✓ | PASS (B27·D3 fixed) |
| nB1 | 1–3 | «۶ متر در ۵ متر = ۳۰», «۳۰ ÷ ۱٫۵ = ۲۰», «۲۰ + ۲ = ۲۲» | ✓ ✓ ✓ | ✓ | PASS |
| nB1 | 4 | «۲۲ × ۴۵۰ = ۹۸۰۰ هزار» | ✗ (exact «۹٫۹ میلیون») | ✗, exact in her scale «۹۹۰۰ هزار» | PASS verdict / S3 scale |
| nB1 | 4 fix | «۲۲ × ۴۵۰ = ۹۹۰۰ هزار» | ✓ «اصلاح شد … به دستِ خودش» | ✓ | PASS |
| nB1 | 2–4 after 1.5⇒1.44 | — | ⟳ کهنه, proposals 20.83 / 22.83 / 10275 | stale + exact proposals | PASS (22.83 uses her «+2», S3 note) |
| nB1 | 2 accept / 3 own | «همون ۲۰٫۸۳ درسته», «… پس ۲۲٫۹۱» | ✓ ✓ with history | ✓ | PASS; step 4 no new proposal (S3) |
| nB1 shelves | 1 / 2 | «۵ تا ۶۰ تا میشه ۳۰۰», «۴ ردیف و ۵ ستون میشه ۲۰» | ✓ / ⚠️ ناقص ⇒ ✓ after «۲۴۰ ÷ ۶۰ = ۴» | ✓ | PASS |
| nB1 | ledger after live_new | — | floor shows shelves ledger | own ledger | FAIL (B28·D9) |
| pwB2 | 5 fix | «شیراز = ۲٫۷ + … = ۷٫۷» | stays ⚠️ ناقص | ✓ نشست | FAIL regression (B28·D9) |
| pwB1 | 1–19 | (three reports) | merged, 13/14 fixed, height 15⇒18 stale-marked | — | PASS |
| s11 | 1 | «backtracking … 98 … 49» | ⚠️ ناقص; mind card no longer «درست نبود» | — | PASS (U24 fixed); credit missing in 📜 (U36) |

## 6. Arithmetic table (what she wrote · exact · page said · verdict)

| scenario | what she wrote | exact | page said | verdict |
|---|---|---|---|---|
| nB1 | «۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰» | 12 700 000 (thousand reading, only fit) | ✗ «۱۱٫۰۰۱۷ م (… ۱۱٫۹۰۰۸)» | **S1** (B28·D1) |
| nB1 | «۲ میلیون و ۸۰۰ تقسیم بر ۲ = ۱ میلیون و ۴۰۰» | fits both readings | ✓ | ✓ |
| nB1 | «۲ میلیون و ۸۰۰ منهای ۵۰۰ هزار = ۲ میلیون و ۵۰۰» | 2 300 000 / 1 500 800 | ✗ «۲٫۰۰۰۳ (… ۲٫۳)» | ✓ verdict, wrong alt value (S3) |
| nB1 | «… هزار + … هزار = ۱۲ میلیون و ۷۰۰ هزار», «… منهای ۵۰۰ هزار = ۲ میلیون و ۳۰۰» | 12.7 M, 2.3 M | ✓ ✓ | ✓ |
| nB1 | «۲۲ × ۴۵۰ = ۹۸۰۰ هزار» | 9 900 هزار | ✗ «۹٫۹ میلیون» | ✓ (C45 scale S3) |
| nB1 | «۲ × ۳ = ۶ تا تخم‌مرغ» | 6 | ✓, not prior work | ✓ |
| nB1 | «√(۱۵² + ۸²) ≈ ۱۷ دسی‌متر» | 17 | ✓ | ✓ |
| nB1 | «قفسه‌ی کناری ۲√۳ متره» | 3.46 | silent | ✓ (no equation) |
| nB1 | «داداشم: ۳ روز × ۴۰۰ هزار = ۱۲۰۰ هزار» | 1200 | ✓ «کارِ دیگری» | ✓ |
| nB1 | «۱۰ درصدِ ۲۰٫۸۳ میشه ۲٫۰۸» | 2.083 | ✓ | ✓ (C9) |
| nB1 | «۷ × ۸ = ۵۶ بود دیگه؟» | 56 | ✓, no prior work | ✓ |
| nB1 | «۲۱٫۶ … با ۲ مترمکعب اضافه میشه ۲۴٫۶» | 23.6 | ✗ ۲۳٫۶ | ✓ (U27) |
| nB1 | «۱۱۰۴۰ هزار ÷ ۲۳ = ۴۶۰ هزار» | 480 | ✗ ۴۸۰ هزار | ✓ (U28) |
| nB1 | «۵ تا ۶۰ تا میشه ۳۰۰» / «۴ ردیف و ۵ ستون میشه ۲۰» | 300 / 20 | ✓ / silent | ✓ / S3 |
| nB1 | «۲۴۰ ÷ ۶۰ = ۴», «۲۴ × ۴۸۰ = ۱۱۵۲۰ هزار», «۲۳ × ۱٫۴۴ = ۳۳٫۱۲» | 4, 11520, 33.12 | ✓ ✓ ✓ | ✓ |
| nB1 | «۵ × x = ۳۰۰», «۱۴۰۵/۹/۱۵», «۱۸ از ۲۰» | look-alikes | silent / date ask (۱۵ آذر ✓) / silent | ✓ |
| s17 | «۳ متر در ۴ متر = ۱۲», «۲٫۵ متر در ۴ متر = ۱۲» | 12 / 10 | ✓ / ✗ ۱۰ | ✓ |
| s17 | proposal after 0.7⇒0.75 | 21.6×0.75 = 16.2 | «۱۶٫۸ ⇒ ۱۶٫۲» | ✓ |
| pwB1 | «۴ تکه‌ی ۳ متری = ۱۲», «۲ تکه‌ی ۷ متری = ۱۵» | 12 / 14 | ✓ / ✗ ۱۴ | ✓ |
| pwB1 | «۲۰۰۰ × ۹٫۸۱ × ۱۸ = ۳۵۳ هزار» | 353 160 | ؟ «۳۵۳٫۱۶ هزار» | ✓ |
| pwB1 | «۶ و ۴ و ۳ میشه ۱۳ دوازدهم» | 13 | (sum, silent) | ✓ |
| aB2 | «۱ + ۲ + … + ۲۰ = ۲۱۰», «۱ + ۳ + … + ۱۹ = ۱۰۴» | 210 / 100 | ✓ / ✗ | ✓ |
| aB3 | «۲۰ درصدِ ۳۰۰ میلیون … میشه ۶۰ میلیون» | 60 | silent | S3 |
| aB3 | «۵۷٫۵ تقسیم بر ۱۲ = ۵ میلیون», «۳۰ درصدِ ۲۱ میلیون میشه ۷» | 4.79 / 6.3 | ؟ / ✗ ۶٫۳ | ✓ |
| aB1 | «۴۲ ضربدر ۵ … ۲۱۰» | 210 | silent | S3 |
| s14 | «(960-988)/(20/√25) = -28/4», «۱ + ۰.۳ ... ≈ ۱.۳» | −7 / 1.3 | ✓ / silent | ✓ / S3 |
| aB3y | «۱۲ اردیبهشت ۱۳۳۸ = ۲ مهٔ ۱۹۵۹» (model) | 3 May 1959 (jdatetime) | rewrite to ۳ مه | ✓ (U52) |

## 7. 🎯 table (forecast · confidence · 🎯 made? · outcome · settled where)

| scenario | forecast | conf | 🎯 made? | outcome | settled |
|---|---|---|---|---|---|
| nB1 | «۲۲ کارتن بسه» | 80 | ✓ at statement | نشد (her words) | never settled |
| nB1 | «۲۳ تا مصرف بشه و یکی بمونه» | 70 | ✓ but stored **90** (brother's) | شد | settled **نشد** (wrong, c26) |
| nB1 | «… ۲۳ تا رو الان ۶۰ درصد مطمئنم، نه ۷۰» | 60 | duplicate 🎯 | شد | شد (c27) |
| nB1 | «فکر کنم ۷۰ درصد نصب تا عصرِ شنبه تموم میشه» | 70 | ✗ none | شد | — |
| nB1 | «احتمالش ۵۰ درصده که کاشی‌ها بشکنن یکی‌دوتا» | 50 | ✓ | شد | never settled |
| dB1 | «۷۰ درصد مطمئنم میانگینِ آزمونِ یکشنبه به ۱۳ می‌رسه» | 70 | ✓ | شد | شد (p17) |
| dB1 | «میانگینِ ۱۳ رو هم الان ۸۰ درصد مطمئنم، نه ۷۰» | 80 | duplicate 🎯 | شد | شد (counted twice) |
| dB1 | «احتمالش ۶۰ درصده که هیچ‌کس زیرِ ۱۰ نگیره» | 60 | ✓ | not reported | settled **شد** by «میانگین شد ۱۳٫۲» (wrong) |
| dB1 | «تقریباً مطمئنم بچه‌ها … استقبال می‌کنن» ⇒ «۶۵ درصد» | 65 | ✗ none | — | — |
| dB1 | «پارسال ۹۰ درصد …» / «مدیرمون … ۸۰ درصد» | — | none ✓ | — | — |
| oB1 | wake-up «۵ روز از ۷؛ ۶۰ درصد» | 60 | ✓ | شد ⇒ (5⇒4) | practice ✓ |
| oB1 | dinner «هر ۴ شب تا ۱۱:۳۰ … ۹۰ درصد» | 90 | ✓ | نشد | **شد** at c31 from «الان درست شد», then نشد at c32 |
| oB1 | «پیش‌بینیم ۴ از ۴ با ۹۰ درصد بود، پس غلط درومد» | — | ✗ made (past report) | — | asked «شد یا نشد؟» |
| oB1 | wake-up «۶ روز از ۷ ـه، ۷۰ درصد» | 70 | ✓ | نشد (۵) | practice ✓ (and «کدام؟» asked in same turn) |
| oB1 | dinner «۵ شب از ۷ … ۸۰ درصد» | 80 | ✓ | — | open |
| s19 | «جلسه‌ی اول خسته می‌شم ولی می‌رم» | 70 | ✓ | شد (Sunday) | **شد at c62 by an unrelated correction, before Sunday** |
| bp2 | «هشتاد درصد مطمئنم» | 80 | ✓ (text = the confidence phrase only) | — | — |
| aB3 | «۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره» | 70 | ✗ none | شد | — |

## 8. Date-ask table (ask · her answer · what was booked)

| scenario | ask | her answer | booked |
|---|---|---|---|
| dB1 | «پنجشنبه یه آزمونِ کوتاه» (۵ آذر) + «شنبه … مدیر» (۷ آذر) | «آره.» | only ۷ آذر ✓ (C49) |
| dB1 | «پنجشنبه نه، یکشنبه» | — | plan text ⇒ یکشنبه, undated; no ask ✗ |
| dB1 | ✏️ شنبه ⇒ دوشنبه: «دوشنبه ۹ آذر (به‌جای ۷ آذر)» | «آره، درسته. …» | ۹ آذر ✓, old closed ✓ |
| dB1 | «سرِ برج» ⇒ ۱ دی | «باشه. …» | ۱ دی ✓ |
| dB1 | «آخرِ سال» ⇒ ۲۹ اسفند | «آره. …» | ۲۹ اسفند ✓ |
| dB1 | «بعد از عید» ⇒ «امروز خودش جمعه است … (۹ آذر)؟» | «نه، منظورم بعد از عیدِ نوروزه» | nothing ✓, but the ask was false ✗ |
| dB1 | «وسطِ ماه» ⇒ same false ask; «وسطِ ماه یعنی حدودِ ۱۵ دی» ⇒ same false ask + «عید» ⇒ ۱ فروردین ۱۴۰۶ | «عید درسته» (Friday) | **«وسطِ ماه…» booked on ۲ آذر (past)**, عید «بی‌جواب ماند» ✗ |
| dB1 | «تا جمعه برگه‌ها …» on a Friday ⇒ «همین امروز یا جمعهٔ بعد؟» | «همین امروز.» | ۶ آذر ✓ (U21) |
| dB1 | ✏️ دوشنبه ⇒ «شنبه» (said on Mon 2 Azar) | «نه، اون شنبه گذشت…» | asked ۱۴ آذر (re-anchored), not booked |
| dB1 | «آخرِ سالِ تحصیلی …» | — | nothing asked, nothing booked |
| nB1 | «نصبِ سرامیک افتاد برای شنبه» ⇒ ۳۰ آبان | «آره.» | ۳۰ آبان ✓ |
| nB1 | «سفارش رو تا ۱۴۰۵/۹/۱۵ می‌دم» ⇒ ۱۵ آذر | «آره، ۱۵ آذر درسته.» | ۱۵ آذر ✓ |
| nB1 | «احتمالش ۵۰ درصده که کاشی‌ها بشکنن» ⇒ ۳۰ آبان (forecast sentence) | — | «بی‌جواب ماند» (should not be asked) |
| pwB2 | «تا جمعه به مدیرِ شیراز» (Friday) ⇒ «همین امروز یا جمعهٔ بعد؟» | «جمعه‌ی بعد.» | ۱۵ آبان ✓ |
| pwB2 | «۲۵ آبان با صاحب‌خونه …» | «باشه.» | **⏰ of «تا جمعه به مدیرِ شیراز…»** ✗ |
| s19 | «عروسی ۱۵ اسفنده» ⇒ «شنبه ۱۵ اسفند … درست است؟» | «همون ۱۵ اسفند درسته؛ …» | nothing — «بی‌جواب ماند» ✗ |
| s19 | ✏️ «اولین جلسه یکشنبه» ⇒ «۲۹ آذر (به‌جای ۲۸ آذر)» | — | not booked without yes ✓ |
| s19 / aB3 / s14 | «عید» / «سرِ برج»+«عید» after Farvardin / «آخرِ سال» | — | ۱ فروردین ۱۴۰۶ / ۱ خرداد ۱۴۰۶ + ۱ فروردین ۱۴۰۷ / ۲۹ اسفند — asked ✓ |
| s15 / oB1 | «سلام، هفته‌ی بعده», «دو روز», «اون پنجشنبه هم قرار نیست» | — | no ask ✓ |

## 9. Chat ⇄ page verdicts

- pwB3, nB1: a worked step at opening fires the prior ledger; her fixes land with history (except pwB2 step 5 regression and the lost floor ledger after live_new in nB1).
- nB1: correction of a result rewrote a datum digit (800⇒300) and could not be undone from chat (B28·D8).
- oB1: return by naming binds at once (C30 ✓); the third problem raised mid-chat is no longer registered (B28·D10).
- 🎯 bookkeeping is the weakest chat⇄page link this round: four wrong settlements (s19, oB1, nB1, dB1), one wrong confidence (nB1), duplicates for re-stated numbers (nB1, dB1).
- Date asks: yes-binding to the newest ask works when the newest is what she answers; a yes that names an older ask (dB1 «عید درسته») or a new appointment (pwB2) is bound wrongly.

## 10. Owner-bank table (B: 11–20, 45–47, 57–59)

| # | verdict | where |
|---|---|---|
| 11 offline / local model | نیمه (sheet #101) | oB1 p15–16 (same as r27) |
| 12 alarm clock build | هست | oB1 p17 |
| 13 book for 10y/70y | نیست (#102) | oB1 p18–19 |
| 14 before/after photos | نیمه (#103) | oB1 p20–21 |
| 15 per-session e-mail report | نیست (#103) | oB1 p20 |
| 16 two problems not mixed | نیمه — binding now immediate, but the dinner problem is no longer its own record (B28·D10) and misfiled lines remain | oB1 p21–p23, c36–c38; nB1 📜 |
| 17 when does a sheet get answered | نیمه (no date) | oB1 p26 |
| 18 over-confidence on mind card | نیمه — Brier shown, but fed by wrong/duplicate 🎯 (B28·D2/D4) | oB1 post, dB1 post (out/view_post_mind.png) |
| 19 all records in one place | نیمه | oB1 p35 |
| 20 smartwatch data | نیست (#104) | oB1 p25 |
| 45 tool tested on my data | نیست (word overlap only) | tB1z p10 |
| 46 sentence after naming a previous problem | هست — binds in the same message | oB1 c38 (out/s38.png), nB1 c22 |
| 47 «حل شد» same meaning everywhere | نیمه (🧭 vs 🔭 wording unchanged) | tB1z |
| 57 correction + question in one message | هست — the correction stays and the question is answered | nB1 c8 (out/s8.png) |
| 58 «پنجشنبه نه، شنبه» — booked elsewhere? | نیمه — the negated day is never booked; the new day is not asked (stays «قولِ بی‌تاریخ») | dB1 c4 + Today (out/s7.png) |
| 59 an unconfirmed date coming back with next year's date | نیمه — no next-year drift seen (s13, s14, pwB2 fixed); but a stale ask stays open for days and a yes then books an older ask on a past day | dB1 p11; s14 c41 |

## 11. Routing
Every turn of all 30 runs went to the coach task (lla_coach) as in round 27; no turn mis-routed. One page post-check rewrite each in aB3y (Gregorian date) and dB1 (practice «دارم بازش می‌کنم»), both correct.

## 12. PARTS.md «نسبت به دورِ ۲۷»

| part | what it is FOR | round 28 | نسبت به دورِ ۲۷ |
|---|---|---|---|
| arithmetic reader | every written computation judged exactly | «A در B = C», «N تکه‌ی M متری», «N تا M تا», running sum with unit, ellipsis AP, √, scale in her own unit all read; **S1**: «N میلیون و M + …» with bare M read only in mixed readings (B28·D1); «N ردیف و M ستون میشه K» unread | بهتر در شکل‌ها، یک S1 تازه |
| prior-work ledger | her earlier work credited step by step | one-step opening fires (B27·D3 ✓), stage moves (B27·D2 ✓); pwB2 fix not merged (regression), floor ledger lost after live_new | مختلط |
| correction engine | only real dependants, exact proposals | 6.05 no longer stale, 16.2 exact, C68 accept works; result-fix rewrote a datum digit and cannot be undone (B28·D8); duplicates in lists | بهتر با یک پسرفتِ مهم |
| dates / Today | only her commitments, with her yes | narrative not a date, newest-only yes, ✏️ one ask, «سرِ برج/آخرِ سال/عید» ✓; false «امروز جمعه است» fallback (B28·D6), yes to an older ask books a past day, «درسته» unread (B28·D7) | بهتر در پایه، شکافِ تازه در اصطلاح‌ها |
| forecast ledger (🎯) | opened when stated, settled by its outcome | opened at statement ✓ (U49 fixed in oB1, bp2); wrong settlements ×4, foreign confidence, duplicates, «فکر کنم N درصد» missed | بدتر در داوری، بهتر در ساختن |
| multi-problem binding & 📜 | each line under its own problem | return-by-naming immediate ✓, results under the right problem in oB1 ✓; third problem not registered (regression), misfiled lines remain (aB2, s14, nB1), move/undo broken (B28·D11) | مختلط |
| territory loop | missing tool asked/answered honestly | clear best fit declared ✓, ordinal choice ✓, meta not credited ✓; frame-word reply rejected not asked, sheet stays open | بهتر |
| register / quotes | her words byte-exact | s12 ✓, aB4 nearly (stray «»), s19 ZWNJ still stripped | بهتر |
| «کارِ دیگری» | others' work not hers | brother's line ✓; her own work after «استادم میگه» filed as someone else's (B28·D12) | تازه، با لغزش |
| mind card | honest credit and calibration | «ناقص» no longer «درست نبود» ✓; calibration counts consistent but fed by duplicate/wrong 🎯 | بهتر/مختلط |
| routing | each turn to the right task | all correct | همان |

## 13. New owner-like questions
- «وقتی گفتم «۹ میلیون و ۹۰۰»، صفحه آن را هزار خواند یا یکان؟»
- «پیش‌بینی‌ای که صفحه به اسمِ من بست، با کدام جملهٔ من بست؟»
- «سطری که جابه‌جا کردم الان کجاست و چطور برش گردانم؟»
- «اگر بگویم «وسطِ ماه» یا «بعد از عید»، صفحه چه روزی پیشنهاد می‌کند؟»
- «وقتی عددِ اطمینانم را عوض می‌کنم، پیش‌بینی یکی می‌ماند یا دوتا می‌شود؟»

## 14. Token / time use
About 6.5 hours wall time. 30 runs (28 replays + 2 new scenarios, nB1 21 model turns, dB1 18). Roughly 60 model answers written by hand (the rest reused after a strict prompt-signature check that stopped on every changed turn question or page block). Token count is not visible to me.

## Files
- per scenario: round28B/<sid>/{findings.md, mail.html, mail.subject.txt, DONE, out/, ai/, ctl/, post.txt}
- round28B/defects.md, round28B/PARTS.md, round28B/sent.txt, round28B/notes.txt (raw observations with turn numbers)
