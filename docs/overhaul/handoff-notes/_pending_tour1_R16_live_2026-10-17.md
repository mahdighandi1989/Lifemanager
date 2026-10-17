# Tour 1 (Pólya), round 16: live fixer handoff (2026-10-17)

Scope: L1 (a–e), L2 and L3 from `DECISIONS_R16.md` («live» = a38; a26/a29 were not needed). DECISIONS_R2–R15 still bind where R16 does
not replace them. Base 96322acd (fast-forwarded). Only `apps/learning-architecture/src/app/a38_live.js`, tests, and the rebuilt bundle
changed. The coach items N1–N6 belong to the parallel coach fixer. Not done here: WORKLOG/PROGRESS/HANDBOOK, AUDIT_LOG, experiences, merge.

## Commits
- 386269cb `test(lla)`: new `tests/test_tour1_r16_live.js`, committed red on 96322acd (every defect case failed; every setup and control passed).
- ead63f2f `fix(lla)`: L1a–e, L2 and L3, the rebuilt bundle, and updated r11/r12/r13/r14 expectations.
- (this note)

## Test (`tests/test_tour1_r16_live.js`, sections `colon,mask,runs,ref,rep,live,kind`)
Each case runs through the real UI (assistant panel with a stub model, the 🔭 forms, «✅ حل شد», `APP.liveChatQs`, `#lpBBest`). The
assistant messages are copied word for word from `round16X/<sid>/ai/r*.txt`.

| Defect | Section | Before (96322acd) | Now |
|---|---|---|---|
| A·F5 s06 | colon | «کدام حلقه دقیقاً شکست؟» | «پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟» |
| A·F5 s10 | colon | «مثالِ نقضی پیدا می‌شود؟» | «پیش از اثبات، حالت‌های خاص و حدی را بیازما: مثالِ نقضی پیدا می‌شود؟» |
| C·U1 s25 (+ s21/s23/s25 harmless) | colon | head cut | «از آخر شروع کن: …»، «ده نمونه اثبات نیست: …»، «حالا که گیر کرده‌ای: …»، «قیاس را به کار بردی: …» |
| labels (control) | colon | — | «اول یک پرسش:»، «یک پرسش:»، «یک پرسشِ بازنگری:»، «یک پرسش از همین فهرست:» are still dropped |
| D·D1 s37 | mask | ««کل بر ۳۶…» — … ؟۴۸۷؟ … شرط را …؟» | «شرط را می‌توانی به بخش‌هایش جدا بنویسی — و کدام بخش را اول، جدا، به کار می‌بری؟» |
| A·F2 s03 | runs | both look-back questions glued with « … » | two options: «برهانی گفتی — … حکم می‌رسی؟» and «وارسی‌اش کن: هر بخشِ فرض — … — کجا به کار رفت …؟» |
| C observation s23, s21/s29 | ref | «چطور می‌آزمایی‌اش — …؟» | «… (حدسِ تو: «زمان ۱٫۷۵ برابر می‌شود»)»؛ «این حدس را … (حدسِ تو: «رخِ a1 بی‌فایده است»)» |
| D·D2 s31 (S3 part) | rep | 10 options, 3 redundant | 7 options: the three «همهٔ داده‌ها و کلِ شرط» wordings → the latest; the two taste questions → the latest |
| A·F3 s06/s10 | live | new reply missing until re-navigation | appears in `#lpBBest` at once; the picked option stays picked |
| A·F1 s03/s10 | kind | 📄 «مجهول (یا حکم…)»، «شرط چیست؟»، «… تعیینِ مجهول …» | 📄 «حکم (آنچه باید ثابت شود) چیست؟»، «فرض (آنچه داده شده) چیست؟»، «حکم را به بخش‌هایش بشکن…»، «آیا همهٔ فرض لازم است؟…» |
| A·F1 s05 (life pod) | kind | 📄 «به مجهول نگاه کن: …» (life find list) | 📄 the pod card's labels, with no «مجهول» |

Controls in the test: a contiguous run stays one option; a «یعنی …:» head and a «و آن …» run join the previous run; a page question answered
on the page is one 📄 option, never 💬; options never cross problems; an option without a referent is not decorated. The R15 controls in
`test_tour1_r15_live.js` stay green, unchanged.

## What changed (a38_live.js)
- **L1b**: `maskedAt`/`qEnd`. A word in which «؟» is directly followed by another character (not a space or a closing mark) is a mask, and none of its «؟» ends a sentence. Applied in `sentSplit` (also used for page-question keying) and in the new `units`.
- **L1a**: `units(text)` uses the same boundaries as `sentSplit` and marks each unit as `head` (ends in «:»), `quote` (a unit that is entirely «…؟», such as a quoted think-aloud; R15 D4 s30) or a plain sentence.
  - The head is the clause before «:», after the last «؛» of that unit.
  - `bareLabel` defines a label by structure. It is either discourse words only («حالا:»), or [lead word] [determiner] پرسش/سؤال with its ezafe chain plus an optional trailing prepositional group, and no verb. Every other head is kept with the question that follows it.
