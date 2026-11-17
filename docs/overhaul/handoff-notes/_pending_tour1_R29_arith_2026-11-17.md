# Tour 1 (Pólya), round 29: fixer «arith» handoff (2026-11-17)

Scope: DECISIONS_R29 R1 (S1 C29-1, C29-2, C29-3; D29-1/D29-2 via C135; C140, C141; compounds without limit; item labels; ✗ in her scale;
C138 export) and the post-bank rulings C154, C155, C156, C157, C158, C159, C161. Base: BASE29 = 40b34a51. WORKLOG (156), PROGRESS 153,
HANDBOOK §10 row (2026-11-17) + §12 row 101.
Files: `src/app/a46_arith.js` ONLY. Tests: new `tests/test_tour1_r29_arith.js`, `tests/test_tour1_r29_arith_replay.js` (+ `tests/fixtures/r29_arith/*.json`,
built read-only from T/round29X/<sid>/ctl and ai/); byte copies `tests/variants/VARIANTS_R29.json|md`; `tests/test_tour1_r28_arith.js` three
assertions changed with comments (C135, C141, C29-19/C154).

## NEW EXPORT for story, prior, correction (C138 / C139) — `ST.arithClauses(q, ctx?)`
```
ST.arithClauses(q, ctx) => {
  mark:   "ok" | "bad" | "ask" | "part" | "unread" | "",   // "part" = every judged clause ✓ but some numeric clause unread ⇒ NEVER a sentence-wide «✓ درست»
  clauses: [{ a, b,            // offsets in q (her own text, not normalized)
              t,               // the clause text, trimmed
              claim,           // true if the clause makes a numeric claim (engine check, engine unread, or digit + «= / ≈ / میشه / شد / می‌مونه / کم میاد / اضافه میاد / یعنی / درمیاد»)
              mark,            // "ok" | "bad" | "ask" | "unread" | ""   (unread = a claim the engine did not judge ⇒ show «؟ نسنجیده»)
              checks: [c…],    // the ST.arithChk entries inside this clause
              unread: [u…],    // the engine's unread entries inside this clause
              line }],         // ready text for HER view: «✓ «…»» / «✗ «…» — <arithNote chk, no right number>» / «؟ «…» — …» / «؟ نسنجیده: «…» (why)»
  line:   clause lines joined with « · » (her view),
  lineM:  same for the coach (✗ with the page's value),
  ck:     the raw ST.arithChk result }
```
Clauses are cut at `. ! ? ؟ ؛ newline ، ,` (not between digits) and merged when one engine check spans the cut («۲۵ ÷ ۴ = ۶، ۱ تا می‌مونه»).
With `ctx` (her whole message containing q) the engine judges inside the message, offsets stay in q. **Story**: build the 📜 mark from
`mark`/`clauses`, never from `ST.arithNote(...)` as a whole (A29-1). **Prior** (`a45_story.js` `tryFix` ~797–803, B29·D11): use
`ST.arithClauses(t).mark` / `ck` as the only judge; your own `calcs`/`numsOf` may only add «نسنجیده», never a ✗ against an engine ✓ (C139).

Also new: `ST.arithExactT("8120/3")` or `(n, d)` ⇒ «۲۷۰۶ و ۲ سوم ≈ ۲۷۰۶٫۶۷» (C161; correction's repeating-decimal proposals). Terminating values ⇒ plain decimal.

## Functions changed in a46
`tokens` (C105 branch moved behind `ST.arithC105R28On`; new `sel["b"+offset]` scales a bare amount — C154), `fmtSc` + new `fmtCmApx` (compound
results print «≈ ۱ میلیون و ۴۲۸ هزار و ۵۷۱»), `tolSaid` (≈ on a compound ⇒ her thousand digit, round or truncate), `agree` (C140 percent-label
candidate, C159 never over a rounding ask; new `intSum`: integer sums never ask «گرد کرده؟»), `REM` (a count word before «و N تا می‌مونه»),
`chains`/`read` (label strip `lblStrip`, all-compounds enumeration ≤ 8 else uniform readings, `bareX`, C155 `mixed`, `c.apx`, `c.v29`, `c.sub29`,
C108 inline remc quarantined behind `ST.arithC108R28On`), new `remains29` (C141/C156), new `ofPrev29` (C157), new `stmt29`, `run`, `askT`
(kind `mixed`), `sideT`/`arithLines` (her «≈» quoted as «≈»).

## Contracts other fixers must respect
- **New check kinds:** `remc` now also for narrative and post-operation clauses (`rem29`: "rem"|"short"|"sur"; `expr` «Q − H»; `saidT` = her clause
  «۶ تا کم میاد»); `of29` («نصفِ …»; `sx: true`); `mixed` (`ok:true, ask:true` — a «؟», never ✓/✗). Unread entries may carry `rem29`.
- **Coach line text:** «✓ «expr ≈ said»» when she wrote «≈» (before: always «=»). Tests matching «= …» on ≈-lines must allow «≈».
- **Readings:** a bare additive amount next to «N میلیون و M» is read thousands-first; «… تومن» never fixes units. «یعنی … ِ واحد» appears only
  when the all-units reading alone fits.
- **`valT`** of a ✗ with a compound result is in her words («۴ میلیون و ۳۰۰ هزار …»); of a «درصد» result without a percent operand it names
  both readings («۱۲٪ (…) یا ۱۲۰۰٪ (…)»). Do not parse it.
- **C156 statement source:** `remains29` reads `A.ASSIST.cur().coach.stmt` when her message has no total; nothing is written.
- **Offsets:** no rewrite changes text length.

## Not done
See the hand-back «Not done» list (verbatim in WORKLOG 156).
