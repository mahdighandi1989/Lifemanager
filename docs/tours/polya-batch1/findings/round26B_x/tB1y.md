# tB1y — side arm of tB1: a frame-word-only tool (ask) and a genuine tie of two tools, round 26 (group B)

## خلاصه برای مالک
همان ایدهٔ جعبه‌قرص و همان برگه. دو آزمون: اول ابزاری آمد که با نیازِ او فقط در واژهٔ «پیشینه» شریک بود («تاریخچهٔ فناوری») — صفحه «رسید» نگفت و از او پرسید؛ «نه» ِ او گام را دوباره منتظر کرد. بعد دو ابزارِ هم‌امتیاز با هم آمدند (بانکِ ثبت‌های اختراعِ ایران و جهانی) — صفحه هر دو را نام برد و پرسید، و چیزی را هم‌زمان «رسید» اعلام نکرد. ولی وقتی او همان بار گفت «دومی، جهانی»، صفحه بانکِ ایران را کنار گذاشت و دربارهٔ جهانی دوباره از او پرسید؛ او مجبور شد بگوید «آره، گفتم که». در «امروز» هم پرسشِ هم‌امتیاز فقط نامِ اولی را داشت، و در پروندهٔ کامل پرسش‌های پیشین جای خود را به آخرین پرسش دادند.

## Criteria
- [PASS] p3 gap + p4 second opinion ⇒ sheet #101, step 3 waiting; p8 live problem registered.
- [PASS] arm 1 (+1 d, scratch page with `pr_tech_history`, overlap only «پیشینه»): s14 «❓ برگهٔ #۱۰۱ جواب گرفت: «تاریخچهٔ فناوری». مطمئن نیستم … از تو می‌پرسم»; check «روشن هم‌خوان نیست (واژهٔ مشترک: «پیشینه»)»; NO reopen in the same pass (B25·D18 tB1y part FIXED).
- [PASS] her «نه، این تاریخچه‌ی فناوریه …» (p9) ⇒ sys_fit false ⇒ Today «⏸ … دوباره منتظرِ برگهٔ #۱۰۱ است — «تاریخچهٔ فناوری» همان نبود», sheet open with her words.
- [NOTE] a first tie page whose two areas differed by one shared word and whose first area's name is the sheet title (prior_art 6 words vs patent_db 5) ⇒ clear arrival of the title-named area — correct by the rule (not a tie); rerun with a genuine tie.
- [PASS] arm 2 genuine tie (`pr_patent_ir` «بانکِ ثبت‌های اختراعِ ایران» = `pr_patent_world` «… جهانی», same shared words): s17 «❓ برگهٔ #۱۰۱ جواب گرفت: «بانکِ ثبت‌های اختراعِ ایران» (هم‌امتیاز با «بانکِ ثبت‌های اختراعِ جهانی» آمد — اگر این نیست و آن است، همان را بگو)»; step waits; no arrival in the same pass.
- [FAIL S3] B26x·D27 her answer named the second tool («دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه») ⇒ the contract made it fit=false for Iran and «صفحه دربارهٔ آن یکی جدا می‌پرسد» ⇒ s19 a new ❓ for «جهانی» she had already chosen; she had to say «آره، گفتم که — همون بانکِ جهانی» (p11) before 🛎. Also the reject line said «(گفتی همان نیست)» though she had named the right one.
- [FAIL S3] B26x·D28 Today's tie line names only the first candidate («❓ … «بانکِ ثبت‌های اختراعِ ایران» — همان ابزارِ گامِ … است؟»); the «هم‌امتیاز با …» part is only in the chat line.
- [FAIL S3] B26x·D29 📜 keeps only the LAST ask row («❓ … «بانکِ ثبت‌های اختراعِ جهانی» — همان ابزارِ گام است؟»); the earlier asks for «تاریخچهٔ فناوری» and «بانکِ … ایران» are gone (their reject rows remain).
- [PASS] after p11 sys_fit true ⇒ 🛎 «بانکِ ثبت‌های اختراعِ جهانی», 📜 «پرسیدم و خودش گفت همان است — از سر گرفتنِ همان گام» (visible from the next render; the eval taken at once still showed the ask — a one-pass lag, no effect).
- [PASS] one ⏸ waiting row in 📜.
- [PASS] routing 11/11.

## نقشهٔ نیاز
- Territory loop (FOR: never «رسید» on a weak or tied match; ask naming both): met.
- Ask/answer (FOR: one question, one answer): partly unmet — her single answer naming the second tool did not settle it (D27).
- Today (FOR: the exact question waiting for her): partly — tie shown with one name (D28).
- 📜 (FOR: whole history): partly — earlier asks overwritten (D29).
- Person: wants patents worldwide; she got there, after repeating herself once.

## پیش‌نیاز / آزمودنِ اصلاح / سن
None / P3 frame-word ask ✓, tie ask ✓, back-to-waiting ✓ / 31, adult ✓.

## Round-25 defects
- B25·D1 FIXED (frame-word-only overlap ⇒ ask). - B25·D18 FIXED (no ask + reopen in one pass). - B25·D19 FIXED.

## Arithmetic
Same as tB1 — correct, page silent.

## Routing
11/11 (routing.md).

## ارتقای لازم
- Tie answer naming the other candidate ⇒ accept that candidate at once (sys_fit with `alt`), no second ask (D27); her line «(گفتی همان نیست)» should read «گفتی آن یکی است».
- Today tie line: name both candidates (D28).
- 📜: one row per ask (append), never overwrite the earlier ask (D29).

## ایده‌ها
- A two-button card in Today for a tie («ایران» / «جهانی» / «هیچ‌کدام») would make the answer one click.

## Defects
- S3 B26x·D27, S3 B26x·D28, S3 B26x·D29.

RESULT: FAIL (3 S3)
