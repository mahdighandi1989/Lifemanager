// تورِ پولیا (دستهٔ ۱، دورِ ۱۱ ِ اصلاح — «بی‌نقص»، بارِ دوم، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» (DECISIONS_R11: K1 سمتِ مربی، K2، K3 سمتِ a27، K5، K7، K8، K9، K10، K11).
// اصل (K1): هر سطرِ دستوری در هر بلوکِ قلابِ دستیار یا **همان** پرسشِ نوبت است یا «- زمینه (نه پرسشِ دوم):» بی «بپرس» و بی پرسشِ خودش.
//  struct  آزمونِ ساختاریِ سخت‌شده: همهٔ پرامپت‌هایی که فیکسچرهای دورهای ۷ تا ۱۱ (test_tour1_r7…r11*.js، با شنودِ prompt_tap.js) و همین آزمون
//          می‌سازند — بیرون از سطرِ پرسشِ نوبت هیچ سطری «بپرس» ندارد و هیچ سطرِ بی‌نشانِ «زمینه» به «؟» ختم نمی‌شود (بلوکِ «مسئلهٔ زندهٔ این سشن» سهمِ «live» است)
//  open    مسئلهٔ بازِ تنها: «همین را ادامه می‌دهی؟» لحظه‌ای در تابعِ اولویتِ مربی (s34 p6/p8)؛ بی بلوکِ مربی خودش پرسشِ نوبت؛ حرفش دربارهٔ همان ⇒ پرسشِ مرحلهٔ صفحه‌اش
//  recall  مرورِ بی‌نگاهِ مسئلهٔ حل‌شدهٔ مرتبط: لحظه (s01 p10)؛ وقتی پیامش خودش جواب داد («مجهولم … بود، راهم …») نه (s01 p11، s12 p8)
//  claim   قاعدهٔ عامِ ادعا («ثابتش کن یا با مثالِ نقض…») پرسشِ خودش را ندارد (s11 p5، s12 p4، s14 p9، s20 p3، s13 p5)
//  teach   K11: «خودم حلش کردم» ِ قابِ معلم لحظهٔ A167t است؛ نه وقتی گفت کدام پرسش را پرسید (s15 p2) و نه «خودم بلدم» (s16 p1)
//  guess   K2: «به نظرم/شاید/فکر کنم … » با هر پایانی حدس است (s21 p2، s22 p1، s23 p1، s26 p1، s29 p1)، با مسئلهٔ زنده هم (s29 p7)؛ کنترل: نیت/خودِ او
//  only    K3: «زود بگو»، «یه راه‌حل بده»، «فقط بگو X یا Y؟» بی تلاش ⇒ A073 (s01، s02، s04، s05)؛ کنترل: با تلاشِ دیدنی زمینه
//  kind    K5: داورِ انتخاب‌نشده ⇒ سرواژهٔ خنثی و اشاره بی نامِ فهرست (s22 p4)
//  prov    K7: ضرب‌المثلِ مرحله نقلی را که در همان بلوک آمده تکرار نمی‌کند (قارچ‌ها، «جایی که اراده‌ای هست…»)
//  terr    K8: لحظه ⇐ حوزه با پیوندِ صریح از ثبت‌گاهِ پوشش (terr: در coverage.json) — s07 (a_induction، pr_hypothesis_testing)، s05 (md_cognitive_biases/a_confirmation)،
//          s04 (sc_negotiation از نشانهٔ خودِ مسئله)؛ گرافِ «🗺 نقشه‌ها» یالِ «پوشش» را خودش دارد؛ E6 (تک‌واژه) می‌ماند
//  intro   K9: «یه مسئلهٔ واقعی دارم: …» پس از پیامِ نخستِ فرا ⇒ معرفیِ مسئلهٔ تازه (A191) (s30 p2)
//  related K10: «(n−۲)×۱۸۰ رو بلدم ولی نمی‌دونم ربطش چیه» ⇒ پرسشِ مسئلهٔ مرتبط (s38 p7)
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلی، فرم‌های «🔭»)؛ خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE = ساختِ دیگر (خطِ قرمز: 9aa88c9)؛ ONLY=… ؛ DUMP=1.
// LLA_STRUCT_FIX=0 فیکسچرهای دورهای ۷–۱۱ را اجرا نمی‌کند (فقط پرامپت‌های همین آزمون).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

