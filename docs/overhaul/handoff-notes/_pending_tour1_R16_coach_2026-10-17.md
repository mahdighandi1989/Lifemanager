# Tour 1 (Pólya), round 16: coach fixer handoff (2026-10-17)

Scope: N1–N6 from `DECISIONS_R16.md` (earlier DECISIONS still bind). Base 96322acd (fast-forwarded).
Files changed: `apps/learning-architecture/src/app/a27_tour.js` only, plus the rebuilt bundle. I did not touch a38, a26, a28, a35, a36 or a37, and no registry,
so there is no cross-area handoff. Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Commits
- 83b30eea `test(lla)`: new `tests/test_tour1_r16_coach.js`, committed red on 96322acd (23 failures).
- 484a5e37 `fix(lla)`: N1–N6 and the rebuilt bundle.
- this note.

## Test
`tests/test_tour1_r16_coach.js` has eight sections: `n1`, `n1page`, `n2`, `n3`, `n4`, `n5`, `n6` and `strict` (`ONLY=n1,n4`). It runs through the real assistant panel with a stub model.
It prints «NO ERRORS» on the fixed build.

## Status of each item (all fixed)
| Item | What changed (a27) | Section |
|---|---|---|
| N1 (s31 D2, s08 F4) | `chat_solved` takes `bestQ`/`taste` and stores them on `solve.b[1]` (the same fields as the page look-back: `bestQ`, `bestKind: chat`, `L.bestQ`, `taste`). The new action `chat_lookback {pid, bestQ|taste|bestNone}` stores a later answer. The closure rule asks for both, one per turn. The new coach moment `lbRest` asks the missing piece in the closure session, best first and then taste, each once. When the user mentions taste in a later session, a context line names the chat-closed problem that still lacks taste. On the problem page, a card «بازنگری: دو پرسشِ باقی‌مانده» («یک پرسشِ…» when only one is missing) sits next to the look-back summary until both are answered. It has a labelled select and textarea and saves to the same fields. | `n1`, `n1page` |
| N2 (s20 D1) | `LIVE_COMPACT`: a one-line «🔭» rule (what it is; offer it by meaning; `live_new` with `nat` only on the user's yes; never automatic) is added to every prompt except a session bound to an open problem. `LIVE_STUCK` («N ماهه/ساله + دارم/روش/می‌خوام…», «ماه‌هاست», «فکرم کار نمی‌کنه», «گیر کردم روش», «می‌خوام نشون بدم … یا نه») brings the full block. | `n2` |
| N3 (s11 D1) | The duplicate paths of `chat_invent` (sameProblem and the restated twin) call `dupLink`. `dupLink` runs `sessLink`, which writes lprobLog through `liveBindSession`. If the user's latest message carries an explicit guess marker and the problem has no guess yet, it also stores the guess as `solve.g[1]` (`from: chat`). | `n3` |
| N4 (s12 D1) | `convRegister`: «شما» if the user wrote «شما/خودتان», otherwise the majority of assistant verb and possessive forms. A fresh session with no evidence falls back only to sessions linked to problems named in the prompt. In a «شما» conversation, the top-level «…» quotes on turn lines and «بپرس» lines go through `toShoma`; quotes nested inside them (the user's own words) are left as they are. The rule line «ضمیرِ گفت‌وگو (شما/تو) را عوض نکن» goes into the coach block. | `n4` (control: «تو» stays «تو») |
| N5 (s14 obs.) | `promScan`: an explicit artifact request (بده/بنویس/بساز…, not an answer request) followed by an assistant deferral (رد نمی‌کنم، ولی اول / بعداً / بگذار برای …) becomes `s.promises`. It shows as a context line until `promise_done {id}` or until the user declines (نمی‌خوام/لازم نیست/بی‌خیال plus a shared content word). | `n5` |
| N6 (s15 obs.) | A sentence with the user's own plan, a time marker (هر هفته/هر سه‌شنبه/فردا/هفتهٔ بعد…) and a first-person verb brings a context line. The line offers a follow-up with the existing `deadline` action and a computed date (next weekday, +1, +2 or +7). It is an offer only; «امروز» shows the deadline. | `n6` |

## Judgement calls
- **N1 page card without editing a38.** The card is inserted from a27 after `A.render` on `lprob`/`e_prob`, next to `.lp-lbsum`. The live fixer's a38 code is untouched, and a38 needs no new function.
- **Where "the mind/report side" reads taste.** Nothing in a29/a30 reads `b.taste` today. Its only reader is a38's look-back summary («سلیقه‌ات»). Writing the same field therefore gives the chat path exactly what the page path has. No extra reader was invented.
- **`lbRest` stops on its own.** Each missing piece is the turn question at most once (`s.coach.lbAsk`); after that the page card holds it. It sits below the message's own moments (guess, «فقط جواب», look-back lesson, blind recall), so r12 L6 stays green. No numeric threshold is used.
- **Register fallback.** A session-wide fallback leaked one scenario's «شما» into an unrelated chat (r12 L6), so the fallback is limited to sessions linked to the problems in the prompt. s12 still works, because the recall block names the solved problem and that problem's chat session said «شما».
- **The compact «🔭» line is in every unbound prompt,** next to the full block when that one triggers. "ALWAYS" was taken literally, except in bound sessions, where the R1 rule forbids live_new forms. It is a context line with no question, so the strict scans of r11, r12 and r16 stay green. The system prompt (SYS 19988 < 20000) is untouched.

## Results (executed)
- `node tests/test_tour1_r16_coach.js`: NO ERRORS (red on 96322acd: 23 errors).
- `python -m pytest tests/test_learning_architecture_graph_browser.py -q -p no:cacheprovider`: **94 passed**.
- `python3 apps/learning-architecture/build.py --check`: in sync. `tests/test_learning_architecture_handbook.py`: 6 passed.
