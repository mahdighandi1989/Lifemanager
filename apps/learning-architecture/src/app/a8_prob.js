/* ===== شبیه‌ساز مسئله‌های بزرگ: تزریق مسئله و پاسخ، ریزکردن مسیر حل، تمرین از آسان به سخت ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, X = window.EPIX, BT = window.EPI_BT;
  if (!X) return;
  /* رکوردهای تأییدشدهٔ کاربر فقط اگر هنوز از validP رد شوند وارد فهرست/شبیه‌ساز/حرکت‌ها می‌شوند؛ رکوردِ خراب جدا نشان داده می‌شود
     (کارتِ «رکوردِ خراب» با دکمهٔ رد) تا یک رکوردِ بد هرگز کلِ فهرست را نشکند. */
  function approvedRecs() { return S.all("eprob", function (r) { return r && r.status === "approved"; }); }
  function recErr(r) { if (!r || !r.p) return "رکورد خالی است."; try { validP(JSON.parse(JSON.stringify(r.p))); return null; } catch (e) { return (e && e.message) || String(e); } }
  /* مسئله‌ها را مالک می‌دهد (۲۰۲۶-۱۰-۱۳): فهرست، شبیه‌ساز و «حرکت‌ها» از مسئله‌های تأییدشدهٔ خودِ او پر می‌شوند؛ ۱۳ مسئلهٔ آمادهٔ
     سازنده فقط با «نمونه‌های آمادهٔ سازنده» (A.showSamples). getP همه را می‌یابد تا پیوندهای قدیمی (موقعیتی که از گامِ یک نمونه
     ساخته شده) نشکنند؛ بک‌تستِ کارخانه هم مستقیم از EPI_PROBLEMS می‌خواند و دست نمی‌خورد. */
  function samplesOn() { return !!(A.showSamples && A.showSamples()); }
  function mineP() { return approvedRecs().filter(function (r) { return !recErr(r); }).map(function (r) { return r.p; }); }
  function sampleP() { return window.EPI_PROBLEMS || []; }
  function probs() { return mineP().concat(samplesOn() ? sampleP() : []); }
  function allP() { return mineP().concat(sampleP()); }
  A.probsMine = mineP; A.probIsSample = function (p) { return sampleP().indexOf(p) >= 0; };
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
  function getP(id) { return allP().filter(function (p) { return p.id === id; })[0]; }
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
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "مسئله‌های بزرگ حل‌شده", "مسئلهٔ سختی را که سال‌ها حل‌نشده ماند (یا مسئله‌ای که خودت در آن گیر کردی) همراهِ پاسخِ نهایی‌اش وارد کن. هوش مصنوعی مسیرِ حل را گام‌به‌گام با گزینه‌ها و بن‌بست‌ها می‌شکند، سه حل‌کنندهٔ مستقل گزینه‌های درست را وارسی می‌کنند، تو تأیید می‌کنی؛ بعد از سخت به آسان تمرین می‌کنی و مسئله‌های هم‌ساختارِ تازه می‌سازی.",
      A.V.moves ? h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm mv-golist", onclick: function () { A.go("moves"); } }, "🧗 حرکت‌های حلِ مسئله: یک حرکت را در مسئله‌های مختلف تمرین کن")) : null));
    root.appendChild(A.tabs([["list", "مسئله‌های من"], ["inject", "افزودنِ مسئلهٔ تو"], ["pending", "در انتظار تأیید (" + fa(S.all("eprob", function (p) { return p.status === "pending"; }).length) + ")"]], tab || "list", function (k) { A.go("e_prob", null, k); }));
    if (tab === "inject") { root.appendChild(inject()); return root; }
    if (tab === "pending") { root.appendChild(pending()); return root; }
    var mine = mineP();
    if (!mine.length) root.appendChild(h("section", { class: "card pb-empty", dir: "rtl" }, h("h2", {}, "هنوز مسئله‌ای وارد نکرده‌ای"),
      h("p", {}, "مسئله‌ها را تو می‌آوری: صورتِ مسئله و پاسخی که سرانجام به دست آمد (از هر علمی). سیستم مسیرِ حل را ریز می‌کند و شبیه‌سازش را می‌سازد."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn pb-goinject", onclick: function () { A.go("e_prob", null, "inject"); } }, "افزودنِ مسئلهٔ تو"),
        A.V.kcases ? h("button", { class: "btn ghost", onclick: function () { A.go("kcases"); } }, "🪢 مسئله‌ای که در آن گیر کردم (گره‌گشا)") : null)));
    function card(p) {
      try {
        var pg = prog(p.id), n = p.stages.length, best = 0; for (var l = 1; l <= 4; l++) if (lvStats(pg, l, n).done >= n) best = l;
        return h("div", { class: "card" + (A.probIsSample(p) ? " pb-sample" : "") }, h("div", { class: "row between wrap" }, h("button", { class: "linkish", onclick: function () { A.go("e_prob", p.id); } }, h("strong", {}, p.title)), h("span", { class: "row gap" }, p.origin && p.origin.type === "kcase" ? h("span", { class: "chip pb-own" }, "از گره‌گشا") : null, A.probIsSample(p) ? h("span", { class: "chip" }, "نمونهٔ آمادهٔ سازنده") : null, p.unverified ? h("span", { class: "chip pb-unver" }, "دستی · وارسی‌نشده") : null, h("span", { class: "chip" }, p.field))),
          h("p", { class: "small" }, String(p.statement).split("\n")[0].slice(0, 260)), h("div", { class: "small muted" }, "باز از " + fa(p.open || "") + " · " + fa(n) + " گام · " + fa((p.dead || []).length) + " بن‌بست · " + fa((p.drills || []).length) + " تمرین · بالاترین سطح کامل‌شده: " + (best ? LV[best].fa : "—")));
      } catch (e) { console.warn(e); var rr = S.get("eprob_" + (p && p.id)); return brokenCard(rr || { p: p }, (e && e.message) || String(e)); }
    }
    root.appendChild(h("div", { class: "col gap" }, mine.map(card), brokenRecs().map(function (x) { return brokenCard(x.r, x.err); })));
    if (samplesOn()) root.appendChild(h("details", { class: "card soft pb-samples", dir: "rtl", open: true }, h("summary", {}, "نمونه‌های آمادهٔ سازنده (" + fa(sampleP().length) + " مسئله — سازنده نوشته، نه تو)"),
      h("div", { class: "col gap" }, sampleP().map(card))));
    else if (A.samplesNote) root.appendChild(A.samplesNote("«" + fa(sampleP().length) + " مسئلهٔ آماده»ای که سازنده نوشته"));
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
    var own = p.origin && p.origin.type === "kcase", okc = own ? S.get(p.origin.id) : null;
    root.appendChild(A.head(p.field + (p.open ? " — باز از " + fa(p.open) : ""), p.title, null, h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_prob"); } }, "← مسئله‌ها"),
      okc ? h("button", { class: "btn ghost sm pb-tocase", onclick: function () { A.go("kcase", okc.id, okc.step || "in"); } }, "🪢 برگشت به موقعیتِ گره‌گشا") : null,
      A.probIsSample(p) ? h("span", { class: "chip" }, "نمونهٔ آمادهٔ سازنده") : null)));
    var nSim = A.pbItemsOf ? A.pbItemsOf(p.id).filter(function (x) { return !x.bad; }).length : 0;
    var TABS = [["about", "مسئله و پاسخ"], ["era", "دوره و زمانه"], ["path", "مسیر حل"], ["sim", "شبیه‌ساز"], ["similar", "مسئله‌های هم‌ساختار" + (nSim ? " (" + fa(nSim) + ")" : "")], ["dead", "بن‌بست‌ها (" + fa((p.dead || []).length) + ")"], ["drills", "تمرین‌های هم‌خانواده"], ["lessons", "درس‌ها و ایستگاه‌ها"], ["cases", "پرونده‌های بک‌تست"]];
    if (own) TABS = TABS.filter(function (t) { return t[0] !== "era" && t[0] !== "cases"; });   // مسئلهٔ شخصی دوره و پروندهٔ بک‌تست ندارد
    root.appendChild(A.tabs(TABS, tab, function (k) { A.go("e_prob", pid, k); }));
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
    if (tab === "similar") { body.appendChild(A.pbSimilarPanel ? A.pbSimilarPanel(p) : A.empty("این بخش در این نسخه بارگذاری نشده.")); return; }
    if (tab === "about") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "صورت مسئله"), String(p.statement).split("\n").map(function (x) { return h("p", {}, x); })));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, p.origin && p.origin.type === "kcase" ? "چرا گیرانداز است" : "چرا سال‌ها حل نشد"), h("p", {}, p.why_hard)));
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
    var own = !!(p.origin && p.origin.type === "kcase");   // مسئلهٔ شخصی ⇒ بی واژگانِ «تاریخی» (ممیزی ۲۰۲۶-۱۰-۱۳)
    var pg = prog(p.id), n = p.stages.length;
    var st = A.simState && A.simState.pid === p.id ? A.simState : (A.simState = { pid: p.id, lv: 1, order: "hist", i: 0 });
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card" }, h("div", { class: "row gap wrap" },
      [1, 2, 3, 4].map(function (l) { var u = unlocked(pg, l, n), s = lvStats(pg, l, n); return h("button", { class: "btn sm " + (st.lv === l ? "" : "ghost"), disabled: !u, title: u ? LV[l].d : "قفل: سطح قبل را با دست‌کم ۸۰٪ درست تمام کن", onclick: function () { st.lv = l; st.i = 0; A.render(); } }, LV[l].fa + " — " + fa(s.done) + " از " + fa(n) + " گام" + (s.done ? "، " + fa(Math.round(100 * s.pct)) + "٪ درست" : "")); })),
      h("div", { class: "row gap wrap mt" }, h("label", { class: "small", for: "smOrd" }, "ترتیب گام‌ها:"), h("select", { id: "smOrd", onchange: function (e) { st.order = e.target.value; st.i = 0; A.render(); } }, [["hist", own ? "ترتیبِ راه‌حل" : "تاریخی (همان‌طور که رخ داد)"], ["e2h", "از آسان به سخت"], ["h2e", "از سخت به آسان"]].map(function (o) { return h("option", { value: o[0], selected: st.order === o[0] }, o[1]); })),
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
        area.insertBefore(h("div", { class: "small " + (o.ok ? "good" : "bad") }, (o.ok ? "درست" : "نه") + (o.why ? ": " + o.why : ".") + (o.hist ? " — " + o.hist : "")), opts.nextSibling);
        if (o.ok) { Array.prototype.forEach.call(opts.children, function (b) { b.disabled = true; }); finish(firstTry && tried === 1); }
      } }, o.t); }));
      area.appendChild(opts);
    }
    if (rec) area.appendChild(h("p", { class: "small muted" }, "این گام را پیش‌تر در این سطح زده‌ای (" + (rec.first ? "بار اول درست" : rec.self === 2 ? "خودارزیابی کامل" : "بار اول نادرست") + "). تکرار، نمره بار اول را عوض نمی‌کند."));
    if (st.lv === 1) { card.insertBefore(h("p", { class: "small hint" }, "سرنخ: " + (s0.hint || "—")), area); options(true); }
    else if (st.lv === 2) { var hb = h("button", { class: "btn ghost sm", onclick: function () { hb.replaceWith(h("p", { class: "small hint" }, "سرنخ: " + (s0.hint || "—"))); used = true; } }, "سرنخ (بار اول را نادرست حساب می‌کند)"); var used = false; area.appendChild(hb); var o2 = options; o2(true); var _f = finish; finish = function (first, self) { _f(first && !used, self); }; }
    else {
      ta = h("textarea", { id: "pbMine", rows: 4, "aria-describedby": "pbMineHint", placeholder: own ? "حرکتِ پیشنهادیِ تو در این مرحله، با دلیلش (بی‌نگاه به پاسخ)" : "حرکت پیشنهادی تو در این لحظه تاریخی، با دلیلش (بی‌نگاه به پاسخ)" }); if (rec && rec.mine) ta.value = rec.mine;
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
          area.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکت واقعی: "), s0.move), h("p", {}, h("strong", {}, "ایده: "), s0.idea), h("p", { class: "small" }, h("strong", {}, (own ? "گزینه‌ها: " : "گزینه‌هایی که آن زمان مطرح بود: ")), A.shuffle(s0.opts.slice()).map(function (o) { return (o.ok ? "✓ " : "✗ ") + o.t; }).join(" · ")),
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
  /* مسئلهٔ کمینه از فیلدهای فرم (وقتی هوش در دسترس نیست): یک گامِ پاسخِ نهایی + نشانِ «وارسی‌نشده»؛ هیچ گامی حدس زده نمی‌شود. */
  A.probMinimal = function (f) {
    var t = function (k) { return String(f[k] || "").trim(); }, ans = t("answer");
    return { title: t("title"), field: t("field") || "—", open: t("open"), statement: t("statement"), answer: ans,
      why_hard: "(ثبتِ دستی بی هوش مصنوعی — هنوز نوشته نشده)", unverified: true,
      stages: [{ id: "n1", q: "پاسخِ نهاییِ این مسئله کدام است؟", ctx: "پیش‌نویسِ دستی: گام‌های تصمیم هنوز نوشته نشده‌اند.", opts: [{ t: ans.slice(0, 300), ok: true }, { t: "هنوز نمی‌دانم — باید گام‌ها را خودم بنویسم", ok: false }] }],
      dead: [], drills: [], lessons: [], src: t("src").split(/\n|\|/).map(function (x) { return x.trim(); }).filter(Boolean), notes: t("notes") };
  };
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
      return A.callAI(A.PROB_VERIFY_SYS, "منابعِ کاربر:\n" + (srcText || (p.src || []).join("\n") || "—") + "\n\nتجزیه:\n" + JSON.stringify({ title: p.title, field: p.field, open: p.open, era: p.era || null, stages: send.stages, dead: send.dead }), { maxTokens: 4000 });
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
    if (r.by !== "ai" || r.personal) return [];   // مسئلهٔ شخصی بازبینِ تاریخی ندارد؛ درستیِ پاسخ‌ها را «وارسیِ پاسخ‌ها» می‌پاید
    var v = r.verify || {}, sn = v.snaps || {}, ok = v.okSnaps || {};
    return allItems(p).filter(function (it) { var c = canon(it); return sn[it.id] !== c && ok[it.id] !== c; });
  }
  A.probChanged = changedItems;
  /* رکوردِ قدیمی که پیش از «عکسِ بازبینی» بازبینی شده: یک‌بار همان نسخهٔ ذخیره‌شده عکسِ پایه می‌شود */
  function migrate(r) {
    if (r.by === "ai" && r.verify && !r.verify.error && !r.verify.snaps && r.p) { var sn = {}; allItems(r.p).forEach(function (it) { sn[it.id] = canon(it); }); r.verify.snaps = sn; r.verify.okSnaps = r.verify.okSnaps || {}; S.put(r); }
  }

  /* ---------- وارسیِ پاسخ‌ها: سه حلِ مستقل روی گزینهٔ «درست» ِ هر گام و هر تمرین ----------
     مالک (۲۰۲۶-۱۰-۱۳): «وارسیِ جوابِ نمونه‌هایی که هوش مصنوعی از مسئلهٔ من می‌سازد باید بماند … وگرنه ممکن است با جوابِ غلط تمرین کنم».
     همان سه دستورِ متفاوتِ گره‌گشا (A.KSOLVERS) هر کدام جداگانه صورت و پاسخِ نهاییِ مسئله را می‌بینند، ولی نه برچسبِ «درست» ِ گزینه‌ها را؛
     گزینه‌ها برای هر حل‌کننده با ترتیبی دیگر و شناسهٔ حرفی فرستاده می‌شوند. قلمی که هر سه همان گزینهٔ «درست» را برنگزینند، یا دست‌کم
     یکی «بیش از یک پاسخِ قابلِ‌دفاع» ببیند، پرچم می‌خورد؛ تا اصلاح و وارسیِ دوباره یا پذیرشِ آگاهانه، «تأیید» بسته است.
     هوش مصنوعی داور نیست — فقط پرچم می‌زند؛ تصمیم با مالک است. */
  var CHECK_SOLVERS = [
    "تو حل‌کنندهٔ دقیقی هستی. هر پرسش را مستقل و گام‌به‌گام بسنج.",
    "تو منتقدِ بدبینی هستی: اول دنبالِ ابهام، دو پاسخِ قابلِ‌دفاع یا ایراد در صورت بگرد، سپس پاسخ بده.",
    "هر پرسش را از راهی متفاوت بسنج (مثلاً از پاسخِ نهایی به عقب، یا با ردِ گزینه‌ها یکی‌یکی) و پاسخت را یک بار وارسی کن."
  ];
  var LET = "abcdefgh";
  A.PROB_CHECK_TAIL = "\nخروجی فقط یک آرایهٔ JSON، یک قلم برای هر پرسش و بی هیچ متنِ دیگر: [{\"id\":\"…\",\"pick\":\"a\",\"multi\":false,\"why\":\"…\"}]. pick = شناسهٔ حرفیِ گزینه‌ای که درست می‌دانی. multi=true یعنی بیش از یک گزینه قابلِ‌دفاع است یا پرسش مبهم است.";
  function hashS(s) { var x = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x; }
  function permOf(n, seed) { var a = [], x = (seed >>> 0) || 1; for (var i = 0; i < n; i++) a.push(i); for (var j = n - 1; j > 0; j--) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; var k = x % (j + 1), t = a[j]; a[j] = a[k]; a[k] = t; } return a; }
  function checkItems(p) {
    var out = [];
    (p.stages || []).forEach(function (s) {
      if (!s || !Array.isArray(s.opts)) return; var ok = -1;
      s.opts.forEach(function (o, i) { if (o && o.ok === true) ok = i; });
      out.push({ id: s.id, kind: "stage", ctx: s.ctx || "", q: s.q || "", opts: s.opts.map(function (o) { return String((o && o.t) || ""); }), ok: ok,
        obj: { ctx: s.ctx || "", q: s.q || "", opts: s.opts.map(function (o) { return { t: String((o && o.t) || ""), ok: !!(o && o.ok) }; }) } });   // فقط آنچه درستیِ پاسخ را می‌سازد (سال/شخص نه)
    });
    (p.drills || []).forEach(function (d, i) {
      if (!d || !Array.isArray(d.opts)) return;
      out.push({ id: "drill" + (i + 1), kind: "drill", ctx: "", q: d.q || "", opts: d.opts.map(String), ok: d.a, obj: { q: d.q || "", opts: d.opts.map(String), a: d.a } });
    });
    return out;
  }
  A.probCheckItems = checkItems;
  function checkPrompt(p, items, si, names) {
    var strip = names && names.length && A.kstripNames ? function (x) { return A.kstripNames(x, names); } : function (x) { return x; };
    var L = ["مسئله: " + p.title, "صورتِ مسئله: " + p.statement, "پاسخِ نهاییِ مسئله (معلوم است): " + p.answer, "",
      "برای هر پرسشِ زیر گزینه‌ای را برگزین که درست است. پرسش‌های «گام»: با توجه به «وضع تا این لحظه»، کدام حرکت درست است و به همان پاسخِ نهایی می‌رسد. پرسش‌های «تمرین»: پاسخِ درستِ خودِ پرسش.", ""];
    items.forEach(function (it) {
      var ord = permOf(it.opts.length, hashS(it.id + "|" + si));
      L.push("[" + it.id + "] " + (it.kind === "stage" ? "گام" : "تمرین") + (it.ctx ? "\nوضع تا این لحظه: " + it.ctx : "") + "\nپرسش: " + it.q);
      ord.forEach(function (oi, k) { L.push(LET.charAt(k) + ") " + it.opts[oi]); });
      L.push("");
    });
    return strip(L.join("\n"));
  }
  /* پاسخِ حل‌کننده‌ها: اول JSON ِ کامل؛ اگر نشد، تک‌تکِ اشیاء — اجرای واقعی (۲۰۲۶-۱۰-۱۳) نشان داد مدل گاهی می‌نویسد
     {"drill:2", "pick": …} (کلیدِ "id" جا می‌افتد) و همین یک خطا کلِ پاسخِ آن حل‌کننده را باطل می‌کرد. */
  function parseAnswers(t) {
    var arr = null;
    try { arr = A.parseJSONLoose(t); } catch (e) { arr = null; }
    if (arr && !Array.isArray(arr)) arr = arr.items || arr.answers || null;
    if (Array.isArray(arr)) return arr;
    var out = [];
    (String(t || "").match(/\{[^{}]*\}/g) || []).forEach(function (m) {
      var fixed = m.replace(/^\{\s*"([^"]+)"\s*,/, function (all, k) { return k === "id" ? all : '{"id":"' + k + '",'; });
      try { var o = JSON.parse(fixed); if (o && o.id != null) out.push(o); } catch (e) { }
    });
    return out.length ? out : null;
  }
  A.probParseAnswers = parseAnswers;
  function checkAnswers(r) {
    var p = r.p, items = checkItems(p).filter(function (it) { return it.opts.length >= 2 && it.opts.length <= LET.length; });
    var SOL = (A.KSOLVERS && A.KSOLVERS.length >= 3) ? A.KSOLVERS : CHECK_SOLVERS, runs = [], chain = Promise.resolve();
    [0, 1, 2].forEach(function (si) {
      chain = chain.then(function () {
        return A.callAI(SOL[si] + A.PROB_CHECK_TAIL, checkPrompt(p, items, si, r.redact), { maxTokens: 4000 }).then(function (t) {
          runs[si] = parseAnswers(t);
        }, function () { runs[si] = null; });
      });
    });
    return chain.then(function () {
      var prev = r.check || {}, oldFlags = prev.flags || [], res = {}, flags = [], snaps = {};
      items.forEach(function (it) {
        var agree = 0, multi = false, errs = 0, picks = [];
        [0, 1, 2].forEach(function (si) {
          var arr = runs[si]; if (!arr) { errs++; picks.push(null); return; }
          var v = arr.filter(function (x) { return x && String(x.id == null ? "" : x.id).replace(/[\[\]\s]/g, "") === it.id; })[0];
          if (!v) { errs++; picks.push(null); return; }
          if (v.multi === true) multi = true;
          var k = LET.indexOf(String(v.pick == null ? "" : v.pick).trim().toLowerCase().charAt(0)), ord = permOf(it.opts.length, hashS(it.id + "|" + si));
          var oi = k >= 0 && k < ord.length ? ord[k] : -1; picks.push(oi); if (oi === it.ok) agree++;
        });
        snaps[it.id] = canon(it.obj);
        res[it.id] = { agree: agree, multi: multi, errs: errs, picks: picks };
        if (agree === 3 && !multi) return;
        var other = picks.filter(function (x) { return x != null && x >= 0 && x !== it.ok; }).map(function (x) { return "«" + it.opts[x] + "»"; }).filter(function (x, i, a) { return a.indexOf(x) === i; });
        var why = errs ? "دست‌کم یک حل‌کننده دربارهٔ این قلم پاسخی نداد (" + fa(3 - errs) + " پاسخ، " + fa(agree) + " تا با گزینهٔ «درست» یکی)." :
          multi ? "دست‌کم یک حل‌کننده بیش از یک گزینهٔ قابلِ‌دفاع دید — پرسش یا گزینه‌ها دوپهلوست." :
          "فقط " + fa(agree) + " از ۳ حل‌کنندهٔ مستقل همان گزینه‌ای را برگزیدند که «درست» علامت خورده" + (other.length ? "؛ برگزیدهٔ دیگر: " + other.join("، ") : "") + ". شاید گزینهٔ «درست» نادرست است یا گزینهٔ دیگری هم درست است.";
        var f = { sid: it.id, kind: it.kind, issue: why, state: "open", snap: snaps[it.id] };
        var o = oldFlags.filter(function (x) { return x.sid === f.sid && x.snap === f.snap && x.state === "accepted"; })[0]; if (o) { f.state = "accepted"; f.decided = o.decided; }
        flags.push(f);
      });
      var dead = runs.every(function (x) { return !x; });
      r.check = { at: new Date().toISOString(), n: 3, items: items.length, res: res, flags: flags, snaps: snaps, okSnaps: {}, error: dead ? "هیچ‌کدام از سه حل‌کننده پاسخِ معتبر نداد (اتصال یا قالب). دوباره اجرا کن." : null };
      S.put(r); return r;
    });
  }
  A.probCheck = checkAnswers;
  /* وضعِ وارسی برای یک نسخه از مسئله (p = همان JSON ِ ویرایش‌شده): اجرا نشده/پرچمِ باز/قلمِ تغییرکرده ⇒ تأیید بسته */
  function checkState(r, p) {
    var items = checkItems(p), c = r.check;
    if (!c) return { ran: false, need: r.by === "ai" && items.length > 0, open: [], changed: [], blocked: r.by === "ai" && items.length > 0 };
    var open = (c.flags || []).filter(function (f) { return f.state === "open" && items.some(function (it) { return it.id === f.sid; }); });
    var changed = items.filter(function (it) { var cv = canon(it.obj); return (c.snaps || {})[it.id] !== cv && (c.okSnaps || {})[it.id] !== cv; }).map(function (it) { return it.id; });
    var blocked = !!c.error || open.length > 0 || changed.length > 0;
    return { ran: true, need: false, open: open, changed: changed, error: c.error, blocked: blocked };
  }
  A.probCheckState = checkState;
  function checkBox(r, editorP, say) {
    var p = r.p, cs = checkState(r, p), items = checkItems(p), byId = {}; items.forEach(function (it) { byId[it.id] = it; });
    function label(id) { var it = byId[id]; if (!it) return id; var ok = it.opts[it.ok]; return (it.kind === "stage" ? "گام" : "تمرین") + " «" + String(it.q).slice(0, 90) + "» — گزینهٔ «درست»: «" + (ok == null ? "؟" : ok) + "»"; }
    var run = h("button", { class: "btn sm pb-runcheck", onclick: function (e) {
      var np; try { np = editorP(); } catch (er) { say(er.message); return; }
      r.p = np; S.put(r); var b = e.currentTarget; b.disabled = true; b.textContent = "در حالِ سه حلِ مستقل…";
      checkAnswers(r).then(function () { A.render(); }, function (er) { b.disabled = false; say((er && er.message) || String(er)); });
    } }, r.check ? "وارسیِ دوبارهٔ پاسخ‌ها (پس از اصلاح)" : "اجرای وارسیِ پاسخ‌ها");
    var okN = r.check ? items.filter(function (it) { var x = (r.check.res || {})[it.id]; return x && x.agree === 3 && !x.multi; }).length : 0;
    return h("section", { class: "card soft pb-check", dir: "rtl" }, h("h4", {}, "وارسیِ پاسخ‌ها — سه حلِ مستقل"),
      h("p", { class: "small" }, "هر گام و هر تمرین سه بار جداگانه، بی دیدنِ برچسبِ «درست»، حل می‌شود؛ فقط وقتی هر سه همان گزینهٔ «درست» را برگزینند وارسی‌شده است. این جلوی تمرین با جوابِ غلط را می‌گیرد."),
      !r.check ? h("p", { class: "small " + (cs.need ? "bad" : "muted") }, cs.need ? "هنوز اجرا نشده؛ تا اجرا نشود «تأیید» بسته است." : "برای مسئلهٔ دستی الزامی نیست، ولی می‌توانی اجرایش کنی.")
        : h("p", { class: "small pb-checksum " + (cs.blocked ? "bad" : "muted") }, fa(items.length) + " قلم؛ " + fa(okN) + " با هر سه حل‌کننده یکی بود؛ " + fa(cs.open.length) + " پرچمِ باز" + (cs.changed.length ? "؛ " + fa(cs.changed.length) + " قلم پس از وارسی تغییر کرده" : "") + "."),
      cs.error ? h("p", { class: "small bad" }, cs.error) : null,
      cs.open.length ? h("ul", { class: "small mv-plist" }, cs.open.map(function (f) {
        return h("li", { class: "mv-flagged", "data-sid": f.sid }, h("div", {}, label(f.sid)), h("div", { class: "bad" }, "⚑ " + f.issue),
          h("button", { class: "btn sm ghost pb-checkaccept", onclick: function () { f.state = "accepted"; f.decided = new Date().toISOString(); S.put(r); A.render(); } }, "بررسی کردم؛ گزینهٔ «درست» درست است (آگاهانه می‌پذیرم)"));
      })) : null,
      cs.changed.length ? h("ul", { class: "small mv-plist" }, cs.changed.map(function (id) {
        return h("li", { class: "mv-flagged", "data-sid": id }, label(id) + " — پس از وارسی تغییر کرده. ", h("button", { class: "btn sm ghost pb-checkchg", onclick: function () {
          var np; try { np = editorP(); } catch (er) { say(er.message); return; }
          r.p = np; var it = checkItems(np).filter(function (x) { return x.id === id; })[0]; if (!it) { say("این قلم در JSON ِ ویرایش‌شده نیست."); return; }
          r.check.okSnaps = r.check.okSnaps || {}; r.check.okSnaps[id] = canon(it.obj); S.put(r); A.render();
        } }, "این تغییر را آگاهانه می‌پذیرم"));
      })) : null, run);
  }

  /* ---------- «شبیه‌سازِ همین مسئله»: مسئله‌ای که مالک در گره‌گشا در آن گیر کرده ⇒ همان شبیه‌سازِ چهارسطحی ----------
     مالک: «مسئله‌ها را من می‌دهم». پس شبیه‌ساز از مسئلهٔ خودِ او ساخته می‌شود، نه از نمونهٔ آماده. تاریخی نیست ⇒ بازبینِ تاریخی ندارد؛
     ولی وارسیِ پاسخ‌ها (سه حلِ مستقل) و تأییدِ مالک دارد. فقط پس از دیدنِ پاسخ (یا پایانِ نردبان) پیشنهاد می‌شود، چون مسیرِ حل را آشکار می‌کند. */
  A.PROB_PERSONAL_INTRO = "تو دستیارِ «شبیه‌سازِ مسئلهٔ خودم» هستی. این مسئلهٔ تاریخی نیست: مسئله‌ای است که کاربر در آن گیر کرده و پاسخِ درستش را داده است. راهِ درستِ حل را (اگر چند راه هست، فهمیدنی‌ترینش را) به گام‌های تصمیم بشکن تا کاربر از سخت به آسان، با گزینه‌های مختلف، همهٔ قسمت‌هایش را تمرین کند و بفهمد کجا و چرا گیر کرد. ";
  A.PROB_PERSONAL_RULES = "\nقواعدِ این مسئلهٔ شخصی (برتر از هر چیزِ بالا): era ننویس؛ year و who را خالی بگذار؛ open خالی؛ src خالی. stages: ۴ تا ۱۰ گام؛ ctx = وضع تا این لحظه (چه داریم، چه به دست آمده) بی‌آنکه حرکتِ بعدی را لو بدهد؛ q = «حرکتِ بعدی چیست؟» به زبانِ همین مسئله؛ opts = ۳ یا ۴ گزینه با دقیقاً یک ok=true؛ گزینه‌های نادرست اشتباه‌های واقعی و رایج باشند (به‌ویژه همان‌جا که کاربر گیر کرد) و why بگوید چرا؛ move = حرکتِ درست به زبانِ ساده؛ idea = ایدهٔ پشتش؛ hint = سرنخی که پاسخ را لو نمی‌دهد؛ lvl از ۱ (آسان) تا ۵ (سخت). dead: راه‌های رایجِ اشتباه یا بن‌بست، با idea و flaw (who و year خالی). why_hard: چرا این مسئله گیرانداز است، به‌ویژه در همان جایی که کاربر گیر کرد. lessons: ۲ تا ۴ درسِ قابلِ انتقال. drills: ۳ تا ۵ پرسشِ چندگزینه‌ای دربارهٔ همین گام‌ها (a = شمارهٔ از صفرِ گزینهٔ درست). هر گام و هر تمرین دقیقاً یک پاسخِ قابلِ‌دفاع داشته باشد. نامِ آدمِ واقعی نیاور.";
  function personalSys() { var ps = BT.PROB_SYS, i = ps.indexOf("خروجی فقط"); return A.PROB_PERSONAL_INTRO + (i >= 0 ? ps.slice(i) : ps) + (window.EPI_PIPE || []).join(", ") + A.PROB_PERSONAL_RULES; }
  A.probPersonalSys = personalSys;
  function caseText(kc) {
    var it = kc.intake || {}, L = ["مسئله: " + (kc.title || "مسئلهٔ من")];
    [["statement", "صورتِ مسئله"], ["answer", "پاسخِ درست"], ["answerHow", "از کجا معلوم است"], ["stuckAt", "کجا گیر کردم"], ["thoughts", "چه فکرهایی کردم"]].forEach(function (f) { var v = String(it[f[0]] || "").trim(); if (v) L.push(f[1] + ": " + v); });
    return L.join("\n");
  }
  A.probCaseText = caseText;
  function caseRec(kc) { return S.all("eprob", function (r) { return r && r.origin && r.origin.type === "kcase" && r.origin.id === kc.id && r.status !== "rejected"; })[0] || null; }
  A.probOfCase = caseRec;
  A.probFromCase = function (kc, text, meta) {
    meta = meta || {};
    var sys = personalSys(), fids = A.aiFileCap(meta.fileIds || [], "شبیه‌سازِ همین مسئله");
    return A.callAIJson(sys, text, { fileIds: fids, maxTokens: 8192 }, function (txt) { return parseJ(txt, true, AI_BAD_JSON); }).then(function (raw) {
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        var it = kc.intake || {};
        if (!raw.title) raw.title = kc.title || "مسئلهٔ من"; if (!raw.field) raw.field = "مسئلهٔ شخصی";
        if (!raw.statement) raw.statement = String(it.statement || ""); if (!raw.answer) raw.answer = String(it.answer || "");
        if (!raw.why_hard) raw.why_hard = String(it.stuckAt || "جایی که گیر کردم");
        raw.src = []; delete raw.era; raw.open = "";
        (raw.stages || []).forEach(function (s) { if (s) { s.year = ""; s.who = ""; } }); (raw.dead || []).forEach(function (d) { if (d) { d.year = ""; d.who = ""; } });
      }
      var o = validP(raw);
      o.origin = { type: "kcase", id: kc.id };
      var id = "pb_k_" + Date.now().toString(36); o.id = id;
      var sn = {}; allItems(o).forEach(function (x) { sn[x.id] = canon(x); });
      var r = { id: "eprob_" + id, type: "eprob", status: "pending", by: "ai", personal: true, origin: { type: "kcase", id: kc.id }, p: o, redact: (meta.names || []).slice(0, 30),
        verify: { at: new Date().toISOString(), n: 0, flags: [], snaps: sn, okSnaps: {}, na: "مسئلهٔ شخصی؛ بازبینیِ تاریخی ندارد" } };
      S.put(r);
      return checkAnswers(r);
    });
  };
  /* جعبهٔ پایینِ صفحهٔ موقعیت (a16 صدا می‌زند) */
  A.probCaseBox = function (kc, seen) {
    var it = (kc && kc.intake) || {};
    if (!kc || (kc.kinds || []).indexOf("problem") < 0) return null;
    var box = h("section", { class: "card soft pb-casebox", dir: "rtl" }, h("h3", {}, "🧪 شبیه‌سازِ همین مسئله"));
    var r = caseRec(kc);
    if (r && r.status === "approved") {
      box.appendChild(h("p", { class: "small" }, "شبیه‌سازِ چهارسطحیِ همین مسئله ساخته و تأیید شده: از سخت به آسان یا برعکس تمرین کن و مسئله‌های هم‌ساختارِ تازه بساز."));
      box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm", onclick: function () { A.go("e_prob", r.p.id, "sim"); } }, "باز کردنِ شبیه‌ساز"),
        h("button", { class: "btn ghost sm", onclick: function () { A.go("e_prob", r.p.id, "similar"); } }, "مسئله‌های هم‌ساختار")));
      return box;
    }
    if (r) { box.appendChild(h("p", { class: "small" }, "ساخته شده و در «در انتظارِ تأیید» است: گام‌ها و نتیجهٔ وارسیِ پاسخ‌ها را ببین و تأیید کن.")); box.appendChild(h("button", { class: "btn sm", onclick: function () { A.go("e_prob", null, "pending"); } }, "رفتن به «در انتظارِ تأیید»")); return box; }
    if (!String(it.statement || "").trim() || !String(it.answer || "").trim()) { box.appendChild(h("p", { class: "small muted" }, "برای ساختنش «صورتِ کامل» و «پاسخِ درست» را در ثبت بنویس.")); return box; }
    if (!seen) { box.appendChild(h("p", { class: "small muted" }, "پس از دیدنِ پاسخ (یا پایانِ نردبانِ راهنمایی) در دسترس است — ساختنش مسیرِ حل را آشکار می‌کند و تشخیصِ گره را خراب می‌کند.")); return box; }
    box.appendChild(h("p", { class: "small" }, "هوش مصنوعی راهِ حلِ همین مسئلهٔ تو را به گام‌های تصمیم با گزینه می‌شکند (گزینه‌های غلط = اشتباه‌های رایج، به‌ویژه همان‌جا که گیر کردی)؛ سپس سه حل‌کنندهٔ مستقل گزینهٔ درستِ هر گام را وارسی می‌کنند و تو تأیید می‌کنی."));
    var b = h("button", { class: "btn sm pb-fromcase", onclick: function () {
      if (!A.kaiAvailable || !A.kaiAvailable()) { A.toast("هوش مصنوعی در دسترس نیست.", "bad"); return; }
      function go(text, meta) {
        b.disabled = true; b.textContent = "در حالِ ساخت و وارسیِ پاسخ‌ها…";
        A.probFromCase(kc, text, meta).then(function (r2) { A.toast(r2.check && r2.check.flags.length ? "ساخته شد؛ " + fa(r2.check.flags.length) + " قلم پرچم خورد — پیش از تأیید ببین." : "ساخته شد؛ در «در انتظارِ تأیید» است."); A.go("e_prob", null, "pending"); },
          function (er) { b.disabled = false; b.textContent = "ساختنِ شبیه‌سازِ همین مسئله"; A.toast((er && er.message) || String(er), "bad"); });
      }
      if (A.knotAIGate) A.knotAIGate({ purpose: "ساختنِ شبیه‌سازِ همین مسئله", noPriv: true, attach: { recIds: [kc.id] }, more: "پس از ساخت، پرسش‌های گام‌ها و تمرین‌ها (همراهِ صورت و پاسخِ نهایی، بی برچسبِ گزینهٔ درست) سه بار جداگانه برای وارسی فرستاده می‌شوند.", build: function () { return caseText(kc); }, onSend: function (t, m) { go(t, m); } });
      else go(caseText(kc), {});
    } }, "ساختنِ شبیه‌سازِ همین مسئله");
    box.appendChild(b);
    return box;
  };

  function inject() {
    var f = { title: "", field: "", open: "", statement: "", answer: "", src: "", notes: "" };
    function inp(lbl, k, ta, ph) { var id = "pbIn_" + k; var el = ta ? h("textarea", { id: id, rows: ta, placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }) : h("input", { id: id, type: "text", placeholder: ph || "", oninput: function (e) { f[k] = e.target.value; } }); return h("div", {}, h("label", { for: id }, lbl), el); }
    var jsonTa = h("textarea", { rows: 6, class: "mono", "aria-label": "JSON ِ کاملِ مسئله", placeholder: "یا JSON کامل مسئله را طبق طرح بچسبان" });
    var out = h("div", { "aria-live": "polite" });
    /* شناسهٔ مسئله از همین حالا (۲۰۲۶-۱۰-۱۳): پیوست‌های صورت/حل پیش از تجزیه در فولدرِ همین مسئله در درایو می‌نشینند و
       هوش مصنوعی هنگامِ تجزیه آن‌ها را می‌خواند؛ پس از ثبت، شناسهٔ تازه برای مسئلهٔ بعدی. */
    var pid = "pb_u_" + Date.now().toString(36), attWrap = h("div", { class: "pb-att" }), attAi = true, attShown = false;
    function attFiles() {
      if (!attShown || !attAi || !(A.HOST && A.HOST.files)) return Promise.resolve([]);
      return Promise.resolve(A.HOST.files("eprob_" + pid)).then(function (fs) {
        var ok = (fs || []).filter(function (x) { return A.knotAIFileOk ? A.knotAIFileOk(x) : /^image\/|pdf$/.test(x.mime || ""); });
        ok.forEach(function (x) { A.fileNames[x.id] = x.name; });
        var sent = A.aiFileCap(ok, "تجزیهٔ مسئله");
        if (sent.length < ok.length) {  /* کنارِ همان کادرِ پیوست هم بماند، نه فقط toast */
          var w0 = attWrap.querySelector(".pb-attdrop"); if (w0) w0.remove();
          attWrap.appendChild(h("p", { class: "small warnline pb-attdrop", role: "alert" }, A.aiFileDrop.msg));
        }
        return sent.map(function (x) { return x.id; });
      }, function () { return []; });
    }
    function attBlock() {
      if (!(A.HOST && A.HOST.upload && A.attachSection)) return null;
      var btn = h("button", { class: "btn ghost sm pb-attbtn", onclick: function () {
        if (!String(f.title || "").trim()) { A.toast("اول عنوانِ مسئله را بنویس تا فولدرش در درایو درست نام بگیرد.", "bad"); return; }
        attShown = true; btn.remove();
        attWrap.appendChild(A.attachSection("eprob_" + pid, { group: "مسئله‌های من", title: f.title.trim() }));
        attWrap.appendChild(h("label", { class: "row gap small", for: "pbAttAi" }, h("input", { type: "checkbox", id: "pbAttAi", checked: true, onchange: function (e) { attAi = e.target.checked; } }),
          "پیوست‌ها هم برای تجزیه به هوش مصنوعی فرستاده و کامل خوانده شوند (هر قالب، تا ۴۰ فایل، هر کدام تا ۱۰۰ مگابایت) — همان ارائه‌دهندهٔ بیرونیِ تجزیه آن را می‌بیند"));
      } }, "📎 صورت یا حل را در فایل (عکس، PDF، Word…) داری؟ پیوست کن");
      attWrap.appendChild(h("p", { class: "small muted" }, "اگر صورتِ مسئله یا حلش روی کاغذ، در کتاب یا PDF است، لازم نیست تایپش کنی: پیوست کن تا هوش مصنوعی از خودِ تصویر بخواند (فایل در فولدرِ همین مسئله در گوگل درایو می‌ماند)."));
      attWrap.appendChild(btn);
      return attWrap;
    }
    function store(o, by) { var id = pid; pid = "pb_u_" + Date.now().toString(36); o.id = id;
      if (attShown) { attShown = false; attWrap.innerHTML = ""; var b2 = attBlock(); if (b2 !== attWrap && b2) attWrap.appendChild(b2); } var r = { id: "eprob_" + id, type: "eprob", status: "pending", by: by, p: o }; S.put(r); out.innerHTML = ""; out.appendChild(h("p", {}, "مسئله در صف تأیید است. پیش از تأیید، گام‌ها و درستی تاریخی‌شان را بسنج.")); return r; }
    return h("section", { class: "card col gap", dir: "rtl" }, h("h2", {}, "افزودنِ مسئلهٔ سختِ حل‌شده — مسئلهٔ تو"),
      h("p", { class: "small" }, "مسئله و پاسخ نهایی‌اش را بنویس (از هر علمی: ریاضی، فیزیک، فلسفه، روان‌شناسی…). هوش مصنوعی فقط مسیرِ حل را به گام‌های تصمیم، گزینه‌ها، بن‌بست‌ها و تمرین‌ها می‌شکند. بعد دو وارسیِ جدا: «بازبینِ تاریخی» تاریخ‌ها، اشخاص و رویدادها را می‌سنجد، و «وارسیِ پاسخ‌ها» هر گام و هر تمرین را سه بار جداگانه حل می‌کند تا گزینهٔ «درست» واقعاً درست باشد. نتیجه پیش از ورود به شبیه‌ساز به تأییدِ تو می‌رسد؛ تا هر پرچم را اصلاح یا آگاهانه نپذیری، تأیید بسته است. اگر مسئله‌ای است که خودت در آن گیر کرده‌ای، از «🪢 گره‌گشا» برو: آن‌جا هم ریشهٔ گیرکردن پیدا می‌شود و هم «شبیه‌سازِ همین مسئله» ساخته می‌شود."),
      inp("عنوان", "title"), inp("رشته", "field"), inp("بازه حل‌نشده ماندن", "open", 0, "مثلاً ۱۶۳۷–۱۹۹۵"), inp("صورت مسئله", "statement", 4), inp("پاسخ نهایی و حل‌کننده", "answer", 3),
      inp("منابع (اختیاری، ولی بازبینیِ تاریخی را دقیق‌تر می‌کند — نامِ کتاب/مقاله یا نشانیِ اینترنتی؛ هر منبع در یک سطر)", "src", 2), inp("یادداشت (اختیاری)", "notes", 2),
      attBlock(),
      // فرستادنِ متنِ تو به هوش مصنوعی تصمیمِ خودِ توست: دستیار این دکمه را نمی‌زند، زردش می‌کند (کارزارِ آزمونِ دوم c12)
      h("div", { class: "row gap wrap" }, h("button", { class: "btn pb-ai", "data-own": "1", onclick: function (e) {
        if (!f.title) { A.toast("عنوان لازم است.", "bad"); return; }
        /* «پیش از فرستادن» مثلِ بقیهٔ درخواست‌های هوش (کارزارِ آزمونِ دوم c12/c15: این تنها دکمه‌ای بود که بی پنجرهٔ رضایت می‌فرستاد) — یک بار در هر بارگذاری */
        if (!A._pbAIok) { var tb = e.target, ov = h("div", { class: "overlay pb-consent", "data-own": "1", role: "dialog", "aria-label": "پیش از فرستادن به هوش مصنوعی" },
          h("div", { class: "card col gap", style: "max-width:560px;margin:10vh auto" }, h("h3", {}, "پیش از فرستادن"),
            h("p", { class: "small" }, "این‌ها برای تجزیه به ارائه‌دهندهٔ بیرونیِ هوش مصنوعی فرستاده می‌شود: عنوان، رشته، بازه، صورت، پاسخ، منابع و یادداشت" + (attShown && attAi ? "، و پیوست‌هایی که انتخاب کرده‌ای" : "") + ". نامِ کسی را اگر نمی‌خواهی برود، پیش از فرستادن از متن بردار."),
            h("pre", { class: "small kn-pre", style: "white-space:pre-wrap;max-height:40vh;overflow:auto" }, ["عنوان: " + f.title, f.statement ? "صورت: " + f.statement : "", f.answer ? "پاسخ: " + f.answer : ""].filter(Boolean).join("\n")),
            h("div", { class: "row gap" }, h("button", { class: "btn", type: "button", onclick: function () { ov.remove(); A._pbAIok = true; tb.click(); } }, "بفرست"),
              h("button", { class: "btn ghost", type: "button", onclick: function () { ov.remove(); } }, "انصراف"))));
          document.body.appendChild(ov); return; }
        var nosrc = !String(f.src || "").trim();   // منبع اختیاری شد (۲۰۲۶-۱۰-۱۳)؛ بی‌منبع ⇒ بازبین فقط با دانشِ تاریخیِ مستقر می‌سنجد و برچسبِ «بی‌منبع»
        var b = e.target;
        attFiles().then(function (fileIds) {
        /* صورت و پاسخ لازم است — یا تایپ‌شده یا در عکس/PDF ِ پیوستی که برای هوش مصنوعی فرستاده می‌شود */
        if ((!f.statement || !f.answer) && !fileIds.length) { A.toast(attShown && attAi ? "صورت و پاسخ لازم است — تایپ کن، یا فایلِ آن (عکس، PDF، Word…) را پیوست کن." : "عنوان، صورت و پاسخ لازم است (یا عکس/PDF ِ آن را پیوست کن).", "bad"); return; }
        b.disabled = true; b.textContent = fileIds.length ? "در حال خواندنِ پیوست و تجزیه…" : "در حال تجزیه…";
        var fromFile = fileIds.length ? "\n(" + fa(fileIds.length) + " پیوست همراهِ این پیام است (متنِ کاملش در ادامه): صورت" + (f.answer ? "" : " و پاسخ و حل") + "ِ مسئله را از آن بخوان؛ اگر چیزی در تصویر خوانا نیست، حدس نزن و در یادداشت بگو.)" : "";
        return A.callAIJson(BT.PROB_SYS + window.EPI_PIPE.join(", "), "مسئله: " + f.title + "\nرشته: " + f.field + "\nبازه: " + f.open + "\nصورت: " + (f.statement || "(در پیوست)") + "\nپاسخ: " + (f.answer || "(در پیوست)") + "\nمنابع: " + f.src + "\nیادداشت: " + f.notes + fromFile, fileIds.length ? { maxTokens: 8192, fileIds: fileIds } : { maxTokens: 8192 }, function (txt) { return parseJ(txt, true, AI_BAD_JSON); })
          .then(function (raw) {
            if (raw && typeof raw === "object" && !Array.isArray(raw) && (raw.src == null || (Array.isArray(raw.src) && !raw.src.length))) raw.src = f.src.split(/\n|\|/).map(function (x) { return x.trim(); }).filter(Boolean);
            var o = validP(raw);
            var r = store(o, "ai"); if (nosrc) { r.nosrc = true; S.put(r); } b.textContent = "در حال بازبینیِ تاریخی…";
            return verify(r, f.src).then(function (r2) {
              b.textContent = "در حالِ وارسیِ پاسخ‌ها (سه حلِ مستقل)…";
              return checkAnswers(r2);
            }).then(function (r2) {
              var n = openFlags(r2).length, cs = checkState(r2, r2.p); out.innerHTML = "";
              out.appendChild(h("p", {}, "مسئله در صف تأیید است. " + (r2.verify.error ? "بازبینِ تاریخی اجرا نشد؛ در «در انتظار تأیید» دوباره اجرایش کن. " : n ? "بازبینِ تاریخی " + fa(n) + " قلم را پرچم زد. " : "بازبینِ تاریخی پرچمی نزد. ") +
                (cs.error ? "وارسیِ پاسخ‌ها اجرا نشد؛ آن‌جا دوباره اجرایش کن." : cs.open.length ? "وارسیِ پاسخ‌ها " + fa(cs.open.length) + " قلم را پرچم زد." : "وارسیِ پاسخ‌ها: هر سه حل‌کننده با همهٔ گزینه‌های «درست» یکی بودند.") + " پیش از تأیید خودت گام‌ها را ببین."),
                h("button", { class: "btn sm", onclick: function () { A.go("e_prob", null, "pending"); } }, "رفتن به «در انتظارِ تأیید»"));
            });
          })
          .catch(function (err) { var m = (err && err.message) || String(err); out.innerHTML = ""; out.appendChild(h("pre", { class: "small bad pb-err", role: "alert" }, m)); A.toast(m.split("\n")[0], "bad"); })
          .then(function () { b.disabled = false; b.textContent = "تجزیه با هوش مصنوعی"; });
        });
      } }, "تجزیه با هوش مصنوعی"), h("button", { class: "btn ghost pb-manual", onclick: function () {
        try { store(validP(parseJ(jsonTa.value)), "user"); } catch (er) { var m = er.message || String(er); out.innerHTML = ""; out.appendChild(h("pre", { class: "small bad pb-err", role: "alert" }, m)); A.toast(m.split("\n")[0], "bad"); }
      } }, "ثبت JSON دستی"),
      /* هوش در دسترس نیست (یا نمی‌خواهی بفرستی)؟ (بازبینیِ اجرا ۲۰۲۶-۱۰-۱۵): از همین فیلدها یک مسئلهٔ کمینه ساخته می‌شود —
         یک گامِ «پاسخِ نهایی کدام است؟» — با نشانِ روشنِ «دستی · وارسی‌نشده»؛ گام‌ها را بعداً در «در انتظارِ تأیید» (ویرایش JSON) می‌نویسی. */
      h("button", { class: "btn ghost pb-formmanual", onclick: function () {
        var miss = [["title", "عنوان"], ["statement", "صورت مسئله"], ["answer", "پاسخ نهایی"]].filter(function (k) { return !String(f[k[0]] || "").trim(); }).map(function (k) { return k[1]; });
        if (miss.length) { A.toast("برای ثبتِ دستی این‌ها لازم است: " + miss.join("، "), "bad"); return; }
        try {
          var o = validP(A.probMinimal(f));
          var r = store(o, "user"); r.unverified = true; S.put(r);
          out.innerHTML = ""; out.appendChild(h("p", { class: "pb-manualok" }, "به‌صورتِ دستی و «وارسی‌نشده» در صفِ تأیید ثبت شد: فقط یک گام دارد (پاسخِ نهایی). گام‌ها، بن‌بست‌ها و تمرین‌ها را در «در انتظارِ تأیید» › «ویرایش JSON» بنویس، یا هر وقت هوش در دسترس شد از نو تجزیه کن."),
            h("button", { class: "btn sm", onclick: function () { A.go("e_prob", null, "pending"); } }, "رفتن به «در انتظارِ تأیید»"));
        } catch (er) { var m = er.message || String(er); out.innerHTML = ""; out.appendChild(h("pre", { class: "small bad pb-err", role: "alert" }, m)); A.toast(m.split("\n")[0], "bad"); }
      } }, "ثبتِ دستی از همین فرم (بی هوش مصنوعی)")),
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
    var real = r.verify && !r.verify.error && !r.personal, cst = checkState(r, p), blocked = open.length + changed.length + (cst.blocked ? 1 : 0);
    var chBox = changed.length ? h("section", { class: "card soft pb-changed", dir: "rtl" },
      h("p", { class: "small" }, h("strong", {}, "⚑ " + fa(changed.length) + " قلم پس از بازبینیِ تاریخی تغییر کرده است. "), "هر کدام را یا دوباره بازبینی کن (فقط همین قلم‌ها به بازبین فرستاده می‌شوند) یا تک‌تک آگاهانه بپذیر."),
      h("ul", { class: "small mv-plist" }, changed.map(function (it) {
        return h("li", { "data-sid": it.id, class: "mv-flagged" }, h("bdi", {}, it.id), " — ", label(it), ": " + (it.move || it.idea || it.q || ""), " ",
          h("button", { class: "btn sm ghost pb-chaccept", onclick: function () { var np; try { np = editorP(); } catch (er) { say(er.message); return; } r.p = np; if (!itemOf(np, it.id)) { say("این قلم در JSON ِ ویرایش‌شده نیست."); return; } okSnap(it.id, np); S.put(r); A.render(); } }, "این تغییر را آگاهانه می‌پذیرم"));
      })),
      r.by === "ai" ? h("button", { class: "btn sm pb-rereview", onclick: function (e) { rereview(e.currentTarget, changed.map(function (x) { return x.id; })); } }, "بازبینیِ دوباره (فقط " + fa(changed.length) + " قلمِ تغییرکرده)") : null) : null;
    return h("section", { class: "card pb-pending", dir: "rtl", "data-rid": r.id }, h("h3", {}, p.title + " · " + (r.personal ? "شبیه‌سازِ مسئلهٔ خودت (از گره‌گشا)" : r.by === "ai" ? "تجزیه هوش مصنوعی" : "دستی"),
      r.unverified || (p && p.unverified) ? h("span", { class: "chip pb-unver" }, " دستی · وارسی‌نشده (بی هوش مصنوعی)") : null),
      h("p", { class: "small" }, fa(p.stages.length) + " گام · " + fa((p.dead || []).length) + " بن‌بست · " + fa((p.drills || []).length) + " تمرین", r.nosrc ? h("span", { class: "chip pb-nosrc" }, " بی‌منبع — بازبین فقط با دانشِ تاریخیِ مستقر سنجید") : null),
      r.personal ? h("p", { class: "small muted" }, "مسئلهٔ شخصی است؛ بازبینیِ تاریخی ندارد. درستیِ گزینه‌ها را «وارسیِ پاسخ‌ها» در پایین می‌سنجد.") : null,
      real ? h("p", { class: "small mv-vsum " + (open.length ? "bad" : "muted") }, "بازبینِ تاریخی: " + fa(fl.length) + " پرچم، " + fa(open.length) + " هنوز باز.") : null,
      forSid("*").map(flagBox), chBox,
      h("ol", { class: "small mv-plist" }, p.stages.map(function (s) {
        var fs = forSid(s.id);
        var okO = (s.opts || []).filter(function (o) { return o && o.ok; })[0];
        return h("li", { class: fs.some(function (x) { return x.state === "open"; }) ? "mv-flagged" : null, "data-sid": s.id }, yrWho(s.year, s.who, " "), (s.year != null && s.year !== "") || s.who ? ": " : "", (s.move || ""),
          h("div", { class: "small muted pb-qa" }, "پرسش: " + (s.q || "") + " — گزینهٔ «درست»: «" + (okO ? okO.t : "؟") + "»"), A.moveChips ? A.moveChips(p, s, "") : null, fs.map(flagBox));
      })),
      (p.dead || []).some(function (d) { return forSid(d.id).length; }) ? h("div", {}, h("h4", {}, "بن‌بست‌ها"), h("ul", { class: "small mv-plist" }, p.dead.map(function (d) {
        var fs = forSid(d.id); if (!fs.length) return null;
        return h("li", { class: fs.some(function (x) { return x.state === "open"; }) ? "mv-flagged" : null, "data-sid": d.id }, yrWho(d.year, d.who, " "), ": " + (d.idea || ""), fs.map(flagBox));
      }))) : null,
      checkBox(r, editorP, say),
      h("details", {}, h("summary", {}, "ویرایش JSON (برای اصلاحِ یک گام یا گزینه)"), ta), msg,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm mv-approve", disabled: blocked ? true : null, title: blocked ? "تا هر پرچم را اصلاح یا آگاهانه نپذیری و هر قلمِ تغییرکرده را دوباره بازبینی یا آگاهانه نپذیری، تأیید بسته است" : null, onclick: function () {
          var np; try { np = editorP(); } catch (er) { say(er.message); return; }
          var ch = changedItems(r, np), of = openFlags(r), ck = checkState(r, np);
          if (ch.length || of.length || ck.blocked) {
            r.p = np; S.put(r);
            A.toast(ch.length ? fa(ch.length) + " قلم با نسخهٔ بازبینی‌شده فرق دارد؛ دوباره بازبینی کن یا تک‌تک آگاهانه بپذیر." : of.length ? "هنوز " + fa(of.length) + " پرچمِ باز هست." : ck.need ? "وارسیِ پاسخ‌ها هنوز اجرا نشده." : ck.error ? "وارسیِ پاسخ‌ها اجرا نشد؛ دوباره اجرایش کن." : ck.open.length ? "هنوز " + fa(ck.open.length) + " پرچمِ وارسیِ پاسخ باز است." : fa(ck.changed.length) + " قلم پس از وارسیِ پاسخ‌ها تغییر کرده؛ دوباره وارسی کن یا آگاهانه بپذیر.", "bad"); A.render(); return;
          }
          r.p = np; r.status = "approved"; S.put(r); A.toast("تأیید شد؛ در شبیه‌ساز هست."); A.render();
        } }, "تأیید"),
        h("button", { class: "btn ghost sm", onclick: function () { r.status = "rejected"; S.put(r); A.render(); } }, "رد"),
        r.by === "ai" && !r.personal ? h("button", { class: "btn ghost sm mv-rever", onclick: function (e) { rereview(e.currentTarget, null); } }, "بازبینیِ تاریخیِ دوباره (همه)") : null),
      blocked ? h("p", { class: "small muted" }, "«تأیید» تا وقتی پرچمِ باز (بازبینیِ تاریخی یا وارسیِ پاسخ‌ها)، یا قلمِ تغییرکردهٔ وارسی‌نشده هست بسته است. «اصلاحش کردم» فقط وقتی پذیرفته می‌شود که همان قلم در JSON تغییرِ معنادار (نه فقط فاصله) کرده باشد؛ هر ویرایشِ دیگری در JSON پیش از تأیید با نسخهٔ بازبینی‌شده مقایسه می‌شود.") : null);
  }
})(APP);
