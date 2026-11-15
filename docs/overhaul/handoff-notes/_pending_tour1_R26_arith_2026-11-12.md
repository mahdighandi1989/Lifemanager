# Tour 1 (Pólya), round 26: fixer «arith» handoff (2026-11-12)

Scope (DECISIONS_R26 «Fixer split / arith»): Q1 — the page's arithmetic reader. Both S1 families (correct work shown ✗: A26-1, B_x D19 = U2,
D26-16, C26-9, C26-10, C26-26, C26-31, A26-26, D26-52; wrong work shown ✓: B26·D20 = U1, D26-18), the silent lines (B26·D8, B_x D6/D8/D15,
D26-24, U26–U28), the missing block (B26·D10, B26·D35, A26-45), clarifications C15–C18, and the contest of the page's ✗ (owner bank 36;
A26-2, A26-3). Base: `BASE26` = 23e351f6. WORKLOG (130), PROGRESS 127, HANDBOOK §10 row (2026-11-12) + §12 row 74.

Files: `src/app/a46_arith.js` ONLY (no line of a45, a27, a29, a38, a26 was touched). Tests: new `tests/test_tour1_r26_arith.js`, byte copies
`tests/variants/VARIANTS_R26.json|md`; one guard of `tests/test_tour1_r25_arith.js` changed with a comment («۷ روز هفته × ۲۴ ساعت = ۱۶۸ ساعت»:
`none` ⇒ `ok`, C15/C17).

Functions changed in a46: `fmtV` (+ new `narrow`, `term10`, `fmtD`, `fmtLike`), `norm`, `tokens` (π), `parser` (`lit`, `factor`, `expr`, the
returned record: `tl`, `mags`, `frac`), `okPrev`, `leadOf`, `trailOf` (the running-sum branch), `tolSaid`, `agree` (the single-number branch),
`chains` (rewritten; + new `stripUW`, `scaledV`, `tailStart`, `headEnd`, `hasNum`, `hasOp`, `algebra`, `dateLike`, `endsNum`, `clock`, `pretty`), `okNext`, `units` (`CONN`, one
look-ahead), `run`, `arithChk`, `ST.arithNote`, `ST.arithLines`, the prompt hook; new `ST.arithUnread`, `ST.arithContest` and their two hooks.
Unchanged: `ST.arithSaid`, `ST.unitAt`, `quants`, the rational/interval helpers, `disowned`, `slashDec`.

## Exported names — all kept; what changed in their contracts

### `A.STORY.arithChk(text, ctx?)` — same signature, same array, three states instead of two
- Each entry still has `{expr, said, saidT, val, valT, ok, kind, unit?, conv?, sx?, unitUnread?, pos, pe}`.
- **New third state:** `ok: true` **and** `ask: true` = neither ✓ nor ✗ (C16: an integer written for a non-integer exact value, `kind: "round"`;
  C15: the numbers agree and only a power of a thousand differs, `kind: "scale"`). `ok: false` is still «a real mismatch under every natural
  reading». **A consumer that books «درست» must test `c.ok && !c.ask`.** `kind: "quot"` no longer exists (the integer-quotient reading is now
  `ask`/`round`, with `remT` = «۱۴ با باقی‌ماندهٔ ۲»).
- **New property on the returned array:** `ck.unread = [{text, why, pos, pe, cut}]` — operator lines the reader could not parse (C17). They are
  NOT entries of the array, so «empty array = the page read nothing» still holds for verdicts; but an empty array with a non-empty `ck.unread`
  is «the page saw an operator line and did not judge it» — say «نسنجیده», never «درست». `Array.prototype.filter/map/slice` drop the
  property: pass the original array to `arithNote` / `arithLines` (a45's `priorOf` does). `A.STORY.arithUnread(ck)` returns a copy.
- New optional fields: `unitRead` (✓ under the result's unit prefix, e.g. Wh ⇒ kWh), `uw` (read with unit words between a number and an
  operator), `remT`.
- `val` is now in the form of what she wrote (divided by her scale word, ×100 for a percent) so that it compares with the numbers of her
  own text; `valT` is the page's value in her form (percent, decimal with one digit more than hers, the same scale/unit word; a fraction only
  when she wrote fractions).
- `said` for a result with a scale word stays the bare number («21.96»); `saidT` carries the word («21.96 میلیون»).

### `A.STORY.arithNote(ck, verdict)` ⇒ `{bad, ask, unread, chk, chkM}`
- `bad` as before (some check is ✗). New flags `ask`, `unread`. With an asked or unread line and no ✗ the text is never «… سنجید: درست»:
  it is «… دقیقاً ۳٫۵ می‌شود و «۳» نوشته شده — گرد شده؟» / «حسابِ «…» را صفحه نسنجیده». The ✗ text and «(عددِ درست را لو نده)» are unchanged.
