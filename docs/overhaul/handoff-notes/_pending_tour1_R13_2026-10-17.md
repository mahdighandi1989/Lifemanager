# Tour 1 (Pólya), round 13 (zero-defect round 5): fixer handoff (2026-10-17)

Scope: M1–M4 from `DECISIONS_R13.md` (DECISIONS_R2–R12 still bind). Base 9898aa1. One fixer owned both `a38_live.js` and `a27_tour.js`.
Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Test
`apps/learning-architecture/tests/test_tour1_r13.js`, sections `form`, `switch`, `invent`, `echo`, `whole`, `proof` (`ONLY=form,echo`).
Everything goes through the real assistant panel (stub model; the stub may be a function of the prompt, used to read the form's k-keys),
the real «🔭» forms, `APP.liveChatQs`, the final prompt's live/coach blocks and `APP.ASSIST.coachLedger`.
Red baseline: `LLA_FILE=<9898aa1 dist html> node tests/test_tour1_r13.js` fails 13 checks across all six sections; every control passes on both builds.
The fixed build prints «NO ERRORS».

## What changed
1. **M1 (a38), one window rule for «کدام پرسش کمک کرد؟».**
   - Sessions now keep an additive `se.lprobLog` = [{p, at, ai}] written by `A.liveBindSession` / `A.liveUnbindSession` (`ai` = bound during the
     assistant's turn of this session, e.g. live_new or the assistant's «ساختن» click). `lprob`/`lprobAt` are unchanged. Entries older than the
     session's first kept message are pruned except the latest one.
   - `msgWin` start: the creating reply (live_new / chat_invent / chat_solved — `creatIdx`), the reply whose action bound the session (`ai`), or the
     first message after a user-side switch; unknown ⇒ `r.created`/id time. End: the next bind of the session to another problem (or unbind).
     Legacy sessions with no log fall back to `lprobAt` and other problems' live_new replies.
   - chat_solved-created problems were solved and reviewed in chat before being filed (a27 rule) ⇒ window from the session start when no earlier
     subject exists, else from the first user message after that subject that names the problem, else the creating reply.
   - chat_invent problems (put aside, `dormant`) never became the subject ⇒ from their creating reply only the questions that name them
     (title words not shared with siblings created by the same reply); such a question is also removed from every other problem's list.
   - `chatQs` also reads sessions whose `lprobLog` mentions the problem (s36 brine was empty because its session had moved on).
2. **M2 (a38).** `joinKnown` recognises a known page question by its text: continuation sentences match exactly, or (for a question sentence)
   a paraphrased question that refers back («ردش»، «آن»، «این»، «اش», or a «…ش» word of the page sentence); trailing non-question sentences are
   optional, no question sentence may be missing. A joined item is accepted as a question without needing a trailing «؟» (Q_LINK, resultQ, Q_LINE, EQ_FEW).
3. **M3 (a27).** While the whole-first card is open (`nq.coach.pageQ === A.liveWholeQ`) the coach list starts with `u0) «…»` and `C.qmap.u0`.
   `coach_state` accepts `u0` only when the same validated report says the message gave the unknown AND a condition or data (`said` ⊇ u and c|d);
   then the ledger stops the repeat (coachCore treats the asked page question as not ok and moves on). The page card stays until «ثبتِ کل».
4. **M4 (a27).** `proofQ(text)`: tested cases failed («نشد»، «نمیشه»، «جور نشد»، «غلط درومد»، «ناممکن») ⇒ the impossibility PROOF_Q; cases worked
   («درسته»، «جواب داد»، «برقرار بود») ⇒ «چرا برای هر حالت؟ در حالت‌هایی که امتحان کردی، کدام ویژگی کار را درست کرد — همان را برای حالتِ کلی نشان بده»;
   neither ⇒ PROOF_Q (round-12 behaviour).

## Old expectation updated (decision M1 changed it)
- `tests/test_tour1_r12_live.js` chat: the R12 control «a pre-creation turn that names the problem keeps its question» is inverted — the window now
  starts at the creating reply (s29 c23 showed such a turn can name the problem while its question is about another one).
