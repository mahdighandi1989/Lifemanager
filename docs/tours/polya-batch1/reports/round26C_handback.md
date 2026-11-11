# Round 26 · group C — final report

All 20 group-C scenarios were replayed on the real page (main 1f93c333, dist in sync) and each has `findings.md`, `DONE` and a sent e-mail. Result: **0 PASS · 11 PARTIAL · 9 FAIL**. In every scenario the person reached a verified solution or the exact sticking point; every FAIL is a page defect (S2), not a coaching failure.

Not run or not checked:
- **Territory arms:** the tie of two candidates and the piece-after-closure arm (tC1) were not run.
- **s29:** the sketch-attach turn could not run because the round-25 image file was missing.
- **pC3:** the plan/step forms were not run and the look-back was not saved (my controls, class d).
- **Screenshots:** taken for every scenario but not reviewed one by one; verdicts rest on page text, state and prompts.
- **Mind-card credit for prior steps (C25-18):** only partly checked.
- **C26-33:** needs confirmation (see below).
- **Token/time use:** not visible to me.

Housekeeping: the repo was not edited; none of my processes is still running, and I only ever killed PIDs recorded in `pids.txt`; all my browser profiles are deleted; the owner's address is in no file.

## Results per scenario

| sid | result | defects (with turn) |
|---|---|---|
| s21 | PARTIAL | C26-1 (📜), C26-2 (🧭/📜 «حل شد» with closure = review) |
| s22 | PARTIAL | C22-5 p7, C26-1, C26-3 p16/p18, C26-4 p20, C26-5 p14/p17/p21 |
| s23 | FAIL | C25-8′ p5 (S2), C25-15 p11 (S2), C22-5 p5, C26-35 p11, C26-36 p12, C26-37 p6, C26-38 p9, C26-16 p5/p7/p8, C26-1 («۳ از ۳») |
| s24 | PARTIAL | C26-4 (🧭 of the second problem) |
| s25 | PARTIAL | C25-9 p16, C25-10/C25-6 p17, C22-5 p9, C26-14 p3/p5/p19, C26-15 p7/p16/p17, C26-16 p13/p14, C26-17 p18 |
| s26 | PARTIAL | C22-11 (chat guess «هنوز آزموده نشده»), C26-1 («۳ از ۳») |
| s27 | PARTIAL | C26-39 (step card), C26-1 |
| s28 | PARTIAL | C26-41 p4, C26-40 p4, C25-7′ p4, C26-4, C26-1 |
| s29 | PARTIAL | C26-42 p6, C26-16 p3–p5, C26-1 |
| pC1 | FAIL | C26-31 p1 (S2), C26-32 p12–p14 (S2), C26-33 forms (S2, needs confirm), C26-2, C26-18 p5, C25-7 p1, C26-1 |
| pC2 | FAIL | C26-8 p8 (S2), C26-32 p11 (S2, prompt level), C25-10 p4, C26-2, C26-1 |
| pC3 | FAIL | C26-34 🧭 (S2), C25-9 p3 (S2), C26-32 p15 (prompt level), C25-10 p4, C26-2, C26-1 |
| aC1 | FAIL | C26-22 p10 (S2), C26-21 p10, C26-1 |
| aC2 | FAIL | C26-25 p3–p10 (S2), C26-26 p4 (S2), C26-23 p1, C26-24 p2, C26-27 p11, C26-1 |
| aC3 | FAIL | C26-10 p5 (S2), C26-28 p3 (S2), C25-9 p4, C26-17 p6, C26-15 p5/p8, C26-5, C26-4, C26-1 |
| aC4 | PARTIAL | C26-1, C26-29 (📜), C26-18 p3/p7, C26-30 p7, C25-16 (🧭) |
| tC1 | PARTIAL | C26-20, C26-18 p6, C26-19 p12, C26-1 |
| oC1 | PARTIAL | C26-1, C26-4 p19, C26-5 p16 |
| pwC1 | FAIL | C25-15, C25-4 p12, C26-6 p8, C26-7 p17 (S2), C26-8 p2–p12 (S2), C26-9 p3 (S2), C26-10 p15 (S2), C26-11 |
| pwC2 | FAIL | C26-8 p4 (S2), C26-12 p23–p25 (S2), C25-15 p22, C26-1, C26-5 p20, C26-13 |

