---
task_id: aafcddaf-eeec-49bf-8941-c247333114d4
title: پیاده‌سازی قوانین اعتبارسنجی Pydantic
type: bug
priority: high
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-19T20:23:24.912373+00:00'
updated_at: '2026-05-29T20:25:47.546559+00:00'
archived: true
archived_at: '2026-05-25T06:37:48.780701+00:00'
tags:
- merged
target_files:
- app/schemas/task_schema.py
- app/schemas/user_schema.py
---

# پیاده‌سازی قوانین اعتبارسنجی Pydantic

## Raw Idea

در فایل app/schemas/task_schema.py، فیلدهای مهم مانند due_date و priority validation ندارند. این می‌تواند منجر به ذخیره داده‌های نامعتبر در دیتابیس شود. همچنین در app/schemas/user_schema.py، validation برای email و password strength وجود ندارد.

## Prompt

## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
عدم وجود validation در schemaهای Pydantic

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — فیلدهای due_date و priority validation ندارند
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime | None = None
      priority: int = 0
  ```
- `app/schemas/user_schema.py:1-25` — `UserCreate` — فیلدهای email و password validation ندارند
  ```python
  class UserCreate(BaseModel):
      email: str
      password: str
      username: str
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Pydantic v2 + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 15) — از TaskCreate برای دریافت داده استفاده می‌کند
- `app/routes/auth.py` (سطر 20) — از UserCreate برای ثبت‌نام استفاده می‌کند
- `app/services/auth_service.py` (سطر 30) — داده‌های کاربر را پردازش می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام endpointهایی که از این schemaها استفاده می‌کنند تأثیر می‌گذارد

## 🔍 Context و وضعیت فعلی
در فایل app/schemas/task_schema.py، فیلدهای مهم مانند due_date و priority validation ندارند. این می‌تواند منجر به ذخیره داده‌های نامعتبر در دیتابیس شود. همچنین در app/schemas/user_schema.py، validation برای email و password strength وجود ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] TaskCreate.priority فقط مقادیر 0-5 را بپذیرد
- [ ] UserCreate.email با فرمت معتبر ایمیل بررسی شود
- [ ] UserCreate.password حداقل 8 کاراکتر باشد
- [ ] تست‌های unit برای validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن validators به Pydantic models برای اطمینان از صحت داده‌ها قبل از ذخیره‌سازی

## 💡 نمونه‌های قبل/بعد
**اضافه کردن validator به TaskCreate**

_قبل:_
```
priority: int = 0
```

_بعد:_
```
priority: int = Field(default=0, ge=0, le=5, description='Priority level 0-5')
```

**اضافه کردن validator به UserCreate**

_قبل:_
```
email: str
```

_بعد:_
```
email: EmailStr
password: str = Field(min_length=8, description='Password must be at least 8 characters')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py -v`
- `pytest tests/test_auth.py -v`
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"priority": 10}'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن درخواست‌های موجود با داده‌های نامعتبر

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

## Acceptance Criteria

1. TaskCreate.priority فقط مقادیر 0-5 را بپذیرد _(verify: static)_
2. UserCreate.email با فرمت معتبر ایمیل بررسی شود _(verify: static)_
3. UserCreate.password حداقل 8 کاراکتر باشد _(verify: static)_
4. تست‌های unit برای validation اضافه شود _(verify: backend_test)_
