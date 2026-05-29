import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// AIFeedbackWidget (audit task 97867b277c1b): like/dislike + 1-5 rating for the
// most recent AI response, POSTing to /api/ai/feedback (persisted server-side),
// plus a live read of /api/ai/metrics so the user sees the quality/latency SLOs.
function AIFeedbackWidget({ responseRef = null }) {
  const [sent, setSent] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(() => {
    api
      .get('/ai/metrics')
      .then((res) => setMetrics(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const send = (body, label) => {
    setError(null);
    api
      .post('/ai/feedback', { ...body, response_ref: responseRef })
      .then(() => {
        setSent(label);
        loadMetrics();
      })
      .catch((e) => setError('خطا در ثبت بازخورد: ' + (e.message || '')));
  };

  return (
    <section data-testid="ai-feedback-widget" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <h2 className="font-semibold text-gray-900 mb-2">بازخورد پاسخ هوش مصنوعی</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <div className="flex items-center gap-2 mb-3">
        <button
          data-testid="ai-like-btn"
          onClick={() => send({ liked: true }, 'like')}
          className="bg-green-100 text-green-700 rounded px-3 py-1 text-sm hover:bg-green-200"
        >
          👍 مفید بود
        </button>
        <button
          data-testid="ai-dislike-btn"
          onClick={() => send({ liked: false }, 'dislike')}
          className="bg-red-100 text-red-700 rounded px-3 py-1 text-sm hover:bg-red-200"
        >
          👎 مفید نبود
        </button>
      </div>

      <div className="flex items-center gap-1 mb-2" data-testid="ai-rating">
        <span className="text-sm text-gray-500 ml-2">امتیاز:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            data-testid={`ai-score-${n}`}
            onClick={() => send({ score: n }, `score-${n}`)}
            className="text-yellow-500 text-lg hover:scale-110"
            aria-label={`rate ${n}`}
          >
            ★
          </button>
        ))}
      </div>

      {sent && <p data-testid="ai-feedback-sent" className="text-xs text-gray-400">بازخورد ثبت شد ({sent}).</p>}

      {metrics && (
        <div data-testid="ai-metrics" className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
          میانگین کیفیت: {Number(metrics.ai_response_quality_score ?? 0).toFixed(2)} / 5 (هدف{' '}
          {metrics.ai_response_quality_target}) — لایک {metrics.feedback_likes} / دیسلایک{' '}
          {metrics.feedback_dislikes}
        </div>
      )}
    </section>
  );
}

export default AIFeedbackWidget;
