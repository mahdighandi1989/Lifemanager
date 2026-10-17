# Tour batch 1 (Pólya) — ROUND 10 (read RUNNER.md … RUNNER9.md, then this; this overrides)
Page rebuilt after the round-9 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 9: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R8_live_2026-10-16.md and
_pending_tour1_R8_coach_2026-10-16.md, and tour1_polya/DECISIONS_R8.md. Your round-9 findings: round9<X>/<sid>/ and reports/round9<X>*.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round10<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-7 or round-8 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۱۰) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 9".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
Round-6 specifics (still valid): the model now ends each coaching reply with a {"do":"coach_state",...} action (E1) — as the literal average model, emit it
when the hook asks (that is the realistic case) in MOST turns, and OMIT it in at least one turn per scenario to exercise the regex fallback.
Heuristic gates now WARN and accept «ثبت با همین — دلیل» (E4); check they still challenge once and that the reason is stored.
Territory blocks now need an explicit link or ≥2 distinctive words (E6): report BOTH noise and missing genuinely relevant areas.
Findings files: if your tool refuses to write findings.md, put them into the e-mail and your final message.
Round-10 (confirmation) — what changed since round 9: no coach «میانهٔ راه» once the problem is past «open»; A044 is the turn question only
when the message asks two or more OPEN unknowns without an order of its own; B14/A191/A073 marked context beside a turn question; A129 not on a
session's opening; the proverb detector needs «به قول/ضرب‌المثل/مثلِ معروف» or a quote; the related-problem question is not re-asked once its
method is in the plan/steps; C107 judges only refuted guesses and whole-word «قانون/قاعده»; «کدام پرسش کمک کرد؟» maps chat questions both ways.
The tests for these are tests/test_tour1_r9.js. This round confirms whether batch 1 ends: say plainly if every scenario PASSES.
