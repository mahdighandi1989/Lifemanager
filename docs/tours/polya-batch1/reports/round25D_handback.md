## Pólya round 25, runner D: final report

Everything is in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D/. Each scenario folder has findings.md, DONE, analysis.txt, routing.md, mail.html, mail.subject.txt and a mail.sent marker. The round also has PARTS.md and defects.md.

- **Repo:** not edited. The page was main 64dc0667.
- **Scratch builds:** lla_v2, v3 and v4 in build/ add the territory areas `pr_change_detection` and `pr_noise_smoothing`.
- **E-mails:** all 25 went to the owner. Subjects start «🧭 پولیا · دورِ ۲۵ · …» and each links storyboard D (https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L). I cleaned up the pwD1 and pwD2 bodies before sending, because the generated files had duplicated bullets.
- **STORYBOARD_LINKS.md:** «دورِ ۲۵ D» line added.
- **Cleanup:** only my own browser profiles were deleted. The ai/ folders are kept, and no other runner's processes were touched.
- **Ending and dataset rules:** every scenario ended with {"exit":true}. Every log line carries p<N>. Failed turns have better/rN.txt in pwD1 (r1, r7) and pwD2 (r8).

### RESULT per scenario
| Scenario | Result | Defects (p<N> in findings.md) |
|---|---|---|
| s30 | PARTIAL | D23-11 |
| s31 | PASS | D25-24 (S3) |
| s32 | PASS | «خواستهٔ مسئله» on the route bar (S3) |
| s33 | PASS | D25-24 (S3) |
| s34 | PASS | none |
| s35 | PASS | none |
| s36 | PARTIAL | D25-19 (S2): the stale-number check treats data percentages as computed and suggests wrong recomputations |
| s37 | PASS | D25-24 (S3) |
| s38 | PARTIAL | D25-18 (S2): correcting the deadline time sets the math result aside; D23-12 (S3): a corrected lesson is still appended to the old one |
| dp1 | PASS | a guess stays «آزموده نشده» on the map after she tested it (S3) |
| dp2 | PASS | D25-24 (S3) |
| dp3 | PASS | D23-38 (S3) |
| aD1 | PASS | D25-22 (S3): the child's school name is kept in 📜 |
| aD2 | PASS | D23-30 (S3) |
| aD3 | PASS | D24-15, D25-23 (S3): «شما» and «تو» in one sentence |
| aD4 | PASS | D25-20, D25-25 (S3) |
| oD1 | PASS | D23-10, D24-9 (S3) |
| oD1n | PASS | none |
| oD1b | PASS | a fragment of her message filed as data (S3) |
| oD1r | PASS | none |
| oD1g | PASS | none |
| oD1t | PASS | none |
| oD1u | **FAIL** | **D25-21 (S1)** |
| pwD1 | PARTIAL | D25-1, 2, 3, 4, 5, 7, 24 (S2); D25-8, 9, 10, 11 |
| pwD2 | **FAIL** | **D25-12 (S1)**; D25-13, 14 (S2); D25-15, 16, 17 (S3) |

**Totals:** 18 PASS (5 of them zero-defect: s34, s35, oD1n, oD1r, oD1t), 4 PARTIAL, 2 FAIL.

### ارتقای لازم (upgrades needed, by priority)
1. **D25-21 (S1, oD1u).** The territory match accepts a half-fitting area on shared generic words such as «نویز/عدد/آر/پنجره». The fragment «آر» should be dropped by token cleaning, and generic words should get low weight. An unclear fit must lead to a question to her. When she says «نه، همون نیست» (sys_fit false), the step must go back to waiting and the sheet must reopen. Today it is marked «از سر گرفته شد».
2. **D25-12 (S1, pwD2).** arithChk reads a sum of fractions wrongly: it compares only the first fraction on the right with the left side. Examples it called wrong: 4/2 = 1/1 + 1/2 + 1/2, and 7/1460 = 1/210 + 1/30660. The check must evaluate the whole right-hand side.
3. **Prior-work verdict ledger (D25-1, 2, 4):**
   - When she accepts one verdict and rejects another in the same reply, each step needs its own state. Today both get «رد کردی».
   - Her own correction must be applied.
   - A new report must append to the ledger, not replace it.
4. **D25-3.** chkM (the coach-only note that holds the correct number) must not appear in 📜.
5. **D25-7.** Closing a problem that was solved in chat must not ask again for the 7 frame fields she already gave.
6. **D25-18 and D25-19.** The stale-number mechanism must be limited to facts the result actually depends on. A deadline time is not one of them, and data percentages are not computed numbers.
7. **D25-13.** An explicit «می‌خوام … مثلِ یه مسئلهٔ واقعی پیگیری کنم» must be accepted as a request to create the problem (chat_invent).
8. **D25-14.** A quote of her formula written in TeX must count as a correct quote.
9. **D25-24.** The prior-work report line must fire only in turns that carry a prior report.
10. **D25-6.** The opening prior-work message should not trigger A191.
11. **S3 items:**
    - D25-22: the child's school name is kept in 📜.
    - D25-23: «شما» and «تو» appear in one sentence.
    - Text fragments are stored as data, and plan steps are fragments.

