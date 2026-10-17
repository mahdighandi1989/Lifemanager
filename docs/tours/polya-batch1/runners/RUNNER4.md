# Tour batch 1 (Pólya) — ROUND 4 (read RUNNER.md, RUNNER2.md, RUNNER3.md, then this; this overrides)
Page rebuilt after the round-3 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 3: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R3_live_2026-10-16.md and
_pending_tour1_R3_coach_2026-10-16.md, and tour1_polya/DECISIONS_R3.md. Your round-3 findings: round3<X>/<sid>/ and reports/round3<X>.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round4<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-3 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۴) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 3".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
