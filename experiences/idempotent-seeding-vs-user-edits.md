---
title: "Seeding ایدمپوتنت در برابر ویرایش‌های کاربر — بازپخش امن محتوا در هر بوت"
tags: ["seeding", "data-safety", "startup-migration", "idempotency", "backend"]
topic_canonical: "idempotent-seeding-vs-user-edits"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-20T20:30:00Z"
created_at: "2026-07-20T20:30:00Z"
updated_at: "2026-07-20T20:30:00Z"
merged_from: []
---

# Idempotent Seeding vs. User Edits

## 🎯 چالش / Challenge

وقتی محتوای اولیهٔ باارزش کاربر (لیست‌ها، نوشته‌ها) به‌صورت seed در کد نگه‌داری می‌شود و
در هر بوت «بازپخش» می‌شود (الگوی رایج در free-tier بدون مرحلهٔ migration مطمئن)، هر
منطق تعمیری که کنار seeding اضافه شود — بازچینش ترتیب، پاک‌سازی ردیف‌های نسخهٔ قبل،
بازسازی لیست خراب — به‌مرور به «بمب داده» تبدیل می‌شود: شرطی که روز نوشتنش امن بود
(«این لیست هنوز دادهٔ کاربری ندارد»)، بعد از اولین تعامل واقعی کاربر غلط می‌شود و
هر بوت، دادهٔ کاربر را حذف/بازنویسی می‌کند — بی‌صدا و تکرارشونده.

## 💡 راه‌حل / Solution

1. **قاعدهٔ طلایی: seed فقط-وقتی-خالی (fill-empty)، هرگز upsert.** لیستی که حتی یک
   آیتم دارد، دست‌نخورده رد شود؛ ویرایش/حذف/تکمیل کاربر مقدس است.
2. **هر عمل مخرب کنار seeding باید «حکم بدون‌خسارت» (lossless verdict) بگیرد** — یک
   تابع خالص و تست‌پذیر که قبل از wipe/rebuild اثبات کند: (الف) تعداد ردیف‌ها دقیقاً
   برابر seed است، (ب) تک‌تک محتواها عیناً از seed هستند، (ج) هیچ ردیفی state کاربری
   (تیک، یادداشت، فرزند) ندارد. هر انحراف ⇒ log + skip، نه اجرا.
3. **پاک‌سازی‌های مهاجرتی باید خودخاموش‌شو باشند**: حذفِ الگومحور (پیشوند/regex) را به
   «نشانهٔ وضعیت پیش-مهاجرت» گره بزن (مثلاً حضور ردیف‌های exact-match قدیمی). وقتی
   نشانه رفت، مهاجرت تمام است و ردیف‌های شبیه به الگو، محتوای جدید کاربرند.
4. **حکم را از مسیر خواندن (GET) بیرون بکش** — تعمیرها فقط در startup؛ وگرنه هر بازدید
   صفحه یک فرصت حذف است.
5. **کامنت «دادهٔ کاربر در خطر نیست» را به کد تبدیل کن، نه توضیح.** اگر ایمنی فقط در
   کامنت است، با اولین تغییر واقعیت، کامنت دروغ می‌شود و کد همچنان اجرا.

## 🧪 نمونه کد (Anonymized)

```python
def hard_reset_verdict(rows, seed_items) -> tuple[bool, str]:
    """rows: (id, content, meta, position, has_user_state)."""
    if len(rows) != len(seed_items):
        return False, "count-mismatch"        # user added/removed → never wipe
    if _order_is_canonical(rows):
        return False, "order-ok"
    seed_contents = {parse(s).content for s in seed_items}
    foreign = sum(1 for r in rows if r[1] not in seed_contents)
    dirty = sum(1 for r in rows if r[4])
    if foreign or dirty:
        return False, f"owner-data:{foreign}+{dirty}"  # log & leave alone
    return True, "misordered-pure-seed"       # the ONE provably-lossless case

# self-extinguishing migration cleanup:
exact_stale = [r for r in rows if r.content in OLD_EXACT_SET]
prefix_stale = ([r for r in rows if r.content.startswith(OLD_PREFIXES)]
                if exact_stale else [])       # no marker → migration done → hands off
```

## ⚠️ نکات حیاتی / Pitfalls

- «تعداد ≠ seed» به‌تنهایی هرگز دلیل wipe نیست — دقیقاً یعنی کاربر چیزی تغییر داده.
- بازسازی حتی در حالت «همهٔ محتواها ⊆ seed» هم می‌تواند مخرب باشد: حذف عمدی کاربر را
  زنده می‌کند (resurrect). شرط برابریِ تعداد + محتوا هر دو لازم است.
- realign/catch-up که آیتم ویرایش‌شده را «ناشناس» می‌بیند، جفت تکراری می‌سازد (نسخهٔ
  ویرایش‌شده + درج دوبارهٔ اصل) — نگاشت باید fuzzy یا id-محور باشد، نه فقط متن.
- تست موجودِ رفتار مهاجرتی را نگه دار و تست جدیدِ «محتوای کاربر زنده می‌ماند» را کنارش
  اضافه کن — هر دو سناریو (پیش و پس از مهاجرت) باید هم‌زمان سبز باشند.
- escape/normalize در لایهٔ ذخیره (مثل html.escape) با هر ویرایش انباشته می‌شود و
  «verbatim بودن» seed را می‌شکند — تبدیل‌ها فقط هنگام رندر.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. همهٔ seedها را ممیزی کن: کدام fill-empty است، کدام upsert، کدام delete دارد؟
2. برای هر delete/rebuild کنار seeding، یک تابع verdict خالص با تست ۴-۵ سناریویی بساز
   (canonical / misordered-pure / edited / ticked / count-drift).
3. پاک‌سازی‌های الگومحور را به نشانهٔ پیش-مهاجرت مشروط کن.
4. تعمیرها را از مسیر GET به startup محدود کن.
5. رفتار قدیمی را حذف نکن — پشت گارد ببر و در دفتر removal-candidates با راه بازگشت
   ثبت کن (قرنطینه، نه حذف).

## 🔗 References

- منبع اولیه: ممیزی ایمنی محتوا 2026-07-20 همین مخزن —
  `docs/decisions/2026-07-20-content-safety-and-inventory.md`
- مرتبط: [holistic-island-audit-with-adversarial-verification]،
  [excel-archive-import-with-coverage-gate]
