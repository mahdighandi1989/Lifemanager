# Round 26 · group C — defects and tables

Page: main 1f93c333, dist verified in sync. 20 scenarios, 259 model turns (incl. consultant and rewrites), all on the real page; both roles played by the runner («literal average model»; coach_state omitted in ≥1 turn per scenario). Zero-defect rule: every line below binds.

## Results

- s21: PARTIAL (C26-1, C26-2)
- s22: PARTIAL (C22-5, C26-1, C26-3, C26-4, C26-5)
- s23: FAIL (C25-8′, C25-15, C22-5, C26-35, C26-36, C26-37, C26-38, C26-16, C26-1)
- s24: PARTIAL (C26-4)
- s25: PARTIAL (C25-9, C25-10, C22-5, C26-14, C26-15, C26-16, C26-17)
- s26: PARTIAL (C22-11, C26-1)
- s27: PARTIAL (C26-39, C26-1)
- s28: PARTIAL (C26-41, C26-40, C25-7′, C26-4, C26-1)
- s29: PARTIAL (C26-42, C26-16, C26-1)
- pC1: FAIL (C26-31, C26-32, C26-33, C26-2, C26-18, C25-7, C26-1)
- pC2: FAIL (C26-8, C26-32, C25-10, C26-2, C26-1)
- pC3: FAIL (C26-34, C25-9, C26-32, C25-10, C26-2, C26-1)
- aC1: FAIL (C26-22, C26-21, C26-1)
- aC2: FAIL (C26-25, C26-26, C26-23, C26-24, C26-27, C26-1)
- aC3: FAIL (C26-10, C26-28, C25-9, C26-17, C26-15, C26-5, C26-4, C26-1)
- aC4: PARTIAL (C26-1, C26-29, C26-18, C26-30, C25-16)
- tC1: PARTIAL (C26-20, C26-18, C26-19, C26-1; tie + piece-after-closure NOT RUN)
- oC1: PARTIAL (C26-1, C26-4, C26-5)
- pwC1: FAIL (C25-15, C25-4, C26-6, C26-7, C26-8, C26-9, C26-10, C26-11)
- pwC2: FAIL (C26-8, C26-12, C25-15, C26-1, C26-5, C26-13)

PASS 0 · PARTIAL 11 · FAIL 9 of 20. In every scenario the person reached a verified solution or the exact sticking point (pwC1: step 4 waiting on a sheet; s27: own gap found); every FAIL is a page defect (S2), not a coaching failure.

## New defects (round 26)

