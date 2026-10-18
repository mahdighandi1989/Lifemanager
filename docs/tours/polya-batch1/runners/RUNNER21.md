# Tour batch 1 (Pólya) — ROUND 21 (read RUNNER.md … RUNNER20.md incl. RUNNER16's ADDENDUM and RUNNER20's 19c ADDENDUM, then this; this overrides)

Page rebuilt after the round-20 fixes (main at the R20 merge or later; `build.py --check` in sync and the dist newer than it — else STOP).
What changed: tour1_polya/DECISIONS_R20.md + handoff notes docs/overhaul/handoff-notes/_pending_tour1_R20_{coach,live,practice,routing}_*.md.
- Correction by FACT: every derived record carries src {sess, msg, span, key}; a correction changes only records whose span holds the
  corrected fragment or whose key the model reports (coach_state.retract {msg, what, fix, key?, old?}); the corrected content is booked
  again; a verdict changes only if a datum it used changed; withdrawn ≠ deleted. Copies she typed herself on the page ⇒ the page asks
  once «این‌جا هم عوض شود؟» with both values. Matching is by normalized whole words; only the minimal span is replaced.
- The assistant may only state what the page's result block «# اصلاحی که صفحه انجام داد/نپذیرفت» confirms; a refusal is shown in one line.
- ✏️ is a system-origin turn (no fallback, no evidence booking except one self-correction event); visible editor in both themes.
- One event log (APP.EVLOG) feeds «📜 پروندهٔ کامل», ordered by event time; a dossier also for sessions without a live problem.
- Practice: one act → one record / one Today line (case owns the 1-3-7 cycle and linked 🔭/cards); T24 two-stage (🎯 dated when
  written); «📌 همان برنامه؟» links plan ⇄ step ⇄ 🌱; built-in routines only after she starts them; start_practice needs a quoted consent;
  practice_log; mind card one row per case, `stableOff`.
- Page compensations: «# وضعِ کنونی» line; «آیا این پیام نتیجهٔ گامِ N است؟»; one rewrite request when the reply asks two questions,
  confirms «حل شد», claims a change before the page result, or flips register; chat_invent only on her request; a problem created on her
  request opens.
- ROUTING: coaching turns are sent with task «lla_coach» (balanced tier), action-only / automatic follow-ups with «lla_assistant».

REQUIRED THIS ROUND (all of RUNNER20 1–4 + 19c addendum still apply; the bar only rises):
1. CORRECTION TRIALS — in EVERY scenario that ran them in round 20 (same turns where possible) plus at least one new scenario per group:
   1, 3 and 5+ turns back; once in chat, once with ✏️; at least one correction of a value she ALSO typed herself on a page form (expect
   «این‌جا هم عوض شود؟»); at least one correction of a sentence holding TWO facts where only one changes (the other must stay); at least one
   correction that does NOT affect a verdict (verdict must stay) and one that does (verdict set aside with the reason); one non-correction
   («اشتباه کردم» about a real action, quoting someone else, a question) that must change nothing. Before/after shots of every derived
   record (problem fields, guess, plan + Today, step, verdict, lesson + card, deadline, mind card «از کجا؟», dossier). Report «## آزمودنِ اصلاح»
   per scenario with a per-trial table: turns back / path / what should change / what did / what must stay / did it / assistant's words
   vs page result. Compare with that scenario's round-20 trial (round20X/<sid>/findings.md).
2. DOSSIER — at the end of every scenario open «📜 پروندهٔ کامل» (or «📜 پروندهٔ این گفت‌وگو» if no live problem); judge completeness,
   event order (event time, not save time), status, «منبع» lines, no raw ids/ISO, and agreement with the mind card.
3. PARTS — PARTS.md as round 20, plus a column «نسبت به دورِ ۲۰» (better / same / worse, with evidence) for every part that appeared in
   round20<X>/PARTS.md. Shots `part_<name>_<n>.png`; for parts that changed, shoot the same state as the round-20 shot so the storyboard
   can show before/after.
4. TIME + PRACTICE — every scenario with a longitudinal element starts a practice case from her own words (consent quoted), moves the
   clock (day 1, 3, 7, 21; one lateness, one forgotten recall, one regression), logs at least one session through chat (practice_log) and
   one through the page; judge: exactly one Today line per act per day, the linked 🔭/card/plan follow, stability declared only on dated
   evidence, the mind card's case row, the dossier's practice events.
5. ROUTING EVIDENCE — the harness request (ai/pN.json) carries the task; record per turn task ∈ {lla_coach, lla_assistant} and judge it:
   every coaching turn (live problem in focus, tour coaching, look-back, deep/ill-posed/life problem talk) must be lla_coach; action-only
   commands, ✏️ turns and automatic «[سامانه: …]» follow-ups must be lla_assistant. Table per scenario: turn / kind / task / correct?
Everything else as RUNNER20: harness5 (or your harness6), settle before shots, view_pre/post, ZERO-DEFECT, the two need maps, «ارتقای لازم»,
mind card plausibility, strict prompt scan, coach_state omitted ≥1 turn, e-mails «🧭 پولیا · دورِ ۲۱ · …» with storyboard links, round21<X>/<sid>/,
DONE per scenario, never pkill others, delete your profiles, mark every seeded record as test data.
Final message: per scenario RESULT + defects (class, severity, repro, file:line) + «ارتقای لازم» + correction-trial table + routing table +
PARTS.md summary with the «نسبت به دورِ ۲۰» column.
