// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، ۲۰۲۶-۱۱-۱۷) — DECISIONS_R28 C134 (پیدا شده با دروازهٔ کامل در یک سه‌شنبه؛ main همان رفتار را داشت).
//  C134: روزِ هفتهٔ تنها که روزِ هفتهٔ ثبت‌شده‌ای را جایگزین می‌کند («مهلت سه‌شنبه نیست، چهارشنبه است») از تاریخِ جایگزین‌شده خوانده می‌شود — همان روزِ هفته که
//  به آن نزدیک‌تر است (اگر گذشته، دیگری) — هرگز «نخستین چنان روزی پس از امروز»؛ و اصلاحی که فقط «چه» را عوض می‌کند («طرح نه، بودجه») روز را جابه‌جا نمی‌کند،
//  حتی وقتی جملهٔ اصلاح‌شده نامِ روزی دارد. هر بررسی در هر هفت روزِ هفته اجرا می‌شود: ساعتِ صفحه (Playwright page.clock) روی هر روز نگه داشته می‌شود و
//  هر انتظار از همان روزِ نگه‌داشته حساب می‌شود (هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست).
//  مثبت‌ها: بانکِ R23 #123 (روزِ هفتهٔ جایگزین) و بانکِ R22 #80 (اصلاحِ «چه»)، به‌علاوهٔ گونه‌ها (تاریخِ جایگزینی که روزِ تازه‌اش در هفتهٔ خودش گذشته؛
//  «چه» ِ تازه با همان واژهٔ روز؛ ✏️ ِ فقط «چه»). منفی‌های هم‌شکل: «فردا نه، پس‌فردا» هنوز از روزِ گفتن شمرده می‌شود (C93)؛ اصلاحی که هم روزِ هفتهٔ تازه
//  می‌گوید و هم «چه» را عوض می‌کند هنوز روز را جابه‌جا می‌کند.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

/* تاریخ‌ها در node، همه از روزِ نگه‌داشته (رشتهٔ YYYY-MM-DD؛ حسابِ UTC ِ ظهر تا مرزِ روز جابه‌جا نشود) */
const D = (s) => new Date(s + 'T12:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const add = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const pw = (s) => (D(s).getUTCDay() + 1) % 7;                       // شنبه = ۰ … جمعه = ۶
const nextWd = (td, w) => { for (let k = 1; k <= 7; k++) { const d = add(td, k); if (pw(d) === w) return d; } };   // نخستین روزِ w پس از امروز
/* قاعدهٔ C134 چنان‌که ساخته شد: همان روزِ هفته که به تاریخِ جایگزین‌شده نزدیک‌تر است (اگر گذشته، دیگری؛ سپس هفته‌های بعد). در مثالِ خودِ C134 (سه‌شنبه ⇐ چهارشنبه)
   با «هفتهٔ شنبه‌تا‌جمعه» یکی است؛ جایی که فرق دارند حکمِ پیشینِ بانک (R20 #64، R19b #11) با «نزدیک‌تر» است — WORKLOG (155) */
const sameWeek = (s, w, td) => { const f = ((w - pw(s)) % 7 + 7) % 7; let o = add(s, f <= 3 ? f : f - 7); if (o < td) o = add(s, f); while (o < td) o = add(o, 7); return o; };
const WDN = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const SETUP = () => {
  APP.S.loaded = true; window.__calls = []; window.__q = [];
  APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
  APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || '') }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
    const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  /* yes: پس از نوبت، «آره» ِ ردیفِ 📅 برای رکوردی که مدل گزارش کرده (همان راهِ آزمون‌های R22/R23: PR.dateYes(null, true)) */
  window.__turn = async (text, reply, actions, yes) => { __q.push(R({ reply: reply || 'باشه.', actions: actions || [] })); await APP.ASSIST.send(text); if (yes !== false) { try { if (APP.PR && APP.PR.dateYes) APP.PR.dateYes(null, true); } catch (e) { } } __q.length = 0; };
  window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'card', 'deadline', 'fcast', 'mlog'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
  window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
  window.__cur = () => APP.ASSIST.cur();
  window.__U = (n) => (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(m.text))[n - 1];
  window.__edit = async (m, nt) => { const s = __cur(), n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300)); };
  window.__dls = () => APP.S.all('deadline').map(d => ({ id: d.id, what: d.what, quote: d.quote || '', date: d.date, done: !!d.done, by: d.by || '' }));
  window.__sys = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
};

