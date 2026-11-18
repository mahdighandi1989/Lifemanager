# Tour 1 (Pólya), round 30: fixer «arith» handoff (2026-11-18)

Scope: DECISIONS_R30 S1 C30-7 (C180), F2 (C30-13, D30-5, A30-2, A30-9, B30·D11, D26-24, «N کم دارم», money remainders, «N تا برای فردا»,
A30-20), tail A30-2, A30-9 (arith half), U26; rulings C189, C191, C192. Base: BASE30 = 5c7ce364. WORKLOG (164), PROGRESS 161, HANDBOOK §10 row
(2026-11-18) + §12 row 108.

## Functions changed (and only these)
- `src/app/a46_arith.js`: `normM` (two rewrites: «… N» after an operator expression ⇒ result mark; «یک/یه» before a scale word ⇒ 1),
  `focusStmt30` (new) + `stmt29(t, wide)`, `remains30` (new; `remains29` quarantined behind `ST.arithRem29On`), `ofPrev29` (C189),
  `claimU30` (new), `run` (calls remains30 and claimU30), the clause cutter inside `ST.arithClauses`; one field `c.sv30` on chain checks.
- `src/app/a45_story.js`: `ST.ownCalc28` only — the sentence loop that makes «حسابِ تو» 📜 items (`REMT30`, a digitless judged remainder becomes
  its own clause, a judged remainder clause is covered only by its own text). **story** owns this function; the change is three lines, marked
  «دورِ ۳۰ (arith)». Keep it when you rework the 📜 items.

## Contracts the other fixers must respect
1. **C180 — where a remainder's total comes from.** `ST.arithFocusStmt()` returns the statement the arith engine may read: the open live
   problem bound to the session (`ST.focus26`), or the focus chat problem's `coach.stmt` (only if `coach.pk` is that focus). A closed problem,
   another problem of the conversation, or a stale `coach.stmt` ⇒ "". Inside it, numbers of the statement's own arithmetic and «هر X N» rates
   are never totals. Do not pass another problem's text as `ctx` to `ST.arithChk` / `ST.arithClauses`.
2. **Remainder checks** (`kind: "remc"`, `rem29: "rem"|"short"|"sur"`): `said` is her number ("0" for «هیچی نمی‌مونه», "1" for «یکی می‌مونه»),
   `saidT` her clause, `expr` the page's subtraction in her scale («۴ میلیون − ۳ میلیون و ۶۰۰ هزار»), `valT` the page's value. Unread
   remainders are `ck.unread` entries with `rem29` and a `why`. A remainder is never judged against numbers of an earlier turn.
3. **C191:** several possible totals that disagree ⇒ unread «چند کلِ ممکن در متنش هست و حکمِ یکسان نمی‌دهند». Never pick in your code either.
4. **Per-clause verdict export (C138)** is unchanged in shape — `ST.arithClauses(q, ctx?)` ⇒ `{ mark, clauses: [{ a, b, t, claim, mark, checks,
   unread, line }], line, lineM, ck }` (see the R29 arith handoff). New: a remainder clause that follows a check in the same comma-clause is cut
   into its own clause («بعدش ۸ + ۶ = ۱۴» ✓ · «۲ تا می‌مونه برای داداشم» ؟), so a ✓ is never hidden under «؟». **story / prior / correction**:
   read marks from here; never re-judge a remainder.
5. **correction** (F8): `ST.arithChk` now gives a remainder after a compound sum its own check with `expr` in her scale; a corrected datum that
   feeds a remainder can find it by `kind === "remc"`. Her own wrong result is the operand of the next remainder (C108/C109): «… = ۲۲٫۷
   میلیون؛ پس‌اندازم ۱۸ میلیونه، پس ۴ میلیون و ۷۰۰ کم دارم» ✓.
6. **forecast** (F4): a sentence with «مطمئنم/احتمال/شانس/فکر کنم» and a percent is never a remainder clause (no line), so «۷۰ درصد مطمئنم
   حدودِ ۶٫۵ متر پارچه اضافه میاد» stays yours.
7. **dates** (F6): «۴ تا هم برای فردا می‌مونه» is a remainder (✓/✗), not a plan — do not ask a date for it.

## Not done (reported to the coordinator)
- F2-034 / F8-031: «با سالنِ ۲ میلیون و ۷۰۰ میشه ۱۲ میلیون و ۱۵۰» is not read (C27-22 guard against an ezafe word after «با»); the shortage
  is «؟ نسنجیده», never ✗. Opening the guard needs a ruling.
- F2-042 / F2-051: accepting her fix of the previous turn's ✗ («آره ۸ تا می‌مونه») is the ledger/correction path (C8/C86).
