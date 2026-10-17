# Tour batch 1 (Pólya) — ROUND 19 (read RUNNER.md … RUNNER18.md incl. RUNNER16's ADDENDUM, then this; this overrides)

Page rebuilt after the round-18 fixes (branch claude/life-program-flow-diagram-q37jvr, 6fbd0377 or later; `build.py --check` in sync and
the dist mtime after it — else STOP). What changed (tour1_polya/DECISIONS_R18.md, handoff notes _pending_tour1_R18_{coach,live,math}_*.md):
- coach_state gains: guess {text, q} (q = the verbatim question in your message that tests her guess — the «(حدسِ تو: …)» note goes ONLY
  on that option; no q ⇒ no note); step {step, done:"yes|part|no", what?, match?, msg} when she reports in chat the outcome of a step
  of her live problem; plan {text, when, same?, on_guess?} + plan_done {id}. As the literal average model, fill a field only when her
  message really contains it; omit coach_state in ≥1 turn per scenario as before.
- Mind card: validated chat successes and live-tunnel saves (plan, gates, auxiliary problem, step → solved, look-back verified, proof)
  count as evidence; a stage with no events reads «هنوز داده‌ای نیست» and is never named weakest. «✅ حل شد» with open steps asks each
  step's outcome (or takes her chat report).
- Plans have a lifecycle (open/done/expired): no follow-up for past dates, no duplicates, «انجام شد؟» once after the date; a plan acting
  on an untested guess gets «اول حدس را بیازما»; dateless self-commitments are reminded next session. Deferred requests survive an
  omitted coach_state (asked, never stored).
- Register is taken from her own words (compound imperatives «ثبت کن», «باورت»، «میگی»، «مطمئنی»); without evidence it stays.
  RESULT_WEAK never moves the phase alone. No phase card after chat_solved without an open problem. No developer notes in prompts.
- Look-back lists: heads that carry the referent stay; a numeric evaluation is not a transformation (linear chains do not raise
  «تبدیل‌ها هم‌ارز بودند؟»); chat-closed windows start at the first user message stating the problem; «پیامِ کامل» next to both selects.
- MATH: options/selects/stored bestQ show plain Unicode (p₁+p₂+p₃, a²b/6), never TeX; Persian digits, ٫ × ÷ ² − ⇒ ≤ ≥ and Persian-letter
  variables inside formulas render; «…» does not split; (10/n)^(n/2), g_EE, τ_I fixed; formula preview under EVERY live-problem field
  and the chat input, with a «∑ فرمول» symbol bar; «# فرمول» line only when the content has math, marked as context; **bold** renders.
- NEW TOOLS: an inline mini plot under a message with a two-column numeric table or a 4+ number series (s07 s19 s20); an 8×8 board under
  a message with a FEN (s21). Use them where a real user would, and judge their quality (correct, readable, nothing non-math plotted).

Harness: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/harness5.js (settles before each shot;
view_pre_* / view_post_* of mind card, maps, Today). Every scenario ENDS with {"exit":true}. When a scenario uses the symbol bar,
preview, plot or board, make sure a shot shows it (scroll it into view first).

ZERO-DEFECT round 10. Judge by the written criteria AND the two need maps («## نقشهٔ نیاز»), «## ارتقای لازم» required, and the
before/after mind card must be plausible (successes now show; nothing invented; no ranking of empty stages). Look hard for regressions of
the round-18 changes (a note missing where q was given, a step outcome stored without her report, a plan follow-up wrongly suppressed,
register stuck, math converting non-math — dates, phone numbers, FEN, prices, snake_case — previews or the symbol bar breaking typing).
Strict prompt scan as before. If the Write tool refuses findings.md, write it with a Bash heredoc (it is a scenario log, not a report).
Write <sid>/DONE per scenario; findings.md starts with «## خلاصه برای مالک». E-mails: RUNNER16 structure, subject «🧭 پولیا · دورِ ۱۹ · …»,
storyboard links in tour1_polya/STORYBOARD_LINKS.md. Use dir round19<X>/<sid>. Never pkill processes you did not start.
Final message: per scenario RESULT + remaining defects (class a/b/c/d, severity, repro, file:line) + the «ارتقای لازم» items.
