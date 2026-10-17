# Tour batch 1 (Pólya) — ROUND 7 (read RUNNER.md … RUNNER6.md, then this; this overrides)
Page rebuilt after the round-6 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 6: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R6_live_2026-10-16.md and
_pending_tour1_R6_coach_2026-10-16.md, and tour1_polya/DECISIONS_R6.md. Your round-6 findings: round6<X>/<sid>/ and reports/round6<X>*.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round7<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-6 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۷) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 6".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
Round-6 specifics (still valid): the model now ends each coaching reply with a {"do":"coach_state",...} action (E1) — as the literal average model, emit it
when the hook asks (that is the realistic case) in MOST turns, and OMIT it in at least one turn per scenario to exercise the regex fallback.
Heuristic gates now WARN and accept «ثبت با همین — دلیل» (E4); check they still challenge once and that the reason is stored.
Territory blocks now need an explicit link or ≥2 distinctive words (E6): report BOTH noise and missing genuinely relevant areas.
Findings files: if your tool refuses to write findings.md, put them into the e-mail and your final message.
Round-7 additions: the turn question now follows a refined priority — this turn's act (guess «…درسته؟» ⇒ «چطور می‌آزمایی‌اش؟», result,
analogy, related «نمی‌دونم چطور از X استفاده کنم», abandon) → specific page cards (equations verdict, equivalence, sufficiency, incubation,
mid-course, presupposition, set-aside datum) → stuck (unused data in plan ⇒ «همهٔ داده‌ها؟»; all used ⇒ backwards; restate only after a
failed step) → page card → ladder. Turn signals last one turn and are per problem. F6 lines fire only at their moment. Check especially the
s26-type case: stuck on the equations card must keep the card's specific question.
The handoff for this round also has an addendum (_pending_tour1_R6_coach…: "R6 coach follow-ups").
This round again decides whether batch 1 ends.
