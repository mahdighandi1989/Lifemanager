# Model-tier tour — tier 2 = sonnet (same 8 scenarios, page, harness5, R19 user turns, same two-agent protocol)

56 replies (53 to user turns + 3 auto-continuations); responder timeouts 0. User-turn adaptations: 14 minimal edits + the same s25 recovery
turn as haiku (adapt.log per scenario). s29 r3/r4 (attachment invisible to a text-only responder) not scored against the model.

## Per-scenario result
| sid | sonnet | haiku | R19 (runner-simulated) | sonnet in one line |
|---|---|---|---|---|
| s03 | PASS (S3) | PASS (S3) | PASS | clean Pólya path; «شما» register vs her informal turns; did not raise the boundary gap itself |
| s10 | PASS | FAIL S2 | PASS | engaged her counting argument, explained "assume", family phrasing |
| s18 | PASS (S3) | PASS (S3) | FAIL S3 | "used all the data?" led straight to 10/30; chat_solved + check |
| s19 | PARTIAL S2 | FAIL S2 | FAIL | same "dietitian's job" refusal at r1, reframed in-scope at r2; 0/2 step reports |
| s25 | PARTIAL S2 | PARTIAL S2 | PARTIAL | same chat_invent-instead-of-live_new; recovered in 1 call (haiku 4) |
| s29 | PARTIAL S2 (page) | FAIL S2 | PARTIAL | pond live_new not opened by the page — same 3 form failures as haiku |
| s31 | PARTIAL S2 | FAIL S2 | PASS S3 | same "two numbers, x" hint; correct retract refused by the PAGE; taste/plan/bestQ kept |
| s38 | PASS (S3) | PARTIAL S2 | PASS S3 | elicited the cutting plane; asked, not told, under distress |
Totals: sonnet 4 PASS · 4 PARTIAL · 0 FAIL — haiku 2 · 2 · 4 — R19 4 · 2 · 2.

## Rates (counted, sonnet)
JSON 56/56 · coach_state 53/53 · format slips 0 · result verbatim 21/21, really a result 10/21 (48%) · guesses captured 6/6 of hers (+3 claims),
accepted 9/9 · retract 1/1 in correct format (refused by the page's correction-marker check) · plan 1/1 · taste 2/2 (+bestQ 1) · check field 5 ·
step reports 0/2 · defer 0/2 needed (s19 plan, s31 "سؤال بعدی") · two questions in one sentence 4/53 · «حل شد» confirmed 0 (explicit refusal ≥10) ·
live_new only on her yes 4/4 · unrequested records 3 incidents (s25 r8, s31 r10 ×3, s31 r11) · wrong tunnel for "ثبتش کن" 1 · $…$ 5/7 formula replies ·
register mismatch 1 scenario (s03 «شما») · first-turn scope refusal 1 (recovered next turn) · pivotal-turn coaching failure 1 (s31 r4) + ½ (s19 r1) ·
mind card plausible 5/8 (s19, s31 implausible — both identical in shape to haiku's; s38 borderline).
