# Round 29 — Group A runner: final report

All 21 group-A scenarios were re-run on main e0e26045 (`build.py --check` in sync; dist 07:27 is newer than the merge at 05:03). Round-28 controls and replies were replayed with the round-28 harness (harness7). New turns were added for arms T21–T27, for new arithmetic in each scenario, and for owner-bank questions 42, 64 and 65.

**Result: 1 PASS (aA3), 20 FAIL.** In round 28 group A had 2 PASS.
- **Round-28 defects:** of the 40 A28 ids, 29 are FIXED, 7 are CHANGED, 3 are STILL and 1 is NOT VERIFIED. Every round-28 S1 is FIXED (A28-5, A28-40).
- **New defects this round:**
  - one S1 family, A29-1, seen in three scenarios;
  - 14 new S2 ids;
  - 13 new S3 ids.

**Housekeeping**
- **Output:** `T/round29A/`. Each scenario has `findings.md` (UTF-8 checked), `RESULT.txt`, `DONE`, `route_table.md`, `ai/`, `out/` (shots and JSON), and its dossier, mind, Today and route texts. There is a `better/` folder where a turn failed. The round folder also has `defects.md`, `PARTS.md`, `mail_log.txt` and `pids.txt`.
- **E-mails:** 21 of 21 sent through Gmail to the owner's address. The address is in no file. `STORYBOARD_LINKS.md` has a round-29 A line.
- **Isolation:**
  - The page ran from file://, so no port was used (my range was 9300–9349).
  - One browser ran at a time.
  - Only my own PIDs were started or killed (listed in `pids.txt`); nothing was killed by pattern.
  - All browser profiles are deleted, and so are the scratch territory page copies.
  - The repo is untouched (`git status` is clean).

