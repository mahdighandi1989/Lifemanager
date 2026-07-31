/**
 * «پرسش‌های رفعِ ابهام» — همان فرم‌هایی که در تلگرام پرسیده می‌شوند، اینجا هم.
 *
 * چرا در برنامه هم؟ تلگرام مسیرِ اصلی است، ولی اگر پیام گم شود یا تلگرام قطع
 * باشد، ابهام دوباره مغفول می‌مانَد — دقیقاً چیزی که این قابلیت برای حذفش
 * ساخته شد. اینجا کنارِ صندوق ورودی می‌نشیند، چون هر دو یک کار می‌کنند:
 * چیزی که هنوز تصمیمِ مالک را لازم دارد.
 *
 * فیلدها هاردکد نیستند — از سرور می‌آیند و بر اساس `type` رندر می‌شوند، پس
 * هر فرمی که موتور بسازد بدونِ تغییرِ این فایل نمایش داده می‌شود.
 */
import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

function Field({ field, value, onChange }) {
  const common =
    'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none';
  if (field.type === 'choice' && (field.choices || []).length > 0) {
    return (
      <select className={common} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— انتخاب نشده —</option>
        {field.choices.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === 'yesno') {
    return (
      <select className={common} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— بی‌جواب —</option>
        <option value="بله">بله</option>
        <option value="خیر">خیر</option>
      </select>
    );
  }
  if (field.type === 'long') {
    return (
      <textarea
        className={common}
        rows={3}
        value={value}
        placeholder="می‌توانی خالی بگذاری — بعداً دوباره می‌پرسم"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      className={common}
      type={field.type === 'number' ? 'text' : 'text'}
      value={value}
      placeholder={field.type === 'date' ? 'تاریخ' : 'می‌توانی خالی بگذاری'}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function QuestionCard({ item, onDone }) {
  const open = (item.questions || []).filter((q) => !q.answer);
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submit = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/clarifications/${item.id}/answer`, { answers: draft });
      setFeedback(res.data?.feedback || '');
      setDraft({});
      onDone();
    } catch {
      setFeedback('ثبت نشد — دوباره تلاش کن.');
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      await api.post(`/clarifications/${item.id}/skip`);
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="text-sm font-medium text-gray-800">{item.topic}</div>
      {item.context ? (
        <div className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.context}</div>
      ) : null}
      {item.answered_count > 0 ? (
        <div className="mt-1 text-xs text-emerald-700">
          ✅ {item.answered_count} پرسش قبلاً جواب گرفته
        </div>
      ) : null}

      <div className="mt-2 space-y-2">
        {open.map((q) => (
          <div key={q.key}>
            <label className="mb-0.5 block text-xs text-gray-700">
              {q.label}
              {q.why ? <span className="mr-1 text-gray-400"> — {q.why}</span> : null}
            </label>
            <Field
              field={q}
              value={draft[q.key] || ''}
              onChange={(v) => setDraft((d) => ({ ...d, [q.key]: v }))}
            />
          </div>
        ))}
      </div>

      {feedback ? <div className="mt-2 text-xs text-emerald-700">{feedback}</div> : null}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          {busy ? 'در حال ثبت…' : 'ثبت جواب‌ها'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={skip}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600"
        >
          مربوط نیست
        </button>
      </div>
    </li>
  );
}

function OpenQuestionsPanel() {
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    api
      .get('/clarifications')
      .then((res) => setItems(res.data?.items || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = items.filter((i) => (i.questions || []).some((q) => !q.answer));
  if (pending.length === 0) return null;

  return (
    <div dir="rtl" data-testid="open-questions-panel" className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          ❓ پرسش‌های من از تو
          <span className="mr-2 text-xs font-normal text-gray-500">
            ({pending.length} مورد — جوابشان چند جای برنامه را درست می‌کند)
          </span>
        </h3>
        <button
          type="button"
          onClick={() => api.post('/clarifications/resend').then(load).catch(() => {})}
          className="text-xs text-blue-600 hover:underline"
        >
          دوباره در تلگرام بفرست
        </button>
      </div>
      <ul className="space-y-2">
        {pending.map((item) => (
          <QuestionCard key={item.id} item={item} onDone={load} />
        ))}
      </ul>
    </div>
  );
}

export default OpenQuestionsPanel;
