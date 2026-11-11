# Pending: Pólya tour round 25 — fixer «classify» (P6) — 2026-11-11

> Temporary note for the other round-25 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R25.md P6. In this branch the entry is WORKLOG (121) and PROGRESS 120 — the
> next free numbers on BASE25 (the build gate forbids gaps); the launch line assigned WORKLOG 126 / PROGRESS 125 — the coordinator renumbers at merge.

Files and the exact functions changed:
- `a26_assist.js`: the follow-up text inside `turn()` (`fillTxt`, `subFa25`), `AS.wantsAct25`, `bidiNodes` (+ `FACT25`), the two readers of sys lines
  (history line and `paint`, now via `AS.sysRaw25`), one line after the `AS.promptFilters` loop (`AS.finalFilter25`). **AS.SYS untouched.**
- `a27_tour.js`: `stripIntro23` (+ new `idPrefix25`, `PROBMARK25`), `fbSigns`, `regIn`, `regOf` (+ `userVoice25`, `young25`), `SH_POS`, `AS.regSys`
  (+ `outMap25`, `pageLabel25`, `regStore25`, the `S.put` hook), `regSigns` (+ `noNounYi25`), `quoteIn` (+ `texPlain25`, `texNorm25`), `quotesNotHers23`
  (+ `hypoQuote25`, `formulaQuote25`), the register block of `AS.replyCheck` (+ `noPlural25`, `TOPOS25`), new `oneQ25`/`tqLine25`/`AS.finalFilter25`.
  Nothing in the turn-question or stage functions.
- `a38_live.js`: `A.liveReqSignals` (+ `PURSUE25`), `resultQ` (non-objective string only), the ladder line (5) of the turn-question function
  (`failed25`, `asked25`, `L.lad25`), `natGuess0` (+ `DECFRAME25`).
- `a45_story.js`: only the split regexes of `clauses`, `sentences` and the cut in `wholeSaid` (factorial «!»).
- `a21_orient.js`: one string. Test: `tests/test_tour1_r25_classify.js` + `tests/variants/VARIANTS_R25.json` (byte copy).

## Contract: page lines and the register (everyone who writes a `role:"sys"` message — today, loop, prior, correction)
- Write the line in «تو» as before. `S.put` of an `achat` record passes every sys line through `AS.regSys` (register + Jalali dates): `m.text` is what
  the person sees, `m.text0` the raw line, `m.textR` the last transformed text. **Never match a stored sys line by its «تو» wording** (use a field on the
  message — `m.birth`, `m.go`, … — or a wording that has no second-person form). If you edit `m.text` later, the gate treats it as a new raw line.
- A short «…» (≤ 3 words) that is not in her messages is a page label and follows the register («سلیقه‌تان»); her words and longer quotes never change.
- `SH_POS` is the list of attached «تو» forms; add a form there when you write a new line with one («توست» ⇒ «شماست»).
- Under 18 (`AS.young25()`): `AS.convRegister` returns «to» unless she herself uses or asks for «شما». Elders as in round 24.
- `AS.userVoice25(text)`: her own voice toward the assistant — the task voice of a quoted problem («… سؤال داده: ثابت کنید …») and the generic «تو» of
  her own lesson («درسم: وقتی … داری، … بکش») are removed before any register sign is read. Use it, never a private regex.

## Contract: the page turn question (prior, story, loop, today)
- `AS.finalFilter25` runs after ALL prompt filters (a26): every line «**پرسشِ این نوبت همین است:**» / «- در این نوبت فقط **یک** پرسش … «…»» gets ONE «؟»
  outside parentheses and inner quotes (middle «؟» become «،»). Lines starting «- زمینه» are untouched. You may keep writing book questions with several
  «؟» in registries; the model receives one question sentence. `AS.oneQ25(q)` is the same function for your own use.
- The non-objective result question is now «نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ (…)»; «از راهِ دیگری…؟» belongs to the look-back form.
- Ladder (a38, branch 5): a rung is not the turn question again in a later turn (`L.lad25[q] = turnKey`); «این گام جواب نداد؟» only when the last closed
  step failed (or this turn reports a failure) and once per outcome. All rungs asked ⇒ `ladderEnd` (q = ""), as before for an exhausted ladder.
  **prior/story:** your picks (prior-resume, turn-result, …) run before the ladder and are not affected.

## Contract: opening statement (story, prior)
- `AS.stripIntro23` now removes a leading chain of identity clauses (age in digits or words, birthday, grade, «اسمم …», short nominal «…م» predicates next
  to a strong clause). An age that is data of the problem stays. After an introduction, «مسئله‌م اینه که …» starts the statement. `coach.stmtRaw24` is
  unchanged (raw opening) — prior's «opening carries her own worked step» (C7) should read the raw message, not `coach.stmt`.

## Contract: requests (today, story)
- `A.liveReqSignals(t)` returns `pursue:true` (and `req`, `now`) for «می‌خوام … پیگیری/دنبالش کنم», «مثلِ یه مسئلهٔ واقعی/جدی», «نه این‌که فقط یادداشت بشه».
  «شاید یه روز دنبالش برم» is not a request.
- `A.liveNatGuess`: a first-person decision frame outranks a bare school-subject name («کلاسِ تقویتیِ ریاضی … چیکار کنم؟» ⇒ life).

## Post-check (everyone who adds a reply rule)
- New rule: two registers in one reply (outside quotes and outside sentences with a plural addressee) when the register is known.
- Not a slip any more: hypothetical «اگر … می‌گویی/بگویی «…»», a TeX quote equal to her formula after normalisation, a real plural («تو و خواهرت … دارید»),
  a verbal noun + «؟» («بازبینی؟»). Still caught: «گفتی «…»» she never wrote, a TeX quote that changes the formula.

## Not done (reasons in HANDBOOK §12)
- A23-6, A23-19 (turn question / stage — prior, story); bracket sums vs MathML display (a39); register of fixed form texts outside the chat.