- **L1c**: `qPassages(text, keep)` returns a list. Each contiguous run of questions becomes one option, with its non-label head.
  - A later run is joined with « … » only if it starts with an anaphor or connective. Without a head this is `anaStart` on the question; with a head it is a head that starts with a connective (و/یا/مثلاً/اگر/یعنی/—).
  - The R15 rule that an anaphor brings in the preceding statement still applies. For a head, only a pronoun or demonstrative start brings it in, not a connective. This keeps R4 E5d «اگر مسئلهٔ مرتبطی داری: …» without the praise sentence before it.
  - In `chatItems`, each item carries its message id, and two parts of one message never collapse into each other, even by key set.
- **L1e**: `cwSet` builds the content words of an option's question sentences. It drops:
  - STOP words, plus a closed list of function words (the clitic اش, کدام/چند, دوباره/دقیقاً…);
  - the word after می/نمی;
  - the verb slot at the end of each clause (clauses are split at ؟ . ! ؛ —; Persian is SOV), plus the preverb of «به X فعل»;
  - nothing from a segment between two dashes, which is treated as an apposition.

  `cwSub` reports a subset in either direction (non-empty). Collapsed items take the most recent wording, in the earliest slot.
- **L1d**: `refNote` applies when an option contains «این/همین/آن/همان حدس», «حدسی گفتی», or a clitic «‌اش» while the text before it in the same message says «حدس». If the problem has a recorded guess (`s.g[1].guess`) that the option does not already contain, it appends « (حدسِ تو: «…»)». The same rule with «مجهول» appends the recorded unknown (`u.u`).
- **L2**: `LB_LIVE` plus a wrapper on `S.put`, written the same way as a12's mirror wrapper.
  - Every save of an `achat_…` session schedules one refresh, after that turn, of the open look-back's `#lpBBest`.
  - The refresh rewrites the options in place, without re-rendering the card. It updates the `Ch/ChI/bestOpts` closure that the save handler uses, and re-maps `d.best` by text.
  - If the select is not on the page, it falls back to `rer()`.
- **L3**: `cardUQs(r, s)` gives the understanding-phase questions.
  - For prove/pod problems it uses the type's own `A.SOLVE_TYPES` labels: u, d, c, suff. Find problems keep the previous list.
  - It is used by `pageQs`, `pageFields` and `knownQs`.

No exported symbol was removed. `qPassage` (internal, called only by `chatItems`) became `qPassages`.

## Judgement calls
1. **s03 F2 versus «وارسی‌اش».** The second question's head «وارسی‌اش کن:» begins with a clitic word. DECISIONS cites s03 as the case to split, so the join test for a run that has its own head looks at the head's connective, not at a clitic inside it. A head with its own verb frames a new directive and keeps the option readable.
2. **What counts as «content words» (L1e).** A plain token subset could not merge the three s31 wordings: «آمده‌اند» versus «به کار رفته», and «دوباره بخوان». So the verb slot and function words are removed by sentence structure (clause-final verb, the word after «می», preverbs, apposition between dashes), not by any count. The comparison uses only the question sentences, without heads. Exact token equality after stemming is required, so prefix matches such as «حدسی» and «حدست» never merge two questions.
3. **L3 for a life «اثبات یا رد کن».** The card actually shows the pod labels (حکم / فرض / بخش‌های حکم / «آیا فرض برای داوری کافی است؟»), and none of them contains «مجهول». The 📄 options now repeat exactly those labels. They do not add a «فرضیه» rewording the card never showed. DECISIONS' «(life pod: فرضیه)» is met because «مجهول» is gone.
4. **L1d needs a record.** The referent is added only when the problem has a recorded guess or unknown. A chat-only problem (s31) is unchanged.
5. **Older expectations, each with a comment naming R16:**
   - r11 `qword` and `paren`, and r14 `own`: the head is now kept.
   - r13 `echo`: EQ_FEW keeps «معادله کم است:». The Q_LINK echo still collapses with the later bare «کدام حلقه دقیقاً شکست؟», keeping the most recent wording.
   - r12 `multi`: Q_GUESST may now carry « (حدسِ تو: …)».

## Verification (execution)
- `node tests/test_tour1_r16_live.js`: «NO ERRORS». On 96322acd it is red: every defect case fails, and every setup and control passes.
- All 30 `tests/test_tour1_*.js` files plus `test_live_problem.js` exit 0 on ead63f2f.
- `python -m pytest tests/test_learning_architecture_graph_browser.py -q -p no:cacheprovider`: **94 passed** in 571 s, none failed or skipped.
- `python3 apps/learning-architecture/build.py --check`: in sync.
