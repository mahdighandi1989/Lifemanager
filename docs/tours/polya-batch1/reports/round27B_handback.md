# دورِ ۲۷ · گروهِ B — گزارشِ نهایی (runner)

28 runs, all judged, 28 e-mails sent (ids in round27B/sent.txt). Totals: 5 PASS, 23 FAIL; 0 S1, 13 S2-class findings across scenarios; findings per scenario in round27B/<sid>/findings.md; catalogue round27B/defects.md; parts round27B/PARTS.md.

## 1. Per scenario: RESULT, defects (p<N>), ارتقای لازم
### s11 — برنامه‌نویسِ ۱۹ ساله و دومینوی صفحهٔ بی‌دوگوشه
RESULT: FAIL — 4 S3
Defects:
- U35 STILL (S3, c) s49.
- B26·D7 STILL (S3, b) post mind card.
- B25·D26 STILL (S3, b) post 📜.
- B24·D16 STILL (S3, c) post 📜.
ارتقای لازم:
- One «کارِ پیشینِ تو» bridge from the chat ledger into the live problem it became (credit for correct counts, «ناقص» shown as «ناقص»).

### s12 — بانوی ۶۷ ساله و جدولِ روزنامه
RESULT: FAIL — 1 S2 + 1 S3
Defects:
- B27·D4 (S2, b, C38/P6) post 📜: register converter rewrites her own statement and lesson («مرتب کن ⇒ مرتب کنید», «تو آناگرام ⇒ شما آناگرام»).
- U37 remainder (S3, c) post strip «فقط بازنگریِ خودت» to a «شما» elder.
ارتقای لازم:
- Register conversion must skip quoted user text («کل/درس/داده» rows) — a field-level "her words" flag.

### s13 — کارمندِ ۳۳ ساله و همکاری که فاکتور را بیشتر می‌نویسد (تصمیمِ اخلاقی)
RESULT: FAIL — 1 S3
Defects:
- B27·D5 instance (S3, b, C19) s35: a past sentence re-asked a week later with a shifted date.
ارتقای لازم:
- «هفته‌ی بعد» asks expire after the asked week; her later report («از کارشناس پرسیدم») closes it.

### s14 — دانشجوی ۲۰ ساله و «کدوم فرمول کی» (آمار)
RESULT: FAIL — 1 S2 + 4 S3
Defects:
- B27·D5 (S3, b, C19/C12) s41: old sentence re-asked after its date passed, shifted to ۲۰ آبان ۱۴۰۶; Today line stays.
- B26·D3 CHANGED (S3, b) s17: deadline booked without her yes + same-date ask in the same turn.
- «آخرِ سال» unread (S3, b) p12: plan booked «جلسهٔ بعد», model date dropped.
- U26 family (S3, b) p3: «۱ + ۰.۳ ... یعنی تقریباً ۱.۳» silent.
- B27·D7 instance (S2, b, Q3) post 📜: three topics filed under one problem.
ارتقای لازم:
- Date asks bound to the day the sentence was said; after that day passes, the ask lapses for good.
- «آخرِ سال/عید/سرِ برج» → a proposed Jalali date through «… درست است؟».

### s15 — ژیلا، معلمِ ریاضی، و کلاسِ ساکت
RESULT: FAIL — 1 S3
Defects:
- B27·D1 (S3, b, C19) p5/s6–s7: narrative «سلام، هفته‌ی بعده» read as her future date; date ask + «بی‌جواب ماند» line + Today line.
ارتقای لازم:
- A class-trial log (date, question asked, pupils who answered) so her weekly experiment is a record.
- The date reader needs a tense/role test before asking: «هفته‌ی بعده» as a greeting-narrative is not a plan.

### s16 — پدر و باغچهٔ دخترش
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- A one-tap «پرسش برای بچه» card the parent can read aloud, saved with the child's answer, so the next evening starts from it.

### s17 — باغدارِ ۵۲ ساله و مخزنِ آبِ باران (تصمیمِ ساخت)
RESULT: FAIL — 1 S2 + 3 S3
Defects:
- B27·D9 (S2, b, C17/Q1) p10: «۲٫۵ متر در ۴ متر = ۱۲ مترمربع» wrong, silent; «۳ متر در ۴ متر» unread.
- B27·D8 (S3, b, C11) p10/📜: replacement inside her text yields «۲۴ × ۰٫۷۵ = ۱۶.۸»; proposal on a stale base; garbled history line.
- U38 CHANGED (S3, b) p8: 0.8 kept in the proposed «ریاضی‌کردن».
- B24·D16 STILL (S3, c) post 📜: two arrow forms in one history line.
ارتقای لازم:
- Read «A واحد در B واحد = C واحد²» as a product.
- Text replacement only when the page recomputes the whole expression from current values; else mark the sentence stale.

### s18 — نوجوانِ ۱۸ ساله و قیفِ مخروطی (نرخ‌های وابسته)
RESULT: FAIL — 1 S3
Defects:
- B24·D16 STILL (S3, c) post 📜.
ارتقای لازم:
- One arrow convention for every history line («قبلاً: … · حالا: …»).

### s19 — ۳۶ ساله و ۸ کیلو تا عروسیِ برادر (عادت، ۱۸ هفته)
RESULT: FAIL — 1 S2 + 4 S3
Defects:
- B27·D10 (S2, b, C12/Q5) p11: ✏️ weekday change ⇒ plan booked on the old day without her yes + a second ask.
- B27·D11 (S3, c) 📜 correction header misstates the change.
- B27·D4 family (S3, b) 📜 her plan text with ZWNJ stripped.
- «عید» unread (S3, b) p17.
- B24·D16 STILL (S3, c) post 📜: two arrow forms in one history line.
ارتقای لازم:
- A ✏️ on a weekday re-derives the date and re-asks once; never «به گفتهٔ خودت ثبت شد» without her yes.

