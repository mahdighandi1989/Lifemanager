# SPEC — محتوای ۴۵ تکنیک برای «سامانه معماری یادگیری عمیق»

You are writing the CONTENT DATA (in Persian/Farsi) for a learning-practice app. The user is a Persian-speaking
banker (collateral review at a bank in Dubai), algorithmic trader (MetaTrader 5 Expert Advisors, trailing stops,
risk management), builds a Persian 3D detective educational game, and loves serious cinema (e.g. «سقوط»/Downfall,
«آپوکالیپتو», «بیا و ببین»/Come and See). He wants to understand DEEPLY ("حفظ نه، حفظ نه، حفظ نه — عمق کار رو بفهمم"),
and wants every technique to be (a) understood — its philosophy, WHY it works, the cognitive mechanism; (b) PRACTICED
in a structured worksheet inside the app; (c) self-assessable — "did I execute it correctly?". He explicitly rejected
superficial summaries. No summarizing, no fluff, no hype words ("بی‌رحمانه", "انفجاری", "سیناپسی" every sentence).
Write like a rigorous, warm Persian-speaking cognitive scientist. Be scientifically honest: state limits & evidence strength.

## Sources (read them)
- Full extracted text of the docx (the canonical 45 table is in «فصل ۷»; sessions/concerns in «فصل ۱»):
  /tmp/claude-0/-home-claude/27c59106-f83d-5e3e-8bbc-604ef88d9303/scratchpad/src/docx.txt
- PDF «راهنمای جامع درک عمیق مطالب — ۳۵ تکنیک» (Polymath Investor, tr. Mostafa Nasehi). Techniques 1–35 come from it, each
  with «تعریف / چرا کار می‌کند / کاربرد عملی». Read the pages for YOUR techniques with the Read tool (pages param) at:
  /root/.claude/uploads/27c59106-f83d-5e3e-8bbc-604ef88d9303/386cac58-_______________________35______.pdf
  PDF page index = printed page number + 1. Printed pages: FP 1, Decomposition 2, Pareto 3, Structural mapping 4,
  Levels of abstraction 5, Analogy 7, Chunking 8, Archetypes 9, Reference class 10, Signal/noise 11, Inversion 13,
  5 Whys 14, Socratic 15, Reframing 16, Challenging assumptions 17, Latticework 19, Abstraction&Generalization 20,
  Integrative 21, Cross-pollination 22, Perspectives 23, Hypothesis testing 25, Falsification 26, Rapid feedback 27,
  Calibration 28, Peer review 29, Visual models 31, Thought experiments 32, Feynman 33, Learning by teaching 34,
  Reflective notetaking 35, Growth mindset 37, Metacognition 38, Curiosity 39, Humility 40, Ambiguity 41.
  Techniques 36–45 are NOT in the PDF (they are evidence-based additions in the docx); use the docx row + science.
- The pptx had a DIFFERENT, inconsistent list; ignore it except where told.

