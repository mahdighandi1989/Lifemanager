# TO-DO — task 4ae4b3ca — برنامه و بودجه (Finance)

وضعیت این سشن: AC1 (مدل `FinancialAccount` در `app/models/finance.py`) ✓،
AC2 (`GET /api/finance/accounts` + aliasهای per-kind مثل `/api/bank-accounts`) ✓،
AC4 (`EmailParserService` در `app/services/email_parser_service.py` + ۵ تست) ✓ این سشن اضافه شد.

موارد باقی‌مانده (نیازمند تصمیم/کار UI یا تغییر مدل):

## اولویت‌بندی‌شده
1. **[HIGH] صفحهٔ بودجه در فرانت‌اند (AC3 + AC6).** پرامپت `BudgetPage.tsx` و
   `Navigation.tsx` را فرض کرده، ولی فرانت‌اند پروژه **JSX** است و از
   `Sidebar.jsx` استفاده می‌کند (نه TypeScript/Navigation). برای تکمیل:
   `frontend/src/pages/BudgetPage.jsx` با AccountList + خلاصهٔ Dashboard
   (با مصرف `/api/finance/accounts`) ساخته، route `/budget` در `App.jsx`
   اضافه، و لینک «برنامه و بودجه» در `Sidebar.jsx` گذاشته شود. (مشابه الگوی
   AISettings.jsx که این سشن ساخته شد.)
2. **[MEDIUM] نوتیفیکیشن بودجه‌ای (AC5).** «اگر Task دارای `estimated_cost`
   باشد و موجودی کافی باشد → نوتیفیکیشن "شما می‌توانید [تسک] را انجام دهید"».
   نیازمند افزودن فیلد `estimated_cost` به مدل `Task` (+ migration) و سپس
   منطق مقایسهٔ موجودی در NotificationService است — یک تصمیم مدل‌داده که بهتر
   است با شما هماهنگ شود (واحد پول/ارز حساب‌ها در مقایسه).
