/**
 * سامانه معماری یادگیری عمیق — بک‌اند Google Apps Script
 * --------------------------------------------------------------
 * فایل‌های پروژه: Code.gs، Index.html، core.html، tech_a..tech_e.html، app.html، appsscript.json
 * راه‌اندازی: Deploy ← New deployment ← Web app ← Execute as: Me ← Who has access: Only myself
 * داده‌ها در یک Google Sheet به نام LearningArchitecture_DB در Drive شما ذخیره می‌شوند (خودکار ساخته می‌شود).
 */

var DB_NAME = 'LearningArchitecture_DB';
var SHEET = 'records';
var CHUNK = 45000;          // حد امن هر سلول (حد گوگل ۵۰٬۰۰۰ نویسه)
var MAX_PARTS = 20;         // حداکثر ۹۰۰ هزار نویسه برای هر رکورد (برای طرح‌های رسم‌شده)
var HEAD = ['id', 'type', 'updated', 'due', 'status'];

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('معماری یادگیری عمیق')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/* ---------- پایگاه داده ---------- */
function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('DB_ID');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(DB_NAME);
    props.setProperty('DB_ID', ss.getId());
    var sh0 = ss.getSheets()[0];
    sh0.setName(SHEET);
    var head = HEAD.slice();
    for (var i = 1; i <= MAX_PARTS; i++) head.push('json_' + i);
    sh0.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh0.setFrozenRows(1);
  }
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}

function api_dbUrl() { return getSheet_().getParent().getUrl(); }

function api_load() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return '[]';
  var width = HEAD.length + MAX_PARTS;
  var vals = sh.getRange(2, 1, last - 1, width).getValues();
  var out = [];
  for (var r = 0; r < vals.length; r++) {
    if (!vals[r][0]) continue;
    var json = '';
    for (var c = HEAD.length; c < width; c++) { if (vals[r][c] === '' || vals[r][c] == null) break; json += String(vals[r][c]).replace(/^~/, ''); }
    if (json) out.push(json);
  }
  return '[' + out.join(',') + ']';
}

function rowOf_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var f = sh.getRange(2, 1, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return f ? f.getRow() : -1;
}

function writeRec_(sh, rec) {
  var json = JSON.stringify(rec);
  var parts = [];
  for (var i = 0; i < json.length; i += CHUNK) parts.push(json.substring(i, i + CHUNK));
  if (parts.length > MAX_PARTS) throw new Error('رکورد ' + rec.id + ' بیش از حد بزرگ است (احتمالاً طرح رسم‌شده). آن را کوچک‌تر کن.');
  var row = [rec.id, rec.type || '', rec.updated || '', rec.due || '', rec.status || ''];
  for (var k = 0; k < MAX_PARTS; k++) row.push(parts[k] ? '~' + parts[k] : '');   // پیشوند ~ مانع تفسیر به‌عنوان فرمول/عدد می‌شود
  var r = rowOf_(sh, rec.id);
  if (r < 0) r = sh.getLastRow() + 1;
  // جلوگیری از تفسیر رشته‌های عددی/فرمولی
  sh.getRange(r, 1, 1, row.length).setNumberFormat('@').setValues([row]);
}

function api_save(json) { return api_saveMany('[' + json + ']'); }

function api_saveMany(json) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var arr = JSON.parse(json);
    var sh = getSheet_();
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].id) writeRec_(sh, arr[i]);
    return arr.length;
  } finally { lock.releaseLock(); }
}

function api_delete(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet_();
    var r = rowOf_(sh, id);
    if (r > 0) sh.deleteRow(r);
    return true;
  } finally { lock.releaseLock(); }
}

/* ---------- هوش مصنوعی (منتقد) ---------- */
function api_getAI() {
  var p = PropertiesService.getScriptProperties();
  return JSON.stringify({
    provider: p.getProperty('AI_PROVIDER') || 'gemini',
    model: p.getProperty('AI_MODEL') || 'gemini-2.5-flash',
    hasKey: !!p.getProperty('AI_KEY')
  });
}

function api_setAI(provider, model, key) {
  var p = PropertiesService.getScriptProperties();
  p.setProperty('AI_PROVIDER', provider || 'gemini');
  p.setProperty('AI_MODEL', model || (provider === 'anthropic' ? 'claude-sonnet-5-5' : 'gemini-2.5-flash'));
  if (key) p.setProperty('AI_KEY', key);
  return true;
}

