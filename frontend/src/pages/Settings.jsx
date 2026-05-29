import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Settings page (audit task 1a08ded2). Three sections, all backed by the
// existing AI surface (dual-mounted under /api):
//   GET/POST           /api/ai/providers      — AI providers management
//   GET/POST/DELETE    /api/ai/configs        — AI models (provider select)
//   GET/PUT            /api/ai/global-prompt   — editable analysis prompt box
function Settings() {
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

  useEffect(() => {
    load();
  }, [load]);

  const addProvider = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/ai/providers', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(provForm),
    });
    if (res.ok) {
      setProvForm({ name: '', description: '' });
      load();
    }
  };

  const addModel = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/ai/configs', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(modelForm),
    });
    if (res.ok) {
      setModelForm({ name: '', provider: '', model_name: '' });
      load();
    }
  };

  const deleteModel = async (id) => {
    const res = await fetch(`/api/ai/configs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) load();
  };

  const savePrompt = async () => {
    const res = await fetch('/api/ai/global-prompt', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ prompt_text: prompt }),
    });
    if (res.ok) {
      const d = await res.json();
      setSavedPrompt(d.prompt_text ?? prompt);
    }
  };

  const cancelPrompt = () => setPrompt(savedPrompt);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="settings-page">
      <div className="max-w-4xl mx-auto px-4 space-y-8" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900">تنظیمات</h1>
        {error && (
          <div className="text-red-600 text-sm" data-testid="settings-error">
            {error}
          </div>
        )}

        {/* AI Providers */}
        <section data-testid="providers-section" className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3">مدیریت ارائه‌دهندگان AI</h2>
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
              providers.map((p) => (
                <li key={p.id} className="py-2 text-sm">
                  {p.name}
                </li>
              ))
            )}
          </ul>
        </section>

        {/* AI Models */}
        <section data-testid="models-section" className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3">مدیریت مدل‌های AI</h2>
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
              {providers.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
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
                  <span>
                    {m.name}
                    {m.provider ? ` (${m.provider})` : ''}
                  </span>
                  <button
                    data-testid={`delete-model-${m.id}`}
                    onClick={() => deleteModel(m.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    حذف
                  </button>
                </li>
              ))
            )}
          </ul>
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
    </div>
  );
}

export default Settings;