// ---------- ساختار (K1): قاعدهٔ سخت‌شده، برای هر پرامپت ----------
const SKIP = /^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|امروز|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها|کارنامهٔ ذهن|مسئلهٔ زندهٔ این سشن)/;
const isTurnLine = (l) => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) || /^- پرسش‌های «/.test(l) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l);
const isCtxLine = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l) || /^- \(زمینه، نه پرسشِ دوم/.test(l);
const ASK = /(?:^|[^آ-ی])بپرس(?![آ-ی])/;
const ENDQ = /[؟?][»"')\].\s*]*$/;
function strictScan(user) {
  const head = String(user || '').split('# نوبتِ تازه')[0], bad = [];
  for (const bl of head.split(/\n(?=# )/)) {
    const h = bl.split('\n')[0]; if (!/^# /.test(h) || SKIP.test(h)) continue;
    const blockCtx = /\n- \(زمینه، نه پرسشِ دوم/.test(bl);
    for (const l of bl.split('\n')) {
      if (isTurnLine(l)) continue;
      const nq = l.replace(/«[^»]*»/g, '«»');
      if (ASK.test(nq)) bad.push('ASK  [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
      else if (ENDQ.test(l.trim()) && !isCtxLine(l) && !blockCtx) bad.push('ENDQ [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
    }
  }
  return bad;
}

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__all = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); __all.push(String(user || '')); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => { const c = __calls.filter(x => !/^\[سامانه/.test(String(((x.user || '').split('# نوبتِ تازه\n')[1] || '')).trim())); return (c[c.length - 1] || __calls[__calls.length - 1] || {}).user || ''; });
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^\n]*?)»(?: \(|\. اگر|$)/.exec(c) || [])[1] || '';
  const lineOf = (c, re) => (c.split('\n').filter(l => re.test(l))[0] || '');
  const isCtx = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l);
  const isTurn = (l) => /^- \*\*پرسشِ این نوبت همین است:\*\*/.test(l);
  const turnLines = (c) => c.split('\n').filter(isTurn);
  const first = async (msg) => { await newSess(); await say(msg); return await lastUser(); };
  const pair = async (open, msg) => { await newSess(); await say(open); await say(msg); return await lastUser(); };
  const oneOf = (u) => lineOf(liveOf(u), /^- در این نوبت فقط \*\*یک\*\* پرسش/);
  const strict = (name, u) => { const bad = strictScan(u); if (process.env.DUMP && bad.length) console.log('## ' + name + '\n  ' + bad.join('\n  ')); chk(!bad.length, 'K1 strict: «' + name + '» has ' + bad.length + ' line(s) outside the turn line with «بپرس» or an unmarked «؟» ending: ' + JSON.stringify(bad.slice(0, 4))); };
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= recall — مرورِ بی‌نگاه لحظه است (s01 p10، p11) =================
  await section('recall', async () => {
    const r = info.recall = {};
    await newSess();
    await p.evaluate(() => __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'خرید یا اجارهٔ خانه', statement: 'خانه بخرم یا اجاره کنم؟ پنج سال در همین شهر می‌مانم و پس‌انداز دارم.', kind: 'find', unknown: 'گزینهٔ ارزان‌تر در پنج سال', lesson: 'اول جمع‌کردنِ داده را متوقف کنم و با سه عددِ اصلی تصمیم بگیرم', check: 'با اجارهٔ واقعیِ امسال وارسی کردم' }] })));
    await say('تصمیم گرفتم اجاره کنم. درسم اینه: اول جمع‌کردنِ داده را متوقف کنم و با سه عددِ اصلی تصمیم بگیرم؛ با اجارهٔ واقعیِ امسال وارسی کردم');
    const u1 = await first('سلام. یادته دربارهٔ خرید خونه حرف زدیم؟ همکارم هم الان دقیقاً همین سؤال رو داره که خونه بخره یا اجاره کنه. چی بهش بگم؟');
    const c1 = coachOf(u1), sb1 = block(u1, '# مسئلهٔ حل‌شدهٔ مرتبط');
    r.p10 = { block: !!sb1, sug: sugOf(c1).slice(0, 70), turn: turnLines(c1).some(l => /مرورِ بی‌نگاه/.test(l)), blindCtx: isCtx(lineOf(sb1, /مرورِ بی‌نگاه/)), oldAsk: /پیش از یادآوری بپرس/.test(sb1) };
    chk(r.p10.block && /یادت هست مجهول و راهت/.test(r.p10.sug) && r.p10.turn && r.p10.blindCtx && !r.p10.oldAsk, 'recall: the blind recall of a related solved problem is the ONE turn question of the coach (a moment), and the solved block\'s line is context without «بپرس» (s01 p10) ' + JSON.stringify(r.p10));
    strict('recall p10', u1);
    await say('آره، مجهولم گزینهٔ ارزان‌تر در پنج سال بود، راهم این بود که فقط سه عدد اصلی رو مقایسه کردم. پس به همکارم بگم اجاره کنه؟');
    const u2 = await lastUser(), c2 = coachOf(u2), sb2 = block(u2, '# مسئلهٔ حل‌شدهٔ مرتبط');
    r.p11 = { block: !!sb2, recall: /یادت هست مجهول و راهت/.test(c2 + sb2), blind: /مرورِ بی‌نگاه/.test(sb2) };
    chk(r.p11.block && !r.p11.recall && !r.p11.blind, 'recall: when his message already answers it («مجهولم … بود، راهم …») the blind recall is gone — moment and line (s01 p11) ' + JSON.stringify(r.p11));
    strict('recall p11', u2);
    const u3 = await first('مثل دیروز همون روشِ سه عددِ اصلی رو برای اجارهٔ خونهٔ جدید به کار بردم.');
    r.like = { recall: /یادت هست مجهول و راهت/.test(coachOf(u3) + block(u3, '# مسئلهٔ حل‌شدهٔ مرتبط')) };
    chk(!r.like.recall, 'recall: «مثل دیروز همون روش…» answers the recall — no blind-recall question (s12 p8) ' + JSON.stringify(r.like));
  });

  // ================= open — مسئلهٔ بازِ تنها (s34 p6/p8؛ r5 F3) =================
  await section('open', async () => {
    const r = info.open = {};
    const P = await mk({ title: 'پروژهٔ پایانیِ ارشد', st: 'پروژهٔ پایانیِ ارشدِ معماری را سه ماه است شروع نکرده‌ام: پلانِ یک مدرسه با حیاط و دو خیابانِ فرعی.', nat: 'life' });
    r.pid = P;
    const u = await first('سلام، چند روز نبودم. امروز دوباره اومدم که کار کنم.');
    const c = coachOf(u), ob = block(u, '# مسئلهٔ بازِ تو');
    r.ret = { block: !!ob, sug: sugOf(c).slice(0, 80), turn: turnLines(c).some(l => /مسئلهٔ بازِ دیگر/.test(l)), blockCtx: ob.split('\n').slice(1).filter(Boolean).every(isCtx), ask: /بپرس/.test(ob) };
    chk(r.ret.block && /همان مسئلهٔ بازت \(پروژهٔ پایانیِ ارشد\) را ادامه می‌دهی؟/.test(r.ret.sug) && r.ret.turn && r.ret.blockCtx && !r.ret.ask, 'open: with one open problem, «همان مسئلهٔ بازت (…) را ادامه می‌دهی؟» is the coach\'s ONE turn question (a moment) and the «مسئلهٔ بازِ تو» block is context without «بپرس» (s34 p6/p8) ' + JSON.stringify(r.ret));
    strict('open return', u);
    // «سلام» تنها: بلوکِ مربی نیست ⇒ همان سطرِ بلوک پرسشِ نوبت است
    const u0 = await first('سلام');
    const ob0 = block(u0, '# مسئلهٔ بازِ تو');
    r.hello = { coach: !!coachOf(u0), line: (ob0.split('\n')[1] || '').slice(0, 90) };
    chk(!r.hello.coach && ob0 && isTurn(ob0.split('\n')[1] || ''), 'open: with no coach block («سلام»), the open-problem line itself is the turn question ' + JSON.stringify(r.hello));
    strict('open hello', u0);
    // حرفش آشکارا دربارهٔ همان مسئله است ⇒ پرسشِ مرحلهٔ صفحه‌اش، نه «ادامه می‌دهی؟»
    const u2 = await first('دیروز تو مترو یه ایده برای پلانِ مدرسه به ذهنم رسید: حیاط رو کنار خیابانِ فرعی بذارم.');
    const c2 = coachOf(u2), ob2 = block(u2, '# مسئلهٔ بازِ تو');
    const pageQ = await p.evaluate(pid => (APP.ASSIST.liveNextQ(pid) || {}).q || '', P);
    r.on = { sug: sugOf(c2).slice(0, 80), pageQ: pageQ.slice(0, 80), cont: /را ادامه می‌دهی؟/.test(c2), ctx: ob2.split('\n').slice(1).filter(Boolean).every(isCtx) };
    chk(pageQ && r.on.sug && pageQ.indexOf(r.on.sug.slice(0, 20)) === 0 && !r.on.cont && r.on.ctx, 'open: a message plainly about that open problem gets the turn question of its page stage, not «ادامه می‌دهی؟» ' + JSON.stringify(r.on));
    strict('open on', u2);
    await p.evaluate(pid => { const x = APP.liveRec(pid); if (x) { x.dormant = '2099-01-01'; APP.S.put(x); } }, P);   // بقیهٔ بخش‌ها: مسئلهٔ بازِ تنها نه
  });

  // ================= claim — قاعدهٔ عامِ ادعا بی پرسشِ خودش =================
  await section('claim', async () => {
    const r = info.claim = {};
    const cases = [
      ['s11 p5 guess', ['یه صفحهٔ شطرنج ۸×۸ داریم که دو گوشهٔ روبه‌روش بریده شده. با دومینوهای ۱×۲ می‌شه پوشوندش؟', 'حدسم اینه که نمی‌شه، چون رنگ‌ها جور نیست، درسته؟']],
      ['s13 p2 claim', ['همکارم فاکتورهای ناهار رو بیشتر ثبت می‌کنه.', 'من فقط یه قاعده می‌خوام. اگه گزارش ندم شریک جرمم دیگه، نه؟ حق با کیه؟']],
      ['plain', ['یه مسئله دارم: سه تا عدد فرد که جمعشون ۳۰ بشه پیدا کن.']],
    ];
    r.lines = [];
    for (const [name, msgs] of cases) {
      await newSess(); for (const m of msgs) await say(m); const u = await lastUser(), c = coachOf(u), l = lineOf(c, /ادعای محلِ بحث/);
      r.lines.push({ name, ctx: isCtx(l), turn: isTurn(l), oldQ: /کدام را اول امتحان می‌کنی؟»\.?/.test(l.split('**پرسشِ این نوبت همین است')[0]) });
      strict('claim ' + name, u);
    }
    chk(r.lines.every(x => (x.ctx || x.turn) && !x.oldQ), 'claim: the generic claim rule carries no question of its own — it is the turn line (when the guess/claim of THIS message wins) or context ' + JSON.stringify(r.lines));
  });

  // ================= teach — K11 =================
  await section('teach', async () => {
    const r = info.teach = {};
    const u1 = await pair('می‌خوام به پسرم یاد بدم چطور دو تا کسر رو جمع کنه؛ ۱/۲ + ۱/۳ رو نمی‌تونه', 'دیشب خودم حلش کردم ولی اون هنوز گیره.');
    const c1 = coachOf(u1); r.self = { sug: sugOf(c1).slice(0, 60), turn: turnLines(c1).some(l => /خودم حلش کردم/.test(l)), frameAsk: /بپرس یادگیرنده کجاست/.test(c1) };
    chk(/یادگیرنده‌ات الان کجای کار است/.test(r.self.sug) && r.self.turn && !r.self.frameAsk, 'teach: «خودم حلش کردم» in the teacher frame is the A167t moment — the ONE turn question asks where the learner is and which question he asked (K11) ' + JSON.stringify(r.self));
    strict('teach self', u1);
    const u15 = await pair('شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. یه همکار گفت «سؤال بپرس» ولی سؤال‌های من یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟',
      'مثلاً دیروز مسئله‌ی دو مثلث بود، گفتم: «خب بچه‌ها، اینجا باید از تشابه استفاده کنیم، نه؟» همه گفتن «بله خانم» و بعد باز ساکت شدن. بعد خودم حل کردم.');
    const c15 = coachOf(u15); r.s15 = { a167t: /یادگیرنده‌ات الان کجای کار است/.test(c15), frameAsk: /بپرس یادگیرنده کجاست/.test(c15) };
    chk(!r.s15.a167t && !r.s15.frameAsk, 'teach: she already said which question she asked (s15 p2) ⇒ no A167t question and no free «بپرس…» frame line ' + JSON.stringify(r.s15));
    strict('teach s15 p2', u15);
    const u16 = await first('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم که زود تموم شه بریم بخوابیم.');
    const c16 = coachOf(u16); r.s16 = { a167t: /یادگیرنده‌ات الان کجای کار است/.test(c16), frameAsk: /بپرس یادگیرنده کجاست/.test(c16), turns: turnLines(c16).length };
    chk(!r.s16.a167t && !r.s16.frameAsk && r.s16.turns <= 1, 'teach: «خودم بلدم» (s16 p1) is not «I solved it» — no A167t, no free frame question beside the turn question ' + JSON.stringify(r.s16));
    strict('teach s16 p1', u16);
  });

  // ================= guess — K2 =================
  await section('guess', async () => {
    const r = info.guess = {};
    const isG = (c) => /همین پیام حدس است/.test(c) && /می‌آزمایی/.test(sugOf(c));
    const S21P1 = 'سلام. من بردیا هستم ۱۲ سالمه. مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 .';
    const C = {
      s21p2: coachOf(await pair(S21P1, 'شاه سفید f6، وزیر سفید d1، رخ سفید a1 گوشه، شاه سیاه f8. معمولاً اول همه‌ی کیش‌ها رو امتحان می‌کنم: وزیر d8 کیش، وزیر d7 کیش. هر دفعه شاه میره e8 یا g8. اون رخ گوشه به نظرم بی‌فایده‌ست، فقط تزئینیه. می‌خوام خودم حلش کنم، جوابو نگو.')),
      s22p1: coachOf(await first('از صندوق کلاس ۳ میلیون کم شده. فقط سه نفر کلید داشتن: سرایدار، معاون و منشی. سرایدار اون روز دیرتر رفته. معاون میگه منشی رو دیده که دم صندوق بوده. می‌خوام بفهمم کار کی بوده. به نظرم کار سرایداره چون دیر رفته، می‌خوام همین امروز باهاش برخورد کنم.')),
      s23p1: coachOf(await first('سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۲ پیمونه آرد، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم.')),
      s26p1: coachOf(await first('سه نفریم، یه موتور داریم که فقط دو نفر سوار می‌شن، سرعتش ۴۰ کیلومتر، پیاده هم ۵ کیلومتر. ایستگاه ۳۰ کیلومتره. قطار ۲ ساعت دیگه حرکت می‌کنه. می‌رسیم؟ به نظرم نه، نفر سوم ۶ ساعت پیاده‌ست.')),
      s29p1: coachOf(await first('۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟')),
    };
    r.hit = Object.fromEntries(Object.entries(C).map(([k, c]) => [k, { g: isG(c), sug: sugOf(c).slice(0, 40) }]));
    chk(Object.values(r.hit).every(x => x.g), 'guess: a declarative claim with «به نظرم/شاید/فکر کنم» about the problem\'s object is a guess at ANY ending ⇒ the turn question «چطور می‌آزمایی‌اش؟» (s21 p2, s22 p1, s23 p1, s26 p1, s29 p1) ' + JSON.stringify(r.hit));
    const ctl = {
      mountain: coachOf(await first('شاید فردا برم کوه، هنوز تصمیم نگرفتم. بعدش باید گزارش رو بنویسم.')),
      self: coachOf(await first('سه ماهه پروژه رو شروع نکردم. فکر کنم استعدادشو ندارم و هر روز لپ‌تاپ رو باز می‌کنم و می‌بندم.')),
      should: coachOf(await first('جلسه خراب شد، دعوامون شد. فکر کنم باید خود مسئله رو یه جور دیگه بگم.')),
    };
    r.ctl = Object.fromEntries(Object.entries(ctl).map(([k, c]) => [k, /همین پیام حدس است/.test(c)]));
    chk(!Object.values(r.ctl).some(Boolean), 'guess: controls — a future intention («شاید فردا برم کوه»), an opinion about himself («فکر کنم استعدادشو ندارم») and an intention («فکر کنم باید…») are not guesses ' + JSON.stringify(r.ctl));
    // با مسئلهٔ زنده: turn.guess به A.liveCoach می‌رسد (s29 p7)
    r.stage = 'live';
    const P = await mk({ title: 'حوضِ مماس بر سه مسیر', st: 'حوضی گرد می‌خواهم که بر سه مسیرِ راستِ باغ مماس باشد؛ مرکزش کجاست؟', nat: 'objective' });
    await pageSess(P);
    await say('طرحمو کشیدم: مسیر A و B رو عمود کشیدم و C موازی A. فکر کنم مرکز وسطِ بینِ A و C و روی نیمسازِ A و B است.');
    const u = await lastUser(); r.live = { one: oneOf(u).slice(-160), turn: await p.evaluate(pid => { const s = APP.ASSIST.cur(); return !!(APP.ASSIST.coachTurn(s, pid, 'فکر کنم مرکز وسطِ بینِ A و C و روی نیمسازِ A و B است.') || {}).guess; }, P) }; delete r.stage;
    chk(r.live.turn && /می‌آزمایی/.test(r.live.one), 'guess: on a live problem «فکر کنم مرکز … است» sets turn.guess and the live block\'s one question tests the guess (s29 p7) ' + JSON.stringify(r.live));
    await p.evaluate(pid => { const x = APP.liveRec(pid); if (x) { x.dormant = '2099-01-01'; APP.S.put(x); } }, P);
  });

  // ================= only — K3 =================
  await section('only', async () => {
    const r = info.only = {};
    const T = {
      s02: 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟ زود بگو مشتری منتظره.',
      s04: 'چهار تا خواهر و برادریم. خونه‌ی پدری رو هیچ‌کس نمی‌خواد بفروشه، هر کدوم سهم مساوی می‌خوایم، خواهرم می‌خواد خودش توش زندگی کنه، برادرم پول نقد می‌خواد همین امسال. یه راه‌حل بده که همه راضی باشن.',
      s01: 'سلام. سه ماهه دارم فایل اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم. ۴۷ تا ستون داره: نرخ تورم، قیمت متری محله‌ها، وام، اجاره. هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم. فقط بگو بخرم یا نه؟',
    };
    r.hit = {};
    for (const [k, m] of Object.entries(T)) { const c = coachOf(await first(m)); r.hit[k] = { turn: isTurn(lineOf(c, /«فقط جواب» خواست/)), sug: sugOf(c).slice(0, 40) }; }
    const c05 = coachOf(await pair('مطمئنم مدیرم عمداً جلوی ترفیع منو گرفته. دو نفر که از من دیرتر اومدن ترفیع گرفتن. می‌خوام بهش ایمیل تند بزنم یا برم پیش مدیرعامل. کدوم بهتره؟', 'دو نفر بعد از من اومدن و ترفیع گرفتن، مدیرم هم باهام سرده. صد در صد کار خودشه. فقط بگو ایمیل یا مدیرعامل؟'));
    r.hit.s05 = { turn: isTurn(lineOf(c05, /«فقط جواب» خواست/)), sug: sugOf(c05).slice(0, 40) };
    chk(Object.values(r.hit).every(x => x.turn && /تا کجا رفتی/.test(x.sug)), 'only: «زود بگو», «یه راه‌حل بده», «فقط بگو X یا Y؟» with no visible attempt ⇒ A073 «خودت تا کجا رفتی و کجا ماندی؟» is the turn question (s01, s02, s04, s05) ' + JSON.stringify(r.hit));
    const cc = coachOf(await first('بیشترین حاصل‌ضرب دو عدد مثبت که جمعشون ۱۰ه چنده؟ امتحان کردم: ۴×۶=۲۴، ۵×۵=۲۵. زود بگو.'));
    r.ctl = { ctx: isCtx(lineOf(cc, /«فقط جواب» خواست/)) };
    chk(r.ctl.ctx, 'only: control — with a visible attempt, «زود بگو» keeps A073 as context ' + JSON.stringify(r.ctl));
    r.fatherNot = !/«فقط جواب» خواست/.test(coachOf(await first('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره» خودم بلدم، فقط بگو چطوری بهش بگم.')));
    chk(r.fatherNot, 'only: control — «فقط بگو چطوری بهش بگم» (no «X یا Y») is not «فقط جواب» ' + JSON.stringify(r));
  });

  // ================= kind — K5 =================
  await section('kind', async () => {
    const r = info.kind = {};
    const P = await mk({ title: 'صندوقِ کلاس', st: 'از صندوقِ کلاس سه میلیون کم شده؛ سه نفر کلید داشتند. کارِ کی بوده؟' });
    r.ki = await p.evaluate(pid => APP.liveKindInfo(pid), P);
    await pageSess(P); await say('هنوز نمی‌دونم از کجا شروع کنم.');
    const u = await lastUser(), c = coachOf(u), h = c.split('\n')[0];
    r.head = h.slice(0, 200); r.ptr = lineOf(c, /^- پرسشِ این نوبت: \*\*فقط\*\*/).slice(0, 200);
    chk(r.ki && r.ki.set === false, 'kind: a problem created without choosing its judge has kind unset (fixture) ' + JSON.stringify(r.ki));
    chk(!/داور: واقعیت و داوریِ خودش|تصمیم\/کارِ واقعی|پاسخِ عینی|اثباتی/.test(h), 'kind: judge unset ⇒ neutral coach header (no frame named) (s22 p4) ' + JSON.stringify(r.head));
    chk(r.ptr && !/از همان فهرستِ/.test(r.ptr) && /همان پرسشِ بلوکِ زنده/.test(r.ptr), 'kind: judge unset ⇒ the pointer says «همان پرسشِ بلوکِ زنده» without naming a list (s22 p4) ' + JSON.stringify(r.ptr));
    // کنترل: داورِ انتخاب‌شده ⇒ سرواژهٔ نوع‌دار
    const P2 = await mk({ title: 'خانهٔ اجاره‌ای', st: 'خانه‌ای اجاره کنم که تا مدرسهٔ پسرم پیاده باشد؛ کدام محله؟', nat: 'life' });
    await pageSess(P2); await say('هنوز نمی‌دونم از کجا شروع کنم.');
    const c2 = coachOf(await lastUser()); r.ctlHead = c2.split('\n')[0].slice(0, 200);
    chk(/تصمیمِ زندگی/.test(r.ctlHead) && /از همان فهرستِ/.test(lineOf(c2, /^- پرسشِ این نوبت: \*\*فقط\*\*/)), 'kind: control — a chosen judge keeps its framed header and list pointer ' + JSON.stringify(r.ctlHead));
    for (const x of [P, P2]) await p.evaluate(pid => { const y = APP.liveRec(pid); if (y) { y.dormant = '2099-01-01'; APP.S.put(y); } }, x);
  });

  // ================= prov — K7 =================
  await section('prov', async () => {
    const r = info.prov = { cases: [] };
    const provQ = (c) => { const l = lineOf(c, /^- ضرب‌المثلِ همین مرحله/); const m = /\): «([^»]+)»/.exec(l); return m ? m[1] : ''; };
    const norm = (t) => String(t || '').replace(/[\s‌«»"'.،,؛:!…—\-()]+/g, '');
    /* همان وضعِ سشن‌های تور: ضرب‌المثل‌های پیشینِ همان مرحله در همین سشن مصرف شده‌اند و نوبت به همان نقلی می‌رسد که سطرِ دیگرِ بلوک هم دارد
       (s12 p7، s14 p6، s16 p4، s18 p6، s20 p6: قارچ‌ها؛ s12 p5، s14 p1، s19 p1/p2: «جایی که اراده‌ای هست…») */
    const seedExcept = (ph, keys, re) => p.evaluate(([ph, keys, re]) => { const AS = APP.ASSIST, s = AS.cur(), K = ['u', 'goal', 'five', 'p', 'rel', 'p2', 'switch', 'c', 'cobj', 'back', 'want', 'b', 'new', 'will', 'incub'];
      const L = [].concat.apply([], ['u', 'p', 'c', 'b'].map(x => AS.polyaProverbsFor(x, K) || []).concat([AS.polyaProverbsFor(ph, keys) || []])); s.coach = s.coach || {};
      s.coach.prov = L.filter(x => !new RegExp(re).test(String(x.q) + ' ' + String(x.n || ''))).map(x => x.id || x.q); APP.S.put(s); return L.filter(x => new RegExp(re).test(String(x.q) + ' ' + String(x.n || ''))).map(x => (x.id || '') + ':' + String(x.q).slice(0, 24)); }, [ph, keys, re]);
    const cases = [
      ['b', ['b', 'new'], 'قارچ', 'حلش کردم! بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه وقتیه که همه‌شون مساوی‌ان، ۵×۵=۲۵.'],
      ['u', ['will', 'u', 'goal', 'five'], 'اراده', 'دیگه ولش کنم، این مسئلهٔ جدول رو نمی‌تونم. خسته شدم.'],
      ['p', ['will', 'p', 'rel', 'p2'], 'اراده', 'طرحم اینه که اول جدول بکشم. ولی نتونستم، ولش می‌کنم.'],
    ];
    for (const [ph, keys, re, m] of cases) {
      await newSess(); const seeded = await seedExcept(ph, keys, re); await say(m);
      const c = coachOf(await lastUser()), q = provQ(c), rest = c.split('\n').filter(l => !/^- ضرب‌المثلِ همین مرحله/.test(l)).join('\n'), k = norm(q).slice(0, 18);
      r.cases.push({ m: m.slice(0, 24), seeded, q: q.slice(0, 40), dup: !!k && norm(rest).indexOf(k) >= 0 });
    }
    chk(r.cases.some(x => x.q) && !r.cases.some(x => x.dup), 'prov: the stage proverb never repeats a quote already in the same block (mushrooms, «جایی که اراده‌ای هست…») ' + JSON.stringify(r.cases));
  });

  // ================= terr — K8 =================
  await section('terr', async () => {
    const r = info.terr = {};
    const kOf = (u) => block(u, '# دانسته‌های قلمرو');
    const has = (u, id) => kOf(u).indexOf(' ' + id + ' ') >= 0;
    // ثبت‌گاه: هر «terr:» ِ دفترِ پوشش به حوزهٔ موجود می‌رسد و گراف یالِ «پوشش» را دارد
    r.reg = await p.evaluate(() => {
      const S0 = (window.SRC_COV || []).filter(x => x.id === 'polya_how_to_solve_it')[0], V = S0.coverage.verdicts, ids = [];
      Object.keys(V).forEach(k => (V[k].system || []).forEach(sid => { const m = /^terr:\s*(\S+)/.exec(sid); if (m) ids.push([k, m[1]]); }));
      const g = APP.GRAPH && APP.GRAPH.build ? APP.GRAPH.build() : null, E = g ? (g.edges || []) : [];
      const key = (e) => [e.a, e.b, e.rel].join('|');
      const ek = E.map(key).join('\n');
      return { n: ids.length, missing: ids.filter(x => !APP.SYST.byId(x[1])).map(x => x.join('>')), noNode: ids.filter(x => !APP.SOURCES.nodeOf('terr:' + x[1])).map(x => x.join('>')),
        edge: ids.filter(x => ek.indexOf('srcitem:polya_how_to_solve_it/' + x[0] + '|' + APP.SOURCES.nodeOf('terr:' + x[1]) + '|covers') < 0).map(x => x.join('>')), graph: !!g, ne: E.length };
    });
    chk(r.reg.n >= 7 && !r.reg.missing.length && !r.reg.noNode.length, 'terr: every «terr:» link in the Pólya coverage registry names an existing territory area with a graph node ' + JSON.stringify(r.reg));
    chk(r.reg.graph && !r.reg.edge.length, 'terr: the shared graph derives a «covers» edge for every moment ⇒ area link (never hand-drawn) ' + JSON.stringify(r.reg));
    // s07: استقرا و آزمونِ فرضیه
    await newSess();
    await say('۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.');
    const u1 = await lastUser();
    await say('تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست، کند میشه. حدسم اشباعه. یه مقاله هم پیدا کردم دربارهٔ اشباع فتوسنتز. پس ثابت شد دیگه، قانونش اشباعه!');
    const u2 = await lastUser();
    await say('هفتهٔ چهارم. ۲۴ ساعت نور فقط ۱۱ سانت شد و گیاه آسیب دید. ناامیدم، کل قانونم خراب شد.');
    const u3 = await lastUser();
    r.s07 = { p1: has(u1, 'pr_hypothesis_testing'), p2: has(u2, 'a_induction'), p3: has(u3, 'pr_hypothesis_testing') };
    chk(r.s07.p1 && r.s07.p2 && r.s07.p3, 'terr: s07 — the guess moment brings pr_hypothesis_testing, «پس ثابت شد» from cases brings a_induction, the counterexample brings pr_hypothesis_testing, as «دانسته‌های قلمرو» ' + JSON.stringify(r.s07));
    // s05: یقینِ بی‌آزمون ⇒ سوگیری‌ها / تأیید
    const u5 = await first('مطمئنم مدیرم عمداً جلوی ترفیع منو گرفته. دو نفر که از من دیرتر اومدن ترفیع گرفتن. می‌خوام بهش ایمیل تند بزنم یا برم پیش مدیرعامل. کدوم بهتره؟');
    r.s05 = { bias: has(u5, 'md_cognitive_biases'), conf: has(u5, 'a_confirmation'), line: isCtx(lineOf(coachOf(u5), /یقینِ بی‌آزمون/)) };
    chk(r.s05.bias && r.s05.conf && r.s05.line, 'terr: s05 — «مطمئنم …» (a vivid guess held as proven, B107) brings md_cognitive_biases and a_confirmation; the B107 line is context ' + JSON.stringify(r.s05));
    // s04: مذاکره از نشانهٔ خودِ مسئله
    const u4 = await first('چهار تا خواهر و برادریم. خونه‌ی پدری رو هیچ‌کس نمی‌خواد بفروشه، هر کدوم سهم مساوی می‌خوایم، خواهرم می‌خواد خودش توش زندگی کنه، برادرم پول نقد می‌خواد همین امسال. یه راه‌حل بده که همه راضی باشن.');
    r.s04 = { neg: has(u4, 'sc_negotiation') };
    chk(r.s04.neg, 'terr: s04 — the problem\'s own statement («راه‌حلی که همه راضی باشن») links sc_negotiation explicitly ' + JSON.stringify(r.s04));
    // کنترل: E6 — پیامی بی لحظه و بی نشانهٔ مسئله این حوزه‌ها را نمی‌آورد؛ «همه راضی» در پیامِ بعدی (نه صورت) هم نه
    const un = await first('امروز هوا خوب بود و یه کم پیاده‌روی کردم، بعد چای خوردم.');
    r.ctl = ['pr_hypothesis_testing', 'a_induction', 'md_cognitive_biases', 'a_confirmation', 'sc_negotiation'].filter(id => has(un, id));
    chk(!r.ctl.length, 'terr: control — a message with no Pólya moment and no problem cue gets none of these areas (E6 stays) ' + JSON.stringify(r.ctl));
    strict('terr s07 p2', u2); strict('terr s05', u5);
  });

  // ================= intro — K9 =================
  await section('intro', async () => {
    const r = info.intro = {};
    const u = await pair('یه چارچوب کامل می‌خوام که برای هر مسئله‌ای، از کار تا زندگی، قدم‌به‌قدم اجراش کنم و جواب بده. یه چک‌لیست ۱۰ مرحله‌ای بده که همیشه کار کنه.',
      'باشه، قبول. یه مسئلهٔ واقعی دارم: تو خط تولید بسته‌بندی کارخونه، خروجی روزانه ۸۰۰ کارتنه ولی هدف ۱۰۰۰ تاست. ۵ ایستگاه داریم: پرکن، درب‌بند، برچسب، کارتن‌گذار، پالت. فکر کنم گلوگاه درب‌بنده ولی مطمئن نیستم. با هم حلش کنیم.');
    const c = coachOf(u); r.a191 = /A191/.test(c); r.stmt = await p.evaluate(() => String((APP.ASSIST.cur().coach || {}).stmt || '').slice(0, 40)); r.sug = sugOf(c).slice(0, 40);
    chk(r.a191 && /خط تولید/.test(r.stmt), 'intro: «یه مسئلهٔ واقعی دارم: …» after a meta first message introduces a new problem — the A191 moment fires and the coach\'s statement is the real problem (s30 p2) ' + JSON.stringify(r));
    strict('intro s30 p2', u);
  });

  // ================= related — K10 =================
  await section('related', async () => {
    const r = info.related = {};
    const u = await pair('یه تکلیف دیگه: «ثابت کنید مجموع زاویه‌های خارجی هر چندضلعی محدب ۳۶۰ درجه است.» برای مثلث و مربع امتحان کردم درسته.', 'مجموع زاویه‌های داخلی؟ (n−۲)×۱۸۰ رو بلدم ولی نمی‌دونم ربطش چیه. گیرم.');
    const c = coachOf(u); r.sug = sugOf(c).slice(0, 60); r.turn = turnLines(c).some(l => /مرتبطی هست که پیش‌تر حل شده/.test(l));
    chk(/از نتیجه یا روشِ همان که بلدی/.test(r.sug) && r.turn, 'related: «X رو بلدم ولی نمی‌دونم ربطش چیه» ⇒ the related-problem question (A032/B100) is the turn question, not «فرض چیست؟» (s38 p7) ' + JSON.stringify(r));
    r.sig = await p.evaluate(() => { const s = APP.ASSIST.cur(); const pid = (APP.liveAll()[0] || { p: {} }).p.id; return pid ? !!APP.ASSIST.coachTurn(s, pid, 'فرمولِ مساحتِ مثلث رو بلدم ولی نمی‌دونم ربطش چیه؟').related : null; });
    chk(r.sig !== false, 'related: on a live problem the same message sets turn.related for A.liveCoach ' + JSON.stringify(r.sig));
    strict('related s38 p7', u);
  });

  // ================= struct — همهٔ پرامپت‌های فیکسچرهای دورهای ۷ تا ۱۱ =================
  await section('struct', async () => {
    const S = info.struct = { own: 0, files: {}, bad: [], kids: {} };
    /* DECISIONS_R15 O4: هر فرزند (فیکسچرِ زیرِ prompt_tap) کدِ خروج، سیگنال و ۶۰۰ نویسهٔ آخرِ stderr اش را نگه می‌دارد؛ در هر شکست همین‌ها در پیامِ خطاست —
       تا دروازهٔ قرمز در محیطِ دیگر (روتین‌ها) خودش بگوید چرا. رفتار و بررسی‌ها همان است. */
    const diag = (only) => { const o = {}; Object.keys(S.kids).forEach(f => { const k = S.kids[f]; if (!only || k.code !== 0 || k.signal || !S.files[f]) o[f] = k; }); return Object.keys(o).length ? ' — children: ' + JSON.stringify(o) : ''; };
    const own = await p.evaluate(() => window.__all.slice());
    S.own = own.length;
    own.forEach((u, i) => { if (!/# نوبتِ تازه/.test(u)) return; const bad = strictScan(u); if (bad.length) S.bad.push(['self#' + i, bad]); });
    if (process.env.LLA_STRUCT_FIX !== '0') {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lla-tap-'));
      const files = fs.readdirSync(__dirname).filter(f => /^test_tour1_r(?:7|8|9|10|11)(?:_[a-z0-9]+)?\.js$/.test(f) && f !== path.basename(__filename)).sort();
      const run = (f) => new Promise((res) => {
        const out = path.join(dir, f + '.jsonl'), ch = spawn(process.execPath, ['-r', path.join(__dirname, 'prompt_tap.js'), path.join(__dirname, f)], { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { LLA_PROMPT_TAP: out }), stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '', done = false; const fin = (code, signal, extra) => { if (done) return; done = true; clearTimeout(to); S.kids[f] = { code: code == null ? null : code, signal: signal || null, stderr: (err + (extra || '')).slice(-600) }; res(out); };
        if (ch.stderr) ch.stderr.on('data', d => { err = (err + String(d)).slice(-600); });
        const to = setTimeout(() => { try { ch.kill('SIGKILL'); } catch (e) { } }, 600000);
        ch.on('error', e => fin(null, null, ' [spawn error: ' + String(e && e.message || e) + ']'));
        ch.on('close', (code, signal) => fin(code, signal));
      });
      const queue = files.slice(), JOBS = Math.max(1, +(process.env.LLA_TAP_JOBS || 2));
      await Promise.all(Array.from({ length: JOBS }, async () => { while (queue.length) { const f = queue.shift(); const out = await run(f); let n = 0;
        try { for (const row of fs.readFileSync(out, 'utf8').split('\n').filter(Boolean)) { const { user } = JSON.parse(row); if (!/# نوبتِ تازه/.test(user)) continue; n++; const bad = strictScan(user); if (bad.length) S.bad.push([f + '#' + n, bad]); } } catch (e) { }
        S.files[f] = n; } }));
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { }
      chk(Object.keys(S.files).length >= 7 && Object.values(S.files).filter(n => n > 0).length >= 6, 'struct: the r7–r11 fixtures were replayed through the prompt tap and produced prompts ' + JSON.stringify(S.files) + diag(false));
    }
    if (process.env.DUMP) S.bad.forEach(x => console.log('## ' + x[0] + '\n  ' + x[1].join('\n  ')));
    const sig = {}; S.bad.forEach(x => x[1].forEach(l => { const k = l.slice(0, 70); sig[k] = (sig[k] || 0) + 1; }));
    S.badN = S.bad.length; S.sig = sig;
    chk(!S.bad.length, 'struct (K1, strengthened): in ' + (S.own + Object.values(S.files).reduce((a, n) => a + n, 0)) + ' prompts of the r7–r11 fixtures, no line outside the turn line may contain «بپرس» or end with an unmarked «؟» — ' + S.bad.length + ' prompt(s) fail: ' + JSON.stringify(sig).slice(0, 3000) + diag(true));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 16000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
