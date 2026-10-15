# Pending entry: fixes from the «💡 جایگاهِ ایده» + factory real-path review (2026-10-15)

> This temporary note does not replace WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG or experiences. The session was asked to leave those files alone.
> Whoever records this work (urgent/general routine, or the session owner) must:
> 1. add the WORKLOG and PROGRESS entries;
> 2. update HANDBOOK §6 (the test numbers) and §12;
> 3. run `scripts/supervisor/handoff.py add --by session` for the cross-area edits listed below.
>
> Source of the findings: the skeptic review "Skeptic review: «💡 جایگاهِ ایده» + epistemic factory step 2" (items B1–B8 and A1–A5).

## Cross-area edits for the backtest routine to verify

These areas belong to the backtest routine (`epi-rules` and `epi-engine`). No rule, cap, station or weight was added, removed or changed. Each edit below makes the code match a theorem the owner already accepted.

| File | Area | What changed | Why it is conformance, not a new rule |
|---|---|---|---|
| `src/app/epi_found.js` | epi-rules | `F.yields(hit, f, k)` takes the claim object, and `F.condKeys` is new. A cap does **not** yield to T_pop in two cases. (1) `k.member === false`: the user said the claim goes beyond the finding. (2) A key in the cap's `when` comes from a link other than the finding itself (`k.other`). | Accepted text of T_measured_precedence. Step 3: the class is "from population j *and having this condition*", and the condition comes from the finding itself. Step 5: a claim whose truth needs another, unmeasured link is not a member, so T_weakest keeps ≤ ½ for that link. The old code checked only `x_relay`. It therefore dropped the ½ of any unproven premise or missing corroboration, even one unrelated to the finding (for example "this applies to me"). |
| `src/app/epi_engine.js` | epi-engine | `runClaim` passes `k` to `yields`. It also returns `ceilx` (the raw ceiling to 1 decimal, never 100 when the ceiling is below 100) and a `gapx` for each flag. | `ceil` and `gap` are unchanged, so Brier scores and backtest fields stay byte-identical. The new fields are for display only (B6): 60.9 used to show as «۶۱», 99.9 as «۱۰۰», and a real 0.1 over-confidence as «۰ واحد». The `over` decision still compares the raw numbers, as before. |
| `src/app/epi_st_b.js` | epi-engine (worksheets) | `st_aql` gets a `c` field ("which claim is this argument for?") and `lte`/`gte` checks on `analog_k`/`analog_n`. `st_expert` gets `xmethod` (`feat: x_method`), `xcomp` (`feat: x_comp`), `xchain` (`feat: chain`) and `xsame` ("is your claim exactly the finding, or beyond it?"). | The worksheets now ask the questions that the accepted rules `r_expert_pop_*` (`x_method`, `x_comp`, `chain`) and T_measured_precedence step 5 already require. Option lists come from the existing `EPI_FEAT` vocabulary. |

**Read-only backtest** (copy of `backtest/` in the scratchpad, run with `EPI_BT_DIR=… run --rerun`):
- **0 of 203** verdicts moved (fields `k`, `fl`, `full`, `ok` compared to the committed `results.json`).
- `foundation.json` is identical.
- `audit`: `violations: []`.

This is expected. Corpus, seed and frame claims carry no `k.member` or `k.other`, and `F.measure` does not call `yields`.

## What was fixed (page; area lla-page)

### Factory → «داوری قطعی» (`a7_bt.js`, `a2_ws.js`, `a13_epi_course.js`)

The new functions are `A.casePrefill`, `A.caseClaims` and `A.featProv`.

- **B1.** `st_expert` now prefills `x_method`, `x_comp` and `chain` (plus `x_field` and `x_relay`), but only for claims whose way is «تخصص دیگران».
  - An economics finding read directly at 80 now gets a ceiling of **60**, bound by `r_expert_pop_econ`, with `r_naql_ahad` yielded.
  - Psychology gets **۳۶٫۴**.
- **B2.** The argument form maps as follows:
  - «مغالطه‌آمیز» ⇒ «نامعتبر» (so `r_aql_invalid_form` now applies).
  - «قیاس معتبر» ⇒ «معتبر (قیاسی)», only for an «عقل» claim, the single claim with no way set, or the claim chosen explicitly.
- **B2, matter from the premise table:**
  - Every premise is self-evident or leads to the self-evident ⇒ «منتهی به بدیهی».
  - Any premise «نامعلوم» ⇒ «مقدمه اثبات‌نشده».
  - **«ظنی» has no faithful mapping**, so it is not mapped. The schema has no value for "justified probable premise", and the note on `r_aql_matter_unproven` says not to encode a justified probable premise (for example a reliable report) as «اثبات‌نشده». Mapping «ظنی» needs an owner proposal (one was already suggested in rules_cov.md).
- **B3.** Prefill now records where each value came from:
  - `cs.featPre[i][key]` = the worksheet station that filled the key. A key that was prefilled follows the worksheet when the worksheet changes, and is removed when the worksheet is cleared.
  - `cs.featClr[i][key]` = keys the user set to «تعیین نشده». These are never filled again.
  - A value the user chose by hand is never overwritten. If it disagrees with the worksheet, the page now says so.
  - The feature editor marks each key «از کاربرگ» or «خالی به دستِ تو».
