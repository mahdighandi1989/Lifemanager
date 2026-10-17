# VARIANTS_R17 — independent variant bank (round 17)

Written from DECISIONS_R17 + the round-17 runner reports only; no source code was read. Paraphrased, not copied from the scenarios.
Every fix must pass the scenario sentence AND every entry of its mechanism here. Today = 2026-10-17 (Saturday) for all date expectations.
pos = the mechanism must fire / the stated result must happen; neg = a confusable look-alike where it must not (or must give the stated different result).
Multi-message entries use « ‖ » between messages (U = user, A = assistant). Machine-readable copy: VARIANTS_R17.json (fields rc, kind, role, text, expect, optional context).

## Counts

| mechanism | pos | neg |
|---|---|---|
| RC1.plan | 10 | 10 |
| RC1.defer | 9 | 9 |
| RC1.taste | 9 | 9 |
| RC1.register | 9 | 9 |
| RC1.guess | 9 | 9 |
| RC2.meta | 9 | 8 |
| RC2.which_guess | 9 | 8 |
| RC2.bare_label | 9 | 9 |
| RC2.anaphora | 9 | 8 |
| RC2.repeat | 8 | 8 |
| RC4 | 8 | 9 |
| RC5 | 8 | 9 |
| **total** | 106 | 105 |

## RC1 · plan vs complaint/habit/deadline (coach_state.plan {text, when})

### Positive

1. [user] <span dir="rtl">از فردا صبح هر روز ده دقیقه قبل از صبحونه می‌دوم.</span>  
   → plan stored: daily 10-min run, when=2026-10-18 (recurring)
2. [user] <span dir="rtl">تصمیم گرفتم سه‌شنبه با مدیرم درباره‌ی حقوقم حرف بزنم.</span>  
   → plan stored: talk to manager about salary, when=2026-10-20
3. [user] <span dir="rtl">پس‌فردا عصر می‌رم کتابخونه و فصل سه رو تموم می‌کنم.</span>  
   → plan stored: finish chapter 3 at library, when=2026-10-19
4. [user] <span dir="rtl">اینجانب قصد دارم از ابتدای ماه آینده هفته‌ای دو جلسه در کلاس زبان شرکت کنم.</span>  
   → plan stored (formal): language class twice a week, when=2026-11-01
5. [user] <span dir="rtl">آخر هفته می‌خوام بشینم بودجه‌ی ماه بعد رو دربیارم.</span>  
   → plan stored: draft next month budget, when=this weekend (2026-10-22/23)
6. [user] <span dir="rtl">امشب قبل از خواب سه تا مسئله‌ی استقرا حل می‌کنم، فردا بهت خبر می‌دم.</span>  
   → plan stored: solve 3 induction problems, when=2026-10-17 (tonight)
7. [user] <span dir="rtl">دیروز باشگاه نرفتم، ولی فردا ساعت ۷ حتماً می‌رم.</span>  
   → plan stored: gym, when=2026-10-18 07:00; the past clause is ignored
8. [user] <span dir="rtl">قراره از هفته‌ی بعد گوشی رو ساعت ده شب خاموش کنم؛ این دفعه جدی‌ام.</span>  
   → plan stored: phone off at 22:00, when=week of 2026-10-24
9. [user] <span dir="rtl">ان‌شاءالله تا جمعه رزومه‌م رو از نو می‌نویسم، خودم این مهلت رو گذاشتم.</span>  
   → plan stored: rewrite CV, when=2026-10-23 (self-set, not an external deadline)
10. [user] <span dir="rtl">از دوشنبه ناهار رو از خونه می‌برم که خرجم کم بشه.</span>  
   → plan stored: bring lunch from home, when=2026-10-19

### Negative (look-alike)

1. [user] <span dir="rtl">هر روز ده دقیقه می‌دوم ولی وزنم هیچ تکونی نمی‌خوره.</span>  
   → no plan: present habit + complaint, no future intention
2. [user] <span dir="rtl">هر شب به خودم می‌گم از فردا زود می‌خوابم و باز تا دو بیدارم.</span>  
   → no plan: complaint about a repeated failed resolution; at most a question, never a stored follow-up
3. [user] <span dir="rtl">هر روز لپ‌تاپ رو باز می‌کنم، یه ساعت به صفحه زل می‌زنم و می‌بندمش.</span>  
   → no plan: procrastination complaint (habit to break), no follow-up offer
4. [user] <span dir="rtl">تا پنجشنبه باید گزارش رو تحویل بدم و هنوز یه خط هم ننوشتم.</span>  
   → no plan: external deadline already under (deadline path), not her own plan; no second follow-up for the same day
5. [user] <span dir="rtl">همیشه آخر هفته‌ها سریال می‌بینم و بعدش عذاب وجدان می‌گیرم.</span>  
   → no plan: habit complaint with a time word
6. [user] <span dir="rtl">شاید یه روزی برم کلاس پیانو، معلوم نیست.</span>  
   → no plan: no real date, vague wish
7. [user] <span dir="rtl">مامانم گفته از فردا هر روز باید بیام مغازه کمکش.</span>  
   → no plan: someone else's instruction, not her own intention
8. [user] <span dir="rtl">پارسال هم گفتم از فردا ورزش می‌کنم، دو روز بیشتر دووم نیاورد.</span>  
   → no plan: past, retold
9. [user] <span dir="rtl">اگه فردا بارون نیاد، شاید برم کوه.</span>  
   → no stored plan: conditional and tentative; may only ask
10. [user] <span dir="rtl">هر روز صبح ساعت شش بیدار می‌شم و تا هشت درس می‌خونم، این برنامه‌ی همیشگیمه.</span>  
   → no plan: existing routine described (no new intention), even though it contains «برنامه» and a time


## RC1 · deferred request (coach_state.defer {what}) — text = user request, context = assistant reply

### Positive

1. [user] <span dir="rtl">یه متن کوتاه می‌خوام که برای صاحبخونه بفرستم.</span> — _context:_ <span dir="rtl">assistant: قبل از نوشتنش بگو دقیقاً چی می‌خوای ازش؛ متن رو بعد از این می‌نویسیم.</span>  
   → defer stored: letter to landlord
