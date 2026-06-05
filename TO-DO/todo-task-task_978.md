# TODO — Task task_978 (نیاز به تکمیل دستی)

> **پیاده‌سازی معیارهای عملکردی و پاکسازی کد AI**

## 🔎 خلاصه وضعیت

- **task_id**: `task_97867b277c1b`
- **repo**: `mahdighandi1989/Lifemanager`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 2
- **verifier confidence**: 0.92
- **verifier model**: `—`
- **report_id**: `a7a879b5-650f-4406-b71a-90065d6c9bd7`
- **created_at**: 2026-06-05T06:22:15.576659+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] تست E2E برای اندازه‌گیری outcome (test_ai_outcome_metrics) نوشته/عبور نشده
- [ ] خط مبنا و اهداف در فایل config ثبت نشده است
- [ ] اجرای type-check (mypy) برای اطمینان از صحت نوع‌ها انجام نشده
- [ ] commit message نهایی شامل merged-from نیست
- [ ] PR با checklist کامل از کامیت‌ها ایجاد نشده

## 👉 قدم‌های بعدی پیشنهادی (از verifier)

1. نوشتن تست E2E test_ai_outcome_metrics در tests/e2e/test_ai_performance.py
2. ثبت خط مبنا و اهداف در فایل config.yaml یا settings.py
3. اجرای mypy روی پروژه و رفع خطاهای type-check
4. ایجاد PR با checklist کامل از کامیت‌ها و توضیحات merged-from

## ✅ چه چیزی Claude انجام داد

- [x] outcome target به صورت measurable بازنویسی شد (کامیت 99c28c8)
- [x] کد برای محقق‌سازی outcome target تغییر کرد (کامیت d06e769)
- [x] metric/log برای تشخیص outcome rate در production اضافه شد (کامیت d06e769)
- [x] import generate_text از فایل ai.py حذف شد (کامیت d06e769)
- [x] endpoint /ai/generate از AIService استفاده می‌کند (کامیت d06e769)
- [x] هیچ خطای import در زمان اجرا رخ نمی‌دهد (کامیت d06e769)
- [x] endpoint POST /generate به عنوان active utility endpoint دسته‌بندی شد (کامیت d06e769)
- [x] اقدام مناسب (connection opened) برای endpoint انجام شد (کامیت d06e769)
- [x] مکانیزم بازخورد لایک/دیسلایک در AIFeedbackWidget.jsx پیاده‌سازی شده
- [x] مکانیزم امتیازدهی 1-5 در AIFeedbackWidget.jsx پیاده‌سازی شده
- [x] ذخیره‌سازی معیارهای AI در دیتابیس (مدل ai_feedback.py) انجام شده
- [x] endpoint GET /api/ai/metrics برای آمار معیارها وجود دارد (AIFeedbackWidget.jsx)

## 📝 خلاصهٔ verifier

بخش عمده‌ای از معیارهای عملکردی AI (بازنویسی هدف، تغییر کد، لاگ‌گیری، حذف کد مرده، اتصال endpoint به AIService، دسته‌بندی endpoint، و پیاده‌سازی بازخورد لایک/دیسلایک/امتیازدهی) انجام شده است. اما تست E2E برای اندازه‌گیری outcome نوشته نشده، خط مبنا در config ثبت نشده، type-check اجرا نشده، و مستندسازی نهایی (commit message با merged-from و PR) انجام نشده است.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- outcome target به‌صورت measurable بازنویسی شد
- کد تغییر کرد تا outcome target محقق شود
- test E2E که outcome را اندازه می‌گیرد عبور می‌کند
- metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد
- import generate_text از فایل ai.py حذف شود
- endpoint /ai/generate از AIService استفاده کند
- هیچ خطای import در زمان اجرا رخ ندهد
- مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated)
- اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `99c28c8`
- `d06e769`
- `f256ff8`
- `29f8435`
- `b5307dc`

**Files lams شده:**
- `frontend/src/components/AIFeedbackWidget.jsx`
- `app/models/ai_feedback.py`
- `app/routes/ai.py`
- `app/services/ai/performance_service.py`

## 💡 ایدهٔ اصلی تسک

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها شامل پیاده‌سازی معیارهای عملکردی و مکانیزم‌های بازخورد برای هسته هوش مصنوعی و همچنین پاکسازی کدها و endpointهای بلااستفاده مرتبط با آن هستند.
🎯 theme: بهبود و پاکسازی سیستم هوش مصنوعی
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: e374a41e-09c7-4a27-8a4d-cbd3befcd47a
  عنوان اصلی: پیاده‌سازی معیارهای عملکردی هسته هوش مصنوعی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_processor", "ai_feedback_logger", "ai_performance_tracker"], "files_hint": ["backend/app/ai_service.py", "backend/app/metrics.py", "backend/app/logging.py"]}]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_ai_performance.py::test_ai_outcome_metrics", "timeout_seconds": 120}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_latency_ms", "ai_response_quality_score", "log.info.*ai_performance", "metric_collector.record_ai_latency", "metric_collector.record_ai_quality"], "files_hint": ["back

---

_این فایل توسط Claude Auto-Runner تولید شده است. تسک با حالت_ `max_retries` _آرشیو شده و دیگر به‌صورت خودکار pickup نمی‌شود._