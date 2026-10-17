# Model-tier tour — tier 1 = haiku (8 scenarios, same page main a94614ae, harness5, R19 user turns)

Protocol: the driver wrote only user turns (R19 ctl, problem ids re-mapped); a haiku RESPONDER wrote every ai/rN.txt from ai/pN.json alone.
61 replies (53 to user turns + 8 auto-continuations). Responder timeouts: 0 (no STOP). User-turn adaptations: 21 minimal edits + 1 inserted
recovery turn (s25), all in <sid>/adapt.log. Note: the first launch (20:08) died with the session limit before any reply; dirs were wiped and
re-run from scratch at 22:42. Excluded from the model's score: s29 r3 (the attached sketch never reaches a text-only responder: fileIds=[901]).

## Per-scenario result (vs round 19, same turns)
| sid | kind | haiku | R19 | main reason |
|---|---|---|---|---|
| s03 | olympiad proof | PASS (S3) | PASS | spotted the boundary gap itself (r5/r6); invented praise in r1 |
| s10 | impossibility | FAIL (S2) | PASS | asked the same question 3x, ignored her counting argument |
| s18 | related rates | PASS (S3) | FAIL S3 | full Pólya sequence; 3 two-in-one questions |
| s19 | life plan (weight) | FAIL (S2) | FAIL | refused the plan as "medical", rerouted to knots unasked; 0/2 step reports |
| s25 | induction | PARTIAL (S2) | PARTIAL | chat_invent instead of live_new: page didn't open, 4 extra calls |
| s29 | garden + pond | FAIL (S2, partly page) | PARTIAL | said "garden still open" against the page; pond live_new not opened |
| s31 | max product, impatient | FAIL (S2) | PASS S3 | x/(10−x) reinforced her error; retract in the wrong format (lost); confirmed the answer; taste not kept |
| s38 | deadline, tired | PARTIAL (S2) | PASS S3 | no chat_solved for either problem; mind card: «فهم» weakest 91% from wrong ph labels |
Totals: 2 PASS · 2 PARTIAL · 4 FAIL (R19 on the same turns: 4 PASS-level · 2 PARTIAL · 2 FAIL).