2. [user] <span dir="rtl">لطفاً یک جدول خلاصهٔ فرمول‌ها برایم آماده کنید.</span> — _context:_ <span dir="rtl">assistant: حتماً؛ ولی اول این تمرین را با هم ببندیم، بعد جدول را می‌دهم.</span>  
   → defer stored: formula summary sheet
3. [user] <span dir="rtl">میشه یه برنامه‌ی تمرینی هفتگی برام بچینی؟</span> — _context:_ <span dir="rtl">assistant: می‌چینم، اما اول باید بدونم چند روز در هفته وقت داری.</span>  
   → defer stored: weekly practice plan
4. [user] <span dir="rtl">دلم یه مثال حل‌شده از همین مدل می‌خواد.</span> — _context:_ <span dir="rtl">assistant: مثال رو نگه می‌دارم برای وقتی که خودت یه قدم برداشتی.</span>  
   → defer stored: worked example (request phrased as a wish, not an imperative)
5. [user] <span dir="rtl">اگه زحمتی نیست یه ایمیل رسمی برای استادم بنویس.</span> — _context:_ <span dir="rtl">assistant: فعلاً نمی‌نویسمش؛ اول بگو حرف اصلیت چیه.</span>  
   → defer stored: formal e-mail to professor
6. [user] <span dir="rtl">راستی جواب نهایی رو هم آخرش بهم بگو.</span> — _context:_ <span dir="rtl">assistant: باشه، آخرِ کار می‌گم؛ الان بیا با هم جلو بریم.</span>  
   → defer stored: final answer at the end
7. [user] <span dir="rtl">یه چک‌لیست برای مصاحبه‌ی فردا لازم دارم.</span> — _context:_ <span dir="rtl">assistant: چک‌لیست را بعد از این‌که سه نقطه‌قوتت را گفتی آماده می‌کنم.</span>  
   → defer stored: interview checklist
8. [user] <span dir="rtl">یه سؤال دیگه هم دارم: اثبات‌ها اصلاً به چه درد من می‌خورن؟</span> — _context:_ <span dir="rtl">assistant: سؤال خوبیه؛ بذار این مسئله تموم بشه، بعد مفصل جوابش رو می‌دم.</span>  
   → defer stored: answer "what are proofs good for"
9. [user] <span dir="rtl">من فقط یه متن قانع‌کننده واسه همکارم لازم دارم، همین.</span> — _context:_ <span dir="rtl">assistant: هنوز نمی‌نویسم؛ اول بگو اون مخالفِ چیه.</span>  
   → defer stored: persuasive text for colleague (no imperative verb, deferral without «بعداً»)

### Negative (look-alike)

1. [user] <span dir="rtl">یه متن قانع‌کننده می‌خوام.</span> — _context:_ <span dir="rtl">assistant: بفرمایید: «همکار عزیز، …» (full text given)</span>  
   → no defer: request fulfilled in the same reply
2. [user] <span dir="rtl">چرا این روش جواب می‌ده؟</span> — _context:_ <span dir="rtl">assistant: چون هر بار نصف حالت‌ها حذف می‌شود و …</span>  
   → no defer: question answered now
3. [user] <span dir="rtl">شاید بعداً یه جدول بخوام.</span> — _context:_ <span dir="rtl">assistant: هر وقت خواستی بگو.</span>  
   → no defer: no actual request yet
4. [user] <span dir="rtl">جواب رو نگو، فقط راهنمایی کن.</span> — _context:_ <span dir="rtl">assistant: باشه، فقط راهنمایی می‌کنم.</span>  
   → no defer: user asked to withhold; nothing promised
5. [user] <span dir="rtl">می‌خوام خودم حلش کنم.</span> — _context:_ <span dir="rtl">assistant: عالیه، شروع کن.</span>  
   → no defer: not a request for something from the assistant
6. [user] <span dir="rtl">یه رژیم غذایی برای دیابتم بنویس.</span> — _context:_ <span dir="rtl">assistant: نسخهٔ پزشکی نمی‌توانم بدهم؛ با پزشکت هماهنگ کن.</span>  
   → no defer: refused/redirected, not postponed; no promise
7. [user] <span dir="rtl">مثال بزن.</span> — _context:_ <span dir="rtl">assistant: بعد از این مثال یکی دیگه هم می‌زنم: فرض کن ۳ سیب داری …</span>  
   → no defer: example given now (the word «بعد» does not make it a promise)
8. [user] <span dir="rtl">امروز دیگه نا ندارم، بقیه‌اش باشه برای فردا.</span> — _context:_ <span dir="rtl">assistant: باشه، فردا ادامه می‌دیم.</span>  
   → no defer: user pausing the session, no requested item
9. [user] <span dir="rtl">نمی‌دونم.</span> — _context:_ <span dir="rtl">assistant: اشکالی نداره، بعداً دوباره می‌پرسم.</span>  
   → no defer: assistant postpones ITS OWN question, not a user request


## RC1 · taste vs "don't know" (coach_state.taste {text} | "unknown")

### Positive

1. [user] <span dir="rtl">بیشتر از هندسه، جبر دوست دارم.</span>  
   → taste stored: algebra over geometry
2. [user] <span dir="rtl">مسئله‌هایی که شکل دارن برام جذاب‌ترن تا اونایی که فقط عددن.</span>  
   → taste stored: visual/geometric problems
3. [user] <span dir="rtl">راستش از اثبات‌های استقرایی خوشم میاد، یه جور نظم داره.</span>  
   → taste stored: induction proofs
4. [user] <span dir="rtl">اینجانب به مسائل ترکیبیاتی علاقهٔ بیشتری دارم.</span>  
   → taste stored (formal): combinatorics
5. [user] <span dir="rtl">حالا یه کم از آمار خوشم اومده، قبلاً نه.</span>  
   → taste stored: statistics (new)
6. [user] <span dir="rtl">اونایی که به زندگی واقعی ربط دارن رو بیشتر دوست دارم، مثل حساب قسط و وام.</span>  
   → taste stored: real-life money problems
