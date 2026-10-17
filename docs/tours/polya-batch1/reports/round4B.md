ROUND 4 B (s11–s20, build a5e54dc, dist 04:46:09 committed in the merge): 2 PASS (s11, s19), 8 PARTIAL (s13, s14 have a criterion that REGRESSED to FAIL), 0 FAIL.
Evidence round4B/<sid>/findings.md; 10 e-mails sent. Method: replayed round-3 user ctl scripts on the new build; answered every AI call as a literal model.
Fixed & verified: A1 refuted guess ⇒ «رد شد» (s11); A12 liveClosure «review» until look-back saved (s11); A2 joined units (s17); A6 circular sufficiency gate (s11);
B3 unused-data question in the live block (s11); B4 related-solved block in a new session (s11, s12); B6 «جواب اینه/پیداش کردم/تموم.» ⇒ look-back (s12, s14, s18);
B9 🌱 card + reminder after a setback (s19); B14 incubation with its condition (s20); D4 neutral kind for a research question (s20); N3 single unused-data line (s11).
Regressions: s14 four-phase diagnosis lost (chat failure «غلطه/نمی‌شه» no longer an event — a27_tour.js:902/912/921); s13 «به تعریف‌ها برگرد» dropped from the life plan list (A11) +
premature phase advance (B1) ⇒ the key-term definition is never asked.
Remaining: S2 (c) units checker splits only on «=» («⇒/؛/:» glue a conversion into the product) a38_live.js:441-445; S2 (c) TEACH_RE misses ordinary teacher/parent phrasings
a27_tour.js:929 (s15, s16); S2 (c) chatUses answeredIn needs 3/5 of the long list wording ⇒ chat-asked understanding questions never raise the rung a27_tour.js:1150-1176 (s12);
S3 statedParts counts a pasted textbook statement as the user's own u/d/c (s16, s18; blocks «restate the unknown»); S3 coach kind «تصمیم/کارِ واقعی» for textbook problems with units
(s16, s18) and sticky «اثباتی» (s14); S3 RESULT_RE misses «جواب ۱.۳»، «رسید به عرض ۴»، «تموم شد دیگه» (a27_tour.js:905); S3 duplicate child problem via chat_invent paraphrase
(a27_tour.js:1553); S3 CIRC_RE «معلوم است» false positive (a38_live.js:419); S3 LIVE_ASK misses «مسئلهٔ حل‌نشدهٔ خودم کنم», «برنامهٔ دقیق می‌خوام» (a27:1282, a38:2197);
S3 natGuess money ⇒ practical for an ethics dilemma; S3 live-block phase list slice(0,7) (a27:1465, a38:2229); S3 indirect⇒direct only for prove/pod (a38:1820);
S3 factory case not closed after page refutation; S3 bidi «cm³/s ÷ cm² = cm/s», «y→0» (a26_assist.js:966); S3 page refusals >4 min invisible to the assistant;
S3 territory noise everywhere (a28_systerr.js); S3 inventor's paradox / mushrooms / «label incomplete proof» / authority⇒forgetting not in any prompt.
