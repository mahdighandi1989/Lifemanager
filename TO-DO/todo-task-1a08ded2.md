# TO-DO — task 1a08ded2 — مدیریت ارائه‌دهندگان/مدل‌های AI + context

این تسک ۳۸ AC دارد و بخش بزرگ بک‌اند از قبل پیاده شده بود (مدل‌ها/schemaها/سرویس‌های
provider و model، endpointهای `/api/ai/providers`،`/api/ai/configs`،`/global-prompt`،
`/user_data_context`،`/dynamic-analyze`، و migration 0012 برای جداول `ai_providers` و
`global_analysis_prompts`). این سشن دو گپ باز را بست:
- **AC4** → صفحهٔ `frontend/src/pages/AISettings.jsx` (+ route `/ai-settings`) + ۳ تست vitest.
- **AC18** → بخش AI در `docs/API.md` (فیلد `provider` و فیلتر `?provider=`).

موارد زیر **تصمیم/تأیید شما** را می‌طلبند (نه صرفاً کدنویسی):

## اولویت‌بندی‌شده
1. **[HIGH] تصمیم auth مدیریت ارائه‌دهندگان (AC8/AC10).** endpointهای provider/config
   فعلاً **user-scoped** هستند (`get_optional_user_id`، سازگار با login-bypass فعلی
   فرانت‌اند)، نه admin-only. اگر طبق AC می‌خواهید فقط ادمین provider بسازد و non-admin
   خطای 403 بگیرد، پس از فعال‌سازی auth واقعی فرانت‌اند، dependency این endpointها را به
   `get_current_admin_user` تغییر دهید.
2. **[MEDIUM] تأیید رمزنگاری کلیدهای API در حالت ذخیره (AC5).** اگر deployment شما
   کلید provider/custom را در DB ذخیره می‌کند، تأیید کنید که با `crypt_service`
   رمزنگاری می‌شود (و در صورت لزوم این مسیر در سرویس فعال شود).
