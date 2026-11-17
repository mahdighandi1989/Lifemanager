# Handoff — Pólya tour round 29, fixer «correction» (R2: C89 one proposal function, C142, C143, C160, C162; family F8)

Numbering: assigned WORKLOG 158 / PROGRESS 155. On this branch the entry is WORKLOG **156** (the gate requires 1..N without gaps) and
PROGRESS row **153** cites it; the coordinator renumbers at merge.

## Functions changed (exactly)
- `a38_live.js`
  - New: `reg29`, `pair29`, `uok29`, `chain29`, `props29`, `A.liveChain29`, `A.liveCorrReg29`, `Q29C89` / `A.LIVE_R29_QUARANTINE_C89`, `LABEL29L`.
  - `staleCore25`: tiers (ج)/(د) of the guessed one-op relation are quarantined (`Q29C89.on`, default false); tier (ج) survives only
    «anchored» — the number is not itself an operand, follows «پس/میشه/یعنی» in its sentence, and its fresh co-operands are written in that
    sentence (`implicit(c, 3, false, true)`, new 4th parameter `same29`). New passes: per-pair freshness `q.at29` / `q.since29`; C143
    (`CNT29`, `UQ29`, `o.c143`: counted datum, «ساعتِ N», own-word unit, physical datum vs money/magnitude or another dimension);
    `REM29` (C162 remainder «N می‌مونه» after a written result with a stated need); `curV` keeps a «new»-valued root at its own value;
    `wordRel` reads «نصفش / دو برابرش» against the preceding result (C157).
  - `pairs25` / `numParts0`: carry `at29` and `since29` on parts.
  - `staleMark`: registers the correction (`chain29`), proposals via `props29`, supersedes the chained predecessor's mark and any item
    re-proposed (history in `L.stale24h`), take-back clears ledger marks (C160), chained `ord27.preAt` from the datum's first message.
  - `A.liveSessStale`: same registry/proposal function; history in `se.stale26h`; entries carry `c29`.
  - `A.livePriorStale`: uses a registered correction (`chain29(..., {look: true})` — never registers), `ord27.preAt` from the session,
    accepted rewrites of dep steps as current operands (`prev28[].acc29`).
  - `staleRecs`: `prior:n` records get the `at` of the message they quote.
  - `fixVal0` `tryRep`: never a step label; number-only replacement when old/new differ only in the number (suffix «ـه/است/‌ان» kept).
  - `numCopy`: skips step labels. `fmtRe25`: no «√» for a small-denominator fraction. `accept28`: «later correction» only along the
    registry chain (or same unit family); a proposal superseded by a later correction of the same datum names the stale base and the
    current exact proposal (C87/C111).
  - `liveRetract` / `retractMsg`: pass `cm`, `mAt`, `cAt` to `staleMark`.
- `a27_tour.js`
  - New: `LABEL29`, `repNum29`, `numOnly29`, `REJ29` (`AS.retractLabel29`, `AS.retractRej29`).
  - `CORR20`: «X نمیشه/نمیاد، Y میشه/میاد» and «یه اصلاحِ (دیگه):» (C142).
  - `retractCheck`: C143 «کدام؟» when the bare digit is several quantities across her messages; C160 take-back (frag = current value);
    C142 «پس جوابم غلط بود» marks `coachEv[].rej29` and refuses the rewrite.
  - `retractApply`: chain-aware `D21` («chain29»), statement follows the correction that wrote it (`stBy29`), c88 path label-aware and
    bound to the named fragment, range «a تا b» replaced as one unit (`rangeSub29`).
  - `subst20` / `subst19b`: label-aware numeric replacement.
  - `liveSessStale` call passes `cm`, `mAt`, `cAt`.

## Contracts for the other fixers
- Shared export shapes: `se.corr29[]` = `{id, at, src, cm, o, n, a, b, au, bu, o0, a0, src0, prev, sup, back, since29, start29}`;
  stale entries (`L.stale24[]`, `s.stale26[]`) may carry `c29`; superseded marks live in `L.stale24h[]` / `se.stale26h[]`;
  `coachEv[].rej29 = {at, by, why}` marks a result she rejected herself (story/📜 may show «ردشده به حرفِ خودت»; never rewrite it).
- `A.livePriorStale` callers (a45 `EN26`, prior): unchanged signature; pass `sid` so a registered correction is found.
- No text length another part reads by offset was changed except by her own correction (WORKLOG 137 offsets untouched).
- a45 was not edited. Prior (C163/C164) owns the ledger fix-with-tag and the «never rewrite a step with text she did not write» path.
