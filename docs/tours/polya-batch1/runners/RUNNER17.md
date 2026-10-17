# Tour batch 1 (Pólya) — ROUND 17 (read RUNNER.md … RUNNER16.md incl. its ADDENDUM, then this; this overrides)

Page rebuilt after the round-16 fixes (branch claude/life-program-flow-diagram-q37jvr, merge df3a0071 or later; check
`python3 apps/learning-architecture/build.py --check` says in sync and the dist mtime is after the merge; if stale, STOP and say so).
What changed: tour1_polya/DECISIONS_R16.md and docs/overhaul/handoff-notes/_pending_tour1_R16_live_2026-10-17.md +
_pending_tour1_R16_coach_2026-10-17.md. In short:
- «کدام پرسش کمک کرد؟»: a head before «:» stays unless it is a bare label; «؟» glued inside a word is a mask; two separated question runs
  are two options; options pointing at the guess/unknown carry it in parentheses; own-words repeats collapse; the list refreshes live
  while the look-back is open; prove/pod understanding options use حکم/فرض wording.
- Chat closure asks «کدام پرسش بیشتر کمک کرد» and taste (new `chat_lookback` action; card «بازنگری: دو پرسشِ باقی‌مانده»).
- The live tunnel is offered by meaning (compact rule always present; offer only, never auto-create).
- chat_invent duplicates link the session and store the user's guess as a guess.
- «شما/تو» register kept, page questions rendered in it.
- Deferred requests become session promises; the user's own timed plan gets a follow-up offer (deadline action).
As the literal average model, answer the NEW prompt rules realistically (e.g. emit chat_lookback / promise / deadline when the prompt
asks for them in that turn); where your old reply no longer fits the new rule, write the new reply and say so.

ZERO-DEFECT round 8. Judge by the written criteria AND the two need maps (RUNNER16 ADDENDUM, roadmap §9) — «## نقشهٔ نیاز» in every
findings.md. Look hard for regressions of the new rules (over-merged options, wrong register flips, promises that never clear, offers that
nag, follow-ups with wrong dates). Strict prompt scan as before.
Harness: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/harness4.js (fixed: loop-scope vars, repo dist).
Write <sid>/DONE per scenario; findings.md starts with «## خلاصه برای مالک». E-mails: RUNNER16 structure, subject «🧭 پولیا · دورِ ۱۷ · …»,
storyboard links in tour1_polya/STORYBOARD_LINKS.md. Use dir round17<X>/<sid>. Never pkill processes you did not start; disk is tight.
Final message: per scenario RESULT + remaining defects (class a/b/c/d, severity, repro, file:line).
