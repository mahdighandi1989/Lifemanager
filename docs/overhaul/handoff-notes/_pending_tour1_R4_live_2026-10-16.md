# Tour 1 (Pólya), round 4: «live» fixer handoff (2026-10-16)

This note covers the live tunnel (`apps/learning-architecture/src/app/a38_live.js`) and the edits outside it, listed below. The items come from `DECISIONS_R4.md`: E2, the list content of E3, E4, E5, and the «live» small items of E8. DECISIONS_R2 and R3 still apply.

**Not done here:** docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG). The main session does those and the merge.

## Commits (branch tip a5e54dc + …)
- `e0127ea`: E2 and E3, plus the new test `tests/test_tour1_r4_live.js` (sections E2 and E3).
- `f192bdb`: E4, E5 and the E8 small items (a38 + a26), and the test-helper adaptation described below.
- `862e32a`: the E4 test. `eda376b`: the E5 test.
- `fb0433c`: E8 🌱 fix. E3: the unused-data line is sent only after a plan exists or when the user is stuck. E8 tests.
- `a13a27c`: E8 `kCountRe` «روش» (one word in a17) and the practical look-back units test.
- `047198a`: E3 «نقطه‌های حساس» added to the objective look-back. A «±۱۰٪» test.

## Red baseline
Run `LLA_FILE=<a5e54dc dist html> node tests/test_tour1_r4_live.js`. It exits 1 with 62 failing lines (including some exceptions on controls that did not exist yet). On the fixed build every check passes.

## Items
- **E2 — kind suggestion.**
  - `natGuess` returns practical only when the user has their own stake. That means a first-person singular resource, purchase or consequence: «بخرم»، «بفروشم»، «سود کنم»، «دارم»، «پولم/خانه‌ام».
  - The textbook voice, using first-person plural («داریم … اضافه کنیم») with a computed unknown, gives objective. So does a textbook imperative («پیدا کنید»).
  - A statement quoted in «…» is judged first.
  - An ethics dilemma gives life, even when the text contains money words.
  - New `typeGuess` (`A.liveTypeGuess`): «آیا…؟» / «… هنوز درست است؟» gives pod, and «ثابت کنید» gives prove. A decision phrased «… یا نه؟» stays find.
  - The type suggestion is preselected in the 🔭 form until the user picks a type.
  - `live_new` without a kind and look-back children take the guessed type. They no longer inherit the parent's type, but they still inherit its judge and spatial flag.
- **E3 — list content.**
  - New `A.LIVE_QK` holds the practical and life lists for u, p and c. Each one rewords the full Pólya list: look at the unknown, definitions, related problem result/method plus auxiliary element, working backwards, other data needed, and restate after a failed step.
  - `withCore` fills any missing core question into the objective and prove lists.
  - `A.liveKindQs(cls, ph, fallback)` is the consumer API. `a27` `phaseQs` now calls it (a one-line consumer; see below).
  - Life pod: the understanding card uses hypothesis words (`SAT_POD_LIFE`, «+ فرضِ دیگر», a فرض/حکم intro). The hook header says «فرضیه» instead of «اثباتی/اثبات یا رد کن».
  - The hook lists the whole phase list, with each question whole: no cut at 7 and no clip.
  - The «داده‌هایی که هنوز…» line is sent only in exec/look-back, or in plan when the user is stuck. It is no longer sent at plan start.
  - `liveCoach(pid, {stuck:true})` in plan suggests «از خواسته به عقب» first.
- **E4 — heuristic gates warn, they do not block.**
  - These gates use `softGate`: circular reason, sufficiency challenge, «کجا خط می‌کشی», approximation, «مبهم/پیشین», units, the «ignore the test» reason, limit-case text, and the look-back near-copy checks.
  - Each one shows its challenge once and offers `#lpSoftWhy` / `#lpBSoftWhy` «ثبت با همین — دلیل». The reason is stored in `u[1].soft` / `b[1].soft` and in `live.softLog`.
  - False positives fixed:
    - `CIRC_RE` no longer includes «معلوم/مشخص است». Circular now means the reason asserts a value or identity, not that it merely mentions a word of the unknown.
    - `APPROX_RE` accepts word quantities.
    - A qualitative unknown (who/which) needs no numeric approximation.
    - Units are checked per statement, split on ⇒ / → / ؛ / «پس», and duplicate messages are dropped.
    - `lbFlags.limit` applies only to an objective find with numeric data. Labels like f6 are stripped first.
