// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «story» R6) — C101 (c) + C137: بازپخشِ صفحه‌ایِ اجراهای خودِ دونده‌ها در هر گروهی که خانواده را نشان داد
//  (همان گام‌های ctl و همان جواب‌های ضبط‌شدهٔ مدل؛ tests/fixtures/r29_story/<گروه>_<sid>.json ساخته از T/round29X/<sid>). صفحه واقعاً اجرا می‌شود؛ فقط مدل ضبط‌شده است.
//  ساعتِ صفحه همان ساعتِ اجرای دونده است (Playwright clock)؛ هیچ تاریخِ تقویمی در انتظارها نیست. شناسهٔ گفت‌وگو در کاوشِ دونده‌ها (achat_…) با گفت‌وگوی همین بازپخش
//  جایگزین می‌شود. ONLY=<پیشوندِ بخش‌ها>.
//   F15 (C138) A: s06 p9، s08، pwA2 · F18 (C149) A: s06، s09 · B: aB3، oB1، nB1، dB1 · F9 (C125) A: s09 · B: nB2 · C: aC1 · D: tD1 ·
//   F10 (C124) A: oA1 c140 · B: nB2 c18 · C: s23 c182، pwC1 c106 (کاوشِ خودِ دونده، بی تغییر) · F11 (C97) C: aC1 p25
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r29_story');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 }; const J = (x) => JSON.stringify(x); const K = {};
  const run = async (fx, upto, fn, arg) => { const R = await replay(b, fx, { dir: DIR, upto: upto || 0 }); try { const x = await R.p.evaluate(fn, arg); return { x, errors: R.errors }; } finally { await R.close(); } };
  /* همهٔ سطرهای پرونده‌های همهٔ مسئله‌ها و مسئله‌های گفت‌وگو: [پرونده، k، mid، سطرها] */
  const ALL = () => { const o = []; const ids = APP.S.all('eprob', r => r && r.live && r.p).map(r => r.p.id);
    APP.S.all('achat', x => x && x.msgs && x.msgs.length).forEach(se => { ids.push(se.id); (APP.dossier(se.id).pks || []).forEach(k => ids.push(se.id + '|' + k.pk)); });
    ids.forEach(p => { const D = APP.dossier(p); ((D && D.events) || []).forEach(e => o.push([p, e.k, (e.src && e.src.mid) || '', e.lines || [], e.title || ''])); }); return o; };
  const ALLS = '(' + ALL.toString() + ')()';
  const mark = (r) => (r[3].filter(l => /^حسابِ صفحه:/.test(l))[0] || '');
  /* C138: هر سطری که بندِ «re» را دارد، هرگز ✓ ِ کل نیست و «نسنجیده» یا ✗ دارد */
  const c138 = (R, re) => { const L = R.x.filter(r => /^c(?:calc|data|res|other|step)$/.test(r[1]) && re.test(r[3][0] || '')); return [L.length >= 1 && L.every(r => !/^حسابِ صفحه: ✓ حسابِ عددی‌اش/.test(mark(r)) && /؟ «[^»]*» نسنجیده|نسنجیده|✗/.test(mark(r))) && !R.errors.length, J(L.map(r => [r[0], r[3][0], mark(r)]))]; };
  /* C149: یک بند در یک پرونده از یک پیام دو بار (داده/حسابِ تو/کارِ دیگری) نیست */
  const dups = (R) => { const by = {}; R.x.filter(r => /^c(?:calc|data|other)$/.test(r[1]) && r[2]).forEach(r => { const k = r[0] + '#' + r[2]; (by[k] = by[k] || []).push(r[3][0] || ''); });
    const o = []; Object.keys(by).forEach(k => { const C = []; by[k].forEach(t => String(t).split(/[،,.؛!]\s*/).map(x => x.trim()).filter(x => /[0-9۰-۹]/.test(x) && x.length >= 6).forEach(x => C.push(x))); C.forEach((x, i) => { if (C.indexOf(x) !== i) o.push(k + ' :: ' + x); }); }); return o; };

  /* ---------- F15 / C138 (S1 A29-1) — A ---------- */
  K.F15_A_s06 = async () => { const R = await run('A_s06', 0, ALLS); return c138(R, /نصفش هم میشه/); };
  K.F15_A_s08 = async () => { const R = await run('A_s08', 0, ALLS); return c138(R, /۸ لیتر اضافه میاد/); };
  K.F15_A_pwA2 = async () => { const R = await run('A_pwA2', 0, ALLS); return c138(R, /۳ تا کم میاد/); };
  /* ---------- F18 / C149 (A29-2; B29·D2) — A, B ---------- */
  K.F18_A_s06 = async () => { const R = await run('A_s06', 0, ALLS); const d = dups(R); const dc = R.x.filter(r => r[1] === 'cdata' && /[×÷=]/.test(r[3][0] || ''));
    return [!d.length && !dc.length && !R.errors.length, J({ d, dc: dc.map(r => r[3][0]) })]; };
  K.F18_A_s09 = async () => { const R = await run('A_s09', 0, ALLS); const d = dups(R); return [!d.length && !R.errors.length, J(d)]; };
  const FC = /مطمئن|پیش[‌\s]?بینیم|احتمالش/;
  const noFcData = (fx) => async () => { const R = await run(fx, 0, ALLS); const L = R.x.filter(r => r[1] === 'cdata' && FC.test(r[3][0] || '') && /[0-9۰-۹]+\s*(?:درصد|٪)|پیش[‌\s]?بینیم/.test(r[3][0] || ''));
    return [!L.length && !R.errors.length, J(L.map(r => r[3][0]))]; };
  K.F18_B_aB3 = noFcData('B_aB3'); K.F18_B_oB1 = noFcData('B_oB1'); K.F18_B_nB1 = noFcData('B_nB1'); K.F18_B_dB1 = noFcData('B_dB1');
  /* ---------- F9 / C125 — A, B, C, D ---------- */
  K.F9_A_s09 = async () => { const R = await run('A_s09', 0, ALLS); const o = R.x.filter(r => r[1] === 'cother').map(r => r[3][0]), m = R.x.filter(r => /^c(?:data|calc|res)$/.test(r[1]));
    const src = m.some(r => r[1] === 'cdata' && /فروشندهٔ آرد/.test(r[3][0]) && r[3].some(l => /منبع: به گفتهٔ «فروشندهٔ»/.test(l)));
    return [o.some(t => /۴۲۵٫۶ × ۳۲/.test(t)) && !m.some(r => /داداشم/.test(r[3][0] || '')) && !o.some(t => /فروشنده|مامانم/.test(t)) && src && !R.errors.length, J({ o, m: m.map(r => [r[1], r[3].join(' ¦ ').slice(0, 150)]) })]; };
  K.F9_B_nB2 = async () => { const R = await run('B_nB2', 0, ALLS); const o = R.x.filter(r => r[1] === 'cother').map(r => r[3][0]), m = R.x.filter(r => /^c(?:data|calc|res)$/.test(r[1]));
    return [o.some(t => /\+ ۱۲ درصد/.test(t)) && !o.some(t => /همسایه|۲ × ۶۰۰/.test(t)) && !m.some(r => /داداشم/.test(r[3][0] || '')) && !R.errors.length, J({ o, m: m.map(r => [r[1], r[3][0]]) })]; };
  K.F9_C_aC1 = async () => { const R = await run('C_aC1', 0, ALLS); const o = R.x.filter(r => r[1] === 'cother').map(r => r[3][0]), m = R.x.filter(r => /^c(?:data|calc|res)$/.test(r[1]));
    return [!o.some(t => /بابام/.test(t)) && m.some(r => /۴ × ۱۲ = ۴۸/.test(r[3][0] || '')) && o.some(t => /۶ × ۱۲ = ۷۰/.test(t)) && !m.some(r => /داداشم (?:یه حساب|حساب کرد)/.test(r[3][0] || '')) && !R.errors.length, J({ o, m: m.map(r => [r[1], r[3][0]]) })]; };
  K.F9_D_tD1 = async () => { const R = await run('D_tD1', 0, ALLS); const o = R.x.filter(r => r[1] === 'cother'), m = R.x.filter(r => /^c(?:data|calc|res)$/.test(r[1]));
    return [o.some(r => /۱۸ × ۲۰ = ۳۸۰/.test(r[3][0]) && /✗/.test(mark(r))) && !o.some(r => /مامانم|اوستا/.test(r[3][0])) && !m.some(r => /داداشم/.test(r[3][0] || '')) && !R.errors.length, J({ o: o.map(r => [r[3][0], mark(r)]), m: m.map(r => [r[1], r[3][0]]) })]; };
  /* ---------- F10 / C124 — A, B, C: کاوشِ خودِ دونده (همان eval، فقط شناسهٔ گفت‌وگو) ---------- */
  const probe = (f) => fs.readFileSync(path.join(DIR, f), 'utf8');
  K.F10_A_oA1 = async () => { const R = await run('A_oA1', 139, probe('A_oA1_c140.js')); return [/همه با هم/.test(R.x) && /فقط گامِ/.test(R.x) && /هیچ‌کدام/.test(R.x) && !R.errors.length, String(R.x).slice(0, 600)]; };
  K.F10_B_nB2 = async () => { const R = await run('B_nB2', 17, probe('B_nB2_c18.js')); const x = JSON.parse(R.x); return [x.bb.some(t => /^همه با هم/.test(t)) && x.bb.some(t => /^فقط گامِ ۲/.test(t)) && x.bb.some(t => /^هیچ‌کدام/.test(t)) && !R.errors.length, R.x.slice(0, 600)]; };
  K.F10_C_s23 = async () => { const R = await run('C_s23', 181, probe('C_s23_c182.js')); return [/ASK: گامِ ۱ وابسته دارد: گامِ ۲/.test(R.x) && /OPTS: همه با هم/.test(R.x) && !R.errors.length, String(R.x).slice(0, 600)]; };
  K.F10_C_pwC1 = async () => { const R = await run('C_pwC1', 105, probe('C_pwC1_c106.js')); return [/ASK: گامِ ۱ وابسته دارد: گامِ ۲/.test(R.x) && /OPTS: همه با هم/.test(R.x) && !R.errors.length, String(R.x).slice(0, 600)]; };
  /* ---------- F11 / C97 (C29-5) — C ---------- */
  K.F11_C_aC1 = async () => { const R = await run('C_aC1', 0, ALLS); const pk = R.x.filter(r => /\|c:\d+$/.test(r[0]) && r[1] === 'stmt' && /^یه مسئله: می‌خوایم بستهٔ تیله/.test(r[3][0] || '')).map(r => r[0]);
    const there = pk.length ? R.x.filter(r => r[0] === pk[0] && r[1] === 'cother').map(r => r[3][0]) : [];
    return [pk.length === 1 && there.some(t => /۵ × ۱۲ = ۶۰/.test(t)) && !R.errors.length, J({ pk, there })]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 1200)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
