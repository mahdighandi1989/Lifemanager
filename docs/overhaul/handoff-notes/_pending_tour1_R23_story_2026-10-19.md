# Tour 1 (Pólya), round 23: fixer «story» handoff (2026-10-19)

Scope (DECISIONS_R23 «Fixers / story»): Q3 — chat ⇄ page is one story. Base: main `574f4a30`.
WORKLOG (96), PROGRESS 111, HANDBOOK §2 bullet + §10 row + §12 row 58.

Files changed: new `src/app/a45_story.js` (added to `build.py` after `a44_route.js`); `a44_route.js` (route model, labels, strip — see «route map» below);
`a40_dossier.js` (stage source + owner rule, 4 places); `a38_live.js` (`A.liveDraftDrop`, `A.liveMkSrc`, one condition at the top of `coachCore`'s stage-u branch);
`a27_tour.js` (`C.saidOk` after `C.rep`, `AS.unkPhrase`). Tests: new `tests/test_tour1_r23_story.js` + byte copy of `tests/variants/VARIANTS_R23.json`. No old assertion changed.

## Contract: the story ledger (for every fixer)
- `s.coach.saidOk = {key, at, said[], ans[] (question texts), pk, live, real, pasted}` — written by the base `AS.DO.coach_state` (a27) for the latest user message.
  It is the ONLY place the validated `said`/`ans` of a turn is exposed. **ageclass / correction:** if you change how `said` is filtered, `saidOk` follows automatically; do not
  write it elsewhere.
- `AS.DO.coach_state` is wrapped once more (`_r23story`, after `_r22pre`); the wrapper copies the raw function's properties. If you wrap it again, keep the property copy.
- Story items `s.coach.story[key].items[{k, t, at, mid, n, pieces?, q?, f?}]`, key = `"L:"+pid` (session bound to a live problem) or the chat pk.
  k ∈ `whole | u | c | d | plan | step | res | lb`. Each item is also an `A.EVLOG` event (id `st23_<key>_<k>_<n>`, k `cwhole|cunk|ccond|cdata|cplan23|cstep|cres|clb`).
  **today (a40/a42):** these events appear in «📜» with titles «… (از گفت‌وگو)»; if you dedupe dossier lines, keep one line per item.
- New optional `coach_state` fields read here: `step {quote|what, done}` for chat problems too (quote must be in her latest message, not a future intent),
  `unknown` (short unknown; accepted only if every content word is in the statement/whole of THIS problem).
- `C.pkLog [{pk, at}]` — when each chat problem started (prompt hook + after-turn hook). `A.STORY.pkAt(se, at)`, `A.STORY.pkWindow(se, pk)`.

## Contract: forms and stage (a38 readers)
- Only an EMPTY field with no previous chat fill is prefilled: `uDraft.one/u/c` (+ `uDraft.chat[f] = {t, at, mid, st:"ask"|"ok"}`, `uDraft.src[f]` from the source message),
  data rows `uDraft.dl[i].chat`, `L.planDraft` + `L.planChat`, `L.bDraft[f]` + `L.lbChat[f]` (f ∈ other, glance, chkHow, use). `uDraft.wholeOk = true` when the whole came from chat.
  **correction:** the `src` on these fields is a normal `mkSrc` source, so a correction of that chat message finds them (draft kind) — no special case needed.
- `A.liveStoryPhase(pid)` = max(`A.livePhase`, `L.chatPh`) for open problems (solved/abandoned ⇒ `A.livePhase`). `A.dossier` uses it, so «📜», 🧭 and the strip agree.
  `A.liveStoryAhead(pid)` makes `coachCore` give no u-form page question. **ageclass (turn question):** if your single turn-question source picks u-form questions,
  consult `A.liveStoryAhead` too.
- Later live problem: any new `eprob` with `sess` (live_new, chat_solved, chat_invent, page form) ⇒ `L.chatImp {sess, pk, from, to}`, `L.chatImpItems`, `L.chatUnk`, the open prereq stack
  of that chat problem copied into the live store if it is empty (`X.from = {sess, pk}`).

## Contract: event owner (a40 and anyone filtering session events by problem)
`A.STORY.owns(se, pid, at)`: the session was bound to `pid` at `at` (`lprobLog`), or `at` is inside `L.chatImp`'s window. a40 now applies it to chat guesses, coach retracts
(time of the corrected fragment: `A.STORY.fragAt`) and session-scoped `evlog` events. **today:** `A.dossierSess` (the chat dossier) still lists every chat problem of the
session; the route map filters by the current pk window. Splitting the chat dossier by pk is yours if you want it (HANDBOOK §12 row 58 b).

## Route map (a44) — coordination with «prereq»
Changed inside a44 (please merge, do not revert): `MAIN_K` gains the story kinds; `CHAT_COVER`; `destOf` → `A.STORY.dest` (old one quarantined as `destOfR22`); `planLeft`
falls back to `A.STORY.plan`; `A.ROUTE.model` rewritten in place — same return shape plus `destQ`, `phase`, det fields `quote`, `guess`; new helper `entOf(rid, XS, e, eid)` reads
a prerequisite from the store of the event's own scope (session events ⇒ that session's `pre22[pkAt]`), so nesting/rejoins survive chat_solved; pre detour keys are
`"pre:" + (sess|) + eid`. SVG: `ROW` 46, labels in `<tspan>` lines of ≤ 28 chars with `data-full` (no «…»), pre label «پیش‌نیاز: concept», guess label «حدس: text — outcome»,
tooltip line «مفهوم: … · از حرفِ خودت: … · state». Strip/`openRouteId`: no chat strip when the chat problem became a live problem (`A.STORY.livedPk`) or when the bound live problem is
closed and no new chat problem began after it.
**prereq (Q6 waiting marker on 🧭):** add your «منتظرِ برگهٔ #n» on the det object / point in `A.ROUTE.model` after the `entOf` lookup (the entry is `ent`); the label code reads
`d.concept`/`d.state` — add your marker there (e.g. `d.wait = {sheet}`) and in the tooltip line. Your PRE.scope change for the opening turn (C23-3) does not touch these parts.

## Not done
- No real-model run (AGENTS rule for an AI-path change) — HANDBOOK §12 row 58 (a).
- Look-back answers reach the form only for four fields (other, glance, chkHow, use).
- The second halves of bank #74 (no re-ask of a reported check — Q5 turn question) and #83 («این‌جا هم عوض شود؟» for a typed plan step — Q4) are other fixers'.
- No sibling fixer branch was named by the coordinator before this commit; numbering 96/111 leaves gaps (94, 95 / 109, 110) until ageclass/prereq merge.
