# Tour 1 (Pólya), round 18: live fixer handoff (2026-10-17)

Scope: the a38 part of `DECISIONS_R18.md` — RM1d/INF6, RM4 a + b (option side), RM6 b, d, e (a38 share), INF7, and toPlain on a38's plain
sinks. Base 204585c1 (branch `claude/life-program-flow-diagram-q37jvr`). Changed: `apps/learning-architecture/src/app/a38_live.js`, the new
test + bank copy, two older tests whose expectation R18 replaces, docs (WORKLOG (68), PROGRESS 85, HANDBOOK §10 row, REMOVAL_CANDIDATES),
and the rebuilt bundle. a26/a27/a29/a39 were not touched.

## Commits
See `git log` on this worktree branch (test commit, fix commit, this note). The final report lists the ids.

## Test (`tests/test_tour1_r18_live.js`, sections `close,guess,head,transf,win,full,plain`)
- Red on the 204585c1 build: liveStepReport missing (close), 5 runner quotes + 9 bank entries (guess), runner + 8 bank (head),
  runner + 5 bank (transf), s14 window, INF7 button, plain option.
- Green now: **63 of 64 bank entries** of RM1.close (16), RM4.guess (16), RM6.head (16), RM6.transf (16), plus every runner quote. One is
  rejected on purpose (see Judgement calls 1).
- `tests/variants/VARIANTS_R18.json` is a byte copy of `tour1_polya/VARIANTS_R18.json` (so the gate does not depend on the scratchpad).

## What changed (a38_live.js)
- **RM1d/INF6** `gateItems` gains `{k:"step"}` for every open step without a validated chat report; the «پیش از حل شد» card asks
  «این گام چه شد؟» (انجام دادم / تاحدی / نه / نمی‌دانم) + «چه شد؟» + «با پیش‌بینی‌ات می‌خواند؟». `setStepOut` writes the outcome with **no
  `auto` flag** (`from:"ask"|"chat"`, `at_close:true`; «نمی‌دانم» ⇒ `done:"" , unk:true`, forecast «نامعلوم», out of calibration).
  `closeOpen(s,"solved")` now only applies chat reports and never writes «انجام نشد»; abandon keeps the old behaviour (`auto:"abandoned"`).
- **Contract for the coach fixer (a27):** `APP.liveStepReport(pid, {step, done:"yes|part|no", what?, match?, msg}, sess?)` — call it from a
  validated `coach_state` field (suggested `step: {step, done, what, match, msg}`). The page checks: step belongs to pid and is open; `msg`
  (1-based index among that session's user messages, or a verbatim quote) is a USER message in a session bound to pid; "yes/part" is refused
  when that message is only a future intention. Nothing calls it yet — until it is wired, every open step is asked at closing.
- **RM4 a/b** `guessFor` = identity: needs `m.guess = {text | g, q}`; q must be a verbatim substring of that assistant message; the note goes
  only on the option built from q (a q inside a multi-question run is split out as its own option); the guess text must occur in a user
  message earlier in that session, or be the problem's recorded guess (`g` numeric). No q ⇒ no note (old `{text}`/`{g}` too).
  Bank format `g:"…"` (string) is read as text. **The coach fixer must write `q` in `m.guess`** for notes to appear live.
- **RM6b** `headRef(head, question)`: a verbless head stays when it holds the referent (option marker/ordinal, Latin name or digit, topic
  preposition «دربارهٔ/در موردِ/راجع به», named «مسئلهٔ X», demonstrative + noun) or the question has a 3rd-person pronoun/«‌اش».
- **RM6d** `transfIn`: numeric evaluation (no unknown) is never a transformation; a chain of ≥2 relations with an unknown joined by
  ⇒/→/⇔/پس/یعنی in one clause is, when one of them carries a risky transformation (power/root/log/abs, or the unknown in a denominator —
  `riskRel`, the scope Q_EQUIV's own text names). Function names (sqrt, log, C(…)…) are not unknowns; a single Persian letter is a variable
  only in a run with an operator and a digit.
- **RM6e (a38 share)** `msgWin`: a problem made by chat_solved/chat_invent in a session starts at the first user message there that
  states it (`mentionIdx`: distinct statement tokens; the first message reaching ¾ of the best overlap, best ≥ 40%); none found ⇒ the old
  start stays. **Not done here:** `chkWindow`/`sameStmt` (D·D3 s31) live in
  a27 — the coach fixer's file.
- **INF7** «پیامِ کامل» button next to `#lpBBest`; options carry `src {sess, i, text, at}` from `APP.liveChatQItems`. `#lpRBest` (a27) can use
  the same `src`.
- **INF2** `toPlain(x)` = `A.MATH && A.MATH.toPlain ? A.MATH.toPlain(x) : x` on the chatItems output (feeds #lpBBest, a27's lbOpts, stored
  bestQ). The test stubs toPlain only when a39's is absent.

## Judgement calls
1. **Bank RM6.transf pos «2x + 3 = 11 ⇒ 2x = 8 ⇒ x = 4» rejected.** A linear chain is always equivalent; Q_EQUIV itself asks about
   «توانِ دو، ضرب یا تقسیم در عبارتِ متغیر». Asking it here is the misplaced question RM6d removes, and it blocked the R6–R8 flows
   (linear substitution «… پس 4b + 2 = 30 و b = 7»). The other 7 positives pass.
2. **RM6e fallback.** DECISIONS says «first mention (chat_invent id or creation)». When no user message states the problem (the
   chat_solved statement is the model's paraphrase), the window keeps its old start instead of starting at the creating message: an extra
   option is harmless, an empty list is not (R14 «باغچه» test).
3. **RM6b and a pronoun in the question.** DECISIONS lists «a deictic in the question» as a reason to keep the head. Applied only when the
   head has a candidate referent (a content word): «یک پرسش: چطور می‌آزمایی‌اش؟» still drops the head, «پیش از اثبات: چطور
   می‌آزمایی‌اش؟» keeps it (R17 s11d expectation updated).
4. **Bank RM4.guess format** `{g:"…", q}` with g as text is read as text; numeric g still indexes `solve.g`.

## Older expectations replaced (marked «دورِ ۱۸»)
- `tests/test_live_problem.js`: the open step is answered in the closing card; the old check «auto: solved, انجام نشد» became «her answer,
  no auto».
- `tests/test_tour1_r16_live.js` (runs control, ref C s23/s21): no note from the assistant's own quote.
- `tests/test_tour1_r17_live.js`: its `opts` now builds the R18 coach contract (q + the user's guess message) for entries that carry a
  guess; RC2.which_guess entries that relied on the assistant's own quote now expect no note (R18 RM4a replaces RC2c); s09/s11d/s21 too.
- `tests/test_tour1_live.js`, `test_tour1_r6_live.js`, `test_tour1_r7_live.js`, `test_tour1_r8_live.js`: a `closeSteps()` helper answers
  «نمی‌دانم» for any open step after «✅ حل شد».

## Quarantined (REMOVAL_CANDIDATES)
`closeOpenR17`, `guessForR17`, `guessQuote`, `semiSplit`, `transfInR17` — reachable via `APP.LIVE_R18_QUARANTINE`, never called.
