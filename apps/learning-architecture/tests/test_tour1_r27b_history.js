// تورِ پولیا (دستهٔ ۱، دورِ ۲۷b، سهمِ «history» — ۲۰۲۶-۱۱-۱۶): نیمهٔ 📜 ِ R6 و باقی‌ماندهٔ «story» (FIX27B).
//  هر بخش از جملهٔ خودِ دونده‌ها یا ورودیِ بانکِ مستقلِ tests/variants/VARIANTS_R27.json (شمارهٔ ۱-مبنا) ساخته شده و «شبیهِ منفی» ِ خودش را دارد.
//  قرمزِ نخست: LLA_FILE=<ساختِ BASE27B> — بخش‌های مثبت باید قرمز شوند. ساعتِ صفحه دست نمی‌خورد؛ هیچ تاریخِ تقویمی در انتظارها نیست.
//  ONLY=<نامِ بخش‌ها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BF = process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R27.json');
const BANK = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, actions, reply) => { const n0 = __calls.length; __q.push({ reply: reply || 'خوب.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; const c = __calls.slice(n0)[0] || {}; return String(c.user || '').split('# نوبتِ تازه')[0]; };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__mk = (t, st) => APP.liveCreate(t, st, 'find', { by: 'user', sess: __cur().id }).p.id;
    window.__dos = (pid) => { try { return (APP.dossier(pid).events || []).map(e => e.k + ' | ' + (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.cs = (o) => Object.assign({ do: 'coach_state', ans: [], said: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
    window.__base3 = () => { __wipe(); __fresh();
      const A = __mk('قفسه‌های انباری', 'انباری ۲ متر ارتفاع داره. چند طبقه قفسه توش جا میشه و چوبش رو چقدر بخرم؟'); APP.liveBindSession(A, __cur(), { force: true });
      const B = __mk('مهره‌های رنگی', 'سه رنگ مهره داریم و از هر رنگ چند تا؛ به چند حالت می‌شه دو مهره برداشت؟'); APP.liveBindSession(B, __cur(), { force: true });
      APP.liveBindSession(A, __cur(), { force: true }); return [A, B]; };
    window.__one = (t, st) => { __wipe(); __fresh(); const A = __mk(t, st); APP.liveBindSession(A, __cur(), { force: true }); return A; };
  });
  const J = (x) => JSON.stringify(x);
  const ev = (f, a) => p.evaluate(f, a);
  const E = {};      // بانک: شماره ⇒ async () => [ok, why] | { nc }
  const K = {};      // بخش‌های جمله‌های دونده‌ها

  /* ---------- #230 (A27-4): ✓/✗/؟ ِ صفحه کنارِ سطرِ خودش در 📜 ---------- */
  E[230] = async () => { const D = await ev(async () => { const [A] = __base3(); await __turn('۴ × ۶ = ۲۴ قفسه، ولی ۲۴ ÷ ۵ = ۴ ردیف', [cs({ ph: 'c', said: ['d'] })]); return __dos(A); });
    const l1 = D.filter(x => /۴ × ۶ = ۲۴ قفسه/.test(x) && !/^udraft/.test(x))[0] || '', l2 = D.filter(x => /۲۴ ÷ ۵ = ۴ ردیف/.test(x) && !/^udraft/.test(x))[0] || '';
    return [/حسابِ صفحه: ✓/.test(l1) && /حسابِ صفحه: ؟/.test(l2) && /۴٫۸/.test(l2), J([l1, l2])]; };
  K.A27_4 = async () => {   // s02 📜 (A27-4): «۳٫۹۷ − ۳٫۹ = ۰٫۷» ✗ بی نشان؛ منفی: سطرِ بی‌حساب نشانی نمی‌گیرد و عددِ درستِ ✗ لو نمی‌رود
    const D = await ev(async () => { const A = __one('زمانِ دویدن', 'زمانِ دویدنم رو مقایسه کنم.'); await __turn('۳٫۹۷ − ۳٫۹ = ۰٫۷ دقیقه بهتر شدم', [cs({ ph: 'c', said: ['result'], result: '۳٫۹۷ − ۳٫۹ = ۰٫۷ دقیقه بهتر شدم' })]);
      await __turn('مسیرِ پارک رو انتخاب کردم', [cs({ ph: 'c', said: ['d'] })]); return __dos(A); });
    const bad = D.filter(x => /۳٫۹۷ − ۳٫۹/.test(x) && /^cres/.test(x))[0] || '', plain = D.filter(x => /مسیرِ پارک/.test(x) && /^c/.test(x))[0] || '';
    return [/حسابِ صفحه: ✗/.test(bad) && !/۰٫۰۷/.test(bad) && (!plain || !/حسابِ صفحه/.test(plain)), J([bad, plain])]; };

  /* ---------- #232 (D26-2): «برنامهٔ خودت» + «طرح» ِ همان جمله = یک سطر ---------- */
  E[232] = async () => { const D = await ev(async () => { const [A] = __base3(); const t = 'نتیجه رو هم از گزارشِ دو هفته وارسی می‌کنم'; await __turn(t, [cs({ ph: 'p', said: ['plan'], plan: t })]); return __dos(A); });
    const n = D.filter(x => /گزارشِ دو هفته/.test(x) && /^c(?:plan|plan23)\b/.test(x)).length; return [n === 1, J(D)]; };
  K.D26_2_neg = async () => {   // منفی: دو برنامهٔ جدا در دو پیام دو سطر می‌مانند
    const D = await ev(async () => { const [A] = __base3(); const t1 = 'فردا چوب‌ها رو اندازه می‌گیرم', t2 = 'پس‌فردا قفسه‌ها رو رنگ می‌زنم'; await __turn(t1, [cs({ ph: 'p', said: ['plan'], plan: t1 })]); await __turn(t2, [cs({ ph: 'p', said: ['plan'], plan: t2 })]); return __dos(A); });
    return [D.filter(x => /اندازه می‌گیرم/.test(x) && /^cplan/.test(x)).length === 1 && D.filter(x => /رنگ می‌زنم/.test(x) && /^cplan/.test(x)).length === 1, J(D)]; };

  /* ---------- #168 (D27-15 pwD2): گامِ دفترِ «کارِ پیشین» نوعِ خودش را دارد؛ جملهٔ گیر «گیر» است ---------- */
  E[168] = async () => { const D = await ev(async () => { const A = __one('حکمِ n', 'می‌خوام ثابت کنم برای هر n حکم برقراره.');
      const t = 'کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا. گیرِ من اینجاست که n = 73 جور درنمیاد';
      await __turn(t, [cs({ ph: 'e', said: ['plan', 'guess'], stuck: true, plan: { text: 'کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا' }, guess: { text: 'گیرِ من اینجاست که n = 73 جور درنمیاد' },
        prior: [{ step: 'روش', quote: 'کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا', verdict: 'unchecked' }, { step: 'گیر', quote: 'گیرِ من اینجاست که n = 73 جور درنمیاد', verdict: 'unchecked' }] })]); return __dos(A); });
    const pr = D.filter(x => /^cprior/.test(x))[0] || '';
    return [/گامِ ۱ ·[^¦]*کافیه حکم/.test(pr) && /گیر \(گامِ ۲\)[^¦]*n = 73/.test(pr) && !D.some(x => /^(?:cplan|cplan23|guess) /.test(x) && /(?:کافیه حکم|n = 73)/.test(x)), J(D)]; };
  K.D27_15_neg = async () => {   // منفی: حدسی که در دفترِ «کارِ پیشین» نیست «حدس» می‌ماند؛ گامی بی «گیر» «گامِ N» است
    const D = await ev(async () => { const A = __one('حکمِ n', 'می‌خوام ثابت کنم برای هر n حکم برقراره.');
      await __turn('گامِ ۱: برای n = 2 درسته. حدسم اینه که برای همهٔ nهای فرد هم درسته', [cs({ ph: 'e', said: ['guess'], guess: { text: 'برای همهٔ nهای فرد هم درسته' }, prior: [{ step: 'n = 2', quote: 'برای n = 2 درسته', verdict: 'ok' }] })]); return __dos(A); });
    return [D.some(x => /^guess/.test(x) && /nهای فرد/.test(x)) && D.some(x => /^cprior/.test(x) && /گامِ ۱ ·/.test(x) && !/گیر \(/.test(x)), J(D)]; };

  /*__MORE__*/

  // ---------- اجرا ----------
  for (const [nm, f] of Object.entries(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(nm)) continue; info.n++;
    try { const r = await f(); if (r[0]) info.ok++; else errors.push(nm + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(nm + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  for (const n of Object.keys(E).map(Number).sort((a, c) => a - c)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes('#' + n)) continue; info.n++;
    const be = BANK[n - 1]; if (!be) { info.nc[n] = 'bank entry missing'; continue; }
    try { const r = await E[n](); if (r && r.nc) { info.nc[n] = r.nc; continue; } if (r[0]) info.ok++; else errors.push('#' + n + ' [' + be.rc + '] «' + String(be.text).slice(0, 60) + '» ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push('#' + n + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify({ n: info.n, ok: info.ok, nc: Object.keys(info.nc).length }));
  if (Object.keys(info.nc).length) console.log('NC: ' + JSON.stringify(info.nc, null, 1));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
