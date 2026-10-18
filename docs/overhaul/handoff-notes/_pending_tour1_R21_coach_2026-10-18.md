# Tour 1 (Pólya), round 21: route+coach fixer handoff (2026-10-18)

Scope (DECISIONS_R21 «Fixers / route+coach» + ADDENDUM): R1, R3 coach side (a, f lesson, g, h), R6 coach side, R7 (+R7+), R8 (+R8+), R3+ coach side, R6+, R9+.
Base: integration head `claude/life-program-flow-diagram-q37jvr` merged into the route+coach worktree.

Files changed: `src/app/a26_assist.js` (chatTask, two hook lists), `src/app/a27_tour.js` (coach), `src/app/a29_mind.js` («از کجا؟» of re-booked acts), rebuilt bundle.
Tests: new `tests/test_tour1_r21_coach.js` + byte copy of the bank `tests/variants/VARIANTS_R21.json`. Old assertions changed only where DECISIONS_R21 replaces them
(commented): `test_tour1_r20_coach.js` bank #6 (R3g: the corrected result is re-booked), `test_tour1_r18_coach.js` mock repeats a two-question reply for the R7 rewrite.
Not touched: a38, a40, a41, a42, a33, a36, backend.

## Contract: ONE correction result structure (for live a38/a40)
`APP.liveRetract(pid, msgId, o)` may return (preferred) `{ok, changed:[{rec|label|kind, old, new, why}], ask:[{field|path|id, label, old, new}], note:""}`.
The coach reads it with `AS.liveRes20(lr)`; the old shapes still work (`changes:[text]`, `text`, `pending:[text]`, a plain string).
Nothing is dropped any more: a text starting «چیزی…/هیچ…/از آن» is the `note`; «ثبت نشد: …» is a refusal note; `ask` items become «این‌جا هم عوض شود؟» lines.
The coach merges its own changes into the same shape and stores it on `coach.retNote.res = {changed, ask, note}`; the model receives it **verbatim as JSON**
in «# اصلاحی که صفحه انجام داد/نپذیرفت» the next turn (same turn for ✏️), plus «changed خالی است … هرگز «عوض کردم/اصلاح شد» نگو» when nothing changed.
`AS.retractApply(s, x)` (✏️ engine) now also returns `res` (the structure). In ✏️ the coach adds the page's own changes (`se.retracts` of the edited message, non-coach kinds)
to the structure so the result block agrees with the page lines of the same prompt (A21-20).
Refusals: `res = {changed:[], ask:[], note:"این اصلاح انجام نشد: …"}`; a missing correct value ⇒ `ask:[{field:"value", label:"مقدارِ درست", old:<her fragment>, new:""}]`.
She always sees one plain line: «✓ اصلاح شد: …» (+ asks), «اصلاحت رسید، ولی … چیزی برای عوض کردن نبود.», «مقدارِ درست را نگفتی — چه بود؟», or the refusal reason.
Coach-side substitution uses `A.liveCoreDiff` + `A.liveFixVal` first (the live side's minimal diff; A21-5), then the old token engine as fallback — please keep those two exported.

## Contract: routing (a26)
`AS.chatTask({msg, prompt, prev, inherit, off})` decides from the built prompt: `# وضعِ کنونی` containing «مسئلهٔ گفت‌وگو «» (written only when `AS.chatFocus(s)`:
the statement the page holds is a problem by `AS.statesProblem` or the model reported `nat`), an open «مسئلهٔ زنده «», a coach head (live/tutor/look-back/correction/real
problem/related solved/after failure), or a practice block that lists a case; otherwise a message the page's detector reads as a problem with the «مربیِ حل» block.
`AS.pureCommand(msg)` (every clause is a page command or filler) is checked first ⇒ `lla_assistant`. The R20 router is quarantined at `AS.R21_QUARANTINE.chatTask20`.
**practice fixer:** if `# پرونده‌های تمرینِ باز` starts appearing with no case lines (start_practice offer only), routing ignores it (it needs a line `- <case>`); keep that header text.

## New hooks
- `AS.afterTurnHooks.push(fn(s, o, acts, msg))` — runs after all actions of a user turn (not «[سامانه]»).
- `AS.paintHooks.push(fn(s) ⇒ element|null)` — buttons under the session tools (used for «حل شد؟» and «نتیجهٔ گامِ N؟»).

## Items
| Item | What changed |
|---|---|
| R1 | Page's own detector `AS.statesProblem` (liveNatGuess/liveTypeGuess, prove/formula, stuck, decision, discouragement, habit, an unknown sought, a named problem, English) feeds both the chat focus and routing; a non-problem first message no longer holds the statement; mixed «…ثبتش کن» stays coach; «باز کن» after the live head unless the message is only a command. |
| R3a | One structure `{changed, ask, note}` (above), verbatim to the model, plain line to her, no-op/refusal told. |
| R3f | Lesson: only the clause named («اولی/دومی…») or overlapping is replaced; whole only when the fragment is the whole one-clause lesson (old rule quarantined `R21_QUARANTINE.lessonWhole`). |
| R3g | Result and lesson re-booked from the current message; self-correction never lost to a key collision (B·D14). |
| R3h | Change line = LCS word diff, each differing run shown («۱۲» ⇐ «۱۴»، «۱۵» ⇐ «۲۰»). |
| R6 | N5 closure fallback (verified answer + her lesson, no chat_solved ⇒ one «حل شد؟» with buttons; «بله» closes via chat_solved); result/fail with an open step ⇒ «نتیجهٔ گامِ N؟» buttons → `A.liveStepReport`; formula-equivalent guess quotes (safe evaluator, her own words booked), non-equivalent refused to her and the model; `err_stage {ph, quote}` moves the problem's chat failures to the stage her own words name; C21-15 wording. |
| R6+ | An overdue plan stays open (and in the id list) on her answering turn; expires only one turn later. |
| R7/R7+ | Two independent «؟» ⇒ rewrite; «… یا …؟» and quoted «؟» not; page-attributed / indirect «عوض شد» and «فرستادم» are not claims; factory «پرونده» not a practice claim; «باید/نباید/بیاید/می‌گوید/بیشترین/ببین» not «شما»; one turn question after a correction (others demoted), and the re-check question only when a result/verdict used the datum. |
| R8/R8+ | Unknown never her action report; closure message never the statement; no look-back taste question on a datum-correction turn; after a step outcome the turn question is the next item (next step / restatement), never e1 «پیش از این گام» (A21-2; a38 `c0Asked` still marks e4/e5 once — the successor is added in a27 `nextQFor`). ✏️ substitution uses the exact fragments (no stray «از»). |
| R9+ | A guess judged «نادرست» before a reopen is re-judged once after the verified close (turn question, her choice). |

## For the live fixer (a38) — please consider
- `liveCoach` after `c0Asked` consumes e4/e5 could itself return the next-item question (the a27 override `PRESTEP21` is a coach-side guard).
- `A.liveCopyAnswer` «بله» dependencies (R3d) and same-fact by meaning (R3c) are yours; the coach only forwards `retract.key`.

## Proof
- `tests/test_tour1_r21_coach.js` red on the base build (integration head before this fix), green now.
- Bank VARIANTS_R21: 90/90 judged entries pass; 35 assigned elsewhere with a reason (R3 b/c/d/e/✏️-multi-span/plot: live; R6 live_new/reread/N4/C21-8: live).
- Whole page suite 113 tests green (r2_live flaked once under 8-way load, green alone); `python -m pytest tests/ -q` without the browser file 1981 passed.
- Old tests adapted only where R21 replaces a rule: r20 coach #6 (R3g), r18 coach + r13/r14/r15_live/r16_live mocks repeat a multi-question reply for the R7 rewrite.
- Request (live): export `A.liveKnownQs(pid)` (a38 `knownQs`) so the R7 two-question check can recognise every page question; the coach now keeps a session list of the page's two-sentence questions seen in prompts.
