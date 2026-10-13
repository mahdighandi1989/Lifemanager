/* ===== «♾ بک‌تستِ پیوسته» در «اعتبارسنجیِ کارخانه و جزوه» (مالک ۲۰۲۶-۱۰-۱۳) =====
   داده از `backtest/*.json` می‌آید که اجراکنندهٔ قطعیِ `tools/epi_backtest.js` بعد از هر دور می‌نویسد و build در بسته می‌گذارد
   (`window.EPI_BT_LEDGER`). صفحه چیزی محاسبه نمی‌کند؛ فقط همان دفتر را نشان می‌دهد — هر دور، هر یافته و سرانجامش، و هر واقعه.
   تصمیمِ مالک دربارهٔ پیشنهادِ تغییرِ قاعده (`ebtp_<id>`) در رکوردهای خودش می‌ماند تا ناظرِ دوره‌ای بخواند. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  var KIND = { health_alarm: "هشدارِ کاذب روی واقعهٔ سالم", missed: "شکستِ دیده‌نشده", mislocated: "شکست در جای نادرست" };
  var STATUS = { open: ["⚠", "باز — هنوز علتش تعیین نشده"], diagnosed: ["⚠", "علت تعیین شد — اصلاح نشده"], reopened: ["⚠", "دوباره باز شد"],
    fixed: ["🔧", "اصلاح شد — منتظرِ آزمون روی وقایعِ تازه"], resolved: ["◌", "درست شد بی اصلاحِ ثبت‌شده — منتظرِ آزمونِ تازه"], verified: ["✅", "اصلاح شد و روی وقایعِ تازه تأیید شد"] };
  function stn(id) { var s = A.EST && A.EST[id]; return s ? s.fa : id; }
  function pct(x) { return x == null ? "—" : fa(Math.round(100 * x)) + "٪"; }
  function L() { return window.EPI_BT_LEDGER || { ledger: { rounds: [] }, findings: { findings: [] }, results: { cases: [] }, proposals: { proposals: [] } }; }
  function spark(vals) {
    var s = A.svg, w = 160, hh = 28; if (!s || vals.length < 2) return null;
    var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), rg = mx - mn || 1;
    var pts = vals.map(function (v, i) { return (i * w / (vals.length - 1)).toFixed(1) + "," + (hh - 2 - (v - mn) / rg * (hh - 4)).toFixed(1); }).join(" ");
    var svg = s("svg", { viewBox: "0 0 " + w + " " + hh, width: w, height: hh, class: "bt-spark", "aria-hidden": "true" });
    svg.appendChild(s("polyline", { points: pts, fill: "none", stroke: "currentColor", "stroke-width": "1.6" })); return svg;
  }
  function stat(lab, val, sub, bad) { return h("div", { class: "card soft bt-stat" + (bad ? " bad" : "") }, h("div", { class: "small muted" }, lab), h("div", { class: "bt-num" }, val), sub ? h("div", { class: "small" }, sub) : null); }

  A.btLivePanel = function () {
    var D = L(), rounds = D.ledger.rounds || [], last = rounds[rounds.length - 1], F = D.findings.findings || [];
    var box = h("div", { class: "col gap bt-live", dir: "rtl" });
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "♾ بک‌تستِ پیوسته — کارخانه و جزوه هر دور دوباره آزموده می‌شوند"),
      h("p", {}, "هر دور: وقایعِ واقعیِ تازه (علم، ریاضی، پزشکی، تاریخ، بازار، حقوق، دین، زندگی…) و سناریوهای انتزاعیِ هم‌ساختارِ آن‌ها — هیچ‌کدام تکراری نیست — از کارخانه رد می‌شوند. داوری قطعی است و هیچ هوش مصنوعی‌ای در آن نیست؛ هوش مصنوعی فقط گردآورنده و رمزگذار است (رمزگذار برچسبِ حقیقت را نمی‌بیند)."),
      h("ul", { class: "small" },
        h("li", {}, h("b", {}, "آزمونِ سلامت: "), "واقعه‌ای که واقعاً و نه از شانس سالم به نتیجه رسیده باید بی‌پرچم بگذرد؛ اگر پرچم بخورد، سامانه نقص دارد (هشدارِ کاذب)."),
        h("li", {}, h("b", {}, "آزمونِ تشخیص: "), "واقعه‌ای که شکست خورده باید دیده شود، در ایستگاهِ درست، با «راهِ درست»."),
        h("li", {}, h("b", {}, "هر نقص یک «یافته»: "), "علتش تعیین می‌شود — اشتباهِ جزوه (استاد)، بدفهمیِ سازنده، رمزگذاری، یا برچسب — و زیرِ همان بخشِ جزوه ثبت می‌شود. اصلاح فقط وقتی پذیرفته است که روی وقایعِ ", h("b", {}, "تازه"), " (نه همان مورد) هم درست درآید."),
        h("li", {}, h("b", {}, "کنترل‌ها: "), "با برچسب‌های جابه‌جاشده توافق باید فرو بریزد (وگرنه آزمون کور است)؛ خطای کاشته‌شده باید دیده شود."),
        h("li", {}, h("b", {}, "چه کسی اجرا می‌کند: "), "ناظرِ دوره‌ای (روتینِ خودکار) هر دور: گردآوری ⇒ رمزگذاریِ کور ⇒ اجرای قطعی ⇒ تشخیصِ علت ⇒ اصلاحِ خطای سازنده ⇒ پیشنهادِ تغییرِ قاعده برای تصمیمِ تو ⇒ «جزوهٔ متقن» ِ تازه.")),
      A.HOST && A.HOST.openDoc ? h("button", { class: "btn sm bt-verified", onclick: function () { A.HOST.openDoc("VERIFIED_BOOKLET"); } }, "📜 جزوهٔ متقن: هر بخشِ جزوه و وضعِ آزموده‌شدنش")
        : h("p", { class: "small muted" }, "«جزوهٔ متقن» (هر بخشِ جزوه با وضعِ آزموده‌شدنش) در نسخهٔ داخلِ Lifemanager از دکمهٔ «📜 جزوهٔ متقن» بالای صفحه باز می‌شود؛ روی GitHub: apps/learning-architecture/docs/VERIFIED_BOOKLET.md")));
    if (!last) { box.appendChild(h("section", { class: "card" }, h("p", {}, "هنوز هیچ دوری اجرا نشده."))); return box; }
    var b = (last.books || {}).mesbah || {}, c = b.controls || {};
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "دورِ " + fa(last.round) + " — " + (A.fdate ? A.fdate(last.at) : last.at) + (last.note ? " · " + last.note : "")),
      h("div", { class: "bt-stats" },
        stat("پیکره", fa(last.corpus.n), "تازه در این دور: " + fa(last.corpus.new || 0)),
        stat("آزمونِ سلامت", fa(b.healthAlarms) + " هشدارِ کاذب", "از " + fa(b.sound) + " واقعهٔ سالم", b.healthAlarms > 0),
        stat("تشخیصِ شکست", fa(b.detected) + " از " + fa(b.failures), "در جای درست " + fa(b.located) + " · کاملاً " + fa(b.fullyLocated)),
        stat("کنترلِ منفی", pct(c.negAgree), "باید زیرِ " + pct(c.agree) + " باشد " + (c.negOk ? "✓" : "⚠"), !c.negOk),
        stat("کنترلِ مثبت", pct(c.posDetect), "خطای کاشته‌شده دیده شد " + (c.posOk ? "✓" : "⚠"), !c.posOk),
        stat("پوشش", fa(last.coverage.rulesTested) + " از " + fa(last.coverage.rules) + " قاعده", fa(last.coverage.sectionsTested) + " از " + fa(last.coverage.sections) + " بخشِ جزوه"))));
    /* روند */
    if (rounds.length) box.appendChild(h("section", { class: "card" }, h("h3", {}, "روندِ دورها"),
      h("div", { class: "row gap wrap small" }, h("span", {}, "پیکره: "), spark(rounds.map(function (r) { return r.corpus.n; })), h("span", {}, " قاعده‌های آزموده: "), spark(rounds.map(function (r) { return r.coverage.rulesTested; }))),
      h("div", { class: "scrollx" }, h("table", { class: "wt bt-rounds" }, h("thead", {}, h("tr", {}, ["دور", "تاریخ", "پیکره (+تازه)", "هشدارِ کاذب", "شکستِ دیده‌شده", "در جای درست", "یافتهٔ باز", "تأییدشده روی تازه", "قاعدهٔ آزموده"].map(function (x) { return h("th", {}, x); }))),
        h("tbody", {}, rounds.slice().reverse().slice(0, 40).map(function (r) { var m = (r.books || {}).mesbah || {}; return h("tr", {}, h("td", {}, fa(r.round)), h("td", { class: "small" }, r.at), h("td", {}, fa(r.corpus.n) + " (+" + fa(r.corpus.new || 0) + ")"),
          h("td", { class: m.healthAlarms ? "bad" : "" }, fa(m.healthAlarms || 0)), h("td", {}, fa(m.detected) + "/" + fa(m.failures)), h("td", {}, fa(m.located)), h("td", {}, fa(r.findings.open)), h("td", {}, fa(r.findings.verified)), h("td", {}, fa(r.coverage.rulesTested))); }))))));
    /* یافته‌ها */
    var order = ["open", "reopened", "diagnosed", "fixed", "resolved", "verified"];
    var fsec = h("section", { class: "card bt-findings" }, h("h3", {}, "یافته‌ها (" + fa(F.length) + ") — هر نقص و سرانجامش"));
    if (!F.length) fsec.appendChild(h("p", { class: "small muted" }, "هیچ نقصی ثبت نشده."));
    order.forEach(function (st) {
      var arr = F.filter(function (f) { return f.status === st; }); if (!arr.length) return;
      fsec.appendChild(h("h4", {}, (STATUS[st] || ["", st])[0] + " " + (STATUS[st] || ["", st])[1] + " (" + fa(arr.length) + ")"));
      fsec.appendChild(h("ul", { class: "plain" }, arr.map(function (f) {
        return h("li", { class: "card soft bt-finding", "data-status": f.status },
          h("div", { class: "row between wrap" }, h("button", { class: "linkish", onclick: function () { A.go("e_lib", f.case); } }, h("strong", {}, f.title)), h("span", { class: "chip" }, KIND[f.kind] || f.kind)),
          h("div", { class: "small" }, "انتظار: " + ((f.expected || []).map(stn).join("، ") || "سالم") + " · کارخانه: " + ((f.flagged || []).map(stn).join("، ") || "بی‌پرچم") + (f.secs && f.secs.length ? " · بخش‌های جزوه: " + f.secs.join("، ") : "")),
          f.attribution ? h("div", { class: "small" }, h("b", {}, "علت: "), f.attribution, f.note ? " — " + f.note : "") : h("div", { class: "small muted" }, "علت هنوز تعیین نشده — کارِ دورِ بعدِ ناظر"),
          f.fix ? h("div", { class: "small" }, h("b", {}, "اصلاح: "), f.fix.what || "", f.fix.round ? " (دورِ " + fa(f.fix.round) + ")" : "") : null,
          f.retest ? h("div", { class: "small muted" }, "آزمونِ تازه: " + fa(f.retest.freshOk) + " از " + fa(f.retest.fresh) + " واقعهٔ تازه درست (پذیرش با دست‌کم ۳)") : null);
      })));
    });
    box.appendChild(fsec);
    /* پیشنهادهای تغییرِ قاعده: تصمیمِ تو */
    var PR = (D.proposals || {}).proposals || [];
    if (PR.length) box.appendChild(h("section", { class: "card bt-proposals" }, h("h3", {}, "پیشنهادِ تغییرِ قاعده — تصمیمِ تو لازم است"),
      h("p", { class: "small muted" }, "ناظر قاعده‌ها را خودش عوض نمی‌کند: پیشنهاد با شاهد این‌جا می‌آید؛ تصمیمت ذخیره می‌شود و دورِ بعد اجرا (و روی وقایعِ تازه آزموده) می‌شود."),
      h("ul", { class: "plain" }, PR.map(function (p) {
        var rec = S.get("ebtp_" + p.id) || {};
        function decide(d) { S.put({ id: "ebtp_" + p.id, type: "ebtp", decision: d, at: new Date().toISOString() }); A.toast(d === "yes" ? "پذیرفتی — دورِ بعد اعمال و آزموده می‌شود." : "رد شد — همین در دفتر می‌ماند."); A.render(); }
        return h("li", { class: "card soft bt-proposal" }, h("strong", {}, p.title), h("p", { class: "small" }, p.why), p.evidence ? h("p", { class: "small muted" }, p.evidence) : null,
          rec.decision ? h("div", { class: "small" }, "تصمیمِ تو: " + (rec.decision === "yes" ? "✓ پذیرفته" : "✗ رد")) :
            h("div", { class: "row gap" }, h("button", { class: "btn sm", onclick: function () { decide("yes"); } }, "بپذیر"), h("button", { class: "btn ghost sm", onclick: function () { decide("no"); } }, "رد کن")));
      }))));
    /* شکاف‌ها */
    var un = (last.coverage.untested || []);
    if (un.length) box.appendChild(h("details", { class: "card soft" }, h("summary", {}, "قاعده‌هایی که هنوز هیچ واقعه‌ای آن‌ها را نیازموده (" + fa(un.length) + ") — هدفِ گردآوریِ دورهای بعد"),
      h("ul", { class: "small" }, un.map(function (id) { var r = (window.EPIX && window.EPIX.RM || {})[id]; return h("li", {}, (r ? r.fa : id) + " ", h("span", { class: "muted" }, "(" + ((r && r.sec) || []).join("، ") + ")")); }))));
    /* هر واقعه */
    var R = D.results.cases || [];
    var rows = h("tbody");
    var sel = h("select", { "aria-label": "پالایه", onchange: function () { fill(sel.value); } }, [["bad", "فقط نادرست‌ها"], ["all", "همه"], ["new", "افزوده در دورها"]].map(function (o) { return h("option", { value: o[0] }, o[1]); }));
    function fill(m) {
      rows.innerHTML = "";
      R.filter(function (x) { return m === "all" ? true : m === "new" ? x.r > 0 : x.k !== "ok"; }).slice(0, 400).forEach(function (x) {
        var name = x.r > 0 ? h("details", { class: "bt-ev" }, h("summary", {}, x.t + (x.y ? " (" + fa(x.y) + ")" : "")),
            x.story ? h("p", { class: "small" }, x.story) : null, x.from ? h("p", { class: "small muted" }, "هم‌ساختارِ: " + x.from) : null,
            x.why ? h("p", { class: "small" }, h("b", {}, x.ok ? "چرا سالم بود: " : "چرا شکست خورد: "), x.why) : null,
            x.right ? h("p", { class: "small" }, h("b", {}, x.ok ? "چه چیزی درستش کرد: " : "راهِ درست: "), x.right) : null,
            (x.fx || []).length ? h("p", { class: "small" }, h("b", {}, "راهِ درست به حکمِ کارخانه: "), x.fx.join(" ")) : null,
            (x.src || []).length ? h("p", { class: "small muted" }, "منبع: " + x.src.join("؛ ")) : null)
          : h("button", { class: "linkish", onclick: function () { A.go("e_lib", x.id); } }, x.t);
        rows.appendChild(h("tr", { class: x.k !== "ok" ? "warnrow" : "" }, h("td", {}, name), h("td", { class: "small" }, x.d || ""),
          h("td", { class: "small" }, { real: "واقعی", abstract: "انتزاعی", booklet: "مثالِ جزوه", problem: "مسئله" }[x.tier] || x.tier), h("td", {}, x.ok ? "سالم" : "شکست"),
          h("td", { class: "small" }, x.k === "ok" ? "✓ درست" : KIND[x.k] || x.k)));
      });
    }
    box.appendChild(h("details", { class: "card" }, h("summary", {}, "حکمِ آخرین دور برای هر واقعه (" + fa(R.length) + ")"), h("div", { class: "row gap" }, sel),
      h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, ["واقعه", "حوزه", "نوع", "حقیقت", "حکمِ کارخانه"].map(function (x) { return h("th", {}, x); }))), rows))));
    fill("bad");
    return box;
  };
})(APP);
