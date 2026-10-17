# Model-tier tour (roadmap §11) — runs alongside round 20

Goal: measure how the page behaves when the assistant's replies come from a REAL lighter model instead of a runner role-playing "the
literal average model". Production uses the `lla_assistant` route with a «fast/cheap» preference (app/services/ai/catalog.py), so the
real model is likely weaker than the runners.

Scenarios: s03 s10 s18 s19 s25 s29 s31 s38 (deep + math + life + multi-day). Same page, same harness5, same user turns as round 19
(round19X/<sid>/ctl). For EVERY assistant turn: take the exact prompt the page built (harness ai/pN.json), give it — and nothing else —
to a lighter model via the Agent tool with model "haiku" (tier 1) and, for the same turn in a second pass, model "sonnet" (tier 2);
paste the model's raw reply back unchanged (no fixing, no rewriting). If the Agent tool is not available to you, STOP and report that.

Measure per tier, per scenario and in total:
- coach_state: present / valid JSON / fields valid under the page's validation (the page's own accept/refuse logs) / fields hallucinated.
- one question per turn; 🔭 offer-only rule; no second unmarked directive followed.
- reported guess/plan/step/retract/result matching her actual words.
- `$…$` use when the formula line is present; Persian quality (register kept, no Latin leakage, no garbled bidi).
- scenario success by the need maps (same judge rules as RUNNER20), and the mind card plausibility.
Write tour1_polya/models20/<tier>/<sid>/findings.md and a summary table tour1_polya/models20/SUMMARY.md: per tier — rates, the failure
classes, and for each class whether the PAGE can compensate (validation, shorter/structured prompt, re-ask) or the data says coaching
turns need a stronger tier. Do NOT judge the tier by guesswork; only by counted evidence.
