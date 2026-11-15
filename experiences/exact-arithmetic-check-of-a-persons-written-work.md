---
title: "سنجشِ حسابِ نوشتهٔ یک آدم — هر دو سمتِ تساوی، عددِ گویا، و «نادرست» فقط وقتی هیچ خوانشِ طبیعی درست نیست"
tags: ["arithmetic", "validation", "parsing", "rational-numbers", "units", "tutoring", "false-positives"]
topic_canonical: "exact-arithmetic-check-of-a-persons-written-work"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-11T12:00:00Z"
created_at: "2026-11-11T12:00:00Z"
updated_at: "2026-11-15T12:00:00Z"
merged_from: []
---

# Exact arithmetic check of a person's written work

## 🎯 چالش / Challenge
یک صفحه حسابِ نوشتهٔ کاربر را خودش می‌سنجد تا حکمِ مدل را مهار کند. نسخهٔ نخست یک عبارتِ منظم بود: «عبارت = یک عدد»، با ممیزِ شناور.
همین سنجش به کارِ درستِ آدم‌ها گفت «نادرست»:

- `4/2 = 1/1 + 1/2 + 1/2` را با «۱/۱» سنجید، چون سمتِ راست را فقط تا نخستین عدد می‌خواند.
- `a×b + … = 3.6 + 2.4 + … = 8.7` را با «۳٫۶» سنجید (زنجیرهٔ تساوی).
- «با ۱/۲۰ میشه ۴/۵» (جمعِ پیاپی) را «۱/۲۰ = ۴/۵» خواند.
- «−۳ + ۴۲» را «۳ + ۴۲» خواند (منهای یونیکد).
- لغزشِ واحد (کیلوژول ⇒ کیلووات‌ساعت) را چون ضربِ عددها درست بود «درست» خواند.

سنجشی که برای مهارِ خطا ساخته شده بود خودش خطا می‌ساخت؛ و «نادرست» ِ دروغ به کارِ درستِ یک آدم بدترین خطای چنین صفحه‌ای است.

## 💡 راه‌حل / Solution
1. **تجزیه‌گرِ واقعی، نه یک عبارتِ منظم.** متن در هر «=» (و فعل‌های هم‌معنا) بریده می‌شود. از هر تکه «عبارتِ پایانی» و «عبارتِ آغازی» با یک تجزیه‌گرِ بازگشتی
   (پرانتز، توان، منهای یکانی) خوانده می‌شود و **هر دو سمت کامل** حساب می‌شوند. زنجیرهٔ `a = b = c` حلقه‌به‌حلقه سنجیده می‌شود، هر حلقه با هر عضوِ پیشین.
2. **عددِ گویا (BigInt)، نه ممیزِ شناور.** جمعِ کسرها دقیق است. تنها رواداری از **نوشتهٔ خودِ او** می‌آید: مقدارِ دقیق باید در همان تعداد رقمی که نوشته به عددش
   گرد یا بریده شود (`s − ½u ≤ v < s + u`). عددی که خودش گرد کرده («حدودِ ۰٫۲۹») در حسابِ بعدی یک بازه است، نه یک نقطه.
3. **عدمِ تقارنِ خطا.** «نادرست» فقط وقتی که هیچ خوانشِ طبیعیِ همان نوشته درست درنیاید. خارج‌قسمتِ صحیح («۱۴ تقسیم بر ۵ میشه ۲») یک خوانشِ درست است.
4. **ابهامِ واقعی ⇒ سکوت.** اگر خوانشِ دوم درست و خوانشِ اول نادرست است («۱/۲ + ۱/۳ = ۲/۵»: کسر یا ممیز؟)، صفحه نه «درست» می‌گوید نه «نادرست».
5. **فقط عبارتِ عددیِ محض.** همسایهٔ عبارت وارسی می‌شود: حرفِ لاتینِ چسبیده، پرانتزِ نمادین، نامِ تابع («جذرِ»، `sin`)، «نصفِ»، «۳ تا ۵»، «۲ سوم»، ساعت و تاریخ
   ⇒ خوانده نمی‌شود. عدد در برابرِ عدد (`n = 12`) هیچ ادعایی نیست.
