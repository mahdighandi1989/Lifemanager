# Round 28 · group C — final report

All 21 group-C runs (the 20 round-27 scenarios plus the tC1t branch) were re-run on main 33f7de9f. The build was in sync and the dist was newer than the merge. New arm segments were added to s24, s25, s29, aC1, aC3, pwC1 and pwC2.

Each run has `findings.md` (UTF-8 checked), `DONE` and a sent e-mail:
- 22 e-mails in total, one per run plus a completion e-mail for s24;
- the subjects are in each `mail.subject.txt`;
- `STORYBOARD_LINKS.md` has a «دورِ ۲۸ C» line.

**Result: 1 PASS (oC1) · 12 PARTIAL · 8 FAIL. One S1 (C28-13, aC3 p30).**
- Every FAIL has at least one S2 or the S1.
- In every scenario the person reached a verified result or the exact sticking point.

## Housekeeping
- **Repo:** not edited; nothing was committed.
- **Processes:**
  - I killed no process.
  - All my harnesses exited by themselves, and no `h28c` or round28C process is left.
  - Two PIDs in `pids.txt` are alive, but they are now other runners' Chromium renderers (the PID numbers were reused), so I left them alone.
- **Profiles:** my browser profiles are deleted; the `ai/` folders are kept.
- **Ports:** the harness opens no port (it uses a persistent Chromium context), so the range 9400–9449 was never used.
- **Owner's address:** not written in any file.

### Class d (my own errors)
- **pC1 p1:** my replay filter accepted the round-27 reply under a new «# کارِ پیشینِ تو» request. I re-ran pC1 with a proper prior-work report; the first run is in `old/pC1_run1`.
- **pwC1 p11:** a replayed reply mentions numbers the page no longer marked.
- **pwC2 T13:** my eval only looked at live problems, so I ran T13 in s24 instead.

## What I did not run, or ran only partly
| item | status |
|---|---|
| Screenshots | **pC3:** all 100 shots reviewed one by one (25 four-up sheets, readable resolution). **Other runs:** reviewed through their contact sheets, focused on the end-of-run sheets (📜, امروز, کارنامه, 🧭, part shots); not every single shot was opened. |
| T14 main arm | NOT RUN as designed: the page proposed «۱۰۰ ⇒ ۱۲۰», not the exact 150, so there was no correct proposal to accept. The negation, the wrong acceptance and the chat-only acceptance were run. |
| T13 for a 🎯 or a ledger step | Not possible: neither has a move button (as the fixer said). |
| Fixer #233 (order of a ✏️-backfilled line, multi-day) | Not checked. |
| Fixer D27-16 | Group-D shape; not run. |
| Fixer `m2` «کدام؟» answered by her | Not reached: the page never raised the `m2` ask (C28-11, C28-12). |