- **prior:** `priorOf` needs no change. `applyFix` (a45) still writes «حسابِ عددیِ متنِ تازه را صفحه سنجید: درست» for any non-✗ result; with an
  asked check that sentence is too strong — if you touch `applyFix`, use `ST.arithNote(ck, "ok").chk` there (HANDBOOK §12 row 74-ث).

### `A.STORY.arithLines(ck)` — prompt lines
«✓ «a = b» می‌خواند [(فقط عدد؛ واحدش نسنجیده) | (با واحدِ …)]» · «✗ «a» را «b» نوشته — حسابِ صفحه: v» · «؟ «a» ≈ v می‌شود … و «b» نوشته شده — نه ✓ و
نه ✗ …» · «— حسابِ «…» را صفحه نسنجیده — نه ✓ و نه ✗ …». **classify (post-check):** a reply that calls a «؟» or «—» line right or wrong without
its own computation is an unsupported verdict; a reply that states the page's number of a «✗» line is still a leak — except inside the
re-check block below.

### `A.STORY.arithSaid(ck)` — unchanged.

### New: `A.STORY.arithContest(s, msg)` (owner bank 36) — for prior and story
- Runs once per user message (`s.seq`), from a prompt hook that a46 puts FIRST in `AS.promptHooks` (so every later hook, including the
  prior-ledger hook, sees the ledger after the re-check). It acts only when a page ✗ is on the table: a ledger step with
  `pageBad && verdict === "wrong" && !fixed` that the page has not re-checked yet (`!(re && re.by === "page" && reAt)`), or a ✗ of an earlier
  message of the same chat (`s.coach.arithBad`), AND her message contests it (her words, or the same computation restated).
- She is right (the re-run reads): the step goes through **a45's own merge** — `ST.priorOf(s, {prior:[{n, quote, verdict}]}, um)` then
  `ST.priorMerge(pr, rep, {})` — then `x.re = {by:"page", was:"wrong", to, why, her}`, `x.reAt`, `x.badC = []`; the negative mind-card event of
  that step gets `wd`; a positive `AS.coachEvent(s, "c", "prior", quote, true, {prior:n})`; one 📜 event (`A.EVLOG.add`, id `ar26_<sid>_<seq>`,
  title «بازسنجیِ حسابِ صفحه (اعتراضِ خودت)»); a visible `sys` message «🧮 بازسنجیِ حسابِ صفحه …». `to` is `ok` when the model had recorded no
  reason of its own (`x.why` empty), otherwise `unchecked` (the page withdraws only its own ✗).
- She is wrong: `x.re = {by:"page", was:"wrong", to:"wrong", why: both computations}`, `x.reAt` — a45's `priorReply` then treats a repeated
  dispute without a reason as already re-checked (its own rule) and the page does not re-check again.
- **prior — please keep stable:** the signatures of `ST.priorOf(s, a, um)`, `ST.priorMerge(old, rep, o)`, `ST.priorFor(s, pid)`, and the step
  fields `pageBad`, `bad`, `badC`, `verdict`, `fixed`, `quote`, `why`, `re {at, by, was, to, why, her}`, `reAt`, `her`. If your Q4 work changes
  how a dispute is recorded, the page's re-check must stay «once», and `re.by === "page"` must keep meaning «the page re-ran its arithmetic».
- **story:** nothing is written into another problem's record: the ledger is the one of `AS.boundLive(s)` (open problem) or of the session's
  current chat problem — the same lookup the prompt block uses.

## The prompt blocks (page-built user-prompt blocks; nothing in `AS.SYS`)
- «# حسابِ صفحه روی همین پیام»: all lines when the problem has a prior ledger, or the message is her own work, or the chat is bound to a
  live problem (new); otherwise only ✗ / «؟» / «—» lines.
- «# بازسنجیِ حسابِ صفحه» (new): «✓ بازسنجی شد ⇒ درست: گامِ n …» / «✗ بازسنجی شد ⇒ حکم ماند: … نوشتهٔ خودش: … · حسابِ صفحه: …». In this block
  the page's number is evidence and may be said.

## Rules of the reader that other families may meet
- C15: «N میلیون/هزار/میلیارد» after a result is a unit. ✓ when the literal reading or the one-scale reading agrees; «؟» when only the scale
  differs; ✗ only when the numbers disagree in every reading.
- C16: an integer for a non-integer exact value — sum/difference of fractions ⇒ ✗; anything else ⇒ «؟». With «≈/حدود» a decimal is accepted
  within one unit of its last digit.
- C18: «میشه» makes a claim only between a calculation and the number after it. A lone number before «میشه ⟨expression⟩» is a condition.
- Running sums («با X میشه R», «، ضربدر X میشه R», «A و B میشه R») may have words between the numbers; ✗ only when both numbers count the
  same thing, otherwise «نسنجیده».
- Not read, as before: number words, sentence arithmetic with no operator, anything with a Latin unknown, dates, clock times, scores.