### s20 — پژوهشگرِ گامای E–I–PV
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- A link from the factory case to her simulation log (the 40 runs) so the counter-example row points to the run itself.

### bp1 — ۱۵ ساله و n²−1 بخش‌پذیر بر ۸ (پیش‌نیازِ تفاضلِ دو مربع)
RESULT: FAIL — 1 S3
Defects:
- B24·D15 STILL (S3, b) p11.
ارتقای لازم:
- When «درسته؟» follows her own expansion/check in the same message, the turn question should name her check and ask only about generality.

### bp2 — کشاورزِ ۴۸ ساله و آبِ بارانِ پشت‌بام (پیش‌نیازِ تبدیلِ واحد)
RESULT: FAIL — 4 S3
Defects:
- B27·D6 (S3, b) post strip: stale mark kept after his own recomputation with the corrected value.
- U49 family (S3, b) p12: «هشتاد درصد مطمئنم» makes no 🎯.
- B26·D12 STILL (S3, b) p12.
- B24·D16 STILL (S3, c) post 📜: two arrow forms in one history line.
ارتقای لازم:
- «دوباره حساب شد» link: a recomputation whose numbers use the corrected value clears the stale mark and shows both results.

### bp3 — نردبان و سه پیش‌نیازِ تودرتو (۱۴ ساله)
RESULT: FAIL — 1 S3
Defects:
- B26·D12 instance (S3, b) p13: self-label line names «مساحتِ مثلث» while her feeling was about the theorem.
ارتقای لازم:
- The self-label line should quote her own reason clause and pick the prerequisite it points to; if unclear, name all three.

### aB1 — آوا، ۹ ساله، و اتوبوس‌های اردو
RESULT: FAIL — 2 S3
Defects:
- B26·D16 STILL (S3, b) p9.
- U26 family (S3, b, C17) p5: «۴۲ ضربدر ۵ … ۲۱۰» silent.
ارتقای لازم:
- A child-sized check card: «ضرب کن ببین همه جا میشن؟» with her own numbers prefilled.

### aB2 — ۱۶ ساله، استقرا و «چرا» ی جمعِ فردها (بازنگری)
RESULT: FAIL — 1 S2 + 1 S3
Defects:
- B27·D7 (S2, b, Q3) post 📜 problem 2 carries problem 1's nine chat entries; problem 1 misses its own look-back answers.
- B24·D18 remainder STILL (S3, b) post 📜 problem 1 order.
ارتقای لازم:
- 📜 window per problem from its own first statement, not from the session start.

### aB2f — نوجوانی که جمعِ فردها را خودش می‌خواهد حل کند
RESULT: PASS
Defects:
- (none)
ارتقای لازم:
- (none beyond defect fixes)

### aB3 — بازنشستهٔ ۶۷ ساله و پس‌انداز (تصمیمِ مالی، شش ماه)
RESULT: FAIL — 6 S3
Defects:
- U50 remainder (S3, b) p9–p10: one commitment ⇒ 📌 + ⏰.
- U49 STILL (S3, b) p9/p14.
- B25·D24 STILL (S3, b) 📜.
- B24·D16 STILL (S3, c) 📜.
- U26 family (S3, b) p15 «۲۰ درصدِ ۳۰۰ … میشه ۶۰» silent.
- «سرِ برج/عید» unread (S3, b) p15.
ارتقای لازم:
- A «پیش‌بینی» card offered whenever a sentence carries «N درصد مطمئنم» + a dated outcome.

### aB3x — بازنشسته و پس‌انداز — تاریخِ تولد در گفت‌وگو (اجرای ۱)
RESULT: PASS
Defects:
- (none observed in this run)
ارتقای لازم:
- (none beyond defect fixes)

### aB3y — بازنشسته و پس‌انداز — تبدیلِ نادرست در متنِ پاسخ (اجرای ۲)
RESULT: FAIL — 1 S3
Defects:
- B25·D17 STILL (S3, b) p2: wrong Gregorian conversion in the assistant reply not caught (page stored the right date).
ارتقای لازم:
- Post-check: any Gregorian date in a reply that names her birth must equal the stored conversion, else one rewrite.

### aB4 — مادربزرگِ ۸۲ ساله و معمای مرغ و خرگوش
RESULT: FAIL — 1 S3
Defects:
- B27·D4 instance (S3, b) s1/Today: her quoted «جواب رو نگو» rendered «نگویید» with a stray «».
ارتقای لازم:
- Quotes «از حرفِ خودتان: «…»» must be byte-exact; register conversion only outside guillemets.

### oB1 — کاربرِ مالک‌مانند: بیداریِ ساعت ۶، شام و سه مسئله (چندروزه)
RESULT: FAIL — 3 S2 + 3 S3
Defects:
- B27·D15 (S2, b, C21/C30) p36–p40: problem binding lags one message; results land in the other problem's 📜.
- B27·D5 (S2, b, C12/C19) s1–s36: stale date asks re-asked with drifting dates; «آره، ثبتش کن» booked two of them; a negated day asked.
- B26·D31 remainder (S2, b) 📜: closed problem's look-back check «۵ … درست درومد!» and «حل شد» unmarked after 5⇒4.
- U49 family (S3, b) p38–p40: stated predictions not booked as 🎯 until the outcome; all in one practice case.
- B27·D1 instance (S3, b) s1: «دو روز» read as a date.
- B27·D14 (S3, b) multi-problem block: questions about the page counted as a problem.
ارتقای لازم:
- A per-sentence «این حرف مالِ کدام مسئله است؟» chip under each message (one tap to move it).
- A 🎯 is opened the moment a prediction with a percent is said, on the named problem, and judged later.

