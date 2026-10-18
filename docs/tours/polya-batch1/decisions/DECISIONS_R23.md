# Round-23 decisions — ROOT MECHANISMS (main session; binding)

Round 23 (main 574f4a30) added age scenarios, missing-territory scenarios, owner-like personas, look-back-family scenarios and the prerequisite
re-runs. Zero-defect scenarios: A 0/18, B 3/18 (s15, s16, s20), C 1/17 (s27), D 1/16 (s34) — 5 of 69. No S1.
- Better since round 22:
  - The round-22 S1 (prerequisite) is fixed: single, sequential and nested prerequisites work end to end in every group.
  - The route map exists.
  - Age bands, tone and minors' safety hold in every group.
  - Gap sheets are filed per contract, with a second opinion.
  - Routing: B 182/182, C 205/206, D 168/170, A 2 wrong.
  - Running lists can be written from chat.
  - Owner-like personas got evidenced answers.
- Still failing: correction copy regressions; Jalali dates; chat ⇄ forms/route disconnect; stage not advancing from chat; the territory
  resume loop (not built yet).
Reports: reports/round23{A,B,C,D}_handback.md, round23A/defects.md, round23B/CATALOGUE.md, round23C/defects.md, round23D/CATALOGUE.md,
round23X/<sid>/findings.md (with «## ایده‌ها»), round23X/PARTS.md. EVERY defect listed there binds, including S3 in PASS scenarios
(owner 2026-10-18). DECISIONS_R2–R22 bind except where replaced.

## Root mechanisms
Q1 — AGE AND IDENTITY SURFACE.
  - Jalali dates everywhere a date is typed: the birth card, the birth action, and «X سالمه، تولدم روزِ Y». Persian/Latin digits and month
    names are all accepted, converted on the page, with a human error message (A23-1, B·D6, C23-8, D23-25).
  - Page-written lines follow the conversation's register: a «شما» user never gets «تو» (A23-14, B·D9).
  - The teen block sentence is not garbled by the one-question pass (A23-9, B·D8, D23-26).
  - The system map tells the model what age is used for, where data is stored, whether it works offline, and that it is model-independent
    (A23-28, A23-38).
  - The adult-normed daily puzzle is not offered to children (D23-27).
  - Greetings and self-introductions are stripped from problem titles, statements and 🧩 titles; a child's name is never put in a title
    (A23-7, C23-12, D23-28, B·D10).
Q2 — PREREQUISITE REFINEMENTS.
  - PRE.scope covers the opening turn (C23-3).
  - Every stuck while a prerequisite stack is open, and earlier «نامعلوم» stucks of the same step once the diagnosis lands, are booked
    cause = prerequisite, in the mind card AND the dossier (A23-22/18, C23-2, D23-14, B·D18).
  - A stuck caused by a missing system tool is booked cause = system, never her weakness (C23-2 tC1).
  - The stack:
    - no mastery close while a child is open; return to the nearest open waiting step (A23-23);
    - the mastery rewrite never forces a second question beside a new diagnostic (D23-13);
    - no forced restatement after she already took the step (B·D10).
  - The ability rule stays active after the problem is closed (B·D1), and «مغزم نمی‌کشه» counts as a self-label (D23-15).
  - The 🧩 link follows a chat problem that becomes live (D23-16).
Q3 — CHAT ⇄ PAGE IS ONE STORY.
  - Validated chat events (statement, plan, u/b answers, step reports, guesses) feed the forms, shown as «از گفت‌وگو: … درست است؟», never
    re-asked (C23-11).
  - The live stage advances from coach_state.
  - The whole-first question is dropped once she said the whole in chat (A23-35, A22-27, B·D5).
  - A live problem created later imports the chat work.
  - Route map for chat problems:
    - origin = statement, destination = the unknown, main-line steps from the chat plan;
    - nested depth and rejoins are kept after chat_solved/closure (B·D2, D23-20);
    - every event is bound to its own problem (A23-32);
    - labels show the concept name, unclipped, with the real guess outcome and hover tips (A23-8, C23-13);
    - the geo strip is never stale after a solve (C23-14, D23-21).
  - The model can open a chat problem's route through a route action or session id (B·D17).
Q4 — CORRECTIONS.
  - Copy candidates include the pinned goal, numeric results (ans), the live statement and every typed form row (regressions A23-21/30, D23-3).
  - Number role is respected (B·D3): a range bound «۱۰ تا ۲۰» is not «۲۰»; count words (کارتن/تا) and masked digits «؟۴۸۷؟» count.
  - Each pair of a multi-pair ✏️ edit is applied (C23-4).
  - Deadline "what" part (D23-6); no garble (B·D4).
  - "I misstated" is told apart from "my result was refuted"; a refuted own result is never rewritten (D23-7).
  - A number fix never drops neighbouring words (D23-8).
  - Without `rests`, keep verdicts that do not consume the corrected datum (C23-5).
  - A chat «بله / آره عوض کن» answers the open copy ask (C23-22).
  - Fix the s37 «؟۴۸۷؟ ⇐ ؟۴۵۷؟» regression.
  - Never change her typed copy silently (B s19).
  - The change line shows the differing part, with a reason (C23-16, D23-12).
  - Dependent guesses follow (D23-9, oD1). The title follows (B·D19).
Q5 — CLASSIFICATION, ROUTING, TURN QUESTION, POST-CHECK.
  - Practice self-reports, model-use reports and greetings are never a new problem or A191 (C23-1, A23-13, B·D13).
  - Opening turns hidden behind a greeting or self-introduction route lla_coach (A23-2, C23-19, D23-2).
  - «بگو نه دیگه» is not a correction (D23-1).
  - The correction backup block never fires on a non-correction (A23-4, A23-17, B·D14).
  - The post-check counts the page's own two-sentence turn question as ONE, in every path (A23-20, A22-1, persisting).
  - «ثبت شد / ثبت می‌شود» with no correction in play is not a claim (C23-6). Cheat-sheet false positive (B·D20).
  - The turn question:
    - never re-asks a check she has just reported (C23-17);
    - never asks something unrelated to her request (C23-23);
    - never asks a stale «مجهول چیست؟» (D23-18/19);
    - e4/e5 only at their moment (A23-6);
    - «I proved it, why?» opens look-back (A23-3).
  - One page question never holds three questions (B·D12).
  - Quotes inside the reply text are validated against her messages (C23-21).
Q6 — TERRITORY LOOP (roadmap §19).
  - A sub-problem waiting on a sheet is marked with the sheet id on 🔭, the route map and the dossier (A23-36, D23-24).
  - The page notices when the territory is built: a registry change, or the sheet closed with «پاسخ به برگهٔ دستیار #n».
  - It verifies the new thing answers that step, adds a Today line «ابزارِ لازم آمد», and resumes the step (A23-37, B·D7, C23-18, D23-37).
  - The full territory/system list goes in the prompt, never truncated before the gap decision (B·D16, D23-36).
Q7 — TODAY / DOSSIER / LISTS / PRACTICE / PROMISES.
  - One Today line per act: plan ⇄ follow-up ⇄ forecast ⇄ case (A23-11, D23-31).
  - Look-back invented problems appear in Today (D23-40).
  - `deadline_done` after she reports it (B·D15).
  - No raw ids «(pl1)» (C23-9); no raw refuted/confirmed in the dossier (C23-15).
  - Chat guess outcomes appear in the dossier (C22-11, B·D23).
  - Duplicate correction and result lines removed (A23-16/24/29).
  - Deferred requests are stored as promises and return (D23-33).
  - list_add accepts a quote composed from consecutive messages (C23-7); no duplicate model items (C23-20, B·D21).
  - The practice window is consistent (A23-12).
  - A prediction is never re-read as a guess (A23-15).

## Fixers (five worktrees; base = main 574f4a30)
- ageclass (Q1, Q5): a43, a26, a27 classification/post-check/turn question.
- prereq (Q2, Q6): a44, a29, the waiting marker and resume loop.
- story (Q3): a38 forms ⇄ chat, stage advance, route model for chat problems (a44 route parts in coordination with prereq).
- correction (Q4): a38/a40/a27 retract and copy.
- today (Q7): a41, a42, a40 dossier lines, a33 deadlines.
Docs numbering: WORKLOG 94–98, PROGRESS 109–113, in the order above. Independent bank VARIANTS_R23 written in parallel. Merge order:
correction ⇐ story ⇐ prereq ⇐ ageclass ⇐ today (each merges the finished siblings the coordinator names).
