# FIX29 — surface fixer (R7) hand-back

- Branch `worktree-agent-a74851878e3c37517`, head `bbfa6775`; merged into merge29 as WORKLOG 160 / PROGRESS 157 (arrival order).
- Commits: 96cdf2f1, 50312089, 51328fe7 (harness retry), build, 09ad7aa0 (#297, compact rule lines), bbfa6775 (OWNACT29).

## Root causes / fixes
- F13: `a27 sysQ28` knew only "page acts on her records" → `sysQ29` (system-subject questions, number-free), `OWNACT29`, `onlySysQ28` lead-ins and follow-ups.
- C27-6 (C half): back-reference to a closed problem filed twice → `BACKREF29` / `AS.backRef29` in `afterClose23`; `tests/tour1_r28_replay.js` `opt.allEval` (off by default).
- F14 + C151/C174: «(C57)»/«(it1_…)» labels → `A.noLabels29` (outside «…» only) in `AS.regSys`, a40 `EVL.add`/`clean`, model reply post-check.
- F19 + C150: `A.PAGE_RULES` registry bound to enforcing functions (`a1_base`), `AS.ruleLines` under «### قاعده‌هایی که صفحه خودش اجرا می‌کند»; absent function ⇒ rule not shown. The C138 line states story's contract.
- B27·D16: a44 `PRE.sysSweep` without host no longer takes the slot; every `A.go` reads sheets; one sweep at a time.
- C175: `AS.seeOnly29` see-only follow-up.

## Tests
- `test_tour1_r29_surface.js` (34 errors on base → green); `_replay.js` fixtures `tests/fixtures/r29_surface/`.
- C136: 1,291 runner sentences, 23 changed — all genuine system questions; real problems with «نقشه/سامانه/برنامه/صفحه» stay problems.
- Bank R7 #262–#299: pass unit 20, unit+page 4, prompt-evidence only 272–274, unchanged 280/287/291/299, 286 untested, not built 270/277/278/279/289/294.
- Suite green except `test_fixes_1015b` #12 (long-page prompt budget) — reported failing on BASE29 too; coordinator to check in the gate.

## Page-level proof (C137)
- F13: A, B, C, D. F14: A, B. F19: A. B27·D16: B. C175: unit only.

## Not done (C153 → runner arms)
1. #294 one arrow convention in history lines (a40 renderers 470/485/532 + ~20 tests).
2. #277/U59 taking back «نه» leaves sheet open.
3. #278/#289 register guard rewrites a fully «تو» reply (A29-7).
4. #279/B29·D3 «شما» flip in the strip.
5. #270/C28-22 raw ISO date in step card.
6. C175 no page replay (pwC2 p50–p51).
7. #272–#274 model's actual answer untested.
8. `test_fixes_1015b` #12 long page loses its last field from the prompt.

## Coordinator check (2026-11-17)
- `test_fixes_1015b` #12 is NOT pre-existing: NO ERRORS on BASE29 and on merge29 before surface (23d8eab9); fails after the surface merge (05fef659) — `lastField:false, textDropped:false` (rule/map block eats the budget). Counted as a merge-introduced defect (§22). Surface fixer resumed to fix on top of merge29.