6. **واحد جدا از عدد.** تبدیل، جمعِ ناهم‌واحد، ضریبِ گفته («یه متر صد میلی‌متره») و ضربِ دو کمیتِ واحددار با بُعد سنجیده می‌شوند. واحدی که صفحه نمی‌شناسد
   «نسنجیده» است: نه «درست»، نه «نادرست».
7. **پیامِ کنارِ حکم با حکم نمی‌جنگد.** کنارِ «✗» واژهٔ «درست» نمی‌آید؛ می‌گوید کدام حساب را سنجید و ایراد آن‌جا نیست.
8. **حسابِ نقل‌شده خطای تازه نیست.** «دوستم نوشته بود ۷×۸ = ۵۴ که غلطه» و «قبلاً نوشته بودم … که غلط بود» کنار می‌روند.

## 🧪 نمونه کد (Anonymized)
```js
// accept her written value s (u = one unit of her last digit) for the exact value v
function near(v, s, halfU) { return cmp(v, sub(s, halfU)) >= 0 && cmp(v, add(s, add(halfU, halfU))) < 0; }

// one link of a chain: compare with every earlier member; other natural readings ⇒ say nothing
for (i = 1; i < segs.length; i++) {
  var L = trailingExpr(segs[i - 1]), R = leadingExpr(segs[i]);
  if (!L || !R) { members = []; continue; }
  members = chainContinues ? members.concat([L]) : [L];
  if (R.single && members.every(isSingleLiteral)) continue;          // "n = 12" claims nothing
  var ok = members.some(function (m) { return agree(m, R); });
  if (!ok && agreeUnderOtherReading(segs[i - 1], segs[i])) continue;   // ambiguous ⇒ silent
  out.push({ expr: L.text, said: R.text, ok: ok });
}
```

## ⚠️ نکات حیاتی / Pitfalls
- یک رواداریِ ثابت (`1e-9` یا نیم‌واحدِ قراردادی) هم جمعِ نادرست را می‌پذیرد هم درست را رد می‌کند. دقت را از رقم‌های نوشتهٔ خودِ آدم بگیر.
- خوانشِ جایگزین را هرگز به «درست» تبدیل نکن: «/» ِ ممیز دقیقاً رایج‌ترین خطای جمعِ کسر را درست نشان می‌دهد.
- منهای چسبیده به عددِ بعد و جدا از عددِ پیش («۲۴ −۳ + ۴۲») علامت است، نه تفریق.
- خطِ تیرهٔ بی‌فاصله میانِ دو عدد بازه است («۱۰–۲۰»)، نه منها.
- حرفِ اضافه پیش از عددِ تنها («با ۱/۲۰ …») یعنی ادامهٔ حسابِ پیشین؛ بی عددِ پیشین چیزی نگو.
- نقلِ یک گام را در **کلِ پیام** بسنج تا عددِ پیشین، عددِ گردشده و واحدِ هر عدد در دسترس باشد.
- آزمونِ منفی بنویس: معادله با مجهول، هم‌نهشتی، تاریخ، ساعت، نتیجهٔ بازی، مقیاسِ نقشه، مبنای دیگر.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- هر جا ماشینی کارِ نوشتهٔ آدم را داوری می‌کند (نمره‌دهی، فاکتور، فرمِ مالی): اول بپرس «کدام خطا گران‌تر است؟» و حالتِ سوم («نسنجیده») را بساز.
- متن را به واحدهای معنادار (تساوی، کمیت) ببُر و هر واحد را با تجزیه‌گر بخوان؛ عبارتِ منظمِ سراسری نه.
- مقدار را دقیق نگه دار (کسر، عددِ صحیحِ بزرگ، اعشارِ ده‌دهی) و رواداری را فقط از دادهٔ خودِ ورودی بگیر.
- برای هر الگوی مثبت یک «شبیهِ منفی» در آزمون بگذار؛ بانکِ مستقل از نویسندهٔ کد بهتر است.
- خروجی را شفاف کن: بگو دقیقاً چه چیزی با چه چیزی سنجیده شد، تا آدم خطای ماشین را ببیند.

