/**
 * FinanceGuardsPanel — دو نگهبانِ دقتِ «مالی» (2026-07-30):
 *
 *  ۱) «حساب‌های من» (allow-list): وقتی حداقل یک مورد ثبت شود، ماشین فقط برای
 *     همین حساب‌ها کارتِ خودکار می‌سازد — سیگنالِ ناشناس دیگر کارت نمی‌شود.
 *     خالی = رفتار قبلی (سخت‌گیریِ عمومی).
 *  ۲) «کارت‌های حذف‌شده» (tombstones): هر کارتی که با «✖ این حساب من نیست»
 *     حذف شود این‌جا می‌ماند و دیگر هرگز خودکار ساخته نمی‌شود؛ دکمهٔ
 *     «بازگردانی» سنگ قبر را برمی‌دارد تا سوییپ بعدی از روی فایل‌ها بسازدش.
 */
import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

function FinanceGuardsPanel({ onChanged }) {
  const [ownerAccounts, setOwnerAccounts] = useState([]);
  const [tombstones, setTombstones] = useState([]);
  const [form, setForm] = useState({ institution: '', account_ref: '', iban: '', label: '' });
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    api
      .get('/finance/owner-accounts')
      .then((r) => setOwnerAccounts(r.data?.accounts || []))
      .catch(() => {});
    api
      .get('/finance/tombstones')
      .then((r) => setTombstones(r.data?.tombstones || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addOwnerAccount = async (e) => {
    e.preventDefault();
    if (!form.institution.trim() && !form.account_ref.trim() && !form.iban.trim()) return;
    try {
      const r = await api.post('/finance/owner-accounts', { action: 'add', ...form });
      setOwnerAccounts(r.data?.accounts || []);
      setForm({ institution: '', account_ref: '', iban: '', label: '' });
      setMsg('حساب به فهرست «حساب‌های من» اضافه شد.');
    } catch {
      setMsg('افزودن ناموفق بود.');
    }
  };

  const removeOwnerAccount = async (index) => {
    try {
      const r = await api.post('/finance/owner-accounts', { action: 'remove', index });
      setOwnerAccounts(r.data?.accounts || []);
    } catch {
      setMsg('حذف ناموفق بود.');
    }
  };

  const clearTombstone = async (index) => {
    try {
      await api.post('/finance/tombstones/clear', { index });
      setMsg('بازگردانی شد — سوییپ بعدی می‌تواند این کارت را از روی فایل‌ها بسازد.');
      load();
      if (onChanged) onChanged();
    } catch {
      setMsg('بازگردانی ناموفق بود.');
    }
  };

  return (
    <div dir="rtl" data-testid="finance-guards-panel" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-4">
      <h3 className="text-base font-semibold text-gray-900 mb-1">نگهبان دقتِ حساب‌ها</h3>
      <p className="text-xs text-gray-500 mb-3">
        «حساب‌های من» را ثبت کن تا ماشین فقط برای همان‌ها کارت بسازد؛ کارت‌های حذف‌شده هم دیگر خودکار برنمی‌گردند.
      </p>

      {msg && <p className="text-xs text-blue-600 mb-2" data-testid="finance-guards-msg">{msg}</p>}

      {/* حساب‌های من */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">حساب‌های من (فهرست مجاز)</h4>
        {ownerAccounts.length === 0 && (
          <p className="text-xs text-gray-400 mb-2">
            هنوز خالی است — یعنی محدودیتی اعمال نمی‌شود. اولین حساب را که ثبت کنی، کارت‌سازی خودکار فقط برای حساب‌های این فهرست انجام می‌شود.
          </p>
        )}
        <ul className="space-y-1 mb-2">
          {ownerAccounts.map((a, i) => (
            <li key={`${a.institution}-${a.account_ref}-${a.iban}-${i}`} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1.5">
              <span>
                {a.label || a.institution || 'حساب'}
                {a.institution && <span className="text-gray-400 mx-1" dir="ltr">{a.institution}</span>}
                {a.account_ref && <span className="text-gray-400 mx-1" dir="ltr">{a.account_ref}</span>}
                {a.iban && <span className="text-gray-400 mx-1 font-mono" dir="ltr">{a.iban}</span>}
              </span>
              <button type="button" className="text-red-400 hover:text-red-600" onClick={() => removeOwnerAccount(i)} data-testid={`owner-account-remove-${i}`}>
                حذف
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addOwnerAccount} className="flex flex-wrap gap-1.5 items-center">
          <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="بانک (مثلاً fab)" className="border border-gray-200 rounded px-2 py-1 text-xs w-28" data-testid="owner-account-institution" />
          <input value={form.account_ref} onChange={(e) => setForm({ ...form, account_ref: e.target.value })} placeholder="۴ رقم آخر" dir="ltr" className="border border-gray-200 rounded px-2 py-1 text-xs w-20" />
          <input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="IBAN (اختیاری)" dir="ltr" className="border border-gray-200 rounded px-2 py-1 text-xs w-44 font-mono" />
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="نام دلخواه" className="border border-gray-200 rounded px-2 py-1 text-xs w-28" />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1 text-xs" data-testid="owner-account-add">
            افزودن
          </button>
        </form>
      </div>

      {/* کارت‌های حذف‌شده */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">کارت‌های حذف‌شده (دیگر خودکار ساخته نمی‌شوند)</h4>
        {tombstones.length === 0 ? (
          <p className="text-xs text-gray-400">هیچ کارتی حذف نشده.</p>
        ) : (
          <ul className="space-y-1">
            {tombstones.map((t, i) => (
              <li key={`${t.name}-${i}`} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1.5" data-testid={`finance-tombstone-${i}`}>
                <span>
                  {t.name || t.institution || 'کارت'}
                  {t.account_ref && <span className="text-gray-400 mx-1" dir="ltr">{t.account_ref}</span>}
                </span>
                <button type="button" className="text-emerald-600 hover:text-emerald-800" onClick={() => clearTombstone(i)} data-testid={`finance-tombstone-clear-${i}`}>
                  بازگردانی
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FinanceGuardsPanel;
