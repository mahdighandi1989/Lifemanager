import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

/**
 * تنظیماتِ «مراقبت و مرور» — the attention engine + weekly review settings.
 *
 * 2026-07-25 tidy-up: these two cards used to be inline in AttentionCenter,
 * i.e. the only place in the app where settings did NOT live under «تنظیمات».
 * They are now ONE component mounted in both places — the control room keeps
 * them where they are useful, and the settings page finally has them too.
 * Nothing was moved away from AttentionCenter (rule 2).
 */

const WEEKDAYS_FA = [
  { value: 0, label: 'دوشنبه' },
  { value: 1, label: 'سه‌شنبه' },
  { value: 2, label: 'چهارشنبه' },
  { value: 3, label: 'پنجشنبه' },
  { value: 4, label: 'جمعه' },
  { value: 5, label: 'شنبه' },
  { value: 6, label: 'یکشنبه' },
];

function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-gray-700">
      <span>{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
          dir="ltr"
        />
        {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </span>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-gray-700 cursor-pointer">
      <span>{label}</span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    </label>
  );
}

// Save must send ONLY the user-editable fields: echoing the whole GET payload
// would also write back the engine's bookkeeping stamps (last_brief_date, …)
// and could re-arm an already-sent brief; blanked number inputs ('' from a
// cleared field) are dropped rather than persisted.
const validNum = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

export function attentionSavePayload(s) {
  return {
    enabled: !!s.enabled,
    brief_enabled: !!s.brief_enabled,
    brief_hour: validNum(s.brief_hour),
    tz_offset_minutes: validNum(s.tz_offset_minutes),
    expiry_days: validNum(s.expiry_days),
    subscription_days: validNum(s.subscription_days),
    inbox_stale_hours: validNum(s.inbox_stale_hours),
  };
}

export function weeklySavePayload(s) {
  return {
    enabled: !!s.enabled,
    weekday: validNum(s.weekday),
    hour: validNum(s.hour),
  };
}

function AttentionSettingsPanel({ onSaved }) {
  const [settings, setSettings] = useState(null);
  const [weeklySettings, setWeeklySettings] = useState(null);
  const [busy, setBusy] = useState('');
  const [flash, setFlash] = useState(null);

  const load = useCallback(async () => {
    try {
      const [setRes, wkRes] = await Promise.all([
        api.get('/attention/settings'),
        api.get('/weekly-review/settings'),
      ]);
      setSettings(setRes.data?.settings || null);
      setWeeklySettings(wkRes.data?.settings || null);
    } catch {
      /* fail-open: the cards show «در حال بارگذاری…» rather than blanking */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (key, fn, okText) => {
    setBusy(key);
    try {
      await fn();
      setFlash({ ok: true, text: okText });
      if (onSaved) onSaved();
    } catch (e) {
      setFlash({ ok: false, text: e?.response?.data?.detail || e.message || 'خطا' });
    } finally {
      setBusy('');
      setTimeout(() => setFlash(null), 5000);
    }
  };

  return (
    <div data-testid="attention-settings-panel">
      {flash && (
        <p
          data-testid="attention-settings-flash"
          className={`mb-3 text-sm ${flash.ok ? 'text-green-600' : 'text-red-600'}`}
        >
          {flash.text}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attention engine settings */}
        <Card
          title="⚙️ تنظیمات موتور توجه"
          action={
            <button
              type="button"
              data-testid="save-attention-settings"
              disabled={busy === 'saveAttention' || !settings}
              onClick={() => act('saveAttention', () => api.put('/attention/settings', attentionSavePayload(settings)), 'ذخیره شد')}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
            >
              ذخیره
            </button>
          }
        >
          {settings ? (
            <div className="space-y-3">
              <Toggle label="موتور توجه فعال باشد" checked={settings.enabled} onChange={(v) => setSettings({ ...settings, enabled: v })} />
              <Toggle label="پیام صبحگاهی فعال باشد" checked={settings.brief_enabled} onChange={(v) => setSettings({ ...settings, brief_enabled: v })} />
              <NumberField label="ساعت پیام صبحگاهی (محلی)" value={settings.brief_hour} min={0} max={23} onChange={(v) => setSettings({ ...settings, brief_hour: v })} />
              <NumberField label="اختلاف با UTC" value={settings.tz_offset_minutes} min={-720} max={840} suffix="دقیقه" onChange={(v) => setSettings({ ...settings, tz_offset_minutes: v })} />
              <NumberField label="افق هشدار انقضای مدارک" value={settings.expiry_days} min={1} max={365} suffix="روز" onChange={(v) => setSettings({ ...settings, expiry_days: v })} />
              <NumberField label="افق موعد پرداخت اشتراک" value={settings.subscription_days} min={1} max={90} suffix="روز" onChange={(v) => setSettings({ ...settings, subscription_days: v })} />
              <NumberField label="آستانهٔ ماندگی صندوق ورودی" value={settings.inbox_stale_hours} min={1} max={720} suffix="ساعت" onChange={(v) => setSettings({ ...settings, inbox_stale_hours: v })} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">در حال بارگذاری…</p>
          )}
        </Card>

        {/* Weekly review settings */}
        <Card
          title="📒 تنظیمات مرور هفتگی"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                data-testid="run-weekly-review"
                disabled={busy === 'runReview'}
                onClick={() => act('runReview', () => api.post('/weekly-review/run'), 'مرور هفتگی ساخته شد')}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy === 'runReview' ? 'در حال تولید…' : 'تولید مرور الان'}
              </button>
              <button
                type="button"
                data-testid="save-weekly-settings"
                disabled={busy === 'saveWeekly' || !weeklySettings}
                onClick={() => act('saveWeekly', () => api.put('/weekly-review/settings', weeklySavePayload(weeklySettings)), 'ذخیره شد')}
                className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                ذخیره
              </button>
            </div>
          }
        >
          {weeklySettings ? (
            <div className="space-y-3">
              <Toggle label="مرور هفتگی خودکار" checked={weeklySettings.enabled} onChange={(v) => setWeeklySettings({ ...weeklySettings, enabled: v })} />
              <label className="flex items-center justify-between gap-2 text-sm text-gray-700">
                <span>روز هفته</span>
                <select
                  value={weeklySettings.weekday}
                  onChange={(e) => setWeeklySettings({ ...weeklySettings, weekday: Number(e.target.value) })}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  {WEEKDAYS_FA.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </label>
              <NumberField label="ساعت (محلی)" value={weeklySettings.hour} min={0} max={23} onChange={(v) => setWeeklySettings({ ...weeklySettings, hour: v })} />
              <p className="text-xs text-gray-400">
                گزارش شامل آمار هفته + تحلیل و سه پیشنهاد هوش مصنوعی است؛ بدون مدلِ فعال، خلاصهٔ آماری ذخیره می‌شود.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">در حال بارگذاری…</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AttentionSettingsPanel;
