# Tour 1 (Pólya), round 6: «live» fixer handoff (2026-10-16)

This note covers the live tunnel (`apps/learning-architecture/src/app/a38_live.js`, plus one function in `a26_assist.js` and one line in `a27_tour.js`) for G2, G5 and G6 in `DECISIONS_R6.md`. DECISIONS_R2–R5 still apply.

**Not done here:** docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG), push and merge. The main session does those.

## Commits (base 522f92d)
- `c567561`: the G2, G5 and G6 code, plus updates to two older tests (r4 E5, r5 F7).
- `6c1d051`: `A.liveResult` and the one a27 line, the find look-back wording, and the new `tests/test_tour1_r6_live.js` (sections G2-related, G2-cards, G2-stuck, G2-abandon-aside, G5-kinds, G5-wording, G5-closing, G5-lpod-guess, G6-range, G6-goal-mentions-equiv). Set `ONLY=<section prefix>` to run one section.
- The last commit adds this note.

## Red baseline
Run `LLA_FILE=<522f92d dist html> node tests/test_tour1_r6_live.js`. It exits 1 with 35 failing lines; on the fixed build every check passes («NO ERRORS»).

## G2: the turn question
`A.liveCoach(pid, {asked, stuck, turn:{analogy, result, stuck, fail, text, related, abandon}})` keeps its old signatures.

**New turn fields** (both optional; liveCoach also reads them from `turn.text`, so the coach does not have to pass them):
- `related`: the user cannot see how to use a related solved problem.
- `abandon`: the user wants to drop the whole approach.

**Priority:**
1. **This turn.**
   - `result` (one turn) gives «از راهِ دیگر؟ وارسی کن».
   - `analogy` gives the analogy-limit question.
   - «نمی‌دونم چطور از X استفاده کنم» (`related`) gives «نتیجه‌اش را به کار می‌گیری یا روشش را؟ عنصرِ کمکی؟», but only when the problem has a related problem, a «دیده‌ای؟ بله» answer, or evidence in the message itself.
   - `abandon` gives «کدام حلقه دقیقاً شکست؟» inside a backward chain (C095/C096). Otherwise it gives the smaller auxiliary problem («فقط بخشی از شرط… یا حالتِ خاص»), which is what the 🌱 line asks.
2. **Specific cards on screen** (`specCards`), in page order:
   - incubation «… کنارش گذاشتی — چه چیزی به ذهنت رسید؟»;
   - mid-course «میانهٔ راه: چه آموختی؟»;
   - after a closed step: equivalence (`Q_EQUIV`), sufficiency «شرط کافی نبود؟ چند جواب؟», broken presupposition, set-aside datum after a refuted guess;
   - the equations-card verdict `EQ_FEW`.
3. **Stuck.**
   - In plan or exec with a set-aside datum: that datum (`stuck-aside`).
   - In plan with an unused datum: «همهٔ داده‌ها را به کار برده‌ای؟» (`stuck-alldata`). `qOk` now bars B3 only at the start of planning when the user is not stuck.
   - In plan with every datum used: «از خواسته به عقب» (`stuck-back`).
   - In exec after a failed real step: restate (`fail-restate`). Otherwise, with an unused datum: all-data.
   - With no step yet: never «این گام جواب نداد».
   - `turn.fail` restates only when a real step was closed.
4. **The page card's open question.**
5. **The ladder.**

**Return fields:**
- `card`: the card actually on screen (the first specific card, otherwise the plan/exec card question). `pageQ` is still the plan/exec card question.
- `cardWhy`: one of `incub`, `checkin`, `equiv`, `multi`, `presup`, `aside`, `eqfew` or `page`.
- `samePage`: `q === card`.
- New `src` values: `turn-related`, `turn-abandon`, `card-incub`, `card-checkin`, `card-equiv`, `card-multi`, `card-eqfew`, `stuck-aside` and `stuck-alldata`. `fail-presup` and `fail-aside` keep their names.

**One question per block (a38 side).** The a38 hook line about a set-aside datum is gone when that datum is the turn question. Otherwise it is context («زمینه (نه پرسشِ دوم)»), with no «بپرس».

**For the coach (a27/a36):**
- `nextQFor`'s ALLDATA override is now redundant, and it is harmful when a specific card wins (s26: it would replace «معادله کم است» with «همهٔ داده‌ها؟»). Drop it, or apply it only when `nq.coach.src` is `stuck-back`.
- The C095 line (a27 `ABANDON_RE`) and the 🌱 `WILL_RULES` «بپرس…» should become context. liveCoach now returns the same question as the turn question (`turn-abandon`).
- `AS.liveNextQ` already uses `co.card`, so «همان که صفحه می‌پرسد» is now true only for the card on screen.

## G5: kinds, types and wording
- **`natGuess`:**
  - The user's own resource with a size or amount question («مخزن … چقدر بزرگ بسازم؟») gives practical, even with «بتنی بسازم یا پلاستیکی؟» (`QTY_Q`; s17).
  - A third-person puzzle with ≥2 numbers and «چطور/چند؟», with no stake, no first person singular and no dilemma, gives objective (s08). So `chat_solved` and `chat_invent` without `nat` get it too.
