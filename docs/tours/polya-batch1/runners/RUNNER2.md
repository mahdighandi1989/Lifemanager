# Tour batch 1 (Pólya) — RE-RUN after fixes (read RUNNER.md first; this overrides where it differs)

The page was rebuilt at commit 7c21993 with fixes for every defect of the first run (reports in reports/runA–D.md; fix notes in
/home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_F1_2026-10-15.md, _F2_, _F3_). Read those notes to know what changed.
Use your OWN new scenario dir: <YOUR_DIR> = tour1_polya/rerun<X>/<sid>. Re-run your scenarios fully (same scripts).

STRICTER RULE this round: a criterion PASSES only if the PAGE itself (its cards, gates, checks, reminders, records, Today, mind card,
factory) or the system/hook prompt it sends the model ENFORCES or clearly REQUIRES the behaviour. When you play the model, answer as a
literal, average model would from the prompt given — do NOT add good Pólya behaviour the prompt does not ask for. If a behaviour came only
from your own good judgement as the model, mark it PARTIAL with reason "model-only".
Also verify each fix that touches your scenarios actually works end to end, and look for regressions.
E-mail subject: «🧭 تورِ پولیا (دستهٔ ۱ · دورِ ۲) · <sid> · <domain> · ✅/⚠️»; first line = result; then what changed since round 1.
Final message: per scenario RESULT (PASS/PARTIAL/FAIL), every remaining defect with class (a/b/c/d), severity, repro, file:line.
