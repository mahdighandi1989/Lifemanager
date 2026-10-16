# Tour 1 (Pólya), round 11 (zero-defect round 2): «live» fixer handoff (2026-10-16)

Scope: K1 (live side), K3 (a38 side), K4, K6 from `DECISIONS_R11.md` (DECISIONS_R2–R10 still bind). Base 9aa88c9.
File changed: `apps/learning-architecture/src/app/a38_live.js` only (a26/a29 have no question-directive lines; nothing to change there).
Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Test
`tests/test_tour1_r11_live.js`, sections `only`, `qword`, `paren`, `ctx`, `soft` (`ONLY=only,soft`; `DUMP=1` prints the collected live blocks).
Each section drives the real assistant panel (stub model) and the real «🔭» forms, and reads the prompt that was sent, `APP.liveChatQs`, the
rendered `#lpBBest` options, or the rendered plan/understanding cards.
Red baseline: `LLA_FILE=<9aa88c9 dist html> node tests/test_tour1_r11_live.js` exits 1 with 16 failing checks across all five sections.
The fixed build prints «NO ERRORS».

## What changed
1. **K1, live side.** Every a38 live-block line that suggested a question is now «- زمینه (نه پرسشِ دوم): …» with no «بپرس», in every state.
   Before, this only happened when the block itself had a turn question.
   - Lines covered: practical frame, rote, refuted guess, contradictory condition, kept presupposition, own proverb.
   - **Unused-data line:** now context. It names «همهٔ داده‌ها را به کار بردی؟» / «از … استفاده کردی؟» as *candidates* for the turn question when stuck.
     Because a27's rewrite regex no longer matches it, a27's «اگر گیر است، اول کلی بپرس» text no longer reaches the prompt. a27's `UNUSED_HEAD` already accepts the prefix, so its own `unusedLine` is not added twice.
   - **Bound-session line** («این گفت‌وگو به همین مسئله بسته است…»): now context, without «اول بپرس».
   - **Turn lines unchanged:** «فقط **یک** پرسش» (replaced by a27's `oneQLine`) and the unset-judge question «پیش از هر پرسشِ دیگر بپرس…» (D4) are still the turn lines.
   - **Lines a27 rewrites or filters, left as they are:** the stage-proverb line «حکمتِ ضرب‌المثل‌ها…» (a27 filters it out), the objective/life frame (replaced by `AS.liveFrame`), and the «پرسش‌های همین مرحله» list.
2. **K3 (`ONLY_ANS_L`, also used by a27 through `A.liveOnlyAns`).** It now also matches «زود بگو/بگید/جواب بده», «یه/یک راه‌حل بده/بگو», «راه‌حلش رو بگو» and «فقط بگو X یا Y؟».
   - `ATTEMPT_L` still excludes a message that shows an attempt.
   - «برم یا بمونم؟» without «فقط بگو» is not caught.
3. **K4.**
   - `QWORD` accepts 2nd-person present verbs: «(ن)می‌…ی», plus subjunctive «بگویی/بنویسی/ببینی/…». It also accepts «چیست».
   - `clauseOf`: a chat question that matches one «؛»-clause of a list question (two-sided `sameQPair`) maps to that list question. The same goes for a chat question that asks for restating «به زبانِ خودت»: this is an explicit link to Pólya's question, not word overlap. So A191 «کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟» maps to u5 «… مسئله را به زبانِ خودت دوباره بگو» and is offered once in lpBBest, as «💬 <u5>».
   - **Parenthetical heads:** a head that itself contains «—» makes the tail's «—» the closing one of an aside. The whole sentence is kept, so the referent stays: s01 «… مهدکودک — که با دلیل کنار گذاشته بودی — هنوز بی‌ربط است؟». Praise preambles before the first «—» are still cut, and the tail rule is then applied again.
4. **K6 (all three soft gates: understanding, plan, look-back).**
   - `softGate` records `d.softMsgs` (the word-based warnings) and `d.softHard` (the hard items still open at the same time).
   - `softField` is one self-contained card: the «حدس زده شده…» wording, *its own* list of warnings, and the reason field. When a hard item is also open, the card says the reason only passes these warnings. After the reason is accepted it says «… پذیرفته شد؛ ثبت فقط منتظرِ موردهای «هنوز نه» است».
   - «هنوز نه: …» lists only hard items (`.lp-hardmiss`).
   - **Understanding and plan cards:** the soft card sits in the same `.lp-umiss` / `.lp-planmiss` container, directly under «هنوز نه» (below the save button). The second copy above the button is gone.
   - **Look-back card:** the soft card stays above the buttons and is replaced in place on each save. Toasts name only the hard items and point to the soft card.

## Old expectation updated (decision K1 changed it)
- `tests/test_tour1_r2_assist.js` (R3): the regex for the a38 unused-data line now accepts the «- زمینه (نه پرسشِ دوم): » prefix.

## For the coach fixer
- My structural check (`ctx`) skips two lines that a27 adds to the live block, because those lines are the coach's to fix:
  - `unusedLine` «در طرح/گام‌ها به کار نرفته … اگر گیر است، اول کلی بپرس»;
  - non-fresh `refutedLine` «حدسی که خودش با آزمون رد کرد: N».
  `unusedLine` still has «بپرس» when a38 emits no unused line (plan phase, not stuck).
- a27's own `ONLY_ANS_RE` (lines 1102/1382/1514) is not changed. a27's `nextQFor` already prefers `A.liveOnlyAns`, so it now gets the wider family; the coach-only path (no live problem) needs `ONLY_ANS_RE` widened the same way.
- The «📎»/«🔭 مسئلهٔ واقعیِ تازه؟» blocks, `solvedBlock` and the open-problem block are a27's.

## Gate
- Full page suite `python -m pytest tests/test_learning_architecture_graph_browser.py -q`: 87 files. On the final commit, 50 passed inside pytest. The other 37 failed only when the machine was loaded (a 41-minute run with other sessions' Chromium processes alive); each of the 37 passes when run alone in sequence: `exit=0`, «NO ERRORS».
- Two failures that really came from my changes were fixed:
  - `test_tour1_integration` W8: same K1 prefix as R3 (old expectation updated).
  - `test_tour1_r3_live` A13: the toast had dropped the soft message; it now lists soft warnings in a separately labelled part.
- Commits: `d076303` (code + new test), `181c72e` (r2_assist expectation), `1cad7b8` (toast split + integration expectation), plus this note.
- SYS stays 19988 (≤ 20000).