## New defects (C26-1 … C26-42)

**S2**
- **C26-7:** a second prior-work report is not merged into the ledger.
- **C26-8:** her own fix of a wrong step is refused although the arithmetic block reads the same numbers ✓. It is accepted only one turn later and only in plain words, and the bold question keeps sending her back to the old step (pwC1, pwC2, pC2).
- **C26-9:** «۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت» is flagged ✗.
- **C26-10:** «= ۵۴ میلیون», «= ۲۲٫۵۲ میلیون», «= حدود ۹۷٫۵ میلیون» are flagged ✗ (scale word after the result).
- **C26-12:** a second problem becomes the 🧭 destination of the first; the second and third have no own record.
- **C26-22:** a child's school name becomes a problem title and stays visible in 📜, Today and the 🧭 strip.
- **C26-25:** a problem proved in chat and then registered opens at «فهم» with no «✅ حل شد» card.
- **C26-26 / C26-31:** «با n = 4 میشه 1+3+5+7 = 16» and «x=4 و y=1 میشه 16−1=15» are flagged ✗ (the number before «میشه» is taken as the claimed value).
- **C26-28:** a birth sentence with a four-digit year is read as a dated plan.
- **C26-32:** after «go → prereq» the automatic follow-up says «فیلدها را پر کن … دکمهٔ ساخت را بزن» on a list that already holds her map. A literal model then built a duplicate empty map (pC1); the same prompt appeared in pC2 and pC3.
- **C26-33 (needs confirm):** the typed plan was gone after a refused «ثبتِ طرح» plus adding a move, though the same controls saved it in round 25. In a separate probe the text survived adding a move, so the loss is at the refusal or a different order.
- **C26-34:** a prerequisite diagnosed before the problem was registered shows twice on 🧭 and one copy stays open, so «اکنون / مانده» are wrong.

**S3**
- **C26-1:** the session dossier counts one problem as «۲ از ۲» / «۳ از ۳» (16 of 20 scenarios).
- **C26-2:** 🧭, 📜 and the ledger say «حل شد / بسته شد» while the look-back is not saved.
- **C26-3, C26-27:** raw ids in chat text.
- **C26-4:** a result said in chat makes the coach or 🧭 say «بازنگری» ahead of the page stage.
- **C26-5:** dates booked without «درست است؟».
- **C26-6, C26-17:** post-check false positives (guillemets; register on «نمی‌گویم»).
- **C26-11:** wrong «۱۷۰۰ ÷ ۰٫۵ = ۳۰۹۱» not flagged.
- **C26-13:** the stripped introduction is listed in 📜.
- **C26-14:** page turn questions that ask two things.
- **C26-15:** «تو» and «شما» in one page sentence.
- **C26-16:** a closed problem still suggests u1.
- **C26-18:** an already-answered question comes back as the bold question.
- **C26-19:** «آخرِ هفتهٔ بعد» read as this Friday.
- **C26-20:** a clear fit is asked instead of «arrived».
- **C26-21:** a question about the page is classified as a problem.
- **C26-23, C26-24:** key-term and meaning-question misreads.
- **C26-29:** a birth sentence becomes a chat-problem title.
- **C26-30:** a lesson said in chat with no model report is lost.
- **C26-35:** proposed copy text «ضرب در ۳۰ تقسیم بر ۲۰ یعنی ۱٫۷۵».
- **C26-36:** the re-check question is dropped after one turn, unanswered.
- **C26-37:** an unnamed mind event is withdrawn; «۱۰۰ دقیقه» is not marked stale.
- **C26-38:** the register check fires only after eight turns.
- **C26-39:** «✓ گامی که ثابتش کردی» for a step the page cannot judge.
- **C26-40:** «نردبان تمام شد» on turn one of a new problem.
- **C26-41:** «نسخه‌ی سه‌شنبه» read as a date.
- **C26-42:** after a failed retrieval, one success schedules the next 21 days out while the line says «۱ از ۳».