- **E5 — look-back.**
  - Each recorded condition part gets a select `lpBCP_i` («نتیجه این بخش را برآورده می‌کند؟»). Any «نه» means a defect («ناتمام — برگرد…»). A check text that negates a part is flagged next to that part (`.lp-bpneg`), and «بله» on it becomes a soft challenge.
  - Pod gets a third option, «هیچ‌کدام — استدلالم شکاف دارد», which leads to a defect.
  - `liveCoach` exec question after an outcome, in order:
    1. `EQ_FEW`, when there are fewer equations than unknowns;
    2. the saved presupposition, when the result breaks it;
    3. «فاصله با پیش‌بینی…» (life/practical);
    4. restate, after a failed step.
  - `usesAnalogy(s, r)` also detects a ratio carried to a new quantity, in steps or in the user's chat in a bound session.
  - `lpBBest` is always present. It lists the plan questions answered, then the understanding-card questions, then chat questions. A chat fragment maps to the whole known question, and preambles are split off.
  - The aside (set-aside) data are raised in the hook when the user is stuck.
  - The isomorphism mapping is carried in `origin.map`. It appears on the child page (`.lp-childmap`) and in the child's hook.
  - Indirect ⇒ direct is offered for any objective proof-shaped step.
- **E8 (live).**
  - The incubation card shows the real day count.
  - The next mid-course check-in is counted from the last check-in.
  - `clearBad` also drops bad toasts from the assistant's «پیام‌های اخیرِ صفحه» (`AS.dropBadToasts`, a26). Repeats are listed once.
  - The 🌱 card is not re-rendered after its step is saved (afterCard shows a «ثبت شد» line), and the page-level due card skips a 🌱 step committed today.
  - bidi (a26): Persian punctuation at a token's edge no longer breaks the formula isolate.
  - `lpSuff` labels follow the type (prove/pod); the values are unchanged.
  - `stepFollowsTag`: a step that negates a plan word does not follow the plan. Substitution into the condition counts as checking.
  - Objective wording after the plan toast and in VIEW_META.
  - Pascal's rule is in the prove/pod exec list.
  - Practical look-back: `lpBUnits`. Spatial/objective «بیش از یکی» follow-up: `lpBMultiW`.
  - `lpBDep`: label and values now agree.
  - A defect «back to plan» keeps `livePhase` = p until the plan is saved again.
  - «آزمون را نادیده می‌گیرم» needs a reason that names a cost or risk of the test (soft).
  - The user's own proverb gets a C150 line in the hook.
  - Book lines per phase come from coverage items: A263/B188 inventor's paradox, A038/B051 definitions, C145/B162/A269 «label heuristic reasoning incomplete», C168 mushrooms.

## Files outside a38
- `a27_tour.js` (coach's file): one consumer line in `phaseQs`, which reads `A.liveKindQs(cls, ph, L1)`. Ordering, suggestion and the a27 hook cut stay with the coach fixer.
- `a26_assist.js`: the bidi token test and `recentToasts`/`dropBadToasts`.
- `a17_kpractice.js`: «روش» added to `COUNT_RE`.

## Existing tests adapted (owner decision changed behaviour)
- `test_tour1_r2_live.js`: a look-back child and a chat child now have their own type (E2).
- `test_tour1_r3_live.js`, `test_live_problem.js`: «عنصرِ کمکی» is now in every kind's list (E3). The forbidden regex keeps «قضیه» only.
- `test_live_problem.js`, `test_tour1_live.js`, `test_tour1_r2_live.js`, `test_tour1_r3_live.js`, `test_tour1_r3_coach.js` (coach's test): the shared `click` helper answers any unanswered `lpBCP_*` with «بله» before `lp-lbsave`. These flows produce results that satisfy their conditions.

## Left for the coach fixer / not done
- E1 (`coach_state`), E6, E7, the a27 B3 timing and «از خواسته به عقب» ordering in chat-only coaching, and the a27 hook cut at 7.
- The idea hook on incubation (a35).
- Report items outside DECISIONS_R4, not touched:
  - `mentions` false negatives;
  - the aux «فقط بخشی از شرط» "how does the unknown vary";
  - the backward-branches/C095 hook line;
  - the relax card after an impossibility with sat=unknown.
