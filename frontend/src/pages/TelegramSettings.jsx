import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// Telegram bot management panel (Settings → «تلگرام» tab).
//
// The bidirectional bot is configured via backend env vars (TELEGRAM_BOT_TOKEN /
// TELEGRAM_CHAT_ID / BACKEND_PUBLIC_URL) — this panel never sees the token. It
// surfaces the live status and gives the owner the one-click actions they need
// after a deploy: register the webhook with Telegram, heal it, send a test
// message, or unregister it.
//
// Status shape (GET /api/telegram/status):
//   { configured, has_bot_token, has_chat_id, public_url, expected_webhook_url,
//     webhook: { url, pending_update_count, last_error_message } | { error } }

function StatusRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span
        dir="ltr"
        className={`text-sm font-medium text-left break-all ${
          ok === true ? 'text-green-600' : ok === false ? 'text-red-500' : 'text-gray-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TelegramSettings({ embedded = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    api
      .get('/telegram/status')
      .then((res) => setStatus(res.data))
      .catch((e) => setMsg({ kind: 'error', text: 'خطا در دریافت وضعیت: ' + (e.message || '') }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const act = async (key, fn, okText) => {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fn();
      const ok = res?.data?.ok !== false && !res?.data?.error;
      setMsg({ kind: ok ? 'success' : 'error', text: ok ? okText : (res?.data?.error || 'ناموفق') });
      loadStatus();
    } catch (e) {
      setMsg({ kind: 'error', text: 'خطا: ' + (e.message || '') });
    } finally {
      setBusy('');
    }
  };

  const setWebhook = () => act('set', () => api.post('/telegram/set-webhook', {}), 'webhook با موفقیت ثبت شد ✅');
  const healWebhook = () => act('heal', () => api.post('/telegram/heal-webhook'), 'ترمیم انجام شد ✅');
  const deleteWebhook = () => act('del', () => api.post('/telegram/delete-webhook'), 'webhook حذف شد');
  const sendTest = () => act('test', () => api.post('/telegram/test', {}), 'پیام تست ارسال شد ✅');

  const wh = status?.webhook || {};

  return (
    <div dir="rtl" className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'}>
      <div className={embedded ? '' : 'max-w-2xl mx-auto px-4'}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">ربات تلگرام (دوطرفه)</h2>
          <p className="text-sm text-gray-500 mb-4">
            ربات هم اعلان‌ها را به تلگرام می‌فرستد و هم به دستورها و دکمه‌ها پاسخ می‌دهد
            (<span dir="ltr">/tasks، /new_task، /status، /menu</span>).
          </p>

          {msg && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                msg.kind === 'success'
                  ? 'bg-green-50 border border-green-100 text-green-700'
                  : 'bg-red-50 border border-red-100 text-red-600'
              }`}
            >
              {msg.text}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-gray-400">در حال بارگذاری...</div>
          ) : (
            <>
              <div className="mb-4">
                <StatusRow
                  label="پیکربندی‌شده"
                  value={status?.configured ? 'بله' : 'خیر'}
                  ok={!!status?.configured}
                />
                <StatusRow label="توکن ربات" value={status?.has_bot_token ? 'تنظیم‌شده' : 'تنظیم‌نشده'} ok={!!status?.has_bot_token} />
                <StatusRow label="شناسهٔ چت" value={status?.has_chat_id ? 'تنظیم‌شده' : 'تنظیم‌نشده'} ok={!!status?.has_chat_id} />
                <StatusRow label="آدرس بک‌اند" value={status?.public_url || '—'} ok={status?.public_url ? true : false} />
                <StatusRow label="آدرس webhook موردانتظار" value={status?.expected_webhook_url || '—'} />
                <StatusRow
                  label="webhook فعلی تلگرام"
                  value={wh.error ? `خطا: ${wh.error}` : (wh.url || '(ثبت‌نشده)')}
                  ok={wh.error ? false : !!wh.url}
                />
                {!wh.error && (
                  <>
                    <StatusRow label="پیام‌های در صف" value={String(wh.pending_update_count ?? 0)} />
                    {wh.last_error_message ? (
                      <StatusRow label="آخرین خطای تحویل" value={wh.last_error_message} ok={false} />
                    ) : null}
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={setWebhook}
                  disabled={!!busy || !status?.has_bot_token}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {busy === 'set' ? '...' : 'ثبت webhook'}
                </button>
                <button
                  onClick={healWebhook}
                  disabled={!!busy || !status?.has_bot_token}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  {busy === 'heal' ? '...' : 'ترمیم webhook'}
                </button>
                <button
                  onClick={sendTest}
                  disabled={!!busy || !status?.configured}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {busy === 'test' ? '...' : 'ارسال پیام تست'}
                </button>
                <button
                  onClick={deleteWebhook}
                  disabled={!!busy || !status?.has_bot_token}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {busy === 'del' ? '...' : 'حذف webhook'}
                </button>
              </div>

              <div className="mt-5 rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-xs text-gray-600 leading-6">
                <p className="font-medium text-gray-700 mb-1">راه‌اندازی (یک‌بار):</p>
                <p dir="rtl">
                  ۱) از <span dir="ltr">@BotFather</span> یک ربات بساز و
                  <span dir="ltr"> TELEGRAM_BOT_TOKEN</span> را در تنظیمات Render قرار بده.
                </p>
                <p dir="rtl">
                  ۲) به ربات یک پیام بده و <span dir="ltr">/diag</span> بزن تا
                  <span dir="ltr"> chat_id</span> را ببینی؛ آن را در
                  <span dir="ltr"> TELEGRAM_CHAT_ID</span> بگذار.
                </p>
                <p dir="rtl">
                  ۳) <span dir="ltr">BACKEND_PUBLIC_URL</span> را روی آدرس عمومی بک‌اند تنظیم کن،
                  سپس همین‌جا «ثبت webhook» را بزن (یا منتظر ترمیم خودکار هر ۵ دقیقه بمان).
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TelegramSettings;
