## Round 21, runner C (s21–s29): report

None of the nine scenarios is zero-defect: s21, s24, s26, s27 and s28 are PARTIAL, and s22, s23, s25 and s29 FAIL. Most round-20 defects in my group are fixed and the correction trials improved a lot. What still breaks is model routing on opening turns, starting practice from chat, corrections reaching page copies and assistant-composed records, early «تثبیت شد», and the session dossier.

**How it ran**
- Build: aa8f1e06 (ef3c1c67 code); `build.py --check` was in sync.
- All nine scenarios were replayed from the round-20 controls with harness6c.js (a copy of harness5c). Prompts were mapped to round-20 replies by turn text, not by number. I wrote new replies wherever the round-21 rules required it.
- The real date moved to 2026-10-18, so every clock date in the controls and in the reused replies was shifted by +1 day. My first attempt (pinning the clock to the old date) made every record `simClock`, and those records vanished on the day the offset reached 0. Those runs were discarded and redone from scratch.
- All nine have findings.md and DONE, all end with `{"exit":true}`, and nine e-mails were sent with storyboard link C. Profiles are deleted and none of my processes are running.

**Results**
| sid | result | defects |
|---|---|---|
| s21 | PARTIAL | C21-1, 13 |
| s22 | FAIL | C21-1, 3, 4, 5, 13, 14, 15 |
| s23 | FAIL | C21-1, 2, 3, 4, 5, 7, 11, 13, 14, 17 |
| s24 | PARTIAL | C21-1, 13 |
| s25 | FAIL | C21-1, 3, 5, 6, 7, 8, 9, 10, 13, 16 |
| s26 | PARTIAL | C21-1, 13 |
| s27 | PARTIAL | C21-1, 13 |
| s28 | PARTIAL | C21-1, 13 |
| s29 | FAIL | C21-1, 2, 11, 12, 13 |

**Fixed from round 20, checked end to end:** C20-1, C20-4, C20-6 (editor visible), C20-7, C20-11, C20-12, C20-14 and C20-15. C20-10 and C20-13 are partly fixed. C20-3 (now C21-9) and C20-9 (now C21-10) persist.

**Open defects**
- **C21-1 (S2, b):** problem-introducing coaching turns, and coaching messages that end in «…ثبتش کن», go to `lla_assistant`. That is 12 of 89 turns, including every scenario's first turn.
  - Repro: s21 p1, s22 p1/p2, s23 p1, s24 p1, s25 p2, s26 p1, s27 p1–p3, s28 p2, s29 p1.
  - Where: a26 `AS.chatTask`. COACH_HEAD is absent before a live problem exists, the `sig` regexes are too narrow, and ACT_ONLY catches mixed messages.
- **C21-2 (S2, b):** a practice case cannot be started from chat.
  - `start_practice` appears in the prompt only when a case is already open (a41 `PR.promptBlock` returns "" otherwise).
  - The «🧪» view has no start button.
  - The technique select sent to the model is clipped to options 1–25, so 41 is not visible.
  - Repro: s23 p8, s29 p8–p10.
- **C21-3 (S2, b):** page-typed copies get «این‌جا هم عوض شود؟» only when the wording matches exactly.
  - Not asked: s22 ✏️ (her outcome «دفترِ نگهبانی تأیید کرد»), s23 C1 (eggs), s23 C3 (pan size), s25 ✏️ (her look-back).
  - Asked correctly: s22 C4, where the words were identical.
  - Where: a38 `sameFact` / copy-ask.
- **C21-4 (S2, b):** records the assistant composed from her messages do not follow a correction, and the page says «از آن بخش رکوردی ساخته نشده بود».
  - s22 statement keeps «صبح» (filled from two messages, but carries one source).
  - s23 statement and title keep «۲۵×۳۵», and «حل شد» with the 2.8 factor is not set aside.
  - The s25 statement, filled from one message, did follow.
- **C21-5 (S3, c):** pending copies reach the model with raw or placeholder labels («lpNewS», «مثلاً «پیشنهادِ کارِ دوم…»»). A stale draft is treated as her copy, and the candidate list omits plans.
- **C21-6 (S3, c):** the correction line shown to her clips old and new at the same prefix, so they look identical (s25 C3).
- **C21-7 (S3, c):** the post-check flags «صفحه می‌گوید چه چیزی … عوض شد» as a claimed change and asks for a rewrite (s23 p7, s25 p10).
- **C21-8 (S2, c):** after a refused chat_invent, she sees the model-directed line «ثبت نشد: کاربر نخواسته… فقط پیشنهاد بده» directly under the reply «نگهش می‌دارم» (s25 p8).
- **C21-9 (S2, c):** C20-3 persists. The turn question reads «🎯 مجهول هنوز «سه تاشو چک کردم» است…» (s25 p11).
- **C21-10 (S3, c):** C20-9 persists. The closure message is taken as the chat problem statement, and the ✏️ substitution leaves a stray «از» (s25 p13).
- **C21-11 (S2, b):** «تثبیت شد» is declared after one success that directly follows a regression.
  - s29 sessions: 80, 80, 30✗, 80, 40✗, 85.
  - s23: ✗ on 10-29, then ✓ on 11-09.
