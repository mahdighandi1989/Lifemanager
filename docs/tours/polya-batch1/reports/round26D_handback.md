ROUND 26 — GROUP D — FINAL REPORT (runner complete; all 29 scenarios have DONE; 29 e-mails sent)

Base dir T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
Outputs: T/round26D/<sid>/ (findings.md, ai/, out/, better/, mail.html, mail.subject.txt, DONE), T/round26D/PARTS.md, T/round26D/defects.md (final), line «دورِ ۲۶ D» added to T/STORYBOARD_LINKS.md. Repo untouched (main 1f93c333). All recorded PIDs dead; only my profile_D26 dirs deleted; ai/ kept. Owner address is in no file.

Method notes: round-25 ctl replayed; round-25 model answers were not in the container, so EVERY model reply was written fresh as the literal average model. Per-scenario clock via inject.js. Adaptations are in round26D/<sid>.adapt.log. Two runner slips, both re-run from scratch and logged: a double heredoc (s34, s36) and a wrong `status` on aD4 p8 (sheet not requested; final run is clean with status=gap).

## 1. Per scenario: RESULT · defects (p<N>) · «ارتقای لازم»
Totals: 18 PASS, 10 PARTIAL, 1 FAIL. Routing wrong = 0 in all 29.

| sid | RESULT | Defects | ارتقای لازم |
|---|---|---|---|
| arD1 | FAIL | S1 D26-16 (p6); S2 D26-18 (p7), D26-11 (p2, p4); S3 D26-17, -10, -5, D25-8 STILL | running sum with scale word; wrong fraction sum / wrong running sum / wrong unit conversion must not pass |
| pwD1 | PARTIAL | S2 D26-9 (p4⇒p5), D26-11 (p11), D26-8 (p9⇒p10), D26-14 (p5, p6); S3 D26-5, -7, -10, -12, -13 | read mixed accept/reject per step; dispute by meaning; one prediction = one 🎯 |
| pwD2 | PARTIAL | S2 D26-3 (p2–p4), D26-6 (p6); S3 D26-4, -5, -7; D25-5/-11/-15/-16 STILL | her own non-numeric repair must land; second problem keeps its own records |
| oD1 | PARTIAL | S2 D26-23 (p17⇒p18), D26-24 (p9); S3 D26-25, -26, -27, -28 | verbatim guess must be accepted; arithmetic shapes |
| oD1u, oD1g, oD1t, oD1f | PASS | only shared S3 (C2 only half tested in oD1f) | — |
| oD1r, oD1n | PASS | S3 D26-19 (s13) | reason text without the unrelated word «پایه» |
| oD1e | PASS with defect | S3 D26-20 (s13) | a tie must ask naming both |
| oD1x | PASS | S3 D26-21, D26-22 (p9, p10) | sheet state after taking back «نه» |
| oD1b | PASS | S3 D26-2 | — |
| s30 | PASS | S3 D26-29 (p8⇒p9), -30 (p10), -31 (p4, p8), D23-11 STILL | — |
| s31 | PASS | S3 D26-32 (p10), D26-28, D25-24 CHANGED (p15) | — |
| s32 | PASS | S3 D26-33, -34 (s17), -35, -36 (s34) | — |
| s33 | PASS | S3 D26-37 (s27) | confirmation line after «باشه» |
| s34 | PARTIAL | S2 D26-38 (p9, 📜); S3 D26-39 | ✏️ must refresh chat-recorded results |
| s35 | PARTIAL | S2 D26-41 (p14); S3 D26-40, -42 | never offer the negated date |
| s36 | PARTIAL | S2 D26-24 (p3); S3 D26-43; D25-19 CHANGED (p7) | percent / «A از B» checks |
| s37 | PARTIAL | S2 D26-46 (p9), D26-47 (p13); S3 D26-45 (p8) | stale-number proposal inside algebra; open undated practice case must be in context |
| s38 | PARTIAL | S2 D26-38 (📜); S3 D26-48 (p6); D23-12 STILL (p10) | same as s34 |
| dp1 | PASS | S3 D26-49 (p3/p4); D25-24 CHANGED (p8); D26-24 scope | — |
| dp2 | PASS | S3 D26-50 (p4), D26-37 (p9), D26-28 | — |
| dp3 | PASS | S3 D26-51 (p12–p13) | typed answer to the 📅 question needs an acknowledgement |
| aD1 | PASS | D26-24 scope (p5); D24-15 STILL (p2) | child wording of the «مجهول» question |
| aD2 | PASS | S3 D26-1 (p1, p4, p7), D26-2; D25-16 STILL | — |
| aD3 | PARTIAL | S2 D26-52 (p7); S3 D26-40 (p4), D26-28 | tolerance for ≈ percent; show page value in her unit |
| aD4 | PARTIAL | S2 D26-24 (p2, p3, p5 — incl. a real slip 79.7 vs 79.4 the page missed); S3 D26-53 (p3→p4), D26-54 (route), D25-25 STILL | «N تا A با M برش میشه …»; strip destination; separate profiles (sheet #101) |

New defects: S1 ×1 (D26-16), S2 ×14 (D26-3, -6, -8, -9, -11, -14, -18, -23, -24, -38, -41, -46, -47, -52), S3 ×37. Full text in T/round26D/defects.md.

## 2. Round-25 defect table
| id | status | where |
|---|---|---|
| D25-1 | FIXED | pwD1 p2–p5 (but D26-9 in another mixed shape) |
| D25-2 | FIXED (numeric) | pwD1 p2; non-numeric repair ⇒ D26-3 |
| D25-3 | FIXED | pwD1, pwD2 📜 |
| D25-4 | FIXED | pwD1 p6/p7, pwD2 |
| D25-5 | STILL | pwD2 p3–p6 (fixed in pwD1) |
| D25-6 | FIXED | pwD1 p1, pwD2 p1 |
| D25-7 | FIXED | pwD1 closing |
| D25-8 | STILL | arD1, oD1u |
| D25-9 | FIXED | pwD1/pwD2 mind card (blemish D26-13) |
| D25-10 | FIXED | pwD1 p8/p9 |
| D25-11 | STILL | pwD2 🧭 of second problem (fixed in pwD1) |
| D25-12 (S1) | FIXED | pwD2 p1/p6, arD1 p6, dp2 p1 |
| D25-13 | FIXED | pwD2 p6 |
| D25-14 | FIXED | pwD2 p1–p3 |
| D25-15 | STILL | pwD2 p7/p8 |
| D25-16 | STILL | pwD2 🧭, aD2 |
| D25-17 | not tested | — |
| D25-18 | FIXED | s38 p12 |
| D25-19 | CHANGED ⇒ S3 | s36 p7 (stale list imprecise, no wrong proposal) |
| D25-20 | FIXED | aD4 route |
| D25-21 (S1) | FIXED | oD1u, oD1x |
| D25-22 | FIXED | aD1 📜 «[نامِ مدرسه]» |
| D25-23 | CHANGED ⇒ D26-40 | aD3 p4, s35, aD4 (that line gone; other page text still «تو» for a «شما» user) |
| D25-24 | CHANGED ⇒ S3 | s31 p15, dp1 p8, s30 p10, s38 p18 (only after practice/test reports) |
| D25-25 | STILL | aD4 strip «مقصد: چطور شروع کنم؟» |
Earlier rounds: D23-10 FIXED for some shapes (s30 p5, s34 p4/p12, s37 p7), STILL (oD1 p8, s35 p10, s36 p7); D23-11 STILL (s30); D23-12 STILL (s38 p10); D23-30 CHANGED; D23-35 FIXED; D23-38 FIXED (dp3); D24-2/-4/-7/-11/-13 stay FIXED; D24-15 STILL for a child (aD1 p2).

## 3. Territory arms
| arm | what | verdict |
|---|---|---|
| oD1 | positive: domain built ⇒ arrives ⇒ resume ⇒ solved | PASS for the loop (scenario PARTIAL for other reasons) |
| oD1n | unrelated answer (Fermi) | PASS — refused, sheet reopened; D26-19 |
| oD1r | answer naming the rejected domain | PASS; D26-19 |
| oD1g | generic words | PASS |
| oD1t | two new domains, best match | PASS |
| oD1u | half-related domain, then «نه، همون نیست» after arrival | PASS — steps back to waiting (D25-21 FIXED) |
| oD1f (new) | overlap only in sheet-frame / view-name words | PASS — asked, never «رسید» (C2 half tested) |
| oD1e (new) | two candidates in a tie | defect D26-20 — declared one, did not ask |
| oD1x (new) | «نه» then «اشتباه کردم، همون بود» | PASS — restored with history; D26-21, -22 |
| oD1b | «found another way» (sys_done) | PASS |
| late piece after closure (oD1 p23) | — | PASS — own new problem «ساخته از…», closed one untouched |
No duplicate waiting rows seen. New S3: a «waiting for sheet» point attached to an unrelated closed problem (D26-54, aD4).

## 4. Prior-work verdicts
pwD1: per-step verdicts with reasons ✓; turn question = resume point ✓; mixed reply ✓ in p2⇒p3 but ✗ in «X رو قبول کردم و Y رو نه» (D26-9); own numeric fix lands and resume point moves ✓; 2nd/3rd report merges ✓; re-check visible and asked once (C6) ✓; dispute by meaning ✗ (D26-11); «نه، بس نیست!» not a dispute ✓; taking back a «نه» not testable there; correction result has two voices (D26-8).
pwD2: verdicts ✓; ledger merges ✓; coach-only line never in 🧭/📜 ✓; mind card credits correct steps ✓; 🧭 main line from prior steps ✓; own non-numeric repair does not land ✗ (D26-3); second problem's records land in the first (D26-6); reached the exact sticking point.
arD1: opening with ONE worked step fires ✓ (C7); mid-session calculation does not fire ✓; rejecting a «✓» verdict / «گامِ اول» not read ✗ (D26-11).
aD3 (extra): unseen table ⇒ «unchecked» ✓; her own retraction 67 ⇒ 61.5 reached ledger and statement ✓.

## 5. Arithmetic (all values verified by me exactly)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| 2×6×30 = 12×30 = 360 (chain) | 360 | checked: correct | ok |
| «۲ × ۶ × ۳۰ باید ۳۰۰ بشه» (wrong, no «=») | 360 | silent | weak |
| 360 ÷ 500 = 0.72; 500 − 360 = 140 (Unicode minus); 360 ÷ 140 «۲ و خرده‌ای، یعنی ۲٫۵۷»; 1/2+1/3+1/6 = 1; 360 ÷ 4.3 ≈ 83.7 | all right | ✓ | ok |
| «با ۴۰ میشه ۲۴۵ هزار تومن» (running sum, correct) | 245 | ✗ «حسابِ صفحه: ۲۴۵» | WRONG — S1 D26-16 |
| 1.5×8×30 = … = 350; 500 − 350 = 160; 360 ÷ 7 = 51.8 (wrong) | 360; 150; 51.43 | ✗ | ok |
| «۲ و خرده‌ای، یعنی ۲٫۷۵» (wrong) | 2.1875 | ✓ | WRONG — D26-18 |
| 1/2+1/3+1/4 = 1 (wrong) | 13/12 | ✓ | WRONG — D26-18 |
| «با ۸۵ میشه ۲۱۵»; «۱۲۹٫۶ مگاژول» (wrong) | 205; 1296 | silent | WRONG — D26-18 |
| date, score 3-2, 10:30, version, 2x+140=500, 17≡2 (mod 5), 2:1 | not arithmetic | silent | ok |
| pwD1: 3000/90 = 33.3; 34×35 = 1190 s ≈ 20 min; 1700 s ≈ 28 min; 15 further sums | right | ✓ | ok |
| pwD1: «۱۷۰۰ ثانیه یعنی ۱۷ دقیقه» | 28.33 | ✗ (coach only) | ok |
| pwD2: 4/2 = 1/1+1/2+1/2; 3/7 − 1/3 = 2/21; 1/4+1/20 = 6/20 = 3/10; 7/1460 = 1/210+1/30660 | right | ✓ | ok (D25-12 fixed) |
| aD3: 0.9163/0.01489 = 61.5; 0.015×600×5.97/4.97 = 10.8; 12/13 = 0.92; 15/19.14 = 0.784 | right | ✓ | ok |
| aD3 p7: 1.015/1.022 − 1 ≈ −0.69٪ | −0.685٪ | ✗ «حسابِ صفحه: -۱/۱۴۶» | WRONG — D26-52 |
| oD1 p9 «۰٫۲۵ تقسیم بر ۰٫۰۵ میشه ۵ برابر»; s36 p3 «۴ از ۲۶ میشه ۱۵٪»; s32 p4 «از ۵۲۰ رفت ۶۵۰، یعنی ۲۵٪»; aD1 p5 «۱۶ و ۱۲ میشه ۲۸»; aD3 p9 0.92^5 ≈ 0.67 | all right | no block | unchecked — D26-24 |
| aD4 p3 «سه تا ۸۰ با دو تا برش میشه ۲۴۰ و ۶ دهم»; p5 «می‌مونه حدود ۷۹ و ۷ دهم» | 240.6; 79.4 (slip) | no block | unchecked, slip missed — D26-24 |

## 6. Chat ⇄ page verdicts
- Closing in chat (chat_solved with lesson/check/bestQ/taste) lands in 🔭 without re-asking frame fields: ✓ (aD3 p8, aD4 p6, pwD1).
- Chat retraction reaches ledger and statement: ✓ (aD3 p4); but ✏️ of a message leaves the chat-recorded result stale: ✗ D26-38 (s34 p9, s38 📜).
- Page tells her «گامِ ۲ کهنه شد» while telling the model `changed:[]`: ✗ D26-8.
- «باشه» to an offered deadline lands in «امروز» ✓ but no chat line (D26-37); typed answer to the Friday question unacknowledged (D26-51).
- 📜 writes «حکمِ وارسی: شاید — سنجیده نشد» for her real two-way check (D26-28).
- Sheets: chat says «برای ثبت بررسی می‌کنم» ⇒ page «🛎 برگهٔ فوری #… ثبت شد» ✓ (arD1, oD1x, aD4).

## 7. Owner bank 32–41
| # | verdict | where |
|---|---|---|
| 32 | هست | — |
| 33 | هست | oD1x |
| 34 | نیمه | D26-9 (pwD1) |
| 35 | هست | 📜 |
| 36 | نیست ⇒ sheet #101 | arD1 |
| 37 | هست | mind «از کجا؟», oD1 p9 |
| 38 | نیمه | — |
| 39 | نیست ⇒ sheet #102 | oD1x |
| 40 | نیمه | D26-8 (pwD1) |
| 41 | هست | oD1 p23 |
Details and screenshots per scenario in the findings of arD1, oD1, oD1x, pwD1.

## 8. PARTS.md «نسبت به دورِ ۲۵»
- Closed: both round-25 S1 (D25-12, D25-21) and D25-1, -2, -3, -4, -6, -7, -9, -10, -13, -14, -18, -20, -22.
- Remaining: D25-5, -8, -11, -15, -16, -25 STILL; D25-19, -23, -24 CHANGED to S3; D25-17 not tested.
- By part: arithmetic better (one new S1 in a different shape); territory loop better (S3 only); prior work better (four new S2 in reading her reply); form⇄chat better; route/strip same; ✏️ mixed; deadlines better; prediction ledger worse on one path (D26-14); age/register better (two false positives of the register guard: D26-33 «ندید», D26-53 «سانت می‌شود»); prerequisites, routing same (good).

## 9. New owner-like questions
- «نوشته حسابِ صفحه -۱/۱۴۶؛ این یعنی من غلط نوشتم یا نه؟» (aD3)
- «نوشتم ۷۹ و ۷ دهم؛ چرا صفحه خودش نگفت اشتباهه؟» · «نوه‌ام که اومد، چطور بگم این منم یا اون؟» (aD4)
- «چرا می‌خواد ۱۵ آبان رو یادآوری کنه؟ گفتم که اون غلطه.» (s35)
- «چرا می‌خواد تو گامِ ۲ ۴ رو ۵ کنه؟ اون ۴ که درست بود.» (s37)
- «گذاشتی‌ش یا نه؟ چیزی ننوشت.» (s33) · «نوشتم جمعهٔ بعد؛ بالاخره ثبت شد یا نه؟» (dp3)
- «اگه دکمهٔ صفحه و حرفِ تو با هم نخوند، کدوم راست میگه؟» · «وقتی پیش‌بینیم غلط درمیاد، کجا می‌بینم چند بار خوش‌بین بوده‌ام؟» (pwD1)
- «برگه‌ای که گامی رو منتظر نذاشته، وقتی جواب گرفت خبرم می‌کنی؟» (oD1)

## 10. Not done / caveats
- D25-17 (session pin without direction isolation) not tested.
- C2 only half tested (oD1f); C5 from chat not testable for a rejected «✓» verdict (D26-11).
- aD4: after her 2nd message the page set the guess to «confirmed / her-test» from her paper sum, then «refuted» next turn; recorded as a note, not a defect.
- Token/time use: not visible to me.