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
  const answered = (item.questions || []).filter((q) => q.answer);
  const [draft, setDraft] = useState({});
  const [edits, setEdits] = useState({});
  const [showAnswered, setShowAnswered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  // پرسشِ متقابل: «خودم دربارهٔ این سؤال، سؤال دارم». نخ نگه داشته می‌شود و
  // پرسش‌های اصلی سرِ جایشان می‌مانند — همان قراردادِ تلگرام.
  const [thread, setThread] = useState(item.discussion || []);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      let last = '';
      // ویرایشِ جوابِ قبلی و جوابِ تازه دو مسیرِ جدا دارند: ویرایش مقدارِ
      // ثبت‌شده در سیستم را هم اصلاح می‌کند، نه فقط متنِ فرم را.
      const changed = Object.fromEntries(
        Object.entries(edits).filter(([k, v]) => {
          const q = answered.find((a) => a.key === k);
          return q && String(v) !== String(q.answer);
        }),
      );
      if (Object.keys(changed).length > 0) {
        const res = await api.post(`/clarifications/${item.id}/edit`, { answers: changed });
        last = `✏️ ${res.data?.edited || 0} جواب به‌روز شد.`;
      }
      if (Object.keys(draft).length > 0) {
        const res = await api.post(`/clarifications/${item.id}/answer`, { answers: draft });
        last = res.data?.feedback || last;
      }
      setFeedback(last || 'چیزی برای ثبت نبود.');
      setDraft({});
      setEdits({});
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
      {answered.length > 0 ? (
        <button
          type="button"
          onClick={() => setShowAnswered((v) => !v)}
          className="mt-1 text-xs text-emerald-700 hover:underline"
        >
          ✅ {answered.length} پرسش قبلاً جواب گرفته — {showAnswered ? 'بستن' : 'دیدن و ویرایش'}
        </button>
      ) : null}

      {showAnswered ? (
        <div className="mt-2 space-y-2 rounded-lg bg-white/70 p-2">
          {answered.map((q) => (
            <div key={q.key}>
              <label className="mb-0.5 block text-xs text-gray-600">{q.label}</label>
              <Field
                field={q}
                value={edits[q.key] !== undefined ? edits[q.key] : q.answer || ''}
                onChange={(v) => setEdits((d) => ({ ...d, [q.key]: v }))}
              />
            </div>
          ))}
          <div className="text-[11px] text-gray-500">
            مقدار را عوض کنی، در سیستم هم به‌روز می‌شود. خالی بگذاری، دوباره پرسیده می‌شود.
          </div>
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

      {thread.length > 0 ? (
        <div className="mt-2 space-y-1 rounded-lg bg-white/70 p-2 text-xs">
          {thread.map((t, i) => (
            <div key={i} className={t.role === 'owner' ? 'text-gray-700' : 'text-blue-700'}>
              <span className="font-medium">{t.role === 'owner' ? 'تو: ' : 'من: '}</span>
              {t.text}
            </div>
          ))}
        </div>
      ) : null}

      {asking ? (
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
            value={question}
            placeholder="چه چیزی از این پرسش مبهم است؟"
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !question.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                const res = await api.post(`/clarifications/${item.id}/discuss`, { question });
                setThread(res.data?.discussion || []);
                setQuestion('');
              } catch {
                setFeedback('نتوانستم جواب بدهم — دوباره تلاش کن.');
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-lg bg-gray-700 px-3 py-1 text-xs text-white disabled:opacity-50"
          >
            بپرس
          </button>
        </div>
      ) : null}

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
          onClick={() => setAsking((v) => !v)}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-700"
        >
          ❓ سؤال دارم
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
    // پرسش‌ها همان لحظه‌ای ساخته می‌شوند که موتور به ابهام می‌خورد (اسکنِ
    // ایمیل، رسیدنِ پیامک) — نه با کلیکِ کاربر. پس میزِ فرمان باید خودش
    // تازه شود، وگرنه تا رفرشِ دستی، «منتظرِ پاسخ» عقب می‌ماند.
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
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
