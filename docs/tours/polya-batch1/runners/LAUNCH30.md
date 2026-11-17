# Round 30 runner brief (common to A, B, C, D)
Page: /home/user/Lifemanager, main = MAINHASH (round-29 fixes), dist rebuilt after the merge. Do NOT edit the repo.
Environment: T = <scratchpad>/tour1_polya. Python: `export PATH=<scratchpad>/venv/bin:$PATH`.
Playwright for node is global (`require('playwright')` works anywhere; Chromium preinstalled — never run "playwright install").
Read in order: T/RUNNER.md, RUNNER2.md … RUNNER29.md (all ADDENDA), then RUNNER30.md (overrides). Also T/scenarios.md/json,
experiences/two-sided-needs-judging-for-scenario-tours.md (all updates), T/DECISIONS_R29.md (incl. C136–C176; C1–C135 still bind),
T/COMPARE26_result.md (why the three compensations), docs/decisions/2026-10-15-sources-roadmap.md §6–§21,
docs/decisions/2026-10-18-age-and-user-scope.md, docs/tours/owner-question-bank.md (97 questions), T/reports/fix29/*.md, the R29
handoff notes, your group's round-29 report (T/reports/round29X_handback.md, T/round29X/defects.md) and, for group B, the blind
U-table in T/COMPARE26_judge.md.
Replay from round 29 (your group's round29X/ tools, ctl, answers) with your round-29 harness; add new replies only where round-30 rules
require. Output: T/round30X/<sid>/ + round30X/PARTS.md + round30X/defects.md. Every scenario ends with {"exit":true}; findings.md (UTF-8,
checked), DONE; e-mails per RUNNER30, link from T/STORYBOARD_LINKS.md.
Save progress as you go: a scenario is finished only when its DONE file exists; if you are interrupted, the round is resumed from the
scenarios without DONE.
ISOLATION (binding): your own browser profile directory and port range (A 9300–9349, B 9350–9399, C 9400–9449, D 9450–9499); record
the PID of every process you start in round30X/pids.txt and kill ONLY those PIDs; never pkill/killall by name or pattern; delete only
your own profiles at the end. The machine has 4 cores and other runners work in parallel: one browser at a time per runner.
Groups: A = round-29 A set; B = B set; C = C set; D = D set. No control run this round. Owner-bank split: per RUNNER30 §6.
Final message per RUNNER30.md.
