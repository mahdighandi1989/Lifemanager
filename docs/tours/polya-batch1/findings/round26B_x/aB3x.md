# aB3x — side arm of aB3: the model converts his birth date wrongly — round 26 (group B)

## خلاصه برای مالک
در این بازوی کوتاه، دستیار (عمداً به‌شکلِ مدلی که اشتباه می‌کند) تاریخِ تولدِ ۱۲ اردیبهشت ۱۳۳۸ را «۲ مهٔ ۱۹۵۹» گفت. صفحه درست را نگه داشت (۳ مه)، ولی جملهٔ نادرستِ دستیار همان‌طور به او نشان داده شد و صفحه چیزی نگفت.

## Criteria
- [PASS] c4 his chat sentence ⇒ «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸» once; c5 stored 1959-05-03 (= ICU) despite the model's 1959-05-02.
- [FAIL] the reply's «برابر است با ۲ مهٔ ۱۹۵۹» stays visible, no correction line (B25·D17 STILL, S3).
- [PASS] elder block, «شما»; routing 2/2.

## نقشهٔ نیاز
Age layer (FOR: one true date, said once): stored right, but the person sees a second, wrong date in the same turn.

## پیش‌نیاز / آزمودنِ اصلاح
None.

## سن
67; Jalali confirmation right.

## Round-25 defects in this scenario
- B24·D7 (model ISO override): FIXED. B25·D17: STILL.

## Arithmetic
None.

## ارتقای لازم
- Post-check: a Gregorian date in the reply that disagrees with the stored birth date ⇒ rewrite or a page line.

## ایده‌ها
None new.

## Defects
B25·D17 (S3).

RESULT: FAIL — 1 S3
