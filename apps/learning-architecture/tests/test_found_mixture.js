// p_found_mixture — تصمیمِ روتینِ بک‌تست (۲۰۲۶-۱۰-۱۵، با معیارهای مالک، بی پرسش؛ بازبینِ مستقلِ برهان PC2):
// ۱) قضیه‌ها: T_support (شرطِ راه ⇒ ½ + q(r − ½)) و T_favour از اصول؛ T_null حالتِ q = ۰.
// ۲) سقف‌ها: مقدمهٔ احرازنشده ¾ (تصدیقِ «ثابت شده با این برهان» ⇒ ½)؛ مقدمهٔ ظنی (۱۰۰+prem_p)/۲؛ صدور ¾ / ½؛ وثاقتِ نامعلوم ⇒ آمیزه با p_thiqa؛
//    گزارش‌های عرضیِ مستقل ⇒ فقط T_below1؛ قرینهٔ همسو با ناقلِ ناموثق ⇒ T_below1؛ مبهمِ بی‌قرینه ¾ / ½؛ حافظه آمیزه؛ تمثیل/پیامد آمیزه.
// ۳) پایه‌های سنجیده‌نشده: مساعد (p_thiqa، p_zahir، p_mubham_q) ⇒ ۹۹٫۹؛ مساعد از راهِ T_support ⇒ زبرینِ ¾؛ خنثی ⇒ ½.
// ۴) F.routeGuard: دو شرطِ راهِ احرازنشده و r < ½ ⇒ ½؛ یک شرط با چند قاعده (حافظه) یک شرط است.
// ۵) پیکره: ۲۰۳ از ۲۰۳ درست؛ رمزهای تازه فقط از دفترِ رمزگذاریِ کور؛ پیشنهاد با تصمیم ثبت شده.
const fs = require('fs'), path = require('path');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const T = require(path.join(__dirname, '..', 'tools', 'epi_backtest.js'));
T.applyBase();
const F = global.EPI_FOUND, X = global.EPIX, FM = global.EPI_FM;
const AX = F.AX.map(a => a.id);
// ۱) قضیه‌ها
const TS = F.TH.T_support, TF = F.TH.T_favour;
chk(TS && TS.from.join() === 'A1,A2,A3,A4' && TS.from.every(a => AX.indexOf(a) >= 0) && /P\(C\|¬S\) = ½/.test(TS.proof) && /T_null/.test(TS.proof) && /P\(S\) = ⅓/.test(TS.proof), 'T_support proved from A1–A4, names T_null and the partition argument');
chk(/پیش‌فرض‌های صریح/.test(TS.proof) && /routeGuard/.test(TS.proof), 'T_support states its meta-premises and the min guard');
chk(TF && TF.from.join() === 'A4,A2', 'T_favour from A4, A2 (mirror of T_against)');
chk(/C ⊨ S/.test(F.TH.T_unknown.proof) && /T_support/.test(F.TH.T_weakest.proof) && /T_support/.test(F.TH.T_product.proof), 'scope notes on T_unknown, T_weakest, T_product');
chk(/شمارهای متناهی/.test(F.TH.T_next.proof) && /شمارهای متناهی/.test(F.TH.T_pop.proof) && /حدِ M ⇒ ∞/.test(F.TH.T_plausible.proof), 'finite-count route cited by T_next/T_pop/T_plausible');
chk(T.axiomAudit().length === 0, 'audit clean ' + JSON.stringify(T.axiomAudit()));
chk(FM.x_about_route && FM.x_about_route.t === 'bool', 'feature x_about_route');
// ۲) سقف‌ها
const cfg = X.DEFAULT_CFG('mesbah');
const cap = (id, f, k) => X.capOf(cfg, X.RM[id], f || {}, k);
const near = (a, b) => Math.abs(a - b) < 1e-9;
chk(cap('r_aql_matter_unproven') === 75 && cap('r_aql_matter_unproven', { x_about_route: true }) === 50 && cap('r_aql_matter_false') === 50, 'unproven premise ¾ (claim about the proof ½); false premise ½ (T_null = q 0)');
chk(cap('r_aql_matter_zanni', { prem_p: 80 }) === 90 && cap('r_aql_matter_zanni', { prem_p: 80, x_about_route: true }) === 80 && near(cap('r_aql_matter_zanni', {}), 99.9), 'probable premise: (100+prem_p)/2; about the proof: prem_p; no degree: 99.9');
chk(cap('r_naql_not_issued') === 75 && cap('r_naql_not_issued', { x_about_route: true }) === 50, 'issuance not established: ¾ for content, ½ for «he said it»');
chk(near(cap('r_naql_narrator_unknown'), 74.95) && cap('r_naql_narrator_unknown', { x_about_route: true }) === 50 && near(cap('r_naql_narrator_unknown', { chain: 'گزارش‌های عرضی مستقل' }), 99.9), 'narrator unknown: ½ + ½(p_thiqa − ½); independent cross reports ⇒ only T_below1');
chk(near(cap('r_naql_chain_broken'), 74.95), 'longitudinal chain with an unknown link: same mixture (not ½)');
chk(near(cap('r_naql_ahad', { chain: 'تک‌منبع' }), 99.9) && near(cap('r_naql_unreliable_corrob'), 99.9), 'single report from an unmeasured favourable class and a concordant qarina: only T_below1');
chk(cap('r_naql_mubham_noq') === 75 && cap('r_naql_mubham_noq', { x_about_route: true }) === 50, 'ambiguous text: meaning-claim ½ (T_ambig), content claim ¾');
chk(cap('r_expert_method_weak', { x_method: 'ضعیف' }) === 50 && cap('r_expert_method_weak', { x_method: 'نامعلوم' }) === 50, 'method weak ⇒ ½ (q 0); unknown with unmeasured population ⇒ ½');
chk(cap('r_yad_orig_t1', { mem_orig: 20, mem_doc: true }) === 20 && cap('r_yad_orig_t1', { mem_orig: 20, mem_doc: false }) === 35 && cap('r_yad_undoc', { mem_doc: false }) === 75, 'memory: documented ⇒ original; undocumented ⇒ q·o + (1−q)·½');
chk(near(cap('r_hiss_uncontrolled'), 74.95) && near(cap('r_tajrobe_hidden'), 74.95) && cap('r_expert_bias') === 50, 'route-condition bases ⇒ sup of T_support; biased expert neutral ½');
// ۳) پایه‌ها
const m = F.measure([]);
chk(['p_thiqa', 'p_zahir', 'p_mubham_q'].every(b => m[b].p === 99.9 && F.BASE[b].fav === 'below1'), 'favourable bases unmeasured ⇒ 99.9');
chk(['p_sense_unctrl', 'p_hidden_inf', 'p_hidden_factor'].every(b => near(m[b].p, 74.95) && F.BASE[b].fav === 'support'), 'route bases unmeasured ⇒ sup ¾');
chk(['p_expert_bias', 'p_mem'].every(b => m[b].p === 50 && !F.BASE[b].fav), 'neutral bases unmeasured ⇒ ½');
// ۴) routeGuard
const R1 = X.RM.r_yad_orig_t1, R2 = X.RM.r_yad_undoc, R3 = X.RM.r_aql_matter_unproven;
const E = (r, c, route) => { const e = [r, c]; e.raw = c; e.route = route; return e; };
chk(F.routeGuard([E(R1, 35, true), E(R2, 35, true)]).every(x => x[1] === 35), 'one condition (memory) with two rules is not two conditions');
chk(F.routeGuard([E(R1, 35, true), E(R3, 75, true)]).map(x => x[1]).join() === '50,75', 'two unestablished route conditions and r < ½ ⇒ the low cap rises to ½');
chk(F.routeGuard([E(R1, 35, false), E(R3, 75, true)]).map(x => x[1]).join() === '35,75', 'an established or truth-condition cap is never lifted (RR2)');
chk(cap('r_naql_ahad', { chain: 'تک‌منبع', narrator: 'نامعلوم' }) > 74 && cap('r_naql_ahad', { chain: 'تک‌منبع', narrator: 'نامعلوم' }) < 75 && cap('r_naql_ahad', { chain: 'تک‌منبع', narrator: 'غیرموثق' }) === 50, 'the trusted-narrator base applies only to a trusted or unwritten narrator (RR2)');
chk(cap('r_yad_orig_t1', { mem_orig: 20 }) === 50 && cap('r_aql_conseq', { x_conseq_n: 1 }) > 66 && cap('r_aql_analogy', { x_analog_n: 1, x_analog_k: 1 }) > 66, 'unwritten feature ⇒ sup over its values (epi_feat convention)');
const k2 = X.runClaim({ id: 'k', f: { way: 'یادآوری', mem_orig: 20, mem_doc: false, matter: 'مقدمه اثبات‌نشده', conf: 45 } }, cfg);
chk(k2.ceil === 50 && !k2.over, 'engine applies the guard ' + JSON.stringify([k2.ceil, k2.bind]));
// ۵) پیکره و دفتر
const res = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'results.json'), 'utf8'));
const pre13 = res.cases.filter(c => (c.r || 0) <= 12); // دورِ ۱۳+ یافتهٔ بازِ مستقل دارد؛ این آزمون فقط «تصمیم چیزی را نشکست» را برای پیکرهٔ پیش از آن می‌سنجد
chk(pre13.length === 203 && pre13.every(c => c.k === 'ok'), 'corpus: every verdict correct after the decision (0 broken)');
const L = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'ledger.json'), 'utf8')), row = L.rounds.filter(x => x.round === 12).pop();
chk(row.brier && row.brier.claims === 233 && row.foundation.baseval.p_thiqa === 99.9 && !row.routine.alarms.length, 'ledger row: Brier recorded, p_thiqa 99.9, no alarms');
const RC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'reviews', 'recode-2026-10-15b-mixture.json'), 'utf8'));
const REC = {}; RC.applied.forEach(a => { REC[a.case + '/' + a.claim + '/' + a.key] = a.value; });
const cs = T.loadCorpus();
chk(cs.every(c => (c.claims || []).every(k => !(k.f && k.f.x_about_route != null) || REC[c.id + '/' + k.id + '/x_about_route'] === k.f.x_about_route)), 'every x_about_route comes from the recorded blind re-encode');
chk(RC.notApplied.encodersSplit.length === 4 && /دو خوانشِ کور/.test(RC.notApplied.splitNote), 'split readings not applied, with the reason');
const PR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'proposals.json'), 'utf8')).proposals.find(p => p.id === 'p_found_mixture');
chk(PR && PR.applied && /بی پرسش/.test(PR.decision.owner) && /PC2/.test(PR.decision.judged) && PR.decision.notApplied.length >= 2, 'proposal decided with the owner\'s standing words and the checker');
const RV11 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'reviews', 'round-0011.json'), 'utf8'));
chk(RV11.round === 11 && RV11.problems.every(p => p.fixed) && /زیرعامل/.test(RV11.reviewer), 'round 11 independent review recorded, all problems fixed');
console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); process.exit(errors.length ? 1 : 0);