## Canonical list (docx numbering) — groups & primary phase of the 9-phase pipeline (phase 0..8)
Phases: 0 پیش‌تنظیم ذهنی | 1 توجه، بار و عمق پردازش | 2 شالوده‌شکنی | 3 تطبیق الگو | 4 استنطاق علّی و قاب‌بندی |
5 سنتز چندرشته‌ای | 6 برون‌سازی و تدریس | 7 اعتبارسنجی و اصلاح دوحلقه‌ای | 8 تثبیت و بازیابی
- G1 مبانی درک (phase 2): 1 تفکر بر اصول اولیه First Principles · 2 تجزیه (تقسیم و حل) Decomposition · 3 شناسایی محرک‌های کلیدی (اصل پارتو) · 4 نقشه‌برداری ساختاری · 5 سطوح انتزاع (زوم درون/بیرون)
- G2 تشخیص الگو و نگاشت قیاسی (phase 3): 6 استدلال قیاسی · 7 قطعه‌بندی الگو و طرحواره · 8 کهن‌الگوهای سیستمی · 9 استدلال کلاس مرجع · 10 تمایز سیگنال از نویز
- G3 قاب‌بندی و پرسشگری (phase 4): 11 وارونگی Inversion · 12 پنج چرا · 13 پرسشگری سقراطی · 14 قاب‌بندی مجدد مسئله · 15 به چالش کشیدن فرضیات
- G4 سنتز و ادغام (phase 5): 16 شبکه مدل‌های ذهنی Latticework · 17 انتزاع و تعمیم · 18 تفکر یکپارچه Integrative · 19 گرده‌افشانی متقابل ایده‌ها · 20 دیدگاه‌های چندگانه
- G5 اعتبارسنجی و بازخورد (phase 7): 21 آزمون فرضیه · 22 ابطال‌گرایی · 23 حلقه‌های بازخورد سریع · 24 کالیبراسیون اعتماد · 25 بررسی همتایان و تیم قرمز
- G6 ابزارها و چارچوب‌های ساخت درک (phase 6): 26 مدل‌های بصری · 27 آزمایش فکری و شبیه‌سازی · 28 تکنیک فاینمن · 29 یادگیری با آموزش (اردک پلاستیکی) · 30 نوشتن و یادداشت‌برداری بازتابی (Zettelkasten)
- G7 ذهنیت و فراشناخت (phase 0): 31 ذهنیت رشد · 32 آگاهی فراشناختی · 33 یادگیری مبتنی بر کنجکاوی · 34 فروتنی فکری · 35 پذیرش ابهام و عدم قطعیت
- G8 توجه، بار و عمق پردازش (phase 1): 36 مدل‌سازی موقعیت (کینچ) · 37 بهینه‌سازی بار شناختی (سوئلر) · 38 کدگذاری دوگانه (پایویو) · 39 یادگیری دوحلقه‌ای (آرگریس) [PRIMARY PHASE = 7, moved; see errata] · 40 تعامل سازنده ICAP (چی)
- G9 بازیابی فعال و تثبیت (phase 8): 41 تمرین بازیابی فعال · 42 تکرار با فواصل فزاینده · 43 تمرین درهم‌تنیده Interleaving · 44 اثر تولید و دشواری‌های مطلوب · 45 پرسشگری توضیحی Elaborative Interrogation

## Concern IDs (the user's own concerns, from docx chapter 1) — tag each technique with the ones it really addresses
c1 حجم نامحدود محتوا و دوره‌های موازی؛ ملکه ذهن شدن · c2 مرور = بازگشت به ویدیوها = وقت زندگی نمی‌ماند · c3 فراموشی حتی با جزوه و خلاصه ·
c4 آموزش خودِ زندگی شود نه کنار آن · c5 فهم عمیق + توضیح شفاف برای دیگران + حفظ پیرنگ/وابستگی/مقدمات · c6 ارتباط میان آموزش‌های سطحیِ مجموعه‌های مختلف ·
c7 حفظ نه؛ فهم عمق · c8 یادگیری همه‌چیز به‌صورت مفهومی · c9 فهم جرقه و دغدغه بنیان‌گذار هر علم · c10 باز شدن گره‌های ذهنی با تمرین ·
c11 منظومه فکری؛ کجای هر علم ایستاده‌ام، ساحل آن کجاست؛ رهایی از آشفتگی · c12 کشیدن عصاره آموزش · c13 وظیفه یادگیرنده در برابر آموزش ·
c14 اقدامات نهادینه‌سازی و پیاده‌سازی · c15 کدام تمرین‌ها و چگونه · c16 فراتر از آزمون: تزریق تدریجی و فهم ریشه‌ای · c17 از کجا بفهمم تکنیک را درست اجرا کرده‌ام

