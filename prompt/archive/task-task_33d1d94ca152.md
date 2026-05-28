---
task_id: task_33d1d94ca152
title: اصلاح وضعیت خطای احراز هویت و پیاده‌سازی Rate Limit
type: other
priority: critical
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:33:33.806462+00:00'
updated_at: '2026-05-25T09:49:23.094516+00:00'
archived: true
archived_at: '2026-05-25T09:49:23.094513+00:00'
tags:
- consolidated
- post_verify_merge
---

# اصلاح وضعیت خطای احراز هویت و پیاده‌سازی Rate Limit

## Raw Idea

🧬 این یک تسک تلفیقی است — از 8 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه شامل تسک‌هایی است که مستقیماً به سیستم احراز هویت بک‌اند مربوط می‌شوند، از جمله مدیریت خطاهای احراز هویت، امنیت رمز عبور، پیکربندی JWT، پیاده‌سازی Rate Limiting، یکپارچه‌سازی Middleware احراز هویت و بهینه‌سازی منطق اعتبارسنجی توکن. این تسک‌ها فایل‌های مشترکی مانند auth_service.py، middleware.py و config.py را درگیر می‌کنند.
🎯 theme: بهبود و امنیت سیستم احراز هویت بک‌اند
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 8
  id: fa00b99c-96f3-4ba2-a43e-c111b63ae944
  عنوان اصلی: برگرداندن status code 401 برای خطای احراز هویت
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - ورود با رمز عبور اشتباه status code 401 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "wrong", "password": "wrong"}, "expected_status": 401, "required_fields": [], "json_contains": null}]
  - frontend بتواند خطای 401 را تشخیص دهد و کاربر را به صفحه login هدایت کند [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/login"}, {"action": "fill", "selector": "input[name='username']", "value": "wrong"}, {"action": "fill", "selector": "input[name='passw]
  - تست واحد برای خطای احراز هویت با status code صحیح [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py::test_login_wrong_password_returns_401", "timeout_seconds": 60}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
عدم تطابق status code برای خطای احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:45-55` — `authenticate_user` — باید 401 باشد نه 500
  ```python
  if not user or not verify_password(password, user.hashed_password):
      raise HTTPException(status_code=500, detail='Authentication failed')
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + HTTPException + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 20) — از این سرویس استفاده می‌کند
- `frontend/src/lib/auth.ts` (سطر 15) — frontend خطا را مدیریت می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تمام endpointهای auth که نیاز به احراز هویت دارند تحت تأثیر هستند.

## 🔍 Context و وضعیت فعلی
در app/services/auth_service.py، هنگام خطای احراز هویت، status code 500 برمی‌گرداند در حالی که frontend انتظار 401 (Unauthorized) یا 403 (Forbidden) دارد. این باعث می‌شود frontend نتواند خطا را به درستی مدیریت کند و کاربر پیام خطای generic ببیند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ورود با رمز عبور اشتباه status code 401 برگرداند
- [ ] frontend بتواند خطای 401 را تشخیص دهد و کاربر را به صفحه login هدایت کند
- [ ] تست واحد برای خطای احراز هویت با status code صحیح
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر exception handler در auth_service.py به HTTPException با status_code=401 برای خطاهای احراز هویت.

## 💡 نمونه‌های قبل/بعد
**اصلاح status code**

_قبل:_
```
raise HTTPException(status_code=500, detail='Authentication failed')
```

_بعد:_
```
raise HTTPException(status_code=401, detail='Invalid credentials')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -v -X POST http://localhost:8000/api/auth/login -d '{"email":"wrong@test.com","password":"wrong"}'`
- `pytest tests/test_auth.py -k authentication`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر status code ممکن است clientهای قدیمی را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: b4332cb7-e7f2-4056-9312-74128cdcdf99
  عنوان اصلی: Implement rate limiting for authentication middleware
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - 5 failed login attempts from same IP within 5 minutes returns 429 [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "attacker", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - Rate limit headers (X-RateLimit-Remaining) present in response [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "user", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - Successful login resets attempt counter for that IP [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "valid_user", "password": "correct_password"}, "expected_status": 200, "required_fields": [], "json_contains": ]
  - Rate limit configuration is environment-specific [verify_method=static] [verify_plan={"grep_patterns": ["os.environ.get", "RATE_LIMIT", "config"], "files_hint": ["app/middleware.py", "app/config.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Authentication middleware missing rate limiting and brute-force protection

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:1-30` — `RateLimitingMiddleware` — Missing rate limiting implementation
  ```python
  class AuthMiddleware:
      async def dispatch(self, request, call_next):
          # No rate limiting logic
          response = await call_next(request)
          return response
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + JWT + Redis (recommended)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — Login endpoint that needs protection
- `app/services/auth_service.py` — Authentication logic that should track attempts

## 🌐 نقشهٔ وابستگی‌ها
Requires Redis dependency for production-grade rate limiting. Affects all authentication endpoints.

## 🔍 Context و وضعیت فعلی
The authentication endpoint at app/routes/auth.py and the middleware at app/middleware.py show no evidence of rate limiting or brute-force protection. Without these, the login endpoint is vulnerable to credential stuffing and brute-force attacks. The middleware only handles basic auth checks without any request throttling.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 5 failed login attempts from same IP within 5 minutes returns 429
- [ ] Rate limit headers (X-RateLimit-Remaining) present in response
- [ ] Successful login resets attempt counter for that IP
- [ ] Rate limit configuration is environment-specific
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Implement rate limiting using FastAPI's dependency injection or a middleware. Add a rate limiter that tracks failed login attempts per IP address and per username, with exponential backoff after 5 failed attempts. Use Redis or in-memory cache for tracking.

## 💡 نمونه‌های قبل/بعد
**Add rate limiting to login**

_قبل:_
```
@router.post('/login')
async def login(credentials, db):
    user = auth_service.authenticate(credentials)
    return {'token': create_token(user)}
```

_بعد:_
```
@router.post('/login')
@rate_limit(max_requests=5, window_seconds=300)
async def login(credentials, request, db):
    if await is_ip_blocked(request.client.host):
        raise HTTPException(429, 'Too many attempts')
    user = auth_service.authenticate(credentials)
    if not user:
        await track_failed_attempt(request.client.host, credentials.username)
        raise HTTPException(401, 'Invalid credentials')
    return {'token': create_token(user)}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `for i in {1..6}; do curl -X POST http://localhost:8000/api/auth/login -d '{"username":"test","password":"wrong"}' -w '%{http_code}\n'; done`
- `pytest tests/test_auth.py -k rate_limit`

## ⚠️ ریسک‌ها و موارد احتیاط
May require Redis setup; could block legitimate users if thresholds are too aggressive

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 8
  id: 1d571455-f49f-4ad3-a6d1-405586247ab0
  عنوان اصلی: هش کردن رمز عبور در دیتابیس
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text) [verify_method=static] [verify_plan={"grep_patterns": ["User\\(password=.*hash", "hash_password", "bcrypt", "pbkdf2", "argon2"], "files_hint": ["app/services/auth_service.py"]}]
  - login با رمز عبور صحیح کار کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "testuser", "password": "correct_password"}, "expected_status": 200, "required_fields": ["token", "user"], "jso]
  - login با رمز عبور اشتباه HTTP 401 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "testuser", "password": "wrong_password"}, "expected_status": 401, "required_fields": [], "json_contains": null]
  - تست واحد برای hashing و verification اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py::test_password_hashing_and_verification", "timeout_seconds": 60}]
  - migration برای hashing رمزهای عبور موجود اجرا شود [verify_method=static] [verify_plan={"grep_patterns": ["def upgrade", "def downgrade", "password_hash", "alembic"], "files_hint": ["migrations/versions/"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
ذخیره رمز عبور به صورت plain text در دیتابیس

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:50-70` — `create_user` — تابع ایجاد کاربر که رمز عبور را بدون hash ذخیره می‌کند
  ```python
  def create_user(data):
      user = User(
          username=data['username'],
          password=data['password']  # ⚠️ plain text
      )
      db.add(user)
      db.commit()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + bcrypt

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/user.py` (سطر 15) — مدل دیتابیس user که فیلد password را دارد
- `app/routes/auth.py` (سطر 30) — endpoint ثبت‌نام که از این سرویس استفاده می‌کند
- `requirements.txt` (سطر 20) — نیاز به اضافه کردن bcrypt به وابستگی‌ها

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی کل فرآیند احراز هویت تأثیر می‌گذارد و نیاز به migration دیتابیس برای hashing رمزهای عبور موجود دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/services/auth_service.py (خطوط 50-70)، رمز عبور کاربران بدون هیچ hashing یا encryption در دیتابیس ذخیره می‌شود. این آسیب‌پذیری در صورت نشت دیتابیس، تمام رمزهای عبور کاربران را در معرض دید قرار می‌دهد. شواهد: کد موجود در خط 55: `user = User(password=data['password'])` بدون هیچ hashing.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text)
- [ ] login با رمز عبور صحیح کار کند
- [ ] login با رمز عبور اشتباه HTTP 401 برمی‌گرداند
- [ ] تست واحد برای hashing و verification اضافه شود
- [ ] migration برای hashing رمزهای عبور موجود اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. پیاده‌سازی hashing رمز عبور با استفاده از bcrypt یا Argon2 قبل از ذخیره در دیتابیس. همچنین اضافه کردن verification در زمان login با استفاده از hash مقایسه.

## 💡 نمونه‌های قبل/بعد
**hashing رمز عبور با bcrypt**

_قبل:_
```
user = User(password=data['password'])
```

_بعد:_
```
hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
user = User(password=hashed_password.decode())
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_password_hashing`
- `python -c "from app.services.auth_service import verify_password; print(verify_password('test123', hashed))"`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط؛ نیاز به migration دیتابیس و تغییر logic login/register

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 8
  id: be3a1e0c-ee1f-4646-a00a-29d5b29bad62
  عنوان اصلی: پیکربندی JWT_SECRET_KEY از متغیر محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/config.py

📋 acceptance_criteria کامل:
  - JWT_SECRET_KEY از متغیر محیطی خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY.*os\\.getenv", "JWT_SECRET_KEY.*environ"], "files_hint": ["app/config.py"]}]
  - مقدار پیش‌فرض فقط برای محیط توسعه باشد [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY.*=.*os\\.getenv.*default.*dev", "JWT_SECRET_KEY.*=.*os\\.environ\\.get.*dev"], "files_hint": ["app/config.py"]}]
  - در production حتماً مقدار متغیر محیطی تنظیم شود [verify_method=static] [verify_plan={"grep_patterns": ["if.*production.*raise", "if.*ENV.*production.*assert", "if.*PRODUCTION.*raise"], "files_hint": ["app/config.py"]}]
  - هیچ کلید هاردکد شده‌ای در کد باقی نماند [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY\\s*=\\s*['\"][^'\"]+['\"]"], "files_hint": ["app/config.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
JWT_SECRET_KEY هاردکد شده در app/config.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:5-10` — `JWT_SECRET_KEY` — خط حاوی کلید JWT هاردکد شده
  ```python
  JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + FastAPI + PyJWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/services/auth_service.py` (سطر 15) — از JWT_SECRET_KEY برای امضای توکن‌ها استفاده می‌کند
- `app/routes/auth.py` (سطر 20) — از auth_service برای احراز هویت استفاده می‌کند
- `.env.example` (سطر 1) — الگوی متغیر محیطی برای JWT_SECRET_KEY

## 🌐 نقشهٔ وابستگی‌ها
این کلید در auth_service.py برای ایجاد و تأیید توکن‌های JWT استفاده می‌شود. تغییر آن بر کل فرآیند احراز هویت تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در فایل app/config.py، مقدار JWT_SECRET_KEY به صورت مستقیم و هاردکد شده در کد قرار دارد. این یک نقص امنیتی جدی است زیرا هر کسی که به کد منبع دسترسی داشته باشد می‌تواند توکن‌های JWT معتبر تولید کند و به سیستم نفوذ کند. همچنین این کلید در تمام محیط‌ها (توسعه، staging، production) یکسان است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] JWT_SECRET_KEY از متغیر محیطی خوانده شود
- [ ] مقدار پیش‌فرض فقط برای محیط توسعه باشد
- [ ] در production حتماً مقدار متغیر محیطی تنظیم شود
- [ ] هیچ کلید هاردکد شده‌ای در کد باقی نماند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. JWT_SECRET_KEY را از کد حذف کرده و به متغیر محیطی (environment variable) منتقل کنید. از یک مقدار پیش‌فرض امن برای محیط توسعه استفاده کنید و در production حتماً مقدار منحصربه‌فرد و قوی تنظیم شود.

## 💡 نمونه‌های قبل/بعد
**رفع هاردکد کردن JWT_SECRET_KEY**

_قبل:_
```
JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
```

_بعد:_
```
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r "JWT_SECRET_KEY" app/ --include="*.py" | grep -v "os.getenv"`
- `python -c "from app.config import JWT_SECRET_KEY; print(JWT_SECRET_KEY[:10])"`

## ⚠️ ریسک‌ها و موارد احتیاط
پس از تغییر، تمام توکن‌های JWT قبلی نامعتبر می‌شوند و کاربران باید دوباره لاگین کنند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 8
  id: d185580d-dca4-4554-a7e7-21b2b9b7d3e2
  عنوان اصلی: افزودن تست واحد برای auth_service.py
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - فایل tests/test_auth_service.py ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["tests/test_auth_service.py"]}]
  - تست register با داده‌های معتبر و نامعتبر پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_register", "timeout_seconds": 60}]
  - تست login با رمز عبور صحیح و غلط پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_login", "timeout_seconds": 60}]
  - تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_verify_token", "timeout_seconds": 60}]
  - تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_refresh_token", "timeout_seconds": 60}]
  - همه تست‌ها با موفقیت پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py", "timeout_seconds": 120}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
فایل app/services/auth_service.py بدون تست واحد است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:1-200` — `کل فایل` — کل سرویس auth_service نیاز به پوشش تست دارد
  ```python
  class AuthService:
      def register(self, user_data):
          ...
      def login(self, email, password):
          ...
      def verify_token(self, token):
          ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + JWT + Python 3.x

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — این route از AuthService استفاده می‌کند
- `app/models/user.py` (سطر 1) — مدل User که توسط AuthService استفاده می‌شود
- `app/database.py` (سطر 1) — دیتابیس که AuthService به آن متصل است

## 🌐 نقشهٔ وابستگی‌ها
AuthService توسط route auth.py و احتمالاً middlewareها و سایر سرویس‌ها استفاده می‌شود. عدم تست این سرویس می‌تواند کل فرآیند احراز هویت را تحت تأثیر قرار دهد.

## 🔍 Context و وضعیت فعلی
سرویس احراز هویت (auth_service.py) یکی از بحرانی‌ترین بخش‌های برنامه است که وظیفه مدیریت لاگین، ثبت‌نام، توکن JWT و احراز هویت کاربران را بر عهده دارد. با بررسی فایل‌های تست موجود در tests/، هیچ فایل تستی برای این سرویس یافت نشد. این موضوع یک ریسک امنیتی جدی محسوب می‌شود زیرا هرگونه باگ در این سرویس می‌تواند منجر به دسترسی غیرمجاز یا نشت اطلاعات شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل tests/test_auth_service.py ایجاد شود
- [ ] تست register با داده‌های معتبر و نامعتبر پوشش داده شود
- [ ] تست login با رمز عبور صحیح و غلط پوشش داده شود
- [ ] تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود
- [ ] تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود
- [ ] همه تست‌ها با موفقیت پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک فایل تست جدید به نام tests/test_auth_service.py ایجاد کنید و تست‌های واحد برای تمام توابع اصلی auth_service شامل register, login, verify_token, refresh_token, logout و reset_password بنویسید.

## 💡 نمونه‌های قبل/بعد
**افزودن تست برای تابع login**

_قبل:_
```
# هیچ تستی وجود ندارد
```

_بعد:_
```
def test_login_success(client, db_session):
    user = UserFactory(email='test@test.com')
    response = client.post('/auth/login', json={'email': 'test@test.com', 'password': 'password'})
    assert response.status_code == 200
    assert 'access_token' in response.json()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth_service.py -v`
- `pytest tests/ --cov=app/services/auth_service.py --cov-report=term-missing`

## ⚠️ ریسک‌ها و موارد احتیاط
بدون تست، هر تغییری در auth_service می‌تواند امنیت برنامه را به خطر بیندازد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 8
  id: 33f16648-edfe-4ab5-b75d-c070748b6cea
  عنوان اصلی: پیاده‌سازی rate limiting روی endpointهای احراز هویت
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/auth.py

📋 acceptance_criteria کامل:
  - ارسال بیش از 5 درخواست در دقیقه به /login HTTP 429 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/login", "headers": null, "json_body": {"username": "test", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - ارسال بیش از 3 درخواست در ساعت به /register HTTP 429 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/register", "headers": null, "json_body": {"username": "test", "password": "test123"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - rate limit برای هر IP جداگانه محاسبه می‌شود [verify_method=api_response] [verify_plan={"method": "POST", "path": "/login", "headers": {"X-Forwarded-For": "1.2.3.4"}, "json_body": {"username": "test", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": ]
  - تست واحد برای rate limiting اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_rate_limiting.py::test_rate_limit", "timeout_seconds": 60}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
عدم وجود rate limiting روی endpointهای احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/auth.py:12-45` — `login_endpoint` — endpointهای احراز هویت که نیاز به rate limiting دارند
  ```python
  @router.post('/login')
  async def login(request: Request):
      # ⚠️ بدون rate limiting
      data = await request.json()
      ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + slowapi + Python 3.11

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` (سطر 25) — محل نصب middlewareهای عمومی
- `app/middleware.py` (سطر 1) — محل مناسب برای پیاده‌سازی rate limiter
- `requirements.txt` (سطر 15) — نیاز به اضافه کردن slowapi به وابستگی‌ها

## 🌐 نقشهٔ وابستگی‌ها
این تغییر فقط روی endpointهای auth تأثیر می‌گذارد و نیاز به نصب کتابخانه جدید slowapi دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/routes/auth.py، endpointهای /login و /register (خطوط 12-45) هیچ محدودیت نرخ درخواست (rate limiting) ندارند. این آسیب‌پذیری امکان brute force attack برای حدس زدن رمز عبور یا DoS attack را فراهم می‌کند. شواهد: کد موجود در خطوط 12-45 فقط validation ساده دارد و هیچ middleware rate limiting اعمال نشده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ارسال بیش از 5 درخواست در دقیقه به /login HTTP 429 برمی‌گرداند
- [ ] ارسال بیش از 3 درخواست در ساعت به /register HTTP 429 برمی‌گرداند
- [ ] rate limit برای هر IP جداگانه محاسبه می‌شود
- [ ] تست واحد برای rate limiting اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن rate limiting با استفاده از slowapi یا middleware سفارشی برای endpointهای حساس. محدودیت پیشنهادی: 5 تلاش در دقیقه برای /login و 3 تلاش در ساعت برای /register.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن rate limiter**

_قبل:_
```
@router.post('/login')
async def login(request: Request):
    ...
```

_بعد:_
```
@router.post('/login')
@limiter.limit('5/minute')
async def login(request: Request, response: Response):
    ...
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_rate_limit`
- `for i in {1..6}; do curl -X POST http://localhost:8000/api/login -d '{}' -w '%{http_code}\n'; done`

## ⚠️ ریسک‌ها و موارد احتیاط
کم؛ فقط نیاز به نصب کتابخانه و اضافه کردن decorator

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: eabd81cd-47f4-4f87-85c3-b8914360a3f6
  عنوان اصلی: یکپارچه‌سازی احراز هویت و پاکسازی middleware
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت استفاده می‌کنند [verify_method=static] [verify_plan={"grep_patterns": ["jwt", "JWT", "authenticate", "verify_token"], "files_hint": ["app/middleware.py", "app/routes/auth.py"]}]
  - middleware احراز هویت یا حذف شده یا با auth route هماهنگ است [verify_method=static] [verify_plan={"grep_patterns": ["class AuthMiddleware", "def authenticate", "middleware"], "files_hint": ["app/middleware.py"]}]
  - هیچ duplicate validation در زنجیره درخواست وجود ندارد [verify_method=static] [verify_plan={"grep_patterns": ["authenticate", "verify", "validate", "jwt"], "files_hint": ["app/middleware.py", "app/routes/auth.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Conflict بین سیستم احراز هویت قدیمی و جدید در middleware

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:1-50` — `AuthMiddleware` — این middleware ممکن است با سیستم جدید conflict داشته باشد
  ```python
  class AuthMiddleware:
      async def __call__(self, request, call_next):
          token = request.headers.get('Authorization')
          if token:
              user = validate_token(token)
              request.state.user = user
          response = await call_next(request)
          return response
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + JWT + Middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — سیستم جدید احراز هویت که JWT صادر می‌کند
- `app/services/auth_service.py` (سطر 1) — سرویس احراز هویت که توسط هر دو استفاده می‌شود

## 🌐 نقشهٔ وابستگی‌ها
این conflict بر تمام endpointهایی که نیاز به احراز هویت دارند تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
فایل app/middleware.py شامل middleware احراز هویت است که از JWT استفاده می‌کند، اما app/routes/auth.py نیز یک endpoint لاگین با JWT دارد. به نظر می‌رسد دو سیستم موازی وجود دارد: یکی در middleware (که احتمالاً قدیمی است) و دیگری در auth route (که جدیدتر است). این می‌تواند باعث شود که برخی درخواست‌ها دو بار احراز هویت شوند یا برخی مسیرها از middleware عبور نکنند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت استفاده می‌کنند
- [ ] middleware احراز هویت یا حذف شده یا با auth route هماهنگ است
- [ ] هیچ duplicate validation در زنجیره درخواست وجود ندارد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بررسی کنید که آیا middleware احراز هویت واقعاً استفاده می‌شود یا منسوخ شده است. اگر منسوخ شده، آن را حذف کنید و منطق آن را به dependency injection در FastAPI منتقل کنید. اگر نه، آن را با auth route هماهنگ کنید.

## 💡 نمونه‌های قبل/بعد
**حذف middleware و استفاده از dependency**

_قبل:_
```
app.add_middleware(AuthMiddleware)
```

_بعد:_
```
app.include_router(auth_router)
# استفاده از Depends(get_current_user) در endpointها
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest app/tests/test_auth.py -k middleware`
- `curl -H 'Authorization: Bearer <token>' http://localhost:8000/api/projects`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف middleware ممکن است endpointهایی که به آن وابسته هستند را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 8
  id: 452eb0ca-e119-4fc7-8bfd-ccc60163ed4b
  عنوان اصلی: Consolidate token validation logic
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - middleware از validate_token در auth_service.py استفاده می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.auth_service import validate_token", "validate_token"], "files_hint": ["app/middleware.py"]}]
  - هیچ duplicate logic برای اعتبارسنجی توکن در پروژه وجود ندارد [verify_method=static] [verify_plan={"grep_patterns": ["def validate_token"], "files_hint": ["app/services/auth_service.py"]}]
  - تست‌ها پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: fa00b99c-96f3-4ba2-a43e-c111b63ae944, b4332cb7-e7f2-4056-9312-74128cdcdf99, 1d571455-f49f-4ad3-a6d1-405586247ab0, be3a1e0c-ee1f-4646-a00a-29d5b29bad62, d185580d-dca4-4554-a7e7-21b2b9b7d3e2, 33f16648-edfe-4ab5-b75d-c070748b6cea, eabd81cd-47f4-4f87-85c3-b8914360a3f6, 452eb0ca-e119-4fc7-8bfd-ccc60163ed4b`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 8 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه شامل تسک‌هایی است که مستقیماً به سیستم احراز هویت بک‌اند مربوط می‌شوند، از جمله مدیریت خطاهای احراز هویت، امنیت رمز عبور، پیکربندی JWT، پیاده‌سازی Rate Limiting، یکپارچه‌سازی Middleware احراز هویت و بهینه‌سازی منطق اعتبارسنجی توکن. این تسک‌ها فایل‌های مشترکی مانند auth_service.py، middleware.py و config.py را درگیر می‌کنند.
🎯 theme: بهبود و امنیت سیستم احراز هویت بک‌اند
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 8
  id: fa00b99c-96f3-4ba2-a43e-c111b63ae944
  عنوان اصلی: برگرداندن status code 401 برای خطای احراز هویت
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - ورود با رمز عبور اشتباه status code 401 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "wrong", "password": "wrong"}, "expected_status": 401, "required_fields": [], "json_contains": null}]
  - frontend بتواند خطای 401 را تشخیص دهد و کاربر را به صفحه login هدایت کند [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/login"}, {"action": "fill", "selector": "input[name='username']", "value": "wrong"}, {"action": "fill", "selector": "input[name='passw]
  - تست واحد برای خطای احراز هویت با status code صحیح [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py::test_login_wrong_password_returns_401", "timeout_seconds": 60}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
عدم تطابق status code برای خطای احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:45-55` — `authenticate_user` — باید 401 باشد نه 500
  ```python
  if not user or not verify_password(password, user.hashed_password):
      raise HTTPException(status_code=500, detail='Authentication failed')
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + HTTPException + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 20) — از این سرویس استفاده می‌کند
- `frontend/src/lib/auth.ts` (سطر 15) — frontend خطا را مدیریت می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تمام endpointهای auth که نیاز به احراز هویت دارند تحت تأثیر هستند.

## 🔍 Context و وضعیت فعلی
در app/services/auth_service.py، هنگام خطای احراز هویت، status code 500 برمی‌گرداند در حالی که frontend انتظار 401 (Unauthorized) یا 403 (Forbidden) دارد. این باعث می‌شود frontend نتواند خطا را به درستی مدیریت کند و کاربر پیام خطای generic ببیند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ورود با رمز عبور اشتباه status code 401 برگرداند
- [ ] frontend بتواند خطای 401 را تشخیص دهد و کاربر را به صفحه login هدایت کند
- [ ] تست واحد برای خطای احراز هویت با status code صحیح
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر exception handler در auth_service.py به HTTPException با status_code=401 برای خطاهای احراز هویت.

## 💡 نمونه‌های قبل/بعد
**اصلاح status code**

_قبل:_
```
raise HTTPException(status_code=500, detail='Authentication failed')
```

_بعد:_
```
raise HTTPException(status_code=401, detail='Invalid credentials')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -v -X POST http://localhost:8000/api/auth/login -d '{"email":"wrong@test.com","password":"wrong"}'`
- `pytest tests/test_auth.py -k authentication`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر status code ممکن است clientهای قدیمی را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: b4332cb7-e7f2-4056-9312-74128cdcdf99
  عنوان اصلی: Implement rate limiting for authentication middleware
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - 5 failed login attempts from same IP within 5 minutes returns 429 [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "attacker", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - Rate limit headers (X-RateLimit-Remaining) present in response [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "user", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - Successful login resets attempt counter for that IP [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "valid_user", "password": "correct_password"}, "expected_status": 200, "required_fields": [], "json_contains": ]
  - Rate limit configuration is environment-specific [verify_method=static] [verify_plan={"grep_patterns": ["os.environ.get", "RATE_LIMIT", "config"], "files_hint": ["app/middleware.py", "app/config.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Authentication middleware missing rate limiting and brute-force protection

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:1-30` — `RateLimitingMiddleware` — Missing rate limiting implementation
  ```python
  class AuthMiddleware:
      async def dispatch(self, request, call_next):
          # No rate limiting logic
          response = await call_next(request)
          return response
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + JWT + Redis (recommended)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — Login endpoint that needs protection
- `app/services/auth_service.py` — Authentication logic that should track attempts

## 🌐 نقشهٔ وابستگی‌ها
Requires Redis dependency for production-grade rate limiting. Affects all authentication endpoints.

## 🔍 Context و وضعیت فعلی
The authentication endpoint at app/routes/auth.py and the middleware at app/middleware.py show no evidence of rate limiting or brute-force protection. Without these, the login endpoint is vulnerable to credential stuffing and brute-force attacks. The middleware only handles basic auth checks without any request throttling.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 5 failed login attempts from same IP within 5 minutes returns 429
- [ ] Rate limit headers (X-RateLimit-Remaining) present in response
- [ ] Successful login resets attempt counter for that IP
- [ ] Rate limit configuration is environment-specific
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Implement rate limiting using FastAPI's dependency injection or a middleware. Add a rate limiter that tracks failed login attempts per IP address and per username, with exponential backoff after 5 failed attempts. Use Redis or in-memory cache for tracking.

## 💡 نمونه‌های قبل/بعد
**Add rate limiting to login**

_قبل:_
```
@router.post('/login')
async def login(credentials, db):
    user = auth_service.authenticate(credentials)
    return {'token': create_token(user)}
```

_بعد:_
```
@router.post('/login')
@rate_limit(max_requests=5, window_seconds=300)
async def login(credentials, request, db):
    if await is_ip_blocked(request.client.host):
        raise HTTPException(429, 'Too many attempts')
    user = auth_service.authenticate(credentials)
    if not user:
        await track_failed_attempt(request.client.host, credentials.username)
        raise HTTPException(401, 'Invalid credentials')
    return {'token': create_token(user)}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `for i in {1..6}; do curl -X POST http://localhost:8000/api/auth/login -d '{"username":"test","password":"wrong"}' -w '%{http_code}\n'; done`
- `pytest tests/test_auth.py -k rate_limit`

## ⚠️ ریسک‌ها و موارد احتیاط
May require Redis setup; could block legitimate users if thresholds are too aggressive

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 8
  id: 1d571455-f49f-4ad3-a6d1-405586247ab0
  عنوان اصلی: هش کردن رمز عبور در دیتابیس
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text) [verify_method=static] [verify_plan={"grep_patterns": ["User\\(password=.*hash", "hash_password", "bcrypt", "pbkdf2", "argon2"], "files_hint": ["app/services/auth_service.py"]}]
  - login با رمز عبور صحیح کار کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "testuser", "password": "correct_password"}, "expected_status": 200, "required_fields": ["token", "user"], "jso]
  - login با رمز عبور اشتباه HTTP 401 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "testuser", "password": "wrong_password"}, "expected_status": 401, "required_fields": [], "json_contains": null]
  - تست واحد برای hashing و verification اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py::test_password_hashing_and_verification", "timeout_seconds": 60}]
  - migration برای hashing رمزهای عبور موجود اجرا شود [verify_method=static] [verify_plan={"grep_patterns": ["def upgrade", "def downgrade", "password_hash", "alembic"], "files_hint": ["migrations/versions/"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
ذخیره رمز عبور به صورت plain text در دیتابیس

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:50-70` — `create_user` — تابع ایجاد کاربر که رمز عبور را بدون hash ذخیره می‌کند
  ```python
  def create_user(data):
      user = User(
          username=data['username'],
          password=data['password']  # ⚠️ plain text
      )
      db.add(user)
      db.commit()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + bcrypt

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/user.py` (سطر 15) — مدل دیتابیس user که فیلد password را دارد
- `app/routes/auth.py` (سطر 30) — endpoint ثبت‌نام که از این سرویس استفاده می‌کند
- `requirements.txt` (سطر 20) — نیاز به اضافه کردن bcrypt به وابستگی‌ها

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی کل فرآیند احراز هویت تأثیر می‌گذارد و نیاز به migration دیتابیس برای hashing رمزهای عبور موجود دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/services/auth_service.py (خطوط 50-70)، رمز عبور کاربران بدون هیچ hashing یا encryption در دیتابیس ذخیره می‌شود. این آسیب‌پذیری در صورت نشت دیتابیس، تمام رمزهای عبور کاربران را در معرض دید قرار می‌دهد. شواهد: کد موجود در خط 55: `user = User(password=data['password'])` بدون هیچ hashing.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text)
- [ ] login با رمز عبور صحیح کار کند
- [ ] login با رمز عبور اشتباه HTTP 401 برمی‌گرداند
- [ ] تست واحد برای hashing و verification اضافه شود
- [ ] migration برای hashing رمزهای عبور موجود اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. پیاده‌سازی hashing رمز عبور با استفاده از bcrypt یا Argon2 قبل از ذخیره در دیتابیس. همچنین اضافه کردن verification در زمان login با استفاده از hash مقایسه.

## 💡 نمونه‌های قبل/بعد
**hashing رمز عبور با bcrypt**

_قبل:_
```
user = User(password=data['password'])
```

_بعد:_
```
hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
user = User(password=hashed_password.decode())
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_password_hashing`
- `python -c "from app.services.auth_service import verify_password; print(verify_password('test123', hashed))"`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط؛ نیاز به migration دیتابیس و تغییر logic login/register

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 8
  id: be3a1e0c-ee1f-4646-a00a-29d5b29bad62
  عنوان اصلی: پیکربندی JWT_SECRET_KEY از متغیر محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/config.py

📋 acceptance_criteria کامل:
  - JWT_SECRET_KEY از متغیر محیطی خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY.*os\\.getenv", "JWT_SECRET_KEY.*environ"], "files_hint": ["app/config.py"]}]
  - مقدار پیش‌فرض فقط برای محیط توسعه باشد [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY.*=.*os\\.getenv.*default.*dev", "JWT_SECRET_KEY.*=.*os\\.environ\\.get.*dev"], "files_hint": ["app/config.py"]}]
  - در production حتماً مقدار متغیر محیطی تنظیم شود [verify_method=static] [verify_plan={"grep_patterns": ["if.*production.*raise", "if.*ENV.*production.*assert", "if.*PRODUCTION.*raise"], "files_hint": ["app/config.py"]}]
  - هیچ کلید هاردکد شده‌ای در کد باقی نماند [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY\\s*=\\s*['\"][^'\"]+['\"]"], "files_hint": ["app/config.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
JWT_SECRET_KEY هاردکد شده در app/config.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:5-10` — `JWT_SECRET_KEY` — خط حاوی کلید JWT هاردکد شده
  ```python
  JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + FastAPI + PyJWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/services/auth_service.py` (سطر 15) — از JWT_SECRET_KEY برای امضای توکن‌ها استفاده می‌کند
- `app/routes/auth.py` (سطر 20) — از auth_service برای احراز هویت استفاده می‌کند
- `.env.example` (سطر 1) — الگوی متغیر محیطی برای JWT_SECRET_KEY

## 🌐 نقشهٔ وابستگی‌ها
این کلید در auth_service.py برای ایجاد و تأیید توکن‌های JWT استفاده می‌شود. تغییر آن بر کل فرآیند احراز هویت تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در فایل app/config.py، مقدار JWT_SECRET_KEY به صورت مستقیم و هاردکد شده در کد قرار دارد. این یک نقص امنیتی جدی است زیرا هر کسی که به کد منبع دسترسی داشته باشد می‌تواند توکن‌های JWT معتبر تولید کند و به سیستم نفوذ کند. همچنین این کلید در تمام محیط‌ها (توسعه، staging، production) یکسان است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] JWT_SECRET_KEY از متغیر محیطی خوانده شود
- [ ] مقدار پیش‌فرض فقط برای محیط توسعه باشد
- [ ] در production حتماً مقدار متغیر محیطی تنظیم شود
- [ ] هیچ کلید هاردکد شده‌ای در کد باقی نماند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. JWT_SECRET_KEY را از کد حذف کرده و به متغیر محیطی (environment variable) منتقل کنید. از یک مقدار پیش‌فرض امن برای محیط توسعه استفاده کنید و در production حتماً مقدار منحصربه‌فرد و قوی تنظیم شود.

## 💡 نمونه‌های قبل/بعد
**رفع هاردکد کردن JWT_SECRET_KEY**

_قبل:_
```
JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
```

_بعد:_
```
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r "JWT_SECRET_KEY" app/ --include="*.py" | grep -v "os.getenv"`
- `python -c "from app.config import JWT_SECRET_KEY; print(JWT_SECRET_KEY[:10])"`

## ⚠️ ریسک‌ها و موارد احتیاط
پس از تغییر، تمام توکن‌های JWT قبلی نامعتبر می‌شوند و کاربران باید دوباره لاگین کنند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 8
  id: d185580d-dca4-4554-a7e7-21b2b9b7d3e2
  عنوان اصلی: افزودن تست واحد برای auth_service.py
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - فایل tests/test_auth_service.py ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["tests/test_auth_service.py"]}]
  - تست register با داده‌های معتبر و نامعتبر پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_register", "timeout_seconds": 60}]
  - تست login با رمز عبور صحیح و غلط پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_login", "timeout_seconds": 60}]
  - تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_verify_token", "timeout_seconds": 60}]
  - تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_refresh_token", "timeout_seconds": 60}]
  - همه تست‌ها با موفقیت پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py", "timeout_seconds": 120}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
فایل app/services/auth_service.py بدون تست واحد است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:1-200` — `کل فایل` — کل سرویس auth_service نیاز به پوشش تست دارد
  ```python
  class AuthService:
      def register(self, user_data):
          ...
      def login(self, email, password):
          ...
      def verify_token(self, token):
          ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + JWT + Python 3.x

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — این route از AuthService استفاده می‌کند
- `app/models/user.py` (سطر 1) — مدل User که توسط AuthService استفاده می‌شود
- `app/database.py` (سطر 1) — دیتابیس که AuthService به آن متصل است

## 🌐 نقشهٔ وابستگی‌ها
AuthService توسط route auth.py و احتمالاً middlewareها و سایر سرویس‌ها استفاده می‌شود. عدم تست این سرویس می‌تواند کل فرآیند احراز هویت را تحت تأثیر قرار دهد.

## 🔍 Context و وضعیت فعلی
سرویس احراز هویت (auth_service.py) یکی از بحرانی‌ترین بخش‌های برنامه است که وظیفه مدیریت لاگین، ثبت‌نام، توکن JWT و احراز هویت کاربران را بر عهده دارد. با بررسی فایل‌های تست موجود در tests/، هیچ فایل تستی برای این سرویس یافت نشد. این موضوع یک ریسک امنیتی جدی محسوب می‌شود زیرا هرگونه باگ در این سرویس می‌تواند منجر به دسترسی غیرمجاز یا نشت اطلاعات شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل tests/test_auth_service.py ایجاد شود
- [ ] تست register با داده‌های معتبر و نامعتبر پوشش داده شود
- [ ] تست login با رمز عبور صحیح و غلط پوشش داده شود
- [ ] تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود
- [ ] تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود
- [ ] همه تست‌ها با موفقیت پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک فایل تست جدید به نام tests/test_auth_service.py ایجاد کنید و تست‌های واحد برای تمام توابع اصلی auth_service شامل register, login, verify_token, refresh_token, logout و reset_password بنویسید.

## 💡 نمونه‌های قبل/بعد
**افزودن تست برای تابع login**

_قبل:_
```
# هیچ تستی وجود ندارد
```

_بعد:_
```
def test_login_success(client, db_session):
    user = UserFactory(email='test@test.com')
    response = client.post('/auth/login', json={'email': 'test@test.com', 'password': 'password'})
    assert response.status_code == 200
    assert 'access_token' in response.json()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth_service.py -v`
- `pytest tests/ --cov=app/services/auth_service.py --cov-report=term-missing`

## ⚠️ ریسک‌ها و موارد احتیاط
بدون تست، هر تغییری در auth_service می‌تواند امنیت برنامه را به خطر بیندازد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 8
  id: 33f16648-edfe-4ab5-b75d-c070748b6cea
  عنوان اصلی: پیاده‌سازی rate limiting روی endpointهای احراز هویت
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/auth.py

📋 acceptance_criteria کامل:
  - ارسال بیش از 5 درخواست در دقیقه به /login HTTP 429 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/login", "headers": null, "json_body": {"username": "test", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - ارسال بیش از 3 درخواست در ساعت به /register HTTP 429 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/register", "headers": null, "json_body": {"username": "test", "password": "test123"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - rate limit برای هر IP جداگانه محاسبه می‌شود [verify_method=api_response] [verify_plan={"method": "POST", "path": "/login", "headers": {"X-Forwarded-For": "1.2.3.4"}, "json_body": {"username": "test", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": ]
  - تست واحد برای rate limiting اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_rate_limiting.py::test_rate_limit", "timeout_seconds": 60}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
عدم وجود rate limiting روی endpointهای احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/auth.py:12-45` — `login_endpoint` — endpointهای احراز هویت که نیاز به rate limiting دارند
  ```python
  @router.post('/login')
  async def login(request: Request):
      # ⚠️ بدون rate limiting
      data = await request.json()
      ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + slowapi + Python 3.11

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` (سطر 25) — محل نصب middlewareهای عمومی
- `app/middleware.py` (سطر 1) — محل مناسب برای پیاده‌سازی rate limiter
- `requirements.txt` (سطر 15) — نیاز به اضافه کردن slowapi به وابستگی‌ها

## 🌐 نقشهٔ وابستگی‌ها
این تغییر فقط روی endpointهای auth تأثیر می‌گذارد و نیاز به نصب کتابخانه جدید slowapi دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/routes/auth.py، endpointهای /login و /register (خطوط 12-45) هیچ محدودیت نرخ درخواست (rate limiting) ندارند. این آسیب‌پذیری امکان brute force attack برای حدس زدن رمز عبور یا DoS attack را فراهم می‌کند. شواهد: کد موجود در خطوط 12-45 فقط validation ساده دارد و هیچ middleware rate limiting اعمال نشده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ارسال بیش از 5 درخواست در دقیقه به /login HTTP 429 برمی‌گرداند
- [ ] ارسال بیش از 3 درخواست در ساعت به /register HTTP 429 برمی‌گرداند
- [ ] rate limit برای هر IP جداگانه محاسبه می‌شود
- [ ] تست واحد برای rate limiting اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن rate limiting با استفاده از slowapi یا middleware سفارشی برای endpointهای حساس. محدودیت پیشنهادی: 5 تلاش در دقیقه برای /login و 3 تلاش در ساعت برای /register.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن rate limiter**

_قبل:_
```
@router.post('/login')
async def login(request: Request):
    ...
```

_بعد:_
```
@router.post('/login')
@limiter.limit('5/minute')
async def login(request: Request, response: Response):
    ...
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_rate_limit`
- `for i in {1..6}; do curl -X POST http://localhost:8000/api/login -d '{}' -w '%{http_code}\n'; done`

## ⚠️ ریسک‌ها و موارد احتیاط
کم؛ فقط نیاز به نصب کتابخانه و اضافه کردن decorator

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: eabd81cd-47f4-4f87-85c3-b8914360a3f6
  عنوان اصلی: یکپارچه‌سازی احراز هویت و پاکسازی middleware
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت استفاده می‌کنند [verify_method=static] [verify_plan={"grep_patterns": ["jwt", "JWT", "authenticate", "verify_token"], "files_hint": ["app/middleware.py", "app/routes/auth.py"]}]
  - middleware احراز هویت یا حذف شده یا با auth route هماهنگ است [verify_method=static] [verify_plan={"grep_patterns": ["class AuthMiddleware", "def authenticate", "middleware"], "files_hint": ["app/middleware.py"]}]
  - هیچ duplicate validation در زنجیره درخواست وجود ندارد [verify_method=static] [verify_plan={"grep_patterns": ["authenticate", "verify", "validate", "jwt"], "files_hint": ["app/middleware.py", "app/routes/auth.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Conflict بین سیستم احراز هویت قدیمی و جدید در middleware

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:1-50` — `AuthMiddleware` — این middleware ممکن است با سیستم جدید conflict داشته باشد
  ```python
  class AuthMiddleware:
      async def __call__(self, request, call_next):
          token = request.headers.get('Authorization')
          if token:
              user = validate_token(token)
              request.state.user = user
          response = await call_next(request)
          return response
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + JWT + Middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — سیستم جدید احراز هویت که JWT صادر می‌کند
- `app/services/auth_service.py` (سطر 1) — سرویس احراز هویت که توسط هر دو استفاده می‌شود

## 🌐 نقشهٔ وابستگی‌ها
این conflict بر تمام endpointهایی که نیاز به احراز هویت دارند تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
فایل app/middleware.py شامل middleware احراز هویت است که از JWT استفاده می‌کند، اما app/routes/auth.py نیز یک endpoint لاگین با JWT دارد. به نظر می‌رسد دو سیستم موازی وجود دارد: یکی در middleware (که احتمالاً قدیمی است) و دیگری در auth route (که جدیدتر است). این می‌تواند باعث شود که برخی درخواست‌ها دو بار احراز هویت شوند یا برخی مسیرها از middleware عبور نکنند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت استفاده می‌کنند
- [ ] middleware احراز هویت یا حذف شده یا با auth route هماهنگ است
- [ ] هیچ duplicate validation در زنجیره درخواست وجود ندارد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بررسی کنید که آیا middleware احراز هویت واقعاً استفاده می‌شود یا منسوخ شده است. اگر منسوخ شده، آن را حذف کنید و منطق آن را به dependency injection در FastAPI منتقل کنید. اگر نه، آن را با auth route هماهنگ کنید.

## 💡 نمونه‌های قبل/بعد
**حذف middleware و استفاده از dependency**

_قبل:_
```
app.add_middleware(AuthMiddleware)
```

_بعد:_
```
app.include_router(auth_router)
# استفاده از Depends(get_current_user) در endpointها
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest app/tests/test_auth.py -k middleware`
- `curl -H 'Authorization: Bearer <token>' http://localhost:8000/api/projects`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف middleware ممکن است endpointهایی که به آن وابسته هستند را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 8
  id: 452eb0ca-e119-4fc7-8bfd-ccc60163ed4b
  عنوان اصلی: Consolidate token validation logic
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - middleware از validate_token در auth_service.py استفاده می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.auth_service import validate_token", "validate_token"], "files_hint": ["app/middleware.py"]}]
  - هیچ duplicate logic برای اعتبارسنجی توکن در پروژه وجود ندارد [verify_method=static] [verify_plan={"grep_patterns": ["def validate_token"], "files_hint": ["app/services/auth_service.py"]}]
  - تست‌ها پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: fa00b99c-96f3-4ba2-a43e-c111b63ae944, b4332cb7-e7f2-4056-9312-74128cdcdf99, 1d571455-f49f-4ad3-a6d1-405586247ab0, be3a1e0c-ee1f-4646-a00a-29d5b29bad62, d185580d-dca4-4554-a7e7-21b2b9b7d3e2, 33f16648-edfe-4ab5-b75d-c070748b6cea, eabd81cd-47f4-4f87-85c3-b8914360a3f6, 452eb0ca-e119-4fc7-8bfd-ccc60163ed4b`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. ورود با رمز عبور اشتباه status code 401 برگرداند _(verify: api_response)_
2. frontend بتواند خطای 401 را تشخیص دهد و کاربر را به صفحه login هدایت کند _(verify: ui_interaction)_
3. تست واحد برای خطای احراز هویت با status code صحیح _(verify: backend_test)_
4. 5 failed login attempts from same IP within 5 minutes returns 429 _(verify: api_response)_
5. Rate limit headers (X-RateLimit-Remaining) present in response _(verify: api_response)_
6. Successful login resets attempt counter for that IP _(verify: api_response)_
7. Rate limit configuration is environment-specific _(verify: static)_
8. رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text) _(verify: static)_
9. login با رمز عبور صحیح کار کند _(verify: api_response)_
10. login با رمز عبور اشتباه HTTP 401 برمی‌گرداند _(verify: api_response)_
11. تست واحد برای hashing و verification اضافه شود _(verify: backend_test)_
12. migration برای hashing رمزهای عبور موجود اجرا شود _(verify: static)_
13. JWT_SECRET_KEY از متغیر محیطی خوانده شود _(verify: static)_
14. مقدار پیش‌فرض فقط برای محیط توسعه باشد _(verify: static)_
15. در production حتماً مقدار متغیر محیطی تنظیم شود _(verify: static)_
16. هیچ کلید هاردکد شده‌ای در کد باقی نماند _(verify: static)_
17. فایل tests/test_auth_service.py ایجاد شود _(verify: static)_
18. تست register با داده‌های معتبر و نامعتبر پوشش داده شود _(verify: backend_test)_
19. تست login با رمز عبور صحیح و غلط پوشش داده شود _(verify: backend_test)_
20. تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود _(verify: backend_test)_
21. تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود _(verify: backend_test)_
22. همه تست‌ها با موفقیت پاس شوند _(verify: backend_test)_
23. ارسال بیش از 5 درخواست در دقیقه به /login HTTP 429 برمی‌گرداند _(verify: api_response)_
24. ارسال بیش از 3 درخواست در ساعت به /register HTTP 429 برمی‌گرداند _(verify: api_response)_
25. rate limit برای هر IP جداگانه محاسبه می‌شود _(verify: api_response)_
26. تست واحد برای rate limiting اضافه شود _(verify: backend_test)_
27. همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت استفاده می‌کنند _(verify: static)_
28. middleware احراز هویت یا حذف شده یا با auth route هماهنگ است _(verify: static)_
29. هیچ duplicate validation در زنجیره درخواست وجود ندارد _(verify: static)_
30. middleware از validate_token در auth_service.py استفاده می‌کند _(verify: static)_
31. هیچ duplicate logic برای اعتبارسنجی توکن در پروژه وجود ندارد _(verify: static)_
32. تست‌ها پاس می‌شوند _(verify: backend_test)_

## Task Steps

### Step 1: بررسی اولیه خودکار و پیشگیری از پیاده‌سازی مجدد
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل هیچ وظیفه اجرایی مستقیمی نیست. هدف آن هشدار درباره احتمال وجود پیاده‌سازی قبلی، تشویق به بررسی مستقل repo، و تعیین مسئولیت مدل برای تصمیم‌گیری بر اساس ساختار واقعی کد است. این بخش دستور به اسکیپ کردن یا مرور نمی‌دهد، بلکه یک راهنمای رفتاری برای کل فرآیند است.
— [merged] این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل دستورالعمل‌های پیش از اجرا می‌شود. محتوای آن صرفاً راهنمایی برای بررسی وجود پیاده‌سازی قبلی، جستجوی فایل‌های مرتبط، و تصمیم‌گیری در مورد نیاز به تغییر است. هیچ مرحله اجرایی مستقیمی در این بخش وجود ندارد و هدف آن جلوگیری از کار تکراری یا اشتباه است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همهٔ کامیت‌ها در PR description بنویس.
```

### Step 2: رفع status code خطای احراز هویت از 500 به 401 در سرویس احراز هویت
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به تغییر status_code در خط 45-55 فایل app/services/auth_service.py در متد authenticate_user مربوط می‌شود. فقط خطای 'Authentication failed' را پوشش می‌دهد و شامل سایر خطاهای احتمالی یا تغییرات در routing یا middleware نیست. هیچ تغییر دیگری در منطق احراز هویت یا پیام خطا لازم نیست.
**Excerpt:**
```
عدم تطابق status code برای خطای احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:45-55` — `authenticate_user` — باید 401 باشد نه 500
  ```python
  if not user or not verify_password(password, user.hashed_password):
      raise HTTPException(status_code=500, detail='Authentication failed')
  ```
```

### Step 3: اصلاح status code خطای احراز هویت در AuthService از 500 به 401/403
**Status:** `done` (100%)
**Scope:** این مرحله فقط شامل تغییر status code بازگشتی از AuthService در هنگام خطای احراز هویت است. فایل هدف: app/services/auth_service.py. frontend (frontend/src/lib/auth.ts) انتظار 401 یا 403 دارد اما سرویس 500 برمی‌گرداند. این مرحله شامل تغییر منطق احراز هویت، اضافه کردن endpoint جدید، یا تغییر در routes نیست. فقط مقدار status_code در HTTPException باید اصلاح شود.
— [merged] این مرحله شامل تغییر status code خطای احراز هویت در بک‌اند از 500 (Internal Server Error) به 401 (Unauthorized) و اصلاح پیام خطا از 'Authentication failed' به 'Invalid credentials' است. فقط فایل‌های بک‌اند که شامل این خطا هستند تحت تأثیر قرار می‌گیرند. فرانت‌اند و تست‌ها در این مرحله تغییر نمی‌کنند مگر اینکه مستقیماً به این status code وابسته باشند.
**Excerpt:**
```
در app/services/auth_service.py، هنگام خطای احراز هویت، status code 500 برمی‌گرداند در حالی که frontend انتظار 401 (Unauthorized) یا 403 (Forbidden) دارد. این باعث می‌شود frontend نتواند خطا را به درستی مدیریت کند و کاربر پیام خطای generic ببیند.
```

### Step 4: تغییر exception handler در auth_service.py برای بازگرداندن HTTPException با status_code=401 در خطاهای احراز هویت
**Status:** `done` (100%)
**Scope:** این مرحله فقط شامل تغییر exception handler در فایل app/services/auth_service.py است تا به جای خطاهای عمومی، HTTPException با status_code=401 برای خطاهای احراز هویت (مانند رمز عبور اشتباه) برگرداند. سایر فایل‌ها، تست‌ها، linter و type-check در این مرحله تغییر نمی‌کنند اما باید پس از تغییر، تست‌ها و بررسی‌های مربوطه (که در ACها مشخص شده) پاس شوند.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ورود با رمز عبور اشتباه status code 401 برگرداند
- [ ] frontend بتواند خطای 401 را تشخیص دهد و کاربر را به صفحه login هدایت کند
- [ ] تست واحد برای خطای احراز هویت با status code صحیح
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر exception handler در auth_service.py به HTTPException با status_code=401 برای خطاهای احراز هویت.
```

### Step 5: پیاده‌سازی محدودیت نرخ (Rate Limiting) برای میان‌افزار احراز هویت
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی کامل قابلیت محدودیت نرخ (Rate Limiting) برای endpoint لاگین در میان‌افزار احراز هویت است. محدودیت بر اساس IP و تعداد تلاش‌های ناموفق در یک بازه زمانی ۵ دقیقه‌ای اعمال می‌شود. پس از ۵ تلاش ناموفق، status code 429 بازگردانده می‌شود. هدرهای X-RateLimit-Remaining باید در پاسخ حضور داشته باشند. لاگین موفق باید شمارنده تلاش‌های ناموفق آن IP را بازنشانی کند. تنظیمات محدودیت نرخ باید از طریق متغیرهای محیطی (environment-specific) قابل پیکربندی باشد. فایل‌های اصلی درگیر: app/middleware.py و app/config.py.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
تغییر status code ممکن است clientهای قدیمی را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: b4332cb7-e7f2-4056-9312-74128cdcdf99
  عنوان اصلی: Implement rate limiting for authentication middleware
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - 5 failed login attempts from same IP within 5 minutes returns 429 [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "attacker", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - Rate limit headers (X-RateLimit-Remaining) present in response [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "user", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - Successful login resets attempt counter for that IP [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "valid_user", "password": "correct_password"}, "expected_status": 200, "required_fields": [], "json_contains": ]
  - Rate limit configuration is environment-specific [verify_method=static] [verify_plan={"grep_patterns": ["os.environ.get", "RATE_LIMIT", "config"], "files_hint": ["app/middleware.py", "app/config.py"]}]
```

### Step 6: بررسی اولیه خودکار و پیش‌نیازهای اجرایی برای تقویت امنیت احراز هویت
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت هشداردهنده و راهنمای اجرایی است که به مدل اجراکننده می‌گوید قبل از هر تغییری، وضعیت فعلی repo را بررسی کند. شامل دستورالعمل‌های مربوط به تشخیص پیاده‌سازی‌های قبلی، مسئولیت‌پذیری در قبال خطاهای احتمالی پرامپت، و نحوه برخورد با کارهای طولانی است. این بخش خودش یک مرحله اجرایی نیست، بلکه پیش‌نیاز و چارچوب اجرای مراحل بعدی را تعیین می‌کند.
— [merged] این بخش شامل دستورالعمل‌های پیش‌اجرا برای مدل اجراکننده است: بررسی وجود پیاده‌سازی قبلی، شناسایی فایل‌های مرتبط، و جلوگیری از بازسازی موارد موجود. این یک مرحله تحلیلی و آماده‌سازی است، نه اجرایی. خروجی این بخش باید یک گزارش از وضعیت فعلی repo باشد.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همهٔ کامیت‌ها در PR description بنویس.
```

### Step 7: افزودن Rate Limiting و Brute-Force Protection به AuthMiddleware
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی محدودیت نرخ (rate limiting) و محافظت در برابر حملات brute-force در middleware احراز هویت است. محدوده دقیقاً فایل app/middleware.py و کلاس RateLimitingMiddleware (که در واقع AuthMiddleware نام دارد) را پوشش می‌دهد. خارج از این مرحله: پیاده‌سازی منطق احراز هویت اصلی، تغییرات در routeها، یا تست‌های واحد (که در فایل‌های جداگانه انجام می‌شود). نکته حیاتی: middleware باید بر اساس IP آدرس و endpoint درخواست، محدودیت اعمال کند و پس از چند تلاش ناموفق، درخواست را با status 429 Too Many Requests مسدود کند.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Authentication middleware missing rate limiting and brute-force protection

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:1-30` — `RateLimitingMiddleware` — Missing rate limiting implementation
  ```python
  class AuthMiddleware:
      async def dispatch(self, request, call_next):
          # No rate limiting logic
          response = await call_next(request)
          return response
  ```
```

### Step 8: افزودن محدودیت نرخ (Rate Limiting) به endpoint ورود و سرویس احراز هویت
**Status:** `done` (100%)
**Scope:** این بخش شامل پیاده‌سازی محدودیت نرخ برای endpoint ورود (app/routes/auth.py) و منطق ردیابی تلاش‌ها در سرویس احراز هویت (app/services/auth_service.py) است. خارج از scope: پیاده‌سازی Redis (فقط به عنوان وابستگی ذکر شده)، تغییر middleware موجود، یا تغییر سایر endpointها. نکته حیاتی: متن کاربر هشدار می‌دهد که این درخواست ممکن است قبلاً تا حدی پیاده‌سازی شده باشد و بر اساس بررسی خودکار است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + JWT + Redis (recommended)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 1) — Login endpoint that needs protection
- `app/services/auth_service.py` — Authentication logic that should track attempts

## 🌐 نقشهٔ وابستگی‌ها
Requires Redis dependency for production-grade rate limiting. Affects all authentication endpoints.

## 🔍 Context و وضعیت فعلی
The authentication endpoint at app/routes/auth.py and the middleware at app/middleware.py show no evidence of rate limiting or brute-force protection. Without these, the login endpoint is vulnerable to credential stuffing and brute-force attacks. The middleware only handles basic auth checks without any request throttling.
```

### Step 9: پیاده‌سازی محدودیت نرخ (Rate Limiting) برای لاگین‌های ناموفق
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی مکانیزم محدودیت نرخ برای لاگین‌های ناموفق بر اساس IP است. محدوده شامل: رهگیری ۵ تلاش ناموفق در ۵ دقیقه، بازگشت خطای 429، افزودن هدرهای X-RateLimit-Remaining، ریست شمارنده پس از لاگین موفق، و پشتیبانی از تنظیمات محیطی. خارج از محدوده: پیاده‌سازی احراز هویت اصلی، مدیریت توکن، یا محدودیت بر اساس username.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 5 failed login attempts from same IP within 5 minutes returns 429
- [ ] Rate limit headers (X-RateLimit-Remaining) present in response
- [ ] Successful login resets attempt counter for that IP
- [ ] Rate limit configuration is environment-specific
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Implement rate limiting using FastAPI's dependency injection or a middleware. Add a rate limiter that tracks failed login attempts per IP address and per username, with exponential backoff after 5 failed attempts. Use Redis or in-memory cache for tracking.
```

### Step 10: افزودن محدودیت نرخ (Rate Limiting) به لاگین
**Status:** `done` (100%)
**Scope:** این بخش شامل پیاده‌سازی محدودیت نرخ برای endpoint لاگین است. کد قبل و بعد نشان‌دهنده تغییر در فایل routes/auth.py است. شامل: افزودن دکوریتور rate_limit، بررسی IP مسدود شده، ردیابی تلاش‌های ناموفق و بازگرداندن خطای 429. خارج از scope: پیاده‌سازی خود دکوریتور rate_limit، تابع is_ip_blocked، تابع track_failed_attempt و ذخیره‌سازی آن‌ها (این‌ها در فایل‌های دیگر مثل middleware.py یا database.py پیاده‌سازی می‌شوند). نکته حیاتی: تغییرات فقط در endpoint لاگین اعمال می‌شود و نیاز به تغییر در AuthService یا مدل‌ها ندارد.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**Add rate limiting to login**

_قبل:_
```
@router.post('/login')
async def login(credentials, db):
    user = auth_service.authenticate(credentials)
    return {'token': create_token(user)}
```

_بعد:_
```
@router.post('/login')
@rate_limit(max_requests=5, window_seconds=300)
async def login(credentials, request, db):
    if await is_ip_blocked(request.client.host):
        raise HTTPException(429, 'Too many attempts')
    user = auth_service.authenticate(credentials)
    if not user:
        await track_failed_attempt(request.client.host, credentials.username)
        raise HTTPException(401, 'Invalid credentials')
    return {'token': create_token(user)}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 11: اجرای تست‌های نرخ محدودیت و اعتبارسنجی لاگین با curl
**Status:** `done` (100%)
**Scope:** این بخش شامل اجرای دو دستور مشخص است: (1) شش درخواست لاگین با رمز اشتباه به endpoint /api/auth/login و مشاهده کدهای HTTP، (2) اجرای تست pytest متمرکز بر rate_limit در tests/test_auth.py. هیچ مرحله پیاده‌سازی یا تغییر کدی در این بخش وجود ندارد. این بخش صرفاً اجرای دستورات خط فرمان و تست‌های از پیش نوشته شده است.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `for i in {1..6}; do curl -X POST http://localhost:8000/api/auth/login -d '{"username":"test","password":"wrong"}' -w '%{http_code}\n'; done`
- `pytest tests/test_auth.py -k rate_limit`
```

### Step 12: هش کردن رمز عبور در دیتابیس با استفاده از bcrypt/argon2
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی هش کردن رمز عبور در سرویس احراز هویت (app/services/auth_service.py) است. رمز عبور کاربران جدید باید به صورت hash ذخیره شود و رمز عبور موجود در دیتابیس نیز باید از طریق migration به hash تبدیل شوند. لاگین با رمز عبور صحیح باید موفق (HTTP 200) و با رمز اشتباه باید 401 برگرداند. تست واحد برای hashing و verification نیز باید اضافه شود. این مرحله شامل تنظیم Redis یا نگرانی‌های مربوط به rate limiting نیست.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
May require Redis setup; could block legitimate users if thresholds are too aggressive

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 8
  id: 1d571455-f49f-4ad3-a6d1-405586247ab0
  عنوان اصلی: هش کردن رمز عبور در دیتابیس
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text) [verify_method=static] [verify_plan={"grep_patterns": ["User\(password=.*hash", "hash_password", "bcrypt", "pbkdf2", "argon2"], "files_hint": ["app/services/auth_service.py"]}]
  - login با رمز عبور صحیح کار کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "testuser", "password": "correct_password"}, "expected_status": 200, "required_fields": ["token", "user"], "jso]
  - login با رمز عبور اشتباه HTTP 401 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/auth/login", "headers": null, "json_body": {"username": "testuser", "password": "wrong_password"}, "expected_status": 401, "required_fields": [], "json_contains": null]
  - تست واحد برای hashing و verification اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py::test_password_hashing_and_verification", "timeout_seconds": 60}]
  - migration برای hashing رمزهای عبور موجود اجرا شود [verify_method=static] [verify_plan={"grep_patterns": ["def upgrade", "def downgrade", "password_hash", "alembic"], "files_hint": ["migrations/versions/"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
```

### Step 13: بررسی اولیه خودکار و جلوگیری از پیاده‌سازی مجدد قابلیت‌های موجود
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل هیچ وظیفه اجرایی مستقیمی نیست. هدف آن هشدار درباره احتمال وجود پیاده‌سازی قبلی، تشویق به بررسی مستقل repo، و تعیین مسئولیت مدل برای تشخیص و اصلاح خطاهای احتمالی در پرامپت است. این بخش به‌تنهایی هیچ تغییری در کد ایجاد نمی‌کند و صرفاً یک راهنمای رفتاری برای اجراکننده است.
— [merged] این بخش یک یادداشت مهم برای مدل اجراکننده است که قبل از هرگونه تغییر در repo باید مطالعه شود. شامل دستورالعمل‌هایی برای بررسی وجود پیاده‌سازی قبلی، جستجوی فایل‌های مرتبط، و جلوگیری از بازنویسی کد موجود است. همچنین مسئولیت مدل اجراکننده را برای تصمیم‌گیری مستقل در صورت ابهام یا خطا در پرامپت مشخص می‌کند. این بخش شامل هیچ کار اجرایی مستقیم نیست، بلکه یک مرحله پیش‌نیاز برای تمام مراحل بعدی است.
— [merged] این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل هیچ وظیفه اجرایی مستقیمی نیست. هدف آن اطمینان از این است که قبل از هرگونه تغییر، ساختار repo، فایل‌های ذکرشده، و وابستگی‌ها به طور مستقل بررسی شوند تا از پیاده‌سازی مجدد یا ناقص جلوگیری شود. این بخش شامل دستورالعمل‌هایی برای بررسی وجود قابلیت‌های قبلی، اصلاح موارد ناقص، و ثبت کامیت‌های توضیحی (no-op) در صورت عدم نیاز به تغییر است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همهٔ کامیت‌ها در PR description بنویس.
```

### Step 14: ذخیره رمز عبور به صورت plain text در دیتابیس
**Status:** `done` (100%)
**Scope:** این بخش به رفع مشکل ذخیره‌سازی plain text رمز عبور در تابع create_user فایل auth_service.py می‌پردازد. شامل تغییر تابع برای هش کردن رمز عبور قبل از ذخیره است. خارج از scope: تغییرات در سایر توابع، تست‌ها، یا فرانت‌اند.
**Excerpt:**
```
ذخیره رمز عبور به صورت plain text در دیتابیس

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:50-70` — `create_user` — تابع ایجاد کاربر که رمز عبور را بدون hash ذخیره می‌کند
  ```python
  def create_user(data):
      user = User(
          username=data['username'],
          password=data['password']  # ⚠️ plain text
      )
      db.add(user)
      db.commit()
  ```
```

### Step 15: پیاده‌سازی hashing رمز عبور با bcrypt در سرویس احراز هویت
**Status:** `done` (100%)
**Scope:** این مرحله شامل اصلاح فایل app/services/auth_service.py برای استفاده از bcrypt جهت hashing رمز عبور هنگام ثبت‌نام کاربران است. همچنین نیاز به به‌روزرسانی requirements.txt برای افزودن کتابخانه bcrypt و ایجاد migration دیتابیس برای hashing رمزهای عبور موجود دارد. تغییرات فقط روی فرآیند ذخیره‌سازی رمز عبور تأثیر می‌گذارد و منطق احراز هویت (ورود) را شامل نمی‌شود.
**Excerpt:**
```
در فایل app/services/auth_service.py (خطوط 50-70)، رمز عبور کاربران بدون هیچ hashing یا encryption در دیتابیس ذخیره می‌شود. این آسیب‌پذیری در صورت نشت دیتابیس، تمام رمزهای عبور کاربران را در معرض دید قرار می‌دهد. شواهد: کد موجود در خط 55: `user = User(password=data['password'])` بدون هیچ hashing.
```

### Step 16: پیاده‌سازی hashing رمز عبور با bcrypt و verification در لاگین
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی hashing رمز عبور با bcrypt در زمان ثبت‌نام و verification در زمان لاگین است. همچنین شامل به‌روزرسانی تست‌های واحد برای پوشش hashing و verification، و اجرای migration برای hashing رمزهای عبور موجود در دیتابیس می‌شود. خارج از scope این مرحله: تغییرات در frontend، rate limiting، یا middlewareهای دیگر.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] رمز عبور در دیتابیس به صورت hash ذخیره شود (نه plain text)
- [ ] login با رمز عبور صحیح کار کند
- [ ] login با رمز عبور اشتباه HTTP 401 برمی‌گرداند
- [ ] تست واحد برای hashing و verification اضافه شود
- [ ] migration برای hashing رمزهای عبور موجود اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. پیاده‌سازی hashing رمز عبور با استفاده از bcrypt یا Argon2 قبل از ذخیره در دیتابیس. همچنین اضافه کردن verification در زمان login با استفاده از hash مقایسه.
```

### Step 17: پیاده‌سازی هش کردن رمز عبور با bcrypt در مدل کاربر
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر کد در فایل app/models/user.py برای استفاده از bcrypt به جای ذخیره رمز عبور به صورت plain text است. همچنین شامل به‌روزرسانی منطق ایجاد کاربر در app/services/auth_service.py می‌شود. خارج از scope: تغییرات در frontend، middleware، یا تست‌ها.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**hashing رمز عبور با bcrypt**

_قبل:_
```
user = User(password=data['password'])
```

_بعد:_
```
hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
user = User(password=hashed_password.decode())
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 18: پیکربندی JWT_SECRET_KEY از متغیر محیطی با اعتبارسنجی production
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً بر روی فایل app/config.py متمرکز است. شامل تغییر نحوه خواندن JWT_SECRET_KEY از متغیر محیطی (os.getenv) با یک مقدار پیش‌فرض امن فقط برای محیط توسعه، و افزودن منطق اعتبارسنجی (raise/assert) برای اطمینان از تنظیم شدن آن در محیط production می‌شود. هیچ کلید هاردکد شده‌ای نباید باقی بماند. تغییرات در logic login/register یا migration دیتابیس خارج از این مرحله است.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
متوسط؛ نیاز به migration دیتابیس و تغییر logic login/register

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 8
  id: be3a1e0c-ee1f-4646-a00a-29d5b29bad62
  عنوان اصلی: پیکربندی JWT_SECRET_KEY از متغیر محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/config.py

📋 acceptance_criteria کامل:
  - JWT_SECRET_KEY از متغیر محیطی خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY.*os\\.getenv", "JWT_SECRET_KEY.*environ"], "files_hint": ["app/config.py"]}]
  - مقدار پیش‌فرض فقط برای محیط توسعه باشد [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY.*=.*os\\.getenv.*default.*dev", "JWT_SECRET_KEY.*=.*os\\.environ\\.get.*dev"], "files_hint": ["app/config.py"]}]
  - در production حتماً مقدار متغیر محیطی تنظیم شود [verify_method=static] [verify_plan={"grep_patterns": ["if.*production.*raise", "if.*ENV.*production.*assert", "if.*PRODUCTION.*raise"], "files_hint": ["app/config.py"]}]
  - هیچ کلید هاردکد شده‌ای در کد باقی نماند [verify_method=static] [verify_plan={"grep_patterns": ["JWT_SECRET_KEY\\s*=\\s*['\"][^'"]+['\"]"], "files_hint": ["app/config.py"]}]
```

### Step 19: بررسی خودکار و تکمیل پیاده‌سازی احراز هویت بر اساس پرامپت موجود
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت هشداردهنده است که به مدل اجراکننده می‌گوید قبل از هر تغییری، وضعیت فعلی repo را بررسی کند. شامل: بررسی وجود فایل‌ها، کلاس‌ها و توابع ذکرشده، تشخیص پیاده‌سازی‌های قبلی، و جلوگیری از بازسازی موارد موجود. خارج از scope: اجرای مستقیم تغییرات کد — این بخش صرفاً یک دستورالعمل پیش‌اجرا است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همهٔ کامیت‌ها در PR description بنویس.
```

### Step 20: جایگزینی JWT_SECRET_KEY هاردکد شده با متغیر محیطی
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف مقدار ثابت JWT_SECRET_KEY از فایل app/config.py و جایگزینی آن با خواندن از متغیر محیطی (environment variable) است. همچنین شامل افزودن یک مقدار پیش‌فرض امن (raise error یا fallback) در صورت عدم وجود متغیر محیطی می‌شود. این مرحله شامل تغییر در منطق احراز هویت، تست‌ها یا سایر فایل‌ها نمی‌شود.
**Excerpt:**
```
JWT_SECRET_KEY هاردکد شده در app/config.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:5-10` — `JWT_SECRET_KEY` — خط حاوی کلید JWT هاردکد شده
  ```python
  JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
  ```
```

### Step 21: انتقال JWT_SECRET_KEY از هاردکد در app/config.py به متغیر محیطی
**Status:** `done` (100%)
**Scope:** این بخش صرفاً بر روی فایل app/config.py متمرکز است. هدف، حذف مقدار هاردکد شده JWT_SECRET_KEY از کد و جایگزینی آن با خواندن از متغیر محیطی (os.getenv) است. این تغییر بر کل فرآیند احراز هویت تأثیر می‌گذارد زیرا auth_service.py از این کلید برای امضای توکن‌ها استفاده می‌کند. نکته حیاتی: این مرحله فقط مربوط به config.py است و شامل تغییر در auth_service.py یا سایر فایل‌ها نمی‌شود.
**Excerpt:**
```
در فایل app/config.py، مقدار JWT_SECRET_KEY به صورت مستقیم و هاردکد شده در کد قرار دارد. این یک نقص امنیتی جدی است زیرا هر کسی که به کد منبع دسترسی داشته باشد می‌تواند توکن‌های JWT معتبر تولید کند و به سیستم نفوذ کند. همچنین این کلید در تمام محیط‌ها (توسعه، staging، production) یکسان است.
```

### Step 22: انتقال JWT_SECRET_KEY به متغیر محیطی با مقدار پیش‌فرض امن برای توسعه
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به حذف کلید JWT هاردکد شده از کد و خواندن آن از متغیر محیطی می‌پردازد. شامل: تغییر در app/config.py برای خواندن JWT_SECRET_KEY از os.getenv، تنظیم مقدار پیش‌فرض فقط برای محیط توسعه (مثلاً 'dev-secret-key-change-in-production')، و اطمینان از عدم وجود کلید هاردکد شده در app/services/auth_service.py و app/middleware.py. خارج از scope: تغییر منطق احراز هویت، تغییر ساختار توکن، یا اضافه کردن متغیرهای محیطی دیگر.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] JWT_SECRET_KEY از متغیر محیطی خوانده شود
- [ ] مقدار پیش‌فرض فقط برای محیط توسعه باشد
- [ ] در production حتماً مقدار متغیر محیطی تنظیم شود
- [ ] هیچ کلید هاردکد شده‌ای در کد باقی نماند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. JWT_SECRET_KEY را از کد حذف کرده و به متغیر محیطی (environment variable) منتقل کنید. از یک مقدار پیش‌فرض امن برای محیط توسعه استفاده کنید و در production حتماً مقدار منحصربه‌فرد و قوی تنظیم شود.
```

### Step 23: رفع هاردکد کردن JWT_SECRET_KEY در app/config.py
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً شامل تغییر خط JWT_SECRET_KEY در فایل app/config.py از مقدار هاردکد شده به استفاده از os.getenv با fallback است. هیچ تغییر دیگری در سایر فایل‌ها، تست‌ها یا منطق احراز هویت انجام نمی‌شود. این یک تغییر امنیتی ساده و متمرکز است.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**رفع هاردکد کردن JWT_SECRET_KEY**

_قبل:_
```
JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
```

_بعد:_
```
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 24: افزودن تست واحد برای auth_service.py
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد فایل tests/test_auth_service.py و پیاده‌سازی تست‌های واحد برای سرویس AuthService است. تست‌ها باید register، login، verify_token و refresh_token را با سناریوهای معتبر و نامعتبر پوشش دهند. هیچ تغییری در کد تولیدی یا سایر فایل‌ها انجام نمی‌شود. تمام توکن‌های JWT قبلی پس از تغییر نامعتبر می‌شوند.
**Excerpt:**
```
تسک 5 از 8
  id: d185580d-dca4-4554-a7e7-21b2b9b7d3e2
  عنوان اصلی: افزودن تست واحد برای auth_service.py
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - فایل tests/test_auth_service.py ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["tests/test_auth_service.py"]}]
  - تست register با داده‌های معتبر و نامعتبر پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_register", "timeout_seconds": 60}]
  - تست login با رمز عبور صحیح و غلط پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_login", "timeout_seconds": 60}]
  - تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_verify_token", "timeout_seconds": 60}]
  - تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py::test_refresh_token", "timeout_seconds": 60}]
  - همه تست‌ها با موفقیت پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_service.py", "timeout_seconds": 120}]
```

### Step 25: افزودن تست‌های واحد برای کلاس AuthService در فایل app/services/auth_service.py
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن تست‌های واحد برای متدهای register, login, verify_token در کلاس AuthService است. فایل تست باید tests/test_auth_service.py باشد. تست‌ها باید موارد موفقیت، خطاهای اعتبارسنجی، و موارد لبه را پوشش دهند. این مرحله شامل تغییر در منطق سرویس یا اضافه کردن route جدید نیست.
**Excerpt:**
```
فایل app/services/auth_service.py بدون تست واحد است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:1-200` — `کل فایل` — کل سرویس auth_service نیاز به پوشش تست دارد
  ```python
  class AuthService:
      def register(self, user_data):
          ...
      def login(self, email, password):
          ...
      def verify_token(self, token):
          ...
  ```
```

### Step 26: ایجاد تست‌های جامع برای AuthService به دلیل عدم وجود تست فعلی
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد فایل تست جدید tests/test_auth_service.py برای پوشش کامل AuthService است. شامل تست‌های واحد برای توابع لاگین، ثبت‌نام، تولید و اعتبارسنجی JWT و احراز هویت کاربران می‌شود. خارج از scope: تست‌های یکپارچه‌سازی با routeها، تست‌های frontend، یا تغییر در خود AuthService. نکته حیاتی: این تست‌ها باید سناریوهای موفقیت، شکست و لبه را پوشش دهند.
**Excerpt:**
```
سرویس احراز هویت (auth_service.py) یکی از بحرانی‌ترین بخش‌های برنامه است که وظیفه مدیریت لاگین، ثبت‌نام، توکن JWT و احراز هویت کاربران را بر عهده دارد. با بررسی فایل‌های تست موجود در tests/، هیچ فایل تستی برای این سرویس یافت نشد. این موضوع یک ریسک امنیتی جدی محسوب می‌شود زیرا هرگونه باگ در این سرویس می‌تواند منجر به دسترسی غیرمجاز یا نشت اطلاعات شود.
```

### Step 27: ایجاد و اجرای تست‌های واحد برای سرویس احراز هویت
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد فایل tests/test_auth_service.py و نوشتن تست‌های واحد برای توابع register, login, verify_token, refresh_token, logout و reset_password است. تست‌ها باید موارد معتبر و نامعتبر را پوشش دهند. خارج از scope: پیاده‌سازی خود سرویس، تست‌های یکپارچه‌سازی، تست‌های نرخ محدودیت، و تست‌های فرانت‌اند. نکته حیاتی: تست‌ها باید رفتار قابل مشاهده را تأیید کنند نه نام فایل/کلاس.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل tests/test_auth_service.py ایجاد شود
- [ ] تست register با داده‌های معتبر و نامعتبر پوشش داده شود
- [ ] تست login با رمز عبور صحیح و غلط پوشش داده شود
- [ ] تست verify_token با توکن معتبر، منقضی و دستکاری‌شده پوشش داده شود
- [ ] تست refresh_token با توکن معتبر و نامعتبر پوشش داده شود
- [ ] همه تست‌ها با موفقیت پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک فایل تست جدید به نام tests/test_auth_service.py ایجاد کنید و تست‌های واحد برای تمام توابع اصلی auth_service شامل register, login, verify_token, refresh_token, logout و reset_password بنویسید.
```

### Step 28: افزودن تست واحد برای تابع login در AuthService
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن تست واحد برای تابع login در فایل tests/test_auth_service.py است. تست باید با استفاده از فیکچرهای client و db_session، یک کاربر با ایمیل و پسورد ایجاد کرده و لاگین موفق را شبیه‌سازی کند. خروجی مورد انتظار شامل status_code 200 و وجود access_token در پاسخ است. این بخش فقط به تست login مربوط می‌شود و شامل تست‌های دیگر یا تغییر در منطق اصلی سرویس نیست.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**افزودن تست برای تابع login**

_قبل:_
```
# هیچ تستی وجود ندارد
```

_بعد:_
```
def test_login_success(client, db_session):
    user = UserFactory(email='test@test.com')
    response = client.post('/auth/login', json={'email': 'test@test.com', 'password': 'password'})
    assert response.status_code == 200
    assert 'access_token' in response.json()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 29: پیاده‌سازی rate limiting روی endpointهای احراز هویت
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی محدودیت نرخ (rate limiting) برای endpointهای /login و /register در فایل app/routes/auth.py است. محدودیت‌ها به صورت مجزا برای هر IP اعمال می‌شوند: حداکثر 5 درخواست در دقیقه برای /login و حداکثر 3 درخواست در ساعت برای /register. همچنین باید تست واحد مربوطه در tests/test_rate_limiting.py اضافه شود. این مرحله شامل تغییر در سرویس‌های دیگر یا فرانت‌اند نمی‌شود.
— [merged] این بخش شامل افزودن محدودیت نرخ (rate limiting) به endpointهای احراز هویت در فایل app/routes/auth.py است. تمرکز اصلی روی endpoint لاگین (POST /login) است. سایر endpointهای احراز هویت (مانند ثبت‌نام، فراموشی رمز عبور) نیز باید تحت پوشش قرار گیرند. پیاده‌سازی باید در سطح middleware یا دکوراتور انجام شود و از یک مکانیزم ذخیره‌سازی سریع (مانند Redis یا حافظه داخلی) استفاده کند. این بخش شامل تست‌های rate limiting در tests/test_rate_limiting.py نیز می‌شود.
**Excerpt:**
```
تسک 6 از 8
  id: 33f16648-edfe-4ab5-b75d-c070748b6cea
  عنوان اصلی: پیاده‌سازی rate limiting روی endpointهای احراز هویت
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/auth.py

📋 acceptance_criteria کامل:
  - ارسال بیش از 5 درخواست در دقیقه به /login HTTP 429 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/login", "headers": null, "json_body": {"username": "test", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - ارسال بیش از 3 درخواست در ساعت به /register HTTP 429 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/register", "headers": null, "json_body": {"username": "test", "password": "test123"}, "expected_status": 429, "required_fields": [], "json_contains": null}]
  - rate limit برای هر IP جداگانه محاسبه می‌شود [verify_method=api_response] [verify_plan={"method": "POST", "path": "/login", "headers": {"X-Forwarded-For": "1.2.3.4"}, "json_body": {"username": "test", "password": "wrong"}, "expected_status": 429, "required_fields": [], "json_contains": }]
  - تست واحد برای rate limiting اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_rate_limiting.py::test_rate_limit", "timeout_seconds": 60}]
```

### Step 30: پیاده‌سازی Rate Limiting برای endpointهای /login و /register با استفاده از slowapi
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن محدودیت نرخ درخواست (rate limiting) به endpointهای احراز هویت در app/routes/auth.py با استفاده از کتابخانه slowapi است. شامل نصب slowapi، پیکربندی آن در app/main.py، و اعمال محدودیت روی endpointهای /login و /register می‌شود. خارج از scope: پیاده‌سازی rate limiting برای سایر endpointها، تغییر منطق احراز هویت، یا افزودن قابلیت‌های امنیتی دیگر.
— [merged] این مرحله شامل پیاده‌سازی محدودیت نرخ (rate limiting) برای endpointهای حساس احراز هویت است. محدودیت‌ها: 5 درخواست در دقیقه برای /login و 3 درخواست در ساعت برای /register. محدودیت بر اساس IP جداگانه محاسبه می‌شود. تست واحد و یکپارچه‌سازی برای این قابلیت اضافه می‌شود. خارج از scope: پیاده‌سازی احراز هویت، مدیریت session، یا سایر endpointها.
**Excerpt:**
```
در فایل app/routes/auth.py، endpointهای /login و /register (خطوط 12-45) هیچ محدودیت نرخ درخواست (rate limiting) ندارند. این آسیب‌پذیری امکان brute force attack برای حدس زدن رمز عبور یا DoS attack را فراهم می‌کند. شواهد: کد موجود در خطوط 12-45 فقط validation ساده دارد و هیچ middleware rate limiting اعمال نشده است.

FastAPI + slowapi + Python 3.11

فایل‌های مرتبط:
- `app/main.py` (سطر 25) — محل نصب middlewareهای عمومی
- `app/middleware.py` (سطر 1) — محل مناسب برای پیاده‌سازی rate limiter
- `requirements.txt` (سطر 15) — نیاز به اضافه کردن slowapi به وابستگی‌ها
```

### Step 31: اضافه کردن rate limiter به endpoint لاگین
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن محدودیت نرخ (rate limiting) به endpoint لاگین با نرخ 5 درخواست در دقیقه است. شامل تغییر دکوراتور و پارامترهای تابع login در فایل app/routes/auth.py می‌شود. خارج از scope: پیاده‌سازی خود rate limiter، تست‌های مربوطه، یا تغییرات در سایر فایل‌ها.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن rate limiter**

_قبل:_
```
@router.post('/login')
async def login(request: Request):
    ...
```

_بعد:_
```
@router.post('/login')
@limiter.limit('5/minute')
async def login(request: Request, response: Response):
    ...
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 32: یکپارچه‌سازی احراز هویت و پاکسازی middleware
**Status:** `done` (100%)
**Scope:** این بخش شامل یکپارچه‌سازی مکانیزم احراز هویت JWT در middleware و حذف یا هماهنگ‌سازی middleware اضافی است. هدف اصلی اطمینان از استفاده یکسان همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت و حذف duplicate validation در زنجیره درخواست است. فایل اصلی دخیل app/middleware.py است و نیاز به نصب کتابخانه و اضافه کردن decorator دارد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
کم؛ فقط نیاز به نصب کتابخانه و اضافه کردن decorator

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: eabd81cd-47f4-4f87-85c3-b8914360a3f6
  عنوان اصلی: یکپارچه‌سازی احراز هویت و پاکسازی middleware
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - همه endpointهای محافظت‌شده از یک مکانیزم احراز هویت استفاده می‌کنند [verify_method=static] [verify_plan={"grep_patterns": ["jwt", "JWT", "authenticate", "verify_token"], "files_hint": ["app/middleware.py", "app/routes/auth.py"]}]
  - middleware احراز هویت یا حذف شده یا با auth route هماهنگ است [verify_method=static] [verify_plan={"grep_patterns": ["class AuthMiddleware", "def authenticate", "middleware"], "files_hint": ["app/middleware.py"]}]
  - هیچ duplicate validation در زنجیره درخواست وجود ندارد [verify_method=static] [verify_plan={"grep_patterns": ["authenticate", "verify", "validate", "jwt"], "files_hint": ["app/middleware.py", "app/routes/auth.py"]}]
```

### Step 33: رفع Conflict بین middleware احراز هویت قدیمی و جدید در app/middleware.py
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به بررسی و رفع conflict در AuthMiddleware واقع در app/middleware.py می‌پردازد. شامل بازنویسی متد __call__ برای هماهنگی با سیستم جدید احراز هویت است. خارج از scope: تغییر در سرویس‌های احراز هویت (AuthService)، مسیرها (routes)، یا تست‌ها. نکته حیاتی: تابع validate_token باید با سرویس جدید سازگار شود و token از هدر Authorization استخراج می‌شود.
**Excerpt:**
```
Conflict بین سیستم احراز هویت قدیمی و جدید در middleware

📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:1-50` — `AuthMiddleware` — این middleware ممکن است با سیستم جدید conflict داشته باشد
  ```python
  class AuthMiddleware:
      async def __call__(self, request, call_next):
          token = request.headers.get('Authorization')
          if token:
              user = validate_token(token)
              request.state.user = user
          response = await call_next(request)
          return response
  ```
```

### Step 34: رفع دوگانگی سیستم احراز هویت JWT بین middleware و route auth
**Status:** `done` (100%)
**Scope:** این مرحله شامل تحلیل و رفع conflict بین دو سیستم موازی JWT در middleware (احتمالاً قدیمی) و auth route (جدیدتر) است. هدف یکپارچه‌سازی منطق احراز هویت در یک نقطه واحد است. خارج از scope این مرحله: تغییر منطق تولید توکن، تغییر ساختار دیتابیس، یا اضافه کردن endpoint جدید.
**Excerpt:**
```
فایل app/middleware.py شامل middleware احراز هویت است که از JWT استفاده می‌کند، اما app/routes/auth.py نیز یک endpoint لاگین با JWT دارد. به نظر می‌رسد دو سیستم موازی وجود دارد: یکی در middleware (که احتمالاً قدیمی است) و دیگری در auth route (که جدیدتر است). این می‌تواند باعث شود که برخی درخواست‌ها دو بار احراز هویت شوند یا برخی مسیرها از middleware عبور نکنند.
```

### Step 35: بررسی و هماه‌سازی middleware احراز هویت با مسیرهای auth و حذف در صورت منسوخ شدن
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی middleware احراز هویت در app/middleware.py و هماهنگ‌سازی آن با مسیرهای auth در app/routes/auth.py است. اگر middleware منسوخ شده باشد، منطق آن به dependency injection در FastAPI منتقل می‌شود. خارج از این مرحله: تغییر در AuthService، تست‌ها، یا سایر endpointها.
**Excerpt:**
```
## 🪜 مراحل اجرایی پیشنهادی
1. بررسی کنید که آیا middleware احراز هویت واقعاً استفاده می‌شود یا منسوخ شده است. اگر منسوخ شده، آن را حذف کنید و منطق آن را به dependency injection در FastAPI منتقل کنید. اگر نه، آن را با auth route هماهنگ کنید.
```

### Step 36: حذف middleware احراز هویت و جایگزینی با dependency injection در endpointها
**Status:** `done` (100%)
**Scope:** این بخش شامل حذف AuthMiddleware از app/main.py و افزودن Depends(get_current_user) به endpointهای نیازمند احراز هویت در app/routes/auth.py است. همچنین نیاز به حذف یا غیرفعال کردن middleware در app/middleware.py دارد. خارج از scope: تغییر در منطق AuthService، تست‌ها، یا frontend.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**حذف middleware و استفاده از dependency**

_قبل:_
```
app.add_middleware(AuthMiddleware)
```

_بعد:_
```
app.include_router(auth_router)
# استفاده از Depends(get_current_user) در endpointها
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 37: ادغام منطق اعتبارسنجی توکن در auth_service.py و حذف duplicate logic
**Status:** `done` (100%)
**Scope:** این مرحله شامل بازنویسی middleware برای استفاده از validate_token در app/services/auth_service.py و حذف هرگونه duplicate logic اعتبارسنجی توکن در پروژه است. فایل‌های دخیل: app/services/auth_service.py, app/middleware.py. acceptance_criteria: (1) middleware از validate_token استفاده کند، (2) هیچ duplicate logic برای validate_token در پروژه نباشد، (3) تست‌ها پاس شوند. نکته حیاتی: حذف middleware ممکن است endpointهای وابسته را بشکند، بنابراین باید با احتیاط انجام شود.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - middleware از validate_token در auth_service.py استفاده می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.auth_service import validate_token", "validate_token"], "files_hint": ["app/middleware.py"]}]
  - هیچ duplicate logic برای اعتبارسنجی توکن در پروژه وجود ندارد [verify_method=static] [verify_plan={"grep_patterns": ["def validate_token"], "files_hint": ["app/services/auth_service.py"]}]
  - تست‌ها پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 38: رفع Duplicated Logic در Validation توکن بین Auth Service و Middleware
**Status:** `done` (100%)
**Scope:** این مرحله شامل یکپارچه‌سازی منطق اعتبارسنجی توکن JWT است. تابع `validate_token` در `app/services/auth_service.py` باید به عنوان منبع واحد (single source of truth) برای تمام اعتبارسنجی‌های توکن در سراسر پروژه استفاده شود. هرگونه منطق تکراری در middleware یا سایر بخش‌ها باید حذف شده و به این تابع ارجاع داده شود. خارج از scope: تغییر در ساختار توکن، تغییر در الگوریتم رمزنگاری، یا تغییر در مدل User.
**Excerpt:**
```
Duplicated logic در validation توکن بین auth_service و middleware

📍 موقعیت دقیق در پروژه
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
```

### Step 39: رفع duplication در اعتبارسنجی JWT با یکپارچه‌سازی validate_token در auth_service و حذف منطق مشابه از middleware
**Status:** `done` (100%)
**Scope:** این مرحله شامل یکپارچه‌سازی تابع validate_token در app/services/auth_service.py به عنوان منبع واحد اعتبارسنجی JWT و حذف منطق تکراری از app/middleware.py است. middleware باید به جای منطق خود، validate_token را فراخوانی کند. تغییرات باید در app/routes/auth.py نیز اعمال شود تا از validate_token یکسان استفاده کند. خارج از scope: تغییر در frontend، مدل‌ها، دیتابیس، rate limiting، یا config.
**Excerpt:**
```
تابع validate_token در app/services/auth_service.py و منطق مشابه در app/middleware.py هر دو توکن JWT را اعتبارسنجی می‌کنند. این duplication باعث می‌شود که تغییر در یک بخش (مثلاً اضافه کردن بررسی expiry) در بخش دیگر اعمال نشود. همچنین، احتمال inconsistency در خطاها و پیام‌ها وجود دارد.
```

### Step 40: مرکزیت‌سازی اعتبارسنجی توکن در auth_service.py و استفاده در middleware
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد یک تابع واحد برای اعتبارسنجی توکن در auth_service.py و استفاده از آن در middleware است. هدف حذف منطق تکراری اعتبارسنجی توکن در سراسر پروژه است. تست‌ها، linter و type-check باید پاس شوند. این بخش شامل پیاده‌سازی middleware جدید یا تغییر مسیرها نیست.
**Excerpt:**
```
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
```

### Step 41: رفع duplication در middleware با استفاده از validate_token از AuthService
**Status:** `done` (100%)
**Scope:** این بخش شامل تغییر کد در فایل middleware است تا از تابع validate_token موجود در AuthService استفاده کند. خارج از scope: تغییرات در AuthService، تست‌ها، یا سایر فایل‌ها. نکته حیاتی: middleware باید از validate_token استفاده کند نه از یک پیاده‌سازی تکراری.
**Excerpt:**
```
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
```

### Step 42: مستندسازی ریسک‌ها و موارد احتیاط برای تغییرات backward-compatible در احراز هویت
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به مستندسازی و تحلیل ریسک‌های مرتبط با تغییرات backward-compatible در سرویس احراز هویت می‌پردازد. هیچ تغییر کدی در این مرحله انجام نمی‌شود. شامل شناسایی ریسک‌های پایین، تأیید عدم وجود وابستگی به تسک‌های دیگر، و دسته‌بندی تسک به عنوان refactor با اولویت medium است. خارج از scope: پیاده‌سازی، تست، یا تغییر در فایل‌های کد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
ریسک پایین، تغییرات backward-compatible هستند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)
```
