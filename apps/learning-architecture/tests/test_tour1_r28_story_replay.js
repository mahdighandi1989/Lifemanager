// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «story») — C101 (c): بازپخشِ صفحه‌ایِ سناریوهای خودِ دونده‌ها (همان گام‌های ctl و همان جواب‌های ضبط‌شدهٔ مدل،
//  tests/fixtures/r28_story/*.json ساخته از T/round28X/<sid>) و وارسیِ همان DOM یا نمایی که دونده دید. صفحه واقعاً اجرا می‌شود؛ فقط مدل ضبط‌شده است.
//  ساعتِ صفحه همان ساعتِ اجرای دونده است (Playwright clock)؛ هیچ تاریخِ تقویمی در انتظارها نیست. ONLY=<پیشوندِ بخش‌ها>.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r28_story');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 }; const J = (x) => JSON.stringify(x); const K = {};
  const run = async (fx, upto, fn, arg) => { const R = await replay(b, fx, { dir: DIR, upto: upto || 0 }); try { const x = await R.p.evaluate(fn, arg); return { x, errors: R.errors }; } finally { await R.close(); } };

  /* F3 / C86 — S1 A28-5 (A s01): پروندهٔ گفت‌وگو پس از «آهان، ۲۱۶ میلیون، هزار رو اشتباه نوشتم» — کنارِ «۱۸ میلیون × ۱۲ = ۲۱۶ میلیون» ✓ و ✗ ِ پیشین فقط در تاریخچه */
  K.A_s01_C86 = async () => { const R = await run('A_s01', 0, async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const o = [];
      for (const s of APP.S.all('achat', x => x && x.msgs && x.msgs.length)) { APP.go('dossier', s.id); await w(200); const L = document.getElementById('main').innerText.split('\n');
        L.forEach((l, i) => { if (/۱۸ میلیون × ۱۲ = ۲۱۶/.test(l) && !/^از پیامِ|^اصلاح شد|^نشانِ پیشین/.test(l)) o.push([l, L[i + 1] || '', L[i + 3] || '']); }); } return o; });
    const ok = R.x.length >= 2 && R.x.every(r => /۲۱۶ میلیون/.test(r[0]) && /^حسابِ صفحه: ✓/.test(r[1]) && /^نشانِ پیشینِ صفحه.*✗/.test(r[2])) && !R.errors.length;
    return [ok, J(R)]; };

  /* F10 / C95 — A28-33 (A oA1 T13): در 📜 ِ «دست‌دادن‌های مهمانی» سطرهای بدجا (کلِ تصمیم، «کارِ تو» ِ تصمیم، نتیجهٔ جلسه) دکمهٔ «↪» دارند؛ جابه‌جایی و برگرداندن */
  K.A_oA1_C95 = async () => { const R = await run('A_oA1', 100, async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const o = {};
      const L = APP.S.all('eprob', r => r && r.live && r.p).map(r => [r.p.id, r.p.title]); const H = (L.find(x => /دست‌دادن/.test(x[1])) || [])[0], Dd = (L.find(x => /بمانم/.test(x[1])) || [])[0];
      const lis = (re) => [...document.querySelectorAll('#main li.lp-dev')].filter(li => re.test(li.innerText));
      APP.go('dossier', H); await w(200); o.dmv = document.querySelectorAll('#main .lp-dmv').length;
      o.misfiled = [/کل در یک جمله/, /مهم‌ترین داده: الان ۶ هزار/, /یه نکته: تو نقشهٔ این تصمیم/, /یه مسئلهٔ سومِ کوتاه/].map(re => lis(re).map(li => li.querySelectorAll('.lp-dmv').length));
      o.stmt = lis(/^[^\n]*صورتِ مسئله/).map(li => li.querySelectorAll('.lp-dmv').length);
      const b = (lis(/کل در یک جمله/)[0] || document).querySelector('.lp-dmv'); o.label = b ? b.textContent : ''; if (b && /بمانم/.test(b.textContent)) b.click(); await w(200);
      APP.go('dossier', H); await w(200); o.src = lis(/کل در یک جمله/).map(li => li.innerText.replace(/\n+/g, ' ¦ '));
      APP.go('dossier', Dd); await w(200); const cp = lis(/از «دست‌دادن‌های مهمانی» جابه‌جا شد/); o.dst = cp.map(li => li.innerText.replace(/\n+/g, ' ¦ ')); o.unmv = cp.length ? cp[0].querySelectorAll('.lp-dunmv').length : 0;
      o.fc = lis(/🎯/).map(li => li.querySelectorAll('.lp-dmv').length);
      if (cp.length && o.unmv) cp[0].querySelector('.lp-dunmv').click(); await w(200);
      APP.go('dossier', H); await w(200); o.back = lis(/کل در یک جمله/).map(li => li.innerText.replace(/\n+/g, ' ¦ ')); o.today = APP.today(); return o; });
    const x = R.x, f = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    const ok = x.dmv > 0 && x.misfiled.every(a => a.length >= 1 && a.every(n => n >= 1)) && x.stmt.every(n => n >= 1) /* C123: صورت هم «↪» دارد */ && /بمانم یا بروم/.test(x.label)
      && x.src.length === 1 && /جابه‌جا شد ⇒ «بمانم یا بروم/.test(x.src[0]) && !/اصلاح شد ⇐ «—»/.test(x.src[0]) && x.dst.length === 1 && x.unmv === 1 && x.fc.every(n => n >= 1)
      && x.back.length === 1 && /برگشت به «دست‌دادن‌های مهمانی»/.test(x.back[0]) && !/— جابه‌جا شد/.test(x.back[0].split(' ¦ ')[0]) && !R.errors.length;
    return [ok, J(R)]; };

  /* همهٔ سطرهای پرونده‌های همهٔ مسئله‌ها و گفت‌وگوها (همان مدلی که نما می‌سازد) */
  const ALL = () => { const o = []; const ids = APP.S.all('eprob', r => r && r.live && r.p).map(r => r.p.id).concat(APP.S.all('achat', x => x && x.msgs && x.msgs.length).map(s => s.id));
    ids.forEach(p => (APP.dossier(p).events || []).forEach(e => o.push([p, e.k, (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ')]))); return o; };
  /* F9 / C96 — A28-29 + A28-30 (A aA1): جملهٔ خودِ کودک «مامانم کمکم کرد …» مالِ خودش؛ «داداشم یه حسابِ دیگه کرد: … ۳ × ۴۰۰ = ۱۲۰۰» «کارِ دیگری» با نشان (مدل coach_state نفرستاد) */
  K.A_aA1_C96 = async () => { const R = await run('A_aA1', 0, '(' + ALL.toString() + ')()');
    const o = R.x.filter(r => r[1] === 'cother'), ok = !o.some(r => /کمکم کرد/.test(r[2])) && o.some(r => /داداشم یه حسابِ دیگه کرد/.test(r[2]) && /حسابِ صفحه: ✓/.test(r[2])) && !R.errors.length;
    return [ok, J({ o, e: R.errors })]; };
  /* F9 / C96 — C28-8 (C aC1 p15): «داداشم یه حسابِ دیگه هم کرد: ۴ × ۲۵۰ = ۹۰۰» «کارِ دیگری» با ✗ */
  K.C_aC1_C96 = async () => { const R = await run('C_aC1', 0, '(' + ALL.toString() + ')()');
    const o = R.x.filter(r => r[1] === 'cother'); return [o.some(r => /۴ × ۲۵۰ = ۹۰۰/.test(r[2]) && /حسابِ صفحه: ✗/.test(r[2])) && !o.some(r => /^[^¦]*¦ »/.test(r[2])) && !R.errors.length, J(o)]; };
  /* F9 / C96 — B28·D12 (B s20 p1): پارامترهای خودش با نقلِ بی‌حسابِ استاد «کارِ دیگری» نمی‌شوند */
  K.B_s20_C96 = async () => { const R = await run('B_s20', 0, '(' + ALL.toString() + ')()'); const o = R.x.filter(r => r[1] === 'cother'); return [!o.length && !R.errors.length, J(o)]; };
  /* F9 / C125 — D28-11 (D tD1 p2): «فروشنده پرت رو ۱۲ درصد گفته بود» منبعِ داده است، نه «کارِ دیگری»؛ حسابِ داداش (p9) کارِ دیگری می‌ماند */
  K.D_tD1_C125 = async () => { const R = await run('D_tD1', 0, '(' + ALL.toString() + ')()'); const o = R.x.filter(r => r[1] === 'cother');
    return [!o.some(r => /فروشنده/.test(r[2])) && o.some(r => /داداشم حساب کرد/.test(r[2])) && !R.errors.length, J(o)]; };
  /* A28-12 (A s02 p13, p15): حساب‌هایی که مدل گزارش نکرد در پروندهٔ «لوله در بارِ وانت» */
  K.A_s02_A28_12 = async () => { const R = await run('A_s02', 0, '(' + ALL.toString() + ')()'); const c = R.x.filter(r => /^c(?:calc|res|data|step)$/.test(r[1]) && /^pb_l_/.test(r[0]));
    return [c.some(r => /۱۳\/۱۲ = ۱/.test(r[2])) && c.some(r => /√\(۱۵² \+ ۸²\) ≈ ۱۷/.test(r[2])) && !R.errors.length, J(c.map(r => r[2].slice(0, 120)))]; };
  /*@@MORE@@*/
  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 1500)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
