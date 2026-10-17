# Round 6 group D (s30–s38) — build 522f92d (dist mtime 08:44:51, committed in merge 522f92d)
All 9: RESULT PASS (round 5: 6 PASS / 3 PARTIAL). s30, s37, s38 moved PARTIAL → PASS.
Details: round6D/<sid>/findings.md. 9 e-mails sent.
Remaining defects (all S3, none blocks a criterion):
1. stale turn signal: a27_tour.js:1509–1511 `rep` (previous message's coach_state stuck/fail) not scoped to pid/day, carried one turn even when current msg is a finding (s30 day10, s33 p5, s36 p4).
2. A191 longStmt over-wide: a27_tour.js:1089/1334 (s30, s31, s34, s36, s38).
3. manyUnknowns = any two «؟»: a27_tour.js:1087 (s36, s37).
4. s32 regression: result «پس اثر هست ولی کوچیک‌تره… پرونده رو بستم» ⇒ phase u (RESULT_RE / solvedSaid).
5. s35: goal-drift gate never fires — liveStepFollowsTag returns p1 on shared «جمع», a38_live.js:1745 needs "rot".
6. s35 p4: NOTKNOW in «نمی‌دونم چطور از اون استفاده کنم» ⇒ stuck-back overrides related-problem difficulty (p3).
7. s36 p3: fail-restate (priority 2) overrides page Q_EQUIV card, and block says «این را بپرس، نه آن را».
8. «هم‌گام با صفحه» label vs card on screen: incubation/mid-check (s34) and sufficiency link card (s37) are not coachCore's page card.
