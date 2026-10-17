# Tour 1 (Pólya), round 12 (zero-defect round 4): «live» fixer handoff (2026-10-17)

Scope: L2 (live part), L4, L5 from `DECISIONS_R12.md` (DECISIONS_R2–R11 still bind). Base 53d0fc6.
Files changed: `apps/learning-architecture/src/app/a38_live.js`, `src/app/a26_assist.js` (one line), tests. a29 has no prompt directive lines.
Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Test
`tests/test_tour1_r12_live.js`, sections `incub`, `whole`, `chat`, `multi`, `strict` (`ONLY=whole,multi`).
Everything runs through the real assistant panel (stub model) and the real «🔭» forms. Each section reads one of:
- the prompt that was sent;
- the raw a38 live block, copied by a pass-through first prompt filter;
- `APP.liveCoach`;
- `APP.liveChatQs`;
- the rendered `#lpBBest`.

The test's page day is the real clock day. `r.created` uses the real clock, so a fixed future date would make «میانهٔ راه» fall due wrongly on a problem that was just created.

Red baseline: `LLA_FILE=<53d0fc6 dist html> node tests/test_tour1_r12_live.js` exits 1 with 17 failing checks across all five sections. The fixed build prints «NO ERRORS».

## What changed
1. **L4, whole-first card (s21…s29).**
   - In phase u, `coachCore`'s `pageQ` is `Q_WHOLE` while the «اول کل، بعد جزءها» card is open. The card counts as open when `uDraft.wholeOk` is false, or when there is no draft and the understanding has no `one`.
   - `Q_WHOLE` = «اول کل، بعد جزءها: کلِ مسئله را بی‌جزئیات، در یک جملهٔ کامل و به زبانِ خودت، می‌گویی؟». It matches the coach's A191, and is exported as `A.liveWholeQ`.
   - So «هم‌گام با صفحه» is now true, and the turn question is the whole-first question.
   - The a38 hook counts it as "asked" once the assistant has said it. It is then not repeated every turn, and the ladder continues.
   - After «ثبتِ کل», `pageQ` is the first parts question, as before.
2. **L4, incubation card (s34 p6).**
   - The «😴 … چه چیزی به ذهنت رسید؟» card is skipped as the turn question when this turn's message reports an idea. The pattern is `IDEA_RPT` («به ذهنم رسید/اومد/زد», «یه ایده … دارم/رسید/پیدا کردم»); negations such as «به ذهنم نرسید» do not match.
   - The turn text is `T.text`, or, for the coach's call with no turn signals inside prompt building (`AS.liveNextQ(pid)` for «مسئلهٔ بازِ تو», the s34 path), the hook-context message. A `[سامانه…]` message is never used.
   - The card stays on the page so the user can record the idea.
3. **L5, this problem only (s29 c23).** `chatQs` reads a session's AI messages through `msgWin`:
   - In the creating session (`r.sess`), it starts from the AI reply that created the problem with `live_new` and was sent at or before `r.created`.
   - An earlier turn counts only if its user message shared at least two words with the title and statement. The s29 garden question is dropped; a pre-creation turn about the pond keeps its question.
   - A session that later moved to another problem is cut at the next `live_new` reply or at its `lprobAt`.
4. **L5, one option (s02, s11, s01).**
   - A known question with more than one sentence is kept as ONE option, whole, with no tail cutting, when the assistant echoes it in consecutive sentences.
   - Known questions here are: the phase lists, `Q_GUESST`, `Q_RELUSE`, `Q_LINK`, `Q_PARTAUX`, `Q_ALLD`, `Q_ONLYANS`, `Q_LINE`, `Q_AUXP`, `Q_BACKW`, `Q_RESTATE_C`, `Q_ANALIM`, `Q_BASE`, `Q_EQUIV`, `EQ_FEW`, `Q_WHOLE` and `resultQ`.
   - The echo is recognised with or without a preamble («… را درست یا غلط نمی‌خوانم؛»), and with or without its «حدسی گفتی —» head.
   - `#lpBBest` shows «💬 <Q_GUESST>» once.
   - The coach's `turn.guess` semantics are unchanged: a38 still just reads `T.guess`.
5. **L2, live part.**
   - **Objective-frame line:** a38's line no longer quotes «روشن می‌بینی…؟ می‌توانی ثابت کنی؟». It keeps its `^- این مسئله پاسخِ عینی دارد` head, so a27 still replaces it with `AS.liveFrame`.
   - **Book line:** «از کتاب برای همین مرحله…» (پارادوکسِ مخترع, «به تعریف‌ها برگرد», …) is now `زمینه (نه پرسشِ دوم)`.
   - **Ladder-end line:** it is context while the unset-judge question (D4) is the turn line.
   - **a26 «# امروز» line:** «… اگر گذشته یا ناممکن است، یک بار بپرس» is now context: a candidate for the turn question.
   - **Stage-proverb line:** unchanged. a27 always filters it out by its head regex, and the test asserts it never reaches the final prompt.

## For the coach fixer
- The objective-frame text the runners saw in the prompt (s11 p3/p4, «روشن می‌بینی این گام درست است؟ می‌توانی ثابتش کنی؟») is **a27's `AS.liveFrame` (a27:1206/1208)**, which replaces a38's line at a27:2030. a38's own line can never reach the prompt.
  - I fixed a38's text.
  - The `liveFrame` obj/default texts still quote the question unmarked. That is in your file and under your whole-prompt structural test.
- **Off-page path:** the s34 off-page path now gets the right `openO.q` from `AS.liveNextQ`, with no change on your side.
- **Phase-list label in the coach block:** in the off-page s34-like prompt, the coach block's list line still reads «پرسش‌های «فهمِ مسئله»» for a problem that is in planning. I only observed this and did not change it.

## Old expectation updated (decision L2 changed it)
- `tests/test_tour1_r4_live.js` E8: the book-line regex now accepts the «- زمینه (نه پرسشِ دوم): » prefix.
