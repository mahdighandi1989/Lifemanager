# Round-25 fixer «today» (P7 + C1/C12) — hand-back (2026-11-11)
Branch worktree-agent-a97f5cac959ad8f8d, final commit dccb2e09 (base eeb11d1f). WORKLOG 127 / PROGRESS 126.
Root causes and fixes (apps/learning-architecture/src/app/):
- A25-14 one prediction two 🎯: a41 t24Judge searched only 🎯 already linked to the practice case; now also open chat predictions, and binds.
- A25-14 judged prediction stays in Today: PR.predExplicit booked «پس پیش‌بینیم غلط بود» as a NEW prediction; new predVerdictIn /
  predVerdict / predFor / predMark judge the matching open one from her own sentence (leaves Today, stays in 📜).
- A25-15 «تا جمعه»: the date is read from her own sentence; a plan's day counts only from the same message or with two shared content words.
- C1: PR.whenInfo — a weekday named on that same weekday books nothing; PR.datePend asks «همین امروز یا جمعهٔ بعد؟» once.
- C12 / B_s D7: a27 plan18 no longer falls back to +7 days («جلسهٔ بعد»); a dated commitment with no record gets «… درست است؟» from the
  page and becomes a deadline on her yes (PR.herDates).
- C22-11 / A23-8 guess outcomes: PR.guessOwnTest reads more forms of her own test. D25-22 school name: a43 G.privText + A.dossierSess
  filter. C25-17: a34_psy no-norm line for a child. B24·D18 / A23-8 route duplicates (a44 ROUTE.model). A25-21 deadline why carries her
  own words. A23-25 no stuck from a bare command. A21-11 calibration row «k از n». A23-26 typo.
Tests: tests/test_tour1_r25_today.js 19/19 (18 red on base); bank P7 26/26 (21 red on base); suite 141/141 one at a time on the final build.
Not done: bank #224 second half and U40 (the child's message repeated three times in the dossier); s24 (C22-11) shows «هنوز آزموده نشده —
دلیلِ خودت …» rather than an outcome; «باشه/چشم» is not read as a yes to the date question; a dated commitment the model already booked
is still booked without her yes; «آخرِ ماه» is not read; A22-11 outside its files; the new date prompt block not run against a real model.
