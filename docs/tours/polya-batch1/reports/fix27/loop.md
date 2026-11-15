# Fixer «loop», round 27 — hand-back (branch worktree-agent-abaf60d553997c3f1, head 803b8ac7)

Commits:
- f4400986 — main R7 fixes and the red-first test.
- 946fa008 — bank R7 33/33 (C80/C81).
- 803b8ac7 — two regressions fixed, plus docs (WORKLOG 143, PROGRESS 140, HANDBOOK §10/§12 row 84, AUDIT_LOG, handoff note, experience
  update).

Only `a44_route.js` was touched. Suite: 150/152 one at a time. The two reds (r24_loop D24-1, r26_loop #193/#195) were fixed in 803b8ac7 and
re-run green with the territory-related tests; the whole suite was not re-run after that commit.
The handbook/ownership pytest fails only on the numbering gap (143/140 on a branch whose next numbers are 138/135); the coordinator renumbers
at merge.

## Root causes and fixes
- **C54 (D27-28, C27-28, B27·D19): a tie answer was not read.**
  - Cause: her answer was read only once the coach had made the ❓ the turn's question, and a «هیچ‌کدوم» elsewhere in the message
    cancelled the choice.
  - Fix:
    - `askShown`/`shownNamed`/`askLast`: a ❓ is pending once shown. Her next message answers it by naming a candidate or by its order in
      the list (C81).
    - A bare «آره/نه» counts only if that ❓ was the newest thing before her message.
    - Negating one of two leads to one question about the other (C80).
    - `tiePick` matches a distinct part of a name as she wrote it. «هیچ‌کدام» counts only in a clause that is itself an answer.
- **B27·D19: a clear best fit was asked as a tie.** New rule by set inclusion, with no invented number. The clear best covers every step word
  each rival covers, and its description strictly contains each rival's overlap. Two identical descriptions still make a real tie.
- **D27-27 (C20/C2):** a newly built area that her reply names and that shares only frame words is asked about (`frameWords`, `sysSheet`).
  An old area that she merely names stays as before (R24 D24-1).
- **B27·D16:** the silence came from the harness, which restarted the page three times inside the 2-minute `sysSweep` throttle. The real
  defect: her «نه، X به کار نمیاد» after the arrival rejected the arrived tool. Now it rejects the area she named (`otherNamed`), on the page
  and model paths. Candidates weighed in the same sweep are named in the 📜 «سنجش» line (`setAlso`).
- **B27·D17:** the prompt filter's label names the real owner of the turn question («گامِ منتظرِ ابزار»).
- **C27-7 (C36):** `closedChat` files a piece that arrives after closure under the closed problem, with its «امروز» line, when her message
  refers back to it. Her «بازش کن» reopens the problem with a history line.
- **Small:** `foldW` reads «امن‌تر» ⇒ «امن»; `NOFIT` reads «اون یه چیزِ دیگه‌ست».

## Not reproduced
- U59 / D26-21: with the real host's `HOST.status`, a take-back closes the sheet. The round-27 B and D harnesses lack `status`.
- D26-22: the sheet list is correct in each turn; the page reopens the sheet after the model replies.

## Not done (other owners)
- B27·D18: the cause is `chatok` in `a27_tour.js` ~2680 (`ORD[ph] > ORD[ph0]` from the model's `ph`). a27 is not loop's file.
- C27-6: the 🧭 destination comes from a new chat problem that a27 makes from the sentence (story).
- `closedChat` works in later turns only through `pk` «l:pid» (§12 row 84).

## Tests
- `tests/test_tour1_r27_loop.js`: 12 runner cases, each with a negative.
  - Red on BASE27: d16b/c, d27, d19, d28, c28, z9, d17, c7.
  - Already green on BASE27: d16a, d22, u59.
- Bank R7: 33/33.
