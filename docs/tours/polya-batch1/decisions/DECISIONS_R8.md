# Round-8 decisions (main session; binding) — polish round

Round 8 = 37 PASS / 1 PARTIAL / 0 FAIL (round 7: 34/4/0). Only s02 is PARTIAL. Read reports/round8A_handback.md … round8D_handback.md
(+ round8X/<sid>/findings.md). DECISIONS_R2–R7 still bind. Principle unchanged: one question per turn, the most specific VALID one; any other
Pólya line in the same block is CONTEXT and must say so; detectors that change the turn question need the user's own evidence.

I-live (a38, +a26/a29):
 1. S2 s02 — stuck-name must name a datum the user has NOT used anywhere: skip candidates whose number or distinctive words appear in the user's
    messages on this problem (chat included) or in plan/steps; if none remains, go to the next rung (backwards).
 2. s19 — an unresolved page refusal is the turn question only while it is fresh: same day as the refusal, or until the user's next step/answer;
    after that it becomes context (the user's later statement «برنامه عوض نکردم» resolves the "did you change the plan?" refusal).
 3. s26 — the never-twice-in-a-row rule also covers specific cards: on a second consecutive stuck turn on the same card, escalate within the card
    (name the unused condition part / the specific equation still missing), not repeat it.
 4. s18 — stuck with unused data in execution: «همهٔ داده‌ها؟»/the unused datum by name outranks the 🎯 goal line (goal line becomes context).
 5. s35 — goal gate: a rotation step that ticks a datum/cause linked to the goal is goal-directed (not only word overlap with the unknown).
 6. s17 — OVERCOL_RE adds «باید دقیق‌تر بشه… رو هم دربیارم… از کجا پیدا کنم؟».
 7. s34 — the mid-course one-turn hold is keyed to the next USER message, never a «[سامانه: …]» form-fill turn.
 8. s24 — no internal tag («H2 دورِ ۷، s24») in prompt text; scan a38 prompt strings for «دورِ \d+»/«s\d\d» leaks and remove them from output.
 9. s25/s29 — lpBBest chatQs: keep the question head («مجهول دقیقاً چیست —», «و آن از چه…» tail rules).
10. s05 — life-pod plan hint without «داده و مجهول» wording.
I-coach (a27, a28, a35, a36, a37):
 1. s25 p8 — the header/list switch must also apply when o.qs is passed from a closed bound problem (new guess after a closed problem ⇒ «فهم»
    list + no «از نخستین پرسشِ بازنگری» / A284 / mushroom / look-back lines); s12 — refutation turn while ph is «u» ⇒ «طرح» list (not u1 again).
 2. s22 — refutation turn: one «از ردش چه آموخت» line only (dedupe a27 refuted line vs B231); C107 «دامنه‌اش را تنگ کن» only when the refuted claim
    is GENERAL (همیشه/هر/همه/قانون), never for a one-off hypothesis of any kind.
 3. s23/s29/s37 — the A044 line is context («زمینه (نه پرسشِ دوم)») when the block already has a turn question; manyUnknowns ignores «؟» used as
    digit placeholders («؟۴۸۷؟») and exclamation «؟!».
 4. A191: fire on a problem-introducing message that jumps into details/attempt before the unknown is stated (s21 — Pólya's exact moment); do not
    fire on a complaint about teaching (s15) or other non-problem openings.
 5. s07 — the guess annotation names the actual trigger («حدسم…» vs «…درسته؟»).
 6. s16 — a reflective night-3 turn in the parent frame does not get the look-back b1 «نتیجه را وارسی کن» suggestion.
 7. s19 — the coach's mid-course line is not emitted when the live block's turn question is a fresh card/refusal (one question).
Process: as before. Base = e52aae7. Handoff notes `_pending_tour1_R8_<live|coach>_2026-10-16.md`.