7. [user] <span dir="rtl">نمی‌دونم چرا، ولی معماهای منطقی رو از همه بیشتر دوست دارم.</span>  
   → taste stored: logic puzzles («نمی‌دونم چرا» is not "don't know my taste")
8. [user] <span dir="rtl">از هندسه بدم میاد ولی احتمال رو دوست دارم.</span>  
   → taste stored: likes probability, dislikes geometry
9. [user] <span dir="rtl">ترجیحم مسئله‌های کوتاه و سریعه، نه اون طولانی‌ها.</span>  
   → taste stored: short problems

### Negative (look-alike)

1. [user] <span dir="rtl">هنوز مطمئن نیستم چی دوست دارم.</span>  
   → taste="unknown": nothing stored, not counted as answered
2. [user] <span dir="rtl">فعلاً نمی‌تونم بگم کدوم مدل برام جذاب‌تره.</span>  
   → taste="unknown"
3. [user] <span dir="rtl">والا تا حالا بهش فکر نکرده بودم کدومو بیشتر دوست دارم.</span>  
   → taste="unknown"
4. [user] <span dir="rtl">فرقی نمی‌کنه، همه‌شون برام یه جورن.</span>  
   → no stored taste (no preference); treated like unknown
5. [user] <span dir="rtl">دوست دارم این فصل زودتر تموم بشه.</span>  
   → no taste: «دوست دارم» = a wish, not a taste for a problem kind
6. [user] <span dir="rtl">اگه دوست داری بریم سراغ مسئله‌ی بعدی.</span>  
   → no taste: addressed to the assistant
7. [user] <span dir="rtl">معلممون می‌گه هندسه قشنگ‌ترین بخش ریاضیه.</span>  
   → no taste: someone else's taste
8. [user] <span dir="rtl">باید بیشتر جبر کار کنم، امتحانش سخت‌تره.</span>  
   → no taste: a need, not a liking
9. [user] <span dir="rtl">امروز حوصله‌ی هیچی رو ندارم.</span>  
   → no taste: mood


## RC1 · register تو/شما (only from the user's own address)

### Positive

1. [user] <span dir="rtl">تو خودت چی فکر می‌کنی؟ به نظرت راهم درسته؟</span>  
   → register=تو
2. [user] <span dir="rtl">ممنون می‌شوم اگر راهنمایی بفرمایید.</span>  
   → register=شما
3. [user] <span dir="rtl">شما خودتون این مسئله رو حل کردید؟</span>  
   → register=شما
4. [user] <span dir="rtl">بگو ببینم، کجای کارم می‌لنگه؟</span>  
   → register=تو (imperative بگو, possessive ـم)
5. [user] <span dir="rtl">ببخشید، می‌شه یه بار دیگه توضیح بدید؟</span>  
   → register=شما (verb بدید)
6. [user] <span dir="rtl">داداش یه لحظه وایسا، اینو نگرفتم.</span>  
   → register=تو
7. [user] <span dir="rtl">جنابعالی فرمودید شرط اول کافی نیست؛ دلیلش چیست؟</span>  
   → register=شما
8. [user] <span dir="rtl">شما که خودت همه‌چی رو می‌دونی، بگو چیکار کنم؟</span>  
   → register=تو: colloquial «شما» with تو verbs/possessive (majority تو), no switch to شما
9. [user] <span dir="rtl">استاد گفت «شما باید فرض‌ها را بنویسید»، تو هم همینو می‌گی؟</span>  
   → register=تو: the «شما» is inside a quotation

### Negative (look-alike)

1. [user] <span dir="rtl">«شما» یا «تو»، برام فرقی نمی‌کنه.</span>  
   → no register: meta mention of both pronouns
2. [user] <span dir="rtl">سلام، مسئله‌ی امروز اینه: ۲x+۳=۱۱</span>  
   → no register: no address signs; keep whatever is current
3. [user] <span dir="rtl">توی کتاب نوشته «شما می‌توانید از روش حذف استفاده کنید».</span>  
   → no register change: «توی» is a preposition and the «شما» is quoted
4. [user] <span dir="rtl">تو این مسئله گیر کردم.</span>  
   → no register: «تو» here means "in"
5. [user] <span dir="rtl">شمارش حالت‌ها رو بلد نیستم.</span>  
   → no register: «شما» only as a substring of «شمارش»
6. [user] <span dir="rtl">به بچه‌ها گفتم شما برید، من می‌مونم.</span>  
   → no register: «شما» addressed to third parties in reported speech
7. [user] <span dir="rtl">تویوتا رو فروختم، حالا نمی‌دونم پولش رو چیکار کنم.</span>  
   → no register: «تو» substring of «تویوتا»
8. [user] <span dir="rtl">مرسی.</span>  
   → no register: nothing to infer
9. [user] <span dir="rtl">شماره‌ی تمرین ۷ رو حل کردم.</span>  
   → no register: «شما» substring of «شماره»


## RC1 · a guess that is a formula, number or claim (coach_state.guess {text})

### Positive

1. [user] <span dir="rtl">حدسم اینه که جواب میشه n(n+1)/2.</span>  
   → guess stored: n(n+1)/2
2. [user] <span dir="rtl">فکر کنم ۱/۴ − ۱/(2(n+1)(n+2)) دربیاد.</span>  
   → guess stored: the formula (no "content words" needed)
3. [user] <span dir="rtl">۳۶؟</span>  
   → guess stored: 36 (a bare number offered as possibly right)
4. [user] <span dir="rtl">احتمالاً حدود ۸۰۰ هزار تومن خرج اضافه داریم.</span>  
   → guess stored: about 800k toman
5. [user] <span dir="rtl">x=2 و y=-1 به نظرم.</span>  
   → guess stored: x=2, y=-1
6. [user] <span dir="rtl">من می‌گم 2^n − 1 حرکت لازمه.</span>  
   → guess stored: 2^n − 1
7. [user] <span dir="rtl">به گمانم مجموع زاویه‌های خارجی همیشه ۳۶۰ درجه است.</span>  
   → guess stored (claim): exterior angles sum to 360
