# Round 28 runner brief (common to A, B, C, D)
Page: /home/user/Lifemanager, main = 33f7de9f (round-27 fixes + FIX27B), dist rebuilt after the merge. Do NOT edit the repo.
Environment: T = <scratchpad>/tour1_polya. Python: `export PATH=<scratchpad>/venv/bin:$PATH`.
Playwright for node is global (`require('playwright')` works anywhere; Chromium preinstalled — never run "playwright install").
Read in order: T/RUNNER.md, RUNNER2.md … RUNNER27.md (all ADDENDA), then RUNNER28.md (overrides). Also T/scenarios.md/json,
experiences/two-sided-needs-judging-for-scenario-tours.md (all updates), T/DECISIONS_R27.md (incl. Clarifications C40–C83; C1–C39 still bind),
T/COMPARE26_result.md (why the three compensations), docs/decisions/2026-10-15-sources-roadmap.md §6–§21,
docs/decisions/2026-10-18-age-and-user-scope.md, docs/tours/owner-question-bank.md (63 questions), T/reports/fix27/*.md and fix27b/*.md, the R27 and R27B
handoff notes, your group's round-27 report (T/reports/round27X_handback.md, T/round27X/defects.md) and, for group B, the blind
U-table in T/COMPARE26_judge.md.
Replay from round 27 (your group's round27X/ tools, ctl, answers) with your round-27 harness; add new replies only where round-28 rules
require. Output: T/round28X/<sid>/ + round28X/PARTS.md + round28X/defects.md. Every scenario ends with {"exit":true}; findings.md (UTF-8,
checked), DONE; e-mails per RUNNER28, link from T/STORYBOARD_LINKS.md.
Save progress as you go: a scenario is finished only when its DONE file exists; if you are interrupted, the round is resumed from the
scenarios without DONE.
ISOLATION (binding): your own browser profile directory and port range (A 9300–9349, B 9350–9399, C 9400–9449, D 9450–9499); record
the PID of every process you start in round28X/pids.txt and kill ONLY those PIDs; never pkill/killall by name or pattern; delete only
your own profiles at the end. The machine has 4 cores and other runners work in parallel: one browser at a time per runner.
Groups: A = round-27 A set; B = B set; C = C set; D = D set. Owner-bank split: A 1–10 + 42–44 + 54–56, B 11–20 + 45–47 + 57–59, C 21–31 + 48–50 + 60–61,
D 32–41 + 51–53 + 62–63. No control run this round.
Final message per RUNNER28.md.
