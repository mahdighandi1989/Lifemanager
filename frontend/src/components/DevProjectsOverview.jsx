import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

// «پروژه‌های توسعه» — GitHub repos + Render services mirrored into the life
// view (GET /api/dev/overview). Reused embedded inside ProjectsHub and as the
// DevCenter overview tab. The sibling PM app stays the engineering system of
// record; here we only show life-level state + create رسیدگی tasks.

function relTimeFa(iso) {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} ساعت پیش`;
  return `${Math.round(hours / 24)} روز پیش`;
}

const STATUS_DOT = {
  active: 'bg-emerald-500',
  suspended: 'bg-amber-500',
  gone: 'bg-gray-400',
};

function Tile({ label, value, tone = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function DevProjectsOverview({ embedded = false }) {
  const [data, setData] = useState(null);
  const [lifeProjects, setLifeProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null); // a stale banner must not survive a successful reload
    api
      .get('/dev/overview')
      .then((res) => setData(res.data))
      .catch((e) => setError('خطا در دریافت پروژه‌های توسعه: ' + (e.message || '')))
      .finally(() => setLoading(false));
    api
      .get('/projects')
      .then((res) => setLifeProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const syncNow = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const gh = await api.post('/dev/sync/github');
      const rd = await api.post('/dev/sync/render');
      await api.post('/dev/logs/fetch', {});
      const ghMsg = gh.data?.ok ? `${gh.data.synced} مخزن` : 'گیت‌هاب: ' + (gh.data?.error || 'خطا');
      const rdMsg = rd.data?.ok ? `${rd.data.synced} سرویس` : 'رندر: ' + (rd.data?.error || 'خطا');
      setNotice(`همگام‌سازی انجام شد — ${ghMsg}، ${rdMsg}`);
      load();
    } catch (e) {
      setNotice('همگام‌سازی ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    } finally {
      setSyncing(false);
    }
  };

  const createTask = async (p, reason) => {
    try {
      const payload = reason
        ? { title: `رسیدگی به پروژهٔ ${p.name}`, description: reason }
        : {};
      const res = await api.post(`/dev/projects/${p.id}/create-task`, payload);
      setNotice(`وظیفه ساخته شد: ${res.data?.title || ''}`);
    } catch (e) {
      setNotice('ساخت وظیفه ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    }
  };

  const linkProject = async (p, value) => {
    try {
      const payload = value === '' ? { unlink: true } : { linked_project_id: Number(value) };
      await api.patch(`/dev/projects/${p.id}`, payload);
      load();
    } catch (e) {
      setNotice('پیوند پروژه ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    }
  };

  const projects = (data?.projects || []).filter((p) => showArchived || !p.is_archived);
  const totals = data?.totals || {};
  const attention = data?.needs_attention || [];

  return (
    <div dir="rtl" data-testid="dev-projects-overview">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}
      {notice && (
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 flex justify-between items-center">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-blue-400 hover:text-blue-600">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="text-sm text-gray-500">
          وضعیت زندهٔ مخزن‌ها و سرویس‌های من — همگام با گیت‌هاب و رندر
        </div>
        <div className="flex gap-2">
          <button
            data-testid="dev-sync-now"
            onClick={syncNow}
            disabled={syncing}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? 'در حال همگام‌سازی…' : 'همگام‌سازی اکنون'}
          </button>
          {!embedded && (
            <Link
              to="/dev-center"
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              مرکز توسعه
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" data-testid="dev-totals">
        <Tile label="پروژهٔ فعال" value={totals.active_projects ?? '—'} />
        <Tile label="سرویس فعال" value={totals.services ?? '—'} />
        <Tile
          label="خطا در ۲۴ ساعت"
          value={totals.errors_24h ?? '—'}
          tone={totals.errors_24h > 0 ? 'text-red-600' : 'text-emerald-600'}
        />
        <Tile label="لاگ در ۲۴ ساعت" value={totals.logs_24h ?? '—'} />
      </div>

      {attention.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4" data-testid="dev-attention">
          <h3 className="font-semibold text-amber-800 mb-2">نیازمند رسیدگی</h3>
          <ul className="space-y-2">
            {attention.map((a) => {
              const project = projects.find((p) => p.id === a.dev_project_id);
              return (
                <li key={a.dev_project_id} className="flex items-start justify-between gap-2 text-sm">
                  <div>
                    <span className="font-medium text-amber-900" dir="ltr">{a.name}</span>
                    <span className="text-amber-700"> — {a.reasons.join('؛ ')}</span>
                  </div>
                  {project && (
                    <button
                      onClick={() => createTask(project, a.reasons.join('؛ '))}
                      className="shrink-0 px-2 py-1 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                    >
                      ایجاد وظیفه
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">مخزن‌ها</h3>
        <label className="text-xs text-gray-500 flex items-center gap-1">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          نمایش آرشیوشده‌ها
        </label>
      </div>

      <div className="space-y-3" data-testid="dev-projects-list">
        {loading ? (
          <div className="p-8 text-center text-gray-400">در حال بارگذاری…</div>
        ) : projects.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            هنوز مخزنی همگام نشده. در «مرکز توسعه → تنظیمات» توکن گیت‌هاب/رندر را وارد کن یا
            متغیرهای محیطی را در Render بگذار، بعد «همگام‌سازی اکنون» را بزن.
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={p.html_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      dir="ltr"
                      className="font-semibold text-gray-900 hover:text-blue-600 truncate"
                    >
                      {p.repo_full_name}
                    </a>
                    {p.language && (
                      <span dir="ltr" className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                        {p.language}
                      </span>
                    )}
                    {p.is_private && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">خصوصی</span>
                    )}
                    {p.is_archived && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">آرشیو</span>
                    )}
                  </div>
                  {p.description && (
                    <p dir="ltr" className="text-xs text-gray-500 mt-1 truncate max-w-md text-left">{p.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1.5 flex gap-3 flex-wrap">
                    <span>آخرین push: {relTimeFa(p.pushed_at)}</span>
                    <span className={p.errors_24h > 0 ? 'text-red-600 font-medium' : ''}>
                      خطای ۲۴س: {p.errors_24h}
                    </span>
                    <span>لاگ ۲۴س: {p.logs_24h}</span>
                  </div>
                  {p.services.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {p.services.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-600"
                          title={`وضعیت: ${s.status}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s.status] || 'bg-gray-300'}`} />
                          <span dir="ltr">{s.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {p.today_summary && (
                    <p className="text-sm text-gray-700 mt-2 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                      📝 {p.today_summary}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <select
                    value={p.linked_project_id ?? ''}
                    onChange={(e) => linkProject(p, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 max-w-[180px]"
                    title="پیوند به پروژهٔ زندگی"
                  >
                    <option value="">بدون پیوند به پروژهٔ زندگی</option>
                    {lifeProjects.map((lp) => (
                      <option key={lp.id} value={lp.id}>
                        {lp.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => createTask(p, null)}
                    className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    ایجاد وظیفه
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DevProjectsOverview;
