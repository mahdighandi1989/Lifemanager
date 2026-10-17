// تورِ پولیا (دستهٔ ۱، دورِ ۱۹ ِ اصلاح، سهمِ «math» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19 RN4 a–e، INF12، INF14 روی صفحهٔ ساخته‌شده.
//  قاعدهٔ مالک: ریشه، نه سناریو — هر بخش جملهٔ عینیِ اجراکننده‌ها (round19X) و **همهٔ** ورودی‌های RN4.run ِ بانکِ مستقل
//  (tests/variants/VARIANTS_R19.json = tour1_polya/VARIANTS_R19.json، نوشتهٔ عاملی که کد را ندیده) را دارد. بانکِ R18 (RM2/RM3) در test_tour1_r18_math.js سبز می‌ماند.
//  run    RN4a–d — مرزِ فرمول: عددِ تنهای پس از واژهٔ فارسی پیش از رابطه از آنِ جمله است (D·2 s37، «بر ۸ ⇒ y=۲»)؛ کدها متن‌اند (C·X6 «TR-2026/10»)؛
//         «…» پس از عملگر درونِ فرمول (C·X5 s25)؛ ≈ · ln log sin cos tan exp و اندیسِ یونیکد (D·6 s31)؛ «x=۲» در پیامِ ریاضی؛ متن همان‌طور که تایپ شد
//  order  RN4a — در حبابِ راست‌به‌چپ ترتیبِ دیداریِ «بر ۳ ⇒ x=۲» همان ترتیبِ تایپ است (هرگز «بر ۲ = x ⇒ ۳»)
//  plot   RN4e — رقمِ برچسب‌ها همان دستگاهِ پیام (A·D3، B·D8)؛ نمودار فقط زیرِ پیامی که داده نخستین بار آمد (A·D4)؛ INF14 نامِ محورها از سرِ پیام
//  add    INF14 — «افزودنِ نقطه» به همان نمودار، ماندگار در سشن
//  dir    INF12 — فیلدِ ریاضی‌دار هر سطر را با جهتِ محتوایش تایپ می‌کند (unicode-bidi:plaintext)؛ نثرِ فارسی دست‌نخورده
// LLA_FILE = ساختِ دیگر؛ ONLY=run,plot … ؛ LLA_VARIANTS = مسیرِ دیگرِ بانک.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R19.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R19.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const V = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const RUN = V.filter(e => e.rc === 'RN4.run');
const isPlot = (e) => /plot/i.test(e.expect);

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const J = (x) => JSON.stringify(x);
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user, opts }); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__segs = (t) => (APP.MATH.segments(t) || []).map(x => x.m ? { m: x.m.textContent, src: x.src } : { t: x.t });
  });
  chk(RUN.length >= 20, 'bank: RN4.run entries present ' + RUN.length);

  // ================= run — RN4 a–d =================
  await section('run', async () => {
    const C = RUN.filter(e => !isPlot(e)).map(e => ({ t: e.text, kind: e.kind, expect: e.expect, src: 'bank' }));
    // جمله‌های عینیِ اجراکننده‌ها
    C.push({ t: 'سه رقم آخر ۳۵y بر ۸ ⇒ y=۲ (۳۵۲). بر ۳: x+۳+۵+۲ بر ۳ ⇒ x=۲، ۵ یا ۸', kind: 'pos', expect: 'D·2 s37: «۸» and «۳» after «بر» stay in the sentence', src: 'D·2' });
    C.push({ t: 'خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم', kind: 'pos', expect: 'C·X5 s25: run ends with «+ …»', src: 'C·X5' });
    C.push({ t: '✓ همین مسئلهٔ تازه پیش‌تر ثبت شده بود: «۱/(1·2·3) + ۱/(2·3·4) + …»', kind: 'pos', expect: 'C·X5 system note: run ends with «+ …»', src: 'C·X5b' });
    C.push({ t: 'سلام، کد رزرو TR-2026/10 و ساعت ۱۴:۳۰ و ۱۲۰٬۰۰۰ تومان', kind: 'neg', expect: 'C·X6 s26: no run', src: 'C·X6' });
    C.push({ t: 'پس n≈3.7 و باید n·ln(10/n) رو بیشینه کنم، (10/n)^n هم همینه', kind: 'pos', expect: 'D·6 s31: three runs n≈3.7, n·ln(10/n), (10/n)^n', src: 'D·6' });
    info.run = await p.evaluate((C) => C.map(c => ({ c, s: __segs(c.t), has: APP.MATH.has(c.t), plain: APP.MATH.toPlain(c.t) })), C);
    const runs = (r) => r.s.filter(x => x.m).map(x => x.src);
    const quoted = (e) => (e.match(/«[^»]*»/g) || []).map(x => x.slice(1, -1));
    info.run.forEach(r => {
      const R = runs(r), t = r.c.t, tag = '[' + r.c.src + '] ' + J(t) + ' got ' + J(r.s);
      // متن همان‌طور که تایپ شد: تکه‌ها پشتِ هم همان رشته‌اند (هیچ نویسه‌ای جابه‌جا/حذف نمی‌شود)
      chk(r.s.map(x => x.m ? x.src : x.t).join('') === t, 'run: segments rebuild the message exactly ' + tag);
      if (r.c.kind === 'neg') {
        chk(!r.has && !R.length, 'run neg: NO run (' + r.c.expect + ') ' + tag);
        chk(r.plain === t, 'run neg: toPlain leaves it character for character ' + J(r.plain));
        return;
      }
      chk(r.has && R.length >= 1, 'run pos: math recognised (' + r.c.expect + ') ' + tag);
      const e = r.c.expect;
      if (/^run contains/.test(e)) { const q = quoted(e)[0]; chk(R.some(x => x.indexOf(q) >= 0), 'run: a run contains «' + q + '» ' + tag); }
      else if (/^runs? «/.test(e)) { const want = quoted(e.split(';')[0]); want.forEach(q => chk(R.includes(q), 'run: run «' + q + '» exactly ' + tag)); }
      if (/ends with «\+ …»/.test(e)) chk(R.some(x => /\+\s*…$/.test(x)) && !r.s.some(x => x.t && /^\s*…/.test(x.t)), 'run RN4c: «…» after «+» stays inside the run, no dangling «+» ' + tag);
    });
    // RN4a: «۸»/«۳» ِ پس از «بر» در هیچ فرمولی نیست، و هیچ فرمولی با عددِ تنهای پس از واژهٔ فارسی آغاز نمی‌شود
    const by = (src) => info.run.find(r => r.c.src === src);
    let r = info.run.find(r => /۴۷y بر ۸/.test(r.c.t)); chk(r && !runs(r).some(x => /۸/.test(x)), 'run RN4a: «۸» after «بر» is in no run ' + J(r && r.s));
    r = info.run.find(r => /ارقام بر ۳/.test(r.c.t)); chk(r && !runs(r).some(x => /۳/.test(x)) && J(runs(r)) === J(['x+۴+۱+۲', 'x=۲']), 'run RN4a: exactly «x+۴+۱+۲» and «x=۲», «۳» stays with «بر» ' + J(r && r.s));
    r = by('D·2'); chk(r && J(runs(r)) === J(['y=۲ (۳۵۲)', 'x+۳+۵+۲', 'x=۲']), 'run D·2 s37: runs never start at «۸»/«۳» after «بر» ' + J(r && r.s));
    r = by('D·6'); chk(r && ['n≈3.7', 'n·ln(10/n)', '(10/n)^n'].every(q => runs(r).includes(q)), 'run D·6 s31: ≈, ·, ln recognised next to (10/n)^n ' + J(r && r.s));
    // RN4d: ln/≈ در درخت (mi:ln، mo:≈)، و اندیسِ یونیکد «a₁» یک msub
    const tree = await p.evaluate(() => { const sx = (n) => { const t = n.localName, k = [...n.children]; if (!k.length) return t + ':' + n.textContent; return t + '(' + k.map(sx).join(',') + ')'; };
      const one = (t) => { const s = APP.MATH.segments(t).find(x => x.m); return s ? sx(s.m) : null; };
      return { ln: one('n·ln(10/n)'), ap: one('n≈3.7'), sub: one('a₁ + a₂ + …'), exp: one('exp(-t/2)'), sin: one('sin²x + cos²x = 1') }; });
    info.tree = tree;
    chk(/mi:ln/.test(tree.ln || '') && /mo:⋅/.test(tree.ln || '') && /mfrac\(mn:10,mi:n\)/.test(tree.ln || ''), 'run RN4d: n·ln(10/n) — dot, ln, fraction ' + J(tree.ln));
    chk(/mo:≈/.test(tree.ap || ''), 'run RN4d: ≈ is an operator ' + J(tree.ap));
    chk(/msub\(mi:a,mn:1\)/.test(tree.sub || '') && /mo:…/.test(tree.sub || ''), 'run RN4d: a₁ is a subscript, … inside ' + J(tree.sub));
    chk(/mi:exp/.test(tree.exp || '') && /mfrac\(mi:t,mn:2\)/.test(tree.exp || ''), 'run RN4d: exp(−t/2) ' + J(tree.exp));
    chk(/msup\(mi:sin,mn:2\)/.test(tree.sin || ''), 'run RN4d: sin² ' + J(tree.sin));
    // کنترل‌ها: رابطهٔ تنها بی شاهدِ ریاضی متن می‌ماند (R18)، «·» ِ جداکننده و «Wi-Fi»/«A-B» متن‌اند
    const ctl = await p.evaluate(() => ['n = ۳۰ و k = 2', 'مراحل ۲ از ۵ · ۳ مورد', 'Wi-Fi رو وصل کردم', 'تست A-B رو بزنیم', 'نسخه‌ی v2.3.1', 'حدود ≈ ۵۰ نفر اومدن'].map(t => ({ t, has: APP.MATH.has(t) })));
    ctl.forEach(x => chk(!x.has, 'run control: stays text ' + J(x)));
  });

  // ================= order — RN4a: ترتیبِ دیداری در حبابِ واقعی =================
  await section('order', async () => {
    const r = await p.evaluate(async () => {
      localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession();
      s.msgs.push({ role: 'user', text: 'سه رقم آخر ۳۵y بر ۸ ⇒ y=۲ (۳۵۲). بر ۳: x+۳+۵+۲ بر ۳ ⇒ x=۲، ۵ یا ۸', at: new Date().toISOString() }); APP.S.put(s);
      APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 150));
      const tx = [...document.querySelectorAll('.as-panel .as-msg.user .as-tx')].pop(); if (!tx) return null;
      const rects = []; const w = document.createTreeWalker(tx, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (n.parentElement.closest('math')) continue; for (let i = 0; i < n.textContent.length; i++) { const ch = n.textContent[i]; if (/\s/.test(ch)) continue; const g = document.createRange(); g.setStart(n, i); g.setEnd(n, i + 1); const b = g.getBoundingClientRect(); rects.push({ ch, l: b.left, r: b.right, t: b.top }); } }
      const iso = [...tx.querySelectorAll('bdi.mx')].map(x => { const b = x.getBoundingClientRect(); return { src: x.getAttribute('data-src'), l: b.left, r: b.right, t: b.top }; });
      APP.ASSIST.toggle(false);
      return { rects, iso };
    });
    info.order = r && { iso: r.iso.map(x => x.src) };
    chk(!!r && r.iso.length >= 1, 'order: bubble rendered with isolates ' + J(r && r.iso));
    if (!r) return;
    // «بر ۸ ⇒» بیرونِ فرمول، و در خطِ راست‌به‌چپ: «بر» راستِ «۸»، «۸» راستِ «⇒»، «⇒» راستِ فرمولِ «y=…»
    const outside = (ch) => r.rects.filter(x => x.ch === ch);
    const arrows = outside('⇒'), eights = outside('۸'), y = r.iso.find(x => /^y=/.test(x.src)), x2 = r.iso.find(x => x.src === 'x=۲');
    chk(arrows.length === 2, 'order RN4a: both «⇒» stay in the sentence (outside the formulas) ' + J(arrows.length));
    chk(eights.length >= 1 && arrows.length >= 1 && y && eights[0].l >= arrows[0].r - 1 && arrows[0].l >= y.r - 1, 'order RN4a: «۸ ⇒ y=۲» reads right-to-left as typed (۸ | ⇒ | y=۲) ' + J({ e: eights[0], a: arrows[0], y }));
    const threes = outside('۳'), a2 = arrows[1];
    chk(!!(x2 && a2) && threes.some(t => Math.abs(t.t - a2.t) < 4 && t.l >= a2.r - 1) && a2.l >= x2.r - 1, 'order RN4a: «بر ۳ ⇒ x=۲» never reads «بر ۲ = x ⇒ ۳» ' + J({ a2, x2 }));
  });

  // ================= plot — RN4e + INF14 (نامِ محورها) =================
  await section('plot', async () => {
    const show = (msgs) => p.evaluate(async (msgs) => {
      localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession();
      msgs.forEach(([role, text]) => s.msgs.push({ role, text, at: new Date().toISOString(), actions: [] })); APP.S.put(s);
      APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 150));
      const out = [...document.querySelectorAll('.as-panel .as-log > .as-msg')].map(m => { const sv = m.querySelector('.mx-plot svg'); const pl = m.querySelector('.mx-plot');
        return { plot: !!sv, ticks: sv ? [...sv.querySelectorAll('text')].map(t => t.textContent) : [], xn: pl && pl.querySelector('.mx-xn') ? pl.querySelector('.mx-xn').textContent : '', yn: pl && pl.querySelector('.mx-yn') ? pl.querySelector('.mx-yn').textContent : '', n: sv ? sv.querySelectorAll('circle').length : 0 }; });
      APP.ASSIST.toggle(false); return out;
    }, msgs);
    const LAT = /[0-9]/, FA = /[۰-۹]/;
    const bank = RUN.filter(isPlot);
    chk(bank.length >= 4, 'bank: RN4.run plot entries ' + bank.length);
    const res = {};
    for (const e of bank) {
      if (e.kind === 'neg') {
        const q = /«([^»]*)»/.exec(e.text); const her = 'وزن‌هام این هفته: ' + (q ? q[1] : '');
        const r = await show([['user', her], ['ai', e.text.replace(/^\(reply quoting[^)]*\)\s*/, 'دیدم: «' + (q ? q[1] : '') + '». ')]]);
        res[e.text] = r;
        chk(r[0].plot && !r[1].plot, 'plot RN4e neg: the plot stays only under her message; the quoting reply gets none ' + J(r));
        continue;
      }
      const r = (await show([['user', e.text]]))[0]; res[e.text] = r;
      chk(r.plot, 'plot pos: plot attached to this message ' + J(e.text) + ' ' + J(r));
      if (/Persian digits|Persian ticks/.test(e.expect)) chk(r.ticks.length >= 2 && r.ticks.every(t => !LAT.test(t)) && r.ticks.some(t => FA.test(t)), 'plot RN4e: every tick in Persian digits ' + J(e.text) + ' ' + J(r.ticks));
      if (/Latin tick/.test(e.expect)) chk(r.ticks.length >= 2 && r.ticks.every(t => !FA.test(t)), 'plot RN4e: Latin ticks for a Latin message ' + J(r.ticks));
      const names = (e.expect.match(/«[^»]*»/g) || []).map(x => x.slice(1, -1));
      if (/axis names/.test(e.expect)) chk(r.xn.indexOf(names[0]) >= 0 && r.yn.indexOf(names[1]) >= 0, 'plot INF14: axis names «' + names.join('»/«') + '» from her header ' + J(r));
    }
    // جمله‌های عینی: A·D3/A·D4 s07 (سریِ تفاضل‌ها، پاسخِ نقل‌کننده)، B·D8 s19 (وزنِ فارسی)، s07 دو رشته با نام از واژه‌های پیام
    let r = await show([['user', 'تفاضل‌ها ۵، ۴، ۳، ۱ شدن، یعنی داره کند میشه'], ['ai', 'دیدنِ تفاضل‌های کاهشیِ ۵، ۴، ۳، ۱ خوب است؛ بعدی چه می‌گوید؟']]);
    res.s07d = r;
    chk(r[0].plot && r[0].ticks.every(t => !LAT.test(t)), 'plot A·D3 s07: index ticks in Persian digits (never «1»/«4») ' + J(r[0].ticks));
    chk(!r[1].plot, 'plot A·D4 s07: the assistant reply that quotes her series gets no second plot ' + J(r));
    r = await show([['user', 'وزن‌هام از هفته‌ی اول: ۷۸، ۷۷، ۷۶٫۵، ۷۵، ۷۴']]); res.s19 = r;
    chk(r[0].plot && r[0].ticks.every(t => !LAT.test(t)) && r[0].yn.indexOf('وزن‌هام') >= 0, 'plot B·D8 s19: Persian index ticks; y named «وزن‌هام» ' + J(r[0]));
    r = await show([['user', '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونش چیه؟']]); res.s07 = r;
    chk(r[0].plot && /ساعت/.test(r[0].xn) && /قدشون/.test(r[0].yn) && /سانت/.test(r[0].yn), 'plot INF14 s07: x «ساعت», y «قدشون (سانت)» from her own words ' + J(r[0]));
    r = await show([['ai', 'جدولِ اجراها:\nτ_I/τ_E | g\n0.5 | 0.10\n1.0 | 0.14\n1.5 | 0.22\n2.0 | 0.31']]); res.s20 = r;
    chk(r[0].plot && r[0].xn.indexOf('τ_I/τ_E') >= 0 && r[0].yn.indexOf('g') >= 0 && r[0].ticks.every(t => !FA.test(t)), 'plot INF14 s20: header «τ_I/τ_E | g» names the axes; Latin ticks ' + J(r[0]));
    // دادهٔ تازه در پاسخ (نه نقل) نمودارِ خودش را می‌گیرد
    r = await show([['user', 'وزن‌هام: ۸۰، ۷۹، ۷۸، ۷۷'], ['ai', 'اگر همین روند بماند: ۷۶، ۷۵، ۷۴، ۷۳']]);
    chk(r[0].plot && r[1].plot, 'plot control: a reply with NEW data still gets its own plot ' + J(r));
    info.plot = res;
  });

  // ================= add — INF14 «افزودنِ نقطه» =================
  await section('add', async () => {
    await p.evaluate(async () => {
      localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession();
      s.msgs.push({ role: 'user', text: '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت.', at: new Date().toISOString() }); APP.S.put(s);
      APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 150));
    });
    const tog = await p.$('.as-panel .mx-plot .mx-add-tog');
    chk(!!tog, 'add INF14: «افزودنِ نقطه» button under the plot');
    if (!tog) return;
    chk(/افزودنِ نقطه/.test(await tog.textContent()), 'add: button label');
    await tog.click(); await W(60);
    const labels = await p.evaluate(() => [...document.querySelectorAll('.as-panel .mx-addf input')].map(i => i.getAttribute('aria-label')));
    chk(labels.length === 2 && labels.every(Boolean) && /ساعت/.test(labels[0]), 'add: two labelled inputs (x named from her words) ' + J(labels));
    await p.fill('.as-panel .mx-add-x', 'abc'); await p.fill('.as-panel .mx-add-y', '۱۱'); await p.click('.as-panel .mx-add-ok'); await W(60);
    let st = await p.evaluate(() => ({ n: document.querySelectorAll('.as-panel .mx-plot circle').length, msg: (document.querySelector('.as-panel .mx-add-msg') || {}).textContent }));
    chk(st.n === 5 && /عدد/.test(st.msg || ''), 'add: a non-number is refused with a message ' + J(st));
    await p.fill('.as-panel .mx-add-x', '۲۴'); await p.fill('.as-panel .mx-add-y', '۱۱'); await p.click('.as-panel .mx-add-ok'); await W(100);
    st = await p.evaluate(() => { const sv = document.querySelector('.as-panel .mx-plot svg'); const s = APP.ASSIST.cur();
      return { n: sv.querySelectorAll('circle').length, added: sv.querySelectorAll('circle[data-add="1"]').length, ticks: [...sv.querySelectorAll('text')].map(t => t.textContent), cap: document.querySelector('.as-panel .mx-plot').textContent, stored: s && s.msgs[0].plotAdd, plots: document.querySelectorAll('.as-panel .mx-plot').length }; });
    chk(st.n === 6 && st.added === 1 && st.plots === 1 && st.ticks.includes('۲۴') && /نقطهٔ افزوده/.test(st.cap), 'add: the SAME plot now has 6 points (x reaches ۲۴), marked as added ' + J(st));
    chk(J(st.stored) === J([['۲۴', '۱۱']]), 'add: the point is kept on the message record ' + J(st.stored));
    const re = await p.evaluate(async () => { APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 150)); const sv = document.querySelector('.as-panel .mx-plot svg'); const n = sv ? sv.querySelectorAll('circle').length : 0; APP.ASSIST.toggle(false); return n; });
    chk(re === 6, 'add: the added point survives reopening the panel ' + re);
    info.add = st;
  });

  // ================= dir — INF12 =================
  await section('dir', async () => {
    const pid = await p.evaluate(() => APP.liveCreate('مجموعِ تلسکوپی', 'ثابت کن مجموعِ 1/(k(k+1)) برابرِ n/(n+1) است', 'prove', { by: 'user' }).p.id);
    let id = null;
    for (const sub of ['u', 'plan', 'exec']) {
      await p.evaluate(([pid, sub]) => APP.go('lprob', pid, sub), [pid, sub]); await W(200);
      await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); await W(80);
      id = await p.evaluate(() => { const e = document.querySelector('main textarea[id^="lp"]') || document.querySelector('main input[id^="lp"][type="text"], main input[id^="lp"]:not([type])'); return e && e.id; });
      if (id) break;
    }
    chk(!!id, "dir: a live-problem field found " + J(await p.evaluate(() => ({ v: APP.state && APP.state.view, ta: [...document.querySelectorAll("textarea")].map(e => e.id + "/" + !!e.closest("main")).slice(0, 8) }))));
    const st = async (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); const c = getComputedStyle(e); return { ub: c.unicodeBidi, ta: c.textAlign }; }, sel);
    const rows = [];
    if (id) {
      await p.fill('#' + id, '۱/(1·2·3) + ۱/(2·3·4) + …\nپس جمعش n/(n+1) میشه'); await W(60); rows.push(['math', await st('#' + id)]);
      await p.fill('#' + id, 'سلام، هنوز نمی‌دونم از کجا شروع کنم'); await W(60); rows.push(['prose', await st('#' + id)]);
    }
    await p.evaluate(() => APP.ASSIST.toggle(true)); await W(80);
    await p.fill('.as-panel .as-in', 'x^2 + 1 = 0 جواب نداره؟'); await W(60); rows.push(['chat math', await st('.as-panel .as-in')]);
    await p.fill('.as-panel .as-in', 'سلام'); await W(60); rows.push(['chat prose', await st('.as-panel .as-in')]);
    await p.evaluate(() => { const t = document.querySelector('.as-panel .as-in'); t.value = ''; t.dispatchEvent(new Event('input', { bubbles: true })); APP.ASSIST.toggle(false); });
    info.dir = rows;
    rows.forEach(([k, s]) => chk(/math/.test(k) ? s.ub === 'plaintext' && s.ta === 'start' : s.ub !== 'plaintext', 'dir INF12: ' + k + ' field ' + (/math/.test(k) ? 'types each line by its content (plaintext, start)' : 'stays as before') + ' ' + J(s)));
  });

  console.log(JSON.stringify({ runBad: errors.filter(e => /^run/.test(e)).length, tree: info.tree, order: info.order, add: info.add, dir: info.dir }).slice(0, 2500));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
