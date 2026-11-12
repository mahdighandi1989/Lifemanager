---
title: "Blind paired-run comparison of two evaluator models — and the hole in a pre-set decision rule"
tags: ["evaluation", "model-comparison", "blinding", "pre-registration", "agents"]
topic_canonical: "blind-paired-run-model-comparison"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-12T00:00:00Z"
created_at: "2026-11-12T00:00:00Z"
updated_at: "2026-11-12T00:00:00Z"
merged_from: []
---

# Blind paired-run comparison of two evaluator models

## 🎯 چالش / Challenge
Two models can each run a test campaign (drive scenarios, find defects). Which one should run the next campaign? Comparing their
own summaries is worthless: each reports in the same confident voice, severities differ, and the person comparing knows which is which.

## 💡 راه‌حل / Solution
1. Run both on the SAME build and the SAME scenario set, fully isolated (own ports, own browser profiles, own PID list, neither may
   read the other's folder). The control run performs no outward action (no e-mails).
2. Fix the decision rule BEFORE the runs and write it where it cannot be edited quietly.
3. Blind: copy the two output folders to neutral names by a coin flip from a real random source; keep the mapping outside the judge's
   reach; neutralise folder names and id prefixes inside the copies.
4. An independent judge builds the UNION of defects and verifies each one from primary evidence (prompts, replies, state dumps), and
   re-checks every arithmetic claim exactly. Per run it reports: real found, missed, **not exercised**, false defects, wrong verdicts.
5. Unblind, apply the rule, publish the judge's report unchanged next to the decision.

## 🧪 نمونه کد (Anonymized)
```bash
c=$(python3 -c "import secrets;print(secrets.randbelow(2))")
[ "$c" = 0 ] && { a=run_main; b=run_control; } || { a=run_control; b=run_main; }
cp -a "$a" cmp/X; cp -a "$b" cmp/Y
printf 'X=%s\nY=%s\n' "$a" "$b" > private/key.txt      # outside the judge's allowed paths
grep -rIlE "run_(main|control)" cmp | xargs -r sed -i -E "s#run_(main|control)#RUN#g"
```

## ⚠️ نکات حیاتی / Pitfalls
- **«Missed» and «not exercised» are different failures, and a rule must count both.** A rule that only says «must miss no serious
  defect» punishes the run that explored more (it has more evidence in which to miss something) and is blind to the run that never
  went there. Found in practice: one run found 13 serious defects and missed 1; the other found 8, missed 0, and never exercised 6.
- If the rule turns out to have such a hole, do not bend it silently and do not apply it mechanically either: state the letter, state
  the hole, state the decision as an open deviation, and make it reversible by the owner.
- Each runner improvises the persona's turns, so the two runs diverge; only defects visible in a run's OWN evidence can be «missed».
- Runners rate the same defect with different severities; unify severity by rule before counting.
- One group in one round is a small sample: differences of one or two in the minor class mean nothing.
- The judge is itself a model; blinding removes favouritism, not error. Have it list what it only read and did not re-run.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Same build, same inputs, isolated resources, no shared kill commands.
- [ ] Decision rule written first, with columns for found / missed / not exercised / false.
- [ ] Random assignment to neutral names; mapping stored out of reach; identifiers scrubbed.
- [ ] Judge verifies from primary evidence and recomputes every number exactly.
- [ ] Report the judge's table verbatim; say plainly when the decision departs from the rule.

## 🔗 References
- مرتبط: paired-agent-live-campaign-for-an-in-page-ai, two-sided-needs-judging-for-scenario-tours
