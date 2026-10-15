# Pending — safety / verdict / reminder fixes from the cross-cutting review, 2026-10-15

> Hand-off note, not a living document. The session that merges this branch writes the real WORKLOG (n) entry,
> PROGRESS row, HANDBOOK §6/§10/§12 lines, AUDIT_LOG and experiences from it, then deletes or archives it.
> یادداشتِ دست‌به‌دست؛ نشستِ ادغام‌کننده از روی آن WORKLOG/PROGRESS/HANDBOOK/AUDIT_LOG/experiences را می‌نویسد.

Source: adversarial cross-cutting review of `/apps/learning-architecture` (repro scripts sc1…sc12, mutation run M1…M15).
New test: `tests/test_fixes_1015c.js` (exit code; prints `NO ERRORS`). Updated tests: `test_fixes_v08.js` (safety needs the user's
own message; re-measure on the form scale), `test_sources.js` (parent of «منبع‌ها» = `maps`), `scan_epi.js` (exit code).
Files NOT touched (other agents): a34_psy, a29_mind, a4_views2, a35_idea, a7_bt, a2_ws, epi_*, a36_solve, a17_kpractice, a37_sources, a25_graph.
No conventional numbers, no rule/ceiling/station change; the AI still never judges (now enforced for the factory verdict fields too).

