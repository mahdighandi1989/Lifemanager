# FIX29 — dates fixer (R4) hand-back

- Branch `worktree-agent-a66c5ff5a4a6ea382`, head `e58bfb34`; merged into merge29 as WORKLOG 163 / PROGRESS 160 (1d07c4c3). One code conflict in a41 `PR.datePend` (forecast's and dates' C152 🎯 confirm line): forecast's line kept (forecast owns the 🎯 confirm); dates' bank #159 test accepts both.
- Commits: 9af44a0e (F6 core), 5235da7a (bank R4), 5ac5ad29 (docs), e594dc31 (suite look-alikes R22 #73, R23 #175, R26 U50, R28 #27), e58bfb34 (docs).

## Root causes
- C117 «زنگ زدم» with two calls: `PR.doneFromHer28` counted only booked items while `lapse27` silently closed date-ask items → one judge `cands29`/`close29`/`which29`, `stay29` (C167); old body quarantined `PR.R29_QUARANTINE.doneFromHer28`.
- C145 several days: `multi29`; per-sentence bare-day `bare29` (B29·D20); «پس‌فردا صبح انجامش میدم» read again (D29-25 regression).
- C147: `forAct29` (same verb, no new content word; C29-6); `state29` mood clauses (A29-12); nearest occurrence for passed days (A29-17).
- C144: only records whose text the edit changed are re-dated (a41 `touched29`, a27 `retractApply`, a38 `retractSess` deadline loops).
- C146: `pastAct29`/`doneOn29` past act with a past day recorded as done.
- C133: «یعنی حدودِ ۱۵ دی» books her day without a second row.
- B29·D22 `PR.herLater`. Smaller: `negBound28`, C51 negation, verbless errand lists, «آخرِ ماه» on the last day.

## Tests (all seven weekdays, frozen clock)
- `test_tour1_r29_dates.js` 22/22 (7 on base); `_bank.js` 38/38 (16 on base); `_replay.js` 19/19 (0 on base). C28-10 assertions in r28 dates (+replay) changed per C146 with comments. Suite 182/182; docs gate 14.

## Page-level proof (C137)
- C117, C145: A, B, C, D. C144: B. C146: C. C147: A, C. D29-25: D. C133: A, C, D (B not replayed). B29·D22: B. C165: a+b only. C166: unit/bank. C167: B.

## Not done (C153 → runner arms)
1. «X‌ی هفته‌ی بعد، ⟨روزِ نوشته‌شده⟩» disagreeing: no «کدام یکی؟» naming both days.
2. «سرِ برج» on the 1st of a Jalali month + «آره، هر دو» (bank #174) — needs ruling (→ DECISIONS_R30).
3. C166 📜 line for a past act with no open plan (story); `doneBy.day` not shown.
4. Near-half-year nearest-occurrence case («اولیش ۱ اردیبهشت» said in Mehr) not principled.
5. C165 «آره، هر دو» and C166 have no page replay.
6. «فردا بانک» alone is not a commitment (only multi-clause lists are read).