### pwB1 — مهندسِ ۳۱ ساله و پمپِ خورشیدیِ باغِ پدر (کارِ پیشینِ سه‌گزارشه)
RESULT: FAIL — 2 S2 + 1 S3
Defects:
- B27·D9 instance (S2, b) p14: «۲ تکه‌ی ۷ متری = ۱۵ متر» wrong, silent; «۴ تکه‌ی ۳ متری = ۱۲ متر» unread.
- B27·D13 (S2, b, C15/C23) p14: page tells the coach the exact value is «۳۵۳۱۶۰ هزار».
- B24·D16 STILL (S3, c) post 📜: two arrow forms in one history line.
ارتقای لازم:
- Products written «N تکهٔ M متری» and «A در B» read as ×; the page's own exact values printed in her unit and scale.

### pwB2 — پدرِ ۴۴ ساله: شیراز یا تهران (کارِ پیشین با معیارِ جاافتاده)
RESULT: FAIL — 2 S2 + 1 S3
Defects:
- B27·D5 (S2, b, C12/C19) s13–s23: a stale sentence re-asked six times with drifting dates; «باشه» and «آره، درسته» book questions they did not answer.
- B27·D12 (S2, b, C11/P4) p9: unrelated 6.05 marked stale, proposal 11.05.
- B25·D24 STILL (S3, b) 📜 data rows.
ارتقای لازم:
- A date ask belongs to one message and one day; it lapses once, and a yes binds only the newest pending question.

### pwB3 — قابِ عکس — آغاز با یک گامِ حل‌شده (بازوی T12)
RESULT: FAIL — 2 S3
Defects:
- B27·D3 (S3, b, C7) p1: one worked step stated as a relation does not fire the prior-work block.
- B27·D2 (S3, b, Q6/R2) p2–p3, post strip: stage and strip stay «فهمِ مسئله» after her booked result and her own check.
ارتقای لازم:
- Prior-work detector: «گامِ اول رو خودم رفتم» / «خودم حساب کردم» + any relation counts as one step, numeric or not.

### tB1 — جعبه‌قرصِ هوشمند برای مادر — حلقهٔ قلمرو (بازوهای اصلی)
RESULT: FAIL — 1 S2 + 2 S3
Defects:
- B27·D16 (S2, b, C2/C20) s17–s19, p9: a named area with only frame-word overlap is neither asked nor rejected; nothing shown; her «نه» lost.
- U59 STILL (S3, b) s24.
- B27·D17 (S3, b) p11: context line names «پیش‌نیاز» as the turn question with no prerequisite open.
ارتقای لازم:
- Every routine note under a waiting sheet gets exactly one visible outcome line (arrived / asked / rejected) — never silence.

### tB1x — جعبه‌قرص — «خودم یه راه دیگه پیدا کردم» (بازوی sys_done)
RESULT: PASS
Defects:
- (none)

### tB1y — جعبه‌قرص — یک واژهٔ مشترک و تساویِ واقعیِ دو ابزار (T1)
RESULT: FAIL — 1 S3
Defects:
- B27·D17 (S3, b) p9–p10: context line names «پیش‌نیاز» as the turn question with no prerequisite open.

### tB1z — جعبه‌قرص — سه ابزارِ تازه، بستن و تکه‌ای پس از بستن (T2، بانکِ ۴۵ و ۴۷)
RESULT: FAIL — 2 S3
Defects:
- B27·D19 (S3, b, Q7/C26-20) s14, p9: clear best fit asked as a tie; her naming not read.
- B27·D18 (S3, b, Q9) post mind card: a meta question credited as «گذر از مرحله».
ارتقای لازم:
- A «تست روی دادهٔ خودت» step after any arrival: run the new tool once on her own words/data and show the result before «رسید».

## 2. Round-26 defect table (with blind U-ids)