### Round-24 defect table
| Defect | Status | Evidence |
|---|---|---|
| D24-1 | FIXED | oD1n c-sheet: «پاسخِ روتین … جواب نداد … گام منتظر می‌ماند» |
| D24-2 | FIXED | oD1b: «✓ … از راهِ دیگری برداشته شد» plus a note under the sheet |
| D24-3 | FIXED | see findings for p<N> |
| D24-4 | FIXED | see findings for p<N> |
| D24-5 | FIXED | see findings for p<N> |
| D24-6 | FIXED | see findings for p<N> |
| D24-7 | FIXED | aD4 p3: «مغزم کار نمی‌کنه» recognised as a self-label |
| D24-8 | FIXED | see findings for p<N> |
| D24-10 | FIXED | see findings for p<N> |
| D24-12 | FIXED | see findings for p<N> |
| D24-13 | FIXED | see findings for p<N> |
| D24-14 | FIXED | oD1 p19: one prediction gives one record |
| D24-9 | CHANGED | oD1 c40: the plan step is now a fragment of the prediction sentence |
| D24-11 | CHANGED | see findings for p<N> |
| D24-15 | CHANGED | aD3: «شما» in the first half of the sentence, «تو» in the second |

Older round-23 items:
- **FIXED:** D23-5 (✏️ no longer changes the divisor role).
- **STILL:** D23-10, D23-11, D23-12, D23-30, D23-35, D23-38.
- **CHANGED:** D23-18, D23-21, D23-34.

Full table with p<N> is in round25D/defects.md.

### Territory arms
| Arm | Scenario | Verdict |
|---|---|---|
| Positive (the area is built for real) | oD1 | PASS. «🛎 ابزارِ لازم آمد» in «امروز»; the same step resumes. |
| Unrelated reply (Fermi estimates) | oD1n | PASS. Stays waiting and the sheet reopens; D24-1 FIXED. |
| (a) Reply names a ruled-out area | oD1r | PASS. «… برگه همین را کنار گذاشته بود» |
| (b) Reply shares only generic words | oD1g | PASS. «⏳ ساخته‌اش هنوز در سامانه دیده نمی‌شود» |
| Two areas arrive, best fit must win | oD1t | PASS. `pr_change_detection` chosen (6 shared words). |
| Unclear fit, page must ask her | oD1u | **FAIL, S1 D25-21.** It declared «رسید» on generic words and resumed the step after her «نه». |
| System-self sheets never mark her step as waiting | oD1 c46 | PASS. Sheets #102 (book) and #103 (parts image) put no step on hold. |
| sys_done (she found her own way) | oD1b | PASS |

### Prior-work verdicts
| | pwD1 (owner-like, rejects a verdict, returns on day 4) | pwD2 (Erdős–Straus, partial attack) |
|---|---|---|
| Verdict per step | ✓ 5 steps, dependencies, unit check without giving the answer away | ✓ steps 1–3 correct, 4 wrong, 5 dependent |
| Rejection, then a second check | ✓ kept its position, with reasons | — |
| Her return with a new step | ✓ day 4, her own data, a verified plan of 55 minutes a day | ✓ reached the exact sticking point (primes ≡ 1 mod 24 such as 73); said honestly «حل نشد» |
| Defects | Mixed reply marked «رد کردی» on both steps; her correction not applied; ledger overwritten; chkM in 📜; 7 fields asked again to close | S1: correct fraction sums read as wrong (twice); the request to track the problem refused at first; TeX quote rejected |
| Result | PARTIAL | FAIL |

### ONE STORY (chat first, then the live page)
Checked in pwD1, pwD2, oD1 and dp1.
- **pwD1: partial.** The page shows the chat stage ahead of the form, but closing asks again for 7 fields (D25-7) and the ledger is overwritten.
- **pwD2: partial.** The new problem opens with u0 («کلِ مسئله…؟») even though its statement is her own sentence. The main 🧭 still says «حدس · آزموده نشده».
- **oD1: PASS.** 🔭, 🧭, 📜 and «امروز» tell the same story.
- **dp1: PASS.** The «مجهول» draft is her own correct sentence.

### Owner question bank (25–31)
| Q | Scenario | Verdict |
|---|---|---|
| 25 | pwD2 | Partial. Refused at first, created after «ثبتش کن». |
| 26 | aD4 | «نیست» (the page knows only one person), honest, plus build sheet #101 |
| 27 | oD1n | «هست», with evidence in three places |
| 28 | oD1 | Partial: it shows only open sheets |
| 29 | aD4 | «نیست», plus build sheet |
| 30 | oD1 | A repeated prediction is counted once (fixed) |
| 31 | pwD1, pwD2 | Partial |

### Routing
0 wrong in every scenario (each routing.md). The round-24 miss at s37 p14 is fixed: the late practice report now goes to `lla_coach`.

### PARTS.md «نسبت به دورِ ۲۴» (compared with round 24)
- **Better:**
  - The territory loop: 6 of 7 arms pass, with one new S1 in the unclear-fit arm.
  - 🧭 route map and bar.
  - Age and pronoun handling.
  - The prerequisite layer.
  - The assistant's post-check.
  - The turn question.
  - The 📜 dossier.
  - The prediction ledger.
  - Category routing.
- **Same:**
  - Form ⇄ chat: the round-24 knots are fixed, but new ones appear when closing.
  - The mind card.
  - «امروز» (already good).
  - Formula input and display.
- **Mixed:** ✏️ and corrections. One fix, and two new regressions from the stale-number mechanism (D25-18, D25-19).
- **New:** prior-work verdicts (R8), with one S1 (D25-12) and several S2 ledger problems.

### New owner-like questions
1. «اگر بخشی از جوابم را قبول کنم و بخشی را نه، صفحه هر کدام را جدا نگه می‌دارد؟»
2. «حکم‌های قبلیِ کارِ من کجا می‌روند وقتی گزارشِ تازه می‌دهم؟»
3. «وقتی صفحه حسابِ درستِ مرا نادرست می‌خواند، از کجا بفهمم خطا از صفحه است نه من؟»

### Time and tokens
About 1.5 hours of wall time. Token use is not visible beyond the running counter.