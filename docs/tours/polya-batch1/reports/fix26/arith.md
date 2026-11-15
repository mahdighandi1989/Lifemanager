## arith fixer, round 26 (resumed): final report

The Q1 work is finished on branch `worktree-agent-a3ff98f0e454db01d`, in the worktree `/home/user/Lifemanager/.claude/worktrees/agent-a3ff98f0e454db01d`. Nothing was pushed, and main was not touched. The bank still passes Q1 42/42. One page test fails, `tests/test_polya_fix5.js`, and the failure is not caused by my change (details under "Tests").

**Commits since the base (23e351f6):**
- `bbe51bcb`, `030204d1`, `77e74000`: the work from before the pause (unchanged, reviewed through their stats and the handoff note).
- `4dfd1d4c` fix(lla): applies clarifications C23–C29.
- `fcb2c4fa` docs(lla): WORKLOG 130 updated and re-signed, HANDBOOK §10 row dated 2026-11-15, HANDBOOK §12 row 74 items (چ) and (ح), AUDIT_LOG, the lesson file in `experiences/`, and the handoff note.

There was no "wip" snapshot commit to review.

### What C23–C29 changed (all in `apps/learning-architecture/src/app/a46_arith.js`)
- **C23:** a scale word on an operand is part of the arithmetic. «۲ میلیون × ۳ = ۶ هزار» is now ✗; before it was «؟».
- **C24:** when a line has two different scale words:
  - the usual reading (each word on its own number) gives ✓;
  - if only the "all in one scale" reading works, the page shows that reading and asks «این‌طور حساب کردی؟»;
  - if she wrote those same numbers with that scale elsewhere in the message (A26-1 s09 «۳۰۰ هزار تومن»), it is ✓;
  - if no reading works, it is ✗.
  - A line with only one scale word keeps C15's single consistent reading, which is what bank #3 and #28 expect.
- **C25 / C27:** «؟» now applies only when her integer is the rounding or the truncation of the exact value (e.g. 100÷7=14, 2.9×3=8, 2.5×3=8). Any other integer is ✗.
- **C26:**
  - A tight «۱۳/۱۲ = ۱» is a fraction identity, so ✗.
  - «÷» (with or without spaces) and «تقسیم بر» are quotients, so «؟». «÷» is never read as a fraction or decimal slash.
  - Her answer in the next message is now read by a new export, `ST.arithAnswer`. «آره، گرد کردم» stores the line as approximate and ✓. «نه» leaves ✗, without the number, and that ✗ can be contested. Any other reply records nothing.
- **C28:**
  - «A و B میشه R» is a sum, and a wrong sum is ✗ (it used to be «نسنجیده»).
  - «N تا … M … میشه K» is a product.
  - Ranges are left out: «بین/از N تا M» and «۲ تا ۳ روز».
- **C29:** when she contests a ✗ and is wrong, the ✗ stays. The page says it re-checked once and points at the part that doesn't add up. The correct number no longer appears anywhere: not in the coach line, not in her «🧮» line, not in `re.why`, and not in the 📜 log.

**Functions changed:**
- Changed: `norm`, `parser`, `agree`, `chains`, `trailOf`, `askT`, `bothT`, and both prompt hooks.
- New: `truncF`, `rdNums`, `ST.arithAnswer`.

### Contracts for other fixers (full detail in the handoff note `docs/overhaul/handoff-notes/_pending_tour1_R26_arith_2026-11-12.md`, section «Update 2026-11-15»)
- All existing export names and signatures are unchanged.
- `arithChk` has a new «؟» kind, `kind:"reading"`, with fields `rdW` and `rdN`. Anything that records a line as correct must still test `c.ok && !c.ask`.
- New `s.coach.arithAsk` holds `[{seq, text, expr, said, saidT, kind, re?}]`. A «نه» answer also adds an entry with `ask: true` to `s.coach.arithBad`.
- There is a new prompt block, «# جوابِ او به «؟» ِ صفحه».
- **For prior:** the answer to a «؟» does not change the «کارِ پیشین» ledger step (HANDBOOK §12 row 74-چ). Please don't put the page's number back into a «حکم ماند» text.

### Tests
- **New `clar` section** in `tests/test_tour1_r26_arith.js`, with a look-alike negative for each fix. On the build from 77e74000 it gave 13 errors; now it gives 0.
- **Three of my own earlier expectations changed**, each with a comment citing the clarification:
  - «۲۵۰ میلیون × ۲۳٪ = ۵۷٫۵ هزار» went from ASK to FLAG (C23).
  - «۱۶ و ۱۲ میشه ۱۴» went from UNCHECKED to FLAG (C28).
  - The «حکم ماند» assertions in the contest section were rewritten for C29.
- **Bank:** I re-ran T/VARIANTS_R26.json for Q1 against C23–C39 and it passes 42/42. No entry contradicts the clarifications. One reading is recorded rather than edited: bank #41 says "with its computation as evidence"; under C29 that evidence is the part that doesn't add up, not the page's number.
- **Whole page suite, one test at a time:** 141 of 142 pass. `r20_routing` and `r24_today` print their own "OK" line and exit 0.
  - **The one failure is `tests/test_polya_fix5.js`**, check M3. It hard-codes «۲۵ آبان», and around today's real date that clashes with the test's "tomorrow" (its `T.d1`). It fails the same way with the base 23e351f6 reader built in, so it was not caused by this change. It should be raised with whoever owns that test, since a test must not depend on the calendar.
- **Pytest:** `tests/test_learning_architecture_handbook.py` and `tests/test_supervisor_ownership.py` give 14 passed.

### Not done
- Sums written with an ellipsis are not expanded.
- «۳ متر در ۴ متر» is not read.
- A re-check cannot overrule a misreading that the reader itself still has.
- The answer to a «؟» is not written into the prior ledger.
- No run with the real model on the new blocks.
- I did not have access to token or time figures.