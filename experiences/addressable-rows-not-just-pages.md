---
title: "Addressable rows, not just pages — the `?focus=` primitive that stops an app feeling like islands"
tags: ["frontend", "navigation", "deep-linking", "architecture", "search", "react"]
topic_canonical: "addressable-rows-not-just-pages"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-08-02T00:00:00Z"
created_at: "2026-08-02T00:00:00Z"
updated_at: "2026-08-02T00:00:00Z"
merged_from: []
---

# Addressable rows, not just pages

## 🎯 چالش / Challenge

یک اپلیکیشنِ چنددامنه‌ای که مالکش مدام می‌گوید «همه‌چیز جزیره‌ای است» و
«هرجا را درست می‌کنم باز به جای دیگر وصل نیست». تشخیصِ اولیه معمولاً غلط
است: فرض می‌کنی پُل بینِ بخش‌ها **وجود ندارد** و می‌روی یک لایهٔ افقیِ تازه
بسازی (event bus، aggregator، داشبوردِ جدید).

اندازه‌گیری چیزِ دیگری نشان داد. پُل‌ها وجود داشتند — جستجوی سراسری، کارت‌های
«چه چیزی منتظرِ توست»، اعلان‌ها — ولی **هیچ‌کدام نمی‌گفتند کجا فرود می‌آیند**.
جستجو دقیقاً می‌دانست کاربر کدام ردیف را می‌خواهد (`task.id` در دست بود)، بعد
لینکِ `"/tasks"` می‌داد. کاربر جستجو می‌کرد، کلیک می‌کرد، وسطِ یک صفحهٔ پر از
ردیف رها می‌شد و باید همان چیز را دوباره با چشم پیدا می‌کرد.

نشانهٔ تشخیصیِ قاطع، یک `grep` بود:

```
grep -r "useSearchParams\|scrollIntoView" src/     →  صفر نتیجه
```

یعنی در کلِ برنامه، **primitive‌ای برای آدرس‌دادن به یک ردیف وجود نداشت**.
هر پُلی که کسی بسازد — قدیمی یا جدید — محکوم بود کاربر را دمِ درِ صفحه رها کند.

## 💡 راه‌حل / Solution

یک قرارداد کوچک و **قابلِ نادیده‌گرفتن**، در دو نیمه:

1. **تولیدکننده (بک‌اند):** یک تابعِ خالص که آدرسِ ردیف را به URL می‌چسباند:
   `focus_url("/tasks", "task", 12) -> "/tasks?focus=task%3A12"`.
   آن را در **نقطهٔ گلوگاه** بگذار — همان‌جا که همهٔ لینک‌ها از آن رد می‌شوند
   (تابعِ `add()` در جستجو، تابعِ `att()` در کارت‌های توجه). یک ویرایش،
   ده‌ها لینک.

2. **مصرف‌کننده (فرانت):** یک هوک که `?focus=` را می‌خواند، دنبالِ
   `[data-focus-id="kind:id"]` می‌گردد، اسکرول می‌کند و ~۲ ثانیه هایلایت
   می‌زند. صفحه با **دو خط** عضو می‌شود: هوک در کامپوننت، صفت روی ردیف.

سه ویژگی که این کار را کم‌ریسک می‌کند:

- **Ignorable.** صفحه‌ای که هنوز عضو نشده، یک query param ناشناس می‌بیند و
  دقیقاً مثلِ دیروز رندر می‌شود. پس می‌توانی **از همهٔ تولیدکننده‌ها همین امروز
  منتشر کنی** و صفحه‌ها را یکی‌یکی عضو کنی. رول‌اوتِ نیمه‌کاره هم بهتر از دیروز است.
- **Additive.** query stringِ موجود را خراب نمی‌کند، آدرسِ نامعتبر تولید نمی‌کند،
  و بدونِ id همان URL قبلی را برمی‌گرداند. پس caller می‌تواند **بدونِ هیچ شرطی**
  همهٔ لینک‌هایش را از آن رد کند.
- **یک املا برای هر ردیف.** جدولِ alias در هر دو نیمه آینهٔ هم است
  (`todo_item` → `todo`). اگر دو املا زنده بماند، `data-focus-id` نصفِ لینک‌ها را
  می‌گیرد و نصفِ دیگر بی‌صدا هیچ‌چیز را هایلایت نمی‌کند — که از خرابیِ اول بدتر است،
  چون شبیهِ کار کردن است.

## 🧪 نمونه کد (Anonymized)

