/* ===== «💡 جایگاهِ ایده»: ایده خودش یک موضوع است، با قوت، فرض، مسئله، گره و آنچه بیرون است (مالک ۲۰۲۶-۱۰-۱۵) =====
   مالک: «ایده‌ای دادم که بخوام بفهمم در چه جایگاهیه … چه مسائل و گره‌هایی داخلش هست و چه نقاطِ قوتی … ابهاماتِ معرفت‌شناسی … همه رو
   تشخیص و تجزیه و تفکیک کنه و همه رو از جاهای مختلف و لازم خودش بگذرونه … نه اینکه به همه چیز بله بگه بلکه همه چیز رو هوشمندانه بررسی کنه».
   کارزارِ v07: ایده خوب شکسته شد (گره، ادعا، یادگیری، پیش‌نیاز) ولی خودِ ایده هیچ‌جا «جایگاه» نداشت — قوت‌ها فقط در گفت‌وگو ماند.
   این بخش:
   - رکوردِ «idea»: حرفِ خودِ کاربر؛ قوت‌ها هر کدام با شاهد از حرفِ خودش؛ فرض‌ها (هر کدام ⇒ پروندهٔ سنجش در کارخانه)؛ مسئله‌های طراحی
     («چطور کار می‌کند / چطور سنجیده می‌شود» ⇒ بخشِ مسئله)؛ گره‌ها؛ پیش‌نیازها؛ بخش‌های بیرون از صفحه.
   - «جایگاه» عدد نیست: درجهٔ هر فرض از پروندهٔ خودش (یقین/ظن/شک/وهم)، فرضِ سنجیده‌نشده = شک (½، اصلِ بی‌مرجح A4)، و
     سقفِ اعتبارِ ایده = ضعیف‌ترین فرضِ لازم (قضیهٔ T_weakest از A1: «کل از جزء بیشتر نیست»). قوت‌ها سقف را بالا نمی‌برند؛ فقط می‌گویند
     چه چیزی ارزشِ آزمودن دارد. */
