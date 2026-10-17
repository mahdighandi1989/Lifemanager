# Tour 1 (Pólya), round 17: coach fixer handoff (2026-10-17)

Scope: RC1, RC3, RC4, RC5, A·D6 and B·D5 from `DECISIONS_R17.md` (earlier DECISIONS still bind). Base: `14988f56` (fast-forwarded tip of `claude/life-program-flow-diagram-q37jvr`).

Files changed:
- `apps/learning-architecture/src/app/a27_tour.js` and the rebuilt bundle.
- Tests: new `tests/test_tour1_r17_coach.js` and `tests/tour1_variants_r17.js`, plus edits to `tests/test_tour1_r16_coach.js`.
- `docs/overhaul/REMOVAL_CANDIDATES.md`: the quarantine entry.

Not touched: a38, a26, the SYS prompt. a28, a35, a36 and a37 needed no change.

Not done here: WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences, push, merge.

## Commits
- `49c1eb39` `test(lla)`: adds `tests/test_tour1_r17_coach.js` and the variant bank. The bank is embedded as `tests/tour1_variants_r17.js` because the pytest gate copies only `tests/*.js` into its sandbox. This commit was red on base, with 90 failures.
- `57d714f5` `fix(lla)`: RC1, RC3, RC4, RC5, the two cosmetic items and the rebuilt bundle.
- This note.

## Status of each item

| Item | Status | What changed |
|---|---|---|
| RC1 (A·D1 s01, D·5 s32/s34, D·6 s32, B pr2, D·2 s31, C·V4 s27, C·V2 s25) | fixed | `coach_state` takes `plan {text, when}`, `defer {what}`, `taste {text}\|"unknown"`, `register "تو"\|"شما"` and `guess {text}`. The page checks each one before acting (`csExtra`); see "How the page checks the model's report" below. The keyword patterns now only add conditional lines («اگر … این را تو داوری کن») and never store anything. The old storing functions are quarantined, not deleted: `dupLinkR16`, `promScanR16`, `regOfR16` and `verdictR16`, all reachable through `ASSIST.R16_QUARANTINE`. A hook line «# گزارشِ وضع (همهٔ نوبت‌ها)» asks for these fields in every turn; it is a hook, not SYS. |
| RC3 (A·G1, B·D4) | fixed | A filter rewrites the long «🔭» block (a38 RULES, without editing a38) and a27's `LIVE_FALLBACK`. They now say «ساختنش (live_new) فقط طبقِ «🔭 … (قاعدهٔ کوتاه)» است؛ پس از ساختن، …» instead of «ثبتش کن». If that block appears without the compact rule, the compact rule is added. The plan follow-up lines no longer restate a deadline modality («آری ِ او موعدِ خودش است»), so they do not clash with the SYS `deadline` rule. A test scans the whole prompt (SYS plus user prompt): for every action name, the lines that mention it must not mix offer markers with do markers. |
| RC4 (D·4 s31) | fixed | «وارسی شد» comes only from `coach_state.check {msgs}` or `chat_solved.checkMsgs`; the accepted messages are listed below. When the model gives no report, word overlap can only give `maybe`. That verdict is stored as `b.verdict = "maybe"`, and its summary reads «نتیجه سالم ماند — به گزارشِ گفت‌وگو؛ از پیام‌های خودت هنوز سنجیده نشد». The page shows «وارسی نشد» only when nothing at all in her messages relates to the check. |
| RC5 (A·D4 s08, D·3 s31) | fixed | A look-back question now counts as asked in any of three cases (`lbRestOf` → `askedByAi`):<br>• the page asked it;<br>• the assistant asked any form of it after this problem's closure, up to the next closure (one window per problem);<br>• the model reported `"unknown"`.<br>A message that itself answers «کدام پرسش کمک کرد؟» does not get that question as the turn question. A context line «# پاسخ به پرسشِ بازنگری (شاید)» asks the model to record the answer with `chat_lookback`. `lbApply` never stores the taste `"unknown"`. |
| A·D6 | fixed | The card says «همان که» when one question is left and «همان‌ها که» when two are left. |
| B·D5 | fixed | One verb-stem list (`STEMS`) drives both the subjunctive and the new imperative rule: «بزن/نزن/بزنش» ⇒ «بزنید/نزنید/بزنیدش», and «بگو/بیازما» ⇒ «بگویید/بیازمایید». Nouns, adjectives and past forms that start with ب stay unchanged (control in the test). |