## Round-25 defect table

| id | verdict | where |
|---|---|---|
| C25-1 | FIXED | s25 p1 |
| C25-2 | FIXED | s21 p3 |
| C25-3 | not re-seen | — |
| C25-4 | FIXED in s23, s29; STILL in pwC1 p12 | s23/s29 stale lists are now correct («۱۰ ⇒ ۱۱، ۲۰ ⇒ ۲۲، ۱۰۰ ⇒ ۱۲۱») |
| C25-5 | FIXED | s25 |
| C25-6 | STILL | s25 p17 |
| C25-7 | CHANGED | fixed pC2 p1; still pC1 p1, s28 p4 |
| C25-8 | CHANGED | ✏️ sugar/butter clean (s23 p14); chat «۸ ⇐ ۹» voids an unrelated guess outcome (s23 p5) |
| C25-9 | CHANGED | not seen in s21, pC1, pC2, aC1, aC4; still s25 p16, aC3 p4, pC3 p3 |
| C25-10 | CHANGED | fixed aC4; still s25, pC2 p4, pC3 p4 |
| C25-11, -12, -13, -17, -19 | FIXED | pwC1, pwC2, aC1 |
| C25-14 | CHANGED | own fix lands, but late and only in plain words (C26-8) |
| C25-15 | STILL | pwC1, pwC2 p22, s23 p11 |
| C25-16 | CHANGED | fixed pwC1; still aC4 |
| C25-18 | not re-judged | — |
| C22-5 | CHANGED | fixed for datum corrections (s23 p11, s29 p8); still s22 p7, s25 p9, s23 p5 |
| C22-11 | CHANGED | fixed s21, s24, s28; still s26 |
| C24-2/4/6/7/9/12/16/17 | still FIXED | C24-17: 🧭 now says «حل شد» too early (C26-2) |

## Territory arms (tC1, pwC1)

| arm | verdict |
|---|---|
| sys_done | PASS |
| ruled-out area | PASS |
| unrelated area | PASS (declares, does not ask) |
| generic words only | PASS |
| view names / sheet frame only | PASS |
| positive, two new areas | PARTIAL — best chosen but asked instead of arrived (C26-20) |
| her «نه» | PASS (Today line, sheet reopened) |
| take-back of «نه» (C5) | PASS |
| no duplicate rows | PASS |
| tie of two candidates | NOT RUN |
| piece after closure | NOT RUN |

## Prior-work verdict per scenario

| scenario | block on opening work | outcome |
|---|---|---|
| pwC1 | yes | verdicts + why + dep ✓; own fix refused p2–p12, accepted p13; second report not merged; datum correction does not reach the ledger. Result: exact sticking point (step 4 waiting on a sheet). |
| pwC2 | yes | dispute read by meaning ✓; step 4 ✓; step 3 refused, then accepted in plain words; C25-15. Result: verified 9.2%. |
| pC2 | yes (C25-7 fixed) | unit error separated from arithmetic; fix refused p8, accepted p9. Verified with the bill. |
| s24 (second problem) | yes | two steps ✓ |
| s29 | yes | guess «unchecked», example ✓ |
| pC1 p1 | no (C25-7) | — |
| s28 p4 | no | — |
| pC3 p3 | wrongly, on a mastery answer (C25-9) | the example stays as «کارِ پیشینِ تو: ۱ گام — ۱ درست» to the end |
| s25 p16, aC3 p4 | mid-work block again (C25-9) | — |

## Arithmetic (she wrote · exact · page said · verdict)

