# Tour batch 1 (Pólya) — ROUND 12 (read RUNNER.md … RUNNER11.md, then this; this overrides)
Page rebuilt after the round-11 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 11: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R8_live_2026-10-16.md and
_pending_tour1_R8_coach_2026-10-16.md, and tour1_polya/DECISIONS_R8.md. Your round-11 findings: round11<X>/<sid>/ and reports/round11<X>*.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round12<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-7 or round-8 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۱۲) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 11".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
Round-6 specifics (still valid): the model now ends each coaching reply with a {"do":"coach_state",...} action (E1) — as the literal average model, emit it
when the hook asks (that is the realistic case) in MOST turns, and OMIT it in at least one turn per scenario to exercise the regex fallback.
Heuristic gates now WARN and accept «ثبت با همین — دلیل» (E4); check they still challenge once and that the reason is stored.
Territory blocks now need an explicit link or ≥2 distinctive words (E6): report BOTH noise and missing genuinely relevant areas.
Findings files: if your tool refuses to write findings.md, put them into the e-mail and your final message.
Round-12 — ZERO-DEFECT round 3 (owner: batch 1 ends only if NO scenario has ANY defect of any class, S3 included; report every S3 even on
a PASS; do not invent defects). What changed since round 11 (DECISIONS_R11.md; handoffs _pending_tour1_R11_*): EVERY directive line in every
hook block (coach, live, related-solved, open-problem, teacher frame, generic claim rule, stage profile, proverb, 🌱) is the turn question or
«زمینه (نه پرسشِ دوم)» with no «بپرس»; related-solved recall / open-problem continuation / A167t are moments in the priority; guesses at any
ending («به نظرم/شاید/فکر کنم …»); «فقط جواب» family; neutral header when the judge is unset; no repeated proverb; relevant territory areas via
explicit moment links (hypothesis testing, induction, cognitive biases, negotiation); «یه مسئلهٔ واقعی دارم: …» is a new problem; «X رو بلدم
ولی نمی‌دونم ربطش چیه» is the related moment; «کدام پرسش کمک کرد؟» whole questions; soft-gate card separate from hard items.
Scan every prompt for >1 unmarked question directive and report any. Use harness3.js (with the Drive stub), not harness.js. Never pkill
processes you did not start.
