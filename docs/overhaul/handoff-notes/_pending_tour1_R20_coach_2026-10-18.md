# Tour 1 (Pólya), round 20: coach fixer handoff (2026-10-18)

Scope (DECISIONS_R20 «Fixers / coach»): RO1 coach side, RO3, RO4, RO5 coach side, RO8, MT1 (prompt/validation parts), RO7 mind-card reading.
Base: integration head `claude/life-program-flow-diagram-q37jvr` (690b7112) merged into the coach worktree.

Files changed:
- `apps/learning-architecture/src/app/a27_tour.js` (coach), `a29_mind.js` (mind card), `a26_assist.js` (only `ask()`: a post-reply hook, see below), rebuilt bundle.
- Tests: new `tests/test_tour1_r20_coach.js` + byte copy of the independent bank at `tests/variants/VARIANTS_R20.json`.
  Updated to the new decisions: `test_tour1_r19b_coach.js` (inf15: the restatement of the same message stays — RO1), `test_tour1_r18_coach.js` (rm5def — RO8).
- Docs: WORKLOG (80), PROGRESS row 96, HANDBOOK §10 row, `docs/overhaul/REMOVAL_CANDIDATES.md` (quarantine of the 19b engine).

Not touched: a38, a40, a41, a42, a31/a33 (one wrapper of `AS.DO.deadline` lives in a27, installed after load), backend.

## Contracts for the other fixers
- **live (a38/a40):** `APP.liveRetract(pid, msgId, o)` now also gets `o.key` (the model's reported key: `datum:price`, `guess:g1`, `plan:pl1`, `step:2`, `lesson`, `ans`).
  A result object may carry `pending: [...]` (e.g. the page-typed copy waiting for «این‌جا هم عوض شود؟»); the coach shows it to the model as «مانده (صفحه از خودش می‌پرسد؛ عوض‌شده نخوان)».
  `APP.ASSIST.retractApply(s, x)` is the one engine for ✏️ and chat: it validates (the ✏️ turn «[اصلاحِ پیامِ قبلی] …» is itself the correction signal), reverses by span/key,
  writes the page result for the SAME turn (`coach.retNote.same`) and books exactly one self-correction look-back event. Returns `{ch, pend, R}` or `{err, errs}`.
  The ✏️ turn is system-origin: `AS.notProblem` is true for it, the coach drops its reply's coach_state (no evidence, no second retract) and never offers it as a deferred request.
  `AS.EDIT_RE` is the ✏️-turn pattern. Records the coach writes carry `src20 {sess, msg, span, key}`; `fromMsg` accepts `r.src`, `r.src20.msg` or legacy `key`.
- **routing (a26 call site):** `ask()` now ends in `post(sys, user, o2, opts, o)`: `AS.replyFix(o)` (top-level `retract`/`coach_state`, taste object) then `AS.replyCheck(o, opts)`;
  if it returns text, ONE extra `A.callAI(sys, user + why, o2)` with the same `opts` (same task), and only `reply` is replaced (actions stay). replyCheck answers only for
  task `lla_assistant`/`lla_coach` (or no task). Keep the hook when the task string changes.
- **practice (a41):** the mind card reads `practice.withdrawn` arrays as stability history, never as "record withdrawn"; `ex.prc` links a worksheet to its case row.

## Items
| Item | What changed |
|---|---|
| RO1 | Reverse only records whose source span overlaps the corrected fragment, whose key equals `retract.key`, or whose class matches `what` with no same-class sibling overlapping; plan/guess/restatement events are withdrawn and re-booked from the current message; verdict «وارسی شد» changes only for data (`ans/fact/step/said`) present in the check messages or the statement, never for the lesson; lesson (`b.use`, `lessons[]`, card) and deadlines (date/time) follow; guess `res` from the corrected message → recheck (C20-4); correction act in `coach.acts20`. |
| RO3 | No «صفحه برمی‌گرداند» in prompts; «# اصلاحی که صفحه انجام داد/نپذیرفت» is the model's only source (same turn for ✏️); refusal = one plain sys line for her + reason for the model; sys lines without ids/ISO dates. |
| RO4 | `tok20/findTok20/diff20/subst20`; same-value check by tokens; explicit old («X رو Y کن», model `old`) must exist as a whole token; signal = model report + fragment + a short correction marker (not a closed list); questions and lone «اشتباه کردم» refused. |
| RO5 | ✏️ turn: no fallback block, no evidence booking, one self-correction, same result block as chat. |
| RO8 | Quoted/pasted text not register evidence; defer excludes requests satisfied by the reply's action, first-person intents, reported speech; purpose questions stay candidates; A191 root cause (prompt rebuilt → coachPhase re-ran) fixed by per-message caching; turn question after a data/verdict correction = re-check; post-closure with open look-back → phase «بازنگری»; negated failure («ولی نخوردم») not a failure. |
| MT1 | `# وضعِ کنونی`; targeted open-step line; said:result without text/evidence → one structured ask; unquoted guess → one ask then drop; formula-equivalent quotes; aliases; habit/plan scope line; plurals hint; post-check with one rewrite. |
| RO7 (mind) | `withdrawn=[]` bug; one row per case with measured values. |

## Bank results (VARIANTS_R20, this fixer's mechanisms)
141 entries considered: 113 pass, 28 not covered (owner elsewhere): #13 #53 #88 #95 #98 (live/dossier/editor), #121–#125 #127–#131 #133–#138 (practice/sched),
#142 #152 #153 (a38 liveCoach/qSplit), #180 #181 #190 #191 (live_new/chat_invent navigation). Partial notes: #4 (computed remainder), #11 (asking without key is the model's),
#12 (plot point), #51 (start_practice consent), #93 (step outcome) — live/practice sides. Base build: the new test is red (runners fail at A1; bank throws on missing engine).

## Deviations
- Two separate question sentences (a clarifying question with its own verb) stay one option (round-15 O1 contract); only the elliptical «…؟ و داده‌ها؟» triggers a rewrite.
- `said:["result"]` without text is still booked when her message itself shows a result (old rounds rely on it); only evidence-free labels are asked.