- **B4.** The case-level `st_aql` worksheet now applies to one claim only:
  - the claim chosen in the worksheet's labelled selector; or
  - the only «عقل»/«استقراء» claim; or
  - the only claim in the case.
  - If more than one claim qualifies and none is chosen, nothing is applied and the page says why.
- **B5 (user path).**
  - `member` comes from `xsame`.
  - `other` holds the keys from `st_aql` or from «فراتر از یافته». Until the user says the claim is exactly the finding, keys set by hand in the editor also count as `other`.
  - Answering «فراتر» prefills `matter` = «مقدمه اثبات‌نشده»: the extra link is an unproven premise. The ½ then comes from the existing rule.
- **B6.** Ceilings display as «۶۰٫۹٪» and «۹۹٫۹٪» (never «۱۰۰٪» below 100). The gap displays as «۰٫۱ واحد».
- **B7.**
  - New `A.parseNum` accepts Persian and Arabic digits, «٫» and «٬». It rejects non-numbers and Infinity with a message next to the field.
  - The «حکم نهایی» percent column (all table num/pct cells) and the feature-editor numbers now use `type=text` with `inputmode`.
  - Counts are no longer clamped at 100; only `conf` and `mem_orig` are percentages.
  - k > n is rejected with a message, in the worksheet, in prefill and in the editor.

### «💡 جایگاهِ ایده» (`a35_idea.js`, `a36_solve.js`)

- **A1. The grade of an assumption** is now built as follows:
  - It uses the specific claim, recorded as `idea_link.claim`. For a case with several claims, `idea_link` without `claim` warns and the page shows a labelled claim picker; until a claim is chosen, the grade stays ½.
  - It is the minimum of the engine ceiling (prefill run on a copy; nothing is saved) and the user's own final grade.
  - A recorded outcome «نادرست» ⇒ 0, «رد شد با مشاهده» (A0).
  - 100 is allowed only for self-evident, presential (حضوری) or deductive-with-self-evident-premises claims. Otherwise the grade is 99.9 (T_below1).
  - An open critique ⇒ «زیرِ نقد», at most ½ (A4), until it is answered with evidence (a new labelled answer field).
- **A2.** `idea_add` checks the strength's `ev` against the session's user messages. It passes on a quote, or on ≥ ¾ word overlap with no numbers the user did not say. Otherwise the strength is marked «از دستیار — تأییدِ تو لازم».
  - Confirm and reject buttons sit in a `data-own` block, so the assistant cannot press them.
  - A rejected strength is kept, shown struck out.
- **A3.** `degOf` handles Persian digits. A value ≤ 1 is read as a fraction only when the field is declared a fraction; the percent column is not one. A non-number never throws.
- **A4.**
  - «فرضی که هنوز ننوشته‌ام» opens a labelled field and creates that assumption.
  - The 🌱 step stores `tests` = {critique, critique text, target assumption, what would change}.
  - A «نه / ترس» check with no new step sets `will.reask`, using the same ladder as drops (+3 days). It then appears in `A.dueList` and on the card (`.sv-willreask`).
- **A5.** The prompt-hook regex now uses Persian word boundaries.
  - It no longer fires on «مطرح کردم», «محصولات», «برنامه‌ای که دکتر داد» or «طرحِ درس».
  - It now catches «راه بیندازم», «کانال … بزنم» and «یک فکری دارم».
  - `AS.SYS` is unchanged, and `test_assist` passes.

## Tests

New tests (driven through the real UI controls; exit code 1 on any error):
- `tests/test_realpath_factory.js` (B1–B7)
- `tests/test_idea_v2.js` (A1–A5)

Three existing tests were updated, each for an intended behaviour change:
- `tests/test.js` and `tests/test_epi.js`: table number/percent cells are now `type=text` with `inputmode` (B7), so these tests find them by `inputmode` instead of `type=number`.
- `tests/test_idea.js`: the session now contains the user's own sentence that the strength quotes (A2). A strength whose evidence the user never said now stays unconfirmed.

All `tests/test*.js` and `scan_epi.js` exit 0, `build.py --check` is in sync, and the handbook and integrity pytest pass.

## Not fixed / left to the owner

- **«ظنی» premises ⇒ `matter`:** there is no faithful value (see B2). A deductive argument from guessed premises at 99 % still gets a ceiling of 100. Proposal needed.
- **B5 for hand-encoded backtest cases:** these have no `k.member` or `k.other`. The engine there still relies on the definition of `x_relay` ("direct reading = a member of the population"). The text of that feature in `epi_feat.js` could say this explicitly; that is an epi-rules wording change for the owner.
- **The `st_expert` worksheet is also case-level.** If a case has several «تخصص دیگران» claims, the same expert answers still apply to all of them (as before). It could get the same claim selector as `st_aql`.
- **B8** (the corpus never exercises the new theorems) is a backtest-routine task: blind-encode corpus claims with `x_field`, `x_relay`, `x_conseq_*` and `x_analog_*`.
- **Whether the model behaves as instructed** («به ایده نمره نده») is still enforced only by the prompt. It was not tested with the real model.
