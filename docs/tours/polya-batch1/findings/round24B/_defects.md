# Round 24 — runner B — defect catalogue (B24·Dn) + round-23 defect table
Build: main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js (+ harness5s.js = same, page URL from env, for the territory build on a scratch copy). Replays of round23B/<sid>/ctl with tools/drv.py (answers matched by her turn text; new replies written as the literal average model where round 24 asks something new). Turn ids pN = <sid>/ai/pN.json.

## S2
- **B24·D1** (b) Birth-date input still refuses common Iranian forms: card «96/2/30» (two-digit Jalali year, numeric) ⇒ «تاریخ را نشناختم» (aB1 c3); after «۱۷ اسفند» the card says «سالش را هم بنویس» but the year alone «88» ⇒ «تاریخ را نشناختم» (aB2 c4; the day typed in the card is not kept — only a day said in chat is); Finglish «17 Esfand 1388» refused (aB2 c5). a43_age.js G.parse (numeric forms need a 4-digit year) / askNode (mdTx only from chat birthMD).
- **B24·D2** (b) Chat ⇄ page still two stories after a chat problem becomes live: the 🔭 form now shows every chat item as «از گفت‌وگو: … درست است؟» (good), but the page's own turn question re-asks the unknown he already said and that sits in the form (aB3 p11, p12 «به مجهول نگاه کن: دقیقاً چه می‌خواهی…»; tB1 p11), and the 🔭 stage stays «فهمِ مسئله» to the end (aB3 six months later with decision + plan + verified forecast; tB1) while the strip/prompt say «بازنگری» (aB3 p13 «مرحلهٔ محتمل: بازنگری (صفحه هنوز «فهمِ مسئله»)»). chat_solved imports only the statement (aB4 p7: u/dl/c/solution empty although p2 named unknown, data, condition and he gave two methods). a38 chat→live import / stage advance.
- **B24·D3** (c) The chat-plan importer cuts one message at commas into bogus plan steps: tB1 p7 ⇒ «گامِ ۱ ِ طرح: اگه مستقل باشن» … «گامِ ۸ ِ طرح: حالا جمع‌بندی کن ببینم کجام»; route main line and Today strip «مانده: ۰ گام از ۸ گامِ طرحت» are wrong; her step-3 sentence «کارکرد در یک جمله: …» was imported as «کل در یک جمله (از گفت‌وگو)». a44 ROUTE (cplan23) / a38 import.
- **B24·D4** (b) s18 p11: after the corrected datum (۶) the page demoted ITS OWN re-check question as «گفت‌وگو از فهمِ مسئله جلوتر رفته … پرسشِ فرمِ فهم کهنه است» because her message began «کل مسئله: …»; her new result −54/(144π) ≈ −0.37 is numerically wrong (≈ −0.119) — the re-check is now model-only (regression of the R20 fix). a27 AS.unfit23.
- **B24·D5** (b) s19 c81 deadline correction «۱۸ هفته … نه ۱۶؛ عروسی ۱۵ اسفنده»: the copy ask offers «فهمِ مسئله — کل در یک جمله» and «دادهٔ ۱» with «۱۶» ⇐ «۱۵» (16 WEEKS would become 15 — the day of the month); «بله» would corrupt both. The chat-statement record is «می‌خوام.» ⇒ «می‌خوام (اصلاحِ خودم: عروسی ۱۵ اسفنده).». a38 liveNumCopy number role.