```python
# backend — the whole contract
FOCUS_KINDS = ("task", "todo", "list", "note", "person", ...)
FOCUS_ALIASES = {"todo_item": "todo", "item": "todo"}   # one spelling per row

def focus_url(url: str, kind: str, id_) -> str:
    if not url or not url.startswith("/"):      # external / empty → untouched
        return url
    kind = FOCUS_ALIASES.get((kind or "").lower(), (kind or "").lower())
    if kind not in FOCUS_KINDS or id_ is None or "focus=" in url:
        return url                              # unaddressable → no-op
    return f"{url}{'&' if '?' in url else '?'}focus={quote(f'{kind}:{id_}')}"

# stamp it at the CHOKE POINT, not at each call site
def add(kind, id_, title, url):
    results.append({..., "url": focus_url(url, kind, id_)})
```

```jsx
// frontend — the other half
export function useFocusTarget() {
  const { search } = useLocation()
  const token = currentFocus(search)
  useEffect(() => {
    if (!token) return
    let tries = 0, cancelled = false
    const tick = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-focus-id="${CSS.escape(token)}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-amber-400')
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 2600)
        return
      }
      if (++tries < 40) setTimeout(tick, 150)   // rows arrive after first paint
    }
    tick()
    return () => { cancelled = true }
  }, [token])
  return token
}

// a page opts in with two lines:
useFocusTarget()                                  // in the component
<div data-focus-id={`task:${t.id}`}>              // on each row
```

## ⚠️ نکات حیاتی / Pitfalls

- **یک‌بار جست‌وجو کردنِ DOM کافی نیست.** ردیف‌ها با fetch می‌آیند؛ در اولین
  رندر بعد از ناوبری لیست هنوز خالی است. `querySelector` یک‌باره هیچ پیدا
  نمی‌کند و لینک «خراب» حس می‌شود درحالی‌که درست است. باید چند ثانیه با
  فاصله دوباره امتحان کنی — و بعد **بی‌صدا** تسلیم شوی (ردیف ممکن است پاک شده باشد؛
  یک اسپینرِ ابدی یا پیامِ خطا روی صفحهٔ سالم بدتر است).
- **`CSS.escape` را فراموش نکن** — توکن `:` دارد و در selector معنا دارد.
- **کارت‌های تجمیعی id ندارند** («۵ مورد تلنبار شده»). پارامتر را اختیاری نگه دار؛
  مجبورکردنش باعث می‌شود کسی id قلابی بسازد.
- **نوعِ غلط بدتر از نبودِ نوع است.** یک `kind` تایپی‌دار لینکی می‌سازد که هرگز
  چیزی را هایلایت نمی‌کند و از رفتارِ قبلی قابل‌تشخیص نیست. واژگان را صریح
  (allow-list) نگه دار، نه متنِ آزاد.
- **تستِ ضدجهش لازم است:** برگرداندنِ `focus_url(url, ...)` به `url` باید تست را
  قرمز کند. وگرنه فقط ثابت کرده‌ای تابع کار می‌کند، نه اینکه تولیدکننده صدایش می‌زند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

۱. **اول اندازه بگیر، بعد نتیجه بگیر.** در فرانت `grep` بزن برای
   `useSearchParams` / `scrollIntoView` / `#anchor`. صفر یعنی مشکلِ تو
   «نبودِ معماری» نیست، «نبودِ یک primitive» است — که هزینه‌اش صد برابر کمتر است.
۲. **جایی را پیدا کن که id در دست است و دور ریخته می‌شود.** جستجو، اعلان،
   ایمیلِ خلاصهٔ روزانه، بات پیام‌رسان — معمولاً همه‌شان ردیف را می‌شناسند و
   لینکِ صفحه می‌دهند.
۳. **گلوگاه را پیدا کن.** اگر یک تابعِ کمکی مشترک وجود دارد که همهٔ لینک‌ها از
   آن رد می‌شوند، تغییرِ تو یک خط است و بقیه رایگان ارتقا می‌یابند. اگر وجود ندارد،
   اول آن را بساز.
۴. **قرارداد را قابلِ نادیده‌گرفتن نگه دار** تا بتوانی تولید و مصرف را از هم جدا
   منتشر کنی. این تنها چیزی است که اجازه می‌دهد رول‌اوتِ ۴۰ صفحه‌ای نیمه‌کاره
   بماند و باز هم سودده باشد.
۵. **بعداً همین آدرس را به لایه‌های بالاتر بده.** هر کارت/جمله/بینشی که بعداً
   می‌سازی، به‌جای «برو به صفحهٔ X» می‌تواند «برو به همان چیزی که دربارهٔ آن حرف
   می‌زنم» بدهد. این پیش‌نیازِ هر لایهٔ افقی است — اول این، بعد آن.

## 🔗 References
- مرتبط: [activate-passive-pages-by-wiring-not-building]
- مرتبط: [holistic-island-audit-with-adversarial-verification]
- مرتبط: [live-architecture-diagram-from-runtime-introspection]