| id | U | status | evidence |
|---|---|---|---|
| B26·D20 | U1 | FIXED | pwB1 p11, aB2 p12 (13/12 ✗) |
| B26·D18 | U3 | FIXED | pwB1 19 steps |
| — | U4 | FIXED | pwB1, aB3 stale lines |
| B26·D19 | U5 | FIXED | pwB1 s22 |
| B26·D4 | U6 | FIXED | s17 p7 |
| B25·D10 rem. | U7 | FIXED | s19 |
| B25·D3 rem. | U8 | FIXED | pwB2 p2 |
| B26·D23 | U9 | FIXED | pwB2 p7 |
| B26·D24 | U10 | FIXED | pwB2 p11–12 |
| B26·D26 | U11 | FIXED | tB1, aB1 p4, aB3 p9 |
| B26·D30 | U12 | CHANGED | oB1 binds, lags (B27·D15) |
| B26·D33 | U13 | CHANGED | no copies; misfiled lines (B27·D7) |
| B26·D31 | U14 | CHANGED | oB1 🎯/practice ✓, look-back ✗ |
| B26·D32 | U15 | FIXED | oB1 |
| B26·D29 | U16 | FIXED | oB1 |
| B26·D25 | U19 | FIXED | pwB2 p14 |
| B26·D3/D11 | U20 | CHANGED (s14, oB1) / FIXED (bp2) | asked, then booked by unrelated yes (B27·D5) |
| B26·D14, D1 | U22 | FIXED (s19, s20) / STILL (oB1 D34) | |
| B26·D6 | U23 | FIXED | s11, s12 |
| B26·D7 | U24 | STILL | s11 mind card |
| B26·D8 | U25 | FIXED | s18 |
| B26·D35 | U26 | FIXED «میشه»; STILL «…» | aB1 p5, s14 |
| B26·D2 | U31 | FIXED | s16 |
| B24·D21 rem. | U32 | FIXED | s15 |
| B26·D5 | U33 | FIXED | s11 |
| — | U34 | FIXED | s11 |
| B25·D16 | U35 | STILL | s11 |
| B25·D26 | U36 | STILL | s11 |
| — | U37 | CHANGED | s12 strip STILL; aB3x FIXED; B27·D4 |
| B25·D27 | U38 | CHANGED | s17 (0.8 kept, B27·D8) |
| B25·D28 | U39 | FIXED | bp2 |
| B24·D15 | U40 | STILL | bp1 p11 |
| B24·D12 | U42 | FIXED | s18 |
| B26·D17 | U43 | FIXED | pwB1 |
| — | U44 | CHANGED | pwB1 |
| B26·D21 | U45 | FIXED | pwB1 |
| B26·D16 | U48 | STILL | aB1 p9 |
| Bx D22 | U49 | STILL | aB3, bp2, oB1 (no 🎯 at statement) |
| Bx D21 | U50 | CHANGED | aB3 |
| B25·D17 | U52 | STILL | aB3y p2 |
| B26·D36 | U53 | FIXED | aB4 |
| B26·D38 | U54 | FIXED | aB4 |
| B26·D37 | U55 | FIXED | aB3, aB4 |
| B26·D27 | U58 | FIXED | tB1 |
| — | U59 | STILL | tB1 |
| B26·D28 | U61 | FIXED | tB1y |
| — | U62 | FIXED | tB1y |
| — | U63 | FIXED | tB1z |
| B25·D22 | U64 | FIXED | oB1 p16 |
| B26·D12 | U67 | STILL | bp2 p12, bp3 |
| B24·D16 | — | STILL | s11, s18, aB3, bp2, pwB1, s17, s19 |
| B24·D18 rem. | — | STILL | aB2 |
| B25·D24 | — | STILL | aB3, pwB2 (FIXED pwB1) |
| B26·D34 | U22 fam. | STILL | oB1 |
| B25·D1 frame word | — | CHANGED ⇒ B27·D16 | tB1 |
| three-area best fit | — | REGRESSED ⇒ B27·D19 | tB1z |
| ✏️ day change | — | REGRESSED ⇒ B27·D10 | s19 |
| not exercised | U21, U27, U28, U41, U56 | Bx-only turns / not reproduced | s19, s17, pwB1, oB1 |


## New defects this round

| id | sev | what | where (p<N>) |
|---|---|---|---|
| B27·D1 | S3 | narrative/count sentence read as a date (📅 line) | s15 p2; oB1 |
| B27·D2 | S3 | stage/strip stuck at «فهم» after her result | pwB3 p3 |
| B27·D3 | S3 | one-step relation opening («نصفِ محیط = طول + عرض = ۱۸») not recognised as prior work (T12 positive) | pwB3 p1 |
| B27·D4 | S2/S3 | register converter («تو⇒شما» / ZWNJ) alters her OWN quoted words | s12 S2; aB4 p3; s19 (ZWNJ) |
| B27·D5 | S2/S3 | lapsed date asks re-asked with drifting dates; an unrelated «بله/آره» books the wrong question | pwB2 p12/p14 S2; oB1 S2; s13, s14 p10 S3 |
| B27·D6 | S3 | stale mark not cleared after her redo with the new value | bp2 p11 |
| B27·D7 | S2/S3 | chat lines filed under the wrong problem in 📜 | aB2 S2; s14 S3 |
| B27·D8 | S3 | text replacement builds a false equation / proposal keeps the corrected-away base (0.8) | s17 p7 |
| B27·D9 | S2 | «A در B = C» and «N تکه‌ی M متری = K» unread; a wrong one passes silently (T3) | s17 p10; pwB1 p14 |
| B27·D10 | S2 | ✏️ weekday change booked the OLD day without her yes (regression) | s19 |
| B27·D11 | S3 | correction header misstates what changed | s19 |
| B27·D12 | S2 | unrelated 6.05 marked stale ⇒ 11.05 | pwB2 p9 |
| B27·D13 | S2 | «۳۵۳۱۶۰ هزار» read at the wrong scale and stated to the coach | pwB1 |
| B27·D14 | S3 | page questions counted as a problem | oB1 |
| B27·D15 | S2 | binding to a named earlier problem lags one message | oB1 p36–p40 |
| B27·D16 | S2 | frame/view-word-only reply silent, sheet «answered» (regression of round-26 ask) | tB1 |
| B27·D17 | S3 | context line names «پیش‌نیاز» as the turn's question | tB1, tB1y p10 |
| B27·D18 | S3 | meta question credited as «گذر از مرحله» | tB1z |
| B27·D19 | S3 | clear best fit asked as a tie; her naming of one not read (regression) | tB1z |


## 3. ARMS TABLE

| arm | scenario | p<N> | verdict |
|---|---|---|---|
| T1 real tie | tB1y | p10 | PASS |
| T2 piece after closure | tB1z | after closure | PASS |
| T3 «= N unit» | s17 / pwB1 / aB2 | p10 / p14 / p12 | FAIL (B27·D9) — fraction «= N» PASS in aB2 |
| T4 third prior report | pwB1 | p11–p12 | PASS |
| T5 take back own dispute | pwB2 | p7 | PASS |
| T6 «جمعهٔ بعد» / «باشه» | pwB2 | p12, p14 | PASS (B27·D5 rides on them) |
| T7 5⇒4 on used datum | oB1 | p29–p31 | PARTIAL — 🎯/practice PASS, look-back & «حل شد» FAIL |
| T8 two open predictions | oB1 | p30, p40 | routing PASS; predictions never opened at statement FAIL (U49) |
| T9 coincidental 15 | pwB1 | s22 | PASS |
| T10 ÷ / تقسیم بر / glued fraction | aB2 | p13 | PASS |
| T11 correction + question | s17 | p9 | PASS |
| T12 one worked step | pwB3 (+) / pwB3, s15, s20, oB1 (−) | p1 / p2, p2–p6, p3–p5 | positive FAIL (B27·D3); negative PASS |

