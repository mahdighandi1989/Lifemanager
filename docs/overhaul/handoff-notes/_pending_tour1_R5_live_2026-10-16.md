# Tour 1 (Pólya), round 5: «live» fixer handoff (2026-10-16)

This note covers the live tunnel (`apps/learning-architecture/src/app/a38_live.js`) for the items in `DECISIONS_R5.md`: F2 (the turn-question priority and the page-card side), the live part of F4, F5 and F7. DECISIONS_R2–R4 still apply.

**Not done here:** docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG), push and merge. The main session does those.

## Commits (base 8407984)
- `6119bf5`: F2, F4 and F5 code.
- `bae2ac9`: new test `tests/test_tour1_r5_live.js` (F2, F4, F5 sections).
- `76f2741`: F7 code. Also `card` in `A.liveCoach` and the `A.liveCarryRe` export.
- `7a61344`, `841f1e4` and the last commit: F7 test sections, `A.livePageQs`, pod-list check.

## Red baseline
Run `LLA_FILE=<8407984 dist html> node tests/test_tour1_r5_live.js`. It exits 1 with 40 failing lines, some of them exceptions on controls that did not exist yet. On the fixed build every check passes.

## F2: one question per turn, from one source
`A.liveCoach(pid, {asked, stuck, turn:{analogy, result, stuck, fail, text}})` now uses `coachCore`, the same function that decides the page plan card. The old signatures still work.

Priority:
1. **This turn.**
   - `turn.result` gives «از راهِ دیگر؟ نتیجه را وارسی کن». There are three wordings: objective find, proof, and life/practical.
   - `turn.analogy` (or `turn.text` matching `CARRY_RE`) in plan or exec gives the analogy-limit question.
2. **Failure.**
   - A broken presupposition.
   - A set-aside datum after a refuted guess.
   - Stuck in plan gives «از خواسته به عقب».
   - `turn.fail` (or stuck with no open step) in exec gives «به شکلِ دیگری بیان کن».
3. **The page card's open question**, returned as `card` (also `pageQ`). A due step stays the page question even when it was already asked.
4. **The ladder.**

Rules that apply to all four levels (`qOk`):
- B3 («همهٔ داده‌ها؟ / داده‌هایی که اثرِ محسوس دارند همه…») is never suggested before a plan exists. The page plan card (`askCard`) skips it too, and counts the skip.
- The prediction or «کی انجامش می‌دهی؟» question is not suggested again for an open step that already has a prediction or a day.

New return fields:
- `src`: one of `turn-result`, `turn-analogy`, `fail-presup`, `fail-aside`, `stuck-back`, `fail-restate`, `page` or `ladder`.
- `card` / `pageQ` and `samePage`, which is true only when `q === card` literally.
- `planExists`.

The a38 live hook passes `turn: {stuck, text: msg}`.

Page side: the outcome card now raises the broken presupposition (`.lp-presupback`, with «↺ برگرد به «کافی است؟»») and the set-aside data after a refuted guess (`.lp-asideback`).

**For the coach (a27):**
- `A.liveCarryRe` is exported. It is the same regex as a38's `CARRY_RE`; test it on normalised text, or use `A.liveCarry(text)`.
- The «همان که صفحه همین حالا می‌پرسد» wording should depend on `co.samePage`.
- `nextQFor`'s own stuck/B3 overrides are now redundant with the priority above. The B3 override still ignores «no plan yet»; that needs `co.planExists`.

## F4 (live part)
- `typeGuess` returns pod for «درسته؟», «حق داره؟», «همیشه … میشه» and «فکر کنم … درسته؟». A decision («برم یا بمونم؟», «کدوم بهتره؟») is never pod.
- `natGuess`: the user's own resource («قالبِ من», «اتاقم», «سه نفریم… می‌رسیم؟») is a stake, so it gives practical. The workplace conflict stays life.
- `A.liveSpatialGuess`: seating puzzles (میز/صندلی/…نفره) no longer get «شاید فضایی» from «چیدمان».
- `lpNat` is saved on the record when it changes (`r.p.nat`, `natBy: "user"`), not only with «ثبتِ فهم».
- `A.liveRetype(pid, statement)` re-guesses the type of an existing problem until the user has saved an understanding. a27's `chat_invent` twin branch calls it (one line).

