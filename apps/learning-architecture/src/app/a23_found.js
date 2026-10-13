/* ===== «🧱 مبنای درجه‌ها» در «اعتبارسنجیِ کارخانه و جزوه» (مالک ۲۰۲۶-۱۰-۱۳) =====
   پرسشِ مالک: «این درصد بر چه مبنایی است؟ در معرفت‌شناسی هیچ چیز نباید قراردادی باشد … به بدیهیات منتقل کن — طبقِ جزوه».
   این نما هر سقفِ عددیِ کارخانه را نشان می‌دهد: قضیه‌ای از اصولِ بدیهی است (B)، ساختارش قضیه است ولی مقدارِ پایه‌اش هنوز
   اندازه‌گیری نشده (S)، فقط «کمتر از یقین» است (O)، یا با قضیه نمی‌خواند (X). اصول و قضیه‌ها از `EPI_FOUND` (epi_found.js)؛
   اثرِ حالت‌های آزمایشی و اندازه‌گیریِ پایه‌ها از دفترِ بک‌تست (`EPI_BT_LEDGER.foundation`) — صفحه چیزی را عوض نمی‌کند. */
(function (A) {
  var h = A.h, fa = A.fa;
  var K = { B: ["بدیهی‌پایه", "خودِ عدد قضیه است"], S: ["ساختار بدیهی، پایه اندازه‌گیری‌نشده", "شکلِ ترکیب قضیه است؛ مقدارِ پایه را جزوه «سنجش با واقعیت» می‌داند و هنوز با دادهٔ کافی سنجیده نشده"],
    O: ["ترتیبی", "قضیه فقط «کمتر از یقین» می‌گوید؛ عددِ دقیق از اصول بیرون نمی‌آید"], X: ["ناسازگار با قضیه", "عددِ فعلی با قضیهٔ خودِ جزوه نمی‌خواند ⇒ پیشنهاد برای تصمیمِ تو"] };
  function deg(id) { var F = window.EPI_FOUND; var d = F && F.DEG.filter(function (x) { return x.id === id; })[0]; return d ? d.fa : id; }
  function bound(b) { return b == null ? "" : typeof b === "number" ? "≤ " + fa(b) : String(b).replace(/\d+/g, function (n) { return fa(+n); }); }

  A.foundPanel = function () {
    var F = window.EPI_FOUND, box = h("div", { class: "col gap bt-found", dir: "rtl" });
    if (!F) { box.appendChild(h("p", {}, "مبنای درجه‌ها بارگذاری نشده.")); return box; }
    var rep = F.report(), C = F.SUMMARY(rep), D = (window.EPI_BT_LEDGER || {}).foundation;
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "🧱 مبنای درجه‌ها — هر عدد از کجا می‌آید؟"),
      h("p", {}, "پرسشِ تو: درصدی که به هر تصدیق نسبت داده می‌شود نباید قراردادی باشد. پاسخِ جزوه سه گام دارد:"),
      h("ol", { class: "small" },
        h("li", {}, h("b", {}, "بدیهی یعنی چه (s39): "), "تصدیقی که برای تصدیقش به استدلال نیازی نیست و «ارزشِ معرفت‌شناختیِ کامل و خطاناپذیر» دارد — اولیات (تصورِ موضوع و محمول برای تصدیق بس است؛ مثالِ خودِ جزوه: «کل از جزءِ خود بزرگ‌تر است») و وجدانیات (علمِ حضوریِ نفس به حالاتِ خود). شمارشِ وقایع بدیهی نیست؛ استقراء است."),
        h("li", {}, h("b", {}, "یقین فقط با ارجاع (s40): "), "تصدیقِ نظری فقط وقتی یقینی است که با استدلالی که ماده‌اش بدیهی و صورتش معتبر است به بدیهیات برگردد."),
        h("li", {}, h("b", {}, "باقی، با حسابِ احتمالات (تکمیلِ s40): "), "«اگر تصدیقِ نظری به بدیهیات ختم نشود لزوماً کاذب نیست؛ اعتبار مراتب‌دار و تشکیکی است که ", h("b", {}, "بر اساسِ حسابِ احتمالات"), " تعیین می‌شود؛ بازه‌ای میانِ صفر (کذبِ یقینی) تا یک (صدقِ یقینی) … مبناگرایانه»."
      )),
      h("p", {}, "پس هر عدد فقط وقتی اصیل است که ", h("b", {}, "قضیه‌ای از حسابِ احتمالات"), " باشد و اصولِ آن حساب خودشان به اولیات برگردند. قضیه استقراء نیست: از اصول با برهان بیرون می‌آید و با هیچ شمارشی کم و زیاد نمی‌شود."),
      h("div", { class: "bt-stats" }, ["B", "S", "O", "X"].map(function (k) { return h("div", { class: "card soft bt-stat" + (k === "X" ? " bad" : "") }, h("div", { class: "small muted" }, K[k][0]), h("div", { class: "bt-num" }, fa(C[k] || 0)), h("div", { class: "small" }, K[k][1])); }))));

    box.appendChild(h("section", { class: "card" }, h("h3", {}, "اصول — فقط اولیات و آنچه جزوه صریحاً مبنا گرفته"),
      h("ul", { class: "plain found-ax" }, F.AX.map(function (a) { return h("li", { class: "card soft" }, h("strong", {}, a.id + " · " + a.fa), h("p", { class: "small" }, a.stmt), h("div", { class: "small muted" }, a.kind + " — " + a.sec.join("، "))); }))));

    box.appendChild(h("details", { class: "card found-th" }, h("summary", {}, "قضیه‌ها و برهانشان (" + fa(Object.keys(F.TH).length) + ")"),
      h("ul", { class: "plain" }, Object.keys(F.TH).map(function (id) { var t = F.TH[id]; return h("li", { class: "card soft" }, h("strong", {}, t.fa), h("p", { class: "small" }, t.proof), h("div", { class: "small muted" }, id + " ← " + t.from.join("، "))); }))));

    box.appendChild(h("section", { class: "card" }, h("h3", {}, "درجه‌های جزوه — مرزها قضیه‌اند، نه قرارداد"),
      h("ul", { class: "small" }, F.DEG.map(function (d) { return h("li", {}, h("b", {}, d.fa + ": "), d.why); })),
      h("p", { class: "small muted" }, "مرزِ ½ از امتناعِ ترجیحِ بلامرجح (A4) و مرزهای ۰ و ۱ از بازهٔ جزوه (A2) می‌آیند. «تحملِ ۱۰ واحد» که کارخانه در مقایسه به کار می‌برد قراردادی است — اثرِ کنار گذاشتنش پایین‌تر سنجیده شده.")));

    /* جدولِ قاعده‌ها */
    var sel = h("select", { "aria-label": "گونه", onchange: function () { fill(sel.value); } }, [["all", "همه"], ["X", "ناسازگار"], ["B", "بدیهی‌پایه"], ["S", "پایهٔ اندازه‌گیری‌نشده"], ["O", "ترتیبی"]].map(function (o) { return h("option", { value: o[0] }, o[1]); }));
    var rows = h("tbody");
    function fill(m) {
      rows.innerHTML = "";
      rep.filter(function (r) { return m === "all" || r.k === m; }).forEach(function (r) {
        rows.appendChild(h("tr", { class: r.k === "X" ? "warnrow" : "", "data-k": r.k }, h("td", {}, h("div", {}, r.fa), h("div", { class: "small muted" }, r.id)),
          h("td", {}, fa(r.cap)), h("td", { class: "small" }, deg(r.capDeg)),
          h("td", { class: "small" }, K[r.k] ? K[r.k][0] : r.k, r.stricterThanTheorem ? h("div", { class: "small muted" }, "سخت‌گیرتر از قضیه، بی‌برهان") : null),
          h("td", { class: "small" }, r.thFa), h("td", { class: "small" }, r.bound != null ? bound(r.bound) : r.baseFa ? "پایه: " + r.baseFa : ""),
          h("td", { class: "small" }, r.note)));
      });
    }
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "هر سقفِ عددی و مبنایش (" + fa(rep.length) + ")"), h("div", { class: "row gap" }, sel),
      h("div", { class: "scrollx" }, h("table", { class: "wt found-rules" }, h("thead", {}, h("tr", {}, ["قاعده", "سقفِ فعلی", "درجه", "گونه", "قضیه", "کرانِ قضیه / پایه", "توضیح"].map(function (x) { return h("th", {}, x); }))), rows))));
    fill("all");

    /* سنجش‌ها (از دفترِ بک‌تست) */
    if (!D) box.appendChild(h("section", { class: "card" }, h("p", { class: "small muted" }, "اثرِ حالت‌های آزمایشی و اندازه‌گیریِ پایه‌ها پس از نخستین دورِ بک‌تست این‌جا می‌آید.")));
    else {
      var M = D.modes || {}, NM = { num: "عدد + تحملِ ۱۰ (فعلی)", deg: "فقط درجه‌ها (یقین/ظن/شک/وهم)", derived: "کرانِ قضیه به‌جای عددِ قراردادی", both: "هر دو" };
      box.appendChild(h("section", { class: "card found-modes" }, h("h3", {}, "اگر عددهای قراردادی کنار بروند چه می‌شود؟ (دورِ " + fa(D.round) + "، کلِ پیکره، در حافظه)"),
        h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, ["حالت", "حکمِ درست", "شکستِ دیده‌نشده", "جای نادرست", "هشدارِ کاذب", "حکم‌های عوض‌شده"].map(function (x) { return h("th", {}, x); }))),
          h("tbody", {}, ["num", "deg", "derived", "both"].filter(function (k) { return M[k]; }).map(function (k) { var m = M[k];
            return h("tr", { "data-mode": k }, h("td", {}, NM[k]), h("td", {}, fa(m.kinds.ok)), h("td", {}, fa(m.kinds.missed)), h("td", {}, fa(m.kinds.mislocated)), h("td", {}, fa(m.kinds.health_alarm)),
              h("td", { class: "small" }, k === "num" ? "—" : fa(m.changed.length) + (m.changed.length ? ": " + m.changed.map(function (c) { return c.t + " (" + (c.to === "ok" ? "درست شد" : "از دست رفت") + ")"; }).join("، ") : ""))); })))),
        (function () {
          var lost = M.deg ? M.deg.changed.filter(function (c) { return c.to !== "ok"; }).length : 0, dv = M.derived ? M.derived.changed : [];
          var dvLost = dv.filter(function (c) { return c.to !== "ok"; }).length, dvFix = dv.filter(function (c) { return c.to === "ok"; }).length;
          return h("p", { class: "small" }, h("b", {}, "خواندنِ نتیجه: "),
            lost ? "ماندن فقط با درجه‌های کیفی " + fa(lost) + " شکستی را که امروز دیده می‌شود از دست می‌دهد — یعنی عددهای «پایه‌ای» (۷۰، ۸۰ …) اطلاعاتِ واقعی دارند ولی هنوز مبنا ندارند؛ جایشان را باید «اندازه‌گیریِ کافی» بگیرد، نه حذف و نه حدس. " : "ماندن فقط با درجه‌ها چیزی از دست نمی‌دهد. ",
            "جایگزینیِ عددها با کرانِ قضیه " + (dvLost ? fa(dvLost) + " حکمِ درست را خراب می‌کند" : "هیچ حکمِ درستی را خراب نمی‌کند") + (dvFix ? " و " + fa(dvFix) + " شکستِ دیده‌نشده را می‌بیند" : "") + ". ",
            "پیش‌فرضِ کارخانه عوض نشده؛ پیشنهادها در «♾ بک‌تستِ پیوسته» منتظرِ تصمیمِ تو هستند.");
        })()));
      var BS = D.base || {}, suf = D.suff || F.SUFF;
      box.appendChild(h("section", { class: "card found-base" }, h("h3", {}, "مقدارهای پایه — فقط با دادهٔ کافی و بی‌گزینش"),
        h("p", { class: "small" }, "این‌ها در بدیهیات نیستند (مثلاً «یک ناقلِ ثقه چند بار درست می‌گوید»). جزوه خودش راهشان را گفته: «سنجشِ تطابق با واقعیات بیرونی و اسناد» (s52). این سنجش نوعی استقراء است و همان‌طور که گفتی معرفت‌شناسی‌اش ضعیف‌تر است؛ برای همین سه مرز دارد: (۱) فقط نمونهٔ ", h("b", {}, "بی‌گزینش"), " شمرده می‌شود — پیکرهٔ بک‌تست عمداً از شکست‌ها چیده شده و نسبتِ درستی در آن به گزینش بسته است؛ (۲) دست‌کم " + fa(suf.groups) + " گروهِ مستقل و نیم‌پهنای بازهٔ ۹۵٪ حداکثر " + fa(Math.round(suf.hw * 100)) + " واحد؛ (۳) هیچ عددِ سنجیده‌ای از کرانِ قضیه بالاتر نمی‌نشیند — قضیه بر سنجش مقدم است."),
        h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, ["مقدارِ پایه", "وضع", "گروهِ بی‌گزینش", "موردِ گزینش‌شده (شمرده نمی‌شود)"].map(function (x) { return h("th", {}, x); }))),
          h("tbody", {}, Object.keys(BS).map(function (k) { var b = BS[k];
            return h("tr", { "data-base": k }, h("td", {}, b.fa), h("td", { class: b.sufficient ? "" : "small muted" }, b.sufficient ? fa(b.p) + "٪ [" + fa(b.lo) + "–" + fa(b.hi) + "]" : "ناکافی — اندازه‌گیری نشده"),
              h("td", {}, fa(b.groups) + " از " + fa(suf.groups)), h("td", {}, fa(b.curated))); }))))));
    }
    return box;
  };
})(APP);
