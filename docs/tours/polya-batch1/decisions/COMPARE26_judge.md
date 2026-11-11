# Round-26 runner comparison — blind judge result (runs X and Y, group B, page main 1f93c333)

Method: every row below was checked against primary evidence (ai/pN.json page prompts, rN.txt, out/sN.json, post.txt, ctl) — not against findings wording. No turn was re-run on the page (no process started; `judge_pids.txt`). Arithmetic re-computed exactly (fractions). «NE» = not exercised in that run (the persona never wrote that shape / the arm was not run); «MISSED» = visible in that run's own evidence and not reported. Severity is the judge's.

## Arithmetic settled exactly
- «۱ = ۱/۲ + ۱/۳ + ۱/۴»: exact sum 13/12 ≠ 1. X/pwB1/ai/p11.json tells the coach «✓ «۱/۲ + ۱/۳ + ۱/۴ = ۱» می‌خواند» + «حسابی را که صفحه می‌خواند نادرست نخوان». Shown as ✓ — real, wrong work passed. Y never wrote a false fraction sum (only the true «۱/۲ + ۱/۳ + ۱/۶», which the page left unread in both runs).
- «۳۵ × ۱٫۴ = ۴۹ میلیون» (exact 49) and «۲۵ − ۱۸ = ۷ میلیون» (exact 7): Y/pwB2/ai/p9.json tells the coach «✗ «۳۵ × ۱.۴» را «۴۹ میلیون» نوشته — حسابِ صفحه: ۴۹» and «✗ «۲۵ − ۱۸» را «۷ میلیون» نوشته — حسابِ صفحه: ۷». Shown as ✗ — real, correct work flagged. Same block: «۲۱ × ۱۲ = ۲۴۲» ✗ (252, right), «۴۹ ÷ ۱۸ ≈ ۲٫۷۲» ✓ (2.7222, right). X never wrote «= N میلیون» (its «۴۸ × ۶۱۳۱ = ۲۹۴ هزار» was read ✓).
- All other page ✓/✗ lines in both runs (73 + 72 distinct lines) are arithmetically right, incl. C9/C13 roundings (0.29/0.5 = 0.59 via 0.2943; 102/240 = 0.425 → 0.43 ✓, 0.45 ✗; 353160/48 = 7357.5 vs her 7257 ✗).
- Runners' own numbers: X (13/12; −54/(144π) = −0.1194; −45/(144π) = −0.0995; 64/32/30 and 62/31 for 8×8; «هفتهٔ بعد، جمعه» from Mon 4 Aban = 15 Aban) and Y (252; 23.6; 15.12; 17.28; 7357.5; 8/18 = 0.44; 12 Ordibehesht 1338 = 3 May 1959) — no miscalculation found in either. One runner slip, not arithmetic: X/s11 states the persona's age as 16 while the stored birth date (23 Esfand 1385) gives 19.

