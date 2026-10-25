Round 24, runner A: done. I ran 19 scenarios on main eee4ff0f; the build check said in sync and the dist was newer than the merge. The repo is untouched (`git status` is clean; one stray notes file I had left in the repo root was moved into round24A/notes.md). No harness or browser profile of mine is still running or left on disk. The ai/ folders are kept.

**E-mails were not sent.** The Gmail send was refused by the permission classifier ("Excess Sensitive Detail"). Each scenario has `mail.html` and `mail.subject.txt` instead, in the RUNNER16 format with the group-A storyboard link.

All paths are under /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A/:
- `<sid>/findings.md` (all required sections), `RESULT.txt`, `DONE`, `route_table.md`, `better/r<N>.txt` (50 files)
- `defects.md` (catalogue plus the full round-23 FIXED/STILL/CHANGED table), `PARTS.md` (with «نسبت به دورِ ۲۳»), `notes.md`
- `tA1_build/learning-architecture.html` (the scratch page used to simulate the territory build)
- A line for this round was added to STORYBOARD_LINKS.md.

**Results: no S1. 2 scenarios have S3 only; 17 have at least one S2.**

| sid | RESULT |
|---|---|
| s01 | FAIL — A23-20 (S2), A24-8 (S3) |
| s02 | FAIL — A23-20 ×2, A24-1, A24-3 (S2) |
| s03 | FAIL — A23-35 (S2); A23-24, A24-9 (S3) |
| s04 | FAIL — A23-6 at p9, A24-9 (S3) |
| s05 | FAIL — A22-11, A21-11 (S3) |
| s06 | FAIL — A23-25 (S3) |
| s07 | FAIL — A22-17 (S2); A23-24, A24-9 (S3) |
| s08 | FAIL — A24-2 (S2) |
| s09 | FAIL — A23-35 (S2); A23-26 (S3) |
| s10 | FAIL — A23-8 only (S3) |
| pA1 | FAIL — A23-35 (S2); stack line says «مجهول» for a proof (S3) |
| pA2 | FAIL — A23-8 only (S3); prerequisite checks P1 and P2 pass |
| pA3 | FAIL — A23-8 only (S3); P1 and P2 pass, nested order now correct |
| aA1 | FAIL — A23-19, mastery rewrite, A24-18 (S3) |
| aA2 (look-back) | FAIL — A23-10, A24-20 (S3) |
| aA3 | FAIL — A24-7 (S2); A23-14 (S3) |
| aA4 (new, 81-year-old tailor) | FAIL — A23-35 (S2); A24-10, A23-14, A24-13, A23-8 (S3) |
| tA1 | FAIL — A24-4, A24-5, A23-35 (S2); A24-14, A24-15 (S3) |
| oA1 | FAIL — A23-32, A24-6, A23-35 (S2); A24-16 (S3) |

**New S2 defects (all class b, page)**
- **A24-1** — s02 p8: «… به کار بردم … دیگه نمی‌دونم چی کار کنم» is read as a keep/use report, so the stuck person gets no turn question.
- **A24-2** (regression) — s08 p3: a silent «...» drops the whole coach block.
- **A24-3** (regression) — s02 p10: the statement becomes «۱۵۰ ارتفاع داره»; the unit «سانت» is lost. The form datum correctly became «۱.۵ متر».
- **A24-4** — tA1 negative arm: a routine reply on sheet #101 that names only `farm` makes the page declare «🛎 ابزارِ لازم آمد: استدلالِ علمی و آزمونِ فرضیه» and add a Today line.
  - Cause: the a44 `sysSheet` code collects ids from all sheet notes, including the sheet's own filing text, and accepts generic shared words («هیچ»).
- **A24-5** — tA1 positive arm: after the real area `sp_prior_art_search` was built, the page resumed step 6-ب with the wrong new area («سنجشِ ایمنی…»). The first hit with two generic words wins, not the best one.
- **A24-6** — oA1 p15–16: an unrelated self-knowledge gap sheet marks the job-decision step as «⏸ منتظرِ برگهٔ #۱۰۲».
- **A24-7** — aA3: the chat import files her rejected first schedule as «داده» and leaves out the real data.

**Round-23 S2 defects still open**
- **A23-35** — the live-problem stage in the prompt does not advance from chat. The whole-first question is gone, but a stale «مجهول/حکم چیست؟» repeats in s03, aA4 (5 times, even after the purchase), tA1, oA1, s09 and pA1 p9.
  - Evidence: in s03, `liveStoryPhase` is «c» while the prompt says «فهمِ مسئله».
