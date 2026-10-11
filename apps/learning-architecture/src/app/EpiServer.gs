/* ===== سمت سرور کارخانه: رادار هفتگی بک‌تست (بدون هوش مصنوعی) + گردآوری اختیاری پرونده (هوش مصنوعی فقط سازنده، به صف تأیید) ===== */
function epiLoadData_() { if (!globalThis.EPIX) epiDefine_(); return globalThis.EPIX; }

function epiCycle() {
  var X = epiLoadData_();
  var recs = JSON.parse(api_load()), by = {};
  recs.forEach(function (r) { by[r.id] = r; });
  var st = by.ecycle || { id: 'ecycle', type: 'ecyc', runs: 0, sigs: [], reports: [] };
  var set = by.esetup_mesbah || null;
  var user = recs.filter(function (r) { return r.type === 'ecase' && r.status === 'approved'; });
  var cases = X.seedCases().concat(user);
  var now = new Date().toISOString();
  var r = X.cycle({ runs: st.runs, sigs: st.sigs, locked: set && set.locked, lockedCfg: set && set.cfg, lockedAt: set && set.lockedAt }, cases, now);
  st.runs = (st.runs || 0) + 1; st.sigs = r.sigs; st.last = now; st.reports = [r.report].concat(st.reports || []).slice(0, 30);
  var sh = getSheet_();
  epiStamp_(st); writeRec_(sh, st);
  if (r.report.decay && r.report.decay.fail && set && set.locked) {
    set.locked = false; set.status = 'معلق: رادار فرسایش دید؛ نیازمند دادگاه تازه';
    (set.hist = set.hist || []).push({ at: now, ev: 'تعلیق خودکار به حکم رادار (فقط در جهت ایمن)' });
    epiStamp_(set); writeRec_(sh, set);
  }
  var bt = { id: 'ebt_srv_' + now.replace(/[^0-9]/g, ''), type: 'ebt', meta: { book: 'mesbah', enc: 'A', mode: 'cycle', at: now, n: 0 }, ok: r.report.recipe.ok,
    m: { is: r.report.recipe.is, oos: r.report.recipe.oos, lb: r.report.recipe.lb, book: r.report.recipe.book }, crit: [], aut: [] };
  epiStamp_(bt); writeRec_(sh, bt);
  var harvested = 0;
  if (PropertiesService.getScriptProperties().getProperty('EPI_HARVEST') === '1') { try { harvested = epiHarvest_(3, recs); } catch (e) { harvested = -1; } }
  epiMail_(r.report, set, harvested, recs);
  return r.report;
}
function epiStamp_(r) { r.updated = new Date().toISOString(); if (!r.created) r.created = r.updated; }
function epiHarvest_(n, recs) {
  var X = epiLoadData_();
  var schema = EPI_FEAT.map(function (d) { return d.k + '=' + (d.t === 'enum' ? d.v.join('|') : d.t); }).join('\n');
  var titles = X.seedCases().map(function (c) { return c.title; }).concat(recs.filter(function (r) { return r.type === 'ecase'; }).map(function (r) { return r.title; })).join('؛ ').slice(0, 6000);
  var txt = api_ai(EPI_BT.HARVEST_SYS + schema + '\nایستگاه‌های مجاز fail: ' + EPI_PIPE.join(', '), 'تعداد: ' + n + '\nاین‌ها را تکرار نکن: ' + titles);
  var s = String(txt), i = s.indexOf('['), j = s.lastIndexOf(']');
  var arr = JSON.parse(s.slice(i, j + 1)), sh = getSheet_(), k = 0;
  arr.forEach(function (o) {
    if (!o || !o.title || !o.claims) return;
    o.claims.forEach(function (c) { Object.keys(c.f || {}).forEach(function (key) { var d = EPI_FM[key]; if (!d || (d.t === 'enum' && d.v.indexOf(c.f[key]) < 0) || (d.t === 'bool' && typeof c.f[key] !== 'boolean')) delete c.f[key]; }); });
    o.truth = o.truth || { ok: false, fail: [] }; o.truth.fail = (o.truth.fail || []).filter(function (x) { return EPI_PIPE.indexOf(x) >= 0; });
    o.id = 'ecase_ai_' + Date.now().toString(36) + '_' + (k++); o.type = 'ecase'; o.kind = 'real'; o.by = 'ai'; o.status = 'pending'; o.grp = 'ai_' + (o.grp || o.id);
    epiStamp_(o); writeRec_(sh, o);
  });
  return k;
}
function epiMail_(rep, set, harvested, recs) {
  var pend = recs.filter(function (r) { return r.type === 'ecase' && r.status === 'pending'; }).length + Math.max(0, harvested);
  var f = function (v) { return v == null ? '—' : (+v).toFixed(2); };
  var lines = [
    'سناریوهای ساختگی تازه (کنترل مثبت): ' + rep.fresh.n + ' · درست‌یابی ' + Math.round(100 * rep.fresh.score) + '٪',
    'دستور منجمد جزوه: ' + (rep.recipe.ok ? '✓ تأیید' : '✗ رد') + ' · دوره قدیم ' + f(rep.recipe.is) + ' · دوره جدید ' + f(rep.recipe.oos) + ' · کران پایین ' + f(rep.recipe.lb) + ' · مثال‌های جزوه ' + f(rep.recipe.book),
    'تنظیم قفل‌شده: ' + (!rep.decay ? 'ندارد' : rep.decay.wait ? 'پرونده تازه کافی نیست (' + rep.decay.n + ')' : rep.decay.fail ? 'فرسایش دید و معلق شد' : 'پایدار (' + f(rep.decay.score) + ')'),
    harvested > 0 ? harvested + ' پرونده پیشنهادی هوش مصنوعی به صف تأیید رفت' : harvested < 0 ? 'گردآوری هوش مصنوعی ناموفق بود' : '',
    pend ? pend + ' پرونده در صف تأیید منتظر شماست' : ''
  ].filter(String);
  var url = ScriptApp.getService().getUrl() || '';
  var html = '<div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:2"><h3 style="margin:0">رادار هفتگی کارخانه معرفت‌شناسی</h3>' + lines.map(function (l) { return '<div>• ' + l + '</div>'; }).join('') + (url ? '<p><a href="' + url + '">باز کردن سامانه</a></p>' : '') + '</div>';
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: 'رادار هفتگی بک‌تست جزوه', htmlBody: html });
}
function installEpiCycle() {
  removeEpiCycle();
  ScriptApp.newTrigger('epiCycle').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.SATURDAY).atHour(6).create();
  return 'دوره هفتگی نصب شد (شنبه‌ها، ساعت ۶ صبح؛ گزارش ایمیل می‌شود).';
}
function removeEpiCycle() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'epiCycle') ScriptApp.deleteTrigger(t); });
  return 'دوره هفتگی حذف شد.';
}
function setEpiHarvest(on) { PropertiesService.getScriptProperties().setProperty('EPI_HARVEST', on ? '1' : '0'); return on ? 'گردآوری هوش مصنوعی در دوره هفتگی روشن شد (همه به صف تأیید).' : 'گردآوری هوش مصنوعی خاموش شد.'; }
function api_epiCycleNow() { epiCycle(); return 'دوره اجرا شد.'; }
