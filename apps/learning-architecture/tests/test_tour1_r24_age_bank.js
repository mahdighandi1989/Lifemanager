// تورِ پولیا (دستهٔ ۱، دورِ ۲۴، سهمِ «age») — بانکِ مستقلِ tests/variants/VARIANTS_R24.json، همهٔ ورودی‌های R5.age_register
//  هر ورودی با متنِ خودش به یک داور بسته است (نه شماره — بانک ممکن است شماره‌گذاریِ تازه بگیرد)؛ ورودیِ بی‌داور خطاست تا هیچ ورودیِ تازه‌ای بی‌صدا رد نشود.
//  ساعتِ صفحه یخ زده (D0)؛ «شنبهٔ بعد» از همان D0 حساب می‌شود، نه از تقویمِ واقعی (درسِ بانکِ #87).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS24, path.join(__dirname, 'variants', 'VARIANTS_R24.json')].find(f => f && fs.existsSync(f));
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const passed = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const D0 = '2026-10-25';
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(D0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; APP.today = () => D0; APP.HOST = null;
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, reply, actions) => { const n0 = __calls.length; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; return (__calls.slice(n0)[0] || {}).user || ''; };
    window.__reset = (prof) => { ['achat', 'eprog', 'eprob', 'psyans', 'fcast'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur');
      const st = APP.S.settings(); st.profile = prof || {}; delete st.psyOpen; APP.S.saveSettings(st); APP.go('home'); APP.ASSIST.newSession(); };
    window.__cur = () => APP.ASSIST.cur();
    window.__shown = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => APP.ASSIST.regSys(__cur(), m.text));
    window.__card = (vals) => { const AS = APP.ASSIST, s = __cur(); const el = (AS.logHooks || []).map(f => { try { return f(s); } catch (e) { return null; } }).filter(Boolean).find(x => x.classList && x.classList.contains('age-ask'));
      if (!el) return null; document.body.appendChild(el); const out = [];
      for (const v of vals) { const inp = el.querySelector('input'); inp.value = v; [...el.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click(); out.push({ err: el.querySelector('.age-err').textContent, q: el.querySelector('b').textContent, b: APP.AGE.birth() }); }
      el.remove(); return out; };
  }, D0);
  const ev = (fn, arg) => p.evaluate(fn, arg);
  const reset = (prof) => ev((pr) => __reset(pr), prof || {});
  const turn = (t, r, a) => ev(([t, r, a]) => __turn(t, r, a), [t, r || '', a || []]);
  const shown = () => ev(() => __shown());
  const card = (v) => ev((v) => __card(v), v);
  const birth = () => ev(() => APP.AGE.birth());
  const ISO = /[0-9۰-۹]{4}-[0-9۰-۹]{2}-[0-9۰-۹]{2}/;
  const confs = (L) => L.filter(x => /تاریخِ تولد/.test(x) && /ثبت شد/.test(x));
  const SH = 'سلام. ببخشید، می‌خواستم بپرسم شما می‌توانید کمکم کنید؟';   // پیامی با «شما»

  const H = [
    ['۱۲ اردیبهشت ۱۳۳۸', async () => { await reset(); await turn(SH, 'بفرمایید.'); const r = await card(['۱۲ اردیبهشت ۱۳۳۸']); const L = confs(await shown()), ag = await ev(() => [APP.AGE.age(), (APP.AGE.band(APP.AGE.age()) || {}).id]);
      return r && r[0].b === '1959-05-03' && L.length === 1 && /تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸/.test(L[0]) && !ISO.test(L[0]) && !/میلادی/.test(L[0]) && ag[0] === 67 && ag[1] === 'elder' || JSON.stringify([r, L, ag]); }],
    ['۵ تیر ۱۳۲۴ به دنیا اومدم', async () => { await reset(); await turn('۵ تیر ۱۳۲۴ به دنیا اومدم', 'باشه.', [{ do: 'birth', date: '۵ تیر ۱۳۲۴' }]); const L = confs(await shown());
      return await birth() === '1945-06-26' && L.length === 1 && !ISO.test(L[0]) || JSON.stringify([await birth(), L]); }],
    ['[birth card] 96/2/30', async () => { await reset(); await turn('سلام', 'سلام.'); const r = await card(['96/2/30']); const band = await ev(() => (APP.AGE.band(APP.AGE.age()) || {}).id);
      return r && r[0].b === '2017-05-20' && band === 'child' || JSON.stringify([r, band]); }],
    ['[birth card] ۱۷ اسفند ‖', async () => { await reset(); await turn('سلام', 'سلام.'); const r = await card(['۱۷ اسفند', '88']);
      return r && r[0].b === '' && /۱۷ اسفند/.test(r[0].q) && r[1].b === '2010-03-08' || JSON.stringify(r); }],
    ['[birth card] 17 Esfand 1388', async () => { await reset(); await turn('سلام', 'سلام.'); const r = await card(['17 Esfand 1388']); return r && r[0].b === '2010-03-08' || JSON.stringify(r); }],
    ['U: هشتاد و یک سالمه', async () => { await reset(); const u = await turn('هشتاد و یک سالمه', 'باشه.'); const a = await ev(() => [APP.AGE.age(), (APP.AGE.band(APP.AGE.age()) || {}).id, APP.AGE.birth()]);
      return a[0] === 81 && a[1] === 'elder' && a[2] === '' && !/ممکن است کم‌سال باشد/.test(u) || JSON.stringify(a); }],
    ['[mind-card date field] ۱۳۲۴/۴/۵۱', async () => { await reset(); await turn('سلام، من ۸۱ سالمه. می‌شود بفرمایید کارنامه کجاست؟', 'بفرمایید.'); await ev(() => APP.go('mind')); await p.waitForTimeout(200);
      const e = await ev(() => { const box = document.querySelector('.psy-age'); const inp = box.querySelector('input'); inp.value = '۱۳۲۴/۴/۵۱'; [...box.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click(); const el = document.querySelector('.psy-age-err'); return [el ? el.textContent : '', APP.AGE.birth()]; });
      return e[1] === '' && /روز/.test(e[0]) && /ببینید/.test(e[0]) && !/YYYY/.test(e[0]) || JSON.stringify(e); }],
    ['U: ۸۲ سالمه (no date given)', async () => { await reset(); const u = await turn('۸۲ سالمه', 'باشه.'); const aud = u.split('\n# ').find(x => /^مخاطب/.test(x)) || '';
      return /سالمند/.test(aud) && !/از تاریخِ تولدِ ثبت‌شده/.test(aud) || aud.slice(0, 200); }],
    ['[page lines for an 81-year-old «شما» user', async () => { await reset({ birth: '1945-06-26' }); await turn(SH, 'بفرمایید.');
      const L = await ev(() => { const s = __cur(); return ['✓ تاریخِ تولدت ثبت شد: ۵ تیر ۱۳۲۴', 'سلیقه‌ات را هم بگو', 'این روز در آن ماه نیست — روز را دوباره ببین.', 'خودت فکر می‌کنی کدام گام مانده؟', 'تاریخِ دقیقِ تولدت را بنویس؟'].map(t => APP.ASSIST.regSys(s, t)).concat([APP.ASSIST.regPage('📌 برنامهٔ خودت (دیروز گفتی) — انجام شد؟')]); });
      return /تولدتان/.test(L[0]) && /سلیقه‌تان/.test(L[1]) && /ببینید/.test(L[2]) && /خودتان/.test(L[3]) && /تولدتان/.test(L[4]) && /خودتان/.test(L[5]) && !L.some(x => /(?:^|[^آ-ی‌])(?:تولدت|سلیقه‌ات|خودت|ببین)(?![آ-ی‌])/.test(x)) || JSON.stringify(L); }],
    ['U: لطفاً اینو ثبتش کن', async () => { await reset({ birth: '1944-08-01' });
      for (const t of ['سلام. نوه‌م یه معما پرسید؛ جواب رو نگو، می‌خوام خودم حل کنم.', 'یه حدس بزنم: ۲۰ مرغ و ۱۵ خرگوش.', 'زیاد شد، ۹۴ می‌خوایم.', 'پس ۲۳ و ۱۲.', 'وارسی کردم، درسته.', 'از یه راه دیگه هم همین شد.']) await turn(t, 'خوب است؛ خودتان ادامه بدهید.');
      const w = await ev(() => { const s = __cur(); s.msgs.push({ role: 'user', text: 'لطفاً اینو ثبتش کن', at: new Date().toISOString() }); APP.ASSIST._turnSession = s;
        const r = APP.ASSIST.replyCheck({ reply: 'حتماً، ثبتش می‌کنم تا فردا از رویش توضیح بدهید.', actions: [] }, { task: 'lla_assistant' }); APP.ASSIST._turnSession = null; s.msgs.pop(); return [r, APP.ASSIST.regSigns('لطفاً اینو ثبتش کن').to, APP.ASSIST.convRegister(s, '', [])]; });
      return !/«تو» بنویس/.test(w[0]) && w[1] === false && w[2] === 'shoma' || JSON.stringify(w); }],
    ['[Today and mind card for a 9-year-old]', async () => { await reset({ birth: '2017-04-03' }); const today = await ev(() => (APP.dueList() || []).map(x => x.txt || '').join(' | '));
      await ev(() => APP.go('psy_item')); await p.waitForTimeout(150); const pz = await ev(() => [!!document.querySelector('.psy-q'), document.querySelector('#main').textContent]);
      await ev(() => APP.go('mind')); await p.waitForTimeout(200); const t = await ev(() => (document.querySelector('.psy-table') || {}).textContent || '');
      return !/معمای امروز/.test(today) && !pz[0] && !/مقایسهٔ منصفانه با آن‌ها/.test(pz[1]) && /برای این سن هنجارِ معتبر در دست نیست/.test(t) || JSON.stringify([today, pz[0], t.slice(0, 200)]); }],
    ['مدرسه‌ی شهید بهشتی‌ام', async () => { await reset({ birth: '2012-03-01' }); const msg = 'من کلاس هشتمِ مدرسه‌ی شهید بهشتی‌ام';
      const r = await ev((m) => { const D = APP.AGE.privDossier({ title: 't', statement: m, events: [{ k: 'chatwork', lines: [m], src: { text: m, sess: 's' } }] }); return [D.events[0].src.text, D.events[0].lines[0], D.statement, APP.AGE.age()]; }, msg);
      return r[3] === 14 && r.slice(0, 3).every(x => !/بهشتی/.test(x) && /کلاس هشتم/.test(x)) || JSON.stringify(r); }],
    ['تا شنبه‌ی بعد تموم شه', async () => { await reset();
      await turn('پیش‌بینی می‌کنم تا شنبه‌ی بعد تموم شه', 'پیش‌بینی‌ات را نوشتم؛ موعد 2026-10-31.', [{ do: 'coach_state', guess: { text: 'تا شنبه‌ی بعد تموم شه' } }]);
      const sat = await ev((d0) => { const d = new Date(d0 + 'T12:00:00Z'); do { d.setUTCDate(d.getUTCDate() + 1); } while (d.getUTCDay() !== 6); const iso = d.toISOString().slice(0, 10); return [iso, APP.AGE.faDate(iso)]; }, D0);
      const out = await ev(() => { APP.ASSIST.toggle(true); APP.ASSIST.paint(); const t = [...document.querySelectorAll('.as-msg .as-tx')].map(x => x.textContent).join(' | ') + ' || ' + (APP.dueList() || []).map(x => [x.txt, x.sub].join(' ')).join(' | ') + ' || ' + APP.S.all('fcast').map(f => APP.fdate ? APP.fdate(f.due) : '').join(' '); APP.ASSIST.toggle(false); return t; });
      return !ISO.test(out) && (!/موعد/.test(out) || out.indexOf(sat[1]) >= 0) || JSON.stringify([sat, out.slice(0, 400)]); }],
    ['[page parsed «۱۲ اردیبهشت ۱۳۳۸» = 1959-05-03]', async () => { await reset(); await turn('تولدم ۱۲ اردیبهشت ۱۳۳۸ است.', 'باشه.', [{ do: 'birth', date: '1959-05-02' }]); const L = confs(await shown());
      return await birth() === '1959-05-03' && L.length === 1 || JSON.stringify([await birth(), L]); }],
    ['U: بذار ببینم چی میشه', async () => { await reset({ birth: '1950-01-01' }); await turn(SH, 'بفرمایید.'); await turn('بذار ببینم چی میشه', 'بفرمایید.');
      const r = await ev(() => [APP.ASSIST.regSigns('بذار ببینم چی میشه').to, APP.ASSIST.convRegister(__cur(), '', [])]); return r[0] === false && r[1] === 'shoma' || JSON.stringify(r); }],
    ['U: روتینِ صبحم به هم ریخته', async () => { const r = await ev(() => APP.ASSIST.regSigns('روتینِ صبحم به هم ریخته')); return !r.sh || JSON.stringify(r); }],
    ['[birth card] ۳۰ اسفند ۱۳۸۸', async () => { await reset(); await turn('سلام، من ۱۶ سالمه. یه سؤال دارم.', 'بگو.'); const r = await card(['۳۰ اسفند ۱۳۸۸']);
      return r && r[0].b === '' && /اسفندِ ۱۳۸۸ ۲۹ روز دارد/.test(r[0].err) && /ببین(?!ید)/.test(r[0].err) || JSON.stringify(r); }],
    ['[mind card for a 35-year-old]', async () => { await reset({ birth: '1991-01-01' });
      await ev(() => { const it = (APP.PSY.norms().items || []).find(x => x.construct === 'Gf' && APP.PSY.isAnchor(x)); APP.S.put({ id: APP.uid('pa'), type: 'psyans', item: it.id, ok: true, familiar: false, conf: 70, ms: 9000, at: new Date().toISOString(), created: APP.nowISO() }); APP.go('mind'); });
      await p.waitForTimeout(200); const t = await ev(() => { const tr = document.querySelector('.psy-table tr[data-c="Gf"]'); return tr ? tr.textContent : ''; });
      return /۳۰ تا ۳۹/.test(t) && !/هنجارِ معتبر در دست نیست/.test(t) || t.slice(0, 300); }],
    ['«تو» صدام کن', async () => { await reset({ birth: '1959-05-03' }); await turn(SH, 'بفرمایید.'); await turn('لطفاً با من راحت باش، «تو» صدام کن', 'باشه.');
      const r = await ev(() => [APP.ASSIST.convRegister(__cur(), '', []), APP.ASSIST.regSys(__cur(), 'سلیقه‌ات را هم بگو')]); return r[0] === 'to' && /سلیقه‌ات/.test(r[1]) || JSON.stringify(r); }],
    ['U: ۸۱ کیلو وزنمه', async () => { const r = await ev(() => APP.AGE.ageSaid('۸۱ کیلو وزنمه')); return r === null || String(r); }],
    ['هشتاد و یک سال پیش ساخته شده', async () => { const r = await ev(() => APP.AGE.ageSaid('این خونه هشتاد و یک سال پیش ساخته شده')); return r === null || String(r); }],
    ['U: لطفاً بگو چی کار کنم', async () => { const r = await ev(() => APP.ASSIST.regSigns('لطفاً بگو چی کار کنم')); return !r.sh && r.to || JSON.stringify(r); }],
    // R6 ورودی‌هایی که سهمِ R5 است (classify آن‌ها را به age سپرد: #138، #140)
    ['[reply with «تو» to an elder «شما» user]', async () => { await reset({ birth: '1944-08-01' }); await turn(SH, 'بفرمایید.');
      const w = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; const r = APP.ASSIST.replyCheck({ reply: 'خودت فکر می‌کنی کدام راه بهتر است؟ بگو تا ببینیم.', actions: [] }, { task: 'lla_assistant' }); APP.ASSIST._turnSession = null; return r; });
      return /«شما» بنویس/.test(w) || w; }],
    ['[reply writes «1959-05-03» to the person]', async () => { await reset(); await turn('سلام، یه سؤال دارم.', 'بگو.');
      const w = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; const r = APP.ASSIST.replyCheck({ reply: 'تاریخِ تولدت را 1959-05-03 ثبت کردم.', actions: [] }, { task: 'lla_assistant' });
        const ok = APP.ASSIST.replyCheck({ reply: 'تاریخِ تولدت را ۱۲ اردیبهشت ۱۳۳۸ ثبت کردم.', actions: [] }, { task: 'lla_assistant' }); APP.ASSIST._turnSession = null; return [r, ok]; });
      return /YYYY-MM-DD/.test(w[0]) && !/YYYY-MM-DD/.test(w[1]) || JSON.stringify(w); }],
    ['[confirmation for a child]', async () => { await reset(); await turn('من ۹ سالمه، تولدم ۳۰ اردیبهشته.', 'باشه.', [{ do: 'birth', date: '۳۰ اردیبهشت', age: 9 }]); const L = confs(await shown());
      return await birth() === '2017-05-20' && L.length === 1 && !/[0-9]{4}/.test(L[0]) || JSON.stringify([await birth(), L]); }]
  ];

  const ent = BANK.map((e, i) => Object.assign({ n: i + 1 }, e)).filter(e => e.rc === 'R5.age_register' || (e.rc === 'R6.postcheck_calibration' && /\[reply with «تو» to an elder|\[reply writes «1959-05-03»/.test(e.text)));
  if (!ent.length) errors.push('bank VARIANTS_R24.json not found or has no R5 entries');
  for (const e of ent) {
    const h = H.find(x => String(e.text).indexOf(x[0]) >= 0);
    if (!h) { errors.push('bank #' + e.n + ': no judge for «' + e.text + '»'); continue; }
    let r; try { r = await h[1](); } catch (x) { r = 'exception ' + String(x && x.message || x).slice(0, 200); }
    if (r === true) passed.push(e.n); else errors.push('bank #' + e.n + ' [' + e.kind + '] «' + e.text + '» — expect: ' + e.expect + ' — got: ' + r);
  }
  await b.close();
  console.log('R5 (+R6 #138/#140) bank: ' + passed.length + ' / ' + ent.length + ' pass');
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n- ' + errors.join('\n- ')); process.exitCode = 1; }
  else console.log('test_tour1_r24_age_bank: NO ERRORS');
})();
