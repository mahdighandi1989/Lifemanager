# Handoff — Pólya tour round 30, fixer «prior» (F17 + F11 prior side + tail A30-21, A30-22, C27-3)

Contracts the other round-30 fixers must respect (functions changed, exports added):

## a45_story.js (shared with story)
- `priorTurn25` (prior ledger turn):
  - `its` (step/res items that may become «اصلاحِ خودش») now drops any item located inside another person's span (`ST.otherWorks29`, the C125 boundary). After «… X گفت …، پس <calc>» the part after «پس» is still hers (C125 unchanged).
  - `stale29` now ends with `redo30(x, I0)`: a stale step takes only a recomputation of **that** step — its new result (`re` of a number that was the step's result), or a new input together with one of the step's other operands. «۲۲ ÷ ۷ ≈ ۳ روز» no longer rewrites «۲۰ × ۱٫۱۲ = ۲۲٫۴» (D30-1).
  - `oth30 = otherProb30(s, ut, pid)`: a message that opens a different problem («یه باغچهٔ دیگه هم دارم …», «یه مسئله‌ی جدا: …») while a live problem is bound never merges its `prior` into that live ledger and never goes through the `its` fix path (C30-11, prior side). **Story:** if you split such a message into its own record (`C.split25` + unbind, as `newProbAt` already does for «یه مسئلهٔ دیگه»), the ledger follows automatically (`pid` empty, `splitNow28` ⇒ `open0`). Exported as `ST.priorOtherProb30`.
  - `pagePrior30` (new, `ST.pagePrior30`): when the page itself asked for prior work (`ST.priorAsk` in the prompt hook — recorded as `s.coach.prAsk30 = {k, pid}`) and the model sent no `prior`, the page builds the ledger from her own message: «گام N:» labels (≥2) or else every clause the engine read (`ST.arithClauses`, other-person spans excluded). Verdicts: ✗ engine-bad; ✓ only when every clause of the step is an engine-✓ claim; otherwise «نسنجیده». Steps carry `page30: true`. Built only at the opening of a new problem (`NEWP27`, `OTHERP30`, `splitNow28`, `coach.np28`), only for ≥ 2 steps, never from example sentences («مثلاً / فرض کن / اگه …», `EX30`) — a single calculation or «یه حساب دیگه هم کردم: …» keeps story's 📜 lines.
- `applyFix`: `x.fixed.t` is now `calcSpan30(t)` (`ST.priorCalcSpan30`): from the first sentence with an engine claim clause (or a «پس N …» conclusion) to the last digit-bearing sentence; a numberless conclusion «… . پس بانکِ اول ارزون‌تره» stays part of the step; a meta lead-in label («منظورم … بود:», «گامِ ۳ رو درست کنم:», «خودم حساب کردم:») is dropped; item labels («دکمه:», «روزی ۵ تا:», «گام ۱:») stay. The whole message stays in `x.fixed.full`. Correction / story code that compares a later quote with `fixed.t` must use containment (the existing `hold()` does).
- Prompt hook (the «# کارِ پیشینِ تو» ask): records `s.coach.prAsk30`; nothing printed changed (AS.SYS untouched).

## a27_tour.js (shared with story, dates, surface)
- `csExtra` guess branch: `selfVerdict30(ut, gt)` (exported `AS.selfVerdict30`) — a model `guess` that is her own verdict («فکر کنم درسته», «به نظرم درسته», «همینه») on a result whose every number already appeared in her own worked text earlier in the same message («فهرست/حساب کردم، شمردم، نوشتم …») is not registered (no `C.guess`, no `guessReg`, no `solve.g`) — C27-3. Look-alikes kept as guesses: a new number not in her work, «فکر کنم ۱/۲ درسته» without work, «پس ۱/۲» after «همین که گفتم!».

## Not touched
a46 (arith) — only `ST.arithClauses` / `ST.arithChk` are called. a38, a40, a41 untouched.
