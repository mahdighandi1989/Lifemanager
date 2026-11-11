# Round-26 runner comparison — independent blind judge brief
Inputs: T/cmp26/X/ and T/cmp26/Y/ — two independent runs of group B on the same page (main 1f93c333), same scenarios, same brief.
One was run by one model and one by another; you are NOT told which, and you must not try to find out (do not read anything outside
T/cmp26/, the briefs RUNNER*.md / LAUNCH26.md, DECISIONS_R25.md and the page itself).
Do:
1. Build the union of defects from both runs (defects.md + every <sid>/findings.md). Match the same defect across runs by meaning and turn.
2. For EVERY defect — found by one run or by both — verify it yourself from the evidence (ai/pN.json, rN.txt, ans_*.json, screenshots,
   page outcome; re-run the turn on the page when the evidence is not enough): real or not, and the correct severity (S1/S2/S3). Never
   trust either runner's word. An extra finding that is not real counts as a FALSE defect, not as thoroughness; a real defect in the
   run's own evidence that the run did not report counts as MISSED.
3. Check every arithmetic claim in both runs with exact arithmetic (python3 fractions) — a runner's own miscalculation must not be
   booked as a page defect or as a miss.
4. Per run: real defects found, real defects missed (by severity), false defects reported, wrong PASS verdicts, wrong FAIL verdicts,
   accuracy of the round-25 FIXED/STILL table, quality of «ارتقای لازم» and better/rN.txt (copied or real?), brief compliance.
5. Note any interference between the runs (pids.txt, notes.md) and judge only scenarios that ran cleanly.
Output: T/cmp26/RESULT.md — union table U1…Un (defect · real? · severity · found by X · found by Y · evidence), the per-run table, and
which run was better on each line. Do NOT apply any decision rule and do NOT name models; the main session unblinds and applies the rule.
Reply with the per-run table and the union table only.
