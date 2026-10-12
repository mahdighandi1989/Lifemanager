/* ===== شبیه‌ساز مسئله‌های بزرگ: تزریق مسئله و پاسخ، ریزکردن مسیر حل، تمرین از آسان به سخت ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, X = window.EPIX, BT = window.EPI_BT;
  if (!X) return;
  function probs() { return (window.EPI_PROBLEMS || []).concat(S.all("eprob", function (p) { return p.status === "approved"; }).map(function (r) { return r.p; })); }
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
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "مسئله‌های بزرگ حل‌شده", "مسئله‌های مشهوری که سال‌ها حل‌نشده ماندند، همراه پاسخشان. مسیر واقعی حل و بن‌بست‌ها گام‌به‌گام چیده شده تا خودت از آسان به سخت تمرین کنی. اثبات‌های نادرست تاریخی و حل نهایی، نمونه‌های آزمون کارخانه هم هستند.",
      A.V.moves ? h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm mv-golist", onclick: function () { A.go("moves"); } }, "🧗 حرکت‌های حلِ مسئله: یک حرکت را در مسئله‌های مختلف تمرین کن")) : null));
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
    /* پرش به یک گامِ مشخص: A.go("e_prob", pid, "sim:" + stageId) — از «حرکت‌ها» یا برگشت از «گره‌گشا».
       یک‌بار اعمال می‌شود؛ زیرزبانه به «sim» برمی‌گردد تا «گام بعد» دوباره به همان گام پرت نکند. */
    var jump = /^sim:(.+)$/.exec(tab || "");
    if (jump) {
      var ji = -1; p.stages.forEach(function (s, i) { if (s.id === jump[1]) ji = i; });
      if (ji >= 0) { var keepLv = A.simState && A.simState.pid === p.id ? A.simState.lv : 1; A.simState = { pid: p.id, lv: keepLv, order: "hist", i: ji, focus: jump[1] }; }
      tab = "sim"; A.state.sub = "sim";
      if (A.HOST && A.HOST.navigate) { try { A.HOST.navigate({ tab: "e_prob", a: p.id, s: "sim", replace: true }); } catch (e) { } }
    }
    var root = h("div", { class: "page" });
    root.appendChild(A.head(p.field + " — باز از " + fa(p.open || ""), p.title, null, h("div", { class: "row gap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_prob"); } }, "← مسئله‌ها"))));
    root.appendChild(A.tabs([["about", "مسئله و پاسخ"], ["era", "دوره و زمانه"], ["path", "مسیر حل"], ["sim", "شبیه‌ساز"], ["dead", "بن‌بست‌ها (" + fa((p.dead || []).length) + ")"], ["drills", "تمرین‌های هم‌خانواده"], ["lessons", "درس‌ها و ایستگاه‌ها"], ["cases", "پرونده‌های بک‌تست"]], tab, function (k) { A.go("e_prob", pid, k); }));
    var body = h("div", { class: "col gap" }); root.appendChild(body);
    if (tab === "about") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "صورت مسئله"), String(p.statement).split("\n").map(function (x) { return h("p", {}, x); })));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "چرا سال‌ها حل نشد"), h("p", {}, p.why_hard)));
      body.appendChild(h("details", { class: "card" }, h("summary", {}, h("strong", {}, "پاسخ نهایی (پیش از شبیه‌ساز نخوان)")), h("p", {}, p.answer), (p.src || []).length ? h("p", { class: "small muted" }, "منابع: " + p.src.join(" · ")) : null));
    } else if (tab === "path") {
      body.appendChild(h("ol", { class: "timeline" }, p.stages.map(function (s) {
        return h("li", { class: "card" }, h("div", { class: "row between wrap" }, h("strong", {}, fa(s.year || "") + " · " + (s.who || "")), h("span", { class: "chip" }, "دشواری " + fa(s.lvl))),
          h("p", { class: "small" }, s.ctx), h("p", {}, h("strong", {}, "حرکت: "), s.move), h("p", {}, h("strong", {}, "ایده ساده: "), s.idea),
          h("div", { class: "row gap wrap" }, (s.st || []).map(function (x) { return A.stLink(x); }), (s.tech || []).map(function (t) { return A.techLink(t); })),
          A.moveChips ? A.moveChips(p, s, "حرکت‌ها: ") : null);
      })));
    } else if (tab === "era") {
      body.appendChild(era(p));
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
      return h("li", {}, h("strong", {}, yr(s.year) + (s.who ? " · " + s.who : "")), h("p", { class: "small" }, s.ctx || "—"));
    }))));
    return box;
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
    var card = h("section", { class: "card simcard" }), revealed = false, ta = null;
    card.appendChild(h("div", { class: "row between wrap" }, h("span", { class: "eyebrow" }, "گام " + fa(st.i + 1) + " از " + fa(idx.length) + " · " + fa(s0.year || "") + " · " + (s0.who || "")), h("span", { class: "chip" }, "دشواری " + fa(s0.lvl))));
    card.appendChild(h("p", {}, h("strong", {}, "وضع دانش: "), s0.ctx));
    card.appendChild(h("h3", {}, s0.q));
    var area = h("div", { class: "col gap" }); card.appendChild(area);
    function finish(first, self) {
      var L = pg.lv[st.lv]; var prev = L[s0.id];
      L[s0.id] = { first: prev ? prev.first : first, self: self != null ? self : (prev && prev.self), at: new Date().toISOString() }; S.put(pg);
      revealed = true;
      area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده ساده: "), s0.idea), h("div", { class: "row gap wrap" }, (s0.st || []).map(function (x) { return A.stLink(x); })),
        A.moveChips ? A.moveChips(p, s0, "حرکتِ این گام: ") : null));
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
      ta = h("textarea", { rows: 4, placeholder: "حرکت پیشنهادی تو در این لحظه تاریخی، با دلیلش (بی‌نگاه به پاسخ)" }); if (rec && rec.mine) ta.value = rec.mine;
      area.appendChild(ta);
      area.appendChild(h("button", { class: "btn", onclick: function (e) {
        if (ta.value.trim().length < 15) { A.toast("دست‌کم یک جمله کامل بنویس.", "bad"); return; }
        e.target.disabled = true; ta.disabled = true;
        (pg.lv[st.lv] = pg.lv[st.lv] || {}); var keep = pg.lv[st.lv][s0.id]; pg.lv[st.lv][s0.id] = keep || {}; pg.lv[st.lv][s0.id].mine = ta.value; if (!keep) delete pg.lv[st.lv][s0.id];
        if (st.lv === 3) options(true);
        else {
          revealed = true;
          area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده: "), s0.idea), h("p", { class: "small" }, h("strong", {}, "گزینه‌هایی که آن زمان مطرح بود: "), s0.opts.map(function (o) { return (o.ok ? "✓ " : "✗ ") + o.t; }).join(" · ")),
            A.moveChips ? A.moveChips(p, s0, "حرکتِ این گام: ") : null));
          area.appendChild(h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "حرکت تو چقدر با حرکت واقعی (یا معادل معتبرش) می‌خواند؟"), [0, 1, 2].map(function (v) { return h("button", { class: "btn ghost sm", onclick: function () { area.lastChild.remove(); finishMaster(v); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]); })));
        }
      } }, st.lv === 3 ? "ثبت و دیدن گزینه‌ها" : "ثبت و مقایسه با حرکت واقعی"));
    }
    function finishMaster(v) { var L = pg.lv[st.lv]; L[s0.id] = { first: v === 2, self: v, mine: (L[s0.id] && L[s0.id].mine) || "", at: new Date().toISOString() }; S.put(pg); area.appendChild(h("button", { class: "btn", onclick: function () { st.i++; A.render(); } }, st.i + 1 < idx.length ? "گام بعد" : "پایان سطح")); }
    /* «🪢 این‌جا گیر کردم» ⇒ یک موقعیتِ عادیِ گره‌گشا (a19 ⇒ A.probStuck؛ فقط اگر a16 بار شده) */
    if (A.probStuck) { var sb = A.probStuck(p, s0, si, function () { return { revealed: revealed, mine: (ta && ta.value) || (rec && rec.mine) || "" }; }); if (sb) card.appendChild(sb); }
    box.appendChild(card);
    return box;
  }

  /* ---------- تزریق مسئله تازه (هوش مصنوعی فقط تجزیه‌گر؛ با تأیید شما) ---------- */
  function validP(o) {
    if (!o || !o.title || !Array.isArray(o.stages) || !o.stages.length) throw new Error("ساختار مسئله ناقص است");
    var MV = A.MOVE_IDS || [];  // فهرستِ ثابتِ حرکت‌ها (a19)؛ شناسهٔ ناشناخته دور ریخته می‌شود
    o.stages.forEach(function (s, i) {
      s.id = s.id || "n" + (i + 1); s.opts = (s.opts || []).filter(function (x) { return x && x.t; }); if (!s.opts.some(function (x) { return x.ok; })) throw new Error("گام " + (i + 1) + " گزینه درست ندارد"); s.st = (s.st || []).filter(function (x) { return window.EPI_PIPE.indexOf(x) >= 0; }); s.lvl = Math.max(1, Math.min(5, +s.lvl || 3));
      var mv = (typeof s.mv === "string" ? [s.mv] : Array.isArray(s.mv) ? s.mv : []).filter(function (x, j, a) { return MV.indexOf(x) >= 0 && a.indexOf(x) === j; }).slice(0, 2);
      if (mv.length) s.mv = mv; else delete s.mv;
    });
    o.dead = o.dead || []; o.dead.forEach(function (d, i) { d.id = d.id || "d" + (i + 1); });
    o.lessons = o.lessons || []; o.drills = (o.drills || []).filter(function (d) { return d && d.opts && d.opts.length && d.a >= 0 && d.a < d.opts.length; }); o.cases = [];
    if (o.era && typeof o.era === "object") {
      var e = {}; ["known", "assumed", "tools"].forEach(function (k) { var v = o.era[k]; if (Array.isArray(v)) v = v.filter(Boolean).map(String); else v = v == null ? "" : String(v).trim(); if (Array.isArray(v) ? v.length : v) e[k] = v; });
      if (Object.keys(e).length) o.era = e; else delete o.era;
    } else delete o.era;
    return o;
  }
  A.probValid = validP;

  /* ---------- بازبینِ تاریخی: فراخوانیِ دومِ مستقل روی خروجیِ تجزیه‌گر ----------
     هر گام/بن‌بستی که ادعای تاریخیِ نامطمئن یا بی‌پشتوانه دارد پرچم می‌خورد؛ تا مالک هر پرچم را «اصلاح» (تغییرِ واقعیِ همان قلم
     در JSON) یا آگاهانه «بپذیرد»، دکمهٔ تأیید بسته است. هوش مصنوعی داور نیست — فقط پرچم پیشنهاد می‌کند. */
  A.PROB_VERIFY_SYS = "تو «بازبینِ تاریخی» هستی و مستقل از سازندهٔ این تجزیه کار می‌کنی. ورودی: (۱) تجزیهٔ JSON ِ مسیرِ تاریخیِ حلِ یک مسئله که هوش مصنوعیِ دیگری ساخته است، (۲) منابعی که کاربر داده است.\n" +
    "برای هر گام (stages) و هر بن‌بست (dead) با همان شناسهٔ id، ادعاهای تاریخی‌اش را بسنج: تاریخ‌ها، نامِ اشخاص، نسبت‌دادنِ کار یا ایده به اشخاص، رویدادها و عنوانِ آثار.\n" +
    "اگر ادعایی با منابعِ کاربر یا دانشِ تاریخیِ مستقر پشتیبانی نمی‌شود، نادرست است، یا مطمئن نیستی، ok=false بده و در issue دقیق بنویس کدام ادعا و چرا (نادرست / نامطمئن / بی‌منبع). فقط وقتی همهٔ ادعاهای آن قلم را با اطمینان درست می‌دانی ok=true و issue خالی.\n" +
    "چیزی را فقط چون محتمل به نظر می‌رسد درست فرض نکن. متنِ جایگزین ننویس. دربارهٔ ارزشِ آموزشی یا گزینه‌ها داوری نکن؛ فقط درستیِ تاریخی.\n" +
    "خروجی فقط یک آرایهٔ JSON معتبر، بی هیچ متنِ دیگر، با یک قلم برای هر گام و هر بن‌بست: [{\"sid\":\"n1\",\"ok\":true,\"issue\":\"\"}]";
  function itemOf(p, sid) { var all = (p.stages || []).concat(p.dead || []); for (var i = 0; i < all.length; i++) if (all[i].id === sid) return all[i]; return null; }
  function snapOf(p, sid) { var it = itemOf(p, sid); return it ? JSON.stringify(it) : null; }
  function verify(r, srcText) {
    var p = r.p;
    return Promise.resolve().then(function () {
      return A.callAI(A.PROB_VERIFY_SYS, "منابعِ کاربر:\n" + (srcText || (p.src || []).join("\n") || "—") + "\n\nتجزیه:\n" + JSON.stringify({ title: p.title, field: p.field, open: p.open, era: p.era || null, stages: p.stages, dead: p.dead }));
    }).then(function (txt) {
      var arr = A.parseJSONLoose(txt); if (arr && !Array.isArray(arr)) arr = arr.items || arr.verdicts || null;
      if (!Array.isArray(arr)) throw new Error("پاسخِ بازبین آرایه نبود");
      var old = (r.verify && r.verify.flags) || [], flags = [], got = {};
      function keep(f) { var o = old.filter(function (x) { return x.sid === f.sid && x.snap === f.snap && x.state === "accepted"; })[0]; if (o) { f.state = "accepted"; f.decided = o.decided; } return f; }
      arr.forEach(function (v) {
        if (!v) return; var sid = String(v.sid || v.id || "").trim(); got[sid] = 1;
        if (v.ok === true) return;
        var known = !!itemOf(p, sid);
        flags.push(keep({ sid: known ? sid : "*", issue: String(v.issue || "بازبین بی‌توضیح پرچم زد.").trim() + (known || !sid ? "" : " (شناسهٔ «" + sid + "» در تجزیه نیست)"), state: "open", snap: known ? snapOf(p, sid) : null }));
      });
      (p.stages || []).concat(p.dead || []).forEach(function (it) { if (!got[it.id]) flags.push(keep({ sid: it.id, issue: "بازبین دربارهٔ این قلم حکمی نداد؛ درستیِ تاریخی‌اش سنجیده نشده است.", state: "open", snap: JSON.stringify(it) })); });
      r.verify = { at: new Date().toISOString(), n: arr.length, flags: flags };
    }, function (err) {
      var m = (err && err.message) || String(err);
      r.verify = { at: new Date().toISOString(), error: m, flags: [{ sid: "*", issue: "بازبینِ تاریخی اجرا نشد (" + m + "). یا دوباره اجرایش کن یا آگاهانه بی‌بازبینی بپذیر.", state: "open", snap: null }] };
    }).then(function () { S.put(r); return r; });
  }
  A.probVerify = verify;
  /* پرچم‌های یک رکوردِ در انتظار؛ تجزیهٔ هوش مصنوعیِ بی‌بازبینی (مثلاً رکوردهای قدیمی) خودش یک پرچمِ باز است */
  function flagsOf(r) {
    if (r.verify && r.verify.flags) return r.verify.flags;
    if (r.by === "ai") return [{ sid: "*", issue: "بازبینِ تاریخی روی این تجزیه اجرا نشده است.", state: "open", snap: null, synthetic: true }];
    return [];
  }
  function openFlags(r) { return flagsOf(r).filter(function (f) { return f.state === "open"; }); }
  A.probOpenFlags = openFlags;

  function inject() {
    var f = { title: "", field: "", open: "", statement: "", answer: "", src: "", notes: "" };
    function inp(lbl, k, ta, ph) { var id = "pbIn_" + k; var el = ta ? h("textarea", { id: id, rows: ta, placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }) : h("input", { id: id, type: "text", placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }); return h("div", {}, h("label", { for: id }, lbl), el); }
    var jsonTa = h("textarea", { rows: 6, class: "mono", placeholder: "یا JSON کامل مسئله را طبق طرح بچسبان" });
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
            var o = validP(A.parseJSONLoose(txt)); o.src = o.src && o.src.length ? o.src : f.src.split(/\n|\|/).map(function (x) { return x.trim(); }).filter(Boolean);
            var r = store(o, "ai"); b.textContent = "در حال بازبینیِ تاریخی…";
            return verify(r, f.src).then(function (r2) {
              var n = openFlags(r2).length; out.innerHTML = "";
              out.appendChild(h("p", {}, "مسئله در صف تأیید است. " + (r2.verify.error ? "بازبینِ تاریخی اجرا نشد؛ در «در انتظار تأیید» دوباره اجرایش کن." : n ? "بازبینِ تاریخی " + fa(n) + " قلم را پرچم زد؛ در «در انتظار تأیید» هر کدام را اصلاح یا آگاهانه بپذیر." : "بازبینِ تاریخی پرچمی نزد؛ باز هم پیش از تأیید خودت گام‌ها را بسنج.")));
            });
          })
          .catch(function (err) { A.toast(err.message || String(err), "bad"); })
          .then(function () { b.disabled = false; b.textContent = "تجزیه با هوش مصنوعی"; });
      } }, "تجزیه با هوش مصنوعی"), h("button", { class: "btn ghost", onclick: function () { try { store(validP(JSON.parse(jsonTa.value)), "user"); } catch (er) { A.toast(er.message, "bad"); } } }, "ثبت JSON دستی")),
      jsonTa, out);
  }
  function pending() {
    var arr = S.all("eprob", function (p) { return p.status === "pending"; });
    if (!arr.length) return A.empty("مسئله‌ای در انتظار نیست.");
    return h("div", { class: "col gap" }, arr.map(function (r) {
      var p = r.p, ta = h("textarea", { rows: 10, class: "mono", "aria-label": "JSON ِ مسئله" }); ta.value = JSON.stringify(p, null, 1);
      var fl = flagsOf(r), open = fl.filter(function (x) { return x.state === "open"; });
      function decide(fx, how) {
        if (how === "fixed") {
          var np; try { np = validP(JSON.parse(ta.value)); } catch (er) { A.toast(er.message, "bad"); return; }
          var now = snapOf(np, fx.sid);
          if (!now) { A.toast("این قلم در JSON ِ ویرایش‌شده پیدا نشد.", "bad"); return; }
          if (now === fx.snap) { A.toast("این قلم در JSON تغییری نکرده؛ اول همان‌جا اصلاحش کن، یا آگاهانه بپذیر.", "bad"); var d = ta.closest("details"); if (d) d.open = true; ta.focus(); return; }
          np.id = p.id; r.p = np;
        }
        if (fx.synthetic) { delete fx.synthetic; r.verify = { at: new Date().toISOString(), flags: [fx] }; }
        fx.state = how; fx.decided = new Date().toISOString(); S.put(r); A.render();
      }
      function flagBox(fx) {
        return h("div", { class: "mv-flag " + fx.state },
          h("p", { class: "small" }, h("strong", {}, fx.state === "open" ? "⚑ پرچمِ بازبینِ تاریخی: " : fx.state === "accepted" ? "✓ آگاهانه پذیرفته شد: " : "✓ اصلاح شد: "), fx.issue),
          fx.state === "open" ? h("div", { class: "row gap wrap" },
            fx.sid !== "*" ? h("button", { class: "btn sm ghost mv-fix", onclick: function () { decide(fx, "fixed"); } }, "اصلاحش کردم (در JSON)") : null,
            h("button", { class: "btn sm ghost mv-accept", onclick: function () { decide(fx, "accepted"); } }, fx.sid === "*" ? "آگاهانه می‌پذیرم" : "با وجودِ این، آگاهانه می‌پذیرم")) : null);
      }
      function forSid(sid) { return fl.filter(function (x) { return x.sid === sid; }); }
      var real = r.verify && !r.verify.error;
      return h("section", { class: "card", dir: "rtl" }, h("h3", {}, p.title + " · " + (r.by === "ai" ? "تجزیه هوش مصنوعی" : "دستی")), h("p", { class: "small" }, fa(p.stages.length) + " گام · " + fa(p.dead.length) + " بن‌بست · " + fa(p.drills.length) + " تمرین"),
        real ? h("p", { class: "small mv-vsum " + (open.length ? "bad" : "muted") }, "بازبینِ تاریخی: " + fa(fl.length) + " پرچم، " + fa(open.length) + " هنوز باز.") : null,
        forSid("*").map(flagBox),
        h("ol", { class: "small mv-plist" }, p.stages.map(function (s) {
          var fs = forSid(s.id);
          return h("li", { class: fs.some(function (x) { return x.state === "open"; }) ? "mv-flagged" : null, "data-sid": s.id }, fa(s.year || "") + " " + (s.who || "") + ": " + s.move, A.moveChips ? A.moveChips(p, s, "") : null, fs.map(flagBox));
        })),
        (p.dead || []).some(function (d) { return forSid(d.id).length; }) ? h("div", {}, h("h4", {}, "بن‌بست‌ها"), h("ul", { class: "small mv-plist" }, p.dead.map(function (d) {
          var fs = forSid(d.id); if (!fs.length) return null;
          return h("li", { class: fs.some(function (x) { return x.state === "open"; }) ? "mv-flagged" : null, "data-sid": d.id }, fa(d.year || "") + " " + (d.who || "") + ": " + (d.idea || ""), fs.map(flagBox));
        }))) : null,
        h("details", {}, h("summary", {}, "ویرایش JSON"), ta),
        h("div", { class: "row gap wrap" }, h("button", { class: "btn sm mv-approve", disabled: open.length ? true : null, title: open.length ? "تا هر پرچم را اصلاح یا آگاهانه نپذیری، تأیید بسته است" : null, onclick: function () {
            if (openFlags(r).length) { A.toast("هنوز " + fa(openFlags(r).length) + " پرچمِ باز هست.", "bad"); return; }
            try { r.p = validP(JSON.parse(ta.value)); r.p.id = p.id; r.status = "approved"; S.put(r); A.toast("تأیید شد؛ در شبیه‌ساز هست."); A.render(); } catch (er) { A.toast(er.message, "bad"); } } }, "تأیید"),
          h("button", { class: "btn ghost sm", onclick: function () { r.status = "rejected"; S.put(r); A.render(); } }, "رد"),
          r.by === "ai" ? h("button", { class: "btn ghost sm mv-rever", onclick: function (e) {
            var np; try { np = validP(JSON.parse(ta.value)); } catch (er) { A.toast(er.message, "bad"); return; }
            np.id = p.id; r.p = np; e.target.disabled = true; e.target.textContent = "در حال بازبینی…";
            verify(r, (np.src || []).join("\n")).then(function () { A.render(); });
          } }, "بازبینیِ تاریخیِ دوباره") : null),
        open.length ? h("p", { class: "small muted" }, "«تأیید» تا وقتی پرچمِ باز هست بسته است. «اصلاحش کردم» فقط وقتی پذیرفته می‌شود که همان قلم در JSON واقعاً تغییر کرده باشد.") : null);
    }));
  }
})(APP);