8. [user] <span dir="rtl">a_n = 3a_{n-1} + 2 شاید؟</span>  
   → guess stored: recurrence a_n = 3a_{n-1}+2
9. [user] <span dir="rtl">اجاره‌ی بلندمدت به‌صرفه‌تره، فکر کنم.</span>  
   → guess stored (non-numeric claim)

### Negative (look-alike)

1. [user] <span dir="rtl">مسئله اینه: مجموع ۱/(k(k+1)) از ۱ تا n چند میشه؟</span>  
   → no guess: problem statement
2. [user] <span dir="rtl">کتاب نوشته جواب ۲/۳ است ولی نفهمیدم چرا.</span>  
   → no user guess: a reported answer from the book
3. [user] <span dir="rtl">n=1 رو گذاشتم، شد ۱/۲.</span>  
   → no guess: special-case data, not a proposed answer
4. [user] <span dir="rtl">حدس زدن رو بلد نیستم.</span>  
   → no guess: mentions «حدس» but offers none
5. [user] <span dir="rtl">دیروز ۸۰۰ هزار تومن خرج کردم.</span>  
   → no guess: a past fact
6. [user] <span dir="rtl">فرمول n(n+1)/2 رو از دبیرستان یادمه، ولی اینجا ربطی نداره.</span>  
   → no guess: formula mentioned and explicitly not proposed
7. [user] <span dir="rtl">سؤال ۴ صفحه‌ی ۱۲.</span>  
   → no guess: reference numbers
8. [user] <span dir="rtl">اون حدسی که دیروز زدم غلط بود.</span>  
   → no new guess: retraction only
9. [user] <span dir="rtl">ساعت ۵ کلاس دارم، بعدش ادامه می‌دیم.</span>  
   → no guess: schedule numbers


## RC2b · look-back meta-questions never become options of «کدام پرسش کمک کرد؟»

### Positive

1. [assistant] <span dir="rtl">خب، این یکی بسته شد. از پرسش‌هایی که امروز پرسیدم، کدومش بیشتر به کارت اومد؟</span>  
   → no option (look-back best-question)
2. [assistant] <span dir="rtl">پیش از این‌که بروی: کدام سؤالِ من راه را برایت باز کرد؟</span>  
   → no option (best-question, label head)
3. [assistant] <span dir="rtl">یه چیز کوچیک: از این جور مسئله‌ها خوشت میاد یا بریم سراغ یه چیز دیگه؟</span>  
   → no option (taste question)
4. [assistant] <span dir="rtl">حالا که تمام شد، بگو کدام نوع مسئله را بیشتر دوست داری: هندسی یا جبری؟</span>  
   → no option (taste question)
5. [assistant] <span dir="rtl">آفرین. یک پرسشِ آخر: کدوم پرسشم بیشتر کمک کرد؟ اگه خواستی فردا ادامه می‌دیم.</span>  
   → no option (best-question)
6. [assistant] <span dir="rtl">- آخرِ کار: جواب بین ۰ و ۱ است؟ از پرسش‌هایی که این مدت پرسیدم، کدوم بیشتر به دردت خورد؟</span>  
   → option «جواب بین ۰ و ۱ است؟» only; the glued look-back question is excluded
7. [assistant] <span dir="rtl">کدام‌یک از سؤال‌ها برایت مفیدتر بود، اولی درباره‌ی مجهول یا دومی درباره‌ی حالت خاص؟</span>  
   → no option (best-question with choices)
8. [assistant] <span dir="rtl">راستی، از کدام شاخهٔ ریاضی بیشتر لذت می‌بری؟</span>  
   → no option (taste question)
9. [assistant] <span dir="rtl">پیش از خواب، فقط یک پرسشِ کوتاه: کدام پرسش بیشتر از همه کمکت کرد؟</span>  
   → no option (best-question)

### Negative (look-alike)

1. [assistant] <span dir="rtl">کدام فرض بیشتر به کار آمد، فرض اول یا دوم؟ هر دو را امتحان کن.</span>  
   → option «کدام فرض بیشتر به کار آمد، فرض اول یا دوم؟» (about the problem, not meta)
2. [assistant] <span dir="rtl">کدام حالتِ خاص بیشتر کمک می‌کند تا الگو را ببینی؟</span>  
   → option kept as is
3. [assistant] <span dir="rtl">کدوم پرسش رو اول باید جواب بدی: مجهول چیه یا داده‌ها کدومن؟</span>  
   → option kept whole (a coaching question about the solving order)
4. [assistant] <span dir="rtl">دوست داری از n=1 شروع کنی یا از n=2؟</span>  
   → option kept («دوست داری» but a step choice, not taste)
5. [assistant] <span dir="rtl">کدام روش را می‌خواهی امتحان کنی، کار از آخر یا رسم شکل؟</span>  
   → option kept (method choice for this problem)
6. [assistant] <span dir="rtl">از داده‌هایی که داری، کدام به مجهول نزدیک‌تر است؟</span>  
   → option kept
7. [assistant] <span dir="rtl">کدام قدم از راه‌حلت هنوز وارسی نشده؟</span>  
   → option kept
8. [assistant] <span dir="rtl">به نظرت کدام پرسشِ پولیا اینجا به کار می‌آید؟</span>  
   → option kept (asks the user to pick a heuristic, not to review helpfulness)


## RC2c · which guess a question is about («(حدسِ تو: …)» note) — context = recorded guess state

### Positive

1. [assistant] <span dir="rtl">گفتی «۸۰۰ هزار تومن کافیه». چطور مطمئن می‌شی این عدد کمه یا زیاد؟</span> — _context:_ <span dir="rtl">recorded guess: «حدود ۵۰۰ هزار»</span>  
   → option «چطور مطمئن می‌شی این عدد کمه یا زیاد؟ (حدسِ تو: «۸۰۰ هزار تومن کافیه»)», never the recorded one
