## Fixer «correction» (R3) — round 24: done

All R3 items now work. Everything is committed on the worktree branch `worktree-agent-ad57ab58aa7c80977`. Nothing was pushed and main was not touched.

**Commits** (on top of `3685102d`, which I merged first):
- `494a68b8` fix(lla): Pólya round 24 — corrections spread and number boundaries (R3)
- `377adbb4` fix(lla): R3 follow-ups (verdict-base rule, magnitude neighbour ratio, ✏️ why stated once)

No sibling branch needed merging: correction is first in the merge order. I did not touch the a26 system prompt (your note about its 20,000-character cap). No mode-120000 entry was staged; the node_modules symlink stays untracked.

### Root causes and fixes
Files are under `apps/learning-architecture/src/app/`.

- **C24-12 «۱.۷۵» became «۱.۵.۷۵», then «۱۲۰».**
  - The coach's fallback replacement `subst19b` (a27, ~l.3640) searched for the old number with no number boundary. It now uses boundary-aware versions (`fragReN`, `hasFragN`, `repFragN`), and a new guard `numLost24` blocks the "record is inside the fragment ⇒ replace it all" rule.
  - For a ✏️, `what` was computed from every record of the edited message (a38 `retractMsg`, ~l.4328), so it came out as `guess`. It now comes from what actually changed or was asked.
  - The fallback that replaces a whole same-type record with the new value is never used for a ✏️.
- **Only one pair in the summary (C24-12), each change three times (A23-24), `ask:[]` (A22-17).**
  - a40 `retractEdit` ran the coach once per ✏️ pair. It now runs once with all pairs.
  - `retractRun20` de-duplicates the change lines, records and asks, and `frag`/`fix` name every pair.
  - The page's own copy asks now appear in the ✏️ result.
- **Emptied quotes in the why (A24-9, B24·D16, C24-6).** `why23` (a27, ~l.3871) was built from `ownText`, which blanks quoted text. A chat correction now quotes her real words; a ✏️ says «با ✏️ ِ خودش روی همان پیام» and the pairs appear once in the block's context line.
- **Weeks offered «۱۵» (B24·D5).**
  - «هفته»/«روز» were not units and month names had no role. They are now units: weeks and days in one family, and a number before a month name is a day of the month.
  - New `rolePair`: when the model pairs two different roles, the same-role value is taken from her own message («۱۸ هفته … نه ۱۶»). It is used in `A.liveRetract` and the coach's D21.
  - The chat statement «می‌خوام.» is no longer garbled.
  - Found and fixed along the way: a month-day copy kept the old month («۲ مهر» for «۲ آبان»).
- **Unit dropped, «۱۵۰ ارتفاع» (A24-3).** `fixVal` now reads the unspoken unit from units on neighbouring numbers in the same sentence (`impliedUnit`) and writes «۱۵۰ سانت ارتفاع». As bank #57 expects, the number is not converted to metres.
- **«از گفت‌وگو» drafts and the 🧭 destination did not follow (C24-11).** New `chatDraftsFollow`, run at the end of `retractOne`: unconfirmed proposals, the chat plan, `chatUnk` and `chatImpItems` follow the same fact, with history kept. `A.STORY.dest` reads these, so the destination follows too.
- **Values computed from the corrected number (B24·D17).**
  - New `staleScan`/`A.liveStale`: a number is stale if one arithmetic operation on the old value (or an already-stale number) and an earlier number gives it.
  - A recompute is suggested only when every way of deriving it agrees (100→64, 98→62, 49→31). A number that some derivation leaves unchanged is not marked.
  - The problem page shows «🕰 کهنه پس از اصلاح», and the result carries a line for it. Nothing is rewritten silently.
  - A numeric chat result recorded after the corrected datum is also marked stale.
- **Proof verdict set aside by a narrative count (C23-5).** `stampUses`: when the claim is general (a proof «برای هر n»), a check that names no datum rests on the declared data, not on statement sentences like «۱۰ تاشو چک کردم». «Find» problems keep the old rule.
- **Digit treated as divisor (D23-5).** `occX` marks numbers after «بر» as divisors; `numCopy23` and `nbrOK` match by role.
- **Arrows in both directions (B24·D16).** Every change line now reads «new» (اصلاح شد ⇐ «old»), in the coach, page, dossier and route. Copy asks have no arrow: «new» به‌جای «old».
- **Smaller fixes found in testing:**
  - a short `old` with a long `fix` duplicated the tail («۷ متر در ۴ متر در ۴ متر»); fixed by `growOld24`.
  - «160cm» was not read as a number.
  - «میلیون» lost its magnitude through colloquial normalisation.
- **Quarantined, not deleted:** `APP.LIVE_R23_QUARANTINE_R3` and `APP.ASSIST.R23_QUARANTINE_R3`, recorded in REMOVAL_CANDIDATES.

### Tests
- `tests/test_tour1_r24_correction.js`: 10 tests built from the runners' sentences plus 1 guard. All 10 runner tests fail on the base `3685102d` and pass now.
- `tests/tour1_r24_correction_bank.js`: VARIANTS_R24, all 28 R3 entries pass. 16 of them fail on base; the other 12 already passed there. The bank is copied to `tests/variants/`.
- No calendar dates are hard-coded; they are computed from today.
- Old assertions changed only where DECISIONS_R24 replaces them, each with a comment:
  - R23 correction B·D4 (now «۱۸ هفته»);
  - R21 coach #69 and B·D7 (one-way line);
  - R22 correction askPart;
  - R22 prereq route hover.

### Suite
- **Full page suite, one test at a time:** 137 files. On a snapshot taken shortly before the last edits, 4 failed. After fixing those and making the last edits, I re-ran the 46 tour/assist/dossier files on the final code and all passed, including those 4. The other files were not re-run after the final edits.
- **Other checks:**
  - R23 correction with the R23 bank passes;
  - `pytest test_learning_architecture_handbook.py test_supervisor_ownership.py`: 14 passed;
  - `build.py --check`: in sync.

### Docs
- WORKLOG 105 and PROGRESS 114.
- HANDBOOK: new §2 bullet, new §10 row; §12 row 57(a) marked done, new row 62 for what is still open; date line updated.
- AUDIT_LOG and REMOVAL_CANDIDATES entries.
- Experience `model-reports-state-page-validates`: Update 2026-10-25 section appended.
- Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R24_correction_2026-10-25.md`, with contracts for the story, today and age fixers: the array form of `retractApply`, the arrow format, `liveStale`, the new units and roles, and the draft shape.

### Not done
- A number computed in several steps with no intermediate step in her records (a loan instalment from a formula) is marked stale only when it is a chat result, not when it sits in typed records (§12 row 62a).
- Recompute suggestions need exact equality, so rounded values («حدودِ ۱۴») are not matched (row 62b).
- Bank #68 sets the «شما» register directly in the test. Deriving it from age is the age fixer's R5 work.
