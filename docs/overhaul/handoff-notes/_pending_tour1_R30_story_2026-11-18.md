# Tour 1 round 30 — fixer «story» — handoff note (2026-11-18)

Base: BASE30 = 5c7ce364. Numbering on this branch: WORKLOG 167 / PROGRESS 164 / HANDBOOK §12 row 108 (and one §10 row).
Items: F15 (A30-8, C30-1, A30-9 s03 half), F11 story side (A30-18, B27·D7 first half, C26-1), the tail ids D25-8, A30-19, A26-9 (C184),
A23-8 (C183), D26-28 (C186), D27-33 (C188), C26-40, B24·D15.

## Functions changed (keep your edits out of these, or re-run `tests/test_tour1_r30_story*.js`)

| File | Function / block | What it now guarantees |
|---|---|---|
| `a45_story.js` | `unkOf` (now a wrapper) + new `unkCore30`; old body `unkOfR29`; exports `ST.unkCore30`, `ST.unkOf30`, `ST.unkOfR29` | D25-8: the unknown filed from her words drops a short leading label («یه جمله:», «کلش اینه:», «مجهول:») and «می‌خوام بدونم «X»» gives X. |
| `a45_story.js` | `ST.dest` (two lines) | the stored «u» items are read through `unkCore30` too. |
| `a45_story.js` | `sentences` | A30-8: «…» between two operators/numbers of one series is not a sentence end. Every caller of `sentences` in a45 (dataOf, ownCalc28, goalSentence26, unkOf …) sees «۱ + ۲ + … + ۲۰ = ۲۱۰» whole. |
| `a45_story.js` | `claim29` + new `algebra30` (`VAR30`; export `ST.algebra30`) | C30-1/A30-9: an «=» with a Latin-letter variable on its left and a single term on its right («a_2 = 2», «x = 4», «n(n+1)/2 = ۵۰۵۰»), or a relation among names only, is not a pattern claim — the page adds no «نسنجیده». Engine checks (`ck`) are untouched. |
| `a45_story.js` | `named26FromList` (`run26`: new `byN30`) | A30-18: numbers in the named frame break a word tie between two problems; no number or a shared number ⇒ the «کدام؟» ask as before (C21). |
| `a45_story.js` | `ST.probGroups` (`ident`: `mineL30`) | C26-1: a live problem the model created from this chat (in `se.lprobLog` / `se.lprob`, no `sess` on the record) joins the chat problem with the same statement. |
| `a45_story.js` | new `ST.advice30`, `onState` (one block before the «دورِ ۲۵ P1» result block), `logEv` (`it.src30`) | C188: «X گفت (که) <subjunctive 1st-person act>» is a «داده» with «منبع: به گفتهٔ «X»». Numbers/calcs/quotes/«شاید» stay on the C96 path. |
| `a45_story.js` | `attr28` (`who` via new `whoX30`, export `ST.whoX30`) | A30-19: an ezafe relation takes the next word when that word is itself a relation («نوه‌ی همسایه‌مون»); never a name. |
| `a44_route.js` | `A.ROUTE.model` (`found30`; returned as `M.found30`) | C183: verified result + only review left ⇒ `dest` «پیدا شد: «…» — گامِ بعد: بازنگری». |
| `a40_dossier.js` | `A.dossier` chatwork block (`own30`), verdict line (`vl`) | B27·D7: a closed chat problem's «کارِ تو در گفت‌وگو» only from messages `A.STORY.owns` gives it. C186: a page verdict (disproved/impossible/range) never sits beside «از پیام‌های خودت سنجیده نشد». |
| `a27_tour.js` | `chkVerdict` (block before `if (any)`), `chkLate` (one condition), the claim frame (`chk30` before `claim`) , `TQ.und` text | C186: without model `msgs`, the page finds her check message itself (≥ 2 meaningful words of the reported check, not the statement message) ⇒ `verified`, `chkBy: "page30"`; a later model quote replaces it. B24·D15: «درسته؟» after her own reported check (CHECKED24) is not a disputed claim. C184 text. |
| `a36_solve.js`, `a38_live.js`, `a43_age.js` | the suff texts; `a38 coachCore` return (`ladderEnd`) ; `a43 CHILD_Q` (new key beside the old) | C184 texts; C26-40: a woke/self-made problem whose understanding ladder is deliberately not asked (`own25none`) is not «ladder ended». |
| `tests/tour1_r26_replay.js` | `replay(…, { after })` | optional per-step hook for whole-scenario snapshots (C179). Default behaviour unchanged. |

## Contracts the other fixers must respect
1. **correction:** C186 now produces more `verified` verdicts (`chkBy: "page30"`). Your supersession (a38 ~l.4405) and the after-correction re-check question (a27 `rechk26`, C26 Q2) fire on them exactly as on model-quoted verdicts. In B oB1 that question then stays the turn question for nine turns while she talks about other things — by the C26 Q2 contract; flagged for the coordinator, not changed by story.
2. **arith:** `claim29`/`algebra30` only remove pattern-only «نسنجیده» (no engine check, no engine unread). If your per-clause reader starts reading «a_2 = 2» or «2x + 3 = 11 ⇒ x = 4» itself, your verdict wins (story's gate never fires on clauses with `checks`).
3. **surface:** D28-10 (the system question in the oD1* runs) is yours; with D25-8 done here, the 8 oD1* runs need only D28-10. `goalSentence26` was not touched. New visible strings: «پیدا شد: «…» — گامِ بعد: بازنگری», «منبع: به گفتهٔ «…»» (existing shape), the C184 question.
4. **prior:** `onState` gained one block (advice) after the `said` block; `priorTurn25`/`tryFix` untouched.
5. **dates / forecast:** not touched.