## Rates (counted)
| metric | count | rate |
|---|---|---|
| valid JSON | 61/61 | 100% |
| coach_state present (user-turn replies) | 51/53 | 96% |
| contract format slips (retract as top-level action, said:result w/o text, taste as object, result from an earlier message) | 4/51 | 8% |
| result passes the page's verbatim check | 29/30 | 97% |
| result is really a result (not a check, history, claim, intermediate step, "حل شد") | 11/30 | 37% |
| her guesses captured and accepted by the page | 0/6 (3 reported, all paraphrased ⇒ rejected; +1 made-up guess) | 0% |
| defer accepted | 2/4 (s19's two were paraphrased) | 50% |
| step outcome reported for a live step | 0/2 | 0% |
| self-correction (retract) applied | 0/1 | 0% |
| stated taste recorded | 0/1 | 0% |
| ph label plainly wrong (with effect on the mind card) | ≥9 turns, distorts 3/8 cards (s19, s31, s38) | — |
| max one question per turn: two «؟» | 0/53 | 0% |
| two questions joined in one sentence («…، و …؟») | 7/53 | 13% |
| «حل شد» confirmed/judged although the rule forbids it | 3 (s18r6, s31r8, s31r9) | — |
| live_new only after her yes (🔭 offer-only) | 4/4 | 100% |
| records/tunnels made without her yes (chat_invent ×3 s31r10; kcases case s19r2) | 2 incidents | — |
| wrong tunnel for "ثبتش کن" (chat_invent vs live_new) | 1 (s25) | — |
| ignored her answer / contradicted the page state (s10 ×3, s29r2, s25r9) | 3 scenarios | — |
| formula in reply wrapped in $…$ when the formula line was present | 1/11 | 9% |
| Latin leakage outside formulas / register lost | 0 / 0 | — |
| Persian slips (garbled or ungrammatical) | 2/61 | 3% |
| scope misjudgment (an in-scope life plan refused) | 1/8 scenarios | — |
| mind card plausible after the scenario | 5/8 | 63% |

## Failure classes and verdicts (page can compensate vs stronger tier indicated)
1. **Field semantics: result for non-results (19/30), wrong ph (≥9).** The page's verbatim check passes them (29/30), so it cannot see the error;
   the mind card then counts false successes and names the wrong stage weakest (s31: look-back; s38: understanding 91%; s19: understanding).
   → **PAGE CAN COMPENSATE (mostly):** do not take the stage from the model's ph without the person's own evidence (page events/phase), accept
   result only when the text is result-shaped (an answer, a value, "ثابت کردم") and not check/history/claim (there is a checks field), and name
   no weakest stage from model-only labels. Evidence: every misuse sits in a quoted span the page could classify itself.
2. **Paraphrased quotes (guess 0/3 accepted, defer 2/4).** The paraphrases were faithful (s25 r1/r10, s29 r1 keep her formula/claim).
   → **PAGE CAN COMPENSATE:** match by tokens and math after normalising (k↔n, ۱/(k(k+1)) ↔ 1/(n(n+1))) or ask for message-span offsets; one re-ask
   with "quote these words exactly: …" in a short structured prompt.
3. **Contract format slips (4).** `{"do":"retract"}` at top level (the only self-correction of the round was lost), `taste:{text:"unknown"}`
   (the prompt itself gives both shapes), said:result with no text. → **PAGE CAN COMPENSATE:** accept the aliases; this is cheap.
4. **Missed reports (step 0/2, taste 0/1, guess recall 3/6).** → **PAGE CAN COMPENSATE PARTLY:** a targeted yes/no line when an open live step
   exists ("does this message report step N? done yes/part/no"), and the taste line already exists but was ignored once. Not enough
   data to put this on the tier.
5. **Tool/tunnel choice (s25 chat_invent for "register and go step by step"; s29 second live_new never opened; s19 knots unasked; s31 three
   unrequested chat_invent).** → **PAGE CAN COMPENSATE:** open every live problem created on her request (the R19 runner reached it through the
   form, haiku's direct live_new did not navigate); turn chat_invent into live_new when her message asks to work now; refuse a chat_invent/new
   record when her message has no request (the consent rule is checkable).
6. **Rule slips in the text: two questions in one sentence (7/53), confirming «حل شد» (3).** → **PAGE CAN COMPENSATE:** a post-check that
   flags «، و …؟» double questions and verdict phrases and asks once for a rewrite.
7. **$…$ (1/11).** → **PAGE COMPENSATES ALREADY:** the plain-math renderer shows dy/dt, √۲/۲, a/2; no tier signal.
8. **Coaching judgment at the pivotal moment.** In 4/8 scenarios the decisive turn failed: s10 (asked "the six rules" 3x and missed her key
   counting argument), s31 r4 (the hint strengthened her false "two numbers"), s38 (never led to the cutting plane; her "آها" is scripted),
   s19 (refused her plan as out of scope). In each, the person's breakthrough came only from the scripted R19 text, not from haiku.
   Counter-evidence: on standard textbook problems haiku's Pólya questions were good (s18 full sequence, s25 r7–r8 induction, s03 found the
   boundary gap that R19 only found in look-back, s38 r4 "why a/2?"). → **STRONGER TIER INDICATED for coaching turns on deep, ill-posed or
   life problems.** The page cannot supply the missing judgement; the prompt (≈72k chars) already contained what was needed (her answers,
   the open live problem, the life tunnel).
9. **State-blindness (s29r2 "garden still open" though solved in the page; s25r9 "before closing" after closure; s31 promise "سؤال بعدی" never
   kept; s10 repeats).** → **MIXED:** the page can put a one-line, top-of-prompt "now: problem X is solved / you asked Q and she answered A"
   (it has qmap/ansBy), but the data shows haiku already ignored such information inside the long prompt. Shorter prompt + re-ask first;
   if it persists, use a stronger tier.

Bottom line from the counts: haiku is reliable as a JSON and actions writer (100% valid, 96% coach_state, 100% offer-only for live_new,
no Latin leakage), and classes 1–7 are fixable by page validation, aliases, a structured re-ask and navigation. The scenario failures
that are left (class 8, and 9 in part) are judgment failures in coaching turns on deep or life problems. Those turns should go to a stronger tier.
