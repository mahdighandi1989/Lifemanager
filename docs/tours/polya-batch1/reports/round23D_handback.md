## Round 23, runner D: 16 scenarios run, none of them zero-defect, and only 1 of 16 e-mails went out

I re-ran s30–s38 and dp1–dp3 and added four new scenarios: aD1 (age 9), aD2 (age 14), aD3 (age 67, with look-back as the main act) and oD1 (an owner-like user whose idea needs a territory the system lacks).

**E-mail:** only s31 was sent (id 1a15003d711feff4). The permission classifier refused s30 and s32 as a "Real-World Transactions" action, and the service was unavailable for s33. I did not retry or attempt the other 12. All 16 bodies are in `round23D/<sid>/mail.html` with their subject lines in `mail.subject.txt` — they need a session that is allowed to send.

**Setup:**
- Page was main 574f4a30 with the dist built at 16:02; `build.py --check` reported it in sync. Time moved with the in-page Date patch, as in round 22.
- Old replies came from round22D. Field keys (kN) are now remapped by their label, because new buttons (🧭) shifted every key. Without that remap the replayed s33 reply gave a raw "Illegal invocation" error, which can reach the user (D23-29).
- Every scenario has `findings.md`, `routing.md`, `part_*` shots (dossier, 🧭 route map, hover shots, mind card) and `DONE`. The `ai/` folders are kept; browser profiles are deleted and none of my processes are running.
- `better/` replies exist for dp2 p5, dp3 p5, aD3 p4 and oD1 p17.
- Shared files: `CATALOGUE.md` (defects D23-1…40), `PARTS.md` (with the "compared with round 22" column), and a new line in `STORYBOARD_LINKS.md`. All paths are under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23D/`.

### Results per scenario
| Scenario | Result | Main points |
|---|---|---|
| s30 | PARTIAL | D23-3 regression (S2): after the 800→750 correction, the form row she typed herself is no longer asked about and stays 800. D23-11 persists (S3): tickets look-back list still has the packaging question. |
| s31 | PASS | Not zero-defect: D23-26 (teen age-block sentence garbled into «تو فقط پرسشِ همین پاسخ کن») and D23-40 (her invented problems still not in Today). Routing p17 and T24 stability text are fixed. |
| s32 | PASS | List page now has verdict/close controls and the overdue deadline asks «تحویل دادی؟». Route geo-strip destination is a random fragment of her message (D23-21). |
| s33 | PARTIAL | D23-1 regression (S2): «…حق داره؟ بگو نه دیگه.» is read as a correction, so p1 goes to lla_assistant (`a27_tour.js:4507`). |
| s34 | PASS | No defect within the scenario (the run-wide gaps — e.g. the D23-37 loop — are not counted per scenario). Copy-ask text no longer garbled, sufficiency verdict kept, T23 misfit warning shown. |
| s35 | PARTIAL | D23-6 persists (S2): changing the "what" of the deadline (شورایاری ⇒ شهرداریِ منطقه) is refused. |
| s36 | PASS | The correction ending with «؟» is now accepted and asks three copies; «یه ماه دیگه» sets her rhythm. Open: guess "~10 L — correct" is not set aside after 20→30 (D23-9). |
| s37 | FAIL | D23-4 regression (S2): «؟۴۸۷؟ ⇐ ؟۴۵۷؟» gets "nothing was recorded"; statement, verdict and guess unchanged. D23-5 (S2): spurious copy-ask moved from the lesson to the plan. |
| s38 | PASS | Deadline fix 11 turns back works and the lesson is no longer garbled (it is asked). The ask line shows identical truncated old/new text (D23-12). |
| dp1 | PASS on prerequisite criteria | D23-14 (S2): a stuck turn inside the open detour is booked as an execution minus. D23-20 (S2): route map of the closed problem has no rejoins. |
| dp2 | PASS on prerequisite criteria | Self-made learning booked; day-2 use booked as practice. Geo strip shows the solved problem as «اکنون: فهمِ مسئله». |
| dp3 | PASS on several and nested prerequisites | D23-13 (S2): mastery-yes rewrite forces a second question beside a new prerequisite's diagnostic. Also D23-25, D23-15, D23-38, D23-20. |
| aD1 (9) | PASS on Pólya and tone, FAIL on system criteria | D23-2 (S2): «سلام من کیانم کلاس سومم» hides the problem, so p1 goes to lla_assistant. D23-25 (S2). D23-27/28 (S3). |
| aD2 (14) | PASS, FAIL on the date card | Safety lines worked (refused school name and phone; "talk to your father, the decision is yours"). Two Today lines for one act (D23-31). |
| aD3 (67, look-back) | PASS on look-back and prerequisite, FAIL on one correction | D23-7 (S2): «۶۷ ماه اشتباه بود» rewrote her guess text to 61.5 and removed its "refuted" outcome. |
| oD1 (owner-like + missing territory) | PARTIAL | Sheet #101 filed with full fields after the second opinion. D23-8 (S2) correction dropped «هر قرص»; D23-24 (S2) waiting sub-problem not marked; D23-37 (S2) no resume loop; D23-33 deferred request forgotten; D23-34 failure booked under «فهم». |

### Age verdicts
- **What works:**
  - The «# مخاطب» block is correct for child, teen and elder, and is empty for adults.
  - Before a birth date exists, an "age unknown" block is used.
  - A birth date the model reads from her own words is accepted.
  - The mind card says «برای این سن هنجارِ معتبر در دست نیست (گروه‌های معتبرش ۱۸–۴۹)» for ages 9, 16 and 67.
  - Tone in the replies fits each age, and the Pólya logic is unchanged.
- **D23-25 (S2):** the birth-date card accepts only Gregorian YYYY-MM-DD. Four Jalali dates were refused, and a child or elder in Iran cannot enter one. The age was set only because the model converted it from chat.
- **D23-26 (S3):** the teen block's instruction is garbled by the one-question pass (the «تو فقط پرسشِ همین پاسخ کن» sentence above).
- **D23-27 (S3):** the adult-normed daily puzzle is offered to the 9-year-old.
- **D23-28 (S3):** the child's name ends up in the problem title.
- **All replayed personas:** each got a birth date matching the persona age through the card, and the page applied the age correctly (s35 elder; s31, s36, s38, dp1, dp2 teen).

### Prerequisite verdicts (P1/P2)
- **Works:**
  - exact concept and step named
  - one diagnostic question
  - teaching only as far as the step needs, then a mastery check
  - nested stack (dp3: main ⇐ Pythagoras ⇐ (a−b)²) with exact return at each level
  - 🧩 item created
  - mind card cause "prerequisite"; learning booked as progress, including in the teacher role
  - «خنگم» answered with the named gap
- **Defects:**
  - D23-13, D23-14 and D23-20 (see the table above).
  - D23-15: «مغزم دیگه نمی‌کشه» is not recognised as a self-label.
  - D23-16: the 🧩 record is not linked once a chat problem becomes a live problem.
  - D23-18/19: stale turn questions such as «مجهول چیست؟» right after she stated it.
- **🧭 shots:** taken before the detour, inside the nested detour, and after the return. Hover was tested on every point type.

### Correction trials vs round 22
| Scenario | Trial | R22 ⇒ R23 |
|---|---|---|
| s30 | copy typed with different wording | ✓ ⇒ ✗ |
| s34 | ✏️ «اسکیس» | garbled ⇒ ✓ |
| s34 | 3→2 months | ✓, and the sufficiency verdict is now kept |
| s35 | plan date and deadline date | ✓ / ✓ |
| s35 | deadline "what" part | ✗ / ✗ |
| s36 | correction ending in «؟» | refused ⇒ ✓ (asks + «حل شد» set aside) |
| s37 | datum she also typed | ✓ ⇒ ✗ |
| s37 | ✏️ several numbers | spurious ask persists, moved to the plan |
| s38 | deadline | ✗ ⇒ ✓ |
| s38 | lesson | garbled ⇒ asked |
| s38 | non-corrections | ✓ |
| aD3 (new) | refuted own result treated as a misstatement | ✗ |
| oD1 (new) | number fix drops words; dependent guess untouched | ✗ |

### Routing
2 wrong out of 170: s33 p1 (D23-1) and aD1 p1 (D23-2). Last round's four errors (s31 p17, s34 p14/p16, s35 p1) are fixed. The strict prompt scan found no prompt with a second unmarked question directive.

### PARTS.md summary (vs round 22)
- **New:**
  - route map + geography strip
  - age layer
  - sheet filing with second opinion (first exercised in group D)
- **Much better:** prerequisite layer (was the S1), mind card causes.
- **Better:**
  - routing
  - dossier (one correction event, in the right problem)
  - practice cases
  - running-list controls
- **Same:** correction engine (5 fixed, 2 regressions, 2 new), post-check, page turn question, Today (one act still shows two lines).

### Owner-like scenario (oD1)
He asked nine owner-style questions, eight from the owner question bank, in natural words. Each answer pointed to where it lives:
- system scope ⇒ «💡 جایگاهِ ایده»
- "is it saved?" ⇒ dossier
- "does a correction reach everywhere?" ⇒ the mechanism (whose execution was partly faulty, D23-8)
- "where does the mind card come from?" ⇒ «از کجا؟»
- route map ⇒ opened the view
- sheet filed? / resume loop? ⇒ honestly said the loop does not exist
- model dependence ⇒ method no, wording quality yes
- "do you remember?" ⇒ answered from the dossier
- "this is too general — where exactly?" ⇒ exact records, plus an admission that his prediction had not been recorded

D23-36: the system map in the prompt is truncated before the gap decision.

### ارتقای لازم (needed upgrades)
- Accept Jalali birth dates, and «X سالمه، تولدم روزِ Y», with conversion on the page.
- A loop from a filed sheet to the waiting step: notice when it is built, check it, resume. Show the waiting point on 🧭.
- A route map for chat-closed problems with rejoins, nesting depth and the plan stated in chat.
- Book every stuck turn between diagnosis and mastery as caused by the prerequisite.
- In the correction prompt, separate "I misstated it" from "my result was refuted", and add a result (`ans`) candidate.
- Treat number + count word (کارتن, تا) and masked digits («؟») as the same fact.
- A guard so short follow-up replies cannot shrink the session memory (I made this mistake myself in oD1).
- Store deferred requests as promises.
- One Today line per act: link plan, follow-up and forecast.
- Strip greetings and self-introductions from problem titles.

### My own mistakes (class d)
- Two wrong numbers in an aD3 message and a wrong date in oD1; I fixed both and re-ran those scenarios from the start.
- In oD1 my replies wrote short memories and reported a "knot" where a prerequisite was the better call.
- dp2 p5 is a round-22 reply that did not ask the taste question the page asked for.
- A route helper reopened the assistant panel over one shot; I fixed it and re-ran dp1–dp3.