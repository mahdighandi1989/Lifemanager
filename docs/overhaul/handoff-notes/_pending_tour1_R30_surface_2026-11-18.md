# Handoff — Pólya tour round 30, fixer «surface», 2026-11-18

Contracts the other round-30 fixers must respect, and every function this fixer changed.

- **Territory loop (a44, C20 / R27 R7).** `backNow(e)` now ignores page re-checks (`mismatch` without `byHer`) made after her «نه» — her «نه» stays her
  last verdict until an arrival, an ask or a take-back replaces it. `sysSheet` does not re-judge routine replies that sit on the sheet **before** the
  page's own «نه» note («[دستیار · وارسیِ برگه …] … خودش گفت / به گفتهٔ خودش … همان …») — order of notes, not clock. Do not write a page note with
  those words for anything that is not her «نه». `herNo` keeps `e.rejHist` ({it, sn, alts, q, was, at, done}); a take-back that quotes her own «نه»
  («اون «نه، همون نیست» … اشتباه بود») is read in `sysLines` against `rejHist` over all stores of the session, even with an open ❓ (the ask gets
  «لازم نشد») or after the problem closed (`mootBack`: the problem stays closed — C36 — the sheet is closed with her confirmation).
  Mismatch labels now name who set a candidate aside: sheet ruling / «به گفتهٔ خودش» / tie not chosen.
- **a44 `clip`** closes any «…» it cut open (`«… …»»`). Any caller that counted guillemets of a clipped string will see one more «»».
- **a44 prerequisites.** `learnedOne` calls `syncItem` itself (a cascaded parent is now learned in «🧩 نقشهٔ پیش‌نیازها» and the mind card).
  `ansNJ30` (inside `PRE.block`): a diagnostic question already asked (`e.asked`) + her first non-question message after it ⇒ `e.ansNJ`, 📜 line
  «جواب داد — مربی حکمی نداد», and `directive` stops re-asking it verbatim (C186). **story (D26-28, the other half of C186):** `chkVerdict` is yours.
  Self-label line («این کم‌هوشی نیست») names the prerequisite her own sentence names.
- **a27.** `sysQ29` + `PAGEAG30` / `PAGEFAULT30` (bare «صفحه» as agent of a page act or as the one at fault). `turnMoments` new moment `M30`
  (method question: a Pólya stage name «بازنگری/طرح‌ریزی/اجرای طرح/فهمِ مسئله/وارسی» asked «یعنی چی؟», or her guess «یعنی … چک کنم که …؟»);
  `claim` is false for that guess. Register pass also covers `nav.side`.
- **a40 history (one arrow, R27 R6):** every history renderer writes «تازه» (اصلاح شد ⇐ «پیشین»); moves are «جابه‌جا شد به «…»» and
  «جابه‌جا شد: از «…» به «…»» (no ⇒). **story / correction:** do not add «⇐ … → …» lines; tests accept both move forms.
- **a41** list_update «ask the recheck date» clause is model-only (`— از او بپرس (recheck)`, stripped by `forHer27`). **dates:** keep that form.
- **a43** `G.sameOnce`: the stored birth date said again ⇒ one «از پیش ثبت است» line per message.
- **a38** proof win line: «✍ گامی که برهانش را خودت نوشتی … درستیِ برهان را صفحه نسنجید» (no ✓).
- **a29** `M.phases`: a chat «b» failure dated after a verified look-back of the same problem is not a look-back verdict; the weakest line shows
  «بر پایهٔ N داوریِ همین مرحله».
- **a26** `PAGE_RULES` + C117 (`PR.doneFromHer28`, dates) and C89 (`A.liveStale`, correction) — **dates / correction:** if your merge changes what
  these functions do, edit the rule text. Session pin uses `bidiNodes`. **AS.SYS not touched.**
- **a10** `APP.qLab30(label)` for the back button / back FAB.
- **Replay library** `tests/tour1_r28_replay.js`: new options `quiesce` (wait until the fake sheet host is idle after every step) and `onStep(c, cmd, p)`;
  both off by default.
