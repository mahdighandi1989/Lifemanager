// بک‌تستِ پیوسته (۲۰۲۶-۱۰-۱۳) — اجراکنندهٔ قطعیِ tools/epi_backtest.js در یک پوشهٔ موقت (دادهٔ واقعی دست نمی‌خورد):
// افزودن (اعتبارسنجی، ردِ تکراری، منبع برای واقعی، from برای انتزاعی)، دور، یافته‌ها، بستن فقط با وقایعِ تازه، بازگشایی، کنترل‌ها، جزوهٔ متقن.
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epibt-'));
const TOOL = path.join(__dirname, '..', 'tools', 'epi_backtest.js');
const run = (...a) => JSON.parse(execFileSync('node', [TOOL, ...a], { env: Object.assign({}, process.env, { EPI_BT_DIR: dir }) }).toString());
const base = run('run', '--note', 'پایه');
chk(base.round === 1 && base.corpus.n === 169 && base.books.mesbah.controls.negOk && base.books.mesbah.controls.posOk, 'baseline round + controls ' + JSON.stringify(base.books.mesbah.controls));
const F0 = JSON.parse(fs.readFileSync(path.join(dir, 'findings.json'))).findings;
chk(F0.length >= 1 && F0.every(f => f.status === 'open' && f.rules && f.secs), 'findings opened with rules/sections');
// افزودن: یک واقعهٔ سالم، یک تکراری، یک بی‌منبع، یک انتزاعیِ بی from
const ok1 = { id: 'r9_ok', tier: 'real', title: 'آزمونِ تکرار پیش از پذیرش', dom: 'علم', year: 2011, src: ['OPERA collaboration 2012'], story: 's', actor: 'a',
  claims: [{ id: 'k1', txt: 'نتیجه تا تکرارِ مستقل قطعی نیست', role: 'اصلی', f: { way: 'تجربه', conf: 50, stakes: 'زیاد' } }], truth: { ok: true, fail: [], why: 'w (s51)', right: 'r' } };
const dup = Object.assign({}, ok1, { id: 'r9_dup' });
const nosrc = Object.assign({}, ok1, { id: 'r9_nosrc', title: 'دیگری', src: [] });
const abs = Object.assign({}, ok1, { id: 'r9_abs', title: 'انتزاعی', tier: 'abstract', src: [] });
const badkey = Object.assign({}, ok1, { id: 'r9_bad', title: 'کلیدِ بد', claims: [{ id: 'k1', txt: 't', f: { nope: 1 } }] });
fs.writeFileSync(path.join(dir, 'in.json'), JSON.stringify([ok1, dup, nosrc, abs, badkey]));
const ad = run('add', path.join(dir, 'in.json'));
chk(ad.added === 1 && ad.rejected.length === 4, 'add validates and dedupes ' + JSON.stringify(ad.rejected.map(r => r.id + ':' + r.errors[0])));
const r2 = run('run');
chk(r2.round === 2 && r2.corpus.n === 170 && r2.corpus.new === 1, 'round 2 sees the new event');
// «اصلاح‌شده» فقط با وقایعِ تازه تأیید می‌شود؛ اصلاحی که موردِ خودش را درست نکند دوباره باز می‌شود
const fp = path.join(dir, 'findings.json'); const FF = JSON.parse(fs.readFileSync(fp));
FF.findings[0].fix = { what: 'آزمایشی', round: 2 }; FF.findings[0].status = 'fixed'; fs.writeFileSync(fp, JSON.stringify(FF));
run('run');
chk(JSON.parse(fs.readFileSync(fp)).findings[0].status === 'reopened', 'a fix that did not fix its own case reopens');
const vb = fs.readFileSync(path.join(dir, 'VERIFIED_BOOKLET.md'), 'utf8');
chk(/^# جزوهٔ متقن/.test(vb) && /## فصلِ 1/.test(vb) && /⚠/.test(vb) && /✅/.test(vb), 'verified booklet generated with statuses');
const led = JSON.parse(fs.readFileSync(path.join(dir, 'ledger.json')));
chk(led.rounds.length === 3 && led.rounds.every(r => r.coverage && Array.isArray(r.coverage.untested)), 'ledger rows');
// ردِ مالک ⇒ excluded ⇒ از دورهای بعد بیرون (خودِ مورد در فایل می‌ماند)
const cf = path.join(dir, 'corpus', fs.readdirSync(path.join(dir, 'corpus'))[0]); const cc = JSON.parse(fs.readFileSync(cf)); cc[0].excluded = true; cc[0].excludedWhy = 'آزمون'; fs.writeFileSync(cf, JSON.stringify(cc));
const r4 = run('run');
chk(r4.corpus.n === 169 && JSON.parse(fs.readFileSync(cf)).length === 1, 'an excluded event leaves the corpus but stays on file');
fs.rmSync(dir, { recursive: true, force: true });
console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
