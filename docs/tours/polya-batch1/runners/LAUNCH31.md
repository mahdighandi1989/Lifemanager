# Round 31 runner brief (common to A, B, C, D)
Page: /home/user/Lifemanager, main = MAINHASH (round-30 fixes), dist rebuilt after the merge. Do NOT edit the repo.
Environment: T = <scratchpad>/tour1_polya. Python: `export PATH=<scratchpad>/venv/bin:$PATH`.
Playwright for node is global (`require('playwright')` works anywhere; Chromium preinstalled — never run "playwright install").
Read in order: T/RUNNER.md, RUNNER2.md … RUNNER30.md (all ADDENDA), then RUNNER31.md (overrides). Also T/scenarios.md/json,
experiences/two-sided-needs-judging-for-scenario-tours.md (all updates), T/DECISIONS_R30.md (incl. C177–C200; C1–C176 still bind), T/corpus30/,
T/COMPARE26_result.md (why the three compensations), docs/decisions/2026-10-15-sources-roadmap.md §6–§21,
docs/decisions/2026-10-18-age-and-user-scope.md, docs/tours/owner-question-bank.md (117 questions), T/reports/fix30/*.md, the R30
handoff notes, your group's round-30 report (T/reports/round30X_handback.md, T/round30X/defects.md) and, for group B, the blind
U-table in T/COMPARE26_judge.md.
Replay from round 30 (your group's round30X/ tools, ctl, answers) with your round-30 harness; add new replies only where round-31 rules
require. Output: T/round31X/<sid>/ + round31X/PARTS.md + round31X/defects.md. Every scenario ends with {"exit":true}; findings.md (UTF-8,
checked), DONE; e-mails per RUNNER31, link from T/STORYBOARD_LINKS.md.
Save progress as you go: a scenario is finished only when its DONE file exists; if you are interrupted, the round is resumed from the
scenarios without DONE.
ISOLATION (binding): your own browser profile directory and port range (A 9300–9349, B 9350–9399, C 9400–9449, D 9450–9499); record
the PID of every process you start in round31X/pids.txt and kill ONLY those PIDs; never pkill/killall by name or pattern; delete only
your own profiles at the end. The machine has 4 cores and other runners work in parallel: one browser at a time per runner.
Groups: A = round-30 A set; B = B set; C = C set; D = D set. No control run this round. Owner-bank split: per RUNNER31 §9.
Final message per RUNNER31.md.