2. [assistant] <span dir="rtl">«هیچ‌وقت نمی‌شه» حدسِ تازه‌ته. قبل از اثبات: با کدوم حالت خاص می‌آزماییش؟</span> — _context:_ <span dir="rtl">recorded guess: «پوشش ممکن است، فقط کند است»</span>  
   → option «با کدوم حالت خاص می‌آزماییش؟ (حدسِ تو: «هیچ‌وقت نمی‌شه»)»
3. [assistant] <span dir="rtl">«فیل اضافه است» را حدس زدی؛ این حدس را با کدام حرکت می‌سنجی؟</span> — _context:_ <span dir="rtl">recorded guess: «حرکت اول کیش وزیر است»</span>  
   → option «این حدس را با کدام حرکت می‌سنجی؟ (حدسِ تو: «فیل اضافه است»)»
4. [assistant] <span dir="rtl">حدست «جواب ۲^n است» جالبه؛ برای n=3 امتحانش کردی؟</span> — _context:_ <span dir="rtl">no recorded guess</span>  
   → note «جواب ۲^n است» (quoted in the same sentence)
5. [assistant] <span dir="rtl">این حدس را برای n=4 بیازما — چه می‌شود؟</span> — _context:_ <span dir="rtl">recorded g2: «n²»; model coach_state.guess -> g2 in this turn</span>  
   → note «n²» (allowed: coach_state.guess this turn points to g2)
6. [assistant] <span dir="rtl">تو گفتی «خرید خونه بهتره»؛ با چه عددی این حرف رو محک می‌زنی؟</span> — _context:_ <span dir="rtl">recorded guess: «اجارهٔ بلندمدت به‌صرفه‌تر است»</span>  
   → note «خرید خونه بهتره»
7. [assistant] <span dir="rtl">گفتی «۱/۳ میشه». از یه راه دیگه هم به همین می‌رسی؟</span> — _context:_ <span dir="rtl">recorded (refuted) guess: «۱/۲»</span>  
   → note «۱/۳ میشه», never «۱/۲»
8. [assistant] <span dir="rtl">اول گفتی «۶» و بعد «۸». این دومی را چطور می‌آزمایی؟</span> — _context:_ <span dir="rtl">recorded guess: «۶»</span>  
   → note «۸» or no note; never «۶» and never the recorded guess
9. [assistant] <span dir="rtl">گفتی «رخ بی‌فایده است». این حدس را چطور می‌آزمایی؟</span> — _context:_ <span dir="rtl">guess «کیش وزیر» recorded at t2 > message time t1</span>  
   → note «رخ بی‌فایده است»; never «کیش وزیر» (recorded after this message)

### Negative (look-alike)

1. [assistant] <span dir="rtl">حالا جوابت شد ۱/۳ — از راه دیگری هم به آن می‌رسی و وارسی‌اش می‌کنی؟</span> — _context:_ <span dir="rtl">recorded (refuted) guess: «۱/۲»</span>  
   → no guess note: «‌اش» refers to the new result, not a guess
2. [assistant] <span dir="rtl">همهٔ ۴۷ ستونِ جدولت واقعاً لازمه؟ کدومش رو حذف کنی چیزی از دست نمی‌دی؟</span> — _context:_ <span dir="rtl">recorded guess: «اجارهٔ بلندمدت»</span>  
   → no guess note
3. [assistant] <span dir="rtl">حدس زدن خوبه. حالا بگو: مهره‌ی سفید کجا ایستاده؟</span> — _context:_ <span dir="rtl">recorded guess: «کیش وزیر»</span>  
   → no guess note (question not about a guess); option «مهره‌ی سفید کجا ایستاده؟»
4. [assistant] <span dir="rtl">هر حدسی داری، اول روی یه مثال کوچیک امتحانش کن. مثالت چیه؟</span> — _context:_ <span dir="rtl">recorded guess: «۱۲»</span>  
   → no guess note (generic advice)
5. [assistant] <span dir="rtl">بودجه‌ات رو نوشتی؛ کدوم ردیفش بیشتر از همه بالا پایین می‌شه؟</span> — _context:_ <span dir="rtl">recorded guess: «۵۰۰ هزار»</span>  
   → no guess note: «‌ش» refers to the budget
6. [assistant] <span dir="rtl">این حدسِ خوبی برای شروع است، اما پرسشِ اصلی این است: مجهول دقیقاً چیست؟</span> — _context:_ <span dir="rtl">recorded guess: «۱۲»</span>  
   → no guess note (the question is about the unknown)
7. [assistant] <span dir="rtl">این حدس رو چطور می‌آزمایی؟</span> — _context:_ <span dir="rtl">guess recorded at t2 > message time t1; no coach_state.guess</span>  
   → no guess note: no quote in the message and the only guess was recorded after it
8. [assistant] <span dir="rtl">پرسشم را عوض می‌کنم: بدون حدس، فقط داده‌ها را بشمار. چند تا داری؟</span> — _context:_ <span dir="rtl">recorded guess: «n²»</span>  
   → no guess note


## RC2d · bare labels before «:» (no finite verb ⇒ dropped)

### Positive

1. [assistant] <span dir="rtl">یک قدمِ کوچک‌تر: اگر n=2 باشد، جواب چند است؟</span>  
   → option «اگر n=2 باشد، جواب چند است؟»
2. [assistant] <span dir="rtl">نیمه‌ی راه: کدوم داده رو هنوز استفاده نکردی؟</span>  
   → option «کدوم داده رو هنوز استفاده نکردی؟»
3. [assistant] <span dir="rtl">فقط یه نکته: مجهولت دقیقاً چیه؟</span>  
   → option «مجهولت دقیقاً چیه؟»
4. [assistant] <span dir="rtl">و یک سؤالِ دیگر، این بار کوتاه: شکل را کشیدی؟</span>  
   → option «شکل را کشیدی؟»
5. [assistant] <span dir="rtl">هنوز گامی ننوشته‌ای، پس سؤالی دیگر از همان فهرست: برای استقرا، حالت پایه چیست؟</span>  
   → option «برای استقرا، حالت پایه چیست؟» (label after «، پس» and its meta-clause dropped)
