# TO-DO — task 3cc09436 — مدیریت پروفایل افراد و تحلیل رفتاری

سشن قبلی دامنهٔ «پروفایل + تحلیل رفتاری» را با مدل `Person` + `/api/persons`
CRUD + مدل‌های `Interaction`/`AIAssessment`/`UserComment`/`BehaviorLog`
پیاده کرد (۱۴ تست). نام‌گذاری با ACهای کانونیک فرق دارد (Person به‌جای
PersonProfile، /api/persons به‌جای /api/people-profiles).

این سشن: **AC3** (`AIService.analyze_person_behavior` — امتیازدهی رابطه از روی
interactionها، خروجی `ai_score` + `relationship_type`) ✓ با ۳ تست.

موارد باقی‌مانده:

## اولویت‌بندی‌شده
1. **[MEDIUM] هم‌ترازی نام‌گذاری endpoint/مدل (AC1/4/5/6).** یا alias
   `/api/people-profiles` برای `/api/persons` اضافه شود + فیلدهای
   `ai_score`/`relationship_type` روی پاسخ، و `POST /people-profiles/{id}/analyze`
   که `analyze_person_behavior` را صدا بزند؛ یا تصمیم بگیرید نام `persons`
   حفظ شود (و AC را معادل بپذیرید).
2. **[MEDIUM] رابطهٔ Many-to-Many بین Person و Task (AC2).** جدول واسط
   `person_tasks` + relationship.
3. **[LOW] فرانت‌اند (AC7/AC8/AC9).** صفحهٔ `/people-profiles` (لیست)، فیلد
   انتخاب افراد در فرم Task، و طراحی کاربرپسند (JSX).

---
**به‌روزرسانی (frontend):** صفحهٔ مربوطه ساخته و به Sidebar/نویگیشن وصل شد و تست دارد. موارد باقی‌مانده در این فایل صرفاً backend/infra/تصمیم هستند.
