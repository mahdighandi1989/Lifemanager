---
title: "امتیازِ زوال‌دار ≠ سابقه — دو عددِ جدا لازم است"
tags: ["scoring", "crm", "product-semantics", "time-decay", "audit-trail"]
topic_canonical: "decayed-score-vs-permanent-ledger"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-25T00:00:00Z"
created_at: "2026-07-25T00:00:00Z"
updated_at: "2026-07-25T00:00:00Z"
merged_from: []
---

# Decayed score vs. permanent ledger

## 🎯 چالش / Challenge

هر جا رفتار/کیفیت را در طولِ زمان امتیاز می‌دهیم (اعتبارِ یک طرفِ رابطه، سلامتِ یک
سرویس، کیفیتِ یک تأمین‌کننده، ریسکِ یک کاربر) وسوسه‌ای هست که **یک عدد** بسازیم و
برای «تازگی» به آن زوالِ نمایی بدهیم. این عدد به‌سرعت به تنها حافظهٔ سیستم تبدیل
می‌شود — و آن‌وقت سیستم دقیقاً همان چیزی را می‌سازد که کاربر می‌خواست جلویش را
بگیرد: **یک رویدادِ خوبِ تازه، دهها رویدادِ بدِ کهنه را می‌پوشاند** (و برعکس).

خطرِ خاموش‌تر: docstring/توضیحِ کنارِ تابع معمولاً ادعا می‌کند زوال «الگوی بلندمدت را
حفظ می‌کند»، در حالی که ریاضی‌اش دقیقاً عکسِ آن است. کسی هم متوجه نمی‌شود، چون تست
فقط «خوب > بد» را چک می‌کند، نه «کهنه فراموش نشود».

## 💡 راه‌حل / Solution

دو تابعِ **جدا** روی یک لاگِ رویداد، و هر دو را هم‌زمان نشان بده:

1. `score(events)` — زوال‌دار، صریحاً برچسبِ **«حالِ اخیر»**. کارش فراموش‌کردن است.
2. `ledger(events)` — بی‌زوال، همیشگی: شمارشِ کامل، تراز، اولین/آخرین رویداد، و
   موارد **علامت‌خوردهٔ کاربر** («این یکی یادم بماند») که هرگز هرس نمی‌شوند.
3. هر متنِ مشتق‌شده (پیشنهاد، هشدار، خلاصه) را از **ledger** بساز نه از score.
4. اگر کاربر می‌تواند نظرِ خودش را بدهد، آن را در ستونی جدا ذخیره کن و
   **stored-wins** کن: مقدارِ محاسبه‌شده زیرش دست‌نخورده بماند تا بشود پس گرفت
   (`override = NULL` ⇒ دوباره ماشین حساب کند).
5. لاگِ رویداد را sliding-window نگه‌داری؟ آن‌گاه ledger باید **جمع‌های تجمعی** را
   جدا نگه دارد، وگرنه هرسِ لاگ همان فراموشی را از راهِ دیگر برمی‌گرداند.

## 🧪 نمونه کد (Anonymized)

```python
def mood_score(events, *, now=None, half_life=30.0):
    """چطور «این روزها» احساس می‌شود. عمداً فراموش می‌کند."""
    now = now or utcnow()
    w = sum(e["valence"] * 0.5 ** (age_days(e["at"], now) / half_life) for e in events)
    return round((math.tanh(w / 3.0) + 1) / 2 * 100, 1)


def ledger(events, *, now=None):
    """سابقه. زمان آن را پاک نمی‌کند."""
    good = sum(1 for e in events if e["valence"] > 0)
    bad = sum(1 for e in events if e["valence"] < 0)
    flagged = sorted((e for e in events if e.get("important")),
                     key=lambda e: e["at"], reverse=True)
    stamps = sorted(e["at"] for e in events if e.get("at"))
    return {"good": good, "bad": bad, "balance": good - bad, "flagged": flagged,
            "first_at": stamps[0] if stamps else None,
            "last_at": stamps[-1] if stamps else None}


def effective_label(row):           # stored-wins
    return row.override or row.computed or "neutral"
```

تستی که واقعاً این را می‌گیرد (نبودِ همین تست، باگ را ماه‌ها زنده نگه می‌دارد):

```python
def test_ledger_keeps_what_the_score_forgets():
    old_bad = [{"valence": -1, "at": days_ago(300)}] * 3
    new_good = [{"valence": 1, "at": now()}]
    events = old_bad + new_good
    assert mood_score(events) > 50          # حالِ اخیر خوب است — درست
    assert ledger(events)["bad"] == 3       # ولی سابقه پاک نشده — مهم‌تر
```

## ⚠️ نکات حیاتی / Pitfalls

- **یک عدد برای دو سؤالِ متفاوت** ریشهٔ باگ است: «الان چطور است؟» و «تا حالا چه
  کرده؟» هرگز یک جواب ندارند.
- docstringِ زوال را باور نکن؛ ریاضی‌اش را بخوان. اگر نوشته «الگوی بلندمدت را نگه
  می‌دارد»، تقریباً همیشه اشتباه است.
- نمایشِ UI باید هر دو را با برچسبِ صریح نشان دهد؛ اگر فقط یکی را نشان دهی، کاربر
  همان را «حقیقت» می‌گیرد.
- علامتِ دستیِ کاربر («مهم است») باید از هر هرس/نمونه‌برداری/زوالی مصون باشد.
- override را با مقدارِ محاسبه‌شده **جایگزین** نکن؛ کنارش بنشان، وگرنه پس‌گرفتنش
  ممکن نیست و هر بار محاسبهٔ دوباره نظرِ کاربر را می‌شوید.
- ستونِ تازه روی جدولِ موجود ⇒ هم مسیرِ مهاجرتِ رسمی، هم مسیرِ
  `ADD COLUMN IF NOT EXISTS`ِ زمانِ استارتاپ (اگر محیطی `create_all()` دارد).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. هر جا `decay`/`half_life`/`recency_weight` دیدی، بپرس: «آیا این تنها حافظهٔ سیستم
   است؟» اگر بله، یک `ledger()` کنارش بگذار.
2. لاگِ رویدادِ خام را نگه دار (append-only)؛ هر دو تابع فقط **مشتقِ** آن باشند تا
   بشود بعداً هر دو را بازمحاسبه کرد.
3. یک flagِ `important` به رویداد اضافه کن و مسیرِ خواندنی بده که هرگز فیلتر/هرس
   نشود.
4. برچسبِ نهایی را با الگوی stored-wins بده: `override or computed`؛ خالی‌کردنِ
   override یعنی «دوباره خودت حساب کن».
5. برچسب‌های نمایشی (i18n) را در **بک‌اند** بگذار وقتی بیش از یک صفحه همان مقدار را
   نشان می‌دهد — وگرنه یک صفحه کلیدِ خام را نشان می‌دهد و بقیه ترجمه را.
6. تست بنویس که «کهنه فراموش نشود»، نه فقط «خوب از بد بیشتر است».

## 🔗 References

- مرتبط: [ontology-lens-over-existing-system], [soft-delete-tombstone-must-filter-every-read-path]
