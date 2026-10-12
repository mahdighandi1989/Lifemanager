/* ===== شبیه‌ساز مسئله‌های بزرگ: تزریق مسئله و پاسخ، ریزکردن مسیر حل، تمرین از آسان به سخت ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, X = window.EPIX, BT = window.EPI_BT;
  if (!X) return;
  /* رکوردهای تأییدشدهٔ کاربر فقط اگر هنوز از validP رد شوند وارد فهرست/شبیه‌ساز/حرکت‌ها می‌شوند؛ رکوردِ خراب جدا نشان داده می‌شود
     (کارتِ «رکوردِ خراب» با دکمهٔ رد) تا یک رکوردِ بد هرگز کلِ فهرست را نشکند. */
  function approvedRecs() { return S.all("eprob", function (r) { return r && r.status === "approved"; }); }
  function recErr(r) { if (!r || !r.p) return "رکورد خالی است."; try { validP(JSON.parse(JSON.stringify(r.p))); return null; } catch (e) { return (e && e.message) || String(e); } }
  function probs() { return (window.EPI_PROBLEMS || []).concat(approvedRecs().filter(function (r) { return !recErr(r); }).map(function (r) { return r.p; })); }
  function brokenRecs() { return approvedRecs().map(function (r) { return { r: r, err: recErr(r) }; }).filter(function (x) { return x.err; }); }
  function brokenCard(r, err) {
    var t = r && r.p && typeof r.p.title === "string" ? r.p.title : (r && r.id) || "—";
    return h("section", { class: "card pb-broken", dir: "rtl", "data-rid": r && r.id }, h("div", { class: "row between wrap" }, h("strong", {}, "رکوردِ خراب: " + t), h("span", { class: "chip bad" }, "نمایش داده نمی‌شود")),
      h("p", { class: "small" }, "این مسئلهٔ ذخیره‌شده ساختارِ معتبر ندارد و برای این‌که بقیهٔ فهرست سالم بماند کنار گذاشته شد."), h("pre", { class: "small pb-err" }, String(err || "")),
      r && r.id ? h("button", { class: "btn ghost sm pb-reject", onclick: function () { r.status = "rejected"; S.put(r); A.toast("رکورد رد شد."); A.render(); } }, "رد کردنِ این رکورد") : null);
  }
  /* سرهمِ «سال · شخص»: سال در <bdi> تا «۳۵۰ پ.م.» در متنِ راست‌به‌چپ به‌هم نریزد */
  function yrWho(y, who, sep) { var a = []; if (y != null && y !== "") a.push(h("bdi", { class: "pb-year" }, yr(y))); if (who) { if (a.length) a.push(sep || " · "); a.push(who); } return a; }
  A.probYearNode = function (y) { return h("bdi", { class: "pb-year" }, yr(y)); };
  function getP(id) { return probs().filter(function (p) { return p.id === id; })[0]; }
  A.probs = probs; A.getProb = getP;
  /* سالِ گام: منفی ⇒ «پ.م.» */
  function yr(y) { if (y == null || y === "") return ""; var n = +y; return isNaN(n) ? fa(y) : n < 0 ? fa(-n) + " پ.م." : fa(n); }
  A.probYear = yr;
  function stName(id) { var s = A.EST && A.EST[id]; return s ? s.fa : id; }
  var LV = [null, { fa: "آسان — با گزینه و سرنخ", d: "زمینه، پرسش، گزینه‌ها و سرنخ دیده می‌شود." }, { fa: "متوسط — با گزینه، بی‌سرنخ", d: "سرنخ فقط با درخواست و با هزینه." }, { fa: "سخت — اول حرکت خودت", d: "پیش از دیدن گزینه‌ها حرکت پیشنهادی‌ات را بنویس." }, { fa: "استاد — بی‌گزینه", d: "فقط زمینه و پرسش؛ حرکتت را بنویس، سپس با حرکت واقعی مقایسه و خودت نمره بده." }];
  function prog(pid) { return S.get("eprog_" + pid) || { id: "eprog_" + pid, type: "eprog", lv: {} }; }
  function lvStats(pg, lv, n) { var L = pg.lv[lv] || {}; var ks = Object.keys(L); var ok = ks.filter(function (k) { return L[k].first === true || L[k].self === 2; }).length; return { done: ks.length, ok: ok, n: n, pct: n ? ok / n : 0 }; }
  function unlocked(pg, lv, n) { if (lv === 1) return true; var s = lvStats(pg, lv - 1, n); return s.done >= n && s.pct >= 0.8; }

  A.V.e_prob = function (pid, tab) {
    if (pid) return detail(pid, tab || "sim");
    var root = h("div", { class: "page pb-page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "مسئله‌های بزرگ حل‌شده", "مسئله‌های مشهوری که سال‌ها حل‌نشده ماندند، همراه پاسخشان. مسیر واقعی حل و بن‌بست‌ها گام‌به‌گام چیده شده تا خودت از آسان به سخت تمرین کنی. اثبات‌های نادرست تاریخی و حل نهایی، نمونه‌های آزمون کارخانه هم هستند.",
      A.V.moves ? h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm mv-golist", onclick: function () { A.go("moves"); } }, "🧗 حرکت‌های حلِ مسئله: یک حرکت را در مسئله‌های مختلف تمرین کن")) : null));
    root.appendChild(A.tabs([["list", "مسئله‌ها"], ["inject", "افزودن مسئله تازه"], ["pending", "در انتظار تأیید (" + fa(S.all("eprob", function (p) { return p.status === "pending"; }).length) + ")"]], tab || "list", function (k) { A.go("e_prob", null, k); }));
    if (tab === "inject") { root.appendChild(inject()); return root; }
    if (tab === "pending") { root.appendChild(pending()); return root; }
    root.appendChild(h("div", { class: "col gap" }, probs().map(function (p) {
      try {
        var pg = prog(p.id), n = p.stages.length, best = 0; for (var l = 1; l <= 4; l++) if (lvStats(pg, l, n).done >= n) best = l;
        return h("div", { class: "card" }, h("div", { class: "row between wrap" }, h("button", { class: "linkish", onclick: function () { A.go("e_prob", p.id); } }, h("strong", {}, p.title)), h("span", { class: "chip" }, p.field)),
          h("p", { class: "small" }, String(p.statement).split("\n")[0].slice(0, 260)), h("div", { class: "small muted" }, "باز از " + fa(p.open || "") + " · " + fa(n) + " گام · " + fa((p.dead || []).length) + " بن‌بست · " + fa((p.drills || []).length) + " تمرین · بالاترین سطح کامل‌شده: " + (best ? LV[best].fa : "—")));
      } catch (e) { console.warn(e); var rr = S.get("eprob_" + (p && p.id)); return brokenCard(rr || { p: p }, (e && e.message) || String(e)); }
    }), brokenRecs().map(function (x) { return brokenCard(x.r, x.err); })));
    return root;
  };

  function detail(pid, tab) {
    var p = getP(pid); if (!p) return A.empty("مسئله پیدا نشد.");
    /* پرش به یک گامِ مشخص: A.go("e_prob", pid, "sim:" + stageId) — از «حرکت‌ها» یا برگشت از «گره‌گشا».
       یک‌بار اعمال می‌شود؛ زیرزبانه به «sim» برمی‌گردد تا «گام بعد» دوباره به همان گام پرت نکند. */
    var jump = /^sim:(.+)$/.exec(tab || "");
    if (jump) {
      var ji = -1; p.stages.forEach(function (s, i) { if (s.id === jump[1]) ji = i; });
      if (ji >= 0) { var keepLv = A.simState && A.simState.pid === p.id ? A.simState.lv : 1; A.simState = { pid: p.id, lv: keepLv, order: "hist", i: ji, focus: jump[1] }; }
      tab = "sim"; A.state.sub = "sim";
      if (A.HOST && A.HOST.navigate) { try { A.HOST.navigate({ tab: "e_prob", a: p.id, s: "sim", replace: true }); } catch (e) { } }
    }
    var root = h("div", { class: "page pb-page" });
    root.appendChild(A.head(p.field + " — باز از " + fa(p.open || ""), p.title, null, h("div", { class: "row gap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_prob"); } }, "← مسئله‌ها"))));
    root.appendChild(A.tabs([["about", "مسئله و پاسخ"], ["era", "دوره و زمانه"], ["path", "مسیر حل"], ["sim", "شبیه‌ساز"], ["dead", "بن‌بست‌ها (" + fa((p.dead || []).length) + ")"], ["drills", "تمرین‌های هم‌خانواده"], ["lessons", "درس‌ها و ایستگاه‌ها"], ["cases", "پرونده‌های بک‌تست"]], tab, function (k) { A.go("e_prob", pid, k); }));
    var body = h("div", { class: "col gap" }); root.appendChild(body);
    try { detailBody(p, pid, tab, body); } catch (e) { console.warn(e); body.innerHTML = ""; body.appendChild(h("section", { class: "card pb-broken" }, h("strong", {}, "این بخش از مسئله نمایش داده نشد"), h("pre", { class: "small pb-err" }, (e && e.message) || String(e)))); }
    return root;
  }
  function srcNodes(list) {
    /* منبع: نشانیِ http(s) ⇒ پیوندِ امن (برگهٔ تازه، noopener)؛ بقیه فقط متن */
    return h("ul", { class: "small pb-src" }, list.map(function (x) {
      var t = String(x), parts = t.split(/(https?:\/\/[^\s<>"«»]+)/i);
      return h("li", { dir: "auto" }, parts.map(function (q, i) {
        if (i % 2 === 1) { var u = q.replace(/[).,،؛;:]+$/, ""), tail = q.slice(u.length); return [h("a", { href: u, target: "_blank", rel: "noopener noreferrer", class: "pb-srclink" }, u), tail]; }
        return q;
      }));
    }));
  }
  A.probSrcNodes = srcNodes;
  function detailBody(p, pid, tab, body) {
    if (tab === "about") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "صورت مسئله"), String(p.statement).split("\n").map(function (x) { return h("p", {}, x); })));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "چرا سال‌ها حل نشد"), h("p", {}, p.why_hard)));
      body.appendChild(h("details", { class: "card" }, h("summary", {}, h("strong", {}, "پاسخ نهایی (پیش از شبیه‌ساز نخوان)")), h("p", {}, p.answer), (p.src || []).length ? h("div", { class: "small muted" }, h("strong", {}, "منابع:"), srcNodes(p.src)) : null));
    } else if (tab === "path") {
      body.appendChild(h("ol", { class: "timeline" }, p.stages.map(function (s) {
        return h("li", { class: "card" }, h("div", { class: "row between wrap" }, h("strong", {}, yrWho(s.year, s.who)), h("span", { class: "chip" }, "دشواری " + fa(s.lvl))),
          h("p", { class: "small" }, s.ctx), h("p", {}, h("strong", {}, "حرکت: "), s.move), h("p", {}, h("strong", {}, "ایده ساده: "), s.idea),
          h("div", { class: "row gap wrap" }, (s.st || []).map(function (x) { return A.stLink(x); }), (s.tech || []).map(function (t) { return A.techLink(t); })),
          A.moveChips ? A.moveChips(p, s, "حرکت‌ها: ") : null);
      })));
    } else if (tab === "era") {
      body.appendChild(era(p));
    } else if (tab === "dead") {
      (p.dead || []).forEach(function (d) { body.appendChild(h("section", { class: "card" }, h("h3", {}, yrWho(d.year, d.who)), h("p", {}, h("strong", {}, "ایده: "), d.idea), h("p", {}, h("strong", {}, "شکاف: "), d.flaw), h("div", { class: "row gap wrap" }, (d.st || []).map(function (x) { return A.stLink(x); })))); });
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
  }

  /* «دوره و زمانه»: p.era = {known, assumed, tools} (رشته یا آرایه) اگر نوشته شده؛ وگرنه خلاصهٔ صادقانه از «وضعِ دانش» ِ گام‌ها */
  function era(p) {
    var e = p.era || {}, parts = [["known", "آنچه آن زمان دانسته بود"], ["assumed", "آنچه بی‌چون‌وچرا فرض می‌شد"], ["tools", "ابزارهایی که در دسترس بود (و نبود)"]];
    function txt(v) { return Array.isArray(v) ? h("ul", {}, v.map(function (x) { return h("li", {}, String(x)); })) : String(v).split("\n").map(function (x) { return h("p", {}, x); }); }
    var have = parts.filter(function (k) { var v = e[k[0]]; return Array.isArray(v) ? v.length : v && String(v).trim(); });
    var box = h("div", { class: "col gap mv-era", dir: "rtl" });
    if (have.length) {
      box.appendChild(h("p", { class: "small muted" }, "بازهٔ حل‌نشده ماندن: " + fa(p.open || "—") + " · " + (p.field || "")));
      have.forEach(function (k) { box.appendChild(h("section", { class: "card" }, h("h2", {}, k[1]), txt(e[k[0]]))); });
      return box;
    }
    box.appendChild(h("section", { class: "card soft mv-era-note" }, h("p", { class: "small" }, "شرحِ اختصاصیِ «دوره و زمانه» برای این مسئله هنوز نوشته نشده است. آنچه پایین می‌بینی فقط از متنِ «وضعِ دانش» ِ گام‌های «مسیر حل» کنار هم چیده شده — به ترتیبِ زمان — و ادعای تازه‌ای به آن افزوده نشده است.")));
    var ss = p.stages.slice().sort(function (a, b) { return (+a.year || 0) - (+b.year || 0); });
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "از مسیرِ حل"), h("ol", { class: "mv-era-list" }, ss.map(function (s) {
      return h("li", {}, h("strong", {}, yrWho(s.year, s.who)), h("p", { class: "small" }, s.ctx || "—"));
    }))));
    return box;
  }

  function drills(p) {
    var box = h("section", { class: "card drill" }), ds = (p.drills || []).slice().sort(function (a, b) { return a.lvl - b.lvl; }), done = 0, sc = 0;
    var head = h("p", { class: "small muted" }, "از آسان (۱) به سخت (۵). پاسخ و توضیح بلافاصله نمایش داده می‌شود.");
    box.appendChild(head);
    ds.forEach(function (d, n) {
      var ord = A.shuffle(d.opts.map(function (_, i) { return i; })), fb = h("div", { class: "dfb" }), got = false;
      var opts = h("div", { class: "dopts pb-opts" }, ord.map(function (k) { return h("button", { class: "dopt", onclick: function () {
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
    var card = h("section", { class: "card simcard" }), revealed = false, ta = null, mineTxt = null;
    card.appendChild(h("div", { class: "row between wrap" }, h("span", { class: "eyebrow", dir: "rtl" }, "گام " + fa(st.i + 1) + " از " + fa(idx.length), (s0.year != null && s0.year !== "") || s0.who ? " · " : "", yrWho(s0.year, s0.who)), h("span", { class: "chip" }, "دشواری " + fa(s0.lvl))));
    card.appendChild(h("p", {}, h("strong", {}, "وضع دانش: "), s0.ctx));
    card.appendChild(h("h3", {}, s0.q));
    var area = h("div", { class: "col gap" }); card.appendChild(area);
    function finish(first, self) {
      /* نمرهٔ بار اول هرگز بازنویسی نمی‌شود؛ پاسخِ نوشته‌شدهٔ سطحِ ۳ (mine) هم نگه داشته می‌شود */
      var L = pg.lv[st.lv]; var prev = L[s0.id];
      var nr = { first: prev && prev.first != null ? prev.first : first, at: new Date().toISOString() };
      var sf = prev && prev.self != null ? prev.self : self; if (sf != null) nr.self = sf;
      var mn = mineTxt != null ? mineTxt : prev && prev.mine; if (mn) nr.mine = mn;
      L[s0.id] = nr; S.put(pg);
      revealed = true;
      area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده ساده: "), s0.idea), h("div", { class: "row gap wrap" }, (s0.st || []).map(function (x) { return A.stLink(x); })),
        A.moveChips ? A.moveChips(p, s0, "حرکتِ این گام: ") : null));
      area.appendChild(h("button", { class: "btn", onclick: function () { st.i++; A.render(); } }, st.i + 1 < idx.length ? "گام بعد" : "پایان سطح"));
    }
    function options(firstTry) {
      var ord = A.shuffle(s0.opts.map(function (_, i) { return i; })), tried = 0;
      var opts = h("div", { class: "dopts pb-opts" }, ord.map(function (k) { var o = s0.opts[k]; return h("button", { class: "dopt", onclick: function (e) {
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
      ta = h("textarea", { id: "pbMine", rows: 4, "aria-describedby": "pbMineHint", placeholder: "حرکت پیشنهادی تو در این لحظه تاریخی، با دلیلش (بی‌نگاه به پاسخ)" }); if (rec && rec.mine) ta.value = rec.mine;
      area.appendChild(h("label", { for: "pbMine", class: "pb-minelbl" }, "حرکتِ پیشنهادیِ تو (پیش از دیدنِ " + (st.lv === 3 ? "گزینه‌ها" : "حرکتِ واقعی") + ")"));
      area.appendChild(ta);
      area.appendChild(h("div", { class: "small muted", id: "pbMineHint" }, "دست‌کم یک جملهٔ کامل، با دلیلش. متنت همراهِ نمرهٔ این گام ذخیره می‌شود."));
      area.appendChild(h("button", { class: "btn", onclick: function (e) {
        if (ta.value.trim().length < 15) { A.toast("دست‌کم یک جمله کامل بنویس.", "bad"); return; }
        e.target.disabled = true; ta.disabled = true;
        (pg.lv[st.lv] = pg.lv[st.lv] || {}); mineTxt = ta.value;
        if (st.lv === 3) options(true);
        else {
          revealed = true;
          area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده: "), s0.idea), h("p", { class: "small" }, h("strong", {}, "گزینه‌هایی که آن زمان مطرح بود: "), A.shuffle(s0.opts.slice()).map(function (o) { return (o.ok ? "✓ " : "✗ ") + o.t; }).join(" · ")),
            A.moveChips ? A.moveChips(p, s0, "حرکتِ این گام: ") : null));
          area.appendChild(h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "حرکت تو چقدر با حرکت واقعی (یا معادل معتبرش) می‌خواند؟"), [0, 1, 2].map(function (v) { return h("button", { class: "btn ghost sm", onclick: function () { area.lastChild.remove(); finishMaster(v); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]); })));
        }
      } }, st.lv === 3 ? "ثبت و دیدن گزینه‌ها" : "ثبت و مقایسه با حرکت واقعی"));
    }
    function finishMaster(v) {
      /* بار اول: first/self همان می‌ماند؛ آخرین خودارزیابی در last؛ متنِ این بار در mine */
      var L = pg.lv[st.lv], prev = L[s0.id];
      L[s0.id] = { first: prev && prev.first != null ? prev.first : v === 2, self: prev && prev.self != null ? prev.self : v, last: v, mine: mineTxt != null ? mineTxt : (prev && prev.mine) || "", at: new Date().toISOString() }; S.put(pg); area.appendChild(h("button", { class: "btn", onclick: function () { st.i++; A.render(); } }, st.i + 1 < idx.length ? "گام بعد" : "پایان سطح")); }
    /* «🪢 این‌جا گیر کردم» ⇒ یک موقعیتِ عادیِ گره‌گشا (a19 ⇒ A.probStuck؛ فقط اگر a16 بار شده) */
    if (A.probStuck) { var sb = A.probStuck(p, s0, si, function () { return { revealed: revealed, mine: (ta && ta.value) || (rec && rec.mine) || "" }; }); if (sb) card.appendChild(sb); }
    box.appendChild(card);
    return box;
  }

  /* ---------- تزریق مسئله تازه (هوش مصنوعی فقط تجزیه‌گر؛ با تأیید شما) ---------- */
  /* validP: ساختار را سخت‌گیرانه می‌سنجد و همهٔ ایرادها را یک‌جا به فارسی برمی‌گرداند (نه فقط اولی). فقط چیزهای بی‌خطر را
     خودش درست می‌کند: شناسهٔ خالی ⇒ n1/d1…، سطح ⇒ ۱..۵، st/tech/mv ِ ناشناخته ⇒ دور ریخته، era ِ خالی ⇒ حذف. */
  function validP(o) {
    var E = [];
    function isS(v) { return typeof v === "string"; }
    function ne(v) { return isS(v) && v.trim().length > 0; }
    function isObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
    function optS(obj, k, L) { if (obj[k] != null && !isS(obj[k])) E.push(L + ": «" + k + "» باید متن باشد"); }
    function year(obj, L) { var y = obj.year; if (y != null && y !== "" && !(typeof y === "number" && isFinite(y)) && !isS(y)) E.push(L + ": «year» باید عدد یا متن باشد"); }
    function strArr(v, k) { if (v == null) return []; if (!Array.isArray(v) || v.some(function (x) { return !isS(x); })) { E.push("«" + k + "» باید آرایه‌ای از متن‌ها باشد"); return []; } return v; }
    if (!isObj(o)) throw new Error("JSON ِ مسئله باید یک شیء ({…}) باشد.");
    [["title", "عنوان"], ["field", "رشته"], ["statement", "صورت مسئله"], ["answer", "پاسخ نهایی"], ["why_hard", "چرا سال‌ها حل نشد"]].forEach(function (k) { if (!ne(o[k[0]])) E.push("«" + k[1] + "» (" + k[0] + ") باید متنِ ناخالی باشد"); });
    if (typeof o.open === "number") o.open = String(o.open); optS(o, "open", "مسئله");
    var ids = {}, PIPE = window.EPI_PIPE || [], MV = A.MOVE_IDS || [];  // فهرستِ ثابتِ حرکت‌ها (a19)؛ شناسهٔ ناشناخته دور ریخته می‌شود
    function uid(it, L) { if (!isS(it.id)) { E.push(L + ": «id» باید متن باشد"); return; } if (ids[it.id]) E.push(L + ": شناسهٔ تکراری «" + it.id + "»"); ids[it.id] = 1; }
    function sts(it, L) { if (it.st == null) { it.st = []; return; } if (!Array.isArray(it.st)) { E.push(L + ": «st» باید آرایه باشد"); return; } it.st = it.st.filter(function (x) { return PIPE.indexOf(x) >= 0; }); }
    if (!Array.isArray(o.stages) || !o.stages.length) E.push("«stages» باید آرایه‌ای ناخالی از گام‌ها باشد");
    else o.stages.forEach(function (s, i) {
      var L = "گام " + fa(i + 1);
      if (!isObj(s)) { E.push(L + ": باید شیء باشد"); return; }
      if (s.id == null || s.id === "") s.id = "n" + (i + 1);
      uid(s, L);
      if (!ne(s.q)) E.push(L + ": پرسش («q») باید متنِ ناخالی باشد");
      ["ctx", "move", "idea", "hint", "who"].forEach(function (k) { optS(s, k, L); });
      year(s, L);
      if (!Array.isArray(s.opts) || s.opts.length < 2) E.push(L + ": «opts» باید آرایه‌ای با دست‌کم ۲ گزینه باشد");
      else {
        var nok = 0;
        s.opts.forEach(function (x, j) {
          if (!isObj(x) || !ne(x.t) || typeof x.ok !== "boolean") { E.push(L + "، گزینهٔ " + fa(j + 1) + ": باید {\"t\": متن، \"ok\": true یا false} باشد"); return; }
          if (x.ok) nok++; optS(x, "why", L + "، گزینهٔ " + fa(j + 1)); optS(x, "hist", L + "، گزینهٔ " + fa(j + 1));
        });
        if (nok !== 1) E.push(L + ": دقیقاً یک گزینهٔ درست («ok»: true) لازم است؛ " + fa(nok) + " تا هست");
      }
      sts(s, L);
      if (s.tech != null) { if (!Array.isArray(s.tech)) E.push(L + ": «tech» باید آرایه باشد"); else s.tech = s.tech.filter(function (t) { return A.TM && A.TM[t]; }); }
      s.lvl = Math.max(1, Math.min(5, Math.round(+s.lvl) || 3));
      var mv = (typeof s.mv === "string" ? [s.mv] : Array.isArray(s.mv) ? s.mv : []).filter(function (x, j, a) { return MV.indexOf(x) >= 0 && a.indexOf(x) === j; }).slice(0, 2);
      if (mv.length) s.mv = mv; else delete s.mv;
    });
    if (o.dead == null) o.dead = [];
    if (!Array.isArray(o.dead)) { E.push("«dead» باید آرایه باشد"); o.dead = []; }
    o.dead.forEach(function (d, i) {
      var L = "بن‌بست " + fa(i + 1);
      if (!isObj(d)) { E.push(L + ": باید شیء باشد"); return; }
      if (d.id == null || d.id === "") d.id = "d" + (i + 1);
      uid(d, L); year(d, L);
      ["idea", "flaw"].forEach(function (k) { if (!ne(d[k])) E.push(L + ": «" + k + "» باید متنِ ناخالی باشد"); });
      optS(d, "who", L); sts(d, L);
    });
    o.lessons = strArr(o.lessons, "lessons");
    o.src = strArr(o.src, "src");
    if (o.drills == null) o.drills = [];
    if (!Array.isArray(o.drills)) { E.push("«drills» باید آرایه باشد"); o.drills = []; }
    o.drills.forEach(function (d, i) {
      var L = "تمرین " + fa(i + 1);
      if (!isObj(d)) { E.push(L + ": باید شیء باشد"); return; }
      if (!ne(d.q)) E.push(L + ": «q» باید متنِ ناخالی باشد");
      var okOpts = Array.isArray(d.opts) && d.opts.length >= 2 && d.opts.every(ne);
      if (!okOpts) E.push(L + ": «opts» باید آرایه‌ای از دست‌کم ۲ متن باشد");
      if (typeof d.a !== "number" || Math.floor(d.a) !== d.a || (okOpts && (d.a < 0 || d.a >= d.opts.length))) E.push(L + ": «a» باید شمارهٔ (از صفر) یکی از گزینه‌ها باشد");
      optS(d, "why", L);
      d.lvl = Math.max(1, Math.min(5, Math.round(+d.lvl) || 3));
    });
    o.cases = [];
    if (o.era == null) delete o.era;
    else if (!isObj(o.era)) { E.push("«era» باید شیء باشد ({known, assumed, tools})"); delete o.era; }
    else {
      var e = {};
      ["known", "assumed", "tools"].forEach(function (k) {
        var v = o.era[k]; if (v == null) return;
        if (Array.isArray(v)) { if (v.some(function (x) { return !isS(x); })) { E.push("era." + k + " باید متن یا آرایه‌ای از متن‌ها باشد"); return; } v = v.filter(function (x) { return x.trim(); }); if (v.length) e[k] = v; }
        else if (isS(v)) { if (v.trim()) e[k] = v.trim(); }
        else E.push("era." + k + " باید متن یا آرایه‌ای از متن‌ها باشد");
      });
      if (Object.keys(e).length) o.era = e; else delete o.era;
    }
    if (E.length) throw new Error("JSON ِ مسئله معتبر نیست (" + fa(E.length) + " ایراد):\n• " + E.slice(0, 15).join("\n• ") + (E.length > 15 ? "\n• … و " + fa(E.length - 15) + " ایرادِ دیگر" : ""));
    return o;
  }
  A.probValid = validP;
  /* متنِ JSON ⇒ شیء، با پیامِ فارسی برای JSON ِ خراب */
  var AI_BAD_JSON = "پاسخِ هوش مصنوعی JSON ِ معتبر نبود؛ دوباره تلاش کن یا JSON را دستی وارد کن.";
  function parseJ(txt, loose, msg) {
    try { return loose ? A.parseJSONLoose(txt) : JSON.parse(txt); }
    catch (e) { throw new Error(msg || ("JSON ِ واردشده معتبر نیست (خطای نحوی: " + ((e && e.message) || e) + ").")); }
  }
  A.PROB_AI_BAD_JSON = AI_BAD_JSON;

  /* ---------- بازبینِ تاریخی: فراخوانیِ دومِ مستقل روی خروجیِ تجزیه‌گر ----------
     هر گام/بن‌بستی که ادعای تاریخیِ نامطمئن یا بی‌پشتوانه دارد پرچم می‌خورد؛ تا مالک هر پرچم را «اصلاح» (تغییرِ واقعیِ همان قلم
     در JSON) یا آگاهانه «بپذیرد»، دکمهٔ تأیید بسته است. هوش مصنوعی داور نیست — فقط پرچم پیشنهاد می‌کند. */
  A.PROB_VERIFY_SYS = "تو «بازبینِ تاریخی» هستی و مستقل از سازندهٔ این تجزیه کار می‌کنی. ورودی: (۱) تجزیهٔ JSON ِ مسیرِ تاریخیِ حلِ یک مسئله که هوش مصنوعیِ دیگری ساخته است، (۲) منابعی که کاربر داده است.\n" +
    "برای هر گام (stages) و هر بن‌بست (dead) با همان شناسهٔ id، ادعاهای تاریخی‌اش را بسنج: تاریخ‌ها، نامِ اشخاص، نسبت‌دادنِ کار یا ایده به اشخاص، رویدادها و عنوانِ آثار.\n" +
    "اگر ادعایی با منابعِ کاربر یا دانشِ تاریخیِ مستقر پشتیبانی نمی‌شود، نادرست است، یا مطمئن نیستی، ok=false بده و در issue دقیق بنویس کدام ادعا و چرا (نادرست / نامطمئن / بی‌منبع). فقط وقتی همهٔ ادعاهای آن قلم را با اطمینان درست می‌دانی ok=true و issue خالی.\n" +
    "چیزی را فقط چون محتمل به نظر می‌رسد درست فرض نکن. متنِ جایگزین ننویس. دربارهٔ ارزشِ آموزشی یا گزینه‌ها داوری نکن؛ فقط درستیِ تاریخی.\n" +
    "خروجی فقط یک آرایهٔ JSON معتبر، بی هیچ متنِ دیگر، با یک قلم برای هر گام و هر بن‌بست: [{\"sid\":\"n1\",\"ok\":true,\"issue\":\"\"}]";
  function itemOf(p, sid) { var all = (p.stages || []).concat(p.dead || []); for (var i = 0; i < all.length; i++) if (all[i] && all[i].id === sid) return all[i]; return null; }
  /* عکسِ معنایی: کلیدها مرتب، فاصله‌های متن یکسان‌شده ⇒ ویرایشِ صرفاً فاصله‌ای «تغییر» حساب نمی‌شود */
  function normS(x) { return String(x).replace(/\s+/g, " ").trim(); }
  function canon(v) {
    if (typeof v === "string") return JSON.stringify(normS(v));
    if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
    if (v && typeof v === "object") return "{" + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined; }).map(function (k) { return JSON.stringify(k) + ":" + canon(v[k]); }).join(",") + "}";
    return JSON.stringify(v === undefined ? null : v);
  }
  function reCanon(s) { if (s == null) return null; try { return canon(JSON.parse(s)); } catch (e) { return String(s); } }
  function snapOf(p, sid) { var it = itemOf(p, sid); return it ? canon(it) : null; }
  function sameSnap(a, b) { return a != null && b != null && reCanon(a) === reCanon(b); }
  A.probCanon = canon;
  function allItems(p) { return (p.stages || []).concat(p.dead || []).filter(Boolean); }

  /* verify(r, srcText, only): only = فهرستِ شناسه‌ها ⇒ فقط همان قلم‌ها دوباره بازبینی می‌شوند و پرچم/عکسِ بقیه دست نمی‌خورد.
     r.verify.snaps[sid] = عکسِ هر قلم در لحظه‌ای که بازبین دیدش؛ r.verify.okSnaps[sid] = عکسی که مالک آگاهانه پذیرفت/اصلاح کرد.
     «تأیید» فقط وقتی باز است که هر گام/بن‌بستِ JSON ِ نهایی با یکی از این دو عکس یکی باشد. */
  function verify(r, srcText, only) {
    var p = r.p, sel = only && only.length ? only : null;
    function pick(arr) { return (arr || []).filter(function (it) { return it && (!sel || sel.indexOf(it.id) >= 0); }); }
    var send = { stages: pick(p.stages), dead: pick(p.dead) };
    var prev = r.verify || {}, oldFlags = prev.flags || [];
    return Promise.resolve().then(function () {
      return A.callAI(A.PROB_VERIFY_SYS, "منابعِ کاربر:\n" + (srcText || (p.src || []).join("\n") || "—") + "\n\nتجزیه:\n" + JSON.stringify({ title: p.title, field: p.field, open: p.open, era: p.era || null, stages: send.stages, dead: send.dead }));
    }).then(function (txt) {
      var arr = parseJ(txt, true, "پاسخِ بازبین JSON ِ معتبر نبود"); if (arr && !Array.isArray(arr)) arr = arr.items || arr.verdicts || null;
      if (!Array.isArray(arr)) throw new Error("پاسخِ بازبین آرایه نبود");
      var flags = sel ? oldFlags.filter(function (f) { return sel.indexOf(f.sid) < 0; }) : [], got = {};
      function keep(f) { var o = oldFlags.filter(function (x) { return x.sid === f.sid && sameSnap(x.snap, f.snap) && x.state === "accepted"; })[0]; if (o) { f.state = "accepted"; f.decided = o.decided; } return f; }
      arr.forEach(function (v) {
        if (!v) return; var sid = String(v.sid || v.id || "").trim(); got[sid] = 1;
        if (v.ok === true) return;
        var known = !!itemOf(send, sid);
        flags.push(keep({ sid: known ? sid : "*", issue: String(v.issue || "بازبین بی‌توضیح پرچم زد.").trim() + (known || !sid ? "" : " (شناسهٔ «" + sid + "» در تجزیه نیست)"), state: "open", snap: known ? snapOf(p, sid) : null }));
      });
      var snaps = sel ? Object.assign({}, prev.snaps || {}) : {}, okSnaps = sel ? Object.assign({}, prev.okSnaps || {}) : {};
      allItems(send).forEach(function (it) {
        snaps[it.id] = canon(it); delete okSnaps[it.id];
        if (!got[it.id]) flags.push(keep({ sid: it.id, issue: "بازبین دربارهٔ این قلم حکمی نداد؛ درستیِ تاریخی‌اش سنجیده نشده است.", state: "open", snap: canon(it) }));
      });
      r.verify = { at: new Date().toISOString(), n: arr.length, flags: flags, snaps: snaps, okSnaps: okSnaps };
      if (sel) r.verify.partial = sel.slice();
    }, function (err) {
      var m = (err && err.message) || String(err);
      if (sel) {
        var fl = oldFlags.filter(function (f) { return sel.indexOf(f.sid) < 0; });
        allItems(send).forEach(function (it) { fl.push({ sid: it.id, issue: "بازبینیِ دوبارهٔ این قلمِ تغییرکرده اجرا نشد (" + m + "). دوباره اجرا کن یا آگاهانه بپذیر.", state: "open", snap: canon(it) }); });
        r.verify = Object.assign({}, prev, { at: new Date().toISOString(), flags: fl, partialError: m });
      } else r.verify = { at: new Date().toISOString(), error: m, flags: [{ sid: "*", all: true, issue: "بازبینِ تاریخی اجرا نشد (" + m + "). یا دوباره اجرایش کن یا آگاهانه بی‌بازبینی بپذیر.", state: "open", snap: null }] };
    }).then(function () { S.put(r); return r; });
  }
  A.probVerify = verify;
  /* پرچم‌های یک رکوردِ در انتظار؛ تجزیهٔ هوش مصنوعیِ بی‌بازبینی (مثلاً رکوردهای قدیمی) خودش یک پرچمِ باز است */
  function flagsOf(r) {
    if (r.verify && r.verify.flags) return r.verify.flags;
    if (r.by === "ai") return [{ sid: "*", all: true, issue: "بازبینِ تاریخی روی این تجزیه اجرا نشده است.", state: "open", snap: null, synthetic: true }];
    return [];
  }
  function openFlags(r) { return flagsOf(r).filter(function (f) { return f.state === "open"; }); }
  A.probOpenFlags = openFlags;
  /* قلم‌هایی که پس از بازبینی تغییر کرده‌اند و هنوز نه دوباره بازبینی شده‌اند نه آگاهانه پذیرفته (فقط تجزیهٔ هوش مصنوعی) */
  function changedItems(r, p) {
    if (r.by !== "ai") return [];
    var v = r.verify || {}, sn = v.snaps || {}, ok = v.okSnaps || {};
    return allItems(p).filter(function (it) { var c = canon(it); return sn[it.id] !== c && ok[it.id] !== c; });
  }
  A.probChanged = changedItems;
  /* رکوردِ قدیمی که پیش از «عکسِ بازبینی» بازبینی شده: یک‌بار همان نسخهٔ ذخیره‌شده عکسِ پایه می‌شود */
  function migrate(r) {
    if (r.by === "ai" && r.verify && !r.verify.error && !r.verify.snaps && r.p) { var sn = {}; allItems(r.p).forEach(function (it) { sn[it.id] = canon(it); }); r.verify.snaps = sn; r.verify.okSnaps = r.verify.okSnaps || {}; S.put(r); }
  }

  function inject() {
    var f = { title: "", field: "", open: "", statement: "", answer: "", src: "", notes: "" };
    function inp(lbl, k, ta, ph) { var id = "pbIn_" + k; var el = ta ? h("textarea", { id: id, rows: ta, placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }) : h("input", { id: id, type: "text", placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }); return h("div", {}, h("label", { for: id }, lbl), el); }
    var jsonTa = h("textarea", { rows: 6, class: "mono", "aria-label": "JSON ِ کاملِ مسئله", placeholder: "یا JSON کامل مسئله را طبق طرح بچسبان" });
    var out = h("div", { "aria-live": "polite" });
    function store(o, by) { var id = "pb_u_" + Date.now().toString(36); o.id = id; var r = { id: "eprob_" + id, type: "eprob", status: "pending", by: by, p: o }; S.put(r); out.innerHTML = ""; out.appendChild(h("p", {}, "مسئله در صف تأیید است. پیش از تأیید، گام‌ها و درستی تاریخی‌شان را بسنج.")); return r; }
    return h("section", { class: "card col gap", dir: "rtl" }, h("h2", {}, "تزریق مسئله سخت حل‌شده"),
      h("p", { class: "small" }, "مسئله و پاسخ نهایی‌اش را بنویس. هوش مصنوعی فقط مسیر تاریخی حل را به گام‌های تصمیم، گزینه‌ها، بن‌بست‌ها و تمرین‌های مشابه می‌شکند. سپس یک «بازبینِ تاریخیِ» جدا (فراخوانیِ دومِ مستقل) تاریخ‌ها، اشخاص و رویدادها را با منابعِ تو می‌سنجد و هر ادعای نامطمئن را پرچم می‌زند. نتیجه پیش از ورود به شبیه‌ساز به تأیید تو می‌رسد؛ تا هر پرچم را اصلاح یا آگاهانه نپذیری، تأیید بسته است."),
      inp("عنوان", "title"), inp("رشته", "field"), inp("بازه حل‌نشده ماندن", "open", 0, "مثلاً ۱۶۳۷–۱۹۹۵"), inp("صورت مسئله", "statement", 4), inp("پاسخ نهایی و حل‌کننده", "answer", 3),
      inp("منابع — برای تجزیه با هوش مصنوعی دست‌کم یکی لازم است (نامِ کتاب/مقاله یا نشانیِ اینترنتی؛ هر منبع در یک سطر)", "src", 2), inp("یادداشت (اختیاری)", "notes", 2),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn pb-ai", onclick: function (e) {
        if (!f.title || !f.statement || !f.answer) { A.toast("عنوان، صورت و پاسخ لازم است.", "bad"); return; }
        if (!String(f.src || "").trim()) { A.toast("دست‌کم یک منبع (متن یا نشانی) بنویس؛ بازبینِ تاریخی ادعاها را با همین منابع می‌سنجد.", "bad"); var se = document.getElementById("pbIn_src"); if (se) se.focus(); return; }
        var b = e.target; b.disabled = true; b.textContent = "در حال تجزیه…";
        A.callAI(BT.PROB_SYS + window.EPI_PIPE.join(", "), "مسئله: " + f.title + "\nرشته: " + f.field + "\nبازه: " + f.open + "\nصورت: " + f.statement + "\nپاسخ: " + f.answer + "\nمنابع: " + f.src + "\nیادداشت: " + f.notes)
          .then(function (txt) {
            var raw = parseJ(txt, true, AI_BAD_JSON);
            if (raw && typeof raw === "object" && !Array.isArray(raw) && (raw.src == null || (Array.isArray(raw.src) && !raw.src.length))) raw.src = f.src.split(/\n|\|/).map(function (x) { return x.trim(); }).filter(Boolean);
            var o = validP(raw);
            var r = store(o, "ai"); b.textContent = "در حال بازبینیِ تاریخی…";
            return verify(r, f.src).then(function (r2) {
              var n = openFlags(r2).length; out.innerHTML = "";
              out.appendChild(h("p", {}, "مسئله در صف تأیید است. " + (r2.verify.error ? "بازبینِ تاریخی اجرا نشد؛ در «در انتظار تأیید» دوباره اجرایش کن." : n ? "بازبینِ تاریخی " + fa(n) + " قلم را پرچم زد؛ در «در انتظار تأیید» هر کدام را اصلاح یا آگاهانه بپذیر." : "بازبینِ تاریخی پرچمی نزد؛ باز هم پیش از تأیید خودت گام‌ها را بسنج.")));
            });
          })
          .catch(function (err) { var m = (err && err.message) || String(err); out.innerHTML = ""; out.appendChild(h("pre", { class: "small bad pb-err", role: "alert" }, m)); A.toast(m.split("\n")[0], "bad"); })
          .then(function () { b.disabled = false; b.textContent = "تجزیه با هوش مصنوعی"; });
      } }, "تجزیه با هوش مصنوعی"), h("button", { class: "btn ghost pb-manual", onclick: function () {
        try { store(validP(parseJ(jsonTa.value)), "user"); } catch (er) { var m = er.message || String(er); out.innerHTML = ""; out.appendChild(h("pre", { class: "small bad pb-err", role: "alert" }, m)); A.toast(m.split("\n")[0], "bad"); }
      } }, "ثبت JSON دستی")),
      jsonTa, out);
  }
  function pending() {
    var arr = S.all("eprob", function (p) { return p && p.status === "pending"; });
    if (!arr.length) return A.empty("مسئله‌ای در انتظار نیست.");
    return h("div", { class: "col gap" }, arr.map(function (r) {
      try { return pendingCard(r); }
      catch (e) { console.warn(e); var c = brokenCard(r, (e && e.message) || String(e)); c.querySelector(".chip").textContent = "در انتظار — خراب"; return c; }
    }));
  }
  function pendingCard(r) {
    migrate(r);
    var p = r.p, ta = h("textarea", { rows: 10, class: "mono", "aria-label": "JSON ِ مسئله" }); ta.value = JSON.stringify(p, null, 1);
    var fl = flagsOf(r), open = fl.filter(function (x) { return x.state === "open"; }), changed = changedItems(r, p);
    var msg = h("div", { "aria-live": "polite", class: "pb-pmsg" });
    function say(m) { msg.innerHTML = ""; msg.appendChild(h("pre", { class: "small bad pb-err", role: "alert" }, m)); A.toast(String(m).split("\n")[0], "bad"); }
    function editorP() { var np = validP(parseJ(ta.value)); np.id = p.id; return np; }
    function okSnap(sid, np) { var v = r.verify || (r.verify = { at: new Date().toISOString(), flags: [] }); v.okSnaps = v.okSnaps || {}; var c = snapOf(np, sid); if (c) v.okSnaps[sid] = c; }
    function decide(fx, how) {
      var np; try { np = editorP(); } catch (er) { say(er.message); return; }
      if (how === "fixed") {
        var now = snapOf(np, fx.sid);
        if (!now) { say("این قلم در JSON ِ ویرایش‌شده پیدا نشد."); return; }
        if (sameSnap(now, fx.snap)) { say("این قلم در JSON تغییرِ معناداری نکرده (فاصله‌ها حساب نمی‌شوند)؛ اول همان‌جا اصلاحش کن، یا آگاهانه بپذیر."); var d = ta.closest("details"); if (d) d.open = true; ta.focus(); return; }
      }
      r.p = np;
      if (fx.synthetic) { delete fx.synthetic; r.verify = { at: new Date().toISOString(), flags: [fx] }; }
      if (fx.sid === "*") { if (fx.all || (r.verify && r.verify.error)) allItems(np).forEach(function (it) { okSnap(it.id, np); }); }
      else okSnap(fx.sid, np);
      fx.state = how; fx.decided = new Date().toISOString(); S.put(r); A.render();
    }
    function flagBox(fx) {
      return h("div", { class: "mv-flag " + fx.state },
        h("p", { class: "small" }, h("strong", {}, fx.state === "open" ? "⚑ پرچمِ بازبینِ تاریخی: " : fx.state === "accepted" ? "✓ آگاهانه پذیرفته شد: " : "✓ اصلاح شد: "), fx.issue),
        fx.state === "open" ? h("div", { class: "row gap wrap" },
          fx.sid !== "*" ? h("button", { class: "btn sm ghost mv-fix", onclick: function () { decide(fx, "fixed"); } }, "اصلاحش کردم (در JSON)") : null,
          h("button", { class: "btn sm ghost mv-accept", onclick: function () { decide(fx, "accepted"); } }, fx.sid === "*" ? "آگاهانه می‌پذیرم" : "با وجودِ این، آگاهانه می‌پذیرم")) : null);
    }
    function rereview(btn, sids) {
      var np; try { np = editorP(); } catch (er) { say(er.message); return; }
      r.p = np; btn.disabled = true; btn.textContent = "در حال بازبینی…";
      verify(r, (np.src || []).join("\n"), sids).then(function () { A.render(); });
    }
    function forSid(sid) { return fl.filter(function (x) { return x.sid === sid; }); }
    function label(it) { return [yr(it.year), it.who].filter(Boolean).join(" · ") || it.id; }
    var real = r.verify && !r.verify.error, blocked = open.length + changed.length;
    var chBox = changed.length ? h("section", { class: "card soft pb-changed", dir: "rtl" },
      h("p", { class: "small" }, h("strong", {}, "⚑ " + fa(changed.length) + " قلم پس از بازبینیِ تاریخی تغییر کرده است. "), "هر کدام را یا دوباره بازبینی کن (فقط همین قلم‌ها به بازبین فرستاده می‌شوند) یا تک‌تک آگاهانه بپذیر."),
      h("ul", { class: "small mv-plist" }, changed.map(function (it) {
        return h("li", { "data-sid": it.id, class: "mv-flagged" }, h("bdi", {}, it.id), " — ", label(it), ": " + (it.move || it.idea || it.q || ""), " ",
          h("button", { class: "btn sm ghost pb-chaccept", onclick: function () { var np; try { np = editorP(); } catch (er) { say(er.message); return; } r.p = np; if (!itemOf(np, it.id)) { say("این قلم در JSON ِ ویرایش‌شده نیست."); return; } okSnap(it.id, np); S.put(r); A.render(); } }, "این تغییر را آگاهانه می‌پذیرم"));
      })),
      r.by === "ai" ? h("button", { class: "btn sm pb-rereview", onclick: function (e) { rereview(e.currentTarget, changed.map(function (x) { return x.id; })); } }, "بازبینیِ دوباره (فقط " + fa(changed.length) + " قلمِ تغییرکرده)") : null) : null;
    return h("section", { class: "card pb-pending", dir: "rtl", "data-rid": r.id }, h("h3", {}, p.title + " · " + (r.by === "ai" ? "تجزیه هوش مصنوعی" : "دستی")), h("p", { class: "small" }, fa(p.stages.length) + " گام · " + fa((p.dead || []).length) + " بن‌بست · " + fa((p.drills || []).length) + " تمرین"),
      real ? h("p", { class: "small mv-vsum " + (open.length ? "bad" : "muted") }, "بازبینِ تاریخی: " + fa(fl.length) + " پرچم، " + fa(open.length) + " هنوز باز.") : null,
      forSid("*").map(flagBox), chBox,
      h("ol", { class: "small mv-plist" }, p.stages.map(function (s) {
        var fs = forSid(s.id);
        return h("li", { class: fs.some(function (x) { return x.state === "open"; }) ? "mv-flagged" : null, "data-sid": s.id }, yrWho(s.year, s.who, " "), ": " + (s.move || ""), A.moveChips ? A.moveChips(p, s, "") : null, fs.map(flagBox));
      })),
      (p.dead || []).some(function (d) { return forSid(d.id).length; }) ? h("div", {}, h("h4", {}, "بن‌بست‌ها"), h("ul", { class: "small mv-plist" }, p.dead.map(function (d) {
        var fs = forSid(d.id); if (!fs.length) return null;
        return h("li", { class: fs.some(function (x) { return x.state === "open"; }) ? "mv-flagged" : null, "data-sid": d.id }, yrWho(d.year, d.who, " "), ": " + (d.idea || ""), fs.map(flagBox));
      }))) : null,
      h("details", {}, h("summary", {}, "ویرایش JSON"), ta), msg,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm mv-approve", disabled: blocked ? true : null, title: blocked ? "تا هر پرچم را اصلاح یا آگاهانه نپذیری و هر قلمِ تغییرکرده را دوباره بازبینی یا آگاهانه نپذیری، تأیید بسته است" : null, onclick: function () {
          var np; try { np = editorP(); } catch (er) { say(er.message); return; }
          var ch = changedItems(r, np), of = openFlags(r);
          if (ch.length || of.length) {
            r.p = np; S.put(r);
            A.toast(ch.length ? fa(ch.length) + " قلم با نسخهٔ بازبینی‌شده فرق دارد؛ دوباره بازبینی کن یا تک‌تک آگاهانه بپذیر." : "هنوز " + fa(of.length) + " پرچمِ باز هست.", "bad"); A.render(); return;
          }
          r.p = np; r.status = "approved"; S.put(r); A.toast("تأیید شد؛ در شبیه‌ساز هست."); A.render();
        } }, "تأیید"),
        h("button", { class: "btn ghost sm", onclick: function () { r.status = "rejected"; S.put(r); A.render(); } }, "رد"),
        r.by === "ai" ? h("button", { class: "btn ghost sm mv-rever", onclick: function (e) { rereview(e.currentTarget, null); } }, "بازبینیِ تاریخیِ دوباره (همه)") : null),
      blocked ? h("p", { class: "small muted" }, "«تأیید» تا وقتی پرچمِ باز یا قلمِ تغییرکردهٔ بازبینی‌نشده هست بسته است. «اصلاحش کردم» فقط وقتی پذیرفته می‌شود که همان قلم در JSON تغییرِ معنادار (نه فقط فاصله) کرده باشد؛ هر ویرایشِ دیگری در JSON پیش از تأیید با نسخهٔ بازبینی‌شده مقایسه می‌شود.") : null);
  }
})(APP);