| scenario | she wrote | exact | page said | verdict |
|---|---|---|---|---|
| pwC1 | ۱۰۰۰ × ۹٫۸ × (۱۲٫۵/۳۶۰۰) × ۴۰ ≈ ۱۳۶۰ | 1361.1 | ✓ | right |
| pwC1 | ۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۴۷۰ | 2472.7 | ✓, but ledger refused the fix | ledger wrong |
| pwC1 | ۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت | 19.76 kWh | ✗ «۱۹۷۶۰» | defect C26-9 |
| pwC1 | ۱۲ × ۴٫۵ = ۵۴ میلیون | 54 | ✗ «۵۴» | defect C26-10 |
| pwC1 | ۴٫۲ × ۱۲ = ۵۲٫۴ ; ۱۱۵ ÷ ۵۲٫۴ ≈ ۲٫۳ | 50.4 ; 2.19 | ✗ ✗ | right (caught) |
| pwC1 | ۱۷۰۰ ÷ ۰٫۵ = ۳۰۹۱ | 3400 | silent | defect C26-11 |
| pwC2 | ۹ + ۸۹٫۱ = ۹۸٫۱ ; ۹ ÷ ۹۸٫۱ ≈ ۹٫۲٪ | same | ✓, ledger «نمی‌خواند» | ledger wrong |
| s25 | با ۱/۲۰ میشه ۴/۵ (running sum) | 4/5 | ✓ | right (was ✗ in round 25) |
| s25 | ۱/۶ + ۱/۱۲ = ۱/۳ | 1/4 | ✗ | right (caught) |
| aC2 | با n = 4 میشه 1+3+5+7 = 16 | 16 | ✗ | defect C26-26 |
| aC3 | = ۲۲٫۵۲ میلیون ; = حدود ۹۷٫۵ میلیون | 22.52 ; 97.5 | ✗ ✗ | defect C26-10 |
| pC1 | x=4 و y=1 میشه 16−1=15 | 15 | ✗ «۱۶−۱ را ۱ نوشته» | defect C26-31 |
| pC1 | ۴ × ۱۶ = ۶۴ ; ۱۰۰ − ۳۶ = ۶۴ | 64 | ✓ ✓ | right |
| pC2 | ۲۰۰۰ × ۳ × ۳۰ × ۱۵۰۰ شد ۲۷۰ میلیون | 270,000,000 | «می‌خواند؛ ایراد در خودِ حساب نیست» | right |
| pC2 | ۹۰۰۰ × ۳۰ = ۲۷۰ هزار | 270,000 | ✓ | right |
| pC3 | twelve claims (۱۰ × ۱۰ = ۱۰۰ … ۶۰ / ۱۰ = ۶) | same | all ✓ | right |
| s23 | «یعنی ۱۰۰ دقیقه»; form ۸۷۵, ۲٫۸ | stale after her corrections | silent | not marked stale (C26-37, C25-15) |
| aC4, aC1, s26, s28, s29 | sentence arithmetic without «=» | right | no block | not judged (acceptable) |

In total: six false ✗ on correct work in four scenarios, one wrong line missed, and roughly 45 other claims read correctly.

## Chat ⇄ page

- **Stage from chat:** mostly right; early «اجرا» (C25-10) and early «بازنگری / حل شد» (C26-4, C26-2) remain.
- **Closing from chat:** the card «در گفت‌وگو به نتیجه رسیدی» works when the result is said after registering (pC3, s28); it is missing when the problem is registered after the proof (aC2).
- **Prerequisite layer (chat ⇄ 🧩 ⇄ 🧠):** correct in pC1–pC3, aC1, aC4, including four ordered and nested prerequisites in pC3; exceptions are C26-34 and C26-32.
- **Practice dossier ⇄ Today:** correct over 23 days in s23 and s29.
- **One problem, one record (P5):** fails in the session dossier (C26-1) and in pwC2 (C26-12).

## Owner bank (group C: 21–31)

