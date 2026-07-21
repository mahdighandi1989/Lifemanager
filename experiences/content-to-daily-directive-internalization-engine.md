---
title: "Turning static content into a daily-directive internalization engine (extract → command → follow-up → graduate)"
tags: ["habits", "internalization", "daily-loop", "ai-with-heuristic-fallback", "background-loop", "spaced-repetition"]
topic_canonical: "content-to-daily-directive-internalization-engine"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-21T00:00:00Z"
created_at: "2026-07-21T00:00:00Z"
updated_at: "2026-07-21T00:00:00Z"
merged_from: []
---

# Content → Daily-Directive Internalization Engine

## 🎯 چالش / Challenge

کاربر انبوهی محتوای مکتوب دارد (لیست‌ها، نوشته‌ها، آرزوها) که «بایگانیِ
خوانده‌نشده» است. خواسته این نیست که گم نشود؛ خواسته این است که این‌ها به یک
موتور تبدیل شوند که **هر روز فرمان بدهد، پیگیری کند، و کم‌کم در فرد حل/نهادینه
شود** — بدون اینکه لازم باشد دونه‌دونه خوانده شوند — و هرچیز تازه هم خودش وارد
همین چرخه شود. یعنی گذار از «ذخیره» به «اجرا + درونی‌سازی».

## 💡 راه‌حل / Solution — حلقهٔ شش‌مرحله‌ای

1. **استخراج (extract):** محتوای خام → «فرمانِ زنده» (یک تمرین/تعهدِ
   تکرارشونده با فعلِ امری). از AI برای بازنویسی + برچسبِ دامنه/cadence استفاده
   کن، **ولی یک هیوریستیکِ قطعی به‌عنوان fallback بگذار** (کلیدواژه→دامنه،
   پیش‌فرض daily). این‌طور سیستم بی‌AI هم کار می‌کند و تست‌ها مسیرِ قطعی را
   می‌زنند. هر فرمان `source_type/source_ref` نگه می‌دارد (رهگیری‌پذیر،
   ساختگی نیست) و به‌صورت `proposed` ساخته می‌شود تا کاربر یک‌بار تأیید کند
   (برنامه حرفِ خودش را در دهانِ کاربر نگذارد).
2. **فرمانِ روزانه (surface):** هر روز فقط **N فرمان** انتخاب کن، نه همه. امتیاز =
   due + neglected + weight + **weak-first** (کم‌قوت‌تر جلوتر، برای «هل‌دادن»).
   انتخاب را **قطعی** کن (tie-break با id) تا preview وب و مجموعهٔ persistشده و
   پوشِ تلگرام همه یکی باشند. مجموعهٔ روز را **یک‌بار** به‌شکل ردیف‌های check-in
   ذخیره کن (یکتا per (directive, local-date)) تا همه‌جا یک‌دست بماند.
3. **پیگیری (follow-up):** done و miss. done: streak++ و strength += gain؛ miss:
   streak=0 و strength -= penalty.
4. **سویپِ شبانه:** هر فرمانِ surface‌شده که بی‌پاسخ ماند = جاماندن (لحنِ سخت‌گیر
   «جاماندن‌ها واضح»).
5. **فارغ‌التحصیلی (graduate):** وقتی strength≥آستانه و streak≥آستانه، وضعیت را
   `graduated` کن و دیگر surface نکن — «در فرد حل شد» و جا برای بعدی باز می‌شود.
   این همان چیزی است که «بدون اینکه دونه‌دونه بخوانی» را ممکن می‌کند: عادت‌های
   جاافتاده از صف خارج می‌شوند.
6. **جذبِ خودکار (auto-intake):** هر متنِ تازه (نوشتهٔ نو، آرزوی تایپ‌شده، آیتمِ
   صندوق ورودی) با همان استخراج به فرمانِ نو تبدیل می‌شود (dedupe با عنوانِ
   نرمال‌شده).

«لحنِ مربی» را یک preset بساز (strict/balanced/gentle) که فقط چند عدد را عوض
می‌کند: `daily_count`, `gain`, `penalty`, `grad_strength`, `grad_streak`. همه در
یک blobِ تنظیمات تا از UI بدون تغییرِ کد تنظیم‌پذیر بماند.