## 🔗 References
- منبع اولیه: گزارش‌های یک دورِ آزمونِ سناریویی (پنج اجراکننده) و بانکِ مستقلِ ۵۸ موردی.
- مرتبط: [model-reports-state-page-validates], [two-sided-needs-judging-for-scenario-tours]

## Update 2026-11-12
یک دور آزمونِ بعد، همان سنجش دو خطای تازه داشت، هر دو از «خواندنِ بیش از نوشته»:

- **واژهٔ کنارِ عدد را در عدد ضرب کرد.** «۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون» یعنی ۲۱٫۹۶ در برابرِ ۲۱٬۹۶۰٬۰۰۰ ⇒ «نادرست» به کارِ درست. واژهٔ مقیاس و واحد **واحدِ** نتیجه است، نه عاملِ آن.
- **رواداریِ گرد کردن را به تساویِ دقیق داد.** «۱/۲ + ۱/۳ + ۱/۴ = ۱» چون ۱۳/۱۲ به «۱» گرد می‌شود «درست» خوانده شد.

### 💡 آنچه افزوده شد
1. **چند خوانشِ سازگار، نه یک خوانشِ عینی.** برای واژهٔ مقیاس دو خوانش بسنج: عینی، و «همه در یک مقیاس» (جمله‌ای که واژه ندارد در مقیاسِ نتیجه است). هر کدام بخواند ⇒ درست.
   هیچ‌کدام نخواند و فقط توانِ هزار فرق دارد ⇒ بپرس. عددها در هیچ خوانشی نخوانند ⇒ نادرست — واژه لغزشِ واقعی را نمی‌پوشاند.
2. **رواداری فقط جایی که خودش نشانه‌اش را نوشته.** رقمِ اعشار یا «≈/حدود» یعنی «گرد کرده‌ام». عددِ صحیحِ بی‌نشانه برای مقدارِ ناصحیح: اگر عبارت جمعِ کسرهاست نادرست است؛
   وگرنه نه درست است نه نادرست.
3. **حالتِ سوم بساز.** «درست / نادرست» کم است. «نه این نه آن — مقدارِ دقیق این است، بپرس» و «نسنجیده» دو خروجیِ صادقانه‌اند؛ سکوت روی سطری که عملگر و نتیجه دارد
   خروجیِ صادقانه نیست، چون خواننده آن را «مشکلی نبود» می‌فهمد.
4. **فعلِ «می‌شود» تساوی نیست.** «با n = 4 می‌شود 1+3+5+7 = 16»: عددِ پیش از فعل شرط است. «۱×۲ می‌شود ۲×۳»: تبدیل است. فقط «حساب می‌شود عدد» ادعاست.
5. **مقدارِ ماشین به شکلِ نوشتهٔ آدم.** درصد را درصد، اعشار را اعشار (یک رقم بیشتر، همان رقمی که نشان می‌دهد چرا نمی‌خواند)، با همان واژهٔ مقیاس. کسرِ خام برای کسی که
   اعشار نوشته ناخواناست.
6. **برچسبِ علت را از شاهد بگیر.** «خطای واحد» فقط وقتی عددِ بی‌تبدیل همان نوشتهٔ اوست. وگرنه لغزشِ حساب است.
7. **حکمِ ماشین اعتراض‌پذیر باشد.** وقتی آدم می‌گوید «درست حساب کردم»، همان نوشته را یک بار دوباره بسنج و هر دو حساب را کنارِ هم نشان بده. خواند ⇒ حکم را در **همهٔ** جاهایی
   که نشسته بردار، با تاریخچه. نخواند ⇒ حکم بماند، با شاهد، و بحث حلقه نشود. بی حکمِ روی میز، «درست حساب کردم» فقط یک جمله است.

