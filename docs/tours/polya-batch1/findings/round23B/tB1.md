# tB1 — نسرین و جعبه‌قرصِ هوشمند (قلمروی که سامانه ندارد) — ROUND 23 (runner B)

## خلاصه برای مالک
نسرین (۳۱ ساله، طراحِ صنعتی) می‌خواست ایدهٔ جعبه‌قرصِ هوشمند برای مادرش را به برنامه تبدیل کند. با پرسش‌ها معیارِ موفقیت را با عدد گفت (حداکثر یک هشدارِ اشتباه در ماه)، دانسته‌ها و نادانسته‌ها را جدا کرد، با آزمایشِ ۲۰ باره نشان داد یک بار خواندنِ ترازو بس نیست و دو بار خواندن را حساب کرد. برای «آیا کسی قبلاً ساخته یا ثبت اختراع کرده؟» صادقانه شنید که سامانه روشی ندارد؛ دستیار پس از سنجشِ جاهای نامزد و نظرِ دوم برگهٔ «کمبودِ سامانه» (#۱۰۱) را با همهٔ بخش‌هایش ثبت کرد و آن زیرمسئله را «منتظر» گذاشت. ولی «منتظر» فقط در متنِ دستیار است و هیچ حلقه‌ای نیست که وقتی آن روش ساخته شد، به او خبر بدهد و کار را ادامه دهد.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۳۱ (کارت، 1995-07-14) — بزرگسال

## Criteria (written criteria + round-23 requirements)
- [PASS] Idea ⇒ known/unknown map (p3): knowns (0.3 g pill, Arduino, cheap scale), unknowns (1) resolution, (2) phone message, (3) prior art; success criterion with a number (≤ 1 false alarm/month).
- [PASS] Sub-problem (1) solved by her test: 19/20 ⇒ ~3 false alarms/month (guess refuted) ⇒ double reading ⇒ (1/20)² ⇒ 0.15/month, with the independence assumption named as still to test (p5–p7).
- [PASS] Sub-problem (2): known method from her past project (no prerequisite needed).
- [PASS] (3) differential diagnosis in the reply (💡 idea view has assumptions/design problems but no search method; the factory judges claims, does not search); `status: gap` with title/area sys-territory/kind/abstract/missing/where/how/relations/docs/why_area/why_not/evidence (her quote)/confidence 0.8; second opinion agreed ⇒ «🛎 برگهٔ فوری #۱۰۱ … ثبت شد»; sheet text follows the AGENTS.md contract (machine labels line, owner routine, precheck procedure).
- [FAIL] Waiting sub-problem not a record (only `steps` text); no loop «built ⇒ noticed ⇒ checked ⇒ resumed» (B23·D7, S2 gap as required).
- [FAIL] The prompt's territory map is truncated (s_comm, s_self missing; s_problem cut mid-line) — the diagnosis could not see all systems (B23·D16).
- [PASS] Routing 6/6 user turns lla_coach (p4 is the page's internal second-opinion call).

## نقشهٔ نیاز
**Parts:** assistant as «پزشکِ عمومی» (FOR: differential diagnosis before referral, honest gap) — met; gap sheet (FOR: complete, routed to the right owner) — met; 🗺 territory map in the prompt (FOR: what exists) — truncated; resume loop — missing.
**Person:** an inventor needed each sub-problem solved or honestly parked, and to be told when the parked one becomes possible — first part met, second not.

## پیش‌نیاز
No missing prerequisite for her steps (she knew the sensor and the module); (3) is a missing system method, not her gap — correctly not a 🧩 prerequisite.

## آزمودنِ اصلاح
Not a correction-trial scenario.

## سن (RUNNER23 §1)
Adult ✓.

## Routing
### tB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه ایده دارم و می‌خوام از ایده برسم به یه برنامه‌ی واق…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «اگه ماهی بیشتر از یه بار هشدار اشتباه بده مادرم کلافه میشه، …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه
## نماها (view — نام — کدام کار — چیست — به چه کار می‌آید…» | learning_architecture | lla_coach | ✗ |
| p5 | coaching (problem talk) | «ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ ت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ ی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی …» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Waiting sub-problem record linked to its sheet; when the sheet is answered/built, the page tells her in Today and the assistant resumes the step with the new tool (owner's loop, roadmap §19).
- Full territory list in the prompt (or `know` on demand) so a gap diagnosis sees all six systems.

## ایده‌ها
- «Prior-art» worksheet inside «💡 جایگاهِ ایده» (function, keywords, sources, similarity verdict, date) — the exact content of sheet #101; part need: idea view's design problems; person need: decide before spending.

RESULT: FAIL
