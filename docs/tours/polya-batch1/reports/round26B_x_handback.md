ROUND 26 · GROUP B · CONTROL RUN — final report (output: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B_x/)

I ran all 27 scenarios of group B and each folder has its DONE file: s11–s20, bp1–bp3, aB1–aB4 (with aB2f and aB3x), tB1/tB1x/tB1y/tB1z, oB1, pwB1, pwB2, and a side arm I added, pwB1o (one-step vs bare opening, C7). Each folder holds findings.md, routing.md, ai/ (pN.json + rN.txt), akey/, out/, post.txt, mail.html and mail.subject.txt. No e-mails were sent; mail.html and mail.subject.txt are written for every scenario. The round-level files are defects.md, PARTS.md and dlog.md (the running defect log). Failed model turns are in better/rN.txt labelled «# author: runner-simulated». All browser profiles are deleted. The repo was not edited and round26B/ was never read. I used ports 9500–9549 and profile_x, and killed only recorded PIDs. One PID in pids.txt (1056, aB2 driver) now shows a different/empty process, so I left it alone. I did not add the storyboard link to T/STORYBOARD_LINKS.md; each mail links storyboard B (https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja).

Territory tests used scratch copies of the dist with extra areas injected (scratchpage/page_*.html). The first tie page was not a real tie: the sheet title named one candidate. I rebuilt it as page_tie3, with two equal-scoring areas.

## 1. Results per scenario (defects with evidence)
- s11: FAIL, 3 S3.
  - B26x·D1 (c54): after «بله، این‌جا هم» the data field keeps «صفحهٔ ۸×۸ (۱۰۰ خانه)».
  - B25·D16 STILL (c49): the ask list repeats items.
  - B25·D26 CHANGED (p2): her prior batch is not merged and never reaches the live 🔭/📜.
  - ارتقا: carry the stale recomputation into the copied field; the ledger should follow the chat problem.
- s12: FAIL, 1 S3. B26x·D2: Today's static strings say «تو» to an elder addressed as «شما». ارتقا: route static strings through the register store.
- s13: PASS. s14: PASS. s15: PASS. s16: PASS.
- s17: FAIL, 1 S2 + 3 S3.
  - B26x·D5 S2 (c36/p8): her factor 0.7 is marked as a stale result.
  - B25·D27 STILL: the field keeps «… × ۰٫۸ = ۱۹ متر».
  - B26x·D6 (p8): she wrote «با ۲ مترمکعب میشه ۲۴٫۶»; exact is 23.6; the page did not read it.
  - B26x·D7: a date the model reported was booked without «درست است؟».
  - ارتقا: only the result chain is derived (a factor is data); re-evaluate the copied expression; read running sums that have a unit word.
- s18: FAIL, 1 S3. B26x·D8 (p10): «−54/(144π) ≈ −0.37» passed (exact −0.119); π is never evaluated. ارتقا: evaluate named constants.
- s19: FAIL, 1 S2 + 4 S3.
  - B25·D10 CHANGED S2 (c81): her measured «۳٫۵» is proposed as «≈ ۳٫۴۴۴».
  - B26x·D9: the C1 same-weekday question was not asked, for «شنبه» or for «تا جمعه» said on a Friday.
  - B26x·D10: «شنبه» was read as سه‌شنبه.
  - B26x·D7: model dates booked without asking.
  - B26x·D11: two calibration counts inside the mind card disagree.
  - ارتقا: one date path for every date (ask + C1); one judged set for calibration.
- s20: FAIL, 1 S3. B26x·D4: «۸ ماهه» was read as a future date. ارتقا: require a real date expression.
- bp1: FAIL, 1 S3. B24·D15 STILL (p11): her own «با ضرب پرانتز هم چک کردم» is ignored and the page asks «ثابتش کن».
- bp2: FAIL, 2 S3. B25·D28 STILL: the route strip keeps a learned prerequisite open. B26x·D7 also appears.
- bp3: PASS.
- aB1: FAIL, 1 S3. B25·D9 (p4): a sub-result moves the problem to look-back.
- aB2: PASS. aB2f: PASS.
- aB3: FAIL, 1 S2 + 4 S3.
  - B25·D9 S2 (p6): look-back before any plan.
  - B26x·D20 (p14): post-check flags «شما/تو» on an all-«شما» reply.
  - B26x·D21: one commitment booked as two deadlines.
  - B26x·D22: «۷۰ درصد مطمئنم» never becomes a 🎯.
  - B26x·D14: the salary correction does not mark the chat results stale.
