---
title: "صندوق ورودی همه‌چیز با تریاژ AI — Universal capture inbox with AI triage"
tags: ["inbox", "capture", "ai", "triage", "fastapi", "gtd", "fail-open"]
topic_canonical: "universal-capture-inbox-with-ai-triage"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-18T00:00:00Z"
created_at: "2026-07-18T00:00:00Z"
updated_at: "2026-07-18T00:00:00Z"
merged_from: []
---

# Universal capture inbox with AI triage

## 🎯 چالش / Challenge

یک اپ چند-ماژوله (کارها، لیست‌ها، یادداشت‌ها، افراد، …) همهٔ قابلیت‌ها را دارد ولی
کاربر برای ثبت هر چیزی باید *اول* تصمیم بگیرد به کدام ماژول برود — این اصطکاک باعث
می‌شود اصلاً ثبت نکند و سیستم رها شود. می‌خواهیم یک «درِ ورودی» واحد: کاربر هر متن
خامی را می‌فرستد (وب یا پیام‌رسان)، سیستم خودش تشخیص می‌دهد به کدام موجودیت تعلق
دارد، و با یک تأییدِ کاربر در جای درست ثبت می‌شود — بدون این‌که هیچ ورودی‌ای گم شود،
و بدون این‌که نبودِ کلید AI کل جریان را بشکند.

## 💡 راه‌حل / Solution

یک ماشین حالت سه‌مرحله‌ای + دو لایهٔ طبقه‌بندی:

1. **Capture ≠ Classify ≠ File — سه تراکنش جدا.**
   جدول `inbox_items(content, source, status, suggested_type, suggestion JSON,
   ai_model, filed_entity_type/id)` با چرخهٔ `pending → filed | dismissed`.
   ابتدا ردیف خام COMMIT می‌شود؛ *بعد* تریاژ به‌صورت best-effort اجرا و روی همان
   ردیف ذخیره می‌شود. اگر تریاژ crash کند، ردیف pending می‌ماند — «هیچ‌چیز گم
   نمی‌شود» تضمین ساختاری دارد نه آرزویی. حذف واقعی وجود ندارد (dismiss فقط وضعیت
   است).

2. **تریاژ دو-لایه (AI + heuristic قطعی).**
   لایهٔ AI: یک پرامپت JSON-only که مقصدهای مجاز (`task|todo|note|person`)، عنوان،
   موعد، و «دلیل» را برمی‌گرداند؛ نام لیست‌های واقعی کاربر به پرامپت تزریق می‌شود تا
   مدل فقط به مقصدهای موجود مسیر بدهد (جلوی hallucination مقصد). لایهٔ fallback:
   قواعد کلیدواژه‌ای قطعی (فعل‌های اقدام → task؛ شماره‌تلفن + القاب → person؛ متن
   بلند → note). خروجی هر دو لایه **هم‌شکل** است و `ai_model=null` مشخص می‌کند کدام
   لایه جواب داده (provenance). کل مسیر «هرگز raise نمی‌کند».

3. **Filing از طریق session صدازننده + یک fallback همیشه-موفق.**
   تبدیل به موجودیت واقعی در همان تراکنشِ درخواست انجام می‌شود (flush موجودیت +
   به‌روزرسانی وضعیت ردیف + یک commit) تا در تست‌ها با dependency-override دیده شود
   و half-filed نداشته باشیم. برای مقصد «آیتم لیست» اگر لیستی match نشود، یک لیستِ
   پیش‌فرض («صندوق ورودی») خودکار ساخته می‌شود — انتخاب صریح کاربر هیچ‌وقت بن‌بست
   نمی‌خورد. Guard وضعیت: file/dismiss روی ردیفِ قبلاً-filed ⇒ 409.

4. **یک aggregate «امروز» برای مصرف.**
   داشبورد به‌جای N درخواست، یک endpoint تجمیعی می‌خواند (سطل‌های عقب‌افتاده/امروز/
   پیش‌رو + شمار pending صندوق + اعلان‌های نخوانده) تا صندوق ورودی جایی «دیده شود»
   که کاربر هر روز می‌رود — capture بدون سطح مرورِ روزانه مرده به دنیا می‌آید.

## 🧪 نمونه کد (Anonymized)

