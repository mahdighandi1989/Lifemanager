// تورِ پولیا (دستهٔ ۱، دورِ ۳ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» (دستیار، مربیِ حل، تور، قلمرو، اراده) از DECISIONS_R3:
//  D2  پرسشِ پیشنهادی به ترتیبِ کلی ⇐ خاص بر پایهٔ پلهٔ کاربر در همین مرحله (پاسخ‌گرفته‌ها کنار)، نه شمارِ پیام
//  D3  پایانِ نردبان (C188): «ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»» — بی «هرگز کلِ حل»
//  B1  مربیِ فقط‌درگفت‌وگو مرحله را از حرفِ خودِ کاربر جلو می‌برد (فهم ⇐ طرح ⇐ اجرا ⇐ بازنگری)؛ «از خواسته به عقب» در فهرستِ طرح
//  B2  پرسشی که در گفت‌وگو پاسخ گرفت یا کاربر خودش (ناپرسیده) گفت دوباره پیشنهاد نمی‌شود
//  B3  گیر + دادهٔ به‌کارنرفته ⇒ «همهٔ داده‌ها را به کار بردی؟» پیش از تکرارِ «پیش‌تر دیده‌ای؟»
//  B4  سشنِ تازه دربارهٔ مسئلهٔ حل‌شدهٔ مرتبط: نتیجه، روش و بازنگری — نه فقط عنوان
//  B5  بازنگری (صفحه یا گفت‌وگو) پلهٔ پرسش‌های بازنگری را بالا می‌برد
//  B6  «رسیدم به…»، «جواب اینه»، «تموم شد.»، «پس ثابت شد» ⇒ بازنگری
//  B7  «غلط بود» ِ حدس یا تلاشِ کنارگذاشته‌ای که به جواب رسید ⇒ شکستِ مرحله نیست؛ خشم/شرم هم نه
//  B8  «دانسته‌های قلمرو» از حرفِ کاربر، نه از متنِ نوبتِ خودکار؛ «اثبات» ≠ «اثب»
//  B9  واژه‌نامهٔ مشترکِ دلسردی در قلابِ «پس از شکست»؛ کارتِ «🌱» وقتی خواستن کم شد؛ یادآورِ گامِ «🌱»
//  B10 قابِ مربی (پدر/معلم) از گفت‌وگو
//  B11 کاربستِ گفت‌وگو پلهٔ پرسش را بالا می‌برد و سشنِ تازه مرحلهٔ همان مسئله را به یاد دارد
//  B12 «یه مسئله دارم / می‌خوام حلش کنم / گیر کردم توی …» ⇒ قاعدهٔ «🔭»
//  B13 chat_invent ِ بی پدر داور می‌گیرد؛ مسئلهٔ تازهٔ بازنگری و chat_invent ِ همان دو مسئله نمی‌شوند
//  B14 ضرب‌المثلِ نوع‌دار و هم‌جا؛ سلیقه و «بگذار ته‌نشین شود» در میانهٔ کار
// همه از رابطِ واقعی (پنجرهٔ دستیار، فرم‌های صفحه) با مدلِ بدلی. خروج با کدِ غیرصفر در خطا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 90);
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(200);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__rem = []; window.__day = APP.today();
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async (pl) => { __rem.push(JSON.parse(JSON.stringify(pl))); return { ok: true }; }, unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  });
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—]+?)\s*(?:·|—)/.exec(c) || [])[1] || '';
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  const ask = (q) => p.evaluate(q => __q.push(R({ reply: q })), q);
  const ev = () => p.evaluate(() => ((APP.ASSIST.cur() || {}).coachEv || []).length);

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ---------- D2/B2) ترتیبِ پرسش به پلهٔ کاربر در همین مرحله، نه شمارِ پیام ----------
  await newSess();
  await say('یه معما دارم که هنوز نفهمیدمش');
  const d2a = sugOf(coachOf(await lastUser()));
  await ask('مجهول (یا حکمی که باید ثابت شود) چیست؟');
  await say('خب اول اینو بگو: این معما سخته؟');           // پیامِ پاسخ‌نگرفتهٔ دیگری — با شمارِ پیام پیشنهاد نباید بچرخد
  await say('می‌خوام بفهمم کدوم جعبه کدوم میوه رو داره');
  const d2c = sugOf(coachOf(await lastUser()));
  info.d2 = { first: d2a, after: d2c };
  chk(/^مجهول/.test(d2a), 'D2: the first suggestion is the most general question of the phase (the unknown), not chosen by message count ' + JSON.stringify(info.d2));
  chk(/^داده‌ها/.test(d2c), 'D2/B2: after the unknown was answered in chat, the next suggestion is the next question in order (data) ' + JSON.stringify(info.d2));
  // پاسخِ ناپرسیده: کاربر خودش مجهول، داده و شرط را گفت ⇒ پرسش‌هایش «پاسخ‌گرفته»
  await newSess();
  await say('جدول دارم: مجهول یه کلمهٔ هشت‌حرفیه، داده‌ها: حرفِ اولش «ک» است؛ شرط اینه که باید معنی «دور» بده و پالیندروم باشه؟');
  info.b2own = await p.evaluate(() => { const c = __calls[__calls.length - 1].user; return { ph: /مرحلهٔ محتمل: طرح‌ریزی/.test(c), notU: !/پیشنهادِ این نوبت: «(?:مجهول|داده‌ها|شرط چیست)/.test(c) }; });
  chk(info.b2own.ph && info.b2own.notU, 'B1/B2: unknown, data and condition stated unprompted ⇒ understanding questions are not re-suggested; the coach moves to planning ' + JSON.stringify(info.b2own));

  // ---------- B1/B9) مسیرِ s08 (معمای ساعت‌شنی، تماماً در گفت‌وگو) ----------
  await newSess();
  await say('فقط دوتا ساعت شنی داریم، یکی ۷ دقیقه یکی ۱۱ دقیقه. تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزه. چطوری؟ نصفه روزه دارم امتحان می‌کنم: ۷+۷=۱۴، ۱۱+۷=۱۸، ۱۱+۱۱=۲۲ … هیچی جور نمیشه. اعصابم خورده.');
  let u1 = await lastUser(), c1 = coachOf(u1);
  info.s08 = { p1: phOf(c1), back: /از خواسته به عقب/.test(c1), will: /# پس از شکست، نقد یا میلِ رها کردن/.test(u1) };
  await ask('با همین دو ساعت‌شنی، چه زمان‌هایی را — جز ۷ و ۱۱ — می‌توانی دقیق اندازه بگیری؟');
  await say('خب... ۴ دقیقه رو میشه! وقتی ۷ تموم شد، ۱۱ هنوز ۴ دقیقه داره. ۱۵ = ۱۱ + ۴! پس اول هر دو رو برمی‌گردونم، ۷ که تموم شد تخم‌مرغ رو می‌ذارم.');
  info.s08.p2 = phOf(coachOf(await lastUser()));
  await say('نوشتم: هر دو رو با هم برمی‌گردونم؛ ۷ که تموم شد تخم‌مرغ رو می‌ذارم؛ ۱۱ که تموم شد برش می‌گردونم؛ وقتی دوباره تموم شد ۴+۱۱=۱۵.');
  info.s08.p3 = phOf(coachOf(await lastUser()));
  await say('درسم اینه: وقتی رو به جلو گیر کردم، از جواب شروع کنم و برگردم عقب. وارسی هم کردم: ۴ + ۱۱ = ۱۵.');
  info.s08.p4 = phOf(coachOf(await lastUser()));
  chk(info.s08.p1 === 'طرح‌ریزی' && info.s08.back, 'B1: a full statement (unknown, data, condition in his own words) moves the chat-only coach to planning; the plan list has «working backwards» ' + JSON.stringify(info.s08));
  chk(info.s08.p2 === 'اجرای طرح' && info.s08.p3 === 'اجرای طرح' && info.s08.p4 === 'بازنگری', 'B1: stated plan ⇒ execution; written steps stay in execution; his own lesson/check ⇒ look-back ' + JSON.stringify(info.s08));
  chk(info.s08.will, 'B9: «اعصابم خورده» in the first message brings the «after failure» block (shared lexicon in willHookOn) ' + JSON.stringify(info.s08));

  // ---------- B6/B7) نتیجه در شکل‌های گفتاری ⇒ بازنگری؛ «غلط بود» ِ حدس یا تلاشِ کنارگذاشته شکست نیست ----------
  info.b6 = [];
  for (const said of ['رسیدم به ۶ و ۴', 'جواب اینه: ۶ و ۴', 'تموم شد.', 'پس ثابت شد']) {
    await newSess(); await say('معما: مجموعِ دو عدد ۱۰ است و تفاضلشان ۲؛ آن دو عدد کدام‌اند؟'); await say(said);
    info.b6.push([said, phOf(coachOf(await lastUser()))]);
  }
  chk(info.b6.every(x => x[1] === 'بازنگری'), 'B6: «رسیدم به…», «جواب اینه», «تموم شد.», «پس ثابت شد» ⇒ result stated ⇒ look-back ' + JSON.stringify(info.b6));
  await newSess(); await say('معما: مجموعِ دو عدد ۱۰ است و تفاضلشان ۲؛ آن دو عدد کدام‌اند؟');
  const e0 = await ev();
  await say('اول فکر کردم ۵ و ۵ است که غلط بود، بعد رسیدم به ۶ و ۴');
  info.b7 = { ph1: phOf(coachOf(await lastUser())), ev1: (await ev()) - e0 };
  await say('حدسم دوباره غلط بود ولی اندازه گرفتم و ۶ و ۴ درسته');
  info.b7.ph2 = phOf(coachOf(await lastUser())); info.b7.ev2 = (await ev()) - e0;
  await newSess(); await say('معما: یه مثلث داریم که باید ثابت کنم زاویه‌هاش ۱۸۰ است. اعصابم خورده، خیلی عصبانیم');
  info.b7.angry = await ev();
  await say('نتونستم');
  info.b7.stuck = await ev();
  chk(info.b7.ph1 === 'بازنگری' && info.b7.ev1 === 0, 'B7: «… غلط بود، بعد رسیدم به …» is a discarded attempt followed by a result — look-back, no phase failure ' + JSON.stringify(info.b7));
  chk(info.b7.ph2 === 'بازنگری' && info.b7.ev2 === 0, 'B7: «حدسم دوباره غلط بود» on a solved problem is not a failure (a refuted guess is data) ' + JSON.stringify(info.b7));
  chk(info.b7.angry === 0 && info.b7.stuck === 1, 'B7: anger/discouragement is not a phase failure; «نتونستم» still is ' + JSON.stringify(info.b7));

  // ---------- D3) پایانِ نردبان ----------
  info.d3 = await p.evaluate(() => { const c = APP.ASSIST.coachLines({ ph: 'c', qs: [], dry: true }); return { key: /ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»/.test(c), never: /هرگز کلِ حل/.test(c) }; });
  chk(info.d3.key && !info.d3.never, 'D3: end-of-ladder wording per C188, no contradicting «هرگز کلِ حل» ' + JSON.stringify(info.d3));

  // ---------- B10) قابِ مربی ----------
  await newSess();
  await say('می‌خوام به پسرم یاد بدم چطور دو تا کسر رو جمع کنه؛ ۱/۲ + ۱/۳ رو نمی‌تونه');
  const t1 = coachOf(await lastUser());
  await say('خودم حلش کردم ولی اون هنوز گیره');
  const t2 = coachOf(await lastUser());
  info.b10 = { frame: /کاربر مربیِ یادگیرنده است/.test(t1) && /از یادگیرنده بپرسد/.test(t1), notBack: phOf(t2) !== 'بازنگری' };
  await newSess(); await say('یه معما دارم: سه جعبه با برچسبِ غلط'); info.b10.neg = !/کاربر مربیِ یادگیرنده است/.test(coachOf(await lastUser()));
  chk(info.b10.frame && info.b10.notBack && info.b10.neg, 'B10: «به پسرم یاد بدم» ⇒ teacher frame (ask the learner, never solve); «خودم حلش کردم» is the teacher, not look-back; a solver gets no teacher frame ' + JSON.stringify(info.b10));

  // ---------- B12) «🔭» برای گفتنِ صریحِ مسئله ----------
  info.b12 = [];
  for (const t of ['یه مسئله دارم که می‌خوام حلش کنم', 'گیر کردم توی برنامه‌ریزیِ مهمونیِ تولد', 'نمی‌دونم چی رو امتحان کنم', 'یه راه‌حل بده که همه راضی باشن']) {
    await newSess(); await say(t); info.b12.push([t, /# مسئلهٔ واقعیِ حل‌نشده/.test(await lastUser())]);
  }
  await newSess(); await say('سلام'); info.b12.push(['سلام', !/# مسئلهٔ واقعیِ حل‌نشده/.test(await lastUser())]);
  chk(info.b12.every(x => x[1]), 'B12: explicit «I have a problem / want to solve it / stuck in …» brings the «🔭» rule (binding still by explicit live_new); greetings do not ' + JSON.stringify(info.b12));

  // ---------- B13) chat_invent ِ بی پدر داور می‌گیرد؛ مسئلهٔ تازهٔ بازنگری و chat_invent ِ همان دو مسئله نمی‌شوند ----------
  await newSess();
  await say('ثابت کن هر عددِ صحیح را می‌شود به صورتِ جمعِ چند توانِ متمایزِ دو نوشت');
  await p.evaluate(() => __q.push(R({ reply: 'ثبتش کردم.', actions: [{ do: 'chat_invent', title: 'صحیح‌های متمایز', statement: 'بیشترین تعدادِ صحیح‌های مثبتِ متمایز با جمعِ ۱۰۰۰ چندتاست؟' }] })));
  await say('یه مسئلهٔ تازه ساختم: بیشترین تعدادِ صحیح‌های مثبتِ متمایز با جمعِ ۱۰۰۰ چندتاست؟');
  info.b13 = await p.evaluate(() => { const r = APP.liveAll().filter(x => /صحیح‌های مثبتِ متمایز/.test(x.p.statement)).pop(); const ki = r && APP.liveKindInfo(r.p.id); return { kind: ki && ki.kind, set: ki && ki.set }; });
  // پدر با chat_solved و مسئلهٔ تازه‌اش؛ بعد chat_invent ِ همان با صورتِ دیگر
  await newSess();
  await p.evaluate(() => __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'جمعِ تلسکوپی', statement: 'جمعِ ۱/(1·2) + ۱/(2·3) + … + ۱/(n(n+1)) را پیدا کن', kind: 'find', lesson: 'هر جمله را به تفاضلِ دو کسر شکستم', check: 'برای n = ۳ حساب کردم', newProb: 'جمعِ ۱/(1·2·3) + ۱/(2·3·4) + … تا n جمله را پیدا کن' }] })));
  await say('حلش کردم: هر جمله را به تفاضلِ دو کسر شکستم و برای n = ۳ حساب کردم. مسئلهٔ تازه: جمعِ ۱/(1·2·3) + ۱/(2·3·4) + … تا n جمله را پیدا کن');
  const parent = await p.evaluate(() => APP.ASSIST.cur().lprob);
  const n0 = await p.evaluate(() => APP.liveAll().length);
  await p.evaluate(pid => __q.push(R({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', title: 'جمعِ ۱/(1·2·3) + ۱/(2·3·4) + …', statement: 'حدس می‌زنم جمعِ ۱/(k(k+1)(k+2)) تا n جمله به یک‌چهارم نزدیک می‌شود', from: pid }] })), parent);
  await say('حدس می‌زنم جمعِ ۱/(k(k+1)(k+2)) تا n جمله به یک‌چهارم نزدیک می‌شود');
  info.b13.dup = { n0, n1: await p.evaluate(() => APP.liveAll().length), conf: await p.evaluate(() => APP.ASSIST.cur().msgs.some(m => m.role === 'sys' && /پیش‌تر ثبت شده بود/.test(m.text))) };
  chk(info.b13.kind === 'objective', 'B13: chat_invent without a parent and without the model\'s nat gets a judge from the chat (a proof conversation ⇒ objective), not «life/unset» ' + JSON.stringify(info.b13));
  chk(info.b13.dup.n1 === info.b13.dup.n0 && info.b13.dup.conf, 'B13: the look-back\'s new problem and a chat_invent of the same (near-copy title, same parent) do not make two problems ' + JSON.stringify(info.b13.dup));

  // ---------- B4) سشنِ تازه دربارهٔ مسئلهٔ حل‌شدهٔ مرتبط ----------
  await newSess();
  await p.evaluate(() => __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'خرید یا اجارهٔ خانه', statement: 'خانه بخرم یا اجاره کنم؟ پنج سال در همین شهر می‌مانم و پس‌انداز دارم.', kind: 'find', unknown: 'گزینهٔ ارزان‌تر در پنج سال', lesson: 'اول جمع‌کردنِ داده را متوقف کنم و با سه عددِ اصلی تصمیم بگیرم', check: 'با اجارهٔ واقعیِ امسال وارسی کردم' }] })));
  await say('تصمیم گرفتم اجاره کنم. درسم اینه: اول جمع‌کردنِ داده را متوقف کنم و با سه عددِ اصلی تصمیم بگیرم؛ با اجارهٔ واقعیِ امسال وارسی کردم');
  await newSess();
  await say('یادته دربارهٔ خرید خونه حرف زدیم؟ حالا یه پیشنهادِ اجارهٔ دیگه دارم');
  { const u = await lastUser(), blk = block(u, '# مسئلهٔ حل‌شدهٔ مرتبط');
    info.b4 = { block: !!blk, lesson: /سه عددِ اصلی/.test(blk), check: /اجارهٔ واقعیِ امسال/.test(blk), blind: /مرورِ بی‌نگاه/.test(blk) }; }
  await newSess(); await say('یه معما دارم دربارهٔ ساعت‌های شنی'); info.b4.neg = !/# مسئلهٔ حل‌شدهٔ مرتبط \([^)]*\): «خرید/.test(await lastUser());
  chk(info.b4.block && info.b4.lesson && info.b4.check && info.b4.blind && info.b4.neg, 'B4: a new session about a closed related problem gets its method/result/look-back (blind recall first), not only the title; unrelated chat does not ' + JSON.stringify(info.b4));

  // ---------- B11/B5) پلهٔ پرسش از کاربستِ گفت‌وگو و بازنگری؛ سشنِ تازه مرحله را به یاد دارد ----------
  await p.evaluate(() => { window.__day = APP.addDays(window.__day, 1); });
  await newSess();
  const PUZ = 'جدولِ کلمات: یه کلمهٔ هشت‌حرفی با معنی «دور» که پالیندروم باشه؟';
  await say(PUZ);
  await ask('مجهول (یا حکمی که باید ثابت شود) چیست؟');
  await say('یه کلمهٔ هشت‌حرفی');
  await ask('شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟');
  await say('دو تا شرطه: یکی معنا، یکی املا که پالیندروم باشه');
  await say('داده‌ها هم معنی «دور» و هشت حرف');
  const day1 = await p.evaluate(() => ({ d: APP.today(), ph: APP.ASSIST.cur().coach.ph }));
  await p.evaluate(() => { window.__day = APP.addDays(window.__day, 1); });
  await newSess();
  await say(PUZ + ' هنوز رو همون جدولم');
  { const c = coachOf(await lastUser());
    info.b11 = { day1, ph: phOf(c), rung: await p.evaluate(() => { const L = APP.ASSIST.tutorQuestions.und.qs; return { unk: APP.qRung(L[0]), cond: APP.qRung(L[2]), suff: APP.qRung(L[3]) }; }), rungLine: /پلهٔ [۱-۹]/.test(c), coach: await p.evaluate(() => JSON.stringify(APP.ASSIST.cur().coach)) }; }
  chk(info.b11.rung.unk > 0 && info.b11.rung.cond > 0 && info.b11.rung.suff === 0, 'B11: questions answered in chat yesterday raise their rung (A.qRung); a question never asked does not ' + JSON.stringify(info.b11));
  chk(info.b11.day1.ph === 'p' && info.b11.ph === 'طرح‌ریزی', 'B11: a new session on the same chat-only problem remembers its phase ' + JSON.stringify(info.b11));
  // بازنگریِ خودش در گفت‌وگو (chat_solved با درس و وارسیِ به قلمِ خودش) ⇒ پلهٔ پرسش‌های بازنگری
  info.b5chat = await p.evaluate(() => { const r = APP.liveAll().filter(x => x.p.title === 'خرید یا اجارهٔ خانه')[0]; const q = APP.livePhaseQs(r.p.id, 'b').filter(x => /واقعیت سنجیدی|وارسی کنی|جای‌گذاری/.test(x))[0] || ''; return { q, rung: q ? APP.qRung(q) : -1 }; });
  chk(info.b5chat.rung > 0, 'B5: the user\'s own look-back (lesson and check in his words, via chat) raises the look-back question\'s rung ' + JSON.stringify(info.b5chat));

  // ---------- B8) قلمرو از حرفِ کاربر، نه از متنِ نوبتِ خودکار؛ «اثبات» ----------
  await newSess();
  await p.evaluate(() => __q.push(R({ reply: 'بازش کردم.', actions: [{ do: 'go', view: 'e_prob' }] })));
  await say('ثابت کن قطرهای مستطیل برابرند');
  info.b8 = await p.evaluate(() => {
    const auto = __calls.filter(c => /# نوبتِ تازه\n\[سامانه/.test(c.user)).pop(); if (!auto) return { auto: false };
    const u = auto.user, txt = (/# نوبتِ تازه\n(\[سامانه[^\n]*)/.exec(u) || [])[1] || '';
    const blk = (() => { const i = u.indexOf('# دانسته‌های قلمرو'); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); })();
    const fromAuto = APP.SYST.related(txt, 3).map(r => r.a.id), fromUser = APP.SYST.related('ثابت کن قطرهای مستطیل برابرند', 3).map(r => r.a.id);
    const noise = fromAuto.filter(id => fromUser.indexOf(id) < 0);
    return { auto: true, noise, leaked: noise.filter(id => blk.indexOf(id + ' ') >= 0) };
  });
  info.b8.stem = await p.evaluate(() => APP.SYST.toks ? { isbat: APP.SYST.toks('اثبات').join(), plural: APP.SYST.toks('اطلاعات').join() } : { missing: true });
  chk(info.b8.auto && info.b8.noise.length > 0 && info.b8.leaked.length === 0, 'B8: on the automatic turn «دانسته‌های قلمرو» relevance comes from the user\'s own words, not the system instruction text ' + JSON.stringify(info.b8));
  chk(info.b8.stem.isbat === 'اثبات' && info.b8.stem.plural === 'اطلاع', 'B8: «اثبات» is not stemmed to «اثب» (a real plural «اطلاعات» still is) ' + JSON.stringify(info.b8.stem));

  // ---------- B14) ضرب‌المثلِ نوع‌دار و هم‌جا؛ سلیقه و ته‌نشینی در میانه ----------
  info.b14 = await p.evaluate(() => {
    const AS = APP.ASSIST, pv = (c) => (/ضرب‌المثلِ همین مرحله \(پولیا، «حکمتِ ضرب‌المثل‌ها»\): «([^»]+)»/.exec(c) || [])[1] || '';
    const cObj = AS.coachLines({ ph: 'c', cls: 'obj', qs: [], dry: true }), cPr = AS.coachLines({ ph: 'c', cls: 'pract', qs: [], dry: true });
    const pStart = AS.coachLines({ ph: 'p', cls: 'obj', qs: [], dry: true, mt: 'نمی‌دونم از کجا شروع کنم' }), pSwitch = AS.coachLines({ ph: 'p', cls: 'obj', qs: [], dry: true, mt: 'می‌خوام طرح رو عوض کنم' });
    const cTired = AS.coachLines({ ph: 'c', cls: 'obj', qs: [], dry: true, mt: 'خسته شدم، ذهنم کار نمی‌کنه' });
    return { obj: pv(cObj), pract: pv(cPr), start: pv(pStart), sw: pv(pSwitch), tired: pv(cTired), taste: /کدام بخشش را دوست دارد/.test(cObj), incub: /بگذار ته‌نشین شود، بعد برگرد/.test(cObj) };
  });
  chk(/پله به پله/.test(info.b14.obj) && !/پله به پله/.test(info.b14.pract), 'B14: execution proverb is kind-aware (step-by-step proof for objective; not for a real-world task) ' + JSON.stringify(info.b14));
  chk(!/ماهیگیری/.test(info.b14.start) && /ماهیگیری/.test(info.b14.sw), 'B14: the plan-SWITCH proverb only when the user is switching plans, not at the start of planning ' + JSON.stringify(info.b14));
  chk(/سخت‌کوشی/.test(info.b14.tired) && info.b14.taste && info.b14.incub, 'B14: tired/stuck ⇒ incubation proverb; taste and «بگذار ته‌نشین شود، بعد برگرد» available mid-solve, not only in look-back ' + JSON.stringify(info.b14));

  // ================= صفحهٔ «🔭» (زمینهٔ تازه): B3 گیر + دادهٔ به‌کارنرفته؛ B9 کارتِ «🌱» وقتی خواستن کم شد + یادآور؛ B5 بازنگریِ صفحه ⇒ پله =================
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const q = await ctx.newPage();
    q.on('pageerror', e => errors.push('pageerror(live): ' + e.message));
    q.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
    await q.route('**/fonts.googleapis.com/**', r => r.abort());
    const Wq = (ms) => q.waitForTimeout(ms || 90);
    const go = async (v, a, s) => { await q.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await Wq(140); };
    const sel = async (s, v) => { await q.selectOption(s, v); await Wq(120); };
    /* E5 (دورِ ۴): بازنگری هر بخشِ ثبت‌شدهٔ شرط را جدا می‌پرسد (lpBCP_*) — این جریان‌ها نتیجه‌ای می‌سازند که شرط را برآورده می‌کند؛ پیش از ثبتِ بازنگری «بله» */ const click = async (s) => { if (/lp-lbsave/.test(s)) await q.evaluate(() => document.querySelectorAll('select[id^="lpBCP_"]').forEach(x => { if (!x.value) { x.value = 'yes'; x.dispatchEvent(new Event('change', { bubbles: true })); } })); await q.click(s); await Wq(160); };
    const has = (s) => q.locator(s).count();
    const txt = (s) => q.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, s);
    const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const day = async (n) => { await q.evaluate(x => { window.__day = x; }, D(n)); };
    const mk = async (o) => { await go('e_prob', null, 'live'); if (o.title != null) await q.fill('#lpNewT', o.title); await q.fill('#lpNewS', o.st); await Wq(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return q.evaluate(() => APP.state.arg); };
    const whole = async (one, why) => { await q.fill('#lpOne', one); await q.fill('#lpWhy', why); await click('main .lp-onesave'); };
    const understand = async (o) => {
      await whole(o.one, o.why || 'برایم مهم است و کنجکاوم');
      await q.fill('#lpUnk', o.unk);
      for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await q.fill('#lpD_d' + (i + 1), o.data[i]); }
      await q.fill('#lpCond', o.cond);
      if (await has('#lpSat')) await sel('#lpSat', 'yes');
      await sel('#lpSuff', o.suff || 'کافی است'); if (await has('#lpSuffW')) await q.fill('#lpSuffW', 'همین‌ها بس است');
      await q.fill('#lpGuess', o.guess || 'شدنی است'); await sel('#lpConf', '60'); await q.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
      await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    };
    const sayQ = async (text) => { await q.evaluate(() => APP.ASSIST.toggle(true)); await q.fill('.as-panel .as-in', text); await q.click('.as-panel .as-send'); await q.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 }); };
    await q.goto(FILE); await q.waitForSelector('.nav'); await Wq(300);
    await q.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; window.__calls = [];
      APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) });
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const t = JSON.stringify({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; }, D(0));
    // B3 — مسئلهٔ لوله (s02): فهم ثبت شد، طرح هنوز نه، هیچ داده‌ای به کار نرفته؛ کاربر «نمی‌دونم» می‌گوید
    const P1 = await mk({ title: 'لوله در بار', st: 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم بدانم بلندترین پاره‌خطِ درونِ بار از چهار متر بلندتر است یا نه', unk: 'بلندترین پاره‌خطِ درونِ بار', data: ['طول ۳.۲ متر', 'عرض ۱.۸ متر', 'ارتفاع ۱.۶ متر'], cond: 'لوله صاف است و باید کامل درونِ بار باشد' });
    info.b3 = { ph: await q.evaluate(pid => APP.livePhase(pid), P1), unused: await q.evaluate(pid => APP.liveUnused(pid).length, P1) };
    await q.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
    await sayQ('خب فکر کنم شبیهِ قطرِ مستطیله ولی ارتفاع هم داره');
    const one0 = await q.evaluate(() => (/در این نوبت فقط \*\*یک\*\* پرسش[^«]*«([^»]+)»/.exec(__calls[__calls.length - 1].user) || [])[1] || '');
    await sayQ('آره قطر مستطیل رو دیدم، همینو حساب کردم. باز ۳.۶۷ میشه. نمی‌دونم.');
    const u3 = await q.evaluate(() => __calls[__calls.length - 1].user);
    info.b3.one = (/در این نوبت فقط \*\*یک\*\* پرسش[^«]*«([^»]+)»/.exec(u3) || [])[1] || ''; info.b3.one0 = one0;
    info.b3.order = /اگر گیر است، اول کلی بپرس «همهٔ داده‌ها را به کار بردی؟»/.test(u3);
    chk(info.b3.ph === 'p' && info.b3.unused === 3 && /همهٔ داده‌ها/.test(info.b3.one) && !/همهٔ داده‌ها/.test(one0) && info.b3.order, 'B3: stuck («نمی‌دونم») with unused data ⇒ the one question is «have you used all the data?» before re-asking «seen it before?»; naming a datum only after the general question ' + JSON.stringify(info.b3));

    // B9 — مسئلهٔ زندگی: گامِ واقعی، نتیجه «کمی» و «کمتر می‌خواهم» ⇒ کارتِ «🌱»؛ ثبتِ گامِ کوچک ⇒ یادآور
    const P2 = await mk({ title: 'کلاسِ شبانه', st: 'نمی‌دانم کلاسِ شبانهٔ زبان را ثبت‌نام کنم یا نه؛ بعد از کار خیلی خسته‌ام.', nat: 'life' });
    await understand({ one: 'می‌خواهم ببینم کلاسِ شبانه با خستگی‌ام شدنی است یا نه', unk: 'ثبت‌نام بکنم یا نه', data: ['سه شب در هفته وقت دارم', 'بعد از کار خسته‌ام'], cond: 'خسته‌تر نشوم' });
    await sel('#lpMv', 'mv_special'); await q.fill('#lpMvWhy', 'یک جلسهٔ آزمایشی حالتِ ساده‌تر است'); await click('main .lp-mvadd');
    await q.fill('#lpPlan', 'نخست یک جلسهٔ آزمایشی، سپس تصمیم'); await Wq(350);
    for (const id of await q.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await q.fill('#lpPU_w_' + id, 'در گامِ آزمایشی به کار می‌رود'); }
    await click('main .lp-plansave');
    await q.fill('#lpStep', 'در یک جلسهٔ آزمایشیِ کلاس شرکت کنم'); await sel('#lpClear', 'بله'); await q.fill('#lpPred', 'خسته نمی‌شوم'); await sel('#lpConf', '60'); await q.fill('#lpWhen', 'فردا');
    for (const id of await q.evaluate(() => [...document.querySelectorAll('main select[id^="lpSU_"]')].map(x => x.id))) await sel('#' + id, 'notyet');
    await click('main .lp-stepsave');
    if (await has('#lpSwitch')) { await sel('#lpSwitch', 'same'); await click('main .lp-stepsave'); }
    info.b9 = { steps: await q.evaluate(pid => APP.S.get('eprog_' + pid).solve.live.steps.length, P2), miss: await txt('main .lp-stepmiss') };
    await day(1); await go('lprob', P2, 'exec');
    await sel('#lpODone', 'part'); await q.fill('#lpOWhat', 'رفتم ولی خیلی خسته شدم'); await sel('#lpOMatch', 'part'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'less');
    if (await has('#lpOGuess')) await sel('#lpOGuess', 'none');
    await click('main .lp-outsave');
    info.b9.card = await has('main .lp-after .sv-will');
    if (info.b9.card) {
      const ids = await q.evaluate(() => [...document.querySelectorAll('main .lp-after .sv-will select, main .lp-after .sv-will input, main .lp-after .sv-will textarea')].map(e => e.id));
      const Wd = pre => ids.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
      await sel('#' + Wd('des'), 'some'); await sel('#' + Wd('hope'), 'unsure'); await q.fill('#' + Wd('cur'), 'این‌که زبان را دوباره حرف بزنم');
      await q.fill('#' + Wd('step'), 'برنامهٔ کلاس را ده دقیقه بخوانم و یک جلسهٔ کوتاه‌تر پیدا کنم'); await q.fill('#' + Wd('when'), 'فردا ساعتِ ۸ شب، ده دقیقه'); await sel('#' + Wd('bud'), 'one');
      await click('main .lp-after .sv-willsave');
    }
    info.b9.rem = await q.evaluate(pid => window.__rem.filter(x => x.key && x.key.indexOf('will:prob:' + pid) === 0).map(x => ({ d: x.due_date, h: x.hour, link: x.link })), P2);
    chk(info.b9.steps === 1 && info.b9.card === 1, 'B9: a real step whose outcome says «I want it less» opens the «🌱 smallest next step» card on the problem page ' + JSON.stringify(info.b9));
    chk(info.b9.rem.length === 1 && info.b9.rem[0].h === 19 && /lprob/.test(info.b9.rem[0].link), 'B9: the 🌱 step is pushed as a reminder before the user\'s own hour («ساعتِ ۸ شب» ⇒ 19:00), linking to the problem ' + JSON.stringify(info.b9.rem));
    // B5 — بازنگریِ کاملِ همین مسئله در صفحه ⇒ پلهٔ پرسش‌های بازنگری بالا می‌رود (s30: پس از سه بازنگری همه «پلهٔ ۰» بودند)
    const QB = await q.evaluate(() => APP.ASSIST.tutorQuestions.back.qs[0]);
    info.b5 = { before: await q.evaluate(x => APP.qRung(x), QB) };
    await click('main .lp-solved');
    await q.fill('#lpBChk', 'با برنامهٔ هفتهٔ بعد سنجیدم که سه شب واقعاً آزاد است'); await sel('#lpBRes', 'نتیجه سالم ماند');
    await q.fill('#lpBOther', 'با پرسیدن از همکلاسی‌ها هم به همین می‌رسیدم'); await q.fill('#lpBGlance', 'یک جلسهٔ آزمایشی تصمیم را روشن کرد');
    await q.fill('#lpBWorked', 'آزمودنِ کوچک پیش از تصمیمِ بزرگ'); await q.fill('#lpBUse', 'پیش از تعهدِ بلند، یک نسخهٔ کوچکش را بیازمایم');
    await q.fill('#lpBNew', 'آیا باشگاهِ ورزشیِ صبح‌ها را با همین خستگی ادامه بدهم؟'); if (await has('#lpBNewS')) await sel('#lpBNewS', 'method'); if (await has('#lpBNewW')) await q.fill('#lpBNewW', 'همان آزمودنِ یک جلسهٔ کوچک پیش از تعهدِ بلند');
    await q.fill('#lpBTaste', 'بخشِ آزمودن را دوست داشتم، فکرِ زیاد را نه');
    if (await has('#lpBHit')) await sel('#lpBHit', 'درست بود');
    if (await has('#lpBWant')) await sel('#lpBWant', 'same');
    if (await has('#lpBBest')) await sel('#lpBBest', 'none');
    for (const id of await q.evaluate(() => [...document.querySelectorAll('main select[id^="lpBU_a_"]')].map(x => x.id))) { await sel('#' + id, 'skip'); await q.fill('#' + id.replace('_a_', '_w_'), 'در این تصمیم اثری نداشت'); }
    await click('main .lp-lbsave');
    info.b5.done = await q.evaluate(pid => { const b = (APP.S.get('eprog_' + pid).solve.b || {})[1]; return !!(b && b.done); }, P2);
    info.b5.miss = info.b5.done ? '' : await q.evaluate(() => [...document.querySelectorAll('.toast')].map(t => t.textContent).join(' | '));
    info.b5.after = await q.evaluate(x => APP.qRung(x), QB);
    await q.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
    await sayQ('یه معمای دیگه رو حل کردم؛ جوابش اینه: ۱۲');
    info.b5.line = await q.evaluate(qb => { const u = __calls[__calls.length - 1].user; return (new RegExp('«' + qb.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^»]*» پلهٔ (\\S+)').exec(u) || [])[1] || ''; }, QB);
    chk(info.b5.done && info.b5.before === 0 && info.b5.after > 0 && info.b5.line && info.b5.line !== '۰', 'B5: a completed look-back on the page raises the rung of the look-back questions the user answered; the chat coach shows it ' + JSON.stringify(info.b5));
    await ctx.close();
  }

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 8000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
