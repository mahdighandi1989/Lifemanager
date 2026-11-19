# FIX30 — story fixer hand-back

- Branch `worktree-agent-af4ee48a791fba686` (base BASE30 `5c7ce364`). Head and commit list: see the final hand-back message (this file is committed with the docs commit).
- Numbering: WORKLOG 167 / PROGRESS 164 / HANDBOOK §12 row 108 (+ one §10 row). The build's numbering gate reports the gap 164–166 (other fixers) — renumber at merge.

## Root causes fixed (file:function)
| id | root cause | fix |
|---|---|---|
| D25-8 (8 oD1* runs) | `a45_story.js:unkOf` returned the whole marked sentence, with the page-answer label («یه جمله:») and the wish verb | `unkCore30` (label ≤ 3 words dropped; «می‌خوام بدونم «X»» ⇒ X); `ST.dest` reads stored items through it |
| A30-8 (F15) | `a45_story.js:sentences` split after every «…», also inside «۱ + ۲ + … + ۲۰ = ۲۱۰» | «…» between two operators/numbers of a series is not a sentence end |
| C30-1, A30-9 s03 half (F15) | `a45_story.js:claim29` counted a subscript/coefficient digit before «=» as an arithmetic claim | `algebra30`: variable on the left + single term on the right, or names only ⇒ not a pattern claim |
| A30-18 (F11) | `a45_story.js:named26FromList/run26` scored only words ≥ 3 letters; «۷ و ۱۱» vs «۵ و ۹» tied ⇒ «کدام؟», message filed nowhere | `byN30`: numbers of the named frame break a word tie; no/shared number ⇒ still ask (C21) |
| C26-1 (F11) | `a45_story.js:ST.probGroups/ident` matched the chat statement only to live problems with `r.sess === se.id`; `live_new` records have no `sess` | live problems of this session = `sess` or `se.lprobLog`/`se.lprob` |
| B27·D7 first half (F11) | `a40_dossier.js:A.dossier` chat-work block took every user message of the session up to closing | only messages `A.STORY.owns` gives the problem, plus its import window from `chatImp.cut` (the message it was born from) |
| A30-19 | `a45_story.js:attr28` kept only the WHO27 word «نوه‌ی» | `whoX30`: an ezafe relation takes the next word when that word is itself a relation (never a name) |
| C183 (A23-8) | `a44_route.js:A.ROUTE.model` kept the stated unknown as destination after a verified result | `found30`: verified result + only review left ⇒ «پیدا شد: «…» — گامِ بعد: بازنگری» |
| C184 (A26-9) | the book item was three «؟» (`a27 TQ.und`, `a36` suff, `a38` decision variant) | one question joined by «یا»; `a43 CHILD_Q` new key beside the old |
| C186 (D26-28) | `a27_tour.js:chkVerdict` gave «maybe» whenever the model quoted no message; `a40` verdict line wrote «سنجیده نشد» even beside the page's own verdict | page searches her messages (≥ 2 meaningful words of the reported check, not the statement message) ⇒ `verified` (`chkBy: page30`); `chkLate` lets a later model quote replace it; `a40` line for disproved/impossible/range |
| C188 (D27-33) | advice from another person with no number was never filed (`said` empty) | `ST.advice30` + one `onState` block ⇒ «داده» with «منبع: به گفتهٔ «داداشم»» |
| C26-40 | `a38_live.js:coachCore` returned `ladderEnd` for a woke/self-made problem whose ladder is deliberately not asked (`own25none`) | `ladderEnd` excludes `own25none` |
| B24·D15 | `a27_tour.js` claim frame read «درسته؟» as a disputed claim even after her own reported check | `chk30` (CHECKED24, the round-24 guessWhy rule) |

## Tests
- `apps/learning-architecture/tests/test_tour1_r30_story.js` — 15 unit cases from the runners' sentences with C136 negatives: 15/15 on this branch; on BASE30 3/15 (only negative cases green).
- `apps/learning-architecture/tests/test_tour1_r30_story_replay.js` — 15 page-level replays of the runners' own runs (fixtures `tests/fixtures/r30_story/`, 39 runs packed): 15/15 here; on BASE30 1/15 (only the tB1 negative green).
- `test_tour1_r17_coach.js` rc4 fallback: assertion replaced per C186 (comment in place; the old expectation quoted).
- Look-alikes (C136): 1560 distinct runner sentences of rounds 29/30 + 296 corpus sentences (F2/F6/F8): unknown core, marks, data filing, advice and speaker compared base ⇄ branch. Corpus: 0 changes. Rounds 29/30: 15 mark lines changed (all definitions/variable equations losing a pattern «نسنجیده», or whole «…» series now judged); 42 data splits changed (all «…» series kept whole); advice: exactly one hit (arD2 p12); speaker: exactly one (s09).

