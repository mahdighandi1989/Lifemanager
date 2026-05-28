# TO-DO — task 2165524b — موتور زمینه (Context Engine)

نکتهٔ مهم: ACهای کانونیک این تسک دربارهٔ یک **context_engine** (سیگنال‌های
location/biometric/activity/audio → پیشنهاد هوشمند) هستند، در حالی که کامیت
سشن قبلی به‌جایش فیلد `type` را روی `TodoItem` افزود (موجود و تست‌شده، اما
ربطی به این ACها ندارد).

این سشن انجام شد:
- **AC1** → پکیج `app/services/context_engine/` با ۶ فایل
  (`__init__`,`location_service`,`biometric_service`,`activity_service`,
  `audio_context_service`,`orchestrator_service`) — قانون‌محور و قطعی.
- **AC3** → endpoint `POST /api/v1/context/analyze` (ثبت در main.py) که با
  location + heart_rate پاسخ 200 + لیست suggestions می‌دهد. (۵ تست)

موارد باقی‌مانده (نیازمند تغییر مدل/زیرساخت یا UI):

## اولویت‌بندی‌شده
1. **[HIGH] فیلدهای زمینه روی مدل Task (AC2).** افزودن `location_lat`,
   `location_lng`, `heart_rate_threshold`, `activity_required`, `mood_tag`
   به `app/models/task.py` + یک migration Alembic + ستون‌های startup. (تصمیم
   مدل‌داده — بهتر است با شما هماهنگ شود.)
2. **[MEDIUM] جاب زمان‌بندی‌شدهٔ Celery (AC4).** تسک `analyze_user_context`
   هر ۱۵ دقیقه در `app/celery_app.py`/`app/tasks.py` که orchestrator را برای
   هر کاربر اجرا کند و لاگ بزند. (نیازمند Redis/worker فعال در deployment.)
3. **[MEDIUM] بخش «پیشنهادات هوشمند» در فرانت‌اند (AC5).** افزودن بخش Smart
   Suggestions به صفحهٔ تسک‌ها که از `/api/v1/context/analyze` تغذیه شود
   (frontend پروژه JSX است، نه `TaskList.tsx`).
