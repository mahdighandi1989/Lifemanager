# Handoff — Pólya R30 «correction» (F8 + TAIL_correction), 2026-11-18

Functions changed (respect these contracts when you touch the same files):

## a38_live.js
- `occs24` now returns through `mag30(T, O)`: a compound amount «N میلیون و M (هزار)?» is ONE occurrence — `v` in units of its leading magnitude (2.4 for «۲ میلیون و ۴۰۰»), `mag30` (1e3/1e6/1e9), `cmp30: true`, `alt30` (the other reading of a bare M, for C63), `e`/`raw` span the whole amount; the inner «۴۰۰» occurrence is dropped. A single «۸ میلیون» keeps `v = 8` and gains `mag30`. Only the stale/correction engine uses `occs24` (`numOccs` is untouched — arith's reader is unchanged).
- `numPair30(o, n)` (used by `pairs25` and `pair29`): compound-aware correction pair; falls back to `numPair` when neither side has a compound. Exported `A.liveNumPair30`, `A.liveOccs30`.
- `runs25`: a compound operand keeps `t.o` (the merged occurrence); `ev` multiplies a substituted compound by `mag30`; a compound result is compared at its own magnitude; after the C63 fit the occurrence's `v` follows the reading that fit.
- `staleCore25`: `mag27(o)` returns `o.mag30` for compounds; items carry `mag` and `dec30`; new option `opt.qual30` (from `qual30Of(<correcting sentence>)`) with `Q30` / `each30` / `member30` (C143/C198). `staleMark` (base `cur30`), `A.liveSessStale` (`o.cur30`) and `A.livePriorStale` (`o.cur`) pass it.
- Display: `fmtQ30`/`fmtV30` (her scale), `fmtRe25` → `exact30` (C161, `ST.arithExactT`) then the old `fmtRe25b`; `uq30` dedupes one number's proposal. Every «عددهای حساب‌شده» line, `accept28` lines and `s.stale26` items now carry `mag`.
- `accept28`: her accepted amount is also read compound-aware (B30·D9).
- `selfCorr` also accepts `A.ASSIST.CORR_PAIR30`.

## a27_tour.js
- `CORR_PAIR30` (exported `AS.CORR_PAIR30`, appended to `CORR20`): «<old number> … ن(می)?V…، … <new number> … (می)?V…» — same verb stem; old number required in the negated clause.
- `numOnly29`: extra words of the fix that are only verbs/copula/«تا» do not enter the record (digits replaced only). `retractCheck` canonicalises `fix` the same way.
- `chLine20`: a multi-run diff whose run is misaligned (one side contains the other) is shown as one `winDiff23` window (D26-43, C55).
- `retractApply`: the chat statement is not rewritten when she fixes her own answer (`what` ans/result) and every occurrence of the old value in the statement is in result position (D26-50, C88).

## For the other fixers
- arith: your `numOccs`/`runs25` lexer contract is unchanged; if you change `MAGLX27`/`mag2nd27`, keep `mag30` in step (same magnitude words).
- story/prior: stale items now have `mag`; prior-ledger `stale25.nums` values are in leading-magnitude units (unchanged semantics for amounts without magnitude).
- dates/forecast/surface: nothing of yours touched.