- aB3x: FAIL, 1 S3. B25·D17 STILL: the wrong Gregorian conversion stays in the reply text.
- aB4: FAIL, 5 S3.
  - B26x·D23: «باشه» is not read as yes.
  - B26x·D24: her self-introduction becomes the problem title.
  - B26x·D2 also appears.
  - B24·D15 family (p9).
  - B25·D21 family (p2–p5): the same page question is repeated.
- pwB1: FAIL, 2 S2 + 6 S3.
  - B26x·D14 S2 (c21/p13): the «۱۸ متره نه ۱۵» correction does not reach the ledger or the chat results.
  - B25·D9 S2 (p9).
  - B26x·D12: a fixed step keeps the old dispute reason.
  - B26x·D13: a dispute by meaning is stored as a failed self-fix.
  - B26x·D15: an arithmetic slip is labelled a unit error.
  - B26x·D16: the mind card credits a result the page marked ✗.
  - B26x·D17: the correction line shows identical before/after text.
  - B25·D24: an inference is imported as data.
- pwB1o: PASS. The C7 one-step opening fires; the bare opening does not.
- pwB2: FAIL, 1 S1 + 1 S2 + 3 S3.
  - B26x·D19 S1 (p9): correct «۳۵ × ۱٫۴ = ۴۹ میلیون» and «۲۵ − ۱۸ = ۷ میلیون» are marked ✗.
  - B25·D3 STILL S2 page-side (p2): his dispute gets A073.
  - B26x·D18: his own correct fix of step 4 is not applied.
  - B26x·D16, B25·D24 also appear.
  - ارتقا: read «number + میلیون/هزار» as scaled or «نسنجیده», never ✗; re-run the check when he contests a ✗.
- tB1: FAIL, 3 S3.
  - B26x·D25 (s28): after the take-back the sheet stays «open».
  - B26x·D26 (s23): «سنجیدم که … جواب می‌دهد» rests on word overlap only.
  - B25·D9 mild (p7).
- tB1x: FAIL, 1 S2 + 1 S3. B25·D9 S2 (p7): stage «بازنگری» and «حل به نتیجه رسید» after sub-results. B25·D23 family: destination «از کجا شروع کنم؟».
- tB1y: FAIL, 3 S3.
  - B26x·D27 (p10–p11): answering a tie by naming the second tool triggers a new ask.
  - B26x·D28: the Today tie line names only one candidate.
  - B26x·D29: 📜 keeps only the last ask.
