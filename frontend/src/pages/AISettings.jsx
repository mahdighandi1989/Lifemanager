import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// AI settings page (audit task 1a08ded2, AC4): view / add AI providers and
// model configs. Talks to the existing backend surface:
//   GET/POST  /api/ai/providers   (user-scoped)
//   GET/POST  /api/ai/configs     (requires the bearer token)
// Kept deliberately dependency-light (plain fetch + Tailwind) to match the
// rest of frontend/src/pages.

function AISettings() {
  const { token } = useAuth();
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);
  const [provForm, setProvForm] = useState({ name: '', description: '' });
  const [modelForm, setModelForm] = useState({ name: '', provider: '', model_name: '' });

  const authHeaders = useCallback(
    (extra = {}) => (token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra }),
    [token],
  );

  const load = useCallback(async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/ai/providers', { headers: authHeaders() }),
        fetch('/api/ai/configs', { headers: authHeaders() }),
      ]);
      if (pRes.ok) setProviders(await pRes.json());
      if (mRes.ok) setModels(await mRes.json());
      setError(null);
    } catch (e) {
      setError('خطا در دریافت تنظیمات هوش مصنوعی: ' + e.message);
    }
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const addProvider = async (e) => {
    e.preventDefault();
    if (!provForm.name.trim()) return;
    try {
      const res = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(provForm),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProvForm({ name: '', description: '' });
      await load();
    } catch (e) {
      setError('خطا در افزودن ارائه‌دهنده: ' + e.message);
    }
  };

  const addModel = async (e) => {
    e.preventDefault();
    if (!modelForm.name.trim() || !modelForm.provider.trim()) return;
    try {
      const res = await fetch('/api/ai/configs', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...modelForm, model_name: modelForm.model_name || modelForm.name }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setModelForm({ name: '', provider: '', model_name: '' });
      await load();
    } catch (e) {
      setError('خطا در افزودن مدل: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="ai-settings-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">تنظیمات هوش مصنوعی</h1>
        <p className="text-gray-500 mb-6">مدیریت ارائه‌دهندگان و مدل‌های هوش مصنوعی.</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {/* Providers */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">ارائه‌دهندگان</h2>
          <form onSubmit={addProvider} className="flex flex-wrap gap-2 mb-4" data-testid="provider-form">
            <input
              data-testid="provider-name-input"
              className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="نام ارائه‌دهنده"
              value={provForm.name}
              onChange={(e) => setProvForm({ ...provForm, name: e.target.value })}
            />
            <input
              className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="توضیح (اختیاری)"
              value={provForm.description}
              onChange={(e) => setProvForm({ ...provForm, description: e.target.value })}
            />
            <button type="submit" data-testid="add-provider-btn" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
              افزودن
            </button>
          </form>
          <ul data-testid="providers-list" className="divide-y divide-gray-100">
            {providers.length === 0 ? (
              <li className="text-sm text-gray-400 py-2">هنوز ارائه‌دهنده‌ای ثبت نشده.</li>
            ) : (
              providers.map((p) => (
                <li key={p.id} className="py-2 text-sm text-gray-700 flex justify-between">
                  <span>{p.name}</span>
                  <span className={p.is_enabled ? 'text-green-600' : 'text-gray-400'}>
                    {p.is_enabled ? 'فعال' : 'غیرفعال'}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Model configs */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">مدل‌ها</h2>
          <form onSubmit={addModel} className="flex flex-wrap gap-2 mb-4" data-testid="model-form">
            <input
              data-testid="model-name-input"
              className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="نام مدل"
              value={modelForm.name}
              onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
            />
            <input
              data-testid="model-provider-input"
              className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="ارائه‌دهنده"
              value={modelForm.provider}
              onChange={(e) => setModelForm({ ...modelForm, provider: e.target.value })}
            />
            <button type="submit" data-testid="add-model-btn" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
              افزودن
            </button>
          </form>
          <ul data-testid="models-list" className="divide-y divide-gray-100">
            {models.length === 0 ? (
              <li className="text-sm text-gray-400 py-2">هنوز مدلی ثبت نشده.</li>
            ) : (
              models.map((m) => (
                <li key={m.id} className="py-2 text-sm text-gray-700 flex justify-between">
                  <span>{m.name}</span>
                  <span className="text-gray-400">{m.provider}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AISettings;
