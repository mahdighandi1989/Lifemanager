# Round-15 root-cause decision (main session; binding for the fixer)

Round 15 = 38/38 PASS on criteria, but 18 S3 defects remain (A: E1–E3; B: D2, D3; C: T1; D: items 1–5). Read
reports/round15{A,B,C,D}_handback.md (+ round15X/<sid>/findings.md). DECISIONS_R2–R14 still bind EXCEPT where this file replaces
them. EVERY remaining defect is in ONE place: how `chatItems` (a38_live.js ≈2370–2560) turns the assistant's messages into the options of
«کدام پرسش کمک کرد؟» (`#lpBBest`, `APP.liveChatQs`, `APP.liveChatQItems`).

## Why the last five rounds oscillated

The list SPLITS each assistant message into sentences and then tries to glue back the pieces that belong together: QWORD/HEADQ_RE
(is this sentence a question?), PRAISE/preamble strip, TAILREF_RE/headQ (keep the head before «—»?), XQ/multi + joinKnown (re-join known
multi-sentence page questions), refsBack/demBack (does the next sentence point back?). Each round adds a pattern; each pattern misses the
next wording (dash heads, «مثلاً», «اگر هنوز نه», «و …», «آنجا», «دادی؟», «می‌کند؟», asides inside the page question). The error is
asymmetric (Pólya + R5/F1 here): an option that is a little LONG is harmless; an option that is a FRAGMENT without its referent, or a
question that silently DISAPPEARS, is a defect. So the default must be to keep together, never to split.

## O1 — one option = the question passage of one assistant message (replaces the sentence splitter)

Within the window (N1 stays as is), each assistant message contributes AT MOST ONE option: its question passage.
- A sentence is a question iff it ends with «؟»/«?» (any person, any verb — «می‌کند؟»، «دادی؟»). Drop QWORD/HEADQ as the gate (keep
  only the rhetorical exclusion that already exists for praise tags if it is still needed by a test — prefer none).
- The passage = from the START of the sentence that contains the first question (its head before «—», its «مثلاً»/«و»/«اگر» parts and
  its asides all included) to the END of the last question sentence of that same contiguous run. Contiguous = no non-question sentence
  between them. A second, separated question run in the same message is appended to the same option only if it starts with an anaphor or
  connective (آن/این/اش/آنجا/همین/و/یا/مثلاً/اگر/«—»); otherwise it is the same option too if the message has only one run — in short: one
  option per message, joined with « … » if two runs exist.
- If the first question sentence itself starts with an anaphor/connective or an anaphoric deictic («آنجا»، «از آن»، «به آن») AND the
  sentence before it in the message is a non-question, include that preceding sentence (that is where the referent lives: s31 «گامِ اولِ
  حلت», s35, s38 «فرض کن حجم را داری»).
- Strip ONLY a leading pure discourse/praise clause (ولی/اما/خب/خوب/آفرین/عالی/باشه/درسته + its comma) and a leading «—»/bullet. Never strip
  «مثلاً», «اگر», «و», or a head before «—».
- Text quoted from the user or the page title inside «…» stays as is (it is part of the question's wording).

## O2 — dedupe by page-question KEY SETS, answered-on-page by FIELD

- Key each option by the SET of page questions it contains (sameQBoth per question sentence against the problem's page questions —
  the phase lists in force when it was asked, including the tour's prove/practical lists, not only the current generic phaseQs (A·E1 s03)).
- A page question counts as answered on the page when its list answer exists OR its own field is filled (u0/Q_WHOLE ⇐ lpOne; same for every
  page question that has its own field — enumerate them from the card definitions, do not hard-code only u0) (C·T1).
- Drop an option ONLY if every question sentence in it is keyed AND every key is answered on the page. An option with any un-keyed
  (own-words) question stays, whole (A·E1 s01).
- Options with the same non-empty key set collapse into ONE — the most recent wording (C·T1: short + long whole-first).
- The page-option side (📄) keeps its current behaviour; a 💬 option whose keys are all also shown as 📄 options is dropped only if those
  📄 options are present in the same list.

## O3 — remove the dead patch layer

XQ/multi/joinKnown/ownTail/refsBack/demBack/TAILREF_RE/headQ/SPLIT_Q-for-options become unnecessary. Do NOT delete exported functions
other modules use; internal helpers that nothing else calls may be removed from chatItems' path but keep any symbol another file or a test
references (grep first; quarantine-not-delete for anything exported). Keep the N1 window, the dormant/chat_invent naming rule and the
pre-creation inclusion exactly as they are.

## O4 — test-suite diagnostics (gate reported red by routines, not reproducible here)

`tests/test_tour1_r11_coach.js` section `struct` spawns the r7–r11 fixtures under prompt_tap and only checks how many prompts each
produced. Record each child's exit code, signal and last 600 chars of stderr; on any failure put them in the error message, so a red gate in
another environment explains itself. Behaviour otherwise unchanged (same files, same checks, same LLA_TAP_JOBS/LLA_STRUCT_FIX knobs).

## Tests (red first, then green)

A new `tests/test_tour1_r15_live.js` with one case per defect id above (A·E1 s01+s03, A·E2 s10/s08/s03, A·E3 s02, B·D2 s11, B·D3 s13,
C·T1 s21, D1 s34, D2 s31, D3 s31/s35/s38, D4 s30, D5 s37), built from the runners' quoted messages, PLUS controls that must stay:
two separate questions about two different problems stay in their own problem's lists; a page question answered on the page is not a 💬
option; the round-14 R1/N2 cases (pre-creation questions present, own words); a praise-only «آفرین، ادامه بده.» is not an option.
Update any older r10–r14 test expectations that encoded the SPLIT behaviour, stating in the test comment that R15/O1 replaced it.

Process: base = branch tip 33271d0 (fast-forward). Ownership «live» = a38 (+ the r11_coach test for O4). Run every
`apps/learning-architecture/tests/test*.js` (or the pytest browser suite) before handing back; `python3 apps/learning-architecture/build.py`;
commit small (tests red-first, then fix, then O4, then handoff note `_pending_tour1_R15_live_2026-10-17.md`). Do not push main.
