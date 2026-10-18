# Model-tier tour, round 21 — pass «haiku» (floor: one haiku responder answered every request, whatever its task)

Build: branch claude/life-program-flow-diagram-q37jvr at ef3c1c67 (+ docs-only aa8f1e06), dist built 02:41. Harness5. User turns: models21/prod/<sid>/src
(the prod pass's turns, with its adaptations), plus 10 minimal adaptations of my own in <sid>/adapt.log:
- s18: 1. Reverted to the models20 original, because haiku asked for the unknown.
- s19: 1. Haiku asked about week 2.
- s31: 8. Haiku asked «three numbers?» already at r2, so the discovery turn moved from c8 to c5, and the later turns follow haiku's own questions.

The driver wrote no reply. 62 requests: 10 automatic and 1 post-check rewrite. 0 responder timeouts. 62/62 valid JSON.

**Tampered replies («پاسخِ دست‌خورده»), 2:** s03 r2 and s31 r1 were edited by the responder after the page had read them (the files were modified at 03:14:58, after the next request had been created: s03 p3 at 03:14:18, s31 p2 at 03:13:51). The page used the first versions; the driver's log shows they had said:result with no result text. The visible reply text is unchanged. Both are left out of every model-output count (so counted replies are 60). Their routing rows stay, because the task field comes from the page. Scenario grades are unchanged. An mtime scan of every other reply found no further post-read edits.
Evidence: haiku_pairs.json, haiku_val.json (the page's own AS.quoteIn), haiku_turns.txt, <sid>/findings.md, <sid>/mind.txt.

## Scenario results
| sid | models20 haiku | models20 sonnet | models21 prod | **models21 haiku** | what decided it |
|---|---|---|---|---|---|
| s03 | PASS S3 | PASS S3 | PASS S3 | **PASS S3** | Same as prod. r4 «have you used all five points?» drew out the pigeonhole step; the live page closed «proved». |
| s10 | FAIL S2 | PASS | PASS S3 | **FAIL S2** | Asked for «the 6 rules» ×2. r3 (lla_coach) ignored her counting and asked for a counterexample, so the pivotal turn was missed. |
| s18 | PASS S3 | PASS S3 | PASS S3 | **PARTIAL S2** | The full Pólya chain worked. After her verified answer and her stated lesson, no chat_solved came, so the lesson was lost. |
| s19 | FAIL S2 | PARTIAL S2 | PARTIAL S2 | **PARTIAL S2** | Scope fixed and the live problem opened. The step report was missed although the page asked for it. The wedding deadline was not recorded. |
| s25 | PARTIAL S2 | PARTIAL S2 | PARTIAL S2 | **PARTIAL S2** | «ثبتش کن» ⇒ chat_invent again, so the recovery turn was needed. The unrequested chat_invent was refused by the page, followed by an honest correction. |
| s29 | FAIL S2 | PARTIAL S2 | FAIL S2 | **FAIL S2** | Same as prod: 3 coaching turns misrouted, chat_invent ×2 not opened, reread loop ×4. |
| s31 | FAIL S2 | PARTIAL S2 | PASS S3 | **PARTIAL S2** | Pivotal question at r2, earlier than prod. But the retract msg was taken from the current message (refused), the guess was paraphrased ×2, and there was no closure and no lesson booked. |
| s38 | PARTIAL S2 | PASS S3 | PASS S3 | **PARTIAL S2** | It drew out the cutting plane and handled her distress. The deadline was right. Neither solved problem was closed, so the lesson was lost. |
| **P / Pa / F** | 2/2/4 | 4/4/0 | 5/2/1 | **1/5/2** | |

## Routing (recorded; every reply came from haiku anyway)
- The page routed the same way as in prod: **50/62 correct**.
- Action-only and automatic turns went to lla_assistant **10/10**.
- Coaching turns went to lla_coach **40/52**.
- The 12 wrong ones are the same opening chat-problem turns as in prod: s10 p1–2, s18 p1–3, s29 p1–3, s38 p1–4.

## Post-check rewrite requests
- **1** of 62: s31 p3, reason register («تو بنویس، نه شما»).
- The flagged reply had no «شما». It only had «داشته باشیم» (first person plural), so the trigger was borderline or a false positive.
- Haiku rewrote it to «داشته باشی / بکن» with identical actions, so the rewrite did what the check asked.
- Slips the check missed:
  - 3 replies with two questions in one sentence (s03 r5, s18 r1, s38 r2). twoQ20 only matches «…؟ و/یا …؟».
  - 1 claim before the page result (s25 r10 «ثبت می‌کنم»). The page's automatic «انجام نشد» turn corrected it instead.

## Counted classes (models21 haiku)
| # | class | count |
|---|---|---|
| 1 | result is a real result | 17/27 + 2 said:result without text (2 tampered replies excluded) |
| 1 | mind cards | implausible 2 (s19 «فهم», s31 «طرح‌ریزی»), borderline 1 (s38), empty 1 (s29) |
| 2 | guess verbatim | 2/5 (s29 2/2; s31 0/2; s25 0/1) |
| 3 | contract format | 0 alias slips; 0 invented step; 2 said:result without text; 1 retract.msg quoted from the current message |
| 4 | self-correction | 0/1 (s31: refused correctly by the page; correction lost) |
| 5 | step report | 0/1 (s19 p3, with the page line present) |
| 6 | defer | 0 recorded for 6 «بعدی؟» requests (s31) |
| 7 | «ثبت کن» ⇒ chat_invent | 3 (s25, s29 ×2), none opened |
| 7 | unrequested chat_invent | 1, refused by the page plus an honest follow-up |
| 7 | live_new on request | opened 2/2 |
| 8 | two questions | 3 |
| 8 | «حل شد» confirmed | 0 |
| 9 | $…$ | 0/43 with the formula line |
| 10 | register | 0 mismatches |
| 11 | scope | fixed |
| 12 | state-blind | 5 (s10 ×3, s18 r6, s31 r5) + 1 mild (s38 r9) |
| 13 | pivotal judgment | failed 1½/8 (s10; s29 ½) |
| N1 | routing | 12/52 coaching turns misrouted |
| N2 | invented step | 0 |
| N3 | reread loop | ×4 (s29) |
| N4 | model-addressed deadline note | not triggered |
| **N5** | closure withheld: **chat_solved 0** (models20 haiku 3, prod 3) | lesson not booked ×3 (s18, s31, s38); 4 downstream evals failed |
