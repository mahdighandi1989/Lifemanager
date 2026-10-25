Round 25 group C is done: all 20 scenarios ran and ended with exit (s21–s29, pC1–pC3, aC1–aC4, tC1, oC1, pwC1, pwC2). 3 PASS, 11 PARTIAL, 6 FAIL. All 20 e-mails went out; none was refused. Each folder has findings.md, DONE and mail.sent. The repo was not edited, no round25C harness is still running, I deleted only my own browser profiles, and all ai/ folders are kept. Main 64dc0667. Storyboard: https://claude.ai/artifact/5YqS7HGgerCJwWmjomWJ4f (line added to STORYBOARD_LINKS.md).

**Results per scenario (p<N> = turn)**

| Scenario | Result | Defects |
|---|---|---|
| s21 | FAIL | C25-2 (p3); C22-11 |
| s22 | PARTIAL | C22-5 (p9) |
| s23 | FAIL | C25-8 (p15); C25-4 (p15) |
| s24 | PARTIAL | C22-11 |
| s25 | FAIL | C25-1 (p1); C25-3 (p10); C25-4 (p12, p15); C25-5 (p12); C25-6 (p13); C22-5 (p13) |
| s26 | PASS | — |
| s27 | PASS | — |
| s28 | PARTIAL | C22-11 |
| s29 | FAIL | C25-4 (p13) |
| pC1 | PARTIAL | C25-7 (p1); C25-9 (p7) |
| pC2 | PARTIAL | C25-7 (p1); C25-9 (p6) |
| pC3 | PARTIAL | C25-9 (p8) |
| aC1 | PARTIAL | C25-17 (mind card) |
| aC2 | PARTIAL | C25-9 (p4) |
| aC3 | PARTIAL | C25-9 (p5) |
| aC4 | PARTIAL | C25-10 (p4) |
| tC1 | PASS | — |
| oC1 | PARTIAL | C25-15 (p17, minor here) |
| pwC1 | FAIL | C25-11 (p1); C25-12 (p1); C25-14 (p3–p14); C25-15 (p11→p12); C25-9 (p14); C25-16 (route); C25-19 (day 3) |
| pwC2 | FAIL | C25-12 (p1); C25-13 (p2); C25-14 (p4–p15); C25-18 (p7) |

**New defects (19)**

| Id | Sev | Defect | Evidence |
|---|---|---|---|
| C25-1 | S2 | The page's arithmetic check in «کارِ پیشینِ تو» reads «با ۱/۲۰ میشه ۴/۵» (a running sum) as 1/20 = 4/5. It marks a correct step wrong and its dependants. | s25 p1 |
| C25-2 | S2 | After moving the assistant to the problem list, the follow-up says «دکمه‌ای نزن», which forbids the 🔭 tab the person needed. | s21 p3; better/r3 |
| C25-3 | S3 | The wake line uses «تو» to a 61-year-old who is addressed as «شما». | s25 p10 |
| C25-4 | S2 | liveStale marks unrelated numbers stale with nonsense recomputes ("1, 2 (1⇒0)", "11, 12", "⇐ 0"). Numbers that really were derived (10 and 100 → 11 and 121) are left alone. | s25 p12/p15; s23 p15; s29 p13 |
| C25-5 | S3 | A problem woken from the look-back step asks u0 (state the whole problem) although she already stated and tested it. | s25 p12 |
| C25-6 | S3 | «# وضعِ کنونی» and the live problem show different stages. | s25 p13; pwC1 p7 |
| C25-7 | S3 | No prior-work block on an opening that contains her own computed step. | pC2 p1; pC1 p1 |
| C25-8 | S2 | ✏️ on sugar and butter sets aside a guess and a sufficiency verdict that never used those numbers. | s23 p15 |
| C25-9 | S2 | The prior-work block fires on almost every mid-session message with a calculation. A later report replaces the opening ledger, and the step waiting for a sheet drops out of it. | pwC1 p14, plus 7 other scenarios |
| C25-10 | S3 | The stage jumps to «اجرا» after her first guess is tested, before any plan. | aC4 p4 |
| C25-11 | S3 | The self-introduction («کیوانم، ۳۸ سالمه، مهندسم…») is not stripped from the problem statement. | pwC1 p1 |
| C25-12 | S2 | On a prior-work opening, the turn question is A191 (whole-problem first), which conflicts with the block's "resume at the first non-✓ step". | pwC1 p1; pwC2 p1 |
| C25-13 | S3 | A natural dispute of a verdict is not read as a rejection; only messages starting with «نه» count. | pwC2 p2 |
| C25-14 | S2 | The ledger never records a step she fixed herself, so the resume point stays stuck. | pwC1 p3–p14; pwC2 p4–p15 |
| C25-15 | S2 | Correcting a number that earlier steps used changes only the chat statement. The prior ledger and the chain of chat results are neither marked stale nor asked about. | pwC1 p11→p12; oC1 p17 (S3) |
| C25-16 | S3 | 🧭 shows «طرح هنوز نیست» although the opening listed four numbered steps. | pwC1 route |
| C25-17 | S3 | The 9-year-old's mind card says «معمای امروز را جواب داده‌ای», but no puzzle was offered. | aC1 |
| C25-18 | S3 | The mind card does not clearly credit the correct prior steps. | pwC2 p7 |
| C25-19 | S3 | A generic routine reply produces the lag line «⏳ … هنوز دیده نمی‌شود». | pwC1 day 3 |