| # | answer | where |
|---|---|---|
| 21 | نیست — sheet #102 | pwC1 |
| 22 | هست | pwC1, tC1 |
| 23 | هست (intro line still listed in 📜, C26-13) | pwC1, pwC2, pC1, aC4 |
| 24 | نیمه — forms, drafts, destination and stale numbers ✓; step/result texts and prior ledger ✗ (C25-15) | oC1, s23, s29, pwC2 |
| 25 | هست | s25, s24, s28 |
| 26 | هست | aC1 |
| 27 | هست | pwC1, tC1 |
| 28 | نیست — sheet #103 | pwC1 |
| 29 | نیست — sheets #101 (aC3), #103 (pwC2) | aC3, pwC2 |
| 30 | answered honestly; not counted twice in what was seen | pwC2 |
| 31 | نیمه — finds how far she got, judges each step, resumes at the first non-✓; her fix lands late (C26-8), second report not merged (C26-7), block missing for pC1/s28 openings | pwC1, pwC2, pC2, s24, s29 |

Also touched from the other shares of 1–41:
- هست: 1, 2, 3, 8, 9, 10, 12, 17, 19.
- نیمه: 6, 11.
- نیست, with sheets: 18, 20, 36.

## Routing and prompt scan

- **Routing:** 259 of 259 turns on the expected task (coach turns `lla_coach`; system follow-ups, ✏️ turns and navigation commands `lla_assistant`; consultant `learning_architecture`).
- **Prompt scan:** 248 prompts, 0 with more than one unmarked question instruction.

## PARTS.md — «نسبت به دورِ ۲۵»

| part | trend |
|---|---|
| «کارِ پیشینِ تو» | better (C25-7 partly, C25-12, C25-13 fixed); new S2 C26-7, C26-8 |
| حسابِ صفحه | mixed — C25-1 fixed; four new false-✗ shapes |
| 🔭 live problem + chat import | same core, more edge defects (C25-10, C26-4, C26-25, C26-40, C26-18, C26-16) |
| موتورِ اصلاح + کهنه | better (C25-4 fixed in two scenarios, C25-8 fixed for ✏️); C25-15 unchanged |
| حلقهٔ قلمرو | same (good) |
| 💬 دستیار + post-check | same; C25-2 fixed, new C26-32 |
| سن / دادهٔ شخصی | better on the mind card (C25-17); new S2 C26-22, C26-28 |
| تاریخ / امروز | same |
| 🧭 نقشهٔ مسیر | worse — more wrong «now / left» states (C26-2, C26-34, C26-12) |
| 📜 پرونده | better for guesses (C22-11 fixed in 3 of 4); C26-1 is new and wide |
| 🧠 کارنامه | same |
| پیش‌نیاز | same (best part) |
| تمرین | same (good) |
| فرمول | same (good) |

## «ارتقای لازم» (main items)

- Arithmetic: read «مقدار … میشه عبارت = حاصل» from the expression, and ignore scale or unit words after the result.
- Prior ledger: take her fix the same turn, judging each piece of a chained calculation separately; merge later reports.
- «حل شد» in 🧭, 📜 and the ledger only from the page's own closure.
- Session dossier: a later message of the same live problem is not a new problem; introductions, birth sentences and children's personal data never become titles.
- Follow-up after «go»: when the destination list already holds the item, say «open it», not «build».
- Corrections: respect an empty «rests»; include form step and result texts in «این‌جا هم عوض شود؟» and in the stale list; recompute numbers inside proposed text.
- Prerequisites diagnosed before registration: one point on 🧭, not two.
- Dates: a weekday or date inside the problem wording, or a birth sentence, is not a plan.

## New owner-like questions

- If a lesson I say in chat is not picked up, where do I see that nothing was kept?
- When the page asks «این‌جا هم عوض شود؟», does the proposed text recompute the numbers inside it?
- After I forget once, why is my next reminder three weeks away?
- If I say «open it» and something with that name exists, do I get that one and never a second empty one?
- Does «حل شد» mean the same on the map, in the dossier and on the problem page?
- If a weekday is part of my problem's wording, will it become an appointment?
- Can a parent see which steps the child took alone?

## E-mails

All 20 were sent with the Gmail tool to the owner's address, each recorded in `<sid>/mail.sent`.

## Files

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C/`:
- `defects.md`
- `PARTS.md`
- `routing.md`
- `<sid>/findings.md` (20 scenario folders)