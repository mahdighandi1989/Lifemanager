# TODO — Task task_92f (نیاز به تکمیل دستی)

> **افزودن نوتیفیکیشن `verify_failed` و مدیریت رویدادها**

## 🔎 خلاصه وضعیت

- **task_id**: `task_92fa5ea15e2b`
- **repo**: `mahdighandi1989/Lifemanager`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 1
- **verifier confidence**: 0.85
- **verifier model**: `—`
- **report_id**: `0bcbec3b-7ef1-4e41-ad80-81c373ed93bd`
- **created_at**: 2026-06-05T06:15:14.062413+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] ثبت event_type 'task_done' در event registry (register_event) انجام نشده
- [ ] قابلیت toggle event_type 'task_done' از UI notification settings پیاده‌سازی نشده
- [ ] rate-limit برای event verify_failed اضافه نشده
- [ ] رفع مشکل orphan records در صورت rename event_type انجام نشده
- [ ] اجرای type-check (mypy) برای اطمینان از موفقیت انجام نشده
- [ ] اجرای npm run build برای اطمینان از موفقیت build انجام نشده
- [ ] اجرای npm run lint برای اطمینان از عدم وجود warning انجام نشده

## 👉 قدم‌های بعدی پیشنهادی (از verifier)

1. ثبت event_type 'task_done' در event registry (فایل‌های backend/app/notifications/event_registry.py یا events.py)
2. اضافه کردن قابلیت toggle برای event_type 'task_done' در UI notification settings
3. بررسی نیاز به rate-limit برای event verify_failed و اضافه کردن آن
4. اجرای type-check (mypy) و رفع خطاهای احتمالی
5. اجرای npm run build و npm run lint برای اطمینان از سلامت فرانت‌اند

## ✅ چه چیزی Claude انجام داد

- [x] فراخوانی notify_event("verify_failed", ...) در auth_service.py و webhook.py اضافه شده
- [x] تمپلیت پیام فارسی و معنادار (VERIFY_FAILED_MESSAGE_FA) در notification_service.py وجود دارد
- [x] پارامترهای silent=False و priority="high" در notify_event تنظیم شده
- [x] تست test_telegram_notification_on_verify_failed برای تریگر مصنوعی نوشته شده
- [x] event_type 'verify_failed' معنادار و snake_case است
- [x] مشکل caption_incomplete در notification_service.py بررسی و رفع شده
- [x] بررسی و حل کلی تسک در کامیت 90597e8 مستند شده

## 📝 خلاصهٔ verifier

بخش اصلی تسک (notify_event برای verify_failed با تمپلیت فارسی، silent=False، priority=high و تست تلگرام) در کامیت 90597e8 پیاده‌سازی شده. اما ثبت event_type 'task_done' در event registry، قابلیت toggle در UI، rate-limit و اجرای type-check/build/lint باقی مانده است.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد
- message template فارسی و معنادار است
- silent=False + priority="high"
- تست: trigger مصنوعی → notification در Telegram دیده می‌شود
- این مورد بررسی و حل شد
- event_type معنادار snake_case تعیین شد
- در event registry ثبت شد
- از UI tab notification settings این event قابل toggle است

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `90597e8`
- `1a4e047`
- `57d542c`
- `d06e769`

**Files lams شده:**
- `app/services/auth_service.py`
- `app/routes/webhook.py`
- `app/services/notification_service.py`
- `tests/notifications/test_verify_failed_notification.py`

## 💡 ایدهٔ اصلی تسک

🧬 این یک تسک تلفیقی است — از 4 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها بر روی بازبینی، افزودن نوتیفیکیشن‌های جدید و تعریف صریح event_type برای بهبود قابلیت مشاهده و ارتباطات در سیستم نوتیفیکیشن تمرکز دارند.
🎯 theme: بازبینی و بهبود سیستم نوتیفیکیشن
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 4
  id: 405fd17d-8937-44d2-8cfc-dc8edf352ada
  عنوان اصلی: افزودن notification برای event 'verify_failed'
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\""], "files_hint": ["backend/app/handlers/failure_handler.py", "backend/app/services/notification_service.py"]}]
  - message template فارسی و معنادار است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\",\\s*.*silent=False,\\s*priority=\"high\""], "files_hint": ["backend/app/handlers/failure_handler.py"]}]
  - تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/notifications/test_verify_failed_notification.py::test_telegram_notification_on_verify_failed", "timeout_seconds": 90}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌

---

_این فایل توسط Claude Auto-Runner تولید شده است. تسک با حالت_ `max_retries` _آرشیو شده و دیگر به‌صورت خودکار pickup نمی‌شود._