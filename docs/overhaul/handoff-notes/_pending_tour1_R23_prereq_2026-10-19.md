# Tour 1 (Pólya), round 23: fixer «prereq» handoff (2026-10-19)

Scope (DECISIONS_R23 «Fixers / prereq»): Q2 (prerequisite refinements) and Q6 (territory loop, roadmap §19.6). Base: main `574f4a30`.
Files: `src/app/a44_route.js` (most of it), `src/app/a29_mind.js` (`causes.sys`), `src/app/a40_dossier.js` (one line: system-caused stuck), `src/app/a26_assist.js`
(`AS.cutManifest` used by `AS.prompt` — the two old `man.slice` truncations replaced), `apps/learning-architecture/AGENTS.md` (§«💬 دستیار» bullet 3: reply contract under a gap sheet).
Tests: new `tests/test_tour1_r23_prereq.js` + byte copy of the bank `tests/variants/VARIANTS_R23.json`. No old assertion changed.
Docs: WORKLOG (95), PROGRESS 110, HANDBOOK (§2 bullet, §10 row, §12 row 58). Numbering leaves 94/109 for ageclass (merge order joins them).

## Contract: model reports (coach_state / gap), page validates
- `gap.step` — the step of THIS problem that waits on the sheet (taught in the «# پیش‌نیاز» RULE line). Fallback: the assistant's `steps` item with `s:"now"`, later the
  `steps` item that names «#n».
- `coach_state.sys_done: {sheet, quote}` — she took a waiting step another way; quote must be in her latest message ⇒ entry `state:"other"`.
- Unchanged from R22: `prereq`, `prereq_res`, `learned`, `cause`. New behaviour: `prereq_res.mastery:"yes"` on an entry with open children keeps `mastPending` and does
  NOT close it; it closes with the child only when the same report took the step (`said` ∋ result/plan, or `result`), otherwise the child returns to it.

## Contract: data and API (`APP.PRE`)
- Waiting entries live in the same store as the stack: `eprog_<pid>.solve.live.pre22.sys` or `achat.coach.pre22[pk].sys`:
  `{id:"swN", number, sheet, title, area, kind, step, stepBy, need, miss, at, state: wait|arrived|resumed|declined|other|moot, fp, tool, checks[], msg, sess}`.
- API: `PRE.sysAll()`, `PRE.sysCheck()` (promise; registry diff + sheet replies), `PRE.sysSweep(force)` (throttled; called from `A.render`), `PRE.sysLocal()`,
  `PRE.sysOpen`, `PRE.sysMark(s)`, `PRE.sysCard(sc)`, `PRE.sysLines`, `PRE.regFP()`, `PRE.regDiff(fp)`, `PRE.sysFits(e, item)`, `PRE.sysEvId(id)`.
  Also `PRE.follow(pid)`, `PRE.lastScope(s)`, `PRE.openKids(sc, id)`, `PRE.tookStep(a)`, `PRE.rebook(s, sc, id)`, `PRE.abilitySpan(t)`; `PRE.scope(s)` may return
  `{sess, pk, s, opening:true}` on the opening turn.
- Events (`A.EVLOG`): `sys23_<swN>_wait|back|resume|no|other|mis` with `k` = `syswait|sysback|sysresume|sysno|sysother|sysmis`.
- coachEv: `cause:"sys"` with `causeWhy` and `sheet`; `cause:"prereq"` may carry `preWhy` (re-attributed / open stack).
- `A.MIND.phases().causes.sys` — `[{id, ph, at, why, sheet, pid, sess}]`, not counted in the stage rows (like `prereq`).
- `A.dueList()` items for this loop carry `sys23: <swN>` («🛎 ابزارِ لازم آمد: …» while arrived; «⛔ برگهٔ #n بی ساختن بسته شد …» once).

## For the other fixers
- **story (Q3, route map for chat problems):** `A.ROUTE.model` now has `DET_K.sys*` (detour kind `sys`, `d.sheet`, `d.open` while waiting, rejoin point at `sysback`)
  and `MAIN_K.sysresume`; the auto-rejoin rule skips `sys` like `pre`; `M.remain` names open waits; the SVG label of a `syswait` point is «⏸ منتظر #n — step».
  Please keep these when you rebuild origin/destination/main-line for chat problems.
- **today (Q7):** one Today line per act — the two `sys23` lines above are the only Today output of this loop; the dossier lines are the `sys*` events.
- **ageclass (Q1, Q5):** the opening-turn scope calls `AS.statesProblem`/`AS.notProblem` on the current message, so a greeting-masked opening fixed there also opens the
  prerequisite contract. `scTitle()` (stack/back lines) still uses the raw chat statement — if you add a greeting/name stripper for titles, `scTitle` should use it
  (B·D10 title part, D23-17/28). The ability page line follows `s.coach.reg` («نه استعدادِ شما» / «نه توانِ تو»). `AS.prompt` in a26 now calls `AS.cutManifest` in the two
  places that used to slice the map — please keep that if you touch `AS.prompt`.
- **correction (Q4):** nothing new; the R22 retract line format is still read by the route map.

## Not done
- No real-model run (`POST /api/inspection/audit/ai`) for `gap.step` / `sys_done` (HANDBOOK §12 row 58).
- A chat-only problem (no live record) shows its waiting step in the conversation, the session dossier and the session route map, not on a 🔭 page (there is none).
