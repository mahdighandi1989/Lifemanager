function qToks(t) { return String(t || "").replace(/[ً-ٰٟ‌]/g, "").replace(/[^؀-ۿa-zA-Z0-9 ]+/g, " ").split(/\s+/).filter(function (w) { return w.length >= 3 && !/^(که|را|از|به|با|در|این|آن|است|هست|می|یک|هم|چه|کدام|چیست|کنی|کرد|بود|شد|همین|برای)$/.test(w); }); }
function sameStmt(a, b) { var ta = qToks(a), tb = qToks(b); if (ta.length < 3 || tb.length < 3) return false; var n = ta.filter(function (w) { return tb.indexOf(w) >= 0; }).length; return [n, ta.length, tb.length, n * 5 >= Math.min(ta.length, tb.length) * 3]; }
const st="بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه";
for (const m of process.argv.slice(2)) console.log(JSON.stringify(sameStmt(m,st)), qToks(st).join('|'), m.slice(0,50));
