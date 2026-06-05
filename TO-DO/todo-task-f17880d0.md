# TODO — Task f17880d0 (نیاز به تکمیل دستی)

> **Add Missing Auth to Mutation Endpoints**

## 🔎 خلاصه وضعیت

- **task_id**: `f17880d0-efa3-4ab9-a92a-66bbfbbc4a9d`
- **repo**: `mahdighandi1989/Lifemanager`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 2
- **verifier confidence**: 0.98
- **verifier model**: `—`
- **report_id**: `40e3bd83-2db5-46ac-a63d-3da2313c5e7e`
- **created_at**: 2026-06-05T19:55:18.248506+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- [ ] PR description توضیح می‌دهد چرا این تصمیم گرفته شد

## ✅ چه چیزی Claude انجام داد

- [x] ناسازگاری‌های auth در مسیرهای mutation شناسایی و مستند شد
- [x] ground truth (هویت از توکن) تعیین و طرف‌های ناسازگار align شد
- [x] تست‌های integration برای pipeline auth اضافه و عبور می‌کنند
- [x] PR description و مستندات (docs/API.md, docs/auth-hardening-audit) تصمیمات را توضیح می‌دهند

## 📝 خلاصهٔ verifier

تمامی معیارهای پذیرش تسک Add Missing Auth to Mutation Endpoints برآورده شده‌اند: ناسازگاری‌ها شناسایی و مستند شده، ground truth (هویت از توکن) تعیین و طرف‌های ناسازگار align شده، تست‌های integration برای pipeline auth اضافه و عبور می‌کنند، و تصمیمات در مستندات و پیام‌های کامیت توضیح داده شده‌اند.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- ground truth تعیین شد و طرف دیگر align شد
- integration test برای pipeline `auth` بدون شکست عبور می‌کند
- PR description توضیح می‌دهد چرا این تصمیم گرفته شد

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `8ea258b`
- `50775cc`
- `fc982f5`
- `53f246c`
- `728bfcf`

**Files lams شده:**
- `app/routes/users.py`
- `app/routes/tasks.py`
- `app/routes/lists.py`
- `app/routes/todo_items.py`
- `app/routes/planner.py`
- `tests/test_integrations.py`
- `tests/test_notifications.py`
- `tests/test_auth_mutation_coverage_f17880d0.py`
- `tests/test_auth_google.py`
- `docs/API.md`
- `docs/auth-hardening-audit-9a5a3b4d.md`
- `frontend/src/context/AuthContext.jsx`

## 💡 ایدهٔ اصلی تسک

## 📋 شرح ناسازگاری
در pipeline `auth` یک ناسازگاری منطقی پیدا شد:

The `app/dependencies/auth.py` component is explicitly designated for enforcing access controls and resolving user identity from JWT tokens. However, the provided component descriptions do not explicitly guarantee that *all* backend mutation paths (e.g., user profile updates, role changes, resource creation/deletion, beyond initial registration/login) are consistently guarded by these dependencies. While `auth_service.py` handles core logic, it's the API layer's responsibility to apply the `depe

## 💥 پیامد (impact)
Unauthorized users could perform actions they shouldn't, leading to data corruption, privilege escalation, or severe security breaches. This is a fundamental security flaw that could compromise the integrity and confidentiality of the system.

## 🛠 پیشنهاد رفع اولیه
Ensure that all FastAPI routes that perform data mutations (create, update, delete operations on users, roles, or any protected resources) explicitly use the appropriate dependencies from `app/dependencies/auth.py` (e.g., `Depends(get_current_active_user)` combined with role/permission checks). Implement comprehensive unit and integration tests to verify permission enforcement on all relevant endp

## 🤔 چرا مهم است
coherence issue یعنی دو بخش کد فرض‌های ناسازگار دارند — معمولاً نشانه‌ی refactor ناتمام یا feature flag rot است. این کلاس bug ها در test معمولی پیدا نمی‌شوند چون unit test ها در silo اجرا می‌شوند.

## 📜 پرامپت اصلی (excerpt)

```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

📖 **خواندن کامل + اجرای مو-به-مو (بسیار مهم):**

این پرامپت — از این یادداشت تا انتها — یک سند واحد است که هر بخشش
حاوی الزام یا context منحصربه‌فرد است. خواندن سطحی یا skim کردن **ممنوع**
است.

- پرامپت را **سطر به سطر** بخوان، نه head/tail/فقط-بخش-اصلی.
- اگر بخشی به‌نظر طولانی یا تکراری آمد، **حتماً** بخوان — تفاوت‌های
  ریز ممکن است در آن جا اساسی باشند.
- هر جمله، URL، نام فایل، نام تابع، یا مقدار عددی که در پرامپت آمده،
  دقیقاً همان است که کاربر می‌خواهد — تغییرش نده، رندش نکن، خلاصه‌اش
  نکن.
- اگر پرامپت چندین درخواست/مرحله/زیرتسک دارد، **همه** را پیاده کن. حتی
  یکی را نه به‌عنوان "خارج از scope" حذف کن.

❌ ممنوعات صریح:
- خلاصه‌سازی متن کاربر در commit message یا response
- "این بخش اصلی نیست، رد می‌کنم"
- "کاربر احتمالاً منظورش این بود..." — منظورش همان است که نوشته
- "این URL/نام به نظر قدیمی است، آپدیتش کردم" — تغییر بدون درخواست ممنوع
- پیاده‌سازی فقط بخشی از پرامپت و تظاهر به کامل بودن
- "همه آیتم‌های لیست A را بررسی کردم، B و C مشابه بودند" — نه؛
  هرکدام را جداگانه

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
  با

_[truncated — full prompt در پنل]_
```

---

_این فایل توسط Claude Auto-Runner تولید شده است. تسک با حالت_ `max_retries` _آرشیو شده و دیگر به‌صورت خودکار pickup نمی‌شود._