### How the page checks the model's report (RC1)
- The quoted text must occur in her message. Persian digits, ZWNJ and punctuation are normalised first, so numbers and formulas count. Failing that, every content word of the quote must appear in the message.
- A `when` date must be a real date and not in the past; otherwise the page computes the date itself.
- `register` is accepted only if her own message, with quoted text removed, shows signs of that register.
- `defer` must quote one of her last six messages.
- `taste "unknown"` marks the question as asked but stores nothing.
- `guess` is stored at `s.coach.guess = {text, key, at}`. If this turn's `chat_invent` matched a duplicate problem, the guess also goes into that problem's `solve.g[1]`. This works in either action order: `C.dupPend` covers one order and `C.guess` the other.

### Which messages count as a check (RC4)
A cited message counts only if all of these hold:
- it is the user's message (quote or 1-based number);
- it is in this session;
- it comes at or after the message that stated this problem;
- it is not a check of an answer that conflicts with `solution`.

## Variant bank (VARIANTS_R17.json, 211 entries)
Every RC1, RC4 and RC5 entry runs through the real assistant, with a stub model sending the literal reply.

| Category | Entries | Passing |
|---|---|---|
| RC1 plan | 10 pos / 10 neg, plus the s01 and s32 sentences | all |
| RC1 defer | 9 / 9 | all |
| RC1 taste | 9 / 9, plus the s31 sentence | all |
| RC1 register | 9 / 9, plus the s27 sentence | all |
| RC1 guess | 9 / 9 | all |
| RC4 | 8 / 9 | all |
| RC5 | 8 / 9 | all |

- **Positive entries:** the model reports the field and the page validates it and acts on it.
- **Negative entries:** the model omits the field, or sends `"unknown"` where the bank says so. Nothing is stored, and any fallback line is conditional.
- **Naive reports:** the page rejects a naive model's report on substring, quote or preposition cases, quotes that are not in her message, impossible dates, `taste "unknown"` sent through `chat_lookback`, a cited assistant message, a missing id, a message from another problem, and an abandoned answer.
- The RC2 entries belong to the live fixer.

## Judgement calls
- **When «وارسی نشد» is still shown.** The page shows it when the model sent no `check` at all, or when no content word of the check appears in her messages for this problem (W4 of `test_tour1_integration`). Anything weaker is `maybe`. I read «never to deny» as "overlap never denies". Having no evidence at all is not an overlap judgement.
- **Register fallback.** When the model has not reported a register, only the assistant's own forms in the conversation count, then earlier linked sessions. A user's «شما» alone never switches the conversation. s12 still gives «شما», because the assistant spoke with «شما» there.
- **The bank's s14 pr2 expectation.** The bank expects «اثبات‌ها به چه درد…» to be stored as a defer when the model reports it. Because this is now the model's call, the page accepts it whenever her message contains the quote.
- **RC3 without editing a38.** a38's RULES text is rewritten in a27's prompt filter. That is the existing pattern for blocks owned by another file (see the a26 comment on `promptFilters`). If the live owner rewords RULES later, the regex falls back to replacing «ثبتش کن», and the modality test catches any drift.
- **r16 test edits.** All three edits follow from the new rules:
  - n1: the closure reply no longer asks «کدام پرسش…». If it did, that question would count as asked, so expecting the page to ask it again was exactly the A·D4 nag.
  - n3: the model now reports the guess.
  - n5: the model now reports the defer.
  The intent of each check is unchanged.
- **Variant rewrites in my test.** Two bank cases were reworded:
  - RC5 neg5: the user says «خب، تمرینِ بعدی چیه؟» instead of «باشه.». «باشه» is in the not-a-problem list, so the coach block, and with it the look-back turn question, never appears. That is existing behaviour and outside RC5.
  - RC4 "refuting check" and "intention only": these use the literal model, which makes no check claim, because the page cannot judge refutation semantically.
- **For the live fixer (RC2c).** The validated guess is at `s.coach.guess = {text, key, at}`, where `key` = `mkey(user message)`. The validated check messages are at `s.coach.checkRep`.
- **Cross-area.** `docs/overhaul/REMOVAL_CANDIDATES.md` is area `app`, owned by urgent and general. It was edited as rule 2 requires.

## Results
- `node tests/test_tour1_r17_coach.js`: NO ERRORS. It was red on `49c1eb39` with the base bundle (90 failures).
- `node tests/test_tour1_r16_coach.js`: NO ERRORS.
- `python -m pytest tests/test_learning_architecture_graph_browser.py -q -p no:cacheprovider` with the default 4 jobs: **96 passed**.
  - One earlier run with `LLA_BROWSER_JOBS=6` timed out once on `test_fixes_1015b.js` under load. That test passes on its own, and the 4-job run had no failures.
- `python3 apps/learning-architecture/build.py --check`: in sync.
- `tests/test_learning_architecture_handbook.py`: 6 passed.
- SYS prompt: untouched (it was 19988 characters, under the 20000 limit).
