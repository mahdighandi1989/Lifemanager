# Round 17 · runner A (s01–s10)
Build df3a0071+, in sync; shared harness4.js; dirs round17A/<sid> (+ round17A/s10_probe = L2 probe). All 10 DONE; 10 e-mails sent.
RESULTS: s01 FAIL(need map) · s02 FAIL(G1) · s03 PASS · s04 FAIL(G1) · s05 FAIL(G1) · s06 FAIL(G1) · s07 PASS · s08 FAIL(S3 ×3) · s09 FAIL(D2,G1) · s10 PASS. All written criteria PASS in all 10.
Fixed and verified: R16 A·F1 (s03/s05/s10 prove/pod labels), F2 (s03 two runs), F3/L2 (s06, s10 probe live refresh), F4/N1 (s08 chat closure bestQ/taste + page card), F5 (s04/s06/s10 colon heads).
Defects:
- G1 S2 (b): the full 🔭 block «… ثبتش کن» and LIVE_COMPACT «… فقط با «آری» … هرگز خودکار» are both in the same prompt (s01,s02,s04,s05,s06,s09 p1). a38_live.js:3272 vs a27_tour.js:2538.
- D1 S2 (b): N6 planOf fires on a complaint «هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم» (s01 p1), so the assistant is told to offer following up the very habit to break. a27_tour.js:2637-2642, 2659-2660.
- D2 S2 (b): L1d refNote appends the CURRENT recorded guess, not the guess the question was about (s01 chat:1 «(حدسِ تو: «اجارهٔ بلندمدت…»)» on a question about «همهٔ ۴۷ ستون…», which is already quoted in the option; s09 «(حدسِ تو: «حدود ۵۰۰ هزار تومن»)» on a question about «۸۰۰ هزار»). a38_live.js:2618, 2646-2648.
- D3 S3 (b): L1e misses a re-asked question that says «همان پرسش» (s01 chat:4/chat:5). a38_live.js:2609-2614.
- D4 S3 (b): lbRest asks the model to ask «کدام پرسش بیشتر کمک کرد؟» on the very message that answers it, and re-asks taste right after the model asked it (s08 p7, p8). a27_tour.js:2493-2503, 1590-1593.
- D5 S3 (b): the look-back meta-questions (best/taste) become options of «کدام پرسش کمک کرد؟» (s08 7/11 list). a38_live.js chatItems ≈2580-2619.
- D6 S3 cosmetic (b): the card says «این پرسشِ بازنگری … — همان‌ها که…» (should be singular). a27_tour.js:2514.
Prompt scan: no unmarked second question directive (the scan2 hits in s07 p1 and s08 p5 are the same question counted twice). No register flips; no promise lines fired; follow-up line fired only once (s01 p1, D1).
