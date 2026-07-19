import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import GoogleLifePanel from '../components/GoogleLifePanel';

// Google Drive connection management panel (Settings → «گوگل درایو» tab).
// Mirrors ALLIN1's Drive settings panel: a status grid + Connect / Disconnect /
// Test / Sync buttons. The connect action is a top-level browser navigation to
// the backend OAuth flow (carrying the JWT as ?token=, since a navigation can't
// send an Authorization header); everything else is a normal axios call.
//
// Status shape (GET /api/drive/status):
//   { configured, enabled, connected, account_email, root_folder_id,
//     root_folder_name, subfolders: [] }

function StatusRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-medium ${
          ok === true ? 'text-green-600' : ok === false ? 'text-red-500' : 'text-gray-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DriveSettings({ embedded = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    api
      .get('/drive/status')
      .then((res) => setStatus(res.data))
      .catch((e) => setMsg({ kind: 'error', text: 'خطا در دریافت وضعیت: ' + (e.message || '') }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
    // Surface the redirect result (?drive=connected|error) coming back from the
    // OAuth round-trip, then clean it out of the URL.
    try {
      const params = new URLSearchParams(window.location.search);
      const drive = params.get('drive');
      if (drive === 'connected') {
        setMsg({ kind: 'success', text: 'گوگل درایو با موفقیت متصل شد ✅' });
      } else if (drive === 'error') {
        const reason = params.get('reason') || '';
        setMsg({ kind: 'error', text: 'اتصال ناموفق بود' + (reason ? ` (${reason})` : '') });
      }
    } catch {
      /* no window */
    }
  }, [loadStatus]);

  const connect = () => {
    const token = (() => {
      try {
        return localStorage.getItem('token') || '';
      } catch {
        return '';
      }
    })();
    window.location.assign('/auth/google/drive/connect?token=' + encodeURIComponent(token));
  };

  const act = async (kind, path, okText) => {
    setBusy(kind);
    setMsg(null);
    try {
      const res = await api.post(path);
      const data = res.data || {};
      if (data.ok === false || data.success === false) {
        setMsg({ kind: 'error', text: data.detail || 'عملیات ناموفق بود' });
      } else if (kind !== 'disconnect' && data.connected === false) {
        // ok:true + connected:false = a clean no-op (e.g. sync with a dead
        // token) — showing plain success here hid real breakage.
        setMsg({ kind: 'error', text: data.detail || 'درایو متصل نیست — عملیاتی انجام نشد' });
      } else {
        setMsg({ kind: 'success', text: okText });
      }
      loadStatus();
    } catch (e) {
      const detail = e?.response?.data?.detail || e.message || '';
      setMsg({ kind: 'error', text: 'خطا: ' + detail });
    } finally {
      setBusy('');
    }
  };

  const configured = status?.configured;
  const connected = status?.connected;

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="drive-settings-page">
      <div className="max-w-2xl mx-auto px-4" dir="rtl">
        <h2 className="text-xl font-bold text-gray-900 mb-1">اتصال گوگل</h2>
        <p className="text-gray-500 text-sm mb-5">
          یک اتصال برای همه‌چیز: درایو (پشتیبان‌گیری فایل‌ها)، جیمیل و تقویم (پایش، تحلیل و
          یادآوری). با دکمهٔ «اتصال» همهٔ دسترسی‌ها یک‌جا گرفته می‌شود.
        </p>

        {msg && (
          <div
            data-testid="drive-msg"
            className={`mb-4 rounded-xl p-3 text-sm ${
              msg.kind === 'success'
                ? 'bg-green-50 border border-green-100 text-green-700'
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}
          >
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
              <StatusRow
                label="تنظیمات OAuth"
                value={configured ? 'انجام شده' : 'ناقص (متغیرهای محیطی)'}
                ok={!!configured}
              />
              <StatusRow
                label="وضعیت اتصال"
                value={connected ? 'متصل' : 'متصل نیست'}
                ok={!!connected}
              />
              {status?.account_email && (
                <StatusRow label="حساب گوگل" value={status.account_email} />
              )}
              <StatusRow
                label="پوشه‌ی ریشه"
                value={status?.root_folder_name || 'LifeManagerData'}
              />
              {status?.root_folder_id && (
                <StatusRow label="شناسه‌ی پوشه" value={status.root_folder_id} />
              )}
              {Array.isArray(status?.subfolders) && status.subfolders.length > 0 && (
                <StatusRow label="زیرپوشه‌ها" value={status.subfolders.join('، ')} />
              )}
            </div>

            {!configured && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
                ابتدا باید متغیرهای محیطی <span dir="ltr">GOOGLE_CLIENT_ID</span> و{' '}
                <span dir="ltr">GOOGLE_CLIENT_SECRET</span> و{' '}
                <span dir="ltr">GOOGLE_REDIRECT_URI</span> را در سرور تنظیم کنید.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!connected ? (
                <button
                  data-testid="drive-connect-btn"
                  onClick={connect}
                  disabled={!configured}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  اتصال به گوگل درایو
                </button>
              ) : (
                <>
                  <button
                    data-testid="drive-test-btn"
                    onClick={() => act('test', '/drive/test', 'اتصال سالم است ✅')}
                    disabled={busy === 'test'}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                  >
                    {busy === 'test' ? '...' : 'بررسی اتصال'}
                  </button>
                  <button
                    data-testid="drive-sync-btn"
                    onClick={() => act('sync', '/drive/sync', 'همگام‌سازی انجام شد')}
                    disabled={busy === 'sync'}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {busy === 'sync' ? 'در حال همگام‌سازی...' : 'همگام‌سازی اکنون'}
                  </button>
                  <button
                    data-testid="drive-disconnect-btn"
                    onClick={() => act('disconnect', '/drive/disconnect', 'اتصال قطع شد')}
                    disabled={busy === 'disconnect'}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    {busy === 'disconnect' ? '...' : 'قطع اتصال'}
                  </button>
                </>
              )}
            </div>

            {/* جیمیل و تقویم — same connection, its own panel */}
            <GoogleLifePanel />
          </>
        )}
      </div>
    </div>
  );
}

export default DriveSettings;
