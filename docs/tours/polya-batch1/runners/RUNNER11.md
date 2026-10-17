# Tour batch 1 (Pólya) — ROUND 11 (read RUNNER.md … RUNNER10.md, then this; this overrides)
Page rebuilt after the round-10 fixes (Lifemanager branch claude/life-program-flow-diagram-q37jvr; built file
apps/learning-architecture/dist/learning-architecture.html — check its mtime is after the merge commit time before you start; if stale, STOP and say so).
What changed since round 10: read /home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R8_live_2026-10-16.md and
_pending_tour1_R8_coach_2026-10-16.md, and tour1_polya/DECISIONS_R8.md. Your round-10 findings: round10<X>/<sid>/ and reports/round10<X>*.md.
Notable intended behaviour changes: liveClosure.state is «review» between «✅ حل شد» and the saved look-back; pod/prove default objective but
the user may change it; coach questions go general→specific by rung (answered ones skipped); unset kind ⇒ neutral frame.
Use dir round11<X>/<sid>. Same STRICT rule (only page/prompt-enforced behaviour passes; literal average model; model-only ⇒ PARTIAL).
Before blaming the system, suspect your own ignorance: check whether the page already offers the behaviour elsewhere (VIEW_META, the problem
card, the coach block) — a missed feature that exists is not a defect, but a feature the user cannot FIND from the natural path is (class d).
Verify every round-7 or round-8 defect touching your scenarios is fixed end to end, and look hard for regressions and new bugs.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۱۱) · <sid> · <domain> · ✅/⚠️»; first line = result; then "what changed since round 10".
Final message: per scenario RESULT, remaining defects (class a/b/c/d, severity, repro, file:line). Be precise; do not repeat fixed items.
Round-6 specifics (still valid): the model now ends each coaching reply with a {"do":"coach_state",...} action (E1) — as the literal average model, emit it
when the hook asks (that is the realistic case) in MOST turns, and OMIT it in at least one turn per scenario to exercise the regex fallback.
Heuristic gates now WARN and accept «ثبت با همین — دلیل» (E4); check they still challenge once and that the reason is stored.
Territory blocks now need an explicit link or ≥2 distinctive words (E6): report BOTH noise and missing genuinely relevant areas.
Findings files: if your tool refuses to write findings.md, put them into the e-mail and your final message.
Round-11 — the ZERO-DEFECT round (owner 2026-10-16): batch 1 ends only if NO scenario has ANY defect of any class, including cosmetic S3s.
Report every S3 you see, even if the scenario PASSES — a PASS with an S3 note does NOT end the batch. Be thorough and honest; do not
invent defects either (class d = your own mistake). What changed since round 10 (DECISIONS_R10.md; handoffs _pending_tour1_R10_*):
one turn question per block via a single priority (A073 «فقط جواب» with no attempt > guess test > refutation > A044 > C107 > A263 >
«چرا» > A191 > list), every other Pólya line marked «زمینه (نه پرسشِ دوم)» with no «بپرس»; guesses without «؟» («شاید/به نظرم/حس می‌کنم»);
A167 vs A129; A191 only on a problem-introducing message; «مطمئنی درسته؟» ⇒ check against each part of the condition; live_new confirms
in chat and opens the problem; «ثانیه» territory fixed; lpBBest whole questions + dedupe; data-use gate warns (no block) and «دو بچه»⇄«دوفرزندی».
Also scan every prompt you send for >1 unmarked question directive (like round10D/scan.txt) and report any.
