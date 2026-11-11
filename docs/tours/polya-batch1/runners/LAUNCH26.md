# Round 26 runner brief (common to A, B, C, D and the control run of group B)
Page: /home/user/Lifemanager, main = 1f93c333 (round-25 fixes), dist rebuilt after the merge. Do NOT edit the repo.
Environment (new container): T = <scratchpad>/tour1_polya (restored from git). Python: `export PATH=<scratchpad>/venv/bin:$PATH`.
Playwright for node is global (`require('playwright')` works anywhere; Chromium preinstalled — never run "playwright install").
Read in order: T/RUNNER.md, RUNNER2.md … RUNNER25.md (all ADDENDA), then RUNNER26.md (overrides). Also T/scenarios.md/json,
experiences/two-sided-needs-judging-for-scenario-tours.md (all updates), T/DECISIONS_R25.md (incl. Clarifications C1–C14),
docs/decisions/2026-10-15-sources-roadmap.md §6–§21, docs/decisions/2026-10-18-age-and-user-scope.md, docs/tours/owner-question-bank.md
(41 questions), T/reports/fix25/*.md, the R25 handoff notes, and your group's round-25 report (T/reports/round25X_handback.md,
T/round25X/defects.md).
Replay from round 25 (your group's round25X/ tools, ctl, answers) with your round-25 harness; add new replies only where round-26 rules
require. Output: T/round26X/<sid>/ + round26X/PARTS.md + round26X/defects.md. Every scenario ends with {"exit":true}; findings.md (Bash
heredoc if Write refuses), DONE; e-mails per RUNNER26, link from T/STORYBOARD_LINKS.md.
Save progress as you go: a scenario is finished only when its DONE file exists; if you are interrupted, the round is resumed from the
scenarios without DONE.
ISOLATION (binding — a shared kill pattern destroyed three scenarios in round 25): use your own browser profile directory and your own
port range (A 9300–9349, B 9350–9399, C 9400–9449, D 9450–9499, control 9500–9549); record the PID of every process you start in
round26X/pids.txt and kill ONLY those PIDs; never pkill/killall by name or pattern; delete only your own profiles at the end.
The machine has 4 cores and other runners work in parallel: one browser at a time per runner.
Groups: A = round-25 A set (incl. pwA1, pwA2); B = B set (incl. pwB1, pwB2); C = C set (incl. pwC1, pwC2); D = D set (incl. pwD1, pwD2).
Owner-bank split: A 1–10, B 11–20, C 21–31, D 32–41.
CONTROL RUN of group B: the same brief, the same scenarios, run independently. It writes T/round26B_x/ instead of round26B/, uses the
control port range and profile names with suffix _x, must never read T/round26B/ (and group B must never read round26B_x/), writes
mail.html + mail.subject.txt for every scenario but does NOT send e-mails, and never states in any output file which model or which run
it is.
Final message per RUNNER26.md.
