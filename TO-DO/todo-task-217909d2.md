# TO-DO — task 217909d2 — اسکن دارایی‌ها و تحلیل محتوا

این سشن: AC1 (`UserAsset` در `app/models/user_asset.py` + ثبت در __init__ +
افزودن `user_assets` به migration 0014) ✓؛ AC6 (`AssetToTaskLinker` —
تطبیق نام دارایی با عنوان تسک، مثل Inception.mp4 ↔ «تماشای فیلم Inception»)
✓ با ۴ تست. (deliverable قبلیِ ingestion+recommendation — IndexedDataSourceEntry،
data_ingestion_service، recommendation_service — موجود و تست‌شده، ۳۲ تست.)

موارد باقی‌مانده نیازمند اسکن سیستم‌فایل/WebSocket/UI/Google:

## اولویت‌بندی‌شده
1. **[HIGH] endpoint اسکن + سرویس اسکنر (AC2).** `POST /api/assets/scan`
   (با auth) که مسیرها را پیمایش و `UserAsset` پر کند؛ وضعیت scanning/completed.
2. **[MEDIUM] WebSocket پیشرفت اسکن (AC3).** `WS /api/assets/scan-status`
   (درصد + فایل فعلی).
3. **[MEDIUM] فرانت‌اند (AC4/AC5).** `AssetDashboard` (لیست به تفکیک نوع) و
   `AssetSettings` (افزودن/حذف مسیر + زمان‌بندی) — به‌صورت JSX.
4. **[LOW] تشخیص mount درایو خارجی (AC7).** نوتیفیکیشن «درایو جدید شناسایی شد»
   (نیازمند دسترسی OS/agent — تصمیم/زیرساخت شما).
5. **[LOW] یکپارچه‌سازی Google Drive (AC8).** نمایش فایل‌های Drive در assets
   (نیازمند Google creds — مشترک با تسک 7367c6f0).
