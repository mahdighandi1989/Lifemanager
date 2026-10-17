# Tour 1 (Pólya), round 17: live fixer handoff (2026-10-17)

Scope: RC2 a–e from `DECISIONS_R17.md` (the «کدام پرسش کمک کرد؟» source and option builder, `a38_live.js`). DECISIONS_R2–R16 still
bind where R17 does not replace them. Base 14988f56 (fast-forwarded to `claude/life-program-flow-diagram-q37jvr`). Changed: only
`apps/learning-architecture/src/app/a38_live.js`, tests, the variant-bank copy, and the rebuilt bundle. a26/a27 were not touched (the
coach and math fixers own them). Not done here: WORKLOG/PROGRESS/HANDBOOK, AUDIT_LOG, experiences, merge.

## Commits
- 203937fc `test(lla)`: new `tests/test_tour1_r17_live.js` + `tests/variants/VARIANTS_R17.json` (a byte copy of
  `tour1_polya/VARIANTS_R17.json`, so the gate does not depend on the scratchpad; `LLA_VARIANTS=<path>` points at another copy).
  Red on 14988f56: 65 failures (49 bank entries, close 2, guess 5, label 7, meta 1, rep 1).
- (fix commit) `fix(lla)`: RC2 a–e, the rebuilt bundle, and the R16 expectations that R17 replaces.
- (this note)

## Test (`tests/test_tour1_r17_live.js`, sections `close,meta,guess,label,rep` + the bank)
Problems and sessions are written straight into the store in the shape the assistant writes them. Options are read from
`APP.liveChatQItems`, which is the source of `#lpBBest`/`#lpRBest`. Runner quotes are copied word for word from `round17X/<sid>`.
**Every RC2 entry of the variant bank (85 entries: meta 17, which_guess 17, bare_label 18, anaphora 17, repeat 16; pos and neg) passes.**

| Defect | Before | Now |
|---|---|---|
| RC2a B·D1 s14 | a chat-closed problem's list = the whole session (statement of another exercise, closure turn, «چرا n−1» after closure) | only the questions before the `chat_solved` reply; nothing after it, in that session or another |
| RC2b A·D5 s08, B·D2 s14/s18, D·1 s31/s38 | «کدام پرسش بیشتر کمکت کرد؟» and the taste question were options | never options (alone, after a label, glued after another question, or as a «:» head) |
| RC2c A·D2 s09 | «(حدسِ تو: «حدود ۵۰۰ هزار تومن»)» on a question about «۸۰۰ هزار» | «(حدسِ تو: «۸۰۰ هزار»)» |
| RC2c A·D2 s01 | the recorded «اجارهٔ بلندمدت…» on a question that quotes «همهٔ ۴۷ ستون…» | no note (the option carries its own quote) |
| RC2c B·D1 s11d | «پیش از اثبات: … (حدسِ تو: «پوشش هست؛ فقط کدم کند است»)» | «چطور می‌آزمایی‌اش؟ … (حدسِ تو: «اصلاً نمی‌شود»)» |
| RC2c C·V1 s21 / s28 | the later queen-check guess / «۱/۲» on a question about ۱/۳ | «رخ بی‌فایده است» / no note |
| RC2d D·7, C·V3 | «و یک پرسشِ آخر، کوتاه:»، «یک قدم دقیق‌تر:»، «میانهٔ راه:»، «فقط یک چیز:»، «پیش از تحویل یک وارسیِ کوتاه:»، «…، پس پرسشِ دیگری از همین فهرست:» kept | dropped (with the meta clause before «، پس») |
| RC2d D·8 s36 | «پیش از آن: نتیجه را وارسی کن — …؟» (dangling) | «نتیجه را وارسی کن — …؟» |
| RC2e A·D3 s01 | chat:4 and chat:5 («…، همان پرسش: …») were two options | one option, the latest wording, without the frame |