- **C21-12 (S3, b):** the T41 case line on Today has no lateness label on overdue days (s29, 10-23 and 10-26). The Today recall-trend chart says «هنوز داده‌ای نیست» with 6 measured sessions.
- **C21-13 (S2, b):** the session dossier is titled «(بی مسئلهٔ زنده)» even when a live problem exists, in all nine scenarios. It shows only mind events, with raw «chat|» / «chatok|u|» prefixes and Latin tokens dropped. It leaves out chat guesses, practice_log sessions and corrections. Where: a40 dossierSess.
- **C21-14 (S2, b):** the problem dossier leaves out chat-guess verdicts and their corrections (s22 C1). It shows the outcome «دفترِ نگهبانی تأیید کرد» beside the corrected source with no mismatch note.
- **C21-15 (S3):** the «said result without text» compensation tells the model «صفحه در پیامش نتیجه‌ای نیافت» even when her message plainly reports a result (s22 p6).
- **C21-16 (S3):** the s25 dossier source line points to u2, but the statement text came from u1.
- **C21-17 (S2, b):** a T28 case on a live problem does not take over that problem's lesson card. The card stays on Today «عقب‌افتاده از ۲۷ مهر» every day beside the case line (s23). A T41 case does grade its card.

Not defects (my own replays, class d): the «پنج‌ضلعی», «≤ ۱۰۰» and «مسئلهٔ دوم آزمایشی» records come from replayed round-19 probes. Records live only in the deleted test profiles; no sample flag was added.

**Correction trials (10 corrections plus 7 non-corrections)**
| Scenario | Trial | Turns back / path | Result |
|---|---|---|---|
| s22 | C1 receipt date | 1, chat, sentence with two facts, affects a verdict | ✓ g2 set aside with reason; «۳ میلیون» and «امضای معاون» kept |
| s22 | C2 guard log | 3, ✏️ | Partial: g1 refutation set aside, but her typed outcome was not asked |
| s22 | C3 «امروز ⇐ شنبه» | 7, chat, no verdict effect | ✓ moved to 2026-10-24 with history |
| s22 | C4 «صبح ⇐ ظهر» | 9, chat, value she also typed | Partial: the ask appeared with both values and her «نه» was kept, but the statement still says «صبح» |
| s25 | C1 typo | 1, chat | ✓ nothing to change, and the page said so |
| s25 | C2 telescoping | 3, ✏️ | Partial: her look-back copy was not asked |
| s25 | C3 «۱۰ ⇐ ۸» | 9, chat | ✓ statement followed, «حل شد» kept; the line shown to her was clipped |
| s23 (new) | C1 eggs | 1, chat | Partial: her typed outcome was not asked |
| s23 (new) | C2 «۳۵ ⇐ ۴۰ دقیقه» | 3, ✏️ | ✓ |
| s23 (new) | C3 pan size | 9, chat, affects a verdict | ✗ nothing followed and the verdict was kept |
| all three | Non-corrections (outside action, someone else's mistake, a question) | 7 messages | 7/7 changed nothing |

The assistant never claimed a change before the page result. Versus round 20 (1 of 6 fully followed): now 5 of 10 fully, 4 partly, 1 failed.

**Routing:** 77 of 89 turns correct. All ✏️ turns and «[سامانه…]» follow-ups were `lla_assistant`, «آره، ثبتش کن» was `lla_assistant`, and rewrite turns kept their tier. All 12 errors are C21-1.

**Time and practice (s23 T28, s29 T41)**
- Cases ran over days 1, 3, 5, 7–15 and 21+, including one forgotten day, one late session and one regression.
- Sessions were logged both from chat (practice_log) and from the page.
- In s29, Today showed one line per act per day and stale lines were gone. s23 had a second line for the same act (C21-17), and C21-12 also applies.
- The dossier and the mind card «🏋» now carry the case sessions.
- Against: C21-2, C21-11, C21-12 and C21-17.

**Upgrades needed**
- Route coaching turns by meaning (the coach_state judgement or the first problem message), not by a keyword list.
- Make `start_practice` always available in the prompt, and add a start button to the «🧪» view.
- Give each record one source per span, so a record built from two messages follows a correction to either.
- Detect "same fact" by meaning (the model reports which page field says it) instead of identical words.
- Show only the changed fragment in the correction line.
- Derive stability from the technique's own evidence: several consecutive successes with growing intervals after the last failure.
- Fill the recall-trend chart from case sessions.
- Make the session dossier hold chat-only acts.

**PARTS.md, «نسبت به دورِ ۲۰» column**
- Better: practice box, assistant, chat correction, ✏️ (one engine with chat, editor visible), mind-card stages, «🏋 کارِ تکنیک‌ها», Today (stale lines gone), problem dossier (practice included), test clock.
- New this round: routing (bad on opening turns), «این‌جا هم عوض شود؟» (works only on identical words), session dossier (bad).
- Practice case: better for sessions and schedule, worse for early stability.
- Same: «🧪» view (needs a start button or merging with the problem's practice box), formula tools, chess board, maps, factory claims.
- Running lists: no evidence in group C.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21C/`:
- `defects.md`
- `routing.md`
- `PARTS.md`
- `parts/`
- `s2*/findings.md`
- `s2*/out/` (c0–c5 before/after shots, t*_today, part_practice_*, part_dossier_*, part_dossier_session, view_pre/post_*)