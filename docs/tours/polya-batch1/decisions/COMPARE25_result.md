# Round-25 runner-model comparison — independent judge (Opus)
Inputs: round25B/ (runner Opus, "B") vs round25B_s/ (runner Sonnet, "B_s"); page main 64dc0667; same round-24 B replays + each run's own new
scenarios (pwB1/pwB2 and territory arms were authored independently, so those texts differ). Every one-run defect below was re-checked by me in
ai/pN.json, out/sN.json, post.txt, sheets/. Neither runner's word was taken.

## Interference (recorded and weighed)
- B_s kill.sh pattern (`drv.py <sid>`) killed B's s11, s14, s15 once; B re-ran them with drv25b.py. Final B logs are complete (drv.log line counts
  equal B_s's: s11 76/76, s14 63/63, s15 19/19), DONE + {"exit":true} present.
- B's early reset/fin may have hit a B_s driver (s12/s15/s20). round25B_s/notes.md says nothing about it; B_s drv.logs show no restart/kill
  and are complete (s12 35, s15 19, s20 16 lines). B_s aBf/aBx have no DONE/findings (arms reported inside aB* / defects.md).
- So every replayed scenario is compared on a clean final run. pw* and tB1-arm scenarios are not pairwise identical (different authored texts);
  defects there are compared by root, and a defect the other run's design never reached is marked N (not exercised), kept apart from M (missed on own evidence).

