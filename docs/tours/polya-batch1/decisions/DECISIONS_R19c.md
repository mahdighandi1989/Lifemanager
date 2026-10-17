# Round-19c — longitudinal techniques: one practice dossier, one scheduler, stability from evidence (main session; binding)

Source: LONGITUDINAL_AUDIT.md (45 techniques: 9 ready, 29 partial, 7 missing; of 16 that only work over weeks, only T42 ready).
Owner 2026-10-17 (roadmap §13). Built after 19b merges (shares a29/a33). DECISIONS_R2–R19b bind. Root mechanisms, not per technique.

LT1 — ONE SCHEDULER. ~12 separate schedulers each copy the 1/3/7/21/60 intervals. ⇒ one `A.SCHED` (new module) that every dated
  thing registers with: kind, record id, due date, reason, interval policy taken from the technique's OWN text (T42 «۱، ۶ …» not 3 — fix
  the existing mismatch), and that feeds Today and `A.HOST.remind`. Existing schedulers are wrapped (not deleted): they register
  through it; their own copies of intervals are quarantined. Standalone forecasts and worry chains finally show their due dates in Today
  (a31_tools claims it, nothing does it). Card review reminder refreshes after grading (a33_dates ~115).
LT2 — AN OPEN PRACTICE CASE PER (technique × subject). Each worksheet attempt today is a new unlinked record. ⇒ `practice` record:
  technique id, subject (live problem / epistemic case / topic / knot / free), start, sessions[] (date, what was done, outcome, self-score,
  measured result where the technique has one — recall %, calibration hit, prediction error), next due, state open|stabilising|stable|
  paused|closed, and history. A worksheet saved from a technique page creates or continues the case (never a duplicate).
  Started from the problem page, the knot, the epistemic case, the course, or the assistant (assistant action `start_practice`).
LT3 — STABILITY FROM THE TECHNIQUE'S OWN EVIDENCE, WITH DATES. `A.mastery` counts same-day attempts. ⇒ exit criterion per time-shape,
  derived from the page's existing spacing-aware rules (knots: ≥2 sessions ≥3 days apart, varied forms; experiments ≥14 days) and from
  each technique's text (e.g. calibration: hit-rate inside the stated band across sessions on different days; spaced retrieval: success
  at an interval longer than the previous). Same-day repeats count once. The case stays open and keeps getting Today turns until the
  criterion holds; then «تثبیت شد» with the evidence, and a later check-in at the next interval to catch decay.
LT4 — TECHNIQUE WORK FEEDS THE MIND CARD. a29 reads practice sessions, worksheet rubrics, T24/T32/T33 calibration tables, recall %
  of the 1-3-7 cycle and the weekly blank page; each session once (RN2e), visible under «از کجا؟» (INF17).
LT5 — ONE RECORD PER ACT ACROSS PARALLEL PATHS: T24 predictions ⇄ forecast ledger (and card confidence); T21 ⇄ knot experiments and
  live-problem steps; T22 ⇄ epistemic cases; T9 ⇄ forecast ledger. The technique page opens the dated record with outcomes, not a copy.
LT6 — LINKS BACK. A practice case links to its live problem / epistemic case / knot, shows in the problem's dossier (INF16), and its
  outcome can update the problem (e.g. «حدس رد شد» ⇒ problem guess). The 15 techniques that cannot start from a knot can.
LT7 — RUNNING LISTS for the 7 missing techniques: assumptions register (T15), mental-models shelf with use counter (T16), «my thinking
  mistakes» folder (T31/T34), open ambiguities (T35), Pareto/vital-few tracker (T3), signal-vs-noise log (T10) — each a practice case
  of kind "list" with periodic review via LT1.
LT8 — CLOCK FOR TESTS. `A.now()` with an offset hook (all modules' now helpers go through it), `A.HOST.remind` capture stub; tours use
  Playwright's clock (already used in tests/test_audit_learn.js, test_psy_v2.js) for multi-day scenarios. Unset «suspended» flag on
  cards gets its setter (or is quarantined).
Tests: per LT, red-first + independent bank VARIANTS_R19c (time-shaped sequences over simulated days: forgetting, late returns,
regressions, same-day repeats, decay after «تثبیت شد»). Longitudinal scenarios join round 20 for the Pólya-relevant techniques and are
required in batch 2 (roadmap §13).
Fixers (after 19b merges): sched (new a40_sched.js + wrappers in a1/a31/a33 + clock LT1 LT8), practice (new a41_practice.js + technique
pages LT2 LT3 LT5 LT6 LT7), mind (a29 LT4). Docs numbering: sched WORKLOG (77)/PROGRESS 93, practice (78)/94, mind (79)/95.
