# FIX29 — correction fixer (R2) hand-back

- Branch `worktree-agent-ab0e64b354ca8103a`, head `e257c5a7`; merged into merge29 as WORKLOG 162 / PROGRESS 159 (60968ff7).
- Commits: c1838d96, 2b46c11b, 0f17f910, 28a64c44, e257c5a7.

## Root causes / fixes
- F8/C89 one proposal function: each correction was recomputed alone → `a38` `chain29`/`props29`/`reg29` session registry `se.corr29`; engine runs twice (dependency with this datum alone; value with every corrected datum current); used by `staleMark`, `A.liveSessStale`, `A.livePriorStale`; time windows `at29/since29/start29`; superseded marks to history.
- Ratio path: tiers ج/د quarantined only in their ratio shapes (`A.LIVE_R29_QUARANTINE_C89.shapes`, REMOVAL_CANDIDATES); full quarantine broke nine R24–R26 verdicts that rest on her written word relations (decision in WORKLOG/HANDBOOK §10).
- C142 shapes: `CORR20` «X نمیشه، Y میشه», «یه اصلاحِ دیگه:»; chained pairs `D21`, `stBy29`; `REJ29` «پس جوابم غلط بود» with new numbers never rewrites (D29-23); bare «غلط» stays self-correction (R20 #73); C160 take-back.
- C143 which number: `CNT29`, `UQ29` (no cross-unit/dimension roots; physical datum not a money operand); bare digit with several quantities ⇒ «کدام؟».
- Text replacement: labels never replaced (`LABEL29`), digit-only replacement (`numOnly29`), named fragment occurrence, range as a unit (`rangeSub29`).
- C162 `REM29`, `wordRel` «نصفش/دو برابرش», `prev28 acc29`, no false «√».

## Tests
- `test_tour1_r29_correction.js` 14 runner replays (14 red on base → green), fixtures `tests/fixtures/r29_correction/`; bank R2 #59–#100 40/42 (NC #92 remainder in chat-only record, #93 «اتاقِ دوم» qualifier).
- C136 look-alikes kept; R20 #73 regression found and fixed. Suite 178/178 (most before e257c5a7; touched suites re-run). Docs gate 14.

## Page-level proof (C137)
- C89 + C142 chaining: A, B, C, D (A29-14/15, B29·D13, C29-10/11/12/13/14/15, D29-5/11/23/26). C143: C (+bank).

## Not done (C153 → runner arms)
1. B29·D14 and D29-10 first half: compound «N میلیون و M» read as two numbers by `numOccs`/`runs25` (arith-owned reader) in the correction path.
2. Bank #92 C162 remainder in a chat-only record.
3. Bank #93 qualifier separation («اتاقِ دوم»).
4. Exactness: accept-stale line in chat-only ledger «۳ ⇒ ۲٫۴» (accept27 ignores rewritten dependant); draft «از گفت‌وگو» row recomputed with one datum (`fullCopy26`).
5. C161 exact-fraction text (`ST.arithExactT` not yet called).
6. C163/C164 prior-ledger halves (prior did C163 + ledger C164).
7. Refuted guess «۱٫۷۵ ⇒ ≈ ۱٫۸۱۸۲» (s23) re-proposed with unexplained base.
