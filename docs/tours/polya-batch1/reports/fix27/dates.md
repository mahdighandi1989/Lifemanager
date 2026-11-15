# Fixer «dates», round 27 — hand-back (branch worktree-agent-a8d25e24ebc6053e6, head 4eb2e088)

Commits:
- bd91bc29 — C49, lapse, C51, C58, C19/C35 triggers, C50 idioms, red-first test.
- 374ee84a — bank R3 #100–#150, C70, replacing a booked record on edit or negation.
- e32f9c6b — C69–C73, docs.
- 4eb2e088 — suite fixes and two C58 test updates.

Numbering: WORKLOG 141 / PROGRESS 138 / §12 row 87. Pytest handbook/ownership was 14/14 when checked with gap-free numbers.

## Root causes (a41_practice.js unless noted)
1. **A yes went to every unanswered ask** (A27-15, B27·D5, A27-1, D27-21).
   - New `PR.dateAnswer` + `herDays27`: a yes in any sentence answers only the open ask.
   - An older ask is answered only by «تاریخ درسته/نه», a Today button, or her restating the act (`ovD27`).
   - The old function is quarantined as `PR.R27_QUARANTINE.dateAnswer26`.
2. **Stored text was re-read against the new today** (A27-19, C27-11, D27-22, B27·D5, C27-5).
   - The text is re-read only when it changed, anchored on `P.d0`.
   - `lapse27`/`lapsed27` close an ask at the end of its day, when its plan closes, or when she reports it done.
   - `planWhen26` ignores a model re-report of an earlier day's plan.
3. **Negated days** (C27-1, C27-2, A27-2, A27-7):
   - read by `herDays27`;
   - removed before choosing between two options;
   - the day she gave instead is asked once;
   - with no replacement, the page asks «کدام روز؟»;
   - `negBooked27`/`negBookedDl27` un-book with history.
4. **The ✏️ turn was taken as an answer** (B27·D10, A27-10).
   - A ✏️ turn is never an answer.
   - `editOf27` closes the old ask as «replaced» and asks once for the new day.
   - `editBooked27` does the same for a booked record (C58).
5. **Forbidden triggers** (exits in `clauseOk26`):
   - object «رو/را»;
   - `PERF3_27`;
   - a bare day plus a copula;
   - `OTHERN27`;
   - `IMPER27` (an imperative counts as her own);
   - a duration with «الان».

   In `a27` `plan18`, a conditional is not a plan (C35).
6. **Idioms** (`idiom27`, `farv27`; C50, C70):
   - «سرِ برج/اولِ ماه», «آخرِ سال» and «عید» are dated as the rules say;
   - «بعد از عید», «وسطِ ماه» and «آخرِ سالِ تحصیلی» become a `free` «کدام روز؟» row that a yes never books.
7. **Smaller:**
   - D27-4: her written date gets the label «از حرفِ خودت».
   - C52/C27-17: a follow-up attaches to its 📌.
   - C73: a reminder links to its plan.
   - C72: «بله، پس‌فردا».
   - New fields `date0`, `whenHist`.

## Tests
- `test_tour1_r27_dates.js`: 51/51; 40 were red on BASE27.
- `test_tour1_r27_dates_bank.js`: R3 #100–#150, 51/51; 26 were red on BASE27.
- Old assertions changed for C58: r25_today #239, and r20_coach `editMsg`.
- Suite: 154 runs, 4 red, all fixed. All 49 date-related tests were re-run green; the other ~105 passed in the first run and were not
  re-run.

## Not done
- C58 on booked records: correction's `retractApply` moves the date first, then `editBooked27` closes and re-asks. These should become one
  path.
- Detection of a «done» report uses a simple stem.
- 📜 still shows an attached ⏰ as a separate line (story).
- The practice schedule missing from the prompt (D27-29, second half) is untouched.
- No real-model run.

Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R27_dates_2026-11-15.md`.