## Results per scenario
| sid | result | defects (turn) | ارتقای لازم |
|---|---|---|---|
| s21 | PARTIAL | C26-1 (p2, CHANGED: «۲ از ۲» now titled by the live problem) | count problems, not messages |
| s22 | PARTIAL | C26-3 (p16, p17) · C22-5 (p7) · C28-1 S3 (p22) | one voice per correction turn |
| s23 | FAIL | C25-8 S2 (p4) · C25-15 S2 (p9) · C26-37 (p6) | read «یعنی N» as a derived result |
| s24 | PARTIAL | C28-23 S3 (T13 history clock) | stamp history with the page clock |
| s25 | FAIL | C28-2 S2 (p10) · C28-3 (p21) · C28-4 (p23) · C28-5 (p24) · C26-14 (p3, p16) · C26-3 (p14) | minimal replacement inside ledger quotes |
| s26 | PARTIAL | C22-11 (📜) | merge the chat guess with the form guess |
| s27 | PARTIAL | C26-39 (step card) · C28-6 (label) | register the verb too |
| s28 | FAIL | C25-7′ S2 (p4) · C26-40 (p4) · C27-3 CHANGED, worse (p4) | prior block at a second problem's opening |
| s29 | PARTIAL | C26-14 (p11) | — |
| pC1 | FAIL | C26-33 S2 (forms c13–c15) · C26-18 (p6) | keep form text across re-render |
| pC2 | PARTIAL | C27-7 (p13) | Today line for a piece after closure |
| pC3 | PARTIAL | C28-7 (p15–p16) · C28-20 · C28-21 · C28-22 (shots) | prerequisite item named by problem title |
| aC1 | FAIL | C28-8 S2 (p15) · C28-3 (p20) · C28-21 | attribute «X کرد: …» to X |
| aC2 | PARTIAL | C26-23 (p1) · C26-24 (p2) | tell a method word from a problem term |
| aC3 | FAIL | **C28-13 S1 (p30)** · C28-12 S2 (p29) · C28-9 S2 (p21, p22) · C28-10 (p28) · C28-11 (p29) | for «N میلیون و M», use the one reading that fits; ignore empty `when` |
| aC4 | PARTIAL | C26-30 (p7) · C28-6 | keep a lesson said in chat |
| oC1 | PASS | — | — |
| pwC1 | FAIL | C28-14 S2 (p27) · C27-24 (p21) · C27-21 CHANGED (p3) | recompute proposals from current operands; mark ledger dependants |
| pwC2 | FAIL | C28-17 S2 (p36) · C28-18 S2 · C28-24 S2 (p37–p39) · C28-25 S2 (p33) · C27-19 S2 (📜) · C25-15 S2 (p22) · C28-15 (p32) · C28-16 (p35) · C28-19 · C28-5 | one 🎯 per forecast, updated with history |
| tC1 | PARTIAL | C26-18 (p6) | — |
| tC1t | PARTIAL | C26-18 (p6) | — |

## New defects (full rows in `round28C/defects.md`)

**S1**
- **C28-13:** a correct «۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون» is told to the coach as «؟ دقیقاً ۱٫۸۰۰۲ میلیون — گرد کرده؟». The page used the units reading of «و ۲۰۰» although only the thousand reading fits (C63).

**S2**
- **C28-12:** wrong «۶ میلیون و ۵۰۰ × ۱۰ = ۶۰ میلیون» (exact: 65 million) gets «؟ (rounding)» instead of ✗ with both values.
- **C28-14:** after «۵ ⇒ ۶ میلی‌متر» the page proposes «۱۰۰ ⇒ ۱۲۰» (built on the stale 2 ha; exact 150) and «۱۵ ⇒ ۱۸» (a proportional rewrite, not a recomputation). The ledger steps that depend on the water need get no stale mark.
- **C28-17:** a new confidence number for the same forecast makes a second 🎯, so calibration counts it twice.
- **C28-18:** a report of an already judged forecast becomes an open 🎯.
- **C28-24:** two forecasts in one message become two 🎯 with no text, filed in another problem's 📜, and are never offered when her outcome comes.
- **C28-25:** «تقریباً مطمئنم» is never asked for a number.
- **C28-8:** «داداشم … کرد: ۴ × ۲۵۰ = ۹۰۰» is filed as her own ✗, not «کارِ دیگری».
- **C28-9:** «بعد از عید» / «وسطِ ماه», when the model reported a plan with an empty `when`, ⇒ «امروز خودش جمعه است…» on a Wednesday.
- **C28-2:** a correction rewrites her prior-ledger quote and drops her words.

**S3:** C28-1, C28-3, C28-4, C28-5, C28-6, C28-7, C28-10, C28-11, C28-15, C28-16, C28-19, C28-20, C28-21, C28-22, C28-23.

