# TODO — Task 42eab35f (نیاز به تکمیل دستی)

> **Align AuthContext user.id contract**

## 🔎 خلاصه وضعیت

- **task_id**: `42eab35f-19d3-4884-a25b-383672e29478`
- **repo**: `mahdighandi1989/Lifemanager`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 3
- **verifier confidence**: 0.98
- **verifier model**: `—`
- **report_id**: `e558af2b-5f66-4e17-a7cf-73b4d884d160`
- **created_at**: 2026-06-05T20:05:57.328875+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] ground truth تعیین شد و طرف دیگر align شد

## ✅ چه چیزی Claude انجام داد

- [x] ناسازگاری user.id در AuthContext و UserContext شناسایی و مستند شد
- [x] ground truth (backend users.id) تعیین و طرف دیگر (فرانت‌اند) align شد
- [x] تست یکپارچه‌سازی cross-tier برای pipeline data اضافه و عبور می‌کند
- [x] مستندات تصمیم‌گیری در docs/API.md و کامیت‌ها توضیح داده شده

## 📝 خلاصهٔ verifier

تمام معیارهای پذیرش تسک Align AuthContext user.id contract برآورده شده‌اند: ناسازگاری شناسایی و مستند شده، ground truth تعیین و align انجام شده، تست یکپارچه‌سازی اضافه و عبور می‌کند، و تصمیمات در مستندات توضیح داده شده‌اند.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- ground truth تعیین شد و طرف دیگر align شد
- integration test برای pipeline `data` بدون شکست عبور می‌کند
- PR description توضیح می‌دهد چرا این تصمیم گرفته شد

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `50775cc`
- `53f246c`
- `9dd8975`
- `b5f4329`

**Files lams شده:**
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/__tests__/AuthContext.test.jsx`
- `app/routes/lists.py`
- `app/routes/tasks.py`
- `app/routes/todo_items.py`
- `tests/integration/test_data_pipeline_user_id_42eab35f.py`
- `docs/API.md`

## 💡 ایدهٔ اصلی تسک

## 📋 شرح ناسازگاری
در pipeline `data` یک ناسازگاری منطقی پیدا شد:

The `AuthContext.jsx` component outputs a generic `user: object (user data)` upon successful authentication. However, `app/models/context.py`'s `UserContext` model relies on a `user_id` (via `ForeignKey` to a `users table`) to link contextual data to a specific user. The current description of `AuthContext`'s output does not explicitly guarantee that the `user: object` will contain a field like `id` or `user_id` that is consistent with the backend's user identification scheme.

## 💥 پیامد (impact)
Without a guaranteed and consistent `user_id` from the frontend authentication flow, it becomes difficult or impossible for downstream components (e.g., a service layer on the backend) to reliably fetch or store `UserContext` data for the currently authenticated user. This breaks the logical link be

## 🛠 پیشنهاد رفع اولیه
Explicitly define that the `user: object` output by `AuthContext` will include a `id` or `user_id` field (e.g., `user: { id: str, email: str, username: str, ... }`) that corresponds to the primary key of the `users` table in the backend.

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