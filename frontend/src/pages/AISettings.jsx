import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AIFeedbackWidget from '../components/AIFeedbackWidget';

// AISettings — the unified "complete AI settings" surface, ported from the
// ALLIN1 design (transforms the previous simple provider/model form). It drives
// the catalog backend:
//   GET  /api/ai/overview                       (providers + models + routes + tasks + caps)
//   PUT  /api/ai/providers/{key}                (enable, set/clear key, base_url, notes)
//   POST /api/ai/providers/{key}/sync-models    (discover live models)
//   POST /api/ai/models                         (add custom model)
//   PUT  /api/ai/models/{id}                    (enable/disable)
//   DELETE /api/ai/models/{id}                  (delete custom)
//   POST /api/ai/models/{id}/test               (live ping)
//   PUT  /api/ai/routes/{task}                  (pin a task to a model / auto)
// The legacy per-user provider/config management still lives in Settings.jsx
// (capability preserved — CLAUDE.md rule 2). Plain fetch + Tailwind, RTL.

function AISettings() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyInputs, setKeyInputs] = useState({});       // {providerKey: "sk-..."}
  const [baseInputs, setBaseInputs] = useState({});     // {providerKey: "https://..."}
  const [tests, setTests] = useState({});               // {modelId: {ok,message,...}}
  const [newModel, setNewModel] = useState({});         // {providerKey: {model_key, display_name}}
  const [busy, setBusy] = useState({});                 // {actionKey: bool}

  const authHeaders = useCallback(
    (extra = {}) => (token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra }),
    [token],
  );
  const jsonHeaders = useCallback(
    () => authHeaders({ 'Content-Type': 'application/json' }),
    [authHeaders],
  );
  const setBusyFor = (k, v) => setBusy((b) => ({ ...b, [k]: v }));

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/overview', { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError('خطا در دریافت تنظیمات هوش مصنوعی: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const putProvider = async (key, body) => {
    setBusyFor(`prov-${key}`, true);
    try {
      const res = await fetch(`/api/ai/providers/${key}`, {
        method: 'PUT', headers: jsonHeaders(), body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError('خطا در ذخیره ارائه‌دهنده: ' + e.message);
    } finally {
      setBusyFor(`prov-${key}`, false);
    }
  };

  const syncModels = async (key) => {
    setBusyFor(`sync-${key}`, true);
    try {
      const res = await fetch(`/api/ai/providers/${key}/sync-models`, {
        method: 'POST', headers: jsonHeaders(),
      });
      const j = await res.json();
      if (!j.ok) setError(j.message || 'همگام‌سازی ناموفق بود');
      await load();
    } catch (e) {
      setError('خطا در همگام‌سازی مدل‌ها: ' + e.message);
    } finally {
      setBusyFor(`sync-${key}`, false);
    }
  };

  const toggleModel = async (id, enabled) => {
    try {
      const res = await fetch(`/api/ai/models/${id}`, {
        method: 'PUT', headers: jsonHeaders(), body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError('خطا در تغییر مدل: ' + e.message);
    }
  };

  const deleteModel = async (id) => {
    try {
      const res = await fetch(`/api/ai/models/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError('خطا در حذف مدل: ' + e.message);
    }
  };

  const testModel = async (id) => {
    setTests((t) => ({ ...t, [id]: { message: 'در حال تست…' } }));
    try {
      const res = await fetch(`/api/ai/models/${id}/test`, { method: 'POST', headers: jsonHeaders() });
      const j = await res.json();
      setTests((t) => ({ ...t, [id]: j }));
    } catch (e) {
      setTests((t) => ({ ...t, [id]: { ok: false, message: 'خطا: ' + e.message } }));
    }
  };

  const addModel = async (providerKey) => {
    const f = newModel[providerKey] || {};
    if (!f.model_key || !f.model_key.trim()) return;
    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({
          model_key: f.model_key.trim(),
          provider_key: providerKey,
          display_name: f.display_name || f.model_key.trim(),
          capabilities: ['text'],
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || `HTTP ${res.status}`);
      }
      setNewModel((n) => ({ ...n, [providerKey]: { model_key: '', display_name: '' } }));
      await load();
    } catch (e) {
      setError('خطا در افزودن مدل: ' + e.message);
    }
  };

  const setRoute = async (task, modelId) => {
    try {
      const res = await fetch(`/api/ai/routes/${task}`, {
        method: 'PUT', headers: jsonHeaders(),
        body: JSON.stringify({ model_id: modelId ? Number(modelId) : 0 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError('خطا در مسیر‌دهی تسک: ' + e.message);
    }
  };

  const capLabel = (id) => {
    const c = (data?.capabilities || []).find((x) => x.id === id);
    return c ? c.label : id;
  };
  const enabledModels = (data?.models || []).filter((m) => m.enabled);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="ai-settings-page" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">تنظیمات هوش مصنوعی</h1>
        <p className="text-gray-500 mb-4">
          ارائه‌دهنده را فعال کن، کلیدش را بگذار، اتصال را تست کن و برای هر قابلیت مدل انتخاب کن.
        </p>

        {/* Status */}
        {data?.status && (
          <div
            data-testid="ai-status"
            className={`mb-4 rounded-xl p-4 text-sm border ${
              data.status.any_available
                ? 'bg-green-50 border-green-100 text-green-700'
                : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}
          >
            {data.status.any_available
              ? `${data.status.usable_model_count} مدل آماده · ${data.status.configured_providers.length} ارائه‌دهنده پیکربندی‌شده`
              : 'هنوز هیچ ارائه‌دهنده‌ای پیکربندی نشده — یک کلید اضافه کن.'}
          </div>
        )}

        <AIFeedbackWidget />

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600" data-testid="ai-error">
            {error}
          </div>
        )}

        {loading && <div className="text-gray-400 text-sm py-6">در حال بارگذاری…</div>}

        {/* Providers */}
        <section className="space-y-4 mb-8" data-testid="providers-list">
          {(data?.providers || []).map((p) => {
            const provModels = (data.models || []).filter((m) => m.provider_key === p.key);
            const nm = newModel[p.key] || { model_key: '', display_name: '' };
            return (
              <div
                key={p.key}
                data-testid={`provider-card-${p.key}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{p.display_name}</h2>
                    {p.recommended && (
                      <span className="text-[11px] bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">پیشنهادی</span>
                    )}
                    {p.auth_scheme === 'oauth_bearer' && (
                      <span className="text-[11px] bg-purple-50 text-purple-600 rounded px-2 py-0.5">توکن اشتراک</span>
                    )}
                    <span className={`text-[11px] rounded px-2 py-0.5 ${
                      p.configured ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.configured ? '🔑 کلید موجود' : 'بدون کلید'}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      data-testid={`provider-enabled-${p.key}`}
                      checked={p.enabled}
                      disabled={busy[`prov-${p.key}`]}
                      onChange={(e) => putProvider(p.key, { enabled: e.target.checked })}
                    />
                    فعال
                  </label>
                </div>
                {p.notes && <p className="text-xs text-gray-400 mb-3">{p.notes}</p>}

                {/* Key + base_url */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <input
                    type="password"
                    data-testid={`provider-key-input-${p.key}`}
                    className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder={p.has_api_key ? `کلید فعلی: ${p.api_key_masked || '••••'}` : 'کلید API'}
                    value={keyInputs[p.key] || ''}
                    onChange={(e) => setKeyInputs((s) => ({ ...s, [p.key]: e.target.value }))}
                  />
                  <button
                    data-testid={`provider-save-key-${p.key}`}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                    disabled={!keyInputs[p.key] || busy[`prov-${p.key}`]}
                    onClick={() => { putProvider(p.key, { api_key: keyInputs[p.key], enabled: true }); setKeyInputs((s) => ({ ...s, [p.key]: '' })); }}
                  >
                    ذخیره کلید
                  </button>
                  {p.has_api_key && (
                    <button
                      className="text-red-600 text-sm px-2 hover:underline"
                      onClick={() => putProvider(p.key, { api_key: '' })}
                    >
                      پاک‌کردن کلید
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder={`Base URL (پیش‌فرض: ${p.base_url || '—'})`}
                    value={baseInputs[p.key] ?? ''}
                    onChange={(e) => setBaseInputs((s) => ({ ...s, [p.key]: e.target.value }))}
                  />
                  <button
                    className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
                    disabled={busy[`prov-${p.key}`]}
                    onClick={() => putProvider(p.key, { base_url: baseInputs[p.key] || '' })}
                  >
                    ذخیره Base URL
                  </button>
                  <button
                    data-testid={`provider-sync-${p.key}`}
                    className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
                    disabled={busy[`sync-${p.key}`]}
                    onClick={() => syncModels(p.key)}
                  >
                    {busy[`sync-${p.key}`] ? 'در حال همگام‌سازی…' : 'دریافت مدل‌ها از ارائه‌دهنده'}
                  </button>
                </div>

                {/* Models */}
                <h3 className="text-sm font-semibold text-gray-700 mb-2">مدل‌ها</h3>
                <ul className="divide-y divide-gray-100 mb-3">
                  {provModels.length === 0 ? (
                    <li className="text-xs text-gray-400 py-2">مدلی نیست — یک مدل سفارشی اضافه کن یا همگام‌سازی کن.</li>
                  ) : provModels.map((m) => (
                    <li key={m.id} data-testid={`model-row-${m.id}`} className="py-2 flex flex-wrap items-center gap-2 text-sm">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={m.enabled} onChange={(e) => toggleModel(m.id, e.target.checked)} />
                        <span className="text-gray-800">{m.display_name}</span>
                      </label>
                      {m.is_custom && <span className="text-[10px] bg-amber-50 text-amber-600 rounded px-1.5">سفارشی</span>}
                      {m.source === 'discovered' && <span className="text-[10px] bg-sky-50 text-sky-600 rounded px-1.5">کشف‌شده</span>}
                      <span className="flex gap-1 flex-wrap">
                        {(m.capabilities || []).map((c) => (
                          <span key={c} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{capLabel(c)}</span>
                        ))}
                      </span>
                      <span className="flex-1" />
                      {tests[m.id] && (
                        <span className={`text-[11px] ${tests[m.id].ok ? 'text-green-600' : 'text-red-500'}`} data-testid={`model-test-result-${m.id}`}>
                          {tests[m.id].message}
                        </span>
                      )}
                      <button data-testid={`model-test-${m.id}`} className="text-xs text-indigo-600 hover:underline" onClick={() => testModel(m.id)}>تست</button>
                      {m.is_custom && (
                        <button className="text-xs text-red-600 hover:underline" onClick={() => deleteModel(m.id)}>حذف</button>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Add custom model */}
                <div className="flex flex-wrap gap-2">
                  <input
                    data-testid={`add-model-key-${p.key}`}
                    className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="شناسه مدل (مثلاً gpt-4o)"
                    value={nm.model_key}
                    onChange={(e) => setNewModel((n) => ({ ...n, [p.key]: { ...nm, model_key: e.target.value } }))}
                  />
                  <input
                    className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="نام نمایشی (اختیاری)"
                    value={nm.display_name}
                    onChange={(e) => setNewModel((n) => ({ ...n, [p.key]: { ...nm, display_name: e.target.value } }))}
                  />
                  <button
                    data-testid={`add-model-btn-${p.key}`}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700"
                    onClick={() => addModel(p.key)}
                  >
                    افزودن مدل سفارشی
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Task routing */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="task-routing">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">مسیر‌دهی تسک‌ها</h2>
          <p className="text-xs text-gray-400 mb-4">برای هر قابلیت یک مدل پین کن، یا «خودکار» بگذار تا بهترین مدل انتخاب شود.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data?.tasks || []).map((t) => {
              const route = (data.routes || []).find((r) => r.task === t.id);
              return (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">{t.label}</div>
                    <div className="text-[11px] text-gray-400">{t.description}</div>
                  </div>
                  <select
                    data-testid={`route-select-${t.id}`}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm min-w-[160px]"
                    value={route?.model_id || ''}
                    onChange={(e) => setRoute(t.id, e.target.value)}
                  >
                    <option value="">خودکار ({capLabel(t.preferred)})</option>
                    {enabledModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.display_name} ({m.provider_key})</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AISettings;