| # | File(s) | What changed (EN) | چه شد (FA) | Test |
|---|---|---|---|---|
| 1 HIGH | `a32_sieve.js`, `a26_assist.js`, `a16_knots.js`, `a30_report.js` | `AS.safetyActive` = active unless `AS.safetyClearMsg` finds: safety layer `no`, recorded after the flag, AND a **user** message later than the flag (and not later than the verdict) that matches the code-checked denial lexicon `A.knotSafetyDenial` («نه» at the start, «قصد/فکرِ خودکشی/آسیب ندارم», «به خودم آسیب نمی‌زنم», «در خطر نیستم», «منظورم … نبود», …), AND the verdict's `why` quotes that message verbatim in «…» (normalised substring containing the denial). Ordering uses a per-session user-message counter (`m.seq`, `s.safetySeq`, verdict `seq`), falling back to timestamps for old sessions. `tour_diag` turns an unproven safety `no` into `ask` and tells the model why. A pure denial («قصدِ خودکشی ندارم») no longer re-arms the flag (`A.knotSafetyStripDenial`: denial parts removed, re-checked; «نه، دیگه نمی‌خوام زنده باشم» still re-arms). Conditional prompt hook «# ایمنی (فعال)» (SYS untouched). E-mail: crisis block + hidden transcript/outside follow `safetyActive`; while active the sieve evidence of the safety layer (or any layer whose evidence hits the lexicon) is not printed. | مدل به‌تنهایی هرگز بندِ ایمنی را خاموش نمی‌کند: فقط انکارِ صریحِ خودِ کاربر پس از نشانه، با نقلِ عینی در why. انکارِ خالص نشانه را تازه نمی‌کند. ایمیل در حالِ فعال بندِ بحران دارد و گفت‌وگو و نقلِ پریشانی را نشان نمی‌دهد. | 1015c §1, §1b; v08 |
| 2 HIGH | `a6_epi.js`, `a26_assist.js`, `a32_sieve.js` | Owner-only judgment fields: `A.epiStationWS` marks them `data-own="verdict"` (field box or table cells, MutationObserver keeps new rows marked); `fill`/`click` refuse with ««…» داوری است و فقط با خودِ تو — دستیار حکم و درجه نمی‌دهد؛ زردش کردم …» (counts as a failed claim ⇒ correction turn). Rule derived from the station definitions (`A.epiJudgment(sid)`): every station `verdict` except st_intake (routing only); st_final `final` (whole table), `shift`, `conclusion`, `act`; any `sel` whose options grade certainty (یقین/ظن), «وضع معرفتی», «… واقعی است؟»; any `scale` of اعتبار/وثاقت/صلاحیت; every `pct` column (احتمال صدق) and grading `sel` columns. Conditional hook «# داوری با کاربر» on e_case/epi_course. | فیلدهای حکم و درجهٔ پرونده فقط با کاربر؛ دستیار پر نمی‌کند و نمی‌زند، فقط زرد با یادداشتِ روشن. | 1015c §2 |
| 3 MED | `a27_tour.js` | Overdue practice kept separately (`od`), sorted by original due (oldest first), always leads the reminder body («۲ تمرینِ عقب‌افتاده؛ کهنه‌ترین: «…» (موعدش … گذشت)»); when overdue exists the reminder goes to the first day from tomorrow not covered by a knot reminder (sc4: it was moved to the next future practice two months later or dropped). | عقب‌افتاده همیشه در صدرِ یادآور و هرگز گم نمی‌شود. | 1015c §3 |
| 4 MED | `a33_dates.js`, `a16_knots.js` | `DO.remeasure` validates on the knot form's own scale: intensity integer 0–10 (Persian digits accepted), freq one of `A.KFREQ` (یک‌بار/گاهی/مرتب, id or label); out-of-scale ⇒ refused with a message; empty ⇒ refused. Stores `freqId` + label and `base` (original intake). Knot page «موقعیت‌ها» tab shows «ثبتِ نخست: مرتب · شدت ۷ از ۱۰ ← اکنون: گاهی · شدت ۳ از ۱۰» (Persian digits). `A.knotIntake`, `A.knotRemeasureText`. SYS line names the scale. | دوباره‌سنجی با همان مقیاسِ فرم، کنارِ ثبتِ نخست. | 1015c §4; v08 |
| 5 MED | `a27_tour.js` | Tutor state per problem (`s.tutor.by["p:<pid>"/"r:<rec>"]`): question index no longer shared across problems; auto-turns «[سامانه: …]» neither change the phase nor advance the question; after «حل شد» look-back stays (sticky) until the user says «حل نشد/اشتباه بود/دوباره …». | شمارهٔ پرسش برای هر مسئله؛ نوبتِ خودکار بازنگری را به هم نمی‌زند. | 1015c §5 |
| 7 MED | `tests/test_learning_architecture_graph_browser.py`, `apps/learning-architecture/package.json`, `tests/scan_epi.js`, `AGENTS.md` (step 5) | The merge gate now runs EVERY `apps/learning-architecture/tests/test*.js` + `scan_epi.js` by exit code (glob; parallel pool `LLA_BROWSER_JOBS`=4, per-file timeout `LLA_BROWSER_TIMEOUT`=900 s; `-k` runs a subset), against a temp standalone build; skips with a reason when node/playwright/Chromium are absent. ~4.7 min with 4 workers here. `scan_epi.js` sets `process.exitCode` on page errors. `package.json` pins `playwright` 1.56.1 as a devDependency (previously only `npm i --no-save`, so nothing recorded the dependency). | دروازه همهٔ آزمون‌های صفحه را با کدِ خروج می‌راند؛ playwright در package.json. | pytest |
| 8 MED | `a16_knots.js` | Passive-ideation patterns (ZWNJ/space variants): «بهتره (دیگه) (زنده) نباشم», «همه/خانواده‌ام … بدون/بی من راحت‌تر/بهتر/خوشبخت‌تر», «رگ (م) زدن/بزنم», «زندگی … ارزش(ش) … نداره», «نمی‌خوام/نمی‌تونم … (به) زندگی … ادامه بدم» (both orders). Between-words are restricted so ordinary sentences don't hit; 12 negative sentences tested. | واژه‌نامهٔ ایمنی اندیشهٔ منفعل را می‌بیند، با آزمون‌های منفی. | 1015c §8 |
| 9 LOW | `a27_tour.js` | Today's «🤝 حالت امروز چطور است؟» uses `AS.safetyActive`. | «امروز» پس از انکارِ کاربر دیگر نمی‌پرسد. | 1015c §1b |
| 12 LOW | `a21_orient.js`, `tests/test_sources.js` | `A.SUB_VIEWS.sources = "maps"` («📚 منبع‌ها» opens only from «🗺 نقشه‌ها» graph cards/nodes; a37 only sets it when absent). | پدرِ «منبع‌ها» = نقشه‌ها. | 1015c, test_sources |
| 13 LOW | `a30_report.js` | E-mail glossary line defines «لایه» and «سازه». | واژه‌نامهٔ ایمیل. | 1015c §1 |