- **`typeGuess`:** «حدسم اینه که …» or «حدس می‌زنم …» gives pod (s25). a27's `chat_invent` twin branch already re-guesses with `A.liveTypeGuess`, so the child becomes pod.
  - Coach: the hook's `chat_invent` template has no `"kind"` field. Add `"kind":"find|prove|pod"` (the action already accepts it).
- **`live_new` without `nat`:** the problem gets a suggestion (`natBy: "guess"`, pre-selected on the understanding card). The order is the code's guess, then the session's `coach.natSug`, then `coach.cls` (life/pract/obj/prove) (s13/s30).
- **Prove and objective-pod wording** (`proofLike`, `goalWord`, `phName`):
  - The proverb asks «فرض چیست؟ حکم چیست؟».
  - The related card heading reads «به حکم نگاه کن», and `lpSeen` asks about «حکم».
  - The «کافی است؟» re-ask heading uses the type's own question.
  - The objective execution phase is «اجرای طرح (گام‌به‌گام، با وارسی)» in the page title, the strip, the section and the hook header. «اجرا روی واقعیت» is kept for life and practical (s03).
- **Life pod** says «فرضیه» and «طرحِ آزمودنِ فرضیه…», never «حکم» or «طرحِ اثبات» (plan card, `lpGoalW`, gate message) (s05).
- **«حکم تهی»:** an existence question («آیا چیدمانی هست که…؟») gets the plain «شرط برآوردنی است؟» (`existQ`), and the relax card heading follows it (s10).
- **Find problem:** a fully proved find problem keeps verdict `proved` in the data, but its label and toast are «✅ حل شد — همهٔ گام‌ها ثابت شدند…» (`vLabel`) (s06).
- **`lpBLaw`:** `LAW_RE` no longer matches a bare «رابطه» (as in «رابطه با صاحبخانه») or an inequality criterion (≤/≥/<=). An equality formula in the measure still counts, as in the r2 fertiliser test (s01).
- **`liveClosure`:** `refuted` is true for `liferef` (s05).
- **Related-solved «نتیجه:»:** the new `A.liveResult(pid)` gives the range answer, the last real outcome, the last proof step, or the chat solution, in that order. a27 `solvedBlock` uses it before `glance` (one line) (s01).
- **New guess (`lpONewG`):** it now asks its own confidence (`lpONewGC`, required), a refuting test (`lpONewGTest`, required) and an optional `lpONewGIf`. Nothing is inherited (s01/s22).
- **`lpBBest`:** the part before «—» is stripped only when it is a declarative preamble. It is kept when it is part of the question (contains «یا» or «آیا», a second-person verb, or «؟»), or when the tail needs it («کدام را…») (s23/s29).

## G6: honest verdicts
- **Range answers.** Practical/life find look-backs get a per-part option «جوابِ صادقانه بازه است، یا با این داده‌ها دست‌نیافتنی است». It requires `lpBRangeW`, gives verdict `range` («✅ حل شد — جواب: بازه یا «دست‌نیافتنی» (با دلیل): «…»»), and is never a defect (s09).
- **Goal-drift gate.** With a declared rotation, a step tagged `rot` or `p1` that does not mention the unknown asks `lpGoalW`. Steps tagged `p2` or `back` keep their own switch question (s35).
- **`mentions()`.** A one-variable formula in the datum is used by its index-shifted instance: g(n) = f(n+c), c ∈ [−2, 2], checked at three non-integer points with `eqParse` (s25).
- **Equivalence card.** Symbolic squaring inside an identity (all sides equal for all values) is not a transform (`transfIn`, `A.liveTransf`). A transform verb («مربع کردم», «طرفین», «ضرب در…») or a non-identity equation with `^` still triggers the card (s25).
- **Aux refusal.** The message appears once, under the button. The toast only points to it (s29).
- **Factory case.** The case of a guess (`g.caseId`) is closed with `status: "closed"` and `liveResult: {v, why, at, d}` when an outcome refutes the guess or the look-back judges it (s11). The closing function is `A.liveCloseGuessCase`.
- **Page refusals** (bad toasts) stay in `AS.recentToasts()` at any age until a successful save drops them (`dropBadToasts`). When the list is full, an ordinary message is dropped first (a26; s17).

## Files outside a38 (minimal, reported)
- `a26_assist.js`: `RECENT_TOASTS` cap, `AS.recentToasts`, and the header text of «# پیام‌های اخیرِ صفحه».
- `a27_tour.js` (the coach's file): one line in `solvedBlock` (`A.liveResult` first).
- `tests/test_tour1_r4_live.js`:
  - E5 aside: the set-aside datum is now the turn question, not a second line.
  - E5/E3: stuck in plan with unused data gives all-data.
- `tests/test_tour1_r5_live.js`: the F7 new guess fills `lpONewGC` and `lpONewGTest`.

## Not done
- G1, G3, G4 and G7 belong to the coach. Things the coach must do for G2/G5 to reach the chat block completely:
  - drop or narrow `nextQFor`'s ALLDATA override;
  - turn the C095 and 🌱 lines into context;
  - add `kind` to the `chat_invent` template;
  - optionally pass `chatNat` as `nat` in `chat_solved`.
- `live_new` from chat still neither navigates nor confirms (s13/s19). G5 only asked for `nat`.
- `mentions` synonyms («دو بچه» ⇄ «دوفرزندی») still need semantics, unchanged.
