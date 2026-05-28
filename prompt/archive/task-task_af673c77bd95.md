---
task_id: task_af673c77bd95
title: افزایش امنیت ورودی و پوشش تست Endpointها
type: other
priority: medium
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:50:29.775150+00:00'
updated_at: '2026-05-26T16:30:26.853061+00:00'
archived: true
archived_at: '2026-05-26T16:30:23.218866+00:00'
tags:
- consolidated
- post_verify_merge
---

# افزایش امنیت ورودی و پوشش تست Endpointها

## Raw Idea

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): تسک 'Sanitize user profile bio input' مستقیماً به امنیت و اعتبارسنجی ورودی کاربر مربوط است. 'پیاده‌سازی تست‌های جامع برای Endpointها' که به طور خاص به `test_auth.py` اشاره دارد، نشان‌دهنده تمرکز بر تست‌های امنیتی و اعتبارسنجی در Endpointهای حساس است که با تسک اول هم‌راستا است.
🎯 theme: تقویت امنیت و اعتبارسنجی ورودی‌ها
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: cba0111e-1a34-4974-ae6b-a5a59742e9a7
  عنوان اصلی: Sanitize user profile bio input
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/users.py

📋 acceptance_criteria کامل:
  - Script tags in bio are stripped/escaped [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<script>alert('xss')</script>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "js]
  - HTML entities are properly encoded [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<b>bold</b> & <i>italic</i>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "json]
  - Existing safe HTML (if any) is preserved [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<b>safe</b>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "json_contains": null]

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
Missing input sanitization in user profile update

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/users.py:30-45` — `update_profile` — Unsanitized user input stored in database
  ```python
  @router.put('/profile')
  async def update_profile(profile: UserProfileUpdate, db: Session = Depends(get_db)):
      user = db.query(User).filter(User.id == current_user.id).first()
      user.bio = profile.bio  # ⚠️ no sanitization
      user.display_name = profile.display_name  # ⚠️ no sanitization
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
FastAPI + SQLAlchemy + Jinja2 templates

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/schemas/user_schema.py` (سطر 15) — Schema for profile update
- `app/models/user.py` (سطر 20) — User model storing bio and display_name

## 🌐 نقشهٔ وابستگی‌ها
Affects all user profile views including team pages and public profiles.

## 🔍 Context و وضعیت فعلی
The user profile update endpoint does not sanitize HTML/JavaScript input in bio and display_name fields. This can lead to stored XSS attacks when other users view the profile.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Script tags in bio are stripped/escaped
- [ ] HTML entities are properly encoded
- [ ] Existing safe HTML (if any) is preserved
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add HTML sanitization using a library like bleach or markdown parsing. Also add Content-Security-Policy headers to mitigate XSS impact.

## 💡 نمونه‌های قبل/بعد
**Add HTML sanitization**

_قبل:_
```
user.bio = profile.bio
```

_بعد:_
```
user.bio = bleach.clean(profile.bio, tags=[], strip=True)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X PUT http://localhost:8000/api/users/profile -H 'Content-Type: application/json' -d '{"bio": "<script>alert(1)</script>"}'`
- `pytest tests/test_users.py -k test_xss_prevention`

## ⚠️ ریسک‌ها و موارد احتیاط
May break existing profiles with legitimate HTML; consider migration strategy

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 744e8779-dbbd-427f-8089-2389eb7c10e8
  عنوان اصلی: پیاده‌سازی تست‌های جامع برای Endpointها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: tests/test_auth.py

📋 acceptance_criteria کامل:
  - هر endpoint حداقل ۳ تست دارد (موفقیت، خطای اعتبارسنجی، خطای سرور) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 60}]
  - پوشش خطاهای ۴۰۱، ۴۰۳، ۴۰۴، ۴۲۲ برای endpointهای مختلف [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 60}]
  - تست‌های integration برای جریان‌های پیچیده (مثلاً ثبت‌نام + لاگین + ایجاد task) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 120}]

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
تست‌های واحد موجود ناقص هستند و سناریوهای خطا را پوشش نمی‌دهند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `tests/test_auth.py:1-50` — `test_login_success` — نیاز به تست‌های خطا: رمز اشتباه، کاربر غیرفعال، توکن منقضی
  ```python
  async def test_login_success(client):
      response = await client.post("/auth/login", json={"username": "test", "password": "test"})
      assert response.status_code == 200
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
pytest + pytest-asyncio + httpx (برای AsyncClient)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `tests/test_tasks.py` (سطر 1) — همین مشکل را دارد
- `tests/test_projects.py` (سطر 1) — همین مشکل را دارد

## 🌐 نقشهٔ وابستگی‌ها
تست‌ها مستقیماً به routeها و سرویس‌ها وابسته هستند. بهبود تست‌ها نیازمند درک کامل business logic است.

## 🔍 Context و وضعیت فعلی
فایل‌های تست در tests/ فقط سناریوهای موفقیت (happy path) را تست می‌کنند. برای مثال، tests/test_auth.py فقط لاگین موفق را تست می‌کند و سناریوهای خطا مانند رمز عبور اشتباه، توکن منقضی، یا کاربر غیرفعال را پوشش نمی‌دهد. این باعث می‌شود باگ‌های احتمالی در production شناسایی نشوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هر endpoint حداقل ۳ تست دارد (موفقیت، خطای اعتبارسنجی، خطای سرور)
- [ ] پوشش خطاهای ۴۰۱، ۴۰۳، ۴۰۴، ۴۲۲ برای endpointهای مختلف
- [ ] تست‌های integration برای جریان‌های پیچیده (مثلاً ثبت‌نام + لاگین + ایجاد task)
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تکمیل تست‌های واحد با اضافه کردن سناریوهای خطا، موارد مرزی (edge cases)، و تست‌های integration. برای هر endpoint، حداقل ۳ سناریو: موفقیت، خطای اعتبارسنجی، و خطای سرور.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن تست خطای رمز عبور اشتباه**

_قبل:_
```
async def test_login_success(client):
    response = await client.post("/auth/login", json={"username": "test", "password": "test"})
    assert response.status_code == 200