## Union table
| U | defect (turn) | real? | sev | X | Y | evidence |
|---|---|---|---|---|---|---|
| U1 | false fraction identity reported ✓ to the coach, relayed to her | yes | S1 | found (D20) | NE | X/pwB1 p11, r11, p12–p13 |
| U2 | correct result followed by a unit word («= ۴۹ میلیون») reported ✗ | yes | S1 | NE | found (D19) | Y/pwB2 p9, r9, p10 |
| U3 | a later report she calls her own work («اینم کارِ خودمه، ببین») never enters the ledger (stays 12 steps) | yes | S2 | found (D18) | NE | X/pwB1 r11 (prior sent), p12 ledger |
| U4 | datum correction does not reach the prior-ledger steps / chat results that used it (pwB1 15→18 m; aB3 18→19) | yes | S2 | found (D19, D4-inst.) | found (D14) | X/pwB1 s22; Y/pwB1 s22, p13; aB3 p12 both |
| U5 | the same correction marks by coincidental number (cable «۱۵ متر», «۲۰۴ وات‌ساعت», «۱۵ آمپر») | yes | S2 | found (D19) | NE (no other 15 in Y's ledger) | X/pwB1 s22 sys line, post.txt «گامِ ۷ … کهنه» |
| U6 | s17 200→180: coefficient «۰.۷» named as the stale result; 24 / 16.8 / 17 not named | yes | S2 | found (D4) | found (D5) | s36 both (identical line) |
| U7 | s19 16→18 weeks: measured «۳٫۵» listed stale with «⇒ ≈ ۳٫۴۴۴» | yes | S2 | found | found | s81 both |
| U8 | dispute by meaning gets A073 «خودت فکر می‌کنی چرا؟» | yes | S2 | found | found | pwB2 p2 both |
| U9 | taking back a mistaken rejection of a verdict is read as a new dispute (C5) | yes | S2 | found (D23) | NE (no prior-work take-back run) | X/pwB2 p7 |
| U10 | «تا جمعه» on a Friday: asked once, but today's date booked from the model and her «جمعهٔ بعد» not read | yes | S2 | found (D24) | NE | X/pwB2 s20, r11, final msgs, post «موعد: ۸ آبان … انجام شد؟» |
| U11 | sub-result ⇒ «مرحله: بازنگری» (B25·D9 STILL) | yes | S2 | found (tB1 p7–8, aB3 p9; aB1 p4 instance not listed) | found (pwB1 p9, aB1 p4, aB3 p6, tB1x p7, tB1 p7) | stage trace of every prompt, both runs |
| U12 | return by naming: the turn stays bound to the last problem; records land on the wrong problem | yes | S2 | found (D30) | found (D33 part) | X/oB1 p29–p31; Y/oB1 p23, p25–p28 |
| U13 | problem 1's plan + «انجام شد» copied into the other problems' 📜 | yes | S2 | MISSED (in X dinner dossier; table says D12 FIXED «own 📜») | found (D33) | X/oB1 post.txt DOSSIER pb_l_mvzt…; Y/oB1 post.txt |
| U14 | correction 5→4 leaves the 🎯 row «شد», practice «(درست)» and look-back check untouched | yes (sys line read; rows not re-opened by judge) | S2 | found (D31) | NE | X/oB1 p31, s27 |
| U15 | his 60 % wake-up verdict booked on the other open forecast (90 %, before its date) | yes | S2 | found (D32) | NE | X/oB1 s28 sys line, r31 |
| U16 | «دو روز ⇒ سه روز»: «چیزی برای عوض کردن نبود» while the record keeps «دو روز» | yes | S2 | found (as S3) | found (S2) | oB1 s5 both |
| U18 | own correct fix of judged step 4 (two computations, all ✓) not applied | yes | S3 (S2 arguable) | found (as S2) | found (S3) | pwB2 r4, p5 both |
| U19 | «باشه» not read as yes to the page's own «… درست است؟» | yes | S3 (S2 arguable: nothing booked, no line) | found (pwB2, as S2) | found (aB4, S3) | X/pwB2 final msgs; Y/aB4 |
| U20 | model-reported plan / deadline dates booked with no page «… درست است؟» (bp2 wrong day, s14, s17, s19, oB1) | yes | S3 (bp2 instance S2 arguable) | found (D11 as S2, D3) | found (D7) | bp2 post «موعد: ۸ آبان» (X) / «۲۵ آبان» = Monday (Y); s14 r5 |
| U21 | s19: «تا جمعه» on a Friday and her own dates get no page question at all | yes | S3 | NE | found (D9, D7) | Y/s19 c108–c114, final msgs |
| U22 | date reader false positives: «۸ ماهه» (s20), «جل‌سه شنبه» (s19); oB1 past report / «جمعه‌ی بعد» | yes | S3 | found (D1, D14, D34) | found (D4, D10); oB1 part NE | s20 s1, s19 s44 both; X/oB1 s32 |
| U23 | mind card source cell «undefined: k از n» | yes | S3 | found (D6) | MISSED (pwB1, pwB2, s11, s12 post.txt) | post.txt both |
| U24 | mind card books an «ناقص» prior step as «− … درست نبود» | yes | S3 | found (D7) | found (s11 D26) | s11 post both |
| U25 | π expressions unread; wrong «≈ −0.37» passes silently | yes | S3 | found | found | s18 p10 both |
| U26 | correct work silently unread: «۶۰ × ۰.۱۵ = ۹ متر مکعب», «۲۴ × ۰.۸ = ۱۹.۲», chain «… = ۴۰ + ۶۰ = ۱۰۰», «… میشه» | yes (benign; X's cause «bound to a live problem» is not right — Y/s17 p8 is live-bound and has a block) | S3 | found (D10, D35) | MISSED (same turns) | bp2 p9/p11, s17 p5, aB4 p3/p4 |
| U27 | wrong running sum with a unit between («با ۲ مترمکعب … میشه ۲۴٫۶», exact 23.6) unread | yes | S3 | NE | found (D6) | Y/s17 p8 |
| U28 | division slip labelled a unit error (353160/48) | yes | S3 | NE | found (D15) | Y/pwB1 p13 |
| U29 | bp3 day-2 session titled by the greeting message | yes | S3 | found (D9) | MISSED | bp3 s27/s28 both |
| U30 | s13 mind card «−» for an assumption she herself tested and refuted | borderline | S3 | found (D13) | not reported | s13 post l.272 both |
| U31 | s16 after 24→30 the strip still says «حل به نتیجه رسید»; result unmarked | yes | S3 | found (D2) | MISSED (scenario PASS) | s16 s7, post both |
| U32 | s15 strip destination still «چیکار کنم؟» | yes | S3 | found (STILL) | MISSED (scenario PASS) | s15 post both |
| U33 | s11 stale list misses his own 98 and 49 | yes | S3 | found (D5) | MISSED | s11 s49 both |
| U34 | s11 after «بله» the datum reads «صفحهٔ ۸×۸ (۱۰۰ خانه)»; title stays 10×10 | yes | S3 | MISSED | found (D1) | s11 post both |
| U35 | s11 ask list names «صورتِ مسئله» twice | yes | S3 | found | found (under a wrong id) | s11 s49 both |
| U36 | s11 prior work never reaches the live problem (B25·D26) | yes | S3 | found | found | s11 post both |
| U37 | s12 static «امروز» lines in «تو» for a «شما» elder | yes | S3 | MISSED (states «شما kept in page lines») | found (D2) | s12 post both |
| U38 | s17 «ریاضی‌کردن» keeps stale «= ۱۹» (B25·D27) | yes (not re-opened) | S3 | found | found | both tables |
| U39 | bp2 strip keeps a learned prerequisite open (B25·D28) | yes (not re-opened) | S3 | found | found | both tables |
| U40 | bp1 own check ignored (B24·D15) | yes | S3 | found | found | bp1 p11 both |
| U41 | s19 calibration row counts 2 judged while three 🎯 are judged | yes (three «داوری شد» rows seen) | S3 | MISSED | found (D11) | s19 post both |
| U42 | s18 p16 two incompatible question directives | read only | S3 | found | not reported | s18 p16 both |
| U43 | misleading ledger line «متنِ تازه‌ات … هنوز نمی‌خواند» / old text kept | yes | S3 | found (D17) | found (D13) | pwB1 📜 both |
| U44 | step shown ✓ beside the stale «حکم ماند — …» dispute reason | yes | S3 | MISSED (in X p10–p13 ledger) | found (D12) | pwB1 ledger both |
| U45 | correction line with identical clipped before/after | yes | S3 | found | found | pwB1 s22 both |
| U46 | mind card credits «+ نتیجه‌ای که گفت» for a message the page marked ✗ | yes | S3 | NE | found (D16) | Y/pwB1, pwB2 post |
| U47 | inferences / fragments imported as data rows (B25·D24) | yes | S3 | found | found | post both |
| U48 | aB1 birth date said again: assistant promises a page line, page shows none | yes | S3 | found (D16) | NE (reply sent no action) | X/aB1 p9, r9 |
| U49 | aB3 stated 70 % prediction never becomes a 🎯 | yes | S3 | MISSED | found (D22) | aB3 post (0 🎯) both |
| U50 | aB3 one commitment, two records; ⏰ «گذشت؛ انجام شد؟» stays after he reported it done | yes | S3 | MISSED (PASS «one item»; ⏰ still in final post) | found (D21) | aB3 r14, post both |
| U52 | aB3x wrong Gregorian conversion in the reply stays (B25·D17) | yes | S3 | NE | found | Y/aB3x p2 |
| U53 | aB4 page question mixes registers («می‌توانید … به دست آوری») | yes | S3 | found (D36) | NE (suggestion never reached) | X/aB4 p7, p8 |
| U54 | aB4 «مجهول (از گفت‌وگو)» = her data sentence | yes | S3 | found (D38) | MISSED (booked as PASS/FIXED) | aB4 s13/s14, post l.44–46 both |
| U55 | post-check «دو ضمیر» false positives | yes (not re-opened) | S3 | found (D37) | found (D20) | cited turns |
| U56 | page suggestion repeated after it was answered (oB1 prediction p6–p10; aB4 p2–p5) | yes (minor) | S3 | MISSED | found (D32, D21-family) | suggestion trace both |
| U58 | tB1 📜 loses the first arrival event after the take-back | yes | S3 | found (D27) | MISSED | tB1 post both |
| U59 | tB1 sheet #101 stays «open» after the take-back | probable | S3 | not reported | found (D25) | tB1 s24 / s28 |
| U61 | tB1y Today ❓ line opens a page with no way to answer | read only | S3 | found (D28) | NE | X/tB1y s16 |
| U62 | tie arm: naming the other candidate ⇒ a second ask; Today names only the first; 📜 keeps the last ask | first part seen, rest read only | S3 | NE (arm not run) | found (D27–D29) | Y/tB1y ❓ lines |
| U63 | piece brought after closure: no Today line; stale session step | read only | S3 | NE (arm not run) | found (D30, D31) | Y/tB1z post |
| U64 | lesson read as a guess with emptied quote (B25·D22) | yes (not re-opened) | S3 | found | found | oB1 p14 both |
| U65 | wrong sentence taken as unknown / destination (B25·D23 family) | read only | S3 | found (D33) | found (tB1x, D23) | cited |
| U66 | «پیش‌بینیم … درست درومد» did not judge the 🎯 | NO — Y's own reply omitted the practice_log the prompt offers; X's reply sent it and the page judged it | — | — | FALSE (D34) | Y/oB1 r10 vs X/oB1 r10, p10 |
| U67 | bp2 «این کم‌هوشی نیست» names the last prerequisite | arguable (he spoke of weak maths in general) | — | reported (D12) | not reported | bp2 s29 both |
| U68 | tB1 arrival wording «سنجیدم که … جواب می‌دهد» | arguable (wording opinion) | — | not reported | reported (D26) | tB1 s23 |
Not verified either way: X D39 (aB3 guess title), X aB2 📜 order, X B24·D16 arrows, X D21/D29-detail rows, Y D24 (aB4 title), Y aB4 p9 question, Y pwB2 comma split, Y oB1 D23/D30-family.

## Per-run table
| line | X | Y | better |
|---|---|---|---|
| real S1 found | 1 (U1) | 1 (U2) | tie |
| real S2 found | 13 (U3–U12, U14–U16) | 8 (U4, U6, U7, U8, U11, U12, U13, U16) | X |
| real S3 found (verified or read) | 30 | 32 | Y, slightly |
| MISSED S1 | 0 | 0 | tie |
| MISSED S2 | 1 (U13) | 0 | Y |
| MISSED S3 | 8 (U34, U37, U41, U44, U49, U50, U56, U59) | 9–10 (U23, U26, U29, U31, U32, U33, U42, U54, U58; U30 borderline) | X, slightly |
| not exercised | S1 U2; S3 U21, U27, U28, U46, U52, U62, U63 | S1 U1; S2 U3, U5, U9, U10, U14, U15; S3 U48, U53, U61 | X (fewer S2-level gaps) |
| false defects | 0 (1 arguable: U67; 1 borderline: U30) | 1 (U66) (+1 arguable: U68) | X |
| severity calls | over-rates U18, U19, U20-bp2 (S2); under-rates U16 (S3) | under-rates nothing material; U19 S3 | tie |
| wrong PASS (scenario) | 2 — tB1x, tB1z (U11 is in their own p7–p8; counted only under tB1) | 3 firm — bp3 (U29), s16 (U31), s15 (U32); 2 soft — s13 (U30), s14 (U20 instance) | X |
| wrong PASS (criterion lines) | oB1 «D12 FIXED, own 📜» (U13); s12 «شما kept in page lines» (U37); aB3 «one item» (U50) | aB4 «مجهول … FIXED» (U54) | Y |
| wrong FAIL | 0 | 0 | tie |
| round-25 FIXED/STILL table | 3 rows overstated: D12 FIXED (U13 says CHANGED), D21 FIXED (U56), D9 instance list (aB1) | 3 rows off: D16 row mixes two different defects, D15 FIXED though its own D18 shows the refusal, D25 misses bp3 (U29) | tie |
| «ارتقای لازم» | 34 items, 31 distinct; 5 are «none» placeholders; specific to the scenario | 42 items, all distinct and specific; 3 scenarios have none | Y, slightly |
| better/ replies | 4 files, all newly written (0 copies) | 2 files, both newly written (0 copies) | X |
| brief compliance | did not run the tie arm or the piece-after-closure arm; third problem only mentioned; no «= N unit» shape. Ran third report, prior-work take-back, mixed reply, Friday + «جمعهٔ بعد» + «باشه». Lists its own reply mistakes | no false fraction sum, no third report, no prior-work take-back. Ran tie, after-closure, registered third problem, Friday clock, an extra C7 scenario. No own-mistakes list; one own-reply effect booked as a defect (U66) | mixed |
| interference | none seen; 26/26 DONE | none seen (aB3 re-run once from scratch, stated); 27/27 DONE | tie |
