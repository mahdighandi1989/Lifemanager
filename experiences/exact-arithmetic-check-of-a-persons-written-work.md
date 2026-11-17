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

## Update 2026-11-15 — a word operator has two readings; an answer binds only to a line waiting for it (round 27)
- **What happened:** «با ۴ و ۶ میشه ۲۴» (after «۵×۵=۲۵») was read only as a sum and shown ✗ — correct work shown wrong. Separately, a pending «did you round?» question was silently dropped whenever a newer question was registered, and quoted work of another person was hidden; so «yes, I rounded that 14» bound to the brother's false identity «13/12 = 1» and stored it as "approximate and correct".
- **Rule 1 (ambiguous operator):** when the person's operator word admits two readings, compute both. First reading fits ⇒ ✓; only the second fits ⇒ ask which she meant; neither ⇒ ✗. Never ✗ while one reading fits.
- **Rule 2 (answer binding):** a pending question stays open until answered. An answer binds by what it names (a number she repeats); a bare "yes" binds only to the question of the immediately preceding message; lines by another person and exact identities never wait for her answer; several candidates ⇒ ask "which one?" and store nothing.
- **Rule 3 (attribution):** quoted work of another person is checked and shown, marked as theirs — not hidden (hiding it is what let the false binding happen) and not booked as hers. Only a strong verb (wrote / computed) opens the span; a weak verb (said) counts only with a number after it in the same sentence; a first-person verb ("I wrote for my brother") is hers.
- **Rule 4 (closed forms are arithmetic, not convention):** an ellipsis sum is exact when the written terms fix an arithmetic progression (first two and last); anything else stays "not checked".
## Update 2026-11-15 (round 27, prior) — a re-check is a recomputation, and a hypothetical is not a dispute
**What happened.** A person asked «if the page one day misreads my correct sum, how would I know?» The dispute detector matched «the error is the page's»
inside that conditional sentence, re-checked an old ✗ against a stored copy of her message that had been clipped to 600 characters, did not find the
calculation there, and announced «1700 seconds = 17 minutes — re-checked, correct» (exact: 28.3 minutes). She had already fixed that step herself.

**Rule.** (1) Strip hypothetical sentences («if … ?», «so is this right too?») before reading a message as a dispute or a correction — same length, so no
other reader's offsets move; a fact stated later in the same message still counts. (2) A re-check must re-read the same expression from the full source and
find it correct; «not found» is «not checked», never «correct». (3) A verdict the person already fixed herself is no longer on the table.

### How to Apply Elsewhere
Any verify-on-demand path (re-check, appeal, retry) must recompute from the complete original input and treat a missing reading as unknown, never as a pass;
and intent detection must not fire on words inside a conditional or a question about the system itself.

## Update 2026-11-16 (round 27B, leftovers) — an offset map instead of length tricks; two readings decide only when the verdict depends on them
**What happened.** After the 2026-11-15 rule, the new rewrites kept their length, but the older ones («درصد ⇒ %», «میشه ⇒ ＝», «ضرب در ⇒ *»,
thousands separators, «…») still shortened or lengthened the text, so every `pos/pe` after such a word pointed a few characters off in her own text.
Separately, «۲ میلیون و ۸۰۰ ÷ ۸ = ۳۵۰ هزار» has two readings of the bare «۸۰۰» (units or thousands); the reader used the first one and gave ✗.
And the stale engine had its own little lexer that stopped at «میلیون», so a correction never reached «۲ میلیون و ۸۰۰ هزار ÷ ۸».

**Rule.** (1) Make the normalizer return a position map (every rewrite records, for each output character, the input character it came from) and translate
every reported offset back before returning it; the normal form itself stays byte-identical, so no consumer of the text changes. This is safer than
padding each rewrite, because some rewrites (removing a thousands separator inside a number) cannot keep their length. (2) A phrase with two readings
is resolved by the written result: exactly one reading fits ⇒ use it; one reading fits only up to scale or rounding ⇒ ask which was meant; no reading
fits ⇒ the verdict is ✗ in every reading, so say ✗ and show the value of each reading. (3) A second reader of the same text (here the stale engine)
must parse the same shapes (magnitude words, compound amounts) or it silently drops relations the first reader sees; when it cannot reconcile the
result's scale, it records no relation rather than guessing one.

### How to Apply Elsewhere
Any pipeline that normalizes text and reports spans should carry an index map through every substitution and convert spans at the boundary; and any
ambiguity resolver should ask only when the outcome actually depends on the reading, never when every reading gives the same verdict.

## Update 2026-11-17 (Pólya round 29, «prior») — one judge per line; a weaker second reader may only say «unchecked»; never quote a text the person did not write

**Challenge.** A ledger of the person's earlier steps re-checked her corrected step with a second, scale-blind reader after the exact engine had
already accepted it: «8 million minus 6 million and 150 is 1 million and 850» was ✓ in the engine and «still does not read» four times in the
ledger (the light reader saw 1 and 850; the engine's own stored value for a compound amount was not even a usable number). Two more failures came
from the same layer: the page substituted the corrected datum into an old step («5.5 m by 4 m = 20»), failed to read it, and showed it as «your new
text»; and every later message that merely shared a word («metre») was taken as a new attempt at that step. Separately, a reason string split on
commas and «and» and re-joined with commas looked «changed» to a diff, which stamped «the earlier reason no longer holds» on untouched steps.

**Rule.** (1) Each arithmetic claim has one judge: match the old wrong calculation to the new text by the judge's own key (its normalized
expression), and take the judge's verdict. A lighter reader may confirm or add «unchecked»; it never rejects, and a value is evidence only when it is
the plain number the person wrote. (2) A text the system built (substitution, template) is never attributed to the person; if it does not verify,
mark the step «needs recomputation», not «your attempt failed». (3) A step waiting for recomputation accepts only a recomputation containing the new
value; word overlap is not attribution. (4) When a derived string is «the original minus some clauses», return the original byte-for-byte when no
clause is dropped, and never split inside a quantity («2 million and 850»).

### How to Apply Elsewhere
Any system with more than one validator for the same user claim should route the verdict through one authority and let the others only annotate;
diff-based «changed» markers must compare like with like (return the source unchanged when the transform is a no-op), and any text shown as «yours»
must be traceable to the user's own input.