## 4. 📜 line-match tables (multi-problem scenarios)

**s14**
| 📜 of | line | belongs to | verdict |
|---|---|---|---|
| «میانگینِ ۳۶ …» | 5× «کارِ تو در گفت‌وگو» ۳ آبان (packet < 960 g, t = −7, 1.3, unknown of the packet) | problem 0 (packet, never registered) | ✗ wrong problem |
| «میانگینِ ۳۶ …» | statement, unknown, plan «آخرش وارسی», check, look-back, «حل شد» | this problem | ✓ |
| «میانگینِ ۳۶ …» | ۱۲ آبان «حدس: … تقسیم بر عدد کوچیک‌تر», «مجهول: چرا دقیقاً یکی کمتر» | variance n−1 question (separate) | ✗ wrong problem, after closure |
| «میانگینِ ۳۶ …» | plans «تا میان‌ترم …», «آخرِ سال …», result «۴۰٪» | study practice (session), not this problem | ✗ wrong problem |

**aB2**
| 📜 of | line | belongs to | verdict |
|---|---|---|---|
| problem 1 «مجموعِ عددهای فرد و n²» | 17 entries: statement, induction step, results, look-back, lesson, new problems | problem 1 | ✓ (order: «فرمِ فهم» after results ✗ B24·D18) |
| problem 1 | missing: «همون که گفتی اعداد فرد رو با خونه‌ها بچینم» (helped question), «اون شکله خیلی باحال بود» (taste) | problem 1 | ✗ missing (filed under problem 2) |
| problem 2 «1+3+5+…+99» | entries 1–9 «کارِ تو در گفت‌وگو» (15:50–15:51: greeting/induction/L-picture/base case/even sums/check/lesson/helped/taste) | problem 1 | ✗ wrong problem (B27·D7) |
| problem 2 | statement, «چون nامین فرد…», result 2500, «فرمِ فهم», «حل شد» | problem 2 | ✓ |
| problem 2 | «بازنگری (از گفت‌وگو)» = her solution message | problem 2 | ⚠ labelled look-back, it is the solving step (minor, folded into B27·D7) |
| session | added day-3 sums/divisions (p12–p13) | after closure, no problem | no 📜 line (acceptable) |

**oB1**
| 📜 of | line | belongs to | verdict |
|---|---|---|---|
| wake-up | statement, unknown, data, plan, guess tests, result «۴ از ۷ (⇐ ۵)», lesson, «حل شد» | wake-up | ✓ |
| wake-up | «کارِ تو» = his questions about chain of sleep / missing tool / mind-card comparison | session (no problem) | ✗ (minor) |
| wake-up | «وارسی: … ۵ روز از ۷ … درست درومد!», «حل شد» | wake-up | ✗ not marked after 5⇒4 (D31 remainder) |
| wake-up | ۱۵ آبان plan «آزمون بعدی … جمعه‌ی بعد: شام ساعت ۸» | dinner | ✗ wrong problem |
| wake-up | ۱۵ آبان result «سه شب از چهار شب تا ۱۱:۳۰ خوابم برد» | dinner | ✗ wrong problem |
| dinner | statement, data ×3, guess, ⏸ #104, unknown, plan «تا جمعه … سوپ», plan outcome | dinner | ✓ |
| dinner | ۲۲ آبان result «شد ۵ روز» (wake-up outcome) | wake-up | ✗ wrong problem |
| dinner | (missing) his 3/4 result, his 90 % and 80 % predictions | dinner | ✗ missing |

## 5. Prior-work verdict tables

**s11**
| step | his text | page verdict | expected |
|---|---|---|---|
| 1 | «برنامه‌ی backtracking … حتماً جواب داره: 98 … 49» | ⚠️ ناقص (arithmetic ✓, claim untested) | ✓ verdict; credit for 98/49; not «درست نبود» on the mind card |

**pwB1**
| report | steps | merged? | verdicts | her fixes |
|---|---|---|---|---|
| opening | 1–5 | ✓ | 1 ✓, 2 ✗, 3 dep, 4 ✓, 5 ⚠️ | 2, 3 numeric same turn; 5 by meaning |
| second (p10) | 6–12 | ✓ (12 گام) | all ✓ | — |
| third (p11) | 13–19 | ✓ (19 گام) | 13 ✗, 14 ✗, 15 ✗, 16 ✗ (13/12), 17 ✗, 18 ✗ unit, 19 ✗ | 13, 14 applied (p12) |
| height 15⇒18 (p13) | 2,3,4,10,11,12 | stale-marked | — | — |

**pwB2**
| step | his text | verdict | after |
|---|---|---|---|
| 1 | «معیارها رو نوشتم …» | ⚠️ ناقص (mother missing) | disputed by meaning (p2) ⇒ re-check; his take-back «قبول» (p3); fixed by him ✓ |
| 2 | «وزن دادم: … ۱۱۰٪» | ✗ | fixed by him ✓ (p3) |
| 3 | نمره‌ها | ✓ | never re-asked |
| 4 | «جمعِ وزنی … ۸٫۷ … ۶٫۰۵» | ✗ (dependent) | his two-chain fix ✓ same turn (p4) |
| 5 | «پس شیراز، با اختلافِ زیاد» | ✗ ⇒ ⚠️ after re-check | disputed (p5), take-back with history (p7), fixed by him ✓ 7.7 (p9) |

**pwB3**
| step | her text | page verdict | expected |
|---|---|---|---|
| 1 | «نصفِ محیط میشه طول + عرض = ۱۸ سانت» | not recognised (no ledger) | ✓ step, resume at step 2 |

## 6. Arithmetic tables (wrote · exact · page said · verdict)

