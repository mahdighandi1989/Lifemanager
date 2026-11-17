// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «surface») — بازپخشِ اجراهای خودِ دونده‌ها روی صفحهٔ ساخته‌شده (کتابخانه؛ آزمون نیست) — C101 (ج).
//  همان tour1_r26_replay.js با سه فرق که بازپخشِ اجراهای «حلقهٔ قلمرو» (tA1، tB1، oD1) لازم دارد:
//   • میزبانِ برگه‌ها مثلِ میزبانِ واقعی پایدار است: برگه‌ها و یادداشت‌ها پس از بارگذاریِ دوباره می‌مانند (localStorage ‹__sheets28›) و شمارهٔ برگهٔ تازه از بزرگ‌ترینِ موجود؛
//     status(id, open|approved) همان رفتارِ app/routes/inspection.py.
//   • یادداشت‌های روتین و ساختِ حوزه‌های تازه (که دونده با جابه‌جاییِ صفحه می‌ساخت) گامِ fixture اند (mkfx: eval ِ __sheets و ‹__areas28› + loader در inject).
//   • opt.uptoC: تا شمارهٔ کنترلِ خودِ دونده (c)، نه شمارهٔ گام.
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const FXDIR = path.join(__dirname, 'fixtures', 'r28_surface');
const wait = ms => new Promise(r => setTimeout(r, ms));
const PID = /pb_l_[a-z0-9]{6,}/g;
const ACT = /__fx\.set|__fx\.btn|\.click\(|dispatchEvent|__adv|liveCopyAnswer|retractEdit|clock\.set|APP\.go\(|APP\.S\.put|APP\.render\(|localStorage\.(?:set|remove)/;

async function replay(browser, name, opt) {
  opt = opt || {};
  const fx = JSON.parse(fs.readFileSync(path.join(opt.dir || FXDIR, name + '.json'), 'utf8'));   // opt.dir: دورِ ۲۷ (tests/fixtures/r27_correction)
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const p = await ctx.newPage(); const errors = [], calls = [], extra = []; let ri = 0;
  p.on('pageerror', e => errors.push('pageerror: ' + e.message)); const warns = [];
  p.on('console', m => { if ((m.type() === 'warning' || m.type() === 'error') && !/fonts|ERR_|net::/.test(m.text())) warns.push(m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('dialog', d => { d.dismiss().catch(() => { }); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  /* شناسه‌های ضبط‌شده به ترتیبِ نخستین دیده‌شدن ⇐ شناسه‌های این اجرا به ترتیبِ ساخت */
  const orig = [], map = {};
  const note = (t) => { (String(t || '').match(PID) || []).forEach(id => { if (orig.indexOf(id) < 0) orig.push(id); }); };
  const sync = async () => { let cur = []; try { cur = await p.evaluate(() => (APP.liveAll ? APP.liveAll() : []).map(r => ({ id: r.p.id, at: r.created || r.at || '' })).sort((a, b) => String(a.at).localeCompare(String(b.at))).map(x => x.id)); } catch (e) { }
    const known = Object.values(map); cur.filter(id => known.indexOf(id) < 0).forEach(id => { const o = orig.filter(x => !map[x])[0]; if (o) map[o] = id; }); };
  const sub = (t) => String(t).replace(PID, id => map[id] || id);
  /* جواب‌ها با «نوبتِ تازه»ی همان فراخوان جفت می‌شوند (نه با شمارهٔ فراخوان): اگر اصلاحِ صفحه یک فراخوان کم یا زیاد کند، جوابِ ضبط‌شدهٔ هر نوبت باز به همان نوبت می‌رسد؛ فراخوانِ بی‌جفت جوابِ خنثی می‌گیرد */
  const used = {}, nb = (t) => String(t).trim().replace(PID, 'PID').replace(/[\u{10000}-\u{10FFFF}]/gu, ''), keyOf = (u) => { u = String(u || ''); return (u.indexOf('# نوبتِ تازه') >= 0 ? nb(u.split('# نوبتِ تازه').pop()).slice(0, 240) : 'RAW:' + nb(u).slice(0, 120)); };
  const NEUTRAL = '{"reply":"باشه.","status":"related","memory":"m","actions":[]}';
  await p.exposeFunction('__ask26', async (payload) => { ri++; calls.push({ user: String(payload.user || ''), task: payload.task });
    let t = null; if (fx.keys) { const k = keyOf(payload.user); for (let j = 0; j < fx.replies.length; j++) if (!used[j] && fx.keys[j] === k) { used[j] = 1; t = fx.replies[j]; break; } if (t == null && extra.length) t = extra.shift(); }
    else { t = fx.replies[ri - 1]; }
    if (t == null || t === '') t = NEUTRAL; note(t); await sync(); return sub(t); });
  await p.clock.install({ time: new Date(fx.t0) });
  if (fx.inject) await ctx.addInitScript(fx.inject + ';window.__off=window.__off||(' + (fx.base || 0) + '*864e5);');
  const boot = async () => { await p.evaluate(() => { try { window.__save28 && window.__save28(); } catch (e) { } }).catch(() => { }); await p.goto(FILE); await p.waitForSelector('.nav'); if (fx.inject) await p.evaluate(fx.inject);
    await p.evaluate(() => { APP.S.loaded = true; try { window.__sheets = JSON.parse(localStorage.getItem('__sheets28') || 'null') || window.__sheets || {}; } catch (e) { window.__sheets = window.__sheets || {}; }
      let num = Math.max(100, ...Object.values(window.__sheets).map(x => +x.number || 0));
      window.__save28 = () => { try { localStorage.setItem('__sheets28', JSON.stringify(window.__sheets || {})); } catch (e) { } };   // merge28 gate: write at once, not only every 200 ms (a reload under load lost the last write)
      if (!window.__sv28) window.__sv28 = setInterval(() => { try { localStorage.setItem('__sheets28', JSON.stringify(window.__sheets || {})); } catch (e) { } }, 200);
      const ask = async (sys, user, opts) => { const t = await window.__ask26({ user, task: (opts || {}).task || '' }); return opts && opts.withMeta ? { text: t, files: [] } : t; };
      APP.HOST = { ai: ask, files: async () => [], mirror: async () => ({ ok: true }), mirrorList: async () => [], mirrorSync: async () => ({ ok: true }),
        report: async (o) => { const id = 'sh' + (++num); __sheets[id] = { id, number: num, status: 'open', urgent: o.urgent, title: o.text.split('\n')[0], text: o.text, notes: [{ id: 'n0', by: 'owner', at: new Date().toISOString(), text: o.text }] }; window.__save28(); return { id, number: num }; },
        sheets: async () => Object.values(__sheets).map(s => ({ id: s.id, number: s.number, title: s.title, status: s.status, urgent: s.urgent })), sheet: async (id) => __sheets[id] || null,
        note: async (id, text) => { const s = __sheets[id]; if (s) { s.notes.push({ id: 'o' + Date.now(), by: 'owner', at: new Date().toISOString(), text }); if (s.status === 'answered' || s.status === 'approved') s.status = 'open'; } window.__save28(); return { ok: true }; },
        status: async (id, st) => { if (st !== 'open' && st !== 'approved') throw new Error('422'); if (__sheets[id]) __sheets[id].status = st; window.__save28(); return { ok: true }; },
        remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
      APP.callAI = ask; APP.render(); }); };
  const settle = async () => { try { await p.waitForFunction(() => !(window.APP && APP.ASSIST && APP.ASSIST.busy && APP.ASSIST.busy()), null, { timeout: 15000 }); } catch (e) { } await wait(120); };
  await boot();
  const N = opt.uptoC ? fx.steps.filter(x => (x.c || 0) <= opt.uptoC).length : Math.min(opt.upto || fx.steps.length, fx.steps.length), log = [];
  for (let c = 0; c < N; c++) { const cmd = fx.steps[c] || {}; let r = '';
    try {
      Object.keys(cmd).forEach(k => note(typeof cmd[k] === 'string' ? cmd[k] : JSON.stringify(cmd[k]))); await sync();
      if (cmd.clock) { const cur = await p.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
        if (cmd.clock > cur) { await p.clock.setSystemTime(new Date(cmd.clock + 'T09:00:00')); if (cmd.reloadAfterClock !== false) { const st = await p.evaluate(() => ({ v: APP.state.view, a: APP.state.arg, s: APP.state.sub })).catch(() => null); await boot(); await settle(); if (st) await p.evaluate((st) => { APP.go(st.v, st.a, st.s); }, st).catch(() => { }); } } }
      if (cmd.eval0) await p.evaluate(sub(cmd.eval0));   // تعریفِ ابزارهای خودِ دونده (__setf، __btn …)
      if (cmd.say != null) { await p.evaluate(async (t) => { const pn = document.querySelector('.as-panel'); if (!pn || pn.hidden) APP.ASSIST.toggle(true); await APP.ASSIST.send(t || ''); }, cmd.say); await settle(); }
      if (cmd.eval && (opt.allEval || ACT.test(cmd.eval) || /__[a-z]\w*\(/.test(cmd.eval))) {   // دورِ ۲۹ (surface): opt.allEval — کنترل‌هایی که با ابزارهای خودِ دونده (F/P/B ِ eval0) فرم پر می‌کنند هم اجرا شوند
       r = await p.evaluate(sub(cmd.eval)); await settle(); }
      if (cmd.click) { await p.click(cmd.click, { timeout: 8000 }); await wait(300); await settle(); }
      if (cmd.fill) { await p.fill(cmd.fill[0], cmd.fill[1], { timeout: 8000 }); await wait(300); await settle(); }
      if (cmd.reload) { await boot(); await settle(); }
    } catch (e) { r = 'ERR ' + String(e.message || e).slice(0, 300); }
    await sync(); log.push({ c: c + 1, k: Object.keys(cmd).join('+'), r: typeof r === 'string' ? r.slice(0, 200) : '' });
  }
  /* نوبتِ تازه با جوابِ دلخواه (برای بدلِ منفیِ همان سناریو) */
  const turn = async (text, reply) => { extra.push(typeof reply === 'string' ? reply : JSON.stringify(Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, reply || {}))); const n0 = calls.length;
    await p.evaluate(async (t) => { await APP.ASSIST.send(t); }, text); await settle(); return calls.slice(n0).map(x => x.user); };
  const sys = (n) => p.evaluate((n) => { const s = APP.ASSIST.cur(); return s ? s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-(n || 3)) : []; }, n || 3);
  const lastPrompt = () => (calls[calls.length - 1] || {}).user || '';
  return { p, ctx, fx, calls, errors, warns, log, map, turn, sys, lastPrompt, settle, close: () => ctx.close() };
}
module.exports = { replay, FXDIR };