## Output: a JS file. EXACT FORMAT
```js
window.T = window.T || [];
T.push(
{
  id: 1,
  fa: "تفکر بر اصول اولیه",
  en: "First Principles Thinking",
  aka: ["شالوده‌شکنی"],                 // other names used in the user's docs (optional)
  def: "...",        // تعریف دقیق، ۱–۲ جمله
  why: "...",        // «چرا کار می‌کند» — faithful to the PDF's argument but COMPLETE (not summarized), 4–7 sentences. For 36–45 write from science.
  philo: "...",      // فلسفه و ریشه تاریخی: who/where it comes from, what problem it solved, the worldview behind it. 3–5 sentences.
  mech: "...",       // سازوکار شناختی: what happens in memory/reasoning that makes it work; name researchers & years (e.g. Gentner 1983, Roediger & Karpicke 2006). 4–6 sentences.
  ev: { lvl: "A", note: "..." },   // A = strong experimental evidence for learning (testing effect, spacing…); B = moderate/mixed or indirect; C = expert heuristic, plausible, little direct experimental evidence. note: honest 1–3 sentences incl. limits/known caveats.
  when: "...",       // کی به کار بیاید (موقعیت‌های مناسب)
  limits: "...",     // کی کار نمی‌کند/خطر کاربرد نابجا
  dose: "...",       // دوز و زمان: مثلاً «۱۵–۲۵ دقیقه برای هر مفهوم جدید؛ هفته‌ای ۲ بار»
  steps: ["...", "..."],      // روش اجرا گام‌به‌گام، 5–8 steps, each concrete & imperative, executable
  mistakes: ["...", "..."],   // خطاهای رایج اجرا، 3–5
  signals: ["...", "..."],    // نشانه‌های اینکه درست اجرا شده/دارد کار می‌کند، 3–4 observable signs
  levels: ["سطح ۱ ...", "سطح ۲ ...", "سطح ۳ ..."], // progression novice→expert in this technique (what practice looks like at each level)
  example: { d: "trading", title: "...", text: "..." },  // worked example (d ∈ trading|banking|game|cinema|science). 120–220 words, concrete, shows the steps applied end-to-end with actual content. Rotate domains across your techniques.
  rubric: ["...", "..."],     // 5–7 self-assessment criteria (each scored 0/1/2 in the app). Concrete & checkable, e.g. «هر حلقه چرا با یک سازوکار علّی پاسخ داده شده، نه با برچسب».
  concerns: ["c7","c9"],
  src: "PDF ص ۱ · docx فصل ۷ ردیف ۱",      // where it appears in sources
  fix: "",            // اصلاحیه: ONLY if the user's docs (docx/pptx) say something wrong/overstated about this technique, explain correction. else "".
  ws: [ ...fields... ],        // worksheet — see below. 4–9 fields. Must ENFORCE the method (structure forces correct execution).
  card: { q: "...{fieldKey}...", a: "...{fieldKey}..." },   // optional: template to turn the worksheet into a spaced-repetition card (why/how card, not vocabulary)
  ai: "..."           // instruction for an AI CRITIC that reviews the user's filled worksheet. The AI must NOT do the work for the user; it checks against the rubric, points to the weakest step, asks 2–3 probing questions, gives one hint. 2–4 sentences, Persian.
},
{ id: 2, ... }
);
```
Use double-quoted JS strings; escape any inner double quotes (prefer «» guillemets in Persian text). Use Persian digits in prose.
No template literals. No trailing syntax errors. VALIDATE with:
`node -e "global.window={};require('/abs/path/file.js');console.log(window.T.length, window.T.map(t=>t.id).join(','))"`