## 1. Result per scenario
| Scenario | Result | Defects (turn · family) |
|---|---|---|
| s01 | FAIL | A28-1 STILL p24 (S2 F6); **A29-4** p15 (S2 F4); A29-5 p36, A29-6 p41 (S3 F6); A29-7 p38 (S3 new); A29-8 p15 (S3 new); A28-6 STILL (S3) |
| s02 | FAIL | A29-2 📜 (S2 new); A29-9 p20, A29-10 p20, A29-11 📜 (S3 F1); A28-12 CHANGED p21 (S3); A26-8 STILL p11 (S3) |
| s03 | FAIL | **A29-12** p14/c103 (S2 F6); A29-13 📜 (S3 new); A28-12 CHANGED (S3); A26-9 p4, A26-10 p14 STILL (S3) |
| s04 | FAIL | **A29-14** p21–22 (S2 F8); **A29-15** p24 (S2 F8); A28-15 STILL p17 (S3); A28-14 CHANGED 📜 (S3) |
| s05 | FAIL | **A29-16** p27 (S2 F4); A28-23 STILL p27 (S3 F4); A28-24 CHANGED p28 |
| s06 | FAIL | **A29-1** p9/📜 (S1 new); A29-2 📜 (S2); A29-3 p9 (S3 new) |
| s07 | FAIL | **A29-17** p11 (S2 F6); A23-24 p7, A27-14 📜 STILL (S3) |
| s08 | FAIL | **A29-1** p11/📜 (S1); **A29-19** 📜 (S2 F11); A29-18 p11 (S3 F2) |
| s09 | FAIL | **A29-21** p20 (S2 F9); A29-2 📜 (S2); A29-22 p20 (S3 F9); A29-23 📜 (S3 F14); A25-21 STILL p17 (S3) |
| s10 | FAIL | A23-8 STILL 🧭 (S3) |
| pA1 | FAIL | A26-9 STILL p3 (S3) |
| pA2 | FAIL | A29-2 📜 (S2); A29-13, A29-22 📜 (S3) |
| pA3 | FAIL | **A29-4** p10 (S2 F4); **A29-24** p12/c60 (S2 F4); A26-19 STILL (S3) |
| aA1 | FAIL | A28-30 CHANGED p10 (S3 F9); A29-23 📜 (S3 F14); A23-19 STILL p1 (S3) |
| aA2 | FAIL | A26-25 STILL (S3) |
| aA3 | **PASS** | — |
| aA4 | FAIL | A26-29 STILL p6 (S2); A26-30 STILL (S3) |
| tA1 | FAIL | A25-17 STILL p9 (S3); A28-32 CHANGED 📜 (S3 F10/F14) |
| oA1 | FAIL | **A29-28** T23 (S2 F10); **A29-29** p38 (S2 new); A27-22 STILL 📜 (S2 F11); A29-27 📜 (S3 F10); A29-7 p39 (S3) |
| pwA1 | FAIL | **A29-26** 📜 (S2 F13) |
| pwA2 | FAIL | **A29-1** p12/📜 (S1, a child's view); A29-18 p12 (S3 F2) |

## 2. New defects (quotes in `round29A/defects.md` and in each `findings.md`)

**S1: A29-1 (new; story `ST.ownCalc28` with arith).** A sentence-wide «✓ حسابِ عددی‌اش را صفحه سنجید: درست» in 📜 covers a clause the page did not read, and that clause is wrong. Three cases:
- s06: «نصفش هم میشه ۱ میلیون و ۳۰۰»; the right value is 1,260,000.
- s08: «پس ۸ لیتر اضافه میاد»; the right value is 7.
- pwA2: an 8-year-old's «۳ تا کم میاد»; the right value is 2.

**S2**
- **A29-2 (new):** one message makes several duplicate 📜 lines («داده» ×4 plus «حسابِ تو» ×2) — s06, s02, s09, pA2.
- **A29-4 (F4):** a percentage in data is read as a confidence and makes a false 🎯:
  - s01 p15: «با ۲۲٪ افزایش میشه» became a 🎯 with 22%, due today, and Today asks «شد یا نشد؟»;
  - pA3 p10: «با ده درصد برای درز و دوخت» became a 🎯 with 10%.
- **A29-24 (F4):** pA3 c60 — an unrelated «۷٫۲ متر مربع = ۷۲۰۰۰» produced «این ۷.۲ حدودِ ۸ حساب می‌شود؟».
- **A29-12 (F6):** s03 c103 — «امروز خسته‌ام» in an unrelated sentence re-dated the pending «پنجشنبه» plan to today. It was already present in round 28 and I missed it then.
- **A29-14 (F8):** s04 — a second correction on the same datum («۶ نفریم نه ۵») was refused twice: «از آن بخش چیزی ثبت نشده بود».
- **A29-15 (F8; C89 unit-only, failed):** s04 p24 — after «۱۲ میلیارد» the page proposed «۲٫۷۵ ⇒ ۳، ۲۷۵۰ ⇒ ۳۰۰۰، ۲۷۵ ⇒ ۳۰۰». That is the stale 4 heirs, scaled by 12/11. With the current 5 heirs the values are 2.4, 2400 and 240.
- **A29-16 (F4):** s05 — restating a forecast with «یعنی: …» made a second 🎯. As a result «شد ۳ تا» asks «کدام؟» instead of settling «نشد».
- **A29-17 (F6):** s07 — «اندازه‌گیریِ بعدی ۳۰ آبانه», said on 3 Dey, became 30 Aban 1406 without the «گذشته — کدام روز؟» question.
- **A29-19 (F11):** s08 — the 15-litre jug arithmetic is filed under the «۵ و ۹» problem.
- **A29-21 (F9):** s09 — «داداشم حساب کرد …» is filed both as her «داده» and as «کارِ دیگری». «داداشم یه حسابِ دیگه هم کرد: …» is filed only as «داده», and the coach line has no label (the fixer's «Not done» item, confirmed).
- **A29-26 (F13):** pwA1 — «یه نقشه … نشونم میدی؟» became «مسئلهٔ ۲ از ۲» and a «↪» destination.
- **A29-28 (F10; C124 unit-only, failed):** oA1 — «↪ گامِ ۱ …» moved a step whose steps 2 and 3 depend on it, without asking all / only this / none.
- **A29-29 (new):** oA1 p38 — the system map in the prompt has no line on C87, C96 or C124, so the assistant cannot answer bank questions 42, 64 and 65 with evidence.

**S3**
- **A29-3** (s06): «نصفش میشه» gets no line.
- **A29-5** (s01, C133): «حدودِ ۱۵ دی» is asked again, and a second row remains.
- **A29-6** (s01): her «به بنگاه» answer to «کدام؟» has no visible effect.
- **A29-7** (s01, oA1): the register guard asks for a rewrite of a reply written fully in «تو».
- **A29-8** (s01): a «نسنجیده» line on «با ۲۲٪ افزایش میشه ۱۸ × ۱٫۲۲».
- **A29-9** (s02): a sum with labels between the numbers is silent.
- **A29-10** (s02, C105 failed): «… تومن» is «نسنجیده».
- **A29-11** (s02): the 📜 «؟» stays after her m2 answer (fixer «Not done», confirmed).
- **A29-13** (s03, pA2): small-talk arithmetic is filed under a problem in 📜.
- **A29-18** (s08, pwA2; C108 failed): «کم/اضافه میاد» is not judged.
- **A29-22** (s09, pA2): «فروشنده/تولیدی گفت ۱۲٪/۱۵٪» has no source label.
- **A29-23** (s09, aA1): «(C57)» is visible in her view.
- **A29-27** (oA1): a moved 🎯's «سرانجام: نشد» is replaced by «جابه‌جا شد».

## 3. «ارتقای لازم»
- **📜:**
  - put a ✓ only beside the clause that was judged; mark an unread clause «؟ نسنجیده»;
  - one line per sentence;
  - keep small talk out;
  - never file «کارِ دیگری» as her «داده»;
  - give a source label to «X گفت + value»;
  - no internal labels.
- **Arithmetic:** read the «… تومن» unit; read labels between operands; judge «N تا کم/اضافه میاد» against a stated total (C108); read word operations («نصفش / دو برابرش میشه N»).
- **🎯:** a percentage is a confidence only when it is tied to مطمئن / احتمال / فکر کنم / شانس, or answers the page's «چند درصد؟». It is never «افزایش / برای درز / تخفیف». A restated forecast is the same 🎯.
- **Dates:**
  - «X نه، Y» about the other act must not drag the negated day;
  - a day said in the past ⇒ «گذشته — کدام روز؟» on every path;
  - «امروز / فردا» binds only to its own sentence's act;
  - «یعنی حدودِ ۱۵ دی» answers the pending row.
- **Corrections:** a chain of corrections acts on the current value; proposals are built only from recorded dependency with every current value.
- **Move:** C124 asks before moving a step with dependants; a moved 🎯 keeps its outcome.
- **System map in the prompt:** one line per new rule, so the assistant can answer with evidence.

## 4. Round-28 defect table
Full table in `round29A/defects.md`.

| id | status | turn |
|---|---|---|
| A28-1 | CHANGED: p23 FIXED; p24 STILL | s01 c206/c208 |
| A28-2 | FIXED | s01 c220 |
| A28-3 | FIXED | s01 c224 |
| A28-4 | FIXED | s01 c230–237 |
| A28-5 | FIXED | s01 📜 |
| A28-6 | STILL | s01 📜 |
| A28-7 | FIXED | s02 p4, p10 |
| A28-8 | FIXED | s02 p17 |
| A28-9 | FIXED | s02 p17 |
| A28-10 | FIXED | s02 p17 |
| A28-11 | FIXED | s02 p19, p21 |
| A28-12 | CHANGED: s02 p13–18, s08 p10 and s09 p15 now present; s02 p21 and the s03 ellipsis sums missing | 📜 |
| A28-13 | FIXED | s03 📜 |
| A28-14 | FIXED in the result; 📜 still shows the whole sentence (CHANGED) | s04 p14 |
| A28-15 | STILL | s04 p17 |
| A28-16 | FIXED | s04 p19; pwA2 p8 |
| A28-17 | FIXED | s05 |
| A28-18 | FIXED | s05 p22 |
| A28-19 | FIXED | s05 p23 |
| A28-20 | FIXED | s05 p24 |
| A28-21 | FIXED | s05 p25 |
| A28-22 | FIXED | s05 p26 |
| A28-23 | STILL | s05 p27 |
| A28-24 | CHANGED | s05 p28 |
| A28-25 | FIXED | s05 p29 |
| A28-26 | FIXED | s05 p30 |
| A28-27 | FIXED | s08 📜 |
| A28-29 | FIXED | aA1 📜 |
| A28-30 | CHANGED: 📜 ✓, coach line ✗ | aA1 p10 |
| A28-31 | FIXED | aA3 p8 |
| A28-32 | FIXED in the ask; 📜 CHANGED | tA1 c57 |
| A28-33 | FIXED | oA1 T13 |
| A28-34 | FIXED | oA1 p33 |
| A28-35 | FIXED in s05; NOT VERIFIED in oA1 | s05 |
| A28-36 | NOT VERIFIED (oA1 end state lost, my mistake) | — |
| A28-37 | FIXED | pwA1 p19 |
| A28-38 | FIXED | pwA2 p7 |
| A28-39 | FIXED | pwA2 p7 |
| A28-40 | FIXED | pwA2 p10 |

Older ids:
- **FIXED:** A27-19 (aA3 p8), A26-39 (tA1).
- **STILL:** A27-14, A27-22, A26-8, A26-9, A26-10, A26-19, A26-25, A26-29, A26-30, A25-17, A25-21, A23-8, A23-19, A23-24.

## 5. ARMS TABLE T1–T27
| Arm | Scenario · turn | Verdict |
|---|---|---|
| T1 tie | tA1 c57 | PASS («اولی/دومی/یکی‌اند», no declaration) |
| T2 piece after closure | tA1 c76 | PASS |
| T3 «= N unit» | s01 p16; s08 p10 | PASS |
| T4 third prior report | pwA1 p17 | PASS with the model's prior. The page alone no longer merges (it did in round 28) — note |
| T5 take back a dispute | pwA1 p10–p11 | PASS |
| T6 «جمعهٔ بعد» / «باشه» | s10 p11; s01 p16 | PASS |
| T7 correction 5⇒4 | s04 p14, p17; pwA2 p7; s07 p7 | PASS |
| T8 two open predictions | s05 p15–p19 | PASS |
| T9 coincidental number | s04 p14; s07 p9–p10 | PASS |
| T10 division three ways | s02 p13 | PASS |
| T11 correction + question | s04 p16 | PASS |
| T12 mid-session / one-step opening | s06 p7–p9, pA2 p6/p8 | PASS |
| T13 move a misfiled line + undo | oA1 | PASS (72 buttons; history in both places; page clock) |
| T14 accept proposal / negation | s04 p19–p20; pwA2 p8 | PASS |
| T15 scale and roots | s02 p15–p19 | PASS («۲√۳» نسنجیده per C107) |
| T16 date asks | s01 p20–p27 | ✏️ into the past PASS; «پنجشنبه نه، شنبه» half (p24 FAIL) |
| T17 idiom dates | s01 p28–p35 | PASS |
| T18 confidence phrasings | s05 p20–p30 | PASS except a restatement (A29-16) |
| T19 someone else's work | aA1 p10–p11; s09 p20–p22 | partial (A29-21, A28-30) |
| T20 hypothetical / bare question | pwA1 p18–p19 | PASS |
| T21 «N میلیون و M» | s06 p9; s02 p20–p21 | no-carry ✓ with no ask; none-fits ✗ with both values; «N هزار و M» ✓; ordinal m2 ✓; «… تومن» FAIL (A29-10); labelled sum silent (A29-9) |
| T22 remainder | s10 p12 and aA1 p12 (after division ✓/✗); pwA2 p10 (after a sum ✓); s08 p11 and pwA2 p12 («کم/اضافه میاد») FAIL | partial |
| T23 move 🎯 / ledger step with dependants / statement / undo | oA1 | 🎯 ✓ (A29-27); statement ✓; undo ✓; step with dependants FAIL (A29-28) |
| T24 attribution | s09 p20; pA2 p9; aA1 | «X گفت … پس … = N» hers ✓; «مامانم کمکم کرد» hers ✓; brother «حساب کرد» and «یه حسابِ دیگه هم کرد» FAIL; source label FAIL |
| T25 two corrections / stale-base accept / X twice | s04 p21–p24 | two in a row FAIL (A29-14); C111 ✓; X twice ✓ but proposals FAIL (A29-15); accept in a chat-only problem ✓ (s04 p19) |
| T26 dates | s01 p27, p36–p41; aA3 p8; s07 p11 | ✏️ past ✓; «زنگ زدم» with two plans ⇒ «کدام؟» ✓ (answer ✗ A29-6); born-done plan ✓; «X درسته» ✓; «ماهِ دیگه» ✓; «حدودِ ۱۵ دی» FAIL (A29-5) |
| T27 forecasts | s05 p31–p35 | weekday in a forecast ✓ (one due confirm, no 📌); «حدودِ N» ✓; «مطمئنم» ✓; «۶۰» ✓; open/settled lists ✓ |

## 6. 📜 line-match tables (multi-problem scenarios, with marks)
| Scenario | Problem | Own lines (marks) | Wrong / missing |
|---|---|---|---|
| s01 | contract session | prior ✓✓; «۳ در ۴» ✓; «۳ در ۳» ✗; deposit ✓✓; «۲۱۶ میلیون» ✓ (old ✗ kept in history); 🎯 37% | false 🎯 22% (A29-4); two ✏️ merged into one event (A28-6) |
| s01 | «هفت سال دیگر…» / «خرید یا اجاره» | own only | none |
| s02 | «لوله» | ✓ ×9, ✗ «۰٫۷», ✓ «۰٫۰۷», ؟ «۸ ÷ ۳», ✗/✓ «۱۳/۱۲», √ ✓/✗, «۲√۳» نسنجیده, «میلیون و» ✓/✗/؟ | duplicates (A29-2); stale «؟» (A29-11); p21 lines missing |
| s03 | main / «اگر ۴ نقطه» / «شش نقطه» / triangle | the plan correction is now only under the triangle ✓; π, ۵/۶ ✓; «۵۵» ✓ | egg small talk under the triangle (A29-13); ellipsis sums missing |
| s05 | «ترفیع» / «گفت‌وگوی پرسشی» | 15 🎯 lines with outcomes | duplicate shelf 🎯 (A29-16) |
| s06 | «پرداختِ دوباره» / queue session | ✓ ۰٫۲۵٪; prior ✓; p9 ✓ ✓ | sentence ✓ over a wrong «نصفش» (A29-1); duplicates (A29-2) |
| s08 | «۷ و ۱۱» / «۵ و ۹» | ✓ puzzle, ✗ «۷ + ۱۱ = ۱۷», ؟ «÷ ۴۸» | jug lines under «۵ و ۹» (A29-19); «۸ لیتر اضافه» shown ✓ (A29-1) |
| s09 | three cake problems | ✓ ۱۶ میلیون و ۶۴۰; ✗ ۲۴ میلیون | brother's work as «داده» (A29-21); «(C57)» |
| pA2 | «حراج» / «اجاره» | ✓ ۱۸۷٫۵; prior ✓; ✗ «۱۵٪ِ ۷۰۰ = ۱۰۰»; ✓ ۵۹۵ | duplicates; no source label; small talk |
| pwA1 | problem / «۷ × ۸» session | ledger ✓ (6 steps) | «یه نقشه …» counted as problem 2 (A29-26) |
| oA1 | handshakes / stay-or-go / meeting ×2 | handshakes ✓ | decision lines under handshakes (A27-22, now movable); the meeting has two records (3 and 4) |

## 7. Prior-work verdicts
| Scenario | Outcome |
|---|---|
| s01 p15 | two-step opening ✓✓ |
| s06 p8, pA2 p8 | one-step opening fires ✓; a mid-session calculation does not ✓ |
| pwA1 | per-step verdicts, mixed reply, re-check, take-back, 2nd and 3rd report merged (the 3rd with the model's prior); hypothetical ✓; «… بود دیگه؟» no block ✓ |
| pwA2 | per-step ✓; correction stale marks exact; «۳» asked, not invented ✓; accept in the ledger ✓; child's remainder ✓ |
| oA1 p37 | a separate problem with three steps ✓; ✗ «۴۵ − ۲۸ = ۱۸» ✓ |

## 8. Arithmetic (exact values verified; full tables in each findings.md)
| She wrote | Exact | Page | Verdict |
|---|---|---|---|
| ۵ میلیون و ۴۰۰ − ۲ میلیون و ۸۸۰ = ۲ میلیون و ۵۲۰ (s06) | 2,520,000 | ✓ (thousands reading, no ask) | right |
| نصفش میشه ۱ میلیون و ۳۰۰ (s06) | 1,260,000 | no line; 📜 sentence ✓ | **S1 A29-1** |
| ۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰ (s02) | 5,700,000 | ✓ bare; silent with labels | right / S3 |
| ۳ میلیون و ۴۰۰ − ۱ میلیون و ۱۰۰ = ۲ میلیون و ۲۰۰ | 2,300,000 | ✗ with both readings | right |
| ۱ میلیون و ۸۰۰ تومن − ۳۰۰ تومن = ۱ میلیون و ۵۰۰ تومن | 1,000,500 | نسنجیده | S3 A29-10 |
| ۱۲ هزار و ۵۰۰ × ۲ = ۲۵ هزار | 25,000 | ✓ | right |
| ۲ میلیون و ۸۰۰ ÷ ۴ = ۷۰۰ + «اولی» | 700,000 | ؟ ⇒ ✓ | right |
| sqrt(۱۵٫۷۳) ≈ ۳٫۹۷; sqrt(۲)/۲ | 3.966; 0.707 | ✓ ✓ | right |
| ۱۳ − ۸ = ۴ (s07) ; ۱۴ − ۱۲ = ۳ (s10) ; ۹² − ۱ = ۸۱ (pA1) | 5 ; 2 ; 80 | ✗ ✗ ✗ | right |
| ۱۴ ÷ ۴ = ۳ و ۲ تا می‌مونه ; ۱۹ ÷ ۳ = ۶ و ۲ تا می‌مونه | 3 r 2 ; 6 r 1 | ✓ ; ✗ | right |
| ۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه (pwA2) | 15 | ✓ | right (A28-40 FIXED) |
| ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد | 16 ; 2 | ✓ ; no line; 📜 ✓ | **S1 A29-1** |
| ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد (s08) | 22 ; 7 | ✓ ; no line; 📜 ✓ | **S1 A29-1** |
| ۷٫۲ × ۱٫۱ = ۷٫۸ (pA3) ; ۱۸۰ × ۲٫۵ = ۴۰۰ (aA4) ; ۲۴ ÷ ۸ = ۴ (aA3) | 7.92 ; 450 ; 3 | ✗ ✗ ✗ | right |
| ۱ + ۳ + … + ۱۹ = ۹۰ (aA2) ; ۳۲ × ۱۵۷ = ۵۰۴۰ (pwA1) ; ۴۵ − ۲۸ = ۱۸ (oA1) | 100 ; 5024 ; 17 | ✗ ✗ ✗ | right |
| ۱۵٪ِ ۷۰۰ = ۱۰۰ ; ۷۰۰ × ۰٫۸۵ = ۵۹۵ (pA2) | 105 ; 595 | ✗ ✓ | right |
| (brother) ۴۲۵٫۶ × ۳۲ = ۱۴ میلیون (s09) | 13,619,200 | ؟ | right |
| look-alikes: ۲:۳۰، ۱۰:۱۵، ۱۴۰۵/۹/۱۲، ۱۸ از ۲۰، mod، 2x+3=11، 1010 (binary)، 10! | — | silent | right |
| small talk ۲ × ۳ = ۶ تا قهوه / تخم‌مرغ ; ۲ + ۲ = ۴ تا مشتری | 6 ; 4 | ✓, not prior work; but filed in 📜 under the problem (A29-13) | S3 |

## 9. 🎯 table
| Forecast | Confidence | 🎯? | Outcome | Settled where |
|---|---|---|---|---|
| s05 مدیرم تا جمعه تأیید | ۷۰ | ✓ | «امروز تأیید کرد» | شد (chat + 📜) |
| s05 رضا تا جمعه ثبت‌نام | ۴۰ | ✓ | «اون یکی درست درنیومد» | نشد |
| s05 گزارش | ۷۰ ⇒ ۸۰ | ✓ updated with history | — | open |
| s05 «فکر کنم ۷۰» مدیر انتخابم کنه | ۷۰ | ✓ | — | open |
| s05 «تقریباً مطمئنم» / «مطمئنم» سارا | asked ⇒ «۶۰» | ✓ | — | open |
| s05 ۴ قفسه | ۷۰ | ✓ + duplicate ✗ | «شد ۳ تا» | «کدام؟» ✗ |
| s05 امتحان بالای ۱۷ | ۹۰ | ✓ (due wrong) | «۱۸ شدم» | شد ✓ |
| s05 بارون سه‌شنبه | ۴۰ | ✓ due 10 Azar, no 📌 | — | open |
| s05 حدودِ ۲۰ نفر | ۷۰ | ✓ | «۲۳ نفر» | asks «حدودِ ۲۰؟» ✓ |
| s01 سالِ دوم ۳۷٪ | ۸۰ | ✓ | — | open |
| s01 (calc «۲۲٪ افزایش») | false | ✗ should not exist | — | Today asks «شد یا نشد؟» |
| pA3 (calc «ده درصد درز») | false | ✗ should not exist | unrelated line | asks «حدودِ ۸؟» |
| oA1 گزارشِ مالی باثبات | ۷۰ | ✓ | «پیش‌بینیم غلط بود» | نشد (moved and restored) |

## 10. Date-ask table
| Ask | Her answer | Booked |
|---|---|---|
| s01 «تا جمعه امضاش» ۱۳ آذر | «باشه، جمعه پیگیری کن» | 📌 ۱۳ آذر ✓ |
| s01 bank «پنجشنبه نه، شنبه» ۱۴ آذر | «فقط بانک شنبه‌ست» | agency 12 Azar ✓; bank re-asked as Thursday ✗ |
| s01 ✏️ ⇒ «دیروز» | — | «۱۰ آذر گذشته — کدام روز؟», 15 Azar kept ✓ |
| s01 سرِ برج / اولِ ماه | next message, no yes | not booked ✓ |
| s01 بعد از عید / وسطِ ماه / آخرِ سالِ تحصیلی / ماهِ دیگه | «آره» | «کدام روز؟», nothing booked ✓ |
| s01 «وسطِ ماه یعنی حدودِ ۱۵ دی» | — | a new row with «درست است؟» ✗ |
| s01 بیمه ۱۲ آذر | «آره درسته» | 📌 ✓ |
| s01 «زنگ زدم» (two calls) | «به بنگاه» | «کدام؟» ✓; answer not shown ✗ |
| s03 «پنجشنبه برهان…» ۳۰ مهر | (unrelated «امروز خسته‌ام») | re-asked as 28 Mehr (today) ✗ |
| s05 بارون / سمینار | «آره درسته» | 🎯 dues ✓ |
| s07 «۳۰ آبانه» (on 3 Dey) | — | 30 Aban 1406 offered ✗ |
| s10 «تا جمعه» on a Friday | «جمعهٔ بعد.» | 📌 ۱۵ آبان ✓ |
| aA3 «فردا صبح زنگ می‌زنم» | «بله، لطفاً فردا یادم بیندازید» | 📌 ✓; closed by «زنگ زدم» ✓ |

## 11. Chat ⇄ page
- **Agree:**
  - corrections in s04 p14, p19 and p23, s07, pwA2;
  - m2 in s02;
  - 🎯 settles in s05;
  - the territory loop in tA1;
  - prior-work merges in pwA1;
  - moves in oA1.
- **Disagree:**
  - s06, s08, pwA2: the coach flags the wrong clause, while 📜 shows ✓ (A29-1);
  - s01 and pA3: the page asks about a 🎯 the coach never heard of;
  - s04 p21–22: the coach says the correction was sent, and the page refused it;
  - s09: the coach treats the brother's numbers as his, while 📜 also files them as hers;
  - oA1: the assistant cannot explain the new rules (A29-29).

## 12. Owner bank (A: 1–10, 42–44, 54–56, 64–65)
| # | Verdict | Evidence |
|---|---|---|
| 1 | partial | corrections s04 p14/p19/p23 ✓; A29-14, A29-15 ✗ |
| 2 | exists | 📜 / 📚 in every scenario; misfiling A27-22, A29-19 |
| 3 | exists | mind card «از کجا؟» (s06 mind29_after) |
| 4 | missing | sheet #101 (tA1 replay) |
| 5 | exists | aA2 1-3-7, s05/s07 calibration |
| 6 | exists | ages 8, 9, 13, 67, 81; a grandchild's birthday did not change hers (aA4 p11) |
| 7 | exists | pA1–pA3, pA2, aA1 |
| 8 | exists / partial | 🧭 ✓; s10 stale destination (A23-8) |
| 9 | exists | tA1, all arms |
| 10 | partial | «خودِ سامانه» map exists but lacks the round-28 rules (A29-29) |
| 42 | partial | move exists with history and undo (oA1 T13 ✓); dependants are not asked (A29-28) |
| 43 | exists | «از کجا؟» |
| 44 | exists / partial | «کدام پیش‌بینی؟» lists candidates (s05 p30); a duplicate 🎯 confuses it (A29-16) |
| 54 | exists | a yes that books names the item (s01 c160; s01 p39 «✓ … 📌 «فردا به بیمه…»») |
| 55 | exists | 🎯 book «باز (۸) / داوری‌شده (۷)» (s05) |
| 56 | exists | tA1 «اولی/دومی/یکی‌اند» |
| 64 | partial | the page refuses a proposal built on a stale base and names it (s04 p23 ✓), but its own proposal after «۱۲ میلیارد» is built on a stale value (A29-15); the assistant could not explain (oA1 p38) |
| 65 | partial | «فروشنده گفت ۱۲٪، پس …» stays hers ✓ (s09); no source label (A29-22); the assistant had no rule to cite (oA1 p38) |

## 13. Routing
377 judged turns: `lla_coach` 351, `lla_assistant` 21 (✏️, «ثبتش کن», automatic «[سامانه: …]»), `learning_architecture` 5 (sheet routines). All are correct. There is a `route_table.md` in each scenario.

## 14. PARTS — «نسبت به دورِ ۲۸» (`round29A/PARTS.md`)
- **Much better:**
  - the arithmetic reader (sqrt, scale words, m2, remainder after a sum);
  - 🎯 (8 A28 ids fixed);
  - the move control (0 ⇒ 72 buttons, with undo);
  - dates (A28-2/3/4 fixed);
  - prior work («… بود دیگه؟»);
  - C68 acceptance in chat and in the ledger;
  - the territory tie.
- **New regressions:**
  - 📜 `ownCalc28` (S1 A29-1 and duplicates);
  - a data percentage read as a confidence (A29-4);
  - the correction chain (A29-14);
  - a third report needs the model's prior (note).
- **Same:**
  - prerequisites;
  - the mind card (A26-19, A26-25);
  - practice;
  - 🧭.

## 15. Unit-only claims of the round-28 fixers
| Claim | Scenario · turn | Result |
|---|---|---|
| C105 «… تومن» fixes units | s02 p20 | failed (نسنجیده) |
| C106 ordinal / scale m2 answer | s02 p21 («اولی») | held |
| C108 remainder judged with given operands | s08 p11, pwA2 p12 | failed («کم/اضافه میاد» silent); held after a division (s10, aA1) |
| «A و N دهم» | — | not reachable (no shape in A) |
| C9 narrower «≈» | s02 p11 (interval 0.065–0.075), aA4 (۲٫۵۷ × ۱٫۹۵ = ۵) | held |
| C89 with two corrections | s04 p24 | failed (A29-15) |
| C28-14 (pwC1) | — | not reachable (group C) |
| D28-14 «۱۸ ⇒ ۲۰» | — | not reachable (group D; expected wrong) |
| C117 «زنگ زدم» with two call plans | s01 p40 | held (ask); her answer had no visible effect (A29-6) |
| C118–C122 forecast | s05 p20–p35 | held (C119, C120, C122 explicitly) |
| C123 statement line «↪» | oA1 | held |
| C124 step with dependants asks | oA1 | failed (A29-28) |
| 🎯 / ledger moves | oA1 | held (🎯 outcome hidden, A29-27) |
| A28-13 at page level | s03 | held |
| A28-36 (surface) | oA1 | not verified (my mistake) |
| C27-6 (group C half) | — | not reachable in A |

### Fixers' «Not done» items, as tested
- **arith «M تا کم میاد»:** confirmed not done (s08, pwA2).
- **📜 mark after an m2 answer:** confirmed (s02 A29-11).
- **story: the OTHER regex misses «یه حسابِ دیگه هم کرد»:** confirmed in the coach line (s09, aA1).
- **forecast C121** (no-problem forecasts filed under the focused problem): not reached.
- **prior #226, #229, #235:** not reached.
- **dates «وسطِ ماه کارگر میاد»:** not reached.

## 15b. Arms required by RUNNER27/28 but not run in A this round
- Wrong arithmetic in tA1: NOT RUN (the harness had already been closed). It is covered by 15 other A scenarios.
- #233 multi-day ✏️ backfill: NOT RUN (no shape in A).
- #236, s28 p4: NOT RUN (group C shapes).

## 16. New owner-like questions
- When the page puts ✓ next to my whole sentence, how do I know which part it actually checked?
- I never made a forecast — why does «امروز» ask me «شد یا نشد؟»?
- I said «یعنی …» to repeat my forecast — did that count it twice in my calibration?
- If I move a step, what happens to the steps that rested on it?
- Can the assistant tell me the rule behind what the page just did, with the place it is written?

## 17. Time and use
- **Wall clock:** about 07:28 to 10:58 UTC (about 3 h 30 min), in one context.
- **Prompts:** 377 answered. Most were replayed; about 45 were fresh.
- **E-mails:** 21 sent.
- **Tokens:** not visible to me.
