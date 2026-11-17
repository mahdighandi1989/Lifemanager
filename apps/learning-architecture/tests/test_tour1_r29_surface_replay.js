// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «surface») — C101 (ج) + C137: بازپخشِ اجرای خودِ دونده‌ها (کنترل‌های ctl و جواب‌های ضبط‌شدهٔ مدل) روی صفحهٔ ساخته‌شده،
//  در هر گروهی که خانواده را نشان داد، و سنجشِ همان نما یا DOM که دونده دید. fixtureها: tests/fixtures/r29_surface (ساختهٔ pack.py از T/round29X/<sid>).
//  ساعتِ صفحه همان ساعتِ اجرا (fx.t0) است؛ هیچ تاریخی در انتظارها نیست.
//  F13 (پرسش دربارهٔ سامانه مسئله / مقصدِ 🧭 نمی‌شود):  A pwA1 (A29-26)  ·  B oB1 c17 (B27·D14)  ·  C pC2 c41 (C27-6)  ·  D oD1b c1 (D28-10، شکلِ «این سامانه اصلاً … ساخته شده؟»)
//  F14 (برچسبِ قاعده و شناسهٔ خام در نمای او):         A s09, aA1 (A29-23 «(C57)»)  ·  B s13 c28, s18 c45 («(it1_…)»), nB1, nB2 («(C57)»)
//  F19 (نقشهٔ «خودِ سامانه» ِ دستیار از ثبت‌گاهِ قاعده‌ها): A oA1 p38 (A29-29؛ بانکِ مالک ۴۲/۶۴/۶۵)
//  loop (B27·D16): B tB1 c17 — B_tB1n = B_tB1s ِ دورِ ۲۸ بی «سرکشیِ اجباری» ِ c17 (همان کارِ دونده: جابه‌جاییِ صفحه، یادداشتِ روتین، بازکردنِ «امروز») — صفحه خودش می‌خواند و می‌پرسد.
// LLA_FILE = ساختِ دیگر (برای قرمز بودن روی BASE29)؛ ONLY=pwA1,oB1,...
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r28_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r29_surface');
(async () => {
  const errors = [], info = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  const run = async (name, fx, uptoC, fn, dir, noAll) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    let r = null; const b = await chromium.launch(); try { r = await replay(b, fx, { uptoC, dir: dir || DIR, allEval: !noAll });
      /* as in test_tour1_r28_surface_replay (merge28 gate): a run whose HARNESS lost its fake sheet store (or never filed the scenario's sheet #101 — the setup, not the verdict under test) is invalid, not a page verdict — replayed (at most twice) */
      if (/^B_tB1/.test(fx) && (run.tries || 0) < 2 && await r.p.evaluate(() => !Object.keys(window.__sheets || {}).length || !(APP.PRE.sysAll() || []).length).catch(() => false)) { run.tries = (run.tries || 0) + 1; info[name + '_harnessRetry'] = run.tries; await r.close().catch(() => { }); await b.close(); r = null; return run(name, fx, uptoC, fn, dir, noAll); }
      info[name] = await fn(r); if (r.errors.length) errors.push(name + ' page errors: ' + r.errors.slice(0, 3).join(' | ')); }
    catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } finally { if (r) await r.close().catch(() => { }); await b.close(); } };
  const view = (p, v, a) => p.evaluate(async ([v, a]) => { APP.ASSIST.toggle(false); APP.go(v, a); await new Promise(r => setTimeout(r, 600)); return document.getElementById('main').innerText; }, [v, a || null]);
  /* 📜 ِ همهٔ مسئله‌های همین گفت‌وگو (گزینهٔ «همه») + 📜 ِ هر مسئلهٔ ثبت‌شده — همان که دونده در «post 📜» دید */
  const allDossier = async (p) => { const ids = await p.evaluate(() => { const o = []; (APP.ASSIST.sessions ? APP.ASSIST.sessions() : []).forEach(s => o.push(s.id)); return o; }).catch(() => []);
    const sid = await p.evaluate(() => (APP.ASSIST.cur() || {}).id).catch(() => null); const S0 = Array.from(new Set([sid].concat(ids).filter(Boolean)));
    let out = ''; for (const id of S0) { out += '\n' + await view(p, 'dossier', id).catch(() => ''); out += '\n' + await view(p, 'dossier', id + '|all').catch(() => ''); }
    const pids = await p.evaluate(() => (APP.liveAll ? APP.liveAll() : []).map(r => r.p.id)).catch(() => []);
    for (const id of pids) out += '\n' + await view(p, 'dossier', id).catch(() => '');
    return out; };
  const sysOf = (p) => p.evaluate(() => { const o = []; (APP.ASSIST.sessions ? APP.ASSIST.sessions() : []).forEach(s => (s.msgs || []).forEach(m => { if (m.role === 'sys') o.push(APP.ASSIST.regSys ? APP.ASSIST.regSys(s, m.text) : m.text); })); return o; });
  const chatText = (p) => p.evaluate(async () => { APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 400)); const el = document.querySelector('.as-panel'); return el ? el.innerText : ''; });
  const dest = (p) => p.evaluate(() => { const s = APP.ASSIST.cur(); try { return APP.ROUTE.model(s.id).dest || ''; } catch (e) { return 'ERR ' + e.message; } });
  const RAW = /\(C[0-9]{2,3}\)|\(it[0-9]+_[a-z0-9]{3,6}\)|\bit[0-9]+_[a-z0-9]{4}\b|\(دورِ\s*[۰-۹0-9]+[،,]\s*C[0-9]+\)/;

  /* ---------- F13 ---------- */
  await run('pwA1', 'A_pwA1', 999, async (r) => { const d = await allDossier(r.p);
    const ok = !/یه نقشه از این که/.test((d.match(/↪[^\n]*/g) || []).join('\n')) && !/مسئلهٔ\s*[۰-۹]+\s*از\s*[۰-۹]+\s*در این گفت‌وگو\s*—\s*یه نقشه/.test(d) && !/«یه نقشه از این که[^»]*»\s*(?:·|—)?\s*(?:مسئله|آغاز)/.test(d);
    const n = (d.match(/مسئلهٔ\s*[۰-۹]+\s*از\s*([۰-۹]+)\s*در این گفت‌وگو/) || [])[1] || '';
    chk(ok, 'A29-26 pwA1 (page): «یه نقشه … نشونم میدی؟» is neither a chat problem nor a «↪» destination :: ' + ((d.match(/[^\n]*یه نقشه[^\n]*/g) || []).slice(0, 4).join(' | '))); return { ok, probs: n }; });

  await run('oB1', 'B_oB1', 17, async (r) => { const d = await allDossier(r.p);
    const bad = (d.match(/[^\n]*(?:آفلاین هم کار|یه روز گذشت\. چند تا سؤال)[^\n]*/g) || []).filter(l => /↪|مسئلهٔ\s*[۰-۹]+\s*از|آغازِ این مسئلهٔ گفت‌وگو/.test(l));
    const np = await r.p.evaluate((t) => APP.ASSIST.notProblem(t), r.fx.steps.find(s => s.c === 17).say);
    const ok = np && !bad.length; chk(ok, 'B27·D14 oB1 c17 (page): the questions about the page are not a chat problem / ↪ destination :: ' + JSON.stringify({ np, bad: bad.slice(0, 3) })); return { ok, np }; });

  /* C27-6 (نیمهٔ C): تکهٔ پس از بستن «مسئلهٔ گفت‌وگو» ِ تازه با 🧭 ِ خودش نمی‌سازد (دونده: s45)، و فراپرسشِ «سامانه روشی برای این داره؟» مقصد نیست */
  await run('pC2', 'C_pC2', 47, async (r) => { const d0 = await dest(r.p);
    const C = await r.p.evaluate(() => { const s = APP.ASSIST.cur(), C = s.coach || {}; return { stmt: C.stmt || '', probs: Object.values(C.probs26 || {}).map(o => o.stmt || ''), focus: APP.ASSIST.chatFocus(s) }; });
    const made = [C.stmt].concat(C.probs).filter(t => /دربارهٔ همون بخاری|کنتورِ خونه/.test(t));
    const late = (await sysOf(r.p)).some(t => /⏸ تکهٔ تازهٔ/.test(t));
    const ok = !/روشی برای این داره/.test(d0) && !made.length && late; chk(ok, 'C27-6 pC2 p13 (page): the after-closure piece is not a new chat problem with its own 🧭 (and the meta question is no destination) :: ' + JSON.stringify({ dest: d0, made, late }));
    return { ok, late, focus: C.focus }; });

  await run('oD1b', 'D_oD1b', 1, async (r) => { const d0 = await dest(r.p);
    const ok = !!d0 && !/ساخته شده|سامانه/.test(d0); chk(ok, 'D28-10 oD1b c1 (page): «این سامانه اصلاً … ساخته شده؟» is not the session 🧭 destination :: ' + d0); return { ok, dest: d0 }; });

  /* ---------- F14 ---------- */
  for (const [name, fx, upto, ids] of [['s09', 'A_s09', 999, 'A29-23'], ['aA1', 'A_aA1', 999, 'A29-23'], ['s13', 'B_s13', 28, 'B29·D1'], ['s18', 'B_s18', 45, 'B29·D1'], ['nB1', 'B_nB1', 999, 'B29·D1'], ['nB2', 'B_nB2', 999, 'B29·D1']]) {
    await run(name, fx, upto, async (r) => { const sy = (await sysOf(r.p)).join('\n'), ct = await chatText(r.p), d = await allDossier(r.p);
      const hit = (sy + '\n' + ct + '\n' + d).split('\n').filter(l => RAW.test(l));
      const prompt = r.lastPrompt(), ph = prompt.split('\n').filter(l => /^(?:سامانه:|دستیار:)/.test(l) && /\(C[0-9]{2,3}\)/.test(l));
      const ok = !hit.length && !ph.length; chk(ok, ids + ' ' + name + ' (page): no «(C57)» / «(it1_…)» in her chat, 📜 or the coach\'s quoted lines :: ' + hit.concat(ph).slice(0, 3).map(l => l.slice(0, 160)).join(' | '));
      return { ok, n: hit.length + ph.length }; });
  }

  /* ---------- F19 (A29-29; بانکِ مالک ۴۲، ۶۴، ۶۵) ---------- */
  await run('oA1', 'A_oA1', 143, async (r) => { const P = r.calls.map(c => c.user).filter(u => /سه تا سؤال دربارهٔ خودِ سامانه/.test(u.split('# نوبتِ تازه').pop())).pop() || '';
    const man = P.split('# امروز')[0], self = (man.split(/\n## /).find(x => /^خودِ سامانه/.test(x)) || '');
    const need = { b64: /پیشنهاد[^\n]*(?:کهنه|دوباره اصلاح|عددِ غلط)[^\n]*(?:بازنویسی نمی|بازنویسی نمی‌)/, b65: /به گفتهٔ[^\n]*منبع|منبع: به گفتهٔ|دادهٔ مسئله/, move: /وابسته[^\n]*(?:می‌پرسد|بپرسد)[^\n]*(?:همه|فقط)/, b42: /✏️[^\n]*(?:«نه»|نه)[^\n]*(?:↩|برگرد)/ };
    const miss = Object.keys(need).filter(k => !need[k].test(self));
    const ok = !!P && !miss.length && !/\(C[0-9]{2,3}\)/.test(self); chk(ok, 'A29-29 oA1 p38 (page): the «خودِ سامانه» map in the prompt carries the enforced rules the bank asks about :: ' + JSON.stringify({ found: !!P, miss, len: self.length }));
    return { ok, miss, selfLen: self.length }; });

  /* ---------- loop (B27·D16) ---------- */
  await run('tB1', 'B_tB1n', 17, async (r) => {
    /* هیچ «سرکشیِ اجباری» نیست: همان کاری که دونده در c17 کرد (رفتن به «امروز» و رسمِ دوباره) — صفحه خودش برگه را می‌خواند */
    await r.p.evaluate(async () => { const w = ms => new Promise(x => setTimeout(x, ms)); APP.ASSIST.toggle(false); APP.go('today'); await w(800); APP.render(); await w(800); APP.go('today'); await w(400); });
    await r.p.waitForFunction(() => { const x = APP.PRE.sysAll()[0]; return !!(x && x.e && x.e.ask); }, null, { timeout: 30000, polling: 250 }).catch(() => { });
    const e = await r.p.evaluate(() => { const x = APP.PRE.sysAll()[0]; return x ? { st: x.e.state, ask: x.e.ask ? x.e.ask.id : '' } : null; });
    const sy = await sysOf(r.p), last = sy.slice(-1)[0] || '';
    const ok = !!e && e.st === 'wait' && e.ask === 'pr_market_scan' && /^❓/.test(last);
    chk(ok, 'B27·D16 tB1 c17 (page, no forced sweep): the frame-words-only area is ASKED about, not left unread / rejected :: ' + JSON.stringify({ e, last: last.slice(0, 160) })); return { ok, e }; }, null, true);

  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
