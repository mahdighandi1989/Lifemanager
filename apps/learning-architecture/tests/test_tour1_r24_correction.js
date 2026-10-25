// تورِ پولیا (دستهٔ ۱، دورِ ۲۴، ۲۰۲۶-۱۰-۲۵) — DECISIONS_R24، سازوکارِ R3 «CORRECTIONS SPREAD AND NUMBER BOUNDARIES» (fixer «correction»: a38/a27 برگرداندن و نسخه‌ها).
//  دو منبعِ شاهد، هر دو قرمز پیش از اصلاح:
//   (۱) جمله‌های خودِ دونده‌ها (round24{A,B,C,D}: C24-12، B24·D5، A24-3، A22-17، C24-11، B24·D17/C23-5/D23-5، A24-9/B24·D16/C24-6) با متن‌های واقعیِ همان نوبت‌ها و گزارشِ retract ِ همان مدل؛
//   (۲) بانکِ مستقلِ VARIANTS_R24 (tests/variants/VARIANTS_R24.json = tour1_polya/VARIANTS_R24.json؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودیِ R3 یک بررسی (tour1_r24_correction_bank.js).
//  هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست (همه از امروزِ صفحه حساب می‌شوند).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R24.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R24.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || '';

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

  /* ================= (۱) جمله‌های دونده‌ها ================= */
  // C24-12 s23 p15 (S2): «✏️ دو جفت («۱ ⇐ ۱.۵»، «۱۰۰ ⇐ ۱۲۰»): صورت ✓ ولی حدس خراب شد و خلاصه فقط یک جفت را نام برد» — «حدس: «۱.۵.۷۵» (اصلاح شد ⇐ «۱.۷۵»)» سپس {"rec":"حدس","old":"۱.۵.۷۵ برابر","new":"۱۲۰"}
  const S23 = 'سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۲ پیمونه آرد، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم، بیا ثبتش کنیم.';
  await T('C24-12 s23 ✏️ «۱⇐۱.۵، ۱۰۰⇐۱۲۰»: the guess «۱.۷۵ برابر» is never touched (no «۱.۵.۷۵», no «۱۲۰»); both pairs named once; why has real quotes', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn(S23, 'ثبتش می‌کنیم.', [cs({ ph: 'u', guess: '۱.۷۵ برابر' })]);
    const pid = await ev((S23) => { const s = __cur(); const pid = __live('کیکِ مادرم در قالبِ ۲۵×۳۵', S23, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.g = { 1: { guess: 'ضرب در ۳۵ تقسیم بر ۲۰ یعنی ۱٫۷۵', at: new Date().toISOString(), from: 'live' } }; }); return pid; }, S23);
    await turn('کیک رو پختم و خوب شد! ولی زمان پختو نمی‌دونستم، دستور مادرم ۴۰ دقیقه بود. زمان پخت هم ۲.۸ برابر میشه؟ یعنی ۱۰۰ دقیقه؟', 'نه لزوماً.');
    await turn('یعنی اشتباه کردم که اول گفتم ۱.۷۵ برابر؟', 'مساحت را ببین.');
    await ev(async (S23) => __edit(__U(1), S23.replace('۱ پیمونه شکر', '۱.۵ پیمونه شکر').replace('۱۰۰ گرم کره', '۱۲۰ گرم کره')), S23);
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, pg: APP.S.get('eprog_' + pid).solve.g[1].guess, cg: ((__cur().coach || {}).guesses || []).map(g => g.text), r: __ret() }), pid);
    const all = J(x.r), lines = x.r.ch.join(' ¦ ');
    return { ok: /۱\.۵ پیمونه شکر/.test(x.st) && /۱۲۰ گرم کره/.test(x.st) && x.pg === 'ضرب در ۳۵ تقسیم بر ۲۰ یعنی ۱٫۷۵' && x.cg.length === 1 && x.cg[0] === '۱.۷۵ برابر' && !/۱\.۵\.۷۵|"rec":"حدس"/.test(all)
      && /۱\.۵/.test(lines) && /۱۲۰/.test(lines) && /۱\.۵/.test(x.r.fix) && /۱۲۰/.test(x.r.fix) && !(x.r.res.changed || []).some(c => EMPTYQ.test(c.why || '')), got: x }; });

  // B24·D5 s19 c81 (S2): «the copy ask offers «فهمِ مسئله — کل در یک جمله» and «دادهٔ ۱» with «۱۶» ⇐ «۱۵» (16 WEEKS would become 15 — the day of the month); «بله» would corrupt both. The chat-statement record is «می‌خوام.» ⇒ «می‌خوام (اصلاحِ خودم: عروسی ۱۵ اسفنده).»»
  await T('B24·D5 s19 «۱۸ هفته … نه ۱۶؛ عروسی ۱۵ اسفنده»: weeks follow «۱۸ هفته»; «۱۵» is never offered for «۱۶ هفته»; the chat statement is not garbled', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم. این بار یه برنامه‌ی دقیق می‌خوام.', 'خب.');
    const pid = await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.stmt = 'می‌خوام.'; APP.S.put(s);
      const pid = __live('۸ کیلو تا عروسیِ برادرم', '۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم. این بار یه برنامه‌ی دقیق می‌خوام.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'می‌خواهم تا عروسی ۸ کیلو کم کنم، با ۱۶ هفته وقت، به شرطِ این‌که هفتهٔ دوم ول نکنم', u: 'برنامه‌ای هفته‌به‌هفته', dl: [{ id: 'd1', t: '۱۶ هفته وقت تا عروسی' }, { id: 'd2', t: 'سه بار هفتهٔ دوم ول کردم' }], c: '۸ کیلو تا روزِ عروسی', type: 'find', nat: 'life', from: 'live' } }; }); return pid; });
    await turn('یه چیز از همون روزِ اول رو درست کنم: اون موقع اشتباه حساب کرده بودم — از اون روز ۱۸ هفته تا عروسی بود نه ۱۶؛ عروسی ۱۵ اسفنده.', 'فرستادم.', RT({ msg: '۱۶ هفته تا عروسی برادرم مونده', key: 'deadline:d1', what: 'fact', fix: 'عروسی ۱۵ اسفنده', old: '۱۶ هفته' }));
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, cst: (__cur().coach || {}).stmt || '', q: __asks().filter(a => a.state === 'open'), sys: __sys(1) }), pid);
    const bad = x.q.filter(a => /۱۵ هفته|با ۱۵ هفته/.test(a.new) || (/۱۶/.test(a.old) && /(^|[^۰-۹])۱۵([^۰-۹]|$)/.test(a.new) && !/اسفند/.test(a.old)));
    const d1 = x.q.filter(a => a.path === 'dl:d1')[0], one = x.q.filter(a => a.path === 'u.one')[0];
    return { ok: !bad.length && !/اصلاحِ خودم/.test(x.cst) && x.cst === 'می‌خوام.' && /۱۸ هفته تا عروسی/.test(x.st) && (!d1 || d1.new === '۱۸ هفته وقت تا عروسی') && (!one || /با ۱۸ هفته وقت/.test(one.new)) && !/«۱۶» ⇐ «۱۵»/.test(x.sys.join(' ')), got: x }; });

  // A24-3 s02 p10 (S2، پسرفت): «اصلاحِ «۱۶۰ سانت نبود، ۱۵۰ سانته» صورت را «… ۱.۸ عرض، ۱۵۰ ارتفاع داره» کرد — واحد افتاد (دورِ ۲۳: «۱۵۰ سانت ارتفاع»). دادهٔ فرم درست «۱.۵ متر» شد.»
  await T('A24-3 s02 «۱۶۰ سانت نبود، ۱۵۰ سانته»: the statement keeps the unit («۱۵۰ سانت ارتفاع»); her typed row asked «۱.۵ متر»; why quotes her words', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟ زود بگو مشتری منتظره.', 'کل را بگو.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('لولهٔ ۴ متری در بارِ وانت', 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'لوله در بار جا می‌شود؟', u: 'بله یا نه', dl: [{ id: 'd1', t: 'لوله ۴ متر' }, { id: 'd2', t: 'طول بار ۳.۲ متر، عرض ۱.۸ متر' }, { id: 'd3', t: 'ارتفاع بار ۱.۶ متر' }], c: 'لوله صاف است', type: 'find', nat: 'practical', from: 'page' } }; }); return pid; });
    await turn('یه اصلاح دربارهٔ همون لوله: اولش گفتم ارتفاعِ بار ۱.۶ـه؛ امروز دوباره با متر اندازه گرفتم — ۱۶۰ سانت نبود، ۱۵۰ سانته.', 'فرستادم.', RT({ msg: '۱.۶ ارتفاع داره', key: 'datum:ارتفاع بار', what: 'fact', fix: '۱۵۰ سانت', old: '۱.۶' }));
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, q: __asks(), r: __ret() }), pid), d3 = x.q.filter(a => a.path === 'dl:d3')[0];
    return { ok: /۱\.۸ عرض، ۱۵۰ سانت ارتفاع/.test(x.st) && !!d3 && /^ارتفاع بار ۱[.٫]۵ متر$/.test(d3.new) && (x.r.res.changed || []).every(c => !EMPTYQ.test(c.why || '')) && (x.r.res.changed || []).some(c => /۱۶۰ سانت نبود/.test(c.why || '')), got: x }; });

  // A22-17 s07 p7 (S2): «ردیفِ فرمِ «داده: ۸ ساعت ⇒ ۱۶ سانت» نه عوض شد نه پرسیده شد («ask»:[])»؛ A23-24 (S3): «تغییرهای نمودار سه بار در سطرِ نتیجه»؛ A24-9 (S3): «why: «[اصلاحِ پیامِ قبلی] «» ⇐ «» ، «» ⇐ «» — متنِ درستِ پیامم: «» .»»
  const S07 = '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.';
  await T('A22-17/A23-24/A24-9 s07 ✏️ «۹⇒۸، ۱۶⇒۱۵»: the coach result carries the page asks for her rows (ask not empty); no change line twice; why never «»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn(S07, 'ثابتش کن یا ردش کن.');
    await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.stmt = s.msgs.filter(m => m.role === 'user')[0].text; APP.S.put(s);
      const pid = __live('نور و رشدِ لوبیا', '۵ گلدان لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور؛ قد پس از ۳ هفته ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونِ رابطهٔ نور و قد چیست؟'); APP.liveBindSession(pid, s);
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'رابطهٔ نور و قد', u: 'رابطهٔ قدِ لوبیا با ساعتِ نور', dl: [{ id: 'd1', t: '۲ ساعت ⇒ ۴ سانت' }, { id: 'd2', t: '۴ ساعت ⇒ ۹ سانت' }, { id: 'd3', t: '۶ ساعت ⇒ ۱۳ سانت' }, { id: 'd4', t: '۸ ساعت ⇒ ۱۶ سانت' }, { id: 'd5', t: '۱۰ ساعت ⇒ ۱۷ سانت' }], c: 'همهٔ گلدان‌ها ۳ هفته', type: 'find', nat: 'practical', from: 'live' } }; }); });
    await ev(async (S07) => __edit(__U(1), S07.replace('۴، ۹، ۱۳، ۱۶، ۱۷', '۴، ۸، ۱۳، ۱۵، ۱۷')), S07);
    const x = await ev(() => ({ q: __asks(), r: __ret(), sys: __sys(2) }));
    const ask = (x.r.res && x.r.res.ask) || [], lines = x.r.ch, dup = lines.filter((l, i) => lines.indexOf(l) !== i);
    const recs = ((x.r.res && x.r.res.changed) || []).map(c => c.rec + '|' + c.new), dupR = recs.filter((l, i) => recs.indexOf(l) !== i);
    return { ok: ask.some(a => /۸ ساعت ⇒ ۱۵ سانت/.test(a.new)) && ask.some(a => /۴ ساعت ⇒ ۸ سانت/.test(a.new)) && !dup.length && !dupR.length && !((x.r.res && x.r.res.changed) || []).some(c => EMPTYQ.test(c.why || '')), got: x }; });

  // A24-9 s04 p7 (S3): «why: «یه اصلاح: تو پیامِ داده‌ها گفتم «» — اشتباه گفتم…»» — نقلِ خودش با گیومه‌هایش
  await T('A24-9 s04 a chat correction that quotes her words: the why keeps the quoted words', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('باغچه‌م مستطیله، ۶ متر در ۴ متر. می‌خوام دورش نرده بکشم؛ چند متر نرده لازمه؟', 'کل را بگو.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('نردهٔ باغچه', 'باغچه‌م مستطیله، ۶ متر در ۴ متر. می‌خوام دورش نرده بکشم؛ چند متر نرده لازمه؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id)); return pid; });
    await turn('یه اصلاح: تو پیامِ داده‌ها گفتم «۶ متر در ۴ متر» — اشتباه گفتم، ۷ متر در ۴ متره.', 'فرستادم.', RT({ msg: '۶ متر در ۴ متر', key: 'datum:ابعاد', what: 'fact', fix: '۷ متر در ۴ متر', old: '۶ متر' }));
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, r: __ret() }), pid), ch = (x.r.res && x.r.res.changed) || [];
    return { ok: /مستطیله، ۷ متر در ۴ متر\. می‌خوام/.test(x.st) && ch.length > 0 && ch.every(c => !EMPTYQ.test(c.why || '')) && ch.some(c => /«۶ متر در ۴ متر»/.test(c.why || '')), got: x }; });

  // B24·D16 s18 (S3): «arrows point opposite ways (statement «new (اصلاح شد ⇐ old)», lesson «old ⇐ new»)» — همان سازنده‌های سطر (درس چندتکه، صورت تک‌تکه، یادداشتِ صفحه)
  await T('B24·D16 s18 every change line reads «new (اصلاح شد ⇐ old)»: a multi-part lesson, a one-part statement, the page note', async () => {
    const x = await ev(() => ({ les: APP.ASSIST.chLine20('درسِ بازنگریِ «قیفِ مخروطی»', 'اول مجهول رو با کلمه‌های دیگه بگم بعد جایگذاری کنم', 'قبل از جایگذاری، مجهول رو به زبون نرخ بگم بعد جایگذاری کنم'),
      st: APP.ASSIST.chLine20('صورتِ مسئله', 'قیفی با شعاعِ ثابت ۵ سانتی‌متر و ارتفاعِ ۱۰', 'قیفی با شعاعِ ثابت ۶ سانتی‌متر و ارتفاعِ ۱۰'),
      note: APP.liveRetractShape({ ok: true, changed: [{ kind: 'stmt', label: 'صورتِ مسئله', old: 'شعاعِ ۵', new: 'شعاعِ ۶' }], ask: [] }).note }));
    const ok1 = (l) => !REVERSED.test(l) && /\(اصلاح شد ⇐ «/.test(l);
    return { ok: ok1(x.les) && ok1(x.st) && !/«[^»]*» ⇐ «/.test(x.note.replace(/\(اصلاح شد ⇐ «[^»]*»\)/g, '')), got: x }; });

  // B24·D16 s11 (S3): «s11 ask list names «صورتِ مسئله» twice»؛ B24·D17 (S3): «After «بله» the derived numbers stay stale and unmarked: s11 «صفحهٔ ۸×۸ (۱۰۰ خانه)», «۹۸ خانه», «۴۹ دومینو», plan «(۵۰ و ۴۸)», step «(۱۰,۱۰) … 10^2 = 100»»
  await T('B24·D16/B24·D17 s11 «۸×۸ نه ۱۰×۱۰»: no label twice in the ask line; after «بله» the numbers computed from «۱۰×۱۰» are marked «کهنه پس از اصلاح» (۱۰۰⇒۶۴، ۹۸⇒۶۲، ۴۹⇒۳۱)', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌ی backtracking نوشتم، یه ساعته داره می‌چرخه. کجای کدم اشتباهه؟', 'کل را بگو.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('دومینو روی صفحهٔ ۱۰×۱۰ بی دو گوشهٔ مقابل', 'یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم.'); APP.liveBindSession(pid, s);
      __set(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'صفحهٔ ۱۰×۱۰ ِ بی دو گوشهٔ مقابل را می‌شود با دومینو پوشاند؟', u: 'ممکن است؟', dl: [{ id: 'd1', t: 'صفحهٔ ۱۰×۱۰ (۱۰۰ خانه)' }, { id: 'd2', t: 'دو گوشهٔ مقابل برداشته شده ⇒ ۹۸ خانه' }, { id: 'd3', t: 'هر دومینو ۲ خانه ⇒ ۴۹ دومینو' }], c: '', type: 'prove', nat: 'objective', from: 'page' } };
        L.plan = { t: 'خانه‌ها را سیاه و سفید بشمارم (۵۰ و ۴۸) و ببینم هر دومینو یک سیاه و یک سفید می‌پوشاند', at: new Date().toISOString() };
        L.steps.push({ id: 'st1', at: new Date().toISOString(), text: 'رنگ‌آمیزی: خانهٔ (۱۰,۱۰) سیاه است؛ 10^2 = 100 خانه', pred: 'نابرابر می‌شوند', due: APP.today() }); }); return pid; });
    await turn('یه اصلاح: تو پیام اولم گفتم صفحه ۱۰×۱۰؛ الان صورتِ اصلیِ معما رو دیدم، صفحه ۸×۸ بود، همون صفحه‌ی شطرنج. بقیه‌ش همونه.', 'فرستادم.', RT({ msg: 'یه صفحه ۱۰×۱۰', key: 'datum:اندازهٔ صفحه', what: 'fact', fix: '۸×۸' }));
    const sys = await ev(() => __sys(1)), q = await ev(() => __asks().filter(a => a.state === 'open'));
    for (const a of q) await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), a.id);
    const x = await ev(async (pid) => { APP.go('lprob', pid); await new Promise(z => setTimeout(z, 300)); const card = document.querySelector('#main .lp-stale');
      return { st: APP.liveStale ? APP.liveStale(pid) : null, dl: APP.S.get('eprog_' + pid).solve.u[1].dl.map(d => d.t), card: card ? card.innerText : '' }; }, pid);
    const labs = (String(sys[0] || '').split('برای ')[1] || '').match(/«[^«»]+»(?= \()/g) || [], dupL = labs.filter((l, i) => labs.indexOf(l) !== i);
    const st = (x.st || []).map(s0 => s0.v + '>' + (s0.re == null ? '' : s0.re)).join(' ');
    return { ok: !dupL.length && /100>64/.test(st) && /98>62/.test(st) && /49>31/.test(st) && /50/.test(st) && /48/.test(st) && /کهنه پس از اصلاح/.test(x.card) && /۶۴/.test(x.card) && /۶۲/.test(x.card), got: { sys, labs, x, st } }; });

  // D23-5 s37 p10 (S2، بدتر): «✏️ «۴⇒۵» … باز هم «این‌جا هم عوض شود؟» برای «بخش‌پذیری بر ۴» در طرح، و حالا گامِ ۱ هم «بر ۵ … بر ۵ بخش‌پذیر» پیشنهاد می‌شود (نقشِ عدد: مقسوم‌علیه ≠ رقم)»
  await T('D23-5 s37 ✏️ «رقم اول ۴ → ۴۴۵۷۶» ⇒ «۵ → ۵۴۵۷۶»: the divisor «بر ۴» in her plan and step 1 is never asked', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال» — رقم اول و آخر محو شده. قیمت هر گوسفند چقدر بوده؟', 'خب.');
    await ev(() => { const s = __cur(); const pid = __live('قیمت گوسفند در دفتر کاروانسرا', 'تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال» — رقم اول و آخر محو شده. قیمت هر گوسفند چقدر بوده؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { L.plan = { t: 'نخست با بخش‌پذیری بر ۴ رقم آخر رو پیدا می‌کنم، سپس با بخش‌پذیری بر ۹ رقم اول رو.', at: new Date().toISOString() };
        L.steps.push({ id: 'st1', at: new Date().toISOString(), text: 'بر ۴: دو رقم آخر ۷y باید بر ۴ بخش‌پذیر باشه ⇒ ۷۲ یا ۷۶ ⇒ رقم آخر ۲ یا ۶', pred: 'دو حالت', due: APP.today() }); }); });
    await turn('با ۵: بر ۴ همون ۷۲ یا ۷۶. بر ۹: با ۲ جمع ۴+۵+۷+۲=۱۸ پس رقم اول ۹ → ۹۴۵۷۲. با ۶: رقم اول ۴ → ۴۴۵۷۶.', 'وارسی کن.');
    await ev(async () => __edit(__U(2), 'با ۵: بر ۴ همون ۷۲ یا ۷۶. بر ۹: با ۲ جمع ۴+۵+۷+۲=۱۸ پس رقم اول ۹ → ۹۴۵۷۲. با ۶: رقم اول ۵ → ۵۴۵۷۶.'));
    const q = await ev(() => __asks());
    return { ok: !q.some(a => a.path === 'plan' || /^step|^stepPlan|st1/.test(a.path) || /بر ۵/.test(a.new)), got: q }; });

  // C24-11 oC1 p10 (S2): «اصلاحِ «۱۵ ⇐ ۱۲» به پیش‌نویس‌های فرم و مقصدِ نقشه نرسید» — «مقصد هنوز نوشته «با ۱۵ ساعت در هفته…» و فرمِ فهم هم «از گفت‌وگو: … ۱۵ ساعت» رو می‌پرسه»
  await T('C24-11 oC1 «۱۵ ⇐ ۱۲ ساعت»: the «از گفت‌وگو» drafts (from another message) and the 🧭 destination show ۱۲; the old value stays as history', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('سلام. یه مسئلهٔ واقعی دارم: سه تا پروژه دارم — یه کتاب، یه اپ، یه دورهٔ آموزشی — و هفته‌ای ۱۵ ساعت وقتِ آزاد. نمی‌دونم ترتیبشون چی باشه و ساعت‌ها رو چطوری تقسیم کنم.', 'کل را در یک جمله؟');
    await turn('یه جمله؟ «با ۱۵ ساعت در هفته، کدوم پروژه اول و با چه سهمی، که شش ماه دیگه دست‌کم یکیش واقعاً تموم شده باشه.»', 'خوب.');
    const pid = await ev(() => { const s = __cur(), m2 = __U(2); const pid = __live('سه پروژه و ۱۵ ساعت', 'سه تا پروژه دارم — یه کتاب، یه اپ، یه دورهٔ آموزشی — و هفته‌ای ۱۵ ساعت وقتِ آزاد. نمی‌دونم ترتیبشون چی باشه و ساعت‌ها رو چطوری تقسیم کنم.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      const t = 'با ۱۵ ساعت در هفته، کدوم پروژه اول و با چه سهمی، که شش ماه دیگه دست‌کم یکیش واقعاً تموم شده باشه.', at = new Date().toISOString(), mid = APP.liveMsgId(m2);
      __set(pid, (so, L) => { L.uDraft = { type: 'find', nat: '', one: t, why: '', u: t, dl: [{ id: 'd1', t: 'هفته‌ای ۱۵ ساعت وقتِ آزاد', chat: { t: 'هفته‌ای ۱۵ ساعت وقتِ آزاد', at, mid: APP.liveMsgId(__U(1)), st: 'ask' } }], c: '', chat: { one: { t, at, mid, st: 'ask' }, u: { t, at, mid, st: 'ask' } }, src: { one: APP.liveMkSrc(s.id, m2, 'stmt', t), u: APP.liveMkSrc(s.id, m2, 'unknown', t) } }; }); return pid; });
    const d0 = await ev((pid) => APP.STORY.dest({ pid }), pid);
    await turn('حدود ۱۲۰ ساعت مونده، پس بسه. ولی صبر کن، یه اصلاح: اول گفتم «هفته‌ای ۱۵ ساعت وقتِ آزاد» — اشتباه گفتم، واقعیش ۱۲ ساعته.', 'فرستادم.', RT({ msg: 'هفته‌ای ۱۵ ساعت وقتِ آزاد', key: 'datum:ساعتِ آزادِ هفتگی', what: 'fact', fix: '۱۲', old: '۱۵' }));
    const x = await ev((pid) => { const L = APP.S.get('eprog_' + pid).solve.live, d = L.uDraft; return { dest: APP.STORY.dest({ pid }), one: d.one, u: d.u, cu: d.chat.u.t, dl: d.dl[0].t, dlc: d.dl[0].chat.t, hist: JSON.stringify(d.fixHist || []) + JSON.stringify(d.dl[0].fixHist || []) }; }, pid);
    return { ok: /۱۵ ساعت/.test(d0) && /۱۲ ساعت/.test(x.dest) && /۱۲ ساعت/.test(x.u) && /۱۲ ساعت/.test(x.cu) && /۱۲ ساعت/.test(x.one) && /۱۲ ساعت/.test(x.dl) && /۱۲ ساعت/.test(x.dlc) && /۱۵ ساعت/.test(x.hist), got: { d0, x } }; });

  // C23-5 s25 p12 (S3): ««۱۰ ⇐ ۸»: «✅ اثبات شد» و «حل شد» کنار رفتند» — وارسیِ او «n=11 را حساب کردم: ۱۱/۱۲» و حکمِ کلیِ اعلام‌شده هیچ‌کدام «۱۰ تا چک کردم» را به کار نبردند
  await T('C23-5 s25 «۱۰ تاشو چک کردم ⇐ ۸» (check «n=11 را حساب کردم: ۱۱/۱۲»): the proof verdict and «حل شد» stay; the statement follows', async () => { await ev(() => { __wipe(); __fresh(); });
    const M = 'امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم. درسته دیگه؟ ثابت شد.';
    await turn(M, 'برهانش؟');
    const pid = await ev((M) => { const s = __cur(); const pid = __live('جمعِ ۱/۲ + ۱/۶ + ۱/۱۲ + …', M, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'می‌خواهم ثابت کنم جمعِ ۱/(k(k+1)) از k=1 تا n همیشه n/(n+1) است.', u: 'برای هر عددِ طبیعیِ n: ۱/(1·2) + ۱/(2·3) + … + ۱/(n(n+1)) = n/(n+1)', dl: [], c: 'سمتِ چپ جمعِ n جمله است\nسمتِ راست n/(n+1) است', type: 'prove', nat: 'objective', from: 'page' } };
        so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'n=11 را حساب کردم: ۱۱/۱۲' } }; L.state = 'solved'; }); return pid; }, M);
    await turn('یه چیز دیگه: روز اول گفتم «۱۰ تاشو چک کردم» — اشتباه گفتم، ۸ تا بود، نه ۱۰.', 'فرستادم.', RT({ msg: '۱۰ تاشو چک کردم', key: 'datum:تعدادِ نمونه‌های وارسی‌شده', what: 'fact', fix: '۸', old: '۱۰' }));
    const x = await ev((pid) => { const so = APP.S.get('eprog_' + pid).solve; return { st: APP.S.get('eprob_' + pid).p.statement, v: so.b[1].verdict, state: so.live.state, uses: so.b[1].uses }; }, pid);
    return { ok: /۸ تاشو چک کردم/.test(x.st) && x.v === 'verified' && x.state === 'solved', got: x }; });

  // نگهبانِ همین سازوکار (نه نقلِ دونده): روزِ ماه یک مقدار با نامِ ماهش است — نسخه هرگز «۲ مهر» نمی‌شود
  await T('R3 day-of-month role: «۳۰ مهر» ⇐ «۲ آبان» copies the month with the day; «۳۰ کیلو» untouched', async () => {
    const x = await ev(() => { const D = { o: '۳۰ مهر', n: '۲ آبان' }; return { a: APP.liveNumCopy('تحویلِ گزارش ۳۰ مهر', D, 'گزارش رو ۳۰ مهر باید تحویل بدم', 'گزارش رو ۳۰ مهر باید تحویل بدم'), k: APP.liveNumCopy('۳۰ کیلو بار', D, 'گزارش رو ۳۰ مهر باید تحویل بدم', 'گزارش رو ۳۰ مهر باید تحویل بدم') }; });
    return { ok: x.a === 'تحویلِ گزارش ۲ آبان' && x.k == null, got: x }; });

  /* ================= (۲) بانکِ مستقل VARIANTS_R24 — هر ورودیِ R3 ================= */
  const bank = BANKF && fs.existsSync(BANKF) ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : null;
  info.bank.file = BANKF || '(missing)';
  if (!bank) errors.push('bank: VARIANTS_R24 not found (tests/variants/VARIANTS_R24.json)');
  else if (!process.env.NOBANK) {
    const R3 = bank.filter((e) => /^R3\b/.test(String(e.rc || e.mech || '')));
    info.bank.n = bank.length; info.bank.r3 = R3.length;
    const BH = require('./tour1_r24_correction_bank.js');
    const out = await BH.run({ p, ev, turn, blockOf, head, bank, R3 });
    Object.assign(info.bank, out.summary); Object.assign(info.nc, out.nc);
    out.fail.forEach(f => errors.push('bank ' + f));
  }

  console.log(J({ runners: info.runners, bank: info.bank, nc: info.nc }, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
