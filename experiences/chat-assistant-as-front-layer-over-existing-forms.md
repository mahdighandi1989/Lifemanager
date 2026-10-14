---
title: "دستیارِ گفت‌وگو به‌عنوانِ لایهٔ جلو روی فرم‌های موجود — اشراف از ثبت‌گاه‌ها، کار از راهِ خودِ فرم‌ها، کمبود ⇒ برگهٔ فوری"
tags: ["ai", "assistant", "ux", "frontend", "agentic-ui", "registries"]
topic_canonical: "chat-assistant-as-front-layer-over-existing-forms"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-14T20:00:00Z"
created_at: "2026-10-14T20:00:00Z"
updated_at: "2026-10-14T20:00:00Z"
merged_from: []
---

# Chat assistant as a front layer over existing forms

## 🎯 چالش / Challenge
یک برنامهٔ پرشاخه (ده‌ها نما، فرم‌های چندمرحله‌ای) حتی با لایهٔ راه‌یابی برای صاحب‌کار گیج‌کننده بود. او یک گفت‌وگوی شناور خواست که
بفهمد چه می‌خواهد، به بخشِ درست ببرد، فرم را از حرف‌هایش پر کند و باقی را نشان دهد، عکس/فایل بخواند، سشن و فولدرِ درایو داشته باشد،
حرفِ نامربوط را رد کند، و اگر برنامه کاری را بلد نیست خودش یک درخواستِ فوری برای روال‌های نگه‌دارنده ثبت کند — و اشرافش با هر ارتقا خودبه‌خود کامل‌تر شود.

## 💡 راه‌حل / Solution
1. **لایهٔ جلو، نه مسیرِ دوم:** دستیار هیچ API ِ نوشتنِ جدایی ندارد؛ فیلد را با setter ِ بومیِ `value` و رویدادهای `input`/`change` پر می‌کند
   (همان ذخیره و اعتبارسنجیِ دستی)، دکمه را کلیک می‌کند، فایل را با `DataTransfer` در ورودیِ فایلِ فرم می‌گذارد. برنامه بی‌چت هم کامل است.
2. **اشراف از ثبت‌گاه‌ها:** نقشهٔ سامانه هر بار از همان ثبت‌گاه‌هایی ساخته می‌شود که برنامه از آن‌ها ساخته شده (جدولِ نماها + فرادادهٔ
   «چیست/چرا»، منوها، مسیرهای کاری، واژه‌نامه، کاتالوگ‌ها، دادهٔ خودِ کاربر با شناسهٔ بازکردن) + **پویشِ DOM ِ همین لحظه** که به هر فیلد/دکمهٔ
   دیدنی یک کلیدِ کوتاه (`data-ai-k`) و برچسب می‌دهد. آزمون: هر نما در نقشه هست و نمای تازه خودکار می‌آید.
3. **پروتکلِ JSON ِ کوچک:** `reply, title, pinned, memory, steps[], status(related|unrelated|gap), actions[go|fill|highlight|click|attach], gap{…}`.
   پس از `go` یک نوبتِ خودکار با پویشِ نمای تازه (سقفِ ۲) تا مدل فیلدهای واقعی را ببیند و پر کند.
4. **حافظهٔ ارزان:** خلاصهٔ انباشته (`memory`) که مدل هر بار کامل برمی‌گرداند + خواستهٔ سنجاق‌شده + ۱۲ پیامِ اخیر؛ در همهٔ ارائه‌دهنده‌ها یکسان.
5. **کارِ AI ِ جدا** («سریع» و ارزان، سنجاق‌شدنی) برای چت؛ کارِ عمیق با دکمه‌های AI ِ خودِ بخش‌ها. پرامپت: کوتاه، یک پرسش، فقط از حرفِ کاربر پر کن، داوری نکن.
6. **کمبود ⇒ برگهٔ فوری با ساختار:** نیازِ انتزاعی (نه تکرارِ مسئلهٔ کاربر)، چه کم است، کجا، چطور، پیوندها، مستنداتی که باید به‌روز شوند، بندِ
   هماهنگی با روال‌های دیگر و نشانِ «ثبت‌شده توسط دستیار» تا روال‌ها برداشتش را بسنجند؛ کلیدِ نرمال‌شدهٔ عنوان جلوی تکرار را می‌گیرد.
