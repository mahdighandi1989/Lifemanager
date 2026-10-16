# Tour 1 (Pólya), round 10 (zero-defect round): «live» fixer handoff (2026-10-16)

Scope: J3 and the liveCoach / live-block side of J1 from `DECISIONS_R10.md` (DECISIONS_R2–R8 still bind). File changed: `apps/learning-architecture/src/app/a38_live.js` (no edits to a26, a29 or the coach-owned a27/a28/a35/a36/a37). Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Commits (base 97f1595)
- `883b193`: all code below, the new test, and the rebuilt bundle.
- This note is the last commit.

## Test
`tests/test_tour1_r10_live.js`, sections `head`, `dedupe`, `d5`, `only`, `ctx`, `one` (`ONLY=head,d5`). Each section drives the real forms and the real assistant panel (stub model) and reads the rendered look-back options or the prompt that was sent.
Red baseline: `LLA_FILE=<97f1595 dist html> node tests/test_tour1_r10_live.js` exits 1 with 9 failing checks (head, dedupe, d5 ×3, only, ctx practical/proverb, ctx unset judge, one). The fixed build prints «NO ERRORS». The same-day refuted-guess sub-check of `ctx` was already green on the base (a27 already rewrote that line); it stays as a guard because a38 now writes the line in context form itself.

## What changed
1. **J3: lpBBest keeps the whole question (s25 c16).**
   - A head before «—» with a 2nd-person perfect verb («وارسی کرده‌ای»، «دیده‌ای»، «نوشته‌ای»…; `HEADPERF_RE`) is part of the question. A praise head («آفرین، … پیش رفته‌ای —»; `PRAISE_HEAD`) is still a preamble and is cut.
   - A tail starting with «و» + a word («— و در گامِ استقرا…») is coordinate with its head (`TAILREF_RE`), so it is never shown alone.
2. **J3: one option for a page question and its chat paraphrase (s05).** `sameQPair`: the question bodies (a leading label such as «به مجهول نگاه کن:» removed) share more than half of each side's words, matched by stem (`hit`: «می‌فهمی» ⇄ «می‌فهمیدی»). A matching chat question is dropped from lpBBest; the page question stays. A chat question that only shares a few words keeps its own option.
3. **D5 (s28).**
   - `toks`: a number word glued to «فرزند/بچه» is split («دوفرزندی» ⇒ «دو فرزند»), and «بچه»/«فرزندان» map to «فرزند». So «دو بچه» counts as used in «خانواده‌های دوفرزندی».
   - Plan save: an unused datum the user has **not answered** is a word-based guess, so it now goes through `softGate` (E4). The first save warns once and names the datum. A second save with a one-line «ثبت با همین — دلیل» (`#lpPSoftWhy`) saves the plan; `L.plan.soft` and `L.softLog {where:"p"}` record it, and the datum is stored `ans:"soft"` (counted as used, like «use»).
   - The user's own answers («لازم نیست» without a 3-word reason, a duplicate reason, «نمی‌دانم» without a sentence) are content checks and still block.
4. **J1, liveCoach side.**
   - `A.liveCoach(pid, {turn:{onlyAns}})` takes `turn.onlyAns` as a turn act with the highest priority in step (1): turn question «پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟», src `turn-onlyans`.
   - A boolean `turn.onlyAns` from the coach wins. Without one (older callers, the a38 hook), a38 decides itself (`onlyAnsNow`). It fires when the user's own text (quotes removed) asks for «فقط جواب / جوابش رو بگو / خودت بگو…» (`ONLY_ANS_L`, same shape as a27's `ONLY_ANS_RE`), the text shows no attempt (`ATTEMPT_L`: «حساب/امتحان/فرض کردم»، «رسیدم»، «تا اینجا»، «حدسم»، «به نظرم»، «فکر کنم»، an «=»…), and the page has no plan, plan draft or step. The phase must be understanding, plan or execution.
   - `A.liveOnlyAns(text)` is exported so the coach can share the pattern.
   - Already asked in this chat ⇒ not repeated, through the usual `asked` filter.
   - The src starts with «turn-», so a27's `cardQ` keeps the coach's mid-course line out of that turn.
5. **J1, the live block's own lines (a38 hook).** When the block has a turn question, every other line that suggested a question is now «- زمینه (نه پرسشِ دوم): …» with no «بپرس»:
   - the practical frame
   - the rote warning
   - the same-day refuted guess (same wording as a27's rewrite)
   - the contradictory condition
   - the kept presupposition
   - his own proverb
   - the isomorphism mapping (now with the prefix, not mid-line)
   
   An unset judge (D4) keeps «پیش از هر پرسشِ دیگر بپرس…» as the one question, and the list question beside it becomes context («پرسشِ بعد از روشن شدنِ داور…»). The exception is a turn act (`turn-*`): then the turn act is the question and the judge line is context.
   
   Not touched: the unused-data line, because a27 rewrites it by its prefix and `UNUSED_HEAD` would duplicate it. It is conditional («اگر گیر است…»). The «این گفت‌وگو به همین مسئله بسته است» line is also conditional on another event.

## For the coach fixer (J1 structural)
- Pass `turn.onlyAns` (boolean) from `turnSig` when A073 fires without a visible attempt. a38 then uses your judgement and not its own fallback.
- The 🌱 block, C095, the rung-3 imaginary teacher and the proverb «⇐ همان پرسش» are in a27/coach lines and were not changed here.
- My structural check (`one`) counts as a directive: the «فقط **یک** پرسش» line, «همهٔ پرسش‌های این مرحله…», or any «- …» line with «بپرس» that is not «زمینه (نه پرسشِ دوم)». It excludes the unused-data line and the «بسته است» line. It runs over the live blocks of 7 real turns.

## Gate
- Full page suite via `python -m pytest tests/test_learning_architecture_graph_browser.py -q`: see the final report.
- SYS stays 19988 (≤ 20000). I did not touch the system prompt.
