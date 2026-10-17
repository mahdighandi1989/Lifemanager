# Model-tier tour (roadmap §11): R19 runner-simulated vs haiku vs sonnet

All three runs use the same page (main a94614ae), harness5 and R19 user turns on s03 s10 s18 s19 s25 s29 s31 s38.
- R19: a strong runner role-played the "literal average model".
- haiku / sonnet: a real model wrote every reply from ai/pN.json alone. The driver wrote only user turns, with minimal adaptations logged.
Details are in haiku/SUMMARY.md and sonnet/SUMMARY.md, plus <tier>/<sid>/findings.md, *_turns.txt and *_val.json (the page's own verbatim check, AS.quoteIn).

## Scenario results
| sid | R19 sim | haiku | sonnet |
|---|---|---|---|
| s03 | PASS | PASS S3 | PASS S3 |
| s10 | PASS | FAIL S2 | PASS |
| s18 | FAIL S3 | PASS S3 | PASS S3 |
| s19 | FAIL | FAIL S2 | PARTIAL S2 |
| s25 | PARTIAL | PARTIAL S2 | PARTIAL S2 |
| s29 | PARTIAL | FAIL S2 | PARTIAL S2 (page) |
| s31 | PASS S3 | FAIL S2 | PARTIAL S2 |
| s38 | PASS S3 | PARTIAL S2 | PASS S3 |
| **total P/Pa/F** | 4/2/2 | 2/2/4 | 4/4/0 |

## Per failure class (counts: R19 sim | haiku | sonnet) and verdict
| # | class | R19 sim | haiku | sonnet | verdict |
|---|---|---|---|---|---|
| 1 | result for non-results; wrong ph ⇒ mind card distorted | n/a (runner) | result real 11/30; cards implausible 3/8 | result real 10/21; cards implausible 2/8 + 1 borderline | **PAGE.** Both tiers mislabel at about the same rate, and s19/s31/s38 show the same wrong weakest stage in both tiers. Take the stage from her evidence, not the model's ph, and never name a weakest stage from model labels alone. |
| 2 | paraphrased quotes rejected (guess/defer) | guesses 6 reported | guess 0/3 accepted (paraphrased), +1 made up | guess 9/9 verbatim | **PAGE helps** with fuzzy/math-normalised matching or a re-ask. Sonnet shows the instruction is followable; haiku's paraphrases were faithful, so normalisation recovers them. |
| 3 | contract format slips | 0 seen | 4/51 (top-level retract, taste object, result w/o text, stale result) | 0 | **PAGE:** accept the aliases. Cheap fix that removes haiku's gap. |
| 4 | correction refused by the page | — | retract wrong format (lost) | retract correct, **refused by the page**: «پیامِ کنونی نشانهٔ اصلاحِ حرفِ خودش را ندارد» for «پس جوابم غلط بود!» | **PAGE DEFECT** (tier-independent): widen the self-correction markers (جوابم غلط بود، اشتباه کردم … about her own earlier claim). |
| 5 | missed step reports (live step outcome said in chat) | step 1 reported (s19) | 0/2 | 0/2 | **PAGE:** add a targeted "does this message report step N? yes/part/no" line when a live step is open. The same miss in both tiers says it is a prompt-salience issue. |
| 6 | defer / promise | defer 2 | 2/4 accepted | 0/2 needed | **PAGE (mixed):** the page's backup "deferred request" line exists. Sonnet postponed "سؤال بعدی" in words without the field. A page-side detector for repeated "بعدی؟" can create the promise. |
| 7 | tunnel/tool choice: "ثبتش کن" ⇒ chat_invent; second live_new not opened; unrequested chat_invent for her self-made problems | s25 r8 + s31 r10 chat_invent unasked (4) | s25 wrong tunnel (4 extra calls), s29 not opened, s31 ×3 unasked, s19 kcases unasked | s25 wrong tunnel (1 extra call), s29 not opened, s25 r8 + s31 ×4 unasked | **PAGE.** All three runs do it, so the prompt allows it and the page does not navigate. Open every live problem created on her request, turn chat_invent into live_new when she asks to work now, and require a request (or turn it into an offer) before chat_invent. |
| 8 | text-rule slips: two questions in one sentence; confirming «حل شد» | — | 7/53; 3 | 4/53; 0 | **PAGE post-check** for both. The tier helps (verdict 3 → 0), but a validator suffices. |
| 9 | $…$ formulas | 11 replies with $ | 1/11 | 5/7 | **PAGE already compensates** (plain-math renderer). No tier signal needed. |
| 10 | register | — | 0 mismatches | 1 scenario («شما» while she writes informally) | **PAGE:** the register is computed from her words. Enforce it in a post-check. |
| 11 | scope misjudgment (life plan refused as "medical") | — (R19 created the problem) | s19: refused + rerouted to knots | s19: refused at r1, reframed in-scope at r2 | **BOTH.** Clarify in the prompt that habit/plan problems belong in the life tunnel (only the nutrition prescription is outside). Sonnet's self-recovery shows the tier helps. |
| 12 | state-blindness / ignoring her answer | — | s10 repeat ×3, s29 contradiction, s25 "before closing" after closure | s29 mild only | **STRONGER TIER indicated**, with page help: a one-line top-of-prompt "now / she answered" summary. Sonnet nearly eliminates it with the same 72k prompt. |
| 13 | coaching judgment at the pivotal turn | R19 runners elicited | 4/8 failed (s10, s31 r4, s38, s19) | 1½/8 (s31 r4; s19 r1 recovered) | **STRONGER TIER indicated** for coaching turns. Sonnet elicited what haiku missed (s10 counting, s38 cutting plane, s38 distress handled by asking). s31 r4 fails in both: the prompt's ladder and «کوچک‌ترین گام» push toward "x and 10−x". A **page** hint ("check the statement's quantifiers/plurals before reducing") could fix that one. |

## Reading
- Haiku is a reliable JSON/actions writer.
- Its scenario failures split into two groups:
  - Things the page can fix: classes 1–10. Several of these defects (4, 5, 7, the mind-card distortion in 1) appear in **both** tiers, and some in R19 too, so they are page/prompt defects regardless of tier.
  - Judgment failures (12, 13): sonnet removes most of them (FAIL 4 → 0) on the same prompt.
- Recommendation from the counts:
  - Route coaching turns on deep, ill-posed or life problems to the sonnet-class tier.
  - Keep actions-only and auto-continuation turns on the fast tier.
  - Fix classes 1, 4, 5, 7 in the page first: they cost both tiers.
