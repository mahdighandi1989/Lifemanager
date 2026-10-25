# Round-25 model comparison — independent judge brief (Opus)
Inputs: tour1_polya/round25B/ (runner on Opus) and tour1_polya/round25B_s/ (runner on Sonnet), same page (main 64dc0667), same scenarios,
same brief, run independently. Fixed decision rule (owner-approved, docs/tours/polya-batch1/STATE.md): Sonnet replaces Opus as RUNNER only if it
misses no S1/S2 defect and its missed S3 count is not higher than Opus's own misses in the same comparison; otherwise Opus stays. Main session,
fixers and root-cause decisions stay on Opus regardless. One group is a small sample: if the result is borderline, say so (repeat in round 26).
Do:
1. Build the union of defects from both runs (defects.md + every <sid>/findings.md). Match the same defect across runs by meaning and turn (p<N>).
2. For every defect found by only ONE run, verify it yourself from the evidence (ai/pN.json, rN.txt, screenshots, page outcome): real or not,
   and the correct severity. Never trust either runner's word.
3. Per run: real defects found, real defects missed (by severity), false defects reported, scenario verdict accuracy, round-24 FIXED/STILL
   table accuracy, quality of «ارتقای لازم» and better/rN.txt, brief compliance (p<N> on lines, shots, ai/ kept, five territory arms, prior-work
   table, owner-bank table), and token/time if known.
4. Apply the decision rule mechanically and write the verdict.
Output: tour1_polya/COMPARE25_result.md (tables + verdict + borderline note) and reply with the summary table and verdict only.
Known run interference (record it in the result and weigh it): B_s's kill.sh pattern matched B's drivers and killed B's s11, s14 and s15
mid-run (B re-ran them with drv25b.py); B's early reset/fin calls may have killed a B_s driver once (round25B/notes.md). Check round25B_s/notes.md
for the same, and judge only completed scenarios; a scenario disturbed by the other run is compared only if it was re-run cleanly.