Controls (from the bank's negative entries and R16): heads with a finite verb or an infinitive stay («حالا که گیر کرده‌ای:»، «قیاس را به کار
بردی:»، «از آخر شروع کن:»، «پیش از رها کردنِ کلِ راه:»، «پس همین را بگو:»); «۱۰:۳۰» and «۳:۴» are not heads; «قبل از اینکه…»، «پیش از
آنکه…»، «بعد از ضربِ…»، «بعد از ظهر»، «آنچه»، «آنتروپی» are unchanged; «کدام فرض به کار آمد؟»، «کدام پرسشِ پولیا این‌جا به کار می‌آید؟»،
«دوست داری از n=1 شروع کنی؟» remain options; different objects, values, n, opposite predicates, and different guesses never merge; lists
never cross problems.

## What changed (a38_live.js)
- **RC2a** `chatClose(s0)` / `closeCut(se, CL)`. Only problems whose look-back came from chat (`solve.b[1].from === "chat"`, `live.chat.sess`).
  The closure moment is `live.stateAt`, the first «حل شد». In the closing session the window ends before the last AI message at or before
  that moment that carries `chat_solved` (or `chat_invent`), falling back to the last AI message at or before it. In other sessions,
  messages after that moment are cut. Applied in `chatItems` together with `msgWin`.
- **RC2b** `lbMetaQ(t)` (also `A.liveLbMetaQ`). A best-question is a question *about questions* (پرسش/سؤال), with an interrogative and a
  past-tense "helped" predicate («کمک کرد»، «به کارت آمد»، «به دردت خورد»، «راه را باز کرد»، «مفیدتر بود»). Present tense («به کار
  می‌آید») is a coaching question. A taste question has لذت/سلیقه, or a liking predicate («دوست داشتی/داری»، «خوشت میاد»، «چطور بود»)
  about a *kind* (نوع/جور/مدل/دسته/شاخه/سبک). It also matches the strings a27 exports, if it exports them; a27 itself is not read or
  copied. Recognised names: `ASSIST.LB_META_QS`, `ASSIST.lbMetaQs()`, `ASSIST.LB_BEST_Q`, `ASSIST.LB_TASTE_Q`, matched with `qMatch ≥ 1`.
  It is tested on the question and on head + question. A meta sentence is dropped from its run, so a glued sheet line still survives.
- **RC2c** `guessFor(P, m, s0)`, `guessQuote`, `quotesIn`, `semiSplit`. The note comes only from a guess **quoted in the same message**:
  - A guess sentence is one with a «…» or "…" quote and an attribution: حدس…, گفتی, نوشتی, می‌گویی, ادعا.
  - Which quote: the one right after «حدس…»; otherwise the last one before the attribution; otherwise the last one after it. With no quote,
    a «حدس» sentence's number is used.
  - Searched only in the nearest earlier sentences. For a clitic or demonstrative trigger, the nearest quoted sentence must be a guess
    sentence. An option that has its own quote gets no note.
  - A statement clause before «؛» that quotes a guess becomes its own sentence, so «X را حدس زدی؛ این حدس را …؟» gives
    «این حدس را …؟ (حدسِ تو: «X»)».
  - The recorded guess is never the default. The only exception is the model's report in that turn. **Contract for the coach fixer:** an
    AI message may carry `m.guess = {text}` or `{g: n}` (n indexes `solve.g`). Set it from a validated `coach_state.guess` in that turn's
    DO handler on `s.msgs[s.msgs.length-1]`; the message is pushed before the DOs run. Nothing writes it yet. It is read only.
  - Items with different guess notes never merge.
  - `refNote`'s guess branch is quarantined: it now receives an empty guess. The unknown branch is unchanged.
- **RC2d** `bareLabel` is now structural. A head is a label when its last «،/؛» segment has no verb. A verb is detected by morphology plus
  closed grammatical classes:
  - morphology: the می/نمی‌ prefix, past stem + ending, ـه‌ای/ـه‌ام, infinitive;
  - closed classes: copulas, light verbs and common imperatives, and «… را بـ…» at the end of the clause.

  A say-frame with no object («حالا بگو:») is also a label. The R16 lexicon version is kept as `bareLabelLex` (unused, quarantined).
  `cleanHead` also strips:
  - a compound-preposition + demonstrative lead («پیش از آن،»، «به جای آن،»، «علاوه بر این،»، «در کنارِ این،»، «از این گذشته،»; `ANA_LEAD`);
  - «بگو …» before an embedded question of three or more words (`SAY_LEAD`).