6. [assistant] <span dir="rtl">پیش از تحویل، یک بررسیِ سریع: واحدها با هم جورند؟</span>  
   → option «واحدها با هم جورند؟»
7. [assistant] <span dir="rtl">پرسشِ امروز — نسخه‌ی ساده‌تر: مجموع سه عددِ اول چند می‌شود؟</span>  
   → option «مجموع سه عددِ اول چند می‌شود؟» (dash inside the head)
8. [assistant] <span dir="rtl">گامِ بعدی، با دقتِ بیشتر: کدام شرط را می‌توانی کنار بگذاری؟</span>  
   → option «کدام شرط را می‌توانی کنار بگذاری؟»
9. [assistant] <span dir="rtl">یادآوریِ کوچک – حالتِ خاص: برای مثلثِ متساوی‌الاضلاع چه می‌شود؟</span>  
   → option «برای مثلثِ متساوی‌الاضلاع چه می‌شود؟»

### Negative (look-alike)

1. [assistant] <span dir="rtl">حالا که گیر کرده‌ای: اگر از آخر شروع کنی، قدمِ یکی مانده به آخر چیست؟</span>  
   → option kept whole (head has finite verb «کرده‌ای»)
2. [assistant] <span dir="rtl">قیاس را به کار بردی: مسئلهٔ ساده‌تری که شبیه این است کدام است؟</span>  
   → option kept whole (head «به کار بردی» is finite)
3. [assistant] <span dir="rtl">از آخر شروع کن: برای رسیدن به ۱۰۰، یک قدم قبل کجا بودی؟</span>  
   → option kept whole (imperative «کن» is finite)
4. [assistant] <span dir="rtl">گفتی حالت خاص را امتحان کرده‌ای: n=1 چه داد؟</span>  
   → option kept whole
5. [assistant] <span dir="rtl">تا اینجا درست آمدی: گامِ سوم از کجا نتیجه می‌شود؟</span>  
   → option kept whole
6. [assistant] <span dir="rtl">مسئله را دوباره بخوان: دقیقاً چه چیزی خواسته شده؟</span>  
   → option kept whole
7. [assistant] <span dir="rtl">ساعت ۱۰:۳۰ شروع کردی؟</span>  
   → option kept whole (colon inside a time is not a head separator)
8. [assistant] <span dir="rtl">نسبتِ ۳:۴ را از کجا آوردی؟</span>  
   → option kept whole (ratio colon)
9. [assistant] <span dir="rtl">شرط‌ها را شمردی و دیدی سه تاست: کدامش را هنوز به کار نبرده‌ای؟</span>  
   → option kept whole (head «دیدی سه تاست» has finite verbs)


## RC2d · anaphoric heads incl. compound prepositions

### Positive

1. [assistant] <span dir="rtl">وقتی به جواب رسیدی، «حل شد» را بزن. پیش از آن: جوابت را در معادله‌ی اول بگذار — درست درمی‌آید؟</span>  
   → option «جوابت را در معادله‌ی اول بگذار — درست درمی‌آید؟» (dangling «پیش از آن» dropped)
2. [assistant] <span dir="rtl">فرمول کلی رو بعداً می‌نویسیم. قبل از اون: برای n=3 چند تا میشه؟</span>  
   → option «برای n=3 چند تا میشه؟»
3. [assistant] <span dir="rtl">نمودار را کشیدی. بعد از این: کدام نقطه بیشترین مقدار را دارد؟</span>  
   → option «کدام نقطه بیشترین مقدار را دارد؟»
4. [assistant] <span dir="rtl">این راه را کنار بگذار. به جای آن، حالتِ n=0 چه می‌دهد؟</span>  
   → option «حالتِ n=0 چه می‌دهد؟»
5. [assistant] <span dir="rtl">حدست را نوشتی. علاوه بر این، آیا شرطِ دوم هم لازم است؟</span>  
   → option «آیا شرطِ دوم هم لازم است؟»
6. [assistant] <span dir="rtl">با همین، سؤال بعدی: مجموع زاویه‌ها چند است؟</span>  
   → option «مجموع زاویه‌ها چند است؟»
7. [assistant] <span dir="rtl">جواب رو با ماشین‌حساب چک کن. پس از آن، کدام گام را باید وارسی کنی؟</span>  
   → option «کدام گام را باید وارسی کنی؟»
8. [assistant] <span dir="rtl">از این گذشته: آیا جواب به واحد بستگی دارد؟</span>  
   → option «آیا جواب به واحد بستگی دارد؟»
9. [assistant] <span dir="rtl">در کنارِ این، بگو داده‌ی سوم به چه کاری می‌آید؟</span>  
   → option «داده‌ی سوم به چه کاری می‌آید؟» (anaphoric lead + «بگو» frame dropped)

### Negative (look-alike)

1. [assistant] <span dir="rtl">آن مثلثی که کشیدی، قائم‌الزاویه است؟</span>  
   → option kept whole (demonstrative with its noun inside the option)
2. [assistant] <span dir="rtl">این معادله را چطور ساده می‌کنی؟</span>  
   → option kept whole
3. [assistant] <span dir="rtl">قبل از اینکه جواب بدی، شرط‌ها رو یه بار دیگه بخون — چند تا شرط داره؟</span>  
   → option kept whole («قبل از اینکه» is a conjunction, not an anaphor)
4. [assistant] <span dir="rtl">بعد از ضربِ دو طرف در ۲، معادله چه شکلی می‌شود؟</span>  
   → option kept whole (preposition with explicit object)
5. [assistant] <span dir="rtl">پیش از آنکه فرمول را بنویسی، برای n=1 چه به دست می‌آید؟</span>  
   → option kept whole («پیش از آنکه» conjunction)
6. [assistant] <span dir="rtl">آنچه خواسته شده دقیقاً چیست؟</span>  
   → option kept whole (relative «آنچه»)
7. [assistant] <span dir="rtl">بعد از ظهر وقت داری ادامه بدیم؟</span>  
   → option kept whole («بعد از ظهر» is a time phrase)
8. [assistant] <span dir="rtl">آنتروپی سیستم بیشتر می‌شود یا کمتر؟</span>  
   → option kept whole («آن» only as a substring)


