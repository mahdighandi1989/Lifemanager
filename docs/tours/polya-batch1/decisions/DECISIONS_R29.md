# DECISIONS — Pólya tour, batch 1, round 29 (page main e0e26045)

Sources: `reports/round29{A,B,C,D}_handback.md`, `T/round29X/defects.md` and `PARTS.md`, the per-scenario findings they cite.
Everything in DECISIONS_R25…R28 (C1–C135) still binds; this file adds R1–R7 and C136–C153.

## Results
| Group | Runs | PASS (strict) | S1 | S2 (new ids) | E-mails |
|---|---|---|---|---|---|
| A | 21 | 1 | 1 family, 3 cases (A29-1: s06, s08, pwA2) | 14 | 21/21 |
| B | 32 | 11 | 1 (B29·D11) | 13 (12 repeat families + B27·D16) | 32/32 |
| C | 21 | 2 (+11 PARTIAL) | 3 (C29-1, C29-2, C29-3) | 13 | 21/21 |
| D | 34 | 3 | 2 (D29-1, D29-2 — caused by my ruling C105, revoked by C135) | 11 | 35 |
| **Total** | **108** | **17/108** (round 28: 17/106) | **9 cases in 5 families** | **≈51** | |

Routing was right on every turn of every group (A 377, C 386, D 393 turns; B: no mis-route). In every run the person reached a verified
result or the exact sticking point. All four round-28 S1 are FIXED (A28-5, A28-40, B28·D1, C28-13). Round-28 defects fixed: A 29 of 40,
B 25, C 14, D ≈25.

## Progress metrics (roadmap §22)
| Round | Runs | PASS | S1 cases (families) | S2 per run | New S2/S1 families | Repeat families | From merges / my rulings | «Not built» carried |
|---|---|---|---|---|---|---|---|---|
| 26 | 96 | 4 | ≈11 after re-rating (2) | — | — | — | 3 (WORKLOG 137) | — |
| 27 | 101 | 19 | 3 (1) | ≈0.45 | — | — | 2 (WORKLOG 145) | 📜 half of R6 |
| 28 | 106 | 17 | 4 (3) | ≈0.55 | 4 | 10 | 2 | 9 |
| **29** | **108** | **17** | **9 (5)** | **≈0.47** | **5** (F15–F19) | **10** (F1 F2 F4 F6 F8 F9 F10 F11 F13 F14) | **6**: D29-1/D29-2 (my C105), the data-percent 🎯 family (my C118, below), D29-25, D29-26, C29-8, B29·D25 | 8 (list below) |

**Reading (two rounds without improvement ⇒ root cause written, as §22 requires).** PASS is flat (17), S2 per run fell a little
(0.55 ⇒ 0.47), but S1 rose (4 ⇒ 9 cases) and the repeat-family count is 10 for the second round in a row. The causes, from the evidence:

1. **Two of my own rulings over-reached** and the fixers built them faithfully: C105 («تومن» fixes M to units) made both D S1; C118 («a
   bare N درصد in the same clause as a future outcome is its confidence») made every data percentage near a future verb a 🎯 — A29-4
   («با ۲۲٪ افزایش میشه»), B29·D6 («با ۲۰٪ اصطکاک»), C29-9 («با راندمانِ ۵۵٪»), D29-3 («با ۱۰ درصد پرت», «۲۰ لیتر یعنی ۲ لیتر نمک»).
   Both were written to answer a bank writer's ambiguity with a positive example only; neither was checked against a look-alike from
   the runners' real sentences. **Process fix C136.**
2. **«Proven (a+b+c)» was proven in one group's replay only.** The families recur in the other groups' shapes: C124 (move with
   dependants) failed at page level in all four groups; C89 (proposals with two corrections) failed in A, B, C, D; C108 / C85
   (remainder clauses) failed after a subtraction (C S1) and in A, B, D. **Process fix C137.**
3. **A sentence-wide mark** (story `ST.ownCalc28`) turned «the engine read nothing wrong» into «✓ درست» for the whole sentence, so a
   wrong clause the engine never read got a ✓ (S1 A29-1). Same mechanism, other side: the prior ledger re-judges a step with a second,
   scale-blind reader (B29·D11) and contradicts the engine's ✓ on the same sentence. **One judge per line: C138, C139.**

