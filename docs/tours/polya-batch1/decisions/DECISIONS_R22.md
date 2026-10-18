# Round-22 decisions — ROOT MECHANISMS (main session; binding)

Round 22 (main b70c1fe8). Zero-defect scenarios: A 2/13 (s06, s08), B 0/13, C 0/12, D 1/12 (s33), so 3 of 50 including the 12 new
prerequisite scenarios. One S1: the system never tells a missing prerequisite apart from a knot or low ability (all 12 prerequisite
scenarios, all four groups). Better: routing (B 139/141, C 136/136, D 4 wrong of 136); practice from chat in every group, with stability by
the technique's own text; correction engine (composed records, verdict set-asides, deadlines, colloquial copies, ✏️ multi-number); session
dossier; Today one line per act. First evidence for the running lists: each has a unique role, so keep them, but they are islands.
Reports: reports/round22{A,B,C,D}_handback.md, round22X/<sid>/findings.md, round22A/defects.md, round22B/CATALOGUE.md, round22C/defects.md,
round22X/PARTS.md. Owner roadmap §14–§16 bind. DECISIONS_R2–R21 bind except where replaced.

## Root mechanisms
P1 — PREREQUISITE LAYER (S1; A22-24/25, B·D6, C22-P1/P2/P3, D dp1–3; roadmap §15–16).
  - The model reports `coach_state.prereq {concept, step, quote}` when her words show she lacks a concept this step needs.
  - The page validates it: the quote is hers and the step is open. Then:
    - one short diagnostic question;
    - teach ONLY as far as this step needs, with a mastery re-check;
    - keep a STACK of waiting places (main problem step → prerequisite → nested prerequisite), and after each one return to EXACTLY the
      waiting step, with the place restated;
    - write the item into that problem's «🧩 نقشهٔ پیش‌نیازها» with its pid (no more island), plus a learning topic for the larger subject.
  - «نامِ قضیه را لو نده» does not apply to a DIAGNOSED missing prerequisite: name the exact concept and step (never «جبر بلد نیستی»).
  - The mind card gives every stuck point a cause (prerequisite / knot / skill) with its evidence:
    - a stuck caused by a prerequisite never lowers a stage and is never «ضعیف‌ترین»;
    - a prerequisite learned later is booked as progress;
    - learning in the "teacher" role is booked too.
  - «خنگم / ریاضیم ضعیفه» ⇒ the page answers with the named gap, not with reassurance.
P2 — «🧭 نقشهٔ مسیرِ مسئله» (gap in every group; roadmap §16).
  - Built from APP.EVLOG / the dossier events. No second store.
  - Shows origin (statement) → now → destination (the unknown / «حل شد»), steps on the line, and how much remains.
  - Detours are dotted (prerequisite, auxiliary problem, guess test) and rejoin the line; corrections are back-jumps.
  - Hovering a point shows what it was and what was done there.
  - A small geography strip appears in other views while a problem is open.
  - Readable in both themes and at phone width. A button in the problem page and in the assistant.
P3 — CORRECTION ENGINE, REMAINING.
  - Same fact by meaning: value + unit, number words (۵۰ = پنجاه = 50, پیمانه/پیمونه), never a lone digit. This removes the spurious
    «بر ۴⇒۵» ask on the lesson.
  - Copy candidates include her understanding-form rows, step outcomes, look-back fields and lpPr* fields.
  - Substitution is applied ONCE to the original text over the minimal span. Garbles to remove: «متر مربعه متر مربعه», «۱.۵.۵ پیمونه»,
    the lesson garble (lessonSub20), «یه تا اسکیس», «عروسی … تا عروسی».
  - Show the full new text in the ask/line.
  - Dependencies come from the basis each verdict actually used (the model reports the basis; the page validates it). No over-withdrawal:
    - a deadline correction does not touch guesses;
    - «مربع بهترین است» stays.
  - A correction reaches a solved problem of an earlier session, files its event in THAT problem's dossier, and records one event per
    correction.
  - Deadline ids appear in the prompt, and the datum key reaches deadlines.
  - The clause is judged, not a trailing «؟» (s36).
  - The «بله» path updates the result the model receives (A22-19).
  - The note always agrees with changed[] (A22-4, C22-7).
  - Fix the s25 «۱۰ ⇒ ۸» regression and the s19 marked-bubble vs "nothing recorded" mismatch.
