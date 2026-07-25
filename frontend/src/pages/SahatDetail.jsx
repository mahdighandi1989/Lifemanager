import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';
import { SAHAT_META, ATTENTION_KIND_CLS, scoreColor } from '../lib/sahat';

// «محله» — one district of خداشهر, item-level. The chain the owner asked for
// is visible here: نقشه → محله → نخِ تسبیح → صفحه/آیتم. Accepts a sahat key
// (khoda / khod_ravan / …) or 'khod' (the combined district of self).
// Threads (نخ‌های تسبیح) are editable HERE: add a new stream and everything
// matching self-attaches — no deploy, no re-filing.

function AddThreadForm({ sahatKey, onAdded }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tokens, setTokens] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const toks = tokens.split('،').join(',').split(',').map((t) => t.trim()).filter(Boolean);
    if (!title.trim() || toks.length === 0) {
      setErr('نام و دست‌کم یک نشانهٔ تطبیق لازم است');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await api.post('/sahat/threads', {
        title: title.trim(), sahat: sahatKey, tokens: toks, link: '/lists',
      });
      setTitle('');
      setTokens('');
      setOpen(false);
      if (onAdded) onAdded();
    } catch {
      setErr('ثبت نخ ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="sahat-add-thread"
        className="rounded-md border border-dashed border-gray-300 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50"
      >
        + نخِ تسبیحِ جدید
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-2 rounded-md border border-gray-200 p-2" dir="rtl">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="نامِ نخ (مثلاً: تاریخ انبیا)"
        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
      />
      <input
        value={tokens}
        onChange={(e) => setTokens(e.target.value)}
        placeholder="نشانه‌های تطبیق، با ویرگول (مثلاً: انبیا، تاریخ انبیا)"
        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
      />
      {err && <p className="text-[11px] text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
        >
          {busy ? '…' : 'بساز'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1 text-[11px] text-gray-500"
        >
          انصراف
        </button>
      </div>
      <p className="text-[10px] text-gray-400">
        هر لیست/نوشته/فرمانی که یکی از نشانه‌ها را در نامش داشته باشد، خودش به این نخ می‌چسبد.
      </p>
    </form>
  );
}

function Section({ title, children, empty }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-gray-500">{title}</p>
      {children}
      {empty && <p className="text-[11px] text-gray-300">خالی</p>}
    </div>
  );
}

function CellBlock({ s, onThreadsChanged }) {
  const color = SAHAT_META[s.key] || {};
  const d = s.detail || {};
  const pct = s.total ? Math.round((s.done / s.total) * 100) : null;
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${color.ring || 'border-gray-100'} p-4 space-y-4`} data-testid={`sahat-district-${s.key}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{s.icon}</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">{s.title}</h2>
            <p className="text-[11px] text-gray-400 truncate">{s.desc}</p>
          </div>
        </div>
        <span className={`shrink-0 text-2xl font-extrabold ${scoreColor(s.score)}`} dir="ltr">
          {s.score == null ? '—' : s.score}
        </span>
      </div>

      {pct != null && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>پیشرفت</span>
            <span dir="ltr">{s.done}/{s.total}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
            <div className={`h-2 rounded-full ${color.bar}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {(s.attention || []).length > 0 && (
        <Section title="منتظرِ پیگیری:">
          {s.attention.map((a, i) => (
            <Link
              key={i}
              to={a.link || '/'}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              <span className="truncate">{a.label}</span>
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ATTENTION_KIND_CLS[a.kind] || 'bg-amber-100 text-amber-700'}`}>
                {a.kind_fa || 'پیگیری'}
              </span>
            </Link>
          ))}
        </Section>
      )}

      {/* نخ‌های تسبیح — with samples + management */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-gray-500">نخ‌های تسبیح:</p>
        {(s.threads || []).map((t) => {
          const empty = !t.total && !t.writings && !t.directives && !t.lists;
          return (
            <div key={t.key} className={`rounded-md px-2 py-1.5 text-xs ${empty ? 'bg-gray-50/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-2">
                <Link to={t.link || '/lists'} className={`truncate font-medium ${empty ? 'text-gray-400' : 'text-gray-700'} hover:underline`}>
                  {t.title}
                </Link>
                <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-gray-400">
                  {t.total > 0 && <span dir="ltr">{t.done}/{t.total}</span>}
                  {t.writings > 0 && <span>📝{t.writings}</span>}
                  {t.directives > 0 && <span>🧭{t.directives}</span>}
                  {empty && <span>خالی — هنوز محتوایی این‌جا نریخته</span>}
                </span>
              </div>
              {(t.samples || []).length > 0 && (
                <p className="mt-0.5 truncate text-[10px] text-gray-400">{t.samples.join(' · ')}</p>
              )}
            </div>
          );
        })}
        <AddThreadForm sahatKey={s.key} onAdded={onThreadsChanged} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(d.lists || []).length > 0 && (
          <Section title={`لیست‌ها (${d.lists.length}):`}>
            {d.lists.map((l) => (
              <Link key={l.id} to={`/lists/${l.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                <span className="truncate">{l.name}</span>
                <span className="shrink-0 text-[10px] text-gray-400" dir="ltr">{l.done}/{l.total}</span>
              </Link>
            ))}
          </Section>
        )}

        {(d.tasks || []).length > 0 && (
          <Section title={`کارهای باز (${d.tasks.length}):`}>
            {d.tasks.slice(0, 15).map((t) => (
              <Link key={t.id} to="/tasks" className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                <span className="truncate">{t.title}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {t.steps_total > 0 && (
                    <span className="rounded-full bg-blue-50 px-1.5 text-[10px] text-blue-600" dir="ltr">
                      {t.steps_done}/{t.steps_total} مرحله
                    </span>
                  )}
                  {t.overdue && <span className="rounded-full bg-red-50 px-1.5 text-[10px] text-red-600">عقب‌افتاده</span>}
                </span>
              </Link>
            ))}
            {d.tasks.length > 15 && (
              <Link to="/tasks" className="block px-2 text-[10px] text-blue-600 hover:underline">
                همه ({d.tasks.length}) ←
              </Link>
            )}
          </Section>
        )}

        {(d.writings || []).length > 0 && (
          <Section title={`نوشته‌ها (${d.writings.length}):`}>
            {d.writings.slice(0, 10).map((w) => (
              <Link key={w.id} to="/writings" className="block truncate rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                📄 {w.title}{w.category ? ` — ${w.category}` : ''}
              </Link>
            ))}
          </Section>
        )}

        {(d.directives || []).length > 0 && (
          <Section title={`فرمان‌های زنده (${d.directives.length}):`}>
            {d.directives.slice(0, 10).map((x) => (
              <Link key={x.id} to="/directives" className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                <span className="truncate">{x.title}</span>
                <span className="shrink-0 text-[10px] text-gray-400" dir="ltr">💪{x.strength} 🔥{x.streak}</span>
              </Link>
            ))}
          </Section>
        )}

        {(d.projects || []).length > 0 && (
          <Section title={`پروژه‌ها (${d.projects.length}):`}>
            {d.projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block truncate rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                📁 {p.name}
              </Link>
            ))}
          </Section>
        )}

        {/* افراد — the ledger itself lives in this district, not only the
            follow-ups that slipped (2026-07-25). 👍/👎 are the all-time counts;
            ⭐ is «یادم بماند». */}
        {(d.people || []).length > 0 && (
          <Section title={`افراد (${d.people.length}):`}>
            {d.people.map((p) => (
              <Link key={p.id} to={`/people/${p.id}/profile`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                <span className="truncate">
                  {p.name}
                  {p.relationship_fa && <span className="mr-1 text-[10px] text-gray-400">({p.relationship_fa})</span>}
                </span>
                <span className="shrink-0 text-[10px] text-gray-400" dir="ltr">
                  {p.flagged > 0 ? `⭐${p.flagged} ` : ''}👍{p.good} 👎{p.bad}
                </span>
              </Link>
            ))}
          </Section>
        )}

        {(d.people_overdue || []).length > 0 && (
          <Section title="پیگیریِ رابطه (عقب‌افتاده):">
            {d.people_overdue.map((p) => (
              <Link key={p.id} to={`/people/${p.id}/profile`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-[10px] text-gray-400" dir="ltr">{p.next_follow_up}</span>
              </Link>
            ))}
          </Section>
        )}

        {(d.documents || []).length > 0 && (
          <Section title="اسناد:">
            {d.documents.map((doc, i) => (
              <Link key={i} to="/life-file" className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                <span className="truncate">{doc.name}</span>
                <span className={`shrink-0 text-[10px] ${doc.expired ? 'text-red-600' : 'text-gray-400'}`}>
                  {doc.expired ? 'منقضی' : (doc.expiry || '')}
                </span>
              </Link>
            ))}
          </Section>
        )}
      </div>

      {(s.finance_lines || []).length > 0 && (
        <div className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-600 space-y-0.5">
          {s.finance_lines.map((ln, i) => <p key={i} dir="rtl">{ln}</p>)}
        </div>
      )}

      {s.key === 'mohit' && (
        <p className="text-[11px] text-gray-400" dir="rtl">
          {[
            d.subscriptions_count > 0 ? `📺 ${d.subscriptions_count} اشتراک` : null,
            s.assets > 0 ? `🗃 ${s.assets} فایل/رسانهٔ اسکن‌شده` : null,
            d.inbox_pending > 0 ? `📥 ${d.inbox_pending} موردِ منتظر در صندوق` : null,
          ].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}

function SahatDetail() {
  const { key } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  const load = async () => {
    try {
      const r = await api.get(`/sahat/district/${key}`);
      setData(r.data || {});
      setErr(false);
    } catch {
      setErr(true);
      setData({});
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [key]);

  const cells = data?.sahats || [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {data?.title || 'محله'}
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            زنجیره: نقشهٔ خداشهر ← محله ← نخِ تسبیح ← صفحه و آیتم
          </p>
        </div>
        <Link
          to="/sahat"
          className="shrink-0 rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200"
        >
          → نقشهٔ خداشهر
        </Link>
      </div>

      {data === null && <p className="text-gray-400">در حال بارگذاری…</p>}
      {err && <p className="text-sm text-red-600">دریافتِ محله ناموفق بود.</p>}

      {cells.map((s) => (
        <CellBlock key={s.key} s={s} onThreadsChanged={load} />
      ))}
    </div>
  );
}

export default SahatDetail;
