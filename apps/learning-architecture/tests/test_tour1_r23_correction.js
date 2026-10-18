// تورِ پولیا (دستهٔ ۱، دورِ ۲۳، ۲۰۲۶-۱۰-۱۹) — DECISIONS_R23، سازوکارِ Q4 «CORRECTIONS» (fixer «correction»: a38/a40/a27 برگرداندن و نسخه‌ها).
//  دو منبعِ شاهد، هر دو قرمز پیش از اصلاح:
//   (۱) جمله‌های خودِ دونده‌ها (round23{A,B,C,D}: A23-21/30، B·D3/D4/D19، C23-4/5/16/22، D23-3/4/5/6/7/8/9/12) با متن‌های واقعیِ همان نوبت‌ها و گزارشِ retract ِ همان مدل؛
//   (۲) بانکِ مستقلِ VARIANTS_R23 (tests/variants/VARIANTS_R23.json = tour1_polya/VARIANTS_R23.json؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودیِ Q4 یک بررسی؛
//       ورودیِ سازوکارهای دیگر این آزمون را قرمز نمی‌کند (not covered با دلیل).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R23.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R23.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || '';

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
  });
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || null]);
  const ev = (f, a) => p.evaluate(f, a);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const RT = (o) => [cs({ retract: o })];
  const GARBLE = /عروسی ۱۵ اسفنده برادرم|۱\.۵\.۵|یه تا اسکیس|«۲۵» ⇐ «۳»|«۳» ⇐ «۲۵»/;
  const res = {};
  const T = async (name, fn) => { let r; try { r = await fn(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; } res[name] = !!r.ok; info.runners[name] = !!r.ok; if (!r.ok) errors.push(name + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1200)); return r.ok; };

  /* ================= (۱) جمله‌های دونده‌ها ================= */
  // A23-21 s02 (S2، پسرفت): «دادهٔ فرمِ خودش «ارتفاع بار ۱.۶ متر (c)» نه عوض شد و نه «این‌جا هم عوض شود؟» پرسید»
  await T('A23-21 s02 «۱۶۰ سانت نبود، ۱۵۰ سانته»: her typed row «ارتفاع بار ۱.۶ متر» is asked with «۱.۵ متر»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟ زود بگو مشتری منتظره.', 'کل را بگو.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('لولهٔ ۴ متری در بارِ وانت', 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'لوله در بار جا می‌شود؟', u: 'بله یا نه', dl: [{ id: 'd1', t: 'لوله ۴ متر' }, { id: 'd2', t: 'طول بار ۳.۲ متر، عرض ۱.۸ متر' }, { id: 'd3', t: 'ارتفاع بار ۱.۶ متر' }], c: 'لوله صاف است', type: 'find', nat: 'practical', from: 'page' } }; }); return pid; });
    await turn('یه اصلاح دربارهٔ همون لوله: اولش گفتم ارتفاعِ بار ۱.۶ـه؛ امروز دوباره با متر اندازه گرفتم — ۱۶۰ سانت نبود، ۱۵۰ سانته.', 'فرستادم.', RT({ msg: '۱.۶ ارتفاع داره', key: 'datum:ارتفاع بار', what: 'fact', fix: '۱۵۰ سانت', old: '۱.۶' }));
    const q = await ev(() => __asks()), d3 = q.filter(a => a.path === 'dl:d3')[0];
    return { ok: !!d3 && /^ارتفاع بار ۱[.٫]۵ متر$/.test(d3.new) && !q.some(a => /^dl:d[12]$/.test(a.path)), got: q }; });

  // A23-21 s07 (S2، پسرفت): «صورتِ مسئلهٔ صفحه که خودش نوشته بود («… ۴، ۹، ۱۳، ۱۶، ۱۷ سانت …») نه عوض شد و نه «این‌جا هم عوض شود؟» پرسیده شد … ردیف‌های فرمِ فهم هم»
  const S07 = '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.';
  await T('A23-21 s07 ✏️ «۹⇒۸، ۱۶⇒۱۵»: her typed statement and rows «۴ ساعت ⇒ ۹ سانت»/«۸ ساعت ⇒ ۱۶ سانت» asked; other rows not', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn(S07, 'ثابتش کن یا ردش کن.');
    await ev(() => { const s = __cur(); const pid = __live('نور و رشدِ لوبیا', '۵ گلدان لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور؛ قد پس از ۳ هفته ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونِ رابطهٔ نور و قد چیست؟'); APP.liveBindSession(pid, s);
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'رابطهٔ نور و قد', u: 'رابطهٔ قدِ لوبیا با ساعتِ نور', dl: [{ id: 'd1', t: '۲ ساعت ⇒ ۴ سانت' }, { id: 'd2', t: '۴ ساعت ⇒ ۹ سانت' }, { id: 'd3', t: '۶ ساعت ⇒ ۱۳ سانت' }, { id: 'd4', t: '۸ ساعت ⇒ ۱۶ سانت' }, { id: 'd5', t: '۱۰ ساعت ⇒ ۱۷ سانت' }], c: 'همهٔ گلدان‌ها ۳ هفته', type: 'find', nat: 'practical', from: 'live' } }; }); });
    await ev(async (S07) => __edit(__U(1), S07.replace('۴، ۹، ۱۳، ۱۶، ۱۷', '۴، ۸، ۱۳، ۱۵، ۱۷')), S07);
    const q = await ev(() => __asks()), g = (p0) => q.filter(a => a.path === p0)[0], st = g('stmt'), d2 = g('dl:d2'), d4 = g('dl:d4');
    return { ok: !!st && /۴، ۸، ۱۳، ۱۵، ۱۷ سانت/.test(st.new) && /۲، ۴، ۶، ۸ و ۱۰ ساعت/.test(st.new) && !!d2 && d2.new === '۴ ساعت ⇒ ۸ سانت' && !!d4 && d4.new === '۸ ساعت ⇒ ۱۵ سانت' && !g('dl:d1') && !g('dl:d3') && !g('dl:d5'), got: q }; });

  // A23-30 oA1 (S2): «خواستهٔ سنجاق‌شدهٔ سشن و نتیجهٔ «۱۰ × ۹ ÷ ۲ = ۴۵» نه عوض شدند نه پرسیده شدند. سطرِ نتیجه فقط تکه را نشان داد: «صورتِ مسئلهٔ گفت‌وگو: «۱۲» (اصلاح شد ⇐ «۱۰»)»»
  await T('A23-30 oA1 «۱۲ نفره بود، نه ۱۰»: pinned goal asked, the result «… = ۴۵» set aside with reason, the change line shows a window (not «۱۲»)', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('سلام. یه مسئله‌ست که از دیشب ذهنمو درگیر کرده: تو یه مهمونیِ ۱۰ نفره هر کس با هر کس دقیقاً یه بار دست داده. چند تا دست‌دادن شده؟ و اگه n نفر باشن چی؟ حدسِ اولم ۱۰۰ بود ولی حس می‌کنم غلطه.', 'یک حالتِ کوچک امتحان کن.', [], { pinned: 'تعدادِ دست‌دادن‌ها در مهمانیِ ۱۰ نفره و برای n نفر', title: 'دست‌دادن‌های مهمانی' });
    await turn('با ۳ نفر: الف‌ب، الف‌ج، ب‌ج — ۳ تا. راهِ من (۱۰ × ۱۰) برای ۳ نفر می‌شه ۹. پس دو جا اشتباه کردم: هر کس با خودش دست نمی‌ده، پس ۳ × ۲ = ۶؛ و هر دست‌دادن رو دو بار شمردم، پس ۶ ÷ ۲ = ۳. برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵.', 'حالتِ کوچک کارش را کرد. برای n؟', [cs({ ph: 'c', said: ['result'], result: 'برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵.' })]);
    const pin0 = await ev(() => ({ pin: __cur().pinned, ev: (__cur().coachEv || []).filter(e => e.how === 'res').map(e => (e.src20 || {}).span) }));
    const u = await turn('یعنی محصولی که ساختیم به ۱۰ هزار کاربرِ فعال برسه و یکی از بچه‌ها بتونه جای من رو بگیره. راستی یه چیزی: اون مهمونی ۱۲ نفره بود، نه ۱۰. هر جا ۱۰ نوشتی درستش کن.', 'فرستادم.', RT({ msg: 'تو یه مهمونیِ ۱۰ نفره', key: 'datum:تعدادِ مهمان‌ها', what: 'fact', fix: '۱۲ نفره', rests: [] }));
    const x = await ev(() => { const s = __cur(); return { q: __asks(), res: (s.coach.retNote || {}).res, ch: (s.coach.retNote || {}).ch, ev: (s.coachEv || []).filter(e => e.how === 'res').map(e => ({ span: (e.src20 || {}).span, stale: !!e.stale })) }; });
    const pin = x.q.filter(a => a.path === 'sess.pinned')[0], st = (x.res && x.res.changed || []).filter(c => c.rec === 'صورتِ مسئلهٔ گفت‌وگو')[0], rs = (x.res && x.res.changed || []).filter(c => /^نتیجهٔ/.test(c.rec))[0];
    const line = (x.ch || []).filter(l => /^صورتِ مسئلهٔ گفت‌وگو/.test(l))[0] || '';
    return { ok: !!pin && /مهمانیِ ۱۲ نفره/.test(pin.new) && !!rs && /۴۵/.test(rs.old) && /دوباره حساب شود/.test(rs.new) && x.ev.some(e => e.stale) && !!st && st.old !== st.new && !/^«۱۲» \(اصلاح شد ⇐ «۱۰»\)$/.test(line.replace(/^صورتِ مسئلهٔ گفت‌وگو: /, '')) && /۱۲ نفره/.test(line), got: { pin0, x, line } }; });

  // D23-3 s30 (S2، پسرفت): «نسخهٔ تایپ‌شده با جمله‌بندیِ دیگر («خروجی فعلی ۸۰۰ کارتن در روز») دیگر پرسیده نمی‌شود و ۸۰۰ می‌ماند»
  await T('D23-3 s30 «۷۵۰ کارتنه، نه ۸۰۰»: her typed row «خروجی فعلی ۸۰۰ کارتن در روز» asked; target «۱۰۰۰» untouched', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('باشه، قبول. یه مسئلهٔ واقعی دارم: تو خط تولید بسته‌بندی کارخونه، خروجی روزانه ۸۰۰ کارتنه ولی هدف ۱۰۰۰ تاست. ۵ ایستگاه داریم: پرکن، درب‌بند، برچسب، کارتن‌گذار، پالت. فکر کنم گلوگاه درب‌بنده ولی مطمئن نیستم. با هم حلش کنیم.', 'کل را بگو.');
    await ev(() => { const s = __cur(); const pid = __live('گلوگاهِ خطِ بسته‌بندی', 'خط بسته‌بندی روزی ۸۰۰ کارتن می‌دهد و هدف ۱۰۰۰ است؛ گلوگاه کجاست؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'گلوگاه را پیدا کنم', u: 'کدام ایستگاه', dl: [{ id: 'd1', t: 'خروجی فعلی ۸۰۰ کارتن در روز' }, { id: 'd2', t: 'هدف ۱۰۰۰ کارتن در روز' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; }); });
    await turn('راستی خروجی رو اشتباه گفتم: میانگینِ واقعیِ ماه پیش روزی ۷۵۰ کارتنه، نه ۸۰۰.', 'فرستادم.', RT({ msg: 'خروجی روزانه ۸۰۰ کارتنه', key: 'datum:خروجیِ روزانه', what: 'fact', fix: '۷۵۰', old: '۸۰۰' }));
    const q = await ev(() => __asks()), d1 = q.filter(a => a.path === 'dl:d1')[0];
    return { ok: !!d1 && d1.new === 'خروجی فعلی ۷۵۰ کارتن در روز' && !q.some(a => a.path === 'dl:d2'), got: q }; });

  // B·D3 s17 (S2): «✏️ «۲۰ ⇒ ۱۷» (tank size) produced a FALSE ask on an unrelated record — «کدام تقریب بس است»: «بینِ ۱۰ تا ۲۰ مترمکعب» ⇒ «بینِ ۱۰ تا ۱۷»»
  //   + «s17 «بام ۱۸۰ نه ۲۰۰» ⇒ «از آن بخشِ پیامت چیزی ثبت نشده بود» although her d1 «سطحِ بامِ انبار ۲۰۰ مترمربع» and her measure line hold it (original message wrote «200 m^2»)»
  await T('B·D3 s17 range bound never offered; «بام ۱۸۰ نه ۲۰۰» asks d1 and the measure line from «200 m^2»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری قطره‌ای تابستون باغ پسته. مخزن چقدر بزرگ بسازم؟', 'اول کدام؟');
    await turn('روز سوم. واحدها رو درست کردم: V = 200 m^2 × 0.12 m = 24 m^3، یعنی ۲۴ مترمکعب شد.', 'خب.');
    await turn('تصمیمم: حساب نهایی ۲۴ × ۰.۸ = ۱۹.۲ مترمکعب، پس یه مخزن بتنی ۲۰ مترمکعبی کنار دیوار شمالی انبار می‌سازم.', 'خب.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('مخزنِ آبِ باران', 'می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری قطره‌ای تابستون باغ پسته. مخزن چقدر بزرگ بسازم؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'اندازهٔ مخزن', u: 'مترمکعب', dl: [{ id: 'd1', t: 'سطحِ بامِ انبار ۲۰۰ مترمربع' }, { id: 'd2', t: 'بارشِ سالانهٔ دامغان حدودِ ۱۲۰ میلی‌متر' }], c: '', type: 'find', nat: 'practical', from: 'page',
        prac: { approx: 'حدودِ ۱۴ مترمکعب، بینِ ۱۰ تا ۲۰ مترمکعب بس است', measure: 'حجم = ۲۰۰ مترمربع × ۰٫۱۲ متر' } } }; }); return pid; });
    await ev(async () => __edit(__U(3), 'تصمیمم: حساب نهایی ۲۴ × ۰.۷ = ۱۶.۸ مترمکعب، پس یه مخزن بتنی ۱۷ مترمکعبی کنار دیوار شمالی انبار می‌سازم.'));
    const q1 = await ev(() => __asks());
    await turn('یه اشتباه دیگه: تو پیام روز سوم نوشتم بام ۲۰۰ مترمربعه؛ امروز دوباره متر کردم، ۱۸۰ مترمربعه نه ۲۰۰. بارش همون ۱۲۰ میلی‌متره.', 'فرستادم.', RT({ msg: 'V = 200 m^2 × 0.12 m = 24 m^3', key: 'datum:سطحِ بام', what: 'fact', fix: '۱۸۰ مترمربع', old: '200 m^2' }));
    const x = await ev((pid) => ({ q: __asks(), approx: APP.S.get('eprog_' + pid).solve.u[1].prac.approx, sys: __cur().msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-1) }), pid);
    const d1 = x.q.filter(a => a.path === 'dl:d1')[0], ms = x.q.filter(a => a.path === 'prac.measure')[0];
    return { ok: !q1.some(a => a.path === 'prac.approx') && /۱۰ تا ۲۰ مترمکعب/.test(x.approx) && !!d1 && d1.new === 'سطحِ بامِ انبار ۱۸۰ مترمربع' && !!ms && /۱۸۰ مترمربع/.test(ms.new) && !/ثبت نشده بود/.test(x.sys.join(' ')), got: { q1, x } }; });

  // B·D3 s11 (S2): «s11 «۸×۸ نه ۱۰×۱۰» asks only for the statement — her lpOne «صفحهٔ ۱۰×۱۰ ِ…», d1 «صفحهٔ ۱۰×۱۰ (۱۰۰ خانه)» … never asked»
  //   + B·D19 (S3): «Live-problem title does not follow the corrected statement: s11 «دومینو روی صفحهٔ ۱۰×۱۰ …» after ۸×۸»
  await T('B·D3/B·D19 s11 «۸×۸» asks lpOne and d1; «بله» on the statement makes the title follow', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌ی backtracking نوشتم، یه ساعته داره می‌چرخه. کجای کدم اشتباهه؟', 'کل را بگو.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('دومینو روی صفحهٔ ۱۰×۱۰ بی دو گوشهٔ مقابل', 'یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم.'); APP.liveBindSession(pid, s);
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'صفحهٔ ۱۰×۱۰ ِ بی دو گوشهٔ مقابل را می‌شود با دومینو پوشاند؟', u: 'ممکن است؟', dl: [{ id: 'd1', t: 'صفحهٔ ۱۰×۱۰ (۱۰۰ خانه)' }, { id: 'd2', t: 'دو گوشهٔ مقابل برداشته شده' }], c: '', type: 'prove', nat: 'objective', from: 'page' } }; }); return pid; });
    await turn('یه اصلاح: تو پیام اولم گفتم صفحه ۱۰×۱۰؛ الان صورتِ اصلیِ معما رو دیدم، صفحه ۸×۸ بود، همون صفحه‌ی شطرنج. بقیه‌ش همونه.', 'فرستادم.', RT({ msg: 'یه صفحه ۱۰×۱۰', key: 'datum:اندازهٔ صفحه', what: 'fact', fix: '۸×۸' }));
    const q = await ev(() => __asks()), g = (p0) => q.filter(a => a.path === p0)[0], one = g('u.one'), d1 = g('dl:d1'), st = g('stmt');
    if (st) await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), st.id);
    const t = await ev((pid) => APP.S.get('eprob_' + pid).p.title, pid);
    return { ok: !!one && /صفحهٔ ۸×۸ ِ بی دو گوشهٔ مقابل/.test(one.new) && !!d1 && d1.new === 'صفحهٔ ۸×۸ (۱۰۰ خانه)' && !!st && /۸×۸/.test(t) && !/۱۰×۱۰/.test(t), got: { q, t } }; });

  // B·D3 s19 (S2): «s19 her page step outcome «یک کیلو اضافه شد» changed silently to «نیم» with no ask»
  await T('B·D3 s19 her typed step outcome is never changed silently: asked with «نیم کیلو»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم.', 'خب.');
    await turn('مهمونی بود، یه کیلو هم اضافه کردم. باز شکست خوردم، ول می‌کنم. فایده نداره.', 'یک گام.');
    const pid = await ev(() => { const s = __cur(), m = __U(2); const pid = __live('۸ کیلو تا عروسیِ برادرم', '۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { L.steps.push({ id: 'st1', at: new Date().toISOString(), text: 'این هفته و هفتهٔ بعد سه شب در هفته شامِ سبک', pred: 'یک کیلو کم می‌شود', due: APP.today(),
        chatRep: { done: 'no', what: 'مهمونی بود، یه کیلو هم اضافه کردم', mid: APP.liveMsgId(m) }, out: { at: new Date().toISOString(), d: APP.today(), done: 'part', match: 'no', what: 'هفتهٔ اول دو شب شامِ سبک خوردم؛ شبِ مهمانی همه‌چیز را خوردم و یک کیلو اضافه شد؛ پیش‌بینی‌ام غلط بود', from: 'page', chatPrev: true, mid: APP.liveMsgId(m) } }); }); return pid; });
    await turn('یه چیز قدیمی رو هم اصلاح کنم: اون شب مهمونی که گفتم «یه کیلو هم اضافه کردم» اشتباه گفتم — ترازو خراب بود، فقط نیم کیلو اضافه کرده بودم.', 'فرستادم.', RT({ msg: 'مهمونی بود، یه کیلو هم اضافه کردم', key: 'step:1', what: 'step', fix: 'نیم کیلو', old: 'یه کیلو' }));
    const x = await ev((pid) => ({ out: APP.S.get('eprog_' + pid).solve.live.steps[0].out.what, rep: APP.S.get('eprog_' + pid).solve.live.steps[0].chatRep.what, q: __asks() }), pid);
    const o = x.q.filter(a => a.path === 'out:st1')[0];
    return { ok: /یک کیلو اضافه شد/.test(x.out) && !!o && /و نیم کیلو اضافه شد/.test(o.new) && /نیم کیلو/.test(x.rep), got: x }; });

  // D23-4 s37 (S2، پسرفت): ««؟۴۸۷؟ ⇐ ؟۴۵۷؟» (۵ نوبت عقب، داده‌ای که خودش هم تایپ کرد): «چیزی ثبت نشده بود»؛ صورت ۴۸۷ می‌ماند؛ حکم و حدس کنار نمی‌روند»
  await T('D23-4 s37 masked «؟۴۸۷؟ ⇐ ؟۴۵۷؟»: her typed statement asked; never «nothing recorded»; «بله» sets aside the verdict and the guess outcome', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقم اول و آخر محو شده. می‌خوام بدونم قیمت هر گوسفند چقدر بوده. با این‌همه حالت ممکن، چطور پیدا کنم؟ فکر کنم باید ۱۰۰ حالت رو یکی‌یکی امتحان کنم.', 'خب.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('قیمت هر گوسفند', 'تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — قیمت هر رأس؟'); APP.liveBindSession(pid, s);
      __set(pid, (so, L) => { L.plan = { t: 'با بخش‌پذیری بر ۴ و ۹ رقمِ اول و آخر را پیدا کن؛ مثلاً ۱۴۸۷۰ را هم بسنج', at: new Date().toISOString() };
        so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: '۶۴۸۷۲ و ۲۴۸۷۶ هر دو بر ۳۶ بخش‌پذیرند' } };
        so.g = { 1: { guess: 'دو جواب دارد: ۶۴۸۷۲ یا ۲۴۸۷۶', test: '۶۴۸۷۲ ÷ ۳۶ = ۱۸۰۲', hit: 'درست بود', at: new Date().toISOString() } }; }); return pid; });
    await turn('اگه رقمِ وسط یه چیز دیگه بود، روشم همین می‌موند؟', 'آری.');
    await turn('دوباره دفتر رو با ذره‌بین دیدم: رقمِ وسط ۸ نیست، ۵ ـه؛ یعنی ؟۴۵۷؟ ریال. اولش اشتباه خونده بودم.', 'فرستادم.', RT({ msg: '۳۶ رأس گوسفند: ؟۴۸۷؟ ریال', key: 'datum:مبلغ', what: 'fact', fix: '؟۴۵۷؟', old: '؟۴۸۷؟' }));
    const x = await ev(() => ({ q: __asks(), res: (__cur().coach.retNote || {}).res, sys: __cur().msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-1) })), st = x.q.filter(a => a.path === 'stmt')[0];
    if (st) await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), st.id);
    const y = await ev((pid) => { const so = APP.S.get('eprog_' + pid).solve; return { st: APP.S.get('eprob_' + pid).p.statement, v: so.b[1].verdict, g: !!so.g[1].outSup }; }, pid);
    return { ok: !!st && /؟۴۵۷؟ ریال/.test(st.new) && !x.q.some(a => a.path === 'plan') && !/ثبت نشده بود/.test(String(x.res && x.res.note) + x.sys.join(' ')) && /؟۴۵۷؟/.test(y.st) && y.v !== 'verified' && y.g, got: { x, y } }; });

  // D23-5 s37 (S2): «پرسشِ بی‌جای «این‌جا هم عوض شود؟» حالا روی طرح («با بخش‌پذیری بر ۴ …» ⇐ «بر ۵»)»
  await T('D23-5 s37 ✏️ «۴⇒۵، ۴۴۵۷۶⇒۵۴۵۷۶» never asks the plan «با بخش‌پذیری بر ۴ و ۹ …»', async () => { await ev(() => { __wipe(); __fresh(); });
    await ev(() => { const s = __cur(); const pid = __live('قیمت هر گوسفند', 'تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال» — قیمت هر رأس؟'); APP.liveBindSession(pid, s);
      __set(pid, (so, L) => { L.plan = { t: 'با بخش‌پذیری بر ۴ و ۹ رقمِ اول و آخر را پیدا کن', at: new Date().toISOString() }; }); });
    await turn('با ۵: بر ۴ همون ۷۲ یا ۷۶. بر ۹: با ۲ جمع ۴+۵+۷+۲=۱۸ پس رقم اول ۹ → ۹۴۵۷۲. با ۶: رقم اول ۴ → ۴۴۵۷۶.', 'وارسی کن.');
    await ev(async () => __edit(__U(1), 'با ۵: بر ۴ همون ۷۲ یا ۷۶. بر ۹: با ۲ جمع ۴+۵+۷+۲=۱۸ پس رقم اول ۹ → ۹۴۵۷۲. با ۶: رقم اول ۵ → ۵۴۵۷۶.'));
    const q = await ev(() => __asks());
    return { ok: !q.some(a => a.path === 'plan' || /بر ۵/.test(a.new)), got: q }; });

  // C23-4 s23 (S2): «✏️ با دو جفت عدد اصلاً اعمال نمی‌شود (changed:[])» — «از آن تکه رکوردی ساخته نشده بود» و صورتِ «۱ پیمونه شکر … ۱۰۰ گرم کره» عوض نشد
  const S23 = 'سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۲ پیمونه آرد، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم، بیا ثبتش کنیم.';
  await T('C23-4 s23 ✏️ «۱⇐۱.۵، ۱۰۰⇐۱۲۰» after «… ۱.۷۵ برابر؟»: both pairs applied to the statement and the coach result is not «changed: []»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn(S23, 'ثبتش می‌کنیم.');
    const pid = await ev((S23) => { const s = __cur(); const pid = __live('کیکِ مادرم در قالبِ ۲۵×۳۰', S23, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id)); return pid; }, S23);
    await turn('کیک رو پختم و خوب شد! ولی زمان پختو نمی‌دونستم، دستور مادرم ۴۰ دقیقه بود. زمان پخت هم ۲.۸ برابر میشه؟ یعنی ۱۰۰ دقیقه؟', 'نه لزوماً.');
    await turn('یعنی اشتباه کردم که اول گفتم ۱.۷۵ برابر؟', 'مساحت را ببین.');
    const e = await ev(async (S23) => __edit(__U(1), S23.replace('۱ پیمونه شکر', '۱.۵ پیمونه شکر').replace('۱۰۰ گرم کره', '۱۲۰ گرم کره')), S23);
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, res: (__cur().coach.retNote || {}).res, R: (__cur().coach.retracts || []).slice(-2).map(r => ({ src: r.src, ok: r.ok, err: r.err })) }), pid);
    const bl = blockOf(e.user, /^# اصلاحی که صفحه انجام داد/);
    return { ok: /۱\.۵ پیمونه شکر/.test(x.st) && /۱۲۰ گرم کره/.test(x.st) && !GARBLE.test(x.st) && x.res && x.res.changed.length > 0 && !/"changed":\[\]/.test(bl), got: { x, bl: bl.slice(0, 600) } }; });

  // D23-6 s35 (S2): «بخشِ «چه» ِ موعدِ دوپیامی («شورایاری» ⇐ «شهرداریِ منطقه») رد می‌شود: «چیزی ثبت نشده بود»»
  await T('D23-6 s35 two-message deadline: the what-part follows «شهرداریِ منطقه», the date stays', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('طرحِ سوم رو باید کتبی به شورایاری بدم تا تصویبش کنن.', 'مهلتش؟');
    const d0 = (() => { const d = new Date(); d.setDate(d.getDate() + 18); return d.toISOString().slice(0, 10); })();
    await turn('مهلتش هم ۱۵ آبانه.', 'ثبت شد.', [{ do: 'deadline', what: 'تحویلِ کتبیِ طرحِ سوم به شورایاری برای تصویب', date: d0 }]);
    await turn('یه چیز دیگه هم اشتباه گفتم: طرح رو باید به شهرداریِ منطقه بدم، نه شورایاری.', 'فرستادم.', RT({ msg: 'طرحِ سوم رو باید کتبی به شورایاری بدم تا تصویبش کنن', key: 'deadline:d1', what: 'fact', fix: 'شهرداریِ منطقه', old: 'شورایاری' }));
    const x = await ev(() => ({ d: APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, h: (d.fixHist || []).length })), res: (__cur().coach.retNote || {}).res }));
    return { ok: x.d.length === 1 && /به شهرداریِ منطقه برای تصویب/.test(x.d[0].what) && x.d[0].date === d0 && x.d[0].h > 0 && x.res.changed.length > 0 && !/ثبت نشده بود/.test(x.res.note || ''), got: x }; });

  // B·D4 s19 (S2): «Statement garble on a deadline correction persists: s19 «۱۶ هفته تا عروسی برادرم مونده، …» ⇒ «عروسی ۱۵ اسفنده برادرم مونده، …»»
  await T('B·D4 s19 «… ۱۸ هفته تا عروسی بود نه ۱۶؛ عروسی ۱۵ اسفنده» never yields «عروسی ۱۵ اسفنده برادرم مونده»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم. این بار یه برنامه‌ی دقیق می‌خوام.', 'خب.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('۸ کیلو تا عروسیِ برادرم', '۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم. این بار یه برنامه‌ی دقیق می‌خوام.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id)); return pid; });
    await turn('یه چیز از همون روزِ اول رو درست کنم: اون موقع اشتباه حساب کرده بودم — از اون روز ۱۸ هفته تا عروسی بود نه ۱۶؛ عروسی ۱۵ اسفنده.', 'فرستادم.', RT({ msg: '۱۶ هفته تا عروسی برادرم مونده', key: 'deadline:d1', what: 'fact', fix: 'عروسی ۱۵ اسفنده', old: '۱۶ هفته' }));
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, cst: (__cur().coach || {}).stmt || '', q: __asks() }), pid);
    const st = x.q.filter(a => a.path === 'stmt')[0];
    return { ok: !GARBLE.test(x.st) && !GARBLE.test(x.cst) && (!st || (!GARBLE.test(st.new) && /عروسی ۱۵ اسفنده/.test(st.new))) && (/۱۵ اسفند/.test(x.st) || !!st), got: x }; });

  // D23-7 aD3 (S2، تازه): ««اولش که گفتم ۶۷ ماه اشتباه بود؛ درستش ۶۱ و نیمه» (ردِ نتیجهٔ خودش) مثلِ «اشتباهِ گفتاری» اجرا شد: متنِ حدس به «۶۱ و نیم ماه» بازنویسی و سرانجامِ «رد شد» کنار رفت؛ صورتِ گفت‌وگو هم بازنویسی شد»
  await T('D23-7 aD3 a refuted own result is never rewritten: guess stays «۶۷ ماه دوام میاره» with «رد شد»; chat statement untouched; told why', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('سلام. من معلم بازنشستهٔ ریاضی‌ام. یه حسابی کردم و می‌خوام با هم یه بار دیگه بازبینیش کنیم. پس‌اندازم ۶۰۰ میلیون تومنه، توی حسابی که ماهی ۱٫۵ درصد سود میده. ماهی ۱۵ میلیون برمی‌دارم. با یه جدول ماه‌به‌ماه روی کاغذ حساب کردم که ۶۷ ماه دوام میاره. درسته؟', 'چطور می‌آزمایی‌اش؟', [cs({ ph: 'u', guess: { text: '۶۷ ماه دوام میاره' } })]);
    await turn('بله. اگه B0 = 600 و هر ماه اول سود بعد برداشت: B_n = 600·1.015^n − 15·(1.015^n − 1)/0.015. صفرش کنم: 1.015^n = 2.5 ⇒ n ≈ 61.5. یعنی حدود ۶۱ و نیم ماه، نه ۶۷! پس یه جای جدولم غلطه.', 'کجای جدول؟', [cs({ ph: 'c', guess_res: { id: 'g1', res: 'refuted' } })]);
    const g0 = await ev(() => ((__cur().coach || {}).guesses || []).map(g => ({ id: g.id, t: g.text, r: g.res })));
    await turn('فرمول رو ساده‌تر کردم: B_n = 1000 − 400·1.015^n. پیدا کردم: ماه سی‌ام رقم رو از سطر قبل اشتباه کپی کردم، ۴۷۵ نوشتم به جای ۳۷۵. ببخشید، پس اولش که گفتم ۶۷ ماه اشتباه بود؛ درستش ۶۱ و نیم ماهه.', 'خوب پیدا کردی.', RT({ msg: '۶۷ ماه دوام میاره', key: 'guess:g1', what: 'guess', fix: '۶۱ و نیم ماه', rests: ['guess'] }));
    const x = await ev(() => { const C = __cur().coach || {}; return { g: (C.guesses || []).map(g => ({ t: g.text, r: g.res })), stmt: C.stmt || '', n: C.retNote || {}, sys: __cur().msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-1) }; });
    const g = x.g.filter(y => /۶۷/.test(y.t))[0];
    return { ok: !!g && g.t === '۶۷ ماه دوام میاره' && g.r === 'refuted' && !x.g.some(y => /۶۱ و نیم/.test(y.t)) && !/۶۱ و نیم/.test(x.stmt) && /رد شد/.test(J(x.n) + x.sys.join(' ')), got: { g0, x } }; });

  // D23-8 oD1 (S2، تازه): ««هر قرص ۰٫۳ گرمه» ⇐ «۰٫۲۵ گرمه» صورتِ زنده را «…نویزش حدود ۰٫۰۵ گرمه؛ ۰٫۲۵ گرمه؛ …» کرد («هر قرص» افتاد)؛ یادداشت ««۲۵» ⇐ «۳»» رقمی و گنگ»
  const OD2 = 'یه جمله: می‌خوام بدونم «مادرم قرصِ امروزش رو برداشته یا نه»، فقط از روی وزنِ قرص‌دون، بی دوربین. داده‌هام: ترازوی دیجیتالِ کوچیک با سنسور لودسل که دقتش ۰٫۰۱ گرمه ولی نویزش حدود ۰٫۰۵ گرمه؛ هر قرص ۰٫۳ گرمه؛ قرص‌دون ۷ خونه داره. شرط: ارزون، بی دوربین، و مادرم هیچ کار اضافه‌ای نکنه.';
  await T('D23-8/D23-9 oD1 «هر قرص ۰٫۲۵ گرمه» keeps «هر قرص»; no digit-level note; the dependent guess «حدودِ ۰٫۳» is asked (rests: guess)', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('سلام. یه ایده دارم: یه قرص‌دونِ هوشمند برای مادرم که از روی وزن بفهمه قرصش رو خورده یا نه.', 'در یک جمله؟');
    await turn(OD2, 'خوب.');
    const pid = await ev((OD2) => { const s = __cur(); const pid = __live('قرص‌دونِ هوشمند', OD2, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id)); return pid; }, OD2);
    await turn('آره! ترازوی نانوایی عدد رو وقتی ثابت نشون میده که چند ثانیه تغییرش از یه حدی کمتر باشه. یعنی اگه اختلافِ دو وزنِ پایدار حدودِ ۰٫۳ بود، یه قرص برداشته شده. این درسته؟', 'چطور می‌آزمایی؟', [cs({ ph: 'b', guess: { text: 'اگه اختلافِ دو وزنِ پایدار حدودِ ۰٫۳ بود، یه قرص برداشته شده' } })]);
    await turn('آره جدا ثبتش کن ولی بعداً. یه اشتباه هم کردم: اولش گفتم هر قرص ۰٫۳ گرمه؛ امروز با ترازو وزن کردم، قرص‌های مادرم ۰٫۲۵ گرمه.', 'فرستادم.', RT({ msg: 'هر قرص ۰٫۳ گرمه', key: 'datum:وزنِ هر قرص', what: 'fact', fix: '۰٫۲۵ گرمه', rests: ['guess'] }));
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, res: (__cur().coach.retNote || {}).res, ch: (__cur().coach.retNote || {}).ch, q: __asks() }), pid);
    const cg = x.q.filter(a => /^cg:/.test(a.path))[0];
    return { ok: /هر قرص ۰٫۲۵ گرمه؛ قرص‌دون ۷ خونه/.test(x.st) && !GARBLE.test(J(x.ch) + J(x.res)) && !!cg && /حدودِ ۰٫۲۵ بود/.test(cg.new), got: x }; });

  // D23-9 s36 (S3): «حدسی که بر دادهٔ اصلاح‌شده بنا بود دست نخورد (… s36 «حدود ۱۰ لیتر — درست بود» پس از ۲۰⇐۳۰)»
  await T('D23-9 s36 «ظرفِ اول ۳۰ لیتر بود، نه ۲۰»: the answer-guess «۱۰ لیتر» judged «درست» is set aside, not left confirmed', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('«۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟» من از x بدم میاد، همیشه قاطی می‌کنم کدوم x کدومه. می‌شه بدون x حلش کرد؟', 'آری؛ حدس بزن.');
    await turn('۲۰ لیتر با ۱۰٪ یعنی ۲ لیتر نمک. بعد یه مقدار ۲۵٪ اضافه می‌کنیم. حدس زدم ۵ لیتر: کمه. ۱۰ لیتر؟ خیلی کنده این‌جوری.', 'بیازما.', [cs({ ph: 'c', guess: { text: '۱۰ لیتر' } })]);
    await turn('۱۰ لیتر رو حساب کردم: ۲+۲٫۵=۴٫۵ از ۳۰ میشه ۱۵٪. پس ۱۰ لیتر جوابه!', 'خوب.', [cs({ ph: 'c', said: ['result'], result: '۲+۲٫۵=۴٫۵ از ۳۰ میشه ۱۵٪. پس ۱۰ لیتر جوابه', guess_res: { id: 'g1', res: 'confirmed' } })]);
    await turn('نه، پرسش نبود: ظرفِ اول واقعاً ۳۰ لیتره، نه ۲۰. اولش اشتباه خونده بودم.', 'فرستادم.', RT({ msg: '۲۰ لیتر آب‌نمک ۱۰٪ داریم', key: 'datum:حجمِ ظرفِ اول', what: 'fact', fix: '۳۰ لیتر', old: '۲۰ لیتر' }));
    const x = await ev(() => ({ g: ((__cur().coach || {}).guesses || []).map(g => ({ t: g.text, r: g.res, rc: !!g.resRecheck })), res: (__cur().coach.retNote || {}).res }));
    const g = x.g.filter(y => y.t === '۱۰ لیتر')[0];
    return { ok: !!g && g.r !== 'confirmed' && g.rc, got: x }; });

  // C23-5 s25 (S3): «retract بی rests ⇒ همهٔ حکم‌ها (حتی برهانِ مستقل از داده) کنار ⇒ پرسش‌های بی‌جا» — «برهانِ استقرا بر شمارِ نمونه‌ها بنا نیست»
  await T('C23-5 s25 «۸ تا بود نه ۱۰» without rests: statement fixed, the induction proof verdict and «حل شد» stay', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم. درسته دیگه؟ ثابت شد.', 'برهانش؟');
    const pid = await ev(() => { const s = __cur(), m = __U(1); const pid = __live('جمعِ تلسکوپی', 'امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'جمعِ ۱/(k(k+1)) از ۱ تا n برابرِ n/(n+1) است؟', u: 'اثبات برای هر n', dl: [{ id: 'd1', t: 'جملهٔ k ام برابرِ 1/(k(k+1))' }], c: 'n عددِ طبیعی', type: 'prove', nat: 'objective', from: 'page' } };
        so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'برهانِ استقرا: پایه n=1 و گامِ n به n+1' } }; L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: 'n/(n+1) با استقرا', mid: APP.liveMsgId(m) }; }); return pid; });
    await turn('یه چیز دیگه: روز اول گفتم «۱۰ تاشو چک کردم» — اشتباه گفتم، ۸ تا بود، نه ۱۰.', 'فرستادم.', RT({ msg: '۱۰ تاشو چک کردم', key: 'datum:تعدادِ نمونه‌های وارسی‌شده', what: 'fact', fix: '۸', old: '۱۰' }));
    const x = await ev((pid) => { const so = APP.S.get('eprog_' + pid).solve; return { st: APP.S.get('eprob_' + pid).p.statement, v: so.b[1].verdict, state: so.live.state, why: [so.b[1].superseded, so.b[1].chkSup, so.b[1].uses] }; }, pid);
    return { ok: /۸ تاشو چک کردم/.test(x.st) && x.v === 'verified' && x.state === 'solved', got: x }; });

  // C23-22 oC1 (S3): «p18: «بله، دادهٔ ۲ رو هم عوض کن» ⇒ پرامپت هنوز «صفحه پرسیده … هنوز جواب نداده»»
  await T('C23-22 oC1 «بله، دادهٔ ۲ رو هم عوض کن» answers the open copy ask; the prompt no longer says «هنوز جواب نداده»', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('برای کتاب حدود ۱۲۰ ساعت مونده، پس بسه.', 'خب.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('سه پروژه و ۱۲ ساعت', 'سه تا پروژه دارم و هفته‌ای ۱۲ ساعت وقتِ آزاد.'); APP.liveBindSession(pid, s);
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'ترتیبِ سه پروژه', u: 'ترتیب و سهم', dl: [{ id: 'd1', t: '۱۲ ساعت در هفته' }, { id: 'd2', t: 'کتاب حدود ۱۲۰ ساعت مانده' }], c: '', type: 'find', nat: 'life', from: 'page' } }; }); return pid; });
    await turn('اشتباه گفتم، برای کتاب ۱۴۰ ساعت مونده نه ۱۲۰.', 'فرستادم.', RT({ msg: 'حدود ۱۲۰ ساعت مونده', key: 'datum:ساعتِ ماندهٔ کتاب', what: 'fact', fix: '۱۴۰', old: '۱۲۰' }));
    const q0 = await ev(() => __asks());
    const u = await turn('پیشرفت: ۱۸ صفحه و یه ترتیبِ روشن. آموختم که عددِ «واقعی» رو باید از هفتهٔ واقعی بگیرم نه از امیدم. بله، دادهٔ ۲ رو هم عوض کن.', 'باشه.');
    const x = await ev((pid) => ({ d2: APP.S.get('eprog_' + pid).solve.u[1].dl[1].t, q: __asks() }), pid);
    return { ok: q0.some(a => a.path === 'dl:d2') && /۱۴۰ ساعت/.test(x.d2) && !x.q.some(a => a.state === 'open') && !/هنوز جواب نداده/.test(head(u.user)), got: { q0, x } }; });

  // C23-16 oC1 (S3): «changed[0] «صورتِ مسئلهٔ گفت‌وگو» قدیم==تازه (بریده در ۱۲۰ نویسه پیش از عدد) با why خالی»؛ D23-12 (S3): «خطِ پرسشِ نسخه در گفت‌وگو پیشوندِ بریدهٔ یکسان نشان می‌دهد»
  await T('C23-16/D23-12 the change line and the ask line show the differing part with a reason, never old == new', async () => { await ev(() => { __wipe(); __fresh(); });
    const M1 = 'سلام. یه مسئلهٔ واقعی دارم ولی اول یه سؤال: اگه من اینجا یه چیزی رو اشتباه بگم و پنج پیام بعد اصلاحش کنم، همه‌چیزی که ازش ساختی دنبالش عوض میشه؟ یا باید خودم همه رو دوباره بگم؟ مسئله‌م اینه: سه تا پروژه دارم — یه کتاب، یه اپ، یه دورهٔ آموزشی — و هفته‌ای ۱۵ ساعت وقتِ آزاد.';
    await turn(M1, 'اول کل را بگو.');
    await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.stmt = s.msgs.filter(m => m.role === 'user')[0].text; APP.S.put(s);
      const pid = __live('سه پروژه', 'وقتی کتاب رو تموم کنم، وقتی که برای کتاب گذاشتم رو بدم به اپ — هفته‌ای ۱۵ ساعت وقتِ آزاد دارم و این قاعده برام مهمه.'); APP.liveBindSession(pid, s); });
    await turn('حدود ۱۲۰ ساعت مونده، پس بسه. ولی صبر کن، یه اصلاح: اول گفتم «هفته‌ای ۱۵ ساعت وقتِ آزاد» — اشتباه گفتم، واقعیش ۱۲ ساعته.', 'فرستادم.', RT({ msg: 'هفته‌ای ۱۵ ساعت وقتِ آزاد', key: 'datum:ساعتِ آزادِ هفتگی', what: 'fact', fix: '۱۲', old: '۱۵', rests: [] }));
    const x = await ev(() => { const s = __cur(); return { res: (s.coach.retNote || {}).res, sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-1), q: __asks(), part: __asks().map(q => APP.liveAskPart(q)) }; });
    const c0 = (x.res.changed || []).filter(c => c.rec === 'صورتِ مسئلهٔ گفت‌وگو')[0];
    return { ok: !!c0 && c0.old !== c0.new && /۱۵/.test(c0.old) && /۱۲/.test(c0.new) && !!c0.why && x.res.changed.every(c => c.old !== c.new && c.why) && x.part.every(t => !/«([^»]+)» ⇐ «\1»/.test(t)) && !/«([^»]{10,})» ⇐ «\1»/.test(x.sys.join(' ')), got: x }; });

  /* ================= (۲) بانکِ مستقل VARIANTS_R23 — هر ورودیِ Q4 ================= */
  const bank = BANKF && fs.existsSync(BANKF) ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : null;
  info.bank.file = BANKF || '(missing)';
  if (!bank) errors.push('bank: VARIANTS_R23 not found (tests/variants/VARIANTS_R23.json)');
  else {
    const Q4 = bank.filter((e) => /^Q4\b/.test(String(e.rc || e.mech || '')));
    info.bank.n = bank.length; info.bank.q4 = Q4.length;
    const BH = require('./tour1_r23_correction_bank.js');
    const out = await BH.run({ p, ev, turn, blockOf, head, bank, Q4 });
    Object.assign(info.bank, out.summary); Object.assign(info.nc, out.nc);
    out.fail.forEach(f => errors.push('bank ' + f));
  }

  console.log(J({ runners: info.runners, bank: info.bank, nc: info.nc }, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