## F5: look-back honesty
- **`partNegated` rewritten.** Earlier, `mentions()` dropped every clause containing «نه». A part is now flagged as negated when any of these holds:
  - a clause has more than half the part's words (A4) and a negation;
  - a clause has the part's own number and a negation;
  - the part has a numeric bound with a unit («دست‌کم ۲۰ میلیون»; «تا ۷ سال … نکنه» is read as a lower bound) and a check number with the same unit lies outside it.
- **Impossibility.** The per-part option `imp` is «جوابی نیست — ثابت کردم …». It gives verdict `impossible`, shown as «✅ ناممکن (اثبات شد)». It never creates a defect.
- **Life pod** (`F.lpod`):
  - The per-part check offers تأیید / رد / نامعلوم; a part marked «رد» is not a defect.
  - New verdict select `lpBPodL`, giving `lifeok`, `liferef` or `lifeunk`.
  - «تأیید» together with a refuted part raises a soft challenge.
- **«بیش از یکی».** `lpBMultiAll` is required. Unless the user found all answers or completed the condition, the verdict is `partial`, never «اثبات شد». The `suffLog` gets an «ناکافی» entry, so the understanding card no longer says «کافی است».
- **Filing a defect** clears the other missing items: per-part checks, hypothesis/conclusion and equivalence.
- **A second «✅ حل شد»** after a defect gives `liveClosure` state `review`. Defects with `retryAt` are ignored while the problem is solved or closing.
- **«کجا خط می‌کشی»:** «هیچی رو بیرون نمی‌ذارم» or «همه … مهمه» raises a soft challenge at any length (`ALLKEEP_RE`).
- **Equations:** `eqsOf` now counts independent equations only. This is the numeric-gradient rank, exact for linear equations; an equation that does not parse counts as before. `A.liveEquationsDerived` returns the derived ones, which the eq card lists as not counted.
- **`stepFollowsTag`:** only a negated action of the first plan piece the step shares words with cuts the link (`negAction`). A negated later outcome («مات نمی‌شود») does not. The page message names the negated action.

## F7
- **«مجهول چگونه تغییر می‌کند؟»** The aux box (`lpAuxVary`, required for `part`) and the relax card (`lpRelaxVary`, required unless the user proves impossibility) both ask it.
- **Approximation vs margin.** `A.liveApproxMargin(approx, texts)` compares the tolerance with the actual margin (word numbers such as نیم/یک included). The look-back shows `.lp-bapproxm` and raises a soft challenge.
- **`lpBBest`:** includes the plan questions answered on their own cards (seen / backward / aux). Chat preambles before «—» and leading «ولی/اما/خب…» are stripped. `A.livePageQs` is exported.
- **Dates:**
  - `L.stateD` and `L.closedD` hold `A.today()`, and `liveClosure().date` returns them.
  - a27 (one line each): the «مسئلهٔ حل‌شدهٔ مرتبط» header uses `L.stateD`, and `chat_solved` sets it.
- **`mentions()`:**
  - A list label («دستور: …») counts as a mention.
  - A number next to a noun is matched through the noun; numbers are not distinctive.
  - Single Latin letters count as words.
- **New guess.** On refute, `lpONewG`/`lpONewGT` offers «ثبت به‌عنوانِ حدس». The old guess moves to `live.guessHist`; the new guess's `since` restarts the tally (`guessCons`).
- **Smalls:**
  - The life guess kit shows only rivals and analogy (no x/n table or formula).
  - The unit message appears once.
  - A result that reaches a backward-chain link shows `.lp-mslink`.
  - A squaring/transform step gives `.lp-equivq` on the page and `Q_EQUIV` as the page question.
  - A step under a declared rotation that does not reach the unknown needs `lpGoalW` («🎯 هدف را گم نکن»).
  - The pod/prove plan list says «حکم», not «مجهول».

## Files outside a38 (minimal, reported)
- `a27_tour.js` (the coach's file), three single-line edits:
  - the `chat_invent` twin branch calls `A.liveRetype`;
  - the related-solved header uses `L.stateD`;
  - `chat_solved` sets `L.stateD`.
  They may conflict textually with 4fc6759; keep both sides.
- `tests/test_tour1_r2_live.js`: the relax flow fills `#lpRelaxVary` (behaviour changed by F7).

## Not done
- 🌱 form confirmation right after «ثبتِ گامِ کوچک»: that form is `A.willCard` in `a36_solve.js` (the coach's file).
- `mentions` for synonyms («دو بچه» ⇄ «دوفرزندی») would need semantics, not normalisation.