## S3
- **B24·D6** (b) Every birth confirmation writes the ISO date to the person: «✓ تاریخِ تولدت ثبت شد: ۱۷ اسفند ۱۳۸۸ (2010-03-08 میلادی)» (aB1, aB2, aB3, aB4, s11, s12 …; contract says never «YYYY-MM-DD» to a person); the Latin run splits the parenthesis across lines (s12 s2.png); a second identical «✓ … ثبت شد» when page and model both save (aB1 p9, aB3 p2).
- **B24·D7** (b) A model ISO birth silently overrides the page's own parse of her sentence: aB3 first run — page saved 1959-05-03 (= ICU) and said so; the reply's {"do":"birth","date":"1959-05-02"} then replaced it with no notice (aB3_first/). Rerun with a round-24 reply (date as said) kept 05-03.
- **B24·D8** (b) «# مخاطب» says «(سالمند؛ از تاریخِ تولدِ ثبت‌شده)» when only «۸۲ سالمه» was said (aB4 p1).
- **B24·D9** (b) False deferred promises: «اینا رو یه جا نگه دار که یادم نره…» (s13 p6, fulfilled by two list_add in that turn) and «اینو یه جا ثبتش کن که فردا…» (aB4 p7, fulfilled by chat_solved) become «# درخواست‌های عقب‌افتادهٔ کاربر» pr1, described as «پاسخ به «<the assistant's own question>»» (s13 p7, aB4 p9–p10). a27 promises (R23 Q7 D23-33).
- **B24·D10** (c) Quote post-check false positive: the assistant's own phrase in «» is treated as a quote attributed to her (s11 p4 «هر دومینو دو خانهٔ مجاور را می‌پوشاند»; bp1 p3 «مربعِ یک چیز منهای مربعِ یک چیزِ دیگر») — an extra rewrite round each.
- **B24·D11** (b) Register post-check forces «تو» on an 82-year-old after six «شما» turns because he wrote «ثبتش کن» to the machine (aB4 p8).
- **B24·D12** (b) Turn-question fit: one page question still holds two («با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟» s13 p7, aB3 p13, s19 p5–p7/p15, bp2 p10/p12); aB4 p9–p10 «جواب را در شرط جای‌گذاری کن…» after he verified at p5; oB1 p8 «خودت فکر می‌کنی چرا؟» on a question about the system; s18 p17 one line says the page question is not asked, another says «**فقط** همان یک پرسشی که «مسئلهٔ زندهٔ این سشن» می‌دهد»; s18 p4 a context line points to «پیشنهادِ این نوبت» but no turn question exists; tB1 p9 the resume question is labelled «همان «پیش‌نیاز»».
- **B24·D13** (b) s14 Today 28 آبان still «⏰ «میان‌ترمِ آمار» … امتحانش را دادی؟ چطور شد؟» after p11 «میان‌ترم رو ۱۴ گرفتم» (PR.dlDoneFromHer did not fire; wording fixed). = B23·D15.
- **B24·D14** (b) Chat guesses keep «آزموده نشده»: aB2 «۲۵۰۰» (justified next turn), tB1 «یک بار خواندن بس است» (refuted by her 19/20), aB4 «۲۰ مرغ و ۱۵ خرگوش» (refuted in the same message). = B23·D23.
- **B24·D15** (b) bp1 p12 «x²−9 = (x−3)(x+3). درسته؟ با ضرب هم چک کردم» ⇒ «همین پیام حدس است … چطور می‌آزمایی‌اش؟». = B23·D11.
- **B24·D16** (c) Correction display: s17 p6 page result «why» = «[اصلاحِ پیامِ قبلی] «» ⇐ «» ، «» ⇐ «» …» (all quoted values emptied); «# پیام‌های اخیرِ صفحه» repeats «کارنامه: همان کار … دوباره ثبت شد»; s11 ask list names «صورتِ مسئله» twice; s18 arrows point opposite ways (statement «new (اصلاح شد ⇐ old)», lesson «old ⇐ new»).
- **B24·D17** (b) After «بله» the derived numbers stay stale and unmarked: s11 «صفحهٔ ۸×۸ (۱۰۰ خانه)», «۹۸ خانه», «۴۹ دومینو», plan «(۵۰ و ۴۸)», step «(۱۰,۱۰) … 10^2 = 100».
- **B24·D18** (b) Route/dossier order and duplicates: aB4/aB2 route repeats «نتیجه (از گفت‌وگو)» ×3 and «بازنگری (از گفت‌وگو)» ×2, «فرمِ فهم» after the results; tB1 dossier puts «🛎 ابزارِ لازم آمد» under ۲۶ مهر (day 0) before the ۲۷ مهر mismatch, route lists sysmis after sysback/rejoin; aB4 sys line «… «حل شد» خورد» while the closure reads «در بازنگری — هنوز بسته نشده».
- **B24·D19** (b) Territory loop details: the mismatch «built» list includes «🧭 این برنامه چیست؟» taken from the sheet's own original text (`whole`), not from the reply; sys_done (tB1x p8) closes the mark (state other ✓) but writes no page line and leaves sheet #101 open with no note for the routine.
- **B24·D20** (b) bp2 mind «علتِ هر گیر»: the same unit stuck listed three times (B23·D22 duplicate part, worse).
- **B24·D21** (b) s15 p6 her question «… به ترتیب بخونم. خوبه؟» stored as her plan with موعد ۱۶ آبان she never gave (model `when` accepted without evidence; better/r6); teacher conversation strip «اکنون: فهمِ مسئله · مقصد: چیکار کنم؟» after three weeks.
- **B24·D22** (b) aB3 chat→live import lists her correction message itself as data («ببخشید، یه اشتباه کردم: حقوقم ماهی ۱۸ نیست» and «۱۹ میلیونه») and splits one datum into fragments.