## Round-27 defect table
| id | verdict | turn |
|---|---|---|
| C27-1 | FIXED | s22 p22 |
| C27-2 | FIXED | s22 p22 (the ask moved to Saturday 2 Aban) |
| C27-3 | CHANGED, worse | s28 p4: now «تأیید شد» and «کالیبراسیون +» |
| C27-4 | FIXED | aC1 p12 «[نامِ شخص]» |
| C27-5 | FIXED | aC4 p8 |
| C27-6 | FIXED at the destination | pC2 p13: a chat problem is still created from the after-closure sentence |
| C27-7 | STILL | pC2 p13 |
| C27-11 | FIXED | aC3 p8, p11 (no 1406 re-ask) |
| C27-13 | FIXED | s25 p20, p23 |
| C27-14 | FIXED | s23 p6 (T9) |
| C27-17 | FIXED | pwC2 p21 |
| C27-18 | FIXED | pwC2 p28 |
| C27-19 | STILL | pwC2 📜 (#236 facet has no record) |
| C27-20 | FIXED | pwC2 p27–p29 |
| C27-21 | CHANGED | pwC1 p3: the turn question is right; the step-3 verdict text keeps the stale reason |
| C27-22 | FIXED | pwC1 p14 |
| C27-23 | FIXED | pwC1 p10 «۱۰۰ ⇒ ۱۲۵», steps 1–3 stale |
| C27-24 | STILL | pwC1 p21 |
| C27-25 | FIXED | pwC1 p22 |
| C27-26 | FIXED | pwC1 p23 (T11) |
| C27-27 | FIXED | tC1 p3 |
| C27-28 | FIXED | tC1t p17 (T1) |
| C26-1 | STILL in s21 p2; FIXED in s25 p15 | — |
| C26-3 | STILL | s22 p16/p17, s25 p14 |
| C26-14 | STILL | s25 p3/p16, s29 p11 |
| C26-17 | FIXED (not triggered) | pC3 p2, pwC1 p22 |
| C26-18 | STILL | pC1 p6, tC1 p6, tC1t p6 |
| C26-23, C26-24 | STILL | aC2 p1, p2 |
| C26-29 | FIXED | aC1 |
| C26-30 | STILL | aC4 p7 |
| C26-32 | FIXED | pC1 p13, pC2 p12, pC3 p16 |
| C26-33 | STILL in pC1 forms; not reproduced in pC3 c27–c28 | — |
| C26-37 | STILL | s23 p6 |
| C26-39 | STILL | s27 |
| C26-40 | STILL | s28 p4 |
| C25-7 | FIXED | pC1 p1 |
| C25-7′ | STILL | s28 p4 |
| C25-8 | STILL | s23 p4 |
| C25-15 | FIXED in pwC1 p10; STILL in pwC2 p22 and s23 p9; recurs in pwC1 p27 (C28-14) | — |
| C25-16 | FIXED | pC3 c29, aC4 |
| C22-5 | STILL | s22 p7 |
| C22-11 | STILL | s26 |

**Round-27 S1 shapes (D27-18, D27-1, D27-2) in group C:**
- «و» as a sum is read right: aC1 p20 «۴۰۰ و ۴۰۰ و ۴۰۰ = ۱۲۰۰» ✓, aC1 «۶ و ۶ و ۶ و ۶ میشه ۲۴» ✓.
- A hypothetical is not a dispute: s25 p21, aC1 p20.
- «گرد کردم» bound to someone else's line: not run in C.

## ARMS TABLE
| arm | scenario · turn | verdict |
|---|---|---|
| T1 | tC1t p17 | PASS: the name-part answer is read |
| T2 | pC2 p13 | PASS with S3 (no «امروز» line, C27-7) |
| T3 | pwC1 p21–p22 | PASS: «۳ متر در ۴ متر = ۱۲» ✓, «۳ متر در ۵ متر = ۱۸» ✗ ۱۵, «÷ ۴۸ = ۶۱۳۱» ؟ |
| T4 | pwC1 p20 | PASS: 8-step ledger |
| T5 | pwC1 p19 | PASS |
| T6 | pwC2 p18–p21; oC1 | PASS |
| T7 | oC1 p20 | PASS «۱۳۰ ⇒ ۱۰۴» |
| T7 | pwC1 p27 | FAIL (C28-14) |
| T8 | pwC2 p27–p29 | PASS |
| T9 | s23 p6; s29 p10 | PASS |
| T10 | s25 p19 | PASS |
| T11 | pwC1 p23 | PASS |
| T12 | pC1 p1; s25 p24 | PASS on an opening |
| T12 | s28 p4 | FAIL on an opening |
| T12 | s25 p8; aC1 p18, p19 | PASS mid-session (no prior block) |
| T13 | s24 c54–c61 | PASS: the line moves, both places keep history, undo restores, nothing deleted. S3: real-clock stamp (C28-23). 🎯 and ledger steps cannot move (pwC2). |
| T14 | pwC1 p28–p31 | Main arm NOT RUN (no correct proposal existed: the page proposed 120). Negation «نه، ۳۰۰ نیست» PASS (p29). Wrong «۱۹٫۵ درسته» rewrote nothing, PASS (p30). Chat-only acceptance did nothing (p31; C68 chat not built, confirmed). |
| T15 | s29 p11–p13 | PASS for roots: «√(۱۵²+۸²) ≈ ۱۷» ✓, «√(۱۲²+۹²) ≈ ۱۶» ✗ ۱۵, «≈ ۱۶٫۱» ✓, «۲√۳» نسنجیده |
| T15 | aC3 p29–p30 | FAIL for scale: one reading fits ✓; both readings fit ✓ without the ask (C28-11); none fits ⇒ «؟» (C28-12); correct ⇒ false «؟» (C28-13 S1) |
| T16 | aC3 p17–p28; s22 p22 | PASS for: newest-yes only, negated day, ✏️ «شنبه ⇒ یکشنبه» (one line, one ask). S3: ✏️ into the past (C28-10). |
| T17 | aC3 p14, p17–p24 | PARTIAL: «سرِ برج» 1 Dey ✓, «آخرِ سال» 29 Esfand ✓, «عید» 1 Farvardin 1406 asked ✓, «آخرِ سالِ تحصیلی» «کدام روز؟» and not booked by «باشه» ✓. «بعد از عید» / «وسطِ ماه» ⇒ a false «امروز جمعه است» (C28-9). |
| T18 | pwC2 p31–p39 | FAIL: «احتمالش ۷۰ درصده» ⇒ 🎯 ✓; «فکر کنم ۷۰ درصد» ⇒ guess, no 🎯; «تقریباً مطمئنم» not asked; past and other-person confidence ⇒ no 🎯 ✓; new number ⇒ second 🎯; two forecasts ⇒ two text-less 🎯 elsewhere; the outcome matching one asks «کدام؟» between duplicates; the outcome matching both asks among unrelated forecasts. |
| T19 | aC1 p13–p16 | PARTIAL: «داداشم حساب کرد 3×400» is «کارِ دیگری» ✓ and not prior work ✓. «منم همینو قبول دارم» has no page mechanism. «داداشم … کرد: ۴ × ۲۵۰ = ۹۰۰» is filed as hers (C28-8). |
| T20 | s25 p21–p22; aC1 p19–p20 | PASS with S3: not a dispute and the later fact survives, but the «شاید اصلاح» block appears (C28-3). «۷ × ۸ = ۵۶ بود دیگه؟» opens no prior work ✓. |

## 📜 line-match tables (multi-problem scenarios, with the page's marks)
| scenario | per-problem match | marks | mismatch |
|---|---|---|---|
| s21 | puzzle ✓ · look-back problem ✓ | — | session dossier «۲ از ۲» (C26-1) |
| s23 | cake ✗ · 24-cm problem ✓ | «۱٫۷۵» unmarked (unread) | C25-8 guess set aside |
| s24 | stairs ✓ · tiling ✓ | — | — |
| s25 | n/(n+1) ✓ · own pattern ✓/✗ · ۱/(n(n+2)) ✓ «۳ از ۳» | «حسابِ صفحه: ✓/✗» beside her lines; the grandchild's lines «✗ کارِ دیگری» | the pattern 📜 has «بازسنجی (اعتراضِ خودتان)» with no objection (C28-4) |
| s26 | three ✗ · four ✓ | — | C22-11 |
| s28 | two children ✓ · Tuesday ✗ | 13/27 unmarked (no operator) | a non-guess «تأیید شد» (C27-3) |
| s29 | garden ✓ · pond ✓ · look-back ✓ · rectangles (chat) ✓ | ✓ ✗ ✓ for the roots | — |
| aC1 | marbles ✓ · «حرفِ داداشم [نامِ شخص]» ✓ · notebooks ✗ | 3×400 «کارِ دیگری» ✓; 4×250 as hers | C28-8 |
| pwC2 | disease ✗ · dice ✓ · marbles ✗ | «✓» beside 3/10 and 9.2% | sleep plan (C27-19), stray 🎯 (C28-18, C28-24) in disease; course 🎯 in marbles (C28-19) |
| pC2 | heater ✓ · meter piece own sheet ✓ | ✓ | — |
| pC3, pC1, pwC1, aC3, aC4, oC1, tC1 | one problem each; every event in order ✓ | ✓/✗/؟ shown beside arithmetic | pwC1 stale marks missing after 6 mm (C28-14) |

## Prior-work verdict table
| scenario | block | outcome |
|---|---|---|
| pC1 | yes (new) | 3 steps: 2 ✓ «آزمون، نه برهان», 1 incomplete; resume at 3 |
| pwC1 | yes | 8 steps over 3 reports; the 2.5 ha correction reaches steps 1–3 ✓; the 6 mm correction reaches none (C28-14) |
| pwC2 | yes | 4 steps; dispute re-checked once; fixed the same turn; the 1%⇒2% correction does not reach step 1 (C25-15) |
| pC2 | yes | the unit error is separated; fixed ✓ |
| s25 | yes, and shown after closure (merge) | step 3 quote corrupted by the 10⇒8 correction (C28-2) |
| s25 p24 | yes (single worked step) | ✓ |
| s28 p4 | no (C25-7′) | — |
| aC1 p18, p19; s25 p22 | none, correctly (small talk, bare question) | — |

## Arithmetic (she wrote · exact · page · verdict)
| scenario | she wrote | exact | page | verdict |
|---|---|---|---|---|
| s25 | ۱ + ۲ + … + ۲۰ = ۲۱۰ | 210 | ✓ | right (C27-13 fixed) |
| s25 | ۱ + ۳ + … + ۱۹ = ۱۰۰ | 100 | ✓ | right |
| s25 | ۲۰ + ۱۸ + … + ۲ = ۱۱۰ | 110 | ✓ | right |
| s25 | ۱ + ۲ + … + ۱۰ = ۵۰ | 55 | ✗ | right |
| s25 | ۶/۱۲ + ۲/۱۲ + ۱/۱۲ = ۹/۱۲ = ۳/۴ | 3/4 | ✓ ✓ | right |
| s25 | ۱/(۱×۳) = ۱/۲ × (۱ − ۱/۳) = ۱/۳ | 1/3 | ✓ | right |
| s25 | ۳x + ۲ = ۱۱ ; ۱۷ ≡ ۲ (mod ۵) | look-alikes | not judged | right |
| s25 | ۲۶ ÷ ۴ = ۶٫۵ ; ۱۰۰ تقسیم بر ۷ = ۱۴ ; ۱۳/۱۲ = ۱ | 6.5 ; 14.29 ; 13/12 | ✓ ; ؟ ; ✗ | right |
| s29 | √(۱۵²+۸²) ≈ ۱۷ | 17 | ✓ | right |
| s29 | √(۱۲²+۹²) ≈ ۱۶ | 15 | ✗ | right |
| s29 | √(۱۴²+۸²) ≈ ۱۶٫۱ | 16.12 | ✓ | right |
| s29 | ۲√۳ | 3.46 | — | right |
| aC3 | ۲ میلیون و ۸۰۰ × ۱۲ = ۳۳ میلیون و ۶۰۰ | 33.6 M | ✓ | right |
| aC3 | ۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰ | 1.4 M (both readings fit) | ✓ | S3: should ask |
| aC3 | ۶ میلیون و ۵۰۰ × ۱۰ = ۶۰ میلیون | 65 M | ؟ «60.005» | **S2** |
| aC3 | ۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون | 2 M | ؟ «1.8002» | **S1** |
| aC3 | ۵ میلیون و ۵۰۰ × ۲ = ۱۱ میلیون | 11 M | ✓ | right |
| aC3 / aC1 | ۲ × ۳ = ۶ تا تخم‌مرغ | 6 | ✓, no prior work | right |
| aC1 | (brother) ۳ × ۴۰۰ = ۱۲۰۰ | 1200 | ✓ کارِ دیگری | right |
| aC1 | (brother) ۴ × ۲۵۰ = ۹۰۰ | 1000 | ✗ filed as hers | S2 attribution |
| aC1 | ۴۰۰ و ۴۰۰ و ۴۰۰ میشه ۱۲۰۰ | 1200 | ✓ | right |
| pwC1 | ۱۲ × ۴٫۵ = ۵۴ میلیون … ۱۱۵ − ۷۰ = ۴۵ = ۳ × ۱۵ | same | ✓ ×6 | right |
| pwC1 | ۳ متر در ۴ متر = ۱۲ | 12 | ✓ | right |
| pwC1 | ۳ متر در ۵ متر = ۱۸ | 15 | ✗ | right |
| pwC1 | ۲ × (۳ + ۵) = ۱۸ | 16 | ✗ | right |
| pwC1 | ۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ | 6131.25 | ؟ | right |
| pwC1 | ۴٫۲ × ۱۲ = ۵۲٫۴ ; ۱۷۰۰ ÷ ۰٫۵ = ۳۰۹۱ | 50.4 ; 3400 | ✗ ✗ | right |
| pwC1 | (page proposals) ۵۴ ⇒ ۶۰ … ۱۵ ⇒ ۱۷ ; ۱۰۰ ⇒ ۱۲۵ | same | — | right |
| pwC1 | (page proposals) ۱۰۰ ⇒ ۱۲۰ ; ۱۵ ⇒ ۱۸ | 150 ; not proportional | — | S2 |
| pC1 | 16−1=15 ; 64−49=15 ; ۴ × ۱۶ = ۶۴ ; ۱۰۰ − ۳۶ = ۶۴ | same | ✓ | right |
| pC3 | twelve lines (۸ × ۵ = ۴۰ … ۶۰ ÷ ۱۰ = ۶) | same | ✓ | right |
| pwC2 | ۹ + ۸۹٫۱ = ۹۸٫۱ ; ۹ ÷ ۹۸٫۱ ≈ ۹٫۲٪ ; ۳/۵ × ۲/۴ = ۶/۲۰ = ۳/۱۰ | same | ✓ | right |
| oC1 | ۵ × ۲۶ = ۱۳۰ ⇒ proposal ۱۰۴ | 104 | ✓ | right |

## 🎯 table
| forecast | confidence | 🎯 made? | outcome | settled where |
|---|---|---|---|---|
| answer ≈ 50% (pwC2) | 80% | yes | 9.2% ⇒ نشد | disease ✓ |
| two red ≈ 30% | 60% | yes | شد | marbles ✓ |
| 60 throws ≈ 10 sevens | 70% | yes | 11 ⇒ «شد یا نشد؟» | asked ✓ |
| «احتمالش ۷۰ درصده» final exam > 17 | 70% | yes (filed under marbles) | 18 ⇒ «کدام؟» | not settled |
| same forecast with 80% | 80% | second 🎯 (C28-17) | 18 ⇒ «کدام؟» | not settled |
| «فکر کنم ۷۰ درصد» Bayes exercises by Friday | 70% | no (coached as a guess) | — | — |
| «تقریباً مطمئنم» next chapter not hard | — | no (number never asked) | — | — |
| «۸۰ درصد.» bare | — | no | — | — |
| last year 90% (past) | — | no ✓ | — | — |
| coach's 70% (other person) | — | no ✓ (کارِ دیگری) | — | — |
| quiz ch. 3 / ch. 4 | 60% / 50% | two text-less 🎯 in disease | «کامل جواب دادم» ⇒ «کدام؟» among unrelated forecasts | no |
| «پیش‌بینیم … غلط درومد» (a report, not a forecast) | 80% | yes, wrongly (C28-18) | — | — |

## Date-ask table
| ask | her answer | booked |
|---|---|---|
| s22 «مهلتش تا پنجشنبه‌ست» ⇒ 30 Mehr? | none | no; later moved to Saturday 2 Aban as an ask; lapsed |
| s22 «تا آخر هفته» ⇒ Thu or Fri? | none | no (Thursday is no longer taken from the negation) |
| s29 «۱۴۰۵/۸/۲۵» ⇒ 25 Aban? | — | ask shown |
| aC3 «سرِ برج» ⇒ 1 Dey? | (newer ask followed) | no |
| aC3 «آخرِ سال» ⇒ 29 Esfand? | «بله» | 📌 29 Esfand |
| aC3 «عید» ⇒ 1 Farvardin 1406? | — | ask |
| aC3 «بعد از عید», «وسطِ ماه» | — | false «امروز جمعه است: … ۱۱ آذر؟» (C28-9) |
| aC3 «آخرِ سالِ تحصیلی» ⇒ which day? | «باشه» | nothing (correct) |
| aC3 «پنجشنبه نه، شنبه» ⇒ 7 Azar? | «آره» | 📌 7 Azar |
| aC3 ✏️ «شنبه ⇒ یکشنبه» | — | 7 Azar set aside, 8 Azar asked |
| aC3 ✏️ «⇒ ۲۰ آبان رفتم» | — | no ask; the 8 Azar ask stays (C28-10) |
| pwC2 «تا جمعه» on a Friday ⇒ today or next Friday? | «جمعهٔ بعد» | 8 Aban |
| pwC2 «شنبه ۲ آبان» ⇒ yes? | «باشه» | 📌 with ⏰ attached (one record) |
| pwC2 two quiz forecasts ⇒ Thursday 7 Aban? | none | no |
| oC1 «جمعهٔ بعد برمی‌گردم» ⇒ Fri 1 or Fri 8? | — | ask |

## Chat ⇄ page
- **Stage follows the story:** chat-solved problems open at «✅ حل شد — بازنگری» (s24, aC2).
- **Prerequisite layer:** chat ⇄ 🧩 ⇄ 🧠 returns exactly in pC1, pC2, pC3, aC1, aC3, aC4 and tC1. The item name is the raw message (C28-7), and a diagnostic question is repeated (C26-18).
- **Forms:**
  - pC3: every form works, and the plan text survives a refused save.
  - pC1: the plan text is lost (C26-33).
- **📜 now carries the page's ✓/✗/؟ beside her lines.** Someone else's lines are labelled «کارِ دیگری» (s25, aC1, pwC2), with the exception in C28-8.
- **One record per problem:** much better (marbles has its own dossier; there are 3 problems in s25). Forecasts are still misfiled (C28-19, C28-24) and the facet still has no record (C27-19).

## Owner bank (C share: 21–31, 48–50, 60–61)
| # | answer | where |
|---|---|---|
| 21 | نیست — sheet #102 (replayed, unchanged) | pwC1 p7 |
| 22 | هست — the routine's unrelated reply is not accepted and the sheet reopens | pwC1 (c69 arm), tC1 |
| 23 | هست | pwC2 p16 |
| 24 | نیمه — 2.5 ha reaches statement, title and ledger steps 1–3 exactly; 6 mm gives wrong proposals and misses the ledger | pwC1 p10 vs p27; pwC2 p22 |
| 25 | هست | s25 p18 |
| 26 | هست | aC1 |
| 27 | هست — «پاسخِ روتین … جواب نداد … دوباره باز شد» | pwC1 |
| 28 | نیست — sheet #103 | pwC1 p24 |
| 29 | نیست — sheet (replayed question) | aC3 c56, pwC2 p27 |
| 30 | نیست / defect — a re-stated forecast becomes a second 🎯 and counts twice | pwC2 p36 (C28-17) |
| 31 | نیمه — the opening is read in pC1, pwC1, pwC2, pC2 and s25 p24; not in s28 p4 | — |
| 48 | هست — «سه‌شنبه» in the problem is no appointment | s28 p6 |
| 49 | هست — «جمعهٔ بعد» ⇒ 8 Aban; «باشه» ⇒ one 📌 with ⏰ | pwC2 p18–p21 |
| 50 | نیمه — exact in s23 p9 «۱٫۷۵ ⇒ ۱٫۵» and pwC1 p10/p23; wrong in pwC1 p27 «۱۰۰ ⇒ ۱۲۰» | — |
| 60 | هست — «مسئلهٔ ۳ از ۳», own dossier with its 🎯 and result; the title keeps her lead-in (C28-5) | pwC2 p30, s25 p24 |
| 61 | نیمه — «کارِ دیگری» for «حساب کرد», «نوه‌م نوشته» and «مربیم گفت»; not for «داداشم … کرد:» (C28-8) | aC1 p13/p15, s25 p20, pwC2 p35 |

## Fixers' «Not done» claims (each tested where group C has the shape)
| claim | result |
|---|---|
| #236 facet «خبرِ خواب» | confirmed: the plan sits in the disease 📜 |
| s28 p4 C25-7′ | confirmed still missing |
| C27-6 | the destination is fixed; a chat problem is still made from the after-closure sentence |
| C68 in a chat-only problem | confirmed not built (pwC1 p31) |
| `m2` «کدام؟» | never raised (see T15) |
| dates' simple «done» stem | enough for «خریدیم» (aC4 p8) |
| ✏️ into the past «asks nothing» | confirmed and judged S3 (C28-10) |
| D27-29, second half | the practice schedule is in the prompt (s23 p8), so not reproduced in group C |
| #233, D27-16 | not run (above) |

## Carried items for group C (RUNNER28 §5)
| item | result |
|---|---|
| C26-17 | FIXED: a reply with «نمی‌گویم» drew no rewrite (pC3 p2, pwC1 p22) |
| C25-16 | FIXED: no «طرح هنوز نیست» strip at exec (pC3 c29) |
| C26-33 | not reproduced in pC3 (text kept at c27/c28), but STILL in pC1 |
| screenshots | pC3 reviewed one by one (above) |

## Routing
- 335 AI calls: lla_coach 298, lla_assistant 23, learning_architecture 14.
- None was on the wrong task (`round28C/routing.md`):
  - every coaching turn went to lla_coach;
  - system follow-ups, ✏️ turns and pure commands («آره، بازش کن») went to lla_assistant.

## PARTS.md «نسبت به دورِ ۲۷»
| part | trend |
|---|---|
| کارِ پیشین | better (pC1 opening), with one new S2 (C28-2) |
| حسابِ صفحه | better in shapes (ellipsis, «در», running sums, roots); **worse in «N میلیون و M» (new S1)** |
| موتورِ اصلاح | better (C27-14, C27-23, C27-26 fixed), one new S2 (C28-14) |
| تاریخ / امروز | better (C27-1, C27-2, C27-5, C27-11, C27-17 fixed), one new S2 (C28-9) |
| 🎯 | better (C27-20 fixed), but new phrasings fail (T18) |
| 📜 | better (marks, ⏰ under 📌, move/undo) |
| حلقهٔ قلمرو | better (C27-28 fixed) |
| 🔭 forms | same (C26-33 in pC1) |
| پیش‌نیاز | same |
| 🧭 | slightly better |
| لایهٔ لحن | worse (C28-6) |
| دستیار / پیگیری‌ها | better (C26-32 fixed) |

## New owner-like questions
- If I correct one number after correcting another, are the page's proposals built on both of my corrections?
- Is «فکر کنم ۷۰ درصد» a forecast or a guess for the page — and who decides?
- When I raise my confidence later, is it the same forecast with a history, or a new one?
- If my brother «did» a calculation (not «said» it), is it still filed as his?
- Does «بعد از عید» or «وسطِ ماه» ever get a real date, and who asks me for it?
- When I move a line to another problem, which date does its history show — today's or the session's?
- When I write «۱ میلیون و ۲۰۰», does the page know I mean 1,200,000?

## Token / time use
- Tokens: not visible to me.
- Wall-clock: about 2 h 55 min, 09:14–12:10 UTC on the session clock.

## Files (all under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round28C/`)
- `defects.md`
- `PARTS.md`
- `routing.md`
- `<sid>/findings.md`, `<sid>/ai/`, `<sid>/routing.txt`
- `seg/*.json` (the arm segments)
- `pC3/cs4/` (the screenshot review sheets)