## RC2e · repeats with a new preface collapse (compare object, not frame)

### Positive

1. [assistant] <span dir="rtl">A1: مجهول چیست؟ ‖ A2: همان پرسشِ قبلی را دوباره می‌پرسم: مجهول چیست؟</span>  
   → one option «مجهول چیست؟»
2. [assistant] <span dir="rtl">A1: کدوم داده رو هنوز به کار نبردی؟ ‖ A2: باز هم همون سؤال: کدوم داده هنوز استفاده نشده؟</span>  
   → one option (same object, reworded)
3. [assistant] <span dir="rtl">A1: برای n=2 چه می‌شود؟ ‖ A2: بگذار سؤالم را تکرار کنم — اگر n دو باشد، جواب چند است؟</span>  
   → one option
4. [assistant] <span dir="rtl">A1: این حدس را چطور می‌آزمایی؟ ‖ A2: هنوز جواب ندادی، پس همان سؤال: حدست را با چه چیزی می‌آزمایی؟</span>  
   → one option (same guess, same act)
5. [assistant] <span dir="rtl">A1: شکل را کشیدی؟ ‖ A2: خب، دوباره: شکلش رو کشیدی یا نه؟</span>  
   → one option
6. [assistant] <span dir="rtl">A1: کدام شرط اضافه است؟ ‖ A2: همان پرسش با بیانی دیگر: کدام شرط را می‌شود حذف کرد بی‌آن‌که چیزی عوض شود؟</span>  
   → one option
7. [assistant] <span dir="rtl">A1: مسئلهٔ مشابهی دیده‌ای؟ ‖ A2: یک بار دیگر می‌پرسم، چون مهم است: آیا مسئلهٔ شبیه این را قبلاً حل کرده‌ای؟</span>  
   → one option
8. [assistant] <span dir="rtl">A1: چند تا ستون واقعاً لازمه؟ ‖ A2: سؤالم هنوز سر جاشه: از این ستون‌ها چندتاش لازمه؟</span>  
   → one option

### Negative (look-alike)

1. [assistant] <span dir="rtl">A1: مجهول چیست؟ ‖ A2: داده‌ها چیستند؟</span>  
   → two options
2. [assistant] <span dir="rtl">A1: برای n=2 چه می‌شود؟ ‖ A2: برای n=3 چه می‌شود؟</span>  
   → two options (different n)
3. [assistant] <span dir="rtl">A1 (problem P1): همان پرسشِ قبلی: مجهول چیست؟ ‖ A2 (problem P2): همان پرسشِ قبلی: مجهول چیست؟</span>  
   → one option in each problem's list; never merged across problems
4. [assistant] <span dir="rtl">A1 (after guess «۶»): این حدس را چطور می‌آزمایی؟ ‖ A2 (after new guess «۸»): این حدس را چطور می‌آزمایی؟</span>  
   → two options (same frame, different guesses)
5. [assistant] <span dir="rtl">A1: شکل را کشیدی؟ ‖ A2: همان شکل را با یک ضلعِ بلندتر بکش — زاویه‌ها عوض می‌شوند؟</span>  
   → two options («همان» but a new question)
6. [assistant] <span dir="rtl">A1: کدام شرط اضافه است؟ ‖ A2: کدام شرط لازم است؟</span>  
   → two options (opposite objects)
7. [assistant] <span dir="rtl">A1: مجموع را برای ۱۰ جمله حساب کردی؟ ‖ A2: همان کار را برای ۱۰۰ جمله بکن — چه الگویی می‌بینی؟</span>  
   → two options
8. [assistant] <span dir="rtl">A1: جوابت ۱/۳ شد؟ ‖ A2: جوابت ۱/۴ شد؟</span>  
   → two options (different values)


## RC4 · verification spread over several messages (coach_state.check {msgs})

### Positive

1. [user] <span dir="rtl">U1: n=5 رو گذاشتم، شرط برقرار نیست پس این ادعا رد شد. ‖ U2: مثبت بودنِ جمله‌ها رو هم چک کردم، همه‌شون مثبتن. ‖ U3: یه نگاه کلی هم: چون هر جمله از قبلی کوچیک‌تره، حد وجود داره.</span>  
   → verified (coach_state.check.msgs=[U1,U2,U3], all user messages)
2. [user] <span dir="rtl">U1: x=3 رو گذاشتم تو معادله‌ی اول: ۲·۳+۱=۷ درسته. ‖ U2: تو دومی هم: ۳−۱=۲، اونم درسته.</span>  
   → verified (check spread over two messages)
3. [user] <span dir="rtl">U1: واحدها را بررسی کردم؛ هر دو طرف بر حسب متر بر ثانیه‌اند. ‖ U2: همچنین در حالت حدی t=0 نتیجه صفر می‌شود که منطقی است.</span>  
   → verified (formal, two checks)
4. [user] <span dir="rtl">U1: برای n=1 فرمول ۱ می‌ده، درسته. ‖ U2: n=2 هم ۳، با شمردن دستی می‌خونه. ‖ U3: n=3 هم شش شد. اوکیه.</span>  
   → verified (three special cases in three messages)
5. [user] <span dir="rtl">U1: جمع ردیف‌ها رو دوباره زدم، ۱۲ میلیون شد. ‖ U2: با صورت‌حساب بانک هم تطبیق دادم، همونه.</span>  
   → verified (life/budget check)
6. [user] <span dir="rtl">U1: از راه دوم هم رفتم، با مساحت. ‖ U2: همون ۱/۳ دراومد.</span>  
   → verified (second method, result in a later message)
7. [user] <span dir="rtl">U1: حالت پایه رو نوشتم. ‖ U2: گام استقرا: فرض کردم برای k درسته و برای k+1 نشون دادم. ‖ U3: جایی که از فرض استفاده کردم رو هم علامت زدم.</span>  
   → verified (proof check across three messages)
8. [user] <span dir="rtl">U1: با عدد گذاشتن امتحانش کردم، جور درمیاد.</span>  
   → verified: model summary «جواب را در معادله جایگذاری کرد و تساوی برقرار بود» has low token overlap but check.msgs=[U1] is valid