P4 — TURN QUESTION, ONE SOURCE.
  - The successor question «گامِ بعدیِ تو چیست» never overrides:
    - her restatement request;
    - a next move she already stated;
    - «به نظرت درسته؟» on steps (ask to check each step);
    - a proof under review (A22-3, C22-1).
  - A re-check question only when a result or verdict used the corrected datum (A22-7).
  - The post-check counts the page's own turn question as ONE question (A22-1, C22-13, B·D9); page turn questions must themselves be one question (B·D10).
  - No stuck card when she is not stuck (A22-2).
  - No re-ask of an answered question.
P5 — MESSAGE CLASSIFICATION.
  - A practice request, a «keep what I learned» request, a self-rating («شاید ۴۰٪»), a correction message or a deadline message is never
    a new «مسئلهٔ گفت‌وگو» and never a guess (C22-4, A22-5, B·D17).
  - «تو» meaning "in" is not the pronoun (D register).
  - The said:result compensation never quotes the statement (C22-2).
  - A return in a new session about an open problem routes lla_coach (D).
  - Openings without «؟» that state a goal or a stuck point route lla_coach (B s12/bp2, A s07).
P6 — PRACTICE.
  - T24: a page judgement books the case session (A22-10); practice_log picks the 🎯 by its numbers and percent (A22-15); calibration
    session counts are correct (B·D22).
  - A plan that IS the practice act links to the case (B·D18).
  - T15 gets a late label and feeds the assumptions list.
  - «یه ماه دیگه» / «هر دو هفته» set her rhythm.
  - Warn when a technique's stability criteria do not fit the subject (T23 on a project).
  - Stability text cites the technique's own text, never «قاعدهٔ گره».
P7 — RUNNING LISTS LIFECYCLE (A22-28, B·D8, C22-15/16, D).
  - An assistant action adds or updates items from her quote.
  - Items can be resolved, refuted and closed.
  - Ambiguities hold hypotheses with probabilities and their updates; assumptions can be «باربر»; Pareto has shares; signal/noise
    verdicts get a due re-check.
  - Every item links to its problem and session and appears in the dossier and the mind card.
  - A models-shelf use is booked on the problem where it was used.
  - A prompt line routes her need to the matching list.
P8 — SMALL.
  - Chat guesses take their outcome from later verdicts (C22-11).
  - C145 does not fire on a quoted or past «ثابت شد».
  - A passed deadline ⇒ «تحویل دادی؟» on Today.
  - Invented look-back problems return in Today.
  - «خفته تا» is never a past date.
  - The title follows the statement.
  - ZWNJ is kept in her text.
  - The «۴۵ تکنیک ›» label is fixed.
  - «نتیجه سالم ماند» is withdrawn when its verdict is set aside (B·D21).
  - The inline plot appears after reload.
  - Duplicate ✏️ events are removed.

## Fixers (four worktrees; base = branch integ-age, the age package, once its gate is green)
- prereq+route (P1, P2): a27/a38 coach and tunnel, a29 mind card, a32 prerequisite map, new a44_route.js.
- correction (P3): a38/a40 retract and copy, a27 retract side.
- turnq+class (P4, P5): a27 turn questions, a26 classification/post-check/routing.
- practice+lists (P6, P7, P8 practice and list parts): a41/a42 and the list views. P8 items go to the owner of the file they touch.
Docs numbering: WORKLOG 90/91/92/93, PROGRESS 105/106/107/108, in the order above.
Independent bank VARIANTS_R22, written in parallel.
