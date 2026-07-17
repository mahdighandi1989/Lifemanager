import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import ActivityLogPanel from '../components/ActivityLogPanel';

// نوشته‌های من — long-form personal writings (spiritual autobiography, the
// worldly/hereafter goals document, future essays). Documents stay WHOLE here
// (list + reader), never scattered into items. Backed by /api/writings.

function Writings() {
  const [writings, setWritings] = useState([]);
  const [selected, setSelected] = useState(null); // full writing incl. body
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState(null);

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
    try {
      const res = await api.get(`/writings/${id}`);
      setSelected(res.data);
    } catch (e) {
      setError('خطا در بازکردن نوشته: ' + (e.message || ''));
    } finally {
      setReading(false);
    }
  };

  const categories = [...new Set(writings.map((w) => w.category || 'بدون دسته'))];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8" data-testid="writings-page">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">نوشته‌های من</h1>
        <p className="text-sm text-gray-500 mb-6">
          نوشته‌های بلند شخصی — شرح حال، برنامه‌ریزی‌ها و جستارها؛ هر سند یکجا و کامل.
        </p>

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
                      <li key={w.id}>
                        <button
                          onClick={() => open(w.id)}
                          data-testid={`writing-item-${w.id}`}
                          className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
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
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* خواننده */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
              {reading ? (
                <p className="text-center text-gray-400 py-16">در حال بازکردن…</p>
              ) : selected ? (
                <article>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.title}</h2>
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
