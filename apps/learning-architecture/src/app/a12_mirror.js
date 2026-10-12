/* ===== آینهٔ درایو: برای هر پرونده، هر موضوع و دوره یک فولدر + یک شیتِ تب‌دار در درایو (مالک ۲۰۲۶-۱۰-۱۲) =====
   پایگاه‌دادهٔ Lifemanager منبعِ اصلی است؛ این‌جا فقط «سندِ خوانا» ِ هر مورد ساخته و برای میزبان فرستاده می‌شود
   (POST /api/app-records/learning-architecture/mirror). کارِ دوره‌ایِ سرور هر ۱۵ دقیقه (یا دکمهٔ «همگام‌سازیِ الان») آن را در
   LifeManagerData/learning-architecture/<گروه>/<عنوان · شناسه>/ به یک شیت با یک تب برای هر بخش می‌نویسد.
   برای افزودنِ نوعِ تازه فقط یک سازنده به BUILD اضافه کن؛ سرور و جدول عوض نمی‌شوند.
   فقط در حالتِ میزبان (Lifemanager) کار می‌کند؛ در نسخهٔ مستقل بی‌اثر است. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  if (!A.HOST || !A.HOST.mirror) { A.mirrorInfo = function () { return null; }; return; }

  /* ---------- مقدار ⇐ متن ---------- */
  function txt(v) {
    if (v == null) return "";
    if (typeof v === "boolean") return v ? "بله" : "خیر";
    if (Array.isArray(v)) return v.map(function (x, i) { return (i + 1) + ". " + txt(x); }).join("\n");
    if (typeof v === "object") return Object.keys(v).filter(function (k) { return k.charAt(0) !== "_"; }).map(function (k) { return k + ": " + txt(v[k]); }).join(" | ");
    return String(v);
  }
  function fieldRows(fields, data, prefix) {
    var rows = [];
    (fields || []).forEach(function (f) {
      if (!f || !f.k || f.t === "info") return;
      var v = (data || {})[f.k];
      if (!A.filled(v)) return;
      if (f.t === "table" && Array.isArray(v)) {
        v.forEach(function (row, i) { rows.push((prefix || []).concat([f.l + " · ردیف " + (i + 1), (f.cols || []).map(function (c) { return c.l + ": " + txt(row[c.k]); }).join(" | ")])); });
      } else if (f.t === "draw") rows.push((prefix || []).concat([f.l, "[طرح رسم‌شده — فقط در برنامه]"]));
      else if (f.t === "timer") rows.push((prefix || []).concat([f.l, v && v.sec ? Math.round(v.sec / 60) + " دقیقه" : ""]));
      else rows.push((prefix || []).concat([f.l, txt(v)]));
    });
    return rows;
  }
  function link(tab, a, s) {
    var q = "tab=" + encodeURIComponent(tab) + (a ? "&a=" + encodeURIComponent(a) : "") + (s ? "&s=" + encodeURIComponent(s) : "");
    return location.origin + location.pathname + "?" + q;
  }
  function dt(iso) { return iso ? String(iso).slice(0, 16).replace("T", " ") : ""; }

  /* ---------- سازنده‌ها: نوعِ رکورد ⇐ سند ---------- */
  var BUILD = {};
  BUILD["case"] = function (cs) {
    var st = cs.st || {};
    var intake = (st.st_intake || {}).data || {};
    var claims = (((st.st_tasdiq || {}).data || {}).claims || []).map(function (c) { return typeof c === "string" ? { txt: c } : c; });
    var tabs = [];
    tabs.push({ name: "خلاصه", rows: [["فیلد", "مقدار"], ["عنوان", cs.title || ""], ["ورودی", intake.input || ""], ["نوع", intake.kind || ""],
      ["مسیر", cs.mode === "quick" ? "سریع" : "کامل"], ["وضعیت", cs.status || ""], ["ساخته‌شده", dt(cs.created)], ["آخرین تغییر", dt(cs.updated)],
      ["در برنامه", link("e_case", cs.id)]] });
    tabs.push({ name: "تصدیق‌ها", rows: [["#", "تصدیق"]].concat(claims.map(function (c, i) { return [i + 1, c.txt || txt(c)]; })) });
    var srows = [["سالن", "ایستگاه", "انجام‌شده", "پرسش/فیلد", "پاسخ"]];
    (A.ESTL || []).forEach(function (s) {
      var d = st[s.id]; if (!d || !d.data) return;
      var hall = (((window.EPI || {}).HALLS || [])[s.hall] || {}).fa || "";
      fieldRows(s.ws, d.data, [hall, s.fa, d.done ? "✓" : ""]).forEach(function (r) { srows.push(r); });
    });
    tabs.push({ name: "ایستگاه‌ها", rows: srows });
    var fin = (st.st_final || {}).data || {}, fs = (A.EST || {}).st_final;
    tabs.push({ name: "حکم و پیگیری", rows: [["پرسش/فیلد", "پاسخ"]].concat(fs ? fieldRows(fs.ws, fin) : Object.keys(fin).map(function (k) { return [k, txt(fin[k])]; })) });
    var out = cs.outcome || {};
    tabs.push({ name: "نتیجهٔ واقعی", rows: [["تصدیق", "نتیجه"]].concat(Object.keys(out).map(function (k) { var c = claims[+k - 1]; return [c ? (k + ". " + (c.txt || "")) : k, txt(out[k])]; })) });
    return { group: "پرونده‌ها", title: cs.title || "پرونده", tabs: tabs };
  };
  BUILD.topic = function (t) {
    var id = t.id, tabs = [];
    tabs.push({ name: "خلاصه", rows: [["فیلد", "مقدار"], ["عنوان", t.title || ""], ["حوزه", t.dom || ""], ["منبع", t.src || ""], ["نوع", t.kind || ""],
      ["موضوعِ دوره", t.course ? "بله" : ""], ["ساخته‌شده", dt(t.created)], ["آخرین تغییر", dt(t.updated)], ["در برنامه", link("topic", id)]] });
    var exs = S.all("ex", function (e) { return e.topic === id && !e.sample; });
    tabs.push({ name: "تمرین‌ها", rows: [["تکنیک", "فاز", "وضعیت", "نمرهٔ روبریک", "آخرین تغییر", "در برنامه"]].concat(exs.map(function (e) {
      var T = A.TM[e.tid] || {}; var p = A.rubricPct(e);
      return [e.tid + " · " + (T.fa || ""), (A.C.PHASES[A.phaseOf(e.tid)] || {}).short || "", e.status === "done" ? "کامل" : "پیش‌نویس", p == null ? "" : p + "٪", dt(e.updated), link("tech", e.tid, "ws:" + e.id)];
    })) });
    var det = [["تکنیک", "پرسش/فیلد", "پاسخ"]];
    exs.forEach(function (e) { var T = A.TM[e.tid]; if (T) fieldRows(T.ws, e.data, [e.tid + " · " + T.fa]).forEach(function (r) { det.push(r); }); });
    tabs.push({ name: "جزئیاتِ تمرین‌ها", rows: det });
    var prs = S.all("pr", function (r) { return r.topic === id; }), prow = [["پروتکل", "پرسش/فیلد", "پاسخ"]];
    prs.forEach(function (r) { var P = A.PM[r.pid]; fieldRows(P && P.ws, r.data, [P ? P.fa : r.pid]).forEach(function (x) { prow.push(x); }); });
    tabs.push({ name: "پروتکل‌ها", rows: prow });
    var sc = S.all("sched", function (s) { return s.topic === id; });
    tabs.push({ name: "چرخهٔ بازیابی", rows: [["نوبت", "موعد", "انجام‌شده"]].concat(sc.map(function (s) { return [s.label || "", s.due || "", s.done ? "✓" : ""]; })) });
    var cards = S.all("card", function (c) { return c.topic === id; });
    tabs.push({ name: "کارت‌های مرور", rows: [["پرسش", "پاسخ", "موعدِ بعدی", "تعدادِ مرور"]].concat(cards.map(function (c) { return [c.q || "", c.a || "", c.due || "", (c.hist || []).length]; })) });
    return { group: "موضوع‌ها", title: t.title || "موضوع", tabs: tabs };
  };
  BUILD.course = function (c) {
    var L = A.COURSE_LESSONS || [], tp = c.topic && S.get(c.topic);
    var rows = [["درس", "منزل", "تکنیک", "تمام‌شده", "گرم‌کردنِ بعدی", "آخرین پاسخِ گرم‌کردن"]];
    L.forEach(function (l, i) {
      var w = (c.warm || {})[l.tid] || {};
      rows.push([i + 1, l.w, l.tid + " · " + ((A.TM[l.tid] || {}).fa || ""), (c.done || {})[l.tid] || "", w.due || "", w.g == null ? "" : ["یادم نبود", "تا حدی", "یادم بود"][w.g]]);
    });
    return { group: "دوره", title: "دورهٔ گام‌به‌گام", tabs: [
      { name: "خلاصه", rows: [["فیلد", "مقدار"], ["موضوعِ دوره", tp ? tp.title : ""], ["شروع", c.started || ""], ["درس‌های تمام‌شده", Object.keys(c.done || {}).length + " از " + L.length], ["در برنامه", link("course")]] },
      { name: "پیشرفت", rows: rows }] };
  };
  A.MIRROR_BUILD = BUILD;

  /* ---------- صف: چه چیزی دوباره ساخته شود ---------- */
  var dirty = {}, gone = {}, timer = null;
  function owners(r) {
    if (!r) return [];
    if (BUILD[r.type]) return [r.id];
    var out = [];
    if (r.topic && (r.type === "ex" || r.type === "pr" || r.type === "sched" || r.type === "card")) out.push(r.topic);
    if (r.type === "topic" || (r.type === "ex" && r.course)) out.push("course");
    return out;
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(flush, 2500); }
  function flush() {
    var items = [];
    Object.keys(dirty).forEach(function (id) { var r = S.get(id); if (r && BUILD[r.type] && !r.sample) { try { var d = BUILD[r.type](r); d.rec_id = id; items.push(d); } catch (e) { console.error(e); } } });
    var del = Object.keys(gone);
    dirty = {}; gone = {};
    if (!items.length && !del.length) return;
    A.HOST.mirror({ items: items.slice(0, 200), deleted: del.slice(0, 200) }).then(function () { A._mirrorCache = null; }, function (e) { console.warn("mirror", e); });
  }
  var rawPut = S.put, rawDel = S.del;
  S.put = function (r) { var out = rawPut.apply(this, arguments); try { owners(r).forEach(function (id) { dirty[id] = 1; }); schedule(); } catch (e) { } return out; };
  S.del = function (id) { var r = S.get(id); var out = rawDel.apply(this, arguments); try { if (r && BUILD[r.type]) { gone[id] = 1; delete dirty[id]; } else owners(r).forEach(function (x) { dirty[x] = 1; }); schedule(); } catch (e) { } return out; };

  /* ---------- پرکردنِ اولیه: هر موردی که هنوز آینه ندارد ---------- */
  A.mirrorBackfill = function () {
    return A.mirrorInfo(true).then(function (info) {
      if (!info) return 0;
      var known = {}; (info.items || []).forEach(function (i) { known[i.rec_id] = 1; });
      var n = 0;
      Object.keys(BUILD).forEach(function (t) { S.all(t, function (r) { return !r.sample; }).forEach(function (r) { if (!known[r.id]) { dirty[r.id] = 1; n++; } }); });
      if (n) schedule();
      return n;
    });
  };
  A.mirrorInfo = function (fresh) {
    if (!A.HOST.mirrorList) return Promise.resolve(null);
    if (A._mirrorCache && !fresh) return A._mirrorCache;
    A._mirrorCache = A.HOST.mirrorList().then(function (d) { var m = {}; (d.items || []).forEach(function (i) { m[i.rec_id] = i; }); d.map = m; return d; }, function () { A._mirrorCache = null; return null; });
    return A._mirrorCache;
  };
  setTimeout(function () { try { A.mirrorBackfill(); } catch (e) { } }, 6000);

  /* ---------- نشان‌دادنِ پیوند در خودِ صفحه ---------- */
  var REC_OF = { e_case: function () { return A.state.arg; }, topic: function () { return A.state.arg; }, course: function () { return "course"; }, lesson: function () { return "course"; } };
  function chip(info, rid) {
    var box = h("span", { class: "drv" });
    if (!info) return box;
    var it = info.map && info.map[rid];
    if (!info.connected) { box.appendChild(h("span", { class: "small muted" }, "📁 درایو وصل نیست")); return box; }
    if (!it) { box.appendChild(h("span", { class: "small muted", title: "حداکثر چند دقیقه دیگر ساخته می‌شود" }, "📁 در صفِ ساختِ فولدر…")); return box; }
    if (it.folder_url) box.appendChild(h("a", { class: "drvlink", href: it.folder_url, target: "_blank", rel: "noopener" }, "📁 فولدر در درایو"));
    if (it.sheet_url) box.appendChild(h("a", { class: "drvlink", href: it.sheet_url, target: "_blank", rel: "noopener" }, "📊 شیت"));
    if (it.pending) box.appendChild(h("span", { class: "small muted" }, it.folder_url ? " (تغییرهای تازه در صف)" : "📁 در صفِ ساختِ فولدر…"));
    if (it.error) box.appendChild(h("span", { class: "small bad", title: it.error }, " ⚠ " + it.error.slice(0, 80)));
    return box;
  }
  var rawRender = A.render;
  A.render = function () {
    rawRender();
    var f = REC_OF[A.state.view]; if (!f) return;
    var rid = f(); if (!rid) return;
    var bar = document.querySelector("#main .crumbs .where"); if (!bar) return;
    var slot = h("span", { class: "drvslot" }); bar.appendChild(slot);
    A.mirrorInfo().then(function (info) { slot.innerHTML = ""; slot.appendChild(chip(info, rid)); });
  };

  /* ---------- در «تنظیمات»: وضعیت و همگام‌سازیِ الان ---------- */
  var rawSettings = A.V.settings;
  A.V.settings = function () {
    var root = rawSettings.apply(this, arguments);
    var sec = h("section", { class: "card" }, h("h2", {}, "📁 گوگل درایو"), h("p", { class: "small muted" }, "در حالِ خواندنِ وضعیت…"));
    root.insertBefore(sec, root.children[1] || null);
    A.mirrorInfo(true).then(function (info) {
      sec.innerHTML = "";
      sec.appendChild(h("h2", {}, "📁 گوگل درایو"));
      if (!info) { sec.appendChild(h("p", { class: "small bad" }, "وضعیتِ درایو خوانده نشد.")); return; }
      var items = info.items || [], pend = items.filter(function (i) { return i.pending; }).length, err = items.filter(function (i) { return i.error; }).length;
      sec.appendChild(h("p", {}, "هر پرونده، هر موضوع و دوره یک فولدر با یک شیتِ تب‌دار در «LifeManagerData › learning-architecture» دارد. اصلِ داده در پایگاه‌دادهٔ برنامه است؛ درایو هر چند دقیقه خودکار به‌روز می‌شود."));
      sec.appendChild(h("p", { class: "small" }, (info.connected ? "✓ درایو وصل است" : "✗ درایو وصل نیست — در تنظیماتِ Lifemanager وصلش کن") + " · " + fa(items.length) + " مورد · " + fa(pend) + " در صف" + (err ? " · " + fa(err) + " خطا" : "")));
      sec.appendChild(h("div", { class: "row gap wrap" },
        info.root_url ? h("a", { class: "btn ghost sm", href: info.root_url, target: "_blank", rel: "noopener" }, "باز کردنِ LifeManagerData") : null,
        h("button", { class: "btn sm", onclick: function (e) {
          var b = e.target; b.disabled = true; b.textContent = "در حالِ نوشتن در درایو…";
          A.mirrorBackfill().then(function () { flush(); return new Promise(function (r) { setTimeout(r, 800); }); }).then(function () { return A.HOST.mirrorSync(); })
            .then(function (r) { A.toast((r && r.skipped === "no_drive") ? "درایو وصل نیست؛ چیزی گم نمی‌شود و بعداً نوشته می‌شود." : "نوشته شد: " + fa((r && r.written) || 0) + " مورد"); A._mirrorCache = null; A.render(); },
              function (er) { A.toast((er && er.message) || "خطا", "bad"); b.disabled = false; });
        } }, "همگام‌سازیِ الان")));
      var errs = items.filter(function (i) { return i.error; }).slice(0, 5);
      if (errs.length) sec.appendChild(h("ul", { class: "small" }, errs.map(function (i) { return h("li", {}, i.title + ": " + i.error); })));
    });
    return root;
  };
})(APP);