- **A23-20** — the post-check still counts the page's own two-sentence question as two (s01, and two new cases in s02).
- **A23-32** — oA1: the route map of the job decision shows the handshake problem's guess, steps and destination.
- **A22-17** — s07: the typed form row stayed at «۱۶» after the ✏️ edit and was not asked.

**Round-23 fixed in round 24:** A23-1, -2, -3, -4, -9, -11, -12, -13, -16, -17, -18, -22, -23, -28, -29, -30, -31, -36, -38, and A22-12. Changed (partly fixed): A23-6, -7, -8, -15, -21, -27, -34, -37. Still open: A23-10, -14, -19, -24, -25, -26, A22-11, A21-11, the tA1 p5 re-asked check, and the pA1 stack wording. The full table with turn evidence is in defects.md.

**Age (all stored dates match ICU's Persian calendar)**
- aA1, card: «۳۱ اسفند ۹۵» refused with «اسفند ۳۰ روز دارد — روز را دوباره ببین.»; «1395/12/12» ⇒ 2017-03-02. In chat, «تولدم ۱۲ اسفند ۹۵» gave the same date.
- aA2, card: «۳۱ بهمن ۸۸» refused. In chat, «۱۹ بهمن ۸۸ به دنیا اومدم» was saved by the page itself ⇒ 2010-02-08. Mind-card field «1388/11/19» gave the same date.
- aA3: «۳۱ مهر ۱۳۳۸» refused; «۲۰ اردیبهشت ۱۳۳۸» ⇒ 1959-05-11. In chat, «1338/2/20» gave the same date.
- aA4: the birth action {«۱۵ تیر», 81} ⇒ 1945-07-06.
  - «هشتاد و یک سالمه» (age in words) is not read.
  - The mind-card field silently refuses «۱۳۲۴/۴/۵۱» with no message.
- Bands, «# مخاطب» blocks, minors' safety and the no-norm line are correct.
- Register is still wrong in page-written lines (card, system lines, some turn questions) for «شما» elders.

**Territory loop (tA1).** The build was simulated through a real path: a scratch copy of the page with two new territory-registry areas, plus routine notes «پاسخ به برگهٔ دستیار #n», loaded with the harness reload.
- Waiting markers on 🔭, 🧭 and 📜: work. The dossier names the wrong waiting step for #101.
- Negative arm: fails (A24-4).
- sys_done arm: works — state becomes «other» with her quote and the Today line goes away.
- Positive arm: the page notices the build, writes the Today line and resumes, but picks the wrong tool (A24-5).

**Chat ⇄ page**
- aA1 and aA4: forms show «از گفت‌وگو: … — درست است؟». The «مجهول» field is not filled from chat and the stage chips stay unticked.
- aA3: the import is wrong (A24-7).
- Route map shot at three moments in aA1, two in aA4, one in aA3.

**Owner question bank (group A, oA1)**
- #1 corrections: works — evidence p7.
- #2 one place for all steps: works — «📜 پروندهٔ کامل», p8–p9.
- #3 mind card and «از کجا؟»: works — p12–p14.
- #4 «is it the weak model or the method — has it been measured?»: not in the system. The assistant said so honestly and filed sheet #102 with the consultant's agreement (p15–p16).
- Also #10/#11 (offline, storage, model independence) now answered with evidence; #8 route map exists but is wrong.

**Corrections vs round 23.** Better overall:
- oA1: pinned goal and the result 45 now follow.
- s02: form datum asked and fixed.
- s07: live statement now follows.
- Deadline and plan changes work.

Still wrong:
- s02: unit lost in the statement.
- s07: form row not changed or asked.
- «why» quotes are emptied and change lines are duplicated.

**Routing:** 218 of 218 turns correct; round 23 had 2 wrong.

**Main «ارتقای لازم»**
1. Build the live-problem prompt stage from `A.liveStoryPhase`, import the chat unknown, and never ask u1 once the unknown or claim has been stated.
2. Territory matching: read only the routine's reply, ignore generic words, take the best match, and confirm with the person before resuming.
3. Bind every session event to its own problem in the route map.
4. Count the page's own two-sentence question as one.
5. Read number words for age.
6. Use «شما» by default for elders when there is no pronoun evidence.
7. Keep the unit when a corrected number is written into the statement.

**New owner-like questions for the bank**
- «وقتی وسطِ یه مسئله یکی دیگه آوردم، از کجا بفهمم نقشه و پرونده و کارنامه هر کدوم مالِ کدومه؟»
- «برگه‌ای که ثبت کردی کی جواب می‌گیره و من از کجا می‌فهمم؟»
- «اگه پیش‌بینیم غلط درومد، کارنامه کجا نشون می‌ده اطمینانم زیاد بوده؟»