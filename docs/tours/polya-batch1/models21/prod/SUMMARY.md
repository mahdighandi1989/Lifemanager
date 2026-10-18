# Model-tier tour, round 21 — pass «prod» (lla_coach ⇒ sonnet responder, lla_assistant ⇒ haiku responder)

Build: branch claude/life-program-flow-diagram-q37jvr at ef3c1c67 (+ docs-only aa8f1e06), dist built 02:41. Harness5. User turns: models20/sonnet/<sid>/src
(the models20 turns, including its s25 recovery insert), with 10 minimal adaptations logged in <sid>/adapt.log (s10 1, s18 1, s19 1, s31 7). In s31,
3 of the 7 revert to the R19 original because the prod reply asked what that original turn answers. The driver wrote no reply. 61 requests, 0 responder
timeouts, 61/61 valid JSON. Evidence: prod_pairs.json, prod_val.json (the page's own AS.quoteIn check), prod_turns.txt, <sid>/findings.md, <sid>/mind.txt.

## Scenario results
| sid | models20 haiku | models20 sonnet | **models21 prod** | what decided it |
|---|---|---|---|---|
| s03 | PASS S3 | PASS S3 | **PASS S3** | all coach turns; register now «تو»; the boundary-points gap was still not raised |
| s10 | FAIL S2 | PASS | **PASS S3** | p1–p2 misrouted to haiku (asked twice for the rules); from p3 on, sonnet drew out the counting argument |
| s18 | PASS S3 | PASS S3 | **PASS S3** | p1–p3 misrouted; full Pólya chain + chat_solved |
| s19 | FAIL S2 | PARTIAL S2 | **PARTIAL S2** | scope fixed and live problem opened; step report missed although the page asked for it; past deadline told to her, and the refusal was not explained |
| s25 | PARTIAL S2 | PARTIAL S2 | **PARTIAL S2** | «ثبتش کن» ⇒ chat_invent again, so the recovery turn was needed; haiku took 3 auto calls; the induction coaching was good |
| s29 | FAIL S2 | PARTIAL S2 | **FAIL S2** | all 3 coaching turns misrouted ⇒ chat_invent ×2, no page opened, 7 evals failed (sonnet: 4), reread loop ×4 |
| s31 | FAIL S2 | PARTIAL S2 | **PASS S3** | the quantifier question, then «three numbers?» drew out the discovery; correction accepted; unrequested chat_invent refused |
| s38 | PARTIAL S2 | PASS S3 | **PASS S3** | p1–p4 misrouted but haiku drew out the cutting plane; sonnet closed with chat_solved; distress handled |
| **P / Pa / F** | 2/2/4 | 4/4/0 | **5/2/1** | |

## Routing (RUNNER21 §5) — 61 requests
| sid | correct | wrong (all: coaching turn sent as lla_assistant) |
|---|---|---|
| s03 | 6/6 | — |
| s10 | 2/4 | p1, p2 |
| s18 | 3/6 | p1, p2, p3 |
| s19 | 4/4 | — |
| s25 | 10/10 | — |
| s29 | 4/7 | p1, p2, p3 |
| s31 | 15/15 | — |
| s38 | 5/9 | p1, p2, p3, p4 |
| **total** | **49/61** | **12** |

- Action-only commands and automatic «[سامانه …]» turns were routed lla_assistant **10/10** (correct). No action turn was sent as lla_coach.
- Coaching turns were routed lla_coach **39/51 (76%)**.
- All 12 misroutes are the **opening turns of a chat problem that has no live page yet**. The prompt carries «# مربیِ حل» and the status line «# وضعِ کنونی … مسئلهٔ گفت‌وگو … مرحله: …». AS.chatTask (a26_assist.js:567) still routes them lla_assistant, because none of the message regexes (CHAT_PROB / LIVE_* / FAIL_ME / LIFE_HINT) matched these statements: a seating puzzle, a funnel rate, «بزرگ‌ترین باغچه …؟», «حجم … رو پیدا کنید … فقط جواب رو بگو».
- Once one turn goes coach, the `prev` rule keeps the scenario on coach.
- **Page fix suggested:** treat a real chat problem in focus (C.stmt && !notProblem — the same condition that writes «مسئلهٔ گفت‌وگو» into the status line) as a coaching signal.

**Cost of the misroutes (counted):** the misrouted (haiku) turns account for:
- 5 of the 5 non-result `result` labels
- 3 of the 3 rejected paraphrased guesses
- the 1 rejected paraphrased defer
- 4 of the 4 invented `step` fields
- 2 of the 3 wrong-tunnel chat_invent calls: s29 ×2 (s25's was on a correctly routed action turn)
- the s10 repeated question
- the s29 reread loop

## Post-check rewrite requests
- **0** of 61 requests: no pN.json repeated the previous user text with a check reason appended.
- Slips the check could have targeted:
  - s31 r1: two separate question sentences. twoQ20 (a27_tour.js:3915) matches only «…؟ و/یا …؟».
  - s10 r1: an order plus a question (haiku turn; the check only runs when coaching is on).
  - s38 r9: borderline clarifier pair.
- Never triggered, so «did the rewrite fix the reply» cannot be judged: «حل شد» confirmation 0, register flips 0, change claims before the page's result 0.

## Round-20 failure classes: fixed / still / new (counts are from prod)
| # | class | models20 haiku / sonnet | **models21 prod** | verdict |
|---|---|---|---|---|
| 1 | result for non-results; mind card distorted | real 11/30 · 10/21; cards implausible 3/8 · 2/8 + 1 borderline | real **11/16**: haiku-routed 1/6, sonnet-routed **10/10**. Cards: implausible **1** (s31 «بازنگری»), borderline 1 (s38), empty 1 (s29) | **partly fixed.** The labels are clean on lla_coach. s31's card still takes the stage from the session phase rather than from her evidence (same as both models20 tiers). |
| 2 | paraphrased quotes rejected | guess 0/3 · 9/9 | guess verbatim **5/8**: sonnet 3/3, haiku 2/5. Defer 2/3 | **still on haiku turns.** No fuzzy matching; rejections are silent. |
| 3 | contract format slips | 4/51 · 0 | retract/taste aliases: 0 slips. **New sub-slip:** 4 `step` fields with no live step (all haiku) | alias part **fixed**; invented step = new (S3) |
| 4 | self-correction refused by page | lost · refused | s31 «پس جوابم غلط بود!» ⇒ retract **accepted**, «اصلاح شد ⇐ …» (1/1) | **fixed.** The fix text is the phrase «صورت گفته «اعداد»», not the datum itself (S3). |
| 5 | missed step reports | 0/2 · 0/2 | s19 p3: the page's line «آیا این پیام نتیجهٔ گامِ ۱ است؟» was present; sonnet still sent result+fail, no step (**0/1**) | **still.** The page line is not enough; salience or an alias (result+fail with an open step ⇒ part/no) is needed. |
| 6 | defer / promise | 2/4 · 0/2 | s31 defer 2/2 + promise_done; s38 defer paraphrased, rejected (haiku) | **mostly fixed on coach turns** |
| 7 | tool choice: chat_invent vs live; not opened; unrequested chat_invent | yes · yes | «ثبت کن» ⇒ chat_invent **3** (s25, s29 ×2), none opened. Unrequested chat_invent **refused by the page** + honest follow-up (s31 1/1) | **unrequested part fixed.** «A problem created on her request opens» does **not** cover chat_invent ⇒ still. |
| 8 | two questions; confirming «حل شد» | 7/53, 3 · 4/53, 0 | **2/61** (+1 borderline); «حل شد» **0** | **improved**, but the page check caught none |
| 9 | $…$ formulas | 1/11 · 5/7 | 10/36: coach 10/29, haiku 0/7 | the page renders plain math; not tier-relevant |
| 10 | register | 0 · 1 scenario | **0** | **fixed** |
| 11 | scope (life plan refused as medical) | refused · refused, then recovered | s19 r1 in scope; only the diet prescription is outside | **fixed** |
| 12 | state-blindness / ignoring her answer | 3 · mild | s10 repeated ask ×2 (haiku); s19 r4 ignored «# امروز 2026-12-13» ⇒ a past date (sonnet); s31 r3 took «two» at face value | **still (3).** The date case is new: the page refused the deadline but showed her a note addressed to the model (a33_dates.js:32) and sent no corrective turn. |
| 13 | judgment at the pivotal turn | 4/8 failed · 1½/8 | s10 ✓, s18 ✓, s31 ✓ (elicited: «three numbers?»), s38 ✓ (even on the haiku turn), s19 «ول می‌کنم» ✓. Failed: s29 garden guess never tested (½) | **fixed by routing + the page hint**: s31, which failed in both models20 tiers, now passes |

**New in prod:**
- **N1 routing misclassification:** 12/51 coaching turns. S2, because it carries most of the remaining slips.
- **N2 invented step fields:** 4 (S3).
- **N3 attachment reread loop:** ×4 to MAX_AUTO (S3). Partly a protocol artifact: the responder cannot see the image. But the page does not stop when the same file id is re-asked after the model says it did not receive it.
- **N4 deadline refusal note addressed to the model, shown to her:** 1, no follow-up turn (S3/S2 in s19).

## Reading (counted evidence only)
- When a coaching turn actually reaches lla_coach, the round-20 sonnet gains hold, and the R20 page compensations add to them:
  - correction accepted
  - unrequested chat_invent refused
  - register clean
  - scope fixed
  - the quantifier hint
- Result: 5/2/1. That is better than models20 sonnet (4/4/0) on PASS count. But s29 fell to FAIL: all its coaching turns were misrouted.
- What remains is page-side, and is now mostly **one routing condition**: a chat problem in focus ⇒ lla_coach. Behind it:
  - chat_invent on «ثبت کن» not opening a problem
  - the step-report alias
  - the mind-card stage taken from the session phase instead of her evidence
  - a user-facing line plus a corrective turn when a deadline is refused
