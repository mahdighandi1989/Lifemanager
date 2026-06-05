import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// RecommendationPanel
//  - audit task 2165524b AC 5: context-aware recommendations from
//    GET /api/recommendations, each with accept/reject.
//  - audit task 14e65214 (Steps 3/5): personalized recommendations from
//    GET /api/ai/personalized_recommendations, derived from the user's
//    interests + analyzed personality/mood. Rendered as their own section
//    with data-testid='personalized-recommendation-item'.
//
// ``enabledTypes`` (audit task 2165524b AC 10): optional map of
// recommendation_type -> bool. When provided, context recs whose type is
// disabled are hidden, so the page's priority toggles actually take effect.
// Omitted (default) → every recommendation shows.
function RecommendationPanel({ enabledTypes = null } = {}) {
  const [recs, setRecs] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .get('/recommendations')
      .then((res) => setRecs(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError('خطا در دریافت پیشنهادات: ' + (e.message || '')));
    api
      .get('/ai/personalized_recommendations')
      .then((res) => setPersonalized(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        // Personalized layer is best-effort; the context recs still render.
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Apply the page's priority toggles. Keep the original index alongside each
  // rec so accept/reject still dismisses the correct row from ``recs``.
  const visibleRecs = recs
    .map((rec, idx) => ({ rec, idx }))
    .filter(({ rec }) =>
      !enabledTypes || enabledTypes[rec.recommendation_type] !== false,
    );

  const dismiss = (idx) => {
    // Persist accept/reject server-side when the rec has a real id (audit task
    // 2165524b AC5) — no longer client-only. Best-effort; the card dismisses
    // regardless so the UI stays responsive.
    const rec = recs[idx];
    if (rec && rec.id != null) {
      api.patch(`/recommendations/${rec.id}/read`).catch(() => {});
    }
    setRecs((r) => r.filter((_, i) => i !== idx));
  };

  return (
    <div data-testid="recommendation-panel" className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Personalized (interest / personality / mood aware) */}
      {personalized.length > 0 && (
        <section data-testid="personalized-recommendations" className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">پیشنهادهای شخصی‌سازی‌شده</h3>
          {personalized.map((rec, idx) => (
            <div
              key={`p-${rec.id ?? idx}`}
              data-testid="personalized-recommendation-item"
              className="bg-indigo-50 rounded-xl border border-indigo-100 p-4"
            >
              <span className="text-xs text-indigo-600">{rec.type || rec.recommendation_type}</span>
              <p className="text-sm text-gray-800">{rec.content || rec.text || ''}</p>
              {typeof rec.score === 'number' && (
                <span className="text-[11px] text-gray-400">امتیاز تطابق: {rec.score}</span>
              )}
            </div>
          ))}
        </section>
      )}

      <div className="space-y-2">
        {visibleRecs.length === 0 ? (
          <p data-testid="rec-empty" className="text-gray-400 text-sm">
            فعلاً پیشنهادی نیست.
          </p>
        ) : (
          visibleRecs.map(({ rec, idx }) => (
            <div
              key={idx}
              data-testid={`rec-item-${idx}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center gap-3"
            >
              <div>
                <span className="text-xs text-blue-600">{rec.recommendation_type}</span>
                <p className="text-sm text-gray-800">{rec.text}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  data-testid={`rec-accept-${idx}`}
                  onClick={() => dismiss(idx)}
                  className="bg-green-600 text-white text-xs rounded px-3 py-1 hover:bg-green-700"
                >
                  قبول
                </button>
                <button
                  data-testid={`rec-reject-${idx}`}
                  onClick={() => dismiss(idx)}
                  className="bg-gray-200 text-gray-700 text-xs rounded px-3 py-1 hover:bg-gray-300"
                >
                  رد
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecommendationPanel;