## Round-23 defect table (B23·Dn)
| id | verdict | evidence |
|---|---|---|
| D1 خنگم after closure | FIXED | bp1 p11 ability line present |
| D2 route for chat problems | CHANGED | origin = statement, destination = her unknown (aB4 MID «چند تا مرغ و چند تا خرگوش؟», tB1 WAIT); nesting kept (bp3); but main line from bogus plan split (B24·D3), duplicates (B24·D18) |
| D3 copy asks by meaning | CHANGED | s17 «۱۸۰ نه ۲۰۰» asks d1 + measure ✓; s17 ✏️ no false «۱۰ تا ۲۰» ask ✓; s11 asks lpOne/d1/plan/step ✓; s19 step copy asked ✓; new number-role error s19 c81 (B24·D5) |
| D4 deadline garble | CHANGED | s19 c81 live statement clean; chat-statement record «می‌خوام.» + wrong ask (B24·D5) |
| D5 chat work into later live problem | CHANGED | aB3 form «از گفت‌وگو …» ✓, u0 not re-asked ✓; unknown re-asked p11/p12, stage frozen (B24·D2) |
| D6 Jalali birth date | CHANGED | s12 «۱۳۳۸/۰۳/۱۲» ⇒ 1959-06-03 ✓, aB2 «1388/12/17» ✓, aB3 chat ✓, aB4 ✓; gaps B24·D1 |
| D7 waiting record + resume loop | FIXED | tB1: marker in chat/🔭/🧭/📜, mismatch reopens, registry build ⇒ «🛎 ابزارِ لازم آمد» in Today ⇒ resume p9 ⇒ resumed |
| D8 teen block garble / «شناسه را بپرس» | FIXED | aB2 «سهمِ تو پرسیدن است»; strict scan clean in all 20 dirs |
| D9 card register | FIXED | s12 painted «تاریخِ تولدتان ثبت شد» |
| D10 raw first message in stack/titles; forced restatement | FIXED | bp3 «برگردیم به مسئلهٔ اصلی نردبانی…»; bp2/bp3 no restatement rewrites |
| D11 guess detector | STILL | bp1 p12 (B24·D15) |
| D12 turn-question misfits | CHANGED | s13 keep-request and s18 p17 demotions ✓; others B24·D12 |
| D13 practice/greeting as subject | FIXED | bp3 p14, s14 p8, aB1 p2 |
| D14 correction hint on recall error | FIXED | bp3 p14 no hint |
| D15 deadline after exam reported | STILL | s14 (B24·D13) |
| D16 territory list truncated | FIXED | tB1 p3 all six systems incl. s_social, s_self |
| D17 model cannot open chat route | FIXED | oB1 p6 go route ⇒ «🧭 نقشهٔ مسیرِ مسئله» opened; prompt carries the session id |
| D18 first stuck «نامعلوم» | FIXED | bp3 mind: both stucks cause = prerequisite |
| D19 title follows corrected statement | FIXED | s11 p7 «دومینو روی صفحهٔ ۸×۸…» |
| D20 cheat-sheet false positive | FIXED | s14 no rewrite |
| D21 models shelf duplicate | FIXED | s18 one model item + one use |
| D22 bp2 causes | CHANGED | both learned listed ✓; triple duplicate (B24·D20) |
| D23 chat guesses «آزموده نشده» | STILL | B24·D14 |