## Whole-scenario replay (C179) — 39 runs, every turn (page messages, 🧭 destination and strip, prompt mark lines, every 📜 event, «امروز»)
Unchanged: A pA1, B aB3, B pwB2, B s18, C aC3, C aC4, C s26, C s28, D aD2, D arD1, D pwD2, D s33 (before the late a40 line), B bp1 (except the intended prompt frame).
Changed, all judged intended:
- D oD1e/e2/g/n/r/t/t2/u: destination, «مجهول (از گفت‌وگو)» and the understanding draft become «مادرم قرصِ امروزش رو برداشته یا نه»; «امروز» strip the same.
- A s03, B aB2: «…» series one line with the right ✓/✗; mod/equation clause without «نسنجیده».
- C s24: the recurrence/initial values line without «نسنجیده».
- A s08: «برگردیم به معمای ۷ و ۱۱: …» filed under 7&11 (no «کدام؟»); the 15-minute chat work no longer duplicated under «۵ و ۹»; review order in «امروز» follows last activity.
- A s09: coach-line attribution «نوه‌ی همسایه‌مون».
- C s21, A s10, D s35: the session dossier shows one problem instead of two; set comparison: only the synthetic «آغازِ این مسئلهٔ گفت‌وگو» header of the duplicated second problem disappears; no event lost.
- B aB2, B s14, A s08: chat work of a later problem no longer carries an earlier problem's messages; B tB1 keeps its opening message (import window from `cut`).
- B s12: destination drops the label «جدول امروز:».
- A aA1, A aA4, C aC1, D dp2, D aD3: verdict «شاید …» ⇒ «وارسی شد — با پیام‌های خودت» quoting her own check message.

Side effect for the coordinator (not changed): **B oB1** — the C186 verdict «وارسی شد» rested on «۵ روز از ۷», which she later corrected to ۴. The correction engine (a38) supersedes the verdict and the C26 Q2 question «با مقدارِ اصلاح‌شده دوباره وارسی کند» stays the turn question in c29–c37 while she talks about the dinner forecast and another problem. Contract-conform (C26 Q2: it stays until she answers), but it is a visible change in nine turns; owner of that question: correction.

Regression scenarios: aC1 (C30-7) — only the verdict line above; s35 (D30-4) — only the C26-1 dossier collapse; s12 (B30·D1) — only the destination label; tB1 (B30·D3) — no change after the `cut` window fix.

## Tail table (C177)
| tail id | scenarios replayed | status |
|---|---|---|
| D25-8 | oD1e, oD1e2, oD1g, oD1n, oD1r, oD1t, oD1t2, oD1u, arD1 | closed for the destination in all 8 oD1* (the runs still need surface's D28-10); arD1 «داده» half: unchanged in replay (0 diffs) — not reproduced on this base |
| C30-1 | C s24 | closed |
| A30-9 s03 half | A s03 | closed |
| A30-19 | A s09 | closed |
| B24·D15 | B bp1 | closed |
| C26-1 | C s21 (+ A s10, D s35 look-alikes) | closed |
| D27-33 (C188) | D arD2 | closed |
| A26-9 (C184) | A pA1 | closed (s03 same text) |
| B27·D7 | B aB2 | first half closed; «پرسشی که کمک کرد / سلیقه» of problem 1 not done |
| D26-28 (C186) | D dp2, D aD3 (A aA1, aA4, C aC1 look-alikes) | closed: «maybe» shape (dp2, aD3) and the s33 shape (page verdict `refuted` beside «سنجیده نشد», replay check C186_D_s33) |
| A23-8 (C183) | A s10 | unit-only: the replay cannot reach the verified-review state (the runner's form steps are not replayed); «کههمهٔ» is the text dump (C183: not a page defect) |
| C26-40 | C s28 | unit-only: the replay does not recreate the woke second problem |
| A23-19, A26-29, A29-19, B24·D18, B25·D24, B28·D13, C22-11, C26-30, D25-16 | — | not done (see «Not done») |

## Not done
1. A29-19: the «۱۵ لیتر» calculations name no problem; C21 forbids guessing — the page would have to ask «کدام؟» for an unnamed message whose numbers match another problem; not built.
2. A23-19 (turn question after an opening answer), A26-29 (stage jump after a wrong intermediate), B24·D18 (dossier order), B25·D24 (comma fragments of a fix as data), B28·D13 (strip after a corrected datum and new result), C22-11 / D25-16 (chat guess outcome), C26-30 (lesson said in chat).
3. F10 (A29-28, D29-16) and the other F11 ids (B28·D9, A27-22, C27-19, D29-13, B29·D15, C30-11 — with prior), C30-8.
4. The B oB1 side effect above is reported, not changed.