7. **سشن = رکورد** با فولدرِ خودش برای پیوست‌ها و آینهٔ متنِ کامل.

## ⚠️ نکات حیاتی / Pitfalls
- نقشهٔ سامانه بزرگ می‌شود: آن را در بخشِ «کاربر» بگذار (سقفِ بزرگ‌تر) و آزمونِ سقف بنویس؛ پیامِ سیستم با ۲۰هزار نویسه زود پر می‌شد.
- پس از رسمِ دوبارهٔ نما کلیدهای DOM کهنه می‌شوند ⇒ امضا (نوع + برچسب) نگه دار و دوباره پیدا کن، حدس نزن؛ کلیدِ ناشناخته را گزارش کن.
- هرگز دکمهٔ برگشت‌ناپذیر (حذف/پاک/بایگانی) را خودکار نزن؛ قرارداد: چنین دکمه‌ای این واژه‌ها را در متنش داشته باشد.
- در حالتِ میزبان، نماها تا رسیدنِ داده‌ها رسم نمی‌شوند — آزمونِ بدلی باید `loaded` را هم بگذارد، وگرنه پویش خالی است.
- `status=unrelated` ⇒ هیچ کاری اجرا نشود، حتی اگر مدل کاری فرستاد.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- هر برنامهٔ فرم‌محور با «جدولِ نماها/مسیرها»: دستیار را روی همان جدول بساز، نه روی فهرستِ دستی؛ نمای تازه = یک ردیفِ فراداده.
- فرم‌ها را برچسب‌دار و رویدادمحور نگه دار؛ همین، دستیار را بی‌کدِ اضافه به فرمِ تازه می‌رساند.
- «نمی‌توانم» را به ورودیِ روالِ نگه‌دارنده تبدیل کن (برگه/issue با انتزاع و جای افزودن)، با نشانِ منشأ و ضدِ تکرار.
- آزمون‌ها با هوشِ بدلیِ صف‌دار (پاسخ‌ها از پیش نوشته، یکی تابعِ متنِ پیام برای برداشتنِ کلیدهای واقعی) و یک e2e با سرورِ واقعی برای مسیرِ گزارش.

## Update 2026-10-14 — second, line-by-line audit (bugs that only show in a real run)
- **Keys die with the page.** If one answer has `go` and then `fill k…`, those keys belong to the OLD page — skip every key action after a `go` in the same batch and let the automatic next turn (fresh scan) fill the new page.
- **Same label twice** («پاسخ», «پاسخ»): re-find a stale key by tag + label + **ordinal**, never by label alone.
- **Label = the label's own text.** A `<select>` inside a `<label>` made the label «نوع —خبر…باور خودم» (all options) — clone the label and drop controls before reading text.
- **Closed `<details>`:** newer Chrome lays the content out (content-visibility), so ask «inside a closed details?» directly; open it before filling.
- **Owner decisions are not form steps:** «بپذیر / رد کن / تأیید / ریشه را تأیید کن» are highlighted, never clicked; deletes likewise.
- **A click that grows the form** (+ row) needs a fresh scan and another turn, like a navigation.
- **Non-JSON answers** become a plain reply after one retry — never an error the user has to retry.
- **History by budget, not by count:** everything that fits (newest kept), the cumulative `memory` for the rest; never duplicate the new message into the history.
- **Files:** every format goes to the server reader (full text + manifest shown in chat); a `reread:[ids]` field lets the model ask for a past file again.
- **Phone:** after marking fields, the bottom sheet steps aside so the marks are visible.
- **Empty sessions** must not pile up from repeated «＋».