## Mutations killed (applied in the worktree, rebuilt, test failed, reverted)
M7 (any later verdict quoting the denial clears — `L.st !== "no"` check removed) · M7b (model verdict alone clears) · M9 (overdue `od.push` removed) ·
M12 (empty re-measure accepted) · M15 (`BEFORE_FORMS = ["safety"]`) · Mv (verdict guard removed from fill) · Mt (auto-turn treated as user message):
all caught by `test_fixes_1015c.js`. The original M7/M9 strings no longer exist (code rewritten); the equivalents above were used.
The pytest gate was also checked to fail on M15.

## Change requests for files this session was not allowed to edit
- `a34_psy.js` — `A.VIEW_META.psy_item` needs `why`, e.g. `why: "کالیبره‌کردنِ خودسنجی با یک گویهٔ لنگردار: پاسخِ خودت در برابرِ دشواریِ جمعیتی — بی کمکِ دستیار"`.
- `a35_idea.js` — `A.VIEW_META.idea` needs `why`, e.g. `why: "تا ایده پیش از سرمایه‌گذاری با ضعیف‌ترین فرضش سنجیده شود، نه با شوقِ گوینده"`.
- `a37_sources.js` — `A.VIEW_META.sources` needs `why`, e.g. `why: "تا روشن باشد هر منبعِ بیرونی کجای سامانه زنده است و چه کمبودی مانده — جزیره‌ای نماند"`; and its `if (!A.SUB_VIEWS.sources) A.SUB_VIEWS.sources = "mind"` fallback should say `"maps"` (a21 now sets it first).
- `a29_mind.js:152` — the «📏 دوباره‌سنجی» timeline line prints `"شدت " + r.intensity` (Latin digits, no scale, no baseline). Suggest `A.knotRemeasureText ? A.knotRemeasureText(k, r) : …` (a16) so the card shows «ثبتِ نخست … ← اکنون …» in Persian digits.

## Judgment-field audit (item 2)
Guarded per station (`A.epiJudgment`): st_final final/shift/conclusion/act/verdict · every station verdict except st_intake ·
grades.p in st_core, st_shohud, st_hiss, st_aql, st_naql, st_expert, st_istiqra, st_tajrobe, st_yad, st_grade (+grades.base), st_conflict (+cert.y), st_background, st_herm, st_r_struct (+grades.lvl), st_r_sources (+masum.sudur), st_r_conflict (+pairs.ga/gb/real/rule) ·
st_aql prem.st/prem.p · st_expert mval/cval · st_yad origv/memv · st_selfref doubt_sense/thesis_kind/agnostic · st_doubts analogy · st_r_disagree real · st_resp status.
Left fillable (classification / facts the user states, owner may decide otherwise): st_intake (kind, layer, special, stakes, prior = the user's own prior, want, verdict = routing) ·
st_naql mode/sanad/dalala/qarina · st_yad check/orig · st_tajrobe tools · st_istiqra set/kind/rational · st_aql func/form/conseq_*/analog_* · st_expert kind/via/field/relay ·
st_background musts_ok/swap · st_selfref who/covers_self/protagoras · st_doubts pattern · st_herm approach/diff_kind · st_r_readings claim_type/pref/fatwa · st_r_disagree resolve ·
st_r_plural salv/behav · st_resp domain/expert/stakes · st_shohud att. **Candidates for the owner** (grading-like, not guarded): st_naql sanad/dalala/qarina, st_yad check, st_tajrobe tools, st_r_disagree resolve.

## Verification
All 54 page tests (53 `tests/test*.js` + `scan_epi.js`) exit 0; `build.py --check` in sync;
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_learning_architecture_graph_browser.py -q` green.
