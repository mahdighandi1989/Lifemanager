// Campaign harness: one scenario per directory. The page runs for real (dist bundle); every AI call ⇒ ai/pN.json, waits for ai/rN.txt;
// the "user" drives via ctl/cN.json ({eval0}|{say}|{eval}|{click}|{fill}|{exit}); routines are simulated by editing sheets/<id>.json;
// tour e-mail reports land in mail/mN.json (subject, html, text, images). inject.js (optional) runs before the stubs on every start.
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs = require('fs'), path = require('path');
const D = process.argv[2];
['ai', 'ctl', 'out', 'sheets', 'mail', 'profile', 'drive', 'drive/files'].forEach(d => fs.mkdirSync(path.join(D, d), { recursive: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(D, 'profile'), { viewport: { width: 1360, height: 900 } });
  const p = ctx.pages()[0] || await ctx.newPage();
  const log = []; p.on('pageerror', e => log.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) log.push('console: ' + m.text()); });
  let n = fs.readdirSync(path.join(D, 'ai')).filter(f => /^p\d+\.json$/.test(f)).length;
  await p.exposeFunction('__ask', async (payload) => {
    const i = ++n; fs.writeFileSync(path.join(D, 'ai', 'p' + i + '.json'), JSON.stringify(payload, null, 1));
    const rf = path.join(D, 'ai', 'r' + i + '.txt');
    for (;;) { if (fs.existsSync(rf)) break; if (fs.existsSync(path.join(D, 'ai', 'STOP'))) return '{"reply":"(stopped)","status":"related","actions":[]}'; await wait(1500); }
    await wait(300); return fs.readFileSync(rf, 'utf8');
  });
  await p.exposeFunction('__sheetSave', async (s) => { fs.writeFileSync(path.join(D, 'sheets', s.id + '.json'), JSON.stringify(s, null, 1)); return true; });
  await p.exposeFunction('__sheetLoad', async (id) => { const f = path.join(D, 'sheets', id + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; });
  await p.exposeFunction('__sheetList', async () => fs.readdirSync(path.join(D, 'sheets')).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(D, 'sheets', f), 'utf8'))));
  let mc = fs.readdirSync(path.join(D, 'mail')).length;
  // Drive stub (campaign 3): uploads saved under drive/files/<id>-<name> so the model agent can read attached content; mirror calls logged
  let fid = 900 + fs.readdirSync(path.join(D, 'drive', 'files')).length;
  const NL = String.fromCharCode(10);
  await p.exposeFunction('__upload', async (rid, name, mime, b64, meta) => { const id = ++fid; fs.writeFileSync(path.join(D, 'drive', 'files', id + '-' + name.split('/').join('_')), Buffer.from(b64, 'base64'));
    fs.appendFileSync(path.join(D, 'drive', 'uploads.jsonl'), JSON.stringify({ id, rid, name, mime, meta, at: new Date().toISOString() }) + NL); return { id, name, mime, link: 'drive://' + id }; });
  await p.exposeFunction('__files', async (rid) => { const f = path.join(D, 'drive', 'uploads.jsonl'); if (!fs.existsSync(f)) return []; return fs.readFileSync(f, 'utf8').trim().split(NL).filter(Boolean).map(l => JSON.parse(l)).filter(x => x.rid === rid).map(x => ({ id: x.id, name: x.name, mime: x.mime, link: 'drive://' + x.id })); });
  await p.exposeFunction('__mirror', async (o) => { fs.appendFileSync(path.join(D, 'drive', 'mirror.jsonl'), JSON.stringify({ at: new Date().toISOString(), n: (o.items || []).length, items: (o.items || []).slice(0, 50), deleted: o.deleted }) + NL); return { ok: true }; });
  await p.exposeFunction('__mail', async (r) => { fs.writeFileSync(path.join(D, 'mail', 'm' + (++mc) + '.json'), JSON.stringify(r)); return { status: 'sent' }; });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
  const inj = path.join(D, 'inject.js'); if (fs.existsSync(inj)) await p.evaluate(fs.readFileSync(inj, 'utf8'));
  const num0 = Math.max(100, ...fs.readdirSync(path.join(D, 'sheets')).map(f => +((f.match(/^sh(\d+)/) || [])[1] || 0)));
  await p.evaluate((NUM0) => {
    APP.S.loaded = true; let num = NUM0;
    const ask = async (sys, user, opts) => { const t = await window.__ask({ sys, user, task: (opts || {}).task || 'learning_architecture', fileIds: (opts || {}).fileIds || [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; };
    APP.HOST = {
      ai: ask,
      upload: async (rid, f, meta) => { const b = new Uint8Array(await f.arrayBuffer()); let bin = ''; for (let i = 0; i < b.length; i += 8192) bin += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return window.__upload(rid, f.name, f.type, btoa(bin), meta || null); },
      files: async (rid) => window.__files(rid),
      mirror: async (o) => window.__mirror(o), mirrorList: async () => [], mirrorSync: async () => ({ ok: true }),
      report: async (o) => { const id = 'sh' + (++num); await window.__sheetSave({ id, number: num, status: 'open', urgent: o.urgent, title: o.text.split('\n')[0], text: o.text, spot: o.spot, notes: [{ id: 'n0', by: 'owner', at: new Date().toISOString(), text: o.text }] }); return { id, number: num }; },
      sheets: async () => (await window.__sheetList()).map(s => ({ id: s.id, number: s.number, title: s.title, status: s.status, urgent: s.urgent })),
      sheet: async (id) => window.__sheetLoad(id),
      note: async (id, text) => { const s = await window.__sheetLoad(id); s.notes.push({ id: 'o' + Date.now(), by: 'owner', at: new Date().toISOString(), text }); if (s.status === 'answered' || s.status === 'approved') s.status = 'open'; await window.__sheetSave(s); return { ok: true }; },
      remind: async (pl) => { (window.__rem = window.__rem || []).push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }),
      mail: async (r) => window.__mail(r)
    };
    APP.callAI = ask;
    APP.render();
  }, num0);
  let c = fs.readdirSync(path.join(D, 'out')).filter(f => /^s\d+\.json$/.test(f)).length;
  for (;;) {
    const cf = path.join(D, 'ctl', 'c' + (c + 1) + '.json');
    if (!fs.existsSync(cf)) { await wait(1000); continue; }
    c++; let cmd = {}, res = {}, before = null, VALS = null;
    try { cmd = JSON.parse(fs.readFileSync(cf, 'utf8')); } catch (e) { res.error = 'bad ctl json: ' + e.message; }
    try {
      if (cmd.eval0) res.eval0 = await p.evaluate(cmd.eval0);
      // files: [{name, type, path}] — real files from disk, sent with the message exactly like the paperclip or paste
      const fl = (cmd.files || []).map(f => ({ name: f.name || path.basename(f.path), type: f.type || 'application/octet-stream', b64: fs.readFileSync(f.path).toString('base64') }));
      VALS = () => p.evaluate(() => [...document.querySelectorAll('#main input, #main textarea, #main select')].map((e, i) => [i, e.id || e.name || '', e.type === 'checkbox' || e.type === 'radio' ? String(e.checked) : String(e.value)]));
      before = cmd.say == null ? await VALS().catch(() => []) : null;
      if (cmd.say != null || fl.length) { await p.evaluate(async ([t, fl]) => { const pn = document.querySelector('.as-panel'); if (!pn || pn.hidden) APP.ASSIST.toggle(true);
        const files = fl.map(f => { const bin = atob(f.b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new File([u], f.name, { type: f.type }); });
        await APP.ASSIST.send(t || '', files); }, [cmd.say, fl]); }
      if (cmd.eval) res.eval = await p.evaluate(cmd.eval);
      if (cmd.click) { await p.click(cmd.click, { timeout: 8000 }); await wait(500); }
      if (cmd.fill) { await p.fill(cmd.fill[0], cmd.fill[1], { timeout: 8000 }); await wait(600); }
      if (cmd.exit) { fs.writeFileSync(path.join(D, 'out', 's' + c + '.json'), '{"exit":true}'); break; }
    } catch (e) { res.error = String(e.message || e).slice(0, 600); }
    await wait(500);
    try {
      res.state = await p.evaluate(() => { const s = APP.ASSIST.cur(); return { view: APP.state.view, arg: APP.state.arg, sub: APP.state.sub, msgs: s ? s.msgs.slice(-10).map(m => m.role + ': ' + m.text) : [], tour: s && s.tour ? APP.ASSIST.tourText(s) : null, rem: (window.__rem || []).length,
        overlay: (Array.from(document.querySelectorAll('.overlay, [role=dialog][aria-modal=true]')).filter(x => !x.closest('.as-root') && x.getClientRects().length)[0] || {}).innerText || '',
        marks: [...document.querySelectorAll('#main .as-hl, #main .as-filled')].map(x => (x.classList.contains('as-hl') ? 'HL ' : 'FILL ') + (x.getAttribute('aria-label') || x.name || x.id || x.tagName) + '=' + (x.value || x.textContent || '').slice(0, 60)),
        main: (document.getElementById('main') || {}).innerText ? document.getElementById('main').innerText.slice(0, 1500) : '' }; });
    } catch (e) { res.stateError = String(e.message || e); }
    res.log = log.splice(0);
    try { await p.screenshot({ path: path.join(D, 'out', 's' + c + '.png') }); } catch (e) { }
    // round 16 (owner): a page action is shown on the PAGE — the touched field/button in view, the assistant panel folded for that shot
    if (cmd.say == null && (cmd.eval || cmd.click || cmd.fill) && before) {
      try {
        const after = await VALS();
        const ch = after.filter((x, i) => !before[i] || before[i][2] !== x[2]).map(x => x[0]);
        if (!(ch.length || cmd.click || cmd.fill || /\bC\(|\.click\(|APP\.go\(/.test(cmd.eval || ''))) throw 0;   // a pure inspection probe is not a page action
        const was = await p.evaluate(() => { const pn = document.querySelector('.as-panel'); return !!(pn && !pn.hidden); });
        const hit = await p.evaluate(([ch, sel]) => {
          const all = [...document.querySelectorAll('#main input, #main textarea, #main select')];
          let el = ch.length ? all[ch[0]] : null;
          if (!el && sel) try { el = document.querySelector(sel); } catch (e) { }
          if (!el) el = document.querySelector('#main .as-filled, #main .as-hl, #main .ok, #main .bad');
          if (!el) return false; el.scrollIntoView({ block: 'center' }); return true; }, [ch, cmd.click || (cmd.fill || [])[0] || '']);
        if (hit) {
          if (was) await p.evaluate(() => APP.ASSIST.toggle(false));
          await wait(250); await p.screenshot({ path: path.join(D, 'out', 's' + c + '_page.png') });
          if (was) await p.evaluate(() => APP.ASSIST.toggle(true));
        }
      } catch (e) { }
    }
    fs.writeFileSync(path.join(D, 'out', 's' + c + '.json'), JSON.stringify(res, null, 1));
  }
  await ctx.close();
})();
