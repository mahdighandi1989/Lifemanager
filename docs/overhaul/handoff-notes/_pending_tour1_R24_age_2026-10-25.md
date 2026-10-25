# Pending: Pólya tour round 24 — fixer «age» (R5, age and register surfaces) — 2026-10-25

> Temporary note for the other round-24 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R24.md R5. WORKLOG (109), PROGRESS 118 (the coordinator renumbers at merge).

Files changed: `apps/learning-architecture/src/app/a43_age.js` (dates, confirmation, model birth, card memory, number words, audience source, minor school name),
`a34_psy.js` (birth action delegates, honest no-norm line, mind-card date error, puzzle guard for minors), `a29_mind.js` (assistant copy of the norm line),
`a27_tour.js` (elder register, register signs, `toShoma`, `regSys` dates), `a26_assist.js` (model reply dates shown in Jalali), `a12_mirror.js` (Drive mirror dates).
Tests: `tests/test_tour1_r24_age.js` (runner sentences), `tests/test_tour1_r24_age_bank.js` (every R5 entry of `tests/variants/VARIANTS_R24.json`, judged by text, not number).

## Contract: dates a person reads (everyone)
- Never write «YYYY-MM-DD» to a person. Use `A.AGE.faDate(iso)` («۱۷ اسفند ۱۳۸۸»). `A.AGE.faBoth` is quarantined (still exported, no person-facing use).
- Every chat «سامانه» line, `AS.paintHooks` card and Today line already passes `AS.regSys`/`AS.regPage`, which now also run `A.faDates` (ISO ⇒ Jalali, outside «…»).
  The model's reply is shown through `A.faDates` too, and the Drive mirror converts memory and ai/sys lines. **today fixer:** a line you build OUTSIDE these paths
  (a view, a 📜 row, a 🎯 card) must call `A.fdate` or `A.faDates` itself. `A.faDates` never touches her own words inside «…».

## Contract: birth date (everyone who saves or confirms a birth date)
- One confirmation per date per session: `A.AGE.confirmOnce(s, iso)` (marker `msg.birth = iso`). Do not push your own «✓ تاریخِ تولد…» line.
- `{"do":"birth"}` goes through `A.AGE.fromModel(a, session)`: if the page itself read a birth date from her latest message (`A.AGE.pageParse(s)`), a different
  model date is ignored (console warning) — the page's parse wins (B24·D7). With a session it returns "" and confirms once; without one it returns the Jalali line.
- Card: a day without a year (typed in the card) is kept in `settings.profile.birthMD`; the next «88» completes it. Two-digit numeric years (`96/2/30`,
  day-first `30/2/96`) and Finglish month names (`17 Esfand 1388`) parse as Jalali.
- `A.AGE.numWords(text)` turns number words before «سال…» into digits («هشتاد و یک سالمه» ⇒ «81 سالمه»); `A.AGE.ageSaid` uses it. **classify fixer (R4):**
  `AS.stripIntro23` still matches only digit ages (`[0-9۰-۹]{1,3}[\s‌]*سالمه`), so «من هشتاد و یک سالمه، …» stays in the chat problem title (A24-10, second half).
  Run `A.AGE.numWords` on the text before your intro regexes (or add the word pattern) — I did not touch the intro stripper (your area).
- «# مخاطب» says «از تاریخِ تولدِ ثبت‌شده» only when a date is stored; otherwise «از سنی که خودش گفت؛ تاریخِ تولد هنوز ثبت نشده».

## Contract: register (everyone who reads `AS.convRegister` or writes register rules)
- Elders (age ≥ 60, band `elder`): `AS.convRegister` returns «shoma» unless SHE asked for «تو» (this session, or `settings.profile.reg`). So every page line, the
  coach register rule and the post-check use «شما» for them; the post-check never demands «تو» from an elder (B24·D11). `AS.elder24()` is exported.
- Register signs (`AS.regSigns`, fallback `fbSigns`): «ببینم/بگم» (first person) are no longer «تو» signs; «بذار ببینم/بذار فکر کنم» are not either;
  an imperative of a machine operation to the page («ثبتش کن», «ذخیره کن», «پاکش کن») is not a register sign; «ـید/ـین» counts as «شما» only after a past
  stem ending (ـاد ـید ـود ـرد ـند ـزد ـشد ـمد ـست ـشت ـخت ـفت) — nouns «روتین/لاتین/کراتین» are not verbs. Old regexes: `AS.R24_QUARANTINE.signSh/.signTo18`.
- `AS.replyCheck` now also flags (a) a «تو»-only reply when `AS.elder24()` and the register is «شما» (bank #138) and (b) any «YYYY-MM-DD» outside «…» in the reply (bank #140).
- `toShoma` converts «سنجیدی‌اش» ⇒ «سنجیدیدش» (past + clitic).

## Contract: minors (age-normed activities and kept summaries)
- `A.PSY.noNormFor(construct, age)` ⇒ the honest line «برای این سن هنجارِ معتبر در دست نیست؛ فقط روندِ خودت» when no anchored item of that construct has a
  valid band for the age (same judgement as `peers`: out of range or `valid:false`). The mind table and the assistant's mind copy (a29) use it.
- `🧩 معمای امروز` opened directly (`A.go("psy_item")`) by a minor never shows or opens an item whose source does not cover the age (C24-18); a covering item is
  offered instead if one exists.
- `A.AGE.privText(text)` replaces a minor's school name («مدرسه‌ی ما اسمش دبستان شهید رجایی‌ه» ⇒ «… اسمش دبستان [نامِ مدرسه]‌ه») and `A.dossier` is wrapped
  (`A.dossier._priv24`) so 📜 (view, text, HTML) never keeps it verbatim. Her own chat message is not changed. **today fixer (a40):** if you build another
  kept summary from her messages, pass it through `A.AGE.privText`.

## Merge
- This branch already contains the classify fixer (046d813d, merged cleanly in source; docs appended in merge order 108 ⇒ 109, HANDBOOK open item renumbered 63).

## Old assertions changed (DECISIONS_R24 R5 replaces them)
- `tests/test_tour1_r23_ageclass.js` — see the comments marked «دورِ ۲۴ (R5)» there: the confirmation shows only the Jalali date (no ISO) and a model
  birth action in a session confirms once instead of returning a second «✓ …» line.
- `tests/test_tour1_r18_coach.js` rm6reg — the R18 bank entry «آره ثبتش کن» (compound imperative ⇒ «تو») is replaced by R5: a machine-operation imperative is no register evidence (comment in place).

## Not done here (other areas)
- Intro stripping with word ages (R4 classify, above). The R7 «🎯 موعد» line itself (today fixer) — it is now converted on display, but the source still stores ISO in memory, which is fine for the model.
