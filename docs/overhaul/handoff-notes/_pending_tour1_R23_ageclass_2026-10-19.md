# Pending: Pólya tour round 23 — fixer «ageclass» (Q1, Q5) — 2026-10-19

> Temporary note for the other round-23 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R23.md Q1, Q5. WORKLOG (94), PROGRESS 109.

Files changed: `apps/learning-architecture/src/app/a43_age.js` (dates, chat birth, card, Today register, age self-fact), `a34_psy.js` (birth action, puzzle age gate,
mind-card date field), `a26_assist.js` (system map from `A.SELF_FACTS`, page lines in the conversation's register), `a27_tour.js` (register, intro strip,
classification, routing, turn-question fit, post-check), `a1_base.js` (`A.SELF_FACTS` registry + storage fact), `a37_sources.js` (one wording), `a38_live.js`
(one wording: the practical result question), rebuilt bundle. Test: `apps/learning-architecture/tests/test_tour1_r23_ageclass.js` + byte copy of the bank
`tests/variants/VARIANTS_R23.json`.

## Contract: dates people type (everyone who reads a date of birth)
- `A.AGE.parse(text, {age})` ⇒ `{iso, j, cal}` | `{need:"year", jm, jd}` | `{err}` | `null`. Jalali or Gregorian, Persian/Arabic/Latin digits, month names,
  two-digit Jalali years, «امروز/فردا تولدمه». Jalali ⇄ Gregorian is the jalaali-js algorithm (`A.AGE.j2g`, `A.AGE.g2j`); a day that is not in the calendar
  (31 Mehr, 30 Esfand of a non-leap year, month 13) is refused with a human sentence. Never write «YYYY-MM-DD» to a person.
- `A.AGE.setBirthInfo(text, {age})` saves (page + host) and returns the parse; `A.AGE.setBirth` keeps its old contract ("" or an error sentence).
- `{"do":"birth","date":"as she said it","age":n}` — the model must not convert; ISO input still returns "" (old tests), a converted date returns a «✓ …» info line.
- Her own birth sentence in chat is read by the page itself (`A.AGE.fromChat`): «تولدم …», «متولدِ … ام», «… به دنیا اومدم». Someone else's birthday, a deadline
  or a past event is never a birth date. «X سالمه» alone sets only `settings.profile.ageSaid` (band until the date is given; the card still asks).
- **Bank note:** the VARIANTS_R23 dates (20 Ordibehesht 1338 = 1959-05-11, 12 Khordad 1338 = 1959-06-03) are correct. A hand check that assumed
  «1338 starts on 1959-03-21» was off by one day: the 1959 equinox came after Tehran noon, so 1 Farvardin 1338 = 1959-03-22. jalaali-js and ICU's
  `persian` calendar agree, and the test compares the page's converter with ICU over 1940–2030. Note: the model in aA3 stored 1959-05-10, a day early.

## Contract: page lines follow the conversation's register (everyone who writes a line the person reads)
- Chat «سامانه» lines, `AS.paintHooks` cards and the birth card are passed through `AS.regSys(session, text)` when painted (outside «…» only); the prompt history
  line «سامانه: …» too. Write your lines in «تو»; the page converts them for a «شما» conversation. Today lines go through `AS.regPage(text)` (latest session) — the
  wrapper is the last `A.dueList` wrapper (a43). **today fixer:** if you add Today text outside `txt/sub/act`, call `AS.regPage` yourself.
- Her explicit request («تو صدام کن», «شما خطابم کن») wins over every other sign and is kept in `settings.profile.reg` for later sessions.

## Contract: self-knowledge for the assistant (everyone who stores personal data)
- `A.SELF_FACTS.push({id, fa, use, where, offline, model})` (strings or functions). `AS.manifest()` prints them FIRST in «# نقشهٔ سامانه», so truncation
  never drops them. Age and page storage are registered; **today/prereq fixers:** register any new personal data the same way.

## Contract: message classification and the opening turn (everyone)
- `AS.stripIntro23(text)` removes leading greetings, self-introductions (name, grade, «۱۵ سالمه»), lines about the app and lead-ins («یه سؤال دارم»,
  «این سواله رو نمی‌فهمم:», «می‌خواستم بپرسم»). It is used for the chat statement (`coach.stmt`, so the prerequisite stack and 🧩 titles) and inside
  `statesProblem`. **story/prereq fixers:** any title you build from her first message should use it; her message itself is never changed.
- `AS.metaMsg22` now also returns `"rating"` for practice self-reports («بی‌نگاه نوشتم … کامل/۸۰٪ یادم بود») and `"use"` for model-use reports
  («همون تلسکوپی رو به کار بردم … درومد», «همین روش رو … زدم»), and `"keep"` for «یه جا نگه دارم / به لیستِ … اضافه کن / جایی برای این‌ها هست؟».
  Non-empty ⇒ never a problem statement, never A191.
- After the session's problem is closed, a message is a new problem only if `statesProblem` says so (no whole-first on a result/look-back reply).
- «بگو نه دیگه» is not a correction; «X نیست، Y» is a correction only with a replacement (number or a short value, not a «می…» verb).
  Old rule: `AS.R23_QUARANTINE.corr19b22`.

## Contract: the turn question fits this turn (everyone who writes a turn line)
- `AS.oneTurnQ22` now checks the kept turn question with `AS.unfit23(q, msg, session)`: answered in this message (a check she reported, «همهٔ فرض به کار رفت»,
  the unknown she named, the prediction/confidence she just gave) or misplaced (e4 «این گام جواب نداد؟» on a step that worked, e5 on a correction turn,
  a step question on a keep/use message, «پیش‌تر دیده‌ای؟» after a result). It is demoted to context with the reason and the next candidate is used; the
  prerequisite stack line is never demoted. **story fixer:** if your chat ⇄ form import makes the form know the answer, the a38 list will stop offering it anyway;
  `unfit23` only reads this turn.
- «ثابتش کردم، ولی می‌خوام بفهمم چرا» ⇒ phase look-back (`coach.lookWhy23`); «امتحان کردم … نمی‌دونم چطور ثابتش کنم» is not «said».
- The practical result question is one question now (a38 `resultQ`).

## Post-check
- A reply question counts as the page question when it has a majority of its words OR at least three content words of it (old: `R23_QUARANTINE.inPage22`).
  Page questions now include the phase-list items and «پیشنهادِ این نوبت: «…»».
- A bullet list of ≥3 lines is a cheat sheet even if only one bullet has «؟».
- The «not done yet» claim check ignores conditional clauses («وقتی …»، «اگر …»).
- A long quote in the reply that is neither in her messages (fewer than a third of its content words) nor in the prompt is flagged (C23-21).

## Not done (with reason)
- A23-35/A22-27 (whole-first while the form is empty), B·D5, D23-18 «کلِ مسئله در یک جمله» in oD1 — chat ⇄ form import is Q3 (story).
- The turn question about «the two missed cards» (bank #130) — the practice question list is a41's.
- Source name clipped in the puzzle line («Zorowitz, S») — not in my mechanisms.
