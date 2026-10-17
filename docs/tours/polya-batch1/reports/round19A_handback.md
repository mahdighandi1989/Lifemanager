## Round 19 · runner A (s01–s10): 8 of 10 scenarios have zero defects; s02 and s07 have two S3s each

**Result: 8 PASS, 2 FAIL.** Every written criterion passed in all 10 scenarios. s02 and s07 fail only on the zero-defect rule.

**Build check:** 6fbd0377 is an ancestor of HEAD, `build.py --check` reports in sync, and the dist was built at 13:52, after the 13:36 commit.

**How the round ran**
- Each scenario replayed the round-18 control sequence with harness5.js and ended with `{"exit":true}`, so the `view_post_*` screenshots exist.
- Old model replies were reused unless a round-19 field applied, and fields were added only when her message carried them:
  - `guess.q` (verbatim test question) in s01, s02, s07, s08, s09 and s10;
  - `plan` with `when:"next-session"` for «دیگه ستون اضافه نمی‌کنم» in s01;
  - `step` reports in s01 p9 and s04 p5;
  - a new reply in s01 p11 that asks once about her plan.
- coach_state was omitted in at least one turn per scenario.
- findings.md, RESULT.txt and DONE are written for every scenario. Each findings.md has «خلاصه برای مالک», the criteria, «نقشهٔ نیاز» with the before/after mind card, «ارتقای لازم» and the defects.
- 10 e-mails were sent in the RUNNER16 structure, each with the group-A storyboard link.
- Browser profiles are deleted and none of my processes remain.

**Prompt scan:** 59 prompts, 0 unmarked second-question directives, 0 developer notes.

| Scenario | Result | Notes |
|---|---|---|
| s01 | PASS | N1 fixed. The `q` note is on the right option. The plan lifecycle worked end to end: asked once in the next session, a «📌» line on Today, then expired without being asked again. |
| s02 | FAIL | D1 S3, D2 S3. Formulas, the #lpNewS preview and the date-as-text all fine. |
| s03 | PASS | E1 fixed (`liveTransf` of the ASCII numeric step is false; `x^2 = 4 پس x = 2` is still true). N2 and L1 fixed. |
| s04 | PASS | N2 fixed. The chat step report was correctly refused («گام پیش‌تر بسته شده»). Look-back shows «هنوز داده‌ای نیست» and is not ranked. |
| s05 | PASS | N2 fixed. |
| s06 | PASS | R1 fixed (reg=to). order_id and idempotency-key not treated as math. |
| s07 | FAIL | D3 S3, D4 S3. The hours→height plot itself is correct. |
| s08 | PASS | The 10 Persian-digit formulas render. |
| s09 | PASS | |
| s10 | PASS | X1 fixed (option shows p₁+p₂+p₃). M1 fixed: the saved plan now counts on the mind card. |

**Mind card:** before/after is plausible in all 10 — successes show, empty stages read «هنוز داده‌ای نیست», nothing invented.

### Defects (all class b)
- **D1 — S3, s02.** The deferred-request candidate block («# درخواستِ عقب‌افتاده (نامزد، شاید)») named «۶۷ میشه.», a fragment of «باز ۳.۶۷ میشه.», which is not a request.
  - `REQ18_WANT` reads «میشه» as a request marker even when it is the copula ("becomes").
  - `sentsOf` splits the sentence at the decimal point.
  - Repro: omit coach_state in p5; the block appears in p6.
  - a27_tour.js:3022 and around 3035.
- **D2 — S3, s02.** When `q` is the first question of a multi-question run, the split puts it after the rest, reversing the conversation order.
  - Options read «کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟» then «حدسی گفتی — چطور می‌آزمایی‌اش؟ (حدسِ تو: …)». «ردش» is left without its referent.
  - a38_live.js:2849–2855 (it returns `[rest, IN]` unconditionally).
- **D3 — S3, s07.** In the series plot (no x column), the x labels are Latin index digits «1» and «4» beside Persian y labels «۵» and «۱».
  - a39_math.js:586 (`xs.map(String)`).
- **D4 — S3, s07.** The assistant's reply only quoted her series «۵، ۴، ۳، ۱», but it got a second identical plot under her own.
  - a39_math.js:629 (the series plot is attached to every bubble).

### Observations, not defects
- In s01 p4 and s10 p4, the conditional deferred-request line appeared for a question the previous reply had already handled. This is the designed asymmetric behaviour, and the line tells the model to ignore it in that case.
- In s06, the understanding row on the mind card shows 1/4. One of those stuck events comes from my replayed reply in p2, which marked «آره ثبتش کن» as stuck — class (d), my mistake.
- No scenario closed with an open live step, so the new «ask each open step at ✅ حل شد» card was not exercised.

### «ارتقای لازم»
1. One-tap «انجام دادم / ندادم» next to the «📌 برنامهٔ خودت» line on Today. Today a plan can only be answered in chat, and it expires silently if she doesn't (s01).
2. A simple 3D box sketch beside the understanding card for spatial problems (s02).
3. A geometry canvas for drawing points and the square split (s03; already on the batch-2 list).
4. A rehearsal space for hard conversations (s04, s05).
5. A timeline simulator for two concurrent requests (s06).
6. Plot axis names taken from the message's own words, plus adding a new data point to the same plot (s07).
7. An hourglass simulator (s08).
8. A units-aware calculator for formulas written with «میلیون / هزار» (s09).
9. A seating-table checker that marks which rule breaks (s10).

Everything is in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19A/:
- `<sid>/findings.md`, `<sid>/RESULT.txt`, `<sid>/DONE` and `<sid>/out/` for each scenario. The plot screenshots are `s07/out/s35.png` and `s07/out/s36.png`.
- `tools/` (with the new `fin.sh`) and `notes.txt`.
