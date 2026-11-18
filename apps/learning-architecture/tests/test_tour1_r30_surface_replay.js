// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «surface») — C101 (ب/ج) + C137 + C179: بازپخشِ اجرای خودِ دونده‌ها (کنترل‌های ctl و جواب‌های ضبط‌شدهٔ مدل) روی صفحهٔ ساخته‌شده و
//  سنجشِ همان نما/DOM/پرامپتی که دونده دید. fixtureها: tests/fixtures/r30_surface (ساختهٔ pack.py از T/round30X/<sid>؛ B_tB1 و A_tA1 = گام‌های fixtureِ دورهای ۲۸/۲۹ با
//  جواب‌های دورِ ۳۰ — برگه‌ها و حوزه‌ها گامِ fixture اند). ساعتِ صفحه همان ساعتِ اجرا (fx.t0)؛ هیچ تاریخی در انتظارها نیست. opt.quiesce: هر گام تا پایانِ گذرِ برگه‌ها.
//  loop: B tB1 (B30·D3 + U59 — «نه» سپس پس‌گرفتن ⇒ همان ابزار، برگه بسته؛ برچسبِ «نه» ِ او «تشخیصِ برگه» نیست) · A tA1 (A30-23 — پس‌گرفتنِ «نه» با نقل پس از بستنِ مسئله)
//  B30·D1: B s12 (نوارِ 🧭 «خودتان») · F13: A s06 (A30-1) · A26-19: A pA3 · A26-25 (C185): A aA2 · C26-18 (C186): C tC1 · C26-23/24: C aC2 · B26·D12: B bp3 · B26·D16: B aB1
//  D26-40: D aD3 · D25-17: D arD2 · B24·D16/C30-6: B s17 (یک پیکان) · C28-21: C tC1 · D28-10: D oD1e (مقصدِ 🧭) · C26-39: C s27
// LLA_FILE = ساختِ دیگر (برای قرمز بودن روی BASE30)؛ ONLY=tB1,s12,...
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r28_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r30_surface');
(async () => {
  const errors = [], info = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  const run = async (name, fx, uptoC, fn, valid, tries) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    let r = null; const b = await chromium.launch(); try { r = await replay(b, fx, { uptoC, dir: DIR, allEval: true, quiesce: true });
      /* بازپخشی که میزبانِ ساختگیِ برگه‌ها یا تاریخچهٔ همان اجرای دونده را بازنساخت (گذرِ برگه پیش/پس از بارگذاریِ دوباره) نامعتبر است، نه حکمِ صفحه — تا دو بار دوباره */
      /* merge30 gate (D aD3 under load): the harness's last «exit» reload sometimes came back with an EMPTY store (no session at all) — then the
         page rightly shows the default «تو» and the check is no page verdict. Every run must still hold the scenario's sessions (generic validity). */
      const base30 = async () => r.p.evaluate(() => APP.S.all('achat').some(s => (s.msgs || []).length > 0)).catch(() => false);
      if ((!(await base30()) || (valid && !(await valid(r).catch(() => false)))) && (tries || 0) < 2) { info[name + '_harnessRetry'] = (tries || 0) + 1; await r.close().catch(() => { }); await b.close(); return run(name, fx, uptoC, fn, valid, (tries || 0) + 1); }
      if (!(await base30())) { errors.push(name + ' — harness invalid: the replay lost the scenario store after ' + ((tries || 0) + 1) + ' tries (no page verdict)'); return; }
      info[name] = await fn(r); if (r.errors.length) errors.push(name + ' page errors: ' + r.errors.slice(0, 3).join(' | ')); }
    catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } finally { if (r) await r.close().catch(() => { }); await b.close(); } };
  const sysAll = (p) => p.evaluate(() => { const o = []; APP.S.all('achat').forEach(s => (s.msgs || []).forEach(m => { if (m.role === 'sys') o.push(String(m.text || '')); })); return o; });
  const view = (p, v, a) => p.evaluate(async ([v, a]) => { APP.ASSIST.toggle(false); APP.go(v, a); await new Promise(r => setTimeout(r, 700)); return document.getElementById('main').innerText; }, [v, a || null]);
  const livePid = (p) => p.evaluate(() => (APP.liveAll ? APP.liveAll() : []).map(r => r.p.id).pop() || '');

  /* ---------- loop ---------- */
  await run('tB1', 'B_tB1', 999, async (r) => { const S = await sysAll(r.p), sh = await r.p.evaluate(async () => { const x = await APP.HOST.sheet('sh101'); return x ? x.status : ''; });
    const back = S.some(t => /🛎 ابزارِ لازم آمد: «جستجو در پایگاه‌های ثبتِ اختراع»[^\n]*گفتی همان است/.test(t));
    const falseWhy = S.filter(t => /جستجو در پایگاه‌های ثبتِ اختراع» \(تشخیصِ افتراقیِ برگه|«جستجو در پایگاه‌های ثبتِ اختراع»، «جستجوی محصول‌های ساخته‌شدهٔ مشابه» است؛ با نیازِ این گام هیچ واژهٔ مشترکی/.test(t));
    chk(back, 'B30·D3 tB1 c23 (page): her take-back «اشتباهی گفتم نه؛ همون بود» brings the same tool back :: ' + S.slice(-4).join(' ‖ ').slice(0, 600));
    chk(!falseWhy.length, 'B30·D3 tB1 c22 (page): no re-sweep line gives her own «نه» as the sheet\'s ruling or claims no shared word :: ' + falseWhy.join(' ‖ ').slice(0, 400));
    chk(sh === 'approved', 'U59 tB1 (page): the take-back closes sheet #101 :: ' + sh);
    return { back, sh }; }, async (r) => r.p.evaluate(() => (APP.PRE.sysAll() || []).length > 0 && Object.keys(window.__sheets || {}).length > 0 && (APP.S.all('achat').some(s => (s.msgs || []).some(m => /🛎 ابزارِ لازم آمد: «جستجو در پایگاه/.test(m.text || ''))))));

  await run('tA1', 'A_tA1', 999, async (r) => { const S = await sysAll(r.p), sh = await r.p.evaluate(async () => { const x = await APP.HOST.sheet('sh102'); return x ? x.status : ''; });
    const ok = S.some(t => /↩ پس‌گرفتنِ «نه» ثبت شد/.test(t)) && sh === 'approved';
    chk(ok, 'A30-23 tA1 p21 (page): a quoted take-back of «نه، همون نیست» after the problem closed is recorded and closes sheet #102 :: ' + JSON.stringify({ sh, last: S.slice(-2) }).slice(0, 500)); return { ok, sh }; },
    /* تاریخچهٔ اجرای دونده: ابزارِ ثبتِ اختراع «رسید» و «نه» ِ او یک ابزارِ تنها را رد کرد (نه گرهٔ سه‌تایی) */
    async (r) => r.p.evaluate(() => (APP.PRE.sysAll() || []).some(x => (x.e.rejHist || []).some(h => !h.alts && h.was === 'arrived'))));

  /* ---------- B30·D1 ---------- */
  await run('s12', 'B_s12', 999, async (r) => { const t = await view(r.p, 'dossier', await livePid(r.p)), L = (t.match(/[^\n]*مانده:[^\n]*/g) || []);
    const ok = L.length > 0 && L.every(l => !/خودت(?![ا-ی])/.test(l)); chk(ok, 'B30·D1 s12 (page): the 🧭 strip follows her «شما» register :: ' + L.join(' ‖ ').slice(0, 300)); return { ok }; });

  /* ---------- F13 ---------- */
  await run('s06', 'A_s06', 163, async (r) => { const P = await r.p.evaluate(() => APP.S.all('achat').map(s => Object.values((s.coach || {}).probs26 || {}).map(x => x.stmt || '')).flat());
    const bad = P.filter(t => /صفحه سنجیده/.test(t)); chk(!bad.length, 'A30-1 s06 p14 (page): the system question after a data clause is no chat problem :: ' + bad.join(' ‖ ')); return { n: P.length }; });
  await run('oD1e', 'D_oD1e', 1, async (r) => { const d = await r.p.evaluate(() => { try { return APP.ROUTE.model(APP.ASSIST.cur().id).dest; } catch (e) { return 'ERR'; } });
    chk(!/ساخته شده|سامانه/.test(d), 'D28-10 oD1e c1 (page): «این سامانه اصلاً … ساخته شده؟» is no 🧭 destination :: ' + d); return { d }; });

  /* ---------- tail ---------- */
  await run('pA3', 'A_pA3', 999, async (r) => { const Q = await r.p.evaluate(() => { const q = APP.MIND.phases(); return { open: q.prereq.open.map(x => x.concept), learned: q.prereq.learned.map(x => x.concept) }; });
    const ok = !Q.open.some(c => /فیثاغورس/.test(c)) && Q.learned.some(c => /فیثاغورس/.test(c)); chk(ok, 'A26-19 pA3 (page): a cascaded learned prerequisite is learned in the mind card :: ' + JSON.stringify(Q)); return Q; });
  await run('aA2', 'A_aA2', 999, async (r) => { const t = await view(r.p, 'mind'), l = (t.match(/[^\n]*بیشترین احتمالِ ضعیف‌ترین بودن[^\n]*/) || [''])[0];
    const back = await r.p.evaluate(() => { const x = APP.MIND.phases().rows.filter(r => r.id === 'back')[0]; return x ? [x.k, x.n] : null; });
    const ok = /بر پایهٔ [۰-۹]+ داوریِ همین مرحله/.test(l) && back && back[1] === 2 && back[0] === 1;
    chk(ok, 'A26-25 / C185 aA2 (page): only look-back verdicts count for بازنگری and the line shows its basis :: ' + JSON.stringify({ l, back })); return { back }; });
  await run('tC1', 'C_tC1', 20, async (r) => { const P6 = (r.calls[5] || {}).user || '', tq = (P6.split('\n').filter(l => /\*\*پرسشِ این نوبت همین است/.test(l))[0] || '');
    const ok = !/پرسشِ تشخیصیِ «نقطهٔ شبنم[^\n]*\(«صبحِ یک روزِ سرد/.test(tq) && /پیش‌تر جواب داد/.test(tq);
    chk(ok, 'C26-18 / C186 tC1 p6 (prompt): the answered diagnostic is not the turn question again :: ' + tq.slice(0, 260));
    const t = await r.p.evaluate(() => { const b = document.querySelector('.backbtn'); return b ? b.textContent : ''; }); chk(!/««|»»/.test(t), 'C28-21 tC1 (page): back button quotes once :: ' + t);
    return { ok }; });
  await run('aC2', 'C_aC2', 8, async (r) => { const tq = i => (((r.calls[i] || {}).user || '').split('\n').filter(l => /\*\*پرسشِ این نوبت همین است/.test(l))[0] || '');
    const a = tq(0), b2 = tq(1); chk(/پرسشِ روش/.test(a) && !/به تعریف‌ها برگرد/.test(a), 'C26-23 aC2 p1 (prompt): «بازنگری دقیقاً یعنی چی؟» is a method question :: ' + a.slice(0, 200));
    chk(/پرسشِ روش/.test(b2) && !/ثابتش می‌کنی یا با مثالِ نقض/.test(b2), 'C26-24 aC2 p2 (prompt): her guess of the stage meaning is not a claim :: ' + b2.slice(0, 200)); return {}; });
  await run('bp3', 'B_bp3', 999, async (r) => { const L = (await sysAll(r.p)).filter(t => /این کم‌هوشی نیست/.test(t));
    chk(L.length && /فیثاغورس/.test(L[L.length - 1]), 'B26·D12 bp3 s19 (page): the self-label line names the prerequisite he spoke of :: ' + L.join(' ‖ ').slice(0, 300)); return {}; });
  await run('aB1', 'B_aB1', 999, async (r) => { const L = (await sysAll(r.p)).filter(t => /تولد/.test(t));
    chk(L.some(t => /از پیش ثبت است/.test(t)), 'B26·D16 aB1 p9 (page): the stored birth date said again gets a page line :: ' + L.join(' ‖ ')); return {}; });
  await run('aD3', 'D_aD3', 999, async (r) => { const t = await r.p.evaluate(async () => { APP.render(); await new Promise(r => setTimeout(r, 700)); return document.querySelector('nav.side').innerText; });
    chk(!/از کجا شروع کنی(?![د])|برای یادگرفتنِ خودت(?!ان)/.test(t), 'D26-40 aD3 (page): the side menu follows her «شما» register :: ' + (t.match(/[^\n]*(?:کنی|خودت)[^\n]*/g) || []).join(' ‖ ').slice(0, 300)); return {}; });
  await run('arD2', 'D_arD2', 2, async (r) => { const t = await r.p.evaluate(async () => { APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 700)); const e = document.querySelector('.as-pin'); return e ? e.innerHTML : ''; });
    chk(/<bdi dir="ltr"[^>]*>[^<]*√\(h² \+ d²\)/.test(t), 'D25-17 arD2 s1 (page): the formula in the session pin is an LTR isolate :: ' + t.slice(0, 300)); return {}; });
  await run('s17', 'B_s17', 999, async (r) => { const t = await view(r.p, 'dossier', await livePid(r.p)), bad = (t.match(/[^\n]*⇐[^\n]*→[^\n]*/g) || []);
    chk(!bad.length, 'B24·D16 s17 (page): no history line carries both arrows :: ' + bad.slice(0, 2).join(' ‖ ').slice(0, 300)); return { n: bad.length }; });

  await run('s27', 'C_s27', 12, async (r) => { const t = await r.p.evaluate(async () => { APP.ASSIST.toggle(false); APP.go('lprob', window.__PID || APP.state.arg); await new Promise(r => setTimeout(r, 1000)); const e = document.querySelector('.lp-win'); return e ? e.innerText : ''; });
    chk(t && !/ثابتش کرد/.test(t) && !/^✓/.test(t) && /نسنجید/.test(t), 'C26-39 s27 p4 (page): a written proof is not «✓ ثابتش کردید» — the page did not check it :: ' + t.slice(0, 200)); return {}; });

  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
