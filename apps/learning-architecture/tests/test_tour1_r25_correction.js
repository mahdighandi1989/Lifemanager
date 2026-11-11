// تورِ پولیا (دستهٔ ۱، دورِ ۲۵، ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25، سازوکارِ P4 «STALE-NUMBER MECHANISM» + روشن‌سازیِ C11 (fixer «correction»: a38 liveStale و برگرداندن؛ قلابِ a27).
//  دو منبعِ شاهد، هر دو قرمز پیش از اصلاح:
//   (۱) جمله‌های خودِ دونده‌ها (round25{A,B,C,D}: A25-9، C25-4، C25-8، D25-18، D25-19، B25·D10) با متن‌های واقعیِ همان نوبت‌ها و فرم‌های همان سناریوها؛
//   (۲) بانکِ مستقلِ VARIANTS_R25 (tests/variants/VARIANTS_R25.json؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودیِ P4 یک بررسی (tour1_r25_correction_bank.js).
//  هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R25.json')].find(f => f && fs.existsSync(f)) || '';

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { runners: {}, bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const J = (x) => JSON.stringify(x);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra) => { const n0 = __calls.length; __q.push(R(Object.assign({ reply: reply || 'باشه.', actions: actions || [] }, extra || {}))); await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {}; return { user: c.user || '', all: all.map(x => x.user) }; };
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'card', 'deadline', 'fcast', 'mlog'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__U = (n) => (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(m.text))[n - 1];
    window.__live = (title, st, o) => { const r = APP.liveCreate(title, st, 'find', Object.assign({ by: 'user' }, o || {})); return r.p.id; };
    window.__set = (pid, fn) => { const pg = APP.S.get('eprog_' + pid); pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L, APP.S.get('eprob_' + pid)); APP.S.put(pg); };
    window.__edit = async (m, nt) => { const s = __cur(), n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); const r = APP.ASSIST.retractEdit(s, m, nt);
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300)); return { r: { ok: r.ok, changed: (r.changed || []).map(c => c.label + ': ' + (typeof c.old === 'string' ? c.old : '') + ' ⇒ ' + (typeof c.new === 'string' ? c.new : '')), ask: (r.ask || []).map(q => q.path + '|' + q.old + '⇒' + q.new) }, user: (__calls.slice(n0)[0] || {}).user || '' }; };
    window.__asks = (sid) => ((APP.S.get(sid || __cur().id) || {}).copyAsk || []).map(q => ({ id: q.id, path: q.path, label: q.label, old: q.old, new: q.new, state: q.state, pid: q.pid }));
    window.__ret = () => { const C = (__cur().coach || {}); return { res: (C.retNote || {}).res || null, ch: (C.retNote || {}).ch || [], frag: (C.retNote || {}).frag || '', fix: (C.retNote || {}).fix || '' }; };
    window.__sys = (n) => __cur().msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-(n || 1));
  });
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || null]);
  const ev = (f, a) => p.evaluate(f, a);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const RT = (o) => [cs({ retract: o })];
  /* سطرِ «تغییر» یک‌سویه: «تازه» (اصلاح شد ⇐ «پیشین»)؛ هرگز «پیشین» ⇐ «تازه» در سطرِ تغییر (بانکِ R24 #65/#79) */
  const REVERSED = /^[^:]+:\s*«[^»]*»\s*⇐\s*«/;
  const EMPTYQ = /«»/;
  const res = {};
  const T = async (name, fn) => { if (process.env.ONLYBANK) return true; let r; try { r = await fn(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; } res[name] = !!r.ok; info.runners[name] = !!r.ok; if (!r.ok) errors.push(name + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1400)); return r.ok; };


  /* ---- ابزارِ سناریو (همان الگوی بانکِ R24) ---- */
  const CS = (o) => [Object.assign({ do: 'coach_state' }, o)];
  const scen = (o) => ev(async (o) => {
    __wipe(); __fresh();
    for (const t of (o.prior || [])) { if (typeof t === 'string') await __turn(t, 'خب.'); else await __turn(t.t, t.r || 'خب.', t.a || []); }
    const s = __cur(); let pid = '';
    if (o.stmtChat) { s.coach = s.coach || {}; s.coach.stmt = o.stmtChat; APP.S.put(s); }
    if (o.live) { pid = o.live.typed ? __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt) : __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt || (typeof o.prior[0] === 'string' ? o.prior[0] : o.prior[0].t), { by: 'assistant', sess: s.id });
      APP.liveBindSession(pid, APP.S.get(s.id)); if (!o.live.typed) APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { const u = o.live.u; if (u) so.u = { 1: Object.assign({ done: true, at: new Date().toISOString(), one: 'کلِ مسئله', u: 'مجهول', dl: [], c: '', type: 'find', nat: 'practical', from: 'page' }, u) };
        if (o.live.plan) L.plan = { t: o.live.plan, at: new Date().toISOString() };
        (o.live.steps || []).forEach((t, i) => { const st = typeof t === 'string' ? { text: t } : t; L.steps.push(Object.assign({ id: 'st' + (i + 1), at: new Date().toISOString(), pred: 'می‌بینم', due: APP.today() }, st)); });
        if (o.live.b) so.b = { 1: Object.assign({ done: true, from: 'page', at: new Date().toISOString() }, o.live.b) };
        if (o.live.g) so.g = { 1: Object.assign({ at: new Date().toISOString() }, o.live.g) };
        if (o.live.prior) L.prior = o.live.prior;
        if (o.live.suff) L.suffLog = [{ at: new Date().toISOString(), d: APP.today(), ans: o.live.suff, why: 'داوریِ خودش', where: 'form' }];
        if (o.live.solved) { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: o.live.solved }; } }); }
    return pid;
  }, o);
  const snap = (pid) => ev(async (pid) => { const s = __cur(), r = pid && APP.S.get('eprob_' + pid), so = pid && APP.S.get('eprog_' + pid).solve; let card = '';
    if (pid) { APP.go('lprob', pid); await new Promise(z => setTimeout(z, 250)); const c = document.querySelector('#main .lp-stale'); card = c ? c.innerText : ''; }
    const L = so && so.live || {};
    return { st: r ? r.p.statement : '', asks: __asks(), stale: pid && APP.liveStale ? APP.liveStale(pid).map(x => ({ k: x.k, v: x.v, re: x.re, raw: x.raw })) : [], card,
      suff: (L.suffLog || []).map(x => x.ans).pop() || '', gsup: !!(so && so.g && so.g[1] && so.g[1].outSup), state: L.state || '', b: so && so.b && so.b[1] ? so.b[1].verdict : '',
      prior: L.prior ? L.prior.steps.map(x => ({ n: x.n, v: x.verdict, stale: x.stale25 || null })) : null,
      cg: ((s.coach || {}).guesses || []).map(g => ({ id: g.id, t: g.text, r: g.res || '' })), ch: (s.coach && s.coach.retNote || {}).ch || [],
      ev: (s.coachEv || []).filter(e => e.how === 'res').map(e => ({ span: (e.src20 || {}).span, stale: e.stale ? (e.stale.why || '1') : '' })), sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-2) }; }, pid);
  const openAsks = (x) => x.asks.filter(a => a.state === 'open');
  const edit = (n, f) => ev(async ([n, f]) => { const m = __U(n); return __edit(m, m.text.split(f[0]).join(f[1])); }, [n, f]);
  const editPairs = (n, pairs) => ev(async ([n, pairs]) => { const m = __U(n); let t = m.text; pairs.forEach(p => { t = t.replace(p[0], p[1]); }); return __edit(m, t); }, [n, pairs]);
  const yesAll = () => ev(async () => { for (const a of __asks().filter(a => a.state === 'open')) APP.liveCopyAnswer(__cur().id, a.id, true); });
  const RES = (t) => ({ t, a: CS({ ph: 'c', said: ['result'], result: t }) });
  const st2 = (x) => x.stale.map(s0 => s0.v + '>' + (s0.re == null ? '?' : s0.re)).join(' ');
  const has = (x, v, re) => x.stale.some(s0 => s0.v === v && (re === undefined ? true : re === null ? s0.re == null : s0.re != null && Math.abs(s0.re - re) < 1e-6));
  const vals = (x) => x.stale.map(s0 => s0.v);
  const allText = (x) => J([x.card, x.ch, x.sys]);
  const H = { scen, snap, openAsks, edit, editPairs, yesAll, RES, st2, has, vals, allText, CS, RT, turn, ev, J };

  /* ================= (۱) جمله‌های دونده‌ها ================= */
  // A25-9 s02 (S2): «عددهای حساب‌شده از «۱.۶»: «۰٫۵» — کهنه پس از اصلاح — با «۱۵۰ سانت» دوباره حساب شود (۰٫۵ ⇒ ۴۶٫۸۷۵)» (متر/سانت یکی نشده؛ ۰٫۵ از ۱.۶ حساب نشده)
  const S02 = 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟ زود بگو مشتری منتظره.';
  const s02 = async () => { const pid = await scen({ prior: [S02], live: { u: { one: 'لوله جا می‌شود؟', dl: [{ id: 'd1', t: 'لوله ۴ متر' }, { id: 'd3', t: 'ارتفاع بار ۱.۶ متر' }], prac: { measure: 'x متر ≥ ۴ متر' } },
      g: { guess: 'جا نمی‌شه چون ۳.۲ از ۴ کمتره', test: 'اگه یه راه کج پیدا کنم که بلندتر از ۴ باشه' }, plan: 'نخست قطر کف را از طول و عرض با فیثاغورس حساب می‌کنم، سپس با قطر کف و ارتفاع مثلث قائم دوم را می‌سازم و قطر فضایی را با ۴ متر مقایسه می‌کنم.',
      steps: [{ text: 'قطر فضایی رو با متر اندازه می‌گیرم؛ انتظار: sqrt(3.2^2 + 1.8^2 + 1.6^2) ≈ 4.005 و ۴۰ درصد خطا نه', pred: 'حدود ۴ متر و نیم سانت می‌شه', out: { what: 'اندازه گرفتم: قطر فضایی حدود ۴ متر و نیم سانت شد؛ لوله رو کج گذاشتم و جا شد، در بسته شد.', at: new Date().toISOString() } }] } });
    await turn('یه اصلاح دربارهٔ همون لوله: اولش گفتم ارتفاعِ بار ۱.۶ـه؛ امروز دوباره با متر اندازه گرفتم — ۱۶۰ سانت نبود، ۱۵۰ سانته.', 'فرستادم.', RT({ msg: '۱.۶ ارتفاع داره', key: 'datum:ارتفاع بار', what: 'fact', fix: '۱۵۰ سانت', old: '۱.۶' })); return pid; };
  await T('A25-9 s02 «۱.۶ ⇐ ۱۵۰ سانت»: «۰٫۵» (نیم سانت) is never «حساب‌شده از ۱.۶»; no metre/centimetre mix («۴۶٫۸۷۵»); her written sqrt is recomputed in metres (4.005 ⇒ ≈ 3.966)', async () => {
    const pid = await s02(); const a = await snap(pid); await yesAll(); const x = await snap(pid), tx = allText(a) + allText(x);
    return { ok: !has(x, 0.5) && !has(a, 0.5) && !/۴۶|46\.8/.test(tx) && !x.stale.some(z => z.re != null && z.re > 10) && x.stale.some(z => z.v === 4.005 && z.re != null && Math.abs(z.re - Math.sqrt(3.2 * 3.2 + 1.8 * 1.8 + 1.5 * 1.5)) < 1e-6) && /۳٫۹۶۶/.test(x.card) && !vals(x).some(v => [4, 3.2, 1.8, 40].includes(v)), got: { a: st2(a), x: st2(x), card: x.card } }; });

  // A25-9 s04 p7 (S2): «از «۸ میلیارد»: «۲» … (۲ ⇒ ۲٫۷۵)» — «۲» شمارهٔ «۲. سهم هر کدوم مساوی» است
  await T('A25-9 s04 «۸ ⇐ ۱۱ میلیارد»: the list index «۲.» is never a stale number', async () => {
    const M = 'داده‌ها: خونه حدود ۸ میلیارد می‌ارزه. خواهرم پس‌انداز نداره. برادرم امسال پول لازم داره. شرطامون اینه: ۱. خونه فروخته نشه. ۲. سهم هر کدوم مساوی باشه. ۳. خواهرم توش زندگی کنه. ۴. برادرم امسال پول نقدشو بگیره. باید یه تصمیم بگیرم.';
    const pid = await scen({ prior: ['چهار تا خواهر و برادریم. خونه‌ی پدری رو هیچ‌کس نمی‌خواد بفروشه، هر کدوم سهم مساوی می‌خوایم.', M], live: { stmt: M, u: { one: 'خانهٔ پدری را چطور تقسیم کنیم که همه راضی باشند؟', dl: [{ id: 'd1', t: 'خونه حدود ۸ میلیارد می‌ارزه' }, { id: 'd2', t: 'چهار خواهر و برادر' }], c: '۱. خونه فروخته نشه\n۲. سهم هر کدوم مساوی باشه\n۳. خواهرم توش زندگی کنه\n۴. برادرم امسال پول نقدشو بگیره', nat: 'life' },
      plan: 'گامِ ۲: با برادرم دربارهٔ زمانِ پرداخت حرف می‌زنم', steps: ['۱. جلسه با هر چهار نفر ۲. پیشنهادِ اجاره'] } });
    await turn('یه اصلاح: تو پیامِ داده‌ها گفتم «خونه حدود ۸ میلیارد می‌ارزه» — اشتباه گفتم، قیمتِ کارشناسی ۱۱ میلیارد بود؛ ۱۱ میلیارد درسته.', 'فرستادم.', RT({ msg: 'خونه حدود ۸ میلیارد می‌ارزه', key: 'datum:قیمت', what: 'fact', fix: '۱۱ میلیارد', old: '۸ میلیارد' }));
    await yesAll(); const x = await snap(pid); return { ok: /۱۱ میلیارد/.test(x.st) && !x.stale.length && !/۲٫۷۵|کهنه/.test(allText(x)), got: { s: st2(x), ch: x.ch } }; });

  // A25-9 s03 p9 (S2): «از «۹ نقطه»: «۱» … (۱ ⇒ ۰)» — «۱» بیشترین فاصلهٔ صورت است
  await T('A25-9 s03 «۹ ⇐ ۱۰ نقطه»: the distance bound «۱» and the side «۳» of the statement are never stale', async () => {
    const M = 'یه مسئلهٔ تازه با همون روش: ۹ نقطه داخل یک مثلث متساوی‌الاضلاع به ضلع ۳ داریم؛ می‌خوام ثابت کنم دو تاشون فاصله‌شون حداکثر ۱ هست. اینم ثبتش کن.';
    const pid = await scen({ prior: [M], live: { u: { type: 'prove', one: '۹ نقطه در مثلثِ ضلع ۳: دو تا با فاصلهٔ حداکثر ۱', u: 'دو نقطه که فاصله‌شان حداکثر ۱ است', dl: [{ id: 'd1', t: '۹ نقطه' }, { id: 'd2', t: 'مثلثِ متساوی‌الاضلاع به ضلع ۳' }], c: 'فاصله ≤ ۱' } } });
    await turn('اشتباه نوشتم: ۱۰ نقطه است، نه ۹.', 'فرستادم.', RT({ msg: '۹ نقطه داخل یک مثلث', key: 'datum:تعدادِ نقطه‌ها', what: 'fact', fix: '۱۰ نقطه', old: '۹ نقطه' }));
    await yesAll(); const x = await snap(pid); return { ok: /۱۰ نقطه/.test(x.st) && !x.stale.length && !/کهنه/.test(allText(x)), got: { s: st2(x), ch: x.ch } }; });

  // A25-9 s07 p8 (S3): «از «۹، ۱۶»: «۴، ۱۳، ۵، ۱۲»» — ۴ و ۱۳ داده‌اند
  await T('A25-9 s07 ✏️ «۹⇒۸، ۱۶⇒۱۵»: her raw data (۴، ۱۳، ۱۷، the hours, «۳ هفته») are never stale', async () => {
    const S07 = '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.';
    const pid = await scen({ prior: [S07], stmtChat: S07, live: { typed: true, stmt: '۵ گلدان لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور؛ قد پس از ۳ هفته ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونِ رابطهٔ نور و قد چیست؟',
      u: { one: 'رابطهٔ نور و قد', u: 'رابطهٔ قد با ساعتِ نور', dl: [{ id: 'd1', t: '۲ ساعت ⇒ ۴ سانت' }, { id: 'd2', t: '۴ ساعت ⇒ ۹ سانت' }, { id: 'd3', t: '۶ ساعت ⇒ ۱۳ سانت' }, { id: 'd4', t: '۸ ساعت ⇒ ۱۶ سانت' }, { id: 'd5', t: '۱۰ ساعت ⇒ ۱۷ سانت' }] } } });
    await edit(1, ['۴، ۹، ۱۳، ۱۶، ۱۷', '۴، ۸، ۱۳، ۱۵، ۱۷']); const a = await snap(pid); await yesAll(); const x = await snap(pid);
    return { ok: !a.stale.length && !x.stale.length && !/کهنه/.test(allText(x)), got: { a: st2(a), x: st2(x), ch: x.ch } }; });

  // C25-4 s29 p13 (S2): «عددهای کهنه: ۴، ۵، ۱۵، ۱۰، ۱۰۰ ⇒ (۴ ⇒ ۰، ۵ ⇒ ۱، ۱۵ ⇒ ۱۹)» — ۱۰ و ۱۰۰ ِ واقعاً مشتق بی ۱۱ و ۱۲۱
  const S29 = '۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره؛ مثلاً ۱×۱۹ که 2(1+19) = 40 میشه. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟ اول باغچه رو ثبت کن.';
  await T('C25-4 s29 «۴۰ ⇐ ۴۴ متر»: the really derived numbers are caught with the right values (۱۰ ⇒ ۱۱، ۱۰۰ ⇒ ۱۲۱); «۴»، «۵»، «۱۵»، «۱۹» get no proposal', async () => {
    const pid = await scen({ prior: [S29], live: { u: { one: 'می‌خواهم از همهٔ چهارضلعی‌هایی که محیطشان ۴۰ متر است، آن را که بیشترین مساحت دارد بیابم.', u: 'چهارضلعیِ با بیشترین مساحت', dl: [{ id: 'd1', t: 'محیط ۴۰ متر' }, { id: 'd2', t: 'شکل چهارضلعی است' }], c: 'مجموعِ چهار ضلع ۴۰ است\nمساحت بیشینه باشد' },
      g: { guess: 'مستطیلِ باریک و بلند', test: 'مستطیل‌های ۱×۱۹، ۵×۱۵، ۱۰×۱۰ را حساب می‌کنم' }, plan: 'نخست مسئلهٔ کمکیِ مستطیل‌ها را با جبر حل می‌کنم (a + b = ۲۰، بیشینهٔ ab)، سپس از راهِ پل به همهٔ چهارضلعی‌ها برمی‌گردم.',
      steps: ['برای مستطیل: a + b = ۲۰ و S = ab = a(20 − a) = ۱۰۰ − (a − 10)² ≤ ۱۰۰؛ بیشینه در a = b = ۱۰ (مربع)'] } });
    await turn('یه اصلاح دربارهٔ باغچه: روز اول گفتم «۴۰ متر لبه‌ی سنگی دارم» — اشتباه بود، دوباره شمردم، ۴۴ متره.', 'فرستادم.', RT({ msg: '۴۰ متر لبه‌ی سنگی دارم', key: 'datum:محیط', what: 'fact', fix: '۴۴ متر', old: '۴۰ متر' }));
    await yesAll(); const x = await snap(pid), V = vals(x);
    return { ok: has(x, 10, 11) && has(x, 100, 121) && !V.some(v => [4, 5, 15, 19, 1, 2].includes(v)) && x.stale.every(z => z.re == null || [11, 121, 22].includes(z.re)) && /۱۲۱/.test(x.card) && !/⇒ ۰|⇒ ۱\b|⇒ ۱۹/.test(allText(x)), got: { s: st2(x), card: x.card } }; });

  // C25-4 s25 p12/p15 (S2): ««۱، ۲ (۱ ⇒ ۰)» از ۱/(2·3·5)؛ «۱۱، ۱۲» از «۱۰ تاشو چک کردم»»
  await T('C25-4 s25 «۱/(2·3·5) ⇐ ۱/(2·3·4)» and «۱۰ تاشو چک کردم ⇐ ۸»: no invented stale list («۱، ۲»، «۱۱، ۱۲»)', async () => {
    const M3 = 'جلسه سوم: خودم الگوی ۱/(1·2·3) + ۱/(2·3·5) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.';
    let pid = await scen({ prior: [M3], live: { u: { type: 'prove', one: 'جمعِ ۱/(1·2·3) + ۱/(2·3·5) + … تا n جمله چند می‌شود؟', u: 'جمع تا n جمله', dl: [{ id: 'd1', t: 'جملهٔ دوم ۱/(2·3·5)' }], c: '' }, g: { guess: 'میشه ۱/۴ − ۱/(2(n+1)(n+2))', test: 'n=3 را حساب می‌کنم' }, steps: ['n=1: ۱/۶ و فرمول ۱/۴ − ۱/۱۲ = ۱/۶'] } });
    await turn('ببخشید، اشتباه تایپ کردم: جملهٔ دومِ الگو ۱/(2·3·4) بود، نه ۱/(2·3·5).', 'فرستادم.', RT({ msg: '۱/(2·3·5)', key: 'datum:جملهٔ دوم', what: 'fact', fix: '۱/(2·3·4)', old: '۱/(2·3·5)' }));
    await yesAll(); const a = await snap(pid);
    const M = 'امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم. درسته دیگه؟ ثابت شد.';
    pid = await scen({ prior: [M], live: { u: { type: 'prove', one: 'می‌خواهم ثابت کنم جمعِ ۱/(k(k+1)) از k=1 تا n همیشه n/(n+1) است.', u: 'برای هر عددِ طبیعیِ n: ۱/(1·2) + ۱/(2·3) + … + ۱/(n(n+1)) = n/(n+1)', dl: [{ id: 'd1', t: 'n عددی طبیعی است (n ≥ ۱)' }], c: 'سمتِ چپ جمعِ n جمله است' },
      g: { guess: 'همیشه n/(n+1) می‌شود — ثابت شد', test: 'n=11 را حساب می‌کنم و با ۱۱/۱۲ مقایسه می‌کنم' }, plan: 'نخست درستیِ حکم را برای n=1 وارسی می‌کنم، سپس فرض می‌کنم برای n درست است و نشان می‌دهم با افزودنِ جملهٔ ۱/((n+1)(n+2)) برای n+1 هم درست است.', steps: ['n = ۱۱: اگر جمع ۱۱/۱۲ نشود؛ همین حالا حساب می‌کنم'],
      b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'n=11 را حساب کردم: ۱۱/۱۲' }, solved: 'با استقرا ثابت شد' } });
    await turn('یه چیز دیگه: روز اول گفتم «۱۰ تاشو چک کردم» — اشتباه گفتم، ۸ تا بود، نه ۱۰.', 'فرستادم.', RT({ msg: '۱۰ تاشو چک کردم', key: 'datum:تعدادِ نمونه‌های وارسی‌شده', what: 'fact', fix: '۸', old: '۱۰' }));
    await yesAll(); const x = await snap(pid);
    return { ok: !a.stale.length && !x.stale.length && x.b === 'verified' && x.state === 'solved' && !/کهنه/.test(allText(a) + allText(x)), got: { a: st2(a), x: st2(x) } }; });

  // C25-8 + C25-4 s23 p15 (S2): «✏️ «۱⇐۱.۵، ۱۰۰⇐۱۲۰» (شکر و کره) سرانجامِ حدسِ «۱٫۷۵ برابر» (نسبتِ طول‌ها) و داوریِ کفایت را کنار می‌زند»؛ «اندازه‌های قالب و ۲٫۸ «⇐ ۰» از شکر/کره»
  const S23 = 'سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۲ پیمونه آرد، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم، بیا ثبتش کنیم.';
  const s23 = async () => scen({ prior: [{ t: S23, a: CS({ ph: 'u', guess: '۱.۷۵ برابر' }) }, { t: 'مساحت‌ها رو حساب کردم: ۸۷۵ تقسیم بر ۳۱۴ میشه حدود ۲.۸؛ پس ۱.۷۵ برابر غلط بود.', a: CS({ ph: 'c', guess_res: { id: 'g1', res: 'refuted' } }) }],
    live: { u: { one: 'می‌خواهم بدانم مقدارِ هر مادهٔ دستورِ کیک را برای قالبِ ۲۵×۳۵ چند برابر کنم.', u: 'ضریبی که همهٔ مواد را در آن ضرب کنم', dl: [{ id: 'd1', t: 'قالبِ اصلی گرد با قطرِ ۲۰ سانتی‌متر' }, { id: 'd2', t: 'قالبِ من مستطیلِ ۲۵ در ۳۵ سانتی‌متر' }, { id: 'd3', t: 'دستور: ۳ تخم‌مرغ، ۱ پیمانه شکر، ۲ پیمانه آرد، ۱۰۰ گرم کره' }, { id: 'd4', t: 'عمقِ قالب‌ها تقریباً یکی است' }],
        c: 'کیک همان ضخامتِ قبلی را داشته باشد\nنسبتِ مواد به هم عوض نشود', suff: 'کافی', suffW: 'اندازهٔ دو قالب و دستور را دارم', prac: { measure: 'k = (۲۵ سانتی‌متر × ۳۵ سانتی‌متر) ÷ (۲۰ سانتی‌متر × ۲۰ سانتی‌متر) و تخم‌مرغِ تازه = ۳ × k', approx: 'تا نزدیک‌ترین تخم‌مرغِ کامل' } },
      suff: 'کافی', g: { guess: 'ضرب در ۳۵ تقسیم بر ۲۰ یعنی ۱٫۷۵', test: 'یک حالتِ خاص را امتحان می‌کنم' }, plan: 'نخست مساحتِ کفِ دو قالب را حساب می‌کنم (دایرهٔ ۲۰ و مستطیلِ ۲۵×۳۵)، سپس همهٔ مواد دستور را در نسبتِ مساحت‌ها ضرب می‌کنم چون عمق یکی است.',
      steps: ['مساحتِ کفِ قالبِ گرد ≈ ۳۱۴ سانتی‌متر مربع و مستطیل ۸۷۵ سانتی‌متر مربع؛ ضریب ≈ ۲٫۸. مواد را ۲٫۸ برابر می‌کنم (تخم‌مرغ ۸٫۴ ⇒ ۸) و فردا می‌پزم.'] } });
  await T('C25-8/C25-4 s23 ✏️ «۱⇐۱.۵ پیمونه، ۱۰۰⇐۱۲۰ گرم»: the outcome of the guess «۱٫۷۵ برابر» and the sufficiency verdict stay (neither used sugar or butter); no stale list (mould sizes, ۲٫۸, «⇐ ۰»)', async () => {
    const pid = await s23(); const g0 = (await snap(pid)).cg;
    await ev(async (S23) => __edit(__U(1), S23.replace('۱ پیمونه شکر', '۱.۵ پیمونه شکر').replace('۱۰۰ گرم کره', '۱۲۰ گرم کره')), S23); await yesAll(); const x = await snap(pid), tx = allText(x);
    return { ok: g0[0] && g0[0].r === 'refuted' && x.cg[0].r === 'refuted' && x.suff === 'کافی' && !x.stale.length && /۱\.۵ پیمونه شکر/.test(x.st) && !/سرانجامِ حدس|داوریِ «با همین|کهنه|⇐ ۰|⇒ ۰/.test(tx), got: { g0, cg: x.cg, suff: x.suff, s: st2(x), ch: x.ch } }; });
  // همان سناریو، همان‌که درست بود (s23 p11→p12 PASS): «اصلاحِ قالب … «۱٫۷۵ ⇒ ۱٫۵» درست کهنه شد» — نگهبانِ قاعدهٔ پایه: حدس و داوری‌ای که عدد را به کار بردند کنار می‌روند
  await T('C25-8 look-alike s23 «۲۵ در ۳۵ ⇐ ۲۵ در ۳۰»: the guess that used «۳۵» IS set aside and «۱٫۷۵ ⇒ ۱٫۵» is proposed; the sufficiency verdict is re-asked', async () => {
    const pid = await s23();
    await turn('یه اصلاح مهم: روز اول گفتم قالبم ۲۵ در ۳۵ه — اشتباه گفتم، دوباره متر کردم، ۲۵ در ۳۰ه.', 'فرستادم.', RT({ msg: 'قالب من مستطیل ۲۵ در ۳۵ه', key: 'datum:قالب', what: 'fact', fix: '۲۵ در ۳۰', old: '۲۵ در ۳۵' })); await yesAll(); const x = await snap(pid);
    return { ok: x.cg[0].r === '' && has(x, 1.75, 1.5) && x.suff !== 'کافی', got: { cg: x.cg, s: st2(x), suff: x.suff, ch: x.ch } }; });

  // D25-19 s36 c23 (S2): «عددهای حساب‌شده از «۲۰ لیتر»: «۱۰، ۱۵، ۲، ۰٫۱، ۰٫۱۵، ۳» … (۱۰ ⇒ ۲۰، ۱۵ ⇒ ۵، ۰٫۱۵ ⇒ ۰٫۲۵)» — ۱۰٪ و ۱۵٪ داده‌اند؛ فقط «۲ لیتر نمک» واقعاً کهنه است (⇒ ۳)
  await T('D25-19 s36 «۲۰ ⇐ ۳۰ لیتر»: the data percentages (۱۰٪، ۲۵٪، ۱۵٪، ۰٫۱) are never stale or re-proposed; «۲ لیتر نمک» is (⇒ ۳); every proposed value is right', async () => {
    const S36 = '«۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟» من از x بدم میاد، همیشه قاطی می‌کنم کدوم x کدومه. می‌شه بدون x حلش کرد؟';
    const pid = await scen({ prior: [S36], live: { u: { one: 'چند لیتر آب‌نمکِ ۲۵٪ به ۲۰ لیتر آب‌نمکِ ۱۰٪ اضافه کنیم تا ۱۵٪ شود؟', u: 'مقدارِ آب‌نمکِ ۲۵٪', dl: [{ id: 'd1', t: '۲۰ لیتر آب‌نمک ۱۰٪' }, { id: 'd2', t: 'آب‌نمکِ دوم ۲۵٪' }, { id: 'd3', t: 'غلظتِ هدف ۱۵٪' }], c: 'غلظتِ نهایی ۱۵٪ باشد' },
      plan: 'نمکِ هر ظرف را جدا حساب می‌کنم: ۲۰ لیتر با ۱۰٪ یعنی ۲ لیتر نمک؛ جدولِ حدس و آزمون', steps: ['۰٫۱ × ۲۰ = ۲ لیتر نمک در ظرفِ اول', '۵ لیتر: ۲+۱٫۲۵=۳٫۲۵ از ۲۵ ⇒ ۱۳٪؛ ۸ لیتر: ۲+۲=۴ از ۲۶ ⇒ ۰٫۱۵'] } });
    await turn('یه لحظه! صورتِ مسئله رو دوباره از کتاب دیدم: ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر. پس جوابم عوض میشه؟', 'فرستادم.', RT({ msg: '۲۰ لیتر آب‌نمک ۱۰٪ داریم', key: 'datum:حجم', what: 'fact', fix: '۳۰ لیتر', old: '۲۰ لیتر' }));
    await yesAll(); const x = await snap(pid), V = vals(x), RIGHT = { 2: 3, 3.25: 4.25 };
    return { ok: has(x, 2, 3) && !V.some(v => [10, 15, 25, 0.1, 0.15, 5, 8, 1.25].includes(v)) && x.stale.every(z => z.re == null || RIGHT[z.v] === z.re) && !/۱۰ ⇒|۱۵ ⇒|۰٫۱۵ ⇒/.test(allText(x)), got: { s: st2(x), ch: x.ch } }; });

  // D25-18 s38 c23 (S2): «✓ اصلاح شد: نتیجهٔ «a/2 چون یال دیگه بر صفحه عموده … پس ح…» دیگر برقرار نیست — بر «۸ صبح» بنا بود — با «۱۰ صبح» دوباره حساب شود»
  await T('D25-18 s38 «تحویل ساعت ۱۰ صبحه، نه ۸»: the maths result is never «دیگر برقرار نیست — بر «۸ صبح» بنا بود»', async () => {
    const M1 = 'ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. «حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن، بر هم عمودن و هر دو بر پاره‌خط به طول b که وسط‌هاشون رو وصل می‌کنه عمودن». فقط جواب رو بگو، قول می‌دم بعداً یاد بگیرم.';
    const RS = 'آها! صفحه‌ای که از یال a و پاره‌خط b میگذره چهاروجهی رو دو تا چهاروجهی می‌کنه؛ قاعدهٔ هر کدوم مثلثیه با قاعدهٔ a و ارتفاع b، مساحتش ab/2، و ارتفاع هر کدوم a/2 چون یال دیگه بر صفحه عموده. پس حجم = ۲ × (۱/۳ × ab/2 × a/2) = a²b/6!';
    await scen({ prior: [M1, RES(RS)] });
    await turn('راستی اولش هم اشتباه گفتم: تحویل ساعت ۱۰ صبحه، نه ۸. حالا برم بخوابم.', 'فرستادم.', RT({ msg: 'فردا ۸ صبح باید تحویل بدم', key: 'datum:ساعتِ تحویل', what: 'fact', fix: '۱۰ صبح', old: '۸ صبح' }));
    const x = await snap(''); return { ok: x.ev.length >= 1 && x.ev.every(e => !e.stale) && !/دیگر برقرار نیست|بنا بود/.test(allText(x)), got: { ev: x.ev, ch: x.ch, sys: x.sys } }; });

  // B25·D10 s19 c81 (S2): «goal «۸» kg marked «عددهای حساب‌شده از «۱۶ هفته»: «۸، ۲» — کهنه … (۸ ⇒ ۱۰)» and result «۷۴٫۵ بود نه ۷۴. پس ۳٫۵ کیلو کم کردم نه ۴» set aside («بر «۱۶ هفته» بنا بود»)»
  await T('B25·D10 s19 «۱۸ هفته … نه ۱۶»: her GOAL «۸ کیلو» is never stale («۸ ⇒ ۱۰»); her weigh-in result is not set aside', async () => {
    const S19 = '۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم. این بار یه برنامه‌ی دقیق می‌خوام.';
    const pid = await scen({ prior: [S19, RES('هفته‌ی هشتم! ۴ کیلو کم کردم. وزنم هر دو هفته: ۷۸، ۷۷٫۲، ۷۶٫۵، ۷۵٫۱، ۷۴. پیاده‌روی رو نگه داشتم، دو هفته یه بار وزن کردم، دیگه برنامه عوض نکردم.'), RES('ببخشید، وزن آخر رو اشتباه نوشتم: ۷۴٫۵ بود نه ۷۴. پس ۳٫۵ کیلو کم کردم نه ۴.')],
      live: { u: { one: 'می‌خواهم تا عروسی ۸ کیلو کم کنم، با ۱۶ هفته وقت، به شرطِ این‌که هفتهٔ دوم ول نکنم', u: 'برنامه‌ای هفته‌به‌هفته', dl: [{ id: 'd1', t: '۱۶ هفته وقت تا عروسی' }, { id: 'd2', t: 'سه بار هفتهٔ دوم ول کردم' }], c: '۸ کیلو تا روزِ عروسی', nat: 'life' },
        plan: 'هر ۲ هفته یک بار وزن می‌کنم؛ هدف ۸ کیلو', steps: ['هفته‌ای ۳ بار پیاده‌روی، ۴۰ دقیقه'] } });
    await turn('یه چیز از همون روزِ اول رو درست کنم: اون موقع اشتباه حساب کرده بودم — از اون روز ۱۸ هفته تا عروسی بود نه ۱۶؛ عروسی ۱۵ اسفنده.', 'فرستادم.', RT({ msg: '۱۶ هفته تا عروسی برادرم مونده', key: 'deadline:d1', what: 'fact', fix: 'عروسی ۱۵ اسفنده', old: '۱۶ هفته' }));
    await yesAll(); const x = await snap(pid);
    const wi = x.ev.filter(e => /۷۴٫۵ بود نه ۷۴/.test(e.span || ''));
    return { ok: /۱۸ هفته/.test(x.st) && !x.stale.length && wi.length === 1 && !wi[0].stale && !/۸ ⇒|کهنه پس از اصلاح|«ببخشید، وزن آخر[^»]*» دیگر برقرار نیست/.test(allText(x)), got: { s: st2(x), ev: x.ev, ch: x.ch } }; });

  // C11 (روشن‌سازیِ DECISIONS_R25): هر مقدارِ پیشنهادیِ کارت حسابِ خودِ صفحه است؛ وگرنه می‌پرسد
  await T('C11 the card proposes a value only from an identified relation; otherwise it asks «این عدد از … حساب شده بود؟» and proposes nothing', async () => {
    const M = 'برای مهمونی ۱۲ نفر میان. خرید کردم و جمعاً ۴۲ تا نون گرفتم؛ هر نفر ۳ تا میوه، یعنی ۳۶ تا میوه.';
    const pid = await scen({ prior: [M], live: { u: { one: 'خریدِ مهمانی', dl: [{ id: 'd1', t: '۱۲ نفر' }] }, steps: ['هر نفر ۳ تا میوه، یعنی ۳۶ تا میوه', 'نون: ۱۲ نفر و ۳۰ تا اضافه، پس ۴۲ تا'] } });
    await turn('۱۲ نفر نیستن، ۱۴ نفرن.', 'فرستادم.', RT({ msg: '۱۲ نفر میان', key: 'datum:مهمان', what: 'fact', fix: '۱۴ نفر', old: '۱۲ نفر' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 36, 42) && x.stale.every(z => z.re == null || (z.v === 36 && z.re === 42) || (z.v === 42 && z.re === 44)) && /درست است؟|حساب شده بود؟/.test(x.card), got: { s: st2(x), card: x.card } }; });

  /* ================= (۲) بانکِ مستقل VARIANTS_R25 — هر ورودیِ P4 ================= */
  const bank = BANKF && fs.existsSync(BANKF) ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : null;
  info.bank.file = BANKF || '(missing)';
  if (!bank) errors.push('bank: VARIANTS_R25 not found (tests/variants/VARIANTS_R25.json)');
  else {
    const P4 = bank.filter((e) => /^P4\b/.test(String(e.rc || e.mech || '')));
    info.bank.n = bank.length; info.bank.p4 = P4.length;
    const BH = require('./tour1_r25_correction_bank.js');
    const out = await BH.run({ p, ev, turn, bank, P4, H });
    Object.assign(info.bank, out.summary); Object.assign(info.nc, out.nc);
    out.fail.forEach(f => errors.push('bank ' + f));
  }

  console.log(J({ runners: info.runners, bank: info.bank, nc: info.nc }, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