(function (A) {
  var S = A.S, fa = A.fa, h = A.h, AS = A.ASSIST;
  var I = A.IDEA = {};
  function nowIso() { return new Date().toISOString(); }
  function clip(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
  var PARTS = { strength: "قوت", assumption: "فرضِ لازم", problem: "مسئلهٔ طراحی", outside: "بیرون از این صفحه" };
  I.PARTS = PARTS;

  /* درجهٔ یک ادعا در پروندهٔ کارخانه (همان درجه‌های جزوه — مرزها قضیه‌اند: ½ از A4 و ۱ از A2) */
  function degOf(p) {
    if (p == null || p === "" || isNaN(+p)) return null;
    p = +p; if (p <= 1 && String(p).indexOf(".") >= 0) p = p * 100;
    var D = (window.EPI_FOUND && window.EPI_FOUND.DEG) || [];
    var d = D.filter(function (x) { return p >= x.lo && p <= x.hi; })[0];
    return { p: p, fa: d ? d.fa : fa(Math.round(p)) + "٪" };
  }
  /* درجهٔ فرض از پرونده‌اش: نخستین سطرِ ادعا در حکمِ پایانی؛ پروندهٔ نیمه‌کاره ⇒ «هنوز سنجیده نشده» */
  I.assumptionGrade = function (a) {
    var cs = a && a.caseId ? S.get(a.caseId) : null;
    if (!cs) return { p: 50, fa: "شک (درست ½) — هنوز پرونده‌ای ندارد", open: true, why: "بی‌دلیل هیچ طرف مرجح نیست (A4)" };
    var fin = cs.st && cs.st.st_final, rows = ((fin && fin.data && fin.data.final) || []).filter(function (r) { return r.c && r.p != null && r.p !== ""; });
    if (!fin || !fin.done || !rows.length) return { p: 50, fa: "شک (درست ½) — پرونده هنوز به حکم نرسیده", open: true, why: "تا حکم، بی‌دلیل هیچ طرف مرجح نیست (A4)", caseId: cs.id };
    var d = degOf(rows[0].p), out = (cs.outcome || {})[rows[0].c];
    return { p: d.p, fa: d.fa + " (" + fa(Math.round(d.p)) + "٪)" + (out ? " · نتیجهٔ واقعی: " + out : ""), open: false, caseId: cs.id };
  };
  /* سقفِ اعتبارِ ایده = کمینهٔ درجهٔ فرض‌های لازم (T_weakest) */
  I.standing = function (r) {
    var as = (r.parts || []).filter(function (x) { return x.k === "assumption"; });
    if (!as.length) return { cap: null, why: "هنوز هیچ فرضِ لازمی ثبت نشده؛ بی فرضِ روشن، جایگاه معلوم نیست" };
    var g = as.map(function (a) { return { a: a, g: I.assumptionGrade(a) }; }), w = g.slice().sort(function (x, y) { return x.g.p - y.g.p; })[0];
    return { cap: w.g.p, weakest: w.a, grades: g, open: g.filter(function (x) { return x.g.open; }).length,
      why: "ایده فقط وقتی کار می‌کند که همهٔ فرض‌های لازمش درست باشد؛ پس اعتبارش از ضعیف‌ترینِ آن‌ها بیشتر نیست (کل از جزء بیشتر نیست — A1)" };
  };

  /* ---------- کارهای دستیار (فقط از حرفِ خودِ کاربر) ---------- */
  if (AS && AS.DO) {
    AS.DO.idea_new = function (a) {
      var s = AS._turnSession, what = clip(a && a.what, 600);
      if (!what) return "ایده ثبت نشد: «what» (عینِ حرفِ کاربر) لازم است";
      var r = { id: A.uid("idea"), type: "idea", what: what, title: clip((a && a.title) || what, 80), parts: [], sess: (s && s.id) || "", created: nowIso() };
      S.put(r); if (s) s.idea = r.id; return "";
    };
    /* {"do":"idea_add","part":"strength|assumption|problem|outside","t":"…","ev":"شاهد از حرفِ کاربر"} */
    AS.DO.idea_add = function (a) {
      var s = AS._turnSession, r = S.get((a && a.id) || (s && s.idea) || "");
      if (!r || r.type !== "idea") return "اول ایده را با idea_new ثبت کن";
      var k = a && a.part, t = clip(a && a.t, 300);
      if (!PARTS[k] || !t) return "بخشِ ایده باید strength، assumption، problem یا outside باشد و متن داشته باشد";
      if (k === "strength" && !clip(a.ev, 300)) return "قوت بی شاهد ثبت نمی‌شود: «ev» = شاهد از حرفِ خودِ کاربر";
      if ((r.parts || []).some(function (x) { return x.k === k && x.t === t; })) return "";
      (r.parts = r.parts || []).push({ k: k, t: t, ev: clip(a.ev, 300), test: clip(a.test, 300), at: nowIso() }); S.put(r); return "";
    };
    /* فرض ⇐ پروندهٔ کارخانه؛ مسئلهٔ طراحی ⇐ مسئله */
    AS.DO.idea_link = function (a) {
      var s = AS._turnSession, r = S.get((a && a.id) || (s && s.idea) || ""), i = +(a && a.i);
      if (!r || r.type !== "idea" || !(r.parts || [])[i]) return "پیوند ثبت نشد: شمارهٔ بخش (i) نادرست است";
      var x = r.parts[i], rec = S.get((a && a.rec) || "");
      if (!rec) return "پیوند ثبت نشد: رکورد پیدا نشد";
      if (x.k === "assumption" && rec.type === "case") x.caseId = rec.id;
      else if (x.k === "problem" && (rec.type === "eprob" || rec.type === "prereq")) x.recId = rec.id;
      else return "فرض فقط به پروندهٔ سنجش و مسئلهٔ طراحی فقط به مسئله یا نقشهٔ پیش‌نیاز وصل می‌شود";
      S.put(r); return "";
    };
    AS.SYS += "\n" + [
      "# ایده («💡 جایگاهِ ایده»)",
      "- اگر کاربر «ایده» آورد (نه فقط گیر یا مسئله) و می‌خواهد بداند کجا ایستاده، آن را رد نکن و تأییدِ کور هم نکن: با {\"do\":\"idea_new\",\"what\":\"عینِ حرفش\"} ثبتش کن و بعد بخش‌هایش را یکی‌یکی با idea_add بگذار:",
      "  · strength (قوت) فقط با «ev» = شاهد از حرفِ خودِ کاربر؛ تعریفِ خالی قوت نیست.",
      "  · assumption = هر چیزی که باید درست باشد تا ایده کار کند («همه نیاز دارند»، «پول می‌دهند»، «بقیه مثلِ من‌اند») — هر فرضِ اصلی یک پروندهٔ سنجش در کارخانه می‌گیرد (وجهِ claim ِ تور) و با idea_link وصل می‌شود.",
      "  · problem = پرسشِ طراحیِ «چطور کار می‌کند / چطور سنجیده می‌شود / چطور ساخته می‌شود» — این «یادگیری» نیست، مسئله است: وجهِ problem (بخشِ مسئله) و اگر دانشی کم است، نقشهٔ پیش‌نیاز؛ با idea_link وصلش کن.",
      "  · outside = بازار، قانون، سرمایه، … — یک بار نام ببر، هر نوبت تکرار نکن.",
      "- گره‌هایی که جلوی ایده را می‌گیرند (مثلاً رها کردن پس از ایراد) وجهِ knot ِ تورند، مثلِ همیشه.",
      "- به ایده نمره نده. جایگاهش را صفحه از درجهٔ فرض‌ها می‌سازد: سقفِ اعتبار = ضعیف‌ترین فرضِ لازم؛ فرضِ سنجیده‌نشده = شک (½). اگر کاربر نمره خواست، همین را بگو و او را به «💡 جایگاهِ ایده» ببر."
    ].join("\n");
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s) {
      var r = s && s.idea ? S.get(s.idea) : null; if (!r) return "";
      var st = I.standing(r);
      return "# ایدهٔ این سشن (" + r.id + ")\n«" + clip(r.what, 200) + "»\n" + (r.parts || []).map(function (x, i) { return i + ") [" + x.k + "] " + clip(x.t, 120) + (x.ev ? " — شاهد: " + clip(x.ev, 80) : "") + (x.caseId ? " — پرونده: " + x.caseId + " (" + I.assumptionGrade(x).fa + ")" : "") + (x.recId ? " — رکورد: " + x.recId : ""); }).join("\n") +
        "\nسقفِ اعتبار: " + (st.cap == null ? "— (" + st.why + ")" : Math.round(st.cap) + "٪ (ضعیف‌ترین فرض: «" + clip(st.weakest.t, 60) + "»)");
    });
  }

  /* ---------- نما ---------- */
  A.V.idea = function () {
    var r = S.get(A.state.arg), root = h("div", { class: "page idea", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "💡 جایگاهِ ایده", "ایده‌ات تکه‌تکه: قوت‌ها با شاهد، فرض‌های لازم و درجهٔ هر کدام، مسئله‌های طراحی، و آنچه بیرون از این صفحه است."));
    var all = S.all("idea").sort(function (a, b) { return String(b.created).localeCompare(String(a.created)); });
    if (!r || r.type !== "idea") {
      root.appendChild(all.length ? h("ul", { class: "plain" }, all.map(function (x) { return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("idea", x.id); } }, "💡 " + x.title)); })) :
        h("p", { class: "card soft" }, "هنوز ایده‌ای ثبت نشده. ایده‌ات را به «💬 دستیار» بگو؛ آن را تکه‌تکه می‌کند و هر تکه را به بخشِ خودش می‌برد."));
      return root;
    }
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "ایده"), h("p", {}, "«" + r.what + "»")));
    var st = I.standing(r);
    root.appendChild(h("section", { class: "card idea-standing" }, h("h2", {}, "جایگاه"),
      st.cap == null ? h("p", { class: "muted" }, st.why) : h("div", {},
        h("p", {}, h("b", {}, "سقفِ اعتبارِ ایده: "), (degOf(st.cap) || {}).fa + " (" + fa(Math.round(st.cap)) + "٪) — از ضعیف‌ترین فرض: «" + st.weakest.t + "»."),
        h("p", { class: "small muted" }, st.why + ". " + (st.open ? fa(st.open) + " فرض هنوز سنجیده نشده و تا سنجیده نشود «شک» (½) شمرده می‌شود. " : "") + "قوت‌ها این سقف را بالا نمی‌برند؛ می‌گویند چه چیزی ارزشِ آزمودن دارد."))));
    Object.keys(PARTS).forEach(function (k) {
      var xs = (r.parts || []).map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.k === k; });
      root.appendChild(h("section", { class: "card idea-" + k }, h("h2", {}, PARTS[k] + " (" + fa(xs.length) + ")"), xs.length ? h("ul", {}, xs.map(function (o) {
        var x = o.x, g = k === "assumption" ? I.assumptionGrade(x) : null;
        return h("li", {}, x.t, x.ev ? h("div", { class: "small muted" }, "شاهد: «" + x.ev + "»") : null, x.test ? h("div", { class: "small" }, "چه آن را می‌آزماید: " + x.test) : null,
          g ? h("div", { class: "small" }, "درجه: " + g.fa, g.caseId ? h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_case", g.caseId); } }, " ↗ پرونده") : null) : null,
          x.recId ? h("button", { class: "linkish small", type: "button", onclick: function () { var q = S.get(x.recId); if (q && q.type === "eprob") A.go("e_prob", q.p && q.p.id); else if (q) A.go("prereq", q.id); } }, "↗ " + (S.get(x.recId) || {}).type) : null);
      })) : h("p", { class: "small muted" }, "—")));
    });
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.idea = { j: "ws", what: "جایگاهِ ایده: قوت‌ها با شاهد، فرض‌های لازم (هر کدام با پروندهٔ سنجش و درجه‌اش)، مسئله‌های طراحی، بیرون از صفحه؛ سقفِ اعتبار = ضعیف‌ترین فرض (A1). نمره ندارد." };
  if (A.GRAPH && A.GRAPH.MAPS && !A.GRAPH.MAPS.some(function (x) { return x.v === "idea"; })) A.GRAPH.MAPS.push({ v: "idea", fa: "💡 جایگاهِ ایده", what: "ایده‌هایت تکه‌تکه، با سقفِ اعتبار از ضعیف‌ترین فرض" });
})(APP);
