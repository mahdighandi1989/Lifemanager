# Tour batch 1 (Pólya) — ROUND 20 (read RUNNER.md … RUNNER19.md incl. RUNNER16's ADDENDUM, then this; this overrides)

Page rebuilt after the round-19 fixes AND round-19b infrastructure (branch claude/life-program-flow-diagram-q37jvr at 60d94930 or
later; `build.py --check` in sync and the dist newer than it — else STOP). What changed: tour1_polya/DECISIONS_R19.md, DECISIONS_R19b.md,
handoff notes docs/overhaul/handoff-notes/_pending_tour1_R19_*.md and _pending_tour1_R19b_*.md.
- R19: deferred-request candidates only when the reply to THAT message omitted coach_state and the message is a real request; chat
  step reports apply at once (form prefilled «از گفت‌وگو»); gate wording per item kind; guess kit prefilled from a chat guess; plans
  linked to live steps and guesses (guess_res, plan.step), plan ids in the prompt; «ضعیف‌ترین» only with evidence; restatement /
  plan_done / plan+result count as successes; «بعدی؟» after closure creates nothing; coach_state.result validates said:result; Today
  plan buttons; math run boundaries (Persian word + number stays text, codes not math, «…», ≈ · ln …); plot axis names + «➕ افزودنِ
  نقطه»; LTR typing in math fields; formulas in saved views.
- R19b NEW: correcting an earlier message — coach_state.retract {msg, what, fix} (fill it, as the literal model, only when she corrects
  HERSELF); «✏️ اصلاح» on her own bubbles; «📜 پروندهٔ کامل» per problem (view `dossier`) + «📚 همهٔ کارها»; mind card «از کجا؟».

REQUIRED THIS ROUND (owner 2026-10-17):
1. CORRECTION TRIALS. In at least two of your scenarios (one math/proof, one life decision), the person corrects an earlier message of
   hers 1 turn, 3 turns and 5+ turns later — once by saying it in chat, once with «✏️ اصلاح». Pick corrections that matter (a datum of
   the problem, a guess, a plan date, a step outcome). Before/after shots of EVERY record derived from the corrected message (problem
   fields, guess, plan + Today, step, verdict, mind card «از کجا؟», dossier). Judge: did everything follow the fix, was nothing deleted
   (history «اصلاح شد ⇐»), did the assistant say exactly what changed, did a non-correction («اشتباه کردم» about a real action, quoting
   someone else) change nothing. Report a section «## آزمودنِ اصلاح» per scenario.
2. DOSSIER. For every scenario that has a live problem, open «📜 پروندهٔ کامل» at the end; shot it (full page, settled) and judge
   completeness and order against what actually happened.
3. PARTS TABLE (roadmap §12). For every part your scenarios touched (problem tunnel and each of its stages, assistant, mind card and its
   tabs, maps, Today, dossier, factory if reached, …) a row: purpose/philosophy (from its own design/HANDBOOK), function, quality/gaps,
   both thirsts, necessity/overlap verdict («یکتا» / «ادغام با X» / «درونِ مسیرِ Y» / «بی‌استفاده»), with evidence. Write it to
   round20<X>/PARTS.md. Shoot each part at work (settled, scrolled into view) and name the shots `part_<name>_<n>.png`.
4. TIME. Where a Pólya element is longitudinal (look-back «نتیجه را جای دیگر به کار ببر», a plan days later, a multi-day return), use
   Playwright's clock (see tests/test_audit_learn.js) to move days forward and judge what the system brought back by itself.
Everything else as RUNNER19: harness5, settle before shots, view_pre/post, ZERO-DEFECT, two need maps, «ارتقای لازم», mind card
plausibility, strict prompt scan, coach_state omitted ≥1 turn, e-mails «🧭 پولیا · دورِ ۲۰ · …» with storyboard links, round20<X>/<sid>/,
DONE, never pkill others, delete your profiles. Mark every record you seed as test data (sample/test flag) so it never enters an owner card.
Final message: per scenario RESULT + defects (class, severity, repro, file:line) + «ارتقای لازم» + the correction-trial verdicts + PARTS.md summary.
