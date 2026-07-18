import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

// تنظیمات مرکز توسعه — the ONE shared component for dev tokens + engine
// config. Rendered in TWO places (dual-mount, owner request «تنظیمات یکی
// باشه»): the main /settings page («مرکز توسعه» tab) and DevCenter's own
// تنظیمات tab. Both stay in sync automatically because they are this file.

const PROVIDER_META = {
  github: {
    title: 'گیت‌هاب',
    envHint: 'GITHUB_TOKEN (یا GH_TOKEN)',
    desc: 'برای همگام‌سازی مخزن‌ها. یک Personal Access Token با scope repo کافی است.',
  },
  render: {
    title: 'رندر',
    envHint: 'RENDER_API_KEY',
    desc: 'برای فهرست سرویس‌ها و دریافت لاگ‌ها. از Render → Account Settings → API Keys بساز.',
  },
};

function DevSyncSettings({ showCenterLink = false }) {
  const [integrations, setIntegrations] = useState(null);
  const [settings, setSettings] = useState(null);
  const [tokenInputs, setTokenInputs] = useState({ github: '', render: '' });
  const [notice, setNotice] = useState(null);
  const [testResult, setTestResult] = useState({});

  const load = useCallback(() => {
    api.get('/dev/integrations').then((res) => setIntegrations(res.data)).catch(() => {});
    api.get('/dev/settings').then((res) => setSettings(res.data?.settings || null)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveToken = async (provider, clear = false) => {
    try {
      await api.put(`/dev/integrations/${provider}`, {
        api_key: clear ? '' : tokenInputs[provider],
      });
      setTokenInputs((t) => ({ ...t, [provider]: '' }));
      setNotice(clear ? 'کلید پاک شد.' : 'کلید ذخیره شد (رمزنگاری‌شده).');
      load();
    } catch (e) {
      setNotice('ذخیرهٔ کلید ناموفق: ' + (e.response?.data?.detail?.[0]?.msg || e.response?.data?.detail || e.message || ''));
    }
  };

  const testConnection = async (provider) => {
    setTestResult((r) => ({ ...r, [provider]: { pending: true } }));
    try {
      const res = await api.post(`/dev/integrations/${provider}/test`);
      setTestResult((r) => ({ ...r, [provider]: res.data }));
    } catch (e) {
      setTestResult((r) => ({ ...r, [provider]: { ok: false, error: e.message } }));
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const payload = {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'boolean') payload[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) payload[key] = value;
      // stamps / strings are never sent back (settings-echo lesson)
    }
    try {
      const res = await api.put('/dev/settings', payload);
      setSettings(res.data?.settings || settings);
      setNotice('تنظیمات ذخیره شد.');
    } catch (e) {
      setNotice('ذخیرهٔ تنظیمات ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    }
  };

  const setNum = (key, raw) => {
    const value = raw === '' ? '' : Number(raw);
    setSettings((s) => ({ ...s, [key]: value === '' ? '' : value }));
  };

  const numField = (key, label, hint) => (
    <label className="block text-sm" key={key}>
      <span className="text-gray-600">{label}</span>
      <input
        type="number"
        value={settings?.[key] ?? ''}
        onChange={(e) => setNum(key, e.target.value)}
        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
      />
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );

  return (
    <div data-testid="dev-settings-tab" dir="rtl">
      {showCenterLink && (
        <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm text-indigo-700 flex items-center justify-between flex-wrap gap-2">
          <span>این‌ها تنظیمات «مرکز توسعه» است — لاگ زنده، آمار، خطاها و کارنامهٔ روزانه را آن‌جا ببین.</span>
          <Link
            to="/dev-center"
            className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            رفتن به مرکز توسعه
          </Link>
        </div>
      )}
      {notice && (
        <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-sm text-blue-700 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-blue-400">✕</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {['github', 'render'].map((provider) => {
          const st = integrations?.[provider] || {};
          const meta = PROVIDER_META[provider];
          const test = testResult[provider];
          return (
            <div key={provider} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800">کلید {meta.title}</h3>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    st.source ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {st.source === 'db' ? 'ذخیره در برنامه' : st.source === 'env' ? 'از متغیر محیطی' : 'تنظیم نشده'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{meta.desc}</p>
              <div className="text-[11px] text-gray-400 mb-2" dir="rtl">
                راه ساده‌تر: در Render متغیر محیطی{' '}
                <code dir="ltr" className="bg-gray-100 px-1 rounded">{meta.envHint}</code> را بگذار — بدون نیاز به این فرم.
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  dir="ltr"
                  value={tokenInputs[provider]}
                  onChange={(e) => setTokenInputs((t) => ({ ...t, [provider]: e.target.value }))}
                  placeholder={st.has_api_key ? '•••••••• (کلید ذخیره شده)' : 'توکن را اینجا بچسبان'}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => saveToken(provider)}
                  disabled={!tokenInputs[provider]}
                  className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white disabled:opacity-40"
                >
                  ذخیره
                </button>
              </div>
              <div className="flex gap-2 mt-2 items-center flex-wrap">
                <button
                  onClick={() => testConnection(provider)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  بررسی اتصال
                </button>
                {st.has_api_key && (
                  <button
                    onClick={() => saveToken(provider, true)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    پاک کردن کلید
                  </button>
                )}
                {test && !test.pending && (
                  <span className={`text-xs ${test.ok ? 'text-emerald-600' : 'text-red-600'}`} dir="rtl">
                    {test.ok
                      ? `✓ متصل${test.login || test.owner ? ' — ' : ''}${test.login || test.owner || ''}`
                      : `✗ ${test.detail || test.error || 'ناموفق'}`}
                  </span>
                )}
                {test?.pending && <span className="text-xs text-gray-400">در حال بررسی…</span>}
              </div>
              {st.last_sync_at && (
                <div className="text-[11px] text-gray-400 mt-2">
                  آخرین همگام‌سازی: <span dir="ltr">{st.last_sync_at.slice(0, 19).replace('T', ' ')}</span>
                  {st.last_sync_ok === false && (
                    <span className="text-red-500"> — ناموفق: <span dir="ltr">{st.last_sync_error}</span></span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {settings && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">موتور همگام‌سازی</h3>
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!settings.enabled}
                onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
              />
              فعال
            </label>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {numField('repo_sync_interval_minutes', 'فاصلهٔ همگام‌سازی مخزن‌ها (دقیقه)')}
            {numField('service_sync_interval_minutes', 'فاصلهٔ همگام‌سازی سرویس‌ها (دقیقه)')}
            {numField('log_poll_seconds', 'فاصلهٔ دریافت لاگ در پس‌زمینه (ثانیه)')}
            {numField('retention_hours', 'نگهداری لاگ خام (ساعت)', 'قدیمی‌ترها حذف می‌شوند؛ کارنامه و خطاها می‌مانند')}
            {numField('summary_hour', 'ساعت تولید کارنامهٔ شبانه (محلی)')}
            {numField('error_attention_threshold', 'آستانهٔ خطا برای «نیازمند رسیدگی»')}
            {numField('error_resolve_hours', 'ساعت سکوت خطا تا «رفع‌شده» شدن خودکار')}
            {numField('stale_repo_days', 'آستانهٔ رکود مخزن (روز)')}
            {numField('tz_offset_minutes', 'اختلاف منطقهٔ زمانی (دقیقه)', 'مثلاً ۲۴۰ برای امارات')}
          </div>
          <label className="text-sm flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={!!settings.summary_enabled}
              onChange={(e) => setSettings((s) => ({ ...s, summary_enabled: e.target.checked }))}
            />
            تولید خودکار کارنامهٔ شبانه
          </label>
          <div className="mt-4">
            <button
              onClick={saveSettings}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              ذخیرهٔ تنظیمات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevSyncSettings;