8. **پیکرهٔ واقعی را با نسخهٔ پیشین و تازه بخوان و فقط تفاوت‌ها را نگاه کن.** آزمون‌های دست‌ساز و حتی بانکِ مستقل چهار بدخوانی را ندیدند که پویشِ ۹۷۲ پیامِ واقعی در چند
   ثانیه نشان داد (واژه‌ای که هم نامِ تابع است هم نامِ کمیت؛ عددِ مرکبِ «۱۶ میلیون و ۶۴۰»؛ عددی که هم نتیجهٔ تساویِ پیش است هم آغازِ حسابِ بعد؛ حرفِ تنهایی که مجهول است نه واحد).
   برای هر تغییرِ خوانندهٔ متنِ آدم‌ها، خروجی سه فهرست است: حکم‌های نادرستی که رفتند، حکم‌های تازه (هر کدام را با چشم ببین)، و سطرهای «داوری نکردم».

### 🔄 How to Apply Elsewhere (افزوده)
- هر جا واژه‌ای کنارِ عدد است (مقیاس، واحد، «برابر»، «تا»)، اول بپرس «این واحد است یا عامل؟» و هر دو خوانش را بسنج.
- رواداری را به **نشانهٔ نوشته‌شده** ببند، نه به نوعِ عدد.
- برای هر سنجشِ خودکار سه خروجی طراحی کن: تأیید، رد، و «داوری نکردم». خروجیِ سوم باید دیده شود.
- حکمی که ماشین می‌دهد یک راهِ بازسنجی و یک جای واحد برای برداشتن می‌خواهد؛ وگرنه گفت‌وگو و دفتر دو روایت می‌شوند.
- پیش از ادغام، نسخهٔ پیشین و تازه را روی همهٔ متن‌های واقعیِ موجود اجرا کن و تفاوت‌ها را یکی‌یکی بخوان.

## Update 2026-11-15
- **A reading the reader had to invent is a question, not a ✓.** Reading every unscaled number "in the same scale" made «۳۰۰ + ۲۰ میلیون ÷ ۴۰ = ۸۰۰ هزار»
  agree, but only by a reading the text does not state. Rule that held: the standard reading (each word on its own number) decides ✓/✗; a reading
  that only works by moving a word is shown and asked — unless the person wrote that very number with that word elsewhere in the same message.
- **"Neither ✓ nor ✗" must be narrow, or it hides slips.** The question state is only for an integer that is the rounding or the truncation of
  the exact value; any other integer is ✗. A fraction written as a fraction («۱۳/۱۲ = ۱») is an identity, so ✗; the same numbers with «÷» are a quotient.
- **A question needs a place for its answer.** Store the open question with the message number; read only the next message's yes/no; record
  the answer (approximate ✓, or ✗ that can itself be contested). A reply that is neither leaves the question open and records nothing.
- **A re-check that upholds a ✗ must still not leak the answer:** say it was re-checked once and point at the link that does not read.

## Update 2026-11-15 — normalization must keep length when positions are shared
- **What happened:** one fixer made the checker replace «÷» with « / » (three characters) during normalization, so a spaced division is never read as a glued fraction. The checker reports `pos/pe` for every check against the *normalized* text. Another fixer, working at the same time, used those positions to slice the *original* text (to bind a unit conversion such as «6131 s, about 102 min»). Each branch was green alone. After the merge, every check after a «÷» was shifted by two characters, the conversion bound to the wrong number, and a correction stopped reaching the steps built on it.
- **Rule:** if a normalizer's offsets are consumed by anyone, every rewrite must keep the length (map a symbol to a single character and give the tokenizer the meaning — e.g. keep «÷» and tokenize it as a spaced «/»), or the normalizer must return an offset map. Add a test that asserts `text.slice(pos, pe)` on the *original* string for a sentence containing each rewritten symbol.
- **Finding it:** when an integrated build fails a test that each branch passed, apply only the source diff of each other branch onto the failing branch one at a time (`git diff base X -- src | git apply -3`), skipping docs and bundles. The first one that turns the test red is the cause; then compare the shared function's output (here `pos/pe`) with and without it.
