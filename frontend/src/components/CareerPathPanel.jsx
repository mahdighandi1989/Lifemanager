import React, { useState } from 'react';
import api from '../lib/api';

// CareerPathPanel (audit task 14e65214, Step 8): requests POST /api/ai/career_paths
// and renders the personalized, non-clichéd paths. When the AI feature flag is
// off the backend 403s — surfaced here as a friendly message (AC45). Errors
// reaching external AI services degrade to the same message (AC46).
function CareerPathPanel() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focus, setFocus] = useState('');

  const generate = () => {
    setLoading(true);
    setError(null);
    api
      .post('/ai/career_paths', { focus: focus || undefined })
      .then((res) => setPaths(Array.isArray(res.data?.paths) ? res.data.paths : []))
      .catch((e) => {
        if (e?.response?.status === 403) {
          setError('قابلیت هوش مصنوعی غیرفعال است. برای استفاده آن را فعال کنید.');
        } else {
          setError('خطا در ترسیم مسیر شغلی: ' + (e.message || ''));
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div data-testid="career-path-panel" className="space-y-4">
      <div className="flex gap-2">
        <input
          data-testid="career-focus-input"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="زمینهٔ موردنظر (اختیاری)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <button
          data-testid="generate-career-paths-btn"
          onClick={generate}
          disabled={loading}
          className="bg-blue-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'در حال ترسیم…' : 'ترسیم آینده'}
        </button>
      </div>

      {error && <p data-testid="career-error" className="text-red-600 text-sm">{error}</p>}

      {paths.length === 0 ? (
        <p data-testid="career-empty" className="text-gray-400 text-sm">
          هنوز مسیری ترسیم نشده است.
        </p>
      ) : (
        paths.map((p, idx) => (
          <div
            key={idx}
            data-testid={`career-path-${idx}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              {typeof p.fit_score === 'number' && (
                <span className="text-xs text-indigo-600 shrink-0">
                  تطابق {Math.round(p.fit_score * 100)}٪
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1">{p.rationale}</p>
            {Array.isArray(p.first_steps) && p.first_steps.length > 0 && (
              <ul className="list-disc pr-5 mt-2 text-sm text-gray-600 space-y-1">
                {p.first_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            {p.success_potential && (
              <p className="text-xs text-gray-400 mt-2">{p.success_potential}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CareerPathPanel;
