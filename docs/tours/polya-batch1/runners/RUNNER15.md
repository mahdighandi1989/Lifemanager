# Tour batch 1 (Pólya) — ROUND 15 (read RUNNER.md … RUNNER14.md, then this; this overrides)
Page rebuilt after the round-14 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 14: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R8_live_2026-10-16.md and
_pending_tour1_R8_coach_2026-10-16.md, and tour1_polya/DECISIONS_R8.md. Your round-14 findings: round14<X>/<sid>/ and reports/round14<X>*.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round15<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-7 or round-8 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۱۵) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 14".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
Round-6 specifics (still valid): the model now ends each coaching reply with a {"do":"coach_state",...} action (E1) — as the literal average model, emit it
when the hook asks (that is the realistic case) in MOST turns, and OMIT it in at least one turn per scenario to exercise the regex fallback.
Heuristic gates now WARN and accept «ثبت با همین — دلیل» (E4); check they still challenge once and that the reason is stored.
Territory blocks now need an explicit link or ≥2 distinctive words (E6): report BOTH noise and missing genuinely relevant areas.
Findings files: if your tool refuses to write findings.md, put them into the e-mail and your final message.
Round-15 — ZERO-DEFECT round 6 (owner: batch 1 ends only if NO scenario has ANY defect of any class; report every S3 even on a PASS; do not
invent defects). What changed since round 14 (DECISIONS_R14.md; handoff _pending_tour1_R14_2026-10-17.md): «کدام پرسش کمک کرد؟» uses ONE
window rule — from the later of the session start and the end of the previous DIFFERENT subject, to the start of the next different subject
— regardless of how the problem was created; options are always in the assistant's OWN words (the page question is only a key; a
demonstrative before a noun does not join sentences); a chat option equal to a page question she already answered on the page is dropped.
Compare each problem's list carefully with what was actually asked about THAT problem in the conversation.
Scan every prompt for >1 unmarked question directive and report any. Use harness3.js. Never pkill processes you did not start. Keep scratch small.