## Union of real defects (my severity) — F found · M missed although its own evidence shows it · N not exercised by that run · P partial
| # | defect (root) | sev | B | B_s | evidence I checked |
|---|---|---|---|---|---|
| U1 | territory loop: lone unfit area declared «🛎 ابزارِ لازم آمد» on scaffolding words «ایده/جایگاه»; her «همان نیست» after arrival ⇒ state resumed, step lost | S1 | F (D1) | N (no lone-weak-area arm, no rejection after arrival; tB1d shows the same word inflation «ایده/کس/کارکرد» without harm) | B tB1 out/s17 checks + msgs, s19 state=resumed |
| U2 | prior-work opening gets the guess/whole-first turn question, not the resume point | S2 | F (D2) | F (D4) | B pwB1/pwB2 p1; B_s pwB1 p1 «همین پیام حدس است» |
| U3 | verdict dispute ⇒ A073 «خودت فکر می‌کنی چرا؟ … توضیحِ آماده را نده», no evidence re-check | S2 | F (D3) | N (its disputes never hit A073) | B pwB1 p2, pwB2 p2 |
| U4 | prior ledger replaced by each new report / never moves without one; fixed only via bare «آره» | S2 | F (D4) | P/N (saw "step 2 stays ✗" but its own model replies never re-reported `prior` — 2 of ~45 asked prompts answered — and it blamed the page) | B pwB1 p3 «۲ گام — همه درست», bp2 p7; B_s pwB1 p2–p7 identical ledger, r3–r7 no prior |
| U5 | arithChk misparses chained equalities ⇒ correct sums told wrong, ✗ forced | S2 | F (D5) | N | B pwB2 p2 «۰.۴ * ۹ + … = ۸٫۷، نه ۳.۶» |
| U6 | arithChk drops Unicode unary minus «−۳ + ۴۲» ⇒ «۳ + ۴۲ = ۴۵، نه ۳۹» | S2 | N | F (D1) | B_s pwB2 p2 |
| U7 | coach-facing chkM «(عددِ درست را لو نده)» shown in 🧭/📜 | S2 | F (D6) | F (D1) | both out/*.json |
| U8 | dependency added by number match to a ✓ step | S2 | F (D7) | N | B pwB1 r1 step 4 no dep ⇒ p2 «وابسته به گامِ ۲» |
| U9 | RECALL22 «یادم رفت» drops the turn's prior/result/plan; stale page question p6–p7 | S2 | F (D8) | N | B pwB1 p5–p7 |
| U10 | sub-result moves whole problem to look-back («مرحلهٔ محتمل: بازنگری» after intermediate m³) | S2 | F (D9) | **M** (bp2 p5/p7–p12 prompts identical; bp2 judged PASS) | both bp2 ai/p5,p7 |
| U11 | s19 c81 stale over-reach: goal «۸ ⇒ ۱۰» and measured weigh-in set aside | S2 | F (D10) | P (D17 as S3, goal half not reported) | identical line in both s19 out |
| U12 | mind card does not credit correct prior steps | S2 | F (D11) | F (D5) | |
| U13 | second chat problem not separated (bank #16): B — bound to the old route as «داده»; B_s — budget question became the session's route destination, old points gone (pts:[]), while the assistant says «قاطی نمی‌شوند» | S2 | F (D12) | **M** (oB1 PASS, bank #16 «هست») | B oB1 s23; B_s oB1 s24 FINAL + p21 «# وضعِ کنونی» |
| U14 | prior dispute/withdrawal never closes: «حکمِ گامِ ۶ … را رد کردی — به چه دلیل؟» as the page question p4–p7 after «اشتباهی زدم», into look-back | S2 (borderline S3) | N (masked by U4 replacement; appeared once, B pwB1 p3) | F (D2 part) | B_s pwB1 p4–p7 |
| U15 | Today shows a page-invented +7 d plan due «۱۰ آبان — انجام شد؟» before her yes, later than her real deadline | S3 (borderline S2) | N | F (D7 part) | B_s pwB2 post.txt l.42, l.449 |
| U16 | prior block over-triggers (classroom anecdote, pure question, mid-solve reports) | S3 | F (D13) | M (s15 p2, aB2, bp3 identical prompts) | |
| U17 | page unit check misses kJ↔kWh / mm↔m; «حسابِ عددی‌اش … درست — پس نادرستی از جای دیگری» beside ✗ | S3 | F (D14) | M (its own pwB1 p2 shows exactly this) | |
| U18 | self-fix of a judged step: retract refused / «چیزی ثبت نشده بود»; 📜/🧭 still draw it | S3 | F (D15) | F (D2 part, D21) | |
| U19 | s12 p10 elder post-check on «عالی. وارسی؟» | S3 | F | F | |
| U20 | model's wrong Gregorian prose (۲ مه) left beside the page's correct parse | S3 | F | F | |
| U21 | territory chat: generic ⚠️ lines / two outcomes in one pass (ask+mismatch, ask+arrived) | S3 | F (D18) | F (D14) | B tB1y; B_s tB1d s14 |
| U22 | duplicate waiting rows / route duplicates | S3 | F | F | |
| U23 | «# وضعِ کنونی» «فهمِ مسئله» vs live block «اجرا روی واقعیت» | S3 | F (D20) | M (aB3 p11–p14 identical; its D6 states something else) | |
| U24 | strip/route «اکنون: اجرای طرح · مانده: نامعلوم — طرح هنوز نیست» while a plan exists | S3 | M (in notes.md only, not catalogued) | F (D6, rated S2) | |
| U25 | same live page question repeated (s18, bp2, s19) | S3 | F | P (s19 only) | |
| U26 | lesson read as guess, quote emptied (oB1 p14) | S3 | F (D22) | M (identical p14) | |
| U27 | refuted guess still «آزموده نشده» in route | S3 | F | F (class, pwB2) | |
| U28 | importer takes results/inferences as «داده» | S3 | F | F | |
| U29 | opening meta/greeting sentence as title/unknown/destination | S3 | F (D25, D23) | F (D3, rated S2) | |
| U30 | s11 prior never reaches the later live problem | S3 | F | N (did not answer the prior directive) | |
| U31 | s17 p8 changed field keeps stale «= ۱۹ متر» | S3 | F | M (same text in its output) | |
| U32 | bp2 strip keeps a learned prerequisite open | S3 | F | M (strip line ×8 in its output) | |
| U33 | elders get «✓ تاریخِ تولدت ثبت شد» (R5 «شما» in every page line) | S3 | **M** (quoted the line as ✓) | F (D8) | s12, aB4, aB3x/aBx both |
| U34 | two-question page questions STILL | S3 | F (r24 table) | F | |
| U35 | s18 p4 dangling «همان پیشنهادِ این نوبت» | S3 | F (table) | F | |
| U36 | s11 «صورتِ مسئله» twice in ask list | S3 | F (table) | F | |
| U37 | automatic follow-up «فیلدهای این صفحه را پر کن» for fieldless «🗺 قلمروِ سامانه‌ها» | S3 | **M** (tB1z p10 has it; B declared the class fixed) | F (D16) | |
| U38 | s15 strip destination raw «چیکار کنم؟» | S3 | F (table) | F | |
| U39 | s16 c8 evlog lost the «داده (از گفت‌وگو)» event vs r24 (low confidence: may be intended for the parent frame) | S3 | M | F (D22) | s16 out/s8 evlog [] in both, r24 had cdata |
| U40 | aB1 📜 quotes the child's message ×3 | S3 (mild) | M | F (D23) | |
| U41 | dispute without leading «نه» not parsed | S3 | F (D3 part) | F (D24) | |
| U42 | page turn question leaks the verdict's reason, cut with «…» | S3 | M (same template in pwB1 p6–p7, not flagged) | F (D25) | |

## Per run
| | B (Opus) | B_s (Sonnet) |
|---|---|---|
| real defects found (of 42) | 33 F | 25 F + 3 P (U4, U11, U25) |
| missed on own evidence (M) | S1 0 · S2 0 · S3 6 (U24, U33, U37, U39, U40, U42) | S1 0 · **S2 2 (U10, U13)** + 1 half (U11 goal) · S3 6 (U16, U17, U23, U26, U31, U32) |
| not exercised (N) | S2 2 (U6, U14) · S3 1 (U15) | **S1 1 (U1)** · S2 5 (U3, U5, U8, U9; U4 via non-compliance) · S3 1 (U30) |
| misses counting N | S1 0 · S2 2 · S3 7 | S1 1 · S2 7 · S3 7 |
| false defects | 0 found (tB1z 📜 date correctly set aside as harness class d) | 2 whole: D13 (same harness date artefact B diagnosed), D15 (⏳ «هنوز دیده نمی‌شود» is correct when the note names no existing area); 3 false sub-claims: D2 "ledger blind to her fix" blamed on page (its own replies never reported), D3 "criterion stored nowhere" (same cause), D7 "model has no action to register a date" (the prompt lists {"do":"deadline"}) |
| severity accuracy | consistent | U11 under (S2→S3); U24, U29 over (S3→S2) |
| scenario verdicts | aB1 PASS mildly wrong (U40); s16 PASS maybe wrong (U39, low conf.) | 5 wrong PASS: bp1 (U16, B24·D15 still), bp2 (U10 S2, U25, U32), bp3 (U16), oB1 (U13 S2, U26), s17 (U31) |
| round-24 table | no error found in my checks | 3 errors: D15 «FIXED» (bp1 p11 still «ثابتش می‌کنی…» after her multiplication check — B: CHANGED); D14 evidence «no outcome in aB2/aB4» (both post.txt show «سرانجام: تأیید شد / رد شد»); D2 «prompt stage reaches بازنگری» (aB3 «# وضعِ کنونی» stays «فهمِ مسئله») |
| «ارتقای لازم» | scenario-specific (6 distinct blocks; «none» where nothing beyond fixes) | one identical 3-bullet block pasted in all 25 findings; need maps identical boilerplate |
| better/rN.txt | 3 files, all genuinely improved replies (e.g. pwB1 r2 evidence re-check 1 kWh = 3.6 MJ) | 4 files, all byte-identical to its own ai/rN.txt (no added value) |
| brief compliance | p<N> ✓, shots ✓, ai/ ✓, 5 territory arms all through the fit check (+ask arm, best of three, sys_done) ✓, prior-work table ✓, owner-bank table ✓, notes 27 KB | p<N> ✓, shots ✓, ai/ ✓; arms (a)/(b) never reached the fit check (notes named a non-existent area / nothing ⇒ ⏳ path), so 2 of 5 arms not really tested; answered the round-25 «# کارِ پیشینِ تو» directive in 2 of ~45 prompts that asked (replayed old replies elsewhere); prior-work + owner-bank tables ✓; aBf/aBx no findings/DONE; notes 236 B |
| token / time | ~1–1.5 h wall-clock (own estimate); tokens not visible. DONE stamps ≈12:22–13:21 | tokens/time not visible; same window, last DONE 13:27 |

## Decision rule (mechanical)
Rule: Sonnet replaces Opus as runner only if it misses no S1/S2 defect AND its missed-S3 count is not higher than Opus's.
- S1/S2 clause: Sonnet missed two S2 defects that sat in its own, identical replay evidence (U10 bp2 look-back; U13 bank #16 second problem —
  both scenarios marked PASS), under-rated a third (U11), and its design never reached one S1 and four more S2s. **Clause fails.**
- S3 clause (informative only): 6 vs 6 on own evidence, 7 vs 7 counting not-exercised — a tie.

**Verdict: Opus stays as the runner.** Main session, fixers and root-cause decisions stay on Opus regardless.

## Borderline note
On the S1/S2 clause the result is not borderline: the two S2 misses are on byte-identical replay prompts, independent of the differing pw/arm
designs and of the kill-script interference. The S3 side is a genuine tie, and one group is a small sample, so the comparison does not show
Sonnet weaker at small defects — it shows it missing larger ones, mis-reading the round-24 table, and producing low-value write-ups
(boilerplate upgrades, copied better/ files, prior directive mostly unanswered). A round-26 repeat is optional; it could only change the verdict
if Sonnet runs with zero S1/S2 misses, so if repeated, require it to answer every new-rule directive and to route all five arms through the fit check.
