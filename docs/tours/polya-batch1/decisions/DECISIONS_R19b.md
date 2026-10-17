# Round-19b — infrastructure built BEFORE round 20 so round 20 tests it (main session; binding)

Owner 2026-10-17: correcting an earlier message must be tried in the tour; one place to see a problem's whole journey; the mind card
stays aggregate but traceable; every part judged on five axes with shots (roadmap §12). Built on top of the merged round-19 fixes
(b889b855). DECISIONS_R2–R19 bind.

INF15 — CORRECTING AN EARLIER MESSAGE (any distance back).
  Model side (coach, a27): coach_state.retract {msg: "<verbatim fragment of the earlier user message>", what: "guess|plan|step|ans|
  said|fact|form", fix: "<the corrected content, verbatim from the current message>"} — reported only when the user corrects
  herself («اشتباه گفتم/نوشتم»، «منظورم … بود»، «نه، … درسته»، «اون … رو اصلاح کن»). Page validates: the fragment occurs in an EARLIER
  user message of this session; the current user message carries the fix text and a correction signal; then it reverses every record
  derived from that message and applies the fix: validated guess (problem g and coach.guess), plan, step outcome (via a38), stored
  said/ans evidence, promises, forms filled by assistant actions from that turn, live-problem fields written from it. Records must carry
  their source message id (add it where missing; RN2e act ids). The assistant is told, as context, exactly what changed, and says it
  in one line. Mind card: the derived events of the wrong message are withdrawn; a self-correction is look-back evidence, never a failure.
  Fallback (no coach_state): a correction-signal pattern may only ASK «کدام را اصلاح کنم؟» with the candidates; never reverses alone.
  Page side (live, a38 + a26 bubble): «✏️ اصلاح» on her own bubbles opens a small editor; saving sends «[اصلاحِ پیامِ قبلی] …» as a
  user turn and applies the same reversal path directly (the user is the authority; no model needed). Records are never deleted:
  the old value is kept as history with «اصلاح شد ⇐».
INF16 — «📜 پروندهٔ کامل» (a38 + a new small view if needed, registered in VIEW_META with labelled fields per AGENTS.md).
  Per problem: one chronological read-only page derived from the records — statement, every stage with forms as filled (and their
  history incl. corrections), the chat messages that fed them (linked to the session), guesses/plans/steps with outcomes, check
  verdicts, look-back, and the mind-card events each act produced. Formulas rendered. An all-work index (problems, ideas, factory
  cases, sessions) sorted by last activity. Print/export (Markdown/HTML) of one dossier. Entry points: from the problem page header,
  from the assistant session, from the mind card timeline.
INF17 — MIND CARD CONTRIBUTION (a29). Aggregate stays. Each ability/stage row gets «از کجا؟»: the list of acts (source record + date +
  +/−) that moved it, linked to the dossier; acts counted once (RN2e).

Variant bank: VARIANTS_R19b (independent, no code): INF15 corrections 1, 3, 5+ turns back across guess/plan/step/ans/fact/form, in
math and life problems; confusable negatives («اشتباه کردم» about a real-world action, a new idea that is not a correction, quoting
someone else's mistake, correcting the assistant not herself); INF17 traceability; INF16 completeness checks.

Fixers: coach (a27/a29): INF15 model side + fallback ask + mind-card withdrawal, INF17. live (a38 + a26 bubble button only): INF15 page
side + ✏️ + reversal API used by coach, INF16. Same proof rules as DECISIONS_R19. Docs numbering: coach WORKLOG (75)/PROGRESS 91, live
(76)/92.
