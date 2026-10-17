/* ===== دو ابزارِ تازه برای کمبودهای «🗺 قلمروِ سامانه‌ها» (۲۰۲۶-۱۰-۱۴) =====
   ۱) «⛓ زنجیرهٔ نگرانی» (کمبودِ md_worry_uncertainty / md_anxiety_fear / dc_career_income): ترسی مثلِ «کارم را از دست می‌دهم ⇒ هیچ‌وقت کار پیدا
      نمی‌کنم ⇒ نابود می‌شوم» به حلقه‌ها شکسته می‌شود؛ هر حلقه احتمالی دارد. بر پایهٔ اصول: کلِ زنجیره از ضعیف‌ترین حلقه محتمل‌تر نیست (A1،
      T_weakest) و با حلقه‌های مستقل حاصل‌ضرب است (A3، T_product). کنارِ «حسِ اول» ِ خودت گذاشته می‌شود؛ حلقه‌هایی که در دستِ توست جدا می‌شوند؛
      در موعد نتیجهٔ واقعی ثبت می‌شود و به کالیبراسیونِ «ذهن و هیجان» در «🧠 کارنامهٔ ذهن» می‌رود.
   ۲) «🎯 دفترِ پیش‌بینی» (کمبودِ dc_calibration_forecasting / pr_calibration_forecasting / ln_metacognition_jol / sf_blind_spots): پیش‌بینیِ زندگی با احتمال و
      موعد؛ در موعد «شد/نشد» ⇒ امتیازِ Brier (قضیه: میانگینِ مربعِ فاصلهٔ احتمال تا رخداد، A2/A3) و نمودارِ کالیبراسیون در کارنامه.
   هر دو رکوردِ معمولی‌اند (S.put) و در «امروز» موعدشان می‌آید. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  function num(v) { v = parseFloat(String(v == null ? "" : v).replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); })); return isNaN(v) ? null : Math.max(0, Math.min(100, v)); }
  var DIMS = function () { return A.MIND ? A.MIND.dims() : [{ id: "s_mind", fa: "ذهن و هیجان" }]; };

  /* ---------- ⛓ زنجیرهٔ نگرانی ---------- */
  A.chainCalc = function (c) {
    var ps = (c.links || []).map(function (l) { return num(l.p); }).filter(function (p) { return p != null; });
    if (!ps.length) return null;
    var prod = ps.reduce(function (t, p) { return t * p / 100; }, 1) * 100, min = Math.min.apply(null, ps);
    return { prod: Math.round(prod * 10) / 10, min: min, n: ps.length };
  };
  A.V.chain = function (arg) {
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("ذهن و هیجان", "⛓ زنجیرهٔ نگرانی", "ترسی که در ذهن یک‌جا و قطعی به نظر می‌رسد را به حلقه‌هایش بشکن. کلِ زنجیره هیچ‌وقت از ضعیف‌ترین حلقه‌اش محتمل‌تر نیست، و اگر حلقه‌ها مستقل باشند احتمالِ کل حاصل‌ضربِ آن‌هاست — قضیه، نه دلداری."));
    var c = arg && S.get(arg);
    if (!c) {
      var list = S.all("wchain").sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); });
      var t = h("input", { type: "text", id: "wcT", placeholder: "ترس در یک جمله؛ مثلاً «کارم را از دست می‌دهم و دیگر کاری پیدا نمی‌کنم»" });
      var f = h("input", { type: "number", id: "wcF", min: 0, max: 100, placeholder: "۰ تا ۱۰۰" });
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "زنجیرهٔ تازه"), h("label", { for: "wcT" }, "ترس"), t,
        h("label", { for: "wcF" }, "حسِ اولت: چقدر محتمل به نظر می‌رسد؟ (درصد)"), f,
        h("button", { class: "btn", type: "button", onclick: function () {
          if (!t.value.trim()) { A.toast("اول ترس را بنویس.", "bad"); return; }
          var r = S.put({ id: A.uid("wc"), type: "wchain", title: t.value.trim(), feel: num(f.value), links: [{ text: "", p: "", ctrl: false }], due: A.addDays(A.today(), 30) });
          A.go("chain", r.id);
        } }, "ساختنِ زنجیره")));
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "زنجیره‌های تو (" + fa(list.length) + ")"), list.length ? h("ul", {}, list.map(function (x) { var k = A.chainCalc(x); return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("chain", x.id); } }, x.title), h("span", { class: "small muted" }, " — حس: " + (x.feel == null ? "—" : fa(x.feel) + "٪") + (k ? " · زنجیره: ≤ " + fa(k.min) + "٪، اگر مستقل: " + fa(k.prod) + "٪" : "") + (x.outcome ? " · نتیجه: " + x.outcome : ""))); })) : h("p", { class: "small muted" }, "هنوز زنجیره‌ای نساخته‌ای.")));
      return root;
    }
    function save() { S.put(c); A.render(); }
    var k = A.chainCalc(c);
    var rows = (c.links || []).map(function (l, i) {
      return h("div", { class: "row gap wrap card soft wc-link", "data-i": i },
        h("b", {}, fa(i + 1) + ")"),
        h("input", { type: "text", "aria-label": "حلقهٔ " + fa(i + 1), placeholder: "اگر … آن‌گاه …", value: l.text || "", onchange: function (e) { l.text = e.target.value; S.put(c); } }),
        h("input", { type: "number", min: 0, max: 100, "aria-label": "احتمالِ حلقهٔ " + fa(i + 1) + " (درصد)", placeholder: "٪", value: l.p == null ? "" : l.p, style: { width: "6em" }, onchange: function (e) { l.p = e.target.value; save(); } }),
        h("label", { class: "row gap small" }, h("input", { type: "checkbox", checked: l.ctrl ? true : null, onchange: function (e) { l.ctrl = e.target.checked; save(); } }), "در دستِ من است"),
        h("input", { type: "text", "aria-label": "شاهد یا نرخِ پایهٔ حلقهٔ " + fa(i + 1), placeholder: "شاهد / نرخِ پایه (اختیاری)", value: l.ev || "", onchange: function (e) { l.ev = e.target.value; S.put(c); } }));
    });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "«" + c.title + "»"),
      h("p", { class: "small" }, "حسِ اول: " + (c.feel == null ? "—" : fa(c.feel) + "٪")),
      h("div", { class: "col gap" }, rows),
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn sm", type: "button", onclick: function () { c.links.push({ text: "", p: "", ctrl: false }); save(); } }, "+ حلقهٔ دیگر"),
        c.links.length > 1 ? h("button", { class: "btn sm ghost", type: "button", onclick: function () { c.links.pop(); save(); } }, "برداشتنِ حلقهٔ آخر") : null)));
    root.appendChild(h("section", { class: "card", "aria-live": "polite" }, h("h2", {}, "حسابِ زنجیره"),
      k ? h("div", {},
        h("p", {}, "سقفِ کلِ زنجیره (هر چه باشد): ", h("b", {}, "≤ " + fa(k.min) + "٪"), h("span", { class: "small muted" }, " — A1: رخدادِ همهٔ حلقه‌ها مستلزمِ رخدادِ ضعیف‌ترین است.")),
        h("p", {}, "اگر حلقه‌ها مستقل باشند: ", h("b", {}, fa(k.prod) + "٪"), h("span", { class: "small muted" }, " — A3: حاصل‌ضرب.")),
        c.feel != null ? h("p", { class: c.feel > k.min ? "warnline" : "" }, c.feel > k.min ? "حسِ اولت (" + fa(c.feel) + "٪) از سقفِ منطقیِ زنجیره (" + fa(k.min) + "٪) بالاتر است — این همان «فاجعه‌سازی» است: حس، کلِ زنجیره را از حلقه‌هایش محتمل‌تر می‌بیند." : "حسِ اولت از سقفِ زنجیره بالاتر نیست.") : null,
        (c.links || []).some(function (l) { return l.ctrl; }) ? h("p", {}, h("b", {}, "حلقه‌هایی که در دستِ توست: "), c.links.filter(function (l) { return l.ctrl; }).map(function (l) { return "«" + (l.text || "؟") + "»"; }).join("، "), " — برای هر کدام یک کارِ کوچک بنویس (مثلاً در «⏳ آزمایشِ واقعی» ِ گره‌گشا).") : null)
        : h("p", { class: "small muted" }, "برای هر حلقه احتمالی (۰ تا ۱۰۰) بنویس.")));
    var due = h("input", { type: "date", "aria-label": "موعدِ وارسیِ نتیجه", value: c.due || "", onchange: function (e) { c.due = e.target.value; S.put(c); } });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "نتیجهٔ واقعی (در موعد)"), h("div", { class: "row gap wrap" }, h("label", {}, "موعد: "), due,
      h("select", { "aria-label": "نتیجهٔ واقعی", onchange: function (e) { c.outcome = e.target.value; c.outcomeAt = A.nowISO(); save(); } }, ["", "رخ داد", "رخ نداد"].map(function (o) { return h("option", { value: o, selected: (c.outcome || "") === o ? true : null }, o || "— هنوز —"); }))),
      h("p", { class: "small muted" }, "نتیجه به کالیبراسیونِ «ذهن و هیجان» در «🧠 کارنامهٔ ذهن» می‌رود: حسِ اولت در برابرِ آنچه واقعاً شد.")));
    root.appendChild(h("button", { class: "linkish", type: "button", onclick: function () { A.go("chain"); } }, "← همهٔ زنجیره‌ها"));
    return root;
  };

  /* ---------- 🎯 دفترِ پیش‌بینی ---------- */
  A.fcastBrier = function (list) { var r = (list || S.all("fcast")).filter(function (x) { return x.outcome === "شد" || x.outcome === "نشد"; }); if (!r.length) return null; var s = 0; r.forEach(function (x) { var p = num(x.p) / 100; s += Math.pow(p - (x.outcome === "شد" ? 1 : 0), 2); }); return { n: r.length, brier: Math.round(1000 * s / r.length) / 1000 }; };
  A.V.fcast = function () {
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("تصمیم و خودتنظیمی", "🎯 دفترِ پیش‌بینی", "پیش‌بینی‌های زندگی‌ات را با احتمال و موعد بنویس؛ در موعد بگو «شد» یا «نشد». امتیازِ Brier (هر چه کمتر بهتر؛ همیشه ۵۰٪ گفتن = ۰٫۲۵) و کالیبراسیونت در «🧠 کارنامهٔ ذهن» می‌آید."));
    var q = h("input", { type: "text", id: "fcQ", placeholder: "مثلاً «تا آخرِ آذر از شرکت تعدیل می‌شوم»" });
    var p = h("input", { type: "number", id: "fcP", min: 0, max: 100, placeholder: "۰ تا ۱۰۰" });
    var d = h("input", { type: "date", id: "fcD", value: A.addDays(A.today(), 30) });
    var dim = h("select", { id: "fcM", "aria-label": "بُعد" }, DIMS().map(function (x) { return h("option", { value: x.id }, x.fa); }));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "پیش‌بینیِ تازه"), h("label", { for: "fcQ" }, "پیش‌بینی (چیزی که بعداً معلوم می‌شود شد یا نشد)"), q,
      h("div", { class: "row gap wrap" }, h("label", { for: "fcP" }, "احتمال (٪)"), p, h("label", { for: "fcD" }, "موعد"), d, h("label", { for: "fcM" }, "بُعد"), dim),
      h("button", { class: "btn", type: "button", onclick: function () {
        if (!q.value.trim() || num(p.value) == null) { A.toast("پیش‌بینی و احتمال را بنویس.", "bad"); return; }
        S.put({ id: A.uid("fc"), type: "fcast", q: q.value.trim(), p: num(p.value), due: d.value || A.addDays(A.today(), 30), dim: dim.value }); A.render();
      } }, "ثبتِ پیش‌بینی")));
    var all = S.all("fcast").sort(function (a, b) { return String(a.due || "").localeCompare(String(b.due || "")); }), br = A.fcastBrier(all);
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "پیش‌بینی‌ها (" + fa(all.length) + ")" + (br ? " · Brier = " + fa(br.brier) + " از " + fa(br.n) + " نتیجه" : "")),
      all.length ? h("ul", { class: "plain" }, all.map(function (x) {
        /* پیش‌بینیِ گامِ «🔭 مسئلهٔ حل‌نشدهٔ خودم»: نتیجه را خودِ گام ثبت می‌کند (شد/نشد/تاحدی/انجام نشد) — این‌جا فقط نشان داده و به گام پیوند داده می‌شود تا دو جا ناهم‌خوان نشوند */
        if (x.live && x.live.pid) return h("li", { class: "row gap wrap fc-live", dir: "rtl" }, h("span", {}, x.q + " — " + fa(x.p) + "٪ · موعد " + A.fdate(x.due)),
          h("span", { class: "chip fc-liveout" }, x.outcome || "— هنوز —"), h("button", { class: "btn ghost sm fc-golive", type: "button", onclick: function () { A.go("lprob", x.live.pid, "exec"); } }, "🔭 نتیجه در گامِ همان مسئله"));
        return h("li", { class: "row gap wrap" }, h("span", {}, x.q + " — " + fa(x.p) + "٪ · موعد " + A.fdate(x.due)),
          h("select", { "aria-label": "نتیجهٔ «" + x.q + "»", onchange: function (e) { x.outcome = e.target.value; x.outcomeAt = A.nowISO(); S.put(x); A.render(); } }, ["", "شد", "نشد"].map(function (o) { return h("option", { value: o, selected: (x.outcome || "") === o ? true : null }, o || "— هنوز —"); })));
      })) : h("p", { class: "small muted" }, "هنوز پیش‌بینی‌ای ثبت نشده.")));
    return root;
  };

  /* ---------- 🧭 ارزش‌ها و معنا (کمبودِ sf_values / sf_meaning — کارزارِ آزمون: کارِ معنا جایی ثبت نمی‌شد) ----------
     ارزش‌ها: اهمیت (۰ تا ۱۰) کنارِ ساعتِ واقعیِ هفته — ناهم‌خوانی دیده می‌شود، داوری نمی‌شود. دو ارزشِ در کشمکش بی «قاعدهٔ ترجیح»
     ناقص‌اند (قضیه، A0: تحققِ کاملِ هر دو یعنی «الف و نه‌الف»). معنا: «حضور» و «جست‌وجو» دو بُعدِ جدا (استگر ۲۰۰۶)، هر ماه یک وارسی
     با واژه‌های خودت — نه پرسشنامهٔ رسمی؛ کدام ارزش «درست» است بیرون از این ابزار است (st_truth). */
  A.valsCheck = function () {
    var vs = S.all("value"), tot = vs.reduce(function (t, v) { return t + (num(v.hours) || 0); }, 0), out = { gaps: [], open: [] };
    vs.forEach(function (v) { var imp = num(v.imp), sh = tot ? (num(v.hours) || 0) / tot : 0; if (imp != null && imp >= 7 && tot && sh < 0.1) out.gaps.push(v.title); });
    vs.forEach(function (v) { (v.vs || []).forEach(function (c) { if (!(c.rule || "").trim()) out.open.push(v.title + " ⟷ " + c.with); }); });
    out.tot = tot; return out;
  };
  A.V.vals = function () {
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("خودشناسی، ارزش‌ها و معنا", "🧭 ارزش‌ها و معنا", "چه چیزی برایت واقعاً مهم است، وقتت واقعاً کجا می‌رود، و دو ارزشِ در کشمکش را با چه قاعده‌ای ترجیح می‌دهی. داوری نمی‌کند کدام ارزش درست است — فقط آینه است."));
    var t = h("input", { type: "text", id: "vlT", placeholder: "مثلاً «خانواده»، «امنیتِ مالی»، «یادگیری»" });
    var im = h("input", { type: "number", id: "vlI", min: 0, max: 10, placeholder: "۰ تا ۱۰" });
    var hr = h("input", { type: "number", id: "vlH", min: 0, max: 100, placeholder: "ساعت در هفته" });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "ارزشِ تازه"), h("label", { for: "vlT" }, "ارزش"), t,
      h("div", { class: "row gap wrap" }, h("label", { for: "vlI" }, "اهمیت برای تو (۰ تا ۱۰)"), im, h("label", { for: "vlH" }, "ساعتِ واقعیِ هفتهٔ گذشته"), hr),
      h("button", { class: "btn", type: "button", onclick: function () {
        if (!t.value.trim()) { A.toast("اول نامِ ارزش را بنویس.", "bad"); return; }
        S.put({ id: A.uid("vl"), type: "value", title: t.value.trim(), imp: num(im.value), hours: num(hr.value), vs: [] }); A.render();
      } }, "افزودنِ ارزش")));
    var vs = S.all("value").sort(function (a, b) { return (num(b.imp) || 0) - (num(a.imp) || 0); }), k = A.valsCheck();
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "ارزش‌های تو (" + fa(vs.length) + ")"),
      vs.length ? h("div", { class: "col gap" }, vs.map(function (v) {
        var sh = k.tot ? Math.round(100 * (num(v.hours) || 0) / k.tot) : 0;
        var other = h("select", { "aria-label": "در کشمکش با (برای «" + v.title + "»)" }, [h("option", { value: "" }, "— در کشمکش با … —")].concat(vs.filter(function (x) { return x.id !== v.id; }).map(function (x) { return h("option", { value: x.title }, x.title); })));
        return h("div", { class: "card soft" }, h("div", { class: "row gap wrap" }, h("b", {}, v.title),
          h("span", { class: "small" }, "اهمیت " + (v.imp == null ? "—" : fa(v.imp)) + " · ساعت " + (v.hours == null ? "—" : fa(v.hours)) + " (" + fa(sh) + "٪ از ساعت‌های ثبت‌شده)"),
          h("input", { type: "number", min: 0, max: 100, "aria-label": "ساعتِ این هفتهٔ «" + v.title + "»", value: v.hours == null ? "" : v.hours, style: { width: "6em" }, onchange: function (e) { v.hours = num(e.target.value); S.put(v); A.render(); } })),
          (v.vs || []).map(function (c, i) { return h("div", { class: "row gap wrap small" }, "⟷ «" + c.with + "» — قاعدهٔ ترجیحِ تو: ",
            h("input", { type: "text", "aria-label": "قاعدهٔ ترجیح میانِ «" + v.title + "» و «" + c.with + "»", placeholder: "مثلاً «سلامتِ خانواده پیش از درآمدِ بیشتر، مگر …»", value: c.rule || "", onchange: function (e) { c.rule = e.target.value; S.put(v); A.render(); } })); }),
          h("div", { class: "row gap" }, other, h("button", { class: "btn sm ghost", type: "button", onclick: function () { if (!other.value) return; (v.vs = v.vs || []).push({ with: other.value, rule: "" }); S.put(v); A.render(); } }, "+ کشمکش")));
      })) : h("p", { class: "small muted" }, "هنوز ارزشی ننوشته‌ای.")));
    if (vs.length) root.appendChild(h("section", { class: "card", "aria-live": "polite" }, h("h2", {}, "آینه"),
      k.gaps.length ? h("p", { class: "warnline" }, "مهم می‌دانی ولی کمتر از ۱۰٪ ِ وقتت به آن می‌رسد: " + k.gaps.map(function (x) { return "«" + x + "»"; }).join("، ") + " — داوری نیست؛ یا وقت جابه‌جا شود، یا اهمیت بازنگری شود.") : h("p", { class: "small" }, "ناهم‌خوانیِ بزرگی میانِ اهمیت و وقت دیده نشد (با همین ساعت‌هایی که نوشتی)."),
      k.open.length ? h("p", { class: "warnline" }, "کشمکش بی قاعدهٔ ترجیح (A0: هر دو با هم کاملاً برآورده نمی‌شوند): " + k.open.map(function (x) { return "«" + x + "»"; }).join("، ")) : null));
    var ms = S.all("meaning").sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
    var pr = h("input", { type: "number", id: "mnP", min: 1, max: 7, placeholder: "۱ تا ۷" }), se = h("input", { type: "number", id: "mnS", min: 1, max: 7, placeholder: "۱ تا ۷" });
    var w = h("input", { type: "text", id: "mnW", placeholder: "به چه چیزی وصل است؟ کارِ این ماه کدام هدفِ بزرگ‌ترت را جلو برد؟" });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "وارسیِ ماهانهٔ معنا"),
      h("p", { class: "small muted" }, "«حضورِ معنا» (زندگی‌ام برایم معنا دارد) و «جست‌وجوی معنا» (دنبالِ معنایش هستم) دو چیزِ جدایند — هر دو را جدا بنویس. این‌که زندگی معنای عینی دارد یا نه، بیرون از این ابزار است (صدقِ معرفتی)."),
      h("div", { class: "row gap wrap" }, h("label", { for: "mnP" }, "حضورِ معنا"), pr, h("label", { for: "mnS" }, "جست‌وجوی معنا"), se), h("label", { for: "mnW" }, "با واژه‌های خودت"), w,
      h("button", { class: "btn", type: "button", onclick: function () {
        var a = parseInt(pr.value, 10), b = parseInt(se.value, 10); if (!(a >= 1 && a <= 7) || !(b >= 1 && b <= 7)) { A.toast("هر دو عدد ۱ تا ۷.", "bad"); return; }
        S.put({ id: A.uid("mn"), type: "meaning", date: A.today(), presence: a, search: b, note: w.value.trim() }); A.render();
      } }, "ثبتِ وارسی"),
      ms.length ? h("ul", { class: "plain small" }, ms.slice(0, 12).map(function (m) { return h("li", {}, A.fdate(m.date) + " — حضور " + fa(m.presence) + "، جست‌وجو " + fa(m.search) + (m.note ? " — " + m.note : "")); })) : null));
    return root;
  };

  /* ---------- «امروز»: موعدِ زنجیره و پیش‌بینی ---------- */
  if (typeof A.dueList === "function" && !A.dueList._tools) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [], t = A.today();
      /* دورِ ۱۹c: سطرِ زنجیره و پیش‌بینی از زمان‌بندِ واحد می‌آید (A.SCHED، با «عقب‌افتاده از …» و یادآور/لغوِ یادآور)؛ این مسیر فقط پشتیبانِ بی A.SCHED است */
      if (!(A.SCHED && A.SCHED.todayLines)) S.all("wchain", function (c) { return c.due && c.due <= t && !c.outcome; }).forEach(function (c) { items.push({ k: "p", txt: "⛓ نتیجهٔ واقعیِ «" + c.title + "» را ثبت کن", sub: "حسِ اولت " + (c.feel == null ? "—" : fa(c.feel) + "٪") + " بود", go: function () { A.go("chain", c.id); } }); });
      /* پیش‌بینیِ گامِ «مسئلهٔ حل‌نشدهٔ خودم» (x.live) در سطرِ خودِ همان مسئله می‌آید و همان‌جا نتیجه می‌گیرد — دو بار پرسیده نمی‌شود */
      var fc = A.SCHED && A.SCHED.todayLines ? [] : S.all("fcast", function (x) { return x.due && x.due <= t && !x.outcome && !x.live; });
      if (fc.length) items.push({ k: "p", txt: "🎯 " + fa(fc.length) + " پیش‌بینی به موعد رسیده — شد یا نشد؟", sub: fc.slice(0, 2).map(function (x) { return x.q; }).join(" · "), go: function () { A.go("fcast"); } });
      var lm = S.all("meaning").map(function (m) { return m.date; }).sort().pop();
      if ((S.all("value").length || lm) && (!lm || A.daysBetween(lm, t) >= 30)) items.push({ k: "p", txt: "🧭 وارسیِ ماهانهٔ معنا", sub: lm ? "آخرین بار " + A.fdate(lm) : "نخستین وارسی", go: function () { A.go("vals"); } });
      return items;
    };
    A.dueList._tools = true;
  }
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.chain = { j: "untie", what: "زنجیرهٔ نگرانی: ترس را به حلقه‌ها بشکن، احتمالِ هر حلقه، سقف و حاصل‌ضربِ زنجیره بر پایهٔ اصول، حلقه‌های در دستِ تو، و نتیجهٔ واقعی در موعد.", why: "تا حسِ قطعیِ یک ترس را با منطقِ احتمال بسنجی و بدانی کجا کاری از دستت برمی‌آید." };
  A.VIEW_META.vals = { j: "judge", what: "ارزش‌ها و معنا: ارزش با اهمیت و ساعتِ واقعیِ هفته، کشمکش‌ها با قاعدهٔ ترجیح، و وارسیِ ماهانهٔ حضور/جست‌وجوی معنا.", why: "تا ببینی آنچه مهم می‌دانی با وقتت می‌خواند و کشمکش‌ها قاعده دارند — بی داوری دربارهٔ درستیِ ارزش‌ها." };
  A.VIEW_META.fcast = { j: "judge", what: "دفترِ پیش‌بینی: پیش‌بینیِ زندگی با احتمال و موعد؛ نتیجه، Brier و کالیبراسیون.", why: "تا ببینی اطمینانت با واقعیت می‌خواند یا نه." };
})(APP);
/* منو: «🧠 کارنامهٔ ذهن» و «🗺 قلمروِ سامانه‌ها» ذیلِ «🗺 نقشه‌ها»؛ دو ابزار ذیلِ «🧰 ابزارهای ذهن» — در هر دو سامانه (افزودن، نه جابه‌جایی) */
(function (A) {
  function add(arr, items, group) {
    if (!Array.isArray(arr)) return;
    var gi = arr.findIndex(function (n) { return n && n.g === group; });
    var fresh = items.filter(function (it) { return !arr.some(function (n) { return Array.isArray(n) && n[0] === it[0]; }); });
    if (!fresh.length) return;
    if (gi < 0) { arr.push({ g: group }); fresh.forEach(function (it) { arr.push(it); }); return; }
    var end = gi + 1; while (end < arr.length && Array.isArray(arr[end])) end++;
    Array.prototype.splice.apply(arr, [end, 0].concat(fresh));
  }
  var maps = [["mind", "🧠 کارنامهٔ ذهن", "هفت بُعدِ ذهنت، نقطه‌های سیاه، روند، نقشهٔ کاملِ ذهن و شبکه"], ["sterr", "🗺 قلمروِ سامانه‌ها", "حوزه‌های هر سامانه، گام‌ها، ابزارها و کمبودها"]];
  var tools = [["chain", "⛓ زنجیرهٔ نگرانی", "ترس را به حلقه‌ها بشکن و با منطقِ احتمال بسنج"], ["fcast", "🎯 دفترِ پیش‌بینی", "پیش‌بینی با احتمال و موعد؛ Brier و کالیبراسیون"], ["vals", "🧭 ارزش‌ها و معنا", "اهمیت در برابرِ وقت، کشمکش‌ها و قاعدهٔ ترجیح، وارسیِ معنا"]];
  [A.NAV, A.EPI_NAV].forEach(function (arr) { add(arr, maps, "🗺 نقشه‌ها"); add(arr, tools, "🧰 ابزارهای ذهن"); });
})(APP);
