/**
 * «من که هستم» — پروفایلِ هویتِ مالک.
 *
 * هر فیلد سه چیز نشان می‌دهد: مقدار، **از کجا آمده**، و اینکه خودت قفلش
 * کرده‌ای یا نه. ویرایشِ دستی قفل می‌کند، یعنی استخراجِ خودکارِ فردا
 * حرفِ تو را پاک نمی‌کند — همان قاعده‌ای که در مالی هم هست.
 */
import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

const SOURCE_FA = {
  owner: 'خودت وارد کردی',
  driving_licence: 'گواهینامهٔ رانندگی',
  identity_document: 'مدرک هویتی',
  owner_fact: 'واقعیتِ هویتیِ رمزنگاری‌شده',
  visa_sponsor: 'کفیلِ ویزا',
  location_pattern: 'الگوی مکانی',
  self_model: 'خودمدلی',
  own_lists: 'لیست‌های خودت',
  derived: 'محاسبه‌شده',
};

function Row({ item, onSaved }) {
  const [draft, setDraft] = useState(item.value || '');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setDraft(item.value || ''), [item.value]);

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/identity-profile/${item.field}`, { value: draft });
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  const confidence = item.confidence ? Math.round(item.confidence * 100) : null;

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-800">{item.label}</span>
        <span className="text-xs text-gray-400">
          {item.owner_locked ? '🔒 حرفِ تو' : SOURCE_FA[item.source] || item.source || '—'}
          {confidence !== null && !item.owner_locked ? ` · ${confidence}٪` : ''}
        </span>
      </div>
      <div className="mt-1.5 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          value={draft}
          placeholder={item.askable ? 'هنوز نمی‌دانم — بنویس یا بگذار در تلگرام بپرسم' : 'نامشخص'}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || draft === (item.value || '')}
          onClick={save}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-40"
        >
          ثبت
        </button>
      </div>
      {(item.sources || []).length > 0 ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 text-[11px] text-blue-600 hover:underline"
        >
          {open ? 'بستن' : 'این را از کجا آوردی؟'}
        </button>
      ) : null}
      {open ? (
        <ul className="mt-1 space-y-0.5 text-[11px] text-gray-500">
          {(item.sources || []).map((s, i) => (
            <li key={i}>
              • {s.where}
              {s.id ? ` #${s.id}` : ''}
              {s.raw ? ` — ${String(s.raw).slice(0, 80)}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function IdentityProfile() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .get('/identity-profile')
      .then((res) => setData(res.data))
      .catch(() => setData({ fields: [], known: 0, total: 0 }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (path) => {
    setBusy(true);
    try {
      await api.post(`/identity-profile/${path}`);
      load();
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <div dir="rtl" className="p-6 text-gray-500">در حال بارگذاری…</div>;

  return (
    <div dir="rtl" className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">🪪 من که هستم</h1>
          <p className="text-xs text-gray-500">
            {data.known} از {data.total} مورد از روی داده‌های خودت پیدا شده — بقیه را
            یا اینجا بنویس یا بگذار در تلگرام بپرسم.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => run('refresh')}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
          >
            استخراج دوباره
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run('ask-missing')}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white"
          >
            در تلگرام بپرس
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {(data.fields || []).map((f) => (
          <Row key={f.field} item={f} onSaved={load} />
        ))}
      </ul>
    </div>
  );
}

export default IdentityProfile;
