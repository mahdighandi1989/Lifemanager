## Round 24, runner D: 19 runs, none zero-defect; one new S1 in the territory loop; no e-mail sent

**Runs:** the 16 round-23 scenarios replayed (s30–s38, dp1–dp3, aD1–aD3, oD1), a new age scenario aD4 (age 81), and two split-off territory-loop runs: oD1n (negative arm) and oD1b ("I found another way" arm). That is 19 runs; the oD1 replay itself is the positive arm.

**E-mail:** Gmail sending was refused by the permission classifier ("Real-World Transactions"). I tried once and did not retry. Every run has `round24D/<sid>/mail.html` and `mail.subject.txt` (subject «🧭 پولیا · دورِ ۲۴ · …», storyboard link D) for a session that is allowed to send.

**Setup:**
- Page was main eee4ff0f; dist built at 21:21; `build.py --check` in sync. Time moved with the in-page Date patch.
- Old replies came from round23D. New replies were written only where round-24 rules needed them:
  - birth action "as she said it";
  - `gap.step`;
  - the oD1 turns that the new loop, auto-booked prediction and kept promise made false (p10/12/13/14/15/18);
  - bank questions 13–15;
  - all of aD4.
- Every run has `findings.md` (with the round-23 defect lines, need maps, «ارتقای لازم» and «ایده‌ها»), `routing.md`, `analysis.txt` and `DONE`.
- Shared files: `defects.md` (D24-1…15 plus the full D23 table), `PARTS.md`, and a new line in `STORYBOARD_LINKS.md`.
- `better/r12.txt` exists for s31 and dp3. The `ai/` folders are kept; browser profiles are deleted and none of my processes are running.
- All paths are under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24D/`.

### Results
| Run | Result | Main points |
|---|---|---|
| s30 | PARTIAL | D23-11 (S3). D23-3 fixed. |
| s31 | PARTIAL | D24-4 (S2). |
| s32 | PASS | D23-21 changed to a generic destination. |
| s33 | PASS | D23-1 and D23-22 fixed. |
| s34 | PASS | Only the shared S3 birth-line defect D24-5. |
| s35 | PASS | D23-6 fixed. |
| s36 | PASS | D23-9 and D23-12 fixed. |
| s37 | PARTIAL | D23-5 still there (S2); D24-13 routing regression (S2). D23-4 fixed. |
| s38 | PASS | D23-12 changed: the lesson fix is appended, not replaced. |
| dp1, dp2, dp3 | PASS on prerequisite criteria | S3 leftovers, and D23-38 is still there in dp3. |
| aD1, aD2, aD3 | PASS | aD2 also keeps D23-30. |
| aD4 (new, 81) | PARTIAL | D24-9 (S2). |
| oD1 | PARTIAL | D24-2 and D24-3 (S2). |
| oD1n | FAIL | D24-1 (S1). |
| oD1b | PASS on sys_done | S3 leftovers. |

### New defects
- **D24-1 (S1), oD1n, `a44_route.js` sysSheet:** a routine reply naming an unrelated area (`pr_estimation_fermi`) produced «🛎 ابزارِ لازم آمد: «بازنماییِ مسئله»» and set the entry to arrived.
  - Cause: it reads all sheet notes, including the sheet's own text, which names `pr_representation`.
  - It then matches on generic words (مسئله / تغییر / واقع / نمودار / ابزار).
  - Effect: the person is told a tool arrived when nothing was built, and a real build later will not be checked.
- **D24-2 (S2), oD1 p13 and p21:** a gap sheet without `gap.step`, filed while a problem is in focus, marks the current step "waiting".
  - Seen as «زیرمسئلهٔ ۲: آزمونِ ۲۰+۲۰ منتظرِ برگهٔ #۱۰۲», and again for #103.
  - The next prompt then tells the model to report that step as waiting.
- **D24-3 (S2), oD1 c11/c15 and oD1b:** the first validated chat result of a sub-problem sets the whole problem to look-back.
  - The route map shows «اکنون: بازنگری» together with «طرح هنوز نیست».
  - Location: `a45_story.js:110` (phaseOfItems).
- **D24-4 (S2), s31 p12:** the assistant says «سه مسئله‌ات هنوز ثبت نشده‌اند» right next to the page line «🔭 نگه داشتم».
- **D24-9 (S2 in aD4, S3 elsewhere):** route "plan steps" are sentence fragments of her messages.
  - In aD4 this includes «گامِ ۶ ِ طرح: من ۵ تیر ۱۳۲۴ به دنیا اومدم».
  - My `said: plan` report at aD4 p2 was debatable (class d), but cutting the whole message into steps is the page's doing.
  - The cut can fall mid-phrase («…وزنِ پایدارِ» | «از بستنش»).
- **D24-13 (S2), s37 p14:** a practice report with a new solution went to lla_assistant (regression).
- **S3:**
  - D24-5: the birth confirmation shows twice, shows an ISO date to the person, and page lines use «تو» in «شما» conversations (elders, dp3 «نه توانِ تو», «ببین», «سلیقه‌ات»).
  - D24-6: «🎯 ثبت شد (موعد ۲۰۲۶-۱۰-۲۱)».
  - D24-7: «پیر شدم، مغزم … کار نمی‌کنه» is not recognised as a self-label.
  - D24-8: the dossier wait event keeps «سرانجام: منتظر» after the tool arrived.
  - D24-10: the mind card shows no "no valid norm for this age" line for ages 9/14/67/81.
  - D24-11: a guess she refuted herself stays «آزموده نشده».
  - D24-12: a chat sentence is put into the wrong form field.
  - D24-14: one prediction creates two 🎯 records.
  - D24-15: a stale «مجهول چیست؟» suggestion.

### Round-23 defect table (evidence in `defects.md`)
- **FIXED:** D23-1, 2, 3, 4, 6, 7, 8, 9 (s36), 12 (s36), 13, 14, 15, 16, 17, 20, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 35 (oD1), 36, 37 (built, but see D24-1), 40.
- **STILL:** D23-5 (worse), 10, 11, 18, 30, 34, 38.
- **CHANGED:** D23-12 (s38), D23-19, D23-21.
- **N/A:** D23-39.

### Age (Jalali checks)
- Every stored date matches ICU:
  - aD1: «۵ اردیبهشت» plus «۹ سالمه» ⇒ 2017-04-25.
  - aD2: «۲۰ مهر ۱۳۹۱» said in chat, saved by the page ⇒ 2012-10-11.
  - aD3: card «12/5/1338» in Latin digits ⇒ 1959-08-04 (round 23 was a day off).
  - aD4: «۵ تیر ۱۳۲۴» in chat ⇒ 1945-06-26.
- Invalid days got human error lines: «۳۰ اسفند ۹۶» ⇒ «اسفندِ ۱۳۹۶ ۲۹ روز دارد…», «1391/07/31» and «۳۱ مهر ۱۳۲۴» ⇒ «مهر ۳۰ روز دارد».
- «امتحان ۲۰ دی» was not mistaken for a birthday.
- The «# مخاطب» blocks for child, teen and elder are correct; the adult-normed daily puzzle was not offered to the child; the child's name is not in the title.
- **Not met:** the page uses «تو» with elders and «شما» users (D24-5), and the honest no-norm line is missing (D24-10).

### Territory loop
- **How I simulated the build:** (1) a routine note «پاسخ به برگهٔ دستیار #101 …» with status answered in `sheets/sh101.json`; (2) a scratch copy of the page, `build/lla_v2.html`, with a real new registry area `pr_change_detection`, reloaded through `harness6` with `LLA_HTML`. No page internals were touched.
- **Positive arm (oD1):** works end to end.
  - The waiting marker shows in 🔭, 🧭 and 📜.
  - The page noticed the new area, verified it, wrote «🛎 ابزارِ لازم آمد» in chat and in Today, and the route map shows the return.
  - p7 resumed the exact step, and he finished the problem.
- **Negative arm (oD1n):** FAIL, see D24-1.
- **sys_done arm (oD1b):** works — «از راهِ دیگری برداشته شد ✓», shown in the dossier and on the route.

### Chat ⇄ page (oD1, dp1, aD1)
- The forms show «از گفت‌وگو: «…» — درست است؟ ✓ درست است ✏️ ویرایش», and nothing was asked twice.
- The stage does not match in oD1 (D24-3), and dp1 has the wrong-field fill (D24-12).
- oD1 route map shot at three moments: c11, c15 and the end.

### Owner question bank (13–15, asked in oD1)
- **13, companion book for all ages:** «نیست». Sheet #102 filed with reasons and a second opinion. It triggered the fake wait D24-2.
- **14, pictures of how each part worked and improved:** partly exists — 🧭, 📜 and «از کجا؟». Comparison with earlier versions is missing, so sheet #103 was filed.
- **15, e-mail report per scenario:** «📧 گزارشِ تور» only during a tour; otherwise the dossier as HTML or print.
- **Also answered with evidence:** questions 1, 2, 3, 8, 9 and 10, plus "do you remember?" and "exactly where is it recorded?".
- **New questions for the bank:**
  - «جوابی که ربطی به گامم نداشت، از کجا بفهمم سامانه اشتباهی ادامه نداده؟»
  - «سامانه می‌داند چه چیزی برنامه‌ریزی شده ولی هنوز ساخته نشده (مثل کتاب)؟»
  - «کارنامهٔ نوه‌ام از من جداست؟»
  - «یک پیش‌بینی که دو بار ثبت شد، دو بار در کالیبراسیونم حساب می‌شود؟»

### Corrections vs round 23
| Scenario | Trial | Round 23 ⇒ 24 |
|---|---|---|
| s30 | copy typed with different wording | ✗ ⇒ ✓ |
| s35 | deadline "what" part | ✗ ⇒ ✓ |
| s36 | dependent guess | ✗ ⇒ ✓ |
| s37 | masked digits | ✗ ⇒ ✓ |
| s37 | ✏️ multi-number | ✗ ⇒ ✗ |
| aD3 | refuted own result | ✗ ⇒ ✓ |
| oD1 | neighbouring words | ✗ ⇒ ✓ |
| s34, s38 deadline, s38 non-corrections | as before | ✓ ⇒ ✓ |

### Routing and prompt scan
- 1 wrong out of 195 turns (s37 p14).
- The strict prompt scan found no second unmarked question directive. The one dp1 p3 flag is a line already marked «زمینه (نه پرسشِ دوم)».

### PARTS.md, compared with round 23
- **New:** the territory loop and the chat ⇄ form story.
- **Much better:** age.
- **Better:**
  - routing
  - prerequisite layer
  - correction engine (6 fixed, 1 still failing)
  - Today
  - dossier
  - mind card
  - 🎯 prediction log (now auto-booked)
- **Same:** post-check, turn question, practice, running lists.
- **Mixed:** the route map — better structure, wrong «اکنون».

### My own mistakes (class d)
- In aD4 I reported `ph: b` and `said: plan` where `e` / check would have been better.
- In oD1 I wrote my m5 guess text in paraphrase, so the page correctly refused to book it.
- The first oD1 attempt is kept as oD1n. My process-kill helper matched oD1b by prefix and killed it; I fixed the helper and re-ran oD1b from scratch.