```

_بعد:_
```
async def test_login_wrong_password(client):
    response = await client.post("/auth/login", json={"username": "test", "password": "wrong"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.text
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v --cov=app --cov-report=term-missing`
- `pytest tests/ -v -k error`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به mocking سرویس‌های خارجی (AI, email) برای تست‌های integration

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

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
- در commit message: `merged-from: cba0111e-1a34-4974-ae6b-a5a59742e9a7, 744e8779-dbbd-427f-8089-2389eb7c10e8`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): تسک 'Sanitize user profile bio input' مستقیماً به امنیت و اعتبارسنجی ورودی کاربر مربوط است. 'پیاده‌سازی تست‌های جامع برای Endpointها' که به طور خاص به `test_auth.py` اشاره دارد، نشان‌دهنده تمرکز بر تست‌های امنیتی و اعتبارسنجی در Endpointهای حساس است که با تسک اول هم‌راستا است.
🎯 theme: تقویت امنیت و اعتبارسنجی ورودی‌ها
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: cba0111e-1a34-4974-ae6b-a5a59742e9a7
  عنوان اصلی: Sanitize user profile bio input
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/users.py

📋 acceptance_criteria کامل:
  - Script tags in bio are stripped/escaped [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<script>alert('xss')</script>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "js]
  - HTML entities are properly encoded [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<b>bold</b> & <i>italic</i>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "json]
  - Existing safe HTML (if any) is preserved [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<b>safe</b>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "json_contains": null]

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
Missing input sanitization in user profile update

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/users.py:30-45` — `update_profile` — Unsanitized user input stored in database
  ```python
  @router.put('/profile')
  async def update_profile(profile: UserProfileUpdate, db: Session = Depends(get_db)):
      user = db.query(User).filter(User.id == current_user.id).first()
      user.bio = profile.bio  # ⚠️ no sanitization
      user.display_name = profile.display_name  # ⚠️ no sanitization
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
FastAPI + SQLAlchemy + Jinja2 templates

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/schemas/user_schema.py` (سطر 15) — Schema for profile update
- `app/models/user.py` (سطر 20) — User model storing bio and display_name

## 🌐 نقشهٔ وابستگی‌ها
Affects all user profile views including team pages and public profiles.

## 🔍 Context و وضعیت فعلی
The user profile update endpoint does not sanitize HTML/JavaScript input in bio and display_name fields. This can lead to stored XSS attacks when other users view the profile.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Script tags in bio are stripped/escaped
- [ ] HTML entities are properly encoded
- [ ] Existing safe HTML (if any) is preserved
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add HTML sanitization using a library like bleach or markdown parsing. Also add Content-Security-Policy headers to mitigate XSS impact.

## 💡 نمونه‌های قبل/بعد
**Add HTML sanitization**

_قبل:_
```
user.bio = profile.bio
```

_بعد:_
```
user.bio = bleach.clean(profile.bio, tags=[], strip=True)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X PUT http://localhost:8000/api/users/profile -H 'Content-Type: application/json' -d '{"bio": "<script>alert(1)</script>"}'`
- `pytest tests/test_users.py -k test_xss_prevention`

## ⚠️ ریسک‌ها و موارد احتیاط
May break existing profiles with legitimate HTML; consider migration strategy

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 744e8779-dbbd-427f-8089-2389eb7c10e8
  عنوان اصلی: پیاده‌سازی تست‌های جامع برای Endpointها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: tests/test_auth.py

📋 acceptance_criteria کامل:
  - هر endpoint حداقل ۳ تست دارد (موفقیت، خطای اعتبارسنجی، خطای سرور) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 60}]
  - پوشش خطاهای ۴۰۱، ۴۰۳، ۴۰۴، ۴۲۲ برای endpointهای مختلف [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 60}]
  - تست‌های integration برای جریان‌های پیچیده (مثلاً ثبت‌نام + لاگین + ایجاد task) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 120}]

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
تست‌های واحد موجود ناقص هستند و سناریوهای خطا را پوشش نمی‌دهند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `tests/test_auth.py:1-50` — `test_login_success` — نیاز به تست‌های خطا: رمز اشتباه، کاربر غیرفعال، توکن منقضی
  ```python
  async def test_login_success(client):
      response = await client.post("/auth/login", json={"username": "test", "password": "test"})
      assert response.status_code == 200
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
pytest + pytest-asyncio + httpx (برای AsyncClient)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `tests/test_tasks.py` (سطر 1) — همین مشکل را دارد
- `tests/test_projects.py` (سطر 1) — همین مشکل را دارد

## 🌐 نقشهٔ وابستگی‌ها
تست‌ها مستقیماً به routeها و سرویس‌ها وابسته هستند. بهبود تست‌ها نیازمند درک کامل business logic است.

## 🔍 Context و وضعیت فعلی
فایل‌های تست در tests/ فقط سناریوهای موفقیت (happy path) را تست می‌کنند. برای مثال، tests/test_auth.py فقط لاگین موفق را تست می‌کند و سناریوهای خطا مانند رمز عبور اشتباه، توکن منقضی، یا کاربر غیرفعال را پوشش نمی‌دهد. این باعث می‌شود باگ‌های احتمالی در production شناسایی نشوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هر endpoint حداقل ۳ تست دارد (موفقیت، خطای اعتبارسنجی، خطای سرور)
- [ ] پوشش خطاهای ۴۰۱، ۴۰۳، ۴۰۴، ۴۲۲ برای endpointهای مختلف
- [ ] تست‌های integration برای جریان‌های پیچیده (مثلاً ثبت‌نام + لاگین + ایجاد task)
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تکمیل تست‌های واحد با اضافه کردن سناریوهای خطا، موارد مرزی (edge cases)، و تست‌های integration. برای هر endpoint، حداقل ۳ سناریو: موفقیت، خطای اعتبارسنجی، و خطای سرور.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن تست خطای رمز عبور اشتباه**

_قبل:_
```
async def test_login_success(client):
    response = await client.post("/auth/login", json={"username": "test", "password": "test"})
    assert response.status_code == 200