**s11**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «10^2 - 2 = 98» | 98 | ✓ | ✓ |
| «98/2 = 49» | 49 | ✓ | ✓ |
| stale proposals after 8×8 | 31, 64, 62, 32, 30 | as stated | ✓ exact |

**s14**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «-28/4 = -7» | −7 | ✓ | ✓ |
| «(960-988)/(20/√25) = -28/4» | −28/4 | نسنجیده | ✓ (C17) |
| «۱ + ۰.۳ ... یعنی تقریباً ۱.۳» | 1.3 | silent | S3 |
| «۲۰ آبان» (date) | — | date ask | ✓ look-alike not arithmetic |

**s17**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «V = 200 m^2 × 0.12 m = 24 m^3» | 24 | ✓ (round 26) | ✓ |
| stale proposals after 180 | 21.6, 15.12, 17.28≈17 | as stated | ✓ |
| «۳ متر در ۴ متر = ۱۲ مترمربع» | 12 | silent | S3 (unread, correct) |
| «۲٫۵ متر در ۴ متر = ۱۲ مترمربع» | 10 | silent | S2 (wrong passed silently) |
| «۱۲ × ۱٫۵ = ۱۸» | 18 | ✓ | ✓ |
| «همون ۱۸ مترمکعب» (2.5×4×1.5) | 15 | silent | S2 (same line) |
| «۲۰ درصدِ ۱۸ مترمکعب = ۳٫۶» | 3.6 | ✓ | ✓ |
| proposal «۱۶٫۸ ⇒ ۱۸» | current 16.2 | stated 18 | ✗ C11 (B27·D8) |

**s18**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «−5·9/(144π) = −45/(144π)» | identity | ✓ | ✓ |
| «−45/(144π) ≈ −0.1» | −0.0995 | ✓ | ✓ (C9) |
| «−6·9/(144π) = −54/(144π)» | identity | ✓ | ✓ |
| «−54/(144π) ≈ −0.37» | −0.1194 | ✗ ≈ −۰٫۱۱۹ | ✓ |
| «۶ به ۵ یعنی ۱.۲ برابر، و ۰.۱۲ هم تقریباً ۱.۲ برابر ۰.۱» | 1.2, 1.2 | silent | ✓ (no operator, sentence) |

**s19**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| weights «۷۸، ۷۷٫۲، ۷۶٫۵، ۷۵٫۱، ۷۴» | series | plotted | ✓ |
| «۴ کیلو کم کردم» ⇒ «۳٫۵» after 74.5 | 3.5 | not marked stale later | ✓ |
| stale «۰٫۵ ⇒ ≈ ۰٫۴۴» | 8/18 = 0.444 | ✓ | ✓ |

**bp1**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «x² − 49 = (x − 7)(x + 7)» | identity | silent | ✓ (symbolic, outside) |
| «۲۵−۹=۱۶» | 16 | ✓ | ✓ |
| «(۵−۳)(۵+۳) = ۲×۸ = ۱۶» | 16 | ✓ «۲×۸ = ۱۶» | ✓ |
| «۸، ۲۴، ۴۸» (cases) | 8,24,48 | silent | ✓ (no operator) |

**bp2**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۵۰ × ۱۵۰ = ۷۵۰۰» | 7500 | ✓ | ✓ |
| «یه متر صد میلی‌متره … ۱.۵ متر» | 1 m = 1000 mm | ✗ unit | ✓ (real slip) |
| «۵۰ × ۱.۵ = ۷۵» | 75 | ✓ arithmetic | ✓ |
| «۵۰ × ۰.۱۵ = ۷.۵» | 7.5 | ✓ | ✓ |
| «۷.۵ متر مکعب = ۷۵۰۰ لیتر» | 7500 | ✓ | ✓ |
| «۶۰ × ۰.۱۵ = ۹» | 9 | ✓ | ✓ |
| «۶۰ × ۰.۱۴ = ۸.۴» | 8.4 | ✓ | ✓ |
| «هفته‌ی بعد، جمعه» (Mon 4 Aban) | 15 Aban | asked 15 Aban | ✓ |

**aB1**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «۴۲ ضربدر ۴ میشه ۱۶۸» | 168 | ✓ | ✓ |
| «۱۷۸ منهای ۱۶۸ میشه ۱۰» | 10 | ✓ | ✓ |
| «۴۲ ضربدر ۵ … ۲۱۰» | 210 | silent | S3 (C17: «نسنجیده» expected) |
| «۱۷۸ رو تقسیم بر ۴۲ کردم، شد ۴ و یه چیزی باقی موند» | 4 r 10 | silent | ✓ (sentence, quotient with remainder, no claim to judge) |

**aB2**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۱/۲ + ۱/۳ + ۱/۶ = ۱» | 1 | ✓ | ✓ |
| «۱/۲ + ۱/۳ + ۱/۴ = ۱» | 13/12 | ✗ (۱۳/۱۲) | ✓ |
| «۱ + ۲ + … + ۲۰ = ۲۱۰» | 210 | نسنجیده | ✓ (C17; not expanded) |
| «۱ + ۳ + … + ۱۹ = ۱۰۴» | 100 | نسنجیده | ✓ not passed (C17) |
| «۲۶ ÷ ۴ = ۶٫۵» | 6.5 | ✓ | ✓ |
| «۲۰ تقسیم بر ۷ … حدودِ ۲٫۸۶» | 2.857… | ✓ | ✓ (C9) |
| «۲۲ تقسیم بر ۷ … یعنی ۳٫۵» | 3.142… | ✗ ≈ ۳٫۱۴ | ✓ |
| «۱۳/۱۲ … از ۱ بزرگ‌تره» | fraction | silent | ✓ |
| «۱۴۰۵/۹/۲۰», «۱۸/۲۰», «۹۹ ≡ ۳ (mod ۴)» | date/score/congruence | silent / date ask | ✓ |
| «2n−1 = 99 پس n = 50», «۵۰² = ۲۵۰۰» | n = 50, 2500 | silent | ✓ (unknown) |