**ارتقای لازم**
1. Read prior work once: only the opening (or a message she calls her prior work) gets the block, and later reports update the ledger instead of replacing it.
2. The ledger should take her own fixes from the model's validated step or result and move the resume point forward. Disputes should be read by meaning, not by a leading «نه».
3. The turn question on a prior-work opening should be priorTurnQ (first non-✓ step), not A191.
4. The arithmetic check in prior work should understand running sums.
5. liveStale should mark only numbers actually computed from the changed number, and should also cover chat results and the prior ledger.
6. Smaller fixes:
   - the follow-up after navigation must not forbid the needed tab;
   - the wake line should use the person's register;
   - a woken problem should not ask u0;
   - the stage should come from one source;
   - the intro should be stripped for long self-descriptions;
   - 🧭 should build its main line from prior steps;
   - the child's daily-puzzle state on the mind card should be fixed.

**Round-24 defect table**
- **FIXED:** C24-1 through C24-7, C24-9, C24-10, C24-11, C24-13 through C24-18, C23-5, and the age S3 items (one Jalali confirmation, «تولدتان»).
- **FIXED, not re-seen:** C22-2.
- **CHANGED:**
  - C24-8 is fixed except the woken-problem u0 (C25-5).
  - C24-12 no longer corrupts the guess, but C25-8 and C25-4 appeared in its place.
  - C22-5 is fixed in s23 and s29, still present in s22 p9 and s25 p13.
- **STILL:** C22-11 (a guess she refuted in chat still shows «هنوز آزموده نشده» in s21, s24, s28).
- **Not re-judged:** C23-13 (I did not review that shot).

**Territory loop: all five arms PASS**

| Arm | Where | What the page did |
|---|---|---|
| Positive, two areas | tC1 #102 | dc_customer_validation won as best fit; «ابزارِ لازم آمد», step resumed |
| Reply does not answer the step | tC1 | Asked «همان است؟»; no resume |
| sys_done | tC1 #101 | «از راهِ دیگری برداشته شد ✓» |
| (a) area the diagnosis ruled out | tC1, sc_persuasion | «جواب نداد — دوباره باز شد», with a note under the sheet |
| (b) generic words only | pwC1 #101 | No resume; only the C25-19 lag line |

System-self sheets never marked a step waiting (pwC1, oC1, pwC2). The positive arm used a scratch build, `round25C/tC1_build`.

**Prior-work verdicts**

| Criterion | pwC1 (deep) | pwC2 (multi-facet) |
|---|---|---|
| Each step judged with a reason | PASS (dependants marked) | PASS |
| Correct steps never re-asked | PASS | PASS |
| Nothing rewritten without her yes | PASS | PASS |
| Resume point | FAIL (C25-12, C25-14) | FAIL (C25-12, C25-14) |
| Correction reaches prior steps | FAIL (C25-15) | — |
| Outcome | Exact sticking point reached (step 4 waits for a sheet) | Verified 9.2%, other facets routed |
| Dispute handling | n/a | The model re-checked without caving; the page missed the dispute (C25-13) |

**Chat⇄page:** PASS for the stage and plan steps taken from chat (s28, tC1, oC1) and for the «از گفت‌وگو» drafts with the prior ledger in the forms. Problems: 🧭 does not use prior steps (C25-16), the woken problem asks u0 (C25-5), the stage sources disagree (C25-6), and aC4's stage is early (C25-10).

**Owner bank 17–24**

| # | Verdict | Evidence |
|---|---|---|
| 17 | هست, honest that there is no date | pwC1 p7 |
| 18 | نیست, sheet filed | pwC2 (caveat: my guess_res named g1 instead of g2) |
| 19 | هست | pwC2 p13 |
| 20 | نیست, sheet filed | pwC2 p11 |
| 21 | نیست, sheet filed | pwC1 p8 |
| 22 | هست | pwC1 p10, tC1 arms |
| 23 | هست | pwC2 p15, s21, aC1; caveat C25-11 |
| 24 | partly | oC1: everything followed his correction; pwC1: prior ledger and chat chain did not (C25-15) |

**Routing:** 246/246 correct. Prompt scan: 0 prompts with more than one question directive; one judge-unset «بپرس» line at s22 p4, the same as round 24.

**PARTS «نسبت به دورِ ۲۴»:**
- prior work (R8): new;
- live problem and story: better;
- correction engine: better, with new regressions (C25-4, C25-8, C25-15);
- territory loop: much better (S1 gone);
- assistant and post-check: better;
- age and register: better;
- route map: better;
- dossier: same;
- mind card: same;
- prerequisites: same (good);
- practice and Today: same.

**New owner-like questions**
- «این ابزارِ تازه را خودش روی دادهٔ من آزموده؟»
- «اصلاحِ من به گام‌های پیشینِ خودم هم رسید؟»
- «کدام حکم‌هایت را من تأیید کرده‌ام؟»

**My own errors (class d):**
- Every run had to be restarted with the dev clock set to 2026-10-18 (today is 10-25).
- The s29 sketch file was missing; I restored it from the round-24 copy and reran.
- In pC1 the replayed form filled d2/d3 before those rows existed, so it was stuck at the understanding stage; fixed and reran.
- At s25 p9 a reused reply used «تو» to the elder.
- At pwC2 p4 I named g1 instead of g2 in guess_res, so the calibration finding (bank 18) is partly my fault.
- oC1 and tC1 user lines were rewritten to match what the page now shows.
- In the oC1 e-mail I replaced the generic C25-15 wording with the oC1-specific case (120⇐140).

Token and time use are not visible to me.

All files are under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C/`:
- `defects.md`
- `PARTS.md`
- `routing.md`
- `NOTES.txt`
- `<sid>/findings.md`
- `s21/better/`, `s25/better/`
- `tC1_build/`