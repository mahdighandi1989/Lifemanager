# کارتابلِ «نظارت و سرکشی» — پوشهٔ کاریِ ناظر

این پوشه **حافظه نیست**، کپیِ کاری است. برگه‌ها در API زندگی می‌کنند (`/api/inspection`) و در
صفحهٔ «نظارت و سرکشی» (`/inspection`) دیده می‌شوند؛ این‌جا فقط چیزی است که ناظر برای خواندنشان
لازم دارد.

```bash
python3 scripts/supervisor/inspection.py file    # تیک‌خورده‌ها (آبی) → زونکن
python3 scripts/supervisor/inspection.py pull    # QUEUE.md + shots/ + files/
python3 scripts/supervisor/inspection.py urgent  # URGENT.md (یک برگهٔ فوری)
python3 scripts/supervisor/inspection.py answer 7 --text-file /tmp/a.md \
    --outcome partial --dep 'GET /api/tasks=ok' --commit abc1234
```

- `QUEUE.md` — کارتابل: هر برگه با متنِ مالک و یادداشت‌های ذیلش، نشانیِ بازگشت (مسیر + تب)،
  عنصر، گره، کسرهای کادر، متنِ داخلِ کادر، و کادرِ جدای هر یادداشتِ ذیل.
- `URGENT.md` — تنها برگهٔ فوری‌ای که همین اجرا برداشته.
- `shots/` — تصویرِ هر یادداشت (png/jpg)، «قبل» و «بعد». **بازشان کن و نگاه کن.**
- `files/` — متنِ **کاملِ** فایل‌های پیوستِ مالک (و خودِ فایل وقتی متن ندارد یا متنش بریده شده).
  «حجمش زیاد است» عذر نیست — تا فایلی خوانده‌نشده بماند، API جوابِ آن برگه را رد می‌کند.

همه با هر `pull`/`urgent` از نو ساخته می‌شوند و در git نیستند (`.gitignore`). تنها همین README
کامیت می‌شود. دستورها و قواعد: [`../PROMPT.md`](../PROMPT.md) بخشِ ۰-ب.