### Negative (look-alike)

1. [user] <span dir="rtl">U1: فکر کنم درسته. ‖ U2: آره دیگه، حتماً درسته.</span>  
   → not verified: assertions, no check (model reports no check)
2. [user] <span dir="rtl">A: بیا جایگذاری کنیم: ۲·۳+۱=۷ ‖ U1: باشه.</span>  
   → not verified: check.msgs points to the assistant's message; page rejects it
3. [user] <span dir="rtl">U1: درسته به نظرم.</span>  
   → not verified via check: check.msgs=[msg id that does not exist]; page rejects, falls back to "maybe" at most
4. [user] <span dir="rtl">U1: می‌خوام وارسی کنم ولی بلد نیستم چطوری.</span>  
   → not verified: intention only
5. [user] <span dir="rtl">U1: x=3 رو تو معادله گذاشتم؛ نشد! ۸ درومد نه ۷.</span>  
   → not verified: the check refutes the answer
6. [user] <span dir="rtl">U1 (problem A): جواب رو با ماشین‌حساب چک کردم، درسته.</span>  
   → not verified for problem B: the cited message belongs to another problem
7. [user] <span dir="rtl">U1: جواب ۶ رو جایگذاری کردم، جور بود. ‖ (later) U2: نه، جوابم عوض شد، ۸ است.</span>  
   → final answer ۸ not verified: the check was of the abandoned answer ۶
8. [user] <span dir="rtl">U1: معادله رو یه بار دیگه از اول حل کردم و همون جواب اومد.</span>  
   → no coach_state.check, but ~70% token overlap with model summary: "maybe" only (fallback), neither verified nor denied
9. [user] <span dir="rtl">U1: n=4 رو امتحان کردم. ‖ U2: شرط هم برقرار بود. ‖ U3: پس حله.</span>  
   → model omits coach_state.check and overlap with any single message is low: page must NOT assert «وارسی نشد» (unknown, no denial)


## RC5 · repeated asking (asked/answered ledger includes assistant asks and model reports)

### Positive

1. [user] <span dir="rtl">A(p6): از سؤال‌هایی که پرسیدم کدوم بیشتر کمکت کرد؟ ‖ U(p7): همون که گفتی حالت خاص رو امتحان کن.</span>  
   → bestQ asked (by assistant) and answered (model chat_lookback bestQ): never asked again
2. [user] <span dir="rtl">A: بیشتر چه جور مسئله‌ای دوست داری؟ ‖ U: هنوز نمی‌دونم.</span>  
   → taste counted as asked (unknown, not answered); the next turn line must not make taste the turn question again
3. [user] <span dir="rtl">A(p5): از کدوم نوع مسئله‌ها خوشت میاد؟ ‖ U: (ignores) ‖ A(p9): راستی، کدوم مدل مسئله بیشتر به دلت می‌شینه؟ ‖ U: (ignores)</span>  
   → taste counted asked twice (both assistant asks): page must not push it a third time as the turn question
4. [user] <span dir="rtl">U: سؤالِ «مجهول چیه» بیشتر از همه کمکم کرد، راستی.</span>  
   → model applies chat_lookback bestQ in THIS turn; turn line computed after it, so no bestQ ask in this turn
5. [user] <span dir="rtl">A: کدوم پرسشم راهگشا بود؟ ‖ U: (changes topic)</span>  
   → counts as a bestQ ask (paraphrased wording); no immediate re-ask by the page
6. [user] <span dir="rtl">U: (never asked) راستی من بیشتر از هندسه خوشم میاد.</span>  
   → model reports taste; page never asks taste for this problem
7. [user] <span dir="rtl">A: لطفاً بفرمایید کدام پرسش بیشتر یاری‌تان کرد؟ ‖ U: پرسش دربارهٔ حالتِ خاص.</span>  
   → asked and answered (formal register); never re-asked
8. [user] <span dir="rtl">A(day 1): کدوم سؤال بیشتر به کارت اومد؟ ‖ U(day 2): راستی جواب سؤال دیروزت: همون که گفتی از آخر شروع کن.</span>  
   → answered in the next session (model reports bestQ); no re-ask

### Negative (look-alike)

1. [user] <span dir="rtl">A: کدوم پرسش رو اول جواب بدی: مجهول یا داده‌ها؟</span>  
   → not a look-back ask: bestQ stays pending (unasked)
2. [user] <span dir="rtl">A: دوست داری بریم سراغ مسئله‌ی بعدی؟</span>  
   → not a taste ask: taste stays pending
3. [user] <span dir="rtl">A: کدوم پرسش بیشتر کمکت کرد؟ ‖ U: سؤالت چی بود؟ یادم رفت.</span>  
   → counted asked but NOT answered
4. [user] <span dir="rtl">A (problem P1 closed): کدوم پرسش کمکت کرد؟ ‖ U: حالت خاص. ‖ (later problem P2 closed)</span>  
   → P2's bestQ is neither asked nor answered (ledger is per problem)
5. [user] <span dir="rtl">A: دیروز پرسیده بودم کدوم پرسش کمک کرد و گفتی حالت خاص؛ امروز بریم سراغ تمرین بعدی.</span>  
   → not a new ask (a recap), and counts as an answer only if the model reports it
6. [user] <span dir="rtl">A: کدوم پرسش بیشتر کمکت کرد؟ ‖ U: خیلی کمکم کردی، مرسی!</span>  
   → not answered: thanks without naming a question
7. [user] <span dir="rtl">A: کدوم پرسش بیشتر کمکت کرد؟ ‖ U: من کلاً جبر رو دوست دارم.</span>  
   → taste answered (if model reports), bestQ NOT answered
8. [user] <span dir="rtl">A: کدام پرسش از فهرست پولیا را می‌خواهی امتحان کنی؟</span>  
   → not a look-back ask
9. [user] <span dir="rtl">U: کدوم سؤال بیشتر توی امتحان میاد؟</span>  
   → the user's own question: not an assistant ask, not an answer

