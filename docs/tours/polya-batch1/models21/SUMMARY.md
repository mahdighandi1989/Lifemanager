# Model-tier tour, round 21: models20 haiku · models20 sonnet · models21 haiku (floor) · models21 prod

## What was run
| run | page | user turns | who answered |
|---|---|---|---|
| models20 | main a94614ae | R19 turns | one tier for everything |
| models21 | ef3c1c67, with the R20 page compensations MT1 and the routing MT2 | models20 sonnet turns (+ logged minimal adaptations) | prod: lla_coach ⇒ sonnet, lla_assistant ⇒ haiku. haiku: haiku for everything |

- Same 8 scenarios (s03 s10 s18 s19 s25 s29 s31 s38), harness5, and the two-agent protocol: the driver never wrote a reply.
- Only counted evidence is used. Sources: <pass>/<sid>/findings.md, *_pairs.json, *_val.json (the page's own AS.quoteIn), *_turns.txt.
- The cleanest test of the page fixes is **models20 haiku → models21 haiku**: same model, new page.
- The test of routing is **models21 haiku → models21 prod**: same page, coaching turns on sonnet.

## Scenario results
| sid | m20 haiku | m20 sonnet | m21 haiku | m21 prod |
|---|---|---|---|---|
| s03 | PASS S3 | PASS S3 | PASS S3 | PASS S3 |
| s10 | FAIL S2 | PASS | FAIL S2 | PASS S3 |
| s18 | PASS S3 | PASS S3 | PARTIAL S2 | PASS S3 |
| s19 | FAIL S2 | PARTIAL S2 | PARTIAL S2 | PARTIAL S2 |
| s25 | PARTIAL S2 | PARTIAL S2 | PARTIAL S2 | PARTIAL S2 |
| s29 | FAIL S2 | PARTIAL S2 | FAIL S2 | FAIL S2 |
| s31 | FAIL S2 | PARTIAL S2 | PARTIAL S2 | PASS S3 |
| s38 | PARTIAL S2 | PASS S3 | PARTIAL S2 | PASS S3 |
| **P/Pa/F** | **2/2/4** | **4/4/0** | **1/5/2** | **5/2/1** |
| requests | 61 | 56 | 62 (10 auto, 1 rewrite; 2 tampered replies excluded from counts: s03 r2, s31 r1) | 61 |

## Routing (models21; the page's task field, judged per turn)
- Prod: 49/61 correct. Haiku pass: 50/62 correct. The extra request is the rewrite, routed lla_coach, which is correct.
- Action-only and automatic turns went to lla_assistant **10/10** in both passes.
- Coaching turns went to lla_coach **39/51** (prod) and **40/52** (haiku).
- The same 12 coaching turns were misrouted in both passes: the opening turns of a chat problem with no live page yet (s10 p1–2, s18 p1–3, s29 p1–3, s38 p1–4). AS.chatTask (a26_assist.js) has no "chat problem in focus" signal.

## Post-check rewrites (R20 MT1)
- Prod: 0. Haiku: 1 (s31, register). The flagged reply only had «داشته باشیم», so the trigger was borderline. The rewrite was applied correctly: «تو», same actions.
- Slips the check did not catch:
  - two questions in one sentence: prod 2, haiku 3 (twoQ20 only matches «…؟ و/یا …؟»)
  - a claim before the page result: haiku 1 (s25 r10). The page's automatic «انجام نشد» turn corrected it.

## Per failure class: fixed by the page / still / new
| # | class | m20 haiku | m20 sonnet | m21 haiku | m21 prod | verdict |
|---|---|---|---|---|---|---|
| 1 | result for non-results; mind card | real 11/30; implausible 3/8 | real 10/21; 2/8 + 1 | real **17/27** (+2 said:result w/o text; 2 tampered replies excluded); implausible **2** (s19, s31), borderline 1, empty 1 | real 11/16; implausible 1, borderline 1, empty 1 | **Partly fixed by the page.** Labels are much cleaner even on haiku. The weakest stage still comes from model labels or session phase, not from her evidence (s31 in both passes, s19 on haiku) ⇒ **still** |
| 2 | paraphrased quotes rejected | guess 0/3 | 9/9 | **2/5** | 5/8 (haiku-routed 2/5) | **Still.** No fuzzy matching; haiku paraphrases ×3, rejected silently |
| 3 | contract format slips | 4/51 | 0 | alias slips **0**; said:result w/o text 2; retract.msg wrong fragment 1 | 0 alias; invented step 4 | **Alias part fixed.** Invented step (N2) did not recur on haiku (0), so it was responder variance |
| 4 | self-correction refused | lost (format) | refused by page | **lost**: msg quoted from the current message; the page refused correctly with a visible line | **accepted 1/1** | **Page side fixed** (marker plus the refusal line). On haiku the model's msg quote is still wrong ⇒ **still (tier)** |
| 5 | missed step report | 0/2 | 0/2 | **0/1** (page line present) | 0/1 | **Still, tier-independent.** The page line is not enough; an alias is needed (result+fail with an open step ⇒ step part/no) |
| 6 | defer / promise | 2/4 | 0/2 | **0** for 6 «بعدی؟» | 2/2 + promise_done | **Still on haiku**; fixed on sonnet |
| 7 | «ثبت کن» ⇒ chat_invent; not opened; unrequested chat_invent | yes; yes; 3 | yes; yes; 4 | **3** not opened; unrequested **1 → refused + honest follow-up**; live_new opened 2/2 | 3 not opened; unrequested 1 → refused | **Unrequested part fixed by the page** (both passes). chat_invent on «ثبت کن» **still** (3 in each pass) |
| 8 | two questions; confirming «حل شد» | 7/53; 3 | 4/53; 0 | **3/62; 0** | 2/61; 0 | **Improved.** «حل شد» confirmation fixed; the page check caught none of the double questions |
| 9 | $…$ | 1/11 | 5/7 | 0/43 | 10/36 | Not a defect: the page renders plain math |
| 10 | register | 0 | 1 scenario | **0** (1 rewrite, borderline trigger) | 0 | **Fixed** |
| 11 | scope (life plan refused as medical) | refused | refused, then recovered | **in scope** (only the diet prescription is outside) | in scope | **Fixed by the page**, also on haiku |
| 12 | state-blindness | 3 | mild | **5 + 1 mild** (s10 ×3, s18 r6, s31 r5) | 3 | **Still**, mostly a tier issue: haiku 5 vs prod 3, and 2 of prod's 3 were on haiku-routed turns |
| 13 | judgment at the pivotal turn | 4/8 failed | 1½/8 | **1½/8** (s10; s29 ½). s31 and s38 are now elicited by haiku itself | ½/8 (s29) | **Largely fixed by the page** («# وضعِ کنونی», quantifier hint): haiku matches m20 sonnet. s10 still needs the stronger tier |
| N1 | routing misclassification | — | — | 12/52 | 12/51 | **New (page), tier-independent** |
| N2 | invented step fields | — | — | 0 | 4 | New in prod only; not reproduced |
| N3 | attachment reread loop | — | — | ×4 | ×4 | **New (page + protocol)**, both passes |
| N4 | deadline refusal note addressed to the model, shown to her | — | — | not triggered (no deadline sent) | 1 | New (page), prod only |
| **N5** | closure withheld: chat_solved never sent, so her stated lesson is not booked | (chat_solved 3) | (4) | **chat_solved 0; lesson lost ×3** (s18, s31, s38); 4 downstream evals failed | chat_solved 3 | **New on haiku under the R21 page.** It replaces m20 haiku's premature closing. The R20 rules («don't confirm حل شد / only what the page confirms») make haiku say «هنوز حل شد نمی‌گوییم» and keep asking checks even after a verified answer plus a stated lesson. **Page fix:** when she states a lesson after a result, the page books it itself (or asks one closure question) |

## Totals per verdict
**models20 haiku → models21 haiku (the page's effect on the same model):**
- Fixed or largely fixed: 4, 10, 11, 13, unrequested chat_invent (7b), «حل شد» (8b). Partly fixed: 1, 3.
- Still: 2, 5, 6, 7a, 12, and 4 on the model side.
- New: N1, N3, N5.
- FAIL went from 4 to 2. PASS went from 2 to 1: N5 cost s18 and s38.

**models21 haiku → models21 prod (routing coaching turns to sonnet on the same page):**
- +4 PASS: s10 (pivotal turn), s18 / s31 / s38 (closure and lesson booked), plus s31's retract accepted.
- Still on both: 5, 7a, N1, N3, and s29 (all its coaching turns misrouted, so it is haiku in both passes).

## Reading (counted evidence only)
1. The R20 page compensations work on the floor model:
   - scope, register, the unrequested-invent refusal, the honest «انجام نشد» follow-up, and «حل شد» never confirmed
   - the pivotal coaching failures dropped from 4/8 to 1½/8, the same as models20 sonnet
2. Haiku still loses on three counts:
   - verbatim fields: guesses 2/5, defer 0, retract msg
   - state-tracking: 5 state-blind turns
   - N5: it does not close even when the person is done, so lessons are lost in 3/8 scenarios
3. The routing design is confirmed by the counts: same page, PASS 1 → 5 when coaching turns reach sonnet.
4. The remaining page-side work is the same in both passes. In order:
   - (a) chat problem in focus ⇒ lla_coach (N1: 12 turns; it alone would hand s10, s18, s29, s38's openings to sonnet)
   - (b) chat_invent on «ثبت کن» ⇒ open a live problem
   - (c) step-report alias (class 5)
   - (d) a closure / lesson fallback for N5
   - (e) fuzzy verbatim matching for guess/defer, with a visible refusal
   - (f) stop repeated reread of the same file id
   - (g) a mind-card weakest stage taken from her evidence
