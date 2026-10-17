# Tour batch 1 (Pólya) — ROUND 13 (read RUNNER.md … RUNNER12.md, then this; this overrides)
Page rebuilt after the round-12 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 12: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R8_live_2026-10-16.md and
_pending_tour1_R8_coach_2026-10-16.md, and tour1_polya/DECISIONS_R8.md. Your round-12 findings: round12<X>/<sid>/ and reports/round12<X>*.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round13<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-7 or round-8 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۱۳) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 12".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
Round-6 specifics (still valid): the model now ends each coaching reply with a {"do":"coach_state",...} action (E1) — as the literal average model, emit it
when the hook asks (that is the realistic case) in MOST turns, and OMIT it in at least one turn per scenario to exercise the regex fallback.
Heuristic gates now WARN and accept «ثبت با همین — دلیل» (E4); check they still challenge once and that the reason is stored.
Territory blocks now need an explicit link or ≥2 distinctive words (E6): report BOTH noise and missing genuinely relevant areas.
Findings files: if your tool refuses to write findings.md, put them into the e-mail and your final message.
Round-13 — ZERO-DEFECT round 4 (owner: batch 1 ends only if NO scenario has ANY defect of any class; report every S3 even on a PASS; do not
invent defects). What changed since round 12 (DECISIONS_R12.md; handoffs _pending_tour1_R12_*): guess = ONE untested tentative claim about
the problem's object — conditionals, self-cancelled hedges, verdicts after his own check («حل شد/منطقیه»), his own chosen step, candidate
definitions / «نمی‌دونم کدوم», «امتحان کردم… چطور ثابتش کنم؟» are NOT guesses (definition ⇒ «به تعریف‌ها برگرد»; tested+proof ⇒ proof
question); the structural rule now covers the WHOLE prompt (sieve, idea, 🌱/WILL_RULES, imaginary-teacher, objective frame, silence rule,
«# امروز») with only the tour SAFETY line allowed; idea_counter chat notes written for the user; whole-first card = page question in phase u;
incubation card not asked when the message reports the idea; «کدام پرسش کمک کرد؟» only this problem's questions, multi-sentence page questions
as one option; counter-proverb not repeated; «معلومه/واضحه/بدیهیه» ⇒ untested-certainty; post-close «نمی‌دونم» ⇒ his own lesson; statistics
territory via explicit cues; off-page list follows the problem's phase.
Scan every prompt for >1 unmarked question directive and report any. Use harness3.js. Never pkill processes you did not start. Keep scratch small.