- tB1z: FAIL, 2 S3. B26x·D30 (s31): a piece waiting after closure (#102) has no Today line. B26x·D31 (p13–p15): stale session steps.
- oB1: FAIL, 2 S2 + 7 S3.
  - B26x·D35 S2 (p4): the «دو روز ⇒ سه روز» correction is accepted (ok:true), but the page says «چیزی ثبت نشده بود» and the statement keeps «دو روز».
  - B26x·D33 S2, which is B25·D12 CHANGED: problem 1's plan and «انجام شد» appear in the dinner and exercise 📜; result «۴ از ۷» sits on dinner's 🧭; the dinner guess (p23, return by naming) is filed under exercise.
  - B26x·D32 (p6–p10): the page re-asks a prediction he already gave.
  - B26x·D34 (p10): «درست درومد» does not judge the 🎯.
  - B25·D22 STILL (p14): his lesson is read as a guess.
  - B25·D23 CHANGED: the guesses vanish from the solved problem's 📜.
  - Families of B26x·D20 (p13, plural «داشته باشید»), D21 and D30.
  - ارتقا: retract must match every record built from the corrected span; bind events to the problem named in the message; judge a 🎯 from his own words.

Totals: 7 PASS (s13–s16, bp3, aB2, aB2f) plus pwB1o PASS, 19 FAIL. One S1 (B26x·D19). S2: B26x·D5, D14, D33, D35, B25·D3 (pwB2), D9 (pwB1, aB3, tB1x) and D10.

## 2. Round-25 defect table (B25·D1–D28)
- FIXED: D1 (tB1, tB1y), D2, D4, D5, D6, D7, D8, D11, D13, D14, D15, D18 (tB1, tB1y), D19 (tB1, tB1x, tB1z), D20, D25 (pwB1; family in aB4 = B26x·D24).
- D21: FIXED in s18, bp2, s19; family remains in aB4 and oB1 (B26x·D32).
- D3: FIXED in pwB1; STILL page-side in pwB2 p2.
- D16: STILL in s11 c49; FIXED in s12.
- STILL: D9 (pwB1 p9, aB1 p4, aB3 p6, tB1x p7, tB1 p7 mild; fixed in bp2), D17 (aB3x p2), D22 (oB1 p14), D24 (pwB1, pwB2), D27 (s17), D28 (bp2).
- CHANGED:
  - D10 (s19 c81: her goal is untouched, but her measured value gets a fake recompute).
  - D12 (oB1: events now leak into two new problems).
  - D23 (oB1: guesses vanish; tB1x: meta destination).
  - D26 (s11).
- B24·D15: STILL (bp1 p11, aB4 p9).

## 3. Territory arms (P3)
| arm | evidence | result |
|---|---|---|
| reply names `mind` (unrelated) | tB1 s14 «⚠️ … جواب هیچ نما یا حوزه‌ای را … نام نبرد» | PASS |
| ruled-out area with need words | tB1 s15 «… که خودِ برگه از اول کنار گذاشته بود» | PASS, distinct reason |
| generic «تمرینِ تازه … تمام است» | tB1 s16 | PASS |
| frame-word-only overlap («ایده») | tB1 s17 asks «پیش از ادامه از تو می‌پرسم» | PASS (round 25 said «رسید») |
| single shared word «پیشینه» | tB1y s14 asks, no reopen | PASS |
| her «نه» to the ask | tB1 p9, tB1y p9: waiting again, sheet note, Today «⏸ … همان نبود» | PASS |
| best-fit arrival | tB1 s23, tB1z s14 (best of three) | PASS |
| «نه، همون نیست» after arrival | tB1 p10: «رسید» withdrawn, sheet reopened, Today back | PASS |
| C5 take-back of the «نه» | tB1 p11: restored, 📜 «↩ «نه» پس گرفته شد» | PASS; sheet left open (D25) |
| genuine tie | tB1y s17: asks, naming both | PASS; answer by name needs a second yes (D27); Today shows one name (D28) |
| sys_done | tB1x p8 | PASS |
| piece after closure | tB1z: battery → existing Fermi tool, no sheet; licensing → own entry sw2 + sheet #102 | PASS; not in Today (D30) |
| duplicate waiting rows | tB1, tB1z | none, PASS |

## 4. Prior-work verdicts (P1)
- pwB1, by step (opening → final):
  - Step 1 ✓ → ✓.
  - Step 2 ✗ unit → ✓ after her 0.082 fix; the dispute re-check kept ✗ correctly.
  - Step 3 ✗ (depends on 2) → ✓ in the mixed reply.
  - Step 4 ✓ → ✓, not made dependent.
  - Step 5 ✗ (depends on 3) → ✓ (36 W); her dispute by meaning was mis-stored, then taken back.
  - After «۱۸ متر» the ledger still says «همه درست» (D14).
- pwB2, by step (opening → final):
  - Criteria ⚠️ → ✓; his dispute got A073 (S2).
  - Weights ✗ → ✓ after the fix.
  - Scores ✓ → credited.
  - Sums ✗ (depend on weights) → ✓, but his first fix was ignored (D18).
  - Decision: conditional.
- pwB1o: one worked step fires the prior block; a bare statement does not.
- Chat ⇄ page:
  - pwB2 p9: the page's ✗ on correct «۴۹ میلیون / ۷ میلیون» contradicted the chat; better/r9.txt holds a reply that does not follow the page's ✗.
  - pwB1: chat and page agreed except the «unit» label on a division slip (D15).
  - Elsewhere the model never stated a verdict the page contradicted.

## 5. Arithmetic (what she wrote · exact · page · verdict)
- Correct, page right:
  - s11: 98, 49 ✓.
  - s14: −28/4 = −7 ✓.
  - s17: 180 × 0.12 = 21.6 ✓.
  - aB2: 50² = 2500 ✓.
  - aB4: 23 + 12 = 35, 23×2 = 46, 94 − 70 = 24 ✓.
  - pwB1: 294300 ÷ 50 = 5886 ✓; 0.082 (C9) ✓; 0.29 ÷ 0.5 = 0.59 ✓ (C13).
  - pwB2: chained 8.7 ✓; 49 ÷ 18 ≈ 2.72 ✓; 49 − 35 = 14 ✓.
  - oB1: Brier 0.16 ✓.
- Correct, page wrong — S1 FAIL:
  - pwB2 «۳۵ × ۱٫۴ = ۴۹ میلیون»: exact 49, page ✗.
  - pwB2 «۲۵ − ۱۸ = ۷ میلیون» (Unicode minus): exact 7, page ✗.
- Wrong, page right:
  - s17 21.6 × 0.7 = 16.12: exact 15.12, page ✗, no leak.
  - pwB2 21 × 12 = 242: exact 252, page ✗.
  - bp2 «1.5 m»: exact 0.15, page ✗ unit.
  - pwB1 0.29 kWh: exact 0.0818, page ✗ unit.
  - pwB1 7257: exact 7357.5, page ✗ but labelled a unit error (D15).
- Wrong, page silent — FAIL:
  - s17 «… میشه ۲۴٫۶»: exact 23.6 (D6).
  - s18 −54/(144π) ≈ −0.37: exact −0.119 (D8).
- Silent but correct (PASS): fraction products (tB1 1/400, 0.15), π case −0.0995, words («ضربدر»), running sum 21 (pwB2), 1 = ½ + ⅓ + ⅙.
- Look-alikes ignored (PASS): dates, scores 18/20, n² ≡ 1 (mod 8), equations with an unknown.
- Rounding: s14 P = 0.16 (exact 0.1587) not flagged; s19 3.5 → «≈ ۳٫۴۴۴» FAIL (P4).

## 6. Owner bank 11–20 (oB1)
| # | verdict |
|---|---|
| 11 offline / local model | offline yes; a local-model plan is unknown to the page → partial |
| 12 invention to plan | partial: tools and gaps named; tB1/tB1z showed the full loop |
| 13 companion book | «نیست»; the page refused a 0.7-confidence sheet and said so |
| 14 before/after pictures | partial (mind-card trends only) |
| 15 e-mail reports | only during a tour |
| 16 two problems kept apart | FAIL (S2, D33) |
| 17 sheet answer date | exists, no date; honest «قولِ روز نمی‌دهم» |
| 18 over-confidence | exists: «بیش‌اطمینانی … ۷۵٪ … ۱ بار از ۲» |
| 19 one list of all records | partial («📚 همهٔ کارها» + 🎯 + sheets + 🧪 separately) |
| 20 wearable data | «نیست» |

Questions 33, 38, 39 and 41 were also exercised in tB1/tB1z:
- #33 (waiting again after a tool did not help): exists.
- #38 (taking back a «نه»): exists.
- #39 (new tool tested on my data): missing (D26).
- #41 (piece after closure): own entry yes, Today no (D30).

## 7. Routing
lla_coach / learning_architecture (second opinion) / lla_assistant (follow-ups) were all correct, about 330 of 330 in total. Per-scenario counts are in each routing.md; for example tB1 11/11, tB1z 16/16, oB1 31/31.

## 8. PARTS.md «نسبت به دورِ ۲۵»
| part | change since round 25 |
|---|---|
| territory loop | much better: the S1 is gone, only S3 polish left |
| prior work | better (D2, D4–D8, D11, D15 fixed) |
| arithmetic | better on shapes, but a new S1 on unit words |
| corrections / stale numbers | same: one over-reach fixed, two new S2 (D5, D35) |
| live problem ⇄ chat | worse in form: multi-problem leakage now reaches two problems; D9 still present |
| route map | better (duplicates fixed) |
| Today / dates | same: the page's C12 path works, but the model's path bypasses it |
| 🎯 | better (auto-booked from chat) |
| assistant / post-check | same |
| birth card, prerequisites | same |
| 📜 | better for the loop, worse for multi-problem |
| mind card | better (credits prior steps) |
| self-knowledge | same and honest |

## 9. New owner-like questions
- «وقتی ابزاری رسید، کِی و چطور روی کارِ خودم آزموده می‌شود، نه فقط با واژه‌ها؟» (D26)
- «اگر بین دو ابزارِ هم‌وزن یکی را نام بردم، چرا دوباره می‌پرسی؟» (D27)
- «تکه‌ای که بعد از بستنِ مسئله منتظرِ برگه است، در «امروز» کجاست؟» (D30)
- «وقتی گفتم «برگردیم سرِ مسئلهٔ شام»، حدسم چرا در پروندهٔ ورزش نشست؟» (D33)
- «اصلاحِ یک عدد در صورتِ مسئله را پذیرفتی؛ چرا صورت همان ماند؟» (D35)
- «پیش‌بینی‌ام را گفتم و نتیجه‌اش را هم گفتم؛ چرا دفترِ پیش‌بینی خودش داوری نکرد؟» (D34)

## 10. Token and time use
Not visible to me. The run spanned several long sessions, including a context compaction mid-tB1.