**aB3**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون» | 57.5 | ✓ | ✓ |
| «تقسیم بر ۱۲ میشه حدود ۴.۸» | 4.79 | ✓ | ✓ (C9) |
| «۲۱ × ۱.۳ = ۲۷.۳», «۱۸ × ۱.۲ = ۲۱.۶» | 27.3, 21.6 | ✓ ✓ | ✓ |
| «۱۹ × ۱.۲ = ۲۲.۸», «۲۷.۳ − ۲۲.۸ = ۴.۵» | 22.8, 4.5 | ✓ ✓ | ✓ |
| «۲۰ درصدِ ۳۰۰ میلیون … میشه ۶۰ میلیون» | 60 | silent | S3 (C17) |
| «۵۷٫۵ تقسیم بر ۱۲ = ۵ میلیون» | 4.7917 | ؟ ask rounding | ✓ (C25) |
| «۳۰ درصدِ ۲۱ میلیون میشه ۷ میلیون» | 6.3 | ✗ (۶٫۳) | ✓ |

**aB4**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰» | 100 | ✓ ✓ | ✓ |
| «۱۰۰ منهای ۹۴ میشه ۶» | 6 | ✓ | ✓ |
| «۲۳ + ۱۲ = ۳۵», «۲۳×۲ = ۴۶», «۱۲×۴ = ۴۸» | 35, 46, 48 | ✓ | ✓ |
| «۳۵×۲ = ۷۰», «۹۴ − ۷۰ = ۲۴», «۲۴ ÷ ۲ = ۱۲» | 70, 24, 12 | ✓ | ✓ |
| «۵۰×۲ = ۱۰۰» … | 100 | ✓ | ✓ |

**pwB1**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «294300 ÷ 48 = 6131» | 6131.25 | ؟ ask | ✓ (C25) |
| «۴۸ × ۶۱۳۱ ≈ ۲۹۴ هزار» | 294 288 | ✓ | ✓ |
| «۱ = ۱/۲ + ۱/۳ + ۱/۴» | 13/12 | ✗ | ✓ (S1 fixed) |
| «۱/۲ + ۱/۳ + ۱/۶ = ۱» | 1 | ✓ | ✓ |
| «۱۸۰ ÷ ۱۲ = ۱۶» | 15 | ✗ | ✓ |
| «۱۲ − ۱۲٫۶ = ۰٫۶» | −0.6 | ✗ | ✓ |
| «۱۰۲ ÷ ۶۰ … ۱٫۷» / «… ۱٫۵» | 1.7 | ✓ / ✗ | ✓ |
| «۱۰۲ ÷ ۲۴۰ = ۰٫۴۳» / «= ۰٫۴۵» | 0.425 | ✓ / ✗ | ✓ (C9) |
| «۳۰۶ وات‌ساعت = ۳٫۰۶ کیلووات‌ساعت» | 0.306 | ✗ unit | ✓ |
| «۴ تکه‌ی ۳ متری = ۱۲ متر» | 12 | silent | S3 (unread) |
| «۲ تکه‌ی ۷ متری = ۱۵ متر» | 14 | silent | S2 (wrong silent) |
| «۲۰۰۰ × ۹٫۸۱ × ۱۸ = ۳۵۳ هزار» | 353 160 | ؟ «۳۵۳۱۶۰ هزار» | S2 (wrong scale stated) |
| «۳۵۳۱۶۰ ÷ ۴۸ = ۷۳۵۸» | 7357.5 | ؟ | ✓ |
| date/score/congruence/equation | — | silent | ✓ |

**pwB2**
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۰٫۴×۹ + ۰٫۳×۸ + ۰٫۲۵×۶ + ۰٫۱۵×۸ = ۳٫۶ + ۲٫۴ + ۱٫۵ + ۱٫۲ = ۸٫۷» | 8.7 | ✓ | ✓ |
| «تهران = ۲٫۴ + ۱٫۲ + ۲ + ۰٫۴۵ = ۶٫۰۵» | 6.05 | ✓ | ✓ |
| «شیراز = ۰٫۳×۹ + … + ۰٫۲×۲ = … = ۶٫۷» | 6.7 | ✓ | ✓ |
| «تهران = ۱٫۸ + ۰٫۸ + ۱٫۶ + ۰٫۳ + ۱٫۸ = ۶٫۳» | 6.3 | ✓ | ✓ |
| step 5 «… + ۱٫۴ = ۷٫۷» (score 7) | 7.7 | ✓ | ✓ |
| «۰٫۲×۹ + … + ۰٫۳×۷ = … = ۷٫۵»; «تهران = … = ۶٫۶» | 7.5, 6.6 | (block) | ✓ |
| page proposal «۶٫۰۵ ⇒ ۱۱٫۰۵» | — | — | ✗ B27·D12 |

**pwB3**
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «طول + عرض = ۱۸» | relation with unknowns | silent | ✓ correct (look-alike) |
| «۳ × عرض = ۱۸، یعنی عرض = ۶» | equation with unknown | silent | ✓ correct |
| «۲ × (۱۲ + ۶) = ۳۶» | 36 | ✓ می‌خواند | ✓ |

## 7. Chat ⇄ page verdicts

- oB1: second problem registered separately; return by naming binds then lags one message (B27·D15); 🎯 only via practice_log at outcome; «آره، ثبتش کن» booked two lapsed date asks (B27·D5).
- pwB2: dispute by meaning, take-back, fixes reach ledger and 📜 with history; «جمعه‌ی بعد», «باشه» reach Today, two wrong bookings ride on them (B27·D5).
- pwB1: three chat reports merge into one 19-step ledger; height 15⇒18 marks ledger and chat results; «در» product forms not read (B27·D9).
- aB2/s14: chat lines from one problem land in another 📜 (B27·D7). tB1: chat take-back reaches 📜, sheet stays open (U59).
- s12/aB4/s19: chat words copied to the page are rewritten by the register converter (B27·D4).