- **RC2e** `repFrame`, `objCw`, `cwOv`, and a `cwSet` refinement.
  - A head or pre-dash clause that declares a repeat is a frame. Examples: «همان پرسش(ِ قبلی):»، «باز هم همون سؤال:»، «سؤالم را تکرار
    کنم —»، «خب، دوباره:»، «یک بار دیگر می‌پرسم»، «سؤالم هنوز سر جاشه»، «همان پرسش با بیانی دیگر:».
  - Not frames: «همان پرسش از زاویهٔ دیگر» (R16 control) and «پرسشم را عوض می‌کنم».
  - A frame is dropped. Its option merges with the earlier option of greatest content overlap, or with the latest earlier option if none
    overlaps.
  - The subset dedupe now needs **both** the full content words (`cwSet`, unchanged from R16) and the question's **object**
    (`objCw`) to be in a subset relation. `objCw` drops a leading imperative set-up clause before «—» and a «حالا که …،» preface. Frame
    merges measure overlap on the object. Using the object alone over-merged: R15 «فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟»
    reduces to {بخش}.
  - `cwSet` treats the clause-final word as the verb slot only when nothing but person endings or «یا نه» follows it. So a predicate
    before «است» counts as content (اضافه ≠ لازم), and a number never counts as a verb.

## R16 expectations replaced (in `tests/test_tour1_r16_live.js`, each marked «دورِ ۱۷»)
- ref s23: the note is «۱٫۷۵», the number the message called a guess. It was the recorded «زمان ۱٫۷۵ برابر می‌شود», which was entered
  after the message.
- ref s21: «رخ بی‌فایده است», quoted in the message. It was the later recorded «رخِ a1 بی‌فایده است».
- runs control: «چطور می‌آزمایی‌اش؟ …» now has «(حدسِ تو: «۴ جزء بهترین است»)», quoted in the same message.
- rep: the taste questions are no longer options (RC2b), so the count is 6, down from 7.

Older tests with heads that are now verbless labels under RC2d. In each case the option keeps the assistant's own words, without the head.
Each change is marked «R17»/«دورِ ۱۷».
- `test_tour1_r10_live.js` dedupe control: «پیش از وسیله، خودِ هدف — کوتاه‌تر:».
- `test_tour1_r11_live.js` qword: «پیش از جزئیات:».
- `test_tour1_r11_live.js` paren: «پیش از گامِ بعد، همان پرسش:». This is exactly A·D3's frame, and the referent clause stays in the
  question.
- `test_tour1_r14.js` own: «پیش از کد، یک قدم عقب:».

## Judgement calls
1. **Bank vs D·8:** the runner suggested pulling the referent sentence into «پیش از آن: …». The bank (RC2.anaphora pos) wants the
   dangling lead dropped instead, and the bank binds. Compound-preposition + demonstrative is treated as a discourse sequencer and
   dropped. Simple «از آن،»/«به آن» keep the R14/R15 pull, because those are argument slots of the verb.
2. **«؛» split** happens only when the clause before «؛» quotes a guess. Otherwise «؛» stays inside the option, which keeps the R15
   asymmetric-error default: «بودجه‌ات رو نوشتی؛ کدوم ردیفش …؟» stays whole, with its referent.
3. **Bank `which_guess` «… coach_state.guess -> g2»** and **repeat «after guess «۶»/«۸»»** are exercised through the `m.guess`
   contract above. The coach fixer has to write it for this to work live.
4. The verb recogniser leans to "verb", so the failure mode is keeping a head. This is the R5/F1 asymmetric error: a slightly long option
   is harmless, a dropped meaningful head is not. The closed lists are grammatical classes, not semantic keywords.
5. The closure moment is `live.stateAt`, the first «حل شد», not `live.chat.at`. A later `chat_solved` that only fills bestQ or taste does
   not move the end.

## Verification
- `node tests/test_tour1_r17_live.js`: NO ERRORS (all 85 RC2 bank entries plus the runner quotes). On the 14988f56 build: 65 errors.
- `node tests/test_tour1_r16_live.js`: NO ERRORS (with the replaced expectations above).
- `python -m pytest tests/test_learning_architecture_graph_browser.py -q`: 96 passed (LLA_BROWSER_JOBS=6, 378.9 s). `build.py --check`: in sync.
