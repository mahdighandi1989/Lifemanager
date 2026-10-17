// تورِ پولیا (دستهٔ ۱، دورِ ۱۸ ِ اصلاح، سهمِ «math» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R18 RM2 a–c، RM3، INF2، INF3، INF8، INF9 روی صفحهٔ ساخته‌شده.
//  قاعدهٔ مالک: هیچ ایرادی «برای همان سناریو» اصلاح نمی‌شود — هر بخش جملهٔ عینیِ اجراکننده‌ها (round18X) و **همهٔ** واریانت‌های RM2.plain،
//  RM2.notation و RM3.trigger ِ بانکِ مستقل (tests/variants/VARIANTS_R18.json = tour1_polya/VARIANTS_R18.json، نوشتهٔ عاملی که کد را ندیده) را دارد.
//  plain    RM2a/INF2 — APP.MATH.toPlain: TeX و ریاضیِ ASCII ⇒ یونیکدِ خوانا (x²، a₁، a/b با پرانتزِ لازم، √، →، …)؛ قیمت/ایمیل/نشانی/نامِ_فایل دست‌نخورده
//  notation RM2b/c — رقمِ فارسی و ٫، × ÷ ² − ⇒ ≤ ≥ √، «…/⋯» درونِ رشته، متغیرِ حرفِ فارسی فقط در رشتهٔ عملگردار با رقم؛ پرانتزِ (10/n)^(n/2)،
//           زیرنویسِ چندحرفی (g_EE، g_PV-E، a_max)، τ_I نه I_τ، dV/dt همه‌جا یکسان، منفیِ یکانی بی فاصلهٔ دوتایی، بی شکستِ خط پیش از «،»
//  trigger  RM3 — خطِ «# فرمول» از محتوا (صورتِ مسئله یا گفت‌وگوی اخیر)، در هر نما، با نشانِ «(زمینه، نه پرسشِ دوم)»؛ FEN/تاریخ/قیمت/نسخه/تلفن ریاضی نیست
//  sinks    RM2a — گزینهٔ <option> ِ «کدام پرسش کمک کرد؟» (lbOpts ِ a27) متنِ ساده است + آزمونِ ساختاری: هر چاهِ متنِ ساده که از متنِ گفت‌وگو پر می‌شود toPlain دارد
//  preview  INF3 — پیش‌نمایشِ فرمول زیرِ همهٔ فیلدهای متنیِ مسئلهٔ زنده و زیرِ ورودیِ گفت‌وگو؛ نوارِ «∑ فرمول» در جای مکان‌نما درج می‌کند
//  plot     INF8 — جدولِ دوستونیِ عددی یا رشتهٔ عدد در پیام ⇒ نمودارِ خطیِ کوچکِ SVG زیرِ پیام (s07، s19)؛ متنِ ساده/تاریخ/تلفن ⇒ هیچ
//  fen      INF9 — FEN در پیام ⇒ صفحهٔ ۸×۸ ِ یونیکد زیرِ پیام (s21)؛ FEN ِ بدشکل ⇒ هیچ
// LLA_FILE = ساختِ دیگر؛ ONLY=plain,trigger … ؛ LLA_VARIANTS = مسیرِ دیگرِ بانک.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R18.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R18.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const V = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const of = (rc) => V.filter(e => e.rc === rc);

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
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift();
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__sx = (n) => { const t = n.localName, k = [...n.children]; if (!k.length) return t + ':' + n.textContent; return t + '(' + k.map(__sx).join(',') + ')'; };
    window.__segs = (t) => (APP.MATH.segments(t) || []).map(x => x.m ? { m: __sx(x.m), src: x.src } : { t: x.t });
  });
  const hasAPI = await p.evaluate(() => !!(APP.MATH && APP.MATH.toPlain));
  chk(hasAPI, 'APP.MATH.toPlain exists (INF2)');

  // ================= plain — RM2a / INF2 =================
  await section('plain', async () => {
    const ent = of('RM2.plain');
    chk(ent.length >= 20, 'bank: RM2.plain entries present ' + ent.length);
    const expOf = (e) => { const m = /«([^»]*)»/.exec(e.expect); return e.kind === 'neg' ? e.text : m ? m[1] : null; };
    const C = ent.map(e => ({ t: e.text, want: expOf(e), kind: e.kind }));
    // جمله‌های عینیِ اجراکننده‌ها (A·X1 s10، B·D3 s18، D·D7 s38)
    C.push({ t: '… در هر چیدمان، $p_1+p_2+p_3$ (…) حداکثر چند است…؟', want: '… در هر چیدمان، p₁+p₂+p₃ (…) حداکثر چند است…؟', kind: 'pos' });
    C.push({ t: 'مجهول هنوز «نرخ تغییر عمق»، $\\frac{dy}{dt}$، است — …؟', want: 'مجهول هنوز «نرخ تغییر عمق»، dy/dt، است — …؟', kind: 'pos' });
    C.push({ t: '… $y \\to 0$ …', want: '… y → 0 …', kind: 'pos' });
    C.push({ t: '… مثلاً اگر $b=a$ باشد، $\\frac{a^2 b}{6}$ معقول است؟', want: '… مثلاً اگر b=a باشد، a²b/6 معقول است؟', kind: 'pos' });
    C.push({ t: 'جمعِ $\\frac{1}{n(n+1)}$ و $\\sqrt{\\frac{1}{2}}$', want: 'جمعِ 1/(n(n+1)) و √(1/2)', kind: 'pos' });
    C.push({ t: 'سلام، امروز حالم خوب نیست', want: 'سلام، امروز حالم خوب نیست', kind: 'neg' });
    C.push({ t: '$\\foo{x}$ و $\\alpha_{ij}$', want: 'foo(x) و αᵢⱼ', kind: 'pos' });   // فرمانِ ناشناخته: بی $ و بی \ (نه خامِ TeX)
    info.plain = await p.evaluate((C) => C.map(c => { let got = null; try { got = APP.MATH.toPlain(c.t); } catch (e) { got = 'ERR ' + e.message; } return Object.assign({}, c, { got }); }), C);
    info.plain.forEach(r => {
      chk(r.want != null && r.got === r.want, 'plain [' + r.kind + ']: toPlain(' + J(r.t) + ') = ' + J(r.got) + ' — want ' + J(r.want));
      if (r.kind === 'pos') chk(r.got != null && !/[$\\]/.test(r.got) && !/[A-Za-z0-9)}]\s*[\^]/.test(r.got) && !/\\[A-Za-z]/.test(r.got), 'plain: no $, \\, ^ left in ' + J(r.got));
    });
    // toPlain پایدار است (دوباره زدنش چیزی را عوض نمی‌کند) و ورودیِ تهی/غیررشته را تاب می‌آورد
    const idem = await p.evaluate(() => { const a = APP.MATH.toPlain('$x^2+1$ و $\\frac{a+1}{b-2}$'); return { a, b: APP.MATH.toPlain(a), n: APP.MATH.toPlain(null), u: APP.MATH.toPlain(undefined), num: APP.MATH.toPlain(5) }; });
    chk(idem.a === idem.b && idem.n === '' && idem.u === '' && idem.num === '5', 'plain: idempotent and total ' + J(idem));
  });

  // ================= notation — RM2b/c =================
  await section('notation', async () => {
    const ent = of('RM2.notation');
    chk(ent.length >= 20, 'bank: RM2.notation entries present ' + ent.length);
    info.notation = await p.evaluate((ent) => ent.map(e => ({ e, s: __segs(e.text), has: APP.MATH.has(e.text) })), ent);
    const M = (r) => r.s.filter(x => x.m);
    const byText = (t) => info.notation.find(r => r.e.text === t);
    info.notation.forEach(r => {
      if (r.e.kind === 'neg') chk(!r.has && M(r).length === 0, 'notation neg: no math run in ' + J(r.e.text) + ' (' + r.e.expect + ') got ' + J(r.s));
      else chk(r.has && M(r).length >= 1, 'notation pos: math recognised in ' + J(r.e.text) + ' (' + r.e.expect + ') got ' + J(r.s));
    });
    const one = (t, src) => { const r = byText(t); if (!r) { chk(false, 'bank entry missing ' + t); return null; } const m = M(r); chk(m.length === 1 && m[0].src === (src || t), 'notation: ONE run «' + (src || t) + '» in ' + J(t) + ' got ' + J(r.s)); return m[0] || null; };
    let m;
    m = one('ع+۶ = ع² ⇒ ع² − ع − ۶ = ۰'); chk(!!m && /mi:ع/.test(m.m) && /mn:۶/.test(m.m) && /mn:۰/.test(m.m) && /mo:⇒/.test(m.m), 'notation s36: ع is a variable, ۶/۰ stay Persian digits ' + J(m));
    m = one('۰٫۱×۲۰ + ۰٫۲۵×ح = ۰٫۱۵(۲۰+ح)'); chk(!!m && /mn:۰٫۱/.test(m.m) && /mi:ح/.test(m.m) && /mo:×/.test(m.m), 'notation s36: ٫ kept, ح a variable ' + J(m));
    m = one('1/(2·3) + 1/(3·4) + … + 1/(n(n+1)) = n/(n+1) − 1/2'); chk(!!m && /mo:…/.test(m.m), 'notation C·W1: «…» inside the run ' + J(m));
    m = one('S = ۱ + ۲ + ⋯ + ۱۰۰'); chk(!!m && /mo:⋯/.test(m.m) && /mn:۱۰۰/.test(m.m), 'notation: «⋯» inside, Persian digits as typed ' + J(m));
    one('۱/۵ − ۱/(۳(n+۲))');
    m = one('(10/n)^(n/2)'); chk(!!m && m.m === 'math(msup(mrow(mo:(,mfrac(mn:10,mi:n),mo:)),mfrac(mi:n,mn:2)))', 'notation D·D5: base (10/n), exponent n/2 ' + J(m));
    m = one('(۲/k)^(k+۱) کوچک‌تر از ۱ است', '(۲/k)^(k+۱)'); chk(!!m && /^math\(msup\(mrow\(mo:\(,mfrac\(mn:۲,mi:k\),mo:\)\)/.test(m.m), 'notation: (۲/k)^(k+۱) with both parens ' + J(m));
    m = one('پارامترِ g_EE را ۰٫۳ گرفتم', 'g_EE'); chk(!!m && m.m === 'math(msub(mi:g,mi:EE))', 'notation B·D8: g_EE (both letters in the subscript) ' + J(m));
    m = one('g_PV-E = 0.12'); chk(!!m && /^math\(mrow\(msub\(mi:g,mi:PV-E\),mo:=,mn:0\.12\)\)$/.test(m.m), 'notation B·D8: subscript «PV-E» is one name, not a minus ' + J(m));
    m = one('ثابتِ زمانی τ_I برابر ۵ است', 'τ_I'); chk(!!m && m.m === 'math(msub(mi:τ,mi:I))', 'notation B·D9: τ with subscript I ' + J(m));
    one('۱۸۰n − (n−۲)×۱۸۰ = ۳۶۰'); one('x ≤ ۵ ⇒ ۲x ≤ ۱۰'); one('۱۲ ÷ ۴ = ۳');
    m = one('a_max − a_min ≥ 2'); chk(!!m && /msub\(mi:a,mi:max\)/.test(m.m) && /msub\(mi:a,mi:min\)/.test(m.m), 'notation: multi-letter subscripts max/min ' + J(m));
    const dv = byText('dV/dt = −5 و بعداً هم dV/dt رو لازم داریم'), dvm = dv ? M(dv) : [];
    chk(dvm.length === 2 && dvm.every(x => /mfrac\(mrow\(mi:d,mi:V\),mrow\(mi:d,mi:t\)\)/.test(x.m)), 'notation B·D10: both dV/dt rendered the same way (stacked) ' + J(dv && dv.s));
    m = one('پس حجم = ۲ × (a/2)² × b = a²b/6!', '۲ × (a/2)² × b = a²b/6'); chk(!!m && !/≠/.test(m.m), 'notation D·D8: «!» stays outside, never «!=» ' + J(m));
    // منفیِ یکانی: بی فاصلهٔ دوتایی (form=prefix، lspace=rspace=0) — B·D10 «= − 5»
    const un = await p.evaluate(() => { const r = []; ['dV/dt = −5', 'dy/dt = −5/(16π)', 'x = -3 + y^2'].forEach(t => { const s = APP.MATH.segments(t).find(x => x.m); const mos = s ? [...s.m.querySelectorAll('mo')] : []; const u = mos.find(o => /[−]/.test(o.textContent) && o.previousElementSibling && o.previousElementSibling.textContent === '='); const bin = mos.find(o => o.textContent === '+'); r.push({ t, u: u ? { f: u.getAttribute('form'), l: u.getAttribute('lspace'), r: u.getAttribute('rspace') } : null, bin: bin ? bin.getAttribute('form') : 'none' }); }); return r; });
    un.forEach(x => chk(x.u && x.u.f === 'prefix' && x.u.l === '0' && x.u.r === '0' && x.bin !== 'prefix', 'notation B·D10: unary minus after «=» is prefix without binary spacing ' + J(x)));
    // جابه‌جاییِ RTL (B·D9) و شکستِ خط پیش از «،» (B·D10) در حبابِ واقعیِ دستیار
    await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0;
      __q.push(R({ reply: 'ثابتِ زمانی τ_I برابر ۵ است و نسبتِ τ_I/τ_E را ببین. نرخِ dV/dt = −5 است و بعداً هم dV/dt، رسیدی؟ ' + 'ببین '.repeat(8) + 'آخرِ کار dy/dt، و بعد.' })); });
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', 'بگو'); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 }); await W(150);
    info.bubble = await p.evaluate(() => {
      const a = [...document.querySelectorAll('.as-panel .as-msg.ai .as-tx')].pop(); if (!a) return null;
      const tau = [...a.querySelectorAll('bdi.mx')].find(x => x.getAttribute('data-src') === 'τ_I');
      const base = tau && tau.querySelector('msub > :first-child'), sub = tau && tau.querySelector('msub > :last-child');
      const br = base && base.getBoundingClientRect(), sr = sub && sub.getBoundingClientRect();
      // «،» پس از فرمول: همان خانهٔ بی‌شکست (هیچ‌وقت آغازِ خطِ تازه نیست)
      const nb = [...a.querySelectorAll('.mx-nb')].map(x => ({ t: x.textContent, ws: getComputedStyle(x).whiteSpace, bdi: !!x.querySelector('bdi.mx') }));
      return { tau: !!tau, order: !!(br && sr) && br.left < sr.left, nb, srcs: [...a.querySelectorAll('bdi.mx')].map(x => x.getAttribute('data-src')) };
    });
    chk(info.bubble && info.bubble.tau && info.bubble.order, 'notation B·D9: τ_I renders base left of subscript in the RTL bubble (never I_τ) ' + J(info.bubble));
    chk(info.bubble && info.bubble.nb.some(x => /،$/.test(x.t) && x.ws === 'nowrap' && x.bdi), 'notation B·D10: formula + following «،» sit in one no-break box ' + J(info.bubble && info.bubble.nb));
    await p.evaluate(() => APP.ASSIST.toggle(false));
  });

  // ================= trigger — RM3 =================
  await section('trigger', async () => {
    const ent = of('RM3.trigger');
    chk(ent.length >= 15, 'bank: RM3.trigger entries present ' + ent.length);
    const P0 = await p.evaluate(() => { const r = APP.liveCreate('ودیعهٔ خانه', 'با صاحبخونه سر ودیعه دعوامون شده و نمی‌دونم چطور حرف بزنم', 'find', { by: 'user' }); return r.p.id; });
    const PM = await p.evaluate(() => { const r = APP.liveCreate('جواب‌های نامنفی', 'تعداد جواب‌های صحیحِ نامنفیِ x+y+z=10 چندتاست؟', 'find', { by: 'user' }); return r.p.id; });
    const run = async (msg, view, arg, prevAi) => p.evaluate(async ([msg, view, arg, prevAi]) => {
      localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0;
      if (prevAi) { s.msgs.push({ role: 'user', text: 'سلام', at: new Date().toISOString() }); s.msgs.push({ role: 'ai', text: prevAi, at: new Date().toISOString(), actions: [] }); }
      APP.go(view, arg || null, view === 'e_prob' ? 'live' : undefined); await new Promise(r => setTimeout(r, 120));
      __q.push(R({ reply: 'باشه.' }));
      await APP.ASSIST.send(msg);
      for (let i = 0; i < 100 && APP.ASSIST.busy(); i++) await new Promise(r => setTimeout(r, 50));
      const u = (__calls[__calls.length - 1] || {}).user || '', head = u.split('# نوبتِ تازه')[0];
      const i = head.indexOf('# فرمول'), blk = i < 0 ? '' : head.slice(i, (head.indexOf('\n# ', i + 3) + 1 || head.length + 1) - 1);
      return { has: i >= 0, blk };
    }, [msg, view, arg || null, prevAi || null]);
    const rows = [];
    for (const e of ent) {
      const t = e.text;
      if (e.kind === 'pos') {
        let msg = t.replace(/\s*\(view:[^)]*\)\s*$/, ''), prev = null;
        const am = /^assistant last message: «(.*)»$/.exec(t); if (am) { prev = am[1]; msg = 'باشه، ادامه بده'; }
        for (const view of ['home', 'today', 'lprob']) {
          const r = await run(msg, view, view === 'lprob' ? P0 : null, prev);
          rows.push({ t, view, ok: r.has && /زمینه، نه پرسشِ دوم/.test(r.blk) && /\$…\$/.test(r.blk) });
        }
      } else {
        const msg = t.replace(/\s*\((?:lprob view)\)\s*$/, '');
        for (const [view, arg] of [['home', null], ['lprob', P0], ['e_prob', null]]) { const r = await run(msg, view, arg); rows.push({ t, view, ok: !r.has, neg: true }); }
      }
    }
    // صورتِ مسئلهٔ زندهٔ در نما (بی فرمول در پیام): فرمولی ⇒ خط؛ غیرِفرمولی ⇒ بی خط (پیش‌تر: نمای lprob به‌تنهایی)
    const rm = await run('باشه، از کجا شروع کنم', 'lprob', PM); rows.push({ t: 'problem statement x+y+z=10 on its page', view: 'lprob', ok: rm.has && /زمینه، نه پرسشِ دوم/.test(rm.blk) });
    const r0 = await run('باشه، از کجا شروع کنم', 'lprob', P0); rows.push({ t: 'non-math problem page', view: 'lprob', ok: !r0.has, neg: true });
    // جملهٔ عینیِ D·D1 s38 p7
    const s38 = await run('آره، فرمول زاویه‌ها (n−۲)×۱۸۰ رو بلدم', 'today'); rows.push({ t: 'D·D1 s38 p7', view: 'today', ok: s38.has });
    info.trigger = rows.filter(r => !r.ok);
    rows.forEach(r => chk(r.ok, 'trigger ' + (r.neg ? 'neg (no line)' : 'pos (line, marked context)') + ' [' + r.view + ']: ' + r.t));
  });

  // ================= sinks — RM2a: گزینه‌های متنیِ ساده =================
  await section('sinks', async () => {
    // ساختاری: هر جایی که متنِ گفت‌وگو (liveChatQItems / liveChatQs / chatItems) به گزینه/فهرستِ متنی می‌رود toPlain دارد
    const SRC = path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), 'app');
    const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');
    const KNOWN = [
      { f: 'a27_tour.js', re: /function lbOpts\(pid\)[^\n]*/, why: 'a27 lbOpts ⇒ #lpRBest (D·D7 s38)' },
    ];
    KNOWN.forEach(k => { const m = k.re.exec(read(k.f)); chk(!!m && /toPlain/.test(m[0]), 'sinks (structural): ' + k.why + ' calls APP.MATH.toPlain — ' + (m ? m[0].slice(0, 200) : 'not found')); });
    // پویشِ کلی: هر سطری از a2x/a3x که خروجیِ liveChatQItems/liveChatQs را به option/select/title/textContent می‌دهد
    const files = fs.readdirSync(SRC).filter(f => /^a\d+_.*\.js$/.test(f) && f !== 'a38_live.js');   // a38: چاه‌های خودش را سازندهٔ live می‌گذارد (DECISIONS_R18 «Plain sinks in a38 call APP.MATH.toPlain»)
    const bad = [];
    files.forEach(f => read(f).split('\n').forEach((l, i) => { if (/(?:liveChatQItems|liveChatQs)\s*\(/.test(l) && !/A\.liveChatQ\w* = function/.test(l) && /option|select|textContent|title|toast|map\(/.test(l) && !/toPlain/.test(l)) bad.push(f + ':' + (i + 1) + ' ' + l.trim().slice(0, 160)); }));
    chk(!bad.length, 'sinks (structural): chat-text feeds into plain sinks without toPlain: ' + J(bad));
    // رفتاری: مسئلهٔ بسته‌شده در گفت‌وگو با پرسشِ TeX ِ دستیار ⇒ گزینهٔ #lpRBest متنِ ساده
    const r = await p.evaluate(async () => {
      const t0 = Date.now() - 3 * 3600e3;
      const rr = APP.liveCreate('سه نقطه روی دایره', 'سه نقطه روی دایرهٔ واحد؛ بیشینهٔ مجموعِ فاصله‌ها چیست؟', 'find', { by: 'user', nat: 'objective' }); const id = rr.p.id;
      const r0 = APP.S.get('eprob_' + id); r0.created = new Date(t0 - 3600e3).toISOString(); APP.S.put(r0, { keepTime: true });
      const msgs = [{ role: 'ai', text: 'در هر چیدمان، مقدارِ $p_1+p_2+p_3$ حداکثر چند است؟', at: new Date(t0).toISOString(), actions: [] }, { role: 'user', text: 'فکر کنم ۳', at: new Date(t0 + 60e3).toISOString() },
        { role: 'ai', text: 'اگر $b=a$ باشد، $\\frac{a^2 b}{6}$ معقول است؟', at: new Date(t0 + 120e3).toISOString(), actions: [] }, { role: 'user', text: 'آره', at: new Date(t0 + 180e3).toISOString() }];
      const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [], lprob: id }; APP.S.put(se);
      const pg = APP.solveUI.prog(id), so = APP.solveUI.sol(pg); so.live = so.live || {}; so.live.chat = { sess: se.id, at: new Date(t0 + 240e3).toISOString() }; so.live.state = 'solved';
      so.b = so.b || {}; so.b[1] = { done: true, from: 'chat', at: new Date(t0 + 240e3).toISOString() }; APP.S.put(pg);
      const items = (APP.liveChatQItems(id) || []).map(x => x.t);
      const card = APP.chatLookCard ? APP.chatLookCard(id) : null;   // the same card a27 inserts after the look-back summary of a chat-closed problem
      const sel = card && card.querySelector('#lpRBest');
      return { items, opts: sel ? [...sel.options].map(o => o.textContent) : null };
    });
    info.sinks = r;
    chk(r.items.some(t => /\$/.test(t)), 'sinks setup: the chat items carry the model\'s TeX (source) ' + J(r.items));
    chk(!!r.opts && r.opts.length >= 3 - (r.items.length < 2 ? 1 : 0), 'sinks setup: #lpRBest card shown ' + J(r));
    if (r.opts) {
      chk(r.opts.every(t => !/[$\\]/.test(t) && !/[a-z]_\d/.test(t)), 'sinks D·D7/A·X1: #lpRBest options are plain Unicode (no $, \\, _) ' + J(r.opts));
      chk(r.opts.some(t => /p₁\+p₂\+p₃/.test(t)) && (r.items.length < 2 || r.opts.some(t => /a²b\/6/.test(t))), 'sinks: options read «p₁+p₂+p₃» and «a²b/6» ' + J(r.opts));
    }
  });

  // ================= preview — INF3 =================
  await section('preview', async () => {
    const pid = await p.evaluate(() => { const r = APP.liveCreate('مجموعِ تلسکوپی', 'ثابت کن مجموعِ 1/(k(k+1)) از k=1 تا n برابرِ n/(n+1) است', 'prove', { by: 'user' }); return r.p.id; });
    const seen = {}, miss = [];
    // فهم (کل) ⇒ فهم/طرح/اجرا (فهم و طرحِ ثبت‌شده، همان شکلِ رکوردی که فرم‌ها می‌سازند) ⇒ بازنگری (حل‌شده)
    const seed = (pid, k) => p.evaluate(([pid, k]) => { const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg); s.live = s.live || {};
      if (k === 'up') { s.u[1] = { done: true, at: new Date().toISOString(), u: 'برابری', d: 'n', c: 'k از ۱ تا n', dl: [] }; s.live.plan = { at: new Date().toISOString(), t: 'تلسکوپی', unused: {} }; }
      if (k === 'solved') { s.live.state = 'solved'; s.live.stateAt = new Date().toISOString(); }
      APP.S.put(pg); }, [pid, k]);
    for (const [sub, k] of [['u', null], ['u', 'up'], ['plan', null], ['exec', null], ['back', 'solved']]) {
      if (k) await seed(pid, k);
      await p.evaluate(([pid, sub]) => APP.go('lprob', pid, sub), [pid, sub]); await W(200);
      await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); await W(80);
      const r = await p.evaluate(() => [...document.querySelectorAll('main textarea[id^="lp"], main input[id^="lp"]')].filter(e => (e.tagName === 'TEXTAREA' || !e.type || e.type === 'text')).map(e => ({ id: e.id, pv: !!document.querySelector('.mx-prev[data-for="' + e.id + '"]') })));
      r.forEach(x => { seen[x.id] = 1; if (!x.pv) miss.push(sub + ':' + x.id); });
    }
    info.fields = Object.keys(seen);
    chk(info.fields.length >= 5, 'preview: live-problem text fields found across the four stages ' + J(info.fields));
    chk(!miss.length, 'preview INF3: EVERY live-problem text field has a formula preview ' + J(miss));
    // پیش‌نمایشِ زنده روی چند فیلدِ گوناگون (فهم، طرح، گام، اثبات…)
    await p.evaluate((pid) => APP.go('lprob', pid, 'u'), pid); await W(200);
    await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); await W(60);
    const ids = await p.evaluate(() => [...document.querySelectorAll('main textarea[id^="lp"]')].map(e => e.id).slice(0, 3));
    for (const id of ids) {
      await p.fill('#' + id, 'اگر ۰٫۱×۲۰ + ۰٫۲۵×ح = ۰٫۱۵(۲۰+ح) و (10/n)^(n/2) باشد'); await W(60);
      const r = await p.evaluate((id) => { const pv = document.querySelector('.mx-prev[data-for="' + id + '"]'); return pv ? { hidden: pv.hidden, math: pv.querySelectorAll('math').length } : null; }, id);
      chk(r && !r.hidden && r.math === 2, 'preview: field #' + id + ' shows both formulas live ' + J(r));
    }
    // ورودیِ گفت‌وگو
    await p.evaluate(() => APP.ASSIST.toggle(true)); await W(80);
    await p.fill('.as-panel .as-in', 'جوابم ۱/۵ − ۱/(۳(n+۲)) شد'); await W(80);
    info.chatPv = await p.evaluate(() => { const pv = document.querySelector('.as-panel .mx-prev'); return pv ? { hidden: pv.hidden, math: pv.querySelectorAll('math').length } : null; });
    chk(info.chatPv && !info.chatPv.hidden && info.chatPv.math === 1, 'preview INF3: the chat input has a live formula preview ' + J(info.chatPv));
    await p.fill('.as-panel .as-in', 'سلام، امروز ۳ ساعت کار کردم'); await W(60);
    const hid = await p.evaluate(() => { const pv = document.querySelector('.as-panel .mx-prev'); return pv ? pv.hidden : null; });
    chk(hid === true, 'preview: chat preview hidden for plain prose with numbers');
    // نوارِ «∑ فرمول»: در جای مکان‌نما درج می‌کند و رویدادِ input می‌فرستد
    await p.fill('.as-panel .as-in', 'x + 1'); await p.focus('.as-panel .as-in');
    await p.evaluate(() => { const t = document.querySelector('.as-panel .as-in'); t.setSelectionRange(1, 1); });
    const bar = await p.evaluate(() => { const b = document.querySelector('.as-panel .mx-bar'); return b ? { tog: !!b.querySelector('.mx-bar-tog'), t: b.textContent } : null; });
    chk(bar && bar.tog && /∑ فرمول/.test(bar.t), 'symbol bar «∑ فرمول» appears with the focused chat input ' + J(bar));
    if (bar) {
      await p.click('.as-panel .mx-bar .mx-bar-tog'); await W(40);
      const keys = await p.evaluate(() => [...document.querySelectorAll('.as-panel .mx-bar .mx-sym')].map(b => b.getAttribute('data-ins')));
      chk(['²', '√', '÷', '×', '≤', '≥', '⇒', '_', '/'].every(k => keys.some(x => x && x.indexOf(k) >= 0)), 'symbol bar has x² √ ÷ × ≤ ≥ ⇒ subscript fraction ' + J(keys));
      await p.click('.as-panel .mx-bar .mx-sym[data-k="sq"]'); await W(40);
      const v = await p.evaluate(() => { const t = document.querySelector('.as-panel .as-in'); return { v: t.value, c: t.selectionStart, focus: document.activeElement === t, draft: APP.ASSIST._draft }; });
      chk(v.v === 'x² + 1' && v.c === 2 && v.focus, 'symbol bar inserts «²» at the caret and keeps focus ' + J(v));
      const pvm = await p.evaluate(() => { const pv = document.querySelector('.as-panel .mx-prev'); return pv ? pv.querySelectorAll('math').length : -1; });
      chk(pvm === 1, 'symbol bar insertion fires input ⇒ preview updates ' + pvm);
      await p.click('.as-panel .mx-bar .mx-sym[data-k="frac"]'); await W(40);
      const v2 = await p.evaluate(() => { const t = document.querySelector('.as-panel .as-in'); return { v: t.value, c: t.selectionStart }; });
      chk(v2.v === 'x²()/() + 1' && v2.c === 3, 'symbol bar fraction inserts «()/()» with the caret in the numerator ' + J(v2));
    }
    await p.evaluate(() => { const t = document.querySelector('.as-panel .as-in'); t.value = ''; t.dispatchEvent(new Event('input', { bubbles: true })); APP.ASSIST.toggle(false); });
    // در فیلدِ مسئله هم
    await p.evaluate((pid) => APP.go('lprob', pid, 'u'), pid); await W(200);
    const fid = await p.evaluate(() => { const e = document.querySelector('main textarea[id^="lp"]'); return e && e.id; });
    if (fid) {
      await p.fill('#' + fid, 'a b'); await p.focus('#' + fid); await p.evaluate((id) => document.getElementById(id).setSelectionRange(1, 1), fid);
      const fb = await p.evaluate((id) => { const b = document.querySelector('main .mx-bar'); return !!b; }, fid);
      chk(fb, 'symbol bar appears with a focused live-problem field');
      if (fb) { if (await p.locator('main .mx-bar .mx-syms').isHidden()) await p.click('main .mx-bar .mx-bar-tog'); await W(30); await p.click('main .mx-bar .mx-sym[data-k="sub"]'); await W(40); const v = await p.evaluate((id) => document.getElementById(id).value, fid); chk(v === 'a_ b', 'symbol bar subscript inserts «_» in the field ' + J(v)); }
    }
  });

  // ================= plot — INF8 =================
  await section('plot', async () => {
    const msgs = [
      ['۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونش چیه؟', 5, 'user', 's07'],
      ['هفته | وزن\n۱ | ۸۲\n۲ | ۸۱٫۵\n۳ | ۸۱\n۴ | ۸۰٫۲', 4, 'user', 's19 table'],
      ['جدولِ اجراها:\nτ_I/τ_E   g\n0.5   0.10\n1.0   0.14\n1.5   0.22\n2.0   0.31\n', 4, 'ai', 's20 table'],
      ['وزنم این هفته‌ها: 82, 81.4, 81, 80.6, 80.1', 5, 'user', 'series'],
      ['جلسه‌مون ۱۴۰۵/۰۷/۲۵ ساعت ۱۰ صبحه و شمارم ۰۹۱۲-۳۴۵-۶۷۸۹ هست', 0, 'user', 'neg date/phone'],
      ['۳ تا سیب و ۲ تا پرتقال خریدم', 0, 'user', 'neg prose'],
      ['گزینه‌های ۱، ۲ و ۳ را دیدم', 0, 'user', 'neg short list'],
    ];
    const res = [];
    for (const [t, n, role, tag] of msgs) {
      const r = await p.evaluate(async ([t, role]) => {
        localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0;
        s.msgs.push({ role: role === 'ai' ? 'user' : 'user', text: role === 'ai' ? 'سلام' : t, at: new Date().toISOString() });
        if (role === 'ai') s.msgs.push({ role: 'ai', text: t, at: new Date().toISOString(), actions: [] });
        APP.ASSIST.toggle(true); APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 120));
        const m = [...document.querySelectorAll('.as-panel .as-msg')].pop(); const sv = m && m.querySelector('.mx-plot svg');
        const pl = sv && sv.querySelector('polyline');
        return { svg: !!sv, n: pl ? pl.getAttribute('points').trim().split(/\s+/).length : 0, dots: sv ? sv.querySelectorAll('circle').length : 0, lab: sv ? (sv.getAttribute('aria-label') || '') : '' };
      }, [t, role]);
      res.push(Object.assign({ tag, want: n }, r));
    }
    info.plot = res;
    res.forEach(r => chk(r.want ? (r.svg && r.n === r.want && r.dots === r.want) : !r.svg, 'plot INF8 ' + r.tag + ': ' + (r.want ? r.want + '-point inline SVG line plot under the message' : 'no plot') + ' ' + J(r)));
    // s07: محورِ x همان ساعت‌ها (دو رشتهٔ هم‌طول ⇒ x→y)، y صعودی و رو به کندی
    const s07 = await p.evaluate(async () => {
      localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text: 'ساعت‌ها ۲، ۴، ۶، ۸، ۱۰ و قدها ۴، ۹، ۱۳، ۱۶، ۱۷', at: new Date().toISOString() });
      APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 120));
      const sv = [...document.querySelectorAll('.as-panel .as-msg')].pop().querySelector('.mx-plot svg'); if (!sv) return null;
      const pts = sv.querySelector('polyline').getAttribute('points').trim().split(/\s+/).map(x => x.split(',').map(Number));
      return { pts, txt: sv.textContent };
    });
    chk(s07 && s07.pts.length === 5 && s07.pts.every((q, i) => i === 0 || (q[0] > s07.pts[i - 1][0] && q[1] < s07.pts[i - 1][1])) && /۲/.test(s07.txt) && /۱۷/.test(s07.txt), 'plot s07: x = hours, y rises (SVG y falls), axis labels in Persian digits as typed ' + J(s07));
    // ایمنی: هیچ عنصرِ HTML از متن (فقط svg/polyline/circle/text/line)
    const xs = await p.evaluate(async () => {
      localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text: '<img src=x onerror=window.__px=1>\n1 | 2\n2 | 3\n3 | 5\n<script>window.__px=2</script>', at: new Date().toISOString() });
      APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 150));
      const pl = [...document.querySelectorAll('.as-panel .mx-plot')].pop(); return { has: !!pl, px: window.__px, tags: pl ? [...new Set([...pl.querySelectorAll('*')].map(e => e.localName))] : [] };
    });
    chk(xs.has && xs.px === undefined && xs.tags.every(t => /^(svg|polyline|circle|text|line|title|g|span|div)$/.test(t)), 'plot: escape everything (no injected element/handler) ' + J(xs));
    await p.evaluate(() => APP.ASSIST.toggle(false));
  });

  // ================= fen — INF9 =================
  await section('fen', async () => {
    const r = await p.evaluate(async () => {
      const out = {};
      const show = async (text) => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text, at: new Date().toISOString() }); APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 120)); return [...document.querySelectorAll('.as-panel .as-msg')].pop(); };
      let m = await show('مسئله: سفید در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 . من کیش با وزیر رو زدم ولی شاه فرار می‌کنه.');
      const bd = m.querySelector('.mx-board');
      const sq = bd ? [...bd.querySelectorAll('[data-sq]')] : [];
      const at = (k) => { const e = bd && bd.querySelector('[data-sq="' + k + '"]'); return e ? e.textContent : null; };
      out.ok = { board: !!bd, n: sq.length, f8: at('f8'), f6: at('f6'), a1: at('a1'), d1: at('d1'), e4: at('e4'), side: bd ? bd.textContent : '', dir: bd ? bd.getAttribute('dir') : '', math: m.querySelectorAll('math').length };
      m = await show('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      out.start = { board: !!m.querySelector('.mx-board'), e5: (m.querySelector('.mx-board [data-sq="e5"]') || {}).textContent, e1: (m.querySelector('.mx-board [data-sq="e1"]') || {}).textContent };
      m = await show('این FEN خراب است: 5k2/8/5K2/8/8/8/R2Q4 w');   // ۷ ردیف
      out.bad = !!m.querySelector('.mx-board');
      m = await show('rnbqkbnr/ppppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w');   // ردیفِ ۹ خانه
      out.bad2 = !!m.querySelector('.mx-board');
      m = await show('تاریخ ۱۴۰۵/۰۷/۲۵ و 1/2/3/4/5/6/7/8');
      out.bad3 = !!m.querySelector('.mx-board');
      APP.ASSIST.toggle(false);
      return out;
    });
    info.fen = r;
    chk(r.ok.board && r.ok.n === 64 && r.ok.f8 === '♚' && r.ok.f6 === '♔' && r.ok.a1 === '♖' && r.ok.d1 === '♕' && r.ok.e4 === '' && r.ok.dir === 'ltr', 'fen INF9 s21: 8×8 Unicode board, pieces on the right squares ' + J(r.ok));
    chk(/سفید/.test(r.ok.side) && r.ok.math === 0, 'fen: side to move named; the FEN is not rendered as math ' + J(r.ok));
    chk(r.start.board && r.start.e5 === '♟' && r.start.e1 === '♔', 'fen: a full position (black pawn e5, white king e1) ' + J(r.start));
    chk(!r.bad && !r.bad2 && !r.bad3, 'fen: malformed FEN (7 ranks / 9 squares) and dates give no board ' + J(r));
  });

  console.log(JSON.stringify({ plainBad: (info.plain || []).filter(r => r.got !== r.want).length, trigger: info.trigger, fields: info.fields, plot: info.plot, fen: info.fen && info.fen.ok }).slice(0, 2500));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
