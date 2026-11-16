# Round-27 second fixer pass (FIX27B) — what the first seven left

Read `runners/FIX27.md` first: everything there binds here too (environment, T, reading list, red-first rule, the bank, the docs, trailers,
«Round-27 additions»). Differences:
- **Base:** `BASE27B` = the `main` commit that holds all seven round-27 fixers (the coordinator gives the hash in your launch line). FIRST
  `git merge BASE27B` in your worktree.
- **Read also:** all seven reports `docs/tours/polya-batch1/reports/fix27/*.md` (each «Not done» list is the source of your items) and the
  handoff notes `docs/overhaul/handoff-notes/_pending_tour1_R27_*_2026-11-15.md` (contracts of the seven — respect them; never undo one).
- **Bank:** `apps/learning-architecture/tests/variants/` already holds `VARIANTS_R27.json`; an entry listed as «not built» in a report is
  now yours and must turn green, or be reported with its reason.
- **Numbering (next free on BASE27B):** history WORKLOG 146 / PROGRESS 143 / HANDBOOK §12 next row; leftovers 147 / 144. The coordinator
  renumbers at merge if a routine took one.
- **Files:** history owns a40, a45 story parts, a31, a38 stage rendering; leftovers owns a27, a38 stale engine, a41, a46. If you must touch
  the other's file, keep it to one named function and say so in the handoff note. Name of the handoff note:
  `_pending_tour1_R27B_<yourname>_2026-11-16.md`; test files `test_tour1_r27b_<yourname>*.js`.

## Launch lines
- **history** — the 📜 half of R6 and story's leftovers:
  - bank entries story reported «not built»: 223 (📜 window start), 224 + 244 (practice routing), 230 (marks in 📜), 231 (one event per ✏️),
    232 («برنامه» + «طرح» duplicate), 233 (order), 234 + 235 + 250 (move/undo of a misfiled 📜 line, **C78**), 236 (facet), 238 (look-back
    birth), 239 (session count), 243 (restated problem), 200 (vague forecast — C53 negative must stay);
  - A27-5, D27-9, D27-10, D27-17 (story «not done»); B27·D11 and A27-14 (📜 rendering, from correction); the attached ⏰ shown as a separate
    📜 line (dates); prior bank #166 (`ST.finOf` / `ST.wholeRes`) and #167 (a40 `addSessEvents`); s28 p4 / C25-7′ (split into a second
    problem); C27-6 (🧭 destination from a chat problem a27 makes from a sentence — fix where the problem is born, in story's code path).
- **leftovers** — engine items the others reported:
  - **C58 one path:** a correction of a booked record goes through ONE function (today correction's `retractApply` moves the date, then
    dates' `editBooked27` closes and re-asks). One history entry, one ask. Keep both old bodies quarantined.
  - **C68** (accepting a proposal is a correction; its dependants get C47 proposals; nothing changes silently); D27-24 (a form step with no
    recorded time must not be asked about); C27-23 tier (د) only if it can be narrowed without breaking the nine older bank entries — else
    report.
  - **arith:** C63 ask when no single reading fits; C67 √ in her form; correction bank #71 («N میلیون و M هزار»); the older `norm`
    rewrites that change the text length (make them length-preserving or move them off the offset path — WORKLOG 137).
  - **prior** bank #84 (word-only dependency through the prior reader).
  - **loop** B27·D18: a27 `chatok` (~2680) takes `ORD[ph] > ORD[ph0]` from the model's `ph` — the stage must come from the page's own record.
  - classify bank #317 if it is not R6 rendering (else hand it to history in your report).