The pass bar is unchanged. Nothing above lowers it.

### The S1/S2 families of round 29
| # | Family | Groups | New / repeat | Owner |
|---|---|---|---|---|
| F1 | «N میلیون و M»: S1 D29-1/D29-2 (C105), S1 C29-3 (six compound terms); unread lines with item names (B29·D9, D29-8); a ✗ value without scale (A29-9/10/11, C29-19/20) | A B C D | repeat | arith |
| F2 | remainder clauses «M تا می‌مونه / کم میاد / اضافه میاد»: S1 C29-1 (after a subtraction, read as «۱۵ − ۳»); B29·D10, D29-9, A29-18 unread or «گرد شده؟» | A B C D | repeat (C85, C108) | arith |
| F4 | 🎯: a data percentage made a 🎯 (A29-4, B29·D6, C29-9, D29-3 ×2 — C118); one clause with two forecasts made one 🎯 (B29·D17); a weekday in a forecast still gets a plan 📅 ask and the 🎯 stays «بی موعد» (B29·D8, C29-7 — C132 failed at page); duplicate 🎯 (C29-8 regression, A29-16 «یعنی:»); an outcome settles a non-forecast (B29·D4); plain «مطمئنم» (B29·D23, C119); filed under the wrong problem (B29·D7, C28-19, C121); a stray «حدودِ ۸» ask (A29-24) | A B C D | repeat | forecast |
| F6 | dates: «زنگ زدم» with two calls closes one, no «کدام؟» (B29·D19, D29-18; C held); one ✏️ closes another act's deadline (B29·D21); «آره، فردا و پس‌فردا» books one (B29·D18); her answer to the ✏️ past-day ask unread (B29·D20); restating the asked day no longer books (D29-25, regression); a day answers another act (C29-6); «امروز خسته‌ام» re-dates a plan (A29-12); a past day not asked (A29-17); stray deferred request (B29·D22) | A B C D | repeat | dates |
| F8 | corrections and proposals: two corrections in a row — proposals by ratio or on the stale value (B29·D13, C29-14, C29-11, A29-15, D29-10/11); a second correction of the same datum refused (A29-14); «X نمیشه، Y میشه» not read (C29-13); a range garbled (C29-15); which «5» (C29-10); the wrong occurrence (B29·D14); a datum change does not re-mark the ledger (C29-12); «پس جوابم غلط بود» rewrites a rejected result (D29-23); «عرض ۵ نیست، ۴» no longer changes the statement (D29-26, regression); «۲۷٫۵ ⇒ ۵٫۵» rewrites a step label (D29-5) | A B C D | repeat (C87–C89) | correction |
| F9 | attribution: «X یه حسابِ دیگه هم کرد: …» unattributed (B29·D12, C28-8, A29-21, D29-12); «X گفت … پس … = N» filed as other work (C29-4, B); «فروشنده گفت ۱۲٪» without a source label (A29-22) | A B C D | repeat (C96, C125) | story |
| F10 | moving a ledger step with dependants asks nothing (B29·D16, C29-16, A29-28; C124 failed at page in every group) | A B C | repeat | story |
| F11 | a separate problem not registered / lines under the wrong problem (B27·D7, B28·D9, C29-5, A29-19, C25-7′ s28 p4, A27-22) | A B C | repeat (C97) | story + prior |
| F13 | a question about the system becomes a problem («مسئلهٔ ۲ از ۲», A29-26; B27·D14; D28-10 shape «این سامانه اصلاً … ساخته شده؟»; C27-6) | A B C D | repeat (C99) | surface |
| F14 | internal labels in her view: «(C57)» (B29·D1, A29-23), raw ids «(it1_o4sv)» (B29·D1) | A B | repeat (C100) | surface |
| **F15** | **a sentence-wide ✓ in 📜 over a clause the page did not read, and that clause is wrong (S1 A29-1 ×3: «نصفش هم میشه ۱ میلیون و ۳۰۰», «پس ۸ لیتر اضافه میاد», an 8-year-old's «۳ تا کم میاد»)** | A | new (story `ownCalc28`) | story (with arith) |
| **F16** | **«درصد» as the unit of a result: «۲ و ۵ دهم × ۴ = ۱۰ درصد» ✗ «۱۰۰۰٪» (S1 C29-2)** | C | new | arith |
| **F17** | **the prior ledger contradicts the page's own engine: her correct fix «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰» → «گامِ ۴ متنِ تازه هنوز نمی‌خواند» ×4 beside the engine's ✓ (S1 B29·D11); a fabricated «متنِ تازه‌ات» for step 1 and four «هنوز نمی‌خواند» lines (D29-7); an unchanged step's reason cut at «و» + «دلیلِ پیشینی … کنار رفت» (B29·D25)** | B D | new | prior |
| **F18** | **one message makes several duplicate 📜 lines («داده» ×4, «حسابِ تو» ×2: A29-2 in s02, s06, s09, pA2); forecast sentences filed as «داده» with no 🎯 line (B29·D2)** | A B | new | story |
| **F19** | **the «خودِ سامانه» map in the prompt does not carry the round-28 rules (C87, C96, C124), so the assistant cannot answer bank 42/64/65 with evidence (A29-29)** | A | new | surface |
| loop | a frame-word reply rejected instead of asked (B27·D16, identical r27–r29) | B | carried | surface |

### «Not built» carried into round 30
More than 5 compound amounts (now S1 C29-3 — must be built); «a√b» judged (C107 allows نسنجیده — stays allowed); «M تا کم میاد»
judged against the problem's quantities (C139 below); the `m2` answer (not reachable: no group ever saw the ask — C102 made it rare;
stays, not a defect); C121 filing; C27-6 C half; D28-14 «۱۸ ⇒ ۲۰» proposal family (inside F8); D27-29 practice ladder.