## Not done (HANDBOOK §12 row 74)
Ellipsis sums are not expanded («نسنجیده»); «۳ متر در ۴ متر = ۱۲ مترمربع» (word «در» between quantities) is not read; the re-check re-runs
the same reader on the same text — it cannot overrule a misreading the reader still has; no real-model run of the new blocks.
C26-11 reproduced only inside its own sentence («… توان ۱۷۰۰ / ۰٫۵ = ۳۰۹۱»: «توان» was read as a function name) and is fixed.

## Evidence beyond the tests
All 972 user messages of the round-26 runs were read with the base and the new reader: 16 false ✗ of the base gone, 8 new ✗ (all real
slips the base passed), 3 «؟», 31 «نسنجیده» lines (sqrt, ln, «جذر», «نصفِ», implicit products of parentheses, ellipsis, number words).

## Update 2026-11-15 (resumed after the pause) — clarifications C23–C29
Commit `fix(lla): round-26 arith — clarifications C23–C29 …`. Files: `src/app/a46_arith.js` and `tests/test_tour1_r26_arith.js` only.
Functions changed in a46: `norm` («÷» ⇒ « / », never a tight fraction or decimal slash), `parser` (`tsl` count; new record flag `fr1`), `agree`
(C23 scale guard, C24 `"reading<g>"` result, C25 truncation via new `truncF`, C26 `fr1`), `chains` (`kind: "reading"`, `rdW`, `rdN`, per-message
scale context), `trailOf` (C28 «N تا … M» product run; run records carry `llits`/`xlits`), new `rdNums`, `askT`, `bothT`, both prompt hooks;
new export `ST.arithAnswer`. Names and signatures of all earlier exports unchanged.

### Contract changes other fixers must respect
- **`arithChk` entries:** a fourth `kind` of the «؟» state: `kind: "reading"` (C24) with `rdW` (the scale word, e.g. «هزار») and `rdN` (the raw numbers
  the reading scales). Still `ok: true, ask: true` — consumers that book «درست» keep testing `c.ok && !c.ask`.
- **C23:** «۲ میلیون × ۳ = ۶ هزار» is now `ok: false` (was `ask`/`scale`). `kind: "scale"` remains only when the scale word stands on one side.
- **C25/C26:** `ask`/`round` only for the rounding or truncation; «۱۳/۱۲ = ۱» (tight slash, two integers) is `ok: false` with `valT` «۱۳/۱۲».
- **C28:** «۳ و ۴ میشه ۸» is `ok: false` (`kind: "run"`; was an unread line); «N تا … M … میشه K» entries are `kind: "run"`, expr «۳ تا بستهٔ ۸۰».
- **C29 — prior / story:** a kept contest no longer carries the page's number anywhere: `x.re.why`, the coach line («✗ بازسنجی شد (یک بار) ⇒ حکم ماند …
  بازسنجیِ صفحه: همین تکه — «expr» در برابرِ «said» — نمی‌خواند (عددِ درست را لو نده)»), her «🧮» line and the 📜 lines. a45's ledger view prints
  `x.re.why` as before — it simply has no number now. Please do not re-add the page's value to a «حکم ماند» text.
- **New `A.STORY.arithAnswer(s, msg)` (C26)** ⇒ `null` or `{yes:[], no:[], lines:[]}`, once per `s.seq`. Open questions live in
  `s.coach.arithAsk = [{seq, text, expr, said, saidT, kind, re?}]` (kinds `round` and `reading`; written by a46's prompt hook); only the message
  `seq + 1` can answer. «آره/بله/گرد کردم/تقریبی» ⇒ `re = {to:"ok", apx:true}`; «نه/گرد نکردم/همین رو می‌خواستم» ⇒ `re.to = "wrong"` and an entry
  `{…, ask: true}` in `s.coach.arithBad` (so `arithContest` can re-check it; a re-check keeps it ✗ while the value is still not her integer).
  The block «# جوابِ او به «؟» ِ صفحه» is emitted by a46's first prompt hook (before «# بازسنجیِ حسابِ صفحه»). **classify (post-check):** in that
  block a «✓ … گرد کرده بود» line is a supported verdict; the «✗ … گرد نکرده بود» line carries no number, so stating the exact value there is a leak.
- **prior:** the answer does not change a «کارِ پیشین» ledger step by itself (HANDBOOK §12 row 74-چ). If you want the ledger to follow it, read
  `s.coach.arithAsk[].re` — the field names above are stable.

### Bank R26 against C23–C39 (re-run after the pause)
Q1 42/42 still pass. No Q1 entry contradicts C23–C29. Two readings recorded, not edited: banks #3 and #28 («۱۴۰ هزار … با ۶۵ میشه ۲۰۵ …») stay ✓ because it
has one scale word only (C15's consistent reading; C24 applies to two different scale words); bank #41's «with its computation as evidence» is
met in C29's sense — the re-check is shown as evidence by naming the link that does not read, never by the page's number (C29 is later and binding).