```

_بعد:_
```
async def test_login_wrong_password(client):
    response = await client.post("/auth/login", json={"username": "test", "password": "wrong"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.text
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v --cov=app --cov-report=term-missing`
- `pytest tests/ -v -k error`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به mocking سرویس‌های خارجی (AI, email) برای تست‌های integration

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

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
- در commit message: `merged-from: cba0111e-1a34-4974-ae6b-a5a59742e9a7, 744e8779-dbbd-427f-8089-2389eb7c10e8`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. Script tags in bio are stripped/escaped _(verify: api_response)_
2. HTML entities are properly encoded _(verify: api_response)_
3. Existing safe HTML (if any) is preserved _(verify: api_response)_
4. هر endpoint حداقل ۳ تست دارد (موفقیت، خطای اعتبارسنجی، خطای سرور) _(verify: backend_test)_
5. پوشش خطاهای ۴۰۱، ۴۰۳، ۴۰۴، ۴۲۲ برای endpointهای مختلف _(verify: backend_test)_
6. تست‌های integration برای جریان‌های پیچیده (مثلاً ثبت‌نام + لاگین + ایجاد task) _(verify: backend_test)_

## Task Steps

### Step 1: بررسی وجود پیاده‌سازی قبلی sanitization در app/routes/users.py
**Status:** `done` (100%)
**Scope:** این مرحله شامل جستجو و بررسی فایل app/routes/users.py برای یافتن هرگونه پیاده‌سازی موجود از sanitization ورودی bio و display_name است. همچنین بررسی می‌کند که آیا کتابخانه bleach یا هر کتابخانه sanitization دیگری قبلاً نصب و استفاده شده است. خارج از این مرحله: انجام هرگونه تغییر کد یا پیاده‌سازی جدید. نکته حیاتی: اگر sanitization از قبل به درستی انجام شده، این مرحله باید یک کامیت no-op ثبت کند و مراحل بعدی مرتبط با تسک 1 را لغو کند.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.
```

### Step 2: اضافه کردن کتابخانه sanitization (bleach) به وابستگی‌های پروژه
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن کتابخانه bleach به فایل requirements.txt یا pyproject.toml پروژه است. همچنین نصب کتابخانه با pip یا ابزار مدیریت بسته مربوطه انجام می‌شود. خارج از این مرحله: نوشتن کد sanitization یا تغییر فایل‌های routes. نکته حیاتی: اگر کتابخانه از قبل وجود دارد، این مرحله را رد کن.
**Excerpt:**
```
1. Add HTML sanitization using a library like bleach or markdown parsing. Also add Content-Security-Policy headers to mitigate XSS impact.
```

### Step 3: پیاده‌سازی sanitization برای فیلد bio در تابع update_profile
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر تابع update_profile در فایل app/routes/users.py برای sanitize کردن فیلد bio با استفاده از bleach.clean است. تگ‌های HTML باید حذف شوند (strip=True) و موجودیت‌های HTML باید encode شوند. خارج از این مرحله: sanitization فیلد display_name، اضافه کردن هدرهای CSP، یا نوشتن تست. نکته حیاتی: فقط فیلد bio در این مرحله هدف است.
— [merged] این مرحله شامل تغییر تابع update_profile در فایل app/routes/users.py برای sanitize کردن فیلد display_name با استفاده از bleach.clean است. تگ‌های HTML باید حذف شوند (strip=True) و موجودیت‌های HTML باید encode شوند. خارج از این مرحله: sanitization فیلد bio، اضافه کردن هدرهای CSP، یا نوشتن تست. نکته حیاتی: فقط فیلد display_name در این مرحله هدف است.
**Excerpt:**
```
- `app/routes/users.py:30-45` — `update_profile` — Unsanitized user input stored in database
  ```python
  @router.put('/profile')
  async def update_profile(profile: UserProfileUpdate, db: Session = Depends(get_db)):
      user = db.query(User).filter(User.id == current_user.id).first()
      user.bio = profile.bio  # ⚠️ no sanitization
      user.display_name = profile.display_name  # ⚠️ no sanitization
      db.commit()
  ```
```

### Step 4: بررسی و اصلاح Schema مربوط به پروفایل کاربر (app/schemas/user_schema.py)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/schemas/user_schema.py برای اطمینان از اینکه Schema مربوط به UserProfileUpdate فیلدهای bio و display_name را به درستی تعریف کرده است. اگر نیاز به تغییر در نوع داده یا اعتبارسنجی در سطح Schema باشد، انجام می‌شود. خارج از این مرحله: تغییر در مدل دیتابیس یا Route. نکته حیاتی: این مرحله ممکن است نیاز به تغییر نداشته باشد، اما باید بررسی شود.
**Excerpt:**
```
- `app/schemas/user_schema.py` (سطر 15) — Schema for profile update
```

### Step 5: بررسی و اصلاح Model مربوط به کاربر (app/models/user.py)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/models/user.py برای اطمینان از اینکه مدل User فیلدهای bio و display_name را به درستی تعریف کرده است. اگر نیاز به تغییر در نوع داده یا محدودیت طول باشد، انجام می‌شود. خارج از این مرحله: تغییر در Route یا Schema. نکته حیاتی: این مرحله ممکن است نیاز به تغییر نداشته باشد، اما باید بررسی شود.
**Excerpt:**
```
- `app/models/user.py` (سطر 20) — User model storing bio and display_name
```

### Step 6: نوشتن تست برای AC1: Script tags in bio are stripped/escaped
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن یک تست واحد در فایل tests/test_users.py است که بررسی می‌کند هنگام ارسال درخواست PUT به /api/users/profile با bio حاوی <script>alert('xss')</script>، تگ script حذف می‌شود و پاسخ status_code 200 است. خارج از این مرحله: تست‌های مربوط به display_name یا سایر ACها. نکته حیاتی: نام تابع تست باید test_xss_prevention باشد.
**Excerpt:**
```
- Script tags in bio are stripped/escaped [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<script>alert('xss')</script>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "js]
```

### Step 7: نوشتن تست برای AC2: HTML entities are properly encoded
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن یک تست واحد در فایل tests/test_users.py است که بررسی می‌کند هنگام ارسال درخواست PUT به /api/users/profile با bio حاوی <b>bold</b> & <i>italic</i>، موجودیت‌های HTML به درستی encode می‌شوند و پاسخ status_code 200 است. خارج از این مرحله: تست‌های مربوط به script tags یا سایر ACها. نکته حیاتی: این تست باید جدا از تست قبلی باشد.
**Excerpt:**
```
- HTML entities are properly encoded [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<b>bold</b> & <i>italic</i>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "json]
```

### Step 8: نوشتن تست برای AC3: Existing safe HTML (if any) is preserved
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن یک تست واحد در فایل tests/test_users.py است که بررسی می‌کند هنگام ارسال درخواست PUT به /api/users/profile با bio حاوی <b>safe</b>، این تگ safe حفظ می‌شود (در صورت پشتیبانی) و پاسخ status_code 200 است. خارج از این مرحله: تست‌های مربوط به script tags یا encode. نکته حیاتی: این تست باید با توجه به تنظیمات bleach (tags=[]) که همه تگ‌ها را حذف می‌کند، ممکن است انتظار حذف تگ <b> را داشته باشد. باید با توجه به پیاده‌سازی تصمیم گرفت.
**Excerpt:**
```
- Existing safe HTML (if any) is preserved [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/users/profile", "headers": null, "json_body": {"bio": "<b>safe</b>", "display_name": "test"}, "expected_status": 200, "required_fields": ["bio"], "json_contains": null]
```

### Step 9: بررسی وجود تست‌های قبلی در tests/test_auth.py و شناسایی شکاف‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل فایل tests/test_auth.py برای شناسایی تست‌های موجود و شکاف‌های پوشش است. باید مشخص شود که کدام endpointها تست نشده‌اند و کدام سناریوهای خطا (401, 403, 404, 422) پوشش داده نشده‌اند. خارج از این مرحله: نوشتن تست‌های جدید. نکته حیاتی: این مرحله فقط بررسی و مستندسازی است.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
```

### Step 10: نوشتن تست‌های خطا برای endpoint لاگین (tests/test_auth.py)
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن تست‌های جدید در فایل tests/test_auth.py برای پوشش سناریوهای خطای endpoint لاگین است. حداقل تست‌های زیر باید اضافه شوند: test_login_wrong_password (401), test_login_disabled_user (403), test_login_invalid_username (404). خارج از این مرحله: تست‌های موفقیت یا تست‌های endpointهای دیگر. نکته حیاتی: هر تست باید یک سناریوی خطای مجزا را پوشش دهد.
**Excerpt:**
```
- `tests/test_auth.py:1-50` — `test_login_success` — نیاز به تست‌های خطا: رمز اشتباه، کاربر غیرفعال، توکن منقضی
  ```python
  async def test_login_success(client):
      response = await client.post("/auth/login", json={"username": "test", "password": "test"})
      assert response.status_code == 200
  ```
```

### Step 11: نوشتن تست‌های خطا برای endpoint ثبت‌نام (tests/test_auth.py)
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن تست‌های جدید در فایل tests/test_auth.py برای پوشش سناریوهای خطای endpoint ثبت‌نام است. حداقل تست‌های زیر باید اضافه شوند: test_register_missing_fields (422), test_register_duplicate_username (409), test_register_weak_password (422). خارج از این مرحله: تست‌های موفقیت یا تست‌های endpoint لاگین. نکته حیاتی: هر تست باید یک سناریوی خطای مجزا را پوشش دهد.
**Excerpt:**
```
- پوشش خطاهای ۴۰۱، ۴۰۳، ۴۰۴، ۴۲۲ برای endpointهای مختلف [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 60}]
```

### Step 12: نوشتن تست‌های integration برای جریان‌های پیچیده (ثبت‌نام + لاگین + ایجاد task)
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن یک تست integration در فایل tests/test_auth.py است که یک جریان کامل کاربر را شبیه‌سازی می‌کند: ثبت‌نام کاربر جدید، لاگین با آن کاربر، و سپس ایجاد یک task. خارج از این مرحله: تست‌های واحد مجزا. نکته حیاتی: این تست باید از client واقعی (httpx.AsyncClient) استفاده کند و وابستگی‌های خارجی را mock کند.
**Excerpt:**
```
- تست‌های integration برای جریان‌های پیچیده (مثلاً ثبت‌نام + لاگین + ایجاد task) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth.py", "timeout_seconds": 120}]
```

### Step 13: اجرای کامل تست‌ها و رفع خطاهای احتمالی
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای کامل مجموعه تست‌ها با دستور pytest tests/ -v --cov=app --cov-report=term-missing است. هرگونه خطا یا warning باید بررسی و رفع شود. همچنین linter و type-checker باید اجرا شوند. خارج از این مرحله: نوشتن تست‌های جدید. نکته حیاتی: این مرحله نهایی است و باید اطمینان حاصل شود که همه تست‌ها با موفقیت عبور می‌کنند.
**Excerpt:**
```
- هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- linter بدون warning عبور می‌کند
- type-check موفق است (`tsc --noEmit` / `mypy`)
```