## Worksheet field types (ws). Every field: k (unique key, latin), t (type), l (Persian label), h (hint/placeholder, optional), req (true if mandatory)
- `{k,t:"text",l,h}` one line
- `{k,t:"area",l,h,rows:4}` multiline
- `{k,t:"list",l,h,min:3,max:10}` dynamic list of short strings
- `{k,t:"chain",l,h,n:5,prefix:"چرا"}` sequential answers; UI shows each previous answer as the subject of the next question (5 whys, why-chains, ladders)
- `{k,t:"table",l,cols:[{k,l,t:"text"|"num"|"pct"|"sel",opts:[...]}],min:3}` rows of objects
- `{k,t:"scale",l,min:0,max:100,step:5,lo:"...",hi:"..."}` slider
- `{k,t:"sel",l,opts:["..",".."]}` single select
- `{k,t:"checks",l,opts:["..",".."]}` multi-check
- `{k,t:"tree",l,h}` indented outline (2 spaces per level) → rendered as tree
- `{k,t:"graph",l,h}` node-link DSL, one edge per line: `A -> B` (neutral), `A +> B` (هم‌جهت/تقویتی), `A !> B` (خلاف‌جهت/کاهشی), optional ` : برچسب`. Rendered as SVG diagram. Use for causal maps, concept maps, loops.
- `{k,t:"timer",l,min:15}` countdown the user must run (e.g. struggle before seeing answer)
- `{k,t:"lock",l,h,after:"otherKey"}` textarea that stays LOCKED until field `after` is filled; for "attempt first, then reveal source/solution and compare"
- `{k,t:"draw",l}` freehand sketch canvas
- `{k,t:"jargon",l,src:"fieldKey"}` auto-analyzer of an explanation field (flags technical/long words, counts causal connectors «چون/زیرا/بنابراین/در نتیجه», sentence length)
- `{k,t:"pareto",l,src:"tableKey",name:"colKey",val:"colKey"}` auto Pareto (sorted, cumulative %) from a table
- `{k,t:"calib",l,src:"tableKey",conf:"colKey",out:"colKey"}` auto calibration/Brier score from a table with confidence % (pct col) and outcome (sel col with opts ["درست","نادرست","نامعلوم"])
- `{k,t:"info",l,h}` static instruction block between fields (no input)
Design worksheets so the STRUCTURE forces the technique (e.g. Feynman: explanation → jargon analyzer → list of gaps → lock: re-read source → rewrite). Attempt-before-reveal wherever relevant (lock/timer).

## Quality bar
- Every claim scientifically defensible; cite researcher+year inside mech. If the PDF/docx overstates something, put the correction in `fix`.
  Known corrections to apply where relevant: Einstein's "55 minutes" quote is apocryphal; Feynman never formalized "the Feynman technique"
  (it's a later popular construction from his teaching habits); 80/20 is a heuristic not a law; growth-mindset interventions show small average
  effects in meta-analyses (Sisk 2018; Macnamara & Burgoyne 2022) — keep it but operationalize as behaviour around errors, not affirmations;
  Paivio's dual coding = verbal vs non-verbal (imagery) codes, NOT "visual vs auditory channels" (that is the modality effect, Mayer/Baddeley) — the docx conflates them;
  working memory ≈ ~4 chunks for novel info (Cowan 2001) rather than "4–7"; rereading does produce some learning but is low-utility (Dunlosky 2013) — don't say "no neural path is built";
  Dunlosky 2013 utility: HIGH = practice testing, distributed practice; MODERATE = elaborative interrogation, self-explanation, interleaved practice; LOW = summarization, highlighting, keyword mnemonic, imagery for text, rereading;
  transfer across domains is hard and rarely spontaneous (Gick & Holyoak 1980; Barnett & Ceci 2002) — requires explicit structural comparison.
  "Double-loop learning" (Argyris & Schön 1978) is about questioning governing variables — it is NOT a cognitive-load technique; it belongs after error feedback (phase 7).
- Examples must be concrete with real content (e.g. actual reasoning about a trailing stop, an LTV/collateral haircut, a clue design in a detective level, a scene in «بیا و ببین»), not placeholders.
- The worksheet labels should themselves teach (labels phrased as the exact question to ask yourself).
- Length: this is the user's main reference. Full sentences, complete, but no padding.
