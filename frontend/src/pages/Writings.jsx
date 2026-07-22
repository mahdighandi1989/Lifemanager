import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import ActivityLogPanel from '../components/ActivityLogPanel';
import SahatChip from '../components/SahatChip';

// نوشته‌های من — long-form personal writings (spiritual autobiography, the
// worldly/hereafter goals document, future essays). Documents stay WHOLE here
// (list + reader), never scattered into items. Backed by /api/writings.
//
// خداشهر (2026-07-22): the page finally gained WRITE — the backend CRUD
// existed all along with no UI, while the owner's خداشناسی material keeps
// arriving over time («خیلی‌هاش رو هنوز وارد برنامه نکردم و خیلی‌هاش صوته»).
// Create + edit here; each writing carries its sahat chip (stored wins).

const EMPTY_FORM = { title: '', category: '', body: '', source_note: '', written_at: '' };

function WritingForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const editing = Boolean(initial?.id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setErr('عنوان و متن لازم است');
      return;
    }
    setBusy(true);
    setErr('');
    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || null,
      body: form.body,
      source_note: form.source_note.trim() || null,
      written_at: form.written_at || null,
    };
    try {
      if (editing) {
        await api.put(`/writings/${initial.id}`, payload);
      } else {
        await api.post('/writings', payload);
      }
      onSaved();
    } catch {
      setErr('ذخیره ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3" dir="rtl">
      <p className="text-sm font-semibold text-gray-800">
        {editing ? 'ویرایش نوشته' : 'نوشتهٔ جدید'}
      </p>
      <input
        value={form.title}
        onChange={set('title')}
        placeholder="عنوان"
        data-testid="writing-form-title"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={form.category}
          onChange={set('category')}
          placeholder="دسته (مثلاً: خداشناسی و شرح حال)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={form.written_at || ''}
          onChange={set('written_at')}
          title="تاریخِ خودِ نوشته (اختیاری)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        value={form.body}
        onChange={set('body')}
        placeholder="متن — کامل و یکجا؛ هیچ‌چیز خلاصه یا تکه‌تکه نمی‌شود"
        rows={10}
        data-testid="writing-form-body"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-7"
      />
      <input
        value={form.source_note}
        onChange={set('source_note')}
        placeholder="یادداشتِ منبع (اختیاری — مثلاً: پیاده‌شده از صوتِ فلان تاریخ)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          data-testid="writing-form-save"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'در حال ذخیره…' : 'ذخیره'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function Writings() {
  const [writings, setWritings] = useState([]);
  const [selected, setSelected] = useState(null); // full writing incl. body
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState(null); // null | {} (new) | writing (edit)

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/writings')
      .then((res) => setWritings(res.data?.writings || []))
      .catch((e) => setError('خطا در دریافت نوشته‌ها: ' + (e.message || '')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = async (id) => {
    setReading(true);
    setError(null);
    setFormState(null);
    try {
      const res = await api.get(`/writings/${id}`);
      setSelected(res.data);
    } catch (e) {
      setError('خطا در بازکردن نوشته: ' + (e.message || ''));
    } finally {
      setReading(false);
    }
  };

  const onSaved = () => {
    const wasEdit = Boolean(formState?.id);
    const editedId = formState?.id;
    setFormState(null);
    load();
    if (wasEdit && editedId) open(editedId);
  };

  const categories = [...new Set(writings.map((w) => w.category || 'بدون دسته'))];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8" data-testid="writings-page">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">نوشته‌های من</h1>
            <p className="text-sm text-gray-500">
              نوشته‌های بلند شخصی — شرح حال، برنامه‌ریزی‌ها و جستارها؛ هر سند یکجا و کامل.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setFormState({}); setSelected(null); }}
            data-testid="writing-new"
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + نوشتهٔ جدید
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* فهرست */}
          <div className="md:col-span-1 space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
                در حال بارگذاری…
              </div>
            ) : writings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
                هنوز نوشته‌ای ثبت نشده.
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <p className="text-xs font-semibold text-gray-400 mb-2">{cat}</p>
                  <ul className="space-y-1">
                    {writings.filter((w) => (w.category || 'بدون دسته') === cat).map((w) => (
                      <li key={w.id} className="flex items-start gap-1">
                        <button
                          onClick={() => open(w.id)}
                          data-testid={`writing-item-${w.id}`}
                          className={`flex-1 text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                            selected?.id === w.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {w.title}
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {w.written_at ? `تاریخ: ${w.written_at}` : ''}
                            {w.body_chars ? ` · ${Math.round(w.body_chars / 1000)} هزار حرف` : ''}
                          </span>
                        </button>
                        <span className="pt-2">
                          <SahatChip
                            entityType="writing"
                            entityId={w.id}
                            sahat={w.sahat}
                            source={w.sahat_source}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* خواننده / فرم */}
          <div className="md:col-span-2 space-y-4">
            {formState !== null && (
              <WritingForm
                initial={formState.id ? formState : null}
                onSaved={onSaved}
                onCancel={() => setFormState(null)}
              />
            )}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
              {reading ? (
                <p className="text-center text-gray-400 py-16">در حال بازکردن…</p>
              ) : selected ? (
                <article>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{selected.title}</h2>
                    <button
                      type="button"
                      onClick={() => setFormState({
                        id: selected.id,
                        title: selected.title || '',
                        category: selected.category || '',
                        body: selected.body || '',
                        source_note: selected.source_note || '',
                        written_at: selected.written_at || '',
                      })}
                      data-testid="writing-edit"
                      className="shrink-0 rounded-md bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      ویرایش
                    </button>
                  </div>
                  {selected.source_note && (
                    <p className="text-xs text-gray-400 mb-4 leading-5">{selected.source_note}</p>
                  )}
                  <div
                    data-testid="writing-body"
                    className="text-sm text-gray-800 leading-8 whitespace-pre-wrap break-words"
                  >
                    {selected.body}
                  </div>
                </article>
              ) : (
                <p className="text-center text-gray-400 py-16">
                  یک نوشته را از فهرست انتخاب کن تا کامل نمایش داده شود.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* لاگ بخش نوشته‌ها */}
        <ActivityLogPanel entityType="writing" title="لاگ نوشته‌ها" />
      </div>
    </div>
  );
}

export default Writings;