function api_ai(system, user) {
  var p = PropertiesService.getScriptProperties();
  var provider = p.getProperty('AI_PROVIDER') || 'gemini';
  var model = p.getProperty('AI_MODEL') || 'gemini-2.5-flash';
  var key = p.getProperty('AI_KEY');
  if (!key) throw new Error('کلید API تنظیم نشده است. از «تنظیمات» وارد کن.');
  var res, data;
  if (provider === 'anthropic') {
    res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify({ model: model, max_tokens: 2000, system: system, messages: [{ role: 'user', content: user }] })
    });
    data = JSON.parse(res.getContentText());
    if (data.error) throw new Error(data.error.message);
    return (data.content || []).map(function (c) { return c.text || ''; }).join('');
  }
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
  var payload = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 2500 } };
  for (var attempt = 0; attempt < 3; attempt++) {
    res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload: JSON.stringify(payload) });
    if (res.getResponseCode() === 429 || res.getResponseCode() >= 500) { Utilities.sleep(1500 * (attempt + 1)); continue; }
    break;
  }
  data = JSON.parse(res.getContentText());
  if (data.error) throw new Error(data.error.message);
  var c = data.candidates && data.candidates[0];
  return c && c.content ? c.content.parts.map(function (x) { return x.text || ''; }).join('') : '';
}

/* ---------- یادآور روزانه ---------- */
function installDailyReminder(hour) {
  removeDailyReminder();
  ScriptApp.newTrigger('dailyReminder').timeBased().everyDays(1).atHour(hour || 7).create();
  return 'یادآور روزانه ساعت ' + (hour || 7) + ' فعال شد.';
}

function removeDailyReminder() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'dailyReminder') ScriptApp.deleteTrigger(t); });
  return 'یادآور غیرفعال شد.';
}

function sendReminderNow() { dailyReminder(); return 'ایمیل آزمایشی فرستاده شد.'; }

function dailyReminder() {
  var recs = JSON.parse(api_load());
  var tz = Session.getScriptTimeZone();
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var cards = 0, scheds = [], p2 = false, lastP4 = '', lastP9 = '', active = 0, seedlings = 0, caseRev = [], caseOpen = 0;
  var topics = {};
  recs.forEach(function (r) { if (r.type === 'topic') topics[r.id] = r.title; });
  recs.forEach(function (r) {
    if (r.type === 'card' && !r.susp && (r.due || '') <= today) cards++;
    if (r.type === 'sched' && !r.done && r.due <= today) scheds.push(r.label + ' — ' + (topics[r.topic] || r.title || ''));
    if (r.type === 'pr' && r.status === 'done') {
      var d = (r.created || '').slice(0, 10);
      if (r.pid === 'P2' && d === today) p2 = true;
      if (r.pid === 'P4' && d > lastP4) lastP4 = d;
      if (r.pid === 'P9' && d > lastP9) lastP9 = d;
    }
    if (r.type === 'srcq' && r.status === 'active') active++;
    if (r.type === 'seedling' && r.status === 'new') seedlings++;
    if (r.type === 'case') {
      var f = r.st && r.st.st_final && r.st.st_final.data;
      if (f && f.revdate && String(f.revdate) <= today && (f.final || []).some(function (x) { return x.c && !(r.outcome || {})[x.c]; })) caseRev.push(r.title);
      else if (r.status !== 'closed') caseOpen++;
    }
  });
  var lines = [];
  if (cards) lines.push('• ' + cards + ' کارت مرور موعد امروز (اول از حافظه، بعد پاسخ)');
  scheds.forEach(function (s) { lines.push('• برگه سفید ' + s); });
  if (!p2) lines.push('• قرائت ۱۰ دقیقه‌ای روز: یک رخداد امروز از پشت یک عینک علمی');
  if (!lastP4 || daysBetween_(lastP4, today) >= 7) lines.push('• جلسه هفتگی برگه سفید ۶۰ دقیقه‌ای');
  if (!lastP9 || daysBetween_(lastP9, today) >= 30) lines.push('• ممیزی دوحلقه‌ای ماهانه');
  if (seedlings) lines.push('• ' + seedlings + ' نهال در نهالستان مزرعه منتظر جای‌گذاری');
  caseRev.forEach(function (t) { lines.push('• کارخانه معرفت‌شناسی — بازبینی پرونده «' + t + '»: نتیجه واقعی را ثبت کن'); });
  if (caseOpen) lines.push('• ' + caseOpen + ' پرونده باز در کارخانه معرفت‌شناسی');
  if (active > 2) lines.push('• هشدار: ' + active + ' منبع فعال هم‌زمان (سقف پیشنهادی ۲)');
  if (!lines.length) return;
  var url = ScriptApp.getService().getUrl() || '';
  var html = '<div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:2">' +
    '<h3 style="margin:0">کارهای امروز: سامانه یادگیری و کارخانه معرفت‌شناسی</h3>' + lines.map(function (l) { return '<div>' + l + '</div>'; }).join('') +
    (url ? '<p><a href="' + url + '">باز کردن سامانه</a></p>' : '') + '</div>';
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: 'یادگیری عمیق — کارهای امروز', htmlBody: html });
}

function daysBetween_(a, b) {
  var pa = a.split('-'), pb = b.split('-');
  return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 864e5);
}

/** یک بار از ویرایشگر اجرا کن تا مجوزها گرفته و پایگاه داده ساخته شود. */
function setup() {
  var url = api_dbUrl();
  Logger.log('پایگاه داده: ' + url);
  return url;
}
