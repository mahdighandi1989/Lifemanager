Runner B, round 25 is done. All work is in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B/. I did not edit the repo.

## What was run and sent
- **Scenarios (26 runs, every one ended with {"exit":true}):**
  - Round-24 re-runs: s11–s20, bp1–bp3, aB1–aB4, tB1, tB1x, oB1.
  - New prior-work runs: pwB1 (engineering calculation with a unit slip in step 2) and pwB2 (life decision with a missing criterion).
  - Extra territory arms: tB1y (unclear area, page should ask) and tB1z (three new areas arrive at once).
  - Side arms: aB2f and aB3x. Their verdicts are reported in their parent scenarios.
- **Per-scenario files:** each has findings.md, DONE, routing.md, mail.html and mail.subject.txt.
- **Shared files in round25B/:** defects.md (B25·D1–D28 plus the round-24 table), PARTS.md, notes.md.
- **Better replies:** better/ in pwB1, pwB2 and tB1.
- **Scratch pages for the territory arms:** scratchpage/page_amb.html, page_ask.html, page_pos.html.
- **E-mails:** all 24 «🧭 پولیا · دورِ ۲۵ · …» mails were sent to the owner (list in round25B/sent.txt). The main session has none left to send. Storyboard: https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja
- **STORYBOARD_LINKS.md:** I added the round-25 B line.
- **Cleanup:** I deleted only my own round25B/*/profile folders and kept the ai/ folders.

## RESULT per scenario
| sid | RESULT | main defects (turn ids p<N>) |
|---|---|---|
| s11 | FAIL 2 S3 | D26: prior work from p2 is lost from the prompt from p3 on; «صورتِ مسئله» appears twice |
| s12 | FAIL 1 S3 | D16: p10 «عالی. وارسی؟» is rewritten for the elder register when it should not be |
| s13 | FAIL 1 S3 | p7 page turn question asks two questions |
| s14 | PASS | — |
| s15 | FAIL 2 S3 | D13: p2 a classroom anecdote triggers the prior-work block; the anecdote is booked twice as «اجرا −» on the mind card |
| s16 | PASS | — |
| s17 | FAIL 1 S3 | D27: after the p8 fix, the field still holds the old «= ۱۹ متر» |
| s18 | FAIL 2 S3 | D21: the same page question repeats at p13–p15; p16 contradicts it |
| s19 | FAIL 1 S2 + 2 S3 | D10: c81 marks her goal of 8 kg as stale and sets aside her weigh-in result |
| s20 | FAIL 1 S3 | D4: the ledger stays «ازسرگیری از گامِ ۱» after her test at p4–p5 |
| bp1 | FAIL 2 S3 | D13 over-triggers at p6–p8; p11 asks her to prove a check she already did |
| bp2 | FAIL 2 S2 + 3 S3 | D9: p5/p7 move to look-back after a sub-result; D14: the mm-to-m slip passes; D21 at p8–p12; D28 |
| bp3 | FAIL 1 S3 | D13 at p5–p11 |
| aB1 | PASS | — |
| aB2 | FAIL 1 S3 | final route map repeats steps (B24·D18 STILL) |
| aB3 | FAIL 5 S3 | D20: prompt stage «فهم» vs live stage «اجرا» at p11–p14; two questions at p13; D24; 📜 shows corrections in two arrow forms; aB3x side arm: D17 (model's wrong date left in the text) |
| aB4 | FAIL 2 S3 | marking it solved from chat brings only the problem statement to the form; route map duplicates |
| tB1 | FAIL 1 S1 + 2 S3 | D1 (see territory arms); D18; D19 |
| tB1x | PASS | — |
| tB1y | FAIL 1 S3 | the page asks her and at the same moment writes a mismatch line and reopens the sheet (D18) |
| tB1z | FAIL 2 S3 | duplicate waiting rows (D19); no place to record dated prior-art findings |
| oB1 | FAIL 1 S2 + 3 S3 | D12: a second problem at p22 becomes data of the first; D22: p14 lesson read as a guess; D23; D13 at p20 |
| pwB1 | FAIL 8 S2 + 4 S3 | D2, D3, D4, D6, D7, D8, D9, D11; D13–D15, D20, D25 |
| pwB2 | FAIL 5 S2 + 2 S3 | D2, D3 (the dispute is not recorded), D4, D5, D11; D15, D24 |

In every scenario the person reached either a verified solution or the exact sticking point. Every failure is a page defect.

## «ارتقای لازم» (most urgent first)
1. **S1, loop matching in a44 (B25·D1).**
   - Words that come from the sheet's own framing must count as generic: the view name «💡 جایگاهِ ایده» and the sheet-title words «ایده»/«جایگاه».
   - A match that rests only on such words must lead to asking her, not to «رسید».
   - If she says the tool is not what she needed after it was declared arrived, the step must go back to waiting, the sheet must reopen with a note, and the Today line must come back. Today this happens only for an ask still pending.
2. **The R8 prior-work ledger (a45).**
   - Merge each new report into the ledger instead of replacing it (D4).
   - On the opening turn, the prior-work turn question must win over the guess detector in a27 (D2).
   - A verdict dispute needs a re-check with evidence, not A073, and a dispute without a leading «نه» must be recorded (D3).
   - Dependencies need more than a matching number (D7).
   - The coach-facing check line, with its «عددِ درست را لو نده», must never appear in the 🧭 tip or 📜 (D6).
   - RECALL22 must not drop the turn's story (D8).
   - The mind card must credit correct prior steps (D11).
   - The WORK24 detector over-triggers and needs tightening (D13).
3. **arithChk.** Chained «a = b = c» must be read correctly (D5). It also needs a unit/factor check (kJ→kWh, mm→m), and should not show «درست» next to a ✗ step (D14).
4. **Stage and problem handling.**
   - A sub-result must not move the problem to look-back (D9).
   - Stale marking must stay off her goals and measured results (D10).
   - A new problem raised in chat must stay separate from the old one (D12).
   - «# وضعِ کنونی» must agree with the live stage (D20).

## Round-24 defect table (B24·Dn)
- **FIXED:** D1, D3, D4, D5, D6, D7, D8, D9, D10, D11, D13, D17, D19, D20.
- **CHANGED:**
  - D2: one story now, but the prompt stage still disagrees and marking solved still brings only the statement.
  - D12: fixed in oB1 and aB4; still two questions in s13, s19 and aB3.
  - D14: guess outcomes are recorded (rejected or confirmed) everywhere except the oB1 route map.
  - D15: bp1 still asks her to prove a check she already did.
  - D16: the correction is now shown once in s17 but still twice in s11 and aB3.
  - D18: the system line is fixed; route duplicates remain.
  - D21: the plan is fixed; the progress strip is not.
  - D22: the correction message is no longer imported, but fragments and inferences still are.
- **STILL:** none on its own. Evidence for each is in defects.md.

## Territory arms
| arm | verdict |
|---|---|
| unrelated reply | PASS |
| (a) reply naming an area the differential diagnosis ruled out | PASS (the page says the sheet had ruled it out, then reopens) |
| (b) reply sharing only generic words | PASS |
| unclear match: market area «بررسیِ بازار و رقیبان» (tB1) | **FAIL S1**: declared arrived on «ایده»/«جایگاه», and her «نه» was ignored |
| unclear match: technology-history area (tB1y) | the page asked her and accepted her «نه»; PASS with one S3 |
| best fit of three new areas (tB1z) | PASS: the prior-art area won although the routine named the patent-claims area first |
| she found another way herself, sys_done (tB1x) | PASS |
| system-self sheets #102–#104 (oB1) | PASS: no step was marked as waiting |

## Prior-work verdict tables
**pwB1** (pump calculation):
- Opening verdicts were right: steps 1 and 4 correct, step 2 wrong on units, steps 3 and 5 dependent.
- Defects:
  - The page marked step 4 dependent on step 2 by mistake (D7).
  - The ledger kept only the last report (D4).
  - The page's own number check said «درست» while the step's verdict was ✗.
  - Her own fix of a judged step was refused (D15).
- Outcome: a verified design (120 W pump, 150 W panel). Sticking point: the panel's real noon output.

**pwB2** (job decision):
- Opening verdicts were right: missing criterion flagged as incomplete, the 110% weights flagged ✗, the decision flagged as dependent.
- Defects:
  - The page told him his correct sums were wrong three times (D5).
  - His dispute without «نه» was not recorded.
  - At the end it told him «گامِ ۱ جای درنگ است».
- Outcome: a conditional decision with a sensitivity check. Sticking point: the trial period with his mother.

Full tables are in gen/extra_pwB1.md and gen/extra_pwB2.md.

## Chat ⇄ page verdicts
| scenario | verdict |
|---|---|
| aB3 | improved (no re-ask, live stage right), but the prompt stage disagrees (D20) |
| aB4 | marking solved from chat brings only the statement |
| tB1 | the loop broke her step (S1) |
| pwB1 | recognised in chat, undermined by the page (D4, D6, D8) |
| pwB2 | the page contradicts correct arithmetic (D5) |

## Owner question bank #9–#16 (oB1)
| # | question | answer |
|---|---|---|
| 9 | a missing tool gets a sheet and a notice when built | yes, but matching can still accept an unfit tool |
| 10 | records survive a model change | yes |
| 11 | offline use / own model on the phone | offline yes (chat needs a model); local model no → sheet #102 |
| 12 | build plan for an alarm clock invention | yes, with the gaps named |
| 13 | a book for a 10-year-old and a 70-year-old | no → sheet #103 |
| 14 | before/after picture of progress | yes for his own work; no for the system's parts → sheet #104 |
| 15 | e-mailed session reports | no → sheet #104 |
| 16 | two problems: whose map and dossier | half: the second problem was bound to the first (D12) |

## Routing and PARTS
- **Routing:** 248/248 user turns routed correctly, not counting internal second-opinion calls. The strict prompt scan was clean in all 26 runs.
- **PARTS, compared with round 24:**
  - **New:** «کارِ پیشینِ تو». It recognises the steps correctly but loses them from one turn to the next.
  - **Better:** 🎂 birth card, territory loop (6 of 7 arms; the S1 remains in a new form), 🔭 live problem, 🧭 route map, corrections, prerequisite layer, 📜 dossier, Today, promises.
  - **Same:** mind card, «خودِ سامانه» self-knowledge.
  - Full table in PARTS.md.

## New owner-like questions
- «وقتی دو مسئله را با هم آوردم نقشه خودش دو تا می‌شود؟»
- «برگه‌هایی که برای من ثبت شد کجاست و کی جواب می‌گیرد؟»
- «اگر حکمِ یک گام را قبول نکنم، شاهد را خودِ صفحه حساب می‌کند؟»
- «اگر ابزاری که آمد به کارم نیامد، از کجا بفهمم دوباره منتظر است؟»

## Notes
- **Clash with B_s:** B_s's kill.sh pattern matched my drivers and killed s11, s14 and s15 mid-run. I renamed my driver to drv25b.py and re-ran them. My own early reset/fin calls may have killed B_s drivers once (noted in notes.md). I never read round25B_s/.
- **One date in tB1z is my artifact:** the 📜 entry «ابزارِ لازم آمد» is dated ۳ آبان because I restarted the harness, not because of a page defect.
- **Cost:** roughly 1 to 1.5 hours wall-clock. I cannot see the exact token count.