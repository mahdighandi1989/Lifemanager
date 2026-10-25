# Round 25 — runner B_s (Sonnet) — defect catalogue B25·Dn + round-24 table
Build main 64dc0667 (`build.py --check` in sync; dist newer). Replays of round24B/<sid> ctl with round25B_s/tools/drv.py; new scenarios pwB1, pwB2 (prior work), tB1c/tB1d/tB1s (territory arms), oB1 (bank 9–16), aBx/aBf (birth probes).

## S2
- **B25·D1** pwB2 p1 (🔭 block + 📜): step 4 «−۳ + ۴۲ = ۳۹» — page's arithmetic check drops the Unicode minus «−» and prints «حسابِ «۳ + ۴۲» با «۳۹» نمی‌خواند»; 📜 even shows the coach-facing «(حسابِ صفحه: ۳+۴۲=۴۵، نه ۳۹ (عددِ درست را لو نده))» next to «جمع درست است». a45_story arithChk (ASCII «-» only) / dossier uses chkM.
- **B25·D2** pwB1 p3–p7, pwB2 p3–p4: prior ledger blind to her own fix and dispute loop never closes — step 2 stays «✗ نادرست» after she corrected the unit in chat (p3); page says «چیزی برای عوض کردن نبود»; a button misclick «✗ نه» on step 6 cannot be withdrawn (her words «اشتباهی زدم»), `reAt` is never set ⇒ the turn question «حکمِ گامِ ۶ را رد کردی — به چه دلیل؟» is asked p4–p7 (five turns); pwB2 p3/p4 resume question for step 3 is asked after she redid step 3.
- **B25·D3** pwB1 p1: unknown imported from her opening sentence («مجهول: یه مسئله دارم که نیمه‌کاره‌ست…», 🧭 destination the same); her steps imported as «داده» fragments; pwB2 p5 the missing criterion (mother's dialysis) stored nowhere.
- **B25·D4** pwB1 p1 turn question = guess test («چطور می‌آزمایی‌اش؟»), pwB2 p1 = whole-first («کلِ مسئله را در یک جمله…») although she already gave problem+idea+steps; the prior contract's resume point is not the page question.
- **B25·D5** pwB1, pwB2: mind card «از کجا؟» credits only «نتیجه‌ای که گفت»; her correct prior steps (pwB1 step 1; pwB2 steps 1–2) are not booked; «بازنگری: هنوز داده‌ای نیست» despite her lesson.
- **B25·D6** stage/strip behind the story: aB3 six months later strip «اجرای طرح» while prompt says «بازنگری»; tB1/tB1c/tB1d «اکنون: اجرای طرح · مانده: نامعلوم — طرح هنوز نیست»; pwB1 form «گفت‌وگو تا «اجرا» جلو رفته» after full solution (route says بازنگری).
- **B25·D7** pwB2: «امروز» shows «📌 برنامهٔ خودت … موعد: ۱۰ آبان — انجام شد؟» (a date she never gave, +7d) and never her own dates («پنجشنبه»، «۲۰ بهمن»); the model has no action to register a chat check date.
## S3
- **B25·D8** elders get «✓ تاریخِ تولدت ثبت شد» (s12 c2, aB4 c3, aBx) — R5 says «شما».
- **B25·D9** s12 p10 register post-check flags «عالی. وارسی؟» (noun + «ی» + «؟»).
- **B25·D10** two-question page questions STILL: s13 p7, s19 p5–p7/p15, aB3 p13; s19 p8–p16 «این گام جواب نداد؟» nine turns while she succeeds.
- **B25·D11** s18 p4 dangling «پرسشِ این نوبت همان «پیشنهادِ این نوبت» است».
- **B25·D12** s11 p5 ask list names «صورتِ مسئله» twice.
- **B25·D13** tB1 📜: «ابزارِ لازم آمد» under ۴ آبان (arrived ۹ آبان); the three intermediate checks (a, a2, b) are missing.
- **B25·D14** tB1d: asks her about pr_prior_a («تا آن وقت گام منتظر می‌ماند») and in the same pass «ابزارِ لازم آمد» for pr_prior_b.
- **B25·D15** tB1 arms a/a2/b: «ساخته‌اش هنوز در سامانه دیده نمی‌شود — شاید منتشر نشده» for a reply that names a ruled-out area / only generic words; she is not told the reply did not answer her step.
- **B25·D16** follow-up «[سامانه: «🗺 قلمروِ سامانه‌ها» باز شد. فیلدها را پر کن…]» for a view without fields (tB1/tB1c/tB1d p10) — A24-16 STILL for sterr.
- **B25·D17** s19 c81 weight result set aside because of «۱۶ هفته».
- **B25·D18** chat guesses: the model is never given open guess ids (pwB2 p3) ⇒ no outcome; route «آزموده نشده» ×2 (duplicate).
- **B25·D19** route duplicates (aB2/aB4 نتیجه ×3، بازنگری ×2؛ tB1 syswait/cunk ×2).
- **B25·D20** s15 strip «اکنون: فهمِ مسئله · مقصد: چیکار کنم؟».
- **B25·D21** pwB1 p3: chat says nothing recorded to change, 📜/🧭 draw «اصلاحِ پیامِ پیشین».
- **B25·D22** s16 c8 evlog lost «داده (از گفت‌وگو)».
- **B25·D23** aB1 📜 repeats her message ×3 and keeps «کلاس سوم الف» for a minor.
- **B25·D24** pwB1 p4 «گامِ ۵ رو قبول ندارم …» not parsed as a dispute (only messages starting with «نه»).
- **B25·D25** pwB2 p3/p4 turn question leaks the verdict's reason («فرضِ پنهان …») and is cut with «…».
- **B25·D26** aBx p2: the model's prose says «۲ مهٔ ۱۹۵۹» while the page stored 1959-05-03; no check of the model's stated date.

## Round-24 B table
| id | verdict | evidence |
|---|---|---|
| D1 | FIXED | aB1 c3 «96/2/30»⇒2017-05-20; aB2 c4 «88»⇒2010-03-08; aBf «17 Esfand 1388» ✓ |
| D2 | CHANGED | aB3 p11–p12 no re-ask; prompt stage reaches بازنگری; strip lags (B25·D6); tB1 p11 no re-ask |
| D3 | FIXED | tB1/tB1c/tB1x no «گامِ N ِ طرح» points |
| D4 | FIXED | s18 p11 re-check question kept |
| D5 | FIXED | s19 c81 asks «۱۸ به‌جای ۱۶» for weeks only |
| D6 | FIXED | no ISO, no duplicate line (aB1, aB2, s11…) |
| D7 | FIXED | aBx: model ISO 1959-05-02 did not override page's 1959-05-03 |
| D8 | FIXED | aB4 p1 «از سنی که خودش گفت» |
| D9 | FIXED | s13/aB4 no promise block |
| D10 | FIXED | s11 no rewrite; bp1 p3 guillemets kept |
| D11 | FIXED | aB4 rewrites ask «شما» not «تو» |
| D12 | STILL | B25·D10/D11 |
| D13 | FIXED | s14 «امروز» without exam question |
| D14 | CHANGED | «آزموده نشده» gone from route in aB2/aB4/tB1 but no outcome; pwB2 still (B25·D18) |
| D15 | FIXED | bp1 p12 no guess question |
| D16 | CHANGED | s17 values present; s11 duplicate STILL (B25·D12) |
| D17 | FIXED | s11 c49 «کهنه پس از اصلاح … ۱۰۰ ⇒ ۶۴» |
| D18 | STILL | B25·D13/D19 |
| D19 | FIXED | tB1 built=[view:mind]; tB1x page line + sheet note |
| D20 | FIXED | bp2 one row «در ۳ نوبت» |
| D21 | CHANGED | s15 no invented plan; strip STILL (B25·D20) |
| D22 | FIXED | aB3 import no correction message |

## Territory arms (tB1 family)
| arm | run | verdict |
|---|---|---|
| positive (pr_prior_art) | tB1 | PASS «🛎 ابزارِ لازم آمد» + resume p9 |
| sys_done | tB1x | PASS (+ page line, sheet note) |
| unrelated reply (view mind) | tB1 | PASS mismatch, reopened |
| NEW (a) ruled-out area epi-claims / factory | tB1 | PASS no resume; D15 wording |
| NEW (b) generic words | tB1 | PASS no resume; D15 wording |
| two areas, best fit | tB1c | PASS pr_prior_art wins |
| two areas, tie | tB1d | PARTIAL asks but also resumes (D14) |
| system-self sheet (book) while waiting | tB1s, oB1 | PASS never marks a step |
Simulation: sheets/sh101.json routine notes + scratch copies of the dist (scratchpage*/) with real new areas in SYS_TERR.

## Prior-work verdicts
| scenario | verdict | |
|---|---|---|
| pwB1 (deep, unit slip) | FAIL | steps judged ✓/✗/dep/incomplete, resume step 2, forms/🧭/📜 ✓; D2–D5 |
| pwB2 (deep, missing criterion, multi-day) | FAIL | reached verified decision+prediction; D1–D5, D7 |

## Owner bank 9–16 (oB1)
| # | answer | where | p |
|---|---|---|---|
| 9 | هست (برگه، ⏸، ابزارِ لازم آمد) | tB1; oB1 p12-p13 | tB1 p9 |
| 10 | هست: مستقل از مدل | «خودِ سامانه» | oB1 p14 |
| 11 | بخشی: آفلاین بله؛ مدلِ محلی/خودساخته «در اطلاعاتِ من نیست» | oB1 p15 | |
| 12 | هست با دو کمبود (پیشینه=برگه، سخت‌افزار) | oB1 p16 | |
| 13 | نیست — برگهٔ #۱۰۲ | oB1 p17–p18 | |
| 14 | نیمه — برگهٔ #۱۰۳ | oB1 p19–p20 | |
| 15 | فقط در تور؛ 📜 ⬇️/🖨 | oB1 p19 | |
| 16 | هست: نقشه/پرونده/«از کجا؟» per problem | oB1 p21 | |

## Chat ⇄ page
aB3, aB4, tB1, pwB1, pwB2: forms «از گفت‌وگو … درست است؟» ✓، بی دوباره‌پرسیِ مجهول ✓، stage lag (D6)، importer meta-unknown (D3).

## Routing
All user turns and automatic follow-ups routed correctly (266 calls incl. internal second opinions; table per scenario in routing.md).