(async () => {
  const b = await chromium.launch(); const errors = []; const res = {};
  const J = (x) => JSON.stringify(x);
  const real = iso(new Date(Date.now() + 3.5 * 36e5));   // امروزِ واقعی فقط برای برگزیدنِ هفت روزِ پیاپی؛ هیچ انتظاری از آن ساخته نمی‌شود
  const days = [0, 1, 2, 3, 4, 5, 6].map(k => add(real, k));
  for (const day of days) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(day + ' pageerror: ' + e.message));
    p.on('dialog', d => { errors.push(day + ' dialog ' + d.message()); d.dismiss(); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.clock.install({ time: new Date(day + 'T10:00:00') });   // ساعتِ صفحه روی همین روز (زمان از ۱۰ صبح جلو می‌رود؛ زمان‌سنج‌ها کار می‌کنند)
    await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
    await p.evaluate(SETUP);
    const ev = (f, a) => p.evaluate(f, a);
    const td = await ev(() => APP.today());
    if (td !== day) errors.push(day + ': page clock not frozen (APP.today() = ' + td + ')');
    const tag = WDN[pw(td)] + ' ' + td;
    const T = async (name, fn) => { let r; try { r = await fn(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
      (res[name] = res[name] || {})[tag] = !!r.ok; if (!r.ok) errors.push('[' + tag + '] ' + name + ' got ' + J(r.got).slice(0, 900)); };

    /* ---- مثبت ۱ (بانکِ R23 #123): «مهلت سه‌شنبه نیست، چهارشنبه است» ⇒ چهارشنبهٔ هفتهٔ همان سه‌شنبه ---- */
    await T('C134 #123 «مهلت سه‌شنبه نیست، چهارشنبه است» ⇒ the Wednesday next to the booked Tuesday', async () => {
      const tue = nextWd(td, 3), want = sameWeek(tue, 4, td);
      const x = await ev(async ([tue]) => { __wipe(); __fresh();
        await __turn('گزارش رو سه‌شنبه باید تحویل بدم.', 'خب.', [{ do: 'deadline', what: 'تحویلِ گزارش', date: tue }]);
        const mid = __dls();
        await __turn('مهلت سه‌شنبه نیست، چهارشنبه است', 'فرستادم.', [{ do: 'coach_state', retract: { msg: 'گزارش رو سه‌شنبه باید تحویل بدم', key: 'deadline:d1', what: 'fact', fix: 'چهارشنبه', old: 'سه‌شنبه' } }]);
        return { mid, dls: __dls() }; }, [tue]);
      const open = x.dls.filter(d => !d.done);
      return { ok: x.mid.length === 1 && x.mid[0].date === tue && open.length === 1 && open[0].date === want && open[0].what === 'تحویلِ گزارش', got: { tue, want, x } }; });

    /* ---- مثبت ۲ (گونه): پنجشنبه ⇐ شنبه = شنبهٔ نزدیک به همان پنجشنبه (دو روز بعدش)، نه شنبهٔ نخست پس از امروز ---- */
    await T('C134 «پنجشنبه نیست، شنبه است» ⇒ the Saturday nearest the booked Thursday (the one after it), never counted from today', async () => {
      const thu = nextWd(td, 5), want = sameWeek(thu, 0, td);
      const x = await ev(async ([thu]) => { __wipe(); __fresh();
        await __turn('فرم رو پنجشنبه باید بفرستم.', 'خب.', [{ do: 'deadline', what: 'فرستادنِ فرم', date: thu }]);
        await __turn('مهلت پنجشنبه نیست، شنبه است', 'فرستادم.', [{ do: 'coach_state', retract: { msg: 'فرم رو پنجشنبه باید بفرستم', key: 'deadline:d1', what: 'fact', fix: 'شنبه', old: 'پنجشنبه' } }]);
        return { dls: __dls() }; }, [thu]);
      const open = x.dls.filter(d => !d.done);
      return { ok: open.length === 1 && open[0].date === want && want >= td, got: { thu, want, x } }; });

    /* ---- مثبت ۳ (بانکِ R22 #80): «طرح نه، بودجه‌ش رو باید تحویل بدم» ⇒ «چه» عوض، روز همان (و هیچ موعدِ دیگری با روزِ دیگر ثبت نشد) ---- */
    await T('C134 #80 a what-only correction («طرح نه، بودجه‌ش») never moves the date', async () => {
      const tue = nextWd(td, 3);
      const x = await ev(async ([tue]) => { __wipe(); __fresh();
        for (const t of ['کارگاه رو ماه بعد شروع می‌کنم', 'باید سه‌شنبه طرحش رو تحویل بدم', 'یه کم نگرانم', 'هنوز شروع نکردم', 'امروز وقت ندارم', 'فردا شاید', 'شاید هم نه', 'باید برنامه بریزم', 'خسته‌ام']) await __turn(t, 'خب.');
        const s = __cur(), U = s.msgs.filter(m => m.role === 'user'), r = { id: 'd1', type: 'deadline', what: 'تحویلِ طرحِ کارگاه', date: tue, time: '', done: false, sess: s.id };
        r.src = APP.liveSrc(s.id, APP.liveMsgId(U[1]), 'deadline:d1', r.what + ' سه‌شنبه طرحش رو تحویل بدم'); APP.S.put(r);
        const mid = __dls();
        await __turn('طرح نه، بودجه‌ش رو باید تحویل بدم', 'فرستادم.', [{ do: 'coach_state', retract: { msg: 'باید سه‌شنبه طرحش رو تحویل بدم', what: 'fact', key: 'deadline:d1', fix: 'بودجه‌ش', old: 'طرحش' } }]);
        return { mid, dls: __dls() }; }, [tue]);
      const d1 = x.dls.filter(d => d.id === 'd1')[0], other = x.dls.filter(d => d.id !== 'd1' && !d.done);
      return { ok: x.mid.length === 1 && !!d1 && !d1.done && /بودجه/.test(d1.what) && d1.date === tue && !other.length, got: { tue, x } }; });

    /* ---- مثبت ۴ (گونه): «چه» ِ تازه با همان واژهٔ روز در مقدارِ درست («باید سه‌شنبه بودجه‌ش …») ⇒ روز همان ---- */
    await T('C134 a what-only fix whose text names the same weekday never moves the date', async () => {
      const tue = nextWd(td, 3);
      const x = await ev(async ([tue]) => { __wipe(); __fresh();
        await __turn('باید سه‌شنبه طرحش رو تحویل بدم.', 'خب.', [{ do: 'deadline', what: 'تحویلِ طرح', date: tue }]);
        await __turn('اشتباه گفتم، باید سه‌شنبه بودجه‌ش رو تحویل بدم', 'فرستادم.', [{ do: 'coach_state', retract: { msg: 'باید سه‌شنبه طرحش رو تحویل بدم', what: 'fact', key: 'deadline:d1', fix: 'باید سه‌شنبه بودجه‌ش رو تحویل بدم', old: 'باید سه‌شنبه طرحش رو تحویل بدم' } }]);
        return { dls: __dls() }; }, [tue]);
      const open = x.dls.filter(d => !d.done);
      return { ok: open.length === 1 && open[0].date === tue, got: { tue, x } }; });

    /* ---- مثبت ۵ (گونه، راهِ ✏️): ✏️ ِ فقط «چه» روی پیامی که موعدش با «آره» ثبت شد ⇒ ثبت همان می‌ماند؛ پرسشِ «کدام روز؟» یا «گذشته» نمی‌آید ---- */
    await T('C134 a ✏️ that changes only the what keeps the booked deadline (no replace, no new day ask)', async () => {
      const tue = nextWd(td, 3);
      const x = await ev(async ([tue]) => { __wipe(); __fresh();
        await __turn('سه‌شنبه باید طرح رو تحویل بدم.', 'خب.', [{ do: 'deadline', what: 'تحویلِ طرح', date: tue }]);
        const mid = __dls(), n0 = __sys().length;
        await __edit(__U(1), 'سه‌شنبه باید بودجه رو تحویل بدم.');
        return { mid, dls: __dls(), sys: __sys().slice(n0) }; }, [tue]);
      const open = x.dls.filter(d => !d.done);
      return { ok: x.mid.length === 1 && x.mid[0].date === tue && open.length === 1 && open[0].date === tue && !x.sys.some(l => /کدام روز|گذشته —|جایگزین/.test(l)), got: { tue, x } }; });

    /* ---- منفیِ هم‌شکل ۱ (C93): «فردا نه، پس‌فردا» هنوز از روزِ گفتن (امروز) شمرده می‌شود ---- */
    await T('C134 negative (C93): «فردا نه، پس‌فردا» still counts from the day said', async () => {
      const want = add(td, 2);
      const x = await ev(async () => { __wipe(); __fresh();
        await __turn('فردا باید گزارش رو تحویل بدم.', 'خب.', [{ do: 'deadline', what: 'تحویلِ گزارش', date: APP.addDays(APP.today(), 1) }]);
        const mid = __dls();
        await __turn('فردا نه، پس‌فردا باید تحویل بدم', 'باشه.', [], false);
        await __turn('آره', 'باشه.', [], false);
        return { mid, dls: __dls(), sys: __sys().slice(-3) }; });
      const open = x.dls.filter(d => !d.done);
      return { ok: x.mid.length === 1 && x.mid[0].date === add(td, 1) && open.length === 1 && open[0].date === want, got: { want, x } }; });

    /* ---- منفیِ هم‌شکل ۲: روزِ هفتهٔ تازه + «چه» ِ تازه در یک اصلاح ⇒ روز هنوز جابه‌جا می‌شود (به هفتهٔ همان تاریخ) ---- */
    await T('C134 negative: a correction naming a new weekday AND a new what still moves the date (to the day next to it)', async () => {
      const tue = nextWd(td, 3), want = sameWeek(tue, 4, td);
      const x = await ev(async ([tue]) => { __wipe(); __fresh();
        await __turn('باید سه‌شنبه طرح رو تحویل بدم.', 'خب.', [{ do: 'deadline', what: 'تحویلِ طرح', date: tue }]);
        await __turn('نه، چهارشنبه بودجه رو باید تحویل بدم', 'فرستادم.', [{ do: 'coach_state', retract: { msg: 'باید سه‌شنبه طرح رو تحویل بدم', what: 'fact', key: 'deadline:d1', fix: 'چهارشنبه بودجه', old: 'سه‌شنبه طرح' } }]);
        return { dls: __dls() }; }, [tue]);
      const open = x.dls.filter(d => !d.done);
      /* فقط روز سنجیده می‌شود (C134 ِ منفی): بازنویسیِ «چه» وقتی متنِ رکورد («تحویلِ طرح») تکهٔ پیشینِ کامل («سه‌شنبه طرح») را ندارد سازوکارِ جایگزینیِ تکه است، نه C134 */
      return { ok: open.length === 1 && open[0].date === want, got: { tue, want, x } }; });

    await ctx.close();
  }
  console.log(J(res, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
