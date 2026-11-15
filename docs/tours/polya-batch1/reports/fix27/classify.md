# Fixer «classify», round 27 — hand-back (branch worktree-agent-a5df0fb0500d504d7, head ff47b029)

Commits:
- 24ac59f5 — C55.
- a100b9af — C22/C38.
- 30545549 — C83, D27-25, C26-32, U24, U52.
- cac4e1a0 — bank.
- ff47b029 — docs.

Suite 152/152, one test at a time; pytest handbook + ownership 14 passed. AS.SYS untouched.
The fixer used WORKLOG 138 / PROGRESS 135; the coordinator renumbers them to 144/141.

## Root causes and fixes
- **B27·D4, U37, D26-40 (one root, `a27_tour.js` `outMap25`):** the register gateway kept her words only when a whole text node was
  hers or sat inside a balanced «…».
  - Page labels glued to her text turned her words into «شما».
  - A «…» inside her text upset the quote depth, so the rest of the page line was never converted.
  - `regDom26` skipped every svg, so the 🧭 labels stayed in «تو».

  Fix:
  - New `ownSpans27`: runs of 3 or more words that appear verbatim (ZWNJ included) in her messages and records are set aside and
    restored byte for byte. The old body is now `outMap25raw`.
  - `regDom26` now converts `svg.rt-svg`; other svg stays untouched.
- **C83 (`pageQuote27`):** a «…» that is not her text is page text and takes the register.
- **C22/C38/C82 (C27-4, D27-33), `a43_age.js` `privBare27`, called at the end of `privPeople`:**
  - Masked:
    - a name after a relative's word with a possessive, when a speech verb follows;
    - the same, when the name is in brackets;
    - the same, when the name is in a closed list of common names;
    - a name before a trailing «آقا/خانم».
  - «خانم X معلممون» ⇒ «[نامِ معلم]».
  - Kept: problem characters, her own name, theorem names and book names.
- **D27-25 (`forHer27` in `regStore25`):** her bubble loses raw ids and model-only clauses; the model still gets the raw text.
- **C26-32 (`a26_assist.js` `open27`):** the second follow-up on an already open record says «باز است».
- **U24 (`a29_mind.js` `priorStep27`):** the prior step is looked up in every ledger of the session.
- **U52 (`gregWrong27` plus a line in `AS.replyCheck`):** a Gregorian date in a reply is checked against the page's own conversion.
- **Bank #321 (`bareAns27` in `coachPhase0`):** a one- or two-word answer is not taken as the problem statement.

## Tests
- `tests/test_tour1_r27_classify.js`: sections c55, names, small, mind, c2633, bank. Every positive was red on BASE27 first and has a
  negative.
- R8 bank: 34/35 green.
  - #317 not met (reason): a narrative first message is still held as the problem. The text alone cannot decide, so this needs a page
    question, which belongs to R6.
  - #296, second half, belongs to dates.

## Not reproduced
- D27-26: after «حل شد» the turn question is a look-back question. The s38 shape is an R4 stage matter, which is prior's.
- C26-33: the pC1 form path keeps the typed plan.

## Not done (HANDBOOK §12 row 84)
- ZWNJ lost in the s19 plan after a ✏️: the cause is correction's text replacement; handed to correction.
- A name outside the list with no speech verb and no brackets is still shown.
- Taken by no one this round:
  - a40 session titles do not call `AS.sessTitle26`;
  - practice cadence D26-30/42/47;
  - U35, U36, U48.
- Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R27_classify_2026-11-15.md`.