```python
def _score(d, today):           # weak-first, due-first, deterministic
    return (is_due(d, today), neglect_days(d, today), d.weight, 100 - d.strength, -d.id)

async def mark(db, id, done, cfg):
    d = await get(db, id)
    if done and last_answer(d) is not True:
        d.streak += 1; d.times_done += 1
        d.strength = min(100, d.strength + cfg["gain"]); d.last_done_at = now()
    elif not done and last_answer(d) is not False:
        d.streak = 0; d.times_missed += 1
        d.strength = max(0, d.strength - cfg["penalty"])
    if d.status == "active" and d.strength >= cfg["grad_strength"] and d.streak >= cfg["grad_streak"]:
        d.status = "graduated"     # «در فرد حل شد»
```

## ⚠️ نکات حیاتی / Pitfalls

- **انتخابِ روز را قطعی و یک‌بار-persist کن.** اگر هر صفحه‌لود دوباره انتخاب و
  surface کند، مجموعهٔ روز می‌لغزد و پوشِ تلگرام با وب فرق می‌کند. یک surfacerِ
  معتبر (حلقهٔ روزانه یا endpoint /today با persist) + preview های read-only.
- **timezone را در «روزِ محلی» جدی بگیر.** همهٔ مرزهای روز (surface، مقایسهٔ
  «امروز»، سویپِ شب) باید با offsetِ محلی حساب شوند وگرنه یک تیک در ساعتِ مرزی به
  «فردا» می‌افتد و سویپِ شب صفر می‌شود. (همین باگ اول در تست‌های خودِ ما ظاهر شد:
  UTC 21:00 + آفستِ +۴ = فردا.)
- **AI اختیاری، هیوریستیک اجباری.** هیچ‌وقت حلقهٔ روزانه را به یک مدلِ پیکربندی‌شده
  گره نزن؛ fallbackِ قطعی هم کیفیتِ قابلِ‌قبول می‌دهد و هم تست‌پذیر است.
- **پیشنهاد کن، تصمیم نگیر.** استخراج را `proposed` بگذار و تأییدِ یک‌بارهٔ کاربر
  بخواه؛ برای محتوای شخصی/ارزشی، «فرمان‌سازیِ خودکار بدون تأیید» تجاوز به حساب
  می‌آید.
- **جریمهٔ toggle را مهار کن.** اگر کاربر یک روز done↔miss را عوض کند، شمارش را
  دوبار حساب نکن (وضعیتِ پاسخِ قبلیِ همان روز را نگه‌دار و اثرش را خنثی کن).
- **fail-open در باکتِ داشبورد.** وقتی این موتور را به گزارشِ «امروز» تزریق
  می‌کنی، در try/except بپیچ تا یک موتورِ خراب کلِ داشبورد را سفید نکند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. دو مدل بساز: `Directive` (فرمانِ زنده با strength/streak/status) و
   `Checkin` (یکتا per (directive, local-date)).
2. استخراج را با AI + هیوریستیکِ fallback بنویس؛ خروجی را `proposed` بگذار و
   منبع را ثبت کن.
3. انتخابِ روزانهٔ قطعیِ weak-first + persistِ یک‌بار در روز.
4. done/miss → strength/streak؛ آستانهٔ فارغ‌التحصیلی را از یک presetِ «لحن»
   بخوان.
5. یک حلقهٔ پس‌زمینه با پنجرهٔ صبح (فرمان + پوش) و پنجرهٔ شب (سویپ + پیگیری)،
   با گاردِ یک‌بار-در-روزِ محلی.
6. auto-intake را به نقاطِ ورودِ محتوای تازه (inbox/نوشتهٔ نو) وصل کن تا چرخه
   خودش را تغذیه کند.

## 🔗 References

- مرتبط: [periodic-attention-engine-cooldown-dedup] (الگوی blobِ تنظیمات + حلقهٔ stop_event + بریفِ روزانه)
- مرتبط: [idempotent-seeding-vs-user-edits] (dedupe و «فقط-وقتی-خالی» تا محتوای کاربر بازنویسی نشود)
- مرتبط: [universal-capture-inbox-with-ai-triage] (نقطهٔ ورودِ محتوای تازه برای auto-intake)
