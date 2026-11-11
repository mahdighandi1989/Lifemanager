# bp1 — دانش‌آموزِ ۱۳ساله و n²−1 بر ۸ (پیش‌نیاز: تفاضلِ دو مربع) — round 26 (group B)

## خلاصه برای مالک
دانش‌آموزی که فقط عدد می‌گذاشت و نمی‌دانست «مربع منهای مربع» را چطور بنویسد، با کمبودِ مشخصِ «تجزیهٔ تفاضلِ دو مربع» (نه «خنگی») روبه‌رو شد، آن را از ضربِ خودِ $(x−1)(x+1)$ ساخت، با $x^2−49$ آزمود و برهانِ بخش‌پذیری بر ۸ را خودش تمام کرد؛ فردا همان روش را روی $x^2−9$ به کار برد. صفحه حساب‌های تازه‌اش (۷² = ۴۹ = ۶ × ۸ + ۱) را درست خواند و همنهشتی و معادله را حساب نشمرد. یک ایرادِ کهنه مانده: وقتی گفت «درسته؟ با ضربِ پرانتز هم چک کردم»، پرسشِ صفحه از او خواست «ثابتش کن یا ردش کن» — کاری که خودش کرده بود.

## Run setup
See ../SETUP.md. 27 steps: 26 replayed + 1 new (c20: congruence, a chained equality, an equation with an unknown, a Unicode minus). 13 model calls: 12 reused, p13 fresh.

## Criteria
- [PASS] p1–p9 prerequisite «تجزیهٔ تفاضلِ دو مربع» named with the step, diagnostic, taught only to the step (she builds it from the product), mastery by her own x² − 49, exact return; proof finished by her (one of two consecutive evens is a multiple of 4).
- [PASS] lesson, «کدام پرسش کمک کرد» (her own: multiplying (x−1)(x+1)), taste; «خنگم» ⇒ the named gap.
- [FAIL] c18 «درسته؟ با ضرب پرانتز هم چک کردم» ⇒ page turn question «ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی؟» (B24·D15 STILL, S3).
- [PASS] p13 «# حسابِ صفحه»: ✓ «۷² = ۴۹», ✓ «۶ × ۸ + ۱ = ۴۹» (chain); «n² ≡ 1 (mod 8)» and «x² − 9 = 0 … x = 3 یا x = −3» not treated as arithmetic (look-alikes ignored — correct).
- [PASS] no prior block on her mid-solve steps (B25·D13 bp1 p6–p8 FIXED).
- [PASS] routing 13/13; strict scan clean.

## نقشهٔ نیاز
- Prerequisite layer: met. Arithmetic check: met on correct chained work and look-alikes. Turn question for a checked claim: poorly met (asks for a proof she already gave).
- Person (13): needed to see it was a missing tool, not ability, and to own the proof — met.

## پیش‌نیاز
One missing (difference of squares), detected and taught; mind card cause «پیش‌نیاز», learned as progress.

## آزمودنِ اصلاح
None.

## سن
13 (teen): «تو», no childishness.

## Round-25 defects in this scenario
- B25·D13 (bp1): FIXED. B24·D15 (bp1 p11): STILL.

## Arithmetic (P2)
| what she wrote | exact | page | verdict |
|---|---|---|---|
| ۸، ۲۴، ۴۸ (3²−1, 5²−1, 7²−1) | ✓ | not an equation, silent | PASS |
| x² − 49 = (x − 7)(x + 7) (symbolic) | — | silent | PASS |
| ۲۵−۹=۱۶، (۵−۳)(۵+۳) = ۲×۸ = ۱۶ | 16 | silent | PASS (correct, unread) |
| ۷² = ۴۹ = ۶ × ۸ + ۱ | 49 | ✓ ✓ | PASS |
| n² ≡ 1 (mod 8) | congruence | ignored | PASS |
| x² − 9 = 0 ⇒ x = 3 یا x = −3 | equation | ignored | PASS |

## ارتقای لازم
- Read «با … هم چک کردم» (her own verification) before the claim moment, so the turn question becomes «از راهِ دیگری هم؟» rather than «ثابتش کن».

## ایده‌ها
- «همین روش در کدام تمرین‌های دیگرِ کتاب به کار می‌آید؟» — a generated set of 3 transfer problems (look-back b4) would serve her next day.

## Defects
- B24·D15 (S3).

RESULT: FAIL — 1 S3
