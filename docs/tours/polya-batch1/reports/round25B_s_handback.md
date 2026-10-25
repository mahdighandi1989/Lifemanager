## Round 25, runner B_s (Sonnet) — report
Everything is in `tour1_polya/round25B_s/`. I never read `round25B/`. Build: main 64dc0667, `build.py --check` in sync, dist newer than the merge. Token and time use are not visible to me.

**What I ran**
- 25 runs, all ended with `{"exit":true}`, `ai/` folders kept, my profiles deleted.
- Replays of the round-24 group B scenarios: s11–s20, bp1–bp3, aB1–aB4, tB1, tB1x, using round-24 controls and answers matched by her turn text. New replies are written as the literal average model; rewrite requests were answered.
- tB1 also carries the new negative arms and the positive arm.
- New runs:
  - **pwB1** (deep): engineering calculation with a unit slip.
  - **pwB2** (deep): job decision with a missing criterion, multi-day.
  - **tB1c, tB1d, tB1s**: territory-loop arms.
  - **oB1** (rebuilt for bank 9–16).
  - **aBx, aBf**: birth-date probes, no e-mail.
- Files per scenario: findings.md, routing.md, better/rN.txt (only s12, pwB1, pwB2 — fewer than every failed turn), mail.html + mail.subject.txt, DONE. Top level: defects.md, PARTS.md, notes.md.
- E-mails: 25 sent with Gmail (subject «🧭 پولیا · دورِ ۲۵ · B (مقایسه) · …»); none refused.

**Results**
- PASS (no defect): s14, s17, s20, bp1, bp2, bp3, tB1x, tB1s, oB1.
- FAIL (any S2/S3): s11, s12, s13, s15, s16, s18, s19, aB1, aB2, aB3, aB4, tB1, tB1c, tB1d, pwB1, pwB2.
- Defect ids B25·D1–D26 are in `defects.md`. S2s:
  - **D1** — pwB2 p1: the page's arithmetic check drops the Unicode minus. It says «۳+۴۲ با ۳۹ نمی‌خواند» although −۳+۴۲=۳۹. 📜 even shows the coach-facing «(عددِ درست را لو نده)».
  - **D2** — pwB1 p3–p7, pwB2 p3–p4: the prior ledger ignores her own fix. After she corrected step 2 herself, it stays ✗, and the page said «چیزی برای عوض کردن نبود». A mis-clicked «نه» cannot be withdrawn, so «حکمِ گامِ ۶ را رد کردی» is asked for five turns (`reAt` is never set).
  - **D3** — pwB1 p1: the unknown imported into the form is her opening sentence. pwB2 p5: the missing criterion (mother's dialysis) is stored nowhere.
  - **D4** — pwB1 p1 and pwB2 p1: the first-turn page question ignores the prior-work resume point. It is a guess test in pwB1 and the whole-first question in pwB2.
  - **D5** — the mind card does not credit her correct prior steps.
  - **D6** — the stage strip lags: aB3 six months later still says «اجرای طرح», and tB1/tB1c/tB1d read «اجرای طرح · طرح هنوز نیست».
  - **D7** — pwB2: «امروز» shows an invented plan date (۱۰ آبان) and never her own «پنجشنبه» or «۲۰ بهمن».
- S3s (D8–D26) include:
  - elders get «تولدت» in the birth confirmation (s12, aB4);
  - the register check flags «وارسی؟» (s12 p10);
  - two-question page questions (s13 p7, aB3 p13, s19) and s19's «این گام جواب نداد؟» for nine turns;
  - duplicate route points (aB2/aB4) and a duplicate «صورتِ مسئله» in s11's ask list;
  - tB1 📜 dates the arrival wrongly and drops the intermediate checks.

**Round-24 defect table (B24·D1–D22)**
- FIXED: D1, D3, D4, D5, D6, D7, D8, D9, D10, D11, D13, D15, D17, D19, D20, D22.
- CHANGED: D2, D14, D16, D21.
- STILL: D12, D18.
- Evidence per row is in `defects.md`.

**Territory arms**

| Arm | Run | Verdict |
|---|---|---|
| Positive | tB1 | PASS: «ابزارِ لازم آمد», step resumed |
| sys_done | tB1x | PASS: page line and sheet note now written |
| Unrelated reply | tB1 | PASS: mismatch, sheet reopened |
| NEW (a) ruled-out area (epi-claims, factory) | tB1 | PASS: no resume; wording says «شاید منتشر نشده» (D15) |
| NEW (b) generic words only | tB1 | PASS: no resume; same wording |
| Two areas, best fit | tB1c | PASS: pr_prior_art wins |
| Two areas, tie | tB1d | PARTIAL: page asks her and also announces «ابزار آمد» (D14) |
| System-self sheet (book) while a step waits | tB1s, oB1 | PASS: no step marked waiting |

Simulation: routine notes edited into `sheets/sh101.json`, plus scratch copies of the dist (`scratchpage*/`) with real new areas in SYS_TERR. I did not poke page internals.

**Prior work**
- pwB1 and pwB2: FAIL.
- What worked: every step got a verdict, correct steps were not re-asked, dependents were marked, the resume point was right, and the forms, 🧭 and 📜 showed «درست است؟».
- What broke: D1–D5 and D7.
- Both reached a verified result: the correct solution in pwB1, and a decision plus a dated prediction in pwB2.
- The page does not recheck arithmetic in later chat messages, e.g. «۶۰۰۰÷۲۲۰=۲٫۷» in pwB1 p5.

**Owner bank 9–16 (oB1, p15–p21)**
- #9–#10: هست.
- #11: partial. Offline is on; a local or self-built model is «در اطلاعاتِ من نیست».
- #12: هست, with two gaps.
- #13: نیست, sheet #102.
- #14: partial, sheet #103.
- #15: only during a tour.
- #16: هست — each problem has its own map and dossier, and the mind card has «از کجا؟».

**Chat ⇄ page and routing**
- Chat ⇄ page: aB3, aB4, tB1, pwB1, pwB2 show «از گفت‌وگو … درست است؟» forms and never re-ask the unknown. The importer and stage-lag problems are D3 and D6.
- Routing: 266 calls (user turns, automatic follow-ups, internal second opinions). Every user turn and automatic follow-up went to the right task. The strict prompt scan was clean.
- PARTS.md has a «نسبت به دورِ ۲۴» column: better for the birth card, post-check, territory loop, corrections and mind-card stucks; same for 🧭, 📜 and Today.

**Limits**
- I did not re-run the `test_tour1_r24_*.js` sentences one by one.
- s16–s20 and bp1–bp3 were judged mostly by diffs against round 24.
- Parts such as practice and running lists were not exercised beyond the replays.
- The shell hit its timeout once while I was restarting the tB1 harness for the scratch-page arm. I recovered by restarting it with `tools/hs.sh`.

**New owner-like questions**
- «کدام عددهای من به این گام وابسته‌اند؟»
- «سامانه کدام گامِ درستِ مرا به حسابم گذاشت؟»
- «اگر روی «نه» اشتباهی زدم، چطور پسش بگیرم؟»
- «موعدی که خودم در گفت‌وگو گفتم (پنجشنبه، ۲۰ بهمن) کجای امروز می‌آید؟»