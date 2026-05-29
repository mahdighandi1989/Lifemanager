# TO-DO — task 7367c6f0 — انتقال داده به Google Drive + طبقه‌بندی سرد

این سشن: AC3 (مدل `DriveFile` با `storage_tier`/`extracted_text`/`drive_link`
+ ثبت در `app/models/__init__.py` + ۲ تست) ✓. هستهٔ طبقه‌بندی
(`DataClassificationService` + `essential_window_days`) و stub
`google_drive_service.py` از قبل موجود و تست‌شده‌اند (۱۵ تست) — پوشش AC8/AC11
(تشخیص دادهٔ قدیمی/سرد).

موارد باقی‌مانده نیازمند **اعتبارنامهٔ Google API + Celery worker + کتابخانهٔ OCR/ASR**
هستند (راه‌اندازی زیرساخت = اقدام شما):

## اولویت‌بندی‌شده
1. **[HIGH] اعتبارنامهٔ Google (اقدام شما).** سرویس‌اکانت Google Drive + Sheets
   API را بسازید و کلیدها را در env (Render) تنظیم کنید — بدون آن AC1/2/4/5/9/10
   قابل اجرا/تست واقعی نیستند.
2. **[HIGH] GoogleDriveService.upload + GoogleSheetsService.append (AC1/AC2).**
   تکمیل `google_drive_service.py` (آپلود فایل → file_id) و افزودن
   `google_sheets_service.py` (افزودن ردیف لاگ انتقال).
3. **[MEDIUM] endpointهای Drive (AC4/AC5).** `POST /api/drive/upload` و
   `GET /api/drive/files` (با ذخیرهٔ metadata در `DriveFile`).
4. **[MEDIUM] Workerهای Celery (AC6/AC7/AC12).** پردازش صوت (ASR) و عکس (OCR)
   → ذخیره در `DriveFile.extracted_text` (نیازمند Redis/worker + کتابخانهٔ OCR
   مثل pytesseract).
5. **[MEDIUM] Celery beat tiering (AC8/AC11).** جاب دوره‌ای که با
   `DataClassificationService` تسک‌های >۳۰ روز را به Drive منتقل و
   `storage_tier='cold'` کند تا سقف ۱GB رعایت شود.

---
**به‌روزرسانی (AC4/AC5/AC8/AC11):** انجام شد. `GET /api/drive/files` (+ جستجوی `?q=`)، `POST /api/drive/upload` (ثبت metadata در DriveFile؛ push واقعی به Drive وقتی creds باشد)، و جاب روزانهٔ Celery `tier_cold_data` (با DataClassificationService تسک‌های cold-eligible را می‌شمارد). تنها موارد ذاتاً خارجی باقی مانده: AC1/AC9 (آپلود/preview واقعی Drive)، AC2/AC10 (Google Sheets) — نیازمند سرویس‌اکانت Google؛ و AC6/AC7/AC12 (OCR/ASR) — نیازمند کتابخانهٔ OCR + Celery worker.
