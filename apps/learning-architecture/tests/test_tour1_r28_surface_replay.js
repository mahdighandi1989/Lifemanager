// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «surface») — C101 (ج): بازپخشِ اجرای خودِ دونده‌ها (کنترل‌های ctl و جواب‌های ضبط‌شدهٔ مدل، ai/rN.txt) روی صفحهٔ ساخته‌شده،
//  و سنجشِ همان نما یا DOM که دونده دید. fixtureها: tests/fixtures/r28_surface (ساختهٔ pack.py از T/round28X/<sid>؛ tA1x و tB1x/tB1s با یادداشت‌های روتین و
//  حوزه‌هایی که دونده با جابه‌جاییِ صفحه می‌ساخت). ساعتِ صفحه همان ساعتِ اجرا (fx.t0) است؛ هیچ تاریخی در انتظارها نیست.
//  oD1  D28-10 (c55): مقصدِ 🧭 ِ سشن پرسشِ «… خبرم می‌کنی؟» شد.          tD2  D28-19 (p1–p2 ⇒ lla_assistant) و D28-29 (p23: درخواستِ بی‌جای بازنویسیِ لحن).
//  s27  C28-6: «شما کجای آنی».                                          tA1x A28-32: «❓ … «ثبتِ اختراع و جست‌وجوی سابقه» یا «ثبتِ اختراع و جست‌وجوی سابقه»».
//  aA3  A28-31 (p8): «موعدِ «…» در موعدهای باز نیست».                   oA1  A28-36: «(دورِ ۲۷، C53)» در «🎯 دفترِ پیش‌بینی».
//  pwA2 A28-39 (p7): «(اصلاح شد ⇐ «maybe»)».                            tB1  B27·D16: با گذرِ زمان (سرکشیِ برگه) صفحه می‌پرسد؛ با زمان‌بندیِ دونده (c17 درونِ دو دقیقهٔ پس از جابه‌جاییِ صفحه) خاموش.
// LLA_FILE = ساختِ دیگر (برای قرمز بودن روی BASE28)؛ ONLY=oD1,tD2,s27,tA1,aA3,oA1,pwA2,tB1
const { chromium } = require('playwright');
const { replay } = require('./tour1_r28_replay.js');
(async () => {
  const errors = [], info = {};   // one browser per run: the 12 MB page in several contexts crashed the renderer
  const chk = (c, m) => { if (!c) errors.push(m); };
  const run = async (name, fx, uptoC, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    let r = null; const b = await chromium.launch(); try { r = await replay(b, fx, { uptoC }); info[name] = await fn(r); if (r.errors.length) errors.push(name + ' page errors: ' + r.errors.slice(0, 3).join(' | ')); }
    catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } finally { if (r) await r.close().catch(() => { }); await b.close(); } };
  const sysOf = (p) => p.evaluate(() => { const s = APP.ASSIST.cur(); return (s ? s.msgs : []).filter(m => m.role === 'sys').map(m => m.text); });
  const view = (p, v, a) => p.evaluate(async ([v, a]) => { APP.ASSIST.toggle(false); APP.go(v, a); await new Promise(r => setTimeout(r, 600)); return document.getElementById('main').innerText; }, [v, a || null]);
  const nb = (u) => String(u).split('# نوبتِ تازه').pop().trim();

  await run('oD1', 'D_oD1', 55, async (r) => { const d = await r.p.evaluate(() => { const s = APP.ASSIST.cur(); return APP.ROUTE.model(s.id).dest; });
    const ok = !/خبرم|اضافه میشه|مسئلهٔ تازه باز کنم/.test(d); chk(ok, 'D28-10 oD1 c55 (page): the session 🧭 destination is a system question :: ' + d); return { ok, dest: d }; });

  await run('tD2', 'D_tD2', 28, async (r) => { const T = r.calls.map(c => ({ t: c.task, u: nb(c.user).slice(0, 60) }));
    const p1 = T.find(x => /^سلام\. ماهِ دیگه/.test(x.u)), p2 = T.find(x => /^فردا با شرکتِ باربری/.test(x.u)), rw = r.calls.filter(c => /دو ضمیر/.test(nb(c.user))).length;
    const ok = !!p1 && !!p2 && p1.t === 'lla_coach' && p2.t === 'lla_coach' && rw === 0;
    chk(ok, 'D28-19 / D28-29 tD2 (page): p1–p2 go to the coach and no turn is sent back for a false «two pronouns» :: ' + JSON.stringify({ p1, p2, rw })); return { ok, p1: p1 && p1.t, p2: p2 && p2.t, rewrites: rw }; });

  await run('s27', 'C_s27', 999, async (r) => { const reg = await r.p.evaluate(() => APP.ASSIST.convRegister(APP.ASSIST.cur(), '', []));
    const w = await view(r.p, 'whole'), t = await view(r.p, 'today');
    const ok = reg === 'shoma' && !/کجای آنی/.test(w + t) && /جای شما در آن کجاست/.test(w) && !/مسیری که آمدی(?!د)/.test(w + t);
    chk(ok, 'C28-6 s27 (page): under «شما» the guide label and the trail are in one register :: ' + JSON.stringify({ reg, w: w.slice(0, 260) })); return { ok, reg }; });

  await run('tA1', 'A_tA1x', 58, async (r) => { await r.p.waitForFunction(() => { const s = APP.ASSIST.cur(); return s && s.msgs.some(m => m.role === 'sys' && /^❓ برگهٔ/.test(m.text)); }, null, { timeout: 20000 }).catch(() => { });   // c58: the runner's forced sweep is async
    const q = (await sysOf(r.p)).filter(t => /^❓ برگهٔ/.test(t)).pop() || '';
    const td = (await view(r.p, 'today')).split('\n').filter(l => /^❓/.test(l)).join(' | ');
    /* which candidates tie at c58 depends on the replay's timing (2 or 3); the contract is the same: no two labels alike, the twins called duplicates */
    const labs = (q.match(/«[^«»]*(?:«[^«»]*»[^«»]*)*»/g) || []).filter(x => /ثبتِ اختراع|سابقه/.test(x)), tw = labs.filter(x => /\((?:اولی|دومی|سومی)\)/.test(x));
    const ok = tw.length >= 2 && new Set(tw).size === tw.length && /تکراری/.test(q) && tw.every(x => td.indexOf(x.slice(1, -1)) >= 0 || td.indexOf(x.slice(1, 40)) >= 0);
    chk(ok, 'A28-32 tA1 c58 (page): the two same-named tools are told apart in the chat and in «امروز», and called likely duplicates (C129) :: ' + JSON.stringify({ q, td })); return { ok }; });

  await run('aA3', 'A_aA3', 17, async (r) => { const sy = await sysOf(r.p); const ok = !sy.some(t => /در موعدهای باز نیست|«what»/.test(t));
    chk(ok, 'A28-31 aA3 p8 (page): no model-only «… در موعدهای باز نیست» line in her bubble :: ' + JSON.stringify(sy.slice(-3))); return { ok }; });

  /* oA1: the replay must show the undated 🎯 the runner saw; when it does not, it is reported «not reproduced» (no pass is claimed) */
  await run('oA1', 'A_oA1', 999, async (r) => { const t = await view(r.p, 'fcast'); if (!/بی موعد/.test(t)) return { ok: null, note: 'not reproduced: no undated 🎯 in the replayed «🎯 دفترِ پیش‌بینی»' }; const ok = !/دورِ\s*[۰-۹0-9]+|\bC[0-9]{2}\b/.test(t);
    chk(ok, 'A28-36 oA1 (page): «🎯 دفترِ پیش‌بینی» shows no round or C number :: ' + (t.match(/.{0,60}(?:دورِ ۲۷|C53).{0,30}/) || ['clean'])[0]); return { ok, fc: (t.match(/بی موعد[^\n]{0,40}/) || [''])[0] }; });

  await run('pwA2', 'A_pwA2', 59, async (r) => { const sy = await sysOf(r.p); const pid = await r.p.evaluate(() => (APP.liveAll()[0] || { p: {} }).p.id); const d = pid ? await view(r.p, 'dossier', pid) : '';
    const ok = !/\bmaybe\b|\bverified\b/.test(sy.join('\n') + d); chk(ok, 'A28-39 pwA2 p7 (page): no raw verdict word in her chat or 📜 :: ' + ((sy.join('\n') + d).match(/.{0,60}(?:maybe|verified).{0,20}/) || ['clean'])[0]);
    return { ok, line: ((sy.join('\n') + '\n' + d).match(/حکمِ وارسی[^\n]{0,120}/) || [''])[0] }; });

  await run('tB1', 'B_tB1s', 17, async (r) => { const sy = await sysOf(r.p); const last = sy.slice(-1)[0] || '';
    const e = await r.p.evaluate(() => { const x = APP.PRE.sysAll()[0]; return x ? { st: x.e.state, ask: x.e.ask ? x.e.ask.id : '' } : null; });
    const ok = !!e && e.st === 'wait' && e.ask === 'pr_market_scan' && /^❓/.test(last) && /بررسیِ بازار و رقیبان/.test(last);
    chk(ok, 'B27·D16 tB1 c17 (page, sheet swept as time passes): the frame-words-only area is ASKED about, not rejected :: ' + JSON.stringify({ e, last })); return { ok, e }; });

  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
