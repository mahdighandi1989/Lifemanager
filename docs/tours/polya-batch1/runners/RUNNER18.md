# Tour batch 1 (Pólya) — ROUND 18 (read RUNNER.md … RUNNER17.md incl. RUNNER16's ADDENDUM, then this; this overrides)

Page rebuilt after the round-17 fixes (branch claude/life-program-flow-diagram-q37jvr, 204585c1 or later; `build.py --check` in sync and
the dist mtime after it — else STOP). What changed (tour1_polya/DECISIONS_R17.md, handoff notes _pending_tour1_R17_{coach,live,math}_*.md):
- Semantic facts are now REPORTED BY THE MODEL in coach_state and validated by the page: plan {text,when}, defer {what},
  taste {text}|"unknown", register "تو"|"شما", guess {text}, check {msgs:[…]}. Keyword patterns only add conditional lines, never store.
  As the literal average model, fill these fields when — and only when — the user's message really contains them (and omit coach_state
  in ≥1 turn per scenario as before).
- One modality per action in the prompt (🔭: offer only, create on her yes).
- «کدام پرسش کمک کرد؟»: chat-closed problems end at closure; look-back meta questions are never options; guess notes only from a guess
  quoted in the same message (or the turn's validated coach_state.guess); verbless heads dropped; declared repeats merge.
- NEW TOOL: formulas render as math in chat (`$…$` or plain ASCII math like 1/((n+1)(n+2))) and as a live preview under the problem's
  statement and step fields. Use it in the numeric/proof scenarios (s02 s03 s10 s11 s17 s18 s21 s24 s25 s26 s28 s29 s31 s36) where a real
  user would type a formula; judge whether it renders correctly and whether anything that is NOT math got converted.

Harness: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/harness5.js (waits for the page to settle
before each shot; at start and at {"exit":true} it also saves full-page shots of the scenario user's «🧠 کارنامهٔ ذهن», «🗺 نقشه‌ها» and
«امروز» as out/view_pre_*.png / view_post_*.png). Make sure every scenario ENDS with a {"exit":true} control so the "after" shots exist.

ZERO-DEFECT round 9. Judge by the written criteria AND the two need maps («## نقشهٔ نیاز»). NEW section required in every findings.md:
«## ارتقای لازم» — tools/infrastructure the part or the person needed and the system lacks (not defects of existing behaviour), each
with one line on the need it serves. Also look at the before/after mind report card: is the change plausible for what happened in the
scenario (e.g. a hard problem solved leaves a sign; nothing invented)? Report anything implausible as a defect.
Look hard for regressions of the round-17 changes (fields stored without evidence, missing stores where the model reported correctly,
register flips, guess notes on the wrong option, math converting non-math). Strict prompt scan as before.
Write <sid>/DONE per scenario; findings.md starts with «## خلاصه برای مالک». E-mails: RUNNER16 structure, subject «🧭 پولیا · دورِ ۱۸ · …»,
storyboard links in tour1_polya/STORYBOARD_LINKS.md. Use dir round18<X>/<sid>. Never pkill processes you did not start; disk is tight.
Final message: per scenario RESULT + remaining defects (class a/b/c/d, severity, repro, file:line) + the «ارتقای لازم» items.