```python
async def capture(payload, db):
    item = InboxItem(content=escape(payload.content), status="pending")
    db.add(item); await db.commit()          # capture survives everything below
    try:
        item = await apply_classification(db, item)   # best-effort
    except Exception:
        pass
    return item

async def classify(db, content):
    fallback = heuristic(content)            # deterministic, keyless-safe
    res = await llm_complete(db, PROMPT.format(lists=user_lists, content=content))
    obj = parse_first_json_object(res.get("text", "")) if res.get("ok") else None
    if not obj:
        return {"type": fallback["type"], "suggestion": fallback, "model": None}
    kind = obj.get("type") if obj.get("type") in ALLOWED else fallback["type"]
    return {"type": kind, "suggestion": normalize(obj, fallback), "model": res["model"]}

async def file_item(db, item, target=None, overrides=None):
    kind = target or item.suggested_type or "task"
    created = await FILERS[kind](db, merge(item.suggestion, overrides))  # flush only
    item.status, item.filed_entity_type, item.filed_entity_id = "filed", created["kind"], created["id"]
    await db.commit()                         # entity + state flip: ONE transaction
    return created
```

## ⚠️ نکات حیاتی / Pitfalls

- **اول commit کن، بعد طبقه‌بندی.** اگر capture و triage یک تراکنش باشند، هر خطای
  AI/شبکه ورودی کاربر را می‌بلعد — دقیقاً همان چیزی که «صندوق ورودی» قولش را داده
  نگه دارد.
- **خروجی مدل را sandbox کن:** نوع پیشنهادی را با allowlist چک کن؛ `list_name` را
  فقط به لیست‌های واقعی resolve کن؛ عنوان/تاریخ را clamp/parse کن. مدل تصمیم
  *پیشنهاد* می‌دهد، کد تصمیم *اعمال* می‌کند.
- **دو مرحلهٔ commit روی JSON column:** پیشنهاد را با dict تازه assign کن (نه
  mutate در جا) وگرنه SQLAlchemy تغییر را نمی‌بیند.
- **Enum ذخیره‌شده با NAME:** تست‌هایی که با SQL خام ردیف می‌کارند باید نام عضو
  enum (`SYSTEM`) را بنویسند نه value (`system`) — خطای runtime فقط موقع خواندن
  ظاهر می‌شود.
- **Guard دوطرفه:** file بعد از file و dismiss بعد از file هر دو 409 — وگرنه وضعیت
  «بایگانی‌شده» با یک کلیک دوم می‌سوزد و اشارهٔ filed_entity گم می‌شود.
- **متن escape شده را در UI unescape کن:** اگر سرور html.escape می‌کند و فرانت هم
  خودش escape می‌کند (React)، بدون fold-back کاربر `&amp;` می‌بیند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. جدول capture با `status/suggested_type/suggestion(JSON)/ai_model/filed_*` بساز؛
   حذف فیزیکی نده.
2. مسیر capture را دو-فازی کن: commit خام → triage best-effort → ذخیرهٔ پیشنهاد.
3. یک پرامپت JSON-only با allowlist مقصدها بنویس و *دادهٔ واقعی کاربر* (نام
   لیست‌ها/دسته‌ها) را به آن تزریق کن؛ خروجی را validate/normalize کن.
4. یک heuristic قطعی هم‌شکل با خروجی AI بساز تا بدون کلید هم کار کند و در تست‌ها
   deterministic باشد.
5. filing را از طریق session صدازننده انجام بده (flush + یک commit مشترک) و برای
   هر مقصدِ انتخابیِ صریح یک fallback همیشه-موفق تعریف کن (مثل لیست پیش‌فرض).
6. صندوق را در سطحِ مرور روزانهٔ کاربر (داشبورد/فرمان اصلی ربات) surface کن، با
   دکمه‌های یک-لمسی «تأیید / تغییر مقصد / رد».

## 🔗 References

- الگوی خواهر: [pluggable-ai-provider-catalog-and-router] (resolve مدل + fail-open)
- الگوی خواهر: [bidirectional-telegram-bot-webhook] (کانال دوم capture)
- الگوی خواهر: [generic-activity-log-with-entity-linking] (ردپای file/dismiss)