| id | sev | class | evidence | defect |
|---|---|---|---|---|
| C26-1 | S3 | a | 16 of 20 (📜 session) | The session dossier counts one problem as «مسئلهٔ ۲ از ۲» / «۳ از ۳»: a later message of the same problem (day-2 report, «فهم رو ثبت کردم…», a practice request, a birth sentence) becomes a new «مسئلهٔ گفت‌وگو». Correct only in s24 (two real problems). |
| C26-2 | S3 | a | s21, pC1, pC2, pC3 | 🧭 «مقصد — حل شد ✓ · هیچ — به مقصد رسیدی», 📜 «وضع: حل شد», prior ledger «مسئله بسته شد — این دفتر تاریخچه است» while closure.state = review («در بازنگری — هنوز بسته نشده»). |
| C26-3 | S3 | a | s22 p16, p18 | Raw item id «(it1_…)» in a chat system message. |
| C26-4 | S3 | a | s22 p20, oC1 p19, aC3, s24, s28 | A sub-result or a result said in chat ⇒ coach «مرحلهٔ محتمل: بازنگری» / 🧭 «اکنون: بازنگری — حل به نتیجه رسید» while the page stage is earlier (even «فهم» with an unsaved understanding form). |
| C26-5 | S3 | a | s22 p14/p17/p21, oC1 p16, pwC2 p20, aC3 | Model-reported / explicit dates booked without «… درست است؟» (C12). |
| C26-6 | S3 | b | pwC1 p8 | Post-check flags guillemets around a non-quote. |
| C26-7 | S2 | a | pwC1 p17 | A second prior-work report is not merged into the ledger. |
| C26-8 | S2 | a | pwC1 p2–p12, pwC2 p4, pC2 p8 | Her own fix of a wrong step is refused («متنِ تازه‌ات هنوز با حسابِ صفحه یا حکم نمی‌خواند») although the arithmetic block reads the same numbers ✓; only a sentence without «÷ ≈ = ضرب» is accepted one turn later; the turn question keeps sending her back to the old step. |
| C26-9 | S2 | a | pwC1 p3 | «۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت» flagged ✗ (unit prefix not read). |
| C26-10 | S2 | a | pwC1 p15, aC3 p5 | «… = ۵۴ میلیون», «= ۲۲٫۵۲ میلیون», «= حدود ۹۷٫۵ میلیون» flagged ✗ with «حسابِ صفحه: ۵۴ / ۲۲٫۵۲ / ۹۷٫۵» (scale word after the result). |
| C26-11 | S3 | a | pwC1 | Wrong «۱۷۰۰ ÷ ۰٫۵ = ۳۰۹۱» not flagged. |
| C26-12 | S2 | a | pwC2 p23–p25 | A second problem becomes the 🧭 destination of the first; 2nd/3rd problem have no own record. |
| C26-13 | S3 | a | pwC2 | The stripped introduction is shown in the 📜 problem list. |
| C26-14 | S3 | a | s25 p3, p5, p19 | Page turn questions that ask two things. |
| C26-15 | S3 | a | s25 p7/p16/p17, aC3 p5/p8 | «تو» and «شما» in one page sentence. |
| C26-16 | S3 | a | s25 p13/p14, s23 p5/p7/p8, s29 p3–p5 | A closed problem still suggests u1 («مجهول چیست؟ / به مجهول نگاه کن»). |
| C26-17 | S3 | b | s25 p18, aC3 p6 | Register post-check false positive (trigger «نمی‌گویم»). |
| C26-18 | S3 | a | tC1 p6, aC4 p3/p7, pC1 p5 | Stale turn question: a question she already answered comes back as the bold question. |
| C26-19 | S3 | a | tC1 p12 | «آخرِ هفتهٔ بعد» read as this Friday. |
| C26-20 | S3 | a | tC1 | Clear fit of a new area: asked instead of «arrived». |
| C26-21 | S3 | a | aC1 p10 | A question about the page classified as a problem + A191. |
| C26-22 | S2 | a | aC1 p10 | A child's school name becomes a chat-problem title and stays visible in 📜 / Today / 🧭 strip. |
| C26-23 | S3 | a | aC2 p1 | Key-term detector takes «بازنگری دقیقاً» as the term. |
| C26-24 | S3 | a | aC2 p2 | A meaning question ⇒ «prove or refute». |
| C26-25 | S2 | a | aC2 p3–p10 | A problem proved in chat and then registered opens at «فهم», no «✅ حل شد» card, re-asks u1/u2. (pC3, s28: the card «در گفت‌وگو به نتیجه رسیدی» does come when the result is said after registering.) |
| C26-26 | S2 | a | aC2 p4 | «با n = 4 میشه 1+3+5+7 = 16» flagged ✗ («… را ۴ نوشته»). |
| C26-27 | S3 | a | aC2 p11 | Raw «pid» in a refusal; taste not stored. |
| C26-28 | S2 | a | aC3 p3 | Birth sentence «متولد ۲۵ اسفند ۱۳۳۷ام» read as a dated plan («۲۵ اسفند ۱۴۰۵ … درست است؟»). Not repeated with a two-digit year (aC4 p3). |
| C26-29 | S3 | a | aC4 (📜) | The birth-date sentence becomes the title of «chat problem 2» and is shown in 📜 and the «برگرد به» strip. |
| C26-30 | S3 | b | aC4 p7→p8 | A lesson said in chat («یاد گرفتم …») with no model report is stored nowhere and comes back as «درخواستِ عقب‌افتاده (شاید)». |
| C26-31 | S2 | a | pC1 p1 | «x=4 و y=1 میشه 16−1=15» flagged ✗ («۱۶−۱ را ۱ نوشته») — same family as C26-26: the number before «میشه» is taken as the claimed value. |
| C26-32 | S2 | a | pC1 p12–p14 (materialised), pC2 p11, pC3 p15 (prompt) | After «go → prereq» the automatic follow-up says «فیلدها را پر کن … دکمهٔ ساخت را بزن» on a list that already holds her map; a literal model builds a duplicate empty map with the same title. |
| C26-33 | S2 | a (needs confirm) | pC1 forms | Typed plan is not there after a refused «ثبتِ طرح» + adding a move («هنوز نه: طرحت»); the same controls saved the plan in round 25. In a separate probe the text survived adding a move, so the loss is at the refusal or a different order. |
| C26-34 | S2 | a | pC3 🧭 | A prerequisite diagnosed before the live problem was registered shows twice on 🧭; one copy stays open ⇒ «اکنون: پیش‌نیازِ مساحتِ مثلث … ۱ پیش‌نیازِ باز تا برگشت به خط» long after it was learned. |
| C26-35 | S3 | a | s23 p11 | Proposed copy text for the guess after «۳۵ ⇐ ۳۰»: «ضرب در ۳۰ تقسیم بر ۲۰ یعنی ۱٫۷۵». |
| C26-36 | S3 | a | s23 p12 | The post-correction re-check question is dropped after one turn although unanswered and the verdict is «کنار رفت». |
| C26-37 | S3 | a | s23 p6 | ✏️ «۳۵ ⇐ ۴۰ دقیقه»: «۱ رویدادِ کارنامه … پس گرفته شد» without naming it; «یعنی ۱۰۰ دقیقه» (2.8 × 35) not marked stale. |
| C26-38 | S3 | b | s23 p9 | Register post-check («او با تو «تو» حرف می‌زند») fires only after eight «شما» turns. |
| C26-39 | S3 | c | s27 forms | Step card says «✓ گامی که ثابتش کردی — پیشرفتِ واقعی» for a non-numeric step the page cannot judge (he later found the gap himself). |
| C26-40 | S3 | a | s28 p4 | «نردبانِ پرسش‌های این مرحله تمام شد … فقط گامِ بعد را بگو» on the first turn of a new live problem. |
| C26-41 | S3 | a | s28 p4 | «نسخه‌ی سه‌شنبه رو آوردم» (the puzzle's name) read as a date: «سه‌شنبه ۲۸ مهر … در «امروز» بیاید؛ درست است؟». |
| C26-42 | S3 | c | s29 p6, s23 p9 | After a failed retrieval, one success a week later schedules the next retrieval 21 days out while the same line says «۱ از ۳ بازیابیِ موفق پس از آخرین شکست (چرخهٔ ۱، ۳، ۷)». |

S2: 15 (C26-7, -8, -9, -10, -12, -22, -25, -26, -28, -31, -32, -33, -34 + carried C25-8′, C25-15, C25-9) · S3: 29.

## Round-25 defect table

| id | verdict | where |
|---|---|---|
| C25-1 | FIXED | s25 p1 — running sum «با ۱/۲۰ میشه ۴/۵» ✓ |
| C25-2 | FIXED | s21 p3 |
| C25-3 | not re-seen | wake lines in aC3/aC4 used «شما» |
| C25-4 | FIXED in s23, s29 (clean, correct stale lists «۱٫۷۵ ⇒ ۱٫۵», «۱۰ ⇒ ۱۱، ۲۰ ⇒ ۲۲، ۱۰۰ ⇒ ۱۲۱»); STILL in pwC1 p12 («۴ ⇒ ۳٫۲، ۱۴۰۰ ⇒ ۱۱۲۰») | liveStale |
| C25-5 | FIXED | s25 |
| C25-6 | STILL | s25 p17 (stage sources disagree) |
| C25-7 | CHANGED | fixed pC2 p1 (block + «حساب … می‌خواند؛ ایراد در خودِ حساب نیست»); still pC1 p1, s28 p4 |
| C25-8 | CHANGED | ✏️ sugar/butter clean (s23 p14); chat correction «۸ ⇐ ۹ تخم‌مرغ» voids the unrelated guess outcome although rests = [] (s23 p5) |
| C25-9 | CHANGED | not seen s21, pC1, pC2, aC1, aC4; STILL s25 p16, aC3 p4, pC3 p3 (mastery answer becomes the prior ledger) |
| C25-10 | CHANGED | fixed aC4; STILL s25 p17, pC2 p4, pC3 p4 («اجرا روی واقعیت» with no plan / wrong plan) |
| C25-11 | FIXED | pwC1 p1 |
| C25-12 | FIXED | pwC1 p1, pwC2 p1, pC2 p2 |
| C25-13 | FIXED | pwC2 p2–p3 |
| C25-14 | CHANGED | own fix lands, but only one turn late and only in plain words (C26-8) |
| C25-15 | STILL | pwC1, pwC2 p22, s23 p11 (step/result numbers 875, 2.8, «۸ تخم‌مرغ» neither stale nor asked) |
| C25-16 | CHANGED | fixed pwC1; STILL aC4 (strip «طرح هنوز نیست» at «اجرا») |
| C25-17 | FIXED | aC1 |
| C25-18 | not re-judged | mind credit for prior steps only partly checked |
| C25-19 | FIXED | pwC1 day 3 |
| C22-5 | CHANGED | fixed for datum corrections with form copies (s23 p11: 4 asked, s29 p8: 2 asked); STILL s22 p7, s25 p9, s23 p5 (typed step outcome) |
| C22-11 | CHANGED | fixed s21, s24, s28 (form guess = chat guess, «رد شد — داوریِ خودت»); STILL s26 (chat guess «هنوز آزموده نشده» beside the refuted form guess) |
| C24-2, -4, -6, -7, -9, -12, -16, -17 | still FIXED | pC1, pC2, s23, s28, pC3 (C24-17: 🧭 now says «حل شد» too early — C26-2) |

## Territory loop — arms (tC1, pwC1)

| arm | what came | page | verdict |
|---|---|---|---|
| sys_done | she found another way | «از راهِ دیگری برداشته شد ✓» | PASS |
| ruled-out area | persuasion | not answered, sheet reopened, note | PASS |
| unrelated area | creativity | declared not answered (no question) | PASS |
| generic words only | pwC1 day 3 | not answered (C4 text) | PASS |
| view names / sheet frame only | pwC1 day 5 | no «arrived», no question | PASS |
| positive, two new areas | customer validation + market size | best chosen, but asked instead of arrived | PARTIAL (C26-20) |
| her «نه» | — | waits, sheet reopened with note, Today line | PASS |
| take-back of «نه» (C5) | — | restored with history | PASS |
| no duplicate rows | — | none | PASS |
| tie of two candidates | — | — | NOT RUN |
| piece after closure | — | — | NOT RUN |

## Prior work (P1) — verdict per scenario

| scenario | block on opening work | ledger verdicts | own fix | merge / stale | result |
|---|---|---|---|---|---|
| pwC1 | yes | per step + why + dep ✓ | refused p2–p12 (C26-8), accepted p13 | second report not merged (C26-7); datum correction not reaching ledger (C25-15) | exact sticking point (step 4 waiting on sheet) |
| pwC2 | yes | ✓; dispute by meaning ✓ | step 4 ✓; step 3 refused then accepted in plain words | C25-15 | verified 9.2% (then set aside by 1% ⇐ 2%) |
| pC2 | yes (C25-7 fixed) | 1 step ✗ unit; «حساب می‌خواند» ✓ | refused p8, accepted p9 | — | verified with the bill |
| s24 (2nd problem) | yes | 2 steps ✓ | — | — | recurrence + mapping |
| s29 | yes (guess + example) | guess «unchecked», example ✓ | — | — | solved in forms |
| pC1 | NO (C25-7) | — | — | — | solved in chat |
| s28 (2nd problem) | NO | — | — | — | 13/27 |
| pC3 | wrongly on a mastery answer (C25-9) | example kept as «کارِ پیشینِ تو: ۱ گام — ۱ درست» to the end | — | — | solved |
| s25, aC3 | mid-work block again (C25-9) | — | — | — | — |

## Arithmetic (P2) — what she wrote · exact · page · verdict

| scenario | she wrote | exact | page | verdict |
|---|---|---|---|---|
| pwC1 | ۱۰۰۰ × ۹٫۸ × (۱۲٫۵/۳۶۰۰) × ۴۰ ≈ ۱۳۶۰ | 1361.1 | ✓ | right |
| pwC1 | ۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۴۷۰ | 2472.7 | ✓ (ledger refused the fix) | arithmetic right, ledger wrong |
| pwC1 | ۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت | 19.76 kWh | ✗ «۱۹۷۶۰» | DEFECT C26-9 |
| pwC1 | ۱۲ × ۴٫۵ = ۵۴ میلیون | 54 | ✗ «۵۴» | DEFECT C26-10 |
| pwC1 | ۴٫۲ × ۱۲ = ۵۲٫۴ ; ۱۱۵ ÷ ۵۲٫۴ ≈ ۲٫۳ | 50.4 ; 2.19 | ✗ ✗ | right (caught) |
| pwC1 | ۱۷۰۰ ÷ ۰٫۵ = ۳۰۹۱ | 3400 | silent | DEFECT C26-11 |
| pwC1 | ۱۱۵/۳ = ۳۸٫۳۳ ; ۱۱۵ − ۷۰ = ۴۵ = ۳ × ۱۵ ; ۲ × ۱۲۵ = ۲۵۰ | same | ✓ | right |
| pwC2 | ۹ + ۸۹٫۱ = ۹۸٫۱ ; ۹ ÷ ۹۸٫۱ ≈ ۹٫۲٪ ; ۶/۳۶ = ۱/۶ | same | ✓ (ledger: «نمی‌خواند») | arithmetic right, ledger wrong |
| s25 | ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴ ; با ۱/۲۰ میشه ۴/۵ ; ۷/۳۰ = ۱/۶ + ۱/۱۵ | same | ✓ | right (was ✗ in r25) |
| s25 | ۱/۶ + ۱/۱۲ = ۱/۳ | 1/4 | ✗ | right (caught); dependent «۲/۵» not named |
| aC2 | با n = 4 میشه 1+3+5+7 = 16 = 4² | 16 | ✗ «… را ۴ نوشته» | DEFECT C26-26 |
| aC2 | 2+4+6 = 12 = 3×4 ; ۱۰ = 4×5/2 | same | ✓ | right |
| aC3 | … = ۲۲٫۵۲ میلیون ; ۱۸۰ − ۶۰ − ۲۲٫۵ = حدود ۹۷٫۵ میلیون | 22.52 ; 97.5 | ✗ ✗ | DEFECT C26-10 |
| pC1 | x=4 و y=1 میشه 16−1=15 | 15 | ✗ «۱۶−۱ را ۱ نوشته» | DEFECT C26-31 |
| pC1 | ۴ × ۱۶ = ۶۴ ; ۱۰۰ − ۳۶ = ۶۴ | 64 | ✓ ✓ | right |
| pC2 | ۲۰۰۰ × ۳ × ۳۰ × ۱۵۰۰ شد ۲۷۰ میلیون | 270,000,000 | «می‌خواند؛ ایراد در خودِ حساب نیست» | right |
| pC2 | ۱۰۰۰ وات = ۱ [کیلووات] ; ۲۰۰۰ وات = ۲ ; ۹۰۰۰ × ۳۰ = ۲۷۰ هزار | same | ✓ ✓ ✓ | right |
| pC3 | twelve claims (۱۰ × ۱۰ = ۱۰۰ … ۶۰ / ۱۰ = ۶) | same | all ✓ | right |
| aC4, aC1, s26, s28, s29 | sentence arithmetic without «=» («میشه ۱۵ روز», «۱۴×۱۴ … ۲۷ … ۱۳/۲۷») | right | no block | not judged (acceptable) |
| s23 | ۲٫۸ × ۳۵ «یعنی ۱۰۰ دقیقه»; form «۸۷۵», «۲٫۸» | 98; 875 → 750, 2.79 → 2.39 after correction | silent | stale not marked (C26-37, C25-15) |

Page arithmetic: 6 false ✗ on correct work in 4 scenarios (C26-9, C26-10 ×3, C26-26, C26-31), 1 wrong line missed (C26-11), all other claims read correctly (≈ 45 claims).

## Chat ⇄ page

- Stage from chat: fine in most; early «اجرا» (C25-10) and early «بازنگری / حل شد» (C26-4, C26-2) remain.
- Closing from chat: the card «در گفت‌وگو به نتیجه رسیدی — ✅ حل شد — بازنگری» works when the result is said after registering (pC3, s28); missing when the problem is registered after the proof (aC2, C26-25).
- Prerequisite layer chat ⇄ 🧩 map ⇄ 🧠: correct in pC1–pC3, aC1, aC4 (nested, ordered, «had», «learned», exact return); 🧭 duplicate open prerequisite (C26-34); follow-up builds a duplicate map (C26-32).
- Practice dossier chat ⇄ Today: correct over 23 days in s23 and s29.
- One problem, one record (P5): fails in the session dossier (C26-1) and in pwC2 (C26-12).

## Corrections vs round 25

| scenario | correction | page | verdict |
|---|---|---|---|
| s22 | six corrections | all applied | good (C22-5 at p7) |
| oC1 | ۱۵ ⇐ ۱۲; ۱۲۰ ⇐ ۱۴۰ | drafts, destination, typed copy asked | good |
| s25 | proof data | proof kept | good |
| s23 | «۸ ⇐ ۹ تخم‌مرغ» | voids unrelated guess outcome; own result untouched | DEFECT (C25-8′, C22-5) |
| s23 | ✏️ «۳۵ ⇐ ۴۰ دقیقه» | unnamed mind event withdrawn; «۱۰۰ دقیقه» not stale | S3 (C26-37) |
| s23 | «۲۵ در ۳۵ ⇐ ۲۵ در ۳۰» | statement, title, verdict, solved, guess outcome, «۱٫۷۵ ⇒ ۱٫۵», 4 copies asked | good, but step/result numbers missed (C25-15), wrong proposed text (C26-35) |
| s23 | ✏️ sugar/butter | only the statement + one ask | FIXED (C25-8, C25-4) |
| s29 | «۴۰ ⇐ ۴۴ متر» | statement, title, «۱۰ ⇒ ۱۱، ۲۰ ⇒ ۲۲، ۱۰۰ ⇒ ۱۲۱», 2 copies asked, verdict «مربع» kept | FIXED (C25-4) |
| pwC1, pwC2 | datum under prior steps | chat statement only | STILL (C25-15) |
| not corrections («خواهرم اشتباه می‌کرد», «فر را دیر روشن کردم», «یعنی اشتباه کردم؟») | — | not read as corrections | good |

## Owner question bank 21–31 (group C)

| # | question | answer this round | where |
|---|---|---|---|
| 21 | A just-built tool is not tested yet — will you tell me? | نیست — sheet #102 | pwC1 |
| 22 | If a built tool does not fit, will it notice? | هست | pwC1, tC1 |
| 23 | Introduce myself first — still my problem from turn one? | هست (intro stripped; but intro line listed in 📜 — C26-13) | pwC1, pwC2, pC1, aC4 |
| 24 | Fix a number days later — every draft, form, destination? | نیمه — forms, drafts, destination, stale numbers ✓ (oC1, s23, s29); step/result texts and prior ledger ✗ (C25-15) | oC1, s23, s29, pwC2 |
| 25 | Invent a pattern while reviewing — keep it as a real problem? | هست | s25, s24, s28 |
| 26 | Child sees only age-appropriate puzzles, no adult comparison? | هست | aC1 |
| 27 | After an unrelated reply, how do I know it did not continue wrongly? | هست | pwC1, tC1 |
| 28 | Does the system know what is planned but not built (the book)? | نیست — sheet #103 | pwC1 |
| 29 | Is my grandchild's mind card separate from mine? | نیست — sheets #101 (aC3), #103 (pwC2) | aC3, pwC2 |
| 30 | Twice-booked prediction counted twice? | answered honestly («نمی‌دانم از این‌جا؛ کارنامه نشان می‌دهد»); not counted twice in what was seen | pwC2 |
| 31 | Long first message with problem + idea + partial solution — how far, each step, fix, continue? | نیمه — finds how far, judges each step, resumes at the first non-✓ (pwC1, pwC2, pC2, s24, s29); her own fix lands late (C26-8), second report not merged (C26-7), missing for pC1/s28 openings | pwC1, pwC2, pC2 |

Also touched from other groups' shares: 1, 2, 3, 8, 9, 10, 12 هست; 6, 11 نیمه (oC1); 17, 19 هست; 18, 20, 36 نیست with sheets (pwC1, pwC2).

## New owner-like questions (not in the bank)

- If a lesson I say in chat is not picked up, where do I see that nothing was kept? (aC4)
- When the page asks «این‌جا هم عوض شود؟», does the proposed text recompute the numbers inside it? (s23)
- After I forget once, why is my next reminder three weeks away? (s29)
- If I ask «open it» and something with the same name already exists, will I get that one — never a second empty one? (pC1)
- Does «حل شد» mean the same thing on the map, in the dossier and on the problem page? (pC1, pC3)
- If a weekday name is part of my problem's wording, will it become an appointment? (s28)
- A parent's view of which steps the child took alone (aC1).

## Class d (mine)

- s21: look-back option regex did not match my replies (fixed, re-run). s22 p9: my retract fix wording (fixed, re-run). pC2: same look-back option (completed by a probe). pC1 p12: wrong action key («key» for «k») — the page correctly reported «انجام نشد». pC3: plan/step forms not run (view stayed on 🧭), look-back not saved. s23: I chose technique 41, the round-25 controls added a technique-28 case from the page. s29: the sketch-attach turn could not run (image file of round 25 missing). tC1: tie and piece-after-closure arms not run.
- Screenshots were taken for every scenario but not reviewed one by one; verdicts rest on page text, state and prompts.

## Routing

259 / 259 turns on the expected task (coach turns lla_coach; system follow-ups, ✏️ turns and navigation commands lla_assistant; consultant learning_architecture) — table in routing.md.

## Prompt scan

248 prompts, 0 with more than one unmarked question instruction.
