# Tour 1 round 28 — fixer «story» (R5) — handoff note (2026-11-16)

Base: BASE28 = 4001c4cf. Numbering on this branch: WORKLOG 153 / PROGRESS 150 / HANDBOOK §12 row 93 (and one §10 row).

## Functions changed (keep your edits out of these, or re-run `tests/test_tour1_r28_story*.js`)

| File | Function / block | What it now guarantees |
|---|---|---|
| `a45_story.js` | new `ST.relines28` (+ `EVK28`) | C86: a rewritten 📜 line gets its page mark recomputed from the new text (`markOf27`); the old mark goes unchanged into the line's history («نشانِ پیشینِ صفحه (پیش از این اصلاح): …») |
| `a38_live.js` | `storyFollow26` `evFix`; the `f.st26` yes path in the copy-ask answer | both call `A.STORY.relines28` instead of string-substituting every line (old fallback kept when a45 is absent); `evFix` also follows `ccalc` events |
| `a45_story.js` | `ST.otherWork27` (rewritten; old one quarantined as `ST.otherWork27R27`), new `attr28`, `ST.dataSrc28` | C96/C125: «کارِ دیگری» only for a calculation verb or «… حساب… کرد:», or a saying verb whose content is a calculation / an answer claim / a numeric confidence / a percent before a verb; otherwise a datum with source. «کمکم کرد» and «خودم حساب کردم» keep the sentence hers. Span = the sentence, or the list it introduces up to her own reclaiming sentence. Same return shape `{who, from, to, text}` |
| `a45_story.js` | `logEv` (one line) | a datum line of hers gets «منبع: به گفتهٔ «X»» when `ST.dataSrc28` finds the speaker |
| `a45_story.js` | new `ST.ownCalc28` (after-turn hook), new kind `calc` (`EV_T`/`EV_K` → `ccalc`, `MARK27`) | A28-12/A28-30: her own calculations, another person's work and her quantity sentences reach 📜 from her text when the model's `coach_state` named nothing (never duplicating an item of the same message; `ccalc` does not move the stage) |
| `a45_story.js` | `chat_invent`/`live_new` wrapper, `movedTo26`, `onState` B26 branch, `ST.planOwner` | A28-27: a message that is wholly the new problem (offset 0) belongs to it; when it was only kept in the look-back (keepback), nothing from it lands in the parent (`moved26` entry with `kb: 1`) |
| `a45_story.js` | `ST.owns` | a chat-key («st23_c_…») event whose time window was imported (`chatImp`) by another live problem belongs to that problem |
| `a45_story.js` | `ST.moveItem27` (+ new `dlMv28`) | a moved datum is flagged `mv28` in the source's understanding draft (row kept, not shown/counted) and unflagged on undo |
| `a40_dossier.js` | new `mvApply28` layer around `A.dossier` (`A.dossierMove28`, `A.dossierUnmove28`, `A.dossierMvApply28`), `mvView27` (no longer builds buttons), `mvHistFa27`, `dossierMove27/Unmove27` clock, the view (`wdLab`, hist `lab`, `.lp-dmvmore`, `.lp-dmvask`), md/html exporters | C95/C123/C124: «↪» on every line of hers incl. the statement, every 🎯 and every ledger step; destinations = the session's problems (live + chat) and, under «مسئلهٔ دیگری…», her other live problems; destination copy with «↩»; history labels «جابه‌جا شد: از «A» ⇒ «B»» / «برگشت به …» on the page clock; a step with dependants asks first (`.lp-dmvall` / `.lp-dmvone` / `.lp-dmvno`). Moves are stored in the source (`L.mv28` or `se.mv28`) |
| `a40_dossier.js` | `addSessEvents` (`se.retracts`), the `dossierSess(sid, pk)` event filter | A28-13: a correction belongs to the problem of the corrected message |
| `a40_dossier.js` | `uLines` | draft rows flagged `mv28` are not shown |
| `a38_live.js` | `inventGate` (new `SEP28`, `WANT28`) | C97: «جدا» / «یه مسئلهٔ دیگه» ⇒ own record («می‌خوام … حل کنم» ⇒ live now), never keepback; «اگه … چی؟» unchanged (C126) |

## Contracts the other fixers must respect
1. **prior (a45, shared):** `onState`'s B26 branch now also handles `B26.kb` and `off === 0`; `ST.owns` has one extra rule for chat-key events. Your ledger code paths were not touched.
2. **forecast (a41):** `ST.otherWork27` keeps its shape; a numeric confidence or «N درصد می‌…» said by someone else is still other work (C75). A moved 🎯 moves in the dossier only (the pred's `x.prob` is not rewritten) — if you file 🎯 by `x.prob`, a move does not change that.
3. **arith (a46):** not touched. a46 `OTHER` still misses «X یه حسابِ دیگه (هم) کرد: …» (C28-8) for the coach line; 📜 is right. `ST.arithChk`/`ST.arithNote` shapes are read by `relines28` and `ownCalc28`.
4. **correction (a38):** if you rewrite 📜 event lines anywhere else, call `A.STORY.relines28(e, newText, oldText, historyLine, fix)` so the mark follows the text.
5. **surface:** the new visible labels are Persian only («حسابِ تو (از گفت‌وگو)», «منبع: به گفتهٔ …», «جابه‌جا شد: از … ⇒ …», «برگشت به …»).