## Root mechanisms for the round-29 fixers
- **R1 arith (S1 first: C29-1, C29-2, C29-3; then D29-1/D29-2 by removing C105):** quarantine the C105 branch (C135); any number of
  compound amounts in one line (C29-3: six terms = 8 میلیون); «درصد» as a unit (C140); remainder clauses after any operation (C141); a
  ✗ value always in her scale; item names between amounts («کابینتِ پایین ۴ میلیون و ۲۰۰ + بالا ۱ میلیون و ۵۰۰ = …», D29-8, B29·D9).
  Export a per-clause verdict list for story (C138).
- **R2 correction:** C89 again with a single proposal function over recorded dependency using the current value of every datum — the
  ratio path is quarantined, not kept as a fallback (B29·D13, C29-14, C29-11, A29-15, D29-10/11); C142 (correction shapes), C143 (which
  number), C88 ranges; regressions D29-26 and D29-23; a datum change re-marks dependent ledger steps (C29-12).
- **R3 prior:** F17 — C139 (one judge); D29-7 (a step is never given a text she did not write); B29·D25 (an unchanged step keeps its
  reason intact); s28 p4 / C25-7′ (prior-work block at a second problem's opening).
- **R4 dates:** C117 at page level in B and D shapes (C held, so compare the paths); C144–C147; regression D29-25 (C49).
- **R5 forecast:** C136 narrows C118 (C148); C132 at page level — the forecast reader runs BEFORE the date reader, so a weekday in a
  forecast becomes the 🎯's due date and never a 📅 plan ask (B29·D8, C29-7); one clause with two «N درصد» makes two 🎯 (B29·D17, C90);
  no duplicate 🎯 from a restatement (A29-16, «یعنی:») or a replay (C29-8 regression); an outcome settles only a 🎯 (B29·D4); C119 in B's
  shape; C121 (B29·D7, C28-19); no «حدودِ N» ask from an unrelated line (A29-24).
- **R6 story:** F15 (C138, with arith's per-clause export), F18 (C149), F9 (C125 again: «یه حسابِ دیگه هم کرد:» and «X گفت … پس»), F10
  (C124 at page level in every group), F11 with prior (C29-5, A29-19, B27·D7, B28·D9).
- **R7 surface:** F13 (A29-26, D28-10 shape, B27·D14), F14 (C100: «(C57)» and raw ids), F19 (C150), B27·D16 loop.

## Clarifications (binding; continue C135)
- **C136 (process — rulings).** Every new clarification the coordinator writes carries at least one NEGATIVE look-alike taken from the
  runners' real sentences, and is checked against all four groups' transcripts (grep of `round*X/*/ai/` and findings) before it is
  issued. A ruling that would change the verdict on a sentence a runner already judged correct is not issued without naming that
  sentence. (C105 and C118 failed this; both are corrected here.)
- **C137 (process — proof).** C101 (c) is extended: the page-level replay is run in EVERY group that showed the family (the families
  table names them; all four groups' tools, ctl and ai/ replies are in T), not one. An item proven in one group only is reported
  «proven in X only» and counts as not done for the others.
- **C138 (one mark per clause).** A ✓/✗/؟ in 📜 covers only the clauses the engine read. A clause with a numeric claim that the engine
  did not read gets «؟ نسنجیده» beside that clause; the line is never ✓ «درست» as a whole while such a clause exists. (A29-1.)
- **C139 (one judge).** Every place that judges her arithmetic (📜 mark, prior ledger fix, correction, coach line) uses the same engine
  (`ST.arithChk` and its exports). A second reader may only add «نسنجیده», never contradict the engine. (B29·D11: `a45_story.js`
  `tryFix` ~797–803 re-checks `x.badC` with the scale-blind `calcs`/`numsOf`; «۱ میلیون و ۸۵۰» there is 1 and 850.)
- **C140 («درصد» as a unit).** «… = N درصد» where no operand is a percentage: ✓ if the computed value equals N (she labels the result
  in percent) or equals N/100 (a fraction written as a percent); ✗ only if neither, showing both. With a percent operand, the result is
  in percent units. Never scale twice. (C29-2.) Look-alikes checked per C136 (all must stay ✓): «۱۷۵ تقسیم بر ۱۲۵۰ = ۱۴٪» (0.14),
  «۳ / ۱۲۰۰ = ۰٫۲۵٪» (0.0025), «… ماهی ۲ و نیم درصده؛ ۴ ماه میشه ۲ و ۵ دهم × ۴ = ۱۰ درصد» (10, percent context); «۴ از ۲۶ میشه ۱۵٪»
  follows the existing rounding rule (C9). Negative: «۳ × ۴ = ۱۰ درصد» ✗ (neither 10 nor 0.1).
- **C141 (remainders, all operations).** C85/C108 hold after a subtraction, multiplication and a chain («۱۸ − ۱۵ = ۳، ۳ تا می‌مونه»:
  two statements, both right). «N تا کم میاد / اضافه میاد» is checked against the problem's own need/have numbers when both are in her
  text («۳۰ لازمه، ۲۵ داریم، ۶ تا کم میاد» ⇒ ✗ ۵), otherwise «نسنجیده» — never silent, never glued to the preceding equation.
- **C142 (correction shapes).** «X نمیشه، Y میشه», «یه اصلاحِ دیگه: …», «X نبود، Y بود» are corrections (C29-13). A second correction of
  the same datum replaces the first, with both in history (A29-14). «پس جوابم غلط بود» marks her result as hers-rejected; it never
  rewrites it (C74, D29-23).
- **C143 (which number).** When the corrected number X occurs as two different quantities («۵» panels price and «۵ میلی‌متر»), the
  correction binds to the quantity her sentence names; if her sentence names none, the page asks which (C88). A range «از a تا b» is
  replaced as one unit or the page asks (C29-15).
- **C144 (one ✏️, one act).** An edit of a message changes only the records born of the edited clause. Another act's deadline from the
  same message is never closed or moved by it (B29·D21).
- **C145 (several asks in one answer).** «آره، فردا و پس‌فردا» answering two open date asks books both in order; a single yes binds the
  newest (C49 stays). An answer to the ✏️ past-day ask («سه‌شنبه‌ی هفته‌ی بعد، ۱۰ آذر») books that day (B29·D20). Restating the asked
  day books it (C49; D29-25 is a regression).
- **C146 (a past act reported in ✏️ or chat).** A past-tense act with a past day («۲۰ آبان رفتم بانک») records that act as done on that
  day (C94); it is not a plan date and gets no «کدام روز؟». C93 applies only to a plan whose day lands in the past. (C's question.)
- **C147 (a day for whom).** A day answers only the act in its own clause. «پسفردا … بیمه» never books the pharmacy ask (C29-6). A
  mood or state sentence («امروز خسته‌ام») never moves a plan (A29-12). A past day said for a plan gets C93's question, never next year
  (A29-17).
- **C148 (C118 narrowed; decided by what the percent attaches to).** A percentage followed by the noun it modifies — «با N٪ X» /
  «با N درصد X» where X is a quantity word (افزایش، تخفیف، پرت، راندمان، اصطکاک، سود، مالیات، بهره، کارمزد …), «N درصدِ Y», «با راندمانِ N٪»,
  «یعنی N لیتر» — is a datum, never a confidence. A percentage that ends its phrase or is followed by اطمینان («با ۷۰ درصد»، «با ۷۰٪
  اطمینان»، «… با ۶۵٪») after a predicted value or a quoted claim IS its confidence, as are the belief words of C90 (مطمئن، احتمال،
  فکر کنم، شانس، می‌دم) and the answer to the page's «چند درصد؟». Positive look-alikes kept by this rule (checked in the round-28/29
  transcripts per C136): «گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا» (a report on an existing 🎯 — it settles that 🎯, makes no new one),
  «همون‌طور که با ۹۰ درصد گفته بودم», «… ۱۱ است» با ۷۰٪ اطمینان». Negative look-alikes (data, no 🎯): A29-4 «با ۲۲٪ افزایش میشه»,
  B29·D6 «با ۲۰٪ اصطکاک»، C29-9 «با راندمانِ ۵۵٪»، D29-3 «با ۱۰ درصد پرت»، «۲۰ لیتر یعنی ۲ لیتر نمک».
- **C149 (📜 one line per clause).** One clause yields one 📜 line; a sentence is never filed twice as «داده» and «حسابِ تو», nor four
  times as «داده» (A29-2). A forecast sentence is filed as 🎯, never as «داده» (B29·D2).
- **C150 (system map).** The «خودِ سامانه» block the assistant reads is built from the same registry as the rules the page enforces
  (page-built user-prompt block, NOT AS.SYS), so every rule a fixer adds appears there (A29-29). Test: bank 42/64/65 answered with the
  map's evidence.
- **C151 (raw ids).** Item ids («it1_…») and rule labels («C57») never reach her view or the coach's quoted lines (C100).
- **C152 (forecast before dates).** A sentence with a forecast confidence is read by the forecast reader first; a weekday or date in it
  becomes the 🎯's due date (C132), with the single confirm, and the date reader then skips that clause.
- **C153 (process — the fixer's own claims).** A fixer's «Not done» list goes into its hand-back AND into the next runner brief as a
  named arm; an item that recurs as «not done» in two rounds is assigned to its own fixer the third round.

## Owner bank (round-29 verdicts, summary)
A 1–10, 42–44, 54–56, 64–65: most exist; 42, 64, 65 partial (A29-29). B: 12, 46, 57, 58, 59 exist; 13, 15, 20, 45 missing (sheets
#102–#104); the rest partial. C: 22, 23, 25, 26, 27, 48, 49, 69 exist; 21, 28, 29 missing; the rest partial. D: 33, 34, 35, 41, 53, 62,
71 exist; 32 and 63 exist but with S1 D29-1; 37–40, 51, 72 partial; 36, 52, 70 missing. New owner-like questions 73–81 (D) and the
lists of A, B, C go to the bank as 82+.

## Fixer split (seven, one concern each; FIX28 isolation; C101 + C137 binding)
arith (R1) · correction (R2) · prior (R3) · dates (R4) · forecast (R5) · story (R6) · surface (R7). Merge order: arith ⇒ prior ⇒
correction ⇒ story ⇒ forecast ⇒ dates ⇒ surface (arith first: story and prior consume its per-clause export); the families' tests re-run
after each merge, the full gate once on the whole merge.

### Clarifications after the independent bank (C154–C175; answers to the bank writer's 22 ambiguities, same order; C136 applied)
- **C154 (1).** A bare amount beside «N میلیون و M» amounts is read in both scales like them (C84/C102, thousands first): «۵ میلیون و ۸۰۰
  − ۸۰۰ = ۵ میلیون» is ✓ under the thousands reading, with no question.
- **C155 (2).** Mixed readings (one amount in thousands, another in units) are not tried for ✓: a line right only under a mixed
  reading gets «؟» naming the readings and asks which she meant; it is never ✓ and never ✗.
- **C156 (3).** C141's need/have may come from the problem's recorded statement as well as her message. If the page holds both numbers,
  it judges; otherwise «نسنجیده». Never ✓ unread, never silent.
- **C157 (4).** «نصفش / دو برابرش / با N دیگه میشه» whose antecedent is the immediately preceding result in the same message are read
  by the engine; any other antecedent ⇒ «؟ نسنجیده» beside that clause (C138). Either way, never a sentence-wide ✓ (A29-1).
- **C158 (5).** «تومن» on a bare operand changes nothing (C135): the units reading is named only when it alone fits (C103).
- **C159 (6).** C140 never overrides the rounding rule: «۷ از ۴۵ میشه ۱۶٪» (15.56 %) asks the rounding question (C9/C44).
- **C160 (7).** Taking back a correction follows C5: the earlier value returns with history; proposals built on the withdrawn value are
  marked superseded.
- **C161 (8).** A repeating-decimal proposal shows the exact fraction and «≈» to two decimals («۸۱۲۰ ÷ ۳ = ۲۷۰۶ و ۲ سوم ≈ ۲۷۰۶٫۶۷»); never an
  invented whole number.
- **C162 (9).** A remainder clause computed from a corrected factor is a C89 dependant of it and gets an exact proposal.
- **C163 (10).** Inside an existing ledger, her fix with a confirmation tag («… میشه ۳ میلیون و ۲۵۰، درسته؟») is applied like a fix and
  the tag is answered with the verdict. C98 stays for a bare question that brings no new value and opens no prior work.
- **C164 (11).** A ledger step that quotes a corrected datum is marked stale with an exact C89 proposal; it is never rewritten with a
  text she did not write (D29-7).
- **C165 (12).** «آره، هر دو» books every open ask it answers, in order (C145).
- **C166 (13).** A past act with a past day and no open plan gets a 📜 line of her report and no plan row; nothing is invented.
- **C167 (14).** «بمونه برای فردا» when the call is already booked for tomorrow changes nothing and asks nothing; for any other booked
  day it moves the call to tomorrow with history (C49 restating = consent).
- **C168 (15) — C148 amended.** Checked in the transcripts (C136): «فکر کنم ۷۰ درصد مدیرم منو … انتخاب می‌کنه», «فکر کنم ۷۰ درصد که
  تمرین‌ها … تا جمعه …», «فکر کنم ۷۰ درصد نصب تا عصرِ شنبه تموم میشه» are all confidences. So **a belief word in the clause wins**:
  «فکر کنم ۷۰ درصد کارتن‌ها تا جمعه بسته میشن» is a 70 % 🎯. C148's datum reading applies when there is no belief word, or when the
  percent carries an explicit ezafe to a quantity («۷۰ درصدِ کارتن‌ها») or is followed by a quantity word of C148's list.
- **C169 (16).** A rate followed by a change verb («۲۵ درصد زیاد میشه», «۱۰ درصد گرون میشه», «۲۰ درصد رشد می‌کنیم») is a datum unless a
  belief word is in the clause (C168).
- **C170 (17).** A 🎯 needs a future, checkable outcome. A probability for a hypothesis about a present or past fact makes no 🎯 (it may
  be recorded as her estimate). «شاید ۴۰٪ یادم بمونه» about a future recall is a 🎯 (شاید + N٪ = belief).
- **C171 (18).** «تا آخرِ ⟨ماه⟩» as a forecast's due date is the last day of that month, with C132's single confirm.
- **C172 (19).** After «فقط همین» (C124), each dependant left behind shows a history line «پایه‌اش به ⟨مسئله⟩ رفت» and the undo restores
  all.
- **C173 (20).** The same clause restated later makes no new 📜 line; at most a history mark on the existing line.
- **C174 (21).** Rule numbers may appear in the model-facing «خودِ سامانه» block as evidence; they never reach her view or a quoted
  reply (C100/C151 post-check).
- **C175 (22).** «دفترِ پیش‌بینی کجاست؟» may open the 🎯 view or say where it is; a follow-up telling the model to fill fields and press
  «ثبت» is forbidden.

## C176 (after the fixers; dates «Not done» 2 / bank R29 #174)
On the 1st of a Jalali month «سرِ برج» is two days (today, or the 1st of next month — R28 #20, C50). «آره، هر دو» confirms both acts are
wanted; it does not choose a reading, so the page asks «کدام؟» for that act only. Bank #174's «1st of next month» expectation was a guess
and is withdrawn. Asking is correct; booking either day silently is S2.