## 8. Owner-bank table

| # | verdict | where |
|---|---|---|
| 11 offline / local model | نیمه (sheet #101) | oB1 p15–16 |
| 12 alarm clock build | هست | oB1 p17 |
| 13 book for 10y/70y | نیست (#102) | oB1 p18–19 |
| 14 before/after photos | نیمه (#103) | oB1 p20–21 |
| 15 per-session e-mail report | نیست (#103) | oB1 p20 |
| 16 two problems not mixed | نیمه (B27·D15, scroll table) | oB1 p23, p36–40 |
| 17 when does a sheet get answered | نیمه (no date) | oB1 p26 |
| 18 over-confidence on mind card | هست (Brier 0.553) | oB1 post |
| 19 all records in one place | نیمه | oB1 p35 |
| 20 smartwatch data | نیست (#104, step waits ⏸) | oB1 p25 |
| 45 tool tested on my data or just words | نیست (word overlap only; honest reply; no sheet filed by runner) | tB1z p10 |
| 46 sentence after naming a previous problem | نیمه (asks; binding lags) | oB1 p41 |
| 47 «حل شد» same meaning everywhere | نیمه (tB1 🧭 «حل به نتیجه رسید» vs 🔭 «در بازنگری») | tB1z p16, tB1 c28–29 |

## 9. Routing

Every turn of all 28 runs went to the expected task (per-scenario round27B/<sid>/routing.md, scans clean); only flag: tB1y p10 context line names «پیش‌نیاز» (B27·D17), routing itself correct.

## 10. PARTS.md «نسبت به دورِ ۲۶»

| part | what it is FOR | round 27 | نسبت به دورِ ۲۶ |
|---|---|---|---|
| arithmetic reader | every written computation judged exactly | π, «میشه», fraction identities (13/12 ✗), scale «میلیون», ÷ forms read; «A در B = C», «N تکه‌ی M متری = K» unread (B27·D9), «۳۵۳۱۶۰ هزار» wrong scale (B27·D13), «…» sums «نسنجیده» | بهتر (S1 U1 fixed), دو شکافِ تازه |
| prior-work ledger | her earlier work credited step by step | third report merges (19 steps), take-back, dispute by meaning, two-chain fix all ✓; one-step relation not recognised (B27·D3); «ناقص» ⇒ «درست نبود» on mind card (U24) | بهتر |
| correction engine | every value built on an old datum named with its new value | derived lists exact (s11, s17, aB3, pwB1), coincidental 15 not marked; unrelated 6.05 marked (B27·D12), stale not cleared after redo (B27·D6), proposal keeps 0.8 (B27·D8), header misstates (B27·D11) | بهتر با لغزش‌های تازه |
| territory loop (sheets/arrival) | her missing tool asked/answered honestly | tie ask, Today ❓ row, piece after closure fixed; frame-word arm silent (B27·D16), best fit asked as tie (B27·D19), «پیش‌نیاز» as question (B27·D17) | مختلط (دو پسرفت) |
| dates / Today | only her own commitments, with her yes | «جمعه‌ی بعد», «باشه» read; lapsed asks drift and an unrelated yes books them (B27·D5); ✏️ day change booked old day (B27·D10); narrative read as date (B27·D1) | مختلط، بدتر در «بله» |
| multi-problem binding & 📜 | each line under its own problem | no more copies; binding lags one message (B27·D15); lines under wrong problem (B27·D7); 📜 order (B24·D18); arrows (B24·D16) | مختلط |
| forecast ledger (🎯) | predictions opened when stated, judged on outcome | outcomes routed right; predictions not opened at statement (U49) | همان |
| register layer (تو/شما) | page speaks in her register | page strings mostly «شما»; converter rewrites her own words (B27·D4) | بدتر روی واژه‌های خودِ او |
| mind card | honest credit and calibration | «undefined» gone; Brier/over-confidence shown | بهتر |
| dossier (📚/📜) | the whole journey retrievable | first arrival kept, history with take-back; misfiled lines remain | بهتر، با خطوطِ جابه‌جا |
| routing | each turn to the right task | all turns correct in all 28 runs | همان (درست) |

## 11. New owner-like questions

- «پرسش‌هایی که این هفته در کلاس جواب گرفت کدام بود؟» (s15)
- «دخترم کدام روش‌ها را خودش ساخته؟» (s16)
- «کدام پارامترها را هنوز نیازموده‌ام؟» (s20)
- «وقتی گفتم بله، دقیقاً به کدام پرسش بله گفتم؟» (oB1)
- «پیش‌بینی‌هایی که هنوز باز است کدام‌اند؟» (oB1)
- «ابزارِ تازه را روی همین مسئلهٔ من امتحان کن» on every arrival (tB1z, bank 45)

## 12. Runner notes and token/time

- Mistakes of my own (class d): s13 list_update ids swapped by the replay mapping twice; third run hand-mapped; earlier runs kept as round27B/_s13_first, _s13_second. bp1 age corrected to 15.
- B24·D16 (two arrow forms) booked late in bp2, pwB1, s17, s19 by the cross-scenario scan (compensation b); findings regenerated, no extra mail.
- Repo untouched; no commits/pushes. Only my PIDs were killed; none alive. Browser profiles deleted; ai/ folders kept. STORYBOARD_LINKS.md line «دورِ ۲۷ B» appended.
- Token use not visible to me; wall time about 2 h+ ; about 60 manual replies and about 330 replayed answers.