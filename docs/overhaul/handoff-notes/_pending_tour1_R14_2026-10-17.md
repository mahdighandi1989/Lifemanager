# Tour 1 (Pólya), round 14 (zero-defect round 6): fixer handoff (2026-10-17)

Scope: N1 and N2 from `DECISIONS_R14.md` (DECISIONS_R2–R13 still bind). Base bd815fb. One fixer, file `apps/learning-architecture/src/app/a38_live.js`
(msgWin / joinKnown / chatQs / the look-back's «کدام پرسش کمک کرد؟»). Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG, experiences), push, merge.

## Test
`apps/learning-architecture/tests/test_tour1_r14.js`, sections `lnew`, `fuser`, `fai`, `ended`, `sw36`, `own`, `best` (`ONLY=lnew,ended`).
Every case runs on the real path: sessions built through the assistant panel with a stub model (the stub reads the «🔭» form's k-keys from the
prompt for the assistant's fill + «ساختن»), the user's own «ساختن», live_new, chat_solved, a session moving to another problem, «X تموم شد. حالا Y»,
`APP.liveChatQs` and the look-back's `#lpBBest`.
Red baseline: `LLA_FILE=<bd815fb dist html> node tests/test_tour1_r14.js` fails 19 checks across all seven sections (no setup check fails);
the fixed build prints «NO ERRORS».

## What changed
1. **N1, one window rule stated by its boundary** (`msgWin`).
   - A session's subjects are its binds (`lprobLog`; legacy sessions without a log: `lprobAt` and other problems' live_new replies) plus this
     problem's creating reply in this session (live_new / chat_solved). Problems put aside by chat_invent never became the subject (unchanged rule:
     only the creating reply's question that names them).
   - window(P) = from the later of {session start, the end of the previous DIFFERENT subject} to the moment the session left P.
     "End of the previous subject" = the first user message after the session was bound to that other subject that names P
     («باغچه تموم شد. حالا حوض: …»); without such a message, the moment the session was bound to P. P's end = the next different subject's
     start, by the same definition. No earlier different subject ⇒ session start, whatever the creation method.
   - The chat_solved special case is now just this rule.
2. **N2, an option is the question the assistant actually asked.**
   - `joinKnown` returns the assistant's own joined sentences (the first one without its preamble) plus the page question as a key.
   - A demonstrative counts as a back-reference only as a pronoun («آن را»، «به همین می‌رسی»، «در آن به …», end of sentence, «اش»). A determiner
     before a noun («کجا این شباهت می‌شکند»، «همین ۴.۰۰۵») is self-contained. A paraphrased continuation joins only a question sentence, never a
     non-question preamble («قیاس را به کار بردی:»).
   - `chatItems(r)` gives `{t: asked text, k: matching page/list question or ""}`. `chatQs`/`APP.liveChatQs` return the `t` values and the new
     `APP.liveChatQItems` returns the items. Items are deduped by key.
   - A sentence that is verbatim part of a page turn question but has no question word («نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟») is recognised by
     that text and kept in the assistant's words.
   - `#lpBBest` drops a chat item whose text or key is a page question she answered on the page, so it stays one option. Choosing a 💬 option saves
     the asked text as `bestQ` and its key as `bestListQ` (additive).
   - The trailing «(بعد در صفحه …)» appears only when the assistant said it.

## Old expectations updated (decisions N1/N2 changed them)
- `tests/test_tour1_r13.js` form, `tests/test_tour1_r12_live.js` chat: the garden is now a real earlier subject (chat_solved), followed by the switch
  message, as in s29. Under N1, unbound chat with no subject boundary belongs to the first problem. The R12 control «a pre-creation turn that names
  the problem keeps its question» is restored (R13 had inverted it).
- `tests/test_tour1_r13.js` echo and `tests/test_tour1_r11_live.js` qword: the joined guess-test paraphrase and the A191 question are shown in the
  assistant's words. Q_GUESST and u5 are only their keys (u5 checked through `APP.liveChatQItems`).
