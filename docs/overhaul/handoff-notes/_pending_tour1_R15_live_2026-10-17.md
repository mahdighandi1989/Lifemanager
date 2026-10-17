# Tour 1 (Pólya), round 15: fixer handoff (2026-10-17)

Scope: O1–O4 from `DECISIONS_R15.md` (DECISIONS_R2–R14 still bind where R15 does not replace them). Base fac11d42 (fast-forwarded).
Files: `apps/learning-architecture/src/app/a38_live.js` (the «کدام پرسش کمک کرد؟» option builder `chatItems` and its helpers, `pageQs`,
the `#lpBBest` filter) and `apps/learning-architecture/tests/test_tour1_r11_coach.js` (O4). Not done here: docs (WORKLOG, PROGRESS,
HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Commits
- 4f3e91c9 `test(lla)`: new `tests/test_tour1_r15_live.js`, committed red on fac11d42.
- 048d6c32 `fix(lla)`: O1–O3, the rebuilt bundle, and the updated r5/r6/r10/r11/r13/r14 expectations.
- 3d7563a4 `test(lla)`: O4 diagnostics.

## Test
`apps/learning-architecture/tests/test_tour1_r15_live.js` has five sections: `split`, `e1s03`, `e1s01`, `t1` and `ctl` (`ONLY=split,t1`).
- Everything runs through the real UI: the assistant panel with a stub model, the «🔭» form, the understanding/plan/step cards, «✅ حل شد», `APP.liveChatQs`, `APP.liveChatQItems` and `#lpBBest`.
- The assistant messages are copied word for word from the round-15 runners' evidence.
- Red baseline: on fac11d42, `split`, `e1s03`, `e1s01` and `t1` fail. Every setup check passes there.
- On the fixed build it prints «NO ERRORS».

## Status of each defect
Every defect is **fixed**. Each one has a case in the test.

| Defect | Section | Old result | Option now |
|---|---|---|---|
| A·E1 s03 | `e1s03` | — | «فرض چیست؟ حکم (…) چیست؟» is one option, keyed to the tour's prove-list question. Each half is answered on the page (field u / field d), so `#lpBBest` drops it; the 📄 page questions remain. |
| A·E1 s01 | `e1s01` | split in two | One option. Both sentences match the practical page question u1, which she answered on the page, so `#lpBBest` keeps the 📄 page question and no lone half. |
| A·E2 s10 | `split` | «مستقیمش می‌کنی؟» | «استدلالت غیرمستقیم (خلف) بود — مستقیمش می‌کنی؟ … هر چیدمانی …؟» |
| A·E2 s08 | `split` | started «یک لحظه پیش از آن» | Starts «فرض کن تخم‌مرغ … پخته است — یک لحظه پیش از آن …؟» |
| A·E2 s03 | `split` + `e1s03` | «هر بخش چه می‌گوید؟» | «فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟», whole in `#lpBBest` too |
| A·E3 s02 | `split` | split in two | The dynamic stuck question is one option |
| B·D2 s11 | `split` | — | «… به کار بردی؟ مثلاً این‌که «کدام» … آمده؟» is one option |
| B·D3 s13 | `split` | missing | OPT_Q («… هر بخش را برآورده می‌کند؟», third person) is offered |
| D1 s34 | `split` | split in two | «چه آموختی؟ — دربارهٔ مسئله …؟» is one option |
| D2 s31 | `split` | split in two | «چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟» is one option |
| D3 s31 | `split` | — | «گامِ اولِ حلت را بنویس — آنجا …؟» |
| D3 s35 (a) | `split` | — | «محلهٔ ولیعصر … . از آن، …؟» (the anaphor rule brings in the previous sentence) |
| D3 s35 (b) | `split` | — | «مجهولت «پایداری، نه شروع» است — این گام … به آن …؟» |
| D3 s38 | `split` | — | «فرض کن حجم را داری — یک گام مانده …؟ مثلاً …؟» |
| D4 s30 | `split` | «کلِ قیدها را؟» dropped | Kept. The quoted think-aloud «از خودم می‌پرسم: …؟» is not an option. |
| D5 s37 | `split` | first question missing | «… تقسیم را انجام دادی؟ و همهٔ داده‌های دفتر …؟» is one option |
| C·T1 s21/s24/s28 | `t1` | two whole-first options | The short (before filing) and long (after filing) whole-first wordings share the Q_WHOLE key, so they become one chat item. lpOne answered it, so `#lpBBest` shows the 📄 «اول کل، بعد جزءها: …» exactly once. |

**Controls (`ctl`, plus `split`'s praise line):**
- Two problems keep their own questions.
- A page question answered on the page appears once, as the page option.
- The pre-creation question is offered in the assistant's own words (R14 N1/N2).
- «آفرین، ادامه بده.» is not an option.

## What changed (a38_live.js)

**O1, `qPassage`**
- **Sentence boundaries:**
  - A sentence ends at «؟ . ! :» followed by whitespace, or at a newline.
  - Text inside «…» never splits. If the quote marks are unbalanced, this protection is turned off.
  - «؛» is not a boundary: the clause before it stays with the question.
- **Questions and runs:**
  - A question is a sentence ending in «؟»/«?», with closing quotes or brackets allowed after it.
  - Each contiguous run of question sentences is kept from its start.
  - A run that starts with «—», a pronoun-use demonstrative (آن/این/همین/همان, alone or after از/به/در/با/برای/تا: «از آن،», «آن را»), a first word ending in «‌اش», or one of آنجا/همانجا/همین‌جا/اینجا/و/یا/مثلاً/اگر brings in the preceding non-question sentence.
  - Two runs in one message are joined with « … ».
- **What is stripped:**
  - Only a leading discourse word «ولی»/«اما», or خب/خوب/آفرین/عالی/باشه/درسته/احسنت followed by a comma, «!», «.» or a dash, plus list markers.
  - A head before «—» is never stripped.

**O2, keys and dedupe**
- **`knownQs`:**
  - The phase lists u/p/c/b.
  - The tour coach's lists for prove/obj/pract/life/any, through the exported `ASSIST.coachQs`.
  - The fixed turn questions (Q_GUESST … Q_WHOLE, resultQ).
- **`keyOf` / `qMatch`:** the highest-scoring match wins. Scores, highest first:
  1. Exact.
  2. Exact page sentence at the end of a preamble.
  3. Two-sided >½ token overlap, or a verbatim fragment.
  4. A clause («؛» / «به زبانِ خودت») match, which scores lowest. Because of this, the A191 paraphrase now keys to Q_WHOLE, not u5.
- **`chatItems`** returns `{t, k, ks, full}`. `k` stays the first key, for API compatibility. Items whose full key set is identical become one item with the latest wording.
- **`pageQs`** appends Q_WHOLE when lpOne is filled. It goes at the end, so saved `d.best` indexes do not move.
- **`pageFields`** lists the understanding-card fields:
  - It uses each field's labels across all `A.SOLVE_TYPES` (u/d/c/suff) and the page question in the same position.
  - Q_WHOLE is tied to lpOne.
- **`keyShown(K)`** decides whether key K is covered by a 📄 option in the same list. It is covered if:
  - K is itself on the list, or a two-sided match of a list question; or
  - every question sentence of K is either a verbatim sentence of a 📄 question, or matched by the label of a filled field whose 📄 question is on the list. A label matches when it is a two-sided match, or when it contains all of the sentence's 1–3 core words.
- **`#lpBBest` filter:** a 💬 option is dropped only when it is `full` and every key passes `keyShown`.

**O3, removals**
- QWORD, HEADQ_RE, TAILREF_RE, HEADPERF_RE, PRAISE_HEAD, headQ, SPLIT_Q, REFBACK_RE, refsBack, ownTail, joinKnown and the XQ multi list are removed. Before removing them I grepped: they were internal to a38 and referenced only in docs/handoff notes, not by any other file or test.
- `demBack`, DEM_W and DEM_PRON_NEXT are kept, because the anaphor rule uses them.
- Kept unchanged: the N1 window (`msgWin`), the pre-creation inclusion, and the chat_invent naming rule (still applied per question sentence).

**O4, `test_tour1_r11_coach.js` struct**
- Each tap child now uses `stdio: ['ignore','ignore','pipe']`. On `close`/`error` it records `{code, signal, stderr}` (the last 600 chars of stderr).
- Both struct checks append these diagnostics to their failure message: the replay check for every child, the scan check for children that failed or produced nothing.
- Nothing else changes: same files, checks and knobs.

## Judgement calls
1. **«:» stays a sentence boundary; «؛» does not.**
   - Splitting at «:» keeps the R14/R12 «no preamble» outcomes («قیاس را به کار بردی:», «پیش از کد، یک قدم عقب:», «تو بگو:»). A referent that sits before «:» is recovered by the anaphor rule, including the suffix «‌اش» («اگر مسئلهٔ مرتبطی داری: نتیجه‌اش …؟», r4 E5d).
   - «؛» joins clauses of one sentence. Following O1's "keep together", the clause before it stays. Example: the r13 echo option starts ««دو ساعت» را درست یا غلط نمی‌خوانم؛ …».
2. **Rhetorical exclusion kept, narrowly.** A question sentence made only of praise/assent words («آفرین، خیلی خوب؟», «درسته؟», «ادامه بده؟») is not a question. O1 says "prefer none", but `test_tour1_r2_live` R8 still needs this exclusion.
3. **A·E1 s01 outcome.** Both of the assistant's sentences match page question u1, which she answered on the page. So the option is fully keyed and dropped, and the 📄 page question stays as the single representation. DECISIONS cites s01 under "any un-keyed sentence keeps the option whole". That rule is implemented, but s01's second sentence does key here. The test accepts either the whole 💬 or the 📄 page question, and never a half.
4. **Strict 📄 coverage.** Plain word overlap between a key's sentence and a 📄 sentence is not enough to drop an option, because «فرض را بخش‌بخش جدا بنویس» would otherwise disappear behind «شرط … بخش‌هایش را جدا بنویسی؟». Coverage needs a verbatim 📄 sentence, or a filled field's own label.
5. **Collapse only when both options are fully keyed.** An option with an own-words sentence never merges into a keyed one, so no own-words content is lost.
6. **chat_invent naming rule, per sentence.** When the sentences of one creating reply belong to different problems, each problem's option is rebuilt from its own question sentences. This keeps r13 `invent` unchanged.
7. **Leading «ولی»/«اما» stripped even without a comma.** Both are pure discourse words. خوب/عالی still need a comma, «!», «.» or a dash after them, because they can be adjectives («خوب که خودت…»).

## Older expectations updated
Each change carries a comment naming R15.
- `test_tour1_r5_live` F7 and `test_tour1_r6_live` G5: the head before «—» is kept; only «ولی» goes.
- `test_tour1_r10_live` head: the praise «آفرین،» is cut and the dash head stays.
- `test_tour1_r10_live` dedupe: an «اگر …» question brings its preceding sentence.
- `test_tour1_r11_live`:
  - qword: the key is Q_WHOLE (best match), and `#lpBBest` shows the 📄 whole-first question because lpOne answered it (C·T1).
  - paren: «خوب پیش رفتی — …» stays.
- `test_tour1_r13` echo:
  - The option is the question passage, without trailing declaratives or a pre-colon preamble.
  - The «؛» clause stays.
- `test_tour1_r14` best: the whole-first question appears once, as the page option (C·T1).

## Verification (execution)
- `node tests/test_tour1_r15_live.js`: «NO ERRORS», exit 0. On fac11d42 it is red: four sections fail.
- Every `tests/test_tour1_*.js` plus `test_live_problem.js` exits 0.
- `node tests/test_tour1_r11_coach.js`: «NO ERRORS». The struct section now records `kids` for every fixture, with exit code 0 and an empty stderr tail.
- `python -m pytest tests/test_learning_architecture_graph_browser.py -q -p no:cacheprovider`: **93 passed** in 490 s, none skipped.
- `python3 apps/learning-architecture/build.py --check`: «sources, bundle and handbook are in sync».
