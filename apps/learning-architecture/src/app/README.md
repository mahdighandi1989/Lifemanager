# نصب «معماری یادگیری عمیق» و «کارخانه معرفت‌شناسی» روی Google Apps Script

هر دو سامانه در یک برنامه‌اند (بالای منو بین‌شان جابه‌جا می‌شوی) و یک پایگاه داده مشترک دارند.

## فایل‌ها
| فایل در این پوشه | نوع فایل در ویرایشگر Apps Script | نام دقیق |
|---|---|---|
| Code.gs | Script | Code |
| Index.html | HTML | Index |
| core.html | HTML | core |
| tech_a.html … tech_e.html | HTML | tech_a … tech_e |
| epi_book.html | HTML | epi_book |
| epi_data.html | HTML | epi_data |
| epi_bt.html | HTML | epi_bt |
| EpiBacktest.gs | Script | EpiBacktest |
| app.html | HTML | app |
| appsscript.json | مانیفست | appsscript |

## گام‌ها
1. به script.google.com برو ← New project.
2. Project Settings ← تیک «Show "appsscript.json" manifest file in editor» را بزن، سپس محتوای `appsscript.json` را جایگزین کن.
3. محتوای `Code.gs` را در فایل Code بچسبان.
4. برای هر فایل HTML: علامت + ← HTML ← نام را **بدون پسوند** و دقیقاً مطابق جدول بنویس (Index، core، tech_a، tech_b، tech_c، tech_d، tech_e، epi_book، epi_data، epi_bt، app). فایل EpiBacktest.gs را هم مثل Code به‌صورت Script بساز و محتوا را بچسبان.
5. از فهرست توابع، `setup` را یک بار Run کن و مجوزها را بده. پایگاه داده (Google Sheet به نام LearningArchitecture_DB) در Drive تو ساخته می‌شود.
6. Deploy ← New deployment ← نوع Web app ← Execute as: Me ← Who has access: Only myself ← Deploy. نشانی Web app را نگه دار؛ این سامانه توست.
7. (اختیاری) در سامانه، بخش «تنظیمات»: سرویس هوش مصنوعی (Gemini یا Claude)، نام مدل و کلید API را وارد کن. کلید در Script Properties ذخیره می‌شود، نه در مرورگر.
8. (اختیاری) در همان بخش، «یادآور روزانه ایمیلی» را فعال کن تا هر صبح کارهای موعددار هر دو سامانه (از جمله بازبینی پرونده‌های معرفتی) به ایمیلت بیاید.

## نکته‌ها
- برای به‌روزرسانی کد: فایل را جایگزین کن ← Deploy ← Manage deployments ← ویرایش ← Version: New version.
- انتقال داده از نسخه مرورگر: در نسخه مرورگر «تنظیمات ← تولید خروجی ← کپی» و در نسخه Apps Script «تنظیمات ← ورود داده».
- هر رکورد در یک ردیف Sheet است (ستون‌های json_1 به بعد). Sheet را دستی ویرایش نکن؛ برای تحلیل، یک کپی بگیر.

## بک‌تست هفتگی کارخانه
- در سامانه: کارخانه ← دادگاه بک‌تست ← «دوره‌ها و اتوماسیون» ← «نصب دوره هفتگی روی سرور». هر شنبه ساعت ۶ رادار اجرا و گزارشش ایمیل می‌شود.
- گردآوری هوش مصنوعی در دوره (اختیاری) پرونده‌ها را فقط به صف تأیید می‌فرستد؛ هیچ پرونده‌ای بی‌تأیید شما وارد بک‌تست نمی‌شود.
