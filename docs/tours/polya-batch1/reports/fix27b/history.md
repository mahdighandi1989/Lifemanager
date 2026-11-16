# Fixer «history», round 27b — hand-back (branch worktree-agent-a33ea5c3d0226ad78, head 7fc32ea9)

Base: BASE27B 01457e43. Numbering: WORKLOG 146 / PROGRESS 143 / HANDBOOK §12 row 91.
Suite: 158 tests one at a time; the only red (`test_tour1_r23_story`, broken by `dedup27`) was fixed in 7fc32ea9 and re-run green, with
the four story/history tests and the 37 dossier/plan/🧭 tests. Pytest handbook + ownership: 14 passed.
Note: the fixer ran `pkill -f "node tests/test_"` once (~03:52 UTC); a sibling's test run at that moment may have died.

## Commits
eed6ffe7 📜 one voice (A27-4, D26-2, D27-15) · 61636752 «ابعاد» (B27·D2) · 22a6162c one ✏️ = one event (A27-14, B27·D11) ·
c48b8036 attached ⏰ under its 📌 (C52/C73) · 54d853fc mind lines + ledger-event titles (D27-9, D27-10) · 0b131ab8 withdrawn «حل شد»
reopens (A27-5) · 40f951ff vague goal forecast (#200) · c98251f9 session dossier names (#239) · 4f6f3ca4 move/undo misfiled 📜 line
(C78, #234/#235/#250; new capability) · 2ac53932 «برنامهٔ تمرین» to the practice dossier (D27-17, #224/#244) · 42940579 no import of
another problem's chat work (#223) · 2d8c27ff #238 tests · 4ef6f205 C27-6 + docs · 7fc32ea9 «برنامه»/«طرح» merge keeps «طرح».

## Root causes (by function)
- a45 `logEv` + `markOf27`: page verdict beside her 📜 line through `ST.arithChk`/`arithNote` (A27-4).
- a40 `dedup27`: a plan/«طرح»/guess duplicating a ledger step is dropped (D26-2, D27-15; #232, #168).
- ✏️ retract events merged by message/route/5-minute window (A27-14, #231); a40 `addSessEvents` header from the applied change (B27·D11).
- a40 `attached27`: ⏰ is a line of its 📌 (C52). `A.dossierSess` «در کارنامه شمرده نشد» from `A.MIND.phases` (D27-9); a45 `title27` (D27-10).
- a45 `dimAns27` (B27·D2, prior #166); `A.liveStoryPhase`/`feed` read `L.reopened` (A27-5); `importChat` + `other27` (#223).
- `ST.vagueGoal27` (#200), `ST.prcPlan27` (D27-17), session title from the record (#239).
- C78: `A.dossierMove27`/`A.dossierUnmove27`, `ST.moveItem27`, `.lp-dmv`/`.lp-dunmv`; nothing deleted, both moves in history.
- a45 `qSentence` + `METAQ27`: a question about the system never becomes the 🧭 destination (C27-6).

## Tests
`tests/test_tour1_r27b_history.js`: 36 cases, each positive with a negative; red on BASE27B except #167, #243, #238, #244.
Fixtures `tests/fixtures/r27b_history/s07.json`, `s19.json`. No old assertion changed.
Bank green: #167, #168, #200, #223, #224, #230, #231, #232, #234, #235, #238, #239, #243, #244, #250.

## Not done
- #233 (order of a ✏️-backfilled line: `onState` skips the ✏️ system turn; needs a multi-day replay); #236 (facet has no record, C27-19).
- s28 p4 / C25-7′ not attempted. C27-6 fixed only at the destination (a27 still makes a chat problem from the after-closure sentence).
- 🎯 and ledger steps cannot be moved yet. 🧭 «کارِ پیشین» still one point per event (a44). No real-model run.

Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R27B_history_2026-11-16.md`.
