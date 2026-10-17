// تورِ پولیا (دستهٔ ۱، دورِ ۱۷، ۲۰۲۶-۱۰-۱۷) — INF1: نمایشِ درستِ فرمول (src/app/a39_math.js ⇒ MathML ِ بومی، بی کتابخانه).
//  render  LaTeX ِ سبکِ درونِ $…$ و \(…\) و ریاضیِ ASCII ِ کاربرِ فارسی‌نویس ⇒ ساختارِ درستِ MathML (کسر، توان، زیرنویس، رادیکال، ∑/∫ با حد، یونانی، ≤ ≠ ⋅).
//  plain   متنِ غیرریاضی دست‌نخورده: عدد درونِ جملهٔ فارسی («۳۰ پله»، «۴۰ درصد»)، تاریخ، نشانی، نامِ_فایل، «$5 and $10»، فرمانِ ناشناخته، فرمولِ بی‌ساختار.
//  xss     هیچ ورودی‌ای عنصرِ HTML نمی‌سازد (img/script/iframe/on*)؛ متن فرار داده می‌شود.
//  chat    حبابِ «💬 دستیار»: فرمولِ پاسخ ⇒ <math> درونِ <bdi dir="ltr">؛ ترتیبِ جملهٔ فارسیِ دورش می‌ماند (و نماگرفت برای وارسیِ چشمی)؛ SYS خطِ $…$ را دارد و زیرِ ۲۰ هزار است.
//  preview پیش‌نمایشِ زیرِ صورتِ مسئله (#lpNewS) و گامِ بعد (#lpStep) در «🔭 مسئلهٔ حل‌نشدهٔ خودم»: با فرمول پیدا، بی فرمول پنهان.
//  LLA_FILE = ساختِ دیگر؛ ONLY=render,xss … ؛ SHOT_DIR = پوشهٔ نماگرفت‌ها (پیش‌فرض: پوشهٔ موقتِ سیستم).
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const SHOT = process.env.SHOT_DIR || os.tmpdir();
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e)); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift();
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    // ساختارِ فشرده: <math> ⇒ «frac(1,row(...))» برای مقایسهٔ پایدار
    window.__sx = (n) => { const t = n.localName, k = [...n.children]; if (!k.length) return t + ':' + n.textContent; return t + '(' + k.map(__sx).join(',') + ')'; };
    window.__r = (txt) => { const d = document.createElement('div'); APP.MATH.nodes(txt).forEach(n => d.append(n)); return d; };
  });

  await section('render', async () => {
    const C = [
      // [ورودی، ساختارِ مورد انتظارِ نخستین فرمول، متنِ بیرونی]
      ['مجموع 1/((n+1)(n+2)) را حساب کن', 'math(mfrac(mn:1,mrow(mrow(mo:(,mrow(mi:n,mo:+,mn:1),mo:)),mrow(mo:(,mrow(mi:n,mo:+,mn:2),mo:)))))', 'مجموع  را حساب کن'],
      ['x^2+1', 'math(mrow(msup(mi:x,mn:2),mo:+,mn:1))', ''],
      ['دنبالهٔ a_n صعودی است', 'math(msub(mi:a,mi:n))', 'دنبالهٔ  صعودی است'],
      ['مجموع n(n+1)/2 است.', 'math(mfrac(mrow(mi:n,mrow(mo:(,mrow(mi:n,mo:+,mn:1),mo:))),mn:2))', 'مجموع  است.'],
      ['√2 گنگ است', 'math(msqrt(mn:2))', ' گنگ است'],
      ['اگر x^(n+1) - 1 = 0 باشد،', 'math(mrow(msup(mi:x,mrow(mi:n,mo:+,mn:1)),mo:−,mn:1,mo:=,mn:0))', 'اگر  باشد،'],
      ['ثابت کن $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$ برای هر n', 'math(mrow(mfrac(mn:1,mrow(mi:n,mrow(mo:(,mrow(mi:n,mo:+,mn:1),mo:)))),mo:=,mfrac(mn:1,mi:n),mo:−,mfrac(mn:1,mrow(mi:n,mo:+,mn:1))))', 'ثابت کن  برای هر n'],
      ['$\\sum_{k=1}^{n} k^2 \\le n^3$', 'math(mrow(munderover(mo:∑,mrow(mi:k,mo:=,mn:1),mi:n),msup(mi:k,mn:2),mo:≤,msup(mi:n,mn:3)))', ''],
      ['\\(\\int_0^1 x\\,dx = \\frac12\\)', 'math(mrow(msubsup(mo:∫,mn:0,mn:1),mi:x,mspace:,mi:d,mi:x,mo:=,mfrac(mn:1,mn:2)))', ''],
      ['$\\alpha \\ne \\beta \\cdot \\gamma \\times 2 \\ge \\pi$', 'math(mrow(mi:α,mo:≠,mi:β,mo:⋅,mi:γ,mo:×,mn:2,mo:≥,mi:π))', ''],
      ['$\\sqrt[3]{x}$', 'math(mroot(mi:x,mn:3))', ''],
      ['$a_{n+1} = 2a_n$', 'math(mrow(msub(mi:a,mrow(mi:n,mo:+,mn:1)),mo:=,mn:2,msub(mi:a,mi:n)))', ''],
      ['پاسخ: dy/dt = −5/(16π) است', 'math(mrow(mfrac(mrow(mi:d,mi:y),mrow(mi:d,mi:t)),mo:=,mo:−,mfrac(mn:5,mrow(mn:16,mi:π))))', 'پاسخ:  است'],
      ['«x^2+1» را عامل کن', 'math(mrow(msup(mi:x,mn:2),mo:+,mn:1))', '«» را عامل کن'],
      ['(یعنی x^2)', 'math(msup(mi:x,mn:2))', '(یعنی )'],
      ['$\\text{مساحت} = \\pi r^2$', 'math(mrow(mtext:مساحت,mo:=,mi:π,msup(mi:r,mn:2)))', ''],
    ];
    info.render = await p.evaluate((C) => C.map(([t, want, outside]) => {
      const d = __r(t), m = d.querySelector('math'), bd = m && m.parentElement;
      const out = [...d.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
      return { t, got: m ? __sx(m) : null, ok: !!m && __sx(m) === want && out === outside, out,
        iso: !!bd && bd.localName === 'bdi' && bd.getAttribute('dir') === 'ltr' && /unicode-bidi:\s*isolate/.test(bd.getAttribute('style') || ''),
        ns: !!m && m.namespaceURI === 'http://www.w3.org/1998/Math/MathML' };
    }), C);
    info.render.forEach(r => chk(r.ok && r.iso && r.ns, 'render: ' + JSON.stringify(r)));
    // MathML واقعاً چیده می‌شود (نه متنِ خطی): کسر بلندتر از یک خط است
    info.layout = await p.evaluate(() => { const d = __r('1/((n+1)(n+2))'); document.body.append(d); const f = d.querySelector('mfrac').getBoundingClientRect(), s = d.querySelector('mn').getBoundingClientRect(); d.remove(); return { fh: f.height, nh: s.height }; });
    chk(info.layout.fh > info.layout.nh * 1.5, 'MathML fraction is laid out as a stacked fraction ' + JSON.stringify(info.layout));
  });

  await section('plain', async () => {
    const P = ['۳۰ پله را در ۴۰ ثانیه بالا رفتم', '۴۰ درصد از کل', 'سهمِ او 40% است', 'تاریخ ۱۴۰۲/۰۵/۱۲ بود', '1402/05/12', 'فایلِ file_name.txt را ببین',
      'نشانی https://example.com/a_b?x=1 است', 'قیمت $5 and $10 است', '$\\foo{x}$ ناشناخته', 'dV/dt = (πy²/9)·dy/dt', 'x² + 1', 'سلام، چطوری؟', 'Pólya گفت: understand the problem',
      'n = ۳۰ و k = 2', '$x^ $', 'C:\\Users\\me', 'a/b'];
    info.plain = await p.evaluate((P) => P.map(t => { const d = __r(t); return { t, math: d.querySelectorAll('math').length, same: d.textContent === t, html: APP.MATH.has(t) }; }), P);
    info.plain.forEach(r => chk(r.math === 0 && r.same && !r.html, 'plain text stays text: ' + JSON.stringify(r)));
  });

  await section('xss', async () => {
    const X = ['<img src=x onerror="window.__x=1"> x^2', '$<script>window.__x=2</script>$', '$\\text{<img src=x onerror=window.__x=3>}$', 'a_n"><img src=x onerror=window.__x=4>',
      '\\(\\text{</math><img src=x onerror=window.__x=5>}\\)', '$x" onmouseover="window.__x=6$', '<svg onload=window.__x=7> 1/((n+1)(n+2))', '$\\mathbb{<b>R</b>}$'];
    info.xss = await p.evaluate(async (X) => {
      const host = document.createElement('div'); document.body.append(host);
      const res = X.map(t => { const d = __r(t); host.append(d); const h = APP.MATH.html(t); const tmp = document.createElement('template'); tmp.innerHTML = h;
        return { t, bad: d.querySelectorAll('img,script,iframe,svg,b,a').length + tmp.content.querySelectorAll('img,script,iframe,svg,b,a').length,
          on: [...d.querySelectorAll('*')].some(e => [...e.attributes].some(a => /^on/i.test(a.name))), text: d.textContent.indexOf(t.replace(/^\$|\$$/g, '').slice(0, 4)) >= 0 || !!d.querySelector('math') }; });
      await new Promise(r => setTimeout(r, 200)); host.remove(); return { res, x: window.__x };
    }, X);
    chk(info.xss.x === undefined, 'no injected handler ran ' + info.xss.x);
    info.xss.res.forEach(r => chk(r.bad === 0 && !r.on, 'xss: no HTML element/handler from input ' + JSON.stringify(r)));
  });

  await section('chat', async () => {
    // SYS سقفِ ۲۰ هزار دارد و پر است (AGENTS.md قاعدهٔ ۸) ⇒ خطِ «$…$» با AS.promptHooks به نوبتِ ریاضی افزوده می‌شود، نه به SYS
    const sys = await p.evaluate(() => ({ n: APP.ASSIST.SYS.length, inSys: /\$…\$/.test(APP.ASSIST.SYS) }));
    chk(sys.n < 20000 && !sys.inSys, 'SYS stays under 20k and unchanged ' + JSON.stringify(sys));
    await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.push(R({ reply: 'سلام.' })); });
    await p.evaluate(() => APP.go('home')); await W(120);
    await p.evaluate(() => APP.ASSIST.send('سلام، امروز حالم خوب نیست'));
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    const hk0 = await p.evaluate(() => /\$…\$/.test((__calls[0] || {}).user || ''));
    chk(!hk0, 'plain Persian chat turn on home gets no formula line');
    await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __q.push(R({ reply: 'گامِ القایی: اگر $S_n = \\frac{n}{n+1}$ باشد، با افزودنِ 1/((n+1)(n+2)) به $S_{n+1}$ می‌رسی؛ پس ۳۰ پله یا ۴۰ درصد ربطی ندارد.' })); });
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', 'مجموعِ 1/(k(k+1)) از k=1 تا n چقدر است؟'); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 }); await W(150);
    info.chat = await p.evaluate(() => {
      const ms = [...document.querySelectorAll('.as-panel .as-msg .as-tx')];
      const u = ms.find(x => /مجموعِ/.test(x.textContent)), a = ms.find(x => /گامِ القایی/.test(x.textContent));
      const iso = (x) => [...x.querySelectorAll('math')].every(m => m.parentElement.localName === 'bdi' && m.parentElement.getAttribute('dir') === 'ltr');
      // ترتیبِ دیداری: در حبابِ راست‌به‌چپ، «گامِ القایی» (آغازِ جمله) راستِ فرمولِ نخست و «پس ۳۰ پله» چپِ فرمولِ آخر است
      const rng = (node, str) => { const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const i = n.textContent.indexOf(str); if (i >= 0 && !n.parentElement.closest('math')) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + str.length); return r.getBoundingClientRect(); } } return null; };
      const am = a ? [...a.querySelectorAll('math')] : [], first = am[0] && am[0].getBoundingClientRect(), last = am[am.length - 1] && am[am.length - 1].getBoundingClientRect();
      const head = a && rng(a, 'القایی'), tail = a && rng(a, 'پله');
      return { uMath: u ? u.querySelectorAll('math').length : -1, aMath: am.length, src: am.map(m => m.parentElement.getAttribute('data-src')), iso: !!a && iso(a) && iso(u),
        order: !!(head && first && tail && last) && (head.top < first.top - 2 || head.left > first.right - 2) && (tail.top > last.top + 2 || tail.right < last.left + 2),
        nums: !!a && /۳۰ پله یا ۴۰ درصد/.test(a.textContent) && ![...a.querySelectorAll('math')].some(m => /۳۰|۴۰/.test(m.textContent)), rtl: a && a.getAttribute('dir') };
    });
    info.hook = await p.evaluate(() => { const c = __calls.find(x => /مجموعِ 1\/\(k\(k\+1\)\)/.test(x.user || '')); return !!c && /\$…\$/.test(c.user) && /\\frac/.test(c.user); });
    chk(info.hook, 'a math turn carries the formula line ($…$ with an example) in the assistant prompt');
    chk(info.chat.uMath === 1 && info.chat.aMath === 3 && info.chat.iso && info.chat.rtl === 'rtl', 'chat bubbles: formulas become <math> in LTR isolates (user 1, assistant 3) ' + JSON.stringify(info.chat));
    chk(info.chat.src.join('|') === 'S_n = \\frac{n}{n+1}|1/((n+1)(n+2))|S_{n+1}', 'assistant formulas found in order ' + JSON.stringify(info.chat.src));
    chk(info.chat.order, 'Persian sentence order around formulas is kept (head right of first formula, tail left of last) ' + JSON.stringify(info.chat));
    chk(info.chat.nums, 'numbers inside the Persian sentence («۳۰ پله»، «۴۰ درصد») stay text');
    await p.locator('.as-panel').screenshot({ path: path.join(SHOT, 'math_chat.png') });
    await p.evaluate(() => APP.ASSIST.toggle(false));
  });

  await section('preview', async () => {
    await p.evaluate(() => APP.go('e_prob', null, 'live')); await W(200);
    const pv = () => p.evaluate(() => { const f = document.querySelector('#lpNewS'), el = f && f.parentElement.querySelector('.mx-prev'); return el ? { hidden: el.hidden, math: el.querySelectorAll('math').length, txt: el.textContent } : null; });
    info.pv0 = await pv();
    await p.fill('#lpNewS', 'ثابت کن برای هر n ≥ 1 مجموعِ 1/(k(k+1)) از k=1 تا n برابرِ n/(n+1) است و a_n کران‌دار است'); await W(80);
    info.pv1 = await pv();
    await p.locator('#lpNewS').evaluate(e => e.parentElement.scrollIntoView());
    await p.locator('#lpNewS >> xpath=..').screenshot({ path: path.join(SHOT, 'math_preview.png') });
    await p.fill('#lpNewS', 'در ۳۰ روز ۴۰ درصدِ کارها را تمام کنم'); await W(80);
    info.pv2 = await pv();
    chk(info.pv0 && info.pv0.hidden, 'statement preview exists and is hidden while empty ' + JSON.stringify(info.pv0));
    chk(info.pv1 && !info.pv1.hidden && info.pv1.math === 3, 'statement preview shows the formulas live ' + JSON.stringify(info.pv1));
    chk(info.pv2 && info.pv2.hidden, 'statement preview hides for plain Persian text with numbers ' + JSON.stringify(info.pv2));
    // گامِ بعد: یک مسئلهٔ اثباتیِ تازه و نمای «اجرا»
    await p.fill('#lpNewT', 'مجموعِ تلسکوپی'); await p.fill('#lpNewS', 'ثابت کن مجموعِ 1/(k(k+1)) از k=1 تا n برابرِ n/(n+1) است'); await W(60);
    await p.click('main .lp-create'); await W(200);
    const pid = await p.evaluate(() => APP.state.arg);
    // فهم و طرح ثبت‌شده (همان شکلِ رکوردی که فرم‌ها می‌سازند) ⇒ مرحلهٔ «اجرا» و فرمِ گامِ بعد
    await p.evaluate(pid => { const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg); s.u[1] = { done: true, at: new Date().toISOString(), u: 'برابری', d: 'n', c: 'k از ۱ تا n', dl: [] };
      s.live = s.live || {}; s.live.plan = { at: new Date().toISOString(), t: 'تلسکوپی', unused: {} }; APP.S.put(pg); APP.go('lprob', pid, 'exec'); }, pid); await W(250);
    if (!(await p.locator('#lpStep').count())) { const s = p.locator('main details[data-sec="c"] > summary'); if (await s.count()) { await s.first().click(); await W(160); } }
    info.step = await p.evaluate(() => !!document.querySelector('#lpStep'));
    chk(info.step, 'step field #lpStep reachable on the exec view');
    if (info.step) {
      await p.fill('#lpStep', 'با k = n+1 داریم n/(n+1) + 1/((n+1)(n+2)) = (n+1)/(n+2)'); await W(80);
      info.st = await p.evaluate(() => { const el = document.querySelector('#lpStep').parentElement.querySelector('.mx-prev'); return el ? { hidden: el.hidden, math: el.querySelectorAll('math').length } : null; });
      chk(info.st && !info.st.hidden && info.st.math >= 1, 'step preview shows the formula live ' + JSON.stringify(info.st));
      info.stVal = await p.evaluate(() => document.querySelector('#lpStep').value);
      chk(/1\/\(\(n\+1\)\(n\+2\)\)/.test(info.stVal), 'the field value itself is unchanged (preview only)');
      await p.locator('#lpStep >> xpath=..').screenshot({ path: path.join(SHOT, 'math_step.png') });
    }
  });

  console.log(JSON.stringify({ render: (info.render || []).filter(r => !r.ok).length + ' bad', chat: info.chat, pv1: info.pv1, st: info.st }, null, 0).slice(0, 1500));
  console.log('screenshots:', path.join(SHOT, 'math_chat.png'), path.join(SHOT, 'math_preview.png'), path.join(SHOT, 'math_step.png'));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
