# Round-30 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge BASE30` (the coordinator gives the hash in your launch line; it is
main + this brief). Commit on your worktree branch only; never push; never touch main.
Environment (new container): `export PATH=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/venv/bin:$PATH` before any python/pytest. Playwright for node is global
(`require('playwright')` works from any directory; Chromium is preinstalled — never run "playwright install", never npm-install playwright).
The tour's working tree was restored from git: T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya (briefs, decisions, reports, round30X/<sid>/findings.md, defects.md,
PARTS.md, round30X/tools and ctl). For round 30 the primary evidence IS there: round30X/<sid>/ai/pN.json (prompts), rN.txt (replies), out/, post.txt, screenshots.
There was no control run in round 30. Round-29 evidence (round29X/) is still there for comparison. Read-only: never write under T/round2* and T/round30*.
Two old tests (test_tour1_r11_coach.js, r12_coach.js) load playwright through tests/prompt_tap.js from apps/learning-architecture/node_modules:
create the untracked link `ln -sfn /usr/local/lib/node_modules_global apps/learning-architecture/node_modules` in your worktree (never commit it).
NEVER commit a tool link: temporary node_modules symlinks stay untracked. Before every commit run `git status` and make sure no mode-120000
entry is staged.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging-for-scenario-tours incl. all its updates, one-clock-one-scheduler…, age-aware-norms…); the binding
T/DECISIONS_R30.md (your families AND your tail ids are named in your launch line; read the WHOLE file incl. «Progress metrics», the root causes, C177–C182, the other
families are your neighbours' contracts), T/DECISIONS_R29.md (C136–C176), T/DECISIONS_R28.md (C84–C135 still binding; C105 REVOKED by C135, C118 NARROWED by C148), T/DECISIONS_R27.md (C40–C83 still binding), T/DECISIONS_R26.md (C15–C39) and T/DECISIONS_R25.md (C1–C14);
the reports T/reports/round30{A,B,C,D}_handback.md, T/round30{A,B,C,D}/defects.md and PARTS.md and the per-scenario findings they cite;
T/COMPARE26_judge.md (the U-table that B's U-ids refer to); your namesake's round-26 report
docs/tours/polya-batch1/reports/fix29/<yourname>.md (functions it changed, its «not done» list); docs/decisions/2026-10-15-sources-roadmap.md
§9 and §14–§22; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R29_*.md.
Root causes only, never a patch for one sentence. Judge by the two need maps (roadmap §9): what the part must deliver by its own design, and
what the person needs at that moment. Proof: red-first node tests apps/learning-architecture/tests/test_tour1_r30_<yourname>*.js built from the
runners' own sentences, PLUS (C178) for F2/F6/F8 the WHOLE real-sentence corpus T/corpus30/CORPUS_R30_<family>.json (it may still be being written;
poll between steps, no foreground sleep; copy it to apps/learning-architecture/tests/variants/), and every entry of T/VARIANTS_R29.json for your mechanisms. An entry you cannot satisfy is reported with
its reason, never silently skipped, never edited. Never hard-code a calendar date in a test expectation that will pass with time: compute it
from today or freeze the page clock. All existing tests and banks R17–R29 stay green. An old assertion changes only where DECISIONS_R30
replaces it, with a comment. Quarantine, never delete (docs/overhaul/REMOVAL_CANDIDATES.md). No conventional numbers (only what follows from
the axioms / existing theorems / cited data). The «# مخاطب» block stays intact.
The a26 system prompt AS.SYS is at 19,988 of 20,000 characters: add NOTHING to it; new contracts go in page-built user-prompt blocks.
Whole page suite green (run tests ONE AT A TIME, never all at once — other fixers share the machine); then
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`.
Docs (AGENTS.md of the page): WORKLOG entry + PROGRESS row with the numbers below, HANDBOOK §10/§12 rows, docs/overhaul/AUDIT_LOG.md entry,
handoff note docs/overhaul/handoff-notes/_pending_tour1_R30_<yourname>_2026-11-18.md (contracts the other fixers must respect).
Numbering (next free on BASE30; the coordinator renumbers at merge if a routine took one): arith WORKLOG 164 / PROGRESS 161,
prior 165/162, correction 166/163, story 167/164, forecast 168/165, dates 169/166, surface 170/167.
Shared files: a45 is touched by story and prior; a46 by arith only (correction, prior and story CALL its exports — arith adds the per-clause verdict export of C138 and names its shape in its handoff note); a27 by prior, story, dates
and surface; a41 by dates and forecast (🎯 lives in a41 `PR.bookPred` and friends — forecast owns those functions, dates owns the date-ask
functions); a40 by story and forecast; a38 by correction and story. Keep your edits local to your mechanism's functions and say in the handoff note exactly which functions you changed.
Before the final commit, merge the latest finished sibling fixer branch the coordinator names (if any), rebuild, rerun.
Save progress often: commit after every mechanism that is green (a session may stop at any moment; a half-done fixer is re-run from its last commit).
Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.

## Round-30 additions (binding; everything in FIX29's «Round-29 additions» still holds: C101 + C137, C136 look-alikes, C139 one judge,
## no over-fix, ask or «نسنجیده» when undecided, offsets, «Not done» verbatim)
- **The tail is yours too (C177).** Your launch line names TAIL ids (from `reports/fix30/tail_triage.md`, which gives each id's evidence
  path and source function). Each is closed only when every round-30 scenario it held is replayed at page level and no longer shows it.
  An id you find is «not a page defect» or «needs a ruling» goes back in your hand-back with the evidence — never silently dropped.
  Report a table: tail id | scenarios replayed | closed / not a page defect / needs ruling.
- **Corpus, not named shapes (C178).** F2 (arith), F6 (dates), F8 (correction): the whole corpus `T/corpus30/CORPUS_R30_<F>.json` is your
  proof set — make every entry green or report it with the reason. Never edit an entry; an entry with `"expected": null` /
  `needs_ruling` is listed for the coordinator, not guessed. Other fixers: grep the corpora for sentences your change could touch
  (look-alikes) and run them.
- **Whole-scenario replay (C179).** Your C137 replay diffs EVERY turn of each replayed scenario against its round-30 output (each 📜 line,
  coach-line mark, date row, 🎯), not only the target turn. List every change you did not intend as «side effect» with turn and quote;
  an unintended change on a line that was right is a regression and you fix it before you hand back. Always include the four
  regression scenarios: aC1 (C30-7), s35 (D30-4), s12 (B30·D1), tB1 (B30·D3), plus every scenario of your family and tail ids.
- **Regressions you shipped last round are yours first:** arith C30-7 (C180), dates D30-4 (C181), surface B30·D1 and B30·D3.
- Progress columns in your hand-back: families closed (a+b+c in all groups that showed them) · tail ids closed / assigned · corpus
  green / total · side effects found and fixed.

## Launch lines (tail ids: see TAIL_<name> below, filled from the triage)
- arith: F2 — S1 C30-7 first (C180: a remainder's total only from the same sentence or the live problem's recorded statement); C30-13,
  D30-5, A30-2, A30-9 «یکی/هیچی می‌مونه», B30·D11, D26-24 «می‌مونه حدود N و M دهم»; «N کم دارم», money remainders, «N تا برای فردا»;
  A30-20 «۸۷۵ + ۲۰۰ = یک میلیون و ۷۵» (F1 S3) — a46_arith (+ a38 `runs25` lexer). Corpus F2.
- prior: F17 — D30-1 (another person's sentence never rewrites her ledger step; «به دستِ خودش» only for her own), A30-22/D30-2 (a fixed
  step stores its calculation, not the whole sentence), A30-21/B30·D14 (a second problem's numbered steps make its own ledger without a
  model `prior`), C30-11 (a second garden's ledger is its own record — with story) — a45 prior ledger.
- correction: F8 — all of DECISIONS_R30 F8 list; C89 one proposal function over recorded dependency only (never ratio — A30-16, C30-15,
  B30·D6, D30-8); compound amounts and named quantities in the correction path; plural verbs; «همون N درست بود» take-back through the
  same function (C30-16, D30-11, A30-11); a value that sits in a ledger step (D30-6); ranges (C29-15, D30-9, A30-11); C111 across a
  take-back (A30-10); chat-only records (C30-9, A30-7, D30-7: never rewrite her line into a ✗ she did not write); exact fractions C161
  (A30-24, D30-10, B30·D8) — a38 stale engine, a27 retract. Corpus F8.
- story: F15 — A30-8 («…» sums kept whole; marks from `ST.arithClauses`), C30-1 (a defined term «a_2 = 2» is not arithmetic), C30-8;
  F10 — A29-28 (move with dependants asks in a chat problem too), D29-16; F11 story side — C30-11 (with prior), A30-18, A29-19, A27-22,
  B27·D7, B28·D9, C27-19, D29-13, B29·D15 — a45 story, a40 dossier, a31.
- forecast: F4 — A30-13/C30-19 (a probability about the present or past makes no 🎯; C170), C30-20/B30·D17 (two percents in one clause
  ⇒ two 🎯, each settled alone), B30·D5 (her answer to the page's own C120 question binds), C30-18 (always ask for «حدودِ N»), Persian
  decimal point (A30-14, B30·D4, D30-14), D30-3/C30-17 (an unanswered 🎯 due confirm never returns as a 📅 plan ask), A30-14 (no data
  clause in the 🎯 text), A30-15 (chat settles reach calibration) — a41 🎯 functions, a31, a40 🎯 lines.
- dates: F6 — D30-4 (regression) + A30-3 via C181; A30-6, D30-16, B30·D21 via C182; D30-15 (a booked 📌 stays in «امروز» as «انجام شد؟»
  after its day); weekday/date disagree ⇒ «کدام یکی؟» (A30-4, B30·D20, C30-10, D30-13); every act sharing an idiom gets its own ask/row
  (A30-5, B30·D25, D30-12); «فردا بانک.» alone is asked (B30·D19, C30-14); ✏️ never removes another act's ask (D30-17) — a41 date-ask
  functions, a40, a29. Corpus F6.
- surface: F13 — A30-1 (a system question after a data clause stays a system question), D28-10 («این سامانه اصلاً … ساخته شده؟» —
  holds 11 runs); loop — B30·D3 regression (her take-back of «نه» is read; no re-sweep with false reasons), A30-23 (a taken-back «نه»
  closes the sheet); B30·D1 regression (strip register follows her register); B24·D16 / A30-12 / C30-6 history arrows one direction
  (holds 9 B runs); B30·D23 (C117 rule in the registry, rule block printed once); the C89 registry line (oC1) — a44 sys*, a26 post-check
  and page-built prompt blocks (NOT AS.SYS), a27 routing, a43, a29 labels.

## TAIL lists (C177; evidence, source function and ruling per id in reports/fix30/tail_triage.md; rulings C183–C188 in DECISIONS_R30)
- TAIL_arith: A30-2, A30-9 (the «یکی/هیچی می‌مونه» half; its s03 «mod» half is story), U26.
- TAIL_story: A23-8 (C183), A23-19, A26-9 (C184), A26-29, A29-19, A30-18, A30-19, B24·D15, B24·D18, B25·D24, B27·D7, B28·D13, C22-11,
  C26-1, C26-30, C26-40, C30-1, D25-8 (with surface's D28-10: both must land for the 8 oD1* runs), D25-16, D26-28 (C186), D27-33 (C188),
  A30-9 s03 «mod» half.
- TAIL_prior: A30-21, A30-22, C27-3.
- TAIL_correction: B28·D15 (the pwB1 duplicate-proposal shape), D26-43, D26-50, U38.
- TAIL_dates: A25-21, A26-30, D26-1, D26-42, D26-47 (S2), D27-29 (C187), D29-24, D30-4 (C181).
- TAIL_forecast: none in the tail — your F4 list is long; finish it.
- TAIL_surface: A26-19, A26-25 (C185), A30-1, B24·D16, B26·D12, B26·D16, B30·D1, B30·D3, C26-18 (C186), C26-23, C26-24, C26-33 (S2),
  C26-39, C28-21, D25-17 (check first that the reversed formula is the real rendering, not text extraction), D26-36, D26-40, D28-10, U59.
