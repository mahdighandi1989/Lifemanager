import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AISettings from './AISettings';
import Notifications from './Notifications';

// Settings is now a TABBED shell that consolidates the app's configuration:
//   • هوش مصنوعی  → the new AI catalog (AISettings, /api/ai/* catalog endpoints)
//   • اعلان‌ها     → the Notifications page (preferences + inbox)
//   • پیشرفته      → the legacy AI provider/model/context + analysis-prompt config
//
// The legacy tab is KEPT (CLAUDE.md rule 2): the per-user AIProvider/AIModelConfig
// rows it manages still feed the existing analysis pipeline, and it owns the
// editable global analysis prompt — neither is covered by the new catalog. It is
// moved out of the default view (decluttered) rather than deleted.
//
// Deep links: /settings (AI tab), /settings/ai-models (AI tab),
// /settings/notifications (Notifications tab), or ?tab=ai|notifications|advanced.

const TABS = [
  { id: 'ai', label: 'هوش مصنوعی' },
  { id: 'notifications', label: 'اعلان‌ها' },
  { id: 'advanced', label: 'پیشرفته (قدیمی)' },
];
const TAB_IDS = TABS.map((t) => t.id);

// ── Legacy AI config (the previous Settings body, preserved) ──────────────
function LegacyAiSettings() {
  const { token } = useAuth() || {};
  const authHeaders = useCallback(
    (extra = {}) =>
      token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...extra }
        : { 'Content-Type': 'application/json', ...extra },
    [token],
  );

  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [savedPrompt, setSavedPrompt] = useState('');
  const [error, setError] = useState(null);
  const [provForm, setProvForm] = useState({ name: '', description: '' });
  const [modelForm, setModelForm] = useState({ name: '', provider: '', model_name: '' });
  const [contextSettings, setContextSettings] = useState({
    context_type: 'tasks',
    dynamic_response: true,
    token_limit: 0,
  });

  const load = useCallback(async () => {
    try {
      const [p, m, gp] = await Promise.all([
        fetch('/api/ai/providers', { headers: authHeaders() }),
        fetch('/api/ai/configs', { headers: authHeaders() }),
        fetch('/api/ai/global-prompt', { headers: authHeaders() }),
      ]);
      if (p.ok) setProviders(await p.json());
      if (m.ok) setModels(await m.json());
      if (gp.ok) {
        const d = await gp.json();
        setPrompt(d.prompt_text || '');
        setSavedPrompt(d.prompt_text || '');
      }
      setError(null);
    } catch (e) {
      setError('خطا در دریافت تنظیمات: ' + e.message);
    }
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const addProvider = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/ai/providers', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(provForm),
    });
    if (res.ok) { setProvForm({ name: '', description: '' }); load(); }
  };

  const addModel = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/ai/configs', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        ...modelForm,
        context_type: contextSettings.context_type,
        dynamic_response: contextSettings.dynamic_response,
        token_limit: Number(contextSettings.token_limit) || null,
      }),
    });
    if (res.ok) { setModelForm({ name: '', provider: '', model_name: '' }); load(); }
  };

  const deleteModel = async (id) => {
    const res = await fetch(`/api/ai/configs/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) load();
  };

  const savePrompt = async () => {
    const res = await fetch('/api/ai/global-prompt', {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ prompt_text: prompt }),
    });
    if (res.ok) { const d = await res.json(); setSavedPrompt(d.prompt_text ?? prompt); }
  };
  const cancelPrompt = () => setPrompt(savedPrompt);

  return (
    <div className="space-y-8" dir="rtl">
      <p className="text-sm text-gray-500">
        این بخش پیکربندیِ قدیمیِ تحلیل است (ارائه‌دهنده/مدل‌های موتور تحلیل + پرامپت تحلیل).
        برای تنظیمات اصلیِ هوش مصنوعی از تب «هوش مصنوعی» استفاده کن.
      </p>
      {error && (
        <div className="text-red-600 text-sm" data-testid="settings-error">{error}</div>
      )}

      {/* AI Providers (legacy) */}
      <section data-testid="providers-section" className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">مدیریت ارائه‌دهندگان AI (قدیمی)</h2>
        <form onSubmit={addProvider} className="flex flex-wrap gap-2 mb-4" data-testid="provider-form">
          <input
            data-testid="provider-name-input"
            value={provForm.name}
            onChange={(e) => setProvForm({ ...provForm, name: e.target.value })}
            placeholder="نام ارائه‌دهنده (مثلاً Gemini)"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button type="submit" data-testid="add-provider-btn" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
            افزودن
          </button>
        </form>
        <ul data-testid="providers-list" className="divide-y divide-gray-100">
          {providers.length === 0 ? (
            <li className="py-2 text-gray-400 text-sm">ارائه‌دهنده‌ای ثبت نشده</li>
          ) : (
            providers.map((p) => (<li key={p.id} className="py-2 text-sm">{p.name}</li>))
          )}
        </ul>
      </section>

      {/* AI Models (legacy) */}
      <section data-testid="models-section" className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">مدیریت مدل‌های AI (قدیمی)</h2>
        <form onSubmit={addModel} className="flex flex-wrap gap-2 mb-4" data-testid="model-form">
          <input
            data-testid="model-name-input"
            value={modelForm.name}
            onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
            placeholder="نام مدل (مثلاً gpt-4o)"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <select
            data-testid="model-provider-select"
            value={modelForm.provider}
            onChange={(e) => setModelForm({ ...modelForm, provider: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">انتخاب ارائه‌دهنده</option>
            {providers.map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}
          </select>
          <button type="submit" data-testid="add-model-btn" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
            افزودن
          </button>
        </form>
        <ul data-testid="models-list" className="divide-y divide-gray-100">
          {models.length === 0 ? (
            <li className="py-2 text-gray-400 text-sm">مدلی ثبت نشده</li>
          ) : (
            models.map((m) => (
              <li key={m.id} className="py-2 text-sm flex justify-between items-center">
                <span>{m.name}{m.provider ? ` (${m.provider})` : ''}</span>
                <button data-testid={`delete-model-${m.id}`} onClick={() => deleteModel(m.id)} className="text-red-500 text-xs hover:underline">
                  حذف
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* AI Context Settings (legacy) */}
      <section data-testid="ai-context-settings" className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">تنظیمات زمینهٔ هوش مصنوعی</h2>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-gray-700">نوع زمینه</span>
            <select
              data-testid="context-type-select"
              value={contextSettings.context_type}
              onChange={(e) => setContextSettings({ ...contextSettings, context_type: e.target.value })}
              className="mt-1 border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="tasks">تسک‌ها</option>
              <option value="all">همهٔ داده‌ها</option>
              <option value="none">بدون زمینه</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              data-testid="dynamic-response-toggle"
              checked={contextSettings.dynamic_response}
              onChange={(e) => setContextSettings({ ...contextSettings, dynamic_response: e.target.checked })}
            />
            <span className="text-gray-700">پاسخ داینامیک (نه هاردکد)</span>
          </label>
          <label className="block text-sm">
            <span className="text-gray-700">
              حد توکن: {Number(contextSettings.token_limit) === 0 ? 'بدون محدودیت' : contextSettings.token_limit}
            </span>
            <input
              type="range"
              data-testid="token-limit-slider"
              min="0" max="32000" step="1000"
              value={contextSettings.token_limit}
              onChange={(e) => setContextSettings({ ...contextSettings, token_limit: e.target.value })}
              className="mt-1 w-full"
            />
          </label>
          <p className="text-xs text-gray-400">
            این مقادیر هنگام افزودن مدل جدید اعمال می‌شوند. حد توکن صفر یعنی بدون محدودیت.
          </p>
        </div>
      </section>

      {/* Editable analysis prompt box */}
      <section data-testid="analysis-prompt-section" className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">جعبه پرامپت تحلیل</h2>
        <textarea
          data-testid="analysis-prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="پرامپتی که مدل‌ها بر اساس آن داده‌های صفحات شما را تحلیل می‌کنند..."
        />
        <div className="flex gap-2 mt-3">
          <button data-testid="save-prompt-btn" onClick={savePrompt} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
            ذخیره
          </button>
          <button data-testid="cancel-prompt-btn" onClick={cancelPrompt} className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-300">
            لغو
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Tabbed Settings shell ─────────────────────────────────────────────────
function Settings() {
  // Read the initial tab from the URL directly (router-independent so the
  // component renders fine in unit tests without a <Router>).
  const initialTab = (() => {
    try {
      const { pathname, search } = window.location;
      const q = new URLSearchParams(search).get('tab');
      if (q && TAB_IDS.includes(q)) return q;
      if (pathname.endsWith('/notifications')) return 'notifications';
      if (pathname.endsWith('/ai-models')) return 'ai';
    } catch {
      /* SSR / no window — fall through to default */
    }
    return 'ai';
  })();
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="settings-page">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">تنظیمات</h1>

        <div className="flex gap-1 mb-6 border-b border-gray-200" data-testid="settings-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`settings-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div data-testid={`settings-panel-${tab}`}>
          {tab === 'ai' && <AISettings embedded />}
          {tab === 'notifications' && <Notifications embedded />}
          {tab === 'advanced' && <LegacyAiSettings />}
        </div>
      </div>
    </div>
  );
}

export default Settings;
