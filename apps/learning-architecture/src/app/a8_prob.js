/* ===== شبیه‌ساز مسئله‌های بزرگ: تزریق مسئله و پاسخ، ریزکردن مسیر حل، تمرین از آسان به سخت ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, X = window.EPIX, BT = window.EPI_BT;
  if (!X) return;
  function probs() { return (window.EPI_PROBLEMS || []).concat(S.all("eprob", function (p) { return p.status === "approved"; }).map(function (r) { return r.p; })); }
  function getP(id) { return probs().filter(function (p) { return p.id === id; })[0]; }
  function stName(id) { var s = A.EST && A.EST[id]; return s ? s.fa : id; }
  var LV = [null, { fa: "آسان — با گزینه و سرنخ", d: "زمینه، پرسش، گزینه‌ها و سرنخ دیده می‌شود." }, { fa: "متوسط — با گزینه، بی‌سرنخ", d: "سرنخ فقط با درخواست و با هزینه." }, { fa: "سخت — اول حرکت خودت", d: "پیش از دیدن گزینه‌ها حرکت پیشنهادی‌ات را بنویس." }, { fa: "استاد — بی‌گزینه", d: "فقط زمینه و پرسش؛ حرکتت را بنویس، سپس با حرکت واقعی مقایسه و خودت نمره بده." }];
  function prog(pid) { return S.get("eprog_" + pid) || { id: "eprog_" + pid, type: "eprog", lv: {} }; }
  function lvStats(pg, lv, n) { var L = pg.lv[lv] || {}; var ks = Object.keys(L); var ok = ks.filter(function (k) { return L[k].first === true || L[k].self === 2; }).length; return { done: ks.length, ok: ok, n: n, pct: n ? ok / n : 0 }; }
  function unlocked(pg, lv, n) { if (lv === 1) return true; var s = lvStats(pg, lv - 1, n); return s.done >= n && s.pct >= 0.8; }

  A.V.e_prob = function (pid, tab) {
    if (pid) return detail(pid, tab || "sim");
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "مسئله‌های بزرگ حل‌شده", "مسئله‌های مشهوری که سال‌ها حل‌نشده ماندند، همراه پاسخشان. مسیر واقعی حل و بن‌بست‌ها گام‌به‌گام چیده شده تا خودت از آسان به سخت تمرین کنی. اثبات‌های نادرست تاریخی و حل نهایی، نمونه‌های آزمون کارخانه هم هستند."));
    root.appendChild(A.tabs([["list", "مسئله‌ها"], ["inject", "افزودن مسئله تازه"], ["pending", "در انتظار تأیید (" + fa(S.all("eprob", function (p) { return p.status === "pending"; }).length) + ")"]], tab || "list", function (k) { A.go("e_prob", null, k); }));
    if (tab === "inject") { root.appendChild(inject()); return root; }
    if (tab === "pending") { root.appendChild(pending()); return root; }
    root.appendChild(h("div", { class: "col gap" }, probs().map(function (p) {
      var pg = prog(p.id), n = p.stages.length, best = 0; for (var l = 1; l <= 4; l++) if (lvStats(pg, l, n).done >= n) best = l;
      return h("div", { class: "card" }, h("div", { class: "row between wrap" }, h("button", { class: "linkish", onclick: function () { A.go("e_prob", p.id); } }, h("strong", {}, p.title)), h("span", { class: "chip" }, p.field)),
        h("p", { class: "small" }, p.statement.split("\n")[0].slice(0, 260)), h("div", { class: "small muted" }, "باز از " + fa(p.open || "") + " · " + fa(n) + " گام · " + fa((p.dead || []).length) + " بن‌بست · " + fa((p.drills || []).length) + " تمرین · بالاترین سطح کامل‌شده: " + (best ? LV[best].fa : "—")));
    })));
    return root;
  };

  function detail(pid, tab) {
    var p = getP(pid); if (!p) return A.empty("مسئله پیدا نشد.");
    var root = h("div", { class: "page" });
    root.appendChild(A.head(p.field + " — باز از " + fa(p.open || ""), p.title, null, h("div", { class: "row gap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_prob"); } }, "← مسئله‌ها"))));
    root.appendChild(A.tabs([["about", "مسئله و پاسخ"], ["path", "مسیر حل"], ["sim", "شبیه‌ساز"], ["dead", "بن‌بست‌ها (" + fa((p.dead || []).length) + ")"], ["drills", "تمرین‌های هم‌خانواده"], ["lessons", "درس‌ها و ایستگاه‌ها"], ["cases", "پرونده‌های بک‌تست"]], tab, function (k) { A.go("e_prob", pid, k); }));
    var body = h("div", { class: "col gap" }); root.appendChild(body);
    if (tab === "about") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "صورت مسئله"), String(p.statement).split("\n").map(function (x) { return h("p", {}, x); })));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "چرا سال‌ها حل نشد"), h("p", {}, p.why_hard)));
      body.appendChild(h("details", { class: "card" }, h("summary", {}, h("strong", {}, "پاسخ نهایی (پیش از شبیه‌ساز نخوان)")), h("p", {}, p.answer), (p.src || []).length ? h("p", { class: "small muted" }, "منابع: " + p.src.join(" · ")) : null));
    } else if (tab === "path") {
      body.appendChild(h("ol", { class: "timeline" }, p.stages.map(function (s) {
        return h("li", { class: "card" }, h("div", { class: "row between wrap" }, h("strong", {}, fa(s.year || "") + " · " + (s.who || "")), h("span", { class: "chip" }, "دشواری " + fa(s.lvl))),
          h("p", { class: "small" }, s.ctx), h("p", {}, h("strong", {}, "حرکت: "), s.move), h("p", {}, h("strong", {}, "ایده ساده: "), s.idea),
          h("div", { class: "row gap wrap" }, (s.st || []).map(function (x) { return A.stLink(x); }), (s.tech || []).map(function (t) { return A.techLink(t); })));
      })));
    } else if (tab === "dead") {
      (p.dead || []).forEach(function (d) { body.appendChild(h("section", { class: "card" }, h("h3", {}, (d.who || "") + " · " + fa(d.year || "")), h("p", {}, h("strong", {}, "ایده: "), d.idea), h("p", {}, h("strong", {}, "شکاف: "), d.flaw), h("div", { class: "row gap wrap" }, (d.st || []).map(function (x) { return A.stLink(x); })))); });
    } else if (tab === "lessons") {
      body.appendChild(h("section", { class: "card" }, h("ul", {}, (p.lessons || []).map(function (l) { return h("li", {}, l); }))));
      var sts = {}; p.stages.forEach(function (s) { (s.st || []).forEach(function (x) { sts[x] = (sts[x] || 0) + 1; }); });
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "ایستگاه‌های کارخانه در این مسئله"), h("div", { class: "row gap wrap" }, Object.keys(sts).map(function (x) { return h("span", {}, A.stLink(x), h("span", { class: "small muted" }, " ×" + fa(sts[x]))); }))));
    } else if (tab === "cases") {
      var cfg = A.btCfg("mesbah");
      (p.cases || []).forEach(function (c) { var r = X.runCase(c, cfg), ft = X.fate(c, r); body.appendChild(h("section", { class: "card" }, h("div", { class: "row between wrap" }, h("button", { class: "linkish", onclick: function () { A.go("e_lib", c.id); } }, h("strong", {}, c.title)), h("span", { class: "chip " + (ft.pass ? "good" : "bad") }, ft.pass ? "موتور درست داوری کرد" : "داوری نادرست")), h("p", { class: "small" }, (c.truth.ok ? "فرایند سالم" : "شکست در " + (c.truth.fail || []).map(stName).join("، ")) + " · موتور: " + (r.healthy ? "سالم" : "پرچم در " + r.flagged.map(stName).join("، "))))); });
    } else if (tab === "drills") {
      body.appendChild(drills(p));
    } else body.appendChild(sim(p));
    return root;
  }

  function drills(p) {
    var box = h("section", { class: "card drill" }), ds = (p.drills || []).slice().sort(function (a, b) { return a.lvl - b.lvl; }), done = 0, sc = 0;
    var head = h("p", { class: "small muted" }, "از آسان (۱) به سخت (۵). پاسخ و توضیح بلافاصله نمایش داده می‌شود.");
    box.appendChild(head);
    ds.forEach(function (d, n) {
      var ord = A.shuffle(d.opts.map(function (_, i) { return i; })), fb = h("div", { class: "dfb" }), got = false;
      var opts = h("div", { class: "dopts" }, ord.map(function (k) { return h("button", { class: "dopt", onclick: function () {
        if (got) return; got = true; done++; var ok = k === d.a; if (ok) sc++;
        Array.prototype.forEach.call(opts.children, function (b, j) { b.disabled = true; if (ord[j] === d.a) b.classList.add("right"); else if (ord[j] === k) b.classList.add("wrong"); });
        fb.appendChild(h("div", { class: ok ? "good" : "bad" }, ok ? "درست." : "نادرست.")); fb.appendChild(h("div", { class: "small" }, d.why));
        head.textContent = fa(done) + " از " + fa(ds.length) + " · درست: " + fa(sc);
      } }, d.opts[k]); }));
      box.appendChild(h("div", { class: "ditem" }, h("div", { class: "dq" }, h("span", { class: "chip" }, "سطح " + fa(d.lvl)), " ", h("b", {}, fa(n + 1) + ". "), d.q), opts, fb));
    });
    return box;
  }

  /* ---------- شبیه‌ساز ---------- */
  function sim(p) {
    var pg = prog(p.id), n = p.stages.length;
    var st = A.simState && A.simState.pid === p.id ? A.simState : (A.simState = { pid: p.id, lv: 1, order: "hist", i: 0 });
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card" }, h("div", { class: "row gap wrap" },
      [1, 2, 3, 4].map(function (l) { var u = unlocked(pg, l, n), s = lvStats(pg, l, n); return h("button", { class: "btn sm " + (st.lv === l ? "" : "ghost"), disabled: !u, title: u ? LV[l].d : "قفل: سطح قبل را با دست‌کم ۸۰٪ درست تمام کن", onclick: function () { st.lv = l; st.i = 0; A.render(); } }, LV[l].fa + " — " + fa(s.done) + " از " + fa(n) + " گام" + (s.done ? "، " + fa(Math.round(100 * s.pct)) + "٪ درست" : "")); })),
      h("div", { class: "row gap wrap mt" }, h("label", { class: "small", for: "smOrd" }, "ترتیب گام‌ها:"), h("select", { id: "smOrd", onchange: function (e) { st.order = e.target.value; st.i = 0; A.render(); } }, [["hist", "تاریخی (همان‌طور که رخ داد)"], ["e2h", "از آسان به سخت"], ["h2e", "از سخت به آسان"]].map(function (o) { return h("option", { value: o[0], selected: st.order === o[0] }, o[1]); })),
        A.confirmBtn("صفر کردن پیشرفت این سطح", function () { delete pg.lv[st.lv]; S.put(pg); A.render(); })),
      h("p", { class: "small muted" }, LV[st.lv].d + " سطح بعد وقتی باز می‌شود که همه گام‌های این سطح را با دست‌کم ۸۰٪ درستِ بار اول تمام کنی.")));
    var idx = p.stages.map(function (_, i) { return i; });
    if (st.order === "e2h") idx.sort(function (a, b) { return p.stages[a].lvl - p.stages[b].lvl || a - b; });
    if (st.order === "h2e") idx.sort(function (a, b) { return p.stages[b].lvl - p.stages[a].lvl || a - b; });
    if (st.i >= idx.length) { var s = lvStats(pg, st.lv, n); box.appendChild(h("section", { class: "card verdict " + (s.pct >= 0.8 ? "okv" : "badv") }, h("h2", {}, "پایان سطح: " + fa(Math.round(100 * s.pct)) + "٪ درست در بار اول"), h("p", {}, s.pct >= 0.8 ? (st.lv < 4 ? "سطح بعد باز شد." : "همه سطح‌ها را گذراندی. حالا تمرین‌های هم‌خانواده و بن‌بست‌ها را مرور کن.") : "گام‌های نادرست را در «مسیر حل» بخوان و دوباره تلاش کن."), h("button", { class: "btn", onclick: function () { st.i = 0; A.render(); } }, "از نو"))); return box; }
    var si = idx[st.i], s0 = p.stages[si], rec = (pg.lv[st.lv] = pg.lv[st.lv] || {})[s0.id];
    var card = h("section", { class: "card simcard" });
    card.appendChild(h("div", { class: "row between wrap" }, h("span", { class: "eyebrow" }, "گام " + fa(st.i + 1) + " از " + fa(idx.length) + " · " + fa(s0.year || "") + " · " + (s0.who || "")), h("span", { class: "chip" }, "دشواری " + fa(s0.lvl))));
    card.appendChild(h("p", {}, h("strong", {}, "وضع دانش: "), s0.ctx));
    card.appendChild(h("h3", {}, s0.q));
    var area = h("div", { class: "col gap" }); card.appendChild(area);
    function finish(first, self) {
      var L = pg.lv[st.lv]; var prev = L[s0.id];
      L[s0.id] = { first: prev ? prev.first : first, self: self != null ? self : (prev && prev.self), at: new Date().toISOString() }; S.put(pg);
      area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده ساده: "), s0.idea), h("div", { class: "row gap wrap" }, (s0.st || []).map(function (x) { return A.stLink(x); }))));
      area.appendChild(h("button", { class: "btn", onclick: function () { st.i++; A.render(); } }, st.i + 1 < idx.length ? "گام بعد" : "پایان سطح"));
    }
    function options(firstTry) {
      var ord = A.shuffle(s0.opts.map(function (_, i) { return i; })), tried = 0;
      var opts = h("div", { class: "dopts" }, ord.map(function (k) { var o = s0.opts[k]; return h("button", { class: "dopt", onclick: function (e) {
        if (e.target.disabled) return; tried++; e.target.disabled = true; e.target.classList.add(o.ok ? "right" : "wrong");
        area.insertBefore(h("div", { class: "small " + (o.ok ? "good" : "bad") }, (o.ok ? "درست: " : "نه: ") + o.why + (o.hist ? " — " + o.hist : "")), opts.nextSibling);
        if (o.ok) { Array.prototype.forEach.call(opts.children, function (b) { b.disabled = true; }); finish(firstTry && tried === 1); }
      } }, o.t); }));
      area.appendChild(opts);
    }
    if (rec) area.appendChild(h("p", { class: "small muted" }, "این گام را پیش‌تر در این سطح زده‌ای (" + (rec.first ? "بار اول درست" : rec.self === 2 ? "خودارزیابی کامل" : "بار اول نادرست") + "). تکرار، نمره بار اول را عوض نمی‌کند."));
    if (st.lv === 1) { card.insertBefore(h("p", { class: "small hint" }, "سرنخ: " + (s0.hint || "—")), area); options(true); }
    else if (st.lv === 2) { var hb = h("button", { class: "btn ghost sm", onclick: function () { hb.replaceWith(h("p", { class: "small hint" }, "سرنخ: " + (s0.hint || "—"))); used = true; } }, "سرنخ (بار اول را نادرست حساب می‌کند)"); var used = false; area.appendChild(hb); var o2 = options; o2(true); var _f = finish; finish = function (first, self) { _f(first && !used, self); }; }
    else {
      var ta = h("textarea", { rows: 4, placeholder: "حرکت پیشنهادی تو در این لحظه تاریخی، با دلیلش (بی‌نگاه به پاسخ)" }); if (rec && rec.mine) ta.value = rec.mine;
      area.appendChild(ta);
      area.appendChild(h("button", { class: "btn", onclick: function (e) {
        if (ta.value.trim().length < 15) { A.toast("دست‌کم یک جمله کامل بنویس.", "bad"); return; }
        e.target.disabled = true; ta.disabled = true;
        (pg.lv[st.lv] = pg.lv[st.lv] || {}); var keep = pg.lv[st.lv][s0.id]; pg.lv[st.lv][s0.id] = keep || {}; pg.lv[st.lv][s0.id].mine = ta.value; if (!keep) delete pg.lv[st.lv][s0.id];
        if (st.lv === 3) options(true);
        else {
          area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده: "), s0.idea), h("p", { class: "small" }, h("strong", {}, "گزینه‌هایی که آن زمان مطرح بود: "), s0.opts.map(function (o) { return (o.ok ? "✓ " : "✗ ") + o.t; }).join(" · "))));
          area.appendChild(h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "حرکت تو چقدر با حرکت واقعی (یا معادل معتبرش) می‌خواند؟"), [0, 1, 2].map(function (v) { return h("button", { class: "btn ghost sm", onclick: function () { area.lastChild.remove(); finishMaster(v); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]); })));
        }
      } }, st.lv === 3 ? "ثبت و دیدن گزینه‌ها" : "ثبت و مقایسه با حرکت واقعی"));
    }
    function finishMaster(v) { var L = pg.lv[st.lv]; L[s0.id] = { first: v === 2, self: v, mine: (L[s0.id] && L[s0.id].mine) || "", at: new Date().toISOString() }; S.put(pg); area.appendChild(h("button", { class: "btn", onclick: function () { st.i++; A.render(); } }, st.i + 1 < idx.length ? "گام بعد" : "پایان سطح")); }
    box.appendChild(card);
    return box;
  }

  /* ---------- تزریق مسئله تازه (هوش مصنوعی فقط تجزیه‌گر؛ با تأیید شما) ---------- */
  function validP(o) {
    if (!o || !o.title || !Array.isArray(o.stages) || !o.stages.length) throw new Error("ساختار مسئله ناقص است");
    o.stages.forEach(function (s, i) { s.id = s.id || "n" + (i + 1); s.opts = (s.opts || []).filter(function (x) { return x && x.t; }); if (!s.opts.some(function (x) { return x.ok; })) throw new Error("گام " + (i + 1) + " گزینه درست ندارد"); s.st = (s.st || []).filter(function (x) { return window.EPI_PIPE.indexOf(x) >= 0; }); s.lvl = Math.max(1, Math.min(5, +s.lvl || 3)); });
    o.dead = o.dead || []; o.lessons = o.lessons || []; o.drills = (o.drills || []).filter(function (d) { return d && d.opts && d.opts.length && d.a >= 0 && d.a < d.opts.length; }); o.cases = [];
    return o;
  }
  function inject() {
    var f = { title: "", field: "", open: "", statement: "", answer: "", src: "", notes: "" };
    function inp(lbl, k, ta, ph) { var el = ta ? h("textarea", { rows: ta, placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }) : h("input", { type: "text", placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }); return h("div", {}, h("label", {}, lbl), el); }
    var jsonTa = h("textarea", { rows: 6, class: "mono", placeholder: "یا JSON کامل مسئله را طبق طرح بچسبان" });
    var out = h("div");
    function store(o, by) { var id = "pb_u_" + Date.now().toString(36); o.id = id; S.put({ id: "eprob_" + id, type: "eprob", status: "pending", by: by, p: o }); out.innerHTML = ""; out.appendChild(h("p", {}, "مسئله در صف تأیید است. پیش از تأیید، گام‌ها و درستی تاریخی‌شان را بسنج.")); }
    return h("section", { class: "card col gap" }, h("h2", {}, "تزریق مسئله سخت حل‌شده"),
      h("p", { class: "small" }, "مسئله و پاسخ نهایی‌اش را بنویس. هوش مصنوعی فقط مسیر تاریخی حل را به گام‌های تصمیم، گزینه‌ها، بن‌بست‌ها و تمرین‌های مشابه می‌شکند. نتیجه پیش از ورود به شبیه‌ساز به تأیید تو می‌رسد؛ هر گام نادرست یا مبهم را ویرایش یا رد کن."),
      inp("عنوان", "title"), inp("رشته", "field"), inp("بازه حل‌نشده ماندن", "open", 0, "مثلاً ۱۶۳۷–۱۹۹۵"), inp("صورت مسئله", "statement", 4), inp("پاسخ نهایی و حل‌کننده", "answer", 3), inp("منابع", "src", 2), inp("یادداشت (اختیاری)", "notes", 2),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn", onclick: function (e) {
        if (!f.title || !f.statement || !f.answer) { A.toast("عنوان، صورت و پاسخ لازم است.", "bad"); return; }
        var b = e.target; b.disabled = true; b.textContent = "در حال تجزیه…";
        A.callAI(BT.PROB_SYS + window.EPI_PIPE.join(", "), "مسئله: " + f.title + "\nرشته: " + f.field + "\nبازه: " + f.open + "\nصورت: " + f.statement + "\nپاسخ: " + f.answer + "\nمنابع: " + f.src + "\nیادداشت: " + f.notes)
          .then(function (txt) { var o = validP(A.parseJSONLoose(txt)); o.src = o.src && o.src.length ? o.src : f.src.split(/\n|\|/).filter(Boolean); store(o, "ai"); b.disabled = false; b.textContent = "تجزیه با هوش مصنوعی"; })
          .catch(function (err) { A.toast(err.message || String(err), "bad"); b.disabled = false; b.textContent = "تجزیه با هوش مصنوعی"; });
      } }, "تجزیه با هوش مصنوعی"), h("button", { class: "btn ghost", onclick: function () { try { store(validP(JSON.parse(jsonTa.value)), "user"); } catch (er) { A.toast(er.message, "bad"); } } }, "ثبت JSON دستی")),
      jsonTa, out);
  }
  function pending() {
    var arr = S.all("eprob", function (p) { return p.status === "pending"; });
    if (!arr.length) return A.empty("مسئله‌ای در انتظار نیست.");
    return h("div", { class: "col gap" }, arr.map(function (r) {
      var p = r.p, ta = h("textarea", { rows: 10, class: "mono" }); ta.value = JSON.stringify(p, null, 1);
      return h("section", { class: "card" }, h("h3", {}, p.title + " · " + (r.by === "ai" ? "تجزیه هوش مصنوعی" : "دستی")), h("p", { class: "small" }, fa(p.stages.length) + " گام · " + fa(p.dead.length) + " بن‌بست · " + fa(p.drills.length) + " تمرین"),
        h("ol", { class: "small" }, p.stages.map(function (s) { return h("li", {}, fa(s.year || "") + " " + (s.who || "") + ": " + s.move); })),
        h("details", {}, h("summary", {}, "ویرایش JSON"), ta),
        h("div", { class: "row gap" }, h("button", { class: "btn sm", onclick: function () { try { r.p = validP(JSON.parse(ta.value)); r.p.id = p.id; r.status = "approved"; S.put(r); A.toast("تأیید شد؛ در شبیه‌ساز هست."); A.render(); } catch (er) { A.toast(er.message, "bad"); } } }, "تأیید"), h("button", { class: "btn ghost sm", onclick: function () { r.status = "rejected"; S.put(r); A.render(); } }, "رد")));
    }));
  }
})(APP);
