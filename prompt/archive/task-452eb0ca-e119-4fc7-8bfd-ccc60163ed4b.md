---
task_id: 452eb0ca-e119-4fc7-8bfd-ccc60163ed4b
title: Consolidate token validation logic
type: refactor
priority: medium
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-19T20:23:42.386805+00:00'
updated_at: '2026-05-29T20:26:15.125758+00:00'
archived: true
archived_at: '2026-05-25T06:33:49.507720+00:00'
tags:
- merged
target_files:
- app/services/auth_service.py
---

# Consolidate token validation logic

## Raw Idea

تابع validate_token در app/services/auth_service.py و منطق مشابه در app/middleware.py هر دو توکن JWT را اعتبارسنجی می‌کنند. این duplication باعث می‌شود که تغییر در یک بخش (مثلاً اضافه کردن بررسی expiry) در بخش دیگر اعمال نشود. همچنین، احتمال inconsistency در خطاها و پیام‌ها وجود دارد.

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
Duplicated logic در validation توکن بین auth_service و middleware

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:20-40` — `validate_token` — این تابع باید به عنوان منبع واحد استفاده شود
  ```python
  def validate_token(token: str) -> Optional[User]:
      try:
          payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
          user = get_user_by_id(payload['sub'])
          return user
      except:
          return None
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + PyJWT + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/middleware.py` (سطر 10) — منطق مشابهی دارد که باید حذف شود
- `app/routes/auth.py` (سطر 15) — از validate_token استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تغییر در auth_service.py بر middleware و auth route تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
تابع validate_token در app/services/auth_service.py و منطق مشابه در app/middleware.py هر دو توکن JWT را اعتبارسنجی می‌کنند. این duplication باعث می‌شود که تغییر در یک بخش (مثلاً اضافه کردن بررسی expiry) در بخش دیگر اعمال نشود. همچنین، احتمال inconsistency در خطاها و پیام‌ها وجود دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] middleware از validate_token در auth_service.py استفاده می‌کند
- [ ] هیچ duplicate logic برای اعتبارسنجی توکن در پروژه وجود ندارد
- [ ] تست‌ها پاس می‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک تابع واحد برای اعتبارسنجی توکن در auth_service.py ایجاد کنید و از آن در middleware و هر جای دیگر استفاده کنید. middleware باید این تابع را import کند.

## 💡 نمونه‌های قبل/بعد
**رفع duplication در middleware**

_قبل:_
```
from app.services.auth_service import validate_token
# middleware از validate_token استفاده نمی‌کند
```

_بعد:_
```
from app.services.auth_service import validate_token
# middleware از validate_token استفاده می‌کند
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'jwt.decode' app/`
- `pytest app/tests/test_auth.py`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک پایین، تغییرات backward-compatible هستند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

## Acceptance Criteria

1. middleware از validate_token در auth_service.py استفاده می‌کند _(verify: static)_
2. هیچ duplicate logic برای اعتبارسنجی توکن در پروژه وجود ندارد _(verify: static)_
3. تست‌ها پاس می‌شوند _(verify: backend_test)_
