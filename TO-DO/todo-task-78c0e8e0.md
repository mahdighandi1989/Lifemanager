# TO-DO — task_78c0e8e0a9b5 — پیاده‌سازی احراز هویت JWT و کنترل دسترسی کاربر

این تسک به‌صورت خودکار پیاده‌سازی، اصلاح و تست شد (۱۳۵ تست سبز در scope).
موارد زیر **اقدام دستی شما** را می‌طلبند — خارج از دسترسی من، چون تنظیم
secret در محیط production/Render فقط از سمت شما ممکن است.

## اقدامات اولویت‌بندی‌شده

1. **[CRITICAL] تنظیم `JWT_SECRET_KEY` واقعی در production (Render).**
   - guard سخت‌گیرانهٔ startup (`app/config.py::_validate`) اکنون اگر
     `ENVIRONMENT=production` باشد و `JWT_SECRET_KEY` خالی/پیش‌فرض/placeholder
     باشد (`<YOUR_JWT_SECRET_KEY>`، `dev-only-change-me-in-production`،
     `change-me-in-production`)، **برنامه با RuntimeError بالا نمی‌آید** و
     health check رد می‌شود.
   - تولید کلید: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - در Render → سرویس `lifemanager` → Environment → افزودن `JWT_SECRET_KEY`
     با مقدار تولیدشده.
   - ⚠️ اگر دیپلوی فعلی هنوز placeholder دارد، **پس از این push حتماً این کلید
     را تنظیم کنید، وگرنه سرویس production بالا نمی‌آید.**

2. **[HIGH] تنظیم `WEBHOOK_SECRET` واقعی در production.**
   - برای تأیید امضای HMAC وب‌هوک‌ها (زیرتسک ۷). یک مقدار قوی تولید و در
     Render تنظیم کنید.

3. **[MEDIUM] چرخش (rotate) کلید در صورت نشت قبلی (AC20).**
   - اگر `JWT_SECRET_KEY` قبلاً در جایی commit/نشت شده، کلید جدید بسازید و در
     deployment تنظیم کنید (توجه: همهٔ توکن‌های صادرشدهٔ فعلی باطل می‌شوند).
